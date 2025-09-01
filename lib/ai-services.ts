/**
 * Servicios de IA unificados para InclusiveAI Coach
 * Integra todos los servicios de IA existentes con los nuevos servicios especializados
 */

import { Anthropic } from '@anthropic-ai/sdk';
import { OpenAI } from 'openai';
import { 
  aiModelManager, 
  AIModelManager,
  type LearningPattern,
  type DetectedNeed,
  type CulturalContext,
  type ContentAdaptation,
  type RecognitionResult,
  type BehaviorPattern,
  type LearningRecommendation,
  type TextAnalysis
} from '../ml-models';

// Importar nuevos servicios especializados
import { 
  aiServicesManager,
  tensorFlowService,
  voiceService,
  emotionService,
  attentionService,
  culturalService
} from './services';

// Importar servicios existentes
import { SuperIntelligentChatbotService } from './ai-services/chatbot-service';
import { SpeechRecognitionService } from './ai-services/speech-recognition-service';
import { NeedsDetectionService } from './ai-services/needs-detection-service';
import { TTSService } from './ai-services/tts-service';

// Configuración de APIs
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

/**
 * Servicio principal de IA que integra todos los servicios
 */
export class AIServices {
  private modelManager: AIModelManager;
  private chatbotService: SuperIntelligentChatbotService;
  private speechRecognitionService: SpeechRecognitionService;
  private needsDetectionService: NeedsDetectionService;
  private ttsService: TTSService;

  constructor() {
    this.modelManager = aiModelManager;
    this.chatbotService = new SuperIntelligentChatbotService();
    this.speechRecognitionService = new SpeechRecognitionService({
      language: 'es-MX',
      continuous: true,
      interimResults: true,
      maxAlternatives: 3
    });
    this.needsDetectionService = new NeedsDetectionService();
    this.ttsService = new TTSService();
  }

  /**
   * Obtiene el gestor de servicios especializados
   */
  getSpecializedServices() {
    return aiServicesManager;
  }

  /**
   * Obtiene servicios individuales especializados
   */
  getTensorFlowService() {
    return tensorFlowService;
  }

  getVoiceService() {
    return voiceService;
  }

  getEmotionService() {
    return emotionService;
  }

  getAttentionService() {
    return attentionService;
  }

  getCulturalService() {
    return culturalService;
  }

  /**
   * Inicializa todos los servicios de IA
   */
  async initialize(): Promise<void> {
    console.log('🚀 Inicializando servicios de IA...');
    
    try {
      // Inicializar gestor de modelos de TensorFlow.js
      await this.modelManager.initialize();
      
      // Inicializar servicios especializados
      await aiServicesManager.initialize();
      
      console.log('✅ Todos los servicios de IA inicializados correctamente');
    } catch (error) {
      console.error('❌ Error inicializando servicios de IA:', error);
      throw error;
    }
  }

  /**
   * Verifica si todos los servicios están listos
   */
  isReady(): boolean {
    return this.modelManager.isReady() && aiServicesManager.isReady();
  }

  /**
   * Obtiene el estado de todos los servicios
   */
  getStatus(): {
    models: boolean;
    specializedServices: boolean;
    overall: boolean;
  } {
    return {
      models: this.modelManager.isReady(),
      specializedServices: aiServicesManager.isReady(),
      overall: this.isReady()
    };
  }

  // ===== SERVICIOS DE MODELOS DE TENSORFLOW.JS =====

  /**
   * Análisis completo de un estudiante usando modelos de TensorFlow.js
   */
  async analyzeStudentWithML(studentData: {
    interactionPattern: LearningPattern;
    culturalContext: CulturalContext;
    audioSamples?: Float32Array[];
    textSamples?: string[];
    behaviorData?: any;
  }): Promise<{
    needs: DetectedNeed[];
    culturalAdaptations: ContentAdaptation[];
    speechAnalysis?: RecognitionResult[];
    behaviorAnalysis?: BehaviorPattern;
    recommendations: LearningRecommendation[];
    textAnalysis?: TextAnalysis[];
  }> {
    return await this.modelManager.analyzeStudent(studentData);
  }

