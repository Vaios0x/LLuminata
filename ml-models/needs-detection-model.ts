import * as tf from '@tensorflow/tfjs';
import { loadLayersModel, LayersModel } from '@tensorflow/tfjs-layers';

export interface LearningPattern {
  readingSpeed: number;           // Palabras por minuto
  errorRate: number;              // Porcentaje de errores
  responseTime: number;           // Tiempo promedio de respuesta en ms
  helpRequests: number;           // Número de solicitudes de ayuda
  audioPreference: number;        // Preferencia por audio (0-1)
  visualPreference: number;       // Preferencia por visual (0-1)
  repetitionNeeded: number;       // Necesidad de repetición (0-1)
  attentionSpan: number;          // Duración de atención en minutos
  motorCoordination: number;      // Coordinación motora (0-1)
  socialInteraction: number;      // Interacción social (0-1)
  culturalContext: string;        // Contexto cultural
  language: string;               // Idioma principal
  age: number;                    // Edad del estudiante
  grade: number;                  // Grado escolar
}

export interface DetectedNeed {
  type: 'DYSLEXIA' | 'ADHD' | 'DYSCALCULIA' | 'AUDITORY_PROCESSING' | 'VISUAL_PROCESSING' | 'LANGUAGE_DELAY' | 'MOTOR_SKILLS' | 'SOCIAL_ANXIETY';
  severity: 'mild' | 'moderate' | 'severe';
  confidence: number;
  indicators: string[];
  recommendations: string[];
  accommodations: string[];
  culturalAdaptations: string[];
}

export class NeedsDetectionModel {
  private model: LayersModel | null = null;
  private isLoaded: boolean = false;
  private readonly modelPath: string = '/ml-models/needs-detection-model.json';
  
  // Configuración del modelo
  private readonly inputFeatures = 13;
  private readonly outputClasses = 8;
  private readonly hiddenLayers = [64, 32, 16];
  
  constructor() {
    this.initializeModel();
  }

  /**
   * Inicializa el modelo de detección de necesidades
   */
  private async initializeModel(): Promise<void> {
    try {
      // Intentar cargar modelo pre-entrenado
      this.model = await loadLayersModel(this.modelPath);
      this.isLoaded = true;
      console.log('✅ Modelo de detección de necesidades cargado');
    } catch (error) {
      console.log('⚠️ Modelo no encontrado, creando nuevo modelo...');
      await this.createNewModel();
    }
  }

