import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';

interface LMSConnection {
  id: string;
  institutionId: string;
  name: string;
  type: string;
  config: any;
  status: 'active' | 'inactive' | 'error';
  lastSync: Date;
  syncStatus: 'idle' | 'syncing' | 'error';
  errorMessage?: string;
}

interface LMSSyncResult {
  success: boolean;
  syncedUsers: number;
  syncedCourses: number;
  syncedGrades: number;
  errors: string[];
  warnings: string[];
}

interface LMSGrade {
  id: string;
  connectionId: string;
  userId: string;
  moduleId: string;
  score: number;
  maxScore: number;
  percentage: number;
  feedback?: string;
  submittedAt: Date;
  gradedAt?: Date;
  lastSync: Date;
}

interface ExternalContent {
  id: string;
  source: string;
  externalId: string;
  title: string;
  description?: string;
  type: string;
  url?: string;
  metadata?: any;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface VideoConference {
  id: string;
  platform: string;
  meetingId: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime?: Date;
  hostId: string;
  participants?: any;
  recordingUrl?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  users: Array<{
    id: string;
    name: string;
    email: string;
  }>;
}

export const useLMSIntegration = () => {
  const { user } = useAuth();
  const [connections, setConnections] = useState<LMSConnection[]>([]);
  const [syncStatus, setSyncStatus] = useState<LMSSyncResult | null>(null);
  const [grades, setGrades] = useState<LMSGrade[]>([]);
  const [externalContent, setExternalContent] = useState<ExternalContent[]>([]);
  const [videoConferences, setVideoConferences] = useState<VideoConference[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar conexiones LMS
  const loadConnections = useCallback(async () => {
    if (!user || user.role !== 'ADMIN') return;

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/lms/connections');
      const data = await response.json();
      
      if (data.success) {
        setConnections(data.connections);
      } else {
        setError(data.error || 'Error al cargar conexiones');
      }
    } catch (err) {
      setError('Error de conexión al cargar conexiones LMS');
      console.error('Error loading LMS connections:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Sincronizar con LMS
  const syncWithLMS = useCallback(async (connectionId: string) => {
    if (!user || user.role !== 'ADMIN') return;

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/lms/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connectionId })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSyncStatus(data.result);
        await loadConnections(); // Recargar estado
        return data.result;
      } else {
        setError(data.error || 'Error en la sincronización');
        return null;
      }
    } catch (err) {
      setError('Error de conexión durante la sincronización');
      console.error('Error syncing with LMS:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, loadConnections]);

  // Cargar calificaciones
  const loadGrades = useCallback(async (connectionId?: string) => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      
      const url = connectionId 
        ? `/api/lms/grades?connectionId=${connectionId}`
        : '/api/lms/grades';
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setGrades(data.grades);
      } else {
        setError(data.error || 'Error al cargar calificaciones');
      }
    } catch (err) {
      setError('Error de conexión al cargar calificaciones');
      console.error('Error loading grades:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Exportar calificaciones
  const exportGrades = useCallback(async (connectionId: string, grades: any[], courseId?: string) => {
    if (!user || user.role !== 'TEACHER') return false;

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/lms/grades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connectionId, grades, courseId })
      });
      
      const data = await response.json();
      
      if (data.success) {
        return true;
      } else {
        setError(data.error || 'Error al exportar calificaciones');
        return false;
      }
    } catch (err) {
      setError('Error de conexión al exportar calificaciones');
      console.error('Error exporting grades:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Cargar contenido externo
  const loadExternalContent = useCallback(async (filters?: {
    source?: string;
    type?: string;
    lessonId?: string;
    assessmentId?: string;
  }) => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (filters?.source) params.append('source', filters.source);
      if (filters?.type) params.append('type', filters.type);
      if (filters?.lessonId) params.append('lessonId', filters.lessonId);
      if (filters?.assessmentId) params.append('assessmentId', filters.assessmentId);
      
      const url = `/api/external-content${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setExternalContent(data.content);
      } else {
        setError(data.error || 'Error al cargar contenido externo');
      }
    } catch (err) {
      setError('Error de conexión al cargar contenido externo');
      console.error('Error loading external content:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Crear contenido externo
  const createExternalContent = useCallback(async (content: {
    source: string;
    externalId: string;
    title: string;
    description?: string;
    type: string;
    url?: string;
    metadata?: any;
    lessonId?: string;
    assessmentId?: string;
    integrationType?: string;
  }) => {
    if (!user || user.role !== 'TEACHER') return null;

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/external-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(content)
      });
      
      const data = await response.json();
      
      if (data.success) {
        await loadExternalContent(); // Recargar lista
        return data.content;
      } else {
        setError(data.error || 'Error al crear contenido externo');
        return null;
      }
    } catch (err) {
      setError('Error de conexión al crear contenido externo');
      console.error('Error creating external content:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, loadExternalContent]);

  // Cargar videoconferencias
  const loadVideoConferences = useCallback(async (filters?: {
    platform?: string;
    hostId?: string;
    isActive?: boolean;
  }) => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (filters?.platform) params.append('platform', filters.platform);
      if (filters?.hostId) params.append('hostId', filters.hostId);
      if (filters?.isActive !== undefined) params.append('isActive', filters.isActive.toString());
      
      const url = `/api/video-conferences${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setVideoConferences(data.conferences);
      } else {
        setError(data.error || 'Error al cargar videoconferencias');
      }
    } catch (err) {
      setError('Error de conexión al cargar videoconferencias');
      console.error('Error loading video conferences:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Crear videoconferencia
  const createVideoConference = useCallback(async (conference: {
    platform: string;
    meetingId: string;
    title: string;
    description?: string;
    startTime: string;
    endTime?: string;
    participants?: string[];
  }) => {
    if (!user || user.role !== 'TEACHER') return null;

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/video-conferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(conference)
      });
      
      const data = await response.json();
      
      if (data.success) {
        await loadVideoConferences(); // Recargar lista
        return data.conference;
      } else {
        setError(data.error || 'Error al crear videoconferencia');
        return null;
      }
    } catch (err) {
      setError('Error de conexión al crear videoconferencia');
      console.error('Error creating video conference:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, loadVideoConferences]);

  // Unirse a videoconferencia
  const joinVideoConference = useCallback(async (conferenceId: string) => {
    if (!user) return false;

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/video-conferences?id=${conferenceId}&action=join`, {
        method: 'POST'
      });
      
      const data = await response.json();
      
      if (data.success) {
        await loadVideoConferences(); // Recargar lista
        return true;
      } else {
        setError(data.error || 'Error al unirse a la videoconferencia');
        return false;
      }
    } catch (err) {
      setError('Error de conexión al unirse a la videoconferencia');
      console.error('Error joining video conference:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, loadVideoConferences]);

  // Salir de videoconferencia
  const leaveVideoConference = useCallback(async (conferenceId: string) => {
    if (!user) return false;

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/video-conferences?id=${conferenceId}&action=leave`, {
        method: 'POST'
      });
      
      const data = await response.json();
      
      if (data.success) {
        await loadVideoConferences(); // Recargar lista
        return true;
      } else {
        setError(data.error || 'Error al salir de la videoconferencia');
        return false;
      }
    } catch (err) {
      setError('Error de conexión al salir de la videoconferencia');
      console.error('Error leaving video conference:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, loadVideoConferences]);

  // Limpiar error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Cargar datos iniciales
  useEffect(() => {
    if (user) {
      loadConnections();
      loadExternalContent();
      loadVideoConferences();
    }
  }, [user, loadConnections, loadExternalContent, loadVideoConferences]);

  return {
    // Estado
    connections,
    syncStatus,
    grades,
    externalContent,
    videoConferences,
    loading,
    error,
    
    // Acciones LMS
    loadConnections,
    syncWithLMS,
    loadGrades,
    exportGrades,
    
    // Acciones de contenido externo
    loadExternalContent,
    createExternalContent,
    
    // Acciones de videoconferencias
    loadVideoConferences,
    createVideoConference,
    joinVideoConference,
    leaveVideoConference,
    
    // Utilidades
    clearError,
    
    // Información del usuario
    canManageLMS: user?.role === 'ADMIN',
    canCreateContent: user?.role === 'TEACHER',
    canCreateConferences: user?.role === 'TEACHER'
  };
};
