import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
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
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useScreenReader } from '@/components/accessibility/screen-reader';
import { useHighContrast } from '@/components/accessibility/high-contrast';

interface AssessmentQuestion {
  id: string;
  type: 'multiple-choice' | 'true-false' | 'matching' | 'fill-blank' | 'drag-drop';
  difficulty: 'easy' | 'medium' | 'hard';
  content: {
    question: string;
    options?: string[];
    correctAnswer: any;
    explanation?: string;
    audio?: string;
    image?: string;
    culturalContext?: string;
  };
  metadata: {
    subject: string;
    skill: string;
    estimatedTime: number; // segundos
    accessibility: {
      hasAudio: boolean;
      hasVisualAids: boolean;
      supportsVoiceControl: boolean;
    };
  };
}

interface StudentResponse {
  questionId: string;
  answer: any;
  timeSpent: number;
  correct: boolean;
  confidence: number; // 1-5
}

interface AdaptiveAssessmentProps {
  studentId: string;
  subject: string;
  onComplete: (results: AssessmentResults) => void;
  onProgress: (progress: number) => void;
  className?: string;
}

interface AssessmentResults {
  totalQuestions: number;
  correctAnswers: number;
  score: number;
  timeSpent: number;
  difficultyProgression: string[];
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  learningPath: string[];
}

