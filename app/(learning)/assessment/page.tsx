'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Brain, 
  Target,
  Award,
  AlertCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Settings,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  BookOpen,
  Star,
  Heart,
  Zap,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useScreenReader } from '@/components/accessibility/screen-reader';
import { useHighContrast } from '@/components/accessibility/high-contrast';
import { aiModelManager } from '@/ml-models';

interface Question {
  id: string;
  type: 'multiple-choice' | 'true-false' | 'fill-blank' | 'matching' | 'essay';
  text: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation: string;
  difficulty: number;
  category: string;
  culturalContext?: string;
  accessibility: {
    hasAudio: boolean;
    hasVisualAids: boolean;
    supportsVoiceControl: boolean;
  };
}

interface Assessment {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  timeLimit: number;
  passingScore: number;
  adaptive: boolean;
  categories: string[];
  metadata: {
    difficulty: number;
    estimatedTime: number;
    totalQuestions: number;
  };
}

interface UserAnswer {
  questionId: string;
  answer: string | string[];
  timeSpent: number;
  isCorrect: boolean;
}

export default function AssessmentPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { speak, isEnabled: screenReaderEnabled } = useScreenReader();
  const { getStyles } = useHighContrast();

  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState({
    showTimer: true,
    showProgress: true,
    autoRead: false,
    highContrast: false,
    largeFont: false
  });

  useEffect(() => {
    loadAssessment();
  }, []);

  useEffect(() => {
    if (isStarted && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            completeAssessment();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isStarted, timeRemaining]);

  const loadAssessment = async () => {
    setIsLoading(true);
    try {
      // En producción, esto vendría de la API
      const mockAssessment: Assessment = {
        id: 'assessment-1',
        title: 'Evaluación de Matemáticas Básicas',
        description: 'Evalúa tu comprensión de conceptos matemáticos fundamentales',
        questions: [
          {
            id: 'q1',
            type: 'multiple-choice',
            text: '¿Cuál es el resultado de 15 + 27?',
            options: ['40', '42', '43', '41'],
            correctAnswer: '42',
            explanation: '15 + 27 = 42. Sumamos las unidades: 5 + 7 = 12, llevamos 1. Luego 1 + 1 + 2 = 4.',
            difficulty: 1,
            category: 'aritmética',
            accessibility: {
              hasAudio: true,
              hasVisualAids: true,
              supportsVoiceControl: true
            }
          },
          {
            id: 'q2',
            type: 'true-false',
            text: 'Un triángulo equilátero tiene todos sus lados iguales.',
            correctAnswer: 'true',
            explanation: 'Correcto. Un triángulo equilátero tiene todos sus lados y ángulos iguales.',
            difficulty: 2,
            category: 'geometría',
            accessibility: {
              hasAudio: true,
              hasVisualAids: false,
              supportsVoiceControl: true
            }
          },
          {
            id: 'q3',
            type: 'fill-blank',
            text: 'El área de un rectángulo se calcula multiplicando la ___ por la altura.',
            correctAnswer: 'base',
            explanation: 'El área de un rectángulo = base × altura',
            difficulty: 2,
            category: 'geometría',
            accessibility: {
              hasAudio: true,
              hasVisualAids: true,
              supportsVoiceControl: true
            }
          }
        ],
        timeLimit: 1800, // 30 minutos
        passingScore: 70,
        adaptive: true,
        categories: ['aritmética', 'geometría', 'álgebra'],
        metadata: {
          difficulty: 2,
          estimatedTime: 25,
          totalQuestions: 3
        }
      };

      setAssessment(mockAssessment);
      setTimeRemaining(mockAssessment.timeLimit);
    } catch (error) {
      console.error('Error cargando evaluación:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startAssessment = () => {
    setIsStarted(true);
    if (screenReaderEnabled) {
      speak('Evaluación iniciada. Buena suerte.');
    }
  };

  const handleAnswer = (answer: string | string[]) => {
    const currentQuestion = assessment!.questions[currentQuestionIndex];
    const isCorrect = Array.isArray(currentQuestion.correctAnswer)
      ? JSON.stringify(answer.sort()) === JSON.stringify(currentQuestion.correctAnswer.sort())
      : answer === currentQuestion.correctAnswer;

    const userAnswer: UserAnswer = {
      questionId: currentQuestion.id,
      answer,
      timeSpent: assessment!.timeLimit - timeRemaining,
      isCorrect
    };

    setUserAnswers(prev => [...prev, userAnswer]);

    if (screenReaderEnabled) {
      speak(isCorrect ? 'Respuesta correcta' : 'Respuesta incorrecta');
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < assessment!.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      completeAssessment();
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const completeAssessment = async () => {
    setIsCompleted(true);
    setIsStarted(false);

    try {
      // Analizar resultados con IA
      const analysis = await analyzeResultsWithAI();
      setAiAnalysis(analysis);

      if (screenReaderEnabled) {
        speak('Evaluación completada. Analizando resultados.');
      }
    } catch (error) {
      console.error('Error analizando resultados:', error);
    }
  };

  const analyzeResultsWithAI = async () => {
    const score = calculateScore();
    const timeSpent = assessment!.timeLimit - timeRemaining;
    
    return await aiModelManager.auxiliary.generateRecommendations({
      needs: ['matemáticas'],
      behavior: {
        score,
        timeSpent,
        accuracy: score / 100,
        completionRate: 1
      },
      progress: score / 100,
      preferences: ['visual', 'auditory'],
      culturalContext: user?.profile?.region || 'México',
      age: user?.profile?.age || 15,
      grade: 8
    });
  };

  const calculateScore = (): number => {
    if (userAnswers.length === 0) return 0;
    const correctAnswers = userAnswers.filter(answer => answer.isCorrect).length;
    return Math.round((correctAnswers / userAnswers.length) * 100);
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getCurrentQuestion = () => {
    return assessment?.questions[currentQuestionIndex];
  };

  const getProgressPercentage = () => {
    return ((currentQuestionIndex + 1) / assessment!.questions.length) * 100;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4" style={getStyles()}>
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-lg text-gray-600">Cargando evaluación...</p>
        </div>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4" style={getStyles()}>
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Evaluación no encontrada</h2>
          <p className="text-gray-600 mb-4">La evaluación que buscas no está disponible.</p>
          <Button onClick={() => router.push('/dashboard')}>
            Volver al Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (!isStarted && !isCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4" style={getStyles()}>
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="mb-4"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </div>

          <Card className="shadow-xl border-0">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
                {assessment.title}
              </CardTitle>
              <p className="text-lg text-gray-600">{assessment.description}</p>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Información de la evaluación */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-blue-900">Tiempo</h3>
                  <p className="text-blue-700">{formatTime(assessment.timeLimit)}</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <Target className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-green-900">Preguntas</h3>
                  <p className="text-green-700">{assessment.metadata.totalQuestions}</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <Award className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-purple-900">Puntaje Mínimo</h3>
                  <p className="text-purple-700">{assessment.passingScore}%</p>
                </div>
              </div>

              {/* Instrucciones */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-semibold text-yellow-900 mb-2">Instrucciones:</h3>
                <ul className="text-sm text-yellow-800 space-y-1">
                  <li>• Lee cada pregunta cuidadosamente antes de responder</li>
                  <li>• Puedes navegar entre preguntas usando los botones</li>
                  <li>• El tiempo se cuenta automáticamente</li>
                  <li>• Necesitas {assessment.passingScore}% para aprobar</li>
                  <li>• Puedes revisar tus respuestas antes de finalizar</li>
                </ul>
              </div>

              {/* Configuración */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-3">Configuración de Accesibilidad</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={preferences.showTimer}
                      onChange={(e) => setPreferences(prev => ({ ...prev, showTimer: e.target.checked }))}
                      className="rounded border-gray-300"
                    />
                    <span>Mostrar timer</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={preferences.autoRead}
                      onChange={(e) => setPreferences(prev => ({ ...prev, autoRead: e.target.checked }))}
                      className="rounded border-gray-300"
                    />
                    <span>Lectura automática</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={preferences.highContrast}
                      onChange={(e) => setPreferences(prev => ({ ...prev, highContrast: e.target.checked }))}
                      className="rounded border-gray-300"
                    />
                    <span>Alto contraste</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={preferences.largeFont}
                      onChange={(e) => setPreferences(prev => ({ ...prev, largeFont: e.target.checked }))}
                      className="rounded border-gray-300"
                    />
                    <span>Fuente grande</span>
                  </label>
                </div>
              </div>

              <div className="text-center">
                <Button
                  onClick={startAssessment}
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-4"
                >
                  <BookOpen className="h-5 w-5 mr-2" />
                  Comenzar Evaluación
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isCompleted && showResults) {
    const score = calculateScore();
    const passed = score >= assessment.passingScore;

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4" style={getStyles()}>
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-xl border-0">
            <CardHeader className="text-center">
              <div className="w-24 h-24 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                {passed ? (
                  <Award className="h-12 w-12 text-white" />
                ) : (
                  <AlertCircle className="h-12 w-12 text-white" />
                )}
              </div>
              <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
                {passed ? '¡Felicitaciones!' : 'Necesitas más práctica'}
              </CardTitle>
              <p className="text-lg text-gray-600">
                {passed 
                  ? 'Has completado la evaluación exitosamente' 
                  : 'Continúa estudiando para mejorar tus resultados'
                }
              </p>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Resultados principales */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-blue-900">Puntaje</h3>
                  <p className={`text-2xl font-bold ${passed ? 'text-green-600' : 'text-red-600'}`}>
                    {score}%
                  </p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <Clock className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-green-900">Tiempo</h3>
                  <p className="text-green-700">{formatTime(assessment.timeLimit - timeRemaining)}</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <BarChart3 className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-purple-900">Precisión</h3>
                  <p className="text-purple-700">
                    {userAnswers.filter(a => a.isCorrect).length}/{userAnswers.length}
                  </p>
                </div>
              </div>

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
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Recomendaciones Personalizadas:</h4>
                        <ul className="space-y-2">
                          {aiAnalysis.slice(0, 3).map((rec: any, index: number) => (
                            <li key={index} className="flex items-start gap-2 text-sm">
                              <Star className="h-3 w-3 text-yellow-500 mt-0.5 flex-shrink-0" />
                              <span>{rec.recommendation}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Acciones */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => router.push('/dashboard')}
                  variant="outline"
                  size="lg"
                >
                  Volver al Dashboard
                </Button>
                <Button
                  onClick={() => router.push('/lessons')}
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Continuar Aprendiendo
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Evaluación en progreso
  const currentQuestion = getCurrentQuestion();
  if (!currentQuestion) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4" style={getStyles()}>
      <div className="max-w-4xl mx-auto">
        {/* Header con progreso */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => setShowSettings(!showSettings)}
                aria-label="Configuración"
              >
                <Settings className="h-4 w-4" />
              </Button>
              {preferences.showTimer && (
                <div className="flex items-center gap-2 text-lg font-semibold">
                  <Clock className="h-5 w-5" />
                  {formatTime(timeRemaining)}
                </div>
              )}
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">
                Pregunta {currentQuestionIndex + 1} de {assessment.questions.length}
              </div>
              {preferences.showProgress && (
                <Progress value={getProgressPercentage()} className="w-32 mt-1" />
              )}
            </div>
          </div>
        </div>

        {/* Pregunta actual */}
        <Card className="shadow-xl border-0 mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">
                {currentQuestion.text}
              </CardTitle>
              <Badge variant="outline">
                {currentQuestion.category}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Opciones de respuesta */}
            {currentQuestion.type === 'multiple-choice' && currentQuestion.options && (
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => (
                  <label
                    key={index}
                    className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <input
                      type="radio"
                      name={`question-${currentQuestion.id}`}
                      value={option}
                      onChange={(e) => handleAnswer(e.target.value)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-lg">{option}</span>
                  </label>
                ))}
              </div>
            )}

            {currentQuestion.type === 'true-false' && (
              <div className="space-y-3">
                {['true', 'false'].map((option) => (
                  <label
                    key={option}
                    className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <input
                      type="radio"
                      name={`question-${currentQuestion.id}`}
                      value={option}
                      onChange={(e) => handleAnswer(e.target.value)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-lg capitalize">
                      {option === 'true' ? 'Verdadero' : 'Falso'}
                    </span>
                  </label>
                ))}
              </div>
            )}

            {currentQuestion.type === 'fill-blank' && (
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Escribe tu respuesta..."
                  onChange={(e) => handleAnswer(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                />
              </div>
            )}

            {/* Navegación */}
            <div className="flex items-center justify-between pt-6 border-t">
              <Button
                variant="outline"
                onClick={previousQuestion}
                disabled={currentQuestionIndex === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Anterior
              </Button>

              <div className="text-sm text-gray-600">
                {currentQuestionIndex + 1} de {assessment.questions.length}
              </div>

              {currentQuestionIndex === assessment.questions.length - 1 ? (
                <Button
                  onClick={completeAssessment}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Finalizar Evaluación
                  <Award className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={nextQuestion}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Siguiente
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Configuración flotante */}
        {showSettings && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center justify-between">
                  <span>Timer</span>
                  <Button
                    variant={preferences.showTimer ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPreferences(prev => ({ ...prev, showTimer: !prev.showTimer }))}
                  >
                    {preferences.showTimer ? 'ON' : 'OFF'}
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <span>Progreso</span>
                  <Button
                    variant={preferences.showProgress ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPreferences(prev => ({ ...prev, showProgress: !prev.showProgress }))}
                  >
                    {preferences.showProgress ? 'ON' : 'OFF'}
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <span>Lectura</span>
                  <Button
                    variant={preferences.autoRead ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPreferences(prev => ({ ...prev, autoRead: !prev.autoRead }))}
                  >
                    {preferences.autoRead ? 'ON' : 'OFF'}
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <span>Contraste</span>
                  <Button
                    variant={preferences.highContrast ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPreferences(prev => ({ ...prev, highContrast: !prev.highContrast }))}
                  >
                    {preferences.highContrast ? 'ON' : 'OFF'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
