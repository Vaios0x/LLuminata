'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Trophy, 
  Users, 
  Clock, 
  Target, 
  TrendingUp, 
  Award,
  Crown,
  Medal,
  Star,
  Zap,
  Calendar,
  MapPin,
  Eye,
  EyeOff,
  RefreshCw,
  Filter,
  Search
} from 'lucide-react';

interface Competition {
  id: string;
  name: string;
  description: string;
  type: 'ACADEMIC' | 'CULTURAL' | 'CREATIVE' | 'COLLABORATIVE' | 'INDIVIDUAL';
  status: 'UPCOMING' | 'ACTIVE' | 'FINISHED' | 'CANCELLED';
  startDate: string;
  endDate: string;
  maxParticipants?: number;
  currentParticipants: number;
  rewards: {
    firstPlace: { type: string; value: number | string; description: string };
    secondPlace: { type: string; value: number | string; description: string };
    thirdPlace: { type: string; value: number | string; description: string };
    participation: { type: string; value: number | string; description: string };
  };
  criteria: {
    minLevel?: number;
    requiredBadges?: string[];
    maxAge?: number;
    minAge?: number;
  };
  leaderboard: Array<{
    userId: string;
    username: string;
    avatar?: string;
    score: number;
    rank: number;
    isCurrentUser: boolean;
  }>;
  userParticipation?: {
    joinedAt: string;
    score: number;
    rank?: number;
    isActive: boolean;
  };
}

interface CompetitionBoardProps {
  userId: string;
  className?: string;
  refreshInterval?: number;
}

