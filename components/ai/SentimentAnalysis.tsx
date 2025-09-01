/**
 * Componente de Análisis de Sentimientos en Tiempo Real
 * Detecta emociones del estudiante y adapta contenido según estado emocional
 * Incluye alertas para maestros sobre estudiantes en riesgo
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  Heart, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  Activity,
  Mic,
  MicOff,
  Send,
  RefreshCw,
  BarChart3,
  Users,
  Clock
} from 'lucide-react';

interface SentimentData {
  text?: string;
  audioFeatures?: number[];
  behavioralMetrics?: {
    responseTime: number;
    clickPattern: number[];
    scrollBehavior: number[];
    interactionFrequency: number;
  };
  context?: {
    activityType: string;
    contentId?: string;
    sessionId?: string;
    timestamp: Date;
  };
}

interface SentimentResult {
  sentimentScore: number;
  emotion: string;
  confidence: number;
  intensity: number;
  stressLevel: number;
  engagementLevel: number;
  frustrationLevel: number;
  isAlert: boolean;
  alertType?: string;
  alertMessage?: string;
  recommendations: string[];
}

interface DropoutPrediction {
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  probability: number;
  factors: string[];
  recommendations: string[];
  confidence: number;
}

interface EmotionTrend {
  date: Date;
  timeSlot: number;
  avgSentiment: number;
  dominantEmotion: string;
  stressTrend: number;
  engagementTrend: number;
  totalAnalyses: number;
  positiveCount: number;
  negativeCount: number;
  neutralCount: number;
}

interface SentimentAlert {
  id: string;
  alertType: string;
  severity: string;
  message: string;
  createdAt: Date;
  student: {
    id: string;
    name: string;
    age: number;
  };
}

export const SentimentAnalysis: React.FC = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentResult, setCurrentResult] = useState<SentimentResult | null>(null);
  const [textInput, setTextInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [studentId, setStudentId] = useState('student-123'); // Demo
  const [activeTab, setActiveTab] = useState('realtime');
  const [trends, setTrends] = useState<EmotionTrend[]>([]);
  const [alerts, setAlerts] = useState<SentimentAlert[]>([]);
  const [dropoutPrediction, setDropoutPrediction] = useState<DropoutPrediction | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Configuración de colores para emociones
  const emotionColors = {
    JOY: 'bg-green-500',
    SADNESS: 'bg-blue-500',
    ANGER: 'bg-red-500',
    FEAR: 'bg-purple-500',
    SURPRISE: 'bg-yellow-500',
    DISGUST: 'bg-orange-500',
    NEUTRAL: 'bg-gray-500',
    CONFUSION: 'bg-indigo-500',
    FRUSTRATION: 'bg-red-600',
    EXCITEMENT: 'bg-green-600',
    ANXIETY: 'bg-purple-600',
    BOREDOM: 'bg-gray-600',
    CONFIDENCE: 'bg-emerald-500',
    UNCERTAINTY: 'bg-amber-500'
  };

  // Configuración de colores para niveles de riesgo
  const riskColors = {
    LOW: 'bg-green-500',
    MEDIUM: 'bg-yellow-500',
    HIGH: 'bg-orange-500',
    CRITICAL: 'bg-red-500'
  };

  useEffect(() => {
    // Cargar datos iniciales
    loadInitialData();
    
    // Configurar intervalos para actualizaciones
    const interval = setInterval(() => {
      loadAlerts();
      loadTrends();
    }, 30000); // Actualizar cada 30 segundos

    return () => clearInterval(interval);
  }, []);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        loadAlerts(),
        loadTrends(),
        loadDropoutPrediction()
      ]);
    } catch (error) {
      console.error('Error cargando datos iniciales:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAlerts = async () => {
    try {
      const response = await fetch(`/api/ai/sentiment-analysis/alerts?teacherId=${studentId}`);
      const data = await response.json();
      if (data.success) {
        setAlerts(data.alerts);
      }
    } catch (error) {
      console.error('Error cargando alertas:', error);
    }
  };

  const loadTrends = async () => {
    try {
      const response = await fetch(`/api/ai/sentiment-analysis/trends?studentId=${studentId}&days=7`);
      const data = await response.json();
      if (data.success) {
        setTrends(data.trends);
      }
    } catch (error) {
      console.error('Error cargando tendencias:', error);
    }
  };

  const loadDropoutPrediction = async () => {
    try {
      const response = await fetch('/api/ai/sentiment-analysis/dropout-prediction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId })
      });
      const data = await response.json();
      if (data.success) {
        setDropoutPrediction(data.prediction);
      }
    } catch (error) {
      console.error('Error cargando predicción de abandono:', error);
    }
  };

  const analyzeTextSentiment = async () => {
    if (!textInput.trim()) return;

    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/ai/sentiment-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          text: textInput,
          context: {
            activityType: 'text_analysis',
            timestamp: new Date()
          }
        })
      });

      const data = await response.json();
      if (data.success) {
        setCurrentResult(data.result);
        setTextInput('');
      }
    } catch (error) {
      console.error('Error analizando sentimientos:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const startAudioRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await analyzeAudioSentiment(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error iniciando grabación:', error);
    }
  };

  const stopAudioRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const analyzeAudioSentiment = async (audioBlob: Blob) => {
    setIsAnalyzing(true);
    try {
      // Convertir audio a características (simulado)
      const audioFeatures = Array.from({ length: 15 }, () => Math.random());
      
      const response = await fetch('/api/ai/sentiment-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          audioFeatures,
          context: {
            activityType: 'audio_analysis',
            timestamp: new Date()
          }
        })
      });

      const data = await response.json();
      if (data.success) {
        setCurrentResult(data.result);
      }
    } catch (error) {
      console.error('Error analizando audio:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const analyzeBehavioralSentiment = async () => {
    setIsAnalyzing(true);
    try {
      // Simular métricas de comportamiento
      const behavioralMetrics = {
        responseTime: Math.random() * 10000,
        clickPattern: Array.from({ length: 10 }, () => Math.random()),
        scrollBehavior: Array.from({ length: 10 }, () => Math.random()),
        interactionFrequency: Math.random() * 100
      };

      const response = await fetch('/api/ai/sentiment-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          behavioralMetrics,
          context: {
            activityType: 'behavioral_analysis',
            timestamp: new Date()
          }
        })
      });

      const data = await response.json();
      if (data.success) {
        setCurrentResult(data.result);
      }
    } catch (error) {
      console.error('Error analizando comportamiento:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resolveAlert = async (alertId: string) => {
    try {
      const response = await fetch('/api/ai/sentiment-analysis/alerts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alertId,
          resolutionNotes: 'Resuelto por el maestro'
        })
      });

      if (response.ok) {
        setAlerts(alerts.filter(alert => alert.id !== alertId));
      }
    } catch (error) {
      console.error('Error resolviendo alerta:', error);
    }
  };

  const getSentimentColor = (score: number) => {
    if (score > 0.5) return 'text-green-600';
    if (score < -0.5) return 'text-red-600';
    return 'text-yellow-600';
  };

  const getSentimentIcon = (score: number) => {
    if (score > 0.5) return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (score < -0.5) return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <Activity className="w-4 h-4 text-yellow-600" />;
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Brain className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold">Análisis de Sentimientos en Tiempo Real</h1>
        </div>
        <Button 
          onClick={loadInitialData} 
          disabled={isLoading}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="realtime" className="flex items-center space-x-2">
            <Activity className="w-4 h-4" />
            <span>Tiempo Real</span>
          </TabsTrigger>
          <TabsTrigger value="trends" className="flex items-center space-x-2">
            <BarChart3 className="w-4 h-4" />
            <span>Tendencias</span>
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4" />
            <span>Alertas</span>
            {alerts.length > 0 && (
              <Badge variant="destructive" className="ml-1">
                {alerts.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="dropout" className="flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span>Riesgo Abandono</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab: Análisis en Tiempo Real */}
        <TabsContent value="realtime" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Panel de Entrada */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Heart className="w-5 h-5" />
                  <span>Análisis de Sentimientos</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Análisis de Texto */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Análisis de Texto</label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      placeholder="Escribe algo para analizar sentimientos..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={isAnalyzing}
                    />
                    <Button 
                      onClick={analyzeTextSentiment}
                      disabled={!textInput.trim() || isAnalyzing}
                      size="sm"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Análisis de Audio */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Análisis de Audio</label>
                  <Button
                    onClick={isRecording ? stopAudioRecording : startAudioRecording}
                    variant={isRecording ? "destructive" : "outline"}
                    className="w-full"
                    disabled={isAnalyzing}
                  >
                    {isRecording ? (
                      <>
                        <MicOff className="w-4 h-4 mr-2" />
                        Detener Grabación
                      </>
                    ) : (
                      <>
                        <Mic className="w-4 h-4 mr-2" />
                        Iniciar Grabación
                      </>
                    )}
                  </Button>
                </div>

                {/* Análisis de Comportamiento */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Análisis de Comportamiento</label>
                  <Button
                    onClick={analyzeBehavioralSentiment}
                    variant="outline"
                    className="w-full"
                    disabled={isAnalyzing}
                  >
                    <Activity className="w-4 h-4 mr-2" />
                    Analizar Comportamiento
                  </Button>
                </div>

                {isAnalyzing && (
                  <div className="flex items-center justify-center py-4">
                    <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
                    <span className="ml-2">Analizando sentimientos...</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Panel de Resultados */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="w-5 h-5" />
                  <span>Resultados del Análisis</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {currentResult ? (
                  <div className="space-y-4">
                    {/* Emoción Detectada */}
                    <div className="text-center">
                      <Badge 
                        className={`text-white ${emotionColors[currentResult.emotion as keyof typeof emotionColors] || 'bg-gray-500'}`}
                        variant="secondary"
                      >
                        {currentResult.emotion}
                      </Badge>
                      <p className="text-sm text-gray-600 mt-1">
                        Confianza: {(currentResult.confidence * 100).toFixed(1)}%
                      </p>
                    </div>

                    {/* Puntuación de Sentimientos */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Sentimiento General</span>
                        <div className="flex items-center space-x-1">
                          {getSentimentIcon(currentResult.sentimentScore)}
                          <span className={`font-semibold ${getSentimentColor(currentResult.sentimentScore)}`}>
                            {(currentResult.sentimentScore * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                      <Progress 
                        value={(currentResult.sentimentScore + 1) * 50} 
                        className="h-2"
                      />
                    </div>

                    {/* Métricas Adicionales */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Estrés</span>
                          <span className="text-sm font-medium">
                            {(currentResult.stressLevel * 100).toFixed(0)}%
                          </span>
                        </div>
                        <Progress value={currentResult.stressLevel * 100} className="h-2" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Participación</span>
                          <span className="text-sm font-medium">
                            {(currentResult.engagementLevel * 100).toFixed(0)}%
                          </span>
                        </div>
                        <Progress value={currentResult.engagementLevel * 100} className="h-2" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Frustración</span>
                          <span className="text-sm font-medium">
                            {(currentResult.frustrationLevel * 100).toFixed(0)}%
                          </span>
                        </div>
                        <Progress value={currentResult.frustrationLevel * 100} className="h-2" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Intensidad</span>
                          <span className="text-sm font-medium">
                            {(currentResult.intensity * 100).toFixed(0)}%
                          </span>
                        </div>
                        <Progress value={currentResult.intensity * 100} className="h-2" />
                      </div>
                    </div>

                    {/* Alertas */}
                    {currentResult.isAlert && (
                      <Alert className="border-red-200 bg-red-50">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-800">
                          <strong>Alerta:</strong> {currentResult.alertMessage}
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* Recomendaciones */}
                    {currentResult.recommendations.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">Recomendaciones:</h4>
                        <ul className="space-y-1">
                          {currentResult.recommendations.map((rec, index) => (
                            <li key={index} className="text-sm text-gray-600 flex items-start">
                              <span className="text-blue-500 mr-2">•</span>
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Brain className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Realiza un análisis para ver los resultados</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab: Tendencias */}
        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5" />
                <span>Tendencias de Emociones (Últimos 7 días)</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {trends.length > 0 ? (
                <div className="space-y-4">
                  {trends.map((trend, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <span className="font-medium">
                            {new Date(trend.date).toLocaleDateString()} - Hora {trend.timeSlot}:00
                          </span>
                        </div>
                        <Badge 
                          className={`text-white ${emotionColors[trend.dominantEmotion as keyof typeof emotionColors] || 'bg-gray-500'}`}
                        >
                          {trend.dominantEmotion}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Sentimiento Promedio:</span>
                          <span className={`ml-2 font-medium ${getSentimentColor(trend.avgSentiment)}`}>
                            {(trend.avgSentiment * 100).toFixed(0)}%
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Análisis Totales:</span>
                          <span className="ml-2 font-medium">{trend.totalAnalyses}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No hay datos de tendencias disponibles</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Alertas */}
        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5" />
                <span>Alertas de Sentimientos</span>
                {alerts.length > 0 && (
                  <Badge variant="destructive">
                    {alerts.length} sin resolver
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {alerts.length > 0 ? (
                <div className="space-y-4">
                  {alerts.map((alert) => (
                    <Alert key={alert.id} className="border-orange-200 bg-orange-50">
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                      <AlertDescription className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <strong className="text-orange-800">
                              {alert.alertType} - {alert.severity}
                            </strong>
                            <p className="text-orange-700 mt-1">{alert.message}</p>
                            <p className="text-sm text-orange-600 mt-1">
                              Estudiante: {alert.student.name} ({alert.student.age} años)
                            </p>
                            <p className="text-sm text-orange-600">
                              {new Date(alert.createdAt).toLocaleString()}
                            </p>
                          </div>
                          <Button
                            onClick={() => resolveAlert(alert.id)}
                            size="sm"
                            variant="outline"
                          >
                            Resolver
                          </Button>
                        </div>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No hay alertas pendientes</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Riesgo de Abandono */}
        <TabsContent value="dropout" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Predicción de Riesgo de Abandono</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dropoutPrediction ? (
                <div className="space-y-4">
                  {/* Nivel de Riesgo */}
                  <div className="text-center">
                    <Badge 
                      className={`text-white text-lg px-4 py-2 ${riskColors[dropoutPrediction.riskLevel]}`}
                    >
                      Riesgo {dropoutPrediction.riskLevel}
                    </Badge>
                    <p className="text-sm text-gray-600 mt-2">
                      Probabilidad: {(dropoutPrediction.probability * 100).toFixed(1)}%
                    </p>
                    <p className="text-sm text-gray-600">
                      Confianza del modelo: {(dropoutPrediction.confidence * 100).toFixed(1)}%
                    </p>
                  </div>

                  {/* Factores de Riesgo */}
                  {dropoutPrediction.factors.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium">Factores de Riesgo Identificados:</h4>
                      <ul className="space-y-1">
                        {dropoutPrediction.factors.map((factor, index) => (
                          <li key={index} className="text-sm text-gray-600 flex items-start">
                            <span className="text-red-500 mr-2">⚠</span>
                            {factor}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Recomendaciones */}
                  {dropoutPrediction.recommendations.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium">Recomendaciones de Intervención:</h4>
                      <ul className="space-y-1">
                        {dropoutPrediction.recommendations.map((rec, index) => (
                          <li key={index} className="text-sm text-gray-600 flex items-start">
                            <span className="text-blue-500 mr-2">•</span>
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No hay predicción de riesgo disponible</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
