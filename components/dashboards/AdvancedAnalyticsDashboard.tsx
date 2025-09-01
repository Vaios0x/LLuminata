'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Target, 
  BarChart3, 
  Activity,
  Plus,
  Settings,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  Play,
  Pause,
  Clock,
  Star,
  Zap,
  Eye,
  MousePointer,
  MousePointerClick,
  Filter,
  Download,
  RefreshCw,
  PieChart,
  LineChart,
  Scatter,
  Calendar,
  MapPin,
  Globe,
  Smartphone,
  Monitor
} from 'lucide-react';

interface AnalyticsMetric {
  id: string;
  name: string;
  value: number;
  previousValue: number;
  change: number;
  changePercent: number;
  trend: 'up' | 'down' | 'stable';
  category: string;
  unit: string;
  description: string;
}

interface UserSegment {
  id: string;
  name: string;
  description: string;
  criteria: Record<string, any>;
  size: number;
  percentage: number;
  engagement: number;
  retention: number;
  lifetimeValue: number;
  growth: number;
}

interface FunnelStage {
  id: string;
  name: string;
  users: number;
  conversionRate: number;
  dropoffRate: number;
  averageTime: number;
  revenue: number;
}

interface CohortAnalysis {
  cohort: string;
  size: number;
  retention: {
    day1: number;
    day7: number;
    day30: number;
    day90: number;
  };
  revenue: {
    day1: number;
    day7: number;
    day30: number;
    day90: number;
  };
}

interface PredictiveMetric {
  id: string;
  name: string;
  currentValue: number;
  predictedValue: number;
  confidence: number;
  trend: 'up' | 'down' | 'stable';
  factors: string[];
  impact: 'high' | 'medium' | 'low';
}

interface GeographicData {
  country: string;
  region: string;
  users: number;
  sessions: number;
  revenue: number;
  conversionRate: number;
  growth: number;
}

interface DeviceData {
  device: string;
  users: number;
  sessions: number;
  bounceRate: number;
  avgSessionDuration: number;
  conversionRate: number;
}

interface AdvancedAnalyticsStats {
  totalUsers: number;
  activeUsers: number;
  totalRevenue: number;
  averageOrderValue: number;
  conversionRate: number;
  churnRate: number;
  customerLifetimeValue: number;
  netPromoterScore: number;
  topMetrics: AnalyticsMetric[];
  userSegments: UserSegment[];
  funnelStages: FunnelStage[];
  cohorts: CohortAnalysis[];
  predictions: PredictiveMetric[];
  geographicData: GeographicData[];
  deviceData: DeviceData[];
}

