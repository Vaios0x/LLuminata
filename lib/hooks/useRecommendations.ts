import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { AIServices } from '../ai-services';
import type { LearningRecommendation } from '../ml-models';

interface RecommendationFilters {
  category?: 'lesson' | 'assessment' | 'resource' | 'activity';
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  duration?: 'short' | 'medium' | 'long';
  format?: 'video' | 'text' | 'interactive' | 'audio';
  language?: string;
  culturalContext?: string;
}

interface RecommendationState {
  recommendations: LearningRecommendation[];
  personalizedRecommendations: LearningRecommendation[];
  trendingRecommendations: LearningRecommendation[];
  recentlyViewed: LearningRecommendation[];
  savedRecommendations: LearningRecommendation[];
  filters: RecommendationFilters;
  recommendationHistory: {
    id: string;
    recommendationId: string;
    action: 'viewed' | 'started' | 'completed' | 'saved' | 'dismissed';
    timestamp: Date;
    feedback?: {
      rating: number;
      comment?: string;
    };
  }[];
}

interface RecommendationActions {
  getRecommendations: (filters?: RecommendationFilters) => Promise<LearningRecommendation[]>;
  getPersonalizedRecommendations: () => Promise<LearningRecommendation[]>;
  getTrendingRecommendations: () => Promise<LearningRecommendation[]>;
  saveRecommendation: (recommendationId: string) => Promise<void>;
  unsaveRecommendation: (recommendationId: string) => Promise<void>;
  trackRecommendationAction: (recommendationId: string, action: 'viewed' | 'started' | 'completed' | 'saved' | 'dismissed') => Promise<void>;
  provideFeedback: (recommendationId: string, rating: number, comment?: string) => Promise<void>;
  updateFilters: (filters: Partial<RecommendationFilters>) => void;
  exportRecommendations: (format: 'json' | 'csv') => Promise<string>;
  refreshRecommendations: () => Promise<void>;
}

