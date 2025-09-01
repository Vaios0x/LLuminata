'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Clock, 
  Target, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
  Eye,
  BarChart3,
  PieChart,
  LineChart,
  Calendar,
  Users,
  BookOpen,
  Lightbulb,
  Zap,
  Star,
  Heart,
  Award,
  Flag,
  Clock3,
  Timer,
  Play,
  Pause,
  RotateCcw,
  Download,
  Share,
  Filter,
  Search,
  Settings,
  RefreshCw,
  Plus,
  Minus,
  Maximize,
  Minimize
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Tipos para análisis de comportamiento
interface BehaviorMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  change: number;
  status: 'excellent' | 'good' | 'warning' | 'critical';
  category: 'engagement' | 'performance' | 'social' | 'emotional' | 'cognitive';
}

interface BehaviorPattern {
  id: string;
  name: string;
  description: string;
  frequency: number;
  confidence: number;
  impact: 'positive' | 'negative' | 'neutral';
  category: string;
  recommendations: string[];
}

interface LearningSession {
  id: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  activities: string[];
  engagement: number;
  performance: number;
  mood: 'positive' | 'neutral' | 'negative';
  notes: string;
}

interface BehavioralAnalysisProps {
  userId: string;
  timeRange?: 'day' | 'week' | 'month' | 'quarter';
  onPatternDetected?: (pattern: BehaviorPattern) => void;
  onRecommendationGenerated?: (recommendation: any) => void;
  onExport?: (data: any) => void;
  className?: string;
}

// Métricas de comportamiento predefinidas
const BEHAVIOR_METRICS: BehaviorMetric[] = [
  {
    id: 'engagement_rate',
    name: 'Tasa de Engagement',
    value: 78,
    unit: '%',
    trend: 'up',
    change: 5.2,
    status: 'good',
    category: 'engagement'
  },
  {
    id: 'completion_rate',
    name: 'Tasa de Completación',
    value: 85,
    unit: '%',
    trend: 'up',
    change: 3.1,
    status: 'excellent',
    category: 'performance'
  },
  {
    id: 'session_duration',
    name: 'Duración de Sesión',
    value: 45,
    unit: 'min',
    trend: 'stable',
    change: 0.5,
    status: 'good',
    category: 'engagement'
  },
  {
    id: 'accuracy_rate',
    name: 'Tasa de Precisión',
    value: 92,
    unit: '%',
    trend: 'up',
    change: 2.8,
    status: 'excellent',
    category: 'performance'
  },
  {
    id: 'social_interactions',
    name: 'Interacciones Sociales',
    value: 12,
    unit: 'por sesión',
    trend: 'up',
    change: 1.5,
    status: 'good',
    category: 'social'
  },
  {
    id: 'emotional_wellbeing',
    name: 'Bienestar Emocional',
    value: 7.8,
    unit: '/10',
    trend: 'up',
    change: 0.3,
    status: 'good',
    category: 'emotional'
  },
  {
    id: 'cognitive_load',
    name: 'Carga Cognitiva',
    value: 65,
    unit: '%',
    trend: 'down',
    change: -8.2,
    status: 'excellent',
    category: 'cognitive'
  },
  {
    id: 'attention_span',
    name: 'Duración de Atención',
    value: 28,
    unit: 'min',
    trend: 'up',
    change: 4.1,
    status: 'good',
    category: 'cognitive'
  }
];