export default function AdvancedAnalyticsDashboard() {
  const [stats, setStats] = useState<AdvancedAnalyticsStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
    conversionRate: 0,
    churnRate: 0,
    customerLifetimeValue: 0,
    netPromoterScore: 0,
    topMetrics: [],
    userSegments: [],
    funnelStages: [],
    cohorts: [],
    predictions: [],
    geographicData: [],
    deviceData: []
  });
  const [loading, setLoading] = useState(true);
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<string>('30d');
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);

  useEffect(() => {
    loadAdvancedAnalyticsData();
  }, [timeRange]);

  const loadAdvancedAnalyticsData = async () => {
    setLoading(true);
    try {
      // Simular carga de datos
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockTopMetrics: AnalyticsMetric[] = [
        {
          id: '1',
          name: 'Usuarios Activos Diarios',
          value: 12470,
          previousValue: 11890,
          change: 580,
          changePercent: 4.9,
          trend: 'up',
          category: 'engagement',
          unit: 'usuarios',
          description: 'Usuarios únicos que interactuaron hoy'
        },
        {
          id: '2',
          name: 'Tasa de Conversión',
          value: 0.0347,
          previousValue: 0.0321,
          change: 0.0026,
          changePercent: 8.1,
          trend: 'up',
          category: 'conversion',
          unit: '%',
          description: 'Porcentaje de visitantes que completan una acción'
        },
        {
          id: '3',
          name: 'Valor Promedio del Cliente',
          value: 156.78,
          previousValue: 142.30,
          change: 14.48,
          changePercent: 10.2,
          trend: 'up',
          category: 'revenue',
          unit: 'MXN',
          description: 'Ingresos promedio por cliente'
        },
        {
          id: '4',
          name: 'Tasa de Abandono',
          value: 0.0234,
          previousValue: 0.0256,
          change: -0.0022,
          changePercent: -8.6,
          trend: 'down',
          category: 'retention',
          unit: '%',
          description: 'Porcentaje de usuarios que abandonan'
        }
      ];

      const mockUserSegments: UserSegment[] = [
        {
          id: '1',
          name: 'Usuarios Premium',
          description: 'Usuarios con suscripción activa',
          criteria: { subscription: 'premium', activeDays: { $gte: 30 } },
          size: 2340,
          percentage: 18.7,
          engagement: 0.89,
          retention: 0.94,
          lifetimeValue: 450.50,
          growth: 12.5
        },
        {
          id: '2',
          name: 'Usuarios Activos',
          description: 'Usuarios que visitan regularmente',
          criteria: { lastVisit: { $gte: '7d' }, sessions: { $gte: 5 } },
          size: 5670,
          percentage: 45.4,
          engagement: 0.67,
          retention: 0.78,
          lifetimeValue: 89.30,
          growth: 8.2
        },
        {
          id: '3',
          name: 'Usuarios Nuevos',
          description: 'Usuarios registrados en los últimos 30 días',
          criteria: { registrationDate: { $gte: '30d' } },
          size: 1890,
          percentage: 15.1,
          engagement: 0.45,
          retention: 0.62,
          lifetimeValue: 23.40,
          growth: 25.8
        }
      ];

      const mockFunnelStages: FunnelStage[] = [
        {
          id: '1',
          name: 'Visita',
          users: 50000,
          conversionRate: 100,
          dropoffRate: 0,
          averageTime: 0,
          revenue: 0
        },
        {
          id: '2',
          name: 'Exploración',
          users: 35000,
          conversionRate: 70,
          dropoffRate: 30,
          averageTime: 120,
          revenue: 0
        },
        {
          id: '3',
          name: 'Interés',
          users: 21000,
          conversionRate: 42,
          dropoffRate: 28,
          averageTime: 300,
          revenue: 0
        },
        {
          id: '4',
          name: 'Consideración',
          users: 12000,
          conversionRate: 24,
          dropoffRate: 18,
          averageTime: 600,
          revenue: 0
        },
        {
          id: '5',
          name: 'Conversión',
          users: 1735,
          conversionRate: 3.47,
          dropoffRate: 20.53,
          averageTime: 900,
          revenue: 156780
        }
      ];

      const mockCohorts: CohortAnalysis[] = [
        {
          cohort: 'Enero 2024',
          size: 1200,
          retention: {
            day1: 100,
            day7: 45,
            day30: 23,
            day90: 12
          },
          revenue: {
            day1: 0,
            day7: 15600,
            day30: 23400,
            day90: 31200
          }
        },
        {
          cohort: 'Febrero 2024',
          size: 1350,
          retention: {
            day1: 100,
            day7: 52,
            day30: 28,
            day90: 15
          },
          revenue: {
            day1: 0,
            day7: 18200,
            day30: 27300,
            day90: 36400
          }
        }
      ];

      const mockPredictions: PredictiveMetric[] = [
        {
          id: '1',
          name: 'Usuarios Activos (30 días)',
          currentValue: 12470,
          predictedValue: 13200,
          confidence: 0.89,
          trend: 'up',
          factors: ['Crecimiento orgánico', 'Campañas de marketing', 'Mejoras en UX'],
          impact: 'high'
        },
        {
          id: '2',
          name: 'Ingresos Mensuales',
          currentValue: 156780,
          predictedValue: 168900,
          confidence: 0.92,
          trend: 'up',
          factors: ['Aumento en conversiones', 'Nuevos productos', 'Precios optimizados'],
          impact: 'high'
        },
        {
          id: '3',
          name: 'Tasa de Abandono',
          currentValue: 0.0234,
          predictedValue: 0.0210,
          confidence: 0.78,
          trend: 'down',
          factors: ['Mejoras en retención', 'Programa de fidelización', 'Soporte mejorado'],
          impact: 'medium'
        }
      ];

      const mockGeographicData: GeographicData[] = [
        {
          country: 'México',
          region: 'CDMX',
          users: 4560,
          sessions: 12340,
          revenue: 45678,
          conversionRate: 0.038,
          growth: 12.5
        },
        {
          country: 'México',
          region: 'Jalisco',
          users: 2340,
          sessions: 6780,
          revenue: 23456,
          conversionRate: 0.035,
          growth: 8.7
        },
        {
          country: 'México',
          region: 'Nuevo León',
          users: 1890,
          sessions: 5234,
          revenue: 18900,
          conversionRate: 0.032,
          growth: 15.2
        }
      ];

      const mockDeviceData: DeviceData[] = [
        {
          device: 'Mobile',
          users: 8900,
          sessions: 23400,
          bounceRate: 0.45,
          avgSessionDuration: 180,
          conversionRate: 0.028
        },
        {
          device: 'Desktop',
          users: 3570,
          sessions: 8900,
          bounceRate: 0.32,
          avgSessionDuration: 420,
          conversionRate: 0.045
        }
      ];

      setStats({
        totalUsers: 12500,
        activeUsers: 12470,
        totalRevenue: 156780,
        averageOrderValue: 89.30,
        conversionRate: 0.0347,
        churnRate: 0.0234,
        customerLifetimeValue: 234.50,
        netPromoterScore: 8.2,
        topMetrics: mockTopMetrics,
        userSegments: mockUserSegments,
        funnelStages: mockFunnelStages,
        cohorts: mockCohorts,
        predictions: mockPredictions,
        geographicData: mockGeographicData,
        deviceData: mockDeviceData
      });
    } catch (error) {
      console.error('Error cargando datos de analytics avanzado:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4" />;
      case 'down': return <TrendingDown className="h-4 w-4" />;
      default: return <BarChart3 className="h-4 w-4" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(2)}%`;
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('es-MX').format(value);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Avanzado</h1>
          <p className="text-gray-600">Análisis profundo y métricas predictivas</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
          <Button size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
        </div>
      </div>

      {/* Selector de rango de tiempo */}
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-600">Período:</span>
        <select 
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="border rounded px-3 py-1 text-sm"
        >
          <option value="7d">Últimos 7 días</option>
          <option value="30d">Últimos 30 días</option>
          <option value="90d">Últimos 90 días</option>
          <option value="1y">Último año</option>
        </select>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.activeUsers)}</div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              {getTrendIcon('up')}
              <span className="text-green-600">+4.9%</span>
              <span>vs mes anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              {getTrendIcon('up')}
              <span className="text-green-600">+10.2%</span>
              <span>vs mes anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Conversión</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(stats.conversionRate)}</div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              {getTrendIcon('up')}
              <span className="text-green-600">+8.1%</span>
              <span>vs mes anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor del Cliente</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.customerLifetimeValue)}</div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              {getTrendIcon('up')}
              <span className="text-green-600">+12.5%</span>
              <span>vs mes anterior</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs principales */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="segments">Segmentación</TabsTrigger>
          <TabsTrigger value="funnel">Embudo</TabsTrigger>
          <TabsTrigger value="cohorts">Cohortes</TabsTrigger>
          <TabsTrigger value="predictions">Predicciones</TabsTrigger>
          <TabsTrigger value="geographic">Geografía</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Métricas principales */}
            <Card>
              <CardHeader>
                <CardTitle>Métricas Clave</CardTitle>
                <CardDescription>Indicadores de rendimiento principales</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.topMetrics.map((metric) => (
                    <div key={metric.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="font-semibold">{metric.name}</div>
                        <div className="text-sm text-gray-500">{metric.description}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">
                          {metric.category === 'revenue' ? formatCurrency(metric.value) :
                           metric.category === 'conversion' || metric.category === 'retention' ? formatPercentage(metric.value) :
                           formatNumber(metric.value)}
                        </div>
                        <div className={`flex items-center space-x-1 text-sm ${getTrendColor(metric.trend)}`}>
                          {getTrendIcon(metric.trend)}
                          <span>{metric.changePercent > 0 ? '+' : ''}{metric.changePercent.toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Dispositivos */}
            <Card>
              <CardHeader>
                <CardTitle>Análisis por Dispositivo</CardTitle>
                <CardDescription>Rendimiento por tipo de dispositivo</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.deviceData.map((device) => (
                    <div key={device.device} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          {device.device === 'Mobile' ? (
                            <Smartphone className="h-4 w-4" />
                          ) : (
                            <Monitor className="h-4 w-4" />
                          )}
                          <span className="font-semibold">{device.device}</span>
                        </div>
                        <Badge variant="outline">{formatNumber(device.users)} usuarios</Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Sesiones:</span>
                          <div className="font-semibold">{formatNumber(device.sessions)}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Tasa de rebote:</span>
                          <div className="font-semibold">{formatPercentage(device.bounceRate)}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Duración promedio:</span>
                          <div className="font-semibold">{device.avgSessionDuration}s</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Conversión:</span>
                          <div className="font-semibold">{formatPercentage(device.conversionRate)}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="segments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Segmentación de Usuarios</CardTitle>
              <CardDescription>Análisis detallado por segmentos de usuarios</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.userSegments.map((segment) => (
                  <div key={segment.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">{segment.name}</h3>
                        <p className="text-sm text-gray-500">{segment.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{formatNumber(segment.size)} usuarios</div>
                        <div className="text-sm text-gray-500">{segment.percentage.toFixed(1)}% del total</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Engagement:</span>
                        <div className="font-semibold">{formatPercentage(segment.engagement)}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Retención:</span>
                        <div className="font-semibold">{formatPercentage(segment.retention)}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">LTV:</span>
                        <div className="font-semibold">{formatCurrency(segment.lifetimeValue)}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Crecimiento:</span>
                        <div className={`font-semibold ${segment.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {segment.growth > 0 ? '+' : ''}{segment.growth.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="funnel" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Embudo de Conversión</CardTitle>
              <CardDescription>Análisis del flujo de usuarios hacia la conversión</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.funnelStages.map((stage, index) => (
                  <div key={stage.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="font-semibold">{stage.name}</h3>
                          <div className="text-sm text-gray-500">
                            {formatNumber(stage.users)} usuarios
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{formatPercentage(stage.conversionRate / 100)}</div>
                        <div className="text-sm text-gray-500">Tasa de conversión</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Abandono:</span>
                        <div className="font-semibold">{formatPercentage(stage.dropoffRate / 100)}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Tiempo promedio:</span>
                        <div className="font-semibold">{stage.averageTime}s</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Ingresos:</span>
                        <div className="font-semibold">{formatCurrency(stage.revenue)}</div>
                      </div>
                    </div>
                    
                    <Progress 
                      value={stage.conversionRate} 
                      className="mt-3 h-2" 
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cohorts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Análisis de Cohortes</CardTitle>
              <CardDescription>Retención y comportamiento por cohortes de usuarios</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {stats.cohorts.map((cohort) => (
                  <div key={cohort.cohort} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-lg">{cohort.cohort}</h3>
                      <Badge variant="outline">{formatNumber(cohort.size)} usuarios</Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-sm text-gray-500">Día 1</div>
                        <div className="font-semibold">{formatPercentage(cohort.retention.day1 / 100)}</div>
                        <div className="text-xs text-gray-500">{formatCurrency(cohort.revenue.day1)}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-gray-500">Día 7</div>
                        <div className="font-semibold">{formatPercentage(cohort.retention.day7 / 100)}</div>
                        <div className="text-xs text-gray-500">{formatCurrency(cohort.revenue.day7)}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-gray-500">Día 30</div>
                        <div className="font-semibold">{formatPercentage(cohort.retention.day30 / 100)}</div>
                        <div className="text-xs text-gray-500">{formatCurrency(cohort.revenue.day30)}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-gray-500">Día 90</div>
                        <div className="font-semibold">{formatPercentage(cohort.retention.day90 / 100)}</div>
                        <div className="text-xs text-gray-500">{formatCurrency(cohort.revenue.day90)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Análisis Predictivo</CardTitle>
              <CardDescription>Predicciones basadas en datos históricos y tendencias</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.predictions.map((prediction) => (
                  <div key={prediction.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-semibold">{prediction.name}</h3>
                        <div className="text-sm text-gray-500">
                          Confianza: {formatPercentage(prediction.confidence)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">
                          {prediction.name.includes('Ingresos') ? formatCurrency(prediction.predictedValue) :
                           prediction.name.includes('Tasa') ? formatPercentage(prediction.predictedValue) :
                           formatNumber(prediction.predictedValue)}
                        </div>
                        <div className={`flex items-center space-x-1 text-sm ${getTrendColor(prediction.trend)}`}>
                          {getTrendIcon(prediction.trend)}
                          <span>Predicción</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Valor actual:</span>
                        <div className="font-semibold">
                          {prediction.name.includes('Ingresos') ? formatCurrency(prediction.currentValue) :
                           prediction.name.includes('Tasa') ? formatPercentage(prediction.currentValue) :
                           formatNumber(prediction.currentValue)}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">Impacto:</span>
                        <Badge variant={
                          prediction.impact === 'high' ? 'default' :
                          prediction.impact === 'medium' ? 'secondary' : 'outline'
                        }>
                          {prediction.impact === 'high' ? 'Alto' :
                           prediction.impact === 'medium' ? 'Medio' : 'Bajo'}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <div className="text-sm text-gray-500 mb-2">Factores principales:</div>
                      <div className="flex flex-wrap gap-2">
                        {prediction.factors.map((factor, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {factor}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="geographic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Análisis Geográfico</CardTitle>
              <CardDescription>Rendimiento por región y país</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.geographicData.map((geo) => (
                  <div key={`${geo.country}-${geo.region}`} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <Globe className="h-4 w-4" />
                        <div>
                          <h3 className="font-semibold">{geo.region}</h3>
                          <div className="text-sm text-gray-500">{geo.country}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{formatNumber(geo.users)} usuarios</div>
                        <div className="text-sm text-gray-500">
                          {geo.growth > 0 ? '+' : ''}{geo.growth.toFixed(1)}% crecimiento
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Sesiones:</span>
                        <div className="font-semibold">{formatNumber(geo.sessions)}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Ingresos:</span>
                        <div className="font-semibold">{formatCurrency(geo.revenue)}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Conversión:</span>
                        <div className="font-semibold">{formatPercentage(geo.conversionRate)}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Crecimiento:</span>
                        <div className={`font-semibold ${geo.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {geo.growth > 0 ? '+' : ''}{geo.growth.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
