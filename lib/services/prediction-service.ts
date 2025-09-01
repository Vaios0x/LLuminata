/**
 * Servicio de Predicciones para InclusiveAI Coach
 * Proporciona funcionalidades de machine learning para predecir comportamiento del usuario
 */

import * as tf from '@tensorflow/tfjs';

// Tipos para el servicio de predicciones
export interface PredictionConfig {
  enabled: boolean;
  modelPath: string;
  confidenceThreshold: number;
  updateInterval: number;
  maxPredictions: number;
  enableRealTime: boolean;
  dataRetentionDays: number;
}

export interface PredictionData {
  id: string;
  timestamp: number;
  userId?: string;
  sessionId: string;
  type: 'engagement' | 'conversion' | 'dropout' | 'performance' | 'preference';
  input: Record<string, any>;
  prediction: number;
  confidence: number;
  actual?: number;
  accuracy?: number;
  metadata?: Record<string, any>;
}

export interface PredictionModel {
  id: string;
  name: string;
  type: string;
  version: string;
  accuracy: number;
  lastUpdated: Date;
  isActive: boolean;
  config: {
    inputFeatures: string[];
    outputClasses: string[];
    modelArchitecture: any;
  };
}

export interface PredictionResult {
  prediction: number;
  confidence: number;
  class: string;
  probabilities: Record<string, number>;
  metadata: {
    modelId: string;
    modelVersion: string;
    predictionTime: number;
    inputFeatures: Record<string, any>;
  };
}

export interface PredictionAnalysis {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  confusionMatrix: number[][];
  featureImportance: Array<{
    feature: string;
    importance: number;
  }>;
  predictionsByType: Record<string, {
    count: number;
    accuracy: number;
    averageConfidence: number;
  }>;
  trends: Array<{
    date: string;
    accuracy: number;
    predictionsCount: number;
  }>;
}

export interface PredictionTrainingData {
  inputs: tf.Tensor;
  outputs: tf.Tensor;
  validationSplit?: number;
  shuffle?: boolean;
}

/**
 * Servicio principal de Predicciones
 */
export class PredictionService {
  private config: PredictionConfig;
  private models: Map<string, tf.LayersModel> = new Map();
  private modelConfigs: Map<string, PredictionModel> = new Map();
  private predictions: PredictionData[] = [];
  private isInitialized: boolean = false;
  private updateIntervalId: NodeJS.Timeout | null = null;
  private observers: Map<string, (data: any) => void> = new Map();

  constructor(config?: Partial<PredictionConfig>) {
    this.config = {
      enabled: true,
      modelPath: '/models/predictions',
      confidenceThreshold: 0.7,
      updateInterval: 5 * 60 * 1000, // 5 minutos
      maxPredictions: 10000,
      enableRealTime: true,
      dataRetentionDays: 30,
      ...config
    };

    this.initializeService();
  }

  /**
   * Inicializa el servicio
   */
  private async initializeService(): Promise<void> {
    if (!this.config.enabled) {
      console.log('⚠️ Servicio de predicciones deshabilitado');
      return;
    }

    try {
      console.log('🚀 Inicializando servicio de predicciones...');

      // Cargar modelos predefinidos
      await this.loadDefaultModels();

      // Configurar actualización automática
      if (this.config.enableRealTime) {
        this.startAutoUpdate();
      }

      this.isInitialized = true;
      console.log('✅ Servicio de predicciones inicializado');
    } catch (error) {
      console.error('❌ Error inicializando servicio de predicciones:', error);
      throw error;
    }
  }

  /**
   * Carga modelos predefinidos
   */
  private async loadDefaultModels(): Promise<void> {
    const defaultModels = [
      {
        id: 'engagement_predictor',
        name: 'Predictor de Engagement',
        type: 'engagement',
        path: `${this.config.modelPath}/engagement_model.json`
      },
      {
        id: 'conversion_predictor',
        name: 'Predictor de Conversión',
        type: 'conversion',
        path: `${this.config.modelPath}/conversion_model.json`
      },
      {
        id: 'dropout_predictor',
        name: 'Predictor de Abandono',
        type: 'dropout',
        path: `${this.config.modelPath}/dropout_model.json`
      },
      {
        id: 'performance_predictor',
        name: 'Predictor de Rendimiento',
        type: 'performance',
        path: `${this.config.modelPath}/performance_model.json`
      }
    ];

    for (const modelInfo of defaultModels) {
      try {
        await this.loadModel(modelInfo.id, modelInfo.path, modelInfo.name, modelInfo.type);
      } catch (error) {
        console.warn(`⚠️ No se pudo cargar el modelo ${modelInfo.id}:`, error);
      }
    }
  }

