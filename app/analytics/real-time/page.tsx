'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  Calendar,
  BarChart3,
  PieChart,
  Zap,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  HelpCircle,
  Settings,
  Filter,
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
  Share2,
  Bookmark,
  Play,
  Pause,
  SkipForward,
  Rewind,
  Volume2,
  VolumeX,
  Download,
  RefreshCw,
  Save,
  Maximize2,
  Minimize2,
  RotateCcw,
  Eye,
  MousePointer,
  Click,
  Scroll,
  Move,
  Award,
  Crown,
  Coins,
  Gift,
  Package,
  Tag,
  Percent,
  Equal,
  ArrowUp,
  ArrowDown,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  ArrowUpLeft,
  ArrowDownLeft,
  CornerUpLeft,
  CornerUpRight,
  CornerDownLeft,
  CornerDownRight,
  MoveUp,
  MoveDown,
  MoveLeft,
  MoveRight,
  RotateCcw2,
  RotateCw,
  RotateCw2,
  RefreshCw2,
  RefreshCw3,
  RefreshCw4,
  RefreshCw5,
  RefreshCw6,
  RefreshCw7,
  RefreshCw8,
  RefreshCw9,
  RefreshCw10,
  Brain,
  Target,
  Users2,
  Clock2,
  Calendar2,
  BarChart32,
  PieChart2,
  Activity2,
  Zap2,
  CheckCircle2,
  XCircle2,
  AlertTriangle2,
  Info2,
  HelpCircle2,
  Settings2,
  Filter2,
  Search2,
  Plus2,
  Minus2,
  Edit2,
  Trash22,
  Copy2,
  ExternalLink2,
  Link2,
  Unlink2,
  Lock2,
  Unlock2,
  Shield2,
  Key2,
  Bell2,
  Mail2,
  Phone2,
  Video2,
  Image2,
  FileText2,
  File2,
  Folder2,
  FolderOpen2,
  Database2,
  Server2,
  Cpu2,
  HardDrive2,
  Wifi2,
  Signal2,
  Battery2,
  BatteryCharging2,
  WifiOff2,
  SignalHigh2,
  SignalMedium2,
  SignalLow2,
  SignalZero2,
  WifiHigh2,
  WifiMedium2,
  WifiLow2,
  WifiZero2,
  BatteryFull2,
  BatteryHigh2,
  BatteryMedium2,
  BatteryLow2,
  BatteryEmpty2,
  BatteryChargingFull2,
  BatteryChargingHigh2,
  BatteryChargingMedium2,
  BatteryChargingLow2,
  BatteryChargingEmpty2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface RealTimeMetric {
  id: string;
  name: string;
  value: number;
  previousValue: number;
  change: number;
  changePercentage: number;
  trend: 'up' | 'down' | 'stable';
  category: 'users' | 'engagement' | 'performance' | 'errors';
  timestamp: Date;
  status: 'normal' | 'warning' | 'critical';
}

interface LiveEvent {
  id: string;
  type: 'user_login' | 'lesson_completed' | 'error' | 'purchase' | 'page_view';
  userId?: string;
  description: string;
  timestamp: Date;
  metadata: Record<string, any>;
  severity: 'info' | 'warning' | 'error' | 'success';
}

interface ActiveUser {
  id: string;
  username: string;
  currentPage: string;
  sessionDuration: number;
  lastActivity: Date;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  location: string;
  actions: string[];
}

interface PerformanceMetric {
  metric: string;
  current: number;
  average: number;
  threshold: number;
  status: 'good' | 'warning' | 'critical';
  trend: 'improving' | 'stable' | 'declining';
}

