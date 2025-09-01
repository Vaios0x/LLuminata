// Performance Monitoring - InclusiveAI Coach

import { MONITORING_CONFIG } from './monitoring-config';
import { captureException, addBreadcrumb } from './error-tracking';

// Tipos para performance monitoring
export interface PerformanceMetrics {
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
  custom?: Record<string, number>;
}

export interface PerformanceThreshold {
  threshold: number;
  weight: number;
}

export interface PerformanceScore {
  score: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  details: Record<string, { value: number; threshold: number; passed: boolean }>;
}

export interface PerformanceMonitor {
  init(): void;
  measureMetrics(): Promise<PerformanceMetrics>;
  calculateScore(metrics: PerformanceMetrics): PerformanceScore;
  trackCustomMetric(name: string, value: number): void;
  trackApiCall(url: string, duration: number, status: number): void;
  trackUserInteraction(action: string, duration: number): void;
  getMetrics(): PerformanceMetrics | null;
  reset(): void;
}

// Implementación del monitor de performance
class PerformanceMonitorImpl implements PerformanceMonitor {
  private metrics: PerformanceMetrics | null = null;
  private customMetrics: Map<string, number[]> = new Map();
  private isInitialized = false;

  init(): void {
    if (this.isInitialized || !MONITORING_CONFIG.performance.enabled) {
      return;
    }

    // Configurar observadores de performance
    this.setupPerformanceObservers();
    this.setupCustomMetrics();
    
    this.isInitialized = true;
    console.log('✅ Performance monitoring inicializado');
  }

  private setupPerformanceObservers(): void {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      return;
    }

    // Observer para FCP
    try {
      const fcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
        if (fcpEntry) {
          this.metrics = { ...this.metrics, fcp: fcpEntry.startTime };
          addBreadcrumb({
            message: `FCP: ${fcpEntry.startTime.toFixed(2)}ms`,
            category: 'performance',
            level: 'info'
          });
        }
      });
      fcpObserver.observe({ entryTypes: ['paint'] });
    } catch (error) {
      console.warn('Error configurando FCP observer:', error);
    }

    // Observer para LCP
    try {
      let lcpValue = 0;
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        lcpValue = lastEntry.startTime;
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      
      // Resolver LCP después de 5 segundos
      setTimeout(() => {
        this.metrics = { ...this.metrics, lcp: lcpValue };
        addBreadcrumb({
          message: `LCP: ${lcpValue.toFixed(2)}ms`,
          category: 'performance',
          level: 'info'
        });
      }, 5000);
    } catch (error) {
      console.warn('Error configurando LCP observer:', error);
    }

    // Observer para FID
    try {
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const fidEntry = entries[0];
        if (fidEntry) {
          const fid = fidEntry.processingStart - fidEntry.startTime;
          this.metrics = { ...this.metrics, fid };
          addBreadcrumb({
            message: `FID: ${fid.toFixed(2)}ms`,
            category: 'performance',
            level: 'info'
          });
        }
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
    } catch (error) {
      console.warn('Error configurando FID observer:', error);
    }

    // Observer para CLS
    try {
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += (entry as any).value;
          }
        }
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
      
      // Resolver CLS después de 5 segundos
      setTimeout(() => {
        this.metrics = { ...this.metrics, cls: clsValue };
        addBreadcrumb({
          message: `CLS: ${clsValue.toFixed(4)}`,
          category: 'performance',
          level: 'info'
        });
      }, 5000);
    } catch (error) {
      console.warn('Error configurando CLS observer:', error);
    }
  }

  private setupCustomMetrics(): void {
    // Medir TTFB
    if (typeof window !== 'undefined') {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        const ttfb = navigation.responseStart - navigation.requestStart;
        const domLoad = navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart;
        const windowLoad = navigation.loadEventEnd - navigation.loadEventStart;
        
        this.metrics = {
          ...this.metrics,
          ttfb,
          domLoad,
          windowLoad,
        };
      }
    }

    // Medir memoria si está disponible
    if (typeof window !== 'undefined' && 'memory' in performance) {
      const memory = (performance as any).memory;
      this.metrics = {
        ...this.metrics,
        memory: {
          used: Math.round(memory.usedJSHeapSize / 1024 / 1024),
          total: Math.round(memory.totalJSHeapSize / 1024 / 1024),
          limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024),
        },
      };
    }
  }

  async measureMetrics(): Promise<PerformanceMetrics> {
    if (!this.isInitialized) {
      this.init();
    }

    // Esperar a que se completen las métricas
    await new Promise(resolve => setTimeout(resolve, 6000));

    if (!this.metrics) {
      this.metrics = {
        fcp: 0,
        lcp: 0,
        fid: 0,
        cls: 0,
        ttfb: 0,
        domLoad: 0,
        windowLoad: 0,
      };
    }

    return this.metrics;
  }

  calculateScore(metrics: PerformanceMetrics): PerformanceScore {
    const details: Record<string, { value: number; threshold: number; passed: boolean }> = {};
    let totalScore = 0;
    let totalWeight = 0;

    // Calcular score para cada métrica
    Object.entries(MONITORING_CONFIG.performance.metrics).forEach(([key, config]) => {
      const value = metrics[key as keyof PerformanceMetrics] as number;
      const passed = value <= config.threshold;
      const score = passed ? 100 : Math.max(0, 100 - ((value - config.threshold) / config.threshold) * 100);
      
      details[key] = {
        value,
        threshold: config.threshold,
        passed,
      };

      totalScore += score * config.weight;
      totalWeight += config.weight;
    });

    const finalScore = totalWeight > 0 ? totalScore / totalWeight : 0;

    // Determinar grado
    let grade: 'A' | 'B' | 'C' | 'D' | 'F';
    if (finalScore >= 90) grade = 'A';
    else if (finalScore >= 80) grade = 'B';
    else if (finalScore >= 70) grade = 'C';
    else if (finalScore >= 60) grade = 'D';
    else grade = 'F';

    return {
      score: Math.round(finalScore),
      grade,
      details,
    };
  }

  trackCustomMetric(name: string, value: number): void {
    if (!this.customMetrics.has(name)) {
      this.customMetrics.set(name, []);
    }
    this.customMetrics.get(name)!.push(value);

    // Mantener solo los últimos 100 valores
    const values = this.customMetrics.get(name)!;
    if (values.length > 100) {
      values.splice(0, values.length - 100);
    }

    // Actualizar métricas
    this.metrics = {
      ...this.metrics,
      custom: {
        ...this.metrics?.custom,
        [name]: value,
      },
    };
  }

  trackApiCall(url: string, duration: number, status: number): void {
    this.trackCustomMetric('apiResponseTime', duration);
    
    addBreadcrumb({
      message: `API Call: ${url} (${status}) - ${duration}ms`,
      category: 'api',
      level: status >= 400 ? 'error' : 'info',
    });

    // Alertar si la respuesta es lenta
    if (duration > MONITORING_CONFIG.performance.customMetrics.apiResponseTime.threshold) {
      captureException(new Error(`API call slow: ${url}`), {
        url,
        duration,
        status,
        threshold: MONITORING_CONFIG.performance.customMetrics.apiResponseTime.threshold,
      });
    }
  }

  trackUserInteraction(action: string, duration: number): void {
    this.trackCustomMetric('userInteractionTime', duration);
    
    addBreadcrumb({
      message: `User Interaction: ${action} - ${duration}ms`,
      category: 'user-interaction',
      level: 'info',
    });
  }

  getMetrics(): PerformanceMetrics | null {
    return this.metrics;
  }

  reset(): void {
    this.metrics = null;
    this.customMetrics.clear();
  }
}

