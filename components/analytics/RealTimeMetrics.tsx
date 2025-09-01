'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  TrendingUp, 
  TrendingDown,
  Target,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  HelpCircle,
  RefreshCw,
  Download,
  Save,
  Settings,
  Eye,
  EyeOff,
  BarChart3,
  LineChart,
  PieChart,
  AreaChart,
  Scatter,
  Users,
  Clock,
  Calendar,
  MapPin,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  Lightbulb,
  GraduationCap,
  Trophy,
  Star,
  Heart,
  MessageSquare,
  BookOpen,
  Award,
  Zap,
  Search,
  Plus,
  Minus,
  Edit,
  Trash2,
  Copy,
  ExternalLink,
  Link,
  Unlink,
  Lock,
  Unlock,
  Shield,
  Key,
  Bell,
  Mail,
  Phone,
  Video,
  Image,
  FileText,
  File,
  Folder,
  FolderOpen,
  Database,
  Server,
  Cpu,
  HardDrive,
  Wifi,
  Signal,
  Battery,
  BatteryCharging,
  WifiOff,
  SignalHigh,
  SignalMedium,
  SignalLow,
  SignalZero,
  WifiHigh,
  WifiMedium,
  WifiLow,
  WifiZero,
  BatteryFull,
  BatteryHigh,
  BatteryMedium,
  BatteryLow,
  BatteryEmpty,
  BatteryChargingFull,
  BatteryChargingHigh,
  BatteryChargingMedium,
  BatteryChargingLow,
  BatteryChargingEmpty,
  Maximize2,
  Minimize2,
  RotateCcw,
  Share2,
  Filter,
  Play,
  Pause,
  StopCircle,
  Timer,
  Percent,
  ArrowUpRight,
  ArrowDownRight,
  Minus as MinusIcon,
  Wifi as WifiIcon,
  WifiOff as WifiOffIcon,
  Circle,
  Square,
  Triangle
} from 'lucide-react';
import { format, parseISO, differenceInSeconds } from 'date-fns';
import { es } from 'date-fns/locale';
import { io, Socket } from 'socket.io-client';

interface RealTimeMetric {
  id: string;
  name: string;
  value: number;
  previousValue: number;
  change: number; // Porcentaje de cambio
  trend: 'up' | 'down' | 'stable';
  category: 'users' | 'engagement' | 'performance' | 'errors' | 'custom';
  unit: string;
  timestamp: string;
  status: 'normal' | 'warning' | 'critical';
  description?: string;
  metadata?: Record<string, any>;
}

interface RealTimeEvent {
  id: string;
  type: 'user_action' | 'system_event' | 'error' | 'performance' | 'custom';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  userId?: string;
  sessionId?: string;
  metadata?: Record<string, any>;
}

interface ConnectionStatus {
  connected: boolean;
  lastConnected?: string;
  lastDisconnected?: string;
  reconnectAttempts: number;
  latency: number;
}

interface RealTimeMetricsProps {
  userId?: string;
  className?: string;
  refreshInterval?: number;
  onMetricUpdate?: (metrics: RealTimeMetric[]) => void;
  onEventReceived?: (event: RealTimeEvent) => void;
  onConnectionStatusChange?: (status: ConnectionStatus) => void;
  onExport?: (format: 'csv' | 'json' | 'pdf') => void;
}

