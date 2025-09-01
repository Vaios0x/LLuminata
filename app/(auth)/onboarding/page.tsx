'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX,
  Eye,
  EyeOff,
  Globe,
  Users,
  Star,
  BookOpen,
  Target,
  Settings,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Sparkles,
  Heart,
  Zap,
  Shield,
  Award,
  Brain,
  Accessibility,
  UserCheck,
  GraduationCap
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useScreenReader } from '@/components/accessibility/screen-reader';
import { useHighContrast } from '@/components/accessibility/high-contrast';
import { AdaptiveRegistration } from '@/components/onboarding/adaptive-registration';
import { NeedsDetection } from '@/components/onboarding/needs-detection';
import { AccessibilityConfiguration } from '@/components/onboarding/accessibility-configuration';
import { InteractiveTutorial } from '@/components/onboarding/interactive-tutorial';

interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  component: React.ReactNode;
  required: boolean;
  category: 'registration' | 'assessment' | 'configuration' | 'tutorial' | 'completion';
}

interface OnboardingData {
  registrationData: any;
  detectedNeeds: any;
  accessibilityConfig: any;
  tutorialCompleted: boolean;
}

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    registrationData: null,
    detectedNeeds: null,
    accessibilityConfig: null,
    tutorialCompleted: false
  });
  
  const router = useRouter();
  const { user, update } = useAuth();
  const { speak, isEnabled: screenReaderEnabled } = useScreenReader();
  const { getStyles } = useHighContrast();

  const totalSteps = 5;

  useEffect(() => {
    if (screenReaderEnabled) {
      speak(`Sistema de onboarding. Paso ${currentStep} de ${totalSteps}`);
    }
  }, [currentStep, screenReaderEnabled, speak]);

  const handleStepComplete = (stepId: number, data?: any) => {
    setCompletedSteps(prev => new Set([...prev, stepId]));
    
    // Guardar datos específicos del paso
    if (data) {
      setOnboardingData(prev => ({
        ...prev,
        ...data
      }));
    }
    
    if (screenReaderEnabled) {
      speak(`Paso ${stepId} completado`);
    }
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

  const handleFinish = async () => {
    setIsLoading(true);
    try {
      // Actualizar perfil con todos los datos del onboarding
      await update({
        onboardingCompleted: true,
        registrationData: onboardingData.registrationData,
        detectedNeeds: onboardingData.detectedNeeds,
        accessibilityConfig: onboardingData.accessibilityConfig,
        tutorialCompleted: onboardingData.tutorialCompleted
      });
      
      if (screenReaderEnabled) {
        speak('Sistema de onboarding completado. Redirigiendo al dashboard');
      }
      
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Error completando onboarding:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 1: Adaptive Registration
  const RegistrationStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Registro Adaptativo
        </h2>
        <p className="text-gray-600">
          Proceso de registro inteligente que se adapta a tus necesidades
        </p>
      </div>

      <AdaptiveRegistration
        onComplete={(userData, detectedNeeds) => handleStepComplete(1, { 
          registrationData: userData,
          detectedNeeds: detectedNeeds 
        })}
      />
    </div>
  );

  // Step 2: Initial Needs Detection
  const NeedsDetectionStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Detección Inicial de Necesidades
        </h2>
        <p className="text-gray-600">
          Evaluación inteligente para identificar tus necesidades específicas
        </p>
      </div>

      <NeedsDetection
        onComplete={(data) => handleStepComplete(2, { detectedNeeds: data })}
        userData={onboardingData.registrationData}
        className="max-w-4xl mx-auto"
      />
    </div>
  );

  // Step 3: Personalized Accessibility Configuration
  const AccessibilityConfigStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Configuración de Accesibilidad Personalizada
        </h2>
        <p className="text-gray-600">
          Personaliza la experiencia según tus necesidades detectadas
        </p>
      </div>

      <AccessibilityConfiguration
        onComplete={(data) => handleStepComplete(3, { accessibilityConfig: data })}
        detectedNeeds={onboardingData.detectedNeeds}
        className="max-w-4xl mx-auto"
      />
    </div>
  );

  // Step 4: Interactive Tutorial
  const TutorialStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Tutorial Interactivo
        </h2>
        <p className="text-gray-600">
          Aprende a usar la plataforma paso a paso
        </p>
      </div>

      <InteractiveTutorial
        onComplete={() => handleStepComplete(4, { tutorialCompleted: true })}
        userConfig={onboardingData.accessibilityConfig}
        detectedNeeds={onboardingData.detectedNeeds}
        className="max-w-6xl mx-auto"
      />
    </div>
  );

  // Step 5: Completion
  const CompletionStep = () => (
    <div className="text-center space-y-6">
      <div className="w-32 h-32 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
        <Award className="h-16 w-16 text-white" />
      </div>
      
      <h2 className="text-3xl font-bold text-gray-900">
        ¡Sistema de Onboarding Completado!
      </h2>
      
      <p className="text-lg text-gray-600 max-w-2xl mx-auto">
        Has completado exitosamente todo el proceso de onboarding. Tu experiencia 
        personalizada está completamente configurada y lista para comenzar.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
        <div className="p-4 bg-green-50 rounded-lg">
          <UserCheck className="h-8 w-8 text-green-600 mx-auto mb-2" />
          <h3 className="font-semibold text-green-900">Registro Completo</h3>
          <p className="text-sm text-green-700">Datos personales y preferencias</p>
        </div>
        <div className="p-4 bg-blue-50 rounded-lg">
          <Brain className="h-8 w-8 text-blue-600 mx-auto mb-2" />
          <h3 className="font-semibold text-blue-900">Necesidades Detectadas</h3>
          <p className="text-sm text-blue-700">Perfil de aprendizaje personalizado</p>
        </div>
        <div className="p-4 bg-purple-50 rounded-lg">
          <Accessibility className="h-8 w-8 text-purple-600 mx-auto mb-2" />
          <h3 className="font-semibold text-purple-900">Accesibilidad Configurada</h3>
          <p className="text-sm text-purple-700">Herramientas adaptadas a ti</p>
        </div>
        <div className="p-4 bg-orange-50 rounded-lg">
          <GraduationCap className="h-8 w-8 text-orange-600 mx-auto mb-2" />
          <h3 className="font-semibold text-orange-900">Tutorial Completado</h3>
          <p className="text-sm text-orange-700">Conoces la plataforma</p>
        </div>
      </div>

      <div className="bg-yellow-50 p-4 rounded-lg max-w-2xl mx-auto">
        <h4 className="font-medium text-yellow-900 mb-2">🎯 Resumen de tu Configuración</h4>
        <div className="text-sm text-yellow-800 space-y-1 text-left">
          {onboardingData.registrationData && (
            <p>• Registro adaptativo completado con {onboardingData.registrationData.learningGoals?.length || 0} objetivos</p>
          )}
          {onboardingData.detectedNeeds && (
            <p>• Estilo de aprendizaje: {onboardingData.detectedNeeds.learningStyle || 'Mixto'}</p>
          )}
          {onboardingData.accessibilityConfig && (
            <p>• Nivel de accesibilidad: {onboardingData.accessibilityConfig.visual?.fontSize || 'Mediano'}</p>
          )}
          {onboardingData.tutorialCompleted && (
            <p>• Tutorial interactivo completado exitosamente</p>
          )}
        </div>
      </div>

      <div className="flex justify-between max-w-md mx-auto">
        <Button variant="outline" onClick={handlePreviousStep}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Anterior
        </Button>
        <Button 
          onClick={handleFinish}
          disabled={isLoading}
          className="bg-green-600 hover:bg-green-700"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Completando...
            </>
          ) : (
            <>
              Comenzar Experiencia
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );

  const steps: OnboardingStep[] = [
    { 
      id: 1, 
      title: 'Registro Adaptativo', 
      description: 'Proceso de registro inteligente', 
      component: <RegistrationStep />, 
      required: true,
      category: 'registration'
    },
    { 
      id: 2, 
      title: 'Detección de Necesidades', 
      description: 'Evaluación inicial inteligente', 
      component: <NeedsDetectionStep />, 
      required: true,
      category: 'assessment'
    },
    { 
      id: 3, 
      title: 'Configuración de Accesibilidad', 
      description: 'Personalización de accesibilidad', 
      component: <AccessibilityConfigStep />, 
      required: true,
      category: 'configuration'
    },
    { 
      id: 4, 
      title: 'Tutorial Interactivo', 
      description: 'Aprende a usar la plataforma', 
      component: <TutorialStep />, 
      required: false,
      category: 'tutorial'
    },
    { 
      id: 5, 
      title: 'Finalización', 
      description: 'Completar configuración', 
      component: <CompletionStep />, 
      required: true,
      category: 'completion'
    }
  ];

  const currentStepData = steps.find(step => step.id === currentStep);

  const getStepIcon = (category: string) => {
    switch (category) {
      case 'registration':
        return <UserCheck className="h-5 w-5" />;
      case 'assessment':
        return <Brain className="h-5 w-5" />;
      case 'configuration':
        return <Accessibility className="h-5 w-5" />;
      case 'tutorial':
        return <GraduationCap className="h-5 w-5" />;
      case 'completion':
        return <Award className="h-5 w-5" />;
      default:
        return <Star className="h-5 w-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4" style={getStyles()}>
      <div className="w-full max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">AI</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Lluminata</h1>
              <p className="text-sm text-gray-600">Sistema de Onboarding Completo</p>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Paso {currentStep} de {totalSteps}</span>
            <span>{Math.round((currentStep / totalSteps) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
          
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
                  {step.id < currentStep ? <CheckCircle className="h-4 w-4" /> : getStepIcon(step.category)}
                </div>
                <span className="text-xs mt-1 hidden md:block text-center">{step.title}</span>
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

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Puedes cambiar estas configuraciones en cualquier momento desde tu perfil</p>
        </div>
      </div>
    </div>
  );
}
