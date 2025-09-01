'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
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
  Zap,
  Eye,
  MousePointer,
  MousePointerClick
} from 'lucide-react';

interface ABTest {
  id: string;
  name: string;
  description: string;
  type: 'ui' | 'content' | 'feature' | 'algorithm' | 'workflow';
  status: 'draft' | 'running' | 'paused' | 'completed' | 'stopped';
  hypothesis: string;
  successMetrics: string[];
  trafficSplit: {
    control: number;
    variantA: number;
    variantB: number;
    variantC?: number;
  };
  startDate: Date;
  endDate?: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  config: {
    confidenceLevel: number;
    minimumSampleSize: number;
    maxDuration: number;
    autoStop: boolean;
    segments?: string[];
  };
  variants: ABTestVariant[];
  participants: ABTestParticipant[];
  results: ABTestResult[];
}

interface ABTestVariant {
  id: string;
  testId: string;
  name: string;
  type: 'control' | 'variant';
  config: Record<string, any>;
  trafficPercentage: number;
  isActive: boolean;
}

interface ABTestParticipant {
  id: string;
  testId: string;
  userId?: string;
  sessionId: string;
  variantId: string;
  assignedAt: Date;
  firstSeenAt: Date;
  lastSeenAt: Date;
  events: ABTestEvent[];
  metadata?: Record<string, any>;
}

interface ABTestEvent {
  id: string;
  participantId: string;
  testId: string;
  variantId: string;
  eventType: string;
  eventName: string;
  timestamp: Date;
  value?: number;
  properties?: Record<string, any>;
}

interface ABTestResult {
  testId: string;
  variantId: string;
  variantName: string;
  sampleSize: number;
  conversionRate: number;
  conversionCount: number;
  averageValue: number;
  totalValue: number;
  standardError: number;
  confidenceInterval: {
    lower: number;
    upper: number;
  };
  pValue: number;
  isSignificant: boolean;
  lift: number;
  relativeLift: number;
}

interface ABTestAnalysis {
  testId: string;
  testName: string;
  status: string;
  startDate: Date;
  endDate?: Date;
  totalParticipants: number;
  totalEvents: number;
  results: ABTestResult[];
  winner?: string;
  confidence: number;
  statisticalPower: number;
  recommendations: string[];
  insights: Array<{
    type: 'positive' | 'negative' | 'neutral';
    message: string;
    impact: 'high' | 'medium' | 'low';
  }>;
}

interface ABTestStats {
  totalTests: number;
  activeTests: number;
  completedTests: number;
  totalParticipants: number;
  totalEvents: number;
  averageConfidence: number;
  significantResults: number;
  topTests: {
    id: string;
    name: string;
    type: string;
    participants: number;
    confidence: number;
    winner?: string;
  }[];
}

