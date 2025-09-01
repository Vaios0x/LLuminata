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
  Zap
} from 'lucide-react';

interface GamificationMetrics {
  totalUsers: number;
  activeUsers: number;
  totalPoints: number;
  averagePoints: number;
  completedChallenges: number;
  activeChallenges: number;
  leaderboardEntries: number;
  achievementsUnlocked: number;
  engagementRate: number;
  retentionRate: number;
}

interface LeaderboardEntry {
  id: string;
  userId: string;
  username: string;
  avatar?: string;
  points: number;
  level: number;
  rank: number;
  achievements: number;
  streak: number;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  points: number;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  participants: number;
  completionRate: number;
  endDate: Date;
  isActive: boolean;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedCount: number;
  totalUsers: number;
  unlockedAt?: Date;
}

export default function GamificationDashboard() {
  const [metrics, setMetrics] = useState<GamificationMetrics>({
    totalUsers: 0,
    activeUsers: 0,
    totalPoints: 0,
    averagePoints: 0,
    completedChallenges: 0,
    activeChallenges: 0,
    leaderboardEntries: 0,
    achievementsUnlocked: 0,
    engagementRate: 0,
    retentionRate: 0
  });

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'day' | 'week' | 'month'>('week');

  useEffect(() => {
    loadGamificationData();
  }, [selectedTimeframe]);

  const loadGamificationData = async () => {
    setLoading(true);
    try {
      // Simular carga de datos
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMetrics({
        totalUsers: 1247,
        activeUsers: 892,
        totalPoints: 456789,
        averagePoints: 367,
        completedChallenges: 2341,
        activeChallenges: 15,
        leaderboardEntries: 1247,
        achievementsUnlocked: 5678,
        engagementRate: 78.5,
        retentionRate: 85.2
      });

      setLeaderboard([
        {
          id: '1',
          userId: 'user1',
          username: 'MaríaGarcía',
          points: 15420,
          level: 25,
          rank: 1,
          achievements: 45,
          streak: 12
        },
        {
          id: '2',
          userId: 'user2',
          username: 'CarlosLópez',
          points: 14230,
          level: 23,
          rank: 2,
          achievements: 42,
          streak: 8
        },
        {
          id: '3',
          userId: 'user3',
          username: 'AnaMartínez',
          points: 13890,
          level: 22,
          rank: 3,
          achievements: 38,
          streak: 15
        }
      ]);

      setChallenges([
        {
          id: '1',
          title: 'Completar 5 lecciones',
          description: 'Completa 5 lecciones en una semana',
          points: 500,
          difficulty: 'medium',
          category: 'Aprendizaje',
          participants: 234,
          completionRate: 67,
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          isActive: true
        },
        {
          id: '2',
          title: 'Ayudar a 3 compañeros',
          description: 'Ayuda a 3 compañeros con sus tareas',
          points: 300,
          difficulty: 'easy',
          category: 'Colaboración',
          participants: 156,
          completionRate: 89,
          endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          isActive: true
        }
      ]);

      setAchievements([
        {
          id: '1',
          title: 'Primer Paso',
          description: 'Completa tu primera lección',
          icon: '🎯',
          rarity: 'common',
          unlockedCount: 1247,
          totalUsers: 1247
        },
        {
          id: '2',
          title: 'Ayudante',
          description: 'Ayuda a 10 compañeros',
          icon: '🤝',
          rarity: 'rare',
          unlockedCount: 234,
          totalUsers: 1247
        },
        {
          id: '3',
          title: 'Maestro',
          description: 'Completa 100 lecciones',
          icon: '👑',
          rarity: 'epic',
          unlockedCount: 45,
          totalUsers: 1247
        }
      ]);
    } catch (error) {
      console.error('Error cargando datos de gamificación:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 text-gray-800';
      case 'rare': return 'bg-blue-100 text-blue-800';
      case 'epic': return 'bg-purple-100 text-purple-800';
      case 'legendary': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
          <h1 className="text-3xl font-bold text-gray-900">Dashboard de Gamificación</h1>
          <p className="text-gray-600">Métricas y análisis del sistema de gamificación</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button size="sm">
            <Zap className="h-4 w-4 mr-2" />
            Nuevo Desafío
          </Button>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +{((metrics.activeUsers / metrics.totalUsers) * 100).toFixed(1)}% del total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Puntos Totales</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalPoints.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Promedio: {metrics.averagePoints} por usuario
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Engagement</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.engagementRate}%</div>
            <Progress value={metrics.engagementRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Retención</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.retentionRate}%</div>
            <Progress value={metrics.retentionRate} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Tabs principales */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="leaderboard">Clasificación</TabsTrigger>
          <TabsTrigger value="challenges">Desafíos</TabsTrigger>
          <TabsTrigger value="achievements">Logros</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico de actividad */}
            <Card>
              <CardHeader>
                <CardTitle>Actividad Reciente</CardTitle>
                <CardDescription>Actividad de usuarios en los últimos 7 días</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center bg-gray-50 rounded-lg">
                  <BarChart3 className="h-12 w-12 text-gray-400" />
                  <span className="ml-2 text-gray-500">Gráfico de actividad</span>
                </div>
              </CardContent>
            </Card>

            {/* Métricas adicionales */}
            <Card>
              <CardHeader>
                <CardTitle>Métricas Adicionales</CardTitle>
                <CardDescription>Estadísticas detalladas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Desafíos Completados</span>
                  <Badge variant="secondary">{metrics.completedChallenges}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Desafíos Activos</span>
                  <Badge variant="outline">{metrics.activeChallenges}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Logros Desbloqueados</span>
                  <Badge variant="secondary">{metrics.achievementsUnlocked}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Entradas en Clasificación</span>
                  <Badge variant="outline">{metrics.leaderboardEntries}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Clasificación Global</CardTitle>
              <CardDescription>Top usuarios por puntos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {leaderboard.map((entry, index) => (
                  <div key={entry.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">
                        {entry.rank}
                      </div>
                      <div>
                        <div className="font-semibold">{entry.username}</div>
                        <div className="text-sm text-gray-500">Nivel {entry.level}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="font-semibold">{entry.points.toLocaleString()} pts</div>
                        <div className="text-sm text-gray-500">{entry.achievements} logros</div>
                      </div>
                      <Badge variant="outline">{entry.streak} días</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="challenges" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Desafíos Activos</CardTitle>
              <CardDescription>Desafíos disponibles para los usuarios</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {challenges.map((challenge) => (
                  <div key={challenge.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold">{challenge.title}</h3>
                          <Badge className={getDifficultyColor(challenge.difficulty)}>
                            {challenge.difficulty}
                          </Badge>
                          <Badge variant="outline">{challenge.category}</Badge>
                        </div>
                        <p className="text-gray-600 mb-3">{challenge.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>{challenge.points} puntos</span>
                          <span>{challenge.participants} participantes</span>
                          <span>{challenge.completionRate}% completado</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500">
                          Termina: {challenge.endDate.toLocaleDateString()}
                        </div>
                        <Button size="sm" className="mt-2">
                          Ver Detalles
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Logros Disponibles</CardTitle>
              <CardDescription>Logros que los usuarios pueden desbloquear</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {achievements.map((achievement) => (
                  <div key={achievement.id} className="border rounded-lg p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="text-2xl">{achievement.icon}</div>
                      <div>
                        <h3 className="font-semibold">{achievement.title}</h3>
                        <Badge className={getRarityColor(achievement.rarity)}>
                          {achievement.rarity}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{achievement.description}</p>
                    <div className="flex justify-between items-center text-sm">
                      <span>{achievement.unlockedCount} desbloqueados</span>
                      <span>{((achievement.unlockedCount / achievement.totalUsers) * 100).toFixed(1)}%</span>
                    </div>
                    <Progress 
                      value={(achievement.unlockedCount / achievement.totalUsers) * 100} 
                      className="mt-2" 
                    />
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
