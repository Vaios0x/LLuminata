'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Clock, 
  Target, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
  Eye,
  BarChart3,
  PieChart,
  LineChart,
  Calendar,
  Users,
  BookOpen,
  Lightbulb,
  Zap,
  Star,
  Heart,
  Award,
  Flag,
  Clock3,
  Timer,
  Play,
  Pause,
  RotateCcw,
  Download,
  Share,
  Filter,
  Search,
  Settings,
  RefreshCw,
  Plus,
  Minus,
  Maximize,
  Minimize,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Activity as ActivityIcon,
  Clock as ClockIcon,
  Target as TargetIcon,
  AlertTriangle as AlertTriangleIcon,
  CheckCircle as CheckCircleIcon,
  XCircle as XCircleIcon,
  Loader2 as Loader2Icon,
  Eye as EyeIcon,
  BarChart3 as BarChart3Icon,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Calendar as CalendarIcon,
  Users as UsersIcon,
  BookOpen as BookOpenIcon,
  Lightbulb as LightbulbIcon,
  Zap as ZapIcon,
  Star as StarIcon,
  Heart as HeartIcon,
  Award as AwardIcon,
  Flag as FlagIcon,
  Clock3 as Clock3Icon,
  Timer as TimerIcon,
  Play as PlayIcon,
  Pause as PauseIcon,
  RotateCcw as RotateCcwIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  Filter as FilterIcon,
  Search as SearchIcon,
  Settings as SettingsIcon,
  RefreshCw as RefreshCwIcon,
  Plus as PlusIcon,
  Minus as MinusIcon,
  Maximize as MaximizeIcon,
  Minimize as MinimizeIcon,
  ArrowUp,
  ArrowDown,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  ArrowUpLeft,
  ArrowDownLeft,
  CornerUpLeft,
  CornerUpRight,
  CornerDownLeft,
  CornerDownRight,
  MoveUp,
  MoveDown,
  MoveLeft,
  MoveRight,
  RotateCw,
  Users2,
  FileText,
  File,
  Folder,
  FolderOpen,
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
  Monitor,
  Smartphone,
  Tablet,
  Wifi,
  WifiOff,
  Database,
  Server,
  Cpu,
  HardDrive,
  Maximize2,
  Minimize2,
  RotateCcw as RotateCcwIcon2,
  MousePointer,
  Scroll,
  Move,
  Save,
  Edit,
  Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { BehavioralAnalysis } from '@/components/ai/BehavioralAnalysis';

interface BehaviorMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  change: number;
  status: 'excellent' | 'good' | 'warning' | 'critical';
  category: 'engagement' | 'performance' | 'social' | 'emotional' | 'cognitive';
}

interface BehaviorPattern {
  id: string;
  name: string;
  description: string;
  frequency: number;
  confidence: number;
  impact: 'positive' | 'negative' | 'neutral';
  category: string;
  recommendations: string[];
}

interface LearningSession {
  id: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  activities: string[];
  engagement: number;
  performance: number;
  mood: 'positive' | 'neutral' | 'negative';
  notes: string;
}

interface BehaviorReport {
  id: string;
  userId: string;
  date: Date;
  metrics: BehaviorMetric[];
  patterns: BehaviorPattern[];
  sessions: LearningSession[];
  summary: string;
  recommendations: string[];
  status: 'draft' | 'completed' | 'reviewed';
}

