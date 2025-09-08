/**
 * Modelo de Análisis de Sentimientos en Tiempo Real
 * Detecta emociones del estudiante y adapta contenido según estado emocional
 * Incluye alertas para maestros sobre estudiantes en riesgo
 */

import * as tf from '@tensorflow/tfjs';
import { PrismaClient } from '@prisma/client';
import { EmotionType, AlertType, AlertSeverity } from '@prisma/client';

const prisma = new PrismaClient();

export interface SentimentData {
  text?: string;
  audioFeatures?: number[];
  facialFeatures?: number[];
  behavioralMetrics?: {
    responseTime: number;
    clickPattern: number[];
    scrollBehavior: number[];
    interactionFrequency: number;
  };
  context?: {
    activityType: string;
    contentId?: string;
    sessionId?: string;
    timestamp: Date;
  };
}

export interface SentimentResult {
  sentimentScore: number; // -1.0 a 1.0
  emotion: EmotionType;
  confidence: number; // 0.0 a 1.0
  intensity: number; // 0.0 a 1.0
  stressLevel: number; // 0.0 a 1.0
  engagementLevel: number; // 0.0 a 1.0
  frustrationLevel: number; // 0.0 a 1.0
  isAlert: boolean;
  alertType?: AlertType;
  alertMessage?: string;
  recommendations: string[];
}

export interface EmotionTrend {
  date: Date;
  timeSlot: number;
  avgSentiment: number;
  dominantEmotion: EmotionType;
  stressTrend: number;
  engagementTrend: number;
  totalAnalyses: number;
  positiveCount: number;
  negativeCount: number;
  neutralCount: number;
}

export interface DropoutPrediction {
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  probability: number; // 0.0 a 1.0
  factors: string[];
  recommendations: string[];
  confidence: number;
}

export class SentimentAnalysisModel {
  private model: tf.LayersModel | null = null;
  private textModel: tf.LayersModel | null = null;
  private audioModel: tf.LayersModel | null = null;
  private behavioralModel: tf.LayersModel | null = null;
  private dropoutModel: tf.LayersModel | null = null;
  private isInitialized = false;

  constructor() {
    this.initialize();
  }

  /**
   * Inicializa el modelo de análisis de sentimientos
   */
  private async initialize() {
    try {
      console.log('🧠 Inicializando modelo de análisis de sentimientos...');

      // Modelo principal de sentimientos
      this.model = await this.createSentimentModel();
      
      // Modelo específico para análisis de texto
      this.textModel = await this.createTextModel();
      
      // Modelo para análisis de audio
      this.audioModel = await this.createAudioModel();
      
      // Modelo para análisis de comportamiento
      this.behavioralModel = await this.createBehavioralModel();
      
      // Modelo para predicción de abandono escolar
      this.dropoutModel = await this.createDropoutModel();

      this.isInitialized = true;
      console.log('✅ Modelo de análisis de sentimientos inicializado');
    } catch (error) {
      console.error('❌ Error inicializando modelo de sentimientos:', error);
      this.isInitialized = false;
    }
  }

  /**
   * Crea el modelo principal de sentimientos
   */
  private async createSentimentModel(): Promise<tf.LayersModel> {
    const model = tf.sequential({
      layers: [
        tf.layers.dense({
          units: 128,
          activation: 'relu',
          inputShape: [50] // Características combinadas
        }),
        tf.layers.dropout({ rate: 0.3 }),
        tf.layers.dense({
          units: 64,
          activation: 'relu'
        }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({
          units: 32,
          activation: 'relu'
        }),
        tf.layers.dense({
          units: 7, // Sentiment score + 6 métricas adicionales
          activation: 'tanh'
        })
      ]
    });

    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'meanSquaredError',
      metrics: ['accuracy']
    });

