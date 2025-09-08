/**
 * Servicio de Detección de Emociones para InclusiveAI Coach
 * Analiza texto, voz y comportamiento para identificar estados emocionales
 */

import { tensorFlowService } from './tensorflow-service';
import { voiceService } from './voice-service';

// Tipos para el servicio de emociones
export interface EmotionConfig {
  enableTextAnalysis: boolean;
  enableVoiceAnalysis: boolean;
  enableBehaviorAnalysis: boolean;
  confidenceThreshold: number;
  culturalContext: string;
  language: string;
}

export interface EmotionResult {
  primaryEmotion: Emotion;
  secondaryEmotions: Emotion[];
  confidence: number;
  intensity: number;
  timestamp: Date;
  source: 'text' | 'voice' | 'behavior' | 'combined';
  metadata: EmotionMetadata;
}

export interface Emotion {
  name: string;
  category: EmotionCategory;
  intensity: number; // 0-1
  confidence: number; // 0-1
  culturalContext?: string;
}

export type EmotionCategory = 
  | 'positive' 
  | 'negative' 
  | 'neutral' 
  | 'mixed';

export interface EmotionMetadata {
  textFeatures?: TextEmotionFeatures;
  voiceFeatures?: VoiceEmotionFeatures;
  behaviorFeatures?: BehaviorEmotionFeatures;
  culturalAdaptation?: CulturalEmotionAdaptation;
}

export interface TextEmotionFeatures {
  sentiment: number; // -1 to 1
  arousal: number; // 0-1
  valence: number; // 0-1
  dominance: number; // 0-1
  keywords: string[];
  language: string;
}

export interface VoiceEmotionFeatures {
  pitch: number;
  volume: number;
  speakingRate: number;
  voiceQuality: number;
  prosody: ProsodyFeatures;
}

export interface ProsodyFeatures {
  intonation: number;
  rhythm: number;
  stress: number;
  pausePatterns: number[];
}

export interface BehaviorEmotionFeatures {
  attention: number;
  engagement: number;
  frustration: number;
  motivation: number;
  interactionPattern: string;
}

export interface CulturalEmotionAdaptation {
  culturalContext: string;
  adaptedEmotions: Emotion[];
  culturalFactors: string[];
  adaptationConfidence: number;
}

export interface EmotionHistory {
  emotions: EmotionResult[];
  trends: EmotionTrend[];
  patterns: EmotionPattern[];
}

export interface EmotionTrend {
  emotion: string;
  direction: 'increasing' | 'decreasing' | 'stable';
  rate: number;
  duration: number;
}

export interface EmotionPattern {
  pattern: string;
  frequency: number;
  triggers: string[];
  impact: number;
}

/**
 * Servicio principal de detección de emociones
 */
export class EmotionService {
  private config: EmotionConfig;
  private emotionModel: any = null;
  private isInitialized: boolean = false;
  private emotionHistory: EmotionResult[] = [];
  private culturalEmotionMappings: Map<string, Map<string, string>> = new Map();

  constructor(config: Partial<EmotionConfig> = {}) {
    this.config = {
      enableTextAnalysis: true,
      enableVoiceAnalysis: true,
      enableBehaviorAnalysis: true,
      confidenceThreshold: 0.7,
      culturalContext: 'mexican',
      language: 'es-MX',
      ...config
    };

    this.initializeEmotionService();
  }

  /**
   * Inicializa el servicio de emociones
   */
  private async initializeEmotionService(): Promise<void> {
    try {
      console.log('😊 Inicializando servicio de detección de emociones...');

      // Cargar modelo de emociones
      await this.loadEmotionModel();

      // Configurar mapeos culturales de emociones
      this.setupCulturalEmotionMappings();

      this.isInitialized = true;
      console.log('✅ Servicio de emociones inicializado correctamente');
    } catch (error) {
      console.error('❌ Error inicializando servicio de emociones:', error);
      throw error;
    }
  }

