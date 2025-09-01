/**
 * Servicio de Gamificación para InclusiveAI Coach
 * Maneja badges, logros, puntos, niveles, competencias y recompensas
 */

import { PrismaClient } from '@prisma/client';
import { redisCache } from './redis-cache';

const prisma = new PrismaClient();

// Interfaces
interface BadgeCriteria {
  type: string;
  value: number;
  condition: 'equals' | 'greater_than' | 'less_than' | 'contains' | 'starts_with';
  description: string;
}

interface AchievementCriteria {
  type: string;
  value: number;
  condition: 'equals' | 'greater_than' | 'less_than' | 'contains' | 'starts_with';
  description: string;
}

interface LevelConfig {
  level: number;
  experienceRequired: number;
  title: string;
  rewards: string[];
}

interface CompetitionRewards {
  firstPlace: RewardConfig;
  secondPlace: RewardConfig;
  thirdPlace: RewardConfig;
  participation: RewardConfig;
}

interface RewardConfig {
  type: 'points' | 'badge' | 'achievement' | 'title' | 'feature_unlock';
  value: number | string;
  description: string;
}

interface GamificationEvent {
  userId: string;
  type: string;
  points: number;
  metadata?: any;
}

/**
 * Clase principal del servicio de gamificación
 */
export class GamificationService {
  private readonly levelConfigs: LevelConfig[] = [
    { level: 1, experienceRequired: 0, title: "Estudiante", rewards: [] },
    { level: 2, experienceRequired: 100, title: "Aprendiz", rewards: ["badge_beginner"] },
    { level: 3, experienceRequired: 250, title: "Estudiante Avanzado", rewards: ["badge_consistent"] },
    { level: 4, experienceRequired: 500, title: "Estudiante Dedicado", rewards: ["badge_dedicated"] },
    { level: 5, experienceRequired: 1000, title: "Estudiante Experto", rewards: ["badge_expert"] },
    { level: 6, experienceRequired: 2000, title: "Maestro Aprendiz", rewards: ["badge_master"] },
    { level: 7, experienceRequired: 3500, title: "Maestro", rewards: ["badge_grandmaster"] },
    { level: 8, experienceRequired: 5000, title: "Gran Maestro", rewards: ["badge_legendary"] },
    { level: 9, experienceRequired: 7500, title: "Leyenda", rewards: ["badge_mythical"] },
    { level: 10, experienceRequired: 10000, title: "Inmortal", rewards: ["badge_immortal"] }
  ];

  constructor() {
    this.initializeDefaultBadges();
    this.initializeDefaultAchievements();
  }

  /**
   * Inicializa badges por defecto
   */
  private async initializeDefaultBadges(): Promise<void> {
    const defaultBadges = [
      {
        name: "Primer Paso",
        description: "Completó su primera lección",
        icon: "/badges/first-step.svg",
        category: "MILESTONE" as const,
        rarity: "COMMON" as const,
        points: 10,
        criteria: {
          type: "lessons_completed",
          value: 1,
          condition: "greater_than",
          description: "Completar 1 lección"
        }
      },
      {
        name: "Estudiante Consistente",
        description: "Completó 10 lecciones",
        icon: "/badges/consistent.svg",
        category: "LEARNING" as const,
        rarity: "UNCOMMON" as const,
        points: 50,
        criteria: {
          type: "lessons_completed",
          value: 10,
          condition: "greater_than",
          description: "Completar 10 lecciones"
        }
      },
      {
        name: "Explorador Cultural",
        description: "Participó en 5 actividades culturales",
        icon: "/badges/cultural-explorer.svg",
        category: "CULTURAL" as const,
        rarity: "RARE" as const,
        points: 100,
        criteria: {
          type: "cultural_activities",
          value: 5,
          condition: "greater_than",
          description: "Participar en 5 actividades culturales"
        }
      },
      {
        name: "Ayudante",
        description: "Ayudó a otros estudiantes 10 veces",
        icon: "/badges/helper.svg",
        category: "SOCIAL" as const,
        rarity: "UNCOMMON" as const,
        points: 75,
        criteria: {
          type: "help_others",
          value: 10,
          condition: "greater_than",
          description: "Ayudar a otros 10 veces"
        }
      },
      {
        name: "Perfeccionista",
        description: "Obtuvo 100% en 5 evaluaciones",
        icon: "/badges/perfectionist.svg",
        category: "ACADEMIC" as const,
        rarity: "EPIC" as const,
        points: 200,
        criteria: {
          type: "perfect_scores",
          value: 5,
          condition: "greater_than",
          description: "Obtener 100% en 5 evaluaciones"
        }
      }
    ];

    for (const badge of defaultBadges) {
      await this.createBadgeIfNotExists(badge);
    }
  }

