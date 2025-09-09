'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  RefreshCw,
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Database, 
  Upload, 
  Download,
  Cloud,
  CloudOff,
  Wifi,
  WifiOff,
  Settings,
  Info,
  FileText,
  ImageIcon,
  VideoIcon,
  Volume2,
  Users,
  Calendar,
  ChevronDown,
  ChevronUp,
  Eye,
  Palette,
  Zap,
  Sparkles,
  Trash2,
  RotateCcw,
  Play,
  Pause,
  Square,
  Timer,
  History,
  TrendingUp,
  TrendingDown,
  Activity,
  Shield,
  Lock,
  Unlock,
  Key,
  Server,
  Network,
  Globe,
  HardDrive,
  Archive,
  FolderOpen,
  FileCheck,
  FileX,
  FileClock
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useScreenReader } from '@/components/accessibility/screen-reader';
import { useHighContrast } from '@/components/accessibility/high-contrast';

interface SyncItem {
  id: string;
  type: 'lesson' | 'quiz' | 'progress' | 'user_data' | 'media' | 'settings';
  title: string;
  size: number;
  lastModified: Date;
  status: 'pending_upload' | 'pending_download' | 'synced' | 'error' | 'conflict';
  priority: 'low' | 'medium' | 'high' | 'critical';
  retryCount: number;
  errorMessage?: string;
  culturalContext?: string;
  accessibility: string[];
}

interface SyncQueue {
  uploads: SyncItem[];
  downloads: SyncItem[];
  conflicts: SyncItem[];
  errors: SyncItem[];
}

interface SyncStats {
  totalItems: number;
  syncedItems: number;
  pendingItems: number;
  errorItems: number;
  conflictItems: number;
  lastSyncTime: Date;
  nextSyncTime: Date;
  syncDuration: number; // en segundos
  bandwidthUsed: number; // en bytes
  successRate: number; // porcentaje
}

interface SyncSettings {
  autoSync: boolean;
  syncInterval: number; // en minutos
  maxRetries: number;
  conflictResolution: 'server_wins' | 'client_wins' | 'manual';
  bandwidthLimit: number; // en bytes por segundo
  priorityItems: string[];
  excludedTypes: string[];
  culturalPreferences: string[];
  accessibilityFeatures: string[];
}

interface SyncManagerProps {
  onSyncComplete?: (stats: SyncStats) => void;
  onSyncError?: (error: string) => void;
  onConflictResolved?: (itemId: string, resolution: string) => void;
  className?: string;
}