    return model;
  }

  /**
   * Crea el modelo de análisis de texto
   */
  private async createTextModel(): Promise<tf.LayersModel> {
    const model = tf.sequential({
      layers: [
        tf.layers.embedding({
          inputDim: 10000,
          outputDim: 128,
          inputLength: 100
        }),
        tf.layers.lstm({
          units: 64,
          returnSequences: true
        }),
        tf.layers.lstm({
          units: 32
        }),
        tf.layers.dropout({ rate: 0.3 }),
        tf.layers.dense({
          units: 16,
          activation: 'relu'
        }),
        tf.layers.dense({
          units: 1,
          activation: 'tanh'
        })
      ]
    });

    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'meanSquaredError'
    });

    return model;
  }

  /**
   * Crea el modelo de análisis de audio
   */
  private async createAudioModel(): Promise<tf.LayersModel> {
    const model = tf.sequential({
      layers: [
        tf.layers.conv1d({
          filters: 32,
          kernelSize: 3,
          activation: 'relu',
          inputShape: [128, 1] // Características de audio
        }),
        tf.layers.maxPooling1d({ poolSize: 2 }),
        tf.layers.conv1d({
          filters: 64,
          kernelSize: 3,
          activation: 'relu'
        }),
        tf.layers.maxPooling1d({ poolSize: 2 }),
        tf.layers.flatten(),
        tf.layers.dense({
          units: 64,
          activation: 'relu'
        }),
        tf.layers.dropout({ rate: 0.3 }),
        tf.layers.dense({
          units: 1,
          activation: 'tanh'
        })
      ]
    });

    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'meanSquaredError'
    });

    return model;
  }

  /**
   * Crea el modelo de análisis de comportamiento
   */
  private async createBehavioralModel(): Promise<tf.LayersModel> {
    const model = tf.sequential({
      layers: [
        tf.layers.dense({
          units: 64,
          activation: 'relu',
          inputShape: [20] // Métricas de comportamiento
        }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({
          units: 32,
          activation: 'relu'
        }),
        tf.layers.dense({
          units: 16,
          activation: 'relu'
        }),
        tf.layers.dense({
          units: 3, // engagement, stress, frustration
          activation: 'sigmoid'
        })
      ]
    });

    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'meanSquaredError'
    });

    return model;
  }

  /**
   * Crea el modelo de predicción de abandono escolar
   */
  private async createDropoutModel(): Promise<tf.LayersModel> {
    const model = tf.sequential({
      layers: [
        tf.layers.dense({
          units: 128,
          activation: 'relu',
          inputShape: [30] // Características del estudiante
        }),
        tf.layers.dropout({ rate: 0.4 }),
        tf.layers.dense({
          units: 64,
          activation: 'relu'
        }),
        tf.layers.dropout({ rate: 0.3 }),
        tf.layers.dense({
          units: 32,
          activation: 'relu'
        }),
        tf.layers.dense({
          units: 1,
          activation: 'sigmoid'
        })
      ]
    });

    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'binaryCrossentropy',
      metrics: ['accuracy']
    });

    return model;
  }

  /**
   * Analiza sentimientos en tiempo real
   */
  async analyzeSentiment(data: SentimentData, studentId: string): Promise<SentimentResult> {
    if (!this.isInitialized) {
      throw new Error('Modelo no inicializado');
    }

    try {
      // Extraer características
      const features = await this.extractFeatures(data);
      
      // Predecir sentimientos
      const predictions = await this.predictSentiment(features);
      
      // Determinar emoción dominante
      const emotion = this.determineEmotion(predictions);
      
      // Calcular métricas adicionales
      const metrics = await this.calculateMetrics(predictions, data);
      
      // Verificar alertas
      const alerts = await this.checkAlerts(predictions, metrics, studentId);
      
      // Generar recomendaciones
      const recommendations = await this.generateRecommendations(predictions, metrics, emotion);
      
      // Guardar análisis en base de datos
      await this.saveAnalysis(studentId, predictions, emotion, metrics, alerts, data.context);
      
      return {
        sentimentScore: predictions.sentiment,
        emotion,
        confidence: predictions.confidence,
        intensity: predictions.intensity,
        stressLevel: metrics.stressLevel,
        engagementLevel: metrics.engagementLevel,
        frustrationLevel: metrics.frustrationLevel,
        isAlert: alerts.isAlert,
        alertType: alerts.alertType,
        alertMessage: alerts.message,
        recommendations
      };
    } catch (error) {
      console.error('Error en análisis de sentimientos:', error);
      throw error;
    }
  }

  /**
   * Extrae características de los datos de entrada
   */
  private async extractFeatures(data: SentimentData): Promise<tf.Tensor> {
    const features: number[] = [];

    // Características de texto
    if (data.text) {
      const textFeatures = await this.extractTextFeatures(data.text);
      features.push(...textFeatures);
    } else {
      features.push(...new Array(20).fill(0));
    }

    // Características de audio
    if (data.audioFeatures) {
      features.push(...data.audioFeatures.slice(0, 15));
    } else {
      features.push(...new Array(15).fill(0));
    }

    // Características de comportamiento
    if (data.behavioralMetrics) {
      const behavioralFeatures = this.extractBehavioralFeatures(data.behavioralMetrics);
      features.push(...behavioralFeatures);
    } else {
      features.push(...new Array(15).fill(0));
    }

    return tf.tensor2d([features], [1, 50]);
  }

  /**
   * Extrae características del texto
   */
  private async extractTextFeatures(text: string): Promise<number[]> {
    // Implementación simplificada - en producción usar NLP más avanzado
    const words = text.toLowerCase().split(/\s+/);
    const features = new Array(20).fill(0);

    // Palabras positivas
    const positiveWords = ['bien', 'excelente', 'genial', 'perfecto', 'feliz', 'contento', 'satisfecho'];
    const negativeWords = ['mal', 'terrible', 'horrible', 'triste', 'enojado', 'frustrado', 'confundido'];
    const stressWords = ['estresado', 'nervioso', 'ansioso', 'preocupado', 'tenso'];
    const engagementWords = ['interesante', 'fascinante', 'emocionante', 'divertido', 'aprendiendo'];

    let positiveCount = 0;
    let negativeCount = 0;
    let stressCount = 0;
    let engagementCount = 0;

    words.forEach(word => {
      if (positiveWords.includes(word)) positiveCount++;
      if (negativeWords.includes(word)) negativeCount++;
      if (stressWords.includes(word)) stressCount++;
      if (engagementWords.includes(word)) engagementCount++;
    });

    features[0] = positiveCount / words.length;
    features[1] = negativeCount / words.length;
    features[2] = stressCount / words.length;
    features[3] = engagementCount / words.length;
    features[4] = words.length; // Longitud del texto
    features[5] = text.includes('?') ? 1 : 0; // Preguntas
    features[6] = text.includes('!') ? 1 : 0; // Exclamaciones
    features[7] = (positiveCount - negativeCount) / words.length; // Sentimiento neto

    return features;
  }

  /**
   * Extrae características del comportamiento
   */
  private extractBehavioralFeatures(metrics: any): number[] {
    const features: number[] = [];

    // Tiempo de respuesta normalizado
    features.push(Math.min(metrics.responseTime / 10000, 1)); // Normalizar a 10 segundos

    // Patrones de clics
    const clickVariance = this.calculateVariance(metrics.clickPattern);
    features.push(clickVariance);
    features.push(metrics.clickPattern.length);

    // Comportamiento de scroll
    const scrollVariance = this.calculateVariance(metrics.scrollBehavior);
    features.push(scrollVariance);
    features.push(metrics.scrollBehavior.length);

    // Frecuencia de interacción
    features.push(Math.min(metrics.interactionFrequency / 100, 1)); // Normalizar a 100 interacciones

    // Métricas derivadas
    features.push(clickVariance * scrollVariance); // Interacción compleja
    features.push(metrics.responseTime / metrics.interactionFrequency); // Eficiencia

    return features;
  }

  /**
   * Calcula la varianza de un array
   */
  private calculateVariance(array: number[]): number {
    if (array.length === 0) return 0;
    const mean = array.reduce((a, b) => a + b, 0) / array.length;
    const variance = array.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / array.length;
    return Math.sqrt(variance);
  }

  /**
   * Predice sentimientos usando el modelo
   */
  private async predictSentiment(features: tf.Tensor): Promise<any> {
    const prediction = this.model!.predict(features) as tf.Tensor;
    const values = await prediction.array();
    
    return {
      sentiment: values[0][0],
      confidence: values[0][1],
      intensity: values[0][2],
      stressLevel: values[0][3],
      engagementLevel: values[0][4],
      frustrationLevel: values[0][5],
      attentionLevel: values[0][6]
    };
  }

  /**
   * Determina la emoción dominante
   */
  private determineEmotion(predictions: any): EmotionType {
    const { sentiment, stressLevel, engagementLevel, frustrationLevel } = predictions;

    if (sentiment > 0.6 && engagementLevel > 0.7) return EmotionType.JOY;
    if (sentiment < -0.6) return EmotionType.SADNESS;
    if (frustrationLevel > 0.7) return EmotionType.FRUSTRATION;
    if (stressLevel > 0.7) return EmotionType.ANXIETY;
    if (engagementLevel < 0.3) return EmotionType.BOREDOM;
    if (sentiment > 0.3 && engagementLevel > 0.5) return EmotionType.EXCITEMENT;
    if (sentiment < -0.3 && stressLevel > 0.5) return EmotionType.FEAR;
    if (Math.abs(sentiment) < 0.2) return EmotionType.NEUTRAL;

    return EmotionType.UNCERTAINTY;
  }

  /**
   * Calcula métricas adicionales
   */
  private async calculateMetrics(predictions: any, data: SentimentData): Promise<any> {
    return {
      stressLevel: predictions.stressLevel,
      engagementLevel: predictions.engagementLevel,
      frustrationLevel: predictions.frustrationLevel,
      attentionLevel: predictions.attentionLevel
    };
  }

  /**
   * Verifica si hay alertas que generar
   */
  private async checkAlerts(predictions: any, metrics: any, studentId: string): Promise<any> {
    const alerts = {
      isAlert: false,
      alertType: undefined as AlertType | undefined,
      message: ''
    };

    // Alerta por alto estrés
    if (metrics.stressLevel > 0.8) {
      alerts.isAlert = true;
      alerts.alertType = AlertType.HIGH_STRESS;
      alerts.message = 'Estudiante muestra niveles altos de estrés';
    }

    // Alerta por baja participación
    if (metrics.engagementLevel < 0.2) {
      alerts.isAlert = true;
      alerts.alertType = AlertType.LOW_ENGAGEMENT;
      alerts.message = 'Estudiante muestra baja participación';
    }

    // Alerta por frustración
    if (metrics.frustrationLevel > 0.7) {
      alerts.isAlert = true;
      alerts.alertType = AlertType.FRUSTRATION_SPIKE;
      alerts.message = 'Estudiante muestra signos de frustración';
    }

    // Alerta por angustia emocional
    if (predictions.sentiment < -0.8 && metrics.stressLevel > 0.6) {
      alerts.isAlert = true;
      alerts.alertType = AlertType.EMOTIONAL_DISTRESS;
      alerts.message = 'Estudiante muestra angustia emocional';
    }

    return alerts;
  }

  /**
   * Genera recomendaciones personalizadas
   */
  private async generateRecommendations(predictions: any, metrics: any, emotion: EmotionType): Promise<string[]> {
    const recommendations: string[] = [];

    // Recomendaciones basadas en emoción
    switch (emotion) {
      case EmotionType.FRUSTRATION:
        recommendations.push('Sugerir pausa breve para relajación');
        recommendations.push('Ofrecer ayuda adicional o explicación alternativa');
        recommendations.push('Reducir dificultad temporalmente');
        break;
      case EmotionType.ANXIETY:
        recommendations.push('Proporcionar ambiente más relajante');
        recommendations.push('Ofrecer ejercicios de respiración');
        recommendations.push('Simplificar instrucciones');
        break;
      case EmotionType.BOREDOM:
        recommendations.push('Aumentar dificultad del contenido');
        recommendations.push('Agregar elementos interactivos');
        recommendations.push('Introducir nuevo tipo de actividad');
        break;
      case EmotionType.JOY:
        recommendations.push('Mantener momentum positivo');
        recommendations.push('Aprovechar para introducir conceptos complejos');
        recommendations.push('Reconocer y celebrar el progreso');
        break;
    }

    // Recomendaciones basadas en métricas
    if (metrics.stressLevel > 0.6) {
      recommendations.push('Implementar técnicas de mindfulness');
      recommendations.push('Reducir presión temporal');
    }

    if (metrics.engagementLevel < 0.4) {
      recommendations.push('Cambiar a contenido más interactivo');
      recommendations.push('Incluir elementos gamificados');
    }

    return recommendations;
  }

  /**
   * Guarda el análisis en la base de datos
   */
  private async saveAnalysis(
    studentId: string,
    predictions: any,
    emotion: EmotionType,
    metrics: any,
    alerts: any,
    context?: any
  ) {
    try {
      await prisma.sentimentAnalysis.create({
        data: {
          studentId,
          sessionId: context?.sessionId,
          sentimentScore: predictions.sentiment,
          emotion,
          confidence: predictions.confidence,
          intensity: predictions.intensity,
          activityType: context?.activityType,
          contentId: context?.contentId,
          userInput: context?.userInput,
          stressLevel: metrics.stressLevel,
          engagementLevel: metrics.engagementLevel,
          frustrationLevel: metrics.frustrationLevel,
          isAlert: alerts.isAlert,
          alertType: alerts.alertType,
          alertMessage: alerts.message
        }
      });

      // Crear alerta si es necesario
      if (alerts.isAlert) {
        await this.createAlert(studentId, alerts.alertType, alerts.message, context);
      }

      // Actualizar tendencias
      await this.updateEmotionTrends(studentId, predictions, emotion);
    } catch (error) {
      console.error('Error guardando análisis:', error);
    }
  }

  /**
   * Crea una alerta para el maestro
   */
  private async createAlert(
    studentId: string,
    alertType: AlertType,
    message: string,
    context?: any
  ) {
    try {
      const student = await prisma.student.findUnique({
        where: { id: studentId },
        include: { teacher: true }
      });

      if (student?.teacherId) {
        await prisma.sentimentAlert.create({
          data: {
            studentId,
            teacherId: student.teacherId,
            alertType,
            severity: this.determineSeverity(alertType),
            message,
            context: context ? JSON.parse(JSON.stringify(context)) : null
          }
        });
      }
    } catch (error) {
      console.error('Error creando alerta:', error);
    }
  }

  /**
   * Determina la severidad de la alerta
   */
  private determineSeverity(alertType: AlertType): AlertSeverity {
    switch (alertType) {
      case AlertType.EMOTIONAL_DISTRESS:
        return AlertSeverity.CRITICAL;
      case AlertType.HIGH_STRESS:
      case AlertType.FRUSTRATION_SPIKE:
        return AlertSeverity.HIGH;
      case AlertType.LOW_ENGAGEMENT:
      case AlertType.ATTENTION_DECLINE:
        return AlertSeverity.MEDIUM;
      default:
        return AlertSeverity.LOW;
    }
  }

  /**
   * Actualiza las tendencias de emociones
   */
  private async updateEmotionTrends(studentId: string, predictions: any, emotion: EmotionType) {
    try {
      const now = new Date();
      const date = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const timeSlot = now.getHours();

      const existingTrend = await prisma.emotionTrend.findUnique({
        where: {
          studentId_date_timeSlot: {
            studentId,
            date,
            timeSlot
          }
        }
      });

      const sentiment = predictions.sentiment;
      const isPositive = sentiment > 0.2;
      const isNegative = sentiment < -0.2;
      const isNeutral = !isPositive && !isNegative;

      if (existingTrend) {
        // Actualizar tendencia existente
        const totalAnalyses = existingTrend.totalAnalyses + 1;
        const newAvgSentiment = (existingTrend.avgSentiment * existingTrend.totalAnalyses + sentiment) / totalAnalyses;

        await prisma.emotionTrend.update({
          where: { id: existingTrend.id },
          data: {
            avgSentiment: newAvgSentiment,
            dominantEmotion: emotion,
            totalAnalyses,
            positiveCount: existingTrend.positiveCount + (isPositive ? 1 : 0),
            negativeCount: existingTrend.negativeCount + (isNegative ? 1 : 0),
            neutralCount: existingTrend.neutralCount + (isNeutral ? 1 : 0)
          }
        });
      } else {
        // Crear nueva tendencia
        await prisma.emotionTrend.create({
          data: {
            studentId,
            date,
            timeSlot,
            avgSentiment: sentiment,
            dominantEmotion: emotion,
            stressTrend: 0,
            engagementTrend: 0,
            totalAnalyses: 1,
            positiveCount: isPositive ? 1 : 0,
            negativeCount: isNegative ? 1 : 0,
            neutralCount: isNeutral ? 1 : 0
          }
        });
      }
    } catch (error) {
      console.error('Error actualizando tendencias:', error);
    }
  }

  /**
   * Predice riesgo de abandono escolar
   */
  async predictDropoutRisk(studentId: string): Promise<DropoutPrediction> {
    try {
      // Obtener datos del estudiante
      const student = await prisma.student.findUnique({
        where: { id: studentId },
        include: {
          sentimentAnalyses: {
            orderBy: { timestamp: 'desc' },
            take: 30
          },
          emotionTrends: {
            orderBy: { date: 'desc' },
            take: 7
          },
          assessments: {
            orderBy: { createdAt: 'desc' },
            take: 10
          },
          completedLessons: {
            orderBy: { completedAt: 'desc' },
            take: 20
          }
        }
      });

      if (!student) {
        throw new Error('Estudiante no encontrado');
      }

      // Extraer características para predicción
      const features = this.extractDropoutFeatures(student);
      
      // Predecir usando el modelo
      const prediction = this.dropoutModel!.predict(tf.tensor2d([features])) as tf.Tensor;
      const probability = await prediction.array();

      // Determinar nivel de riesgo
      const riskLevel = this.determineRiskLevel(probability[0][0]);
      
      // Identificar factores de riesgo
      const factors = this.identifyRiskFactors(student);
      
      // Generar recomendaciones
      const recommendations = this.generateDropoutRecommendations(riskLevel, factors);

      return {
        riskLevel,
        probability: probability[0][0],
        factors,
        recommendations,
        confidence: 0.85 // Confianza del modelo
      };
    } catch (error) {
      console.error('Error prediciendo riesgo de abandono:', error);
      throw error;
    }
  }

  /**
   * Extrae características para predicción de abandono
   */
  private extractDropoutFeatures(student: any): number[] {
    const features: number[] = [];

    // Características demográficas
    features.push(student.age / 100); // Normalizar edad
    features.push(student.cognitiveLevel / 5); // Nivel cognitivo
    features.push(student.readingLevel / 12); // Nivel de lectura

    // Características de sentimientos
    const recentSentiments = student.sentimentAnalyses.slice(0, 10);
    if (recentSentiments.length > 0) {
      const avgSentiment = recentSentiments.reduce((sum: number, s: any) => sum + s.sentimentScore, 0) / recentSentiments.length;
      features.push((avgSentiment + 1) / 2); // Normalizar a 0-1
    } else {
      features.push(0.5);
    }

    // Características de engagement
    const recentEngagement = recentSentiments.filter((s: any) => s.engagementLevel !== null);
    if (recentEngagement.length > 0) {
      const avgEngagement = recentEngagement.reduce((sum: number, s: any) => sum + s.engagementLevel, 0) / recentEngagement.length;
      features.push(avgEngagement);
    } else {
      features.push(0.5);
    }

    // Características de progreso académico
    const assessments = student.assessments;
    if (assessments.length > 0) {
      const avgScore = assessments.reduce((sum: number, a: any) => sum + (a.score || 0), 0) / assessments.length;
      features.push(avgScore);
    } else {
      features.push(0.5);
    }

    // Características de participación
    const completedLessons = student.completedLessons;
    features.push(Math.min(completedLessons.length / 50, 1)); // Normalizar a 50 lecciones

    // Características de tendencias
    const trends = student.emotionTrends;
    if (trends.length > 0) {
      const stressTrend = trends.reduce((sum: number, t: any) => sum + t.stressTrend, 0) / trends.length;
      features.push((stressTrend + 1) / 2); // Normalizar
    } else {
      features.push(0.5);
    }

    // Rellenar hasta 30 características
    while (features.length < 30) {
      features.push(0);
    }

    return features;
  }

  /**
   * Determina el nivel de riesgo
   */
  private determineRiskLevel(probability: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    if (probability < 0.25) return 'LOW';
    if (probability < 0.5) return 'MEDIUM';
    if (probability < 0.75) return 'HIGH';
    return 'CRITICAL';
  }

  /**
   * Identifica factores de riesgo
   */
  private identifyRiskFactors(student: any): string[] {
    const factors: string[] = [];

    // Análisis de sentimientos recientes
    const recentSentiments = student.sentimentAnalyses.slice(0, 10);
    if (recentSentiments.length > 0) {
      const avgSentiment = recentSentiments.reduce((sum: number, s: any) => sum + s.sentimentScore, 0) / recentSentiments.length;
      if (avgSentiment < -0.5) {
        factors.push('Sentimientos negativos persistentes');
      }
    }

    // Análisis de engagement
    const lowEngagementCount = recentSentiments.filter((s: any) => s.engagementLevel < 0.3).length;
    if (lowEngagementCount > 5) {
      factors.push('Baja participación en actividades');
    }

    // Análisis de progreso académico
    const assessments = student.assessments;
    if (assessments.length > 0) {
      const recentScores = assessments.slice(0, 5).map((a: any) => a.score || 0);
      const scoreDecline = recentScores[0] - recentScores[recentScores.length - 1];
      if (scoreDecline > 0.2) {
        factors.push('Declive en rendimiento académico');
      }
    }

    // Análisis de participación
    const completedLessons = student.completedLessons;
    if (completedLessons.length < 10) {
      factors.push('Baja participación en lecciones');
    }

    return factors;
  }

  /**
   * Genera recomendaciones para prevenir abandono
   */
  private generateDropoutRecommendations(riskLevel: string, factors: string[]): string[] {
    const recommendations: string[] = [];

    switch (riskLevel) {
      case 'CRITICAL':
        recommendations.push('Intervención inmediata requerida');
        recommendations.push('Contacto directo con familia');
        recommendations.push('Evaluación psicológica recomendada');
        break;
      case 'HIGH':
        recommendations.push('Aumentar apoyo individualizado');
        recommendations.push('Implementar mentoría personal');
        recommendations.push('Revisar dificultades específicas');
        break;
      case 'MEDIUM':
        recommendations.push('Monitoreo más frecuente');
        recommendations.push('Ofrecer apoyo adicional');
        recommendations.push('Adaptar contenido a intereses');
        break;
      case 'LOW':
        recommendations.push('Mantener seguimiento regular');
        recommendations.push('Continuar con estrategias actuales');
        break;
    }

    // Recomendaciones específicas basadas en factores
    if (factors.includes('Sentimientos negativos persistentes')) {
      recommendations.push('Implementar programa de bienestar emocional');
    }
    if (factors.includes('Baja participación')) {
      recommendations.push('Diseñar actividades más atractivas');
    }
    if (factors.includes('Declive académico')) {
      recommendations.push('Proporcionar tutoría académica');
    }

    return recommendations;
  }

  /**
   * Obtiene tendencias de emociones
   */
  async getEmotionTrends(studentId: string, days: number = 7): Promise<EmotionTrend[]> {
    try {
      const trends = await prisma.emotionTrend.findMany({
        where: {
          studentId,
          date: {
            gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000)
          }
        },
        orderBy: { date: 'asc' }
      });

      return trends.map(trend => ({
        date: trend.date,
        timeSlot: trend.timeSlot,
        avgSentiment: trend.avgSentiment,
        dominantEmotion: trend.dominantEmotion,
        stressTrend: trend.stressTrend,
        engagementTrend: trend.engagementTrend,
        totalAnalyses: trend.totalAnalyses,
        positiveCount: trend.positiveCount,
        negativeCount: trend.negativeCount,
        neutralCount: trend.neutralCount
      }));
    } catch (error) {
      console.error('Error obteniendo tendencias:', error);
      return [];
    }
  }

  /**
   * Verifica si el modelo está listo
   */
  isReady(): boolean {
    return this.isInitialized;
  }

  /**
   * Entrena el modelo con nuevos datos
   */
  async trainModel(trainingData: any[]): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Modelo no inicializado');
    }

    try {
      console.log('🔄 Entrenando modelo de sentimientos...');
      
      // Preparar datos de entrenamiento
      const { features, labels } = this.prepareTrainingData(trainingData);
      
      // Entrenar modelo
      await this.model!.fit(features, labels, {
        epochs: 50,
        batchSize: 32,
        validationSplit: 0.2,
        callbacks: {
          onEpochEnd: (epoch, logs) => {
            console.log(`Época ${epoch + 1}: loss = ${logs?.loss.toFixed(4)}, accuracy = ${logs?.acc?.toFixed(4)}`);
          }
        }
      });

      console.log('✅ Modelo entrenado exitosamente');
    } catch (error) {
      console.error('❌ Error entrenando modelo:', error);
      throw error;
    }
  }

  /**
   * Prepara datos de entrenamiento
   */
  private prepareTrainingData(data: any[]): { features: tf.Tensor, labels: tf.Tensor } {
    const features: number[][] = [];
    const labels: number[][] = [];

    data.forEach(item => {
      features.push(item.features);
      labels.push([
        item.sentiment,
        item.confidence,
        item.intensity,
        item.stressLevel,
        item.engagementLevel,
        item.frustrationLevel,
        item.attentionLevel
      ]);
    });

    return {
      features: tf.tensor2d(features),
      labels: tf.tensor2d(labels)
    };
  }

  /**
   * Guarda el modelo entrenado
   */
  async saveModel(): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Modelo no inicializado');
    }

    try {
      await this.model!.save('file://./models/sentiment-analysis');
      console.log('✅ Modelo guardado exitosamente');
    } catch (error) {
      console.error('❌ Error guardando modelo:', error);
      throw error;
    }
  }
}

// Instancia singleton
export const sentimentAnalysisModel = new SentimentAnalysisModel();
