'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Calendar, 
  Clock, 
  Star, 
  Gift, 
  Trophy, 
  Users, 
  Target,
  TrendingUp,
  Award,
  Zap,
  Heart,
  MapPin,
  Bell,
  BellOff,
  Plus,
  Filter,
  Search,
  RefreshCw,
  Play,
  Pause,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react';

interface EventReward {
  type: 'points' | 'badge' | 'achievement' | 'title' | 'feature_unlock' | 'custom';
  value: number | string;
  description: string;
  icon?: string;
}

interface EventParticipant {
  id: string;
  username: string;
  avatar?: string;
  progress: number;
  rank?: number;
  joinedAt: string;
}

interface GamificationEvent {
  id: string;
  name: string;
  description: string;
  type: 'SEASONAL' | 'SPECIAL' | 'CHALLENGE' | 'TOURNAMENT' | 'CULTURAL' | 'COMMUNITY';
  status: 'UPCOMING' | 'ACTIVE' | 'FINISHED' | 'CANCELLED';
  startDate: string;
  endDate: string;
  registrationDeadline?: string;
  maxParticipants?: number;
  currentParticipants: number;
  rewards: {
    participation: EventReward;
    milestones: EventReward[];
    topRewards: EventReward[];
  };
  requirements: {
    minLevel?: number;
    requiredBadges?: string[];
    maxAge?: number;
    minAge?: number;
    culturalBackground?: string[];
  };
  progress: {
    current: number;
    target: number;
    unit: string;
  };
  participants: EventParticipant[];
  isUserParticipating: boolean;
  userProgress?: {
    current: number;
    target: number;
    rank?: number;
    rewardsEarned: string[];
  };
  features: {
    hasLeaderboard: boolean;
    hasMilestones: boolean;
    hasTeamMode: boolean;
    hasCulturalContent: boolean;
  };
  culturalContent?: {
    language: string;
    region: string;
    traditions: string[];
    activities: string[];
  };
}

interface EventCalendarProps {
  userId: string;
  className?: string;
  refreshInterval?: number;
}

