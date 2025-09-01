/**
 * Hook para integrar el sistema de gamificación con las actividades de la aplicación
 */

import { useCallback } from 'react';
import { gamificationService } from '../gamification-service';

export interface GamificationEvent {
  userId: string;
  type: string;
  points: number;
  metadata?: any;
}

export const useGamification = (userId: string) => {
  /**
   * Registra la finalización de una lección
   */
  const recordLessonCompletion = useCallback(async (
    lessonId: string,
    score: number,
    timeSpent: number,
    language: string
  ) => {
    try {
      const points = calculateLessonPoints(score, timeSpent);
      
      await gamificationService.recordEvent({
        userId,
        type: 'LESSON_COMPLETED',
        points,
        metadata: {
          lessonId,
          score,
          timeSpent,
          language,
          timestamp: new Date().toISOString()
        }
      });

      return { success: true, points };
    } catch (error) {
      console.error('Error registrando finalización de lección:', error);
      return { success: false, error };
    }
  }, [userId]);

  /**
   * Registra el paso de una evaluación
   */
  const recordAssessmentPass = useCallback(async (
    assessmentId: string,
    score: number,
    questionsAnswered: number,
    timeSpent: number
  ) => {
    try {
      const points = calculateAssessmentPoints(score, questionsAnswered, timeSpent);
      
      await gamificationService.recordEvent({
        userId,
        type: 'ASSESSMENT_PASSED',
        points,
        metadata: {
          assessmentId,
          score,
          questionsAnswered,
          timeSpent,
          timestamp: new Date().toISOString()
        }
      });

      // Verificar si es una puntuación perfecta
      if (score === 100) {
        await gamificationService.recordEvent({
          userId,
          type: 'PERFECT_SCORE',
          points: 50, // Bonus por puntuación perfecta
          metadata: {
            assessmentId,
            score,
            timestamp: new Date().toISOString()
          }
        });
      }

      return { success: true, points };
    } catch (error) {
      console.error('Error registrando evaluación pasada:', error);
      return { success: false, error };
    }
  }, [userId]);

  /**
   * Registra participación en actividad cultural
   */
  const recordCulturalActivity = useCallback(async (
    activityId: string,
    activityType: string,
    culture: string,
    duration: number
  ) => {
    try {
      const points = calculateCulturalActivityPoints(activityType, duration);
      
      await gamificationService.recordEvent({
        userId,
        type: 'CULTURAL_ACTIVITY',
        points,
        metadata: {
          activityId,
          activityType,
          culture,
          duration,
          timestamp: new Date().toISOString()
        }
      });

      return { success: true, points };
    } catch (error) {
      console.error('Error registrando actividad cultural:', error);
      return { success: false, error };
    }
  }, [userId]);

  /**
   * Registra ayuda a otros estudiantes
   */
  const recordHelpOthers = useCallback(async (
    helpedStudentId: string,
    helpType: string,
    duration: number
  ) => {
    try {
      const points = calculateHelpPoints(helpType, duration);
      
      await gamificationService.recordEvent({
        userId,
        type: 'HELP_OTHERS',
        points,
        metadata: {
          helpedStudentId,
          helpType,
          duration,
          timestamp: new Date().toISOString()
        }
      });

      return { success: true, points };
    } catch (error) {
      console.error('Error registrando ayuda a otros:', error);
      return { success: false, error };
    }
  }, [userId]);

  /**
   * Registra interacción social
   */
  const recordSocialInteraction = useCallback(async (
    interactionType: string,
    participants: number,
    duration: number
  ) => {
    try {
      const points = calculateSocialPoints(interactionType, participants, duration);
      
      await gamificationService.recordEvent({
        userId,
        type: 'SOCIAL_INTERACTION',
        points,
        metadata: {
          interactionType,
          participants,
          duration,
          timestamp: new Date().toISOString()
        }
      });

      return { success: true, points };
    } catch (error) {
      console.error('Error registrando interacción social:', error);
      return { success: false, error };
    }
  }, [userId]);

  /**
   * Registra actividad por primera vez
   */
  const recordFirstTimeActivity = useCallback(async (
    activityType: string,
    activityId: string
  ) => {
    try {
      const points = 25; // Bonus por primera vez
      
      await gamificationService.recordEvent({
        userId,
        type: 'FIRST_TIME_ACTIVITY',
        points,
        metadata: {
          activityType,
          activityId,
          timestamp: new Date().toISOString()
        }
      });

      return { success: true, points };
    } catch (error) {
      console.error('Error registrando actividad por primera vez:', error);
      return { success: false, error };
    }
  }, [userId]);

  /**
   * Registra mantenimiento de racha
   */
  const recordStreakMaintained = useCallback(async (
    streakType: string,
    currentStreak: number
  ) => {
    try {
      const points = calculateStreakPoints(currentStreak);
      
      await gamificationService.recordEvent({
        userId,
        type: 'STREAK_MAINTAINED',
        points,
        metadata: {
          streakType,
          currentStreak,
          timestamp: new Date().toISOString()
        }
      });

      return { success: true, points };
    } catch (error) {
      console.error('Error registrando mantenimiento de racha:', error);
      return { success: false, error };
    }
  }, [userId]);

  /**
   * Registra victoria en competencia
   */
  const recordCompetitionWin = useCallback(async (
    competitionId: string,
    position: number,
    score: number
  ) => {
    try {
      const points = calculateCompetitionPoints(position, score);
      
      await gamificationService.recordEvent({
        userId,
        type: 'COMPETITION_WON',
        points,
        metadata: {
          competitionId,
          position,
          score,
          timestamp: new Date().toISOString()
        }
      });

      return { success: true, points };
    } catch (error) {
      console.error('Error registrando victoria en competencia:', error);
      return { success: false, error };
    }
  }, [userId]);

  /**
   * Obtiene datos de gamificación del usuario
   */
  const getUserGamificationData = useCallback(async () => {
    try {
      return await gamificationService.getUserGamificationData(userId);
    } catch (error) {
      console.error('Error obteniendo datos de gamificación:', error);
      throw error;
    }
  }, [userId]);

  /**
   * Une al usuario a una competencia
   */
  const joinCompetition = useCallback(async (competitionId: string) => {
    try {
      await gamificationService.joinCompetition(userId, competitionId);
      return { success: true };
    } catch (error) {
      console.error('Error uniéndose a competencia:', error);
      return { success: false, error };
    }
  }, [userId]);

  /**
   * Actualiza puntaje en competencia
   */
  const updateCompetitionScore = useCallback(async (
    competitionId: string,
    score: number
  ) => {
    try {
      await gamificationService.updateCompetitionScore(userId, competitionId, score);
      return { success: true };
    } catch (error) {
      console.error('Error actualizando puntaje de competencia:', error);
      return { success: false, error };
    }
  }, [userId]);

  return {
    // Eventos de gamificación
    recordLessonCompletion,
    recordAssessmentPass,
    recordCulturalActivity,
    recordHelpOthers,
    recordSocialInteraction,
    recordFirstTimeActivity,
    recordStreakMaintained,
    recordCompetitionWin,
    
    // Funciones de datos
    getUserGamificationData,
    joinCompetition,
    updateCompetitionScore
  };
};

