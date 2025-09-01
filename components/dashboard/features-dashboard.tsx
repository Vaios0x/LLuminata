/**
 * Dashboard de Funcionalidades Sociales y Reportes Avanzados
 * Integra las funcionalidades sociales y los reportes avanzados en una sola vista
 */

'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { 
  Users, 
  BookOpen, 
  Target, 
  BarChart3, 
  Globe, 
  Building,
  TrendingUp,
  Activity,
  Star,
  Award,
  Calendar,
  Clock,
  MapPin,
  Heart,
  Brain,
  Zap,
  Lightbulb,
  Settings,
  RefreshCw,
  Plus,
  Eye,
  Download,
  Share2,
  Mail,
  ExternalLink,
  Info,
  HelpCircle,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Minus,
  ArrowUp,
  ArrowDown,
  Users2,
  GraduationCap,
  Trophy,
  Medal,
  Crown,
  Flag,
  Shield,
  Lock,
  Unlock,
  EyeOff,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  RotateCw,
  Type,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link,
  Smile,
  Camera,
  Mic,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Globe2,
  BarChart,
  PieChart,
  LineChart,
  ScatterChart,
  AreaChart,
  Gauge,
  Thermometer,
  X,
  Divide,
  Percent,
  DollarSign,
  Euro,
  Bitcoin,
  CreditCard,
  Wallet,
  PiggyBank,
  Banknote,
  Coins,
  Receipt,
  Calculator
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SocialFeatures } from '@/components/social/social-features';
import { AdvancedReporting } from '@/components/reports/advanced-reporting';

interface FeaturesDashboardProps {
  className?: string;
}

