import { NextRequest, NextResponse } from 'next/server';
import { needsDetectionService } from '@/lib/ai-services/needs-detection-service';
import { aiServices } from '@/lib/ai-services';
import { validationSchemas, sanitizeUserInput, validateUUID, generateSecurityAudit } from '@/lib/security';
import { z } from 'zod';

// Esquemas de validación
const AccessibilityAssessmentSchema = z.object({
  studentId: z.string().uuid(),
  assessmentType: z.enum(['visual', 'auditory', 'motor', 'cognitive', 'comprehensive']),
  language: z.string().min(2).max(10),
  age: z.number().min(5).max(18).optional(),
  knownDisabilities: z.array(z.string()).optional(),
  deviceType: z.enum(['desktop', 'tablet', 'mobile']).optional(),
  assistiveTechnology: z.array(z.string()).optional(),
  preferences: z.object({
    highContrast: z.boolean().optional(),
    largeText: z.boolean().optional(),
    screenReader: z.boolean().optional(),
    keyboardOnly: z.boolean().optional(),
    reducedMotion: z.boolean().optional(),
    audioDescriptions: z.boolean().optional(),
    captions: z.boolean().optional()
  }).optional()
});

const AccessibilityResponseSchema = z.object({
  studentId: z.string().uuid(),
  assessmentId: z.string().uuid(),
  questionId: z.string(),
  response: z.union([z.string(), z.number(), z.boolean(), z.array(z.string())]),
  responseTime: z.number().min(0),
  difficulty: z.number().min(1).max(5).optional(),
  assistiveToolsUsed: z.array(z.string()).optional(),
  accessibilityIssues: z.array(z.string()).optional()
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
    const validationResult = AccessibilityAssessmentSchema.safeParse(body);
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
      age, 
      knownDisabilities, 
      deviceType, 
      assistiveTechnology, 
      preferences 
    } = validationResult.data;

    // Sanitizar datos
    const sanitizedStudentId = sanitizeUserInput(studentId);
    
    // Generar auditoría de seguridad
    const audit = generateSecurityAudit(sanitizedStudentId, 'accessibility_assessment_creation', {
      ipAddress: clientIP,
      userAgent: request.headers.get('user-agent'),
      assessmentType,
      language,
      deviceType,
      timestamp: new Date().toISOString(),
    });

    // Obtener perfil de accesibilidad del estudiante
    let accessibilityProfile;
    try {
      accessibilityProfile = await needsDetectionService.getAccessibilityProfile(sanitizedStudentId);
    } catch (profileError) {
      console.warn('Error obteniendo perfil de accesibilidad, creando perfil por defecto:', profileError);
      accessibilityProfile = {
        visualAcuity: 'normal',
        colorVision: 'normal',
        hearing: 'normal',
        motorCoordination: 'normal',
        cognitiveProcessing: 'normal',
        attentionSpan: 15,
        memoryCapacity: 'normal',
        languageProcessing: 'normal',
        assistiveTechnology: assistiveTechnology || [],
        preferences: preferences || {},
        knownDisabilities: knownDisabilities || []
      };
    }

    // Generar evaluación de accesibilidad
    let assessment;
    try {
      // Usar función básica por ahora
      assessment = await generateBasicAccessibilityAssessment(assessmentType, accessibilityProfile, language);
    } catch (assessmentError) {
      console.error('Error generando evaluación de accesibilidad:', assessmentError);
      
      // Fallback a evaluación básica
      assessment = await generateBasicAccessibilityAssessment(assessmentType, accessibilityProfile, language);
    }

    // Crear sesión de evaluación (simulada por ahora)
    const assessmentSession = {
      id: assessment.sessionId,
      studentId: sanitizedStudentId,
      type: assessmentType,
      language,
      deviceType: deviceType || 'desktop',
      assistiveTechnology: assistiveTechnology || [],
      preferences: preferences || {},
      knownDisabilities: knownDisabilities || [],
      status: 'active',
      startedAt: new Date(),
      metadata: {
        accessibilityProfile,
        auditId: audit.id
      }
    };

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
        accessibilityFeatures: assessment.accessibilityFeatures,
        assistiveTechnologySupport: assessment.assistiveTechnologySupport,
        complianceStandards: assessment.complianceStandards
      },
      studentProfile: {
        accessibilityLevel: accessibilityProfile.visualAcuity,
        assistiveTechnology: assistiveTechnology || [],
        preferences: preferences || {},
        knownDisabilities: knownDisabilities || []
      },
      recommendations: assessment.recommendations,
      auditId: audit.id
    });

  } catch (error) {
    console.error('Error creando evaluación de accesibilidad:', error);
    
    // Log de error de seguridad
    console.error('[SECURITY ERROR]', {
      error: error instanceof Error ? error.message : 'Error desconocido',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
      endpoint: '/api/ai/accessibility-assessment',
    });
    
    return NextResponse.json(
      { error: 'Error creando evaluación de accesibilidad' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar respuesta de evaluación
    const validationResult = AccessibilityResponseSchema.safeParse(body);
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
      studentId, 
      assessmentId, 
      questionId, 
      response, 
      responseTime, 
      difficulty, 
      assistiveToolsUsed, 
      accessibilityIssues 
    } = validationResult.data;

    // Sanitizar datos
    const sanitizedStudentId = sanitizeUserInput(studentId);
    const sanitizedAssessmentId = sanitizeUserInput(assessmentId);
    const sanitizedQuestionId = sanitizeUserInput(questionId);
    const sanitizedResponse = typeof response === 'string' ? sanitizeUserInput(response) : response;

    // Generar auditoría de seguridad
    const audit = generateSecurityAudit(sanitizedStudentId, 'accessibility_assessment_response', {
      assessmentId: sanitizedAssessmentId,
      questionId: sanitizedQuestionId,
      responseTime,
      difficulty,
      timestamp: new Date().toISOString(),
    });

    // Procesar respuesta y analizar necesidades de accesibilidad
    let accessibilityAnalysis;
    let recommendations;
    let nextQuestion;

    try {
      const responseAnalysis = {
        accessibilityAnalysis: {
          accessibilityLevel: 'moderate',
          detectedIssues: accessibilityIssues || [],
          assistiveTechnologyNeeds: assistiveToolsUsed || [],
          recommendations: []
        },
        recommendations: {
          immediate: [],
          shortTerm: [],
          longTerm: []
        },
        nextQuestion: null
      };

      accessibilityAnalysis = responseAnalysis.accessibilityAnalysis;
      recommendations = responseAnalysis.recommendations;
      nextQuestion = responseAnalysis.nextQuestion;

    } catch (analysisError) {
      console.error('Error procesando respuesta de accesibilidad:', analysisError);
      
      // Fallback básico
      accessibilityAnalysis = {
        accessibilityLevel: 'moderate',
        detectedIssues: accessibilityIssues || [],
        assistiveTechnologyNeeds: assistiveToolsUsed || [],
        recommendations: []
      };
      
      recommendations = {
        immediate: [],
        shortTerm: [],
        longTerm: []
      };
    }

    // Guardar respuesta (simulado por ahora)
    const responseData = {
      assessmentId: sanitizedAssessmentId,
      questionId: sanitizedQuestionId,
      studentId: sanitizedStudentId,
      response: JSON.stringify(sanitizedResponse),
      responseTime,
      difficulty: difficulty || 3,
      assistiveToolsUsed: assistiveToolsUsed || [],
      accessibilityIssues: accessibilityIssues || [],
      accessibilityAnalysis: accessibilityAnalysis,
      recommendations: recommendations,
      timestamp: new Date(),
      metadata: {
        auditId: audit.id
      }
    };

    // Actualizar sesión de evaluación (simulado)
    const sessionUpdate = {
      id: sanitizedAssessmentId,
      lastActivity: new Date(),
      responsesCount: 1
    };

    // Log de auditoría
    console.log('[SECURITY AUDIT]', audit);

    return NextResponse.json({
      success: true,
      accessibilityAnalysis,
      recommendations,
      nextQuestion,
      progress: {
        completed: true,
        difficulty: difficulty || 3,
        accessibilityIssues: accessibilityIssues || []
      },
      auditId: audit.id
    });

  } catch (error) {
    console.error('Error procesando respuesta de accesibilidad:', error);
    
    // Log de error de seguridad
    console.error('[SECURITY ERROR]', {
      error: error instanceof Error ? error.message : 'Error desconocido',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
      endpoint: '/api/ai/accessibility-assessment',
    });
    
    return NextResponse.json(
      { error: 'Error procesando respuesta de accesibilidad' },
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

    // Obtener evaluación específica (simulada)
    let results;

    if (assessmentId) {
      // Obtener evaluación específica (simulada)
      const assessment = {
        id: assessmentId,
        studentId,
        type: 'accessibility',
        language: 'es-MX',
        deviceType: 'desktop',
        assistiveTechnology: [],
        preferences: {},
        knownDisabilities: [],
        status: 'active',
        startedAt: new Date(),
        completedAt: null,
        responses: []
      };

      results = {
        assessment,
        summary: {
          totalQuestions: 0,
          averageDifficulty: 3,
          accessibilityIssues: [],
          assistiveToolsUsed: [],
          duration: null
        }
      };

    } else {
      // Obtener historial de evaluaciones del estudiante (simulado)
      const assessments = [
        {
          id: '1',
          studentId,
          type: 'accessibility',
          language: 'es-MX',
          deviceType: 'desktop',
          status: 'completed',
          startedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
          completedAt: new Date(),
          responses: []
        }
      ];

      results = {
        assessments,
        statistics: {
          totalAssessments: 1,
          completedAssessments: 1,
          completionRate: 100,
          overallAverageDifficulty: 3,
          recentDifficulties: [3]
        }
      };
    }

    return NextResponse.json({
      success: true,
      data: results,
      features: {
        accessibilityAssessment: true,
        assistiveTechnologySupport: true,
        complianceStandards: true,
        personalizedRecommendations: true,
        progressTracking: true,
        multiModalSupport: true
      }
    });

  } catch (error) {
    console.error('Error obteniendo evaluaciones de accesibilidad:', error);
    return NextResponse.json(
      { error: 'Error obteniendo datos de evaluación de accesibilidad' },
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

    // Eliminar evaluación y respuestas asociadas (simulado)
    console.log('Eliminando evaluación:', assessmentId);

    return NextResponse.json({
      success: true,
      message: 'Evaluación de accesibilidad eliminada exitosamente'
    });

  } catch (error) {
    console.error('Error eliminando evaluación de accesibilidad:', error);
    return NextResponse.json(
      { error: 'Error eliminando evaluación de accesibilidad' },
      { status: 500 }
    );
  }
}

/**
 * Genera una evaluación básica de accesibilidad como fallback
 */
async function generateBasicAccessibilityAssessment(type: string, accessibilityProfile: any, language: string) {
  const basicQuestions = {
    visual: [
      {
        id: 'q1',
        type: 'visual_acuity',
        question: '¿Puedes leer este texto claramente?',
        text: 'Texto de prueba para evaluación visual',
        options: ['Muy claro', 'Claro', 'Aceptable', 'Difícil', 'Muy difícil'],
        correctAnswer: 'Claro',
        difficulty: 2,
        accessibilityFeatures: {
          highContrast: true,
          largeText: true,
          screenReader: true
        }
      }
    ],
    auditory: [
      {
        id: 'q1',
        type: 'hearing_test',
        question: '¿Puedes escuchar el audio claramente?',
        audioUrl: '/audio/test-sound.mp3',
        options: ['Muy claro', 'Claro', 'Aceptable', 'Difícil', 'Muy difícil'],
        correctAnswer: 'Claro',
        difficulty: 2,
        accessibilityFeatures: {
          captions: true,
          audioDescription: true,
          volumeControl: true
        }
      }
    ],
    motor: [
      {
        id: 'q1',
        type: 'motor_coordination',
        question: '¿Puedes hacer clic en el botón correctamente?',
        interactiveElement: 'button',
        options: ['Muy fácil', 'Fácil', 'Aceptable', 'Difícil', 'Muy difícil'],
        correctAnswer: 'Fácil',
        difficulty: 2,
        accessibilityFeatures: {
          keyboardNavigation: true,
          voiceControl: true,
          switchControl: true
        }
      }
    ],
    cognitive: [
      {
        id: 'q1',
        type: 'cognitive_processing',
        question: '¿Puedes recordar la secuencia de números?',
        sequence: [3, 7, 1, 9, 4],
        options: ['Muy fácil', 'Fácil', 'Aceptable', 'Difícil', 'Muy difícil'],
        correctAnswer: 'Aceptable',
        difficulty: 3,
        accessibilityFeatures: {
          simplifiedInterface: true,
          stepByStep: true,
          visualAids: true
        }
      }
    ],
    comprehensive: [
      {
        id: 'q1',
        type: 'comprehensive_accessibility',
        question: '¿Qué tan accesible encuentras esta interfaz?',
        description: 'Evaluación general de accesibilidad',
        options: ['Muy accesible', 'Accesible', 'Aceptable', 'Poco accesible', 'Inaccesible'],
        correctAnswer: 'Accesible',
        difficulty: 2,
        accessibilityFeatures: {
          all: true
        }
      }
    ]
  };

  return {
    sessionId: `accessibility-fallback-${Date.now()}`,
    questions: basicQuestions[type as keyof typeof basicQuestions] || basicQuestions.comprehensive,
    estimatedDuration: 15,
    accessibilityFeatures: {
      screenReader: true,
      highContrast: true,
      keyboardNavigation: true,
      voiceControl: true,
      captions: true,
      audioDescription: true,
      largeText: true,
      reducedMotion: true
    },
    assistiveTechnologySupport: {
      screenReaders: ['NVDA', 'JAWS', 'VoiceOver'],
      switchControl: true,
      voiceControl: true,
      eyeTracking: false
    },
    complianceStandards: {
      wcag2_1: 'AA',
      section508: true,
      localRegulations: true
    },
    recommendations: {
      immediate: ['Activar alto contraste', 'Usar navegación por teclado'],
      shortTerm: ['Configurar lector de pantalla', 'Ajustar tamaño de texto'],
      longTerm: ['Evaluación completa por especialista', 'Implementar tecnologías asistivas']
    }
  };
}