// Funciones auxiliares para calcular puntos

function calculateLessonPoints(score: number, timeSpent: number): number {
  // Base points: 10-50 based on score
  let points = Math.floor((score / 100) * 40) + 10;
  
  // Bonus for efficient completion (less than 10 minutes)
  if (timeSpent < 600) {
    points += 10;
  }
  
  // Bonus for high score
  if (score >= 90) {
    points += 20;
  }
  
  return points;
}

function calculateAssessmentPoints(score: number, questionsAnswered: number, timeSpent: number): number {
  // Base points: 20-100 based on score
  let points = Math.floor((score / 100) * 80) + 20;
  
  // Bonus for answering all questions
  if (questionsAnswered > 0) {
    points += Math.floor((questionsAnswered / 10) * 10);
  }
  
  // Bonus for efficient completion
  if (timeSpent < 900) { // Less than 15 minutes
    points += 15;
  }
  
  return points;
}

function calculateCulturalActivityPoints(activityType: string, duration: number): number {
  let basePoints = 15;
  
  // Different points based on activity type
  switch (activityType) {
    case 'story':
      basePoints = 20;
      break;
    case 'music':
      basePoints = 25;
      break;
    case 'dance':
      basePoints = 30;
      break;
    case 'craft':
      basePoints = 35;
      break;
    case 'language':
      basePoints = 40;
      break;
  }
  
  // Bonus for longer engagement
  if (duration > 1800) { // More than 30 minutes
    basePoints += 20;
  }
  
  return basePoints;
}

function calculateHelpPoints(helpType: string, duration: number): number {
  let basePoints = 10;
  
  // Different points based on help type
  switch (helpType) {
    case 'explanation':
      basePoints = 15;
      break;
    case 'tutoring':
      basePoints = 25;
      break;
    case 'mentoring':
      basePoints = 35;
      break;
    case 'collaboration':
      basePoints = 20;
      break;
  }
  
  // Bonus for longer help sessions
  if (duration > 900) { // More than 15 minutes
    basePoints += 15;
  }
  
  return basePoints;
}

function calculateSocialPoints(interactionType: string, participants: number, duration: number): number {
  let basePoints = 5;
  
  // Different points based on interaction type
  switch (interactionType) {
    case 'discussion':
      basePoints = 10;
      break;
    case 'group_work':
      basePoints = 15;
      break;
    case 'presentation':
      basePoints = 25;
      break;
    case 'peer_review':
      basePoints = 20;
      break;
  }
  
  // Bonus for more participants
  if (participants > 3) {
    basePoints += 10;
  }
  
  // Bonus for longer interactions
  if (duration > 1800) { // More than 30 minutes
    basePoints += 15;
  }
  
  return basePoints;
}

function calculateStreakPoints(currentStreak: number): number {
  // Exponential bonus for longer streaks
  return Math.min(100, Math.floor(currentStreak * 2));
}

function calculateCompetitionPoints(position: number, score: number): number {
  let basePoints = 50;
  
  // Position-based bonus
  switch (position) {
    case 1:
      basePoints += 200;
      break;
    case 2:
      basePoints += 150;
      break;
    case 3:
      basePoints += 100;
      break;
    default:
      basePoints += 25;
  }
  
  // Score-based bonus
  basePoints += Math.floor((score / 100) * 50);
  
  return basePoints;
}
