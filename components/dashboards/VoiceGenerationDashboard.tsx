'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Mic, 
  Headphones, 
  Volume2, 
  Play, 
  Pause,
  Download,
  Upload,
  Settings,
  BarChart3,
  PieChart,
  LineChart,
  Filter,
  RefreshCw,
  Plus,
  Eye,
  Brain,
  Heart,
  Star,
  MessageSquare,
  Calendar,
  Bookmark,
  FileText,
  Video,
  Zap,
  Activity,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  AlertTriangle,
  Clock,
  Search,
  MousePointer,
  MousePointerClick,
  Flag,
  Palette,
  Globe,
  Languages,
  Users,
  MapPin,
  BookOpen,
  Lightbulb,
  Target,
  Download as DownloadIcon,
  RefreshCw as RefreshCwIcon,
  Plus as PlusIcon
} from 'lucide-react';

interface VoiceModel {
  id: string;
  name: string;
  language: string;
  dialect: string;
  gender: 'male' | 'female' | 'neutral';
  age: 'child' | 'young' | 'adult' | 'elder';
  quality: number;
  naturalness: number;
  clarity: number;
  emotion: number;
  status: 'active' | 'training' | 'maintenance' | 'deprecated';
  lastUpdated: Date;
  usage: {
    totalRequests: number;
    dailyRequests: number;
    monthlyRequests: number;
    activeUsers: number;
  };
  performance: {
    latency: number;
    throughput: number;
    errorRate: number;
    successRate: number;
  };
  metadata: {
    accent: string;
    region: string;
    culturalContext: string;
    useCase: string[];
  };
}

interface VoiceGeneration {
  id: string;
  userId: string;
  modelId: string;
  modelName: string;
  text: string;
  audioUrl: string;
  duration: number;
  quality: number;
  naturalness: number;
  clarity: number;
  emotion: number;
  timestamp: Date;
  feedback?: {
    rating: number;
    comment: string;
  };
  metadata: {
    language: string;
    dialect: string;
    emotion: string;
    speed: number;
    pitch: number;
  };
}

interface VoiceAnalytics {
  totalModels: number;
  activeModels: number;
  totalGenerations: number;
  averageQuality: number;
  averageLatency: number;
  successRate: number;
  userSatisfaction: number;
  topModels: VoiceModel[];
  recentGenerations: VoiceGeneration[];
  qualityTrends: {
    date: string;
    quality: number;
    naturalness: number;
    clarity: number;
    emotion: number;
  }[];
  languageDistribution: {
    language: string;
    count: number;
    percentage: number;
  }[];
  performanceMetrics: {
    totalRequests: number;
    dailyRequests: number;
    averageLatency: number;
    errorRate: number;
  };
}

interface VoiceTemplate {
  id: string;
  name: string;
  description: string;
  category: 'educational' | 'narrative' | 'conversational' | 'formal';
  language: string;
  dialect: string;
  emotion: string;
  speed: number;
  pitch: number;
  usage: number;
  rating: number;
  tags: string[];
}

