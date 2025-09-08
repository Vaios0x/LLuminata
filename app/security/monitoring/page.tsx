'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Server,
  Database,
  Network,
  Wifi,
  WifiOff,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Zap,
  Target,
  Crosshair,
  MapPin,
  Calendar,
  Timer,
  RotateCcw,
  Play,
  Pause,
  Square,
  Maximize,
  Minimize,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  ArrowLeft,
  Plus,
  Minus,
  Shield,
  ShieldCheck,
  ShieldX,
  ShieldAlert,
  Ban,
  Key,
  KeyOff,
  TimerOff,
  TimerReset,
  GaugeIcon,
  Speed,
  ActivitySquare,
  BarChart,
  PieChart,
  LineChart,
  AreaChart,
  AlertOctagon,
  Hash,
  Fingerprint,
  LockKeyhole,
  UnlockKeyhole,
  Code,
  UserCheck,
  UserX,
  CheckCircle as CheckCircleIcon,
  XCircle,
  Loader2,
  Save,
  Edit,
  Copy,
  ExternalLink,
  Link,
  Unlink,
  Bell,
  Mail,
  Phone,
  Video as VideoIcon,
  Image,
  Monitor,
  Smartphone,
  Tablet,
  Cpu,
  HardDrive,
  Maximize2,
  Minimize2,
  MousePointer,
  Scroll,
  Move,
  Eye,
  EyeOff,
  Filter,
  Search,
  Settings,
  Trash2,
  Archive,
  FileText,
  Lock,
  Unlock,
  Info,
  Users,
  Globe,
  Download,
  Share,
  XCircle as XCircleIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SecurityAlert {
  id: string;
  timestamp: Date;
  type: 'threat' | 'anomaly' | 'system' | 'performance' | 'access';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  source: string;
  status: 'active' | 'acknowledged' | 'resolved';
  acknowledgedBy?: string;
  resolvedAt?: Date;
  metadata: any;
}

interface SystemMetrics {
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  activeConnections: number;
  failedRequests: number;
  responseTime: number;
  uptime: number;
}

interface SecurityMetrics {
  activeThreats: number;
  blockedAttacks: number;
  suspiciousActivities: number;
  failedLogins: number;
  successfulLogins: number;
  dataAccessAttempts: number;
  systemChanges: number;
  complianceScore: number;
}

interface MonitoringRule {
  id: string;
  name: string;
  description: string;
  type: 'threshold' | 'pattern' | 'anomaly' | 'blacklist';
  isActive: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  conditions: any;
  actions: string[];
  lastTriggered?: Date;
  triggerCount: number;
}

