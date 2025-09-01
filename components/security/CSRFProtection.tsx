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
  Maximize,
  Minimize,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  ArrowLeft,
  Plus,
  Minus,
  Key,
  TimerOff,
  TimerReset,
  GaugeIcon,
  ActivitySquare,
  BarChart,
  PieChart,
  LineChart,
  AreaChart,
  Copy,
  Check,
  X,
  AlertOctagon,
  ShieldCheck,
  ShieldX,
  ShieldAlert,
  Ban,
  RefreshCw as RefreshIcon,
  RotateCcw as RotateIcon,
  Hash,
  Fingerprint,
  LockKeyhole,
  UnlockKeyhole
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Tipos para protección CSRF
interface CSRFToken {
  id: string;
  token: string;
  userId?: string;
  sessionId: string;
  createdAt: Date;
  expiresAt: Date;
  isUsed: boolean;
  isRevoked: boolean;
  source: 'login' | 'form' | 'api' | 'session';
  userAgent?: string;
  ipAddress?: string;
}

interface CSRFAttack {
  id: string;
  timestamp: Date;
  ipAddress: string;
  userAgent?: string;
  targetEndpoint: string;
  method: string;
  attackType: 'missing_token' | 'invalid_token' | 'expired_token' | 'reused_token';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  blocked: boolean;
  resolved: boolean;
  location?: string;
  referer?: string;
  origin?: string;
}

interface CSRFMetrics {
  totalTokens: number;
  activeTokens: number;
  expiredTokens: number;
  usedTokens: number;
  revokedTokens: number;
  attacksBlocked: number;
  attacksDetected: number;
  attacksToday: number;
  attacksThisHour: number;
  averageTokenLifetime: number;
  tokenGenerationRate: number;
}

interface CSRFProtectionProps {
  isAdmin?: boolean;
  onTokenGenerated?: (token: CSRFToken) => void;
  onTokenValidated?: (tokenId: string, isValid: boolean) => void;
  onAttackDetected?: (attack: CSRFAttack) => void;
  onExportData?: (data: any) => void;
  className?: string;
}

// Datos de ejemplo
const SAMPLE_CSRF_TOKENS: CSRFToken[] = [
  {
    id: 'token_1',
    token: 'a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456',
    userId: 'user_123',
    sessionId: 'session_456',
    createdAt: new Date(Date.now() - 30 * 60 * 1000),
    expiresAt: new Date(Date.now() + 30 * 60 * 1000),
    isUsed: false,
    isRevoked: false,
    source: 'login',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    ipAddress: '192.168.1.100'
  },
  {
    id: 'token_2',
    token: 'b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef1234567890',
    userId: 'user_456',
    sessionId: 'session_789',
    createdAt: new Date(Date.now() - 15 * 60 * 1000),
    expiresAt: new Date(Date.now() + 45 * 60 * 1000),
    isUsed: true,
    isRevoked: false,
    source: 'form',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    ipAddress: '10.0.0.15'
  },
  {
    id: 'token_3',
    token: 'c3d4e5f6789012345678901234567890abcdef1234567890abcdef1234567890ab',
    userId: 'user_789',
    sessionId: 'session_012',
    createdAt: new Date(Date.now() - 60 * 60 * 1000),
    expiresAt: new Date(Date.now() - 30 * 60 * 1000),
    isUsed: false,
    isRevoked: true,
    source: 'api',
    userAgent: 'Mozilla/5.0 (Unknown)',
    ipAddress: '203.0.113.45'
  }
];

const SAMPLE_CSRF_ATTACKS: CSRFAttack[] = [
  {
    id: 'attack_1',
    timestamp: new Date(Date.now() - 10 * 60 * 1000),
    ipAddress: '198.51.100.23',
    userAgent: 'Mozilla/5.0 (Unknown)',
    targetEndpoint: '/api/user/profile/update',
    method: 'POST',
    attackType: 'missing_token',
    severity: 'high',
    description: 'Intento de actualización de perfil sin token CSRF',
    blocked: true,
    resolved: false,
    location: 'Ubicación desconocida',
    referer: 'https://malicious-site.com',
    origin: 'https://malicious-site.com'
  },
  {
    id: 'attack_2',
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    targetEndpoint: '/api/auth/password/change',
    method: 'POST',
    attackType: 'invalid_token',
    severity: 'critical',
    description: 'Token CSRF inválido en cambio de contraseña',
    blocked: true,
    resolved: true,
    location: 'Ciudad de México, MX',
    referer: 'https://legitimate-site.com',
    origin: 'https://legitimate-site.com'
  },
  {
    id: 'attack_3',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    ipAddress: '203.0.113.45',
    userAgent: 'Mozilla/5.0 (Unknown)',
    targetEndpoint: '/api/admin/users/create',
    method: 'POST',
    attackType: 'expired_token',
    severity: 'medium',
    description: 'Token CSRF expirado en creación de usuario',
    blocked: true,
    resolved: false,
    location: 'Ubicación desconocida'
  }
];

