import { redisCache } from './redis-cache';
import { cdnManager } from './cdn-manager';
import { generateSecurityAudit } from './security';

// Interfaces para el sistema de notificaciones
export interface NotificationConfig {
  push: {
    enabled: boolean;
    vapidPublicKey: string;
    vapidPrivateKey: string;
    endpoint: string;
  };
  email: {
    enabled: boolean;
    provider: 'sendgrid' | 'nodemailer' | 'aws-ses';
    apiKey?: string;
    fromEmail: string;
    templates: {
      welcome: string;
      lessonReminder: string;
      assessment: string;
      achievement: string;
      support: string;
    };
  };
  sms: {
    enabled: boolean;
    provider: 'twilio' | 'aws-sns' | 'local';
    accountSid?: string;
    authToken?: string;
    fromNumber: string;
    templates: {
      reminder: string;
      emergency: string;
      achievement: string;
    };
  };
  inApp: {
    enabled: boolean;
    maxRetention: number; // días
    maxPerUser: number;
  };
}

export interface NotificationData {
  id: string;
  type: 'push' | 'email' | 'sms' | 'in-app';
  title: string;
  message: string;
  userId: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  category: 'lesson' | 'assessment' | 'achievement' | 'reminder' | 'support' | 'system';
  metadata?: Record<string, any>;
  scheduledFor?: Date;
  expiresAt?: Date;
  culturalContext?: string;
  language?: string;
  accessibility?: {
    screenReader: boolean;
    highContrast: boolean;
    largeText: boolean;
    audioDescription: boolean;
  };
}

export interface NotificationTemplate {
  id: string;
  name: string;
  type: 'push' | 'email' | 'sms' | 'in-app';
  title: string;
  message: string;
  variables: string[];
  culturalAdaptations: Record<string, {
    title: string;
    message: string;
  }>;
  accessibility: {
    screenReader: boolean;
    highContrast: boolean;
    largeText: boolean;
    audioDescription: boolean;
  };
}

export interface NotificationDelivery {
  id: string;
  notificationId: string;
  userId: string;
  type: 'push' | 'email' | 'sms' | 'in-app';
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'expired';
  sentAt?: Date;
  deliveredAt?: Date;
  error?: string;
  retryCount: number;
  maxRetries: number;
}

/**
 * Sistema principal de notificaciones
 */
export class NotificationSystem {
  private config: NotificationConfig;
  private templates: Map<string, NotificationTemplate> = new Map();
  private deliveryQueue: NotificationDelivery[] = [];
  private isInitialized: boolean = false;

  constructor(config: Partial<NotificationConfig> = {}) {
    this.config = {
      push: {
        enabled: true,
        vapidPublicKey: process.env.VAPID_PUBLIC_KEY || '',
        vapidPrivateKey: process.env.VAPID_PRIVATE_KEY || '',
        endpoint: process.env.PUSH_ENDPOINT || '/api/notifications/push',
        ...config.push
      },
      email: {
        enabled: true,
        provider: 'sendgrid',
        apiKey: process.env.SENDGRID_API_KEY,
        fromEmail: process.env.FROM_EMAIL || 'noreply@lluminata.com',
        templates: {
          welcome: 'welcome-email',
          lessonReminder: 'lesson-reminder',
          assessment: 'assessment-notification',
          achievement: 'achievement-celebration',
          support: 'support-request',
          ...config.email?.templates
        },
        ...config.email
      },
      sms: {
        enabled: true,
        provider: 'twilio',
        accountSid: process.env.TWILIO_ACCOUNT_SID,
        authToken: process.env.TWILIO_AUTH_TOKEN,
        fromNumber: process.env.TWILIO_FROM_NUMBER || '+1234567890',
        templates: {
          reminder: 'Recordatorio: {lesson} está disponible',
          emergency: 'Urgente: {message}',
          achievement: '¡Felicitaciones! {achievement}',
          ...config.sms?.templates
        },
        ...config.sms
      },
      inApp: {
        enabled: true,
        maxRetention: 30,
        maxPerUser: 100,
        ...config.inApp
      }
    };

    this.initializeTemplates();
  }

