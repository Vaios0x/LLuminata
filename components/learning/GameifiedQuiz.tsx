'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Target, 
  Award, 
  Star, 
  Trophy, 
  Zap, 
  Heart, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Info,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Settings,
  Volume2,
  Eye,
  Brain,
  Sparkles,
  Users,
  Globe,
  Palette,
  RotateCcw,
  Play,
  Pause,
  VolumeX,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useScreenReader } from '@/components/accessibility/screen-reader';
import { useHighContrast } from '@/components/accessibility/high-contrast';

interface QuizQuestion {
  id: string;
  type: 'multiple-choice' | 'true-false' | 'drag-drop' | 'fill-blank' | 'matching';
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  category: string;
  culturalContext?: {
    background: string;
    examples: string[];
    relevance: string;
  };
  accessibility: {
    screenReader: boolean;
    highContrast: boolean;
    audioQuestion: boolean;
    visualAids: boolean;
  };
  points: number;
  timeLimit?: number; // en segundos
}

interface GameElement {
  type: 'streak' | 'bonus' | 'powerup' | 'achievement';
  name: string;
  description: string;
  icon: string;
  effect: {
    points: number;
    timeBonus?: number;
    hint?: boolean;
  };
  condition: string;
}

interface GameifiedQuizProps {
  quizId: string;
  onComplete?: (score: number, timeSpent: number, achievements: string[]) => void;
  onProgress?: (progress: number) => void;
  className?: string;
}

