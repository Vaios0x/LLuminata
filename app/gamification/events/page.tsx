'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Star, 
  Trophy, 
  Target, 
  TrendingUp,
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
  Shield as ShieldIcon,
  Video,
  Mic,
  Camera,
  MessageSquare,
  Share2,
  Bookmark,
  Bell,
  Play,
  Pause,
  Stop,
  ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Interfaces
interface Event {
  id: string;
  name: string;
  description: string;
  type: 'WORKSHOP' | 'WEBINAR' | 'COMPETITION' | 'CULTURAL' | 'SOCIAL' | 'EDUCATIONAL';
  status: 'UPCOMING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  startDate: string;
  endDate: string;
  location: string;
  isOnline: boolean;
  maxParticipants: number;
  currentParticipants: number;
  organizer: EventOrganizer;
  speakers: EventSpeaker[];
  agenda: EventAgendaItem[];
  rewards: EventReward[];
  requirements: {
    minLevel: number;
    minExperience: number;
    requiredBadges: string[];
    isPublic: boolean;
  };
  tags: string[];
  userIsRegistered: boolean;
  userCanRegister: boolean;
  userRole?: 'ORGANIZER' | 'SPEAKER' | 'PARTICIPANT' | 'NONE';
}

interface EventOrganizer {
  id: string;
  name: string;
  avatar?: string;
  role: string;
  organization: string;
}

interface EventSpeaker {
  id: string;
  name: string;
  avatar?: string;
  title: string;
  organization: string;
  bio: string;
  topics: string[];
}

interface EventAgendaItem {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  speaker?: EventSpeaker;
  type: 'PRESENTATION' | 'WORKSHOP' | 'BREAK' | 'NETWORKING' | 'Q&A';
}

interface EventReward {
  type: 'points' | 'badge' | 'achievement' | 'title' | 'feature_unlock';
  value: number | string;
  description: string;
  condition: string;
}

interface EventFilters {
  search: string;
  type: string;
  status: string;
  date: string;
  location: string;
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<EventFilters>({
    search: '',
    type: 'all',
    status: 'all',
    date: 'all',
    location: 'all'
  });
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'ongoing' | 'past' | 'my-events'>('upcoming');

