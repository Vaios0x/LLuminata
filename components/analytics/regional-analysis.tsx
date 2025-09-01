'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Globe, 
  MapPin, 
  Users, 
  TrendingUp, 
  Star, 
  Target,
  BarChart3,
  PieChart,
  ArrowUp,
  ArrowDown,
  Minus,
  Eye,
  Heart,
  Zap,
  Calendar,
  Download,
  RefreshCw,
  Filter,
  Info,
  AlertTriangle,
  CheckCircle,
  Award,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Share2,
  BookOpen,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Brain,
  Languages,
  Flag,
  Compass,
  Mountain,
  TreePine,
  Sun,
  Moon
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface RegionalAnalysisProps {
  className?: string;
  refreshInterval?: number;
  showCulturalMetrics?: boolean;
  showRegionalComparison?: boolean;
  showEffectivenessAnalysis?: boolean;
}

interface RegionalData {
  overview: {
    totalRegions: number;
    totalUsers: number;
    averageEngagement: number;
    averageCompletion: number;
    averageSatisfaction: number;
    culturalDiversity: number;
  };
  regions: Array<{
    id: string;
    name: string;
    state: string;
    users: number;
    engagement: number;
    completionRate: number;
    averageScore: number;
    satisfaction: number;
    growth: number;
    culturalContexts: string[];
    languages: string[];
    specialNeeds: Array<{ type: string; percentage: number }>;
    infrastructure: {
      internetAccess: number;
      deviceOwnership: number;
      digitalLiteracy: number;
    };
  }>;
  culturalAnalysis: {
    contexts: Array<{
      name: string;
      users: number;
      engagement: number;
      satisfaction: number;
      adaptationSuccess: number;
      contentRelevance: number;
    }>;
    languages: Array<{
      code: string;
      name: string;
      users: number;
      proficiency: number;
      contentAvailability: number;
      satisfaction: number;
    }>;
    effectiveness: Array<{
      region: string;
      culturalContext: string;
      effectiveness: number;
      factors: Array<{ factor: string; impact: number }>;
    }>;
  };
  regionalComparison: {
    topPerformers: Array<{
      region: string;
      metric: string;
      value: number;
      improvement: number;
    }>;
    improvementAreas: Array<{
      region: string;
      area: string;
      currentValue: number;
      targetValue: number;
      gap: number;
    }>;
    bestPractices: Array<{
      region: string;
      practice: string;
      impact: number;
      description: string;
    }>;
  };
  effectivenessMetrics: {
    byRegion: Array<{
      region: string;
      effectiveness: number;
      engagement: number;
      completion: number;
      satisfaction: number;
      retention: number;
    }>;
    byCulturalContext: Array<{
      context: string;
      effectiveness: number;
      adaptationRate: number;
      contentRelevance: number;
      userSatisfaction: number;
    }>;
    trends: Array<{
      period: string;
      overallEffectiveness: number;
      regionalVariance: number;
      culturalAdaptation: number;
    }>;
  };
  insights: {
    regionalInsights: Array<{
      region: string;
      insight: string;
      impact: number;
      recommendation: string;
    }>;
    culturalInsights: Array<{
      context: string;
      insight: string;
      successFactors: string[];
      challenges: string[];
    }>;
    recommendations: Array<{
      type: 'regional' | 'cultural' | 'infrastructure';
      priority: 'high' | 'medium' | 'low';
      title: string;
      description: string;
      expectedImpact: number;
      implementation: string;
    }>;
  };
}

