'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Brain,
  Heart,
  Globe,
  Users,
  BookOpen,
  Target,
  Zap,
  Shield,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Mic,
  Volume2,
  VolumeX,
  Monitor,
  Smartphone,
  Tablet,
  Wifi,
  WifiOff
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useScreenReader } from '@/components/accessibility/screen-reader';
import { useHighContrast } from '@/components/accessibility/high-contrast';

interface AdaptiveRegistrationProps {
  onComplete: (userData: any, detectedNeeds: any) => void;
  className?: string;
}

interface RegistrationData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  age: string;
  region: string;
  educationLevel: string;
  culturalBackground: string;
  deviceType: string;
  internetAccess: string;
  previousExperience: string;
  learningGoals: string[];
  accessibilityNeeds: string[];
  specialNeeds: string[];
}

interface DetectedNeeds {
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'mixed';
  accessibilityLevel: 'basic' | 'intermediate' | 'advanced';
  culturalAdaptation: boolean;
  specialNeeds: string[];
  deviceOptimization: string[];
  connectivityAdaptation: boolean;
  confidence: number;
}

export const AdaptiveRegistration: React.FC<AdaptiveRegistrationProps> = ({
  onComplete,
  className
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [detectedNeeds, setDetectedNeeds] = useState<DetectedNeeds | null>(null);
  const [formData, setFormData] = useState<RegistrationData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    age: '',
    region: '',
    educationLevel: '',
    culturalBackground: '',
    deviceType: '',
    internetAccess: '',
    previousExperience: '',
    learningGoals: [],
    accessibilityNeeds: [],
    specialNeeds: []
  });

  const { register } = useAuth();
  const { speak, isEnabled: screenReaderEnabled } = useScreenReader();
  const { getStyles } = useHighContrast();

  const totalSteps = 6;

  // Detectar dispositivo automáticamente
  useEffect(() => {
    const detectDevice = () => {
      const userAgent = navigator.userAgent;
      if (/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
        if (/iPad|Android.*Tablet/i.test(userAgent)) {
          return 'tablet';
        }
        return 'mobile';
      }
      return 'desktop';
    };

    const detectConnectivity = () => {
      return navigator.onLine ? 'stable' : 'unstable';
    };

    setFormData(prev => ({
      ...prev,
      deviceType: detectDevice(),
      internetAccess: detectConnectivity()
    }));
  }, []);

  // Detectar necesidades automáticamente
  useEffect(() => {
    if (currentStep === totalSteps) {
      detectNeeds();
    }
  }, [currentStep]);

  const detectNeeds = async () => {
    setIsLoading(true);
    
    try {
      // Análisis automático basado en datos del formulario
      const analysis = await analyzeUserData(formData);
      setDetectedNeeds(analysis);
      
      if (screenReaderEnabled) {
        speak(`Necesidades detectadas: ${analysis.specialNeeds.join(', ')}`);
      }
    } catch (error) {
      console.error('Error detectando necesidades:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeUserData = async (data: RegistrationData): Promise<DetectedNeeds> => {
    // Simular análisis de IA
    await new Promise(resolve => setTimeout(resolve, 2000));

    const needs: DetectedNeeds = {
      learningStyle: 'mixed',
      accessibilityLevel: 'basic',
      culturalAdaptation: false,
      specialNeeds: [],
      deviceOptimization: [],
      connectivityAdaptation: false,
      confidence: 0.85
    };

    // Análisis de edad y educación
    const age = parseInt(data.age.split('-')[0]);
    if (age < 12) {
      needs.learningStyle = 'visual';
      needs.accessibilityLevel = 'intermediate';
    } else if (age > 50) {
      needs.accessibilityLevel = 'advanced';
      needs.specialNeeds.push('texto_grande');
    }

    // Análisis de contexto cultural
    if (['maya', 'náhuatl', 'zapoteco', 'mixteco'].includes(data.culturalBackground)) {
      needs.culturalAdaptation = true;
    }

    // Análisis de dispositivo
    if (data.deviceType === 'mobile') {
      needs.deviceOptimization.push('mobile_optimized');
    }

    // Análisis de conectividad
    if (data.internetAccess === 'unstable') {
      needs.connectivityAdaptation = true;
    }

    // Análisis de necesidades especiales
    if (data.accessibilityNeeds.includes('lector_pantalla')) {
      needs.specialNeeds.push('screen_reader');
      needs.accessibilityLevel = 'advanced';
    }

    if (data.accessibilityNeeds.includes('alto_contraste')) {
      needs.specialNeeds.push('high_contrast');
    }

    return needs;
  };

  const handleInputChange = (field: keyof RegistrationData, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    
    try {
      const result = await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        language: 'es',
        age: formData.age,
        education: formData.educationLevel
      });

      if (result.success && detectedNeeds) {
        onComplete(formData, detectedNeeds);
      }
    } catch (error) {
      console.error('Error en registro:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="h-10 w-10 text-white" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Información Personal</h2>
        <p className="text-gray-600">Comencemos con tus datos básicos</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Nombre</label>
          <input
            type="text"
            value={formData.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Tu nombre"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Apellido</label>
          <input
            type="text"
            value={formData.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Tu apellido"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="tu@email.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Edad</label>
          <select
            value={formData.age}
            onChange={(e) => handleInputChange('age', e.target.value)}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Selecciona tu edad</option>
            <option value="5-12">5-12 años</option>
            <option value="13-17">13-17 años</option>
            <option value="18-25">18-25 años</option>
            <option value="26-35">26-35 años</option>
            <option value="36-50">36-50 años</option>
            <option value="50+">50+ años</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-20 h-20 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="h-10 w-10 text-white" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Seguridad</h2>
        <p className="text-gray-600">Crea una contraseña segura</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Contraseña</label>
          <div className="relative">
            <input
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 pr-10"
              placeholder="Mínimo 8 caracteres"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Confirmar Contraseña</label>
          <div className="relative">
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 pr-10"
              placeholder="Repite tu contraseña"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Globe className="h-10 w-10 text-white" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Contexto Cultural</h2>
        <p className="text-gray-600">Ayúdanos a adaptar el contenido a tu cultura</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Región</label>
          <select
            value={formData.region}
            onChange={(e) => handleInputChange('region', e.target.value)}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Selecciona tu región</option>
            <option value="yucatan">Yucatán</option>
            <option value="oaxaca">Oaxaca</option>
            <option value="chiapas">Chiapas</option>
            <option value="guerrero">Guerrero</option>
            <option value="puebla">Puebla</option>
            <option value="otro">Otra región</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Fondo Cultural</label>
          <select
            value={formData.culturalBackground}
            onChange={(e) => handleInputChange('culturalBackground', e.target.value)}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Selecciona tu cultura</option>
            <option value="maya">Maya</option>
            <option value="náhuatl">Náhuatl</option>
            <option value="zapoteco">Zapoteco</option>
            <option value="mixteco">Mixteco</option>
            <option value="otro">Otro</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Nivel Educativo</label>
          <select
            value={formData.educationLevel}
            onChange={(e) => handleInputChange('educationLevel', e.target.value)}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Selecciona tu nivel</option>
            <option value="primaria">Primaria</option>
            <option value="secundaria">Secundaria</option>
            <option value="preparatoria">Preparatoria</option>
            <option value="universidad">Universidad</option>
            <option value="otro">Otro</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Experiencia Previa</label>
          <select
            value={formData.previousExperience}
            onChange={(e) => handleInputChange('previousExperience', e.target.value)}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Selecciona tu experiencia</option>
            <option value="ninguna">Ninguna</option>
            <option value="básica">Básica</option>
            <option value="intermedia">Intermedia</option>
            <option value="avanzada">Avanzada</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-20 h-20 bg-gradient-to-r from-orange-600 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Zap className="h-10 w-10 text-white" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Accesibilidad</h2>
        <p className="text-gray-600">Personaliza la experiencia según tus necesidades</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Volume2 className="h-5 w-5" />
              Necesidades de Audio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                'Lector de pantalla',
                'Subtítulos automáticos',
                'Descripción de audio',
                'Control por voz'
              ].map((need) => (
                <label key={need} className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.accessibilityNeeds.includes(need.toLowerCase().replace(' ', '_'))}
                    onChange={(e) => {
                      const needs = e.target.checked
                        ? [...formData.accessibilityNeeds, need.toLowerCase().replace(' ', '_')]
                        : formData.accessibilityNeeds.filter(n => n !== need.toLowerCase().replace(' ', '_'));
                      handleInputChange('accessibilityNeeds', needs);
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm">{need}</span>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Necesidades Visuales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                'Alto contraste',
                'Texto grande',
                'Reducir movimiento',
                'Navegación por teclado'
              ].map((need) => (
                <label key={need} className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.accessibilityNeeds.includes(need.toLowerCase().replace(' ', '_'))}
                    onChange={(e) => {
                      const needs = e.target.checked
                        ? [...formData.accessibilityNeeds, need.toLowerCase().replace(' ', '_')]
                        : formData.accessibilityNeeds.filter(n => n !== need.toLowerCase().replace(' ', '_'));
                      handleInputChange('accessibilityNeeds', needs);
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm">{need}</span>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-20 h-20 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Target className="h-10 w-10 text-white" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Objetivos de Aprendizaje</h2>
        <p className="text-gray-600">¿Qué te gustaría aprender?</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          'Mejorar lectura y escritura',
          'Aprender matemáticas',
          'Desarrollar habilidades digitales',
          'Conocer mi cultura',
          'Preparar para exámenes',
          'Aprender un oficio',
          'Mejorar comunicación',
          'Desarrollar creatividad'
        ].map((goal) => (
          <label key={goal} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
            <input
              type="checkbox"
              checked={formData.learningGoals.includes(goal)}
              onChange={(e) => {
                const goals = e.target.checked
                  ? [...formData.learningGoals, goal]
                  : formData.learningGoals.filter(g => g !== goal);
                handleInputChange('learningGoals', goals);
              }}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm">{goal}</span>
          </label>
        ))}
      </div>
    </div>
  );

  const renderStep6 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-20 h-20 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Brain className="h-10 w-10 text-white" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Análisis Inteligente</h2>
        <p className="text-gray-600">Detectando tus necesidades automáticamente</p>
      </div>

      {isLoading ? (
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-600" />
          <p className="text-gray-600">Analizando tus preferencias...</p>
          <Progress value={75} className="w-full" />
        </div>
      ) : detectedNeeds ? (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Necesidades Detectadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Estilo de Aprendizaje</h4>
                  <Badge variant="outline" className="capitalize">
                    {detectedNeeds.learningStyle}
                  </Badge>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Nivel de Accesibilidad</h4>
                  <Badge variant="outline" className="capitalize">
                    {detectedNeeds.accessibilityLevel}
                  </Badge>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Adaptación Cultural</h4>
                  <Badge variant={detectedNeeds.culturalAdaptation ? "default" : "secondary"}>
                    {detectedNeeds.culturalAdaptation ? "Activada" : "No requerida"}
                  </Badge>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Confianza del Análisis</h4>
                  <Badge variant="outline">
                    {Math.round(detectedNeeds.confidence * 100)}%
                  </Badge>
                </div>
              </div>

              {detectedNeeds.specialNeeds.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Necesidades Especiales Detectadas</h4>
                  <div className="flex flex-wrap gap-2">
                    {detectedNeeds.specialNeeds.map((need) => (
                      <Badge key={need} variant="secondary">
                        {need.replace('_', ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="text-center">
            <Button 
              onClick={handleSubmit}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Completando Registro...
                </>
              ) : (
                <>
                  Completar Registro
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );

  const steps = [
    { id: 1, title: 'Personal', component: renderStep1() },
    { id: 2, title: 'Seguridad', component: renderStep2() },
    { id: 3, title: 'Cultural', component: renderStep3() },
    { id: 4, title: 'Accesibilidad', component: renderStep4() },
    { id: 5, title: 'Objetivos', component: renderStep5() },
    { id: 6, title: 'Análisis', component: renderStep6() }
  ];

  const currentStepData = steps.find(step => step.id === currentStep);

  return (
    <div className={`max-w-2xl mx-auto ${className}`}>
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

      {/* Navigation */}
      {currentStep < totalSteps && (
        <div className="flex justify-between mt-6">
          <Button 
            variant="outline" 
            onClick={handlePreviousStep}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Anterior
          </Button>
          <Button 
            onClick={handleNextStep}
            disabled={currentStep === totalSteps}
          >
            Siguiente
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};
