'use client';

import React, { useState, useEffect } from 'react';
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
  Users,
  Clock,
  Calendar,
  BarChart3,
  PieChart,
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
  WifiHigh,
  WifiMedium,
  WifiLow,
  WifiZero,
  BatteryFull,
  BatteryHigh,
  BatteryMedium,
  BatteryLow,
  BatteryEmpty,
  BatteryChargingFull,
  BatteryChargingHigh,
  BatteryChargingMedium,
  BatteryChargingLow,
  BatteryChargingEmpty,
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
  Click,
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
  RotateCcw2,
  RotateCw,
  RotateCw2,
  RefreshCw2,
  RefreshCw3,
  RefreshCw4,
  RefreshCw5,
  RefreshCw6,
  RefreshCw7,
  RefreshCw8,
  RefreshCw9,
  RefreshCw10,
  Brain,
  Target2,
  Users2,
  Clock2,
  Calendar2,
  BarChart32,
  PieChart2,
  Activity2,
  Zap2,
  CheckCircle2,
  XCircle2,
  AlertTriangle2,
  Info2,
  HelpCircle2,
  Settings2,
  Filter2,
  Search2,
  Plus2,
  Minus2,
  Edit2,
  Trash22,
  Copy2,
  ExternalLink2,
  Link2,
  Unlink2,
  Lock2,
  Unlock2,
  Shield2,
  Key2,
  Bell2,
  Mail2,
  Phone2,
  Video2,
  Image2,
  FileText2,
  File2,
  Folder2,
  FolderOpen2,
  Database2,
  Server2,
  Cpu2,
  HardDrive2,
  Wifi2,
  Signal2,
  Battery2,
  BatteryCharging2,
  WifiOff2,
  SignalHigh2,
  SignalMedium2,
  SignalLow2,
  SignalZero2,
  WifiHigh2,
  WifiMedium2,
  WifiLow2,
  WifiZero2,
  BatteryFull2,
  BatteryHigh2,
  BatteryMedium2,
  BatteryLow2,
  BatteryEmpty2,
  BatteryChargingFull2,
  BatteryChargingHigh2,
  BatteryChargingMedium2,
  BatteryChargingLow2,
  BatteryChargingEmpty2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ABTest {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'running' | 'paused' | 'completed' | 'stopped';
  type: 'ui' | 'content' | 'feature' | 'pricing' | 'onboarding';
  goal: string;
  hypothesis: string;
  startDate: Date;
  endDate?: Date;
  trafficSplit: {
    control: number;
    variant: number;
  };
  variants: ABVariant[];
  metrics: ABMetrics;
  significance: number;
  confidence: number;
  winner?: 'control' | 'variant' | null;
}

interface ABVariant {
  id: string;
  name: string;
  description: string;
  type: 'control' | 'variant';
  trafficPercentage: number;
  metrics: {
    users: number;
    sessions: number;
    conversions: number;
    conversionRate: number;
    averageSessionDuration: number;
    bounceRate: number;
    revenue?: number;
    customMetrics: Record<string, number>;
  };
}

interface ABMetrics {
  totalUsers: number;
  totalSessions: number;
  totalConversions: number;
  overallConversionRate: number;
  statisticalSignificance: number;
  confidenceLevel: number;
  pValue: number;
  effectSize: number;
}

interface ABTestResult {
  testId: string;
  variant: string;
  metric: string;
  value: number;
  change: number;
  significance: boolean;
  confidence: number;
  timestamp: Date;
}