export const RegionalAnalysis: React.FC<RegionalAnalysisProps> = ({
  className = '',
  refreshInterval = 300000, // 5 minutos
  showCulturalMetrics = true,
  showRegionalComparison = true,
  showEffectivenessAnalysis = true
}) => {
  const [regionalData, setRegionalData] = useState<RegionalData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d'>('30d');
  const [selectedView, setSelectedView] = useState<'overview' | 'regions' | 'cultural' | 'comparison' | 'effectiveness' | 'insights'>('overview');

  // Cargar datos regionales
  const loadRegionalData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/analytics?action=regional_analysis&period=${selectedPeriod}`);
      if (!response.ok) {
        throw new Error('Error cargando análisis regional');
      }

      const result = await response.json();
      if (result.success) {
        setRegionalData(result.data);
        setLastUpdated(new Date());
      } else {
        throw new Error(result.error || 'Error desconocido');
      }
    } catch (error) {
      console.error('Error cargando análisis regional:', error);
      setError(error instanceof Error ? error.message : 'Error desconocido');
      
      // Datos de prueba para desarrollo
      setRegionalData(generateMockRegionalData());
      setLastUpdated(new Date());
    } finally {
      setIsLoading(false);
    }
  }, [selectedPeriod]);

  // Generar datos de prueba
  const generateMockRegionalData = (): RegionalData => {
    return {
      overview: {
        totalRegions: 8,
        totalUsers: 1247,
        averageEngagement: 84.4,
        averageCompletion: 78.5,
        averageSatisfaction: 4.2,
        culturalDiversity: 92.3
      },
      regions: [
        {
          id: 'yucatan',
          name: 'Yucatán',
          state: 'YUC',
          users: 456,
          engagement: 87.2,
          completionRate: 78.5,
          averageScore: 84.3,
          satisfaction: 4.3,
          growth: 12.5,
          culturalContexts: ['Maya', 'Mestizo'],
          languages: ['es-MX', 'yua'],
          specialNeeds: [
            { type: 'Visual', percentage: 8.5 },
            { type: 'Auditivo', percentage: 5.2 },
            { type: 'Motor', percentage: 3.1 }
          ],
          infrastructure: {
            internetAccess: 85.2,
            deviceOwnership: 78.9,
            digitalLiteracy: 72.4
          }
        },
        {
          id: 'oaxaca',
          name: 'Oaxaca',
          state: 'OAX',
          users: 234,
          engagement: 82.1,
          completionRate: 72.8,
          averageScore: 79.6,
          satisfaction: 4.1,
          growth: 8.9,
          culturalContexts: ['Zapoteco', 'Mixteco', 'Mestizo'],
          languages: ['es-MX', 'zap', 'mix'],
          specialNeeds: [
            { type: 'Visual', percentage: 7.8 },
            { type: 'Auditivo', percentage: 6.1 },
            { type: 'Motor', percentage: 4.2 }
          ],
          infrastructure: {
            internetAccess: 72.1,
            deviceOwnership: 65.3,
            digitalLiteracy: 58.7
          }
        },
        {
          id: 'chiapas',
          name: 'Chiapas',
          state: 'CHP',
          users: 189,
          engagement: 85.7,
          completionRate: 75.2,
          averageScore: 81.4,
          satisfaction: 4.4,
          growth: 15.3,
          culturalContexts: ['Tzotzil', 'Tzeltal', 'Mestizo'],
          languages: ['es-MX', 'tzo', 'tzl'],
          specialNeeds: [
            { type: 'Visual', percentage: 9.2 },
            { type: 'Auditivo', percentage: 4.8 },
            { type: 'Motor', percentage: 2.9 }
          ],
          infrastructure: {
            internetAccess: 68.5,
            deviceOwnership: 61.2,
            digitalLiteracy: 54.3
          }
        },
        {
          id: 'guerrero',
          name: 'Guerrero',
          state: 'GRO',
          users: 156,
          engagement: 79.8,
          completionRate: 68.9,
          averageScore: 76.2,
          satisfaction: 3.9,
          growth: 6.7,
          culturalContexts: ['Náhuatl', 'Mixteco', 'Mestizo'],
          languages: ['es-MX', 'nah', 'mix'],
          specialNeeds: [
            { type: 'Visual', percentage: 6.5 },
            { type: 'Auditivo', percentage: 7.3 },
            { type: 'Motor', percentage: 5.1 }
          ],
          infrastructure: {
            internetAccess: 65.8,
            deviceOwnership: 58.4,
            digitalLiteracy: 51.2
          }
        }
      ],
      culturalAnalysis: {
        contexts: [
          {
            name: 'Maya',
            users: 523,
            engagement: 86.4,
            satisfaction: 4.2,
            adaptationSuccess: 89.7,
            contentRelevance: 92.1
          },
          {
            name: 'Náhuatl',
            users: 312,
            engagement: 83.7,
            satisfaction: 4.0,
            adaptationSuccess: 85.3,
            contentRelevance: 88.9
          },
          {
            name: 'Zapoteco',
            users: 234,
            engagement: 81.9,
            satisfaction: 3.9,
            adaptationSuccess: 82.1,
            contentRelevance: 85.6
          },
          {
            name: 'Mixteco',
            users: 178,
            engagement: 84.1,
            satisfaction: 4.1,
            adaptationSuccess: 87.2,
            contentRelevance: 90.3
          }
        ],
        languages: [
          {
            code: 'es-MX',
            name: 'Español Mexicano',
            users: 1247,
            proficiency: 95.2,
            contentAvailability: 100,
            satisfaction: 4.3
          },
          {
            code: 'yua',
            name: 'Maya Yucateco',
            users: 456,
            proficiency: 78.5,
            contentAvailability: 85.2,
            satisfaction: 4.1
          },
          {
            code: 'zap',
            name: 'Zapoteco',
            users: 234,
            proficiency: 72.3,
            contentAvailability: 68.9,
            satisfaction: 3.8
          }
        ],
        effectiveness: [
          {
            region: 'Yucatán',
            culturalContext: 'Maya',
            effectiveness: 89.7,
            factors: [
              { factor: 'Contenido Cultural Relevante', impact: 0.35 },
              { factor: 'Adaptación Lingüística', impact: 0.28 },
              { factor: 'Infraestructura Digital', impact: 0.22 },
              { factor: 'Apoyo Comunitario', impact: 0.15 }
            ]
          }
        ]
      },
      regionalComparison: {
        topPerformers: [
          {
            region: 'Yucatán',
            metric: 'Engagement',
            value: 87.2,
            improvement: 12.5
          },
          {
            region: 'Chiapas',
            metric: 'Satisfacción',
            value: 4.4,
            improvement: 15.3
          },
          {
            region: 'Oaxaca',
            metric: 'Crecimiento',
            value: 8.9,
            improvement: 8.9
          }
        ],
        improvementAreas: [
          {
            region: 'Guerrero',
            area: 'Infraestructura Digital',
            currentValue: 65.8,
            targetValue: 85.0,
            gap: 19.2
          },
          {
            region: 'Oaxaca',
            area: 'Contenido en Lenguas Indígenas',
            currentValue: 68.9,
            targetValue: 90.0,
            gap: 21.1
          }
        ],
        bestPractices: [
          {
            region: 'Yucatán',
            practice: 'Colaboración con Comunidades Mayas',
            impact: 0.35,
            description: 'Involucrar a líderes comunitarios en el desarrollo de contenido'
          },
          {
            region: 'Chiapas',
            practice: 'Adaptación Cultural Automática',
            impact: 0.28,
            description: 'Sistema que adapta contenido según contexto cultural detectado'
          }
        ]
      },
      effectivenessMetrics: {
        byRegion: [
          {
            region: 'Yucatán',
            effectiveness: 89.7,
            engagement: 87.2,
            completion: 78.5,
            satisfaction: 4.3,
            retention: 82.1
          },
          {
            region: 'Oaxaca',
            effectiveness: 82.3,
            engagement: 82.1,
            completion: 72.8,
            satisfaction: 4.1,
            retention: 75.6
          },
          {
            region: 'Chiapas',
            effectiveness: 85.9,
            engagement: 85.7,
            completion: 75.2,
            satisfaction: 4.4,
            retention: 79.8
          },
          {
            region: 'Guerrero',
            effectiveness: 76.8,
            engagement: 79.8,
            completion: 68.9,
            satisfaction: 3.9,
            retention: 71.2
          }
        ],
        byCulturalContext: [
          {
            context: 'Maya',
            effectiveness: 89.7,
            adaptationRate: 92.1,
            contentRelevance: 94.3,
            userSatisfaction: 4.2
          },
          {
            context: 'Náhuatl',
            effectiveness: 85.3,
            adaptationRate: 88.9,
            contentRelevance: 91.2,
            userSatisfaction: 4.0
          },
          {
            context: 'Zapoteco',
            effectiveness: 82.1,
            adaptationRate: 85.6,
            contentRelevance: 87.8,
            userSatisfaction: 3.9
          }
        ],
        trends: [
          {
            period: 'Enero 2024',
            overallEffectiveness: 83.2,
            regionalVariance: 12.9,
            culturalAdaptation: 87.5
          },
          {
            period: 'Febrero 2024',
            overallEffectiveness: 85.7,
            regionalVariance: 11.2,
            culturalAdaptation: 89.1
          }
        ]
      },
      insights: {
        regionalInsights: [
          {
            region: 'Yucatán',
            insight: 'Alto engagement debido a contenido culturalmente relevante',
            impact: 0.35,
            recommendation: 'Expandir contenido en maya yucateco'
          },
          {
            region: 'Guerrero',
            insight: 'Baja infraestructura digital limita el acceso',
            impact: -0.22,
            recommendation: 'Implementar centros de acceso comunitario'
          }
        ],
        culturalInsights: [
          {
            context: 'Maya',
            insight: 'Excelente respuesta a contenido matemático con numeración maya',
            successFactors: ['Contenido cultural relevante', 'Adaptación lingüística', 'Apoyo comunitario'],
            challenges: ['Variación dialectal', 'Acceso a internet']
          }
        ],
        recommendations: [
          {
            type: 'cultural',
            priority: 'high',
            title: 'Expandir Contenido en Lenguas Indígenas',
            description: 'Desarrollar más contenido educativo en lenguas originarias',
            expectedImpact: 0.25,
            implementation: 'Colaborar con hablantes nativos y lingüistas'
          },
          {
            type: 'infrastructure',
            priority: 'medium',
            title: 'Mejorar Acceso Digital en Regiones Rurales',
            description: 'Implementar centros de acceso comunitario',
            expectedImpact: 0.18,
            implementation: 'Alianzas con gobiernos locales y ONGs'
          }
        ]
      }
    };
  };

  // Cargar datos al montar
  useEffect(() => {
    loadRegionalData();
  }, [loadRegionalData]);

  // Auto-refresh
  useEffect(() => {
    const interval = setInterval(loadRegionalData, refreshInterval);
    return () => clearInterval(interval);
  }, [loadRegionalData, refreshInterval]);

  // Obtener icono de cambio
  const getChangeIcon = (change: number) => {
    if (change > 0) return <ArrowUp className="w-4 h-4 text-green-500" />;
    if (change < 0) return <ArrowDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-gray-500" />;
  };

  // Obtener color de cambio
  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  // Obtener color de estado
  const getStatusColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value >= thresholds.good) return 'text-green-600';
    if (value >= thresholds.warning) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Obtener icono de región
  const getRegionIcon = (regionName: string) => {
    const icons: Record<string, React.ReactNode> = {
      'Yucatán': <Sun className="w-4 h-4" />,
      'Oaxaca': <Mountain className="w-4 h-4" />,
      'Chiapas': <TreePine className="w-4 h-4" />,
      'Guerrero': <Compass className="w-4 h-4" />
    };
    return icons[regionName] || <MapPin className="w-4 h-4" />;
  };

  if (isLoading && !regionalData) {
    return (
      <div className={cn("flex items-center justify-center p-8", className)}>
        <div className="flex items-center space-x-2">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Cargando análisis regional...</span>
        </div>
      </div>
    );
  }

  if (error && !regionalData) {
    return (
      <div className={cn("flex items-center justify-center p-8", className)}>
        <div className="flex items-center space-x-2 text-red-600">
          <AlertTriangle className="w-5 h-5" />
          <span>Error: {error}</span>
        </div>
      </div>
    );
  }

  if (!regionalData) return null;

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Análisis Regional</h1>
          <p className="text-gray-600 mt-1">
            Análisis de efectividad por región y contexto cultural
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium">Período:</label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as any)}
              className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              tabIndex={0}
            >
              <option value="7d">Últimos 7 días</option>
              <option value="30d">Últimos 30 días</option>
              <option value="90d">Últimos 90 días</option>
            </select>
          </div>
          
          <Button
            onClick={loadRegionalData}
            disabled={isLoading}
            variant="outline"
            size="sm"
            tabIndex={0}
          >
            <RefreshCw className={cn("w-4 h-4 mr-2", isLoading && "animate-spin")} />
            Actualizar
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            tabIndex={0}
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Métricas de Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Regiones Activas</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{regionalData.overview.totalRegions}</div>
            <p className="text-xs text-muted-foreground">
              {regionalData.overview.totalUsers.toLocaleString()} usuarios totales
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement Promedio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{regionalData.overview.averageEngagement}%</div>
            <Progress value={regionalData.overview.averageEngagement} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              Tasa de participación promedio
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Satisfacción Promedio</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{regionalData.overview.averageSatisfaction}/5</div>
            <div className="flex items-center space-x-1 mt-2">
              {Array.from({ length: 5 }, (_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "w-4 h-4",
                    i < Math.floor(regionalData.overview.averageSatisfaction)
                      ? "text-yellow-400 fill-current"
                      : "text-gray-300"
                  )}
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Calificación promedio de usuarios
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Diversidad Cultural</CardTitle>
            <Languages className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{regionalData.overview.culturalDiversity}%</div>
            <Progress value={regionalData.overview.culturalDiversity} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              Cobertura de contextos culturales
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de navegación */}
      <Tabs value={selectedView} onValueChange={(value) => setSelectedView(value as any)}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview" tabIndex={0}>
            <Eye className="w-4 h-4 mr-2" />
            Resumen
          </TabsTrigger>
          <TabsTrigger value="regions" tabIndex={0}>
            <MapPin className="w-4 h-4 mr-2" />
            Regiones
          </TabsTrigger>
          {showCulturalMetrics && (
            <TabsTrigger value="cultural" tabIndex={0}>
              <Globe className="w-4 h-4 mr-2" />
              Cultural
            </TabsTrigger>
          )}
          {showRegionalComparison && (
            <TabsTrigger value="comparison" tabIndex={0}>
              <BarChart3 className="w-4 h-4 mr-2" />
              Comparación
            </TabsTrigger>
          )}
          {showEffectivenessAnalysis && (
            <TabsTrigger value="effectiveness" tabIndex={0}>
              <Target className="w-4 h-4 mr-2" />
              Efectividad
            </TabsTrigger>
          )}
          <TabsTrigger value="insights" tabIndex={0}>
            <Brain className="w-4 h-4 mr-2" />
            Insights
          </TabsTrigger>
        </TabsList>

        {/* Tab de Resumen */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Regiones Principales */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  Regiones Principales
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {regionalData.regions.slice(0, 4).map((region, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getRegionIcon(region.name)}
                        <div>
                          <h4 className="font-semibold">{region.name}</h4>
                          <p className="text-sm text-gray-600">{region.users.toLocaleString()} usuarios</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{region.engagement}%</div>
                        <div className="text-sm text-gray-600">engagement</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Contextos Culturales */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="w-5 h-5 mr-2" />
                  Contextos Culturales
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {regionalData.culturalAnalysis.contexts.map((context, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-semibold">{context.name}</h4>
                        <p className="text-sm text-gray-600">{context.users.toLocaleString()} usuarios</p>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{context.engagement}%</div>
                        <div className="text-sm text-gray-600">engagement</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab de Regiones */}
        <TabsContent value="regions" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {regionalData.regions.map((region, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getRegionIcon(region.name)}
                      <span>{region.name}</span>
                    </div>
                    <Badge variant={region.growth > 10 ? "default" : "secondary"}>
                      {region.growth > 0 ? '+' : ''}{region.growth}%
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Usuarios:</span>
                        <p className="font-medium">{region.users.toLocaleString()}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Engagement:</span>
                        <p className="font-medium">{region.engagement}%</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Completación:</span>
                        <p className="font-medium">{region.completionRate}%</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Satisfacción:</span>
                        <div className="flex items-center space-x-1">
                          {Array.from({ length: 5 }, (_, i) => (
                            <Star
                              key={i}
                              className={cn(
                                "w-4 h-4",
                                i < Math.floor(region.satisfaction)
                                  ? "text-yellow-400 fill-current"
                                  : "text-gray-300"
                              )}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    <div>
                      <span className="text-gray-600 text-sm">Contextos Culturales:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {region.culturalContexts.map((context, cIndex) => (
                          <Badge key={cIndex} variant="outline" className="text-xs">
                            {context}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="text-gray-600 text-sm">Infraestructura:</span>
                      <div className="space-y-2 mt-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Acceso a Internet</span>
                          <span className="text-sm font-medium">{region.infrastructure.internetAccess}%</span>
                        </div>
                        <Progress value={region.infrastructure.internetAccess} className="h-2" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Tab de Análisis Cultural */}
        {showCulturalMetrics && (
          <TabsContent value="cultural" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Contextos Culturales */}
              <Card>
                <CardHeader>
                  <CardTitle>Análisis por Contexto Cultural</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {regionalData.culturalAnalysis.contexts.map((context, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <h4 className="font-semibold mb-2">{context.name}</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Usuarios:</span>
                            <p className="font-medium">{context.users.toLocaleString()}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Engagement:</span>
                            <p className="font-medium">{context.engagement}%</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Adaptación:</span>
                            <p className="font-medium">{context.adaptationSuccess}%</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Relevancia:</span>
                            <p className="font-medium">{context.contentRelevance}%</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Lenguas */}
              <Card>
                <CardHeader>
                  <CardTitle>Análisis por Lengua</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {regionalData.culturalAnalysis.languages.map((language, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <h4 className="font-semibold mb-2">{language.name}</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Usuarios:</span>
                            <p className="font-medium">{language.users.toLocaleString()}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Proficiencia:</span>
                            <p className="font-medium">{language.proficiency}%</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Contenido:</span>
                            <p className="font-medium">{language.contentAvailability}%</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Satisfacción:</span>
                            <div className="flex items-center space-x-1">
                              {Array.from({ length: 5 }, (_, i) => (
                                <Star
                                  key={i}
                                  className={cn(
                                    "w-4 h-4",
                                    i < Math.floor(language.satisfaction)
                                      ? "text-yellow-400 fill-current"
                                      : "text-gray-300"
                                  )}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )}

        {/* Tab de Comparación Regional */}
        {showRegionalComparison && (
          <TabsContent value="comparison" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Mejores Desempeños */}
              <Card>
                <CardHeader>
                  <CardTitle>Mejores Desempeños</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {regionalData.regionalComparison.topPerformers.map((performer, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h4 className="font-semibold">{performer.region}</h4>
                          <p className="text-sm text-gray-600">{performer.metric}</p>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{performer.value}</div>
                          <div className="text-sm text-green-600">+{performer.improvement}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Áreas de Mejora */}
              <Card>
                <CardHeader>
                  <CardTitle>Áreas de Mejora</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {regionalData.regionalComparison.improvementAreas.map((area, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <h4 className="font-semibold mb-2">{area.region} - {area.area}</h4>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Actual</span>
                            <span className="text-sm font-medium">{area.currentValue}%</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Objetivo</span>
                            <span className="text-sm font-medium">{area.targetValue}%</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Brecha</span>
                            <span className="text-sm font-medium text-red-600">{area.gap}%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )}

        {/* Tab de Análisis de Efectividad */}
        {showEffectivenessAnalysis && (
          <TabsContent value="effectiveness" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Efectividad por Región */}
              <Card>
                <CardHeader>
                  <CardTitle>Efectividad por Región</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {regionalData.effectivenessMetrics.byRegion.map((region, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <h4 className="font-semibold mb-2">{region.region}</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Efectividad:</span>
                            <p className="font-medium">{region.effectiveness}%</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Engagement:</span>
                            <p className="font-medium">{region.engagement}%</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Completación:</span>
                            <p className="font-medium">{region.completion}%</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Retención:</span>
                            <p className="font-medium">{region.retention}%</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Efectividad por Contexto Cultural */}
              <Card>
                <CardHeader>
                  <CardTitle>Efectividad por Contexto Cultural</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {regionalData.effectivenessMetrics.byCulturalContext.map((context, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <h4 className="font-semibold mb-2">{context.context}</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Efectividad:</span>
                            <p className="font-medium">{context.effectiveness}%</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Adaptación:</span>
                            <p className="font-medium">{context.adaptationRate}%</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Relevancia:</span>
                            <p className="font-medium">{context.contentRelevance}%</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Satisfacción:</span>
                            <div className="flex items-center space-x-1">
                              {Array.from({ length: 5 }, (_, i) => (
                                <Star
                                  key={i}
                                  className={cn(
                                    "w-4 h-4",
                                    i < Math.floor(context.userSatisfaction)
                                      ? "text-yellow-400 fill-current"
                                      : "text-gray-300"
                                  )}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )}

        {/* Tab de Insights */}
        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Insights Regionales */}
            <Card>
              <CardHeader>
                <CardTitle>Insights Regionales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {regionalData.insights.regionalInsights.map((insight, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-2">{insight.region}</h4>
                      <p className="text-sm text-gray-600 mb-2">{insight.insight}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Impacto: {insight.impact > 0 ? '+' : ''}{insight.impact}</span>
                        <Badge variant="outline" className="text-xs">
                          Recomendación
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recomendaciones */}
            <Card>
              <CardHeader>
                <CardTitle>Recomendaciones</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {regionalData.insights.recommendations.map((rec, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{rec.title}</h4>
                        <Badge 
                          variant={rec.priority === 'high' ? 'destructive' : rec.priority === 'medium' ? 'secondary' : 'outline'}
                          className="text-xs"
                        >
                          {rec.priority === 'high' ? 'Alta' : rec.priority === 'medium' ? 'Media' : 'Baja'}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{rec.description}</p>
                      <div className="flex items-center justify-between text-xs">
                        <span>Impacto esperado: {rec.expectedImpact > 0 ? '+' : ''}{rec.expectedImpact}</span>
                        <span className="text-gray-500">{rec.type}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Footer con información de actualización */}
      {lastUpdated && (
        <div className="text-center text-sm text-gray-500">
          Última actualización: {lastUpdated.toLocaleString()}
        </div>
      )}
    </div>
  );
};

export default RegionalAnalysis;
