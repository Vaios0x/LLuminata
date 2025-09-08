/**
 * Índice de Servicios de IA, Analytics y Seguridad para InclusiveAI Coach
 * Exporta todos los servicios especializados
 */

// Servicios de IA
export { tensorFlowService, TensorFlowService } from './tensorflow-service';
export { voiceService, VoiceService } from './voice-service';
export { emotionService, EmotionService } from './emotion-service';
export { attentionService, AttentionService } from './attention-service';
export { culturalService, CulturalService } from './cultural-service';

// Servicios de Analytics
export { heatmapService, HeatmapService } from './heatmap-service';
export { predictionService, PredictionService } from './prediction-service';
export { abTestingService, ABTestingService } from './ab-testing-service';
export { realTimeService, RealTimeService } from './real-time-service';
export { exportService, ExportService } from './export-service';

// Servicios de Seguridad
export { securityAuditService, SecurityAuditService } from './security-audit-service';
export { rateLimitService, RateLimitService } from './rate-limit-service';
export { csrfService, CSRFService } from './csrf-service';
export { inputValidationService, InputValidationService } from './input-validation-service';
export { privacyService, PrivacyService } from './privacy-service';

// Tipos de TensorFlow
export type {
  ModelConfig,
  TrainingData,
  PredictionResult,
  ModelStatus
} from './tensorflow-service';

// Tipos de Voz
export type {
  VoiceConfig,
  SpeechRecognitionResult,
  SpeechSegment,
  VoiceSynthesisOptions,
  AudioAnalysis,
  AudioFeatures,
  VoiceCommand
} from './voice-service';

// Tipos de Emociones
export type {
  EmotionConfig,
  EmotionResult,
  Emotion,
  EmotionCategory,
  EmotionMetadata,
  TextEmotionFeatures,
  VoiceEmotionFeatures,
  BehaviorEmotionFeatures,
  CulturalEmotionAdaptation,
  EmotionHistory,
  EmotionTrend,
  EmotionPattern
} from './emotion-service';

// Tipos de Atención
export type {
  AttentionConfig,
  AttentionData,
  FocusArea,
  Distraction,
  AttentionMetrics,
  AttentionSession,
  AttentionSummary,
  AttentionInsight,
  AttentionAlert
} from './attention-service';

// Tipos Culturales
export type {
  CulturalConfig,
  CulturalContext,
  ContentAdaptation,
  CulturalChange,
  AdaptationMetadata,
  AdaptationRevision,
  CulturalInsight,
  LanguageMapping,
  MappingRule,
  CulturalAssessment,
  CulturalLearningPath,
  LearningStage,
  CulturalMilestone,
  AdaptiveElement,
  AdaptationRule
} from './cultural-service';

// Tipos de Analytics
export type {
  HeatmapConfig,
  HeatmapData,
  HeatmapSession,
  HeatmapAnalysis,
  HeatmapStats,
  HeatmapAlert
} from './heatmap-service';

export type {
  PredictionConfig,
  PredictionModel,
  PredictionData,
  PredictionResult as PredictionServiceResult,
  ModelMetrics,
  PredictionAlert
} from './prediction-service';

export type {
  ABTestConfig,
  ABTest,
  ABTestVariant,
  ABTestResult,
  ABTestStats,
  ABTestAlert
} from './ab-testing-service';

export type {
  RealTimeConfig,
  RealTimeMetric,
  RealTimeEvent,
  RealTimeConnection,
  RealTimeSubscription,
  RealTimeDashboard,
  RealTimeAlert
} from './real-time-service';

export type {
  ExportConfig,
  ExportJob,
  ExportTemplate,
  ExportFormat,
  ExportStats,
  ExportAlert
} from './export-service';

// Tipos de Seguridad
export type {
  SecurityAuditConfig,
  SecurityEvent,
  SecurityScan,
  SecurityCompliance,
  SecurityAlert,
  SecurityReport
} from './security-audit-service';

export type {
  RateLimitConfig,
  RateLimitRule,
  RateLimitRequest,
  RateLimitBucket,
  RateLimitStats,
  RateLimitAlert
} from './rate-limit-service';

