'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSecurity, useSuspiciousActivityDetection } from '@/lib/hooks/useSecurity';

// Tipos para el contexto de seguridad
interface SecurityContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  suspiciousActivity: string[];
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (userData: any) => Promise<boolean>;
  validateInput: (input: string) => string;
  checkSession: () => boolean;
}

// Crear contexto
const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

// Hook para usar el contexto
export function useSecurityContext() {
  const context = useContext(SecurityContext);
  if (context === undefined) {
    throw new Error('useSecurityContext debe ser usado dentro de SecurityProvider');
  }
  return context;
}

// Componente proveedor
export function SecurityProvider({ children }: { children: React.ReactNode }) {
  const security = useSecurity();
  const suspiciousActivity = useSuspiciousActivityDetection();
  const [isLoading, setIsLoading] = useState(true);

  // Función de login
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Validar email
      if (!security.validateEmail(email)) {
        throw new Error('Email inválido');
      }

      // Sanitizar entrada
      const sanitizedEmail = security.sanitizeInput(email);
      
      // Simular llamada a API (en producción, usar API real)
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: sanitizedEmail,
          password: password, // En producción, nunca enviar contraseña en texto plano
        }),
      });

      if (!response.ok) {
        security.incrementFailedAttempts();
        throw new Error('Credenciales inválidas');
      }

      const data = await response.json();
      
      // Guardar token (en producción, usar httpOnly cookies)
      localStorage.setItem('auth-token', data.token);
      
      // Actualizar estado de autenticación
      security.resetFailedAttempts();
      
      return true;
    } catch (error) {
      console.error('Error en login:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Función de registro
  const register = async (userData: any): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Validar datos con esquema
      const validation = security.validateInput('auth', userData);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      // Sanitizar datos
      const sanitizedData = {
        ...userData,
        firstName: security.sanitizeInput(userData.firstName),
        lastName: security.sanitizeInput(userData.lastName),
        email: security.sanitizeInput(userData.email),
      };

      // Simular llamada a API
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sanitizedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error en el registro');
      }

      return true;
    } catch (error) {
      console.error('Error en registro:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Función de logout
  const logout = () => {
    security.logout();
    // Limpiar tokens
    localStorage.removeItem('auth-token');
    localStorage.removeItem('refresh-token');
  };

  // Función para validar entrada
  const validateInput = (input: string): string => {
    return security.sanitizeInput(input);
  };

  // Verificar sesión al cargar
  useEffect(() => {
    const checkInitialSession = async () => {
      try {
        const token = localStorage.getItem('auth-token');
        if (token) {
          // Verificar token con el servidor
          const response = await fetch('/api/auth/verify', {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            logout();
          }
        }
      } catch (error) {
        console.error('Error verificando sesión:', error);
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    checkInitialSession();
  }, []);

  // Verificar sesión periódicamente
  useEffect(() => {
    const interval = setInterval(() => {
      if (security.isAuthenticated) {
        const isValid = security.checkSession();
        if (!isValid) {
          logout();
        }
      }
    }, 60000); // Verificar cada minuto

    return () => clearInterval(interval);
  }, [security.isAuthenticated]);

  // Valor del contexto
  const contextValue: SecurityContextType = {
    isAuthenticated: security.isAuthenticated,
    isLoading,
    suspiciousActivity,
    login,
    logout,
    register,
    validateInput,
    checkSession: security.checkSession,
  };

  return (
    <SecurityContext.Provider value={contextValue}>
      {children}
    </SecurityContext.Provider>
  );
}

// Componente de protección de rutas
export function ProtectedRoute({ 
  children, 
  fallback = <div>Cargando...</div> 
}: { 
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useSecurityContext();

  if (isLoading) {
    return <>{fallback}</>;
  }

  if (!isAuthenticated) {
    // Redirigir a login
    window.location.href = '/auth/login';
    return null;
  }

  return <>{children}</>;
}

// Componente de alerta de seguridad
export function SecurityAlert() {
  const { suspiciousActivity } = useSecurityContext();

  if (suspiciousActivity.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      {suspiciousActivity.map((activity, index) => (
        <div
          key={index}
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-2"
          role="alert"
        >
          <strong className="font-bold">Alerta de Seguridad:</strong>
          <span className="block sm:inline"> {activity}</span>
        </div>
      ))}
    </div>
  );
}

// Componente de monitor de actividad
export function ActivityMonitor() {
  const { isAuthenticated, checkSession } = useSecurityContext();
  const [lastActivity, setLastActivity] = useState(new Date());

  useEffect(() => {
    if (!isAuthenticated) return;

    const updateActivity = () => {
      setLastActivity(new Date());
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, updateActivity, { passive: true });
    });

    // Verificar sesión cada 5 minutos
    const interval = setInterval(() => {
      const isValid = checkSession();
      if (!isValid) {
        console.warn('Sesión expirada por inactividad');
      }
    }, 5 * 60 * 1000);

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivity);
      });
      clearInterval(interval);
    };
  }, [isAuthenticated, checkSession]);

  return null; // Componente invisible
}