export default function GameifiedQuiz({
  quizId,
  onComplete,
  onProgress,
  className = ''
}: GameifiedQuizProps) {
  const { user } = useAuth();
  const { speak, isEnabled: screenReaderEnabled } = useScreenReader();
  const { getStyles } = useHighContrast();

  const [quiz, setQuiz] = useState<any>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [userAnswers, setUserAnswers] = useState<{ [key: string]: any }>({});
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [progress, setProgress] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [isCorrect, setIsCorrect] = useState(false);
  const [achievements, setAchievements] = useState<string[]>([]);
  const [gameElements, setGameElements] = useState<GameElement[]>([]);
  const [showGamePanel, setShowGamePanel] = useState(false);
  const [accessibilitySettings, setAccessibilitySettings] = useState({
    screenReader: true,
    highContrast: false,
    audioQuestions: true,
    visualAids: true,
    fontSize: 'medium',
    playbackSpeed: 1
  });

  useEffect(() => {
    loadQuiz();
  }, [quizId]);

  useEffect(() => {
    if (quiz) {
      calculateProgress();
    }
  }, [currentQuestionIndex, userAnswers, quiz]);

  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeRemaining]);

  const loadQuiz = async () => {
    setIsLoading(true);
    try {
      // En producción, esto vendría de la API
      const mockQuiz = {
        id: quizId,
        title: 'Desafío Maya: Matemáticas y Cultura',
        description: 'Pon a prueba tus conocimientos sobre matemáticas mayas y cultura indígena',
        questions: [
          {
            id: 'q1',
            type: 'multiple-choice',
            question: '¿Qué base numérica usaban los mayas en su sistema matemático?',
            options: ['Base 10 (decimal)', 'Base 20 (vigesimal)', 'Base 60 (sexagesimal)', 'Base 12 (duodecimal)'],
            correctAnswer: 'Base 20 (vigesimal)',
            explanation: 'Los mayas desarrollaron un sistema vigesimal (base 20) que incluía el concepto del cero.',
            difficulty: 2,
            category: 'Matemáticas',
            culturalContext: {
              background: 'maya',
              examples: ['Calendario maya', 'Conteo de días'],
              relevance: 'Fundamental para la astronomía y el comercio maya'
            },
            accessibility: {
              screenReader: true,
              highContrast: true,
              audioQuestion: true,
              visualAids: true
            },
            points: 10,
            timeLimit: 30
          },
          {
            id: 'q2',
            type: 'true-false',
            question: 'Los mayas fueron los primeros en desarrollar el concepto del cero.',
            options: ['Verdadero', 'Falso'],
            correctAnswer: 'Verdadero',
            explanation: 'Los mayas desarrollaron el concepto del cero independientemente, antes que los europeos.',
            difficulty: 3,
            category: 'Historia',
            culturalContext: {
              background: 'maya',
              examples: ['Estelas mayas', 'Códices'],
              relevance: 'Demuestra el avance matemático de la civilización maya'
            },
            accessibility: {
              screenReader: true,
              highContrast: true,
              audioQuestion: true,
              visualAids: false
            },
            points: 15,
            timeLimit: 20
          },
          {
            id: 'q3',
            type: 'drag-drop',
            question: 'Ordena los símbolos mayas de menor a mayor valor:',
            options: ['Punto (1)', 'Barra (5)', 'Caracol (0)', 'Doble barra (10)'],
            correctAnswer: ['Caracol (0)', 'Punto (1)', 'Barra (5)', 'Doble barra (10)'],
            explanation: 'El caracol representa el cero, el punto vale 1, la barra 5, y la doble barra 10.',
            difficulty: 2,
            category: 'Matemáticas',
            culturalContext: {
              background: 'maya',
              examples: ['Numeración en estelas', 'Cálculos astronómicos'],
              relevance: 'Sistema de escritura numérica maya'
            },
            accessibility: {
              screenReader: true,
              highContrast: true,
              audioQuestion: true,
              visualAids: true
            },
            points: 20,
            timeLimit: 45
          },
          {
            id: 'q4',
            type: 'fill-blank',
            question: 'En el calendario maya, un _____ equivale a 20 días.',
            options: ['uinal', 'tun', 'katun', 'baktun'],
            correctAnswer: 'uinal',
            explanation: 'Un uinal es un período de 20 días en el calendario maya.',
            difficulty: 4,
            category: 'Astronomía',
            culturalContext: {
              background: 'maya',
              examples: ['Calendario Tzolkin', 'Predicciones astronómicas'],
              relevance: 'Sistema de medición del tiempo maya'
            },
            accessibility: {
              screenReader: true,
              highContrast: true,
              audioQuestion: true,
              visualAids: true
            },
            points: 25,
            timeLimit: 25
          }
        ],
        totalQuestions: 4,
        estimatedDuration: 120,
        difficulty: 3,
        culturalBackground: 'maya',
        gameElements: [
          {
            type: 'streak',
            name: 'Racha de Aciertos',
            description: 'Respuestas correctas consecutivas',
            icon: '🔥',
            effect: {
              points: 5,
              timeBonus: 5
            },
            condition: '3 respuestas correctas seguidas'
          },
          {
            type: 'bonus',
            name: 'Bonus Cultural',
            description: 'Respuesta correcta con contexto cultural',
            icon: '🌟',
            effect: {
              points: 10,
              hint: true
            },
            condition: 'Respuesta correcta en preguntas culturales'
          },
          {
            type: 'powerup',
            name: 'Poder de Tiempo',
            description: 'Tiempo extra para la siguiente pregunta',
            icon: '⚡',
            effect: {
              points: 0,
              timeBonus: 15
            },
            condition: 'Respuesta correcta en menos de 10 segundos'
          }
        ]
      };

      setQuiz(mockQuiz);
      setGameElements(mockQuiz.gameElements);
      setTotalTime(mockQuiz.estimatedDuration);
      setTimeRemaining(mockQuiz.questions[0].timeLimit || 30);
    } catch (error) {
      console.error('Error cargando quiz:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateProgress = () => {
    if (!quiz) return;
    
    const answeredQuestions = Object.keys(userAnswers).length;
    const totalQuestions = quiz.questions.length;
    const newProgress = Math.round((answeredQuestions / totalQuestions) * 100);
    
    setProgress(newProgress);
    onProgress?.(newProgress);
  };

  const handleAnswer = (answer: any) => {
    const currentQuestion = quiz.questions[currentQuestionIndex];
    const isAnswerCorrect = Array.isArray(currentQuestion.correctAnswer)
      ? JSON.stringify(answer.sort()) === JSON.stringify(currentQuestion.correctAnswer.sort())
      : answer === currentQuestion.correctAnswer;

    setUserAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: answer
    }));

    // Calcular puntuación
    let questionScore = currentQuestion.points;
    let timeBonus = 0;
    let streakBonus = 0;

    if (isAnswerCorrect) {
      // Bonus por tiempo
      if (timeRemaining > currentQuestion.timeLimit! * 0.7) {
        timeBonus = Math.round(currentQuestion.points * 0.2);
      }

      // Bonus por racha
      if (streak > 0) {
        streakBonus = Math.round(currentQuestion.points * (streak * 0.1));
      }

      setStreak(prev => prev + 1);
      setScore(prev => prev + questionScore + timeBonus + streakBonus);

      // Verificar logros
      checkAchievements();
    } else {
      setStreak(0);
    }

    setIsCorrect(isAnswerCorrect);
    setFeedbackMessage(isAnswerCorrect 
      ? `¡Correcto! +${questionScore} puntos${timeBonus > 0 ? ` +${timeBonus} bonus tiempo` : ''}${streakBonus > 0 ? ` +${streakBonus} bonus racha` : ''}`
      : `Incorrecto. ${currentQuestion.explanation}`
    );
    setShowFeedback(true);

    if (screenReaderEnabled) {
      speak(feedbackMessage);
    }

    setTimeout(() => {
      setShowFeedback(false);
      if (currentQuestionIndex < quiz.questions.length - 1) {
        nextQuestion();
      } else {
        handleComplete();
      }
    }, 3000);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      const nextQuestion = quiz.questions[currentQuestionIndex + 1];
      setTimeRemaining(nextQuestion.timeLimit || 30);
    }
  };

  const handleTimeUp = () => {
    const currentQuestion = quiz.questions[currentQuestionIndex];
    setStreak(0);
    setIsCorrect(false);
    setFeedbackMessage(`¡Se acabó el tiempo! ${currentQuestion.explanation}`);
    setShowFeedback(true);

    if (screenReaderEnabled) {
      speak('Se acabó el tiempo');
    }

    setTimeout(() => {
      setShowFeedback(false);
      if (currentQuestionIndex < quiz.questions.length - 1) {
        nextQuestion();
      } else {
        handleComplete();
      }
    }, 3000);
  };

  const checkAchievements = () => {
    const newAchievements: string[] = [];

    // Logro por racha
    if (streak === 3 && !achievements.includes('Racha de 3')) {
      newAchievements.push('Racha de 3');
    }
    if (streak === 5 && !achievements.includes('Racha de 5')) {
      newAchievements.push('Racha de 5');
    }

    // Logro por puntuación
    if (score >= 50 && !achievements.includes('Puntuación Alta')) {
      newAchievements.push('Puntuación Alta');
    }
    if (score >= 100 && !achievements.includes('Maestro Maya')) {
      newAchievements.push('Maestro Maya');
    }

    if (newAchievements.length > 0) {
      setAchievements(prev => [...prev, ...newAchievements]);
      if (screenReaderEnabled) {
        speak(`Logro desbloqueado: ${newAchievements.join(', ')}`);
      }
    }
  };

  const handleComplete = () => {
    const timeSpent = Math.round((totalTime - timeRemaining) / 60);
    const finalScore = Math.round((score / (quiz.questions.length * 25)) * 100);
    onComplete?.(finalScore, timeSpent, achievements);
  };

  const handleAccessibilityToggle = (setting: string, value: any) => {
    setAccessibilitySettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const renderQuestion = (question: QuizQuestion) => {
    switch (question.type) {
      case 'multiple-choice':
        return (
          <div className="space-y-3">
            {question.options?.map((option, index) => (
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
        );

      case 'true-false':
        return (
          <div className="grid grid-cols-2 gap-4">
            {question.options?.map((option, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-16 text-lg font-medium"
                onClick={() => handleAnswer(option)}
              >
                {option}
              </Button>
            ))}
          </div>
        );

      case 'drag-drop':
        return (
          <div className="space-y-3">
            <p className="text-sm text-gray-600 mb-4">Arrastra las opciones al orden correcto:</p>
            {question.options?.map((option, index) => (
              <Button
                key={index}
                variant="outline"
                className="w-full justify-start cursor-move"
                onClick={() => handleAnswer(option)}
              >
                {option}
              </Button>
            ))}
          </div>
        );

      case 'fill-blank':
        return (
          <div className="space-y-3">
            <p className="text-sm text-gray-600 mb-4">Selecciona la respuesta correcta:</p>
            {question.options?.map((option, index) => (
              <Button
                key={index}
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleAnswer(option)}
              >
                {option}
              </Button>
            ))}
          </div>
        );

      default:
        return <div>Tipo de pregunta no soportado</div>;
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <RefreshCw className="h-8 w-8 text-blue-600 mx-auto mb-4 animate-spin" />
        <p className="text-gray-600">Cargando quiz...</p>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-4" />
        <p className="text-gray-600">No se pudo cargar el quiz</p>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];

  return (
    <div className={`space-y-6 ${className}`} style={getStyles()}>
      {/* Header del quiz */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                {quiz.title}
              </CardTitle>
              <p className="text-gray-600 mt-1">{quiz.description}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-blue-600">
                Pregunta {currentQuestionIndex + 1} de {quiz.questions.length}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowGamePanel(!showGamePanel)}
              >
                <Trophy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Barra de progreso y estadísticas */}
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Progreso</span>
              <span className="text-sm text-gray-600">{progress}%</span>
            </div>
            <Progress value={progress} className="mb-2" />
            
            <div className="grid grid-cols-4 gap-4 text-center">
              <div className="p-2 bg-blue-50 rounded">
                <div className="text-lg font-bold text-blue-600">{score}</div>
                <div className="text-xs text-gray-600">Puntos</div>
              </div>
              <div className="p-2 bg-green-50 rounded">
                <div className="text-lg font-bold text-green-600">{streak}</div>
                <div className="text-xs text-gray-600">Racha</div>
              </div>
              <div className="p-2 bg-yellow-50 rounded">
                <div className="text-lg font-bold text-yellow-600">{timeRemaining}s</div>
                <div className="text-xs text-gray-600">Tiempo</div>
              </div>
              <div className="p-2 bg-purple-50 rounded">
                <div className="text-lg font-bold text-purple-600">{achievements.length}</div>
                <div className="text-xs text-gray-600">Logros</div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Panel de elementos del juego */}
      {showGamePanel && (
        <Card>
          <CardContent className="p-4">
            <h4 className="font-medium mb-3">Elementos del Juego</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {gameElements.map((element, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{element.icon}</span>
                    <span className="font-medium">{element.name}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{element.description}</p>
                  <div className="text-xs text-gray-500">
                    <div>+{element.effect.points} puntos</div>
                    {element.effect.timeBonus && <div>+{element.effect.timeBonus}s tiempo</div>}
                    {element.effect.hint && <div>Pista disponible</div>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pregunta actual */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Pregunta {currentQuestionIndex + 1}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-green-600">
                +{currentQuestion.points} pts
              </Badge>
              <Badge variant="outline" className="text-orange-600">
                Dificultad {currentQuestion.difficulty}/5
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Pregunta */}
            <div className="text-lg leading-relaxed">
              {currentQuestion.question}
            </div>

            {/* Opciones */}
            {renderQuestion(currentQuestion)}

            {/* Contexto cultural */}
            {currentQuestion.culturalContext && (
              <div className="p-4 bg-yellow-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="h-4 w-4 text-yellow-600" />
                  <span className="font-medium">Contexto Cultural</span>
                </div>
                <p className="text-sm text-gray-700 mb-2">{currentQuestion.culturalContext.relevance}</p>
                <div className="text-xs text-gray-600">
                  <strong>Ejemplos:</strong> {currentQuestion.culturalContext.examples.join(', ')}
                </div>
              </div>
            )}
          </div>
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

      {/* Logros desbloqueados */}
      {achievements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Logros Desbloqueados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {achievements.map((achievement, index) => (
                <Badge key={index} variant="default" className="bg-yellow-600">
                  <Star className="h-3 w-3 mr-1" />
                  {achievement}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
