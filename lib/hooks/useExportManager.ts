/**
 * Hook para manejo de exportaciones de datos
 * Proporciona funcionalidades para programar, gestionar y descargar exportaciones
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { AnalyticsService } from '../analytics/analytics-service';

// Interfaces
interface ExportJob {
  id: string;
  name: string;
  description: string;
  type: 'ANALYTICS' | 'USER_DATA' | 'GAMIFICATION' | 'CUSTOM';
  format: 'CSV' | 'JSON' | 'EXCEL' | 'PDF' | 'XML';
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  progress: number; // 0-100
  filters: {
    dateRange: {
      start: Date;
      end: Date;
    };
    userSegments: string[];
    dataTypes: string[];
    customFilters: Record<string, any>;
  };
  schedule: {
    frequency: 'ONE_TIME' | 'DAILY' | 'WEEKLY' | 'MONTHLY';
    nextRun?: Date;
    timezone: string;
  };
  output: {
    fileUrl?: string;
    fileSize?: number;
    recordCount?: number;
    expiresAt?: Date;
  };
  metadata: {
    createdBy: string;
    createdAt: Date;
    startedAt?: Date;
    completedAt?: Date;
    errorMessage?: string;
    processingTime?: number;
  };
}

interface ExportTemplate {
  id: string;
  name: string;
  description: string;
  type: ExportJob['type'];
  format: ExportJob['format'];
  defaultFilters: ExportJob['filters'];
  isPublic: boolean;
  isActive: boolean;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

interface ExportConfig {
  id: string;
  name: string;
  description: string;
  maxFileSize: number; // En MB
  maxRecordCount: number;
  retentionDays: number;
  compression: boolean;
  encryption: boolean;
  notifications: {
    onStart: boolean;
    onCompletion: boolean;
    onFailure: boolean;
    email: string[];
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface ExportStats {
  totalJobs: number;
  completedJobs: number;
  failedJobs: number;
  totalDataExported: number; // En MB
  averageProcessingTime: number; // En segundos
  jobsByType: Record<string, number>;
  jobsByStatus: Record<string, number>;
  recentJobs: ExportJob[];
  storageUsage: {
    used: number;
    available: number;
    percentage: number;
  };
}

interface UseExportManagerReturn {
  // Estado
  jobs: ExportJob[];
  templates: ExportTemplate[];
  configs: ExportConfig[];
  stats: ExportStats;
  loading: boolean;
  error: string | null;
  
  // Acciones de trabajos de exportación
  createExportJob: (jobData: Partial<ExportJob>) => Promise<ExportJob>;
  updateExportJob: (jobId: string, updates: Partial<ExportJob>) => Promise<void>;
  deleteExportJob: (jobId: string) => Promise<void>;
  startExportJob: (jobId: string) => Promise<void>;
  cancelExportJob: (jobId: string) => Promise<void>;
  retryExportJob: (jobId: string) => Promise<void>;
  
  // Acciones de plantillas
  createTemplate: (templateData: Partial<ExportTemplate>) => Promise<ExportTemplate>;
  updateTemplate: (templateId: string, updates: Partial<ExportTemplate>) => Promise<void>;
  deleteTemplate: (templateId: string) => Promise<void>;
  useTemplate: (templateId: string, customFilters?: any) => Promise<ExportJob>;
  
  // Acciones de configuración
  createConfig: (configData: Partial<ExportConfig>) => Promise<ExportConfig>;
  updateConfig: (configId: string, updates: Partial<ExportConfig>) => Promise<void>;
  deleteConfig: (configId: string) => Promise<void>;
  
  // Acciones de archivos
  downloadExport: (jobId: string) => Promise<void>;
  getDownloadUrl: (jobId: string) => Promise<string>;
  validateExportFile: (jobId: string) => Promise<boolean>;
  
  // Utilidades
  getJobStatus: (jobId: string) => ExportJob['status'];
  getJobProgress: (jobId: string) => number;
  getJobsByStatus: (status: ExportJob['status']) => ExportJob[];
  getJobsByType: (type: ExportJob['type']) => ExportJob[];
  getRecentJobs: (limit?: number) => ExportJob[];
  getExportStats: () => ExportStats;
  estimateExportSize: (filters: ExportJob['filters']) => Promise<number>;
  validateExportFilters: (filters: ExportJob['filters']) => boolean;
  getAvailableFormats: (type: ExportJob['type']) => ExportJob['format'][];
}

export const useExportManager = (): UseExportManagerReturn => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<ExportJob[]>([]);
  const [templates, setTemplates] = useState<ExportTemplate[]>([]);
  const [configs, setConfigs] = useState<ExportConfig[]>([]);
  const [stats, setStats] = useState<ExportStats>({
    totalJobs: 0,
    completedJobs: 0,
    failedJobs: 0,
    totalDataExported: 0,
    averageProcessingTime: 0,
    jobsByType: {},
    jobsByStatus: {},
    recentJobs: [],
    storageUsage: {
      used: 0,
      available: 1000, // 1GB por defecto
      percentage: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const analyticsService = new AnalyticsService();

  // Cargar trabajos de exportación
  const loadJobs = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const exportJobs = await analyticsService.getExportJobs(user.id);
      setJobs(exportJobs);
      
      // Calcular estadísticas
      const exportStats = calculateExportStats(exportJobs);
      setStats(exportStats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar trabajos de exportación');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Cargar plantillas
  const loadTemplates = useCallback(async () => {
    try {
      const exportTemplates = await analyticsService.getExportTemplates();
      setTemplates(exportTemplates);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar plantillas');
    }
  }, []);

  // Cargar configuraciones
  const loadConfigs = useCallback(async () => {
    try {
      const exportConfigs = await analyticsService.getExportConfigs();
      setConfigs(exportConfigs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar configuraciones');
    }
  }, []);

  // Calcular estadísticas de exportación
  const calculateExportStats = useCallback((exportJobs: ExportJob[]): ExportStats => {
    const totalJobs = exportJobs.length;
    const completedJobs = exportJobs.filter(job => job.status === 'COMPLETED').length;
    const failedJobs = exportJobs.filter(job => job.status === 'FAILED').length;
    
    const totalDataExported = exportJobs
      .filter(job => job.output.fileSize)
      .reduce((sum, job) => sum + (job.output.fileSize || 0), 0);
    
    const processingTimes = exportJobs
      .filter(job => job.metadata.processingTime)
      .map(job => job.metadata.processingTime || 0);
    
    const averageProcessingTime = processingTimes.length > 0 ? 
      processingTimes.reduce((sum, time) => sum + time, 0) / processingTimes.length : 0;
    
    const jobsByType = exportJobs.reduce((acc, job) => {
      acc[job.type] = (acc[job.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const jobsByStatus = exportJobs.reduce((acc, job) => {
      acc[job.status] = (acc[job.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const recentJobs = exportJobs
      .sort((a, b) => new Date(b.metadata.createdAt).getTime() - new Date(a.metadata.createdAt).getTime())
      .slice(0, 10);
    
    const storageUsage = {
      used: totalDataExported,
      available: 1000, // 1GB por defecto
      percentage: (totalDataExported / 1000) * 100
    };
    
    return {
      totalJobs,
      completedJobs,
      failedJobs,
      totalDataExported,
      averageProcessingTime,
      jobsByType,
      jobsByStatus,
      recentJobs,
      storageUsage
    };
  }, []);

  // Crear trabajo de exportación
  const createExportJob = useCallback(async (jobData: Partial<ExportJob>): Promise<ExportJob> => {
    if (!user?.id) throw new Error('Usuario no autenticado');
    
    try {
      setError(null);
      const newJob = await analyticsService.createExportJob(user.id, jobData);
      
      setJobs(prev => [newJob, ...prev]);
      
      // Recalcular estadísticas
      const updatedStats = calculateExportStats([newJob, ...jobs]);
      setStats(updatedStats);
      
      return newJob;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear trabajo de exportación');
      throw err;
    }
  }, [user?.id, jobs, calculateExportStats]);

  // Actualizar trabajo de exportación
  const updateExportJob = useCallback(async (jobId: string, updates: Partial<ExportJob>): Promise<void> => {
    if (!user?.id) throw new Error('Usuario no autenticado');
    
    try {
      setError(null);
      await analyticsService.updateExportJob(jobId, updates);
      
      setJobs(prev => prev.map(job => 
        job.id === jobId ? { ...job, ...updates } : job
      ));
      
      // Recalcular estadísticas
      const updatedJobs = jobs.map(job => 
        job.id === jobId ? { ...job, ...updates } : job
      );
      const updatedStats = calculateExportStats(updatedJobs);
      setStats(updatedStats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar trabajo de exportación');
      throw err;
    }
  }, [user?.id, jobs, calculateExportStats]);

  // Eliminar trabajo de exportación
  const deleteExportJob = useCallback(async (jobId: string): Promise<void> => {
    if (!user?.id) throw new Error('Usuario no autenticado');
    
    try {
      setError(null);
      await analyticsService.deleteExportJob(jobId);
      
      setJobs(prev => prev.filter(job => job.id !== jobId));
      
      // Recalcular estadísticas
      const updatedJobs = jobs.filter(job => job.id !== jobId);
      const updatedStats = calculateExportStats(updatedJobs);
      setStats(updatedStats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar trabajo de exportación');
      throw err;
    }
  }, [user?.id, jobs, calculateExportStats]);

  // Iniciar trabajo de exportación
  const startExportJob = useCallback(async (jobId: string): Promise<void> => {
    if (!user?.id) throw new Error('Usuario no autenticado');
    
    try {
      setError(null);
      await analyticsService.startExportJob(jobId);
      
      setJobs(prev => prev.map(job => 
        job.id === jobId ? {
          ...job,
          status: 'PROCESSING',
          metadata: {
            ...job.metadata,
            startedAt: new Date()
          }
        } : job
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar trabajo de exportación');
      throw err;
    }
  }, [user?.id]);

  // Cancelar trabajo de exportación
  const cancelExportJob = useCallback(async (jobId: string): Promise<void> => {
    if (!user?.id) throw new Error('Usuario no autenticado');
    
    try {
      setError(null);
      await analyticsService.cancelExportJob(jobId);
      
      setJobs(prev => prev.map(job => 
        job.id === jobId ? {
          ...job,
          status: 'CANCELLED',
          progress: 0
        } : job
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cancelar trabajo de exportación');
      throw err;
    }
  }, [user?.id]);

  // Reintentar trabajo de exportación
  const retryExportJob = useCallback(async (jobId: string): Promise<void> => {
    if (!user?.id) throw new Error('Usuario no autenticado');
    
    try {
      setError(null);
      await analyticsService.retryExportJob(jobId);
      
      setJobs(prev => prev.map(job => 
        job.id === jobId ? {
          ...job,
          status: 'PENDING',
          progress: 0,
          metadata: {
            ...job.metadata,
            errorMessage: undefined
          }
        } : job
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al reintentar trabajo de exportación');
      throw err;
    }
  }, [user?.id]);

  // Crear plantilla
  const createTemplate = useCallback(async (templateData: Partial<ExportTemplate>): Promise<ExportTemplate> => {
    if (!user?.id) throw new Error('Usuario no autenticado');
    
    try {
      setError(null);
      const newTemplate = await analyticsService.createExportTemplate(user.id, templateData);
      
      setTemplates(prev => [...prev, newTemplate]);
      return newTemplate;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear plantilla');
      throw err;
    }
  }, [user?.id]);

  // Actualizar plantilla
  const updateTemplate = useCallback(async (templateId: string, updates: Partial<ExportTemplate>): Promise<void> => {
    if (!user?.id) throw new Error('Usuario no autenticado');
    
    try {
      setError(null);
      await analyticsService.updateExportTemplate(templateId, updates);
      
      setTemplates(prev => prev.map(template => 
        template.id === templateId ? { ...template, ...updates } : template
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar plantilla');
      throw err;
    }
  }, [user?.id]);

  // Eliminar plantilla
  const deleteTemplate = useCallback(async (templateId: string): Promise<void> => {
    if (!user?.id) throw new Error('Usuario no autenticado');
    
    try {
      setError(null);
      await analyticsService.deleteExportTemplate(templateId);
      
      setTemplates(prev => prev.filter(template => template.id !== templateId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar plantilla');
      throw err;
    }
  }, [user?.id]);

  // Usar plantilla
  const useTemplate = useCallback(async (templateId: string, customFilters?: any): Promise<ExportJob> => {
    if (!user?.id) throw new Error('Usuario no autenticado');
    
    try {
      setError(null);
      const template = templates.find(t => t.id === templateId);
      if (!template) throw new Error('Plantilla no encontrada');
      
      const jobData: Partial<ExportJob> = {
        name: `Exportación desde ${template.name}`,
        description: template.description,
        type: template.type,
        format: template.format,
        filters: customFilters || template.defaultFilters,
        status: 'PENDING',
        progress: 0,
        metadata: {
          createdBy: user.id,
          createdAt: new Date()
        }
      };
      
      const newJob = await createExportJob(jobData);
      
      // Incrementar contador de uso de la plantilla
      setTemplates(prev => prev.map(t => 
        t.id === templateId ? { ...t, usageCount: t.usageCount + 1 } : t
      ));
      
      return newJob;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al usar plantilla');
      throw err;
    }
  }, [user?.id, templates, createExportJob]);

  // Crear configuración
  const createConfig = useCallback(async (configData: Partial<ExportConfig>): Promise<ExportConfig> => {
    if (!user?.id) throw new Error('Usuario no autenticado');
    
    try {
      setError(null);
      const newConfig = await analyticsService.createExportConfig(user.id, configData);
      
      setConfigs(prev => [...prev, newConfig]);
      return newConfig;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear configuración');
      throw err;
    }
  }, [user?.id]);

  // Actualizar configuración
  const updateConfig = useCallback(async (configId: string, updates: Partial<ExportConfig>): Promise<void> => {
    if (!user?.id) throw new Error('Usuario no autenticado');
    
    try {
      setError(null);
      await analyticsService.updateExportConfig(configId, updates);
      
      setConfigs(prev => prev.map(config => 
        config.id === configId ? { ...config, ...updates } : config
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar configuración');
      throw err;
    }
  }, [user?.id]);

  // Eliminar configuración
  const deleteConfig = useCallback(async (configId: string): Promise<void> => {
    if (!user?.id) throw new Error('Usuario no autenticado');
    
    try {
      setError(null);
      await analyticsService.deleteExportConfig(configId);
      
      setConfigs(prev => prev.filter(config => config.id !== configId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar configuración');
      throw err;
    }
  }, [user?.id]);

  // Descargar exportación
  const downloadExport = useCallback(async (jobId: string): Promise<void> => {
    if (!user?.id) throw new Error('Usuario no autenticado');
    
    try {
      setError(null);
      const downloadUrl = await analyticsService.getExportDownloadUrl(jobId);
      
      // Crear enlace de descarga temporal
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `export_${jobId}.${jobs.find(j => j.id === jobId)?.format.toLowerCase()}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al descargar exportación');
      throw err;
    }
  }, [user?.id, jobs]);

  // Obtener URL de descarga
  const getDownloadUrl = useCallback(async (jobId: string): Promise<string> => {
    try {
      const downloadUrl = await analyticsService.getExportDownloadUrl(jobId);
      return downloadUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al obtener URL de descarga');
      throw err;
    }
  }, []);

  // Validar archivo de exportación
  const validateExportFile = useCallback(async (jobId: string): Promise<boolean> => {
    try {
      const isValid = await analyticsService.validateExportFile(jobId);
      return isValid;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al validar archivo de exportación');
      throw err;
    }
  }, []);

  // Utilidades
  const getJobStatus = useCallback((jobId: string): ExportJob['status'] => {
    const job = jobs.find(j => j.id === jobId);
    return job?.status || 'PENDING';
  }, [jobs]);

  const getJobProgress = useCallback((jobId: string): number => {
    const job = jobs.find(j => j.id === jobId);
    return job?.progress || 0;
  }, [jobs]);

  const getJobsByStatus = useCallback((status: ExportJob['status']): ExportJob[] => {
    return jobs.filter(job => job.status === status);
  }, [jobs]);

  const getJobsByType = useCallback((type: ExportJob['type']): ExportJob[] => {
    return jobs.filter(job => job.type === type);
  }, [jobs]);

  const getRecentJobs = useCallback((limit: number = 10): ExportJob[] => {
    return jobs
      .sort((a, b) => new Date(b.metadata.createdAt).getTime() - new Date(a.metadata.createdAt).getTime())
      .slice(0, limit);
  }, [jobs]);

  const getExportStatsData = useCallback((): ExportStats => {
    return stats;
  }, [stats]);

  const estimateExportSize = useCallback(async (filters: ExportJob['filters']): Promise<number> => {
    try {
      const estimatedSize = await analyticsService.estimateExportSize(filters);
      return estimatedSize;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al estimar tamaño de exportación');
      throw err;
    }
  }, []);

  const validateExportFilters = useCallback((filters: ExportJob['filters']): boolean => {
    if (!filters.dateRange || !filters.dateRange.start || !filters.dateRange.end) {
      return false;
    }
    
    if (filters.dateRange.start > filters.dateRange.end) {
      return false;
    }
    
    return true;
  }, []);

  const getAvailableFormats = useCallback((type: ExportJob['type']): ExportJob['format'][] => {
    const formatMap: Record<ExportJob['type'], ExportJob['format'][]> = {
      ANALYTICS: ['CSV', 'JSON', 'EXCEL', 'PDF'],
      USER_DATA: ['CSV', 'JSON', 'EXCEL'],
      GAMIFICATION: ['CSV', 'JSON', 'EXCEL'],
      CUSTOM: ['CSV', 'JSON', 'EXCEL', 'XML']
    };
    
    return formatMap[type] || ['CSV', 'JSON'];
  }, []);

  // Efectos
  useEffect(() => {
    loadJobs();
    loadTemplates();
    loadConfigs();
  }, [loadJobs, loadTemplates, loadConfigs]);

  return {
    jobs,
    templates,
    configs,
    stats,
    loading,
    error,
    createExportJob,
    updateExportJob,
    deleteExportJob,
    startExportJob,
    cancelExportJob,
    retryExportJob,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    useTemplate,
    createConfig,
    updateConfig,
    deleteConfig,
    downloadExport,
    getDownloadUrl,
    validateExportFile,
    getJobStatus,
    getJobProgress,
    getJobsByStatus,
    getJobsByType,
    getRecentJobs,
    getExportStats: getExportStatsData,
    estimateExportSize,
    validateExportFilters,
    getAvailableFormats
  };
};
