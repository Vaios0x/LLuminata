import * as tf from '@tensorflow/tfjs';
import { loadLayersModel, LayersModel } from '@tensorflow/tfjs-layers';

export interface CulturalContext {
  culture: string;                // Cultura objetivo (maya, nahuatl, etc.)
  language: string;               // Idioma principal
  region: string;                 // Región geográfica
  socioeconomicLevel: string;     // Nivel socioeconómico
  educationLevel: string;         // Nivel educativo
  age: number;                    // Edad del estudiante
  gender: string;                 // Género
  religion?: string;              // Religión (opcional)
  traditions: string[];           // Tradiciones importantes
  values: string[];               // Valores culturales
  taboos: string[];               // Temas tabú o sensibles
  examples: string[];             // Ejemplos culturalmente relevantes
}

export interface ContentAdaptation {
  originalContent: string;
  adaptedContent: string;
  culturalElements: string[];
  languageAdaptations: string[];
  visualAdaptations: string[];
  audioAdaptations: string[];
  sensitivityNotes: string[];
  confidence: number;
}

export interface AdaptationRule {
  pattern: string;
  replacement: string;
  context: string;
  confidence: number;
}

export class CulturalAdaptationModel {
  private model: LayersModel | null = null;
  private embeddingModel: LayersModel | null = null;
  private isLoaded: boolean = false;
  private readonly modelPath: string = '/ml-models/cultural-adaptation-model.json';
  private readonly embeddingPath: string = '/ml-models/cultural-embeddings.json';
  
  // Configuración del modelo
  private readonly vocabSize = 10000;
  private readonly embeddingDim = 128;
  private readonly maxSequenceLength = 200;
  private readonly numCultures = 8;
  
  // Vocabulario cultural específico
  private culturalVocabularies: Record<string, string[]> = {
    'maya': [
      'maíz', 'milpa', 'cenote', 'quetzal', 'jaguar', 'templo', 'sacerdote',
      'calendario', 'jeroglífico', 'cacao', 'chocolate', 'comal', 'tortilla',
      'familia', 'comunidad', 'tradición', 'ancestros', 'naturaleza', 'tierra',
      'agua', 'sol', 'luna', 'estrellas', 'ceremonia', 'ritual', 'medicina'
    ],
    'nahuatl': [
      'cacao', 'chinampa', 'volcán', 'águila', 'serpiente', 'flor', 'canto',
      'palabra', 'sabiduría', 'conocimiento', 'arte', 'poesía', 'historia',
      'tradición', 'familia', 'comunidad', 'trabajo', 'respeto', 'honor',
      'verdad', 'justicia', 'equilibrio', 'armonía', 'naturaleza', 'espíritu'
    ],
    'quechua': [
      'pachamama', 'inti', 'quilla', 'chakana', 'quipu', 'llama', 'alpaca',
      'papa', 'quinua', 'maíz', 'coca', 'tierra', 'montaña', 'río', 'lago',
      'familia', 'ayllu', 'comunidad', 'trabajo', 'fiesta', 'música', 'danza',
      'tradición', 'sabiduría', 'respeto', 'gratitud', 'armonía', 'equilibrio'
    ],
    'afrodescendiente': [
      'tambor', 'danza', 'música', 'ritmo', 'costa', 'mar', 'pesca',
      'comunidad', 'familia', 'tradición', 'historia', 'resistencia',
      'cultura', 'arte', 'expresión', 'libertad', 'igualdad', 'justicia',
      'solidaridad', 'unión', 'fuerza', 'alegría', 'vida', 'esperanza'
    ]
  };

  constructor() {
    this.initializeModel();
  }

  /**
   * Inicializa el modelo de adaptación cultural
   */
  private async initializeModel(): Promise<void> {
    try {
      // Intentar cargar modelos pre-entrenados
      this.model = await loadLayersModel(this.modelPath);
      this.embeddingModel = await loadLayersModel(this.embeddingPath);
      this.isLoaded = true;
      console.log('✅ Modelo de adaptación cultural cargado');
    } catch (error) {
      console.log('⚠️ Modelos no encontrados, creando nuevos modelos...');
      await this.createNewModels();
    }
  }