  /**
   * Carga el modelo de detección de emociones
   */
  private async loadEmotionModel(): Promise<void> {
    try {
      console.log('📥 Cargando modelo de emociones...');

      // Crear modelo de clasificación de emociones
      this.emotionModel = await tensorFlowService.createClassificationModel(
        [100], // input shape para características de texto
        7,     // 7 emociones básicas: alegría, tristeza, enojo, miedo, sorpresa, disgusto, neutral
        'emotion_classifier'
      );

      console.log('✅ Modelo de emociones cargado');
    } catch (error) {
      console.error('❌ Error cargando modelo de emociones:', error);
      throw error;
    }
  }

  /**
   * Configura mapeos culturales de emociones
   */
  private setupCulturalEmotionMappings(): void {
    // Mapeos para diferentes culturas
    const mappings = {
      mexican: {
        'alegría': 'joy',
        'tristeza': 'sadness',
        'enojo': 'anger',
        'miedo': 'fear',
        'sorpresa': 'surprise',
        'disgusto': 'disgust',
        'orgullo': 'pride',
        'vergüenza': 'shame'
      },
      maya: {
        "k'ux": "joy",
        "ch'u": "sadness",
        "k'as": "anger",
        "xib": "fear",
        "ch'up": "surprise",
        "tz'ak": "disgust"
      },
      nahuatl: {
        "pāqui": "joy",
        "chōca": "sadness",
        "pīya": "anger",
        "mā": "fear",
        "tlamī": "surprise",
        "cualāni": "disgust"
      }
    };

    Object.entries(mappings).forEach(([culture, mapping]) => {
      this.culturalEmotionMappings.set(culture, new Map(Object.entries(mapping)));
    });
  }

  /**
   * Verifica si el servicio está listo
   */
  isReady(): boolean {
    return this.isInitialized && this.emotionModel !== null;
  }

  /**
   * Analiza emociones en texto
   */
  async analyzeTextEmotions(text: string): Promise<EmotionResult> {
    if (!this.isReady()) {
      throw new Error('Servicio de emociones no está inicializado');
    }

    try {
      console.log('📝 Analizando emociones en texto...');

      // Preprocesar texto
      const textTensor = tensorFlowService.preprocessText(text);
      
      // Extraer características de texto
      const textFeatures = await this.extractTextFeatures(text);
      
      // Realizar predicción
      const prediction = await tensorFlowService.predict('emotion_classifier', textTensor);
      
      // Interpretar resultados
      const emotions = this.interpretEmotionPrediction(prediction.predictions);
      
      // Adaptar a contexto cultural
      const culturalAdaptation = await this.adaptEmotionsToCulture(emotions);

      const result: EmotionResult = {
        primaryEmotion: emotions[0],
        secondaryEmotions: emotions.slice(1, 3),
        confidence: prediction.confidence,
        intensity: this.calculateEmotionIntensity(emotions),
        timestamp: new Date(),
        source: 'text',
        metadata: {
          textFeatures,
          culturalAdaptation
        }
      };

      // Guardar en historial
      this.emotionHistory.push(result);

      console.log(`✅ Emociones detectadas: ${result.primaryEmotion.name} (${result.confidence})`);
      return result;
    } catch (error) {
      console.error('❌ Error analizando emociones en texto:', error);
      throw error;
    }
  }

  /**
   * Analiza emociones en voz
   */
  async analyzeVoiceEmotions(audioBuffer: Float32Array): Promise<EmotionResult> {
    if (!this.isReady()) {
      throw new Error('Servicio de emociones no está inicializado');
    }

    try {
      console.log('🎤 Analizando emociones en voz...');

      // Analizar características de voz
      const voiceAnalysis = await voiceService.analyzeAudio(audioBuffer);
      const voiceFeatures = this.extractVoiceFeatures(voiceAnalysis);
      
      // Convertir características a tensor
      const voiceTensor = this.createVoiceEmotionTensor(voiceFeatures);
      
      // Realizar predicción
      const prediction = await tensorFlowService.predict('emotion_classifier', voiceTensor);
      
      // Interpretar resultados
      const emotions = this.interpretEmotionPrediction(prediction.predictions);
      
      // Adaptar a contexto cultural
      const culturalAdaptation = await this.adaptEmotionsToCulture(emotions);

      const result: EmotionResult = {
        primaryEmotion: emotions[0],
        secondaryEmotions: emotions.slice(1, 3),
        confidence: prediction.confidence,
        intensity: this.calculateEmotionIntensity(emotions),
        timestamp: new Date(),
        source: 'voice',
        metadata: {
          voiceFeatures,
          culturalAdaptation
        }
      };

      // Guardar en historial
      this.emotionHistory.push(result);

      console.log(`✅ Emociones detectadas en voz: ${result.primaryEmotion.name} (${result.confidence})`);
      return result;
    } catch (error) {
      console.error('❌ Error analizando emociones en voz:', error);
      throw error;
    }
  }

