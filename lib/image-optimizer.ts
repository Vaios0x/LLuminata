// Sistema de optimización de imágenes para InclusiveAI Coach

import sharp from 'sharp';
import { promises as fs } from 'fs';
import path from 'path';

interface ImageOptimizationOptions {
  quality?: number;
  format?: 'webp' | 'avif' | 'jpeg' | 'png';
  width?: number;
  height?: number;
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
  position?: 'top' | 'right top' | 'right' | 'right bottom' | 'bottom' | 'left bottom' | 'left' | 'left top' | 'center';
  blur?: number;
  sharpen?: number;
  progressive?: boolean;
  strip?: boolean;
  compression?: 'mozjpeg' | 'jpeg' | 'webp' | 'avif';
}

interface OptimizationResult {
  originalSize: number;
  optimizedSize: number;
  compressionRatio: number;
  format: string;
  quality: number;
  dimensions: {
    width: number;
    height: number;
  };
  path: string;
  url: string;
  metadata: {
    format: string;
    width: number;
    height: number;
    channels: number;
    depth: string;
    density: number;
    hasProfile: boolean;
    hasAlpha: boolean;
  };
}

interface ImageCache {
  [key: string]: {
    result: OptimizationResult;
    timestamp: number;
    ttl: number;
  };
}

/**
 * Clase principal para optimización de imágenes
 */
export class ImageOptimizer {
  private cache: ImageCache = {};
  private readonly cacheTTL = 24 * 60 * 60 * 1000; // 24 horas
  private readonly outputDir = 'public/optimized-images';
  private readonly supportedFormats = ['jpg', 'jpeg', 'png', 'webp', 'avif', 'gif', 'svg'];

  constructor() {
    this.initializeOutputDir();
  }

  /**
   * Inicializar directorio de salida
   */
  private async initializeOutputDir(): Promise<void> {
    try {
      await fs.mkdir(this.outputDir, { recursive: true });
      console.log('✅ Directorio de imágenes optimizadas creado');
    } catch (error) {
      console.error('❌ Error creando directorio de salida:', error);
    }
  }

  /**
   * Generar clave de caché
   */
  private generateCacheKey(
    inputPath: string,
    options: ImageOptimizationOptions
  ): string {
    const optionsStr = JSON.stringify(options);
    return `${inputPath}-${Buffer.from(optionsStr).toString('base64')}`;
  }

  /**
   * Verificar si una imagen está en caché
   */
  private isCached(cacheKey: string): boolean {
    const cached = this.cache[cacheKey];
    if (!cached) return false;

    const now = Date.now();
    return now - cached.timestamp < cached.ttl;
  }

  /**
   * Obtener imagen del caché
   */
  private getCached(cacheKey: string): OptimizationResult | null {
    if (!this.isCached(cacheKey)) {
      delete this.cache[cacheKey];
      return null;
    }
    return this.cache[cacheKey].result;
  }

  /**
   * Guardar en caché
   */
  private setCached(cacheKey: string, result: OptimizationResult): void {
    this.cache[cacheKey] = {
      result,
      timestamp: Date.now(),
      ttl: this.cacheTTL,
    };
  }

  /**
   * Verificar si el formato es soportado
   */
  private isSupportedFormat(filePath: string): boolean {
    const ext = path.extname(filePath).toLowerCase().slice(1);
    return this.supportedFormats.includes(ext);
  }

  /**
   * Obtener información de la imagen
   */
  private async getImageInfo(inputPath: string): Promise<sharp.Metadata> {
    try {
      return await sharp(inputPath).metadata();
    } catch (error) {
      throw new Error(`Error obteniendo información de imagen: ${error}`);
    }
  }

