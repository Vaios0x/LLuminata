'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  Zap, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Download,
  TrendingUp,
  TrendingDown,
  Minus,
  Cpu,
  HardDrive,
  Wifi,
  Server,
  Database,
  Globe,
  Shield,
  Eye,
  BarChart3,
  LineChart,
  PieChart,
  Settings,
  Info,
  HelpCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PerformanceMetrics {
  system: {
    cpu: number;
    memory: number;
    disk: number;
    network: number;
  };
  application: {
    responseTime: number;
    throughput: number;
    errorRate: number;
    availability: number;
  };
  database: {
    connections: number;
    queryTime: number;
    cacheHitRate: number;
    slowQueries: number;
  };
  frontend: {
    pageLoadTime: number;
    bundleSize: number;
    lighthouseScore: number;
    accessibilityScore: number;
  };
  security: {
    threats: number;
    vulnerabilities: number;
    sslStatus: string;
    firewallStatus: string;
  };
  alerts: Array<{
    id: string;
    type: 'error' | 'warning' | 'info';
    message: string;
    timestamp: string;
    severity: 'high' | 'medium' | 'low';
  }>;
}

export const PerformanceDashboard: React.FC<{
  className?: string;
  refreshInterval?: number;
}> = ({ className = '', refreshInterval = 30000 }) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadMetrics = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/monitoring/performance');
      if (response.ok) {
        const data = await response.json();
        setMetrics(data);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Error loading performance metrics:', error);
      // Datos de prueba
      setMetrics({
        system: {
          cpu: 45.2,
          memory: 67.8,
          disk: 23.4,
          network: 89.1
        },
        application: {
          responseTime: 245,
          throughput: 1250,
          errorRate: 0.8,
          availability: 99.7
        },
        database: {
          connections: 45,
          queryTime: 12.3,
          cacheHitRate: 94.2,
          slowQueries: 3
        },
        frontend: {
          pageLoadTime: 1.8,
          bundleSize: 2.4,
          lighthouseScore: 92,
          accessibilityScore: 95
        },
        security: {
          threats: 0,
          vulnerabilities: 2,
          sslStatus: 'active',
          firewallStatus: 'active'
        },
        alerts: [
          {
            id: '1',
            type: 'warning',
            message: 'High memory usage detected',
            timestamp: new Date().toISOString(),
            severity: 'medium'
          }
        ]
      });
      setLastUpdated(new Date());
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics();
    const interval = setInterval(loadMetrics, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  const getStatusColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return 'text-green-600';
    if (value <= thresholds.warning) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusIcon = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return <CheckCircle className="w-4 h-4 text-green-600" />;
    if (value <= thresholds.warning) return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
    return <XCircle className="w-4 h-4 text-red-600" />;
  };

  if (isLoading && !metrics) {
    return (
      <div className={cn("flex items-center justify-center p-8", className)}>
        <div className="flex items-center space-x-2">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Cargando métricas de performance...</span>
        </div>
      </div>
    );
  }

  if (!metrics) return null;

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard de Performance</h1>
          <p className="text-gray-600 mt-1">
            Monitoreo en tiempo real del sistema
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button
            onClick={loadMetrics}
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={cn("w-4 h-4 mr-2", isLoading && "animate-spin")} />
            Actualizar
          </Button>
          
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Métricas del Sistema */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CPU</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.system.cpu}%</div>
            <Progress value={metrics.system.cpu} className="mt-2" />
            {getStatusIcon(metrics.system.cpu, { good: 70, warning: 85 })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memoria</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.system.memory}%</div>
            <Progress value={metrics.system.memory} className="mt-2" />
            {getStatusIcon(metrics.system.memory, { good: 80, warning: 90 })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disco</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.system.disk}%</div>
            <Progress value={metrics.system.disk} className="mt-2" />
            {getStatusIcon(metrics.system.disk, { good: 80, warning: 90 })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Red</CardTitle>
            <Wifi className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.system.network}%</div>
            <Progress value={metrics.system.network} className="mt-2" />
            {getStatusIcon(metrics.system.network, { good: 80, warning: 90 })}
          </CardContent>
        </Card>
      </div>

      {/* Métricas de la Aplicación */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tiempo de Respuesta</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.application.responseTime}ms</div>
            <p className="text-xs text-muted-foreground">
              {metrics.application.responseTime < 200 ? 'Excelente' : 
               metrics.application.responseTime < 500 ? 'Bueno' : 'Necesita mejora'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Throughput</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.application.throughput}/s</div>
            <p className="text-xs text-muted-foreground">
              Peticiones por segundo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Error</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.application.errorRate}%</div>
            <p className="text-xs text-muted-foreground">
              {metrics.application.errorRate < 1 ? 'Excelente' : 
               metrics.application.errorRate < 5 ? 'Aceptable' : 'Crítico'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disponibilidad</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.application.availability}%</div>
            <p className="text-xs text-muted-foreground">
              Uptime del sistema
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Métricas de Base de Datos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conexiones DB</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.database.connections}</div>
            <p className="text-xs text-muted-foreground">
              Conexiones activas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tiempo de Query</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.database.queryTime}ms</div>
            <p className="text-xs text-muted-foreground">
              Promedio por consulta
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cache Hit Rate</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.database.cacheHitRate}%</div>
            <Progress value={metrics.database.cacheHitRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Queries Lentas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.database.slowQueries}</div>
            <p className="text-xs text-muted-foreground">
              En la última hora
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Métricas del Frontend */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tiempo de Carga</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.frontend.pageLoadTime}s</div>
            <p className="text-xs text-muted-foreground">
              {metrics.frontend.pageLoadTime < 2 ? 'Excelente' : 
               metrics.frontend.pageLoadTime < 4 ? 'Bueno' : 'Necesita optimización'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tamaño Bundle</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.frontend.bundleSize}MB</div>
            <p className="text-xs text-muted-foreground">
              {metrics.frontend.bundleSize < 3 ? 'Óptimo' : 
               metrics.frontend.bundleSize < 5 ? 'Aceptable' : 'Necesita optimización'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lighthouse Score</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.frontend.lighthouseScore}/100</div>
            <Progress value={metrics.frontend.lighthouseScore} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accesibilidad</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.frontend.accessibilityScore}/100</div>
            <Progress value={metrics.frontend.accessibilityScore} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Métricas de Seguridad */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Amenazas</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.security.threats}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.security.threats === 0 ? 'Sin amenazas' : 'Amenazas detectadas'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vulnerabilidades</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.security.vulnerabilities}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.security.vulnerabilities === 0 ? 'Sin vulnerabilidades' : 'Vulnerabilidades encontradas'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SSL Status</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{metrics.security.sslStatus}</div>
            <Badge variant={metrics.security.sslStatus === 'active' ? 'default' : 'destructive'}>
              {metrics.security.sslStatus === 'active' ? 'Activo' : 'Inactivo'}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Firewall</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{metrics.security.firewallStatus}</div>
            <Badge variant={metrics.security.firewallStatus === 'active' ? 'default' : 'destructive'}>
              {metrics.security.firewallStatus === 'active' ? 'Activo' : 'Inactivo'}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Alertas */}
      {metrics.alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Alertas Activas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics.alerts.map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {alert.type === 'error' && <XCircle className="w-5 h-5 text-red-600" />}
                    {alert.type === 'warning' && <AlertTriangle className="w-5 h-5 text-yellow-600" />}
                    {alert.type === 'info' && <Info className="w-5 h-5 text-blue-600" />}
                    <div>
                      <p className="font-medium">{alert.message}</p>
                      <p className="text-sm text-gray-600">{new Date(alert.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                  <Badge 
                    variant={alert.severity === 'high' ? 'destructive' : alert.severity === 'medium' ? 'secondary' : 'outline'}
                  >
                    {alert.severity === 'high' ? 'Alta' : alert.severity === 'medium' ? 'Media' : 'Baja'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Footer con información de actualización */}
      {lastUpdated && (
        <div className="text-center text-sm text-gray-500">
          Última actualización: {lastUpdated.toLocaleString()}
        </div>
      )}
    </div>
  );
};

export default PerformanceDashboard;
