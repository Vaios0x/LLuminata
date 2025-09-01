import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './useAuth';
import { AIServices } from '../ai-services';

interface VoiceSettings {
  voice: string;
  speed: number; // 0.5 - 2.0
  pitch: number; // -20 - 20
  volume: number; // 0 - 1
  language: string;
  accent?: string;
}

interface VoiceGenerationState {
  isPlaying: boolean;
  isPaused: boolean;
  currentText: string;
  audioUrl: string | null;
  voiceSettings: VoiceSettings;
  availableVoices: {
    id: string;
    name: string;
    language: string;
    gender: 'male' | 'female' | 'neutral';
    accent?: string;
  }[];
  generationHistory: {
    id: string;
    text: string;
    audioUrl: string;
    settings: VoiceSettings;
    timestamp: Date;
    duration: number;
  }[];
}

interface VoiceGenerationActions {
  generateSpeech: (text: string, settings?: Partial<VoiceSettings>) => Promise<string>;
  playAudio: (audioUrl: string) => Promise<void>;
  pauseAudio: () => void;
  resumeAudio: () => void;
  stopAudio: () => void;
  updateVoiceSettings: (settings: Partial<VoiceSettings>) => void;
  saveToHistory: (text: string, audioUrl: string, settings: VoiceSettings) => void;
  exportAudio: (audioUrl: string, format: 'mp3' | 'wav' | 'ogg') => Promise<string>;
  batchGenerate: (texts: string[]) => Promise<string[]>;
}

export function useVoiceGeneration() {
  const { user } = useAuth();
  const [aiServices] = useState(() => new AIServices());
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [state, setState] = useState<VoiceGenerationState>({
    isPlaying: false,
    isPaused: false,
    currentText: '',
    audioUrl: null,
    voiceSettings: {
      voice: 'default',
      speed: 1.0,
      pitch: 0,
      volume: 1.0,
      language: 'es-MX',
    },
    availableVoices: [],
    generationHistory: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Inicializar servicios de IA
  useEffect(() => {
    const initializeServices = async () => {
      try {
        setLoading(true);
        await aiServices.initialize();
        setError(null);
      } catch (err) {
        setError('Error inicializando servicios de IA');
        console.error('Error inicializando servicios de IA:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      initializeServices();
    }
  }, [user, aiServices]);

  // Cargar voces disponibles
  useEffect(() => {
    const loadAvailableVoices = async () => {
      if (!aiServices.isReady()) return;

      try {
        const voices = await aiServices.getAvailableVoices();
        setState(prev => ({
          ...prev,
          availableVoices: voices,
        }));
      } catch (err) {
        console.error('Error cargando voces disponibles:', err);
      }
    };

    loadAvailableVoices();
  }, [aiServices]);

  // Cargar historial de generación
  useEffect(() => {
    const loadGenerationHistory = async () => {
      if (!user || !aiServices.isReady()) return;

      try {
        const history = await aiServices.getVoiceGenerationHistory(user.id);
        setState(prev => ({
          ...prev,
          generationHistory: history,
        }));
      } catch (err) {
        console.error('Error cargando historial de generación:', err);
      }
    };

    loadGenerationHistory();
  }, [user, aiServices]);

  // Generar síntesis de habla
  const generateSpeech = useCallback(async (
    text: string, 
    settings?: Partial<VoiceSettings>
  ): Promise<string> => {
    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    try {
      setLoading(true);
      setError(null);

      const finalSettings = { ...state.voiceSettings, ...settings };
      const audioUrl = await aiServices.generateSpeech(text, finalSettings);

      setState(prev => ({
        ...prev,
        currentText: text,
        audioUrl,
        voiceSettings: finalSettings,
      }));

      return audioUrl;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error generando síntesis de habla';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user, aiServices, state.voiceSettings]);

  // Reproducir audio
  const playAudio = useCallback(async (audioUrl: string): Promise<void> => {
    try {
      if (audioRef.current) {
        audioRef.current.pause();
      }

      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.addEventListener('play', () => {
        setState(prev => ({ ...prev, isPlaying: true, isPaused: false }));
      });

      audio.addEventListener('pause', () => {
        setState(prev => ({ ...prev, isPlaying: false, isPaused: true }));
      });

      audio.addEventListener('ended', () => {
        setState(prev => ({ ...prev, isPlaying: false, isPaused: false }));
      });

      audio.addEventListener('error', (e) => {
        setError('Error reproduciendo audio');
        console.error('Error reproduciendo audio:', e);
      });

      await audio.play();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error reproduciendo audio';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  // Pausar audio
  const pauseAudio = useCallback(() => {
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
    }
  }, []);

  // Reanudar audio
  const resumeAudio = useCallback(() => {
    if (audioRef.current && audioRef.current.paused) {
      audioRef.current.play();
    }
  }, []);

  // Detener audio
  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setState(prev => ({ ...prev, isPlaying: false, isPaused: false }));
    }
  }, []);

  // Actualizar configuración de voz
  const updateVoiceSettings = useCallback((settings: Partial<VoiceSettings>) => {
    setState(prev => ({
      ...prev,
      voiceSettings: { ...prev.voiceSettings, ...settings },
    }));
  }, []);

  // Guardar en historial
  const saveToHistory = useCallback((
    text: string, 
    audioUrl: string, 
    settings: VoiceSettings
  ) => {
    const historyEntry = {
      id: `voice_${Date.now()}`,
      text,
      audioUrl,
      settings,
      timestamp: new Date(),
      duration: 0, // Se calcularía basado en el audio
    };

    setState(prev => ({
      ...prev,
      generationHistory: [historyEntry, ...prev.generationHistory.slice(0, 49)], // Mantener solo los últimos 50
    }));
  }, []);

  // Exportar audio
  const exportAudio = useCallback(async (
    audioUrl: string, 
    format: 'mp3' | 'wav' | 'ogg'
  ): Promise<string> => {
    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    try {
      setLoading(true);
      setError(null);

      const downloadUrl = await aiServices.exportAudio(audioUrl, format);
      return downloadUrl;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error exportando audio';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user, aiServices]);

  // Generación en lote
  const batchGenerate = useCallback(async (texts: string[]): Promise<string[]> => {
    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    try {
      setLoading(true);
      setError(null);

      const audioUrls = await aiServices.batchGenerateSpeech(texts, state.voiceSettings);
      return audioUrls;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error en generación en lote';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user, aiServices, state.voiceSettings]);

  // Limpiar recursos al desmontar
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Función helper para generar y reproducir automáticamente
  const generateAndPlay = useCallback(async (
    text: string, 
    settings?: Partial<VoiceSettings>
  ): Promise<void> => {
    try {
      const audioUrl = await generateSpeech(text, settings);
      await playAudio(audioUrl);
      saveToHistory(text, audioUrl, { ...state.voiceSettings, ...settings });
    } catch (err) {
      console.error('Error en generateAndPlay:', err);
      throw err;
    }
  }, [generateSpeech, playAudio, saveToHistory, state.voiceSettings]);

  return {
    // Estado
    ...state,
    loading,
    error,
    
    // Acciones
    generateSpeech,
    playAudio,
    pauseAudio,
    resumeAudio,
    stopAudio,
    updateVoiceSettings,
    saveToHistory,
    exportAudio,
    batchGenerate,
    generateAndPlay,
  };
}
