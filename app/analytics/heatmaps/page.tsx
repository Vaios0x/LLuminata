'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  MousePointer,
  Eye,
  Clock,
  Scroll,
  Move,
  Target,
  TrendingUp,
  TrendingDown,
  Download,
  RefreshCw,
  Settings,
  Filter,
  Calendar,
  Users,
  Activity,
  BarChart3,
  PieChart,
  Maximize2,
  Minimize2,
  RotateCcw,
  Save,
  Share2,
  Info,
  HelpCircle,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Play,
  Pause,
  SkipForward,
  Rewind,
  Volume2,
  VolumeX,
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
  MapPin,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  Brain,
  Lightbulb,
  GraduationCap,
  Trophy,
  Heart,
  MessageSquare,
  Bookmark
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeatmapData {
  id: string;
  page: string;
  element: string;
  x: number;
  y: number;
  intensity: number;
  clicks: number;
  hovers: number;
  scrolls: number;
  timestamp: Date;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  userType: 'new' | 'returning';
  sessionDuration: number;
}

interface HeatmapConfig {
  type: 'click' | 'hover' | 'scroll' | 'move';
  timeRange: '1h' | '24h' | '7d' | '30d';
  deviceFilter: 'all' | 'desktop' | 'mobile' | 'tablet';
  userFilter: 'all' | 'new' | 'returning';
  intensityThreshold: number;
  showLabels: boolean;
  colorScheme: 'red' | 'blue' | 'green' | 'purple';
}

interface PageHeatmap {
  page: string;
  totalInteractions: number;
  averageIntensity: number;
  topElements: Array<{
    element: string;
    interactions: number;
    intensity: number;
  }>;
  deviceBreakdown: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
  userBreakdown: {
    new: number;
    returning: number;
  };
}