export const CompetitionBoard: React.FC<CompetitionBoardProps> = ({ 
  userId, 
  className = '',
  refreshInterval = 30000 
}) => {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('active');
  const [showLeaderboard, setShowLeaderboard] = useState<Record<string, boolean>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  const loadCompetitions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/gamification/competitions?userId=${userId}`);
      
      if (!response.ok) {
        throw new Error('Error cargando competencias');
      }

      const data = await response.json();
      setCompetitions(data.competitions || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const joinCompetition = async (competitionId: string) => {
    try {
      const response = await fetch('/api/gamification/competitions/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ competitionId, userId })
      });

      if (response.ok) {
        await loadCompetitions();
      } else {
        throw new Error('Error al unirse a la competencia');
      }
    } catch (err) {
      console.error('Error joining competition:', err);
    }
  };

  const leaveCompetition = async (competitionId: string) => {
    try {
      const response = await fetch('/api/gamification/competitions/leave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ competitionId, userId })
      });

      if (response.ok) {
        await loadCompetitions();
      } else {
        throw new Error('Error al salir de la competencia');
      }
    } catch (err) {
      console.error('Error leaving competition:', err);
    }
  };

  const toggleLeaderboard = (competitionId: string) => {
    setShowLeaderboard(prev => ({
      ...prev,
      [competitionId]: !prev[competitionId]
    }));
  };

  useEffect(() => {
    loadCompetitions();
    
    const interval = setInterval(loadCompetitions, refreshInterval);
    return () => clearInterval(interval);
  }, [loadCompetitions, refreshInterval]);

  const getCompetitionTypeIcon = (type: string) => {
    switch (type) {
      case 'ACADEMIC': return <Target className="w-5 h-5" />;
      case 'CULTURAL': return <Star className="w-5 h-5" />;
      case 'CREATIVE': return <Zap className="w-5 h-5" />;
      case 'COLLABORATIVE': return <Users className="w-5 h-5" />;
      case 'INDIVIDUAL': return <Award className="w-5 h-5" />;
      default: return <Trophy className="w-5 h-5" />;
    }
  };

  const getCompetitionTypeColor = (type: string) => {
    switch (type) {
      case 'ACADEMIC': return 'bg-blue-100 text-blue-800';
      case 'CULTURAL': return 'bg-purple-100 text-purple-800';
      case 'CREATIVE': return 'bg-pink-100 text-pink-800';
      case 'COLLABORATIVE': return 'bg-green-100 text-green-800';
      case 'INDIVIDUAL': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'UPCOMING': return 'bg-blue-100 text-blue-800';
      case 'FINISHED': return 'bg-gray-100 text-gray-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'Activa';
      case 'UPCOMING': return 'Próxima';
      case 'FINISHED': return 'Finalizada';
      case 'CANCELLED': return 'Cancelada';
      default: return status;
    }
  };

  const formatTimeRemaining = (endDate: string) => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return 'Finalizada';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const filteredCompetitions = competitions.filter(competition => {
    const matchesSearch = competition.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         competition.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || competition.type === filterType;
    const matchesTab = activeTab === 'all' || 
                      (activeTab === 'active' && competition.status === 'ACTIVE') ||
                      (activeTab === 'upcoming' && competition.status === 'UPCOMING') ||
                      (activeTab === 'finished' && competition.status === 'FINISHED');
    
    return matchesSearch && matchesFilter && matchesTab;
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
            <Button onClick={loadCompetitions} className="mt-4">
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
          <h1 className="text-3xl font-bold">Tablero de Competencias</h1>
          <p className="text-gray-600 mt-1">Participa en competencias y demuestra tus habilidades</p>
        </div>
        <Button onClick={loadCompetitions} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Actualizar
        </Button>
      </div>

      {/* Filtros y búsqueda */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar competencias..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            aria-label="Buscar competencias"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          aria-label="Filtrar por tipo"
        >
          <option value="all">Todos los tipos</option>
          <option value="ACADEMIC">Académico</option>
          <option value="CULTURAL">Cultural</option>
          <option value="CREATIVE">Creativo</option>
          <option value="COLLABORATIVE">Colaborativo</option>
          <option value="INDIVIDUAL">Individual</option>
        </select>
      </div>

      {/* Tabs principales */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">Todas</TabsTrigger>
          <TabsTrigger value="active">Activas</TabsTrigger>
          <TabsTrigger value="upcoming">Próximas</TabsTrigger>
          <TabsTrigger value="finished">Finalizadas</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {filteredCompetitions.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Trophy className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-600">No hay competencias disponibles</h3>
                <p className="text-gray-500">Intenta cambiar los filtros o vuelve más tarde</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredCompetitions.map((competition) => (
                <Card key={competition.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        {getCompetitionTypeIcon(competition.type)}
                        <div>
                          <CardTitle className="text-lg">{competition.name}</CardTitle>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge className={getCompetitionTypeColor(competition.type)}>
                              {competition.type}
                            </Badge>
                            <Badge className={getStatusColor(competition.status)}>
                              {getStatusText(competition.status)}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleLeaderboard(competition.id)}
                        aria-label={`${showLeaderboard[competition.id] ? 'Ocultar' : 'Mostrar'} clasificación`}
                      >
                        {showLeaderboard[competition.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <p className="text-gray-600">{competition.description}</p>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>Finaliza: {formatTimeRemaining(competition.endDate)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span>{competition.currentParticipants} / {competition.maxParticipants || '∞'} participantes</span>
                      </div>
                    </div>

                    {/* Progreso de participación */}
                    {competition.userParticipation && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Tu puntuación: {competition.userParticipation.score}</span>
                          {competition.userParticipation.rank && (
                            <span>Posición: #{competition.userParticipation.rank}</span>
                          )}
                        </div>
                        <Progress 
                          value={competition.userParticipation.score} 
                          max={1000}
                          className="h-2"
                        />
                      </div>
                    )}

                    {/* Leaderboard */}
                    {showLeaderboard[competition.id] && (
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm">Clasificación</h4>
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          {competition.leaderboard.slice(0, 5).map((entry, index) => (
                            <div 
                              key={entry.userId}
                              className={`flex items-center justify-between p-2 rounded ${
                                entry.isCurrentUser ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
                              }`}
                            >
                              <div className="flex items-center space-x-2">
                                {index === 0 && <Crown className="w-4 h-4 text-yellow-500" />}
                                {index === 1 && <Medal className="w-4 h-4 text-gray-400" />}
                                {index === 2 && <Medal className="w-4 h-4 text-orange-500" />}
                                {index > 2 && <span className="w-4 h-4 text-center text-xs font-bold">#{entry.rank}</span>}
                                <span className="font-medium">{entry.username}</span>
                                {entry.isCurrentUser && <Badge className="bg-blue-100 text-blue-800 text-xs">Tú</Badge>}
                              </div>
                              <span className="font-bold">{entry.score}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Recompensas */}
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">Recompensas</h4>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center space-x-1">
                          <Crown className="w-3 h-3 text-yellow-500" />
                          <span>1º: {competition.rewards.firstPlace.value} {competition.rewards.firstPlace.type}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Medal className="w-3 h-3 text-gray-400" />
                          <span>2º: {competition.rewards.secondPlace.value} {competition.rewards.secondPlace.type}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Medal className="w-3 h-3 text-orange-500" />
                          <span>3º: {competition.rewards.thirdPlace.value} {competition.rewards.thirdPlace.type}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Award className="w-3 h-3 text-blue-500" />
                          <span>Participación: {competition.rewards.participation.value} {competition.rewards.participation.type}</span>
                        </div>
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex space-x-2">
                      {competition.status === 'ACTIVE' && !competition.userParticipation && (
                        <Button 
                          onClick={() => joinCompetition(competition.id)}
                          className="flex-1"
                          disabled={!!competition.maxParticipants && competition.currentParticipants >= competition.maxParticipants}
                        >
                          Unirse
                        </Button>
                      )}
                      {competition.status === 'UPCOMING' && !competition.userParticipation && (
                        <Button 
                          onClick={() => joinCompetition(competition.id)}
                          variant="outline"
                          className="flex-1"
                        >
                          Pre-inscribirse
                        </Button>
                      )}
                      {competition.userParticipation && competition.userParticipation.isActive && (
                        <Button 
                          onClick={() => leaveCompetition(competition.id)}
                          variant="outline"
                          className="flex-1"
                        >
                          Salir
                        </Button>
                      )}
                      <Button variant="ghost" size="sm">
                        Ver detalles
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CompetitionBoard;
