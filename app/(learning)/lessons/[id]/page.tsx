'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Eye, 
  EyeOff,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Settings,
  Globe,
  Users,
  Star,
  Clock,
  BookOpen,
  Image as ImageIcon,
  Video as VideoIcon,
  FileText,
  Download,
  WifiOff,
  CheckCircle,
  AlertCircle,
  Loader2,
  Target,
  Award,
  Brain,
  Heart
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useScreenReader } from '@/components/accessibility/screen-reader';
import { useHighContrast } from '@/components/accessibility/high-contrast';
import { aiModelManager } from '@/ml-models';

interface Lesson {
  id: string;
  title: string;
  description: string;
  content: {
    text: string;
    audio?: string;
    images?: string[];
    videos?: string[];
    interactive?: any;
  };
  adaptations: {
    examples: string[];
    context: string;
    values: string[];
    traditions: string[];
  };
  accessibility: {
    hasAudio: boolean;
    hasVisualAids: boolean;
    hasTextAlternative: boolean;
    supportsVoiceControl: boolean;
  };
  metadata: {
    duration: number;
    difficulty: number;
    ageRange: string;
    culturalRelevance: number;
    learningObjectives: string[];
    prerequisites: string[];
  };
  progress: {
    completed: boolean;
    timeSpent: number;
    score?: number;
    attempts: number;
  };
}

