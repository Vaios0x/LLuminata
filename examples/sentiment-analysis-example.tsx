/**
 * Ejemplo de uso del Hook de Análisis de Sentimientos
 * Demuestra cómo integrar el análisis de sentimientos en componentes React
 */

'use client';

import React, { useState } from 'react';
import { useSentimentAnalysis } from '@/lib/hooks/useSentimentAnalysis';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  RefreshCw
} from 'lucide-react';

export const SentimentAnalysisExample: React.FC = () => {
  const [textInput, setTextInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  // Usar el hook de análisis de sentimientos
  const {
    isAnalyzing,
    isLoading,
    currentResult,
    trends,
    alerts,
    dropoutPrediction,
    error,
    analyzeTextSentiment,
    analyzeAudioSentiment,
    analyzeBehavioralSentiment,
    loadTrends,
    loadAlerts,
    loadDropoutPrediction,
    resolveAlert,
    refreshData,
    clearError
  } = useSentimentAnalysis({
    studentId: 'student-123',
    autoRefresh: true,
    refreshInterval: 30000,
    enableRealTime: true
  });

  // Función para analizar texto
  const handleTextAnalysis = async () => {
    if (!textInput.trim()) return;
    
    const result = await analyzeTextSentiment(textInput, {
      activityType: 'lesson_response',
      contentId: 'lesson-456'
    });
    
    if (result) {
      console.log('Análisis completado:', result);
    }
  };

  // Función para analizar comportamiento
  const handleBehavioralAnalysis = async () => {
    const behavioralMetrics = {
      responseTime: Math.random() * 10000,
      clickPattern: Array.from({ length: 10 }, () => Math.random()),
      scrollBehavior: Array.from({ length: 10 }, () => Math.random()),
      interactionFrequency: Math.random() * 100
    };

    const result = await analyzeBehavioralSentiment(behavioralMetrics, {
      activityType: 'interactive_exercise',
      contentId: 'exercise-789'
    });

    if (result) {
      console.log('Análisis de comportamiento completado:', result);
    }
  };

  // Función para simular análisis de audio
  const handleAudioAnalysis = async () => {
    const audioFeatures = Array.from({ length: 15 }, () => Math.random());
    
    const result = await analyzeAudioSentiment(audioFeatures, {
      activityType: 'voice_interaction',
      contentId: 'voice-lesson-123'
    });

    if (result) {
      console.log('Análisis de audio completado:', result);
    }
  };

  // Función para resolver alerta
  const handleResolveAlert = async (alertId: string) => {
    const success = await resolveAlert(alertId, 'Resuelto desde el ejemplo');
    if (success) {
      console.log('Alerta resuelta exitosamente');
    }
  };

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
          <h1 className="text-2xl font-bold">Ejemplo: Análisis de Sentimientos</h1>
        </div>
        <Button 
          onClick={refreshData} 
          disabled={isLoading}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      {/* Mostrar errores */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {error}
            <Button 
              onClick={clearError} 
              variant="outline" 
              size="sm" 
              className="ml-2"
            >
              Cerrar
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panel de Entrada */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Heart className="w-5 h-5" />
              <span>Pruebas de Análisis</span>
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
                  placeholder="Escribe algo para analizar..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isAnalyzing}
                />
                <Button 
                  onClick={handleTextAnalysis}
                  disabled={!textInput.trim() || isAnalyzing}
                  size="sm"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Análisis de Audio */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Análisis de Audio (Simulado)</label>
              <Button
                onClick={handleAudioAnalysis}
                variant="outline"
                className="w-full"
                disabled={isAnalyzing}
              >
                <Mic className="w-4 h-4 mr-2" />
                Analizar Audio
              </Button>
            </div>

            {/* Análisis de Comportamiento */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Análisis de Comportamiento</label>
              <Button
                onClick={handleBehavioralAnalysis}
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

      {/* Panel de Alertas */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5" />
              <span>Alertas Activas ({alerts.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
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
                        onClick={() => handleResolveAlert(alert.id)}
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
          </CardContent>
        </Card>
      )}

      {/* Panel de Predicción de Abandono */}
      {dropoutPrediction && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5" />
              <span>Predicción de Riesgo de Abandono</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <Badge 
                  className={`text-white text-lg px-4 py-2 ${
                    dropoutPrediction.riskLevel === 'CRITICAL' ? 'bg-red-500' :
                    dropoutPrediction.riskLevel === 'HIGH' ? 'bg-orange-500' :
                    dropoutPrediction.riskLevel === 'MEDIUM' ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`}
                >
                  Riesgo {dropoutPrediction.riskLevel}
                </Badge>
                <p className="text-sm text-gray-600 mt-2">
                  Probabilidad: {(dropoutPrediction.probability * 100).toFixed(1)}%
                </p>
              </div>

              {dropoutPrediction.factors.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Factores de Riesgo:</h4>
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

              {dropoutPrediction.recommendations.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Recomendaciones:</h4>
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
          </CardContent>
        </Card>
      )}

      {/* Panel de Tendencias */}
      {trends.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span>Tendencias de Emociones</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {trends.slice(0, 5).map((trend, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">
                      {new Date(trend.date).toLocaleDateString()} - Hora {trend.timeSlot}:00
                    </span>
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
          </CardContent>
        </Card>
      )}
    </div>
  );
};