  /**
   * Inicializa logros por defecto
   */
  private async initializeDefaultAchievements(): Promise<void> {
    const defaultAchievements = [
      {
        name: "Racha de 7 días",
        description: "Estudió durante 7 días consecutivos",
        icon: "/achievements/streak-7.svg",
        category: "PERSISTENCE" as const,
        points: 150,
        criteria: {
          type: "study_streak",
          value: 7,
          condition: "greater_than",
          description: "Estudiar 7 días consecutivos"
        }
      },
      {
        name: "Políglota",
        description: "Aprendió en 3 idiomas diferentes",
        icon: "/achievements/polyglot.svg",
        category: "ACADEMIC" as const,
        points: 300,
        criteria: {
          type: "languages_learned",
          value: 3,
          condition: "greater_than",
          description: "Aprender en 3 idiomas"
        }
      },
      {
        name: "Mentor",
        description: "Ayudó a 20 estudiantes diferentes",
        icon: "/achievements/mentor.svg",
        category: "SOCIAL" as const,
        points: 400,
        criteria: {
          type: "students_helped",
          value: 20,
          condition: "greater_than",
          description: "Ayudar a 20 estudiantes"
        }
      }
    ];

    for (const achievement of defaultAchievements) {
      await this.createAchievementIfNotExists(achievement);
    }
  }

  /**
   * Crea un badge si no existe
   */
  private async createBadgeIfNotExists(badgeData: any): Promise<void> {
    const existing = await prisma.badge.findFirst({
      where: { name: badgeData.name }
    });

    if (!existing) {
      await prisma.badge.create({
        data: {
          name: badgeData.name,
          description: badgeData.description,
          icon: badgeData.icon,
          category: badgeData.category,
          rarity: badgeData.rarity,
          points: badgeData.points,
          criteria: badgeData.criteria
        }
      });
    }
  }

  /**
   * Crea un logro si no existe
   */
  private async createAchievementIfNotExists(achievementData: any): Promise<void> {
    const existing = await prisma.achievement.findFirst({
      where: { name: achievementData.name }
    });

    if (!existing) {
      await prisma.achievement.create({
        data: {
          name: achievementData.name,
          description: achievementData.description,
          icon: achievementData.icon,
          category: achievementData.category,
          points: achievementData.points,
          criteria: achievementData.criteria
        }
      });
    }
  }

  /**
   * Registra un evento de gamificación
   */
  async recordEvent(event: GamificationEvent): Promise<void> {
    try {
      // Guardar evento en la base de datos
      await prisma.gamificationEvent.create({
        data: {
          userId: event.userId,
          type: event.type,
          points: event.points,
          metadata: event.metadata
        }
      });

      // Actualizar puntos del usuario
      await this.addPoints(event.userId, event.points);

      // Verificar badges y logros
      await this.checkBadges(event.userId);
      await this.checkAchievements(event.userId);

      // Verificar subida de nivel
      await this.checkLevelUp(event.userId);

      // Cachear datos actualizados
      await this.cacheUserGamificationData(event.userId);

    } catch (error) {
      console.error('Error registrando evento de gamificación:', error);
      throw error;
    }
  }

  /**
   * Agrega puntos al usuario
   */
  private async addPoints(userId: string, points: number): Promise<void> {
    await prisma.userLevel.upsert({
      where: { userId },
      update: {
        points: { increment: points },
        experience: { increment: points }
      },
      create: {
        userId,
        points,
        experience: points,
        level: 1,
        title: "Estudiante"
      }
    });
  }

  /**
   * Verifica si el usuario debe recibir badges
   */
  private async checkBadges(userId: string): Promise<void> {
    const userStats = await this.getUserStats(userId);
    const badges = await prisma.badge.findMany({ where: { isActive: true } });

    for (const badge of badges) {
      const hasBadge = await prisma.userBadge.findUnique({
        where: { userId_badgeId: { userId, badgeId: badge.id } }
      });

      if (!hasBadge) {
        const criteria = badge.criteria as BadgeCriteria;
        const shouldAward = this.evaluateCriteria(userStats, criteria);

        if (shouldAward) {
          await prisma.userBadge.create({
            data: {
              userId,
              badgeId: badge.id,
              progress: 100
            }
          });

          // Notificar al usuario
          await this.notifyUser(userId, 'badge_earned', {
            badgeName: badge.name,
            badgeIcon: badge.icon,
            points: badge.points
          });
        }
      }
    }
  }

