// Error Tracking - InclusiveAI Coach (Versión simplificada sin Sentry)

import { MONITORING_CONFIG } from './monitoring-config';

// Tipos para error tracking
export interface ErrorEvent {
  message: string;
  error?: Error;
  context?: Record<string, any>;
  level?: 'fatal' | 'error' | 'warning' | 'info' | 'debug';
  tags?: Record<string, string>;
  user?: {
    id?: string;
    email?: string;
    role?: string;
  };
  breadcrumbs?: Array<{
    message: string;
    category: string;
    level: string;
    timestamp: number;
  }>;
}

export interface ErrorTracker {
  init(): void;
  captureException(error: Error, context?: Record<string, any>): void;
  captureMessage(message: string, level?: string, context?: Record<string, any>): void;
  setUser(user: { id?: string; email?: string; role?: string }): void;
  setTag(key: string, value: string): void;
  setContext(key: string, context: Record<string, any>): void;
  addBreadcrumb(breadcrumb: { message: string; category: string; level?: string }): void;
  flush(): Promise<boolean>;
}

// Implementación simplificada sin Sentry
class SimpleErrorTracker implements ErrorTracker {
  private isInitialized = false;
  private user?: { id?: string; email?: string; role?: string };
  private tags: Record<string, string> = {};
  private context: Record<string, any> = {};
  private breadcrumbs: Array<{
    message: string;
    category: string;
    level: string;
    timestamp: number;
  }> = [];

  async init(): Promise<void> {
    if (!MONITORING_CONFIG.enabled || this.isInitialized) {
      return;
    }

    try {
      console.log('✅ Error tracking inicializado (modo simple)');
      this.isInitialized = true;
    } catch (error) {
      console.error('❌ Error inicializando error tracking:', error);
    }
  }

  captureException(error: Error, context?: Record<string, any>): void {
    if (!this.isInitialized) {
      console.error('Error tracking no inicializado:', error);
      return;
    }

    try {
      const errorEvent: ErrorEvent = {
        message: error.message,
        error,
        context: { ...this.context, ...context },
        level: 'error',
        tags: this.tags,
        user: this.user,
        breadcrumbs: this.breadcrumbs
      };

      // En modo simple, solo loguear el error
      console.error('🚨 Error capturado:', errorEvent);
      
      // Aquí se podría enviar a un servicio de logging
      this.sendToLoggingService(errorEvent);
    } catch (trackingError) {
      console.error('Error enviando excepción:', trackingError);
    }
  }

  captureMessage(message: string, level: string = 'error', context?: Record<string, any>): void {
    if (!this.isInitialized) {
      console.error('Error tracking no inicializado:', message);
      return;
    }

    try {
      const errorEvent: ErrorEvent = {
        message,
        context: { ...this.context, ...context },
        level: level as any,
        tags: this.tags,
        user: this.user,
        breadcrumbs: this.breadcrumbs
      };

      console.log(`📝 Mensaje capturado (${level}):`, errorEvent);
      
      // Aquí se podría enviar a un servicio de logging
      this.sendToLoggingService(errorEvent);
    } catch (trackingError) {
      console.error('Error enviando mensaje:', trackingError);
    }
  }

  setUser(user: { id?: string; email?: string; role?: string }): void {
    this.user = user;
    console.log('👤 Usuario configurado para error tracking:', user);
  }

  setTag(key: string, value: string): void {
    this.tags[key] = value;
  }

  setContext(key: string, context: Record<string, any>): void {
    this.context[key] = context;
  }

  addBreadcrumb(breadcrumb: { message: string; category: string; level?: string }): void {
    this.breadcrumbs.push({
      ...breadcrumb,
      level: breadcrumb.level || 'info',
      timestamp: Date.now()
    });

    // Mantener solo los últimos 100 breadcrumbs
    if (this.breadcrumbs.length > 100) {
      this.breadcrumbs = this.breadcrumbs.slice(-100);
    }
  }

  async flush(): Promise<boolean> {
    try {
      // En modo simple, no hay nada que flush
      console.log('🔄 Error tracking flush completado');
      return true;
    } catch (error) {
      console.error('Error en flush:', error);
      return false;
    }
  }

  private async sendToLoggingService(errorEvent: ErrorEvent): Promise<void> {
    try {
      // En modo simple, solo loguear
      // En producción, aquí se enviaría a un servicio real
             if (MONITORING_CONFIG.enabled) {
        console.group('📊 Error Event Details');
        console.log('Message:', errorEvent.message);
        console.log('Level:', errorEvent.level);
        console.log('User:', errorEvent.user);
        console.log('Tags:', errorEvent.tags);
        console.log('Context:', errorEvent.context);
        console.log('Breadcrumbs:', errorEvent.breadcrumbs);
        console.groupEnd();
      }
    } catch (error) {
      console.error('Error enviando a servicio de logging:', error);
    }
  }
}

// Instancia singleton
export const errorTracker = new SimpleErrorTracker();

// Hook para usar error tracking en componentes React
export function useErrorTracking() {
  return {
    captureException: (error: Error, context?: Record<string, any>) => {
      errorTracker.captureException(error, context);
    },
    captureMessage: (message: string, level?: string, context?: Record<string, any>) => {
      errorTracker.captureMessage(message, level, context);
    },
    setUser: (user: { id?: string; email?: string; role?: string }) => {
      errorTracker.setUser(user);
    },
    setTag: (key: string, value: string) => {
      errorTracker.setTag(key, value);
    },
    setContext: (key: string, context: Record<string, any>) => {
      errorTracker.setContext(key, context);
    },
    addBreadcrumb: (breadcrumb: { message: string; category: string; level?: string }) => {
      errorTracker.addBreadcrumb(breadcrumb);
    }
  };
}

// Función para inicializar error tracking
export async function initializeErrorTracking(): Promise<void> {
  await errorTracker.init();
}

// Función para capturar errores no manejados
export function setupGlobalErrorHandling(): void {
  if (typeof window !== 'undefined') {
    window.addEventListener('error', (event) => {
      errorTracker.captureException(event.error || new Error(event.message), {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      errorTracker.captureException(
        event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
        { type: 'unhandledrejection' }
      );
    });
  }
}
