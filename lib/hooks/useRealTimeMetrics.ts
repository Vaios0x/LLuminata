/**
 * Hook para manejo de métricas en tiempo real
 * Proporciona funcionalidades para streaming de datos y actualizaciones automáticas
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './useAuth';
import { AnalyticsService } from '../analytics/analytics-service';

// Interfaces
interface RealTimeMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  category: 'USERS' | 'SESSIONS' | 'EVENTS' | 'PERFORMANCE' | 'BUSINESS' | 'CUSTOM';
  timestamp: Date;
  change: {
    value: number;
    percentage: number;
    direction: 'UP' | 'DOWN' | 'STABLE';
  };
  metadata: {
    source: string;
    confidence: number;
    lastUpdated: Date;
    [key: string]: any;
  };
}

interface RealTimeConfig {
  id: string;
  name: string;
  description: string;
  metrics: string[];
  updateInterval: number; // En segundos
  aggregation: 'SUM' | 'AVERAGE' | 'COUNT' | 'MIN' | 'MAX';
  filters: {
    timeRange: string;
    userSegments: string[];
    events: string[];
    customRules: Record<string, any>;
  };
  alerts: {
    enabled: boolean;
    thresholds: Record<string, number>;
    notifications: string[];
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface RealTimeAlert {
  id: string;
  configId: string;
  metricName: string;
  type: 'THRESHOLD_EXCEEDED' | 'ANOMALY_DETECTED' | 'TREND_CHANGE' | 'CUSTOM';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  currentValue: number;
  threshold: number;
  timestamp: Date;
  isAcknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
}

interface RealTimeDashboard {
  id: string;
  name: string;
  description: string;
  layout: {
    columns: number;
    rows: number;
    widgets: RealTimeWidget[];
  };
  refreshInterval: number;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface RealTimeWidget {
  id: string;
  type: 'METRIC' | 'CHART' | 'GAUGE' | 'COUNTER' | 'LIST';
  title: string;
  config: {
    metricId: string;
    chartType?: 'LINE' | 'BAR' | 'PIE' | 'GAUGE';
    timeRange: string;
    aggregation: string;
    [key: string]: any;
  };
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

interface RealTimeStats {
  totalMetrics: number;
  activeConfigs: number;
  totalAlerts: number;
  averageUpdateTime: number;
  uptime: number;
  performance: {
    cpuUsage: number;
    memoryUsage: number;
    networkLatency: number;
  };
  lastUpdated: Date;
}

interface UseRealTimeMetricsReturn {
  // Estado
  metrics: RealTimeMetric[];
  configs: RealTimeConfig[];
  alerts: RealTimeAlert[];
  dashboards: RealTimeDashboard[];
  stats: RealTimeStats;
  isConnected: boolean;
  loading: boolean;
  error: string | null;
  
  // Acciones de métricas
  subscribeToMetric: (metricName: string) => Promise<void>;
  unsubscribeFromMetric: (metricName: string) => Promise<void>;
  getMetricHistory: (metricName: string, timeRange: string) => Promise<RealTimeMetric[]>;
  updateMetric: (metricName: string, value: number) => Promise<void>;
  
  // Acciones de configuración
  createConfig: (configData: Partial<RealTimeConfig>) => Promise<RealTimeConfig>;
  updateConfig: (configId: string, updates: Partial<RealTimeConfig>) => Promise<void>;
  deleteConfig: (configId: string) => Promise<void>;
  activateConfig: (configId: string) => Promise<void>;
  
  // Acciones de alertas
  acknowledgeAlert: (alertId: string) => Promise<void>;
  dismissAlert: (alertId: string) => Promise<void>;
  getActiveAlerts: () => RealTimeAlert[];
  setAlertThreshold: (metricName: string, threshold: number) => Promise<void>;
  
  // Acciones de dashboard
  createDashboard: (dashboardData: Partial<RealTimeDashboard>) => Promise<RealTimeDashboard>;
  updateDashboard: (dashboardId: string, updates: Partial<RealTimeDashboard>) => Promise<void>;
  deleteDashboard: (dashboardId: string) => Promise<void>;
  addWidget: (dashboardId: string, widget: Partial<RealTimeWidget>) => Promise<void>;
  removeWidget: (dashboardId: string, widgetId: string) => Promise<void>;
  
  // Utilidades
  getMetricValue: (metricName: string) => number;
  getMetricChange: (metricName: string) => { value: number; percentage: number; direction: string };
  isMetricTrending: (metricName: string, direction: 'UP' | 'DOWN') => boolean;
  getMetricsByCategory: (category: RealTimeMetric['category']) => RealTimeMetric[];
  getTopMetrics: (limit: number) => RealTimeMetric[];
  getRealTimeStats: () => RealTimeStats;
  isStreaming: () => boolean;
  getConnectionStatus: () => string;
}

export const useRealTimeMetrics = (): UseRealTimeMetricsReturn => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<RealTimeMetric[]>([]);
  const [configs, setConfigs] = useState<RealTimeConfig[]>([]);
  const [alerts, setAlerts] = useState<RealTimeAlert[]>([]);
  const [dashboards, setDashboards] = useState<RealTimeDashboard[]>([]);
  const [stats, setStats] = useState<RealTimeStats>({
    totalMetrics: 0,
    activeConfigs: 0,
    totalAlerts: 0,
    averageUpdateTime: 0,
    uptime: 0,
    performance: {
      cpuUsage: 0,
      memoryUsage: 0,
      networkLatency: 0
    },
    lastUpdated: new Date()
  });
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const connectionRef = useRef<WebSocket | null>(null);
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const analyticsService = new AnalyticsService();

  // Cargar configuraciones en tiempo real
  const loadConfigs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simular carga de configuraciones en tiempo real
      const mockConfigs: RealTimeConfig[] = [
        {
          id: '1',
          name: 'Configuración por defecto',
          description: 'Configuración estándar para métricas en tiempo real',
          metrics: ['active_users', 'page_views', 'session_duration'],
          updateInterval: 5000,
          retentionPeriod: 24,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      setConfigs(mockConfigs);
      
      // Inicializar métricas basadas en configuraciones activas
      const activeConfigs = mockConfigs.filter(config => config.isActive);
      const initialMetrics: RealTimeMetric[] = [];
      
      activeConfigs.forEach((config: RealTimeConfig) => {
        config.metrics.forEach((metricName: string) => {
          initialMetrics.push({
            id: `metric_${metricName}`,
            name: metricName,
            value: 0,
            unit: 'count',
            category: 'CUSTOM',
            timestamp: new Date(),
            change: {
              value: 0,
              percentage: 0,
              direction: 'STABLE'
            },
            metadata: {
              source: 'initial',
              confidence: 1,
              lastUpdated: new Date()
            }
          });
        });
      });
      
      setMetrics(initialMetrics);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar configuraciones');
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar alertas
  const loadAlerts = useCallback(async () => {
    try {
      // Simular carga de alertas en tiempo real
      const mockAlerts: RealTimeAlert[] = [
        {
          id: '1',
          metricName: 'active_users',
          type: 'THRESHOLD_EXCEEDED',
          severity: 'WARNING',
          message: 'Usuarios activos por debajo del umbral',
          threshold: 100,
          currentValue: 85,
          isAcknowledged: false,
          createdAt: new Date(),
          acknowledgedAt: undefined,
          acknowledgedBy: undefined
        }
      ];
      setAlerts(mockAlerts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar alertas');
    }
  }, []);

  // Cargar dashboards
  const loadDashboards = useCallback(async () => {
    try {
      const realTimeDashboards = await analyticsService.getRealTimeDashboards();
      setDashboards(realTimeDashboards);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar dashboards');
    }
  }, []);

  // Cargar estadísticas
  const loadStats = useCallback(async () => {
    try {
      const realTimeStats = await analyticsService.getRealTimeStats();
      setStats(realTimeStats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar estadísticas');
    }
  }, []);

  // Establecer conexión WebSocket
  const establishConnection = useCallback(() => {
    try {
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001/realtime';
      connectionRef.current = new WebSocket(wsUrl);
      
      connectionRef.current.onopen = () => {
        setIsConnected(true);
        setError(null);
        console.log('Conexión WebSocket establecida');
      };
      
      connectionRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'METRIC_UPDATE') {
            setMetrics(prev => prev.map(metric => 
              metric.name === data.metric.name ? {
                ...metric,
                value: data.metric.value,
                timestamp: new Date(data.metric.timestamp),
                change: data.metric.change,
                metadata: {
                  ...metric.metadata,
                  lastUpdated: new Date()
                }
              } : metric
            ));
          } else if (data.type === 'ALERT') {
            setAlerts(prev => [data.alert, ...prev]);
          } else if (data.type === 'STATS_UPDATE') {
            setStats(prev => ({
              ...prev,
              ...data.stats,
              lastUpdated: new Date()
            }));
          }
        } catch (err) {
          console.error('Error al procesar mensaje WebSocket:', err);
        }
      };
      
      connectionRef.current.onclose = () => {
        setIsConnected(false);
        console.log('Conexión WebSocket cerrada');
        
        // Reintentar conexión después de 5 segundos
        reconnectTimeoutRef.current = setTimeout(() => {
          establishConnection();
        }, 5000);
      };
      
      connectionRef.current.onerror = (error) => {
        console.error('Error en WebSocket:', error);
        setError('Error de conexión en tiempo real');
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al establecer conexión');
    }
  }, []);

  // Suscribirse a métrica
  const subscribeToMetric = useCallback(async (metricName: string): Promise<void> => {
    if (!isConnected || !connectionRef.current) {
      throw new Error('No hay conexión en tiempo real');
    }
    
    try {
      setError(null);
      
      // Enviar mensaje de suscripción
      connectionRef.current.send(JSON.stringify({
        type: 'SUBSCRIBE',
        metric: metricName
      }));
      
      // Agregar métrica si no existe
      if (!metrics.find(m => m.name === metricName)) {
        const newMetric: RealTimeMetric = {
          id: `metric_${metricName}`,
          name: metricName,
          value: 0,
          unit: 'count',
          category: 'CUSTOM',
          timestamp: new Date(),
          change: {
            value: 0,
            percentage: 0,
            direction: 'STABLE'
          },
          metadata: {
            source: 'subscription',
            confidence: 1,
            lastUpdated: new Date()
          }
        };
        
        setMetrics(prev => [...prev, newMetric]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al suscribirse a métrica');
      throw err;
    }
  }, [isConnected, metrics]);

  // Desuscribirse de métrica
  const unsubscribeFromMetric = useCallback(async (metricName: string): Promise<void> => {
    if (!isConnected || !connectionRef.current) {
      throw new Error('No hay conexión en tiempo real');
    }
    
    try {
      setError(null);
      
      // Enviar mensaje de desuscripción
      connectionRef.current.send(JSON.stringify({
        type: 'UNSUBSCRIBE',
        metric: metricName
      }));
      
      // Remover métrica
      setMetrics(prev => prev.filter(m => m.name !== metricName));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al desuscribirse de métrica');
      throw err;
    }
  }, [isConnected]);

  // Obtener historial de métrica
  const getMetricHistory = useCallback(async (metricName: string, timeRange: string): Promise<RealTimeMetric[]> => {
    try {
      const history = await analyticsService.getMetricHistory(metricName, timeRange);
      return history;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al obtener historial de métrica');
      throw err;
    }
  }, []);

  // Actualizar métrica
  const updateMetric = useCallback(async (metricName: string, value: number): Promise<void> => {
    if (!user?.id) throw new Error('Usuario no autenticado');
    
    try {
      setError(null);
      await analyticsService.updateMetric(user.id, metricName, value);
      
      // Actualizar métrica local
      setMetrics(prev => prev.map(metric => 
        metric.name === metricName ? {
          ...metric,
          value,
          timestamp: new Date(),
          metadata: {
            ...metric.metadata,
            lastUpdated: new Date()
          }
        } : metric
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar métrica');
      throw err;
    }
  }, [user?.id]);

  // Crear configuración
  const createConfig = useCallback(async (configData: Partial<RealTimeConfig>): Promise<RealTimeConfig> => {
    if (!user?.id) throw new Error('Usuario no autenticado');
    
    try {
      setError(null);
      const newConfig = await analyticsService.createRealTimeConfig(user.id, configData);
      
      setConfigs(prev => [...prev, newConfig]);
      return newConfig;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear configuración');
      throw err;
    }
  }, [user?.id]);

  // Actualizar configuración
  const updateConfig = useCallback(async (configId: string, updates: Partial<RealTimeConfig>): Promise<void> => {
    if (!user?.id) throw new Error('Usuario no autenticado');
    
    try {
      setError(null);
      await analyticsService.updateRealTimeConfig(configId, updates);
      
      setConfigs(prev => prev.map(config => 
        config.id === configId ? { ...config, ...updates } : config
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar configuración');
      throw err;
    }
  }, [user?.id]);

  // Eliminar configuración
  const deleteConfig = useCallback(async (configId: string): Promise<void> => {
    if (!user?.id) throw new Error('Usuario no autenticado');
    
    try {
      setError(null);
      await analyticsService.deleteRealTimeConfig(configId);
      
      setConfigs(prev => prev.filter(config => config.id !== configId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar configuración');
      throw err;
    }
  }, [user?.id]);

  // Activar configuración
  const activateConfig = useCallback(async (configId: string): Promise<void> => {
    if (!user?.id) throw new Error('Usuario no autenticado');
    
    try {
      setError(null);
      await analyticsService.activateRealTimeConfig(configId);
      
      setConfigs(prev => prev.map(config => ({
        ...config,
        isActive: config.id === configId
      })));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al activar configuración');
      throw err;
    }
  }, [user?.id]);

  // Reconocer alerta
  const acknowledgeAlert = useCallback(async (alertId: string): Promise<void> => {
    if (!user?.id) throw new Error('Usuario no autenticado');
    
    try {
      setError(null);
      await analyticsService.acknowledgeAlert(alertId, user.id);
      
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId ? {
          ...alert,
          isAcknowledged: true,
          acknowledgedBy: user.id,
          acknowledgedAt: new Date()
        } : alert
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al reconocer alerta');
      throw err;
    }
  }, [user?.id]);

  // Descartar alerta
  const dismissAlert = useCallback(async (alertId: string): Promise<void> => {
    if (!user?.id) throw new Error('Usuario no autenticado');
    
    try {
      setError(null);
      await analyticsService.dismissAlert(alertId);
      
      setAlerts(prev => prev.filter(alert => alert.id !== alertId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al descartar alerta');
      throw err;
    }
  }, [user?.id]);

  // Obtener alertas activas
  const getActiveAlerts = useCallback((): RealTimeAlert[] => {
    return alerts.filter(alert => !alert.isAcknowledged);
  }, [alerts]);

  // Establecer umbral de alerta
  const setAlertThreshold = useCallback(async (metricName: string, threshold: number): Promise<void> => {
    if (!user?.id) throw new Error('Usuario no autenticado');
    
    try {
      setError(null);
      await analyticsService.setAlertThreshold(user.id, metricName, threshold);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al establecer umbral de alerta');
      throw err;
    }
  }, [user?.id]);

  // Crear dashboard
  const createDashboard = useCallback(async (dashboardData: Partial<RealTimeDashboard>): Promise<RealTimeDashboard> => {
    if (!user?.id) throw new Error('Usuario no autenticado');
    
    try {
      setError(null);
      const newDashboard = await analyticsService.createRealTimeDashboard(user.id, dashboardData);
      
      setDashboards(prev => [...prev, newDashboard]);
      return newDashboard;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear dashboard');
      throw err;
    }
  }, [user?.id]);

  // Actualizar dashboard
  const updateDashboard = useCallback(async (dashboardId: string, updates: Partial<RealTimeDashboard>): Promise<void> => {
    if (!user?.id) throw new Error('Usuario no autenticado');
    
    try {
      setError(null);
      await analyticsService.updateRealTimeDashboard(dashboardId, updates);
      
      setDashboards(prev => prev.map(dashboard => 
        dashboard.id === dashboardId ? { ...dashboard, ...updates } : dashboard
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar dashboard');
      throw err;
    }
  }, [user?.id]);

  // Eliminar dashboard
  const deleteDashboard = useCallback(async (dashboardId: string): Promise<void> => {
    if (!user?.id) throw new Error('Usuario no autenticado');
    
    try {
      setError(null);
      await analyticsService.deleteRealTimeDashboard(dashboardId);
      
      setDashboards(prev => prev.filter(dashboard => dashboard.id !== dashboardId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar dashboard');
      throw err;
    }
  }, [user?.id]);

  // Agregar widget
  const addWidget = useCallback(async (dashboardId: string, widget: Partial<RealTimeWidget>): Promise<void> => {
    if (!user?.id) throw new Error('Usuario no autenticado');
    
    try {
      setError(null);
      const newWidget = await analyticsService.addDashboardWidget(dashboardId, widget);
      
      setDashboards(prev => prev.map(dashboard => 
        dashboard.id === dashboardId ? {
          ...dashboard,
          layout: {
            ...dashboard.layout,
            widgets: [...dashboard.layout.widgets, newWidget]
          }
        } : dashboard
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al agregar widget');
      throw err;
    }
  }, [user?.id]);

  // Remover widget
  const removeWidget = useCallback(async (dashboardId: string, widgetId: string): Promise<void> => {
    if (!user?.id) throw new Error('Usuario no autenticado');
    
    try {
      setError(null);
      await analyticsService.removeDashboardWidget(dashboardId, widgetId);
      
      setDashboards(prev => prev.map(dashboard => 
        dashboard.id === dashboardId ? {
          ...dashboard,
          layout: {
            ...dashboard.layout,
            widgets: dashboard.layout.widgets.filter(widget => widget.id !== widgetId)
          }
        } : dashboard
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al remover widget');
      throw err;
    }
  }, [user?.id]);

  // Utilidades
  const getMetricValue = useCallback((metricName: string): number => {
    const metric = metrics.find(m => m.name === metricName);
    return metric?.value || 0;
  }, [metrics]);

  const getMetricChange = useCallback((metricName: string): { value: number; percentage: number; direction: string } => {
    const metric = metrics.find(m => m.name === metricName);
    return metric?.change || { value: 0, percentage: 0, direction: 'STABLE' };
  }, [metrics]);

  const isMetricTrending = useCallback((metricName: string, direction: 'UP' | 'DOWN'): boolean => {
    const metric = metrics.find(m => m.name === metricName);
    return metric?.change.direction === direction;
  }, [metrics]);

  const getMetricsByCategory = useCallback((category: RealTimeMetric['category']): RealTimeMetric[] => {
    return metrics.filter(metric => metric.category === category);
  }, [metrics]);

  const getTopMetrics = useCallback((limit: number): RealTimeMetric[] => {
    return metrics
      .sort((a, b) => Math.abs(b.change.percentage) - Math.abs(a.change.percentage))
      .slice(0, limit);
  }, [metrics]);

  const getRealTimeStatsData = useCallback((): RealTimeStats => {
    return stats;
  }, [stats]);

  const isStreaming = useCallback((): boolean => {
    return isConnected;
  }, [isConnected]);

  const getConnectionStatus = useCallback((): string => {
    if (isConnected) return 'Conectado';
    if (loading) return 'Conectando...';
    if (error) return 'Error de conexión';
    return 'Desconectado';
  }, [isConnected, loading, error]);

  // Efectos
  useEffect(() => {
    loadConfigs();
    loadAlerts();
    loadDashboards();
    loadStats();
  }, [loadConfigs, loadAlerts, loadDashboards, loadStats]);

  useEffect(() => {
    establishConnection();
    
    return () => {
      if (connectionRef.current) {
        connectionRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
    };
  }, [establishConnection]);

  // Actualizar estadísticas cada 30 segundos
  useEffect(() => {
    updateIntervalRef.current = setInterval(() => {
      loadStats();
    }, 30000);
    
    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
    };
  }, [loadStats]);

  return {
    metrics,
    configs,
    alerts,
    dashboards,
    stats,
    isConnected,
    loading,
    error,
    subscribeToMetric,
    unsubscribeFromMetric,
    getMetricHistory,
    updateMetric,
    createConfig,
    updateConfig,
    deleteConfig,
    activateConfig,
    acknowledgeAlert,
    dismissAlert,
    getActiveAlerts,
    setAlertThreshold,
    createDashboard,
    updateDashboard,
    deleteDashboard,
    addWidget,
    removeWidget,
    getMetricValue,
    getMetricChange,
    isMetricTrending,
    getMetricsByCategory,
    getTopMetrics,
    getRealTimeStats: getRealTimeStatsData,
    isStreaming,
    getConnectionStatus
  };
};