  /**
   * Crea un nuevo modelo de detección de necesidades
   */
  private async createNewModel(): Promise<void> {
    this.model = tf.sequential({
      layers: [
        // Capa de entrada
        tf.layers.dense({
          inputShape: [this.inputFeatures],
          units: this.hiddenLayers[0],
          activation: 'relu',
          kernelRegularizer: tf.regularizers.l2({ l2: 0.01 })
        }),
        tf.layers.dropout({ rate: 0.3 }),
        
        // Capas ocultas
        tf.layers.dense({
          units: this.hiddenLayers[1],
          activation: 'relu',
          kernelRegularizer: tf.regularizers.l2({ l2: 0.01 })
        }),
        tf.layers.dropout({ rate: 0.2 }),
        
        tf.layers.dense({
          units: this.hiddenLayers[2],
          activation: 'relu',
          kernelRegularizer: tf.regularizers.l2({ l2: 0.01 })
        }),
        tf.layers.dropout({ rate: 0.1 }),
        
        // Capa de salida
        tf.layers.dense({
          units: this.outputClasses,
          activation: 'softmax'
        })
      ]
    });

    // Compilar modelo
    this.model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy', 'precision', 'recall']
    });

    this.isLoaded = true;
    console.log('✅ Nuevo modelo de detección de necesidades creado');
  }

  /**
   * Preprocesa los datos de entrada
   */
  private preprocessData(pattern: LearningPattern): tf.Tensor2D {
    const features = [
      // Normalizar velocidad de lectura (0-200 palabras/min)
      Math.min(pattern.readingSpeed / 200, 1),
      // Normalizar tasa de errores (0-1)
      Math.min(pattern.errorRate, 1),
      // Normalizar tiempo de respuesta (0-10 segundos)
      Math.min(pattern.responseTime / 10000, 1),
      // Normalizar solicitudes de ayuda (0-20 por sesión)
      Math.min(pattern.helpRequests / 20, 1),
      // Preferencias sensoriales
      pattern.audioPreference,
      pattern.visualPreference,
      // Necesidades de repetición
      pattern.repetitionNeeded,
      // Duración de atención (0-60 minutos)
      Math.min(pattern.attentionSpan / 60, 1),
      // Coordinación motora
      pattern.motorCoordination,
      // Interacción social
      pattern.socialInteraction,
      // Codificar contexto cultural
      this.encodeCulturalContext(pattern.culturalContext),
      // Codificar idioma
      this.encodeLanguage(pattern.language),
      // Normalizar edad (5-18 años)
      (pattern.age - 5) / 13
    ];

    return tf.tensor2d([features], [1, this.inputFeatures]);
  }

  /**
   * Codifica contexto cultural
   */
  private encodeCulturalContext(context: string): number {
    const contexts: Record<string, number> = {
      'maya': 0.1,
      'nahuatl': 0.2,
      'quechua': 0.3,
      'afrodescendiente': 0.4,
      'rural': 0.5,
      'urbano': 0.6,
      'indigena': 0.7,
      'mestizo': 0.8
    };
    return contexts[context] || 0.5;
  }

  /**
   * Codifica idioma
   */
  private encodeLanguage(language: string): number {
    const languages: Record<string, number> = {
      'es-MX': 0.1,
      'maya': 0.2,
      'nahuatl': 0.3,
      'quechua': 0.4,
      'en-US': 0.5,
      'pt-BR': 0.6
    };
    return languages[language] || 0.1;
  }

  /**
   * Analiza patrones de aprendizaje y detecta necesidades especiales
   */
  async detectNeeds(pattern: LearningPattern): Promise<DetectedNeed[]> {
    if (!this.isLoaded || !this.model) {
      throw new Error('Modelo no está cargado');
    }

    try {
      // Preprocesar datos
      const inputTensor = this.preprocessData(pattern);
      
      // Realizar predicción
      const prediction = this.model.predict(inputTensor) as tf.Tensor;
      const probabilities = await prediction.array() as number[][];
      
      // Limpiar tensores
      inputTensor.dispose();
      prediction.dispose();

      // Interpretar resultados
      return this.interpretResults(probabilities[0], pattern);
    } catch (error) {
      console.error('Error en detección de necesidades:', error);
      throw error;
    }
  }

  /**
   * Interpreta los resultados del modelo
   */
  private interpretResults(probabilities: number[], pattern: LearningPattern): DetectedNeed[] {
    const needTypes = [
      'DYSLEXIA', 'ADHD', 'DYSCALCULIA', 'AUDITORY_PROCESSING',
      'VISUAL_PROCESSING', 'LANGUAGE_DELAY', 'MOTOR_SKILLS', 'SOCIAL_ANXIETY'
    ];

    const detectedNeeds: DetectedNeed[] = [];
    const confidenceThreshold = 0.3;

    probabilities.forEach((probability, index) => {
      if (probability > confidenceThreshold) {
        const needType = needTypes[index] as DetectedNeed['type'];
        const severity = this.calculateSeverity(probability, pattern);
        
        detectedNeeds.push({
          type: needType,
          severity,
          confidence: probability,
          indicators: this.getIndicators(needType, pattern),
          recommendations: this.getRecommendations(needType, severity, pattern),
          accommodations: this.getAccommodations(needType, severity),
          culturalAdaptations: this.getCulturalAdaptations(needType, pattern.culturalContext)
        });
      }
    });

    // Ordenar por confianza
    return detectedNeeds.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Calcula la severidad basada en probabilidad y patrones
   */
  private calculateSeverity(probability: number, pattern: LearningPattern): 'mild' | 'moderate' | 'severe' {
    if (probability > 0.7) return 'severe';
    if (probability > 0.5) return 'moderate';
    return 'mild';
  }

  /**
   * Obtiene indicadores específicos para cada tipo de necesidad
   */
  private getIndicators(needType: string, pattern: LearningPattern): string[] {
    const indicators: Record<string, string[]> = {
      'DYSLEXIA': [
        `Velocidad de lectura baja: ${pattern.readingSpeed} palabras/min`,
        `Alta tasa de errores: ${(pattern.errorRate * 100).toFixed(1)}%`,
        'Inversión de letras y palabras',
        'Dificultad con palabras nuevas'
      ],
      'ADHD': [
        `Duración de atención corta: ${pattern.attentionSpan} minutos`,
        'Múltiples solicitudes de ayuda',
        'Tiempo de respuesta inconsistente',
        'Dificultad para mantener el foco'
      ],
      'DYSCALCULIA': [
        'Errores en operaciones matemáticas básicas',
        'Dificultad con secuencias numéricas',
        'Problemas con conceptos espaciales',
        'Confusión con símbolos matemáticos'
      ],
      'AUDITORY_PROCESSING': [
        `Alta preferencia por audio: ${(pattern.audioPreference * 100).toFixed(1)}%`,
        'Dificultad para seguir instrucciones orales',
        'Problemas en ambientes ruidosos',
        'Necesidad de repetición frecuente'
      ],
      'VISUAL_PROCESSING': [
        `Alta preferencia visual: ${(pattern.visualPreference * 100).toFixed(1)}%`,
        'Dificultad con mapas y diagramas',
        'Problemas de percepción visual',
        'Sensibilidad a la luz'
      ],
      'LANGUAGE_DELAY': [
        'Vocabulario limitado para la edad',
        'Dificultad con gramática compleja',
        'Problemas de comprensión lectora',
        'Retraso en desarrollo del lenguaje'
      ],
      'MOTOR_SKILLS': [
        `Coordinación motora baja: ${(pattern.motorCoordination * 100).toFixed(1)}%`,
        'Dificultad con escritura manual',
        'Problemas de equilibrio',
        'Movimientos torpes'
      ],
      'SOCIAL_ANXIETY': [
        `Interacción social limitada: ${(pattern.socialInteraction * 100).toFixed(1)}%`,
        'Evita situaciones sociales',
        'Miedo al juicio de otros',
        'Dificultad para hacer amigos'
      ]
    };

    return indicators[needType] || ['Indicadores no específicos'];
  }

  /**
   * Obtiene recomendaciones específicas
   */
  private getRecommendations(needType: string, severity: string, pattern: LearningPattern): string[] {
    const recommendations: Record<string, Record<string, string[]>> = {
      'DYSLEXIA': {
        mild: [
          'Usar fuentes sans-serif grandes',
          'Proporcionar más tiempo para lectura',
          'Usar marcadores de color para texto'
        ],
        moderate: [
          'Implementar tecnología de texto-a-voz',
          'Usar materiales multisensoriales',
          'Proporcionar instrucciones paso a paso'
        ],
        severe: [
          'Evaluación profesional especializada',
          'Programa de intervención intensiva',
          'Adaptaciones tecnológicas avanzadas'
        ]
      },
      'ADHD': {
        mild: [
          'Estructurar el ambiente de aprendizaje',
          'Usar temporizadores visuales',
          'Dividir tareas en pasos pequeños'
        ],
        moderate: [
          'Implementar sistema de recompensas',
          'Usar técnicas de mindfulness',
          'Proporcionar descansos frecuentes'
        ],
        severe: [
          'Evaluación médica especializada',
          'Estrategias de manejo conductual',
          'Posible intervención farmacológica'
        ]
      }
    };

    return recommendations[needType]?.[severity] || [
      'Consultar con especialista en educación especial',
      'Implementar adaptaciones individualizadas',
      'Monitorear progreso regularmente'
    ];
  }

  /**
   * Obtiene adaptaciones específicas
   */
  private getAccommodations(needType: string, severity: string): string[] {
    const accommodations: Record<string, string[]> = {
      'DYSLEXIA': [
        'Tiempo extra para exámenes',
        'Uso de tecnología de asistencia',
        'Materiales en formato audio',
        'Evaluaciones orales'
      ],
      'ADHD': [
        'Ambiente de trabajo tranquilo',
        'Instrucciones por escrito',
        'Descansos programados',
        'Sistema de organización visual'
      ],
      'DYSCALCULIA': [
        'Calculadora permitida',
        'Problemas con números más pequeños',
        'Uso de manipulativos',
        'Evaluaciones sin límite de tiempo'
      ]
    };

    return accommodations[needType] || [
      'Adaptaciones individualizadas según evaluación',
      'Apoyo tecnológico apropiado',
      'Modificaciones en el ambiente de aprendizaje'
    ];
  }

  /**
   * Obtiene adaptaciones culturales
   */
  private getCulturalAdaptations(needType: string, culturalContext: string): string[] {
    const culturalAdaptations: Record<string, Record<string, string[]>> = {
      'maya': {
        'DYSLEXIA': [
          'Usar historias orales tradicionales',
          'Incorporar símbolos mayas en el aprendizaje',
          'Aprovechar la tradición oral de la cultura'
        ],
        'ADHD': [
          'Usar actividades basadas en la naturaleza',
          'Incorporar rituales tradicionales',
          'Aprovechar el trabajo comunitario'
        ]
      },
      'nahuatl': {
        'LANGUAGE_DELAY': [
          'Usar palabras en náhuatl para conceptos básicos',
          'Incorporar historias tradicionales',
          'Aprovechar la riqueza lingüística indígena'
        ]
      }
    };

    return culturalAdaptations[culturalContext]?.[needType] || [
      'Adaptar materiales al contexto cultural local',
      'Incorporar elementos culturales relevantes',
      'Respetar las tradiciones y valores culturales'
    ];
  }

  /**
   * Entrena el modelo con datos de ejemplo
   */
  async trainModel(trainingData: { pattern: LearningPattern; needs: DetectedNeed[] }[]): Promise<void> {
    if (!this.model) {
      throw new Error('Modelo no inicializado');
    }

    console.log('🔄 Entrenando modelo de detección de necesidades...');

    // Preparar datos de entrenamiento
    const inputs: number[][] = [];
    const outputs: number[][] = [];

    trainingData.forEach(({ pattern, needs }) => {
      const inputFeatures = this.preprocessData(pattern).arraySync()[0];
      inputs.push(inputFeatures);

      // Crear vector de salida one-hot
      const output = new Array(this.outputClasses).fill(0);
      needs.forEach(need => {
        const needIndex = this.getNeedTypeIndex(need.type);
        if (needIndex !== -1) {
          output[needIndex] = need.confidence;
        }
      });
      outputs.push(output);
    });

    // Convertir a tensores
    const inputTensor = tf.tensor2d(inputs);
    const outputTensor = tf.tensor2d(outputs);

    // Entrenar modelo
    await this.model.fit(inputTensor, outputTensor, {
      epochs: 100,
      batchSize: 32,
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

    console.log('✅ Modelo entrenado exitosamente');
  }

  /**
   * Obtiene el índice de un tipo de necesidad
   */
  private getNeedTypeIndex(needType: string): number {
    const needTypes = [
      'DYSLEXIA', 'ADHD', 'DYSCALCULIA', 'AUDITORY_PROCESSING',
      'VISUAL_PROCESSING', 'LANGUAGE_DELAY', 'MOTOR_SKILLS', 'SOCIAL_ANXIETY'
    ];
    return needTypes.indexOf(needType);
  }

  /**
   * Guarda el modelo entrenado
   */
  async saveModel(): Promise<void> {
    if (!this.model) {
      throw new Error('Modelo no inicializado');
    }

    try {
      await this.model.save(`file://${process.cwd()}/public/ml-models/needs-detection-model`);
      console.log('✅ Modelo guardado exitosamente');
    } catch (error) {
      console.error('Error guardando modelo:', error);
      throw error;
    }
  }

  /**
   * Verifica si el modelo está listo
   */
  isReady(): boolean {
    return this.isLoaded && this.model !== null;
  }
}

// Instancia singleton
export const needsDetectionModel = new NeedsDetectionModel();
