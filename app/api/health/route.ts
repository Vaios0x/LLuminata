import { NextRequest, NextResponse } from 'next/server';
import { MONITORING_CONFIG } from '@/lib/monitoring/monitoring-config';

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Verificar estado básico de la aplicación
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: MONITORING_CONFIG.version,
      environment: MONITORING_CONFIG.environment,
      checks: {
        api: {
          status: 'healthy',
          responseTime: 0,
          timestamp: new Date().toISOString(),
        },
        memory: {
          status: 'healthy',
          details: {},
          timestamp: new Date().toISOString(),
        },
        database: {
          status: 'healthy',
          details: {},
          timestamp: new Date().toISOString(),
        },
      },
    };

    // Verificar memoria
    if (typeof process !== 'undefined') {
      const usage = process.memoryUsage();
      const memoryUsage = usage.heapUsed / usage.heapTotal;
      
      healthStatus.checks.memory = {
        status: memoryUsage <= MONITORING_CONFIG.healthChecks.thresholds.memoryUsage ? 'healthy' : 'degraded',
        details: {
          heapUsed: Math.round(usage.heapUsed / 1024 / 1024),
          heapTotal: Math.round(usage.heapTotal / 1024 / 1024),
          memoryUsage: Math.round(memoryUsage * 100),
        },
        timestamp: new Date().toISOString(),
      };
    }

    // Verificar base de datos (simulado)
    try {
      // Aquí se haría la verificación real de la base de datos
      healthStatus.checks.database = {
        status: 'healthy',
        details: {
          connection: 'active',
          tables: ['users', 'students', 'teachers', 'lessons'],
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      healthStatus.checks.database = {
        status: 'unhealthy',
        details: {
          error: error instanceof Error ? error.message : 'Database check failed',
        },
        timestamp: new Date().toISOString(),
      };
    }

    // Calcular tiempo de respuesta
    const responseTime = Date.now() - startTime;
    healthStatus.checks.api.responseTime = responseTime;

    // Determinar estado general
    const allChecks = Object.values(healthStatus.checks);
    const hasUnhealthy = allChecks.some(check => check.status === 'unhealthy');
    const hasDegraded = allChecks.some(check => check.status === 'degraded');

    if (hasUnhealthy) {
      healthStatus.status = 'unhealthy';
    } else if (hasDegraded) {
      healthStatus.status = 'degraded';
    }

    // Headers de respuesta
    const headers = {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'X-Health-Check': 'true',
      'X-Response-Time': `${responseTime}ms`,
    };

    return NextResponse.json(healthStatus, {
      status: healthStatus.status === 'healthy' ? 200 : 503,
      headers,
    });

  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    const errorResponse = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Health check failed',
      responseTime,
    };

    return NextResponse.json(errorResponse, {
      status: 503,
      headers: {
        'Content-Type': 'application/json',
        'X-Health-Check': 'true',
        'X-Response-Time': `${responseTime}ms`,
      },
    });
  }
}
