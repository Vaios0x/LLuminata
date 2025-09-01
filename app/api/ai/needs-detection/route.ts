import { NextRequest, NextResponse } from 'next/server';
import { needsDetectionService, InteractionData } from '@/lib/ai-services/needs-detection-service';
import { aiServices } from '@/lib/ai-services';
import { validationSchemas, sanitizeUserInput, validateUUID, generateSecurityAudit } from '@/lib/security';
import { z } from 'zod';

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
    
    const { studentId, interactionData } = body;

    // Validación básica
    if (!studentId || !validateUUID(studentId)) {
      return NextResponse.json(
        { error: 'studentId debe ser un UUID válido' },
        { status: 400 }
      );
    }

    if (!interactionData || typeof interactionData !== 'object') {
      return NextResponse.json(
        { error: 'interactionData es requerido y debe ser un objeto' },
        { status: 400 }
      );
    }

    // Sanitizar datos adicionales
    const sanitizedStudentId = sanitizeUserInput(studentId);
    const sanitizedInteractionData = sanitizeUserInput(JSON.stringify(interactionData));
    const parsedInteractionData = JSON.parse(sanitizedInteractionData);

    // Validar datos de interacción con función existente
    const validatedData = validateInteractionData(parsedInteractionData);
    if (!validatedData) {
      return NextResponse.json(
        { error: 'Datos de interacción inválidos después de sanitización' },
        { status: 400 }
      );
    }

    // Generar auditoría de seguridad
    const audit = generateSecurityAudit(sanitizedStudentId, 'needs_detection_analysis', {
      ipAddress: clientIP,
      userAgent: request.headers.get('user-agent'),
      timestamp: new Date().toISOString(),
    });

    // Analizar necesidades usando modelos híbridos (TensorFlow.js + APIs)
    let analysis;
    
    try {
      // Convertir datos de interacción al formato de LearningPattern
      const learningPattern = {
        readingSpeed: validatedData.readingSpeed,
        readingAccuracy: validatedData.readingAccuracy,
        readingComprehension: validatedData.readingComprehension,
        mathAccuracy: validatedData.mathAccuracy,
        mathSpeed: validatedData.mathSpeed,
        attentionSpan: validatedData.attentionSpan,
        taskCompletion: validatedData.taskCompletion,
        helpRequests: validatedData.helpRequests,
        audioPreference: validatedData.audioPreference,
        visualPreference: validatedData.visualPreference,
        kinestheticPreference: validatedData.kinestheticPreference,
        readingErrors: validatedData.readingErrors,
        mathErrors: validatedData.mathErrors,
        responseTime: validatedData.responseTime.mean,
        language: validatedData.language,
        culturalBackground: validatedData.culturalBackground,
        socioeconomicContext: validatedData.socioeconomicContext,
        previousEducation: validatedData.previousEducation || 0,
        sessionDuration: validatedData.sessionDuration || 0,
        breaksTaken: validatedData.breaksTaken || 0,
        internetSpeed: validatedData.internetSpeed || 0,
        offlineUsage: validatedData.offlineUsage || 0,
        deviceType: validatedData.deviceType || 'desktop',
        age: 10, // Por defecto, se puede extraer de la base de datos
        grade: 5, // Por defecto, se puede extraer de la base de datos
        errorRate: (validatedData.readingErrors.substitutions + validatedData.readingErrors.omissions) / 100,
        repetitionNeeded: validatedData.helpRequests > 3 ? 0.8 : 0.2,
        motorCoordination: 0.7, // Por defecto
        socialInteraction: 0.6, // Por defecto
        culturalContext: validatedData.culturalBackground,
        severity: 'moderate' // Por defecto
      };

      // Crear contexto cultural
      const culturalContext = {
        culture: validatedData.culturalBackground,
        language: validatedData.language,
        region: 'México',
        socioeconomicLevel: validatedData.socioeconomicContext,
        educationLevel: 'básico',
        age: 10,
        gender: 'no especificado',
        traditions: [],
        values: [],
        taboos: [],
        examples: []
      };

      // Análisis híbrido usando TensorFlow.js y APIs externas
      const hybridResults = await aiServices.hybridAnalysis({
        interactionPattern: learningPattern,
        culturalContext: culturalContext,
        behaviorData: {
          engagement: validatedData.taskCompletion,
          attention: validatedData.attentionSpan,
          frustration: 1 - validatedData.taskCompletion,
          confidence: validatedData.readingAccuracy,
          motivation: validatedData.helpRequests < 5 ? 0.8 : 0.4
        }
      });

      // Combinar con análisis existente
      const existingAnalysis = await needsDetectionService.analyzeNeeds(sanitizedStudentId, validatedData);
      
      analysis = {
        ...existingAnalysis,
        mlResults: hybridResults.mlResults,
        apiResults: hybridResults.apiResults,
        combinedAnalysis: hybridResults.combinedAnalysis,
        confidence: Math.max(
          existingAnalysis.confidence || 0,
          hybridResults.mlResults.needs?.[0]?.confidence || 0
        )
      } as any;

    } catch (mlError) {
      console.warn('Error con modelos de ML, usando solo análisis existente:', mlError);
      // Fallback al análisis existente
      analysis = await needsDetectionService.analyzeNeeds(sanitizedStudentId, validatedData);
      (analysis as any).modelSource = 'fallback';
    }

    // Log de auditoría
    console.log('[SECURITY AUDIT]', audit);

    return NextResponse.json({
      success: true,
      analysis,
      message: 'Análisis de necesidades completado exitosamente',
      auditId: audit.id,
    });

  } catch (error) {
    console.error('Error en detección de necesidades:', error);
    
    // Log de error de seguridad
    console.error('[SECURITY ERROR]', {
      error: error instanceof Error ? error.message : 'Error desconocido',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
      endpoint: '/api/ai/needs-detection',
    });
    
    return NextResponse.json(
      { error: 'Error analizando necesidades especiales' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');

    if (!studentId) {
      return NextResponse.json(
        { error: 'studentId es requerido' },
        { status: 400 }
      );
    }

    // Obtener análisis previo del estudiante
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    const specialNeeds = await prisma.specialNeed.findMany({
      where: { studentId },
      orderBy: { detectedAt: 'desc' }
    });

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: { learningProfile: true }
    });

    const recentAssessments = await prisma.assessment.findMany({
      where: { studentId },
      orderBy: { conductedAt: 'desc' },
      take: 5
    });

    await prisma.$disconnect();

    return NextResponse.json({
      success: true,
      data: {
        specialNeeds,
        learningProfile: student?.learningProfile,
        recentAssessments,
        lastAnalysis: specialNeeds.length > 0 ? specialNeeds[0].detectedAt : null
      },
      features: {
        mlAnalysis: true,
        aiAnalysis: true,
        ruleBasedAnalysis: true,
        culturalAdaptation: true,
        historicalData: true,
        confidenceScoring: true
      }
    });

  } catch (error) {
    console.error('Error obteniendo análisis previo:', error);
    return NextResponse.json(
      { error: 'Error obteniendo datos del estudiante' },
      { status: 500 }
    );
  }
}

