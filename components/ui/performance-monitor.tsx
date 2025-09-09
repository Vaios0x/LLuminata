'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface PerformanceMetrics {
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  ttfb: number; // Time to First Byte
  domLoad: number; // DOM Content Loaded
  windowLoad: number; // Window Load
  memory?: {
    used: number;
    total: number;
    limit: number;
  };
}

interface PerformanceMonitorProps {
  enabled?: boolean;
  logToConsole?: boolean;
  sendToAnalytics?: boolean;
  className?: string;
  showMetrics?: boolean;
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  enabled = true,
  logToConsole = false,
  sendToAnalytics = false,
  className,
  showMetrics = false,
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);

  // Función para obtener métricas de memoria
  const getMemoryMetrics = useCallback(() => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return {
        used: Math.round(memory.usedJSHeapSize / 1024 / 1024),
        total: Math.round(memory.totalJSHeapSize / 1024 / 1024),
        limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024),
      };
    }
    return undefined;
  }, []);

  // Función para medir FCP (First Contentful Paint)
  const measureFCP = useCallback(() => {
    return new Promise<number>((resolve) => {
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
          if (fcpEntry) {
            resolve(fcpEntry.startTime);
            observer.disconnect();
          }
        });
        observer.observe({ entryTypes: ['paint'] });
      } else {
        // Fallback para navegadores que no soportan PerformanceObserver
        resolve(performance.now());
      }
    });
  }, []);

  // Función para medir LCP (Largest Contentful Paint)
  const measureLCP = useCallback(() => {
    return new Promise<number>((resolve) => {
      if ('PerformanceObserver' in window) {
        let lcpValue = 0;
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          lcpValue = lastEntry.startTime;
        });
        observer.observe({ entryTypes: ['largest-contentful-paint'] });
        
        // Resolver después de 5 segundos o cuando se complete la carga
        setTimeout(() => {
          observer.disconnect();
          resolve(lcpValue);
        }, 5000);
      } else {
        resolve(performance.now());
      }
    });
  }, []);

  // Función para medir FID (First Input Delay)
  const measureFID = useCallback(() => {
    return new Promise<number>((resolve) => {
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const fidEntry = entries[0] as PerformanceEventTiming;
          if (fidEntry && 'processingStart' in fidEntry) {
            resolve(fidEntry.processingStart - fidEntry.startTime);
            observer.disconnect();
          }
        });
        observer.observe({ entryTypes: ['first-input'] });
      } else {
        resolve(0);
      }
    });
  }, []);

  // Función para medir CLS (Cumulative Layout Shift)
  const measureCLS = useCallback(() => {
    return new Promise<number>((resolve) => {
      if ('PerformanceObserver' in window) {
        let clsValue = 0;
        const observer = new PerformanceObserver((list) => {      
          for (const entry of list.getEntries()) {
            const layoutShiftEntry = entry as PerformanceEntry & { hadRecentInput?: boolean; value?: number };
            if (!layoutShiftEntry.hadRecentInput) {
              clsValue += layoutShiftEntry.value || 0;
            }
          }
        });
        observer.observe({ entryTypes: ['layout-shift'] });
        
        // Resolver después de 5 segundos
        setTimeout(() => {
          observer.disconnect();
          resolve(clsValue);
        }, 5000);
      } else {
        resolve(0);
      }
    });
  }, []);

  // Función para medir TTFB (Time to First Byte)
  const measureTTFB = useCallback(() => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation) {
      return navigation.responseStart - navigation.requestStart;
    }
    return 0;
  }, []);

  // Función para medir tiempos de carga
  const measureLoadTimes = useCallback(() => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation) {
      return {
        domLoad: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        windowLoad: navigation.loadEventEnd - navigation.loadEventStart,
      };
    }
    return { domLoad: 0, windowLoad: 0 };
  }, []);

  // Función principal para medir todas las métricas
  const measurePerformance = useCallback(async () => {
    if (!enabled) return;

    setIsMonitoring(true);

    try {
      const [fcp, lcp, fid, cls] = await Promise.all([
        measureFCP(),
        measureLCP(),
        measureFID(),
        measureCLS(),
      ]);

      const ttfb = measureTTFB();
      const { domLoad, windowLoad } = measureLoadTimes();
      const memory = getMemoryMetrics();

      const performanceMetrics: PerformanceMetrics = {
        fcp,
        lcp,
        fid,
        cls,
        ttfb,
        domLoad,
        windowLoad,
        memory,
      };

      setMetrics(performanceMetrics);

      // Log a consola si está habilitado
      if (logToConsole) {
        console.group('🚀 Performance Metrics');
        console.log('FCP (First Contentful Paint):', `${fcp.toFixed(2)}ms`);
        console.log('LCP (Largest Contentful Paint):', `${lcp.toFixed(2)}ms`);
        console.log('FID (First Input Delay):', `${fid.toFixed(2)}ms`);
        console.log('CLS (Cumulative Layout Shift):', cls.toFixed(4));
        console.log('TTFB (Time to First Byte):', `${ttfb.toFixed(2)}ms`);
        console.log('DOM Load:', `${domLoad.toFixed(2)}ms`);
        console.log('Window Load:', `${windowLoad.toFixed(2)}ms`);
        if (memory) {
          console.log('Memory Usage:', `${memory.used}MB / ${memory.total}MB (${memory.limit}MB limit)`);
        }
        console.groupEnd();
      }

      // Enviar a analytics si está habilitado
      if (sendToAnalytics && typeof window !== 'undefined') {
        // Aquí puedes enviar las métricas a tu servicio de analytics
        window.gtag?.('event', 'performance_metrics', {
          fcp,
          lcp,
          fid,
          cls,
          ttfb,
          dom_load: domLoad,
          window_load: windowLoad,
          memory_used: memory?.used,
        });
      }

    } catch (error) {
      console.error('Error measuring performance:', error);
    } finally {
      setIsMonitoring(false);
    }
  }, [enabled, logToConsole, sendToAnalytics, measureFCP, measureLCP, measureFID, measureCLS, measureTTFB, measureLoadTimes, getMemoryMetrics]);

  // Iniciar monitoreo cuando el componente se monta
  useEffect(() => {
    if (enabled && typeof window !== 'undefined') {
      // Medir métricas iniciales después de que la página cargue
      if (document.readyState === 'complete') {
        measurePerformance();
      } else {
        window.addEventListener('load', measurePerformance);
        return () => window.removeEventListener('load', measurePerformance);
      }
    }
  }, [enabled, measurePerformance]);

  // Función para obtener el color de estado basado en el valor
  const getStatusColor = (value: number, thresholds: { good: number; needsImprovement: number }) => {
    if (value <= thresholds.good) return 'text-green-600';
    if (value <= thresholds.needsImprovement) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Función para obtener el icono de estado
  const getStatusIcon = (value: number, thresholds: { good: number; needsImprovement: number }) => {
    if (value <= thresholds.good) return '✅';
    if (value <= thresholds.needsImprovement) return '⚠️';
    return '❌';
  };

  if (!showMetrics || !metrics) {
    return null;
  }

  return (
    <div className={cn('bg-white border border-gray-200 rounded-lg p-4 shadow-sm', className)}>
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        📊 Métricas de Rendimiento
        {isMonitoring && (
          <div className="ml-2 w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        )}
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* FCP */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">FCP</span>
            <span className={cn(
              'text-sm font-mono',
              getStatusColor(metrics.fcp, { good: 1800, needsImprovement: 3000 })
            )}>
              {getStatusIcon(metrics.fcp, { good: 1800, needsImprovement: 3000 })}
              {metrics.fcp.toFixed(0)}ms
            </span>
          </div>
          <div className="text-xs text-gray-500">First Contentful Paint</div>
        </div>

        {/* LCP */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">LCP</span>
            <span className={cn(
              'text-sm font-mono',
              getStatusColor(metrics.lcp, { good: 2500, needsImprovement: 4000 })
            )}>
              {getStatusIcon(metrics.lcp, { good: 2500, needsImprovement: 4000 })}
              {metrics.lcp.toFixed(0)}ms
            </span>
          </div>
          <div className="text-xs text-gray-500">Largest Contentful Paint</div>
        </div>

        {/* FID */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">FID</span>
            <span className={cn(
              'text-sm font-mono',
              getStatusColor(metrics.fid, { good: 100, needsImprovement: 300 })
            )}>
              {getStatusIcon(metrics.fid, { good: 100, needsImprovement: 300 })}
              {metrics.fid.toFixed(0)}ms
            </span>
          </div>
          <div className="text-xs text-gray-500">First Input Delay</div>
        </div>

        {/* CLS */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">CLS</span>
            <span className={cn(
              'text-sm font-mono',
              getStatusColor(metrics.cls, { good: 0.1, needsImprovement: 0.25 })
            )}>
              {getStatusIcon(metrics.cls, { good: 0.1, needsImprovement: 0.25 })}
              {metrics.cls.toFixed(3)}
            </span>
          </div>
          <div className="text-xs text-gray-500">Cumulative Layout Shift</div>
        </div>

        {/* TTFB */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">TTFB</span>
            <span className={cn(
              'text-sm font-mono',
              getStatusColor(metrics.ttfb, { good: 800, needsImprovement: 1800 })
            )}>
              {getStatusIcon(metrics.ttfb, { good: 800, needsImprovement: 1800 })}
              {metrics.ttfb.toFixed(0)}ms
            </span>
          </div>
          <div className="text-xs text-gray-500">Time to First Byte</div>
        </div>

        {/* Memory */}
        {metrics.memory && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Memory</span>
              <span className="text-sm font-mono">
                {metrics.memory.used}MB / {metrics.memory.total}MB
              </span>
            </div>
            <div className="text-xs text-gray-500">Heap Usage</div>
          </div>
        )}
      </div>

      {/* Botón para re-medir */}
      <button
        onClick={measurePerformance}
        disabled={isMonitoring}
        className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
      >
        {isMonitoring ? 'Midiendo...' : 'Re-medir Rendimiento'}
      </button>
    </div>
  );
};

// Hook para usar métricas de performance
export const usePerformanceMetrics = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);

  const measureMetrics = useCallback(async () => {
    // Implementación similar a la del componente
    // Retorna las métricas para uso en otros componentes
  }, []);

  return { metrics, measureMetrics };
};

export default PerformanceMonitor;
