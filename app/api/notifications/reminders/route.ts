import { NextRequest, NextResponse } from 'next/server';
import { notificationSystem } from '@/lib/notifications';
import { getNotificationTemplate } from '@/lib/notification-templates';
import { validationSchemas, sanitizeUserInput, validateUUID, generateSecurityAudit } from '@/lib/security';
import { z } from 'zod';

// Esquemas de validación
const createReminderSchema = z.object({
  userId: z.string().uuid('userId debe ser un UUID válido'),
  type: z.enum(['lesson', 'assessment', 'meeting', 'deadline']),
  title: z.string().min(1, 'El título es requerido').max(100, 'El título es muy largo'),
  description: z.string().min(1, 'La descripción es requerida').max(500, 'La descripción es muy larga'),
  scheduledFor: z.string().datetime('Fecha programada debe ser válida'),
  reminderTimes: z.array(z.number()).min(1, 'Al menos un recordatorio es requerido'), // minutos antes
  channels: z.array(z.enum(['push', 'email', 'sms'])).min(1, 'Al menos un canal es requerido'),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
  metadata: z.record(z.any()).optional(),
  culturalContext: z.string().optional(),
  language: z.string().optional()
});

const updateReminderSchema = z.object({
  reminderId: z.string().uuid('reminderId debe ser un UUID válido'),
  title: z.string().min(1).max(100).optional(),
  description: z.string().min(1).max(500).optional(),
  scheduledFor: z.string().datetime().optional(),
  reminderTimes: z.array(z.number()).optional(),
  channels: z.array(z.enum(['push', 'email', 'sms'])).optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).optional(),
  isActive: z.boolean().optional(),
  metadata: z.record(z.any()).optional()
});

