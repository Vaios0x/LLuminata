/**
 * Hook para manejo de competencias en el sistema de gamificación
 * Proporciona funcionalidades para participar, ver rankings y gestionar recompensas
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { GamificationService } from '../gamification-service';

// Interfaces
interface Competition {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  type: 'ACADEMIC' | 'CULTURAL' | 'CREATIVE' | 'COLLABORATIVE' | 'INDIVIDUAL';
  status: 'UPCOMING' | 'ACTIVE' | 'FINISHED' | 'CANCELLED';
  maxParticipants?: number;
  rewards: any;
  criteria: any;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface CompetitionParticipant {
  id: string;
  competitionId: string;
  userId: string;
  joinedAt: Date;
  score: number;
  rank?: number;
  isActive: boolean;
}

interface LeaderboardEntry {
  id: string;
  competitionId: string;
  userId: string;
  score: number;
  rank: number;
  updatedAt: Date;
  user?: {
    name: string;
    avatar?: string;
  };
}

interface UseCompetitionReturn {
  // Estado
  competitions: Competition[];
  activeCompetitions: Competition[];
  userParticipations: CompetitionParticipant[];
  leaderboards: Record<string, LeaderboardEntry[]>;
  loading: boolean;
  error: string | null;
  
  // Acciones
  joinCompetition: (competitionId: string) => Promise<void>;
  leaveCompetition: (competitionId: string) => Promise<void>;
  updateScore: (competitionId: string, score: number) => Promise<void>;
  getLeaderboard: (competitionId: string) => Promise<LeaderboardEntry[]>;
  refreshCompetitions: () => Promise<void>;
  
  // Utilidades
  canJoinCompetition: (competition: Competition) => boolean;
  getUserRank: (competitionId: string) => number | null;
  getCompetitionStatus: (competition: Competition) => string;
  getTimeRemaining: (competition: Competition) => string;
}

export const useCompetition = (): UseCompetitionReturn => {
  const { user } = useAuth();
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [userParticipations, setUserParticipations] = useState<CompetitionParticipant[]>([]);
  const [leaderboards, setLeaderboards] = useState<Record<string, LeaderboardEntry[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const gamificationService = new GamificationService();

  // Cargar competencias
  const loadCompetitions = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const [allCompetitions, participations] = await Promise.all([
        gamificationService.getCompetitions(),
        gamificationService.getUserCompetitions(user.id)
      ]);
      
      setCompetitions(allCompetitions);
      setUserParticipations(participations);
      
      // Cargar leaderboards para competencias activas
      const activeCompetitions = allCompetitions.filter(c => c.status === 'ACTIVE');
      const leaderboardPromises = activeCompetitions.map(async (comp) => {
        const leaderboard = await gamificationService.getCompetitionLeaderboard(comp.id);
        return { competitionId: comp.id, leaderboard };
      });
      
      const leaderboardResults = await Promise.all(leaderboardPromises);
      const leaderboardMap = leaderboardResults.reduce((acc, { competitionId, leaderboard }) => {
        acc[competitionId] = leaderboard;
        return acc;
      }, {} as Record<string, LeaderboardEntry[]>);
      
      setLeaderboards(leaderboardMap);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar competencias');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Unirse a una competencia
  const joinCompetition = useCallback(async (competitionId: string) => {
    if (!user?.id) throw new Error('Usuario no autenticado');
    
    try {
      setError(null);
      await gamificationService.joinCompetition(user.id, competitionId);
      
      // Actualizar participaciones
      const updatedParticipations = await gamificationService.getUserCompetitions(user.id);
      setUserParticipations(updatedParticipations);
      
      // Actualizar leaderboard si la competencia está activa
      const competition = competitions.find(c => c.id === competitionId);
      if (competition?.status === 'ACTIVE') {
        const leaderboard = await gamificationService.getCompetitionLeaderboard(competitionId);
        setLeaderboards(prev => ({
          ...prev,
          [competitionId]: leaderboard
        }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al unirse a la competencia');
      throw err;
    }
  }, [user?.id, competitions]);

  // Salir de una competencia
  const leaveCompetition = useCallback(async (competitionId: string) => {
    if (!user?.id) throw new Error('Usuario no autenticado');
    
    try {
      setError(null);
      await gamificationService.leaveCompetition(user.id, competitionId);
      
      // Actualizar participaciones
      const updatedParticipations = await gamificationService.getUserCompetitions(user.id);
      setUserParticipations(updatedParticipations);
      
      // Actualizar leaderboard
      const leaderboard = await gamificationService.getCompetitionLeaderboard(competitionId);
      setLeaderboards(prev => ({
        ...prev,
        [competitionId]: leaderboard
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al salir de la competencia');
      throw err;
    }
  }, [user?.id]);

  // Actualizar puntuación
  const updateScore = useCallback(async (competitionId: string, score: number) => {
    if (!user?.id) throw new Error('Usuario no autenticado');
    
    try {
      setError(null);
      await gamificationService.updateCompetitionScore(user.id, competitionId, score);
      
      // Actualizar leaderboard
      const leaderboard = await gamificationService.getCompetitionLeaderboard(competitionId);
      setLeaderboards(prev => ({
        ...prev,
        [competitionId]: leaderboard
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar puntuación');
      throw err;
    }
  }, [user?.id]);

  // Obtener leaderboard
  const getLeaderboard = useCallback(async (competitionId: string): Promise<LeaderboardEntry[]> => {
    try {
      const leaderboard = await gamificationService.getCompetitionLeaderboard(competitionId);
      setLeaderboards(prev => ({
        ...prev,
        [competitionId]: leaderboard
      }));
      return leaderboard;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al obtener leaderboard');
      throw err;
    }
  }, []);

  // Refrescar competencias
  const refreshCompetitions = useCallback(async () => {
    await loadCompetitions();
  }, [loadCompetitions]);

  // Utilidades
  const activeCompetitions = competitions.filter(c => c.status === 'ACTIVE');

  const canJoinCompetition = useCallback((competition: Competition): boolean => {
    if (!user?.id) return false;
    if (competition.status !== 'ACTIVE') return false;
    if (competition.maxParticipants && competition.maxParticipants <= userParticipations.length) return false;
    
    const isAlreadyParticipating = userParticipations.some(p => p.competitionId === competition.id);
    return !isAlreadyParticipating;
  }, [user?.id, userParticipations]);

  const getUserRank = useCallback((competitionId: string): number | null => {
    const leaderboard = leaderboards[competitionId];
    if (!leaderboard || !user?.id) return null;
    
    const userEntry = leaderboard.find(entry => entry.userId === user.id);
    return userEntry?.rank || null;
  }, [leaderboards, user?.id]);

  const getCompetitionStatus = useCallback((competition: Competition): string => {
    const now = new Date();
    
    if (competition.status === 'CANCELLED') return 'Cancelada';
    if (competition.status === 'FINISHED') return 'Finalizada';
    if (competition.startDate > now) return 'Próximamente';
    if (competition.endDate < now) return 'Finalizada';
    return 'Activa';
  }, []);

  const getTimeRemaining = useCallback((competition: Competition): string => {
    const now = new Date();
    const endDate = new Date(competition.endDate);
    const timeDiff = endDate.getTime() - now.getTime();
    
    if (timeDiff <= 0) return 'Finalizada';
    
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  }, []);

  // Efectos
  useEffect(() => {
    loadCompetitions();
  }, [loadCompetitions]);

  // Actualizar automáticamente cada 30 segundos para competencias activas
  useEffect(() => {
    if (activeCompetitions.length === 0) return;
    
    const interval = setInterval(() => {
      refreshCompetitions();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [activeCompetitions.length, refreshCompetitions]);

  return {
    competitions,
    activeCompetitions,
    userParticipations,
    leaderboards,
    loading,
    error,
    joinCompetition,
    leaveCompetition,
    updateScore,
    getLeaderboard,
    refreshCompetitions,
    canJoinCompetition,
    getUserRank,
    getCompetitionStatus,
    getTimeRemaining
  };
};
