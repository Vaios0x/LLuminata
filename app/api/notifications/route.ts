import { NextRequest, NextResponse } from 'next/server';
import { notificationSystem } from '@/lib/notifications';
import { validationSchemas, sanitizeUserInput, validateUUID, generateSecurityAudit } from '@/lib/security';
import { z } from 'zod';

// Esquemas de validación
const sendNotificationSchema = z.object({
  type: z.enum(['push', 'email', 'sms', 'in-app']),
  title: z.string().min(1, 'El título es requerido').max(100, 'El título es muy largo'),
  message: z.string().min(1, 'El mensaje es requerido').max(500, 'El mensaje es muy largo'),
  userId: z.string().uuid('userId debe ser un UUID válido'),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
  category: z.enum(['lesson', 'assessment', 'achievement', 'reminder', 'support', 'system']).default('system'),
  metadata: z.record(z.any()).optional(),
  scheduledFor: z.string().datetime().optional(),
  expiresAt: z.string().datetime().optional(),
  culturalContext: z.string().optional(),
  language: z.string().optional(),
  accessibility: z.object({
    screenReader: z.boolean().default(true),
    highContrast: z.boolean().default(true),
    largeText: z.boolean().default(true),
    audioDescription: z.boolean().default(false)
  }).optional()
});

const sendTemplateNotificationSchema = z.object({
  templateId: z.string().min(1, 'templateId es requerido'),
  userId: z.string().uuid('userId debe ser un UUID válido'),
  variables: z.record(z.string()).default({}),
  options: z.object({
    type: z.enum(['push', 'email', 'sms', 'in-app']).optional(),
    priority: z.enum(['low', 'normal', 'high', 'urgent']).optional(),
    culturalContext: z.string().optional(),
    language: z.string().optional(),
    scheduledFor: z.string().datetime().optional()
  }).optional()
});

