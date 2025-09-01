import * as tf from '@tensorflow/tfjs';
import { loadLayersModel, LayersModel } from '@tensorflow/tfjs-layers';

export interface TextAnalysis {
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
  topics: string[];
  culturalElements: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  readingLevel: number;
  keywords: string[];
}

export interface BehaviorPattern {
  engagement: number;           // Nivel de engagement (0-1)
  attention: number;            // Nivel de atención (0-1)
  frustration: number;          // Nivel de frustración (0-1)
  confidence: number;           // Nivel de confianza (0-1)
  motivation: number;           // Nivel de motivación (0-1)
  patterns: string[];           // Patrones detectados
  recommendations: string[];    // Recomendaciones
}

export interface LearningRecommendation {
  type: 'content' | 'activity' | 'support' | 'assessment';
  priority: 'low' | 'medium' | 'high';
  confidence: number;
  description: string;
  culturalContext: string;
  accessibility: string[];
  estimatedTime: number;
}

export class AuxiliaryModels {
  private sentimentModel: LayersModel | null = null;
  private behaviorModel: LayersModel | null = null;
  private recommendationModel: LayersModel | null = null;
  private textAnalysisModel: LayersModel | null = null;
  
  private isLoaded: boolean = false;
  private readonly modelPaths = {
    sentiment: '/ml-models/sentiment-analysis-model.json',
    behavior: '/ml-models/behavior-analysis-model.json',
    recommendation: '/ml-models/recommendation-model.json',
    textAnalysis: '/ml-models/text-analysis-model.json'
  };

  constructor() {
    this.initializeModels();
  }

  /**
   * Inicializa todos los modelos auxiliares
   */
  private async initializeModels(): Promise<void> {
    try {
      // Cargar modelos pre-entrenados
      this.sentimentModel = await loadLayersModel(this.modelPaths.sentiment);
      this.behaviorModel = await loadLayersModel(this.modelPaths.behavior);
      this.recommendationModel = await loadLayersModel(this.modelPaths.recommendation);
      this.textAnalysisModel = await loadLayersModel(this.modelPaths.textAnalysis);
      
      this.isLoaded = true;
      console.log('✅ Modelos auxiliares cargados');
    } catch (error) {
      console.log('⚠️ Modelos no encontrados, creando nuevos modelos...');
      await this.createNewModels();
    }
  }

