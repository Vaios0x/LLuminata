'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { cn } from '@/lib/utils';

interface VoiceRecorderProps {
  title?: string;
  maxDuration?: number; // en segundos
  autoStart?: boolean;
  showWaveform?: boolean;
  showTranscription?: boolean;
  showEmotion?: boolean;
  showLanguage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onRecordingStart?: () => void;
  onRecordingStop?: (audioBlob: Blob, duration: number) => void;
  onTranscription?: (text: string, confidence: number) => void;
  onEmotionDetected?: (emotion: string, confidence: number) => void;
  onLanguageDetected?: (language: string, confidence: number) => void;
  accessibility?: {
    ariaLabel?: string;
    ariaDescription?: string;
    enableKeyboardNavigation?: boolean;
  };
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  title = 'Grabador de Voz',
  maxDuration = 60,
  autoStart = false,
  showWaveform = true,
  showTranscription = true,
  showEmotion = true,
  showLanguage = true,
  size = 'md',
  className,
  onRecordingStart,
  onRecordingStop,
  onTranscription,
  onEmotionDetected,
  onLanguageDetected,
  accessibility = {}
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [transcription, setTranscription] = useState('');
  const [transcriptionConfidence, setTranscriptionConfidence] = useState(0);
  const [emotion, setEmotion] = useState('');
  const [emotionConfidence, setEmotionConfidence] = useState(0);
  const [language, setLanguage] = useState('');
  const [languageConfidence, setLanguageConfidence] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Verificar soporte del navegador
  const checkBrowserSupport = useCallback(() => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError('Tu navegador no soporta grabación de audio');
      return false;
    }
    return true;
  }, []);

  // Inicializar grabación
  const initializeRecording = useCallback(async () => {
    if (!checkBrowserSupport()) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });

      // Configurar MediaRecorder
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      // Configurar AudioContext para análisis
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      
      microphoneRef.current = audioContextRef.current.createMediaStreamSource(stream);
      microphoneRef.current.connect(analyserRef.current);

      // Configurar eventos
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        chunksRef.current = [];
        
        // Procesar audio
        processAudio(blob);
        
        onRecordingStop?.(blob, duration);
      };

      return true;
    } catch (err) {
      setError('Error al acceder al micrófono');
      console.error('Error initializing recording:', err);
      return false;
    }
  }, [checkBrowserSupport, duration, onRecordingStop]);

  // Analizar nivel de audio
  const analyzeAudioLevel = useCallback(() => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
    setAudioLevel(average / 255);

    animationFrameRef.current = requestAnimationFrame(analyzeAudioLevel);
  }, []);

  // Iniciar grabación
  const startRecording = useCallback(async () => {
    if (isRecording) return;

    const initialized = await initializeRecording();
    if (!initialized) return;

    setError(null);
    setIsRecording(true);
    setIsPaused(false);
    setDuration(0);
    setAudioBlob(null);
    setAudioUrl(null);
    setTranscription('');
    setEmotion('');
    setLanguage('');

    mediaRecorderRef.current?.start();
    onRecordingStart?.();

    // Iniciar análisis de audio
    analyzeAudioLevel();

    // Iniciar contador
    intervalRef.current = setInterval(() => {
      setDuration(prev => {
        const newDuration = prev + 1;
        if (newDuration >= maxDuration) {
          stopRecording();
        }
        return newDuration;
      });
    }, 1000);
  }, [isRecording, initializeRecording, maxDuration, onRecordingStart, analyzeAudioLevel]);

  // Pausar grabación
  const pauseRecording = useCallback(() => {
    if (!isRecording || isPaused) return;

    mediaRecorderRef.current?.pause();
    setIsPaused(true);
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  }, [isRecording, isPaused]);

  // Reanudar grabación
  const resumeRecording = useCallback(() => {
    if (!isRecording || !isPaused) return;

    mediaRecorderRef.current?.resume();
    setIsPaused(false);
    
    // Reanudar contador
    intervalRef.current = setInterval(() => {
      setDuration(prev => {
        const newDuration = prev + 1;
        if (newDuration >= maxDuration) {
          stopRecording();
        }
        return newDuration;
      });
    }, 1000);

    // Reanudar análisis de audio
    analyzeAudioLevel();
  }, [isRecording, isPaused, maxDuration, analyzeAudioLevel]);

  // Detener grabación
  const stopRecording = useCallback(() => {
    if (!isRecording) return;

    mediaRecorderRef.current?.stop();
    setIsRecording(false);
    setIsPaused(false);
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    // Detener stream
    mediaRecorderRef.current?.stream.getTracks().forEach(track => track.stop());
  }, [isRecording]);

  // Procesar audio grabado
  const processAudio = useCallback(async (blob: Blob) => {
    setIsProcessing(true);
    
    try {
      // Simular transcripción (en producción usar API real)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const sampleText = "Hola, esta es una transcripción de ejemplo";
      const confidence = Math.random() * 0.3 + 0.7; // 70-100%
      
      setTranscription(sampleText);
      setTranscriptionConfidence(confidence);
      onTranscription?.(sampleText, confidence);

      // Simular detección de emoción
      const emotions = ['feliz', 'triste', 'neutral', 'emocionado', 'calmado'];
      const detectedEmotion = emotions[Math.floor(Math.random() * emotions.length)];
      const emotionConf = Math.random() * 0.4 + 0.6; // 60-100%
      
      setEmotion(detectedEmotion);
      setEmotionConfidence(emotionConf);
      onEmotionDetected?.(detectedEmotion, emotionConf);

      // Simular detección de idioma
      const languages = ['es-MX', 'maya', 'nahuatl', 'zapoteco'];
      const detectedLanguage = languages[Math.floor(Math.random() * languages.length)];
      const languageConf = Math.random() * 0.3 + 0.7; // 70-100%
      
      setLanguage(detectedLanguage);
      setLanguageConfidence(languageConf);
      onLanguageDetected?.(detectedLanguage, languageConf);

    } catch (err) {
      setError('Error procesando audio');
      console.error('Error processing audio:', err);
    } finally {
      setIsProcessing(false);
    }
  }, [onTranscription, onEmotionDetected, onLanguageDetected]);

  // Reproducir audio
  const playAudio = useCallback(() => {
    if (!audioUrl) return;

    const audio = new Audio(audioUrl);
    audio.play();
  }, [audioUrl]);

  // Descargar audio
  const downloadAudio = useCallback(() => {
    if (!audioBlob) return;

    const url = URL.createObjectURL(audioBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `grabacion_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [audioBlob]);

  // Formatear duración
  const formatDuration = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Navegación con teclado
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (!accessibility.enableKeyboardNavigation) return;

    switch (event.key) {
      case ' ':
        event.preventDefault();
        if (!isRecording) {
          startRecording();
        } else if (isPaused) {
          resumeRecording();
        } else {
          pauseRecording();
        }
        break;
      case 'Enter':
        event.preventDefault();
        if (isRecording) {
          stopRecording();
        }
        break;
      case 'Escape':
        event.preventDefault();
        if (isRecording) {
          stopRecording();
        }
        break;
    }
  }, [accessibility.enableKeyboardNavigation, isRecording, isPaused, startRecording, resumeRecording, pauseRecording, stopRecording]);

  // Auto-start si está habilitado
  useEffect(() => {
    if (autoStart) {
      startRecording();
    }
  }, [autoStart, startRecording]);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div 
      className={cn(
        'w-full bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4',
        className
      )}
      role="region"
      aria-label={accessibility.ariaLabel || title}
      aria-describedby={accessibility.ariaDescription ? 'voice-recorder-description' : undefined}
      tabIndex={accessibility.enableKeyboardNavigation ? 0 : undefined}
      onKeyDown={handleKeyDown}
    >
      {accessibility.ariaDescription && (
        <div id="voice-recorder-description" className="sr-only">
          {accessibility.ariaDescription}
        </div>
      )}

      {title && (
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          {title}
        </h3>
      )}

      {/* Controles principales */}
      <div className="flex items-center justify-center space-x-4 mb-6">
        <button
          onClick={isRecording ? (isPaused ? resumeRecording : pauseRecording) : startRecording}
          disabled={isProcessing}
          className={cn(
            'flex items-center justify-center rounded-full transition-all duration-200',
            size === 'sm' ? 'w-12 h-12' : size === 'lg' ? 'w-20 h-20' : 'w-16 h-16',
            isRecording 
              ? 'bg-red-500 hover:bg-red-600 text-white' 
              : 'bg-blue-500 hover:bg-blue-600 text-white',
            isProcessing && 'opacity-50 cursor-not-allowed'
          )}
          aria-label={isRecording ? (isPaused ? 'Reanudar grabación' : 'Pausar grabación') : 'Iniciar grabación'}
        >
          {isRecording ? (
            isPaused ? (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            )
          ) : (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
          )}
        </button>

        {isRecording && (
          <button
            onClick={stopRecording}
            className="flex items-center justify-center w-12 h-12 bg-gray-500 hover:bg-gray-600 text-white rounded-full transition-colors duration-200"
            aria-label="Detener grabación"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>

      {/* Indicador de duración */}
      <div className="text-center mb-4">
        <div className="text-2xl font-mono text-gray-900 dark:text-gray-100">
          {formatDuration(duration)}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {isRecording ? (isPaused ? 'Pausado' : 'Grabando...') : 'Listo para grabar'}
        </div>
      </div>

      {/* Visualización de audio */}
      {showWaveform && (
        <div className="mb-4">
          <div className="flex items-center justify-center space-x-1 h-8">
            {Array.from({ length: 20 }, (_, i) => (
              <div
                key={i}
                className={cn(
                  'bg-blue-500 rounded transition-all duration-100',
                  isRecording ? 'animate-pulse' : '',
                  size === 'sm' ? 'w-1' : size === 'lg' ? 'w-3' : 'w-2'
                )}
                style={{
                  height: isRecording 
                    ? `${Math.max(4, audioLevel * 32)}px`
                    : '4px'
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Barra de progreso */}
      {isRecording && (
        <div className="mb-4">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${(duration / maxDuration) * 100}%` }}
            />
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {Math.round((duration / maxDuration) * 100)}% completado
          </div>
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-md text-sm">
          {error}
        </div>
      )}

      {/* Resultados */}
      {audioBlob && (
        <div className="space-y-4">
          {/* Controles de audio */}
          <div className="flex items-center justify-center space-x-2">
            <button
              onClick={playAudio}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md transition-colors duration-200"
              aria-label="Reproducir grabación"
            >
              <svg className="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
              Reproducir
            </button>
            <button
              onClick={downloadAudio}
              className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md transition-colors duration-200"
              aria-label="Descargar grabación"
            >
              <svg className="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Descargar
            </button>
          </div>

          {/* Transcripción */}
          {showTranscription && transcription && (
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                Transcripción
              </h4>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                {transcription}
              </p>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Confianza: {(transcriptionConfidence * 100).toFixed(1)}%
              </div>
            </div>
          )}

          {/* Emoción detectada */}
          {showEmotion && emotion && (
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                Emoción Detectada
              </h4>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {emotion}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  ({(emotionConfidence * 100).toFixed(1)}% confianza)
                </span>
              </div>
            </div>
          )}

          {/* Idioma detectado */}
          {showLanguage && language && (
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                Idioma Detectado
              </h4>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {language}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  ({(languageConfidence * 100).toFixed(1)}% confianza)
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Indicador de procesamiento */}
      {isProcessing && (
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          <span>Procesando audio...</span>
        </div>
      )}

      {/* Instrucciones de accesibilidad */}
      {accessibility.enableKeyboardNavigation && (
        <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
          <p>Controles de teclado:</p>
          <p>Espacio: {isRecording ? (isPaused ? 'Reanudar' : 'Pausar') : 'Iniciar'} grabación</p>
          <p>Enter: Detener grabación</p>
          <p>Escape: Cancelar grabación</p>
        </div>
      )}
    </div>
  );
};

export default VoiceRecorder;
