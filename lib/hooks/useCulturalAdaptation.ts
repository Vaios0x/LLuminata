import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { AIServices } from '../ai-services';
import type { CulturalContext, ContentAdaptation } from '../ml-models';

interface CulturalAdaptationState {
  userCulturalContext: CulturalContext | null;
  contentAdaptations: ContentAdaptation[];
  languagePreferences: string[];
  culturalElements: {
    symbols: string[];
    colors: string[];
    traditions: string[];
    values: string[];
  };
  adaptationHistory: {
    contentId: string;
    originalContent: string;
    adaptedContent: string;
    culturalContext: string;
    adaptationDate: Date;
    confidence: number;
  }[];
}

interface CulturalAdaptationActions {
  adaptContent: (content: string, contentType: 'lesson' | 'assessment' | 'feedback') => Promise<string>;
  updateCulturalContext: (context: Partial<CulturalContext>) => Promise<void>;
  getCulturalElements: () => CulturalAdaptationState['culturalElements'];
  validateCulturalSensitivity: (content: string) => Promise<{
    isSensitive: boolean;
    issues: string[];
    suggestions: string[];
  }>;
  exportAdaptations: (format: 'json' | 'csv') => Promise<string>;
}

export function useCulturalAdaptation() {
  const { user } = useAuth();
  const [aiServices] = useState(() => new AIServices());
  const [state, setState] = useState<CulturalAdaptationState>({
    userCulturalContext: null,
    contentAdaptations: [],
    languagePreferences: [],
    culturalElements: {
      symbols: [],
      colors: [],
      traditions: [],
      values: [],
    },
    adaptationHistory: [],
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

  // Cargar contexto cultural del usuario
  useEffect(() => {
    const loadCulturalContext = async () => {
      if (!user || !aiServices.isReady()) return;

      try {
        setLoading(true);
        const culturalContext = await aiServices.getCulturalContext(user.id);
        
        if (culturalContext) {
          setState(prev => ({
            ...prev,
            userCulturalContext: culturalContext,
            languagePreferences: culturalContext.languages || [],
            culturalElements: {
              symbols: culturalContext.symbols || [],
              colors: culturalContext.colors || [],
              traditions: culturalContext.traditions || [],
              values: culturalContext.values || [],
            },
          }));
        }
      } catch (err) {
        console.error('Error cargando contexto cultural:', err);
      } finally {
        setLoading(false);
      }
    };

    loadCulturalContext();
  }, [user, aiServices]);

  // Adaptar contenido culturalmente
  const adaptContent = useCallback(async (
    content: string, 
    contentType: 'lesson' | 'assessment' | 'feedback'
  ): Promise<string> => {
    if (!user || !state.userCulturalContext) {
      throw new Error('Usuario no autenticado o contexto cultural no disponible');
    }

    try {
      setLoading(true);
      setError(null);

      const adaptedContent = await aiServices.adaptContentCulturally(
        content,
        state.userCulturalContext,
        contentType
      );

      // Guardar en historial
      setState(prev => ({
        ...prev,
        adaptationHistory: [
          ...prev.adaptationHistory,
          {
            contentId: `content_${Date.now()}`,
            originalContent: content,
            adaptedContent,
            culturalContext: state.userCulturalContext?.region || 'unknown',
            adaptationDate: new Date(),
            confidence: 0.85, // Valor por defecto, idealmente vendría del servicio
          },
        ],
      }));

      return adaptedContent;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error adaptando contenido';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user, aiServices, state.userCulturalContext]);

  // Actualizar contexto cultural
  const updateCulturalContext = useCallback(async (context: Partial<CulturalContext>): Promise<void> => {
    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    try {
      setLoading(true);
      setError(null);

      await aiServices.updateCulturalContext(user.id, context);
      
      setState(prev => ({
        ...prev,
        userCulturalContext: prev.userCulturalContext ? {
          ...prev.userCulturalContext,
          ...context,
        } : null,
        languagePreferences: context.languages || prev.languagePreferences,
        culturalElements: {
          symbols: context.symbols || prev.culturalElements.symbols,
          colors: context.colors || prev.culturalElements.colors,
          traditions: context.traditions || prev.culturalElements.traditions,
          values: context.values || prev.culturalElements.values,
        },
      }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error actualizando contexto cultural';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user, aiServices]);

  // Obtener elementos culturales
  const getCulturalElements = useCallback((): CulturalAdaptationState['culturalElements'] => {
    return state.culturalElements;
  }, [state.culturalElements]);

  // Validar sensibilidad cultural
  const validateCulturalSensitivity = useCallback(async (content: string): Promise<{
    isSensitive: boolean;
    issues: string[];
    suggestions: string[];
  }> => {
    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    try {
      setLoading(true);
      setError(null);

      const validation = await aiServices.validateCulturalSensitivity(
        content,
        state.userCulturalContext
      );

      return validation;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error validando sensibilidad cultural';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user, aiServices, state.userCulturalContext]);

  // Exportar adaptaciones
  const exportAdaptations = useCallback(async (format: 'json' | 'csv'): Promise<string> => {
    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    try {
      setLoading(true);
      setError(null);

      const exportData = {
        userId: user.id,
        culturalContext: state.userCulturalContext,
        adaptationHistory: state.adaptationHistory,
        culturalElements: state.culturalElements,
        languagePreferences: state.languagePreferences,
      };

      const result = await aiServices.exportCulturalData(exportData, format);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error exportando adaptaciones';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user, aiServices, state]);

  // Detectar contexto cultural automáticamente
  const detectCulturalContext = useCallback(async (userData: {
    region?: string;
    language?: string;
    culturalBackground?: string;
  }): Promise<void> => {
    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    try {
      setLoading(true);
      setError(null);

      const detectedContext = await aiServices.detectCulturalContext(userData);
      
      setState(prev => ({
        ...prev,
        userCulturalContext: detectedContext,
        languagePreferences: detectedContext.languages || [],
        culturalElements: {
          symbols: detectedContext.symbols || [],
          colors: detectedContext.colors || [],
          traditions: detectedContext.traditions || [],
          values: detectedContext.values || [],
        },
      }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error detectando contexto cultural';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user, aiServices]);

  return {
    // Estado
    ...state,
    loading,
    error,
    
    // Acciones
    adaptContent,
    updateCulturalContext,
    getCulturalElements,
    validateCulturalSensitivity,
    exportAdaptations,
    detectCulturalContext,
  };
}
