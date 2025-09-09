'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Eye,
  Ear,
  Hand,
  Brain,
  Heart,
  Zap,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Volume2,
  VolumeX,
  Monitor,
  Smartphone,
  Tablet,
  Settings,
  Palette,
  Type,
  MousePointer,
  Keyboard,
  Mic,
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Maximize,
  Minimize,
  Sun,
  Moon,
  Contrast,
  Accessibility,
  Shield,
  Award,
  Sparkles,
  Clock,
  Globe
} from 'lucide-react';
import { useScreenReader } from '@/components/accessibility/screen-reader';
import { useHighContrast } from '@/components/accessibility/high-contrast';
import { useVoiceControl } from '@/components/accessibility/voice-control';

interface AccessibilityConfigurationProps {
  onComplete: (config: AccessibilityConfig) => void;
  detectedNeeds: any;
  className?: string;
}

interface AccessibilityConfig {
  visual: VisualSettings;
  auditory: AuditorySettings;
  motor: MotorSettings;
  cognitive: CognitiveSettings;
  cultural: CulturalSettings;
  device: DeviceSettings;
  preferences: UserPreferences;
}

interface VisualSettings {
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  contrast: 'normal' | 'high' | 'very-high';
  colorBlindness: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  reduceMotion: boolean;
  cursorSize: 'normal' | 'large' | 'extra-large';
  focusIndicator: 'normal' | 'high' | 'very-high';
  lineSpacing: 'normal' | 'increased' | 'extra-increased';
}

interface AuditorySettings {
  screenReader: boolean;
  audioDescriptions: boolean;
  captions: boolean;
  audioSpeed: 'slow' | 'normal' | 'fast';
  volume: number;
  audioFeedback: boolean;
  voiceCommands: boolean;
}

interface MotorSettings {
  keyboardNavigation: boolean;
  voiceControl: boolean;
  gestureControl: boolean;
  clickAssist: boolean;
  hoverDelay: number;
  scrollAssist: boolean;
  touchTargets: 'normal' | 'large' | 'extra-large';
}

interface CognitiveSettings {
  simplifiedInterface: boolean;
  stepByStep: boolean;
  reminders: boolean;
  timeLimit: 'none' | 'flexible' | 'extended';
  distractionFree: boolean;
  progressIndicators: boolean;
  helpAlwaysVisible: boolean;
}

interface CulturalSettings {
  language: string;
  culturalContext: string;
  examples: 'universal' | 'local' | 'mixed';
  traditions: boolean;
  localPerspectives: boolean;
}

interface DeviceSettings {
  deviceType: 'desktop' | 'tablet' | 'mobile';
  orientation: 'auto' | 'portrait' | 'landscape';
  responsiveDesign: boolean;
  offlineMode: boolean;
  syncPreferences: boolean;
}

interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  notifications: boolean;
  autoSave: boolean;
  accessibilityShortcuts: boolean;
  quickSettings: boolean;
}

