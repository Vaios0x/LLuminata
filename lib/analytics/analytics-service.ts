/**
 * Servicio de Analytics para InclusiveAI Coach
 * Integra Google Analytics 4, métricas personalizadas y reportes
 */

import { PrismaClient } from '@prisma/client';
import { redisCache } from '../redis-cache';

const prisma = new PrismaClient();

// Interfaces para analytics
export interface AnalyticsEvent {
  id: string;
  userId?: string;
  sessionId: string;
  event: string;
  category: string;
  action: string;
  label?: string;
  value?: number;
  parameters: Record<string, any>;
  timestamp: Date;
  userAgent: string;
  ipAddress?: string;
  page: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

export interface UserMetrics {
  userId: string;
  totalSessions: number;
  totalPageViews: number;
  totalEvents: number;
  averageSessionDuration: number;
  lastActive: Date;
  firstSeen: Date;
  learningProgress: {
    lessonsCompleted: number;
    assessmentsPassed: number;
    achievementsEarned: number;
    totalPoints: number;
    currentLevel: number;
  };
  engagement: {
    dailyActive: boolean;
    weeklyActive: boolean;
    monthlyActive: boolean;
    streakDays: number;
  };
  accessibility: {
    screenReaderUsed: boolean;
    highContrastUsed: boolean;
    largeTextUsed: boolean;
    voiceNavigationUsed: boolean;
  };
  culturalContext: {
    language: string;
    culturalBackground: string;
    contentAdaptations: number;
  };
}

export interface ProgressReport {
  userId: string;
  period: 'daily' | 'weekly' | 'monthly';
  startDate: Date;
  endDate: Date;
  metrics: {
    lessonsCompleted: number;
    assessmentsTaken: number;
    assessmentsPassed: number;
    averageScore: number;
    timeSpent: number; // en minutos
    achievementsEarned: number;
    pointsEarned: number;
    levelProgress: number;
  };
  trends: {
    improvement: number; // porcentaje de mejora
    consistency: number; // días consecutivos activos
    engagement: number; // tiempo promedio por sesión
  };
  recommendations: string[];
}

export interface EngagementMetrics {
  totalUsers: number;
  activeUsers: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  sessionMetrics: {
    averageDuration: number;
    averagePageViews: number;
    bounceRate: number;
    retentionRate: number;
  };
  contentMetrics: {
    mostViewedLessons: Array<{ lessonId: string; views: number; title: string }>;
    mostEngagedContent: Array<{ contentId: string; engagement: number; type: string }>;
    completionRates: Record<string, number>;
  };
  userJourney: {
    entryPoints: Array<{ page: string; count: number }>;
    exitPoints: Array<{ page: string; count: number }>;
    conversionFunnels: Record<string, number>;
  };
}

export interface AdminDashboard {
  overview: {
    totalUsers: number;
    activeUsers: number;
    totalLessons: number;
    totalAssessments: number;
    systemHealth: 'excellent' | 'good' | 'warning' | 'critical';
  };
  performance: {
    averageResponseTime: number;
    errorRate: number;
    uptime: number;
    memoryUsage: number;
    cpuUsage: number;
  };
  userGrowth: {
    newUsers: number;
    returningUsers: number;
    churnRate: number;
    growthRate: number;
  };
  contentPerformance: {
    popularLessons: Array<{ id: string; title: string; views: number; completionRate: number }>;
    difficultContent: Array<{ id: string; title: string; failureRate: number; avgTime: number }>;
    userFeedback: Array<{ contentId: string; rating: number; comments: number }>;
  };
  accessibility: {
    screenReaderUsage: number;
    highContrastUsage: number;
    voiceNavigationUsage: number;
    accessibilityIssues: number;
  };
}

/**
 * Servicio principal de Analytics
 */
export class AnalyticsService {
  private gtag: any;
  private isInitialized = false;

  constructor() {
    this.initializeGoogleAnalytics();
  }

