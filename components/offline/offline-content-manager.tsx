'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  Wifi, 
  WifiOff, 
  CheckCircle, 
  Clock, 
  HardDrive,
  RefreshCw,
  Trash2,
  Settings,
  RotateCcw,
  Info,
  Star,
  Globe,
  Users,
  FileText,
  Image
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useScreenReader } from '@/components/accessibility/screen-reader';
import { useHighContrastStyles } from '@/components/accessibility/high-contrast';

interface OfflinePackage {
  id: string;
  version: string;
  studentId: string;
  culture: string;
  language: string;
  lessons: OfflineLesson[];
  resources: OfflineResource[];
  metadata: PackageMetadata;
  size: number;
  checksum: string;
  createdAt: Date;
  expiresAt: Date;
}

interface OfflineLesson {
  id: string;
  title: string;
  description: string;
  content: Record<string, unknown>;
  culturalVariants: Record<string, unknown>;
  languageVersions: Record<string, unknown>;
  accessibilityFeatures: Record<string, unknown>;
  multimedia: OfflineMultimedia[];
  size: number;
  checksum: string;
}

interface OfflineResource {
  id: string;
  type: 'image' | 'audio' | 'video' | 'document';
  url: string;
  localPath: string;
  size: number;
  optimizedSize: number;
  checksum: string;
  metadata: ResourceMetadata;
}

interface OfflineMultimedia {
  type: 'image' | 'audio' | 'video';
  originalUrl: string;
  optimizedUrl: string;
  size: number;
  optimizedSize: number;
  format: string;
  quality: number;
}

interface PackageMetadata {
  totalLessons: number;
  totalResources: number;
  totalSize: number;
  estimatedDownloadTime: number;
  compatibility: string[];
  requirements: {
    minStorage: number;
    minBandwidth: number;
    supportedDevices: string[];
  };
}

interface ResourceMetadata {
  width?: number;
  height?: number;
  duration?: number;
  bitrate?: number;
  format: string;
  codec?: string;
}

interface OfflineContentManagerProps {
  studentId: string;
  culture?: string;
  language?: string;
  className?: string;
}

