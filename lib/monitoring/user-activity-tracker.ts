import { PrismaClient } from '@prisma/client';
import { AuthenticatedUser } from '../middleware/auth-middleware';

const prisma = new PrismaClient();

export interface UserActivity {
  userId: string;
  action: string;
  page: string;
  timestamp: Date;
  metadata?: Record<string, any>;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface LearningSession {
  userId: string;
  startTime: Date;
  endTime?: Date;
  duration?: number; // en minutos
  lessonsCompleted: number;
  totalScore: number;
  averageAccuracy: number;
  breaksTaken: number;
  deviceType: string;
  offlineMode: boolean;
}

export class UserActivityTracker {
  private static instance: UserActivityTracker;

  private constructor() {}

  static getInstance(): UserActivityTracker {
    if (!UserActivityTracker.instance) {
      UserActivityTracker.instance = new UserActivityTracker();
    }
    return UserActivityTracker.instance;
  }

  /**
   * Registrar actividad del usuario
   */
  async trackActivity(activity: UserActivity): Promise<void> {
    try {
      // En un entorno real, esto se guardaría en la base de datos
      // Por ahora, solo log para desarrollo
      console.log('[USER ACTIVITY]', {
        userId: activity.userId,
        action: activity.action,
        page: activity.page,
        timestamp: activity.timestamp.toISOString(),
        metadata: activity.metadata
      });

      // Aquí se guardaría en la base de datos
      // await prisma.userActivity.create({
      //   data: {
      //     userId: activity.userId,
      //     action: activity.action,
      //     page: activity.page,
      //     timestamp: activity.timestamp,
      //     metadata: activity.metadata,
      //     sessionId: activity.sessionId,
      //     ipAddress: activity.ipAddress,
      //     userAgent: activity.userAgent
      //   }
      // });

    } catch (error) {
      console.error('Error tracking user activity:', error);
    }
  }

  /**
   * Registrar inicio de sesión de aprendizaje
   */
  async startLearningSession(user: AuthenticatedUser, metadata?: Record<string, any>): Promise<string> {
    try {
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const session: LearningSession = {
        userId: user.id,
        startTime: new Date(),
        lessonsCompleted: 0,
        totalScore: 0,
        averageAccuracy: 0,
        breaksTaken: 0,
        deviceType: metadata?.deviceType || 'desktop',
        offlineMode: metadata?.offlineMode || false
      };

      console.log('[LEARNING SESSION START]', {
        sessionId,
        userId: user.id,
        userName: user.name,
        startTime: session.startTime.toISOString(),
        metadata
      });

      // Aquí se guardaría en la base de datos
      // await prisma.learningSession.create({
      //   data: {
      //     id: sessionId,
      //     userId: user.id,
      //     startTime: session.startTime,
      //     deviceType: session.deviceType,
      //     offlineMode: session.offlineMode,
      //     metadata: metadata || {}
      //   }
      // });

      return sessionId;

    } catch (error) {
      console.error('Error starting learning session:', error);
      throw error;
    }
  }

  /**
   * Finalizar sesión de aprendizaje
   */
  async endLearningSession(sessionId: string, finalStats: {
    lessonsCompleted: number;
    totalScore: number;
    averageAccuracy: number;
    breaksTaken: number;
  }): Promise<void> {
    try {
      const endTime = new Date();
      
      console.log('[LEARNING SESSION END]', {
        sessionId,
        endTime: endTime.toISOString(),
        finalStats
      });

      // Aquí se actualizaría en la base de datos
      // await prisma.learningSession.update({
      //   where: { id: sessionId },
      //   data: {
      //     endTime,
      //     duration: Math.floor((endTime.getTime() - startTime.getTime()) / 60000), // minutos
      //     lessonsCompleted: finalStats.lessonsCompleted,
      //     totalScore: finalStats.totalScore,
      //     averageAccuracy: finalStats.averageAccuracy,
      //     breaksTaken: finalStats.breaksTaken
      //   }
      // });

    } catch (error) {
      console.error('Error ending learning session:', error);
    }
  }

