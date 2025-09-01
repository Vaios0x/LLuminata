/**
 * Hook personalizado para Análisis de Sentimientos en Tiempo Real
 * Proporciona funcionalidades para análisis de emociones, predicción de abandono y gestión de alertas
 */

import { useState, useEffect, useCallback, useRef } from 'react';

export interface SentimentData {
  text?: string;
  audioFeatures?: number[];
  behavioralMetrics?: {
    responseTime: number;
    clickPattern: number[];
    scrollBehavior: number[];
    interactionFrequency: number;
  };
  context?: {
    activityType: string;
    contentId?: string;
    sessionId?: string;
    timestamp: Date;
  };
}

export interface SentimentResult {
  sentimentScore: number;
  emotion: string;
  confidence: number;
  intensity: number;
  stressLevel: number;
  engagementLevel: number;
  frustrationLevel: number;
  isAlert: boolean;
  alertType?: string;
  alertMessage?: string;
  recommendations: string[];
}

export interface DropoutPrediction {
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  probability: number;
  factors: string[];
  recommendations: string[];
  confidence: number;
}

export interface EmotionTrend {
  date: Date;
  timeSlot: number;
  avgSentiment: number;
  dominantEmotion: string;
  stressTrend: number;
  engagementTrend: number;
  totalAnalyses: number;
  positiveCount: number;
  negativeCount: number;
  neutralCount: number;
}

export interface SentimentAlert {
  id: string;
  alertType: string;
  severity: string;
  message: string;
  createdAt: Date;
  student: {
    id: string;
    name: string;
    age: number;
  };
}

export interface UseSentimentAnalysisOptions {
  studentId: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
  enableRealTime?: boolean;
}

export interface UseSentimentAnalysisReturn {
  // Estado
  isAnalyzing: boolean;
  isLoading: boolean;
  currentResult: SentimentResult | null;
  trends: EmotionTrend[];
  alerts: SentimentAlert[];
  dropoutPrediction: DropoutPrediction | null;
  error: string | null;

  // Funciones de análisis
  analyzeTextSentiment: (text: string, context?: any) => Promise<SentimentResult | null>;
  analyzeAudioSentiment: (audioFeatures: number[], context?: any) => Promise<SentimentResult | null>;
  analyzeBehavioralSentiment: (behavioralMetrics: any, context?: any) => Promise<SentimentResult | null>;
  
  // Funciones de gestión
  loadTrends: (days?: number) => Promise<void>;
  loadAlerts: () => Promise<void>;
  loadDropoutPrediction: () => Promise<void>;
  resolveAlert: (alertId: string, resolutionNotes?: string) => Promise<boolean>;
  
  // Funciones de utilidad
  refreshData: () => Promise<void>;
  clearError: () => void;
}

