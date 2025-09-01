'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Users, 
  TrendingUp, 
  BookOpen, 
  Award, 
  Activity, 
  Eye, 
  Clock, 
  Target,
  BarChart3,
  PieChart,
  LineChart,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface AdminDashboardProps {
  className?: string;
  refreshInterval?: number;
}

interface DashboardData {
  overview: {
    totalUsers: number;
    activeUsers: number;
    totalLessons: number;
    totalAssessments: number;
    systemHealth: 'excellent' | 'good' | 'warning' | 'critical';
  };
  performance: {
    averageResponseTime: number;
    errorRate: number;
    uptime: number;
    memoryUsage: number;
    cpuUsage: number;
  };
  userGrowth: {
    newUsers: number;
    returningUsers: number;
    churnRate: number;
    growthRate: number;
  };
  contentPerformance: {
    popularLessons: Array<{ id: string; title: string; views: number; completionRate: number }>;
    difficultContent: Array<{ id: string; title: string; failureRate: number; avgTime: number }>;
    userFeedback: Array<{ contentId: string; rating: number; comments: number }>;
  };
  accessibility: {
    screenReaderUsage: number;
    highContrastUsage: number;
    voiceNavigationUsage: number;
    accessibilityIssues: number;
  };
}

/**
 * Dashboard de administración con analytics completos
 */
