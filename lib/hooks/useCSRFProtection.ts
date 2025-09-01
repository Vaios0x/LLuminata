import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { SecurityService } from '../security';

interface CSRFConfig {
  tokenLength: number;
  tokenExpiry: number; // en milisegundos
  headerName: string;
  cookieName: string;
  refreshOnNavigation: boolean;
  validateOnAllRequests: boolean;
}

interface CSRFState {
  token: string | null;
  tokenExpiry: Date | null;
  isTokenValid: boolean;
  tokenHistory: {
    token: string;
    generatedAt: Date;
    expiresAt: Date;
    used: boolean;
  }[];
  csrfAttempts: {
    timestamp: Date;
    ip: string;
    userAgent: string;
    blocked: boolean;
    reason: string;
  }[];
}

interface CSRFProtectionActions {
  generateToken: () => Promise<string>;
  validateToken: (token: string) => Promise<boolean>;
  refreshToken: () => Promise<string>;
  getToken: () => string | null;
  isTokenExpired: () => boolean;
  addCSRFHeader: (headers: Record<string, string>) => Record<string, string>;
  validateRequest: (requestData: any) => Promise<boolean>;
  logCSRFAttempt: (attempt: Omit<CSRFState['csrfAttempts'][0], 'timestamp'>) => void;
  getCSRFStats: () => any;
}

