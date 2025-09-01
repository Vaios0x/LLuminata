'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  Target, 
  Award, 
  Star, 
  Clock, 
  BookOpen, 
  CheckCircle,
  AlertCircle,
  Info,
  ArrowRight,
  RefreshCw,
  Settings,
  Brain,
  Heart,
  Globe,
  Users,
  Calendar,
  BarChart3,
  PieChart,
  LineChart,
  Activity,
  Zap,
  Sparkles,
  Trophy,
  Medal,
  Crown,
  ChevronDown,
  ChevronUp,
  Eye,
  Palette
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useScreenReader } from '@/components/accessibility/screen-reader';
import { useHighContrast } from '@/components/accessibility/high-contrast';

interface LearningObjective {
  id: string;
  title: string;
  description: string;
  category: string;
  targetScore: number;
  currentScore: number;
  deadline?: Date;
  status: 'not-started' | 'in-progress' | 'completed' | 'overdue';
  difficulty: 1 | 2 | 3 | 4 | 5;
  culturalRelevance: number; // 0-100
  accessibilityScore: number; // 0-100
}

interface ProgressMetric {
  category: string;
  value: number;
  target: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  change: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  unlockedAt: Date;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points: number;
}

interface Recommendation {
  id: string;
  type: 'lesson' | 'practice' | 'review' | 'challenge';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  estimatedTime: number;
  culturalContext?: string;
  accessibility?: string[];
}

interface ProgressTrackerProps {
  userId?: string;
  onObjectiveComplete?: (objectiveId: string) => void;
  onAchievementUnlocked?: (achievement: Achievement) => void;
  className?: string;
}