  /**
   * Crea nuevos modelos auxiliares
   */
  private async createNewModels(): Promise<void> {
    // Modelo de análisis de sentimientos
    this.sentimentModel = tf.sequential({
      layers: [
        tf.layers.embedding({
          inputDim: 10000,
          outputDim: 128,
          inputLength: 100
        }),
        tf.layers.globalAveragePooling1d(),
        tf.layers.dense({ units: 64, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.3 }),
        tf.layers.dense({ units: 32, activation: 'relu' }),
        tf.layers.dense({ units: 3, activation: 'softmax' }) // positive, negative, neutral
      ]
    });

    // Modelo de análisis de comportamiento
    this.behaviorModel = tf.sequential({
      layers: [
        tf.layers.dense({ inputShape: [10], units: 64, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ units: 32, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ units: 16, activation: 'relu' }),
        tf.layers.dense({ units: 5, activation: 'sigmoid' }) // engagement, attention, frustration, confidence, motivation
      ]
    });

    // Modelo de recomendaciones
    this.recommendationModel = tf.sequential({
      layers: [
        tf.layers.dense({ inputShape: [20], units: 128, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.3 }),
        tf.layers.dense({ units: 64, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ units: 32, activation: 'relu' }),
        tf.layers.dense({ units: 10, activation: 'softmax' }) // tipos de recomendaciones
      ]
    });

    // Modelo de análisis de texto
    this.textAnalysisModel = tf.sequential({
      layers: [
        tf.layers.embedding({
          inputDim: 10000,
          outputDim: 128,
          inputLength: 200
        }),
        tf.layers.lstm({ units: 64, returnSequences: true }),
        tf.layers.lstm({ units: 32, returnSequences: false }),
        tf.layers.dropout({ rate: 0.3 }),
        tf.layers.dense({ units: 64, activation: 'relu' }),
        tf.layers.dense({ units: 32, activation: 'relu' }),
        tf.layers.dense({ units: 15, activation: 'sigmoid' }) // múltiples características
      ]
    });

    // Compilar modelos
    this.sentimentModel.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    });

    this.behaviorModel.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'binaryCrossentropy',
      metrics: ['accuracy']
    });

    this.recommendationModel.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    });

    this.textAnalysisModel.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'binaryCrossentropy',
      metrics: ['accuracy']
    });

    this.isLoaded = true;
    console.log('✅ Nuevos modelos auxiliares creados');
  }

  /**
   * Analiza sentimientos en texto
   */
  async analyzeSentiment(text: string): Promise<{ sentiment: string; confidence: number }> {
    if (!this.sentimentModel) {
      throw new Error('Modelo de sentimientos no cargado');
    }

    try {
      const tokens = this.tokenizeText(text);
      const inputTensor = tf.tensor2d([tokens], [1, 100]);
      
      const prediction = this.sentimentModel.predict(inputTensor) as tf.Tensor;
      const probabilities = await prediction.array() as number[][];
      
      inputTensor.dispose();
      prediction.dispose();

      const sentiments = ['negative', 'neutral', 'positive'];
      const maxIndex = probabilities[0].indexOf(Math.max(...probabilities[0]));
      
      return {
        sentiment: sentiments[maxIndex],
        confidence: probabilities[0][maxIndex]
      };
    } catch (error) {
      console.error('Error en análisis de sentimientos:', error);
      return { sentiment: 'neutral', confidence: 0.5 };
    }
  }

  /**
   * Analiza patrones de comportamiento
   */
  async analyzeBehavior(behaviorData: {
    timeSpent: number;
    errors: number;
    helpRequests: number;
    completionRate: number;
    responseTime: number;
    interactions: number;
    pauses: number;
    repetitions: number;
    corrections: number;
    achievements: number;
  }): Promise<BehaviorPattern> {
    if (!this.behaviorModel) {
      throw new Error('Modelo de comportamiento no cargado');
    }

    try {
      const features = [
        behaviorData.timeSpent / 3600, // Normalizar a horas
        Math.min(behaviorData.errors / 10, 1), // Normalizar errores
        Math.min(behaviorData.helpRequests / 5, 1), // Normalizar solicitudes
        behaviorData.completionRate,
        Math.min(behaviorData.responseTime / 10000, 1), // Normalizar tiempo de respuesta
        Math.min(behaviorData.interactions / 50, 1), // Normalizar interacciones
        Math.min(behaviorData.pauses / 10, 1), // Normalizar pausas
        Math.min(behaviorData.repetitions / 5, 1), // Normalizar repeticiones
        Math.min(behaviorData.corrections / 5, 1), // Normalizar correcciones
        Math.min(behaviorData.achievements / 10, 1) // Normalizar logros
      ];

      const inputTensor = tf.tensor2d([features], [1, 10]);
      const prediction = this.behaviorModel.predict(inputTensor) as tf.Tensor;
      const values = await prediction.array() as number[][];
      
      inputTensor.dispose();
      prediction.dispose();

      const [engagement, attention, frustration, confidence, motivation] = values[0];

      return {
        engagement,
        attention,
        frustration,
        confidence,
        motivation,
        patterns: this.detectBehaviorPatterns(values[0]),
        recommendations: this.generateBehaviorRecommendations(values[0])
      };
    } catch (error) {
      console.error('Error en análisis de comportamiento:', error);
      return {
        engagement: 0.5,
        attention: 0.5,
        frustration: 0.5,
        confidence: 0.5,
        motivation: 0.5,
        patterns: ['Patrón no detectado'],
        recommendations: ['Recomendación no disponible']
      };
    }
  }

  /**
   * Genera recomendaciones de aprendizaje
   */
  async generateRecommendations(
    studentData: {
      needs: string[];
      behavior: BehaviorPattern;
      progress: number;
      preferences: string[];
      culturalContext: string;
      age: number;
      grade: number;
    }
  ): Promise<LearningRecommendation[]> {
    if (!this.recommendationModel) {
      throw new Error('Modelo de recomendaciones no cargado');
    }

    try {
      const features = [
        studentData.progress,
        studentData.behavior.engagement,
        studentData.behavior.confidence,
        studentData.behavior.motivation,
        studentData.age / 18, // Normalizar edad
        studentData.grade / 12, // Normalizar grado
        ...this.encodeNeeds(studentData.needs),
        ...this.encodePreferences(studentData.preferences),
        ...this.encodeCulturalContext(studentData.culturalContext)
      ];

      const inputTensor = tf.tensor2d([features], [1, 20]);
      const prediction = this.recommendationModel.predict(inputTensor) as tf.Tensor;
      const probabilities = await prediction.array() as number[][];
      
      inputTensor.dispose();
      prediction.dispose();

      return this.interpretRecommendations(probabilities[0], studentData);
    } catch (error) {
      console.error('Error generando recomendaciones:', error);
      return [];
    }
  }

  /**
   * Analiza texto educativo
   */
  async analyzeText(text: string, culturalContext: string = 'general'): Promise<TextAnalysis> {
    if (!this.textAnalysisModel) {
      throw new Error('Modelo de análisis de texto no cargado');
    }

    try {
      const tokens = this.tokenizeText(text);
      const inputTensor = tf.tensor2d([tokens], [1, 200]);
      
      const prediction = this.textAnalysisModel.predict(inputTensor) as tf.Tensor;
      const features = await prediction.array() as number[][];
      
      inputTensor.dispose();
      prediction.dispose();

      return this.interpretTextAnalysis(features[0], text, culturalContext);
    } catch (error) {
      console.error('Error en análisis de texto:', error);
      return {
        sentiment: 'neutral',
        confidence: 0.5,
        topics: ['Tema no detectado'],
        culturalElements: [],
        difficulty: 'medium',
        readingLevel: 5,
        keywords: []
      };
    }
  }

  /**
   * Tokeniza texto para procesamiento
   */
  private tokenizeText(text: string): number[] {
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 0);

    const tokens: number[] = [];
    words.forEach(word => {
      const hash = this.simpleHash(word);
      tokens.push(hash % 10000);
    });

    // Padding o truncamiento
    while (tokens.length < 200) {
      tokens.push(0);
    }
    return tokens.slice(0, 200);
  }

  /**
   * Hash simple para tokenización
   */
  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  /**
   * Detecta patrones de comportamiento
   */
  private detectBehaviorPatterns(values: number[]): string[] {
    const patterns: string[] = [];
    const [engagement, attention, frustration, confidence, motivation] = values;

    if (engagement < 0.3) patterns.push('Bajo engagement');
    if (attention < 0.4) patterns.push('Dificultad de atención');
    if (frustration > 0.7) patterns.push('Alta frustración');
    if (confidence < 0.3) patterns.push('Baja confianza');
    if (motivation < 0.4) patterns.push('Baja motivación');

    if (engagement > 0.8 && attention > 0.7) patterns.push('Alto rendimiento');
    if (confidence > 0.8 && motivation > 0.8) patterns.push('Excelente actitud');

    return patterns.length > 0 ? patterns : ['Patrón normal'];
  }

  /**
   * Genera recomendaciones basadas en comportamiento
   */
  private generateBehaviorRecommendations(values: number[]): string[] {
    const recommendations: string[] = [];
    const [engagement, attention, frustration, confidence, motivation] = values;

    if (engagement < 0.3) {
      recommendations.push('Implementar actividades más interactivas');
      recommendations.push('Usar gamificación para aumentar engagement');
    }

    if (attention < 0.4) {
      recommendations.push('Dividir contenido en sesiones más cortas');
      recommendations.push('Usar elementos visuales atractivos');
    }

    if (frustration > 0.7) {
      recommendations.push('Proporcionar más apoyo y guía');
      recommendations.push('Reducir dificultad temporalmente');
    }

    if (confidence < 0.3) {
      recommendations.push('Celebrar pequeños logros');
      recommendations.push('Proporcionar retroalimentación positiva');
    }

    if (motivation < 0.4) {
      recommendations.push('Conectar contenido con intereses personales');
      recommendations.push('Establecer metas alcanzables');
    }

    return recommendations.length > 0 ? recommendations : ['Continuar con el enfoque actual'];
  }

  /**
   * Codifica necesidades especiales
   */
  private encodeNeeds(needs: string[]): number[] {
    const allNeeds = ['DYSLEXIA', 'ADHD', 'DYSCALCULIA', 'AUDITORY_PROCESSING', 'VISUAL_PROCESSING'];
    return allNeeds.map(need => needs.includes(need) ? 1 : 0);
  }

  /**
   * Codifica preferencias
   */
  private encodePreferences(preferences: string[]): number[] {
    const allPreferences = ['visual', 'auditory', 'kinesthetic', 'social', 'individual'];
    return allPreferences.map(pref => preferences.includes(pref) ? 1 : 0);
  }

  /**
   * Codifica contexto cultural
   */
  private encodeCulturalContext(context: string): number[] {
    const contexts = ['maya', 'nahuatl', 'quechua', 'afrodescendiente', 'rural'];
    return contexts.map(ctx => context === ctx ? 1 : 0);
  }

  /**
   * Interpreta recomendaciones del modelo
   */
  private interpretRecommendations(
    probabilities: number[],
    studentData: any
  ): LearningRecommendation[] {
    const recommendationTypes = [
      'content_adaptation',
      'visual_support',
      'audio_support',
      'interactive_activity',
      'group_work',
      'individual_practice',
      'assessment',
      'cultural_integration',
      'accessibility_support',
      'motivation_boost'
    ];

    const recommendations: LearningRecommendation[] = [];

    probabilities.forEach((prob, index) => {
      if (prob > 0.3) {
        const type = this.getRecommendationType(recommendationTypes[index]);
        const priority = prob > 0.7 ? 'high' : prob > 0.5 ? 'medium' : 'low';
        
        recommendations.push({
          type,
          priority,
          confidence: prob,
          description: this.getRecommendationDescription(recommendationTypes[index], studentData),
          culturalContext: studentData.culturalContext,
          accessibility: this.getAccessibilityFeatures(recommendationTypes[index]),
          estimatedTime: this.getEstimatedTime(recommendationTypes[index])
        });
      }
    });

    return recommendations.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Obtiene tipo de recomendación
   */
  private getRecommendationType(type: string): LearningRecommendation['type'] {
    const typeMap: Record<string, LearningRecommendation['type']> = {
      'content_adaptation': 'content',
      'visual_support': 'support',
      'audio_support': 'support',
      'interactive_activity': 'activity',
      'group_work': 'activity',
      'individual_practice': 'activity',
      'assessment': 'assessment',
      'cultural_integration': 'content',
      'accessibility_support': 'support',
      'motivation_boost': 'support'
    };
    return typeMap[type] || 'content';
  }

  /**
   * Obtiene descripción de recomendación
   */
  private getRecommendationDescription(type: string, studentData: any): string {
    const descriptions: Record<string, string> = {
      'content_adaptation': 'Adaptar contenido al nivel y estilo de aprendizaje del estudiante',
      'visual_support': 'Proporcionar apoyos visuales para mejorar comprensión',
      'audio_support': 'Incluir elementos de audio para reforzar aprendizaje',
      'interactive_activity': 'Implementar actividades interactivas para aumentar engagement',
      'group_work': 'Fomentar trabajo colaborativo con otros estudiantes',
      'individual_practice': 'Proporcionar práctica individual para reforzar conceptos',
      'assessment': 'Realizar evaluación formativa para medir progreso',
      'cultural_integration': 'Integrar elementos culturales relevantes en el contenido',
      'accessibility_support': 'Implementar adaptaciones de accesibilidad',
      'motivation_boost': 'Usar estrategias para aumentar motivación y confianza'
    };
    return descriptions[type] || 'Recomendación personalizada';
  }

  /**
   * Obtiene características de accesibilidad
   */
  private getAccessibilityFeatures(type: string): string[] {
    const features: Record<string, string[]> = {
      'visual_support': ['screen_reader', 'high_contrast', 'large_text'],
      'audio_support': ['captions', 'audio_description', 'voice_control'],
      'interactive_activity': ['keyboard_navigation', 'voice_commands'],
      'accessibility_support': ['screen_reader', 'voice_control', 'high_contrast', 'large_text']
    };
    return features[type] || [];
  }

  /**
   * Obtiene tiempo estimado
   */
  private getEstimatedTime(type: string): number {
    const times: Record<string, number> = {
      'content_adaptation': 15,
      'visual_support': 5,
      'audio_support': 10,
      'interactive_activity': 20,
      'group_work': 30,
      'individual_practice': 15,
      'assessment': 10,
      'cultural_integration': 10,
      'accessibility_support': 5,
      'motivation_boost': 5
    };
    return times[type] || 15;
  }

  /**
   * Interpreta análisis de texto
   */
  private interpretTextAnalysis(
    features: number[],
    text: string,
    culturalContext: string
  ): TextAnalysis {
    // Análisis de sentimientos
    const sentimentScore = features[0];
    const sentiment = sentimentScore > 0.6 ? 'positive' : sentimentScore < 0.4 ? 'negative' : 'neutral';

    // Dificultad basada en longitud y complejidad
    const wordCount = text.split(' ').length;
    const avgWordLength = text.replace(/[^\w]/g, '').length / wordCount;
    const difficulty = wordCount > 100 || avgWordLength > 6 ? 'hard' : 
                      wordCount > 50 || avgWordLength > 5 ? 'medium' : 'easy';

    // Nivel de lectura estimado
    const readingLevel = Math.max(1, Math.min(12, Math.floor(wordCount / 10 + avgWordLength)));

    // Extraer palabras clave
    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    const keywords = words.filter(word => word.length > 3).slice(0, 10);

    // Detectar elementos culturales
    const culturalElements = this.detectCulturalElements(text, culturalContext);

    // Detectar temas
    const topics = this.detectTopics(text);

    return {
      sentiment,
      confidence: Math.abs(sentimentScore - 0.5) * 2,
      topics,
      culturalElements,
      difficulty,
      readingLevel,
      keywords
    };
  }

  /**
   * Detecta elementos culturales en el texto
   */
  private detectCulturalElements(text: string, context: string): string[] {
    const elements: string[] = [];
    const lowerText = text.toLowerCase();

    const culturalTerms: Record<string, string[]> = {
      'maya': ['maíz', 'milpa', 'cenote', 'quetzal', 'jaguar', 'templo'],
      'nahuatl': ['cacao', 'chinampa', 'volcán', 'águila', 'serpiente'],
      'quechua': ['pachamama', 'inti', 'quilla', 'llama', 'alpaca'],
      'afrodescendiente': ['tambor', 'danza', 'música', 'costa', 'mar']
    };

    const terms = culturalTerms[context] || [];
    terms.forEach(term => {
      if (lowerText.includes(term.toLowerCase())) {
        elements.push(term);
      }
    });

    return elements;
  }

  /**
   * Detecta temas en el texto
   */
  private detectTopics(text: string): string[] {
    const topics: string[] = [];
    const lowerText = text.toLowerCase();

    const topicKeywords: Record<string, string[]> = {
      'matemáticas': ['número', 'suma', 'resta', 'multiplicación', 'división', 'ecuación'],
      'ciencias': ['experimento', 'observar', 'hipótesis', 'resultado', 'investigación'],
      'historia': ['pasado', 'histórico', 'antiguo', 'tradición', 'cultura'],
      'literatura': ['historia', 'personaje', 'narración', 'poesía', 'lectura'],
      'arte': ['dibujo', 'pintura', 'música', 'danza', 'creatividad']
    };

    Object.entries(topicKeywords).forEach(([topic, keywords]) => {
      if (keywords.some(keyword => lowerText.includes(keyword))) {
        topics.push(topic);
      }
    });

    return topics.length > 0 ? topics : ['general'];
  }

  /**
   * Entrena todos los modelos auxiliares
   */
  async trainAllModels(trainingData: any): Promise<void> {
    console.log('🔄 Entrenando modelos auxiliares...');

    // Entrenar modelo de sentimientos
    if (trainingData.sentiment) {
      await this.trainSentimentModel(trainingData.sentiment);
    }

    // Entrenar modelo de comportamiento
    if (trainingData.behavior) {
      await this.trainBehaviorModel(trainingData.behavior);
    }

    // Entrenar modelo de recomendaciones
    if (trainingData.recommendations) {
      await this.trainRecommendationModel(trainingData.recommendations);
    }

    // Entrenar modelo de análisis de texto
    if (trainingData.textAnalysis) {
      await this.trainTextAnalysisModel(trainingData.textAnalysis);
    }

    console.log('✅ Todos los modelos auxiliares entrenados');
  }

  /**
   * Entrena modelo de sentimientos
   */
  private async trainSentimentModel(data: any[]): Promise<void> {
    if (!this.sentimentModel) return;

    const inputs: number[][] = [];
    const outputs: number[][] = [];

    data.forEach(({ text, sentiment }) => {
      inputs.push(this.tokenizeText(text));
      
      const sentimentVector = [0, 0, 0];
      if (sentiment === 'negative') sentimentVector[0] = 1;
      else if (sentiment === 'neutral') sentimentVector[1] = 1;
      else sentimentVector[2] = 1;
      
      outputs.push(sentimentVector);
    });

    const inputTensor = tf.tensor2d(inputs);
    const outputTensor = tf.tensor2d(outputs);

    await this.sentimentModel.fit(inputTensor, outputTensor, {
      epochs: 20,
      batchSize: 32,
      validationSplit: 0.2
    });

    inputTensor.dispose();
    outputTensor.dispose();
  }

  /**
   * Entrena modelo de comportamiento
   */
  private async trainBehaviorModel(data: any[]): Promise<void> {
    if (!this.behaviorModel) return;

    const inputs: number[][] = [];
    const outputs: number[][] = [];

    data.forEach(({ features, behavior }) => {
      inputs.push(features);
      outputs.push([
        behavior.engagement,
        behavior.attention,
        behavior.frustration,
        behavior.confidence,
        behavior.motivation
      ]);
    });

    const inputTensor = tf.tensor2d(inputs);
    const outputTensor = tf.tensor2d(outputs);

    await this.behaviorModel.fit(inputTensor, outputTensor, {
      epochs: 30,
      batchSize: 16,
      validationSplit: 0.2
    });

    inputTensor.dispose();
    outputTensor.dispose();
  }

  /**
   * Entrena modelo de recomendaciones
   */
  private async trainRecommendationModel(data: any[]): Promise<void> {
    if (!this.recommendationModel) return;

    const inputs: number[][] = [];
    const outputs: number[][] = [];

    data.forEach(({ studentFeatures, recommendations }) => {
      inputs.push(studentFeatures);
      
      const recommendationVector = new Array(10).fill(0);
      recommendations.forEach((rec: any) => {
        const index = this.getRecommendationIndex(rec.type);
        if (index !== -1) recommendationVector[index] = 1;
      });
      
      outputs.push(recommendationVector);
    });

    const inputTensor = tf.tensor2d(inputs);
    const outputTensor = tf.tensor2d(outputs);

    await this.recommendationModel.fit(inputTensor, outputTensor, {
      epochs: 25,
      batchSize: 16,
      validationSplit: 0.2
    });

    inputTensor.dispose();
    outputTensor.dispose();
  }

  /**
   * Entrena modelo de análisis de texto
   */
  private async trainTextAnalysisModel(data: any[]): Promise<void> {
    if (!this.textAnalysisModel) return;

    const inputs: number[][] = [];
    const outputs: number[][] = [];

    data.forEach(({ text, features }) => {
      inputs.push(this.tokenizeText(text));
      outputs.push(features);
    });

    const inputTensor = tf.tensor2d(inputs);
    const outputTensor = tf.tensor2d(outputs);

    await this.textAnalysisModel.fit(inputTensor, outputTensor, {
      epochs: 20,
      batchSize: 32,
      validationSplit: 0.2
    });

    inputTensor.dispose();
    outputTensor.dispose();
  }

  /**
   * Obtiene índice de recomendación
   */
  private getRecommendationIndex(type: string): number {
    const types = [
      'content_adaptation', 'visual_support', 'audio_support', 'interactive_activity',
      'group_work', 'individual_practice', 'assessment', 'cultural_integration',
      'accessibility_support', 'motivation_boost'
    ];
    return types.indexOf(type);
  }

  /**
   * Guarda todos los modelos entrenados
   */
  async saveAllModels(): Promise<void> {
    console.log('💾 Guardando modelos auxiliares...');

    try {
      if (this.sentimentModel) {
        await this.sentimentModel.save(`file://${process.cwd()}/public/ml-models/sentiment-analysis-model`);
      }
      if (this.behaviorModel) {
        await this.behaviorModel.save(`file://${process.cwd()}/public/ml-models/behavior-analysis-model`);
      }
      if (this.recommendationModel) {
        await this.recommendationModel.save(`file://${process.cwd()}/public/ml-models/recommendation-model`);
      }
      if (this.textAnalysisModel) {
        await this.textAnalysisModel.save(`file://${process.cwd()}/public/ml-models/text-analysis-model`);
      }

      console.log('✅ Todos los modelos auxiliares guardados');
    } catch (error) {
      console.error('Error guardando modelos auxiliares:', error);
      throw error;
    }
  }

  /**
   * Verifica si los modelos están listos
   */
  isReady(): boolean {
    return this.isLoaded && 
           this.sentimentModel !== null && 
           this.behaviorModel !== null && 
           this.recommendationModel !== null && 
           this.textAnalysisModel !== null;
  }
}

// Instancia singleton
export const auxiliaryModels = new AuxiliaryModels();