const bulkReminderSchema = z.object({
  userIds: z.array(z.string().uuid()).min(1, 'Al menos un usuario es requerido'),
  type: z.enum(['lesson', 'assessment', 'meeting', 'deadline']),
  title: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  scheduledFor: z.string().datetime(),
  reminderTimes: z.array(z.number()).min(1),
  channels: z.array(z.enum(['push', 'email', 'sms'])).min(1),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
  metadata: z.record(z.any()).optional(),
  culturalContext: z.string().optional(),
  language: z.string().optional()
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
    const audit = generateSecurityAudit('reminders', 'reminder_action', {
      ipAddress: clientIP,
      userAgent: request.headers.get('user-agent'),
      timestamp: new Date().toISOString(),
      action: action || 'create_reminder'
    });

    let result;

    switch (action) {
      case 'create_reminder':
        result = await handleCreateReminder(data, audit);
        break;
      case 'create_bulk_reminders':
        result = await handleCreateBulkReminders(data, audit);
        break;
      case 'update_reminder':
        result = await handleUpdateReminder(data, audit);
        break;
      case 'delete_reminder':
        result = await handleDeleteReminder(data, audit);
        break;
      case 'get_user_reminders':
        result = await handleGetUserReminders(data, audit);
        break;
      case 'process_due_reminders':
        result = await handleProcessDueReminders(audit);
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
    console.error('Error en API de recordatorios:', error);
    
    // Log de error de seguridad
    console.error('[SECURITY ERROR]', {
      error: error instanceof Error ? error.message : 'Error desconocido',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
      endpoint: '/api/notifications/reminders',
    });
    
    return NextResponse.json(
      { error: 'Error procesando recordatorio' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId es requerido' },
        { status: 400 }
      );
    }

    // Validar UUID
    if (!validateUUID(userId)) {
      return NextResponse.json(
        { error: 'userId debe ser un UUID válido' },
        { status: 400 }
      );
    }

    // Generar auditoría
    const audit = generateSecurityAudit('reminders', 'get_reminders', {
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent'),
      timestamp: new Date().toISOString(),
      userId,
      type,
      status
    });

    // Simular obtención de recordatorios
    const mockReminders = [
      {
        id: 'reminder-1',
        userId,
        type: 'lesson',
        title: 'Lección de Matemáticas Maya',
        description: 'Tienes una lección pendiente sobre números mayas',
        scheduledFor: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        reminderTimes: [15, 30, 60], // minutos antes
        channels: ['push', 'email'],
        priority: 'normal',
        status: 'active',
        sentReminders: [],
        metadata: {
          lessonId: 'lesson-maya-001',
          subject: 'mathematics',
          culturalContext: 'maya'
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'reminder-2',
        userId,
        type: 'assessment',
        title: 'Evaluación de Comprensión Lectora',
        description: 'Evaluación sobre textos en náhuatl',
        scheduledFor: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        reminderTimes: [30, 60, 120],
        channels: ['push', 'email', 'sms'],
        priority: 'high',
        status: 'active',
        sentReminders: [],
        metadata: {
          assessmentId: 'assessment-nahuatl-001',
          subject: 'language',
          culturalContext: 'náhuatl'
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    // Filtrar recordatorios
    let filteredReminders = mockReminders;
    
    if (type) {
      filteredReminders = filteredReminders.filter(r => r.type === type);
    }
    
    if (status) {
      filteredReminders = filteredReminders.filter(r => r.status === status);
    }

    // Paginar
    const paginatedReminders = filteredReminders.slice(offset, offset + limit);

    return NextResponse.json({
      success: true,
      data: {
        reminders: paginatedReminders,
        total: filteredReminders.length,
        limit,
        offset
      },
      auditId: audit.id
    });

  } catch (error) {
    console.error('Error obteniendo recordatorios:', error);
    return NextResponse.json(
      { error: 'Error obteniendo recordatorios' },
      { status: 500 }
    );
  }
}

// ===== FUNCIONES MANEJADORAS =====

async function handleCreateReminder(data: any, audit: any) {
  // Validar datos
  const validationResult = createReminderSchema.safeParse(data);
  if (!validationResult.success) {
    throw new Error(`Datos inválidos: ${validationResult.error.issues.map(i => i.message).join(', ')}`);
  }

  const reminderData = validationResult.data;

  // Crear recordatorio
  const reminder = {
    id: `reminder-${Date.now()}`,
    ...reminderData,
    status: 'active',
    sentReminders: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // Programar recordatorios
  const scheduledReminders = await scheduleReminders(reminder);

  return {
    reminder,
    scheduledReminders,
    message: 'Recordatorio creado exitosamente'
  };
}

async function handleCreateBulkReminders(data: any, audit: any) {
  // Validar datos
  const validationResult = bulkReminderSchema.safeParse(data);
  if (!validationResult.success) {
    throw new Error(`Datos inválidos: ${validationResult.error.issues.map(i => i.message).join(', ')}`);
  }

  const bulkData = validationResult.data;

  // Crear recordatorios para cada usuario
  const results = [];
  for (const userId of bulkData.userIds) {
    const reminder = {
      id: `reminder-${Date.now()}-${Math.random()}`,
      userId,
      type: bulkData.type,
      title: bulkData.title,
      description: bulkData.description,
      scheduledFor: bulkData.scheduledFor,
      reminderTimes: bulkData.reminderTimes,
      channels: bulkData.channels,
      priority: bulkData.priority,
      metadata: bulkData.metadata,
      culturalContext: bulkData.culturalContext,
      language: bulkData.language,
      status: 'active',
      sentReminders: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const scheduledReminders = await scheduleReminders(reminder);
    results.push({ reminder, scheduledReminders });
  }

  return {
    results,
    totalCreated: results.length,
    message: `${results.length} recordatorios creados exitosamente`
  };
}

async function handleUpdateReminder(data: any, audit: any) {
  // Validar datos
  const validationResult = updateReminderSchema.safeParse(data);
  if (!validationResult.success) {
    throw new Error(`Datos inválidos: ${validationResult.error.issues.map(i => i.message).join(', ')}`);
  }

  const updateData = validationResult.data;

  // Simular actualización
  const updatedReminder = {
    id: updateData.reminderId,
    ...updateData,
    updatedAt: new Date().toISOString()
  };

  // Si se actualizó la fecha programada, reprogramar recordatorios
  if (updateData.scheduledFor) {
    await scheduleReminders(updatedReminder);
  }

  return {
    reminder: updatedReminder,
    message: 'Recordatorio actualizado exitosamente'
  };
}

async function handleDeleteReminder(data: any, audit: any) {
  const { reminderId } = data;

  if (!reminderId) {
    throw new Error('reminderId es requerido');
  }

  // Simular eliminación
  // En un sistema real, aquí se cancelarían los recordatorios programados

  return {
    reminderId,
    message: 'Recordatorio eliminado exitosamente'
  };
}

async function handleGetUserReminders(data: any, audit: any) {
  const { userId, type, status, limit = 10, offset = 0 } = data;

  if (!userId) {
    throw new Error('userId es requerido');
  }

  // Simular obtención de recordatorios del usuario
  const mockReminders = [
    {
      id: 'reminder-1',
      userId,
      type: 'lesson',
      title: 'Lección de Matemáticas Maya',
      description: 'Tienes una lección pendiente sobre números mayas',
      scheduledFor: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      status: 'active'
    }
  ];

  return {
    reminders: mockReminders,
    total: mockReminders.length,
    limit,
    offset
  };
}

async function handleProcessDueReminders(audit: any) {
  // Simular procesamiento de recordatorios vencidos
  const dueReminders = [
    {
      id: 'reminder-1',
      userId: 'user-123',
      type: 'lesson',
      title: 'Lección de Matemáticas Maya',
      description: 'Tienes una lección pendiente sobre números mayas',
      scheduledFor: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      channels: ['push', 'email'],
      priority: 'normal',
      metadata: {
        lessonId: 'lesson-maya-001',
        culturalContext: 'maya'
      }
    }
  ];

  const processedReminders = [];

  for (const reminder of dueReminders) {
    try {
      // Enviar notificaciones según los canales configurados
      for (const channel of reminder.channels) {
        const template = getNotificationTemplate('lesson_reminder');
        if (template) {
          const notification = await notificationSystem.sendTemplateNotification(
            template.id,
            reminder.userId,
            {
              lessonTitle: reminder.title,
              lessonDescription: reminder.description,
              lessonId: reminder.metadata?.lessonId,
              studentId: reminder.userId,
              culturalContext: reminder.metadata?.culturalContext || 'general',
              estimatedTime: '15',
              lessonUrl: `/lessons/${reminder.metadata?.lessonId}`
            },
            {
              type: channel,
              priority: reminder.priority,
              culturalContext: reminder.metadata?.culturalContext,
              language: reminder.metadata?.language
            }
          );

          processedReminders.push({
            reminderId: reminder.id,
            channel,
            notificationId: notification.id,
            status: 'sent'
          });
        }
      }
    } catch (error) {
      console.error(`Error procesando recordatorio ${reminder.id}:`, error);
      processedReminders.push({
        reminderId: reminder.id,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  return {
    processedReminders,
    totalProcessed: processedReminders.length,
    message: `${processedReminders.length} recordatorios procesados`
  };
}

// ===== FUNCIONES AUXILIARES =====

async function scheduleReminders(reminder: any) {
  const scheduledReminders = [];

  for (const minutesBefore of reminder.reminderTimes) {
    const scheduledTime = new Date(reminder.scheduledFor);
    scheduledTime.setMinutes(scheduledTime.getMinutes() - minutesBefore);

    // Solo programar si la fecha es futura
    if (scheduledTime > new Date()) {
      const scheduledReminder = {
        id: `scheduled-${reminder.id}-${minutesBefore}`,
        reminderId: reminder.id,
        userId: reminder.userId,
        scheduledFor: scheduledTime.toISOString(),
        minutesBefore,
        channels: reminder.channels,
        status: 'pending'
      };

      scheduledReminders.push(scheduledReminder);

      // En un sistema real, aquí se programaría un job/cron
      console.log(`Recordatorio programado para: ${scheduledTime.toISOString()}`);
    }
  }

  return scheduledReminders;
}
