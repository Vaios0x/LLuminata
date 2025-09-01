import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { AIServices } from '../ai-services';
import type { BehaviorPattern, LearningPattern } from '../ml-models';

interface BehavioralData {
  sessionDuration: number;
  clickPatterns: {
    element: string;
    timestamp: Date;
    position: { x: number; y: number };
  }[];
  scrollPatterns: {
    direction: 'up' | 'down';
    speed: number;
    timestamp: Date;
  }[];
  timeOnPage: {
    page: string;
    duration: number;
    timestamp: Date;
  }[];
  interactionFrequency: {
    element: string;
    count: number;
    averageTimeBetween: number;
  }[];
  errorPatterns: {
    type: string;
    frequency: number;
    context: string;
    timestamp: Date;
  }[];
  helpRequests: {
    topic: string;
    timestamp: Date;
    resolved: boolean;
  }[];
}

interface BehavioralAnalysisState {
  currentPatterns: BehaviorPattern[];
  learningPatterns: LearningPattern[];
  engagementMetrics: {
    overall: number;
    bySection: Record<string, number>;
    trend: 'increasing' | 'decreasing' | 'stable';
  };
  attentionMetrics: {
    focusTime: number;
    distractions: number;
    attentionSpan: number;
  };
  interactionMetrics: {
    totalInteractions: number;
    uniqueElements: number;
    averageSessionTime: number;
  };
  behavioralInsights: {
    learningStyle: string;
    preferredContent: string[];
    challenges: string[];
    strengths: string[];
    recommendations: string[];
  };
  analysisHistory: {
    id: string;
    timestamp: Date;
    patterns: BehaviorPattern[];
    insights: any;
    confidence: number;
  }[];
}

interface BehavioralAnalysisActions {
  trackBehavior: (data: Partial<BehavioralData>) => Promise<void>;
  analyzeBehavior: () => Promise<BehaviorPattern[]>;
  getLearningInsights: () => Promise<LearningPattern[]>;
  generateRecommendations: () => Promise<string[]>;
  exportAnalysis: (format: 'json' | 'csv' | 'pdf') => Promise<string>;
  setTrackingEnabled: (enabled: boolean) => void;
  getEngagementScore: () => number;
  predictBehavior: (context: string) => Promise<any>;
}

