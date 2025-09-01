import { TTSService } from '@/lib/ai-services/tts-service';

// Mock de las APIs externas
jest.mock('openai', () => ({
  OpenAI: jest.fn().mockImplementation(() => ({
    audio: {
      speech: {
        create: jest.fn().mockResolvedValue({
          arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(1024))
        })
      }
    }
  }))
}));

jest.mock('@anthropic-ai/sdk', () => ({
  Anthropic: jest.fn().mockImplementation(() => ({
    messages: {
      create: jest.fn().mockResolvedValue({
        content: [{ text: 'Mocked response' }]
      })
    }
  }))
}));

describe('TTSService', () => {
  let ttsService: TTSService;

  beforeEach(() => {
    ttsService = new TTSService();
    jest.clearAllMocks();
  });

  describe('synthesize', () => {
    it('should synthesize text to speech successfully', async () => {
      const text = 'Hola, este es un texto de prueba';
      const language = 'es-MX';
      const options = {
        culturalContext: 'maya',
        cache: true
      };

      const result = await ttsService.synthesize(text, language, options);

      expect(result).toBeInstanceOf(ArrayBuffer);
      expect(result.byteLength).toBeGreaterThan(0);
    });

    it('should handle empty text gracefully', async () => {
      await expect(ttsService.synthesize('', 'es-MX')).rejects.toThrow('El texto no puede estar vacío');
    });

    it('should handle unsupported language', async () => {
      const text = 'Test text';
      const unsupportedLanguage = 'unsupported-lang';

      await expect(ttsService.synthesize(text, unsupportedLanguage)).rejects.toThrow();
    });

    it('should use cache when enabled', async () => {
      const text = 'Texto para cache';
      const language = 'es-MX';

      // Primera llamada
      const result1 = await ttsService.synthesize(text, language, { cache: true });
      
      // Segunda llamada (debería usar cache)
      const result2 = await ttsService.synthesize(text, language, { cache: true });

      expect(result1).toEqual(result2);
    });

    it('should not use cache when disabled', async () => {
      const text = 'Texto sin cache';
      const language = 'es-MX';

      const result1 = await ttsService.synthesize(text, language, { cache: false });
      const result2 = await ttsService.synthesize(text, language, { cache: false });

      // Los resultados pueden ser diferentes ya que no se usa cache
      expect(result1).toBeInstanceOf(ArrayBuffer);
      expect(result2).toBeInstanceOf(ArrayBuffer);
    });

    it('should apply cultural adaptations for maya context', async () => {
      const text = 'Texto con x y j';
      const language = 'maya';
      const options = {
        culturalContext: 'maya'
      };

      const result = await ttsService.synthesize(text, language, options);

      expect(result).toBeInstanceOf(ArrayBuffer);
    });

    it('should apply cultural adaptations for nahuatl context', async () => {
      const text = 'Texto con tl y x';
      const language = 'nahuatl';
      const options = {
        culturalContext: 'nahuatl'
      };

      const result = await ttsService.synthesize(text, language, options);

      expect(result).toBeInstanceOf(ArrayBuffer);
    });

    it('should handle different voice configurations', async () => {
      const text = 'Texto de prueba';
      const language = 'es-MX';
      const options = {
        voice: 'alloy',
        speed: 1.2,
        pitch: 2
      };

      const result = await ttsService.synthesize(text, language, options);

      expect(result).toBeInstanceOf(ArrayBuffer);
    });

    it('should handle API errors gracefully', async () => {
      // Mock de error en la API
      const mockOpenAI = require('openai');
      mockOpenAI.OpenAI.mockImplementationOnce(() => ({
        audio: {
          speech: {
            create: jest.fn().mockRejectedValue(new Error('API Error'))
          }
        }
      }));

      const ttsServiceWithError = new TTSService();
      const text = 'Texto de prueba';

      await expect(ttsServiceWithError.synthesize(text, 'es-MX')).rejects.toThrow();
    });
  });

  describe('playAudio', () => {
    it('should play audio successfully', async () => {
      const audioBuffer = new ArrayBuffer(1024);
      
      // Mock de AudioContext
      const mockAudioContext = {
        decodeAudioData: jest.fn().mockResolvedValue({}),
        createBufferSource: jest.fn().mockReturnValue({
          connect: jest.fn(),
          start: jest.fn(),
          stop: jest.fn(),
          buffer: {}
        }),
        destination: {}
      };

      global.AudioContext = jest.fn().mockImplementation(() => mockAudioContext);

      await expect(ttsService.playAudio(audioBuffer)).resolves.toBeUndefined();
    });

    it('should handle audio playback errors', async () => {
      const audioBuffer = new ArrayBuffer(1024);
      
      const mockAudioContext = {
        decodeAudioData: jest.fn().mockRejectedValue(new Error('Audio decode error')),
        destination: {}
      };

      global.AudioContext = jest.fn().mockImplementation(() => mockAudioContext);

      await expect(ttsService.playAudio(audioBuffer)).rejects.toThrow('Audio decode error');
    });
  });

  describe('clearCache', () => {
    it('should clear the cache successfully', () => {
      expect(() => ttsService.clearCache()).not.toThrow();
    });
  });

  describe('getCacheStats', () => {
    it('should return cache statistics', () => {
      const stats = ttsService.getCacheStats();
      
      expect(stats).toHaveProperty('size');
      expect(stats).toHaveProperty('entries');
      expect(typeof stats.size).toBe('number');
      expect(typeof stats.entries).toBe('number');
    });
  });

  describe('getSupportedLanguages', () => {
    it('should return list of supported languages', () => {
      const languages = ttsService.getSupportedLanguages();
      
      expect(Array.isArray(languages)).toBe(true);
      expect(languages).toContain('es-MX');
      expect(languages).toContain('maya');
      expect(languages).toContain('nahuatl');
    });
  });

  describe('getVoiceConfig', () => {
    it('should return voice configuration for supported language', () => {
      const config = ttsService.getVoiceConfig('es-MX');
      
      expect(config).toBeTruthy();
      expect(config).toHaveProperty('voice');
      expect(config).toHaveProperty('language');
      expect(config).toHaveProperty('provider');
    });

    it('should return null for unsupported language', () => {
      const config = ttsService.getVoiceConfig('unsupported-lang');
      
      expect(config).toBeNull();
    });
  });

  describe('generateWithOpenAI', () => {
    it('should generate audio with OpenAI successfully', async () => {
      const text = 'Texto de prueba';
      const config = {
        voice: 'alloy',
        pitch: 0,
        speed: 1,
        language: 'es-MX',
        gender: 'neutral' as const,
        provider: 'openai' as const
      };

      const result = await (ttsService as any).generateWithOpenAI(text, config);

      expect(result).toBeInstanceOf(ArrayBuffer);
    });

    it('should handle OpenAI API errors', async () => {
      const mockOpenAI = require('openai');
      mockOpenAI.OpenAI.mockImplementationOnce(() => ({
        audio: {
          speech: {
            create: jest.fn().mockRejectedValue(new Error('OpenAI API Error'))
          }
        }
      }));

      const ttsServiceWithError = new TTSService();
      const text = 'Texto de prueba';
      const config = {
        voice: 'alloy',
        pitch: 0,
        speed: 1,
        language: 'es-MX',
        gender: 'neutral' as const,
        provider: 'openai' as const
      };

      await expect((ttsServiceWithError as any).generateWithOpenAI(text, config)).rejects.toThrow('OpenAI API Error');
    });
  });

  describe('generateWithAzure', () => {
    it('should generate audio with Azure successfully', async () => {
      // Mock de fetch para Azure
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(1024))
      });

      const text = 'Texto de prueba';
      const config = {
        voice: 'alloy',
        pitch: 0,
        speed: 1,
        language: 'es-MX',
        gender: 'neutral' as const,
        provider: 'azure' as const
      };

      const result = await (ttsService as any).generateWithAzure(text, config);

      expect(result).toBeInstanceOf(ArrayBuffer);
    });

    it('should handle Azure API errors', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        statusText: 'Azure API Error'
      });

      const text = 'Texto de prueba';
      const config = {
        voice: 'alloy',
        pitch: 0,
        speed: 1,
        language: 'es-MX',
        gender: 'neutral' as const,
        provider: 'azure' as const
      };

      await expect((ttsService as any).generateWithAzure(text, config)).rejects.toThrow('Azure API Error');
    });
  });

  describe('generateWithGoogle', () => {
    it('should generate audio with Google successfully', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          audioContent: Buffer.from('test audio').toString('base64')
        })
      });

      const text = 'Texto de prueba';
      const config = {
        voice: 'alloy',
        pitch: 0,
        speed: 1,
        language: 'es-MX',
        gender: 'neutral' as const,
        provider: 'google' as const
      };

      const result = await (ttsService as any).generateWithGoogle(text, config);

      expect(result).toBeInstanceOf(Buffer);
    });

    it('should handle Google API errors', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        statusText: 'Google API Error'
      });

      const text = 'Texto de prueba';
      const config = {
        voice: 'alloy',
        pitch: 0,
        speed: 1,
        language: 'es-MX',
        gender: 'neutral' as const,
        provider: 'google' as const
      };

      await expect((ttsService as any).generateWithGoogle(text, config)).rejects.toThrow('Google API Error');
    });
  });

  describe('generateWithElevenLabs', () => {
    it('should generate audio with ElevenLabs successfully', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(1024))
      });

      const text = 'Texto de prueba';
      const config = {
        voice: 'alloy',
        pitch: 0,
        speed: 1,
        language: 'es-MX',
        gender: 'neutral' as const,
        provider: 'elevenlabs' as const
      };

      const result = await (ttsService as any).generateWithElevenLabs(text, config);

      expect(result).toBeInstanceOf(ArrayBuffer);
    });

    it('should handle ElevenLabs API errors', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        statusText: 'ElevenLabs API Error'
      });

      const text = 'Texto de prueba';
      const config = {
        voice: 'alloy',
        pitch: 0,
        speed: 1,
        language: 'es-MX',
        gender: 'neutral' as const,
        provider: 'elevenlabs' as const
      };

      await expect((ttsService as any).generateWithElevenLabs(text, config)).rejects.toThrow('ElevenLabs API Error');
    });
  });

  describe('generateSSML', () => {
    it('should generate valid SSML', () => {
      const text = 'Texto de prueba';
      const config = {
        voice: 'alloy',
        pitch: 0,
        speed: 1,
        language: 'es-MX',
        gender: 'neutral' as const,
        provider: 'azure' as const
      };

      const ssml = (ttsService as any).generateSSML(text, config);

      expect(ssml).toContain('<speak');
      expect(ssml).toContain('<voice');
      expect(ssml).toContain('<prosody');
      expect(ssml).toContain(text);
      expect(ssml).toContain('es-MX');
    });
  });

  describe('generateCacheKey', () => {
    it('should generate unique cache keys', () => {
      const text1 = 'Texto 1';
      const text2 = 'Texto 2';
      const config = {
        voice: 'alloy',
        pitch: 0,
        speed: 1,
        language: 'es-MX',
        gender: 'neutral' as const,
        provider: 'openai' as const
      };

      const key1 = (ttsService as any).generateCacheKey(text1, config);
      const key2 = (ttsService as any).generateCacheKey(text2, config);

      expect(key1).not.toBe(key2);
    });

    it('should generate consistent keys for same input', () => {
      const text = 'Texto de prueba';
      const config = {
        voice: 'alloy',
        pitch: 0,
        speed: 1,
        language: 'es-MX',
        gender: 'neutral' as const,
        provider: 'openai' as const
      };

      const key1 = (ttsService as any).generateCacheKey(text, config);
      const key2 = (ttsService as any).generateCacheKey(text, config);

      expect(key1).toBe(key2);
    });
  });
});