  /**
   * Inicializa el sistema de notificaciones
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    console.log('🔔 Inicializando sistema de notificaciones...');

    try {
      // Verificar configuración
      await this.validateConfiguration();
      
      // Inicializar proveedores
      await this.initializeProviders();
      
      // Cargar templates desde caché
      await this.loadTemplatesFromCache();
      
      // Iniciar procesamiento de cola
      this.startQueueProcessing();
      
      this.isInitialized = true;
      console.log('✅ Sistema de notificaciones inicializado');
    } catch (error) {
      console.error('❌ Error inicializando sistema de notificaciones:', error);
      throw error;
    }
  }

  /**
   * Valida la configuración del sistema
   */
  private async validateConfiguration(): Promise<void> {
    const errors: string[] = [];

    if (this.config.push.enabled) {
      if (!this.config.push.vapidPublicKey) {
        errors.push('VAPID_PUBLIC_KEY es requerido para push notifications');
      }
      if (!this.config.push.vapidPrivateKey) {
        errors.push('VAPID_PRIVATE_KEY es requerido para push notifications');
      }
    }

    if (this.config.email.enabled) {
      if (!this.config.email.apiKey) {
        errors.push('API key es requerida para email notifications');
      }
      if (!this.config.email.fromEmail) {
        errors.push('FROM_EMAIL es requerido para email notifications');
      }
    }

    if (this.config.sms.enabled) {
      if (!this.config.sms.accountSid || !this.config.sms.authToken) {
        errors.push('Credenciales de SMS son requeridas');
      }
    }

    if (errors.length > 0) {
      throw new Error(`Configuración inválida: ${errors.join(', ')}`);
    }
  }

  /**
   * Inicializa proveedores de notificaciones
   */
  private async initializeProviders(): Promise<void> {
    // Los proveedores se inicializan de forma lazy cuando se necesitan
    console.log('📡 Proveedores de notificaciones listos');
  }

  /**
   * Inicializa templates predefinidos
   */
  private initializeTemplates(): void {
    const defaultTemplates: NotificationTemplate[] = [
      {
        id: 'welcome',
        name: 'Bienvenida',
        type: 'email',
        title: '¡Bienvenido a LLuminata!',
        message: 'Hola {name}, te damos la bienvenida a tu viaje de aprendizaje inclusivo.',
        variables: ['name'],
        culturalAdaptations: {
          'maya': {
            title: '¡Bienvenido a LLuminata!',
            message: 'Ba\'ax ka wa\'alik {name}, bienvenido a tu camino de aprendizaje.'
          },
          'nahuatl': {
            title: '¡Bienvenido a LLuminata!',
            message: 'Niltze {name}, bienvenido a tu aprendizaje.'
          }
        },
        accessibility: {
          screenReader: true,
          highContrast: true,
          largeText: true,
          audioDescription: false
        }
      },
      {
        id: 'lesson-reminder',
        name: 'Recordatorio de lección',
        type: 'push',
        title: 'Nueva lección disponible',
        message: 'Tienes una nueva lección: {lessonTitle}',
        variables: ['lessonTitle'],
        culturalAdaptations: {
          'maya': {
            title: 'Lección nueva disponible',
            message: 'K\'a\'abet lección: {lessonTitle}'
          },
          'nahuatl': {
            title: 'Lección nueva disponible',
            message: 'Lección nueva: {lessonTitle}'
          }
        },
        accessibility: {
          screenReader: true,
          highContrast: true,
          largeText: true,
          audioDescription: false
        }
      },
      {
        id: 'achievement',
        name: 'Logro alcanzado',
        type: 'in-app',
        title: '¡Felicitaciones!',
        message: 'Has completado: {achievement}',
        variables: ['achievement'],
        culturalAdaptations: {
          'maya': {
            title: '¡Ma\'alob!',
            message: 'Has completado: {achievement}'
          },
          'nahuatl': {
            title: '¡Tlazohtla!',
            message: 'Has completado: {achievement}'
          }
        },
        accessibility: {
          screenReader: true,
          highContrast: true,
          largeText: true,
          audioDescription: true
        }
      }
    ];

    defaultTemplates.forEach(template => {
      this.templates.set(template.id, template);
    });
  }

