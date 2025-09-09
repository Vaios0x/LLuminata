'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3,
  TrendingUp,
  Users,
  Activity,
  Brain,
  TestTube,
  Download,
  Wifi,
  Settings,
  RefreshCw,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,
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
  WifiOff,
  SignalHigh,
  SignalMedium,
  SignalLow,
  SignalZero,
  WifiHigh,
  WifiLow,
  WifiZero,
  Battery,
  BatteryCharging,
  BatteryFull,
  RotateCcw,
  Share2,
  Play,
  Pause,
  StopCircle,
  Timer,
  Percent,
  ArrowUpRight,
  ArrowDownRight,
  Minus as MinusIcon,
  Calendar,
  Clock,
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
  Target,
  Award,
  Zap,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  HelpCircle,
  Save
} from 'lucide-react';
import {
  HeatmapVisualizer,
  PredictiveAnalytics,
  ABTestingDashboard,
  RealTimeMetrics,
  ExportManager,
  AnalyticsDashboard,
  ProgressReport,
  RegionalAnalysis,
  EngagementMetrics,
  AdminDashboard,
  type HeatmapData,
  type PredictionData,
  type ABTest,
  type RealTimeMetric,
  type ExportJob,
  AnalyticsCategory,
  ExportFormat,
  ExportStatus,
  MetricStatus,
  EventSeverity,
  formatFileSize,
  getStatusColor,
  getSeverityColor,
  DEFAULT_ANALYTICS_CONFIG
} from '@/components/analytics';

