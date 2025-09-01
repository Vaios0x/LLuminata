// Sistema de caché optimizado para InclusiveAI Coach

interface CacheItem<T> {
  value: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
}

interface CacheOptions {
  maxSize?: number;
  defaultTTL?: number;
  cleanupInterval?: number;
  enableStats?: boolean;
}

interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  size: number;
  maxSize: number;
  hitRate: number;
}

class OptimizedCache<T = any> {
  private cache = new Map<string, CacheItem<T>>();
  private stats: CacheStats;
  private options: Required<CacheOptions>;
  private cleanupTimer?: NodeJS.Timeout;

  constructor(options: CacheOptions = {}) {
    this.options = {
      maxSize: options.maxSize || 1000,
      defaultTTL: options.defaultTTL || 5 * 60 * 1000, // 5 minutos
      cleanupInterval: options.cleanupInterval || 60 * 1000, // 1 minuto
      enableStats: options.enableStats ?? true,
    };

    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      size: 0,
      maxSize: this.options.maxSize,
      hitRate: 0,
    };

    this.startCleanup();
  }

  // Obtener valor del caché
  get(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      this.stats.misses++;
      this.updateHitRate();
      return null;
    }

    // Verificar si ha expirado
    if (Date.now() - item.timestamp > item.ttl) {
      this.delete(key);
      this.stats.misses++;
      this.updateHitRate();
      return null;
    }

    // Actualizar estadísticas de acceso
    item.accessCount++;
    item.lastAccessed = Date.now();
    this.stats.hits++;
    this.updateHitRate();

    return item.value;
  }

  // Establecer valor en el caché
  set(key: string, value: T, ttl?: number): void {
    const now = Date.now();
    const itemTTL = ttl || this.options.defaultTTL;

    // Si el caché está lleno, eliminar el elemento menos usado
    if (this.cache.size >= this.options.maxSize) {
      this.evictLRU();
    }

    this.cache.set(key, {
      value,
      timestamp: now,
      ttl: itemTTL,
      accessCount: 0,
      lastAccessed: now,
    });

    this.stats.sets++;
    this.stats.size = this.cache.size;
  }

  // Eliminar elemento del caché
  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.stats.deletes++;
      this.stats.size = this.cache.size;
    }
    return deleted;
  }

  // Limpiar todo el caché
  clear(): void {
    this.cache.clear();
    this.stats.size = 0;
  }

  // Verificar si existe una clave
  has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return false;

    // Verificar si ha expirado
    if (Date.now() - item.timestamp > item.ttl) {
      this.delete(key);
      return false;
    }

    return true;
  }

  // Obtener estadísticas del caché
  getStats(): CacheStats {
    return { ...this.stats };
  }

  // Obtener tamaño del caché
  size(): number {
    return this.cache.size;
  }

  // Obtener todas las claves
  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  // Obtener todos los valores
  values(): T[] {
    return Array.from(this.cache.values()).map(item => item.value);
  }

  // Eliminar elementos expirados
  private cleanup(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        expiredKeys.push(key);
      }
    }

    expiredKeys.forEach(key => this.delete(key));
  }

  // Eliminar el elemento menos usado recientemente (LRU)
  private evictLRU(): void {
    let lruKey = '';
    let lruTime = Date.now();

    for (const [key, item] of this.cache.entries()) {
      if (item.lastAccessed < lruTime) {
        lruTime = item.lastAccessed;
        lruKey = key;
      }
    }

    if (lruKey) {
      this.delete(lruKey);
    }
  }

  // Actualizar tasa de aciertos
  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? this.stats.hits / total : 0;
  }

  // Iniciar limpieza automática
  private startCleanup(): void {
    if (this.options.cleanupInterval > 0) {
      this.cleanupTimer = setInterval(() => {
        this.cleanup();
      }, this.options.cleanupInterval);
    }
  }

  // Detener limpieza automática
  stop(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
  }
}

