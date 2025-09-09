'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  HelpCircle,
  RefreshCw,
  Download,
  Save,
  Settings,
  Eye,
  EyeOff,
  BarChart3,
  LineChart,
  PieChart,
  AreaChart,
  Activity,
  Users,
  Clock,
  Calendar,
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
  BookOpen,
  Award,
  Zap,
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
  WifiHigh,
  WifiLow,
  WifiZero,
  BatteryFull,
  Maximize2,
  Minimize2,
  RotateCcw,
  Share2,
  Filter
} from 'lucide-react';
import { format, addDays, subDays, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

interface PredictionData {
  id: string;
  userId?: string;
  type: 'engagement' | 'performance' | 'dropout' | 'completion' | 'behavior';
  metric: string;
  currentValue: number;
  predictedValue: number;
  confidence: number;
  timeframe: '1d' | '7d' | '30d' | '90d';
  factors: PredictionFactor[];
  trend: 'up' | 'down' | 'stable';
  risk: 'low' | 'medium' | 'high';
  lastUpdated: string;
  model: string;
  accuracy: number;
}

interface PredictionFactor {
  name: string;
  weight: number;
  impact: 'positive' | 'negative' | 'neutral';
  description: string;
}

interface ModelPerformance {
  modelId: string;
  name: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  lastTrained: string;
  status: 'active' | 'training' | 'error' | 'deprecated';
  version: string;
}

interface PredictiveAnalyticsProps {
  userId?: string;
  className?: string;
  refreshInterval?: number;
  onPredictionUpdate?: (predictions: PredictionData[]) => void;
  onModelRetrain?: (modelId: string) => void;
  onExport?: (format: 'csv' | 'json' | 'pdf') => void;
}

export const PredictiveAnalytics: React.FC<PredictiveAnalyticsProps> = ({
  userId,
  className = '',
  refreshInterval = 60000,
  onPredictionUpdate,
  onModelRetrain,
  onExport
}) => {
  const [predictions, setPredictions] = useState<PredictionData[]>([]);
  const [models, setModels] = useState<ModelPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('predictions');
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1d' | '7d' | '30d' | '90d'>('7d');
  const [showConfidence, setShowConfidence] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const loadPredictions = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        userId: userId || '',
        timeframe: selectedTimeframe
      });

      const response = await fetch(`/api/analytics/predictions?${params}`);
      
      if (!response.ok) {
        throw new Error('Error cargando predicciones');
      }

      const data = await response.json();
      setPredictions(data.predictions || []);
      setModels(data.models || []);
      
      if (onPredictionUpdate) {
        onPredictionUpdate(data.predictions || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [userId, selectedTimeframe, onPredictionUpdate]);

  const handleModelRetrain = async (modelId: string) => {
    try {
      const response = await fetch('/api/analytics/predictions/retrain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modelId, userId })
      });

      if (response.ok) {
        // Actualizar estado del modelo
        setModels(prev => prev.map(model => 
          model.modelId === modelId 
            ? { ...model, status: 'training' as const }
            : model
        ));
        
        if (onModelRetrain) {
          onModelRetrain(modelId);
        }
      } else {
        throw new Error('Error al reentrenar el modelo');
      }
    } catch (err) {
      console.error('Error retraining model:', err);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-600" />;
      default: return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPredictionTypeIcon = (type: string) => {
    switch (type) {
      case 'engagement': return <Heart className="w-4 h-4" />;
      case 'performance': return <Target className="w-4 h-4" />;
      case 'dropout': return <XCircle className="w-4 h-4" />;
      case 'completion': return <CheckCircle className="w-4 h-4" />;
      case 'behavior': return <Brain className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const filteredPredictions = useMemo(() => {
    return predictions.filter(pred => pred.timeframe === selectedTimeframe);
  }, [predictions, selectedTimeframe]);

  const averageConfidence = useMemo(() => {
    if (filteredPredictions.length === 0) return 0;
    return filteredPredictions.reduce((sum, pred) => sum + pred.confidence, 0) / filteredPredictions.length;
  }, [filteredPredictions]);

  const highRiskPredictions = useMemo(() => {
    return filteredPredictions.filter(pred => pred.risk === 'high');
  }, [filteredPredictions]);

  useEffect(() => {
    loadPredictions();
    
    if (autoRefresh) {
      const interval = setInterval(loadPredictions, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [loadPredictions, autoRefresh, refreshInterval]);

  if (loading) {
    return (
      <Card className={`${className} ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
        <CardContent className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" 
               role="status" 
               aria-label="Cargando predicciones">
            <span className="sr-only">Cargando...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
            <p>Error: {error}</p>
            <Button onClick={loadPredictions} className="mt-4">
              <RefreshCw className="w-4 h-4 mr-2" />
              Reintentar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${className} ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="w-5 h-5" />
            <CardTitle>Analytics Predictivo</CardTitle>
            <Badge variant="outline" className="ml-2">
              {filteredPredictions.length} predicciones
            </Badge>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowConfidence(!showConfidence)}
              aria-label={showConfidence ? 'Ocultar confianza' : 'Mostrar confianza'}
            >
              {showConfidence ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              Confianza
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
              aria-label={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onExport?.('csv')}
              aria-label="Exportar como CSV"
            >
              <Download className="w-4 h-4 mr-1" />
              CSV
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Métricas resumidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Target className="w-4 h-4 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Confianza Promedio</p>
                  <p className="text-lg font-semibold">
                    {Math.round(averageConfidence * 100)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <div>
                  <p className="text-sm text-gray-600">Alto Riesgo</p>
                  <p className="text-lg font-semibold">
                    {highRiskPredictions.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Brain className="w-4 h-4 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Modelos Activos</p>
                  <p className="text-lg font-semibold">
                    {models.filter(m => m.status === 'active').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Tendencias Positivas</p>
                  <p className="text-lg font-semibold">
                    {filteredPredictions.filter(p => p.trend === 'up').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Selector de timeframe */}
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium">Período de Predicción:</span>
          <div className="flex space-x-2">
            {(['1d', '7d', '30d', '90d'] as const).map((timeframe) => (
              <Button
                key={timeframe}
                variant={selectedTimeframe === timeframe ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedTimeframe(timeframe)}
              >
                {timeframe === '1d' && '1 día'}
                {timeframe === '7d' && '7 días'}
                {timeframe === '30d' && '30 días'}
                {timeframe === '90d' && '90 días'}
              </Button>
            ))}
          </div>
        </div>

        {/* Tabs principales */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="predictions">Predicciones</TabsTrigger>
            <TabsTrigger value="models">Modelos</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="predictions" className="space-y-4">
            {filteredPredictions.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Brain className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600">No hay predicciones disponibles</h3>
                  <p className="text-gray-500">Los modelos están procesando datos para generar predicciones</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredPredictions.map((prediction) => (
                  <Card key={prediction.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getPredictionTypeIcon(prediction.type)}
                          <CardTitle className="text-lg">{prediction.metric}</CardTitle>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getTrendIcon(prediction.trend)}
                          <Badge className={getRiskColor(prediction.risk)}>
                            {prediction.risk.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Valores actual vs predicho */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Valor Actual</p>
                          <p className="text-2xl font-bold">{prediction.currentValue}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Valor Predicho</p>
                          <p className="text-2xl font-bold text-blue-600">
                            {prediction.predictedValue}
                          </p>
                        </div>
                      </div>

                      {/* Barra de confianza */}
                      {showConfidence && (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600">Confianza del Modelo</span>
                            <span className={`text-sm font-medium ${getConfidenceColor(prediction.confidence)}`}>
                              {Math.round(prediction.confidence * 100)}%
                            </span>
                          </div>
                          <Progress value={prediction.confidence * 100} className="h-2" />
                        </div>
                      )}

                      {/* Factores principales */}
                      <div>
                        <p className="text-sm font-medium mb-2">Factores Principales</p>
                        <div className="space-y-2">
                          {prediction.factors.slice(0, 3).map((factor, index) => (
                            <div key={index} className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">{factor.name}</span>
                              <div className="flex items-center space-x-2">
                                <span className={`px-2 py-1 rounded text-xs ${
                                  factor.impact === 'positive' ? 'bg-green-100 text-green-800' :
                                  factor.impact === 'negative' ? 'bg-red-100 text-red-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {factor.impact === 'positive' ? '+' : 
                                   factor.impact === 'negative' ? '-' : '='}
                                </span>
                                <span className="text-gray-500">{Math.round(factor.weight * 100)}%</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Información adicional */}
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Modelo: {prediction.model}</span>
                        <span>Actualizado: {format(parseISO(prediction.lastUpdated), 'dd/MM HH:mm')}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="models" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {models.map((model) => (
                <Card key={model.modelId} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{model.name}</CardTitle>
                      <Badge className={
                        model.status === 'active' ? 'bg-green-100 text-green-800' :
                        model.status === 'training' ? 'bg-yellow-100 text-yellow-800' :
                        model.status === 'error' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }>
                        {model.status.toUpperCase()}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Métricas del modelo */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Precisión</p>
                        <p className="text-lg font-semibold">{Math.round(model.accuracy * 100)}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">F1-Score</p>
                        <p className="text-lg font-semibold">{Math.round(model.f1Score * 100)}%</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Precisión</p>
                        <p className="text-lg font-semibold">{Math.round(model.precision * 100)}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Recall</p>
                        <p className="text-lg font-semibold">{Math.round(model.recall * 100)}%</p>
                      </div>
                    </div>

                    {/* Información del modelo */}
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Versión:</span>
                        <span>{model.version}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Último entrenamiento:</span>
                        <span>{format(parseISO(model.lastTrained), 'dd/MM/yyyy')}</span>
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleModelRetrain(model.modelId)}
                        disabled={model.status === 'training'}
                        className="flex-1"
                      >
                        <RefreshCw className="w-4 h-4 mr-1" />
                        Reentrenar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        <Settings className="w-4 h-4 mr-1" />
                        Configurar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Insights de alto riesgo */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <span>Alertas de Alto Riesgo</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {highRiskPredictions.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No hay alertas de alto riesgo</p>
                  ) : (
                    <div className="space-y-3">
                      {highRiskPredictions.slice(0, 5).map((prediction) => (
                        <div key={prediction.id} className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg">
                          {getPredictionTypeIcon(prediction.type)}
                          <div className="flex-1">
                            <p className="font-medium">{prediction.metric}</p>
                            <p className="text-sm text-gray-600">
                              Predicción: {prediction.predictedValue} (actual: {prediction.currentValue})
                            </p>
                          </div>
                          <Badge className="bg-red-100 text-red-800">
                            {Math.round(prediction.confidence * 100)}%
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recomendaciones */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Lightbulb className="w-5 h-5 text-yellow-600" />
                    <span>Recomendaciones</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="font-medium text-blue-800">Optimizar Horarios de Estudio</p>
                      <p className="text-sm text-blue-600">
                        Basado en los patrones de actividad, se recomienda programar lecciones entre 14:00-16:00
                      </p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="font-medium text-green-800">Reforzar Contenido Cultural</p>
                      <p className="text-sm text-green-600">
                        El engagement con contenido cultural es 25% mayor que el promedio
                      </p>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <p className="font-medium text-purple-800">Intervención Temprana</p>
                      <p className="text-sm text-purple-600">
                        Identificar estudiantes en riesgo de abandono para intervención preventiva
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default PredictiveAnalytics;