  /**
   * Optimizar imagen
   */
  async optimizeImage(
    inputPath: string,
    options: ImageOptimizationOptions = {}
  ): Promise<OptimizationResult> {
    // Verificar si el formato es soportado
    if (!this.isSupportedFormat(inputPath)) {
      throw new Error(`Formato de imagen no soportado: ${path.extname(inputPath)}`);
    }

    // Generar clave de caché
    const cacheKey = this.generateCacheKey(inputPath, options);
    
    // Verificar caché
    const cached = this.getCached(cacheKey);
    if (cached) {
      console.log('📦 Imagen encontrada en caché');
      return cached;
    }

    try {
      console.log(`🔄 Optimizando imagen: ${inputPath}`);
      
      // Obtener información original
      const originalInfo = await this.getImageInfo(inputPath);
      const originalStats = await fs.stat(inputPath);
      const originalSize = originalStats.size;

      // Configurar opciones por defecto
      const {
        quality = 85,
        format = this.detectBestFormat(inputPath),
        width,
        height,
        fit = 'inside',
        position = 'center',
        blur = 0,
        sharpen = 0,
        progressive = true,
        strip = true,
        compression = 'mozjpeg'
      } = options;

      // Crear pipeline de sharp
      let pipeline = sharp(inputPath);

      // Aplicar redimensionamiento si se especifica
      if (width || height) {
        pipeline = pipeline.resize(width, height, {
          fit,
          position,
          withoutEnlargement: true,
          kernel: sharp.kernel.lanczos3,
        });
      }

      // Aplicar efectos
      if (blur > 0) {
        pipeline = pipeline.blur(blur);
      }

      if (sharpen > 0) {
        pipeline = pipeline.sharpen(sharpen);
      }

      // Configurar formato de salida
      pipeline = this.configureOutputFormat(pipeline, format, quality, progressive, strip, compression);

      // Generar nombre de archivo de salida
      const outputFileName = this.generateOutputFileName(inputPath, format, width, height, quality);
      const outputPath = path.join(this.outputDir, outputFileName);

      // Optimizar y guardar
      await pipeline.toFile(outputPath);

      // Obtener información de la imagen optimizada
      const optimizedInfo = await this.getImageInfo(outputPath);
      const optimizedStats = await fs.stat(outputPath);
      const optimizedSize = optimizedStats.size;

      // Calcular ratio de compresión
      const compressionRatio = (originalSize - optimizedSize) / originalSize;

      // Crear resultado
      const result: OptimizationResult = {
        originalSize,
        optimizedSize,
        compressionRatio,
        format,
        quality,
        dimensions: {
          width: optimizedInfo.width || 0,
          height: optimizedInfo.height || 0,
        },
        path: outputPath,
        url: `/optimized-images/${outputFileName}`,
        metadata: {
          format: optimizedInfo.format || '',
          width: optimizedInfo.width || 0,
          height: optimizedInfo.height || 0,
          channels: optimizedInfo.channels || 0,
          depth: optimizedInfo.depth || '',
          density: optimizedInfo.density || 0,
          hasProfile: optimizedInfo.hasProfile || false,
          hasAlpha: optimizedInfo.hasAlpha || false,
        },
      };

      // Guardar en caché
      this.setCached(cacheKey, result);

      console.log(`✅ Imagen optimizada: ${compressionRatio * 100}% de reducción`);
      return result;

    } catch (error) {
      console.error('❌ Error optimizando imagen:', error);
      throw error;
    }
  }

  /**
   * Detectar mejor formato basado en el contenido
   */
  private detectBestFormat(inputPath: string): 'webp' | 'avif' | 'jpeg' | 'png' {
    const ext = path.extname(inputPath).toLowerCase();
    
    // Si ya es un formato moderno, mantenerlo
    if (ext === '.webp') return 'webp';
    if (ext === '.avif') return 'avif';
    
    // Para imágenes con transparencia, usar PNG o WebP
    // Para fotografías, usar WebP o AVIF
    // Por defecto, usar WebP
    return 'webp';
  }

  /**
   * Configurar formato de salida
   */
  private configureOutputFormat(
    pipeline: sharp.Sharp,
    format: string,
    quality: number,
    progressive: boolean,
    strip: boolean,
    compression: string
  ): sharp.Sharp {
    switch (format) {
      case 'webp':
        return pipeline.webp({
          quality,
          effort: 6,
          nearLossless: false,
          smartSubsample: true,
        });

      case 'avif':
        return pipeline.avif({
          quality,
          effort: 6,
          chromaSubsampling: '4:2:0',
        });

      case 'jpeg':
        return pipeline.jpeg({
          quality,
          progressive,
          mozjpeg: compression === 'mozjpeg',
          chromaSubsampling: '4:2:0',
        });

      case 'png':
        return pipeline.png({
          quality,
          progressive,
          compressionLevel: 9,
          adaptiveFiltering: true,
        });

      default:
        return pipeline.webp({ quality });
    }
  }

