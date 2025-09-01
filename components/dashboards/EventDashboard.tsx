'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  Users, 
  Clock, 
  MapPin, 
  Star, 
  Award,
  BarChart3,
  Activity,
  Plus,
  Settings,
  MessageSquare,
  Trophy,
  CheckCircle,
  AlertCircle,
  Play,
  Pause,
  Target
} from 'lucide-react';

interface Event {
  id: string;
  title: string;
  description: string;
  type: 'workshop' | 'competition' | 'webinar' | 'meetup' | 'challenge' | 'celebration';
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
  startDate: Date;
  endDate: Date;
  location: string;
  isOnline: boolean;
  maxParticipants: number;
  currentParticipants: number;
  organizer: {
    id: string;
    name: string;
    avatar?: string;
  };
  categories: string[];
  tags: string[];
  requirements: string[];
  rewards: string[];
  agenda: EventAgendaItem[];
  participants: EventParticipant[];
  feedback: EventFeedback[];
}

interface EventAgendaItem {
  id: string;
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  speaker?: string;
  type: 'presentation' | 'workshop' | 'break' | 'activity' | 'q&a';
}

interface EventParticipant {
  id: string;
  userId: string;
  username: string;
  avatar?: string;
  status: 'registered' | 'attending' | 'completed' | 'no_show';
  registrationDate: Date;
  checkInTime?: Date;
  checkOutTime?: Date;
  feedback?: string;
  rating?: number;
}

interface EventFeedback {
  id: string;
  participantId: string;
  participantName: string;
  rating: number;
  comment: string;
  timestamp: Date;
  categories: {
    content: number;
    organization: number;
    speakers: number;
    venue: number;
  };
}

interface EventStats {
  totalEvents: number;
  activeEvents: number;
  completedEvents: number;
  totalParticipants: number;
  averageRating: number;
  totalFeedback: number;
  upcomingEvents: number;
  topEvents: {
    id: string;
    title: string;
    participants: number;
    rating: number;
    type: string;
  }[];
}

