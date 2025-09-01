'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  Lightbulb, 
  Target, 
  TrendingUp, 
  Star, 
  Heart, 
  Clock, 
  Users,
  BookOpen,
  Video,
  Music,
  Gamepad2,
  Palette,
  Globe,
  Zap,
  Filter,
  Search,
  Settings,
  RefreshCw,
  Download,
  Share,
  Bookmark,
  Play,
  Pause,
  Loader2,
  CheckCircle,
  AlertCircle,
  Eye,
  BarChart3,
  PieChart,
  LineChart,
  Calendar,
  Award,
  Flag,
  Timer,
  RotateCcw,
  Plus,
  Minus,
  Maximize,
  Minimize,
  ArrowRight,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
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
  ChevronLeft,
  ChevronRight,
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
  Video as VideoIcon,
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
  XCircle,
  Save,
  Edit,
  Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { RecommendationEngine } from '@/components/ai/RecommendationEngine';

interface Recommendation {
  id: string;
  title: string;
  description: string;
  type: 'lesson' | 'exercise' | 'video' | 'game' | 'resource' | 'activity';
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number;
  rating: number;
  relevance: number;
  confidence: number;
  tags: string[];
  thumbnail?: string;
  url?: string;
  isCompleted?: boolean;
  isBookmarked?: boolean;
  estimatedImpact: 'low' | 'medium' | 'high';
  prerequisites?: string[];
  learningOutcomes: string[];
}

interface UserProfile {
  id: string;
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
  interests: string[];
  skillLevel: Record<string, number>;
  completedItems: string[];
  preferences: {
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    duration: 'short' | 'medium' | 'long';
    format: 'video' | 'text' | 'interactive' | 'audio';
    language: string;
  };
  culturalContext: string;
  accessibility: {
    visual: boolean;
    auditory: boolean;
    motor: boolean;
    cognitive: boolean;
  };
}

interface RecommendationSession {
  id: string;
  userId: string;
  date: Date;
  recommendations: Recommendation[];
  selectedItems: string[];
  completedItems: string[];
  feedback: {
    rating: number;
    comments: string;
    helpful: boolean;
  };
  effectiveness: number;
}