export default function SecurityMonitoringPage() {
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null);
  const [securityMetrics, setSecurityMetrics] = useState<SecurityMetrics | null>(null);
  const [monitoringRules, setMonitoringRules] = useState<MonitoringRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMonitoringActive, setIsMonitoringActive] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'alerts' | 'metrics' | 'rules' | 'settings'>('overview');
  const [selectedAlert, setSelectedAlert] = useState<SecurityAlert | null>(null);
  const [filters, setFilters] = useState({
    severity: 'all',
    type: 'all',
    status: 'all',
    timeRange: '24h'
  });

  // Datos de ejemplo
  const mockAlerts: SecurityAlert[] = [
    {
      id: 'alert_1',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      type: 'threat',
      severity: 'high',
      title: 'Ataque de fuerza bruta detectado',
      description: 'Múltiples intentos de inicio de sesión desde IP sospechosa',
      source: '203.0.113.45',
      status: 'active',
      metadata: { attempts: 15, timeWindow: '5 minutes', target: '/api/auth/login' }
    },
    {
      id: 'alert_2',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      type: 'anomaly',
      severity: 'medium',
      title: 'Actividad inusual detectada',
      description: 'Patrón de acceso anómalo en cuenta de usuario',
      source: 'user_456',
      status: 'acknowledged',
      acknowledgedBy: 'admin_1',
      metadata: { anomalyScore: 0.78, riskFactors: ['unusual_time', 'new_location'] }
    },
    {
      id: 'alert_3',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      type: 'system',
      severity: 'low',
      title: 'Alto uso de CPU',
      description: 'El servidor está experimentando un uso elevado de CPU',
      source: 'server_01',
      status: 'resolved',
      resolvedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
      metadata: { cpuUsage: 85, memoryUsage: 72, diskUsage: 45 }
    }
  ];

  const mockSystemMetrics: SystemMetrics = {
    cpu: 45,
    memory: 68,
    disk: 72,
    network: 23,
    activeConnections: 156,
    failedRequests: 12,
    responseTime: 245,
    uptime: 99.8
  };

  const mockSecurityMetrics: SecurityMetrics = {
    activeThreats: 3,
    blockedAttacks: 89,
    suspiciousActivities: 7,
    failedLogins: 23,
    successfulLogins: 156,
    dataAccessAttempts: 45,
    systemChanges: 8,
    complianceScore: 94.5
  };

  const mockMonitoringRules: MonitoringRule[] = [
    {
      id: 'rule_1',
      name: 'Detección de fuerza bruta',
      description: 'Alerta cuando se detectan múltiples intentos de login fallidos',
      type: 'threshold',
      isActive: true,
      severity: 'high',
      conditions: { maxAttempts: 5, timeWindow: 300 },
      actions: ['block_ip', 'send_alert', 'log_event'],
      lastTriggered: new Date(Date.now() - 30 * 60 * 1000),
      triggerCount: 12
    },
    {
      id: 'rule_2',
      name: 'Detección de anomalías',
      description: 'Identifica patrones de comportamiento anómalos',
      type: 'anomaly',
      isActive: true,
      severity: 'medium',
      conditions: { threshold: 0.7, window: 3600 },
      actions: ['flag_user', 'send_alert'],
      lastTriggered: new Date(Date.now() - 2 * 60 * 60 * 1000),
      triggerCount: 5
    }
  ];

  useEffect(() => {
    loadMonitoringData();
    const interval = setInterval(loadMonitoringData, 30000); // Actualizar cada 30 segundos
    return () => clearInterval(interval);
  }, []);

  const loadMonitoringData = async () => {
    try {
      setIsLoading(true);
      // Simulando carga de datos
      await new Promise(resolve => setTimeout(resolve, 500));
      setAlerts(mockAlerts);
      setSystemMetrics(mockSystemMetrics);
      setSecurityMetrics(mockSecurityMetrics);
      setMonitoringRules(mockMonitoringRules);
    } catch (error) {
      console.error('Error loading monitoring data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-red-600 bg-red-100';
      case 'acknowledged': return 'text-yellow-600 bg-yellow-100';
      case 'resolved': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getAlertTypeIcon = (type: string) => {
    switch (type) {
      case 'threat': return <ShieldAlert className="w-4 h-4" />;
      case 'anomaly': return <AlertTriangle className="w-4 h-4" />;
      case 'system': return <Server className="w-4 h-4" />;
      case 'performance': return <Activity className="w-4 h-4" />;
      case 'access': return <UserCheck className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMetricColor = (value: number, thresholds: { warning: number; critical: number }) => {
    if (value >= thresholds.critical) return 'text-red-600';
    if (value >= thresholds.warning) return 'text-yellow-600';
    return 'text-green-600';
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center p-8">
          <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
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
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
              <Activity className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Monitoreo de Seguridad</h1>
              <p className="text-gray-600">Sistema de monitoreo en tiempo real y alertas de seguridad</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button 
              onClick={() => setIsMonitoringActive(!isMonitoringActive)}
              variant={isMonitoringActive ? "default" : "outline"}
              className="flex items-center space-x-2"
              tabIndex={0}
              aria-label={isMonitoringActive ? "Pausar monitoreo" : "Reanudar monitoreo"}
            >
              {isMonitoringActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isMonitoringActive ? 'Pausar' : 'Reanudar'}</span>
            </Button>
            <Button 
              onClick={() => loadMonitoringData()}
              variant="outline"
              className="flex items-center space-x-2"
              tabIndex={0}
              aria-label="Actualizar datos de monitoreo"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Actualizar</span>
            </Button>
          </div>
        </div>

        {/* Estado del sistema */}
        {systemMetrics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Cpu className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium">CPU</span>
                </div>
                <p className={cn("text-2xl font-bold mt-2", getMetricColor(systemMetrics.cpu, { warning: 70, critical: 90 }))}>
                  {systemMetrics.cpu}%
                </p>
                <Progress value={systemMetrics.cpu} className="mt-2" />
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <HardDrive className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium">Memoria</span>
                </div>
                <p className={cn("text-2xl font-bold mt-2", getMetricColor(systemMetrics.memory, { warning: 80, critical: 95 }))}>
                  {systemMetrics.memory}%
                </p>
                <Progress value={systemMetrics.memory} className="mt-2" />
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Database className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-medium">Disco</span>
                </div>
                <p className={cn("text-2xl font-bold mt-2", getMetricColor(systemMetrics.disk, { warning: 85, critical: 95 }))}>
                  {systemMetrics.disk}%
                </p>
                <Progress value={systemMetrics.disk} className="mt-2" />
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Network className="w-5 h-5 text-orange-600" />
                  <span className="text-sm font-medium">Red</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {systemMetrics.activeConnections}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  Conexiones activas
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Tabs de navegación */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Resumen', icon: BarChart },
              { id: 'alerts', label: 'Alertas', icon: AlertTriangle },
              { id: 'metrics', label: 'Métricas', icon: Activity },
              { id: 'rules', label: 'Reglas', icon: Settings },
              { id: 'settings', label: 'Configuración', icon: Settings }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm",
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  )}
                  tabIndex={0}
                  aria-label={`Ver ${tab.label}`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Contenido de tabs */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Estado general */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-green-600" />
                <span>Estado General del Sistema</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-medium mb-2">Uptime del Sistema</h4>
                  <div className="text-3xl font-bold text-green-600">{systemMetrics?.uptime}%</div>
                  <p className="text-sm text-gray-600 mt-1">Excelente disponibilidad</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Tiempo de Respuesta</h4>
                  <div className="text-3xl font-bold text-blue-600">{systemMetrics?.responseTime}ms</div>
                  <p className="text-sm text-gray-600 mt-1">Rendimiento óptimo</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Alertas Activas</h4>
                  <div className="text-3xl font-bold text-orange-600">
                    {alerts.filter(a => a.status === 'active').length}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Requieren atención</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Métricas de seguridad */}
          {securityMetrics && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <span>Métricas de Seguridad</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{securityMetrics.activeThreats}</div>
                    <div className="text-sm text-gray-600">Amenazas Activas</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{securityMetrics.blockedAttacks}</div>
                    <div className="text-sm text-gray-600">Ataques Bloqueados</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">{securityMetrics.suspiciousActivities}</div>
                    <div className="text-sm text-gray-600">Actividades Sospechosas</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{securityMetrics.complianceScore}%</div>
                    <div className="text-sm text-gray-600">Cumplimiento</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {activeTab === 'alerts' && (
        <div className="space-y-4">
          {/* Filtros */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-4">
                <select 
                  value={filters.severity}
                  onChange={(e) => setFilters({...filters, severity: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-md"
                  tabIndex={0}
                  aria-label="Filtrar por severidad"
                >
                  <option value="all">Todas las severidades</option>
                  <option value="critical">Crítico</option>
                  <option value="high">Alta</option>
                  <option value="medium">Media</option>
                  <option value="low">Baja</option>
                </select>
                <select 
                  value={filters.type}
                  onChange={(e) => setFilters({...filters, type: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-md"
                  tabIndex={0}
                  aria-label="Filtrar por tipo"
                >
                  <option value="all">Todos los tipos</option>
                  <option value="threat">Amenaza</option>
                  <option value="anomaly">Anomalía</option>
                  <option value="system">Sistema</option>
                  <option value="performance">Rendimiento</option>
                </select>
                <select 
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-md"
                  tabIndex={0}
                  aria-label="Filtrar por estado"
                >
                  <option value="all">Todos los estados</option>
                  <option value="active">Activo</option>
                  <option value="acknowledged">Reconocido</option>
                  <option value="resolved">Resuelto</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Lista de alertas */}
          {alerts.map((alert) => (
            <Card key={alert.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {getAlertTypeIcon(alert.type)}
                    <div>
                      <h3 className="font-semibold">{alert.title}</h3>
                      <p className="text-sm text-gray-600">
                        {formatDate(alert.timestamp)} • {alert.source}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={cn("text-xs", getSeverityColor(alert.severity))}>
                      {alert.severity === 'critical' ? 'Crítico' :
                       alert.severity === 'high' ? 'Alta' :
                       alert.severity === 'medium' ? 'Media' : 'Baja'}
                    </Badge>
                    <Badge className={cn("text-xs", getStatusColor(alert.status))}>
                      {alert.status === 'active' ? 'Activo' :
                       alert.status === 'acknowledged' ? 'Reconocido' : 'Resuelto'}
                    </Badge>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-4">{alert.description}</p>
                
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="text-sm text-gray-600">
                    ID: {alert.id}
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setSelectedAlert(alert)}
                      tabIndex={0}
                      aria-label="Ver detalles de la alerta"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      Detalles
                    </Button>
                    {alert.status === 'active' && (
                      <Button 
                        size="sm"
                        tabIndex={0}
                        aria-label="Reconocer alerta"
                      >
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Reconocer
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'metrics' && (
        <div className="space-y-6">
          {/* Métricas del sistema */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Server className="w-5 h-5 text-blue-600" />
                <span>Métricas del Sistema</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-4">Uso de Recursos</h4>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>CPU</span>
                        <span>{systemMetrics?.cpu}%</span>
                      </div>
                      <Progress value={systemMetrics?.cpu || 0} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Memoria</span>
                        <span>{systemMetrics?.memory}%</span>
                      </div>
                      <Progress value={systemMetrics?.memory || 0} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Disco</span>
                        <span>{systemMetrics?.disk}%</span>
                      </div>
                      <Progress value={systemMetrics?.disk || 0} className="h-2" />
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-4">Rendimiento de Red</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm">Conexiones Activas</span>
                      <span className="font-medium">{systemMetrics?.activeConnections}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Solicitudes Fallidas</span>
                      <span className="font-medium text-red-600">{systemMetrics?.failedRequests}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Tiempo de Respuesta</span>
                      <span className="font-medium">{systemMetrics?.responseTime}ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Uptime</span>
                      <span className="font-medium text-green-600">{systemMetrics?.uptime}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'rules' && (
        <div className="space-y-4">
          {monitoringRules.map((rule) => (
            <Card key={rule.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Settings className="w-5 h-5 text-blue-600" />
                    <div>
                      <h3 className="font-semibold">{rule.name}</h3>
                      <p className="text-sm text-gray-600">{rule.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={cn("text-xs", getSeverityColor(rule.severity))}>
                      {rule.severity === 'critical' ? 'Crítico' :
                       rule.severity === 'high' ? 'Alta' :
                       rule.severity === 'medium' ? 'Media' : 'Baja'}
                    </Badge>
                    <Badge variant={rule.isActive ? "default" : "secondary"} className="text-xs">
                      {rule.isActive ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <span className="text-sm text-gray-600">Tipo:</span>
                    <div className="font-medium capitalize">{rule.type.replace('_', ' ')}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Activaciones:</span>
                    <div className="font-medium">{rule.triggerCount}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Última Activación:</span>
                    <div className="font-medium">
                      {rule.lastTriggered ? formatDate(rule.lastTriggered) : 'Nunca'}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="text-sm text-gray-600">
                    ID: {rule.id}
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      tabIndex={0}
                      aria-label="Editar regla"
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Editar
                    </Button>
                    <Button 
                      size="sm"
                      variant={rule.isActive ? "outline" : "default"}
                      tabIndex={0}
                      aria-label={rule.isActive ? "Desactivar regla" : "Activar regla"}
                    >
                      {rule.isActive ? <Pause className="w-3 h-3 mr-1" /> : <Play className="w-3 h-3 mr-1" />}
                      {rule.isActive ? 'Desactivar' : 'Activar'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Monitoreo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Intervalo de Actualización</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                    <option value="10">10 segundos</option>
                    <option value="30" selected>30 segundos</option>
                    <option value="60">1 minuto</option>
                    <option value="300">5 minutos</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Umbrales de Alerta</label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-gray-600">CPU Crítico (%)</label>
                      <input type="number" defaultValue={90} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600">Memoria Crítica (%)</label>
                      <input type="number" defaultValue={95} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Notificaciones</label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" defaultChecked />
                      <span>Alertas críticas por email</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" defaultChecked />
                      <span>Notificaciones push</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      <span>Alertas por SMS</span>
                    </label>
                  </div>
                </div>
                <Button className="w-full">
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Configuración
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal de detalles de alerta */}
      {selectedAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Detalles de la Alerta</h3>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedAlert(null)}
                  tabIndex={0}
                  aria-label="Cerrar detalles"
                >
                  <XCircleIcon className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-medium mb-2">Información General</h5>
                    <div className="space-y-1 text-sm">
                      <div><strong>ID:</strong> {selectedAlert.id}</div>
                      <div><strong>Tipo:</strong> {selectedAlert.type}</div>
                      <div><strong>Severidad:</strong> {selectedAlert.severity}</div>
                      <div><strong>Estado:</strong> {selectedAlert.status}</div>
                    </div>
                  </div>
                  <div>
                    <h5 className="font-medium mb-2">Información Temporal</h5>
                    <div className="space-y-1 text-sm">
                      <div><strong>Creada:</strong> {formatDate(selectedAlert.timestamp)}</div>
                      {selectedAlert.acknowledgedBy && (
                        <div><strong>Reconocida por:</strong> {selectedAlert.acknowledgedBy}</div>
                      )}
                      {selectedAlert.resolvedAt && (
                        <div><strong>Resuelta:</strong> {formatDate(selectedAlert.resolvedAt)}</div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div>
                  <h5 className="font-medium mb-2">Descripción</h5>
                  <p className="text-sm text-gray-600">{selectedAlert.description}</p>
                </div>
                
                <div>
                  <h5 className="font-medium mb-2">Metadatos</h5>
                  <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                    {JSON.stringify(selectedAlert.metadata, null, 2)}
                  </pre>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t">
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline">
                    <Download className="w-3 h-3 mr-1" />
                    Exportar
                  </Button>
                  <Button size="sm" variant="outline">
                    <Share className="w-3 h-3 mr-1" />
                    Compartir
                  </Button>
                  {selectedAlert.status === 'active' && (
                    <Button size="sm">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Reconocer
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