export default function HeatmapsPage() {
  const [heatmapData, setHeatmapData] = useState<HeatmapData[]>([]);
  const [pageHeatmaps, setPageHeatmaps] = useState<PageHeatmap[]>([]);
  const [config, setConfig] = useState<HeatmapConfig>({
    type: 'click',
    timeRange: '7d',
    deviceFilter: 'all',
    userFilter: 'all',
    intensityThreshold: 0.5,
    showLabels: true,
    colorScheme: 'red'
  });
  const [selectedPage, setSelectedPage] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'pages' | 'elements' | 'insights'>('overview');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Datos de ejemplo
  const mockHeatmapData: HeatmapData[] = [
    {
      id: '1',
      page: '/dashboard',
      element: 'nav-menu',
      x: 150,
      y: 80,
      intensity: 0.9,
      clicks: 45,
      hovers: 120,
      scrolls: 0,
      timestamp: new Date(),
      deviceType: 'desktop',
      userType: 'returning',
      sessionDuration: 180
    },
    {
      id: '2',
      page: '/dashboard',
      element: 'progress-card',
      x: 300,
      y: 200,
      intensity: 0.7,
      clicks: 32,
      hovers: 85,
      scrolls: 0,
      timestamp: new Date(),
      deviceType: 'desktop',
      userType: 'new',
      sessionDuration: 120
    },
    {
      id: '3',
      page: '/lessons',
      element: 'lesson-card',
      x: 200,
      y: 150,
      intensity: 0.8,
      clicks: 67,
      hovers: 156,
      scrolls: 0,
      timestamp: new Date(),
      deviceType: 'mobile',
      userType: 'returning',
      sessionDuration: 240
    }
  ];

  const mockPageHeatmaps: PageHeatmap[] = [
    {
      page: '/dashboard',
      totalInteractions: 1247,
      averageIntensity: 0.75,
      topElements: [
        { element: 'nav-menu', interactions: 234, intensity: 0.9 },
        { element: 'progress-card', interactions: 189, intensity: 0.7 },
        { element: 'quick-actions', interactions: 156, intensity: 0.6 }
      ],
      deviceBreakdown: { desktop: 65, mobile: 30, tablet: 5 },
      userBreakdown: { new: 25, returning: 75 }
    },
    {
      page: '/lessons',
      totalInteractions: 892,
      averageIntensity: 0.68,
      topElements: [
        { element: 'lesson-card', interactions: 345, intensity: 0.8 },
        { element: 'search-bar', interactions: 123, intensity: 0.5 },
        { element: 'filter-buttons', interactions: 89, intensity: 0.4 }
      ],
      deviceBreakdown: { desktop: 45, mobile: 50, tablet: 5 },
      userBreakdown: { new: 35, returning: 65 }
    }
  ];

  useEffect(() => {
    loadHeatmapData();
  }, [config]);

  const loadHeatmapData = async () => {
    try {
      setIsLoading(true);
      // En producción, esto sería una llamada a la API
      // const response = await fetch(`/api/analytics/heatmaps?${new URLSearchParams(config)}`);
      // const data = await response.json();
      
      // Simulando carga
      await new Promise(resolve => setTimeout(resolve, 1000));
      setHeatmapData(mockHeatmapData);
      setPageHeatmaps(mockPageHeatmaps);
    } catch (error) {
      console.error('Error loading heatmap data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startRecording = () => {
    setIsRecording(true);
    // Implementar grabación de eventos de usuario
  };

  const stopRecording = () => {
    setIsRecording(false);
    // Detener grabación
  };

  const exportHeatmap = (format: 'png' | 'svg' | 'json') => {
    // Implementar exportación
    console.log(`Exporting heatmap as ${format}`);
  };

  const renderHeatmap = (pageData: HeatmapData[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Limpiar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Renderizar puntos de calor
    pageData.forEach(point => {
      const gradient = ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, 50);
      
      switch (config.colorScheme) {
        case 'red':
          gradient.addColorStop(0, `rgba(255, 0, 0, ${point.intensity})`);
          gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
          break;
        case 'blue':
          gradient.addColorStop(0, `rgba(0, 0, 255, ${point.intensity})`);
          gradient.addColorStop(1, 'rgba(0, 0, 255, 0)');
          break;
        case 'green':
          gradient.addColorStop(0, `rgba(0, 255, 0, ${point.intensity})`);
          gradient.addColorStop(1, 'rgba(0, 255, 0, 0)');
          break;
        case 'purple':
          gradient.addColorStop(0, `rgba(128, 0, 128, ${point.intensity})`);
          gradient.addColorStop(1, 'rgba(128, 0, 128, 0)');
          break;
      }

      ctx.fillStyle = gradient;
      ctx.fillRect(point.x - 25, point.y - 25, 50, 50);
    });
  };

  const getIntensityColor = (intensity: number) => {
    const alpha = Math.min(intensity, 1);
    switch (config.colorScheme) {
      case 'red': return `rgba(255, 0, 0, ${alpha})`;
      case 'blue': return `rgba(0, 0, 255, ${alpha})`;
      case 'green': return `rgba(0, 255, 0, ${alpha})`;
      case 'purple': return `rgba(128, 0, 128, ${alpha})`;
      default: return `rgba(255, 0, 0, ${alpha})`;
    }
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString('es-MX');
  };

  const formatPercentage = (num: number) => {
    return `${(num * 100).toFixed(1)}%`;
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
            <div className="p-3 bg-gradient-to-r from-red-500 to-orange-600 rounded-lg">
              <Activity className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mapas de Calor</h1>
              <p className="text-gray-600">Analiza el comportamiento de los usuarios con mapas de calor interactivos</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button 
              onClick={isRecording ? stopRecording : startRecording}
              variant={isRecording ? "destructive" : "default"}
              className="flex items-center space-x-2"
              tabIndex={0}
              aria-label={isRecording ? "Detener grabación" : "Iniciar grabación"}
            >
              {isRecording ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isRecording ? 'Detener' : 'Grabar'}</span>
            </Button>
            <Button 
              onClick={() => loadHeatmapData()}
              variant="outline"
              className="flex items-center space-x-2"
              tabIndex={0}
              aria-label="Actualizar datos"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Actualizar</span>
            </Button>
          </div>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <MousePointer className="w-5 h-5 text-red-600" />
                <span className="text-sm font-medium">Total Interacciones</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {formatNumber(heatmapData.reduce((sum, item) => sum + item.clicks + item.hovers, 0))}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium">Páginas Analizadas</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {pageHeatmaps.length}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium">Intensidad Promedio</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {formatPercentage(pageHeatmaps.reduce((sum, page) => sum + page.averageIntensity, 0) / pageHeatmaps.length)}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium">Usuarios Únicos</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {formatNumber(heatmapData.filter((item, index, self) => 
                  self.findIndex(t => t.id === item.id) === index
                ).length)}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Configuración */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="w-5 h-5" />
            <span>Configuración del Mapa de Calor</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Tipo de Interacción</label>
              <select
                value={config.type}
                onChange={(e) => setConfig(prev => ({ ...prev, type: e.target.value as any }))}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                tabIndex={0}
                aria-label="Tipo de interacción"
              >
                <option value="click">Clicks</option>
                <option value="hover">Hovers</option>
                <option value="scroll">Scrolls</option>
                <option value="move">Movimientos</option>
              </select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Rango de Tiempo</label>
              <select
                value={config.timeRange}
                onChange={(e) => setConfig(prev => ({ ...prev, timeRange: e.target.value as any }))}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                tabIndex={0}
                aria-label="Rango de tiempo"
              >
                <option value="1h">Última hora</option>
                <option value="24h">Últimas 24 horas</option>
                <option value="7d">Últimos 7 días</option>
                <option value="30d">Últimos 30 días</option>
              </select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Dispositivo</label>
              <select
                value={config.deviceFilter}
                onChange={(e) => setConfig(prev => ({ ...prev, deviceFilter: e.target.value as any }))}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                tabIndex={0}
                aria-label="Filtro de dispositivo"
              >
                <option value="all">Todos</option>
                <option value="desktop">Desktop</option>
                <option value="mobile">Mobile</option>
                <option value="tablet">Tablet</option>
              </select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Esquema de Color</label>
              <select
                value={config.colorScheme}
                onChange={(e) => setConfig(prev => ({ ...prev, colorScheme: e.target.value as any }))}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                tabIndex={0}
                aria-label="Esquema de color"
              >
                <option value="red">Rojo</option>
                <option value="blue">Azul</option>
                <option value="green">Verde</option>
                <option value="purple">Púrpura</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs de navegación */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="mb-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" tabIndex={0} aria-label="Vista general">Vista General</TabsTrigger>
          <TabsTrigger value="pages" tabIndex={0} aria-label="Páginas">Páginas</TabsTrigger>
          <TabsTrigger value="elements" tabIndex={0} aria-label="Elementos">Elementos</TabsTrigger>
          <TabsTrigger value="insights" tabIndex={0} aria-label="Insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Mapa de calor principal */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Mapa de Calor - Dashboard</span>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" onClick={() => exportHeatmap('png')} tabIndex={0} aria-label="Exportar como PNG">
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => exportHeatmap('svg')} tabIndex={0} aria-label="Exportar como SVG">
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative bg-gray-100 rounded-lg overflow-hidden">
                  <canvas
                    ref={canvasRef}
                    width={600}
                    height={400}
                    className="w-full h-auto"
                    style={{ background: 'url(/mock-page-screenshot.png) no-repeat center center', backgroundSize: 'contain' }}
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-2">
                    <div className="text-xs font-medium mb-1">Leyenda</div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 rounded-full bg-red-500"></div>
                      <span className="text-xs">Alta intensidad</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 rounded-full bg-red-300"></div>
                      <span className="text-xs">Media intensidad</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 rounded-full bg-red-100"></div>
                      <span className="text-xs">Baja intensidad</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Estadísticas de interacciones */}
            <Card>
              <CardHeader>
                <CardTitle>Estadísticas de Interacciones</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <MousePointer className="w-4 h-4 text-red-600" />
                      <span className="text-sm font-medium">Clicks</span>
                    </div>
                    <span className="text-lg font-bold">{formatNumber(heatmapData.reduce((sum, item) => sum + item.clicks, 0))}</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Eye className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium">Hovers</span>
                    </div>
                    <span className="text-lg font-bold">{formatNumber(heatmapData.reduce((sum, item) => sum + item.hovers, 0))}</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Scroll className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium">Scrolls</span>
                    </div>
                    <span className="text-lg font-bold">{formatNumber(heatmapData.reduce((sum, item) => sum + item.scrolls, 0))}</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Move className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-medium">Movimientos</span>
                    </div>
                    <span className="text-lg font-bold">{formatNumber(heatmapData.length)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="pages" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pageHeatmaps.map((page) => (
              <Card key={page.page} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="text-sm">{page.page}</span>
                    <Badge variant="outline">{formatNumber(page.totalInteractions)}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Intensidad promedio:</span>
                      <span className="font-medium">{formatPercentage(page.averageIntensity)}</span>
                    </div>
                    
                    <div>
                      <span className="text-sm text-gray-600 block mb-2">Elementos más interactivos:</span>
                      {page.topElements.slice(0, 3).map((element, index) => (
                        <div key={index} className="flex items-center justify-between text-xs">
                          <span className="truncate">{element.element}</span>
                          <span className="font-medium">{element.interactions}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="pt-2 border-t">
                      <span className="text-sm text-gray-600 block mb-2">Dispositivos:</span>
                      <div className="flex space-x-2 text-xs">
                        <Badge variant="outline" className="text-xs">
                          <Monitor className="w-3 h-3 mr-1" />
                          {page.deviceBreakdown.desktop}%
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          <Smartphone className="w-3 h-3 mr-1" />
                          {page.deviceBreakdown.mobile}%
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          <Tablet className="w-3 h-3 mr-1" />
                          {page.deviceBreakdown.tablet}%
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="elements" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Elementos Más Interactivos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {heatmapData
                  .reduce((acc, item) => {
                    const existing = acc.find(e => e.element === item.element);
                    if (existing) {
                      existing.interactions += item.clicks + item.hovers;
                      existing.intensity = Math.max(existing.intensity, item.intensity);
                    } else {
                      acc.push({
                        element: item.element,
                        interactions: item.clicks + item.hovers,
                        intensity: item.intensity,
                        page: item.page
                      });
                    }
                    return acc;
                  }, [] as Array<{element: string, interactions: number, intensity: number, page: string}>)
                  .sort((a, b) => b.interactions - a.interactions)
                  .slice(0, 10)
                  .map((element, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-red-400 to-orange-500 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium">{element.element}</div>
                          <div className="text-sm text-gray-600">{element.page}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{formatNumber(element.interactions)}</div>
                        <div className="text-sm text-gray-600">{formatPercentage(element.intensity)}</div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      <span className="font-medium text-green-800">Área de alta interacción</span>
                    </div>
                    <p className="text-sm text-green-700">
                      El menú de navegación tiene la mayor concentración de clicks (234 interacciones)
                    </p>
                  </div>
                  
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Info className="w-4 h-4 text-blue-600" />
                      <span className="font-medium text-blue-800">Oportunidad de mejora</span>
                    </div>
                    <p className="text-sm text-blue-700">
                      Los elementos de la parte inferior de la página tienen baja interacción
                    </p>
                  </div>
                  
                  <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-orange-600" />
                      <span className="font-medium text-orange-800">Posible problema</span>
                    </div>
                    <p className="text-sm text-orange-700">
                      Alta tasa de abandono en la página de lecciones en dispositivos móviles
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
                      <span className="font-medium">Optimizar navegación móvil</span>
                      <p className="text-sm text-gray-600">Mejorar la accesibilidad del menú en dispositivos móviles</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <span className="font-medium">Rediseñar elementos de baja interacción</span>
                      <p className="text-sm text-gray-600">Reposicionar o rediseñar elementos con poca actividad</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                    <div>
                      <span className="font-medium">Implementar A/B testing</span>
                      <p className="text-sm text-gray-600">Probar diferentes layouts para mejorar la conversión</p>
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
