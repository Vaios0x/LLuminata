'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Globe, 
  Languages, 
  Users, 
  MapPin, 
  BookOpen,
  Lightbulb,
  BarChart3,
  PieChart,
  LineChart,
  Filter,
  Download,
  RefreshCw,
  Plus,
  Eye,
  Brain,
  Heart,
  Star,
  MessageSquare,
  Calendar,
  Target,
  Award,
  Bookmark,
  FileText,
  Video,
  Headphones,
  Mic,
  MousePointer,
  MousePointerClick,
  Flag,
  Palette,
  Settings,
  Zap,
  Activity,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  AlertTriangle,
  Clock,
  Search
} from 'lucide-react';

interface CulturalContext {
  id: string;
  name: string;
  region: string;
  language: string;
  population: number;
  activeUsers: number;
  culturalValues: string[];
  learningStyles: string[];
  commonChallenges: string[];
  recommendedApproaches: string[];
  adaptationScore: number;
  lastUpdated: Date;
  contentLocalization: {
    totalContent: number;
    localizedContent: number;
    translationQuality: number;
    culturalRelevance: number;
  };
  userEngagement: {
    sessionDuration: number;
    completionRate: number;
    satisfactionScore: number;
    retentionRate: number;
  };
}

interface LanguageAdaptation {
  id: string;
  language: string;
  nativeName: string;
  speakers: number;
  activeUsers: number;
  translationProgress: number;
  qualityScore: number;
  culturalAdaptations: number;
  lastUpdated: Date;
  content: {
    total: number;
    translated: number;
    reviewed: number;
    published: number;
  };
  challenges: string[];
  recommendations: string[];
}

interface RegionalAnalysis {
  id: string;
  region: string;
  country: string;
  population: number;
  activeUsers: number;
  culturalDiversity: number;
  adaptationNeeds: string[];
  successMetrics: {
    engagement: number;
    completion: number;
    satisfaction: number;
    retention: number;
  };
  topLanguages: {
    language: string;
    users: number;
    percentage: number;
  }[];
  culturalInsights: {
    values: string[];
    preferences: string[];
    taboos: string[];
  };
}

interface CulturalAnalytics {
  totalContexts: number;
  activeAdaptations: number;
  averageAdaptationScore: number;
  topLanguages: {
    language: string;
    users: number;
    percentage: number;
  }[];
  topRegions: {
    region: string;
    users: number;
    adaptationScore: number;
  }[];
  recentAdaptations: CulturalContext[];
  adaptationTrends: {
    date: string;
    adaptations: number;
    score: number;
    users: number;
  }[];
  culturalInsights: {
    totalInsights: number;
    implementedInsights: number;
    impactScore: number;
  };
}

