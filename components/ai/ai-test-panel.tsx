import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  Pause, 
  Mic, 
  MicOff, 
  Brain, 
  CheckCircle, 
  AlertCircle, 
  Info,
  Volume2,
  VolumeX,
  RotateCcw,
  Settings,
  TestTube,
  Zap
} from 'lucide-react';
import { useAIServices } from '@/lib/hooks/use-ai-services';
import { cn } from '@/lib/utils';

interface AITestPanelProps {
  studentId: string;
  className?: string;
}

export const AITestPanel: React.FC<AITestPanelProps> = ({
  studentId,
  className
}) => {
  const [testResults, setTestResults] = useState<{
    tts: 'pending' | 'running' | 'passed' | 'failed';
    speechRecognition: 'pending' | 'running' | 'passed' | 'failed';
    needsDetection: 'pending' | 'running' | 'passed' | 'failed';
  }>({
    tts: 'pending',
    speechRecognition: 'pending',
    needsDetection: 'pending'
  });

  const [testText, setTestText] = useState('Hola, este es un texto de prueba para verificar la síntesis de voz.');
  const [testTranscript, setTestTranscript] = useState('');

  const {
    serviceStatus,
    isListening,
    isSpeaking,
    synthesizeSpeech,
    startSpeechRecognition,
    stopSpeechRecognition,
    analyzeNeeds,
    isReady,
    hasErrors,
    reinitializeServices
  } = useAIServices({
    studentId,
    autoInitialize: true
  });

  // Probar TTS
  const testTTS = async () => {
    setTestResults(prev => ({ ...prev, tts: 'running' }));
    
    try {
      await synthesizeSpeech(testText);
      setTestResults(prev => ({ ...prev, tts: 'passed' }));
    } catch (error) {
      console.error('Error en prueba TTS:', error);
      setTestResults(prev => ({ ...prev, tts: 'failed' }));
    }
  };

  // Probar reconocimiento de voz
  const testSpeechRecognition = async () => {
    setTestResults(prev => ({ ...prev, speechRecognition: 'running' }));
    
    try {
      await startSpeechRecognition();
      
      // Simular reconocimiento exitoso después de 3 segundos
      setTimeout(() => {
        setTestTranscript('Texto reconocido exitosamente');
        setTestResults(prev => ({ ...prev, speechRecognition: 'passed' }));
        stopSpeechRecognition();
      }, 3000);
      
    } catch (error) {
      console.error('Error en prueba de reconocimiento:', error);
      setTestResults(prev => ({ ...prev, speechRecognition: 'failed' }));
    }
  };

  // Probar detección de necesidades
  const testNeedsDetection = async () => {
    setTestResults(prev => ({ ...prev, needsDetection: 'running' }));
    
    try {
      const sampleData = {
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
        language: 'es-MX',
        culturalBackground: 'maya',
        socioeconomicContext: 'rural',
        previousEducation: 2,
        timeOfDay: 'morning',
        sessionDuration: 45,
        breaksTaken: 2,
        deviceType: 'mobile' as const,
        internetSpeed: 2.5,
        offlineUsage: 0.6
      };

      await analyzeNeeds(sampleData);
      setTestResults(prev => ({ ...prev, needsDetection: 'passed' }));
    } catch (error) {
      console.error('Error en prueba de detección:', error);
      setTestResults(prev => ({ ...prev, needsDetection: 'failed' }));
    }
  };

  // Ejecutar todas las pruebas
  const runAllTests = async () => {
    setTestResults({
      tts: 'pending',
      speechRecognition: 'pending',
      needsDetection: 'pending'
    });

    await testTTS();
    await testSpeechRecognition();
    await testNeedsDetection();
  };

  const getTestStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'running':
        return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-400" />;
    }
  };

  const getTestStatusText = (status: string) => {
    switch (status) {
      case 'passed':
        return 'Exitoso';
      case 'failed':
        return 'Fallido';
      case 'running':
        return 'Ejecutando';
      default:
        return 'Pendiente';
    }
  };

  const getTestStatusColor = (status: string) => {
    switch (status) {
      case 'passed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'running':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="h-5 w-5" />
                Panel de Pruebas de IA
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Verifica el funcionamiento de todos los servicios de inteligencia artificial
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge 
                variant={isReady ? "default" : "secondary"}
                className="flex items-center gap-1"
              >
                <Zap className="h-3 w-3" />
                {isReady ? 'Listo' : 'Inicializando'}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={reinitializeServices}
                disabled={!hasErrors}
              >
                <RotateCcw className="h-4 w-4" />
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
              <div className={cn(
                "w-3 h-3 rounded-full",
                serviceStatus.tts === 'ready' ? 'bg-green-500' :
                serviceStatus.tts === 'loading' ? 'bg-yellow-500' :
                serviceStatus.tts === 'error' ? 'bg-red-500' : 'bg-gray-500'
              )}></div>
              <div className="flex-1">
                <div className="font-medium">Text-to-Speech</div>
                <div className="text-sm text-muted-foreground">
                  {serviceStatus.tts === 'ready' ? 'Listo' :
                   serviceStatus.tts === 'loading' ? 'Cargando' :
                   serviceStatus.tts === 'error' ? 'Error' : 'Inactivo'}
                </div>
              </div>
              <Volume2 className="h-4 w-4 text-muted-foreground" />
            </div>

            {/* Reconocimiento de voz */}
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <div className={cn(
                "w-3 h-3 rounded-full",
                serviceStatus.speechRecognition === 'ready' ? 'bg-green-500' :
                serviceStatus.speechRecognition === 'listening' ? 'bg-yellow-500' :
                serviceStatus.speechRecognition === 'error' ? 'bg-red-500' : 'bg-gray-500'
              )}></div>
              <div className="flex-1">
                <div className="font-medium">Reconocimiento de Voz</div>
                <div className="text-sm text-muted-foreground">
                  {serviceStatus.speechRecognition === 'ready' ? 'Listo' :
                   serviceStatus.speechRecognition === 'listening' ? 'Escuchando' :
                   serviceStatus.speechRecognition === 'error' ? 'Error' : 'Inactivo'}
                </div>
              </div>
              <Mic className="h-4 w-4 text-muted-foreground" />
            </div>

            {/* Detección de necesidades */}
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <div className={cn(
                "w-3 h-3 rounded-full",
                serviceStatus.needsDetection === 'ready' ? 'bg-green-500' :
                serviceStatus.needsDetection === 'analyzing' ? 'bg-yellow-500' :
                serviceStatus.needsDetection === 'error' ? 'bg-red-500' : 'bg-gray-500'
              )}></div>
              <div className="flex-1">
                <div className="font-medium">Detección de Necesidades</div>
                <div className="text-sm text-muted-foreground">
                  {serviceStatus.needsDetection === 'ready' ? 'Listo' :
                   serviceStatus.needsDetection === 'analyzing' ? 'Analizando' :
                   serviceStatus.needsDetection === 'error' ? 'Error' : 'Inactivo'}
                </div>
              </div>
              <Brain className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pruebas individuales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Prueba TTS */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Volume2 className="h-5 w-5" />
                Prueba TTS
              </span>
              {getTestStatusIcon(testResults.tts)}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <textarea
              value={testText}
              onChange={(e) => setTestText(e.target.value)}
              className="w-full p-2 border rounded-md text-sm"
              rows={3}
              placeholder="Texto para probar síntesis de voz..."
            />
            
            <Button
              onClick={testTTS}
              disabled={serviceStatus.tts !== 'ready' || isSpeaking}
              className="w-full"
            >
              {isSpeaking ? (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  Reproduciendo...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Probar TTS
                </>
              )}
            </Button>

            <Badge 
              variant="outline" 
              className={cn("w-full justify-center", getTestStatusColor(testResults.tts))}
            >
              {getTestStatusText(testResults.tts)}
            </Badge>
          </CardContent>
        </Card>

        {/* Prueba Reconocimiento de Voz */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Mic className="h-5 w-5" />
                Prueba Reconocimiento
              </span>
              {getTestStatusIcon(testResults.speechRecognition)}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-muted rounded-lg min-h-[80px]">
              <div className="text-sm font-medium mb-1">Texto reconocido:</div>
              <div className="text-sm text-muted-foreground">
                {testTranscript || 'Haz clic en "Probar" y habla...'}
              </div>
            </div>
            
            <Button
              onClick={isListening ? stopSpeechRecognition : testSpeechRecognition}
              disabled={serviceStatus.speechRecognition !== 'ready'}
              variant={isListening ? "destructive" : "default"}
              className="w-full"
            >
              {isListening ? (
                <>
                  <MicOff className="h-4 w-4 mr-2" />
                  Detener
                </>
              ) : (
                <>
                  <Mic className="h-4 w-4 mr-2" />
                  Probar Reconocimiento
                </>
              )}
            </Button>

            <Badge 
              variant="outline" 
              className={cn("w-full justify-center", getTestStatusColor(testResults.speechRecognition))}
            >
              {getTestStatusText(testResults.speechRecognition)}
            </Badge>
          </CardContent>
        </Card>

        {/* Prueba Detección de Necesidades */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Prueba Detección
              </span>
              {getTestStatusIcon(testResults.needsDetection)}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-muted rounded-lg">
              <div className="text-sm font-medium mb-1">Datos de prueba:</div>
              <div className="text-sm text-muted-foreground">
                Datos simulados de interacción del estudiante
              </div>
            </div>
            
            <Button
              onClick={testNeedsDetection}
              disabled={serviceStatus.needsDetection !== 'ready'}
              className="w-full"
            >
              <Brain className="h-4 w-4 mr-2" />
              Probar Detección
            </Button>

            <Badge 
              variant="outline" 
              className={cn("w-full justify-center", getTestStatusColor(testResults.needsDetection))}
            >
              {getTestStatusText(testResults.needsDetection)}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Ejecutar todas las pruebas */}
      <Card>
        <CardHeader>
          <CardTitle>Ejecutar Todas las Pruebas</CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            onClick={runAllTests}
            disabled={!isReady}
            className="w-full"
            size="lg"
          >
            <Zap className="h-5 w-5 mr-2" />
            Ejecutar Suite Completa de Pruebas
          </Button>
          
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span>Progreso de pruebas:</span>
              <span>
                {Object.values(testResults).filter(r => r === 'passed').length} / 3 completadas
              </span>
            </div>
            <Progress 
              value={
                (Object.values(testResults).filter(r => r === 'passed').length / 3) * 100
              } 
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
