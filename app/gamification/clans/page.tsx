'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  Crown, 
  Shield, 
  Star, 
  Trophy, 
  Target, 
  TrendingUp,
  Calendar,
  MessageSquare,
  Plus,
  Search,
  Filter,
  Eye,
  UserPlus,
  Settings,
  Award,
  Zap,
  Heart,
  Flag,
  BookOpen,
  Globe,
  Lock,
  Unlock,
  CheckCircle,
  X,
  AlertTriangle,
  Users2,
  Building2,
  Sword,
  Shield as ShieldIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Interfaces
interface Clan {
  id: string;
  name: string;
  description: string;
  tag: string;
  level: number;
  experience: number;
  maxMembers: number;
  currentMembers: number;
  leader: ClanMember;
  officers: ClanMember[];
  members: ClanMember[];
  achievements: ClanAchievement[];
  challenges: ClanChallenge[];
  isPublic: boolean;
  joinRequirements: {
    minLevel: number;
    minExperience: number;
    requiredBadges: string[];
  };
  stats: {
    totalPoints: number;
    weeklyPoints: number;
    monthlyPoints: number;
    competitionsWon: number;
    challengesCompleted: number;
  };
  userRole?: 'LEADER' | 'OFFICER' | 'MEMBER' | 'NONE';
  userCanJoin: boolean;
  userIsMember: boolean;
}

interface ClanMember {
  id: string;
  username: string;
  avatar?: string;
  role: 'LEADER' | 'OFFICER' | 'MEMBER';
  level: number;
  experience: number;
  joinDate: string;
  contribution: number;
  lastActive: string;
  badges: string[];
}

interface ClanAchievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: string;
  points: number;
}

interface ClanChallenge {
  id: string;
  name: string;
  description: string;
  type: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'SPECIAL';
  progress: number;
  target: number;
  reward: {
    type: 'points' | 'badge' | 'experience';
    value: number | string;
  };
  expiresAt: string;
  isCompleted: boolean;
}

interface ClanFilters {
  search: string;
  level: string;
  status: string;
  type: string;
}