// Instancia global
const performanceMonitor = new PerformanceMonitorImpl();

// Funciones de conveniencia
export function initPerformanceMonitoring(): void {
  performanceMonitor.init();
}

export async function measurePerformanceMetrics(): Promise<PerformanceMetrics> {
  return await performanceMonitor.measureMetrics();
}

export function calculatePerformanceScore(metrics: PerformanceMetrics): PerformanceScore {
  return performanceMonitor.calculateScore(metrics);
}

export function trackCustomMetric(name: string, value: number): void {
  performanceMonitor.trackCustomMetric(name, value);
}

export function trackApiCall(url: string, duration: number, status: number): void {
  performanceMonitor.trackApiCall(url, duration, status);
}

export function trackUserInteraction(action: string, duration: number): void {
  performanceMonitor.trackUserInteraction(action, duration);
}

export function getPerformanceMetrics(): PerformanceMetrics | null {
  return performanceMonitor.getMetrics();
}

// Hook para React
export function usePerformanceMonitoring() {
  const [metrics, setMetrics] = React.useState<PerformanceMetrics | null>(null);
  const [score, setScore] = React.useState<PerformanceScore | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const measureMetrics = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const measuredMetrics = await measurePerformanceMetrics();
      const calculatedScore = calculatePerformanceScore(measuredMetrics);
      
      setMetrics(measuredMetrics);
      setScore(calculatedScore);
    } catch (error) {
      captureException(error as Error, { context: 'performance-monitoring' });
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    initPerformanceMonitoring();
    measureMetrics();
  }, [measureMetrics]);

  return {
    metrics,
    score,
    isLoading,
    measureMetrics,
    trackCustomMetric,
    trackApiCall,
    trackUserInteraction,
  };
}

// Componente de visualización de métricas
export function PerformanceMetricsDisplay({ 
  className,
  showDetails = false 
}: { 
  className?: string;
  showDetails?: boolean;
}) {
  const { metrics, score, isLoading } = usePerformanceMonitoring();

  if (isLoading) {
    return (
      <div className={`performance-metrics-loading ${className}`}>
        <div className="loading-spinner" />
        <span>Midiendo rendimiento...</span>
      </div>
    );
  }

  if (!metrics || !score) {
    return null;
  }

  return (
    <div className={`performance-metrics ${className}`}>
      <div className="metrics-header">
        <h3>Rendimiento de la Aplicación</h3>
        <div className={`score grade-${score.grade.toLowerCase()}`}>
          <span className="grade">{score.grade}</span>
          <span className="score-value">{score.score}/100</span>
        </div>
      </div>

      <div className="metrics-grid">
        {Object.entries(score.details).map(([key, detail]) => (
          <div key={key} className={`metric-item ${detail.passed ? 'passed' : 'failed'}`}>
            <span className="metric-name">{key.toUpperCase()}</span>
            <span className="metric-value">{detail.value.toFixed(2)}</span>
            <span className="metric-threshold">≤ {detail.threshold}</span>
          </div>
        ))}
      </div>

      {showDetails && (
        <div className="metrics-details">
          <h4>Detalles Adicionales</h4>
          <div className="detail-item">
            <span>DOM Load:</span>
            <span>{metrics.domLoad.toFixed(2)}ms</span>
          </div>
          <div className="detail-item">
            <span>Window Load:</span>
            <span>{metrics.windowLoad.toFixed(2)}ms</span>
          </div>
          {metrics.memory && (
            <div className="detail-item">
              <span>Memory Usage:</span>
              <span>{metrics.memory.used}MB / {metrics.memory.total}MB</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
