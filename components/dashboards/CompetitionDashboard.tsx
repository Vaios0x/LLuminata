'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Trophy, 
  Users, 
  Target, 
  TrendingUp, 
  Star, 
  Award,
  Calendar,
  BarChart3,
  Activity,
  Zap,
  Clock,
  Medal,
  Crown,
  Flag,
  User
} from 'lucide-react';

interface Competition {
  id: string;
  name: string;
  description: string;
  type: 'individual' | 'team' | 'clan';
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
  startDate: Date;
  endDate: Date;
  participants: number;
  maxParticipants: number;
  prize: string;
  rules: string[];
  categories: string[];
  leaderboard: CompetitionEntry[];
}

interface CompetitionEntry {
  id: string;
  userId: string;
  username: string;
  avatar?: string;
  score: number;
  rank: number;
  completedTasks: number;
  totalTasks: number;
  timeSpent: number;
  accuracy: number;
  joinedAt: Date;
  lastActivity: Date;
}

interface CompetitionStats {
  totalCompetitions: number;
  activeCompetitions: number;
  totalParticipants: number;
  averageParticipants: number;
  completionRate: number;
  averageScore: number;
  topPerformers: CompetitionEntry[];
  recentWinners: {
    id: string;
    username: string;
    competitionName: string;
    score: number;
    wonAt: Date;
  }[];
}

