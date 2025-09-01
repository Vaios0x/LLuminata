/**
 * Servicio de TensorFlow.js para InclusiveAI Coach
 * Proporciona funcionalidades de machine learning para análisis educativo
 */

import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';
import '@tensorflow/tfjs-backend-cpu';

// Tipos para el servicio
export interface ModelConfig {
  name: string;
  version: string;
  inputShape: number[];
  outputShape: number[];
  layers: any[];
}

export interface TrainingData {
  inputs: tf.Tensor;
  outputs: tf.Tensor;
  validationSplit?: number;
}

export interface PredictionResult {
  predictions: tf.Tensor;
  confidence: number;
  metadata: any;
}

export interface ModelStatus {
  isLoaded: boolean;
  isTraining: boolean;
  accuracy?: number;
  loss?: number;
  lastUpdated: Date;
}

/**
 * Servicio principal de TensorFlow.js
 */
export class TensorFlowService {
  private models: Map<string, tf.LayersModel> = new Map();
  private modelConfigs: Map<string, ModelConfig> = new Map();
  private modelStatus: Map<string, ModelStatus> = new Map();
  private isInitialized: boolean = false;

  constructor() {
    this.initializeTensorFlow();
  }

  /**
   * Inicializa TensorFlow.js
   */
  private async initializeTensorFlow(): Promise<void> {
    try {
      console.log('🚀 Inicializando TensorFlow.js...');
      
      // Configurar backend
      await tf.setBackend('webgl');
      await tf.ready();
      
      console.log(`✅ TensorFlow.js inicializado con backend: ${tf.getBackend()}`);
      console.log(`📊 Memoria disponible: ${tf.memory().numBytes} bytes`);
      
      this.isInitialized = true;
    } catch (error) {
      console.error('❌ Error inicializando TensorFlow.js:', error);
      throw error;
    }
  }

  /**
   * Verifica si el servicio está listo
   */
  isReady(): boolean {
    return this.isInitialized && tf.getBackend() !== undefined;
  }

  /**
   * Crea un modelo personalizado
   */
  async createModel(config: ModelConfig): Promise<tf.LayersModel> {
    if (!this.isReady()) {
      throw new Error('TensorFlow.js no está inicializado');
    }

    try {
      console.log(`🔧 Creando modelo: ${config.name}`);

      const model = tf.sequential({
        layers: config.layers
      });

      // Compilar el modelo
      model.compile({
        optimizer: tf.train.adam(0.001),
        loss: 'categoricalCrossentropy',
        metrics: ['accuracy']
      });

      // Guardar configuración y estado
      this.models.set(config.name, model);
      this.modelConfigs.set(config.name, config);
      this.modelStatus.set(config.name, {
        isLoaded: true,
        isTraining: false,
        lastUpdated: new Date()
      });

      console.log(`✅ Modelo ${config.name} creado exitosamente`);
      return model;
    } catch (error) {
      console.error(`❌ Error creando modelo ${config.name}:`, error);
      throw error;
    }
  }

  /**
   * Carga un modelo pre-entrenado
   */
  async loadModel(modelPath: string, modelName: string): Promise<tf.LayersModel> {
    if (!this.isReady()) {
      throw new Error('TensorFlow.js no está inicializado');
    }

    try {
      console.log(`📥 Cargando modelo: ${modelName} desde ${modelPath}`);

      const model = await tf.loadLayersModel(modelPath);
      
      this.models.set(modelName, model);
      this.modelStatus.set(modelName, {
        isLoaded: true,
        isTraining: false,
        lastUpdated: new Date()
      });

      console.log(`✅ Modelo ${modelName} cargado exitosamente`);
      return model;
    } catch (error) {
      console.error(`❌ Error cargando modelo ${modelName}:`, error);
      throw error;
    }
  }

