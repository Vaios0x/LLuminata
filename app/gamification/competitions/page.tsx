'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy, 
  Users, 
  Calendar, 
  Target, 
  Award, 
  Star, 
  Clock, 
  TrendingUp,
  Zap,
  Crown,
  Medal,
  Gift,
  Sparkles,
  Filter,
  Search,
  Plus,
  Eye,
  Play,
  Pause,
  CheckCircle,
  X,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Interfaces
interface Competition {
  id: string;
  name: string;
  description: string;
  type: 'ACADEMIC' | 'CULTURAL' | 'CREATIVE' | 'COLLABORATIVE' | 'INDIVIDUAL';
  status: 'UPCOMING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  startDate: string;
  endDate: string;
  maxParticipants?: number;
  currentParticipants: number;
  rewards: {
    firstPlace: RewardConfig;
    secondPlace: RewardConfig;
    thirdPlace: RewardConfig;
    participation: RewardConfig;
  };
  criteria: any;
  leaderboard?: LeaderboardEntry[];
  userRank?: number;
  userScore?: number;
  isParticipating: boolean;
  canJoin: boolean;
}

interface LeaderboardEntry {
  userId: string;
  username: string;
  avatar?: string;
  score: number;
  rank: number;
  badges: string[];
  level: number;
}

interface RewardConfig {
  type: 'points' | 'badge' | 'achievement' | 'title' | 'feature_unlock';
  value: number | string;
  description: string;
}

interface CompetitionFilters {
  status: string;
  type: string;
  search: string;
}