  /**
   * Analiza emociones en comportamiento
   */
  async analyzeBehaviorEmotions(behaviorData: any): Promise<EmotionResult> {
    if (!this.isReady()) {
      throw new Error('Servicio de emociones no está inicializado');
    }

    try {
      console.log('👤 Analizando emociones en comportamiento...');

      // Extraer características de comportamiento
      const behaviorFeatures = this.extractBehaviorFeatures(behaviorData);
      
      // Convertir a tensor
      const behaviorTensor = tensorFlowService.preprocessBehaviorData([behaviorData]);
      
      // Realizar predicción
      const prediction = await tensorFlowService.predict('emotion_classifier', behaviorTensor);
      
      // Interpretar resultados
      const emotions = this.interpretEmotionPrediction(prediction.predictions);
      
      // Adaptar a contexto cultural
      const culturalAdaptation = await this.adaptEmotionsToCulture(emotions);

      const result: EmotionResult = {
        primaryEmotion: emotions[0],
        secondaryEmotions: emotions.slice(1, 3),
        confidence: prediction.confidence,
        intensity: this.calculateEmotionIntensity(emotions),
        timestamp: new Date(),
        source: 'behavior',
        metadata: {
          behaviorFeatures,
          culturalAdaptation
        }
      };

      // Guardar en historial
      this.emotionHistory.push(result);

      console.log(`✅ Emociones detectadas en comportamiento: ${result.primaryEmotion.name} (${result.confidence})`);
      return result;
    } catch (error) {
      console.error('❌ Error analizando emociones en comportamiento:', error);
      throw error;
    }
  }

  /**
   * Análisis combinado de emociones
   */
  async analyzeCombinedEmotions(data: {
    text?: string;
    audioBuffer?: Float32Array;
    behaviorData?: any;
  }): Promise<EmotionResult> {
    if (!this.isReady()) {
      throw new Error('Servicio de emociones no está inicializado');
    }

    try {
      console.log('🔄 Analizando emociones combinadas...');

      const results: EmotionResult[] = [];

      // Analizar cada fuente disponible
      if (data.text && this.config.enableTextAnalysis) {
        results.push(await this.analyzeTextEmotions(data.text));
      }

      if (data.audioBuffer && this.config.enableVoiceAnalysis) {
        results.push(await this.analyzeVoiceEmotions(data.audioBuffer));
      }

      if (data.behaviorData && this.config.enableBehaviorAnalysis) {
        results.push(await this.analyzeBehaviorEmotions(data.behaviorData));
      }

      // Combinar resultados
      const combinedResult = this.combineEmotionResults(results);

      console.log(`✅ Análisis combinado completado: ${combinedResult.primaryEmotion.name}`);
      return combinedResult;
    } catch (error) {
      console.error('❌ Error en análisis combinado de emociones:', error);
      throw error;
    }
  }

  /**
   * Extrae características de texto
   */
  private async extractTextFeatures(text: string): Promise<TextEmotionFeatures> {
    // Análisis de sentimientos básico
    const sentiment = this.calculateSentiment(text);
    
    // Análisis de arousal y valence
    const arousal = this.calculateArousal(text);
    const valence = this.calculateValence(text);
    const dominance = this.calculateDominance(text);
    
    // Extraer palabras clave emocionales
    const keywords = this.extractEmotionKeywords(text);

    return {
      sentiment,
      arousal,
      valence,
      dominance,
      keywords,
      language: this.config.language
    };
  }