  /**
   * Inicializa Google Analytics 4
   */
  private initializeGoogleAnalytics(): void {
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_GA_ID) {
      // Cargar gtag dinámicamente
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`;
      document.head.appendChild(script);

      window.dataLayer = window.dataLayer || [];
      this.gtag = function(...args: any[]) {
        window.dataLayer.push(args);
      };

      this.gtag('js', new Date());
      this.gtag('config', process.env.NEXT_PUBLIC_GA_ID, {
        anonymize_ip: true,
        send_page_view: false, // Controlamos manualmente
        debug_mode: process.env.NODE_ENV === 'development',
        custom_map: {
          'custom_parameter_1': 'learning_style',
          'custom_parameter_2': 'accessibility_needs',
          'custom_parameter_3': 'cultural_context',
        }
      });

      this.isInitialized = true;
      console.log('✅ Google Analytics 4 inicializado');
    }
  }

  /**
   * Registra un evento de analytics
   */
  async trackEvent(event: Omit<AnalyticsEvent, 'id' | 'timestamp'>): Promise<void> {
    const analyticsEvent: AnalyticsEvent = {
      ...event,
      id: this.generateId(),
      timestamp: new Date(),
    };

    try {
      // Guardar en base de datos
      await this.saveEventToDatabase(analyticsEvent);

      // Enviar a Google Analytics
      if (this.isInitialized && this.gtag) {
        this.gtag('event', event.action, {
          event_category: event.category,
          event_label: event.label,
          value: event.value,
          custom_parameter_1: event.parameters.learningStyle,
          custom_parameter_2: event.parameters.accessibilityNeeds,
          custom_parameter_3: event.parameters.culturalContext,
          ...event.parameters,
        });
      }

      // Cachear para reportes en tiempo real
      await this.cacheEvent(analyticsEvent);

    } catch (error) {
      console.error('Error tracking event:', error);
    }
  }

  /**
   * Registra vista de página
   */
  async trackPageView(
    path: string,
    title: string,
    userId?: string,
    sessionId?: string
  ): Promise<void> {
    const event = {
      userId,
      sessionId: sessionId || this.generateSessionId(),
      event: 'page_view',
      category: 'navigation',
      action: 'page_view',
      label: path,
      value: 1,
      parameters: {
        page_title: title,
        page_path: path,
        page_location: typeof window !== 'undefined' ? window.location.href : '',
      },
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : '',
      page: path,
      referrer: typeof window !== 'undefined' ? document.referrer : '',
      utmSource: this.getUrlParameter('utm_source'),
      utmMedium: this.getUrlParameter('utm_medium'),
      utmCampaign: this.getUrlParameter('utm_campaign'),
    };

    await this.trackEvent(event);

    // Enviar pageview a GA4
    if (this.isInitialized && this.gtag) {
      this.gtag('event', 'page_view', {
        page_title: title,
        page_location: typeof window !== 'undefined' ? window.location.href : '',
        page_path: path,
      });
    }
  }

  /**
   * Registra evento de aprendizaje
   */
  async trackLearningEvent(
    eventType: 'lesson_start' | 'lesson_complete' | 'assessment_start' | 'assessment_complete' | 'achievement_earned',
    data: {
      userId: string;
      lessonId?: string;
      assessmentId?: string;
      achievementId?: string;
      score?: number;
      timeSpent?: number;
      difficulty?: number;
    }
  ): Promise<void> {
    const event = {
      userId: data.userId,
      sessionId: this.generateSessionId(),
      event: eventType,
      category: 'learning',
      action: eventType,
      label: data.lessonId || data.assessmentId || data.achievementId,
      value: data.score || data.timeSpent || 1,
      parameters: {
        lessonId: data.lessonId,
        assessmentId: data.assessmentId,
        achievementId: data.achievementId,
        score: data.score,
        timeSpent: data.timeSpent,
        difficulty: data.difficulty,
      },
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : '',
      page: typeof window !== 'undefined' ? window.location.pathname : '',
    };

    await this.trackEvent(event);
  }

  /**
   * Registra evento de accesibilidad
   */
  async trackAccessibilityEvent(
    eventType: 'screen_reader_used' | 'high_contrast_enabled' | 'large_text_enabled' | 'voice_navigation_used',
    userId: string
  ): Promise<void> {
    const event = {
      userId,
      sessionId: this.generateSessionId(),
      event: eventType,
      category: 'accessibility',
      action: eventType,
      label: eventType,
      value: 1,
      parameters: {
        accessibilityFeature: eventType,
        timestamp: new Date().toISOString(),
      },
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : '',
      page: typeof window !== 'undefined' ? window.location.pathname : '',
    };

    await this.trackEvent(event);
  }

  /**
   * Obtiene métricas de usuario
   */
  async getUserMetrics(userId: string): Promise<UserMetrics> {
    const cacheKey = `user_metrics:${userId}`;
    
    // Intentar obtener del caché
    const cached = await redisCache.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // Calcular métricas desde la base de datos
    const [
      sessions,
      events,
      lessons,
      assessments,
      achievements,
      userLevel
    ] = await Promise.all([
      prisma.gamificationEvent.findMany({
        where: { userId },
        select: { createdAt: true, type: true }
      }),
      prisma.gamificationEvent.findMany({
        where: { userId },
        select: { createdAt: true, type: true, points: true }
      }),
      prisma.completedLesson.count({ where: { studentId: userId } }),
      prisma.assessment.count({ where: { studentId: userId } }),
      prisma.achievement.count({ where: { studentId: userId } }),
      prisma.userLevel.findUnique({ where: { userId } })
    ]);

    const metrics: UserMetrics = {
      userId,
      totalSessions: this.calculateSessions(sessions),
      totalPageViews: events.filter(e => e.type === 'PAGE_VIEW').length,
      totalEvents: events.length,
      averageSessionDuration: this.calculateAverageSessionDuration(sessions),
      lastActive: this.getLastActive(sessions),
      firstSeen: this.getFirstSeen(sessions),
      learningProgress: {
        lessonsCompleted: lessons,
        assessmentsPassed: assessments,
        achievementsEarned: achievements,
        totalPoints: userLevel?.points || 0,
        currentLevel: userLevel?.level || 1,
      },
      engagement: {
        dailyActive: this.isDailyActive(sessions),
        weeklyActive: this.isWeeklyActive(sessions),
        monthlyActive: this.isMonthlyActive(sessions),
        streakDays: this.calculateStreakDays(sessions),
      },
      accessibility: {
        screenReaderUsed: events.some(e => e.type === 'SCREEN_READER_USED'),
        highContrastUsed: events.some(e => e.type === 'HIGH_CONTRAST_ENABLED'),
        largeTextUsed: events.some(e => e.type === 'LARGE_TEXT_ENABLED'),
        voiceNavigationUsed: events.some(e => e.type === 'VOICE_NAVIGATION_USED'),
      },
      culturalContext: {
        language: 'es-MX', // Obtener del perfil del usuario
        culturalBackground: 'general',
        contentAdaptations: events.filter(e => e.type === 'CONTENT_ADAPTATION').length,
      },
    };

    // Guardar en caché por 1 hora
    await redisCache.set(cacheKey, JSON.stringify(metrics), { ttl: 3600 });
    
    return metrics;
  }

  /**
   * Genera reporte de progreso
   */
  async generateProgressReport(
    userId: string,
    period: 'daily' | 'weekly' | 'monthly'
  ): Promise<ProgressReport> {
    const endDate = new Date();
    const startDate = this.getStartDate(period);

    const events = await prisma.gamificationEvent.findMany({
      where: {
        userId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const metrics = {
      lessonsCompleted: events.filter(e => e.type === 'LESSON_COMPLETED').length,
      assessmentsTaken: events.filter(e => e.type === 'ASSESSMENT_STARTED').length,
      assessmentsPassed: events.filter(e => e.type === 'ASSESSMENT_PASSED').length,
      averageScore: this.calculateAverageScore(events),
      timeSpent: this.calculateTimeSpent(events),
      achievementsEarned: events.filter(e => e.type === 'ACHIEVEMENT_EARNED').length,
      pointsEarned: events.reduce((sum, e) => sum + (e.points || 0), 0),
      levelProgress: this.calculateLevelProgress(events),
    };

    const trends = {
      improvement: this.calculateImprovement(userId, period),
      consistency: this.calculateConsistency(events),
      engagement: this.calculateEngagement(events),
    };

    const recommendations = this.generateRecommendations(metrics, trends);

    return {
      userId,
      period,
      startDate,
      endDate,
      metrics,
      trends,
      recommendations,
    };
  }

  /**
   * Obtiene métricas de engagement
   */
  async getEngagementMetrics(): Promise<EngagementMetrics> {
    const cacheKey = 'engagement_metrics';
    
    // Intentar obtener del caché
    const cached = await redisCache.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // Calcular métricas desde la base de datos
    const [
      totalUsers,
      activeUsers,
      sessionMetrics,
      contentMetrics,
      userJourney
    ] = await Promise.all([
      this.getTotalUsers(),
      this.getActiveUsers(),
      this.getSessionMetrics(),
      this.getContentMetrics(),
      this.getUserJourney(),
    ]);

    const metrics: EngagementMetrics = {
      totalUsers,
      activeUsers,
      sessionMetrics,
      contentMetrics,
      userJourney,
    };

    // Guardar en caché por 30 minutos
    await redisCache.set(cacheKey, JSON.stringify(metrics), { ttl: 1800 });
    
    return metrics;
  }

  /**
   * Obtiene dashboard de administración
   */
  async getAdminDashboard(): Promise<AdminDashboard> {
    const cacheKey = 'admin_dashboard';
    
    // Intentar obtener del caché
    const cached = await redisCache.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const [
      overview,
      performance,
      userGrowth,
      contentPerformance,
      accessibility
    ] = await Promise.all([
      this.getOverviewMetrics(),
      this.getPerformanceMetrics(),
      this.getUserGrowthMetrics(),
      this.getContentPerformanceMetrics(),
      this.getAccessibilityMetrics(),
    ]);

    const dashboard: AdminDashboard = {
      overview,
      performance,
      userGrowth,
      contentPerformance,
      accessibility,
    };

    // Guardar en caché por 15 minutos
    await redisCache.set(cacheKey, JSON.stringify(dashboard), { ttl: 900 });
    
    return dashboard;
  }

  // ===== MÉTODOS PRIVADOS =====

  private generateId(): string {
    return `analytics_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getUrlParameter(name: string): string | undefined {
    if (typeof window === 'undefined') return undefined;
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name) || undefined;
  }

