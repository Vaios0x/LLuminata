'use client';

import React, { Suspense, lazy, useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent } from './card';
import { Button } from './button';
import { Progress } from './progress';

// Interfaces
interface LazyLoaderProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  threshold?: number;
  rootMargin?: string;
  onLoad?: () => void;
  onError?: (error: Error) => void;
  retryCount?: number;
  retryDelay?: number;
  preload?: boolean;
  priority?: 'high' | 'normal' | 'low';
}

interface LazyComponentProps {
  component: () => Promise<{ default: React.ComponentType<any> }>;
  props?: Record<string, any>;
  fallback?: React.ReactNode;
  onLoad?: () => void;
  onError?: (error: Error) => void;
  retryCount?: number;
  retryDelay?: number;
  preload?: boolean;
  priority?: 'high' | 'normal' | 'low';
}

interface LazyImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  fallback?: React.ReactNode;
  onLoad?: () => void;
  onError?: (error: Error) => void;
  threshold?: number;
  rootMargin?: string;
  preload?: boolean;
  priority?: 'high' | 'normal' | 'low';
  placeholder?: string;
  blur?: boolean;
}

interface LazyVideoProps {
  src: string;
  poster?: string;
  className?: string;
  fallback?: React.ReactNode;
  onLoad?: () => void;
  onError?: (error: Error) => void;
  threshold?: number;
  rootMargin?: string;
  preload?: 'none' | 'metadata' | 'auto';
  priority?: 'high' | 'normal' | 'low';
  controls?: boolean;
  autoplay?: boolean;
  muted?: boolean;
  loop?: boolean;
}

// Hook para intersection observer
const useIntersectionObserver = (
  ref: React.RefObject<HTMLElement>,
  options: {
    threshold?: number;
    rootMargin?: string;
    triggerOnce?: boolean;
  } = {}
) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const intersecting = entry.isIntersecting;
        setIsIntersecting(intersecting);
        
        if (intersecting && options.triggerOnce && !hasTriggered) {
          setHasTriggered(true);
        }
      },
      {
        threshold: options.threshold || 0.1,
        rootMargin: options.rootMargin || '50px',
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [ref, options.threshold, options.rootMargin, options.triggerOnce, hasTriggered]);

  return isIntersecting || hasTriggered;
};

// Componente de carga por defecto
const DefaultFallback: React.FC<{ priority?: string }> = ({ priority = 'normal' }) => (
  <Card className="w-full h-32 animate-pulse">
    <CardContent className="flex items-center justify-center h-full">
      <div className="flex flex-col items-center space-y-2">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="text-sm text-gray-500">
          Cargando{priority === 'high' ? ' (prioridad alta)' : priority === 'low' ? ' (prioridad baja)' : ''}...
        </p>
      </div>
    </CardContent>
  </Card>
);

// Componente de error
const ErrorFallback: React.FC<{ 
  error: Error; 
  retry: () => void; 
  retryCount: number;
  maxRetries: number;
}> = ({ error, retry, retryCount, maxRetries }) => (
  <Card className="w-full border-red-200 bg-red-50">
    <CardContent className="flex flex-col items-center justify-center p-6 space-y-4">
      <div className="text-red-500 text-2xl">⚠️</div>
      <div className="text-center">
        <h3 className="font-medium text-red-800 mb-2">Error al cargar</h3>
        <p className="text-sm text-red-600 mb-4">{error.message}</p>
        {retryCount < maxRetries && (
          <Button 
            onClick={retry} 
            variant="outline" 
            size="sm"
            className="border-red-300 text-red-700 hover:bg-red-100"
          >
            Reintentar ({retryCount}/{maxRetries})
          </Button>
        )}
      </div>
    </CardContent>
  </Card>
);

/**
 * Componente principal de lazy loading
 */
