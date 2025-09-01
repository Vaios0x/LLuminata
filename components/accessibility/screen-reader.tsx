import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Volume2, VolumeX, Settings, Play, Pause, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ScreenReaderContextType {
  speak: (text: string, priority?: 'high' | 'low') => void;
  stop: () => void;
  isEnabled: boolean;
  toggle: () => void;
  speed: number;
  setSpeed: (speed: number) => void;
  pitch: number;
  setPitch: (pitch: number) => void;
}

const ScreenReaderContext = createContext<ScreenReaderContextType | undefined>(undefined);

export const useScreenReader = () => {
  const context = useContext(ScreenReaderContext);
  if (!context) {
    throw new Error('useScreenReader must be used within a ScreenReaderProvider');
  }
  return context;
};

interface ScreenReaderProviderProps {
  children: React.ReactNode;
  defaultEnabled?: boolean;
}

export const ScreenReaderProvider: React.FC<ScreenReaderProviderProps> = ({
  children,
  defaultEnabled = false
}) => {
  const [isEnabled, setIsEnabled] = useState(defaultEnabled);
  const [speed, setSpeed] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const speechQueue = useRef<string[]>([]);
  const currentUtterance = useRef<SpeechSynthesisUtterance | null>(null);

  const speak = (text: string, priority: 'high' | 'low' = 'low') => {
    if (!isEnabled || !window.speechSynthesis) return;

    if (priority === 'high') {
      // Interrumpir el habla actual para mensajes de alta prioridad
      stop();
    }

    speechQueue.current.push(text);
    processQueue();
  };

  const processQueue = () => {
    if (speechQueue.current.length === 0 || isSpeaking) return;

    const text = speechQueue.current.shift();
    if (!text) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = speed;
    utterance.pitch = pitch;
    utterance.lang = 'es-MX'; // Configurable según el idioma del usuario

    utterance.onstart = () => {
      setIsSpeaking(true);
      currentUtterance.current = utterance;
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      currentUtterance.current = null;
      processQueue(); // Procesar siguiente en la cola
    };

    utterance.onerror = (event) => {
      console.error('Error en síntesis de voz:', event);
      setIsSpeaking(false);
      currentUtterance.current = null;
      processQueue();
    };

    window.speechSynthesis.speak(utterance);
  };

  const stop = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    currentUtterance.current = null;
    speechQueue.current = [];
  };

  const toggle = () => {
    setIsEnabled(!isEnabled);
    if (isEnabled) {
      stop();
    }
  };

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      stop();
    };
  }, []);

  const value: ScreenReaderContextType = {
    speak,
    stop,
    isEnabled,
    toggle,
    speed,
    setSpeed,
    pitch,
    setPitch
  };

  return (
    <ScreenReaderContext.Provider value={value}>
      {children}
    </ScreenReaderContext.Provider>
  );
};

interface ScreenReaderControlsProps {
  className?: string;
  showSettings?: boolean;
}

export const ScreenReaderControls: React.FC<ScreenReaderControlsProps> = ({
  className,
  showSettings = true
}) => {
  const { isEnabled, toggle, stop, isSpeaking, speed, setSpeed, pitch, setPitch } = useScreenReader();
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);

  return (
    <Card className={cn("w-full max-w-md", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Volume2 className="h-5 w-5" />
          Lector de Pantalla
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Controles principales */}
        <div className="flex items-center gap-2">
          <Button
            onClick={toggle}
            variant={isEnabled ? "default" : "outline"}
            size="sm"
            className="flex-1"
            aria-label={isEnabled ? "Desactivar lector de pantalla" : "Activar lector de pantalla"}
          >
            {isEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            {isEnabled ? "Activado" : "Desactivado"}
          </Button>
          
          {isEnabled && (
            <Button
              onClick={stop}
              variant="outline"
              size="sm"
              disabled={!isSpeaking}
              aria-label="Detener lectura"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Configuración avanzada */}
        {showSettings && isEnabled && (
          <div className="space-y-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
              className="w-full justify-between"
            >
              <span>Configuración</span>
              <Settings className="h-4 w-4" />
            </Button>

            {showAdvancedSettings && (
              <div className="space-y-3 pt-2 border-t">
                {/* Velocidad */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Velocidad: {speed.toFixed(1)}x
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={speed}
                    onChange={(e) => setSpeed(parseFloat(e.target.value))}
                    className="w-full"
                    aria-label="Ajustar velocidad de lectura"
                  />
                </div>

                {/* Tono */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Tono: {pitch.toFixed(1)}x
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={pitch}
                    onChange={(e) => setPitch(parseFloat(e.target.value))}
                    className="w-full"
                    aria-label="Ajustar tono de voz"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Estado actual */}
        {isEnabled && (
          <div className="text-xs text-muted-foreground">
            {isSpeaking ? (
              <span className="flex items-center gap-1">
                <Play className="h-3 w-3" />
                Leyendo...
              </span>
            ) : (
              <span>Listo para leer</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Hook para usar el lector de pantalla en componentes
export const useScreenReaderAnnouncement = () => {
  const { speak } = useScreenReader();

  const announce = React.useCallback((message: string, priority?: 'high' | 'low') => {
    speak(message, priority);
  }, [speak]);

  return { announce };
};

// Componente para anunciar cambios dinámicos
export const ScreenReaderAnnouncer: React.FC<{ message: string; priority?: 'high' | 'low' }> = ({
  message,
  priority = 'low'
}) => {
  const { announce } = useScreenReaderAnnouncement();

  React.useEffect(() => {
    if (message) {
      announce(message, priority);
    }
  }, [message, priority, announce]);

  return null;
};