  private async saveEventToDatabase(event: AnalyticsEvent): Promise<void> {
    // Guardar en la tabla de eventos de analytics
    await prisma.gamificationEvent.create({
      data: {
        userId: event.userId || 'anonymous',
        type: event.event as any,
        points: event.value || 0,
        metadata: {
          ...event.parameters,
          sessionId: event.sessionId,
          category: event.category,
          action: event.action,
          label: event.label,
          userAgent: event.userAgent,
          page: event.page,
          referrer: event.referrer,
          utmSource: event.utmSource,
          utmMedium: event.utmMedium,
          utmCampaign: event.utmCampaign,
        },
      },
    });
  }

  private async cacheEvent(event: AnalyticsEvent): Promise<void> {
    const cacheKey = `recent_events:${event.userId || 'anonymous'}`;
    const recentEvents = await redisCache.get(cacheKey) || '[]';
    const events = JSON.parse(recentEvents);
    
    events.unshift(event);
    
    // Mantener solo los últimos 100 eventos
    if (events.length > 100) {
      events.splice(100);
    }
    
    await redisCache.set(cacheKey, JSON.stringify(events), { ttl: 3600 });
  }

  // Métodos de cálculo de métricas
  private calculateSessions(events: any[]): number {
    const sessionIds = new Set();
    events.forEach(event => {
      if (event.metadata?.sessionId) {
        sessionIds.add(event.metadata.sessionId);
      }
    });
    return sessionIds.size;
  }

