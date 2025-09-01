/**
 * Componente de Reportes Avanzados
 * Reportes de progreso por región, análisis de impacto educativo, métricas de retención y reportes para stakeholders
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
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
  SkipForward,
  MapPin,
  GraduationCap,
  Building,
  Users2,
  Globe2,
  TrendingUp2,
  BarChart,
  PieChart2,
  LineChart2,
  ScatterChart,
  AreaChart,
  Gauge,
  Thermometer,
  Target2,
  Award2,
  Trophy2,
  Medal,
  Crown,
  Flag,
  Shield,
  CheckShield,
  AlertTriangle,
  Info2,
  HelpCircle2,
  X,
  Plus2,
  Minus2,
  Divide,
  Percent,
  DollarSign,
  Euro,
  Pound,
  Yen,
  Bitcoin,
  CreditCard,
  Wallet,
  PiggyBank,
  Banknote,
  Coins,
  Receipt,
  Calculator,
  ChartBar,
  ChartLine,
  ChartPie,
  ChartArea,
  ChartScatter,
  ChartBubble,
  ChartDoughnut,
  ChartRadar,
  ChartPolar,
  ChartCandlestick,
  ChartHeatmap,
  ChartTree,
  ChartSunburst,
  ChartSankey,
  ChartVoronoi,
  ChartChord,
  ChartForce,
  ChartSankey2,
  ChartTree2,
  ChartSunburst2,
  ChartVoronoi2,
  ChartChord2,
  ChartForce2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdvancedReportingProps {
  className?: string;
}

interface RegionalReportData {
  id: string;
  region: string;
  period: string;
  startDate: Date;
  endDate: Date;
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  returningUsers: number;
  churnRate: number;
  lessonsCompleted: number;
  assessmentsPassed: number;
  averageScore: number;
  completionRate: number;
  literacyImprovement?: number;
  retentionRate: number;
  engagementScore: number;
  culturalContentUsage: number;
  localLanguageUsage: number;
  culturalSatisfaction: number;
  details: Array<{
    id: string;
    category: string;
    metric: string;
    value: number;
    target?: number;
    trend?: number;
  }>;
  createdAt: Date;
}

interface ImpactAnalysisData {
  id: string;
  analysisType: string;
  period: string;
  startDate: Date;
  endDate: Date;
  educationalImpact: number;
  socialImpact: number;
  economicImpact: number;
  culturalImpact: number;
  studentRetention: number;
  teacherRetention: number;
  familyEngagement: number;
  contentQuality: number;
  accessibilityScore: number;
  userSatisfaction: number;
  details: Array<{
    id: string;
    metric: string;
    value: number;
    benchmark?: number;
    improvement?: number;
  }>;
  createdAt: Date;
}

interface RetentionMetricsData {
  overall: {
    day1: number;
    day7: number;
    day30: number;
    day90: number;
    day180: number;
    day365: number;
  };
  byRegion: {
    [region: string]: {
      day1: number;
      day7: number;
      day30: number;
      day90: number;
    };
  };
  byLanguage: {
    [language: string]: {
      day1: number;
      day7: number;
      day30: number;
      day90: number;
    };
  };
  byAge: {
    [ageGroup: string]: {
      day1: number;
      day7: number;
      day30: number;
      day90: number;
    };
  };
  trends: {
    [period: string]: {
      day1: number;
      day7: number;
      day30: number;
      day90: number;
    };
  };
}

interface StakeholderReportData {
  id: string;
  stakeholderType: string;
  reportType: string;
  period: string;
  generatedAt: Date;
  summary: string;
  keyMetrics: Record<string, any>;
  recommendations: string[];
  nextSteps: string[];
  isDelivered: boolean;
  deliveredAt?: Date;
  feedback?: string;
  attachments: Array<{
    id: string;
    filename: string;
    fileType: string;
    fileSize: number;
    url: string;
  }>;
}

export const AdvancedReporting: React.FC<AdvancedReportingProps> = ({
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState('regional');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Datos de reportes
  const [regionalReports, setRegionalReports] = useState<RegionalReportData[]>([]);
  const [impactAnalyses, setImpactAnalyses] = useState<ImpactAnalysisData[]>([]);
  const [retentionMetrics, setRetentionMetrics] = useState<RetentionMetricsData | null>(null);
  const [stakeholderReports, setStakeholderReports] = useState<StakeholderReportData[]>([]);

  // Estados para filtros
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedStakeholderType, setSelectedStakeholderType] = useState('all');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  // Estados para formularios
  const [showGenerateReport, setShowGenerateReport] = useState(false);
  const [showGenerateAnalysis, setShowGenerateAnalysis] = useState(false);
  const [showGenerateStakeholderReport, setShowGenerateStakeholderReport] = useState(false);

  const loadRegionalReports = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/reports/regional?period=${selectedPeriod}&startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`);
      if (response.ok) {
        const data = await response.json();
        setRegionalReports(data.data || []);
      }
    } catch (error) {
      console.error('Error cargando reportes regionales:', error);
      setError('Error cargando reportes regionales');
    } finally {
      setIsLoading(false);
    }
  };

  const loadImpactAnalyses = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/reports/impact?period=${selectedPeriod}&startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`);
      if (response.ok) {
        const data = await response.json();
        setImpactAnalyses(data.data || []);
      }
    } catch (error) {
      console.error('Error cargando análisis de impacto:', error);
      setError('Error cargando análisis de impacto');
    } finally {
      setIsLoading(false);
    }
  };

  const loadRetentionMetrics = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/reports/retention?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`);
      if (response.ok) {
        const data = await response.json();
        setRetentionMetrics(data.data);
      }
    } catch (error) {
      console.error('Error cargando métricas de retención:', error);
      setError('Error cargando métricas de retención');
    } finally {
      setIsLoading(false);
    }
  };

  const loadStakeholderReports = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/reports/stakeholders?type=${selectedStakeholderType}&period=${selectedPeriod}`);
      if (response.ok) {
        const data = await response.json();
        setStakeholderReports(data.data || []);
      }
    } catch (error) {
      console.error('Error cargando reportes de stakeholders:', error);
      setError('Error cargando reportes de stakeholders');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    switch (activeTab) {
      case 'regional':
        loadRegionalReports();
        break;
      case 'impact':
        loadImpactAnalyses();
        break;
      case 'retention':
        loadRetentionMetrics();
        break;
      case 'stakeholders':
        loadStakeholderReports();
        break;
    }
  }, [activeTab, selectedPeriod, selectedRegion, selectedStakeholderType, dateRange]);

  const getImpactColor = (value: number) => {
    if (value >= 0.8) return 'text-green-600';
    if (value >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getImpactIcon = (value: number) => {
    if (value >= 0.8) return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (value >= 0.6) return <Minus className="w-4 h-4 text-yellow-600" />;
    return <TrendingDown className="w-4 h-4 text-red-600" />;
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('es-MX').format(value);
  };

  if (isLoading) {
    return (
      <div className={cn("flex items-center justify-center p-8", className)}>
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2">Cargando reportes avanzados...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("p-4", className)}>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center text-red-800">
              <AlertTriangle className="w-5 h-5 mr-2" />
              <span>{error}</span>
            </div>
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline" 
              size="sm" 
              className="mt-2"
            >
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header con filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5" />
            <span>Reportes Avanzados</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium">Período</label>
              <select 
                value={selectedPeriod} 
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
              >
                <option value="monthly">Mensual</option>
                <option value="quarterly">Trimestral</option>
                <option value="yearly">Anual</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Fecha Inicio</label>
              <input 
                type="date" 
                value={dateRange.startDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Fecha Fin</label>
              <input 
                type="date" 
                value={dateRange.endDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="flex items-end">
              <Button onClick={() => window.location.reload()} className="w-full">
                <RefreshCw className="w-4 h-4 mr-2" />
                Actualizar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs principales */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="regional" className="flex items-center space-x-2">
            <Globe className="w-4 h-4" />
            <span>Regional</span>
          </TabsTrigger>
          <TabsTrigger value="impact" className="flex items-center space-x-2">
            <Target className="w-4 h-4" />
            <span>Impacto</span>
          </TabsTrigger>
          <TabsTrigger value="retention" className="flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span>Retención</span>
          </TabsTrigger>
          <TabsTrigger value="stakeholders" className="flex items-center space-x-2">
            <Building className="w-4 h-4" />
            <span>Stakeholders</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab de Reportes Regionales */}
        <TabsContent value="regional" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Reportes de Progreso por Región</h3>
            <Button onClick={() => setShowGenerateReport(true)} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Generar Reporte
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {regionalReports.map((report) => (
              <Card key={report.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{report.region}</CardTitle>
                      <p className="text-sm text-gray-600">
                        {new Date(report.startDate).toLocaleDateString()} - {new Date(report.endDate).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="outline">{report.period}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Métricas principales */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{formatNumber(report.totalUsers)}</div>
                      <div className="text-sm text-gray-600">Total Usuarios</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{formatNumber(report.activeUsers)}</div>
                      <div className="text-sm text-gray-600">Usuarios Activos</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{formatPercentage(report.retentionRate)}</div>
                      <div className="text-sm text-gray-600">Tasa Retención</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">{formatPercentage(report.engagementScore)}</div>
                      <div className="text-sm text-gray-600">Engagement</div>
                    </div>
                  </div>

                  {/* Métricas educativas */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm">Métricas Educativas</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Lecciones Completadas:</span>
                        <span className="font-medium">{formatNumber(report.lessonsCompleted)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Evaluaciones Aprobadas:</span>
                        <span className="font-medium">{formatNumber(report.assessmentsPassed)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Puntuación Promedio:</span>
                        <span className="font-medium">{report.averageScore.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Tasa de Completado:</span>
                        <span className="font-medium">{formatPercentage(report.completionRate)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Métricas culturales */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm">Métricas Culturales</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Contenido Cultural:</span>
                        <span className="font-medium">{formatNumber(report.culturalContentUsage)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Idiomas Locales:</span>
                        <span className="font-medium">{formatNumber(report.localLanguageUsage)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Satisfacción Cultural:</span>
                        <span className="font-medium">{formatPercentage(report.culturalSatisfaction)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4">
                    <span className="text-xs text-gray-500">
                      Generado el {new Date(report.createdAt).toLocaleDateString()}
                    </span>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {regionalReports.length === 0 && (
            <Card>
              <CardContent className="pt-6 text-center">
                <Globe className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-600">No hay reportes regionales disponibles</p>
                <Button onClick={() => setShowGenerateReport(true)} className="mt-2">
                  Generar primer reporte
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Tab de Análisis de Impacto */}
        <TabsContent value="impact" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Análisis de Impacto Educativo</h3>
            <Button onClick={() => setShowGenerateAnalysis(true)} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Generar Análisis
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {impactAnalyses.map((analysis) => (
              <Card key={analysis.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">Análisis {analysis.analysisType}</CardTitle>
                      <p className="text-sm text-gray-600">
                        {new Date(analysis.startDate).toLocaleDateString()} - {new Date(analysis.endDate).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="outline">{analysis.period}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Métricas de impacto */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className={cn("text-2xl font-bold", getImpactColor(analysis.educationalImpact))}>
                        {formatPercentage(analysis.educationalImpact)}
                      </div>
                      <div className="text-sm text-gray-600">Impacto Educativo</div>
                    </div>
                    <div className="text-center">
                      <div className={cn("text-2xl font-bold", getImpactColor(analysis.socialImpact))}>
                        {formatPercentage(analysis.socialImpact)}
                      </div>
                      <div className="text-sm text-gray-600">Impacto Social</div>
                    </div>
                    <div className="text-center">
                      <div className={cn("text-2xl font-bold", getImpactColor(analysis.economicImpact))}>
                        {formatPercentage(analysis.economicImpact)}
                      </div>
                      <div className="text-sm text-gray-600">Impacto Económico</div>
                    </div>
                    <div className="text-center">
                      <div className={cn("text-2xl font-bold", getImpactColor(analysis.culturalImpact))}>
                        {formatPercentage(analysis.culturalImpact)}
                      </div>
                      <div className="text-sm text-gray-600">Impacto Cultural</div>
                    </div>
                  </div>

                  {/* Métricas de retención */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm">Métricas de Retención</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Retención Estudiantes:</span>
                        <span className="font-medium">{formatPercentage(analysis.studentRetention)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Retención Maestros:</span>
                        <span className="font-medium">{formatPercentage(analysis.teacherRetention)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Engagement Familiar:</span>
                        <span className="font-medium">{formatPercentage(analysis.familyEngagement)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Métricas de calidad */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm">Métricas de Calidad</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Calidad Contenido:</span>
                        <span className="font-medium">{formatPercentage(analysis.contentQuality)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Accesibilidad:</span>
                        <span className="font-medium">{formatPercentage(analysis.accessibilityScore)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Satisfacción Usuario:</span>
                        <span className="font-medium">{formatPercentage(analysis.userSatisfaction)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4">
                    <span className="text-xs text-gray-500">
                      Generado el {new Date(analysis.createdAt).toLocaleDateString()}
                    </span>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {impactAnalyses.length === 0 && (
            <Card>
              <CardContent className="pt-6 text-center">
                <Target className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-600">No hay análisis de impacto disponibles</p>
                <Button onClick={() => setShowGenerateAnalysis(true)} className="mt-2">
                  Generar primer análisis
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Tab de Métricas de Retención */}
        <TabsContent value="retention" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Métricas de Retención Avanzadas</h3>
          </div>

          {retentionMetrics && (
            <div className="space-y-6">
              {/* Retención General */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="w-5 h-5" />
                    <span>Retención General</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{formatPercentage(retentionMetrics.overall.day1)}</div>
                      <div className="text-sm text-gray-600">Día 1</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{formatPercentage(retentionMetrics.overall.day7)}</div>
                      <div className="text-sm text-gray-600">Día 7</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">{formatPercentage(retentionMetrics.overall.day30)}</div>
                      <div className="text-sm text-gray-600">Día 30</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">{formatPercentage(retentionMetrics.overall.day90)}</div>
                      <div className="text-sm text-gray-600">Día 90</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">{formatPercentage(retentionMetrics.overall.day180)}</div>
                      <div className="text-sm text-gray-600">Día 180</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{formatPercentage(retentionMetrics.overall.day365)}</div>
                      <div className="text-sm text-gray-600">Día 365</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Retención por Región */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MapPin className="w-5 h-5" />
                    <span>Retención por Región</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(retentionMetrics.byRegion).map(([region, metrics]) => (
                      <div key={region} className="border rounded-lg p-4">
                        <h4 className="font-medium mb-3">{region}</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Día 1:</span>
                            <span className="font-medium">{formatPercentage(metrics.day1)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Día 7:</span>
                            <span className="font-medium">{formatPercentage(metrics.day7)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Día 30:</span>
                            <span className="font-medium">{formatPercentage(metrics.day30)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Día 90:</span>
                            <span className="font-medium">{formatPercentage(metrics.day90)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Retención por Idioma */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Globe className="w-5 h-5" />
                    <span>Retención por Idioma</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(retentionMetrics.byLanguage).map(([language, metrics]) => (
                      <div key={language} className="border rounded-lg p-4">
                        <h4 className="font-medium mb-3">{language}</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Día 1:</span>
                            <span className="font-medium">{formatPercentage(metrics.day1)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Día 7:</span>
                            <span className="font-medium">{formatPercentage(metrics.day7)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Día 30:</span>
                            <span className="font-medium">{formatPercentage(metrics.day30)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Día 90:</span>
                            <span className="font-medium">{formatPercentage(metrics.day90)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {!retentionMetrics && (
            <Card>
              <CardContent className="pt-6 text-center">
                <Users className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-600">No hay métricas de retención disponibles</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Tab de Reportes de Stakeholders */}
        <TabsContent value="stakeholders" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Reportes para Stakeholders</h3>
            <Button onClick={() => setShowGenerateStakeholderReport(true)} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Generar Reporte
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {stakeholderReports.map((report) => (
              <Card key={report.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{report.stakeholderType}</CardTitle>
                      <p className="text-sm text-gray-600">{report.reportType} - {report.period}</p>
                    </div>
                    <Badge 
                      variant={report.isDelivered ? "default" : "secondary"}
                      className={cn("text-xs", report.isDelivered ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800")}
                    >
                      {report.isDelivered ? 'Entregado' : 'Pendiente'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Resumen</h4>
                    <p className="text-sm text-gray-600 line-clamp-3">{report.summary}</p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Métricas Clave</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(report.keyMetrics).slice(0, 4).map(([key, value]) => (
                        <div key={key} className="text-sm">
                          <span className="text-gray-600">{key}:</span>
                          <span className="font-medium ml-1">{typeof value === 'number' ? formatNumber(value) : value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Recomendaciones</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {report.recommendations.slice(0, 3).map((rec, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-blue-500 mr-2">•</span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex justify-between items-center pt-4">
                    <span className="text-xs text-gray-500">
                      Generado el {new Date(report.generatedAt).toLocaleDateString()}
                    </span>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Mail className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {stakeholderReports.length === 0 && (
            <Card>
              <CardContent className="pt-6 text-center">
                <Building className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-600">No hay reportes de stakeholders disponibles</p>
                <Button onClick={() => setShowGenerateStakeholderReport(true)} className="mt-2">
                  Generar primer reporte
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Aquí se pueden agregar los modales para generar reportes */}
      {/* Por simplicidad, no los incluyo en este componente, pero se pueden implementar */}
    </div>
  );
};
