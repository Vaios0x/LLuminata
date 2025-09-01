'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  PieChart, 
  LineChart, 
  TrendingUp, 
  TrendingDown,
  Users, 
  BookOpen, 
  Clock, 
  Target, 
  Award,
  Download,
  Filter,
  Calendar,
  Eye,
  FileText,
  Globe,
  Heart,
  Zap,
  Brain,
  Activity,
  Star,
  ArrowUp,
  ArrowDown,
  Minus,
  CheckCircle,
  AlertCircle,
  XCircle,
  Clock3,
  Target,
  Award,
  Trophy,
  Lightbulb,
  Settings,
  RefreshCw,
  Share2,
  Printer,
  Mail,
  Plus,
  Edit,
  Trash2,
  Copy,
  Search,
  Filter as FilterIcon,
  SortAsc,
  SortDesc,
  MoreHorizontal,
  Info,
  HelpCircle,
  ExternalLink,
  Lock,
  Unlock,
  EyeOff,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  RotateCw,
  Type,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link,
  Smile,
  Camera,
  Mic,
  Play,
  Pause,
  SkipBack,
  SkipForward
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReportsAnalyticsProps {
  teacherId: string;
  className?: string;
}

interface ReportData {
  id: string;
  name: string;
  type: 'progress' | 'cultural' | 'accessibility' | 'engagement' | 'performance' | 'comprehensive';
  description: string;
  icon: React.ReactNode;
  lastGenerated: string;
  status: 'ready' | 'generating' | 'error';
  size: string;
  format: 'pdf' | 'excel' | 'csv';
}

interface AnalyticsMetric {
  name: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  target: number;
  unit: string;
}

interface CulturalAnalytics {
  backgrounds: {
    background: string;
    students: number;
    averageScore: number;
    engagementRate: number;
    culturalRelevance: number;
  }[];
  adaptations: {
    type: string;
    usage: number;
    effectiveness: number;
    satisfaction: number;
  }[];
  content: {
    category: string;
    culturalElements: number;
    relevance: number;
    impact: number;
  }[];
}

interface AccessibilityAnalytics {
  features: {
    feature: string;
    users: number;
    satisfaction: number;
    usage: number;
  }[];
  needs: {
    need: string;
    students: number;
    supportLevel: number;
    improvement: number;
  }[];
  compliance: {
    standard: string;
    score: number;
    status: 'compliant' | 'partial' | 'non-compliant';
  }[];
}

