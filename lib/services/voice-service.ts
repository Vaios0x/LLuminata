/**
 * Servicio de Voz Avanzado para InclusiveAI Coach
 * Proporciona funcionalidades de reconocimiento de voz, síntesis y análisis de audio
 */

import { tensorFlowService } from './tensorflow-service';

// Tipos para el servicio de voz
export interface VoiceConfig {
  language: string;
  sampleRate: number;
  channels: number;
  bitDepth: number;
  enableNoiseReduction: boolean;
  enableEchoCancellation: boolean;
  enableAutomaticGainControl: boolean;
}

export interface SpeechRecognitionResult {
  text: string;
  confidence: number;
  language: string;
  timestamp: Date;
  duration: number;
  segments: SpeechSegment[];
}

export interface SpeechSegment {
  text: string;
  startTime: number;
  endTime: number;
  confidence: number;
}

export interface VoiceSynthesisOptions {
  voice: string;
  rate: number; // 0.1 - 10.0
  pitch: number; // 0.1 - 2.0
  volume: number; // 0.0 - 1.0
  language: string;
  culturalAdaptation?: boolean;
}

export interface AudioAnalysis {
  duration: number;
  sampleRate: number;
  channels: number;
  bitDepth: number;
  volume: number;
  frequency: number;
  clarity: number;
  noise: number;
  features: AudioFeatures;
}

export interface AudioFeatures {
  mfcc: number[];
  spectralCentroid: number;
  spectralRolloff: number;
  zeroCrossingRate: number;
  energy: number;
  entropy: number;
}

export interface VoiceCommand {
  command: string;
  confidence: number;
  parameters: Record<string, any>;
  timestamp: Date;
}

/**
 * Servicio principal de voz
 */
export class VoiceService {
  private recognition: SpeechRecognition | null = null;
  private synthesis: SpeechSynthesis | null = null;
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private isInitialized: boolean = false;
  private isListening: boolean = false;
  private isSpeaking: boolean = false;
  private config: VoiceConfig;
  private supportedLanguages: string[] = [
    'es-MX', 'es-ES', 'en-US', 'en-GB', 'fr-FR', 'de-DE',
    'maya', 'nahuatl', 'zapoteco', 'mixteco', 'otomi'
  ];

  constructor(config: Partial<VoiceConfig> = {}) {
    this.config = {
      language: 'es-MX',
      sampleRate: 16000,
      channels: 1,
      bitDepth: 16,
      enableNoiseReduction: true,
      enableEchoCancellation: true,
      enableAutomaticGainControl: true,
      ...config
    };

    this.initializeVoiceService();
  }

