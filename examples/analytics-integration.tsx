/**
 * Ejemplo de Integración del Sistema de Analytics
 * 
 * Este archivo muestra cómo integrar el sistema de analytics
 * en componentes y páginas existentes de InclusiveAI Coach.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useAnalytics, usePageTracking, useErrorTracking, usePerformanceTracking } from '@/lib/hooks/use-analytics';
import { AdminDashboard } from '@/components/analytics/admin-dashboard';
import { ProgressReport } from '@/components/analytics/progress-report';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, 
  Award, 
  Clock, 
  Target, 
  TrendingUp, 
  Users, 
  Activity,
  BarChart3,
  PieChart,
  LineChart,
  Download,
  RefreshCw,
  Eye,
  Star,
  Trophy,
  Zap
} from 'lucide-react';

// Ejemplo 1: Componente con tracking automático
export const LessonComponent: React.FC<{ lessonId: string; userId: string }> = ({ lessonId, userId }) => {
  const { trackEvent, trackLearningEvent } = useAnalytics(userId);
  const [isCompleted, setIsCompleted] = useState(false);
  const [score, setScore] = useState(0);

  const handleLessonStart = async () => {
    await trackLearningEvent('lesson_start', {
      lessonId,
      difficulty: 2
    });
  };

  const handleLessonComplete = async () => {
    const finalScore = Math.floor(Math.random() * 40) + 60; // 60-100
    setScore(finalScore);
    setIsCompleted(true);

    await trackLearningEvent('lesson_complete', {
      lessonId,
      score: finalScore,
      timeSpent: 1200, // 20 minutos
      difficulty: 2
    });
  };

  const handleUserInteraction = async (action: string) => {
    await trackEvent(
      'user_interaction',
      'engagement',
      action,
      `lesson_${lessonId}`,
      1,
      { lessonId, action }
    );
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Lección de Ejemplo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Badge variant="secondary">Lección {lessonId}</Badge>
          <Badge variant={isCompleted ? "default" : "outline"}>
            {isCompleted ? "Completada" : "En Progreso"}
          </Badge>
        </div>

        {!isCompleted ? (
          <div className="space-y-4">
            <p>Contenido de la lección...</p>
            <div className="flex gap-2">
              <Button 
                onClick={() => {
                  handleLessonStart();
                  handleUserInteraction('start');
                }}
                className="flex-1"
              >
                Comenzar Lección
              </Button>
              <Button 
                onClick={() => handleUserInteraction('pause')}
                variant="outline"
              >
                Pausar
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center">
              <Trophy className="h-12 w-12 text-yellow-500 mx-auto mb-2" />
              <h3 className="text-lg font-semibold">¡Lección Completada!</h3>
              <p className="text-2xl font-bold text-green-600">{score}%</p>
            </div>
            <Progress value={score} className="w-full" />
            <Button 
              onClick={() => handleUserInteraction('review')}
              variant="outline"
              className="w-full"
            >
              Revisar Lección
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Ejemplo 2: Página con tracking automático
export const AnalyticsPage: React.FC<{ userId: string }> = ({ userId }) => {
  // Tracking automático de página, errores y performance
  usePageTracking(userId);
  useErrorTracking(userId);
  usePerformanceTracking(userId);

  const { trackEvent, getUserMetrics, generateProgressReport } = useAnalytics(userId);
  const [userMetrics, setUserMetrics] = useState<any>(null);
  const [progressReport, setProgressReport] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadUserData = async () => {
    setIsLoading(true);
    try {
      const [metrics, report] = await Promise.all([
        getUserMetrics(),
        generateProgressReport('weekly')
      ]);
      setUserMetrics(metrics);
      setProgressReport(report);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUserData();
  }, [userId]);

  const handleExportData = async () => {
    await trackEvent(
      'data_export',
      'user_action',
      'export',
      'analytics_data',
      1,
      { userId, timestamp: new Date().toISOString() }
    );
    
    // Simular exportación
    const data = { userMetrics, progressReport };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${userId}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <div className="flex gap-2">
          <Button 
            onClick={loadUserData}
            disabled={isLoading}
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          <Button onClick={handleExportData}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="progress">Progreso</TabsTrigger>
          <TabsTrigger value="admin">Administración</TabsTrigger>
          <TabsTrigger value="lesson">Lección Ejemplo</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <RefreshCw className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Sesiones</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{userMetrics?.totalSessions || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    +{userMetrics?.sessionsGrowth || 0}% desde la semana pasada
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Lecciones</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{userMetrics?.lessonsCompleted || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {userMetrics?.lessonsInProgress || 0} en progreso
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Puntuación</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{userMetrics?.averageScore || 0}%</div>
                  <p className="text-xs text-muted-foreground">
                    +{userMetrics?.scoreImprovement || 0}% mejora
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tiempo</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{userMetrics?.totalTimeSpent || 0}h</div>
                  <p className="text-xs text-muted-foreground">
                    {userMetrics?.averageSessionDuration || 0} min/sesión
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          <ProgressReport />
        </TabsContent>

        <TabsContent value="admin" className="space-y-6">
          <AdminDashboard />
        </TabsContent>

        <TabsContent value="lesson" className="space-y-6">
          <LessonComponent lessonId="example-001" userId={userId} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Ejemplo 3: Hook personalizado para tracking específico
export const useLessonAnalytics = (lessonId: string, userId: string) => {
  const { trackEvent, trackLearningEvent } = useAnalytics(userId);

  const trackLessonView = useCallback(async () => {
    await trackEvent(
      'lesson_view',
      'content',
      'view',
      lessonId,
      1,
      { lessonId, timestamp: new Date().toISOString() }
    );
  }, [trackEvent, lessonId]);

  const trackLessonInteraction = useCallback(async (action: string, data?: any) => {
    await trackEvent(
      'lesson_interaction',
      'engagement',
      action,
      lessonId,
      1,
      { lessonId, action, ...data }
    );
  }, [trackEvent, lessonId]);

  const trackLessonProgress = useCallback(async (progress: number) => {
    await trackLearningEvent('lesson_start', {
      lessonId,
      score: progress
    });
  }, [trackLearningEvent, lessonId]);

  return {
    trackLessonView,
    trackLessonInteraction,
    trackLessonProgress
  };
};

// Ejemplo 4: Componente con tracking específico
export const InteractiveLesson: React.FC<{ lessonId: string; userId: string }> = ({ lessonId, userId }) => {
  const { trackLessonView, trackLessonInteraction, trackLessonProgress } = useLessonAnalytics(lessonId, userId);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    trackLessonView();
  }, [trackLessonView]);

  const handleProgress = (newProgress: number) => {
    setProgress(newProgress);
    trackLessonProgress(newProgress);
  };

  const handleInteraction = (action: string) => {
    trackLessonInteraction(action, { progress });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Lección Interactiva</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progreso</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="w-full" />
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={() => {
              const newProgress = Math.min(progress + 25, 100);
              handleProgress(newProgress);
              handleInteraction('progress_increase');
            }}
            disabled={progress >= 100}
          >
            Avanzar
          </Button>
          <Button 
            onClick={() => handleInteraction('pause')}
            variant="outline"
          >
            Pausar
          </Button>
          <Button 
            onClick={() => handleInteraction('help')}
            variant="outline"
          >
            Ayuda
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Ejemplo 5: Configuración global de analytics
export const AnalyticsProvider: React.FC<{ children: React.ReactNode; userId?: string }> = ({ children, userId }) => {
  // Configuración global de tracking
  usePageTracking(userId);
  useErrorTracking(userId);
  usePerformanceTracking(userId);

  return <>{children}</>;
};

// Ejemplo de uso en _app.tsx o layout.tsx
/*
import { AnalyticsProvider } from '@/examples/analytics-integration';

export default function App({ Component, pageProps }) {
  const userId = getUserIdFromContext(); // Obtener de contexto/auth

  return (
    <AnalyticsProvider userId={userId}>
      <Component {...pageProps} />
    </AnalyticsProvider>
  );
}
*/

export default AnalyticsPage;
