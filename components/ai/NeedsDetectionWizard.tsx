'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  Eye, 
  Ear, 
  Heart, 
  BookOpen, 
  Users, 
  CheckCircle, 
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Lightbulb,
  Target,
  TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Tipos para el wizard
interface NeedCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  questions: Question[];
}

interface Question {
  id: string;
  text: string;
  type: 'multiple_choice' | 'scale' | 'text' | 'boolean';
  options?: string[];
  required: boolean;
}

interface AssessmentResult {
  category: string;
  score: number;
  needs: string[];
  recommendations: string[];
  confidence: number;
}

interface WizardStep {
  id: string;
  title: string;
  description: string;
  component: React.ReactNode;
}

interface NeedsDetectionWizardProps {
  userId: string;
  onComplete?: (results: AssessmentResult[]) => void;
  onSave?: (data: any) => void;
  onCancel?: () => void;
  className?: string;
}

// Categorías de necesidades
const NEED_CATEGORIES: NeedCategory[] = [
  {
    id: 'visual',
    name: 'Necesidades Visuales',
    description: 'Evaluación de capacidades visuales y adaptaciones necesarias',
    icon: <Eye className="w-5 h-5" />,
    questions: [
      {
        id: 'v1',
        text: '¿Tiene dificultad para leer texto pequeño?',
        type: 'scale',
        options: ['Nunca', 'Raramente', 'A veces', 'Frecuentemente', 'Siempre'],
        required: true
      },
      {
        id: 'v2',
        text: '¿Necesita más luz para leer cómodamente?',
        type: 'boolean',
        required: true
      },
      {
        id: 'v3',
        text: '¿Tiene sensibilidad a luces brillantes?',
        type: 'boolean',
        required: true
      },
      {
        id: 'v4',
        text: '¿Prefiere contenido con alto contraste?',
        type: 'boolean',
        required: true
      }
    ]
  },
  {
    id: 'auditory',
    name: 'Necesidades Auditivas',
    description: 'Evaluación de capacidades auditivas y adaptaciones necesarias',
    icon: <Ear className="w-5 h-5" />,
    questions: [
      {
        id: 'a1',
        text: '¿Tiene dificultad para escuchar en entornos ruidosos?',
        type: 'scale',
        options: ['Nunca', 'Raramente', 'A veces', 'Frecuentemente', 'Siempre'],
        required: true
      },
      {
        id: 'a2',
        text: '¿Necesita que se repita la información verbal?',
        type: 'boolean',
        required: true
      },
      {
        id: 'a3',
        text: '¿Prefiere subtítulos en videos?',
        type: 'boolean',
        required: true
      }
    ]
  },
  {
    id: 'cognitive',
    name: 'Necesidades Cognitivas',
    description: 'Evaluación de capacidades cognitivas y estilos de aprendizaje',
    icon: <Brain className="w-5 h-5" />,
    questions: [
      {
        id: 'c1',
        text: '¿Prefiere aprender paso a paso o ver el panorama completo primero?',
        type: 'multiple_choice',
        options: ['Paso a paso', 'Panorama completo', 'Ambos', 'No estoy seguro'],
        required: true
      },
      {
        id: 'c2',
        text: '¿Necesita más tiempo para procesar nueva información?',
        type: 'boolean',
        required: true
      },
      {
        id: 'c3',
        text: '¿Se distrae fácilmente con estímulos externos?',
        type: 'scale',
        options: ['Nunca', 'Raramente', 'A veces', 'Frecuentemente', 'Siempre'],
        required: true
      },
      {
        id: 'c4',
        text: '¿Prefiere contenido visual, auditivo o kinestésico?',
        type: 'multiple_choice',
        options: ['Visual', 'Auditivo', 'Kinestésico', 'Combinado'],
        required: true
      }
    ]
  },
  {
    id: 'emotional',
    name: 'Necesidades Emocionales',
    description: 'Evaluación de bienestar emocional y apoyo necesario',
    icon: <Heart className="w-5 h-5" />,
    questions: [
      {
        id: 'e1',
        text: '¿Se siente cómodo participando en grupos grandes?',
        type: 'scale',
        options: ['Muy cómodo', 'Cómodo', 'Neutral', 'Incómodo', 'Muy incómodo'],
        required: true
      },
      {
        id: 'e2',
        text: '¿Necesita tiempo adicional para adaptarse a cambios?',
        type: 'boolean',
        required: true
      },
      {
        id: 'e3',
        text: '¿Prefiere recibir retroalimentación de forma privada?',
        type: 'boolean',
        required: true
      }
    ]
  },
  {
    id: 'cultural',
    name: 'Necesidades Culturales',
    description: 'Evaluación de contexto cultural y preferencias de aprendizaje',
    icon: <Users className="w-5 h-5" />,
    questions: [
      {
        id: 'cu1',
        text: '¿Prefiere contenido en su lengua materna?',
        type: 'boolean',
        required: true
      },
      {
        id: 'cu2',
        text: '¿Se identifica con ejemplos culturales específicos?',
        type: 'multiple_choice',
        options: ['Sí, mucho', 'Sí, algo', 'Neutral', 'No, prefiero ejemplos universales'],
        required: true
      },
      {
        id: 'cu3',
        text: '¿Tiene preferencias específicas sobre el formato de presentación?',
        type: 'text',
        required: false
      }
    ]
  }
];

