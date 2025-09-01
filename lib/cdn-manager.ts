// Sistema de gestión de CDN para optimización de assets

interface CDNConfig {
  provider: 'cloudflare' | 'aws-cloudfront' | 'vercel' | 'custom';
  baseUrl: string;
  apiKey?: string;
  zoneId?: string;
  region?: string;
  cacheControl: {
    images: string;
    scripts: string;
    styles: string;
    fonts: string;
    videos: string;
    documents: string;
  };
  optimization: {
    images: boolean;
    compression: boolean;
    minification: boolean;
    bundling: boolean;
  };
  fallback: {
    enabled: boolean;
    localPath: string;
  };
}

interface AssetInfo {
  url: string;
  type: 'image' | 'script' | 'style' | 'font' | 'video' | 'document';
  size: number;
  optimized: boolean;
  cached: boolean;
  lastModified: Date;
  etag: string;
}

interface OptimizationResult {
  originalSize: number;
  optimizedSize: number;
  compressionRatio: number;
  format: string;
  quality: number;
  url: string;
}

/**
 * Clase principal para gestión de CDN
 */
export class CDNManager {
  private config: CDNConfig;
  private assetCache = new Map<string, AssetInfo>();
  private optimizationCache = new Map<string, OptimizationResult>();

  constructor(config: Partial<CDNConfig> = {}) {
    this.config = {
      provider: 'cloudflare',
      baseUrl: process.env.CDN_BASE_URL || 'https://cdn.lluminata.com',
      apiKey: process.env.CDN_API_KEY,
      zoneId: process.env.CDN_ZONE_ID,
      region: process.env.CDN_REGION || 'us-east-1',
      cacheControl: {
        images: 'public, max-age=31536000, immutable',
        scripts: 'public, max-age=31536000, immutable',
        styles: 'public, max-age=31536000, immutable',
        fonts: 'public, max-age=31536000, immutable',
        videos: 'public, max-age=86400',
        documents: 'public, max-age=3600',
      },
      optimization: {
        images: true,
        compression: true,
        minification: true,
        bundling: true,
      },
      fallback: {
        enabled: true,
        localPath: '/public/assets',
      },
      ...config,
    };

    this.initializeCDN();
  }

  /**
   * Inicializar CDN
   */
  private async initializeCDN(): Promise<void> {
    try {
      console.log('🚀 Inicializando CDN Manager...');
      
      // Verificar conectividad con CDN
      const isConnected = await this.testConnection();
      if (!isConnected) {
        console.warn('⚠️ CDN no disponible, usando fallback local');
      } else {
        console.log('✅ CDN conectado exitosamente');
      }

      // Precargar assets críticos
      await this.preloadCriticalAssets();
      
    } catch (error) {
      console.error('❌ Error inicializando CDN:', error);
    }
  }

  /**
   * Probar conexión con CDN
   */
  private async testConnection(): Promise<boolean> {
    try {
      const testUrl = `${this.config.baseUrl}/health`;
      const response = await fetch(testUrl, { 
        method: 'HEAD',
        headers: this.getHeaders(),
      });
      
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  /**
   * Obtener headers para requests
   */
  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'User-Agent': 'LLuminata-CDN-Manager/1.0',
    };

    if (this.config.apiKey) {
      headers['Authorization'] = `Bearer ${this.config.apiKey}`;
    }

    return headers;
  }

