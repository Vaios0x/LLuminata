'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  Play, 
  Pause, 
  Volume2, 
  Eye, 
  Hand, 
  Brain, 
  Heart,
  Star,
  Target,
  Award,
  Clock,
  CheckCircle,
  AlertCircle,
  Info,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Settings,
  VolumeX,
  Maximize2,
  Minimize2,
  RotateCcw,
  Zap,
  Sparkles,
  Users,
  Globe,
  Palette
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useScreenReader } from '@/components/accessibility/screen-reader';
import { useHighContrast } from '@/components/accessibility/high-contrast';

interface LessonStep {
  id: string;
  type: 'text' | 'video' | 'audio' | 'interactive' | 'quiz' | 'activity';
  title: string;
  content: string;
  media?: {
    url: string;
    type: 'video' | 'audio' | 'image';
    duration?: number;
    transcript?: string;
  };
  interactions?: {
    type: 'drag-drop' | 'click' | 'type' | 'select';
    options?: string[];
    correctAnswer?: string | string[];
    feedback?: {
      correct: string;
      incorrect: string;
    };
  };
  accessibility: {
    screenReader: boolean;
    highContrast: boolean;
    keyboardNavigation: boolean;
    audioDescription: boolean;
    subtitles: boolean;
  };
  culturalAdaptations: {
    language: string;
    examples: string[];
    context: string;
  };
  estimatedTime: number; // en minutos
}

interface InteractiveLessonProps {
  lessonId: string;
  onProgress?: (progress: number) => void;
  onComplete?: (score: number, timeSpent: number) => void;
  onStepChange?: (stepId: string) => void;
  className?: string;
}