  /**
   * Crea nuevos modelos de adaptación cultural
   */
  private async createNewModels(): Promise<void> {
    // Modelo de embeddings
    this.embeddingModel = tf.sequential({
      layers: [
        tf.layers.embedding({
          inputDim: this.vocabSize,
          outputDim: this.embeddingDim,
          inputLength: this.maxSequenceLength
        }),
        tf.layers.globalAveragePooling1d(),
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
          units: this.numCultures,
          activation: 'softmax'
        })
      ]
    });

    // Modelo de adaptación de contenido
    this.model = tf.sequential({
      layers: [
        tf.layers.embedding({
          inputDim: this.vocabSize,
          outputDim: this.embeddingDim,
          inputLength: this.maxSequenceLength
        }),
        tf.layers.lstm({
          units: 128,
          returnSequences: true
        }),
        tf.layers.lstm({
          units: 64,
          returnSequences: false
        }),
        tf.layers.dropout({ rate: 0.3 }),
        tf.layers.dense({
          units: 128,
          activation: 'relu'
        }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({
          units: this.maxSequenceLength,
          activation: 'softmax'
        })
      ]
    });

    // Compilar modelos
    this.embeddingModel.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    });

    this.model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    });

    this.isLoaded = true;
    console.log('✅ Nuevos modelos de adaptación cultural creados');
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
      // Asignar ID basado en hash simple
      const hash = this.simpleHash(word);
      tokens.push(hash % this.vocabSize);
    });

    // Padding o truncamiento
    while (tokens.length < this.maxSequenceLength) {
      tokens.push(0);
    }
    return tokens.slice(0, this.maxSequenceLength);
  }

  /**
   * Hash simple para tokenización
   */
  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convertir a entero de 32 bits
    }
    return Math.abs(hash);
  }

  /**
   * Adapta contenido educativo a un contexto cultural específico
   */
  async adaptContent(
    content: string,
    targetCulture: CulturalContext
  ): Promise<ContentAdaptation> {
    if (!this.isLoaded || !this.model) {
      throw new Error('Modelo no está cargado');
    }

    try {
      // Tokenizar contenido original
      const inputTokens = this.tokenizeText(content);
      const inputTensor = tf.tensor2d([inputTokens], [1, this.maxSequenceLength]);

      // Realizar predicción de adaptación
      const prediction = this.model.predict(inputTensor) as tf.Tensor;
      const adaptedTokens = await prediction.array() as number[][];

      // Limpiar tensores
      inputTensor.dispose();
      prediction.dispose();

      // Generar contenido adaptado
      const adaptedContent = this.generateAdaptedContent(content, targetCulture);
      
      // Analizar elementos culturales
      const culturalElements = this.extractCulturalElements(content, targetCulture);
      
      // Generar adaptaciones específicas
      const adaptations = this.generateSpecificAdaptations(content, targetCulture);

      return {
        originalContent: content,
        adaptedContent: adaptedContent,
        culturalElements: culturalElements,
        languageAdaptations: adaptations.language,
        visualAdaptations: adaptations.visual,
        audioAdaptations: adaptations.audio,
        sensitivityNotes: adaptations.sensitivity,
        confidence: this.calculateAdaptationConfidence(content, targetCulture)
      };

    } catch (error) {
      console.error('Error en adaptación cultural:', error);
      throw error;
    }
  }

  /**
   * Genera contenido adaptado usando reglas culturales
   */
  private generateAdaptedContent(content: string, culture: CulturalContext): string {
    let adaptedContent = content;

    // Aplicar reglas de adaptación cultural
    const adaptationRules = this.getAdaptationRules(culture);
    
    adaptationRules.forEach(rule => {
      const regex = new RegExp(rule.pattern, 'gi');
      adaptedContent = adaptedContent.replace(regex, rule.replacement);
    });

    // Insertar ejemplos culturalmente relevantes
    adaptedContent = this.insertCulturalExamples(adaptedContent, culture);

    // Adaptar lenguaje según contexto
    adaptedContent = this.adaptLanguage(adaptedContent, culture);

    return adaptedContent;
  }

  /**
   * Obtiene reglas de adaptación para una cultura específica
   */
  private getAdaptationRules(culture: CulturalContext): AdaptationRule[] {
    const rules: Record<string, AdaptationRule[]> = {
      'maya': [
        {
          pattern: '\\bciudad\\b',
          replacement: 'comunidad',
          context: 'Preferir términos comunitarios',
          confidence: 0.9
        },
        {
          pattern: '\\btecnología\\b',
          replacement: 'conocimiento tradicional',
          context: 'Valorar conocimiento ancestral',
          confidence: 0.8
        },
        {
          pattern: '\\bindividual\\b',
          replacement: 'comunitario',
          context: 'Enfatizar trabajo colectivo',
          confidence: 0.9
        }
      ],
      'nahuatl': [
        {
          pattern: '\\bconquistador\\b',
          replacement: 'visitante',
          context: 'Evitar términos conflictivos',
          confidence: 0.9
        },
        {
          pattern: '\\bguerra\\b',
          replacement: 'conflicto',
          context: 'Usar lenguaje más suave',
          confidence: 0.8
        },
        {
          pattern: '\\bvencer\\b',
          replacement: 'superar',
          context: 'Enfatizar resiliencia',
          confidence: 0.8
        }
      ],
      'quechua': [
        {
          pattern: '\\bexplotar\\b',
          replacement: 'cuidar',
          context: 'Enfatizar respeto a la tierra',
          confidence: 0.9
        },
        {
          pattern: '\\briqueza\\b',
          replacement: 'abundancia',
          context: 'Usar términos más espirituales',
          confidence: 0.8
        }
      ],
      'afrodescendiente': [
        {
          pattern: '\\besclavo\\b',
          replacement: 'ancestro',
          context: 'Respetar memoria histórica',
          confidence: 0.9
        },
        {
          pattern: '\\bopresión\\b',
          replacement: 'resistencia',
          context: 'Enfatizar fortaleza',
          confidence: 0.8
        }
      ]
    };

    return rules[culture.culture] || [];
  }

  /**
   * Inserta ejemplos culturalmente relevantes
   */
  private insertCulturalExamples(content: string, culture: CulturalContext): string {
    const examples = this.culturalVocabularies[culture.culture] || [];
    
    if (examples.length === 0) return content;

    // Buscar oportunidades para insertar ejemplos
    const sentences = content.split('.');
    const adaptedSentences = sentences.map(sentence => {
      if (sentence.includes('ejemplo') || sentence.includes('como')) {
        const randomExample = examples[Math.floor(Math.random() * examples.length)];
        return sentence.replace(/(ejemplo|como)/i, `ejemplo, como ${randomExample}`);
      }
      return sentence;
    });

    return adaptedSentences.join('.');
  }

  /**
   * Adapta el lenguaje según el contexto cultural
   */
  private adaptLanguage(content: string, culture: CulturalContext): string {
    let adaptedContent = content;

    // Adaptaciones específicas por idioma
    if (culture.language === 'maya') {
      // Incluir términos en maya con traducción
      adaptedContent = this.addIndigenousTerms(adaptedContent, 'maya');
    } else if (culture.language === 'nahuatl') {
      adaptedContent = this.addIndigenousTerms(adaptedContent, 'nahuatl');
    }

    // Adaptar nivel de formalidad
    if (culture.educationLevel === 'básico') {
      adaptedContent = this.simplifyLanguage(adaptedContent);
    }

    return adaptedContent;
  }

  /**
   * Agrega términos indígenas con traducción
   */
  private addIndigenousTerms(content: string, language: string): string {
    const terms: Record<string, Record<string, string>> = {
      'maya': {
        'familia': 'familia (wíinik)',
        'tierra': 'tierra (lu\'um)',
        'agua': 'agua (ha\')',
        'sol': 'sol (k\'iin)',
        'luna': 'luna (u)',
        'maíz': 'maíz (ixi\'im)'
      },
      'nahuatl': {
        'familia': 'familia (cencalli)',
        'tierra': 'tierra (tlalli)',
        'agua': 'agua (atl)',
        'sol': 'sol (tonatiuh)',
        'luna': 'luna (metztli)',
        'maíz': 'maíz (centli)'
      }
    };

    let adaptedContent = content;
    const languageTerms = terms[language] || {};

    Object.entries(languageTerms).forEach(([spanish, indigenous]) => {
      const regex = new RegExp(`\\b${spanish}\\b`, 'gi');
      adaptedContent = adaptedContent.replace(regex, indigenous);
    });

    return adaptedContent;
  }

  /**
   * Simplifica el lenguaje para nivel básico
   */
  private simplifyLanguage(content: string): string {
    // Reemplazar palabras complejas con sinónimos simples
    const simplifications: Record<string, string> = {
      'consecuentemente': 'por eso',
      'posteriormente': 'después',
      'anteriormente': 'antes',
      'específicamente': 'específico',
      'aproximadamente': 'cerca de',
      'significativamente': 'mucho',
      'considerablemente': 'bastante'
    };

    let simplifiedContent = content;
    Object.entries(simplifications).forEach(([complex, simple]) => {
      const regex = new RegExp(`\\b${complex}\\b`, 'gi');
      simplifiedContent = simplifiedContent.replace(regex, simple);
    });

    return simplifiedContent;
  }

  /**
   * Extrae elementos culturales del contenido
   */
  private extractCulturalElements(content: string, culture: CulturalContext): string[] {
    const elements: string[] = [];
    const vocabulary = this.culturalVocabularies[culture.culture] || [];

    vocabulary.forEach(term => {
      if (content.toLowerCase().includes(term.toLowerCase())) {
        elements.push(term);
      }
    });

    return elements;
  }

  /**
   * Genera adaptaciones específicas por tipo
   */
  private generateSpecificAdaptations(content: string, culture: CulturalContext) {
    return {
      language: this.generateLanguageAdaptations(content, culture),
      visual: this.generateVisualAdaptations(culture),
      audio: this.generateAudioAdaptations(culture),
      sensitivity: this.generateSensitivityNotes(content, culture)
    };
  }

  /**
   * Genera adaptaciones de lenguaje
   */
  private generateLanguageAdaptations(content: string, culture: CulturalContext): string[] {
    const adaptations: string[] = [];

    if (culture.language !== 'es-MX') {
      adaptations.push(`Incluir términos en ${culture.language} con traducción`);
    }

    if (culture.educationLevel === 'básico') {
      adaptations.push('Usar vocabulario simple y directo');
      adaptations.push('Incluir explicaciones paso a paso');
    }

    if (culture.traditions.length > 0) {
      adaptations.push('Referenciar tradiciones locales cuando sea apropiado');
    }

    return adaptations;
  }

  /**
   * Genera adaptaciones visuales
   */
  private generateVisualAdaptations(culture: CulturalContext): string[] {
    const adaptations: string[] = [];

    adaptations.push('Usar colores y símbolos culturalmente relevantes');
    adaptations.push('Incluir imágenes de la comunidad local');
    adaptations.push('Representar diversidad cultural en ilustraciones');

    if (culture.culture === 'maya') {
      adaptations.push('Incluir símbolos mayas tradicionales');
      adaptations.push('Usar patrones geométricos mayas');
    }

    return adaptations;
  }

  /**
   * Genera adaptaciones de audio
   */
  private generateAudioAdaptations(culture: CulturalContext): string[] {
    const adaptations: string[] = [];

    adaptations.push('Usar voces con acentos locales');
    adaptations.push('Incluir música tradicional cuando sea apropiado');

    if (culture.culture === 'afrodescendiente') {
      adaptations.push('Incorporar ritmos y percusiones tradicionales');
    }

    return adaptations;
  }

  /**
   * Genera notas de sensibilidad cultural
   */
  private generateSensitivityNotes(content: string, culture: CulturalContext): string[] {
    const notes: string[] = [];

    // Verificar temas sensibles
    const sensitiveTopics = ['religión', 'política', 'violencia', 'discriminación'];
    sensitiveTopics.forEach(topic => {
      if (content.toLowerCase().includes(topic)) {
        notes.push(`Considerar sensibilidad sobre ${topic}`);
      }
    });

    // Verificar tabús culturales
    culture.taboos.forEach(taboo => {
      if (content.toLowerCase().includes(taboo.toLowerCase())) {
        notes.push(`Evitar referencia a ${taboo} (tabú cultural)`);
      }
    });

    return notes;
  }

  /**
   * Calcula la confianza de la adaptación
   */
  private calculateAdaptationConfidence(content: string, culture: CulturalContext): number {
    let confidence = 0.5; // Base

    // Aumentar confianza basado en elementos culturales presentes
    const culturalElements = this.extractCulturalElements(content, culture);
    confidence += culturalElements.length * 0.1;

    // Aumentar confianza si hay vocabulario específico
    const vocabulary = this.culturalVocabularies[culture.culture] || [];
    if (vocabulary.length > 0) {
      confidence += 0.2;
    }

    // Ajustar por nivel educativo
    if (culture.educationLevel === 'básico') {
      confidence += 0.1;
    }

    return Math.min(confidence, 1.0);
  }

  /**
   * Entrena el modelo con datos de adaptación cultural
   */
  async trainModel(trainingData: {
    content: string;
    culture: CulturalContext;
    adaptedContent: string;
  }[]): Promise<void> {
    if (!this.model || !this.embeddingModel) {
      throw new Error('Modelos no inicializados');
    }

    console.log('🔄 Entrenando modelo de adaptación cultural...');

    // Preparar datos de entrenamiento
    const inputs: number[][] = [];
    const outputs: number[][] = [];

    trainingData.forEach(({ content, culture, adaptedContent }) => {
      const inputTokens = this.tokenizeText(content);
      const outputTokens = this.tokenizeText(adaptedContent);
      
      inputs.push(inputTokens);
      outputs.push(outputTokens);
    });

    // Convertir a tensores
    const inputTensor = tf.tensor2d(inputs);
    const outputTensor = tf.tensor2d(outputs);

    // Entrenar modelo
    await this.model.fit(inputTensor, outputTensor, {
      epochs: 50,
      batchSize: 16,
      validationSplit: 0.2,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          console.log(`Época ${epoch + 1}: pérdida = ${logs?.loss?.toFixed(4)}, precisión = ${logs?.accuracy?.toFixed(4)}`);
        }
      }
    });

    // Limpiar tensores
    inputTensor.dispose();
    outputTensor.dispose();

    console.log('✅ Modelo de adaptación cultural entrenado exitosamente');
  }

  /**
   * Guarda los modelos entrenados
   */
  async saveModels(): Promise<void> {
    if (!this.model || !this.embeddingModel) {
      throw new Error('Modelos no inicializados');
    }

    try {
      await this.model.save(`file://${process.cwd()}/public/ml-models/cultural-adaptation-model`);
      await this.embeddingModel.save(`file://${process.cwd()}/public/ml-models/cultural-embeddings`);
      console.log('✅ Modelos de adaptación cultural guardados exitosamente');
    } catch (error) {
      console.error('Error guardando modelos:', error);
      throw error;
    }
  }

  /**
   * Verifica si el modelo está listo
   */
  isReady(): boolean {
    return this.isLoaded && this.model !== null && this.embeddingModel !== null;
  }
}

// Instancia singleton
export const culturalAdaptationModel = new CulturalAdaptationModel();