export const ReportsAnalytics: React.FC<ReportsAnalyticsProps> = ({
  teacherId,
  className
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedReport, setSelectedReport] = useState<ReportData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [reports, setReports] = useState<ReportData[]>([]);
  const [metrics, setMetrics] = useState<AnalyticsMetric[]>([]);
  const [culturalData, setCulturalData] = useState<CulturalAnalytics | null>(null);
  const [accessibilityData, setAccessibilityData] = useState<AccessibilityAnalytics | null>(null);

  useEffect(() => {
    loadData();
  }, [teacherId, selectedPeriod]);

  const loadData = async () => {
    // Simular carga de datos
    const mockReports: ReportData[] = [
      {
        id: '1',
        name: 'Reporte de Progreso Mensual',
        type: 'progress',
        description: 'Análisis detallado del progreso de todos los estudiantes',
        icon: <TrendingUp className="w-5 h-5" />,
        lastGenerated: '2024-01-15',
        status: 'ready',
        size: '2.3 MB',
        format: 'pdf'
      },
      {
        id: '2',
        name: 'Análisis Cultural',
        type: 'cultural',
        description: 'Métricas de diversidad cultural y adaptaciones',
        icon: <Globe className="w-5 h-5" />,
        lastGenerated: '2024-01-10',
        status: 'ready',
        size: '1.8 MB',
        format: 'excel'
      },
      {
        id: '3',
        name: 'Reporte de Accesibilidad',
        type: 'accessibility',
        description: 'Análisis de características de accesibilidad',
        icon: <Zap className="w-5 h-5" />,
        lastGenerated: '2024-01-12',
        status: 'ready',
        size: '1.5 MB',
        format: 'pdf'
      },
      {
        id: '4',
        name: 'Métricas de Engagement',
        type: 'engagement',
        description: 'Análisis de participación y engagement',
        icon: <Activity className="w-5 h-5" />,
        lastGenerated: '2024-01-08',
        status: 'ready',
        size: '2.1 MB',
        format: 'csv'
      }
    ];

    const mockMetrics: AnalyticsMetric[] = [
      {
        name: 'Progreso Promedio',
        value: 78.5,
        change: 2.3,
        trend: 'up',
        target: 80,
        unit: '%'
      },
      {
        name: 'Tasa de Engagement',
        value: 84.2,
        change: -1.1,
        trend: 'down',
        target: 85,
        unit: '%'
      },
      {
        name: 'Diversidad Cultural',
        value: 92.0,
        change: 0.5,
        trend: 'up',
        target: 90,
        unit: '%'
      },
      {
        name: 'Accesibilidad',
        value: 88.7,
        change: 1.8,
        trend: 'up',
        target: 85,
        unit: '%'
      },
      {
        name: 'Tiempo de Aprendizaje',
        value: 45.2,
        change: -2.1,
        trend: 'down',
        target: 40,
        unit: 'min'
      },
      {
        name: 'Satisfacción',
        value: 91.3,
        change: 0.8,
        trend: 'up',
        target: 90,
        unit: '%'
      }
    ];

    const mockCulturalData: CulturalAnalytics = {
      backgrounds: [
        { background: 'Maya', students: 8, averageScore: 85.2, engagementRate: 88.5, culturalRelevance: 0.95 },
        { background: 'Náhuatl', students: 6, averageScore: 82.1, engagementRate: 85.2, culturalRelevance: 0.92 },
        { background: 'Zapoteco', students: 5, averageScore: 87.3, engagementRate: 90.1, culturalRelevance: 0.88 },
        { background: 'Mixteco', students: 4, averageScore: 79.8, engagementRate: 82.3, culturalRelevance: 0.85 },
        { background: 'Otros', students: 2, averageScore: 81.5, engagementRate: 84.7, culturalRelevance: 0.75 }
      ],
      adaptations: [
        { type: 'Contenido Cultural', usage: 85, effectiveness: 92, satisfaction: 88 },
        { type: 'Idioma Nativo', usage: 65, effectiveness: 78, satisfaction: 82 },
        { type: 'Ejemplos Locales', usage: 90, effectiveness: 89, satisfaction: 91 },
        { type: 'Tradiciones', usage: 75, effectiveness: 85, satisfaction: 87 }
      ],
      content: [
        { category: 'Matemáticas', culturalElements: 15, relevance: 0.92, impact: 0.88 },
        { category: 'Historia', culturalElements: 12, relevance: 0.95, impact: 0.91 },
        { category: 'Ciencias', culturalElements: 8, relevance: 0.78, impact: 0.82 },
        { category: 'Artes', culturalElements: 20, relevance: 0.98, impact: 0.94 }
      ]
    };

    const mockAccessibilityData: AccessibilityAnalytics = {
      features: [
        { feature: 'Lector de Pantalla', users: 3, satisfaction: 92, usage: 85 },
        { feature: 'Alto Contraste', users: 5, satisfaction: 88, usage: 78 },
        { feature: 'Navegación por Teclado', users: 8, satisfaction: 95, usage: 92 },
        { feature: 'Control por Voz', users: 2, satisfaction: 85, usage: 70 },
        { feature: 'Texto Grande', users: 6, satisfaction: 90, usage: 82 }
      ],
      needs: [
        { need: 'Dislexia', students: 4, supportLevel: 85, improvement: 12 },
        { need: 'Déficit de Atención', students: 3, supportLevel: 78, improvement: 8 },
        { need: 'Discapacidad Visual', students: 2, supportLevel: 92, improvement: 15 },
        { need: 'Discapacidad Auditiva', students: 1, supportLevel: 88, improvement: 10 }
      ],
      compliance: [
        { standard: 'WCAG 2.1 AA', score: 92, status: 'compliant' },
        { standard: 'Section 508', score: 88, status: 'compliant' },
        { standard: 'EN 301 549', score: 85, status: 'partial' }
      ]
    };

    setReports(mockReports);
    setMetrics(mockMetrics);
    setCulturalData(mockCulturalData);
    setAccessibilityData(mockAccessibilityData);
  };

  const generateReport = async (type: string) => {
    setIsGenerating(true);
    try {
      // Simular generación de reporte
      await new Promise(resolve => setTimeout(resolve, 3000));
      console.log('Reporte generado:', type);
    } catch (error) {
      console.error('Error generando reporte:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <ArrowUp className="w-4 h-4 text-green-500" />;
      case 'down': return <ArrowDown className="w-4 h-4 text-red-500" />;
      default: return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'bg-green-100 text-green-800';
      case 'generating': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getComplianceColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'bg-green-100 text-green-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      case 'non-compliant': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-blue-600" />
            Reportes y Analytics
          </h1>
          <p className="text-gray-600 mt-1">
            Análisis detallado del progreso, diversidad cultural y accesibilidad
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </Button>
          <Button variant="outline" onClick={loadData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualizar
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Reporte
          </Button>
        </div>
      </div>

      {/* Filtros */}
      {showFilters && (
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Período</label>
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="week">Esta semana</option>
                  <option value="month">Este mes</option>
                  <option value="quarter">Este trimestre</option>
                  <option value="year">Este año</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Tipo de Reporte</label>
                <select className="w-full p-2 border rounded-lg">
                  <option value="">Todos los tipos</option>
                  <option value="progress">Progreso</option>
                  <option value="cultural">Cultural</option>
                  <option value="accessibility">Accesibilidad</option>
                  <option value="engagement">Engagement</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Formato</label>
                <select className="w-full p-2 border rounded-lg">
                  <option value="">Todos los formatos</option>
                  <option value="pdf">PDF</option>
                  <option value="excel">Excel</option>
                  <option value="csv">CSV</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Estado</label>
                <select className="w-full p-2 border rounded-lg">
                  <option value="">Todos los estados</option>
                  <option value="ready">Listo</option>
                  <option value="generating">Generando</option>
                  <option value="error">Error</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pestañas principales */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Resumen
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Reportes
          </TabsTrigger>
          <TabsTrigger value="cultural" className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Cultural
          </TabsTrigger>
          <TabsTrigger value="accessibility" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Accesibilidad
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Rendimiento
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4" />
            Insights
          </TabsTrigger>
        </TabsList>

        {/* Pestaña de Resumen */}
        <TabsContent value="overview" className="space-y-6">
          {/* Métricas principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {metrics.map((metric, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-700">{metric.name}</h3>
                    {getTrendIcon(metric.trend)}
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold">{metric.value}</span>
                      <span className="text-sm text-gray-600">{metric.unit}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn("text-sm", getTrendColor(metric.trend))}>
                        {metric.change > 0 ? '+' : ''}{metric.change}%
                      </span>
                      <span className="text-xs text-gray-500">vs período anterior</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Meta: {metric.target}{metric.unit}</span>
                        <span>{Math.round((metric.value / metric.target) * 100)}%</span>
                      </div>
                      <Progress value={(metric.value / metric.target) * 100} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Gráficos de tendencias */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="w-5 h-5" />
                  Tendencias de Progreso
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-end justify-center gap-2">
                  {[75, 78, 82, 79, 85, 88, 78.5].map((value, index) => (
                    <div key={index} className="flex flex-col items-center gap-2">
                      <div 
                        className="w-8 bg-blue-500 rounded-t"
                        style={{ height: `${value * 2}px` }}
                      ></div>
                      <span className="text-xs text-gray-600">S{index + 1}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  Distribución Cultural
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {culturalData?.backgrounds.map((background, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <span className="text-sm">{background.background}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{background.students} estudiantes</p>
                        <p className="text-xs text-gray-600">{background.averageScore}% promedio</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Pestaña de Reportes */}
        <TabsContent value="reports" className="space-y-6">
          {/* Generador de reportes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Generar Nuevo Reporte
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Button 
                  variant="outline" 
                  className="flex flex-col items-center gap-2 h-auto p-4"
                  onClick={() => generateReport('progress')}
                  disabled={isGenerating}
                >
                  <TrendingUp className="w-6 h-6" />
                  <span className="text-sm">Reporte de Progreso</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="flex flex-col items-center gap-2 h-auto p-4"
                  onClick={() => generateReport('cultural')}
                  disabled={isGenerating}
                >
                  <Globe className="w-6 h-6" />
                  <span className="text-sm">Análisis Cultural</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="flex flex-col items-center gap-2 h-auto p-4"
                  onClick={() => generateReport('accessibility')}
                  disabled={isGenerating}
                >
                  <Zap className="w-6 h-6" />
                  <span className="text-sm">Reporte de Accesibilidad</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="flex flex-col items-center gap-2 h-auto p-4"
                  onClick={() => generateReport('engagement')}
                  disabled={isGenerating}
                >
                  <Activity className="w-6 h-6" />
                  <span className="text-sm">Métricas de Engagement</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="flex flex-col items-center gap-2 h-auto p-4"
                  onClick={() => generateReport('performance')}
                  disabled={isGenerating}
                >
                  <Target className="w-6 h-6" />
                  <span className="text-sm">Rendimiento Académico</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="flex flex-col items-center gap-2 h-auto p-4"
                  onClick={() => generateReport('comprehensive')}
                  disabled={isGenerating}
                >
                  <BarChart3 className="w-6 h-6" />
                  <span className="text-sm">Reporte Completo</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Lista de reportes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Reportes Recientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reports.map((report) => (
                  <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        {report.icon}
                      </div>
                      <div>
                        <h4 className="font-medium">{report.name}</h4>
                        <p className="text-sm text-gray-600">{report.description}</p>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-xs text-gray-500">
                            Generado: {report.lastGenerated}
                          </span>
                          <span className="text-xs text-gray-500">
                            Tamaño: {report.size}
                          </span>
                          <Badge className="text-xs">{report.format.toUpperCase()}</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(report.status)}>
                        {report.status === 'ready' ? 'Listo' : 
                         report.status === 'generating' ? 'Generando' : 'Error'}
                      </Badge>
                      <Button size="sm" variant="outline">
                        <Download className="w-4 h-4 mr-1" />
                        Descargar
                      </Button>
                      <Button size="sm" variant="outline">
                        <Share2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pestaña Cultural */}
        <TabsContent value="cultural" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Análisis de fondos culturales */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Fondos Culturales
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {culturalData?.backgrounds.map((background, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">{background.background}</h4>
                        <Badge className="bg-orange-100 text-orange-800">
                          {Math.round(background.culturalRelevance * 100)}% relevante
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Estudiantes:</span>
                          <p className="font-medium">{background.students}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Promedio:</span>
                          <p className="font-medium">{background.averageScore}%</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Engagement:</span>
                          <p className="font-medium">{background.engagementRate}%</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Adaptaciones culturales */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5" />
                  Adaptaciones Culturales
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {culturalData?.adaptations.map((adaptation, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-3">{adaptation.type}</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Uso:</span>
                          <span className="font-medium">{adaptation.usage}%</span>
                        </div>
                        <Progress value={adaptation.usage} className="h-2" />
                        <div className="flex justify-between text-sm">
                          <span>Efectividad:</span>
                          <span className="font-medium">{adaptation.effectiveness}%</span>
                        </div>
                        <Progress value={adaptation.effectiveness} className="h-2" />
                        <div className="flex justify-between text-sm">
                          <span>Satisfacción:</span>
                          <span className="font-medium">{adaptation.satisfaction}%</span>
                        </div>
                        <Progress value={adaptation.satisfaction} className="h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contenido cultural */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Contenido Cultural por Categoría
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {culturalData?.content.map((content, index) => (
                  <div key={index} className="p-4 border rounded-lg text-center">
                    <h4 className="font-medium mb-2">{content.category}</h4>
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm text-gray-600">Elementos:</span>
                        <p className="text-lg font-bold">{content.culturalElements}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Relevancia:</span>
                        <p className="font-medium">{Math.round(content.relevance * 100)}%</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Impacto:</span>
                        <p className="font-medium">{Math.round(content.impact * 100)}%</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pestaña de Accesibilidad */}
        <TabsContent value="accessibility" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Características de accesibilidad */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Características de Accesibilidad
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {accessibilityData?.features.map((feature, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-3">{feature.feature}</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Usuarios:</span>
                          <span className="font-medium">{feature.users}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Satisfacción:</span>
                          <span className="font-medium">{feature.satisfaction}%</span>
                        </div>
                        <Progress value={feature.satisfaction} className="h-2" />
                        <div className="flex justify-between text-sm">
                          <span>Uso:</span>
                          <span className="font-medium">{feature.usage}%</span>
                        </div>
                        <Progress value={feature.usage} className="h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Necesidades especiales */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5" />
                  Necesidades Especiales
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {accessibilityData?.needs.map((need, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-3">{need.need}</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Estudiantes:</span>
                          <span className="font-medium">{need.students}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Nivel de Apoyo:</span>
                          <span className="font-medium">{need.supportLevel}%</span>
                        </div>
                        <Progress value={need.supportLevel} className="h-2" />
                        <div className="flex justify-between text-sm">
                          <span>Mejora:</span>
                          <span className="font-medium text-green-600">+{need.improvement}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Cumplimiento de estándares */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Cumplimiento de Estándares
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {accessibilityData?.compliance.map((standard, index) => (
                  <div key={index} className="p-4 border rounded-lg text-center">
                    <h4 className="font-medium mb-2">{standard.standard}</h4>
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm text-gray-600">Puntuación:</span>
                        <p className="text-lg font-bold">{standard.score}%</p>
                      </div>
                      <Badge className={getComplianceColor(standard.status)}>
                        {standard.status === 'compliant' ? 'Cumple' : 
                         standard.status === 'partial' ? 'Parcial' : 'No Cumple'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pestaña de Rendimiento */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Métricas de rendimiento */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Métricas de Rendimiento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metrics.slice(0, 4).map((metric, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{metric.name}</h4>
                        {getTrendIcon(metric.trend)}
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold">{metric.value}</span>
                          <span className="text-sm text-gray-600">{metric.unit}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className={getTrendColor(metric.trend)}>
                            {metric.change > 0 ? '+' : ''}{metric.change}%
                          </span>
                          <span>Meta: {metric.target}{metric.unit}</span>
                        </div>
                        <Progress value={(metric.value / metric.target) * 100} className="h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Comparación de períodos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Comparación de Períodos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: 'Progreso', current: 78.5, previous: 76.2, change: 2.3 },
                    { name: 'Engagement', current: 84.2, previous: 85.3, change: -1.1 },
                    { name: 'Satisfacción', current: 91.3, previous: 90.5, change: 0.8 },
                    { name: 'Tiempo', current: 45.2, previous: 47.3, change: -2.1 }
                  ].map((item, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">{item.name}</h4>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Actual:</span>
                          <p className="font-medium">{item.current}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Anterior:</span>
                          <p className="font-medium">{item.previous}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Cambio:</span>
                          <p className={cn("font-medium", item.change > 0 ? "text-green-600" : "text-red-600")}>
                            {item.change > 0 ? '+' : ''}{item.change}%
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Pestaña de Insights */}
        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Insights automáticos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5" />
                  Insights Automáticos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-start gap-3">
                      <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-900 mb-1">Progreso Mejorando</h4>
                        <p className="text-sm text-blue-800">
                          El progreso promedio ha mejorado 2.3% este mes. Los estudiantes mayas 
                          muestran el mayor crecimiento con un 5.2% de mejora.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Globe className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-green-900 mb-1">Diversidad Cultural Excelente</h4>
                        <p className="text-sm text-green-800">
                          La diversidad cultural alcanza el 92%, superando la meta del 90%. 
                          Las adaptaciones culturales tienen una efectividad del 89%.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-yellow-900 mb-1">Atención Requerida</h4>
                        <p className="text-sm text-yellow-800">
                          El engagement ha disminuido 1.1%. Considera revisar el contenido 
                          de ciencias que muestra menor participación.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-purple-50 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Zap className="w-5 h-5 text-purple-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-purple-900 mb-1">Accesibilidad Mejorando</h4>
                        <p className="text-sm text-purple-800">
                          La accesibilidad general ha mejorado 1.8%. El control por voz 
                          muestra menor uso, considera más capacitación.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recomendaciones */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Recomendaciones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Contenido de Ciencias</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      El contenido de ciencias muestra menor engagement. Considera:
                    </p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Agregar más ejemplos culturales</li>
                      <li>• Incluir experimentos interactivos</li>
                      <li>• Mejorar la accesibilidad visual</li>
                    </ul>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Control por Voz</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      El control por voz tiene bajo uso. Recomendaciones:
                    </p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Capacitar a estudiantes en su uso</li>
                      <li>• Mejorar la precisión del reconocimiento</li>
                      <li>• Agregar comandos en idiomas indígenas</li>
                    </ul>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Contenido Cultural</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Las adaptaciones culturales son muy efectivas. Considera:
                    </p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Expandir a más culturas</li>
                      <li>• Crear contenido colaborativo</li>
                      <li>• Incluir voces de la comunidad</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
