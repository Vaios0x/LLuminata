import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Trophy, 
  Target, 
  TrendingUp, 
  Clock, 
  Star,
  Calendar,
  Award,
  Lightbulb,
  Users,
  BarChart3,
  Play,
  Pause,
  RotateCcw,
  Settings,
  Eye,
  Volume2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useScreenReader } from '@/components/accessibility/screen-reader';
import { useHighContrast } from '@/components/accessibility/high-contrast';

interface StudentProgress {
  id: string;
  name: string;
  currentLevel: number;
  totalLevels: number;
  completedLessons: number;
  totalLessons: number;
  weeklyGoal: number;
  weeklyProgress: number;
  streak: number;
  achievements: Achievement[];
  recentActivity: Activity[];
  specialNeeds: SpecialNeed[];
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
  pace: 'slow' | 'moderate' | 'fast';
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: Date;
  type: 'lesson' | 'streak' | 'milestone' | 'special';
}

interface Activity {
  id: string;
  type: 'lesson_completed' | 'achievement_earned' | 'goal_reached' | 'assessment_taken';
  title: string;
  description: string;
  timestamp: Date;
  value?: number;
}

interface SpecialNeed {
  id: string;
  type: string;
  severity: 'mild' | 'moderate' | 'severe';
  accommodations: string[];
}

interface AdaptiveDashboardProps {
  studentId: string;
  className?: string;
  showAccessibility?: boolean;
}

