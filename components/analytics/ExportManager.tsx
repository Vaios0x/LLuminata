'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Download, 
  FileText, 
  FileSpreadsheet,
  FilePieChart,
  FileBarChart,
  FileImage,
  FileArchive,
  FileCode,
  FileX,
  FileCheck,
  FileClock,
  FileAlert,
  FileSearch,
  FileSettings,
  FilePlus,
  FileMinus,
  FileEdit,
  FileTrash2,
  FileCopy,
  FileExternalLink,
  FileLink,
  FileUnlink,
  FileLock,
  FileUnlock,
  FileShield,
  FileKey,
  FileBell,
  FileMail,
  FilePhone,
  FileVideo,
  FileImage as FileImageIcon,
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
  Minus as MinusIcon,
  Calendar,
  Clock,
  Users,
  Activity,
  TrendingUp,
  TrendingDown,
  Target,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  HelpCircle,
  RefreshCw,
  Save,
  Settings,
  Eye,
  EyeOff,
  BarChart3,
  LineChart,
  PieChart,
  AreaChart,
  Scatter,
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
  MapPin
} from 'lucide-react';
import { format, parseISO, subDays, startOfDay, endOfDay } from 'date-fns';
import { es } from 'date-fns/locale';

interface ExportJob {
  id: string;
  name: string;
  description: string;
  type: 'analytics' | 'reports' | 'data' | 'custom';
  format: 'csv' | 'json' | 'pdf' | 'excel' | 'xml' | 'zip';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  size?: number; // Tamaño del archivo en bytes
  url?: string; // URL de descarga
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  expiresAt?: string;
  filters: ExportFilters;
  metadata?: Record<string, any>;
}

interface ExportFilters {
  dateRange: {
    start: Date;
    end: Date;
  };
  categories: string[];
  metrics: string[];
  users?: string[];
  includeCharts: boolean;
  includeRawData: boolean;
  compression: boolean;
  password?: string;
}

