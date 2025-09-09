'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  BookOpen,
  Target,
  Award,
  Clock,
  Eye,
  Download,
  RefreshCw,
  Calendar,
  MapPin,
  Activity,
  Zap,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  HelpCircle,
  BarChart,
  LineChart,
  PieChart,
  AreaChart,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  Brain,
  Lightbulb,
  GraduationCap,
  Trophy,
  Star,
  Heart,
  MessageSquare,
  Share2,
  Bookmark,
  Play,
  Pause,
  SkipForward,
  Rewind,
  Volume2,
  VolumeX,
  Settings,
  Filter,
  Search,
  Plus,
  Minus,
  Maximize2,
  Minimize2,
  RotateCcw,
  Save,
  Edit,
  Trash2,
  Copy,
  ExternalLink,
  Link,
  Unlink,
  Lock,
  Unlock,
  Shield,
  Key,
  Bell,
  Mail,
  Phone,
  Video,
  Image,
  FileText,
  File,
  Folder,
  FolderOpen,
  Database,
  Server,
  Cpu,
  HardDrive,
  Wifi,
  Signal,
  Battery,
  BatteryCharging,
  WifiOff,
  SignalHigh,
  SignalMedium,
  SignalLow,
  SignalZero,
  WifiHigh,
  WifiLow,
  WifiZero,
  BatteryFull
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AnalyticsData {
  userEngagement: {
    totalUsers: number;
    activeUsers: number;
    newUsers: number;
    returningUsers: number;
    sessionDuration: number;
    pagesPerSession: number;
    bounceRate: number;
  };
  learningProgress: {
    totalLessons: number;
    completedLessons: number;
    averageScore: number;
    timeSpent: number;
    completionRate: number;
    retentionRate: number;
  };
  regionalData: Array<{
    region: string;
    users: number;
    engagement: number;
    completionRate: number;
    averageScore: number;
  }>;
  deviceUsage: Array<{
    device: string;
    users: number;
    percentage: number;
    sessionDuration: number;
  }>;
  contentPerformance: Array<{
    title: string;
    views: number;
    completions: number;
    averageScore: number;
    engagement: number;
  }>;
  trends: Array<{
    date: string;
    users: number;
    lessons: number;
    engagement: number;
  }>;
}

