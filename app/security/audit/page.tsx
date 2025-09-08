'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Users, 
  Globe,
  Activity,
  BarChart3,
  Download,
  Share,
  RefreshCw,
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
  UserCheck,
  UserX,
  Server,
  Database,
  Network,
  Wifi,
  WifiOff,
  AlertCircle,
  Info,
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
  ShieldCheck,
  ShieldX,
  ShieldAlert,
  Ban,
  Key,
  KeyRound,
  TimerOff,
  TimerReset,
  GaugeIcon,
  Gauge,
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
  UserCheck as UserCheckIcon,
  UserX as UserXIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
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
  Move
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SecurityEvent {
  id: string;
  timestamp: Date;
  type: 'login' | 'logout' | 'failed_login' | 'suspicious_activity' | 'data_access' | 'system_change' | 'error';
  severity: 'low' | 'medium' | 'high' | 'critical';
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  location?: string;
  description: string;
  details: any;
  resolved: boolean;
  autoResolved: boolean;
}

interface SecurityMetrics {
  totalEvents: number;
  criticalEvents: number;
  highSeverityEvents: number;
  mediumSeverityEvents: number;
  lowSeverityEvents: number;
  resolvedEvents: number;
  pendingEvents: number;
  suspiciousActivities: number;
  failedLogins: number;
  successfulLogins: number;
  dataBreaches: number;
  systemErrors: number;
}

interface ThreatAnalysis {
  id: string;
  timestamp: Date;
  threatType: 'brute_force' | 'sql_injection' | 'xss' | 'csrf' | 'ddos' | 'malware' | 'phishing';
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: string;
  target: string;
  description: string;
  status: 'detected' | 'investigating' | 'mitigated' | 'resolved';
  confidence: number;
  impact: 'low' | 'medium' | 'high';
  recommendations: string[];
}

interface AuditReport {
  id: string;
  title: string;
  generatedAt: Date;
  period: {
    start: Date;
    end: Date;
  };
  summary: {
    totalEvents: number;
    criticalIssues: number;
    resolvedIssues: number;
    complianceScore: number;
  };
  findings: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  recommendations: string[];
  status: 'draft' | 'final' | 'archived';
}