  /**
   * Registrar progreso en lección
   */
  async trackLessonProgress(user: AuthenticatedUser, lessonId: string, progress: {
    score: number;
    accuracy: number;
    timeSpent: number;
    completed: boolean;
    errors?: string[];
  }): Promise<void> {
    try {
      console.log('[LESSON PROGRESS]', {
        userId: user.id,
        lessonId,
        progress
      });

      // Aquí se guardaría en la base de datos
      // await prisma.lessonProgress.create({
      //   data: {
      //     userId: user.id,
      //     lessonId,
      //     score: progress.score,
      //     accuracy: progress.accuracy,
      //     timeSpent: progress.timeSpent,
      //     completed: progress.completed,
      //     errors: progress.errors,
      //     timestamp: new Date()
      //   }
      // });

    } catch (error) {
      console.error('Error tracking lesson progress:', error);
    }
  }

  /**
   * Registrar uso de características de accesibilidad
   */
  async trackAccessibilityUsage(user: AuthenticatedUser, feature: string, metadata?: Record<string, any>): Promise<void> {
    try {
      console.log('[ACCESSIBILITY USAGE]', {
        userId: user.id,
        feature,
        userAccessibilityPreferences: user.accessibilityPreferences,
        metadata
      });

      // Aquí se guardaría en la base de datos
      // await prisma.accessibilityUsage.create({
      //   data: {
      //     userId: user.id,
      //     feature,
      //     metadata: metadata || {},
      //     timestamp: new Date()
      //   }
      // });

    } catch (error) {
      console.error('Error tracking accessibility usage:', error);
    }
  }

  /**
   * Registrar uso de chatbot
   */
  async trackChatbotUsage(user: AuthenticatedUser, interaction: {
    message: string;
    response: string;
    intent: string;
    confidence: number;
    culturalAdaptation: boolean;
  }): Promise<void> {
    try {
      console.log('[CHATBOT USAGE]', {
        userId: user.id,
        userLanguage: user.language,
        userCulturalBackground: user.culturalBackground,
        interaction
      });

      // Aquí se guardaría en la base de datos
      // await prisma.chatbotInteraction.create({
      //   data: {
      //     userId: user.id,
      //     message: interaction.message,
      //     response: interaction.response,
      //     intent: interaction.intent,
      //     confidence: interaction.confidence,
      //     culturalAdaptation: interaction.culturalAdaptation,
      //     timestamp: new Date()
      //   }
      // });

    } catch (error) {
      console.error('Error tracking chatbot usage:', error);
    }
  }

  /**
   * Obtener estadísticas del usuario
   */
  async getUserStats(userId: string): Promise<{
    totalSessions: number;
    totalTimeSpent: number;
    lessonsCompleted: number;
    averageScore: number;
    favoriteFeatures: string[];
    accessibilityUsage: Record<string, number>;
  }> {
    try {
      // En un entorno real, esto consultaría la base de datos
      // Por ahora, retornamos datos simulados
      return {
        totalSessions: 15,
        totalTimeSpent: 1200, // minutos
        lessonsCompleted: 45,
        averageScore: 87.5,
        favoriteFeatures: ['chatbot', 'voice-recognition', 'offline-mode'],
        accessibilityUsage: {
          'high-contrast': 12,
          'screen-reader': 8,
          'font-size': 15,
          'voice-commands': 20
        }
      };

    } catch (error) {
      console.error('Error getting user stats:', error);
      throw error;
    }
  }

  /**
   * Obtener recomendaciones personalizadas basadas en la actividad
   */
  async getPersonalizedRecommendations(user: AuthenticatedUser): Promise<{
    lessons: string[];
    features: string[];
    accessibility: string[];
    cultural: string[];
  }> {
    try {
      const stats = await this.getUserStats(user.id);
      
      // Generar recomendaciones basadas en la actividad y preferencias
      const recommendations = {
        lessons: ['Matemáticas Avanzadas', 'Literatura Maya', 'Ciencias Naturales'],
        features: ['Modo Offline', 'Reconocimiento de Voz', 'Evaluaciones Adaptativas'],
        accessibility: user.accessibilityPreferences || [],
        cultural: user.culturalBackground ? [`Contenido ${user.culturalBackground}`] : []
      };

      console.log('[PERSONALIZED RECOMMENDATIONS]', {
        userId: user.id,
        recommendations
      });

      return recommendations;

    } catch (error) {
      console.error('Error getting personalized recommendations:', error);
      throw error;
    }
  }
}

// Instancia singleton
export const userActivityTracker = UserActivityTracker.getInstance();
