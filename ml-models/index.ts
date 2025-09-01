// Importar clases explícitamente
import { NeedsDetectionModel, needsDetectionModel } from './needs-detection-model';
import { CulturalAdaptationModel, culturalAdaptationModel } from './cultural-adaptation-model';
import { SpeechRecognitionModel, speechRecognitionModel } from './speech-recognition-model';
import { AuxiliaryModels, auxiliaryModels } from './auxiliary-models';
import { SentimentAnalysisModel, sentimentAnalysisModel } from './sentiment-analysis-model';

// Exportar modelos principales
export { 
  needsDetectionModel, 
  NeedsDetectionModel
} from './needs-detection-model';

export { 
  culturalAdaptationModel, 
  CulturalAdaptationModel
} from './cultural-adaptation-model';

export { 
  speechRecognitionModel, 
  SpeechRecognitionModel
} from './speech-recognition-model';

export { 
  auxiliaryModels, 
  AuxiliaryModels
} from './auxiliary-models';

export { 
  sentimentAnalysisModel, 
  SentimentAnalysisModel
} from './sentiment-analysis-model';

// Interfaz unificada para todos los modelos
export interface AIModelManager {
  // Modelos principales
  needsDetection: NeedsDetectionModel;
  culturalAdaptation: CulturalAdaptationModel;
  speechRecognition: SpeechRecognitionModel;
  auxiliary: AuxiliaryModels;
  sentimentAnalysis: SentimentAnalysisModel;

  // Estado general
  isReady(): boolean;

  // Inicialización
  initialize(): Promise<void>;

  // Entrenamiento
  trainAllModels(trainingData: any): Promise<void>;

  // Guardado
  saveAllModels(): Promise<void>;

  // Utilidades
  getModelStatus(): ModelStatus;
}

export interface ModelStatus {
  needsDetection: boolean;
  culturalAdaptation: boolean;
  speechRecognition: boolean;
  auxiliary: boolean;
  sentimentAnalysis: boolean;
  overall: boolean;
}

/**
 * Gestor unificado de modelos de IA
 * Proporciona una interfaz centralizada para todos los modelos
 */
export class AIModelManager implements AIModelManager {
  public needsDetection: NeedsDetectionModel;
  public culturalAdaptation: CulturalAdaptationModel;
  public speechRecognition: SpeechRecognitionModel;
  public auxiliary: AuxiliaryModels;
  public sentimentAnalysis: SentimentAnalysisModel;

  constructor() {
    this.needsDetection = needsDetectionModel;
    this.culturalAdaptation = culturalAdaptationModel;
    this.speechRecognition = speechRecognitionModel;
    this.auxiliary = auxiliaryModels;
    this.sentimentAnalysis = sentimentAnalysisModel;
  }

  /**
   * Verifica si todos los modelos están listos
   */
  isReady(): boolean {
    return this.needsDetection.isReady() &&
           this.culturalAdaptation.isReady() &&
           this.speechRecognition.isReady() &&
           this.auxiliary.isReady() &&
           this.sentimentAnalysis.isReady();
  }

  /**
   * Inicializa todos los modelos
   */
  async initialize(): Promise<void> {
    console.log('🚀 Inicializando gestor de modelos de IA...');

    try {
      // Los modelos se inicializan automáticamente en sus constructores
      // Solo necesitamos esperar a que estén listos

      let attempts = 0;
      const maxAttempts = 30; // 30 segundos máximo

      while (!this.isReady() && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        attempts++;
        console.log(`⏳ Esperando modelos... (${attempts}/${maxAttempts})`);
      }

      if (this.isReady()) {
        console.log('✅ Todos los modelos de IA inicializados correctamente');
      } else {
        console.warn('⚠️ Algunos modelos no se inicializaron completamente');
      }
    } catch (error) {
      console.error('❌ Error inicializando modelos de IA:', error);
      throw error;
    }
  }