export const AdaptiveDashboard: React.FC<AdaptiveDashboardProps> = ({
  studentId,
  className,
  showAccessibility = true
}) => {
  const [studentData, setStudentData] = useState<StudentProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeView, setActiveView] = useState<'overview' | 'progress' | 'achievements' | 'activity'>('overview');
  const [autoRead, setAutoRead] = useState(false);
  
  const { speak, isEnabled: screenReaderEnabled } = useScreenReader();
  const { isEnabled: highContrastEnabled, getStyles } = useHighContrast();

  // Simular carga de datos del estudiante
  useEffect(() => {
    const loadStudentData = async () => {
      // En producción, esto vendría de la API
      const mockData: StudentProgress = {
        id: studentId,
        name: 'Juan López',
        currentLevel: 3,
        totalLevels: 10,
        completedLessons: 24,
        totalLessons: 50,
        weeklyGoal: 5,
        weeklyProgress: 3,
        streak: 7,
        achievements: [
          {
            id: '1',
            name: 'Primera Lección',
            description: 'Completaste tu primera lección',
            icon: '🎯',
            earnedAt: new Date('2025-01-15'),
            type: 'milestone'
          },
          {
            id: '2',
            name: 'Racha de 7 días',
            description: 'Has estudiado 7 días seguidos',
            icon: '🔥',
            earnedAt: new Date('2025-01-20'),
            type: 'streak'
          }
        ],
        recentActivity: [
          {
            id: '1',
            type: 'lesson_completed',
            title: 'Lección completada',
            description: 'Los Números en Maya',
            timestamp: new Date('2025-01-21T10:30:00'),
            value: 85
          },
          {
            id: '2',
            type: 'achievement_earned',
            title: 'Logro desbloqueado',
            description: 'Racha de 7 días',
            timestamp: new Date('2025-01-20T15:45:00')
          }
        ],
        specialNeeds: [
          {
            id: '1',
            type: 'Dyslexia',
            severity: 'moderate',
            accommodations: ['Audio support', 'Larger fonts', 'Extra time']
          }
        ],
        learningStyle: 'visual',
        pace: 'moderate'
      };

      setStudentData(mockData);
      setIsLoading(false);

      // Anunciar datos cargados si el lector de pantalla está activado
      if (screenReaderEnabled && autoRead) {
        speak(`Dashboard cargado para ${mockData.name}. Nivel actual: ${mockData.currentLevel} de ${mockData.totalLevels}. Progreso semanal: ${mockData.weeklyProgress} de ${mockData.weeklyGoal} lecciones.`);
      }
    };

    loadStudentData();
  }, [studentId, screenReaderEnabled, autoRead, speak]);

  if (isLoading) {
    return (
      <div className={cn("flex items-center justify-center p-8", className)}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  if (!studentData) {
    return (
      <div className={cn("text-center p-8", className)}>
        <p>No se pudieron cargar los datos del estudiante.</p>
      </div>
    );
  }

  const progressPercentage = (studentData.completedLessons / studentData.totalLessons) * 100;
  const weeklyProgressPercentage = (studentData.weeklyProgress / studentData.weeklyGoal) * 100;

  return (
    <div className={cn("space-y-6", className)} style={getStyles()}>
      {/* Header del Dashboard */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">¡Hola, {studentData.name}!</h1>
          <p className="text-muted-foreground">
            Nivel {studentData.currentLevel} • {studentData.completedLessons} de {studentData.totalLessons} lecciones completadas
          </p>
        </div>
        
        {showAccessibility && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAutoRead(!autoRead)}
              className={cn(autoRead && "bg-primary text-primary-foreground")}
              aria-label={autoRead ? "Desactivar lectura automática" : "Activar lectura automática"}
            >
              <Volume2 className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {/* Toggle high contrast */}}
              aria-label="Cambiar contraste"
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Navegación de vistas */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
        {[
          { id: 'overview', label: 'Resumen', icon: BarChart3 },
          { id: 'progress', label: 'Progreso', icon: TrendingUp },
          { id: 'achievements', label: 'Logros', icon: Trophy },
          { id: 'activity', label: 'Actividad', icon: Clock }
        ].map((view) => {
          const Icon = view.icon;
          return (
            <Button
              key={view.id}
              variant={activeView === view.id ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveView(view.id as any)}
              className="flex-1"
              aria-label={`Ver ${view.label}`}
            >
              <Icon className="h-4 w-4 mr-2" />
              {view.label}
            </Button>
          );
        })}
      </div>

      {/* Contenido de la vista activa */}
      <div className="space-y-6">
        {activeView === 'overview' && <OverviewView studentData={studentData} />}
        {activeView === 'progress' && <ProgressView studentData={studentData} />}
        {activeView === 'achievements' && <AchievementsView studentData={studentData} />}
        {activeView === 'activity' && <ActivityView studentData={studentData} />}
      </div>

      {/* Recomendaciones adaptativas */}
      <AdaptiveRecommendations studentData={studentData} />
    </div>
  );
};

// Vista de Resumen
const OverviewView: React.FC<{ studentData: StudentProgress }> = ({ studentData }) => {
  const progressPercentage = (studentData.completedLessons / studentData.totalLessons) * 100;
  const weeklyProgressPercentage = (studentData.weeklyProgress / studentData.weeklyGoal) * 100;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Progreso General */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Progreso General</CardTitle>
          <BookOpen className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{Math.round(progressPercentage)}%</div>
          <Progress value={progressPercentage} className="mt-2" />
          <p className="text-xs text-muted-foreground mt-2">
            {studentData.completedLessons} de {studentData.totalLessons} lecciones
          </p>
        </CardContent>
      </Card>

      {/* Meta Semanal */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Meta Semanal</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{studentData.weeklyProgress}/{studentData.weeklyGoal}</div>
          <Progress value={weeklyProgressPercentage} className="mt-2" />
          <p className="text-xs text-muted-foreground mt-2">
            {studentData.weeklyGoal - studentData.weeklyProgress} lecciones restantes
          </p>
        </CardContent>
      </Card>

      {/* Racha Actual */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Racha Actual</CardTitle>
          <Award className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{studentData.streak}</div>
          <p className="text-xs text-muted-foreground">días consecutivos</p>
          <div className="flex items-center mt-2">
            <Star className="h-3 w-3 text-yellow-500 fill-current" />
            <span className="text-xs ml-1">¡Excelente trabajo!</span>
          </div>
        </CardContent>
      </Card>

      {/* Nivel Actual */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Nivel Actual</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{studentData.currentLevel}</div>
          <p className="text-xs text-muted-foreground">de {studentData.totalLevels} niveles</p>
          <Badge variant="secondary" className="mt-2">
            {studentData.learningStyle} • {studentData.pace}
          </Badge>
        </CardContent>
      </Card>
    </div>
  );
};

// Vista de Progreso
const ProgressView: React.FC<{ studentData: StudentProgress }> = ({ studentData }) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Progreso Detallado</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Progreso por nivel */}
          <div>
            <h3 className="font-medium mb-2">Progreso por Nivel</h3>
            <div className="space-y-2">
              {Array.from({ length: studentData.totalLevels }, (_, i) => {
                const level = i + 1;
                const isCompleted = level < studentData.currentLevel;
                const isCurrent = level === studentData.currentLevel;
                const isLocked = level > studentData.currentLevel;
                
                return (
                  <div key={level} className="flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                      isCompleted && "bg-green-500 text-white",
                      isCurrent && "bg-blue-500 text-white",
                      isLocked && "bg-gray-300 text-gray-500"
                    )}>
                      {isCompleted ? '✓' : isCurrent ? '●' : level}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">Nivel {level}</div>
                      <div className="text-sm text-muted-foreground">
                        {isCompleted ? 'Completado' : isCurrent ? 'En progreso' : 'Bloqueado'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Estadísticas de aprendizaje */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{studentData.completedLessons}</div>
              <div className="text-sm text-muted-foreground">Lecciones completadas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{studentData.streak}</div>
              <div className="text-sm text-muted-foreground">Días de racha</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Vista de Logros
const AchievementsView: React.FC<{ studentData: StudentProgress }> = ({ studentData }) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Logros Desbloqueados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {studentData.achievements.map((achievement) => (
              <div key={achievement.id} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <div className="text-2xl">{achievement.icon}</div>
                <div>
                  <div className="font-medium">{achievement.name}</div>
                  <div className="text-sm text-muted-foreground">{achievement.description}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {achievement.earnedAt.toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Vista de Actividad
const ActivityView: React.FC<{ studentData: StudentProgress }> = ({ studentData }) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Actividad Reciente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {studentData.recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 p-3 border rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <div className="font-medium">{activity.title}</div>
                  <div className="text-sm text-muted-foreground">{activity.description}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {activity.timestamp.toLocaleString()}
                  </div>
                  {activity.value && (
                    <Badge variant="secondary" className="mt-1">
                      {activity.value}%
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Recomendaciones Adaptativas
const AdaptiveRecommendations: React.FC<{ studentData: StudentProgress }> = ({ studentData }) => {
  const recommendations = [
    {
      id: '1',
      title: 'Continuar con la racha',
      description: '¡Has mantenido una racha de 7 días! Intenta completar una lección hoy.',
      icon: '🔥',
      priority: 'high'
    },
    {
      id: '2',
      title: 'Meta semanal',
      description: `Te faltan ${studentData.weeklyGoal - studentData.weeklyProgress} lecciones para alcanzar tu meta semanal.`,
      icon: '🎯',
      priority: 'medium'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          Recomendaciones para ti
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recommendations.map((rec) => (
            <div key={rec.id} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
              <div className="text-xl">{rec.icon}</div>
              <div className="flex-1">
                <div className="font-medium">{rec.title}</div>
                <div className="text-sm text-muted-foreground">{rec.description}</div>
              </div>
              <Badge variant={rec.priority === 'high' ? 'destructive' : 'secondary'}>
                {rec.priority === 'high' ? 'Importante' : 'Sugerencia'}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
