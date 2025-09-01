'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  Cpu, 
  Zap, 
  Target, 
  BarChart3, 
  Activity,
  Plus,
  Settings,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  Play,
  Pause,
  Clock,
  Star,
  Eye,
  MousePointer,
  MousePointerClick,
  Filter,
  Download,
  RefreshCw,
  PieChart,
  LineChart,
  Scatter,
  Calendar,
  MapPin,
  Globe,
  Smartphone,
  Monitor,
  Bot,
  Lightbulb,
  TrendingUp,
  TrendingDown,
  Users,
  MessageCircle,
  FileText,
  Mic,
  Headphones
} from 'lucide-react';

interface AIModel {
  id: string;
  name: string;
  type: 'chatbot' | 'speech' | 'vision' | 'nlp' | 'recommendation' | 'prediction';
  status: 'active' | 'training' | 'deployed' | 'maintenance' | 'error';
  version: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  latency: number;
  throughput: number;
  lastUpdated: Date;
  trainingData: {
    samples: number;
    features: number;
    lastTraining: Date;
  };
  performance: {
    requests: number;
    successRate: number;
    errorRate: number;
    avgResponseTime: number;
  };
  usage: {
    dailyRequests: number;
    monthlyRequests: number;
    totalRequests: number;
    activeUsers: number;
  };
}

interface AIInteraction {
  id: string;
  userId: string;
  modelId: string;
  modelName: string;
  type: 'text' | 'voice' | 'image' | 'video';
  input: string;
  output: string;
  confidence: number;
  processingTime: number;
  timestamp: Date;
  feedback?: {
    rating: number;
    comment: string;
  };
  metadata: Record<string, any>;
}

interface AIAnalytics {
  totalModels: number;
  activeModels: number;
  totalInteractions: number;
  averageAccuracy: number;
  averageLatency: number;
  successRate: number;
  userSatisfaction: number;
  topModels: AIModel[];
  recentInteractions: AIInteraction[];
  performanceTrends: {
    date: string;
    requests: number;
    accuracy: number;
    latency: number;
  }[];
  userFeedback: {
    positive: number;
    neutral: number;
    negative: number;
    total: number;
  };
}

interface AITrainingJob {
  id: string;
  modelId: string;
  modelName: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  progress: number;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  dataset: string;
  hyperparameters: Record<string, any>;
  metrics: {
    loss: number;
    accuracy: number;
    validationAccuracy: number;
  };
}

