/**
 * Hook para manejo de predicciones y análisis predictivo
 * Proporciona funcionalidades para modelos de ML, predicciones y análisis de tendencias
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { AnalyticsService } from '../analytics/analytics-service';

// Interfaces
interface PredictionModel {
  id: string;
  name: string;
  description: string;
  type: 'REGRESSION' | 'CLASSIFICATION' | 'CLUSTERING' | 'TIME_SERIES' | 'RECOMMENDATION';
  algorithm: string;
  version: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  isActive: boolean;
  lastTrained: Date;
  nextTraining: Date;
  features: string[];
  targetVariable: string;
  metadata: {
    trainingDataSize: number;
    validationDataSize: number;
    hyperparameters: Record<string, any>;
    modelSize: number; // En MB
    trainingTime: number; // En segundos
  };
  createdAt: Date;
  updatedAt: Date;
}

interface Prediction {
  id: string;
  modelId: string;
  userId?: string;
  input: Record<string, any>;
  output: {
    predictedValue: any;
    confidence: number;
    probability?: number;
    alternatives?: Array<{
      value: any;
      probability: number;
    }>;
  };
  timestamp: Date;
  isCorrect?: boolean;
  actualValue?: any;
  feedback?: string;
}

interface PredictionConfig {
  id: string;
  name: string;
  description: string;
  modelId: string;
  trigger: 'MANUAL' | 'SCHEDULED' | 'EVENT_BASED' | 'REALTIME';
  schedule?: {
    frequency: 'HOURLY' | 'DAILY' | 'WEEKLY' | 'MONTHLY';
    time: string;
    timezone: string;
  };
  conditions: {
    threshold: number;
    minConfidence: number;
    maxRetries: number;
  };
  notifications: {
    email: boolean;
    push: boolean;
    webhook?: string;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface PredictionInsight {
  id: string;
  type: 'TREND' | 'ANOMALY' | 'PATTERN' | 'RECOMMENDATION';
  title: string;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  confidence: number;
  data: {
    currentValue: number;
    predictedValue: number;
    change: number;
    changePercent: number;
    timeframe: string;
  };
  recommendations: string[];
  createdAt: Date;
  expiresAt?: Date;
}

interface PredictionStats {
  totalPredictions: number;
  accuracy: number;
  averageConfidence: number;
  predictionsByModel: Record<string, number>;
  predictionsByType: Record<string, number>;
  recentAccuracy: number;
  trendingInsights: PredictionInsight[];
  modelPerformance: Array<{
    modelId: string;
    modelName: string;
    accuracy: number;
    predictions: number;
    lastUsed: Date;
  }>;
}

interface UsePredictionsReturn {
  // Estado
  models: PredictionModel[];
  predictions: Prediction[];
  configs: PredictionConfig[];
  insights: PredictionInsight[];
  stats: PredictionStats;
  loading: boolean;
  error: string | null;
  
  // Acciones de modelos
  createModel: (modelData: Partial<PredictionModel>) => Promise<PredictionModel>;
  updateModel: (modelId: string, updates: Partial<PredictionModel>) => Promise<void>;
  deleteModel: (modelId: string) => Promise<void>;
  trainModel: (modelId: string, trainingData: any) => Promise<void>;
  evaluateModel: (modelId: string, testData: any) => Promise<any>;
  
  // Acciones de predicciones
  makePrediction: (modelId: string, input: Record<string, any>) => Promise<Prediction>;
  batchPredict: (modelId: string, inputs: Record<string, any>[]) => Promise<Prediction[]>;
  updatePrediction: (predictionId: string, actualValue: any, feedback?: string) => Promise<void>;
  
  // Acciones de configuración
  createConfig: (configData: Partial<PredictionConfig>) => Promise<PredictionConfig>;
  updateConfig: (configId: string, updates: Partial<PredictionConfig>) => Promise<void>;
  deleteConfig: (configId: string) => Promise<void>;
  activateConfig: (configId: string) => Promise<void>;
  
  // Acciones de insights
  generateInsights: (modelId: string, timeframe: string) => Promise<PredictionInsight[]>;
  dismissInsight: (insightId: string) => Promise<void>;
  getInsightRecommendations: (insightId: string) => Promise<string[]>;
  
  // Utilidades
  getModelAccuracy: (modelId: string) => number;
  getPredictionHistory: (modelId: string) => Prediction[];
  getModelPerformance: () => Array<{ modelId: string; accuracy: number; predictions: number }>;
  getActiveInsights: () => PredictionInsight[];
  getPredictionStats: () => PredictionStats;
  validateInput: (modelId: string, input: Record<string, any>) => boolean;
  getFeatureImportance: (modelId: string) => Record<string, number>;
}

export const usePredictions = (): UsePredictionsReturn => {
  const { user } = useAuth();
  const [models, setModels] = useState<PredictionModel[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [configs, setConfigs] = useState<PredictionConfig[]>([]);
  const [insights, setInsights] = useState<PredictionInsight[]>([]);
  const [stats, setStats] = useState<PredictionStats>({
    totalPredictions: 0,
    accuracy: 0,
    averageConfidence: 0,
    predictionsByModel: {},
    predictionsByType: {},
    recentAccuracy: 0,
    trendingInsights: [],
    modelPerformance: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const analyticsService = new AnalyticsService();

  // Cargar modelos de predicción
  const loadModels = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const predictionModels = await analyticsService.getPredictionModels();
      setModels(predictionModels);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar modelos de predicción');
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar predicciones
  const loadPredictions = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const userPredictions = await analyticsService.getUserPredictions(user.id);
      setPredictions(userPredictions);
      
      // Calcular estadísticas
      const predictionStats = calculatePredictionStats(userPredictions, models);
      setStats(predictionStats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar predicciones');
    }
  }, [user?.id, models]);

  // Cargar configuraciones
  const loadConfigs = useCallback(async () => {
    try {
      const predictionConfigs = await analyticsService.getPredictionConfigs();
      setConfigs(predictionConfigs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar configuraciones');
    }
  }, []);

  // Cargar insights
  const loadInsights = useCallback(async () => {
    try {
      const predictionInsights = await analyticsService.getPredictionInsights();
      setInsights(predictionInsights);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar insights');
    }
  }, []);

  // Calcular estadísticas de predicciones
  const calculatePredictionStats = useCallback((
    userPredictions: Prediction[], 
    predictionModels: PredictionModel[]
  ): PredictionStats => {
    const totalPredictions = userPredictions.length;
    const correctPredictions = userPredictions.filter(p => p.isCorrect === true).length;
    const accuracy = totalPredictions > 0 ? (correctPredictions / totalPredictions) * 100 : 0;
    
    const averageConfidence = userPredictions.length > 0 ? 
      userPredictions.reduce((sum, p) => sum + p.output.confidence, 0) / userPredictions.length : 0;
    
    const predictionsByModel = userPredictions.reduce((acc, p) => {
      acc[p.modelId] = (acc[p.modelId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const predictionsByType = userPredictions.reduce((acc, p) => {
      const model = predictionModels.find(m => m.id === p.modelId);
      const type = model?.type || 'UNKNOWN';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Calcular precisión reciente (últimas 100 predicciones)
    const recentPredictions = userPredictions
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 100);
    const recentCorrect = recentPredictions.filter(p => p.isCorrect === true).length;
    const recentAccuracy = recentPredictions.length > 0 ? (recentCorrect / recentPredictions.length) * 100 : 0;
    
    // Insights trending (simulado)
    const trendingInsights: PredictionInsight[] = [];
    
    // Performance de modelos
    const modelPerformance = predictionModels.map(model => {
      const modelPredictions = userPredictions.filter(p => p.modelId === model.id);
      const modelCorrect = modelPredictions.filter(p => p.isCorrect === true).length;
      const modelAccuracy = modelPredictions.length > 0 ? (modelCorrect / modelPredictions.length) * 100 : 0;
      
      return {
        modelId: model.id,
        modelName: model.name,
        accuracy: modelAccuracy,
        predictions: modelPredictions.length,
        lastUsed: modelPredictions.length > 0 ? 
          new Date(Math.max(...modelPredictions.map(p => new Date(p.timestamp).getTime()))) : 
          new Date(0)
      };
    });
    
    return {
      totalPredictions,
      accuracy,
      averageConfidence,
      predictionsByModel,
      predictionsByType,
      recentAccuracy,
      trendingInsights,
      modelPerformance
    };
  }, []);

  // Crear modelo
  const createModel = useCallback(async (modelData: Partial<PredictionModel>): Promise<PredictionModel> => {
    if (!user?.id) throw new Error('Usuario no autenticado');
    
    try {
      setError(null);
      const newModel = await analyticsService.createPredictionModel(user.id, modelData);
      
      setModels(prev => [...prev, newModel]);
      return newModel;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear modelo');
      throw err;
    }
  }, [user?.id]);

  // Actualizar modelo
  const updateModel = useCallback(async (modelId: string, updates: Partial<PredictionModel>): Promise<void> => {
    if (!user?.id) throw new Error('Usuario no autenticado');
    
    try {
      setError(null);
      await analyticsService.updatePredictionModel(modelId, updates);
      
      setModels(prev => prev.map(model => 
        model.id === modelId ? { ...model, ...updates } : model
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar modelo');
      throw err;
    }
  }, [user?.id]);

  // Eliminar modelo
  const deleteModel = useCallback(async (modelId: string): Promise<void> => {
    if (!user?.id) throw new Error('Usuario no autenticado');
    
    try {
      setError(null);
      await analyticsService.deletePredictionModel(modelId);
      
      setModels(prev => prev.filter(model => model.id !== modelId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar modelo');
      throw err;
    }
  }, [user?.id]);

  // Entrenar modelo
  const trainModel = useCallback(async (modelId: string, trainingData: any): Promise<void> => {
    if (!user?.id) throw new Error('Usuario no autenticado');
    
    try {
      setError(null);
      await analyticsService.trainPredictionModel(modelId, trainingData);
      
      // Actualizar modelo con nueva información de entrenamiento
      const updatedModel = await analyticsService.getPredictionModel(modelId);
      setModels(prev => prev.map(model => 
        model.id === modelId ? updatedModel : model
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al entrenar modelo');
      throw err;
    }
  }, [user?.id]);

  // Evaluar modelo
  const evaluateModel = useCallback(async (modelId: string, testData: any): Promise<any> => {
    if (!user?.id) throw new Error('Usuario no autenticado');
    
    try {
      setError(null);
      const evaluation = await analyticsService.evaluatePredictionModel(modelId, testData);
      
      // Actualizar modelo con resultados de evaluación
      const updatedModel = await analyticsService.getPredictionModel(modelId);
      setModels(prev => prev.map(model => 
        model.id === modelId ? updatedModel : model
      ));
      
      return evaluation;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al evaluar modelo');
      throw err;
    }
  }, [user?.id]);

  // Hacer predicción
  const makePrediction = useCallback(async (modelId: string, input: Record<string, any>): Promise<Prediction> => {
    if (!user?.id) throw new Error('Usuario no autenticado');
    
    try {
      setError(null);
      const prediction = await analyticsService.makePrediction(user.id, modelId, input);
      
      setPredictions(prev => [prediction, ...prev]);
      
      // Recalcular estadísticas
      const updatedStats = calculatePredictionStats([prediction, ...predictions], models);
      setStats(updatedStats);
      
      return prediction;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al hacer predicción');
      throw err;
    }
  }, [user?.id, predictions, models, calculatePredictionStats]);

  // Predicción en lote
  const batchPredict = useCallback(async (modelId: string, inputs: Record<string, any>[]): Promise<Prediction[]> => {
    if (!user?.id) throw new Error('Usuario no autenticado');
    
    try {
      setError(null);
      const batchPredictions = await analyticsService.batchPredict(user.id, modelId, inputs);
      
      setPredictions(prev => [...batchPredictions, ...prev]);
      
      // Recalcular estadísticas
      const updatedStats = calculatePredictionStats([...batchPredictions, ...predictions], models);
      setStats(updatedStats);
      
      return batchPredictions;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al hacer predicción en lote');
      throw err;
    }
  }, [user?.id, predictions, models, calculatePredictionStats]);

  // Actualizar predicción
  const updatePrediction = useCallback(async (predictionId: string, actualValue: any, feedback?: string): Promise<void> => {
    if (!user?.id) throw new Error('Usuario no autenticado');
    
    try {
      setError(null);
      await analyticsService.updatePrediction(predictionId, actualValue, feedback);
      
      // Actualizar predicción local
      setPredictions(prev => prev.map(prediction => 
        prediction.id === predictionId ? {
          ...prediction,
          actualValue,
          feedback,
          isCorrect: prediction.output.predictedValue === actualValue
        } : prediction
      ));
      
      // Recalcular estadísticas
      const updatedStats = calculatePredictionStats(predictions, models);
      setStats(updatedStats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar predicción');
      throw err;
    }
  }, [user?.id, predictions, models, calculatePredictionStats]);

  // Crear configuración
  const createConfig = useCallback(async (configData: Partial<PredictionConfig>): Promise<PredictionConfig> => {
    if (!user?.id) throw new Error('Usuario no autenticado');
    
    try {
      setError(null);
      const newConfig = await analyticsService.createPredictionConfig(user.id, configData);
      
      setConfigs(prev => [...prev, newConfig]);
      return newConfig;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear configuración');
      throw err;
    }
  }, [user?.id]);

  // Actualizar configuración
  const updateConfig = useCallback(async (configId: string, updates: Partial<PredictionConfig>): Promise<void> => {
    if (!user?.id) throw new Error('Usuario no autenticado');
    
    try {
      setError(null);
      await analyticsService.updatePredictionConfig(configId, updates);
      
      setConfigs(prev => prev.map(config => 
        config.id === configId ? { ...config, ...updates } : config
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar configuración');
      throw err;
    }
  }, [user?.id]);

  // Eliminar configuración
  const deleteConfig = useCallback(async (configId: string): Promise<void> => {
    if (!user?.id) throw new Error('Usuario no autenticado');
    
    try {
      setError(null);
      await analyticsService.deletePredictionConfig(configId);
      
      setConfigs(prev => prev.filter(config => config.id !== configId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar configuración');
      throw err;
    }
  }, [user?.id]);

  // Activar configuración
  const activateConfig = useCallback(async (configId: string): Promise<void> => {
    if (!user?.id) throw new Error('Usuario no autenticado');
    
    try {
      setError(null);
      await analyticsService.activatePredictionConfig(configId);
      
      setConfigs(prev => prev.map(config => ({
        ...config,
        isActive: config.id === configId
      })));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al activar configuración');
      throw err;
    }
  }, [user?.id]);

  // Generar insights
  const generateInsights = useCallback(async (modelId: string, timeframe: string): Promise<PredictionInsight[]> => {
    if (!user?.id) throw new Error('Usuario no autenticado');
    
    try {
      setError(null);
      const newInsights = await analyticsService.generatePredictionInsights(user.id, modelId, timeframe);
      
      setInsights(prev => [...newInsights, ...prev]);
      return newInsights;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al generar insights');
      throw err;
    }
  }, [user?.id]);

  // Descartar insight
  const dismissInsight = useCallback(async (insightId: string): Promise<void> => {
    if (!user?.id) throw new Error('Usuario no autenticado');
    
    try {
      setError(null);
      await analyticsService.dismissPredictionInsight(insightId);
      
      setInsights(prev => prev.filter(insight => insight.id !== insightId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al descartar insight');
      throw err;
    }
  }, [user?.id]);

  // Obtener recomendaciones de insight
  const getInsightRecommendations = useCallback(async (insightId: string): Promise<string[]> => {
    try {
      const recommendations = await analyticsService.getInsightRecommendations(insightId);
      return recommendations;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al obtener recomendaciones');
      throw err;
    }
  }, []);

  // Utilidades
  const getModelAccuracy = useCallback((modelId: string): number => {
    const model = models.find(m => m.id === modelId);
    return model?.accuracy || 0;
  }, [models]);

  const getPredictionHistory = useCallback((modelId: string): Prediction[] => {
    return predictions.filter(p => p.modelId === modelId);
  }, [predictions]);

  const getModelPerformance = useCallback((): Array<{ modelId: string; accuracy: number; predictions: number }> => {
    return stats.modelPerformance;
  }, [stats.modelPerformance]);

  const getActiveInsights = useCallback((): PredictionInsight[] => {
    const now = new Date();
    return insights.filter(insight => 
      !insight.expiresAt || insight.expiresAt > now
    );
  }, [insights]);

  const getPredictionStatsData = useCallback((): PredictionStats => {
    return stats;
  }, [stats]);

  const validateInput = useCallback((modelId: string, input: Record<string, any>): boolean => {
    const model = models.find(m => m.id === modelId);
    if (!model) return false;
    
    // Verificar que todas las características requeridas estén presentes
    return model.features.every(feature => input.hasOwnProperty(feature));
  }, [models]);

  const getFeatureImportance = useCallback((modelId: string): Record<string, number> => {
    // Simular importancia de características (en un caso real, esto vendría del modelo)
    const model = models.find(m => m.id === modelId);
    if (!model) return {};
    
    const importance: Record<string, number> = {};
    model.features.forEach((feature, index) => {
      importance[feature] = Math.random() * 100;
    });
    
    return importance;
  }, [models]);

  // Efectos
  useEffect(() => {
    loadModels();
    loadConfigs();
    loadInsights();
  }, [loadModels, loadConfigs, loadInsights]);

  useEffect(() => {
    loadPredictions();
  }, [loadPredictions]);

  return {
    models,
    predictions,
    configs,
    insights,
    stats,
    loading,
    error,
    createModel,
    updateModel,
    deleteModel,
    trainModel,
    evaluateModel,
    makePrediction,
    batchPredict,
    updatePrediction,
    createConfig,
    updateConfig,
    deleteConfig,
    activateConfig,
    generateInsights,
    dismissInsight,
    getInsightRecommendations,
    getModelAccuracy,
    getPredictionHistory,
    getModelPerformance,
    getActiveInsights,
    getPredictionStats: getPredictionStatsData,
    validateInput,
    getFeatureImportance
  };
};
