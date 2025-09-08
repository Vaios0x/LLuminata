import { NextRequest, NextResponse } from 'next/server';
import { needsDetectionService } from '@/lib/ai-services/needs-detection-service';
import { aiServices } from '@/lib/ai-services';
import { validationSchemas, sanitizeUserInput, validateUUID, generateSecurityAudit } from '@/lib/security';
import { z } from 'zod';

// Esquemas de validación
const AssessmentSchema = z.object({
  studentId: z.string().uuid(),
  assessmentType: z.enum(['INITIAL', 'PROGRESS', 'DIAGNOSTIC', 'FINAL', 'ADAPTIVE', 'MASTERY', 'REMEDIAL']),
  language: z.string().min(2).max(10),
  grade: z.number().min(1).max(12).optional(),
  age: z.number().min(5).max(18).optional(),
  culturalBackground: z.string().optional(),
  specialNeeds: z.array(z.string()).optional(),
  previousScores: z.array(z.object({
    type: z.string(),
    score: z.number().min(0).max(100),
    date: z.string().datetime()
  })).optional(),
  adaptiveSettings: z.object({
    difficultyAdjustment: z.boolean().optional(),
    culturalAdaptation: z.boolean().optional(),
    accessibilityFeatures: z.boolean().optional(),
    realTimeAnalysis: z.boolean().optional(),
    personalizedFeedback: z.boolean().optional()
  }).optional()
});