export default function ClansPage() {
  const [clans, setClans] = useState<Clan[]>([]);
  const [userClan, setUserClan] = useState<Clan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ClanFilters>({
    search: '',
    level: 'all',
    status: 'all',
    type: 'all'
  });
  const [selectedClan, setSelectedClan] = useState<Clan | null>(null);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'challenges' | 'achievements'>('overview');

  // Datos de ejemplo
  const mockClans: Clan[] = [
    {
      id: 'clan_1',
      name: 'Guardianes del Conocimiento',
      description: 'Un clan dedicado a preservar y compartir el conocimiento de las culturas indígenas. Nos enfocamos en el aprendizaje colaborativo y la difusión de sabiduría ancestral.',
      tag: 'GDC',
      level: 8,
      experience: 12500,
      maxMembers: 50,
      currentMembers: 42,
      leader: {
        id: 'user_1',
        username: 'María López',
        role: 'LEADER',
        level: 10,
        experience: 25000,
        joinDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
        contribution: 8500,
        lastActive: new Date().toISOString(),
        badges: ['badge_leader', 'badge_expert']
      },
      officers: [
        {
          id: 'user_2',
          username: 'Carlos Ruiz',
          role: 'OFFICER',
          level: 8,
          experience: 18000,
          joinDate: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString(),
          contribution: 5200,
          lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          badges: ['badge_officer', 'badge_advanced']
        }
      ],
      members: [
        {
          id: 'user_3',
          username: 'Ana García',
          role: 'MEMBER',
          level: 6,
          experience: 12000,
          joinDate: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000).toISOString(),
          contribution: 3200,
          lastActive: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          badges: ['badge_consistent']
        }
      ],
      achievements: [
        {
          id: 'ach_1',
          name: 'Clan Nivel 5',
          description: 'El clan alcanzó el nivel 5',
          icon: '/achievements/clan-level-5.svg',
          earnedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          points: 500
        }
      ],
      challenges: [
        {
          id: 'challenge_1',
          name: 'Semana de Aprendizaje',
          description: 'Completa 20 lecciones entre todos los miembros',
          type: 'WEEKLY',
          progress: 15,
          target: 20,
          reward: { type: 'points', value: 1000 },
          expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          isCompleted: false
        }
      ],
      isPublic: true,
      joinRequirements: {
        minLevel: 3,
        minExperience: 1000,
        requiredBadges: ['badge_beginner']
      },
      stats: {
        totalPoints: 45000,
        weeklyPoints: 3200,
        monthlyPoints: 12500,
        competitionsWon: 8,
        challengesCompleted: 45
      },
      userRole: 'MEMBER',
      userCanJoin: false,
      userIsMember: true
    },
    {
      id: 'clan_2',
      name: 'Cazadores de Sabiduría',
      description: 'Exploradores del conocimiento que buscan las mejores estrategias de aprendizaje y comparten sus descubrimientos con la comunidad.',
      tag: 'CS',
      level: 6,
      experience: 8500,
      maxMembers: 30,
      currentMembers: 28,
      leader: {
        id: 'user_4',
        username: 'Roberto Méndez',
        role: 'LEADER',
        level: 9,
        experience: 22000,
        joinDate: new Date(Date.now() - 300 * 24 * 60 * 60 * 1000).toISOString(),
        contribution: 7200,
        lastActive: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        badges: ['badge_leader', 'badge_explorer']
      },
      officers: [],
      members: [],
      achievements: [],
      challenges: [],
      isPublic: true,
      joinRequirements: {
        minLevel: 2,
        minExperience: 500,
        requiredBadges: []
      },
      stats: {
        totalPoints: 28000,
        weeklyPoints: 2100,
        monthlyPoints: 8500,
        competitionsWon: 5,
        challengesCompleted: 32
      },
      userRole: 'NONE',
      userCanJoin: true,
      userIsMember: false
    },
    {
      id: 'clan_3',
      name: 'Maestros del Tiempo',
      description: 'Clan exclusivo para estudiantes avanzados que dominan múltiples idiomas y culturas. Enfoque en la excelencia académica.',
      tag: 'MT',
      level: 10,
      experience: 25000,
      maxMembers: 20,
      currentMembers: 18,
      leader: {
        id: 'user_5',
        username: 'Isabella Torres',
        role: 'LEADER',
        level: 10,
        experience: 30000,
        joinDate: new Date(Date.now() - 500 * 24 * 60 * 60 * 1000).toISOString(),
        contribution: 15000,
        lastActive: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        badges: ['badge_leader', 'badge_master', 'badge_polyglot']
      },
      officers: [],
      members: [],
      achievements: [],
      challenges: [],
      isPublic: false,
      joinRequirements: {
        minLevel: 8,
        minExperience: 15000,
        requiredBadges: ['badge_expert', 'badge_polyglot']
      },
      stats: {
        totalPoints: 75000,
        weeklyPoints: 4500,
        monthlyPoints: 18000,
        competitionsWon: 15,
        challengesCompleted: 78
      },
      userRole: 'NONE',
      userCanJoin: false,
      userIsMember: false
    }
  ];

  useEffect(() => {
    loadClans();
  }, []);

  const loadClans = async () => {
    try {
      setLoading(true);
      // En producción, esto sería una llamada a la API
      // const response = await fetch('/api/gamification/clans');
      // const data = await response.json();
      
      // Simulando carga
      await new Promise(resolve => setTimeout(resolve, 1000));
      setClans(mockClans);
      
      // Simular que el usuario pertenece al primer clan
      setUserClan(mockClans[0]);
    } catch (err) {
      setError('Error al cargar los clanes');
    } finally {
      setLoading(false);
    }
  };

  const joinClan = async (clanId: string) => {
    try {
      // En producción, esto sería una llamada a la API
      // await fetch(`/api/gamification/clans/${clanId}/join`, { method: 'POST' });
      
      setClans(prev => prev.map(clan => 
        clan.id === clanId 
          ? { ...clan, currentMembers: clan.currentMembers + 1, userIsMember: true, userCanJoin: false }
          : clan
      ));
      
      setShowJoinModal(false);
    } catch (err) {
      setError('Error al unirse al clan');
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'LEADER': return 'text-purple-600 bg-purple-100';
      case 'OFFICER': return 'text-blue-600 bg-blue-100';
      case 'MEMBER': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'LEADER': return <Crown className="w-4 h-4" />;
      case 'OFFICER': return <Shield className="w-4 h-4" />;
      case 'MEMBER': return <Users className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  const getChallengeTypeColor = (type: string) => {
    switch (type) {
      case 'DAILY': return 'text-blue-600 bg-blue-100';
      case 'WEEKLY': return 'text-green-600 bg-green-100';
      case 'MONTHLY': return 'text-purple-600 bg-purple-100';
      case 'SPECIAL': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredClans = clans.filter(clan => {
    if (filters.search && !clan.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
    if (filters.level !== 'all') {
      const level = parseInt(filters.level);
      if (clan.level < level) return false;
    }
    if (filters.status !== 'all') {
      if (filters.status === 'member' && !clan.userIsMember) return false;
      if (filters.status === 'public' && !clan.isPublic) return false;
    }
    return true;
  });

  const calculateLevelProgress = (experience: number, level: number) => {
    const baseExp = Math.pow(level, 2) * 1000;
    const nextLevelExp = Math.pow(level + 1, 2) * 1000;
    const expInLevel = experience - baseExp;
    const expNeeded = nextLevelExp - baseExp;
    return Math.min(100, (expInLevel / expNeeded) * 100);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Clanes</h1>
              <p className="text-gray-600">Únete a comunidades de aprendizaje y colabora con otros estudiantes</p>
            </div>
          </div>
          <Button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2"
            tabIndex={0}
            aria-label="Crear nuevo clan"
          >
            <Plus className="w-4 h-4" />
            <span>Crear Clan</span>
          </Button>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Building2 className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium">Total Clanes</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2">{clans.length}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium">Miembros Totales</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {clans.reduce((sum, clan) => sum + clan.currentMembers, 0)}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Trophy className="w-5 h-5 text-yellow-600" />
                <span className="text-sm font-medium">Competencias Ganadas</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {clans.reduce((sum, clan) => sum + clan.stats.competitionsWon, 0)}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium">Desafíos Completados</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {clans.reduce((sum, clan) => sum + clan.stats.challengesCompleted, 0)}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Clan del usuario */}
      {userClan && (
        <Card className="mb-8 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Crown className="w-5 h-5 text-purple-600" />
              <span>Tu Clan: {userClan.name}</span>
              <Badge className={getRoleColor(userClan.userRole || 'MEMBER')}>
                {userClan.userRole === 'LEADER' ? 'Líder' : 
                 userClan.userRole === 'OFFICER' ? 'Oficial' : 'Miembro'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Nivel del Clan</h4>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-bold text-purple-600">{userClan.level}</span>
                  <div className="flex-1">
                    <Progress 
                      value={calculateLevelProgress(userClan.experience, userClan.level)} 
                      className="h-2" 
                    />
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-1">{userClan.experience} exp</p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Miembros</h4>
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <span className="text-lg font-semibold">{userClan.currentMembers}/{userClan.maxMembers}</span>
                </div>
                <p className="text-sm text-gray-600">Miembros activos</p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Puntos Semanales</h4>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <span className="text-lg font-semibold">{userClan.stats.weeklyPoints}</span>
                </div>
                <p className="text-sm text-gray-600">Esta semana</p>
              </div>
            </div>
            
            <div className="mt-4 flex space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSelectedClan(userClan)}
                tabIndex={0}
                aria-label="Ver detalles del clan"
              >
                <Eye className="w-4 h-4 mr-2" />
                Ver Detalles
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                tabIndex={0}
                aria-label="Chat del clan"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Chat
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filtros */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar clanes..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  tabIndex={0}
                  aria-label="Buscar clanes"
                />
              </div>
            </div>
            
            <select
              value={filters.level}
              onChange={(e) => setFilters(prev => ({ ...prev, level: e.target.value }))}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              tabIndex={0}
              aria-label="Filtrar por nivel mínimo"
            >
              <option value="all">Cualquier nivel</option>
              <option value="1">Nivel 1+</option>
              <option value="3">Nivel 3+</option>
              <option value="5">Nivel 5+</option>
              <option value="8">Nivel 8+</option>
            </select>
            
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              tabIndex={0}
              aria-label="Filtrar por estado"
            >
              <option value="all">Todos</option>
              <option value="member">Mi clan</option>
              <option value="public">Públicos</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de clanes */}
      <div className="space-y-6">
        {filteredClans.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Building2 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron clanes</h3>
              <p className="text-gray-600">Intenta ajustar los filtros o crea tu propio clan</p>
            </CardContent>
          </Card>
        ) : (
          filteredClans.map((clan) => (
            <Card key={clan.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-blue-500 rounded-lg flex items-center justify-center">
                          <Building2 className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">{clan.name}</h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge className="text-xs bg-gray-100 text-gray-800">
                              [{clan.tag}]
                            </Badge>
                            <Badge className="text-xs bg-purple-100 text-purple-800">
                              Nivel {clan.level}
                            </Badge>
                            {!clan.isPublic && (
                              <Badge className="text-xs bg-orange-100 text-orange-800">
                                Privado
                              </Badge>
                            )}
                            {clan.userIsMember && (
                              <Badge className="text-xs bg-green-100 text-green-800">
                                Miembro
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mb-4">{clan.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {clan.currentMembers}/{clan.maxMembers} miembros
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Crown className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          Líder: {clan.leader.username}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Trophy className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {clan.stats.competitionsWon} victorias
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Target className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {clan.stats.challengesCompleted} desafíos
                        </span>
                      </div>
                    </div>

                    {/* Progreso del nivel */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Progreso al nivel {clan.level + 1}</span>
                        <span>{Math.round(calculateLevelProgress(clan.experience, clan.level))}%</span>
                      </div>
                      <Progress 
                        value={calculateLevelProgress(clan.experience, clan.level)} 
                        className="h-2" 
                      />
                    </div>

                    {/* Requisitos para unirse */}
                    {!clan.userIsMember && (
                      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Requisitos para unirse</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                          <div className="flex items-center space-x-2">
                            <Target className="w-4 h-4 text-gray-400" />
                            <span>Nivel {clan.joinRequirements.minLevel}+</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Star className="w-4 h-4 text-gray-400" />
                            <span>{clan.joinRequirements.minExperience} exp</span>
                          </div>
                          {clan.joinRequirements.requiredBadges.length > 0 && (
                            <div className="flex items-center space-x-2">
                              <Award className="w-4 h-4 text-gray-400" />
                              <span>{clan.joinRequirements.requiredBadges.length} badges</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col space-y-2 lg:ml-4">
                    {clan.userIsMember ? (
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => setSelectedClan(clan)}
                        tabIndex={0}
                        aria-label="Ver detalles del clan"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Ver Detalles
                      </Button>
                    ) : clan.userCanJoin ? (
                      <Button 
                        className="w-full"
                        onClick={() => {
                          setSelectedClan(clan);
                          setShowJoinModal(true);
                        }}
                        tabIndex={0}
                        aria-label="Unirse al clan"
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Unirse
                      </Button>
                    ) : (
                      <Button 
                        variant="outline" 
                        disabled 
                        className="w-full"
                        tabIndex={0}
                        aria-label="No cumple los requisitos para unirse"
                      >
                        <Lock className="w-4 h-4 mr-2" />
                        Requisitos No Cumplidos
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Modal de unirse al clan */}
      {showJoinModal && selectedClan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building2 className="w-5 h-5 text-purple-600" />
                <span>Unirse al Clan</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                ¿Estás seguro de que quieres unirte a "{selectedClan.name}"?
              </p>
              <div className="space-y-2 mb-4">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {selectedClan.currentMembers}/{selectedClan.maxMembers} miembros
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Crown className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    Líder: {selectedClan.leader.username}
                  </span>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowJoinModal(false)}
                  className="flex-1"
                  tabIndex={0}
                  aria-label="Cancelar unirse al clan"
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={() => joinClan(selectedClan.id)}
                  className="flex-1"
                  tabIndex={0}
                  aria-label="Confirmar unirse al clan"
                >
                  Confirmar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal de detalles del clan */}
      {selectedClan && !showJoinModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-6xl mx-4 max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Building2 className="w-5 h-5 text-purple-600" />
                  <span>{selectedClan.name}</span>
                  <Badge className="text-xs bg-gray-100 text-gray-800">
                    [{selectedClan.tag}]
                  </Badge>
                </CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedClan(null)}
                  tabIndex={0}
                  aria-label="Cerrar detalles del clan"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Tabs de navegación */}
              <div className="flex space-x-1 border-b mb-6">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={cn(
                    "px-4 py-2 text-sm font-medium rounded-t-lg transition-colors",
                    activeTab === 'overview' 
                      ? "bg-purple-100 text-purple-700 border-b-2 border-purple-700" 
                      : "text-gray-600 hover:text-gray-800"
                  )}
                  tabIndex={0}
                  aria-label="Ver resumen del clan"
                >
                  Resumen
                </button>
                <button
                  onClick={() => setActiveTab('members')}
                  className={cn(
                    "px-4 py-2 text-sm font-medium rounded-t-lg transition-colors",
                    activeTab === 'members' 
                      ? "bg-purple-100 text-purple-700 border-b-2 border-purple-700" 
                      : "text-gray-600 hover:text-gray-800"
                  )}
                  tabIndex={0}
                  aria-label="Ver miembros del clan"
                >
                  Miembros
                </button>
                <button
                  onClick={() => setActiveTab('challenges')}
                  className={cn(
                    "px-4 py-2 text-sm font-medium rounded-t-lg transition-colors",
                    activeTab === 'challenges' 
                      ? "bg-purple-100 text-purple-700 border-b-2 border-purple-700" 
                      : "text-gray-600 hover:text-gray-800"
                  )}
                  tabIndex={0}
                  aria-label="Ver desafíos del clan"
                >
                  Desafíos
                </button>
                <button
                  onClick={() => setActiveTab('achievements')}
                  className={cn(
                    "px-4 py-2 text-sm font-medium rounded-t-lg transition-colors",
                    activeTab === 'achievements' 
                      ? "bg-purple-100 text-purple-700 border-b-2 border-purple-700" 
                      : "text-gray-600 hover:text-gray-800"
                  )}
                  tabIndex={0}
                  aria-label="Ver logros del clan"
                >
                  Logros
                </button>
              </div>

              {/* Contenido de las tabs */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Descripción</h4>
                    <p className="text-gray-600">{selectedClan.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-4">Estadísticas</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Nivel</span>
                          <span className="font-medium">{selectedClan.level}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Experiencia</span>
                          <span className="font-medium">{selectedClan.experience}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Miembros</span>
                          <span className="font-medium">{selectedClan.currentMembers}/{selectedClan.maxMembers}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Puntos Totales</span>
                          <span className="font-medium">{selectedClan.stats.totalPoints}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Puntos Semanales</span>
                          <span className="font-medium">{selectedClan.stats.weeklyPoints}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Competencias Ganadas</span>
                          <span className="font-medium">{selectedClan.stats.competitionsWon}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 mb-4">Líder</h4>
                      <div className="p-4 bg-purple-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                            <Crown className="w-6 h-6 text-purple-600" />
                          </div>
                          <div>
                            <div className="font-medium">{selectedClan.leader.username}</div>
                            <div className="text-sm text-gray-600">Nivel {selectedClan.leader.level}</div>
                            <div className="text-sm text-gray-600">
                              Líder desde {new Date(selectedClan.leader.joinDate).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'members' && (
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Miembros del Clan</h4>
                  <div className="space-y-3">
                    {[selectedClan.leader, ...selectedClan.officers, ...selectedClan.members].map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            {getRoleIcon(member.role)}
                          </div>
                          <div>
                            <div className="font-medium">{member.username}</div>
                            <div className="text-sm text-gray-600">Nivel {member.level}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={getRoleColor(member.role)}>
                            {member.role === 'LEADER' ? 'Líder' : 
                             member.role === 'OFFICER' ? 'Oficial' : 'Miembro'}
                          </Badge>
                          <div className="text-sm text-gray-600 mt-1">
                            {member.contribution} contribución
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'challenges' && (
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Desafíos del Clan</h4>
                  {selectedClan.challenges.length === 0 ? (
                    <div className="text-center py-8 text-gray-600">
                      <Target className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No hay desafíos activos</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedClan.challenges.map((challenge) => (
                        <Card key={challenge.id}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="font-medium">{challenge.name}</h5>
                              <Badge className={getChallengeTypeColor(challenge.type)}>
                                {challenge.type}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-3">{challenge.description}</p>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Progreso</span>
                                <span>{challenge.progress}/{challenge.target}</span>
                              </div>
                              <Progress 
                                value={(challenge.progress / challenge.target) * 100} 
                                className="h-2" 
                              />
                              <div className="flex justify-between text-sm text-gray-600">
                                <span>Recompensa: {challenge.reward.value} {challenge.reward.type}</span>
                                <span>Expira: {new Date(challenge.expiresAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'achievements' && (
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Logros del Clan</h4>
                  {selectedClan.achievements.length === 0 ? (
                    <div className="text-center py-8 text-gray-600">
                      <Award className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No hay logros aún</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedClan.achievements.map((achievement) => (
                        <Card key={achievement.id}>
                          <CardContent className="p-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                                <Award className="w-5 h-5 text-yellow-600" />
                              </div>
                              <div>
                                <h5 className="font-medium">{achievement.name}</h5>
                                <p className="text-sm text-gray-600">{achievement.description}</p>
                                <div className="flex items-center space-x-2 mt-1">
                                  <span className="text-sm text-gray-500">
                                    {new Date(achievement.earnedAt).toLocaleDateString()}
                                  </span>
                                  <Badge className="text-xs bg-yellow-100 text-yellow-800">
                                    +{achievement.points} pts
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
