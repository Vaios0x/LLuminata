import { SpeechRecognitionService } from '@/lib/ai-services/speech-recognition-service';

// Mock de las APIs del navegador
const mockSpeechRecognition = jest.fn();
const mockMediaDevices = {
  getUserMedia: jest.fn(),
};

// Mock de las APIs de IA
const mockOpenAI = {
  audio: {
    transcriptions: {
      create: jest.fn(),
    },
  },
};

const mockAnthropic = {
  messages: {
    create: jest.fn(),
  },
};

// Mock de fetch para llamadas a APIs externas
global.fetch = jest.fn();

// Mock de AudioContext
const mockAudioContext = {
  createMediaStreamSource: jest.fn(),
  createAnalyser: jest.fn(),
  createGain: jest.fn(),
  createOscillator: jest.fn(),
  createBuffer: jest.fn(),
  createBufferSource: jest.fn(),
  decodeAudioData: jest.fn(),
  sampleRate: 44100,
  currentTime: 0,
  destination: {},
  suspend: jest.fn(),
  resume: jest.fn(),
  close: jest.fn(),
};

// Mock de Web Audio API
const mockAudioBuffer = {
  duration: 10,
  sampleRate: 44100,
  numberOfChannels: 2,
  length: 441000,
  getChannelData: jest.fn(() => new Float32Array(441000)),
  copyFromChannel: jest.fn(),
  copyToChannel: jest.fn(),
};

const mockAnalyserNode = {
  connect: jest.fn(),
  disconnect: jest.fn(),
  fftSize: 2048,
  frequencyBinCount: 1024,
  minDecibels: -100,
  maxDecibels: -30,
  smoothingTimeConstant: 0.8,
  getByteFrequencyData: jest.fn(),
  getByteTimeDomainData: jest.fn(),
  getFloatFrequencyData: jest.fn(),
  getFloatTimeDomainData: jest.fn(),
};

const mockGainNode = {
  connect: jest.fn(),
  disconnect: jest.fn(),
  gain: {
    value: 1,
    setValueAtTime: jest.fn(),
    linearRampToValueAtTime: jest.fn(),
    exponentialRampToValueAtTime: jest.fn(),
  },
};

const mockMediaStreamSource = {
  connect: jest.fn(),
  disconnect: jest.fn(),
  mediaStream: {},
};

// Configurar mocks
Object.defineProperty(window, 'SpeechRecognition', {
  value: mockSpeechRecognition,
  writable: true,
});

Object.defineProperty(window, 'webkitSpeechRecognition', {
  value: mockSpeechRecognition,
  writable: true,
});

Object.defineProperty(navigator, 'mediaDevices', {
  value: mockMediaDevices,
  writable: true,
});

Object.defineProperty(window, 'AudioContext', {
  value: jest.fn(() => mockAudioContext),
  writable: true,
});

Object.defineProperty(window, 'webkitAudioContext', {
  value: jest.fn(() => mockAudioContext),
  writable: true,
});

// Mock de módulos
jest.mock('openai', () => ({
  OpenAI: jest.fn(() => mockOpenAI),
}));

jest.mock('@anthropic-ai/sdk', () => ({
  Anthropic: jest.fn(() => mockAnthropic),
}));

