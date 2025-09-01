import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './useAuth';
import { SecurityService } from '../security';

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (req: any) => string;
  handler?: (req: any, res: any) => void;
}

interface RateLimitState {
  currentRequests: number;
  remainingRequests: number;
  resetTime: Date | null;
  isLimited: boolean;
  limitHistory: {
    timestamp: Date;
    action: string;
    success: boolean;
    remainingRequests: number;
  }[];
  rateLimitConfig: RateLimitConfig;
  blockedUntil?: Date;
}

interface RateLimitActions {
  checkRateLimit: (action: string) => Promise<boolean>;
  incrementRequest: (action: string) => Promise<void>;
  resetRateLimit: () => Promise<void>;
  updateRateLimitConfig: (config: Partial<RateLimitConfig>) => void;
  getRateLimitStatus: () => RateLimitState;
  isBlocked: () => boolean;
  getRemainingTime: () => number;
}

export function useRateLimit(config?: Partial<RateLimitConfig>) {
  const { user } = useAuth();
  const [securityService] = useState(() => new SecurityService());
  const [state, setState] = useState<RateLimitState>({
    currentRequests: 0,
    remainingRequests: 100, // Valor por defecto
    resetTime: null,
    isLimited: false,
    limitHistory: [],
    rateLimitConfig: {
      maxRequests: config?.maxRequests || 100,
      windowMs: config?.windowMs || 15 * 60 * 1000, // 15 minutos por defecto
      skipSuccessfulRequests: config?.skipSuccessfulRequests || false,
      skipFailedRequests: config?.skipFailedRequests || false,
    },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Inicializar servicio de seguridad
  useEffect(() => {
    const initializeSecurityService = async () => {
      try {
        setLoading(true);
        await securityService.initialize();
        setError(null);
      } catch (err) {
        setError('Error inicializando servicio de seguridad');
        console.error('Error inicializando servicio de seguridad:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      initializeSecurityService();
    }
  }, [user, securityService]);

  // Cargar estado de rate limit
  useEffect(() => {
    const loadRateLimitState = async () => {
      if (!user || !securityService.isReady()) return;

      try {
        setLoading(true);
        const rateLimitState = await securityService.getRateLimitState(user.id);
        
        if (rateLimitState) {
          setState(prev => ({
            ...prev,
            currentRequests: rateLimitState.currentRequests,
            remainingRequests: rateLimitState.remainingRequests,
            resetTime: rateLimitState.resetTime,
            isLimited: rateLimitState.isLimited,
            blockedUntil: rateLimitState.blockedUntil,
          }));
        }
      } catch (err) {
        console.error('Error cargando estado de rate limit:', err);
      } finally {
        setLoading(false);
      }
    };

    loadRateLimitState();
  }, [user, securityService]);

  // Configurar intervalo para reset automático
  useEffect(() => {
    if (state.resetTime) {
      const now = new Date();
      const timeUntilReset = state.resetTime.getTime() - now.getTime();
      
      if (timeUntilReset > 0) {
        intervalRef.current = setTimeout(() => {
          resetRateLimit();
        }, timeUntilReset);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
      }
    };
  }, [state.resetTime]);

  // Verificar rate limit
  const checkRateLimit = useCallback(async (action: string): Promise<boolean> => {
    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    try {
      setLoading(true);
      setError(null);

      const isAllowed = await securityService.checkRateLimit(user.id, action);
      
      // Actualizar historial
      setState(prev => ({
        ...prev,
        limitHistory: [
          {
            timestamp: new Date(),
            action,
            success: isAllowed,
            remainingRequests: isAllowed ? prev.remainingRequests - 1 : prev.remainingRequests,
          },
          ...prev.limitHistory.slice(0, 99), // Mantener solo los últimos 100
        ],
      }));

      return isAllowed;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error verificando rate limit';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user, securityService]);

  // Incrementar contador de requests
  const incrementRequest = useCallback(async (action: string): Promise<void> => {
    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    try {
      setLoading(true);
      setError(null);

      const newState = await securityService.incrementRequest(user.id, action);
      
      setState(prev => ({
        ...prev,
        currentRequests: newState.currentRequests,
        remainingRequests: newState.remainingRequests,
        isLimited: newState.isLimited,
        resetTime: newState.resetTime,
        blockedUntil: newState.blockedUntil,
      }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error incrementando request';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user, securityService]);

  // Resetear rate limit
  const resetRateLimit = useCallback(async (): Promise<void> => {
    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    try {
      setLoading(true);
      setError(null);

      await securityService.resetRateLimit(user.id);
      
      const resetTime = new Date(Date.now() + state.rateLimitConfig.windowMs);
      
      setState(prev => ({
        ...prev,
        currentRequests: 0,
        remainingRequests: prev.rateLimitConfig.maxRequests,
        resetTime,
        isLimited: false,
        blockedUntil: undefined,
      }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error reseteando rate limit';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user, securityService, state.rateLimitConfig.windowMs, state.rateLimitConfig.maxRequests]);

  // Actualizar configuración de rate limit
  const updateRateLimitConfig = useCallback((config: Partial<RateLimitConfig>) => {
    setState(prev => ({
      ...prev,
      rateLimitConfig: { ...prev.rateLimitConfig, ...config },
      remainingRequests: config.maxRequests || prev.rateLimitConfig.maxRequests,
    }));
  }, []);

  // Obtener estado de rate limit
  const getRateLimitStatus = useCallback((): RateLimitState => {
    return state;
  }, [state]);

  // Verificar si está bloqueado
  const isBlocked = useCallback((): boolean => {
    if (state.blockedUntil) {
      return new Date() < state.blockedUntil;
    }
    return state.isLimited;
  }, [state.isLimited, state.blockedUntil]);

  // Obtener tiempo restante
  const getRemainingTime = useCallback((): number => {
    if (state.blockedUntil) {
      const now = new Date();
      const remaining = state.blockedUntil.getTime() - now.getTime();
      return Math.max(0, remaining);
    }
    
    if (state.resetTime) {
      const now = new Date();
      const remaining = state.resetTime.getTime() - now.getTime();
      return Math.max(0, remaining);
    }
    
    return 0;
  }, [state.blockedUntil, state.resetTime]);

  // Función helper para hacer request con rate limiting
  const makeRateLimitedRequest = useCallback(async <T>(
    action: string,
    requestFn: () => Promise<T>
  ): Promise<T> => {
    // Verificar rate limit antes de hacer la request
    const isAllowed = await checkRateLimit(action);
    
    if (!isAllowed) {
      throw new Error(`Rate limit exceeded for action: ${action}`);
    }

    try {
      // Incrementar contador
      await incrementRequest(action);
      
      // Ejecutar la request
      const result = await requestFn();
      
      return result;
    } catch (err) {
      // Si la request falla y no debemos contar requests fallidos, revertir el incremento
      if (state.rateLimitConfig.skipFailedRequests) {
        // Aquí podríamos implementar lógica para revertir el incremento
        console.warn('Request failed, but rate limit was already incremented');
      }
      
      throw err;
    }
  }, [checkRateLimit, incrementRequest, state.rateLimitConfig.skipFailedRequests]);

  // Función helper para obtener estadísticas de rate limit
  const getRateLimitStats = useCallback(() => {
    const now = new Date();
    const lastHour = new Date(now.getTime() - 60 * 60 * 1000);
    const lastDay = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const hourlyRequests = state.limitHistory.filter(
      entry => entry.timestamp > lastHour
    ).length;

    const dailyRequests = state.limitHistory.filter(
      entry => entry.timestamp > lastDay
    ).length;

    const successRate = state.limitHistory.length > 0
      ? (state.limitHistory.filter(entry => entry.success).length / state.limitHistory.length) * 100
      : 100;

    return {
      hourlyRequests,
      dailyRequests,
      successRate: Math.round(successRate * 100) / 100,
      totalRequests: state.limitHistory.length,
      isBlocked: isBlocked(),
      remainingTime: getRemainingTime(),
    };
  }, [state.limitHistory, isBlocked, getRemainingTime]);

  // Limpiar recursos al desmontar
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
      }
    };
  }, []);

  return {
    // Estado
    ...state,
    loading,
    error,
    
    // Acciones
    checkRateLimit,
    incrementRequest,
    resetRateLimit,
    updateRateLimitConfig,
    getRateLimitStatus,
    isBlocked,
    getRemainingTime,
    
    // Helpers
    makeRateLimitedRequest,
    getRateLimitStats,
  };
}
