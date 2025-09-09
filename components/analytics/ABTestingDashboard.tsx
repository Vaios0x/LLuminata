'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TestTube, 
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
  Filter,
  Play,
  Pause,
  StopCircle,
  Timer,
  Percent,
  ArrowUpRight,
  ArrowDownRight,
  Minus as MinusIcon
} from 'lucide-react';
import { format, parseISO, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';

interface ABTest {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'running' | 'paused' | 'completed' | 'stopped';
  startDate: string;
  endDate?: string;
  variants: ABVariant[];
  metrics: ABMetric[];
  trafficSplit: number; // Porcentaje de tráfico para la variante B
  confidenceLevel: number;
  minimumSampleSize: number;
  currentSampleSize: number;
  winner?: string; // ID de la variante ganadora
  significance: number; // p-value
  effectSize: number; // Tamaño del efecto
  createdAt: string;
  updatedAt: string;
}

interface ABVariant {
  id: string;
  name: string;
  description: string;
  type: 'control' | 'treatment';
  sampleSize: number;
  conversions: number;
  conversionRate: number;
  revenue?: number;
  averageOrderValue?: number;
  bounceRate?: number;
  timeOnPage?: number;
  customMetrics: Record<string, number>;
}

interface ABMetric {
  id: string;
  name: string;
  description: string;
  type: 'conversion' | 'revenue' | 'engagement' | 'custom';
  primary: boolean;
  unit?: string;
  target?: number;
}

interface ABTestingDashboardProps {
  userId?: string;
  className?: string;
  refreshInterval?: number;
  onTestUpdate?: (tests: ABTest[]) => void;
  onTestAction?: (testId: string, action: 'start' | 'pause' | 'stop' | 'complete') => void;
  onExport?: (format: 'csv' | 'json' | 'pdf') => void;
}

export const ABTestingDashboard: React.FC<ABTestingDashboardProps> = ({
  userId,
  className = '',
  refreshInterval = 30000,
  onTestUpdate,
  onTestAction,
  onExport
}) => {
  const [tests, setTests] = useState<ABTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTest, setSelectedTest] = useState<string | null>(null);
  const [showSignificance, setShowSignificance] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const loadABTests = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        userId: userId || ''
      });

      const response = await fetch(`/api/analytics/ab-testing?${params}`);
      
      if (!response.ok) {
        throw new Error('Error cargando experimentos A/B');
      }

      const data = await response.json();
      setTests(data.tests || []);
      
      if (onTestUpdate) {
        onTestUpdate(data.tests || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [userId, onTestUpdate]);

  const handleTestAction = async (testId: string, action: 'start' | 'pause' | 'stop' | 'complete') => {
    try {
      const response = await fetch('/api/analytics/ab-testing/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testId, action, userId })
      });

      if (response.ok) {
        await loadABTests();
        
        if (onTestAction) {
          onTestAction(testId, action);
        }
      } else {
        throw new Error('Error ejecutando acción');
      }
    } catch (err) {
      console.error('Error executing test action:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'stopped': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <Play className="w-4 h-4" />;
      case 'paused': return <Pause className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'stopped': return <StopCircle className="w-4 h-4" />;
      case 'draft': return <Edit className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const calculateStatisticalSignificance = (control: ABVariant, treatment: ABVariant): number => {
    // Implementación simplificada del cálculo de significancia estadística
    const n1 = control.sampleSize;
    const n2 = treatment.sampleSize;
    const p1 = control.conversionRate;
    const p2 = treatment.conversionRate;
    
    if (n1 === 0 || n2 === 0) return 1;
    
    const pooledP = (control.conversions + treatment.conversions) / (n1 + n2);
    const standardError = Math.sqrt(pooledP * (1 - pooledP) * (1/n1 + 1/n2));
    const zScore = Math.abs(p2 - p1) / standardError;
    
    // Aproximación del p-value usando la distribución normal
    return Math.exp(-0.5 * zScore * zScore) / Math.sqrt(2 * Math.PI);
  };

  const getEffectSize = (control: ABVariant, treatment: ABVariant): number => {
    if (control.conversionRate === 0) return 0;
    return (treatment.conversionRate - control.conversionRate) / control.conversionRate;
  };

  const isStatisticallySignificant = (significance: number): boolean => {
    return significance < 0.05; // p < 0.05
  };

  const getWinner = (test: ABTest): ABVariant | null => {
    if (!test.winner) return null;
    return test.variants.find(v => v.id === test.winner) || null;
  };

  const getTestProgress = (test: ABTest): number => {
    if (test.status === 'completed') return 100;
    if (test.status === 'draft') return 0;
    
    const totalDays = differenceInDays(
      test.endDate ? parseISO(test.endDate) : new Date(),
      parseISO(test.startDate)
    );
    const elapsedDays = differenceInDays(new Date(), parseISO(test.startDate));
    
    return Math.min(Math.max((elapsedDays / totalDays) * 100, 0), 100);
  };

  const runningTests = useMemo(() => tests.filter(t => t.status === 'running'), [tests]);
  const completedTests = useMemo(() => tests.filter(t => t.status === 'completed'), [tests]);
  const draftTests = useMemo(() => tests.filter(t => t.status === 'draft'), [tests]);

  useEffect(() => {
    loadABTests();
    
    if (autoRefresh) {
      const interval = setInterval(loadABTests, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [loadABTests, autoRefresh, refreshInterval]);

  if (loading) {
    return (
      <Card className={`${className} ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
        <CardContent className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" 
               role="status" 
               aria-label="Cargando experimentos A/B">
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
            <Button onClick={loadABTests} className="mt-4">
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
            <TestTube className="w-5 h-5" />
            <CardTitle>Dashboard de Experimentos A/B</CardTitle>
            <Badge variant="outline" className="ml-2">
              {tests.length} experimentos
            </Badge>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSignificance(!showSignificance)}
              aria-label={showSignificance ? 'Ocultar significancia' : 'Mostrar significancia'}
            >
              {showSignificance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              Significancia
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
                <Play className="w-4 h-4 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Activos</p>
                  <p className="text-lg font-semibold">{runningTests.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Completados</p>
                  <p className="text-lg font-semibold">{completedTests.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Target className="w-4 h-4 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Significativos</p>
                  <p className="text-lg font-semibold">
                    {completedTests.filter(t => t.significance < 0.05).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-orange-600" />
                <div>
                  <p className="text-sm text-gray-600">Participantes</p>
                  <p className="text-lg font-semibold">
                    {tests.reduce((sum, test) => sum + test.currentSampleSize, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs principales */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="running">Activos</TabsTrigger>
            <TabsTrigger value="completed">Completados</TabsTrigger>
            <TabsTrigger value="drafts">Borradores</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Experimentos activos */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Play className="w-5 h-5 text-green-600" />
                    <span>Experimentos Activos</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {runningTests.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No hay experimentos activos</p>
                  ) : (
                    <div className="space-y-3">
                      {runningTests.slice(0, 3).map((test) => (
                        <div key={test.id} className="p-3 bg-green-50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{test.name}</h4>
                            <Badge className="bg-green-100 text-green-800">
                              {Math.round(getTestProgress(test))}%
                            </Badge>
                          </div>
                          <Progress value={getTestProgress(test)} className="h-2 mb-2" />
                          <p className="text-sm text-gray-600">{test.description}</p>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                            <span>{test.currentSampleSize} participantes</span>
                            <span>{test.trafficSplit}% tráfico B</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Resultados recientes */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                    <span>Resultados Recientes</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {completedTests.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No hay resultados recientes</p>
                  ) : (
                    <div className="space-y-3">
                      {completedTests.slice(0, 3).map((test) => {
                        const winner = getWinner(test);
                        const control = test.variants.find(v => v.type === 'control');
                        const treatment = test.variants.find(v => v.type === 'treatment');
                        
                        return (
                          <div key={test.id} className="p-3 bg-blue-50 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium">{test.name}</h4>
                              {winner && (
                                <Badge className="bg-blue-100 text-blue-800">
                                  Ganador: {winner.name}
                                </Badge>
                              )}
                            </div>
                            {control && treatment && (
                              <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                  <span>Control: {Math.round(control.conversionRate * 100)}%</span>
                                  <span>Tratamiento: {Math.round(treatment.conversionRate * 100)}%</span>
                                </div>
                                <div className="flex justify-between text-xs text-gray-500">
                                  <span>Mejora: {Math.round(getEffectSize(control, treatment) * 100)}%</span>
                                  <span>p = {test.significance.toFixed(4)}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="running" className="space-y-4">
            {runningTests.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Play className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600">No hay experimentos activos</h3>
                  <p className="text-gray-500">Crea un nuevo experimento para comenzar</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {runningTests.map((test) => (
                  <Card key={test.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(test.status)}
                          <CardTitle>{test.name}</CardTitle>
                          <Badge className={getStatusColor(test.status)}>
                            {test.status.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleTestAction(test.id, 'pause')}
                          >
                            <Pause className="w-4 h-4 mr-1" />
                            Pausar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleTestAction(test.id, 'stop')}
                          >
                            <StopCircle className="w-4 h-4 mr-1" />
                            Detener
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-gray-600">{test.description}</p>
                      
                      {/* Progreso del experimento */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600">Progreso del experimento</span>
                          <span className="text-sm font-medium">{Math.round(getTestProgress(test))}%</span>
                        </div>
                        <Progress value={getTestProgress(test)} className="h-2" />
                      </div>

                      {/* Variantes */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {test.variants.map((variant) => (
                          <div key={variant.id} className="p-3 border rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium">{variant.name}</h4>
                              <Badge variant="outline" className="text-xs">
                                {variant.type === 'control' ? 'Control' : 'Tratamiento'}
                              </Badge>
                            </div>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span>Participantes:</span>
                                <span>{variant.sampleSize}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Conversiones:</span>
                                <span>{variant.conversions}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Tasa de conversión:</span>
                                <span>{Math.round(variant.conversionRate * 100)}%</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Configuración */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">División de tráfico:</span>
                          <p className="font-medium">{test.trafficSplit}%</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Nivel de confianza:</span>
                          <p className="font-medium">{Math.round(test.confidenceLevel * 100)}%</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Muestra mínima:</span>
                          <p className="font-medium">{test.minimumSampleSize}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Muestra actual:</span>
                          <p className="font-medium">{test.currentSampleSize}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {completedTests.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <CheckCircle className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600">No hay experimentos completados</h3>
                  <p className="text-gray-500">Los experimentos completados aparecerán aquí</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {completedTests.map((test) => {
                  const winner = getWinner(test);
                  const control = test.variants.find(v => v.type === 'control');
                  const treatment = test.variants.find(v => v.type === 'treatment');
                  const effectSize = control && treatment ? getEffectSize(control, treatment) : 0;
                  const isSignificant = isStatisticallySignificant(test.significance);
                  
                  return (
                    <Card key={test.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(test.status)}
                            <CardTitle>{test.name}</CardTitle>
                            <Badge className={getStatusColor(test.status)}>
                              {test.status.toUpperCase()}
                            </Badge>
                          </div>
                          {winner && (
                            <Badge className="bg-green-100 text-green-800">
                              Ganador: {winner.name}
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-gray-600">{test.description}</p>
                        
                        {/* Resultados principales */}
                        {control && treatment && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                              <h4 className="font-medium">Resultados de Conversión</h4>
                              <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                  <div>
                                    <p className="font-medium">{control.name}</p>
                                    <p className="text-sm text-gray-600">Control</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-lg font-bold">{Math.round(control.conversionRate * 100)}%</p>
                                    <p className="text-sm text-gray-600">{control.conversions}/{control.sampleSize}</p>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                  <div>
                                    <p className="font-medium">{treatment.name}</p>
                                    <p className="text-sm text-gray-600">Tratamiento</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-lg font-bold">{Math.round(treatment.conversionRate * 100)}%</p>
                                    <p className="text-sm text-gray-600">{treatment.conversions}/{treatment.sampleSize}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="space-y-4">
                              <h4 className="font-medium">Análisis Estadístico</h4>
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <span className="text-gray-600">Mejora:</span>
                                  <div className="flex items-center space-x-1">
                                    {effectSize > 0 ? (
                                      <ArrowUpRight className="w-4 h-4 text-green-600" />
                                    ) : effectSize < 0 ? (
                                      <ArrowDownRight className="w-4 h-4 text-red-600" />
                                    ) : (
                                      <MinusIcon className="w-4 h-4 text-gray-600" />
                                    )}
                                    <span className={`font-medium ${
                                      effectSize > 0 ? 'text-green-600' : 
                                      effectSize < 0 ? 'text-red-600' : 'text-gray-600'
                                    }`}>
                                      {Math.abs(Math.round(effectSize * 100))}%
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-gray-600">Significancia:</span>
                                  <Badge className={
                                    isSignificant ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                  }>
                                    {isSignificant ? 'Significativo' : 'No significativo'}
                                  </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-gray-600">p-value:</span>
                                  <span className="font-medium">{test.significance.toFixed(4)}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-gray-600">Tamaño del efecto:</span>
                                  <span className="font-medium">{test.effectSize.toFixed(3)}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* Información adicional */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div>
                            <span>Inicio:</span>
                            <p>{format(parseISO(test.startDate), 'dd/MM/yyyy')}</p>
                          </div>
                          <div>
                            <span>Fin:</span>
                            <p>{test.endDate ? format(parseISO(test.endDate), 'dd/MM/yyyy') : 'N/A'}</p>
                          </div>
                          <div>
                            <span>Duración:</span>
                            <p>{differenceInDays(
                              test.endDate ? parseISO(test.endDate) : new Date(),
                              parseISO(test.startDate)
                            )} días</p>
                          </div>
                          <div>
                            <span>Participantes totales:</span>
                            <p>{test.currentSampleSize}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="drafts" className="space-y-4">
            {draftTests.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Edit className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600">No hay borradores</h3>
                  <p className="text-gray-500">Crea un nuevo experimento para comenzar</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {draftTests.map((test) => (
                  <Card key={test.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(test.status)}
                          <CardTitle>{test.name}</CardTitle>
                          <Badge className={getStatusColor(test.status)}>
                            {test.status.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleTestAction(test.id, 'start')}
                          >
                            <Play className="w-4 h-4 mr-1" />
                            Iniciar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Editar
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-4">{test.description}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">División de tráfico:</span>
                          <p className="font-medium">{test.trafficSplit}%</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Nivel de confianza:</span>
                          <p className="font-medium">{Math.round(test.confidenceLevel * 100)}%</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Muestra mínima:</span>
                          <p className="font-medium">{test.minimumSampleSize}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Variantes:</span>
                          <p className="font-medium">{test.variants.length}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ABTestingDashboard;
