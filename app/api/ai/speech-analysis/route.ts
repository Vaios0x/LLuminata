import { NextRequest, NextResponse } from 'next/server';
import { aiServices } from '@/lib/ai-services';
import { validationSchemas, sanitizeUserInput, generateSecurityAudit } from '@/lib/security';
import { z } from 'zod';

// Esquema de validación para análisis de voz
const speechAnalysisSchema = z.object({
  audioData: z.string().min(1, 'Los datos de audio son requeridos'), // Base64 encoded
  language: z.string().optional().default('es-MX'),
  studentId: z.string().optional(),
  sessionId: z.string().optional()
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
    const validationResult = speechAnalysisSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { audioData, language, studentId, sessionId } = validationResult.data;

    // Decodificar datos de audio de Base64
    let audioBuffer: Float32Array;
    try {
      const audioArrayBuffer = Buffer.from(audioData, 'base64');
      // Convertir a Float32Array (simplificado - en producción usar Web Audio API)
      audioBuffer = new Float32Array(audioArrayBuffer.buffer);
    } catch (error) {
      return NextResponse.json(
        { error: 'Formato de audio inválido' },
        { status: 400 }
      );
    }

    // Generar auditoría de seguridad
    const audit = generateSecurityAudit(studentId || 'anonymous', 'speech_analysis', {
      ipAddress: clientIP,
      userAgent: request.headers.get('user-agent'),
      timestamp: new Date().toISOString(),
      language: language,
      sessionId: sessionId,
      audioLength: audioBuffer.length
    });

    // Analizar voz en tiempo real
    const analysis = await aiServices.analyzeRealTimeVoice(audioBuffer, language);

    // Log de auditoría
    console.log('[SECURITY AUDIT]', audit);

    return NextResponse.json({
      success: true,
      data: {
        recognition: analysis.recognition,
        command: analysis.command,
        sentiment: analysis.sentiment,
        confidence: analysis.recognition.confidence,
        language: analysis.recognition.language,
        alternatives: analysis.recognition.alternatives
      },
      message: 'Análisis de voz completado exitosamente',
      auditId: audit.id,
      modelSource: 'tensorflow-js',
      processingTime: Date.now() - new Date(audit.timestamp).getTime()
    });

  } catch (error) {
    console.error('Error en análisis de voz:', error);
    
    // Log de error de seguridad
    console.error('[SECURITY ERROR]', {
      error: error instanceof Error ? error.message : 'Error desconocido',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
      endpoint: '/api/ai/speech-analysis',
    });
    
    return NextResponse.json(
      { error: 'Error analizando voz' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const language = searchParams.get('language') || 'es-MX';

    // Obtener información sobre el reconocimiento de voz
    const speechInfo = {
      language: language,
      supportedLanguages: ['es-MX', 'maya', 'nahuatl', 'quechua'],
      features: {
        realTimeRecognition: true,
        voiceCommands: true,
        sentimentAnalysis: true,
        culturalAdaptation: true,
        indigenousLanguageSupport: true,
        noiseReduction: true,
        accentAdaptation: true
      },
      voiceCommands: {
        navigation: ['siguiente', 'anterior', 'inicio', 'menú'],
        interaction: ['ayuda', 'repetir', 'más lento', 'más rápido'],
        cultural: ['explicar', 'traducir', 'adaptar'],
        assessment: ['listo', 'terminar', 'pausar', 'continuar']
      },
      culturalAdaptations: {
        'maya': {
          greetings: ['ba\'ax ka wa\'alik', 'ma\'alob k\'iin'],
          commands: ['k\'a\'abet', 'k\'uch', 'bix']
        },
        'nahuatl': {
          greetings: ['niltze', 'tla xipactzin'],
          commands: ['xicmati', 'xicchihua', 'xictlazohtla']
        }
      }
    };

    return NextResponse.json({
      success: true,
      data: speechInfo,
      modelSource: 'tensorflow-js'
    });

  } catch (error) {
    console.error('Error obteniendo información de voz:', error);
    return NextResponse.json(
      { error: 'Error obteniendo información de voz' },
      { status: 500 }
    );
  }
}

/**
 * Valida los datos de audio
 */
function validateAudioData(audioData: string): boolean {
  try {
    // Verificar que los datos no estén vacíos
    if (!audioData || audioData.trim().length === 0) {
      return false;
    }

    // Verificar que sea Base64 válido
    const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
    if (!base64Regex.test(audioData)) {
      return false;
    }

    // Verificar longitud máxima (5MB en Base64)
    const maxLength = 5 * 1024 * 1024 * 4 / 3; // 5MB en Base64
    if (audioData.length > maxLength) {
      return false;
    }

    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Convierte datos de audio a formato compatible
 */
function convertAudioData(audioData: string): Float32Array {
  try {
    // Decodificar Base64
    const binaryString = atob(audioData);
    const bytes = new Uint8Array(binaryString.length);
    
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Convertir a Float32Array (simplificado)
    // En producción, usar Web Audio API para procesamiento real
    const floatArray = new Float32Array(bytes.length / 2);
    
    for (let i = 0; i < floatArray.length; i++) {
      const int16 = (bytes[i * 2] | (bytes[i * 2 + 1] << 8));
      floatArray[i] = int16 >= 0x8000 ? -(0x10000 - int16) / 0x8000 : int16 / 0x7FFF;
    }

    return floatArray;
  } catch (error) {
    throw new Error('Error convirtiendo datos de audio');
  }
}
