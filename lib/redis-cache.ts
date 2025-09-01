import Redis from 'ioredis';
import { promisify } from 'util';

// Configuración de Redis
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0'),
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  keepAlive: 30000,
  connectTimeout: 10000,
  commandTimeout: 5000,
  retryDelayOnClusterDown: 300,
  enableOfflineQueue: false,
  maxLoadingTimeout: 10000,
};

// Cliente Redis principal
const redisClient = new Redis(redisConfig);

// Cliente Redis para pub/sub
const redisSubscriber = new Redis(redisConfig);

// Cliente Redis para operaciones de escritura
const redisWriter = new Redis(redisConfig);

// Configuración de caché
const CACHE_CONFIG = {
  // TTLs por tipo de dato
  TTL: {
    SESSION: 30 * 60, // 30 minutos
    USER: 15 * 60, // 15 minutos
    AI_MODEL: 60 * 60, // 1 hora
    CONTENT: 24 * 60 * 60, // 24 horas
    IMAGE: 7 * 24 * 60 * 60, // 7 días
    API_RESPONSE: 5 * 60, // 5 minutos
    STATIC_DATA: 60 * 60, // 1 hora
  },
  
  // Prefijos para organización
  PREFIXES: {
    SESSION: 'session:',
    USER: 'user:',
    AI_MODEL: 'ai:',
    CONTENT: 'content:',
    IMAGE: 'image:',
    API: 'api:',
    STATIC: 'static:',
  },
  
  // Configuración de compresión
  COMPRESSION: {
    ENABLED: true,
    THRESHOLD: 1024, // Comprimir si > 1KB
  }
};

// Interfaces
interface CacheOptions {
  ttl?: number;
  compress?: boolean;
  tags?: string[];
}

interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  size: number;
  hitRate: number;
}

interface CacheItem<T> {
  value: T;
  timestamp: number;
  ttl: number;
  tags?: string[];
  compressed?: boolean;
}

/**
 * Clase principal para manejo de caché Redis
 */
