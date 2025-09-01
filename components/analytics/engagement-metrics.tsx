'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Activity, 
  TrendingUp, 
  Clock, 
  Target, 
  BarChart3,
  LineChart,
  PieChart,
  ArrowUp,
  ArrowDown,
  Minus,
  Eye,
  Heart,
  Zap,
  Calendar,
  Download,
  RefreshCw,
  Filter,
  Info,
  AlertTriangle,
  CheckCircle,
  Star,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Share2,
  BookOpen,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Brain
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface EngagementMetricsProps {
  className?: string;
  refreshInterval?: number;
  showDetailedAnalysis?: boolean;
  showRetentionCohorts?: boolean;
  showUserJourney?: boolean;
}

interface EngagementData {
  overview: {
    totalUsers: number;
    activeUsers: {
      daily: number;
      weekly: number;
      monthly: number;
    };
    engagementRate: number;
    averageSessionDuration: number;
    bounceRate: number;
    retentionRate: {
      day1: number;
      day7: number;
      day30: number;
    };
  };
  userActivity: {
    dailyActiveUsers: Array<{ date: string; users: number; change: number }>;
    sessionDuration: Array<{ date: string; duration: number; change: number }>;
    pageViews: Array<{ date: string; views: number; change: number }>;
    interactions: Array<{ date: string; interactions: number; change: number }>;
  };
  retention: {
    cohortAnalysis: Array<{
      cohort: string;
      size: number;
      retention: Array<{ day: number; rate: number }>;
    }>;
    churnAnalysis: {
      churnRate: number;
      churnReasons: Array<{ reason: string; percentage: number }>;
      reengagementRate: number;
    };
  };
  userJourney: {
    entryPoints: Array<{ page: string; count: number; percentage: number }>;
    exitPoints: Array<{ page: string; count: number; percentage: number }>;
    conversionFunnels: Array<{
      name: string;
      steps: Array<{ step: string; users: number; conversion: number }>;
    }>;
    userPaths: Array<{
      path: string;
      users: number;
      averageTime: number;
      completionRate: number;
    }>;
  };
  contentEngagement: {
    popularContent: Array<{
      id: string;
      title: string;
      views: number;
      timeSpent: number;
      engagement: number;
      completionRate: number;
    }>;
    engagementByType: Array<{
      type: string;
      users: number;
      averageTime: number;
      satisfaction: number;
    }>;
  };
  behavioralInsights: {
    peakHours: Array<{ hour: number; users: number }>;
    preferredDevices: Array<{ device: string; users: number; percentage: number }>;
    userSegments: Array<{
      segment: string;
      size: number;
      engagement: number;
      retention: number;
      characteristics: string[];
    }>;
  };
}