export const AnalyticsExample: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [userId] = useState('user-123'); // En un caso real, esto vendría del contexto de autenticación
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleExport = (format: 'csv' | 'json' | 'pdf') => {
    console.log(`Exportando datos en formato ${format}`);
    // Aquí iría la lógica real de exportación
  };

  const handlePredictionUpdate = (predictions: PredictionData[]) => {
    console.log('Predicciones actualizadas:', predictions);
  };

  const handleModelRetrain = (modelId: string) => {
    console.log('Reentrenando modelo:', modelId);
  };

  const handleTestAction = (testId: string, action: 'start' | 'pause' | 'stop' | 'complete') => {
    console.log(`Acción ${action} en test ${testId}`);
  };

  const handleMetricUpdate = (metrics: RealTimeMetric[]) => {
    console.log('Métricas actualizadas:', metrics);
  };

  const handleEventReceived = (event: any) => {
    console.log('Evento recibido:', event);
  };

  const handleConnectionStatusChange = (status: any) => {
    console.log('Estado de conexión:', status);
  };

  const handleExportComplete = (job: ExportJob) => {
    console.log('Exportación completada:', job);
  };

  const handleExportError = (job: ExportJob, error: string) => {
    console.error('Error en exportación:', error, job);
  };

  const handleTemplateSave = (template: any) => {
    console.log('Plantilla guardada:', template);
  };

  const handleTemplateDelete = (templateId: string) => {
    console.log('Plantilla eliminada:', templateId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Sistema de Analytics Avanzados
          </h1>
          <p className="text-lg text-gray-600">
            Ejemplo de implementación de todos los componentes de analytics
          </p>
        </div>

        {/* Controles principales */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              {showAdvanced ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
              {showAdvanced ? 'Ocultar Avanzado' : 'Mostrar Avanzado'}
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4 mr-2" /> : <Maximize2 className="w-4 h-4 mr-2" />}
              {isFullscreen ? 'Salir Pantalla Completa' : 'Pantalla Completa'}
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline">
              Usuario: {userId}
            </Badge>
            <Badge variant="outline">
              Config: {DEFAULT_ANALYTICS_CONFIG.refreshInterval}ms
            </Badge>
          </div>
        </div>

        {/* Tabs principales */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="heatmap">Heatmap</TabsTrigger>
            <TabsTrigger value="predictive">Predictivo</TabsTrigger>
            <TabsTrigger value="abtesting">A/B Testing</TabsTrigger>
            <TabsTrigger value="realtime">Tiempo Real</TabsTrigger>
            <TabsTrigger value="exports">Exportaciones</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Dashboard principal */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5" />
                    <span>Dashboard Principal</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <AnalyticsDashboard 
                    refreshInterval={30000}
                  />
                </CardContent>
              </Card>

              {/* Reporte de progreso */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5" />
                    <span>Reporte de Progreso</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ProgressReport
                    refreshInterval={30000}
                  />
                </CardContent>
              </Card>

              {/* Análisis regional */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Globe className="w-5 h-5" />
                    <span>Análisis Regional</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RegionalAnalysis
                    refreshInterval={30000}
                  />
                </CardContent>
              </Card>

              {/* Métricas de engagement */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Heart className="w-5 h-5" />
                    <span>Métricas de Engagement</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <EngagementMetrics
                    refreshInterval={30000}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Componentes avanzados */}
            {showAdvanced && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Shield className="w-5 h-5" />
                      <span>Dashboard de Administrador</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <AdminDashboard
                      refreshInterval={30000}
                    />
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="heatmap" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="w-5 h-5" />
                  <span>Visualizador de Heatmap</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <HeatmapVisualizer 
                  userId={userId}
                  refreshInterval={30000}
                  onDataUpdate={(data: HeatmapData[]) => {
                    console.log('Datos de heatmap actualizados:', data);
                  }}
                  onExport={handleExport}
                  onFilterChange={(filters) => {
                    console.log('Filtros de heatmap cambiados:', filters);
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="predictive" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="w-5 h-5" />
                  <span>Analytics Predictivo</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PredictiveAnalytics 
                  userId={userId}
                  refreshInterval={60000}
                  onPredictionUpdate={handlePredictionUpdate}
                  onModelRetrain={handleModelRetrain}
                  onExport={handleExport}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="abtesting" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TestTube className="w-5 h-5" />
                  <span>Dashboard de Experimentos A/B</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ABTestingDashboard 
                  userId={userId}
                  refreshInterval={30000}
                  onTestUpdate={(tests: ABTest[]) => {
                    console.log('Tests A/B actualizados:', tests);
                  }}
                  onTestAction={handleTestAction}
                  onExport={handleExport}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="realtime" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Wifi className="w-5 h-5" />
                  <span>Métricas en Tiempo Real</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RealTimeMetrics 
                  userId={userId}
                  refreshInterval={5000}
                  onMetricUpdate={handleMetricUpdate}
                  onEventReceived={handleEventReceived}
                  onConnectionStatusChange={handleConnectionStatusChange}
                  onExport={handleExport}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="exports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Download className="w-5 h-5" />
                  <span>Gestor de Exportaciones</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ExportManager 
                  userId={userId}
                  refreshInterval={30000}
                  onExportComplete={handleExportComplete}
                  onExportError={handleExportError}
                  onTemplateSave={handleTemplateSave}
                  onTemplateDelete={handleTemplateDelete}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Información adicional */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Settings className="w-4 h-4 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Configuración</p>
                  <p className="text-lg font-semibold">Analytics</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Estado</p>
                  <p className="text-lg font-semibold">Activo</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Usuarios</p>
                  <p className="text-lg font-semibold">1,234</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Documentación rápida */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Info className="w-5 h-5" />
                <span>Documentación Rápida</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                <div>
                  <h4 className="font-medium mb-2">HeatmapVisualizer</h4>
                  <p className="text-gray-600">
                    Visualiza patrones de uso en tiempo y espacio con heatmaps interactivos.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">PredictiveAnalytics</h4>
                  <p className="text-gray-600">
                    Predicciones de comportamiento usando modelos de machine learning.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">ABTestingDashboard</h4>
                  <p className="text-gray-600">
                    Gestión y análisis de experimentos A/B con significancia estadística.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">RealTimeMetrics</h4>
                  <p className="text-gray-600">
                    Métricas en tiempo real con WebSockets y monitoreo de eventos.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">ExportManager</h4>
                  <p className="text-gray-600">
                    Gestión de exportaciones con plantillas y múltiples formatos.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Configuración</h4>
                  <p className="text-gray-600">
                    Todos los componentes soportan personalización y configuración avanzada.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsExample;