export class RedisCache {
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    size: 0,
    hitRate: 0,
  };

  constructor() {
    this.setupEventHandlers();
  }

  /**
   * Configurar event handlers para Redis
   */
  private setupEventHandlers(): void {
    redisClient.on('connect', () => {
      console.log('✅ Redis conectado exitosamente');
    });

    redisClient.on('error', (error) => {
      console.error('❌ Error de Redis:', error);
    });

    redisClient.on('ready', () => {
      console.log('🚀 Redis listo para operaciones');
    });
  }

  /**
   * Generar clave de caché
   */
  private generateKey(prefix: string, ...parts: (string | number)[]): string {
    return `${prefix}${parts.join(':')}`;
  }

  /**
   * Comprimir datos si es necesario
   */
  private async compressData(data: any): Promise<string> {
    if (!CACHE_CONFIG.COMPRESSION.ENABLED || 
        JSON.stringify(data).length < CACHE_CONFIG.COMPRESSION.THRESHOLD) {
      return JSON.stringify(data);
    }

    // Usar compresión gzip para datos grandes
    const { gzip } = await import('zlib');
    const gzipAsync = promisify(gzip);
    
    const compressed = await gzipAsync(JSON.stringify(data));
    return compressed.toString('base64');
  }

  /**
   * Descomprimir datos
   */
  private async decompressData(data: string, compressed: boolean): Promise<any> {
    if (!compressed) {
      return JSON.parse(data);
    }

    const { gunzip } = await import('zlib');
    const gunzipAsync = promisify(gunzip);
    
    const buffer = Buffer.from(data, 'base64');
    const decompressed = await gunzipAsync(buffer);
    return JSON.parse(decompressed.toString());
  }

  /**
   * Obtener valor del caché
   */
  async get<T>(key: string, prefix: string = ''): Promise<T | null> {
    try {
      const fullKey = this.generateKey(prefix, key);
      const data = await redisClient.get(fullKey);
      
      if (!data) {
        this.stats.misses++;
        this.updateHitRate();
        return null;
      }

      const item: CacheItem<T> = JSON.parse(data);
      
      // Verificar si ha expirado
      if (Date.now() - item.timestamp > item.ttl * 1000) {
        await this.delete(key, prefix);
        this.stats.misses++;
        this.updateHitRate();
        return null;
      }

      // Descomprimir si es necesario
      const value = await this.decompressData(item.value as any, item.compressed || false);
      
      this.stats.hits++;
      this.updateHitRate();
      
      return value;
    } catch (error) {
      console.error('Error obteniendo del caché Redis:', error);
      this.stats.misses++;
      this.updateHitRate();
      return null;
    }
  }

  /**
   * Establecer valor en caché
   */
  async set<T>(
    key: string, 
    value: T, 
    options: CacheOptions = {}
  ): Promise<void> {
    try {
      const {
        ttl = CACHE_CONFIG.TTL.API_RESPONSE,
        compress = CACHE_CONFIG.COMPRESSION.ENABLED,
        tags = []
      } = options;

      const fullKey = this.generateKey(CACHE_CONFIG.PREFIXES.API, key);
      
      // Comprimir si es necesario
      const compressedValue = await this.compressData(value);
      
      const item: CacheItem<T> = {
        value: compressedValue as any,
        timestamp: Date.now(),
        ttl,
        tags,
        compressed: compress && JSON.stringify(value).length >= CACHE_CONFIG.COMPRESSION.THRESHOLD,
      };

      // Guardar en Redis
      await redisWriter.setex(fullKey, ttl, JSON.stringify(item));
      
      // Guardar tags para invalidación
      if (tags.length > 0) {
        await this.saveTags(fullKey, tags);
      }

      this.stats.sets++;
      this.stats.size = await this.getSize();
    } catch (error) {
      console.error('Error estableciendo en caché Redis:', error);
    }
  }

  /**
   * Eliminar del caché
   */
  async delete(key: string, prefix: string = ''): Promise<boolean> {
    try {
      const fullKey = this.generateKey(prefix, key);
      const result = await redisWriter.del(fullKey);
      
      if (result > 0) {
        this.stats.deletes++;
        this.stats.size = await this.getSize();
      }
      
      return result > 0;
    } catch (error) {
      console.error('Error eliminando del caché Redis:', error);
      return false;
    }
  }

  /**
   * Invalidar por tags
   */
  async invalidateByTags(tags: string[]): Promise<number> {
    try {
      let deletedCount = 0;
      
      for (const tag of tags) {
        const tagKey = `tag:${tag}`;
        const keys = await redisClient.smembers(tagKey);
        
        if (keys.length > 0) {
          const deleted = await redisWriter.del(...keys);
          deletedCount += deleted;
          
          // Eliminar el tag
          await redisWriter.del(tagKey);
        }
      }
      
      this.stats.deletes += deletedCount;
      this.stats.size = await this.getSize();
      
      return deletedCount;
    } catch (error) {
      console.error('Error invalidando por tags:', error);
      return 0;
    }
  }

  /**
   * Guardar tags para invalidación
   */
  private async saveTags(key: string, tags: string[]): Promise<void> {
    try {
      for (const tag of tags) {
        const tagKey = `tag:${tag}`;
        await redisWriter.sadd(tagKey, key);
        // Los tags no expiran para permitir invalidación manual
      }
    } catch (error) {
      console.error('Error guardando tags:', error);
    }
  }

  /**
   * Obtener múltiples valores
   */
  async mget<T>(keys: string[], prefix: string = ''): Promise<(T | null)[]> {
    try {
      const fullKeys = keys.map(key => this.generateKey(prefix, key));
      const values = await redisClient.mget(...fullKeys);
      
      const results: (T | null)[] = [];
      
      for (let i = 0; i < values.length; i++) {
        if (!values[i]) {
          results.push(null);
          this.stats.misses++;
          continue;
        }

        try {
          const item: CacheItem<T> = JSON.parse(values[i]!);
          
          // Verificar expiración
          if (Date.now() - item.timestamp > item.ttl * 1000) {
            await this.delete(keys[i], prefix);
            results.push(null);
            this.stats.misses++;
            continue;
          }

          // Descomprimir si es necesario
          const value = await this.decompressData(item.value as any, item.compressed || false);
          results.push(value);
          this.stats.hits++;
        } catch (error) {
          console.error('Error procesando valor del caché:', error);
          results.push(null);
          this.stats.misses++;
        }
      }
      
      this.updateHitRate();
      return results;
    } catch (error) {
      console.error('Error en mget:', error);
      return keys.map(() => null);
    }
  }

  /**
   * Establecer múltiples valores
   */
  async mset<T>(
    items: Array<{ key: string; value: T; options?: CacheOptions }>,
    prefix: string = ''
  ): Promise<void> {
    try {
      const pipeline = redisWriter.pipeline();
      
      for (const item of items) {
        const {
          ttl = CACHE_CONFIG.TTL.API_RESPONSE,
          compress = CACHE_CONFIG.COMPRESSION.ENABLED,
          tags = []
        } = item.options || {};

        const fullKey = this.generateKey(prefix, item.key);
        const compressedValue = await this.compressData(item.value);
        
        const cacheItem: CacheItem<T> = {
          value: compressedValue as any,
          timestamp: Date.now(),
          ttl,
          tags,
          compressed: compress && JSON.stringify(item.value).length >= CACHE_CONFIG.COMPRESSION.THRESHOLD,
        };

        pipeline.setex(fullKey, ttl, JSON.stringify(cacheItem));
        
        // Guardar tags
        if (tags.length > 0) {
          for (const tag of tags) {
            const tagKey = `tag:${tag}`;
            pipeline.sadd(tagKey, fullKey);
          }
        }
      }
      
      await pipeline.exec();
      this.stats.sets += items.length;
      this.stats.size = await this.getSize();
    } catch (error) {
      console.error('Error en mset:', error);
    }
  }

  /**
   * Limpiar todo el caché
   */
  async clear(): Promise<void> {
    try {
      await redisWriter.flushdb();
      this.stats.size = 0;
      console.log('🗑️ Caché Redis limpiado');
    } catch (error) {
      console.error('Error limpiando caché Redis:', error);
    }
  }

  /**
   * Obtener estadísticas
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * Obtener tamaño del caché
   */
  private async getSize(): Promise<number> {
    try {
      return await redisClient.dbsize();
    } catch (error) {
      console.error('Error obteniendo tamaño del caché:', error);
      return 0;
    }
  }

  /**
   * Actualizar tasa de aciertos
   */
  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? this.stats.hits / total : 0;
  }

  /**
   * Verificar conexión
   */
  async ping(): Promise<boolean> {
    try {
      const result = await redisClient.ping();
      return result === 'PONG';
    } catch (error) {
      console.error('Error en ping de Redis:', error);
      return false;
    }
  }

  /**
   * Obtener información del servidor
   */
  async getInfo(): Promise<any> {
    try {
      const info = await redisClient.info();
      return this.parseRedisInfo(info);
    } catch (error) {
      console.error('Error obteniendo info de Redis:', error);
      return null;
    }
  }

  /**
   * Parsear información de Redis
   */
  private parseRedisInfo(info: string): any {
    const lines = info.split('\r\n');
    const result: any = {};
    
    for (const line of lines) {
      if (line.includes(':')) {
        const [key, value] = line.split(':');
        result[key] = value;
      }
    }
    
    return result;
  }

  /**
   * Cerrar conexiones
   */
  async close(): Promise<void> {
    try {
      await redisClient.quit();
      await redisSubscriber.quit();
      await redisWriter.quit();
      console.log('🔌 Conexiones Redis cerradas');
    } catch (error) {
      console.error('Error cerrando conexiones Redis:', error);
    }
  }
}

