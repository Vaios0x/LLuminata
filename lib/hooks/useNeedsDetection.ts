import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { AIServices } from '../ai-services';
import type { 
  SpecialNeed, 
  InteractionData, 
  NeedsAnalysisResult 
} from '../ai-services/needs-detection-service';

interface NeedsDetectionState {
  specialNeeds: SpecialNeed[];
  learningProfile: NeedsAnalysisResult['learningProfile'] | null;
  culturalAdaptations: NeedsAnalysisResult['culturalAdaptations'] | null;
  confidence: number;
  lastAnalysis: Date | null;
  nextAssessment: Date | null;
}

interface NeedsDetectionActions {
  analyzeNeeds: (interactionData: InteractionData) => Promise<NeedsAnalysisResult>;
  updateInteractionData: (data: Partial<InteractionData>) => Promise<void>;
  getRecommendations: () => string[];
  getAccommodations: () => string[];
  scheduleAssessment: (date: Date) => Promise<void>;
  exportAnalysis: (format: 'pdf' | 'json' | 'csv') => Promise<string>;
}

export function useNeedsDetection() {
  const { user } = useAuth();
  const [aiServices] = useState(() => new AIServices());
  const [state, setState] = useState<NeedsDetectionState>({
    specialNeeds: [],
    learningProfile: null,
    culturalAdaptations: null,
    confidence: 0,
    lastAnalysis: null,
    nextAssessment: null,
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

  // Analizar necesidades del estudiante
  const analyzeNeeds = useCallback(async (interactionData: InteractionData): Promise<NeedsAnalysisResult> => {
    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    try {
      setLoading(true);
      setError(null);

      const result = await aiServices.analyzeLearningNeeds(user.id, interactionData);
      
      setState(prev => ({
        ...prev,
        specialNeeds: result.specialNeeds,
        learningProfile: result.learningProfile,
        culturalAdaptations: result.culturalAdaptations,
        confidence: result.confidence,
        lastAnalysis: result.analysisDate,
        nextAssessment: result.nextAssessment,
      }));

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error analizando necesidades';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user, aiServices]);

  // Actualizar datos de interacción
  const updateInteractionData = useCallback(async (data: Partial<InteractionData>): Promise<void> => {
    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    try {
      setLoading(true);
      setError(null);

      await aiServices.updateInteractionData(user.id, data);
      
      // Re-analizar necesidades si hay cambios significativos
      if (Object.keys(data).length > 0) {
        const currentData = await aiServices.getInteractionData(user.id);
        await analyzeNeeds(currentData);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error actualizando datos de interacción';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user, aiServices, analyzeNeeds]);

  // Obtener recomendaciones
  const getRecommendations = useCallback((): string[] => {
    const recommendations: string[] = [];
    
    // Recomendaciones basadas en necesidades especiales
    state.specialNeeds.forEach(need => {
      recommendations.push(...need.recommendations);
    });

    // Recomendaciones del perfil de aprendizaje
    if (state.learningProfile) {
      recommendations.push(...state.learningProfile.recommendations);
    }

    return [...new Set(recommendations)]; // Eliminar duplicados
  }, [state.specialNeeds, state.learningProfile]);

  // Obtener acomodaciones
  const getAccommodations = useCallback((): string[] => {
    const accommodations: string[] = [];
    
    state.specialNeeds.forEach(need => {
      accommodations.push(...need.accommodations);
    });

    return [...new Set(accommodations)]; // Eliminar duplicados
  }, [state.specialNeeds]);

  // Programar evaluación
  const scheduleAssessment = useCallback(async (date: Date): Promise<void> => {
    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    try {
      setLoading(true);
      setError(null);

      await aiServices.scheduleAssessment(user.id, date);
      
      setState(prev => ({
        ...prev,
        nextAssessment: date,
      }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error programando evaluación';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user, aiServices]);

  // Exportar análisis
  const exportAnalysis = useCallback(async (format: 'pdf' | 'json' | 'csv'): Promise<string> => {
    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    try {
      setLoading(true);
      setError(null);

      const exportData = {
        studentId: user.id,
        specialNeeds: state.specialNeeds,
        learningProfile: state.learningProfile,
        culturalAdaptations: state.culturalAdaptations,
        confidence: state.confidence,
        lastAnalysis: state.lastAnalysis,
        nextAssessment: state.nextAssessment,
      };

      const result = await aiServices.exportAnalysis(exportData, format);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error exportando análisis';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user, aiServices, state]);

  // Cargar análisis existente
  useEffect(() => {
    const loadExistingAnalysis = async () => {
      if (!user || !aiServices.isReady()) return;

      try {
        setLoading(true);
        const existingAnalysis = await aiServices.getNeedsAnalysis(user.id);
        
        if (existingAnalysis) {
          setState(prev => ({
            ...prev,
            specialNeeds: existingAnalysis.specialNeeds,
            learningProfile: existingAnalysis.learningProfile,
            culturalAdaptations: existingAnalysis.culturalAdaptations,
            confidence: existingAnalysis.confidence,
            lastAnalysis: existingAnalysis.analysisDate,
            nextAssessment: existingAnalysis.nextAssessment,
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

  return {
    // Estado
    ...state,
    loading,
    error,
    
    // Acciones
    analyzeNeeds,
    updateInteractionData,
    getRecommendations,
    getAccommodations,
    scheduleAssessment,
    exportAnalysis,
  };
}