  /**
   * Carga templates desde caché
   */
  private async loadTemplatesFromCache(): Promise<void> {
    try {
      const cachedTemplates = await redisCache.get('notification_templates');
      if (cachedTemplates) {
        const templates = JSON.parse(cachedTemplates);
        templates.forEach((template: NotificationTemplate) => {
          this.templates.set(template.id, template);
        });
      }
    } catch (error) {
      console.warn('No se pudieron cargar templates desde caché:', error);
    }
  }

  /**
   * Envía notificación
   */
  async sendNotification(data: Omit<NotificationData, 'id'>): Promise<string> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const notificationId = this.generateId();
    const notification: NotificationData = {
      ...data,
      id: notificationId
    };

    // Generar auditoría de seguridad
    const audit = generateSecurityAudit(data.userId, 'notification_sent', {
      notificationId,
      type: data.type,
      category: data.category,
      priority: data.priority
    });

    // Validar notificación
    this.validateNotification(notification);

    // Crear entrega
    const delivery: NotificationDelivery = {
      id: this.generateId(),
      notificationId,
      userId: data.userId,
      type: data.type,
      status: 'pending',
      retryCount: 0,
      maxRetries: this.getMaxRetries(data.type)
    };

    // Agregar a cola
    this.deliveryQueue.push(delivery);

    // Guardar en caché
    await this.saveNotificationToCache(notification, delivery);