  /**
   * Verifica si el usuario debe recibir logros
   */
  private async checkAchievements(userId: string): Promise<void> {
    const userStats = await this.getUserStats(userId);
    const achievements = await prisma.achievement.findMany({ where: { isActive: true } });

    for (const achievement of achievements) {
      const hasAchievement = await prisma.userAchievement.findUnique({
        where: { userId_achievementId: { userId, achievementId: achievement.id } }
      });

      if (!hasAchievement) {
        const criteria = achievement.criteria as AchievementCriteria;
        const shouldAward = this.evaluateCriteria(userStats, criteria);

        if (shouldAward) {
          await prisma.userAchievement.create({
            data: {
              userId,
              achievementId: achievement.id,
              progress: 100
            }
          });

          // Notificar al usuario
          await this.notifyUser(userId, 'achievement_unlocked', {
            achievementName: achievement.name,
            achievementIcon: achievement.icon,
            points: achievement.points
          });
        }
      }
    }
  }

  /**
   * Verifica si el usuario debe subir de nivel
   */
  private async checkLevelUp(userId: string): Promise<void> {
    const userLevel = await prisma.userLevel.findUnique({ where: { userId } });
    if (!userLevel) return;

    const currentLevelConfig = this.levelConfigs.find(config => config.level === userLevel.level);
    const nextLevelConfig = this.levelConfigs.find(config => config.level === userLevel.level + 1);

    if (nextLevelConfig && userLevel.experience >= nextLevelConfig.experienceRequired) {
      await prisma.userLevel.update({
        where: { userId },
        data: {
          level: nextLevelConfig.level,
          title: nextLevelConfig.title
        }
      });

      // Otorgar recompensas del nivel
      for (const reward of nextLevelConfig.rewards) {
        await this.grantReward(userId, reward);
      }

      // Notificar al usuario
      await this.notifyUser(userId, 'level_up', {
        newLevel: nextLevelConfig.level,
        newTitle: nextLevelConfig.title,
        rewards: nextLevelConfig.rewards
      });
    }
  }

  /**
   * Evalúa si se cumplen los criterios
   */
  private evaluateCriteria(userStats: any, criteria: BadgeCriteria | AchievementCriteria): boolean {
    const statValue = userStats[criteria.type] || 0;

    switch (criteria.condition) {
      case 'equals':
        return statValue === criteria.value;
      case 'greater_than':
        return statValue > criteria.value;
      case 'less_than':
        return statValue < criteria.value;
      case 'contains':
        return String(statValue).includes(String(criteria.value));
      case 'starts_with':
        return String(statValue).startsWith(String(criteria.value));
      default:
        return false;
    }
  }

  /**
   * Obtiene estadísticas del usuario
   */
  private async getUserStats(userId: string): Promise<any> {
    const cacheKey = `user_stats:${userId}`;
    
    // Intentar obtener del caché
    const cached = await redisCache.get(cacheKey);
    if (cached) return cached;

    // Calcular estadísticas
    const stats = {
      lessons_completed: await prisma.lesson.count({ where: { userId, completed: true } }),
      assessments_passed: await prisma.assessment.count({ where: { userId, passed: true } }),
      cultural_activities: await prisma.culturalActivity.count({ where: { userId } }),
      help_others: await prisma.gamificationEvent.count({ 
        where: { userId, type: 'HELP_OTHERS' } 
      }),
      perfect_scores: await prisma.assessment.count({ 
        where: { userId, score: 100 } 
      }),
      study_streak: await this.calculateStudyStreak(userId),
      languages_learned: await this.calculateLanguagesLearned(userId),
      students_helped: await this.calculateStudentsHelped(userId)
    };

    // Guardar en caché por 1 hora
    await redisCache.set(cacheKey, stats, { ttl: 3600 });
    
    return stats;
  }

