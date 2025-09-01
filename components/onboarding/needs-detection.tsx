'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Brain,
  Eye,
  Ear,
  Hand,
  Heart,
  Zap,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Monitor,
  Smartphone,
  Tablet,
  Wifi,
  WifiOff,
  Clock,
  Target,
  Award,
  Sparkles,
  Globe,
  Users,
  BookOpen,
  Activity,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import { useScreenReader } from '@/components/accessibility/screen-reader';
import { useHighContrast } from '@/components/accessibility/high-contrast';

interface NeedsDetectionProps {
  onComplete: (needs: DetectedNeeds) => void;
  userData: any;
  className?: string;
}

interface DetectedNeeds {
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'mixed';
  accessibilityLevel: 'basic' | 'intermediate' | 'advanced';
  specialNeeds: SpecialNeed[];
  culturalAdaptations: CulturalAdaptation[];
  deviceOptimizations: DeviceOptimization[];
  connectivityAdaptations: ConnectivityAdaptation[];
  confidence: number;
  recommendations: string[];
}

interface SpecialNeed {
  type: string;
  severity: 'mild' | 'moderate' | 'severe';
  confidence: number;
  indicators: string[];
  accommodations: string[];
  culturalAdaptations: string[];
}

interface CulturalAdaptation {
  culture: string;
  adaptations: string[];
  relevance: number;
  examples: string[];
}

interface DeviceOptimization {
  device: string;
  optimizations: string[];
  priority: 'low' | 'medium' | 'high';
}

interface ConnectivityAdaptation {
  type: 'stable' | 'unstable' | 'offline';
  adaptations: string[];
  fallbackStrategies: string[];
}

interface AssessmentResult {
  readingSpeed: number;
  readingAccuracy: number;
  mathSpeed: number;
  mathAccuracy: number;
  attentionSpan: number;
  responseTime: number;
  errorPatterns: any;
  preferences: any;
}

