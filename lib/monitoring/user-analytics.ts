// User Analytics - InclusiveAI Coach

import * as React from 'react';
import { MONITORING_CONFIG } from './monitoring-config';

// Función simple de breadcrumb para evitar dependencias de JSX
function addBreadcrumb(breadcrumb: { message: string; category: string; level?: string }): void {
  if (typeof window !== 'undefined' && window.console) {
    console.log(`[${breadcrumb.category}] ${breadcrumb.message}`, breadcrumb);
  }
}

// Declaraciones de tipos para Google Analytics
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

// Tipos para user analytics
export interface AnalyticsEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
  customParameters?: Record<string, any>;
  timestamp?: number;
}

export interface UserSession {
  sessionId: string;
  startTime: number;
  lastActivity: number;
  pageViews: number;
  events: AnalyticsEvent[];
  userAgent: string;
  referrer: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

export interface AnalyticsUser {
  id?: string;
  email?: string;
  role?: string;
  preferences?: Record<string, any>;
  demographics?: {
    age?: number;
    gender?: string;
    location?: string;
    language?: string;
  };
}

export interface AnalyticsTracker {
  init(): void;
  trackPageView(path: string, title?: string): void;
  trackEvent(event: AnalyticsEvent): void;
  trackUser(user: AnalyticsUser): void;
  trackSession(sessionData: Partial<UserSession>): void;
  trackConversion(conversionId: string, value?: number): void;
  trackError(error: Error, context?: Record<string, any>): void;
  trackPerformance(metrics: Record<string, number>): void;
  trackAccessibility(issue: { type: string; severity: string; element?: string }): void;
  trackOffline(offlineData: { duration: number; actions: string[] }): void;
  getSessionData(): UserSession | null;
  reset(): void;
}

// Implementación de Google Analytics
class GoogleAnalyticsTracker implements AnalyticsTracker {
  private gtag: any;
  private session: UserSession | null = null;
  private user: AnalyticsUser | null = null;
  private isInitialized = false;