// Instancia singleton
export const redisCache = new RedisCache();

// Funciones de utilidad específicas por tipo de dato
export const sessionCache = {
  get: (key: string) => redisCache.get(key, CACHE_CONFIG.PREFIXES.SESSION),
  set: (key: string, value: any) => redisCache.set(key, value, { 
    ttl: CACHE_CONFIG.TTL.SESSION,
    tags: ['session']
  }),
  delete: (key: string) => redisCache.delete(key, CACHE_CONFIG.PREFIXES.SESSION),
};

export const userCache = {
  get: (key: string) => redisCache.get(key, CACHE_CONFIG.PREFIXES.USER),
  set: (key: string, value: any) => redisCache.set(key, value, { 
    ttl: CACHE_CONFIG.TTL.USER,
    tags: ['user']
  }),
  delete: (key: string) => redisCache.delete(key, CACHE_CONFIG.PREFIXES.USER),
};

export const aiModelCache = {
  get: (key: string) => redisCache.get(key, CACHE_CONFIG.PREFIXES.AI_MODEL),
  set: (key: string, value: any) => redisCache.set(key, value, { 
    ttl: CACHE_CONFIG.TTL.AI_MODEL,
    tags: ['ai', 'model'],
    compress: true
  }),
  delete: (key: string) => redisCache.delete(key, CACHE_CONFIG.PREFIXES.AI_MODEL),
};