export default function ABTestingPage() {
  const [tests, setTests] = useState<ABTest[]>([]);
  const [results, setResults] = useState<ABTestResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'tests' | 'results' | 'insights'>('overview');
  const [selectedTest, setSelectedTest] = useState<string>('');
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  // Datos de ejemplo
  const mockTests: ABTest[] = [
    {
      id: 'test_1',
      name: 'Optimización del Botón de Registro',
      description: 'Prueba diferentes colores y textos para el botón de registro principal',
      status: 'running',
      type: 'ui',
      goal: 'Aumentar tasa de registro',
      hypothesis: 'Un botón verde con texto "Comenzar Gratis" aumentará las conversiones',
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      trafficSplit: { control: 50, variant: 50 },
      variants: [
        {
          id: 'control',
          name: 'Control',
          description: 'Botón azul con texto "Registrarse"',
          type: 'control',
          trafficPercentage: 50,
          metrics: {
            users: 1247,
            sessions: 1892,
            conversions: 89,
            conversionRate: 7.1,
            averageSessionDuration: 245,
            bounceRate: 23.4,
            customMetrics: {}
          }
        },
        {
          id: 'variant_a',
          name: 'Variante A',
          description: 'Botón verde con texto "Comenzar Gratis"',
          type: 'variant',
          trafficPercentage: 50,
          metrics: {
            users: 1234,
            sessions: 1876,
            conversions: 112,
            conversionRate: 9.1,
            averageSessionDuration: 267,
            bounceRate: 21.8,
            customMetrics: {}
          }
        }
      ],
      metrics: {
        totalUsers: 2481,
        totalSessions: 3768,
        totalConversions: 201,
        overallConversionRate: 8.1,
        statisticalSignificance: 0.95,
        confidenceLevel: 0.05,
        pValue: 0.023,
        effectSize: 0.28
      },
      significance: 0.95,
      confidence: 0.05,
      winner: 'variant'
    },
    {
      id: 'test_2',
      name: 'Optimización de Página de Onboarding',
      description: 'Prueba diferentes flujos de onboarding para nuevos usuarios',
      status: 'completed',
      type: 'onboarding',
      goal: 'Reducir abandono en onboarding',
      hypothesis: 'Un onboarding más corto con menos pasos aumentará la retención',
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      trafficSplit: { control: 60, variant: 40 },
      variants: [
        {
          id: 'control',
          name: 'Control',
          description: 'Onboarding de 5 pasos',
          type: 'control',
          trafficPercentage: 60,
          metrics: {
            users: 892,
            sessions: 1245,
            conversions: 156,
            conversionRate: 17.5,
            averageSessionDuration: 320,
            bounceRate: 18.7,
            customMetrics: {}
          }
        },
        {
          id: 'variant_b',
          name: 'Variante B',
          description: 'Onboarding de 3 pasos',
          type: 'variant',
          trafficPercentage: 40,
          metrics: {
            users: 567,
            sessions: 789,
            conversions: 134,
            conversionRate: 23.6,
            averageSessionDuration: 245,
            bounceRate: 15.2,
            customMetrics: {}
          }
        }
      ],
      metrics: {
        totalUsers: 1459,
        totalSessions: 2034,
        totalConversions: 290,
        overallConversionRate: 19.9,
        statisticalSignificance: 0.98,
        confidenceLevel: 0.02,
        pValue: 0.008,
        effectSize: 0.35
      },
      significance: 0.98,
      confidence: 0.02,
      winner: 'variant'
    }
  ];

  const mockResults: ABTestResult[] = [
    {
      testId: 'test_1',
      variant: 'variant_a',
      metric: 'conversion_rate',
      value: 9.1,
      change: 28.2,
      significance: true,
      confidence: 0.95,
      timestamp: new Date()
    },
    {
      testId: 'test_1',
      variant: 'variant_a',
      metric: 'session_duration',
      value: 267,
      change: 9.0,
      significance: true,
      confidence: 0.90,
      timestamp: new Date()
    }
  ];

  useEffect(() => {
    loadABTestingData();
  }, [timeRange]);

  const loadABTestingData = async () => {
    try {
      setIsLoading(true);
      // En producción, esto sería una llamada a la API
      // const response = await fetch(`/api/analytics/ab-testing?range=${timeRange}`);
      // const data = await response.json();
      
      // Simulando carga
      await new Promise(resolve => setTimeout(resolve, 1000));
      setTests(mockTests);
      setResults(mockResults);
    } catch (error) {
      console.error('Error loading A/B testing data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startTest = async (testId: string) => {
    try {
      // En producción, esto sería una llamada a la API
      // await fetch(`/api/analytics/ab-testing/${testId}/start`, { method: 'POST' });
      
      setTests(prev => prev.map(test => 
        test.id === testId 
          ? { ...test, status: 'running' as const }
          : test
      ));
    } catch (error) {
      console.error('Error starting test:', error);
    }
  };

  const stopTest = async (testId: string) => {
    try {
      // En producción, esto sería una llamada a la API
      // await fetch(`/api/analytics/ab-testing/${testId}/stop`, { method: 'POST' });
      
      setTests(prev => prev.map(test => 
        test.id === testId 
          ? { ...test, status: 'completed' as const, endDate: new Date() }
          : test
      ));
    } catch (error) {
      console.error('Error stopping test:', error);
    }
  };

  const getTestStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'text-green-600 bg-green-100';
      case 'completed': return 'text-blue-600 bg-blue-100';
      case 'paused': return 'text-yellow-600 bg-yellow-100';
      case 'stopped': return 'text-red-600 bg-red-100';
      case 'draft': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTestTypeIcon = (type: string) => {
    switch (type) {
      case 'ui': return <Eye className="w-4 h-4" />;
      case 'content': return <FileText className="w-4 h-4" />;
      case 'feature': return <Zap className="w-4 h-4" />;
      case 'pricing': return <Coins className="w-4 h-4" />;
      case 'onboarding': return <Users className="w-4 h-4" />;
      default: return <TestTube className="w-4 h-4" />;
    }
  };

  const calculateLift = (control: number, variant: number) => {
    if (control === 0) return 0;
    return ((variant - control) / control) * 100;
  };

  const isStatisticallySignificant = (pValue: number, confidence: number) => {
    return pValue < (1 - confidence);
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString('es-MX');
  };

  const formatPercentage = (num: number) => {
    return `${num.toFixed(1)}%`;
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
            <div className="p-3 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg">
              <TestTube className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">A/B Testing</h1>
              <p className="text-gray-600">Experimentos controlados para optimizar la experiencia del usuario</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button 
              onClick={() => loadABTestingData()}
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
              aria-label="Crear nuevo experimento"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Experimento</span>
            </Button>
          </div>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TestTube className="w-5 h-5 text-orange-600" />
                <span className="text-sm font-medium">Experimentos Activos</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {tests.filter(t => t.status === 'running').length}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium">Usuarios en Tests</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {formatNumber(tests.reduce((sum, test) => sum + test.metrics.totalUsers, 0))}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium">Tests Ganadores</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {tests.filter(t => t.winner && t.status === 'completed').length}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium">Mejora Promedio</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {formatPercentage(tests
                  .filter(t => t.winner && t.status === 'completed')
                  .reduce((sum, test) => {
                    const control = test.variants.find(v => v.type === 'control');
                    const variant = test.variants.find(v => v.type === 'variant');
                    if (control && variant) {
                      return sum + calculateLift(control.metrics.conversionRate, variant.metrics.conversionRate);
                    }
                    return sum;
                  }, 0) / Math.max(tests.filter(t => t.winner && t.status === 'completed').length, 1)
                )}
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
                <option value="all">Todo el tiempo</option>
              </select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Estado</label>
              <select
                value={selectedTest}
                onChange={(e) => setSelectedTest(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                tabIndex={0}
                aria-label="Filtrar por estado"
              >
                <option value="">Todos los estados</option>
                <option value="running">En ejecución</option>
                <option value="completed">Completados</option>
                <option value="paused">Pausados</option>
                <option value="draft">Borradores</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs de navegación */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="mb-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" tabIndex={0} aria-label="Vista general">Vista General</TabsTrigger>
          <TabsTrigger value="tests" tabIndex={0} aria-label="Experimentos">Experimentos</TabsTrigger>
          <TabsTrigger value="results" tabIndex={0} aria-label="Resultados">Resultados</TabsTrigger>
          <TabsTrigger value="insights" tabIndex={0} aria-label="Insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Resumen de experimentos */}
            <Card>
              <CardHeader>
                <CardTitle>Resumen de Experimentos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium">En ejecución</span>
                    </div>
                    <span className="font-bold">{tests.filter(t => t.status === 'running').length}</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm font-medium">Completados</span>
                    </div>
                    <span className="font-bold">{tests.filter(t => t.status === 'completed').length}</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm font-medium">Pausados</span>
                    </div>
                    <span className="font-bold">{tests.filter(t => t.status === 'paused').length}</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                      <span className="text-sm font-medium">Borradores</span>
                    </div>
                    <span className="font-bold">{tests.filter(t => t.status === 'draft').length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Métricas de rendimiento */}
            <Card>
              <CardHeader>
                <CardTitle>Métricas de Rendimiento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Target className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium">Tasa de conversión promedio</span>
                    </div>
                    <span className="font-bold">
                      {formatPercentage(tests.reduce((sum, test) => sum + test.metrics.overallConversionRate, 0) / tests.length)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium">Mejora promedio</span>
                    </div>
                    <span className="font-bold text-green-600">
                      {formatPercentage(tests
                        .filter(t => t.winner && t.status === 'completed')
                        .reduce((sum, test) => {
                          const control = test.variants.find(v => v.type === 'control');
                          const variant = test.variants.find(v => v.type === 'variant');
                          if (control && variant) {
                            return sum + calculateLift(control.metrics.conversionRate, variant.metrics.conversionRate);
                          }
                          return sum;
                        }, 0) / Math.max(tests.filter(t => t.winner && t.status === 'completed').length, 1)
                      )}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-medium">Significancia estadística</span>
                    </div>
                    <span className="font-bold">
                      {formatPercentage(tests.filter(t => t.significance > 0.95).length / tests.length * 100)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tests" className="space-y-6">
          <div className="space-y-6">
            {tests.map((test) => (
              <Card key={test.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getTestTypeIcon(test.type)}
                      <span>{test.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={cn("text-xs", getTestStatusColor(test.status))}>
                        {test.status === 'running' ? 'En ejecución' :
                         test.status === 'completed' ? 'Completado' :
                         test.status === 'paused' ? 'Pausado' :
                         test.status === 'stopped' ? 'Detenido' : 'Borrador'}
                      </Badge>
                      {test.winner && (
                        <Badge className="text-xs bg-green-100 text-green-800">
                          Ganador: {test.winner === 'control' ? 'Control' : 'Variante'}
                        </Badge>
                      )}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">{test.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <span className="text-sm text-gray-600">Hipótesis:</span>
                        <p className="text-sm font-medium">{test.hypothesis}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Objetivo:</span>
                        <p className="text-sm font-medium">{test.goal}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Distribución:</span>
                        <p className="text-sm font-medium">
                          {test.trafficSplit.control}% / {test.trafficSplit.variant}%
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {test.variants.map((variant) => (
                        <div key={variant.id} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium">{variant.name}</h4>
                            <Badge variant="outline" className="text-xs">
                              {variant.trafficPercentage}% tráfico
                            </Badge>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Usuarios:</span>
                              <span className="font-medium">{formatNumber(variant.metrics.users)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Tasa de conversión:</span>
                              <span className="font-medium">{formatPercentage(variant.metrics.conversionRate)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Duración sesión:</span>
                              <span className="font-medium">{variant.metrics.averageSessionDuration}s</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Tasa de rebote:</span>
                              <span className="font-medium">{formatPercentage(variant.metrics.bounceRate)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {test.status === 'running' && (
                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="text-sm text-gray-600">
                          <span>Significancia estadística: </span>
                          <span className={cn(
                            "font-medium",
                            test.significance > 0.95 ? "text-green-600" : "text-yellow-600"
                          )}>
                            {formatPercentage(test.significance * 100)}
                          </span>
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => stopTest(test.id)}
                            tabIndex={0}
                            aria-label="Detener experimento"
                          >
                            <Pause className="w-3 h-3 mr-1" />
                            Detener
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            tabIndex={0}
                            aria-label="Ver detalles del experimento"
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            Ver Detalles
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Resultados Detallados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {results.map((result) => (
                  <div key={`${result.testId}-${result.variant}-${result.metric}`} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <TestTube className="w-4 h-4 text-orange-600" />
                        <span className="font-medium">
                          {tests.find(t => t.id === result.testId)?.name}
                        </span>
                      </div>
                      <Badge className={cn(
                        "text-xs",
                        result.significance ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                      )}>
                        {result.significance ? 'Significativo' : 'No significativo'}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <span className="text-sm text-gray-600">Variante:</span>
                        <div className="font-medium">{result.variant}</div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Métrica:</span>
                        <div className="font-medium">{result.metric}</div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Valor:</span>
                        <div className="font-medium">{result.value}</div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Cambio:</span>
                        <div className={cn(
                          "font-medium",
                          result.change > 0 ? "text-green-600" : "text-red-600"
                        )}>
                          {result.change > 0 ? '+' : ''}{formatPercentage(result.change)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Lightbulb className="w-5 h-5 text-yellow-600" />
                  <span>Insights Principales</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="font-medium text-green-800">Experimento exitoso</span>
                    </div>
                    <p className="text-sm text-green-700">
                      El botón verde aumentó las conversiones en un 28.2% con significancia estadística del 95%
                    </p>
                  </div>
                  
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Info className="w-4 h-4 text-blue-600" />
                      <span className="font-medium text-blue-800">Patrón identificado</span>
                    </div>
                    <p className="text-sm text-blue-700">
                      Los experimentos de UI tienen mayor impacto en la conversión que los de contenido
                    </p>
                  </div>
                  
                  <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-orange-600" />
                      <span className="font-medium text-orange-800">Oportunidad de mejora</span>
                    </div>
                    <p className="text-sm text-orange-700">
                      Solo el 60% de los experimentos alcanzan significancia estadística
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <span>Recomendaciones</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <span className="font-medium">Implementar botón verde</span>
                      <p className="text-sm text-gray-600">Aplicar el diseño ganador del experimento de registro</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <span className="font-medium">Optimizar onboarding</span>
                      <p className="text-sm text-gray-600">Reducir pasos en el proceso de onboarding</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                    <div>
                      <span className="font-medium">Aumentar tamaño de muestra</span>
                      <p className="text-sm text-gray-600">Ejecutar experimentos por más tiempo para mayor confianza</p>
                    </div>
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