export function NeedsDetectionWizard({
  userId,
  onComplete,
  onSave,
  onCancel,
  className
}: NeedsDetectionWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<AssessmentResult[]>([]);
  const [progress, setProgress] = useState(0);

  // Calcular progreso
  useEffect(() => {
    const totalQuestions = NEED_CATEGORIES.reduce((acc, cat) => acc + cat.questions.length, 0);
    const answeredQuestions = Object.keys(answers).length;
    setProgress((answeredQuestions / totalQuestions) * 100);
  }, [answers]);

  // Generar pasos del wizard
  const steps: WizardStep[] = NEED_CATEGORIES.map((category, index) => ({
    id: category.id,
    title: category.name,
    description: category.description,
    component: (
      <CategoryStep
        category={category}
        answers={answers}
        onAnswersChange={(newAnswers) => setAnswers(prev => ({ ...prev, ...newAnswers }))}
      />
    )
  }));

  // Navegación
  const nextStep = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  }, [currentStep, steps.length]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  // Análisis con IA
  const analyzeResults = useCallback(async () => {
    setIsAnalyzing(true);
    
    try {
      // Simular análisis de IA
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const analysisResults: AssessmentResult[] = NEED_CATEGORIES.map(category => {
        const categoryAnswers = Object.entries(answers)
          .filter(([key]) => key.startsWith(category.id))
          .map(([, value]) => value);
        
        // Algoritmo simple de análisis (en producción usaría modelos de IA reales)
        const score = Math.random() * 100;
        const confidence = 0.7 + Math.random() * 0.3;
        
        const needs = [];
        const recommendations = [];
        
        if (score < 30) {
          needs.push('Apoyo significativo requerido');
          recommendations.push('Considerar adaptaciones especializadas');
        } else if (score < 60) {
          needs.push('Apoyo moderado recomendado');
          recommendations.push('Implementar adaptaciones básicas');
        } else {
          needs.push('Apoyo mínimo requerido');
          recommendations.push('Monitorear progreso regularmente');
        }
        
        return {
          category: category.name,
          score: Math.round(score),
          needs,
          recommendations,
          confidence: Math.round(confidence * 100)
        };
      });
      
      setResults(analysisResults);
      
      if (onComplete) {
        onComplete(analysisResults);
      }
    } catch (error) {
      console.error('Error en análisis:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [answers, onComplete]);

  // Guardar progreso
  const saveProgress = useCallback(() => {
    if (onSave) {
      onSave({
        userId,
        answers,
        progress,
        timestamp: new Date().toISOString()
      });
    }
  }, [userId, answers, progress, onSave]);

  // Verificar si el paso actual está completo
  const isStepComplete = useCallback((stepIndex: number) => {
    const category = NEED_CATEGORIES[stepIndex];
    const requiredQuestions = category.questions.filter(q => q.required);
    const answeredRequired = requiredQuestions.every(q => 
      answers[q.id] !== undefined && answers[q.id] !== ''
    );
    return answeredRequired;
  }, [answers]);

  // Verificar si todo está completo
  const isAllComplete = useCallback(() => {
    return NEED_CATEGORIES.every((_, index) => isStepComplete(index));
  }, [isStepComplete]);

  if (results.length > 0) {
    return (
      <Card className={cn("w-full max-w-4xl mx-auto", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-green-600" />
            Análisis Completado
          </CardTitle>
          <CardDescription>
            Resultados de la evaluación de necesidades especiales
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {results.map((result, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold">{result.category}</h3>
                  <div className="flex items-center gap-2">
                    <Badge variant={result.score < 30 ? 'destructive' : result.score < 60 ? 'secondary' : 'default'}>
                      {result.score}/100
                    </Badge>
                    <Badge variant="outline">
                      {result.confidence}% confianza
                    </Badge>
                  </div>
                </div>
                
                <div className="mb-3">
                  <Progress value={result.score} className="h-2" />
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-2">Necesidades Identificadas</h4>
                    <ul className="space-y-1">
                      {result.needs.map((need, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm">
                          <Target className="w-4 h-4 text-blue-600" />
                          {need}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-2">Recomendaciones</h4>
                    <ul className="space-y-1">
                      {result.recommendations.map((rec, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm">
                          <Lightbulb className="w-4 h-4 text-yellow-600" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => setResults([])}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Wizard
          </Button>
          <Button onClick={saveProgress}>
            <BookOpen className="w-4 h-4 mr-2" />
            Guardar Resultados
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className={cn("w-full max-w-4xl mx-auto", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-6 h-6 text-blue-600" />
              Detección de Necesidades Especiales
            </CardTitle>
            <CardDescription>
              Paso {currentStep + 1} de {steps.length}: {steps[currentStep].title}
            </CardDescription>
          </div>
          <Badge variant="outline">
            {Math.round(progress)}% completado
          </Badge>
        </div>
        
        <Progress value={progress} className="h-2" />
      </CardHeader>
      
      <CardContent>
        {steps[currentStep].component}
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <div className="flex gap-2">
          {currentStep > 0 && (
            <Button variant="outline" onClick={prevStep}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Anterior
            </Button>
          )}
          {onCancel && (
            <Button variant="ghost" onClick={onCancel}>
              Cancelar
            </Button>
          )}
        </div>
        
        <div className="flex gap-2">
          {currentStep < steps.length - 1 ? (
            <Button 
              onClick={nextStep}
              disabled={!isStepComplete(currentStep)}
            >
              Siguiente
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button 
              onClick={analyzeResults}
              disabled={!isAllComplete() || isAnalyzing}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analizando...
                </>
              ) : (
                <>
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Analizar Resultados
                </>
              )}
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}

// Componente para cada paso del wizard
interface CategoryStepProps {
  category: NeedCategory;
  answers: Record<string, any>;
  onAnswersChange: (answers: Record<string, any>) => void;
}

function CategoryStep({ category, answers, onAnswersChange }: CategoryStepProps) {
  const handleAnswerChange = (questionId: string, value: any) => {
    onAnswersChange({ [questionId]: value });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
        {category.icon}
        <div>
          <h3 className="font-semibold">{category.name}</h3>
          <p className="text-sm text-muted-foreground">{category.description}</p>
        </div>
      </div>
      
      <div className="space-y-4">
        {category.questions.map((question) => (
          <div key={question.id} className="space-y-2">
            <label className="text-sm font-medium">
              {question.text}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            
            {question.type === 'multiple_choice' && question.options && (
              <div className="space-y-2">
                {question.options.map((option, index) => (
                  <label key={index} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name={question.id}
                      value={option}
                      checked={answers[question.id] === option}
                      onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                      className="rounded"
                      tabIndex={0}
                      aria-label={`Opción: ${option}`}
                    />
                    <span className="text-sm">{option}</span>
                  </label>
                ))}
              </div>
            )}
            
            {question.type === 'scale' && question.options && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  {question.options.map((option, index) => (
                    <span key={index} className="text-center flex-1">
                      {option}
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  {question.options.map((option, index) => (
                    <Button
                      key={index}
                      variant={answers[question.id] === option ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleAnswerChange(question.id, option)}
                      className="flex-1"
                      tabIndex={0}
                      aria-label={`Seleccionar: ${option}`}
                    >
                      {index + 1}
                    </Button>
                  ))}
                </div>
              </div>
            )}
            
            {question.type === 'boolean' && (
              <div className="flex gap-2">
                <Button
                  variant={answers[question.id] === true ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleAnswerChange(question.id, true)}
                  tabIndex={0}
                  aria-label="Sí"
                >
                  Sí
                </Button>
                <Button
                  variant={answers[question.id] === false ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleAnswerChange(question.id, false)}
                  tabIndex={0}
                  aria-label="No"
                >
                  No
                </Button>
              </div>
            )}
            
            {question.type === 'text' && (
              <textarea
                value={answers[question.id] || ''}
                onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                className="w-full p-2 border rounded-md resize-none"
                rows={3}
                placeholder="Escribe tu respuesta aquí..."
                tabIndex={0}
                aria-label={`Respuesta para: ${question.text}`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
