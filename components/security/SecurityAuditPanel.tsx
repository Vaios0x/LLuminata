'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Minus
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Tipos para auditoría de seguridad
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
  mitigationSteps: string[];
  affectedUsers: number;
  estimatedDamage: string;
}

interface SecurityAuditPanelProps {
  userId?: string;
  isAdmin?: boolean;
  onEventResolved?: (eventId: string) => void;
  onThreatMitigated?: (threatId: string) => void;
  onExportReport?: (data: any) => void;
  className?: string;
}

// Datos de ejemplo para auditoría
const SAMPLE_SECURITY_EVENTS: SecurityEvent[] = [
  {
    id: 'evt_1',
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    type: 'failed_login',
    severity: 'medium',
    userId: 'user_123',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    location: 'Ciudad de México, MX',
    description: 'Intento de login fallido con credenciales incorrectas',
    details: { attempts: 3, username: 'admin@example.com' },
    resolved: false,
    autoResolved: false
  },
  {
    id: 'evt_2',
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    type: 'suspicious_activity',
    severity: 'high',
    userId: 'user_456',
    ipAddress: '203.0.113.45',
    userAgent: 'Mozilla/5.0 (Unknown)',
    location: 'Ubicación desconocida',
    description: 'Actividad sospechosa detectada: múltiples intentos de acceso',
    details: { pattern: 'rapid_requests', count: 50, timeframe: '5min' },
    resolved: false,
    autoResolved: false
  },
  {
    id: 'evt_3',
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    type: 'data_access',
    severity: 'low',
    userId: 'user_789',
    ipAddress: '10.0.0.15',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    location: 'Guadalajara, MX',
    description: 'Acceso a datos sensibles de estudiantes',
    details: { dataType: 'student_records', recordsAccessed: 25 },
    resolved: true,
    autoResolved: true
  },
  {
    id: 'evt_4',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    type: 'system_change',
    severity: 'medium',
    userId: 'admin_001',
    ipAddress: '172.16.0.10',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    location: 'Monterrey, MX',
    description: 'Configuración de seguridad modificada',
    details: { setting: 'password_policy', oldValue: '8_chars', newValue: '12_chars' },
    resolved: true,
    autoResolved: false
  },
  {
    id: 'evt_5',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    type: 'error',
    severity: 'critical',
    userId: undefined,
    ipAddress: undefined,
    userAgent: undefined,
    location: undefined,
    description: 'Error crítico en el sistema de autenticación',
    details: { error: 'AUTH_SERVICE_DOWN', duration: '15min', affectedUsers: 150 },
    resolved: true,
    autoResolved: true
  }
];

const SAMPLE_THREATS: ThreatAnalysis[] = [
  {
    id: 'threat_1',
    timestamp: new Date(Date.now() - 10 * 60 * 1000),
    threatType: 'brute_force',
    severity: 'high',
    source: '203.0.113.45',
    target: 'login_endpoint',
    description: 'Ataque de fuerza bruta detectado en el endpoint de login',
    status: 'investigating',
    mitigationSteps: [
      'Bloqueo temporal de IP',
      'Implementación de CAPTCHA',
      'Notificación a administradores'
    ],
    affectedUsers: 0,
    estimatedDamage: 'Bajo - Detectado tempranamente'
  },
  {
    id: 'threat_2',
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
    threatType: 'sql_injection',
    severity: 'critical',
    source: '198.51.100.23',
    target: 'search_api',
    description: 'Intento de inyección SQL en la API de búsqueda',
    status: 'mitigated',
    mitigationSteps: [
      'Filtrado de entrada mejorado',
      'Prepared statements implementados',
      'Monitoreo intensivo activado'
    ],
    affectedUsers: 0,
    estimatedDamage: 'Nulo - Bloqueado por WAF'
  }
];