export default function RealTimePage() {
  const [metrics, setMetrics] = useState<RealTimeMetric[]>([]);
  const [liveEvents, setLiveEvents] = useState<LiveEvent[]>([]);
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLive, setIsLive] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'events' | 'users' | 'performance'>('overview');
  const [timeRange, setTimeRange] = useState<'1m' | '5m' | '15m' | '1h'>('5m');
  const intervalRef = useRef<NodeJS.Timeout>();

  // Datos de ejemplo
  const mockMetrics: RealTimeMetric[] = [
    {
      id: 'active_users',
      name: 'Usuarios Activos',
      value: 1247,
      previousValue: 1189,
      change: 58,
      changePercentage: 4.9,
      trend: 'up',
      category: 'users',
      timestamp: new Date(),
      status: 'normal'
    },
    {
      id: 'page_views',
      name: 'Vistas de Página',
      value: 8923,
      previousValue: 8456,
      change: 467,
      changePercentage: 5.5,
      trend: 'up',
      category: 'engagement',
      timestamp: new Date(),
      status: 'normal'
    },
    {
      id: 'response_time',
      name: 'Tiempo de Respuesta',
      value: 245,
      previousValue: 267,
      change: -22,
      changePercentage: -8.2,
      trend: 'up',
      category: 'performance',
      timestamp: new Date(),
      status: 'normal'
    },
    {
      id: 'error_rate',
      name: 'Tasa de Errores',
      value: 0.8,
      previousValue: 1.2,
      change: -0.4,
      changePercentage: -33.3,
      trend: 'up',
      category: 'errors',
      timestamp: new Date(),
      status: 'normal'
    }
  ];

  const mockLiveEvents: LiveEvent[] = [
    {
      id: 'event_1',
      type: 'user_login',
      userId: 'user_123',
      description: 'Usuario María López inició sesión',
      timestamp: new Date(),
      metadata: { device: 'mobile', location: 'México' },
      severity: 'info'
    },
    {
      id: 'event_2',
      type: 'lesson_completed',
      userId: 'user_456',
      description: 'Lección "Introducción al Maya" completada',
      timestamp: new Date(Date.now() - 30000),
      metadata: { lessonId: 'lesson_1', score: 95 },
      severity: 'success'
    },
    {
      id: 'event_3',
      type: 'error',
      description: 'Error 500 en /api/lessons',
      timestamp: new Date(Date.now() - 60000),
      metadata: { endpoint: '/api/lessons', errorCode: 500 },
      severity: 'error'
    }
  ];

  const mockActiveUsers: ActiveUser[] = [
    {
      id: 'user_1',
      username: 'María López',
      currentPage: '/lessons/maya-basics',
      sessionDuration: 1245,
      lastActivity: new Date(),
      deviceType: 'mobile',
      location: 'México',
      actions: ['login', 'lesson_start', 'quiz_answer']
    },
    {
      id: 'user_2',
      username: 'Carlos Ruiz',
      currentPage: '/dashboard',
      sessionDuration: 892,
      lastActivity: new Date(Date.now() - 30000),
      deviceType: 'desktop',
      location: 'España',
      actions: ['login', 'profile_update']
    }
  ];

  const mockPerformanceMetrics: PerformanceMetric[] = [
    {
      metric: 'Tiempo de carga de página',
      current: 1.2,
      average: 1.5,
      threshold: 2.0,
      status: 'good',
      trend: 'improving'
    },
    {
      metric: 'Tiempo de respuesta API',
      current: 245,
      average: 267,
      threshold: 500,
      status: 'good',
      trend: 'improving'
    },
    {
      metric: 'Uso de CPU',
      current: 65,
      average: 58,
      threshold: 80,
      status: 'warning',
      trend: 'declining'
    },
    {
      metric: 'Uso de memoria',
      current: 78,
      average: 72,
      threshold: 85,
      status: 'warning',
      trend: 'declining'
    }
  ];

  useEffect(() => {
    loadRealTimeData();
    
    if (isLive) {
      intervalRef.current = setInterval(() => {
        updateRealTimeData();
      }, 5000); // Actualizar cada 5 segundos
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isLive, timeRange]);

  const loadRealTimeData = async () => {
    try {
      setIsLoading(true);
      // En producción, esto sería una llamada a la API
      // const response = await fetch(`/api/analytics/real-time?range=${timeRange}`);
      // const data = await response.json();
      
      // Simulando carga
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMetrics(mockMetrics);
      setLiveEvents(mockLiveEvents);
      setActiveUsers(mockActiveUsers);
      setPerformanceMetrics(mockPerformanceMetrics);
    } catch (error) {
      console.error('Error loading real-time data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateRealTimeData = () => {
    // Simular actualizaciones en tiempo real
    setMetrics(prev => prev.map(metric => ({
      ...metric,
      value: metric.value + Math.floor(Math.random() * 10) - 5,
      timestamp: new Date()
    })));

    // Agregar nuevos eventos
    const newEvent: LiveEvent = {
      id: `event_${Date.now()}`,
      type: 'page_view',
      description: 'Nueva vista de página',
      timestamp: new Date(),
      metadata: {},
      severity: 'info'
    };

    setLiveEvents(prev => [newEvent, ...prev.slice(0, 49)]); // Mantener solo los últimos 50 eventos
  };

  const toggleLiveMode = () => {
    setIsLive(!isLive);
  };

  const getMetricStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getEventSeverityColor = (severity: string) => {
    switch (severity) {
      case 'success': return 'text-green-600 bg-green-100';
      case 'info': return 'text-blue-600 bg-blue-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPerformanceStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString('es-MX');
  };

  const formatPercentage = (num: number) => {
    return `${num > 0 ? '+' : ''}${num.toFixed(1)}%`;
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleTimeString('es-MX');
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg">
              <Activity className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Métricas en Tiempo Real</h1>
              <p className="text-gray-600">Monitoreo en vivo del rendimiento y actividad de usuarios</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button 
              onClick={toggleLiveMode}
              variant={isLive ? "default" : "outline"}
              className="flex items-center space-x-2"
              tabIndex={0}
              aria-label={isLive ? "Desactivar modo en vivo" : "Activar modo en vivo"}
            >
              <div className={cn(
                "w-2 h-2 rounded-full",
                isLive ? "bg-green-500 animate-pulse" : "bg-gray-400"
              )}></div>
              <span>{isLive ? 'En Vivo' : 'Pausado'}</span>
            </Button>
            <Button 
              onClick={() => loadRealTimeData()}
              variant="outline"
              className="flex items-center space-x-2"
              tabIndex={0}
              aria-label="Actualizar datos"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Actualizar</span>
            </Button>
          </div>
        </div>

        {/* Métricas principales en tiempo real */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {metrics.map((metric) => (
            <Card key={metric.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">{metric.name}</span>
                  <Badge className={cn("text-xs", getMetricStatusColor(metric.status))}>
                    {metric.status === 'normal' ? 'Normal' :
                     metric.status === 'warning' ? 'Advertencia' : 'Crítico'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-2xl font-bold text-gray-900">
                    {metric.category === 'response_time' || metric.category === 'error_rate' 
                      ? metric.value.toFixed(1)
                      : formatNumber(metric.value)}
                    {metric.category === 'response_time' && 'ms'}
                    {metric.category === 'error_rate' && '%'}
                  </p>
                  <div className="flex items-center space-x-1">
                    {metric.trend === 'up' ? (
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    ) : metric.trend === 'down' ? (
                      <TrendingDown className="w-4 h-4 text-red-600" />
                    ) : (
                      <Minus className="w-4 h-4 text-gray-400" />
                    )}
                    <span className={cn(
                      "text-sm font-medium",
                      metric.changePercentage > 0 ? "text-green-600" :
                      metric.changePercentage < 0 ? "text-red-600" : "text-gray-600"
                    )}>
                      {formatPercentage(metric.changePercentage)}
                    </span>
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Última actualización: {formatDate(metric.timestamp)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Filtros */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Ventana de Tiempo</label>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                tabIndex={0}
                aria-label="Ventana de tiempo"
              >
                <option value="1m">Último minuto</option>
                <option value="5m">Últimos 5 minutos</option>
                <option value="15m">Últimos 15 minutos</option>
                <option value="1h">Última hora</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs de navegación */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="mb-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" tabIndex={0} aria-label="Vista general">Vista General</TabsTrigger>
          <TabsTrigger value="events" tabIndex={0} aria-label="Eventos">Eventos</TabsTrigger>
          <TabsTrigger value="users" tabIndex={0} aria-label="Usuarios">Usuarios</TabsTrigger>
          <TabsTrigger value="performance" tabIndex={0} aria-label="Rendimiento">Rendimiento</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico de actividad */}
            <Card>
              <CardHeader>
                <CardTitle>Actividad en Tiempo Real</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Activity className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600">Gráfico de actividad</p>
                    <p className="text-xs text-gray-500">Datos en tiempo real</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Resumen de eventos */}
            <Card>
              <CardHeader>
                <CardTitle>Resumen de Eventos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium">Inicios de sesión</span>
                    </div>
                    <span className="font-bold">{liveEvents.filter(e => e.type === 'user_login').length}</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium">Lecciones completadas</span>
                    </div>
                    <span className="font-bold">{liveEvents.filter(e => e.type === 'lesson_completed').length}</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                      <span className="text-sm font-medium">Errores</span>
                    </div>
                    <span className="font-bold">{liveEvents.filter(e => e.type === 'error').length}</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Eye className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-medium">Vistas de página</span>
                    </div>
                    <span className="font-bold">{liveEvents.filter(e => e.type === 'page_view').length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="events" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Eventos en Tiempo Real</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {liveEvents.map((event) => (
                  <div key={event.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className={cn(
                      "w-3 h-3 rounded-full",
                      event.severity === 'success' ? "bg-green-500" :
                      event.severity === 'info' ? "bg-blue-500" :
                      event.severity === 'warning' ? "bg-yellow-500" : "bg-red-500"
                    )}></div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">{event.description}</span>
                        <span className="text-xs text-gray-500">{formatDate(event.timestamp)}</span>
                      </div>
                      {event.userId && (
                        <div className="text-xs text-gray-600">Usuario: {event.userId}</div>
                      )}
                    </div>
                    <Badge className={cn("text-xs", getEventSeverityColor(event.severity))}>
                      {event.severity === 'success' ? 'Éxito' :
                       event.severity === 'info' ? 'Info' :
                       event.severity === 'warning' ? 'Advertencia' : 'Error'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Usuarios Activos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="font-medium">{user.username}</div>
                        <div className="text-sm text-gray-600">{user.currentPage}</div>
                        <div className="text-xs text-gray-500">
                          {user.deviceType} • {user.location}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-medium">{formatTime(user.sessionDuration)}</div>
                      <div className="text-sm text-gray-600">
                        Última actividad: {formatDate(user.lastActivity)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {user.actions.length} acciones
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Métricas de rendimiento */}
            <Card>
              <CardHeader>
                <CardTitle>Métricas de Rendimiento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {performanceMetrics.map((metric) => (
                    <div key={metric.metric} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">{metric.metric}</span>
                        <Badge className={cn("text-xs", getPerformanceStatusColor(metric.status))}>
                          {metric.status === 'good' ? 'Bueno' :
                           metric.status === 'warning' ? 'Advertencia' : 'Crítico'}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span>Actual: {metric.current}</span>
                        <span>Promedio: {metric.average}</span>
                        <span>Límite: {metric.threshold}</span>
                      </div>
                      
                      <div className="mt-2">
                        <Progress 
                          value={(metric.current / metric.threshold) * 100} 
                          className="h-2"
                        />
                      </div>
                      
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-600">
                          Tendencia: {metric.trend === 'improving' ? 'Mejorando' :
                                     metric.trend === 'stable' ? 'Estable' : 'Declinando'}
                        </span>
                        <div className="flex items-center space-x-1">
                          {metric.trend === 'improving' ? (
                            <TrendingUp className="w-3 h-3 text-green-600" />
                          ) : metric.trend === 'declining' ? (
                            <TrendingDown className="w-3 h-3 text-red-600" />
                          ) : (
                            <Minus className="w-3 h-3 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Alertas y notificaciones */}
            <Card>
              <CardHeader>
                <CardTitle>Alertas del Sistema</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-600" />
                      <span className="font-medium text-yellow-800">Uso de CPU elevado</span>
                    </div>
                    <p className="text-sm text-yellow-700">
                      El uso de CPU ha aumentado al 65% en los últimos 5 minutos
                    </p>
                  </div>
                  
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="font-medium text-green-800">Rendimiento óptimo</span>
                    </div>
                    <p className="text-sm text-green-700">
                      Todos los sistemas funcionando correctamente
                    </p>
                  </div>
                  
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Info className="w-4 h-4 text-blue-600" />
                      <span className="font-medium text-blue-800">Pico de usuarios</span>
                    </div>
                    <p className="text-sm text-blue-700">
                      Aumento del 15% en usuarios activos en la última hora
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
