import { NextRequest, NextResponse } from 'next/server';
import { aiServices } from '@/lib/ai-services';
import { validationSchemas, sanitizeUserInput, validateUUID, generateSecurityAudit } from '@/lib/security';
import { z } from 'zod';

// Esquema de validación para adaptación cultural
const culturalAdaptationSchema = z.object({
  content: z.string().min(1, 'El contenido es requerido'),
  culturalContext: z.object({
    culture: z.string().min(1, 'La cultura es requerida'),
    language: z.string().min(1, 'El idioma es requerido'),
    region: z.string().optional(),
    socioeconomicLevel: z.string().optional(),
    educationLevel: z.string().optional(),
    age: z.number().min(1).max(100).optional(),
    gender: z.string().optional(),
    traditions: z.array(z.string()).optional(),
    values: z.array(z.string()).optional(),
    taboos: z.array(z.string()).optional(),
    examples: z.array(z.string()).optional()
  }),
  targetLanguage: z.string().optional(),
  difficulty: z.string().optional()
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
    const validationResult = culturalAdaptationSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { content, culturalContext, targetLanguage, difficulty } = validationResult.data;

    // Sanitizar contenido
    const sanitizedContent = sanitizeUserInput(content);
    const sanitizedCulturalContext = sanitizeUserInput(JSON.stringify(culturalContext));
    const parsedCulturalContext = JSON.parse(sanitizedCulturalContext);

    // Generar auditoría de seguridad
    const audit = generateSecurityAudit('cultural_adaptation', 'cultural_adaptation_analysis', {
      ipAddress: clientIP,
      userAgent: request.headers.get('user-agent'),
      timestamp: new Date().toISOString(),
      culture: parsedCulturalContext.culture,
      language: parsedCulturalContext.language
    });

    // Procesar contenido educativo con adaptación cultural
    const processedContent = await aiServices.processEducationalContent({
      text: sanitizedContent,
      culturalContext: parsedCulturalContext.culture,
      targetLanguage: targetLanguage || parsedCulturalContext.language,
      difficulty: difficulty || 'medio'
    });

    // Log de auditoría
    console.log('[SECURITY AUDIT]', audit);

    return NextResponse.json({
      success: true,
      data: {
        originalContent: sanitizedContent,
        adaptedContent: processedContent.adaptedContent,
        textAnalysis: processedContent.textAnalysis,
        sentiment: processedContent.sentiment,
        recommendations: processedContent.recommendations
      },
      message: 'Adaptación cultural completada exitosamente',
      auditId: audit.id,
      modelSource: 'tensorflow-js'
    });

  } catch (error) {
    console.error('Error en adaptación cultural:', error);
    
    // Log de error de seguridad
    console.error('[SECURITY ERROR]', {
      error: error instanceof Error ? error.message : 'Error desconocido',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
      endpoint: '/api/ai/cultural-adaptation',
    });
    
    return NextResponse.json(
      { error: 'Error procesando adaptación cultural' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const culture = searchParams.get('culture');
    const language = searchParams.get('language');

    if (!culture || !language) {
      return NextResponse.json(
        { error: 'culture y language son requeridos' },
        { status: 400 }
      );
    }

    // Obtener información sobre la cultura y idioma
    const culturalInfo = {
      culture: culture,
      language: language,
      availableAdaptations: [
        'language_simplification',
        'cultural_examples',
        'indigenous_terms',
        'visual_adaptations',
        'audio_adaptations'
      ],
      supportedLanguages: ['es-MX', 'maya', 'nahuatl', 'quechua'],
      supportedCultures: ['maya', 'nahuatl', 'zapoteco', 'mixteco', 'otomi']
    };

    return NextResponse.json({
      success: true,
      data: culturalInfo,
      features: {
        mlAdaptation: true,
        culturalSensitivity: true,
        languageSupport: true,
        visualAdaptations: true,
        audioAdaptations: true,
        indigenousTerms: true
      }
    });

  } catch (error) {
    console.error('Error obteniendo información cultural:', error);
    return NextResponse.json(
      { error: 'Error obteniendo información cultural' },
      { status: 500 }
    );
  }
}

/**
 * Valida el contenido para adaptación cultural
 */
function validateContent(content: string): boolean {
  // Verificar que el contenido no esté vacío
  if (!content || content.trim().length === 0) {
    return false;
  }

  // Verificar longitud máxima (10,000 caracteres)
  if (content.length > 10000) {
    return false;
  }

  // Verificar caracteres peligrosos
  const dangerousPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(content)) {
      return false;
    }
  }

  return true;
}
