import { NextRequest, NextResponse } from 'next/server';
import { ttsService } from '@/lib/ai-services/tts-service';

export async function POST(request: NextRequest) {
  try {
    const { text, language, options } = await request.json();

    if (!text) {
      return NextResponse.json(
        { error: 'Texto requerido' },
        { status: 400 }
      );
    }

    // Validar idioma
    const supportedLanguages = ttsService.getSupportedLanguages();
    const targetLanguage = language || 'es-MX';
    
    if (!supportedLanguages.includes(targetLanguage)) {
      return NextResponse.json(
        { error: `Idioma no soportado. Idiomas disponibles: ${supportedLanguages.join(', ')}` },
        { status: 400 }
      );
    }

    // Sintetizar audio
    const audioBuffer = await ttsService.synthesize(text, targetLanguage, {
      pitch: options?.pitch,
      speed: options?.speed,
      gender: options?.gender,
      culturalContext: options?.culturalContext,
      cache: options?.cache !== false
    });

    // Convertir a base64 para envío
    const base64Audio = Buffer.from(audioBuffer).toString('base64');

    return NextResponse.json({
      success: true,
      audio: base64Audio,
      format: 'mp3',
      language: targetLanguage,
      textLength: text.length,
      audioSize: audioBuffer.byteLength,
      cacheStats: ttsService.getCacheStats()
    });

  } catch (error) {
    console.error('Error en síntesis de voz:', error);
    return NextResponse.json(
      { error: 'Error generando audio' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const language = searchParams.get('language');

    // Obtener información de configuración
    const supportedLanguages = ttsService.getSupportedLanguages();
    const voiceConfig = language ? ttsService.getVoiceConfig(language) : null;
    const cacheStats = ttsService.getCacheStats();

    return NextResponse.json({
      supportedLanguages,
      voiceConfig,
      cacheStats,
      features: {
        multilingual: true,
        culturalAdaptation: true,
        caching: true,
        multipleProviders: true
      }
    });

  } catch (error) {
    console.error('Error obteniendo información TTS:', error);
    return NextResponse.json(
      { error: 'Error obteniendo información' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Limpiar caché
    ttsService.clearCache();
    
    return NextResponse.json({
      success: true,
      message: 'Caché limpiado exitosamente'
    });

  } catch (error) {
    console.error('Error limpiando caché:', error);
    return NextResponse.json(
      { error: 'Error limpiando caché' },
      { status: 500 }
    );
  }
}