export const useSentimentAnalysis = (options: UseSentimentAnalysisOptions): UseSentimentAnalysisReturn => {
  const { 
    studentId, 
    autoRefresh = true, 
    refreshInterval = 30000, 
    enableRealTime = true 
  } = options;

  // Estado
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentResult, setCurrentResult] = useState<SentimentResult | null>(null);
  const [trends, setTrends] = useState<EmotionTrend[]>([]);
  const [alerts, setAlerts] = useState<SentimentAlert[]>([]);
  const [dropoutPrediction, setDropoutPrediction] = useState<DropoutPrediction | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Refs para intervalos
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const realTimeIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Función para manejar errores
  const handleError = useCallback((error: any, context: string) => {
    console.error(`Error en ${context}:`, error);
    setError(`Error en ${context}: ${error.message || 'Error desconocido'}`);
  }, []);

  // Función para limpiar errores
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Función para analizar sentimientos de texto
  const analyzeTextSentiment = useCallback(async (text: string, context?: any): Promise<SentimentResult | null> => {
    if (!text.trim()) return null;

    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/sentiment-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          text,
          context: {
            activityType: 'text_analysis',
            ...context,
            timestamp: new Date()
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setCurrentResult(data.result);
        return data.result;
      } else {
        throw new Error(data.error || 'Error en el análisis');
      }
    } catch (error) {
      handleError(error, 'análisis de texto');
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, [studentId, handleError]);

  // Función para analizar sentimientos de audio
  const analyzeAudioSentiment = useCallback(async (audioFeatures: number[], context?: any): Promise<SentimentResult | null> => {
    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/sentiment-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          audioFeatures,
          context: {
            activityType: 'audio_analysis',
            ...context,
            timestamp: new Date()
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setCurrentResult(data.result);
        return data.result;
      } else {
        throw new Error(data.error || 'Error en el análisis');
      }
    } catch (error) {
      handleError(error, 'análisis de audio');
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, [studentId, handleError]);

  // Función para analizar sentimientos de comportamiento
  const analyzeBehavioralSentiment = useCallback(async (behavioralMetrics: any, context?: any): Promise<SentimentResult | null> => {
    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/sentiment-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          behavioralMetrics,
          context: {
            activityType: 'behavioral_analysis',
            ...context,
            timestamp: new Date()
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setCurrentResult(data.result);
        return data.result;
      } else {
        throw new Error(data.error || 'Error en el análisis');
      }
    } catch (error) {
      handleError(error, 'análisis de comportamiento');
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, [studentId, handleError]);

  // Función para cargar tendencias
  const loadTrends = useCallback(async (days: number = 7): Promise<void> => {
    setError(null);

    try {
      const response = await fetch(`/api/ai/sentiment-analysis/trends?studentId=${studentId}&days=${days}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setTrends(data.trends);
      } else {
        throw new Error(data.error || 'Error cargando tendencias');
      }
    } catch (error) {
      handleError(error, 'carga de tendencias');
    }
  }, [studentId, handleError]);

  // Función para cargar alertas
  const loadAlerts = useCallback(async (): Promise<void> => {
    setError(null);

    try {
      const response = await fetch(`/api/ai/sentiment-analysis/alerts?studentId=${studentId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setAlerts(data.alerts);
      } else {
        throw new Error(data.error || 'Error cargando alertas');
      }
    } catch (error) {
      handleError(error, 'carga de alertas');
    }
  }, [studentId, handleError]);

  // Función para cargar predicción de abandono
  const loadDropoutPrediction = useCallback(async (): Promise<void> => {
    setError(null);

    try {
      const response = await fetch('/api/ai/sentiment-analysis/dropout-prediction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setDropoutPrediction(data.prediction);
      } else {
        throw new Error(data.error || 'Error cargando predicción');
      }
    } catch (error) {
      handleError(error, 'carga de predicción de abandono');
    }
  }, [studentId, handleError]);

  // Función para resolver alertas
  const resolveAlert = useCallback(async (alertId: string, resolutionNotes?: string): Promise<boolean> => {
    setError(null);

    try {
      const response = await fetch('/api/ai/sentiment-analysis/alerts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alertId,
          resolutionNotes: resolutionNotes || 'Resuelto por el usuario'
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        // Remover la alerta de la lista local
        setAlerts(prevAlerts => prevAlerts.filter(alert => alert.id !== alertId));
        return true;
      } else {
        throw new Error(data.error || 'Error resolviendo alerta');
      }
    } catch (error) {
      handleError(error, 'resolución de alerta');
      return false;
    }
  }, [handleError]);

  // Función para refrescar todos los datos
  const refreshData = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      await Promise.all([
        loadTrends(),
        loadAlerts(),
        loadDropoutPrediction()
      ]);
    } catch (error) {
      handleError(error, 'refresco de datos');
    } finally {
      setIsLoading(false);
    }
  }, [loadTrends, loadAlerts, loadDropoutPrediction, handleError]);

  // Configurar intervalos de actualización automática
  useEffect(() => {
    if (autoRefresh) {
      refreshIntervalRef.current = setInterval(() => {
        loadAlerts();
        loadTrends();
      }, refreshInterval);
    }

    if (enableRealTime) {
      realTimeIntervalRef.current = setInterval(() => {
        // Actualizaciones en tiempo real más frecuentes
        loadAlerts();
      }, 10000); // Cada 10 segundos
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
      if (realTimeIntervalRef.current) {
        clearInterval(realTimeIntervalRef.current);
      }
    };
  }, [autoRefresh, enableRealTime, refreshInterval, loadAlerts, loadTrends]);

  // Cargar datos iniciales
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Limpiar intervalos al desmontar
  useEffect(() => {
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
      if (realTimeIntervalRef.current) {
        clearInterval(realTimeIntervalRef.current);
      }
    };
  }, []);

  return {
    // Estado
    isAnalyzing,
    isLoading,
    currentResult,
    trends,
    alerts,
    dropoutPrediction,
    error,

    // Funciones de análisis
    analyzeTextSentiment,
    analyzeAudioSentiment,
    analyzeBehavioralSentiment,

    // Funciones de gestión
    loadTrends,
    loadAlerts,
    loadDropoutPrediction,
    resolveAlert,

    // Funciones de utilidad
    refreshData,
    clearError
  };
};
