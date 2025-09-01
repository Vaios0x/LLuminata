'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, 
  Target, 
  TrendingUp, 
  Award, 
  Clock, 
  CheckCircle,
  XCircle,
  AlertTriangle,
  Star,
  Calendar,
  Download,
  RefreshCw,
  User,
  BarChart3,
  LineChart,
  PieChart,
  ArrowUp,
  ArrowDown,
  Minus,
  Eye,
  Brain,
  Zap,
  Trophy,
  Medal,
  Crown,
  Bookmark,
  Flag,
  Timer,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  RotateCcw,
  Settings,
  Filter,
  Search,
  Info,
  HelpCircle,
  ChevronRight,
  ChevronLeft,
  Plus,
  Minus as MinusIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProgressReportProps {
  className?: string;
  studentId?: string;
  refreshInterval?: number;
  showDetailedMetrics?: boolean;
  showComparisons?: boolean;
  showRecommendations?: boolean;
}

interface ProgressData {
  student: {
    id: string;
    name: string;
    level: number;
    totalPoints: number;
    achievements: number;
    joinDate: string;
    lastActive: string;
    culturalContext: string;
    language: string;
  };
  overview: {
    lessonsCompleted: number;
    assessmentsTaken: number;
    assessmentsPassed: number;
    averageScore: number;
    totalTimeSpent: number;
    currentStreak: number;
    longestStreak: number;
    improvementRate: number;
  };
  progress: {
    bySubject: Array<{
      subject: string;
      lessonsCompleted: number;
      totalLessons: number;
      averageScore: number;
      timeSpent: number;
      improvement: number;
    }>;
    byPeriod: Array<{
      period: string;
      lessonsCompleted: number;
      assessmentsTaken: number;
      averageScore: number;
      timeSpent: number;
      points: number;
    }>;
    trends: Array<{
      date: string;
      score: number;
      timeSpent: number;
      lessonsCompleted: number;
    }>;
  };
  achievements: Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
    earnedDate: string;
    points: number;
    category: string;
  }>;
  assessments: Array<{
    id: string;
    title: string;
    subject: string;
    score: number;
    maxScore: number;
    date: string;
    timeSpent: number;
    status: 'passed' | 'failed' | 'in_progress';
    feedback: string;
  }>;
  recommendations: Array<{
    type: 'lesson' | 'assessment' | 'practice' | 'review';
    priority: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    reason: string;
    expectedImpact: number;
  }>;
  comparisons: {
    classAverage: number;
    regionalAverage: number;
    culturalAverage: number;
    percentile: number;
    ranking: number;
    totalStudents: number;
  };
  insights: {
    strengths: Array<{
      area: string;
      score: number;
      description: string;
    }>;
    weaknesses: Array<{
      area: string;
      score: number;
      description: string;
      suggestions: string[];
    }>;
    patterns: Array<{
      pattern: string;
      frequency: number;
      impact: number;
      recommendation: string;
    }>;
  };
}