/**
 * Valida los datos de interacción
 */
function validateInteractionData(data: any): InteractionData | null {
  try {
    // Validar campos requeridos
    const requiredFields = [
      'readingSpeed', 'readingAccuracy', 'readingComprehension',
      'mathAccuracy', 'mathSpeed', 'attentionSpan', 'taskCompletion',
      'helpRequests', 'audioPreference', 'visualPreference', 'kinestheticPreference'
    ];

    for (const field of requiredFields) {
      if (typeof data[field] !== 'number' || data[field] < 0) {
        console.error(`Campo inválido: ${field}`);
        return null;
      }
    }

    // Validar errores de lectura
    if (!data.readingErrors || typeof data.readingErrors !== 'object') {
      console.error('readingErrors debe ser un objeto');
      return null;
    }

    const readingErrorFields = ['substitutions', 'omissions', 'insertions', 'reversals', 'transpositions'];
    for (const field of readingErrorFields) {
      if (typeof data.readingErrors[field] !== 'number' || data.readingErrors[field] < 0) {
        console.error(`Campo inválido en readingErrors: ${field}`);
        return null;
      }
    }

    // Validar errores matemáticos
    if (!data.mathErrors || typeof data.mathErrors !== 'object') {
      console.error('mathErrors debe ser un objeto');
      return null;
    }

    const mathErrorFields = ['calculation', 'procedural', 'conceptual', 'visual'];
    for (const field of mathErrorFields) {
      if (typeof data.mathErrors[field] !== 'number' || data.mathErrors[field] < 0) {
        console.error(`Campo inválido en mathErrors: ${field}`);
        return null;
      }
    }

    // Validar tiempo de respuesta
    if (!data.responseTime || typeof data.responseTime !== 'object') {
      console.error('responseTime debe ser un objeto');
      return null;
    }

    const responseTimeFields = ['mean', 'variance', 'outliers'];
    for (const field of responseTimeFields) {
      if (typeof data.responseTime[field] !== 'number' || data.responseTime[field] < 0) {
        console.error(`Campo inválido en responseTime: ${field}`);
        return null;
      }
    }

    // Validar campos de contexto
    if (!data.language || typeof data.language !== 'string') {
      console.error('language debe ser un string');
      return null;
    }

    if (!data.culturalBackground || typeof data.culturalBackground !== 'string') {
      console.error('culturalBackground debe ser un string');
      return null;
    }

    if (!data.socioeconomicContext || typeof data.socioeconomicContext !== 'string') {
      console.error('socioeconomicContext debe ser un string');
      return null;
    }

    // Validar campos opcionales
    if (data.previousEducation !== undefined && (typeof data.previousEducation !== 'number' || data.previousEducation < 0)) {
      console.error('previousEducation debe ser un número no negativo');
      return null;
    }

    if (data.sessionDuration !== undefined && (typeof data.sessionDuration !== 'number' || data.sessionDuration < 0)) {
      console.error('sessionDuration debe ser un número no negativo');
      return null;
    }

    if (data.breaksTaken !== undefined && (typeof data.breaksTaken !== 'number' || data.breaksTaken < 0)) {
      console.error('breaksTaken debe ser un número no negativo');
      return null;
    }

    if (data.internetSpeed !== undefined && (typeof data.internetSpeed !== 'number' || data.internetSpeed < 0)) {
      console.error('internetSpeed debe ser un número no negativo');
      return null;
    }

    if (data.offlineUsage !== undefined && (typeof data.offlineUsage !== 'number' || data.offlineUsage < 0 || data.offlineUsage > 1)) {
      console.error('offlineUsage debe ser un número entre 0 y 1');
      return null;
    }

    // Validar tipo de dispositivo
    if (data.deviceType && !['mobile', 'tablet', 'desktop'].includes(data.deviceType)) {
      console.error('deviceType debe ser mobile, tablet o desktop');
      return null;
    }

    // Validar preferencias sensoriales (deben sumar aproximadamente 1)
    const totalPreference = data.audioPreference + data.visualPreference + data.kinestheticPreference;
    if (Math.abs(totalPreference - 1) > 0.1) {
      console.warn('Las preferencias sensoriales no suman 1, normalizando...');
      const sum = totalPreference;
      data.audioPreference /= sum;
      data.visualPreference /= sum;
      data.kinestheticPreference /= sum;
    }

    return data as InteractionData;

  } catch (error) {
    console.error('Error validando datos de interacción:', error);
    return null;
  }
}
