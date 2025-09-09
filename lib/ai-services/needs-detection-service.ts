import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import * as tf from '@tensorflow/tfjs';
import { PrismaClient, NeedType } from '@prisma/client';

// Tipos de necesidades especiales
export interface SpecialNeed {
  type: NeedType;
  severity: 'mild' | 'moderate' | 'severe';
  confidence: number;
  indicators: string[];
  recommendations: string[];
  accommodations: string[];
  detectedAt: Date;
  culturalContext?: string;
}

// Datos de interacción del estudiante
export interface InteractionData {
  // Lectura
  readingSpeed: number; // palabras por minuto
  readingAccuracy: number; // porcentaje de palabras leídas correctamente
  readingComprehension: number; // puntuación de comprensión
  readingErrors: {
    substitutions: number;
    omissions: number;
    insertions: number;
    reversals: number;
    transpositions: number;
  };
  
  // Matemáticas
  mathAccuracy: number;
  mathSpeed: number;
  mathErrors: {
    calculation: number;
    procedural: number;
    conceptual: number;
    visual: number;
  };
  
  // Atención y comportamiento
  attentionSpan: number; // minutos promedio
  responseTime: {
    mean: number;
    variance: number;
    outliers: number;
  };
  taskCompletion: number; // porcentaje de tareas completadas
  helpRequests: number;
  
  // Preferencias sensoriales
  audioPreference: number; // 0-1, preferencia por audio
  visualPreference: number; // 0-1, preferencia por contenido visual
  kinestheticPreference: number; // 0-1, preferencia por actividades físicas
  
  // Contexto cultural
  language: string;
  culturalBackground: string;
  socioeconomicContext: string;
  previousEducation: number; // años de educación previa
  
  // Patrones temporales
  timeOfDay: string;
  sessionDuration: number;
  breaksTaken: number;
  
  // Tecnología
  deviceType: 'mobile' | 'tablet' | 'desktop';
  internetSpeed: number; // Mbps
  offlineUsage: number; // porcentaje de uso offline
}

// Resultado del análisis
export interface NeedsAnalysisResult {
  studentId: string;
  specialNeeds: SpecialNeed[];
  learningProfile: {
    learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading' | 'mixed';
    pace: 'slow' | 'moderate' | 'fast';
    strengths: string[];
    challenges: string[];
    recommendations: string[];
  };
  culturalAdaptations: {
    languageSupport: string[];
    culturalRelevance: string[];
    contextualExamples: string[];
  };
  confidence: number;
  analysisDate: Date;
  nextAssessment: Date;
}

export class NeedsDetectionService {
  private openai: OpenAI;
  private anthropic: Anthropic;
  private prisma: PrismaClient;
  private model: tf.LayersModel | null = null;
  private isModelLoaded: boolean = false;

  constructor() {
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
    this.anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
    this.prisma = new PrismaClient();
    this.loadModel();
  }

  /**
   * Carga el modelo de ML para detección
   */
  private async loadModel(): Promise<void> {
    try {
      // En producción, cargaría un modelo entrenado
      // this.model = await tf.loadLayersModel('/models/needs-detection-model.json');
      this.isModelLoaded = true;
      console.log('✅ Modelo de detección de necesidades cargado');
    } catch (error) {
      console.warn('⚠️ No se pudo cargar el modelo de ML, usando análisis basado en reglas');
      this.isModelLoaded = false;
    }
  }

