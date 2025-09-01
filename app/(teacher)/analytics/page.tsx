'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart3, 
  TrendingUp, 
  MapPin, 
  BookOpen,
  Users,
  Target,
  Eye,
  Brain,
  Globe,
  Award,
  CheckCircle,
  Clock,
  Star,
  Trophy,
  ArrowUp,
  ArrowDown,
  Minus,
  RefreshCw,
  Download,
  Filter,
  Settings,
  Info,
  HelpCircle,
  ChevronRight,
  ChevronLeft,
  Plus,
  Minus as MinusIcon,
  Calendar,
  PieChart,
  LineChart,
  Activity,
  Zap,
  Heart,
  MessageSquare,
  Bell,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Timer,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  RotateCcw,
  Search,
  Bookmark,
  Flag,
  Medal,
  Crown,
  Compass,
  Mountain,
  TreePine,
  Sun,
  Moon,
  Languages
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Importar componentes de analytics
import AnalyticsDashboard from '@/components/analytics/analytics-dashboard';
import EngagementMetrics from '@/components/analytics/engagement-metrics';
import RegionalAnalysis from '@/components/analytics/regional-analysis';
import ProgressReport from '@/components/analytics/progress-report';

export default function AnalyticsPage() {
  const [selectedView, setSelectedView] = useState<'dashboard' | 'engagement' | 'regional' | 'progress'>('dashboard');
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d'>('30d');
  const [isLoading, setIsLoading] = useState(false);

  // Datos de resumen para el header
  const summaryData = {
    totalUsers: 1247,
    activeUsers: 892,
    totalLessons: 2847,
    completedLessons: 2156,
    averageEngagement: 84.4,
    averageSatisfaction: 4.2,
    totalRegions: 8,
    culturalDiversity: 92.3
  };

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

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics y Reportes</h1>
          <p className="text-gray-600 mt-1">
            Sistema completo de análisis de datos y métricas de aprendizaje
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
          
          <button
            onClick={() => setIsLoading(true)}
            disabled={isLoading}
            className="flex items-center space-x-2 px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
            tabIndex={0}
          >
            <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
            <span>Actualizar</span>
          </button>
          
          <button
            className="flex items-center space-x-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
            tabIndex={0}
          >
            <Download className="w-4 h-4" />
            <span>Exportar</span>
          </button>
        </div>
      </div>

      {/* Métricas de Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Totales</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryData.totalUsers.toLocaleString()}</div>
            <div className="flex items-center space-x-1 text-sm text-gray-600">
              {getChangeIcon(12.5)}
              <span className={getChangeColor(12.5)}>+12.5%</span>
              <span>vs mes anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryData.activeUsers.toLocaleString()}</div>
            <div className="flex items-center space-x-1 text-sm text-gray-600">
              {getChangeIcon(8.9)}
              <span className={getChangeColor(8.9)}>+8.9%</span>
              <span>vs mes anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement Promedio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryData.averageEngagement}%</div>
            <div className="flex items-center space-x-1 text-sm text-gray-600">
              {getChangeIcon(5.2)}
              <span className={getChangeColor(5.2)}>+5.2%</span>
              <span>vs mes anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Satisfacción</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryData.averageSatisfaction}/5</div>
            <div className="flex items-center space-x-1 text-sm text-gray-600">
              {getChangeIcon(0.3)}
              <span className={getChangeColor(0.3)}>+0.3</span>
              <span>vs mes anterior</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navegación por Tabs */}
      <div className="space-y-6">
        <div className="flex space-x-1 bg-muted p-1 rounded-lg">
          <button
            onClick={() => setSelectedView('dashboard')}
            className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedView === 'dashboard'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            tabIndex={0}
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Dashboard
          </button>
          <button
            onClick={() => setSelectedView('engagement')}
            className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedView === 'engagement'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            tabIndex={0}
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Engagement
          </button>
          <button
            onClick={() => setSelectedView('regional')}
            className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedView === 'regional'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            tabIndex={0}
          >
            <MapPin className="w-4 h-4 mr-2" />
            Regional
          </button>
          <button
            onClick={() => setSelectedView('progress')}
            className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedView === 'progress'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            tabIndex={0}
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Progreso
          </button>
        </div>

        {/* Tab Dashboard de Analytics */}
        {selectedView === 'dashboard' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Dashboard de Analytics</h2>
                <p className="text-gray-600">
                  Vista general de métricas y KPIs principales
                </p>
              </div>
            </div>
            
            <AnalyticsDashboard 
              className="w-full"
              refreshInterval={300000}
              showRegionalAnalysis={true}
              showEngagementMetrics={true}
            />
          </div>
        )}

        {/* Tab Métricas de Engagement */}
        {selectedView === 'engagement' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Métricas de Engagement y Retención</h2>
                <p className="text-gray-600">
                  Análisis detallado de participación y retención de usuarios
                </p>
              </div>
            </div>
            
            <EngagementMetrics 
              className="w-full"
              refreshInterval={300000}
              showDetailedAnalysis={true}
              showRetentionCohorts={true}
              showUserJourney={true}
            />
          </div>
        )}

        {/* Tab Análisis Regional */}
        {selectedView === 'regional' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Análisis de Efectividad por Región</h2>
                <p className="text-gray-600">
                  Análisis regional con métricas culturales y de efectividad
                </p>
              </div>
            </div>
            
            <RegionalAnalysis 
              className="w-full"
              refreshInterval={300000}
              showCulturalMetrics={true}
              showRegionalComparison={true}
              showEffectivenessAnalysis={true}
            />
          </div>
        )}

        {/* Tab Reportes de Progreso */}
        {selectedView === 'progress' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Reportes de Progreso Detallados</h2>
                <p className="text-gray-600">
                  Reportes individuales y comparativos de progreso de estudiantes
                </p>
              </div>
            </div>
            
            <ProgressReport 
              className="w-full"
              studentId="default"
              refreshInterval={300000}
              showDetailedMetrics={true}
              showComparisons={true}
              showRecommendations={true}
            />
          </div>
        )}
      </div>

      {/* Footer con información adicional */}
      <div className="mt-12 p-6 bg-gray-50 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="font-semibold mb-2">Sobre el Sistema de Analytics</h3>
            <p className="text-sm text-gray-600">
              Sistema completo de análisis de datos que proporciona insights detallados sobre el aprendizaje,
              engagement y efectividad por región y contexto cultural.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-2">Características Principales</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Dashboard completo con KPIs</li>
              <li>• Métricas de engagement y retención</li>
              <li>• Análisis regional y cultural</li>
              <li>• Reportes de progreso detallados</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-2">Actualización de Datos</h3>
            <p className="text-sm text-gray-600">
              Los datos se actualizan automáticamente cada 5 minutos. 
              Última actualización: {new Date().toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
