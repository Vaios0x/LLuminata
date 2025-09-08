'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  BookOpen, 
  Clock,
  Target,
  Award,
  Brain,
  Heart,
  Zap,
  Globe,
  Settings,
  Download,
  Share2,
  Calendar,
  Filter,
  Eye,
  AlertCircle,
  CheckCircle,
  Star,
  Activity,
  PieChart,
  LineChart,
  ArrowUp,
  ArrowDown,
  Minus,
  Users2,
  FileText,
  DollarSign,
  Shield,
  MapPin,
  ActivityIcon,
  TargetIcon,
  AwardIcon,
  BrainIcon,
  HeartIcon,
  ZapIcon,
  GlobeIcon,
  SettingsIcon,
  DownloadIcon,
  Share2Icon,
  CalendarIcon,
  FilterIcon,
  EyeIcon,
  AlertCircleIcon,
  CheckCircleIcon,
  StarIcon
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useScreenReader } from '@/components/accessibility/screen-reader';
import { useHighContrast } from '@/components/accessibility/high-contrast';

interface ReportData {
  overview: {
    totalUsers: number;
    activeUsers: number;
    totalContent: number;
    totalRegions: number;
    totalLanguages: number;
    averageEngagement: number;
    systemUptime: number;
    revenue: number;
  };
  userMetrics: {
    growth: {
      monthly: number;
      quarterly: number;
      yearly: number;
    };
    demographics: {
      students: number;
      teachers: number;
      admins: number;
      parents: number;
    };
    engagement: {
      dailyActive: number;
      weeklyActive: number;
      monthlyActive: number;
      averageSessionTime: number;
    };
    retention: {
      day1: number;
      day7: number;
      day30: number;
      day90: number;
    };
  };
  contentMetrics: {
    totalLessons: number;
    totalAssessments: number;
    totalActivities: number;
    totalResources: number;
    completionRates: {
      lessons: number;
      assessments: number;
      activities: number;
    };
    qualityScores: {
      culturalRelevance: number;
      accessibility: number;
      engagement: number;
      educationalValue: number;
    };
  };
  aiMetrics: {
    modelPerformance: {
      needsDetection: number;
      culturalAdaptation: number;
      speechRecognition: number;
      contentGeneration: number;
    };
    usage: {
      dailyRequests: number;
      weeklyRequests: number;
      monthlyRequests: number;
      averageResponseTime: number;
    };
    accuracy: {
      predictions: number;
      recommendations: number;
      translations: number;
      adaptations: number;
    };
  };
  regionalMetrics: {
    topRegions: {
      name: string;
      users: number;
      engagement: number;
      growth: number;
    }[];
    culturalImpact: {
      region: string;
      culturalRelevance: number;
      localContent: number;
      userSatisfaction: number;
    }[];
  };
  accessibilityMetrics: {
    featureUsage: {
      screenReader: number;
      highContrast: number;
      keyboardNavigation: number;
      audioDescription: number;
      subtitles: number;
    };
    userNeeds: {
      visual: number;
      auditory: number;
      motor: number;
      cognitive: number;
    };
    satisfaction: {
      overall: number;
      easeOfUse: number;
      effectiveness: number;
      support: number;
    };
  };
  financialMetrics: {
    revenue: {
      monthly: number;
      quarterly: number;
      yearly: number;
      growth: number;
    };
    costs: {
      infrastructure: number;
      development: number;
      content: number;
      support: number;
    };
    roi: {
      marketing: number;
      development: number;
      content: number;
      overall: number;
    };
  };
  trends: {
    weekly: {
      users: number;
      content: number;
      engagement: number;
      revenue: number;
    }[];
    monthly: {
      users: number;
      content: number;
      engagement: number;
      revenue: number;
    }[];
  };
}

