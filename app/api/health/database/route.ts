import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { MONITORING_CONFIG } from '@/lib/monitoring/monitoring-config';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Verificar conexión a la base de datos
    await prisma.$queryRaw`SELECT 1`;
    
    // Verificar tablas principales
    const tableChecks = await Promise.allSettled([
      prisma.user.count(),
      prisma.student.count(),
      prisma.teacher.count(),
      prisma.lesson.count(),
    ]);

    const tableStatus = tableChecks.map((result, index) => {
      const tableNames = ['users', 'students', 'teachers', 'lessons'];
      return {
        table: tableNames[index],
        status: result.status === 'fulfilled' ? 'healthy' : 'error',
        count: result.status === 'fulfilled' ? result.value : 0,
        error: result.status === 'rejected' ? (result.reason as Error).message : null,
      };
    });

    // Verificar migraciones
    const migrations = await prisma.$queryRaw`
      SELECT name, executed_at 
      FROM _prisma_migrations 
      ORDER BY executed_at DESC 
      LIMIT 5
    `;

    const responseTime = Date.now() - startTime;
    const isHealthy = responseTime <= MONITORING_CONFIG.healthChecks.thresholds.responseTime;

    const healthStatus = {
      status: isHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      responseTime,
      details: {
        connection: 'active',
        tables: tableStatus,
        migrations: migrations,
        database: process.env.DATABASE_URL ? 'configured' : 'not_configured',
      },
    };

    return NextResponse.json(healthStatus, {
      status: healthStatus.status === 'healthy' ? 200 : 503,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Health-Check': 'database',
        'X-Response-Time': `${responseTime}ms`,
      },
    });

  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    const errorResponse = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      responseTime,
      error: error instanceof Error ? error.message : 'Database health check failed',
      details: {
        connection: 'failed',
        database: process.env.DATABASE_URL ? 'configured' : 'not_configured',
      },
    };

    return NextResponse.json(errorResponse, {
      status: 503,
      headers: {
        'Content-Type': 'application/json',
        'X-Health-Check': 'database',
        'X-Response-Time': `${responseTime}ms`,
      },
    });
  } finally {
    await prisma.$disconnect();
  }
}