export default function CulturalAdaptationDashboard() {
  const [contexts, setContexts] = useState<CulturalContext[]>([]);
  const [languages, setLanguages] = useState<LanguageAdaptation[]>([]);
  const [regions, setRegions] = useState<RegionalAnalysis[]>([]);
  const [analytics, setAnalytics] = useState<CulturalAnalytics>({
    totalContexts: 0,
    activeAdaptations: 0,
    averageAdaptationScore: 0,
    topLanguages: [],
    topRegions: [],
    recentAdaptations: [],
    adaptationTrends: [],
    culturalInsights: {
      totalInsights: 0,
      implementedInsights: 0,
      impactScore: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [selectedContext, setSelectedContext] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<string>('30d');
  const [filterRegion, setFilterRegion] = useState<string>('all');
  const [filterLanguage, setFilterLanguage] = useState<string>('all');

  useEffect(() => {
    loadCulturalData();
  }, [timeRange]);

  const loadCulturalData = async () => {
    setLoading(true);
    try {
      // Simular carga de datos
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockContexts: CulturalContext[] = [
        {
          id: '1',
          name: 'Maya Yucateco',
          region: 'Yucatán',
          language: 'maya',
          population: 850000,
          activeUsers: 12400,
          culturalValues: [
            'Respeto a los mayores',
            'Comunidad y cooperación',
            'Conexión con la naturaleza',
            'Tradición oral'
          ],
          learningStyles: [
            'Aprendizaje cooperativo',
            'Narrativa y cuentos',
            'Experiencias prácticas',
            'Aprendizaje visual'
          ],
          commonChallenges: [
            'Acceso limitado a tecnología',
            'Barreras lingüísticas',
            'Contexto urbano vs rural',
            'Preservación cultural'
          ],
          recommendedApproaches: [
            'Contenido bilingüe',
            'Historias locales',
            'Actividades grupales',
            'Conexión con la comunidad'
          ],
          adaptationScore: 0.87,
          lastUpdated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          contentLocalization: {
            totalContent: 1250,
            localizedContent: 1080,
            translationQuality: 0.92,
            culturalRelevance: 0.89
          },
          userEngagement: {
            sessionDuration: 28,
            completionRate: 0.78,
            satisfactionScore: 4.3,
            retentionRate: 0.82
          }
        },
        {
          id: '2',
          name: 'Náhuatl Central',
          region: 'Puebla',
          language: 'náhuatl',
          population: 1200000,
          activeUsers: 18900,
          culturalValues: [
            'Sabiduría ancestral',
            'Equilibrio y armonía',
            'Respeto a la tierra',
            'Educación comunitaria'
          ],
          learningStyles: [
            'Aprendizaje por observación',
            'Práctica repetitiva',
            'Enseñanza intergeneracional',
            'Aprendizaje contextual'
          ],
          commonChallenges: [
            'Migración urbana',
            'Pérdida de lengua materna',
            'Acceso a recursos educativos',
            'Integración cultural'
          ],
          recommendedApproaches: [
            'Contenido multimedia',
            'Historias tradicionales',
            'Participación familiar',
            'Valoración cultural'
          ],
          adaptationScore: 0.91,
          lastUpdated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          contentLocalization: {
            totalContent: 980,
            localizedContent: 890,
            translationQuality: 0.95,
            culturalRelevance: 0.93
          },
          userEngagement: {
            sessionDuration: 32,
            completionRate: 0.85,
            satisfactionScore: 4.6,
            retentionRate: 0.88
          }
        },
        {
          id: '3',
          name: 'Zapoteco del Valle',
          region: 'Oaxaca',
          language: 'zapoteco',
          population: 650000,
          activeUsers: 8900,
          culturalValues: [
            'Trabajo colectivo',
            'Respeto a la diversidad',
            'Sostenibilidad',
            'Identidad comunitaria'
          ],
          learningStyles: [
            'Aprendizaje experiencial',
            'Participación activa',
            'Reflexión grupal',
            'Aplicación práctica'
          ],
          commonChallenges: [
            'Dispersión geográfica',
            'Recursos limitados',
            'Preservación de dialectos',
            'Conectividad digital'
          ],
          recommendedApproaches: [
            'Contenido offline',
            'Adaptación dialectal',
            'Redes comunitarias',
            'Aprendizaje móvil'
          ],
          adaptationScore: 0.79,
          lastUpdated: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          contentLocalization: {
            totalContent: 750,
            localizedContent: 620,
            translationQuality: 0.88,
            culturalRelevance: 0.85
          },
          userEngagement: {
            sessionDuration: 24,
            completionRate: 0.72,
            satisfactionScore: 4.1,
            retentionRate: 0.76
          }
        }
      ];

      const mockLanguages: LanguageAdaptation[] = [
        {
          id: '1',
          language: 'maya',
          nativeName: 'Maaya t\'aan',
          speakers: 850000,
          activeUsers: 12400,
          translationProgress: 86,
          qualityScore: 0.92,
          culturalAdaptations: 156,
          lastUpdated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          content: {
            total: 1250,
            translated: 1080,
            reviewed: 950,
            published: 890
          },
          challenges: [
            'Variación dialectal',
            'Términos técnicos',
            'Contexto cultural',
            'Recursos de traducción'
          ],
          recommendations: [
            'Colaboración con hablantes nativos',
            'Glosario técnico',
            'Validación comunitaria',
            'Capacitación continua'
          ]
        },
        {
          id: '2',
          language: 'náhuatl',
          nativeName: 'Nāhuatlahtōlli',
          speakers: 1200000,
          activeUsers: 18900,
          translationProgress: 91,
          qualityScore: 0.95,
          culturalAdaptations: 234,
          lastUpdated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          content: {
            total: 980,
            translated: 890,
            reviewed: 820,
            published: 780
          },
          challenges: [
            'Variantes regionales',
            'Terminología moderna',
            'Contexto histórico',
            'Preservación cultural'
          ],
          recommendations: [
            'Documentación de variantes',
            'Adaptación contextual',
            'Participación comunitaria',
            'Preservación de tradiciones'
          ]
        }
      ];

      const mockRegions: RegionalAnalysis[] = [
        {
          id: '1',
          region: 'Yucatán',
          country: 'México',
          population: 2300000,
          activeUsers: 15600,
          culturalDiversity: 0.85,
          adaptationNeeds: [
            'Contenido bilingüe',
            'Contexto histórico',
            'Adaptación rural',
            'Preservación cultural'
          ],
          successMetrics: {
            engagement: 0.78,
            completion: 0.82,
            satisfaction: 4.3,
            retention: 0.85
          },
          topLanguages: [
            { language: 'maya', users: 12400, percentage: 79.5 },
            { language: 'español', users: 3200, percentage: 20.5 }
          ],
          culturalInsights: {
            values: ['Comunidad', 'Tradición', 'Naturaleza'],
            preferences: ['Aprendizaje grupal', 'Historias locales', 'Práctica'],
            taboos: ['Falta de respeto', 'Individualismo', 'Destrucción ambiental']
          }
        }
      ];

      setContexts(mockContexts);
      setLanguages(mockLanguages);
      setRegions(mockRegions);
      
      setAnalytics({
        totalContexts: 24,
        activeAdaptations: 18,
        averageAdaptationScore: 0.84,
        topLanguages: [
          { language: 'español', users: 45600, percentage: 45.6 },
          { language: 'maya', users: 12400, percentage: 12.4 },
          { language: 'náhuatl', users: 18900, percentage: 18.9 },
          { language: 'zapoteco', users: 8900, percentage: 8.9 },
          { language: 'mixteco', users: 6700, percentage: 6.7 },
          { language: 'otras', users: 7500, percentage: 7.5 }
        ],
        topRegions: [
          { region: 'Yucatán', users: 15600, adaptationScore: 0.87 },
          { region: 'Puebla', users: 18900, adaptationScore: 0.91 },
          { region: 'Oaxaca', users: 8900, adaptationScore: 0.79 },
          { region: 'Chiapas', users: 12300, adaptationScore: 0.83 }
        ],
        recentAdaptations: mockContexts.slice(0, 5),
        adaptationTrends: [
          { date: '2024-01-01', adaptations: 12, score: 0.82, users: 45000 },
          { date: '2024-01-02', adaptations: 15, score: 0.84, users: 46200 },
          { date: '2024-01-03', adaptations: 18, score: 0.86, users: 47800 }
        ],
        culturalInsights: {
          totalInsights: 156,
          implementedInsights: 134,
          impactScore: 0.89
        }
      });
    } catch (error) {
      console.error('Error cargando datos culturales:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAdaptationScoreColor = (score: number) => {
    if (score >= 0.9) return 'bg-green-100 text-green-800';
    if (score >= 0.8) return 'bg-blue-100 text-blue-800';
    if (score >= 0.7) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 90) return 'text-green-600';
    if (progress >= 70) return 'text-blue-600';
    if (progress >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('es-MX').format(value);
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const formatScore = (value: number) => {
    return (value * 100).toFixed(0);
  };

  const filteredContexts = contexts.filter(context => {
    const regionMatch = filterRegion === 'all' || context.region === filterRegion;
    const languageMatch = filterLanguage === 'all' || context.language === filterLanguage;
    return regionMatch && languageMatch;
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
          <h1 className="text-3xl font-bold text-gray-900">Adaptación Cultural</h1>
          <p className="text-gray-600">Análisis y gestión de adaptaciones culturales y lingüísticas</p>
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
            Nueva Adaptación
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
            <option value="7d">Últimos 7 días</option>
            <option value="30d">Últimos 30 días</option>
            <option value="90d">Últimos 90 días</option>
            <option value="1y">Último año</option>
          </select>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Región:</span>
          <select 
            value={filterRegion}
            onChange={(e) => setFilterRegion(e.target.value)}
            className="border rounded px-3 py-1 text-sm"
          >
            <option value="all">Todas</option>
            <option value="Yucatán">Yucatán</option>
            <option value="Puebla">Puebla</option>
            <option value="Oaxaca">Oaxaca</option>
            <option value="Chiapas">Chiapas</option>
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
            <option value="mixteco">Mixteco</option>
          </select>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contextos Culturales</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalContexts}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.activeAdaptations} activos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Puntuación Promedio</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatScore(analytics.averageAdaptationScore)}</div>
            <p className="text-xs text-muted-foreground">
              de 100 puntos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Idiomas Soportados</CardTitle>
            <Languages className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.topLanguages.length}</div>
            <p className="text-xs text-muted-foreground">
              idiomas nativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Insights Implementados</CardTitle>
            <Lightbulb className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.culturalInsights.implementedInsights}</div>
            <p className="text-xs text-muted-foreground">
              de {analytics.culturalInsights.totalInsights} totales
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs principales */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="contexts">Contextos</TabsTrigger>
          <TabsTrigger value="languages">Idiomas</TabsTrigger>
          <TabsTrigger value="regions">Regiones</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top idiomas */}
            <Card>
              <CardHeader>
                <CardTitle>Idiomas Principales</CardTitle>
                <CardDescription>Distribución de usuarios por idioma</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.topLanguages.map((lang, index) => (
                    <div key={lang.language} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-semibold capitalize">{lang.language}</div>
                          <div className="text-sm text-gray-500">{formatNumber(lang.users)} usuarios</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{formatPercentage(lang.percentage / 100)}</div>
                        <div className="text-sm text-gray-500">del total</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top regiones */}
            <Card>
              <CardHeader>
                <CardTitle>Regiones Principales</CardTitle>
                <CardDescription>Adaptación por región geográfica</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.topRegions.map((region, index) => (
                    <div key={region.region} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-semibold">{region.region}</div>
                          <div className="text-sm text-gray-500">{formatNumber(region.users)} usuarios</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{formatScore(region.adaptationScore)}</div>
                        <div className="text-sm text-gray-500">puntuación</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="contexts" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredContexts.map((context) => (
              <Card key={context.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Globe className="h-4 w-4" />
                      <CardTitle className="text-lg">{context.name}</CardTitle>
                    </div>
                    <Badge className={getAdaptationScoreColor(context.adaptationScore)}>
                      {formatScore(context.adaptationScore)}/100
                    </Badge>
                  </div>
                  <CardDescription>{context.region} • {context.language}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Usuarios Activos:</span>
                      <div className="font-semibold">{formatNumber(context.activeUsers)}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Población:</span>
                      <div className="font-semibold">{formatNumber(context.population)}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Contenido Localizado:</span>
                      <div className="font-semibold">{formatPercentage(context.contentLocalization.localizedContent / context.contentLocalization.totalContent)}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Satisfacción:</span>
                      <div className="font-semibold">⭐ {context.userEngagement.satisfactionScore}/5</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <span className="text-sm font-medium">Valores Culturales:</span>
                    <div className="flex flex-wrap gap-1">
                      {context.culturalValues.slice(0, 3).map((value, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {value}
                        </Badge>
                      ))}
                      {context.culturalValues.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{context.culturalValues.length - 3} más
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-sm font-medium">Estilos de Aprendizaje:</span>
                    <div className="flex flex-wrap gap-1">
                      {context.learningStyles.slice(0, 2).map((style, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {style}
                        </Badge>
                      ))}
                      {context.learningStyles.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{context.learningStyles.length - 2} más
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => setSelectedContext(context.id)}
                    >
                      Ver Detalles
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="languages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Adaptación de Idiomas</CardTitle>
              <CardDescription>Progreso de traducción y adaptación cultural</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {languages.map((language) => (
                  <div key={language.id} className="border rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <Languages className="h-5 w-5" />
                        <div>
                          <h3 className="font-semibold text-lg">{language.nativeName}</h3>
                          <p className="text-sm text-gray-500">{language.language}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">{formatNumber(language.activeUsers)}</div>
                        <div className="text-sm text-gray-500">usuarios activos</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{language.translationProgress}%</div>
                        <div className="text-sm text-gray-500">Progreso</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{formatScore(language.qualityScore)}</div>
                        <div className="text-sm text-gray-500">Calidad</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{language.culturalAdaptations}</div>
                        <div className="text-sm text-gray-500">Adaptaciones</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{language.content.published}</div>
                        <div className="text-sm text-gray-500">Publicados</div>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span>Progreso de traducción:</span>
                        <span className={getProgressColor(language.translationProgress)}>
                          {language.translationProgress}%
                        </span>
                      </div>
                      <Progress 
                        value={language.translationProgress} 
                        className="h-2" 
                      />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium mb-2">Desafíos:</h4>
                        <ul className="space-y-1">
                          {language.challenges.map((challenge, index) => (
                            <li key={index} className="text-sm text-gray-600 flex items-center">
                              <AlertTriangle className="h-3 w-3 mr-2 text-orange-500" />
                              {challenge}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Recomendaciones:</h4>
                        <ul className="space-y-1">
                          {language.recommendations.map((rec, index) => (
                            <li key={index} className="text-sm text-gray-600 flex items-center">
                              <Lightbulb className="h-3 w-3 mr-2 text-yellow-500" />
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="regions" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {regions.map((region) => (
              <Card key={region.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4" />
                      <CardTitle>{region.region}</CardTitle>
                    </div>
                    <Badge variant="outline">{region.country}</Badge>
                  </div>
                  <CardDescription>{formatNumber(region.population)} habitantes</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Usuarios Activos:</span>
                      <div className="font-semibold">{formatNumber(region.activeUsers)}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Diversidad Cultural:</span>
                      <div className="font-semibold">{formatPercentage(region.culturalDiversity)}</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-sm font-medium">Métricas de Éxito:</span>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <div className="font-semibold">{formatPercentage(region.successMetrics.engagement)}</div>
                        <div className="text-xs text-gray-500">Engagement</div>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <div className="font-semibold">{formatPercentage(region.successMetrics.completion)}</div>
                        <div className="text-xs text-gray-500">Completación</div>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <div className="font-semibold">⭐ {region.successMetrics.satisfaction}</div>
                        <div className="text-xs text-gray-500">Satisfacción</div>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <div className="font-semibold">{formatPercentage(region.successMetrics.retention)}</div>
                        <div className="text-xs text-gray-500">Retención</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-sm font-medium">Idiomas Principales:</span>
                    <div className="flex flex-wrap gap-1">
                      {region.topLanguages.map((lang, index) => (
                        <Badge key={index} variant="outline">
                          {lang.language} ({formatPercentage(lang.percentage / 100)})
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-sm font-medium">Valores Culturales:</span>
                    <div className="flex flex-wrap gap-1">
                      {region.culturalInsights.values.map((value, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {value}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Métricas de insights */}
            <Card>
              <CardHeader>
                <CardTitle>Métricas de Insights Culturales</CardTitle>
                <CardDescription>Análisis de implementación e impacto</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Insights Totales</span>
                    <Badge variant="secondary">{analytics.culturalInsights.totalInsights}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Implementados</span>
                    <Badge variant="default">{analytics.culturalInsights.implementedInsights}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Pendientes</span>
                    <Badge variant="outline">{analytics.culturalInsights.totalInsights - analytics.culturalInsights.implementedInsights}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Puntuación de Impacto</span>
                    <Badge variant="secondary">{formatScore(analytics.culturalInsights.impactScore)}/100</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tendencias de adaptación */}
            <Card>
              <CardHeader>
                <CardTitle>Tendencias de Adaptación</CardTitle>
                <CardDescription>Evolución de adaptaciones culturales</CardDescription>
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
