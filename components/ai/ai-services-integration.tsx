import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Brain, 
  Settings,
  Play,
  Pause,
  RotateCcw,
  Download,
  Upload,
  CheckCircle,
  AlertCircle,
  Info,
  Star,
  Globe,
  Users
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useScreenReader } from '@/components/accessibility/screen-reader';
import { useHighContrastStyles } from '@/components/accessibility/high-contrast';

interface AIServicesIntegrationProps {
  studentId: string;
  language?: string;
  culturalContext?: string;
  className?: string;
}

interface ServiceStatus {
  tts: 'idle' | 'loading' | 'ready' | 'error';
  speechRecognition: 'idle' | 'listening' | 'ready' | 'error';
  needsDetection: 'idle' | 'analyzing' | 'ready' | 'error';
}

interface NeedsAnalysisResult {
  specialNeeds: Array<{
    type: string;
    severity: string;
    confidence: number;
    indicators: string[];
    recommendations: string[];
  }>;
  learningProfile: {
    learningStyle: string;
    pace: string;
    strengths: string[];
    challenges: string[];
  };
  culturalAdaptations: {
    languageSupport: string[];
    culturalRelevance: string[];
  };
}

export const AIServicesIntegration: React.FC<AIServicesIntegrationProps> = ({
  studentId,
  language = 'es-MX',
  culturalContext = 'maya',
  className
}) => {
  const [serviceStatus, setServiceStatus] = useState<ServiceStatus>({
    tts: 'idle',
    speechRecognition: 'idle',
    needsDetection: 'idle'
  });
  
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [needsAnalysis, setNeedsAnalysis] = useState<NeedsAnalysisResult | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [testText, setTestText] = useState('Hola, este es un texto de prueba para la síntesis de voz.');
  
  const { speak, isEnabled: screenReaderEnabled } = useScreenReader();
  const { getStyles } = useHighContrastStyles();

  // Inicializar servicios
  useEffect(() => {
    initializeServices();
  }, [language, culturalContext]);

  const initializeServices = async () => {
    try {
      // Verificar TTS
      const ttsResponse = await fetch('/api/ai/tts');
      if (ttsResponse.ok) {
        setServiceStatus(prev => ({ ...prev, tts: 'ready' }));
      } else {
        setServiceStatus(prev => ({ ...prev, tts: 'error' }));
      }

      // Verificar reconocimiento de voz
      const srResponse = await fetch('/api/ai/speech-recognition');
      if (srResponse.ok) {
        const srData = await srResponse.json();
        if (srData.isSupported) {
          setServiceStatus(prev => ({ ...prev, speechRecognition: 'ready' }));
        } else {
          setServiceStatus(prev => ({ ...prev, speechRecognition: 'error' }));
        }
      } else {
        setServiceStatus(prev => ({ ...prev, speechRecognition: 'error' }));
      }

      // Verificar detección de necesidades
      const ndResponse = await fetch(`/api/ai/needs-detection?studentId=${studentId}`);
      if (ndResponse.ok) {
        setServiceStatus(prev => ({ ...prev, needsDetection: 'ready' }));
      } else {
        setServiceStatus(prev => ({ ...prev, needsDetection: 'error' }));
      }

    } catch (error) {
      console.error('Error inicializando servicios:', error);
      setServiceStatus({
        tts: 'error',
        speechRecognition: 'error',
        needsDetection: 'error'
      });
    }
  };

  // Probar síntesis de voz
  const testTTS = async () => {
    if (!testText.trim()) return;

    setServiceStatus(prev => ({ ...prev, tts: 'loading' }));
    setIsSpeaking(true);

    try {
      const response = await fetch('/api/ai/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: testText,
          language,
          options: {
            culturalContext,
            cache: true
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Reproducir audio
        const audioBlob = new Blob([
          Uint8Array.from(atob(data.audio), c => c.charCodeAt(0))
        ], { type: 'audio/mp3' });
        
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        
        audio.onended = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
        };
        
        audio.play();
        
        if (screenReaderEnabled) {
          speak('Audio generado y reproducido exitosamente');
        }
      } else {
        throw new Error('Error generando audio');
      }
    } catch (error) {
      console.error('Error en TTS:', error);
      setServiceStatus(prev => ({ ...prev, tts: 'error' }));
      setIsSpeaking(false);
      
      if (screenReaderEnabled) {
        speak('Error generando audio');
      }
    }
  };

  // Iniciar reconocimiento de voz
  const startSpeechRecognition = async () => {
    try {
      const response = await fetch('/api/ai/speech-recognition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'start',
          data: {}
        })
      });

      if (response.ok) {
        setIsListening(true);
        setServiceStatus(prev => ({ ...prev, speechRecognition: 'listening' }));
        
        if (screenReaderEnabled) {
          speak('Reconocimiento de voz iniciado');
        }
      } else {
        throw new Error('Error iniciando reconocimiento');
      }
    } catch (error) {
      console.error('Error iniciando reconocimiento:', error);
      setServiceStatus(prev => ({ ...prev, speechRecognition: 'error' }));
    }
  };

  // Detener reconocimiento de voz
  const stopSpeechRecognition = async () => {
    try {
      const response = await fetch('/api/ai/speech-recognition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'stop',
          data: {}
        })
      });

      if (response.ok) {
        setIsListening(false);
        setServiceStatus(prev => ({ ...prev, speechRecognition: 'ready' }));
        
        if (screenReaderEnabled) {
          speak('Reconocimiento de voz detenido');
        }
      }
    } catch (error) {
      console.error('Error deteniendo reconocimiento:', error);
    }
  };

  // Analizar necesidades
  const analyzeNeeds = async () => {
    setServiceStatus(prev => ({ ...prev, needsDetection: 'analyzing' }));

    try {
      // Datos de ejemplo para el análisis
      const interactionData = {
        readingSpeed: 85,
        readingAccuracy: 0.92,
        readingComprehension: 0.88,
        readingErrors: {
          substitutions: 2,
          omissions: 1,
          insertions: 0,
          reversals: 3,
          transpositions: 1
        },
        mathAccuracy: 0.78,
        mathSpeed: 0.65,
        mathErrors: {
          calculation: 4,
          procedural: 2,
          conceptual: 3,
          visual: 1
        },
        attentionSpan: 12,
        responseTime: {
          mean: 3.2,
          variance: 2.1,
          outliers: 2
        },
        taskCompletion: 0.85,
        helpRequests: 3,
        audioPreference: 0.7,
        visualPreference: 0.2,
        kinestheticPreference: 0.1,
        language,
        culturalBackground: culturalContext,
        socioeconomicContext: 'rural',
        previousEducation: 2,
        timeOfDay: 'morning',
        sessionDuration: 45,
        breaksTaken: 2,
        deviceType: 'mobile' as const,
        internetSpeed: 2.5,
        offlineUsage: 0.6
      };

      const response = await fetch('/api/ai/needs-detection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          interactionData
        })
      });

      if (response.ok) {
        const data = await response.json();
        setNeedsAnalysis(data.analysis);
        setServiceStatus(prev => ({ ...prev, needsDetection: 'ready' }));
        
        if (screenReaderEnabled) {
          speak('Análisis de necesidades completado');
        }
      } else {
        throw new Error('Error en análisis de necesidades');
      }
    } catch (error) {
      console.error('Error analizando necesidades:', error);
      setServiceStatus(prev => ({ ...prev, needsDetection: 'error' }));
      
      if (screenReaderEnabled) {
        speak('Error analizando necesidades');
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'bg-green-500';
      case 'loading':
      case 'analyzing':
      case 'listening': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ready': return 'Listo';
      case 'loading': return 'Cargando';
      case 'analyzing': return 'Analizando';
      case 'listening': return 'Escuchando';
      case 'error': return 'Error';
      default: return 'Inactivo';
    }
  };

  return (
    <div className={cn("space-y-6", className)} style={getStyles()}>
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Servicios de IA</CardTitle>
              <p className="text-muted-foreground">
                Integración completa de servicios de inteligencia artificial
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <Globe className="h-3 w-3" />
                {language}
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {culturalContext}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
                aria-label="Configuración de servicios de IA"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Estado de servicios */}
      <Card>
        <CardHeader>
          <CardTitle>Estado de Servicios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* TTS */}
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <div className={cn("w-3 h-3 rounded-full", getStatusColor(serviceStatus.tts))}></div>
              <div className="flex-1">
                <div className="font-medium">Text-to-Speech</div>
                <div className="text-sm text-muted-foreground">
                  {getStatusText(serviceStatus.tts)}
                </div>
              </div>
              <Volume2 className="h-4 w-4 text-muted-foreground" />
            </div>

            {/* Reconocimiento de voz */}
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <div className={cn("w-3 h-3 rounded-full", getStatusColor(serviceStatus.speechRecognition))}></div>
              <div className="flex-1">
                <div className="font-medium">Reconocimiento de Voz</div>
                <div className="text-sm text-muted-foreground">
                  {getStatusText(serviceStatus.speechRecognition)}
                </div>
              </div>
              <Mic className="h-4 w-4 text-muted-foreground" />
            </div>

            {/* Detección de necesidades */}
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <div className={cn("w-3 h-3 rounded-full", getStatusColor(serviceStatus.needsDetection))}></div>
              <div className="flex-1">
                <div className="font-medium">Detección de Necesidades</div>
                <div className="text-sm text-muted-foreground">
                  {getStatusText(serviceStatus.needsDetection)}
                </div>
              </div>
              <Brain className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Prueba de TTS */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="h-5 w-5" />
            Prueba de Síntesis de Voz
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Texto a sintetizar:</label>
            <textarea
              value={testText}
              onChange={(e) => setTestText(e.target.value)}
              className="w-full p-2 border rounded-md mt-1"
              rows={3}
              placeholder="Escribe el texto que quieres convertir a voz..."
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              onClick={testTTS}
              disabled={serviceStatus.tts !== 'ready' || isSpeaking}
              className="flex items-center gap-2"
            >
              {isSpeaking ? (
                <>
                  <Pause className="h-4 w-4" />
                  Reproduciendo...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Generar Audio
                </>
              )}
            </Button>
            
            {serviceStatus.tts === 'error' && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Error
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Reconocimiento de voz */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mic className="h-5 w-5" />
            Reconocimiento de Voz
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Button
              onClick={isListening ? stopSpeechRecognition : startSpeechRecognition}
              disabled={serviceStatus.speechRecognition !== 'ready'}
              variant={isListening ? "destructive" : "default"}
              className="flex items-center gap-2"
            >
              {isListening ? (
                <>
                  <MicOff className="h-4 w-4" />
                  Detener
                </>
              ) : (
                <>
                  <Mic className="h-4 w-4" />
                  Iniciar
                </>
              )}
            </Button>
            
            {isListening && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-muted-foreground">Escuchando...</span>
              </div>
            )}
          </div>
          
          {transcript && (
            <div className="p-3 bg-muted rounded-lg">
              <div className="text-sm font-medium mb-1">Texto reconocido:</div>
              <div className="text-sm">{transcript}</div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Análisis de necesidades */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Análisis de Necesidades Especiales
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={analyzeNeeds}
            disabled={serviceStatus.needsDetection !== 'ready'}
            className="flex items-center gap-2"
          >
            <Brain className="h-4 w-4" />
            Analizar Necesidades
          </Button>

          {serviceStatus.needsDetection === 'analyzing' && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                <span className="text-sm">Analizando patrones de aprendizaje...</span>
              </div>
              <Progress value={50} />
            </div>
          )}

          {needsAnalysis && (
            <div className="space-y-4">
              {/* Necesidades especiales */}
              {needsAnalysis.specialNeeds.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Necesidades Detectadas:</h4>
                  <div className="space-y-2">
                    {needsAnalysis.specialNeeds.map((need, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium">{need.type}</div>
                          <Badge variant={need.severity === 'severe' ? 'destructive' : 'secondary'}>
                            {need.severity}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground mb-2">
                          Confianza: {Math.round(need.confidence * 100)}%
                        </div>
                        <div className="text-sm">
                          <div className="font-medium mb-1">Indicadores:</div>
                          <ul className="list-disc list-inside space-y-1">
                            {need.indicators.map((indicator, i) => (
                              <li key={i}>{indicator}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Perfil de aprendizaje */}
              <div>
                <h4 className="font-medium mb-2">Perfil de Aprendizaje:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 border rounded-lg">
                    <div className="text-sm font-medium mb-1">Estilo de aprendizaje:</div>
                    <Badge variant="outline">{needsAnalysis.learningProfile.learningStyle}</Badge>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="text-sm font-medium mb-1">Ritmo:</div>
                    <Badge variant="outline">{needsAnalysis.learningProfile.pace}</Badge>
                  </div>
                </div>
              </div>

              {/* Fortalezas y desafíos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-1">
                    <Star className="h-4 w-4 text-green-500" />
                    Fortalezas:
                  </h4>
                  <ul className="space-y-1 text-sm">
                    {needsAnalysis.learningProfile.strengths.map((strength, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4 text-orange-500" />
                    Desafíos:
                  </h4>
                  <ul className="space-y-1 text-sm">
                    {needsAnalysis.learningProfile.challenges.map((challenge, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <AlertCircle className="h-3 w-3 text-orange-500" />
                        {challenge}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Configuración */}
      {showSettings && (
        <Card>
          <CardHeader>
            <CardTitle>Configuración de Servicios</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Idioma:</label>
                <select
                  value={language}
                  onChange={(e) => window.location.reload()} // Recargar para aplicar cambios
                  className="w-full p-2 border rounded-md mt-1"
                >
                  <option value="es-MX">Español (México)</option>
                  <option value="es-GT">Español (Guatemala)</option>
                  <option value="maya">Maya</option>
                  <option value="nahuatl">Náhuatl</option>
                  <option value="en-US">English</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Contexto cultural:</label>
                <select
                  value={culturalContext}
                  onChange={(e) => window.location.reload()} // Recargar para aplicar cambios
                  className="w-full p-2 border rounded-md mt-1"
                >
                  <option value="maya">Maya</option>
                  <option value="nahuatl">Náhuatl</option>
                  <option value="afrodescendiente">Afrodescendiente</option>
                  <option value="rural">Rural</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
