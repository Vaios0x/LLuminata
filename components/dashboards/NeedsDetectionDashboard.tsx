'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Target, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  Users,
  BookOpen,
  Lightbulb,
  BarChart3,
  PieChart,
  LineChart,
  Filter,
  Download,
  RefreshCw,
  Plus,
  Eye,
  Brain,
  Heart,
  Star,
  MessageSquare,
  Calendar,
  MapPin,
  Globe,
  Smartphone,
  Monitor,
  Zap,
  Activity,
  Award,
  Bookmark,
  FileText,
  Video,
  Headphones,
  Mic,
  MousePointer,
  MousePointerClick
} from 'lucide-react';

interface LearningNeed {
  id: string;
  userId: string;
  userName: string;
  category: 'academic' | 'social' | 'emotional' | 'cognitive' | 'physical' | 'cultural';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'detected' | 'analyzing' | 'addressed' | 'resolved' | 'monitoring';
  confidence: number;
  detectedAt: Date;
  lastUpdated: Date;
  description: string;
  indicators: string[];
  recommendations: string[];
  progress: number;
  impact: {
    academic: number;
    social: number;
    emotional: number;
    overall: number;
  };
  metadata: {
    age: number;
    grade: string;
    language: string;
    location: string;
    device: string;
    sessionDuration: number;
    interactionPattern: string;
  };
}

interface NeedPattern {
  id: string;
  pattern: string;
  frequency: number;
  affectedUsers: number;
  category: string;
  severity: 'low' | 'medium' | 'high';
  detectionRate: number;
  resolutionRate: number;
  avgResolutionTime: number;
  commonIndicators: string[];
  recommendedActions: string[];
}

interface NeedsAnalytics {
  totalNeeds: number;
  activeNeeds: number;
  resolvedNeeds: number;
  detectionRate: number;
  resolutionRate: number;
  avgResolutionTime: number;
  topCategories: {
    category: string;
    count: number;
    percentage: number;
  }[];
  topPatterns: NeedPattern[];
  recentDetections: LearningNeed[];
  userSegments: {
    segment: string;
    count: number;
    commonNeeds: string[];
  }[];
  trends: {
    date: string;
    detections: number;
    resolutions: number;
    activeNeeds: number;
  }[];
}

interface CulturalContext {
  language: string;
  region: string;
  culturalValues: string[];
  learningStyles: string[];
  commonChallenges: string[];
  recommendedApproaches: string[];
}

