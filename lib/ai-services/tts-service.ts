import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

// Configuraciones de voz para diferentes idiomas y culturas
interface VoiceConfig {
  voice: string;
  pitch: number;
  speed: number;
  language: string;
  gender: 'male' | 'female' | 'neutral';
  provider: 'openai' | 'azure' | 'google' | 'elevenlabs';
  culturalContext?: string;
}

// Configuraciones de voz por idioma/cultura
const VOICE_CONFIGS: Record<string, VoiceConfig> = {
  // Español estándar
  'es-MX': {
    voice: 'alloy',
    pitch: 0,
    speed: 1,
    language: 'es-MX',
    gender: 'neutral',
    provider: 'openai'
  },
  'es-GT': {
    voice: 'echo',
    pitch: 0,
    speed: 0.9,
    language: 'es-GT',
    gender: 'male',
    provider: 'openai'
  },
  
  // Idiomas indígenas
  'maya': {
    voice: 'nova',
    pitch: -1,
    speed: 0.85,
    language: 'maya',
    gender: 'female',
    provider: 'openai',
    culturalContext: 'maya'
  },
  'k\'iche\'': {
    voice: 'onyx',
    pitch: -2,
    speed: 0.8,
    language: 'k\'iche\'',
    gender: 'male',
    provider: 'openai',
    culturalContext: 'maya'
  },
  'nahuatl': {
    voice: 'fable',
    pitch: 1,
    speed: 0.9,
    language: 'nahuatl',
    gender: 'neutral',
    provider: 'openai',
    culturalContext: 'nahuatl'
  },
  'quechua': {
    voice: 'shimmer',
    pitch: 0,
    speed: 0.85,
    language: 'quechua',
    gender: 'female',
    provider: 'openai',
    culturalContext: 'quechua'
  },
  
  // Inglés
  'en-US': {
    voice: 'alloy',
    pitch: 0,
    speed: 1,
    language: 'en-US',
    gender: 'neutral',
    provider: 'openai'
  },
  
  // Portugués
  'pt-BR': {
    voice: 'echo',
    pitch: 0,
    speed: 0.95,
    language: 'pt-BR',
    gender: 'male',
    provider: 'openai'
  }
};

export class TTSService {
  private openai: OpenAI;
  private anthropic: Anthropic;
  private cache: Map<string, ArrayBuffer> = new Map();
  private audioContext: AudioContext | null = null;

  constructor() {
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
    this.anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
  }

