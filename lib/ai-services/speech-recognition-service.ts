import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import * as tf from '@tensorflow/tfjs';

// Tipos de comandos de voz
export interface VoiceCommand {
  id: string;
  phrase: string;
  action: () => void;
  description: string;
  category: 'navigation' | 'interaction' | 'accessibility' | 'learning' | 'custom';
  confidence: number;
  language: string;
  aliases?: string[];
}

// Configuración de reconocimiento
export interface RecognitionConfig {
  language: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  grammars?: string[];
  culturalContext?: string;
}

// Resultado del reconocimiento
export interface RecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
  alternatives: string[];
  language: string;
  timestamp: number;
  culturalContext?: string;
}

// Eventos del reconocimiento
export interface RecognitionEvents {
  onStart?: () => void;
  onEnd?: () => void;
  onResult?: (result: RecognitionResult) => void;
  onError?: (error: string) => void;
  onCommand?: (command: VoiceCommand) => void;
  onNoMatch?: () => void;
}

export class SpeechRecognitionService {
  private recognition: any = null;
  private _isListening: boolean = false;
  private commands: Map<string, VoiceCommand> = new Map();
  private openai: OpenAI;
  private anthropic: Anthropic;
  private config: RecognitionConfig;
  private events: RecognitionEvents = {};
  private _isSupported: boolean = false;
  private model: tf.LayersModel | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private microphone: MediaStreamAudioSourceNode | null = null;
  private userId?: string;
  private userPreferences?: {
    language: string;
    culturalContext: string;
    accessibility: string[];
  };

  constructor(config: RecognitionConfig) {
    this.config = config;
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
    this.anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
    this.initializeRecognition();
  }

  // Método para configurar el usuario autenticado
  setUserContext(userId: string, preferences: {
    language: string;
    culturalContext: string;
    accessibility: string[];
  }) {
    this.userId = userId;
    this.userPreferences = preferences;
    
    // Actualizar configuración de reconocimiento
    if (this.recognition) {
      this.recognition.lang = preferences.language;
    }
    
    // Registrar comandos específicos del usuario
    this.registerUserSpecificCommands();
  }

  /**
   * Inicializa el reconocimiento de voz
   */
  private initializeRecognition(): void {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    this._isSupported = !!SpeechRecognition;

    if (!this._isSupported) {
      console.warn('Reconocimiento de voz no soportado en este navegador');
      return;
    }

    this.recognition = new SpeechRecognition();
    this.setupRecognition();
  }

  /**
   * Configura el reconocimiento de voz
   */
  private setupRecognition(): void {
    if (!this.recognition) return;

    this.recognition.continuous = this.config.continuous;
    this.recognition.interimResults = this.config.interimResults;
    this.recognition.maxAlternatives = this.config.maxAlternatives;
    this.recognition.lang = this.config.language;

    // Configurar eventos
    this.recognition.onstart = () => {
      this._isListening = true;
      this.events.onStart?.();
      console.log('🎤 Reconocimiento de voz iniciado');
    };

    this.recognition.onend = () => {
      this._isListening = false;
      this.events.onEnd?.();
      console.log('🎤 Reconocimiento de voz detenido');
    };

    this.recognition.onresult = (event: any) => {
      this.handleRecognitionResult(event);
    };

    this.recognition.onerror = (event: any) => {
      const error = this.mapError(event.error);
      this.events.onError?.(error);
      console.error('Error en reconocimiento de voz:', error);
    };

    this.recognition.onnomatch = () => {
      this.events.onNoMatch?.();
      console.log('No se reconoció ningún comando');
    };
  }

  /**
   * Maneja los resultados del reconocimiento
   */
  private async handleRecognitionResult(event: any): Promise<void> {
    const last = event.results.length - 1;
    const result = event.results[last][0];
    
    const recognitionResult: RecognitionResult = {
      transcript: result.transcript.toLowerCase().trim(),
      confidence: result.confidence,
      isFinal: event.results[last].isFinal,
      alternatives: Array.from(event.results[last]).map((r: any) => r.transcript),
      language: this.config.language,
      timestamp: Date.now(),
      culturalContext: this.config.culturalContext
    };

    this.events.onResult?.(recognitionResult);

    if (recognitionResult.isFinal) {
      await this.processCommand(recognitionResult);
    }
  }

  /**
   * Procesa comandos de voz usando IA
   */
  private async processCommand(result: RecognitionResult): Promise<void> {
    try {
      // Buscar comando exacto
      const exactCommand = this.findExactCommand(result.transcript);
      if (exactCommand) {
        this.events.onCommand?.(exactCommand);
        exactCommand.action();
        return;
      }

      // Usar IA para interpretar comando
      const interpretedCommand = await this.interpretCommandWithAI(result);
      if (interpretedCommand) {
        this.events.onCommand?.(interpretedCommand);
        interpretedCommand.action();
        return;
      }

      // Buscar comando por similitud
      const similarCommand = this.findSimilarCommand(result.transcript);
      if (similarCommand && similarCommand.confidence > 0.7) {
        this.events.onCommand?.(similarCommand);
        similarCommand.action();
        return;
      }

    } catch (error) {
      console.error('Error procesando comando:', error);
      this.events.onError?.('Error procesando comando de voz');
    }
  }