export default function NeedsDetectionDashboard() {
  const [needs, setNeeds] = useState<LearningNeed[]>([]);
  const [patterns, setPatterns] = useState<NeedPattern[]>([]);
  const [analytics, setAnalytics] = useState<NeedsAnalytics>({
    totalNeeds: 0,
    activeNeeds: 0,
    resolvedNeeds: 0,
    detectionRate: 0,
    resolutionRate: 0,
    avgResolutionTime: 0,
    topCategories: [],
    topPatterns: [],
    recentDetections: [],
    userSegments: [],
    trends: []
  });
  const [loading, setLoading] = useState(true);
  const [selectedNeed, setSelectedNeed] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<string>('7d');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');

  useEffect(() => {
    loadNeedsData();
  }, [timeRange]);

  const loadNeedsData = async () => {
    setLoading(true);
    try {
      // Simular carga de datos
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockNeeds: LearningNeed[] = [
        {
          id: '1',
          userId: 'user1',
          userName: 'María González',
          category: 'academic',
          priority: 'high',
          status: 'analyzing',
          confidence: 0.89,
          detectedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          lastUpdated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          description: 'Dificultades en comprensión lectora y matemáticas básicas',
          indicators: [
            'Tiempo de lectura lento',
            'Errores frecuentes en operaciones básicas',
            'Evita tareas de lectura',
            'Baja confianza en matemáticas'
          ],
          recommendations: [
            'Implementar ejercicios de lectura guiada',
            'Usar manipulativos para matemáticas',
            'Proporcionar retroalimentación positiva',
            'Crear rutinas de estudio estructuradas'
          ],
          progress: 35,
          impact: {
            academic: 0.8,
            social: 0.4,
            emotional: 0.6,
            overall: 0.6
          },
          metadata: {
            age: 12,
            grade: '6to',
            language: 'es-MX',
            location: 'Oaxaca',
            device: 'tablet',
            sessionDuration: 25,
            interactionPattern: 'visual_learner'
          }
        },
        {
          id: '2',
          userId: 'user2',
          userName: 'Carlos Méndez',
          category: 'social',
          priority: 'medium',
          status: 'detected',
          confidence: 0.76,
          detectedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          lastUpdated: new Date(Date.now() - 12 * 60 * 60 * 1000),
          description: 'Dificultades en interacción social y trabajo en equipo',
          indicators: [
            'Poca participación en grupos',
            'Evita actividades colaborativas',
            'Comunicación limitada',
            'Preferencia por trabajo individual'
          ],
          recommendations: [
            'Actividades de ice-breaker',
            'Trabajo en parejas progresivo',
            'Roles específicos en grupos',
            'Celebraciones de logros grupales'
          ],
          progress: 15,
          impact: {
            academic: 0.3,
            social: 0.9,
            emotional: 0.7,
            overall: 0.6
          },
          metadata: {
            age: 14,
            grade: '8vo',
            language: 'es-MX',
            location: 'Chiapas',
            device: 'smartphone',
            sessionDuration: 18,
            interactionPattern: 'introvert'
          }
        },
        {
          id: '3',
          userId: 'user3',
          userName: 'Ana López',
          category: 'emotional',
          priority: 'critical',
          status: 'addressed',
          confidence: 0.94,
          detectedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          lastUpdated: new Date(Date.now() - 6 * 60 * 60 * 1000),
          description: 'Ansiedad académica y baja autoestima',
          indicators: [
            'Miedo a cometer errores',
            'Perfeccionismo excesivo',
            'Síntomas físicos de ansiedad',
            'Autocrítica severa'
          ],
          recommendations: [
            'Técnicas de respiración',
            'Establecer metas realistas',
            'Celebrar pequeños logros',
            'Terapia de apoyo emocional'
          ],
          progress: 60,
          impact: {
            academic: 0.9,
            social: 0.8,
            emotional: 0.95,
            overall: 0.88
          },
          metadata: {
            age: 16,
            grade: '10mo',
            language: 'es-MX',
            location: 'Yucatán',
            device: 'laptop',
            sessionDuration: 45,
            interactionPattern: 'anxious_learner'
          }
        }
      ];

      const mockPatterns: NeedPattern[] = [
        {
          id: '1',
          pattern: 'Dificultades en comprensión lectora',
          frequency: 156,
          affectedUsers: 89,
          category: 'academic',
          severity: 'high',
          detectionRate: 0.92,
          resolutionRate: 0.78,
          avgResolutionTime: 14.5,
          commonIndicators: [
            'Tiempo de lectura lento',
            'Preguntas frecuentes sobre el texto',
            'Evita tareas de lectura'
          ],
          recommendedActions: [
            'Ejercicios de lectura guiada',
            'Uso de marcadores visuales',
            'Lectura en voz alta'
          ]
        },
        {
          id: '2',
          pattern: 'Ansiedad matemática',
          frequency: 98,
          affectedUsers: 67,
          category: 'emotional',
          severity: 'medium',
          detectionRate: 0.85,
          resolutionRate: 0.65,
          avgResolutionTime: 21.3,
          commonIndicators: [
            'Evita problemas matemáticos',
            'Síntomas físicos de estrés',
            'Autocrítica en matemáticas'
          ],
          recommendedActions: [
            'Manipulativos matemáticos',
            'Problemas contextualizados',
            'Celebración de pequeños logros'
          ]
        }
      ];

      setNeeds(mockNeeds);
      setPatterns(mockPatterns);
      
      setAnalytics({
        totalNeeds: 1247,
        activeNeeds: 456,
        resolvedNeeds: 791,
        detectionRate: 0.89,
        resolutionRate: 0.73,
        avgResolutionTime: 18.5,
        topCategories: [
          { category: 'academic', count: 456, percentage: 36.6 },
          { category: 'emotional', count: 234, percentage: 18.8 },
          { category: 'social', count: 198, percentage: 15.9 },
          { category: 'cognitive', count: 156, percentage: 12.5 },
          { category: 'cultural', count: 123, percentage: 9.9 },
          { category: 'physical', count: 80, percentage: 6.4 }
        ],
        topPatterns: mockPatterns,
        recentDetections: mockNeeds.slice(0, 10),
        userSegments: [
          {
            segment: 'Estudiantes rurales',
            count: 234,
            commonNeeds: ['acceso_tecnología', 'recursos_educativos', 'apoyo_académico']
          },
          {
            segment: 'Estudiantes indígenas',
            count: 189,
            commonNeeds: ['lengua_materna', 'contexto_cultural', 'inclusión_social']
          },
          {
            segment: 'Estudiantes con discapacidad',
            count: 145,
            commonNeeds: ['accesibilidad', 'adaptaciones', 'apoyo_especializado']
          }
        ],
        trends: [
          { date: '2024-01-01', detections: 45, resolutions: 32, activeNeeds: 234 },
          { date: '2024-01-02', detections: 52, resolutions: 38, activeNeeds: 248 },
          { date: '2024-01-03', detections: 48, resolutions: 41, activeNeeds: 255 }
        ]
      });
    } catch (error) {
      console.error('Error cargando datos de detección de necesidades:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'detected': return 'bg-blue-100 text-blue-800';
      case 'analyzing': return 'bg-purple-100 text-purple-800';
      case 'addressed': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'monitoring': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'academic': return <BookOpen className="h-4 w-4" />;
      case 'social': return <Users className="h-4 w-4" />;
      case 'emotional': return <Heart className="h-4 w-4" />;
      case 'cognitive': return <Brain className="h-4 w-4" />;
      case 'physical': return <Activity className="h-4 w-4" />;
      case 'cultural': return <Globe className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('es-MX').format(value);
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const formatDuration = (days: number) => {
    return `${days.toFixed(1)} días`;
  };

  const filteredNeeds = needs.filter(need => {
    const categoryMatch = filterCategory === 'all' || need.category === filterCategory;
    const priorityMatch = filterPriority === 'all' || need.priority === filterPriority;
    return categoryMatch && priorityMatch;
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
          <h1 className="text-3xl font-bold text-gray-900">Detección de Necesidades</h1>
          <p className="text-gray-600">Análisis inteligente de necesidades de aprendizaje</p>
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
            Nueva Detección
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
          <span className="text-sm text-gray-600">Categoría:</span>
          <select 
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="border rounded px-3 py-1 text-sm"
          >
            <option value="all">Todas</option>
            <option value="academic">Académica</option>
            <option value="social">Social</option>
            <option value="emotional">Emocional</option>
            <option value="cognitive">Cognitiva</option>
            <option value="physical">Física</option>
            <option value="cultural">Cultural</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Prioridad:</span>
          <select 
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="border rounded px-3 py-1 text-sm"
          >
            <option value="all">Todas</option>
            <option value="critical">Crítica</option>
            <option value="high">Alta</option>
            <option value="medium">Media</option>
            <option value="low">Baja</option>
          </select>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Necesidades Activas</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.activeNeeds}</div>
            <p className="text-xs text-muted-foreground">
              de {analytics.totalNeeds} totales
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Detección</CardTitle>
            <Search className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(analytics.detectionRate)}</div>
            <p className="text-xs text-muted-foreground">
              precisión en detección
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Resolución</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(analytics.resolutionRate)}</div>
            <p className="text-xs text-muted-foreground">
              necesidades resueltas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tiempo Promedio</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDuration(analytics.avgResolutionTime)}</div>
            <p className="text-xs text-muted-foreground">
              para resolver necesidades
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs principales */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="needs">Necesidades</TabsTrigger>
          <TabsTrigger value="patterns">Patrones</TabsTrigger>
          <TabsTrigger value="segments">Segmentos</TabsTrigger>
          <TabsTrigger value="trends">Tendencias</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Categorías principales */}
            <Card>
              <CardHeader>
                <CardTitle>Necesidades por Categoría</CardTitle>
                <CardDescription>Distribución de necesidades detectadas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.topCategories.map((category) => (
                    <div key={category.category} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getCategoryIcon(category.category)}
                        <span className="capitalize">{category.category}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Progress value={category.percentage} className="w-20" />
                        <Badge variant="secondary">{formatNumber(category.count)}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Necesidades recientes */}
            <Card>
              <CardHeader>
                <CardTitle>Detecciones Recientes</CardTitle>
                <CardDescription>Últimas necesidades detectadas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.recentDetections.slice(0, 5).map((need) => (
                    <div key={need.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {getCategoryIcon(need.category)}
                          <span className="font-semibold">{need.userName}</span>
                        </div>
                        <Badge className={getPriorityColor(need.priority)}>
                          {need.priority === 'critical' ? 'Crítica' :
                           need.priority === 'high' ? 'Alta' :
                           need.priority === 'medium' ? 'Media' : 'Baja'}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{need.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(need.status)}>
                            {need.status === 'detected' ? 'Detectada' :
                             need.status === 'analyzing' ? 'Analizando' :
                             need.status === 'addressed' ? 'Atendida' :
                             need.status === 'resolved' ? 'Resuelta' : 'Monitoreando'}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {formatPercentage(need.confidence)}
                          </span>
                        </div>
                        <Progress value={need.progress} className="w-20" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="needs" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredNeeds.map((need) => (
              <Card key={need.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getCategoryIcon(need.category)}
                      <CardTitle className="text-lg">{need.userName}</CardTitle>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getPriorityColor(need.priority)}>
                        {need.priority === 'critical' ? 'Crítica' :
                         need.priority === 'high' ? 'Alta' :
                         need.priority === 'medium' ? 'Media' : 'Baja'}
                      </Badge>
                      <Badge className={getStatusColor(need.status)}>
                        {need.status === 'detected' ? 'Detectada' :
                         need.status === 'analyzing' ? 'Analizando' :
                         need.status === 'addressed' ? 'Atendida' :
                         need.status === 'resolved' ? 'Resuelta' : 'Monitoreando'}
                      </Badge>
                    </div>
                  </div>
                  <CardDescription className="capitalize">{need.category}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600">{need.description}</p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progreso:</span>
                      <span>{need.progress}%</span>
                    </div>
                    <Progress value={need.progress} className="h-2" />
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Confianza:</span>
                      <div className="font-semibold">{formatPercentage(need.confidence)}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Impacto:</span>
                      <div className="font-semibold">{formatPercentage(need.impact.overall)}</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-sm font-medium">Indicadores:</span>
                    <div className="flex flex-wrap gap-1">
                      {need.indicators.slice(0, 3).map((indicator, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {indicator}
                        </Badge>
                      ))}
                      {need.indicators.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{need.indicators.length - 3} más
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => setSelectedNeed(need.id)}
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
              <CardTitle>Patrones de Necesidades</CardTitle>
              <CardDescription>Análisis de patrones recurrentes y tendencias</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {patterns.map((pattern) => (
                  <div key={pattern.id} className="border rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        {getCategoryIcon(pattern.category)}
                        <div>
                          <h3 className="font-semibold text-lg">{pattern.pattern}</h3>
                          <p className="text-sm text-gray-500 capitalize">{pattern.category}</p>
                        </div>
                      </div>
                      <Badge className={pattern.severity === 'high' ? 'bg-red-100 text-red-800' :
                                       pattern.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                       'bg-green-100 text-green-800'}>
                        {pattern.severity === 'high' ? 'Alta' :
                         pattern.severity === 'medium' ? 'Media' : 'Baja'}
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
                        <div className="text-2xl font-bold">{formatPercentage(pattern.detectionRate)}</div>
                        <div className="text-sm text-gray-500">Tasa de Detección</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{formatPercentage(pattern.resolutionRate)}</div>
                        <div className="text-sm text-gray-500">Tasa de Resolución</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium mb-2">Indicadores Comunes:</h4>
                        <ul className="space-y-1">
                          {pattern.commonIndicators.map((indicator, index) => (
                            <li key={index} className="text-sm text-gray-600 flex items-center">
                              <AlertTriangle className="h-3 w-3 mr-2 text-orange-500" />
                              {indicator}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Acciones Recomendadas:</h4>
                        <ul className="space-y-1">
                          {pattern.recommendedActions.map((action, index) => (
                            <li key={index} className="text-sm text-gray-600 flex items-center">
                              <Lightbulb className="h-3 w-3 mr-2 text-yellow-500" />
                              {action}
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
                <CardContent>
                  <div className="space-y-3">
                    <h4 className="font-medium">Necesidades Comunes:</h4>
                    <div className="flex flex-wrap gap-2">
                      {segment.commonNeeds.map((need, index) => (
                        <Badge key={index} variant="outline">
                          {need.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tendencias de Detección</CardTitle>
              <CardDescription>Evolución de detecciones y resoluciones</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center bg-gray-50 rounded-lg">
                <LineChart className="h-12 w-12 text-gray-400" />
                <span className="ml-2 text-gray-500">Gráfico de tendencias</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