export default function InteractiveLesson({
  lessonId,
  onProgress,
  onComplete,
  onStepChange,
  className = ''
}: InteractiveLessonProps) {
  const { user } = useAuth();
  const { speak, isEnabled: screenReaderEnabled } = useScreenReader();
  const { getStyles } = useHighContrast();

  const [lesson, setLesson] = useState<any>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [progress, setProgress] = useState(0);
  const [score, setScore] = useState(0);
  const [userAnswers, setUserAnswers] = useState<{ [key: string]: any }>({});
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [isCorrect, setIsCorrect] = useState(false);
  const [showAccessibilityPanel, setShowAccessibilityPanel] = useState(false);
  const [accessibilitySettings, setAccessibilitySettings] = useState({
    screenReader: true,
    highContrast: false,
    audioDescription: true,
    subtitles: true,
    fontSize: 'medium',
    playbackSpeed: 1
  });

  useEffect(() => {
    loadLesson();
  }, [lessonId]);

  useEffect(() => {
    if (lesson) {
      calculateProgress();
    }
  }, [currentStepIndex, userAnswers, lesson]);

  const loadLesson = async () => {
    setIsLoading(true);
    try {
      // En producción, esto vendría de la API
      const mockLesson = {
        id: lessonId,
        title: 'Matemáticas Mayas: Sistema Numérico',
        description: 'Aprende sobre el sistema numérico maya y su aplicación en la vida cotidiana',
        steps: [
          {
            id: 'step-1',
            type: 'text',
            title: 'Introducción al Sistema Maya',
            content: 'Los mayas desarrollaron un sistema numérico vigesimal (base 20) que era muy avanzado para su época. Este sistema incluía el concepto del cero, algo que no existía en Europa hasta mucho después.',
            media: {
              url: '/lessons/maya-numbers/intro.mp4',
              type: 'video',
              duration: 120,
              transcript: 'Los mayas desarrollaron un sistema numérico vigesimal...'
            },
            interactions: {
              type: 'select',
              options: ['Base 10', 'Base 20', 'Base 60', 'Base 12'],
              correctAnswer: 'Base 20',
              feedback: {
                correct: '¡Excelente! Los mayas usaban base 20.',
                incorrect: 'Incorrecto. Los mayas usaban base 20 (vigesimal).'
              }
            },
            accessibility: {
              screenReader: true,
              highContrast: true,
              keyboardNavigation: true,
              audioDescription: true,
              subtitles: true
            },
            culturalAdaptations: {
              language: 'español',
              examples: ['Conteo de días en el calendario maya', 'Medidas en el mercado local'],
              context: 'Este conocimiento era esencial para el comercio y la astronomía maya.'
            },
            estimatedTime: 5
          },
          {
            id: 'step-2',
            type: 'interactive',
            title: 'Símbolos Numéricos Mayas',
            content: 'Los mayas usaban tres símbolos principales: el punto (1), la barra (5) y el caracol (0). Con estos símbolos podían representar cualquier número.',
            interactions: {
              type: 'drag-drop',
              options: ['Punto = 1', 'Barra = 5', 'Caracol = 0'],
              correctAnswer: ['Punto = 1', 'Barra = 5', 'Caracol = 0'],
              feedback: {
                correct: '¡Perfecto! Has identificado correctamente todos los símbolos.',
                incorrect: 'Revisa los símbolos. El punto vale 1, la barra 5 y el caracol 0.'
              }
            },
            accessibility: {
              screenReader: true,
              highContrast: true,
              keyboardNavigation: true,
              audioDescription: true,
              subtitles: false
            },
            culturalAdaptations: {
              language: 'español',
              examples: ['Símbolos en estelas mayas', 'Numeración en códices'],
              context: 'Estos símbolos aparecen en monumentos y documentos antiguos.'
            },
            estimatedTime: 8
          },
          {
            id: 'step-3',
            type: 'quiz',
            title: 'Práctica de Conteo',
            content: 'Ahora practica contando usando el sistema maya. ¿Cuánto es 3 + 4 en símbolos mayas?',
            interactions: {
              type: 'select',
              options: ['3 puntos', '3 barras', '1 barra y 2 puntos', '2 barras'],
              correctAnswer: '1 barra y 2 puntos',
              feedback: {
                correct: '¡Correcto! 3 + 4 = 7, que se representa como 1 barra (5) + 2 puntos (2).',
                incorrect: 'Recuerda: 3 + 4 = 7. En maya: 1 barra (5) + 2 puntos (2).'
              }
            },
            accessibility: {
              screenReader: true,
              highContrast: true,
              keyboardNavigation: true,
              audioDescription: true,
              subtitles: true
            },
            culturalAdaptations: {
              language: 'español',
              examples: ['Conteo de frijoles', 'Medición de tiempo'],
              context: 'Este tipo de conteo se usaba en el comercio diario.'
            },
            estimatedTime: 6
          }
        ],
        totalSteps: 3,
        estimatedDuration: 19,
        difficulty: 2,
        culturalBackground: 'maya',
        learningObjectives: [
          'Comprender el sistema numérico maya',
          'Identificar símbolos numéricos',
          'Realizar operaciones básicas'
        ]
      };

      setLesson(mockLesson);
      setTotalTime(mockLesson.estimatedDuration * 60);
    } catch (error) {
      console.error('Error cargando lección:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateProgress = () => {
    if (!lesson) return;
    
    const completedSteps = Object.keys(userAnswers).length;
    const totalSteps = lesson.steps.length;
    const newProgress = Math.round((completedSteps / totalSteps) * 100);
    
    setProgress(newProgress);
    onProgress?.(newProgress);
  };

  const handleStepChange = (direction: 'next' | 'prev') => {
    if (direction === 'next' && currentStepIndex < lesson.steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
      onStepChange?.(lesson.steps[currentStepIndex + 1].id);
    } else if (direction === 'prev' && currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
      onStepChange?.(lesson.steps[currentStepIndex - 1].id);
    }
  };

  const handleInteraction = (answer: any) => {
    const currentStep = lesson.steps[currentStepIndex];
    const isAnswerCorrect = Array.isArray(currentStep.interactions.correctAnswer)
      ? JSON.stringify(answer.sort()) === JSON.stringify(currentStep.interactions.correctAnswer.sort())
      : answer === currentStep.interactions.correctAnswer;

    setUserAnswers(prev => ({
      ...prev,
      [currentStep.id]: answer
    }));

    setIsCorrect(isAnswerCorrect);
    setFeedbackMessage(isAnswerCorrect 
      ? currentStep.interactions.feedback.correct 
      : currentStep.interactions.feedback.incorrect
    );
    setShowFeedback(true);

    if (isAnswerCorrect) {
      setScore(prev => prev + 10);
    }

    if (screenReaderEnabled) {
      speak(feedbackMessage);
    }

    setTimeout(() => setShowFeedback(false), 3000);
  };

  const handleComplete = () => {
    const timeSpent = Math.round(currentTime / 60);
    const finalScore = Math.round((score / (lesson.steps.length * 10)) * 100);
    onComplete?.(finalScore, timeSpent);
  };

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  const handleAccessibilityToggle = (setting: string, value: any) => {
    setAccessibilitySettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const renderStepContent = (step: LessonStep) => {
    switch (step.type) {
      case 'text':
        return (
          <div className="prose max-w-none">
            <div className="text-lg leading-relaxed mb-6">
              {step.content}
            </div>
            {step.media && (
              <div className="mb-6">
                {step.media.type === 'video' && (
                  <div className="relative">
                    <video
                      controls
                      className="w-full rounded-lg"
                      style={accessibilitySettings.highContrast ? { filter: 'contrast(150%)' } : {}}
                    >
                      <source src={step.media.url} type="video/mp4" />
                      {accessibilitySettings.subtitles && (
                        <track
                          kind="subtitles"
                          srcLang="es"
                          label="Español"
                          src="/subtitles/lesson-subtitles.vtt"
                        />
                      )}
                    </video>
                    {accessibilitySettings.audioDescription && (
                      <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                        <Volume2 className="h-4 w-4 inline mr-1" />
                        Descripción de audio disponible
                      </div>
                    )}
                  </div>
                )}
                {step.media.type === 'audio' && (
                  <div className="mb-4">
                    <audio controls className="w-full">
                      <source src={step.media.url} type="audio/mpeg" />
                    </audio>
                    {step.media.transcript && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-sm text-blue-600">
                          Ver transcripción
                        </summary>
                        <div className="mt-2 p-3 bg-gray-50 rounded text-sm">
                          {step.media.transcript}
                        </div>
                      </details>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case 'interactive':
        return (
          <div className="space-y-4">
            <div className="text-lg leading-relaxed mb-6">
              {step.content}
            </div>
            {step.interactions && (
              <div className="p-6 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-4">Actividad Interactiva</h4>
                {step.interactions.type === 'drag-drop' && (
                  <div className="space-y-2">
                    {step.interactions.options?.map((option, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => handleInteraction(option)}
                      >
                        {option}
                      </Button>
                    ))}
                  </div>
                )}
                {step.interactions.type === 'select' && (
                  <div className="space-y-2">
                    {step.interactions.options?.map((option, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => handleInteraction(option)}
                      >
                        {option}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case 'quiz':
        return (
          <div className="space-y-4">
            <div className="text-lg leading-relaxed mb-6">
              {step.content}
            </div>
            {step.interactions && (
              <div className="p-6 bg-blue-50 rounded-lg">
                <h4 className="font-medium mb-4">Pregunta</h4>
                <div className="space-y-2">
                  {step.interactions.options?.map((option, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => handleInteraction(option)}
                    >
                      {option}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      default:
        return <div className="text-lg leading-relaxed">{step.content}</div>;
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <RefreshCw className="h-8 w-8 text-blue-600 mx-auto mb-4 animate-spin" />
        <p className="text-gray-600">Cargando lección...</p>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-4" />
        <p className="text-gray-600">No se pudo cargar la lección</p>
      </div>
    );
  }

  const currentStep = lesson.steps[currentStepIndex];

  return (
    <div className={`space-y-6 ${className}`} style={getStyles()}>
      {/* Header de la lección */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                {lesson.title}
              </CardTitle>
              <p className="text-gray-600 mt-1">{lesson.description}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-blue-600">
                Paso {currentStepIndex + 1} de {lesson.steps.length}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAccessibilityPanel(!showAccessibilityPanel)}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Barra de progreso */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Progreso</span>
              <span className="text-sm text-gray-600">{progress}%</span>
            </div>
            <Progress value={progress} className="mb-2" />
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>Puntuación: {score}</span>
              <span>Tiempo: {Math.round(currentTime / 60)}m</span>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Panel de accesibilidad */}
      {showAccessibilityPanel && (
        <Card>
          <CardContent className="p-4">
            <h4 className="font-medium mb-3">Configuración de Accesibilidad</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(accessibilitySettings).map(([setting, value]) => (
                <div key={setting} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={setting}
                    checked={typeof value === 'boolean' ? value : false}
                    onChange={(e) => handleAccessibilityToggle(setting, e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor={setting} className="text-sm">
                    {setting === 'screenReader' ? 'Lector Pantalla' :
                     setting === 'highContrast' ? 'Alto Contraste' :
                     setting === 'audioDescription' ? 'Audio Descripción' :
                     setting === 'subtitles' ? 'Subtítulos' : setting}
                  </label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contenido del paso actual */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {currentStep.type === 'text' && <BookOpen className="h-5 w-5" />}
            {currentStep.type === 'interactive' && <Hand className="h-5 w-5" />}
            {currentStep.type === 'quiz' && <Target className="h-5 w-5" />}
            {currentStep.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {renderStepContent(currentStep)}
        </CardContent>
      </Card>

      {/* Feedback */}
      {showFeedback && (
        <Card className={`border-2 ${isCorrect ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              {isCorrect ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600" />
              )}
              <span className="font-medium">{feedbackMessage}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Adaptaciones culturales */}
      {currentStep.culturalAdaptations && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Contexto Cultural
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-gray-700">{currentStep.culturalAdaptations.context}</p>
              <div>
                <h5 className="font-medium mb-2">Ejemplos:</h5>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                  {currentStep.culturalAdaptations.examples.map((example, index) => (
                    <li key={index}>{example}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navegación */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => handleStepChange('prev')}
          disabled={currentStepIndex === 0}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Anterior
        </Button>

        <div className="flex items-center gap-2">
          {currentStepIndex === lesson.steps.length - 1 ? (
            <Button onClick={handleComplete}>
              <Award className="h-4 w-4 mr-2" />
              Completar Lección
            </Button>
          ) : (
            <Button onClick={() => handleStepChange('next')}>
              Siguiente
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