export function SecurityAuditPanel({
  userId,
  isAdmin = false,
  onEventResolved,
  onThreatMitigated,
  onExportReport,
  className
}: SecurityAuditPanelProps) {
  const [events, setEvents] = useState<SecurityEvent[]>(SAMPLE_SECURITY_EVENTS);
  const [threats, setThreats] = useState<ThreatAnalysis[]>(SAMPLE_THREATS);
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    totalEvents: SAMPLE_SECURITY_EVENTS.length,
    criticalEvents: SAMPLE_SECURITY_EVENTS.filter(e => e.severity === 'critical').length,
    highSeverityEvents: SAMPLE_SECURITY_EVENTS.filter(e => e.severity === 'high').length,
    mediumSeverityEvents: SAMPLE_SECURITY_EVENTS.filter(e => e.severity === 'medium').length,
    lowSeverityEvents: SAMPLE_SECURITY_EVENTS.filter(e => e.severity === 'low').length,
    resolvedEvents: SAMPLE_SECURITY_EVENTS.filter(e => e.resolved).length,
    pendingEvents: SAMPLE_SECURITY_EVENTS.filter(e => !e.resolved).length,
    suspiciousActivities: SAMPLE_SECURITY_EVENTS.filter(e => e.type === 'suspicious_activity').length,
    failedLogins: SAMPLE_SECURITY_EVENTS.filter(e => e.type === 'failed_login').length,
    successfulLogins: 0,
    dataBreaches: 0,
    systemErrors: SAMPLE_SECURITY_EVENTS.filter(e => e.type === 'error').length
  });
  const [selectedEvent, setSelectedEvent] = useState<SecurityEvent | null>(null);
  const [selectedThreat, setSelectedThreat] = useState<ThreatAnalysis | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'low' | 'medium' | 'high' | 'critical'>('all');
  const [filterType, setFilterType] = useState<'all' | 'login' | 'logout' | 'failed_login' | 'suspicious_activity' | 'data_access' | 'system_change' | 'error'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Actualizar métricas cuando cambien los eventos
  useEffect(() => {
    setMetrics({
      totalEvents: events.length,
      criticalEvents: events.filter(e => e.severity === 'critical').length,
      highSeverityEvents: events.filter(e => e.severity === 'high').length,
      mediumSeverityEvents: events.filter(e => e.severity === 'medium').length,
      lowSeverityEvents: events.filter(e => e.severity === 'low').length,
      resolvedEvents: events.filter(e => e.resolved).length,
      pendingEvents: events.filter(e => !e.resolved).length,
      suspiciousActivities: events.filter(e => e.type === 'suspicious_activity').length,
      failedLogins: events.filter(e => e.type === 'failed_login').length,
      successfulLogins: 0,
      dataBreaches: 0,
      systemErrors: events.filter(e => e.type === 'error').length
    });
  }, [events]);

  // Auto-refresh de datos
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      // Simular nuevos eventos
      const newEvent: SecurityEvent = {
        id: `evt_${Date.now()}`,
        timestamp: new Date(),
        type: 'login',
        severity: 'low',
        userId: `user_${Math.floor(Math.random() * 1000)}`,
        ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        location: 'Ciudad de México, MX',
        description: 'Login exitoso',
        details: { method: 'password' },
        resolved: true,
        autoResolved: true
      };

      setEvents(prev => [newEvent, ...prev.slice(0, 49)]); // Mantener solo los últimos 50 eventos
    }, 30000); // Cada 30 segundos

    return () => clearInterval(interval);
  }, [autoRefresh]);

  // Resolver evento
  const resolveEvent = useCallback((eventId: string) => {
    setEvents(prev => prev.map(event => 
      event.id === eventId ? { ...event, resolved: true } : event
    ));
    
    if (onEventResolved) {
      onEventResolved(eventId);
    }
  }, [onEventResolved]);

  // Mitigar amenaza
  const mitigateThreat = useCallback((threatId: string) => {
    setThreats(prev => prev.map(threat => 
      threat.id === threatId ? { ...threat, status: 'mitigated' } : threat
    ));
    
    if (onThreatMitigated) {
      onThreatMitigated(threatId);
    }
  }, [onThreatMitigated]);

  // Exportar reporte
  const exportReport = useCallback(() => {
    const reportData = {
      timestamp: new Date(),
      events: events,
      threats: threats,
      metrics: metrics,
      summary: {
        totalEvents: metrics.totalEvents,
        criticalIssues: metrics.criticalEvents,
        resolvedIssues: metrics.resolvedEvents,
        pendingIssues: metrics.pendingEvents
      }
    };

    if (onExportReport) {
      onExportReport(reportData);
    } else {
      // Descarga directa
      const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `security-audit-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }, [events, threats, metrics, onExportReport]);

  // Obtener color por severidad
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-100 border-green-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  // Obtener icono por tipo de evento
  const getEventIcon = (type: string) => {
    switch (type) {
      case 'login': return <UserCheck className="w-4 h-4" />;
      case 'logout': return <UserX className="w-4 h-4" />;
      case 'failed_login': return <AlertTriangle className="w-4 h-4" />;
      case 'suspicious_activity': return <Eye className="w-4 h-4" />;
      case 'data_access': return <Database className="w-4 h-4" />;
      case 'system_change': return <Settings className="w-4 h-4" />;
      case 'error': return <AlertCircle className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  // Obtener icono por tipo de amenaza
  const getThreatIcon = (type: string) => {
    switch (type) {
      case 'brute_force': return <Target className="w-4 h-4" />;
      case 'sql_injection': return <Database className="w-4 h-4" />;
      case 'xss': return <Code className="w-4 h-4" />;
      case 'csrf': return <RefreshCw className="w-4 h-4" />;
      case 'ddos': return <Server className="w-4 h-4" />;
      case 'malware': return <Virus className="w-4 h-4" />;
      case 'phishing': return <Fish className="w-4 h-4" />;
      default: return <Shield className="w-4 h-4" />;
    }
  };

  // Filtrar eventos
  const filteredEvents = events.filter(event => {
    if (filterSeverity !== 'all' && event.severity !== filterSeverity) return false;
    if (filterType !== 'all' && event.type !== filterType) return false;
    if (searchQuery && !event.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <Card className={cn("w-full max-w-7xl mx-auto", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-blue-600" />
              Panel de Auditoría de Seguridad
            </CardTitle>
            <CardDescription>
              Monitoreo en tiempo real de eventos de seguridad y análisis de amenazas
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsMonitoring(!isMonitoring)}
            >
              {isMonitoring ? (
                <>
                  <Pause className="w-4 h-4 mr-2" />
                  Pausar
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Reanudar
                </>
              )}
            </Button>
            <Button variant="outline" size="sm" onClick={exportReport}>
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="events">Eventos</TabsTrigger>
            <TabsTrigger value="threats">Amenazas</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Resumen */}
          <TabsContent value="overview" className="space-y-6">
            {/* Métricas principales */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Eventos</p>
                      <p className="text-2xl font-bold">{metrics.totalEvents}</p>
                    </div>
                    <Activity className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Críticos</p>
                      <p className="text-2xl font-bold text-red-600">{metrics.criticalEvents}</p>
                    </div>
                    <AlertTriangle className="w-8 h-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Pendientes</p>
                      <p className="text-2xl font-bold text-orange-600">{metrics.pendingEvents}</p>
                    </div>
                    <Clock className="w-8 h-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Resueltos</p>
                      <p className="text-2xl font-bold text-green-600">{metrics.resolvedEvents}</p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Gráfico de severidad */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Distribución por Severidad</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Crítico</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-red-600 transition-all duration-300"
                          style={{ width: `${(metrics.criticalEvents / metrics.totalEvents) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{metrics.criticalEvents}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Alto</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-orange-600 transition-all duration-300"
                          style={{ width: `${(metrics.highSeverityEvents / metrics.totalEvents) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{metrics.highSeverityEvents}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Medio</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-yellow-600 transition-all duration-300"
                          style={{ width: `${(metrics.mediumSeverityEvents / metrics.totalEvents) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{metrics.mediumSeverityEvents}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Bajo</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-600 transition-all duration-300"
                          style={{ width: `${(metrics.lowSeverityEvents / metrics.totalEvents) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{metrics.lowSeverityEvents}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Eventos */}
          <TabsContent value="events" className="space-y-6">
            {/* Filtros */}
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Severidad:</label>
                <select
                  value={filterSeverity}
                  onChange={(e) => setFilterSeverity(e.target.value as any)}
                  className="p-2 border rounded-md text-sm"
                  tabIndex={0}
                  aria-label="Filtrar por severidad"
                >
                  <option value="all">Todas</option>
                  <option value="critical">Crítico</option>
                  <option value="high">Alto</option>
                  <option value="medium">Medio</option>
                  <option value="low">Bajo</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Tipo:</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as any)}
                  className="p-2 border rounded-md text-sm"
                  tabIndex={0}
                  aria-label="Filtrar por tipo"
                >
                  <option value="all">Todos</option>
                  <option value="login">Login</option>
                  <option value="logout">Logout</option>
                  <option value="failed_login">Login Fallido</option>
                  <option value="suspicious_activity">Actividad Sospechosa</option>
                  <option value="data_access">Acceso a Datos</option>
                  <option value="system_change">Cambio de Sistema</option>
                  <option value="error">Error</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar eventos..."
                  className="p-2 border rounded-md text-sm"
                  tabIndex={0}
                  aria-label="Buscar eventos"
                />
              </div>
            </div>

            {/* Lista de eventos */}
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {filteredEvents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No se encontraron eventos</p>
                </div>
              ) : (
                filteredEvents.map((event) => (
                  <div
                    key={event.id}
                    className={cn(
                      "p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md",
                      selectedEvent?.id === event.id && "border-blue-500 bg-blue-50",
                      event.resolved && "opacity-75"
                    )}
                    onClick={() => setSelectedEvent(event)}
                    tabIndex={0}
                    role="button"
                    aria-label={`Seleccionar evento: ${event.description}`}
                    onKeyDown={(e) => e.key === 'Enter' && setSelectedEvent(event)}
                  >
                    <div className="flex items-start gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                        getSeverityColor(event.severity)
                      )}>
                        {getEventIcon(event.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{event.description}</h4>
                            <p className="text-xs text-muted-foreground">
                              {event.timestamp.toLocaleString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 ml-2">
                            <Badge 
                              variant="outline" 
                              className={cn("text-xs", getSeverityColor(event.severity))}
                            >
                              {event.severity}
                            </Badge>
                            {event.resolved && (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {event.userId && (
                            <span>Usuario: {event.userId}</span>
                          )}
                          {event.ipAddress && (
                            <span>IP: {event.ipAddress}</span>
                          )}
                          {event.location && (
                            <span>Ubicación: {event.location}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Detalles del evento seleccionado */}
            {selectedEvent && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {getEventIcon(selectedEvent.type)}
                    Detalles del Evento
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-2">Información General</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>ID:</span>
                          <span className="font-mono">{selectedEvent.id}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tipo:</span>
                          <span>{selectedEvent.type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Severidad:</span>
                          <Badge 
                            variant="outline" 
                            className={cn("text-xs", getSeverityColor(selectedEvent.severity))}
                          >
                            {selectedEvent.severity}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Timestamp:</span>
                          <span>{selectedEvent.timestamp.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Estado:</span>
                          <span>{selectedEvent.resolved ? 'Resuelto' : 'Pendiente'}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Detalles Técnicos</h4>
                      <div className="space-y-2 text-sm">
                        {selectedEvent.userId && (
                          <div className="flex justify-between">
                            <span>Usuario:</span>
                            <span>{selectedEvent.userId}</span>
                          </div>
                        )}
                        {selectedEvent.ipAddress && (
                          <div className="flex justify-between">
                            <span>IP:</span>
                            <span className="font-mono">{selectedEvent.ipAddress}</span>
                          </div>
                        )}
                        {selectedEvent.location && (
                          <div className="flex justify-between">
                            <span>Ubicación:</span>
                            <span>{selectedEvent.location}</span>
                          </div>
                        )}
                        {selectedEvent.userAgent && (
                          <div className="flex justify-between">
                            <span>User Agent:</span>
                            <span className="font-mono text-xs truncate max-w-32">
                              {selectedEvent.userAgent}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <h4 className="font-medium mb-2">Detalles Adicionales</h4>
                    <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
                      {JSON.stringify(selectedEvent.details, null, 2)}
                    </pre>
                  </div>
                  
                  {!selectedEvent.resolved && isAdmin && (
                    <div className="mt-6 flex gap-2">
                      <Button 
                        onClick={() => resolveEvent(selectedEvent.id)}
                        className="flex items-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Marcar como Resuelto
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Amenazas */}
          <TabsContent value="threats" className="space-y-6">
            <div className="space-y-4">
              {threats.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Shield className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No se detectaron amenazas activas</p>
                </div>
              ) : (
                threats.map((threat) => (
                  <Card key={threat.id} className="border-l-4 border-l-red-500">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                            {getThreatIcon(threat.threatType)}
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold">{threat.description}</h3>
                              <Badge 
                                variant="outline" 
                                className={cn("text-xs", getSeverityColor(threat.severity))}
                              >
                                {threat.severity}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {threat.status}
                              </Badge>
                            </div>
                            
                            <p className="text-sm text-muted-foreground mb-3">
                              Detectado el {threat.timestamp.toLocaleString()}
                            </p>
                            
                            <div className="grid md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="font-medium">Origen:</span> {threat.source}
                              </div>
                              <div>
                                <span className="font-medium">Objetivo:</span> {threat.target}
                              </div>
                              <div>
                                <span className="font-medium">Usuarios Afectados:</span> {threat.affectedUsers}
                              </div>
                              <div>
                                <span className="font-medium">Daño Estimado:</span> {threat.estimatedDamage}
                              </div>
                            </div>
                            
                            <div className="mt-4">
                              <h4 className="font-medium mb-2">Pasos de Mitigación:</h4>
                              <ul className="space-y-1">
                                {threat.mitigationSteps.map((step, idx) => (
                                  <li key={idx} className="flex items-start gap-2 text-sm">
                                    <CheckCircle className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                                    <span>{step}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                        
                        {threat.status === 'detected' && isAdmin && (
                          <Button 
                            onClick={() => mitigateThreat(threat.id)}
                            variant="outline"
                            size="sm"
                          >
                            Mitigar
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Analytics */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Tendencia de Eventos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Últimas 24h</span>
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="h-32 bg-gray-100 rounded flex items-center justify-center">
                      <span className="text-muted-foreground">Gráfico de tendencias</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Distribución Geográfica</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Ubicaciones</span>
                      <Globe className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="h-32 bg-gray-100 rounded flex items-center justify-center">
                      <span className="text-muted-foreground">Mapa de actividad</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="auto-refresh"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded"
              tabIndex={0}
              aria-label="Auto-refresh"
            />
            <label htmlFor="auto-refresh" className="text-sm">
              Auto-refresh
            </label>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Monitoreo: {isMonitoring ? 'Activo' : 'Pausado'}</span>
            <span>•</span>
            <span>{filteredEvents.length} eventos mostrados</span>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportReport}>
            <Download className="w-4 h-4 mr-2" />
            Exportar Reporte
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

// Componentes adicionales para iconos que no están en lucide-react
const Code = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
  </svg>
);

const Virus = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
  </svg>
);

const Fish = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-10 0a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2" />
  </svg>
);
