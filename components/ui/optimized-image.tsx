'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import cdnManager from '@/lib/cdn-manager';
import { useImageOptimizer } from '@/lib/image-optimizer';
import { useRedisCache } from '@/lib/redis-cache';
import { Card, CardContent } from './card';
import { Progress } from './progress';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  loading?: 'lazy' | 'eager';
  quality?: number;
  format?: 'webp' | 'avif' | 'jpeg' | 'png';
  placeholder?: string;
  blur?: boolean;
  responsive?: boolean;
  sizes?: string;
  onLoad?: () => void;
  onError?: (error: Error) => void;
  fallback?: React.ReactNode;
  showProgress?: boolean;
  cacheKey?: string;
}

interface ImageState {
  src: string;
  loading: boolean;
  error: Error | null;
  progress: number;
  placeholder?: string;
  dominantColor?: string;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  loading = 'lazy',
  quality = 85,
  format = 'webp',
  placeholder,
  blur = true,
  responsive = true,
  sizes = '100vw',
  onLoad,
  onError,
  fallback,
  showProgress = false,
  cacheKey
}) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const [state, setState] = useState<ImageState>({
    src: placeholder || '',
    loading: true,
    error: null,
    progress: 0,
  });

  // Hooks para optimización
  const { getAsset } = cdnManager;
  const { optimize, generatePlaceholder } = useImageOptimizer();
  const { get: getFromCache, set: setToCache } = useRedisCache();

  // Generar clave de caché única
  const uniqueCacheKey = cacheKey || `image:${src}:${width}:${height}:${quality}:${format}`;

  // Cargar imagen optimizada
  const loadOptimizedImage = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null, progress: 0 }));

      // 1. Verificar caché Redis
      const cached = await getFromCache<{ url: string }>(uniqueCacheKey);
      if (cached && cached.url) {
        console.log('📦 Imagen encontrada en caché Redis');
        setState(prev => ({
          ...prev,
          src: cached.url,
          loading: false,
          progress: 100,
        }));
        onLoad?.();
        return;
      }

      // 2. Obtener imagen optimizada del CDN
      setState(prev => ({ ...prev, progress: 25 }));
      const cdnUrl = await getAsset(src, {
        width,
        height,
        quality,
        format: format === 'jpeg' ? 'jpg' : format,
        priority: priority ? 'high' : 'normal',
      });

      setState(prev => ({ ...prev, progress: 50 }));

      // 3. Si no está en CDN, optimizar localmente
      if (!cdnUrl || cdnUrl === src) {
        console.log('🔄 Optimizando imagen localmente...');
        
        // Optimizar imagen
        const optimizationResult = await optimize(src, {
          quality,
          format,
          width,
          height,
        });

        setState(prev => ({ ...prev, progress: 75 }));

        // Guardar en caché Redis
        await setToCache(uniqueCacheKey, {
          url: optimizationResult.url,
          size: optimizationResult.optimizedSize,
          format: optimizationResult.format,
          dimensions: optimizationResult.dimensions,
        }, {
          ttl: 24 * 60 * 60, // 24 horas
          tags: ['image', 'optimized'],
        });

        setState(prev => ({
          ...prev,
          src: optimizationResult.url,
          loading: false,
          progress: 100,
        }));
      } else {
        // Usar URL del CDN
        setState(prev => ({
          ...prev,
          src: cdnUrl,
          loading: false,
          progress: 100,
        }));

        // Guardar en caché Redis
        await setToCache(uniqueCacheKey, {
          url: cdnUrl,
          source: 'cdn',
        }, {
          ttl: 24 * 60 * 60,
          tags: ['image', 'cdn'],
        });
      }

      onLoad?.();

    } catch (error) {
      console.error('Error cargando imagen optimizada:', error);
      const errorObj = error instanceof Error ? error : new Error('Error desconocido');
      
      setState(prev => ({
        ...prev,
        error: errorObj,
        loading: false,
        progress: 0,
      }));

      onError?.(errorObj);
    }
  }, [src, width, height, quality, format, priority, uniqueCacheKey, getAsset, optimize, getFromCache, setToCache, onLoad, onError]);

  // Generar placeholder
  const generateImagePlaceholder = useCallback(async () => {
    if (placeholder) return;

    try {
      const placeholderData = await generatePlaceholder(src, {
        width: 20,
        height: 20,
        blur: 10,
        quality: 30,
      });

      setState(prev => ({
        ...prev,
        placeholder: placeholderData.placeholder,
        dominantColor: placeholderData.dominantColor,
      }));
    } catch (error) {
      console.warn('Error generando placeholder:', error);
    }
  }, [src, placeholder, generatePlaceholder]);

  // Cargar imagen cuando el componente se monte o cambien las props
  useEffect(() => {
    if (priority || loading === 'eager') {
      loadOptimizedImage();
      generateImagePlaceholder();
    }
  }, [priority, loading, loadOptimizedImage, generateImagePlaceholder]);

  // Lazy loading con Intersection Observer
  useEffect(() => {
    if (priority || loading === 'eager') return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            loadOptimizedImage();
            generateImagePlaceholder();
            observer.disconnect();
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [loadOptimizedImage, generateImagePlaceholder, priority, loading]);

  // Manejar carga de imagen
  const handleImageLoad = useCallback(() => {
    setState(prev => ({ ...prev, loading: false }));
    onLoad?.();
  }, [onLoad]);

  // Manejar error de imagen
  const handleImageError = useCallback(() => {
    const error = new Error('Error cargando imagen');
    setState(prev => ({
      ...prev,
      error,
      loading: false,
    }));
    onError?.(error);
  }, [onError]);

  // Si hay error, mostrar fallback
  if (state.error) {
    return fallback ? (
      <>{fallback}</>
    ) : (
      <Card className="w-full border-red-200 bg-red-50">
        <CardContent className="flex flex-col items-center justify-center p-6">
          <div className="text-red-500 text-2xl mb-2">⚠️</div>
          <p className="text-sm text-red-600 text-center">
            Error cargando imagen
          </p>
        </CardContent>
      </Card>
    );
  }

  // Mostrar progreso si está habilitado
  if (showProgress && state.loading) {
    return (
      <div className={`relative ${className}`}>
        <Card className="w-full">
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Optimizando imagen...</span>
                <span className="text-gray-500">{state.progress}%</span>
              </div>
              <Progress value={state.progress} className="w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div 
      ref={imgRef}
      className={`relative ${className}`}
      style={{
        backgroundColor: state.dominantColor || 'transparent',
      }}
    >
      {/* Placeholder borroso */}
      {state.placeholder && state.loading && blur && (
        <img
          src={state.placeholder}
          alt=""
          className="absolute inset-0 w-full h-full object-cover blur-sm scale-110"
          style={{ filter: 'blur(10px)' }}
          aria-hidden="true"
        />
      )}

      {/* Imagen principal */}
      <img
        src={state.src}
        alt={alt}
        width={width}
        height={height}
        className={`
          transition-all duration-300
          ${state.loading ? 'opacity-0' : 'opacity-100'}
          ${blur && state.loading ? 'blur-sm' : ''}
          ${responsive ? 'w-full h-auto' : ''}
        `}
        loading={loading}
        sizes={responsive ? sizes : undefined}
        onLoad={handleImageLoad}
        onError={handleImageError}
        style={{
          aspectRatio: width && height ? `${width}/${height}` : undefined,
        }}
      />

      {/* Indicador de carga */}
      {state.loading && !showProgress && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-50">
          <div className="flex flex-col items-center space-y-2">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="text-sm text-gray-500">Cargando...</p>
          </div>
        </div>
      )}
    </div>
  );
};