export default function BehavioralAnalysisPage() {
  const [currentUser, setCurrentUser] = useState<string>('user_123');
  const [behaviorReports, setBehaviorReports] = useState<BehaviorReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [selectedReport, setSelectedReport] = useState<BehaviorReport | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'reports' | 'patterns' | 'settings'>('overview');

  // Datos de ejemplo
  const mockBehaviorReports: BehaviorReport[] = [
    {
      id: 'report_1',
      userId: 'user_123',
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      metrics: [
        {
          id: 'engagement_rate',
          name: 'Tasa de Engagement',
          value: 78,
          unit: '%',
          trend: 'up',
          change: 5.2,
          status: 'good',
          category: 'engagement'
        },
        {
          id: 'completion_rate',
          name: 'Tasa de Finalización',
          value: 85,
          unit: '%',
          trend: 'up',
          change: 3.1,
          status: 'excellent',
          category: 'performance'
        },
        {
          id: 'social_interaction',
          name: 'Interacción Social',
          value: 62,
          unit: '%',
          trend: 'down',
          change: -2.5,
          status: 'warning',
          category: 'social'
        }
      ],
      patterns: [
        {
          id: 'pattern_1',
          name: 'Aprendizaje Matutino',
          description: 'Mayor efectividad en sesiones de la mañana',
          frequency: 0.85,
          confidence: 0.92,
          impact: 'positive',
          category: 'temporal',
          recommendations: ['Programar lecciones importantes por la mañana', 'Evitar sesiones complejas por la tarde']
        }
      ],
      sessions: [
        {
          id: 'session_1',
          startTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          endTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000),
          duration: 45,
          activities: ['Lectura', 'Ejercicios', 'Evaluación'],
          engagement: 85,
          performance: 78,
          mood: 'positive',
          notes: 'Sesión muy productiva, usuario mostró gran interés'
        }
      ],
      summary: 'El usuario muestra un patrón de aprendizaje consistente con mayor efectividad en las mañanas.',
      recommendations: [
        'Programar sesiones principales entre 9:00 AM y 11:00 AM',
        'Incluir más actividades interactivas para mejorar engagement social',
        'Revisar contenido de la tarde para aumentar efectividad'
      ],
      status: 'completed'
    },
    {
      id: 'report_2',
      userId: 'user_123',
      date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      metrics: [
        {
          id: 'engagement_rate',
          name: 'Tasa de Engagement',
          value: 72,
          unit: '%',
          trend: 'stable',
          change: 0.5,
          status: 'good',
          category: 'engagement'
        },
        {
          id: 'completion_rate',
          name: 'Tasa de Finalización',
          value: 81,
          unit: '%',
          trend: 'up',
          change: 1.8,
          status: 'good',
          category: 'performance'
        }
      ],
      patterns: [
        {
          id: 'pattern_2',
          name: 'Preferencia Visual',
          description: 'Mejor rendimiento con contenido visual',
          frequency: 0.78,
          confidence: 0.88,
          impact: 'positive',
          category: 'learning_style',
          recommendations: ['Aumentar contenido visual', 'Incluir diagramas y gráficos']
        }
      ],
      sessions: [],
      summary: 'El usuario prefiere contenido visual y muestra mejor rendimiento con este tipo de material.',
      recommendations: [
        'Incluir más elementos visuales en las lecciones',
        'Usar diagramas y gráficos para explicar conceptos complejos',
        'Considerar videos explicativos para temas difíciles'
      ],
      status: 'reviewed'
    }
  ];

  useEffect(() => {
    loadBehaviorReports();
  }, []);

  const loadBehaviorReports = async () => {
    try {
      setIsLoading(true);
      // En producción, esto sería una llamada a la API
      // const response = await fetch(`/api/ai/behavioral-analysis/${currentUser}`);
      // const data = await response.json();
      
      // Simulando carga
      await new Promise(resolve => setTimeout(resolve, 1000));
      setBehaviorReports(mockBehaviorReports);
    } catch (error) {
      console.error('Error loading behavior reports:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePatternDetected = (pattern: BehaviorPattern) => {
    console.log('Pattern detected:', pattern);
  };

  const handleRecommendationGenerated = (recommendation: any) => {
    console.log('Recommendation generated:', recommendation);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-100';
      case 'good': return 'text-blue-600 bg-blue-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-600" />;
      default: return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'positive': return 'text-green-600 bg-green-100';
      case 'negative': return 'text-red-600 bg-red-100';
      case 'neutral': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-MX');
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (showAnalysis) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button 
            onClick={() => setShowAnalysis(false)}
            variant="outline"
            className="flex items-center space-x-2"
            tabIndex={0}
            aria-label="Volver a la página principal"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver</span>
          </Button>
        </div>
        <BehavioralAnalysis 
          userId={currentUser}
          onPatternDetected={handlePatternDetected}
          onRecommendationGenerated={handleRecommendationGenerated}
          onExport={(data) => console.log('Export:', data)}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Análisis de Comportamiento</h1>
              <p className="text-gray-600">Análisis inteligente de patrones de aprendizaje y comportamiento</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button 
              onClick={() => loadBehaviorReports()}
              variant="outline"
              className="flex items-center space-x-2"
              tabIndex={0}
              aria-label="Actualizar datos"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Actualizar</span>
            </Button>
            <Button 
              onClick={() => setShowAnalysis(true)}
              className="flex items-center space-x-2"
              tabIndex={0}
              aria-label="Nuevo análisis"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Análisis</span>
            </Button>
          </div>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Brain className="w-5 h-5 text-orange-600" />
                <span className="text-sm font-medium">Reportes Totales</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {behaviorReports.length}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium">Patrones Detectados</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {behaviorReports.reduce((acc, r) => acc + r.patterns.length, 0)}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Lightbulb className="w-5 h-5 text-yellow-600" />
                <span className="text-sm font-medium">Recomendaciones</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {behaviorReports.reduce((acc, r) => acc + r.recommendations.length, 0)}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium">Sesiones Analizadas</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {behaviorReports.reduce((acc, r) => acc + r.sessions.length, 0)}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tabs de navegación */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Resumen', icon: BarChart3 },
              { id: 'reports', label: 'Reportes', icon: FileText },
              { id: 'patterns', label: 'Patrones', icon: Target },
              { id: 'settings', label: 'Configuración', icon: Settings }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm",
                    activeTab === tab.id
                      ? "border-orange-500 text-orange-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  )}
                  tabIndex={0}
                  aria-label={`Ver ${tab.label}`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Contenido de tabs */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Métricas principales */}
          {behaviorReports.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5 text-orange-600" />
                  <span>Métricas Principales</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {behaviorReports[0].metrics.slice(0, 3).map((metric) => (
                    <div key={metric.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-600">{metric.name}</span>
                        {getTrendIcon(metric.trend)}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl font-bold">{metric.value}{metric.unit}</span>
                        <Badge className={cn("text-xs", getStatusColor(metric.status))}>
                          {metric.change > 0 ? '+' : ''}{metric.change}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Patrones recientes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-green-600" />
                <span>Patrones Recientes</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {behaviorReports
                  .flatMap(r => r.patterns)
                  .slice(0, 3)
                  .map((pattern) => (
                    <div key={pattern.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{pattern.name}</h4>
                        <Badge className={cn("text-xs", getImpactColor(pattern.impact))}>
                          {pattern.impact === 'positive' ? 'Positivo' :
                           pattern.impact === 'negative' ? 'Negativo' : 'Neutral'}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{pattern.description}</p>
                      <div className="flex items-center justify-between text-sm">
                        <span>Confianza: {Math.round(pattern.confidence * 100)}%</span>
                        <span>Frecuencia: {Math.round(pattern.frequency * 100)}%</span>
                      </div>
                    </div>
                  ))
                }
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="space-y-4">
          {behaviorReports.map((report) => (
            <Card key={report.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Brain className="w-5 h-5 text-orange-600" />
                    <div>
                      <h3 className="font-semibold">Reporte #{report.id.split('_')[1]}</h3>
                      <p className="text-sm text-gray-600">
                        Análisis del {formatDate(report.date)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={cn("text-xs", 
                      report.status === 'completed' ? "bg-green-100 text-green-800" :
                      report.status === 'reviewed' ? "bg-blue-100 text-blue-800" : "bg-yellow-100 text-yellow-800"
                    )}>
                      {report.status === 'completed' ? 'Completado' :
                       report.status === 'reviewed' ? 'Revisado' : 'Borrador'}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {report.metrics.length} métricas
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <span className="text-sm text-gray-600">Patrones:</span>
                    <div className="font-medium">{report.patterns.length}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Sesiones:</span>
                    <div className="font-medium">{report.sessions.length}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Recomendaciones:</span>
                    <div className="font-medium">{report.recommendations.length}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Confianza:</span>
                    <div className="font-medium">
                      {Math.round(report.patterns.reduce((acc, p) => acc + p.confidence, 0) / report.patterns.length * 100)}%
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="text-sm text-gray-600 max-w-md truncate">
                    {report.summary}
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setSelectedReport(report)}
                      tabIndex={0}
                      aria-label="Ver detalles del reporte"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      Ver Detalles
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      tabIndex={0}
                      aria-label="Exportar reporte"
                    >
                      <Download className="w-3 h-3 mr-1" />
                      Exportar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'patterns' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Patrones de Comportamiento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {behaviorReports
                  .flatMap(r => r.patterns)
                  .map((pattern) => (
                    <div key={pattern.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <Target className="w-5 h-5 text-green-600" />
                          <h4 className="font-medium">{pattern.name}</h4>
                        </div>
                        <Badge className={cn("text-xs", getImpactColor(pattern.impact))}>
                          {pattern.impact === 'positive' ? 'Positivo' :
                           pattern.impact === 'negative' ? 'Negativo' : 'Neutral'}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3">{pattern.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                        <div>
                          <span className="text-sm text-gray-600">Confianza:</span>
                          <div className="font-medium">{Math.round(pattern.confidence * 100)}%</div>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Frecuencia:</span>
                          <div className="font-medium">{Math.round(pattern.frequency * 100)}%</div>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Categoría:</span>
                          <div className="font-medium capitalize">{pattern.category.replace('_', ' ')}</div>
                        </div>
                      </div>
                      
                      <div>
                        <h5 className="font-medium text-sm mb-2">Recomendaciones:</h5>
                        <ul className="space-y-1">
                          {pattern.recommendations.slice(0, 2).map((rec, index) => (
                            <li key={index} className="text-sm text-gray-600 flex items-center space-x-2">
                              <Lightbulb className="w-3 h-3 text-yellow-600" />
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))
                }
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Análisis de Comportamiento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Frecuencia de Análisis</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                    <option value="daily">Diario</option>
                    <option value="weekly" selected>Semanal</option>
                    <option value="monthly">Mensual</option>
                    <option value="custom">Personalizado</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Umbral de Confianza</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                    <option value="0.7">70%</option>
                    <option value="0.8" selected>80%</option>
                    <option value="0.9">90%</option>
                    <option value="0.95">95%</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Categorías a Analizar</label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" defaultChecked />
                      <span>Engagement</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" defaultChecked />
                      <span>Performance</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" defaultChecked />
                      <span>Social</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" defaultChecked />
                      <span>Emocional</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" defaultChecked />
                      <span>Cognitivo</span>
                    </label>
                  </div>
                </div>
                <Button className="w-full">
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Configuración
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal de detalles */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Detalles del Reporte</h3>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedReport(null)}
                  tabIndex={0}
                  aria-label="Cerrar detalles"
                >
                  <XCircle className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  <Brain className="w-6 h-6 text-orange-600" />
                  <div>
                    <h4 className="font-medium">Reporte #{selectedReport.id.split('_')[1]}</h4>
                    <p className="text-sm text-gray-600">Análisis del {formatDate(selectedReport.date)}</p>
                  </div>
                </div>
                
                <div>
                  <h5 className="font-medium mb-3">Resumen</h5>
                  <p className="text-sm text-gray-600">{selectedReport.summary}</p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h5 className="font-medium mb-3">Métricas</h5>
                    <div className="space-y-3">
                      {selectedReport.metrics.map((metric) => (
                        <div key={metric.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                          <div>
                            <div className="font-medium">{metric.name}</div>
                            <div className="text-sm text-gray-600">{metric.category}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold">{metric.value}{metric.unit}</div>
                            <div className="flex items-center space-x-1">
                              {getTrendIcon(metric.trend)}
                              <span className="text-sm">{metric.change > 0 ? '+' : ''}{metric.change}%</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="font-medium mb-3">Patrones</h5>
                    <div className="space-y-3">
                      {selectedReport.patterns.map((pattern) => (
                        <div key={pattern.id} className="p-3 border border-gray-200 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h6 className="font-medium">{pattern.name}</h6>
                            <Badge className={cn("text-xs", getImpactColor(pattern.impact))}>
                              {pattern.impact === 'positive' ? 'Positivo' :
                               pattern.impact === 'negative' ? 'Negativo' : 'Neutral'}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{pattern.description}</p>
                          <div className="text-sm">
                            <span>Confianza: {Math.round(pattern.confidence * 100)}% • </span>
                            <span>Frecuencia: {Math.round(pattern.frequency * 100)}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div>
                  <h5 className="font-medium mb-3">Recomendaciones</h5>
                  <ul className="space-y-2">
                    {selectedReport.recommendations.map((rec, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-center space-x-2">
                        <Lightbulb className="w-4 h-4 text-yellow-600" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t">
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline">
                    <Download className="w-3 h-3 mr-1" />
                    Exportar
                  </Button>
                  <Button size="sm" variant="outline">
                    <Share className="w-3 h-3 mr-1" />
                    Compartir
                  </Button>
                  <Button size="sm" variant="outline">
                    <Edit className="w-3 h-3 mr-1" />
                    Editar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