export const RealTimeMetrics: React.FC<RealTimeMetricsProps> = ({
  userId,
  className = '',
  refreshInterval = 5000,
  onMetricUpdate,
  onEventReceived,
  onConnectionStatusChange,
  onExport
}) => {
  const [metrics, setMetrics] = useState<RealTimeMetric[]>([]);
  const [events, setEvents] = useState<RealTimeEvent[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    connected: false,
    reconnectAttempts: 0,
    latency: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('metrics');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showEvents, setShowEvents] = useState(true);
  const [maxEvents, setMaxEvents] = useState(50);

  const socketRef = useRef<Socket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const latencyTestRef = useRef<NodeJS.Timeout | null>(null);

  const connectWebSocket = useCallback(() => {
    try {
      // En un entorno real, usarías la URL del servidor WebSocket
      const socketUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:3001';
      
      socketRef.current = io(socketUrl, {
        transports: ['websocket', 'polling'],
        timeout: 5000,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        query: { userId }
      });

      const socket = socketRef.current;

      socket.on('connect', () => {
        console.log('WebSocket conectado');
        setConnectionStatus(prev => ({
          ...prev,
          connected: true,
          lastConnected: new Date().toISOString(),
          reconnectAttempts: 0
        }));
        
        if (onConnectionStatusChange) {
          onConnectionStatusChange({
            connected: true,
            lastConnected: new Date().toISOString(),
            reconnectAttempts: 0,
            latency: 0
          });
        }
      });

      socket.on('disconnect', (reason) => {
        console.log('WebSocket desconectado:', reason);
        setConnectionStatus(prev => ({
          ...prev,
          connected: false,
          lastDisconnected: new Date().toISOString(),
          reconnectAttempts: prev.reconnectAttempts + 1
        }));
        
        if (onConnectionStatusChange) {
          onConnectionStatusChange({
            connected: false,
            lastDisconnected: new Date().toISOString(),
            reconnectAttempts: connectionStatus.reconnectAttempts + 1,
            latency: 0
          });
        }
      });

      socket.on('metric_update', (data: RealTimeMetric) => {
        setMetrics(prev => {
          const updated = prev.map(m => m.id === data.id ? data : m);
          if (!prev.find(m => m.id === data.id)) {
            updated.push(data);
          }
          return updated.slice(-100); // Mantener solo los últimos 100
        });
        
        if (onMetricUpdate) {
          onMetricUpdate([data]);
        }
      });

      socket.on('event_received', (data: RealTimeEvent) => {
        setEvents(prev => {
          const updated = [data, ...prev].slice(0, maxEvents);
          return updated;
        });
        
        if (onEventReceived) {
          onEventReceived(data);
        }
      });

      socket.on('connect_error', (error) => {
        console.error('Error de conexión WebSocket:', error);
        setError('Error de conexión en tiempo real');
      });

      // Test de latencia
      const testLatency = () => {
        if (socket.connected) {
          const start = Date.now();
          socket.emit('ping', () => {
            const latency = Date.now() - start;
            setConnectionStatus(prev => ({ ...prev, latency }));
          });
        }
      };

      // Ejecutar test de latencia cada 30 segundos
      latencyTestRef.current = setInterval(testLatency, 30000);

    } catch (err) {
      console.error('Error inicializando WebSocket:', err);
      setError('Error inicializando conexión en tiempo real');
    }
  }, [userId, onMetricUpdate, onEventReceived, onConnectionStatusChange, maxEvents]);

  const disconnectWebSocket = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    if (latencyTestRef.current) {
      clearInterval(latencyTestRef.current);
      latencyTestRef.current = null;
    }
  }, []);

  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        userId: userId || ''
      });

      const response = await fetch(`/api/analytics/realtime?${params}`);
      
      if (!response.ok) {
        throw new Error('Error cargando métricas en tiempo real');
      }

      const data = await response.json();
      setMetrics(data.metrics || []);
      setEvents(data.events || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-600" />;
      default: return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-blue-100 text-blue-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'users': return <Users className="w-4 h-4" />;
      case 'engagement': return <Heart className="w-4 h-4" />;
      case 'performance': return <Zap className="w-4 h-4" />;
      case 'errors': return <AlertTriangle className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'user_action': return <Users className="w-4 h-4" />;
      case 'system_event': return <Server className="w-4 h-4" />;
      case 'error': return <AlertTriangle className="w-4 h-4" />;
      case 'performance': return <Zap className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const filteredMetrics = useMemo(() => {
    if (selectedCategory === 'all') return metrics;
    return metrics.filter(m => m.category === selectedCategory);
  }, [metrics, selectedCategory]);

  const recentEvents = useMemo(() => {
    return events.slice(0, 20);
  }, [events]);

  const criticalEvents = useMemo(() => {
    return events.filter(e => e.severity === 'critical').slice(0, 5);
  }, [events]);

  useEffect(() => {
    loadInitialData();
    connectWebSocket();

    return () => {
      disconnectWebSocket();
    };
  }, [loadInitialData, connectWebSocket, disconnectWebSocket]);

  useEffect(() => {
    if (autoRefresh && connectionStatus.connected) {
      const interval = setInterval(() => {
        // Los datos se actualizan automáticamente via WebSocket
      }, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, connectionStatus.connected, refreshInterval]);

  if (loading) {
    return (
      <Card className={`${className} ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
        <CardContent className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" 
               role="status" 
               aria-label="Cargando métricas en tiempo real">
            <span className="sr-only">Cargando...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
            <p>Error: {error}</p>
            <Button onClick={loadInitialData} className="mt-4">
              <RefreshCw className="w-4 h-4 mr-2" />
              Reintentar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${className} ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5" />
            <CardTitle>Métricas en Tiempo Real</CardTitle>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="ml-2">
                {filteredMetrics.length} métricas
              </Badge>
              <div className="flex items-center space-x-1">
                {connectionStatus.connected ? (
                  <WifiIcon className="w-4 h-4 text-green-600" />
                ) : (
                  <WifiOffIcon className="w-4 h-4 text-red-600" />
                )}
                <span className="text-xs text-gray-600">
                  {connectionStatus.connected ? 'Conectado' : 'Desconectado'}
                </span>
              </div>
              {connectionStatus.latency > 0 && (
                <span className="text-xs text-gray-500">
                  {connectionStatus.latency}ms
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowEvents(!showEvents)}
              aria-label={showEvents ? 'Ocultar eventos' : 'Mostrar eventos'}
            >
              {showEvents ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              Eventos
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
              aria-label={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onExport?.('csv')}
              aria-label="Exportar como CSV"
            >
              <Download className="w-4 h-4 mr-1" />
              CSV
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Estado de conexión */}
        <Card className="bg-gray-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  {connectionStatus.connected ? (
                    <Circle className="w-3 h-3 text-green-600 fill-current" />
                  ) : (
                    <Circle className="w-3 h-3 text-red-600 fill-current" />
                  )}
                  <span className="text-sm font-medium">
                    {connectionStatus.connected ? 'Conectado' : 'Desconectado'}
                  </span>
                </div>
                {connectionStatus.latency > 0 && (
                  <span className="text-sm text-gray-600">
                    Latencia: {connectionStatus.latency}ms
                  </span>
                )}
                {connectionStatus.reconnectAttempts > 0 && (
                  <span className="text-sm text-orange-600">
                    Reintentos: {connectionStatus.reconnectAttempts}
                  </span>
                )}
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAutoRefresh(!autoRefresh)}
                >
                  {autoRefresh ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  {autoRefresh ? 'Pausar' : 'Reanudar'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={connectWebSocket}
                >
                  <RefreshCw className="w-4 h-4" />
                  Reconectar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filtros de categoría */}
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium">Categoría:</span>
          <div className="flex space-x-2">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('all')}
            >
              Todas
            </Button>
            <Button
              variant={selectedCategory === 'users' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('users')}
            >
              <Users className="w-4 h-4 mr-1" />
              Usuarios
            </Button>
            <Button
              variant={selectedCategory === 'engagement' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('engagement')}
            >
              <Heart className="w-4 h-4 mr-1" />
              Engagement
            </Button>
            <Button
              variant={selectedCategory === 'performance' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('performance')}
            >
              <Zap className="w-4 h-4 mr-1" />
              Rendimiento
            </Button>
            <Button
              variant={selectedCategory === 'errors' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('errors')}
            >
              <AlertTriangle className="w-4 h-4 mr-1" />
              Errores
            </Button>
          </div>
        </div>

        {/* Tabs principales */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="metrics">Métricas</TabsTrigger>
            <TabsTrigger value="events">Eventos</TabsTrigger>
            <TabsTrigger value="alerts">Alertas</TabsTrigger>
          </TabsList>

          <TabsContent value="metrics" className="space-y-4">
            {filteredMetrics.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Activity className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600">No hay métricas disponibles</h3>
                  <p className="text-gray-500">Las métricas aparecerán aquí cuando estén disponibles</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredMetrics.map((metric) => (
                  <Card key={metric.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getCategoryIcon(metric.category)}
                          <CardTitle className="text-lg">{metric.name}</CardTitle>
                        </div>
                        <Badge className={getStatusColor(metric.status)}>
                          {metric.status.toUpperCase()}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Valor actual */}
                      <div className="text-center">
                        <p className="text-3xl font-bold">{metric.value}</p>
                        <p className="text-sm text-gray-600">{metric.unit}</p>
                      </div>

                      {/* Cambio y tendencia */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getTrendIcon(metric.trend)}
                          <span className={`text-sm font-medium ${
                            metric.change > 0 ? 'text-green-600' : 
                            metric.change < 0 ? 'text-red-600' : 'text-gray-600'
                          }`}>
                            {metric.change > 0 ? '+' : ''}{Math.round(metric.change)}%
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {format(parseISO(metric.timestamp), 'HH:mm:ss')}
                        </span>
                      </div>

                      {/* Descripción */}
                      {metric.description && (
                        <p className="text-sm text-gray-600">{metric.description}</p>
                      )}

                      {/* Metadata */}
                      {metric.metadata && Object.keys(metric.metadata).length > 0 && (
                        <div className="text-xs text-gray-500">
                          {Object.entries(metric.metadata).map(([key, value]) => (
                            <div key={key} className="flex justify-between">
                              <span>{key}:</span>
                              <span>{String(value)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="events" className="space-y-4">
            {recentEvents.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Bell className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600">No hay eventos recientes</h3>
                  <p className="text-gray-500">Los eventos aparecerán aquí cuando ocurran</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {recentEvents.map((event) => (
                  <Card key={event.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          {getEventTypeIcon(event.type)}
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="font-medium">{event.title}</h4>
                              <Badge className={getSeverityColor(event.severity)}>
                                {event.severity.toUpperCase()}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <span>{format(parseISO(event.timestamp), 'HH:mm:ss')}</span>
                              {event.userId && <span>Usuario: {event.userId}</span>}
                              {event.sessionId && <span>Sesión: {event.sessionId}</span>}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500">
                            {differenceInSeconds(new Date(), parseISO(event.timestamp))}s
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="alerts" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Eventos críticos */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <span>Eventos Críticos</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {criticalEvents.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No hay eventos críticos</p>
                  ) : (
                    <div className="space-y-3">
                      {criticalEvents.map((event) => (
                        <div key={event.id} className="p-3 bg-red-50 rounded-lg border border-red-200">
                          <div className="flex items-start space-x-2">
                            <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5" />
                            <div className="flex-1">
                              <h4 className="font-medium text-red-800">{event.title}</h4>
                              <p className="text-sm text-red-600">{event.description}</p>
                              <span className="text-xs text-red-500">
                                {format(parseISO(event.timestamp), 'HH:mm:ss')}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Métricas con alertas */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="w-5 h-5 text-orange-600" />
                    <span>Métricas con Alertas</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {filteredMetrics.filter(m => m.status !== 'normal').length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No hay métricas con alertas</p>
                  ) : (
                    <div className="space-y-3">
                      {filteredMetrics
                        .filter(m => m.status !== 'normal')
                        .slice(0, 5)
                        .map((metric) => (
                          <div key={metric.id} className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium text-orange-800">{metric.name}</h4>
                                <p className="text-sm text-orange-600">
                                  {metric.value} {metric.unit}
                                </p>
                              </div>
                              <Badge className={
                                metric.status === 'critical' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                              }>
                                {metric.status.toUpperCase()}
                              </Badge>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default RealTimeMetrics;