  /**
   * Generar nombre de archivo de salida
   */
  private generateOutputFileName(
    inputPath: string,
    format: string,
    width?: number,
    height?: number,
    quality?: number
  ): string {
    const baseName = path.basename(inputPath, path.extname(inputPath));
    const sizeSuffix = width || height ? `-${width || 'auto'}x${height || 'auto'}` : '';
    const qualitySuffix = quality ? `-q${quality}` : '';
    return `${baseName}${sizeSuffix}${qualitySuffix}.${format}`;
  }

  /**
   * Optimizar múltiples imágenes
   */
  async optimizeImages(
    inputPaths: string[],
    options: ImageOptimizationOptions = {}
  ): Promise<OptimizationResult[]> {
    console.log(`🔄 Optimizando ${inputPaths.length} imágenes...`);
    
    const results: OptimizationResult[] = [];
    const errors: string[] = [];

    // Procesar en paralelo con límite de concurrencia
    const concurrency = 4;
    const chunks = this.chunkArray(inputPaths, concurrency);

    for (const chunk of chunks) {
      const promises = chunk.map(async (inputPath) => {
        try {
          return await this.optimizeImage(inputPath, options);
        } catch (error) {
          const errorMsg = `Error optimizando ${inputPath}: ${error}`;
          errors.push(errorMsg);
          console.error(errorMsg);
          return null;
        }
      });

      const chunkResults = await Promise.all(promises);
      results.push(...chunkResults.filter(Boolean) as OptimizationResult[]);
    }

    console.log(`✅ Optimización completada: ${results.length} exitosas, ${errors.length} errores`);
    
    if (errors.length > 0) {
      console.warn('⚠️ Errores durante la optimización:', errors);
    }

    return results;
  }

  /**
   * Dividir array en chunks
   */
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  /**
   * Crear diferentes tamaños de imagen
   */
  async createResponsiveImages(
    inputPath: string,
    sizes: Array<{ width: number; height?: number }>,
    options: ImageOptimizationOptions = {}
  ): Promise<OptimizationResult[]> {
    const results: OptimizationResult[] = [];

    for (const size of sizes) {
      try {
        const result = await this.optimizeImage(inputPath, {
          ...options,
          width: size.width,
          height: size.height,
        });
        results.push(result);
      } catch (error) {
        console.error(`Error creando imagen responsive ${size.width}x${size.height}:`, error);
      }
    }

    return results;
  }

  /**
   * Optimizar imagen desde buffer
   */
  async optimizeBuffer(
    buffer: Buffer,
    options: ImageOptimizationOptions = {}
  ): Promise<{ buffer: Buffer; result: OptimizationResult }> {
    try {
      const {
        quality = 85,
        format = 'webp',
        width,
        height,
        fit = 'inside',
        position = 'center',
        progressive = true,
        strip = true,
      } = options;

      let pipeline = sharp(buffer);

      // Aplicar redimensionamiento
      if (width || height) {
        pipeline = pipeline.resize(width, height, {
          fit,
          position,
          withoutEnlargement: true,
        });
      }

      // Configurar formato
      pipeline = this.configureOutputFormat(pipeline, format, quality, progressive, strip, 'mozjpeg');

      // Optimizar
      const optimizedBuffer = await pipeline.toBuffer();
      const metadata = await sharp(optimizedBuffer).metadata();

      const result: OptimizationResult = {
        originalSize: buffer.length,
        optimizedSize: optimizedBuffer.length,
        compressionRatio: (buffer.length - optimizedBuffer.length) / buffer.length,
        format,
        quality,
        dimensions: {
          width: metadata.width || 0,
          height: metadata.height || 0,
        },
        path: '',
        url: '',
        metadata: {
          format: metadata.format || '',
          width: metadata.width || 0,
          height: metadata.height || 0,
          channels: metadata.channels || 0,
          depth: metadata.depth || '',
          density: metadata.density || 0,
          hasProfile: metadata.hasProfile || false,
          hasAlpha: metadata.hasAlpha || false,
        },
      };

      return { buffer: optimizedBuffer, result };
    } catch (error) {
      console.error('Error optimizando buffer:', error);
      throw error;
    }
  }

