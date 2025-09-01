'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
  import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Wifi, 
  WifiOff, 
  Download, 
  Upload, 
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Info,
  Settings,
  Database,
  HardDrive,
  Cloud,
  CloudOff,
  Sync,
  Clock,
  FileText,
  ImageIcon,
  VideoIcon,
  Volume2,
  Globe,
  Users,
  Calendar,
  ChevronDown,
  ChevronUp,
  Eye,
  Palette,
  Zap,
  Sparkles
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useScreenReader } from '@/components/accessibility/screen-reader';
import { useHighContrast } from '@/components/accessibility/high-contrast';

interface OfflineContent {
  id: string;
  type: 'lesson' | 'quiz' | 'resource' | 'media';
  title: string;
  size: number; // en bytes
  lastSync: Date;
  status: 'synced' | 'pending' | 'error';
  culturalContext?: string;
  accessibility: string[];
}

interface SyncStatus {
  isOnline: boolean;
  lastSync: Date;
  pendingUploads: number;
  pendingDownloads: number;
  syncProgress: number;
  estimatedTime: number; // en segundos
  errors: string[];
}

interface OfflineIndicatorProps {
  onSyncRequest?: () => void;
  onContentDownload?: (contentId: string) => void;
  onContentUpload?: (contentId: string) => void;
  className?: string;
}

