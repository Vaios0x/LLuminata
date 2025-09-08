'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Brain,
  TrendingUp,
  TrendingDown,
  Target,
  Users,
  Clock,
  Calendar,
  BarChart3,
  PieChart,
  LineChart,
  Activity,
  Zap,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  HelpCircle,
  Settings,
  Filter,
  Search,
  Plus,
  Minus,
  Edit,
  Trash2,
  Copy,
  ExternalLink,
  Link,
  Unlink,
  Lock,
  Unlock,
  Shield,
  Key,
  Bell,
  Mail,
  Phone,
  Video,
  Image,
  FileText,
  File,
  Folder,
  FolderOpen,
  Database,
  Server,
  Cpu,
  HardDrive,
  Wifi,
  Signal,
  Battery,
  BatteryCharging,
  WifiOff,
  SignalHigh,
  SignalMedium,
  SignalLow,
  SignalZero,
  MapPin,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  Lightbulb,
  GraduationCap,
  Trophy,
  Star,
  Heart,
  MessageSquare,
  Share2,
  Bookmark,
  Play,
  Pause,
  SkipForward,
  Rewind,
  Volume2,
  VolumeX,
  Download,
  RefreshCw,
  Save,
  Maximize2,
  Minimize2,
  RotateCcw,
  Eye,
  MousePointer,
  Scroll,
  Move,
  Award,
  Crown,
  Coins,
  Gift,
  Package,
  Tag,
  Percent,
  Equal,
  ArrowUp,
  ArrowDown,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  ArrowUpLeft,
  ArrowDownLeft,
  CornerUpLeft,
  CornerUpRight,
  CornerDownLeft,
  CornerDownRight,
  MoveUp,
  MoveDown,
  MoveLeft,
  MoveRight,
  RotateCw,




} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PredictionModel {
  id: string;
  name: string;
  type: 'regression' | 'classification' | 'clustering' | 'time_series';
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  status: 'active' | 'training' | 'error' | 'inactive';
  lastUpdated: Date;
  features: string[];
  target: string;
  description: string;
}

interface Prediction {
  id: string;
  modelId: string;
  userId?: string;
  prediction: number | string;
  confidence: number;
  actualValue?: number | string;
  features: Record<string, any>;
  timestamp: Date;
  status: 'pending' | 'completed' | 'failed';
}

interface PredictionInsight {
  id: string;
  type: 'trend' | 'anomaly' | 'pattern' | 'recommendation';
  title: string;
  description: string;
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  category: 'user_behavior' | 'content_performance' | 'engagement' | 'retention';
  timestamp: Date;
  actionable: boolean;
  actions?: string[];
}

interface TimeSeriesData {
  date: string;
  actual: number;
  predicted: number;
  confidence: number;
}

