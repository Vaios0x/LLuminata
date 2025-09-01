'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Clock,
  Target,
  BarChart3,
  PieChart,
  LineChart,
  Filter,
  Download,
  RefreshCw,
  Plus,
  Eye,
  Heart,
  Star,
  MessageSquare,
  Calendar,
  Award,
  Bookmark,
  FileText,
  Video,
  Headphones,
  Mic,
  MousePointer,
  MousePointerClick,
  Flag,
  Palette,
  Globe,
  Languages,
  MapPin,
  BookOpen,
  Lightbulb,
  Zap,
  CheckCircle,
  AlertTriangle,
  Search,
  Target as TargetIcon,
  Award as AwardIcon,
  Bookmark as BookmarkIcon,
  FileText as FileTextIcon,
  Video as VideoIcon,
  Headphones as HeadphonesIcon,
  Mic as MicIcon,
  MousePointer as MousePointerIcon,
  MousePointerClick as MousePointerClickIcon
} from 'lucide-react';

interface UserBehavior {
  id: string;
  userId: string;
  userName: string;
  age: number;
  grade: string;
  language: string;
  region: string;
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading' | 'mixed';
  engagementLevel: 'low' | 'medium' | 'high' | 'very_high';
  sessionDuration: number;
  completionRate: number;
  retentionRate: number;
  lastActive: Date;
  patterns: {
    preferredTime: string;
    preferredDuration: number;
    preferredContent: string[];
    interactionStyle: string;
    motivationFactors: string[];
  };
  metrics: {
    totalSessions: number;
    totalTime: number;
    lessonsCompleted: number;
    quizzesTaken: number;
    averageScore: number;
    improvementRate: number;
  };
  predictions: {
    dropoutRisk: number;
    nextLesson: string;
    recommendedContent: string[];
    optimalTime: string;
    engagementTrend: 'increasing' | 'stable' | 'decreasing';
  };
}

interface BehaviorPattern {
  id: string;
  pattern: string;
  category: 'learning' | 'engagement' | 'social' | 'technical';
  frequency: number;
  affectedUsers: number;
  impact: 'positive' | 'negative' | 'neutral';
  confidence: number;
  description: string;
  recommendations: string[];
  examples: {
    userId: string;
    userName: string;
    behavior: string;
    outcome: string;
  }[];
}

interface BehavioralAnalytics {
  totalUsers: number;
  activeUsers: number;
  averageEngagement: number;
  averageCompletion: number;
  averageRetention: number;
  topPatterns: BehaviorPattern[];
  userSegments: {
    segment: string;
    count: number;
    characteristics: string[];
    behaviors: string[];
  }[];
  engagementTrends: {
    date: string;
    activeUsers: number;
    averageSession: number;
    completionRate: number;
    retentionRate: number;
  }[];
  learningStyles: {
    style: string;
    count: number;
    percentage: number;
    averagePerformance: number;
  }[];
  predictions: {
    totalPredictions: number;
    accuracy: number;
    highRiskUsers: number;
    highPotentialUsers: number;
  };
}

interface InteractionEvent {
  id: string;
  userId: string;
  userName: string;
  eventType: 'click' | 'scroll' | 'pause' | 'resume' | 'complete' | 'abandon';
  timestamp: Date;
  duration: number;
  context: {
    page: string;
    element: string;
    content: string;
    language: string;
  };
  metadata: {
    device: string;
    browser: string;
    location: string;
    timeOfDay: string;
  };
}