export default function LessonPage() {
  const params = useParams();
  const router = useRouter();
  const lessonId = params.id as string;
  
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSection, setCurrentSection] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showAudio, setShowAudio] = useState(true);
  const [showVisualAids, setShowVisualAids] = useState(true);
  const [autoRead, setAutoRead] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [userProgress, setUserProgress] = useState({
    completed: false,
    score: 0,
    attempts: 0
  });
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const { user } = useAuth();
  const { speak, isEnabled: screenReaderEnabled } = useScreenReader();
  const { getStyles } = useHighContrast();

  // Cargar lección
  useEffect(() => {
    loadLesson();
    checkOfflineStatus();
  }, [lessonId]);

  // Timer para tiempo de estudio
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setTimeSpent(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isPlaying]);

  // Análisis de IA cuando se carga la lección
  useEffect(() => {
    if (lesson && user) {
      analyzeLessonWithAI();
    }
  }, [lesson, user]);

  const loadLesson = async () => {
    setIsLoading(true);
    try {
      let lessonData: Lesson;

      if (isOffline) {
        // Cargar desde almacenamiento local
        lessonData = await loadLessonFromStorage(lessonId);
      } else {
        // Cargar desde API
        const response = await fetch(`/api/lessons/${lessonId}?userId=${user?.id}`);
        if (!response.ok) throw new Error('Error cargando lección');
        lessonData = await response.json();
      }

      setLesson(lessonData);
      
      // Anunciar lección cargada
      if (screenReaderEnabled) {
        speak(`Lección cargada: ${lessonData.title}`);
      }

    } catch (error) {
      console.error('Error cargando lección:', error);
      if (screenReaderEnabled) {
        speak('Error cargando lección');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loadLessonFromStorage = async (id: string): Promise<Lesson> => {
    // En producción, esto vendría de IndexedDB
    const stored = localStorage.getItem(`lesson-${id}`);
    if (!stored) throw new Error('Lección no encontrada en almacenamiento local');
    return JSON.parse(stored);
  };

  const checkOfflineStatus = () => {
    setIsOffline(!navigator.onLine);
  };

  const analyzeLessonWithAI = async () => {
    try {
      const analysis = await aiModelManager.processEducationalContent({
        text: lesson!.content.text,
        culturalContext: user?.profile?.region || 'México',
        targetLanguage: user?.preferences?.language || 'es-MX',
        difficulty: lesson!.metadata.difficulty.toString()
      });

      setAiAnalysis(analysis);
    } catch (error) {
      console.error('Error analizando lección con IA:', error);
    }
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
    
    if (lesson?.content.audio && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
    }
  };

  const resetLesson = () => {
    setCurrentSection(0);
    setTimeSpent(0);
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
  };

  const nextSection = () => {
    if (lesson && currentSection < getTotalSections() - 1) {
      setCurrentSection(prev => prev + 1);
    }
  };

  const previousSection = () => {
    if (currentSection > 0) {
      setCurrentSection(prev => prev - 1);
    }
  };

  const getTotalSections = (): number => {
    if (!lesson) return 0;
    let sections = 1; // Texto principal
    
    if (lesson.content.images && lesson.content.images.length > 0) sections++;
    if (lesson.content.videos && lesson.content.videos.length > 0) sections++;
    if (lesson.content.interactive) sections++;
    
    return sections;
  };

  const getCurrentSectionContent = () => {
    if (!lesson) return null;

    switch (currentSection) {
      case 0:
        return {
          type: 'text',
          title: 'Contenido Principal',
          content: lesson.content.text
        };
      case 1:
        if (lesson.content.images && lesson.content.images.length > 0) {
          return {
            type: 'images',
            title: 'Imágenes de Apoyo',
            content: lesson.content.images
          };
        }
        break;
      case 2:
        if (lesson.content.videos && lesson.content.videos.length > 0) {
          return {
            type: 'videos',
            title: 'Videos Educativos',
            content: lesson.content.videos
          };
        }
        break;
      case 3:
        if (lesson.content.interactive) {
          return {
            type: 'interactive',
            title: 'Actividad Interactiva',
            content: lesson.content.interactive
          };
        }
        break;
    }
    return null;
  };

  const completeLesson = async () => {
    try {
      const updatedProgress = {
        completed: true,
        score: Math.min(100, Math.floor((timeSpent / lesson!.metadata.duration) * 100)),
        attempts: userProgress.attempts + 1
      };

      setUserProgress(updatedProgress);

      // Guardar progreso
      await fetch(`/api/lessons/${lessonId}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProgress)
      });

      if (screenReaderEnabled) {
        speak('Lección completada exitosamente');
      }
    } catch (error) {
      console.error('Error completando lección:', error);
    }
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4" style={getStyles()}>
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-lg text-gray-600">Cargando lección...</p>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4" style={getStyles()}>
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Lección no encontrada</h2>
          <p className="text-gray-600 mb-4">La lección que buscas no está disponible.</p>
          <Button onClick={() => router.push('/dashboard')}>
            Volver al Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const currentSectionContent = getCurrentSectionContent();
  const progressPercentage = ((currentSection + 1) / getTotalSections()) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4" style={getStyles()}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>

          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{lesson.title}</h1>
                {isOffline && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <WifiOff className="h-3 w-3" />
                    Offline
                  </Badge>
                )}
                {userProgress.completed && (
                  <Badge variant="default" className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Completada
                  </Badge>
                )}
              </div>
              <p className="text-gray-600 text-lg">{lesson.description}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline">Nivel {lesson.metadata.difficulty}</Badge>
                <Badge variant="outline">{lesson.metadata.ageRange}</Badge>
                <Badge variant="secondary">
                  <Clock className="h-3 w-3 mr-1" />
                  {formatTime(lesson.metadata.duration)}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setShowSettings(!showSettings)}
                aria-label="Configuración de lección"
              >
                <Settings className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                onClick={() => setAutoRead(!autoRead)}
                className={autoRead ? "bg-blue-600 text-white" : ""}
                aria-label={autoRead ? "Desactivar lectura automática" : "Activar lectura automática"}
              >
                {autoRead ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Barra de progreso */}
          <div className="mt-6 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progreso: {currentSection + 1} de {getTotalSections()}</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-4 overflow-hidden">
              <div 
                className="h-full bg-primary transition-all" 
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Configuración */}
        {showSettings && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center justify-between">
                  <span>Audio</span>
                  <Button
                    variant={showAudio ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowAudio(!showAudio)}
                  >
                    {showAudio ? <Volume2 className="h-3 w-3" /> : <VolumeX className="h-3 w-3" />}
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <span>Ayudas visuales</span>
                  <Button
                    variant={showVisualAids ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowVisualAids(!showVisualAids)}
                  >
                    {showVisualAids ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <span>Alto contraste</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {/* Toggle high contrast */}}
                  >
                    <Eye className="h-3 w-3" />
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <span>Fuente grande</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {/* Toggle large font */}}
                  >
                    <FileText className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Contenido Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Controles de reproducción */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    onClick={togglePlay}
                    aria-label={isPlaying ? "Pausar lección" : "Reproducir lección"}
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={resetLesson}
                    aria-label="Reiniciar lección"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {formatTime(timeSpent)}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contenido actual */}
            {currentSectionContent && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {currentSectionContent.type === 'text' && <FileText className="h-5 w-5" />}
                    {currentSectionContent.type === 'images' && <ImageIcon className="h-5 w-5" />}
                    {currentSectionContent.type === 'videos' && <VideoIcon className="h-5 w-5" />}
                    {currentSectionContent.type === 'interactive' && <BookOpen className="h-5 w-5" />}
                    {currentSectionContent.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ContentRenderer 
                    section={currentSectionContent}
                    showAudio={showAudio}
                    showVisualAids={showVisualAids}
                    autoRead={autoRead}
                  />
                </CardContent>
              </Card>
            )}

            {/* Navegación */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={previousSection}
                disabled={currentSection === 0}
                aria-label="Sección anterior"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Anterior
              </Button>

              <div className="text-sm text-muted-foreground">
                Sección {currentSection + 1} de {getTotalSections()}
              </div>

              {currentSection >= getTotalSections() - 1 ? (
                <Button
                  onClick={completeLesson}
                  disabled={userProgress.completed}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {userProgress.completed ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Completada
                    </>
                  ) : (
                    <>
                      Completar Lección
                      <Award className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={nextSection}
                  aria-label="Siguiente sección"
                >
                  Siguiente
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Objetivos de aprendizaje */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Objetivos de Aprendizaje
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {lesson.metadata.learningObjectives.map((objective, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <Star className="h-3 w-3 text-yellow-500 mt-0.5 flex-shrink-0" />
                      <span>{objective}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Análisis de IA */}
            {aiAnalysis && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    Análisis de IA
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium">Dificultad:</span>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="h-2 flex-1 bg-secondary rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary transition-all" 
                            style={{ width: `${aiAnalysis.textAnalysis.difficulty * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {Math.round(aiAnalysis.textAnalysis.difficulty * 100)}%
                        </span>
                      </div>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Sentimiento:</span>
                      <Badge variant="outline" className="mt-1">
                        {aiAnalysis.sentiment.sentiment}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Temas:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {aiAnalysis.textAnalysis.topics.slice(0, 3).map((topic: string, index: number) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Adaptaciones culturales */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Adaptaciones Culturales
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Ejemplos Culturales</h4>
                    <ul className="space-y-1 text-sm">
                      {lesson.adaptations.examples.slice(0, 3).map((example, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <Heart className="h-3 w-3 text-red-500" />
                          {example}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <h4 className="text-sm font-medium mb-1">Contexto</h4>
                    <p className="text-xs text-muted-foreground">{lesson.adaptations.context}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Progreso del usuario */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Tu Progreso
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium">Tiempo dedicado:</span>
                    <p className="text-lg font-bold text-blue-600">{formatTime(timeSpent)}</p>
                  </div>
                  {userProgress.completed && (
                    <div>
                      <span className="text-sm font-medium">Puntuación:</span>
                      <p className="text-lg font-bold text-green-600">{userProgress.score}%</p>
                    </div>
                  )}
                  <div>
                    <span className="text-sm font-medium">Intentos:</span>
                    <p className="text-sm">{userProgress.attempts}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Audio oculto para reproducción */}
        {lesson.content.audio && (
          <audio
            ref={audioRef}
            src={lesson.content.audio}
            onEnded={() => setIsPlaying(false)}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            style={{ display: 'none' }}
          />
        )}
      </div>
    </div>
  );
}

// Componente para renderizar diferentes tipos de contenido
interface ContentRendererProps {
  section: {
    type: string;
    title: string;
    content: any;
  };
  showAudio: boolean;
  showVisualAids: boolean;
  autoRead: boolean;
}

const ContentRenderer: React.FC<ContentRendererProps> = ({
  section,
  showAudio,
  showVisualAids,
  autoRead
}) => {
  const { speak } = useScreenReader();

  useEffect(() => {
    if (autoRead && section.type === 'text') {
      speak(section.content);
    }
  }, [section, autoRead, speak]);

  switch (section.type) {
    case 'text':
      return (
        <div className="prose max-w-none">
          <p className="text-lg leading-relaxed">{section.content}</p>
        </div>
      );

    case 'images':
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {section.content.map((image: string, index: number) => (
            <div key={index} className="text-center">
              <img 
                src={image} 
                alt={`Imagen educativa ${index + 1}`}
                className="max-w-full h-auto rounded-lg shadow-md"
              />
            </div>
          ))}
        </div>
      );

    case 'videos':
      return (
        <div className="space-y-4">
          {section.content.map((video: string, index: number) => (
            <div key={index} className="text-center">
              <video 
                controls 
                className="max-w-full h-auto rounded-lg"
                aria-label={`Video educativo ${index + 1}`}
              >
                <source src={video} type="video/mp4" />
                Tu navegador no soporta el elemento de video.
              </video>
            </div>
          ))}
        </div>
      );

    case 'interactive':
      return (
        <div className="p-4 border rounded-lg bg-muted">
          <h4 className="font-medium mb-2">Actividad Interactiva</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Contenido interactivo disponible: {section.content.type}
          </p>
          <Button className="w-full">
            Iniciar actividad
          </Button>
        </div>
      );

    default:
      return <div>Tipo de contenido no soportado</div>;
  }
};