  /**
   * Extrae características de voz
   */
  private extractVoiceFeatures(voiceAnalysis: any): VoiceEmotionFeatures {
    return {
      pitch: voiceAnalysis.frequency,
      volume: voiceAnalysis.volume,
      speakingRate: this.calculateSpeakingRate(voiceAnalysis),
      voiceQuality: voiceAnalysis.clarity,
      prosody: {
        intonation: this.calculateIntonation(voiceAnalysis),
        rhythm: this.calculateRhythm(voiceAnalysis),
        stress: this.calculateStress(voiceAnalysis),
        pausePatterns: this.extractPausePatterns(voiceAnalysis)
      }
    };
  }

  /**
   * Extrae características de comportamiento
   */
  private extractBehaviorFeatures(behaviorData: any): BehaviorEmotionFeatures {
    return {
      attention: behaviorData.attention || 0,
      engagement: behaviorData.engagement || 0,
      frustration: this.calculateFrustration(behaviorData),
      motivation: this.calculateMotivation(behaviorData),
      interactionPattern: this.classifyInteractionPattern(behaviorData)
    };
  }

  /**
   * Crea tensor para análisis de voz
   */
  private createVoiceEmotionTensor(voiceFeatures: VoiceEmotionFeatures): any {
    const features = [
      voiceFeatures.pitch,
      voiceFeatures.volume,
      voiceFeatures.speakingRate,
      voiceFeatures.voiceQuality,
      voiceFeatures.prosody.intonation,
      voiceFeatures.prosody.rhythm,
      voiceFeatures.prosody.stress
    ];
    
    return tensorFlowService.preprocessAudio(new Float32Array(features));
  }