// Componente para imágenes responsivas
export const ResponsiveImage: React.FC<OptimizedImageProps & {
  breakpoints?: Array<{ width: number; height?: number }>;
}> = ({
  breakpoints = [
    { width: 320 },
    { width: 640 },
    { width: 768 },
    { width: 1024 },
    { width: 1280 },
  ],
  ...props
}) => {
  const [currentSrc, setCurrentSrc] = useState<string>('');
  const { createResponsive } = useImageOptimizer();

  // Generar imágenes responsivas
  useEffect(() => {
    const generateResponsiveImages = async () => {
      try {
        const results = await createResponsive(props.src, breakpoints, {
          quality: props.quality,
          format: props.format,
        });

        // Crear srcset
        const srcset = results
          .map(result => `${result.url} ${result.dimensions.width}w`)
          .join(', ');

        setCurrentSrc(srcset);
      } catch (error) {
        console.error('Error generando imágenes responsivas:', error);
        setCurrentSrc(props.src);
      }
    };

    generateResponsiveImages();
  }, [props.src, breakpoints, props.quality, props.format, createResponsive]);

  return (
    <OptimizedImage
      {...props}
      src={currentSrc || props.src}
      responsive={true}
      sizes="(max-width: 320px) 280px, (max-width: 640px) 600px, (max-width: 768px) 720px, (max-width: 1024px) 960px, 1200px"
    />
  );
};

// Componente para imágenes con lazy loading avanzado
export const LazyOptimizedImage: React.FC<OptimizedImageProps> = (props) => {
  return (
    <OptimizedImage
      {...props}
      loading="lazy"
      priority={false}
      showProgress={true}
    />
  );
};

// Hook para precargar imágenes
export const usePreloadImage = (src: string) => {
  const [preloaded, setPreloaded] = useState(false);
  const { getAsset } = cdnManager;

  const preload = useCallback(async () => {
    try {
      await getAsset(src, { priority: 'high' });
      setPreloaded(true);
    } catch (error) {
      console.warn('Error precargando imagen:', error);
    }
  }, [src, getAsset]);

  return { preloaded, preload };
};

// Hook para optimizar imagen en background
export const useBackgroundImageOptimization = (src: string, options?: {
  quality?: number;
  format?: 'webp' | 'avif' | 'jpg' | 'png';
  width?: number;
  height?: number;
}) => {
  const [optimizedSrc, setOptimizedSrc] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const { optimize } = useImageOptimizer();

  const optimizeImage = useCallback(async () => {
    if (!src) return;

    setLoading(true);
    try {
      const result = await optimize(src, options ? { ...options, format: options.format === 'jpg' ? 'jpeg' : options.format } : undefined);
      setOptimizedSrc(result.url);
    } catch (error) {
      console.error('Error optimizando imagen en background:', error);
      setOptimizedSrc(src); // Fallback a imagen original
    } finally {
      setLoading(false);
    }
  }, [src, options, optimize]);

  useEffect(() => {
    optimizeImage();
  }, [optimizeImage]);

  return { optimizedSrc, loading };
};

export default OptimizedImage;
