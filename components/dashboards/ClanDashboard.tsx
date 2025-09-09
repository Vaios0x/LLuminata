'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Crown, 
  Shield, 
  Target, 
  TrendingUp, 
  Star, 
  Award,
  Calendar,
  BarChart3,
  Activity,
  Zap,
  UserPlus,
  Settings,
  MessageSquare,
  Trophy,
  Sword,
  Gift,
  UserMinus
} from 'lucide-react';

interface Clan {
  id: string;
  name: string;
  description: string;
  tag: string;
  level: number;
  experience: number;
  maxExperience: number;
  memberCount: number;
  maxMembers: number;
  leader: ClanMember;
  officers: ClanMember[];
  members: ClanMember[];
  achievements: ClanAchievement[];
  activities: ClanActivity[];
  wars: ClanWar[];
  treasury: {
    coins: number;
    gems: number;
    materials: number;
  };
  settings: {
    isPublic: boolean;
    requiresApproval: boolean;
    minimumLevel: number;
    language: string;
  };
}

interface ClanMember {
  id: string;
  userId: string;
  username: string;
  avatar?: string;
  role: 'leader' | 'officer' | 'member' | 'recruit';
  level: number;
  experience: number;
  joinDate: Date;
  lastActive: Date;
  contribution: {
    wars: number;
    donations: number;
    activities: number;
  };
}

interface ClanAchievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  progress: number;
  maxProgress: number;
  isCompleted: boolean;
  reward: string;
}

interface ClanActivity {
  id: string;
  type: 'war' | 'donation' | 'achievement' | 'member_join' | 'member_leave';
  title: string;
  description: string;
  timestamp: Date;
  memberId?: string;
  memberName?: string;
  data?: Record<string, any>;
}

interface ClanWar {
  id: string;
  opponent: string;
  status: 'preparation' | 'active' | 'completed';
  startDate: Date;
  endDate: Date;
  result?: 'victory' | 'defeat' | 'draw';
  score: number;
  opponentScore: number;
  participants: number;
  maxParticipants: number;
}

interface ClanStats {
  totalClans: number;
  activeClans: number;
  totalMembers: number;
  averageMembers: number;
  averageLevel: number;
  totalWars: number;
  warWinRate: number;
  topClans: {
    id: string;
    name: string;
    level: number;
    members: number;
    experience: number;
  }[];
}

