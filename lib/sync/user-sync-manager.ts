import { PrismaClient } from '@prisma/client';
import { AuthenticatedUser } from '../middleware/auth-middleware';
import { userActivityTracker } from '../monitoring/user-activity-tracker';

const prisma = new PrismaClient();

export interface SyncData {
  userId: string;
  timestamp: Date;
  data: {
    lessons?: any[];
    progress?: any[];
    preferences?: any[];
    activities?: any[];
    offlineContent?: any[];
  };
  version: string;
  checksum: string;
}

export interface SyncConflict {
  field: string;
  localValue: any;
  serverValue: any;
  resolution: 'local' | 'server' | 'merge';
}

export class UserSyncManager {
  private static instance: UserSyncManager;

  private constructor() {}

  static getInstance(): UserSyncManager {
    if (!UserSyncManager.instance) {
      UserSyncManager.instance = new UserSyncManager();
    }
    return UserSyncManager.instance;
  }

  /**
   * Preparar datos para sincronización offline
   */
  async prepareOfflineData(user: AuthenticatedUser): Promise<SyncData> {
    try {
      console.log('[SYNC] Preparando datos offline para usuario:', user.id);

      // Obtener datos del usuario para modo offline
      const offlineData = {
        lessons: await this.getUserLessons(user.id),
        progress: await this.getUserProgress(user.id),
        preferences: await this.getUserPreferences(user.id),
        activities: await this.getUserActivities(user.id),
        offlineContent: await this.getOfflineContent(user)
      };

      const syncData: SyncData = {
        userId: user.id,
        timestamp: new Date(),
        data: offlineData,
        version: '1.0.0',
        checksum: this.generateChecksum(offlineData)
      };

      // Guardar datos de sincronización
      await this.saveSyncData(syncData);

      console.log('[SYNC] Datos offline preparados:', {
        userId: user.id,
        dataSize: JSON.stringify(syncData).length,
        timestamp: syncData.timestamp.toISOString()
      });

      return syncData;

    } catch (error) {
      console.error('Error preparando datos offline:', error);
      throw error;
    }
  }

  /**
   * Sincronizar datos del usuario
   */
  async syncUserData(user: AuthenticatedUser, localData: SyncData): Promise<{
    success: boolean;
    conflicts: SyncConflict[];
    syncedData: SyncData;
    message: string;
  }> {
    try {
      console.log('[SYNC] Iniciando sincronización para usuario:', user.id);

      // Obtener datos del servidor
      const serverData = await this.getServerData(user.id);
      
      // Detectar conflictos
      const conflicts = this.detectConflicts(localData, serverData);
      
      // Resolver conflictos
      const resolvedData = await this.resolveConflicts(localData, serverData, conflicts);
      
      // Aplicar resolución
      const finalData = await this.applyResolution(user.id, resolvedData);
      
      // Registrar actividad de sincronización
      await userActivityTracker.trackActivity({
        userId: user.id,
        action: 'sync_completed',
        page: '/sync',
        timestamp: new Date(),
        metadata: {
          conflictsCount: conflicts.length,
          dataSize: JSON.stringify(finalData).length,
          syncType: 'full'
        }
      });

      console.log('[SYNC] Sincronización completada:', {
        userId: user.id,
        conflicts: conflicts.length,
        success: true
      });

      return {
        success: true,
        conflicts,
        syncedData: finalData,
        message: `Sincronización completada. ${conflicts.length} conflictos resueltos.`
      };

    } catch (error) {
      console.error('Error en sincronización:', error);
      
      // Registrar error de sincronización
      await userActivityTracker.trackActivity({
        userId: user.id,
        action: 'sync_error',
        page: '/sync',
        timestamp: new Date(),
        metadata: {
          error: error instanceof Error ? error.message : 'Error desconocido'
        }
      });

      throw error;
    }
  }

  /**
   * Obtener lecciones del usuario
   */
  private async getUserLessons(userId: string): Promise<any[]> {
    try {
      // En un entorno real, esto consultaría la base de datos
      // Por ahora, retornamos datos simulados
      return [
        {
          id: 'lesson-1',
          title: 'Matemáticas Básicas',
          subject: 'mathematics',
          gradeLevel: 3,
          difficulty: 2,
          completed: false,
          progress: 0.6
        },
        {
          id: 'lesson-2',
          title: 'Literatura Maya',
          subject: 'literature',
          gradeLevel: 4,
          difficulty: 3,
          completed: true,
          progress: 1.0
        }
      ];

    } catch (error) {
      console.error('Error obteniendo lecciones del usuario:', error);
      return [];
    }
  }