  /**
   * Interpreta predicción de emociones
   */
  private interpretEmotionPrediction(predictions: any): Emotion[] {
    const emotionNames = ['alegría', 'tristeza', 'enojo', 'miedo', 'sorpresa', 'disgusto', 'neutral'];
    const emotionCategories: EmotionCategory[] = ['positive', 'negative', 'negative', 'negative', 'neutral', 'negative', 'neutral'];
    
    const predictionData = Array.from(predictions.data());
    const emotions: Emotion[] = [];
    
    predictionData.forEach((confidence, index) => {
      if (confidence > this.config.confidenceThreshold) {
        emotions.push({
          name: emotionNames[index],
          category: emotionCategories[index],
          intensity: confidence,
          confidence: confidence,
          culturalContext: this.config.culturalContext
        });
      }
    });
    
    // Ordenar por confianza
    return emotions.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Adapta emociones al contexto cultural
   */
  private async adaptEmotionsToCulture(emotions: Emotion[]): Promise<CulturalEmotionAdaptation> {
    const culturalMapping = this.culturalEmotionMappings.get(this.config.culturalContext);
    const adaptedEmotions: Emotion[] = [];
    const culturalFactors: string[] = [];
    
    emotions.forEach(emotion => {
      if (culturalMapping && culturalMapping.has(emotion.name)) {
        const adaptedName = culturalMapping.get(emotion.name)!;
        adaptedEmotions.push({
          ...emotion,
          name: adaptedName
        });
        culturalFactors.push(`Adaptación de ${emotion.name} a ${adaptedName}`);
      } else {
        adaptedEmotions.push(emotion);
      }
    });
    
    return {
      culturalContext: this.config.culturalContext,
      adaptedEmotions,
      culturalFactors,
      adaptationConfidence: culturalMapping ? 0.8 : 0.5
    };
  }

  /**
   * Combina resultados de múltiples fuentes
   */
  private combineEmotionResults(results: EmotionResult[]): EmotionResult {
    if (results.length === 0) {
      throw new Error('No hay resultados para combinar');
    }

    if (results.length === 1) {
      return results[0];
    }

    // Calcular emociones combinadas
    const emotionScores = new Map<string, { total: number; count: number; confidences: number[] }>();
    
    results.forEach(result => {
      const emotion = result.primaryEmotion.name;
      if (!emotionScores.has(emotion)) {
        emotionScores.set(emotion, { total: 0, count: 0, confidences: [] });
      }
      
      const score = emotionScores.get(emotion)!;
      score.total += result.intensity * result.confidence;
      score.count += 1;
      score.confidences.push(result.confidence);
    });

    // Encontrar emoción dominante
    let primaryEmotion: Emotion | null = null;
    let maxScore = 0;

    emotionScores.forEach((score, emotionName) => {
      const avgScore = score.total / score.count;
      const avgConfidence = score.confidences.reduce((a, b) => a + b, 0) / score.confidences.length;
      
      if (avgScore > maxScore) {
        maxScore = avgScore;
        primaryEmotion = {
          name: emotionName,
          category: this.getEmotionCategory(emotionName),
          intensity: avgScore,
          confidence: avgConfidence,
          culturalContext: this.config.culturalContext
        };
      }
    });

    if (!primaryEmotion) {
      primaryEmotion = {
        name: 'neutral',
        category: 'neutral',
        intensity: 0.5,
        confidence: 0.5,
        culturalContext: this.config.culturalContext
      };
    }

    return {
      primaryEmotion,
      secondaryEmotions: [],
      confidence: primaryEmotion.confidence,
      intensity: primaryEmotion.intensity,
      timestamp: new Date(),
      source: 'combined',
      metadata: {
        culturalAdaptation: {
          culturalContext: this.config.culturalContext,
          adaptedEmotions: [primaryEmotion],
          culturalFactors: ['Combinación de múltiples fuentes'],
          adaptationConfidence: 0.9
        }
      }
    };
  }

  /**
   * Calcula intensidad de emoción
   */
  private calculateEmotionIntensity(emotions: Emotion[]): number {
    if (emotions.length === 0) return 0;
    
    const primaryEmotion = emotions[0];
    return primaryEmotion.intensity * primaryEmotion.confidence;
  }

  /**
   * Calcula sentimiento del texto
   */
  private calculateSentiment(text: string): number {
    const positiveWords = ['feliz', 'alegre', 'contento', 'excelente', 'maravilloso', 'genial'];
    const negativeWords = ['triste', 'enojado', 'molesto', 'terrible', 'horrible', 'malo'];
    
    const words = text.toLowerCase().split(/\s+/);
    let positiveCount = 0;
    let negativeCount = 0;
    
    words.forEach(word => {
      if (positiveWords.includes(word)) positiveCount++;
      if (negativeWords.includes(word)) negativeCount++;
    });
    
    const total = words.length;
    if (total === 0) return 0;
    
    return (positiveCount - negativeCount) / total;
  }

  /**
   * Calcula arousal (activación)
   */
  private calculateArousal(text: string): number {
    const highArousalWords = ['excitado', 'energético', 'emocionado', 'furioso', 'aterrado'];
    const lowArousalWords = ['calmado', 'tranquilo', 'relajado', 'aburrido', 'cansado'];
    
    const words = text.toLowerCase().split(/\s+/);
    let highCount = 0;
    let lowCount = 0;
    
    words.forEach(word => {
      if (highArousalWords.includes(word)) highCount++;
      if (lowArousalWords.includes(word)) lowCount++;
    });
    
    const total = words.length;
    if (total === 0) return 0.5;
    
    return (highCount - lowCount) / total + 0.5;
  }

  /**
   * Calcula valence (valencia)
   */
  private calculateValence(text: string): number {
    return this.calculateSentiment(text) * 0.5 + 0.5;
  }

  /**
   * Calcula dominance (dominancia)
   */
  private calculateDominance(text: string): number {
    const dominantWords = ['poderoso', 'fuerte', 'confiado', 'seguro'];
    const submissiveWords = ['débil', 'inseguro', 'temeroso', 'sumiso'];
    
    const words = text.toLowerCase().split(/\s+/);
    let dominantCount = 0;
    let submissiveCount = 0;
    
    words.forEach(word => {
      if (dominantWords.includes(word)) dominantCount++;
      if (submissiveWords.includes(word)) submissiveCount++;
    });
    
    const total = words.length;
    if (total === 0) return 0.5;
    
    return (dominantCount - submissiveCount) / total + 0.5;
  }

  /**
   * Extrae palabras clave emocionales
   */
  private extractEmotionKeywords(text: string): string[] {
    const emotionKeywords = [
      'feliz', 'triste', 'enojado', 'miedo', 'sorpresa', 'disgusto',
      'alegre', 'contento', 'molesto', 'aterrado', 'asombrado', 'repugnado'
    ];
    
    const words = text.toLowerCase().split(/\s+/);
    return words.filter(word => emotionKeywords.includes(word));
  }

  /**
   * Calcula tasa de habla
   */
  private calculateSpeakingRate(voiceAnalysis: any): number {
    // Implementación simplificada
    return voiceAnalysis.duration > 0 ? 1 / voiceAnalysis.duration : 1;
  }

  /**
   * Calcula entonación
   */
  private calculateIntonation(voiceAnalysis: any): number {
    // Implementación simplificada
    return voiceAnalysis.features.spectralCentroid / 2000;
  }

  /**
   * Calcula ritmo
   */
  private calculateRhythm(voiceAnalysis: any): number {
    // Implementación simplificada
    return voiceAnalysis.features.zeroCrossingRate;
  }

  /**
   * Calcula estrés
   */
  private calculateStress(voiceAnalysis: any): number {
    // Implementación simplificada
    return voiceAnalysis.volume;
  }

  /**
   * Extrae patrones de pausa
   */
  private extractPausePatterns(voiceAnalysis: any): number[] {
    // Implementación simplificada
    return [0.1, 0.2, 0.1];
  }

  /**
   * Calcula frustración
   */
  private calculateFrustration(behaviorData: any): number {
    return behaviorData.errors ? behaviorData.errors / 10 : 0;
  }

  /**
   * Calcula motivación
   */
  private calculateMotivation(behaviorData: any): number {
    return behaviorData.progress ? behaviorData.progress / 100 : 0.5;
  }

  /**
   * Clasifica patrón de interacción
   */
  private classifyInteractionPattern(behaviorData: any): string {
    if (behaviorData.attention > 0.8 && behaviorData.engagement > 0.8) {
      return 'muy_activo';
    } else if (behaviorData.attention > 0.6 && behaviorData.engagement > 0.6) {
      return 'activo';
    } else if (behaviorData.attention > 0.4 && behaviorData.engagement > 0.4) {
      return 'moderado';
    } else {
      return 'pasivo';
    }
  }

  /**
   * Obtiene categoría de emoción
   */
  private getEmotionCategory(emotionName: string): EmotionCategory {
    const positiveEmotions = ['alegría', 'felicidad', 'contento'];
    const negativeEmotions = ['tristeza', 'enojo', 'miedo', 'disgusto'];
    const neutralEmotions = ['neutral', 'sorpresa'];
    
    if (positiveEmotions.includes(emotionName)) return 'positive';
    if (negativeEmotions.includes(emotionName)) return 'negative';
    if (neutralEmotions.includes(emotionName)) return 'neutral';
    
    return 'mixed';
  }

  /**
   * Obtiene historial de emociones
   */
  getEmotionHistory(): EmotionHistory {
    const trends = this.calculateEmotionTrends();
    const patterns = this.detectEmotionPatterns();
    
    return {
      emotions: [...this.emotionHistory],
      trends,
      patterns
    };
  }

  /**
   * Calcula tendencias de emociones
   */
  private calculateEmotionTrends(): EmotionTrend[] {
    // Implementación simplificada
    return [];
  }

  /**
   * Detecta patrones de emociones
   */
  private detectEmotionPatterns(): EmotionPattern[] {
    // Implementación simplificada
    return [];
  }

  /**
   * Obtiene el estado del servicio
   */
  getStatus(): {
    isReady: boolean;
    config: EmotionConfig;
    historySize: number;
  } {
    return {
      isReady: this.isReady(),
      config: this.config,
      historySize: this.emotionHistory.length
    };
  }

  /**
   * Actualiza la configuración
   */
  updateConfig(newConfig: Partial<EmotionConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('⚙️ Configuración de emociones actualizada:', this.config);
  }

  /**
   * Limpia recursos
   */
  async cleanup(): Promise<void> {
    try {
      console.log('🧹 Limpiando recursos del servicio de emociones...');
      
      // Limpiar historial
      this.emotionHistory = [];
      
      // Limpiar modelo si es necesario
      if (this.emotionModel) {
        await tensorFlowService.disposeModel('emotion_classifier');
        this.emotionModel = null;
      }
      
      console.log('✅ Recursos del servicio de emociones limpiados');
    } catch (error) {
      console.error('❌ Error limpiando recursos:', error);
    }
  }
}

// Instancia singleton del servicio
export const emotionService = new EmotionService();

// Exportar tipos útiles
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
};
