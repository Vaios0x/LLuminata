import { NextRequest, NextResponse } from 'next/server';
import { MONITORING_CONFIG } from '@/lib/monitoring/monitoring-config';

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    let memoryStatus;

    if (typeof process !== 'undefined') {
      // Información de memoria del proceso
      const usage = process.memoryUsage();
      const memoryUsage = usage.heapUsed / usage.heapTotal;
      const externalUsage = usage.external / usage.heapTotal;
      const rssUsage = usage.rss / (1024 * 1024 * 1024); // GB

      // Verificar límites
      const isHeapHealthy = memoryUsage <= MONITORING_CONFIG.healthChecks.thresholds.memoryUsage;
      const isRssHealthy = rssUsage <= 1; // 1GB límite para RSS
      const isExternalHealthy = externalUsage <= 0.5; // 50% límite para memoria externa

      let overallStatus: 'healthy' | 'degraded' | 'unhealthy';
      if (!isHeapHealthy || !isRssHealthy) {
        overallStatus = 'unhealthy';
      } else if (!isExternalHealthy) {
        overallStatus = 'degraded';
      } else {
        overallStatus = 'healthy';
      }

      memoryStatus = {
        status: overallStatus,
        timestamp: new Date().toISOString(),
        responseTime: Date.now() - startTime,
        details: {
          heap: {
            used: Math.round(usage.heapUsed / 1024 / 1024), // MB
            total: Math.round(usage.heapTotal / 1024 / 1024), // MB
            usage: Math.round(memoryUsage * 100), // %
            status: isHeapHealthy ? 'healthy' : 'unhealthy',
            threshold: Math.round(MONITORING_CONFIG.healthChecks.thresholds.memoryUsage * 100),
          },
          external: {
            used: Math.round(usage.external / 1024 / 1024), // MB
            usage: Math.round(externalUsage * 100), // %
            status: isExternalHealthy ? 'healthy' : 'degraded',
            threshold: 50,
          },
          rss: {
            used: Math.round(usage.rss / 1024 / 1024), // MB
            usage: Math.round(rssUsage * 100), // %
            status: isRssHealthy ? 'healthy' : 'unhealthy',
            threshold: 100, // 1GB
          },
          arrayBuffers: {
            used: Math.round(usage.arrayBuffers / 1024 / 1024), // MB
          },
          limits: {
            heapSizeLimit: Math.round((usage as any).jsHeapSizeLimit / 1024 / 1024), // MB
          },
        },
        warnings: [] as string[],
      };

      // Agregar advertencias si es necesario
      if (memoryUsage > 0.7) {
        memoryStatus.warnings.push('Uso de heap alto (>70%)');
      }
      if (rssUsage > 0.8) {
        memoryStatus.warnings.push('Uso de RSS alto (>800MB)');
      }
      if (externalUsage > 0.4) {
        memoryStatus.warnings.push('Uso de memoria externa alto (>40%)');
      }

    } else {
      // En el navegador, usar performance.memory si está disponible
      if (typeof window !== 'undefined' && 'memory' in performance) {
        const memory = (performance as any).memory;
        const memoryUsage = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
        const isHealthy = memoryUsage <= MONITORING_CONFIG.healthChecks.thresholds.memoryUsage;

        memoryStatus = {
          status: isHealthy ? 'healthy' : 'degraded',
          timestamp: new Date().toISOString(),
          responseTime: Date.now() - startTime,
          details: {
            heap: {
              used: Math.round(memory.usedJSHeapSize / 1024 / 1024), // MB
              total: Math.round(memory.totalJSHeapSize / 1024 / 1024), // MB
              limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024), // MB
              usage: Math.round(memoryUsage * 100), // %
              status: isHealthy ? 'healthy' : 'degraded',
              threshold: Math.round(MONITORING_CONFIG.healthChecks.thresholds.memoryUsage * 100),
            },
            environment: 'browser',
          },
          warnings: memoryUsage > 0.7 ? ['Uso de memoria alto (>70%)'] : [] as string[],
        };
      } else {
        memoryStatus = {
          status: 'unknown',
          timestamp: new Date().toISOString(),
          responseTime: Date.now() - startTime,
          details: {
            note: 'Memory information not available in this environment',
            environment: typeof window !== 'undefined' ? 'browser' : 'unknown',
          },
          warnings: [],
        };
      }
    }

    return NextResponse.json(memoryStatus, {
      status: memoryStatus.status === 'healthy' ? 200 : 503,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Health-Check': 'memory',
        'X-Response-Time': `${memoryStatus.responseTime}ms`,
      },
    });

  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    const errorResponse = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      responseTime,
      error: error instanceof Error ? error.message : 'Memory health check failed',
      details: {
        environment: typeof window !== 'undefined' ? 'browser' : 'server',
      },
    };

    return NextResponse.json(errorResponse, {
      status: 503,
      headers: {
        'Content-Type': 'application/json',
        'X-Health-Check': 'memory',
        'X-Response-Time': `${responseTime}ms`,
      },
    });
  }
}