  /**
   * Obtener progreso del usuario
   */
  private async getUserProgress(userId: string): Promise<any[]> {
    try {
      // En un entorno real, esto consultaría la base de datos
      return [
        {
          lessonId: 'lesson-1',
          score: 85,
          accuracy: 0.87,
          timeSpent: 1800, // segundos
          completedAt: new Date('2025-01-20T10:30:00Z'),
          errors: ['calculation_error', 'timeout']
        }
      ];

    } catch (error) {
      console.error('Error obteniendo progreso del usuario:', error);
      return [];
    }
  }

  /**
   * Obtener preferencias del usuario
   */
  private async getUserPreferences(userId: string): Promise<any[]> {
    try {
      // En un entorno real, esto consultaría la base de datos
      return [
        {
          type: 'accessibility',
          key: 'high_contrast',
          value: true,
          updatedAt: new Date()
        },
        {
          type: 'learning',
          key: 'preferred_language',
          value: 'es-MX',
          updatedAt: new Date()
        }
      ];

    } catch (error) {
      console.error('Error obteniendo preferencias del usuario:', error);
      return [];
    }
  }

  /**
   * Obtener actividades del usuario
   */
  private async getUserActivities(userId: string): Promise<any[]> {
    try {
      // En un entorno real, esto consultaría la base de datos
      return [
        {
          id: 'activity-1',
          type: 'lesson_completed',
          timestamp: new Date('2025-01-20T10:30:00Z'),
          metadata: {
            lessonId: 'lesson-1',
            score: 85
          }
        }
      ];

    } catch (error) {
      console.error('Error obteniendo actividades del usuario:', error);
      return [];
    }
  }

  /**
   * Obtener contenido offline personalizado
   */
  private async getOfflineContent(user: AuthenticatedUser): Promise<any[]> {
    try {
      // Generar contenido offline basado en las preferencias del usuario
      const offlineContent = [
        {
          id: 'content-1',
          type: 'lesson',
          title: 'Matemáticas Básicas',
          content: 'Contenido de la lección...',
          language: user.language,
          culturalContext: user.culturalBackground,
          accessibility: user.accessibilityPreferences
        },
        {
          id: 'content-2',
          type: 'exercise',
          title: 'Ejercicios de Práctica',
          content: 'Ejercicios interactivos...',
          language: user.language,
          culturalContext: user.culturalBackground,
          accessibility: user.accessibilityPreferences
        }
      ];

      return offlineContent;

    } catch (error) {
      console.error('Error obteniendo contenido offline:', error);
      return [];
    }
  }

  /**
   * Obtener datos del servidor
   */
  private async getServerData(userId: string): Promise<SyncData> {
    try {
      // En un entorno real, esto consultaría la base de datos del servidor
      const serverData: SyncData = {
        userId,
        timestamp: new Date(),
        data: {
          lessons: await this.getUserLessons(userId),
          progress: await this.getUserProgress(userId),
          preferences: await this.getUserPreferences(userId),
          activities: await this.getUserActivities(userId),
          offlineContent: []
        },
        version: '1.0.0',
        checksum: ''
      };

      serverData.checksum = this.generateChecksum(serverData.data);
      return serverData;

    } catch (error) {
      console.error('Error obteniendo datos del servidor:', error);
      throw error;
    }
  }

  /**
   * Detectar conflictos entre datos locales y del servidor
   */
  private detectConflicts(localData: SyncData, serverData: SyncData): SyncConflict[] {
    const conflicts: SyncConflict[] = [];

    // Comparar timestamps
    if (localData.timestamp.getTime() !== serverData.timestamp.getTime()) {
      conflicts.push({
        field: 'timestamp',
        localValue: localData.timestamp,
        serverValue: serverData.timestamp,
        resolution: 'server' // El servidor siempre gana en timestamps
      });
    }

    // Comparar checksums
    if (localData.checksum !== serverData.checksum) {
      conflicts.push({
        field: 'data',
        localValue: localData.checksum,
        serverValue: serverData.checksum,
        resolution: 'merge' // Los datos se fusionan
      });
    }

    return conflicts;
  }

