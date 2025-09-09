import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, MicOff, Settings, Volume2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VoiceCommand {
  id: string;
  phrase: string;
  action: () => void;
  description: string;
  category: 'navigation' | 'interaction' | 'accessibility' | 'custom';
}

interface VoiceControlContextType {
  isListening: boolean;
  isSupported: boolean;
  startListening: () => void;
  stopListening: () => void;
  toggleListening: () => void;
  addCommand: (command: VoiceCommand) => void;
  removeCommand: (commandId: string) => void;
  commands: VoiceCommand[];
  lastRecognized: string;
  confidence: number;
}

const VoiceControlContext = React.createContext<VoiceControlContextType | undefined>(undefined);

export const useVoiceControl = () => {
  const context = React.useContext(VoiceControlContext);
  if (!context) {
    throw new Error('useVoiceControl must be used within a VoiceControlProvider');
  }
  return context;
};

interface VoiceControlProviderProps {
  children: React.ReactNode;
  defaultEnabled?: boolean;
  language?: string;
}

export const VoiceControlProvider: React.FC<VoiceControlProviderProps> = ({
  children,
  defaultEnabled = false,
  language = 'es-MX'
}) => {
  const [isListening, setIsListening] = useState(false);
  const [commands, setCommands] = useState<VoiceCommand[]>([]);
  const [lastRecognized, setLastRecognized] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [isSupported, setIsSupported] = useState(false);
  
  const recognitionRef = useRef<any | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Verificar soporte del navegador
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognition);
    
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = language;
      recognitionRef.current.maxAlternatives = 3;
    }
  }, [language]);

  // Configurar eventos de reconocimiento
  useEffect(() => {
    const recognition = recognitionRef.current;
    if (!recognition) return;

    recognition.onstart = () => {
      setIsListening(true);
      console.log('🎤 Reconocimiento de voz iniciado');
    };

    recognition.onend = () => {
      setIsListening(false);
      console.log('🎤 Reconocimiento de voz detenido');
    };

    recognition.onresult = (event: any) => {
      const last = event.results.length - 1;
      const transcript = event.results[last][0].transcript.toLowerCase().trim();
      const confidence = event.results[last][0].confidence;
      
      setLastRecognized(transcript);
      setConfidence(confidence);

      // Buscar comando que coincida
      const matchedCommand = commands.find(command => 
        transcript.includes(command.phrase.toLowerCase())
      );

      if (matchedCommand) {
        console.log(`🎯 Comando reconocido: "${matchedCommand.phrase}"`);
        matchedCommand.action();
        
        // Dar feedback visual/auditivo
        if (window.speechSynthesis) {
          const utterance = new SpeechSynthesisUtterance(`Comando ejecutado: ${matchedCommand.description}`);
          utterance.lang = language;
          window.speechSynthesis.speak(utterance);
        }
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Error en reconocimiento de voz:', event.error);
      setIsListening(false);
    };

    return () => {
      if (recognition) {
        recognition.abort();
      }
    };
  }, [commands, language]);

  const startListening = useCallback(() => {
    if (!isSupported || !recognitionRef.current) {
      console.warn('Reconocimiento de voz no soportado');
      return;
    }

    try {
      recognitionRef.current.start();
    } catch (error) {
      console.error('Error al iniciar reconocimiento:', error);
    }
  }, [isSupported]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  const addCommand = useCallback((command: VoiceCommand) => {
    setCommands(prev => [...prev, command]);
  }, []);

  const removeCommand = useCallback((commandId: string) => {
    setCommands(prev => prev.filter(cmd => cmd.id !== commandId));
  }, []);

  const value: VoiceControlContextType = {
    isListening,
    isSupported,
    startListening,
    stopListening,
    toggleListening,
    addCommand,
    removeCommand,
    commands,
    lastRecognized,
    confidence
  };

  return (
    <VoiceControlContext.Provider value={value}>
      {children}
    </VoiceControlContext.Provider>
  );
};

interface VoiceControlPanelProps {
  className?: string;
  showCommands?: boolean;
  showConfidence?: boolean;
}

export const VoiceControlPanel: React.FC<VoiceControlPanelProps> = ({
  className,
  showCommands = true,
  showConfidence = true
}) => {
  const { 
    isListening, 
    toggleListening, 
    commands, 
    lastRecognized, 
    confidence,
    isSupported 
  } = useVoiceControl();
  
  const [showCommandList, setShowCommandList] = useState(false);

  if (!isSupported) {
    return (
      <Card className={cn("w-full max-w-md", className)}>
        <CardContent className="p-4">
          <div className="text-center text-muted-foreground">
            <MicOff className="h-8 w-8 mx-auto mb-2" />
            <p>Reconocimiento de voz no soportado en este navegador</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("w-full max-w-md", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mic className="h-5 w-5" />
          Control por Voz
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Botón principal */}
        <Button
          onClick={toggleListening}
          variant={isListening ? "destructive" : "default"}
          size="lg"
          className="w-full"
          aria-label={isListening ? "Detener reconocimiento de voz" : "Iniciar reconocimiento de voz"}
        >
          {isListening ? (
            <>
              <MicOff className="h-5 w-5 mr-2" />
              Detener
            </>
          ) : (
            <>
              <Mic className="h-5 w-5 mr-2" />
              Escuchar
            </>
          )}
        </Button>

        {/* Estado de escucha */}
        {isListening && (
          <div className="flex items-center gap-2 text-sm">
            <div className={cn(
              "w-3 h-3 rounded-full animate-pulse",
              isListening ? "bg-green-500" : "bg-gray-400"
            )} />
            <span>Escuchando...</span>
          </div>
        )}

        {/* Último reconocimiento */}
        {lastRecognized && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Último reconocimiento:</label>
            <div className="p-3 bg-muted rounded-md">
              <p className="text-sm">{lastRecognized}</p>
              {showConfidence && (
                <p className="text-xs text-muted-foreground mt-1">
                  Confianza: {(confidence * 100).toFixed(1)}%
                </p>
              )}
            </div>
          </div>
        )}

        {/* Lista de comandos */}
        {showCommands && commands.length > 0 && (
          <div className="space-y-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCommandList(!showCommandList)}
              className="w-full justify-between"
            >
              <span>Comandos disponibles ({commands.length})</span>
              <Settings className="h-4 w-4" />
            </Button>

            {showCommandList && (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {commands.map((command) => (
                  <div key={command.id} className="p-2 bg-muted rounded text-sm">
                    <div className="font-medium">{command.phrase}</div>
                    <div className="text-muted-foreground">{command.description}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Categoría: {command.category}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Comandos por defecto */}
        {commands.length === 0 && (
          <div className="text-xs text-muted-foreground">
            <p>No hay comandos configurados.</p>
            <p>Usa el hook useVoiceControl para agregar comandos personalizados.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Hook para agregar comandos fácilmente
export const useVoiceCommands = () => {
  const { addCommand, removeCommand } = useVoiceControl();

  const registerCommand = useCallback((command: VoiceCommand) => {
    addCommand(command);
    return () => removeCommand(command.id);
  }, [addCommand, removeCommand]);

  return { registerCommand };
};

// Componente para comandos de navegación comunes
export const NavigationVoiceCommands: React.FC = () => {
  const { registerCommand } = useVoiceCommands();

  React.useEffect(() => {
    const unregisterCommands = [
      registerCommand({
        id: 'nav-home',
        phrase: 'ir a inicio',
        action: () => window.location.href = '/',
        description: 'Navegar a la página de inicio',
        category: 'navigation'
      }),
      registerCommand({
        id: 'nav-dashboard',
        phrase: 'ir a dashboard',
        action: () => window.location.href = '/dashboard',
        description: 'Navegar al dashboard',
        category: 'navigation'
      }),
      registerCommand({
        id: 'nav-lessons',
        phrase: 'ir a lecciones',
        action: () => window.location.href = '/lessons',
        description: 'Navegar a las lecciones',
        category: 'navigation'
      }),
      registerCommand({
        id: 'nav-back',
        phrase: 'volver atrás',
        action: () => window.history.back(),
        description: 'Volver a la página anterior',
        category: 'navigation'
      }),
      registerCommand({
        id: 'nav-forward',
        phrase: 'ir adelante',
        action: () => window.history.forward(),
        description: 'Ir a la página siguiente',
        category: 'navigation'
      })
    ];

    return () => {
      unregisterCommands.forEach(unregister => unregister());
    };
  }, [registerCommand]);

  return null;
};