export const AccessibilityConfiguration: React.FC<AccessibilityConfigurationProps> = ({
  onComplete,
  detectedNeeds,
  className
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [config, setConfig] = useState<AccessibilityConfig>({
    visual: {
      fontSize: 'medium',
      contrast: 'normal',
      colorBlindness: 'none',
      reduceMotion: false,
      cursorSize: 'normal',
      focusIndicator: 'normal',
      lineSpacing: 'normal'
    },
    auditory: {
      screenReader: false,
      audioDescriptions: false,
      captions: false,
      audioSpeed: 'normal',
      volume: 50,
      audioFeedback: false,
      voiceCommands: false
    },
    motor: {
      keyboardNavigation: false,
      voiceControl: false,
      gestureControl: false,
      clickAssist: false,
      hoverDelay: 0,
      scrollAssist: false,
      touchTargets: 'normal'
    },
    cognitive: {
      simplifiedInterface: false,
      stepByStep: false,
      reminders: false,
      timeLimit: 'none',
      distractionFree: false,
      progressIndicators: true,
      helpAlwaysVisible: false
    },
    cultural: {
      language: 'es-MX',
      culturalContext: 'universal',
      examples: 'mixed',
      traditions: false,
      localPerspectives: false
    },
    device: {
      deviceType: 'desktop',
      orientation: 'auto',
      responsiveDesign: true,
      offlineMode: false,
      syncPreferences: true
    },
    preferences: {
      theme: 'auto',
      notifications: true,
      autoSave: true,
      accessibilityShortcuts: true,
      quickSettings: true
    }
  });

  const { speak, isEnabled: screenReaderEnabled } = useScreenReader();
  const { getStyles, toggle: toggleHighContrast } = useHighContrast();
  const { startListening, isSupported } = useVoiceControl();

  const totalSteps = 7;

  useEffect(() => {
    // Aplicar configuraciones automáticamente basadas en necesidades detectadas
    if (detectedNeeds) {
      applyDetectedNeeds();
    }
  }, [detectedNeeds]);

  const applyDetectedNeeds = () => {
    const newConfig = { ...config };

    // Aplicar necesidades visuales
    if (detectedNeeds.specialNeeds?.some((need: any) => need.type === 'dislexia')) {
      newConfig.visual.fontSize = 'large';
      newConfig.visual.lineSpacing = 'increased';
      newConfig.visual.focusIndicator = 'high';
    }

    if (detectedNeeds.specialNeeds?.some((need: any) => need.type === 'visual_impairment')) {
      newConfig.visual.fontSize = 'extra-large';
      newConfig.visual.contrast = 'high';
      newConfig.auditory.screenReader = true;
    }

    // Aplicar necesidades auditivas
    if (detectedNeeds.specialNeeds?.some((need: any) => need.type === 'hearing_impairment')) {
      newConfig.auditory.captions = true;
      newConfig.auditory.audioDescriptions = true;
    }

    // Aplicar necesidades motoras
    if (detectedNeeds.specialNeeds?.some((need: any) => need.type === 'motor_impairment')) {
      newConfig.motor.keyboardNavigation = true;
      newConfig.motor.voiceControl = true;
      newConfig.motor.touchTargets = 'large';
    }

    // Aplicar necesidades cognitivas
    if (detectedNeeds.specialNeeds?.some((need: any) => need.type === 'tdah')) {
      newConfig.cognitive.simplifiedInterface = true;
      newConfig.cognitive.distractionFree = true;
      newConfig.cognitive.timeLimit = 'flexible';
    }

    setConfig(newConfig);
  };

  const updateConfig = (section: keyof AccessibilityConfig, key: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
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

  const handleComplete = async () => {
    setIsLoading(true);
    
    try {
      // Aplicar configuraciones
      if (config.visual.contrast !== 'normal') {
        if (config.visual.contrast === 'high') {
          toggleHighContrast();
        }
      }

      if (config.motor.voiceControl) {
        if (isSupported) {
          startListening();
        }
      }

      // Simular guardado
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      onComplete(config);
      
      if (screenReaderEnabled) {
        speak('Configuración de accesibilidad completada');
      }
    } catch (error) {
      console.error('Error aplicando configuración:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="text-center space-y-6">
      <div className="w-24 h-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
        <Accessibility className="h-12 w-12 text-white" />
      </div>
      
      <h2 className="text-3xl font-bold text-gray-900">
        Configuración de Accesibilidad
      </h2>
      
      <p className="text-lg text-gray-600 max-w-2xl mx-auto">
        Personaliza la experiencia según tus necesidades específicas. 
        Hemos detectado algunas configuraciones recomendadas para ti.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        <div className="p-4 bg-blue-50 rounded-lg">
          <Eye className="h-8 w-8 text-blue-600 mx-auto mb-2" />
          <h3 className="font-semibold text-blue-900">Visual</h3>
          <p className="text-sm text-blue-700">Tamaño, contraste y colores</p>
        </div>
        <div className="p-4 bg-green-50 rounded-lg">
          <Ear className="h-8 w-8 text-green-600 mx-auto mb-2" />
          <h3 className="font-semibold text-green-900">Auditiva</h3>
          <p className="text-sm text-green-700">Audio y lectores de pantalla</p>
        </div>
        <div className="p-4 bg-purple-50 rounded-lg">
          <Hand className="h-8 w-8 text-purple-600 mx-auto mb-2" />
          <h3 className="font-semibold text-purple-900">Motora</h3>
          <p className="text-sm text-purple-700">Navegación y control</p>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Configuración Visual
        </h2>
        <p className="text-gray-600">
          Ajusta el tamaño, contraste y otros aspectos visuales
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Type className="h-5 w-5" />
              Tamaño de Texto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { value: 'small', label: 'Pequeño', size: 'text-sm' },
                { value: 'medium', label: 'Mediano', size: 'text-base' },
                { value: 'large', label: 'Grande', size: 'text-lg' },
                { value: 'extra-large', label: 'Extra Grande', size: 'text-xl' }
              ].map((option) => (
                <label key={option.value} className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="fontSize"
                    value={option.value}
                    checked={config.visual.fontSize === option.value}
                    onChange={(e) => updateConfig('visual', 'fontSize', e.target.value)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className={`${option.size} capitalize`}>{option.label}</span>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Contrast className="h-5 w-5" />
              Contraste
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { value: 'normal', label: 'Normal' },
                { value: 'high', label: 'Alto' },
                { value: 'very-high', label: 'Muy Alto' }
              ].map((option) => (
                <label key={option.value} className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="contrast"
                    value={option.value}
                    checked={config.visual.contrast === option.value}
                    onChange={(e) => updateConfig('visual', 'contrast', e.target.value)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm capitalize">{option.label}</span>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Daltonismo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { value: 'none', label: 'Ninguno' },
                { value: 'protanopia', label: 'Protanopía (Rojo-Verde)' },
                { value: 'deuteranopia', label: 'Deuteranopía (Verde-Rojo)' },
                { value: 'tritanopia', label: 'Tritanopía (Azul-Amarillo)' }
              ].map((option) => (
                <label key={option.value} className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="colorBlindness"
                    value={option.value}
                    checked={config.visual.colorBlindness === option.value}
                    onChange={(e) => updateConfig('visual', 'colorBlindness', e.target.value)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm">{option.label}</span>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Opciones Adicionales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <label className="flex items-center justify-between">
                <span className="text-sm">Reducir movimiento</span>
                <input
                  type="checkbox"
                  checked={config.visual.reduceMotion}
                  onChange={(e) => updateConfig('visual', 'reduceMotion', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </label>
              <label className="flex items-center justify-between">
                <span className="text-sm">Cursor grande</span>
                <input
                  type="checkbox"
                  checked={config.visual.cursorSize !== 'normal'}
                  onChange={(e) => updateConfig('visual', 'cursorSize', e.target.checked ? 'large' : 'normal')}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </label>
              <label className="flex items-center justify-between">
                <span className="text-sm">Espaciado de líneas</span>
                <input
                  type="checkbox"
                  checked={config.visual.lineSpacing !== 'normal'}
                  onChange={(e) => updateConfig('visual', 'lineSpacing', e.target.checked ? 'increased' : 'normal')}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </label>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Configuración Auditiva
        </h2>
        <p className="text-gray-600">
          Ajusta el audio, lectores de pantalla y subtítulos
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Volume2 className="h-5 w-5" />
              Lectores de Pantalla
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <label className="flex items-center justify-between">
                <span className="text-sm">Habilitar lector de pantalla</span>
                <input
                  type="checkbox"
                  checked={config.auditory.screenReader}
                  onChange={(e) => updateConfig('auditory', 'screenReader', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </label>
              <label className="flex items-center justify-between">
                <span className="text-sm">Descripciones de audio</span>
                <input
                  type="checkbox"
                  checked={config.auditory.audioDescriptions}
                  onChange={(e) => updateConfig('auditory', 'audioDescriptions', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </label>
              <label className="flex items-center justify-between">
                <span className="text-sm">Subtítulos automáticos</span>
                <input
                  type="checkbox"
                  checked={config.auditory.captions}
                  onChange={(e) => updateConfig('auditory', 'captions', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mic className="h-5 w-5" />
              Control por Voz
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <label className="flex items-center justify-between">
                <span className="text-sm">Comandos de voz</span>
                <input
                  type="checkbox"
                  checked={config.auditory.voiceCommands}
                  onChange={(e) => updateConfig('auditory', 'voiceCommands', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </label>
              <label className="flex items-center justify-between">
                <span className="text-sm">Retroalimentación de audio</span>
                <input
                  type="checkbox"
                  checked={config.auditory.audioFeedback}
                  onChange={(e) => updateConfig('auditory', 'audioFeedback', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </label>
              <div>
                <label className="block text-sm font-medium mb-2">Velocidad del audio</label>
                <select
                  value={config.auditory.audioSpeed}
                  onChange={(e) => updateConfig('auditory', 'audioSpeed', e.target.value)}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="slow">Lenta</option>
                  <option value="normal">Normal</option>
                  <option value="fast">Rápida</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Configuración Motora
        </h2>
        <p className="text-gray-600">
          Ajusta la navegación y control del dispositivo
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Keyboard className="h-5 w-5" />
              Navegación
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <label className="flex items-center justify-between">
                <span className="text-sm">Navegación por teclado</span>
                <input
                  type="checkbox"
                  checked={config.motor.keyboardNavigation}
                  onChange={(e) => updateConfig('motor', 'keyboardNavigation', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </label>
              <label className="flex items-center justify-between">
                <span className="text-sm">Control por voz</span>
                <input
                  type="checkbox"
                  checked={config.motor.voiceControl}
                  onChange={(e) => updateConfig('motor', 'voiceControl', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </label>
              <label className="flex items-center justify-between">
                <span className="text-sm">Control por gestos</span>
                <input
                  type="checkbox"
                  checked={config.motor.gestureControl}
                  onChange={(e) => updateConfig('motor', 'gestureControl', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MousePointer className="h-5 w-5" />
              Asistencia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <label className="flex items-center justify-between">
                <span className="text-sm">Asistencia de clic</span>
                <input
                  type="checkbox"
                  checked={config.motor.clickAssist}
                  onChange={(e) => updateConfig('motor', 'clickAssist', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </label>
              <label className="flex items-center justify-between">
                <span className="text-sm">Asistencia de scroll</span>
                <input
                  type="checkbox"
                  checked={config.motor.scrollAssist}
                  onChange={(e) => updateConfig('motor', 'scrollAssist', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </label>
              <div>
                <label className="block text-sm font-medium mb-2">Tamaño de objetivos táctiles</label>
                <select
                  value={config.motor.touchTargets}
                  onChange={(e) => updateConfig('motor', 'touchTargets', e.target.value)}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="normal">Normal</option>
                  <option value="large">Grande</option>
                  <option value="extra-large">Extra Grande</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Configuración Cognitiva
        </h2>
        <p className="text-gray-600">
          Ajusta la interfaz para facilitar la comprensión
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Interfaz
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <label className="flex items-center justify-between">
                <span className="text-sm">Interfaz simplificada</span>
                <input
                  type="checkbox"
                  checked={config.cognitive.simplifiedInterface}
                  onChange={(e) => updateConfig('cognitive', 'simplifiedInterface', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </label>
              <label className="flex items-center justify-between">
                <span className="text-sm">Modo sin distracciones</span>
                <input
                  type="checkbox"
                  checked={config.cognitive.distractionFree}
                  onChange={(e) => updateConfig('cognitive', 'distractionFree', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </label>
              <label className="flex items-center justify-between">
                <span className="text-sm">Indicadores de progreso</span>
                <input
                  type="checkbox"
                  checked={config.cognitive.progressIndicators}
                  onChange={(e) => updateConfig('cognitive', 'progressIndicators', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Tiempo y Ayuda
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <label className="flex items-center justify-between">
                <span className="text-sm">Recordatorios</span>
                <input
                  type="checkbox"
                  checked={config.cognitive.reminders}
                  onChange={(e) => updateConfig('cognitive', 'reminders', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </label>
              <label className="flex items-center justify-between">
                <span className="text-sm">Ayuda siempre visible</span>
                <input
                  type="checkbox"
                  checked={config.cognitive.helpAlwaysVisible}
                  onChange={(e) => updateConfig('cognitive', 'helpAlwaysVisible', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </label>
              <div>
                <label className="block text-sm font-medium mb-2">Límite de tiempo</label>
                <select
                  value={config.cognitive.timeLimit}
                  onChange={(e) => updateConfig('cognitive', 'timeLimit', e.target.value)}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="none">Sin límite</option>
                  <option value="flexible">Flexible</option>
                  <option value="extended">Extendido</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderStep6 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Configuración Cultural
        </h2>
        <p className="text-gray-600">
          Personaliza el contenido según tu contexto cultural
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Idioma y Cultura
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Idioma principal</label>
                <select
                  value={config.cultural.language}
                  onChange={(e) => updateConfig('cultural', 'language', e.target.value)}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="es-MX">Español (México)</option>
                  <option value="es-GT">Español (Guatemala)</option>
                  <option value="maya">Maya</option>
                  <option value="náhuatl">Náhuatl</option>
                  <option value="zapoteco">Zapoteco</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Contexto cultural</label>
                <select
                  value={config.cultural.culturalContext}
                  onChange={(e) => updateConfig('cultural', 'culturalContext', e.target.value)}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="universal">Universal</option>
                  <option value="local">Local</option>
                  <option value="mixed">Mixto</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Elementos Culturales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <label className="flex items-center justify-between">
                <span className="text-sm">Incluir tradiciones</span>
                <input
                  type="checkbox"
                  checked={config.cultural.traditions}
                  onChange={(e) => updateConfig('cultural', 'traditions', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </label>
              <label className="flex items-center justify-between">
                <span className="text-sm">Perspectivas locales</span>
                <input
                  type="checkbox"
                  checked={config.cultural.localPerspectives}
                  onChange={(e) => updateConfig('cultural', 'localPerspectives', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </label>
              <div>
                <label className="block text-sm font-medium mb-2">Tipo de ejemplos</label>
                <select
                  value={config.cultural.examples}
                  onChange={(e) => updateConfig('cultural', 'examples', e.target.value)}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="universal">Universales</option>
                  <option value="local">Locales</option>
                  <option value="mixed">Mixtos</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderStep7 = () => (
    <div className="text-center space-y-6">
      <div className="w-24 h-24 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="h-12 w-12 text-white" />
      </div>
      
      <h2 className="text-3xl font-bold text-gray-900">
        ¡Configuración Completada!
      </h2>
      
      <p className="text-lg text-gray-600 max-w-2xl mx-auto">
        Tu configuración de accesibilidad personalizada está lista. 
        Estas configuraciones se aplicarán automáticamente a tu experiencia.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        <div className="p-4 bg-green-50 rounded-lg">
          <Eye className="h-8 w-8 text-green-600 mx-auto mb-2" />
          <h3 className="font-semibold text-green-900">Visual</h3>
          <p className="text-sm text-green-700">Configurado según tus necesidades</p>
        </div>
        <div className="p-4 bg-blue-50 rounded-lg">
          <Ear className="h-8 w-8 text-blue-600 mx-auto mb-2" />
          <h3 className="font-semibold text-blue-900">Auditiva</h3>
          <p className="text-sm text-blue-700">Audio y lectores configurados</p>
        </div>
        <div className="p-4 bg-purple-50 rounded-lg">
          <Hand className="h-8 w-8 text-purple-600 mx-auto mb-2" />
          <h3 className="font-semibold text-purple-900">Motora</h3>
          <p className="text-sm text-purple-700">Navegación optimizada</p>
        </div>
      </div>

      <div className="text-center">
        <Button 
          onClick={handleComplete}
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Aplicando Configuración...
            </>
          ) : (
            <>
              Aplicar Configuración
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );

  const steps = [
    { id: 1, title: 'Introducción', component: renderStep1() },
    { id: 2, title: 'Visual', component: renderStep2() },
    { id: 3, title: 'Auditiva', component: renderStep3() },
    { id: 4, title: 'Motora', component: renderStep4() },
    { id: 5, title: 'Cognitiva', component: renderStep5() },
    { id: 6, title: 'Cultural', component: renderStep6() },
    { id: 7, title: 'Completado', component: renderStep7() }
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

      {/* Navigation */}
      {currentStep < totalSteps && currentStep > 1 && (
        <div className="flex justify-between mt-6">
          <Button 
            variant="outline" 
            onClick={handlePreviousStep}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Anterior
          </Button>
          <Button 
            onClick={handleNextStep}
          >
            Siguiente
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};