export default function EventDashboard() {
  const [events, setEvents] = useState<Event[]>([]);
  const [stats, setStats] = useState<EventStats>({
    totalEvents: 0,
    activeEvents: 0,
    completedEvents: 0,
    totalParticipants: 0,
    averageRating: 0,
    totalFeedback: 0,
    upcomingEvents: 0,
    topEvents: []
  });
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    loadEventData();
  }, []);

  const loadEventData = async () => {
    setLoading(true);
    try {
      // Simular carga de datos
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockEvents: Event[] = [
        {
          id: '1',
          title: 'Taller de Programación para Niños',
          description: 'Introducción a la programación básica usando Scratch',
          type: 'workshop',
          status: 'active',
          startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
          location: 'Centro Comunitario Digital',
          isOnline: false,
          maxParticipants: 30,
          currentParticipants: 25,
          organizer: {
            id: '1',
            name: 'María García',
            avatar: '/avatars/maria.jpg'
          },
          categories: ['Educación', 'Tecnología'],
          tags: ['programación', 'niños', 'scratch'],
          requirements: ['Edad 8-12 años', 'Conocimientos básicos de computadora'],
          rewards: ['Certificado de participación', '50 puntos de experiencia'],
          agenda: [
            {
              id: '1',
              title: 'Introducción a Scratch',
              description: 'Conceptos básicos de programación',
              startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
              endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
              speaker: 'María García',
              type: 'presentation'
            },
            {
              id: '2',
              title: 'Práctica Guiada',
              description: 'Creación de un proyecto simple',
              startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
              endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
              speaker: 'María García',
              type: 'workshop'
            }
          ],
          participants: [
            {
              id: '1',
              userId: 'user1',
              username: 'CarlosLópez',
              status: 'registered',
              registrationDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
            },
            {
              id: '2',
              userId: 'user2',
              username: 'AnaMartínez',
              status: 'registered',
              registrationDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
            }
          ],
          feedback: []
        },
        {
          id: '2',
          title: 'Webinar: Inteligencia Artificial en la Educación',
          description: 'Cómo la IA está transformando la educación moderna',
          type: 'webinar',
          status: 'upcoming',
          startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
          location: 'Zoom Meeting',
          isOnline: true,
          maxParticipants: 100,
          currentParticipants: 67,
          organizer: {
            id: '2',
            name: 'Dr. Luis Hernández',
            avatar: '/avatars/luis.jpg'
          },
          categories: ['Educación', 'Tecnología', 'IA'],
          tags: ['inteligencia artificial', 'educación', 'futuro'],
          requirements: ['Conexión a internet', 'Interés en educación'],
          rewards: ['Certificado de asistencia', 'Recursos adicionales'],
          agenda: [
            {
              id: '1',
              title: 'Presentación: IA en Educación',
              description: 'Estado actual y tendencias',
              startTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
              endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
              speaker: 'Dr. Luis Hernández',
              type: 'presentation'
            },
            {
              id: '2',
              title: 'Sesión de Preguntas y Respuestas',
              description: 'Interacción con los participantes',
              startTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
              endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
              speaker: 'Dr. Luis Hernández',
              type: 'q&a'
            }
          ],
          participants: [],
          feedback: []
        }
      ];

      setEvents(mockEvents);
      
      setStats({
        totalEvents: 24,
        activeEvents: 3,
        completedEvents: 18,
        totalParticipants: 1247,
        averageRating: 4.6,
        totalFeedback: 892,
        upcomingEvents: 3,
        topEvents: [
          {
            id: '1',
            title: 'Taller de Programación para Niños',
            participants: 25,
            rating: 4.8,
            type: 'workshop'
          },
          {
            id: '2',
            title: 'Webinar: IA en Educación',
            participants: 67,
            rating: 4.7,
            type: 'webinar'
          }
        ]
      });
    } catch (error) {
      console.error('Error cargando datos de eventos:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'workshop': return <Settings className="h-4 w-4" />;
      case 'competition': return <Trophy className="h-4 w-4" />;
      case 'webinar': return <MessageSquare className="h-4 w-4" />;
      case 'meetup': return <Users className="h-4 w-4" />;
      case 'challenge': return <Target className="h-4 w-4" />;
      case 'celebration': return <Award className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  const getAgendaIcon = (type: string) => {
    switch (type) {
      case 'presentation': return <BarChart3 className="h-4 w-4" />;
      case 'workshop': return <Settings className="h-4 w-4" />;
      case 'break': return <Pause className="h-4 w-4" />;
      case 'activity': return <Activity className="h-4 w-4" />;
      case 'q&a': return <MessageSquare className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-MX', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-MX', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const filteredEvents = events.filter(event => {
    if (filterType === 'all') return true;
    return event.type === filterType;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard de Eventos</h1>
          <p className="text-gray-600">Gestión y análisis de eventos y actividades</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Calendario
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Evento
          </Button>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eventos Activos</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeEvents}</div>
            <p className="text-xs text-muted-foreground">
              de {stats.totalEvents} totales
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Participantes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalParticipants.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              en todos los eventos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Calificación Promedio</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageRating}</div>
            <p className="text-xs text-muted-foreground">
              de {stats.totalFeedback} evaluaciones
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximos Eventos</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcomingEvents}</div>
            <p className="text-xs text-muted-foreground">
              programados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <div className="flex items-center space-x-2">
        <Button 
          variant={filterType === 'all' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setFilterType('all')}
        >
          Todos
        </Button>
        <Button 
          variant={filterType === 'workshop' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setFilterType('workshop')}
        >
          Talleres
        </Button>
        <Button 
          variant={filterType === 'webinar' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setFilterType('webinar')}
        >
          Webinars
        </Button>
        <Button 
          variant={filterType === 'competition' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setFilterType('competition')}
        >
          Competencias
        </Button>
      </div>

      {/* Tabs principales */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="events">Eventos</TabsTrigger>
          <TabsTrigger value="participants">Participantes</TabsTrigger>
          <TabsTrigger value="feedback">Evaluaciones</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top eventos */}
            <Card>
              <CardHeader>
                <CardTitle>Mejores Eventos</CardTitle>
                <CardDescription>Eventos con mayor participación y calificación</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.topEvents.map((event, index) => (
                    <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-semibold">{event.title}</div>
                          <div className="text-sm text-gray-500">{event.type}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{event.participants} participantes</div>
                        <div className="text-sm text-gray-500">⭐ {event.rating}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Estadísticas por tipo */}
            <Card>
              <CardHeader>
                <CardTitle>Eventos por Tipo</CardTitle>
                <CardDescription>Distribución de eventos por categoría</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Talleres</span>
                    <Badge variant="secondary">8 eventos</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Webinars</span>
                    <Badge variant="outline">6 eventos</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Competencias</span>
                    <Badge variant="secondary">5 eventos</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Meetups</span>
                    <Badge variant="outline">3 eventos</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Desafíos</span>
                    <Badge variant="secondary">2 eventos</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredEvents.map((event) => (
              <Card key={event.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(event.type)}
                      <CardTitle className="text-lg">{event.title}</CardTitle>
                    </div>
                    <Badge className={getStatusColor(event.status)}>
                      {event.status === 'upcoming' ? 'Próximo' : 
                       event.status === 'active' ? 'Activo' : 
                       event.status === 'completed' ? 'Completado' : 'Cancelado'}
                    </Badge>
                  </div>
                  <CardDescription>{event.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(event.startDate)}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>{formatTime(event.startDate)} - {formatTime(event.endDate)}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>{event.isOnline ? 'En línea' : event.location}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span>Participantes:</span>
                    <span>{event.currentParticipants}/{event.maxParticipants}</span>
                  </div>
                  <Progress 
                    value={(event.currentParticipants / event.maxParticipants) * 100} 
                    className="h-2" 
                  />
                  
                  <div className="flex items-center space-x-2">
                    {event.categories.map((category) => (
                      <Badge key={category} variant="outline">{category}</Badge>
                    ))}
                  </div>
                  
                  <div className="pt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => setSelectedEvent(event.id)}
                    >
                      Ver Detalles
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="participants" className="space-y-4">
          {selectedEvent && (
            <Card>
              <CardHeader>
                <CardTitle>Participantes - {events.find(e => e.id === selectedEvent)?.title}</CardTitle>
                <CardDescription>Lista de participantes registrados</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {events.find(e => e.id === selectedEvent)?.participants.map((participant) => (
                    <div key={participant.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">
                          {participant.username.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold">{participant.username}</div>
                          <div className="text-sm text-gray-500">
                            Registrado: {participant.registrationDate.toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant={
                            participant.status === 'registered' ? 'outline' :
                            participant.status === 'attending' ? 'default' :
                            participant.status === 'completed' ? 'secondary' : 'destructive'
                          }
                        >
                          {participant.status === 'registered' ? 'Registrado' :
                           participant.status === 'attending' ? 'Asistiendo' :
                           participant.status === 'completed' ? 'Completado' : 'No asistió'}
                        </Badge>
                        {participant.rating && (
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm">{participant.rating}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          
          {!selectedEvent && (
            <Card>
              <CardContent className="flex items-center justify-center h-32">
                <p className="text-gray-500">Selecciona un evento para ver sus participantes</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="feedback" className="space-y-4">
          {selectedEvent && (
            <Card>
              <CardHeader>
                <CardTitle>Evaluaciones - {events.find(e => e.id === selectedEvent)?.title}</CardTitle>
                <CardDescription>Comentarios y calificaciones de los participantes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {events.find(e => e.id === selectedEvent)?.feedback.map((feedback) => (
                    <div key={feedback.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">
                            {feedback.participantName.charAt(0)}
                          </div>
                          <div>
                            <div className="font-semibold">{feedback.participantName}</div>
                            <div className="text-sm text-gray-500">
                              {feedback.timestamp.toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="font-semibold">{feedback.rating}</span>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 mb-3">{feedback.comment}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Contenido:</span>
                          <div className="flex items-center space-x-1">
                            <Star className="h-3 w-3 text-yellow-500" />
                            <span>{feedback.categories.content}</span>
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500">Organización:</span>
                          <div className="flex items-center space-x-1">
                            <Star className="h-3 w-3 text-yellow-500" />
                            <span>{feedback.categories.organization}</span>
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500">Ponentes:</span>
                          <div className="flex items-center space-x-1">
                            <Star className="h-3 w-3 text-yellow-500" />
                            <span>{feedback.categories.speakers}</span>
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500">Lugar:</span>
                          <div className="flex items-center space-x-1">
                            <Star className="h-3 w-3 text-yellow-500" />
                            <span>{feedback.categories.venue}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          
          {!selectedEvent && (
            <Card>
              <CardContent className="flex items-center justify-center h-32">
                <p className="text-gray-500">Selecciona un evento para ver sus evaluaciones</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