// Patrones de comportamiento predefinidos
const BEHAVIOR_PATTERNS: BehaviorPattern[] = [
  {
    id: 'morning_peak',
    name: 'Pico Matutino',
    description: 'Mayor productividad y engagement en las primeras horas del día',
    frequency: 85,
    confidence: 92,
    impact: 'positive',
    category: 'temporal',
    recommendations: [
      'Programar sesiones importantes en la mañana',
      'Incluir contenido más desafiante en horarios matutinos',
      'Recomendar descansos más largos en la tarde'
    ]
  },
  {
    id: 'social_learning',
    name: 'Aprendizaje Social',
    description: 'Mejor rendimiento cuando interactúa con otros estudiantes',
    frequency: 78,
    confidence: 88,
    impact: 'positive',
    category: 'social',
    recommendations: [
      'Fomentar actividades grupales',
      'Incluir más ejercicios colaborativos',
      'Crear oportunidades de mentoría entre pares'
    ]
  },
  {
    id: 'visual_preference',
    name: 'Preferencia Visual',
    description: 'Mejor retención con contenido visual y gráficos',
    frequency: 92,
    confidence: 95,
    impact: 'positive',
    category: 'cognitive',
    recommendations: [
      'Aumentar contenido visual en las lecciones',
      'Usar diagramas y infografías',
      'Incorporar videos explicativos'
    ]
  },
  {
    id: 'frustration_threshold',
    name: 'Umbral de Frustración',
    description: 'Tendencia a abandonar tareas cuando encuentra dificultades',
    frequency: 45,
    confidence: 76,
    impact: 'negative',
    category: 'emotional',
    recommendations: [
      'Proporcionar más apoyo en momentos difíciles',
      'Dividir tareas complejas en pasos más pequeños',
      'Ofrecer retroalimentación positiva frecuente'
    ]
  }
];

// Sesiones de aprendizaje de ejemplo
const LEARNING_SESSIONS: LearningSession[] = [
  {
    id: 'session_1',
    startTime: new Date('2024-01-15T09:00:00'),
    endTime: new Date('2024-01-15T09:45:00'),
    duration: 45,
    activities: ['Lectura', 'Ejercicios', 'Quiz'],
    engagement: 85,
    performance: 92,
    mood: 'positive',
    notes: 'Muy participativo, completó todos los ejercicios'
  },
  {
    id: 'session_2',
    startTime: new Date('2024-01-15T14:00:00'),
    endTime: new Date('2024-01-15T14:30:00'),
    duration: 30,
    activities: ['Video', 'Discusión'],
    engagement: 65,
    performance: 78,
    mood: 'neutral',
    notes: 'Menos engagement en la tarde, posible fatiga'
  },
  {
    id: 'session_3',
    startTime: new Date('2024-01-16T10:00:00'),
    endTime: new Date('2024-01-16T10:50:00'),
    duration: 50,
    activities: ['Proyecto', 'Colaboración'],
    engagement: 90,
    performance: 88,
    mood: 'positive',
    notes: 'Excelente trabajo en equipo, muy motivado'
  }
];