export const EngagementMetrics: React.FC<EngagementMetricsProps> = ({
  className = '',
  refreshInterval = 300000, // 5 minutos
  showDetailedAnalysis = true,
  showRetentionCohorts = true,
  showUserJourney = true
}) => {
  const [engagementData, setEngagementData] = useState<EngagementData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d'>('30d');
  const [selectedView, setSelectedView] = useState<'overview' | 'activity' | 'retention' | 'journey' | 'content' | 'insights'>('overview');

  // Cargar datos de engagement
  const loadEngagementData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/analytics?action=engagement_metrics&period=${selectedPeriod}`);
      if (!response.ok) {
        throw new Error('Error cargando métricas de engagement');
      }

      const result = await response.json();
      if (result.success) {
        setEngagementData(result.data);
        setLastUpdated(new Date());
      } else {
        throw new Error(result.error || 'Error desconocido');
      }
    } catch (error) {
      console.error('Error cargando engagement:', error);
      setError(error instanceof Error ? error.message : 'Error desconocido');
      
      // Datos de prueba para desarrollo
      setEngagementData(generateMockEngagementData());
      setLastUpdated(new Date());
    } finally {
      setIsLoading(false);
    }
  }, [selectedPeriod]);

  // Generar datos de prueba
  const generateMockEngagementData = (): EngagementData => {
    return {
      overview: {
        totalUsers: 1247,
        activeUsers: {
          daily: 342,
          weekly: 892,
          monthly: 1189
        },
        engagementRate: 84.4,
        averageSessionDuration: 25.3,
        bounceRate: 18.7,
        retentionRate: {
          day1: 78.5,
          day7: 45.2,
          day30: 23.8
        }
      },
      userActivity: {
        dailyActiveUsers: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          users: Math.floor(Math.random() * 200) + 200,
          change: Math.floor(Math.random() * 20) - 10
        })),
        sessionDuration: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          duration: Math.floor(Math.random() * 30) + 15,
          change: Math.floor(Math.random() * 10) - 5
        })),
        pageViews: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          views: Math.floor(Math.random() * 1000) + 500,
          change: Math.floor(Math.random() * 15) - 7
        })),
        interactions: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          interactions: Math.floor(Math.random() * 500) + 200,
          change: Math.floor(Math.random() * 12) - 6
        }))
      },
      retention: {
        cohortAnalysis: [
          {
            cohort: 'Enero 2024',
            size: 156,
            retention: [
              { day: 1, rate: 85.2 },
              { day: 7, rate: 52.1 },
              { day: 30, rate: 28.4 }
            ]
          },
          {
            cohort: 'Febrero 2024',
            size: 189,
            retention: [
              { day: 1, rate: 82.7 },
              { day: 7, rate: 48.9 },
              { day: 30, rate: 25.1 }
            ]
          }
        ],
        churnAnalysis: {
          churnRate: 12.3,
          churnReasons: [
            { reason: 'Contenido no relevante', percentage: 35 },
            { reason: 'Dificultad técnica', percentage: 25 },
            { reason: 'Falta de tiempo', percentage: 20 },
            { reason: 'Otros', percentage: 20 }
          ],
          reengagementRate: 18.7
        }
      },
      userJourney: {
        entryPoints: [
          { page: '/dashboard', count: 456, percentage: 45.6 },
          { page: '/lessons', count: 234, percentage: 23.4 },
          { page: '/assessments', count: 189, percentage: 18.9 },
          { page: '/profile', count: 121, percentage: 12.1 }
        ],
        exitPoints: [
          { page: '/lessons', count: 234, percentage: 28.4 },
          { page: '/assessments', count: 189, percentage: 22.9 },
          { page: '/dashboard', count: 156, percentage: 18.9 },
          { page: '/profile', count: 98, percentage: 11.9 }
        ],
        conversionFunnels: [
          {
            name: 'Completar Lección',
            steps: [
              { step: 'Ver lección', users: 1000, conversion: 100 },
              { step: 'Iniciar lección', users: 850, conversion: 85 },
              { step: 'Completar lección', users: 720, conversion: 72 },
              { step: 'Tomar evaluación', users: 650, conversion: 65 }
            ]
          }
        ],
        userPaths: [
          {
            path: 'Dashboard → Lecciones → Evaluación',
            users: 456,
            averageTime: 25,
            completionRate: 78.5
          },
          {
            path: 'Lecciones → Dashboard → Perfil',
            users: 234,
            averageTime: 18,
            completionRate: 65.2
          }
        ]
      },
      contentEngagement: {
        popularContent: [
          {
            id: 'lesson-1',
            title: 'Matemáticas Maya Básicas',
            views: 1247,
            timeSpent: 15.5,
            engagement: 89.2,
            completionRate: 87.5
          },
          {
            id: 'lesson-2',
            title: 'Historia de los Pueblos Originarios',
            views: 1156,
            timeSpent: 12.8,
            engagement: 92.1,
            completionRate: 91.3
          }
        ],
        engagementByType: [
          {
            type: 'Lecciones Interactivas',
            users: 892,
            averageTime: 18.5,
            satisfaction: 4.2
          },
          {
            type: 'Evaluaciones',
            users: 567,
            averageTime: 8.3,
            satisfaction: 3.8
          },
          {
            type: 'Contenido Cultural',
            users: 734,
            averageTime: 12.1,
            satisfaction: 4.5
          }
        ]
      },
      behavioralInsights: {
        peakHours: Array.from({ length: 24 }, (_, i) => ({
          hour: i,
          users: Math.floor(Math.random() * 100) + 20
        })),
        preferredDevices: [
          { device: 'Móvil', users: 567, percentage: 45.4 },
          { device: 'Desktop', users: 456, percentage: 36.5 },
          { device: 'Tablet', users: 224, percentage: 18.1 }
        ],
        userSegments: [
          {
            segment: 'Estudiantes Activos',
            size: 456,
            engagement: 92.3,
            retention: 78.5,
            characteristics: ['Sesiones largas', 'Alto engagement', 'Completación alta']
          },
          {
            segment: 'Estudiantes Ocasionales',
            size: 234,
            engagement: 65.7,
            retention: 45.2,
            characteristics: ['Sesiones cortas', 'Engagement medio', 'Completación variable']
          }
        ]
      }
    };
  };

  // Cargar datos al montar
  useEffect(() => {
    loadEngagementData();
  }, [loadEngagementData]);

  // Auto-refresh
  useEffect(() => {
    const interval = setInterval(loadEngagementData, refreshInterval);
    return () => clearInterval(interval);
  }, [loadEngagementData, refreshInterval]);

  // Obtener icono de cambio
  const getChangeIcon = (change: number) => {
    if (change > 0) return <ArrowUp className="w-4 h-4 text-green-500" />;
    if (change < 0) return <ArrowDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-gray-500" />;
  };

  // Obtener color de cambio
  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  // Obtener color de estado
  const getStatusColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value >= thresholds.good) return 'text-green-600';
    if (value >= thresholds.warning) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (isLoading && !engagementData) {
    return (
      <div className={cn("flex items-center justify-center p-8", className)}>
        <div className="flex items-center space-x-2">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Cargando métricas de engagement...</span>
        </div>
      </div>
    );
  }

  if (error && !engagementData) {
    return (
      <div className={cn("flex items-center justify-center p-8", className)}>
        <div className="flex items-center space-x-2 text-red-600">
          <AlertTriangle className="w-5 h-5" />
          <span>Error: {error}</span>
        </div>
      </div>
    );
  }

  if (!engagementData) return null;

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Métricas de Engagement</h1>
          <p className="text-gray-600 mt-1">
            Análisis detallado de engagement, retención y comportamiento de usuarios
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium">Período:</label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as any)}
              className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              tabIndex={0}
            >
              <option value="7d">Últimos 7 días</option>
              <option value="30d">Últimos 30 días</option>
              <option value="90d">Últimos 90 días</option>
            </select>
          </div>
          
          <Button
            onClick={loadEngagementData}
            disabled={isLoading}
            variant="outline"
            size="sm"
            tabIndex={0}
          >
            <RefreshCw className={cn("w-4 h-4 mr-2", isLoading && "animate-spin")} />
            Actualizar
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            tabIndex={0}
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Métricas de Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{engagementData.overview.engagementRate}%</div>
            <Progress value={engagementData.overview.engagementRate} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              Tasa de participación activa
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Duración de Sesión</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{engagementData.overview.averageSessionDuration} min</div>
            <p className="text-xs text-muted-foreground">
              Tiempo promedio por sesión
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Rebote</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{engagementData.overview.bounceRate}%</div>
            <p className="text-xs text-muted-foreground">
              Usuarios que abandonan rápidamente
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Retención D1</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{engagementData.overview.retentionRate.day1}%</div>
            <p className="text-xs text-muted-foreground">
              Retención al día siguiente
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de navegación */}
      <Tabs value={selectedView} onValueChange={(value) => setSelectedView(value as any)}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview" tabIndex={0}>
            <Eye className="w-4 h-4 mr-2" />
            Resumen
          </TabsTrigger>
          <TabsTrigger value="activity" tabIndex={0}>
            <Activity className="w-4 h-4 mr-2" />
            Actividad
          </TabsTrigger>
          {showRetentionCohorts && (
            <TabsTrigger value="retention" tabIndex={0}>
              <TrendingUp className="w-4 h-4 mr-2" />
              Retención
            </TabsTrigger>
          )}
          {showUserJourney && (
            <TabsTrigger value="journey" tabIndex={0}>
              <Share2 className="w-4 h-4 mr-2" />
              Journey
            </TabsTrigger>
          )}
          <TabsTrigger value="content" tabIndex={0}>
            <BookOpen className="w-4 h-4 mr-2" />
            Contenido
          </TabsTrigger>
          <TabsTrigger value="insights" tabIndex={0}>
            <Brain className="w-4 h-4 mr-2" />
            Insights
          </TabsTrigger>
        </TabsList>

        {/* Tab de Resumen */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Usuarios Activos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Usuarios Activos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Diarios (DAU)</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold">{engagementData.overview.activeUsers.daily}</span>
                      {getChangeIcon(5.2)}
                      <span className={getChangeColor(5.2)}>+5.2%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Semanales (WAU)</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold">{engagementData.overview.activeUsers.weekly}</span>
                      {getChangeIcon(3.8)}
                      <span className={getChangeColor(3.8)}>+3.8%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Mensuales (MAU)</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold">{engagementData.overview.activeUsers.monthly}</span>
                      {getChangeIcon(7.1)}
                      <span className={getChangeColor(7.1)}>+7.1%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Métricas de Retención */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Métricas de Retención
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Día 1</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold">{engagementData.overview.retentionRate.day1}%</span>
                      <Badge variant="outline" className={getStatusColor(engagementData.overview.retentionRate.day1, { good: 80, warning: 60 })}>
                        Excelente
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Día 7</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold">{engagementData.overview.retentionRate.day7}%</span>
                      <Badge variant="outline" className={getStatusColor(engagementData.overview.retentionRate.day7, { good: 50, warning: 30 })}>
                        Bueno
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Día 30</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold">{engagementData.overview.retentionRate.day30}%</span>
                      <Badge variant="outline" className={getStatusColor(engagementData.overview.retentionRate.day30, { good: 25, warning: 15 })}>
                        Mejorable
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab de Actividad */}
        <TabsContent value="activity" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Usuarios Activos Diarios */}
            <Card>
              <CardHeader>
                <CardTitle>Usuarios Activos Diarios</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-end justify-between space-x-1">
                  {engagementData.userActivity.dailyActiveUsers.slice(-14).map((day, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div className="w-full bg-gray-200 rounded-t-lg relative">
                        <div 
                          className="bg-gradient-to-t from-blue-500 to-blue-600 rounded-t-lg transition-all duration-1000"
                          style={{ height: `${(day.users / 400) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500 mt-2">{day.date.split('-')[2]}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Duración de Sesión */}
            <Card>
              <CardHeader>
                <CardTitle>Duración Promedio de Sesión (minutos)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-end justify-between space-x-1">
                  {engagementData.userActivity.sessionDuration.slice(-14).map((day, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div className="w-full bg-gray-200 rounded-t-lg relative">
                        <div 
                          className="bg-gradient-to-t from-green-500 to-green-600 rounded-t-lg transition-all duration-1000"
                          style={{ height: `${(day.duration / 50) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500 mt-2">{day.date.split('-')[2]}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab de Retención */}
        {showRetentionCohorts && (
          <TabsContent value="retention" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Análisis de Cohortes */}
              <Card>
                <CardHeader>
                  <CardTitle>Análisis de Cohortes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {engagementData.retention.cohortAnalysis.map((cohort, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <h4 className="font-semibold mb-2">{cohort.cohort}</h4>
                        <div className="space-y-2">
                          {cohort.retention.map((retention, rIndex) => (
                            <div key={rIndex} className="flex items-center justify-between">
                              <span>Día {retention.day}</span>
                              <div className="flex items-center space-x-2">
                                <Progress value={retention.rate} className="w-20" />
                                <span className="text-sm font-medium">{retention.rate}%</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Análisis de Churn */}
              <Card>
                <CardHeader>
                  <CardTitle>Análisis de Churn</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span>Tasa de Churn</span>
                        <span className="font-semibold text-red-600">{engagementData.retention.churnAnalysis.churnRate}%</span>
                      </div>
                      <Progress value={engagementData.retention.churnAnalysis.churnRate} className="h-3" />
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-3">Razones de Churn</h4>
                      <div className="space-y-2">
                        {engagementData.retention.churnAnalysis.churnReasons.map((reason, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-sm">{reason.reason}</span>
                            <span className="text-sm font-medium">{reason.percentage}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )}

        {/* Tab de User Journey */}
        {showUserJourney && (
          <TabsContent value="journey" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Puntos de Entrada y Salida */}
              <Card>
                <CardHeader>
                  <CardTitle>Puntos de Entrada y Salida</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Puntos de Entrada</h4>
                      {engagementData.userJourney.entryPoints.map((point, index) => (
                        <div key={index} className="flex items-center justify-between mb-2">
                          <span className="text-sm">{point.page}</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium">{point.count}</span>
                            <span className="text-xs text-gray-500">({point.percentage}%)</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2">Puntos de Salida</h4>
                      {engagementData.userJourney.exitPoints.map((point, index) => (
                        <div key={index} className="flex items-center justify-between mb-2">
                          <span className="text-sm">{point.page}</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium">{point.count}</span>
                            <span className="text-xs text-gray-500">({point.percentage}%)</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Funnels de Conversión */}
              <Card>
                <CardHeader>
                  <CardTitle>Funnels de Conversión</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {engagementData.userJourney.conversionFunnels.map((funnel, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <h4 className="font-semibold mb-3">{funnel.name}</h4>
                        <div className="space-y-2">
                          {funnel.steps.map((step, sIndex) => (
                            <div key={sIndex} className="flex items-center justify-between">
                              <span className="text-sm">{step.step}</span>
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium">{step.users}</span>
                                <span className="text-xs text-gray-500">({step.conversion}%)</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )}

        {/* Tab de Contenido */}
        <TabsContent value="content" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Contenido Popular */}
            <Card>
              <CardHeader>
                <CardTitle>Contenido Más Popular</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {engagementData.contentEngagement.popularContent.map((content, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-2">{content.title}</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Vistas:</span>
                          <p className="font-medium">{content.views.toLocaleString()}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Tiempo:</span>
                          <p className="font-medium">{content.timeSpent} min</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Engagement:</span>
                          <p className="font-medium">{content.engagement}%</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Completación:</span>
                          <p className="font-medium">{content.completionRate}%</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Engagement por Tipo */}
            <Card>
              <CardHeader>
                <CardTitle>Engagement por Tipo de Contenido</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {engagementData.contentEngagement.engagementByType.map((type, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-2">{type.type}</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Usuarios:</span>
                          <p className="font-medium">{type.users.toLocaleString()}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Tiempo:</span>
                          <p className="font-medium">{type.averageTime} min</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Satisfacción:</span>
                          <div className="flex items-center space-x-1">
                            {Array.from({ length: 5 }, (_, i) => (
                              <Star
                                key={i}
                                className={cn(
                                  "w-4 h-4",
                                  i < Math.floor(type.satisfaction)
                                    ? "text-yellow-400 fill-current"
                                    : "text-gray-300"
                                )}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab de Insights */}
        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Horas Pico */}
            <Card>
              <CardHeader>
                <CardTitle>Horas de Mayor Actividad</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-end justify-between space-x-1">
                  {engagementData.behavioralInsights.peakHours.map((hour, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div className="w-full bg-gray-200 rounded-t-lg relative">
                        <div 
                          className="bg-gradient-to-t from-purple-500 to-purple-600 rounded-t-lg transition-all duration-1000"
                          style={{ height: `${(hour.users / 120) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500 mt-2">{hour.hour}:00</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Dispositivos Preferidos */}
            <Card>
              <CardHeader>
                <CardTitle>Dispositivos Preferidos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {engagementData.behavioralInsights.preferredDevices.map((device, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="font-medium">{device.device}</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold">{device.users.toLocaleString()}</span>
                        <span className="text-sm text-gray-500">({device.percentage}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Segmentos de Usuarios */}
          <Card>
            <CardHeader>
              <CardTitle>Segmentos de Usuarios</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {engagementData.behavioralInsights.userSegments.map((segment, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-2">{segment.segment}</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                      <div>
                        <span className="text-gray-600">Tamaño:</span>
                        <p className="font-medium">{segment.size.toLocaleString()}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Engagement:</span>
                        <p className="font-medium">{segment.engagement}%</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Retención:</span>
                        <p className="font-medium">{segment.retention}%</p>
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600 text-sm">Características:</span>
                      <ul className="text-sm text-gray-600 mt-1">
                        {segment.characteristics.map((char, cIndex) => (
                          <li key={cIndex} className="flex items-center">
                            <CheckCircle className="w-3 h-3 text-green-500 mr-1" />
                            {char}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Footer con información de actualización */}
      {lastUpdated && (
        <div className="text-center text-sm text-gray-500">
          Última actualización: {lastUpdated.toLocaleString()}
        </div>
      )}
    </div>
  );
};

export default EngagementMetrics;