  /**
   * Sintetiza texto a voz con configuración específica
   */
  async synthesize(
    text: string,
    language: string = 'es-MX',
    options: {
      pitch?: number;
      speed?: number;
      gender?: 'male' | 'female' | 'neutral';
      culturalContext?: string;
      cache?: boolean;
    } = {}
  ): Promise<ArrayBuffer> {
    const config = this.getVoiceConfig(language, options);
    const cacheKey = this.generateCacheKey(text, config);

    // Verificar caché
    if (options.cache !== false && this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    try {
      // Preprocesar texto según contexto cultural
      const processedText = await this.preprocessText(text, config);
      
      // Sintetizar audio
      const audioBuffer = await this.generateAudio(processedText, config);
      
      // Cachear resultado
      if (options.cache !== false) {
        this.cache.set(cacheKey, audioBuffer);
      }

      return audioBuffer;
    } catch (error) {
      console.error('Error en síntesis de voz:', error);
      throw new Error(`Error generando audio: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Obtiene configuración de voz para un idioma
   */
  getVoiceConfig(language: string, options: any): VoiceConfig {
    const baseConfig = VOICE_CONFIGS[language] || VOICE_CONFIGS['es-MX'];
    
    return {
      ...baseConfig,
      pitch: options.pitch ?? baseConfig.pitch,
      speed: options.speed ?? baseConfig.speed,
      gender: options.gender ?? baseConfig.gender,
      culturalContext: options.culturalContext ?? baseConfig.culturalContext
    };
  }

  /**
   * Preprocesa texto según contexto cultural
   */
  private async preprocessText(text: string, config: VoiceConfig): Promise<string> {
    if (!config.culturalContext) return text;

    // Adaptar pronunciación para idiomas indígenas
    const culturalAdaptations: Record<string, (text: string) => string> = {
      'maya': (text) => {
        // Adaptar pronunciación maya
        return text
          .replace(/x/g, 'sh') // 'x' se pronuncia como 'sh' en maya
          .replace(/j/g, 'h')  // 'j' se pronuncia como 'h' en maya
          .replace(/k'/g, 'k glotal'); // 'k\'' es k glotal
      },
      'nahuatl': (text) => {
        // Adaptar pronunciación náhuatl
        return text
          .replace(/tl/g, 't-l') // 'tl' se pronuncia separado
          .replace(/x/g, 'sh')   // 'x' se pronuncia como 'sh'
          .replace(/h/g, 'j');   // 'h' se pronuncia como 'j'
      },
      'quechua': (text) => {
        // Adaptar pronunciación quechua
        return text
          .replace(/ñ/g, 'ny')   // 'ñ' se pronuncia como 'ny'
          .replace(/q/g, 'k');   // 'q' se pronuncia como 'k'
      }
    };

    const adaptation = culturalAdaptations[config.culturalContext];
    return adaptation ? adaptation(text) : text;
  }

  /**
   * Genera audio usando el proveedor configurado
   */
  private async generateAudio(text: string, config: VoiceConfig): Promise<ArrayBuffer> {
    switch (config.provider) {
      case 'openai':
        return this.generateWithOpenAI(text, config);
      case 'azure':
        return this.generateWithAzure(text, config);
      case 'google':
        return this.generateWithGoogle(text, config);
      case 'elevenlabs':
        return this.generateWithElevenLabs(text, config);
      default:
        throw new Error(`Proveedor de TTS no soportado: ${config.provider}`);
    }
  }

  /**
   * Genera audio usando OpenAI TTS
   */
  private async generateWithOpenAI(text: string, config: VoiceConfig): Promise<ArrayBuffer> {
    try {
      const response = await this.openai.audio.speech.create({
        model: 'tts-1',
        voice: config.voice as any,
        input: text,
        response_format: 'mp3',
        speed: config.speed
      });

      const arrayBuffer = await response.arrayBuffer();
      return arrayBuffer;
    } catch (error) {
      console.error('Error con OpenAI TTS:', error);
      throw error;
    }
  }

  /**
   * Genera audio usando Azure Cognitive Services
   */
  private async generateWithAzure(text: string, config: VoiceConfig): Promise<ArrayBuffer> {
    // Implementación con Azure Cognitive Services
    const endpoint = process.env.AZURE_SPEECH_ENDPOINT;
    const key = process.env.AZURE_SPEECH_KEY;

    if (!endpoint || !key) {
      throw new Error('Azure Speech Services no configurado');
    }

    const url = `${endpoint}/cognitiveservices/v1`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': key,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3'
      },
      body: this.generateSSML(text, config)
    });

    if (!response.ok) {
      throw new Error(`Azure TTS error: ${response.statusText}`);
    }

    return await response.arrayBuffer();
  }

  /**
   * Genera audio usando Google Cloud TTS
   */
  private async generateWithGoogle(text: string, config: VoiceConfig): Promise<ArrayBuffer> {
    // Implementación con Google Cloud TTS
    const apiKey = process.env.GOOGLE_CLOUD_API_KEY;
    
    if (!apiKey) {
      throw new Error('Google Cloud TTS no configurado');
    }

    const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        input: { text },
        voice: {
          languageCode: config.language,
          name: config.voice,
          ssmlGender: config.gender.toUpperCase()
        },
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate: config.speed,
          pitch: config.pitch
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Google TTS error: ${response.statusText}`);
    }

    const data = await response.json();
    const audioContent = data.audioContent;
    return Buffer.from(audioContent, 'base64');
  }

  /**
   * Genera audio usando ElevenLabs
   */
  private async generateWithElevenLabs(text: string, config: VoiceConfig): Promise<ArrayBuffer> {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    
    if (!apiKey) {
      throw new Error('ElevenLabs no configurado');
    }

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${config.voice}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
          style: 0.0,
          use_speaker_boost: true
        }
      })
    });

    if (!response.ok) {
      throw new Error(`ElevenLabs error: ${response.statusText}`);
    }

    return await response.arrayBuffer();
  }

  /**
   * Genera SSML para Azure TTS
   */
  private generateSSML(text: string, config: VoiceConfig): string {
    return `
      <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${config.language}">
        <voice name="${config.voice}">
          <prosody rate="${config.speed}" pitch="${config.pitch}st">
            ${text}
          </prosody>
        </voice>
      </speak>
    `;
  }

  /**
   * Genera clave de caché única
   */
  private generateCacheKey(text: string, config: VoiceConfig): string {
    const configHash = JSON.stringify({
      voice: config.voice,
      pitch: config.pitch,
      speed: config.speed,
      language: config.language,
      gender: config.gender,
      culturalContext: config.culturalContext
    });
    
    return `${text}_${configHash}`;
  }

  /**
   * Reproduce audio en el navegador
   */
  async playAudio(audioBuffer: ArrayBuffer): Promise<void> {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    try {
      const audioBufferSource = await this.audioContext.decodeAudioData(audioBuffer);
      const source = this.audioContext.createBufferSource();
      source.buffer = audioBufferSource;
      source.connect(this.audioContext.destination);
      source.start(0);
    } catch (error) {
      console.error('Error reproduciendo audio:', error);
      throw error;
    }
  }

  /**
   * Limpia el caché
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Obtiene estadísticas del caché
   */
  getCacheStats(): { size: number; entries: number } {
    let totalSize = 0;
    this.cache.forEach(buffer => {
      totalSize += buffer.byteLength;
    });

    return {
      size: totalSize,
      entries: this.cache.size
    };
  }

  /**
   * Lista idiomas soportados
   */
  getSupportedLanguages(): string[] {
    return Object.keys(VOICE_CONFIGS);
  }

  /**
   * Obtiene configuración de voz para un idioma
   */
  getVoiceConfig(language: string): VoiceConfig | null {
    return VOICE_CONFIGS[language] || null;
  }
}

// Instancia singleton
export const ttsService = new TTSService();