  /**
   * Generar placeholder para imagen
   */
  async generatePlaceholder(
    inputPath: string,
    options: {
      width?: number;
      height?: number;
      blur?: number;
      quality?: number;
    } = {}
  ): Promise<{ placeholder: string; dominantColor: string }> {
    try {
      const { width = 20, height = 20, blur = 10, quality = 30 } = options;

      // Crear placeholder pequeño y borroso
      const placeholderBuffer = await sharp(inputPath)
        .resize(width, height, { fit: 'cover' })
        .blur(blur)
        .webp({ quality })
        .toBuffer();

      // Obtener color dominante
      const dominantColor = await sharp(inputPath)
        .resize(1, 1)
        .raw()
        .toBuffer()
        .then(buffer => {
          const [r, g, b] = buffer;
          return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
        });

      const placeholder = `data:image/webp;base64,${placeholderBuffer.toString('base64')}`;

      return { placeholder, dominantColor };
    } catch (error) {
      console.error('Error generando placeholder:', error);
      throw error;
    }
  }

  /**
   * Limpiar caché
   */
  clearCache(): void {
    this.cache = {};
    console.log('🗑️ Caché de optimización limpiado');
  }

  /**
   * Obtener estadísticas de caché
   */
  getCacheStats(): {
    size: number;
    hitRate: number;
    totalHits: number;
    totalMisses: number;
  } {
    const totalHits = Object.keys(this.cache).length;
    const totalMisses = 0; // No trackeamos misses actualmente
    
    return {
      size: Object.keys(this.cache).length,
      hitRate: totalHits > 0 ? totalHits / (totalHits + totalMisses) : 0,
      totalHits,
      totalMisses,
    };
  }

  /**
   * Limpiar archivos optimizados antiguos
   */
  async cleanupOldFiles(maxAge: number = 7 * 24 * 60 * 60 * 1000): Promise<number> {
    try {
      const files = await fs.readdir(this.outputDir);
      const now = Date.now();
      let deletedCount = 0;

      for (const file of files) {
        const filePath = path.join(this.outputDir, file);
        const stats = await fs.stat(filePath);
        
        if (now - stats.mtime.getTime() > maxAge) {
          await fs.unlink(filePath);
          deletedCount++;
        }
      }

      console.log(`🗑️ ${deletedCount} archivos antiguos eliminados`);
      return deletedCount;
    } catch (error) {
      console.error('Error limpiando archivos antiguos:', error);
      return 0;
    }
  }
}

// Instancia singleton
export const imageOptimizer = new ImageOptimizer();

// Funciones de utilidad
export const optimizeImage = (inputPath: string, options?: ImageOptimizationOptions) => 
  imageOptimizer.optimizeImage(inputPath, options);

export const optimizeImages = (inputPaths: string[], options?: ImageOptimizationOptions) => 
  imageOptimizer.optimizeImages(inputPaths, options);

export const createResponsiveImages = (
  inputPath: string,
  sizes: Array<{ width: number; height?: number }>,
  options?: ImageOptimizationOptions
) => imageOptimizer.createResponsiveImages(inputPath, sizes, options);

export const optimizeBuffer = (buffer: Buffer, options?: ImageOptimizationOptions) => 
  imageOptimizer.optimizeBuffer(buffer, options);

export const generatePlaceholder = (
  inputPath: string,
  options?: { width?: number; height?: number; blur?: number; quality?: number }
) => imageOptimizer.generatePlaceholder(inputPath, options);

// Hook para React
export const useImageOptimizer = () => {
  const optimize = React.useCallback(async (
    inputPath: string,
    options?: ImageOptimizationOptions
  ) => {
    return await imageOptimizer.optimizeImage(inputPath, options);
  }, []);

  const optimizeMultiple = React.useCallback(async (
    inputPaths: string[],
    options?: ImageOptimizationOptions
  ) => {
    return await imageOptimizer.optimizeImages(inputPaths, options);
  }, []);

  const createResponsive = React.useCallback(async (
    inputPath: string,
    sizes: Array<{ width: number; height?: number }>,
    options?: ImageOptimizationOptions
  ) => {
    return await imageOptimizer.createResponsiveImages(inputPath, sizes, options);
  }, []);

  const generatePlaceholder = React.useCallback(async (
    inputPath: string,
    options?: { width?: number; height?: number; blur?: number; quality?: number }
  ) => {
    return await imageOptimizer.generatePlaceholder(inputPath, options);
  }, []);

  const clearCache = React.useCallback(() => {
    imageOptimizer.clearCache();
  }, []);

  const getStats = React.useCallback(() => {
    return imageOptimizer.getCacheStats();
  }, []);

  return {
    optimize,
    optimizeMultiple,
    createResponsive,
    generatePlaceholder,
    clearCache,
    getStats,
  };
};

export default imageOptimizer;