describe('SpeechRecognitionService', () => {
  let service: SpeechRecognitionService;
  let mockRecognition: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Configurar mock de SpeechRecognition
    mockRecognition = {
      continuous: false,
      interimResults: false,
      lang: 'es-MX',
      start: jest.fn(),
      stop: jest.fn(),
      abort: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    };
    
    mockSpeechRecognition.mockImplementation(() => mockRecognition);
    
    service = new SpeechRecognitionService();
  });

  describe('constructor', () => {
    it('should initialize with default settings', () => {
      expect(service).toBeInstanceOf(SpeechRecognitionService);
      expect(service.isSupported()).toBe(true);
    });

    it('should handle unsupported browsers', () => {
      // Simular navegador sin soporte
      Object.defineProperty(window, 'SpeechRecognition', {
        value: undefined,
        writable: true,
      });
      Object.defineProperty(window, 'webkitSpeechRecognition', {
        value: undefined,
        writable: true,
      });

      const newService = new SpeechRecognitionService();
      expect(newService.isSupported()).toBe(false);
    });
  });

  describe('startRecognition', () => {
    it('should start speech recognition with default settings', () => {
      const onResult = jest.fn();
      const onError = jest.fn();
      const onEnd = jest.fn();

      service.startRecognition({
        onResult,
        onError,
        onEnd,
      });

      expect(mockSpeechRecognition).toHaveBeenCalled();
      expect(mockRecognition.continuous).toBe(false);
      expect(mockRecognition.interimResults).toBe(false);
      expect(mockRecognition.lang).toBe('es-MX');
      expect(mockRecognition.start).toHaveBeenCalled();
    });

    it('should start with custom settings', () => {
      const onResult = jest.fn();
      const onError = jest.fn();
      const onEnd = jest.fn();

      service.startRecognition({
        onResult,
        onError,
        onEnd,
        continuous: true,
        interimResults: true,
        language: 'en-US',
      });

      expect(mockRecognition.continuous).toBe(true);
      expect(mockRecognition.interimResults).toBe(true);
      expect(mockRecognition.lang).toBe('en-US');
    });

    it('should handle unsupported browser', () => {
      Object.defineProperty(window, 'SpeechRecognition', {
        value: undefined,
        writable: true,
      });
      Object.defineProperty(window, 'webkitSpeechRecognition', {
        value: undefined,
        writable: true,
      });

      const newService = new SpeechRecognitionService();
      const onError = jest.fn();

      newService.startRecognition({ onError });

      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'not-supported',
          message: 'Speech recognition not supported in this browser',
        })
      );
    });
  });

  describe('stopRecognition', () => {
    it('should stop speech recognition', () => {
      service.startRecognition({
        onResult: jest.fn(),
        onError: jest.fn(),
        onEnd: jest.fn(),
      });

      service.stopRecognition();

      expect(mockRecognition.stop).toHaveBeenCalled();
    });

    it('should handle when recognition is not active', () => {
      expect(() => service.stopRecognition()).not.toThrow();
    });
  });

  describe('abortRecognition', () => {
    it('should abort speech recognition', () => {
      service.startRecognition({
        onResult: jest.fn(),
        onError: jest.fn(),
        onEnd: jest.fn(),
      });

      service.abortRecognition();

      expect(mockRecognition.abort).toHaveBeenCalled();
    });
  });

  describe('transcribeAudio', () => {
    it('should transcribe audio using OpenAI', async () => {
      const mockResponse = {
        text: 'Hola, ¿cómo estás?',
      };

      mockOpenAI.audio.transcriptions.create.mockResolvedValue(mockResponse);

      const audioBlob = new Blob(['audio data'], { type: 'audio/wav' });
      const result = await service.transcribeAudio(audioBlob, 'es-MX');

      expect(mockOpenAI.audio.transcriptions.create).toHaveBeenCalledWith({
        file: audioBlob,
        model: 'whisper-1',
        language: 'es',
        response_format: 'json',
      });
      expect(result).toBe('Hola, ¿cómo estás?');
    });

    it('should transcribe audio using Anthropic', async () => {
      const mockResponse = {
        content: [
          {
            type: 'text',
            text: 'Hello, how are you?',
          },
        ],
      };

      mockAnthropic.messages.create.mockResolvedValue(mockResponse);

      const audioBlob = new Blob(['audio data'], { type: 'audio/wav' });
      const result = await service.transcribeAudio(audioBlob, 'en-US', 'anthropic');

      expect(mockAnthropic.messages.create).toHaveBeenCalledWith({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Transcribe this audio to text. Return only the transcription without any additional text.',
              },
              {
                type: 'audio',
                source: {
                  type: 'base64',
                  media_type: 'audio/wav',
                  data: expect.any(String),
                },
              },
            ],
          },
        ],
      });
      expect(result).toBe('Hello, how are you?');
    });

    it('should handle transcription errors', async () => {
      mockOpenAI.audio.transcriptions.create.mockRejectedValue(
        new Error('Transcription failed')
      );

      const audioBlob = new Blob(['audio data'], { type: 'audio/wav' });

      await expect(service.transcribeAudio(audioBlob)).rejects.toThrow(
        'Transcription failed'
      );
    });

    it('should handle unsupported provider', async () => {
      const audioBlob = new Blob(['audio data'], { type: 'audio/wav' });

      await expect(
        service.transcribeAudio(audioBlob, 'es-MX', 'unsupported' as any)
      ).rejects.toThrow('Unsupported transcription provider: unsupported');
    });
  });

  describe('analyzeAudio', () => {
    it('should analyze audio for speech patterns', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                confidence: 0.95,
                language: 'es-MX',
                dialect: 'mexicano',
                speechRate: 'normal',
                clarity: 'high',
              }),
            },
          },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const audioBlob = new Blob(['audio data'], { type: 'audio/wav' });
      const result = await service.analyzeAudio(audioBlob);

      expect(result).toEqual({
        confidence: 0.95,
        language: 'es-MX',
        dialect: 'mexicano',
        speechRate: 'normal',
        clarity: 'high',
      });
    });

    it('should handle analysis errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(
        new Error('Analysis failed')
      );

      const audioBlob = new Blob(['audio data'], { type: 'audio/wav' });

      await expect(service.analyzeAudio(audioBlob)).rejects.toThrow(
        'Analysis failed'
      );
    });
  });

  describe('getSupportedLanguages', () => {
    it('should return supported languages', () => {
      const languages = service.getSupportedLanguages();

      expect(languages).toContain('es-MX');
      expect(languages).toContain('en-US');
      expect(languages).toContain('maya');
      expect(languages).toContain('nahuatl');
    });
  });

  describe('getLanguageConfig', () => {
    it('should return language configuration for Spanish', () => {
      const config = service.getLanguageConfig('es-MX');

      expect(config).toEqual({
        code: 'es-MX',
        name: 'Español (México)',
        nativeName: 'Español',
        dialect: 'mexicano',
        confidence: 0.9,
      });
    });

    it('should return language configuration for Maya', () => {
      const config = service.getLanguageConfig('maya');

      expect(config).toEqual({
        code: 'maya',
        name: 'Maya',
        nativeName: 'Maya',
        dialect: 'yucateco',
        confidence: 0.8,
      });
    });

    it('should return default config for unknown language', () => {
      const config = service.getLanguageConfig('unknown');

      expect(config).toEqual({
        code: 'unknown',
        name: 'Unknown',
        nativeName: 'Unknown',
        dialect: 'standard',
        confidence: 0.7,
      });
    });
  });

  describe('culturalAdaptation', () => {
    it('should adapt transcription for cultural context', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: 'Adapted text with cultural context',
            },
          },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await service.culturalAdaptation(
        'original text',
        'maya',
        'formal'
      );

      expect(result).toBe('Adapted text with cultural context');
    });

    it('should handle cultural adaptation errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(
        new Error('Adaptation failed')
      );

      await expect(
        service.culturalAdaptation('text', 'es-MX', 'formal')
      ).rejects.toThrow('Adaptation failed');
    });
  });

  describe('event handling', () => {
    it('should handle result events', () => {
      const onResult = jest.fn();
      const onError = jest.fn();
      const onEnd = jest.fn();

      service.startRecognition({
        onResult,
        onError,
        onEnd,
      });

      // Simular evento de resultado
      const resultEvent = {
        results: [
          {
            isFinal: true,
            transcript: 'Hola mundo',
            confidence: 0.95,
          },
        ],
      };

      // Obtener el callback de resultado
      const resultCallback = mockRecognition.addEventListener.mock.calls.find(
        call => call[0] === 'result'
      )[1];

      resultCallback(resultEvent);

      expect(onResult).toHaveBeenCalledWith({
        transcript: 'Hola mundo',
        confidence: 0.95,
        isFinal: true,
        language: 'es-MX',
      });
    });

    it('should handle error events', () => {
      const onResult = jest.fn();
      const onError = jest.fn();
      const onEnd = jest.fn();

      service.startRecognition({
        onResult,
        onError,
        onEnd,
      });

      // Simular evento de error
      const errorEvent = {
        error: 'no-speech',
        message: 'No speech detected',
      };

      // Obtener el callback de error
      const errorCallback = mockRecognition.addEventListener.mock.calls.find(
        call => call[0] === 'error'
      )[1];

      errorCallback(errorEvent);

      expect(onError).toHaveBeenCalledWith({
        error: 'no-speech',
        message: 'No speech detected',
      });
    });

    it('should handle end events', () => {
      const onResult = jest.fn();
      const onError = jest.fn();
      const onEnd = jest.fn();

      service.startRecognition({
        onResult,
        onError,
        onEnd,
      });

      // Obtener el callback de end
      const endCallback = mockRecognition.addEventListener.mock.calls.find(
        call => call[0] === 'end'
      )[1];

      endCallback();

      expect(onEnd).toHaveBeenCalled();
    });
  });

  describe('accessibility features', () => {
    it('should support high contrast mode', () => {
      const config = service.getAccessibilityConfig();
      
      expect(config).toHaveProperty('highContrast');
      expect(config).toHaveProperty('largeText');
      expect(config).toHaveProperty('screenReader');
    });

    it('should provide audio feedback', () => {
      const feedback = service.getAudioFeedback('success');
      
      expect(feedback).toBeDefined();
      expect(typeof feedback).toBe('string');
    });
  });

  describe('performance monitoring', () => {
    it('should track recognition performance', () => {
      const metrics = service.getPerformanceMetrics();
      
      expect(metrics).toHaveProperty('accuracy');
      expect(metrics).toHaveProperty('latency');
      expect(metrics).toHaveProperty('confidence');
    });

    it('should provide performance recommendations', () => {
      const recommendations = service.getPerformanceRecommendations();
      
      expect(Array.isArray(recommendations)).toBe(true);
      expect(recommendations.length).toBeGreaterThan(0);
    });
  });
});