export default function BehavioralAnalysisDashboard() {
  const [behaviors, setBehaviors] = useState<UserBehavior[]>([]);
  const [patterns, setPatterns] = useState<BehaviorPattern[]>([]);
  const [events, setEvents] = useState<InteractionEvent[]>([]);
  const [analytics, setAnalytics] = useState<BehavioralAnalytics>({
    totalUsers: 0,
    activeUsers: 0,
    averageEngagement: 0,
    averageCompletion: 0,
    averageRetention: 0,
    topPatterns: [],
    userSegments: [],
    engagementTrends: [],
    learningStyles: [],
    predictions: {
      totalPredictions: 0,
      accuracy: 0,
      highRiskUsers: 0,
      highPotentialUsers: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<string>('7d');
  const [filterSegment, setFilterSegment] = useState<string>('all');
  const [filterEngagement, setFilterEngagement] = useState<string>('all');

  useEffect(() => {
    loadBehavioralData();
  }, [timeRange]);

  const loadBehavioralData = async () => {
    setLoading(true);
    try {
      // Simular carga de datos
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockBehaviors: UserBehavior[] = [
        {
          id: '1',
          userId: 'user1',
          userName: 'María González',
          age: 12,
          grade: '6to',
          language: 'maya',
          region: 'Yucatán',
          learningStyle: 'visual',
          engagementLevel: 'high',
          sessionDuration: 28,
          completionRate: 0.85,
          retentionRate: 0.78,
          lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000),
          patterns: {
            preferredTime: '14:00-16:00',
            preferredDuration: 30,
            preferredContent: ['matemáticas', 'historia', 'arte'],
            interactionStyle: 'explorador',
            motivationFactors: ['logros', 'reconocimiento', 'progreso']
          },
          metrics: {
            totalSessions: 45,
            totalTime: 1260,
            lessonsCompleted: 38,
            quizzesTaken: 25,
            averageScore: 87,
            improvementRate: 0.15
          },
          predictions: {
            dropoutRisk: 0.12,
            nextLesson: 'Geometría Maya',
            recommendedContent: ['Videos interactivos', 'Ejercicios prácticos', 'Historias culturales'],
            optimalTime: '15:00',
            engagementTrend: 'increasing'
          }
        },
        {
          id: '2',
          userId: 'user2',
          userName: 'Carlos Méndez',
          age: 14,
          grade: '8vo',
          language: 'náhuatl',
          region: 'Puebla',
          learningStyle: 'auditory',
          engagementLevel: 'medium',
          sessionDuration: 22,
          completionRate: 0.72,
          retentionRate: 0.65,
          lastActive: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          patterns: {
            preferredTime: '10:00-12:00',
            preferredDuration: 25,
            preferredContent: ['lenguaje', 'música', 'tradiciones'],
            interactionStyle: 'colaborativo',
            motivationFactors: ['comunidad', 'cultura', 'aprendizaje grupal']
          },
          metrics: {
            totalSessions: 32,
            totalTime: 704,
            lessonsCompleted: 23,
            quizzesTaken: 18,
            averageScore: 79,
            improvementRate: 0.08
          },
          predictions: {
            dropoutRisk: 0.28,
            nextLesson: 'Poesía Náhuatl',
            recommendedContent: ['Audio libros', 'Discusiones grupales', 'Actividades culturales'],
            optimalTime: '11:00',
            engagementTrend: 'stable'
          }
        },
        {
          id: '3',
          userId: 'user3',
          userName: 'Ana López',
          age: 16,
          grade: '10mo',
          language: 'zapoteco',
          region: 'Oaxaca',
          learningStyle: 'kinesthetic',
          engagementLevel: 'very_high',
          sessionDuration: 35,
          completionRate: 0.94,
          retentionRate: 0.89,
          lastActive: new Date(Date.now() - 6 * 60 * 60 * 1000),
          patterns: {
            preferredTime: '16:00-18:00',
            preferredDuration: 40,
            preferredContent: ['ciencias', 'tecnología', 'proyectos'],
            interactionStyle: 'experimental',
            motivationFactors: ['innovación', 'desafíos', 'resultados tangibles']
          },
          metrics: {
            totalSessions: 67,
            totalTime: 2345,
            lessonsCompleted: 63,
            quizzesTaken: 45,
            averageScore: 92,
            improvementRate: 0.22
          },
          predictions: {
            dropoutRisk: 0.05,
            nextLesson: 'Programación Básica',
            recommendedContent: ['Proyectos prácticos', 'Simulaciones', 'Coding challenges'],
            optimalTime: '17:00',
            engagementTrend: 'increasing'
          }
        }
      ];

      const mockPatterns: BehaviorPattern[] = [
        {
          id: '1',
          pattern: 'Aprendizaje matutino',
          category: 'learning',
          frequency: 234,
          affectedUsers: 156,
          impact: 'positive',
          confidence: 0.89,
          description: 'Usuarios que prefieren estudiar en las primeras horas del día muestran mejor retención',
          recommendations: [
            'Programar contenido importante en horarios matutinos',
            'Enviar recordatorios temprano',
            'Adaptar contenido para energía matutina'
          ],
          examples: [
            {
              userId: 'user1',
              userName: 'María González',
              behavior: 'Sesiones de 30 min entre 8:00-10:00',
              outcome: '85% de retención vs 65% promedio'
            }
          ]
        },
        {
          id: '2',
          pattern: 'Pausas frecuentes',
          category: 'engagement',
          frequency: 189,
          affectedUsers: 98,
          impact: 'negative',
          confidence: 0.76,
          description: 'Usuarios que hacen muchas pausas tienden a abandonar lecciones',
          recommendations: [
            'Implementar micro-lecciones',
            'Agregar checkpoints de progreso',
            'Ofrecer descansos programados'
          ],
          examples: [
            {
              userId: 'user2',
              userName: 'Carlos Méndez',
              behavior: 'Pausas cada 5-7 minutos',
              outcome: '28% de riesgo de abandono'
            }
          ]
        }
      ];

      const mockEvents: InteractionEvent[] = [
        {
          id: '1',
          userId: 'user1',
          userName: 'María González',
          eventType: 'complete',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          duration: 1800,
          context: {
            page: '/lessons/math/geometry',
            element: 'lesson-complete',
            content: 'Geometría Maya Básica',
            language: 'maya'
          },
          metadata: {
            device: 'tablet',
            browser: 'Chrome',
            location: 'Yucatán',
            timeOfDay: '14:30'
          }
        },
        {
          id: '2',
          userId: 'user2',
          userName: 'Carlos Méndez',
          eventType: 'pause',
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          duration: 300,
          context: {
            page: '/lessons/language/poetry',
            element: 'video-player',
            content: 'Poesía Náhuatl',
            language: 'náhuatl'
          },
          metadata: {
            device: 'smartphone',
            browser: 'Safari',
            location: 'Puebla',
            timeOfDay: '11:15'
          }
        }
      ];

      setBehaviors(mockBehaviors);
      setPatterns(mockPatterns);
      setEvents(mockEvents);
      
      setAnalytics({
        totalUsers: 1247,
        activeUsers: 892,
        averageEngagement: 0.78,
        averageCompletion: 0.82,
        averageRetention: 0.75,
        topPatterns: mockPatterns,
        userSegments: [
          {
            segment: 'Aprendices Visuales',
            count: 456,
            characteristics: ['Prefieren imágenes', 'Mapas mentales', 'Videos'],
            behaviors: ['Sesiones largas', 'Alta retención', 'Completación rápida']
          },
          {
            segment: 'Aprendices Auditivos',
            count: 234,
            characteristics: ['Prefieren audio', 'Discusiones', 'Música'],
            behaviors: ['Sesiones cortas', 'Pausas frecuentes', 'Colaboración']
          },
          {
            segment: 'Aprendices Kinestésicos',
            count: 189,
            characteristics: ['Prefieren práctica', 'Movimiento', 'Proyectos'],
            behaviors: ['Sesiones interactivas', 'Alta participación', 'Experimentación']
          }
        ],
        engagementTrends: [
          { date: '2024-01-01', activeUsers: 850, averageSession: 25, completionRate: 0.80, retentionRate: 0.73 },
          { date: '2024-01-02', activeUsers: 870, averageSession: 27, completionRate: 0.82, retentionRate: 0.75 },
          { date: '2024-01-03', activeUsers: 892, averageSession: 28, completionRate: 0.84, retentionRate: 0.77 }
        ],
        learningStyles: [
          { style: 'visual', count: 456, percentage: 36.6, averagePerformance: 87 },
          { style: 'auditory', count: 234, percentage: 18.8, averagePerformance: 79 },
          { style: 'kinesthetic', count: 189, percentage: 15.2, averagePerformance: 92 },
          { style: 'reading', count: 156, percentage: 12.5, averagePerformance: 84 },
          { style: 'mixed', count: 212, percentage: 17.0, averagePerformance: 81 }
        ],
        predictions: {
          totalPredictions: 1247,
          accuracy: 0.87,
          highRiskUsers: 89,
          highPotentialUsers: 234
        }
      });
    } catch (error) {
      console.error('Error cargando datos de comportamiento:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEngagementColor = (level: string) => {
    switch (level) {
      case 'very_high': return 'bg-green-100 text-green-800';
      case 'high': return 'bg-blue-100 text-blue-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLearningStyleIcon = (style: string) => {
    switch (style) {
      case 'visual': return <Eye className="h-4 w-4" />;
      case 'auditory': return <Headphones className="h-4 w-4" />;
      case 'kinesthetic': return <Activity className="h-4 w-4" />;
      case 'reading': return <FileText className="h-4 w-4" />;
      case 'mixed': return <Brain className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'decreasing': return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'stable': return <Activity className="h-4 w-4 text-blue-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('es-MX').format(value);
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const formatDuration = (minutes: number) => {
    return `${minutes} min`;
  };

  const formatScore = (value: number) => {
    return `${value.toFixed(0)}/100`;
  };

  const filteredBehaviors = behaviors.filter(behavior => {
    const segmentMatch = filterSegment === 'all' || 
      analytics.userSegments.find(s => s.segment.includes(behavior.learningStyle))?.segment === filterSegment;
    const engagementMatch = filterEngagement === 'all' || behavior.engagementLevel === filterEngagement;
    return segmentMatch && engagementMatch;
  });

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
          <h1 className="text-3xl font-bold text-gray-900">Análisis de Comportamiento</h1>
          <p className="text-gray-600">Análisis de patrones de aprendizaje y predicciones de comportamiento</p>
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
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Análisis
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Período:</span>
          <select 
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="border rounded px-3 py-1 text-sm"
          >
            <option value="1d">Último día</option>
            <option value="7d">Últimos 7 días</option>
            <option value="30d">Últimos 30 días</option>
            <option value="90d">Últimos 90 días</option>
          </select>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Segmento:</span>
          <select 
            value={filterSegment}
            onChange={(e) => setFilterSegment(e.target.value)}
            className="border rounded px-3 py-1 text-sm"
          >
            <option value="all">Todos</option>
            {analytics.userSegments.map(segment => (
              <option key={segment.segment} value={segment.segment}>{segment.segment}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Engagement:</span>
          <select 
            value={filterEngagement}
            onChange={(e) => setFilterEngagement(e.target.value)}
            className="border rounded px-3 py-1 text-sm"
          >
            <option value="all">Todos</option>
            <option value="very_high">Muy Alto</option>
            <option value="high">Alto</option>
            <option value="medium">Medio</option>
            <option value="low">Bajo</option>
          </select>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(analytics.activeUsers)}</div>
            <p className="text-xs text-muted-foreground">
              de {formatNumber(analytics.totalUsers)} totales
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement Promedio</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(analytics.averageEngagement)}</div>
            <p className="text-xs text-muted-foreground">
              nivel de participación
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Completación</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(analytics.averageCompletion)}</div>
            <p className="text-xs text-muted-foreground">
              lecciones completadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Retención</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(analytics.averageRetention)}</div>
            <p className="text-xs text-muted-foreground">
              conocimiento retenido
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs principales */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="behaviors">Comportamientos</TabsTrigger>
          <TabsTrigger value="patterns">Patrones</TabsTrigger>
          <TabsTrigger value="segments">Segmentos</TabsTrigger>
          <TabsTrigger value="predictions">Predicciones</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Estilos de aprendizaje */}
            <Card>
              <CardHeader>
                <CardTitle>Estilos de Aprendizaje</CardTitle>
                <CardDescription>Distribución por preferencias de aprendizaje</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.learningStyles.map((style) => (
                    <div key={style.style} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getLearningStyleIcon(style.style)}
                        <div>
                          <div className="font-semibold capitalize">{style.style}</div>
                          <div className="text-sm text-gray-500">{formatNumber(style.count)} usuarios</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{formatPercentage(style.percentage / 100)}</div>
                        <div className="text-sm text-gray-500">
                          {formatScore(style.averagePerformance)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Predicciones */}
            <Card>
              <CardHeader>
                <CardTitle>Predicciones de Comportamiento</CardTitle>
                <CardDescription>Análisis predictivo de usuarios</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Total de Predicciones</span>
                    <Badge variant="secondary">{formatNumber(analytics.predictions.totalPredictions)}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Precisión del Modelo</span>
                    <Badge variant="default">{formatPercentage(analytics.predictions.accuracy)}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Usuarios en Riesgo</span>
                    <Badge variant="destructive">{formatNumber(analytics.predictions.highRiskUsers)}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Alto Potencial</span>
                    <Badge variant="outline">{formatNumber(analytics.predictions.highPotentialUsers)}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="behaviors" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredBehaviors.map((behavior) => (
              <Card key={behavior.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getLearningStyleIcon(behavior.learningStyle)}
                      <CardTitle className="text-lg">{behavior.userName}</CardTitle>
                    </div>
                    <Badge className={getEngagementColor(behavior.engagementLevel)}>
                      {behavior.engagementLevel === 'very_high' ? 'Muy Alto' :
                       behavior.engagementLevel === 'high' ? 'Alto' :
                       behavior.engagementLevel === 'medium' ? 'Medio' : 'Bajo'}
                    </Badge>
                  </div>
                  <CardDescription>{behavior.grade} • {behavior.language} • {behavior.region}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Duración Sesión:</span>
                      <div className="font-semibold">{formatDuration(behavior.sessionDuration)}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Completación:</span>
                      <div className="font-semibold">{formatPercentage(behavior.completionRate)}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Retención:</span>
                      <div className="font-semibold">{formatPercentage(behavior.retentionRate)}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Puntuación:</span>
                      <div className="font-semibold">{formatScore(behavior.metrics.averageScore)}</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <span className="text-sm font-medium">Patrones:</span>
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="outline" className="text-xs">
                        {behavior.patterns.preferredTime}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {behavior.patterns.preferredDuration}min
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {behavior.patterns.interactionStyle}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-sm font-medium">Predicciones:</span>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Riesgo de abandono:</span>
                      <span className="text-xs font-semibold">{formatPercentage(behavior.predictions.dropoutRisk)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">Tendencia:</span>
                      {getTrendIcon(behavior.predictions.engagementTrend)}
                      <span className="text-xs capitalize">{behavior.predictions.engagementTrend}</span>
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => setSelectedUser(behavior.id)}
                    >
                      Ver Detalles
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="patterns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Patrones de Comportamiento</CardTitle>
              <CardDescription>Análisis de patrones recurrentes y su impacto</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {patterns.map((pattern) => (
                  <div key={pattern.id} className="border rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <Brain className="h-5 w-5" />
                        <div>
                          <h3 className="font-semibold text-lg">{pattern.pattern}</h3>
                          <p className="text-sm text-gray-500 capitalize">{pattern.category}</p>
                        </div>
                      </div>
                      <Badge className={pattern.impact === 'positive' ? 'bg-green-100 text-green-800' :
                                       pattern.impact === 'negative' ? 'bg-red-100 text-red-800' :
                                       'bg-gray-100 text-gray-800'}>
                        {pattern.impact === 'positive' ? 'Positivo' :
                         pattern.impact === 'negative' ? 'Negativo' : 'Neutral'}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{formatNumber(pattern.frequency)}</div>
                        <div className="text-sm text-gray-500">Frecuencia</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{formatNumber(pattern.affectedUsers)}</div>
                        <div className="text-sm text-gray-500">Usuarios Afectados</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{formatPercentage(pattern.confidence)}</div>
                        <div className="text-sm text-gray-500">Confianza</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{pattern.recommendations.length}</div>
                        <div className="text-sm text-gray-500">Recomendaciones</div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-4">{pattern.description}</p>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium mb-2">Recomendaciones:</h4>
                        <ul className="space-y-1">
                          {pattern.recommendations.map((rec, index) => (
                            <li key={index} className="text-sm text-gray-600 flex items-center">
                              <Lightbulb className="h-3 w-3 mr-2 text-yellow-500" />
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Ejemplos:</h4>
                        <ul className="space-y-1">
                          {pattern.examples.map((example, index) => (
                            <li key={index} className="text-sm text-gray-600">
                              <div className="font-medium">{example.userName}</div>
                              <div className="text-xs text-gray-500">{example.behavior}</div>
                              <div className="text-xs text-green-600">{example.outcome}</div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="segments" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {analytics.userSegments.map((segment) => (
              <Card key={segment.segment}>
                <CardHeader>
                  <CardTitle>{segment.segment}</CardTitle>
                  <CardDescription>{formatNumber(segment.count)} usuarios</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Características:</h4>
                    <div className="flex flex-wrap gap-2">
                      {segment.characteristics.map((char, index) => (
                        <Badge key={index} variant="outline">
                          {char}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Comportamientos:</h4>
                    <div className="flex flex-wrap gap-2">
                      {segment.behaviors.map((behavior, index) => (
                        <Badge key={index} variant="secondary">
                          {behavior}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Usuarios en riesgo */}
            <Card>
              <CardHeader>
                <CardTitle>Usuarios en Riesgo</CardTitle>
                <CardDescription>Usuarios con alta probabilidad de abandono</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {behaviors
                    .filter(b => b.predictions.dropoutRisk > 0.25)
                    .slice(0, 5)
                    .map((behavior) => (
                      <div key={behavior.id} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <div className="font-semibold">{behavior.userName}</div>
                          <div className="text-sm text-gray-500">{behavior.grade} • {behavior.language}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-red-600">
                            {formatPercentage(behavior.predictions.dropoutRisk)}
                          </div>
                          <div className="text-xs text-gray-500">riesgo</div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Usuarios de alto potencial */}
            <Card>
              <CardHeader>
                <CardTitle>Alto Potencial</CardTitle>
                <CardDescription>Usuarios con excelente progreso</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {behaviors
                    .filter(b => b.predictions.dropoutRisk < 0.1 && b.metrics.averageScore > 85)
                    .slice(0, 5)
                    .map((behavior) => (
                      <div key={behavior.id} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <div className="font-semibold">{behavior.userName}</div>
                          <div className="text-sm text-gray-500">{behavior.grade} • {behavior.language}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-green-600">
                            {formatScore(behavior.metrics.averageScore)}
                          </div>
                          <div className="text-xs text-gray-500">puntuación</div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
