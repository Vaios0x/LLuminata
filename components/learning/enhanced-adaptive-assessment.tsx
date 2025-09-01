import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  Target, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  XCircle,
  RotateCcw,
  Volume2,
  Eye,
  Settings,
  BarChart3,
  Star,
  Lightbulb,
  AlertCircle,
  Play,
  Pause,
  ChevronRight,
  BookOpen,
  Users,
  Award,
  Zap,
  Heart,
  Smile,
  Frown,
  Meh
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useScreenReader } from '@/components/accessibility/screen-reader';
import { useHighContrast } from '@/components/accessibility/high-contrast';
import { adaptiveAssessmentService, type AssessmentQuestion, type StudentResponse, type AssessmentResults } from '@/lib/adaptive-assessment-service';

interface EnhancedAdaptiveAssessmentProps {
  studentId: string;
  subject: string;
  onComplete: (results: AssessmentResults) => void;
  onProgress: (progress: number) => void;
  onDifficultyChange: (difficulty: 'easy' | 'medium' | 'hard') => void;
  onLearningInsights: (insights: any) => void;
  className?: string;
}

interface QuestionState {
  question: AssessmentQuestion;
  response?: StudentResponse;
  feedback?: any;
  timeSpent: number;
  attempts: number;
  hintsUsed: number;
  emotionalState?: 'frustrated' | 'confident' | 'confused' | 'engaged';
}

interface AssessmentState {
  assessmentId?: string;
  questions: QuestionState[];
  currentQuestionIndex: number;
  isStarted: boolean;
  isComplete: boolean;
  isPaused: boolean;
  totalTime: number;
  difficulty: 'easy' | 'medium' | 'hard';
  learningInsights: any[];
  recommendations: string[];
  studentProfile?: any;
  adaptiveSettings?: any;
}

