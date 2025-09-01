'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Users, 
  Crown, 
  Shield, 
  Target, 
  TrendingUp, 
  Award,
  Star,
  Zap,
  Calendar,
  MapPin,
  Plus,
  Settings,
  MessageSquare,
  Gift,
  Trophy,
  UserPlus,
  UserMinus,
  Flag,
  Heart,
  Activity,
  Search,
  Filter,
  RefreshCw
} from 'lucide-react';

interface ClanMember {
  id: string;
  username: string;
  avatar?: string;
  role: 'LEADER' | 'CO_LEADER' | 'ELDER' | 'MEMBER' | 'RECRUIT';
  level: number;
  experience: number;
  joinedAt: string;
  lastActive: string;
  contribution: number;
  badges: string[];
}

interface Clan {
  id: string;
  name: string;
  description: string;
  tag: string;
  level: number;
  experience: number;
  maxMembers: number;
  currentMembers: number;
  leader: {
    id: string;
    username: string;
    avatar?: string;
  };
  coLeaders: Array<{
    id: string;
    username: string;
    avatar?: string;
  }>;
  members: ClanMember[];
  achievements: Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
    earnedAt: string;
  }>;
  wars: Array<{
    id: string;
    name: string;
    status: 'PREPARATION' | 'BATTLE' | 'FINISHED';
    startDate: string;
    endDate: string;
    result?: 'WIN' | 'LOSS' | 'DRAW';
  }>;
  requirements: {
    minLevel: number;
    minTrophies: number;
    requiredBadges?: string[];
    approvalRequired: boolean;
  };
  stats: {
    totalWars: number;
    warsWon: number;
    averageLevel: number;
    totalExperience: number;
    weeklyActivity: number;
  };
  isUserMember: boolean;
  userRole?: 'LEADER' | 'CO_LEADER' | 'ELDER' | 'MEMBER' | 'RECRUIT';
  userContribution: number;
}

interface ClanSystemProps {
  userId: string;
  className?: string;
  refreshInterval?: number;
}