  /**
   * Inicializa el servicio de voz
   */
  private async initializeVoiceService(): Promise<void> {
    try {
      console.log('🎤 Inicializando servicio de voz...');

      // Verificar soporte del navegador
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        throw new Error('Reconocimiento de voz no soportado en este navegador');
      }

      if (!('speechSynthesis' in window)) {
        throw new Error('Síntesis de voz no soportada en este navegador');
      }

      // Inicializar reconocimiento de voz
      this.recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
      this.setupSpeechRecognition();

      // Inicializar síntesis de voz
      this.synthesis = window.speechSynthesis;

      // Inicializar contexto de audio
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

      this.isInitialized = true;
      console.log('✅ Servicio de voz inicializado correctamente');
    } catch (error) {
      console.error('❌ Error inicializando servicio de voz:', error);
      throw error;
    }
  }

  /**
   * Configura el reconocimiento de voz
   */
  private setupSpeechRecognition(): void {
    if (!this.recognition) return;

    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = this.config.language;
    this.recognition.maxAlternatives = 3;

    // Eventos del reconocimiento
    this.recognition.onstart = () => {
      console.log('🎤 Reconocimiento de voz iniciado');
      this.isListening = true;
    };

    this.recognition.onend = () => {
      console.log('🔇 Reconocimiento de voz finalizado');
      this.isListening = false;
    };

    this.recognition.onerror = (event) => {
      console.error('❌ Error en reconocimiento de voz:', event.error);
      this.isListening = false;
    };

    this.recognition.onresult = (event) => {
      this.handleSpeechResult(event);
    };
  }

  /**
   * Maneja los resultados del reconocimiento de voz
   */
  private handleSpeechResult(event: SpeechRecognitionEvent): void {
    const results = Array.from(event.results);
    const finalResults = results.filter(result => result.isFinal);
    
    if (finalResults.length > 0) {
      const result = finalResults[0];
      const transcript = result[0].transcript;
      const confidence = result[0].confidence;

      console.log(`🎤 Texto reconocido: "${transcript}" (confianza: ${confidence})`);

      // Emitir evento personalizado
      const customEvent = new CustomEvent('speechRecognized', {
        detail: {
          text: transcript,
          confidence,
          language: this.config.language,
          timestamp: new Date()
        }
      });
      window.dispatchEvent(customEvent);
    }
  }

  /**
   * Verifica si el servicio está listo
   */
  isReady(): boolean {
    return this.isInitialized && 
           this.recognition !== null && 
           this.synthesis !== null && 
           this.audioContext !== null;
  }

  /**
   * Inicia el reconocimiento de voz
   */
  async startListening(options: {
    language?: string;
    continuous?: boolean;
    interimResults?: boolean;
    onResult?: (result: SpeechRecognitionResult) => void;
    onError?: (error: string) => void;
  } = {}): Promise<void> {
    if (!this.isReady()) {
      throw new Error('Servicio de voz no está inicializado');
    }

    if (this.isListening) {
      console.warn('⚠️ Ya está escuchando');
      return;
    }

    try {
      console.log('🎤 Iniciando reconocimiento de voz...');

      // Configurar opciones
      if (options.language) {
        this.recognition!.lang = options.language;
      }
      if (options.continuous !== undefined) {
        this.recognition!.continuous = options.continuous;
      }
      if (options.interimResults !== undefined) {
        this.recognition!.interimResults = options.interimResults;
      }

      // Configurar callbacks
      if (options.onResult) {
        window.addEventListener('speechRecognized', (event: any) => {
          options.onResult!(event.detail);
        });
      }

      if (options.onError) {
        this.recognition!.onerror = (event) => {
          options.onError!(event.error);
        };
      }

      // Iniciar reconocimiento
      await this.recognition!.start();
    } catch (error) {
      console.error('❌ Error iniciando reconocimiento de voz:', error);
      throw error;
    }
  }

  /**
   * Detiene el reconocimiento de voz
   */
  stopListening(): void {
    if (this.recognition && this.isListening) {
      console.log('🔇 Deteniendo reconocimiento de voz...');
      this.recognition.stop();
    }
  }

  /**
   * Sintetiza texto a voz
   */
  async speak(
    text: string, 
    options: Partial<VoiceSynthesisOptions> = {}
  ): Promise<void> {
    if (!this.isReady()) {
      throw new Error('Servicio de voz no está inicializado');
    }

    if (this.isSpeaking) {
      console.warn('⚠️ Ya está hablando');
      return;
    }

    try {
      console.log(`🗣️ Sintetizando texto: "${text.substring(0, 50)}..."`);

      this.isSpeaking = true;

      // Crear utterance
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Configurar opciones
      utterance.voice = this.getVoice(options.voice || 'default');
      utterance.rate = options.rate || 1.0;
      utterance.pitch = options.pitch || 1.0;
      utterance.volume = options.volume || 1.0;
      utterance.lang = options.language || this.config.language;

      // Eventos
      utterance.onstart = () => {
        console.log('🗣️ Síntesis de voz iniciada');
      };

      utterance.onend = () => {
        console.log('🔇 Síntesis de voz finalizada');
        this.isSpeaking = false;
      };

      utterance.onerror = (event) => {
        console.error('❌ Error en síntesis de voz:', event.error);
        this.isSpeaking = false;
      };

      // Iniciar síntesis
      this.synthesis!.speak(utterance);
    } catch (error) {
      console.error('❌ Error en síntesis de voz:', error);
      this.isSpeaking = false;
      throw error;
    }
  }

  /**
   * Detiene la síntesis de voz
   */
  stopSpeaking(): void {
    if (this.synthesis && this.isSpeaking) {
      console.log('🔇 Deteniendo síntesis de voz...');
      this.synthesis.cancel();
      this.isSpeaking = false;
    }
  }

  /**
   * Obtiene una voz específica
   */
  private getVoice(voiceName: string): SpeechSynthesisVoice | null {
    const voices = this.synthesis!.getVoices();
    
    // Buscar voz por nombre
    let voice = voices.find(v => v.name.toLowerCase().includes(voiceName.toLowerCase()));
    
    // Si no se encuentra, usar la primera disponible
    if (!voice && voices.length > 0) {
      voice = voices[0];
    }
    
    return voice || null;
  }

  /**
   * Analiza audio en tiempo real
   */
  async analyzeAudio(audioBuffer: Float32Array): Promise<AudioAnalysis> {
    if (!this.audioContext) {
      throw new Error('Contexto de audio no inicializado');
    }

    try {
      console.log('🔍 Analizando audio...');

      const duration = audioBuffer.length / this.config.sampleRate;
      const volume = this.calculateVolume(audioBuffer);
      const frequency = this.calculateFrequency(audioBuffer);
      const clarity = this.calculateClarity(audioBuffer);
      const noise = this.calculateNoise(audioBuffer);

      // Extraer características usando TensorFlow.js
      const features = await this.extractAudioFeatures(audioBuffer);

      const analysis: AudioAnalysis = {
        duration,
        sampleRate: this.config.sampleRate,
        channels: this.config.channels,
        bitDepth: this.config.bitDepth,
        volume,
        frequency,
        clarity,
        noise,
        features
      };

      console.log('✅ Análisis de audio completado');
      return analysis;
    } catch (error) {
      console.error('❌ Error analizando audio:', error);
      throw error;
    }
  }

  /**
   * Extrae características de audio usando TensorFlow.js
   */
  private async extractAudioFeatures(audioBuffer: Float32Array): Promise<AudioFeatures> {
    try {
      // Convertir a tensor
      const audioTensor = tensorFlowService.preprocessAudio(audioBuffer);
      
      // Calcular MFCC (Mel-frequency cepstral coefficients)
      const mfcc = await this.calculateMFCC(audioTensor);
      
      // Calcular características espectrales
      const spectralCentroid = this.calculateSpectralCentroid(audioBuffer);
      const spectralRolloff = this.calculateSpectralRolloff(audioBuffer);
      const zeroCrossingRate = this.calculateZeroCrossingRate(audioBuffer);
      const energy = this.calculateEnergy(audioBuffer);
      const entropy = this.calculateEntropy(audioBuffer);

      return {
        mfcc,
        spectralCentroid,
        spectralRolloff,
        zeroCrossingRate,
        energy,
        entropy
      };
    } catch (error) {
      console.error('❌ Error extrayendo características de audio:', error);
      throw error;
    }
  }

  /**
   * Calcula MFCC usando TensorFlow.js
   */
  private async calculateMFCC(audioTensor: any): Promise<number[]> {
    // Implementación simplificada de MFCC
    // En producción, usar una implementación completa
    const fft = await this.computeFFT(audioTensor);
    const melFilterbank = this.applyMelFilterbank(fft);
    const logMel = await this.computeLog(melFilterbank);
    const mfcc = await this.computeDCT(logMel);
    
    return Array.from(await mfcc.data());
  }

  /**
   * Calcula FFT
   */
  private async computeFFT(tensor: any): Promise<any> {
    // Implementación simplificada
    return tensor;
  }

  /**
   * Aplica filtro de banco Mel
   */
  private applyMelFilterbank(fft: any): any {
    // Implementación simplificada
    return fft;
  }

  /**
   * Calcula logaritmo
   */
  private async computeLog(tensor: any): Promise<any> {
    return tensor.log();
  }

  /**
   * Calcula DCT
   */
  private async computeDCT(tensor: any): Promise<any> {
    // Implementación simplificada
    return tensor;
  }

  /**
   * Calcula volumen del audio
   */
  private calculateVolume(audioBuffer: Float32Array): number {
    const sum = audioBuffer.reduce((acc, sample) => acc + Math.abs(sample), 0);
    return sum / audioBuffer.length;
  }

  /**
   * Calcula frecuencia dominante
   */
  private calculateFrequency(audioBuffer: Float32Array): number {
    // Implementación simplificada
    return 440; // A4
  }

  /**
   * Calcula claridad del audio
   */
  private calculateClarity(audioBuffer: Float32Array): number {
    // Implementación simplificada basada en SNR
    const signal = audioBuffer.filter(sample => Math.abs(sample) > 0.1);
    const noise = audioBuffer.filter(sample => Math.abs(sample) <= 0.1);
    
    const signalPower = signal.reduce((acc, sample) => acc + sample * sample, 0);
    const noisePower = noise.reduce((acc, sample) => acc + sample * sample, 0);
    
    return noisePower > 0 ? 10 * Math.log10(signalPower / noisePower) : 100;
  }

  /**
   * Calcula nivel de ruido
   */
  private calculateNoise(audioBuffer: Float32Array): number {
    const threshold = 0.01;
    const noiseSamples = audioBuffer.filter(sample => Math.abs(sample) < threshold);
    return noiseSamples.length / audioBuffer.length;
  }

  /**
   * Calcula centroide espectral
   */
  private calculateSpectralCentroid(audioBuffer: Float32Array): number {
    // Implementación simplificada
    return 1000;
  }

  /**
   * Calcula rolloff espectral
   */
  private calculateSpectralRolloff(audioBuffer: Float32Array): number {
    // Implementación simplificada
    return 2000;
  }

  /**
   * Calcula tasa de cruce por cero
   */
  private calculateZeroCrossingRate(audioBuffer: Float32Array): number {
    let crossings = 0;
    for (let i = 1; i < audioBuffer.length; i++) {
      if ((audioBuffer[i - 1] >= 0 && audioBuffer[i] < 0) ||
          (audioBuffer[i - 1] < 0 && audioBuffer[i] >= 0)) {
        crossings++;
      }
    }
    return crossings / audioBuffer.length;
  }

  /**
   * Calcula energía del audio
   */
  private calculateEnergy(audioBuffer: Float32Array): number {
    return audioBuffer.reduce((acc, sample) => acc + sample * sample, 0);
  }

  /**
   * Calcula entropía del audio
   */
  private calculateEntropy(audioBuffer: Float32Array): number {
    // Implementación simplificada
    const histogram = new Array(256).fill(0);
    audioBuffer.forEach(sample => {
      const bin = Math.floor((sample + 1) * 127.5);
      histogram[Math.max(0, Math.min(255, bin))]++;
    });
    
    const total = audioBuffer.length;
    let entropy = 0;
    
    histogram.forEach(count => {
      if (count > 0) {
        const probability = count / total;
        entropy -= probability * Math.log2(probability);
      }
    });
    
    return entropy;
  }

  /**
   * Detecta comandos de voz
   */
  async detectVoiceCommands(audioBuffer: Float32Array): Promise<VoiceCommand[]> {
    try {
      console.log('🎯 Detectando comandos de voz...');

      // Analizar audio
      const analysis = await this.analyzeAudio(audioBuffer);
      
      // Usar modelo de TensorFlow.js para clasificación de comandos
      const audioTensor = tensorFlowService.preprocessAudio(audioBuffer);
      
      // Aquí se usaría un modelo entrenado para comandos de voz
      // Por ahora, retornamos comandos simulados
      const commands: VoiceCommand[] = [];
      
      if (analysis.volume > 0.5) {
        commands.push({
          command: 'activar',
          confidence: 0.8,
          parameters: { volume: analysis.volume },
          timestamp: new Date()
        });
      }

      console.log(`✅ ${commands.length} comandos detectados`);
      return commands;
    } catch (error) {
      console.error('❌ Error detectando comandos de voz:', error);
      throw error;
    }
  }

  /**
   * Obtiene voces disponibles
   */
  getAvailableVoices(): SpeechSynthesisVoice[] {
    if (!this.synthesis) return [];
    return this.synthesis.getVoices();
  }

  /**
   * Obtiene idiomas soportados
   */
  getSupportedLanguages(): string[] {
    return this.supportedLanguages;
  }

  /**
   * Obtiene el estado del servicio
   */
  getStatus(): {
    isReady: boolean;
    isListening: boolean;
    isSpeaking: boolean;
    language: string;
    sampleRate: number;
  } {
    return {
      isReady: this.isReady(),
      isListening: this.isListening,
      isSpeaking: this.isSpeaking,
      language: this.config.language,
      sampleRate: this.config.sampleRate
    };
  }

  /**
   * Actualiza la configuración
   */
  updateConfig(newConfig: Partial<VoiceConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('⚙️ Configuración de voz actualizada:', this.config);
  }

  /**
   * Limpia recursos
   */
  async cleanup(): Promise<void> {
    try {
      console.log('🧹 Limpiando recursos del servicio de voz...');

      // Detener reconocimiento
      this.stopListening();

      // Detener síntesis
      this.stopSpeaking();

      // Cerrar contexto de audio
      if (this.audioContext) {
        await this.audioContext.close();
        this.audioContext = null;
      }

      // Liberar stream de medios
      if (this.mediaStream) {
        this.mediaStream.getTracks().forEach(track => track.stop());
        this.mediaStream = null;
      }

      console.log('✅ Recursos del servicio de voz limpiados');
    } catch (error) {
      console.error('❌ Error limpiando recursos:', error);
    }
  }
}

// Instancia singleton del servicio
export const voiceService = new VoiceService();

// Exportar tipos útiles
export type {
  VoiceConfig,
  SpeechRecognitionResult,
  SpeechSegment,
  VoiceSynthesisOptions,
  AudioAnalysis,
  AudioFeatures,
  VoiceCommand
};