export const OfflineContentManager: React.FC<OfflineContentManagerProps> = ({
  studentId,
  culture = 'maya',
  language = 'es-GT',
  className
}) => {
  const [isOnline, setIsOnline] = useState(true);
  const [installedPackages, setInstalledPackages] = useState<OfflinePackage[]>([]);
  const [availablePackages, setAvailablePackages] = useState<OfflinePackage[]>([]);
  const [downloadingPackages, setDownloadingPackages] = useState<Set<string>>(new Set());
  const [downloadProgress, setDownloadProgress] = useState<Record<string, number>>({});
  const [storageInfo, setStorageInfo] = useState<{
    used: number;
    available: number;
    total: number;
  } | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [autoSync, setAutoSync] = useState(true);
  const [syncQueue, setSyncQueue] = useState<Record<string, unknown>[]>([]);
  
  const { speak, isEnabled: screenReaderEnabled } = useScreenReader();
  const { getStyles } = useHighContrastStyles();

  // Verificar estado de conexión
  useEffect(() => {
    const checkOnlineStatus = () => {
      const online = navigator.onLine;
      setIsOnline(online);
      
      if (screenReaderEnabled) {
        speak(online ? 'Conectado a internet' : 'Sin conexión a internet', 'high');
      }
    };

    window.addEventListener('online', checkOnlineStatus);
    window.addEventListener('offline', checkOnlineStatus);
    checkOnlineStatus();

    return () => {
      window.removeEventListener('online', checkOnlineStatus);
      window.removeEventListener('offline', checkOnlineStatus);
    };
  }, [screenReaderEnabled, speak]);

  const loadInstalledPackages = async () => {
    try {
      // En producción, esto vendría de IndexedDB
      const packages = await getInstalledPackagesFromStorage();
      setInstalledPackages(packages);
    } catch (error) {
      console.error('Error cargando paquetes instalados:', error);
    }
  };

  const loadAvailablePackages = useCallback(async () => {
    try {
      const response = await fetch(`/api/offline/packages?studentId=${studentId}&culture=${culture}&language=${language}`);
      if (response.ok) {
        const packages = await response.json();
        setAvailablePackages(packages);
      }
    } catch (error) {
      console.error('Error cargando paquetes disponibles:', error);
    }
  }, [studentId, culture, language]);

  const processSyncQueue = useCallback(async () => {
    if (syncQueue.length === 0) return;

    const itemsToSync = [...syncQueue];
    setSyncQueue([]);

    try {
      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: itemsToSync })
      });

      if (response.ok) {
        if (screenReaderEnabled) {
          speak(`${itemsToSync.length} elementos sincronizados exitosamente`);
        }
      } else {
        // Re-encolar items fallidos
        setSyncQueue((prev: Record<string, unknown>[]) => [...prev, ...itemsToSync]);
      }
    } catch (error) {
      console.error('Error sincronizando:', error);
      // Re-encolar items fallidos
      setSyncQueue((prev: Record<string, unknown>[]) => [...prev, ...itemsToSync]);
    }
  }, [syncQueue, screenReaderEnabled, speak]);

  // Cargar paquetes instalados
  useEffect(() => {
    loadInstalledPackages();
    loadStorageInfo();
  }, []);

  // Cargar paquetes disponibles cuando hay conexión
  useEffect(() => {
    if (isOnline) {
      loadAvailablePackages();
    }
  }, [isOnline, loadAvailablePackages]);

  // Sincronización automática
  useEffect(() => {
    if (isOnline && autoSync && syncQueue.length > 0) {
      processSyncQueue();
    }
  }, [isOnline, autoSync, syncQueue, processSyncQueue]);

  const loadStorageInfo = async () => {
    try {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        setStorageInfo({
          used: estimate.usage || 0,
          available: (estimate.quota || 0) - (estimate.usage || 0),
          total: estimate.quota || 0
        });
      }
    } catch (error) {
      console.error('Error obteniendo información de almacenamiento:', error);
    }
  };

  const downloadPackage = async (packageId: string) => {
    if (downloadingPackages.has(packageId)) return;

    setDownloadingPackages(prev => new Set(prev).add(packageId));
    setDownloadProgress(prev => ({ ...prev, [packageId]: 0 }));

    try {
      // Simular descarga progresiva
      const packageData = availablePackages.find((p: OfflinePackage) => p.id === packageId);
      if (!packageData) throw new Error('Paquete no encontrado');

      // Verificar espacio disponible
      if (storageInfo && storageInfo.available < packageData.size) {
        throw new Error('Espacio insuficiente en el dispositivo');
      }

      // Simular progreso de descarga
      const totalSteps = 10;
      for (let i = 0; i <= totalSteps; i++) {
        await new Promise(resolve => setTimeout(resolve, 500));
        setDownloadProgress(prev => ({ 
          ...prev, 
          [packageId]: (i / totalSteps) * 100 
        }));
      }

      // Instalar paquete
      await installPackage(packageData);
      
      // Actualizar listas
      setInstalledPackages(prev => [...prev, packageData]);
      setAvailablePackages(prev => prev.filter((p: OfflinePackage) => p.id !== packageId));
      
      if (screenReaderEnabled) {
        speak(`Paquete ${packageData.metadata.totalLessons} lecciones instalado exitosamente`);
      }

    } catch (error) {
      console.error('Error descargando paquete:', error);
      if (screenReaderEnabled) {
        speak(`Error al descargar paquete: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      }
    } finally {
      setDownloadingPackages(prev => {
        const newSet = new Set(prev);
        newSet.delete(packageId);
        return newSet;
      });
      setDownloadProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[packageId];
        return newProgress;
      });
    }
  };

  const installPackage = async (packageData: OfflinePackage) => {
    try {
      // Guardar en IndexedDB
      await savePackageToStorage(packageData);
      
      // Registrar en cache del service worker
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'CACHE_PACKAGE',
          package: packageData
        });
      }
    } catch (error) {
      throw new Error(`Error instalando paquete: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  };

  const uninstallPackage = async (packageId: string) => {
    try {
      const packageData = installedPackages.find((p: OfflinePackage) => p.id === packageId);
      if (!packageData) return;

      // Remover de IndexedDB
      await removePackageFromStorage(packageId);
      
      // Limpiar cache del service worker
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'UNCACHE_PACKAGE',
          packageId
        });
      }

      // Actualizar lista
      setInstalledPackages(prev => prev.filter((p: OfflinePackage) => p.id !== packageId));
      
      if (screenReaderEnabled) {
        speak('Paquete desinstalado exitosamente');
      }
    } catch (error) {
      console.error('Error desinstalando paquete:', error);
    }
  };



  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getStorageUsagePercentage = (): number => {
    if (!storageInfo) return 0;
    return (storageInfo.used / storageInfo.total) * 100;
  };

  return (
    <div className={cn("space-y-6", className)} style={getStyles()}>
      {/* Header con estado de conexión */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CardTitle className="text-xl">Contenido Offline</CardTitle>
              <Badge variant={isOnline ? "default" : "destructive"} className="flex items-center gap-1">
                {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
                {isOnline ? 'En línea' : 'Sin conexión'}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
                aria-label="Configuración de contenido offline"
              >
                <Settings className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={loadInstalledPackages}
                disabled={!isOnline}
                aria-label="Actualizar contenido offline"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Información de almacenamiento */}
          {storageInfo && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Almacenamiento usado</span>
                <span>{formatBytes(storageInfo.used)} / {formatBytes(storageInfo.total)}</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-4 overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all" 
                  style={{ width: `${getStorageUsagePercentage()}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Disponible: {formatBytes(storageInfo.available)}</span>
                <span>{getStorageUsagePercentage().toFixed(1)}% usado</span>
              </div>
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Configuración */}
      {showSettings && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Sincronización automática</h3>
                  <p className="text-sm text-muted-foreground">
                    Sincronizar automáticamente cuando hay conexión
                  </p>
                </div>
                <Button
                  variant={autoSync ? "default" : "outline"}
                  size="sm"
                  onClick={() => setAutoSync(!autoSync)}
                >
                  {autoSync ? 'Activada' : 'Desactivada'}
                </Button>
              </div>
              
              {syncQueue.length > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4" />
                  <span>{syncQueue.length} elementos pendientes de sincronización</span>
                  {isOnline && (
                    <Button size="sm" onClick={processSyncQueue}>
                      Sincronizar ahora
                    </Button>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Paquetes instalados */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            Paquetes Instalados ({installedPackages.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {installedPackages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay paquetes instalados</p>
              <p className="text-sm">Descarga contenido para usar offline</p>
            </div>
          ) : (
            <div className="space-y-4">
              {installedPackages.map((pkg) => (
                <div key={pkg.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium">{pkg.metadata.totalLessons} lecciones</h3>
                      <Badge variant="secondary">{pkg.culture}</Badge>
                      <Badge variant="outline">{pkg.language}</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        {pkg.metadata.totalLessons} lecciones
                      </span>
                      <span className="flex items-center gap-1">
                        <Image className="h-3 w-3" />
                        {pkg.metadata.totalResources} recursos
                      </span>
                      <span className="flex items-center gap-1">
                        <HardDrive className="h-3 w-3" />
                        {formatBytes(pkg.size)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => uninstallPackage(pkg.id)}
                      aria-label="Desinstalar paquete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Paquetes disponibles */}
      {isOnline && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Paquetes Disponibles ({availablePackages.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {availablePackages.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No hay nuevos paquetes disponibles</p>
                <p className="text-sm">Todo el contenido está actualizado</p>
              </div>
            ) : (
              <div className="space-y-4">
                {availablePackages.map((pkg) => {
                  const isDownloading = downloadingPackages.has(pkg.id);
                  const progress = downloadProgress[pkg.id] || 0;
                  
                  return (
                    <div key={pkg.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-medium">{pkg.metadata.totalLessons} lecciones</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary">{pkg.culture}</Badge>
                            <Badge variant="outline">{pkg.language}</Badge>
                            <Badge variant="outline">
                              {formatTime(pkg.metadata.estimatedDownloadTime)}
                            </Badge>
                          </div>
                        </div>
                        <Button
                          onClick={() => downloadPackage(pkg.id)}
                          disabled={isDownloading}
                          className="flex items-center gap-2"
                        >
                          {isDownloading ? (
                            <>
                              <RotateCcw className="h-4 w-4 animate-spin" />
                              Descargando...
                            </>
                          ) : (
                            <>
                              <Download className="h-4 w-4" />
                              Descargar
                            </>
                          )}
                        </Button>
                      </div>
                      
                      {isDownloading && (
                        <div className="space-y-2">
                          <div className="w-full bg-secondary rounded-full h-4 overflow-hidden">
                            <div 
                              className="h-full bg-primary transition-all" 
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-sm text-muted-foreground">
                            <span>{progress.toFixed(1)}% completado</span>
                            <span>{formatBytes(pkg.size)}</span>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-3">
                        <span className="flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          {pkg.metadata.totalLessons} lecciones
                        </span>
                        <span className="flex items-center gap-1">
                          <Image className="h-3 w-3" />
                          {pkg.metadata.totalResources} recursos
                        </span>
                        <span className="flex items-center gap-1">
                          <HardDrive className="h-3 w-3" />
                          {formatBytes(pkg.size)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Información adicional */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="flex flex-col items-center gap-2">
              <Users className="h-8 w-8 text-blue-500" />
              <div>
                <div className="font-semibold">{installedPackages.length}</div>
                <div className="text-sm text-muted-foreground">Paquetes instalados</div>
              </div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Star className="h-8 w-8 text-yellow-500" />
              <div>
                <div className="font-semibold">
                  {installedPackages.reduce((sum, pkg) => sum + pkg.metadata.totalLessons, 0)}
                </div>
                <div className="text-sm text-muted-foreground">Lecciones disponibles</div>
              </div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Info className="h-8 w-8 text-green-500" />
              <div>
                <div className="font-semibold">
                  {isOnline ? 'Disponible' : 'Limitado'}
                </div>
                <div className="text-sm text-muted-foreground">Funcionalidad</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Funciones auxiliares para almacenamiento
async function getInstalledPackagesFromStorage(): Promise<OfflinePackage[]> {
  // En producción, esto usaría IndexedDB
  const stored = localStorage.getItem('offline-packages');
  return stored ? JSON.parse(stored) : [];
}

async function savePackageToStorage(packageData: OfflinePackage): Promise<void> {
  const packages = await getInstalledPackagesFromStorage();
  const updatedPackages = packages.filter(p => p.id !== packageData.id);
  updatedPackages.push(packageData);
  localStorage.setItem('offline-packages', JSON.stringify(updatedPackages));
}

async function removePackageFromStorage(packageId: string): Promise<void> {
  const packages = await getInstalledPackagesFromStorage();
  const updatedPackages = packages.filter(p => p.id !== packageId);
  localStorage.setItem('offline-packages', JSON.stringify(updatedPackages));
}
