/**
 * Hook para manejo de mapas de calor (heatmaps)
 * Proporciona funcionalidades para tracking de interacciones y visualización de datos
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './useAuth';
import { AnalyticsService } from '../analytics/analytics-service';

// Interfaces
interface HeatmapData {
  id: string;
  page: string;
  element: string;
  x: number;
  y: number;
  clicks: number;
  hovers: number;
  scrollDepth: number;
  timeSpent: number;
  timestamp: Date;
  sessionId: string;
  userId?: string;
}

interface HeatmapConfig {
  id: string;
  name: string;
  description: string;
  page: string;
  type: 'CLICKS' | 'HOVERS' | 'SCROLL' | 'ATTENTION' | 'COMBINED';
  colorScheme: 'RED' | 'BLUE' | 'GREEN' | 'PURPLE' | 'CUSTOM';
  intensity: number; // 0-100
  radius: number; // Radio del punto en píxeles
  opacity: number; // 0-1
  isActive: boolean;
  filters: {
    dateRange: {
      start: Date;
      end: Date;
    };
    userTypes: string[];
    devices: string[];
    sessions: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

interface HeatmapSession {
  id: string;
  sessionId: string;
  userId?: string;
  page: string;
  startTime: Date;
  endTime: Date;
  duration: number; // En segundos
  interactions: HeatmapData[];
  deviceInfo: {
    type: string;
    screenSize: string;
    userAgent: string;
  };
}

interface HeatmapStats {
  totalInteractions: number;
  uniqueUsers: number;
  averageSessionDuration: number;
  mostClickedElements: Array<{
    element: string;
    clicks: number;
    percentage: number;
  }>;
  engagementByTime: Record<string, number>;
  deviceBreakdown: Record<string, number>;
  conversionRates: Record<string, number>;
}

interface UseHeatmapReturn {
  // Estado
  heatmapData: HeatmapData[];
  heatmapConfigs: HeatmapConfig[];
  activeSessions: HeatmapSession[];
  stats: HeatmapStats;
  currentConfig: HeatmapConfig | null;
  loading: boolean;
  error: string | null;
  
  // Acciones de configuración
  createHeatmapConfig: (config: Partial<HeatmapConfig>) => Promise<HeatmapConfig>;
  updateHeatmapConfig: (configId: string, updates: Partial<HeatmapConfig>) => Promise<void>;
  deleteHeatmapConfig: (configId: string) => Promise<void>;
  activateHeatmapConfig: (configId: string) => Promise<void>;
  
  // Acciones de tracking
  startTracking: (configId: string) => void;
  stopTracking: () => void;
  recordInteraction: (interaction: Partial<HeatmapData>) => Promise<void>;
  recordClick: (element: string, x: number, y: number) => Promise<void>;
  recordHover: (element: string, x: number, y: number) => Promise<void>;
  recordScroll: (depth: number) => Promise<void>;
  
  // Acciones de datos
  getHeatmapData: (configId: string, filters?: any) => Promise<HeatmapData[]>;
  exportHeatmapData: (configId: string, format: 'CSV' | 'JSON' | 'EXCEL') => Promise<string>;
  clearHeatmapData: (configId: string) => Promise<void>;
  
  // Utilidades
  getHeatmapForPage: (page: string) => HeatmapData[];
  getElementStats: (element: string) => any;
  getEngagementScore: () => number;
  getHotspots: () => Array<{ x: number; y: number; intensity: number }>;
  isTracking: () => boolean;
  getCurrentSession: () => HeatmapSession | null;
  getHeatmapStats: () => HeatmapStats;
}

export const useHeatmap = (): UseHeatmapReturn => {
  const { user } = useAuth();
  const [heatmapData, setHeatmapData] = useState<HeatmapData[]>([]);
  const [heatmapConfigs, setHeatmapConfigs] = useState<HeatmapConfig[]>([]);
  const [activeSessions, setActiveSessions] = useState<HeatmapSession[]>([]);
  const [stats, setStats] = useState<HeatmapStats>({
    totalInteractions: 0,
    uniqueUsers: 0,
    averageSessionDuration: 0,
    mostClickedElements: [],
    engagementByTime: {},
    deviceBreakdown: {},
    conversionRates: {}
  });
  const [currentConfig, setCurrentConfig] = useState<HeatmapConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [currentSession, setCurrentSession] = useState<HeatmapSession | null>(null);
  
  const trackingRef = useRef<NodeJS.Timeout | null>(null);
  const sessionStartTime = useRef<Date | null>(null);

  const analyticsService = new AnalyticsService();

  // Cargar configuraciones de heatmap
  const loadHeatmapConfigs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const configs = await analyticsService.getHeatmapConfigs();
      setHeatmapConfigs(configs);
      
      // Establecer configuración activa
      const activeConfig = configs.find(config => config.isActive);
      setCurrentConfig(activeConfig || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar configuraciones de heatmap');
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar datos de heatmap
  const loadHeatmapData = useCallback(async () => {
    if (!currentConfig) return;
    
    try {
      const data = await analyticsService.getHeatmapData(currentConfig.id);
      setHeatmapData(data);
      
      // Calcular estadísticas
      const heatmapStats = calculateHeatmapStats(data);
      setStats(heatmapStats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar datos de heatmap');
    }
  }, [currentConfig]);

  // Calcular estadísticas de heatmap
  const calculateHeatmapStats = useCallback((data: HeatmapData[]): HeatmapStats => {
    const totalInteractions = data.length;
    const uniqueUsers = new Set(data.filter(d => d.userId).map(d => d.userId)).size;
    
    // Calcular duración promedio de sesión
    const sessions = data.reduce((acc, item) => {
      if (!acc[item.sessionId]) {
        acc[item.sessionId] = [];
      }
      acc[item.sessionId].push(item);
      return acc;
    }, {} as Record<string, HeatmapData[]>);
    
    const averageSessionDuration = Object.values(sessions).reduce((sum, sessionData) => {
      const sessionTime = sessionData.reduce((total, item) => total + item.timeSpent, 0);
      return sum + sessionTime;
    }, 0) / Object.keys(sessions).length;
    
    // Elementos más clickeados
    const elementClicks = data.reduce((acc, item) => {
      acc[item.element] = (acc[item.element] || 0) + item.clicks;
      return acc;
    }, {} as Record<string, number>);
    
    const mostClickedElements = Object.entries(elementClicks)
      .map(([element, clicks]) => ({
        element,
        clicks,
        percentage: (clicks / totalInteractions) * 100
      }))
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 10);
    
    // Engagement por tiempo
    const engagementByTime = data.reduce((acc, item) => {
      const hour = new Date(item.timestamp).getHours();
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Breakdown por dispositivo (simulado)
    const deviceBreakdown = {
      desktop: Math.floor(Math.random() * 60) + 30,
      mobile: Math.floor(Math.random() * 40) + 20,
      tablet: Math.floor(Math.random() * 20) + 10
    };
    
    // Tasas de conversión (simulado)
    const conversionRates = {
      clicks_to_engagement: Math.floor(Math.random() * 30) + 20,
      hovers_to_clicks: Math.floor(Math.random() * 40) + 30,
      scroll_to_action: Math.floor(Math.random() * 25) + 15
    };
    
    return {
      totalInteractions,
      uniqueUsers,
      averageSessionDuration,
      mostClickedElements,
      engagementByTime,
      deviceBreakdown,
      conversionRates
    };
  }, []);

  // Crear configuración de heatmap
  const createHeatmapConfig = useCallback(async (config: Partial<HeatmapConfig>): Promise<HeatmapConfig> => {
    if (!user?.id) throw new Error('Usuario no autenticado');
    
    try {
      setError(null);
      const newConfig = await analyticsService.createHeatmapConfig(user.id, config);
      
      setHeatmapConfigs(prev => [...prev, newConfig]);
      return newConfig;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear configuración de heatmap');
      throw err;
    }
  }, [user?.id]);

  // Actualizar configuración de heatmap
  const updateHeatmapConfig = useCallback(async (configId: string, updates: Partial<HeatmapConfig>): Promise<void> => {
    if (!user?.id) throw new Error('Usuario no autenticado');
    
    try {
      setError(null);
      await analyticsService.updateHeatmapConfig(configId, updates);
      
      setHeatmapConfigs(prev => prev.map(config => 
        config.id === configId ? { ...config, ...updates } : config
      ));
      
      // Actualizar configuración actual si es la que se está editando
      if (currentConfig?.id === configId) {
        setCurrentConfig(prev => prev ? { ...prev, ...updates } : null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar configuración de heatmap');
      throw err;
    }
  }, [user?.id, currentConfig?.id]);

  // Eliminar configuración de heatmap
  const deleteHeatmapConfig = useCallback(async (configId: string): Promise<void> => {
    if (!user?.id) throw new Error('Usuario no autenticado');
    
    try {
      setError(null);
      await analyticsService.deleteHeatmapConfig(configId);
      
      setHeatmapConfigs(prev => prev.filter(config => config.id !== configId));
      
      // Resetear configuración actual si se eliminó
      if (currentConfig?.id === configId) {
        setCurrentConfig(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar configuración de heatmap');
      throw err;
    }
  }, [user?.id, currentConfig?.id]);

  // Activar configuración de heatmap
  const activateHeatmapConfig = useCallback(async (configId: string): Promise<void> => {
    if (!user?.id) throw new Error('Usuario no autenticado');
    
    try {
      setError(null);
      await analyticsService.activateHeatmapConfig(configId);
      
      // Desactivar todas las configuraciones
      setHeatmapConfigs(prev => prev.map(config => ({
        ...config,
        isActive: config.id === configId
      })));
      
      // Establecer nueva configuración activa
      const activeConfig = heatmapConfigs.find(config => config.id === configId);
      setCurrentConfig(activeConfig || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al activar configuración de heatmap');
      throw err;
    }
  }, [user?.id, heatmapConfigs]);

  // Iniciar tracking
  const startTracking = useCallback((configId: string) => {
    if (!currentConfig || currentConfig.id !== configId) return;
    
    setIsTracking(true);
    sessionStartTime.current = new Date();
    
    // Crear nueva sesión
    const newSession: HeatmapSession = {
      id: `session_${Date.now()}`,
      sessionId: `session_${Date.now()}`,
      userId: user?.id,
      page: window.location.pathname,
      startTime: new Date(),
      endTime: new Date(),
      duration: 0,
      interactions: [],
      deviceInfo: {
        type: /Mobile|Android|iPhone|iPad/.test(navigator.userAgent) ? 'mobile' : 'desktop',
        screenSize: `${window.screen.width}x${window.screen.height}`,
        userAgent: navigator.userAgent
      }
    };
    
    setCurrentSession(newSession);
    setActiveSessions(prev => [...prev, newSession]);
    
    // Configurar tracking automático
    trackingRef.current = setInterval(() => {
      if (currentSession) {
        const now = new Date();
        const duration = (now.getTime() - sessionStartTime.current!.getTime()) / 1000;
        
        setCurrentSession(prev => prev ? {
          ...prev,
          endTime: now,
          duration
        } : null);
      }
    }, 1000);
  }, [currentConfig, user?.id, currentSession]);

  // Detener tracking
  const stopTracking = useCallback(() => {
    setIsTracking(false);
    
    if (trackingRef.current) {
      clearInterval(trackingRef.current);
      trackingRef.current = null;
    }
    
    if (currentSession) {
      const finalSession = {
        ...currentSession,
        endTime: new Date(),
        duration: sessionStartTime.current ? 
          (new Date().getTime() - sessionStartTime.current.getTime()) / 1000 : 0
      };
      
      setActiveSessions(prev => prev.map(session => 
        session.id === currentSession.id ? finalSession : session
      ));
      
      setCurrentSession(null);
      sessionStartTime.current = null;
    }
  }, [currentSession]);

  // Registrar interacción
  const recordInteraction = useCallback(async (interaction: Partial<HeatmapData>): Promise<void> => {
    if (!currentConfig || !currentSession) return;
    
    try {
      const newInteraction: HeatmapData = {
        id: `interaction_${Date.now()}`,
        page: window.location.pathname,
        element: interaction.element || 'unknown',
        x: interaction.x || 0,
        y: interaction.y || 0,
        clicks: interaction.clicks || 0,
        hovers: interaction.hovers || 0,
        scrollDepth: interaction.scrollDepth || 0,
        timeSpent: interaction.timeSpent || 0,
        timestamp: new Date(),
        sessionId: currentSession.sessionId,
        userId: user?.id
      };
      
      // Guardar en el servicio
      await analyticsService.recordHeatmapInteraction(currentConfig.id, newInteraction);
      
      // Actualizar estado local
      setHeatmapData(prev => [...prev, newInteraction]);
      
      // Actualizar sesión actual
      setCurrentSession(prev => prev ? {
        ...prev,
        interactions: [...prev.interactions, newInteraction]
      } : null);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrar interacción');
    }
  }, [currentConfig, currentSession, user?.id]);

  // Registrar click
  const recordClick = useCallback(async (element: string, x: number, y: number): Promise<void> => {
    await recordInteraction({
      element,
      x,
      y,
      clicks: 1,
      timeSpent: currentSession?.duration || 0
    });
  }, [recordInteraction, currentSession?.duration]);

  // Registrar hover
  const recordHover = useCallback(async (element: string, x: number, y: number): Promise<void> => {
    await recordInteraction({
      element,
      x,
      y,
      hovers: 1,
      timeSpent: currentSession?.duration || 0
    });
  }, [recordInteraction, currentSession?.duration]);

  // Registrar scroll
  const recordScroll = useCallback(async (depth: number): Promise<void> => {
    await recordInteraction({
      element: 'page',
      x: 0,
      y: 0,
      scrollDepth: depth,
      timeSpent: currentSession?.duration || 0
    });
  }, [recordInteraction, currentSession?.duration]);

  // Obtener datos de heatmap
  const getHeatmapData = useCallback(async (configId: string, filters?: any): Promise<HeatmapData[]> => {
    try {
      const data = await analyticsService.getHeatmapData(configId, filters);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al obtener datos de heatmap');
      throw err;
    }
  }, []);

  // Exportar datos de heatmap
  const exportHeatmapData = useCallback(async (configId: string, format: 'CSV' | 'JSON' | 'EXCEL'): Promise<string> => {
    try {
      const data = await analyticsService.exportHeatmapData(configId, format);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al exportar datos de heatmap');
      throw err;
    }
  }, []);

  // Limpiar datos de heatmap
  const clearHeatmapData = useCallback(async (configId: string): Promise<void> => {
    if (!user?.id) throw new Error('Usuario no autenticado');
    
    try {
      setError(null);
      await analyticsService.clearHeatmapData(configId);
      
      setHeatmapData([]);
      setStats({
        totalInteractions: 0,
        uniqueUsers: 0,
        averageSessionDuration: 0,
        mostClickedElements: [],
        engagementByTime: {},
        deviceBreakdown: {},
        conversionRates: {}
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al limpiar datos de heatmap');
      throw err;
    }
  }, [user?.id]);

  // Utilidades
  const getHeatmapForPage = useCallback((page: string): HeatmapData[] => {
    return heatmapData.filter(data => data.page === page);
  }, [heatmapData]);

  const getElementStats = useCallback((element: string): any => {
    const elementData = heatmapData.filter(data => data.element === element);
    
    return {
      totalClicks: elementData.reduce((sum, item) => sum + item.clicks, 0),
      totalHovers: elementData.reduce((sum, item) => sum + item.hovers, 0),
      averageTimeSpent: elementData.reduce((sum, item) => sum + item.timeSpent, 0) / elementData.length,
      clickRate: elementData.length > 0 ? 
        elementData.reduce((sum, item) => sum + item.clicks, 0) / elementData.length : 0
    };
  }, [heatmapData]);

  const getEngagementScore = useCallback((): number => {
    if (heatmapData.length === 0) return 0;
    
    const totalInteractions = heatmapData.length;
    const uniqueElements = new Set(heatmapData.map(d => d.element)).size;
    const averageTimeSpent = heatmapData.reduce((sum, item) => sum + item.timeSpent, 0) / totalInteractions;
    
    // Calcular score basado en interacciones, elementos únicos y tiempo
    const score = (totalInteractions * 0.4) + (uniqueElements * 0.3) + (averageTimeSpent * 0.3);
    return Math.min(score, 100);
  }, [heatmapData]);

  const getHotspots = useCallback((): Array<{ x: number; y: number; intensity: number }> => {
    // Agrupar interacciones por coordenadas
    const hotspots = heatmapData.reduce((acc, item) => {
      const key = `${Math.floor(item.x / 10)}_${Math.floor(item.y / 10)}`;
      if (!acc[key]) {
        acc[key] = { x: item.x, y: item.y, intensity: 0 };
      }
      acc[key].intensity += item.clicks + item.hovers;
      return acc;
    }, {} as Record<string, { x: number; y: number; intensity: number }>);
    
    return Object.values(hotspots)
      .sort((a, b) => b.intensity - a.intensity)
      .slice(0, 20);
  }, [heatmapData]);

  const isTrackingActive = useCallback((): boolean => {
    return isTracking;
  }, [isTracking]);

  const getCurrentSessionData = useCallback((): HeatmapSession | null => {
    return currentSession;
  }, [currentSession]);

  const getHeatmapStatsData = useCallback((): HeatmapStats => {
    return stats;
  }, [stats]);

  // Efectos
  useEffect(() => {
    loadHeatmapConfigs();
  }, [loadHeatmapConfigs]);

  useEffect(() => {
    if (currentConfig) {
      loadHeatmapData();
    }
  }, [currentConfig, loadHeatmapData]);

  // Limpiar intervalos al desmontar
  useEffect(() => {
    return () => {
      if (trackingRef.current) {
        clearInterval(trackingRef.current);
      }
    };
  }, []);

  return {
    heatmapData,
    heatmapConfigs,
    activeSessions,
    stats,
    currentConfig,
    loading,
    error,
    createHeatmapConfig,
    updateHeatmapConfig,
    deleteHeatmapConfig,
    activateHeatmapConfig,
    startTracking,
    stopTracking,
    recordInteraction,
    recordClick,
    recordHover,
    recordScroll,
    getHeatmapData,
    exportHeatmapData,
    clearHeatmapData,
    getHeatmapForPage,
    getElementStats,
    getEngagementScore,
    getHotspots,
    isTracking: isTrackingActive,
    getCurrentSession: getCurrentSessionData,
    getHeatmapStats: getHeatmapStatsData
  };
};