export const EventCalendar: React.FC<EventCalendarProps> = ({ 
  userId, 
  className = '',
  refreshInterval = 30000 
}) => {
  const [events, setEvents] = useState<GamificationEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [showEventDetails, setShowEventDetails] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Record<string, boolean>>({});

  const loadEvents = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/gamification/events?userId=${userId}`);
      
      if (!response.ok) {
        throw new Error('Error cargando eventos');
      }

      const data = await response.json();
      setEvents(data.events || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const joinEvent = async (eventId: string) => {
    try {
      const response = await fetch('/api/gamification/events/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, userId })
      });

      if (response.ok) {
        await loadEvents();
      } else {
        throw new Error('Error al unirse al evento');
      }
    } catch (err) {
      console.error('Error joining event:', err);
    }
  };

  const leaveEvent = async (eventId: string) => {
    try {
      const response = await fetch('/api/gamification/events/leave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, userId })
      });

      if (response.ok) {
        await loadEvents();
      } else {
        throw new Error('Error al salir del evento');
      }
    } catch (err) {
      console.error('Error leaving event:', err);
    }
  };

  const toggleNotification = async (eventId: string) => {
    try {
      const response = await fetch('/api/gamification/events/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, userId, enabled: !notifications[eventId] })
      });

      if (response.ok) {
        setNotifications(prev => ({
          ...prev,
          [eventId]: !prev[eventId]
        }));
      }
    } catch (err) {
      console.error('Error toggling notification:', err);
    }
  };

  useEffect(() => {
    loadEvents();
    
    const interval = setInterval(loadEvents, refreshInterval);
    return () => clearInterval(interval);
  }, [loadEvents, refreshInterval]);

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'SEASONAL': return <Calendar className="w-5 h-5" />;
      case 'SPECIAL': return <Star className="w-5 h-5" />;
      case 'CHALLENGE': return <Target className="w-5 h-5" />;
      case 'TOURNAMENT': return <Trophy className="w-5 h-5" />;
      case 'CULTURAL': return <Heart className="w-5 h-5" />;
      case 'COMMUNITY': return <Users className="w-5 h-5" />;
      default: return <Zap className="w-5 h-5" />;
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'SEASONAL': return 'bg-green-100 text-green-800';
      case 'SPECIAL': return 'bg-purple-100 text-purple-800';
      case 'CHALLENGE': return 'bg-orange-100 text-orange-800';
      case 'TOURNAMENT': return 'bg-yellow-100 text-yellow-800';
      case 'CULTURAL': return 'bg-pink-100 text-pink-800';
      case 'COMMUNITY': return 'bg-blue-100 text-blue-800';
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
      case 'ACTIVE': return 'Activo';
      case 'UPCOMING': return 'Próximo';
      case 'FINISHED': return 'Finalizado';
      case 'CANCELLED': return 'Cancelado';
      default: return status;
    }
  };

  const formatTimeRemaining = (endDate: string) => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return 'Finalizado';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const formatTimeUntilStart = (startDate: string) => {
    const now = new Date();
    const start = new Date(startDate);
    const diff = start.getTime() - now.getTime();
    
    if (diff <= 0) return 'Iniciado';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `Inicia en ${days}d ${hours}h`;
    if (hours > 0) return `Inicia en ${hours}h`;
    return 'Inicia pronto';
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || event.type === filterType;
    const matchesTab = activeTab === 'all' || 
                      (activeTab === 'upcoming' && event.status === 'UPCOMING') ||
                      (activeTab === 'active' && event.status === 'ACTIVE') ||
                      (activeTab === 'finished' && event.status === 'FINISHED');
    
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
            <Button onClick={loadEvents} className="mt-4">
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
          <h1 className="text-3xl font-bold">Calendario de Eventos</h1>
          <p className="text-gray-600 mt-1">Participa en eventos especiales y temporales</p>
        </div>
        <Button onClick={loadEvents} variant="outline">
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
            placeholder="Buscar eventos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            aria-label="Buscar eventos"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          aria-label="Filtrar por tipo"
        >
          <option value="all">Todos los tipos</option>
          <option value="SEASONAL">Estacional</option>
          <option value="SPECIAL">Especial</option>
          <option value="CHALLENGE">Desafío</option>
          <option value="TOURNAMENT">Torneo</option>
          <option value="CULTURAL">Cultural</option>
          <option value="COMMUNITY">Comunidad</option>
        </select>
      </div>

      {/* Tabs principales */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="upcoming">Próximos</TabsTrigger>
          <TabsTrigger value="active">Activos</TabsTrigger>
          <TabsTrigger value="finished">Finalizados</TabsTrigger>
          <TabsTrigger value="all">Todos</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {filteredEvents.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Calendar className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-600">No hay eventos disponibles</h3>
                <p className="text-gray-500">Intenta cambiar los filtros o vuelve más tarde</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredEvents.map((event) => (
                <Card key={event.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        {getEventTypeIcon(event.type)}
                        <div>
                          <CardTitle className="text-lg">{event.name}</CardTitle>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge className={getEventTypeColor(event.type)}>
                              {event.type}
                            </Badge>
                            <Badge className={getStatusColor(event.status)}>
                              {getStatusText(event.status)}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleNotification(event.id)}
                          aria-label={`${notifications[event.id] ? 'Desactivar' : 'Activar'} notificaciones`}
                        >
                          {notifications[event.id] ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowEventDetails(showEventDetails === event.id ? null : event.id)}
                          aria-label="Ver detalles del evento"
                        >
                          <Info className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <p className="text-gray-600">{event.description}</p>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>
                          {event.status === 'UPCOMING' 
                            ? formatTimeUntilStart(event.startDate)
                            : `Finaliza: ${formatTimeRemaining(event.endDate)}`
                          }
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span>{event.currentParticipants} / {event.maxParticipants || '∞'} participantes</span>
                      </div>
                    </div>

                    {/* Progreso del usuario */}
                    {event.userProgress && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Tu progreso: {event.userProgress.current} / {event.userProgress.target} {event.progress.unit}</span>
                          {event.userProgress.rank && (
                            <span>Posición: #{event.userProgress.rank}</span>
                          )}
                        </div>
                        <Progress 
                          value={(event.userProgress.current / event.userProgress.target) * 100}
                          className="h-2"
                        />
                      </div>
                    )}

                    {/* Detalles expandidos */}
                    {showEventDetails === event.id && (
                      <div className="space-y-4 border-t pt-4">
                        {/* Recompensas */}
                        <div className="space-y-2">
                          <h4 className="font-semibold text-sm">Recompensas</h4>
                          <div className="grid grid-cols-1 gap-2">
                            <div className="flex items-center space-x-2 text-sm">
                              <Gift className="w-4 h-4 text-green-500" />
                              <span>Participación: {event.rewards.participation.value} {event.rewards.participation.type}</span>
                            </div>
                            {event.rewards.milestones.map((milestone, index) => (
                              <div key={index} className="flex items-center space-x-2 text-sm">
                                <Award className="w-4 h-4 text-blue-500" />
                                <span>Hito {index + 1}: {milestone.value} {milestone.type}</span>
                              </div>
                            ))}
                            {event.rewards.topRewards.map((reward, index) => (
                              <div key={index} className="flex items-center space-x-2 text-sm">
                                <Trophy className="w-4 h-4 text-yellow-500" />
                                <span>Top {index + 1}: {reward.value} {reward.type}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Contenido cultural */}
                        {event.culturalContent && (
                          <div className="space-y-2">
                            <h4 className="font-semibold text-sm">Contenido Cultural</h4>
                            <div className="text-sm text-gray-600">
                              <p>Región: {event.culturalContent.region}</p>
                              <p>Idioma: {event.culturalContent.language}</p>
                              <div className="mt-2">
                                <p className="font-medium">Tradiciones:</p>
                                <ul className="list-disc list-inside ml-2">
                                  {event.culturalContent.traditions.map((tradition, index) => (
                                    <li key={index}>{tradition}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Requisitos */}
                        <div className="space-y-2">
                          <h4 className="font-semibold text-sm">Requisitos</h4>
                          <div className="text-sm text-gray-600">
                            {event.requirements.minLevel && (
                              <p>Nivel mínimo: {event.requirements.minLevel}</p>
                            )}
                            {event.requirements.minAge && (
                              <p>Edad mínima: {event.requirements.minAge} años</p>
                            )}
                            {event.requirements.maxAge && (
                              <p>Edad máxima: {event.requirements.maxAge} años</p>
                            )}
                            {event.requirements.requiredBadges && event.requirements.requiredBadges.length > 0 && (
                              <p>Badges requeridos: {event.requirements.requiredBadges.join(', ')}</p>
                            )}
                          </div>
                        </div>

                        {/* Características */}
                        <div className="space-y-2">
                          <h4 className="font-semibold text-sm">Características</h4>
                          <div className="flex flex-wrap gap-2">
                            {event.features.hasLeaderboard && (
                              <Badge className="bg-blue-100 text-blue-800">Clasificación</Badge>
                            )}
                            {event.features.hasMilestones && (
                              <Badge className="bg-green-100 text-green-800">Hitos</Badge>
                            )}
                            {event.features.hasTeamMode && (
                              <Badge className="bg-purple-100 text-purple-800">Equipos</Badge>
                            )}
                            {event.features.hasCulturalContent && (
                              <Badge className="bg-pink-100 text-pink-800">Cultural</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Acciones */}
                    <div className="flex space-x-2">
                      {event.status === 'ACTIVE' && !event.isUserParticipating && (
                        <Button 
                          onClick={() => joinEvent(event.id)}
                          className="flex-1"
                          disabled={event.maxParticipants && event.currentParticipants >= event.maxParticipants}
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Participar
                        </Button>
                      )}
                      {event.status === 'UPCOMING' && !event.isUserParticipating && (
                        <Button 
                          onClick={() => joinEvent(event.id)}
                          variant="outline"
                          className="flex-1"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Pre-inscribirse
                        </Button>
                      )}
                      {event.isUserParticipating && event.status === 'ACTIVE' && (
                        <Button 
                          onClick={() => leaveEvent(event.id)}
                          variant="outline"
                          className="flex-1"
                        >
                          <Pause className="w-4 h-4 mr-2" />
                          Salir
                        </Button>
                      )}
                      {event.isUserParticipating && event.status === 'FINISHED' && (
                        <div className="flex items-center space-x-2 text-green-600">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-sm">Completado</span>
                        </div>
                      )}
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

export default EventCalendar;
