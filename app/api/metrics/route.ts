import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Métricas básicas de la aplicación
let requestCount = 0;
let errorCount = 0;
let activeUsers = 0;

export async function GET() {
  try {
    // Obtener métricas de la base de datos
    const dbStats = await prisma.$queryRaw`
      SELECT 
        (SELECT COUNT(*) FROM "Teacher") as teacher_count,
        (SELECT COUNT(*) FROM "Student") as student_count,
        (SELECT COUNT(*) FROM "Lesson") as lesson_count
    `;

    const stats = Array.isArray(dbStats) ? dbStats[0] : dbStats;
    
    // Formato de métricas para Prometheus
    const metrics = [
      '# HELP inclusive_ai_requests_total Total number of requests',
      '# TYPE inclusive_ai_requests_total counter',
      `inclusive_ai_requests_total ${requestCount}`,
      '',
      '# HELP inclusive_ai_errors_total Total number of errors',
      '# TYPE inclusive_ai_errors_total counter',
      `inclusive_ai_errors_total ${errorCount}`,
      '',
      '# HELP inclusive_ai_active_users Current number of active users',
      '# TYPE inclusive_ai_active_users gauge',
      `inclusive_ai_active_users ${activeUsers}`,
      '',
      '# HELP inclusive_ai_teachers_total Total number of teachers',
      '# TYPE inclusive_ai_teachers_total gauge',
      `inclusive_ai_teachers_total ${stats?.teacher_count || 0}`,
      '',
      '# HELP inclusive_ai_students_total Total number of students',
      '# TYPE inclusive_ai_students_total gauge',
      `inclusive_ai_students_total ${stats?.student_count || 0}`,
      '',
      '# HELP inclusive_ai_lessons_total Total number of lessons',
      '# TYPE inclusive_ai_lessons_total gauge',
      `inclusive_ai_lessons_total ${stats?.lesson_count || 0}`,
      '',
      '# HELP inclusive_ai_app_info Application information',
      '# TYPE inclusive_ai_app_info gauge',
      `inclusive_ai_app_info{version="${process.env.npm_package_version || '1.0.0'}",environment="${process.env.NODE_ENV || 'development'}"} 1`
    ].join('\n');

    return new NextResponse(metrics, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; version=0.0.4; charset=utf-8',
        'Cache-Control': 'no-cache'
      }
    });

  } catch (error) {
    console.error('Metrics collection failed:', error);
    
    // Retornar métricas básicas en caso de error
    const errorMetrics = [
      '# HELP inclusive_ai_requests_total Total number of requests',
      '# TYPE inclusive_ai_requests_total counter',
      `inclusive_ai_requests_total ${requestCount}`,
      '',
      '# HELP inclusive_ai_errors_total Total number of errors',
      '# TYPE inclusive_ai_errors_total counter',
      `inclusive_ai_errors_total ${errorCount + 1}`,
      '',
      '# HELP inclusive_ai_metrics_collection_errors_total Total number of metrics collection errors',
      '# TYPE inclusive_ai_metrics_collection_errors_total counter',
      'inclusive_ai_metrics_collection_errors_total 1'
    ].join('\n');

    return new NextResponse(errorMetrics, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; version=0.0.4; charset=utf-8',
        'Cache-Control': 'no-cache'
      }
    });
  } finally {
    await prisma.$disconnect();
  }
}

// Función para incrementar contadores (usada por middleware)
export function incrementRequestCount() {
  requestCount++;
}

export function incrementErrorCount() {
  errorCount++;
}

export function setActiveUsers(count: number) {
  activeUsers = count;
}