  /**
   * Resolver conflictos
   */
  private async resolveConflicts(
    localData: SyncData, 
    serverData: SyncData, 
    conflicts: SyncConflict[]
  ): Promise<SyncData> {
    try {
      let resolvedData = { ...serverData };

      for (const conflict of conflicts) {
        switch (conflict.resolution) {
          case 'local':
            resolvedData = { ...localData };
            break;
          case 'server':
            resolvedData = { ...serverData };
            break;
          case 'merge':
            resolvedData = await this.mergeData(localData, serverData);
            break;
        }
      }

      return resolvedData;

    } catch (error) {
      console.error('Error resolviendo conflictos:', error);
      throw error;
    }
  }

  /**
   * Fusionar datos locales y del servidor
   */
  private async mergeData(localData: SyncData, serverData: SyncData): Promise<SyncData> {
    try {
      const mergedData: SyncData = {
        userId: localData.userId,
        timestamp: new Date(), // Timestamp actual
        data: {
          lessons: this.mergeArrays(localData.data.lessons || [], serverData.data.lessons || []),
          progress: this.mergeArrays(localData.data.progress || [], serverData.data.progress || []),
          preferences: this.mergeArrays(localData.data.preferences || [], serverData.data.preferences || []),
          activities: this.mergeArrays(localData.data.activities || [], serverData.data.activities || []),
          offlineContent: this.mergeArrays(localData.data.offlineContent || [], serverData.data.offlineContent || [])
        },
        version: '1.0.0',
        checksum: ''
      };

      mergedData.checksum = this.generateChecksum(mergedData.data);
      return mergedData;

    } catch (error) {
      console.error('Error fusionando datos:', error);
      throw error;
    }
  }

  /**
   * Fusionar arrays eliminando duplicados
   */
  private mergeArrays<T>(local: T[], server: T[]): T[] {
    const merged = [...local, ...server];
    const unique = new Map();
    
    merged.forEach(item => {
      const key = (item as any).id || JSON.stringify(item);
      if (!unique.has(key)) {
        unique.set(key, item);
      }
    });

    return Array.from(unique.values());
  }

  /**
   * Aplicar resolución final
   */
  private async applyResolution(userId: string, resolvedData: SyncData): Promise<SyncData> {
    try {
      // En un entorno real, esto actualizaría la base de datos
      console.log('[SYNC] Aplicando resolución para usuario:', userId);
      
      // Simular actualización
      await new Promise(resolve => setTimeout(resolve, 100));
      
      return resolvedData;

    } catch (error) {
      console.error('Error aplicando resolución:', error);
      throw error;
    }
  }

  /**
   * Guardar datos de sincronización
   */
  private async saveSyncData(syncData: SyncData): Promise<void> {
    try {
      // En un entorno real, esto guardaría en la base de datos
      console.log('[SYNC] Guardando datos de sincronización:', {
        userId: syncData.userId,
        timestamp: syncData.timestamp.toISOString(),
        version: syncData.version
      });

    } catch (error) {
      console.error('Error guardando datos de sincronización:', error);
      throw error;
    }
  }

  /**
   * Generar checksum para verificar integridad
   */
  private generateChecksum(data: any): string {
    try {
      const jsonString = JSON.stringify(data);
      let hash = 0;
      
      for (let i = 0; i < jsonString.length; i++) {
        const char = jsonString.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convertir a entero de 32 bits
      }
      
      return hash.toString(16);
    } catch (error) {
      console.error('Error generando checksum:', error);
      return 'error';
    }
  }

  /**
   * Verificar estado de sincronización
   */
  async getSyncStatus(userId: string): Promise<{
    lastSync: Date | null;
    isOnline: boolean;
    pendingChanges: number;
    conflicts: number;
  }> {
    try {
      // En un entorno real, esto consultaría la base de datos
      return {
        lastSync: new Date('2025-01-20T10:30:00Z'),
        isOnline: navigator.onLine,
        pendingChanges: 3,
        conflicts: 0
      };

    } catch (error) {
      console.error('Error obteniendo estado de sincronización:', error);
      throw error;
    }
  }
}

// Instancia singleton
export const userSyncManager = UserSyncManager.getInstance();
