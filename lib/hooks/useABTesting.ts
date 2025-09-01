/**
 * Hook para manejo de pruebas A/B (A/B Testing)
 * Proporciona funcionalidades para experimentos, variantes y análisis de resultados
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { AnalyticsService } from '../analytics/analytics-service';

// Interfaces
interface ABExperiment {
  id: string;
  name: string;
  description: string;
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'ARCHIVED';
  type: 'UI' | 'CONTENT' | 'FEATURE' | 'ALGORITHM' | 'PRICING' | 'CUSTOM';
  goal: {
    metric: string;
    target: number;
    direction: 'INCREASE' | 'DECREASE' | 'OPTIMIZE';
  };
  variants: ABVariant[];
  trafficAllocation: {
    control: number; // Porcentaje para control
    variants: Record<string, number>; // Porcentaje por variante
  };
  targeting: {
    userSegments: string[];
    devices: string[];
    locations: string[];
    customRules: Record<string, any>;
  };
  schedule: {
    startDate: Date;
    endDate?: Date;
    timezone: string;
  };
  sampleSize: {
    required: number;
    current: number;
    confidence: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

interface ABVariant {
  id: string;
  experimentId: string;
  name: string;
  description: string;
  type: 'CONTROL' | 'VARIANT';
  configuration: Record<string, any>;
  isActive: boolean;
  createdAt: Date;
}

interface ABTestResult {
  id: string;
  experimentId: string;
  variantId: string;
  userId?: string;
  sessionId: string;
  timestamp: Date;
  metrics: {
    conversion: boolean;
    revenue?: number;
    timeSpent?: number;
    clicks?: number;
    impressions?: number;
    [key: string]: any;
  };
  userContext: {
    device: string;
    location: string;
    userSegment: string;
    [key: string]: any;
  };
}

interface ABTestStats {
  experimentId: string;
  totalParticipants: number;
  totalConversions: number;
  overallConversionRate: number;
  variantStats: Record<string, {
    participants: number;
    conversions: number;
    conversionRate: number;
    revenue: number;
    averageTimeSpent: number;
    confidence: number;
    lift: number;
  }>;
  significance: {
    isSignificant: boolean;
    pValue: number;
    confidenceInterval: [number, number];
  };
  winner?: string;
  recommendation: string;
  lastUpdated: Date;
}

interface ABTestConfig {
  id: string;
  experimentId: string;
  name: string;
  description: string;
  isActive: boolean;
  autoOptimize: boolean;
  optimizationRules: {
    minSampleSize: number;
    confidenceThreshold: number;
    maxDuration: number; // En días
    earlyStopping: boolean;
  };
  notifications: {
    onStart: boolean;
    onSignificance: boolean;
    onCompletion: boolean;
    onWinner: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

interface UseABTestingReturn {
  // Estado
  experiments: ABExperiment[];
  results: ABTestResult[];
  stats: Record<string, ABTestStats>;
  configs: ABTestConfig[];
  currentExperiment: ABExperiment | null;
  loading: boolean;
  error: string | null;
  
  // Acciones de experimentos
  createExperiment: (experimentData: Partial<ABExperiment>) => Promise<ABExperiment>;
  updateExperiment: (experimentId: string, updates: Partial<ABExperiment>) => Promise<void>;
  deleteExperiment: (experimentId: string) => Promise<void>;
  startExperiment: (experimentId: string) => Promise<void>;
  pauseExperiment: (experimentId: string) => Promise<void>;
  stopExperiment: (experimentId: string) => Promise<void>;
  
  // Acciones de variantes
  addVariant: (experimentId: string, variantData: Partial<ABVariant>) => Promise<ABVariant>;
  updateVariant: (variantId: string, updates: Partial<ABVariant>) => Promise<void>;
  removeVariant: (variantId: string) => Promise<void>;
  
  // Acciones de resultados
  recordResult: (experimentId: string, variantId: string, metrics: any) => Promise<void>;
  getResults: (experimentId: string, filters?: any) => Promise<ABTestResult[]>;
  exportResults: (experimentId: string, format: 'CSV' | 'JSON' | 'EXCEL') => Promise<string>;
  
  // Acciones de configuración
  createConfig: (configData: Partial<ABTestConfig>) => Promise<ABTestConfig>;
  updateConfig: (configId: string, updates: Partial<ABTestConfig>) => Promise<void>;
  deleteConfig: (configId: string) => Promise<void>;
  
  // Utilidades
  getCurrentVariant: (experimentId: string) => ABVariant | null;
  isInExperiment: (experimentId: string) => boolean;
  getExperimentStats: (experimentId: string) => ABTestStats | null;
  calculateSampleSize: (baseline: number, mde: number, confidence: number, power: number) => number;
  getWinner: (experimentId: string) => string | null;
  isSignificant: (experimentId: string) => boolean;
  getRecommendation: (experimentId: string) => string;
  validateExperiment: (experiment: Partial<ABExperiment>) => boolean;
}

export const useABTesting = (): UseABTestingReturn => {
  const { user } = useAuth();
  const [experiments, setExperiments] = useState<ABExperiment[]>([]);
  const [results, setResults] = useState<ABTestResult[]>([]);
  const [stats, setStats] = useState<Record<string, ABTestStats>>({});
  const [configs, setConfigs] = useState<ABTestConfig[]>([]);
  const [currentExperiment, setCurrentExperiment] = useState<ABExperiment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const analyticsService = new AnalyticsService();

  // Cargar experimentos
  const loadExperiments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const abExperiments = await analyticsService.getABExperiments();
      setExperiments(abExperiments);
      
      // Establecer experimento activo si existe
      const activeExperiment = abExperiments.find(exp => exp.status === 'ACTIVE');
      setCurrentExperiment(activeExperiment || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar experimentos');
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar resultados
  const loadResults = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const userResults = await analyticsService.getABTestResults(user.id);
      setResults(userResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar resultados');
    }
  }, [user?.id]);

  // Cargar estadísticas
  const loadStats = useCallback(async () => {
    try {
      const experimentStats = await analyticsService.getABTestStats();
      setStats(experimentStats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar estadísticas');
    }
  }, []);

  // Cargar configuraciones
  const loadConfigs = useCallback(async () => {
    try {
      const abConfigs = await analyticsService.getABTestConfigs();
      setConfigs(abConfigs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar configuraciones');
    }
  }, []);

  // Crear experimento
  const createExperiment = useCallback(async (experimentData: Partial<ABExperiment>): Promise<ABExperiment> => {
    if (!user?.id) throw new Error('Usuario no autenticado');
    
    try {
      setError(null);
      const newExperiment = await analyticsService.createABExperiment(user.id, experimentData);
      
      setExperiments(prev => [...prev, newExperiment]);
      return newExperiment;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear experimento');
      throw err;
    }
  }, [user?.id]);

  // Actualizar experimento
  const updateExperiment = useCallback(async (experimentId: string, updates: Partial<ABExperiment>): Promise<void> => {
    if (!user?.id) throw new Error('Usuario no autenticado');
    
    try {
      setError(null);
      await analyticsService.updateABExperiment(experimentId, updates);
      
      setExperiments(prev => prev.map(exp => 
        exp.id === experimentId ? { ...exp, ...updates } : exp
      ));
      
      // Actualizar experimento actual si es el que se está editando
      if (currentExperiment?.id === experimentId) {
        setCurrentExperiment(prev => prev ? { ...prev, ...updates } : null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar experimento');
      throw err;
    }
  }, [user?.id, currentExperiment?.id]);

  // Eliminar experimento
  const deleteExperiment = useCallback(async (experimentId: string): Promise<void> => {
    if (!user?.id) throw new Error('Usuario no autenticado');
    
    try {
      setError(null);
      await analyticsService.deleteABExperiment(experimentId);
      
      setExperiments(prev => prev.filter(exp => exp.id !== experimentId));
      
      // Resetear experimento actual si se eliminó
      if (currentExperiment?.id === experimentId) {
        setCurrentExperiment(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar experimento');
      throw err;
    }
  }, [user?.id, currentExperiment?.id]);

  // Iniciar experimento
  const startExperiment = useCallback(async (experimentId: string): Promise<void> => {
    if (!user?.id) throw new Error('Usuario no autenticado');
    
    try {
      setError(null);
      await analyticsService.startABExperiment(experimentId);
      
      setExperiments(prev => prev.map(exp => 
        exp.id === experimentId ? { ...exp, status: 'ACTIVE' } : exp
      ));
      
      // Actualizar experimento actual
      if (currentExperiment?.id === experimentId) {
        setCurrentExperiment(prev => prev ? { ...prev, status: 'ACTIVE' } : null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar experimento');
      throw err;
    }
  }, [user?.id, currentExperiment?.id]);

  // Pausar experimento
  const pauseExperiment = useCallback(async (experimentId: string): Promise<void> => {
    if (!user?.id) throw new Error('Usuario no autenticado');
    
    try {
      setError(null);
      await analyticsService.pauseABExperiment(experimentId);
      
      setExperiments(prev => prev.map(exp => 
        exp.id === experimentId ? { ...exp, status: 'PAUSED' } : exp
      ));
      
      // Actualizar experimento actual
      if (currentExperiment?.id === experimentId) {
        setCurrentExperiment(prev => prev ? { ...prev, status: 'PAUSED' } : null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al pausar experimento');
      throw err;
    }
  }, [user?.id, currentExperiment?.id]);

  // Detener experimento
  const stopExperiment = useCallback(async (experimentId: string): Promise<void> => {
    if (!user?.id) throw new Error('Usuario no autenticado');
    
    try {
      setError(null);
      await analyticsService.stopABExperiment(experimentId);
      
      setExperiments(prev => prev.map(exp => 
        exp.id === experimentId ? { ...exp, status: 'COMPLETED' } : exp
      ));
      
      // Actualizar experimento actual
      if (currentExperiment?.id === experimentId) {
        setCurrentExperiment(prev => prev ? { ...prev, status: 'COMPLETED' } : null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al detener experimento');
      throw err;
    }
  }, [user?.id, currentExperiment?.id]);

  // Agregar variante
  const addVariant = useCallback(async (experimentId: string, variantData: Partial<ABVariant>): Promise<ABVariant> => {
    if (!user?.id) throw new Error('Usuario no autenticado');
    
    try {
      setError(null);
      const newVariant = await analyticsService.addABVariant(experimentId, variantData);
      
      setExperiments(prev => prev.map(exp => 
        exp.id === experimentId ? {
          ...exp,
          variants: [...exp.variants, newVariant]
        } : exp
      ));
      
      return newVariant;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al agregar variante');
      throw err;
    }
  }, [user?.id]);

  // Actualizar variante
  const updateVariant = useCallback(async (variantId: string, updates: Partial<ABVariant>): Promise<void> => {
    if (!user?.id) throw new Error('Usuario no autenticado');
    
    try {
      setError(null);
      await analyticsService.updateABVariant(variantId, updates);
      
      setExperiments(prev => prev.map(exp => ({
        ...exp,
        variants: exp.variants.map(variant => 
          variant.id === variantId ? { ...variant, ...updates } : variant
        )
      })));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar variante');
      throw err;
    }
  }, [user?.id]);

  // Remover variante
  const removeVariant = useCallback(async (variantId: string): Promise<void> => {
    if (!user?.id) throw new Error('Usuario no autenticado');
    
    try {
      setError(null);
      await analyticsService.removeABVariant(variantId);
      
      setExperiments(prev => prev.map(exp => ({
        ...exp,
        variants: exp.variants.filter(variant => variant.id !== variantId)
      })));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al remover variante');
      throw err;
    }
  }, [user?.id]);

  // Registrar resultado
  const recordResult = useCallback(async (experimentId: string, variantId: string, metrics: any): Promise<void> => {
    if (!user?.id) throw new Error('Usuario no autenticado');
    
    try {
      setError(null);
      const result = await analyticsService.recordABTestResult(user.id, experimentId, variantId, metrics);
      
      setResults(prev => [result, ...prev]);
      
      // Recalcular estadísticas
      const updatedStats = await analyticsService.getABTestStats();
      setStats(updatedStats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrar resultado');
      throw err;
    }
  }, [user?.id]);

  // Obtener resultados
  const getResults = useCallback(async (experimentId: string, filters?: any): Promise<ABTestResult[]> => {
    try {
      const experimentResults = await analyticsService.getABTestResults(experimentId, filters);
      return experimentResults;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al obtener resultados');
      throw err;
    }
  }, []);

  // Exportar resultados
  const exportResults = useCallback(async (experimentId: string, format: 'CSV' | 'JSON' | 'EXCEL'): Promise<string> => {
    try {
      const exportedData = await analyticsService.exportABTestResults(experimentId, format);
      return exportedData;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al exportar resultados');
      throw err;
    }
  }, []);

  // Crear configuración
  const createConfig = useCallback(async (configData: Partial<ABTestConfig>): Promise<ABTestConfig> => {
    if (!user?.id) throw new Error('Usuario no autenticado');
    
    try {
      setError(null);
      const newConfig = await analyticsService.createABTestConfig(user.id, configData);
      
      setConfigs(prev => [...prev, newConfig]);
      return newConfig;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear configuración');
      throw err;
    }
  }, [user?.id]);

  // Actualizar configuración
  const updateConfig = useCallback(async (configId: string, updates: Partial<ABTestConfig>): Promise<void> => {
    if (!user?.id) throw new Error('Usuario no autenticado');
    
    try {
      setError(null);
      await analyticsService.updateABTestConfig(configId, updates);
      
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
      await analyticsService.deleteABTestConfig(configId);
      
      setConfigs(prev => prev.filter(config => config.id !== configId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar configuración');
      throw err;
    }
  }, [user?.id]);

  // Utilidades
  const getCurrentVariant = useCallback((experimentId: string): ABVariant | null => {
    const experiment = experiments.find(exp => exp.id === experimentId);
    if (!experiment || experiment.status !== 'ACTIVE') return null;
    
    // Simular asignación de variante basada en ID del usuario
    const userHash = user?.id ? 
      user.id.split('').reduce((a, b) => a + b.charCodeAt(0), 0) : 0;
    const variantIndex = userHash % experiment.variants.length;
    
    return experiment.variants[variantIndex] || null;
  }, [experiments, user?.id]);

  const isInExperiment = useCallback((experimentId: string): boolean => {
    return getCurrentVariant(experimentId) !== null;
  }, [getCurrentVariant]);

  const getExperimentStats = useCallback((experimentId: string): ABTestStats | null => {
    return stats[experimentId] || null;
  }, [stats]);

  const calculateSampleSize = useCallback((
    baseline: number, 
    mde: number, 
    confidence: number, 
    power: number
  ): number => {
    // Fórmula simplificada para calcular tamaño de muestra
    const alpha = 1 - confidence;
    const beta = 1 - power;
    const zAlpha = 1.96; // Para alpha = 0.05
    const zBeta = 0.84; // Para power = 0.8
    
    const p1 = baseline / 100;
    const p2 = (baseline + mde) / 100;
    const p = (p1 + p2) / 2;
    
    const numerator = Math.pow(zAlpha * Math.sqrt(2 * p * (1 - p)) + zBeta * Math.sqrt(p1 * (1 - p1) + p2 * (1 - p2)), 2);
    const denominator = Math.pow(p2 - p1, 2);
    
    return Math.ceil(numerator / denominator);
  }, []);

  const getWinner = useCallback((experimentId: string): string | null => {
    const experimentStats = stats[experimentId];
    return experimentStats?.winner || null;
  }, [stats]);

  const isSignificant = useCallback((experimentId: string): boolean => {
    const experimentStats = stats[experimentId];
    return experimentStats?.significance.isSignificant || false;
  }, [stats]);

  const getRecommendation = useCallback((experimentId: string): string => {
    const experimentStats = stats[experimentId];
    return experimentStats?.recommendation || 'No hay recomendación disponible';
  }, [stats]);

  const validateExperiment = useCallback((experiment: Partial<ABExperiment>): boolean => {
    if (!experiment.name || !experiment.description) return false;
    if (!experiment.goal || !experiment.goal.metric) return false;
    if (!experiment.variants || experiment.variants.length < 2) return false;
    if (!experiment.schedule || !experiment.schedule.startDate) return false;
    
    // Verificar que la suma de asignación de tráfico sea 100%
    const totalAllocation = (experiment.trafficAllocation?.control || 0) + 
      Object.values(experiment.trafficAllocation?.variants || {}).reduce((sum, val) => sum + val, 0);
    
    return Math.abs(totalAllocation - 100) < 0.01;
  }, []);

  // Efectos
  useEffect(() => {
    loadExperiments();
    loadConfigs();
  }, [loadExperiments, loadConfigs]);

  useEffect(() => {
    loadResults();
    loadStats();
  }, [loadResults, loadStats]);

  return {
    experiments,
    results,
    stats,
    configs,
    currentExperiment,
    loading,
    error,
    createExperiment,
    updateExperiment,
    deleteExperiment,
    startExperiment,
    pauseExperiment,
    stopExperiment,
    addVariant,
    updateVariant,
    removeVariant,
    recordResult,
    getResults,
    exportResults,
    createConfig,
    updateConfig,
    deleteConfig,
    getCurrentVariant,
    isInExperiment,
    getExperimentStats,
    calculateSampleSize,
    getWinner,
    isSignificant,
    getRecommendation,
    validateExperiment
  };
};
