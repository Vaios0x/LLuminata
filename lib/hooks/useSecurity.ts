import { useState, useEffect, useCallback } from 'react';
import { validationSchemas, sanitizeUserInput, validateEmail, validateUUID } from '../security';
import { z } from 'zod';

// Tipos para el hook de seguridad
interface SecurityState {
  isAuthenticated: boolean;
  sessionExpiry: Date | null;
  lastActivity: Date;
  failedAttempts: number;
  isLocked: boolean;
  lockoutUntil: Date | null;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

interface SecurityActions {
  validateInput: (schema: keyof typeof validationSchemas, data: any) => ValidationResult;
  sanitizeInput: (input: string) => string;
  validateEmail: (email: string) => boolean;
  validateUUID: (uuid: string) => boolean;
  checkSession: () => boolean;
  updateActivity: () => void;
  incrementFailedAttempts: () => void;
  resetFailedAttempts: () => void;
  lockAccount: (duration?: number) => void;
  unlockAccount: () => void;
  logout: () => void;
}

// Configuración de seguridad
const SECURITY_CONFIG = {
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 horas
  ACTIVITY_TIMEOUT: 30 * 60 * 1000, // 30 minutos
  MAX_FAILED_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutos
  ACTIVITY_CHECK_INTERVAL: 60 * 1000, // 1 minuto
} as const;

export function useSecurity(): SecurityState & SecurityActions {
  const [securityState, setSecurityState] = useState<SecurityState>({
    isAuthenticated: false,
    sessionExpiry: null,
    lastActivity: new Date(),
    failedAttempts: 0,
    isLocked: false,
    lockoutUntil: null,
  });

  // Inicializar estado desde localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('security-state');
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        setSecurityState(prev => ({
          ...prev,
          ...parsed,
          sessionExpiry: parsed.sessionExpiry ? new Date(parsed.sessionExpiry) : null,
          lastActivity: parsed.lastActivity ? new Date(parsed.lastActivity) : null,
          lockoutUntil: parsed.lockoutUntil ? new Date(parsed.lockoutUntil) : null,
        }));
      } catch (error) {
        console.error('Error parsing security state:', error);
        localStorage.removeItem('security-state');
      }
    }
  }, []);

  // Guardar estado en localStorage
  const saveState = useCallback((state: SecurityState) => {
    localStorage.setItem('security-state', JSON.stringify(state));
  }, []);

  // Actualizar estado y guardar
  const updateState = useCallback((updates: Partial<SecurityState>) => {
    setSecurityState(prev => {
      const newState = { ...prev, ...updates };
      saveState(newState);
      return newState;
    });
  }, [saveState]);

  // Validar entrada usando esquemas de Zod
  const validateInput = useCallback((schema: keyof typeof validationSchemas, data: any): ValidationResult => {
    try {
      const selectedSchema = validationSchemas[schema];
      if (!selectedSchema) {
        return {
          isValid: false,
          errors: ['Esquema de validación no encontrado'],
        };
      }

      // Validar usando Zod
      selectedSchema.parse(data);
      return {
        isValid: true,
        errors: [],
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          isValid: false,
          errors: error.errors.map(err => err.message),
        };
      }
      return {
        isValid: false,
        errors: ['Error de validación desconocido'],
      };
    }
  }, []);

  // Sanitizar entrada de usuario
  const sanitizeInput = useCallback((input: string): string => {
    return sanitizeUserInput(input);
  }, []);

  // Validar email
  const validateEmailInput = useCallback((email: string): boolean => {
    return validateEmail(email);
  }, []);

  // Validar UUID
  const validateUUIDInput = useCallback((uuid: string): boolean => {
    return validateUUID(uuid);
  }, []);

  // Verificar sesión
  const checkSession = useCallback((): boolean => {
    const now = new Date();
    
    // Verificar si la cuenta está bloqueada
    if (securityState.isLocked && securityState.lockoutUntil && now < securityState.lockoutUntil) {
      return false;
    }
    
    // Si la cuenta estaba bloqueada pero ya pasó el tiempo, desbloquear
    if (securityState.isLocked && securityState.lockoutUntil && now >= securityState.lockoutUntil) {
      updateState({
        isLocked: false,
        lockoutUntil: null,
      });
    }
    
    // Verificar si la sesión ha expirado
    if (securityState.sessionExpiry && now > securityState.sessionExpiry) {
      logout();
      return false;
    }
    
    // Verificar inactividad
    const timeSinceLastActivity = now.getTime() - securityState.lastActivity.getTime();
    if (timeSinceLastActivity > SECURITY_CONFIG.ACTIVITY_TIMEOUT) {
      logout();
      return false;
    }
    
    return securityState.isAuthenticated;
  }, [securityState, updateState]);

  // Actualizar actividad del usuario
  const updateActivity = useCallback(() => {
    updateState({
      lastActivity: new Date(),
    });
  }, [updateState]);

  // Incrementar intentos fallidos
  const incrementFailedAttempts = useCallback(() => {
    const newFailedAttempts = securityState.failedAttempts + 1;
    updateState({
      failedAttempts: newFailedAttempts,
    });
    
    // Bloquear cuenta si se excede el límite
    if (newFailedAttempts >= SECURITY_CONFIG.MAX_FAILED_ATTEMPTS) {
      lockAccount();
    }
  }, [securityState.failedAttempts, updateState]);

  // Resetear intentos fallidos
  const resetFailedAttempts = useCallback(() => {
    updateState({
      failedAttempts: 0,
    });
  }, [updateState]);

  // Bloquear cuenta
  const lockAccount = useCallback((duration: number = SECURITY_CONFIG.LOCKOUT_DURATION) => {
    const lockoutUntil = new Date(Date.now() + duration);
    updateState({
      isLocked: true,
      lockoutUntil,
    });
  }, [updateState]);

  // Desbloquear cuenta
  const unlockAccount = useCallback(() => {
    updateState({
      isLocked: false,
      lockoutUntil: null,
      failedAttempts: 0,
    });
  }, [updateState]);

  // Cerrar sesión
  const logout = useCallback(() => {
    updateState({
      isAuthenticated: false,
      sessionExpiry: null,
      lastActivity: new Date(),
      failedAttempts: 0,
      isLocked: false,
      lockoutUntil: null,
    });
    
    // Limpiar tokens de autenticación
    localStorage.removeItem('auth-token');
    localStorage.removeItem('refresh-token');
    sessionStorage.clear();
  }, [updateState]);

  // Verificar sesión periódicamente
  useEffect(() => {
    const interval = setInterval(() => {
      if (securityState.isAuthenticated) {
        const isValid = checkSession();
        if (!isValid) {
          console.warn('Sesión expirada o inválida');
        }
      }
    }, SECURITY_CONFIG.ACTIVITY_CHECK_INTERVAL);

    return () => clearInterval(interval);
  }, [securityState.isAuthenticated, checkSession]);

  // Actualizar actividad en eventos del usuario
  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const handleActivity = () => {
      if (securityState.isAuthenticated) {
        updateActivity();
      }
    };
    
    events.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true });
    });
    
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
    };
  }, [securityState.isAuthenticated, updateActivity]);

  return {
    ...securityState,
    validateInput,
    sanitizeInput,
    validateEmail: validateEmailInput,
    validateUUID: validateUUIDInput,
    checkSession,
    updateActivity,
    incrementFailedAttempts,
    resetFailedAttempts,
    lockAccount,
    unlockAccount,
    logout,
  };
}