  private calculateAverageSessionDuration(events: any[]): number {
    // Implementar cálculo de duración promedio de sesión
    return 0;
  }

  private getLastActive(events: any[]): Date {
    if (events.length === 0) return new Date();
    return new Date(Math.max(...events.map(e => new Date(e.createdAt).getTime())));
  }

  private getFirstSeen(events: any[]): Date {
    if (events.length === 0) return new Date();
    return new Date(Math.min(...events.map(e => new Date(e.createdAt).getTime())));
  }

  private isDailyActive(events: any[]): boolean {
    const today = new Date().toDateString();
    return events.some(e => new Date(e.createdAt).toDateString() === today);
  }

  private isWeeklyActive(events: any[]): boolean {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return events.some(e => new Date(e.createdAt) >= weekAgo);
  }

  private isMonthlyActive(events: any[]): boolean {
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    return events.some(e => new Date(e.createdAt) >= monthAgo);
  }

  private calculateStreakDays(events: any[]): number {
    // Implementar cálculo de racha de días
    return 0;
  }

  private getStartDate(period: 'daily' | 'weekly' | 'monthly'): Date {
    const date = new Date();
    switch (period) {
      case 'daily':
        date.setDate(date.getDate() - 1);
        break;
      case 'weekly':
        date.setDate(date.getDate() - 7);
        break;
      case 'monthly':
        date.setMonth(date.getMonth() - 1);
        break;
    }
    return date;
  }

