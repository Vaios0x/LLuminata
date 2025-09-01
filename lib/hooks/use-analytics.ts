import { useState, useEffect, useCallback } from 'react';
import { analyticsService } from '../analytics/analytics-service';

// Hook personalizado para analytics
export const useAnalytics = (userId?: string) => {
  const [sessionId, setSessionId] = useState<string>('');

  // Generar sessionId al montar
  useEffect(() => {
    setSessionId(`session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  }, []);

  // Trackear evento
  const trackEvent = useCallback(async (
    event: string,
    category: string,
    action: string,
    label?: string,
    value?: number,
    parameters: Record<string, any> = {}
  ) => {
    try {
      await analyticsService.trackEvent({
        userId,
        sessionId,
        event,
        category,
        action,
        label,
        value,
        parameters,
        userAgent: typeof window !== 'undefined' ? navigator.userAgent : '',
        page: typeof window !== 'undefined' ? window.location.pathname : '',
      });
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  }, [userId, sessionId]);

  // Trackear pageview
  const trackPageView = useCallback(async (
    path: string,
    title: string
  ) => {
    try {
      await analyticsService.trackPageView(path, title, userId, sessionId);
    } catch (error) {
      console.error('Error tracking pageview:', error);
    }
  }, [userId, sessionId]);

  // Trackear evento de aprendizaje
  const trackLearningEvent = useCallback(async (
    eventType: 'lesson_start' | 'lesson_complete' | 'assessment_start' | 'assessment_complete' | 'achievement_earned',
    data: {
      lessonId?: string;
      assessmentId?: string;
      achievementId?: string;
      score?: number;
      timeSpent?: number;
      difficulty?: number;
    }
  ) => {
    if (!userId) return;

    try {
      await analyticsService.trackLearningEvent(eventType, {
        userId,
        ...data
      });
    } catch (error) {
      console.error('Error tracking learning event:', error);
    }
  }, [userId]);

  // Trackear evento de accesibilidad
  const trackAccessibilityEvent = useCallback(async (
    eventType: 'screen_reader_used' | 'high_contrast_enabled' | 'large_text_enabled' | 'voice_navigation_used'
  ) => {
    if (!userId) return;

    try {
      await analyticsService.trackAccessibilityEvent(eventType, userId);
    } catch (error) {
      console.error('Error tracking accessibility event:', error);
    }
  }, [userId]);

  // Obtener métricas de usuario
  const getUserMetrics = useCallback(async () => {
    if (!userId) return null;

    try {
      return await analyticsService.getUserMetrics(userId);
    } catch (error) {
      console.error('Error getting user metrics:', error);
      return null;
    }
  }, [userId]);

  // Generar reporte de progreso
  const generateProgressReport = useCallback(async (
    period: 'daily' | 'weekly' | 'monthly' = 'weekly'
  ) => {
    if (!userId) return null;

    try {
      return await analyticsService.generateProgressReport(userId, period);
    } catch (error) {
      console.error('Error generating progress report:', error);
      return null;
    }
  }, [userId]);

  // Trackear interacción de usuario
  const trackUserInteraction = useCallback(async (
    element: string,
    action: string,
    value?: string
  ) => {
    await trackEvent(
      'user_interaction',
      'engagement',
      action,
      element,
      undefined,
      { value, element }
    );
  }, [trackEvent]);

  // Trackear error
  const trackError = useCallback(async (
    error: Error,
    context?: Record<string, any>
  ) => {
    await trackEvent(
      'error',
      'error',
      'error_occurred',
      error.message,
      undefined,
      {
        errorName: error.name,
        errorStack: error.stack,
        ...context
      }
    );
  }, [trackEvent]);

  // Trackear performance
  const trackPerformance = useCallback(async (
    metric: string,
    value: number,
    context?: Record<string, any>
  ) => {
    await trackEvent(
      'performance',
      'performance',
      metric,
      metric,
      value,
      context
    );
  }, [trackEvent]);

  return {
    trackEvent,
    trackPageView,
    trackLearningEvent,
    trackAccessibilityEvent,
    trackUserInteraction,
    trackError,
    trackPerformance,
    getUserMetrics,
    generateProgressReport,
    sessionId
  };
};

// Hook para tracking automático de páginas
export const usePageTracking = (userId?: string) => {
  const { trackPageView } = useAnalytics(userId);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      trackPageView(window.location.pathname, document.title);
    }
  }, [trackPageView]);

  return { trackPageView };
};

// Hook para tracking de errores
export const useErrorTracking = (userId?: string) => {
  const { trackError } = useAnalytics(userId);

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      trackError(new Error(event.message), {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      trackError(new Error(event.reason), {
        type: 'unhandled_rejection',
        promise: event.promise
      });
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [trackError]);

  return { trackError };
};

// Hook para tracking de performance
export const usePerformanceTracking = (userId?: string) => {
  const { trackPerformance } = useAnalytics(userId);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      // Trackear métricas de Web Vitals
      const trackWebVitals = () => {
        // First Contentful Paint
        if ('PerformanceObserver' in window) {
          const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (entry.name === 'first-contentful-paint') {
                trackPerformance('fcp', entry.startTime);
              }
            }
          });
          observer.observe({ entryTypes: ['paint'] });
        }

        // Largest Contentful Paint
        if ('PerformanceObserver' in window) {
          const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              trackPerformance('lcp', entry.startTime);
            }
          });
          observer.observe({ entryTypes: ['largest-contentful-paint'] });
        }

        // First Input Delay
        if ('PerformanceObserver' in window) {
          const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              trackPerformance('fid', entry.processingStart - entry.startTime);
            }
          });
          observer.observe({ entryTypes: ['first-input'] });
        }

        // Cumulative Layout Shift
        if ('PerformanceObserver' in window) {
          let clsValue = 0;
          const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (!entry.hadRecentInput) {
                clsValue += (entry as any).value;
              }
            }
            trackPerformance('cls', clsValue);
          });
          observer.observe({ entryTypes: ['layout-shift'] });
        }
      };

      // Trackear cuando la página esté completamente cargada
      if (document.readyState === 'complete') {
        trackWebVitals();
      } else {
        window.addEventListener('load', trackWebVitals);
      }
    }
  }, [trackPerformance]);

  return { trackPerformance };
};

export default useAnalytics;