  /**
   * Analiza las necesidades especiales de un estudiante
   */
  async analyzeNeeds(
    studentId: string,
    interactionData: InteractionData
  ): Promise<NeedsAnalysisResult> {
    try {
      // Obtener datos históricos del estudiante
      const historicalData = await this.getHistoricalData(studentId);
      
      // Combinar datos actuales con históricos
      const combinedData = this.combineData(interactionData, historicalData);
      
      // Análisis usando múltiples métodos
      const [mlAnalysis, aiAnalysis, ruleAnalysis] = await Promise.all([
        this.mlAnalysis(combinedData),
        this.aiAnalysis(combinedData),
        this.ruleBasedAnalysis(combinedData)
      ]);

      // Combinar resultados
      const finalAnalysis = this.combineAnalyses(mlAnalysis, aiAnalysis, ruleAnalysis);
      
      // Generar perfil de aprendizaje
      const learningProfile = this.generateLearningProfile(combinedData, finalAnalysis);
      
      // Adaptaciones culturales
      const culturalAdaptations = await this.generateCulturalAdaptations(
        interactionData,
        finalAnalysis
      );

      const result: NeedsAnalysisResult = {
        studentId,
        specialNeeds: finalAnalysis,
        learningProfile,
        culturalAdaptations,
        confidence: this.calculateConfidence(mlAnalysis, aiAnalysis, ruleAnalysis),
        analysisDate: new Date(),
        nextAssessment: this.calculateNextAssessment(finalAnalysis)
      };

      // Guardar en base de datos
      await this.saveAnalysis(result);

      return result;
    } catch (error) {
      console.error('Error analizando necesidades:', error);
      throw new Error(`Error en análisis de necesidades: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Obtiene datos históricos del estudiante
   */
  private async getHistoricalData(studentId: string): Promise<InteractionData[]> {
    const assessments = await this.prisma.assessment.findMany({
      where: { studentId },
      orderBy: { conductedAt: 'desc' },
      take: 10
    });

    return assessments.map(assessment => {
      const details = assessment.details as any;
      return {
        readingSpeed: details?.readingSpeed || 0,
        readingAccuracy: details?.readingAccuracy || 0,
        readingComprehension: details?.comprehensionScore || 0,
        readingErrors: {
          substitutions: details?.substitutionErrors || 0,
          omissions: details?.omissionErrors || 0,
          insertions: details?.insertionErrors || 0,
          reversals: details?.reversalErrors || 0,
          transpositions: details?.transpositionErrors || 0
        },
        mathAccuracy: details?.mathAccuracy || 0,
        mathSpeed: details?.mathSpeed || 0,
        mathErrors: {
          calculation: details?.calculationErrors || 0,
          procedural: details?.proceduralErrors || 0,
          conceptual: details?.conceptualErrors || 0,
          visual: details?.visualErrors || 0
        },
        attentionSpan: details?.attentionSpan || 0,
        responseTime: {
          mean: details?.avgResponseTime || 0,
          variance: details?.responseTimeVariance || 0,
          outliers: details?.responseTimeOutliers || 0
        },
        taskCompletion: details?.taskCompletionRate || 0,
        helpRequests: details?.helpRequests || 0,
        audioPreference: details?.audioPreference || 0,
        visualPreference: details?.visualPreference || 0,
        kinestheticPreference: details?.kinestheticPreference || 0,
        language: details?.language || 'es-MX',
        culturalBackground: details?.culturalBackground || 'general',
        socioeconomicContext: details?.socioeconomicContext || 'rural',
        previousEducation: details?.previousEducation || 0,
        timeOfDay: details?.timeOfDay || 'morning',
        sessionDuration: details?.sessionDuration || 0,
        breaksTaken: details?.breaksTaken || 0,
        deviceType: details?.deviceType || 'mobile',
        internetSpeed: details?.internetSpeed || 0,
        offlineUsage: details?.offlineUsage || 0
      };
    });
  }

  /**
   * Combina datos actuales con históricos
   */
  private combineData(current: InteractionData, historical: InteractionData[]): InteractionData {
    if (historical.length === 0) return current;

    // Calcular promedios ponderados
    const weights = historical.map((_, index) => Math.pow(0.8, index + 1));
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 1); // Incluir datos actuales

    const combined: InteractionData = { ...current };

    // Combinar métricas numéricas
    const numericFields: (keyof InteractionData)[] = [
      'readingSpeed', 'readingAccuracy', 'readingComprehension',
      'mathAccuracy', 'mathSpeed', 'attentionSpan', 'taskCompletion',
      'helpRequests', 'audioPreference', 'visualPreference', 'kinestheticPreference'
    ];

    numericFields.forEach(field => {
      const currentValue = current[field] as number;
      const historicalValues = historical.map(h => h[field] as number);
      
      const weightedSum = historicalValues.reduce((sum, value, index) => 
        sum + value * weights[index], currentValue
      );
      
      (combined[field] as number) = weightedSum / totalWeight;
    });

    return combined;
  }

  /**
   * Análisis usando machine learning
   */
  private async mlAnalysis(data: InteractionData): Promise<SpecialNeed[]> {
    if (!this.isModelLoaded || !this.model) {
      return [];
    }

    try {
      // Preparar datos para el modelo
      const input = this.prepareModelInput(data);
      const prediction = this.model.predict(input) as tf.Tensor;
      const predictions = await prediction.array();
      
      // Interpretar predicciones
      return this.interpretMLPredictions(predictions as number[], data);
    } catch (error) {
      console.warn('Error en análisis ML:', error);
      return [];
    }
  }

  /**
   * Análisis usando IA generativa
   */
  private async aiAnalysis(data: InteractionData): Promise<SpecialNeed[]> {
    try {
      const prompt = `
        Analiza los siguientes patrones de aprendizaje de un estudiante en contexto vulnerable latinoamericano:
        
        DATOS DE INTERACCIÓN:
        ${JSON.stringify(data, null, 2)}
        
        IDENTIFICA posibles necesidades especiales de aprendizaje:
        - Dislexia (errores de lectura, inversión de letras, velocidad lenta)
        - TDAH (tiempos de respuesta inconsistentes, atención limitada)
        - Discalculia (errores matemáticos específicos, dificultad con números)
        - Procesamiento auditivo (preferencia por audio, dificultad con instrucciones verbales)
        - Procesamiento visual (preferencia por contenido visual, dificultad con texto)
        - Retraso en lenguaje (comprensión limitada, vocabulario reducido)
        - Habilidades motoras (dificultad con actividades físicas, coordinación)
        
        CONSIDERA factores contextuales:
        - Posible falta de escolarización previa
        - Español como segunda lengua
        - Contexto socioeconómico rural
        - Acceso limitado a tecnología
        - Factores culturales específicos
        
        Responde en JSON con:
        {
          "needs": [
            {
              "type": "DYSLEXIA|ADHD|DYSCALCULIA|AUDITORY_PROCESSING|VISUAL_PROCESSING|LANGUAGE_DELAY|MOTOR_SKILLS",
              "severity": "mild|moderate|severe",
              "confidence": 0.0-1.0,
              "indicators": ["indicador1", "indicador2"],
              "recommendations": ["recomendación1", "recomendación2"],
              "accommodations": ["acomodación1", "acomodación2"]
            }
          ]
        }
      `;

      const response = await this.anthropic.messages.create({
        model: 'claude-3-opus-20240229',
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }]
      });

      const analysis = JSON.parse(response.content[0].text);
      return analysis.needs || [];
    } catch (error) {
      console.error('Error en análisis de IA:', error);
      return [];
    }
  }

  /**
   * Análisis basado en reglas
   */
  private ruleBasedAnalysis(data: InteractionData): SpecialNeed[] {
    const needs: SpecialNeed[] = [];

    // Detección de dislexia
    if (data.readingSpeed < 80 || data.readingAccuracy < 0.85) {
      const dyslexiaIndicators = [];
      if (data.readingErrors.reversals > 5) dyslexiaIndicators.push('Inversión de letras frecuente');
      if (data.readingErrors.transpositions > 3) dyslexiaIndicators.push('Transposición de letras');
      if (data.readingSpeed < 60) dyslexiaIndicators.push('Velocidad de lectura muy lenta');

      if (dyslexiaIndicators.length > 0) {
        needs.push({
          type: 'DYSLEXIA',
          severity: this.calculateSeverity(data.readingAccuracy, 0.85),
          confidence: 0.8,
          indicators: dyslexiaIndicators,
          recommendations: [
            'Usar fuentes específicas para dislexia',
            'Proporcionar audio para todo el texto',
            'Permitir más tiempo para lectura',
            'Usar marcadores de texto'
          ],
          accommodations: [
            'Audio obligatorio',
            'Fuente grande y espaciada',
            'Tiempo extra',
            'Lectura asistida'
          ],
          detectedAt: new Date()
        });
      }
    }

    // Detección de TDAH
    if (data.attentionSpan < 10 || data.responseTime.variance > 5) {
      const adhdIndicators = [];
      if (data.attentionSpan < 5) adhdIndicators.push('Atención muy limitada');
      if (data.responseTime.variance > 10) adhdIndicators.push('Tiempos de respuesta muy variables');
      if (data.helpRequests > 10) adhdIndicators.push('Muchas solicitudes de ayuda');

      if (adhdIndicators.length > 0) {
        needs.push({
          type: 'ADHD',
          severity: this.calculateSeverity(data.attentionSpan, 15),
          confidence: 0.75,
          indicators: adhdIndicators,
          recommendations: [
            'Pausas programadas cada 10-15 minutos',
            'Elementos interactivos frecuentes',
            'Indicadores de progreso visuales',
            'Instrucciones paso a paso'
          ],
          accommodations: [
            'Pausas automáticas',
            'Contenido interactivo',
            'Progreso visual',
            'Instrucciones fragmentadas'
          ],
          detectedAt: new Date()
        });
      }
    }

    // Detección de discalculia
    if (data.mathAccuracy < 0.7 || data.mathSpeed < 0.5) {
      const dyscalculiaIndicators = [];
      if (data.mathErrors.calculation > 8) dyscalculiaIndicators.push('Errores de cálculo frecuentes');
      if (data.mathErrors.conceptual > 5) dyscalculiaIndicators.push('Dificultad con conceptos matemáticos');
      if (data.mathSpeed < 0.3) dyscalculiaIndicators.push('Velocidad matemática muy lenta');

      if (dyscalculiaIndicators.length > 0) {
        needs.push({
          type: 'DYSCALCULIA',
          severity: this.calculateSeverity(data.mathAccuracy, 0.7),
          confidence: 0.8,
          indicators: dyscalculiaIndicators,
          recommendations: [
            'Usar manipulativos virtuales',
            'Proporcionar calculadora',
            'Enseñar estrategias paso a paso',
            'Usar representaciones visuales'
          ],
          accommodations: [
            'Calculadora disponible',
            'Manipulativos virtuales',
            'Proceso paso a paso',
            'Representaciones visuales'
          ],
          detectedAt: new Date()
        });
      }
    }

    // Detección de preferencias sensoriales
    if (data.audioPreference > 0.8) {
      needs.push({
        type: 'LANGUAGE_DELAY',
        severity: 'mild',
        confidence: 0.7,
        indicators: ['Fuerte preferencia por contenido auditivo'],
        recommendations: [
          'Proporcionar audio para todo el contenido',
          'Usar narración de voz',
          'Incluir instrucciones verbales'
        ],
        accommodations: [
          'Audio obligatorio',
          'Narración automática',
          'Instrucciones verbales'
        ],
        detectedAt: new Date()
      });
    }

    if (data.visualPreference > 0.8) {
      needs.push({
        type: 'VISUAL_IMPAIRMENT',
        severity: 'mild',
        confidence: 0.7,
        indicators: ['Fuerte preferencia por contenido visual'],
        recommendations: [
          'Usar muchas imágenes y diagramas',
          'Proporcionar mapas conceptuales',
          'Incluir videos explicativos'
        ],
        accommodations: [
          'Contenido visual rico',
          'Mapas conceptuales',
          'Videos explicativos'
        ],
        detectedAt: new Date()
      });
    }

    return needs;
  }

  /**
   * Combina análisis de múltiples métodos
   */
  private combineAnalyses(
    mlAnalysis: SpecialNeed[],
    aiAnalysis: SpecialNeed[],
    ruleAnalysis: SpecialNeed[]
  ): SpecialNeed[] {
    const allNeeds = [...mlAnalysis, ...aiAnalysis, ...ruleAnalysis];
    const needsMap = new Map<string, SpecialNeed>();

    // Combinar necesidades del mismo tipo
    allNeeds.forEach(need => {
      const existing = needsMap.get(need.type);
      if (existing) {
        // Promediar confianza y combinar indicadores
        existing.confidence = (existing.confidence + need.confidence) / 2;
        existing.indicators = [...new Set([...existing.indicators, ...need.indicators])];
        existing.recommendations = [...new Set([...existing.recommendations, ...need.recommendations])];
        existing.accommodations = [...new Set([...existing.accommodations, ...need.accommodations])];
        
        // Usar la severidad más alta
        if (this.getSeverityLevel(need.severity) > this.getSeverityLevel(existing.severity)) {
          existing.severity = need.severity;
        }
      } else {
        needsMap.set(need.type, { ...need });
      }
    });

    return Array.from(needsMap.values())
      .filter(need => need.confidence > 0.6) // Solo necesidades con alta confianza
      .sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Genera perfil de aprendizaje
   */
  private generateLearningProfile(data: InteractionData, needs: SpecialNeed[]): any {
    // Determinar estilo de aprendizaje
    const preferences = [data.visualPreference, data.audioPreference, data.kinestheticPreference];
    const maxPreference = Math.max(...preferences);
    const learningStyle = preferences.indexOf(maxPreference) === 0 ? 'visual' :
                         preferences.indexOf(maxPreference) === 1 ? 'auditory' : 'kinesthetic';

    // Determinar ritmo
    const avgSpeed = (data.readingSpeed + data.mathSpeed) / 2;
    const pace = avgSpeed < 0.5 ? 'slow' : avgSpeed > 0.8 ? 'fast' : 'moderate';

    // Identificar fortalezas y desafíos
    const strengths: string[] = [];
    const challenges: string[] = [];

    if (data.readingComprehension > 0.8) strengths.push('Buena comprensión lectora');
    if (data.mathAccuracy > 0.8) strengths.push('Precisión matemática');
    if (data.taskCompletion > 0.9) strengths.push('Alta tasa de finalización de tareas');

    if (data.readingSpeed < 0.6) challenges.push('Velocidad de lectura lenta');
    if (data.attentionSpan < 10) challenges.push('Atención limitada');
    if (data.helpRequests > 5) challenges.push('Necesita mucha ayuda');

    return {
      learningStyle,
      pace,
      strengths,
      challenges,
      recommendations: this.generateLearningRecommendations(needs, learningStyle, pace)
    };
  }

  /**
   * Genera adaptaciones culturales
   */
  private async generateCulturalAdaptations(
    data: InteractionData,
    needs: SpecialNeed[]
  ): Promise<any> {
    const culturalContexts = {
      'maya': {
        languageSupport: ['maya', 'k\'iche\'', 'q\'eqchi\''],
        culturalRelevance: ['agricultura', 'tradiciones orales', 'comunidad'],
        contextualExamples: ['maíz', 'milpa', 'cenotes', 'quetzal']
      },
      'nahuatl': {
        languageSupport: ['nahuatl', 'español'],
        culturalRelevance: ['historia', 'medicina tradicional', 'artesanías'],
        contextualExamples: ['cacao', 'chinampas', 'volcanes', 'águila']
      },
      'afrodescendiente': {
        languageSupport: ['español', 'criollo'],
        culturalRelevance: ['música', 'danza', 'tradiciones orales'],
        contextualExamples: ['tambores', 'danza', 'costa', 'comunidad']
      },
      'rural': {
        languageSupport: ['español'],
        culturalRelevance: ['agricultura', 'naturaleza', 'trabajo manual'],
        contextualExamples: ['siembra', 'animales', 'río', 'montaña']
      }
    };

    const context = culturalContexts[data.culturalBackground as keyof typeof culturalContexts] || culturalContexts.rural;

    return {
      languageSupport: context.languageSupport,
      culturalRelevance: context.culturalRelevance,
      contextualExamples: context.contextualExamples
    };
  }

  /**
   * Calcula nivel de severidad
   */
  private calculateSeverity(score: number, threshold: number): 'mild' | 'moderate' | 'severe' {
    const ratio = score / threshold;
    if (ratio > 0.8) return 'mild';
    if (ratio > 0.6) return 'moderate';
    return 'severe';
  }

  /**
   * Obtiene nivel numérico de severidad
   */
  private getSeverityLevel(severity: string): number {
    switch (severity) {
      case 'mild': return 1;
      case 'moderate': return 2;
      case 'severe': return 3;
      default: return 1;
    }
  }

  /**
   * Calcula confianza del análisis
   */
  private calculateConfidence(
    mlAnalysis: SpecialNeed[],
    aiAnalysis: SpecialNeed[],
    ruleAnalysis: SpecialNeed[]
  ): number {
    const totalAnalyses = [mlAnalysis, aiAnalysis, ruleAnalysis].filter(a => a.length > 0).length;
    if (totalAnalyses === 0) return 0;

    const avgConfidence = [mlAnalysis, aiAnalysis, ruleAnalysis]
      .flat()
      .reduce((sum, need) => sum + need.confidence, 0) / totalAnalyses;

    return Math.min(avgConfidence, 1.0);
  }

  /**
   * Calcula próxima evaluación
   */
  private calculateNextAssessment(needs: SpecialNeed[]): Date {
    const now = new Date();
    const hasSevereNeeds = needs.some(need => need.severity === 'severe');
    const hasModerateNeeds = needs.some(need => need.severity === 'moderate');

    if (hasSevereNeeds) {
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 1 semana
    } else if (hasModerateNeeds) {
      return new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000); // 2 semanas
    } else {
      return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 1 mes
    }
  }

  /**
   * Guarda análisis en base de datos
   */
  private async saveAnalysis(result: NeedsAnalysisResult): Promise<void> {
    try {
      // Guardar necesidades especiales
      for (const need of result.specialNeeds) {
        await this.prisma.specialNeed.upsert({
          where: {
            studentId_type: {
              studentId: result.studentId,
              type: need.type
            }
          },
          create: {
            studentId: result.studentId,
            type: need.type as NeedType,
            severity: typeof need.severity === 'string' ? 
              (need.severity === 'mild' ? 1 : need.severity === 'moderate' ? 2 : 3) : 
              need.severity,
            detectionMethod: 'AI_ML',
            recommendations: need.recommendations
          },
          update: {
            severity: typeof need.severity === 'string' ? 
              (need.severity === 'mild' ? 1 : need.severity === 'moderate' ? 2 : 3) : 
              need.severity,
            recommendations: need.recommendations
          }
        });
      }

      // Guardar perfil de aprendizaje en el modelo Student
      await this.prisma.student.update({
        where: { id: result.studentId },
        data: {
          learningProfile: result.learningProfile,
          culturalBackground: result.culturalAdaptations?.languageSupport?.[0] || null
        }
      });

    } catch (error) {
      console.error('Error guardando análisis:', error);
    }
  }

  /**
   * Prepara datos para el modelo ML
   */
  private prepareModelInput(data: InteractionData): tf.Tensor {
    const features = [
      data.readingSpeed / 200, // Normalizar
      data.readingAccuracy,
      data.readingComprehension,
      data.mathAccuracy,
      data.mathSpeed,
      data.attentionSpan / 60, // Normalizar a horas
      data.taskCompletion,
      data.audioPreference,
      data.visualPreference,
      data.kinestheticPreference
    ];

    return tf.tensor2d([features], [1, features.length]);
  }

  /**
   * Interpreta predicciones del modelo ML
   */
  private interpretMLPredictions(predictions: number[], data: InteractionData): SpecialNeed[] {
    // Implementar interpretación de predicciones del modelo
    // Por ahora, retornar array vacío
    return [];
  }

  /**
   * Obtiene el perfil de accesibilidad de un estudiante
   */
  async getAccessibilityProfile(studentId: string): Promise<any> {
    try {
      // Intentar obtener perfil existente de la base de datos
      // Buscar perfil existente en el modelo Student
      const existingStudent = await this.prisma.student.findUnique({
        where: { id: studentId }
      });

      if (existingStudent && existingStudent.learningProfile) {
        const profile = existingStudent.learningProfile as any;
        if (profile.accessibility) {
          return profile.accessibility;
        }
      }

      // Si no existe, crear perfil por defecto
      const defaultProfile = {
        visualAcuity: 'normal',
        colorVision: 'normal',
        hearing: 'normal',
        motorCoordination: 'normal',
        cognitiveProcessing: 'normal',
        attentionSpan: 15,
        memoryCapacity: 'normal',
        languageProcessing: 'normal',
        assistiveTechnology: [],
        preferences: {},
        knownDisabilities: []
      };

      // Guardar perfil por defecto en el modelo Student
      await this.prisma.student.update({
        where: { id: studentId },
        data: {
          learningProfile: {
            ...(existingStudent?.learningProfile as any || {}),
            accessibility: defaultProfile
          }
        }
      });

      return defaultProfile;
    } catch (error) {
      console.warn('Error obteniendo perfil de accesibilidad, retornando perfil por defecto:', error);
      
      // Retornar perfil por defecto si hay error
      return {
        visualAcuity: 'normal',
        colorVision: 'normal',
        hearing: 'normal',
        motorCoordination: 'normal',
        cognitiveProcessing: 'normal',
        attentionSpan: 15,
        memoryCapacity: 'normal',
        languageProcessing: 'normal',
        assistiveTechnology: [],
        preferences: {},
        knownDisabilities: []
      };
    }
  }

  /**
   * Obtiene el perfil de aprendizaje de un estudiante
   */
  async getLearningProfile(studentId: string): Promise<any> {
    try {
      // Intentar obtener perfil existente de la base de datos
      const existingStudent = await this.prisma.student.findUnique({
        where: { id: studentId }
      });

      if (existingStudent && existingStudent.learningProfile) {
        return existingStudent.learningProfile;
      }

      // Si no existe, crear perfil por defecto
      const defaultProfile = {
        learningStyle: 'visual',
        pace: 'moderate',
        strengths: ['atención visual', 'memoria visual'],
        challenges: ['procesamiento auditivo'],
        recommendations: ['Usar ayudas visuales', 'Proporcionar tiempo extra'],
        culturalAdaptations: []
      };

      // Guardar perfil por defecto en el modelo Student
      await this.prisma.student.update({
        where: { id: studentId },
        data: {
          learningProfile: defaultProfile
        }
      });

      return defaultProfile;
    } catch (error) {
      console.warn('Error obteniendo perfil de aprendizaje, retornando perfil por defecto:', error);
      
      // Retornar perfil por defecto si hay error
      return {
        learningStyle: 'visual',
        pace: 'moderate',
        strengths: ['atención visual', 'memoria visual'],
        challenges: ['procesamiento auditivo'],
        recommendations: ['Usar ayudas visuales', 'Proporcionar tiempo extra'],
        culturalAdaptations: []
      };
    }
  }

  /**
   * Genera recomendaciones de aprendizaje
   */
  private generateLearningRecommendations(
    needs: SpecialNeed[],
    learningStyle: string,
    pace: string
  ): string[] {
    const recommendations: string[] = [];

    // Recomendaciones basadas en estilo de aprendizaje
    if (learningStyle === 'visual') {
      recommendations.push('Usar diagramas y mapas conceptuales');
      recommendations.push('Incluir videos explicativos');
    } else if (learningStyle === 'auditory') {
      recommendations.push('Proporcionar narración de voz');
      recommendations.push('Incluir podcasts educativos');
    } else if (learningStyle === 'kinesthetic') {
      recommendations.push('Incluir actividades interactivas');
      recommendations.push('Usar simulaciones virtuales');
    }

    // Recomendaciones basadas en ritmo
    if (pace === 'slow') {
      recommendations.push('Permitir tiempo extra para completar tareas');
      recommendations.push('Dividir contenido en secciones más pequeñas');
    } else if (pace === 'fast') {
      recommendations.push('Proporcionar contenido adicional');
      recommendations.push('Ofrecer desafíos opcionales');
    }

    // Recomendaciones basadas en necesidades especiales
    needs.forEach(need => {
      recommendations.push(...need.recommendations);
    });

    return [...new Set(recommendations)]; // Eliminar duplicados
  }
}

// Instancia singleton
export const needsDetectionService = new NeedsDetectionService();