export default function CompetitionDashboard() {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [stats, setStats] = useState<CompetitionStats>({
    totalCompetitions: 0,
    activeCompetitions: 0,
    totalParticipants: 0,
    averageParticipants: 0,
    completionRate: 0,
    averageScore: 0,
    topPerformers: [],
    recentWinners: []
  });
  const [loading, setLoading] = useState(true);
  const [selectedCompetition, setSelectedCompetition] = useState<string | null>(null);

  useEffect(() => {
    loadCompetitionData();
  }, []);

  const loadCompetitionData = async () => {
    setLoading(true);
    try {
      // Simular carga de datos
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockCompetitions: Competition[] = [
        {
          id: '1',
          name: 'Desafío de Matemáticas',
          description: 'Competencia de resolución de problemas matemáticos',
          type: 'individual',
          status: 'active',
          startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          participants: 156,
          maxParticipants: 200,
          prize: '500 puntos + Insignia de Matemático',
          rules: [
            'Tiempo límite de 30 minutos por problema',
            'No se permite el uso de calculadoras',
            'Debe mostrar el proceso de resolución'
          ],
          categories: ['Matemáticas', 'Lógica'],
          leaderboard: [
            {
              id: '1',
              userId: 'user1',
              username: 'MaríaGarcía',
              score: 95,
              rank: 1,
              completedTasks: 10,
              totalTasks: 10,
              timeSpent: 25,
              accuracy: 95,
              joinedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
              lastActivity: new Date()
            },
            {
              id: '2',
              userId: 'user2',
              username: 'CarlosLópez',
              score: 92,
              rank: 2,
              completedTasks: 10,
              totalTasks: 10,
              timeSpent: 28,
              accuracy: 92,
              joinedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
              lastActivity: new Date()
            }
          ]
        },
        {
          id: '2',
          name: 'Torneo de Ciencias',
          description: 'Competencia por equipos en ciencias naturales',
          type: 'team',
          status: 'upcoming',
          startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          participants: 45,
          maxParticipants: 100,
          prize: '1000 puntos + Trofeo de Ciencias',
          rules: [
            'Equipos de 3-5 personas',
            'Presentación de proyecto final',
            'Evaluación por jurado'
          ],
          categories: ['Ciencias', 'Investigación'],
          leaderboard: []
        }
      ];

      setCompetitions(mockCompetitions);
      
      setStats({
        totalCompetitions: 12,
        activeCompetitions: 3,
        totalParticipants: 1247,
        averageParticipants: 104,
        completionRate: 78.5,
        averageScore: 82.3,
        topPerformers: mockCompetitions[0].leaderboard.slice(0, 5),
        recentWinners: [
          {
            id: '1',
            username: 'AnaMartínez',
            competitionName: 'Desafío de Historia',
            score: 98,
            wonAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          },
          {
            id: '2',
            username: 'LuisHernández',
            competitionName: 'Torneo de Literatura',
            score: 96,
            wonAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
          }
        ]
      });
    } catch (error) {
      console.error('Error cargando datos de competencias:', error);
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
      case 'individual': return <User className="h-4 w-4" />;
      case 'team': return <Users className="h-4 w-4" />;
      case 'clan': return <Flag className="h-4 w-4" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  const formatTimeSpent = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

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
          <h1 className="text-3xl font-bold text-gray-900">Dashboard de Competencias</h1>
          <p className="text-gray-600">Gestión y análisis de competencias y torneos</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Calendario
          </Button>
          <Button size="sm">
            <Trophy className="h-4 w-4 mr-2" />
            Nueva Competencia
          </Button>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Competencias Activas</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeCompetitions}</div>
            <p className="text-xs text-muted-foreground">
              de {stats.totalCompetitions} totales
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
              Promedio: {stats.averageParticipants} por competencia
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Finalización</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completionRate}%</div>
            <Progress value={stats.completionRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Puntuación Promedio</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageScore}</div>
            <p className="text-xs text-muted-foreground">
              de 100 puntos posibles
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs principales */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="competitions">Competencias</TabsTrigger>
          <TabsTrigger value="leaderboard">Clasificaciones</TabsTrigger>
          <TabsTrigger value="winners">Ganadores</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico de participación */}
            <Card>
              <CardHeader>
                <CardTitle>Participación en Competencias</CardTitle>
                <CardDescription>Evolución de la participación en los últimos 30 días</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center bg-gray-50 rounded-lg">
                  <BarChart3 className="h-12 w-12 text-gray-400" />
                  <span className="ml-2 text-gray-500">Gráfico de participación</span>
                </div>
              </CardContent>
            </Card>

            {/* Top performers */}
            <Card>
              <CardHeader>
                <CardTitle>Mejores Participantes</CardTitle>
                <CardDescription>Top 5 participantes con mejor rendimiento</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.topPerformers.map((performer, index) => (
                    <div key={performer.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-semibold">{performer.username}</div>
                          <div className="text-sm text-gray-500">
                            {performer.completedTasks}/{performer.totalTasks} tareas
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{performer.score} pts</div>
                        <div className="text-sm text-gray-500">{performer.accuracy}% precisión</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="competitions" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {competitions.map((competition) => (
              <Card key={competition.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(competition.type)}
                      <CardTitle className="text-lg">{competition.name}</CardTitle>
                    </div>
                    <Badge className={getStatusColor(competition.status)}>
                      {competition.status}
                    </Badge>
                  </div>
                  <CardDescription>{competition.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span>Participantes:</span>
                    <span>{competition.participants}/{competition.maxParticipants}</span>
                  </div>
                  <Progress 
                    value={(competition.participants / competition.maxParticipants) * 100} 
                    className="h-2" 
                  />
                  
                  <div className="flex items-center justify-between text-sm">
                    <span>Inicio:</span>
                    <span>{competition.startDate.toLocaleDateString()}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span>Fin:</span>
                    <span>{competition.endDate.toLocaleDateString()}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{competition.type}</Badge>
                    {competition.categories.map((category) => (
                      <Badge key={category} variant="secondary">{category}</Badge>
                    ))}
                  </div>
                  
                  <div className="pt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => setSelectedCompetition(competition.id)}
                    >
                      Ver Detalles
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-4">
          {selectedCompetition && (
            <Card>
              <CardHeader>
                <CardTitle>Clasificación - {competitions.find(c => c.id === selectedCompetition)?.name}</CardTitle>
                <CardDescription>Ranking actual de participantes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {competitions
                    .find(c => c.id === selectedCompetition)
                    ?.leaderboard.map((entry, index) => (
                      <div key={entry.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">
                            {entry.rank}
                          </div>
                          <div>
                            <div className="font-semibold">{entry.username}</div>
                            <div className="text-sm text-gray-500">
                              Última actividad: {entry.lastActivity.toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-6">
                          <div className="text-center">
                            <div className="font-semibold">{entry.score}</div>
                            <div className="text-sm text-gray-500">Puntos</div>
                          </div>
                          <div className="text-center">
                            <div className="font-semibold">{entry.completedTasks}/{entry.totalTasks}</div>
                            <div className="text-sm text-gray-500">Tareas</div>
                          </div>
                          <div className="text-center">
                            <div className="font-semibold">{formatTimeSpent(entry.timeSpent)}</div>
                            <div className="text-sm text-gray-500">Tiempo</div>
                          </div>
                          <div className="text-center">
                            <div className="font-semibold">{entry.accuracy}%</div>
                            <div className="text-sm text-gray-500">Precisión</div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}
          
          {!selectedCompetition && (
            <Card>
              <CardContent className="flex items-center justify-center h-32">
                <p className="text-gray-500">Selecciona una competencia para ver su clasificación</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="winners" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ganadores Recientes</CardTitle>
              <CardDescription>Últimos ganadores de competencias</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recentWinners.map((winner, index) => (
                  <div key={winner.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-yellow-100 text-yellow-800">
                        <Crown className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-semibold">{winner.username}</div>
                        <div className="text-sm text-gray-500">{winner.competitionName}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{winner.score} puntos</div>
                      <div className="text-sm text-gray-500">
                        {winner.wonAt.toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