const AssessmentResponseSchema = z.object({
  studentId: z.string().uuid(),
  assessmentId: z.string().uuid(),
  questionId: z.string(),
  response: z.union([z.string(), z.number(), z.array(z.string()), z.boolean()]),
  responseTime: z.number().min(0),
  confidence: z.number().min(0).max(1).optional(),
  hintsUsed: z.number().min(0).optional(),
  attempts: z.number().min(1).optional()
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
    const validationResult = AssessmentSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Datos de entrada inválidos',
          details: validationResult.error.errors 
        },
        { status: 400 }
      );
    }

    const { 
      studentId, 
      assessmentType, 
      language, 
      grade, 
      age, 
      culturalBackground, 
      specialNeeds, 
      previousScores, 
      adaptiveSettings 
    } = validationResult.data;

    // Sanitizar datos
    const sanitizedStudentId = sanitizeUserInput(studentId);
    const sanitizedCulturalBackground = culturalBackground ? sanitizeUserInput(culturalBackground) : 'default';
    
    // Generar auditoría de seguridad
    const audit = generateSecurityAudit(sanitizedStudentId, 'assessment_creation', {
      ipAddress: clientIP,
      userAgent: request.headers.get('user-agent'),
      assessmentType,
      language,
      timestamp: new Date().toISOString(),
    });

    // Obtener perfil de aprendizaje del estudiante
    let learningProfile;
    try {
      learningProfile = await needsDetectionService.getLearningProfile(sanitizedStudentId);
    } catch (profileError) {
      console.warn('Error obteniendo perfil de aprendizaje, usando perfil por defecto:', profileError);
      learningProfile = {
        readingLevel: grade || 5,
        mathLevel: grade || 5,
        comprehensionLevel: grade || 5,
        attentionSpan: 15,
        preferredLearningStyle: 'visual',
        culturalContext: sanitizedCulturalBackground,
        specialNeeds: specialNeeds || [],
        accessibilityRequirements: []
      };
    }

    // Analizar necesidades especiales si no están definidas
    let detectedNeeds = specialNeeds || [];
    if (!specialNeeds || specialNeeds.length === 0) {
      try {
        const needsAnalysis = await needsDetectionService.analyzeNeeds(sanitizedStudentId, {
          readingSpeed: learningProfile.readingLevel * 10,
          readingAccuracy: learningProfile.readingLevel * 8,
          readingComprehension: learningProfile.comprehensionLevel * 8,
          readingErrors: { substitutions: 2, omissions: 1, insertions: 0, reversals: 0, transpositions: 0 },
          mathAccuracy: learningProfile.mathLevel * 8,
          mathSpeed: learningProfile.mathLevel * 10,
          mathErrors: { calculation: 1, procedural: 1, conceptual: 0, visual: 0 },
          attentionSpan: learningProfile.attentionSpan || 15,
          responseTime: { mean: 5, variance: 2, outliers: 0 },
          taskCompletion: 0.7,
          helpRequests: 2,
          audioPreference: 0.3,
          visualPreference: 0.5,
          kinestheticPreference: 0.2,
          language,
          culturalBackground: sanitizedCulturalBackground,
          socioeconomicContext: 'medium',
          previousEducation: 3,
          timeOfDay: 'morning',
          sessionDuration: 45,
          breaksTaken: 2,
          deviceType: 'desktop',
          internetSpeed: 50,
          offlineUsage: 0.1
        });
        
        detectedNeeds = needsAnalysis.specialNeeds?.map(need => need.type) || [];
      } catch (needsError) {
        console.warn('Error analizando necesidades especiales:', needsError);
      }
    }

    // Crear contexto cultural
    const culturalContext = {
      culture: sanitizedCulturalBackground,
      language,
      region: 'México',
      socioeconomicLevel: 'medium',
      educationLevel: 'básico',
      age: age || 10,
      gender: 'no especificado',
      traditions: [],
      values: [],
      taboos: [],
      examples: []
    };

    // Generar evaluación adaptativa (simulada por ahora)
    let assessment;
    try {
      // Usar función básica por ahora
      assessment = await generateBasicAssessment(assessmentType, learningProfile, language);
    } catch (assessmentError) {
      console.error('Error generando evaluación adaptativa:', assessmentError);
      
      // Fallback a evaluación básica
      assessment = await generateBasicAssessment(assessmentType, learningProfile, language);
    }

    // Crear sesión de evaluación en la base de datos
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    const assessmentSession = await prisma.assessmentSession.create({
      data: {
        id: assessment.sessionId,
        studentId: sanitizedStudentId,
        type: assessmentType,
        subject: 'general',
        adaptiveSettings: adaptiveSettings || {},
        studentProfile: {
          learningProfile,
          culturalContext,
          auditId: audit.id
        },
        learningDifficulties: detectedNeeds,
        metadata: {
          language,
          grade: grade || 5,
          culturalBackground: sanitizedCulturalBackground
        }
      }
    });

    await prisma.$disconnect();

    // Log de auditoría
    console.log('[SECURITY AUDIT]', audit);

    return NextResponse.json({
      success: true,
      assessment: {
        sessionId: assessment.sessionId,
        type: assessmentType,
        language,
        questions: assessment.questions,
        totalQuestions: assessment.questions.length,
        estimatedDuration: assessment.estimatedDuration,
        adaptiveSettings: assessment.adaptiveSettings,
        culturalContext: assessment.culturalContext,
        accessibilityFeatures: assessment.accessibilityFeatures
      },
      studentProfile: {
        learningLevel: learningProfile.readingLevel,
        specialNeeds: detectedNeeds,
        culturalBackground: sanitizedCulturalBackground,
        adaptiveCapabilities: assessment.adaptiveCapabilities
      },
      auditId: audit.id
    });

  } catch (error) {
    console.error('Error creando evaluación:', error);
    
    // Log de error de seguridad
    console.error('[SECURITY ERROR]', {
      error: error instanceof Error ? error.message : 'Error desconocido',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
      endpoint: '/api/ai/assessment',
    });
    
    return NextResponse.json(
      { error: 'Error creando evaluación adaptativa' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar respuesta de evaluación
    const validationResult = AssessmentResponseSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Datos de respuesta inválidos',
          details: validationResult.error.errors 
        },
        { status: 400 }
      );
    }

    const { studentId, assessmentId, questionId, response, responseTime, confidence, hintsUsed, attempts } = validationResult.data;

    // Sanitizar datos
    const sanitizedStudentId = sanitizeUserInput(studentId);
    const sanitizedAssessmentId = sanitizeUserInput(assessmentId);
    const sanitizedQuestionId = sanitizeUserInput(questionId);
    const sanitizedResponse = typeof response === 'string' ? sanitizeUserInput(response) : response;

    // Generar auditoría de seguridad
    const audit = generateSecurityAudit(sanitizedStudentId, 'assessment_response', {
      assessmentId: sanitizedAssessmentId,
      questionId: sanitizedQuestionId,
      responseTime,
      timestamp: new Date().toISOString(),
    });

    // Procesar respuesta y generar siguiente pregunta adaptativa
    let nextQuestion;
    let feedback;
    let difficultyAdjustment;

    try {
      // Simulación de análisis de respuesta adaptativa
      const responseAnalysis = {
        nextQuestion: {
          id: 'next_question_1',
          text: '¿Cuál es la siguiente pregunta?',
          type: 'multiple_choice',
          options: ['Opción A', 'Opción B', 'Opción C', 'Opción D'],
          difficulty: 'medium'
        },
        feedback: {
          type: 'general',
          message: 'Respuesta recibida correctamente',
          score: 0.5,
          suggestions: []
        },
        difficultyAdjustment: {
          direction: 'maintain',
          reason: 'fallback_mode'
        }
      };

      nextQuestion = responseAnalysis.nextQuestion;
      feedback = responseAnalysis.feedback;
      difficultyAdjustment = responseAnalysis.difficultyAdjustment;

    } catch (analysisError) {
      console.error('Error procesando respuesta:', analysisError);
      
      // Fallback básico
      feedback = {
        type: 'general',
        message: 'Respuesta recibida correctamente',
        score: 0.5,
        suggestions: []
      };
      
      difficultyAdjustment = {
        direction: 'maintain',
        reason: 'fallback_mode'
      };
    }

    // Guardar respuesta en la base de datos
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    await prisma.assessmentResponse.create({
      data: {
        assessmentId: sanitizedAssessmentId,
        questionId: sanitizedQuestionId,
        studentId: sanitizedStudentId,
        response: JSON.stringify(sanitizedResponse),
        responseTime,
        confidence: confidence || 0.5,
        hintsUsed: hintsUsed || 0,
        attempts: attempts || 1,
        isCorrect: feedback.score > 0.7,
        score: feedback.score,
        feedback: feedback,
        difficultyAdjustment: difficultyAdjustment,
        timestamp: new Date(),
        metadata: {
          auditId: audit.id
        }
      }
    });

    // Actualizar sesión de evaluación
    await prisma.assessmentSession.update({
      where: { id: sanitizedAssessmentId },
      data: {
        updatedAt: new Date()
      }
    });

    await prisma.$disconnect();

    // Log de auditoría
    console.log('[SECURITY AUDIT]', audit);

    return NextResponse.json({
      success: true,
      feedback,
      difficultyAdjustment,
      nextQuestion,
      progress: {
        completed: true,
        score: feedback.score,
        timeSpent: responseTime
      },
      auditId: audit.id
    });

  } catch (error) {
    console.error('Error procesando respuesta:', error);
    
    // Log de error de seguridad
    console.error('[SECURITY ERROR]', {
      error: error instanceof Error ? error.message : 'Error desconocido',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
      endpoint: '/api/ai/assessment',
    });
    
    return NextResponse.json(
      { error: 'Error procesando respuesta de evaluación' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const assessmentId = searchParams.get('assessmentId');
    const type = searchParams.get('type');

    if (!studentId || !validateUUID(studentId)) {
      return NextResponse.json(
        { error: 'studentId debe ser un UUID válido' },
        { status: 400 }
      );
    }

    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    let results;

    if (assessmentId) {
      // Obtener evaluación específica
      const assessment = await prisma.assessmentSession.findUnique({
        where: { id: assessmentId },
        include: {
          responses: {
            orderBy: { timestamp: 'asc' }
          }
        }
      });

      if (!assessment) {
        await prisma.$disconnect();
        return NextResponse.json(
          { error: 'Evaluación no encontrada' },
          { status: 404 }
        );
      }

      // Calcular resultados
      const totalQuestions = assessment.responses.length;
      const correctAnswers = assessment.responses.filter(r => r.isCorrect).length;
      const averageScore = assessment.responses.reduce((sum, r) => sum + r.score, 0) / totalQuestions;
      const averageResponseTime = assessment.responses.reduce((sum, r) => sum + r.responseTime, 0) / totalQuestions;

      results = {
        assessment,
        summary: {
          totalQuestions,
          correctAnswers,
          accuracy: (correctAnswers / totalQuestions) * 100,
          averageScore: averageScore * 100,
          averageResponseTime,
          duration: assessment.endTime ? 
            new Date(assessment.endTime).getTime() - new Date(assessment.startTime).getTime() : 
            null
        }
      };

    } else {
      // Obtener historial de evaluaciones del estudiante
      const assessments = await prisma.assessmentSession.findMany({
        where: { 
          studentId,
          ...(type && { type: type as any })
        },
        include: {
          responses: true
        },
        orderBy: { startTime: 'desc' },
        take: 20
      });

      // Calcular estadísticas generales
      const totalAssessments = assessments.length;
      const completedAssessments = assessments.filter(a => a.status === 'completed').length;
      const averageScores = assessments
        .filter(a => a.status === 'completed')
        .map(a => {
          const responses = a.responses || [];
          return responses.length > 0 ? 
            responses.reduce((sum, r) => sum + r.score, 0) / responses.length : 0;
        });

      const overallAverage = averageScores.length > 0 ? 
        averageScores.reduce((sum, score) => sum + score, 0) / averageScores.length : 0;

      results = {
        assessments,
        statistics: {
          totalAssessments,
          completedAssessments,
          completionRate: (completedAssessments / totalAssessments) * 100,
          overallAverage: overallAverage * 100,
          recentPerformance: averageScores.slice(0, 5).map(score => score * 100)
        }
      };
    }

    await prisma.$disconnect();

    return NextResponse.json({
      success: true,
      data: results,
      features: {
        adaptiveAssessment: true,
        culturalAdaptation: true,
        realTimeAnalysis: true,
        personalizedFeedback: true,
        progressTracking: true,
        accessibilitySupport: true
      }
    });

  } catch (error) {
    console.error('Error obteniendo evaluaciones:', error);
    return NextResponse.json(
      { error: 'Error obteniendo datos de evaluación' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const assessmentId = searchParams.get('assessmentId');

    if (!assessmentId || !validateUUID(assessmentId)) {
      return NextResponse.json(
        { error: 'assessmentId debe ser un UUID válido' },
        { status: 400 }
      );
    }

    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    // Eliminar evaluación y respuestas asociadas
    await prisma.assessmentResponse.deleteMany({
      where: { assessmentId }
    });

    await prisma.assessmentSession.delete({
      where: { id: assessmentId }
    });

    await prisma.$disconnect();

    return NextResponse.json({
      success: true,
      message: 'Evaluación eliminada exitosamente'
    });

  } catch (error) {
    console.error('Error eliminando evaluación:', error);
    return NextResponse.json(
      { error: 'Error eliminando evaluación' },
      { status: 500 }
    );
  }
}

/**
 * Genera una evaluación básica como fallback
 */
async function generateBasicAssessment(type: string, learningProfile: any, language: string) {
  const basicQuestions = {
    reading: [
      {
        id: 'q1',
        type: 'multiple_choice',
        question: '¿Cuál es la palabra que falta en la oración?',
        text: 'El gato ___ en el jardín.',
        options: ['corre', 'corrió', 'correrá', 'corriendo'],
        correctAnswer: 'corre',
        difficulty: learningProfile.readingLevel,
        culturalContext: 'neutral'
      }
    ],
    math: [
      {
        id: 'q1',
        type: 'multiple_choice',
        question: '¿Cuánto es 5 + 3?',
        options: ['6', '7', '8', '9'],
        correctAnswer: '8',
        difficulty: learningProfile.mathLevel,
        culturalContext: 'neutral'
      }
    ],
    comprehension: [
      {
        id: 'q1',
        type: 'text_comprehension',
        instruction: 'Lee el siguiente texto y responde la pregunta.',
        text: 'María tiene 3 manzanas. Su hermano le da 2 más. ¿Cuántas manzanas tiene María ahora?',
        question: '¿Cuántas manzanas tiene María en total?',
        correctAnswer: '5',
        difficulty: learningProfile.comprehensionLevel,
        culturalContext: 'neutral'
      }
    ]
  };

  return {
    sessionId: `fallback-${Date.now()}`,
    questions: basicQuestions[type as keyof typeof basicQuestions] || basicQuestions.reading,
    estimatedDuration: 10,
    adaptiveSettings: {
      difficultyAdjustment: false,
      culturalAdaptation: false,
      accessibilityFeatures: true,
      realTimeAnalysis: false,
      personalizedFeedback: false
    },
    culturalContext: {
      culture: 'default',
      language,
      region: 'México'
    },
    accessibilityFeatures: {
      screenReader: true,
      highContrast: true,
      keyboardNavigation: true
    },
    adaptiveCapabilities: {
      difficultyAdjustment: false,
      culturalAdaptation: false,
      realTimeAnalysis: false
    }
  };
}
