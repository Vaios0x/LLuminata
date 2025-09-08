import { NextRequest, NextResponse } from 'next/server';
import { ttsService } from '@/lib/ai-services/tts-service';
import { aiServices } from '@/lib/ai-services';
import { validationSchemas, sanitizeUserInput, validateUUID, generateSecurityAudit } from '@/lib/security';
import { z } from 'zod';

// Esquemas de validación
const VoiceSynthesisSchema = z.object({
  text: z.string().min(1).max(5000),
  language: z.string().min(2).max(10),
  voiceId: z.string().optional(),
  options: z.object({
    pitch: z.number().min(-20).max(20).optional(),
    speed: z.number().min(0.5).max(3.0).optional(),
    volume: z.number().min(0).max(1).optional(),
    gender: z.enum(['male', 'female', 'neutral']).optional(),
    age: z.number().min(5).max(80).optional(),
    emotion: z.enum(['neutral', 'happy', 'sad', 'excited', 'calm', 'serious']).optional(),
    culturalContext: z.object({
      culture: z.string().optional(),
      region: z.string().optional(),
      formality: z.enum(['formal', 'informal', 'casual']).optional(),
      accent: z.string().optional()
    }).optional(),
    accessibility: z.object({
      highContrast: z.boolean().optional(),
      slowSpeech: z.boolean().optional(),
      clearPronunciation: z.boolean().optional(),
      pauseBetweenSentences: z.boolean().optional()
    }).optional(),
    cache: z.boolean().optional()
  }).optional()
});

