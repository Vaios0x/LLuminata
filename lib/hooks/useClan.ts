/**
 * Hook para manejo de clanes en el sistema de gamificación
 * Proporciona funcionalidades para crear, gestionar y participar en clanes
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { GamificationService } from '../gamification-service';

// Interfaces
interface Clan {
  id: string;
  name: string;
  description: string;
  tag: string; // Tag único del clan (ej: #INCLUSIVE)
  avatar?: string;
  banner?: string;
  level: number;
  experience: number;
  memberCount: number;
  maxMembers: number;
  isPublic: boolean;
  requirements: {
    minLevel: number;
    minPoints: number;
    invitationOnly: boolean;
  };
  leader: {
    id: string;
    name: string;
    avatar?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

interface ClanMember {
  id: string;
  clanId: string;
  userId: string;
  role: 'LEADER' | 'OFFICER' | 'MEMBER' | 'RECRUIT';
  joinedAt: Date;
  contribution: number; // Puntos contribuidos al clan
  lastActive: Date;
  user: {
    name: string;
    avatar?: string;
    level: number;
    points: number;
  };
}

interface ClanActivity {
  id: string;
  clanId: string;
  type: 'MEMBER_JOINED' | 'MEMBER_LEFT' | 'LEVEL_UP' | 'ACHIEVEMENT' | 'COMPETITION_WON' | 'CLAN_WAR';
  description: string;
  metadata: any;
  createdAt: Date;
}

interface ClanWar {
  id: string;
  clanId: string;
  opponentClanId: string;
  startDate: Date;
  endDate: Date;
  status: 'UPCOMING' | 'ACTIVE' | 'FINISHED';
  clanScore: number;
  opponentScore: number;
  winner?: string;
}

interface UseClanReturn {
  // Estado
  userClan: Clan | null;
  availableClans: Clan[];
  clanMembers: ClanMember[];
  clanActivities: ClanActivity[];
  clanWars: ClanWar[];
  loading: boolean;
  error: string | null;
  
  // Acciones de clan
  createClan: (clanData: Partial<Clan>) => Promise<Clan>;
  updateClan: (clanId: string, updates: Partial<Clan>) => Promise<void>;
  deleteClan: (clanId: string) => Promise<void>;
  
  // Acciones de miembros
  joinClan: (clanId: string) => Promise<void>;
  leaveClan: () => Promise<void>;
  inviteMember: (clanId: string, userId: string) => Promise<void>;
  kickMember: (clanId: string, userId: string) => Promise<void>;
  promoteMember: (clanId: string, userId: string, role: ClanMember['role']) => Promise<void>;
  
  // Acciones de guerra
  declareWar: (opponentClanId: string) => Promise<void>;
  acceptWar: (warId: string) => Promise<void>;
  contributeToWar: (warId: string, points: number) => Promise<void>;
  
  // Utilidades
  canJoinClan: (clan: Clan) => boolean;
  canInviteMembers: () => boolean;
  canKickMembers: () => boolean;
  canDeclareWar: () => boolean;
  getClanRank: () => number | null;
  getMemberRole: (userId: string) => ClanMember['role'] | null;
  getClanLevel: () => number;
  getClanExperience: () => number;
}

export const useClan = (): UseClanReturn => {
  const { user } = useAuth();
  const [userClan, setUserClan] = useState<Clan | null>(null);
  const [availableClans, setAvailableClans] = useState<Clan[]>([]);
  const [clanMembers, setClanMembers] = useState<ClanMember[]>([]);
  const [clanActivities, setClanActivities] = useState<ClanActivity[]>([]);
  const [clanWars, setClanWars] = useState<ClanWar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const gamificationService = new GamificationService();

  // Cargar datos del clan del usuario
  const loadUserClanData = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const userClanData = await gamificationService.getUserClan(user.id);
      setUserClan(userClanData);
      
      if (userClanData) {
        // Cargar datos adicionales del clan
        const [members, activities, wars] = await Promise.all([
          gamificationService.getClanMembers(userClanData.id),
          gamificationService.getClanActivities(userClanData.id),
          gamificationService.getClanWars(userClanData.id)
        ]);
        
        setClanMembers(members);
        setClanActivities(activities);
        setClanWars(wars);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar datos del clan');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Cargar clanes disponibles
  const loadAvailableClans = useCallback(async () => {
    try {
      const clans = await gamificationService.getAvailableClans();
      setAvailableClans(clans);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar clanes disponibles');
    }
  }, []);

  // Crear clan
  const createClan = useCallback(async (clanData: Partial<Clan>): Promise<Clan> => {
    if (!user?.id) throw new Error('Usuario no autenticado');
    
    try {
      setError(null);
      const newClan = await gamificationService.createClan(user.id, clanData);
      setUserClan(newClan);
      return newClan;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear clan');
      throw err;
    }
  }, [user?.id]);

  // Actualizar clan
  const updateClan = useCallback(async (clanId: string, updates: Partial<Clan>): Promise<void> => {
    if (!user?.id) throw new Error('Usuario no autenticado');
    
    try {
      setError(null);
      await gamificationService.updateClan(clanId, updates);
      
      // Actualizar estado local
      if (userClan && userClan.id === clanId) {
        setUserClan(prev => prev ? { ...prev, ...updates } : null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar clan');
      throw err;
    }
  }, [user?.id, userClan]);

  // Eliminar clan
  const deleteClan = useCallback(async (clanId: string): Promise<void> => {
    if (!user?.id) throw new Error('Usuario no autenticado');
    
    try {
      setError(null);
      await gamificationService.deleteClan(clanId);
      setUserClan(null);
      setClanMembers([]);
      setClanActivities([]);
      setClanWars([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar clan');
      throw err;
    }
  }, [user?.id]);

  // Unirse a clan
  const joinClan = useCallback(async (clanId: string): Promise<void> => {
    if (!user?.id) throw new Error('Usuario no autenticado');
    
    try {
      setError(null);
      await gamificationService.joinClan(user.id, clanId);
      
      // Recargar datos del clan
      await loadUserClanData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al unirse al clan');
      throw err;
    }
  }, [user?.id, loadUserClanData]);

  // Salir del clan
  const leaveClan = useCallback(async (): Promise<void> => {
    if (!user?.id || !userClan) throw new Error('No estás en un clan');
    
    try {
      setError(null);
      await gamificationService.leaveClan(user.id, userClan.id);
      
      setUserClan(null);
      setClanMembers([]);
      setClanActivities([]);
      setClanWars([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al salir del clan');
      throw err;
    }
  }, [user?.id, userClan]);

  // Invitar miembro
  const inviteMember = useCallback(async (clanId: string, userId: string): Promise<void> => {
    if (!user?.id) throw new Error('Usuario no autenticado');
    
    try {
      setError(null);
      await gamificationService.inviteClanMember(clanId, userId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al invitar miembro');
      throw err;
    }
  }, [user?.id]);

  // Expulsar miembro
  const kickMember = useCallback(async (clanId: string, userId: string): Promise<void> => {
    if (!user?.id) throw new Error('Usuario no autenticado');
    
    try {
      setError(null);
      await gamificationService.kickClanMember(clanId, userId);
      
      // Actualizar lista de miembros
      const updatedMembers = await gamificationService.getClanMembers(clanId);
      setClanMembers(updatedMembers);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al expulsar miembro');
      throw err;
    }
  }, [user?.id]);

  // Promover miembro
  const promoteMember = useCallback(async (clanId: string, userId: string, role: ClanMember['role']): Promise<void> => {
    if (!user?.id) throw new Error('Usuario no autenticado');
    
    try {
      setError(null);
      await gamificationService.promoteClanMember(clanId, userId, role);
      
      // Actualizar lista de miembros
      const updatedMembers = await gamificationService.getClanMembers(clanId);
      setClanMembers(updatedMembers);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al promover miembro');
      throw err;
    }
  }, [user?.id]);

  // Declarar guerra
  const declareWar = useCallback(async (opponentClanId: string): Promise<void> => {
    if (!user?.id || !userClan) throw new Error('No estás en un clan');
    
    try {
      setError(null);
      await gamificationService.declareClanWar(userClan.id, opponentClanId);
      
      // Recargar guerras del clan
      const wars = await gamificationService.getClanWars(userClan.id);
      setClanWars(wars);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al declarar guerra');
      throw err;
    }
  }, [user?.id, userClan]);

  // Aceptar guerra
  const acceptWar = useCallback(async (warId: string): Promise<void> => {
    if (!user?.id) throw new Error('Usuario no autenticado');
    
    try {
      setError(null);
      await gamificationService.acceptClanWar(warId);
      
      // Recargar guerras del clan
      if (userClan) {
        const wars = await gamificationService.getClanWars(userClan.id);
        setClanWars(wars);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al aceptar guerra');
      throw err;
    }
  }, [user?.id, userClan]);

  // Contribuir a guerra
  const contributeToWar = useCallback(async (warId: string, points: number): Promise<void> => {
    if (!user?.id) throw new Error('Usuario no autenticado');
    
    try {
      setError(null);
      await gamificationService.contributeToClanWar(warId, user.id, points);
      
      // Recargar guerras del clan
      if (userClan) {
        const wars = await gamificationService.getClanWars(userClan.id);
        setClanWars(wars);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al contribuir a la guerra');
      throw err;
    }
  }, [user?.id, userClan]);

  // Utilidades
  const canJoinClan = useCallback((clan: Clan): boolean => {
    if (!user?.id) return false;
    if (userClan) return false; // Ya está en un clan
    if (clan.memberCount >= clan.maxMembers) return false;
    if (clan.requirements.invitationOnly) return false; // Necesita invitación
    
    // Verificar requisitos mínimos
    const userLevel = user.level || 1;
    const userPoints = user.points || 0;
    
    return userLevel >= clan.requirements.minLevel && userPoints >= clan.requirements.minPoints;
  }, [user?.id, userClan, user?.level, user?.points]);

  const canInviteMembers = useCallback((): boolean => {
    if (!userClan || !user?.id) return false;
    const memberRole = clanMembers.find(m => m.userId === user.id)?.role;
    return memberRole === 'LEADER' || memberRole === 'OFFICER';
  }, [userClan, user?.id, clanMembers]);

  const canKickMembers = useCallback((): boolean => {
    if (!userClan || !user?.id) return false;
    const memberRole = clanMembers.find(m => m.userId === user.id)?.role;
    return memberRole === 'LEADER';
  }, [userClan, user?.id, clanMembers]);

  const canDeclareWar = useCallback((): boolean => {
    if (!userClan || !user?.id) return false;
    const memberRole = clanMembers.find(m => m.userId === user.id)?.role;
    return memberRole === 'LEADER';
  }, [userClan, user?.id, clanMembers]);

  const getClanRank = useCallback((): number | null => {
    // Implementar lógica para obtener ranking del clan
    return null;
  }, []);

  const getMemberRole = useCallback((userId: string): ClanMember['role'] | null => {
    const member = clanMembers.find(m => m.userId === userId);
    return member?.role || null;
  }, [clanMembers]);

  const getClanLevel = useCallback((): number => {
    return userClan?.level || 1;
  }, [userClan]);

  const getClanExperience = useCallback((): number => {
    return userClan?.experience || 0;
  }, [userClan]);

  // Efectos
  useEffect(() => {
    loadUserClanData();
    loadAvailableClans();
  }, [loadUserClanData, loadAvailableClans]);

  // Actualizar automáticamente cada minuto si está en un clan
  useEffect(() => {
    if (!userClan) return;
    
    const interval = setInterval(() => {
      loadUserClanData();
    }, 60000);
    
    return () => clearInterval(interval);
  }, [userClan, loadUserClanData]);

  return {
    userClan,
    availableClans,
    clanMembers,
    clanActivities,
    clanWars,
    loading,
    error,
    createClan,
    updateClan,
    deleteClan,
    joinClan,
    leaveClan,
    inviteMember,
    kickMember,
    promoteMember,
    declareWar,
    acceptWar,
    contributeToWar,
    canJoinClan,
    canInviteMembers,
    canKickMembers,
    canDeclareWar,
    getClanRank,
    getMemberRole,
    getClanLevel,
    getClanExperience
  };
};