  async init(): Promise<void> {
    if (!MONITORING_CONFIG.analytics.enabled || this.isInitialized) {
      return;
    }

    try {
      // Configurar Google Analytics
      if (typeof window !== 'undefined') {
        // Cargar gtag dinámicamente
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${MONITORING_CONFIG.analytics.googleAnalytics.id}`;
        document.head.appendChild(script);

        window.dataLayer = window.dataLayer || [];
        this.gtag = function(...args: any[]) {
          window.dataLayer.push(args);
        };

        this.gtag('js', new Date());
        this.gtag('config', MONITORING_CONFIG.analytics.googleAnalytics.id, {
          anonymize_ip: MONITORING_CONFIG.analytics.privacy.anonymizeIP,
          send_page_view: false, // Controlamos manualmente
          debug_mode: MONITORING_CONFIG.analytics.googleAnalytics.debug,
        });

        // Inicializar sesión
        this.initSession();
        
        this.isInitialized = true;
        console.log('✅ Google Analytics inicializado');
      }
    } catch (error) {
      console.error('❌ Error inicializando Google Analytics:', error);
    }
  }

  private initSession(): void {
    this.session = {
      sessionId: this.generateSessionId(),
      startTime: Date.now(),
      lastActivity: Date.now(),
      pageViews: 0,
      events: [],
      userAgent: navigator.userAgent,
      referrer: document.referrer,
      utmSource: this.getUrlParameter('utm_source'),
      utmMedium: this.getUrlParameter('utm_medium'),
      utmCampaign: this.getUrlParameter('utm_campaign'),
    };

    // Trackear inicio de sesión
    this.trackEvent({
      action: 'session_start',
      category: 'engagement',
      label: 'Session Started',
    });
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private getUrlParameter(name: string): string | undefined {
    if (typeof window === 'undefined') return undefined;
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name) || undefined;
  }

  trackPageView(path: string, title?: string): void {
    if (!this.isInitialized || !this.session) return;

    this.session.pageViews++;
    this.session.lastActivity = Date.now();

    const event: AnalyticsEvent = {
      action: 'page_view',
      category: 'navigation',
      label: path,
      customParameters: {
        page_title: title || document.title,
        page_path: path,
        page_views: this.session.pageViews,
      },
      timestamp: Date.now(),
    };

    this.trackEvent(event);

    // Enviar a Google Analytics
    if (this.gtag) {
      this.gtag('event', 'page_view', {
        page_title: title || document.title,
        page_location: window.location.href,
        page_path: path,
      });
    }
  }

  trackEvent(event: AnalyticsEvent): void {
    if (!this.isInitialized || !this.session) return;

    // Agregar timestamp si no existe
    if (!event.timestamp) {
      event.timestamp = Date.now();
    }

    this.session.events.push(event);
    this.session.lastActivity = event.timestamp;

    // Enviar a Google Analytics
    if (this.gtag) {
      this.gtag('event', event.action, {
        event_category: event.category,
        event_label: event.label,
        value: event.value,
        ...event.customParameters,
      });
    }

    // Agregar breadcrumb para debugging
    addBreadcrumb({
      message: `Analytics: ${event.category}/${event.action}`,
      category: 'analytics',
      level: 'info',
    });
  }

  trackUser(user: AnalyticsUser): void {
    this.user = { ...this.user, ...user };

    if (this.gtag && user.id) {
      this.gtag('config', MONITORING_CONFIG.analytics.googleAnalytics.id, {
        user_id: user.id,
      });
    }

    // Trackear evento de usuario
    this.trackEvent({
      action: 'user_identified',
      category: 'user',
      label: user.role || 'unknown',
      customParameters: {
        user_id: user.id,
        user_email: user.email,
        user_role: user.role,
      },
    });
  }

  trackSession(sessionData: Partial<UserSession>): void {
    if (!this.session) return;

    this.session = { ...this.session, ...sessionData };

    this.trackEvent({
      action: 'session_update',
      category: 'engagement',
      customParameters: sessionData,
    });
  }

  trackConversion(conversionId: string, value?: number): void {
    this.trackEvent({
      action: 'conversion',
      category: 'ecommerce',
      label: conversionId,
      value,
      customParameters: {
        conversion_id: conversionId,
        conversion_value: value,
      },
    });
  }

  trackError(error: Error, context?: Record<string, any>): void {
    this.trackEvent({
      action: 'error',
      category: 'error',
      label: error.message,
      customParameters: {
        error_name: error.name,
        error_stack: error.stack,
        ...context,
      },
    });
  }

  trackPerformance(metrics: Record<string, number>): void {
    this.trackEvent({
      action: 'performance',
      category: 'performance',
      customParameters: metrics,
    });
  }

  trackAccessibility(issue: { type: string; severity: string; element?: string }): void {
    this.trackEvent({
      action: 'accessibility_issue',
      category: 'accessibility',
      label: issue.type,
      customParameters: {
        severity: issue.severity,
        element: issue.element,
      },
    });
  }

  trackOffline(offlineData: { duration: number; actions: string[] }): void {
    this.trackEvent({
      action: 'offline_usage',
      category: 'offline',
      value: offlineData.duration,
      customParameters: {
        offline_actions: offlineData.actions,
        offline_duration: offlineData.duration,
      },
    });
  }

  getSessionData(): UserSession | null {
    return this.session;
  }

  reset(): void {
    this.session = null;
    this.user = null;
    this.initSession();
  }
}

// Implementación de fallback para desarrollo
class ConsoleAnalyticsTracker implements AnalyticsTracker {
  private session: UserSession | null = null;
  private user: AnalyticsUser | null = null;

  init(): void {
    this.session = {
      sessionId: `dev-${Date.now()}`,
      startTime: Date.now(),
      lastActivity: Date.now(),
      pageViews: 0,
      events: [],
      userAgent: 'development',
      referrer: '',
    };
    console.log('🔍 Analytics en modo desarrollo (consola)');
  }

  trackPageView(path: string, title?: string): void {
    console.log(`📄 Page View: ${path} - ${title}`);
    if (this.session) {
      this.session.pageViews++;
      this.session.lastActivity = Date.now();
    }
  }

  trackEvent(event: AnalyticsEvent): void {
    console.log(`📊 Event: ${event.category}/${event.action}`, event);
    if (this.session) {
      this.session.events.push(event);
      this.session.lastActivity = event.timestamp || Date.now();
    }
  }

  trackUser(user: AnalyticsUser): void {
    this.user = { ...this.user, ...user };
    console.log('👤 User tracked:', user);
  }

  trackSession(sessionData: Partial<UserSession>): void {
    if (this.session) {
      this.session = { ...this.session, ...sessionData };
    }
    console.log('🔄 Session updated:', sessionData);
  }

  trackConversion(conversionId: string, value?: number): void {
    console.log(`💰 Conversion: ${conversionId} - ${value}`);
  }

  trackError(error: Error, context?: Record<string, any>): void {
    console.log('❌ Error tracked:', error.message, context);
  }

  trackPerformance(metrics: Record<string, number>): void {
    console.log('⚡ Performance tracked:', metrics);
  }

  trackAccessibility(issue: { type: string; severity: string; element?: string }): void {
    console.log('♿ Accessibility issue:', issue);
  }

  trackOffline(offlineData: { duration: number; actions: string[] }): void {
    console.log('📱 Offline usage:', offlineData);
  }

  getSessionData(): UserSession | null {
    return this.session;
  }

  reset(): void {
    this.session = null;
    this.user = null;
    this.init();
  }
}

// Instancia global
let analyticsTracker: AnalyticsTracker;

// Inicializar analytics tracker
export async function initUserAnalytics(): Promise<void> {
  if (MONITORING_CONFIG.analytics.enabled && MONITORING_CONFIG.analytics.googleAnalytics.id) {
    analyticsTracker = new GoogleAnalyticsTracker();
  } else {
    analyticsTracker = new ConsoleAnalyticsTracker();
  }
  
  await analyticsTracker.init();
}

// Funciones de conveniencia
export function trackPageView(path: string, title?: string): void {
  if (analyticsTracker) {
    analyticsTracker.trackPageView(path, title);
  }
}

export function trackEvent(event: AnalyticsEvent): void {
  if (analyticsTracker) {
    analyticsTracker.trackEvent(event);
  }
}

export function trackUser(user: AnalyticsUser): void {
  if (analyticsTracker) {
    analyticsTracker.trackUser(user);
  }
}

export function trackConversion(conversionId: string, value?: number): void {
  if (analyticsTracker) {
    analyticsTracker.trackConversion(conversionId, value);
  }
}

export function trackError(error: Error, context?: Record<string, any>): void {
  if (analyticsTracker) {
    analyticsTracker.trackError(error, context);
  }
}

export function trackPerformance(metrics: Record<string, number>): void {
  if (analyticsTracker) {
    analyticsTracker.trackPerformance(metrics);
  }
}

export function trackAccessibility(issue: { type: string; severity: string; element?: string }): void {
  if (analyticsTracker) {
    analyticsTracker.trackAccessibility(issue);
  }
}

export function trackOffline(offlineData: { duration: number; actions: string[] }): void {
  if (analyticsTracker) {
    analyticsTracker.trackOffline(offlineData);
  }
}

export function getSessionData(): UserSession | null {
  if (analyticsTracker) {
    return analyticsTracker.getSessionData();
  }
  return null;
}

// Hook para React
export function useAnalytics() {
  const trackPageViewCallback = React.useCallback((path: string, title?: string) => {
    trackPageView(path, title);
  }, []);

  const trackEventCallback = React.useCallback((event: AnalyticsEvent) => {
    trackEvent(event);
  }, []);

  const trackUserCallback = React.useCallback((user: AnalyticsUser) => {
    trackUser(user);
  }, []);

  return {
    trackPageView: trackPageViewCallback,
    trackEvent: trackEventCallback,
    trackUser: trackUserCallback,
    trackConversion,
    trackError,
    trackPerformance,
    trackAccessibility,
    trackOffline,
    getSessionData,
  };
}