export const FeaturesDashboard: React.FC<FeaturesDashboardProps> = ({
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState('overview');

  // Datos de ejemplo para el dashboard
  const stats = {
    totalStudents: 1250,
    activeGroups: 45,
    ongoingProjects: 23,
    availableMentors: 67,
    sharedResources: 189,
    regionalReports: 12,
    impactAnalyses: 8,
    stakeholderReports: 15
  };

  const recentActivity = [
    {
      id: 1,
      type: 'group',
      title: 'Nuevo grupo de estudio: Matemáticas Avanzadas',
      description: 'Se creó un grupo de estudio para matemáticas avanzadas en la región Yucatán',
      timestamp: '2024-01-15T10:30:00Z',
      participants: 12
    },
    {
      id: 2,
      type: 'project',
      title: 'Proyecto colaborativo: Historia Maya',
      description: 'Inició un proyecto colaborativo sobre historia maya con 8 participantes',
      timestamp: '2024-01-14T15:45:00Z',
      participants: 8
    },
    {
      id: 3,
      type: 'mentor',
      title: 'Nuevo mentor disponible: María González',
      description: 'María González se registró como mentora en ciencias sociales',
      timestamp: '2024-01-14T09:20:00Z',
      expertise: 'Ciencias Sociales'
    },
    {
      id: 4,
      type: 'resource',
      title: 'Recurso compartido: Guía de Gramática Maya',
      description: 'Se compartió una guía completa de gramática maya',
      timestamp: '2024-01-13T16:15:00Z',
      downloads: 34
    },
    {
      id: 5,
      type: 'report',
      title: 'Reporte regional generado: Quintana Roo',
      description: 'Se generó un reporte de progreso para la región Quintana Roo',
      timestamp: '2024-01-13T11:00:00Z',
      metrics: 'Retención: 85%, Engagement: 78%'
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'group':
        return <Users className="w-4 h-4 text-blue-600" />;
      case 'project':
        return <Target className="w-4 h-4 text-green-600" />;
      case 'mentor':
        return <Award className="w-4 h-4 text-purple-600" />;
      case 'resource':
        return <BookOpen className="w-4 h-4 text-orange-600" />;
      case 'report':
        return <BarChart3 className="w-4 h-4 text-red-600" />;
      default:
        return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'group':
        return 'bg-blue-50 border-blue-200';
      case 'project':
        return 'bg-green-50 border-green-200';
      case 'mentor':
        return 'bg-purple-50 border-purple-200';
      case 'resource':
        return 'bg-orange-50 border-orange-200';
      case 'report':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Hace unos minutos';
    if (diffInHours < 24) return `Hace ${diffInHours} horas`;
    if (diffInHours < 48) return 'Ayer';
    return date.toLocaleDateString();
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header del Dashboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="w-6 h-6 text-blue-600" />
            <span>Dashboard de Funcionalidades Avanzadas</span>
          </CardTitle>
          <p className="text-gray-600">
            Gestiona funcionalidades sociales y reportes avanzados para el aprendizaje inclusivo
          </p>
        </CardHeader>
      </Card>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Users className="w-8 h-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{stats.totalStudents.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Estudiantes</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Target className="w-8 h-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold">{stats.activeGroups}</div>
                <div className="text-sm text-gray-600">Grupos Activos</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Award className="w-8 h-8 text-purple-600" />
              <div>
                <div className="text-2xl font-bold">{stats.availableMentors}</div>
                <div className="text-sm text-gray-600">Mentores</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-8 h-8 text-red-600" />
              <div>
                <div className="text-2xl font-bold">{stats.regionalReports}</div>
                <div className="text-sm text-gray-600">Reportes</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs principales */}
      <div className="w-full">
        <div className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground w-full">
          <button
            onClick={() => setActiveTab('overview')}
            className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
              activeTab === 'overview' ? 'bg-background text-foreground shadow-sm' : ''
            }`}
          >
            <Activity className="w-4 h-4 mr-2" />
            <span>Resumen</span>
          </button>
          <button
            onClick={() => setActiveTab('social')}
            className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
              activeTab === 'social' ? 'bg-background text-foreground shadow-sm' : ''
            }`}
          >
            <Users className="w-4 h-4 mr-2" />
            <span>Social</span>
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
              activeTab === 'reports' ? 'bg-background text-foreground shadow-sm' : ''
            }`}
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            <span>Reportes</span>
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
              activeTab === 'analytics' ? 'bg-background text-foreground shadow-sm' : ''
            }`}
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            <span>Analytics</span>
          </button>
        </div>

        {/* Tab de Resumen */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Actividad Reciente */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="w-5 h-5" />
                  <span>Actividad Reciente</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div 
                      key={activity.id} 
                      className={cn("p-4 rounded-lg border", getActivityColor(activity.type))}
                    >
                      <div className="flex items-start space-x-3">
                        {getActivityIcon(activity.type)}
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{activity.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-500">
                              {formatTimestamp(activity.timestamp)}
                            </span>
                            {activity.participants && (
                              <Badge variant="outline" className="text-xs">
                                {activity.participants} participantes
                              </Badge>
                            )}
                            {activity.downloads && (
                              <Badge variant="outline" className="text-xs">
                                {activity.downloads} descargas
                              </Badge>
                            )}
                            {activity.expertise && (
                              <Badge variant="outline" className="text-xs">
                                {activity.expertise}
                              </Badge>
                            )}
                            {activity.metrics && (
                              <Badge variant="outline" className="text-xs">
                                {activity.metrics}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Métricas Rápidas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5" />
                  <span>Métricas Rápidas</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Proyectos Colaborativos */}
                  <div>
                    <h4 className="font-medium mb-3">Proyectos Colaborativos</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Proyectos Activos</span>
                        <span className="font-medium">{stats.ongoingProjects}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Tasa de Completado</span>
                        <span className="font-medium text-green-600">78%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Participación Promedio</span>
                        <span className="font-medium">6.2 estudiantes</span>
                      </div>
                    </div>
                  </div>

                  {/* Recursos Compartidos */}
                  <div>
                    <h4 className="font-medium mb-3">Recursos Compartidos</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Total Recursos</span>
                        <span className="font-medium">{stats.sharedResources}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Descargas Totales</span>
                        <span className="font-medium">2,847</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Valoración Promedio</span>
                        <span className="font-medium text-yellow-600">4.6/5</span>
                      </div>
                    </div>
                  </div>

                  {/* Reportes */}
                  <div>
                    <h4 className="font-medium mb-3">Reportes Generados</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Reportes Regionales</span>
                        <span className="font-medium">{stats.regionalReports}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Análisis de Impacto</span>
                        <span className="font-medium">{stats.impactAnalyses}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Reportes Stakeholders</span>
                        <span className="font-medium">{stats.stakeholderReports}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Acciones Rápidas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="w-5 h-5" />
                <span>Acciones Rápidas</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="outline" className="h-20 flex flex-col space-y-2">
                  <Users className="w-6 h-6" />
                  <span className="text-sm">Crear Grupo</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col space-y-2">
                  <Target className="w-6 h-6" />
                  <span className="text-sm">Nuevo Proyecto</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col space-y-2">
                  <Award className="w-6 h-6" />
                  <span className="text-sm">Registrar Mentor</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col space-y-2">
                  <BarChart3 className="w-6 h-6" />
                  <span className="text-sm">Generar Reporte</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        )}

        {/* Tab de Funcionalidades Sociales */}
        {activeTab === 'social' && (
          <div className="space-y-4">
            <SocialFeatures studentId="demo-student-id" />
          </div>
        )}

        {/* Tab de Reportes Avanzados */}
        {activeTab === 'reports' && (
          <div className="space-y-4">
            <AdvancedReporting />
          </div>
        )}

        {/* Tab de Analytics */}
        {activeTab === 'analytics' && (
          <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5" />
                <span>Analytics Avanzados</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Métricas de Engagement */}
                <div className="space-y-4">
                  <h4 className="font-medium">Métricas de Engagement</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <span className="text-sm">Tiempo Promedio de Sesión</span>
                      <span className="font-medium">24.5 min</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="text-sm">Sesiones por Usuario</span>
                      <span className="font-medium">3.2/día</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                      <span className="text-sm">Tasa de Retorno</span>
                      <span className="font-medium">87%</span>
                    </div>
                  </div>
                </div>

                {/* Métricas de Aprendizaje */}
                <div className="space-y-4">
                  <h4 className="font-medium">Métricas de Aprendizaje</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                      <span className="text-sm">Progreso Promedio</span>
                      <span className="font-medium">76%</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                      <span className="text-sm">Tasa de Aprobación</span>
                      <span className="font-medium">82%</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                      <span className="text-sm">Satisfacción General</span>
                      <span className="font-medium">4.3/5</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Gráficos de Tendencias */}
              <div className="mt-6">
                <h4 className="font-medium mb-4">Tendencias de Uso</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-600">+15%</div>
                    <div className="text-sm text-gray-600">Usuarios Activos</div>
                    <div className="text-xs text-green-600 mt-1">↑ vs mes anterior</div>
                  </div>
                  <div className="p-4 border rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-600">+23%</div>
                    <div className="text-sm text-gray-600">Contenido Completado</div>
                    <div className="text-xs text-green-600 mt-1">↑ vs mes anterior</div>
                  </div>
                  <div className="p-4 border rounded-lg text-center">
                    <div className="text-2xl font-bold text-purple-600">+8%</div>
                    <div className="text-sm text-gray-600">Interacciones Sociales</div>
                    <div className="text-xs text-green-600 mt-1">↑ vs mes anterior</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        )}
      </div>
    </div>
  );
};