  /**
   * Entrena un modelo
   */
  async trainModel(
    modelName: string, 
    trainingData: TrainingData, 
    options: {
      epochs?: number;
      batchSize?: number;
      callbacks?: any[];
    } = {}
  ): Promise<tf.History> {
    const model = this.models.get(modelName);
    if (!model) {
      throw new Error(`Modelo ${modelName} no encontrado`);
    }

    try {
      console.log(`🎯 Entrenando modelo: ${modelName}`);

      // Actualizar estado
      const status = this.modelStatus.get(modelName);
      if (status) {
        status.isTraining = true;
        this.modelStatus.set(modelName, status);
      }

      // Configurar callbacks
      const callbacks = [
        tf.callbacks.earlyStopping({ patience: 5 }),
        tf.callbacks.modelCheckpoint(`./models/${modelName}_checkpoint`),
        ...(options.callbacks || [])
      ];

      // Entrenar modelo
      const history = await model.fit(trainingData.inputs, trainingData.outputs, {
        epochs: options.epochs || 50,
        batchSize: options.batchSize || 32,
        validationSplit: trainingData.validationSplit || 0.2,
        callbacks,
        verbose: 1
      });

      // Actualizar estado con métricas
      if (status) {
        status.isTraining = false;
        status.accuracy = history.history.acc ? history.history.acc[history.history.acc.length - 1] : undefined;
        status.loss = history.history.loss ? history.history.loss[history.history.loss.length - 1] : undefined;
        status.lastUpdated = new Date();
        this.modelStatus.set(modelName, status);
      }

      console.log(`✅ Modelo ${modelName} entrenado exitosamente`);
      return history;
    } catch (error) {
      console.error(`❌ Error entrenando modelo ${modelName}:`, error);
      
      // Resetear estado de entrenamiento
      const status = this.modelStatus.get(modelName);
      if (status) {
        status.isTraining = false;
        this.modelStatus.set(modelName, status);
      }
      
      throw error;
    }
  }

  /**
   * Realiza predicciones con un modelo
   */
  async predict(
    modelName: string, 
    input: tf.Tensor, 
    options: {
      threshold?: number;
      returnProbabilities?: boolean;
    } = {}
  ): Promise<PredictionResult> {
    const model = this.models.get(modelName);
    if (!model) {
      throw new Error(`Modelo ${modelName} no encontrado`);
    }

    try {
      console.log(`🔮 Realizando predicción con modelo: ${modelName}`);

      // Realizar predicción
      const predictions = await model.predict(input) as tf.Tensor;
      
      // Calcular confianza
      const maxProb = tf.max(predictions);
      const confidence = await maxProb.data();

      // Aplicar umbral si se especifica
      let finalPredictions = predictions;
      if (options.threshold) {
        finalPredictions = tf.where(
          predictions.greater(options.threshold),
          predictions,
          tf.zeros(predictions.shape)
        );
      }

      const result: PredictionResult = {
        predictions: finalPredictions,
        confidence: confidence[0],
        metadata: {
          modelName,
          timestamp: new Date().toISOString(),
          inputShape: input.shape,
          outputShape: predictions.shape
        }
      };

      console.log(`✅ Predicción completada con confianza: ${confidence[0]}`);
      return result;
    } catch (error) {
      console.error(`❌ Error en predicción con modelo ${modelName}:`, error);
      throw error;
    }
  }

  /**
   * Evalúa un modelo
   */
  async evaluateModel(
    modelName: string, 
    testData: TrainingData
  ): Promise<{ loss: number; accuracy: number }> {
    const model = this.models.get(modelName);
    if (!model) {
      throw new Error(`Modelo ${modelName} no encontrado`);
    }

    try {
      console.log(`📊 Evaluando modelo: ${modelName}`);

      const evaluation = await model.evaluate(testData.inputs, testData.outputs) as tf.Scalar[];
      
      const loss = await evaluation[0].data();
      const accuracy = await evaluation[1].data();

      console.log(`✅ Evaluación completada - Loss: ${loss[0]}, Accuracy: ${accuracy[0]}`);
      
      return {
        loss: loss[0],
        accuracy: accuracy[0]
      };
    } catch (error) {
      console.error(`❌ Error evaluando modelo ${modelName}:`, error);
      throw error;
    }
  }

  /**
   * Guarda un modelo
   */
  async saveModel(modelName: string, path: string): Promise<void> {
    const model = this.models.get(modelName);
    if (!model) {
      throw new Error(`Modelo ${modelName} no encontrado`);
    }

    try {
      console.log(`💾 Guardando modelo: ${modelName} en ${path}`);

      await model.save(`file://${path}`);
      
      console.log(`✅ Modelo ${modelName} guardado exitosamente`);
    } catch (error) {
      console.error(`❌ Error guardando modelo ${modelName}:`, error);
      throw error;
    }
  }

