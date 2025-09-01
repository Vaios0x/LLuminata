import { NotificationTemplate } from './notifications';

// Interfaz completa para las plantillas de notificaciones
interface ExtendedNotificationTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  channels: string[];
  priority: 'low' | 'normal' | 'high' | 'urgent';
  templates: {
    push?: {
      title: string;
      message: string;
      icon?: string;
      actions?: Array<{
        action: string;
        title: string;
        url?: string;
      }>;
      data?: Record<string, any>;
    };
    email?: {
      subject: string;
      body: string;
      data?: Record<string, any>;
    };
    sms?: {
      message: string;
    };
    in_app?: {
      title: string;
      message: string;
      type: 'info' | 'success' | 'warning' | 'error';
      actions?: Array<{
        action: string;
        title: string;
        url?: string;
      }>;
      data?: Record<string, any>;
    };
  };
  variables: string[];
}

// Plantillas de notificaciones predefinidas
export const notificationTemplates: Record<string, ExtendedNotificationTemplate> = {
  // ===== RECORDATORIOS =====
  lesson_reminder: {
    id: 'lesson_reminder',
    name: 'Recordatorio de Lección',
    description: 'Recordatorio para lecciones pendientes',
    category: 'reminders',
    channels: ['push', 'email', 'sms'],
    priority: 'normal',
    templates: {
      push: {
        title: '📚 {{lessonTitle}}',
        message: '{{lessonDescription}} - Tiempo estimado: {{estimatedTime}} min',
        icon: '/icons/lesson-reminder.png',
        actions: [
          {
            action: 'start_lesson',
            title: 'Comenzar Lección',
            url: '{{lessonUrl}}'
          },
          {
            action: 'snooze',
            title: 'Recordar más tarde',
            url: '/api/notifications/snooze'
          }
        ],
        data: {
          lessonId: '{{lessonId}}',
          studentId: '{{studentId}}',
          culturalContext: '{{culturalContext}}'
        }
      },
      email: {
        subject: 'Recordatorio: {{lessonTitle}}',
        body: `
          <h2>¡Hola {{studentName}}!</h2>
          <p>Tienes una lección pendiente: <strong>{{lessonTitle}}</strong></p>
          <p>{{lessonDescription}}</p>
          <p><strong>Tiempo estimado:</strong> {{estimatedTime}} minutos</p>
          <p><strong>Contexto cultural:</strong> {{culturalContext}}</p>
          <a href="{{lessonUrl}}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Comenzar Lección</a>
        `,
        data: {
          lessonId: '{{lessonId}}',
          studentId: '{{studentId}}'
        }
      },
      sms: {
        message: 'Recordatorio: {{lessonTitle}} - {{lessonDescription}}. Tiempo: {{estimatedTime}} min. {{lessonUrl}}'
      }
    },
    variables: ['lessonTitle', 'lessonDescription', 'lessonId', 'studentId', 'studentName', 'culturalContext', 'estimatedTime', 'lessonUrl']
  },

  assessment_reminder: {
    id: 'assessment_reminder',
    name: 'Recordatorio de Evaluación',
    description: 'Recordatorio para evaluaciones pendientes',
    category: 'reminders',
    channels: ['push', 'email'],
    priority: 'high',
    templates: {
      push: {
        title: '📝 {{assessmentTitle}}',
        message: '{{assessmentDescription}} - Duración: {{duration}} min',
        icon: '/icons/assessment-reminder.png',
        actions: [
          {
            action: 'start_assessment',
            title: 'Comenzar Evaluación',
            url: '{{assessmentUrl}}'
          }
        ],
        data: {
          assessmentId: '{{assessmentId}}',
          studentId: '{{studentId}}'
        }
      },
      email: {
        subject: 'Evaluación Pendiente: {{assessmentTitle}}',
        body: `
          <h2>Evaluación Pendiente</h2>
          <p><strong>{{assessmentTitle}}</strong></p>
          <p>{{assessmentDescription}}</p>
          <p><strong>Duración:</strong> {{duration}} minutos</p>
          <p><strong>Materia:</strong> {{subject}}</p>
          <a href="{{assessmentUrl}}" style="background-color: #2196F3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Comenzar Evaluación</a>
        `,
        data: {
          assessmentId: '{{assessmentId}}',
          studentId: '{{studentId}}'
        }
      }
    },
    variables: ['assessmentTitle', 'assessmentDescription', 'assessmentId', 'studentId', 'duration', 'subject', 'assessmentUrl']
  },

  // ===== ALERTAS PARA MAESTROS =====
  student_at_risk: {
    id: 'student_at_risk',
    name: 'Estudiante en Riesgo',
    description: 'Alerta cuando un estudiante está en riesgo académico',
    category: 'teacher_alerts',
    channels: ['push', 'email', 'in_app'],
    priority: 'urgent',
    templates: {
      push: {
        title: '⚠️ Alerta: {{studentName}}',
        message: '{{riskDescription}} - {{subject}} - Nivel: {{riskLevel}}',
        icon: '/icons/student-risk.png',
        actions: [
          {
            action: 'view_student',
            title: 'Ver Estudiante',
            url: '{{studentUrl}}'
          },
          {
            action: 'create_intervention',
            title: 'Crear Intervención',
            url: '{{interventionUrl}}'
          }
        ],
        data: {
          studentId: '{{studentId}}',
          teacherId: '{{teacherId}}',
          riskLevel: '{{riskLevel}}',
          subject: '{{subject}}'
        }
      },
      email: {
        subject: 'ALERTA: Estudiante en Riesgo - {{studentName}}',
        body: `
          <h2 style="color: #f44336;">⚠️ Alerta de Estudiante en Riesgo</h2>
          <p><strong>Estudiante:</strong> {{studentName}}</p>
          <p><strong>Materia:</strong> {{subject}}</p>
          <p><strong>Nivel de Riesgo:</strong> {{riskLevel}}</p>
          <p><strong>Descripción:</strong> {{riskDescription}}</p>
          <p><strong>Indicadores:</strong></p>
          <ul>
            {{#each riskIndicators}}
            <li>{{this}}</li>
            {{/each}}
          </ul>
          <p><strong>Recomendaciones:</strong></p>
          <ul>
            {{#each recommendations}}
            <li>{{this}}</li>
            {{/each}}
          </ul>
          <a href="{{studentUrl}}" style="background-color: #f44336; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Ver Detalles del Estudiante</a>
        `,
        data: {
          studentId: '{{studentId}}',
          teacherId: '{{teacherId}}'
        }
      },
      in_app: {
        title: 'Estudiante en Riesgo',
        message: '{{studentName}} necesita atención en {{subject}}',
        type: 'warning',
        actions: [
          {
            action: 'view_student',
            title: 'Ver Estudiante',
            url: '{{studentUrl}}'
          }
        ],
        data: {
          studentId: '{{studentId}}',
          riskLevel: '{{riskLevel}}'
        }
      }
    },
    variables: ['studentName', 'studentId', 'teacherId', 'subject', 'riskLevel', 'riskDescription', 'riskIndicators', 'recommendations', 'studentUrl', 'interventionUrl']
  },

  student_achievement: {
    id: 'student_achievement',
    name: 'Logro del Estudiante',
    description: 'Notificación de logros y progreso positivo',
    category: 'teacher_alerts',
    channels: ['push', 'email', 'in_app'],
    priority: 'normal',
    templates: {
      push: {
        title: '🎉 ¡Logro! {{studentName}}',
        message: '{{achievementDescription}} en {{subject}}',
        icon: '/icons/student-achievement.png',
        actions: [
          {
            action: 'view_achievement',
            title: 'Ver Logro',
            url: '{{achievementUrl}}'
          },
          {
            action: 'celebrate',
            title: 'Celebrar',
            url: '{{celebrationUrl}}'
          }
        ],
        data: {
          studentId: '{{studentId}}',
          teacherId: '{{teacherId}}',
          achievementId: '{{achievementId}}',
          subject: '{{subject}}'
        }
      },
      email: {
        subject: '¡Logro Destacado! {{studentName}} - {{achievementTitle}}',
        body: `
          <h2 style="color: #4CAF50;">🎉 ¡Felicitaciones!</h2>
          <p><strong>Estudiante:</strong> {{studentName}}</p>
          <p><strong>Logro:</strong> {{achievementTitle}}</p>
          <p><strong>Materia:</strong> {{subject}}</p>
          <p><strong>Descripción:</strong> {{achievementDescription}}</p>
          <p><strong>Puntos Ganados:</strong> {{pointsEarned}}</p>
          <p><strong>Nivel Alcanzado:</strong> {{levelReached}}</p>
          <a href="{{achievementUrl}}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Ver Detalles del Logro</a>
        `,
        data: {
          studentId: '{{studentId}}',
          teacherId: '{{teacherId}}',
          achievementId: '{{achievementId}}'
        }
      },
      in_app: {
        title: '¡Logro Destacado!',
        message: '{{studentName}} ha alcanzado {{achievementTitle}}',
        type: 'success',
        actions: [
          {
            action: 'view_achievement',
            title: 'Ver Logro',
            url: '{{achievementUrl}}'
          }
        ],
        data: {
          studentId: '{{studentId}}',
          achievementId: '{{achievementId}}'
        }
      }
    },
    variables: ['studentName', 'studentId', 'teacherId', 'achievementTitle', 'achievementDescription', 'achievementId', 'subject', 'pointsEarned', 'levelReached', 'achievementUrl', 'celebrationUrl']
  },

  // ===== COMUNICACIÓN FAMILIA-ESCUELA =====
  family_weekly_report: {
    id: 'family_weekly_report',
    name: 'Reporte Semanal Familiar',
    description: 'Reporte semanal del progreso del estudiante para la familia',
    category: 'family_communication',
    channels: ['email', 'sms'],
    priority: 'normal',
    templates: {
      email: {
        subject: 'Reporte Semanal - {{studentName}} - Semana del {{weekStart}}',
        body: `
          <h2>Reporte Semanal de {{studentName}}</h2>
          <p><strong>Período:</strong> {{weekStart}} al {{weekEnd}}</p>
          
          <h3>📊 Resumen del Progreso</h3>
          <p><strong>Lecciones Completadas:</strong> {{lessonsCompleted}}/{{totalLessons}}</p>
          <p><strong>Evaluaciones Realizadas:</strong> {{assessmentsCompleted}}/{{totalAssessments}}</p>
          <p><strong>Puntuación Promedio:</strong> {{averageScore}}%</p>
          <p><strong>Tiempo de Estudio:</strong> {{studyTime}} horas</p>
          
          <h3>🏆 Logros Destacados</h3>
          <ul>
            {{#each achievements}}
            <li>{{this}}</li>
            {{/each}}
          </ul>
          
          <h3>📚 Áreas de Mejora</h3>
          <ul>
            {{#each improvementAreas}}
            <li>{{this}}</li>
            {{/each}}
          </ul>
          
          <h3>🎯 Recomendaciones</h3>
          <ul>
            {{#each recommendations}}
            <li>{{this}}</li>
            {{/each}}
          </ul>
          
          <p><strong>Maestro:</strong> {{teacherName}}</p>
          <p><strong>Contacto:</strong> {{teacherEmail}}</p>
          
          <a href="{{detailedReportUrl}}" style="background-color: #2196F3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Ver Reporte Detallado</a>
        `,
        data: {
          studentId: '{{studentId}}',
          familyId: '{{familyId}}',
          teacherId: '{{teacherId}}'
        }
      },
      sms: {
        message: 'Reporte semanal de {{studentName}}: {{lessonsCompleted}}/{{totalLessons}} lecciones, {{averageScore}}% promedio. Ver detalles: {{detailedReportUrl}}'
      }
    },
    variables: ['studentName', 'studentId', 'familyId', 'teacherId', 'teacherName', 'teacherEmail', 'weekStart', 'weekEnd', 'lessonsCompleted', 'totalLessons', 'assessmentsCompleted', 'totalAssessments', 'averageScore', 'studyTime', 'achievements', 'improvementAreas', 'recommendations', 'detailedReportUrl']
  },

  family_emergency_alert: {
    id: 'family_emergency_alert',
    name: 'Alerta de Emergencia Familiar',
    description: 'Alerta urgente para la familia sobre el estudiante',
    category: 'family_communication',
    channels: ['push', 'email', 'sms'],
    priority: 'urgent',
    templates: {
      push: {
        title: '🚨 Alerta: {{studentName}}',
        message: '{{alertDescription}} - Contactar: {{teacherName}}',
        icon: '/icons/emergency-alert.png',
        actions: [
          {
            action: 'contact_teacher',
            title: 'Contactar Maestro',
            url: 'tel:{{teacherPhone}}'
          },
          {
            action: 'view_details',
            title: 'Ver Detalles',
            url: '{{alertDetailsUrl}}'
          }
        ],
        data: {
          studentId: '{{studentId}}',
          familyId: '{{familyId}}',
          teacherId: '{{teacherId}}',
          alertType: '{{alertType}}'
        }
      },
      email: {
        subject: '🚨 ALERTA URGENTE - {{studentName}}',
        body: `
          <h2 style="color: #f44336;">🚨 Alerta Urgente</h2>
          <p><strong>Estudiante:</strong> {{studentName}}</p>
          <p><strong>Tipo de Alerta:</strong> {{alertType}}</p>
          <p><strong>Descripción:</strong> {{alertDescription}}</p>
          <p><strong>Maestro:</strong> {{teacherName}}</p>
          <p><strong>Teléfono:</strong> {{teacherPhone}}</p>
          <p><strong>Email:</strong> {{teacherEmail}}</p>
          <p><strong>Acción Requerida:</strong> {{requiredAction}}</p>
          <a href="{{alertDetailsUrl}}" style="background-color: #f44336; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Ver Detalles Completos</a>
        `,
        data: {
          studentId: '{{studentId}}',
          familyId: '{{familyId}}',
          teacherId: '{{teacherId}}'
        }
      },
      sms: {
        message: 'ALERTA: {{studentName}} - {{alertDescription}}. Contactar: {{teacherName}} {{teacherPhone}}. {{alertDetailsUrl}}'
      }
    },
    variables: ['studentName', 'studentId', 'familyId', 'teacherId', 'teacherName', 'teacherPhone', 'teacherEmail', 'alertType', 'alertDescription', 'requiredAction', 'alertDetailsUrl']
  },

  // ===== MENSAJERÍA INTERNA =====
  internal_message: {
    id: 'internal_message',
    name: 'Mensaje Interno',
    description: 'Mensaje interno entre miembros del personal',
    category: 'internal_messaging',
    channels: ['push', 'email', 'in_app'],
    priority: 'normal',
    templates: {
      push: {
        title: '💬 {{senderName}}',
        message: '{{messagePreview}}',
        icon: '/icons/internal-message.png',
        actions: [
          {
            action: 'view_message',
            title: 'Ver Mensaje',
            url: '{{messageUrl}}'
          },
          {
            action: 'reply',
            title: 'Responder',
            url: '{{replyUrl}}'
          }
        ],
        data: {
          messageId: '{{messageId}}',
          senderId: '{{senderId}}',
          recipientId: '{{recipientId}}',
          conversationId: '{{conversationId}}'
        }
      },
      email: {
        subject: 'Mensaje de {{senderName}} - {{subject}}',
        body: `
          <h2>Mensaje de {{senderName}}</h2>
          <p><strong>Asunto:</strong> {{subject}}</p>
          <p><strong>Fecha:</strong> {{messageDate}}</p>
          <hr>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px;">
            {{messageContent}}
          </div>
          <hr>
          <p><strong>De:</strong> {{senderName}} ({{senderRole}})</p>
          <p><strong>Para:</strong> {{recipientName}} ({{recipientRole}})</p>
          <a href="{{messageUrl}}" style="background-color: #2196F3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Ver Mensaje Completo</a>
        `,
        data: {
          messageId: '{{messageId}}',
          senderId: '{{senderId}}',
          recipientId: '{{recipientId}}'
        }
      },
      in_app: {
        title: 'Nuevo Mensaje',
        message: '{{senderName}}: {{messagePreview}}',
        type: 'info',
        actions: [
          {
            action: 'view_message',
            title: 'Ver Mensaje',
            url: '{{messageUrl}}'
          }
        ],
        data: {
          messageId: '{{messageId}}',
          conversationId: '{{conversationId}}'
        }
      }
    },
    variables: ['senderName', 'senderId', 'senderRole', 'recipientName', 'recipientId', 'recipientRole', 'subject', 'messageContent', 'messagePreview', 'messageDate', 'messageId', 'conversationId', 'messageUrl', 'replyUrl']
  },

  meeting_reminder: {
    id: 'meeting_reminder',
    name: 'Recordatorio de Reunión',
    description: 'Recordatorio para reuniones del personal',
    category: 'internal_messaging',
    channels: ['push', 'email', 'sms'],
    priority: 'high',
    templates: {
      push: {
        title: '📅 Reunión: {{meetingTitle}}',
        message: '{{meetingDescription}} - {{meetingTime}}',
        icon: '/icons/meeting-reminder.png',
        actions: [
          {
            action: 'join_meeting',
            title: 'Unirse',
            url: '{{meetingUrl}}'
          },
          {
            action: 'view_details',
            title: 'Ver Detalles',
            url: '{{meetingDetailsUrl}}'
          }
        ],
        data: {
          meetingId: '{{meetingId}}',
          organizerId: '{{organizerId}}',
          participantIds: '{{participantIds}}'
        }
      },
      email: {
        subject: 'Recordatorio de Reunión: {{meetingTitle}}',
        body: `
          <h2>Recordatorio de Reunión</h2>
          <p><strong>Título:</strong> {{meetingTitle}}</p>
          <p><strong>Fecha y Hora:</strong> {{meetingTime}}</p>
          <p><strong>Duración:</strong> {{duration}} minutos</p>
          <p><strong>Organizador:</strong> {{organizerName}}</p>
          <p><strong>Descripción:</strong> {{meetingDescription}}</p>
          <p><strong>Agenda:</strong></p>
          <ul>
            {{#each agenda}}
            <li>{{this}}</li>
            {{/each}}
          </ul>
          <p><strong>Participantes:</strong> {{participants}}</p>
          <a href="{{meetingUrl}}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Unirse a la Reunión</a>
        `,
        data: {
          meetingId: '{{meetingId}}',
          organizerId: '{{organizerId}}'
        }
      },
      sms: {
        message: 'Reunión: {{meetingTitle}} - {{meetingTime}} - {{meetingUrl}}'
      }
    },
    variables: ['meetingTitle', 'meetingDescription', 'meetingTime', 'duration', 'organizerName', 'organizerId', 'agenda', 'participants', 'participantIds', 'meetingId', 'meetingUrl', 'meetingDetailsUrl']
  }
};

