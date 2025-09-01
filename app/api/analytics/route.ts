import { NextRequest, NextResponse } from 'next/server';
import { analyticsService, trackEvent, trackPageView } from '@/lib/analytics/analytics-service';
import { generateSecurityAudit } from '@/lib/security';
import { z } from 'zod';

// Esquemas de validación
const trackEventSchema = z.object({
  event: z.string().min(1, 'Evento es requerido'),
  category: z.string().min(1, 'Categoría es requerida'),
  action: z.string().min(1, 'Acción es requerida'),
  label: z.string().optional(),
  value: z.number().optional(),
  parameters: z.record(z.any()).default({}),
  userId: z.string().uuid().optional(),
  sessionId: z.string().optional(),
});

const trackPageViewSchema = z.object({
  path: z.string().min(1, 'Path es requerido'),
  title: z.string().min(1, 'Título es requerido'),
  userId: z.string().uuid().optional(),
  sessionId: z.string().optional(),
});

const getUserMetricsSchema = z.object({
  userId: z.string().uuid('userId debe ser un UUID válido'),
});

const generateReportSchema = z.object({
  userId: z.string().uuid('userId debe ser un UUID válido'),
  period: z.enum(['daily', 'weekly', 'monthly']).default('weekly'),
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

    const { action, ...data } = body;

    // Generar auditoría de seguridad
    const audit = generateSecurityAudit('analytics', 'analytics_action', {
      ipAddress: clientIP,
      userAgent: request.headers.get('user-agent'),
      timestamp: new Date().toISOString(),
      action: action || 'track_event'
    });

    let result;

    switch (action) {
      case 'track_event':
        result = await handleTrackEvent(data, audit);
        break;
      case 'track_pageview':
        result = await handleTrackPageView(data, audit);
        break;
      case 'track_learning_event':
        result = await handleTrackLearningEvent(data, audit);
        break;
      case 'track_accessibility_event':
        result = await handleTrackAccessibilityEvent(data, audit);
        break;
      default:
        return NextResponse.json(
          { error: 'Acción no válida' },
          { status: 400 }
        );
    }

    // Log de auditoría
    console.log('[SECURITY AUDIT]', audit);

    return NextResponse.json({
      success: true,
      data: result,
      auditId: audit.id
    });

  } catch (error) {
    console.error('Error en API de analytics:', error);
    
    // Log de error de seguridad
    console.error('[SECURITY ERROR]', {
      error: error instanceof Error ? error.message : 'Error desconocido',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
      endpoint: '/api/analytics',
    });
    
    return NextResponse.json(
      { error: 'Error procesando analytics' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const userId = searchParams.get('userId');
    const period = searchParams.get('period') as 'daily' | 'weekly' | 'monthly';

    if (!action) {
      return NextResponse.json(
        { error: 'Acción es requerida' },
        { status: 400 }
      );
    }

    let result;

    switch (action) {
      case 'user_metrics':
        if (!userId) {
          return NextResponse.json(
            { error: 'userId es requerido' },
            { status: 400 }
          );
        }
        result = await analyticsService.getUserMetrics(userId);
        break;
      
      case 'progress_report':
        if (!userId) {
          return NextResponse.json(
            { error: 'userId es requerido' },
            { status: 400 }
          );
        }
        result = await analyticsService.generateProgressReport(userId, period || 'weekly');
        break;
      
      case 'engagement_metrics':
        result = await analyticsService.getEngagementMetrics();
        break;
      
      case 'admin_dashboard':
        result = await analyticsService.getAdminDashboard();
        break;
      
      default:
        return NextResponse.json(
          { error: 'Acción no válida' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error obteniendo analytics:', error);
    return NextResponse.json(
      { error: 'Error obteniendo analytics' },
      { status: 500 }
    );
  }
}

// ===== FUNCIONES AUXILIARES =====

async function handleTrackEvent(data: any, audit: any) {
  // Validar datos
  const validationResult = trackEventSchema.safeParse(data);
  if (!validationResult.success) {
    throw new Error(`Datos inválidos: ${validationResult.error.issues.map(i => i.message).join(', ')}`);
  }

  const eventData = validationResult.data;

  // Trackear evento
  await trackEvent({
    userId: eventData.userId,
    sessionId: eventData.sessionId || `session_${Date.now()}`,
    event: eventData.event,
    category: eventData.category,
    action: eventData.action,
    label: eventData.label,
    value: eventData.value,
    parameters: eventData.parameters,
    userAgent: 'API',
    page: '/api/analytics',
  });

  return {
    tracked: true,
    eventId: `event_${Date.now()}`,
    event: eventData.event,
    category: eventData.category
  };
}

async function handleTrackPageView(data: any, audit: any) {
  // Validar datos
  const validationResult = trackPageViewSchema.safeParse(data);
  if (!validationResult.success) {
    throw new Error(`Datos inválidos: ${validationResult.error.issues.map(i => i.message).join(', ')}`);
  }

  const pageViewData = validationResult.data;

  // Trackear pageview
  await trackPageView(
    pageViewData.path,
    pageViewData.title,
    pageViewData.userId,
    pageViewData.sessionId
  );

  return {
    tracked: true,
    path: pageViewData.path,
    title: pageViewData.title
  };
}

async function handleTrackLearningEvent(data: any, audit: any) {
  const { eventType, ...eventData } = data;

  if (!eventType || !eventData.userId) {
    throw new Error('eventType y userId son requeridos');
  }

  // Trackear evento de aprendizaje
  await analyticsService.trackLearningEvent(eventType, eventData);

  return {
    tracked: true,
    eventType,
    userId: eventData.userId
  };
}

async function handleTrackAccessibilityEvent(data: any, audit: any) {
  const { eventType, userId } = data;

  if (!eventType || !userId) {
    throw new Error('eventType y userId son requeridos');
  }

  // Trackear evento de accesibilidad
  await analyticsService.trackAccessibilityEvent(eventType, userId);

  return {
    tracked: true,
    eventType,
    userId
  };
}