  /**
   * Entrena todos los modelos con datos proporcionados
   */
  async trainAllModels(trainingData: any): Promise<void> {
    console.log('🎓 Iniciando entrenamiento de todos los modelos...');

    try {
      const trainingPromises = [];

      // Entrenar modelo de detección de necesidades
      if (trainingData.needsDetection) {
        trainingPromises.push(
          this.needsDetection.trainModel(trainingData.needsDetection)
        );
      }

      // Entrenar modelo de adaptación cultural
      if (trainingData.culturalAdaptation) {
        trainingPromises.push(
          this.culturalAdaptation.trainModel(trainingData.culturalAdaptation)
        );
      }

      // Entrenar modelo de reconocimiento de voz
      if (trainingData.speechRecognition) {
        trainingPromises.push(
          this.speechRecognition.trainModel(trainingData.speechRecognition)
        );
      }

      // Entrenar modelos auxiliares
      if (trainingData.auxiliary) {
        trainingPromises.push(
          this.auxiliary.trainAllModels(trainingData.auxiliary)
        );
      }

      // Ejecutar todos los entrenamientos en paralelo
      await Promise.all(trainingPromises);

      console.log('✅ Entrenamiento de todos los modelos completado');
    } catch (error) {
      console.error('❌ Error durante el entrenamiento:', error);
      throw error;
    }
  }

  /**
   * Guarda todos los modelos entrenados
   */
  async saveAllModels(): Promise<void> {
    console.log('💾 Guardando todos los modelos...');

    try {
      const savePromises = [];

      // Guardar modelo de detección de necesidades
      if (this.needsDetection.isReady()) {
        savePromises.push(this.needsDetection.saveModel());
      }

      // Guardar modelos de adaptación cultural
      if (this.culturalAdaptation.isReady()) {
        savePromises.push(this.culturalAdaptation.saveModels());
      }

      // Guardar modelo de reconocimiento de voz
      if (this.speechRecognition.isReady()) {
        savePromises.push(this.speechRecognition.saveModel());
      }

      // Guardar modelos auxiliares
      if (this.auxiliary.isReady()) {
        savePromises.push(this.auxiliary.saveAllModels());
      }

      // Ejecutar todos los guardados en paralelo
      await Promise.all(savePromises);

      console.log('✅ Todos los modelos guardados correctamente');
    } catch (error) {
      console.error('❌ Error guardando modelos:', error);
      throw error;
    }
  }

  /**
   * Obtiene el estado de todos los modelos
   */
  getModelStatus(): ModelStatus {
    return {
      needsDetection: this.needsDetection.isReady(),
      culturalAdaptation: this.culturalAdaptation.isReady(),
      speechRecognition: this.speechRecognition.isReady(),
      auxiliary: this.auxiliary.isReady(),
      sentimentAnalysis: this.sentimentAnalysis.isReady(),
      overall: this.isReady()
    };
  }

