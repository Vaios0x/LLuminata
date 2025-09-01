import { useState, useEffect, useCallback } from 'react';

interface AIServiceStatus {
  tts: 'idle' | 'loading' | 'ready' | 'error';
  speechRecognition: 'idle' | 'listening' | 'ready' | 'error';
  needsDetection: 'idle' | 'analyzing' | 'ready' | 'error';
}

interface TTSOptions {
  language?: string;
  culturalContext?: string;
  cache?: boolean;
  voice?: string;
  speed?: number;
  pitch?: number;
}

interface SpeechRecognitionOptions {
  language?: string;
  culturalContext?: string;
  continuous?: boolean;
  interimResults?: boolean;
}

interface NeedsDetectionOptions {
  includeHistoricalData?: boolean;
  includeCulturalAnalysis?: boolean;
  confidenceThreshold?: number;
}

interface UseAIServicesOptions {
  studentId: string;
  defaultLanguage?: string;
  defaultCulturalContext?: string;
  autoInitialize?: boolean;
}

export const useAIServices = (options: UseAIServicesOptions) => {
  const {
    studentId,
    defaultLanguage = 'es-MX',
    defaultCulturalContext = 'maya',
    autoInitialize = true
  } = options;

  const [serviceStatus, setServiceStatus] = useState<AIServiceStatus>({
    tts: 'idle',
    speechRecognition: 'idle',
    needsDetection: 'idle'
  });

  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [currentLanguage, setCurrentLanguage] = useState(defaultLanguage);
  const [currentCulturalContext, setCurrentCulturalContext] = useState(defaultCulturalContext);

  // Inicializar servicios
  const initializeServices = useCallback(async () => {
    try {
      setServiceStatus(prev => ({ ...prev, tts: 'loading' }));

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
      console.error('Error inicializando servicios de IA:', error);
      setServiceStatus({
        tts: 'error',
        speechRecognition: 'error',
        needsDetection: 'error'
      });
    }
  }, [studentId]);

  // Síntesis de voz
  const synthesizeSpeech = useCallback(async (
    text: string,
    options: TTSOptions = {}
  ) => {
    if (!text.trim()) {
      throw new Error('El texto no puede estar vacío');
    }

    setServiceStatus(prev => ({ ...prev, tts: 'loading' }));
    setIsSpeaking(true);

    try {
      const response = await fetch('/api/ai/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          language: options.language || currentLanguage,
          options: {
            culturalContext: options.culturalContext || currentCulturalContext,
            cache: options.cache ?? true,
            voice: options.voice,
            speed: options.speed,
            pitch: options.pitch
          }
        })
      });

      if (!response.ok) {
        throw new Error('Error generando audio');
      }

      const data = await response.json();
      
      // Reproducir audio
      const audioBlob = new Blob([
        Uint8Array.from(atob(data.audio), c => c.charCodeAt(0))
      ], { type: 'audio/mp3' });
      
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      return new Promise<void>((resolve, reject) => {
        audio.onended = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
          resolve();
        };
        
        audio.onerror = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
          reject(new Error('Error reproduciendo audio'));
        };
        
        audio.play();
      });

    } catch (error) {
      console.error('Error en síntesis de voz:', error);
      setServiceStatus(prev => ({ ...prev, tts: 'error' }));
      setIsSpeaking(false);
      throw error;
    }
  }, [currentLanguage, currentCulturalContext]);

  // Reconocimiento de voz
  const startSpeechRecognition = useCallback(async (
    options: SpeechRecognitionOptions = {}
  ) => {
    try {
      const response = await fetch('/api/ai/speech-recognition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'start',
          data: {
            language: options.language || currentLanguage,
            culturalContext: options.culturalContext || currentCulturalContext,
            continuous: options.continuous ?? true,
            interimResults: options.interimResults ?? false
          }
        })
      });

      if (!response.ok) {
        throw new Error('Error iniciando reconocimiento de voz');
      }

      setIsListening(true);
      setServiceStatus(prev => ({ ...prev, speechRecognition: 'listening' }));

      // Configurar WebSocket o polling para recibir resultados
      // Por ahora, simulamos con un timeout
      setTimeout(() => {
        setTranscript('Texto reconocido de ejemplo...');
      }, 2000);

    } catch (error) {
      console.error('Error iniciando reconocimiento de voz:', error);
      setServiceStatus(prev => ({ ...prev, speechRecognition: 'error' }));
      throw error;
    }
  }, [currentLanguage, currentCulturalContext]);

  const stopSpeechRecognition = useCallback(async () => {
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
      }
    } catch (error) {
      console.error('Error deteniendo reconocimiento de voz:', error);
    }
  }, []);

  // Detección de necesidades
  const analyzeNeeds = useCallback(async (
    interactionData: any,
    options: NeedsDetectionOptions = {}
  ) => {
    setServiceStatus(prev => ({ ...prev, needsDetection: 'analyzing' }));

    try {
      const response = await fetch('/api/ai/needs-detection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          interactionData,
          options: {
            includeHistoricalData: options.includeHistoricalData ?? true,
            includeCulturalAnalysis: options.includeCulturalAnalysis ?? true,
            confidenceThreshold: options.confidenceThreshold ?? 0.7
          }
        })
      });

      if (!response.ok) {
        throw new Error('Error analizando necesidades');
      }

      const data = await response.json();
      setServiceStatus(prev => ({ ...prev, needsDetection: 'ready' }));
      
      return data.analysis;

    } catch (error) {
      console.error('Error analizando necesidades:', error);
      setServiceStatus(prev => ({ ...prev, needsDetection: 'error' }));
      throw error;
    }
  }, [studentId]);

  // Obtener análisis previo
  const getPreviousAnalysis = useCallback(async () => {
    try {
      const response = await fetch(`/api/ai/needs-detection?studentId=${studentId}`);
      
      if (response.ok) {
        const data = await response.json();
        return data;
      }
      
      return null;
    } catch (error) {
      console.error('Error obteniendo análisis previo:', error);
      return null;
    }
  }, [studentId]);

  // Cambiar idioma
  const changeLanguage = useCallback((language: string) => {
    setCurrentLanguage(language);
  }, []);

  // Cambiar contexto cultural
  const changeCulturalContext = useCallback((context: string) => {
    setCurrentCulturalContext(context);
  }, []);

  // Reinicializar servicios
  const reinitializeServices = useCallback(() => {
    initializeServices();
  }, [initializeServices]);

  // Auto-inicializar si está habilitado
  useEffect(() => {
    if (autoInitialize) {
      initializeServices();
    }
  }, [autoInitialize, initializeServices]);

  return {
    // Estado
    serviceStatus,
    isListening,
    isSpeaking,
    transcript,
    currentLanguage,
    currentCulturalContext,

    // Métodos TTS
    synthesizeSpeech,

    // Métodos reconocimiento de voz
    startSpeechRecognition,
    stopSpeechRecognition,

    // Métodos detección de necesidades
    analyzeNeeds,
    getPreviousAnalysis,

    // Métodos de configuración
    changeLanguage,
    changeCulturalContext,
    reinitializeServices,

    // Utilidades
    isReady: serviceStatus.tts === 'ready' && 
             serviceStatus.speechRecognition === 'ready' && 
             serviceStatus.needsDetection === 'ready',
    
    hasErrors: serviceStatus.tts === 'error' || 
               serviceStatus.speechRecognition === 'error' || 
               serviceStatus.needsDetection === 'error'
  };
};