export type {
  CSRFConfig,
  CSRFToken,
  CSRFValidationResult,
  CSRFStats,
  CSRFAlert,
  CSRFRequest
} from './csrf-service';

export type {
  ValidationConfig,
  ValidationRule,
  ValidationResult,
  ValidationError,
  ValidationStats,
  ValidationAlert
} from './input-validation-service';

export type {
  PrivacyConfig,
  PrivacyConsent,
  PrivacyRequest,
  DataInventory,
  PrivacyAudit,
  PrivacyStats,
  PrivacyAlert
} from './privacy-service';

/**
 * Gestor unificado de servicios de IA, Analytics y Seguridad
 * Proporciona una interfaz centralizada para todos los servicios
 */
export class AIServicesManager {
  private services: {
    // Servicios de IA
    tensorFlow: typeof tensorFlowService;
    voice: typeof voiceService;
    emotion: typeof emotionService;
    attention: typeof attentionService;
    cultural: typeof culturalService;
    // Servicios de Analytics
    heatmap: typeof heatmapService;
    prediction: typeof predictionService;
    abTesting: typeof abTestingService;
    realTime: typeof realTimeService;
    export: typeof exportService;
    // Servicios de Seguridad
    securityAudit: typeof securityAuditService;
    rateLimit: typeof rateLimitService;
    csrf: typeof csrfService;
    inputValidation: typeof inputValidationService;
    privacy: typeof privacyService;
  };

  constructor() {
    this.services = {
      // Servicios de IA
      tensorFlow: tensorFlowService,
      voice: voiceService,
      emotion: emotionService,
      attention: attentionService,
      cultural: culturalService,
      // Servicios de Analytics
      heatmap: heatmapService,
      prediction: predictionService,
      abTesting: abTestingService,
      realTime: realTimeService,
      export: exportService,
      // Servicios de Seguridad
      securityAudit: securityAuditService,
      rateLimit: rateLimitService,
      csrf: csrfService,
      inputValidation: inputValidationService,
      privacy: privacyService
    };
  }

  /**
   * Inicializa todos los servicios de IA
   */
  async initialize(): Promise<void> {
    console.log('🚀 Inicializando gestor de servicios de IA...');

    try {
      // Los servicios se inicializan automáticamente en sus constructores
      // Solo necesitamos esperar a que estén listos

      let attempts = 0;
      const maxAttempts = 30; // 30 segundos máximo

      while (!this.isReady() && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        attempts++;
      }

      if (this.isReady()) {
        console.log('✅ Todos los servicios de IA inicializados correctamente');
      } else {
        throw new Error('Timeout inicializando servicios de IA');
      }
    } catch (error) {
      console.error('❌ Error inicializando servicios de IA:', error);
      throw error;
    }
  }

  /**
   * Verifica si todos los servicios están listos
   */
  isReady(): boolean {
    return this.services.tensorFlow.isReady() &&
           this.services.voice.isReady() &&
           this.services.emotion.isReady() &&
           this.services.attention.isReady() &&
           this.services.cultural.isReady() &&
           this.services.heatmap.getStatus().isInitialized &&
           this.services.prediction.getStatus().isInitialized &&
           this.services.abTesting.getStatus().isInitialized &&
           this.services.realTime.getStatus().isInitialized &&
           this.services.export.getStatus().isInitialized &&
           this.services.securityAudit.getStatus().isInitialized &&
           this.services.rateLimit.getStatus().isInitialized &&
           this.services.csrf.getStatus().isInitialized &&
           this.services.inputValidation.getStatus().isInitialized &&
           this.services.privacy.getStatus().isInitialized;
  }