// Caché en memoria para datos de sesión
export const sessionCache = new OptimizedCache({
  maxSize: 100,
  defaultTTL: 30 * 60 * 1000, // 30 minutos
  cleanupInterval: 5 * 60 * 1000, // 5 minutos
});

// Caché para datos de usuario
export const userCache = new OptimizedCache({
  maxSize: 500,
  defaultTTL: 15 * 60 * 1000, // 15 minutos
  cleanupInterval: 2 * 60 * 1000, // 2 minutos
});

// Caché para datos de IA
export const aiCache = new OptimizedCache({
  maxSize: 200,
  defaultTTL: 10 * 60 * 1000, // 10 minutos
  cleanupInterval: 1 * 60 * 1000, // 1 minuto
});

// Caché para datos de contenido educativo
export const contentCache = new OptimizedCache({
  maxSize: 1000,
  defaultTTL: 60 * 60 * 1000, // 1 hora
  cleanupInterval: 10 * 60 * 1000, // 10 minutos
});

// Caché para imágenes
export const imageCache = new OptimizedCache<string>({
  maxSize: 100,
  defaultTTL: 24 * 60 * 60 * 1000, // 24 horas
  cleanupInterval: 30 * 60 * 1000, // 30 minutos
});

// Hook para usar caché en componentes React
export const useCache = <T>(cache: OptimizedCache<T>) => {
  const get = React.useCallback((key: string) => cache.get(key), [cache]);
  const set = React.useCallback((key: string, value: T, ttl?: number) => {
    cache.set(key, value, ttl);
  }, [cache]);
  const del = React.useCallback((key: string) => cache.delete(key), [cache]);
  const has = React.useCallback((key: string) => cache.has(key), [cache]);
  const clear = React.useCallback(() => cache.clear(), [cache]);
  const stats = React.useCallback(() => cache.getStats(), [cache]);

  return { get, set, delete: del, has, clear, stats };
};

// Función para generar claves de caché consistentes
export const generateCacheKey = (...parts: (string | number)[]): string => {
  return parts.join(':');
};

// Función para invalidar caché por patrón
export const invalidateCacheByPattern = (cache: OptimizedCache, pattern: RegExp): number => {
  let deletedCount = 0;
  const keys = cache.keys();

  for (const key of keys) {
    if (pattern.test(key)) {
      if (cache.delete(key)) {
        deletedCount++;
      }
    }
  }

  return deletedCount;
};

// Función para precargar datos en caché
export const preloadCache = async <T>(
  cache: OptimizedCache<T>,
  data: Array<{ key: string; value: T; ttl?: number }>
): Promise<void> => {
  for (const item of data) {
    cache.set(item.key, item.value, item.ttl);
  }
};

// Función para obtener datos con fallback a caché
export const getWithCache = async <T>(
  cache: OptimizedCache<T>,
  key: string,
  fetcher: () => Promise<T>,
  ttl?: number
): Promise<T> => {
  // Intentar obtener del caché
  const cached = cache.get(key);
  if (cached !== null) {
    return cached;
  }

  // Si no está en caché, obtener y guardar
  try {
    const data = await fetcher();
    cache.set(key, data, ttl);
    return data;
  } catch (error) {
    console.error('Error fetching data for cache:', error);
    throw error;
  }
};

// Función para limpiar todos los caches
export const clearAllCaches = (): void => {
  sessionCache.clear();
  userCache.clear();
  aiCache.clear();
  contentCache.clear();
  imageCache.clear();
};

// Función para obtener estadísticas de todos los caches
export const getAllCacheStats = () => {
  return {
    session: sessionCache.getStats(),
    user: userCache.getStats(),
    ai: aiCache.getStats(),
    content: contentCache.getStats(),
    image: imageCache.getStats(),
  };
};

// Limpiar caches al cerrar la aplicación
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    clearAllCaches();
  });
}

export default OptimizedCache;