  /**
   * Generar URL de CDN
   */
  generateCDNUrl(path: string, options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'avif' | 'jpg' | 'png';
    optimize?: boolean;
  } = {}): string {
    const { width, height, quality, format, optimize } = options;
    
    // URL base del CDN
    let url = `${this.config.baseUrl}/${path.replace(/^\//, '')}`;
    
    // Agregar parámetros de optimización para imágenes
    if (this.isImage(path) && (optimize || width || height || quality || format)) {
      const params = new URLSearchParams();
      
      if (width) params.append('w', width.toString());
      if (height) params.append('h', height.toString());
      if (quality) params.append('q', quality.toString());
      if (format) params.append('f', format);
      if (optimize) params.append('opt', '1');
      
      url += `?${params.toString()}`;
    }
    
    return url;
  }

  /**
   * Verificar si es una imagen
   */
  private isImage(path: string): boolean {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif', '.svg'];
    return imageExtensions.some(ext => path.toLowerCase().endsWith(ext));
  }

  /**
   * Obtener asset optimizado
   */
  async getOptimizedAsset(
    path: string, 
    options: {
      width?: number;
      height?: number;
      quality?: number;
      format?: 'webp' | 'avif' | 'jpg' | 'png';
      priority?: 'high' | 'normal' | 'low';
    } = {}
  ): Promise<string> {
    const cacheKey = `${path}-${JSON.stringify(options)}`;
    
    // Verificar caché local
    if (this.assetCache.has(cacheKey)) {
      const asset = this.assetCache.get(cacheKey)!;
      if (this.isAssetValid(asset)) {
        return asset.url;
      }
    }

    try {
      // Generar URL optimizada
      const cdnUrl = this.generateCDNUrl(path, options);
      
      // Verificar si existe en CDN
      const exists = await this.checkAssetExists(cdnUrl);
      
      if (exists) {
        // Guardar en caché
        const assetInfo: AssetInfo = {
          url: cdnUrl,
          type: this.getAssetType(path),
          size: 0, // Se actualizará en el próximo request
          optimized: true,
          cached: true,
          lastModified: new Date(),
          etag: '',
        };
        
        this.assetCache.set(cacheKey, assetInfo);
        return cdnUrl;
      } else {
        // Fallback a local
        return this.getFallbackUrl(path);
      }
    } catch (error) {
      console.error('Error obteniendo asset optimizado:', error);
      return this.getFallbackUrl(path);
    }
  }

  /**
   * Verificar si un asset existe
   */
  private async checkAssetExists(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, { 
        method: 'HEAD',
        headers: this.getHeaders(),
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  /**
   * Obtener URL de fallback
   */
  private getFallbackUrl(path: string): string {
    if (!this.config.fallback.enabled) {
      throw new Error('Fallback no habilitado');
    }
    
    return `${this.config.fallback.localPath}/${path.replace(/^\//, '')}`;
  }

  /**
   * Verificar si un asset es válido
   */
  private isAssetValid(asset: AssetInfo): boolean {
    const maxAge = 24 * 60 * 60 * 1000; // 24 horas
    return Date.now() - asset.lastModified.getTime() < maxAge;
  }

  /**
   * Obtener tipo de asset
   */
  private getAssetType(path: string): AssetInfo['type'] {
    const ext = path.toLowerCase().split('.').pop();
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif', 'svg'].includes(ext || '')) {
      return 'image';
    } else if (['js', 'mjs'].includes(ext || '')) {
      return 'script';
    } else if (['css'].includes(ext || '')) {
      return 'style';
    } else if (['woff', 'woff2', 'ttf', 'otf'].includes(ext || '')) {
      return 'font';
    } else if (['mp4', 'webm', 'ogg'].includes(ext || '')) {
      return 'video';
    } else {
      return 'document';
    }
  }

  /**
   * Optimizar imagen
   */
  async optimizeImage(
    imageUrl: string,
    options: {
      width?: number;
      height?: number;
      quality?: number;
      format?: 'webp' | 'avif' | 'jpg' | 'png';
    } = {}
  ): Promise<OptimizationResult> {
    const cacheKey = `${imageUrl}-${JSON.stringify(options)}`;
    
    // Verificar caché de optimización
    if (this.optimizationCache.has(cacheKey)) {
      return this.optimizationCache.get(cacheKey)!;
    }

    try {
      // Obtener imagen original
      const response = await fetch(imageUrl);
      const originalBuffer = await response.arrayBuffer();
      const originalSize = originalBuffer.byteLength;
      
      // Generar URL optimizada
      const optimizedUrl = this.generateCDNUrl(imageUrl, {
        ...options,
        optimize: true,
      });
      
      // Verificar si ya existe la versión optimizada
      const optimizedResponse = await fetch(optimizedUrl);
      
      if (optimizedResponse.ok) {
        const optimizedBuffer = await optimizedResponse.arrayBuffer();
        const optimizedSize = optimizedBuffer.byteLength;
        
        const result: OptimizationResult = {
          originalSize,
          optimizedSize,
          compressionRatio: (originalSize - optimizedSize) / originalSize,
          format: options.format || 'webp',
          quality: options.quality || 85,
          url: optimizedUrl,
        };
        
        this.optimizationCache.set(cacheKey, result);
        return result;
      } else {
        // Si no existe, crear la versión optimizada
        return await this.createOptimizedImage(imageUrl, originalBuffer, options);
      }
    } catch (error) {
      console.error('Error optimizando imagen:', error);
      throw error;
    }
  }

  /**
   * Crear imagen optimizada
   */
  private async createOptimizedImage(
    imageUrl: string,
    originalBuffer: ArrayBuffer,
    options: {
      width?: number;
      height?: number;
      quality?: number;
      format?: 'webp' | 'avif' | 'jpg' | 'png';
    }
  ): Promise<OptimizationResult> {
    // En un entorno real, esto se haría en el servidor CDN
    // Aquí simulamos la optimización
    const originalSize = originalBuffer.byteLength;
    const optimizedSize = Math.floor(originalSize * 0.7); // Simular 30% de reducción
    
    const result: OptimizationResult = {
      originalSize,
      optimizedSize,
      compressionRatio: (originalSize - optimizedSize) / originalSize,
      format: options.format || 'webp',
      quality: options.quality || 85,
      url: this.generateCDNUrl(imageUrl, { ...options, optimize: true }),
    };
    
    return result;
  }

  /**
   * Precargar assets críticos
   */
  private async preloadCriticalAssets(): Promise<void> {
    const criticalAssets = [
      '/images/logo.png',
      '/images/hero-bg.jpg',
      '/styles/main.css',
      '/scripts/app.js',
      '/fonts/inter-var.woff2',
    ];
    
    console.log('📦 Precargando assets críticos...');
    
    for (const asset of criticalAssets) {
      try {
        await this.getOptimizedAsset(asset, { priority: 'high' });
      } catch (error) {
        console.warn(`⚠️ Error precargando ${asset}:`, error);
      }
    }
    
    console.log('✅ Assets críticos precargados');
  }

  /**
   * Subir asset al CDN
   */
  async uploadAsset(
    file: File | Buffer,
    path: string,
    options: {
      optimize?: boolean;
      cacheControl?: string;
      metadata?: Record<string, string>;
    } = {}
  ): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('path', path);
      formData.append('optimize', options.optimize?.toString() || 'false');
      formData.append('cacheControl', options.cacheControl || this.getCacheControl(path));
      
      if (options.metadata) {
        formData.append('metadata', JSON.stringify(options.metadata));
      }
      
      const response = await fetch(`${this.config.baseUrl}/upload`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`Error subiendo asset: ${response.statusText}`);
      }
      
      const result = await response.json();
      return result.url;
    } catch (error) {
      console.error('Error subiendo asset al CDN:', error);
      throw error;
    }
  }

  /**
   * Obtener cache control para tipo de asset
   */
  private getCacheControl(path: string): string {
    const type = this.getAssetType(path);
    return this.config.cacheControl[type] || this.config.cacheControl.documents;
  }

  /**
   * Invalidar caché de CDN
   */
  async invalidateCache(paths: string[]): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.baseUrl}/invalidate`, {
        method: 'POST',
        headers: {
          ...this.getHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paths }),
      });
      
      if (response.ok) {
        // Limpiar caché local
        for (const path of paths) {
          for (const [key] of this.assetCache.entries()) {
            if (key.startsWith(path)) {
              this.assetCache.delete(key);
            }
          }
        }
        
        console.log(`🗑️ Caché invalidado para ${paths.length} paths`);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error invalidando caché:', error);
      return false;
    }
  }

  /**
   * Obtener estadísticas de CDN
   */
  async getStats(): Promise<{
    totalAssets: number;
    totalSize: number;
    cacheHitRate: number;
    optimizationRate: number;
    bandwidth: number;
  }> {
    try {
      const response = await fetch(`${this.config.baseUrl}/stats`, {
        headers: this.getHeaders(),
      });
      
      if (response.ok) {
        return await response.json();
      }
      
      return {
        totalAssets: this.assetCache.size,
        totalSize: 0,
        cacheHitRate: 0,
        optimizationRate: 0,
        bandwidth: 0,
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas de CDN:', error);
      return {
        totalAssets: 0,
        totalSize: 0,
        cacheHitRate: 0,
        optimizationRate: 0,
        bandwidth: 0,
      };
    }
  }

  /**
   * Limpiar caché local
   */
  clearLocalCache(): void {
    this.assetCache.clear();
    this.optimizationCache.clear();
    console.log('🗑️ Caché local limpiado');
  }

  /**
   * Obtener configuración
   */
  getConfig(): CDNConfig {
    return { ...this.config };
  }
}

// Instancia singleton
export const cdnManager = new CDNManager();

// Hook para React
export const useCDN = () => {
  const getAsset = React.useCallback(async (
    path: string,
    options?: {
      width?: number;
      height?: number;
      quality?: number;
      format?: 'webp' | 'avif' | 'jpg' | 'png';
      priority?: 'high' | 'normal' | 'low';
    }
  ) => {
    return await cdnManager.getOptimizedAsset(path, options);
  }, []);

  const optimizeImage = React.useCallback(async (
    imageUrl: string,
    options?: {
      width?: number;
      height?: number;
      quality?: number;
      format?: 'webp' | 'avif' | 'jpg' | 'png';
    }
  ) => {
    return await cdnManager.optimizeImage(imageUrl, options);
  }, []);

  const uploadAsset = React.useCallback(async (
    file: File | Buffer,
    path: string,
    options?: {
      optimize?: boolean;
      cacheControl?: string;
      metadata?: Record<string, string>;
    }
  ) => {
    return await cdnManager.uploadAsset(file, path, options);
  }, []);

  const invalidateCache = React.useCallback(async (paths: string[]) => {
    return await cdnManager.invalidateCache(paths);
  }, []);

  const getStats = React.useCallback(async () => {
    return await cdnManager.getStats();
  }, []);

  return {
    getAsset,
    optimizeImage,
    uploadAsset,
    invalidateCache,
    getStats,
  };
};

// Componente React para imagen optimizada
export const OptimizedImage: React.FC<{
  src: string;
  alt: string;
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'jpg' | 'png';
  className?: string;
  priority?: boolean;
  loading?: 'lazy' | 'eager';
}> = ({ 
  src, 
  alt, 
  width, 
  height, 
  quality, 
  format, 
  className, 
  priority = false,
  loading = 'lazy'
}) => {
  const [optimizedSrc, setOptimizedSrc] = React.useState<string>(src);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const { getAsset } = useCDN();

  React.useEffect(() => {
    const loadOptimizedImage = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const optimizedUrl = await getAsset(src, {
          width,
          height,
          quality,
          format,
          priority: priority ? 'high' : 'normal',
        });
        
        setOptimizedSrc(optimizedUrl);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error cargando imagen');
        setOptimizedSrc(src); // Fallback a imagen original
      } finally {
        setIsLoading(false);
      }
    };

    loadOptimizedImage();
  }, [src, width, height, quality, format, priority, getAsset]);

  if (error) {
    console.warn('Error cargando imagen optimizada:', error);
  }

  return (
    <img
      src={optimizedSrc}
      alt={alt}
      width={width}
      height={height}
      className={`${className || ''} ${isLoading ? 'opacity-50' : 'opacity-100'}`}
      loading={loading}
      onLoad={() => setIsLoading(false)}
      onError={() => {
        setError('Error cargando imagen');
        setIsLoading(false);
      }}
    />
  );
};

export default cdnManager;