  /**
   * Análisis completo de un estudiante
   */
  async analyzeStudent(studentData: {
    interactionPattern: any;
    culturalContext: any;
    audioSamples?: Float32Array[];
    textSamples?: string[];
    behaviorData?: any;
  }): Promise<{
    needs: any[];
    culturalAdaptations: any[];
    speechAnalysis?: any[];
    behaviorAnalysis?: any;
    recommendations: any[];
    textAnalysis?: any[];
  }> {
    console.log('🔍 Iniciando análisis completo del estudiante...');

    try {
      const results: any = {};

      // Detectar necesidades especiales
      if (studentData.interactionPattern) {
        results.needs = await this.needsDetection.detectNeeds(studentData.interactionPattern);
      }

      // Adaptar contenido culturalmente
      if (studentData.culturalContext) {
        // Usar un texto de ejemplo para la adaptación
        const sampleText = "Este es un ejemplo de contenido educativo que será adaptado culturalmente.";
        results.culturalAdaptations = await this.culturalAdaptation.adaptContent(sampleText, studentData.culturalContext);
      }

      // Analizar muestras de voz
      if (studentData.audioSamples && studentData.audioSamples.length > 0) {
        results.speechAnalysis = [];
        for (const audioSample of studentData.audioSamples) {
          const analysis = await this.speechRecognition.recognizeSpeech(audioSample);
          results.speechAnalysis.push(analysis);
        }
      }

      // Analizar comportamiento
      if (studentData.behaviorData) {
        results.behaviorAnalysis = await this.auxiliary.analyzeBehavior(studentData.behaviorData);
      }

      // Analizar textos
      if (studentData.textSamples && studentData.textSamples.length > 0) {
        results.textAnalysis = [];
        for (const textSample of studentData.textSamples) {
          const analysis = await this.auxiliary.analyzeText(textSample, studentData.culturalContext.culture);
          results.textAnalysis.push(analysis);
        }
      }

      // Generar recomendaciones
      if (results.needs && results.behaviorAnalysis) {
        results.recommendations = await this.auxiliary.generateRecommendations({
          needs: results.needs.map((n: any) => n.type),
          behavior: results.behaviorAnalysis,
          progress: studentData.interactionPattern?.readingSpeed || 0.5,
          preferences: ['visual', 'auditory'], // Por defecto
          culturalContext: studentData.culturalContext.culture,
          age: 10, // Por defecto
          grade: 5  // Por defecto
        });
      }

      console.log('✅ Análisis completo del estudiante finalizado');
      return results;

    } catch (error) {
      console.error('❌ Error en análisis completo del estudiante:', error);
      throw error;
    }
  }

  /**
   * Procesamiento de contenido educativo
   */
  async processEducationalContent(content: {
    text: string;
    culturalContext: string;
    targetLanguage: string;
    difficulty: string;
  }): Promise<{
    adaptedContent: any;
    textAnalysis: any;
    sentiment: { sentiment: string; confidence: number };
    recommendations: string[];
  }> {
    console.log('📚 Procesando contenido educativo...');

    try {
      const results: any = {};

      // Crear contexto cultural
      const culturalContext = {
        culture: content.culturalContext,
        language: content.targetLanguage,
        region: 'México', // Por defecto
        socioeconomicLevel: 'medio',
        educationLevel: 'básico',
        age: 10,
        gender: 'no especificado',
        traditions: [],
        values: [],
        taboos: [],
        examples: []
      };

      // Adaptar contenido culturalmente
      results.adaptedContent = await this.culturalAdaptation.adaptContent(content.text, culturalContext);

      // Analizar texto
      results.textAnalysis = await this.auxiliary.analyzeText(content.text, content.culturalContext);

      // Analizar sentimientos
      results.sentiment = await this.auxiliary.analyzeSentiment(content.text);

      // Generar recomendaciones para el contenido
      results.recommendations = [
        `Contenido adaptado para cultura ${content.culturalContext}`,
        `Dificultad: ${results.textAnalysis.difficulty}`,
        `Nivel de lectura: ${results.textAnalysis.readingLevel}`,
        `Temas detectados: ${results.textAnalysis.topics.join(', ')}`
      ];

      console.log('✅ Contenido educativo procesado');
      return results;

    } catch (error) {
      console.error('❌ Error procesando contenido educativo:', error);
      throw error;
    }
  }

  /**
   * Análisis de voz en tiempo real
   */
  async analyzeRealTimeVoice(audioBuffer: Float32Array, language: string = 'es-MX'): Promise<{
    recognition: any;
    command?: any;
    sentiment: { sentiment: string; confidence: number };
  }> {
    console.log('🎤 Analizando voz en tiempo real...');

    try {
      const results: any = {};

      // Reconocimiento de voz
      results.recognition = await this.speechRecognition.recognizeSpeech(audioBuffer, language);

      // Detectar comandos de voz
      if (results.recognition.confidence > 0.5) {
        results.command = await this.speechRecognition.recognizeVoiceCommand(audioBuffer, language);
      }

      // Analizar sentimientos en el texto reconocido
      if (results.recognition.text) {
        results.sentiment = await this.auxiliary.analyzeSentiment(results.recognition.text);
      }

      console.log('✅ Análisis de voz completado');
      return results;

    } catch (error) {
      console.error('❌ Error analizando voz:', error);
      throw error;
    }
  }

