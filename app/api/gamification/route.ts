import { NextRequest, NextResponse } from 'next/server';
import { gamificationService } from '@/lib/gamification-service';
import { validationSchemas, sanitizeUserInput, generateSecurityAudit } from '@/lib/security';
import { z } from 'zod';

// Esquemas de validación
const recordEventSchema = z.object({
  userId: z.string().min(1),
  type: z.string().min(1),
  points: z.number().min(0),
  metadata: z.any().optional()
});

const createCompetitionSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  type: z.enum(['ACADEMIC', 'CULTURAL', 'CREATIVE', 'COLLABORATIVE', 'INDIVIDUAL']),
  maxParticipants: z.number().optional(),
  rewards: z.object({
    firstPlace: z.object({
      type: z.enum(['points', 'badge', 'achievement', 'title', 'feature_unlock']),
      value: z.union([z.number(), z.string()]),
      description: z.string()
    }),
    secondPlace: z.object({
      type: z.enum(['points', 'badge', 'achievement', 'title', 'feature_unlock']),
      value: z.union([z.number(), z.string()]),
      description: z.string()
    }),
    thirdPlace: z.object({
      type: z.enum(['points', 'badge', 'achievement', 'title', 'feature_unlock']),
      value: z.union([z.number(), z.string()]),
      description: z.string()
    }),
    participation: z.object({
      type: z.enum(['points', 'badge', 'achievement', 'title', 'feature_unlock']),
      value: z.union([z.number(), z.string()]),
      description: z.string()
    })
  }),
  criteria: z.any()
});

export async function POST(request: NextRequest) {
  try {
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown';
    
    const sanitizedBodyHeader = request.headers.get('x-sanitized-body');
    let body;
    
    if (sanitizedBodyHeader) {
      body = JSON.parse(sanitizedBodyHeader);
    } else {
      body = await request.json();
    }

    const { action, ...data } = body;

    // Generar auditoría de seguridad
    const audit = generateSecurityAudit('gamification', 'gamification_action', {
      ipAddress: clientIP,
      userAgent: request.headers.get('user-agent'),
      timestamp: new Date().toISOString(),
      action: action,
      data: data
    });

    switch (action) {
      case 'record_event':
        const eventValidation = recordEventSchema.safeParse(data);
        if (!eventValidation.success) {
          return NextResponse.json(
            { error: 'Datos de evento inválidos', details: eventValidation.error.issues },
            { status: 400 }
          );
        }

        await gamificationService.recordEvent(eventValidation.data);
        
        return NextResponse.json({
          success: true,
          message: 'Evento registrado exitosamente',
          auditId: audit.id
        });

      case 'create_competition':
        const competitionValidation = createCompetitionSchema.safeParse(data);
        if (!competitionValidation.success) {
          return NextResponse.json(
            { error: 'Datos de competencia inválidos', details: competitionValidation.error.issues },
            { status: 400 }
          );
        }

        const competition = await gamificationService.createCompetition({
          ...competitionValidation.data,
          startDate: new Date(competitionValidation.data.startDate),
          endDate: new Date(competitionValidation.data.endDate)
        });

        return NextResponse.json({
          success: true,
          data: competition,
          message: 'Competencia creada exitosamente',
          auditId: audit.id
        });

      default:
        return NextResponse.json(
          { error: 'Acción no válida' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Error en gamificación:', error);
    
    console.error('[SECURITY ERROR]', {
      error: error instanceof Error ? error.message : 'Error desconocido',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
      endpoint: '/api/gamification',
    });
    
    return NextResponse.json(
      { error: 'Error procesando solicitud de gamificación' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const competitionId = searchParams.get('competitionId');
    const action = searchParams.get('action');

    if (!action) {
      return NextResponse.json(
        { error: 'Acción requerida' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'user_data':
        if (!userId) {
          return NextResponse.json(
            { error: 'userId requerido' },
            { status: 400 }
          );
        }

        const userData = await gamificationService.getUserGamificationData(userId);
        
        return NextResponse.json({
          success: true,
          data: userData
        });

      case 'active_competitions':
        const competitions = await gamificationService.getActiveCompetitions();
        
        return NextResponse.json({
          success: true,
          data: competitions
        });

      case 'leaderboard':
        if (!competitionId) {
          return NextResponse.json(
            { error: 'competitionId requerido' },
            { status: 400 }
          );
        }

        const limit = parseInt(searchParams.get('limit') || '10');
        const leaderboard = await gamificationService.getCompetitionLeaderboard(competitionId, limit);
        
        return NextResponse.json({
          success: true,
          data: leaderboard
        });

      default:
        return NextResponse.json(
          { error: 'Acción no válida' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Error obteniendo datos de gamificación:', error);
    return NextResponse.json(
      { error: 'Error obteniendo datos de gamificación' },
      { status: 500 }
    );
  }
}