export default function RecommendationsPage() {
  const [currentUser, setCurrentUser] = useState<string>('user_123');
  const [recommendationSessions, setRecommendationSessions] = useState<RecommendationSession[]>([]);
  const [currentRecommendations, setCurrentRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showEngine, setShowEngine] = useState(false);
  const [selectedSession, setSelectedSession] = useState<RecommendationSession | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'recommendations' | 'history' | 'settings'>('overview');

  // Datos de ejemplo
  const mockRecommendationSessions: RecommendationSession[] = [
    {
      id: 'session_1',
      userId: 'user_123',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      recommendations: [
        {
          id: 'rec_1',
          title: 'Lección Maya: Números del 1 al 10',
          description: 'Aprende a contar en lengua maya con ejercicios interactivos',
          type: 'lesson',
          category: 'matemáticas',
          difficulty: 'beginner',
          duration: 15,
          rating: 4.5,
          relevance: 95,
          confidence: 0.92,
          tags: ['maya', 'números', 'básico'],
          estimatedImpact: 'high',
          learningOutcomes: ['Contar del 1 al 10 en maya', 'Reconocer símbolos numéricos']
        },
        {
          id: 'rec_2',
          title: 'Video: Historia de los Mayas',
          description: 'Documental sobre la civilización maya y sus contribuciones',
          type: 'video',
          category: 'historia',
          difficulty: 'intermediate',
          duration: 25,
          rating: 4.8,
          relevance: 88,
          confidence: 0.85,
          tags: ['maya', 'historia', 'cultura'],
          estimatedImpact: 'medium',
          learningOutcomes: ['Comprender la historia maya', 'Valorar la cultura indígena']
        }
      ],
      selectedItems: ['rec_1'],
      completedItems: ['rec_1'],
      feedback: {
        rating: 5,
        comments: 'Excelente lección, muy clara y fácil de seguir',
        helpful: true
      },
      effectiveness: 92
    },
    {
      id: 'session_2',
      userId: 'user_123',
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      recommendations: [
        {
          id: 'rec_3',
          title: 'Ejercicio: Vocabulario Maya Básico',
          description: 'Práctica de palabras comunes en maya',
          type: 'exercise',
          category: 'idioma',
          difficulty: 'beginner',
          duration: 20,
          rating: 4.2,
          relevance: 82,
          confidence: 0.78,
          tags: ['maya', 'vocabulario', 'práctica'],
          estimatedImpact: 'medium',
          learningOutcomes: ['Aprender 20 palabras básicas', 'Mejorar pronunciación']
        }
      ],
      selectedItems: ['rec_3'],
      completedItems: [],
      feedback: {
        rating: 4,
        comments: 'Buen ejercicio, pero necesito más práctica',
        helpful: true
      },
      effectiveness: 75
    }
  ];

  const mockCurrentRecommendations: Recommendation[] = [
    {
      id: 'rec_4',
      title: 'Lección Interactiva: Colores en Maya',
      description: 'Aprende los colores básicos en lengua maya con actividades interactivas',
      type: 'lesson',
      category: 'idioma',
      difficulty: 'beginner',
      duration: 18,
      rating: 4.6,
      relevance: 96,
      confidence: 0.94,
      tags: ['maya', 'colores', 'interactivo'],
      estimatedImpact: 'high',
      learningOutcomes: ['Identificar 8 colores básicos', 'Usar colores en contexto']
    },
    {
      id: 'rec_5',
      title: 'Juego: Memoria Maya',
      description: 'Juego de memoria con símbolos y palabras mayas',
      type: 'game',
      category: 'entretenimiento',
      difficulty: 'beginner',
      duration: 12,
      rating: 4.3,
      relevance: 89,
      confidence: 0.87,
      tags: ['maya', 'juego', 'memoria'],
      estimatedImpact: 'medium',
      learningOutcomes: ['Mejorar memoria visual', 'Reconocer símbolos mayas']
    },
    {
      id: 'rec_6',
      title: 'Recurso: Diccionario Maya-Español',
      description: 'Diccionario digital con pronunciación y ejemplos',
      type: 'resource',
      category: 'referencia',
      difficulty: 'intermediate',
      duration: 0,
      rating: 4.7,
      relevance: 91,
      confidence: 0.89,
      tags: ['maya', 'diccionario', 'referencia'],
      estimatedImpact: 'high',
      learningOutcomes: ['Acceso a vocabulario completo', 'Mejorar comprensión']
    }
  ];

  useEffect(() => {
    loadRecommendationData();
  }, []);

  const loadRecommendationData = async () => {
    try {
      setIsLoading(true);
      // En producción, esto sería una llamada a la API
      // const response = await fetch(`/api/ai/recommendations/${currentUser}`);
      // const data = await response.json();
      
      // Simulando carga
      await new Promise(resolve => setTimeout(resolve, 1000));
      setRecommendationSessions(mockRecommendationSessions);
      setCurrentRecommendations(mockCurrentRecommendations);
    } catch (error) {
      console.error('Error loading recommendation data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecommendationSelected = (recommendation: Recommendation) => {
    console.log('Recommendation selected:', recommendation);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-100';
      case 'intermediate': return 'text-yellow-600 bg-yellow-100';
      case 'advanced': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'lesson': return <BookOpen className="w-4 h-4" />;
      case 'exercise': return <Target className="w-4 h-4" />;
      case 'video': return <Video className="w-4 h-4" />;
      case 'game': return <Gamepad2 className="w-4 h-4" />;
      case 'resource': return <FileText className="w-4 h-4" />;
      case 'activity': return <ActivityIcon className="w-4 h-4" />;
      default: return <Lightbulb className="w-4 h-4" />;
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes === 0) return 'Sin límite';
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}min`;
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

  if (showEngine) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button 
            onClick={() => setShowEngine(false)}
            variant="outline"
            className="flex items-center space-x-2"
            tabIndex={0}
            aria-label="Volver a la página principal"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver</span>
          </Button>
        </div>
        <RecommendationEngine 
          userId={currentUser}
          onRecommendationSelected={handleRecommendationSelected}
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
            <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-lg">
              <Lightbulb className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Recomendaciones</h1>
              <p className="text-gray-600">Contenido personalizado basado en tu perfil de aprendizaje</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button 
              onClick={() => loadRecommendationData()}
              variant="outline"
              className="flex items-center space-x-2"
              tabIndex={0}
              aria-label="Actualizar datos"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Actualizar</span>
            </Button>
            <Button 
              onClick={() => setShowEngine(true)}
              className="flex items-center space-x-2"
              tabIndex={0}
              aria-label="Nuevas recomendaciones"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevas Recomendaciones</span>
            </Button>
          </div>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Lightbulb className="w-5 h-5 text-yellow-600" />
                <span className="text-sm font-medium">Recomendaciones Activas</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {currentRecommendations.length}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium">Completadas</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {recommendationSessions.reduce((acc, s) => acc + s.completedItems.length, 0)}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium">Efectividad Promedio</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {recommendationSessions.length > 0 
                  ? Math.round(recommendationSessions.reduce((acc, s) => acc + s.effectiveness, 0) / recommendationSessions.length)
                  : 0}%
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Heart className="w-5 h-5 text-red-600" />
                <span className="text-sm font-medium">Satisfacción</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {recommendationSessions.length > 0 
                  ? (recommendationSessions.reduce((acc, s) => acc + s.feedback.rating, 0) / recommendationSessions.length).toFixed(1)
                  : '0.0'}/5.0
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
              { id: 'recommendations', label: 'Recomendaciones', icon: Lightbulb },
              { id: 'history', label: 'Historial', icon: Clock },
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
                      ? "border-yellow-500 text-yellow-600"
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
          {/* Recomendación destacada */}
          {currentRecommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Star className="w-5 h-5 text-yellow-600" />
                  <span>Recomendación Destacada</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const topRecommendation = currentRecommendations.reduce((best, current) => 
                    current.relevance > best.relevance ? current : best
                  );
                  return (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          {getTypeIcon(topRecommendation.type)}
                          <div>
                            <div className="font-medium">{topRecommendation.title}</div>
                            <div className="text-sm text-gray-600">
                              {topRecommendation.category} • {formatDuration(topRecommendation.duration)}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-yellow-600">{topRecommendation.relevance}%</div>
                          <div className="text-sm text-gray-600">Relevancia</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <span className="text-sm text-gray-600">Dificultad:</span>
                          <div className="font-medium capitalize">{topRecommendation.difficulty}</div>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Impacto:</span>
                          <div className="font-medium capitalize">{topRecommendation.estimatedImpact}</div>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Calificación:</span>
                          <div className="font-medium">{topRecommendation.rating}/5.0</div>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600">{topRecommendation.description}</p>
                      
                      <div className="flex space-x-2">
                        <Button size="sm" className="flex-1">
                          <Play className="w-3 h-3 mr-1" />
                          Comenzar
                        </Button>
                        <Button size="sm" variant="outline">
                          <Bookmark className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          )}

          {/* Categorías populares */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                <span>Categorías Populares</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: 'Idioma Maya', count: 8, icon: '🌿' },
                  { name: 'Historia', count: 5, icon: '📚' },
                  { name: 'Matemáticas', count: 6, icon: '🔢' },
                  { name: 'Cultura', count: 4, icon: '🏛️' }
                ].map((category, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{category.icon}</div>
                      <div>
                        <div className="font-medium">{category.name}</div>
                        <div className="text-sm text-gray-600">{category.count} recomendaciones</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'recommendations' && (
        <div className="space-y-4">
          {currentRecommendations.map((recommendation) => (
            <Card key={recommendation.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {getTypeIcon(recommendation.type)}
                    <div>
                      <h3 className="font-semibold">{recommendation.title}</h3>
                      <p className="text-sm text-gray-600">{recommendation.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={cn("text-xs", getDifficultyColor(recommendation.difficulty))}>
                      {recommendation.difficulty === 'beginner' ? 'Principiante' :
                       recommendation.difficulty === 'intermediate' ? 'Intermedio' : 'Avanzado'}
                    </Badge>
                    <Badge className={cn("text-xs", getImpactColor(recommendation.estimatedImpact))}>
                      {recommendation.estimatedImpact === 'high' ? 'Alto Impacto' :
                       recommendation.estimatedImpact === 'medium' ? 'Medio Impacto' : 'Bajo Impacto'}
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <span className="text-sm text-gray-600">Duración:</span>
                    <div className="font-medium">{formatDuration(recommendation.duration)}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Relevancia:</span>
                    <div className="font-medium">{recommendation.relevance}%</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Calificación:</span>
                    <div className="font-medium">{recommendation.rating}/5.0</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Confianza:</span>
                    <div className="font-medium">{Math.round(recommendation.confidence * 100)}%</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex flex-wrap gap-1">
                    {recommendation.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      size="sm"
                      onClick={() => handleRecommendationSelected(recommendation)}
                      tabIndex={0}
                      aria-label="Comenzar recomendación"
                    >
                      <Play className="w-3 h-3 mr-1" />
                      Comenzar
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      tabIndex={0}
                      aria-label="Guardar recomendación"
                    >
                      <Bookmark className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="space-y-4">
          {recommendationSessions.map((session) => (
            <Card key={session.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Lightbulb className="w-5 h-5 text-yellow-600" />
                    <div>
                      <h3 className="font-semibold">Sesión #{session.id.split('_')[1]}</h3>
                      <p className="text-sm text-gray-600">
                        Recomendaciones del {formatDate(session.date)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={cn("text-xs", 
                      session.effectiveness >= 90 ? "bg-green-100 text-green-800" :
                      session.effectiveness >= 75 ? "bg-blue-100 text-blue-800" : "bg-yellow-100 text-yellow-800"
                    )}>
                      {session.effectiveness}% Efectivo
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {session.recommendations.length} items
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <span className="text-sm text-gray-600">Seleccionados:</span>
                    <div className="font-medium">{session.selectedItems.length}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Completados:</span>
                    <div className="font-medium">{session.completedItems.length}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Satisfacción:</span>
                    <div className="font-medium">{session.feedback.rating}/5.0</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Útil:</span>
                    <div className="font-medium">{session.feedback.helpful ? 'Sí' : 'No'}</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="text-sm text-gray-600 max-w-md truncate">
                    {session.feedback.comments}
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setSelectedSession(session)}
                      tabIndex={0}
                      aria-label="Ver detalles de la sesión"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      Ver Detalles
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      tabIndex={0}
                      aria-label="Exportar sesión"
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

      {activeTab === 'settings' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Recomendaciones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Estilo de Aprendizaje</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                    <option value="visual">Visual</option>
                    <option value="auditory">Auditivo</option>
                    <option value="kinesthetic">Kinestésico</option>
                    <option value="reading">Lectura</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Nivel de Dificultad Preferido</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                    <option value="beginner">Principiante</option>
                    <option value="intermediate">Intermedio</option>
                    <option value="advanced">Avanzado</option>
                    <option value="mixed">Mixto</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Duración Preferida</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                    <option value="short">Corta (5-15 min)</option>
                    <option value="medium">Media (15-30 min)</option>
                    <option value="long">Larga (30+ min)</option>
                    <option value="flexible">Flexible</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Preferencias</label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" defaultChecked />
                      <span>Incluir contenido cultural</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" defaultChecked />
                      <span>Priorizar contenido interactivo</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      <span>Mostrar solo contenido gratuito</span>
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
      {selectedSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Detalles de la Sesión</h3>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedSession(null)}
                  tabIndex={0}
                  aria-label="Cerrar detalles"
                >
                  <XCircle className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  <Lightbulb className="w-6 h-6 text-yellow-600" />
                  <div>
                    <h4 className="font-medium">Sesión #{selectedSession.id.split('_')[1]}</h4>
                    <p className="text-sm text-gray-600">{formatDate(selectedSession.date)}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-medium mb-2">Estadísticas</h5>
                    <div className="space-y-1 text-sm">
                      <div><strong>Efectividad:</strong> {selectedSession.effectiveness}%</div>
                      <div><strong>Seleccionados:</strong> {selectedSession.selectedItems.length}</div>
                      <div><strong>Completados:</strong> {selectedSession.completedItems.length}</div>
                      <div><strong>Satisfacción:</strong> {selectedSession.feedback.rating}/5.0</div>
                    </div>
                  </div>
                  <div>
                    <h5 className="font-medium mb-2">Feedback</h5>
                    <div className="space-y-1 text-sm">
                      <div><strong>Útil:</strong> {selectedSession.feedback.helpful ? 'Sí' : 'No'}</div>
                      <div><strong>Comentarios:</strong></div>
                      <p className="text-gray-600">{selectedSession.feedback.comments}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h5 className="font-medium mb-3">Recomendaciones de la Sesión</h5>
                  <div className="space-y-2">
                    {selectedSession.recommendations.map((rec) => (
                      <div key={rec.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-3">
                          {getTypeIcon(rec.type)}
                          <div>
                            <div className="font-medium">{rec.title}</div>
                            <div className="text-sm text-gray-600">
                              {rec.category} • {formatDuration(rec.duration)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={selectedSession.selectedItems.includes(rec.id) ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"}>
                            {selectedSession.selectedItems.includes(rec.id) ? 'Seleccionado' : 'No seleccionado'}
                          </Badge>
                          <Badge className={selectedSession.completedItems.includes(rec.id) ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                            {selectedSession.completedItems.includes(rec.id) ? 'Completado' : 'Pendiente'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
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
