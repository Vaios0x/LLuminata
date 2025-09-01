'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Trophy, 
  Star, 
  Award, 
  Target, 
  TrendingUp, 
  Users, 
  Calendar,
  Zap,
  Crown,
  Medal
} from 'lucide-react';

interface GamificationData {
  level: {
    level: number;
    experience: number;
    points: number;
    title: string;
  };
  badges: Array<{
    id: string;
    badge: {
      name: string;
      description: string;
      icon: string;
      category: string;
      rarity: string;
      points: number;
    };
    earnedAt: string;
    progress: number;
  }>;
  achievements: Array<{
    id: string;
    achievement: {
      name: string;
      description: string;
      icon: string;
      category: string;
      points: number;
    };
    earnedAt: string;
    progress: number;
  }>;
  rewards: Array<{
    id: string;
    reward: {
      name: string;
      description: string;
      type: string;
      value: number;
      icon?: string;
    };
    earnedAt: string;
    claimedAt?: string;
  }>;
  stats: {
    lessons_completed: number;
    assessments_passed: number;
    cultural_activities: number;
    help_others: number;
    perfect_scores: number;
    study_streak: number;
    languages_learned: number;
    students_helped: number;
  };
}

interface Competition {
  id: string;
  name: string;
  description: string;
  type: string;
  startDate: string;
  endDate: string;
  status: string;
  _count: {
    participants: number;
  };
}

export const GamificationDashboard: React.FC<{ userId: string }> = ({ userId }) => {
  const [gamificationData, setGamificationData] = useState<GamificationData | null>(null);
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadGamificationData();
    loadCompetitions();
  }, [userId]);

  const loadGamificationData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/gamification?action=user_data&userId=${userId}`);
      
      if (!response.ok) {
        throw new Error('Error cargando datos de gamificación');
      }

      const result = await response.json();
      setGamificationData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const loadCompetitions = async () => {
    try {
      const response = await fetch('/api/gamification?action=active_competitions');
      
      if (response.ok) {
        const result = await response.json();
        setCompetitions(result.data);
      }
    } catch (err) {
      console.error('Error cargando competencias:', err);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'COMMON': return 'bg-gray-100 text-gray-800';
      case 'UNCOMMON': return 'bg-green-100 text-green-800';
      case 'RARE': return 'bg-blue-100 text-blue-800';
      case 'EPIC': return 'bg-purple-100 text-purple-800';
      case 'LEGENDARY': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'LEARNING': return <Target className="w-4 h-4" />;
      case 'CULTURAL': return <Star className="w-4 h-4" />;
      case 'SOCIAL': return <Users className="w-4 h-4" />;
      case 'TECHNICAL': return <Zap className="w-4 h-4" />;
      case 'MILESTONE': return <Award className="w-4 h-4" />;
      default: return <Star className="w-4 h-4" />;
    }
  };

  const calculateNextLevelProgress = () => {
    if (!gamificationData?.level) return 0;
    
    const currentLevel = gamificationData.level.level;
    const currentExp = gamificationData.level.experience;
    
    // Configuración de niveles (debería venir del servicio)
    const levelConfigs = [
      { level: 1, exp: 0 },
      { level: 2, exp: 100 },
      { level: 3, exp: 250 },
      { level: 4, exp: 500 },
      { level: 5, exp: 1000 },
      { level: 6, exp: 2000 },
      { level: 7, exp: 3500 },
      { level: 8, exp: 5000 },
      { level: 9, exp: 7500 },
      { level: 10, exp: 10000 }
    ];

    const currentConfig = levelConfigs.find(config => config.level === currentLevel);
    const nextConfig = levelConfigs.find(config => config.level === currentLevel + 1);

    if (!currentConfig || !nextConfig) return 100;

    const expInCurrentLevel = currentExp - currentConfig.exp;
    const expNeededForNextLevel = nextConfig.exp - currentConfig.exp;
    
    return Math.min(100, (expInCurrentLevel / expNeededForNextLevel) * 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <p>Error: {error}</p>
            <Button onClick={loadGamificationData} className="mt-4">
              Reintentar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!gamificationData) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="text-center text-gray-600">
            <p>No se encontraron datos de gamificación</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con nivel y progreso */}
      <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">{gamificationData.level.title}</h2>
              <p className="text-blue-100">Nivel {gamificationData.level.level}</p>
              <p className="text-blue-100">{gamificationData.level.points} puntos totales</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{gamificationData.level.experience}</div>
              <p className="text-blue-100">Experiencia</p>
            </div>
          </div>
          
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-2">
              <span>Progreso al siguiente nivel</span>
              <span>{Math.round(calculateNextLevelProgress())}%</span>
            </div>
            <Progress value={calculateNextLevelProgress()} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Target className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold">{gamificationData.stats.lessons_completed}</div>
            <p className="text-sm text-gray-600">Lecciones</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Trophy className="w-8 h-8 mx-auto mb-2 text-yellow-600" />
            <div className="text-2xl font-bold">{gamificationData.stats.perfect_scores}</div>
            <p className="text-sm text-gray-600">Puntuaciones Perfectas</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-8 h-8 mx-auto mb-2 text-green-600" />
            <div className="text-2xl font-bold">{gamificationData.stats.study_streak}</div>
            <p className="text-sm text-gray-600">Días Consecutivos</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="w-8 h-8 mx-auto mb-2 text-purple-600" />
            <div className="text-2xl font-bold">{gamificationData.stats.students_helped}</div>
            <p className="text-sm text-gray-600">Estudiantes Ayudados</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs principales */}
      <Tabs defaultValue="badges" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="badges">Badges</TabsTrigger>
          <TabsTrigger value="achievements">Logros</TabsTrigger>
          <TabsTrigger value="competitions">Competencias</TabsTrigger>
          <TabsTrigger value="rewards">Recompensas</TabsTrigger>
        </TabsList>

        <TabsContent value="badges" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {gamificationData.badges.map((userBadge) => (
              <Card key={userBadge.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      {getCategoryIcon(userBadge.badge.category)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{userBadge.badge.name}</h3>
                      <p className="text-sm text-gray-600">{userBadge.badge.description}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge className={getRarityColor(userBadge.badge.rarity)}>
                          {userBadge.badge.rarity}
                        </Badge>
                        <span className="text-sm text-gray-500">+{userBadge.badge.points} pts</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {gamificationData.achievements.map((userAchievement) => (
              <Card key={userAchievement.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <Award className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{userAchievement.achievement.name}</h3>
                      <p className="text-sm text-gray-600">{userAchievement.achievement.description}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge className="bg-green-100 text-green-800">
                          {userAchievement.achievement.category}
                        </Badge>
                        <span className="text-sm text-gray-500">+{userAchievement.achievement.points} pts</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="competitions" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {competitions.map((competition) => (
              <Card key={competition.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Trophy className="w-5 h-5 text-yellow-600" />
                    <span>{competition.name}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{competition.description}</p>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span>Hasta {new Date(competition.endDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4" />
                      <span>{competition._count.participants} participantes</span>
                    </div>
                  </div>
                  <Button className="w-full mt-4">
                    Unirse a la Competencia
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="rewards" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {gamificationData.rewards.map((userReward) => (
              <Card key={userReward.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <Crown className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{userReward.reward.name}</h3>
                      <p className="text-sm text-gray-600">{userReward.reward.description}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge className="bg-purple-100 text-purple-800">
                          {userReward.reward.type}
                        </Badge>
                        {userReward.claimedAt ? (
                          <Badge className="bg-green-100 text-green-800">Reclamado</Badge>
                        ) : (
                          <Button size="sm" variant="outline">
                            Reclamar
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