  private calculateAverageScore(events: any[]): number {
    const scores = events
      .filter(e => e.metadata?.score)
      .map(e => e.metadata.score);
    
    if (scores.length === 0) return 0;
    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  }

  private calculateTimeSpent(events: any[]): number {
    return events
      .filter(e => e.metadata?.timeSpent)
      .reduce((sum, e) => sum + e.metadata.timeSpent, 0);
  }

  private calculateLevelProgress(events: any[]): number {
    // Implementar cálculo de progreso de nivel
    return 0;
  }

  private calculateImprovement(userId: string, period: string): number {
    // Implementar cálculo de mejora
    return 0;
  }

  private calculateConsistency(events: any[]): number {
    // Implementar cálculo de consistencia
    return 0;
  }

  private calculateEngagement(events: any[]): number {
    // Implementar cálculo de engagement
    return 0;
  }

  private generateRecommendations(metrics: any, trends: any): string[] {
    const recommendations: string[] = [];
    
    if (metrics.lessonsCompleted < 5) {
      recommendations.push('Completa más lecciones para mejorar tu progreso');
    }
    
    if (metrics.averageScore < 70) {
      recommendations.push('Revisa las lecciones anteriores para mejorar tu comprensión');
    }
    
    if (trends.consistency < 3) {
      recommendations.push('Mantén una rutina de estudio más consistente');
    }
    
    return recommendations;
  }

  // Métodos para métricas agregadas
  private async getTotalUsers(): Promise<number> {
    return await prisma.student.count();
  }

  private async getActiveUsers(): Promise<{ daily: number; weekly: number; monthly: number }> {
    // Implementar cálculo de usuarios activos
    return { daily: 0, weekly: 0, monthly: 0 };
  }

  private async getSessionMetrics(): Promise<any> {
    // Implementar métricas de sesión
    return {
      averageDuration: 0,
      averagePageViews: 0,
      bounceRate: 0,
      retentionRate: 0,
    };
  }

  private async getContentMetrics(): Promise<any> {
    // Implementar métricas de contenido
    return {
      mostViewedLessons: [],
      mostEngagedContent: [],
      completionRates: {},
    };
  }

  private async getUserJourney(): Promise<any> {
    // Implementar análisis de journey del usuario
    return {
      entryPoints: [],
      exitPoints: [],
      conversionFunnels: {},
    };
  }

  private async getOverviewMetrics(): Promise<any> {
    // Implementar métricas de overview
    return {
      totalUsers: 0,
      activeUsers: 0,
      totalLessons: 0,
      totalAssessments: 0,
      systemHealth: 'good' as const,
    };
  }

  private async getPerformanceMetrics(): Promise<any> {
    // Implementar métricas de rendimiento
    return {
      averageResponseTime: 0,
      errorRate: 0,
      uptime: 0,
      memoryUsage: 0,
      cpuUsage: 0,
    };
  }

  private async getUserGrowthMetrics(): Promise<any> {
    // Implementar métricas de crecimiento
    return {
      newUsers: 0,
      returningUsers: 0,
      churnRate: 0,
      growthRate: 0,
    };
  }

  private async getContentPerformanceMetrics(): Promise<any> {
    // Implementar métricas de rendimiento de contenido
    return {
      popularLessons: [],
      difficultContent: [],
      userFeedback: [],
    };
  }

  private async getAccessibilityMetrics(): Promise<any> {
    // Implementar métricas de accesibilidad
    return {
      screenReaderUsage: 0,
      highContrastUsage: 0,
      voiceNavigationUsage: 0,
      accessibilityIssues: 0,
    };
  }
}

// Instancia singleton
export const analyticsService = new AnalyticsService();

// Funciones de conveniencia
export const trackEvent = (event: Omit<AnalyticsEvent, 'id' | 'timestamp'>) => 
  analyticsService.trackEvent(event);

export const trackPageView = (path: string, title: string, userId?: string, sessionId?: string) =>
  analyticsService.trackPageView(path, title, userId, sessionId);

export const trackLearningEvent = (
  eventType: 'lesson_start' | 'lesson_complete' | 'assessment_start' | 'assessment_complete' | 'achievement_earned',
  data: any
) => analyticsService.trackLearningEvent(eventType, data);

export const trackAccessibilityEvent = (
  eventType: 'screen_reader_used' | 'high_contrast_enabled' | 'large_text_enabled' | 'voice_navigation_used',
  userId: string
) => analyticsService.trackAccessibilityEvent(eventType, userId);

export default analyticsService;