export default function ReportsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { speak, isEnabled: screenReaderEnabled } = useScreenReader();
  const { getStyles } = useHighContrast();

  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedView, setSelectedView] = useState('overview');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadReportData();
  }, []);

  const loadReportData = async () => {
    setIsLoading(true);
    try {
      // En producción, esto vendría de la API
      const mockData: ReportData = {
        overview: {
          totalUsers: 89200,
          activeUsers: 67800,
          totalContent: 1245,
          totalRegions: 12,
          totalLanguages: 8,
          averageEngagement: 84.7,
          systemUptime: 99.8,
          revenue: 1250000
        },
        userMetrics: {
          growth: {
            monthly: 12.5,
            quarterly: 34.2,
            yearly: 156.8
          },
          demographics: {
            students: 71200,
            teachers: 13400,
            admins: 3200,
            parents: 1400
          },
          engagement: {
            dailyActive: 45600,
            weeklyActive: 67800,
            monthlyActive: 89200,
            averageSessionTime: 28.5
          },
          retention: {
            day1: 78.5,
            day7: 65.2,
            day30: 52.8,
            day90: 41.3
          }
        },
        contentMetrics: {
          totalLessons: 567,
          totalAssessments: 234,
          totalActivities: 298,
          totalResources: 146,
          completionRates: {
            lessons: 78.3,
            assessments: 82.1,
            activities: 85.7
          },
          qualityScores: {
            culturalRelevance: 9.2,
            accessibility: 8.8,
            engagement: 8.5,
            educationalValue: 9.1
          }
        },
        aiMetrics: {
          modelPerformance: {
            needsDetection: 9.4,
            culturalAdaptation: 9.1,
            speechRecognition: 8.7,
            contentGeneration: 8.9
          },
          usage: {
            dailyRequests: 234000,
            weeklyRequests: 1568000,
            monthlyRequests: 6780000,
            averageResponseTime: 1.2
          },
          accuracy: {
            predictions: 87.3,
            recommendations: 89.1,
            translations: 92.5,
            adaptations: 88.7
          }
        },
        regionalMetrics: {
          topRegions: [
            {
              name: 'Guatemala Central',
              users: 12450,
              engagement: 88.5,
              growth: 15.2
            },
            {
              name: 'Bahía Nordeste',
              users: 15680,
              engagement: 90.2,
              growth: 18.7
            },
            {
              name: 'Chiapas Sur',
              users: 9870,
              engagement: 87.1,
              growth: 12.4
            }
          ],
          culturalImpact: [
            {
              region: 'Guatemala Central',
              culturalRelevance: 9.2,
              localContent: 156,
              userSatisfaction: 8.9
            },
            {
              region: 'Bahía Nordeste',
              culturalRelevance: 9.8,
              localContent: 178,
              userSatisfaction: 9.3
            },
            {
              region: 'Chiapas Sur',
              culturalRelevance: 9.5,
              localContent: 134,
              userSatisfaction: 9.1
            }
          ]
        },
        accessibilityMetrics: {
          featureUsage: {
            screenReader: 823,
            highContrast: 1245,
            keyboardNavigation: 1890,
            audioDescription: 567,
            subtitles: 892
          },
          userNeeds: {
            visual: 2340,
            auditory: 890,
            motor: 567,
            cognitive: 1234
          },
          satisfaction: {
            overall: 8.9,
            easeOfUse: 8.7,
            effectiveness: 9.1,
            support: 8.8
          }
        },
        financialMetrics: {
          revenue: {
            monthly: 125000,
            quarterly: 380000,
            yearly: 1250000,
            growth: 23.4
          },
          costs: {
            infrastructure: 45000,
            development: 89000,
            content: 67000,
            support: 34000
          },
          roi: {
            marketing: 3.2,
            development: 2.8,
            content: 4.1,
            overall: 3.4
          }
        },
        trends: {
          weekly: [
            { users: 85000, content: 1200, engagement: 82, revenue: 115000 },
            { users: 86000, content: 1210, engagement: 83, revenue: 118000 },
            { users: 87000, content: 1220, engagement: 84, revenue: 120000 },
            { users: 88000, content: 1230, engagement: 85, revenue: 122000 },
            { users: 89000, content: 1240, engagement: 86, revenue: 125000 }
          ],
          monthly: [
            { users: 75000, content: 1100, engagement: 78, revenue: 100000 },
            { users: 78000, content: 1150, engagement: 80, revenue: 105000 },
            { users: 82000, content: 1180, engagement: 82, revenue: 110000 },
            { users: 86000, content: 1210, engagement: 84, revenue: 115000 },
            { users: 89000, content: 1240, engagement: 86, revenue: 125000 }
          ]
        }
      };

      setReportData(mockData);
    } catch (error) {
      console.error('Error cargando reportes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `$${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const formatCurrency = (num: number): string => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num);
  };

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return <ArrowUp className="h-4 w-4 text-green-600" />;
    if (current < previous) return <ArrowDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-gray-600" />;
  };

  const getTrendColor = (current: number, previous: number): string => {
    if (current > previous) return 'text-green-600';
    if (current < previous) return 'text-red-600';
    return 'text-gray-600';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4" style={getStyles()}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Generando reportes...</p>
        </div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4" style={getStyles()}>
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error al cargar reportes</h3>
          <p className="text-gray-600 mb-4">No se pudieron generar los reportes</p>
          <Button onClick={loadReportData}>Reintentar</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4" style={getStyles()}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Reportes Administrativos</h1>
              <p className="text-gray-600">Métricas globales, análisis de IA e insights estratégicos</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar PDF
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Compartir
              </Button>
              <Button size="sm">
                <Calendar className="h-4 w-4 mr-2" />
                Programar
              </Button>
            </div>
          </div>

          {/* Filtros */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Período:</label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="week">Esta semana</option>
                <option value="month">Este mes</option>
                <option value="quarter">Este trimestre</option>
                <option value="year">Este año</option>
              </select>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filtros
            </Button>
          </div>

          {/* Navegación de vistas */}
          <div className="flex items-center gap-2 mb-6">
            <Button
              variant={selectedView === 'overview' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedView('overview')}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Resumen
            </Button>
            <Button
              variant={selectedView === 'users' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedView('users')}
            >
              <Users className="h-4 w-4 mr-2" />
              Usuarios
            </Button>
            <Button
              variant={selectedView === 'content' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedView('content')}
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Contenido
            </Button>
            <Button
              variant={selectedView === 'ai' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedView('ai')}
            >
              <Brain className="h-4 w-4 mr-2" />
              IA
            </Button>
            <Button
              variant={selectedView === 'financial' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedView('financial')}
            >
              <DollarSign className="h-4 w-4 mr-2" />
              Financiero
            </Button>
          </div>
        </div>

        {/* Vista de Resumen */}
        {selectedView === 'overview' && (
          <div className="space-y-6">
            {/* Métricas principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Usuarios</p>
                      <p className="text-2xl font-bold text-blue-600">{formatNumber(reportData.overview.totalUsers)}</p>
                      <div className="flex items-center gap-1 mt-1">
                        {getTrendIcon(reportData.userMetrics.growth.monthly, 10)}
                        <span className="text-sm text-gray-600">+{reportData.userMetrics.growth.monthly}% este mes</span>
                      </div>
                    </div>
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Engagement Promedio</p>
                      <p className="text-2xl font-bold text-green-600">{reportData.overview.averageEngagement}%</p>
                      <div className="flex items-center gap-1 mt-1">
                        {getTrendIcon(reportData.overview.averageEngagement, 82)}
                        <span className="text-sm text-gray-600">+{reportData.overview.averageEngagement - 82}% vs mes anterior</span>
                      </div>
                    </div>
                    <Activity className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Contenido Total</p>
                      <p className="text-2xl font-bold text-purple-600">{formatNumber(reportData.overview.totalContent)}</p>
                      <div className="flex items-center gap-1 mt-1">
                        {getTrendIcon(reportData.overview.totalContent, 1200)}
                        <span className="text-sm text-gray-600">+{reportData.overview.totalContent - 1200} este mes</span>
                      </div>
                    </div>
                    <BookOpen className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Ingresos</p>
                      <p className="text-2xl font-bold text-orange-600">{formatCurrency(reportData.overview.revenue)}</p>
                      <div className="flex items-center gap-1 mt-1">
                        {getTrendIcon(reportData.financialMetrics.revenue.growth, 20)}
                        <span className="text-sm text-gray-600">+{reportData.financialMetrics.revenue.growth}% este año</span>
                      </div>
                    </div>
                    <DollarSign className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Métricas de crecimiento */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Crecimiento de Usuarios
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Mensual</span>
                      <span className="font-semibold text-green-600">+{reportData.userMetrics.growth.monthly}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Trimestral</span>
                      <span className="font-semibold text-blue-600">+{reportData.userMetrics.growth.quarterly}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Anual</span>
                      <span className="font-semibold text-purple-600">+{reportData.userMetrics.growth.yearly}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Retención
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Día 1</span>
                      <span className="font-semibold text-green-600">{reportData.userMetrics.retention.day1}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Día 7</span>
                      <span className="font-semibold text-blue-600">{reportData.userMetrics.retention.day7}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Día 30</span>
                      <span className="font-semibold text-purple-600">{reportData.userMetrics.retention.day30}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Cobertura
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Regiones</span>
                      <span className="font-semibold text-blue-600">{reportData.overview.totalRegions}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Idiomas</span>
                      <span className="font-semibold text-green-600">{reportData.overview.totalLanguages}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Uptime</span>
                      <span className="font-semibold text-purple-600">{reportData.overview.systemUptime}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top regiones */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Top Regiones por Rendimiento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reportData.regionalMetrics.topRegions.map((region, index) => (
                    <div key={region.name} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-medium">{region.name}</h4>
                          <p className="text-sm text-gray-600">{formatNumber(region.users)} usuarios</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-green-600">{region.engagement}%</div>
                        <div className="text-sm text-gray-600">engagement</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Vista de Usuarios */}
        {selectedView === 'users' && (
          <div className="space-y-6">
            {/* Demografía */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Demografía de Usuarios
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{formatNumber(reportData.userMetrics.demographics.students)}</div>
                    <div className="text-sm text-gray-600">Estudiantes</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{formatNumber(reportData.userMetrics.demographics.teachers)}</div>
                    <div className="text-sm text-gray-600">Maestros</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{formatNumber(reportData.userMetrics.demographics.admins)}</div>
                    <div className="text-sm text-gray-600">Administradores</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{formatNumber(reportData.userMetrics.demographics.parents)}</div>
                    <div className="text-sm text-gray-600">Padres</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Engagement */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Métricas de Engagement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-4">Usuarios Activos</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Diarios</span>
                        <span className="font-semibold">{formatNumber(reportData.userMetrics.engagement.dailyActive)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Semanales</span>
                        <span className="font-semibold">{formatNumber(reportData.userMetrics.engagement.weeklyActive)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Mensuales</span>
                        <span className="font-semibold">{formatNumber(reportData.userMetrics.engagement.monthlyActive)}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-4">Tiempo de Sesión</h4>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">{reportData.userMetrics.engagement.averageSessionTime}m</div>
                      <div className="text-sm text-gray-600">Promedio por sesión</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Vista de Contenido */}
        {selectedView === 'content' && (
          <div className="space-y-6">
            {/* Estadísticas de contenido */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{reportData.contentMetrics.totalLessons}</div>
                    <div className="text-sm text-gray-600">Lecciones</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{reportData.contentMetrics.totalAssessments}</div>
                    <div className="text-sm text-gray-600">Evaluaciones</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{reportData.contentMetrics.totalActivities}</div>
                    <div className="text-sm text-gray-600">Actividades</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{reportData.contentMetrics.totalResources}</div>
                    <div className="text-sm text-gray-600">Recursos</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Calidad del contenido */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Calidad del Contenido
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-4">Puntuaciones de Calidad</h4>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Relevancia Cultural</span>
                          <span>{reportData.contentMetrics.qualityScores.culturalRelevance}/10</span>
                        </div>
                        <Progress value={reportData.contentMetrics.qualityScores.culturalRelevance * 10} />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Accesibilidad</span>
                          <span>{reportData.contentMetrics.qualityScores.accessibility}/10</span>
                        </div>
                        <Progress value={reportData.contentMetrics.qualityScores.accessibility * 10} />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Engagement</span>
                          <span>{reportData.contentMetrics.qualityScores.engagement}/10</span>
                        </div>
                        <Progress value={reportData.contentMetrics.qualityScores.engagement * 10} />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Valor Educativo</span>
                          <span>{reportData.contentMetrics.qualityScores.educationalValue}/10</span>
                        </div>
                        <Progress value={reportData.contentMetrics.qualityScores.educationalValue * 10} />
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-4">Tasas de Completación</h4>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Lecciones</span>
                          <span>{reportData.contentMetrics.completionRates.lessons}%</span>
                        </div>
                        <Progress value={reportData.contentMetrics.completionRates.lessons} />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Evaluaciones</span>
                          <span>{reportData.contentMetrics.completionRates.assessments}%</span>
                        </div>
                        <Progress value={reportData.contentMetrics.completionRates.assessments} />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Actividades</span>
                          <span>{reportData.contentMetrics.completionRates.activities}%</span>
                        </div>
                        <Progress value={reportData.contentMetrics.completionRates.activities} />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Vista de IA */}
        {selectedView === 'ai' && (
          <div className="space-y-6">
            {/* Rendimiento de modelos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Rendimiento de Modelos de IA
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-4">Puntuaciones de Rendimiento</h4>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Detección de Necesidades</span>
                          <span>{reportData.aiMetrics.modelPerformance.needsDetection}/10</span>
                        </div>
                        <Progress value={reportData.aiMetrics.modelPerformance.needsDetection * 10} />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Adaptación Cultural</span>
                          <span>{reportData.aiMetrics.modelPerformance.culturalAdaptation}/10</span>
                        </div>
                        <Progress value={reportData.aiMetrics.modelPerformance.culturalAdaptation * 10} />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Reconocimiento de Voz</span>
                          <span>{reportData.aiMetrics.modelPerformance.speechRecognition}/10</span>
                        </div>
                        <Progress value={reportData.aiMetrics.modelPerformance.speechRecognition * 10} />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Generación de Contenido</span>
                          <span>{reportData.aiMetrics.modelPerformance.contentGeneration}/10</span>
                        </div>
                        <Progress value={reportData.aiMetrics.modelPerformance.contentGeneration * 10} />
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-4">Precisión</h4>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Predicciones</span>
                          <span>{reportData.aiMetrics.accuracy.predictions}%</span>
                        </div>
                        <Progress value={reportData.aiMetrics.accuracy.predictions} />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Recomendaciones</span>
                          <span>{reportData.aiMetrics.accuracy.recommendations}%</span>
                        </div>
                        <Progress value={reportData.aiMetrics.accuracy.recommendations} />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Traducciones</span>
                          <span>{reportData.aiMetrics.accuracy.translations}%</span>
                        </div>
                        <Progress value={reportData.aiMetrics.accuracy.translations} />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Adaptaciones</span>
                          <span>{reportData.aiMetrics.accuracy.adaptations}%</span>
                        </div>
                        <Progress value={reportData.aiMetrics.accuracy.adaptations} />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Uso de IA */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Uso de IA
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{formatNumber(reportData.aiMetrics.usage.dailyRequests)}</div>
                    <div className="text-sm text-gray-600">Solicitudes diarias</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{formatNumber(reportData.aiMetrics.usage.monthlyRequests)}</div>
                    <div className="text-sm text-gray-600">Solicitudes mensuales</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{reportData.aiMetrics.usage.averageResponseTime}s</div>
                    <div className="text-sm text-gray-600">Tiempo respuesta promedio</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Vista Financiera */}
        {selectedView === 'financial' && (
          <div className="space-y-6">
            {/* Ingresos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Ingresos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{formatCurrency(reportData.financialMetrics.revenue.monthly)}</div>
                    <div className="text-sm text-gray-600">Mensual</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{formatCurrency(reportData.financialMetrics.revenue.quarterly)}</div>
                    <div className="text-sm text-gray-600">Trimestral</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{formatCurrency(reportData.financialMetrics.revenue.yearly)}</div>
                    <div className="text-sm text-gray-600">Anual</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">+{reportData.financialMetrics.revenue.growth}%</div>
                    <div className="text-sm text-gray-600">Crecimiento</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Costos y ROI */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Costos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Infraestructura</span>
                      <span className="font-semibold">{formatCurrency(reportData.financialMetrics.costs.infrastructure)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Desarrollo</span>
                      <span className="font-semibold">{formatCurrency(reportData.financialMetrics.costs.development)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Contenido</span>
                      <span className="font-semibold">{formatCurrency(reportData.financialMetrics.costs.content)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Soporte</span>
                      <span className="font-semibold">{formatCurrency(reportData.financialMetrics.costs.support)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    ROI
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Marketing</span>
                      <span className="font-semibold text-green-600">{reportData.financialMetrics.roi.marketing}x</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Desarrollo</span>
                      <span className="font-semibold text-blue-600">{reportData.financialMetrics.roi.development}x</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Contenido</span>
                      <span className="font-semibold text-purple-600">{reportData.financialMetrics.roi.content}x</span>
                    </div>
                    <div className="flex justify-between">
                      <span>General</span>
                      <span className="font-semibold text-orange-600">{reportData.financialMetrics.roi.overall}x</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
