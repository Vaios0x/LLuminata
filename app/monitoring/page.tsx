'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  BarChart3, 
  Server, 
  Shield, 
  Eye, 
  Globe,
  Settings,
  RefreshCw,
  Download,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  HelpCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  Users,
  Database,
  Zap,
  Cpu,
  HardDrive,
  Wifi,
  Bell,
  MessageSquare,
  BookOpen,
  Target,
  Award,
  Star,
  MapPin,
  Languages,
  Brain,
  Heart,
  Zap as ZapIcon
} from 'lucide-react';
import { Navbar } from '@/components/ui/navbar';
import { Footer } from '@/components/ui/footer';
import PerformanceDashboard from '@/components/monitoring/performance-dashboard';
import AnalyticsDashboard from '@/components/analytics/analytics-dashboard';
import EngagementMetrics from '@/components/analytics/engagement-metrics';
import RegionalAnalysis from '@/components/analytics/regional-analysis';
import ProgressReport from '@/components/analytics/progress-report';
import { cn } from '@/lib/utils';

export default function MonitoringPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);

  // Datos de resumen para el header
  const summaryData = {
    system: {
      status: 'healthy',
      uptime: '99.7%',
      responseTime: '245ms',
      activeUsers: 892
    },
    alerts: {
      total: 3,
      critical: 0,
      warning: 2,
      info: 1
    },
    performance: {
      cpu: 45.2,
      memory: 67.8,
      disk: 23.4,
      network: 89.1
    }
  };

  // Obtener icono de estado
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'critical':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  // Obtener color de estado
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'critical':
        return 'text-red-600';
      default:
        return 'text-blue-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navbar />
      
      <div className="pt-24 pb-8">
        <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                  Centro de Monitoreo
          </h1>
                <p className="text-gray-600 dark:text-gray-300">
                  Monitoreo completo del sistema, performance y analytics en tiempo real
          </p>
        </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setIsLoading(true)}
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
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Estado General del Sistema */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Estado del Sistema</CardTitle>
                {getStatusIcon(summaryData.system.status)}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold capitalize">{summaryData.system.status}</div>
                <p className="text-xs text-muted-foreground">
                  Uptime: {summaryData.system.uptime}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tiempo de Respuesta</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summaryData.system.responseTime}</div>
                <p className="text-xs text-muted-foreground">
                  Promedio global
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summaryData.system.activeUsers}</div>
                <p className="text-xs text-muted-foreground">
                  En este momento
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Alertas</CardTitle>
                <Bell className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summaryData.alerts.total}</div>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <span className="text-red-600">{summaryData.alerts.critical} críticas</span>
                  <span className="text-yellow-600">{summaryData.alerts.warning} advertencias</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Métricas de Performance Rápidas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">CPU</CardTitle>
                <Cpu className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summaryData.performance.cpu}%</div>
                <p className="text-xs text-muted-foreground">
                  {summaryData.performance.cpu < 70 ? 'Normal' : 'Alto uso'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Memoria</CardTitle>
                <HardDrive className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summaryData.performance.memory}%</div>
                <p className="text-xs text-muted-foreground">
                  {summaryData.performance.memory < 80 ? 'Normal' : 'Alto uso'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Disco</CardTitle>
                <Server className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summaryData.performance.disk}%</div>
                <p className="text-xs text-muted-foreground">
                  {summaryData.performance.disk < 80 ? 'Normal' : 'Alto uso'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Red</CardTitle>
                <Wifi className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summaryData.performance.network}%</div>
                <p className="text-xs text-muted-foreground">
                  {summaryData.performance.network < 80 ? 'Normal' : 'Alto uso'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs de Navegación */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="overview" tabIndex={0}>
                <Eye className="w-4 h-4 mr-2" />
                Resumen
              </TabsTrigger>
              <TabsTrigger value="performance" tabIndex={0}>
                <Activity className="w-4 h-4 mr-2" />
                Performance
              </TabsTrigger>
              <TabsTrigger value="analytics" tabIndex={0}>
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="engagement" tabIndex={0}>
                <Users className="w-4 h-4 mr-2" />
                Engagement
              </TabsTrigger>
              <TabsTrigger value="regional" tabIndex={0}>
                <MapPin className="w-4 h-4 mr-2" />
                Regional
              </TabsTrigger>
              <TabsTrigger value="progress" tabIndex={0}>
                <Target className="w-4 h-4 mr-2" />
                Progreso
              </TabsTrigger>
            </TabsList>

            {/* Tab de Resumen */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Estado de Servicios */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Server className="w-5 h-5 mr-2" />
                      Estado de Servicios
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <div>
                            <h4 className="font-semibold">API Principal</h4>
                            <p className="text-sm text-gray-600">Funcionando correctamente</p>
                          </div>
                        </div>
                        <Badge variant="default">Activo</Badge>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <div>
                            <h4 className="font-semibold">Base de Datos</h4>
                            <p className="text-sm text-gray-600">Conexión estable</p>
              </div>
              </div>
                        <Badge variant="default">Activo</Badge>
              </div>
                      
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <div>
                            <h4 className="font-semibold">Cache Redis</h4>
                            <p className="text-sm text-gray-600">Funcionando</p>
              </div>
            </div>
                        <Badge variant="default">Activo</Badge>
          </div>

                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <div>
                            <h4 className="font-semibold">Servicios de IA</h4>
                            <p className="text-sm text-gray-600">Todos operativos</p>
                          </div>
              </div>
                        <Badge variant="default">Activo</Badge>
              </div>
              </div>
                  </CardContent>
                </Card>

                {/* Alertas Recientes */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Bell className="w-5 h-5 mr-2" />
                      Alertas Recientes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <AlertTriangle className="w-5 h-5 text-yellow-600" />
                          <div>
                            <h4 className="font-semibold">Alto uso de memoria</h4>
                            <p className="text-sm text-gray-600">Hace 5 minutos</p>
              </div>
            </div>
                        <Badge variant="secondary">Media</Badge>
          </div>

                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Info className="w-5 h-5 text-blue-600" />
                          <div>
                            <h4 className="font-semibold">Backup completado</h4>
                            <p className="text-sm text-gray-600">Hace 1 hora</p>
            </div>
          </div>
                        <Badge variant="outline">Info</Badge>
        </div>

                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <div>
                            <h4 className="font-semibold">Sistema estable</h4>
                            <p className="text-sm text-gray-600">Hace 2 horas</p>
                          </div>
                        </div>
                        <Badge variant="default">OK</Badge>
          </div>
        </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Tab de Performance */}
            <TabsContent value="performance" className="space-y-6">
              <PerformanceDashboard 
                className="w-full"
                refreshInterval={30000}
              />
            </TabsContent>

            {/* Tab de Analytics */}
            <TabsContent value="analytics" className="space-y-6">
              <AnalyticsDashboard 
                className="w-full"
                refreshInterval={300000}
                showRegionalAnalysis={true}
                showEngagementMetrics={true}
              />
            </TabsContent>

            {/* Tab de Engagement */}
            <TabsContent value="engagement" className="space-y-6">
              <EngagementMetrics 
                className="w-full"
                refreshInterval={300000}
                showDetailedAnalysis={true}
                showRetentionCohorts={true}
                showUserJourney={true}
              />
            </TabsContent>

            {/* Tab de Análisis Regional */}
            <TabsContent value="regional" className="space-y-6">
              <RegionalAnalysis 
                className="w-full"
                refreshInterval={300000}
                showCulturalMetrics={true}
                showRegionalComparison={true}
                showEffectivenessAnalysis={true}
              />
            </TabsContent>

            {/* Tab de Progreso */}
            <TabsContent value="progress" className="space-y-6">
              <ProgressReport 
                className="w-full"
                studentId="default"
                refreshInterval={300000}
                showDetailedMetrics={true}
                showComparisons={true}
                showRecommendations={true}
              />
            </TabsContent>
          </Tabs>
      </div>
      </div>

      <Footer />
    </div>
  );
}