  /**
   * Carga un modelo específico
   */
  async loadModel(
    modelId: string, 
    modelPath: string, 
    name: string, 
    type: string
  ): Promise<void> {
    try {
      console.log(`📥 Cargando modelo: ${modelId}`);

      // Cargar modelo desde TensorFlow.js
      const model = await tf.loadLayersModel(modelPath);
      
      // Obtener configuración del modelo
      const config = this.getModelConfig(model, type);
      
      // Guardar modelo y configuración
      this.models.set(modelId, model);
      this.modelConfigs.set(modelId, {
        id: modelId,
        name,
        type,
        version: '1.0.0',
        accuracy: 0.85, // Valor por defecto
        lastUpdated: new Date(),
        isActive: true,
        config
      });

      console.log(`✅ Modelo ${modelId} cargado correctamente`);
    } catch (error) {
      console.error(`❌ Error cargando modelo ${modelId}:`, error);
      throw error;
    }
  }

  /**
   * Obtiene la configuración del modelo
   */
  private getModelConfig(model: tf.LayersModel, type: string): PredictionModel['config'] {
    const layers = model.layers;
    const inputLayer = layers[0];
    const outputLayer = layers[layers.length - 1];

    return {
      inputFeatures: this.getInputFeaturesForType(type),
      outputClasses: this.getOutputClassesForType(type),
      modelArchitecture: {
        inputShape: inputLayer.inputShape,
        outputShape: outputLayer.outputShape,
        layerCount: layers.length
      }
    };
  }

  /**
   * Obtiene las características de entrada para un tipo de predicción
   */
  private getInputFeaturesForType(type: string): string[] {
    const featureMaps: Record<string, string[]> = {
      engagement: [
        'session_duration',
        'page_views',
        'interactions_count',
        'scroll_depth',
        'time_on_page',
        'click_count',
        'form_interactions',
        'device_type',
        'browser_type',
        'location'
      ],
      conversion: [
        'session_duration',
        'page_views',
        'interactions_count',
        'form_completion_rate',
        'cart_additions',
        'checkout_steps',
        'payment_method',
        'device_type',
        'previous_purchases',
        'email_subscription'
      ],
      dropout: [
        'session_duration',
        'page_views',
        'interactions_count',
        'form_errors',
        'loading_times',
        'error_count',
        'device_type',
        'browser_type',
        'network_speed',
        'previous_sessions'
      ],
      performance: [
        'quiz_scores',
        'completion_time',
        'attempts_count',
        'help_requests',
        'error_count',
        'session_duration',
        'device_type',
        'browser_type',
        'network_speed',
        'previous_performance'
      ]
    };

    return featureMaps[type] || [];
  }

  /**
   * Obtiene las clases de salida para un tipo de predicción
   */
  private getOutputClassesForType(type: string): string[] {
    const classMaps: Record<string, string[]> = {
      engagement: ['bajo', 'medio', 'alto'],
      conversion: ['no_convierte', 'convierte'],
      dropout: ['no_abandona', 'abandona'],
      performance: ['bajo', 'medio', 'alto', 'excelente']
    };

    return classMaps[type] || [];
  }

