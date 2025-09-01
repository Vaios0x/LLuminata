'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  Eye, 
  Ear, 
  Hand, 
  Heart, 
  Globe, 
  Settings, 
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Info,
  Sparkles,
  Palette,
  Volume2,
  Type,
  Zap
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useScreenReader } from '@/components/accessibility/screen-reader';
import { useHighContrast } from '@/components/accessibility/high-contrast';

interface AdaptiveProfile {
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
  accessibilityNeeds: {
    visual: boolean;
    auditory: boolean;
    motor: boolean;
    cognitive: boolean;
  };
  culturalBackground: string;
  languagePreference: string;
  difficultyLevel: number;
  pacePreference: 'slow' | 'normal' | 'fast';
  interactionStyle: 'guided' | 'exploratory' | 'collaborative';
}

interface ContentAdaptation {
  type: 'text' | 'image' | 'video' | 'audio' | 'interactive';
  originalContent: any;
  adaptations: {
    visual?: any;
    auditory?: any;
    simplified?: any;
    cultural?: any;
    interactive?: any;
  };
  accessibility: {
    screenReader: boolean;
    highContrast: boolean;
    keyboardNavigation: boolean;
    audioDescription: boolean;
    subtitles: boolean;
  };
}

interface AdaptiveContentProps {
  content: ContentAdaptation;
  onAdaptationChange?: (adaptation: any) => void;
  onAccessibilityToggle?: (feature: string, enabled: boolean) => void;
  className?: string;
}

