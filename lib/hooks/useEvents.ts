/**
 * Hook para manejo de eventos de gamificación
 * Proporciona funcionalidades para participar en eventos, recibir notificaciones y gestionar recompensas
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { GamificationService } from '../gamification-service';

// Interfaces
interface GamificationEvent {
  id: string;
  name: string;
  description: string;
  type: 'LESSON_COMPLETED' | 'ASSESSMENT_PASSED' | 'BADGE_EARNED' | 'ACHIEVEMENT_UNLOCKED' | 
        'LEVEL_UP' | 'COMPETITION_WON' | 'CULTURAL_ACTIVITY' | 'SOCIAL_INTERACTION' | 
        'HELP_OTHERS' | 'PERFECT_SCORE' | 'STREAK_MAINTAINED' | 'FIRST_TIME_ACTIVITY';
  category: 'ACADEMIC' | 'CULTURAL' | 'SOCIAL' | 'TECHNICAL' | 'CREATIVITY' | 'PERSISTENCE';
  points: number;
  metadata: {
    lessonId?: string;
    assessmentId?: string;
    badgeId?: string;
    achievementId?: string;
    level?: number;
    competitionId?: string;
    culturalActivity?: string;
    socialInteraction?: string;
    streakDays?: number;
    [key: string]: any;
  };
  timestamp: Date;
  isRead: boolean;
  isClaimed: boolean;
}

interface EventNotification {
  id: string;
  eventId: string;
  userId: string;
  title: string;
  message: string;
  type: 'SUCCESS' | 'INFO' | 'WARNING' | 'ERROR';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  isRead: boolean;
  createdAt: Date;
  expiresAt?: Date;
}

interface EventReward {
  id: string;
  eventId: string;
  type: 'POINTS' | 'BADGE' | 'ACHIEVEMENT' | 'TITLE' | 'FEATURE_UNLOCK' | 'CUSTOM';
  value: number | string;
  description: string;
  isClaimed: boolean;
  claimedAt?: Date;
}

interface EventStats {
  totalEvents: number;
  totalPoints: number;
  eventsByCategory: Record<string, number>;
  eventsByType: Record<string, number>;
  recentEvents: GamificationEvent[];
  unreadCount: number;
  unclaimedRewards: number;
}

interface UseEventsReturn {
  // Estado
  events: GamificationEvent[];
  notifications: EventNotification[];
  rewards: EventReward[];
  stats: EventStats;
  loading: boolean;
  error: string | null;
  
  // Acciones de eventos
  createEvent: (eventData: Partial<GamificationEvent>) => Promise<GamificationEvent>;
  markEventAsRead: (eventId: string) => Promise<void>;
  markAllEventsAsRead: () => Promise<void>;
  deleteEvent: (eventId: string) => Promise<void>;
  
  // Acciones de notificaciones
  markNotificationAsRead: (notificationId: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  
  // Acciones de recompensas
  claimReward: (rewardId: string) => Promise<void>;
  claimAllRewards: () => Promise<void>;
  
  // Utilidades
  getEventsByType: (type: GamificationEvent['type']) => GamificationEvent[];
  getEventsByCategory: (category: GamificationEvent['category']) => GamificationEvent[];
  getRecentEvents: (limit?: number) => GamificationEvent[];
  getUnreadEvents: () => GamificationEvent[];
  getUnclaimedRewards: () => EventReward[];
  getEventStats: () => EventStats;
  hasUnreadNotifications: () => boolean;
  getNotificationCount: () => number;
}

export const useEvents = (): UseEventsReturn => {
  const { user } = useAuth();
  const [events, setEvents] = useState<GamificationEvent[]>([]);
  const [notifications, setNotifications] = useState<EventNotification[]>([]);
  const [rewards, setRewards] = useState<EventReward[]>([]);
  const [stats, setStats] = useState<EventStats>({
    totalEvents: 0,
    totalPoints: 0,
    eventsByCategory: {},
    eventsByType: {},
    recentEvents: [],
    unreadCount: 0,
    unclaimedRewards: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const gamificationService = new GamificationService();

  // Cargar eventos del usuario
  const loadUserEvents = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const [userEvents, userNotifications, userRewards] = await Promise.all([
        gamificationService.getUserEvents(user.id),
        gamificationService.getUserNotifications(user.id),
        gamificationService.getUserRewards(user.id)
      ]);
      
      setEvents(userEvents);
      setNotifications(userNotifications);
      setRewards(userRewards);
      
      // Calcular estadísticas
      const eventStats = calculateEventStats(userEvents, userNotifications, userRewards);
      setStats(eventStats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar eventos');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Calcular estadísticas de eventos
  const calculateEventStats = useCallback((
    userEvents: GamificationEvent[], 
    userNotifications: EventNotification[], 
    userRewards: EventReward[]
  ): EventStats => {
    const totalEvents = userEvents.length;
    const totalPoints = userEvents.reduce((sum, event) => sum + event.points, 0);
    
    const eventsByCategory = userEvents.reduce((acc, event) => {
      acc[event.category] = (acc[event.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const eventsByType = userEvents.reduce((acc, event) => {
      acc[event.type] = (acc[event.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const recentEvents = userEvents
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10);
    
    const unreadCount = userEvents.filter(event => !event.isRead).length;
    const unclaimedRewards = userRewards.filter(reward => !reward.isClaimed).length;
    
    return {
      totalEvents,
      totalPoints,
      eventsByCategory,
      eventsByType,
      recentEvents,
      unreadCount,
      unclaimedRewards
    };
  }, []);

  // Crear evento
  const createEvent = useCallback(async (eventData: Partial<GamificationEvent>): Promise<GamificationEvent> => {
    if (!user?.id) throw new Error('Usuario no autenticado');
    
    try {
      setError(null);
      const newEvent = await gamificationService.createGamificationEvent(user.id, eventData);
      
      // Actualizar estado local
      setEvents(prev => [newEvent, ...prev]);
      
      // Recalcular estadísticas
      const updatedStats = calculateEventStats([newEvent, ...events], notifications, rewards);
      setStats(updatedStats);
      
      return newEvent;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear evento');
      throw err;
    }
  }, [user?.id, events, notifications, rewards, calculateEventStats]);

  // Marcar evento como leído
  const markEventAsRead = useCallback(async (eventId: string): Promise<void> => {
    if (!user?.id) throw new Error('Usuario no autenticado');
    
    try {
      setError(null);
      await gamificationService.markEventAsRead(user.id, eventId);
      
      // Actualizar estado local
      setEvents(prev => prev.map(event => 
        event.id === eventId ? { ...event, isRead: true } : event
      ));
      
      // Recalcular estadísticas
      const updatedEvents = events.map(event => 
        event.id === eventId ? { ...event, isRead: true } : event
      );
      const updatedStats = calculateEventStats(updatedEvents, notifications, rewards);
      setStats(updatedStats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al marcar evento como leído');
      throw err;
    }
  }, [user?.id, events, notifications, rewards, calculateEventStats]);

  // Marcar todos los eventos como leídos
  const markAllEventsAsRead = useCallback(async (): Promise<void> => {
    if (!user?.id) throw new Error('Usuario no autenticado');
    
    try {
      setError(null);
      await gamificationService.markAllEventsAsRead(user.id);
      
      // Actualizar estado local
      setEvents(prev => prev.map(event => ({ ...event, isRead: true })));
      
      // Recalcular estadísticas
      const updatedEvents = events.map(event => ({ ...event, isRead: true }));
      const updatedStats = calculateEventStats(updatedEvents, notifications, rewards);
      setStats(updatedStats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al marcar eventos como leídos');
      throw err;
    }
  }, [user?.id, events, notifications, rewards, calculateEventStats]);

  // Eliminar evento
  const deleteEvent = useCallback(async (eventId: string): Promise<void> => {
    if (!user?.id) throw new Error('Usuario no autenticado');
    
    try {
      setError(null);
      await gamificationService.deleteEvent(user.id, eventId);
      
      // Actualizar estado local
      setEvents(prev => prev.filter(event => event.id !== eventId));
      
      // Recalcular estadísticas
      const updatedEvents = events.filter(event => event.id !== eventId);
      const updatedStats = calculateEventStats(updatedEvents, notifications, rewards);
      setStats(updatedStats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar evento');
      throw err;
    }
  }, [user?.id, events, notifications, rewards, calculateEventStats]);

  // Marcar notificación como leída
  const markNotificationAsRead = useCallback(async (notificationId: string): Promise<void> => {
    if (!user?.id) throw new Error('Usuario no autenticado');
    
    try {
      setError(null);
      await gamificationService.markNotificationAsRead(user.id, notificationId);
      
      // Actualizar estado local
      setNotifications(prev => prev.map(notification => 
        notification.id === notificationId ? { ...notification, isRead: true } : notification
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al marcar notificación como leída');
      throw err;
    }
  }, [user?.id]);

  // Marcar todas las notificaciones como leídas
  const markAllNotificationsAsRead = useCallback(async (): Promise<void> => {
    if (!user?.id) throw new Error('Usuario no autenticado');
    
    try {
      setError(null);
      await gamificationService.markAllNotificationsAsRead(user.id);
      
      // Actualizar estado local
      setNotifications(prev => prev.map(notification => ({ ...notification, isRead: true })));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al marcar notificaciones como leídas');
      throw err;
    }
  }, [user?.id]);

  // Eliminar notificación
  const deleteNotification = useCallback(async (notificationId: string): Promise<void> => {
    if (!user?.id) throw new Error('Usuario no autenticado');
    
    try {
      setError(null);
      await gamificationService.deleteNotification(user.id, notificationId);
      
      // Actualizar estado local
      setNotifications(prev => prev.filter(notification => notification.id !== notificationId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar notificación');
      throw err;
    }
  }, [user?.id]);

  // Reclamar recompensa
  const claimReward = useCallback(async (rewardId: string): Promise<void> => {
    if (!user?.id) throw new Error('Usuario no autenticado');
    
    try {
      setError(null);
      await gamificationService.claimReward(user.id, rewardId);
      
      // Actualizar estado local
      setRewards(prev => prev.map(reward => 
        reward.id === rewardId ? { ...reward, isClaimed: true, claimedAt: new Date() } : reward
      ));
      
      // Recalcular estadísticas
      const updatedRewards = rewards.map(reward => 
        reward.id === rewardId ? { ...reward, isClaimed: true, claimedAt: new Date() } : reward
      );
      const updatedStats = calculateEventStats(events, notifications, updatedRewards);
      setStats(updatedStats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al reclamar recompensa');
      throw err;
    }
  }, [user?.id, rewards, events, notifications, calculateEventStats]);

  // Reclamar todas las recompensas
  const claimAllRewards = useCallback(async (): Promise<void> => {
    if (!user?.id) throw new Error('Usuario no autenticado');
    
    try {
      setError(null);
      await gamificationService.claimAllRewards(user.id);
      
      // Actualizar estado local
      const now = new Date();
      setRewards(prev => prev.map(reward => ({ ...reward, isClaimed: true, claimedAt: now })));
      
      // Recalcular estadísticas
      const updatedRewards = rewards.map(reward => ({ ...reward, isClaimed: true, claimedAt: now }));
      const updatedStats = calculateEventStats(events, notifications, updatedRewards);
      setStats(updatedStats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al reclamar recompensas');
      throw err;
    }
  }, [user?.id, rewards, events, notifications, calculateEventStats]);

  // Utilidades
  const getEventsByType = useCallback((type: GamificationEvent['type']): GamificationEvent[] => {
    return events.filter(event => event.type === type);
  }, [events]);

  const getEventsByCategory = useCallback((category: GamificationEvent['category']): GamificationEvent[] => {
    return events.filter(event => event.category === category);
  }, [events]);

  const getRecentEvents = useCallback((limit: number = 10): GamificationEvent[] => {
    return events
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }, [events]);

  const getUnreadEvents = useCallback((): GamificationEvent[] => {
    return events.filter(event => !event.isRead);
  }, [events]);

  const getUnclaimedRewards = useCallback((): EventReward[] => {
    return rewards.filter(reward => !reward.isClaimed);
  }, [rewards]);

  const getEventStats = useCallback((): EventStats => {
    return stats;
  }, [stats]);

  const hasUnreadNotifications = useCallback((): boolean => {
    return notifications.some(notification => !notification.isRead);
  }, [notifications]);

  const getNotificationCount = useCallback((): number => {
    return notifications.filter(notification => !notification.isRead).length;
  }, [notifications]);

  // Efectos
  useEffect(() => {
    loadUserEvents();
  }, [loadUserEvents]);

  // Actualizar automáticamente cada 30 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      loadUserEvents();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [loadUserEvents]);

  return {
    events,
    notifications,
    rewards,
    stats,
    loading,
    error,
    createEvent,
    markEventAsRead,
    markAllEventsAsRead,
    deleteEvent,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    claimReward,
    claimAllRewards,
    getEventsByType,
    getEventsByCategory,
    getRecentEvents,
    getUnreadEvents,
    getUnclaimedRewards,
    getEventStats,
    hasUnreadNotifications,
    getNotificationCount
  };
};