  /**
   * Realiza una predicción
   */
  async predict(
    modelId: string,
    inputData: Record<string, any>,
    metadata?: Record<string, any>
  ): Promise<PredictionResult> {
    if (!this.isInitialized) {
      throw new Error('Servicio de predicciones no está inicializado');
    }

    const model = this.models.get(modelId);
    const modelConfig = this.modelConfigs.get(modelId);

    if (!model || !modelConfig) {
      throw new Error(`Modelo ${modelId} no encontrado`);
    }

    try {
      console.log(`🔮 Realizando predicción con modelo: ${modelId}`);

      // Preprocesar datos de entrada
      const inputTensor = this.preprocessInput(inputData, modelConfig.config.inputFeatures);
      
      // Realizar predicción
      const startTime = Date.now();
      const prediction = await model.predict(inputTensor) as tf.Tensor;
      const predictionTime = Date.now() - startTime;

      // Procesar resultados
      const predictionArray = await prediction.array() as number[][];
      const probabilities = predictionArray[0];
      const maxIndex = probabilities.indexOf(Math.max(...probabilities));
      const confidence = probabilities[maxIndex];
      const predictedClass = modelConfig.config.outputClasses[maxIndex];

      // Crear resultado
      const result: PredictionResult = {
        prediction: maxIndex,
        confidence,
        class: predictedClass,
        probabilities: this.createProbabilitiesMap(probabilities, modelConfig.config.outputClasses),
        metadata: {
          modelId,
          modelVersion: modelConfig.version,
          predictionTime,
          inputFeatures: inputData
        }
      };

      // Guardar predicción si cumple con el umbral de confianza
      if (confidence >= this.config.confidenceThreshold) {
        this.savePrediction(modelId, inputData, result, metadata);
      }

      // Limpiar tensores
      inputTensor.dispose();
      prediction.dispose();

      console.log(`✅ Predicción completada: ${predictedClass} (${(confidence * 100).toFixed(1)}%)`);
      return result;
    } catch (error) {
      console.error(`❌ Error en predicción con modelo ${modelId}:`, error);
      throw error;
    }
  }

  /**
   * Preprocesa los datos de entrada
   */
  private preprocessInput(inputData: Record<string, any>, features: string[]): tf.Tensor {
    const processedFeatures: number[] = [];

    features.forEach(feature => {
      let value = inputData[feature] || 0;

      // Normalizar valores según el tipo de característica
      switch (feature) {
        case 'session_duration':
          value = Math.min(value / 3600000, 1); // Normalizar a horas
          break;
        case 'page_views':
          value = Math.min(value / 50, 1); // Normalizar a máximo 50 páginas
          break;
        case 'interactions_count':
          value = Math.min(value / 100, 1); // Normalizar a máximo 100 interacciones
          break;
        case 'scroll_depth':
          value = value / 100; // Ya está en porcentaje
          break;
        case 'time_on_page':
          value = Math.min(value / 300000, 1); // Normalizar a 5 minutos
          break;
        case 'click_count':
          value = Math.min(value / 50, 1); // Normalizar a máximo 50 clicks
          break;
        case 'form_completion_rate':
          value = value / 100; // Ya está en porcentaje
          break;
        case 'cart_additions':
          value = Math.min(value / 10, 1); // Normalizar a máximo 10 items
          break;
        case 'checkout_steps':
          value = Math.min(value / 5, 1); // Normalizar a máximo 5 pasos
          break;
        case 'form_errors':
          value = Math.min(value / 10, 1); // Normalizar a máximo 10 errores
          break;
        case 'loading_times':
          value = Math.min(value / 10000, 1); // Normalizar a 10 segundos
          break;
        case 'error_count':
          value = Math.min(value / 20, 1); // Normalizar a máximo 20 errores
          break;
        case 'quiz_scores':
          value = value / 100; // Ya está en porcentaje
          break;
        case 'completion_time':
          value = Math.min(value / 1800000, 1); // Normalizar a 30 minutos
          break;
        case 'attempts_count':
          value = Math.min(value / 5, 1); // Normalizar a máximo 5 intentos
          break;
        case 'help_requests':
          value = Math.min(value / 10, 1); // Normalizar a máximo 10 solicitudes
          break;
        case 'network_speed':
          value = Math.min(value / 100, 1); // Normalizar a 100 Mbps
          break;
        case 'previous_purchases':
          value = Math.min(value / 20, 1); // Normalizar a máximo 20 compras
          break;
        case 'previous_sessions':
          value = Math.min(value / 50, 1); // Normalizar a máximo 50 sesiones
          break;
        case 'previous_performance':
          value = value / 100; // Ya está en porcentaje
          break;
        default:
          // Para características categóricas, usar valores numéricos
          if (typeof value === 'string') {
            value = this.hashString(value) / 1000; // Normalizar hash
          }
      }

      processedFeatures.push(value);
    });

    return tf.tensor2d([processedFeatures], [1, processedFeatures.length]);
  }

  /**
   * Crea un mapa de probabilidades
   */
  private createProbabilitiesMap(probabilities: number[], classes: string[]): Record<string, number> {
    const map: Record<string, number> = {};
    classes.forEach((className, index) => {
      map[className] = probabilities[index];
    });
    return map;
  }