export default function VoiceGenerationDashboard() {
  const [models, setModels] = useState<VoiceModel[]>([]);
  const [generations, setGenerations] = useState<VoiceGeneration[]>([]);
  const [templates, setTemplates] = useState<VoiceTemplate[]>([]);
  const [analytics, setAnalytics] = useState<VoiceAnalytics>({
    totalModels: 0,
    activeModels: 0,
    totalGenerations: 0,
    averageQuality: 0,
    averageLatency: 0,
    successRate: 0,
    userSatisfaction: 0,
    topModels: [],
    recentGenerations: [],
    qualityTrends: [],
    languageDistribution: [],
    performanceMetrics: {
      totalRequests: 0,
      dailyRequests: 0,
      averageLatency: 0,
      errorRate: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<string>('24h');
  const [filterLanguage, setFilterLanguage] = useState<string>('all');
  const [filterGender, setFilterGender] = useState<string>('all');

  useEffect(() => {
    loadVoiceData();
  }, [timeRange]);

  const loadVoiceData = async () => {
    setLoading(true);
    try {
      // Simular carga de datos
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockModels: VoiceModel[] = [
        {
          id: '1',
          name: 'María Maya',
          language: 'maya',
          dialect: 'yucateco',
          gender: 'female',
          age: 'adult',
          quality: 0.94,
          naturalness: 0.92,
          clarity: 0.96,
          emotion: 0.89,
          status: 'active',
          lastUpdated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          usage: {
            totalRequests: 45600,
            dailyRequests: 1240,
            monthlyRequests: 37200,
            activeUsers: 8900
          },
          performance: {
            latency: 245,
            throughput: 150,
            errorRate: 0.02,
            successRate: 0.98
          },
          metadata: {
            accent: 'yucateco',
            region: 'Yucatán',
            culturalContext: 'maya',
            useCase: ['educativo', 'narrativo', 'conversacional']
          }
        },
        {
          id: '2',
          name: 'Carlos Náhuatl',
          language: 'náhuatl',
          dialect: 'central',
          gender: 'male',
          age: 'elder',
          quality: 0.91,
          naturalness: 0.89,
          clarity: 0.93,
          emotion: 0.87,
          status: 'active',
          lastUpdated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          usage: {
            totalRequests: 23400,
            dailyRequests: 890,
            monthlyRequests: 26700,
            activeUsers: 5600
          },
          performance: {
            latency: 320,
            throughput: 120,
            errorRate: 0.03,
            successRate: 0.97
          },
          metadata: {
            accent: 'central',
            region: 'Puebla',
            culturalContext: 'náhuatl',
            useCase: ['tradicional', 'educativo', 'ceremonial']
          }
        },
        {
          id: '3',
          name: 'Ana Zapoteca',
          language: 'zapoteco',
          dialect: 'valle',
          gender: 'female',
          age: 'young',
          quality: 0.88,
          naturalness: 0.85,
          clarity: 0.90,
          emotion: 0.92,
          status: 'active',
          lastUpdated: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          usage: {
            totalRequests: 12300,
            dailyRequests: 450,
            monthlyRequests: 13500,
            activeUsers: 3400
          },
          performance: {
            latency: 280,
            throughput: 100,
            errorRate: 0.04,
            successRate: 0.96
          },
          metadata: {
            accent: 'valle',
            region: 'Oaxaca',
            culturalContext: 'zapoteco',
            useCase: ['juvenil', 'educativo', 'moderno']
          }
        }
      ];

      const mockGenerations: VoiceGeneration[] = [
        {
          id: '1',
          userId: 'user1',
          modelId: '1',
          modelName: 'María Maya',
          text: 'Bienvenidos a nuestra lección sobre la cultura maya',
          audioUrl: '/audio/generation_1.mp3',
          duration: 4.2,
          quality: 0.94,
          naturalness: 0.92,
          clarity: 0.96,
          emotion: 0.89,
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          feedback: {
            rating: 5,
            comment: 'Voz muy natural y clara'
          },
          metadata: {
            language: 'maya',
            dialect: 'yucateco',
            emotion: 'neutral',
            speed: 1.0,
            pitch: 1.0
          }
        },
        {
          id: '2',
          userId: 'user2',
          modelId: '2',
          modelName: 'Carlos Náhuatl',
          text: 'La sabiduría de nuestros ancestros nos guía',
          audioUrl: '/audio/generation_2.mp3',
          duration: 3.8,
          quality: 0.91,
          naturalness: 0.89,
          clarity: 0.93,
          emotion: 0.87,
          timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
          metadata: {
            language: 'náhuatl',
            dialect: 'central',
            emotion: 'reverente',
            speed: 0.9,
            pitch: 0.95
          }
        }
      ];

      const mockTemplates: VoiceTemplate[] = [
        {
          id: '1',
          name: 'Lección Educativa Maya',
          description: 'Voz cálida y clara para contenido educativo',
          category: 'educational',
          language: 'maya',
          dialect: 'yucateco',
          emotion: 'neutral',
          speed: 1.0,
          pitch: 1.0,
          usage: 1240,
          rating: 4.8,
          tags: ['educativo', 'maya', 'claro', 'cálido']
        },
        {
          id: '2',
          name: 'Narrativa Tradicional Náhuatl',
          description: 'Voz sabia para historias tradicionales',
          category: 'narrative',
          language: 'náhuatl',
          dialect: 'central',
          emotion: 'reverente',
          speed: 0.9,
          pitch: 0.95,
          usage: 890,
          rating: 4.9,
          tags: ['tradicional', 'náhuatl', 'sabio', 'reverente']
        }
      ];

      setModels(mockModels);
      setGenerations(mockGenerations);
      setTemplates(mockTemplates);
      
      setAnalytics({
        totalModels: 12,
        activeModels: 10,
        totalGenerations: 81300,
        averageQuality: 0.91,
        averageLatency: 281,
        successRate: 0.97,
        userSatisfaction: 4.6,
        topModels: mockModels.slice(0, 3),
        recentGenerations: mockGenerations.slice(0, 10),
        qualityTrends: [
          { date: '2024-01-01', quality: 0.90, naturalness: 0.88, clarity: 0.93, emotion: 0.86 },
          { date: '2024-01-02', quality: 0.91, naturalness: 0.89, clarity: 0.94, emotion: 0.87 },
          { date: '2024-01-03', quality: 0.92, naturalness: 0.90, clarity: 0.95, emotion: 0.88 }
        ],
        languageDistribution: [
          { language: 'maya', count: 45600, percentage: 56.1 },
          { language: 'náhuatl', count: 23400, percentage: 28.8 },
          { language: 'zapoteco', count: 12300, percentage: 15.1 }
        ],
        performanceMetrics: {
          totalRequests: 81300,
          dailyRequests: 2580,
          averageLatency: 281,
          errorRate: 0.03
        }
      });
    } catch (error) {
      console.error('Error cargando datos de voz:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'training': return 'bg-blue-100 text-blue-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'deprecated': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getGenderIcon = (gender: string) => {
    switch (gender) {
      case 'male': return '👨';
      case 'female': return '👩';
      case 'neutral': return '👤';
      default: return '👤';
    }
  };

  const getAgeIcon = (age: string) => {
    switch (age) {
      case 'child': return '👶';
      case 'young': return '🧒';
      case 'adult': return '👨‍💼';
      case 'elder': return '👴';
      default: return '👤';
    }
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('es-MX').format(value);
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const formatLatency = (ms: number) => {
    return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`;
  };

  const formatDuration = (seconds: number) => {
    return `${seconds.toFixed(1)}s`;
  };

  const filteredModels = models.filter(model => {
    const languageMatch = filterLanguage === 'all' || model.language === filterLanguage;
    const genderMatch = filterGender === 'all' || model.gender === filterGender;
    return languageMatch && genderMatch;
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
          <h1 className="text-3xl font-bold text-gray-900">Generación de Voz</h1>
          <p className="text-gray-600">Análisis y gestión de síntesis de voz y modelos de audio</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <DownloadIcon className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCwIcon className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
          <Button size="sm">
            <PlusIcon className="h-4 w-4 mr-2" />
            Nuevo Modelo
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Período:</span>
          <select 
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="border rounded px-3 py-1 text-sm"
          >
            <option value="1h">Última hora</option>
            <option value="24h">Últimas 24 horas</option>
            <option value="7d">Últimos 7 días</option>
            <option value="30d">Últimos 30 días</option>
          </select>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Idioma:</span>
          <select 
            value={filterLanguage}
            onChange={(e) => setFilterLanguage(e.target.value)}
            className="border rounded px-3 py-1 text-sm"
          >
            <option value="all">Todos</option>
            <option value="maya">Maya</option>
            <option value="náhuatl">Náhuatl</option>
            <option value="zapoteco">Zapoteco</option>
            <option value="español">Español</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Género:</span>
          <select 
            value={filterGender}
            onChange={(e) => setFilterGender(e.target.value)}
            className="border rounded px-3 py-1 text-sm"
          >
            <option value="all">Todos</option>
            <option value="male">Masculino</option>
            <option value="female">Femenino</option>
            <option value="neutral">Neutral</option>
          </select>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Modelos Activos</CardTitle>
            <Mic className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.activeModels}</div>
            <p className="text-xs text-muted-foreground">
              de {analytics.totalModels} totales
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Generaciones</CardTitle>
            <Volume2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(analytics.totalGenerations)}</div>
            <p className="text-xs text-muted-foreground">
              en el período seleccionado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Calidad Promedio</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(analytics.averageQuality)}</div>
            <p className="text-xs text-muted-foreground">
              puntuación general
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Latencia Promedio</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatLatency(analytics.averageLatency)}</div>
            <p className="text-xs text-muted-foreground">
              tiempo de respuesta
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs principales */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="models">Modelos</TabsTrigger>
          <TabsTrigger value="generations">Generaciones</TabsTrigger>
          <TabsTrigger value="templates">Plantillas</TabsTrigger>
          <TabsTrigger value="performance">Rendimiento</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top modelos */}
            <Card>
              <CardHeader>
                <CardTitle>Mejores Modelos de Voz</CardTitle>
                <CardDescription>Modelos con mejor calidad y rendimiento</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.topModels.map((model, index) => (
                    <div key={model.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">
                          {index + 1}
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{getGenderIcon(model.gender)}</span>
                          <div>
                            <div className="font-semibold">{model.name}</div>
                            <div className="text-sm text-gray-500">{model.language} • {model.dialect}</div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{formatPercentage(model.quality)}</div>
                        <div className="text-sm text-gray-500">
                          {formatNumber(model.usage.dailyRequests)} req/día
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Distribución por idioma */}
            <Card>
              <CardHeader>
                <CardTitle>Distribución por Idioma</CardTitle>
                <CardDescription>Uso de modelos por idioma</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.languageDistribution.map((lang) => (
                    <div key={lang.language} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Globe className="h-4 w-4" />
                        <span className="capitalize">{lang.language}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Progress value={lang.percentage} className="w-20" />
                        <Badge variant="secondary">{formatNumber(lang.count)}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="models" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredModels.map((model) => (
              <Card key={model.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Mic className="h-4 w-4" />
                      <CardTitle className="text-lg">{model.name}</CardTitle>
                    </div>
                    <Badge className={getStatusColor(model.status)}>
                      {model.status === 'active' ? 'Activo' :
                       model.status === 'training' ? 'Entrenando' :
                       model.status === 'maintenance' ? 'Mantenimiento' : 'Deprecado'}
                    </Badge>
                  </div>
                  <CardDescription>{model.language} • {model.dialect}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{getGenderIcon(model.gender)}</span>
                      <span className="text-2xl">{getAgeIcon(model.age)}</span>
                    </div>
                    <div className="flex-1">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-500">Calidad:</span>
                          <div className="font-semibold">{formatPercentage(model.quality)}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Naturalidad:</span>
                          <div className="font-semibold">{formatPercentage(model.naturalness)}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Claridad:</span>
                          <div className="font-semibold">{formatPercentage(model.clarity)}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Emoción:</span>
                          <div className="font-semibold">{formatPercentage(model.emotion)}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Peticiones diarias:</span>
                      <span>{formatNumber(model.usage.dailyRequests)}</span>
                    </div>
                    <Progress 
                      value={(model.usage.dailyRequests / 2000) * 100} 
                      className="h-2" 
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Latencia:</span>
                      <div className="font-semibold">{formatLatency(model.performance.latency)}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Tasa de éxito:</span>
                      <div className="font-semibold">{formatPercentage(model.performance.successRate)}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{model.language}</Badge>
                    <Badge variant="secondary">{model.dialect}</Badge>
                    <Badge variant="outline">{formatNumber(model.usage.activeUsers)} usuarios</Badge>
                  </div>
                  
                  <div className="pt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => setSelectedModel(model.id)}
                    >
                      Ver Detalles
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="generations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Generaciones Recientes</CardTitle>
              <CardDescription>Últimas generaciones de voz realizadas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.recentGenerations.map((generation) => (
                  <div key={generation.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <Headphones className="h-4 w-4" />
                        <div>
                          <div className="font-semibold">{generation.modelName}</div>
                          <div className="text-sm text-gray-500">
                            {generation.timestamp.toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{formatPercentage(generation.quality)}</div>
                        <div className="text-sm text-gray-500">
                          {formatDuration(generation.duration)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm text-gray-500">Texto:</span>
                        <p className="text-sm">{generation.text}</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Naturalidad:</span>
                          <div className="font-semibold">{formatPercentage(generation.naturalness)}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Claridad:</span>
                          <div className="font-semibold">{formatPercentage(generation.clarity)}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Emoción:</span>
                          <div className="font-semibold">{formatPercentage(generation.emotion)}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Idioma:</span>
                          <div className="font-semibold capitalize">{generation.metadata.language}</div>
                        </div>
                      </div>
                    </div>
                    
                    {generation.feedback && (
                      <div className="mt-3 pt-3 border-t">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500">Feedback:</span>
                          <div className="flex items-center space-x-1">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`h-3 w-3 ${
                                  i < generation.feedback!.rating 
                                    ? 'text-yellow-500 fill-current' 
                                    : 'text-gray-300'
                                }`} 
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{generation.feedback.comment}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {templates.map((template) => (
              <Card key={template.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Settings className="h-4 w-4" />
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                    </div>
                    <Badge variant="outline" className="capitalize">{template.category}</Badge>
                  </div>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Idioma:</span>
                      <div className="font-semibold capitalize">{template.language}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Dialecto:</span>
                      <div className="font-semibold capitalize">{template.dialect}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Emoción:</span>
                      <div className="font-semibold capitalize">{template.emotion}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Velocidad:</span>
                      <div className="font-semibold">{template.speed}x</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Uso:</span>
                      <span>{formatNumber(template.usage)} veces</span>
                    </div>
                    <Progress 
                      value={(template.usage / 2000) * 100} 
                      className="h-2" 
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-3 w-3 ${
                            i < template.rating 
                              ? 'text-yellow-500 fill-current' 
                              : 'text-gray-300'
                          }`} 
                        />
                      ))}
                      <span className="text-sm text-gray-500">({template.rating})</span>
                    </div>
                    <Button variant="outline" size="sm">
                      <Play className="h-3 w-3 mr-1" />
                      Probar
                    </Button>
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {template.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Métricas de rendimiento */}
            <Card>
              <CardHeader>
                <CardTitle>Métricas de Rendimiento</CardTitle>
                <CardDescription>Análisis de rendimiento del sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Total de Peticiones</span>
                    <Badge variant="secondary">{formatNumber(analytics.performanceMetrics.totalRequests)}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Peticiones Diarias</span>
                    <Badge variant="outline">{formatNumber(analytics.performanceMetrics.dailyRequests)}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Latencia Promedio</span>
                    <Badge variant="secondary">{formatLatency(analytics.performanceMetrics.averageLatency)}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Tasa de Error</span>
                    <Badge variant="outline">{formatPercentage(analytics.performanceMetrics.errorRate)}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tendencias de calidad */}
            <Card>
              <CardHeader>
                <CardTitle>Tendencias de Calidad</CardTitle>
                <CardDescription>Evolución de la calidad de voz</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center bg-gray-50 rounded-lg">
                  <LineChart className="h-12 w-12 text-gray-400" />
                  <span className="ml-2 text-gray-500">Gráfico de tendencias</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
