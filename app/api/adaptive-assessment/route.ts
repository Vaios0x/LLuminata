import { NextRequest, NextResponse } from 'next/server';
import { adaptiveAssessmentService } from '@/lib/adaptive-assessment-service';
import { validationSchemas, sanitizeUserInput, validateUUID, generateSecurityAudit } from '@/lib/security';
import { z } from 'zod';

// Esquemas de validación
const CreateAssessmentSchema = z.object({
  studentId: z.string().uuid(),
  subject: z.string().min(1).max(50),
  assessmentType: z.enum(['diagnostic', 'progress', 'mastery', 'remedial']),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  culturalContext: z.object({
    culture: z.string().optional(),
    language: z.string().optional(),
    region: z.string().optional()
  }).optional(),
  accessibilityProfile: z.object({
    visualAcuity: z.string().optional(),
    hearing: z.string().optional(),
    motorCoordination: z.string().optional(),
    cognitiveProcessing: z.string().optional()
  }).optional(),
  adaptiveSettings: z.object({
    difficultyAdjustment: z.boolean().default(true),
    culturalAdaptation: z.boolean().default(true),
    accessibilityFeatures: z.boolean().default(true),
    realTimeAnalysis: z.boolean().default(true),
    personalizedFeedback: z.boolean().default(true),
    learningPathOptimization: z.boolean().default(true)
  }).default({})
});

const ProcessResponseSchema = z.object({
  assessmentId: z.string().uuid(),
  questionId: z.string(),
  answer: z.union([z.string(), z.number(), z.array(z.string()), z.boolean()]),
  timeSpent: z.number().min(0),
  confidence: z.number().min(0).max(1).optional(),
  hintsUsed: z.number().min(0).optional(),
  attempts: z.number().min(1).optional(),
  emotionalState: z.enum(['frustrated', 'confident', 'confused', 'engaged']).optional()
});

const CompleteAssessmentSchema = z.object({
  assessmentId: z.string().uuid()
});