  // Datos de ejemplo
  const mockEvents: Event[] = [
    {
      id: 'event_1',
      name: 'Festival de Idiomas Indígenas',
      description: 'Un evento especial para celebrar y aprender sobre las lenguas indígenas de México. Incluye talleres, presentaciones culturales y actividades interactivas.',
      type: 'CULTURAL',
      status: 'UPCOMING',
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000).toISOString(),
      location: 'Centro Cultural Maya, Mérida',
      isOnline: false,
      maxParticipants: 200,
      currentParticipants: 156,
      organizer: {
        id: 'org_1',
        name: 'María González',
        role: 'Directora Cultural',
        organization: 'Centro de Estudios Indígenas'
      },
      speakers: [
        {
          id: 'speaker_1',
          name: 'Dr. Carlos Méndez',
          title: 'Lingüista Especialista',
          organization: 'Universidad Nacional Autónoma de México',
          bio: 'Especialista en lenguas mayas con más de 20 años de experiencia en preservación cultural.',
          topics: ['Lenguas Mayas', 'Preservación Cultural', 'Educación Indígena']
        }
      ],
      agenda: [
        {
          id: 'agenda_1',
          title: 'Apertura y Bienvenida',
          description: 'Ceremonia de apertura con representantes indígenas',
          startTime: '09:00',
          endTime: '09:30',
          type: 'PRESENTATION'
        },
        {
          id: 'agenda_2',
          title: 'Taller de Lengua Maya',
          description: 'Aprende frases básicas en maya yucateco',
          startTime: '09:30',
          endTime: '11:00',
          speaker: {
            id: 'speaker_1',
            name: 'Dr. Carlos Méndez',
            title: 'Lingüista Especialista',
            organization: 'Universidad Nacional Autónoma de México',
            bio: 'Especialista en lenguas mayas con más de 20 años de experiencia en preservación cultural.',
            topics: ['Lenguas Mayas', 'Preservación Cultural', 'Educación Indígena']
          },
          type: 'WORKSHOP'
        }
      ],
      rewards: [
        {
          type: 'badge',
          value: 'badge_cultural_festival',
          description: 'Badge de Participante del Festival Cultural',
          condition: 'Asistir al evento completo'
        },
        {
          type: 'points',
          value: 150,
          description: '150 puntos de experiencia',
          condition: 'Participar en al menos 2 actividades'
        }
      ],
      requirements: {
        minLevel: 1,
        minExperience: 0,
        requiredBadges: [],
        isPublic: true
      },
      tags: ['Cultura', 'Idiomas', 'Maya', 'Preservación'],
      userIsRegistered: true,
      userCanRegister: false,
      userRole: 'PARTICIPANT'
    },
    {
      id: 'event_2',
      name: 'Webinar: Tecnología y Educación Indígena',
      description: 'Explora cómo la tecnología puede ser utilizada para preservar y promover las culturas indígenas en el contexto educativo moderno.',
      type: 'EDUCATIONAL',
      status: 'UPCOMING',
      startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
      location: 'Online - Zoom',
      isOnline: true,
      maxParticipants: 500,
      currentParticipants: 234,
      organizer: {
        id: 'org_2',
        name: 'Ana Rodríguez',
        role: 'Coordinadora de Tecnología Educativa',
        organization: 'Instituto de Tecnología Indígena'
      },
      speakers: [
        {
          id: 'speaker_2',
          name: 'Ing. Roberto Silva',
          title: 'Especialista en EdTech',
          organization: 'Tecnología para la Diversidad',
          bio: 'Pionero en el desarrollo de aplicaciones educativas para comunidades indígenas.',
          topics: ['Tecnología Educativa', 'Diversidad Cultural', 'Innovación Social']
        }
      ],
      agenda: [
        {
          id: 'agenda_3',
          title: 'Introducción a la Tecnología Educativa Indígena',
          description: 'Panorama general de las herramientas tecnológicas disponibles',
          startTime: '14:00',
          endTime: '15:00',
          speaker: {
            id: 'speaker_2',
            name: 'Ing. Roberto Silva',
            title: 'Especialista en EdTech',
            organization: 'Tecnología para la Diversidad',
            bio: 'Pionero en el desarrollo de aplicaciones educativas para comunidades indígenas.',
            topics: ['Tecnología Educativa', 'Diversidad Cultural', 'Innovación Social']
          },
          type: 'PRESENTATION'
        },
        {
          id: 'agenda_4',
          title: 'Sesión de Preguntas y Respuestas',
          description: 'Interactúa con los expertos',
          startTime: '15:00',
          endTime: '16:00',
          type: 'Q&A'
        }
      ],
      rewards: [
        {
          type: 'points',
          value: 75,
          description: '75 puntos de experiencia',
          condition: 'Asistir al webinar completo'
        }
      ],
      requirements: {
        minLevel: 2,
        minExperience: 100,
        requiredBadges: [],
        isPublic: true
      },
      tags: ['Tecnología', 'Educación', 'Webinar', 'Innovación'],
      userIsRegistered: false,
      userCanRegister: true,
      userRole: 'NONE'
    },
    {
      id: 'event_3',
      name: 'Competencia de Narración Oral Indígena',
      description: 'Una competencia única donde los participantes comparten historias y leyendas de sus comunidades indígenas. Celebra la tradición oral.',
      type: 'COMPETITION',
      status: 'ACTIVE',
      startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      location: 'Teatro Nacional Indígena, Ciudad de México',
      isOnline: true,
      maxParticipants: 50,
      currentParticipants: 32,
      organizer: {
        id: 'org_3',
        name: 'Luis Hernández',
        role: 'Director de Programas Culturales',
        organization: 'Fundación para la Preservación Cultural'
      },
      speakers: [],
      agenda: [
        {
          id: 'agenda_5',
          title: 'Ronda de Presentaciones',
          description: 'Los participantes presentan sus historias',
          startTime: '10:00',
          endTime: '16:00',
          type: 'PRESENTATION'
        }
      ],
      rewards: [
        {
          type: 'badge',
          value: 'badge_storyteller',
          description: 'Badge de Narrador Oral',
          condition: 'Participar en la competencia'
        },
        {
          type: 'title',
          value: 'title_guardian_stories',
          description: 'Título de Guardián de Historias',
          condition: 'Ganar la competencia'
        }
      ],
      requirements: {
        minLevel: 3,
        minExperience: 500,
        requiredBadges: ['badge_cultural_awareness'],
        isPublic: true
      },
      tags: ['Narración', 'Competencia', 'Tradición Oral', 'Cultura'],
      userIsRegistered: true,
      userCanRegister: false,
      userRole: 'PARTICIPANT'
    }
  ];

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      // En producción, esto sería una llamada a la API
      // const response = await fetch('/api/gamification/events');
      // const data = await response.json();
      
      // Simulando carga
      await new Promise(resolve => setTimeout(resolve, 1000));
      setEvents(mockEvents);
    } catch (err) {
      setError('Error al cargar los eventos');
    } finally {
      setLoading(false);
    }
  };

  const registerForEvent = async (eventId: string) => {
    try {
      // En producción, esto sería una llamada a la API
      // await fetch(`/api/gamification/events/${eventId}/register`, { method: 'POST' });
      
      setEvents(prev => prev.map(event => 
        event.id === eventId 
          ? { ...event, currentParticipants: event.currentParticipants + 1, userIsRegistered: true, userCanRegister: false }
          : event
      ));
      
      setShowRegisterModal(false);
    } catch (err) {
      setError('Error al registrarse en el evento');
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'WORKSHOP': return 'text-blue-600 bg-blue-100';
      case 'WEBINAR': return 'text-purple-600 bg-purple-100';
      case 'COMPETITION': return 'text-orange-600 bg-orange-100';
      case 'CULTURAL': return 'text-green-600 bg-green-100';
      case 'SOCIAL': return 'text-pink-600 bg-pink-100';
      case 'EDUCATIONAL': return 'text-indigo-600 bg-indigo-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'WORKSHOP': return <BookOpen className="w-4 h-4" />;
      case 'WEBINAR': return <Video className="w-4 h-4" />;
      case 'COMPETITION': return <Trophy className="w-4 h-4" />;
      case 'CULTURAL': return <Globe className="w-4 h-4" />;
      case 'SOCIAL': return <Users className="w-4 h-4" />;
      case 'EDUCATIONAL': return <Target className="w-4 h-4" />;
      default: return <Calendar className="w-4 h-4" />;
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

  const getAgendaTypeIcon = (type: string) => {
    switch (type) {
      case 'PRESENTATION': return <Mic className="w-4 h-4" />;
      case 'WORKSHOP': return <BookOpen className="w-4 h-4" />;
      case 'BREAK': return <Coffee className="w-4 h-4" />;
      case 'NETWORKING': return <Users className="w-4 h-4" />;
      case 'Q&A': return <MessageSquare className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const filteredEvents = events.filter(event => {
    if (filters.search && !event.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
    if (filters.type !== 'all' && event.type !== filters.type) return false;
    if (filters.status !== 'all' && event.status !== filters.status) return false;
    if (filters.location !== 'all') {
      if (filters.location === 'online' && !event.isOnline) return false;
      if (filters.location === 'offline' && event.isOnline) return false;
    }
    return true;
  });

  const getTimeRemaining = (startDate: string) => {
    const start = new Date(startDate);
    const now = new Date();
    const diff = start.getTime() - now.getTime();
    
    if (diff <= 0) return 'En curso';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `En ${days} días`;
    if (hours > 0) return `En ${hours} horas`;
    return 'Próximamente';
  };

  const formatEventDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-MX', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatEventTime = (date: string) => {
    return new Date(date).toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit'
    });
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
            <div className="p-3 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg">
              <Calendar className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Eventos</h1>
              <p className="text-gray-600">Participa en eventos culturales, educativos y sociales</p>
            </div>
          </div>
          <Button 
            onClick={() => setShowRegisterModal(true)}
            className="flex items-center space-x-2"
            tabIndex={0}
            aria-label="Crear nuevo evento"
          >
            <Plus className="w-4 h-4" />
            <span>Crear Evento</span>
          </Button>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium">Próximos</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {events.filter(e => e.status === 'UPCOMING').length}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Play className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium">En Curso</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {events.filter(e => e.status === 'ACTIVE').length}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium">Registrado</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {events.filter(e => e.userIsRegistered).length}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Trophy className="w-5 h-5 text-yellow-600" />
                <span className="text-sm font-medium">Completados</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {events.filter(e => e.status === 'COMPLETED').length}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tabs de navegación */}
      <div className="flex space-x-1 border-b mb-6">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={cn(
            "px-4 py-2 text-sm font-medium rounded-t-lg transition-colors",
            activeTab === 'upcoming' 
              ? "bg-blue-100 text-blue-700 border-b-2 border-blue-700" 
              : "text-gray-600 hover:text-gray-800"
          )}
          tabIndex={0}
          aria-label="Ver eventos próximos"
        >
          Próximos
        </button>
        <button
          onClick={() => setActiveTab('ongoing')}
          className={cn(
            "px-4 py-2 text-sm font-medium rounded-t-lg transition-colors",
            activeTab === 'ongoing' 
              ? "bg-blue-100 text-blue-700 border-b-2 border-blue-700" 
              : "text-gray-600 hover:text-gray-800"
          )}
          tabIndex={0}
          aria-label="Ver eventos en curso"
        >
          En Curso
        </button>
        <button
          onClick={() => setActiveTab('past')}
          className={cn(
            "px-4 py-2 text-sm font-medium rounded-t-lg transition-colors",
            activeTab === 'past' 
              ? "bg-blue-100 text-blue-700 border-b-2 border-blue-700" 
              : "text-gray-600 hover:text-gray-800"
          )}
          tabIndex={0}
          aria-label="Ver eventos pasados"
        >
          Pasados
        </button>
        <button
          onClick={() => setActiveTab('my-events')}
          className={cn(
            "px-4 py-2 text-sm font-medium rounded-t-lg transition-colors",
            activeTab === 'my-events' 
              ? "bg-blue-100 text-blue-700 border-b-2 border-blue-700" 
              : "text-gray-600 hover:text-gray-800"
          )}
          tabIndex={0}
          aria-label="Ver mis eventos"
        >
          Mis Eventos
        </button>
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
                  placeholder="Buscar eventos..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  tabIndex={0}
                  aria-label="Buscar eventos"
                />
              </div>
            </div>
            
            <select
              value={filters.type}
              onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              tabIndex={0}
              aria-label="Filtrar por tipo de evento"
            >
              <option value="all">Todos los tipos</option>
              <option value="WORKSHOP">Talleres</option>
              <option value="WEBINAR">Webinars</option>
              <option value="COMPETITION">Competencias</option>
              <option value="CULTURAL">Culturales</option>
              <option value="SOCIAL">Sociales</option>
              <option value="EDUCATIONAL">Educativos</option>
            </select>
            
            <select
              value={filters.location}
              onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              tabIndex={0}
              aria-label="Filtrar por ubicación"
            >
              <option value="all">Todas las ubicaciones</option>
              <option value="online">Online</option>
              <option value="offline">Presencial</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de eventos */}
      <div className="space-y-6">
        {filteredEvents.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron eventos</h3>
              <p className="text-gray-600">Intenta ajustar los filtros o vuelve más tarde</p>
            </CardContent>
          </Card>
        ) : (
          filteredEvents.map((event) => (
            <Card key={event.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg flex items-center justify-center">
                          {getEventTypeIcon(event.type)}
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">{event.name}</h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge className={cn("text-xs", getEventTypeColor(event.type))}>
                              {event.type === 'WORKSHOP' ? 'Taller' :
                               event.type === 'WEBINAR' ? 'Webinar' :
                               event.type === 'COMPETITION' ? 'Competencia' :
                               event.type === 'CULTURAL' ? 'Cultural' :
                               event.type === 'SOCIAL' ? 'Social' : 'Educativo'}
                            </Badge>
                            <Badge className={cn("text-xs", getStatusColor(event.status))}>
                              {event.status === 'ACTIVE' ? 'En Curso' : 
                               event.status === 'UPCOMING' ? 'Próximo' :
                               event.status === 'COMPLETED' ? 'Completado' : 'Cancelado'}
                            </Badge>
                            {event.isOnline && (
                              <Badge className="text-xs bg-purple-100 text-purple-800">
                                Online
                              </Badge>
                            )}
                            {event.userIsRegistered && (
                              <Badge className="text-xs bg-green-100 text-green-800">
                                Registrado
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mb-4">{event.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {formatEventDate(event.startDate)}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {formatEventTime(event.startDate)} - {formatEventTime(event.endDate)}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {event.location}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {event.currentParticipants}/{event.maxParticipants} participantes
                        </span>
                      </div>
                    </div>

                    {/* Progreso de participación */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Participación</span>
                        <span>{Math.round((event.currentParticipants / event.maxParticipants) * 100)}%</span>
                      </div>
                      <Progress 
                        value={(event.currentParticipants / event.maxParticipants) * 100} 
                        className="h-2" 
                      />
                    </div>

                    {/* Organizador */}
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium">{event.organizer.name}</div>
                          <div className="text-xs text-gray-600">{event.organizer.role} - {event.organizer.organization}</div>
                        </div>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {event.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-2 lg:ml-4">
                    {event.userIsRegistered ? (
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => setSelectedEvent(event)}
                        tabIndex={0}
                        aria-label="Ver detalles del evento"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Ver Detalles
                      </Button>
                    ) : event.userCanRegister ? (
                      <Button 
                        className="w-full"
                        onClick={() => {
                          setSelectedEvent(event);
                          setShowRegisterModal(true);
                        }}
                        tabIndex={0}
                        aria-label="Registrarse en el evento"
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Registrarse
                      </Button>
                    ) : (
                      <Button 
                        variant="outline" 
                        disabled 
                        className="w-full"
                        tabIndex={0}
                        aria-label="No cumple los requisitos para registrarse"
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

      {/* Modal de registro */}
      {showRegisterModal && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-green-600" />
                <span>Registrarse en el Evento</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                ¿Estás seguro de que quieres registrarte en "{selectedEvent.name}"?
              </p>
              <div className="space-y-2 mb-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {formatEventDate(selectedEvent.startDate)}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {selectedEvent.location}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {selectedEvent.currentParticipants}/{selectedEvent.maxParticipants} participantes
                  </span>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowRegisterModal(false)}
                  className="flex-1"
                  tabIndex={0}
                  aria-label="Cancelar registro"
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={() => registerForEvent(selectedEvent.id)}
                  className="flex-1"
                  tabIndex={0}
                  aria-label="Confirmar registro"
                >
                  Confirmar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal de detalles del evento */}
      {selectedEvent && !showRegisterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-6xl mx-4 max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-green-600" />
                  <span>{selectedEvent.name}</span>
                </CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedEvent(null)}
                  tabIndex={0}
                  aria-label="Cerrar detalles del evento"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Información general */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Descripción</h4>
                  <p className="text-gray-600">{selectedEvent.description}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-4">Información del Evento</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Fecha:</span>
                        <span className="text-sm font-medium">{formatEventDate(selectedEvent.startDate)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Horario:</span>
                        <span className="text-sm font-medium">
                          {formatEventTime(selectedEvent.startDate)} - {formatEventTime(selectedEvent.endDate)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Ubicación:</span>
                        <span className="text-sm font-medium">{selectedEvent.location}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Participantes:</span>
                        <span className="text-sm font-medium">
                          {selectedEvent.currentParticipants}/{selectedEvent.maxParticipants}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Organizador:</span>
                        <span className="text-sm font-medium">{selectedEvent.organizer.name}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-4">Recompensas</h4>
                    <div className="space-y-2">
                      {selectedEvent.rewards.map((reward, index) => (
                        <div key={index} className="p-3 bg-yellow-50 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <Award className="w-4 h-4 text-yellow-600" />
                            <span className="text-sm font-medium">{reward.description}</span>
                          </div>
                          <p className="text-xs text-gray-600 mt-1">{reward.condition}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Agenda */}
                {selectedEvent.agenda.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-4">Agenda</h4>
                    <div className="space-y-3">
                      {selectedEvent.agenda.map((item) => (
                        <div key={item.id} className="p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                {getAgendaTypeIcon(item.type)}
                              </div>
                              <div>
                                <h5 className="font-medium">{item.title}</h5>
                                <p className="text-sm text-gray-600">{item.description}</p>
                                {item.speaker && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    Por: {item.speaker.name} - {item.speaker.organization}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium">{item.startTime} - {item.endTime}</div>
                              <Badge className="text-xs mt-1">
                                {item.type === 'PRESENTATION' ? 'Presentación' :
                                 item.type === 'WORKSHOP' ? 'Taller' :
                                 item.type === 'BREAK' ? 'Descanso' :
                                 item.type === 'NETWORKING' ? 'Networking' : 'Preguntas'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Ponentes */}
                {selectedEvent.speakers.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-4">Ponentes</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedEvent.speakers.map((speaker) => (
                        <Card key={speaker.id}>
                          <CardContent className="p-4">
                            <div className="flex items-start space-x-3">
                              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                                <Mic className="w-6 h-6 text-purple-600" />
                              </div>
                              <div>
                                <h5 className="font-medium">{speaker.name}</h5>
                                <p className="text-sm text-gray-600">{speaker.title}</p>
                                <p className="text-sm text-gray-600">{speaker.organization}</p>
                                <p className="text-xs text-gray-500 mt-2">{speaker.bio}</p>
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {speaker.topics.map((topic) => (
                                    <Badge key={topic} variant="outline" className="text-xs">
                                      {topic}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
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

// Componente adicional para icono de café
const Coffee = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