export function CSRFProtection({
  isAdmin = false,
  onTokenGenerated,
  onTokenValidated,
  onAttackDetected,
  onExportData,
  className
}: CSRFProtectionProps) {
  const [tokens, setTokens] = useState<CSRFToken[]>(SAMPLE_CSRF_TOKENS);
  const [attacks, setAttacks] = useState<CSRFAttack[]>(SAMPLE_CSRF_ATTACKS);
  const [metrics, setMetrics] = useState<CSRFMetrics>({
    totalTokens: SAMPLE_CSRF_TOKENS.length,
    activeTokens: SAMPLE_CSRF_TOKENS.filter(t => !t.isUsed && !t.isRevoked && t.expiresAt > new Date()).length,
    expiredTokens: SAMPLE_CSRF_TOKENS.filter(t => t.expiresAt <= new Date()).length,
    usedTokens: SAMPLE_CSRF_TOKENS.filter(t => t.isUsed).length,
    revokedTokens: SAMPLE_CSRF_TOKENS.filter(t => t.isRevoked).length,
    attacksBlocked: SAMPLE_CSRF_ATTACKS.filter(a => a.blocked).length,
    attacksDetected: SAMPLE_CSRF_ATTACKS.length,
    attacksToday: 5,
    attacksThisHour: 1,
    averageTokenLifetime: 3600, // 1 hora en segundos
    tokenGenerationRate: 12 // tokens por hora
  });
  const [selectedToken, setSelectedToken] = useState<CSRFToken | null>(null);
  const [selectedAttack, setSelectedAttack] = useState<CSRFAttack | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [filterTokenStatus, setFilterTokenStatus] = useState<'all' | 'active' | 'expired' | 'used' | 'revoked'>('all');
  const [filterAttackType, setFilterAttackType] = useState<'all' | 'missing_token' | 'invalid_token' | 'expired_token' | 'reused_token'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Actualizar métricas
  useEffect(() => {
    setMetrics(prev => ({
      ...prev,
      totalTokens: tokens.length,
      activeTokens: tokens.filter(t => !t.isUsed && !t.isRevoked && t.expiresAt > new Date()).length,
      expiredTokens: tokens.filter(t => t.expiresAt <= new Date()).length,
      usedTokens: tokens.filter(t => t.isUsed).length,
      revokedTokens: tokens.filter(t => t.isRevoked).length,
      attacksBlocked: attacks.filter(a => a.blocked).length,
      attacksDetected: attacks.length
    }));
  }, [tokens, attacks]);

  // Auto-refresh de datos
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      // Simular nuevos tokens y ataques
      const now = new Date();
      
      // Limpiar tokens expirados
      setTokens(prev => prev.filter(token => token.expiresAt > now));
      
      // Simular nuevos ataques ocasionalmente
      if (Math.random() < 0.1) { // 10% de probabilidad cada 10 segundos
        const newAttack: CSRFAttack = {
          id: `attack_${Date.now()}`,
          timestamp: new Date(),
          ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
          userAgent: 'Mozilla/5.0 (Unknown)',
          targetEndpoint: '/api/user/profile/update',
          method: 'POST',
          attackType: 'missing_token',
          severity: 'medium',
          description: 'Intento de ataque CSRF detectado',
          blocked: true,
          resolved: false,
          location: 'Ubicación desconocida'
        };
        
        setAttacks(prev => [newAttack, ...prev.slice(0, 49)]); // Mantener solo los últimos 50
        
        if (onAttackDetected) {
          onAttackDetected(newAttack);
        }
      }
    }, 10000); // Cada 10 segundos

    return () => clearInterval(interval);
  }, [autoRefresh, onAttackDetected]);

  // Generar nuevo token
  const generateToken = useCallback((userId?: string, sessionId?: string) => {
    const newToken: CSRFToken = {
      id: `token_${Date.now()}`,
      token: Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      userId,
      sessionId: sessionId || `session_${Date.now()}`,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hora
      isUsed: false,
      isRevoked: false,
      source: 'form',
      userAgent: navigator.userAgent,
      ipAddress: '127.0.0.1' // En producción, obtener IP real
    };

    setTokens(prev => [newToken, ...prev]);
    
    if (onTokenGenerated) {
      onTokenGenerated(newToken);
    }

    return newToken;
  }, [onTokenGenerated]);

  // Validar token
  const validateToken = useCallback((tokenId: string, tokenValue: string) => {
    const token = tokens.find(t => t.id === tokenId);
    
    if (!token) {
      if (onTokenValidated) {
        onTokenValidated(tokenId, false);
      }
      return false;
    }

    const isValid = token.token === tokenValue && 
                   !token.isUsed && 
                   !token.isRevoked && 
                   token.expiresAt > new Date();

    if (isValid) {
      setTokens(prev => prev.map(t => 
        t.id === tokenId ? { ...t, isUsed: true } : t
      ));
    }

    if (onTokenValidated) {
      onTokenValidated(tokenId, isValid);
    }

    return isValid;
  }, [tokens, onTokenValidated]);

  // Revocar token
  const revokeToken = useCallback((tokenId: string) => {
    setTokens(prev => prev.map(token => 
      token.id === tokenId ? { ...token, isRevoked: true } : token
    ));
  }, []);

  // Resolver ataque
  const resolveAttack = useCallback((attackId: string) => {
    setAttacks(prev => prev.map(attack => 
      attack.id === attackId ? { ...attack, resolved: true } : attack
    ));
  }, []);

  // Exportar datos
  const exportData = useCallback(() => {
    const exportData = {
      timestamp: new Date(),
      tokens: tokens,
      attacks: attacks,
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
      a.download = `csrf-protection-data-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }, [tokens, attacks, metrics, onExportData]);

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

  // Obtener color por estado de token
  const getTokenStatusColor = (token: CSRFToken) => {
    if (token.isRevoked) return 'text-red-600 bg-red-100 border-red-200';
    if (token.isUsed) return 'text-blue-600 bg-blue-100 border-blue-200';
    if (token.expiresAt <= new Date()) return 'text-gray-600 bg-gray-100 border-gray-200';
    return 'text-green-600 bg-green-100 border-green-200';
  };

  // Obtener icono por tipo de ataque
  const getAttackIcon = (attackType: string) => {
    switch (attackType) {
      case 'missing_token': return <X className="w-4 h-4" />;
      case 'invalid_token': return <AlertTriangle className="w-4 h-4" />;
      case 'expired_token': return <Clock className="w-4 h-4" />;
      case 'reused_token': return <RefreshCw className="w-4 h-4" />;
      default: return <Shield className="w-4 h-4" />;
    }
  };

  // Filtrar tokens
  const filteredTokens = tokens.filter(token => {
    if (filterTokenStatus !== 'all') {
      switch (filterTokenStatus) {
        case 'active': return !token.isUsed && !token.isRevoked && token.expiresAt > new Date();
        case 'expired': return token.expiresAt <= new Date();
        case 'used': return token.isUsed;
        case 'revoked': return token.isRevoked;
      }
    }
    if (searchQuery && !token.token.includes(searchQuery)) return false;
    return true;
  });

  // Filtrar ataques
  const filteredAttacks = attacks.filter(attack => {
    if (filterAttackType !== 'all' && attack.attackType !== filterAttackType) return false;
    if (searchQuery && !attack.ipAddress.includes(searchQuery)) return false;
    return true;
  });

  return (
    <Card className={cn("w-full max-w-7xl mx-auto", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-blue-600" />
              Protección CSRF
            </CardTitle>
            <CardDescription>
              Gestión de tokens CSRF y monitoreo de ataques de Cross-Site Request Forgery
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
            <Button variant="outline" size="sm" onClick={() => generateToken()}>
              <Plus className="w-4 h-4 mr-2" />
              Generar Token
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
            <TabsTrigger value="tokens">Tokens</TabsTrigger>
            <TabsTrigger value="attacks">Ataques</TabsTrigger>
            <TabsTrigger value="tools">Herramientas</TabsTrigger>
          </TabsList>

          {/* Resumen */}
          <TabsContent value="overview" className="space-y-6">
            {/* Métricas principales */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Tokens Activos</p>
                      <p className="text-2xl font-bold text-green-600">{metrics.activeTokens}</p>
                    </div>
                    <Key className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Ataques Bloqueados</p>
                      <p className="text-2xl font-bold text-red-600">{metrics.attacksBlocked}</p>
                    </div>
                    <ShieldX className="w-8 h-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Tokens Expirados</p>
                      <p className="text-2xl font-bold text-orange-600">{metrics.expiredTokens}</p>
                    </div>
                    <TimerOff className="w-8 h-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Tasa de Generación</p>
                      <p className="text-2xl font-bold text-blue-600">{metrics.tokenGenerationRate}/h</p>
                    </div>
                    <Activity className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Métricas adicionales */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Estadísticas de Tokens</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Total de Tokens</span>
                      <span className="font-medium">{metrics.totalTokens}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Tokens Usados</span>
                      <span className="font-medium">{metrics.usedTokens}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Tokens Revocados</span>
                      <span className="font-medium">{metrics.revokedTokens}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Vida Promedio</span>
                      <span className="font-medium">{Math.floor(metrics.averageTokenLifetime / 60)} min</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Actividad de Ataques</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Ataques Detectados</span>
                      <span className="font-medium">{metrics.attacksDetected}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Ataques Hoy</span>
                      <span className="font-medium">{metrics.attacksToday}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Ataques Esta Hora</span>
                      <span className="font-medium">{metrics.attacksThisHour}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Tasa de Bloqueo</span>
                      <span className="font-medium">
                        {metrics.attacksDetected > 0 
                          ? Math.round((metrics.attacksBlocked / metrics.attacksDetected) * 100)
                          : 0}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tokens */}
          <TabsContent value="tokens" className="space-y-6">
            {/* Filtros */}
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Estado:</label>
                <select
                  value={filterTokenStatus}
                  onChange={(e) => setFilterTokenStatus(e.target.value as any)}
                  className="p-2 border rounded-md text-sm"
                  tabIndex={0}
                  aria-label="Filtrar por estado de token"
                >
                  <option value="all">Todos</option>
                  <option value="active">Activos</option>
                  <option value="expired">Expirados</option>
                  <option value="used">Usados</option>
                  <option value="revoked">Revocados</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar tokens..."
                  className="p-2 border rounded-md text-sm"
                  tabIndex={0}
                  aria-label="Buscar tokens"
                />
              </div>
            </div>

            {/* Lista de tokens */}
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {filteredTokens.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Key className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No se encontraron tokens</p>
                </div>
              ) : (
                filteredTokens.map((token) => (
                  <div
                    key={token.id}
                    className={cn(
                      "p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md",
                      selectedToken?.id === token.id && "border-blue-500 bg-blue-50"
                    )}
                    onClick={() => setSelectedToken(token)}
                    tabIndex={0}
                    role="button"
                    aria-label={`Seleccionar token: ${token.token.substring(0, 8)}...`}
                    onKeyDown={(e) => e.key === 'Enter' && setSelectedToken(token)}
                  >
                    <div className="flex items-start gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                        getTokenStatusColor(token)
                      )}>
                        <Key className="w-4 h-4" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm font-mono">
                              {token.token.substring(0, 16)}...
                            </h4>
                            <p className="text-xs text-muted-foreground">
                              Creado: {token.createdAt.toLocaleString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 ml-2">
                            <Badge 
                              variant="outline" 
                              className={cn("text-xs", getTokenStatusColor(token))}
                            >
                              {token.isRevoked ? 'Revocado' : 
                               token.isUsed ? 'Usado' : 
                               token.expiresAt <= new Date() ? 'Expirado' : 'Activo'}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {token.source}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          {token.userId && <span>Usuario: {token.userId}</span>}
                          <span>Sesión: {token.sessionId}</span>
                          <span>Expira: {token.expiresAt.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Detalles del token seleccionado */}
            {selectedToken && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Key className="w-5 h-5" />
                    Detalles del Token
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-2">Información General</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>ID:</span>
                          <span className="font-mono">{selectedToken.id}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Token:</span>
                          <span className="font-mono text-xs truncate max-w-32">
                            {selectedToken.token}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Fuente:</span>
                          <span>{selectedToken.source}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Estado:</span>
                          <Badge 
                            variant="outline" 
                            className={cn("text-xs", getTokenStatusColor(selectedToken))}
                          >
                            {selectedToken.isRevoked ? 'Revocado' : 
                             selectedToken.isUsed ? 'Usado' : 
                             selectedToken.expiresAt <= new Date() ? 'Expirado' : 'Activo'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Información de Sesión</h4>
                      <div className="space-y-2 text-sm">
                        {selectedToken.userId && (
                          <div className="flex justify-between">
                            <span>Usuario:</span>
                            <span>{selectedToken.userId}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span>Sesión:</span>
                          <span className="font-mono">{selectedToken.sessionId}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Creado:</span>
                          <span>{selectedToken.createdAt.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Expira:</span>
                          <span>{selectedToken.expiresAt.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {isAdmin && (
                    <div className="mt-6 flex gap-2">
                      <Button 
                        variant="outline"
                        onClick={() => {
                          navigator.clipboard.writeText(selectedToken.token);
                        }}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copiar Token
                      </Button>
                      {!selectedToken.isRevoked && (
                        <Button 
                          variant="outline"
                          onClick={() => revokeToken(selectedToken.id)}
                        >
                          <Ban className="w-4 h-4 mr-2" />
                          Revocar
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Ataques */}
          <TabsContent value="attacks" className="space-y-6">
            {/* Filtros */}
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Tipo:</label>
                <select
                  value={filterAttackType}
                  onChange={(e) => setFilterAttackType(e.target.value as any)}
                  className="p-2 border rounded-md text-sm"
                  tabIndex={0}
                  aria-label="Filtrar por tipo de ataque"
                >
                  <option value="all">Todos</option>
                  <option value="missing_token">Token Faltante</option>
                  <option value="invalid_token">Token Inválido</option>
                  <option value="expired_token">Token Expirado</option>
                  <option value="reused_token">Token Reutilizado</option>
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
                  aria-label="Buscar ataques"
                />
              </div>
            </div>

            {/* Lista de ataques */}
            <div className="space-y-4">
              {filteredAttacks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Shield className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No se encontraron ataques</p>
                </div>
              ) : (
                filteredAttacks.map((attack) => (
                  <Card key={attack.id} className="border-l-4 border-l-red-500">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                            {getAttackIcon(attack.attackType)}
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold">IP: {attack.ipAddress}</h3>
                              <Badge 
                                variant="outline" 
                                className={cn("text-xs", getSeverityColor(attack.severity))}
                              >
                                {attack.severity}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {attack.attackType}
                              </Badge>
                              {attack.blocked && (
                                <Badge variant="outline" className="text-xs text-green-600">
                                  Bloqueado
                                </Badge>
                              )}
                            </div>
                            
                            <p className="text-sm text-muted-foreground mb-3">
                              {attack.timestamp.toLocaleString()} - {attack.description}
                            </p>
                            
                            <div className="grid md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="font-medium">Endpoint:</span> {attack.targetEndpoint}
                              </div>
                              <div>
                                <span className="font-medium">Método:</span> {attack.method}
                              </div>
                              {attack.location && (
                                <div>
                                  <span className="font-medium">Ubicación:</span> {attack.location}
                                </div>
                              )}
                              {attack.referer && (
                                <div>
                                  <span className="font-medium">Referer:</span> {attack.referer}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {isAdmin && !attack.resolved && (
                          <Button 
                            onClick={() => resolveAttack(attack.id)}
                            variant="outline"
                            size="sm"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Resolver
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Herramientas */}
          <TabsContent value="tools" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Key className="w-5 h-5" />
                    Generador de Tokens
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Usuario ID (opcional)</label>
                      <input
                        type="text"
                        placeholder="user_123"
                        className="w-full p-2 border rounded-md text-sm"
                        tabIndex={0}
                        aria-label="ID de usuario para el token"
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-2 block">Sesión ID (opcional)</label>
                      <input
                        type="text"
                        placeholder="session_456"
                        className="w-full p-2 border rounded-md text-sm"
                        tabIndex={0}
                        aria-label="ID de sesión para el token"
                      />
                    </div>
                    
                    <Button 
                      onClick={() => generateToken()}
                      className="w-full"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Generar Nuevo Token
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Validador de Tokens
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Token ID</label>
                      <input
                        type="text"
                        placeholder="token_123"
                        className="w-full p-2 border rounded-md text-sm"
                        tabIndex={0}
                        aria-label="ID del token a validar"
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-2 block">Valor del Token</label>
                      <input
                        type="text"
                        placeholder="a1b2c3d4e5f6..."
                        className="w-full p-2 border rounded-md text-sm"
                        tabIndex={0}
                        aria-label="Valor del token a validar"
                      />
                    </div>
                    
                    <Button 
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        // Aquí se validaría el token
                        console.log('Validando token...');
                      }}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Validar Token
                    </Button>
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
            <span>{filteredTokens.length} tokens mostrados</span>
            <span>•</span>
            <span>{filteredAttacks.length} ataques</span>
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