export const ProgressReport: React.FC<ProgressReportProps> = ({
  className = '',
  studentId = 'default',
  refreshInterval = 300000,
  showDetailedMetrics = true,
  showComparisons = true,
  showRecommendations = true
}) => {
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [selectedView, setSelectedView] = useState<'overview' | 'progress' | 'achievements' | 'assessments' | 'comparisons' | 'insights'>('overview');

  // Cargar datos de progreso
  const loadProgressData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/analytics?action=progress_report&studentId=${studentId}&period=${selectedPeriod}`);
      if (!response.ok) {
        throw new Error('Error cargando reporte de progreso');
      }

      const result = await response.json();
      if (result.success) {
        setProgressData(result.data);
        setLastUpdated(new Date());
      } else {
        throw new Error(result.error || 'Error desconocido');
      }
    } catch (error) {
      console.error('Error cargando reporte de progreso:', error);
      setError(error instanceof Error ? error.message : 'Error desconocido');
      
      // Datos de prueba para desarrollo
      setProgressData(generateMockProgressData());
      setLastUpdated(new Date());
    } finally {
      setIsLoading(false);
    }
  }, [studentId, selectedPeriod]);

  // Generar datos de prueba
  const generateMockProgressData = (): ProgressData => {
    return {
      student: {
        id: studentId,
        name: 'María González',
        level: 8,
        totalPoints: 2847,
        achievements: 23,
        joinDate: '2024-01-15',
        lastActive: '2024-02-28',
        culturalContext: 'Maya',
        language: 'es-MX'
      },
      overview: {
        lessonsCompleted: 156,
        assessmentsTaken: 42,
        assessmentsPassed: 38,
        averageScore: 87.3,
        totalTimeSpent: 2847,
        currentStreak: 12,
        longestStreak: 28,
        improvementRate: 15.7
      },
      progress: {
        bySubject: [
          {
            subject: 'Matemáticas',
            lessonsCompleted: 45,
            totalLessons: 60,
            averageScore: 92.1,
            timeSpent: 890,
            improvement: 18.5
          },
          {
            subject: 'Lenguaje',
            lessonsCompleted: 38,
            totalLessons: 50,
            averageScore: 85.7,
            timeSpent: 720,
            improvement: 12.3
          },
          {
            subject: 'Ciencias',
            lessonsCompleted: 32,
            totalLessons: 45,
            averageScore: 88.9,
            timeSpent: 650,
            improvement: 14.2
          },
          {
            subject: 'Historia',
            lessonsCompleted: 28,
            totalLessons: 40,
            averageScore: 82.4,
            timeSpent: 480,
            improvement: 9.8
          }
        ],
        byPeriod: [
          {
            period: 'Enero 2024',
            lessonsCompleted: 45,
            assessmentsTaken: 12,
            averageScore: 84.2,
            timeSpent: 720,
            points: 450
          },
          {
            period: 'Febrero 2024',
            lessonsCompleted: 52,
            assessmentsTaken: 15,
            averageScore: 87.8,
            timeSpent: 890,
            points: 520
          }
        ],
        trends: [
          { date: '2024-01-01', score: 82, timeSpent: 45, lessonsCompleted: 2 },
          { date: '2024-01-15', score: 85, timeSpent: 52, lessonsCompleted: 3 },
          { date: '2024-02-01', score: 88, timeSpent: 48, lessonsCompleted: 2 },
          { date: '2024-02-15', score: 91, timeSpent: 55, lessonsCompleted: 3 }
        ]
      },
      achievements: [
        {
          id: '1',
          name: 'Matemático Maya',
          description: 'Completó 10 lecciones de matemáticas con numeración maya',
          icon: '🧮',
          earnedDate: '2024-02-15',
          points: 100,
          category: 'Matemáticas'
        },
        {
          id: '2',
          name: 'Lector Avanzado',
          description: 'Leyó 50 textos en maya yucateco',
          icon: '📚',
          earnedDate: '2024-02-10',
          points: 75,
          category: 'Lenguaje'
        },
        {
          id: '3',
          name: 'Racha de Éxito',
          description: 'Mantuvo una racha de 7 días consecutivos',
          icon: '🔥',
          earnedDate: '2024-02-08',
          points: 50,
          category: 'Consistencia'
        }
      ],
      assessments: [
        {
          id: '1',
          title: 'Evaluación de Matemáticas - Unidad 3',
          subject: 'Matemáticas',
          score: 92,
          maxScore: 100,
          date: '2024-02-25',
          timeSpent: 45,
          status: 'passed',
          feedback: 'Excelente comprensión de la numeración maya'
        },
        {
          id: '2',
          title: 'Evaluación de Lenguaje - Comprensión',
          subject: 'Lenguaje',
          score: 78,
          maxScore: 100,
          date: '2024-02-20',
          timeSpent: 35,
          status: 'passed',
          feedback: 'Necesita mejorar en comprensión de textos complejos'
        }
      ],
      recommendations: [
        {
          type: 'lesson',
          priority: 'high',
          title: 'Lección de Geometría Maya',
          description: 'Basada en tu progreso en matemáticas',
          reason: 'Tienes excelente base en numeración maya',
          expectedImpact: 0.25
        },
        {
          type: 'practice',
          priority: 'medium',
          title: 'Ejercicios de Comprensión Lectora',
          description: 'Para mejorar en lenguaje',
          reason: 'Área de oportunidad identificada',
          expectedImpact: 0.15
        }
      ],
      comparisons: {
        classAverage: 82.1,
        regionalAverage: 79.8,
        culturalAverage: 85.2,
        percentile: 87,
        ranking: 3,
        totalStudents: 25
      },
      insights: {
        strengths: [
          {
            area: 'Matemáticas',
            score: 92.1,
            description: 'Excelente comprensión de conceptos matemáticos'
          },
          {
            area: 'Consistencia',
            score: 95.0,
            description: 'Muy buena disciplina de estudio'
          }
        ],
        weaknesses: [
          {
            area: 'Comprensión Lectora',
            score: 78.0,
            description: 'Necesita mejorar en textos complejos',
            suggestions: [
              'Practicar lectura diaria',
              'Usar estrategias de comprensión',
              'Leer textos en maya yucateco'
            ]
          }
        ],
        patterns: [
          {
            pattern: 'Mejor rendimiento en las mañanas',
            frequency: 0.85,
            impact: 0.20,
            recommendation: 'Programar sesiones de estudio matutinas'
          }
        ]
      }
    };
  };

  // Cargar datos al montar
  useEffect(() => {
    loadProgressData();
  }, [loadProgressData]);

  // Auto-refresh
  useEffect(() => {
    const interval = setInterval(loadProgressData, refreshInterval);
    return () => clearInterval(interval);
  }, [loadProgressData, refreshInterval]);

  // Obtener icono de cambio
  const getChangeIcon = (change: number) => {
    if (change > 0) return <ArrowUp className="w-4 h-4 text-green-500" />;
    if (change < 0) return <ArrowDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-gray-500" />;
  };

  // Obtener color de estado
  const getStatusColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value >= thresholds.good) return 'text-green-600';
    if (value >= thresholds.warning) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Formatear tiempo
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  if (isLoading && !progressData) {
    return (
      <div className={cn("flex items-center justify-center p-8", className)}>
        <div className="flex items-center space-x-2">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Cargando reporte de progreso...</span>
        </div>
      </div>
    );
  }

  if (error && !progressData) {
    return (
      <div className={cn("flex items-center justify-center p-8", className)}>
        <div className="flex items-center space-x-2 text-red-600">
          <AlertTriangle className="w-5 h-5" />
          <span>Error: {error}</span>
        </div>
      </div>
    );
  }

  if (!progressData) return null;

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reporte de Progreso</h1>
          <p className="text-gray-600 mt-1">
            Progreso detallado de {progressData.student.name}
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
              <option value="all">Todo el tiempo</option>
            </select>
          </div>
          
          <Button
            onClick={loadProgressData}
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

      {/* Información del estudiante */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <User className="w-6 h-6" />
              <span>Información del Estudiante</span>
            </div>
            <Badge variant="outline">
              Nivel {progressData.student.level}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <span className="text-sm text-gray-600">Nombre:</span>
              <p className="font-medium">{progressData.student.name}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Puntos Totales:</span>
              <p className="font-medium">{progressData.student.totalPoints.toLocaleString()}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Logros:</span>
              <p className="font-medium">{progressData.student.achievements}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Contexto Cultural:</span>
              <p className="font-medium">{progressData.student.culturalContext}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Métricas de Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lecciones Completadas</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progressData.overview.lessonsCompleted}</div>
            <p className="text-xs text-muted-foreground">
              {progressData.overview.assessmentsPassed}/{progressData.overview.assessmentsTaken} evaluaciones aprobadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Promedio General</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progressData.overview.averageScore}%</div>
            <Progress value={progressData.overview.averageScore} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              Tasa de mejora: +{progressData.overview.improvementRate}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tiempo Total</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTime(progressData.overview.totalTimeSpent)}</div>
            <p className="text-xs text-muted-foreground">
              Racha actual: {progressData.overview.currentStreak} días
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ranking</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">#{progressData.comparisons.ranking}</div>
            <p className="text-xs text-muted-foreground">
              Percentil {progressData.comparisons.percentile} de {progressData.comparisons.totalStudents} estudiantes
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
          <TabsTrigger value="progress" tabIndex={0}>
            <TrendingUp className="w-4 h-4 mr-2" />
            Progreso
          </TabsTrigger>
          <TabsTrigger value="achievements" tabIndex={0}>
            <Award className="w-4 h-4 mr-2" />
            Logros
          </TabsTrigger>
          <TabsTrigger value="assessments" tabIndex={0}>
            <CheckCircle className="w-4 h-4 mr-2" />
            Evaluaciones
          </TabsTrigger>
          {showComparisons && (
            <TabsTrigger value="comparisons" tabIndex={0}>
              <BarChart3 className="w-4 h-4 mr-2" />
              Comparaciones
            </TabsTrigger>
          )}
          <TabsTrigger value="insights" tabIndex={0}>
            <Brain className="w-4 h-4 mr-2" />
            Insights
          </TabsTrigger>
        </TabsList>

        {/* Tab de Resumen */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Progreso por Materia */}
            <Card>
              <CardHeader>
                <CardTitle>Progreso por Materia</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {progressData.progress.bySubject.map((subject, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{subject.subject}</h4>
                        <Badge variant="outline">{subject.lessonsCompleted}/{subject.totalLessons}</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Promedio:</span>
                          <p className="font-medium">{subject.averageScore}%</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Mejora:</span>
                          <p className="font-medium text-green-600">+{subject.improvement}%</p>
                        </div>
                      </div>
                      <Progress value={(subject.lessonsCompleted / subject.totalLessons) * 100} className="mt-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Logros Recientes */}
            <Card>
              <CardHeader>
                <CardTitle>Logros Recientes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {progressData.achievements.slice(0, 3).map((achievement, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg">
                      <div className="text-2xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <h4 className="font-semibold">{achievement.name}</h4>
                        <p className="text-sm text-gray-600">{achievement.description}</p>
                        <p className="text-xs text-gray-500">{achievement.earnedDate}</p>
                      </div>
                      <Badge variant="outline">+{achievement.points}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab de Progreso */}
        <TabsContent value="progress" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Progreso Detallado por Materia */}
            <Card>
              <CardHeader>
                <CardTitle>Progreso Detallado por Materia</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {progressData.progress.bySubject.map((subject, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-3">{subject.subject}</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Lecciones:</span>
                          <p className="font-medium">{subject.lessonsCompleted}/{subject.totalLessons}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Promedio:</span>
                          <p className="font-medium">{subject.averageScore}%</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Tiempo:</span>
                          <p className="font-medium">{formatTime(subject.timeSpent)}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Mejora:</span>
                          <p className="font-medium text-green-600">+{subject.improvement}%</p>
                        </div>
                      </div>
                      <Progress value={(subject.lessonsCompleted / subject.totalLessons) * 100} className="mt-3" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Tendencias de Progreso */}
            <Card>
              <CardHeader>
                <CardTitle>Tendencias de Progreso</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {progressData.progress.trends.slice(-4).map((trend, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-semibold">{trend.date}</h4>
                        <p className="text-sm text-gray-600">{trend.lessonsCompleted} lecciones</p>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{trend.score}%</div>
                        <div className="text-sm text-gray-600">{formatTime(trend.timeSpent)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab de Logros */}
        <TabsContent value="achievements" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {progressData.achievements.map((achievement, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <span className="text-2xl">{achievement.icon}</span>
                    <span className="text-lg">{achievement.name}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3">{achievement.description}</p>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">{achievement.category}</Badge>
                    <div className="text-right">
                      <div className="font-semibold">+{achievement.points} pts</div>
                      <div className="text-xs text-gray-500">{achievement.earnedDate}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Tab de Evaluaciones */}
        <TabsContent value="assessments" className="space-y-6">
          <div className="space-y-4">
            {progressData.assessments.map((assessment, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{assessment.title}</span>
                    <Badge 
                      variant={assessment.status === 'passed' ? 'default' : assessment.status === 'failed' ? 'destructive' : 'secondary'}
                    >
                      {assessment.status === 'passed' ? 'Aprobado' : assessment.status === 'failed' ? 'Reprobado' : 'En Progreso'}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Materia:</span>
                      <p className="font-medium">{assessment.subject}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Puntuación:</span>
                      <p className="font-medium">{assessment.score}/{assessment.maxScore}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Tiempo:</span>
                      <p className="font-medium">{formatTime(assessment.timeSpent)}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Fecha:</span>
                      <p className="font-medium">{assessment.date}</p>
                    </div>
                  </div>
                  {assessment.feedback && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium">Feedback:</span>
                      <p className="text-sm text-gray-600 mt-1">{assessment.feedback}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Tab de Comparaciones */}
        {showComparisons && (
          <TabsContent value="comparisons" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Comparación con Promedios */}
              <Card>
                <CardHeader>
                  <CardTitle>Comparación con Promedios</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span>Promedio de Clase</span>
                      <div className="text-right">
                        <div className="font-semibold">{progressData.comparisons.classAverage}%</div>
                        <div className="text-sm text-gray-600">
                          {progressData.overview.averageScore > progressData.comparisons.classAverage ? '+' : ''}
                          {(progressData.overview.averageScore - progressData.comparisons.classAverage).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span>Promedio Regional</span>
                      <div className="text-right">
                        <div className="font-semibold">{progressData.comparisons.regionalAverage}%</div>
                        <div className="text-sm text-gray-600">
                          {progressData.overview.averageScore > progressData.comparisons.regionalAverage ? '+' : ''}
                          {(progressData.overview.averageScore - progressData.comparisons.regionalAverage).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span>Promedio Cultural</span>
                      <div className="text-right">
                        <div className="font-semibold">{progressData.comparisons.culturalAverage}%</div>
                        <div className="text-sm text-gray-600">
                          {progressData.overview.averageScore > progressData.comparisons.culturalAverage ? '+' : ''}
                          {(progressData.overview.averageScore - progressData.comparisons.culturalAverage).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Ranking y Percentil */}
              <Card>
                <CardHeader>
                  <CardTitle>Posición y Ranking</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center p-6 border rounded-lg">
                      <div className="text-4xl font-bold text-blue-600">#{progressData.comparisons.ranking}</div>
                      <p className="text-lg font-medium">Posición en Clase</p>
                      <p className="text-sm text-gray-600">de {progressData.comparisons.totalStudents} estudiantes</p>
                    </div>
                    <div className="text-center p-6 border rounded-lg">
                      <div className="text-4xl font-bold text-green-600">{progressData.comparisons.percentile}%</div>
                      <p className="text-lg font-medium">Percentil</p>
                      <p className="text-sm text-gray-600">Mejor que el {progressData.comparisons.percentile}% de estudiantes</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )}

        {/* Tab de Insights */}
        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Fortalezas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                  Fortalezas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {progressData.insights.strengths.map((strength, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-2">{strength.area}</h4>
                      <p className="text-sm text-gray-600 mb-2">{strength.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Puntuación:</span>
                        <span className="font-semibold text-green-600">{strength.score}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Áreas de Mejora */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2 text-yellow-600" />
                  Áreas de Mejora
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {progressData.insights.weaknesses.map((weakness, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-2">{weakness.area}</h4>
                      <p className="text-sm text-gray-600 mb-2">{weakness.description}</p>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm">Puntuación:</span>
                        <span className="font-semibold text-yellow-600">{weakness.score}%</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Sugerencias:</span>
                        <ul className="text-sm text-gray-600 mt-1">
                          {weakness.suggestions.map((suggestion, sIndex) => (
                            <li key={sIndex} className="flex items-center">
                              <ChevronRight className="w-3 h-3 mr-1" />
                              {suggestion}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recomendaciones */}
          {showRecommendations && (
            <Card>
              <CardHeader>
                <CardTitle>Recomendaciones Personalizadas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {progressData.recommendations.map((rec, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{rec.title}</h4>
                        <Badge 
                          variant={rec.priority === 'high' ? 'destructive' : rec.priority === 'medium' ? 'secondary' : 'outline'}
                          className="text-xs"
                        >
                          {rec.priority === 'high' ? 'Alta' : rec.priority === 'medium' ? 'Media' : 'Baja'}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{rec.description}</p>
                      <p className="text-xs text-gray-500 mb-2">Razón: {rec.reason}</p>
                      <div className="flex items-center justify-between text-xs">
                        <span>Impacto esperado: {rec.expectedImpact > 0 ? '+' : ''}{rec.expectedImpact}</span>
                        <span className="text-gray-500">{rec.type}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
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

export default ProgressReport;

