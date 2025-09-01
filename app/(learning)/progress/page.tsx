'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  Clock, 
  Target, 
  Award, 
  BookOpen,
  Star,
  Calendar,
  BarChart3,
  Brain,
  Heart,
  Zap,
  Globe,
  Users,
  CheckCircle,
  AlertCircle,
  Loader2,
  ChevronRight,
  Settings,
  Download,
  Share2
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useScreenReader } from '@/components/accessibility/screen-reader';
import { useHighContrast } from '@/components/accessibility/high-contrast';

interface ProgressData {
  overall: {
    score: number;
    lessonsCompleted: number;
    totalLessons: number;
    timeSpent: number;
    streak: number;
  };
  subjects: {
    [key: string]: {
      score: number;
      lessonsCompleted: number;
      timeSpent: number;
      lastActivity: Date;
    };
  };
  weekly: {
    date: string;
    lessonsCompleted: number;
    timeSpent: number;
    score: number;
  }[];
  achievements: {
    id: string;
    title: string;
    description: string;
    icon: string;
    unlocked: boolean;
    unlockedAt?: Date;
  }[];
  recommendations: {
    type: string;
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
  }[];
}

export default function ProgressPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { speak, isEnabled: screenReaderEnabled } = useScreenReader();
  const { getStyles } = useHighContrast();

  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('week');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');

  useEffect(() => {
    loadProgressData();
  }, []);

  const loadProgressData = async () => {
    setIsLoading(true);
    try {
      // En producción, esto vendría de la API
      const mockData: ProgressData = {
        overall: {
          score: 85,
          lessonsCompleted: 24,
          totalLessons: 30,
          timeSpent: 7200, // 2 horas en segundos
          streak: 7
        },
        subjects: {
          'matemáticas': {
            score: 92,
            lessonsCompleted: 8,
            timeSpent: 2400,
            lastActivity: new Date('2024-01-15')
          },
          'ciencias': {
            score: 78,
            lessonsCompleted: 6,
            timeSpent: 1800,
            lastActivity: new Date('2024-01-14')
          },
          'historia': {
            score: 88,
            lessonsCompleted: 5,
            timeSpent: 1500,
            lastActivity: new Date('2024-01-13')
          },
          'literatura': {
            score: 82,
            lessonsCompleted: 5,
            timeSpent: 1500,
            lastActivity: new Date('2024-01-12')
          }
        },
        weekly: [
          { date: '2024-01-08', lessonsCompleted: 3, timeSpent: 900, score: 85 },
          { date: '2024-01-09', lessonsCompleted: 4, timeSpent: 1200, score: 88 },
          { date: '2024-01-10', lessonsCompleted: 2, timeSpent: 600, score: 82 },
          { date: '2024-01-11', lessonsCompleted: 5, timeSpent: 1500, score: 90 },
          { date: '2024-01-12', lessonsCompleted: 3, timeSpent: 900, score: 87 },
          { date: '2024-01-13', lessonsCompleted: 4, timeSpent: 1200, score: 89 },
          { date: '2024-01-14', lessonsCompleted: 3, timeSpent: 900, score: 85 }
        ],
        achievements: [
          {
            id: 'first-lesson',
            title: 'Primera Lección',
            description: 'Completaste tu primera lección',
            icon: '🎯',
            unlocked: true,
            unlockedAt: new Date('2024-01-08')
          },
          {
            id: 'week-streak',
            title: 'Racha Semanal',
            description: '7 días consecutivos de aprendizaje',
            icon: '🔥',
            unlocked: true,
            unlockedAt: new Date('2024-01-14')
          },
          {
            id: 'math-master',
            title: 'Maestro de Matemáticas',
            description: 'Completaste 10 lecciones de matemáticas',
            icon: '🧮',
            unlocked: false
          },
          {
            id: 'speed-learner',
            title: 'Aprendiz Rápido',
            description: 'Completaste 5 lecciones en un día',
            icon: '⚡',
            unlocked: false
          }
        ],
        recommendations: [
          {
            type: 'lesson',
            title: 'Practica Geometría',
            description: 'Basado en tu progreso, te recomendamos practicar conceptos de geometría',
            priority: 'high'
          },
          {
            type: 'assessment',
            title: 'Evaluación de Ciencias',
            description: 'Es momento de evaluar tu conocimiento en ciencias',
            priority: 'medium'
          },
          {
            type: 'review',
            title: 'Repasa Historia',
            description: 'Revisa los conceptos de historia para reforzar tu aprendizaje',
            priority: 'low'
          }
        ]
      };

      setProgressData(mockData);
    } catch (error) {
      console.error('Error cargando progreso:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'short' 
    });
  };

  const getSubjectColor = (subject: string): string => {
    const colors: { [key: string]: string } = {
      'matemáticas': 'blue',
      'ciencias': 'green',
      'historia': 'purple',
      'literatura': 'orange'
    };
    return colors[subject] || 'gray';
  };

  const getPriorityColor = (priority: string): string => {
    const colors: { [key: string]: string } = {
      'high': 'red',
      'medium': 'yellow',
      'low': 'green'
    };
    return colors[priority] || 'gray';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4" style={getStyles()}>
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-lg text-gray-600">Cargando tu progreso...</p>
        </div>
      </div>
    );
  }

  if (!progressData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4" style={getStyles()}>
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error cargando progreso</h2>
          <p className="text-gray-600 mb-4">No se pudo cargar tu información de progreso.</p>
          <Button onClick={() => router.push('/dashboard')}>
            Volver al Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4" style={getStyles()}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Mi Progreso</h1>
              <p className="text-gray-600">Seguimiento detallado de tu aprendizaje</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Compartir
              </Button>
            </div>
          </div>

          {/* Filtros */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Período:</span>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value as any)}
                className="border border-gray-300 rounded-lg px-3 py-1 text-sm"
              >
                <option value="week">Esta semana</option>
                <option value="month">Este mes</option>
                <option value="year">Este año</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Materia:</span>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-1 text-sm"
              >
                <option value="all">Todas las materias</option>
                {Object.keys(progressData.subjects).map(subject => (
                  <option key={subject} value={subject}>
                    {subject.charAt(0).toUpperCase() + subject.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Resumen General */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Puntaje General</p>
                  <p className="text-2xl font-bold text-blue-600">{progressData.overall.score}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
              <Progress value={progressData.overall.score} className="mt-4" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Lecciones Completadas</p>
                  <p className="text-2xl font-bold text-green-600">
                    {progressData.overall.lessonsCompleted}/{progressData.overall.totalLessons}
                  </p>
                </div>
                <BookOpen className="h-8 w-8 text-green-600" />
              </div>
              <Progress 
                value={(progressData.overall.lessonsCompleted / progressData.overall.totalLessons) * 100} 
                className="mt-4" 
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tiempo de Estudio</p>
                  <p className="text-2xl font-bold text-purple-600">{formatTime(progressData.overall.timeSpent)}</p>
                </div>
                <Clock className="h-8 w-8 text-purple-600" />
              </div>
              <p className="text-sm text-gray-500 mt-2">Promedio: {formatTime(progressData.overall.timeSpent / 7)}/día</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Racha Actual</p>
                  <p className="text-2xl font-bold text-orange-600">{progressData.overall.streak} días</p>
                </div>
                <Zap className="h-8 w-8 text-orange-600" />
              </div>
              <p className="text-sm text-gray-500 mt-2">¡Sigue así!</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Progreso por Materia */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Progreso por Materia
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(progressData.subjects).map(([subject, data]) => (
                    <div key={subject} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full bg-${getSubjectColor(subject)}-500`}></div>
                          <h3 className="font-semibold capitalize">{subject}</h3>
                        </div>
                        <Badge variant="outline">{data.score}%</Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Lecciones</p>
                          <p className="font-semibold">{data.lessonsCompleted}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Tiempo</p>
                          <p className="font-semibold">{formatTime(data.timeSpent)}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Última actividad</p>
                          <p className="font-semibold">{formatDate(data.lastActivity)}</p>
                        </div>
                      </div>
                      <Progress value={data.score} className="mt-3" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Logros */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Logros
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {progressData.achievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      className={`p-3 rounded-lg border ${
                        achievement.unlocked 
                          ? 'bg-green-50 border-green-200' 
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{achievement.icon}</span>
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{achievement.title}</h4>
                          <p className="text-xs text-gray-600">{achievement.description}</p>
                          {achievement.unlocked && achievement.unlockedAt && (
                            <p className="text-xs text-green-600 mt-1">
                              Desbloqueado {formatDate(achievement.unlockedAt)}
                            </p>
                          )}
                        </div>
                        {achievement.unlocked ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <div className="w-5 h-5 border-2 border-gray-300 rounded-full"></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recomendaciones */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Recomendaciones Personalizadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {progressData.recommendations.map((rec, index) => (
                  <div
                    key={index}
                    className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <Badge 
                        variant="outline" 
                        className={`text-${getPriorityColor(rec.priority)}-600 border-${getPriorityColor(rec.priority)}-200`}
                      >
                        {rec.priority === 'high' ? 'Alta' : rec.priority === 'medium' ? 'Media' : 'Baja'} prioridad
                      </Badge>
                    </div>
                    <h4 className="font-semibold mb-2">{rec.title}</h4>
                    <p className="text-sm text-gray-600 mb-3">{rec.description}</p>
                    <Button size="sm" className="w-full">
                      Ver más
                      <ChevronRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actividad Semanal */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Actividad Semanal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2">
                {progressData.weekly.map((day, index) => (
                  <div key={index} className="text-center">
                    <div className="text-xs text-gray-600 mb-1">
                      {new Date(day.date).toLocaleDateString('es-ES', { weekday: 'short' })}
                    </div>
                    <div className="w-full bg-gray-200 rounded-lg h-20 flex flex-col items-center justify-center">
                      <div className="text-sm font-semibold">{day.lessonsCompleted}</div>
                      <div className="text-xs text-gray-600">lecciones</div>
                      <div className="text-xs text-gray-500">{formatTime(day.timeSpent)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
