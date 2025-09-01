import * as tf from '@tensorflow/tfjs';
import { loadLayersModel, LayersModel } from '@tensorflow/tfjs-layers';
import * as speechCommands from '@tensorflow-models/speech-commands';

export interface AudioFeatures {
  mfcc: number[][];              // Mel-frequency cepstral coefficients
  spectralCentroid: number[];    // Centroide espectral
  spectralRolloff: number[];     // Rolloff espectral
  zeroCrossingRate: number[];    // Tasa de cruce por cero
  energy: number[];              // Energía del audio
  pitch: number[];               // Frecuencia fundamental
  formants: number[][];          // Formantes (F1, F2, F3)
}

export interface RecognitionResult {
  text: string;                  // Texto reconocido
  confidence: number;            // Confianza del reconocimiento
  language: string;              // Idioma detectado
  culturalContext: string;       // Contexto cultural
  alternatives: string[];        // Alternativas de reconocimiento
  timestamp: number;             // Timestamp del reconocimiento
  audioFeatures: AudioFeatures;  // Características del audio
}

export interface VoiceCommand {
  command: string;               // Comando reconocido
  action: string;                // Acción a ejecutar
  confidence: number;            // Confianza del comando
  culturalAdaptation: string;    // Adaptación cultural del comando
}

export interface LanguageModel {
  language: string;              // Código del idioma
  vocabulary: string[];          // Vocabulario específico
  phonemes: string[];            // Fonemas del idioma
  culturalTerms: Record<string, string[]>; // Términos culturales
  pronunciationRules: Record<string, string>; // Reglas de pronunciación
}

export class SpeechRecognitionModel {
  private model: LayersModel | null = null;
  private speechCommandsModel: speechCommands.SpeechCommandRecognizer | null = null;
  private isLoaded: boolean = false;
  private readonly modelPath: string = '/ml-models/speech-recognition-model.json';
  
  // Configuración del modelo
  private readonly sampleRate = 16000;
  private readonly fftSize = 1024;
  private readonly hopSize = 512;
  private readonly numMfcc = 13;
  private readonly numLanguages = 6;
  