export const contentCache = {
  get: (key: string) => redisCache.get(key, CACHE_CONFIG.PREFIXES.CONTENT),
  set: (key: string, value: any) => redisCache.set(key, value, { 
    ttl: CACHE_CONFIG.TTL.CONTENT,
    tags: ['content'],
    compress: true
  }),
  delete: (key: string) => redisCache.delete(key, CACHE_CONFIG.PREFIXES.CONTENT),
};

export const imageCache = {
  get: (key: string) => redisCache.get(key, CACHE_CONFIG.PREFIXES.IMAGE),
  set: (key: string, value: any) => redisCache.set(key, value, { 
    ttl: CACHE_CONFIG.TTL.IMAGE,
    tags: ['image'],
    compress: true
  }),
  delete: (key: string) => redisCache.delete(key, CACHE_CONFIG.PREFIXES.IMAGE),
};

// Hook para React
export const useRedisCache = () => {
  const get = React.useCallback(async <T>(key: string, prefix?: string) => {
    return await redisCache.get<T>(key, prefix);
  }, []);

  const set = React.useCallback(async <T>(key: string, value: T, options?: CacheOptions) => {
    await redisCache.set(key, value, options);
  }, []);

  const del = React.useCallback(async (key: string, prefix?: string) => {
    return await redisCache.delete(key, prefix);
  }, []);

  const invalidateTags = React.useCallback(async (tags: string[]) => {
    return await redisCache.invalidateByTags(tags);
  }, []);

  const stats = React.useCallback(() => {
    return redisCache.getStats();
  }, []);

  return { get, set, delete: del, invalidateTags, stats };
};

// Función para obtener datos con fallback a caché
export const getWithRedisCache = async <T>(
  key: string,
  fetcher: () => Promise<T>,
  options: CacheOptions = {}
): Promise<T> => {
  // Intentar obtener del caché
  const cached = await redisCache.get<T>(key);
  if (cached !== null) {
    return cached;
  }

  // Si no está en caché, obtener y guardar
  try {
    const data = await fetcher();
    await redisCache.set(key, data, options);
    return data;
  } catch (error) {
    console.error('Error fetching data for Redis cache:', error);
    throw error;
  }
};

// Limpiar al cerrar la aplicación
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    redisCache.close();
  });
}

export default redisCache;
