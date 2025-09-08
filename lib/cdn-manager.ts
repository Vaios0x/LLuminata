// Interfaces para el CDN
interface CDNConfig {
  baseUrl: string;
  apiKey?: string;
  region?: string;
  cacheControl?: string;
  maxAge?: number;
}

interface AssetOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'jpg' | 'png';
  priority?: 'high' | 'normal' | 'low';
  cache?: boolean;
}

interface UploadOptions {
  public?: boolean;
  folder?: string;
  metadata?: Record<string, string>;
}

interface CDNStats {
  totalAssets: number;
  totalSize: number;
  cacheHitRate: number;
  bandwidth: number;
}

// Clase principal del CDN Manager
class CDNManager {
  private config: CDNConfig;
  private cache: Map<string, { data: any; timestamp: number; ttl: number }>;

  constructor(config: CDNConfig) {
    this.config = {
      baseUrl: config.baseUrl,
      apiKey: config.apiKey,
      region: config.region || 'us-east-1',
      cacheControl: config.cacheControl || 'public, max-age=31536000',
      maxAge: config.maxAge || 31536000,
    };
    this.cache = new Map();
  }

  /**
   * Obtiene un asset del CDN con opciones de optimización
   */
  async getAsset(path: string, options: AssetOptions = {}): Promise<string> {
    const cacheKey = `${path}-${JSON.stringify(options)}`;
    
    // Verificar cache local
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data;
    }

    try {
      let url = `${this.config.baseUrl}/${path}`;
      const params = new URLSearchParams();

      if (options.width) params.append('w', options.width.toString());
      if (options.height) params.append('h', options.height.toString());
      if (options.quality) params.append('q', options.quality.toString());
      if (options.format) params.append('f', options.format);
      if (options.priority) params.append('p', options.priority);

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      // Simular respuesta del CDN
      const response = await fetch(url, {
        headers: {
          'Cache-Control': this.config.cacheControl,
          ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` }),
        },
      });

      if (!response.ok) {
        throw new Error(`CDN error: ${response.status} ${response.statusText}`);
      }

      const finalUrl = response.url;
      
      // Guardar en cache local
      this.cache.set(cacheKey, {
        data: finalUrl,
        timestamp: Date.now(),
        ttl: options.cache ? this.config.maxAge : 60000, // 1 minuto si no hay cache
      });

      return finalUrl;
    } catch (error) {
      console.error('Error obteniendo asset del CDN:', error);
      // Fallback a URL original
      return `${this.config.baseUrl}/${path}`;
    }
  }

  /**
   * Optimiza una imagen con las opciones especificadas
   */
  async optimizeImage(
    src: string, 
    options: AssetOptions = {}
  ): Promise<string> {
    // Si es una URL externa, devolver como está
    if (src.startsWith('http') && !src.includes(this.config.baseUrl)) {
      return src;
    }

    // Extraer path del src
    const path = src.replace(this.config.baseUrl, '').replace(/^\//, '');
    
    return this.getAsset(path, {
      ...options,
      format: options.format || 'webp',
      quality: options.quality || 85,
    });
  }

  /**
   * Sube un asset al CDN
   */
  async uploadAsset(
    file: File | Blob,
    path: string,
    options: UploadOptions = {}
  ): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('path', path);
      formData.append('public', options.public?.toString() || 'true');
      formData.append('folder', options.folder || 'uploads');
      
      if (options.metadata) {
        Object.entries(options.metadata).forEach(([key, value]) => {
          formData.append(`metadata[${key}]`, value);
        });
      }

      const response = await fetch(`${this.config.baseUrl}/upload`, {
        method: 'POST',
        headers: {
          ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` }),
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Error subiendo asset: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      return result.url;
    } catch (error) {
      console.error('Error subiendo asset al CDN:', error);
      throw error;
    }
  }

  /**
   * Invalida el cache del CDN para rutas específicas
   */
  async invalidateCache(paths: string[]): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.baseUrl}/invalidate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` }),
        },
        body: JSON.stringify({ paths }),
      });

      if (!response.ok) {
        throw new Error(`Error invalidando cache: ${response.status} ${response.statusText}`);
      }

      // Limpiar cache local para estas rutas
      paths.forEach(path => {
        for (const [key] of this.cache) {
          if (key.includes(path)) {
            this.cache.delete(key);
          }
        }
      });

      return true;
    } catch (error) {
      console.error('Error invalidando cache del CDN:', error);
      return false;
    }
  }

  /**
   * Obtiene estadísticas del CDN
   */
  async getStats(): Promise<CDNStats> {
    try {
      const response = await fetch(`${this.config.baseUrl}/stats`, {
        headers: {
          ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` }),
        },
      });

      if (!response.ok) {
        throw new Error(`Error obteniendo estadísticas: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error obteniendo estadísticas del CDN:', error);
      // Devolver estadísticas por defecto
      return {
        totalAssets: 0,
        totalSize: 0,
        cacheHitRate: 0,
        bandwidth: 0,
      };
    }
  }

  /**
   * Limpia el cache local
   */
  clearLocalCache(): void {
    this.cache.clear();
  }

  /**
   * Obtiene información del cache local
   */
  getLocalCacheInfo(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

// Instancia global del CDN Manager
const cdnManager = new CDNManager({
  baseUrl: process.env.NEXT_PUBLIC_CDN_URL || 'https://cdn.example.com',
  apiKey: process.env.CDN_API_KEY,
  region: process.env.CDN_REGION || 'us-east-1',
});

export default cdnManager;