export const EnhancedAdaptiveAssessment: React.FC<EnhancedAdaptiveAssessmentProps> = ({
  studentId,
  subject,
  onComplete,
  onProgress,
  onDifficultyChange,
  onLearningInsights,
  className
}) => {
  const [state, setState] = useState<AssessmentState>({
    questions: [],
    currentQuestionIndex: 0,
    isStarted: false,
    isComplete: false,
    isPaused: false,
    totalTime: 0,
    difficulty: 'medium',
    learningInsights: [],
    recommendations: []
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const [autoRead, setAutoRead] = useState(false);
  const [showAccessibility, setShowAccessibility] = useState(false);
  const [emotionalState, setEmotionalState] = useState<'frustrated' | 'confident' | 'confused' | 'engaged'>('engaged');
  
  const { speak, isEnabled: screenReaderEnabled } = useScreenReader();
  const { isHighContrast } = useHighContrast();
  const timerRef = useRef<NodeJS.Timeout>();
  const questionTimerRef = useRef<NodeJS.Timeout>();

  // Inicializar evaluación
  useEffect(() => {
    initializeAssessment();
  }, []);

  // Timer para tiempo total
  useEffect(() => {
    if (state.isStarted && !state.isPaused && !state.isComplete) {
      timerRef.current = setInterval(() => {
        setState(prev => ({ ...prev, totalTime: prev.totalTime + 1 }));
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [state.isStarted, state.isPaused, state.isComplete]);

  // Timer para pregunta actual
  useEffect(() => {
    if (state.isStarted && !state.isPaused && !state.isComplete) {
      questionTimerRef.current = setInterval(() => {
        setState(prev => {
          const newQuestions = [...prev.questions];
          if (newQuestions[prev.currentQuestionIndex]) {
            newQuestions[prev.currentQuestionIndex].timeSpent += 1;
          }
          return { ...prev, questions: newQuestions };
        });
      }, 1000);
    }

    return () => {
      if (questionTimerRef.current) clearInterval(questionTimerRef.current);
    };
  }, [state.isStarted, state.isPaused, state.isComplete, state.currentQuestionIndex]);

  const initializeAssessment = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/adaptive-assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          subject,
          assessmentType: 'diagnostic',
          difficulty: state.difficulty,
          adaptiveSettings: {
            difficultyAdjustment: true,
            culturalAdaptation: true,
            accessibilityFeatures: true,
            realTimeAnalysis: true,
            personalizedFeedback: true,
            learningPathOptimization: true
          }
        })
      });

      if (!response.ok) {
        throw new Error('Error inicializando evaluación');
      }

      const data = await response.json();
      
      setState(prev => ({
        ...prev,
        assessmentId: data.assessment.assessmentId,
        questions: data.assessment.questions.map((q: AssessmentQuestion) => ({
          question: q,
          timeSpent: 0,
          attempts: 0,
          hintsUsed: 0
        })),
        studentProfile: data.assessment.studentProfile,
        adaptiveSettings: data.assessment.adaptiveSettings
      }));

      if (screenReaderEnabled) {
        speak('Evaluación inicializada. Presiona comenzar para iniciar.');
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      if (screenReaderEnabled) {
        speak('Error al inicializar la evaluación');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const startAssessment = () => {
    setState(prev => ({ ...prev, isStarted: true }));
    if (screenReaderEnabled) {
      speak('Evaluación iniciada. Primera pregunta cargada.');
    }
  };

  const pauseAssessment = () => {
    setState(prev => ({ ...prev, isPaused: true }));
    if (screenReaderEnabled) {
      speak('Evaluación pausada');
    }
  };

  const resumeAssessment = () => {
    setState(prev => ({ ...prev, isPaused: false }));
    if (screenReaderEnabled) {
      speak('Evaluación reanudada');
    }
  };

  const handleAnswer = async (answer: any, confidence: number = 0.5) => {
    if (!state.assessmentId || state.isComplete) return;

    const currentQuestion = state.questions[state.currentQuestionIndex];
    if (!currentQuestion) return;

    // Actualizar estado de la pregunta actual
    const updatedQuestions = [...state.questions];
    updatedQuestions[state.currentQuestionIndex] = {
      ...currentQuestion,
      attempts: currentQuestion.attempts + 1,
      response: {
        questionId: currentQuestion.question.id,
        answer,
        timeSpent: currentQuestion.timeSpent,
        correct: false, // Se determinará en el servidor
        confidence,
        hintsUsed: currentQuestion.hintsUsed,
        attempts: currentQuestion.attempts + 1,
        emotionalState
      }
    };

    setState(prev => ({ ...prev, questions: updatedQuestions }));

    try {
      // Enviar respuesta al servidor
      const response = await fetch('/api/adaptive-assessment', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assessmentId: state.assessmentId,
          questionId: currentQuestion.question.id,
          answer,
          timeSpent: currentQuestion.timeSpent,
          confidence,
          hintsUsed: currentQuestion.hintsUsed,
          attempts: currentQuestion.attempts + 1,
          emotionalState
        })
      });

      if (!response.ok) {
        throw new Error('Error procesando respuesta');
      }

      const data = await response.json();

      // Actualizar con retroalimentación
      updatedQuestions[state.currentQuestionIndex].feedback = data.feedback;
      updatedQuestions[state.currentQuestionIndex].response!.correct = data.feedback.score > 0.7;

      // Actualizar insights y recomendaciones
      if (data.learningInsights) {
        setState(prev => ({
          ...prev,
          learningInsights: [...prev.learningInsights, data.learningInsights],
          recommendations: [...prev.recommendations, ...data.recommendations]
        }));
        onLearningInsights(data.learningInsights);
      }

      // Ajustar dificultad si es necesario
      if (data.difficultyAdjustment?.direction === 'increase' && state.difficulty !== 'hard') {
        const newDifficulty = state.difficulty === 'easy' ? 'medium' : 'hard';
        setState(prev => ({ ...prev, difficulty: newDifficulty }));
        onDifficultyChange(newDifficulty);
      } else if (data.difficultyAdjustment?.direction === 'decrease' && state.difficulty !== 'easy') {
        const newDifficulty = state.difficulty === 'hard' ? 'medium' : 'easy';
        setState(prev => ({ ...prev, difficulty: newDifficulty }));
        onDifficultyChange(newDifficulty);
      }

      // Generar siguiente pregunta si está disponible
      if (data.nextQuestion) {
        updatedQuestions.push({
          question: data.nextQuestion,
          timeSpent: 0,
          attempts: 0,
          hintsUsed: 0
        });
      }

      setState(prev => ({ ...prev, questions: updatedQuestions }));

      // Avanzar a la siguiente pregunta o completar
      if (state.currentQuestionIndex < updatedQuestions.length - 1) {
        setState(prev => ({ ...prev, currentQuestionIndex: prev.currentQuestionIndex + 1 }));
        onProgress(((state.currentQuestionIndex + 2) / updatedQuestions.length) * 100);
      } else {
        completeAssessment();
      }

      // Retroalimentación de audio
      if (screenReaderEnabled) {
        if (data.feedback.type === 'positive') {
          speak('¡Excelente! Respuesta correcta.');
        } else {
          speak('No te preocupes, los errores son parte del aprendizaje.');
        }
      }

    } catch (err) {
      console.error('Error procesando respuesta:', err);
      if (screenReaderEnabled) {
        speak('Error al procesar la respuesta');
      }
    }
  };

  const useHint = () => {
    const currentQuestion = state.questions[state.currentQuestionIndex];
    if (!currentQuestion) return;

    const updatedQuestions = [...state.questions];
    updatedQuestions[state.currentQuestionIndex] = {
      ...currentQuestion,
      hintsUsed: currentQuestion.hintsUsed + 1
    };

    setState(prev => ({ ...prev, questions: updatedQuestions }));

    if (screenReaderEnabled) {
      speak('Pista utilizada');
    }
  };

  const completeAssessment = async () => {
    if (!state.assessmentId) return;

    try {
      const response = await fetch('/api/adaptive-assessment', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assessmentId: state.assessmentId
        })
      });

      if (!response.ok) {
        throw new Error('Error completando evaluación');
      }

      const data = await response.json();
      
      setState(prev => ({ ...prev, isComplete: true }));
      setShowResults(true);
      
      onComplete(data.results);
      onProgress(100);

      if (screenReaderEnabled) {
        speak('Evaluación completada. Revisando resultados.');
      }

    } catch (err) {
      console.error('Error completando evaluación:', err);
      if (screenReaderEnabled) {
        speak('Error al completar la evaluación');
      }
    }
  };

  const getCurrentQuestion = () => {
    return state.questions[state.currentQuestionIndex]?.question;
  };

  const getProgressPercentage = () => {
    if (state.questions.length === 0) return 0;
    return ((state.currentQuestionIndex + 1) / state.questions.length) * 100;
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEmotionalIcon = (state: string) => {
    switch (state) {
      case 'confident': return <Smile className="w-5 h-5 text-green-600" />;
      case 'frustrated': return <Frown className="w-5 h-5 text-red-600" />;
      case 'confused': return <Meh className="w-5 h-5 text-yellow-600" />;
      default: return <Heart className="w-5 h-5 text-blue-600" />;
    }
  };

  if (isLoading) {
    return (
      <Card className={cn("w-full max-w-4xl mx-auto", className)}>
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-lg font-medium">Inicializando evaluación adaptativa...</p>
            <p className="text-sm text-gray-600 mt-2">Analizando tu perfil de aprendizaje</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={cn("w-full max-w-4xl mx-auto", className)}>
        <CardContent className="p-6">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-700 mb-2">Error</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={initializeAssessment} className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4" />
              Reintentar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (showResults) {
    return (
      <Card className={cn("w-full max-w-4xl mx-auto", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-6 h-6" />
            Resultados de la Evaluación
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="summary" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="summary">Resumen</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
              <TabsTrigger value="recommendations">Recomendaciones</TabsTrigger>
              <TabsTrigger value="details">Detalles</TabsTrigger>
            </TabsList>

            <TabsContent value="summary" className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {state.questions.filter(q => q.response?.correct).length}
                  </div>
                  <div className="text-sm text-gray-600">Correctas</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {Math.round((state.questions.filter(q => q.response?.correct).length / state.questions.length) * 100)}%
                  </div>
                  <div className="text-sm text-gray-600">Puntuación</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {formatTime(state.totalTime)}
                  </div>
                  <div className="text-sm text-gray-600">Tiempo Total</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {state.questions.length}
                  </div>
                  <div className="text-sm text-gray-600">Preguntas</div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="insights" className="space-y-4">
              <div className="space-y-3">
                {state.learningInsights.map((insight, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Lightbulb className="w-5 h-5 text-yellow-600" />
                      <span className="font-medium">Insight #{index + 1}</span>
                    </div>
                    <p className="text-gray-700">{insight.pattern}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Confianza: {Math.round(insight.confidence * 100)}%
                    </p>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="recommendations" className="space-y-4">
              <div className="space-y-3">
                {state.recommendations.map((recommendation, index) => (
                  <div key={index} className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <BookOpen className="w-5 h-5 text-blue-600" />
                      <span className="font-medium">Recomendación #{index + 1}</span>
                    </div>
                    <p className="text-gray-700">{recommendation}</p>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="details" className="space-y-4">
              <div className="space-y-3">
                {state.questions.map((questionState, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Pregunta {index + 1}</span>
                      <div className="flex items-center gap-2">
                        <Badge className={getDifficultyColor(questionState.question.difficulty)}>
                          {questionState.question.difficulty}
                        </Badge>
                        {questionState.response?.correct ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600" />
                        )}
                      </div>
                    </div>
                    <p className="text-gray-700 mb-2">{questionState.question.content.question}</p>
                    <div className="text-sm text-gray-500">
                      Tiempo: {formatTime(questionState.timeSpent)} | 
                      Intentos: {questionState.attempts} | 
                      Pistas: {questionState.hintsUsed}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    );
  }

  const currentQuestion = getCurrentQuestion();

  return (
    <Card className={cn("w-full max-w-4xl mx-auto", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-6 h-6" />
            Evaluación Adaptativa - {subject}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge className={getDifficultyColor(state.difficulty)}>
              {state.difficulty}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAccessibility(!showAccessibility)}
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {!state.isStarted ? (
          <div className="text-center py-8">
            <div className="mb-4">
              <Target className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Evaluación Adaptativa</h3>
              <p className="text-gray-600 mb-4">
                Esta evaluación se adaptará a tu nivel de conocimiento y estilo de aprendizaje.
              </p>
            </div>
            <Button onClick={startAssessment} size="lg" className="flex items-center gap-2">
              <Play className="w-5 h-5" />
              Comenzar Evaluación
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{formatTime(state.totalTime)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  <span>Pregunta {state.currentQuestionIndex + 1} de {state.questions.length}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {state.isPaused ? (
                  <Button onClick={resumeAssessment} size="sm">
                    <Play className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button onClick={pauseAssessment} size="sm" variant="outline">
                    <Pause className="w-4 h-4" />
                  </Button>
                )}
                <Button
                  onClick={() => setEmotionalState('confident')}
                  size="sm"
                  variant={emotionalState === 'confident' ? 'default' : 'outline'}
                >
                  <Smile className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() => setEmotionalState('confused')}
                  size="sm"
                  variant={emotionalState === 'confused' ? 'default' : 'outline'}
                >
                  <Meh className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() => setEmotionalState('frustrated')}
                  size="sm"
                  variant={emotionalState === 'frustrated' ? 'default' : 'outline'}
                >
                  <Frown className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <Progress value={getProgressPercentage()} className="mb-4" />
          </>
        )}
      </CardHeader>

      {state.isStarted && currentQuestion && (
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge className={getDifficultyColor(currentQuestion.difficulty)}>
                  {currentQuestion.difficulty}
                </Badge>
                <span className="text-sm text-gray-500">
                  Tiempo: {formatTime(state.questions[state.currentQuestionIndex]?.timeSpent || 0)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {getEmotionalIcon(emotionalState)}
                <span className="text-sm text-gray-500">
                  {emotionalState === 'confident' && 'Confiado'}
                  {emotionalState === 'confused' && 'Confundido'}
                  {emotionalState === 'frustrated' && 'Frustrado'}
                  {emotionalState === 'engaged' && 'Comprometido'}
                </span>
              </div>
            </div>

            <div className="p-6 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-medium mb-4">{currentQuestion.content.question}</h3>
              
              {currentQuestion.content.image && (
                <img 
                  src={currentQuestion.content.image} 
                  alt="Imagen de la pregunta"
                  className="w-full max-w-md mx-auto mb-4 rounded-lg"
                />
              )}

              {currentQuestion.type === 'multiple-choice' && currentQuestion.content.options && (
                <div className="space-y-3">
                  {currentQuestion.content.options.map((option: string, index: number) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="w-full justify-start text-left h-auto p-4"
                      onClick={() => handleAnswer(option)}
                    >
                      <span className="font-medium mr-2">{String.fromCharCode(65 + index)}.</span>
                      {option}
                    </Button>
                  ))}
                </div>
              )}

              {currentQuestion.type === 'true-false' && (
                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleAnswer(true)}
                  >
                    Verdadero
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleAnswer(false)}
                  >
                    Falso
                  </Button>
                </div>
              )}

              {currentQuestion.content.hints && currentQuestion.content.hints.length > 0 && (
                <div className="mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={useHint}
                    disabled={state.questions[state.currentQuestionIndex]?.hintsUsed >= currentQuestion.content.hints.length}
                  >
                    <Lightbulb className="w-4 h-4 mr-2" />
                    Usar Pista ({state.questions[state.currentQuestionIndex]?.hintsUsed || 0}/{currentQuestion.content.hints.length})
                  </Button>
                  {state.questions[state.currentQuestionIndex]?.hintsUsed > 0 && (
                    <div className="mt-2 p-3 bg-yellow-50 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        {currentQuestion.content.hints[state.questions[state.currentQuestionIndex]?.hintsUsed - 1]}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {state.questions[state.currentQuestionIndex]?.feedback && (
              <div className={cn(
                "p-4 rounded-lg",
                state.questions[state.currentQuestionIndex]?.feedback.type === 'positive' 
                  ? "bg-green-50 border border-green-200" 
                  : "bg-blue-50 border border-blue-200"
              )}>
                <div className="flex items-center gap-2 mb-2">
                  {state.questions[state.currentQuestionIndex]?.feedback.type === 'positive' ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <Lightbulb className="w-5 h-5 text-blue-600" />
                  )}
                  <span className="font-medium">
                    {state.questions[state.currentQuestionIndex]?.feedback.type === 'positive' ? '¡Correcto!' : 'Retroalimentación'}
                  </span>
                </div>
                <p className="text-gray-700">{state.questions[state.currentQuestionIndex]?.feedback.message}</p>
                {state.questions[state.currentQuestionIndex]?.feedback.suggestions && (
                  <div className="mt-2">
                    <p className="text-sm font-medium text-gray-600">Sugerencias:</p>
                    <ul className="text-sm text-gray-600 mt-1">
                      {state.questions[state.currentQuestionIndex]?.feedback.suggestions.map((suggestion: string, index: number) => (
                        <li key={index}>• {suggestion}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      )}

      {showAccessibility && (
        <CardContent className="border-t">
          <div className="space-y-4">
            <h4 className="font-medium">Configuración de Accesibilidad</h4>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={autoRead}
                  onChange={(e) => setAutoRead(e.target.checked)}
                />
                <span>Auto-lectura</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={screenReaderEnabled}
                  disabled
                />
                <span>Lector de pantalla</span>
              </label>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};
