import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Eye, 
  EyeOff,
  ChevronLeft,
  ChevronRight,
  Settings,
  HelpCircle,
  CheckCircle,
  XCircle,
  Star,
  Clock,
  Target
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useScreenReader } from '@/components/accessibility/screen-reader';
import { useHighContrast } from '@/components/accessibility/high-contrast';

interface LessonSection {
  id: string;
  type: 'text' | 'image' | 'audio' | 'video' | 'interactive' | 'quiz';
  title: string;
  content: any;
  duration: number; // en segundos
  accessibility: {
    hasAudio: boolean;
    hasVisualAids: boolean;
    hasTextAlternative: boolean;
    supportsVoiceControl: boolean;
  };
}

interface InteractiveLessonProps {
  lessonId: string;
  studentId: string;
  onComplete: (score: number, timeSpent: number) => void;
  onProgress: (sectionId: string, completed: boolean) => void;
  className?: string;
}

export const InteractiveLesson: React.FC<InteractiveLessonProps> = ({
  lessonId,
  studentId,
  onComplete,
  onProgress,
  className
}) => {
  const [currentSection, setCurrentSection] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [completedSections, setCompletedSections] = useState<Set<string>>(new Set());
  const [showAccessibility, setShowAccessibility] = useState(false);
  const [autoRead, setAutoRead] = useState(false);
  const [currentScore, setCurrentScore] = useState(0);
  
  const { speak, isEnabled: screenReaderEnabled } = useScreenReader();
  const { isEnabled: highContrastEnabled, getStyles } = useHighContrast();
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Datos de ejemplo de la lección
  const [lessonData, setLessonData] = useState<{
    id: string;
    title: string;
    description: string;
    sections: LessonSection[];
    totalDuration: number;
    difficulty: 'easy' | 'medium' | 'hard';
    culturalContext: string;
    learningObjectives: string[];
  } | null>(null);

  // Cargar datos de la lección
  useEffect(() => {
    const loadLesson = async () => {
      // En producción, esto vendría de la API
      const mockLesson = {
        id: lessonId,
        title: 'Los Números en Maya',
        description: 'Aprende a contar del 1 al 10 en idioma maya',
        difficulty: 'medium' as const,
        culturalContext: 'maya',
        learningObjectives: [
          'Identificar números del 1 al 10 en maya',
          'Pronunciar correctamente los números',
          'Asociar números con objetos cotidianos'
        ],
        totalDuration: 900, // 15 minutos
        sections: [
          {
            id: 'intro',
            type: 'text' as const,
            title: 'Introducción',
            content: {
              text: 'Hoy aprenderemos a contar en maya. Los números mayas son muy importantes en nuestra cultura.',
              image: '/images/maya-numbers.jpg',
              audio: '/audio/intro-maya-numbers.mp3'
            },
            duration: 120,
            accessibility: {
              hasAudio: true,
              hasVisualAids: true,
              hasTextAlternative: true,
              supportsVoiceControl: true
            }
          },
          {
            id: 'numbers-1-5',
            type: 'interactive' as const,
            title: 'Números del 1 al 5',
            content: {
              numbers: [
                { maya: 'jun', spanish: 'uno', audio: '/audio/jun.mp3', image: '/images/1-maya.jpg' },
                { maya: 'ka\'', spanish: 'dos', audio: '/audio/ka.mp3', image: '/images/2-maya.jpg' },
                { maya: 'ox', spanish: 'tres', audio: '/audio/ox.mp3', image: '/images/3-maya.jpg' },
                { maya: 'kan', spanish: 'cuatro', audio: '/audio/kan.mp3', image: '/images/4-maya.jpg' },
                { maya: 'ho\'', spanish: 'cinco', audio: '/audio/ho.mp3', image: '/images/5-maya.jpg' }
              ]
            },
            duration: 300,
            accessibility: {
              hasAudio: true,
              hasVisualAids: true,
              hasTextAlternative: true,
              supportsVoiceControl: true
            }
          },
          {
            id: 'practice-1-5',
            type: 'quiz' as const,
            title: 'Práctica: Números del 1 al 5',
            content: {
              questions: [
                {
                  id: 'q1',
                  type: 'multiple-choice',
                  question: '¿Cómo se dice "tres" en maya?',
                  options: ['jun', 'ka\'', 'ox', 'kan'],
                  correct: 2,
                  audio: '/audio/question-1.mp3'
                },
                {
                  id: 'q2',
                  type: 'matching',
                  question: 'Relaciona el número maya con su significado',
                  pairs: [
                    { maya: 'jun', spanish: 'uno' },
                    { maya: 'ka\'', spanish: 'dos' },
                    { maya: 'ox', spanish: 'tres' }
                  ]
                }
              ]
            },
            duration: 240,
            accessibility: {
              hasAudio: true,
              hasVisualAids: true,
              hasTextAlternative: true,
              supportsVoiceControl: true
            }
          }
        ]
      };

      setLessonData(mockLesson);
    };

    loadLesson();
  }, [lessonId]);

  // Timer para el tiempo de estudio
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

  // Anunciar cambios de sección
  useEffect(() => {
    if (lessonData && screenReaderEnabled && autoRead) {
      const section = lessonData.sections[currentSection];
      speak(`Sección ${currentSection + 1} de ${lessonData.sections.length}: ${section.title}`);
    }
  }, [currentSection, lessonData, screenReaderEnabled, autoRead, speak]);

  if (!lessonData) {
    return (
      <div className={cn("flex items-center justify-center p-8", className)}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Cargando lección...</p>
        </div>
      </div>
    );
  }

  const currentSectionData = lessonData.sections[currentSection];
  const progressPercentage = (currentSection / lessonData.sections.length) * 100;
  const isLastSection = currentSection === lessonData.sections.length - 1;

  const handleNext = () => {
    if (currentSection < lessonData.sections.length - 1) {
      setCurrentSection(prev => prev + 1);
      onProgress(currentSectionData.id, true);
    } else {
      // Lección completada
      const finalScore = Math.round((completedSections.size / lessonData.sections.length) * 100);
      onComplete(finalScore, timeSpent);
    }
  };

  const handlePrevious = () => {
    if (currentSection > 0) {
      setCurrentSection(prev => prev - 1);
    }
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const resetLesson = () => {
    setCurrentSection(0);
    setTimeSpent(0);
    setCompletedSections(new Set());
    setCurrentScore(0);
    setIsPlaying(false);
  };

  return (
    <div className={cn("space-y-6", className)} style={getStyles()}>
      {/* Header de la lección */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">{lessonData.title}</CardTitle>
              <p className="text-muted-foreground">{lessonData.description}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAccessibility(!showAccessibility)}
                aria-label="Configuración de accesibilidad"
              >
                <Settings className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAutoRead(!autoRead)}
                className={cn(autoRead && "bg-primary text-primary-foreground")}
                aria-label={autoRead ? "Desactivar lectura automática" : "Activar lectura automática"}
              >
                {autoRead ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          
          {/* Barra de progreso */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progreso: {currentSection + 1} de {lessonData.sections.length}</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <Progress value={progressPercentage} />
          </div>

          {/* Controles de reproducción */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={togglePlay}
              aria-label={isPlaying ? "Pausar lección" : "Reproducir lección"}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={resetLesson}
              aria-label="Reiniciar lección"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-3 w-3" />
              {Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, '0')}
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Target className="h-3 w-3" />
              {currentScore}%
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Panel de accesibilidad */}
      {showAccessibility && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Volume2 className="h-4 w-4" />
                <span>Audio disponible</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                <span>Ayudas visuales</span>
              </div>
              <div className="flex items-center gap-2">
                <HelpCircle className="h-4 w-4" />
                <span>Texto alternativo</span>
              </div>
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span>Control por voz</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contenido de la sección actual */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Badge variant="secondary">{currentSectionData.type}</Badge>
            {currentSectionData.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LessonSectionContent 
            section={currentSectionData}
            onComplete={(score) => {
              setCurrentScore(prev => Math.max(prev, score));
              setCompletedSections(prev => new Set([...prev, currentSectionData.id]));
            }}
            autoRead={autoRead}
          />
        </CardContent>
      </Card>

      {/* Navegación */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentSection === 0}
          aria-label="Sección anterior"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Anterior
        </Button>

        <div className="flex items-center gap-2">
          {completedSections.has(currentSectionData.id) && (
            <CheckCircle className="h-5 w-5 text-green-500" />
          )}
          <span className="text-sm text-muted-foreground">
            Sección {currentSection + 1} de {lessonData.sections.length}
          </span>
        </div>

        <Button
          onClick={handleNext}
          disabled={!completedSections.has(currentSectionData.id) && currentSectionData.type === 'quiz'}
          aria-label={isLastSection ? "Completar lección" : "Siguiente sección"}
        >
          {isLastSection ? (
            <>
              Completar
              <Star className="h-4 w-4 ml-2" />
            </>
          ) : (
            <>
              Siguiente
              <ChevronRight className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

// Componente para renderizar el contenido de cada sección
interface LessonSectionContentProps {
  section: LessonSection;
  onComplete: (score: number) => void;
  autoRead: boolean;
}

const LessonSectionContent: React.FC<LessonSectionContentProps> = ({
  section,
  onComplete,
  autoRead
}) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [showResults, setShowResults] = useState(false);
  
  const { speak } = useScreenReader();

  useEffect(() => {
    if (autoRead && section.type === 'text') {
      speak(section.content.text);
    }
  }, [section, autoRead, speak]);

  switch (section.type) {
    case 'text':
      return (
        <div className="space-y-4">
          <div className="prose max-w-none">
            <p className="text-lg leading-relaxed">{section.content.text}</p>
          </div>
          {section.content.image && (
            <div className="text-center">
              <img 
                src={section.content.image} 
                alt="Ilustración de la lección"
                className="max-w-full h-auto rounded-lg"
              />
            </div>
          )}
          {section.content.audio && (
            <audio 
              controls 
              className="w-full"
              aria-label="Audio de la lección"
            >
              <source src={section.content.audio} type="audio/mpeg" />
              Tu navegador no soporta el elemento de audio.
            </audio>
          )}
        </div>
      );

    case 'interactive':
      return (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold">Practica los números</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {section.content.numbers.map((number: any, index: number) => (
              <Card key={index} className="p-4 text-center hover:shadow-md transition-shadow">
                <div className="text-3xl mb-2">{number.maya}</div>
                <div className="text-sm text-muted-foreground">{number.spanish}</div>
                {number.audio && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const audio = new Audio(number.audio);
                      audio.play();
                    }}
                    className="mt-2"
                    aria-label={`Escuchar ${number.maya}`}
                  >
                    <Volume2 className="h-4 w-4" />
                  </Button>
                )}
              </Card>
            ))}
          </div>
        </div>
      );

    case 'quiz':
      const questions = section.content.questions;
      const currentQ = questions[currentQuestion];

      if (showResults) {
        const correctAnswers = questions.filter((q: any, i: number) => {
          if (q.type === 'multiple-choice') {
            return answers[`q${i}`] === q.correct;
          }
          return true; // Para otros tipos de preguntas
        }).length;
        
        const score = Math.round((correctAnswers / questions.length) * 100);
        
        return (
          <div className="text-center space-y-4">
            <div className="text-4xl font-bold text-green-600">{score}%</div>
            <p className="text-lg">
              ¡Excelente trabajo! Has completado el quiz.
            </p>
            <Button onClick={() => onComplete(score)}>
              Continuar
            </Button>
          </div>
        );
      }

      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Pregunta {currentQuestion + 1} de {questions.length}
            </span>
            <Progress value={((currentQuestion + 1) / questions.length) * 100} className="w-32" />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{currentQ.question}</h3>
            
            {currentQ.type === 'multiple-choice' && (
              <div className="space-y-2">
                {currentQ.options.map((option: string, index: number) => (
                  <Button
                    key={index}
                    variant={answers[`q${currentQuestion}`] === index ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={() => setAnswers(prev => ({ ...prev, [`q${currentQuestion}`]: index }))}
                  >
                    {option}
                  </Button>
                ))}
              </div>
            )}

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                disabled={currentQuestion === 0}
              >
                Anterior
              </Button>
              
              {currentQuestion === questions.length - 1 ? (
                <Button onClick={() => setShowResults(true)}>
                  Ver resultados
                </Button>
              ) : (
                <Button
                  onClick={() => setCurrentQuestion(prev => prev + 1)}
                  disabled={answers[`q${currentQuestion}`] === undefined}
                >
                  Siguiente
                </Button>
              )}
            </div>
          </div>
        </div>
      );

    default:
      return <div>Contenido no soportado</div>;
  }
};