export const AdaptiveAssessment: React.FC<AdaptiveAssessmentProps> = ({
  studentId,
  subject,
  onComplete,
  onProgress,
  className
}) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [responses, setResponses] = useState<StudentResponse[]>([]);
  const [currentDifficulty, setCurrentDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [isLoading, setIsLoading] = useState(true);
  const [isComplete, setIsComplete] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [autoRead, setAutoRead] = useState(false);
  const [showAccessibility, setShowAccessibility] = useState(false);
  
  const { speak, isEnabled: screenReaderEnabled } = useScreenReader();
  const { isEnabled: highContrastEnabled, getStyles } = useHighContrast();

  // Generar preguntas adaptativas
  useEffect(() => {
    const generateAdaptiveQuestions = () => {
      const mockQuestions: AssessmentQuestion[] = [
        // Preguntas fáciles
        {
          id: 'q1',
          type: 'multiple-choice',
          difficulty: 'easy',
          content: {
            question: '¿Cuál es el número "uno" en maya?',
            options: ['jun', 'ka\'', 'ox', 'kan'],
            correctAnswer: 0,
            explanation: 'En maya, "jun" significa uno.',
            culturalContext: 'maya'
          },
          metadata: {
            subject: 'matemáticas',
            skill: 'números básicos',
            estimatedTime: 30,
            accessibility: {
              hasAudio: true,
              hasVisualAids: true,
              supportsVoiceControl: true
            }
          }
        },
        {
          id: 'q2',
          type: 'true-false',
          difficulty: 'easy',
          content: {
            question: 'Los números mayas se escriben de izquierda a derecha.',
            correctAnswer: false,
            explanation: 'Los números mayas se escriben de arriba hacia abajo.',
            culturalContext: 'maya'
          },
          metadata: {
            subject: 'matemáticas',
            skill: 'sistema numérico',
            estimatedTime: 20,
            accessibility: {
              hasAudio: true,
              hasVisualAids: false,
              supportsVoiceControl: true
            }
          }
        },
        // Preguntas medias
        {
          id: 'q3',
          type: 'matching',
          difficulty: 'medium',
          content: {
            question: 'Relaciona cada número maya con su significado:',
            correctAnswer: {
              'jun': 'uno',
              'ka\'': 'dos',
              'ox': 'tres',
              'kan': 'cuatro'
            },
            explanation: 'Estos son los primeros cuatro números en maya.',
            culturalContext: 'maya'
          },
          metadata: {
            subject: 'matemáticas',
            skill: 'comprensión numérica',
            estimatedTime: 45,
            accessibility: {
              hasAudio: true,
              hasVisualAids: true,
              supportsVoiceControl: true
            }
          }
        },
        // Preguntas difíciles
        {
          id: 'q4',
          type: 'fill-blank',
          difficulty: 'hard',
          content: {
            question: 'Completa la secuencia: jun, ka\', ox, kan, ___, ___, ___.',
            correctAnswer: ['ho\'', 'wak', 'wuk'],
            explanation: 'La secuencia continúa con cinco (ho\'), seis (wak), siete (wuk).',
            culturalContext: 'maya'
          },
          metadata: {
            subject: 'matemáticas',
            skill: 'secuencias numéricas',
            estimatedTime: 60,
            accessibility: {
              hasAudio: true,
              hasVisualAids: true,
              supportsVoiceControl: true
            }
          }
        }
      ];

      setQuestions(mockQuestions);
      setIsLoading(false);
    };

    generateAdaptiveQuestions();
  }, [subject]);

  // Timer para el tiempo de respuesta
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Anunciar pregunta actual
  useEffect(() => {
    if (questions.length > 0 && screenReaderEnabled && autoRead) {
      const question = questions[currentQuestion];
      speak(`Pregunta ${currentQuestion + 1} de ${questions.length}: ${question.content.question}`);
    }
  }, [currentQuestion, questions, screenReaderEnabled, autoRead, speak]);

  const handleAnswer = useCallback((answer: any, confidence: number = 3) => {
    const question = questions[currentQuestion];
    const isCorrect = checkAnswer(question, answer);
    const response: StudentResponse = {
      questionId: question.id,
      answer,
      timeSpent: 0, // Se calculará después
      correct: isCorrect,
      confidence
    };

    setResponses(prev => [...prev, response]);

    // Adaptar dificultad basado en la respuesta
    adaptDifficulty(isCorrect, confidence);

    // Anunciar resultado si está habilitado
    if (screenReaderEnabled && autoRead) {
      speak(isCorrect ? 'Correcto' : 'Incorrecto');
    }

    // Avanzar a la siguiente pregunta o completar
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      onProgress(((currentQuestion + 1) / questions.length) * 100);
    } else {
      completeAssessment();
    }
  }, [currentQuestion, questions, screenReaderEnabled, autoRead, speak, onProgress]);

  const adaptDifficulty = (isCorrect: boolean, confidence: number) => {
    // Algoritmo simple de adaptación
    if (isCorrect && confidence >= 4) {
      // Respuesta correcta con alta confianza -> aumentar dificultad
      if (currentDifficulty === 'easy') setCurrentDifficulty('medium');
      else if (currentDifficulty === 'medium') setCurrentDifficulty('hard');
    } else if (!isCorrect && confidence <= 2) {
      // Respuesta incorrecta con baja confianza -> disminuir dificultad
      if (currentDifficulty === 'hard') setCurrentDifficulty('medium');
      else if (currentDifficulty === 'medium') setCurrentDifficulty('easy');
    }
  };

  const checkAnswer = (question: AssessmentQuestion, answer: any): boolean => {
    switch (question.type) {
      case 'multiple-choice':
        return answer === question.content.correctAnswer;
      case 'true-false':
        return answer === question.content.correctAnswer;
      case 'matching':
        return JSON.stringify(answer) === JSON.stringify(question.content.correctAnswer);
      case 'fill-blank':
        return JSON.stringify(answer) === JSON.stringify(question.content.correctAnswer);
      default:
        return false;
    }
  };

  const completeAssessment = () => {
    const correctAnswers = responses.filter(r => r.correct).length;
    const score = Math.round((correctAnswers / questions.length) * 100);
    
    const results: AssessmentResults = {
      totalQuestions: questions.length,
      correctAnswers,
      score,
      timeSpent,
      difficultyProgression: responses.map(r => r.correct ? 'up' : 'down'),
      strengths: analyzeStrengths(responses),
      weaknesses: analyzeWeaknesses(responses),
      recommendations: generateRecommendations(responses, score),
      learningPath: generateLearningPath(responses, score)
    };

    setIsComplete(true);
    onComplete(results);
  };

  const analyzeStrengths = (responses: StudentResponse[]): string[] => {
    const strengths: string[] = [];
    const correctResponses = responses.filter(r => r.correct);
    
    if (correctResponses.length > responses.length * 0.7) {
      strengths.push('Comprensión general del tema');
    }
    
    if (responses.filter(r => r.confidence >= 4).length > responses.length * 0.6) {
      strengths.push('Confianza en las respuestas');
    }

    return strengths;
  };

  const analyzeWeaknesses = (responses: StudentResponse[]): string[] => {
    const weaknesses: string[] = [];
    const incorrectResponses = responses.filter(r => !r.correct);
    
    if (incorrectResponses.length > responses.length * 0.3) {
      weaknesses.push('Necesita más práctica en conceptos básicos');
    }
    
    if (responses.filter(r => r.confidence <= 2).length > responses.length * 0.4) {
      weaknesses.push('Baja confianza en las respuestas');
    }

    return weaknesses;
  };

  const generateRecommendations = (responses: StudentResponse[], score: number): string[] => {
    const recommendations: string[] = [];
    
    if (score < 70) {
      recommendations.push('Revisar conceptos fundamentales');
      recommendations.push('Practicar con ejercicios más básicos');
    } else if (score < 90) {
      recommendations.push('Enfocarse en áreas específicas de mejora');
      recommendations.push('Practicar con ejercicios de dificultad media');
    } else {
      recommendations.push('Avanzar a conceptos más complejos');
      recommendations.push('Explorar aplicaciones prácticas');
    }

    return recommendations;
  };

  const generateLearningPath = (responses: StudentResponse[], score: number): string[] => {
    const path: string[] = [];
    
    if (score < 70) {
      path.push('Fundamentos básicos');
      path.push('Práctica guiada');
      path.push('Evaluación de refuerzo');
    } else if (score < 90) {
      path.push('Conceptos intermedios');
      path.push('Aplicación práctica');
      path.push('Evaluación avanzada');
    } else {
      path.push('Conceptos avanzados');
      path.push('Proyectos prácticos');
      path.push('Mentoría especializada');
    }

    return path;
  };

  if (isLoading) {
    return (
      <div className={cn("flex items-center justify-center p-8", className)}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Preparando evaluación adaptativa...</p>
        </div>
      </div>
    );
  }

  if (isComplete && showResults) {
    const correctAnswers = responses.filter(r => r.correct).length;
    const score = Math.round((correctAnswers / questions.length) * 100);
    
    return (
      <AssessmentResults 
        results={{
          totalQuestions: questions.length,
          correctAnswers,
          score,
          timeSpent,
          difficultyProgression: responses.map(r => r.correct ? 'up' : 'down'),
          strengths: analyzeStrengths(responses),
          weaknesses: analyzeWeaknesses(responses),
          recommendations: generateRecommendations(responses, score),
          learningPath: generateLearningPath(responses, score)
        }}
        onRestart={() => {
          setCurrentQuestion(0);
          setResponses([]);
          setTimeSpent(0);
          setIsComplete(false);
          setShowResults(false);
          setCurrentDifficulty('medium');
        }}
      />
    );
  }

  const currentQ = questions[currentQuestion];
  const progressPercentage = (currentQuestion / questions.length) * 100;

  return (
    <div className={cn("space-y-6", className)} style={getStyles()}>
      {/* Header de la evaluación */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Evaluación Adaptativa</CardTitle>
              <p className="text-muted-foreground">
                {subject} • Pregunta {currentQuestion + 1} de {questions.length}
              </p>
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
                <Volume2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Barra de progreso */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progreso: {Math.round(progressPercentage)}%</span>
              <span>Dificultad: {currentDifficulty}</span>
            </div>
            <Progress value={progressPercentage} />
          </div>

          {/* Información de tiempo */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, '0')}
            </div>
            <div className="flex items-center gap-1">
              <Target className="h-4 w-4" />
              {responses.filter(r => r.correct).length} correctas
            </div>
            <div className="flex items-center gap-1">
              <Brain className="h-4 w-4" />
              Nivel: {currentDifficulty}
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
                <Settings className="h-4 w-4" />
                <span>Control por voz</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Sin límite de tiempo</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pregunta actual */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Badge variant="secondary">{currentQ.difficulty}</Badge>
            Pregunta {currentQuestion + 1}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <QuestionRenderer 
            question={currentQ}
            onAnswer={handleAnswer}
            autoRead={autoRead}
          />
        </CardContent>
      </Card>

      {/* Navegación */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
          disabled={currentQuestion === 0}
          aria-label="Pregunta anterior"
        >
          Anterior
        </Button>

        <div className="text-sm text-muted-foreground">
          Pregunta {currentQuestion + 1} de {questions.length}
        </div>

        <Button
          variant="outline"
          onClick={() => setShowResults(true)}
          aria-label="Ver resultados"
        >
          Ver resultados
        </Button>
      </div>
    </div>
  );
};