export function useBehavioralAnalysis() {
  const { user } = useAuth();
  const [aiServices] = useState(() => new AIServices());
  const [state, setState] = useState<BehavioralAnalysisState>({
    currentPatterns: [],
    learningPatterns: [],
    engagementMetrics: {
      overall: 0,
      bySection: {},
      trend: 'stable',
    },
    attentionMetrics: {
      focusTime: 0,
      distractions: 0,
      attentionSpan: 0,
    },
    interactionMetrics: {
      totalInteractions: 0,
      uniqueElements: 0,
      averageSessionTime: 0,
    },
    behavioralInsights: {
      learningStyle: '',
      preferredContent: [],
      challenges: [],
      strengths: [],
      recommendations: [],
    },
    analysisHistory: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trackingEnabled, setTrackingEnabled] = useState(true);

  // Inicializar servicios de IA
  useEffect(() => {
    const initializeServices = async () => {
      try {
        setLoading(true);
        await aiServices.initialize();
        setError(null);
      } catch (err) {
        setError('Error inicializando servicios de IA');
        console.error('Error inicializando servicios de IA:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      initializeServices();
    }
  }, [user, aiServices]);

  // Cargar análisis existente
  useEffect(() => {
    const loadExistingAnalysis = async () => {
      if (!user || !aiServices.isReady()) return;

      try {
        setLoading(true);
        const existingAnalysis = await aiServices.getBehavioralAnalysis(user.id);
        
        if (existingAnalysis) {
          setState(prev => ({
            ...prev,
            currentPatterns: existingAnalysis.patterns || [],
            learningPatterns: existingAnalysis.learningPatterns || [],
            engagementMetrics: existingAnalysis.engagementMetrics || prev.engagementMetrics,
            attentionMetrics: existingAnalysis.attentionMetrics || prev.attentionMetrics,
            interactionMetrics: existingAnalysis.interactionMetrics || prev.interactionMetrics,
            behavioralInsights: existingAnalysis.insights || prev.behavioralInsights,
            analysisHistory: existingAnalysis.history || [],
          }));
        }
      } catch (err) {
        console.error('Error cargando análisis existente:', err);
      } finally {
        setLoading(false);
      }
    };

    loadExistingAnalysis();
  }, [user, aiServices]);

  // Rastrear comportamiento
  const trackBehavior = useCallback(async (data: Partial<BehavioralData>): Promise<void> => {
    if (!user || !trackingEnabled) return;

    try {
      await aiServices.trackBehavioralData(user.id, data);
      
      // Actualizar métricas en tiempo real
      if (data.sessionDuration) {
        setState(prev => ({
          ...prev,
          interactionMetrics: {
            ...prev.interactionMetrics,
            averageSessionTime: data.sessionDuration,
          },
        }));
      }

      if (data.clickPatterns) {
        setState(prev => ({
          ...prev,
          interactionMetrics: {
            ...prev.interactionMetrics,
            totalInteractions: prev.interactionMetrics.totalInteractions + data.clickPatterns!.length,
            uniqueElements: new Set([
              ...Object.keys(prev.interactionMetrics),
              ...data.clickPatterns!.map(cp => cp.element),
            ]).size,
          },
        }));
      }
    } catch (err) {
      console.error('Error rastreando comportamiento:', err);
    }
  }, [user, aiServices, trackingEnabled]);

  // Analizar comportamiento
  const analyzeBehavior = useCallback(async (): Promise<BehaviorPattern[]> => {
    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    try {
      setLoading(true);
      setError(null);

      const patterns = await aiServices.analyzeBehavioralPatterns(user.id);
      
      setState(prev => ({
        ...prev,
        currentPatterns: patterns,
        analysisHistory: [
          {
            id: `analysis_${Date.now()}`,
            timestamp: new Date(),
            patterns,
            insights: prev.behavioralInsights,
            confidence: 0.85, // Valor por defecto
          },
          ...prev.analysisHistory.slice(0, 19), // Mantener solo los últimos 20
        ],
      }));

      return patterns;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error analizando comportamiento';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user, aiServices]);

  // Obtener insights de aprendizaje
  const getLearningInsights = useCallback(async (): Promise<LearningPattern[]> => {
    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    try {
      setLoading(true);
      setError(null);

      const learningPatterns = await aiServices.analyzeLearningPatterns(user.id);
      
      setState(prev => ({
        ...prev,
        learningPatterns,
      }));

      return learningPatterns;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error obteniendo insights de aprendizaje';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user, aiServices]);

  // Generar recomendaciones
  const generateRecommendations = useCallback(async (): Promise<string[]> => {
    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    try {
      setLoading(true);
      setError(null);

      const recommendations = await aiServices.generateBehavioralRecommendations(user.id);
      
      setState(prev => ({
        ...prev,
        behavioralInsights: {
          ...prev.behavioralInsights,
          recommendations,
        },
      }));

      return recommendations;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error generando recomendaciones';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user, aiServices]);

  // Exportar análisis
  const exportAnalysis = useCallback(async (format: 'json' | 'csv' | 'pdf'): Promise<string> => {
    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    try {
      setLoading(true);
      setError(null);

      const exportData = {
        userId: user.id,
        currentPatterns: state.currentPatterns,
        learningPatterns: state.learningPatterns,
        engagementMetrics: state.engagementMetrics,
        attentionMetrics: state.attentionMetrics,
        interactionMetrics: state.interactionMetrics,
        behavioralInsights: state.behavioralInsights,
        analysisHistory: state.analysisHistory,
      };

      const result = await aiServices.exportBehavioralAnalysis(exportData, format);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error exportando análisis';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user, aiServices, state]);

  // Habilitar/deshabilitar rastreo
  const setTrackingEnabled = useCallback((enabled: boolean) => {
    setTrackingEnabled(enabled);
  }, []);

  // Obtener puntuación de engagement
  const getEngagementScore = useCallback((): number => {
    return state.engagementMetrics.overall;
  }, [state.engagementMetrics.overall]);

  // Predecir comportamiento
  const predictBehavior = useCallback(async (context: string): Promise<any> => {
    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    try {
      setLoading(true);
      setError(null);

      const prediction = await aiServices.predictBehavior(user.id, context);
      return prediction;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error prediciendo comportamiento';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user, aiServices]);

  // Función helper para rastrear clic
  const trackClick = useCallback((element: string, position: { x: number; y: number }) => {
    trackBehavior({
      clickPatterns: [{
        element,
        position,
        timestamp: new Date(),
      }],
    });
  }, [trackBehavior]);

  // Función helper para rastrear scroll
  const trackScroll = useCallback((direction: 'up' | 'down', speed: number) => {
    trackBehavior({
      scrollPatterns: [{
        direction,
        speed,
        timestamp: new Date(),
      }],
    });
  }, [trackBehavior]);

  // Función helper para rastrear tiempo en página
  const trackTimeOnPage = useCallback((page: string, duration: number) => {
    trackBehavior({
      timeOnPage: [{
        page,
        duration,
        timestamp: new Date(),
      }],
    });
  }, [trackBehavior]);

  return {
    // Estado
    ...state,
    loading,
    error,
    trackingEnabled,
    
    // Acciones
    trackBehavior,
    analyzeBehavior,
    getLearningInsights,
    generateRecommendations,
    exportAnalysis,
    setTrackingEnabled,
    getEngagementScore,
    predictBehavior,
    
    // Helpers
    trackClick,
    trackScroll,
    trackTimeOnPage,
  };
}