export function useCSRFProtection(config?: Partial<CSRFConfig>) {
  const { user } = useAuth();
  const [securityService] = useState(() => new SecurityService());
  const [state, setState] = useState<CSRFState>({
    token: null,
    tokenExpiry: null,
    isTokenValid: false,
    tokenHistory: [],
    csrfAttempts: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const csrfConfig: CSRFConfig = {
    tokenLength: config?.tokenLength || 32,
    tokenExpiry: config?.tokenExpiry || 24 * 60 * 60 * 1000, // 24 horas por defecto
    headerName: config?.headerName || 'X-CSRF-Token',
    cookieName: config?.cookieName || 'csrf-token',
    refreshOnNavigation: config?.refreshOnNavigation || true,
    validateOnAllRequests: config?.validateOnAllRequests || false,
  };

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

  // Cargar token existente
  useEffect(() => {
    const loadExistingToken = async () => {
      if (!user || !securityService.isReady()) return;

      try {
        setLoading(true);
        const existingToken = await securityService.getCSRFToken(user.id);
        
        if (existingToken && !isTokenExpired(existingToken.expiresAt)) {
          setState(prev => ({
            ...prev,
            token: existingToken.token,
            tokenExpiry: existingToken.expiresAt,
            isTokenValid: true,
          }));
        } else {
          // Generar nuevo token si no existe o está expirado
          await generateToken();
        }
      } catch (err) {
        console.error('Error cargando token CSRF:', err);
        // Generar nuevo token en caso de error
        await generateToken();
      } finally {
        setLoading(false);
      }
    };

    loadExistingToken();
  }, [user, securityService]);

  // Verificar si el token está expirado
  const isTokenExpired = useCallback((expiryDate?: Date): boolean => {
    if (!expiryDate) return true;
    return new Date() > expiryDate;
  }, []);

  // Generar token CSRF
  const generateToken = useCallback(async (): Promise<string> => {
    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    try {
      setLoading(true);
      setError(null);

      const tokenData = await securityService.generateCSRFToken(user.id, csrfConfig);
      
      const expiryDate = new Date(Date.now() + csrfConfig.tokenExpiry);
      
      setState(prev => ({
        ...prev,
        token: tokenData.token,
        tokenExpiry: expiryDate,
        isTokenValid: true,
        tokenHistory: [
          {
            token: tokenData.token,
            generatedAt: new Date(),
            expiresAt: expiryDate,
            used: false,
          },
          ...prev.tokenHistory.slice(0, 9), // Mantener solo los últimos 10
        ],
      }));

      return tokenData.token;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error generando token CSRF';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user, securityService, csrfConfig]);

  // Validar token CSRF
  const validateToken = useCallback(async (token: string): Promise<boolean> => {
    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    try {
      setLoading(true);
      setError(null);

      const isValid = await securityService.validateCSRFToken(user.id, token);
      
      setState(prev => ({
        ...prev,
        isTokenValid: isValid,
        tokenHistory: prev.tokenHistory.map(entry => 
          entry.token === token ? { ...entry, used: true } : entry
        ),
      }));

      return isValid;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error validando token CSRF';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user, securityService]);

  // Refrescar token
  const refreshToken = useCallback(async (): Promise<string> => {
    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    try {
      setLoading(true);
      setError(null);

      // Invalidar token actual
      if (state.token) {
        await securityService.invalidateCSRFToken(user.id, state.token);
      }

      // Generar nuevo token
      const newToken = await generateToken();
      
      return newToken;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error refrescando token CSRF';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user, securityService, state.token, generateToken]);

  // Obtener token actual
  const getToken = useCallback((): string | null => {
    if (!state.token || isTokenExpired(state.tokenExpiry)) {
      return null;
    }
    return state.token;
  }, [state.token, state.tokenExpiry, isTokenExpired]);

  // Agregar header CSRF a las requests
  const addCSRFHeader = useCallback((headers: Record<string, string>): Record<string, string> => {
    const token = getToken();
    if (token) {
      return {
        ...headers,
        [csrfConfig.headerName]: token,
      };
    }
    return headers;
  }, [getToken, csrfConfig.headerName]);

  // Validar request
  const validateRequest = useCallback(async (requestData: any): Promise<boolean> => {
    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    try {
      setLoading(true);
      setError(null);

      const isValid = await securityService.validateCSRFRequest(user.id, requestData);
      
      if (!isValid) {
        // Registrar intento de CSRF
        logCSRFAttempt({
          ip: requestData.ip || 'unknown',
          userAgent: requestData.userAgent || 'unknown',
          blocked: true,
          reason: 'Invalid CSRF token',
        });
      }

      return isValid;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error validando request CSRF';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user, securityService]);

  // Registrar intento de CSRF
  const logCSRFAttempt = useCallback((attempt: Omit<CSRFState['csrfAttempts'][0], 'timestamp'>) => {
    setState(prev => ({
      ...prev,
      csrfAttempts: [
        {
          ...attempt,
          timestamp: new Date(),
        },
        ...prev.csrfAttempts.slice(0, 99), // Mantener solo los últimos 100
      ],
    }));
  }, []);

  // Obtener estadísticas de CSRF
  const getCSRFStats = useCallback(() => {
    const now = new Date();
    const lastHour = new Date(now.getTime() - 60 * 60 * 1000);
    const lastDay = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const hourlyAttempts = state.csrfAttempts.filter(
      attempt => attempt.timestamp > lastHour
    ).length;

    const dailyAttempts = state.csrfAttempts.filter(
      attempt => attempt.timestamp > lastDay
    ).length;

    const blockedAttempts = state.csrfAttempts.filter(
      attempt => attempt.blocked
    ).length;

    const successRate = state.csrfAttempts.length > 0
      ? ((state.csrfAttempts.length - blockedAttempts) / state.csrfAttempts.length) * 100
      : 100;

    return {
      totalAttempts: state.csrfAttempts.length,
      blockedAttempts,
      hourlyAttempts,
      dailyAttempts,
      successRate: Math.round(successRate * 100) / 100,
      isTokenValid: state.isTokenValid,
      tokenExpiry: state.tokenExpiry,
      tokensGenerated: state.tokenHistory.length,
    };
  }, [state.csrfAttempts, state.isTokenValid, state.tokenExpiry, state.tokenHistory.length]);

  // Función helper para hacer request con protección CSRF
  const makeCSRFProtectedRequest = useCallback(async <T>(
    url: string,
    options: RequestInit = {}
  ): Promise<T> => {
    const token = getToken();
    
    if (!token) {
      throw new Error('No CSRF token available');
    }

    const headers = addCSRFHeader(options.headers as Record<string, string> || {});
    
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      if (response.status === 403) {
        // Posible intento de CSRF, refrescar token
        await refreshToken();
        throw new Error('CSRF protection triggered, token refreshed');
      }
      throw new Error(`Request failed: ${response.statusText}`);
    }

    return response.json();
  }, [getToken, addCSRFHeader, refreshToken]);

  // Auto-refresh token si está próximo a expirar
  useEffect(() => {
    if (state.tokenExpiry) {
      const timeUntilExpiry = state.tokenExpiry.getTime() - Date.now();
      const refreshThreshold = 5 * 60 * 1000; // 5 minutos antes de expirar
      
      if (timeUntilExpiry > 0 && timeUntilExpiry < refreshThreshold) {
        refreshToken();
      }
    }
  }, [state.tokenExpiry, refreshToken]);

  return {
    // Estado
    ...state,
    loading,
    error,
    
    // Acciones
    generateToken,
    validateToken,
    refreshToken,
    getToken,
    isTokenExpired,
    addCSRFHeader,
    validateRequest,
    logCSRFAttempt,
    getCSRFStats,
    
    // Helpers
    makeCSRFProtectedRequest,
  };
}