  /**
   * Busca comando exacto
   */
  private findExactCommand(transcript: string): VoiceCommand | null {
    for (const command of this.commands.values()) {
      if (transcript.includes(command.phrase.toLowerCase())) {
        return command;
      }
      
      // Verificar alias
      if (command.aliases) {
        for (const alias of command.aliases) {
          if (transcript.includes(alias.toLowerCase())) {
            return command;
          }
        }
      }
    }
    return null;
  }

  /**
   * Busca comando por similitud
   */
  private findSimilarCommand(transcript: string): VoiceCommand | null {
    let bestMatch: VoiceCommand | null = null;
    let bestScore = 0;

    for (const command of this.commands.values()) {
      const score = this.calculateSimilarity(transcript, command.phrase);
      if (score > bestScore && score > 0.6) {
        bestScore = score;
        bestMatch = command;
      }
    }

    if (bestMatch) {
      bestMatch.confidence = bestScore;
    }

    return bestMatch;
  }

  /**
   * Calcula similitud entre dos strings
   */
  private calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  /**
   * Calcula distancia de Levenshtein
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  /**
   * Interpreta comando usando IA
   */
  private async interpretCommandWithAI(result: RecognitionResult): Promise<VoiceCommand | null> {
    try {
      const prompt = `
        Analiza el siguiente comando de voz y determina la acción más apropiada:
        
        Comando: "${result.transcript}"
        Idioma: ${result.language}
        Contexto cultural: ${result.culturalContext || 'general'}
        
        Comandos disponibles:
        ${Array.from(this.commands.values()).map(cmd => 
          `- ${cmd.phrase}: ${cmd.description} (categoría: ${cmd.category})`
        ).join('\n')}
        
        Responde en JSON con:
        {
          "commandId": "id del comando más apropiado",
          "confidence": 0.0-1.0,
          "reasoning": "explicación de por qué este comando es apropiado"
        }
        
        Si no hay comando apropiado, responde con "commandId": null
      `;

      const response = await this.anthropic.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 500,
        messages: [{ role: 'user', content: prompt }]
      });

      const interpretation = JSON.parse(response.content[0].text);
      
      if (interpretation.commandId && this.commands.has(interpretation.commandId)) {
        const command = this.commands.get(interpretation.commandId)!;
        command.confidence = interpretation.confidence;
        return command;
      }