export const NeedsDetection: React.FC<NeedsDetectionProps> = ({
  onComplete,
  userData,
  className
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [assessmentResults, setAssessmentResults] = useState<AssessmentResult | null>(null);
  const [detectedNeeds, setDetectedNeeds] = useState<DetectedNeeds | null>(null);
  const [currentAssessment, setCurrentAssessment] = useState<any>(null);
  const [assessmentProgress, setAssessmentProgress] = useState(0);

  const { speak, isEnabled: screenReaderEnabled } = useScreenReader();
  const { getStyles } = useHighContrast();

  const totalSteps = 4;

  useEffect(() => {
    if (currentStep === 1) {
      startInitialAssessment();
    }
  }, [currentStep]);

  const startInitialAssessment = async () => {
    setIsLoading(true);
    
    try {
      // Simular evaluación inicial
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const results: AssessmentResult = {
        readingSpeed: Math.random() * 100,
        readingAccuracy: 0.7 + Math.random() * 0.3,
        mathSpeed: Math.random() * 100,
        mathAccuracy: 0.6 + Math.random() * 0.4,
        attentionSpan: 10 + Math.random() * 20,
        responseTime: 2 + Math.random() * 8,
        errorPatterns: {
          substitutions: Math.floor(Math.random() * 5),
          omissions: Math.floor(Math.random() * 3),
          insertions: Math.floor(Math.random() * 2),
          reversals: Math.floor(Math.random() * 4),
          transpositions: Math.floor(Math.random() * 2)
        },
        preferences: {
          audio: Math.random() > 0.5,
          visual: Math.random() > 0.5,
          kinesthetic: Math.random() > 0.5
        }
      };

      setAssessmentResults(results);
      setCurrentStep(2);
      
      if (screenReaderEnabled) {
        speak('Evaluación inicial completada');
      }
    } catch (error) {
      console.error('Error en evaluación inicial:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeNeeds = async () => {
    setIsLoading(true);
    
    try {
      // Simular análisis de IA
      await new Promise(resolve => setTimeout(resolve, 4000));
      
      const needs: DetectedNeeds = {
        learningStyle: determineLearningStyle(assessmentResults!),
        accessibilityLevel: determineAccessibilityLevel(assessmentResults!, userData),
        specialNeeds: detectSpecialNeeds(assessmentResults!, userData),
        culturalAdaptations: generateCulturalAdaptations(userData),
        deviceOptimizations: generateDeviceOptimizations(userData),
        connectivityAdaptations: generateConnectivityAdaptations(userData),
        confidence: 0.85,
        recommendations: generateRecommendations(assessmentResults!, userData)
      };

      setDetectedNeeds(needs);
      setCurrentStep(3);
      
      if (screenReaderEnabled) {
        speak(`Análisis completado. Se detectaron ${needs.specialNeeds.length} necesidades especiales`);
      }
    } catch (error) {
      console.error('Error analizando necesidades:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const determineLearningStyle = (results: AssessmentResult): 'visual' | 'auditory' | 'kinesthetic' | 'mixed' => {
    const { preferences } = results;
    const scores = {
      visual: preferences.visual ? 1 : 0,
      auditory: preferences.audio ? 1 : 0,
      kinesthetic: preferences.kinesthetic ? 1 : 0
    };

    const maxScore = Math.max(...Object.values(scores));
    const dominantStyles = Object.entries(scores).filter(([_, score]) => score === maxScore);

    if (dominantStyles.length > 1) return 'mixed';
    return dominantStyles[0][0] as any;
  };

  const determineAccessibilityLevel = (results: AssessmentResult, userData: any): 'basic' | 'intermediate' | 'advanced' => {
    const age = parseInt(userData.age?.split('-')[0] || '25');
    const hasAccessibilityNeeds = userData.accessibilityNeeds?.length > 0;

    if (age > 50 || hasAccessibilityNeeds) return 'advanced';
    if (age > 30 || results.readingAccuracy < 0.8) return 'intermediate';
    return 'basic';
  };

  const detectSpecialNeeds = (results: AssessmentResult, userData: any): SpecialNeed[] => {
    const needs: SpecialNeed[] = [];

    // Detectar dislexia
    if (results.errorPatterns.reversals > 2 || results.errorPatterns.transpositions > 1) {
      needs.push({
        type: 'dislexia',
        severity: results.errorPatterns.reversals > 3 ? 'moderate' : 'mild',
        confidence: 0.8,
        indicators: ['Inversión de letras', 'Transposición de palabras'],
        accommodations: ['Texto con espaciado aumentado', 'Fuente sans-serif', 'Síntesis de voz'],
        culturalAdaptations: ['Ejemplos culturales relevantes', 'Contenido visual']
      });
    }

    // Detectar TDAH
    if (results.attentionSpan < 15 || results.responseTime > 8) {
      needs.push({
        type: 'tdah',
        severity: results.attentionSpan < 10 ? 'moderate' : 'mild',
        confidence: 0.7,
        indicators: ['Baja atención sostenida', 'Tiempo de respuesta variable'],
        accommodations: ['Sesiones cortas', 'Pausas frecuentes', 'Recordatorios visuales'],
        culturalAdaptations: ['Contenido culturalmente relevante', 'Ejemplos de la vida cotidiana']
      });
    }

    // Detectar discalculia
    if (results.mathAccuracy < 0.7 || results.mathSpeed < 50) {
      needs.push({
        type: 'discalculia',
        severity: results.mathAccuracy < 0.6 ? 'moderate' : 'mild',
        confidence: 0.75,
        indicators: ['Dificultades con números', 'Lentitud en cálculos'],
        accommodations: ['Calculadora', 'Representación visual', 'Ejemplos paso a paso'],
        culturalAdaptations: ['Sistema numérico cultural', 'Ejemplos del contexto local']
      });
    }

    return needs;
  };

  const generateCulturalAdaptations = (userData: any): CulturalAdaptation[] => {
    const adaptations: CulturalAdaptation[] = [];

    if (userData.culturalBackground) {
      adaptations.push({
        culture: userData.culturalBackground,
        adaptations: [
          'Contenido en idioma nativo',
          'Ejemplos culturales relevantes',
          'Tradiciones locales',
          'Perspectivas culturales'
        ],
        relevance: 0.9,
        examples: [
          'Matemáticas mayas',
          'Historia local',
          'Artes tradicionales'
        ]
      });
    }

    return adaptations;
  };

  const generateDeviceOptimizations = (userData: any): DeviceOptimization[] => {
    const optimizations: DeviceOptimization[] = [];

    if (userData.deviceType) {
      optimizations.push({
        device: userData.deviceType,
        optimizations: [
          'Interfaz responsive',
          'Controles táctiles',
          'Optimización de batería',
          'Modo offline'
        ],
        priority: userData.deviceType === 'mobile' ? 'high' : 'medium'
      });
    }

    return optimizations;
  };

  const generateConnectivityAdaptations = (userData: any): ConnectivityAdaptation[] => {
    const adaptations: ConnectivityAdaptation[] = [];

    if (userData.internetAccess === 'unstable') {
      adaptations.push({
        type: 'unstable',
        adaptations: [
          'Contenido descargable',
          'Sincronización offline',
          'Modo de bajo ancho de banda'
        ],
        fallbackStrategies: [
          'Contenido pre-cargado',
          'Sincronización diferida',
          'Modo texto simple'
        ]
      });
    }

    return adaptations;
  };

  const generateRecommendations = (results: AssessmentResult, userData: any): string[] => {
    const recommendations: string[] = [];

    if (results.readingAccuracy < 0.8) {
      recommendations.push('Considerar evaluación de lectura especializada');
    }

    if (results.attentionSpan < 15) {
      recommendations.push('Implementar estrategias de atención y concentración');
    }

    if (userData.culturalBackground) {
      recommendations.push('Integrar contenido cultural en el aprendizaje');
    }

    return recommendations;
  };

  const renderStep1 = () => (
    <div className="text-center space-y-6">
      <div className="w-24 h-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
        <Brain className="h-12 w-12 text-white" />
      </div>
      
      <h2 className="text-3xl font-bold text-gray-900">
        Detección de Necesidades
      </h2>
      
      <p className="text-lg text-gray-600 max-w-2xl mx-auto">
        Vamos a realizar una evaluación inicial para entender mejor tus necesidades 
        de aprendizaje y accesibilidad.
      </p>

      {isLoading ? (
        <div className="space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-600" />
          <p className="text-gray-600">Realizando evaluación inicial...</p>
          <Progress value={assessmentProgress} className="w-full max-w-md mx-auto" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <div className="p-4 bg-blue-50 rounded-lg">
            <Eye className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <h3 className="font-semibold text-blue-900">Evaluación Visual</h3>
            <p className="text-sm text-blue-700">Análisis de lectura y comprensión</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <Brain className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <h3 className="font-semibold text-green-900">Análisis Cognitivo</h3>
            <p className="text-sm text-green-700">Patrones de aprendizaje</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <Heart className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <h3 className="font-semibold text-purple-900">Contexto Cultural</h3>
            <p className="text-sm text-purple-700">Adaptaciones culturales</p>
          </div>
        </div>
      )}
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Resultados de la Evaluación
        </h2>
        <p className="text-gray-600">
          Análisis de tus patrones de aprendizaje
        </p>
      </div>

      {assessmentResults && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Habilidades de Lectura
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Velocidad de lectura</span>
                    <span>{Math.round(assessmentResults.readingSpeed)} palabras/min</span>
                  </div>
                  <Progress value={assessmentResults.readingSpeed} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Precisión</span>
                    <span>{Math.round(assessmentResults.readingAccuracy * 100)}%</span>
                  </div>
                  <Progress value={assessmentResults.readingAccuracy * 100} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Habilidades Matemáticas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Velocidad de cálculo</span>
                    <span>{Math.round(assessmentResults.mathSpeed)} problemas/min</span>
                  </div>
                  <Progress value={assessmentResults.mathSpeed} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Precisión</span>
                    <span>{Math.round(assessmentResults.mathAccuracy * 100)}%</span>
                  </div>
                  <Progress value={assessmentResults.mathAccuracy * 100} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Atención y Respuesta
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Duración de atención</span>
                    <span>{Math.round(assessmentResults.attentionSpan)} min</span>
                  </div>
                  <Progress value={(assessmentResults.attentionSpan / 30) * 100} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Tiempo de respuesta</span>
                    <span>{Math.round(assessmentResults.responseTime)} seg</span>
                  </div>
                  <Progress value={Math.max(0, 100 - (assessmentResults.responseTime / 10) * 100)} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Preferencias de Aprendizaje
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(assessmentResults.preferences).map(([style, preference]) => (
                  <div key={style} className="flex items-center justify-between">
                    <span className="text-sm capitalize">{style}</span>
                    <Badge variant={preference ? "default" : "secondary"}>
                      {preference ? "Preferido" : "No preferido"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="text-center">
        <Button 
          onClick={analyzeNeeds}
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analizando...
            </>
          ) : (
            <>
              Analizar Necesidades
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Necesidades Detectadas
        </h2>
        <p className="text-gray-600">
          Basado en el análisis de IA y tus respuestas
        </p>
      </div>

      {detectedNeeds && (
        <div className="space-y-6">
          {/* Resumen */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Resumen del Análisis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center">
                  <h4 className="font-medium mb-1">Estilo de Aprendizaje</h4>
                  <Badge variant="outline" className="capitalize">
                    {detectedNeeds.learningStyle}
                  </Badge>
                </div>
                <div className="text-center">
                  <h4 className="font-medium mb-1">Nivel de Accesibilidad</h4>
                  <Badge variant="outline" className="capitalize">
                    {detectedNeeds.accessibilityLevel}
                  </Badge>
                </div>
                <div className="text-center">
                  <h4 className="font-medium mb-1">Necesidades Especiales</h4>
                  <Badge variant="outline">
                    {detectedNeeds.specialNeeds.length}
                  </Badge>
                </div>
                <div className="text-center">
                  <h4 className="font-medium mb-1">Confianza</h4>
                  <Badge variant="outline">
                    {Math.round(detectedNeeds.confidence * 100)}%
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Necesidades Especiales */}
          {detectedNeeds.specialNeeds.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Necesidades Especiales Detectadas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {detectedNeeds.specialNeeds.map((need, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium capitalize">{need.type}</h4>
                        <div className="flex items-center gap-2">
                          <Badge variant={need.severity === 'severe' ? 'destructive' : 'secondary'}>
                            {need.severity}
                          </Badge>
                          <Badge variant="outline">
                            {Math.round(need.confidence * 100)}%
                          </Badge>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <h5 className="text-sm font-medium text-gray-700">Indicadores:</h5>
                          <p className="text-sm text-gray-600">{need.indicators.join(', ')}</p>
                        </div>
                        <div>
                          <h5 className="text-sm font-medium text-gray-700">Adaptaciones:</h5>
                          <p className="text-sm text-gray-600">{need.accommodations.join(', ')}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Adaptaciones Culturales */}
          {detectedNeeds.culturalAdaptations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Adaptaciones Culturales
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {detectedNeeds.culturalAdaptations.map((adaptation, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium capitalize">{adaptation.culture}</h4>
                        <Badge variant="outline">
                          {Math.round(adaptation.relevance * 100)}% relevante
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <h5 className="text-sm font-medium text-gray-700">Adaptaciones:</h5>
                          <p className="text-sm text-gray-600">{adaptation.adaptations.join(', ')}</p>
                        </div>
                        <div>
                          <h5 className="text-sm font-medium text-gray-700">Ejemplos:</h5>
                          <p className="text-sm text-gray-600">{adaptation.examples.join(', ')}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recomendaciones */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Recomendaciones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {detectedNeeds.recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <span className="text-sm">{recommendation}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="text-center">
        <Button 
          onClick={() => setCurrentStep(4)}
          className="bg-green-600 hover:bg-green-700"
        >
          Continuar
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="text-center space-y-6">
      <div className="w-24 h-24 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="h-12 w-12 text-white" />
      </div>
      
      <h2 className="text-3xl font-bold text-gray-900">
        ¡Análisis Completado!
      </h2>
      
      <p className="text-lg text-gray-600 max-w-2xl mx-auto">
        Hemos detectado tus necesidades específicas y hemos preparado 
        una experiencia de aprendizaje personalizada para ti.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        <div className="p-4 bg-green-50 rounded-lg">
          <Brain className="h-8 w-8 text-green-600 mx-auto mb-2" />
          <h3 className="font-semibold text-green-900">Perfil Creado</h3>
          <p className="text-sm text-green-700">Tu perfil de aprendizaje está listo</p>
        </div>
        <div className="p-4 bg-blue-50 rounded-lg">
          <Zap className="h-8 w-8 text-blue-600 mx-auto mb-2" />
          <h3 className="font-semibold text-blue-900">Adaptaciones Activadas</h3>
          <p className="text-sm text-blue-700">Configuradas según tus necesidades</p>
        </div>
        <div className="p-4 bg-purple-50 rounded-lg">
          <Target className="h-8 w-8 text-purple-600 mx-auto mb-2" />
          <h3 className="font-semibold text-purple-900">Contenido Personalizado</h3>
          <p className="text-sm text-purple-700">Adaptado a tu estilo de aprendizaje</p>
        </div>
      </div>

      <div className="text-center">
        <Button 
          onClick={() => detectedNeeds && onComplete(detectedNeeds)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Comenzar Experiencia Personalizada
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  const steps = [
    { id: 1, title: 'Evaluación', component: renderStep1() },
    { id: 2, title: 'Resultados', component: renderStep2() },
    { id: 3, title: 'Análisis', component: renderStep3() },
    { id: 4, title: 'Completado', component: renderStep4() }
  ];

  const currentStepData = steps.find(step => step.id === currentStep);

  return (
    <div className={`max-w-4xl mx-auto ${className}`}>
      {/* Progress */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Paso {currentStep} de {totalSteps}</span>
          <span>{Math.round((currentStep / totalSteps) * 100)}%</span>
        </div>
        <Progress value={(currentStep / totalSteps) * 100} className="h-2" />
        
        <div className="flex justify-between mt-2">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`flex flex-col items-center ${
                step.id <= currentStep ? 'text-blue-600' : 'text-gray-400'
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step.id < currentStep 
                  ? 'bg-green-100 text-green-600' 
                  : step.id === currentStep 
                  ? 'bg-blue-100 text-blue-600'
                  : 'bg-gray-100 text-gray-400'
              }`}>
                {step.id < currentStep ? <CheckCircle className="h-4 w-4" /> : step.id}
              </div>
              <span className="text-xs mt-1 hidden md:block">{step.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <Card className="shadow-xl border-0">
        <CardContent className="p-8">
          {currentStepData?.component}
        </CardContent>
      </Card>
    </div>
  );
};