export default function SyncManager({
  onSyncComplete,
  onSyncError,
  onConflictResolved,
  className = ''
}: SyncManagerProps) {
  const { user } = useAuth();
  const { speak, isEnabled: screenReaderEnabled } = useScreenReader();
  const { getStyles } = useHighContrast();

  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncQueue, setSyncQueue] = useState<SyncQueue>({
    uploads: [],
    downloads: [],
    conflicts: [],
    errors: []
  });
  const [syncStats, setSyncStats] = useState<SyncStats>({
    totalItems: 0,
    syncedItems: 0,
    pendingItems: 0,
    errorItems: 0,
    conflictItems: 0,
    lastSyncTime: new Date(),
    nextSyncTime: new Date(Date.now() + 30 * 60 * 1000), // 30 minutos
    syncDuration: 0,
    bandwidthUsed: 0,
    successRate: 0
  });
  const [syncSettings, setSyncSettings] = useState<SyncSettings>({
    autoSync: true,
    syncInterval: 30,
    maxRetries: 3,
    conflictResolution: 'server_wins',
    bandwidthLimit: 1024 * 1024, // 1MB/s
    priorityItems: ['progress', 'user_data'],
    excludedTypes: [],
    culturalPreferences: ['maya', 'nahuatl'],
    accessibilityFeatures: ['screenReader', 'highContrast']
  });
  const [showDetails, setShowDetails] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedView, setSelectedView] = useState<'queue' | 'stats' | 'history'>('queue');
  const [syncHistory, setSyncHistory] = useState<any[]>([]);

  useEffect(() => {
    checkOnlineStatus();
    loadSyncQueue();
    loadSyncStats();
    loadSyncHistory();
    
    // Configurar auto-sync si está habilitado
    if (syncSettings.autoSync) {
      const interval = setInterval(() => {
        if (isOnline && !isSyncing) {
          handleAutoSync();
        }
      }, syncSettings.syncInterval * 60 * 1000);
      
      return () => clearInterval(interval);
    }
  }, [syncSettings.autoSync, syncSettings.syncInterval, isOnline, isSyncing]);

  useEffect(() => {
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const checkOnlineStatus = () => {
    setIsOnline(navigator.onLine);
  };

  const handleOnline = () => {
    setIsOnline(true);
    if (screenReaderEnabled) {
      speak('Conexión restaurada, sincronización disponible');
    }
  };

  const handleOffline = () => {
    setIsOnline(false);
    if (screenReaderEnabled) {
      speak('Conexión perdida, sincronización pausada');
    }
  };

  const loadSyncQueue = async () => {
    try {
      // En producción, esto vendría de IndexedDB
      const mockQueue: SyncQueue = {
        uploads: [
          {
            id: 'progress-1',
            type: 'progress',
            title: 'Progreso de Lección Maya',
            size: 2048,
            lastModified: new Date('2024-01-15T14:30:00'),
            status: 'pending_upload',
            priority: 'high',
            retryCount: 0,
            culturalContext: 'maya',
            accessibility: ['screenReader']
          },
          {
            id: 'user-data-1',
            type: 'user_data',
            title: 'Preferencias de Usuario',
            size: 1024,
            lastModified: new Date('2024-01-15T14:25:00'),
            status: 'pending_upload',
            priority: 'medium',
            retryCount: 0,
            accessibility: ['highContrast']
          }
        ],
        downloads: [
          {
            id: 'lesson-2',
            type: 'lesson',
            title: 'Nueva Lección: Astronomía Maya',
            size: 5242880,
            lastModified: new Date('2024-01-15T12:00:00'),
            status: 'pending_download',
            priority: 'medium',
            retryCount: 0,
            culturalContext: 'maya',
            accessibility: ['screenReader', 'subtitles']
          }
        ],
        conflicts: [
          {
            id: 'quiz-1',
            type: 'quiz',
            title: 'Evaluación Maya - Conflicto',
            size: 512000,
            lastModified: new Date('2024-01-15T13:00:00'),
            status: 'conflict',
            priority: 'high',
            retryCount: 2,
            errorMessage: 'Versiones diferentes en servidor y cliente',
            culturalContext: 'maya',
            accessibility: ['keyboardNavigation']
          }
        ],
        errors: [
          {
            id: 'media-1',
            type: 'media',
            title: 'Video Maya - Error de Sincronización',
            size: 20971520,
            lastModified: new Date('2024-01-15T10:00:00'),
            status: 'error',
            priority: 'low',
            retryCount: 3,
            errorMessage: 'Archivo demasiado grande para sincronización',
            culturalContext: 'maya',
            accessibility: ['subtitles', 'audioDescription']
          }
        ]
      };

      setSyncQueue(mockQueue);
    } catch (error) {
      console.error('Error cargando cola de sincronización:', error);
    }
  };

  const loadSyncStats = async () => {
    try {
      const mockStats: SyncStats = {
        totalItems: 15,
        syncedItems: 12,
        pendingItems: 3,
        errorItems: 1,
        conflictItems: 1,
        lastSyncTime: new Date('2024-01-15T14:00:00'),
        nextSyncTime: new Date('2024-01-15T14:30:00'),
        syncDuration: 45,
        bandwidthUsed: 10485760, // 10MB
        successRate: 80
      };

      setSyncStats(mockStats);
    } catch (error) {
      console.error('Error cargando estadísticas de sincronización:', error);
    }
  };

  const loadSyncHistory = async () => {
    try {
      const mockHistory = [
        {
          id: '1',
          timestamp: new Date('2024-01-15T14:00:00'),
          type: 'full_sync',
          status: 'success',
          itemsProcessed: 15,
          duration: 45,
          bandwidthUsed: 10485760
        },
        {
          id: '2',
          timestamp: new Date('2024-01-15T13:30:00'),
          type: 'incremental',
          status: 'partial',
          itemsProcessed: 3,
          duration: 12,
          bandwidthUsed: 2097152
        },
        {
          id: '3',
          timestamp: new Date('2024-01-15T13:00:00'),
          type: 'full_sync',
          status: 'error',
          itemsProcessed: 8,
          duration: 30,
          bandwidthUsed: 5242880,
          error: 'Error de conexión'
        }
      ];

      setSyncHistory(mockHistory);
    } catch (error) {
      console.error('Error cargando historial de sincronización:', error);
    }
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    const startTime = Date.now();
    
    try {
      // Simular proceso de sincronización
      await simulateSyncProcess();
      
      const endTime = Date.now();
      const duration = Math.round((endTime - startTime) / 1000);
      
      setSyncStats(prev => ({
        ...prev,
        lastSyncTime: new Date(),
        nextSyncTime: new Date(Date.now() + syncSettings.syncInterval * 60 * 1000),
        syncDuration: duration,
        successRate: 95
      }));

      onSyncComplete?.(syncStats);
      
      if (screenReaderEnabled) {
        speak('Sincronización manual completada');
      }
    } catch (error) {
      console.error('Error durante sincronización manual:', error);
      onSyncError?.(error as string);
      
      if (screenReaderEnabled) {
        speak('Error durante la sincronización manual');
      }
    } finally {
      setIsSyncing(false);
    }
  };

  const handleAutoSync = async () => {
    if (!isOnline || isSyncing) return;
    
    setIsSyncing(true);
    try {
      await simulateSyncProcess();
      
      setSyncStats(prev => ({
        ...prev,
        lastSyncTime: new Date(),
        nextSyncTime: new Date(Date.now() + syncSettings.syncInterval * 60 * 1000)
      }));
    } catch (error) {
      console.error('Error durante auto-sincronización:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const simulateSyncProcess = async () => {
    // Simular proceso de sincronización con progreso
    const steps = [
      { name: 'Verificando conectividad', duration: 1000 },
      { name: 'Preparando datos', duration: 2000 },
      { name: 'Sincronizando progreso', duration: 3000 },
      { name: 'Sincronizando lecciones', duration: 4000 },
      { name: 'Resolviendo conflictos', duration: 2000 },
      { name: 'Finalizando', duration: 1000 }
    ];

    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, step.duration));
    }
  };

  const handleConflictResolution = (itemId: string, resolution: 'server_wins' | 'client_wins') => {
    // Simular resolución de conflicto
    setSyncQueue(prev => ({
      ...prev,
      conflicts: prev.conflicts.filter(item => item.id !== itemId),
      uploads: resolution === 'client_wins' 
        ? [...prev.uploads, prev.conflicts.find(item => item.id === itemId)!]
        : prev.uploads
    }));

    onConflictResolved?.(itemId, resolution);
    
    if (screenReaderEnabled) {
      speak(`Conflicto resuelto: ${resolution === 'server_wins' ? 'servidor' : 'cliente'}`);
    }
  };

  const handleRetryItem = (itemId: string) => {
    // Simular reintento de sincronización
    setSyncQueue(prev => ({
      ...prev,
      errors: prev.errors.map(item => 
        item.id === itemId 
          ? { ...item, retryCount: item.retryCount + 1, status: 'pending_upload' as any }
          : item
      )
    }));
    
    if (screenReaderEnabled) {
      speak('Reintentando sincronización del elemento');
    }
  };

  const handleCancelSync = () => {
    setIsSyncing(false);
    if (screenReaderEnabled) {
      speak('Sincronización cancelada');
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusColor = (status: string): string => {
    const colors: { [key: string]: string } = {
      'pending_upload': 'blue',
      'pending_download': 'green',
      'synced': 'green',
      'error': 'red',
      'conflict': 'yellow'
    };
    return colors[status] || 'gray';
  };

  const getPriorityColor = (priority: string): string => {
    const colors: { [key: string]: string } = {
      'low': 'gray',
      'medium': 'blue',
      'high': 'orange',
      'critical': 'red'
    };
    return colors[priority] || 'gray';
  };

  const getTypeIcon = (type: string) => {
    const icons: { [key: string]: any } = {
      'lesson': FileText,
      'quiz': CheckCircle,
      'progress': TrendingUp,
      'user_data': Users,
      'media': VideoIcon,
      'settings': Settings
    };
    return icons[type] || FileText;
  };

  return (
    <div className={`space-y-6 ${className}`} style={getStyles()}>
      {/* Panel principal */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <RefreshCw className="h-6 w-6 text-blue-600" />
              <div>
                <CardTitle>Gestión de Sincronización</CardTitle>
                <p className="text-sm text-gray-600">
                  {isOnline ? 'Conectado y listo para sincronizar' : 'Modo offline - Sincronización pausada'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={isOnline ? "text-green-600" : "text-red-600"}>
                {isOnline ? 'Online' : 'Offline'}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDetails(!showDetails)}
              >
                {showDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardHeader>
        
        {showDetails && (
          <CardContent>
            <div className="space-y-4">
              {/* Controles de sincronización */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <Button
                    onClick={handleManualSync}
                    disabled={!isOnline || isSyncing}
                    className="flex items-center gap-2"
                  >
                    {isSyncing ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                    {isSyncing ? 'Sincronizando...' : 'Sincronizar Ahora'}
                  </Button>
                  
                  {isSyncing && (
                    <Button
                      variant="outline"
                      onClick={handleCancelSync}
                      className="flex items-center gap-2"
                    >
                      <Square className="h-4 w-4" />
                      Cancelar
                    </Button>
                  )}
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-sm">
                    <span className="font-medium">Auto-sync:</span>
                    <Badge variant="outline" className="ml-2">
                      {syncSettings.autoSync ? 'Activado' : 'Desactivado'}
                    </Badge>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSettings(!showSettings)}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Estadísticas rápidas */}
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded">
                  <div className="text-lg font-bold text-blue-600">{syncStats.syncedItems}</div>
                  <div className="text-xs text-gray-600">Sincronizados</div>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded">
                  <div className="text-lg font-bold text-yellow-600">{syncStats.pendingItems}</div>
                  <div className="text-xs text-gray-600">Pendientes</div>
                </div>
                <div className="text-center p-3 bg-red-50 rounded">
                  <div className="text-lg font-bold text-red-600">{syncStats.errorItems}</div>
                  <div className="text-xs text-gray-600">Errores</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded">
                  <div className="text-lg font-bold text-purple-600">{syncStats.successRate}%</div>
                  <div className="text-xs text-gray-600">Éxito</div>
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Configuración de sincronización */}
      {showSettings && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configuración de Sincronización
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Auto-sincronización</label>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="checkbox"
                      checked={syncSettings.autoSync}
                      onChange={(e) => setSyncSettings(prev => ({ ...prev, autoSync: e.target.checked }))}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-600">Habilitar sincronización automática</span>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Intervalo (minutos)</label>
                  <input
                    type="number"
                    value={syncSettings.syncInterval}
                    onChange={(e) => setSyncSettings(prev => ({ ...prev, syncInterval: parseInt(e.target.value) }))}
                    className="w-full mt-1 px-3 py-2 border rounded"
                    min="1"
                    max="1440"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Resolución de conflictos</label>
                <select
                  value={syncSettings.conflictResolution}
                  onChange={(e) => setSyncSettings(prev => ({ ...prev, conflictResolution: e.target.value as any }))}
                  className="w-full mt-1 px-3 py-2 border rounded"
                >
                  <option value="server_wins">Servidor gana</option>
                  <option value="client_wins">Cliente gana</option>
                  <option value="manual">Manual</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navegación de vistas */}
      <div className="flex items-center gap-2">
        <Button
          variant={selectedView === 'queue' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedView('queue')}
        >
          Cola de Sincronización
        </Button>
        <Button
          variant={selectedView === 'stats' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedView('stats')}
        >
          Estadísticas
        </Button>
        <Button
          variant={selectedView === 'history' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedView('history')}
        >
          Historial
        </Button>
      </div>

      {/* Vista de cola de sincronización */}
      {selectedView === 'queue' && (
        <div className="space-y-4">
          {/* Subidas pendientes */}
          {syncQueue.uploads.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5 text-blue-600" />
                  Subidas Pendientes ({syncQueue.uploads.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {syncQueue.uploads.map((item) => {
                    const TypeIcon = getTypeIcon(item.type);
                    return (
                      <div key={item.id} className="flex items-center justify-between p-3 border rounded">
                        <div className="flex items-center gap-3">
                          <TypeIcon className="h-5 w-5 text-blue-600" />
                          <div>
                            <h4 className="font-medium">{item.title}</h4>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <span>{formatBytes(item.size)}</span>
                              <span>•</span>
                              <span>{item.lastModified.toLocaleString('es-ES')}</span>
                            </div>
                          </div>
                        </div>
                        <Badge variant="outline" className={`text-${getPriorityColor(item.priority)}-600`}>
                          {item.priority}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Descargas pendientes */}
          {syncQueue.downloads.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5 text-green-600" />
                  Descargas Pendientes ({syncQueue.downloads.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {syncQueue.downloads.map((item) => {
                    const TypeIcon = getTypeIcon(item.type);
                    return (
                      <div key={item.id} className="flex items-center justify-between p-3 border rounded">
                        <div className="flex items-center gap-3">
                          <TypeIcon className="h-5 w-5 text-green-600" />
                          <div>
                            <h4 className="font-medium">{item.title}</h4>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <span>{formatBytes(item.size)}</span>
                              <span>•</span>
                              <span>{item.lastModified.toLocaleString('es-ES')}</span>
                            </div>
                          </div>
                        </div>
                        <Badge variant="outline" className={`text-${getPriorityColor(item.priority)}-600`}>
                          {item.priority}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Conflictos */}
          {syncQueue.conflicts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  Conflictos ({syncQueue.conflicts.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {syncQueue.conflicts.map((item) => {
                    const TypeIcon = getTypeIcon(item.type);
                    return (
                      <div key={item.id} className="p-3 border rounded">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <TypeIcon className="h-5 w-5 text-yellow-600" />
                            <div>
                              <h4 className="font-medium">{item.title}</h4>
                              <p className="text-sm text-red-600">{item.errorMessage}</p>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-yellow-600">
                            Conflicto
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleConflictResolution(item.id, 'server_wins')}
                          >
                            Usar versión del servidor
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleConflictResolution(item.id, 'client_wins')}
                          >
                            Usar versión local
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Errores */}
          {syncQueue.errors.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  Errores ({syncQueue.errors.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {syncQueue.errors.map((item) => {
                    const TypeIcon = getTypeIcon(item.type);
                    return (
                      <div key={item.id} className="p-3 border rounded">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <TypeIcon className="h-5 w-5 text-red-600" />
                            <div>
                              <h4 className="font-medium">{item.title}</h4>
                              <p className="text-sm text-red-600">{item.errorMessage}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-red-600">
                              Error ({item.retryCount}/{syncSettings.maxRetries})
                            </Badge>
                            {item.retryCount < syncSettings.maxRetries && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRetryItem(item.id)}
                              >
                                <RotateCcw className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Vista de estadísticas */}
      {selectedView === 'stats' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Estadísticas de Sincronización
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded">
                  <div className="text-2xl font-bold text-blue-600">{syncStats.totalItems}</div>
                  <div className="text-sm text-gray-600">Total de elementos</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded">
                  <div className="text-2xl font-bold text-green-600">{syncStats.syncedItems}</div>
                  <div className="text-sm text-gray-600">Sincronizados</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded">
                  <div className="text-2xl font-bold text-yellow-600">{syncStats.pendingItems}</div>
                  <div className="text-sm text-gray-600">Pendientes</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded">
                  <div className="text-2xl font-bold text-red-600">{syncStats.errorItems}</div>
                  <div className="text-sm text-gray-600">Errores</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded">
                  <h4 className="font-medium mb-2">Información de Sincronización</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Última sincronización:</span>
                      <span>{syncStats.lastSyncTime.toLocaleString('es-ES')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Próxima sincronización:</span>
                      <span>{syncStats.nextSyncTime.toLocaleString('es-ES')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Duración promedio:</span>
                      <span>{syncStats.syncDuration}s</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Ancho de banda usado:</span>
                      <span>{formatBytes(syncStats.bandwidthUsed)}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded">
                  <h4 className="font-medium mb-2">Tasa de Éxito</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span>Éxito general</span>
                      <span className="font-bold">{syncStats.successRate}%</span>
                    </div>
                    <Progress value={syncStats.successRate} />
                    <div className="text-xs text-gray-600">
                      {syncStats.syncedItems} de {syncStats.totalItems} elementos sincronizados correctamente
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Vista de historial */}
      {selectedView === 'history' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Historial de Sincronización
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {syncHistory.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      entry.status === 'success' ? 'bg-green-100' :
                      entry.status === 'partial' ? 'bg-yellow-100' : 'bg-red-100'
                    }`}>
                      {entry.status === 'success' ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : entry.status === 'partial' ? (
                        <AlertCircle className="h-4 w-4 text-yellow-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium">{entry.type === 'full_sync' ? 'Sincronización Completa' : 'Sincronización Incremental'}</h4>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>{entry.timestamp.toLocaleString('es-ES')}</span>
                        <span>•</span>
                        <span>{entry.itemsProcessed} elementos</span>
                        <span>•</span>
                        <span>{entry.duration}s</span>
                        <span>•</span>
                        <span>{formatBytes(entry.bandwidthUsed)}</span>
                      </div>
                      {entry.error && (
                        <p className="text-sm text-red-600 mt-1">{entry.error}</p>
                      )}
                    </div>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={
                      entry.status === 'success' ? 'text-green-600' :
                      entry.status === 'partial' ? 'text-yellow-600' : 'text-red-600'
                    }
                  >
                    {entry.status === 'success' ? 'Éxito' :
                     entry.status === 'partial' ? 'Parcial' : 'Error'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
