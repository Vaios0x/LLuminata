'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Download,
  TrendingUp,
  TrendingDown,
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
  RefreshCw,
  Save,
  Maximize2,
  Minimize2,
  RotateCcw,
  Eye,
  MousePointer,
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
  RotateCw,
  Brain,
  Target,
  Users2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExportJob {
  id: string;
  name: string;
  description: string;
  type: 'user_data' | 'analytics' | 'reports' | 'custom';
  format: 'csv' | 'json' | 'xlsx' | 'pdf';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  size?: number;
  createdAt: Date;
  completedAt?: Date;
  downloadUrl?: string;
  filters: Record<string, any>;
  requestedBy: string;
}

interface ExportTemplate {
  id: string;
  name: string;
  description: string;
  type: string;
  format: string;
  filters: Record<string, any>;
  isDefault: boolean;
  lastUsed: Date;
  usageCount: number;
}

interface ExportSchedule {
  id: string;
  name: string;
  description: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
  nextRun: Date;
  lastRun?: Date;
  status: 'active' | 'paused' | 'error';
  recipients: string[];
  template: string;
}

export default function ExportsPage() {
  const [exportJobs, setExportJobs] = useState<ExportJob[]>([]);
  const [templates, setTemplates] = useState<ExportTemplate[]>([]);
  const [schedules, setSchedules] = useState<ExportSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'jobs' | 'templates' | 'schedules' | 'history'>('jobs');
  const [selectedFormat, setSelectedFormat] = useState<'csv' | 'json' | 'xlsx' | 'pdf'>('csv');
  const [selectedType, setSelectedType] = useState<string>('');

  // Datos de ejemplo
  const mockExportJobs: ExportJob[] = [
    {
      id: 'job_1',
      name: 'Reporte de Usuarios Mensual',
      description: 'Exportación completa de datos de usuarios del mes de enero',
      type: 'user_data',
      format: 'xlsx',
      status: 'completed',
      progress: 100,
      size: 2457600, // 2.4MB
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
      downloadUrl: '/exports/user_report_january.xlsx',
      filters: { dateRange: '2024-01-01 to 2024-01-31', includeInactive: false },
      requestedBy: 'admin@lluminata.com'
    },
    {
      id: 'job_2',
      name: 'Analytics de Engagement',
      description: 'Métricas de engagement y retención de usuarios',
      type: 'analytics',
      format: 'csv',
      status: 'processing',
      progress: 65,
      createdAt: new Date(Date.now() - 30 * 60 * 1000),
      filters: { metrics: ['engagement', 'retention', 'conversion'] },
      requestedBy: 'analyst@lluminata.com'
    },
    {
      id: 'job_3',
      name: 'Reporte de Rendimiento',
      description: 'Análisis de rendimiento del sistema',
      type: 'reports',
      format: 'pdf',
      status: 'pending',
      progress: 0,
      createdAt: new Date(),
      filters: { performanceMetrics: true, timeRange: 'last_30_days' },
      requestedBy: 'admin@lluminata.com'
    }
  ];

  const mockTemplates: ExportTemplate[] = [
    {
      id: 'template_1',
      name: 'Reporte de Usuarios Estándar',
      description: 'Plantilla para exportar datos básicos de usuarios',
      type: 'user_data',
      format: 'xlsx',
      filters: { includeInactive: false, includeSensitiveData: false },
      isDefault: true,
      lastUsed: new Date(Date.now() - 24 * 60 * 60 * 1000),
      usageCount: 45
    },
    {
      id: 'template_2',
      name: 'Analytics Completos',
      description: 'Exportación completa de métricas de analytics',
      type: 'analytics',
      format: 'csv',
      filters: { allMetrics: true, includeRawData: true },
      isDefault: false,
      lastUsed: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      usageCount: 23
    },
    {
      id: 'template_3',
      name: 'Reporte Ejecutivo',
      description: 'Resumen ejecutivo en formato PDF',
      type: 'reports',
      format: 'pdf',
      filters: { summaryOnly: true, includeCharts: true },
      isDefault: false,
      lastUsed: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      usageCount: 12
    }
  ];

  const mockSchedules: ExportSchedule[] = [
    {
      id: 'schedule_1',
      name: 'Reporte Semanal de Usuarios',
      description: 'Exportación automática semanal de datos de usuarios',
      frequency: 'weekly',
      nextRun: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      lastRun: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      status: 'active',
      recipients: ['admin@lluminata.com', 'manager@lluminata.com'],
      template: 'template_1'
    },
    {
      id: 'schedule_2',
      name: 'Analytics Mensual',
      description: 'Reporte mensual de analytics para el equipo',
      frequency: 'monthly',
      nextRun: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      lastRun: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      status: 'active',
      recipients: ['analyst@lluminata.com'],
      template: 'template_2'
    }
  ];

  useEffect(() => {
    loadExportData();
  }, []);

  const loadExportData = async () => {
    try {
      setIsLoading(true);
      // En producción, esto sería una llamada a la API
      // const response = await fetch('/api/analytics/exports');
      // const data = await response.json();
      
      // Simulando carga
      await new Promise(resolve => setTimeout(resolve, 1000));
      setExportJobs(mockExportJobs);
      setTemplates(mockTemplates);
      setSchedules(mockSchedules);
    } catch (error) {
      console.error('Error loading export data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createExportJob = async (templateId: string) => {
    try {
      // En producción, esto sería una llamada a la API
      // await fetch('/api/analytics/exports', { method: 'POST', body: JSON.stringify({ templateId }) });
      
      const template = templates.find(t => t.id === templateId);
      if (!template) return;

      const newJob: ExportJob = {
        id: `job_${Date.now()}`,
        name: `Exportación - ${template.name}`,
        description: template.description,
        type: template.type as any,
        format: template.format as any,
        status: 'pending',
        progress: 0,
        createdAt: new Date(),
        filters: template.filters,
        requestedBy: 'current_user@lluminata.com'
      };

      setExportJobs(prev => [newJob, ...prev]);
    } catch (error) {
      console.error('Error creating export job:', error);
    }
  };

  const downloadExport = async (jobId: string) => {
    try {
      // En producción, esto sería una llamada a la API
      // const response = await fetch(`/api/analytics/exports/${jobId}/download`);
      // const blob = await response.blob();
      // const url = window.URL.createObjectURL(blob);
      // const a = document.createElement('a');
      // a.href = url;
      // a.download = `export_${jobId}.${format}`;
      // a.click();
      
      console.log(`Downloading export ${jobId}`);
    } catch (error) {
      console.error('Error downloading export:', error);
    }
  };

  const getJobStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'processing': return 'text-blue-600 bg-blue-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'csv': return <FileText className="w-4 h-4" />;
      case 'json': return <Database className="w-4 h-4" />;
      case 'xlsx': return <BarChart3 className="w-4 h-4" />;
      case 'pdf': return <File className="w-4 h-4" />;
      default: return <Download className="w-4 h-4" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'user_data': return <Users className="w-4 h-4" />;
      case 'analytics': return <BarChart3 className="w-4 h-4" />;
      case 'reports': return <FileText className="w-4 h-4" />;
      case 'custom': return <Settings className="w-4 h-4" />;
      default: return <Download className="w-4 h-4" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-MX');
  };

  const formatDateTime = (date: Date) => {
    return date.toLocaleString('es-MX');
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
            <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
              <Download className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Exportaciones</h1>
              <p className="text-gray-600">Gestiona y programa exportaciones de datos y reportes</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button 
              onClick={() => loadExportData()}
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
              aria-label="Nueva exportación"
            >
              <Plus className="w-4 h-4" />
              <span>Nueva Exportación</span>
            </Button>
          </div>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Download className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium">Exportaciones Totales</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {exportJobs.length}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium">Completadas</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {exportJobs.filter(job => job.status === 'completed').length}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-yellow-600" />
                <span className="text-sm font-medium">En Proceso</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {exportJobs.filter(job => job.status === 'processing').length}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium">Programadas</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {schedules.filter(schedule => schedule.status === 'active').length}
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
              <label className="text-sm font-medium mb-2 block">Formato</label>
              <select
                value={selectedFormat}
                onChange={(e) => setSelectedFormat(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                tabIndex={0}
                aria-label="Filtrar por formato"
              >
                <option value="">Todos los formatos</option>
                <option value="csv">CSV</option>
                <option value="json">JSON</option>
                <option value="xlsx">Excel</option>
                <option value="pdf">PDF</option>
              </select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Tipo</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                tabIndex={0}
                aria-label="Filtrar por tipo"
              >
                <option value="">Todos los tipos</option>
                <option value="user_data">Datos de Usuario</option>
                <option value="analytics">Analytics</option>
                <option value="reports">Reportes</option>
                <option value="custom">Personalizado</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs de navegación */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="mb-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="jobs" tabIndex={0} aria-label="Trabajos">Trabajos</TabsTrigger>
          <TabsTrigger value="templates" tabIndex={0} aria-label="Plantillas">Plantillas</TabsTrigger>
          <TabsTrigger value="schedules" tabIndex={0} aria-label="Programaciones">Programaciones</TabsTrigger>
          <TabsTrigger value="history" tabIndex={0} aria-label="Historial">Historial</TabsTrigger>
        </TabsList>

        <TabsContent value="jobs" className="space-y-6">
          <div className="space-y-4">
            {exportJobs.map((job) => (
              <Card key={job.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {getTypeIcon(job.type)}
                      <div>
                        <h3 className="font-semibold">{job.name}</h3>
                        <p className="text-sm text-gray-600">{job.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={cn("text-xs", getJobStatusColor(job.status))}>
                        {job.status === 'completed' ? 'Completado' :
                         job.status === 'processing' ? 'Procesando' :
                         job.status === 'pending' ? 'Pendiente' : 'Fallido'}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {job.format.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <span className="text-sm text-gray-600">Creado:</span>
                      <div className="font-medium">{formatDateTime(job.createdAt)}</div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Solicitado por:</span>
                      <div className="font-medium">{job.requestedBy}</div>
                    </div>
                    {job.size && (
                      <div>
                        <span className="text-sm text-gray-600">Tamaño:</span>
                        <div className="font-medium">{formatFileSize(job.size)}</div>
                      </div>
                    )}
                  </div>
                  
                  {job.status === 'processing' && (
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Progreso</span>
                        <span>{job.progress}%</span>
                      </div>
                      <Progress value={job.progress} className="h-2" />
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center space-x-2">
                      {getFormatIcon(job.format)}
                      <span className="text-sm text-gray-600">
                        {job.filters.dateRange || 'Sin filtros de fecha'}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      {job.status === 'completed' && job.downloadUrl && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => downloadExport(job.id)}
                          tabIndex={0}
                          aria-label="Descargar exportación"
                        >
                          <Download className="w-3 h-3 mr-1" />
                          Descargar
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="outline"
                        tabIndex={0}
                        aria-label="Ver detalles del trabajo"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        Ver
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {templates.map((template) => (
              <Card key={template.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(template.type)}
                      <span>{template.name}</span>
                    </div>
                    {template.isDefault && (
                      <Badge className="text-xs bg-blue-100 text-blue-800">
                        Predeterminado
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">{template.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Formato:</span>
                      <Badge variant="outline" className="text-xs">
                        {template.format.toUpperCase()}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Usado:</span>
                      <span className="font-medium">{template.usageCount} veces</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Último uso:</span>
                      <span className="font-medium">{formatDate(template.lastUsed)}</span>
                    </div>
                    
                    <div className="flex space-x-2 pt-4 border-t">
                      <Button 
                        size="sm"
                        onClick={() => createExportJob(template.id)}
                        className="flex-1"
                        tabIndex={0}
                        aria-label="Usar plantilla"
                      >
                        <Download className="w-3 h-3 mr-1" />
                        Usar Plantilla
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        tabIndex={0}
                        aria-label="Editar plantilla"
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Editar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="schedules" className="space-y-6">
          <div className="space-y-4">
            {schedules.map((schedule) => (
              <Card key={schedule.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      <div>
                        <h3 className="font-semibold">{schedule.name}</h3>
                        <p className="text-sm text-gray-600">{schedule.description}</p>
                      </div>
                    </div>
                    <Badge className={cn(
                      "text-xs",
                      schedule.status === 'active' ? "bg-green-100 text-green-800" :
                      schedule.status === 'paused' ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"
                    )}>
                      {schedule.status === 'active' ? 'Activo' :
                       schedule.status === 'paused' ? 'Pausado' : 'Error'}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <span className="text-sm text-gray-600">Frecuencia:</span>
                      <div className="font-medium">
                        {schedule.frequency === 'daily' ? 'Diario' :
                         schedule.frequency === 'weekly' ? 'Semanal' :
                         schedule.frequency === 'monthly' ? 'Mensual' : 'Personalizado'}
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Próxima ejecución:</span>
                      <div className="font-medium">{formatDateTime(schedule.nextRun)}</div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Destinatarios:</span>
                      <div className="font-medium">{schedule.recipients.length} personas</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="text-sm text-gray-600">
                      Última ejecución: {schedule.lastRun ? formatDateTime(schedule.lastRun) : 'Nunca'}
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        tabIndex={0}
                        aria-label="Ejecutar ahora"
                      >
                        <Play className="w-3 h-3 mr-1" />
                        Ejecutar Ahora
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        tabIndex={0}
                        aria-label="Editar programación"
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Editar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Exportaciones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {exportJobs
                  .filter(job => job.status === 'completed')
                  .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
                  .slice(0, 10)
                  .map((job) => (
                    <div key={job.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getFormatIcon(job.format)}
                        <div>
                          <div className="font-medium">{job.name}</div>
                          <div className="text-sm text-gray-600">
                            {formatDateTime(job.createdAt)} • {formatFileSize(job.size || 0)}
                          </div>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => downloadExport(job.id)}
                        tabIndex={0}
                        aria-label="Descargar exportación"
                      >
                        <Download className="w-3 h-3 mr-1" />
                        Descargar
                      </Button>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