// Hook para validación de formularios
export function useFormValidation<T extends Record<string, any>>(
  schema: keyof typeof validationSchemas,
  initialData: T
) {
  const [data, setData] = useState<T>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isValid, setIsValid] = useState(false);
  const { validateInput } = useSecurity();

  // Validar datos cuando cambien
  useEffect(() => {
    const validation = validateInput(schema, data);
    setIsValid(validation.isValid);
    
    if (!validation.isValid) {
      const errorMap: Record<string, string> = {};
      validation.errors.forEach(error => {
        // Extraer el campo del error (asumiendo formato "campo: mensaje")
        const fieldMatch = error.match(/^([^:]+):\s*(.+)$/);
        if (fieldMatch) {
          errorMap[fieldMatch[1]] = fieldMatch[2];
        } else {
          // Si no se puede extraer el campo, usar un campo general
          errorMap['general'] = error;
        }
      });
      setErrors(errorMap);
    } else {
      setErrors({});
    }
  }, [data, schema, validateInput]);

  // Actualizar campo
  const updateField = useCallback((field: keyof T, value: any) => {
    setData(prev => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  // Actualizar múltiples campos
  const updateFields = useCallback((updates: Partial<T>) => {
    setData(prev => ({
      ...prev,
      ...updates,
    }));
  }, []);

  // Resetear formulario
  const resetForm = useCallback(() => {
    setData(initialData);
    setErrors({});
    setIsValid(false);
  }, [initialData]);

  return {
    data,
    errors,
    isValid,
    updateField,
    updateFields,
    resetForm,
  };
}

// Hook para protección de rutas
export function useRouteProtection(requiredAuth: boolean = true) {
  const { isAuthenticated, checkSession, logout } = useSecurity();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      if (requiredAuth) {
        const sessionValid = checkSession();
        setIsAuthorized(sessionValid);
        
        if (!sessionValid && isAuthenticated) {
          logout();
        }
      } else {
        setIsAuthorized(true);
      }
      setIsLoading(false);
    };

    checkAuth();
  }, [requiredAuth, isAuthenticated, checkSession, logout]);

  return {
    isLoading,
    isAuthorized,
    isAuthenticated,
  };
}

// Hook para detección de actividad sospechosa
export function useSuspiciousActivityDetection() {
  const [suspiciousActivity, setSuspiciousActivity] = useState<string[]>([]);
  const { failedAttempts, isLocked } = useSecurity();

  useEffect(() => {
    const activities: string[] = [];
    
    // Detectar múltiples intentos fallidos
    if (failedAttempts >= 3) {
      activities.push(`Múltiples intentos de login fallidos (${failedAttempts})`);
    }
    
    // Detectar cuenta bloqueada
    if (isLocked) {
      activities.push('Cuenta temporalmente bloqueada por seguridad');
    }
    
    setSuspiciousActivity(activities);
  }, [failedAttempts, isLocked]);

  return suspiciousActivity;
}