  /**
   * Calcula la racha de estudio
   */
  private async calculateStudyStreak(userId: string): Promise<number> {
    const events = await prisma.gamificationEvent.findMany({
      where: { userId, type: 'LESSON_COMPLETED' },
      orderBy: { createdAt: 'desc' },
      take: 30
    });

    let streak = 0;
    let currentDate = new Date();

    for (const event of events) {
      const eventDate = new Date(event.createdAt);
      const diffDays = Math.floor((currentDate.getTime() - eventDate.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === streak) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  /**
   * Calcula idiomas aprendidos
   */
  private async calculateLanguagesLearned(userId: string): Promise<number> {
    const lessons = await prisma.lesson.findMany({
      where: { userId, completed: true },
      select: { language: true }
    });

    const languages = new Set(lessons.map(lesson => lesson.language));
    return languages.size;
  }

  /**
   * Calcula estudiantes ayudados
   */
  private async calculateStudentsHelped(userId: string): Promise<number> {
    const events = await prisma.gamificationEvent.findMany({
      where: { userId, type: 'HELP_OTHERS' },
      select: { metadata: true }
    });

    const helpedStudents = new Set();
    for (const event of events) {
      if (event.metadata?.helpedStudentId) {
        helpedStudents.add(event.metadata.helpedStudentId);
      }
    }

    return helpedStudents.size;
  }

  /**
   * Otorga una recompensa al usuario
   */
  private async grantReward(userId: string, rewardType: string): Promise<void> {
    // Implementar lógica de recompensas según el tipo
    switch (rewardType) {
      case 'badge_beginner':
        // Otorgar badge de principiante
        break;
      case 'badge_consistent':
        // Otorgar badge de consistencia
        break;
      // Agregar más casos según sea necesario
    }
  }

  /**
   * Notifica al usuario sobre un evento
   */
  private async notifyUser(userId: string, eventType: string, data: any): Promise<void> {
    // Implementar sistema de notificaciones
    console.log(`Notificación para usuario ${userId}:`, { eventType, data });
  }

  /**
   * Cachea datos de gamificación del usuario
   */
  private async cacheUserGamificationData(userId: string): Promise<void> {
    const userData = await this.getUserGamificationData(userId);
    const cacheKey = `user_gamification:${userId}`;
    
    await redisCache.set(cacheKey, userData, { ttl: 1800 }); // 30 minutos
  }

  /**
   * Obtiene datos de gamificación del usuario
   */
  async getUserGamificationData(userId: string): Promise<any> {
    const cacheKey = `user_gamification:${userId}`;
    
    // Intentar obtener del caché
    const cached = await redisCache.get(cacheKey);
    if (cached) return cached;

    // Obtener datos de la base de datos
    const [userLevel, userBadges, userAchievements, userRewards] = await Promise.all([
      prisma.userLevel.findUnique({ where: { userId } }),
      prisma.userBadge.findMany({ 
        where: { userId, isActive: true },
        include: { badge: true }
      }),
      prisma.userAchievement.findMany({
        where: { userId, isActive: true },
        include: { achievement: true }
      }),
      prisma.userReward.findMany({
        where: { userId, isActive: true },
        include: { reward: true }
      })
    ]);

    const data = {
      level: userLevel,
      badges: userBadges,
      achievements: userAchievements,
      rewards: userRewards,
      stats: await this.getUserStats(userId)
    };

    // Guardar en caché
    await redisCache.set(cacheKey, data, { ttl: 1800 });
    
    return data;
  }

  /**
   * Crea una nueva competencia
   */
  async createCompetition(competitionData: {
    name: string;
    description: string;
    startDate: Date;
    endDate: Date;
    type: string;
    maxParticipants?: number;
    rewards: CompetitionRewards;
    criteria: any;
  }): Promise<any> {
    return await prisma.competition.create({
      data: {
        name: competitionData.name,
        description: competitionData.description,
        startDate: competitionData.startDate,
        endDate: competitionData.endDate,
        type: competitionData.type as any,
        maxParticipants: competitionData.maxParticipants,
        rewards: competitionData.rewards,
        criteria: competitionData.criteria
      }
    });
  }

  /**
   * Une un usuario a una competencia
   */
  async joinCompetition(userId: string, competitionId: string): Promise<void> {
    const competition = await prisma.competition.findUnique({
      where: { id: competitionId }
    });

    if (!competition) {
      throw new Error('Competencia no encontrada');
    }

    if (competition.status !== 'ACTIVE') {
      throw new Error('La competencia no está activa');
    }

    if (competition.maxParticipants) {
      const participantCount = await prisma.competitionParticipant.count({
        where: { competitionId }
      });

      if (participantCount >= competition.maxParticipants) {
        throw new Error('La competencia está llena');
      }
    }

    await prisma.competitionParticipant.create({
      data: {
        competitionId,
        userId
      }
    });
  }

  /**
   * Actualiza el puntaje de un participante
   */
  async updateCompetitionScore(userId: string, competitionId: string, score: number): Promise<void> {
    await prisma.competitionParticipant.update({
      where: {
        competitionId_userId: { competitionId, userId }
      },
      data: { score }
    });

    // Actualizar leaderboard
    await this.updateLeaderboard(competitionId);
  }

  /**
   * Actualiza el leaderboard de una competencia
   */
  private async updateLeaderboard(competitionId: string): Promise<void> {
    const participants = await prisma.competitionParticipant.findMany({
      where: { competitionId },
      orderBy: { score: 'desc' },
      include: { user: true }
    });

    // Actualizar rankings
    for (let i = 0; i < participants.length; i++) {
      await prisma.leaderboardEntry.upsert({
        where: {
          competitionId_userId: {
            competitionId,
            userId: participants[i].userId
          }
        },
        update: {
          score: participants[i].score,
          rank: i + 1
        },
        create: {
          competitionId,
          userId: participants[i].userId,
          score: participants[i].score,
          rank: i + 1
        }
      });
    }
  }

  /**
   * Finaliza una competencia y otorga recompensas
   */
  async finishCompetition(competitionId: string): Promise<void> {
    const competition = await prisma.competition.findUnique({
      where: { id: competitionId }
    });

    if (!competition) return;

    const leaderboard = await prisma.leaderboardEntry.findMany({
      where: { competitionId },
      orderBy: { rank: 'asc' },
      take: 10
    });

    const rewards = competition.rewards as CompetitionRewards;

    // Otorgar recompensas a los ganadores
    if (leaderboard.length > 0) {
      await this.grantCompetitionReward(leaderboard[0].userId, rewards.firstPlace);
    }
    if (leaderboard.length > 1) {
      await this.grantCompetitionReward(leaderboard[1].userId, rewards.secondPlace);
    }
    if (leaderboard.length > 2) {
      await this.grantCompetitionReward(leaderboard[2].userId, rewards.thirdPlace);
    }

    // Otorgar recompensa de participación a todos
    const allParticipants = await prisma.competitionParticipant.findMany({
      where: { competitionId }
    });

    for (const participant of allParticipants) {
      await this.grantCompetitionReward(participant.userId, rewards.participation);
    }

    // Marcar competencia como finalizada
    await prisma.competition.update({
      where: { id: competitionId },
      data: { status: 'FINISHED' }
    });
  }

  /**
   * Otorga recompensa de competencia
   */
  private async grantCompetitionReward(userId: string, reward: RewardConfig): Promise<void> {
    switch (reward.type) {
      case 'points':
        await this.addPoints(userId, reward.value as number);
        break;
      case 'badge':
        // Otorgar badge específico
        break;
      case 'achievement':
        // Otorgar logro específico
        break;
      case 'title':
        // Otorgar título específico
        break;
      case 'feature_unlock':
        // Desbloquear característica específica
        break;
    }
  }

  /**
   * Obtiene el leaderboard de una competencia
   */
  async getCompetitionLeaderboard(competitionId: string, limit: number = 10): Promise<any[]> {
    return await prisma.leaderboardEntry.findMany({
      where: { competitionId },
      orderBy: { rank: 'asc' },
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      }
    });
  }

  /**
   * Obtiene competencias activas
   */
  async getActiveCompetitions(): Promise<any[]> {
    return await prisma.competition.findMany({
      where: { 
        status: 'ACTIVE',
        isActive: true,
        startDate: { lte: new Date() },
        endDate: { gte: new Date() }
      },
      include: {
        _count: {
          select: { participants: true }
        }
      }
    });
  }

  /**
   * Limpia datos de gamificación antiguos
   */
  async cleanupOldData(): Promise<void> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    await prisma.gamificationEvent.deleteMany({
      where: {
        createdAt: { lt: thirtyDaysAgo }
      }
    });
  }
}

// Instancia singleton
export const gamificationService = new GamificationService();

// Exportar tipos
export type {
  BadgeCriteria,
  AchievementCriteria,
  LevelConfig,
  CompetitionRewards,
  RewardConfig,
  GamificationEvent
};