export const ClanSystem: React.FC<ClanSystemProps> = ({ 
  userId, 
  className = '',
  refreshInterval = 30000 
}) => {
  const [clans, setClans] = useState<Clan[]>([]);
  const [userClan, setUserClan] = useState<Clan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showCreateClan, setShowCreateClan] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState<string>('all');

  const loadClans = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/gamification/clans?userId=${userId}`);
      
      if (!response.ok) {
        throw new Error('Error cargando clanes');
      }

      const data = await response.json();
      setClans(data.clans || []);
      setUserClan(data.userClan || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const createClan = async (clanData: {
    name: string;
    description: string;
    tag: string;
    requirements: any;
  }) => {
    try {
      const response = await fetch('/api/gamification/clans/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...clanData, leaderId: userId })
      });

      if (response.ok) {
        await loadClans();
        setShowCreateClan(false);
      } else {
        throw new Error('Error al crear el clan');
      }
    } catch (err) {
      console.error('Error creating clan:', err);
    }
  };

  const joinClan = async (clanId: string) => {
    try {
      const response = await fetch('/api/gamification/clans/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clanId, userId })
      });

      if (response.ok) {
        await loadClans();
      } else {
        throw new Error('Error al unirse al clan');
      }
    } catch (err) {
      console.error('Error joining clan:', err);
    }
  };

  const leaveClan = async () => {
    if (!userClan) return;
    
    try {
      const response = await fetch('/api/gamification/clans/leave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clanId: userClan.id, userId })
      });

      if (response.ok) {
        await loadClans();
      } else {
        throw new Error('Error al salir del clan');
      }
    } catch (err) {
      console.error('Error leaving clan:', err);
    }
  };

  const promoteMember = async (memberId: string, newRole: string) => {
    if (!userClan) return;
    
    try {
      const response = await fetch('/api/gamification/clans/promote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clanId: userClan.id, memberId, newRole })
      });

      if (response.ok) {
        await loadClans();
      } else {
        throw new Error('Error al promover miembro');
      }
    } catch (err) {
      console.error('Error promoting member:', err);
    }
  };

  const kickMember = async (memberId: string) => {
    if (!userClan) return;
    
    try {
      const response = await fetch('/api/gamification/clans/kick', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clanId: userClan.id, memberId })
      });

      if (response.ok) {
        await loadClans();
      } else {
        throw new Error('Error al expulsar miembro');
      }
    } catch (err) {
      console.error('Error kicking member:', err);
    }
  };

  useEffect(() => {
    loadClans();
    
    const interval = setInterval(loadClans, refreshInterval);
    return () => clearInterval(interval);
  }, [loadClans, refreshInterval]);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'LEADER': return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'CO_LEADER': return <Shield className="w-4 h-4 text-blue-500" />;
      case 'ELDER': return <Star className="w-4 h-4 text-purple-500" />;
      case 'MEMBER': return <Users className="w-4 h-4 text-green-500" />;
      case 'RECRUIT': return <UserPlus className="w-4 h-4 text-gray-500" />;
      default: return <Users className="w-4 h-4 text-gray-500" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'LEADER': return 'bg-yellow-100 text-yellow-800';
      case 'CO_LEADER': return 'bg-blue-100 text-blue-800';
      case 'ELDER': return 'bg-purple-100 text-purple-800';
      case 'MEMBER': return 'bg-green-100 text-green-800';
      case 'RECRUIT': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'LEADER': return 'Líder';
      case 'CO_LEADER': return 'Co-líder';
      case 'ELDER': return 'Anciano';
      case 'MEMBER': return 'Miembro';
      case 'RECRUIT': return 'Recluta';
      default: return role;
    }
  };

  const canManageMembers = (userRole?: string) => {
    return userRole === 'LEADER' || userRole === 'CO_LEADER';
  };

  const canPromote = (userRole?: string, targetRole?: string) => {
    if (userRole === 'LEADER') return targetRole !== 'LEADER';
    if (userRole === 'CO_LEADER') return targetRole === 'RECRUIT' || targetRole === 'MEMBER';
    return false;
  };

  const filteredClans = clans.filter(clan => {
    const matchesSearch = clan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         clan.tag.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterLevel === 'all' || 
                         (filterLevel === 'low' && clan.level <= 5) ||
                         (filterLevel === 'medium' && clan.level > 5 && clan.level <= 10) ||
                         (filterLevel === 'high' && clan.level > 10);
    
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <p>Error: {error}</p>
            <Button onClick={loadClans} className="mt-4">
              <RefreshCw className="w-4 h-4 mr-2" />
              Reintentar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sistema de Clanes</h1>
          <p className="text-gray-600 mt-1">Únete a clanes y colabora con otros estudiantes</p>
        </div>
        <div className="flex space-x-2">
          {!userClan && (
            <Button onClick={() => setShowCreateClan(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Crear Clan
            </Button>
          )}
          <Button onClick={loadClans} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualizar
          </Button>
        </div>
      </div>

      {userClan ? (
        /* Vista del clan del usuario */
        <div className="space-y-6">
          {/* Información del clan */}
          <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                    <Flag className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{userClan.name}</h2>
                    <p className="text-blue-100">#{userClan.tag}</p>
                    <p className="text-blue-100">Nivel {userClan.level}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">{userClan.currentMembers}/{userClan.maxMembers}</div>
                  <p className="text-blue-100">Miembros</p>
                </div>
              </div>
              
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-2">
                  <span>Progreso al siguiente nivel</span>
                  <span>{Math.round((userClan.experience % 1000) / 10)}%</span>
                </div>
                <Progress value={(userClan.experience % 1000) / 10} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Tabs del clan */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Resumen</TabsTrigger>
              <TabsTrigger value="members">Miembros</TabsTrigger>
              <TabsTrigger value="wars">Guerras</TabsTrigger>
              <TabsTrigger value="achievements">Logros</TabsTrigger>
              <TabsTrigger value="settings">Configuración</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <Trophy className="w-8 h-8 mx-auto mb-2 text-yellow-600" />
                    <div className="text-2xl font-bold">{userClan.stats.warsWon}</div>
                    <p className="text-sm text-gray-600">Guerras Ganadas</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 text-center">
                    <Activity className="w-8 h-8 mx-auto mb-2 text-green-600" />
                    <div className="text-2xl font-bold">{userClan.stats.weeklyActivity}%</div>
                    <p className="text-sm text-gray-600">Actividad Semanal</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 text-center">
                    <TrendingUp className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                    <div className="text-2xl font-bold">{userClan.stats.averageLevel}</div>
                    <p className="text-sm text-gray-600">Nivel Promedio</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Tu Contribución</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-2">
                    <span>Puntos de contribución esta semana</span>
                    <span className="font-bold">{userClan.userContribution}</span>
                  </div>
                  <Progress value={userClan.userContribution} max={1000} className="h-2" />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="members" className="space-y-4">
              <div className="space-y-2">
                {userClan.members.map((member) => (
                  <Card key={member.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            {member.avatar ? (
                              <img src={member.avatar} alt={member.username} className="w-10 h-10 rounded-full" />
                            ) : (
                              <Users className="w-5 h-5 text-gray-500" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-semibold">{member.username}</span>
                              {getRoleIcon(member.role)}
                              <Badge className={getRoleColor(member.role)}>
                                {getRoleText(member.role)}
                              </Badge>
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <span>Nivel {member.level}</span>
                              <span>Contribución: {member.contribution}</span>
                              <span>Último activo: {new Date(member.lastActive).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        
                        {canManageMembers(userClan.userRole) && member.id !== userId && (
                          <div className="flex space-x-2">
                            {canPromote(userClan.userRole, member.role) && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => promoteMember(member.id, 'ELDER')}
                              >
                                Promover
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => kickMember(member.id)}
                            >
                              <UserMinus className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="wars" className="space-y-4">
              <div className="space-y-4">
                {userClan.wars.map((war) => (
                  <Card key={war.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Trophy className="w-5 h-5" />
                        <span>{war.name}</span>
                        <Badge className={
                          war.status === 'PREPARATION' ? 'bg-blue-100 text-blue-800' :
                          war.status === 'BATTLE' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }>
                          {war.status === 'PREPARATION' ? 'Preparación' :
                           war.status === 'BATTLE' ? 'Batalla' : 'Finalizada'}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span>Inicia: {new Date(war.startDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span>Termina: {new Date(war.endDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                      {war.result && (
                        <div className="mt-2">
                          <Badge className={
                            war.result === 'WIN' ? 'bg-green-100 text-green-800' :
                            war.result === 'LOSS' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }>
                            {war.result === 'WIN' ? 'Victoria' :
                             war.result === 'LOSS' ? 'Derrota' : 'Empate'}
                          </Badge>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="achievements" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userClan.achievements.map((achievement) => (
                  <Card key={achievement.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                          <Award className="w-6 h-6 text-yellow-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{achievement.name}</h3>
                          <p className="text-sm text-gray-600">{achievement.description}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(achievement.earnedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Configuración del Clan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Nivel mínimo requerido</label>
                      <p className="text-sm text-gray-600">{userClan.requirements.minLevel}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Trofeos mínimos</label>
                      <p className="text-sm text-gray-600">{userClan.requirements.minTrophies}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={userClan.requirements.approvalRequired}
                      disabled
                      className="rounded"
                    />
                    <label className="text-sm">Aprobación requerida para unirse</label>
                  </div>
                  {canManageMembers(userClan.userRole) && (
                    <Button>
                      <Settings className="w-4 h-4 mr-2" />
                      Editar Configuración
                    </Button>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      ) : (
        /* Vista de búsqueda de clanes */
        <div className="space-y-6">
          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar clanes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                aria-label="Buscar clanes"
              />
            </div>
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              aria-label="Filtrar por nivel"
            >
              <option value="all">Todos los niveles</option>
              <option value="low">Nivel 1-5</option>
              <option value="medium">Nivel 6-10</option>
              <option value="high">Nivel 11+</option>
            </select>
          </div>

          {/* Lista de clanes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredClans.map((clan) => (
              <Card key={clan.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <Flag className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{clan.name}</CardTitle>
                        <p className="text-gray-600">#{clan.tag}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge className="bg-blue-100 text-blue-800">
                            Nivel {clan.level}
                          </Badge>
                          <Badge className="bg-green-100 text-green-800">
                            {clan.currentMembers}/{clan.maxMembers} miembros
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-gray-600">{clan.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Crown className="w-4 h-4 text-gray-400" />
                      <span>Líder: {clan.leader.username}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Trophy className="w-4 h-4 text-gray-400" />
                      <span>{clan.stats.warsWon} guerras ganadas</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Requisitos</h4>
                    <div className="text-sm text-gray-600">
                      <p>Nivel mínimo: {clan.requirements.minLevel}</p>
                      <p>Trofeos mínimos: {clan.requirements.minTrophies}</p>
                      {clan.requirements.approvalRequired && (
                        <p className="text-orange-600">Aprobación requerida</p>
                      )}
                    </div>
                  </div>

                  <Button 
                    onClick={() => joinClan(clan.id)}
                    className="w-full"
                    disabled={clan.currentMembers >= clan.maxMembers}
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Unirse al Clan
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredClans.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-600">No se encontraron clanes</h3>
                <p className="text-gray-500">Intenta cambiar los filtros o crear tu propio clan</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Modal para crear clan */}
      {showCreateClan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Crear Nuevo Clan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nombre del Clan</label>
                <input
                  type="text"
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nombre del clan"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Tag del Clan</label>
                <input
                  type="text"
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="TAG"
                  maxLength={4}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Descripción</label>
                <textarea
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Descripción del clan"
                  rows={3}
                />
              </div>
              <div className="flex space-x-2">
                <Button 
                  onClick={() => setShowCreateClan(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button className="flex-1">
                  Crear Clan
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ClanSystem;