export function BehavioralAnalysis({
  userId,
  timeRange = 'week',
  onPatternDetected,
  onRecommendationGenerated,
  onExport,
  className
}: BehavioralAnalysisProps) {
  const [selectedTimeRange, setSelectedTimeRange] = useState(timeRange);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [expandedMetrics, setExpandedMetrics] = useState<string[]>([]);
  const [selectedPattern, setSelectedPattern] = useState<BehaviorPattern | null>(null);

  // Filtrar métricas por categoría
  const filteredMetrics = selectedCategory === 'all' 
    ? BEHAVIOR_METRICS 
    : BEHAVIOR_METRICS.filter(metric => metric.category === selectedCategory);

  // Obtener color de estado
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-100';
      case 'good': return 'text-blue-600 bg-blue-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Obtener icono de tendencia
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-600" />;
      default: return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  // Analizar comportamiento
  const analyzeBehavior = useCallback(async () => {
    setIsAnalyzing(true);
    
    try {
      // Simular análisis de IA
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const analysis = {
        overallScore: 82,
        improvement: 7.5,
        keyInsights: [
          'Excelente progreso en engagement y participación',
          'Necesita más apoyo en momentos de frustración',
          'Beneficia significativamente del aprendizaje social',
          'Muestra preferencia clara por contenido visual'
        ],
        recommendations: [
          {
            priority: 'high',
            title: 'Implementar más actividades grupales',
            description: 'El estudiante muestra mejor rendimiento en entornos colaborativos',
            impact: 'Alto',
            effort: 'Medio'
          },
          {
            priority: 'medium',
            title: 'Aumentar contenido visual',
            description: 'Mejor retención con diagramas y gráficos',
            impact: 'Medio',
            effort: 'Bajo'
          },
          {
            priority: 'high',
            title: 'Sistema de apoyo emocional',
            description: 'Proporcionar ayuda cuando se detecte frustración',
            impact: 'Alto',
            effort: 'Alto'
          }
        ],
        patterns: BEHAVIOR_PATTERNS,
        sessions: LEARNING_SESSIONS
      };
      
      setAnalysisResults(analysis);
      
      if (onPatternDetected) {
        BEHAVIOR_PATTERNS.forEach(pattern => onPatternDetected(pattern));
      }
      
      if (onRecommendationGenerated) {
        analysis.recommendations.forEach(rec => onRecommendationGenerated(rec));
      }
    } catch (error) {
      console.error('Error en análisis:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [onPatternDetected, onRecommendationGenerated]);

  // Toggle métrica expandida
  const toggleMetric = useCallback((metricId: string) => {
    setExpandedMetrics(prev => 
      prev.includes(metricId) 
        ? prev.filter(id => id !== metricId)
        : [...prev, metricId]
    );
  }, []);

  // Exportar datos
  const exportData = useCallback(() => {
    const exportData = {
      userId,
      timeRange: selectedTimeRange,
      metrics: filteredMetrics,
      patterns: BEHAVIOR_PATTERNS,
      sessions: LEARNING_SESSIONS,
      analysis: analysisResults,
      timestamp: new Date().toISOString()
    };
    
    if (onExport) {
      onExport(exportData);
    }
  }, [userId, selectedTimeRange, filteredMetrics, analysisResults, onExport]);

  return (
    <Card className={cn("w-full max-w-7xl mx-auto", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-6 h-6 text-indigo-600" />
              Análisis de Comportamiento
            </CardTitle>
            <CardDescription>
              Análisis profundo del comportamiento y patrones de aprendizaje
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value as any)}
              className="px-3 py-1 border rounded-md text-sm"
              tabIndex={0}
              aria-label="Seleccionar rango de tiempo"
            >
              <option value="day">Último día</option>
              <option value="week">Última semana</option>
              <option value="month">Último mes</option>
              <option value="quarter">Último trimestre</option>
            </select>
            <Button variant="outline" size="sm" onClick={analyzeBehavior} disabled={isAnalyzing}>
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analizando...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Analizar
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Panel de Métricas */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Métricas Clave
              </h3>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-2 py-1 border rounded text-xs"
                tabIndex={0}
                aria-label="Filtrar por categoría"
              >
                <option value="all">Todas</option>
                <option value="engagement">Engagement</option>
                <option value="performance">Rendimiento</option>
                <option value="social">Social</option>
                <option value="emotional">Emocional</option>
                <option value="cognitive">Cognitivo</option>
              </select>
            </div>
            
            <div className="space-y-3">
              {filteredMetrics.map((metric) => (
                <div
                  key={metric.id}
                  className="p-3 border rounded-lg cursor-pointer transition-all hover:shadow-sm"
                  onClick={() => toggleMetric(metric.id)}
                  tabIndex={0}
                  role="button"
                  aria-label={`Expandir métrica: ${metric.name}`}
                  onKeyDown={(e) => e.key === 'Enter' && toggleMetric(metric.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-sm">{metric.name}</h4>
                      {getTrendIcon(metric.trend)}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold">{metric.value}{metric.unit}</span>
                      <Badge 
                        variant="outline" 
                        className={cn("text-xs", getStatusColor(metric.status))}
                      >
                        {metric.status}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Cambio: {metric.change > 0 ? '+' : ''}{metric.change}%</span>
                    <span className="capitalize">{metric.category}</span>
                  </div>
                  
                  {expandedMetrics.includes(metric.id) && (
                    <div className="mt-3 pt-3 border-t">
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span>Progreso</span>
                          <span>{Math.min(100, Math.max(0, metric.value))}%</span>
                        </div>
                        <Progress value={Math.min(100, Math.max(0, metric.value))} className="h-1" />
                        <div className="text-xs text-muted-foreground">
                          {metric.trend === 'up' && 'Mejorando consistentemente'}
                          {metric.trend === 'down' && 'Necesita atención'}
                          {metric.trend === 'stable' && 'Manteniendo nivel'}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Panel de Patrones */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Patrones Detectados
            </h3>
            
            <div className="space-y-3">
              {BEHAVIOR_PATTERNS.map((pattern) => (
                <div
                  key={pattern.id}
                  className={cn(
                    "p-3 border rounded-lg cursor-pointer transition-all",
                    selectedPattern?.id === pattern.id && "border-indigo-500 bg-indigo-50"
                  )}
                  onClick={() => setSelectedPattern(pattern)}
                  tabIndex={0}
                  role="button"
                  aria-label={`Seleccionar patrón: ${pattern.name}`}
                  onKeyDown={(e) => e.key === 'Enter' && setSelectedPattern(pattern)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{pattern.name}</h4>
                      <p className="text-xs text-muted-foreground">{pattern.description}</p>
                    </div>
                    <Badge 
                      variant={pattern.impact === 'positive' ? 'default' : 'destructive'}
                      className="text-xs"
                    >
                      {pattern.impact === 'positive' ? 'Positivo' : 'Negativo'}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Frecuencia: {pattern.frequency}%</span>
                    <span>Confianza: {pattern.confidence}%</span>
                  </div>
                  
                  <div className="mt-2">
                    <Progress value={pattern.confidence} className="h-1" />
                  </div>
                </div>
              ))}
            </div>

            {/* Detalles del Patrón Seleccionado */}
            {selectedPattern && (
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Recomendaciones para "{selectedPattern.name}"</h4>
                <ul className="space-y-1">
                  {selectedPattern.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <Lightbulb className="w-3 h-3 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Panel de Sesiones */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Sesiones Recientes
            </h3>
            
            <div className="space-y-3">
              {LEARNING_SESSIONS.map((session) => (
                <div key={session.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">
                        {session.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Badge variant="outline" className="text-xs">
                        {session.duration}min
                      </Badge>
                      <Badge 
                        variant={session.mood === 'positive' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {session.mood === 'positive' ? '😊' : session.mood === 'negative' ? '😞' : '😐'}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Engagement</span>
                      <span>{session.engagement}%</span>
                    </div>
                    <Progress value={session.engagement} className="h-1" />
                    
                    <div className="flex justify-between text-xs">
                      <span>Rendimiento</span>
                      <span>{session.performance}%</span>
                    </div>
                    <Progress value={session.performance} className="h-1" />
                  </div>
                  
                  <div className="mt-2">
                    <div className="flex flex-wrap gap-1">
                      {session.activities.map((activity, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {activity}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  {session.notes && (
                    <p className="text-xs text-muted-foreground mt-2">{session.notes}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Resultados del Análisis */}
        {analysisResults && (
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Target className="w-5 h-5" />
              Análisis Completo
            </h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="default">Puntuación General: {analysisResults.overallScore}/100</Badge>
                  <Badge variant="secondary">Mejora: +{analysisResults.improvement}%</Badge>
                </div>
                
                <h4 className="font-medium mb-2">Insights Clave</h4>
                <ul className="space-y-1">
                  {analysisResults.keyInsights.map((insight: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <Star className="w-3 h-3 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Recomendaciones Prioritarias</h4>
                <div className="space-y-2">
                  {analysisResults.recommendations.slice(0, 3).map((rec: any, idx: number) => (
                    <div key={idx} className="p-2 border rounded">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge 
                          variant={rec.priority === 'high' ? 'destructive' : 'secondary'}
                          className="text-xs"
                        >
                          {rec.priority === 'high' ? 'Alta' : 'Media'}
                        </Badge>
                        <span className="text-sm font-medium">{rec.title}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{rec.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <div className="flex gap-2">
          <Button variant="outline" onClick={analyzeBehavior} disabled={isAnalyzing}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualizar Análisis
          </Button>
          <Button variant="outline" onClick={exportData}>
            <Download className="w-4 h-4 mr-2" />
            Exportar Datos
          </Button>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{filteredMetrics.length} métricas</span>
          <span>•</span>
          <span>{BEHAVIOR_PATTERNS.length} patrones</span>
          <span>•</span>
          <span>{LEARNING_SESSIONS.length} sesiones</span>
        </div>
      </CardFooter>
    </Card>
  );
}