interface AnalyticsDashboardProps {
  className?: string;
  refreshInterval?: number;
  showRegionalAnalysis?: boolean;
  showEngagementMetrics?: boolean;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  className = '',
  refreshInterval = 300000, // 5 minutos
  showRegionalAnalysis = true,
  showEngagementMetrics = true
}) => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('7d');

  const loadAnalyticsData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/analytics?range=${timeRange}`);
      if (response.ok) {
        const analyticsData = await response.json();
        setData(analyticsData);
      }
    } catch (error) {
      console.error('Error loading analytics data:', error);
      // Datos de prueba
      setData({
        userEngagement: {
          totalUsers: 1247,
          activeUsers: 892,
          newUsers: 45,
          returningUsers: 847,
          sessionDuration: 24.5,
          pagesPerSession: 8.3,
          bounceRate: 12.4
        },
        learningProgress: {
          totalLessons: 156,
          completedLessons: 12450,
          averageScore: 87.3,
          timeSpent: 45.2,
          completionRate: 78.9,
          retentionRate: 82.1
        },
        regionalData: [
          { region: 'América Latina', users: 456, engagement: 89.2, completionRate: 82.3, averageScore: 88.7 },
          { region: 'Europa', users: 234, engagement: 91.5, completionRate: 85.1, averageScore: 89.2 },
          { region: 'Asia', users: 189, engagement: 87.8, completionRate: 79.4, averageScore: 86.5 },
          { region: 'África', users: 123, engagement: 92.1, completionRate: 88.7, averageScore: 90.1 },
          { region: 'Norteamérica', users: 245, engagement: 88.9, completionRate: 81.2, averageScore: 87.3 }
        ],
        deviceUsage: [
          { device: 'Móvil', users: 623, percentage: 50.0, sessionDuration: 18.2 },
          { device: 'Desktop', users: 498, percentage: 40.0, sessionDuration: 32.8 },
          { device: 'Tablet', users: 126, percentage: 10.0, sessionDuration: 25.4 }
        ],
        contentPerformance: [
          { title: 'Fundamentos de IA', views: 1247, completions: 892, averageScore: 88.5, engagement: 92.3 },
          { title: 'Machine Learning Básico', views: 1156, completions: 823, averageScore: 85.2, engagement: 89.7 },
          { title: 'Ética en IA', views: 987, completions: 745, averageScore: 91.8, engagement: 94.1 },
          { title: 'Aplicaciones Prácticas', views: 876, completions: 634, averageScore: 87.3, engagement: 88.9 },
          { title: 'Futuro de la IA', views: 765, completions: 523, averageScore: 89.6, engagement: 91.2 }
        ],
        trends: [
          { date: '2024-01-15', users: 823, lessons: 156, engagement: 87.2 },
          { date: '2024-01-16', users: 856, lessons: 162, engagement: 88.1 },
          { date: '2024-01-17', users: 892, lessons: 168, engagement: 89.3 },
          { date: '2024-01-18', users: 878, lessons: 165, engagement: 88.7 },
          { date: '2024-01-19', users: 901, lessons: 171, engagement: 90.1 },
          { date: '2024-01-20', users: 934, lessons: 175, engagement: 91.2 },
          { date: '2024-01-21', users: 892, lessons: 169, engagement: 89.8 }
        ]
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnalyticsData();
    const interval = setInterval(loadAnalyticsData, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval, timeRange]);

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (current < previous) return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <Minus className="w-4 h-4 text-gray-600" />;
  };

  const getTrendColor = (current: number, previous: number) => {
    if (current > previous) return 'text-green-600';
    if (current < previous) return 'text-red-600';
    return 'text-gray-600';
  };

  if (isLoading && !data) {
    return (
      <div className={cn("flex items-center justify-center p-8", className)}>
        <div className="flex items-center space-x-2">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Cargando analytics...</span>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard de Analytics</h1>
          <p className="text-gray-600 mt-1">
            Métricas detalladas de engagement, aprendizaje y rendimiento
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="1d">Últimas 24 horas</option>
            <option value="7d">Últimos 7 días</option>
            <option value="30d">Últimos 30 días</option>
            <option value="90d">Últimos 90 días</option>
          </select>

          <Button
            onClick={loadAnalyticsData}
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

      {/* Métricas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.userEngagement.activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              +{data.userEngagement.newUsers} nuevos este período
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lecciones Completadas</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.learningProgress.completedLessons.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {data.learningProgress.completionRate}% tasa de finalización
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Puntuación Promedio</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.learningProgress.averageScore}%</div>
            <p className="text-xs text-muted-foreground">
              {data.learningProgress.retentionRate}% retención
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tiempo de Sesión</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.userEngagement.sessionDuration} min</div>
            <p className="text-xs text-muted-foreground">
              {data.userEngagement.pagesPerSession} páginas por sesión
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de Navegación */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="learning">Aprendizaje</TabsTrigger>
          <TabsTrigger value="regional">Regional</TabsTrigger>
          <TabsTrigger value="content">Contenido</TabsTrigger>
        </TabsList>

        {/* Tab de Resumen */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Tendencias de Usuarios */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Tendencias de Usuarios
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.trends.slice(-7).map((trend, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{new Date(trend.date).toLocaleDateString()}</p>
                        <p className="text-sm text-gray-600">{trend.users} usuarios activos</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-2">
                          {getTrendIcon(trend.users, data.trends[Math.max(0, index - 1)]?.users || trend.users)}
                          <span className={cn("font-bold", getTrendColor(trend.users, data.trends[Math.max(0, index - 1)]?.users || trend.users))}>
                            {trend.engagement}%
                          </span>
                        </div>
                        <p className="text-xs text-gray-600">{trend.lessons} lecciones</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Uso por Dispositivo */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Smartphone className="w-5 h-5 mr-2" />
                  Uso por Dispositivo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.deviceUsage.map((device, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {device.device === 'Móvil' && <Smartphone className="w-5 h-5" />}
                        {device.device === 'Desktop' && <Monitor className="w-5 h-5" />}
                        {device.device === 'Tablet' && <Tablet className="w-5 h-5" />}
                        <div>
                          <h4 className="font-semibold">{device.device}</h4>
                          <p className="text-sm text-gray-600">{device.users} usuarios</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">{device.percentage}%</div>
                        <p className="text-xs text-gray-600">{device.sessionDuration} min/sesión</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab de Engagement */}
        <TabsContent value="engagement" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Métricas de Engagement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Usuarios Activos</span>
                    <span className="font-bold">{data.userEngagement.activeUsers}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Nuevos Usuarios</span>
                    <span className="font-bold text-green-600">+{data.userEngagement.newUsers}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Usuarios Recurrentes</span>
                    <span className="font-bold">{data.userEngagement.returningUsers}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Tiempo de Sesión</span>
                    <span className="font-bold">{data.userEngagement.sessionDuration} min</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Páginas por Sesión</span>
                    <span className="font-bold">{data.userEngagement.pagesPerSession}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Tasa de Rebote</span>
                    <span className="font-bold">{data.userEngagement.bounceRate}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribución de Usuarios</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Total Registrados</span>
                    <span className="font-bold">{data.userEngagement.totalUsers}</span>
                  </div>
                  <Progress value={(data.userEngagement.activeUsers / data.userEngagement.totalUsers) * 100} className="w-full" />
                  <div className="text-center text-sm text-gray-600">
                    {Math.round((data.userEngagement.activeUsers / data.userEngagement.totalUsers) * 100)}% activos
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Actividad por Hora</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-32 flex items-end justify-between space-x-1">
                  {[20, 35, 45, 60, 75, 85, 70, 55, 40, 30, 25, 20].map((value, index) => (
                    <div key={index} className="flex-1 bg-blue-200 rounded-t" style={{ height: `${value}%` }}></div>
                  ))}
                </div>
                <p className="text-center text-sm text-gray-600 mt-2">Últimas 12 horas</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab de Aprendizaje */}
        <TabsContent value="learning" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <GraduationCap className="w-5 h-5 mr-2" />
                  Progreso de Aprendizaje
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Lecciones Totales</span>
                    <span className="font-bold">{data.learningProgress.totalLessons}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Completadas</span>
                    <span className="font-bold text-green-600">{data.learningProgress.completedLessons.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Tasa de Finalización</span>
                    <span className="font-bold">{data.learningProgress.completionRate}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Puntuación Promedio</span>
                    <span className="font-bold">{data.learningProgress.averageScore}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Tiempo Promedio</span>
                    <span className="font-bold">{data.learningProgress.timeSpent} min</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Tasa de Retención</span>
                    <span className="font-bold">{data.learningProgress.retentionRate}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Trophy className="w-5 h-5 mr-2" />
                  Logros y Gamificación
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">Completadores</h4>
                      <Badge variant="default">1,247</Badge>
                    </div>
                    <p className="text-sm text-gray-600">Usuarios que completaron al menos 1 lección</p>
                  </div>
                  
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">Estudiantes Avanzados</h4>
                      <Badge variant="secondary">456</Badge>
                    </div>
                    <p className="text-sm text-gray-600">Completaron más de 10 lecciones</p>
                  </div>
                  
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">Expertos</h4>
                      <Badge variant="outline">89</Badge>
                    </div>
                    <p className="text-sm text-gray-600">Completaron más de 50 lecciones</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab Regional */}
        {showRegionalAnalysis && (
          <TabsContent value="regional" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="w-5 h-5 mr-2" />
                  Análisis Regional
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.regionalData.map((region, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <div>
                          <h4 className="font-semibold">{region.region}</h4>
                          <p className="text-sm text-gray-600">{region.users} usuarios</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Engagement:</span>
                            <p className="font-bold">{region.engagement}%</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Finalización:</span>
                            <p className="font-bold">{region.completionRate}%</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Puntuación:</span>
                            <p className="font-bold">{region.averageScore}%</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Tab de Contenido */}
        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="w-5 h-5 mr-2" />
                Rendimiento del Contenido
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.contentPerformance.map((content, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-semibold">{content.title}</h4>
                      <p className="text-sm text-gray-600">{content.views} visualizaciones</p>
                    </div>
                    <div className="text-right">
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Completaciones:</span>
                          <p className="font-bold">{content.completions}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Puntuación:</span>
                          <p className="font-bold">{content.averageScore}%</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Engagement:</span>
                          <p className="font-bold">{content.engagement}%</p>
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
};

export default AnalyticsDashboard;