/**
 * POST - Crear evaluación adaptativa
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar datos de entrada
    const validationResult = CreateAssessmentSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Datos de evaluación inválidos',
          details: validationResult.error.errors 
        },
        { status: 400 }
      );
    }

    const { 
      studentId, 
      subject, 
      assessmentType, 
      difficulty, 
      culturalContext, 
      accessibilityProfile, 
      adaptiveSettings 
    } = validationResult.data;

    // Sanitizar datos
    const sanitizedStudentId = sanitizeUserInput(studentId);
    const sanitizedSubject = sanitizeUserInput(subject);

    // Generar auditoría de seguridad
    const audit = generateSecurityAudit(sanitizedStudentId, 'adaptive_assessment_creation', {
      subject: sanitizedSubject,
      type: assessmentType,
      difficulty,
      timestamp: new Date().toISOString(),
    });

    // Crear evaluación adaptativa
    const assessment = await adaptiveAssessmentService.createAdaptiveAssessment({
      studentId: sanitizedStudentId,
      subject: sanitizedSubject,
      assessmentType,
      difficulty,
      culturalContext,
      accessibilityProfile,
      adaptiveSettings
    });

    return NextResponse.json({
      success: true,
      assessment: {
        assessmentId: assessment.assessmentId,
        questions: assessment.questions,
        studentProfile: assessment.studentProfile,
        adaptiveSettings: assessment.adaptiveSettings
      },
      auditId: audit.id
    });

  } catch (error) {
    console.error('Error creando evaluación adaptativa:', error);
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}

/**
 * PUT - Procesar respuesta de evaluación
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar respuesta
    const validationResult = ProcessResponseSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Datos de respuesta inválidos',
          details: validationResult.error.errors 
        },
        { status: 400 }
      );
    }

    const { 
      assessmentId, 
      questionId, 
      answer, 
      timeSpent, 
      confidence, 
      hintsUsed, 
      attempts, 
      emotionalState 
    } = validationResult.data;

    // Sanitizar datos
    const sanitizedAssessmentId = sanitizeUserInput(assessmentId);
    const sanitizedQuestionId = sanitizeUserInput(questionId);
    const sanitizedAnswer = typeof answer === 'string' ? sanitizeUserInput(answer) : answer;

    // Generar auditoría de seguridad
    const audit = generateSecurityAudit('student', 'adaptive_assessment_response', {
      assessmentId: sanitizedAssessmentId,
      questionId: sanitizedQuestionId,
      responseTime: timeSpent,
      timestamp: new Date().toISOString(),
    });

    // Procesar respuesta
    const response = await adaptiveAssessmentService.processResponse(
      sanitizedAssessmentId,
      {
        questionId: sanitizedQuestionId,
        answer: sanitizedAnswer,
        timeSpent,
        correct: false, // Se determinará en el servicio
        confidence: confidence || 0.5,
        hintsUsed: hintsUsed || 0,
        attempts: attempts || 1,
        emotionalState
      }
    );

    return NextResponse.json({
      success: true,
      feedback: response.feedback,
      nextQuestion: response.nextQuestion,
      difficultyAdjustment: response.difficultyAdjustment,
      learningInsights: response.learningInsights,
      recommendations: response.recommendations,
      auditId: audit.id
    });

  } catch (error) {
    console.error('Error procesando respuesta:', error);
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH - Completar evaluación
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar datos
    const validationResult = CompleteAssessmentSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Datos de completado inválidos',
          details: validationResult.error.errors 
        },
        { status: 400 }
      );
    }

    const { assessmentId } = validationResult.data;

    // Sanitizar datos
    const sanitizedAssessmentId = sanitizeUserInput(assessmentId);

    // Generar auditoría de seguridad
    const audit = generateSecurityAudit('student', 'adaptive_assessment_completion', {
      assessmentId: sanitizedAssessmentId,
      timestamp: new Date().toISOString(),
    });

    // Completar evaluación
    const results = await adaptiveAssessmentService.completeAssessment(sanitizedAssessmentId);

    return NextResponse.json({
      success: true,
      results,
      auditId: audit.id
    });

  } catch (error) {
    console.error('Error completando evaluación:', error);
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}

/**
 * GET - Obtener evaluaciones o recomendaciones
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const assessmentId = searchParams.get('assessmentId');
    const type = searchParams.get('type'); // 'assessments', 'recommendations', 'difficulties'

    if (!studentId) {
      return NextResponse.json(
        { error: 'studentId es requerido' },
        { status: 400 }
      );
    }

    // Sanitizar datos
    const sanitizedStudentId = sanitizeUserInput(studentId);

    // Generar auditoría de seguridad
    const audit = generateSecurityAudit(sanitizedStudentId, 'adaptive_assessment_query', {
      type: type || 'general',
      timestamp: new Date().toISOString(),
    });

    if (assessmentId) {
      // Obtener evaluación específica
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();

      const assessment = await prisma.assessmentSession.findUnique({
        where: { id: assessmentId },
        include: { responses: true }
      });

      if (!assessment) {
        return NextResponse.json(
          { error: 'Evaluación no encontrada' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        assessment,
        auditId: audit.id
      });

    } else if (type === 'recommendations') {
      // Obtener recomendaciones de lecciones
      const subject = searchParams.get('subject') || 'mathematics';
      const recommendations = await adaptiveAssessmentService.generateLessonRecommendations(
        sanitizedStudentId,
        subject
      );

      return NextResponse.json({
        success: true,
        recommendations,
        auditId: audit.id
      });

    } else if (type === 'difficulties') {
      // Obtener dificultades de aprendizaje detectadas
      const difficulties = await adaptiveAssessmentService.detectLearningDifficulties(sanitizedStudentId);

      return NextResponse.json({
        success: true,
        difficulties,
        auditId: audit.id
      });

    } else {
      // Obtener historial de evaluaciones
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();

      const assessments = await prisma.assessmentSession.findMany({
        where: { studentId: sanitizedStudentId },
        orderBy: { createdAt: 'desc' },
        take: 20
      });

      return NextResponse.json({
        success: true,
        assessments,
        auditId: audit.id
      });
    }

  } catch (error) {
    console.error('Error obteniendo datos de evaluación:', error);
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}