// ===== FUNCIONES AUXILIARES =====

/**
 * Obtiene una plantilla de notificación por ID
 */
export function getNotificationTemplate(templateId: string): ExtendedNotificationTemplate | null {
  return notificationTemplates[templateId] || null;
}

/**
 * Obtiene todas las plantillas de una categoría específica
 */
export function getTemplatesByCategory(category: string): ExtendedNotificationTemplate[] {
  return Object.values(notificationTemplates).filter(template => template.category === category);
}

/**
 * Obtiene todas las plantillas que soportan un canal específico
 */
export function getTemplatesByChannel(channel: string): ExtendedNotificationTemplate[] {
  return Object.values(notificationTemplates).filter(template => 
    template.channels.includes(channel as any)
  );
}

/**
 * Obtiene todas las plantillas disponibles
 */
export function getAllTemplates(): ExtendedNotificationTemplate[] {
  return Object.values(notificationTemplates);
}

/**
 * Valida que las variables requeridas estén presentes en los datos
 */
export function validateTemplateVariables(template: ExtendedNotificationTemplate, variables: Record<string, any>): string[] {
  const missingVariables: string[] = [];
  
  for (const requiredVar of template.variables) {
    if (!variables[requiredVar]) {
      missingVariables.push(requiredVar);
    }
  }
  
  return missingVariables;
}

/**
 * Reemplaza las variables en una plantilla
 */
export function replaceTemplateVariables(template: string, variables: Record<string, any>): string {
  let result = template;
  
  for (const [key, value] of Object.entries(variables)) {
    const placeholder = `{{${key}}}`;
    result = result.replace(new RegExp(placeholder, 'g'), String(value || ''));
  }
  
  return result;
}

/**
 * Obtiene las categorías disponibles
 */
export function getAvailableCategories(): string[] {
  const categories = new Set<string>();
  Object.values(notificationTemplates).forEach(template => {
    categories.add(template.category);
  });
  return Array.from(categories);
}

/**
 * Obtiene los canales disponibles
 */
export function getAvailableChannels(): string[] {
  const channels = new Set<string>();
  Object.values(notificationTemplates).forEach(template => {
    template.channels.forEach(channel => channels.add(channel));
  });
  return Array.from(channels);
}