export default function ClanDashboard() {
  const [clans, setClans] = useState<Clan[]>([]);
  const [stats, setStats] = useState<ClanStats>({
    totalClans: 0,
    activeClans: 0,
    totalMembers: 0,
    averageMembers: 0,
    averageLevel: 0,
    totalWars: 0,
    warWinRate: 0,
    topClans: []
  });
  const [loading, setLoading] = useState(true);
  const [selectedClan, setSelectedClan] = useState<string | null>(null);

  useEffect(() => {
    loadClanData();
  }, []);

  const loadClanData = async () => {
    setLoading(true);
    try {
      // Simular carga de datos
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockClans: Clan[] = [
        {
          id: '1',
          name: 'Los Sabios',
          description: 'Clan dedicado al aprendizaje y la sabiduría',
          tag: '#SABIOS',
          level: 15,
          experience: 125000,
          maxExperience: 150000,
          memberCount: 45,
          maxMembers: 50,
          leader: {
            id: '1',
            userId: 'user1',
            username: 'MaríaGarcía',
            role: 'leader',
            level: 25,
            experience: 15420,
            joinDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
            lastActive: new Date(),
            contribution: { wars: 25, donations: 1500, activities: 89 }
          },
          officers: [
            {
              id: '2',
              userId: 'user2',
              username: 'CarlosLópez',
              role: 'officer',
              level: 23,
              experience: 14230,
              joinDate: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000),
              lastActive: new Date(),
              contribution: { wars: 20, donations: 1200, activities: 67 }
            }
          ],
          members: [
            {
              id: '3',
              userId: 'user3',
              username: 'AnaMartínez',
              role: 'member',
              level: 22,
              experience: 13890,
              joinDate: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000),
              lastActive: new Date(),
              contribution: { wars: 15, donations: 800, activities: 45 }
            }
          ],
          achievements: [
            {
              id: '1',
              name: 'Primera Guerra',
              description: 'Participa en tu primera guerra de clan',
              icon: '⚔️',
              progress: 1,
              maxProgress: 1,
              isCompleted: true,
              reward: '1000 experiencia'
            },
            {
              id: '2',
              name: 'Donador Generoso',
              description: 'Donar 1000 recursos al clan',
              icon: '🎁',
              progress: 750,
              maxProgress: 1000,
              isCompleted: false,
              reward: '500 experiencia'
            }
          ],
          activities: [
            {
              id: '1',
              type: 'war',
              title: 'Guerra contra Los Guerreros',
              description: 'Victoria por 3-1',
              timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
              data: { score: 3, opponentScore: 1 }
            },
            {
              id: '2',
              type: 'member_join',
              title: 'Nuevo miembro',
              description: 'JuanPérez se unió al clan',
              timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
              memberId: '4',
              memberName: 'JuanPérez'
            }
          ],
          wars: [
            {
              id: '1',
              opponent: 'Los Guerreros',
              status: 'completed',
              startDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
              endDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
              result: 'victory',
              score: 3,
              opponentScore: 1,
              participants: 15,
              maxParticipants: 20
            }
          ],
          treasury: {
            coins: 50000,
            gems: 250,
            materials: 1500
          },
          settings: {
            isPublic: true,
            requiresApproval: true,
            minimumLevel: 10,
            language: 'es-MX'
          }
        }
      ];

      setClans(mockClans);
      
      setStats({
        totalClans: 45,
        activeClans: 38,
        totalMembers: 1247,
        averageMembers: 28,
        averageLevel: 12,
        totalWars: 156,
        warWinRate: 68.5,
        topClans: [
          {
            id: '1',
            name: 'Los Sabios',
            level: 15,
            members: 45,
            experience: 125000
          },
          {
            id: '2',
            name: 'Los Guerreros',
            level: 14,
            members: 42,
            experience: 118000
          }
        ]
      });
    } catch (error) {
      console.error('Error cargando datos de clanes:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'leader': return 'bg-purple-100 text-purple-800';
      case 'officer': return 'bg-blue-100 text-blue-800';
      case 'member': return 'bg-green-100 text-green-800';
      case 'recruit': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'leader': return <Crown className="h-4 w-4" />;
      case 'officer': return <Shield className="h-4 w-4" />;
      case 'member': return <Users className="h-4 w-4" />;
      case 'recruit': return <UserPlus className="h-4 w-4" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'war': return <Sword className="h-4 w-4" />;
      case 'donation': return <Gift className="h-4 w-4" />;
      case 'achievement': return <Trophy className="h-4 w-4" />;
      case 'member_join': return <UserPlus className="h-4 w-4" />;
      case 'member_leave': return <UserMinus className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
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
          <h1 className="text-3xl font-bold text-gray-900">Dashboard de Clanes</h1>
          <p className="text-gray-600">Gestión y análisis de clanes y grupos</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Configuración
          </Button>
          <Button size="sm">
            <UserPlus className="h-4 w-4 mr-2" />
            Crear Clan
          </Button>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clanes Activos</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeClans}</div>
            <p className="text-xs text-muted-foreground">
              de {stats.totalClans} totales
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Miembros Totales</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMembers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Promedio: {stats.averageMembers} por clan
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nivel Promedio</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageLevel}</div>
            <p className="text-xs text-muted-foreground">
              de todos los clanes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Victoria</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.warWinRate}%</div>
            <Progress value={stats.warWinRate} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Tabs principales */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="clans">Clanes</TabsTrigger>
          <TabsTrigger value="members">Miembros</TabsTrigger>
          <TabsTrigger value="wars">Guerras</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top clanes */}
            <Card>
              <CardHeader>
                <CardTitle>Top Clanes</CardTitle>
                <CardDescription>Clanes con mayor nivel y experiencia</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.topClans.map((clan, index) => (
                    <div key={clan.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-semibold">{clan.name}</div>
                          <div className="text-sm text-gray-500">Nivel {clan.level}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{clan.members} miembros</div>
                        <div className="text-sm text-gray-500">{clan.experience.toLocaleString()} exp</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Estadísticas de guerra */}
            <Card>
              <CardHeader>
                <CardTitle>Estadísticas de Guerra</CardTitle>
                <CardDescription>Rendimiento en guerras de clan</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Total de Guerras</span>
                    <Badge variant="secondary">{stats.totalWars}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Tasa de Victoria</span>
                    <Badge variant="outline">{stats.warWinRate}%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Promedio de Participantes</span>
                    <Badge variant="secondary">15 por guerra</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Última Guerra</span>
                    <Badge variant="outline">Hace 2 días</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="clans" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {clans.map((clan) => (
              <Card key={clan.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{clan.name}</CardTitle>
                      <CardDescription>{clan.tag}</CardDescription>
                    </div>
                    <Badge variant="outline">Nivel {clan.level}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600">{clan.description}</p>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span>Miembros:</span>
                    <span>{clan.memberCount}/{clan.maxMembers}</span>
                  </div>
                  <Progress 
                    value={(clan.memberCount / clan.maxMembers) * 100} 
                    className="h-2" 
                  />
                  
                  <div className="flex items-center justify-between text-sm">
                    <span>Experiencia:</span>
                    <span>{clan.experience.toLocaleString()}/{clan.maxExperience.toLocaleString()}</span>
                  </div>
                  <Progress 
                    value={(clan.experience / clan.maxExperience) * 100} 
                    className="h-2" 
                  />
                  
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{clan.settings.language}</Badge>
                    <Badge variant={clan.settings.isPublic ? "default" : "secondary"}>
                      {clan.settings.isPublic ? 'Público' : 'Privado'}
                    </Badge>
                  </div>
                  
                  <div className="pt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => setSelectedClan(clan.id)}
                    >
                      Ver Detalles
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="members" className="space-y-4">
          {selectedClan && (
            <Card>
              <CardHeader>
                <CardTitle>Miembros - {clans.find(c => c.id === selectedClan)?.name}</CardTitle>
                <CardDescription>Lista de miembros del clan</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Líder */}
                  {clans.find(c => c.id === selectedClan)?.leader && (
                    <div className="border-l-4 border-purple-500 pl-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg bg-purple-50">
                        <div className="flex items-center space-x-4">
                          {getRoleIcon('leader')}
                          <div>
                            <div className="font-semibold">{clans.find(c => c.id === selectedClan)?.leader.username}</div>
                            <div className="text-sm text-gray-500">Líder del Clan</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">Nivel {clans.find(c => c.id === selectedClan)?.leader.level}</div>
                          <div className="text-sm text-gray-500">
                            {clans.find(c => c.id === selectedClan)?.leader.experience.toLocaleString()} exp
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Oficiales */}
                  {clans.find(c => c.id === selectedClan)?.officers.map((officer) => (
                    <div key={officer.id} className="border-l-4 border-blue-500 pl-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg bg-blue-50">
                        <div className="flex items-center space-x-4">
                          {getRoleIcon('officer')}
                          <div>
                            <div className="font-semibold">{officer.username}</div>
                            <div className="text-sm text-gray-500">Oficial</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">Nivel {officer.level}</div>
                          <div className="text-sm text-gray-500">{officer.experience.toLocaleString()} exp</div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Miembros */}
                  {clans.find(c => c.id === selectedClan)?.members.map((member) => (
                    <div key={member.id} className="border-l-4 border-green-500 pl-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          {getRoleIcon('member')}
                          <div>
                            <div className="font-semibold">{member.username}</div>
                            <div className="text-sm text-gray-500">Miembro</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">Nivel {member.level}</div>
                          <div className="text-sm text-gray-500">{member.experience.toLocaleString()} exp</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          
          {!selectedClan && (
            <Card>
              <CardContent className="flex items-center justify-center h-32">
                <p className="text-gray-500">Selecciona un clan para ver sus miembros</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="wars" className="space-y-4">
          {selectedClan && (
            <Card>
              <CardHeader>
                <CardTitle>Guerras - {clans.find(c => c.id === selectedClan)?.name}</CardTitle>
                <CardDescription>Historial de guerras del clan</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {clans.find(c => c.id === selectedClan)?.wars.map((war) => (
                    <div key={war.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="text-lg">⚔️</div>
                          <div>
                            <div className="font-semibold">vs {war.opponent}</div>
                            <div className="text-sm text-gray-500">
                              {war.startDate.toLocaleDateString()} - {war.endDate.toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <Badge 
                          variant={war.result === 'victory' ? 'default' : war.result === 'defeat' ? 'destructive' : 'secondary'}
                        >
                          {war.result === 'victory' ? 'Victoria' : war.result === 'defeat' ? 'Derrota' : 'Empate'}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span>Puntuación: {war.score} - {war.opponentScore}</span>
                        <span>{war.participants}/{war.maxParticipants} participantes</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          
          {!selectedClan && (
            <Card>
              <CardContent className="flex items-center justify-center h-32">
                <p className="text-gray-500">Selecciona un clan para ver sus guerras</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