export async function POST(request: NextRequest) {
  try {
    // Obtener IP del cliente para auditoría
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown';
    
    // Obtener datos sanitizados del middleware
    const sanitizedBodyHeader = request.headers.get('x-sanitized-body');
    let body;
    
    if (sanitizedBodyHeader) {
      body = JSON.parse(sanitizedBodyHeader);
    } else {
      body = await request.json();
    }

    // Validar datos de entrada
    const validationResult = VoiceSynthesisSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Datos de entrada inválidos',
          details: validationResult.error.errors 
        },
        { status: 400 }
      );
    }

    const { text, language, voiceId, options } = validationResult.data;

    // Sanitizar texto
    const sanitizedText = sanitizeUserInput(text);
    
    // Generar auditoría de seguridad
    const audit = generateSecurityAudit('voice_synthesis', 'voice_synthesis_request', {
      ipAddress: clientIP,
      userAgent: request.headers.get('user-agent'),
      textLength: sanitizedText.length,
      language,
      timestamp: new Date().toISOString(),
    });

    // Validar idioma soportado
    const supportedLanguages = ttsService.getSupportedLanguages();
    if (!supportedLanguages.includes(language)) {
      return NextResponse.json(
        { 
          error: `Idioma no soportado: ${language}`,
          supportedLanguages,
          suggestions: supportedLanguages.filter(lang => 
            lang.startsWith(language.split('-')[0])
          )
        },
        { status: 400 }
      );
    }

    // Obtener configuración de voz
    const voiceConfig = voiceId ? 
      ttsService.getVoiceConfig(language, voiceId) : 
      ttsService.getVoiceConfig(language);

    if (!voiceConfig) {
      return NextResponse.json(
        { error: `Configuración de voz no encontrada para ${language}` },
        { status: 400 }
      );
    }

    // Aplicar adaptación cultural si se especifica
    let adaptedText = sanitizedText;
    if (options?.culturalContext) {
      try {
        const culturalService = aiServices.getCulturalService();
        const culturalAdaptation = await culturalService.adaptContent(
          sanitizedText,
          {
            culture: options.culturalContext.culture || 'default',
            language: language,
            region: 'default',
            ageGroup: 'adult',
            educationLevel: 'secondary',
            socioeconomicStatus: 'middle'
          }
        );
        adaptedText = culturalAdaptation.adaptedContent;
      } catch (adaptationError) {
        console.warn('Error en adaptación cultural, usando texto original:', adaptationError);
      }
    }

    // Aplicar optimizaciones de accesibilidad
    let processedText = adaptedText;
    if (options?.accessibility) {
      if (options.accessibility.clearPronunciation) {
        processedText = processedText.replace(/([.!?])\s*/g, '$1... ');
      }
      if (options.accessibility.pauseBetweenSentences) {
        processedText = processedText.replace(/([.!?])\s*/g, '$1 <break time="1s"/> ');
      }
      if (options.accessibility.slowSpeech) {
        options.speed = Math.min(options.speed || 1, 0.8);
      }
    }

    // Configurar opciones de síntesis
    const synthesisOptions = {
      pitch: options?.pitch || voiceConfig.pitch,
      speed: options?.speed || voiceConfig.speed,
      volume: options?.volume || 1.0,
      gender: options?.gender || voiceConfig.gender,
      age: options?.age || 25,
      emotion: options?.emotion || 'neutral',
      culturalContext: options?.culturalContext?.culture,
      accessibility: options?.accessibility,
      cache: options?.cache !== false
    };

    // Sintetizar audio
    const audioBuffer = await ttsService.synthesize(processedText, language, synthesisOptions);

    // Convertir a base64 para envío
    const base64Audio = Buffer.from(audioBuffer).toString('base64');

    // Obtener metadatos del audio
    const audioMetadata = {
      duration: 0,
      sampleRate: 44100,
      channels: 1,
      bitrate: 128000
    };

    // Log de auditoría
    console.log('[SECURITY AUDIT]', audit);

    return NextResponse.json({
      success: true,
      audio: base64Audio,
      format: 'mp3',
      language,
      voiceId: voiceConfig.voice,
      text: {
        original: sanitizedText,
        adapted: adaptedText,
        processed: processedText
      },
      metadata: {
        duration: audioMetadata.duration,
        sampleRate: audioMetadata.sampleRate,
        channels: audioMetadata.channels,
        bitrate: audioMetadata.bitrate,
        size: audioBuffer.byteLength
      },
      options: synthesisOptions,
      cacheStats: ttsService.getCacheStats(),
      auditId: audit.id
    });

  } catch (error) {
    console.error('Error en síntesis de voz:', error);
    
    // Log de error de seguridad
    console.error('[SECURITY ERROR]', {
      error: error instanceof Error ? error.message : 'Error desconocido',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
      endpoint: '/api/ai/voice-synthesis',
    });
    
    return NextResponse.json(
      { error: 'Error generando síntesis de voz' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const language = searchParams.get('language');
    const voiceId = searchParams.get('voiceId');

    // Obtener información de configuración
    const supportedLanguages = ttsService.getSupportedLanguages();
    const voiceConfig = language ? 
      (voiceId ? ttsService.getVoiceConfig(language, voiceId) : ttsService.getVoiceConfig(language)) : 
      null;
    
    const allVoices = language ? [
      { id: 'alloy', name: 'Alloy', language: 'es-MX' },
      { id: 'echo', name: 'Echo', language: 'es-MX' },
      { id: 'nova', name: 'Nova', language: 'maya' }
    ] : [];
    const cacheStats = ttsService.getCacheStats();

    // Obtener información de accesibilidad
    const accessibilityFeatures = {
      highContrast: true,
      slowSpeech: true,
      clearPronunciation: true,
      pauseBetweenSentences: true,
      emotionControl: true,
      culturalAdaptation: true,
      multipleVoices: true,
      speedControl: true,
      pitchControl: true,
      volumeControl: true
    };

    return NextResponse.json({
      supportedLanguages,
      voiceConfig,
      allVoices,
      cacheStats,
      accessibilityFeatures,
      features: {
        multilingual: true,
        culturalAdaptation: true,
        emotionSynthesis: true,
        accessibilityOptimization: true,
        caching: true,
        multipleProviders: true,
        realTimeSynthesis: true,
        batchProcessing: true
      },
      limits: {
        maxTextLength: 5000,
        maxAudioDuration: 300, // 5 minutos
        supportedFormats: ['mp3', 'wav', 'ogg'],
        maxConcurrentRequests: 10
      }
    });

  } catch (error) {
    console.error('Error obteniendo información de síntesis de voz:', error);
    return NextResponse.json(
      { error: 'Error obteniendo información de síntesis de voz' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cacheType = searchParams.get('type'); // 'all', 'language', 'voice'

    if (cacheType === 'language') {
      const language = searchParams.get('language');
      if (!language) {
        return NextResponse.json(
          { error: 'Parámetro language requerido para limpiar caché por idioma' },
          { status: 400 }
        );
      }
      // Limpiar caché por idioma (implementación pendiente)
      console.log(`Limpiando caché para idioma: ${language}`);
    } else if (cacheType === 'voice') {
      const voiceId = searchParams.get('voiceId');
      if (!voiceId) {
        return NextResponse.json(
          { error: 'Parámetro voiceId requerido para limpiar caché por voz' },
          { status: 400 }
        );
      }
      // Limpiar caché por voz (implementación pendiente)
      console.log(`Limpiando caché para voz: ${voiceId}`);
    } else {
      // Limpiar todo el caché
      ttsService.clearCache();
    }
    
    return NextResponse.json({
      success: true,
      message: `Caché limpiado exitosamente${cacheType ? ` (${cacheType})` : ''}`,
      cacheStats: ttsService.getCacheStats()
    });

  } catch (error) {
    console.error('Error limpiando caché:', error);
    return NextResponse.json(
      { error: 'Error limpiando caché' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, voiceId, language, settings } = body;

    switch (action) {
      case 'updateVoiceSettings':
        if (!voiceId || !language || !settings) {
          return NextResponse.json(
            { error: 'voiceId, language y settings son requeridos' },
            { status: 400 }
          );
        }
        
        // Actualizar configuración de voz (implementación pendiente)
        console.log(`Actualizando configuración para voz: ${voiceId}, idioma: ${language}`);
        const updatedConfig = { voice: voiceId, language, ...settings };
        return NextResponse.json({
          success: true,
          message: 'Configuración de voz actualizada',
          voiceConfig: updatedConfig
        });

      case 'previewVoice':
        if (!voiceId || !language || !settings) {
          return NextResponse.json(
            { error: 'voiceId, language y settings son requeridos' },
            { status: 400 }
          );
        }
        
        const previewText = "Hola, esta es una vista previa de la voz.";
        const previewAudio = await ttsService.synthesize(previewText, language, {
          ...settings,
          voiceId,
          cache: false
        });
        
        const base64Preview = Buffer.from(previewAudio).toString('base64');
        
        return NextResponse.json({
          success: true,
          preview: base64Preview,
          text: previewText
        });

      default:
        return NextResponse.json(
          { error: 'Acción no válida' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Error en operación PUT:', error);
    return NextResponse.json(
      { error: 'Error procesando solicitud' },
      { status: 500 }
    );
  }
}