export default function ProgressTracker({
  userId,
  onObjectiveComplete,
  onAchievementUnlocked,
  className = ''
}: ProgressTrackerProps) {
  const { user } = useAuth();
  const { speak, isEnabled: screenReaderEnabled } = useScreenReader();
  const { getStyles } = useHighContrast();

  const [objectives, setObjectives] = useState<LearningObjective[]>([]);
  const [metrics, setMetrics] = useState<ProgressMetric[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedView, setSelectedView] = useState<'overview' | 'objectives' | 'achievements' | 'recommendations'>('overview');
  const [showDetails, setShowDetails] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  useEffect(() => {
    loadProgressData();
  }, [userId]);

  const loadProgressData = async () => {
    setIsLoading(true);
    try {
      // En producción, esto vendría de la API
      const mockObjectives: LearningObjective[] = [
        {
          id: 'obj-1',
          title: 'Dominar Sistema Numérico Maya',
          description: 'Comprender y aplicar el sistema vigesimal maya',
          category: 'Matemáticas',
          targetScore: 90,
          currentScore: 75,
          deadline: new Date('2024-02-15'),
          status: 'in-progress',
          difficulty: 3,
          culturalRelevance: 95,
          accessibilityScore: 88
        },
        {
          id: 'obj-2',
          title: 'Historia de Civilizaciones Indígenas',
          description: 'Conocer la historia y contribuciones de las civilizaciones indígenas',
          category: 'Historia',
          targetScore: 85,
          currentScore: 60,
          deadline: new Date('2024-02-20'),
          status: 'in-progress',
          difficulty: 2,
          culturalRelevance: 100,
          accessibilityScore: 92
        },
        {
          id: 'obj-3',
          title: 'Astronomía Maya',
          description: 'Entender los principios astronómicos mayas',
          category: 'Ciencias',
          targetScore: 80,
          currentScore: 45,
          deadline: new Date('2024-03-01'),
          status: 'in-progress',
          difficulty: 4,
          culturalRelevance: 90,
          accessibilityScore: 85
        },
        {
          id: 'obj-4',
          title: 'Arte y Cultura Indígena',
          description: 'Explorar las expresiones artísticas indígenas',
          category: 'Arte',
          targetScore: 70,
          currentScore: 70,
          deadline: new Date('2024-01-30'),
          status: 'completed',
          difficulty: 2,
          culturalRelevance: 100,
          accessibilityScore: 95
        }
      ];

      const mockMetrics: ProgressMetric[] = [
        {
          category: 'Lecciones Completadas',
          value: 24,
          target: 30,
          unit: 'lecciones',
          trend: 'up',
          change: 12
        },
        {
          category: 'Puntuación Promedio',
          value: 82,
          target: 85,
          unit: '%',
          trend: 'up',
          change: 5
        },
        {
          category: 'Tiempo de Estudio',
          value: 45,
          target: 60,
          unit: 'horas',
          trend: 'up',
          change: 8
        },
        {
          category: 'Logros Desbloqueados',
          value: 8,
          target: 12,
          unit: 'logros',
          trend: 'up',
          change: 2
        }
      ];

      const mockAchievements: Achievement[] = [
        {
          id: 'ach-1',
          title: 'Primer Paso',
          description: 'Completaste tu primera lección',
          icon: '🎯',
          category: 'Progreso',
          unlockedAt: new Date('2024-01-10'),
          rarity: 'common',
          points: 10
        },
        {
          id: 'ach-2',
          title: 'Guardian Cultural',
          description: 'Completaste 10 lecciones sobre cultura indígena',
          icon: '🏛️',
          category: 'Cultura',
          unlockedAt: new Date('2024-01-15'),
          rarity: 'rare',
          points: 50
        },
        {
          id: 'ach-3',
          title: 'Matemático Maya',
          description: 'Dominaste el sistema numérico maya',
          icon: '🔢',
          category: 'Matemáticas',
          unlockedAt: new Date('2024-01-20'),
          rarity: 'epic',
          points: 100
        }
      ];

      const mockRecommendations: Recommendation[] = [
        {
          id: 'rec-1',
          type: 'lesson',
          title: 'Práctica Avanzada de Números Mayas',
          description: 'Refuerza tus conocimientos con ejercicios más complejos',
          priority: 'high',
          estimatedTime: 30,
          culturalContext: 'Aplicación en calendario maya',
          accessibility: ['screenReader', 'highContrast']
        },
        {
          id: 'rec-2',
          type: 'review',
          title: 'Repaso de Historia Indígena',
          description: 'Revisa los conceptos clave de la historia indígena',
          priority: 'medium',
          estimatedTime: 20,
          culturalContext: 'Contexto histórico regional',
          accessibility: ['audioDescription']
        },
        {
          id: 'rec-3',
          type: 'challenge',
          title: 'Desafío de Astronomía Maya',
          description: 'Aplica tus conocimientos en un desafío interactivo',
          priority: 'low',
          estimatedTime: 45,
          culturalContext: 'Observaciones astronómicas tradicionales',
          accessibility: ['keyboardNavigation', 'subtitles']
        }
      ];

      setObjectives(mockObjectives);
      setMetrics(mockMetrics);
      setAchievements(mockAchievements);
      setRecommendations(mockRecommendations);
    } catch (error) {
      console.error('Error cargando datos de progreso:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateOverallProgress = (): number => {
    if (objectives.length === 0) return 0;
    const totalProgress = objectives.reduce((sum, obj) => sum + (obj.currentScore / obj.targetScore), 0);
    return Math.round((totalProgress / objectives.length) * 100);
  };

  const getStatusColor = (status: string): string => {
    const colors: { [key: string]: string } = {
      'completed': 'green',
      'in-progress': 'blue',
      'not-started': 'gray',
      'overdue': 'red'
    };
    return colors[status] || 'gray';
  };

  const getDifficultyColor = (difficulty: number): string => {
    if (difficulty <= 2) return 'green';
    if (difficulty <= 3) return 'yellow';
    if (difficulty <= 4) return 'orange';
    return 'red';
  };

  const getRarityColor = (rarity: string): string => {
    const colors: { [key: string]: string } = {
      'common': 'gray',
      'rare': 'blue',
      'epic': 'purple',
      'legendary': 'orange'
    };
    return colors[rarity] || 'gray';
  };

  const getPriorityColor = (priority: string): string => {
    const colors: { [key: string]: string } = {
      'high': 'red',
      'medium': 'yellow',
      'low': 'green'
    };
    return colors[priority] || 'gray';
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const handleObjectiveComplete = (objectiveId: string) => {
    setObjectives(prev => prev.map(obj => 
      obj.id === objectiveId 
        ? { ...obj, status: 'completed', currentScore: obj.targetScore }
        : obj
    ));
    onObjectiveComplete?.(objectiveId);
  };

  const overallProgress = calculateOverallProgress();

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <RefreshCw className="h-8 w-8 text-blue-600 mx-auto mb-4 animate-spin" />
        <p className="text-gray-600">Cargando progreso...</p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`} style={getStyles()}>
      {/* Header principal */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Seguimiento de Progreso
              </CardTitle>
              <p className="text-gray-600 mt-1">Tu viaje de aprendizaje personalizado</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-blue-600">
                {overallProgress}% Completado
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDetails(!showDetails)}
              >
                {showDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          
          {/* Progreso general */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Progreso General</span>
              <span className="text-sm text-gray-600">{overallProgress}%</span>
            </div>
            <Progress value={overallProgress} className="mb-2" />
            <div className="grid grid-cols-4 gap-4 text-center text-xs text-gray-600">
              <div>
                <div className="font-semibold">{objectives.filter(obj => obj.status === 'completed').length}</div>
                <div>Completados</div>
              </div>
              <div>
                <div className="font-semibold">{objectives.filter(obj => obj.status === 'in-progress').length}</div>
                <div>En Progreso</div>
              </div>
              <div>
                <div className="font-semibold">{achievements.length}</div>
                <div>Logros</div>
              </div>
              <div>
                <div className="font-semibold">{recommendations.length}</div>
                <div>Recomendaciones</div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Navegación de vistas */}
      <div className="flex items-center gap-2">
        {(['overview', 'objectives', 'achievements', 'recommendations'] as const).map((view) => (
          <Button
            key={view}
            variant={selectedView === view ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedView(view)}
          >
            {view === 'overview' && <BarChart3 className="h-4 w-4 mr-2" />}
            {view === 'objectives' && <Target className="h-4 w-4 mr-2" />}
            {view === 'achievements' && <Trophy className="h-4 w-4 mr-2" />}
            {view === 'recommendations' && <Brain className="h-4 w-4 mr-2" />}
            {view === 'overview' ? 'Resumen' :
             view === 'objectives' ? 'Objetivos' :
             view === 'achievements' ? 'Logros' : 'Recomendaciones'}
          </Button>
        ))}
      </div>

      {/* Vista de Resumen */}
      {selectedView === 'overview' && (
        <div className="space-y-6">
          {/* Métricas principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {metrics.map((metric, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{metric.category}</p>
                      <p className="text-2xl font-bold text-blue-600">{metric.value}</p>
                      <div className="flex items-center gap-1 mt-1">
                        {metric.trend === 'up' ? (
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        ) : metric.trend === 'down' ? (
                          <TrendingUp className="h-4 w-4 text-red-600 rotate-180" />
                        ) : (
                          <Activity className="h-4 w-4 text-gray-600" />
                        )}
                        <span className="text-sm text-gray-600">
                          {metric.trend === 'up' ? '+' : metric.trend === 'down' ? '-' : ''}{metric.change} {metric.unit}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">Meta: {metric.target}</div>
                      <Progress value={(metric.value / metric.target) * 100} className="mt-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Objetivos destacados */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Objetivos Destacados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {objectives.slice(0, 3).map((objective) => (
                  <div key={objective.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium">{objective.title}</h4>
                        <Badge 
                          variant="outline" 
                          className={`text-${getStatusColor(objective.status)}-600 border-${getStatusColor(objective.status)}-200`}
                        >
                          {objective.status === 'completed' ? 'Completado' :
                           objective.status === 'in-progress' ? 'En Progreso' :
                           objective.status === 'not-started' ? 'No Iniciado' : 'Atrasado'}
                        </Badge>
                        <Badge 
                          variant="outline" 
                          className={`text-${getDifficultyColor(objective.difficulty)}-600`}
                        >
                          Dificultad {objective.difficulty}/5
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{objective.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>Cultural: {objective.culturalRelevance}%</span>
                        <span>Accesibilidad: {objective.accessibilityScore}%</span>
                        <span>Categoría: {objective.category}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-blue-600">{objective.currentScore}/{objective.targetScore}</div>
                      <Progress value={(objective.currentScore / objective.targetScore) * 100} className="mt-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Vista de Objetivos */}
      {selectedView === 'objectives' && (
        <div className="space-y-6">
          {objectives.map((objective) => (
            <Card key={objective.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    {objective.title}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline" 
                      className={`text-${getStatusColor(objective.status)}-600 border-${getStatusColor(objective.status)}-200`}
                    >
                      {objective.status === 'completed' ? 'Completado' :
                       objective.status === 'in-progress' ? 'En Progreso' :
                       objective.status === 'not-started' ? 'No Iniciado' : 'Atrasado'}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleSection(objective.id)}
                    >
                      {expandedSections.includes(objective.id) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-gray-600">{objective.description}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded">
                      <div className="text-lg font-bold text-blue-600">{objective.currentScore}/{objective.targetScore}</div>
                      <div className="text-xs text-gray-600">Puntuación</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded">
                      <div className="text-lg font-bold text-green-600">{objective.culturalRelevance}%</div>
                      <div className="text-xs text-gray-600">Relevancia Cultural</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded">
                      <div className="text-lg font-bold text-purple-600">{objective.accessibilityScore}%</div>
                      <div className="text-xs text-gray-600">Accesibilidad</div>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded">
                      <div className="text-lg font-bold text-orange-600">{objective.difficulty}/5</div>
                      <div className="text-xs text-gray-600">Dificultad</div>
                    </div>
                  </div>

                  <Progress value={(objective.currentScore / objective.targetScore) * 100} />

                  {expandedSections.includes(objective.id) && (
                    <div className="pt-4 border-t space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Detalles</span>
                        {objective.status === 'in-progress' && (
                          <Button
                            size="sm"
                            onClick={() => handleObjectiveComplete(objective.id)}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Marcar Completado
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <strong>Categoría:</strong> {objective.category}
                        </div>
                        <div>
                          <strong>Fecha límite:</strong> {objective.deadline?.toLocaleDateString('es-ES')}
                        </div>
                        <div>
                          <strong>Progreso:</strong> {Math.round((objective.currentScore / objective.targetScore) * 100)}%
                        </div>
                        <div>
                          <strong>Estado:</strong> {objective.status}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Vista de Logros */}
      {selectedView === 'achievements' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {achievements.map((achievement) => (
              <Card key={achievement.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="text-4xl mb-3">{achievement.icon}</div>
                    <h3 className="font-semibold mb-2">{achievement.title}</h3>
                    <p className="text-sm text-gray-600 mb-3">{achievement.description}</p>
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <Badge 
                        variant="outline" 
                        className={`text-${getRarityColor(achievement.rarity)}-600 border-${getRarityColor(achievement.rarity)}-200`}
                      >
                        {achievement.rarity === 'common' ? 'Común' :
                         achievement.rarity === 'rare' ? 'Raro' :
                         achievement.rarity === 'epic' ? 'Épico' : 'Legendario'}
                      </Badge>
                      <Badge variant="secondary">+{achievement.points} pts</Badge>
                    </div>
                    <div className="text-xs text-gray-500">
                      Desbloqueado: {achievement.unlockedAt.toLocaleDateString('es-ES')}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Vista de Recomendaciones */}
      {selectedView === 'recommendations' && (
        <div className="space-y-6">
          {recommendations.map((recommendation) => (
            <Card key={recommendation.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{recommendation.title}</h3>
                      <Badge 
                        variant="outline" 
                        className={`text-${getPriorityColor(recommendation.priority)}-600 border-${getPriorityColor(recommendation.priority)}-200`}
                      >
                        {recommendation.priority === 'high' ? 'Alta' :
                         recommendation.priority === 'medium' ? 'Media' : 'Baja'}
                      </Badge>
                      <Badge variant="secondary">{recommendation.type}</Badge>
                    </div>
                    <p className="text-gray-600 mb-3">{recommendation.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>⏱️ {recommendation.estimatedTime} min</span>
                      {recommendation.culturalContext && (
                        <span>🌍 {recommendation.culturalContext}</span>
                      )}
                    </div>
                    {recommendation.accessibility && (
                      <div className="mt-2">
                        <span className="text-xs text-gray-500">Accesibilidad: </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {recommendation.accessibility.map((feature, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {feature === 'screenReader' ? 'Lector Pantalla' :
                               feature === 'highContrast' ? 'Alto Contraste' :
                               feature === 'audioDescription' ? 'Audio Descripción' :
                               feature === 'keyboardNavigation' ? 'Teclado' :
                               feature === 'subtitles' ? 'Subtítulos' : feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <Button>
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Empezar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