export const LazyLoader: React.FC<LazyLoaderProps> = ({
  children,
  fallback = <DefaultFallback />,
  threshold = 0.1,
  rootMargin = '50px',
  onLoad,
  onError,
  retryCount = 3,
  retryDelay = 1000,
  preload = false,
  priority = 'normal'
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isIntersecting = useIntersectionObserver(ref, {
    threshold,
    rootMargin,
    triggerOnce: true,
  });

  const [shouldLoad, setShouldLoad] = useState(preload);

  useEffect(() => {
    if (isIntersecting && !shouldLoad) {
      setShouldLoad(true);
    }
  }, [isIntersecting, shouldLoad]);

  if (!shouldLoad) {
    return (
      <div ref={ref} className="w-full">
        {fallback}
      </div>
    );
  }

  return (
    <div ref={ref} className="w-full">
      <Suspense fallback={fallback}>
        {children}
      </Suspense>
    </div>
  );
};

/**
 * Componente lazy para cargar componentes dinámicamente
 */
export const LazyComponent: React.FC<LazyComponentProps> = ({
  component,
  props = {},
  fallback = <DefaultFallback />,
  onLoad,
  onError,
  retryCount = 3,
  retryDelay = 1000,
  preload = false,
  priority = 'normal'
}) => {
  const [Component, setComponent] = useState<React.ComponentType<any> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [retryAttempts, setRetryAttempts] = useState(0);

  const loadComponent = useCallback(async () => {
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      const module = await component();
      setComponent(() => module.default);
      onLoad?.();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error cargando componente');
      setError(error);
      onError?.(error);
    } finally {
      setLoading(false);
    }
  }, [component, loading, onLoad, onError]);

  const retry = useCallback(() => {
    if (retryAttempts < retryCount) {
      setRetryAttempts(prev => prev + 1);
      setTimeout(loadComponent, retryDelay);
    }
  }, [retryAttempts, retryCount, retryDelay, loadComponent]);

  useEffect(() => {
    if (preload || priority === 'high') {
      loadComponent();
    }
  }, [preload, priority, loadComponent]);

  if (error) {
    return (
      <ErrorFallback 
        error={error} 
        retry={retry} 
        retryCount={retryAttempts} 
        maxRetries={retryCount}
      />
    );
  }

  if (loading || !Component) {
    return fallback;
  }

  return <Component {...props} />;
};

/**
 * Componente lazy para imágenes
 */