  // Modelos de idioma específicos
  private languageModels: Record<string, LanguageModel> = {
    'es-MX': {
      language: 'es-MX',
      vocabulary: [
        'hola', 'adiós', 'gracias', 'por favor', 'sí', 'no', 'bien', 'mal',
        'ayuda', 'entender', 'repetir', 'más lento', 'más rápido', 'pausa',
        'continuar', 'terminar', 'empezar', 'comenzar', 'finalizar'
      ],
      phonemes: ['a', 'e', 'i', 'o', 'u', 'b', 'c', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm', 'n', 'ñ', 'p', 'q', 'r', 's', 't', 'v', 'w', 'x', 'y', 'z'],
      culturalTerms: {
        'saludos': ['hola', 'buenos días', 'buenas tardes', 'buenas noches'],
        'cortesía': ['gracias', 'por favor', 'de nada', 'con permiso'],
        'educación': ['maestro', 'estudiante', 'lección', 'aprender', 'enseñar']
      },
      pronunciationRules: {
        'ñ': 'ny',
        'll': 'y',
        'rr': 'r fuerte'
      }
    },
    'maya': {
      language: 'maya',
      vocabulary: [
        'ba\'ax ka wa\'alik', 'ma\'alob', 'bix a beel', 'kin', 'kaab',
        'ha\'', 'lu\'um', 'k\'iin', 'u', 'ixi\'im', 'kakaw', 'chokow',
        'wíinik', 'ch\'up', 'paal', 'suku\'un', 'kiik', 'mama\'', 'tata\'',
        'ajaw', 'ix ajaw', 'aj k\'iin', 'aj tz\'ib', 'aj men', 'aj k\'u'
      ],
      phonemes: ['a', 'e', 'i', 'o', 'u', 'b', 'ch', 'ch\'', 'h', 'j', 'k', 'k\'', 'l', 'm', 'n', 'p', 'p\'', 's', 't', 't\'', 'ts', 'ts\'', 'w', 'x', 'y', '\''],
      culturalTerms: {
        'saludos': ['ba\'ax ka wa\'alik', 'ma\'alob', 'bix a beel'],
        'naturaleza': ['kin', 'kaab', 'ha\'', 'lu\'um', 'k\'iin', 'u'],
        'familia': ['wíinik', 'ch\'up', 'paal', 'suku\'un', 'kiik', 'mama\'', 'tata\''],
        'comunidad': ['ajaw', 'ix ajaw', 'aj k\'iin', 'aj tz\'ib', 'aj men']
      },
      pronunciationRules: {
        'k\'': 'k glotal',
        'ch\'': 'ch glotal',
        'p\'': 'p glotal',
        't\'': 't glotal',
        'ts\'': 'ts glotal',
        'x': 'sh',
        'j': 'h'
      }
    },
    'nahuatl': {
      language: 'nahuatl',
      vocabulary: [
        'niltze', 'tlahtoa', 'tlazohtla', 'machtia', 'temoa', 'tlamati',
        'tlalli', 'atl', 'tonatiuh', 'metztli', 'centli', 'cacahuatl',
        'tlacatl', 'cihuatl', 'piltontli', 'ichpoch', 'tah', 'nan',
        'tlahtoani', 'cihuatlahtoani', 'tlamatini', 'tlacuilo', 'tlamacazqui'
      ],
      phonemes: ['a', 'e', 'i', 'o', 'u', 'ch', 'h', 'k', 'kw', 'l', 'm', 'n', 'p', 's', 't', 'tl', 'ts', 'w', 'x', 'y'],
      culturalTerms: {
        'saludos': ['niltze', 'tlahtoa', 'tlazohtla'],
        'educación': ['machtia', 'temoa', 'tlamati'],
        'naturaleza': ['tlalli', 'atl', 'tonatiuh', 'metztli', 'centli'],
        'sociedad': ['tlacatl', 'cihuatl', 'piltontli', 'tlahtoani', 'tlamatini']
      },
      pronunciationRules: {
        'tl': 't-l',
        'ts': 't-s',
        'kw': 'k-w',
        'x': 'sh'
      }
    },
    'quechua': {
      language: 'quechua',
      vocabulary: [
        'allillanchu', 'sumaq', 'imayna', 'p\'unchay', 'quilla', 'inti',
        'yaku', 'allpa', 'sara', 'kuka', 'llama', 'alpaka', 'runa',
        'warmi', 'wawa', 'sipas', 'tayta', 'mama', 'sapa', 'apukuna',
        'yachachiq', 'qillqaq', 'hamawt\'a', 'paqo'
      ],
      phonemes: ['a', 'e', 'i', 'o', 'u', 'ch', 'h', 'k', 'l', 'll', 'm', 'n', 'ñ', 'p', 'q', 'r', 's', 't', 'w', 'y'],
      culturalTerms: {
        'saludos': ['allillanchu', 'sumaq', 'imayna'],
        'tiempo': ['p\'unchay', 'quilla', 'inti'],
        'naturaleza': ['yaku', 'allpa', 'sara', 'kuka', 'llama', 'alpaka'],
        'sociedad': ['runa', 'warmi', 'wawa', 'sapa', 'apukuna', 'yachachiq']
      },
      pronunciationRules: {
        'll': 'ly',
        'ñ': 'ny',
        'q': 'k',
        'ch': 'ch'
      }
    }
  };

  constructor() {
    this.initializeModel();
  }

  /**
   * Inicializa el modelo de reconocimiento de voz
   */
  private async initializeModel(): Promise<void> {
    try {
      // Cargar modelo de comandos de voz
      this.speechCommandsModel = speechCommands.create('BROWSER_FFT');
      await this.speechCommandsModel.ensureModelLoaded();
      
      // Intentar cargar modelo personalizado
      this.model = await loadLayersModel(this.modelPath);
      this.isLoaded = true;
      console.log('✅ Modelo de reconocimiento de voz cargado');
    } catch (error) {
      console.log('⚠️ Modelo no encontrado, creando nuevo modelo...');
      await this.createNewModel();
    }
  }

  /**
   * Crea un nuevo modelo de reconocimiento de voz
   */
  private async createNewModel(): Promise<void> {
    this.model = tf.sequential({
      layers: [
        // Capa de entrada para características de audio
        tf.layers.dense({
          inputShape: [this.numMfcc * 10], // 10 frames de MFCC
          units: 256,
          activation: 'relu'
        }),
        tf.layers.dropout({ rate: 0.3 }),
        
        // Capas LSTM para secuencias temporales
        tf.layers.lstm({
          units: 128,
          returnSequences: true
        }),
        tf.layers.dropout({ rate: 0.2 }),
        
        tf.layers.lstm({
          units: 64,
          returnSequences: false
        }),
        tf.layers.dropout({ rate: 0.2 }),
        
        // Capas densas para clasificación
        tf.layers.dense({
          units: 128,
          activation: 'relu'
        }),
        tf.layers.dropout({ rate: 0.2 }),
        
        tf.layers.dense({
          units: 64,
          activation: 'relu'
        }),
        
        // Capa de salida
        tf.layers.dense({
          units: this.numLanguages,
          activation: 'softmax'
        })
      ]
    });

    // Compilar modelo
    this.model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    });