// Componente para renderizar diferentes tipos de preguntas
interface QuestionRendererProps {
  question: AssessmentQuestion;
  onAnswer: (answer: any, confidence?: number) => void;
  autoRead: boolean;
}

const QuestionRenderer: React.FC<QuestionRendererProps> = ({
  question,
  onAnswer,
  autoRead
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<any>(null);
  const [confidence, setConfidence] = useState(3);
  const { speak } = useScreenReader();

  useEffect(() => {
    if (autoRead) {
      speak(question.content.question);
    }
  }, [question, autoRead, speak]);

  const handleSubmit = () => {
    if (selectedAnswer !== null) {
      onAnswer(selectedAnswer, confidence);
      setSelectedAnswer(null);
      setConfidence(3);
    }
  };

  switch (question.type) {
    case 'multiple-choice':
      return (
        <div className="space-y-4">
          <div className="prose max-w-none">
            <p className="text-lg">{question.content.question}</p>
          </div>
          
          <div className="space-y-2">
            {question.content.options?.map((option, index) => (
              <Button
                key={index}
                variant={selectedAnswer === index ? "default" : "outline"}
                className="w-full justify-start text-left"
                onClick={() => setSelectedAnswer(index)}
              >
                {option}
              </Button>
            ))}
          </div>

          <ConfidenceSelector value={confidence} onChange={setConfidence} />
          
          <Button 
            onClick={handleSubmit}
            disabled={selectedAnswer === null}
            className="w-full"
          >
            Responder
          </Button>
        </div>
      );

    case 'true-false':
      return (
        <div className="space-y-4">
          <div className="prose max-w-none">
            <p className="text-lg">{question.content.question}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant={selectedAnswer === true ? "default" : "outline"}
              onClick={() => setSelectedAnswer(true)}
              className="h-16"
            >
              <CheckCircle className="h-6 w-6 mr-2" />
              Verdadero
            </Button>
            <Button
              variant={selectedAnswer === false ? "default" : "outline"}
              onClick={() => setSelectedAnswer(false)}
              className="h-16"
            >
              <XCircle className="h-6 w-6 mr-2" />
              Falso
            </Button>
          </div>

          <ConfidenceSelector value={confidence} onChange={setConfidence} />
          
          <Button 
            onClick={handleSubmit}
            disabled={selectedAnswer === null}
            className="w-full"
          >
            Responder
          </Button>
        </div>
      );

    default:
      return <div>Tipo de pregunta no soportado</div>;
  }
};

// Selector de confianza
interface ConfidenceSelectorProps {
  value: number;
  onChange: (value: number) => void;
}

const ConfidenceSelector: React.FC<ConfidenceSelectorProps> = ({ value, onChange }) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">
        ¿Qué tan seguro estás de tu respuesta?
      </label>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((level) => (
          <Button
            key={level}
            variant={value === level ? "default" : "outline"}
            size="sm"
            onClick={() => onChange(level)}
            className="flex-1"
          >
            {level}
          </Button>
        ))}
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Muy inseguro</span>
        <span>Muy seguro</span>
      </div>
    </div>
  );
};