interface ExportTemplate {
  id: string;
  name: string;
  description: string;
  type: string;
  format: string;
  filters: ExportFilters;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ExportManagerProps {
  userId?: string;
  className?: string;
  refreshInterval?: number;
  onExportComplete?: (job: ExportJob) => void;
  onExportError?: (job: ExportJob, error: string) => void;
  onTemplateSave?: (template: ExportTemplate) => void;
  onTemplateDelete?: (templateId: string) => void;
}

export const ExportManager: React.FC<ExportManagerProps> = ({
  userId,
  className = '',
  refreshInterval = 30000,
  onExportComplete,
  onExportError,
  onTemplateSave,
  onTemplateDelete
}) => {
  const [jobs, setJobs] = useState<ExportJob[]>([]);
  const [templates, setTemplates] = useState<ExportTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('jobs');
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [showCompleted, setShowCompleted] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [newExport, setNewExport] = useState<Partial<ExportJob> | null>(null);

  const loadExportData = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        userId: userId || ''
      });

      const response = await fetch(`/api/analytics/exports?${params}`);
      
      if (!response.ok) {
        throw new Error('Error cargando datos de exportación');
      }

      const data = await response.json();
      setJobs(data.jobs || []);
      setTemplates(data.templates || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const createExportJob = async (exportData: Partial<ExportJob>) => {
    try {
      const response = await fetch('/api/analytics/exports/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...exportData, userId })
      });

      if (response.ok) {
        const newJob = await response.json();
        setJobs(prev => [newJob, ...prev]);
        setNewExport(null);
        return newJob;
      } else {
        throw new Error('Error creando trabajo de exportación');
      }
    } catch (err) {
      console.error('Error creating export job:', err);
      throw err;
    }
  };

  const cancelExportJob = async (jobId: string) => {
    try {
      const response = await fetch(`/api/analytics/exports/${jobId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });

      if (response.ok) {
        setJobs(prev => prev.map(job => 
          job.id === jobId 
            ? { ...job, status: 'cancelled' as const }
            : job
        ));
      } else {
        throw new Error('Error cancelando trabajo de exportación');
      }
    } catch (err) {
      console.error('Error cancelling export job:', err);
    }
  };

  const downloadExport = async (jobId: string) => {
    try {
      const response = await fetch(`/api/analytics/exports/${jobId}/download`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `export-${jobId}.${jobs.find(j => j.id === jobId)?.format}`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        throw new Error('Error descargando archivo');
      }
    } catch (err) {
      console.error('Error downloading export:', err);
    }
  };

  const saveTemplate = async (template: ExportTemplate) => {
    try {
      const response = await fetch('/api/analytics/exports/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...template, userId })
      });

      if (response.ok) {
        const savedTemplate = await response.json();
        setTemplates(prev => {
          const existing = prev.find(t => t.id === savedTemplate.id);
          if (existing) {
            return prev.map(t => t.id === savedTemplate.id ? savedTemplate : t);
          }
          return [savedTemplate, ...prev];
        });
        
        if (onTemplateSave) {
          onTemplateSave(savedTemplate);
        }
        return savedTemplate;
      } else {
        throw new Error('Error guardando plantilla');
      }
    } catch (err) {
      console.error('Error saving template:', err);
      throw err;
    }
  };

  const deleteTemplate = async (templateId: string) => {
    try {
      const response = await fetch(`/api/analytics/exports/templates/${templateId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });

      if (response.ok) {
        setTemplates(prev => prev.filter(t => t.id !== templateId));
        
        if (onTemplateDelete) {
          onTemplateDelete(templateId);
        }
      } else {
        throw new Error('Error eliminando plantilla');
      }
    } catch (err) {
      console.error('Error deleting template:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <FileClock className="w-4 h-4" />;
      case 'processing': return <FileSettings className="w-4 h-4" />;
      case 'completed': return <FileCheck className="w-4 h-4" />;
      case 'failed': return <FileX className="w-4 h-4" />;
      case 'cancelled': return <FileMinus className="w-4 h-4" />;
      default: return <File className="w-4 h-4" />;
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'csv': return <FileSpreadsheet className="w-4 h-4" />;
      case 'json': return <FileCode className="w-4 h-4" />;
      case 'pdf': return <FileText className="w-4 h-4" />;
      case 'excel': return <FileSpreadsheet className="w-4 h-4" />;
      case 'xml': return <FileCode className="w-4 h-4" />;
      case 'zip': return <FileArchive className="w-4 h-4" />;
      default: return <File className="w-4 h-4" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'analytics': return <BarChart3 className="w-4 h-4" />;
      case 'reports': return <FileText className="w-4 h-4" />;
      case 'data': return <Database className="w-4 h-4" />;
      case 'custom': return <FileSettings className="w-4 h-4" />;
      default: return <File className="w-4 h-4" />;
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredJobs = useMemo(() => {
    if (showCompleted) return jobs;
    return jobs.filter(job => job.status !== 'completed');
  }, [jobs, showCompleted]);

  const pendingJobs = useMemo(() => {
    return jobs.filter(job => job.status === 'pending' || job.status === 'processing');
  }, [jobs]);

  const completedJobs = useMemo(() => {
    return jobs.filter(job => job.status === 'completed');
  }, [jobs]);

  const failedJobs = useMemo(() => {
    return jobs.filter(job => job.status === 'failed');
  }, [jobs]);

  useEffect(() => {
    loadExportData();
    
    if (autoRefresh) {
      const interval = setInterval(loadExportData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [loadExportData, autoRefresh, refreshInterval]);

  if (loading) {
    return (
      <Card className={`${className} ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
        <CardContent className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" 
               role="status" 
               aria-label="Cargando gestor de exportaciones">
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
            <Button onClick={loadExportData} className="mt-4">
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
            <Download className="w-5 h-5" />
            <CardTitle>Gestor de Exportaciones</CardTitle>
            <Badge variant="outline" className="ml-2">
              {jobs.length} trabajos
            </Badge>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCompleted(!showCompleted)}
              aria-label={showCompleted ? 'Ocultar completados' : 'Mostrar completados'}
            >
              {showCompleted ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              Completados
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
              variant="default"
              size="sm"
              onClick={() => setNewExport({})}
            >
              <FilePlus className="w-4 h-4 mr-1" />
              Nueva Exportación
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
                <FileClock className="w-4 h-4 text-yellow-600" />
                <div>
                  <p className="text-sm text-gray-600">Pendientes</p>
                  <p className="text-lg font-semibold">{pendingJobs.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <FileCheck className="w-4 h-4 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Completados</p>
                  <p className="text-lg font-semibold">{completedJobs.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <FileX className="w-4 h-4 text-red-600" />
                <div>
                  <p className="text-sm text-gray-600">Fallidos</p>
                  <p className="text-lg font-semibold">{failedJobs.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Plantillas</p>
                  <p className="text-lg font-semibold">{templates.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs principales */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="jobs">Trabajos</TabsTrigger>
            <TabsTrigger value="templates">Plantillas</TabsTrigger>
            <TabsTrigger value="new">Nueva Exportación</TabsTrigger>
          </TabsList>

          <TabsContent value="jobs" className="space-y-4">
            {filteredJobs.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Download className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600">No hay trabajos de exportación</h3>
                  <p className="text-gray-500">Crea una nueva exportación para comenzar</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredJobs.map((job) => (
                  <Card key={job.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getTypeIcon(job.type)}
                          <CardTitle className="text-lg">{job.name}</CardTitle>
                          <Badge className={getStatusColor(job.status)}>
                            {job.status.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getFormatIcon(job.format)}
                          <span className="text-sm text-gray-600">{job.format.toUpperCase()}</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-gray-600">{job.description}</p>
                      
                      {/* Progreso */}
                      {job.status === 'processing' && (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600">Progreso</span>
                            <span className="text-sm font-medium">{job.progress}%</span>
                          </div>
                          <Progress value={job.progress} className="h-2" />
                        </div>
                      )}

                      {/* Información del trabajo */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Creado:</span>
                          <p className="font-medium">{format(parseISO(job.createdAt), 'dd/MM/yyyy HH:mm')}</p>
                        </div>
                        {job.startedAt && (
                          <div>
                            <span className="text-gray-600">Iniciado:</span>
                            <p className="font-medium">{format(parseISO(job.startedAt), 'dd/MM/yyyy HH:mm')}</p>
                          </div>
                        )}
                        {job.completedAt && (
                          <div>
                            <span className="text-gray-600">Completado:</span>
                            <p className="font-medium">{format(parseISO(job.completedAt), 'dd/MM/yyyy HH:mm')}</p>
                          </div>
                        )}
                        {job.size && (
                          <div>
                            <span className="text-gray-600">Tamaño:</span>
                            <p className="font-medium">{formatFileSize(job.size)}</p>
                          </div>
                        )}
                      </div>

                      {/* Filtros aplicados */}
                      <div className="text-sm text-gray-600">
                        <p className="font-medium mb-1">Filtros aplicados:</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          <span>Rango: {format(job.filters.dateRange.start, 'dd/MM')} - {format(job.filters.dateRange.end, 'dd/MM')}</span>
                          <span>Categorías: {job.filters.categories.length}</span>
                          <span>Métricas: {job.filters.metrics.length}</span>
                          <span>Charts: {job.filters.includeCharts ? 'Sí' : 'No'}</span>
                        </div>
                      </div>

                      {/* Acciones */}
                      <div className="flex items-center space-x-2">
                        {job.status === 'completed' && job.url && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => downloadExport(job.id)}
                          >
                            <Download className="w-4 h-4 mr-1" />
                            Descargar
                          </Button>
                        )}
                        {(job.status === 'pending' || job.status === 'processing') && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => cancelExportJob(job.id)}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Cancelar
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedJob(job.id)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Ver Detalles
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="templates" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Plantillas de Exportación</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {/* Lógica para crear nueva plantilla */}}
              >
                <FilePlus className="w-4 h-4 mr-1" />
                Nueva Plantilla
              </Button>
            </div>

            {templates.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600">No hay plantillas</h3>
                  <p className="text-gray-500">Crea plantillas para reutilizar configuraciones de exportación</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map((template) => (
                  <Card key={template.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        {template.isDefault && (
                          <Badge className="bg-blue-100 text-blue-800">
                            Predeterminada
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-gray-600">{template.description}</p>
                      
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        {getTypeIcon(template.type)}
                        <span>{template.type}</span>
                        <span>•</span>
                        {getFormatIcon(template.format)}
                        <span>{template.format.toUpperCase()}</span>
                      </div>

                      <div className="text-xs text-gray-500">
                        <p>Creado: {format(parseISO(template.createdAt), 'dd/MM/yyyy')}</p>
                        <p>Actualizado: {format(parseISO(template.updatedAt), 'dd/MM/yyyy')}</p>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button
                          variant="default"
                          size="sm"
                          className="flex-1"
                          onClick={() => {
                            setNewExport({
                              name: template.name,
                              description: template.description,
                              type: template.type as any,
                              format: template.format as any,
                              filters: template.filters
                            });
                            setActiveTab('new');
                          }}
                        >
                          <Play className="w-4 h-4 mr-1" />
                          Usar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {/* Lógica para editar plantilla */}}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteTemplate(template.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="new" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Nueva Exportación</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Configuración básica */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Nombre de la exportación</label>
                    <input
                      type="text"
                      placeholder="Mi exportación"
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Descripción</label>
                    <input
                      type="text"
                      placeholder="Descripción opcional"
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Tipo de exportación</label>
                    <select className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="analytics">Analytics</option>
                      <option value="reports">Reportes</option>
                      <option value="data">Datos</option>
                      <option value="custom">Personalizado</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Formato</label>
                    <select className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="csv">CSV</option>
                      <option value="json">JSON</option>
                      <option value="pdf">PDF</option>
                      <option value="excel">Excel</option>
                      <option value="xml">XML</option>
                      <option value="zip">ZIP</option>
                    </select>
                  </div>
                </div>

                {/* Filtros */}
                <div className="space-y-4">
                  <h4 className="font-medium">Filtros</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Fecha de inicio</label>
                      <input
                        type="date"
                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Fecha de fin</label>
                      <input
                        type="date"
                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Categorías</label>
                      <select multiple className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="users">Usuarios</option>
                        <option value="engagement">Engagement</option>
                        <option value="performance">Rendimiento</option>
                        <option value="errors">Errores</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Métricas</label>
                      <select multiple className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="conversions">Conversiones</option>
                        <option value="revenue">Ingresos</option>
                        <option value="sessions">Sesiones</option>
                        <option value="pageviews">Vistas de página</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="includeCharts" className="rounded" />
                      <label htmlFor="includeCharts" className="text-sm">Incluir gráficos</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="includeRawData" className="rounded" />
                      <label htmlFor="includeRawData" className="text-sm">Incluir datos raw</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="compression" className="rounded" />
                      <label htmlFor="compression" className="text-sm">Comprimir</label>
                    </div>
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => {/* Lógica para guardar como plantilla */}}
                    >
                      <Save className="w-4 h-4 mr-1" />
                      Guardar como Plantilla
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setNewExport(null)}
                    >
                      Cancelar
                    </Button>
                  </div>
                  <Button
                    variant="default"
                    onClick={() => {/* Lógica para crear exportación */}}
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Crear Exportación
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ExportManager;