export default function PredictionsPage() {
  const [models, setModels] = useState<PredictionModel[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [insights, setInsights] = useState<PredictionInsight[]>([]);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'models' | 'predictions' | 'insights' | 'forecasts'>('models');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  // Datos de ejemplo
  const mockModels: PredictionModel[] = [
    {
      id: 'model_1',
      name: 'Modelo de Abandono de Usuarios',
      type: 'classification',
      accuracy: 0.89,
      precision: 0.87,
      recall: 0.91,
      f1Score: 0.89,
      status: 'active',
      lastUpdated: new Date(),
      features: ['session_duration', 'pages_visited', 'last_activity', 'device_type'],
      target: 'churn_probability',
      description: 'Predice la probabilidad de que un usuario abandone la plataforma'
    },
    {
      id: 'model_2',
      name: 'Modelo de Completación de Lecciones',
      type: 'regression',
      accuracy: 0.92,
      precision: 0.90,
      recall: 0.94,
      f1Score: 0.92,
      status: 'active',
      lastUpdated: new Date(Date.now() - 24 * 60 * 60 * 1000),
      features: ['user_level', 'previous_completions', 'time_spent', 'difficulty'],
      target: 'completion_time',
      description: 'Predice el tiempo que tomará completar una lección'
    },
    {
      id: 'model_3',
      name: 'Modelo de Recomendación de Contenido',
      type: 'clustering',
      accuracy: 0.85,
      precision: 0.83,
      recall: 0.87,
      f1Score: 0.85,
      status: 'training',
      lastUpdated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      features: ['user_preferences', 'learning_style', 'cultural_background'],
      target: 'content_cluster',
      description: 'Agrupa usuarios para recomendaciones personalizadas'
    }
  ];

  const mockPredictions: Prediction[] = [
    {
      id: 'pred_1',
      modelId: 'model_1',
      userId: 'user_123',
      prediction: 0.75,
      confidence: 0.89,
      actualValue: 0.80,
      features: {
        session_duration: 45,
        pages_visited: 12,
        last_activity: '2024-01-15',
        device_type: 'mobile'
      },
      timestamp: new Date(),
      status: 'completed'
    },
    {
      id: 'pred_2',
      modelId: 'model_2',
      userId: 'user_456',
      prediction: 25.5,
      confidence: 0.92,
      actualValue: 28.0,
      features: {
        user_level: 5,
        previous_completions: 15,
        time_spent: 120,
        difficulty: 'intermediate'
      },
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      status: 'completed'
    }
  ];

  const mockInsights: PredictionInsight[] = [
    {
      id: 'insight_1',
      type: 'trend',
      title: 'Aumento en la probabilidad de abandono',
      description: 'Los usuarios que pasan menos de 10 minutos por sesión tienen 3x más probabilidad de abandonar',
      confidence: 0.94,
      impact: 'high',
      category: 'user_behavior',
      timestamp: new Date(),
      actionable: true,
      actions: ['Implementar retención temprana', 'Mejorar onboarding']
    },
    {
      id: 'insight_2',
      type: 'anomaly',
      title: 'Patrón inusual en completación de lecciones',
      description: 'Las lecciones de nivel avanzado están siendo completadas más rápido de lo esperado',
      confidence: 0.87,
      impact: 'medium',
      category: 'content_performance',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
      actionable: true,
      actions: ['Revisar dificultad', 'Ajustar contenido']
    }
  ];

  const mockTimeSeriesData: TimeSeriesData[] = Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    actual: Math.floor(Math.random() * 100) + 50,
    predicted: Math.floor(Math.random() * 100) + 50,
    confidence: Math.random() * 0.3 + 0.7
  }));

  useEffect(() => {
    loadPredictionData();
  }, [timeRange]);

  const loadPredictionData = async () => {
    try {
      setIsLoading(true);
      // En producción, esto sería una llamada a la API
      // const response = await fetch(`/api/analytics/predictions?range=${timeRange}`);
      // const data = await response.json();
      
      // Simulando carga
      await new Promise(resolve => setTimeout(resolve, 1000));
      setModels(mockModels);
      setPredictions(mockPredictions);
      setInsights(mockInsights);
      setTimeSeriesData(mockTimeSeriesData);
    } catch (error) {
      console.error('Error loading prediction data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const trainModel = async (modelId: string) => {
    try {
      // En producción, esto sería una llamada a la API
      // await fetch(`/api/analytics/predictions/models/${modelId}/train`, { method: 'POST' });
      
      setModels(prev => prev.map(model => 
        model.id === modelId 
          ? { ...model, status: 'training' as const }
          : model
      ));
    } catch (error) {
      console.error('Error training model:', error);
    }
  };

  const getModelStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'training': return 'text-blue-600 bg-blue-100';
      case 'error': return 'text-red-600 bg-red-100';
      case 'inactive': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getModelTypeIcon = (type: string) => {
    switch (type) {
      case 'regression': return <TrendingUp className="w-4 h-4" />;
      case 'classification': return <Target className="w-4 h-4" />;
      case 'clustering': return <Users className="w-4 h-4" />;
      case 'time_series': return <Clock className="w-4 h-4" />;
      default: return <Brain className="w-4 h-4" />;
    }
  };

  const getInsightImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString('es-MX');
  };

  const formatPercentage = (num: number) => {
    return `${(num * 100).toFixed(1)}%`;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-MX');
  };

  if (isLoading) {
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
            <div className="p-3 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Predicciones y ML</h1>
              <p className="text-gray-600">Modelos de machine learning y análisis predictivo avanzado</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button 
              onClick={() => loadPredictionData()}
              variant="outline"
              className="flex items-center space-x-2"
              tabIndex={0}
              aria-label="Actualizar datos"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Actualizar</span>
            </Button>
            <Button 
              className="flex items-center space-x-2"
              tabIndex={0}
              aria-label="Crear nuevo modelo"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Modelo</span>
            </Button>
          </div>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Brain className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium">Modelos Activos</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {models.filter(m => m.status === 'active').length}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium">Precisión Promedio</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {formatPercentage(models.reduce((sum, m) => sum + m.accuracy, 0) / models.length)}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium">Predicciones Hoy</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {formatNumber(predictions.filter(p => 
                  p.timestamp.toDateString() === new Date().toDateString()
                ).length)}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Lightbulb className="w-5 h-5 text-yellow-600" />
                <span className="text-sm font-medium">Insights Nuevos</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {formatNumber(insights.filter(i => 
                  i.timestamp.toDateString() === new Date().toDateString()
                ).length)}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Filtros */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Rango de Tiempo</label>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                tabIndex={0}
                aria-label="Rango de tiempo"
              >
                <option value="7d">Últimos 7 días</option>
                <option value="30d">Últimos 30 días</option>
                <option value="90d">Últimos 90 días</option>
                <option value="1y">Último año</option>
              </select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Modelo</label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                tabIndex={0}
                aria-label="Filtrar por modelo"
              >
                <option value="">Todos los modelos</option>
                {models.map(model => (
                  <option key={model.id} value={model.id}>{model.name}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs de navegación */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="mb-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="models" tabIndex={0} aria-label="Modelos">Modelos</TabsTrigger>
          <TabsTrigger value="predictions" tabIndex={0} aria-label="Predicciones">Predicciones</TabsTrigger>
          <TabsTrigger value="insights" tabIndex={0} aria-label="Insights">Insights</TabsTrigger>
          <TabsTrigger value="forecasts" tabIndex={0} aria-label="Pronósticos">Pronósticos</TabsTrigger>
        </TabsList>

        <TabsContent value="models" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {models.map((model) => (
              <Card key={model.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getModelTypeIcon(model.type)}
                      <span>{model.name}</span>
                    </div>
                    <Badge className={cn("text-xs", getModelStatusColor(model.status))}>
                      {model.status === 'active' ? 'Activo' :
                       model.status === 'training' ? 'Entrenando' :
                       model.status === 'error' ? 'Error' : 'Inactivo'}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">{model.description}</p>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm text-gray-600">Precisión:</span>
                        <div className="font-bold">{formatPercentage(model.accuracy)}</div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">F1-Score:</span>
                        <div className="font-bold">{formatPercentage(model.f1Score)}</div>
                      </div>
                    </div>
                    
                    <div>
                      <span className="text-sm text-gray-600 block mb-2">Características:</span>
                      <div className="flex flex-wrap gap-1">
                        {model.features.slice(0, 3).map((feature, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                        {model.features.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{model.features.length - 3} más
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-2 border-t">
                      <span className="text-xs text-gray-500">
                        Actualizado: {formatDate(model.lastUpdated)}
                      </span>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => trainModel(model.id)}
                          disabled={model.status === 'training'}
                          tabIndex={0}
                          aria-label="Entrenar modelo"
                        >
                          <RefreshCw className="w-3 h-3 mr-1" />
                          Entrenar
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          tabIndex={0}
                          aria-label="Ver detalles del modelo"
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          Ver
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Predicciones Recientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {predictions.map((prediction) => {
                  const model = models.find(m => m.id === prediction.modelId);
                  return (
                    <div key={prediction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-indigo-500 rounded-lg flex items-center justify-center">
                          <Brain className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="font-medium">{model?.name}</div>
                          <div className="text-sm text-gray-600">
                            Usuario: {prediction.userId}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatDate(prediction.timestamp)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="font-bold">
                          {typeof prediction.prediction === 'number' 
                            ? prediction.prediction.toFixed(2)
                            : prediction.prediction}
                        </div>
                        <div className="text-sm text-gray-600">
                          Confianza: {formatPercentage(prediction.confidence)}
                        </div>
                        {prediction.actualValue && (
                          <div className="text-xs text-gray-500">
                            Real: {typeof prediction.actualValue === 'number' 
                              ? prediction.actualValue.toFixed(2)
                              : prediction.actualValue}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {insights.map((insight) => (
              <Card key={insight.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Lightbulb className="w-5 h-5 text-yellow-600" />
                      <span>{insight.title}</span>
                    </div>
                    <Badge className={cn("text-xs", getInsightImpactColor(insight.impact))}>
                      {insight.impact === 'high' ? 'Alto' :
                       insight.impact === 'medium' ? 'Medio' : 'Bajo'}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">{insight.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Confianza:</span>
                      <span className="font-medium">{formatPercentage(insight.confidence)}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Categoría:</span>
                      <Badge variant="outline" className="text-xs">
                        {insight.category === 'user_behavior' ? 'Comportamiento' :
                         insight.category === 'content_performance' ? 'Contenido' :
                         insight.category === 'engagement' ? 'Engagement' : 'Retención'}
                      </Badge>
                    </div>
                    
                    {insight.actionable && insight.actions && (
                      <div>
                        <span className="text-sm text-gray-600 block mb-2">Acciones recomendadas:</span>
                        <div className="space-y-1">
                          {insight.actions.map((action, index) => (
                            <div key={index} className="flex items-center space-x-2 text-sm">
                              <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                              <span>{action}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="forecasts" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico de series temporales */}
            <Card>
              <CardHeader>
                <CardTitle>Pronóstico de Usuarios Activos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <BarChart3 className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-600">Gráfico de pronóstico</p>
                      <p className="text-xs text-gray-500">Datos reales vs predicciones</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-lg font-bold text-blue-600">
                        {formatNumber(timeSeriesData[timeSeriesData.length - 1]?.actual || 0)}
                      </div>
                      <div className="text-xs text-gray-600">Actual</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-lg font-bold text-green-600">
                        {formatNumber(timeSeriesData[timeSeriesData.length - 1]?.predicted || 0)}
                      </div>
                      <div className="text-xs text-gray-600">Predicción</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Métricas de pronóstico */}
            <Card>
              <CardHeader>
                <CardTitle>Métricas de Pronóstico</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium">Tendencia</span>
                    </div>
                    <span className="font-bold text-green-600">+12.5%</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Target className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium">Precisión</span>
                    </div>
                    <span className="font-bold text-blue-600">94.2%</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4 text-orange-600" />
                      <span className="text-sm font-medium">Margen de Error</span>
                    </div>
                    <span className="font-bold text-orange-600">±5.8%</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-medium">Horizonte</span>
                    </div>
                    <span className="font-bold text-purple-600">30 días</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