// Componente de resultados
interface AssessmentResultsProps {
  results: AssessmentResults;
  onRestart: () => void;
}

const AssessmentResults: React.FC<AssessmentResultsProps> = ({ results, onRestart }) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-2xl">Resultados de la Evaluación</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Puntuación principal */}
          <div className="text-center">
            <div className="text-6xl font-bold text-primary mb-2">{results.score}%</div>
            <p className="text-lg text-muted-foreground">
              {results.correctAnswers} de {results.totalQuestions} preguntas correctas
            </p>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {Math.floor(results.timeSpent / 60)}:{(results.timeSpent % 60).toString().padStart(2, '0')}
              </div>
              <div className="text-sm text-muted-foreground">Tiempo total</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {Math.round(results.timeSpent / results.totalQuestions)}
              </div>
              <div className="text-sm text-muted-foreground">Segundos por pregunta</div>
            </div>
          </div>

          {/* Fortalezas y debilidades */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Star className="h-4 w-4 text-green-500" />
                Fortalezas
              </h3>
              <ul className="space-y-1 text-sm">
                {results.strengths.map((strength, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    {strength}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-orange-500" />
                Áreas de mejora
              </h3>
              <ul className="space-y-1 text-sm">
                {results.weaknesses.map((weakness, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <XCircle className="h-3 w-3 text-orange-500" />
                    {weakness}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Recomendaciones */}
          <div>
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-yellow-500" />
              Recomendaciones
            </h3>
            <ul className="space-y-1 text-sm">
              {results.recommendations.map((rec, index) => (
                <li key={index} className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  {rec}
                </li>
              ))}
            </ul>
          </div>

          {/* Ruta de aprendizaje */}
          <div>
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-blue-500" />
              Ruta de Aprendizaje Sugerida
            </h3>
            <div className="flex items-center gap-2 text-sm">
              {results.learningPath.map((step, index) => (
                <React.Fragment key={index}>
                  <Badge variant="outline">{step}</Badge>
                  {index < results.learningPath.length - 1 && (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Acciones */}
          <div className="flex gap-2">
            <Button onClick={onRestart} className="flex-1">
              <RotateCcw className="h-4 w-4 mr-2" />
              Repetir evaluación
            </Button>
            <Button variant="outline" className="flex-1">
              <TrendingUp className="h-4 w-4 mr-2" />
              Ver progreso
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