export default function AIDashboard() {
  const [models, setModels] = useState<AIModel[]>([]);
  const [interactions, setInteractions] = useState<AIInteraction[]>([]);
  const [analytics, setAnalytics] = useState<AIAnalytics>({
    totalModels: 0,
    activeModels: 0,
    totalInteractions: 0,
    averageAccuracy: 0,
    averageLatency: 0,
    successRate: 0,
    userSatisfaction: 0,
    topModels: [],
    recentInteractions: [],
    performanceTrends: [],
    userFeedback: {
      positive: 0,
      neutral: 0,
      negative: 0,
      total: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<string>('24h');
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    loadAIData();
  }, [timeRange]);

  const loadAIData = async () => {
    setLoading(true);
    try {
      // Simular carga de datos
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockModels: AIModel[] = [
        {
          id: '1',
          name: 'Chatbot Educativo',
          type: 'chatbot',
          status: 'active',
          version: '2.1.0',
          accuracy: 0.94,
          precision: 0.92,
          recall: 0.95,
          f1Score: 0.93,
          latency: 245,
          throughput: 150,
          lastUpdated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          trainingData: {
            samples: 50000,
            features: 1024,
            lastTraining: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          },
          performance: {
            requests: 12470,
            successRate: 0.98,
            errorRate: 0.02,
            avgResponseTime: 245
          },
          usage: {
            dailyRequests: 12470,
            monthlyRequests: 374100,
            totalRequests: 1247000,
            activeUsers: 8900
          }
        },
        {
          id: '2',
          name: 'Reconocimiento de Voz',
          type: 'speech',
          status: 'active',
          version: '1.8.2',
          accuracy: 0.89,
          precision: 0.87,
          recall: 0.91,
          f1Score: 0.89,
          latency: 890,
          throughput: 75,
          lastUpdated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          trainingData: {
            samples: 25000,
            features: 2048,
            lastTraining: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
          },
          performance: {
            requests: 5670,
            successRate: 0.95,
            errorRate: 0.05,
            avgResponseTime: 890
          },
          usage: {
            dailyRequests: 5670,
            monthlyRequests: 170100,
            totalRequests: 567000,
            activeUsers: 3400
          }
        },
        {
          id: '3',
          name: 'Motor de Recomendaciones',
          type: 'recommendation',
          status: 'active',
          version: '3.0.1',
          accuracy: 0.91,
          precision: 0.89,
          recall: 0.93,
          f1Score: 0.91,
          latency: 120,
          throughput: 300,
          lastUpdated: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          trainingData: {
            samples: 100000,
            features: 512,
            lastTraining: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
          },
          performance: {
            requests: 23400,
            successRate: 0.99,
            errorRate: 0.01,
            avgResponseTime: 120
          },
          usage: {
            dailyRequests: 23400,
            monthlyRequests: 702000,
            totalRequests: 2340000,
            activeUsers: 12000
          }
        }
      ];

      const mockInteractions: AIInteraction[] = [
        {
          id: '1',
          userId: 'user1',
          modelId: '1',
          modelName: 'Chatbot Educativo',
          type: 'text',
          input: '¿Cómo puedo mejorar mi aprendizaje?',
          output: 'Te recomiendo establecer metas claras, crear un horario de estudio y usar técnicas de repaso espaciado.',
          confidence: 0.94,
          processingTime: 245,
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          feedback: {
            rating: 5,
            comment: 'Muy útil y claro'
          },
          metadata: { language: 'es', topic: 'learning' }
        },
        {
          id: '2',
          userId: 'user2',
          modelId: '2',
          modelName: 'Reconocimiento de Voz',
          type: 'voice',
          input: 'audio_data_123',
          output: 'Hola, ¿cómo puedo ayudarte hoy?',
          confidence: 0.89,
          processingTime: 890,
          timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
          metadata: { language: 'es', audioQuality: 'high' }
        }
      ];

      setModels(mockModels);
      setInteractions(mockInteractions);
      
      setAnalytics({
        totalModels: 8,
        activeModels: 6,
        totalInteractions: 45678,
        averageAccuracy: 0.91,
        averageLatency: 418,
        successRate: 0.97,
        userSatisfaction: 4.6,
        topModels: mockModels.slice(0, 3),
        recentInteractions: mockInteractions.slice(0, 10),
        performanceTrends: [
          { date: '2024-01-01', requests: 12000, accuracy: 0.91, latency: 420 },
          { date: '2024-01-02', requests: 12500, accuracy: 0.92, latency: 410 },
          { date: '2024-01-03', requests: 13000, accuracy: 0.93, latency: 400 }
        ],
        userFeedback: {
          positive: 3420,
          neutral: 890,
          negative: 256,
          total: 4566
        }
      });
    } catch (error) {
      console.error('Error cargando datos de IA:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'training': return 'bg-blue-100 text-blue-800';
      case 'deployed': return 'bg-purple-100 text-purple-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'chatbot': return <Bot className="h-4 w-4" />;
      case 'speech': return <Mic className="h-4 w-4" />;
      case 'vision': return <Eye className="h-4 w-4" />;
      case 'nlp': return <FileText className="h-4 w-4" />;
      case 'recommendation': return <Lightbulb className="h-4 w-4" />;
      case 'prediction': return <TrendingUp className="h-4 w-4" />;
      default: return <Brain className="h-4 w-4" />;
    }
  };

  const getInteractionIcon = (type: string) => {
    switch (type) {
      case 'text': return <MessageCircle className="h-4 w-4" />;
      case 'voice': return <Mic className="h-4 w-4" />;
      case 'image': return <Eye className="h-4 w-4" />;
      case 'video': return <Play className="h-4 w-4" />;
      default: return <MessageCircle className="h-4 w-4" />;
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

  const filteredModels = models.filter(model => {
    if (filterType === 'all') return true;
    return model.type === filterType;
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
          <h1 className="text-3xl font-bold text-gray-900">Dashboard de IA</h1>
          <p className="text-gray-600">Gestión y análisis de modelos de inteligencia artificial</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Modelo
          </Button>
        </div>
      </div>

      {/* Selector de rango de tiempo */}
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
          <span className="text-sm text-gray-600">Tipo:</span>
          <select 
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="border rounded px-3 py-1 text-sm"
          >
            <option value="all">Todos</option>
            <option value="chatbot">Chatbot</option>
            <option value="speech">Voz</option>
            <option value="vision">Visión</option>
            <option value="nlp">NLP</option>
            <option value="recommendation">Recomendaciones</option>
            <option value="prediction">Predicción</option>
          </select>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Modelos Activos</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
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
            <CardTitle className="text-sm font-medium">Interacciones</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(analytics.totalInteractions)}</div>
            <p className="text-xs text-muted-foreground">
              en el período seleccionado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Precisión Promedio</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(analytics.averageAccuracy)}</div>
            <p className="text-xs text-muted-foreground">
              tasa de éxito general
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
          <TabsTrigger value="interactions">Interacciones</TabsTrigger>
          <TabsTrigger value="performance">Rendimiento</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top modelos */}
            <Card>
              <CardHeader>
                <CardTitle>Mejores Modelos</CardTitle>
                <CardDescription>Modelos con mejor rendimiento y precisión</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.topModels.map((model, index) => (
                    <div key={model.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-semibold">{model.name}</div>
                          <div className="text-sm text-gray-500">{model.type}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{formatPercentage(model.accuracy)}</div>
                        <div className="text-sm text-gray-500">
                          {formatNumber(model.usage.dailyRequests)} req/día
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Métricas de rendimiento */}
            <Card>
              <CardHeader>
                <CardTitle>Métricas de Rendimiento</CardTitle>
                <CardDescription>Indicadores clave de rendimiento</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Tasa de Éxito</span>
                    <Badge variant="secondary">{formatPercentage(analytics.successRate)}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Satisfacción del Usuario</span>
                    <Badge variant="outline">⭐ {analytics.userSatisfaction}/5</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Usuarios Activos</span>
                    <Badge variant="secondary">{formatNumber(analytics.topModels.reduce((sum, m) => sum + m.usage.activeUsers, 0))}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Total de Peticiones</span>
                    <Badge variant="outline">{formatNumber(analytics.topModels.reduce((sum, m) => sum + m.usage.totalRequests, 0))}</Badge>
                  </div>
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
                      {getTypeIcon(model.type)}
                      <CardTitle className="text-lg">{model.name}</CardTitle>
                    </div>
                    <Badge className={getStatusColor(model.status)}>
                      {model.status === 'active' ? 'Activo' :
                       model.status === 'training' ? 'Entrenando' :
                       model.status === 'deployed' ? 'Desplegado' :
                       model.status === 'maintenance' ? 'Mantenimiento' : 'Error'}
                    </Badge>
                  </div>
                  <CardDescription>v{model.version}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Precisión:</span>
                      <div className="font-semibold">{formatPercentage(model.accuracy)}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Latencia:</span>
                      <div className="font-semibold">{formatLatency(model.latency)}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">F1-Score:</span>
                      <div className="font-semibold">{formatPercentage(model.f1Score)}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Throughput:</span>
                      <div className="font-semibold">{model.throughput} req/s</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Peticiones diarias:</span>
                      <span>{formatNumber(model.usage.dailyRequests)}</span>
                    </div>
                    <Progress 
                      value={(model.usage.dailyRequests / 50000) * 100} 
                      className="h-2" 
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{model.type}</Badge>
                    <Badge variant="secondary">{formatNumber(model.usage.activeUsers)} usuarios</Badge>
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

        <TabsContent value="interactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Interacciones Recientes</CardTitle>
              <CardDescription>Últimas interacciones con los modelos de IA</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.recentInteractions.map((interaction) => (
                  <div key={interaction.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        {getInteractionIcon(interaction.type)}
                        <div>
                          <div className="font-semibold">{interaction.modelName}</div>
                          <div className="text-sm text-gray-500">
                            {interaction.timestamp.toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{formatPercentage(interaction.confidence)}</div>
                        <div className="text-sm text-gray-500">
                          {formatLatency(interaction.processingTime)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm text-gray-500">Entrada:</span>
                        <p className="text-sm">{interaction.input}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Respuesta:</span>
                        <p className="text-sm">{interaction.output}</p>
                      </div>
                    </div>
                    
                    {interaction.feedback && (
                      <div className="mt-3 pt-3 border-t">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500">Feedback:</span>
                          <div className="flex items-center space-x-1">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`h-3 w-3 ${
                                  i < interaction.feedback!.rating 
                                    ? 'text-yellow-500 fill-current' 
                                    : 'text-gray-300'
                                }`} 
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{interaction.feedback.comment}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico de rendimiento */}
            <Card>
              <CardHeader>
                <CardTitle>Tendencias de Rendimiento</CardTitle>
                <CardDescription>Evolución de métricas clave</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center bg-gray-50 rounded-lg">
                  <LineChart className="h-12 w-12 text-gray-400" />
                  <span className="ml-2 text-gray-500">Gráfico de rendimiento</span>
                </div>
              </CardContent>
            </Card>

            {/* Métricas detalladas */}
            <Card>
              <CardHeader>
                <CardTitle>Métricas Detalladas</CardTitle>
                <CardDescription>Análisis profundo del rendimiento</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Precisión Promedio</span>
                    <Badge variant="secondary">{formatPercentage(analytics.averageAccuracy)}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Latencia Promedio</span>
                    <Badge variant="outline">{formatLatency(analytics.averageLatency)}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Tasa de Éxito</span>
                    <Badge variant="secondary">{formatPercentage(analytics.successRate)}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Usuarios Satisfechos</span>
                    <Badge variant="outline">{formatPercentage(analytics.userSatisfaction / 5)}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="feedback" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Distribución de feedback */}
            <Card>
              <CardHeader>
                <CardTitle>Distribución de Feedback</CardTitle>
                <CardDescription>Análisis de satisfacción del usuario</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Positivo</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={(analytics.userFeedback.positive / analytics.userFeedback.total) * 100} className="w-20" />
                      <Badge variant="default">{formatNumber(analytics.userFeedback.positive)}</Badge>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Neutral</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={(analytics.userFeedback.neutral / analytics.userFeedback.total) * 100} className="w-20" />
                      <Badge variant="secondary">{formatNumber(analytics.userFeedback.neutral)}</Badge>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Negativo</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={(analytics.userFeedback.negative / analytics.userFeedback.total) * 100} className="w-20" />
                      <Badge variant="destructive">{formatNumber(analytics.userFeedback.negative)}</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Comentarios recientes */}
            <Card>
              <CardHeader>
                <CardTitle>Comentarios Recientes</CardTitle>
                <CardDescription>Últimos comentarios de usuarios</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.recentInteractions
                    .filter(i => i.feedback)
                    .slice(0, 5)
                    .map((interaction) => (
                      <div key={interaction.id} className="border rounded p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">{interaction.modelName}</span>
                          <div className="flex items-center space-x-1">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`h-3 w-3 ${
                                  i < interaction.feedback!.rating 
                                    ? 'text-yellow-500 fill-current' 
                                    : 'text-gray-300'
                                }`} 
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">{interaction.feedback!.comment}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {interaction.timestamp.toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