export default function CompetitionsPage() {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<CompetitionFilters>({
    status: 'all',
    type: 'all',
    search: ''
  });
  const [selectedCompetition, setSelectedCompetition] = useState<Competition | null>(null);
  const [showJoinModal, setShowJoinModal] = useState(false);

  // Datos de ejemplo
  const mockCompetitions: Competition[] = [
    {
      id: 'comp_1',
      name: 'Desafío Cultural Maya',
      description: 'Aprende sobre la cultura maya y compite con otros estudiantes en un desafío de conocimientos culturales.',
      type: 'CULTURAL',
      status: 'ACTIVE',
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      maxParticipants: 100,
      currentParticipants: 67,
      rewards: {
        firstPlace: { type: 'badge', value: 'badge_maya_master', description: 'Badge de Maestro Maya' },
        secondPlace: { type: 'points', value: 500, description: '500 puntos' },
        thirdPlace: { type: 'points', value: 250, description: '250 puntos' },
        participation: { type: 'points', value: 50, description: '50 puntos' }
      },
      criteria: { minLevel: 2, requiredBadges: ['badge_beginner'] },
      leaderboard: [
        { userId: 'user_1', username: 'María López', score: 850, rank: 1, badges: ['badge_expert'], level: 5 },
        { userId: 'user_2', username: 'Carlos Ruiz', score: 720, rank: 2, badges: ['badge_advanced'], level: 4 },
        { userId: 'user_3', username: 'Ana García', score: 680, rank: 3, badges: ['badge_consistent'], level: 3 }
      ],
      userRank: 15,
      userScore: 420,
      isParticipating: true,
      canJoin: false
    },
    {
      id: 'comp_2',
      name: 'Competencia de Idiomas Indígenas',
      description: 'Demuestra tu dominio de idiomas indígenas en esta competencia multilingüe.',
      type: 'ACADEMIC',
      status: 'UPCOMING',
      startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
      maxParticipants: 50,
      currentParticipants: 23,
      rewards: {
        firstPlace: { type: 'title', value: 'title_polyglot', description: 'Título de Políglota' },
        secondPlace: { type: 'badge', value: 'badge_language_expert', description: 'Badge de Experto en Idiomas' },
        thirdPlace: { type: 'points', value: 300, description: '300 puntos' },
        participation: { type: 'points', value: 75, description: '75 puntos' }
      },
      criteria: { minLevel: 3, requiredBadges: ['badge_consistent'] },
      isParticipating: false,
      canJoin: true
    },
    {
      id: 'comp_3',
      name: 'Creación de Contenido Cultural',
      description: 'Crea contenido original que promueva la diversidad cultural y compártelo con la comunidad.',
      type: 'CREATIVE',
      status: 'ACTIVE',
      startDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      maxParticipants: 75,
      currentParticipants: 45,
      rewards: {
        firstPlace: { type: 'feature_unlock', value: 'premium_content', description: 'Acceso a Contenido Premium' },
        secondPlace: { type: 'badge', value: 'badge_creator', description: 'Badge de Creador' },
        thirdPlace: { type: 'points', value: 200, description: '200 puntos' },
        participation: { type: 'points', value: 25, description: '25 puntos' }
      },
      criteria: { minLevel: 1, requiredBadges: [] },
      isParticipating: false,
      canJoin: true
    }
  ];

  useEffect(() => {
    loadCompetitions();
  }, []);

  const loadCompetitions = async () => {
    try {
      setLoading(true);
      // En producción, esto sería una llamada a la API
      // const response = await fetch('/api/gamification/competitions');
      // const data = await response.json();
      
      // Simulando carga
      await new Promise(resolve => setTimeout(resolve, 1000));
      setCompetitions(mockCompetitions);
    } catch (err) {
      setError('Error al cargar las competencias');
    } finally {
      setLoading(false);
    }
  };

  const joinCompetition = async (competitionId: string) => {
    try {
      // En producción, esto sería una llamada a la API
      // await fetch(`/api/gamification/competitions/${competitionId}/join`, { method: 'POST' });
      
      setCompetitions(prev => prev.map(comp => 
        comp.id === competitionId 
          ? { ...comp, isParticipating: true, canJoin: false, currentParticipants: comp.currentParticipants + 1 }
          : comp
      ));
      
      setShowJoinModal(false);
    } catch (err) {
      setError('Error al unirse a la competencia');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'text-green-600 bg-green-100 border-green-200';
      case 'UPCOMING': return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'COMPLETED': return 'text-gray-600 bg-gray-100 border-gray-200';
      case 'CANCELLED': return 'text-red-600 bg-red-100 border-red-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'ACADEMIC': return <Target className="w-4 h-4" />;
      case 'CULTURAL': return <Star className="w-4 h-4" />;
      case 'CREATIVE': return <Sparkles className="w-4 h-4" />;
      case 'COLLABORATIVE': return <Users className="w-4 h-4" />;
      case 'INDIVIDUAL': return <Award className="w-4 h-4" />;
      default: return <Trophy className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'ACADEMIC': return 'text-blue-600 bg-blue-100';
      case 'CULTURAL': return 'text-purple-600 bg-purple-100';
      case 'CREATIVE': return 'text-pink-600 bg-pink-100';
      case 'COLLABORATIVE': return 'text-green-600 bg-green-100';
      case 'INDIVIDUAL': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredCompetitions = competitions.filter(comp => {
    if (filters.status !== 'all' && comp.status !== filters.status) return false;
    if (filters.type !== 'all' && comp.type !== filters.type) return false;
    if (filters.search && !comp.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  const getTimeRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return 'Finalizada';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
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
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-lg">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Competencias</h1>
            <p className="text-gray-600">Participa en desafíos y demuestra tus habilidades</p>
          </div>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Play className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium">Activas</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {competitions.filter(c => c.status === 'ACTIVE').length}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium">Próximas</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {competitions.filter(c => c.status === 'UPCOMING').length}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium">Participando</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {competitions.filter(c => c.isParticipating).length}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-yellow-600" />
                <span className="text-sm font-medium">Ganadas</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2">2</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Filtros */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar competencias..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  tabIndex={0}
                  aria-label="Buscar competencias"
                />
              </div>
            </div>
            
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              tabIndex={0}
              aria-label="Filtrar por estado"
            >
              <option value="all">Todos los estados</option>
              <option value="UPCOMING">Próximas</option>
              <option value="ACTIVE">Activas</option>
              <option value="COMPLETED">Completadas</option>
              <option value="CANCELLED">Canceladas</option>
            </select>
            
            <select
              value={filters.type}
              onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              tabIndex={0}
              aria-label="Filtrar por tipo"
            >
              <option value="all">Todos los tipos</option>
              <option value="ACADEMIC">Académicas</option>
              <option value="CULTURAL">Culturales</option>
              <option value="CREATIVE">Creativas</option>
              <option value="COLLABORATIVE">Colaborativas</option>
              <option value="INDIVIDUAL">Individuales</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de competencias */}
      <div className="space-y-6">
        {filteredCompetitions.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Trophy className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron competencias</h3>
              <p className="text-gray-600">Intenta ajustar los filtros o vuelve más tarde</p>
            </CardContent>
          </Card>
        ) : (
          filteredCompetitions.map((competition) => (
            <Card key={competition.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                          {getTypeIcon(competition.type)}
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">{competition.name}</h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge className={cn("text-xs", getTypeColor(competition.type))}>
                              {competition.type}
                            </Badge>
                            <Badge className={cn("text-xs", getStatusColor(competition.status))}>
                              {competition.status === 'ACTIVE' ? 'Activa' : 
                               competition.status === 'UPCOMING' ? 'Próxima' :
                               competition.status === 'COMPLETED' ? 'Completada' : 'Cancelada'}
                            </Badge>
                            {competition.isParticipating && (
                              <Badge className="text-xs bg-green-100 text-green-800">
                                Participando
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mb-4">{competition.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {new Date(competition.startDate).toLocaleDateString()} - {new Date(competition.endDate).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {competition.currentParticipants}
                          {competition.maxParticipants && ` / ${competition.maxParticipants}`} participantes
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {getTimeRemaining(competition.endDate)}
                        </span>
                      </div>
                    </div>

                    {/* Progreso de participación */}
                    {competition.maxParticipants && (
                      <div className="mb-4">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Participación</span>
                          <span>{Math.round((competition.currentParticipants / competition.maxParticipants) * 100)}%</span>
                        </div>
                        <Progress 
                          value={(competition.currentParticipants / competition.maxParticipants) * 100} 
                          className="h-2" 
                        />
                      </div>
                    )}

                    {/* Recompensas */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Recompensas</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        <div className="flex items-center space-x-2 p-2 bg-yellow-50 rounded">
                          <Crown className="w-4 h-4 text-yellow-600" />
                          <span className="text-xs">1º: {competition.rewards.firstPlace.description}</span>
                        </div>
                        <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                          <Medal className="w-4 h-4 text-gray-600" />
                          <span className="text-xs">2º: {competition.rewards.secondPlace.description}</span>
                        </div>
                        <div className="flex items-center space-x-2 p-2 bg-orange-50 rounded">
                          <Award className="w-4 h-4 text-orange-600" />
                          <span className="text-xs">3º: {competition.rewards.thirdPlace.description}</span>
                        </div>
                        <div className="flex items-center space-x-2 p-2 bg-blue-50 rounded">
                          <Gift className="w-4 h-4 text-blue-600" />
                          <span className="text-xs">Participación: {competition.rewards.participation.description}</span>
                        </div>
                      </div>
                    </div>

                    {/* Posición del usuario */}
                    {competition.userRank && (
                      <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-blue-900">Tu posición</span>
                          <span className="text-lg font-bold text-blue-600">#{competition.userRank}</span>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-sm text-blue-700">Puntuación</span>
                          <span className="text-sm font-medium text-blue-600">{competition.userScore} pts</span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col space-y-2 lg:ml-4">
                    {competition.isParticipating ? (
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => setSelectedCompetition(competition)}
                        tabIndex={0}
                        aria-label="Ver detalles de la competencia"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Ver Detalles
                      </Button>
                    ) : competition.canJoin ? (
                      <Button 
                        className="w-full"
                        onClick={() => {
                          setSelectedCompetition(competition);
                          setShowJoinModal(true);
                        }}
                        tabIndex={0}
                        aria-label="Unirse a la competencia"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Unirse
                      </Button>
                    ) : (
                      <Button 
                        variant="outline" 
                        disabled 
                        className="w-full"
                        tabIndex={0}
                        aria-label="No se puede unir a esta competencia"
                      >
                        <X className="w-4 h-4 mr-2" />
                        No Disponible
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Modal de unirse a competencia */}
      {showJoinModal && selectedCompetition && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Trophy className="w-5 h-5 text-yellow-600" />
                <span>Unirse a Competencia</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                ¿Estás seguro de que quieres unirte a "{selectedCompetition.name}"?
              </p>
              <div className="space-y-2 mb-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    Finaliza: {new Date(selectedCompetition.endDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {selectedCompetition.currentParticipants} participantes
                  </span>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowJoinModal(false)}
                  className="flex-1"
                  tabIndex={0}
                  aria-label="Cancelar unirse a la competencia"
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={() => joinCompetition(selectedCompetition.id)}
                  className="flex-1"
                  tabIndex={0}
                  aria-label="Confirmar unirse a la competencia"
                >
                  Confirmar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal de detalles de competencia */}
      {selectedCompetition && !showJoinModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Trophy className="w-5 h-5 text-yellow-600" />
                  <span>{selectedCompetition.name}</span>
                </CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedCompetition(null)}
                  tabIndex={0}
                  aria-label="Cerrar detalles de la competencia"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Descripción</h4>
                  <p className="text-gray-600">{selectedCompetition.description}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Información</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Estado:</span>
                        <Badge className={getStatusColor(selectedCompetition.status)}>
                          {selectedCompetition.status}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tipo:</span>
                        <Badge className={getTypeColor(selectedCompetition.type)}>
                          {selectedCompetition.type}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Inicio:</span>
                        <span>{new Date(selectedCompetition.startDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Fin:</span>
                        <span>{new Date(selectedCompetition.endDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Participantes:</span>
                        <span>{selectedCompetition.currentParticipants}
                          {selectedCompetition.maxParticipants && ` / ${selectedCompetition.maxParticipants}`}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Recompensas</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                        <span className="text-sm">🥇 Primer Lugar</span>
                        <span className="text-sm font-medium">{selectedCompetition.rewards.firstPlace.description}</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm">🥈 Segundo Lugar</span>
                        <span className="text-sm font-medium">{selectedCompetition.rewards.secondPlace.description}</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-orange-50 rounded">
                        <span className="text-sm">🥉 Tercer Lugar</span>
                        <span className="text-sm font-medium">{selectedCompetition.rewards.thirdPlace.description}</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                        <span className="text-sm">🎁 Participación</span>
                        <span className="text-sm font-medium">{selectedCompetition.rewards.participation.description}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Leaderboard */}
                {selectedCompetition.leaderboard && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-4">Clasificación</h4>
                    <div className="space-y-2">
                      {selectedCompetition.leaderboard.map((entry, index) => (
                        <div 
                          key={entry.userId} 
                          className={cn(
                            "flex items-center justify-between p-3 rounded-lg",
                            index === 0 ? "bg-yellow-50 border border-yellow-200" :
                            index === 1 ? "bg-gray-50 border border-gray-200" :
                            index === 2 ? "bg-orange-50 border border-orange-200" :
                            "bg-white border border-gray-100"
                          )}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                              index === 0 ? "bg-yellow-500 text-white" :
                              index === 1 ? "bg-gray-500 text-white" :
                              index === 2 ? "bg-orange-500 text-white" :
                              "bg-blue-100 text-blue-600"
                            )}>
                              {index + 1}
                            </div>
                            <div>
                              <div className="font-medium">{entry.username}</div>
                              <div className="text-sm text-gray-600">Nivel {entry.level}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold">{entry.score} pts</div>
                            <div className="text-sm text-gray-600">#{entry.rank}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