export default function AdaptiveContent({
  content,
  onAdaptationChange,
  onAccessibilityToggle,
  className = ''
}: AdaptiveContentProps) {
  const { user } = useAuth();
  const { speak, isEnabled: screenReaderEnabled } = useScreenReader();
  const { getStyles } = useHighContrast();

  const [userProfile, setUserProfile] = useState<AdaptiveProfile | null>(null);
  const [currentAdaptation, setCurrentAdaptation] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [adaptationQuality, setAdaptationQuality] = useState(0);
  const [showAdaptationPanel, setShowAdaptationPanel] = useState(false);

  useEffect(() => {
    loadUserProfile();
  }, []);

  useEffect(() => {
    if (content && userProfile) {
      generateAdaptation();
    }
  }, [content, userProfile]);

  const loadUserProfile = async () => {
    try {
      // En producción, esto vendría de la API
      const mockProfile: AdaptiveProfile = {
        learningStyle: 'visual',
        accessibilityNeeds: {
          visual: false,
          auditory: false,
          motor: false,
          cognitive: false
        },
        culturalBackground: 'maya',
        languagePreference: 'español',
        difficultyLevel: 3,
        pacePreference: 'normal',
        interactionStyle: 'guided'
      };
      setUserProfile(mockProfile);
    } catch (error) {
      console.error('Error cargando perfil adaptativo:', error);
    }
  };

  const generateAdaptation = useCallback(async () => {
    if (!content || !userProfile) return;

    setIsAnalyzing(true);
    try {
      // Simular análisis de IA para adaptación
      await new Promise(resolve => setTimeout(resolve, 1000));

      const adaptation = {
        ...content.originalContent,
        adaptations: {
          visual: userProfile.learningStyle === 'visual' ? content.adaptations.visual : null,
          auditory: userProfile.learningStyle === 'auditory' ? content.adaptations.auditory : null,
          simplified: userProfile.difficultyLevel < 3 ? content.adaptations.simplified : null,
          cultural: content.adaptations.cultural,
          interactive: userProfile.interactionStyle === 'exploratory' ? content.adaptations.interactive : null
        }
      };

      setCurrentAdaptation(adaptation);
      setAdaptationQuality(calculateAdaptationQuality(adaptation, userProfile));
      onAdaptationChange?.(adaptation);
    } catch (error) {
      console.error('Error generando adaptación:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [content, userProfile, onAdaptationChange]);

  const calculateAdaptationQuality = (adaptation: any, profile: AdaptiveProfile): number => {
    let quality = 0;
    let factors = 0;

    // Evaluar adaptación de estilo de aprendizaje
    if (profile.learningStyle === 'visual' && adaptation.adaptations.visual) {
      quality += 25;
    }
    if (profile.learningStyle === 'auditory' && adaptation.adaptations.auditory) {
      quality += 25;
    }
    factors++;

    // Evaluar adaptación cultural
    if (adaptation.adaptations.cultural) {
      quality += 20;
    }
    factors++;

    // Evaluar accesibilidad
    const accessibilityScore = Object.values(content.accessibility).filter(Boolean).length;
    quality += (accessibilityScore / 5) * 25;
    factors++;

    // Evaluar nivel de dificultad
    if (profile.difficultyLevel < 3 && adaptation.adaptations.simplified) {
      quality += 15;
    } else if (profile.difficultyLevel >= 3 && !adaptation.adaptations.simplified) {
      quality += 15;
    }
    factors++;

    return Math.round(quality / factors);
  };

  const handleAccessibilityToggle = (feature: string, enabled: boolean) => {
    onAccessibilityToggle?.(feature, enabled);
  };

  const renderContent = () => {
    if (!currentAdaptation) {
      return (
        <div className="text-center py-8">
          <RefreshCw className="h-8 w-8 text-gray-400 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Adaptando contenido...</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {/* Contenido principal adaptado */}
        <div className="bg-white rounded-lg p-6 border">
          <div className="prose max-w-none">
            {currentAdaptation.adaptations.visual && (
              <div className="mb-4">
                <img 
                  src={currentAdaptation.adaptations.visual} 
                  alt="Contenido visual adaptado"
                  className="w-full rounded-lg"
                />
              </div>
            )}
            
            <div className="text-lg leading-relaxed">
              {currentAdaptation.adaptations.simplified || currentAdaptation.originalContent}
            </div>

            {currentAdaptation.adaptations.auditory && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Volume2 className="h-5 w-5 text-blue-600" />
                  <span className="font-medium">Versión Auditiva</span>
                </div>
                <audio controls className="w-full">
                  <source src={currentAdaptation.adaptations.auditory} type="audio/mpeg" />
                </audio>
              </div>
            )}

            {currentAdaptation.adaptations.interactive && (
              <div className="mt-4 p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-5 w-5 text-green-600" />
                  <span className="font-medium">Actividad Interactiva</span>
                </div>
                <div className="bg-white p-4 rounded border">
                  {currentAdaptation.adaptations.interactive}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Adaptaciones culturales */}
        {currentAdaptation.adaptations.cultural && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Contexto Cultural
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="h-4 w-4 text-yellow-600" />
                  <span className="font-medium">Adaptación Cultural</span>
                </div>
                <p className="text-sm text-gray-700">
                  {currentAdaptation.adaptations.cultural}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  return (
    <div className={`space-y-6 ${className}`} style={getStyles()}>
      {/* Panel de control de adaptación */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Contenido Adaptativo
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-blue-600">
                {adaptationQuality}% Adaptado
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAdaptationPanel(!showAdaptationPanel)}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        {showAdaptationPanel && (
          <CardContent>
            <div className="space-y-4">
              {/* Perfil del usuario */}
              {userProfile && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Eye className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium">Estilo de Aprendizaje</span>
                    </div>
                    <Badge variant="outline">
                      {userProfile.learningStyle === 'visual' ? 'Visual' : 
                       userProfile.learningStyle === 'auditory' ? 'Auditivo' :
                       userProfile.learningStyle === 'kinesthetic' ? 'Kinestésico' : 'Lectura'}
                    </Badge>
                  </div>
                  
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Globe className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">Contexto Cultural</span>
                    </div>
                    <Badge variant="outline">{userProfile.culturalBackground}</Badge>
                  </div>
                  
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="h-4 w-4 text-purple-600" />
                      <span className="text-sm font-medium">Nivel de Dificultad</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={(userProfile.difficultyLevel / 5) * 100} className="flex-1" />
                      <span className="text-sm font-medium">{userProfile.difficultyLevel}/5</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Controles de accesibilidad */}
              <div>
                <h4 className="font-medium mb-3">Características de Accesibilidad</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {Object.entries(content.accessibility).map(([feature, enabled]) => (
                    <Button
                      key={feature}
                      variant={enabled ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleAccessibilityToggle(feature, !enabled)}
                      className="justify-start"
                    >
                      {feature === 'screenReader' && <Eye className="h-4 w-4 mr-2" />}
                      {feature === 'highContrast' && <Palette className="h-4 w-4 mr-2" />}
                      {feature === 'keyboardNavigation' && <Type className="h-4 w-4 mr-2" />}
                      {feature === 'audioDescription' && <Volume2 className="h-4 w-4 mr-2" />}
                      {feature === 'subtitles' && <Ear className="h-4 w-4 mr-2" />}
                      {feature === 'screenReader' ? 'Lector Pantalla' :
                       feature === 'highContrast' ? 'Alto Contraste' :
                       feature === 'keyboardNavigation' ? 'Teclado' :
                       feature === 'audioDescription' ? 'Audio Descripción' :
                       feature === 'subtitles' ? 'Subtítulos' : feature}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Calidad de adaptación */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Calidad de Adaptación</span>
                  <span className="text-sm text-gray-600">{adaptationQuality}%</span>
                </div>
                <Progress value={adaptationQuality} className="mb-2" />
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  {adaptationQuality >= 80 ? (
                    <>
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      <span>Excelente adaptación</span>
                    </>
                  ) : adaptationQuality >= 60 ? (
                    <>
                      <Info className="h-3 w-3 text-yellow-600" />
                      <span>Buena adaptación</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-3 w-3 text-red-600" />
                      <span>Necesita mejora</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Contenido adaptado */}
      {isAnalyzing ? (
        <div className="text-center py-8">
          <RefreshCw className="h-8 w-8 text-blue-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Analizando y adaptando contenido...</p>
        </div>
      ) : (
        renderContent()
      )}
    </div>
  );
}