export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  width,
  height,
  className = '',
  fallback = <DefaultFallback />,
  onLoad,
  onError,
  threshold = 0.1,
  rootMargin = '50px',
  preload = false,
  priority = 'normal',
  placeholder,
  blur = false
}) => {
  const ref = useRef<HTMLImageElement>(null);
  const isIntersecting = useIntersectionObserver(ref, {
    threshold,
    rootMargin,
    triggerOnce: true,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [imageSrc, setImageSrc] = useState<string>(placeholder || '');
  const maxRetries = 3;

  const loadImage = useCallback(async () => {
    if (!isIntersecting && !preload) return;

    setLoading(true);
    setError(null);

    try {
      const img = new Image();
      
      img.onload = () => {
        setImageSrc(src);
        setLoading(false);
        onLoad?.();
      };

      img.onerror = () => {
        const error = new Error('Error cargando imagen');
        setError(error);
        setLoading(false);
        onError?.(error);
      };

      img.src = src;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error cargando imagen');
      setError(error);
      setLoading(false);
      onError?.(error);
    }
  }, [src, isIntersecting, preload, onLoad, onError]);

  const retry = useCallback(() => {
    if (retryCount < maxRetries) {
      setRetryCount(prev => prev + 1);
      setTimeout(loadImage, 1000);
    }
  }, [retryCount, maxRetries, loadImage]);

  useEffect(() => {
    if (priority === 'high' || preload) {
      loadImage();
    }
  }, [priority, preload, loadImage]);

  useEffect(() => {
    if (isIntersecting && !loading && !imageSrc) {
      loadImage();
    }
  }, [isIntersecting, loading, imageSrc, loadImage]);

  if (error) {
    return (
      <ErrorFallback 
        error={error} 
        retry={retry} 
        retryCount={retryCount} 
        maxRetries={maxRetries}
      />
    );
  }

  return (
    <div ref={ref} className={`relative ${className}`}>
      <img
        src={imageSrc}
        alt={alt}
        width={width}
        height={height}
        className={`transition-opacity duration-300 ${
          loading || !imageSrc ? 'opacity-0' : 'opacity-100'
        } ${blur && loading ? 'blur-sm' : ''}`}
        onLoad={() => setLoading(false)}
        onError={() => {
          const error = new Error('Error cargando imagen');
          setError(error);
          setLoading(false);
          onError?.(error);
        }}
      />
      {loading && fallback}
    </div>
  );
};

/**
 * Componente lazy para videos
 */
export const LazyVideo: React.FC<LazyVideoProps> = ({
  src,
  poster,
  className = '',
  fallback = <DefaultFallback />,
  onLoad,
  onError,
  threshold = 0.1,
  rootMargin = '50px',
  preload = 'metadata',
  priority = 'normal',
  controls = true,
  autoplay = false,
  muted = false,
  loop = false
}) => {
  const ref = useRef<HTMLVideoElement>(null);
  const isIntersecting = useIntersectionObserver(ref, {
    threshold,
    rootMargin,
    triggerOnce: true,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  const loadVideo = useCallback(async () => {
    if (!isIntersecting && priority !== 'high') return;

    setLoading(true);
    setError(null);

    try {
      const video = ref.current;
      if (!video) return;

      video.onloadeddata = () => {
        setLoading(false);
        onLoad?.();
      };

      video.onerror = () => {
        const error = new Error('Error cargando video');
        setError(error);
        setLoading(false);
        onError?.(error);
      };

      video.load();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error cargando video');
      setError(error);
      setLoading(false);
      onError?.(error);
    }
  }, [isIntersecting, priority, onLoad, onError]);

  const retry = useCallback(() => {
    if (retryCount < maxRetries) {
      setRetryCount(prev => prev + 1);
      setTimeout(loadVideo, 1000);
    }
  }, [retryCount, maxRetries, loadVideo]);

  useEffect(() => {
    if (priority === 'high') {
      loadVideo();
    }
  }, [priority, loadVideo]);

  useEffect(() => {
    if (isIntersecting && !loading) {
      loadVideo();
    }
  }, [isIntersecting, loading, loadVideo]);

  if (error) {
    return (
      <ErrorFallback 
        error={error} 
        retry={retry} 
        retryCount={retryCount} 
        maxRetries={maxRetries}
      />
    );
  }

  return (
    <div ref={ref} className={`relative ${className}`}>
      <video
        ref={ref}
        src={src}
        poster={poster}
        preload={preload}
        controls={controls}
        autoPlay={autoplay}
        muted={muted}
        loop={loop}
        className={`w-full h-full ${loading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onLoadStart={() => setLoading(true)}
        onLoadedData={() => setLoading(false)}
        onError={() => {
          const error = new Error('Error cargando video');
          setError(error);
          setLoading(false);
          onError?.(error);
        }}
      />
      {loading && fallback}
    </div>
  );
};

/**
 * Hook para precargar componentes
 */
export const usePreloadComponent = (component: () => Promise<{ default: React.ComponentType<any> }>) => {
  const [preloaded, setPreloaded] = useState(false);

  const preload = useCallback(async () => {
    try {
      await component();
      setPreloaded(true);
    } catch (error) {
      console.warn('Error precargando componente:', error);
    }
  }, [component]);

  return { preloaded, preload };
};

/**
 * Hook para precargar imágenes
 */
export const usePreloadImage = (src: string) => {
  const [preloaded, setPreloaded] = useState(false);

  const preload = useCallback(async () => {
    try {
      const img = new Image();
      img.onload = () => setPreloaded(true);
      img.src = src;
    } catch (error) {
      console.warn('Error precargando imagen:', error);
    }
  }, [src]);

  return { preloaded, preload };
};

/**
 * Componente de progreso de carga
 */
export const LoadingProgress: React.FC<{
  progress: number;
  total: number;
  label?: string;
  showPercentage?: boolean;
}> = ({ progress, total, label = 'Cargando', showPercentage = true }) => {
  const percentage = total > 0 ? Math.round((progress / total) * 100) : 0;

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">{label}</span>
            {showPercentage && (
              <span className="text-gray-500">{percentage}%</span>
            )}
          </div>
          <Progress value={percentage} className="w-full" />
          <div className="text-xs text-gray-400">
            {progress} de {total} elementos
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Exportar componentes lazy comunes
export const LazyDashboard = lazy(() => import('../dashboard/dashboard-widget'));
export const LazyChatbot = lazy(() => import('../ai/chatbot-widget'));
export const LazyAnalytics = lazy(() => import('../dashboard/analytics-widget'));
export const LazyAssessment = lazy(() => import('../learning/assessment-widget'));
export const LazyLesson = lazy(() => import('../learning/lesson-widget'));
export const LazyOfflineContent = lazy(() => import('../offline/offline-content-manager'));

export default LazyLoader;