export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  className = '',
  refreshInterval = 300000 // 5 minutos
}) => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Cargar datos del dashboard
  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/analytics?action=admin_dashboard');
      if (!response.ok) {
        throw new Error('Error cargando datos del dashboard');
      }

      const result = await response.json();
      if (result.success) {
        setDashboardData(result.data);
        setLastUpdated(new Date());
      } else {
        throw new Error(result.error || 'Error desconocido');
      }
    } catch (error) {
      console.error('Error cargando dashboard:', error);
      setError(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar datos al montar
  useEffect(() => {
    loadDashboardData();
  }, []);

  // Auto-refresh
  useEffect(() => {
    const interval = setInterval(loadDashboardData, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  // Obtener color del estado de salud del sistema
  const getSystemHealthColor = (health: string) => {
    switch (health) {
      case 'excellent':
        return 'text-green-600 bg-green-100';
      case 'good':
        return 'text-blue-600 bg-blue-100';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100';
      case 'critical':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  // Obtener icono del estado de salud
  const getSystemHealthIcon = (health: string) => {
    switch (health) {
      case 'excellent':
        return <CheckCircle className="h-4 w-4" />;
      case 'good':
        return <CheckCircle className="h-4 w-4" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />;
      case 'critical':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  if (isLoading && !dashboardData) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-8 ${className}`}>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-red-600">
              <XCircle className="h-5 w-5" />
              <h3 className="font-semibold">Error cargando dashboard</h3>
            </div>
            <p className="text-red-600 mt-2">{error}</p>
            <Button 
              onClick={loadDashboardData} 
              variant="outline" 
              className="mt-4"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!dashboardData) {
    return null;
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard de Administración</h1>
          <p className="text-muted-foreground">
            Métricas y analytics de LLuminata
          </p>
        </div>
        <div className="flex items-center space-x-4">
          {lastUpdated && (
            <p className="text-sm text-muted-foreground">
              Última actualización: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
          <Button onClick={loadDashboardData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.overview.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +{dashboardData.userGrowth.newUsers} nuevos este mes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.overview.activeUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {((dashboardData.overview.activeUsers / dashboardData.overview.totalUsers) * 100).toFixed(1)}% del total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lecciones</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.overview.totalLessons.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {dashboardData.overview.totalAssessments} evaluaciones
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Salud del Sistema</CardTitle>
            {getSystemHealthIcon(dashboardData.overview.systemHealth)}
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Badge className={getSystemHealthColor(dashboardData.overview.systemHealth)}>
                {dashboardData.overview.systemHealth.toUpperCase()}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Uptime: {dashboardData.performance.uptime.toFixed(2)}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs principales */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="performance">Rendimiento</TabsTrigger>
          <TabsTrigger value="users">Usuarios</TabsTrigger>
          <TabsTrigger value="content">Contenido</TabsTrigger>
          <TabsTrigger value="accessibility">Accesibilidad</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Métricas de crecimiento */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Crecimiento de Usuarios</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      +{dashboardData.userGrowth.newUsers}
                    </div>
                    <p className="text-sm text-muted-foreground">Nuevos usuarios</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {dashboardData.userGrowth.returningUsers}
                    </div>
                    <p className="text-sm text-muted-foreground">Usuarios recurrentes</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Tasa de crecimiento</span>
                    <span className="text-sm font-medium">
                      {dashboardData.userGrowth.growthRate > 0 ? '+' : ''}{dashboardData.userGrowth.growthRate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Tasa de abandono</span>
                    <span className="text-sm font-medium text-red-600">
                      {dashboardData.userGrowth.churnRate.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Métricas de rendimiento */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Rendimiento del Sistema</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Tiempo de respuesta</span>
                    <span className="text-sm font-medium">
                      {dashboardData.performance.averageResponseTime}ms
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Tasa de errores</span>
                    <span className="text-sm font-medium">
                      {dashboardData.performance.errorRate.toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Uso de memoria</span>
                    <span className="text-sm font-medium">
                      {dashboardData.performance.memoryUsage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Uso de CPU</span>
                    <span className="text-sm font-medium">
                      {dashboardData.performance.cpuUsage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico de rendimiento */}
            <Card>
              <CardHeader>
                <CardTitle>Métricas de Rendimiento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                    <p>Gráfico de rendimiento</p>
                    <p className="text-sm">Integración con librería de gráficos</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Alertas de rendimiento */}
            <Card>
              <CardHeader>
                <CardTitle>Alertas de Rendimiento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dashboardData.performance.errorRate > 5 && (
                    <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <XCircle className="h-4 w-4 text-red-600" />
                      <div>
                        <p className="text-sm font-medium text-red-600">Tasa de errores alta</p>
                        <p className="text-xs text-red-600">
                          {dashboardData.performance.errorRate.toFixed(2)}% de errores
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {dashboardData.performance.memoryUsage > 80 && (
                    <div className="flex items-center space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      <div>
                        <p className="text-sm font-medium text-yellow-600">Uso de memoria alto</p>
                        <p className="text-xs text-yellow-600">
                          {dashboardData.performance.memoryUsage.toFixed(1)}% de memoria utilizada
                        </p>
                      </div>
                    </div>
                  )}

                  {dashboardData.performance.averageResponseTime > 1000 && (
                    <div className="flex items-center space-x-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <Clock className="h-4 w-4 text-orange-600" />
                      <div>
                        <p className="text-sm font-medium text-orange-600">Tiempo de respuesta lento</p>
                        <p className="text-xs text-orange-600">
                          {dashboardData.performance.averageResponseTime}ms promedio
                        </p>
                      </div>
                    </div>
                  )}

                  {dashboardData.performance.errorRate <= 5 && 
                   dashboardData.performance.memoryUsage <= 80 && 
                   dashboardData.performance.averageResponseTime <= 1000 && (
                    <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <div>
                        <p className="text-sm font-medium text-green-600">Sistema funcionando correctamente</p>
                        <p className="text-xs text-green-600">Todas las métricas están en rango normal</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Análisis de usuarios */}
            <Card>
              <CardHeader>
                <CardTitle>Análisis de Usuarios</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <PieChart className="h-12 w-12 mx-auto mb-2" />
                    <p>Distribución de usuarios</p>
                    <p className="text-sm">Por edad, ubicación, etc.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Journey del usuario */}
            <Card>
              <CardHeader>
                <CardTitle>Journey del Usuario</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <LineChart className="h-12 w-12 mx-auto mb-2" />
                    <p>Flujo de usuarios</p>
                    <p className="text-sm">Puntos de entrada y salida</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Lecciones populares */}
            <Card>
              <CardHeader>
                <CardTitle>Lecciones Más Populares</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dashboardData.contentPerformance.popularLessons.slice(0, 5).map((lesson, index) => (
                    <div key={lesson.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{lesson.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {lesson.views} vistas • {(lesson.completionRate * 100).toFixed(1)}% completado
                        </p>
                      </div>
                      <Badge variant="secondary">#{index + 1}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Contenido difícil */}
            <Card>
              <CardHeader>
                <CardTitle>Contenido que Necesita Atención</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dashboardData.contentPerformance.difficultContent.slice(0, 5).map((content, index) => (
                    <div key={content.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{content.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {(content.failureRate * 100).toFixed(1)}% fallas • {content.avgTime}min promedio
                        </p>
                      </div>
                      <Badge variant="destructive">Difícil</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="accessibility" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Uso de características de accesibilidad */}
            <Card>
              <CardHeader>
                <CardTitle>Uso de Características de Accesibilidad</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Lector de pantalla</span>
                    <span className="text-sm font-medium">
                      {dashboardData.accessibility.screenReaderUsage} usuarios
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Alto contraste</span>
                    <span className="text-sm font-medium">
                      {dashboardData.accessibility.highContrastUsage} usuarios
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Navegación por voz</span>
                    <span className="text-sm font-medium">
                      {dashboardData.accessibility.voiceNavigationUsage} usuarios
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Problemas de accesibilidad */}
            <Card>
              <CardHeader>
                <CardTitle>Problemas de Accesibilidad</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600 mb-2">
                    {dashboardData.accessibility.accessibilityIssues}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Problemas reportados
                  </p>
                  <Button variant="outline" className="mt-4">
                    <Eye className="h-4 w-4 mr-2" />
                    Ver detalles
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Acciones */}
      <div className="flex justify-end space-x-4">
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Exportar Reporte
        </Button>
        <Button>
          <Target className="h-4 w-4 mr-2" />
          Configurar Alertas
        </Button>
      </div>
    </div>
  );
};

export default AdminDashboard;