export default function ABTestingDashboard() {
  const [tests, setTests] = useState<ABTest[]>([]);
  const [stats, setStats] = useState<ABTestStats>({
    totalTests: 0,
    activeTests: 0,
    completedTests: 0,
    totalParticipants: 0,
    totalEvents: 0,
    averageConfidence: 0,
    significantResults: 0,
    topTests: []
  });
  const [loading, setLoading] = useState(true);
  const [selectedTest, setSelectedTest] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    loadABTestingData();
  }, []);

  const loadABTestingData = async () => {
    setLoading(true);
    try {
      // Simular carga de datos
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockTests: ABTest[] = [
        {
          id: '1',
          name: 'Nuevo Diseño de Botón CTA',
          description: 'Probando un nuevo diseño de botón para mejorar conversiones',
          type: 'ui',
          status: 'running',
          hypothesis: 'Un botón más prominente aumentará las conversiones en un 15%',
          successMetrics: ['click_rate', 'conversion_rate'],
          trafficSplit: {
            control: 50,
            variantA: 25,
            variantB: 25
          },
          startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          createdBy: 'María García',
          createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(),
          config: {
            confidenceLevel: 0.95,
            minimumSampleSize: 1000,
            maxDuration: 30,
            autoStop: true
          },
          variants: [
            {
              id: 'v1',
              testId: '1',
              name: 'Control',
              type: 'control',
              config: { buttonColor: 'blue', buttonSize: 'medium' },
              trafficPercentage: 50,
              isActive: true
            },
            {
              id: 'v2',
              testId: '1',
              name: 'Variante A',
              type: 'variant',
              config: { buttonColor: 'green', buttonSize: 'large' },
              trafficPercentage: 25,
              isActive: true
            },
            {
              id: 'v3',
              testId: '1',
              name: 'Variante B',
              type: 'variant',
              config: { buttonColor: 'red', buttonSize: 'large' },
              trafficPercentage: 25,
              isActive: true
            }
          ],
          participants: [
            {
              id: 'p1',
              testId: '1',
              sessionId: 'session1',
              variantId: 'v1',
              assignedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
              firstSeenAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
              lastSeenAt: new Date(),
              events: [
                {
                  id: 'e1',
                  participantId: 'p1',
                  testId: '1',
                  variantId: 'v1',
                  eventType: 'click',
                  eventName: 'button_click',
                  timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
                  value: 1
                }
              ]
            }
          ],
          results: [
            {
              testId: '1',
              variantId: 'v1',
              variantName: 'Control',
              sampleSize: 500,
              conversionRate: 0.12,
              conversionCount: 60,
              averageValue: 1.2,
              totalValue: 600,
              standardError: 0.014,
              confidenceInterval: { lower: 0.092, upper: 0.148 },
              pValue: 0.05,
              isSignificant: false,
              lift: 0,
              relativeLift: 0
            },
            {
              testId: '1',
              variantId: 'v2',
              variantName: 'Variante A',
              sampleSize: 250,
              conversionRate: 0.16,
              conversionCount: 40,
              averageValue: 1.4,
              totalValue: 350,
              standardError: 0.023,
              confidenceInterval: { lower: 0.115, upper: 0.205 },
              pValue: 0.02,
              isSignificant: true,
              lift: 0.04,
              relativeLift: 33.3
            }
          ]
        },
        {
          id: '2',
          name: 'Nuevo Algoritmo de Recomendaciones',
          description: 'Probando un algoritmo mejorado de recomendaciones',
          type: 'algorithm',
          status: 'completed',
          hypothesis: 'El nuevo algoritmo aumentará el engagement en un 20%',
          successMetrics: ['engagement_rate', 'time_spent'],
          trafficSplit: {
            control: 50,
            variantA: 50,
            variantB: 0
          },
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          createdBy: 'Carlos López',
          createdAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          config: {
            confidenceLevel: 0.95,
            minimumSampleSize: 2000,
            maxDuration: 30,
            autoStop: true
          },
          variants: [],
          participants: [],
          results: []
        }
      ];

      setTests(mockTests);
      
      setStats({
        totalTests: 24,
        activeTests: 8,
        completedTests: 16,
        totalParticipants: 12470,
        totalEvents: 45678,
        averageConfidence: 0.92,
        significantResults: 12,
        topTests: [
          {
            id: '1',
            name: 'Nuevo Diseño de Botón CTA',
            type: 'ui',
            participants: 1000,
            confidence: 0.95,
            winner: 'Variante A'
          },
          {
            id: '2',
            name: 'Nuevo Algoritmo de Recomendaciones',
            type: 'algorithm',
            participants: 2000,
            confidence: 0.98,
            winner: 'Variante A'
          }
        ]
      });
    } catch (error) {
      console.error('Error cargando datos de A/B testing:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'running': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'stopped': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'ui': return <Eye className="h-4 w-4" />;
      case 'content': return <MessageSquare className="h-4 w-4" />;
      case 'feature': return <Zap className="h-4 w-4" />;
      case 'algorithm': return <Settings className="h-4 w-4" />;
      case 'workflow': return <BarChart3 className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <AlertCircle className="h-4 w-4" />;
      case 'running': return <Play className="h-4 w-4" />;
      case 'paused': return <Pause className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'stopped': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const formatConfidence = (value: number) => {
    return `${(value * 100).toFixed(0)}%`;
  };

  const filteredTests = tests.filter(test => {
    const typeMatch = filterType === 'all' || test.type === filterType;
    const statusMatch = filterStatus === 'all' || test.status === filterStatus;
    return typeMatch && statusMatch;
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
          <h1 className="text-3xl font-bold text-gray-900">Dashboard de A/B Testing</h1>
          <p className="text-gray-600">Gestión y análisis de experimentos A/B</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <BarChart3 className="h-4 w-4 mr-2" />
            Análisis
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Test
          </Button>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tests Activos</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeTests}</div>
            <p className="text-xs text-muted-foreground">
              de {stats.totalTests} totales
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Participantes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalParticipants.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              en todos los tests
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confianza Promedio</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatConfidence(stats.averageConfidence)}</div>
            <p className="text-xs text-muted-foreground">
              nivel de confianza
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resultados Significativos</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.significantResults}</div>
            <p className="text-xs text-muted-foreground">
              tests con ganadores claros
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Tipo:</span>
          <select 
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="border rounded px-2 py-1 text-sm"
          >
            <option value="all">Todos</option>
            <option value="ui">UI</option>
            <option value="content">Contenido</option>
            <option value="feature">Funcionalidad</option>
            <option value="algorithm">Algoritmo</option>
            <option value="workflow">Flujo</option>
          </select>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Estado:</span>
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border rounded px-2 py-1 text-sm"
          >
            <option value="all">Todos</option>
            <option value="draft">Borrador</option>
            <option value="running">Ejecutándose</option>
            <option value="paused">Pausado</option>
            <option value="completed">Completado</option>
            <option value="stopped">Detenido</option>
          </select>
        </div>
      </div>

      {/* Tabs principales */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="tests">Tests</TabsTrigger>
          <TabsTrigger value="results">Resultados</TabsTrigger>
          <TabsTrigger value="analysis">Análisis</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top tests */}
            <Card>
              <CardHeader>
                <CardTitle>Mejores Tests</CardTitle>
                <CardDescription>Tests con mayor confianza y participantes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.topTests.map((test, index) => (
                    <div key={test.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-semibold">{test.name}</div>
                          <div className="text-sm text-gray-500">{test.type}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{test.participants} participantes</div>
                        <div className="text-sm text-gray-500">
                          {formatConfidence(test.confidence)} confianza
                        </div>
                        {test.winner && (
                          <Badge variant="outline" className="mt-1">
                            Ganador: {test.winner}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Estadísticas por tipo */}
            <Card>
              <CardHeader>
                <CardTitle>Tests por Tipo</CardTitle>
                <CardDescription>Distribución de tests por categoría</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>UI/UX</span>
                    <Badge variant="secondary">8 tests</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Contenido</span>
                    <Badge variant="outline">6 tests</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Funcionalidad</span>
                    <Badge variant="secondary">5 tests</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Algoritmo</span>
                    <Badge variant="outline">3 tests</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Flujo</span>
                    <Badge variant="secondary">2 tests</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tests" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredTests.map((test) => (
              <Card key={test.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(test.type)}
                      <CardTitle className="text-lg">{test.name}</CardTitle>
                    </div>
                    <Badge className={getStatusColor(test.status)}>
                      {test.status === 'draft' ? 'Borrador' :
                       test.status === 'running' ? 'Ejecutándose' :
                       test.status === 'paused' ? 'Pausado' :
                       test.status === 'completed' ? 'Completado' : 'Detenido'}
                    </Badge>
                  </div>
                  <CardDescription>{test.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm">
                    <div className="font-semibold">Hipótesis:</div>
                    <p className="text-gray-600">{test.hypothesis}</p>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span>Inicio:</span>
                    <span>{test.startDate.toLocaleDateString()}</span>
                  </div>
                  
                  {test.endDate && (
                    <div className="flex items-center justify-between text-sm">
                      <span>Fin:</span>
                      <span>{test.endDate.toLocaleDateString()}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between text-sm">
                    <span>Confianza:</span>
                    <span>{formatConfidence(test.config.confidenceLevel)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span>Muestra mínima:</span>
                    <span>{test.config.minimumSampleSize.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{test.type}</Badge>
                    {test.config.autoStop && (
                      <Badge variant="secondary">Auto-stop</Badge>
                    )}
                  </div>
                  
                  <div className="pt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => setSelectedTest(test.id)}
                    >
                      Ver Detalles
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          {selectedTest && (
            <Card>
              <CardHeader>
                <CardTitle>Resultados - {tests.find(t => t.id === selectedTest)?.name}</CardTitle>
                <CardDescription>Análisis estadístico de las variantes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {tests.find(t => t.id === selectedTest)?.results.map((result) => (
                    <div key={result.variantId} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">{result.variantName}</h3>
                          <p className="text-sm text-gray-500">
                            {result.sampleSize.toLocaleString()} participantes
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-lg">
                            {formatPercentage(result.conversionRate)}
                          </div>
                          <div className="text-sm text-gray-500">
                            Tasa de conversión
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Conversiones:</span>
                          <div className="font-semibold">{result.conversionCount}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Valor promedio:</span>
                          <div className="font-semibold">{result.averageValue.toFixed(2)}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Lift:</span>
                          <div className={`font-semibold ${
                            result.lift > 0 ? 'text-green-600' : result.lift < 0 ? 'text-red-600' : 'text-gray-600'
                          }`}>
                            {result.lift > 0 ? '+' : ''}{result.relativeLift.toFixed(1)}%
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500">Significancia:</span>
                          <div className="font-semibold">
                            {result.isSignificant ? (
                              <Badge variant="default">Significativo</Badge>
                            ) : (
                              <Badge variant="secondary">No significativo</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <div className="flex justify-between text-sm text-gray-500 mb-1">
                          <span>Intervalo de confianza:</span>
                          <span>{formatPercentage(result.confidenceInterval.lower)} - {formatPercentage(result.confidenceInterval.upper)}</span>
                        </div>
                        <Progress 
                          value={(result.conversionRate / 0.5) * 100} 
                          className="h-2" 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          
          {!selectedTest && (
            <Card>
              <CardContent className="flex items-center justify-center h-32">
                <p className="text-gray-500">Selecciona un test para ver sus resultados</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico de conversiones */}
            <Card>
              <CardHeader>
                <CardTitle>Evolución de Conversiones</CardTitle>
                <CardDescription>Tendencia de conversiones a lo largo del tiempo</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center bg-gray-50 rounded-lg">
                  <BarChart3 className="h-12 w-12 text-gray-400" />
                  <span className="ml-2 text-gray-500">Gráfico de conversiones</span>
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
                    <span>Tests Completados</span>
                    <Badge variant="secondary">{stats.completedTests}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Tasa de Éxito</span>
                    <Badge variant="outline">
                      {((stats.significantResults / stats.completedTests) * 100).toFixed(1)}%
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Promedio de Participantes</span>
                    <Badge variant="secondary">
                      {Math.round(stats.totalParticipants / stats.totalTests).toLocaleString()}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Duración Promedio</span>
                    <Badge variant="outline">15 días</Badge>
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