export function useRecommendations() {
  const { user } = useAuth();
  const [aiServices] = useState(() => new AIServices());
  const [state, setState] = useState<RecommendationState>({
    recommendations: [],
    personalizedRecommendations: [],
    trendingRecommendations: [],
    recentlyViewed: [],
    savedRecommendations: [],
    filters: {},
    recommendationHistory: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  // Cargar datos iniciales
  useEffect(() => {
    const loadInitialData = async () => {
      if (!user || !aiServices.isReady()) return;

      try {
        setLoading(true);
        
        // Cargar recomendaciones personalizadas
        const personalized = await aiServices.getPersonalizedRecommendations(user.id);
        
        // Cargar recomendaciones guardadas
        const saved = await aiServices.getSavedRecommendations(user.id);
        
        // Cargar historial
        const history = await aiServices.getRecommendationHistory(user.id);
        
        setState(prev => ({
          ...prev,
          personalizedRecommendations: personalized,
          savedRecommendations: saved,
          recommendationHistory: history,
        }));
      } catch (err) {
        console.error('Error cargando datos iniciales:', err);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [user, aiServices]);

  // Obtener recomendaciones
  const getRecommendations = useCallback(async (
    filters?: RecommendationFilters
  ): Promise<LearningRecommendation[]> => {
    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    try {
      setLoading(true);
      setError(null);

      const finalFilters = { ...state.filters, ...filters };
      const recommendations = await aiServices.getRecommendations(user.id, finalFilters);
      
      setState(prev => ({
        ...prev,
        recommendations,
        filters: finalFilters,
      }));

      return recommendations;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error obteniendo recomendaciones';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user, aiServices, state.filters]);

  // Obtener recomendaciones personalizadas
  const getPersonalizedRecommendations = useCallback(async (): Promise<LearningRecommendation[]> => {
    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    try {
      setLoading(true);
      setError(null);

      const recommendations = await aiServices.getPersonalizedRecommendations(user.id);
      
      setState(prev => ({
        ...prev,
        personalizedRecommendations: recommendations,
      }));

      return recommendations;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error obteniendo recomendaciones personalizadas';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user, aiServices]);

  // Obtener recomendaciones trending
  const getTrendingRecommendations = useCallback(async (): Promise<LearningRecommendation[]> => {
    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    try {
      setLoading(true);
      setError(null);

      const recommendations = await aiServices.getTrendingRecommendations(user.id);
      
      setState(prev => ({
        ...prev,
        trendingRecommendations: recommendations,
      }));

      return recommendations;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error obteniendo recomendaciones trending';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user, aiServices]);

  // Guardar recomendación
  const saveRecommendation = useCallback(async (recommendationId: string): Promise<void> => {
    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    try {
      setLoading(true);
      setError(null);

      await aiServices.saveRecommendation(user.id, recommendationId);
      
      // Actualizar estado local
      const recommendation = state.recommendations.find(r => r.id === recommendationId) ||
                           state.personalizedRecommendations.find(r => r.id === recommendationId) ||
                           state.trendingRecommendations.find(r => r.id === recommendationId);
      
      if (recommendation) {
        setState(prev => ({
          ...prev,
          savedRecommendations: [...prev.savedRecommendations, recommendation],
        }));
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error guardando recomendación';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user, aiServices, state.recommendations, state.personalizedRecommendations, state.trendingRecommendations]);

  // Quitar recomendación guardada
  const unsaveRecommendation = useCallback(async (recommendationId: string): Promise<void> => {
    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    try {
      setLoading(true);
      setError(null);

      await aiServices.unsaveRecommendation(user.id, recommendationId);
      
      setState(prev => ({
        ...prev,
        savedRecommendations: prev.savedRecommendations.filter(r => r.id !== recommendationId),
      }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error quitando recomendación';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user, aiServices]);

  // Rastrear acción de recomendación
  const trackRecommendationAction = useCallback(async (
    recommendationId: string, 
    action: 'viewed' | 'started' | 'completed' | 'saved' | 'dismissed'
  ): Promise<void> => {
    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    try {
      await aiServices.trackRecommendationAction(user.id, recommendationId, action);
      
      // Actualizar historial local
      const historyEntry = {
        id: `action_${Date.now()}`,
        recommendationId,
        action,
        timestamp: new Date(),
      };

      setState(prev => ({
        ...prev,
        recommendationHistory: [historyEntry, ...prev.recommendationHistory],
      }));

      // Si es "viewed", agregar a recientemente visto
      if (action === 'viewed') {
        const recommendation = state.recommendations.find(r => r.id === recommendationId) ||
                             state.personalizedRecommendations.find(r => r.id === recommendationId) ||
                             state.trendingRecommendations.find(r => r.id === recommendationId);
        
        if (recommendation) {
          setState(prev => ({
            ...prev,
            recentlyViewed: [
              recommendation,
              ...prev.recentlyViewed.filter(r => r.id !== recommendationId),
            ].slice(0, 10), // Mantener solo los últimos 10
          }));
        }
      }
    } catch (err) {
      console.error('Error rastreando acción de recomendación:', err);
    }
  }, [user, aiServices, state.recommendations, state.personalizedRecommendations, state.trendingRecommendations]);

  // Proporcionar feedback
  const provideFeedback = useCallback(async (
    recommendationId: string, 
    rating: number, 
    comment?: string
  ): Promise<void> => {
    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    try {
      setLoading(true);
      setError(null);

      await aiServices.provideRecommendationFeedback(user.id, recommendationId, rating, comment);
      
      // Actualizar historial con feedback
      setState(prev => ({
        ...prev,
        recommendationHistory: prev.recommendationHistory.map(entry => 
          entry.recommendationId === recommendationId
            ? { ...entry, feedback: { rating, comment } }
            : entry
        ),
      }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error proporcionando feedback';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user, aiServices]);

  // Actualizar filtros
  const updateFilters = useCallback((filters: Partial<RecommendationFilters>) => {
    setState(prev => ({
      ...prev,
      filters: { ...prev.filters, ...filters },
    }));
  }, []);

  // Exportar recomendaciones
  const exportRecommendations = useCallback(async (format: 'json' | 'csv'): Promise<string> => {
    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    try {
      setLoading(true);
      setError(null);

      const exportData = {
        userId: user.id,
        recommendations: state.recommendations,
        personalizedRecommendations: state.personalizedRecommendations,
        savedRecommendations: state.savedRecommendations,
        recommendationHistory: state.recommendationHistory,
        filters: state.filters,
      };

      const result = await aiServices.exportRecommendations(exportData, format);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error exportando recomendaciones';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user, aiServices, state]);

  // Refrescar recomendaciones
  const refreshRecommendations = useCallback(async (): Promise<void> => {
    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    try {
      setLoading(true);
      setError(null);

      // Recargar todos los tipos de recomendaciones
      await Promise.all([
        getRecommendations(),
        getPersonalizedRecommendations(),
        getTrendingRecommendations(),
      ]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error refrescando recomendaciones';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user, getRecommendations, getPersonalizedRecommendations, getTrendingRecommendations]);

  // Función helper para obtener recomendaciones por categoría
  const getRecommendationsByCategory = useCallback((category: string): LearningRecommendation[] => {
    return state.recommendations.filter(r => r.category === category);
  }, [state.recommendations]);

  // Función helper para buscar recomendaciones
  const searchRecommendations = useCallback((query: string): LearningRecommendation[] => {
    const searchTerm = query.toLowerCase();
    return state.recommendations.filter(r => 
      r.title.toLowerCase().includes(searchTerm) ||
      r.description.toLowerCase().includes(searchTerm) ||
      r.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );
  }, [state.recommendations]);

  return {
    // Estado
    ...state,
    loading,
    error,
    
    // Acciones
    getRecommendations,
    getPersonalizedRecommendations,
    getTrendingRecommendations,
    saveRecommendation,
    unsaveRecommendation,
    trackRecommendationAction,
    provideFeedback,
    updateFilters,
    exportRecommendations,
    refreshRecommendations,
    
    // Helpers
    getRecommendationsByCategory,
    searchRecommendations,
  };
}