const sendBulkNotificationSchema = z.object({
  templateId: z.string().min(1, 'templateId es requerido'),
  users: z.array(z.object({
    userId: z.string().uuid('userId debe ser un UUID válido'),
    variables: z.record(z.string()).default({}),
    culturalContext: z.string().optional(),
    language: z.string().optional()
  })).min(1, 'Al menos un usuario es requerido').max(1000, 'Máximo 1000 usuarios por lote'),
  options: z.object({
    type: z.enum(['push', 'email', 'sms', 'in-app']).optional(),
    priority: z.enum(['low', 'normal', 'high', 'urgent']).optional(),
    scheduledFor: z.string().datetime().optional()
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

    const { action, ...data } = body;

    // Generar auditoría de seguridad
    const audit = generateSecurityAudit('notification_system', 'notification_api_call', {
      ipAddress: clientIP,
      userAgent: request.headers.get('user-agent'),
      timestamp: new Date().toISOString(),
      action: action || 'send_notification'
    });

    let result;

    switch (action) {
      case 'send_notification':
        result = await handleSendNotification(data, audit);
        break;
      case 'send_template':
        result = await handleSendTemplateNotification(data, audit);
        break;
      case 'send_bulk':
        result = await handleSendBulkNotification(data, audit);
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
    console.error('Error en API de notificaciones:', error);
    
    // Log de error de seguridad
    console.error('[SECURITY ERROR]', {
      error: error instanceof Error ? error.message : 'Error desconocido',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
      endpoint: '/api/notifications',
    });
    
    return NextResponse.json(
      { error: 'Error procesando notificación' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const type = searchParams.get('type') as any;
    const status = searchParams.get('status') as any;
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!userId || !validateUUID(userId)) {
      return NextResponse.json(
        { error: 'userId válido es requerido' },
        { status: 400 }
      );
    }

    const notifications = await notificationSystem.getUserNotifications(userId, {
      type,
      status,
      limit,
      offset
    });

    const stats = await notificationSystem.getNotificationStats(userId);

    return NextResponse.json({
      success: true,
      data: {
        notifications,
        stats,
        pagination: {
          limit,
          offset,
          total: stats.total
        }
      }
    });

  } catch (error) {
    console.error('Error obteniendo notificaciones:', error);
    return NextResponse.json(
      { error: 'Error obteniendo notificaciones' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const userId = searchParams.get('userId');
    const notificationId = searchParams.get('notificationId');

    if (!userId || !validateUUID(userId)) {
      return NextResponse.json(
        { error: 'userId válido es requerido' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'mark_read':
        if (!notificationId) {
          return NextResponse.json(
            { error: 'notificationId es requerido' },
            { status: 400 }
          );
        }
        await notificationSystem.markAsRead(notificationId, userId);
        break;
      
      case 'delete':
        if (!notificationId) {
          return NextResponse.json(
            { error: 'notificationId es requerido' },
            { status: 400 }
          );
        }
        await notificationSystem.deleteNotification(notificationId, userId);
        break;
      
      default:
        return NextResponse.json(
          { error: 'Acción no válida' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      message: `Notificación ${action === 'mark_read' ? 'marcada como leída' : 'eliminada'} exitosamente`
    });

  } catch (error) {
    console.error('Error actualizando notificación:', error);
    return NextResponse.json(
      { error: 'Error actualizando notificación' },
      { status: 500 }
    );
  }
}

// ===== FUNCIONES AUXILIARES =====

async function handleSendNotification(data: any, audit: any) {
  // Validar datos
  const validationResult = sendNotificationSchema.safeParse(data);
  if (!validationResult.success) {
    throw new Error(`Datos inválidos: ${validationResult.error.issues.map(i => i.message).join(', ')}`);
  }

  const notificationData = validationResult.data;

  // Sanitizar datos
  const sanitizedData = {
    ...notificationData,
    title: sanitizeUserInput(notificationData.title),
    message: sanitizeUserInput(notificationData.message),
    culturalContext: notificationData.culturalContext ? sanitizeUserInput(notificationData.culturalContext) : undefined,
    language: notificationData.language ? sanitizeUserInput(notificationData.language) : undefined,
    scheduledFor: notificationData.scheduledFor ? new Date(notificationData.scheduledFor) : undefined
  };

  // Enviar notificación
  const notificationId = await notificationSystem.sendNotification(sanitizedData);

  return {
    notificationId,
    status: 'queued',
    type: notificationData.type,
    category: notificationData.category
  };
}

async function handleSendTemplateNotification(data: any, audit: any) {
  // Validar datos
  const validationResult = sendTemplateNotificationSchema.safeParse(data);
  if (!validationResult.success) {
    throw new Error(`Datos inválidos: ${validationResult.error.issues.map(i => i.message).join(', ')}`);
  }

  const { templateId, userId, variables, options } = validationResult.data;

  // Sanitizar variables
  const sanitizedVariables: Record<string, string> = {};
  Object.entries(variables).forEach(([key, value]) => {
    sanitizedVariables[key] = sanitizeUserInput(value);
  });

  // Enviar notificación con template
  const notificationId = await notificationSystem.sendTemplateNotification(
    templateId,
    userId,
    sanitizedVariables,
    options
  );

  return {
    notificationId,
    status: 'queued',
    templateId,
    userId
  };
}

async function handleSendBulkNotification(data: any, audit: any) {
  // Validar datos
  const validationResult = sendBulkNotificationSchema.safeParse(data);
  if (!validationResult.success) {
    throw new Error(`Datos inválidos: ${validationResult.error.issues.map(i => i.message).join(', ')}`);
  }

  const { templateId, users, options } = validationResult.data;

  // Sanitizar datos de usuarios
  const sanitizedUsers = users.map(user => ({
    ...user,
    variables: Object.fromEntries(
      Object.entries(user.variables).map(([key, value]) => [
        key,
        sanitizeUserInput(value)
      ])
    ),
    culturalContext: user.culturalContext ? sanitizeUserInput(user.culturalContext) : undefined,
    language: user.language ? sanitizeUserInput(user.language) : undefined
  }));

  // Enviar notificaciones masivas
  const notificationIds = await notificationSystem.sendBulkNotification(
    templateId,
    sanitizedUsers,
    options
  );

  return {
    notificationIds,
    status: 'queued',
    templateId,
    totalUsers: users.length,
    batchSize: notificationIds.length
  };
}