  /**
   * Elimina un modelo de memoria
   */
  async disposeModel(modelName: string): Promise<void> {
    const model = this.models.get(modelName);
    if (!model) {
      return;
    }

    try {
      console.log(`🗑️ Eliminando modelo: ${modelName}`);

      model.dispose();
      this.models.delete(modelName);
      this.modelConfigs.delete(modelName);
      this.modelStatus.delete(modelName);

      console.log(`✅ Modelo ${modelName} eliminado exitosamente`);
    } catch (error) {
      console.error(`❌ Error eliminando modelo ${modelName}:`, error);
      throw error;
    }
  }

  /**
   * Obtiene el estado de todos los modelos
   */
  getModelStatus(): Map<string, ModelStatus> {
    return new Map(this.modelStatus);
  }

  /**
   * Obtiene información de memoria
   */
  getMemoryInfo(): tf.MemoryInfo {
    return tf.memory();
  }

  /**
   * Limpia memoria no utilizada
   */
  async cleanup(): Promise<void> {
    try {
      console.log('🧹 Limpiando memoria de TensorFlow.js...');
      
      // Limpiar tensores temporales
      tf.tidy(() => {
        // Los tensores se limpian automáticamente
      });
      
      // Forzar limpieza de memoria
      tf.disposeVariables();
      
      console.log('✅ Memoria de TensorFlow.js limpiada');
    } catch (error) {
      console.error('❌ Error limpiando memoria:', error);
    }
  }

  /**
   * Crea un modelo de clasificación simple
   */
  async createClassificationModel(
    inputShape: number[], 
    numClasses: number, 
    modelName: string
  ): Promise<tf.LayersModel> {
    const config: ModelConfig = {
      name: modelName,
      version: '1.0.0',
      inputShape,
      outputShape: [numClasses],
      layers: [
        tf.layers.dense({
          units: 128,
          activation: 'relu',
          inputShape
        }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({
          units: 64,
          activation: 'relu'
        }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({
          units: numClasses,
          activation: 'softmax'
        })
      ]
    };

    return await this.createModel(config);
  }

  /**
   * Crea un modelo de regresión simple
   */
  async createRegressionModel(
    inputShape: number[], 
    outputUnits: number, 
    modelName: string
  ): Promise<tf.LayersModel> {
    const config: ModelConfig = {
      name: modelName,
      version: '1.0.0',
      inputShape,
      outputShape: [outputUnits],
      layers: [
        tf.layers.dense({
          units: 64,
          activation: 'relu',
          inputShape
        }),
        tf.layers.dropout({ rate: 0.1 }),
        tf.layers.dense({
          units: 32,
          activation: 'relu'
        }),
        tf.layers.dense({
          units: outputUnits,
          activation: 'linear'
        })
      ]
    };

    return await this.createModel(config);
  }

  /**
   * Preprocesa datos de texto para NLP
   */
  preprocessText(text: string, maxLength: number = 100): tf.Tensor {
    // Tokenización simple (en producción usar un tokenizer real)
    const words = text.toLowerCase().split(/\s+/);
    const tokens = words.slice(0, maxLength).map(word => 
      word.charCodeAt(0) % 1000 // Hash simple
    );
    
    // Padding
    while (tokens.length < maxLength) {
      tokens.push(0);
    }
    
    return tf.tensor2d([tokens], [1, maxLength]);
  }

  /**
   * Preprocesa datos de audio
   */
  preprocessAudio(audioData: Float32Array, sampleRate: number = 16000): tf.Tensor {
    // Normalizar audio
    const normalized = audioData.map(sample => sample / 32768.0);
    
    // Convertir a tensor
    return tf.tensor2d([normalized], [1, normalized.length]);
  }

  /**
   * Preprocesa datos de comportamiento
   */
  preprocessBehaviorData(data: any[]): tf.Tensor {
    // Normalizar datos de comportamiento
    const features = data.map(item => [
      item.attention || 0,
      item.engagement || 0,
      item.progress || 0,
      item.timeSpent || 0,
      item.errors || 0
    ]);
    
    return tf.tensor2d(features);
  }
}

// Instancia singleton del servicio
export const tensorFlowService = new TensorFlowService();

// Exportar tipos útiles
export type {
  ModelConfig,
  TrainingData,
  PredictionResult,
  ModelStatus
};
