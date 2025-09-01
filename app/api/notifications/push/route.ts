import { NextRequest, NextResponse } from 'next/server';
import { redisCache } from '@/lib/redis-cache';
import { generateSecurityAudit } from '@/lib/security';
import { z } from 'zod';

// Esquemas de validación
const subscriptionSchema = z.object({
  userId: z.string().uuid('userId debe ser un UUID válido'),
  subscription: z.object({
    endpoint: z.string().url('endpoint debe ser una URL válida'),
    keys: z.object({
      p256dh: z.string().min(1, 'p256dh es requerido'),
      auth: z.string().min(1, 'auth es requerido')
    })
  }),
  userAgent: z.string().optional(),
  culturalContext: z.string().optional(),
  language: z.string().optional()
});

const pushNotificationSchema = z.object({
  userId: z.string().uuid('userId debe ser un UUID válido'),
  title: z.string().min(1, 'El título es requerido').max(100, 'El título es muy largo'),
  message: z.string().min(1, 'El mensaje es requerido').max(500, 'El mensaje es muy largo'),
  icon: z.string().url().optional(),
  badge: z.string().url().optional(),
  data: z.record(z.any(), z.any()).optional(),
  actions: z.array(z.object({
    action: z.string(),
    title: z.string(),
    icon: z.string().url().optional()
  })).optional(),
  tag: z.string().optional(),
  requireInteraction: z.boolean().default(false),
  silent: z.boolean().default(false),
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
    const audit = generateSecurityAudit('push_notifications', 'push_notification_action', {
      ipAddress: clientIP,
      userAgent: request.headers.get('user-agent'),
      timestamp: new Date().toISOString(),
      action: action || 'subscribe'
    });

    let result;

    switch (action) {
      case 'subscribe':
        result = await handleSubscribe(data, audit);
        break;
      case 'unsubscribe':
        result = await handleUnsubscribe(data, audit);
        break;
      case 'send':
        result = await handleSendPushNotification(data, audit);
        break;
      case 'send_bulk':
        result = await handleSendBulkPushNotification(data, audit);
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
    console.error('Error en API de push notifications:', error);
    
    // Log de error de seguridad
    console.error('[SECURITY ERROR]', {
      error: error instanceof Error ? error.message : 'Error desconocido',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
      endpoint: '/api/notifications/push',
    });
    
    return NextResponse.json(
      { error: 'Error procesando push notification' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId es requerido' },
        { status: 400 }
      );
    }

    // Obtener suscripción del usuario
    const subscription = await redisCache.get(`push_subscription:${userId}`);
    
    if (!subscription) {
      return NextResponse.json({
        success: true,
        data: {
          subscribed: false,
          subscription: null
        }
      });
    }

    const subscriptionData = typeof subscription === 'string' ? JSON.parse(subscription) : subscription;

    return NextResponse.json({
      success: true,
      data: {
        subscribed: true,
        subscription: subscriptionData
      }
    });

  } catch (error) {
    console.error('Error obteniendo suscripción push:', error);
    return NextResponse.json(
      { error: 'Error obteniendo suscripción push' },
      { status: 500 }
    );
  }
}

// ===== FUNCIONES AUXILIARES =====

async function handleSubscribe(data: any, audit: any) {
  // Validar datos
  const validationResult = subscriptionSchema.safeParse(data);
  if (!validationResult.success) {
    throw new Error(`Datos inválidos: ${validationResult.error.issues.map(i => i.message).join(', ')}`);
  }

  const { userId, subscription, userAgent, culturalContext, language } = validationResult.data;

  // Guardar suscripción en caché
  const subscriptionData = {
    ...subscription,
    userId,
    userAgent: userAgent || 'unknown',
    culturalContext: culturalContext || 'general',
    language: language || 'es-MX',
    createdAt: new Date().toISOString(),
    lastUsed: new Date().toISOString()
  };

  await redisCache.set(
    `push_subscription:${userId}`,
    JSON.stringify(subscriptionData),
    { ttl: 365 * 24 * 60 * 60 } // 1 año
  );

  // Enviar notificación de bienvenida
  try {
    await sendWelcomePushNotification(userId, culturalContext, language);
  } catch (error) {
    console.warn('No se pudo enviar notificación de bienvenida:', error);
  }

  return {
    subscribed: true,
    userId,
    endpoint: subscription.endpoint
  };
}

async function handleUnsubscribe(data: any, audit: any) {
  const { userId } = data;

  if (!userId) {
    throw new Error('userId es requerido');
  }

  // Eliminar suscripción
  await redisCache.delete(`push_subscription:${userId}`);

  return {
    unsubscribed: true,
    userId
  };
}

async function handleSendPushNotification(data: any, audit: any) {
  // Validar datos
  const validationResult = pushNotificationSchema.safeParse(data);
  if (!validationResult.success) {
    throw new Error(`Datos inválidos: ${validationResult.error.issues.map(i => i.message).join(', ')}`);
  }

  const notificationData = validationResult.data;

  // Obtener suscripción del usuario
  const subscription = await redisCache.get(`push_subscription:${notificationData.userId}`);
  if (!subscription) {
    throw new Error('Usuario no tiene suscripción push activa');
  }

  const subscriptionData = typeof subscription === 'string' ? JSON.parse(subscription) : subscription;

  // Enviar notificación push
  const webpush = await import('web-push');
  
  const payload = JSON.stringify({
    title: notificationData.title,
    message: notificationData.message,
    icon: notificationData.icon || '/icons/notification-icon.png',
    badge: notificationData.badge || '/icons/badge-icon.png',
    data: notificationData.data || {},
    actions: notificationData.actions || [],
    tag: notificationData.tag,
    requireInteraction: notificationData.requireInteraction,
    silent: notificationData.silent,
    culturalContext: notificationData.culturalContext,
    language: notificationData.language
  });

  const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
  const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
  const fromEmail = process.env.FROM_EMAIL || 'noreply@lluminata.com';

  if (!vapidPublicKey || !vapidPrivateKey) {
    throw new Error('VAPID keys no configuradas');
  }

  await webpush.sendNotification(subscriptionData, payload, {
    vapidDetails: {
      subject: `mailto:${fromEmail}`,
      publicKey: vapidPublicKey,
      privateKey: vapidPrivateKey
    }
  });

  // Actualizar último uso
  subscriptionData.lastUsed = new Date().toISOString();
  await redisCache.set(
    `push_subscription:${notificationData.userId}`,
    JSON.stringify(subscriptionData),
    { ttl: 365 * 24 * 60 * 60 }
  );

  return {
    sent: true,
    userId: notificationData.userId,
    title: notificationData.title
  };
}

async function handleSendBulkPushNotification(data: any, audit: any) {
  const { userIds, notification } = data;

  if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
    throw new Error('userIds debe ser un array no vacío');
  }

  if (!notification) {
    throw new Error('notification es requerido');
  }

  const results = {
    sent: 0,
    failed: 0,
    errors: [] as string[]
  };

  // Procesar en lotes para evitar sobrecarga
  const batchSize = 50;
  for (let i = 0; i < userIds.length; i += batchSize) {
    const batch = userIds.slice(i, i + batchSize);
    
    const batchPromises = batch.map(async (userId: string) => {
      try {
        await handleSendPushNotification({
          ...notification,
          userId
        }, audit);
        results.sent++;
      } catch (error) {
        results.failed++;
        results.errors.push(`Usuario ${userId}: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      }
    });

    await Promise.all(batchPromises);

    // Pausa entre lotes para evitar rate limiting
    if (i + batchSize < userIds.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  return results;
}

async function sendWelcomePushNotification(userId: string, culturalContext?: string, language?: string) {
  const title = culturalContext === 'maya' ? '¡Bienvenido!' : 
                culturalContext === 'nahuatl' ? '¡Niltze!' : 
                '¡Bienvenido!';
  
  const message = culturalContext === 'maya' ? 'Ba\'ax ka wa\'alik, ya puedes recibir notificaciones' :
                  culturalContext === 'nahuatl' ? 'Niltze, ya puedes recibir notificaciones' :
                  'Ya puedes recibir notificaciones de LLuminata';

  await handleSendPushNotification({
    userId,
    title,
    message,
    icon: '/icons/welcome-icon.png',
    tag: 'welcome',
    requireInteraction: false,
    culturalContext,
    language
  }, { id: 'welcome_notification', type: 'welcome_notification' });
}