export default function OfflineIndicator({
  onSyncRequest,
  onContentDownload,
  onContentUpload,
  className = ''
}: OfflineIndicatorProps) {
  const { user } = useAuth();
  const { speak, isEnabled: screenReaderEnabled } = useScreenReader();
  const { getStyles } = useHighContrast();

  const [isOnline, setIsOnline] = useState(true);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: true,
    lastSync: new Date(),
    pendingUploads: 0,
    pendingDownloads: 0,
    syncProgress: 0,
    estimatedTime: 0,
    errors: []
  });
  const [offlineContent, setOfflineContent] = useState<OfflineContent[]>([]);
  const [showDetails, setShowDetails] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [storageUsage, setStorageUsage] = useState({
    used: 0,
    total: 0,
    available: 0
  });

  useEffect(() => {
    checkOnlineStatus();
    loadOfflineContent();
    checkStorageUsage();
    
    // Escuchar cambios de conectividad
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (screenReaderEnabled) {
      speak(isOnline ? 'Conectado a internet' : 'Sin conexión a internet');
    }
  }, [isOnline, screenReaderEnabled]);

  const checkOnlineStatus = () => {
    setIsOnline(navigator.onLine);
    setSyncStatus(prev => ({ ...prev, isOnline: navigator.onLine }));
  };

  const handleOnline = () => {
    setIsOnline(true);
    setSyncStatus(prev => ({ ...prev, isOnline: true }));
    if (screenReaderEnabled) {
      speak('Conexión a internet restaurada');
    }
  };

  const handleOffline = () => {
    setIsOnline(false);
    setSyncStatus(prev => ({ ...prev, isOnline: false }));
    if (screenReaderEnabled) {
      speak('Conexión a internet perdida');
    }
  };

  const loadOfflineContent = async () => {
    try {
      // En producción, esto vendría de IndexedDB o similar
      const mockContent: OfflineContent[] = [
        {
          id: 'lesson-1',
          type: 'lesson',
          title: 'Matemáticas Mayas: Sistema Numérico',
          size: 2048576, // 2MB
          lastSync: new Date('2024-01-15T10:30:00'),
          status: 'synced',
          culturalContext: 'maya',
          accessibility: ['screenReader', 'highContrast', 'audioDescription']
        },
        {
          id: 'quiz-1',
          type: 'quiz',
          title: 'Evaluación de Conocimientos Mayas',
          size: 512000, // 512KB
          lastSync: new Date('2024-01-15T11:00:00'),
          status: 'synced',
          culturalContext: 'maya',
          accessibility: ['screenReader', 'keyboardNavigation']
        },
        {
          id: 'resource-1',
          type: 'resource',
          title: 'Biblioteca Digital Indígena',
          size: 10485760, // 10MB
          lastSync: new Date('2024-01-14T15:45:00'),
          status: 'pending',
          culturalContext: 'general',
          accessibility: ['screenReader', 'subtitles']
        },
        {
          id: 'media-1',
          type: 'media',
          title: 'Video: Ceremonia Maya Tradicional',
          size: 52428800, // 50MB
          lastSync: new Date('2024-01-13T09:20:00'),
          status: 'error',
          culturalContext: 'maya',
          accessibility: ['subtitles', 'audioDescription']
        }
      ];

      setOfflineContent(mockContent);
    } catch (error) {
      console.error('Error cargando contenido offline:', error);
    }
  };

  const checkStorageUsage = async () => {
    try {
      // En producción, esto usaría la API de Storage
      const mockUsage = {
        used: 67.5, // MB
        total: 100, // MB
        available: 32.5 // MB
      };
      setStorageUsage(mockUsage);
    } catch (error) {
      console.error('Error verificando uso de almacenamiento:', error);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      // Simular proceso de sincronización
      for (let i = 0; i <= 100; i += 10) {
        setSyncStatus(prev => ({
          ...prev,
          syncProgress: i,
          estimatedTime: Math.max(0, (100 - i) / 10)
        }));
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      setSyncStatus(prev => ({
        ...prev,
        lastSync: new Date(),
        pendingUploads: 0,
        pendingDownloads: 0,
        syncProgress: 100,
        estimatedTime: 0,
        errors: []
      }));

      onSyncRequest?.();
      
      if (screenReaderEnabled) {
        speak('Sincronización completada');
      }
    } catch (error) {
      console.error('Error durante la sincronización:', error);
      setSyncStatus(prev => ({
        ...prev,
        errors: ['Error de sincronización: ' + error]
      }));
      
      if (screenReaderEnabled) {
        speak('Error durante la sincronización');
      }
    } finally {
      setIsSyncing(false);
    }
  };

  const handleContentDownload = (contentId: string) => {
    onContentDownload?.(contentId);
    if (screenReaderEnabled) {
      speak('Descargando contenido');
    }
  };

  const handleContentUpload = (contentId: string) => {
    onContentUpload?.(contentId);
    if (screenReaderEnabled) {
      speak('Subiendo contenido');
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
      'synced': 'green',
      'pending': 'yellow',
      'error': 'red'
    };
    return colors[status] || 'gray';
  };

  const getTypeIcon = (type: string) => {
    const icons: { [key: string]: any } = {
      'lesson': FileText,
      'quiz': CheckCircle,
      'resource': Database,
      'media': VideoIcon
    };
    return icons[type] || FileText;
  };

  const getTypeColor = (type: string): string => {
    const colors: { [key: string]: string } = {
      'lesson': 'blue',
      'quiz': 'green',
      'resource': 'purple',
      'media': 'orange'
    };
    return colors[type] || 'gray';
  };

  const storagePercentage = (storageUsage.used / storageUsage.total) * 100;

  return (
    <div className={`space-y-6 ${className}`} style={getStyles()}>
      {/* Indicador principal */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isOnline ? (
                <Wifi className="h-6 w-6 text-green-600" />
              ) : (
                <WifiOff className="h-6 w-6 text-red-600" />
              )}
              <div>
                <CardTitle className="flex items-center gap-2">
                  {isOnline ? 'Conectado' : 'Sin Conexión'}
                </CardTitle>
                <p className="text-sm text-gray-600">
                  {isOnline ? 'Conexión a internet disponible' : 'Modo offline activo'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge 
                variant="outline" 
                className={isOnline ? "text-green-600 border-green-200" : "text-red-600 border-red-200"}
              >
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
              {/* Estado de sincronización */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">Estado de Sincronización</h4>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={handleSync}
                      disabled={!isOnline || isSyncing}
                      className="flex items-center gap-2"
                    >
                      {isSyncing ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Sync className="h-4 w-4" />
                      )}
                      {isSyncing ? 'Sincronizando...' : 'Sincronizar'}
                    </Button>
                  </div>
                </div>
                
                {isSyncing && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Progreso</span>
                      <span>{syncStatus.syncProgress}%</span>
                    </div>
                    <Progress value={syncStatus.syncProgress} />
                    <div className="text-xs text-gray-600">
                      Tiempo estimado: {syncStatus.estimatedTime}s
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-2 bg-blue-50 rounded">
                    <div className="text-lg font-bold text-blue-600">{syncStatus.pendingUploads}</div>
                    <div className="text-xs text-gray-600">Pendientes subir</div>
                  </div>
                  <div className="p-2 bg-green-50 rounded">
                    <div className="text-lg font-bold text-green-600">{syncStatus.pendingDownloads}</div>
                    <div className="text-xs text-gray-600">Pendientes bajar</div>
                  </div>
                  <div className="p-2 bg-purple-50 rounded">
                    <div className="text-lg font-bold text-purple-600">
                      {syncStatus.lastSync.toLocaleDateString('es-ES')}
                    </div>
                    <div className="text-xs text-gray-600">Última sincronización</div>
                  </div>
                </div>
              </div>

              {/* Uso de almacenamiento */}
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium mb-3">Almacenamiento Offline</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Espacio usado</span>
                    <span>{storageUsage.used}MB / {storageUsage.total}MB</span>
                  </div>
                  <Progress value={storagePercentage} />
                  <div className="text-xs text-gray-600">
                    {storageUsage.available}MB disponibles
                  </div>
                </div>
              </div>

              {/* Errores de sincronización */}
              {syncStatus.errors.length > 0 && (
                <div className="p-4 bg-red-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <h4 className="font-medium text-red-600">Errores de Sincronización</h4>
                  </div>
                  <ul className="text-sm text-red-700 space-y-1">
                    {syncStatus.errors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Contenido offline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            Contenido Offline
            <Badge variant="outline">{offlineContent.length} elementos</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {offlineContent.map((content) => {
              const TypeIcon = getTypeIcon(content.type);
              return (
                <div key={content.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 bg-${getTypeColor(content.type)}-100 rounded-lg flex items-center justify-center`}>
                      <TypeIcon className={`h-5 w-5 text-${getTypeColor(content.type)}-600`} />
                    </div>
                    <div>
                      <h4 className="font-medium">{content.title}</h4>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>{formatBytes(content.size)}</span>
                        <span>•</span>
                        <span>{content.lastSync.toLocaleDateString('es-ES')}</span>
                        {content.culturalContext && (
                          <>
                            <span>•</span>
                            <span>🌍 {content.culturalContext}</span>
                          </>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {content.accessibility.map((feature, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {feature === 'screenReader' ? 'SR' :
                             feature === 'highContrast' ? 'HC' :
                             feature === 'audioDescription' ? 'AD' :
                             feature === 'keyboardNavigation' ? 'KB' :
                             feature === 'subtitles' ? 'ST' : feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline" 
                      className={`text-${getStatusColor(content.status)}-600 border-${getStatusColor(content.status)}-200`}
                    >
                      {content.status === 'synced' ? 'Sincronizado' :
                       content.status === 'pending' ? 'Pendiente' : 'Error'}
                    </Badge>
                    
                    {content.status === 'pending' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleContentDownload(content.id)}
                        disabled={!isOnline}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                    
                    {content.status === 'error' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleContentUpload(content.id)}
                        disabled={!isOnline}
                      >
                        <Upload className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas offline */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Contenido Disponible</p>
                <p className="text-2xl font-bold text-blue-600">{offlineContent.length}</p>
              </div>
              <Database className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Espacio Usado</p>
                <p className="text-2xl font-bold text-green-600">{Math.round(storagePercentage)}%</p>
              </div>
              <HardDrive className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Última Sincronización</p>
                <p className="text-2xl font-bold text-purple-600">
                  {syncStatus.lastSync.toLocaleTimeString('es-ES', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
              <Cloud className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