  /**
   * Detección de necesidades especiales usando TensorFlow.js
   */
  async detectNeedsWithML(learningPattern: LearningPattern): Promise<DetectedNeed[]> {
    return await this.modelManager.needsDetection.detectNeeds(learningPattern);
  }

  /**
   * Adaptación cultural de contenido usando TensorFlow.js
   */
  async adaptContentWithML(text: string, culturalContext: CulturalContext): Promise<ContentAdaptation> {
    return await this.modelManager.culturalAdaptation.adaptContent(text, culturalContext);
  }

  /**
   * Reconocimiento de voz usando TensorFlow.js
   */
  async recognizeSpeechWithML(audioBuffer: Float32Array, language: string = 'es-MX'): Promise<RecognitionResult> {
    return await this.modelManager.speechRecognition.recognizeSpeech(audioBuffer, language);
  }

  /**
   * Análisis de comportamiento usando TensorFlow.js
   */
  async analyzeBehaviorWithML(behaviorData: any): Promise<BehaviorPattern> {
    return await this.modelManager.auxiliary.analyzeBehavior(behaviorData);
  }

  /**
   * Generación de recomendaciones usando TensorFlow.js
   */
  async generateRecommendationsWithML(data: {
    needs: string[];
    behavior: BehaviorPattern;
    progress: number;
    preferences: string[];
    culturalContext: string;
    age: number;
    grade: number;
  }): Promise<LearningRecommendation[]> {
    return await this.modelManager.auxiliary.generateRecommendations(data);
  }

  /**
   * Análisis de texto usando TensorFlow.js
   */
  async analyzeTextWithML(text: string, culture: string): Promise<TextAnalysis> {
    return await this.modelManager.auxiliary.analyzeText(text, culture);
  }

  /**
   * Análisis de sentimientos usando TensorFlow.js
   */
  async analyzeSentimentWithML(text: string): Promise<{ sentiment: string; confidence: number }> {
    return await this.modelManager.auxiliary.analyzeSentiment(text);
  }

  // ===== SERVICIOS EXISTENTES =====

  /**
   * Chat con IA usando servicios existentes
   */
  async chat(message: string, context?: any): Promise<string> {
    return await this.chatbotService.chat(message, context);
  }

  /**
   * Reconocimiento de voz usando servicios existentes
   */
  async recognizeSpeech(audioData: any): Promise<string> {
    return await this.speechRecognitionService.recognizeSpeech(audioData);
  }

  /**
   * Detección de necesidades usando servicios existentes
   */
  async detectNeeds(studentData: any): Promise<any> {
    return await this.needsDetectionService.detectNeeds(studentData);
  }

  /**
   * Text-to-Speech usando servicios existentes
   */
  async textToSpeech(text: string, voice?: string): Promise<Buffer> {
    return await this.ttsService.synthesize(text, voice);
  }

  // ===== SERVICIOS HÍBRIDOS (COMBINAN MODELOS Y APIs) =====

  /**
   * Análisis híbrido que combina modelos locales con APIs externas
   */
  async hybridAnalysis(studentData: {
    interactionPattern: LearningPattern;
    culturalContext: CulturalContext;
    audioSamples?: Float32Array[];
    textSamples?: string[];
    behaviorData?: any;
  }): Promise<{
    mlResults: any;
    apiResults: any;
    combinedAnalysis: any;
  }> {
    console.log('🔄 Iniciando análisis híbrido...');
    
    try {
      // Análisis con modelos locales
      const mlResults = await this.analyzeStudentWithML(studentData);
      
      // Análisis con APIs externas
      const apiResults = await this.analyzeWithExternalAPIs(studentData);
      
      // Combinar resultados
      const combinedAnalysis = this.combineResults(mlResults, apiResults);
      
      return {
        mlResults,
        apiResults,
        combinedAnalysis
      };
    } catch (error) {
      console.error('❌ Error en análisis híbrido:', error);
      throw error;
    }
  }