    console.log(`📨 Notificación ${notificationId} agregada a cola`);
    return notificationId;
  }

  /**
   * Envía notificación usando template
   */
  async sendTemplateNotification(
    templateId: string,
    userId: string,
    variables: Record<string, string>,
    options: {
      type?: 'push' | 'email' | 'sms' | 'in-app';
      priority?: 'low' | 'normal' | 'high' | 'urgent';
      culturalContext?: string;
      language?: string;
      scheduledFor?: Date;
    } = {}
  ): Promise<string> {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template ${templateId} no encontrado`);
    }

    // Aplicar variables al template
    let title = template.title;
    let message = template.message;

    template.variables.forEach(variable => {
      const value = variables[variable];
      if (value) {
        title = title.replace(`{${variable}}`, value);
        message = message.replace(`{${variable}}`, value);
      }
    });

    // Aplicar adaptación cultural si está disponible
    if (options.culturalContext && template.culturalAdaptations[options.culturalContext]) {
      const adaptation = template.culturalAdaptations[options.culturalContext];
      title = adaptation.title;
      message = adaptation.message;
      
      // Aplicar variables nuevamente después de la adaptación cultural
      template.variables.forEach(variable => {
        const value = variables[variable];
        if (value) {
          title = title.replace(`{${variable}}`, value);
          message = message.replace(`{${variable}}`, value);
        }
      });
    }

    return this.sendNotification({
      type: options.type || template.type,
      title,
      message,
      userId,
      priority: options.priority || 'normal',
      category: this.getCategoryFromTemplate(templateId),
      culturalContext: options.culturalContext,
      language: options.language,
      scheduledFor: options.scheduledFor,
      accessibility: template.accessibility
    });
  }

  /**
   * Envía notificación masiva
   */
  async sendBulkNotification(
    templateId: string,
    users: Array<{
      userId: string;
      variables: Record<string, string>;
      culturalContext?: string;
      language?: string;
    }>,
    options: {
      type?: 'push' | 'email' | 'sms' | 'in-app';
      priority?: 'low' | 'normal' | 'high' | 'urgent';
      scheduledFor?: Date;
    } = {}
  ): Promise<string[]> {
    const notificationIds: string[] = [];

    // Procesar en lotes para evitar sobrecarga
    const batchSize = 100;
    for (let i = 0; i < users.length; i += batchSize) {
      const batch = users.slice(i, i + batchSize);
      
      const batchPromises = batch.map(user => 
        this.sendTemplateNotification(templateId, user.userId, user.variables, {
          ...options,
          culturalContext: user.culturalContext,
          language: user.language
        })
      );

      const batchResults = await Promise.all(batchPromises);
      notificationIds.push(...batchResults);

      // Pausa entre lotes para evitar rate limiting
      if (i + batchSize < users.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return notificationIds;
  }

  /**
   * Obtiene notificaciones de un usuario
   */
  async getUserNotifications(
    userId: string,
    options: {
      type?: 'push' | 'email' | 'sms' | 'in-app';
      status?: 'pending' | 'sent' | 'delivered' | 'failed' | 'expired';
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<NotificationData[]> {
    const cacheKey = `user_notifications:${userId}`;
    const notifications = await redisCache.get(cacheKey) || '[]';
    
    let userNotifications: NotificationData[] = JSON.parse(notifications);

    // Filtrar por tipo
    if (options.type) {
      userNotifications = userNotifications.filter(n => n.type === options.type);
    }

    // Filtrar por estado
    if (options.status) {
      // Obtener estados de entrega
      const deliveryStates = await this.getDeliveryStates(
        userNotifications.map(n => n.id)
      );
      userNotifications = userNotifications.filter(n => 
        deliveryStates[n.id] === options.status
      );
    }

    // Paginar
    const offset = options.offset || 0;
    const limit = options.limit || 50;
    userNotifications = userNotifications.slice(offset, offset + limit);

    return userNotifications;
  }

  /**
   * Marca notificación como leída
   */
  async markAsRead(notificationId: string, userId: string): Promise<void> {
    const cacheKey = `notification_read:${notificationId}:${userId}`;
    await redisCache.set(cacheKey, { readAt: new Date().toISOString() }, {
      ttl: 24 * 60 * 60 // 24 horas
    });
  }

  /**
   * Elimina notificación
   */
  async deleteNotification(notificationId: string, userId: string): Promise<void> {
    const cacheKey = `user_notifications:${userId}`;
    const notifications = await redisCache.get(cacheKey) || '[]';
    
    let userNotifications: NotificationData[] = JSON.parse(notifications);
    userNotifications = userNotifications.filter(n => n.id !== notificationId);
    
    await redisCache.set(cacheKey, JSON.stringify(userNotifications));
  }

  /**
   * Obtiene estadísticas de notificaciones
   */
  async getNotificationStats(userId?: string): Promise<{
    total: number;
    sent: number;
    delivered: number;
    failed: number;
    byType: Record<string, number>;
    byCategory: Record<string, number>;
  }> {
    const stats = {
      total: 0,
      sent: 0,
      delivered: 0,
      failed: 0,
      byType: {} as Record<string, number>,
      byCategory: {} as Record<string, number>
    };

    if (userId) {
      const userNotifications = await this.getUserNotifications(userId);
      const deliveryStates = await this.getDeliveryStates(
        userNotifications.map(n => n.id)
      );

      userNotifications.forEach(notification => {
        stats.total++;
        const status = deliveryStates[notification.id] || 'pending';
        
        if (status === 'sent') stats.sent++;
        else if (status === 'delivered') stats.delivered++;
        else if (status === 'failed') stats.failed++;

        stats.byType[notification.type] = (stats.byType[notification.type] || 0) + 1;
        stats.byCategory[notification.category] = (stats.byCategory[notification.category] || 0) + 1;
      });
    }

    return stats;
  }

  // ===== MÉTODOS PRIVADOS =====

  /**
   * Inicia procesamiento de cola
   */
  private startQueueProcessing(): void {
    setInterval(async () => {
      if (this.deliveryQueue.length > 0) {
        const delivery = this.deliveryQueue.shift();
        if (delivery) {
          await this.processDelivery(delivery);
        }
      }
    }, 1000); // Procesar cada segundo
  }

  /**
   * Procesa entrega de notificación
   */
  private async processDelivery(delivery: NotificationDelivery): Promise<void> {
    try {
      const notification = await this.getNotificationFromCache(delivery.notificationId);
      if (!notification) {
        delivery.status = 'failed';
        delivery.error = 'Notification not found';
        return;
      }

      // Verificar si está programada para el futuro
      if (notification.scheduledFor && new Date(notification.scheduledFor) > new Date()) {
        // Re-agregar a la cola para procesamiento posterior
        this.deliveryQueue.push(delivery);
        return;
      }

      // Verificar si ha expirado
      if (notification.expiresAt && new Date(notification.expiresAt) < new Date()) {
        delivery.status = 'expired';
        return;
      }

      // Enviar según el tipo
      switch (delivery.type) {
        case 'push':
          await this.sendPushNotification(notification, delivery);
          break;
        case 'email':
          await this.sendEmailNotification(notification, delivery);
          break;
        case 'sms':
          await this.sendSMSNotification(notification, delivery);
          break;
        case 'in-app':
          await this.sendInAppNotification(notification, delivery);
          break;
      }

    } catch (error) {
      console.error('Error procesando entrega:', error);
      delivery.status = 'failed';
      delivery.error = error instanceof Error ? error.message : 'Unknown error';
      
      // Reintentar si no se ha excedido el máximo
      if (delivery.retryCount < delivery.maxRetries) {
        delivery.retryCount++;
        delivery.status = 'pending';
        this.deliveryQueue.push(delivery);
      }
    }
  }

  /**
   * Envía notificación push
   */
  private async sendPushNotification(
    notification: NotificationData,
    delivery: NotificationDelivery
  ): Promise<void> {
    if (!this.config.push.enabled) {
      throw new Error('Push notifications no están habilitadas');
    }

    // Obtener suscripción del usuario
    const subscription = await this.getUserPushSubscription(notification.userId);
    if (!subscription) {
      throw new Error('Usuario no tiene suscripción push');
    }

    // Enviar usando Web Push API
    const webpush = await import('web-push');
    
    const payload = JSON.stringify({
      title: notification.title,
      message: notification.message,
      icon: '/icons/notification-icon.png',
      badge: '/icons/badge-icon.png',
      data: notification.metadata
    });

    await webpush.sendNotification(subscription, payload, {
      vapidDetails: {
        subject: 'mailto:' + this.config.email.fromEmail,
        publicKey: this.config.push.vapidPublicKey,
        privateKey: this.config.push.vapidPrivateKey
      }
    });

    delivery.status = 'sent';
    delivery.sentAt = new Date();
  }

  /**
   * Envía notificación por email
   */
  private async sendEmailNotification(
    notification: NotificationData,
    delivery: NotificationDelivery
  ): Promise<void> {
    if (!this.config.email.enabled) {
      throw new Error('Email notifications no están habilitadas');
    }

    // Obtener email del usuario
    const userEmail = await this.getUserEmail(notification.userId);
    if (!userEmail) {
      throw new Error('Usuario no tiene email registrado');
    }

    // Enviar según el proveedor
    switch (this.config.email.provider) {
      case 'sendgrid':
        await this.sendEmailViaSendGrid(userEmail, notification);
        break;
      case 'nodemailer':
        await this.sendEmailViaNodemailer(userEmail, notification);
        break;
      case 'aws-ses':
        await this.sendEmailViaAWSSES(userEmail, notification);
        break;
    }

    delivery.status = 'sent';
    delivery.sentAt = new Date();
  }

  /**
   * Envía notificación por SMS
   */
  private async sendSMSNotification(
    notification: NotificationData,
    delivery: NotificationDelivery
  ): Promise<void> {
    if (!this.config.sms.enabled) {
      throw new Error('SMS notifications no están habilitadas');
    }

    // Obtener teléfono del usuario
    const userPhone = await this.getUserPhone(notification.userId);
    if (!userPhone) {
      throw new Error('Usuario no tiene teléfono registrado');
    }

    // Enviar según el proveedor
    switch (this.config.sms.provider) {
      case 'twilio':
        await this.sendSMSViaTwilio(userPhone, notification);
        break;
      case 'aws-sns':
        await this.sendSMSViaAWSSNS(userPhone, notification);
        break;
      case 'local':
        await this.sendSMSViaLocal(userPhone, notification);
        break;
    }

    delivery.status = 'sent';
    delivery.sentAt = new Date();
  }

  /**
   * Envía notificación in-app
   */
  private async sendInAppNotification(
    notification: NotificationData,
    delivery: NotificationDelivery
  ): Promise<void> {
    if (!this.config.inApp.enabled) {
      throw new Error('In-app notifications no están habilitadas');
    }

    // Guardar en caché para el usuario
    const cacheKey = `user_notifications:${notification.userId}`;
    const existingNotifications = await redisCache.get(cacheKey) || '[]';
    const notifications: NotificationData[] = JSON.parse(existingNotifications);
    
    notifications.unshift(notification);
    
    // Limitar número de notificaciones por usuario
    if (notifications.length > this.config.inApp.maxPerUser) {
      notifications.splice(this.config.inApp.maxPerUser);
    }
    
    await redisCache.set(cacheKey, JSON.stringify(notifications), {
      ttl: this.config.inApp.maxRetention * 24 * 60 * 60
    });

    delivery.status = 'delivered';
    delivery.deliveredAt = new Date();
  }

  // ===== MÉTODOS DE UTILIDAD =====

  private generateId(): string {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private validateNotification(notification: NotificationData): void {
    if (!notification.title || !notification.message) {
      throw new Error('Title y message son requeridos');
    }
    if (!notification.userId) {
      throw new Error('userId es requerido');
    }
    if (!['push', 'email', 'sms', 'in-app'].includes(notification.type)) {
      throw new Error('Tipo de notificación inválido');
    }
  }

  private getMaxRetries(type: string): number {
    const retries: Record<string, number> = {
      'push': 3,
      'email': 5,
      'sms': 2,
      'in-app': 1
    };
    return retries[type] || 3;
  }

  private getCategoryFromTemplate(templateId: string): NotificationData['category'] {
    const categoryMap: Record<string, NotificationData['category']> = {
      'welcome': 'system',
      'lesson-reminder': 'lesson',
      'achievement': 'achievement',
      'assessment': 'assessment',
      'support': 'support'
    };
    return categoryMap[templateId] || 'system';
  }

  private async saveNotificationToCache(
    notification: NotificationData,
    delivery: NotificationDelivery
  ): Promise<void> {
    // Guardar notificación
    await redisCache.set(
      `notification:${notification.id}`,
      JSON.stringify(notification),
      { ttl: 7 * 24 * 60 * 60 } // 7 días
    );

    // Guardar entrega
    await redisCache.set(
      `delivery:${delivery.id}`,
      JSON.stringify(delivery),
      { ttl: 7 * 24 * 60 * 60 } // 7 días
    );

    // Agregar a lista de usuario
    const cacheKey = `user_notifications:${notification.userId}`;
    const existingNotifications = await redisCache.get(cacheKey) || '[]';
    const notifications: NotificationData[] = JSON.parse(existingNotifications);
    notifications.unshift(notification);
    
    await redisCache.set(cacheKey, JSON.stringify(notifications), {
      ttl: this.config.inApp.maxRetention * 24 * 60 * 60
    });
  }

  private async getNotificationFromCache(notificationId: string): Promise<NotificationData | null> {
    const cached = await redisCache.get(`notification:${notificationId}`);
    return cached ? JSON.parse(cached) : null;
  }

  private async getDeliveryStates(notificationIds: string[]): Promise<Record<string, string>> {
    const states: Record<string, string> = {};
    
    for (const id of notificationIds) {
      const delivery = await redisCache.get(`delivery:${id}`);
      if (delivery) {
        const deliveryData = JSON.parse(delivery);
        states[id] = deliveryData.status;
      }
    }
    
    return states;
  }

  // ===== MÉTODOS DE PROVEEDORES (implementaciones básicas) =====

  private async getUserPushSubscription(userId: string): Promise<any> {
    // Implementar obtención de suscripción push del usuario
    return await redisCache.get(`push_subscription:${userId}`);
  }

  private async getUserEmail(userId: string): Promise<string | null> {
    // Implementar obtención de email del usuario
    return await redisCache.get(`user_email:${userId}`);
  }

  private async getUserPhone(userId: string): Promise<string | null> {
    // Implementar obtención de teléfono del usuario
    return await redisCache.get(`user_phone:${userId}`);
  }

  private async sendEmailViaSendGrid(email: string, notification: NotificationData): Promise<void> {
    // Implementar envío via SendGrid
    console.log(`Enviando email a ${email}: ${notification.title}`);
  }

  private async sendEmailViaNodemailer(email: string, notification: NotificationData): Promise<void> {
    // Implementar envío via Nodemailer
    console.log(`Enviando email a ${email}: ${notification.title}`);
  }

  private async sendEmailViaAWSSES(email: string, notification: NotificationData): Promise<void> {
    // Implementar envío via AWS SES
    console.log(`Enviando email a ${email}: ${notification.title}`);
  }

  private async sendSMSViaTwilio(phone: string, notification: NotificationData): Promise<void> {
    // Implementar envío via Twilio
    console.log(`Enviando SMS a ${phone}: ${notification.message}`);
  }

  private async sendSMSViaAWSSNS(phone: string, notification: NotificationData): Promise<void> {
    // Implementar envío via AWS SNS
    console.log(`Enviando SMS a ${phone}: ${notification.message}`);
  }

  private async sendSMSViaLocal(phone: string, notification: NotificationData): Promise<void> {
    // Implementar envío local (para zonas rurales)
    console.log(`Enviando SMS local a ${phone}: ${notification.message}`);
  }
}

// Instancia singleton
export const notificationSystem = new NotificationSystem();

// Hook para React
export const useNotifications = () => {
  const sendNotification = React.useCallback(async (
    data: Omit<NotificationData, 'id'>
  ) => {
    return await notificationSystem.sendNotification(data);
  }, []);

  const sendTemplateNotification = React.useCallback(async (
    templateId: string,
    userId: string,
    variables: Record<string, string>,
    options?: any
  ) => {
    return await notificationSystem.sendTemplateNotification(templateId, userId, variables, options);
  }, []);

  const getUserNotifications = React.useCallback(async (
    userId: string,
    options?: any
  ) => {
    return await notificationSystem.getUserNotifications(userId, options);
  }, []);

  const markAsRead = React.useCallback(async (
    notificationId: string,
    userId: string
  ) => {
    await notificationSystem.markAsRead(notificationId, userId);
  }, []);

  const deleteNotification = React.useCallback(async (
    notificationId: string,
    userId: string
  ) => {
    await notificationSystem.deleteNotification(notificationId, userId);
  }, []);

  const getStats = React.useCallback(async (userId?: string) => {
    return await notificationSystem.getNotificationStats(userId);
  }, []);

  return {
    sendNotification,
    sendTemplateNotification,
    getUserNotifications,
    markAsRead,
    deleteNotification,
    getStats
  };
};

export default notificationSystem;