  /**
   * Generar reporte de diagnóstico completo
   */
  async generateDiagnosticReport(studentId: string, analysisResults: any): Promise<{
    summary: string;
    detailedAnalysis: any;
    recommendations: any[];
    culturalAdaptations: string[];
    accessibilityFeatures: string[];
    nextSteps: string[];
  }> {
    console.log('📊 Generando reporte de diagnóstico...');

    try {
      const report: any = {};

      // Resumen ejecutivo
      report.summary = this.generateSummary(analysisResults);

      // Análisis detallado
      report.detailedAnalysis = analysisResults;

      // Recomendaciones
      report.recommendations = analysisResults.recommendations || [];

      // Adaptaciones culturales
      report.culturalAdaptations = this.extractCulturalAdaptations(analysisResults);

      // Características de accesibilidad
      report.accessibilityFeatures = this.extractAccessibilityFeatures(analysisResults);

      // Próximos pasos
      report.nextSteps = this.generateNextSteps(analysisResults);

      console.log('✅ Reporte de diagnóstico generado');
      return report;

    } catch (error) {
      console.error('❌ Error generando reporte:', error);
      throw error;
    }
  }

  /**
   * Genera resumen ejecutivo
   */
  private generateSummary(analysisResults: any): string {
    const needs = analysisResults.needs?.length || 0;
    const culturalElements = analysisResults.culturalAdaptations?.culturalElements?.length || 0;
    const recommendations = analysisResults.recommendations?.length || 0;

    return `Análisis completo realizado. Se detectaron ${needs} necesidades especiales, ${culturalElements} elementos culturales identificados, y ${recommendations} recomendaciones generadas.`;
  }

  /**
   * Extrae adaptaciones culturales
   */
  private extractCulturalAdaptations(analysisResults: any): string[] {
    const adaptations: string[] = [];

    if (analysisResults.culturalAdaptations) {
      adaptations.push(...analysisResults.culturalAdaptations.languageAdaptations || []);
      adaptations.push(...analysisResults.culturalAdaptations.visualAdaptations || []);
      adaptations.push(...analysisResults.culturalAdaptations.audioAdaptations || []);
    }

    return [...new Set(adaptations)];
  }

  /**
   * Extrae características de accesibilidad
   */
  private extractAccessibilityFeatures(analysisResults: any): string[] {
    const features: string[] = [];

    if (analysisResults.needs) {
      analysisResults.needs.forEach((need: any) => {
        features.push(...need.accommodations);
      });
    }

    if (analysisResults.recommendations) {
      analysisResults.recommendations.forEach((rec: any) => {
        features.push(...rec.accessibility);
      });
    }

    return [...new Set(features)];
  }

  /**
   * Genera próximos pasos
   */
  private generateNextSteps(analysisResults: any): string[] {
    const steps: string[] = [];

    if (analysisResults.needs?.length > 0) {
      steps.push('Implementar adaptaciones para necesidades especiales detectadas');
    }

    if (analysisResults.culturalAdaptations) {
      steps.push('Aplicar adaptaciones culturales al contenido educativo');
    }

    if (analysisResults.recommendations?.length > 0) {
      steps.push('Implementar recomendaciones de aprendizaje prioritarias');
    }

    steps.push('Monitorear progreso y ajustar estrategias según sea necesario');
    steps.push('Programar seguimiento en 2 semanas');

    return steps;
  }
}

// Instancia singleton del gestor de modelos
export const aiModelManager = new AIModelManager();

// Re-exportar todos los tipos desde los módulos individuales
export type {
  LearningPattern,
  DetectedNeed
} from './needs-detection-model';

export type {
  CulturalContext,
  ContentAdaptation,
  AdaptationRule
} from './cultural-adaptation-model';

export type {
  AudioFeatures,
  RecognitionResult,
  LanguageModel,
  VoiceCommand
} from './speech-recognition-model';

export type {
  TextAnalysis,
  BehaviorPattern,
  LearningRecommendation
} from './auxiliary-models';