  /**
   * Análisis usando APIs externas
   */
  private async analyzeWithExternalAPIs(studentData: any): Promise<any> {
    const results: any = {};
    
    try {
      // Análisis con Anthropic Claude
      if (studentData.textSamples && studentData.textSamples.length > 0) {
        const textAnalysis = await anthropic.messages.create({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: `Analiza el siguiente texto educativo y proporciona insights sobre:
            1. Dificultad del contenido
            2. Elementos culturales presentes
            3. Sugerencias de adaptación
            4. Recomendaciones pedagógicas
            
            Texto: ${studentData.textSamples.join('\n\n')}`
          }]
        });
        
        results.claudeAnalysis = textAnalysis.content[0].text;
      }
      
      // Análisis con OpenAI
      if (studentData.behaviorData) {
        const behaviorAnalysis = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [{
            role: 'user',
            content: `Analiza los siguientes datos de comportamiento estudiantil y proporciona recomendaciones:
            ${JSON.stringify(studentData.behaviorData, null, 2)}`
          }]
        });
        
        results.openaiAnalysis = behaviorAnalysis.choices[0].message.content;
      }
      
    } catch (error) {
      console.warn('⚠️ Error con APIs externas:', error);
      results.error = 'Error con APIs externas';
    }
    
    return results;
  }

  /**
   * Combina resultados de modelos locales y APIs externas
   */
  private combineResults(mlResults: any, apiResults: any): any {
    return {
      // Priorizar resultados de modelos locales para análisis técnico
      needs: mlResults.needs,
      culturalAdaptations: mlResults.culturalAdaptations,
      behaviorAnalysis: mlResults.behaviorAnalysis,
      recommendations: mlResults.recommendations,
      
      // Usar APIs externas para insights cualitativos
      qualitativeInsights: apiResults.claudeAnalysis,
      behaviorInsights: apiResults.openaiAnalysis,
      
      // Metadatos
      timestamp: new Date().toISOString(),
      sources: {
        localModels: true,
        externalAPIs: !apiResults.error
      }
    };
  }

  // ===== ENTRENAMIENTO Y GESTIÓN DE MODELOS =====

  /**
   * Entrena todos los modelos con datos proporcionados
   */
  async trainAllModels(trainingData: any): Promise<void> {
    await this.modelManager.trainAllModels(trainingData);
  }

  /**
   * Guarda todos los modelos entrenados
   */
  async saveAllModels(): Promise<void> {
    await this.modelManager.saveAllModels();
  }

  /**
   * Obtiene el estado de los modelos
   */
  getModelStatus(): any {
    return this.modelManager.getModelStatus();
  }

  // ===== UTILIDADES =====

  /**
   * Genera un reporte completo de diagnóstico
   */
  async generateDiagnosticReport(studentId: string, analysisResults: any): Promise<any> {
    return await this.modelManager.generateDiagnosticReport(studentId, analysisResults);
  }

  /**
   * Procesa contenido educativo completo
   */
  async processEducationalContent(content: {
    text: string;
    culturalContext: string;
    targetLanguage: string;
    difficulty: string;
  }): Promise<any> {
    return await this.modelManager.processEducationalContent(content);
  }

  /**
   * Análisis de voz en tiempo real
   */
  async analyzeRealTimeVoice(audioBuffer: Float32Array, language: string = 'es-MX'): Promise<any> {
    return await this.modelManager.analyzeRealTimeVoice(audioBuffer, language);
  }

  /**
   * Limpia recursos y cierra conexiones
   */
  async cleanup(): Promise<void> {
    console.log('🧹 Limpiando recursos de servicios de IA...');
    
    try {
      // Los modelos de TensorFlow.js se limpian automáticamente
      // Solo necesitamos limpiar servicios externos si es necesario
      
      console.log('✅ Recursos de servicios de IA limpiados');
    } catch (error) {
      console.error('❌ Error limpiando recursos:', error);
    }
  }
}

// Instancia singleton del servicio de IA
export const aiServices = new AIServices();

// Exportar tipos útiles
export type {
  LearningPattern,
  DetectedNeed,
  CulturalContext,
  ContentAdaptation,
  RecognitionResult,
  BehaviorPattern,
  LearningRecommendation,
  TextAnalysis
};

// Exportar servicios individuales para uso directo si es necesario
export { 
  aiModelManager,
  ChatbotService,
  SpeechRecognitionService,
  NeedsDetectionService,
  TTSService
};