  /**
   * Obtiene el estado de todos los servicios
   */
  getStatus(): {
    // Servicios de IA
    tensorFlow: boolean;
    voice: boolean;
    emotion: boolean;
    attention: boolean;
    cultural: boolean;
    // Servicios de Analytics
    heatmap: boolean;
    prediction: boolean;
    abTesting: boolean;
    realTime: boolean;
    export: boolean;
    // Servicios de Seguridad
    securityAudit: boolean;
    rateLimit: boolean;
    csrf: boolean;
    inputValidation: boolean;
    privacy: boolean;
    overall: boolean;
  } {
    return {
      // Servicios de IA
      tensorFlow: this.services.tensorFlow.isReady(),
      voice: this.services.voice.isReady(),
      emotion: this.services.emotion.isReady(),
      attention: this.services.attention.isReady(),
      cultural: this.services.cultural.isReady(),
      // Servicios de Analytics
      heatmap: this.services.heatmap.getStatus().isInitialized,
      prediction: this.services.prediction.getStatus().isInitialized,
      abTesting: this.services.abTesting.getStatus().isInitialized,
      realTime: this.services.realTime.getStatus().isInitialized,
      export: this.services.export.getStatus().isInitialized,
      // Servicios de Seguridad
      securityAudit: this.services.securityAudit.getStatus().isInitialized,
      rateLimit: this.services.rateLimit.getStatus().isInitialized,
      csrf: this.services.csrf.getStatus().isInitialized,
      inputValidation: this.services.inputValidation.getStatus().isInitialized,
      privacy: this.services.privacy.getStatus().isInitialized,
      overall: this.isReady()
    };
  }

  /**
   * Obtiene un servicio específico
   */
  getService<T extends keyof typeof this.services>(serviceName: T): typeof this.services[T] {
    return this.services[serviceName];
  }

  /**
   * Ejecuta análisis completo usando todos los servicios
   */
  async performCompleteAnalysis(data: {
    text?: string;
    audioBuffer?: Float32Array;
    behaviorData?: any;
    culturalContext?: any;
  }): Promise<{
    emotions: any;
    attention: any;
    cultural: any;
    voice: any;
    ml: any;
  }> {
    if (!this.isReady()) {
      throw new Error('Servicios de IA no están inicializados');
    }

    try {
      console.log('🔍 Realizando análisis completo...');

      const results: any = {};

      // Análisis de emociones
      if (data.text || data.audioBuffer || data.behaviorData) {
        results.emotions = await this.services.emotion.analyzeCombinedEmotions({
          text: data.text,
          audioBuffer: data.audioBuffer,
          behaviorData: data.behaviorData
        });
      }

      // Análisis de atención
      if (data.behaviorData) {
        results.attention = await this.services.attention.analyzeBehaviorEmotions(data.behaviorData);
      }

      // Análisis cultural
      if (data.text && data.culturalContext) {
        results.cultural = await this.services.cultural.adaptContent(data.text, data.culturalContext);
      }

      // Análisis de voz
      if (data.audioBuffer) {
        results.voice = await this.services.voice.analyzeAudio(data.audioBuffer);
      }

      // Análisis con TensorFlow.js
      if (data.behaviorData) {
        const behaviorTensor = this.services.tensorFlow.preprocessBehaviorData([data.behaviorData]);
        results.ml = await this.services.tensorFlow.predict('emotion_classifier', behaviorTensor);
      }

      console.log('✅ Análisis completo finalizado');
      return results;
    } catch (error) {
      console.error('❌ Error en análisis completo:', error);
      throw error;
    }
  }

  /**
   * Limpia todos los servicios
   */
  async cleanup(): Promise<void> {
    console.log('🧹 Limpiando todos los servicios...');

    try {
      await Promise.all([
        // Servicios de IA
        this.services.tensorFlow.cleanup(),
        this.services.voice.cleanup(),
        this.services.emotion.cleanup(),
        this.services.attention.cleanup(),
        this.services.cultural.cleanup(),
        // Servicios de Analytics
        this.services.heatmap.cleanup(),
        this.services.prediction.cleanup(),
        this.services.abTesting.cleanup(),
        this.services.realTime.cleanup(),
        this.services.export.cleanup(),
        // Servicios de Seguridad
        this.services.securityAudit.cleanup(),
        this.services.rateLimit.cleanup(),
        this.services.csrf.cleanup(),
        this.services.inputValidation.cleanup(),
        this.services.privacy.cleanup()
      ]);

      console.log('✅ Todos los servicios limpiados');
    } catch (error) {
      console.error('❌ Error limpiando servicios:', error);
    }
  }
}

// Instancia singleton del gestor
export const aiServicesManager = new AIServicesManager();

// Exportar el gestor como servicio principal
export default aiServicesManager;