      return null;
    } catch (error) {
      console.error('Error interpretando comando con IA:', error);
      return null;
    }
  }

  /**
   * Registra un comando de voz
   */
  registerCommand(command: VoiceCommand): void {
    this.commands.set(command.id, command);
  }

  /**
   * Desregistra un comando
   */
  unregisterCommand(commandId: string): boolean {
    return this.commands.delete(commandId);
  }

  /**
   * Registra comandos predefinidos
   */
  registerDefaultCommands(): void {
    const defaultCommands: VoiceCommand[] = [
      // Navegación
      {
        id: 'navigate-home',
        phrase: 'ir a inicio',
        action: () => window.location.href = '/',
        description: 'Navegar a la página de inicio',
        category: 'navigation',
        confidence: 0.9,
        language: 'es-MX',
        aliases: ['inicio', 'casa', 'página principal']
      },
      {
        id: 'navigate-back',
        phrase: 'volver atrás',
        action: () => window.history.back(),
        description: 'Volver a la página anterior',
        category: 'navigation',
        confidence: 0.9,
        language: 'es-MX',
        aliases: ['atrás', 'regresar', 'anterior']
      },
      {
        id: 'navigate-forward',
        phrase: 'avanzar',
        action: () => window.history.forward(),
        description: 'Avanzar a la siguiente página',
        category: 'navigation',
        confidence: 0.9,
        language: 'es-MX',
        aliases: ['siguiente', 'adelante']
      },

      // Accesibilidad
      {
        id: 'toggle-screen-reader',
        phrase: 'activar lector de pantalla',
        action: () => {
          // Implementar toggle del lector de pantalla
          console.log('Toggle screen reader');
        },
        description: 'Activar o desactivar el lector de pantalla',
        category: 'accessibility',
        confidence: 0.9,
        language: 'es-MX',
        aliases: ['lector de pantalla', 'narración', 'audio']
      },
      {
        id: 'increase-font-size',
        phrase: 'aumentar tamaño de letra',
        action: () => {
          // Implementar aumento de tamaño de fuente
          console.log('Increase font size');
        },
        description: 'Aumentar el tamaño de la fuente',
        category: 'accessibility',
        confidence: 0.9,
        language: 'es-MX',
        aliases: ['letra más grande', 'texto más grande']
      },
      {
        id: 'decrease-font-size',
        phrase: 'disminuir tamaño de letra',
        action: () => {
          // Implementar disminución de tamaño de fuente
          console.log('Decrease font size');
        },
        description: 'Disminuir el tamaño de la fuente',
        category: 'accessibility',
        confidence: 0.9,
        language: 'es-MX',
        aliases: ['letra más pequeña', 'texto más pequeño']
      },

      // Interacción
      {
        id: 'click-element',
        phrase: 'hacer clic',
        action: () => {
          // Implementar clic en elemento seleccionado
          console.log('Click element');
        },
        description: 'Hacer clic en el elemento seleccionado',
        category: 'interaction',
        confidence: 0.9,
        language: 'es-MX',
        aliases: ['clic', 'seleccionar', 'activar']
      },
      {
        id: 'scroll-up',
        phrase: 'subir',
        action: () => window.scrollBy(0, -100),
        description: 'Subir en la página',
        category: 'interaction',
        confidence: 0.9,
        language: 'es-MX',
        aliases: ['arriba', 'scroll arriba']
      },
      {
        id: 'scroll-down',
        phrase: 'bajar',
        action: () => window.scrollBy(0, 100),
        description: 'Bajar en la página',
        category: 'interaction',
        confidence: 0.9,
        language: 'es-MX',
        aliases: ['abajo', 'scroll abajo']
      },

      // Aprendizaje
      {
        id: 'start-lesson',
        phrase: 'iniciar lección',
        action: () => {
          // Implementar inicio de lección
          console.log('Start lesson');
        },
        description: 'Iniciar una nueva lección',
        category: 'learning',
        confidence: 0.9,
        language: 'es-MX',
        aliases: ['comenzar lección', 'empezar lección', 'nueva lección']
      },
      {
        id: 'pause-lesson',
        phrase: 'pausar lección',
        action: () => {
          // Implementar pausa de lección
          console.log('Pause lesson');
        },
        description: 'Pausar la lección actual',
        category: 'learning',
        confidence: 0.9,
        language: 'es-MX',
        aliases: ['detener lección', 'parar lección']
      },
      {
        id: 'repeat-content',
        phrase: 'repetir contenido',
        action: () => {
          // Implementar repetición de contenido
          console.log('Repeat content');
        },
        description: 'Repetir el contenido actual',
        category: 'learning',
        confidence: 0.9,
        language: 'es-MX',
        aliases: ['repetir', 'otra vez', 'de nuevo']
      }
    ];

    defaultCommands.forEach(command => this.registerCommand(command));
  }

  /**
   * Inicia el reconocimiento de voz
   */
  start(): void {
    if (!this.isSupported || !this.recognition) {
      throw new Error('Reconocimiento de voz no soportado');
    }

    if (this._isListening) {
      console.warn('El reconocimiento ya está activo');
      return;
    }

    try {
      this.recognition.start();
    } catch (error) {
      console.error('Error iniciando reconocimiento:', error);
      throw error;
    }
  }

  /**
   * Detiene el reconocimiento de voz
   */
  stop(): void {
    if (!this.recognition || !this._isListening) return;

    try {
      this.recognition.stop();
    } catch (error) {
      console.error('Error deteniendo reconocimiento:', error);
    }
  }

  /**
   * Configura eventos
   */
  on(events: RecognitionEvents): void {
    this.events = { ...this.events, ...events };
  }

  /**
   * Mapea errores del reconocimiento
   */
  private mapError(error: string): string {
    const errorMap: Record<string, string> = {
      'no-speech': 'No se detectó voz',
      'audio-capture': 'Error capturando audio',
      'not-allowed': 'Permiso denegado para micrófono',
      'network': 'Error de red',
      'service-not-allowed': 'Servicio no permitido',
      'bad-grammar': 'Error de gramática',
      'language-not-supported': 'Idioma no soportado'
    };

    return errorMap[error] || `Error desconocido: ${error}`;
  }

  /**
   * Verifica si el reconocimiento está soportado
   */
  isSupported(): boolean {
    return this._isSupported;
  }

  /**
   * Verifica si está escuchando
   */
  isListening(): boolean {
    return this._isListening;
  }

  /**
   * Obtiene comandos registrados
   */
  getCommands(): VoiceCommand[] {
    return Array.from(this.commands.values());
  }

  /**
   * Obtiene comandos por categoría
   */
  getCommandsByCategory(category: string): VoiceCommand[] {
    return this.getCommands().filter(cmd => cmd.category === category);
  }

  /**
   * Limpia todos los comandos
   */
  clearCommands(): void {
    this.commands.clear();
  }

  /**
   * Cambia el idioma del reconocimiento
   */
  setLanguage(language: string): void {
    this.config.language = language;
    if (this.recognition) {
      this.recognition.lang = language;
    }
  }

  /**
   * Obtiene el idioma actual
   */
  getLanguage(): string {
    return this.config.language;
  }

  /**
   * Configura el contexto cultural
   */
  setCulturalContext(context: string): void {
    this.config.culturalContext = context;
  }

  /**
   * Obtiene el contexto cultural
   */
  getCulturalContext(): string | undefined {
    return this.config.culturalContext;
  }
}

// Instancia singleton
export const speechRecognitionService = new SpeechRecognitionService({
  language: 'es-MX',
  continuous: true,
  interimResults: true,
  maxAlternatives: 3,
  culturalContext: 'maya'
});