  /**
   * Hash simple para strings
   */
  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convertir a entero de 32 bits
    }
    return Math.abs(hash);
  }

  /**
   * Guarda una predicción
   */
  private savePrediction(
    modelId: string,
    inputData: Record<string, any>,
    result: PredictionResult,
    metadata?: Record<string, any>
  ): void {
    const prediction: PredictionData = {
      id: this.generateId(),
      timestamp: Date.now(),
      sessionId: metadata?.sessionId || 'unknown',
      type: this.modelConfigs.get(modelId)?.type as any,
      input: inputData,
      prediction: result.prediction,
      confidence: result.confidence,
      metadata
    };

    this.predictions.push(prediction);

    // Limitar número de predicciones
    if (this.predictions.length > this.config.maxPredictions) {
      this.predictions.shift();
    }

    // Notificar a observadores
    this.notifyObservers('prediction', prediction);
  }

  /**
   * Actualiza una predicción con el valor real
   */
  updatePrediction(predictionId: string, actualValue: number): void {
    const prediction = this.predictions.find(p => p.id === predictionId);
    if (prediction) {
      prediction.actual = actualValue;
      prediction.accuracy = this.calculateAccuracy(prediction.prediction, actualValue);
      
      console.log(`📊 Predicción actualizada: ${predictionId} - Accuracy: ${prediction.accuracy}`);
    }
  }

  /**
   * Calcula la precisión de una predicción
   */
  private calculateAccuracy(predicted: number, actual: number): number {
    return predicted === actual ? 1 : 0;
  }

  /**
   * Analiza las predicciones
   */
  analyzePredictions(filters?: {
    startDate?: number;
    endDate?: number;
    modelId?: string;
    type?: string;
    minConfidence?: number;
  }): PredictionAnalysis {
    let filteredPredictions = this.predictions;

    // Aplicar filtros
    if (filters) {
      if (filters.startDate) {
        filteredPredictions = filteredPredictions.filter(p => p.timestamp >= filters.startDate!);
      }
      if (filters.endDate) {
        filteredPredictions = filteredPredictions.filter(p => p.timestamp <= filters.endDate!);
      }
      if (filters.modelId) {
        filteredPredictions = filteredPredictions.filter(p => p.metadata?.modelId === filters.modelId);
      }
      if (filters.type) {
        filteredPredictions = filteredPredictions.filter(p => p.type === filters.type);
      }
      if (filters.minConfidence) {
        filteredPredictions = filteredPredictions.filter(p => p.confidence >= filters.minConfidence!);
      }
    }

    // Calcular métricas
    const accuracy = this.calculateOverallAccuracy(filteredPredictions);
    const precision = this.calculatePrecision(filteredPredictions);
    const recall = this.calculateRecall(filteredPredictions);
    const f1Score = this.calculateF1Score(precision, recall);
    const confusionMatrix = this.calculateConfusionMatrix(filteredPredictions);
    const featureImportance = this.calculateFeatureImportance(filteredPredictions);
    const predictionsByType = this.calculatePredictionsByType(filteredPredictions);
    const trends = this.calculateTrends(filteredPredictions);

    return {
      accuracy,
      precision,
      recall,
      f1Score,
      confusionMatrix,
      featureImportance,
      predictionsByType,
      trends
    };
  }

  /**
   * Calcula la precisión general
   */
  private calculateOverallAccuracy(predictions: PredictionData[]): number {
    const predictionsWithActual = predictions.filter(p => p.actual !== undefined);
    if (predictionsWithActual.length === 0) return 0;

    const correct = predictionsWithActual.filter(p => p.accuracy === 1).length;
    return correct / predictionsWithActual.length;
  }

  /**
   * Calcula la precisión
   */
  private calculatePrecision(predictions: PredictionData[]): number {
    // Implementación simplificada - en producción se calcularía por clase
    return this.calculateOverallAccuracy(predictions);
  }

  /**
   * Calcula el recall
   */
  private calculateRecall(predictions: PredictionData[]): number {
    // Implementación simplificada - en producción se calcularía por clase
    return this.calculateOverallAccuracy(predictions);
  }

  /**
   * Calcula el F1-Score
   */
  private calculateF1Score(precision: number, recall: number): number {
    if (precision + recall === 0) return 0;
    return (2 * precision * recall) / (precision + recall);
  }

  /**
   * Calcula la matriz de confusión
   */
  private calculateConfusionMatrix(predictions: PredictionData[]): number[][] {
    // Implementación simplificada para clasificación binaria
    const predictionsWithActual = predictions.filter(p => p.actual !== undefined);
    let truePositives = 0;
    let falsePositives = 0;
    let trueNegatives = 0;
    let falseNegatives = 0;

    predictionsWithActual.forEach(p => {
      if (p.prediction === 1 && p.actual === 1) truePositives++;
      else if (p.prediction === 1 && p.actual === 0) falsePositives++;
      else if (p.prediction === 0 && p.actual === 0) trueNegatives++;
      else if (p.prediction === 0 && p.actual === 1) falseNegatives++;
    });

    return [
      [trueNegatives, falsePositives],
      [falseNegatives, truePositives]
    ];
  }

  /**
   * Calcula la importancia de características
   */
  private calculateFeatureImportance(predictions: PredictionData[]): Array<{feature: string, importance: number}> {
    // Implementación simplificada - en producción se usaría SHAP o similar
    const features = ['session_duration', 'page_views', 'interactions_count', 'scroll_depth'];
    return features.map(feature => ({
      feature,
      importance: Math.random() // Placeholder
    })).sort((a, b) => b.importance - a.importance);
  }

  /**
   * Calcula predicciones por tipo
   */
  private calculatePredictionsByType(predictions: PredictionData[]): Record<string, {
    count: number;
    accuracy: number;
    averageConfidence: number;
  }> {
    const typeStats: Record<string, {
      count: number;
      correct: number;
      totalConfidence: number;
    }> = {};

    predictions.forEach(p => {
      if (!typeStats[p.type]) {
        typeStats[p.type] = { count: 0, correct: 0, totalConfidence: 0 };
      }

      typeStats[p.type].count++;
      typeStats[p.type].totalConfidence += p.confidence;

      if (p.accuracy === 1) {
        typeStats[p.type].correct++;
      }
    });

    const result: Record<string, {
      count: number;
      accuracy: number;
      averageConfidence: number;
    }> = {};

    Object.entries(typeStats).forEach(([type, stats]) => {
      result[type] = {
        count: stats.count,
        accuracy: stats.count > 0 ? stats.correct / stats.count : 0,
        averageConfidence: stats.count > 0 ? stats.totalConfidence / stats.count : 0
      };
    });

    return result;
  }

  /**
   * Calcula tendencias
   */
  private calculateTrends(predictions: PredictionData[]): Array<{
    date: string;
    accuracy: number;
    predictionsCount: number;
  }> {
    const dailyStats: Record<string, {
      correct: number;
      total: number;
      count: number;
    }> = {};

    predictions.forEach(p => {
      const date = new Date(p.timestamp).toISOString().split('T')[0];
      
      if (!dailyStats[date]) {
        dailyStats[date] = { correct: 0, total: 0, count: 0 };
      }

      dailyStats[date].count++;
      if (p.actual !== undefined) {
        dailyStats[date].total++;
        if (p.accuracy === 1) {
          dailyStats[date].correct++;
        }
      }
    });

    return Object.entries(dailyStats)
      .map(([date, stats]) => ({
        date,
        accuracy: stats.total > 0 ? stats.correct / stats.total : 0,
        predictionsCount: stats.count
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Entrena un modelo
   */
  async trainModel(
    modelId: string,
    trainingData: PredictionTrainingData,
    options?: {
      epochs?: number;
      batchSize?: number;
      validationSplit?: number;
    }
  ): Promise<void> {
    const model = this.models.get(modelId);
    if (!model) {
      throw new Error(`Modelo ${modelId} no encontrado`);
    }

    try {
      console.log(`🏋️ Entrenando modelo: ${modelId}`);

      const {
        epochs = 50,
        batchSize = 32,
        validationSplit = 0.2
      } = options || {};

      await model.fit(trainingData.inputs, trainingData.outputs, {
        epochs,
        batchSize,
        validationSplit,
        shuffle: trainingData.shuffle !== false,
        callbacks: {
          onEpochEnd: (epoch, logs) => {
            console.log(`Época ${epoch + 1}: loss=${logs?.loss?.toFixed(4)}, accuracy=${logs?.acc?.toFixed(4)}`);
          }
        }
      });

      // Actualizar configuración del modelo
      const modelConfig = this.modelConfigs.get(modelId);
      if (modelConfig) {
        modelConfig.lastUpdated = new Date();
        // En producción se calcularía la precisión real
        modelConfig.accuracy = 0.9;
      }

      console.log(`✅ Modelo ${modelId} entrenado correctamente`);
    } catch (error) {
      console.error(`❌ Error entrenando modelo ${modelId}:`, error);
      throw error;
    }
  }

  /**
   * Inicia actualización automática
   */
  private startAutoUpdate(): void {
    this.updateIntervalId = setInterval(() => {
      this.performAutoUpdate();
    }, this.config.updateInterval);
  }

  /**
   * Realiza actualización automática
   */
  private async performAutoUpdate(): Promise<void> {
    try {
      console.log('🔄 Realizando actualización automática de modelos...');

      // Reentrenar modelos con nuevos datos
      for (const [modelId, modelConfig] of this.modelConfigs) {
        if (modelConfig.isActive) {
          const recentPredictions = this.predictions.filter(p => 
            p.metadata?.modelId === modelId && 
            p.timestamp > Date.now() - (7 * 24 * 60 * 60 * 1000) // Última semana
          );

          if (recentPredictions.length > 100) {
            // Crear datos de entrenamiento
            const trainingData = this.createTrainingDataFromPredictions(recentPredictions);
            
            // Reentrenar modelo
            await this.trainModel(modelId, trainingData, {
              epochs: 10,
              batchSize: 16
            });
          }
        }
      }

      console.log('✅ Actualización automática completada');
    } catch (error) {
      console.error('❌ Error en actualización automática:', error);
    }
  }

  /**
   * Crea datos de entrenamiento desde predicciones
   */
  private createTrainingDataFromPredictions(predictions: PredictionData[]): PredictionTrainingData {
    const inputs: number[][] = [];
    const outputs: number[][] = [];

    predictions.forEach(p => {
      if (p.actual !== undefined) {
        // Convertir entrada a array numérico
        const inputArray = Object.values(p.input).map(v => 
          typeof v === 'number' ? v : this.hashString(String(v))
        );
        inputs.push(inputArray);

        // Convertir salida a one-hot encoding
        const outputArray = new Array(4).fill(0);
        outputArray[p.actual] = 1;
        outputs.push(outputArray);
      }
    });

    return {
      inputs: tf.tensor2d(inputs),
      outputs: tf.tensor2d(outputs),
      validationSplit: 0.2,
      shuffle: true
    };
  }

  /**
   * Obtiene el estado del servicio
   */
  getStatus(): {
    isInitialized: boolean;
    isEnabled: boolean;
    modelsCount: number;
    predictionsCount: number;
    lastPrediction: number;
    autoUpdateEnabled: boolean;
  } {
    return {
      isInitialized: this.isInitialized,
      isEnabled: this.config.enabled,
      modelsCount: this.models.size,
      predictionsCount: this.predictions.length,
      lastPrediction: this.predictions.length > 0 
        ? Math.max(...this.predictions.map(p => p.timestamp))
        : 0,
      autoUpdateEnabled: this.config.enableRealTime
    };
  }

  /**
   * Obtiene información de modelos
   */
  getModels(): PredictionModel[] {
    return Array.from(this.modelConfigs.values());
  }

  /**
   * Actualiza la configuración
   */
  updateConfig(newConfig: Partial<PredictionConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('⚙️ Configuración de predicciones actualizada');
  }

  /**
   * Limpia datos antiguos
   */
  cleanup(maxAge?: number): void {
    const cutoff = maxAge || (this.config.dataRetentionDays * 24 * 60 * 60 * 1000);
    const now = Date.now();
    
    this.predictions = this.predictions.filter(p => (now - p.timestamp) < cutoff);
    
    console.log(`🧹 Limpieza de datos de predicciones completada. ${this.predictions.length} predicciones restantes`);
  }

  /**
   * Limpia todos los recursos
   */
  async cleanup(): Promise<void> {
    // Detener actualización automática
    if (this.updateIntervalId) {
      clearInterval(this.updateIntervalId);
      this.updateIntervalId = null;
    }

    // Limpiar modelos
    for (const model of this.models.values()) {
      model.dispose();
    }
    this.models.clear();
    this.modelConfigs.clear();

    // Limpiar datos
    this.predictions = [];
    this.observers.clear();

    console.log('🧹 Servicio de predicciones limpiado');
  }

  // Métodos auxiliares
  private generateId(): string {
    return `prediction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private notifyObservers(event: string, data: any): void {
    console.log(`🔮 Evento de predicción: ${event}`, data);
  }
}

// Instancia singleton del servicio
export const predictionService = new PredictionService();

// Exportar el servicio como default
export default predictionService;
