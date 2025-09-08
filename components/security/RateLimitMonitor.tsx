'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Gauge, 
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
  Minus,
  Shield,
  ShieldCheck,
  ShieldX,
  ShieldAlert,
  Ban,
  Key,
  KeyRound,
  TimerOff,
  TimerReset,
  GaugeIcon,
  Speed,
  ActivitySquare,
  BarChart,
  PieChart,
  LineChart,
  AreaChart
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Tipos para rate limiting
interface RateLimitRule {
  id: string;
  name: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'ALL';
  limit: number;
  window: number; // segundos
  action: 'block' | 'delay' | 'challenge';
  isActive: boolean;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

interface RateLimitViolation {
  id: string;
  timestamp: Date;
  ipAddress: string;
  userId?: string;
  endpoint: string;
  method: string;
  ruleId: string;
  ruleName: string;
  currentCount: number;
  limit: number;
  window: number;
  action: 'blocked' | 'delayed' | 'challenged';
  userAgent?: string;
  location?: string;
  resolved: boolean;
  autoResolved: boolean;
}

interface BlockedIP {
  id: string;
  ipAddress: string;
  blockedAt: Date;
  reason: string;
  ruleId: string;
  ruleName: string;
  duration: number; // segundos, 0 = permanente
  expiresAt?: Date;
  isActive: boolean;
  violationCount: number;
  lastViolation: Date;
  location?: string;
  userAgent?: string;
}

interface RateLimitMetrics {
  totalRequests: number;
  blockedRequests: number;
  delayedRequests: number;
  challengedRequests: number;
  activeRules: number;
  blockedIPs: number;
  violationsToday: number;
  violationsThisHour: number;
  averageResponseTime: number;
  peakRequestsPerSecond: number;
}

interface RateLimitMonitorProps {
  isAdmin?: boolean;
  onRuleCreated?: (rule: RateLimitRule) => void;
  onRuleUpdated?: (ruleId: string, updates: Partial<RateLimitRule>) => void;
  onRuleDeleted?: (ruleId: string) => void;
  onIPUnblocked?: (ipAddress: string) => void;
  onExportData?: (data: any) => void;
  className?: string;
}

// Datos de ejemplo
const SAMPLE_RATE_LIMIT_RULES: RateLimitRule[] = [
  {
    id: 'rule_1',
    name: 'Login Protection',
    endpoint: '/api/auth/login',
    method: 'POST',
    limit: 5,
    window: 300, // 5 minutos
    action: 'block',
    isActive: true,
    description: 'Protección contra ataques de fuerza bruta en login',
    priority: 'high'
  },
  {
    id: 'rule_2',
    name: 'API Rate Limit',
    endpoint: '/api/*',
    method: 'ALL',
    limit: 100,
    window: 60, // 1 minuto
    action: 'delay',
    isActive: true,
    description: 'Límite general para todas las APIs',
    priority: 'medium'
  },
  {
    id: 'rule_3',
    name: 'File Upload Protection',
    endpoint: '/api/upload',
    method: 'POST',
    limit: 10,
    window: 3600, // 1 hora
    action: 'challenge',
    isActive: true,
    description: 'Protección contra spam de archivos',
    priority: 'medium'
  },
  {
    id: 'rule_4',
    name: 'Search Rate Limit',
    endpoint: '/api/search',
    method: 'GET',
    limit: 50,
    window: 300, // 5 minutos
    action: 'delay',
    isActive: true,
    description: 'Límite para búsquedas',
    priority: 'low'
  }
];

const SAMPLE_VIOLATIONS: RateLimitViolation[] = [
  {
    id: 'viol_1',
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    ipAddress: '192.168.1.100',
    userId: 'user_123',
    endpoint: '/api/auth/login',
    method: 'POST',
    ruleId: 'rule_1',
    ruleName: 'Login Protection',
    currentCount: 8,
    limit: 5,
    window: 300,
    action: 'blocked',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    location: 'Ciudad de México, MX',
    resolved: false,
    autoResolved: false
  },
  {
    id: 'viol_2',
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    ipAddress: '203.0.113.45',
    endpoint: '/api/search',
    method: 'GET',
    ruleId: 'rule_4',
    ruleName: 'Search Rate Limit',
    currentCount: 75,
    limit: 50,
    window: 300,
    action: 'delayed',
    userAgent: 'Mozilla/5.0 (Unknown)',
    location: 'Ubicación desconocida',
    resolved: true,
    autoResolved: true
  }
];

const SAMPLE_BLOCKED_IPS: BlockedIP[] = [
  {
    id: 'block_1',
    ipAddress: '192.168.1.100',
    blockedAt: new Date(Date.now() - 10 * 60 * 1000),
    reason: 'Múltiples intentos de login fallidos',
    ruleId: 'rule_1',
    ruleName: 'Login Protection',
    duration: 3600, // 1 hora
    expiresAt: new Date(Date.now() + 50 * 60 * 1000),
    isActive: true,
    violationCount: 3,
    lastViolation: new Date(Date.now() - 5 * 60 * 1000),
    location: 'Ciudad de México, MX',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
  },
  {
    id: 'block_2',
    ipAddress: '198.51.100.23',
    blockedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    reason: 'Spam de archivos detectado',
    ruleId: 'rule_3',
    ruleName: 'File Upload Protection',
    duration: 0, // Permanente
    isActive: true,
    violationCount: 15,
    lastViolation: new Date(Date.now() - 2 * 60 * 60 * 1000),
    location: 'Ubicación desconocida'
  }
];

export function RateLimitMonitor({
  isAdmin = false,
  onRuleCreated,
  onRuleUpdated,
  onRuleDeleted,
  onIPUnblocked,
  onExportData,
  className
}: RateLimitMonitorProps) {
  const [rules, setRules] = useState<RateLimitRule[]>(SAMPLE_RATE_LIMIT_RULES);
  const [violations, setViolations] = useState<RateLimitViolation[]>(SAMPLE_VIOLATIONS);
  const [blockedIPs, setBlockedIPs] = useState<BlockedIP[]>(SAMPLE_BLOCKED_IPS);
  const [metrics, setMetrics] = useState<RateLimitMetrics>({
    totalRequests: 15420,
    blockedRequests: 156,
    delayedRequests: 89,
    challengedRequests: 23,
    activeRules: SAMPLE_RATE_LIMIT_RULES.filter(r => r.isActive).length,
    blockedIPs: SAMPLE_BLOCKED_IPS.filter(ip => ip.isActive).length,
    violationsToday: 45,
    violationsThisHour: 3,
    averageResponseTime: 245,
    peakRequestsPerSecond: 156
  });
  const [selectedRule, setSelectedRule] = useState<RateLimitRule | null>(null);
  const [selectedViolation, setSelectedViolation] = useState<RateLimitViolation | null>(null);
  const [selectedBlockedIP, setSelectedBlockedIP] = useState<BlockedIP | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [filterAction, setFilterAction] = useState<'all' | 'blocked' | 'delayed' | 'challenged'>('all');
  const [filterPriority, setFilterPriority] = useState<'all' | 'low' | 'medium' | 'high' | 'critical'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Actualizar métricas
  useEffect(() => {
    setMetrics(prev => ({
      ...prev,
      activeRules: rules.filter(r => r.isActive).length,
      blockedIPs: blockedIPs.filter(ip => ip.isActive).length
    }));
  }, [rules, blockedIPs]);

  // Auto-refresh de datos
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      // Simular nuevas métricas
      setMetrics(prev => ({
        ...prev,
        totalRequests: prev.totalRequests + Math.floor(Math.random() * 50),
        violationsThisHour: Math.max(0, prev.violationsThisHour + Math.floor(Math.random() * 3) - 1)
      }));
    }, 10000); // Cada 10 segundos

    return () => clearInterval(interval);
  }, [autoRefresh]);

  // Crear nueva regla
  const createRule = useCallback((ruleData: Omit<RateLimitRule, 'id'>) => {
    const newRule: RateLimitRule = {
      ...ruleData,
      id: `rule_${Date.now()}`
    };

    setRules(prev => [...prev, newRule]);
    
    if (onRuleCreated) {
      onRuleCreated(newRule);
    }
  }, [onRuleCreated]);

  // Actualizar regla
  const updateRule = useCallback((ruleId: string, updates: Partial<RateLimitRule>) => {
    setRules(prev => prev.map(rule => 
      rule.id === ruleId ? { ...rule, ...updates } : rule
    ));
    
    if (onRuleUpdated) {
      onRuleUpdated(ruleId, updates);
    }
  }, [onRuleUpdated]);

  // Eliminar regla
  const deleteRule = useCallback((ruleId: string) => {
    setRules(prev => prev.filter(rule => rule.id !== ruleId));
    
    if (onRuleDeleted) {
      onRuleDeleted(ruleId);
    }
  }, [onRuleDeleted]);

  // Desbloquear IP
  const unblockIP = useCallback((ipAddress: string) => {
    setBlockedIPs(prev => prev.map(ip => 
      ip.ipAddress === ipAddress ? { ...ip, isActive: false } : ip
    ));
    
    if (onIPUnblocked) {
      onIPUnblocked(ipAddress);
    }
  }, [onIPUnblocked]);

  // Exportar datos
  const exportData = useCallback(() => {
    const exportData = {
      timestamp: new Date(),
      rules: rules,
      violations: violations,
      blockedIPs: blockedIPs,
      metrics: metrics
    };

    if (onExportData) {
      onExportData(exportData);
    } else {
      // Descarga directa
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rate-limit-data-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }, [rules, violations, blockedIPs, metrics, onExportData]);

  // Obtener color por prioridad
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-100 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-100 border-green-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  // Obtener color por acción
  const getActionColor = (action: string) => {
    switch (action) {
      case 'block': return 'text-red-600 bg-red-100 border-red-200';
      case 'delay': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'challenge': return 'text-blue-600 bg-blue-100 border-blue-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  // Obtener icono por acción
  const getActionIcon = (action: string) => {
    switch (action) {
      case 'block': return <Ban className="w-4 h-4" />;
      case 'delay': return <Timer className="w-4 h-4" />;
      case 'challenge': return <Shield className="w-4 h-4" />;
      default: return <Gauge className="w-4 h-4" />;
    }
  };

  // Filtrar reglas
  const filteredRules = rules.filter(rule => {
    if (filterPriority !== 'all' && rule.priority !== filterPriority) return false;
    if (searchQuery && !rule.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  // Filtrar violaciones
  const filteredViolations = violations.filter(violation => {
    if (filterAction !== 'all' && violation.action !== filterAction) return false;
    if (searchQuery && !violation.ipAddress.includes(searchQuery)) return false;
    return true;
  });

  return (
    <Card className={cn("w-full max-w-7xl mx-auto", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Gauge className="w-6 h-6 text-blue-600" />
              Monitor de Rate Limiting
            </CardTitle>
            <CardDescription>
              Gestión y monitoreo de límites de velocidad de acceso a la API
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
            <Button variant="outline" size="sm" onClick={exportData}>
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
            <TabsTrigger value="rules">Reglas</TabsTrigger>
            <TabsTrigger value="violations">Violaciones</TabsTrigger>
            <TabsTrigger value="blocked">IPs Bloqueadas</TabsTrigger>
          </TabsList>

          {/* Resumen */}
          <TabsContent value="overview" className="space-y-6">
            {/* Métricas principales */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Requests</p>
                      <p className="text-2xl font-bold">{metrics.totalRequests.toLocaleString()}</p>
                    </div>
                    <Activity className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Bloqueados</p>
                      <p className="text-2xl font-bold text-red-600">{metrics.blockedRequests}</p>
                    </div>
                    <Ban className="w-8 h-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">IPs Bloqueadas</p>
                      <p className="text-2xl font-bold text-orange-600">{metrics.blockedIPs}</p>
                    </div>
                    <ShieldX className="w-8 h-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Reglas Activas</p>
                      <p className="text-2xl font-bold text-green-600">{metrics.activeRules}</p>
                    </div>
                    <ShieldCheck className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Métricas adicionales */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Actividad Reciente</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Violaciones Hoy</span>
                      <span className="font-medium">{metrics.violationsToday}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Violaciones Esta Hora</span>
                      <span className="font-medium">{metrics.violationsThisHour}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Tiempo Promedio de Respuesta</span>
                      <span className="font-medium">{metrics.averageResponseTime}ms</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Pico de Requests/seg</span>
                      <span className="font-medium">{metrics.peakRequestsPerSecond}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Distribución de Acciones</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Bloqueados</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-red-600 transition-all duration-300"
                            style={{ width: `${(metrics.blockedRequests / metrics.totalRequests) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{metrics.blockedRequests}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Retrasados</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-yellow-600 transition-all duration-300"
                            style={{ width: `${(metrics.delayedRequests / metrics.totalRequests) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{metrics.delayedRequests}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Desafiados</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-600 transition-all duration-300"
                            style={{ width: `${(metrics.challengedRequests / metrics.totalRequests) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{metrics.challengedRequests}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Reglas */}
          <TabsContent value="rules" className="space-y-6">
            {/* Filtros */}
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Prioridad:</label>
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value as any)}
                  className="p-2 border rounded-md text-sm"
                  tabIndex={0}
                  aria-label="Filtrar por prioridad"
                >
                  <option value="all">Todas</option>
                  <option value="critical">Crítico</option>
                  <option value="high">Alto</option>
                  <option value="medium">Medio</option>
                  <option value="low">Bajo</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar reglas..."
                  className="p-2 border rounded-md text-sm"
                  tabIndex={0}
                  aria-label="Buscar reglas"
                />
              </div>

              {isAdmin && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    // Aquí se abriría un modal para crear nueva regla
                    console.log('Crear nueva regla');
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nueva Regla
                </Button>
              )}
            </div>

            {/* Lista de reglas */}
            <div className="space-y-4">
              {filteredRules.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Gauge className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No se encontraron reglas</p>
                </div>
              ) : (
                filteredRules.map((rule) => (
                  <div
                    key={rule.id}
                    className={cn(
                      "p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md",
                      selectedRule?.id === rule.id && "border-blue-500 bg-blue-50",
                      !rule.isActive && "opacity-75"
                    )}
                    onClick={() => setSelectedRule(rule)}
                    tabIndex={0}
                    role="button"
                    aria-label={`Seleccionar regla: ${rule.name}`}
                    onKeyDown={(e) => e.key === 'Enter' && setSelectedRule(rule)}
                  >
                    <div className="flex items-start gap-4">
                      <div className={cn(
                        "w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0",
                        getActionColor(rule.action)
                      )}>
                        {getActionIcon(rule.action)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{rule.name}</h4>
                            <p className="text-xs text-muted-foreground">{rule.description}</p>
                          </div>
                          <div className="flex items-center gap-2 ml-2">
                            <Badge 
                              variant="outline" 
                              className={cn("text-xs", getPriorityColor(rule.priority))}
                            >
                              {rule.priority}
                            </Badge>
                            <Badge 
                              variant="outline" 
                              className={cn("text-xs", getActionColor(rule.action))}
                            >
                              {rule.action}
                            </Badge>
                            {!rule.isActive && (
                              <Badge variant="outline" className="text-xs text-gray-500">
                                Inactivo
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Endpoint: {rule.endpoint}</span>
                          <span>Método: {rule.method}</span>
                          <span>Límite: {rule.limit} requests</span>
                          <span>Ventana: {rule.window}s</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Detalles de la regla seleccionada */}
            {selectedRule && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {getActionIcon(selectedRule.action)}
                    Detalles de la Regla
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-2">Información General</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Nombre:</span>
                          <span>{selectedRule.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Endpoint:</span>
                          <span className="font-mono">{selectedRule.endpoint}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Método:</span>
                          <span>{selectedRule.method}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Prioridad:</span>
                          <Badge 
                            variant="outline" 
                            className={cn("text-xs", getPriorityColor(selectedRule.priority))}
                          >
                            {selectedRule.priority}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Estado:</span>
                          <span>{selectedRule.isActive ? 'Activo' : 'Inactivo'}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Configuración</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Límite:</span>
                          <span>{selectedRule.limit} requests</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Ventana:</span>
                          <span>{selectedRule.window} segundos</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Acción:</span>
                          <Badge 
                            variant="outline" 
                            className={cn("text-xs", getActionColor(selectedRule.action))}
                          >
                            {selectedRule.action}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Requests por minuto:</span>
                          <span>{(selectedRule.limit / (selectedRule.window / 60)).toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <h4 className="font-medium mb-2">Descripción</h4>
                    <p className="text-sm text-muted-foreground">{selectedRule.description}</p>
                  </div>
                  
                  {isAdmin && (
                    <div className="mt-6 flex gap-2">
                      <Button 
                        variant="outline"
                        onClick={() => updateRule(selectedRule.id, { isActive: !selectedRule.isActive })}
                      >
                        {selectedRule.isActive ? (
                          <>
                            <Pause className="w-4 h-4 mr-2" />
                            Desactivar
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 mr-2" />
                            Activar
                          </>
                        )}
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => {
                          // Aquí se abriría un modal para editar
                          console.log('Editar regla:', selectedRule.id);
                        }}
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Editar
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => deleteRule(selectedRule.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Eliminar
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Violaciones */}
          <TabsContent value="violations" className="space-y-6">
            {/* Filtros */}
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Acción:</label>
                <select
                  value={filterAction}
                  onChange={(e) => setFilterAction(e.target.value as any)}
                  className="p-2 border rounded-md text-sm"
                  tabIndex={0}
                  aria-label="Filtrar por acción"
                >
                  <option value="all">Todas</option>
                  <option value="blocked">Bloqueados</option>
                  <option value="delayed">Retrasados</option>
                  <option value="challenged">Desafiados</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por IP..."
                  className="p-2 border rounded-md text-sm"
                  tabIndex={0}
                  aria-label="Buscar violaciones"
                />
              </div>
            </div>

            {/* Lista de violaciones */}
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {filteredViolations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertTriangle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No se encontraron violaciones</p>
                </div>
              ) : (
                filteredViolations.map((violation) => (
                  <div
                    key={violation.id}
                    className={cn(
                      "p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md",
                      selectedViolation?.id === violation.id && "border-blue-500 bg-blue-50",
                      violation.resolved && "opacity-75"
                    )}
                    onClick={() => setSelectedViolation(violation)}
                    tabIndex={0}
                    role="button"
                    aria-label={`Seleccionar violación: ${violation.ipAddress}`}
                    onKeyDown={(e) => e.key === 'Enter' && setSelectedViolation(violation)}
                  >
                    <div className="flex items-start gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                        getActionColor(violation.action)
                      )}>
                        {getActionIcon(violation.action)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">IP: {violation.ipAddress}</h4>
                            <p className="text-xs text-muted-foreground">
                              {violation.timestamp.toLocaleString()} - {violation.ruleName}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 ml-2">
                            <Badge 
                              variant="outline" 
                              className={cn("text-xs", getActionColor(violation.action))}
                            >
                              {violation.action}
                            </Badge>
                            {violation.resolved && (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Endpoint: {violation.endpoint}</span>
                          <span>Método: {violation.method}</span>
                          <span>Count: {violation.currentCount}/{violation.limit}</span>
                          <span>Ventana: {violation.window}s</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          {/* IPs Bloqueadas */}
          <TabsContent value="blocked" className="space-y-6">
            <div className="space-y-4">
              {blockedIPs.filter(ip => ip.isActive).length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <ShieldX className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No hay IPs bloqueadas activas</p>
                </div>
              ) : (
                blockedIPs.filter(ip => ip.isActive).map((blockedIP) => (
                  <Card key={blockedIP.id} className="border-l-4 border-l-red-500">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                            <Ban className="w-6 h-6 text-red-600" />
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold">IP: {blockedIP.ipAddress}</h3>
                              <Badge variant="outline" className="text-xs text-red-600">
                                Bloqueada
                              </Badge>
                            </div>
                            
                            <p className="text-sm text-muted-foreground mb-3">
                              Bloqueada el {blockedIP.blockedAt.toLocaleString()}
                            </p>
                            
                            <div className="grid md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="font-medium">Razón:</span> {blockedIP.reason}
                              </div>
                              <div>
                                <span className="font-medium">Regla:</span> {blockedIP.ruleName}
                              </div>
                              <div>
                                <span className="font-medium">Violaciones:</span> {blockedIP.violationCount}
                              </div>
                              <div>
                                <span className="font-medium">Duración:</span> {
                                  blockedIP.duration === 0 
                                    ? 'Permanente' 
                                    : `${Math.floor(blockedIP.duration / 3600)} horas`
                                }
                              </div>
                              {blockedIP.expiresAt && (
                                <div>
                                  <span className="font-medium">Expira:</span> {blockedIP.expiresAt.toLocaleString()}
                                </div>
                              )}
                              {blockedIP.location && (
                                <div>
                                  <span className="font-medium">Ubicación:</span> {blockedIP.location}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {isAdmin && (
                          <Button 
                            onClick={() => unblockIP(blockedIP.ipAddress)}
                            variant="outline"
                            size="sm"
                          >
                            <Unlock className="w-4 h-4 mr-2" />
                            Desbloquear
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
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
            <span>{filteredRules.length} reglas mostradas</span>
            <span>•</span>
            <span>{filteredViolations.length} violaciones</span>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportData}>
            <Download className="w-4 h-4 mr-2" />
            Exportar Datos
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