    this.isLoaded = true;
    console.log('✅ Nuevo modelo de reconocimiento de voz creado');
  }

  /**
   * Extrae características de audio de un buffer de audio
   */
  private extractAudioFeatures(audioBuffer: Float32Array): AudioFeatures {
    const features: AudioFeatures = {
      mfcc: [],
      spectralCentroid: [],
      spectralRolloff: [],
      zeroCrossingRate: [],
      energy: [],
      pitch: [],
      formants: []
    };

    // Dividir audio en frames
    const frameSize = this.fftSize;
    const hopSize = this.hopSize;
    
    for (let i = 0; i < audioBuffer.length - frameSize; i += hopSize) {
      const frame = audioBuffer.slice(i, i + frameSize);
      
      // Calcular MFCC
      const mfcc = this.calculateMFCC(frame);
      features.mfcc.push(mfcc);
      
      // Calcular características espectrales
      const fft = this.calculateFFT(frame);
      features.spectralCentroid.push(this.calculateSpectralCentroid(fft));
      features.spectralRolloff.push(this.calculateSpectralRolloff(fft));
      
      // Calcular tasa de cruce por cero
      features.zeroCrossingRate.push(this.calculateZeroCrossingRate(frame));
      
      // Calcular energía
      features.energy.push(this.calculateEnergy(frame));
      
      // Calcular pitch (frecuencia fundamental)
      features.pitch.push(this.calculatePitch(frame));
      
      // Calcular formantes
      features.formants.push(this.calculateFormants(fft));
    }

    return features;
  }

  /**
   * Calcula MFCC (Mel-frequency cepstral coefficients)
   */
  private calculateMFCC(frame: Float32Array): number[] {
    // Implementación simplificada de MFCC
    const fft = this.calculateFFT(frame);
    const melFilterbank = this.applyMelFilterbank(fft);
    const logMel = melFilterbank.map(val => Math.log(Math.max(val, 1e-10)));
    
    // Aplicar DCT (Discrete Cosine Transform)
    const mfcc = [];
    for (let i = 0; i < this.numMfcc; i++) {
      let sum = 0;
      for (let j = 0; j < logMel.length; j++) {
        sum += logMel[j] * Math.cos(Math.PI * i * (2 * j + 1) / (2 * logMel.length));
      }
      mfcc.push(sum);
    }
    
    return mfcc;
  }

  /**
   * Calcula FFT (Fast Fourier Transform)
   */
  private calculateFFT(frame: Float32Array): Float32Array {
    // Implementación simplificada usando Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const buffer = audioContext.createBuffer(1, frame.length, this.sampleRate);
    const channelData = buffer.getChannelData(0);
    channelData.set(frame);
    
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = this.fftSize;
    
    const fftBuffer = new Float32Array(analyser.frequencyBinCount);
    analyser.getFloatFrequencyData(fftBuffer);
    
    return fftBuffer;
  }

  /**
   * Aplica banco de filtros Mel
   */
  private applyMelFilterbank(fft: Float32Array): number[] {
    // Implementación simplificada
    const numFilters = 26;
    const filterbank = new Array(numFilters).fill(0);
    
    for (let i = 0; i < numFilters; i++) {
      for (let j = 0; j < fft.length; j++) {
        const melFreq = this.hzToMel(j * this.sampleRate / this.fftSize);
        const filterCenter = this.hzToMel(i * this.sampleRate / (2 * numFilters));
        const filterResponse = this.triangularFilter(melFreq, filterCenter);
        filterbank[i] += Math.abs(fft[j]) * filterResponse;
      }
    }
    
    return filterbank;
  }

  /**
   * Convierte frecuencia Hz a escala Mel
   */
  private hzToMel(hz: number): number {
    return 2595 * Math.log10(1 + hz / 700);
  }

  /**
   * Filtro triangular para banco de filtros Mel
   */
  private triangularFilter(melFreq: number, center: number): number {
    const bandwidth = 200; // Hz
    const melBandwidth = this.hzToMel(bandwidth);
    
    if (Math.abs(melFreq - center) < melBandwidth) {
      return 1 - Math.abs(melFreq - center) / melBandwidth;
    }
    return 0;
  }

  /**
   * Calcula centroide espectral
   */
  private calculateSpectralCentroid(fft: Float32Array): number {
    let weightedSum = 0;
    let sum = 0;
    
    for (let i = 0; i < fft.length; i++) {
      const magnitude = Math.abs(fft[i]);
      const frequency = i * this.sampleRate / this.fftSize;
      weightedSum += magnitude * frequency;
      sum += magnitude;
    }
    
    return sum > 0 ? weightedSum / sum : 0;
  }

  /**
   * Calcula rolloff espectral
   */
  private calculateSpectralRolloff(fft: Float32Array): number {
    const threshold = 0.85; // 85% de la energía
    let totalEnergy = 0;
    let cumulativeEnergy = 0;
    
    for (let i = 0; i < fft.length; i++) {
      totalEnergy += Math.abs(fft[i]);
    }
    
    for (let i = 0; i < fft.length; i++) {
      cumulativeEnergy += Math.abs(fft[i]);
      if (cumulativeEnergy >= threshold * totalEnergy) {
        return i * this.sampleRate / this.fftSize;
      }
    }
    
    return 0;
  }

  /**
   * Calcula tasa de cruce por cero
   */
  private calculateZeroCrossingRate(frame: Float32Array): number {
    let crossings = 0;
    
    for (let i = 1; i < frame.length; i++) {
      if ((frame[i] >= 0 && frame[i - 1] < 0) || (frame[i] < 0 && frame[i - 1] >= 0)) {
        crossings++;
      }
    }
    
    return crossings / frame.length;
  }

  /**
   * Calcula energía del frame
   */
  private calculateEnergy(frame: Float32Array): number {
    return frame.reduce((sum, sample) => sum + sample * sample, 0) / frame.length;
  }

  /**
   * Calcula pitch (frecuencia fundamental)
   */
  private calculatePitch(frame: Float32Array): number {
    // Implementación simplificada usando autocorrelación
    const autocorr = this.autocorrelation(frame);
    
    // Encontrar el primer pico después del pico principal
    let maxIndex = 0;
    let maxValue = 0;
    
    for (let i = 1; i < autocorr.length / 2; i++) {
      if (autocorr[i] > maxValue) {
        maxValue = autocorr[i];
        maxIndex = i;
      }
    }
    
    return maxIndex > 0 ? this.sampleRate / maxIndex : 0;
  }

  /**
   * Calcula autocorrelación
   */
  private autocorrelation(frame: Float32Array): Float32Array {
    const result = new Float32Array(frame.length);
    
    for (let lag = 0; lag < frame.length; lag++) {
      let sum = 0;
      for (let i = 0; i < frame.length - lag; i++) {
        sum += frame[i] * frame[i + lag];
      }
      result[lag] = sum;
    }
    
    return result;
  }

  /**
   * Calcula formantes (F1, F2, F3)
   */
  private calculateFormants(fft: Float32Array): number[] {
    // Implementación simplificada
    const formants = [0, 0, 0];
    
    // Buscar picos en el espectro (formantes)
    const peaks = this.findSpectralPeaks(fft);
    
    for (let i = 0; i < Math.min(3, peaks.length); i++) {
      formants[i] = peaks[i] * this.sampleRate / this.fftSize;
    }
    
    return formants;
  }

  /**
   * Encuentra picos espectrales
   */
  private findSpectralPeaks(fft: Float32Array): number[] {
    const peaks: number[] = [];
    
    for (let i = 1; i < fft.length - 1; i++) {
      if (fft[i] > fft[i - 1] && fft[i] > fft[i + 1]) {
        peaks.push(i);
      }
    }
    
    // Ordenar por magnitud y tomar los más fuertes
    peaks.sort((a, b) => Math.abs(fft[b]) - Math.abs(fft[a]));
    return peaks.slice(0, 3);
  }

  /**
   * Reconoce voz y transcribe a texto
   */
  async recognizeSpeech(audioBuffer: Float32Array, language: string = 'es-MX'): Promise<RecognitionResult> {
    if (!this.isLoaded || !this.model) {
      throw new Error('Modelo no está cargado');
    }

    try {
      // Extraer características de audio
      const audioFeatures = this.extractAudioFeatures(audioBuffer);
      
      // Preparar entrada para el modelo
      const inputFeatures = this.prepareModelInput(audioFeatures);
      const inputTensor = tf.tensor2d([inputFeatures], [1, inputFeatures.length]);
      
      // Realizar predicción
      const prediction = this.model.predict(inputTensor) as tf.Tensor;
      const probabilities = await prediction.array() as number[][];
      
      // Limpiar tensores
      inputTensor.dispose();
      prediction.dispose();
      
      // Interpretar resultados
      const result = this.interpretRecognitionResults(probabilities[0], audioFeatures, language);
      
      return result;
    } catch (error) {
      console.error('Error en reconocimiento de voz:', error);
      throw error;
    }
  }

  /**
   * Prepara entrada para el modelo
   */
  private prepareModelInput(audioFeatures: AudioFeatures): number[] {
    const features: number[] = [];
    
    // Aplanar MFCC
    audioFeatures.mfcc.forEach(mfcc => {
      features.push(...mfcc);
    });
    
    // Agregar características estadísticas
    features.push(
      this.calculateMean(audioFeatures.spectralCentroid),
      this.calculateStd(audioFeatures.spectralCentroid),
      this.calculateMean(audioFeatures.spectralRolloff),
      this.calculateStd(audioFeatures.spectralRolloff),
      this.calculateMean(audioFeatures.zeroCrossingRate),
      this.calculateStd(audioFeatures.zeroCrossingRate),
      this.calculateMean(audioFeatures.energy),
      this.calculateStd(audioFeatures.energy),
      this.calculateMean(audioFeatures.pitch),
      this.calculateStd(audioFeatures.pitch)
    );
    
    return features;
  }

  /**
   * Calcula media de un array
   */
  private calculateMean(array: number[]): number {
    return array.reduce((sum, val) => sum + val, 0) / array.length;
  }

  /**
   * Calcula desviación estándar de un array
   */
  private calculateStd(array: number[]): number {
    const mean = this.calculateMean(array);
    const variance = array.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / array.length;
    return Math.sqrt(variance);
  }

  /**
   * Interpreta los resultados del reconocimiento
   */
  private interpretRecognitionResults(
    probabilities: number[],
    audioFeatures: AudioFeatures,
    language: string
  ): RecognitionResult {
    const languages = ['es-MX', 'maya', 'nahuatl', 'quechua', 'en-US', 'pt-BR'];
    const detectedLanguage = languages[probabilities.indexOf(Math.max(...probabilities))];
    
    // Generar texto reconocido (simulado)
    const recognizedText = this.generateRecognizedText(audioFeatures, detectedLanguage);
    
    return {
      text: recognizedText,
      confidence: Math.max(...probabilities),
      language: detectedLanguage,
      culturalContext: this.getCulturalContext(detectedLanguage),
      alternatives: this.generateAlternatives(recognizedText, detectedLanguage),
      timestamp: Date.now(),
      audioFeatures: audioFeatures
    };
  }

  /**
   * Genera texto reconocido basado en características de audio
   */
  private generateRecognizedText(audioFeatures: AudioFeatures, language: string): string {
    const languageModel = this.languageModels[language];
    if (!languageModel) return 'Texto no reconocido';
    
    // Análisis simple basado en características de audio
    const avgPitch = this.calculateMean(audioFeatures.pitch);
    const avgEnergy = this.calculateMean(audioFeatures.energy);
    const avgZCR = this.calculateMean(audioFeatures.zeroCrossingRate);
    
    // Seleccionar palabras basadas en características
    let selectedWords: string[] = [];
    
    if (avgEnergy > 0.5) {
      selectedWords.push(languageModel.vocabulary[0]); // Primera palabra
    }
    if (avgPitch > 200) {
      selectedWords.push(languageModel.vocabulary[1]); // Segunda palabra
    }
    if (avgZCR > 0.1) {
      selectedWords.push(languageModel.vocabulary[2]); // Tercera palabra
    }
    
    return selectedWords.join(' ') || languageModel.vocabulary[0];
  }

  /**
   * Obtiene contexto cultural del idioma
   */
  private getCulturalContext(language: string): string {
    const contexts: Record<string, string> = {
      'es-MX': 'mexicano',
      'maya': 'maya',
      'nahuatl': 'nahua',
      'quechua': 'andino',
      'en-US': 'estadounidense',
      'pt-BR': 'brasileño'
    };
    return contexts[language] || 'general';
  }

  /**
   * Genera alternativas de reconocimiento
   */
  private generateAlternatives(text: string, language: string): string[] {
    const languageModel = this.languageModels[language];
    if (!languageModel) return [];
    
    // Buscar palabras similares en el vocabulario
    const alternatives: string[] = [];
    const words = text.split(' ');
    
    words.forEach(word => {
      const similarWords = languageModel.vocabulary.filter(vocabWord => 
        this.calculateSimilarity(word, vocabWord) > 0.7
      );
      alternatives.push(...similarWords);
    });
    
    return [...new Set(alternatives)].slice(0, 5);
  }

  /**
   * Calcula similitud entre dos palabras
   */
  private calculateSimilarity(word1: string, word2: string): number {
    const longer = word1.length > word2.length ? word1 : word2;
    const shorter = word1.length > word2.length ? word2 : word1;
    
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
   * Reconoce comandos de voz específicos
   */
  async recognizeVoiceCommand(audioBuffer: Float32Array, language: string = 'es-MX'): Promise<VoiceCommand> {
    const recognitionResult = await this.recognizeSpeech(audioBuffer, language);
    
    // Mapear texto a comandos
    const command = this.mapTextToCommand(recognitionResult.text, language);
    
    return {
      command: recognitionResult.text,
      action: command.action,
      confidence: recognitionResult.confidence,
      culturalAdaptation: command.culturalAdaptation
    };
  }

  /**
   * Mapea texto reconocido a comandos de acción
   */
  private mapTextToCommand(text: string, language: string): { action: string; culturalAdaptation: string } {
    const commandMappings: Record<string, Record<string, { action: string; culturalAdaptation: string }>> = {
      'es-MX': {
        'ayuda': { action: 'help', culturalAdaptation: 'Solicitar ayuda' },
        'repetir': { action: 'repeat', culturalAdaptation: 'Repetir contenido' },
        'más lento': { action: 'slow_down', culturalAdaptation: 'Reducir velocidad' },
        'más rápido': { action: 'speed_up', culturalAdaptation: 'Aumentar velocidad' },
        'pausa': { action: 'pause', culturalAdaptation: 'Pausar actividad' },
        'continuar': { action: 'continue', culturalAdaptation: 'Continuar actividad' }
      },
      'maya': {
        'ba\'ax ka wa\'alik': { action: 'help', culturalAdaptation: '¿Qué necesitas?' },
        'ma\'alob': { action: 'continue', culturalAdaptation: 'Está bien, continuar' },
        'bix a beel': { action: 'repeat', culturalAdaptation: '¿Cómo va tu camino?' }
      },
      'nahuatl': {
        'niltze': { action: 'help', culturalAdaptation: 'Te ayudo' },
        'tlahtoa': { action: 'repeat', culturalAdaptation: 'Hablar de nuevo' },
        'tlazohtla': { action: 'continue', culturalAdaptation: 'Con amor, continuar' }
      }
    };
    
    const mappings = commandMappings[language] || commandMappings['es-MX'];
    const lowerText = text.toLowerCase();
    
    for (const [command, mapping] of Object.entries(mappings)) {
      if (lowerText.includes(command)) {
        return mapping;
      }
    }
    
    return { action: 'unknown', culturalAdaptation: 'Comando no reconocido' };
  }

  /**
   * Entrena el modelo con datos de voz específicos
   */
  async trainModel(trainingData: {
    audioFeatures: AudioFeatures;
    language: string;
    text: string;
  }[]): Promise<void> {
    if (!this.model) {
      throw new Error('Modelo no inicializado');
    }

    console.log('🔄 Entrenando modelo de reconocimiento de voz...');

    // Preparar datos de entrenamiento
    const inputs: number[][] = [];
    const outputs: number[][] = [];

    trainingData.forEach(({ audioFeatures, language, text }) => {
      const inputFeatures = this.prepareModelInput(audioFeatures);
      inputs.push(inputFeatures);

      // Crear vector de salida one-hot
      const languages = ['es-MX', 'maya', 'nahuatl', 'quechua', 'en-US', 'pt-BR'];
      const languageIndex = languages.indexOf(language);
      const output = new Array(this.numLanguages).fill(0);
      if (languageIndex !== -1) {
        output[languageIndex] = 1;
      }
      outputs.push(output);
    });

    // Convertir a tensores
    const inputTensor = tf.tensor2d(inputs);
    const outputTensor = tf.tensor2d(outputs);

    // Entrenar modelo
    await this.model.fit(inputTensor, outputTensor, {
      epochs: 50,
      batchSize: 32,
      validationSplit: 0.2,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          console.log(`Época ${epoch + 1}: pérdida = ${logs?.loss?.toFixed(4)}, precisión = ${logs?.accuracy?.toFixed(4)}`);
        }
      }
    });

    // Limpiar tensores
    inputTensor.dispose();
    outputTensor.dispose();

    console.log('✅ Modelo de reconocimiento de voz entrenado exitosamente');
  }

  /**
   * Guarda el modelo entrenado
   */
  async saveModel(): Promise<void> {
    if (!this.model) {
      throw new Error('Modelo no inicializado');
    }

    try {
      await this.model.save(`file://${process.cwd()}/public/ml-models/speech-recognition-model`);
      console.log('✅ Modelo de reconocimiento de voz guardado exitosamente');
    } catch (error) {
      console.error('Error guardando modelo:', error);
      throw error;
    }
  }

  /**
   * Verifica si el modelo está listo
   */
  isReady(): boolean {
    return this.isLoaded && this.model !== null;
  }
}

// Instancia singleton
export const speechRecognitionModel = new SpeechRecognitionModel();
