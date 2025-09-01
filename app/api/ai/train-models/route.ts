import { NextRequest, NextResponse } from 'next/server';
import { aiServices } from '@/lib/ai-services';
import { validationSchemas, sanitizeUserInput, generateSecurityAudit } from '@/lib/security';
import { z } from 'zod';

// Esquema de validación para entrenamiento de modelos
const trainingDataSchema = z.object({
  needsDetection: z.object({
    patterns: z.array(z.object({
      readingSpeed: z.number(),
      readingAccuracy: z.number(),
      readingComprehension: z.number(),
      mathAccuracy: z.number(),
      mathSpeed: z.number(),
      attentionSpan: z.number(),
      taskCompletion: z.number(),
      helpRequests: z.number(),
      audioPreference: z.number(),
      visualPreference: z.number(),
      kinestheticPreference: z.number(),
      readingErrors: z.object({
        substitutions: z.number(),
        omissions: z.number(),
        insertions: z.number(),
        reversals: z.number(),
        transpositions: z.number()
      }),
      mathErrors: z.object({
        calculation: z.number(),
        procedural: z.number(),
        conceptual: z.number(),
        visual: z.number()
      }),
      responseTime: z.number(),
      language: z.string(),
      culturalBackground: z.string(),
      socioeconomicContext: z.string(),
      previousEducation: z.number(),
      sessionDuration: z.number(),
      breaksTaken: z.number(),
      internetSpeed: z.number(),
      offlineUsage: z.number(),
      deviceType: z.string(),
      age: z.number(),
      grade: z.number(),
      errorRate: z.number(),
      repetitionNeeded: z.number(),
      motorCoordination: z.number(),
      socialInteraction: z.number(),
      culturalContext: z.string(),
      severity: z.string()
    })),
    labels: z.array(z.string())
  }).optional(),
  culturalAdaptation: z.object({
    texts: z.array(z.string()),
    contexts: z.array(z.object({
      culture: z.string(),
      language: z.string(),
      region: z.string().optional(),
      socioeconomicLevel: z.string().optional(),
      educationLevel: z.string().optional(),
      age: z.number().optional(),
      gender: z.string().optional(),
      traditions: z.array(z.string()).optional(),
      values: z.array(z.string()).optional(),
      taboos: z.array(z.string()).optional(),
      examples: z.array(z.string()).optional()
    })),
    adaptations: z.array(z.object({
      original: z.string(),
      adapted: z.string(),
      culturalElements: z.array(z.string()),
      languageAdaptations: z.array(z.string()),
      visualAdaptations: z.array(z.string()),
      audioAdaptations: z.array(z.string()),
      sensitivityNotes: z.array(z.string())
    }))
  }).optional(),
  speechRecognition: z.object({
    audioFeatures: z.array(z.object({
      mfcc: z.array(z.array(z.number())),
      spectralCentroid: z.number(),
      spectralRolloff: z.number(),
      zeroCrossingRate: z.number(),
      energy: z.number(),
      pitch: z.number(),
      formants: z.array(z.number())
    })),
    labels: z.array(z.string()),
    languages: z.array(z.string())
  }).optional(),
  auxiliary: z.object({
    sentiment: z.object({
      texts: z.array(z.string()),
      labels: z.array(z.string())
    }).optional(),
    behavior: z.object({
      data: z.array(z.object({
        engagement: z.number(),
        attention: z.number(),
        frustration: z.number(),
        confidence: z.number(),
        motivation: z.number()
      })),
      patterns: z.array(z.object({
        type: z.string(),
        indicators: z.array(z.string()),
        recommendations: z.array(z.string())
      }))
    }).optional(),
    recommendations: z.object({
      studentData: z.array(z.object({
        needs: z.array(z.string()),
        behavior: z.object({
          engagement: z.number(),
          attention: z.number(),
          frustration: z.number(),
          confidence: z.number(),
          motivation: z.number()
        }),
        progress: z.number(),
        preferences: z.array(z.string()),
        culturalContext: z.string(),
        age: z.number(),
        grade: z.number()
      })),
      recommendations: z.array(z.object({
        type: z.string(),
        description: z.string(),
        priority: z.string(),
        estimatedTime: z.number(),
        culturalContext: z.string(),
        accessibility: z.array(z.string())
      }))
    }).optional(),
    textAnalysis: z.object({
      texts: z.array(z.string()),
      cultures: z.array(z.string()),
      analyses: z.array(z.object({
        difficulty: z.string(),
        readingLevel: z.string(),
        topics: z.array(z.string()),
        culturalElements: z.array(z.string()),
        keywords: z.array(z.string()),
        sentiment: z.string(),
        complexity: z.number()
      }))
    }).optional()
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

    // Validar datos de entrenamiento
    const validationResult = trainingDataSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Datos de entrenamiento inválidos', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const trainingData = validationResult.data;

    // Generar auditoría de seguridad
    const audit = generateSecurityAudit('model_training', 'model_training_session', {
      ipAddress: clientIP,
      userAgent: request.headers.get('user-agent'),
      timestamp: new Date().toISOString(),
      modelsToTrain: Object.keys(trainingData),
      dataSize: JSON.stringify(trainingData).length
    });

    // Verificar que al menos un modelo tenga datos
    const hasData = Object.values(trainingData).some(data => data !== undefined);
    if (!hasData) {
      return NextResponse.json(
        { error: 'Se requiere al menos un conjunto de datos de entrenamiento' },
        { status: 400 }
      );
    }

    // Entrenar modelos
    console.log('🎓 Iniciando entrenamiento de modelos...');
    const startTime = Date.now();
    
    await aiServices.trainAllModels(trainingData);
    
    const trainingTime = Date.now() - startTime;

    // Guardar modelos entrenados
    console.log('💾 Guardando modelos entrenados...');
    await aiServices.saveAllModels();

    // Log de auditoría
    console.log('[SECURITY AUDIT]', audit);

    return NextResponse.json({
      success: true,
      message: 'Entrenamiento de modelos completado exitosamente',
      data: {
        modelsTrained: Object.keys(trainingData),
        trainingTime: trainingTime,
        modelStatus: aiServices.getModelStatus(),
        auditId: audit.id
      },
      modelSource: 'tensorflow-js'
    });

  } catch (error) {
    console.error('Error en entrenamiento de modelos:', error);
    
    // Log de error de seguridad
    console.error('[SECURITY ERROR]', {
      error: error instanceof Error ? error.message : 'Error desconocido',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
      endpoint: '/api/ai/train-models',
    });
    
    return NextResponse.json(
      { error: 'Error durante el entrenamiento de modelos' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Obtener estado de los modelos
    const modelStatus = aiServices.getModelStatus();
    const overallStatus = aiServices.getStatus();

    return NextResponse.json({
      success: true,
      data: {
        modelStatus,
        overallStatus,
        trainingCapabilities: {
          needsDetection: true,
          culturalAdaptation: true,
          speechRecognition: true,
          auxiliaryModels: true
        },
        supportedDataFormats: {
          needsDetection: 'LearningPattern[]',
          culturalAdaptation: 'ContentAdaptation[]',
          speechRecognition: 'AudioFeatures[]',
          auxiliary: 'Mixed data types'
        },
        modelArchitecture: {
          needsDetection: 'Sequential (Dense + Dropout + Softmax)',
          culturalAdaptation: 'Sequential (Embedding + LSTM + Dense)',
          speechRecognition: 'Sequential (Dense + LSTM)',
          auxiliary: 'Multiple Sequential models'
        }
      },
      modelSource: 'tensorflow-js'
    });

  } catch (error) {
    console.error('Error obteniendo estado de modelos:', error);
    return NextResponse.json(
      { error: 'Error obteniendo estado de modelos' },
      { status: 500 }
    );
  }
}

/**
 * Valida los datos de entrenamiento
 */
function validateTrainingData(data: any): boolean {
  try {
    // Verificar estructura básica
    if (!data || typeof data !== 'object') {
      return false;
    }

    // Verificar que al menos un modelo tenga datos
    const models = ['needsDetection', 'culturalAdaptation', 'speechRecognition', 'auxiliary'];
    const hasData = models.some(model => data[model] !== undefined);
    
    if (!hasData) {
      return false;
    }

    // Validar datos específicos de cada modelo
    if (data.needsDetection) {
      if (!Array.isArray(data.needsDetection.patterns) || 
          !Array.isArray(data.needsDetection.labels) ||
          data.needsDetection.patterns.length !== data.needsDetection.labels.length) {
        return false;
      }
    }

    if (data.culturalAdaptation) {
      if (!Array.isArray(data.culturalAdaptation.texts) ||
          !Array.isArray(data.culturalAdaptation.contexts) ||
          !Array.isArray(data.culturalAdaptation.adaptations)) {
        return false;
      }
    }

    if (data.speechRecognition) {
      if (!Array.isArray(data.speechRecognition.audioFeatures) ||
          !Array.isArray(data.speechRecognition.labels) ||
          !Array.isArray(data.speechRecognition.languages)) {
        return false;
      }
    }

    return true;
  } catch (error) {
    return false;
  }
}