export default function SecurityAuditPage() {
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null);
  const [threatAnalysis, setThreatAnalysis] = useState<ThreatAnalysis[]>([]);
  const [auditReports, setAuditReports] = useState<AuditReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'events' | 'threats' | 'reports' | 'settings'>('overview');
  const [selectedEvent, setSelectedEvent] = useState<SecurityEvent | null>(null);
  const [selectedThreat, setSelectedThreat] = useState<ThreatAnalysis | null>(null);
  const [filters, setFilters] = useState({
    severity: 'all',
    type: 'all',
    status: 'all',
    dateRange: '7d'
  });

  // Datos de ejemplo
  const mockSecurityEvents: SecurityEvent[] = [
    {
      id: 'event_1',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      type: 'failed_login',
      severity: 'medium',
      userId: 'user_123',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      location: 'Ciudad de México, MX',
      description: 'Múltiples intentos de inicio de sesión fallidos',
      details: { attempts: 5, timeWindow: '10 minutes' },
      resolved: false,
      autoResolved: false
    },
    {
      id: 'event_2',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      type: 'suspicious_activity',
      severity: 'high',
      userId: 'user_456',
      ipAddress: '203.0.113.45',
      userAgent: 'Mozilla/5.0 (Unknown)',
      location: 'Unknown',
      description: 'Actividad sospechosa detectada en cuenta de usuario',
      details: { anomalyScore: 0.85, riskFactors: ['unusual_time', 'unknown_device'] },
      resolved: true,
      autoResolved: true
    },
    {
      id: 'event_3',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
      type: 'data_access',
      severity: 'low',
      userId: 'user_789',
      ipAddress: '10.0.0.50',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      location: 'Guadalajara, MX',
      description: 'Acceso a datos sensibles del usuario',
      details: { dataType: 'personal_info', accessMethod: 'api' },
      resolved: false,
      autoResolved: false
    }
  ];

  const mockMetrics: SecurityMetrics = {
    totalEvents: 156,
    criticalEvents: 3,
    highSeverityEvents: 12,
    mediumSeverityEvents: 45,
    lowSeverityEvents: 96,
    resolvedEvents: 134,
    pendingEvents: 22,
    suspiciousActivities: 8,
    failedLogins: 67,
    successfulLogins: 89,
    dataBreaches: 0,
    systemErrors: 15
  };

  const mockThreatAnalysis: ThreatAnalysis[] = [
    {
      id: 'threat_1',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
      threatType: 'brute_force',
      severity: 'high',
      source: '203.0.113.45',
      target: '/api/auth/login',
      description: 'Ataque de fuerza bruta detectado en endpoint de autenticación',
      status: 'mitigated',
      confidence: 0.92,
      impact: 'high',
      recommendations: [
        'Implementar rate limiting más estricto',
        'Activar autenticación de dos factores',
        'Monitorear IPs sospechosas'
      ]
    },
    {
      id: 'threat_2',
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
      threatType: 'sql_injection',
      severity: 'critical',
      source: '192.168.1.100',
      target: '/api/users/search',
      description: 'Intento de inyección SQL detectado en búsqueda de usuarios',
      status: 'resolved',
      confidence: 0.98,
      impact: 'high',
      recommendations: [
        'Validar y sanitizar todas las entradas',
        'Usar consultas preparadas',
        'Implementar WAF'
      ]
    }
  ];

  const mockAuditReports: AuditReport[] = [
    {
      id: 'report_1',
      title: 'Auditoría de Seguridad Mensual - Enero 2024',
      generatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      period: {
        start: new Date('2024-01-01'),
        end: new Date('2024-01-31')
      },
      summary: {
        totalEvents: 1247,
        criticalIssues: 5,
        resolvedIssues: 1189,
        complianceScore: 94.5
      },
      findings: {
        critical: 5,
        high: 23,
        medium: 67,
        low: 89
      },
      recommendations: [
        'Mejorar el sistema de detección de amenazas',
        'Implementar auditoría continua',
        'Capacitar al equipo en seguridad'
      ],
      status: 'final'
    }
  ];

  useEffect(() => {
    loadSecurityData();
  }, []);

  const loadSecurityData = async () => {
    try {
      setIsLoading(true);
      // Simulando carga de datos
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSecurityEvents(mockSecurityEvents);
      setMetrics(mockMetrics);
      setThreatAnalysis(mockThreatAnalysis);
      setAuditReports(mockAuditReports);
    } catch (error) {
      console.error('Error loading security data:', error);
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
      case 'resolved': return 'text-green-600 bg-green-100';
      case 'investigating': return 'text-blue-600 bg-blue-100';
      case 'mitigated': return 'text-yellow-600 bg-yellow-100';
      case 'detected': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'login': return <UserCheck className="w-4 h-4" />;
      case 'logout': return <UserX className="w-4 h-4" />;
      case 'failed_login': return <AlertTriangle className="w-4 h-4" />;
      case 'suspicious_activity': return <ShieldAlert className="w-4 h-4" />;
      case 'data_access': return <Database className="w-4 h-4" />;
      case 'system_change': return <Settings className="w-4 h-4" />;
      case 'error': return <AlertCircle className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
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
            <div className="p-3 bg-gradient-to-r from-red-500 to-orange-600 rounded-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Auditoría de Seguridad</h1>
              <p className="text-gray-600">Monitoreo y análisis de eventos de seguridad en tiempo real</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button 
              onClick={() => loadSecurityData()}
              variant="outline"
              className="flex items-center space-x-2"
              tabIndex={0}
              aria-label="Actualizar datos de seguridad"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Actualizar</span>
            </Button>
            <Button 
              className="flex items-center space-x-2"
              tabIndex={0}
              aria-label="Generar nuevo reporte"
            >
              <FileText className="w-4 h-4" />
              <span>Nuevo Reporte</span>
            </Button>
          </div>
        </div>

        {/* Métricas de seguridad */}
        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <span className="text-sm font-medium">Eventos Críticos</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {metrics.criticalEvents}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  {((metrics.criticalEvents / metrics.totalEvents) * 100).toFixed(1)}% del total
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <ShieldAlert className="w-5 h-5 text-orange-600" />
                  <span className="text-sm font-medium">Alta Severidad</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {metrics.highSeverityEvents}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  {((metrics.highSeverityEvents / metrics.totalEvents) * 100).toFixed(1)}% del total
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium">Resueltos</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {metrics.resolvedEvents}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  {((metrics.resolvedEvents / metrics.totalEvents) * 100).toFixed(1)}% del total
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium">Pendientes</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {metrics.pendingEvents}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  Requieren atención
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
              { id: 'overview', label: 'Resumen', icon: BarChart3 },
              { id: 'events', label: 'Eventos', icon: Activity },
              { id: 'threats', label: 'Amenazas', icon: ShieldAlert },
              { id: 'reports', label: 'Reportes', icon: FileText },
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
                      ? "border-red-500 text-red-600"
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
          {/* Estado general de seguridad */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-green-600" />
                <span>Estado General de Seguridad</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-medium mb-2">Puntuación de Seguridad</h4>
                  <div className="text-3xl font-bold text-green-600">85/100</div>
                  <Progress value={85} className="mt-2" />
                  <p className="text-sm text-gray-600 mt-1">Buen estado general</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Amenazas Activas</h4>
                  <div className="text-3xl font-bold text-orange-600">2</div>
                  <p className="text-sm text-gray-600 mt-1">Requieren atención inmediata</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Última Auditoría</h4>
                  <div className="text-lg font-medium">Hace 2 días</div>
                  <p className="text-sm text-gray-600 mt-1">Próxima: en 5 días</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Gráfico de eventos por severidad */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <PieChart className="w-5 h-5 text-blue-600" />
                <span>Distribución de Eventos por Severidad</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  { label: 'Críticos', count: metrics?.criticalEvents || 0, color: 'bg-red-500', percentage: 2 },
                  { label: 'Alta', count: metrics?.highSeverityEvents || 0, color: 'bg-orange-500', percentage: 8 },
                  { label: 'Media', count: metrics?.mediumSeverityEvents || 0, color: 'bg-yellow-500', percentage: 29 },
                  { label: 'Baja', count: metrics?.lowSeverityEvents || 0, color: 'bg-green-500', percentage: 61 }
                ].map((item, index) => (
                  <div key={index} className="text-center">
                    <div className={cn("w-16 h-16 rounded-full mx-auto mb-2 flex items-center justify-center", item.color)}>
                      <span className="text-white font-bold">{item.count}</span>
                    </div>
                    <div className="font-medium">{item.label}</div>
                    <div className="text-sm text-gray-600">{item.percentage}%</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'events' && (
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
                  <option value="login">Login</option>
                  <option value="failed_login">Login fallido</option>
                  <option value="suspicious_activity">Actividad sospechosa</option>
                  <option value="data_access">Acceso a datos</option>
                </select>
                <select 
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-md"
                  tabIndex={0}
                  aria-label="Filtrar por estado"
                >
                  <option value="all">Todos los estados</option>
                  <option value="resolved">Resuelto</option>
                  <option value="pending">Pendiente</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Lista de eventos */}
          {securityEvents.map((event) => (
            <Card key={event.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {getEventTypeIcon(event.type)}
                    <div>
                      <h3 className="font-semibold">{event.description}</h3>
                      <p className="text-sm text-gray-600">
                        {formatDate(event.timestamp)} • {event.ipAddress} • {event.location}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={cn("text-xs", getSeverityColor(event.severity))}>
                      {event.severity === 'critical' ? 'Crítico' :
                       event.severity === 'high' ? 'Alta' :
                       event.severity === 'medium' ? 'Media' : 'Baja'}
                    </Badge>
                    <Badge variant={event.resolved ? "default" : "secondary"} className="text-xs">
                      {event.resolved ? 'Resuelto' : 'Pendiente'}
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <span className="text-sm text-gray-600">Usuario:</span>
                    <div className="font-medium">{event.userId || 'Anónimo'}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">IP:</span>
                    <div className="font-medium">{event.ipAddress}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Auto-resuelto:</span>
                    <div className="font-medium">{event.autoResolved ? 'Sí' : 'No'}</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="text-sm text-gray-600">
                    ID: {event.id}
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setSelectedEvent(event)}
                      tabIndex={0}
                      aria-label="Ver detalles del evento"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      Detalles
                    </Button>
                    {!event.resolved && (
                      <Button 
                        size="sm"
                        tabIndex={0}
                        aria-label="Marcar como resuelto"
                      >
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Resolver
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'threats' && (
        <div className="space-y-4">
          {threatAnalysis.map((threat) => (
            <Card key={threat.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <ShieldAlert className="w-5 h-5 text-red-600" />
                    <div>
                      <h3 className="font-semibold">{threat.description}</h3>
                      <p className="text-sm text-gray-600">
                        {formatDate(threat.timestamp)} • {threat.source} → {threat.target}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={cn("text-xs", getSeverityColor(threat.severity))}>
                      {threat.severity === 'critical' ? 'Crítico' :
                       threat.severity === 'high' ? 'Alta' :
                       threat.severity === 'medium' ? 'Media' : 'Baja'}
                    </Badge>
                    <Badge className={cn("text-xs", getStatusColor(threat.status))}>
                      {threat.status === 'detected' ? 'Detectado' :
                       threat.status === 'investigating' ? 'Investigando' :
                       threat.status === 'mitigated' ? 'Mitigado' : 'Resuelto'}
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <span className="text-sm text-gray-600">Tipo:</span>
                    <div className="font-medium capitalize">{threat.threatType.replace('_', ' ')}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Confianza:</span>
                    <div className="font-medium">{Math.round(threat.confidence * 100)}%</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Impacto:</span>
                    <div className="font-medium capitalize">{threat.impact}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Recomendaciones:</span>
                    <div className="font-medium">{threat.recommendations.length}</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="text-sm text-gray-600">
                    ID: {threat.id}
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setSelectedThreat(threat)}
                      tabIndex={0}
                      aria-label="Ver detalles de la amenaza"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      Detalles
                    </Button>
                    <Button 
                      size="sm"
                      tabIndex={0}
                      aria-label="Aplicar mitigación"
                    >
                      <Shield className="w-3 h-3 mr-1" />
                      Mitigar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="space-y-4">
          {auditReports.map((report) => (
            <Card key={report.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <div>
                      <h3 className="font-semibold">{report.title}</h3>
                      <p className="text-sm text-gray-600">
                        Generado el {formatDate(report.generatedAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={report.status === 'final' ? "default" : "secondary"} className="text-xs">
                      {report.status === 'draft' ? 'Borrador' :
                       report.status === 'final' ? 'Final' : 'Archivado'}
                    </Badge>
                    <Badge className="text-xs bg-green-100 text-green-800">
                      {report.summary.complianceScore}% Cumplimiento
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <span className="text-sm text-gray-600">Eventos Totales:</span>
                    <div className="font-medium">{report.summary.totalEvents}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Issues Críticos:</span>
                    <div className="font-medium">{report.summary.criticalIssues}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Resueltos:</span>
                    <div className="font-medium">{report.summary.resolvedIssues}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Recomendaciones:</span>
                    <div className="font-medium">{report.recommendations.length}</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="text-sm text-gray-600">
                    Período: {formatDate(report.period.start)} - {formatDate(report.period.end)}
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      tabIndex={0}
                      aria-label="Ver reporte completo"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      Ver
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      tabIndex={0}
                      aria-label="Descargar reporte"
                    >
                      <Download className="w-3 h-3 mr-1" />
                      Descargar
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
              <CardTitle>Configuración de Auditoría</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Nivel de Logging</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                    <option value="minimal">Mínimo</option>
                    <option value="standard">Estándar</option>
                    <option value="detailed">Detallado</option>
                    <option value="debug">Debug</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Retención de Logs</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                    <option value="30">30 días</option>
                    <option value="90">90 días</option>
                    <option value="180">180 días</option>
                    <option value="365">1 año</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Alertas Automáticas</label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" defaultChecked />
                      <span>Eventos críticos</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" defaultChecked />
                      <span>Múltiples intentos de login</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      <span>Acceso desde nuevas ubicaciones</span>
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

      {/* Modal de detalles de evento */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Detalles del Evento</h3>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedEvent(null)}
                  tabIndex={0}
                  aria-label="Cerrar detalles"
                >
                  <XCircle className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-medium mb-2">Información General</h5>
                    <div className="space-y-1 text-sm">
                      <div><strong>ID:</strong> {selectedEvent.id}</div>
                      <div><strong>Tipo:</strong> {selectedEvent.type}</div>
                      <div><strong>Severidad:</strong> {selectedEvent.severity}</div>
                      <div><strong>Estado:</strong> {selectedEvent.resolved ? 'Resuelto' : 'Pendiente'}</div>
                    </div>
                  </div>
                  <div>
                    <h5 className="font-medium mb-2">Información de Usuario</h5>
                    <div className="space-y-1 text-sm">
                      <div><strong>Usuario:</strong> {selectedEvent.userId || 'Anónimo'}</div>
                      <div><strong>IP:</strong> {selectedEvent.ipAddress}</div>
                      <div><strong>Ubicación:</strong> {selectedEvent.location}</div>
                      <div><strong>Timestamp:</strong> {formatDate(selectedEvent.timestamp)}</div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h5 className="font-medium mb-2">Descripción</h5>
                  <p className="text-sm text-gray-600">{selectedEvent.description}</p>
                </div>
                
                <div>
                  <h5 className="font-medium mb-2">Detalles Técnicos</h5>
                  <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                    {JSON.stringify(selectedEvent.details, null, 2)}
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
                  {!selectedEvent.resolved && (
                    <Button size="sm">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Marcar como Resuelto
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de detalles de amenaza */}
      {selectedThreat && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Detalles de la Amenaza</h3>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedThreat(null)}
                  tabIndex={0}
                  aria-label="Cerrar detalles"
                >
                  <XCircle className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-medium mb-2">Información General</h5>
                    <div className="space-y-1 text-sm">
                      <div><strong>ID:</strong> {selectedThreat.id}</div>
                      <div><strong>Tipo:</strong> {selectedThreat.threatType}</div>
                      <div><strong>Severidad:</strong> {selectedThreat.severity}</div>
                      <div><strong>Estado:</strong> {selectedThreat.status}</div>
                    </div>
                  </div>
                  <div>
                    <h5 className="font-medium mb-2">Métricas</h5>
                    <div className="space-y-1 text-sm">
                      <div><strong>Confianza:</strong> {Math.round(selectedThreat.confidence * 100)}%</div>
                      <div><strong>Impacto:</strong> {selectedThreat.impact}</div>
                      <div><strong>Origen:</strong> {selectedThreat.source}</div>
                      <div><strong>Objetivo:</strong> {selectedThreat.target}</div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h5 className="font-medium mb-2">Descripción</h5>
                  <p className="text-sm text-gray-600">{selectedThreat.description}</p>
                </div>
                
                <div>
                  <h5 className="font-medium mb-2">Recomendaciones</h5>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {selectedThreat.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="text-blue-600 mt-1">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
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
                  <Button size="sm">
                    <Shield className="w-3 h-3 mr-1" />
                    Aplicar Mitigación
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
