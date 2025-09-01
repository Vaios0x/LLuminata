import { NextRequest, NextResponse } from 'next/server';
import { lmsIntegrationManager, type LMSGrade } from '@/lib/lms-integration';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * POST /api/lms/grades/export
 * Exporta calificaciones a un LMS externo
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { connectionId, grades, courseId } = body;

    if (!connectionId || !grades || !Array.isArray(grades)) {
      return NextResponse.json(
        { error: 'Se requiere connectionId y un array de calificaciones' },
        { status: 400 }
      );
    }

    // Validar y transformar calificaciones
    const lmsGrades: LMSGrade[] = grades.map((grade: any) => ({
      userId: grade.userId,
      moduleId: grade.moduleId || courseId,
      score: parseFloat(grade.score) || 0,
      maxScore: parseFloat(grade.maxScore) || 100,
      percentage: parseFloat(grade.percentage) || 0,
      feedback: grade.feedback,
      submittedAt: new Date(grade.submittedAt || Date.now()),
      gradedAt: grade.gradedAt ? new Date(grade.gradedAt) : undefined
    }));

    // Exportar calificaciones
    const success = await lmsIntegrationManager.exportGrades(connectionId, lmsGrades);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Error al exportar calificaciones' },
        { status: 500 }
      );
    }

    // Registrar la exportación en la base de datos
    await prisma.lMSGrade.createMany({
      data: lmsGrades.map(grade => ({
        connectionId,
        userId: grade.userId,
        moduleId: grade.moduleId,
        score: grade.score,
        maxScore: grade.maxScore,
        percentage: grade.percentage,
        feedback: grade.feedback,
        submittedAt: grade.submittedAt,
        gradedAt: grade.gradedAt,
        lastSync: new Date()
      })),
      skipDuplicates: true
    });

    return NextResponse.json({
      success: true,
      exported: lmsGrades.length,
      message: 'Calificaciones exportadas exitosamente'
    });
  } catch (error) {
    console.error('Error exportando calificaciones:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/lms/grades
 * Obtiene calificaciones sincronizadas de LMS externos
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const connectionId = searchParams.get('connectionId');
    const userId = searchParams.get('userId');
    const courseId = searchParams.get('courseId');

    // Construir filtros
    const where: any = {};
    if (connectionId) where.connectionId = connectionId;
    if (userId) where.userId = userId;
    if (courseId) where.moduleId = courseId;

    const grades = await prisma.lMSGrade.findMany({
      where,
      include: {
        connection: {
          include: {
            institution: true
          }
        }
      },
      orderBy: {
        lastSync: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      grades,
      total: grades.length
    });
  } catch (error) {
    console.error('Error obteniendo calificaciones LMS:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/lms/grades/update
 * Actualiza una calificación específica en LMS externo
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { connectionId, gradeId, grade } = body;

    if (!connectionId || !gradeId || !grade) {
      return NextResponse.json(
        { error: 'Se requiere connectionId, gradeId y grade' },
        { status: 400 }
      );
    }

    // Actualizar calificación en LMS externo
    const success = await lmsIntegrationManager.updateGrade(connectionId, gradeId, grade);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Error al actualizar calificación' },
        { status: 500 }
      );
    }

    // Actualizar en base de datos local
    await prisma.lMSGrade.updateMany({
      where: {
        connectionId,
        moduleId: gradeId
      },
      data: {
        score: parseFloat(grade.score) || 0,
        maxScore: parseFloat(grade.maxScore) || 100,
        percentage: parseFloat(grade.percentage) || 0,
        feedback: grade.feedback,
        gradedAt: new Date(),
        lastSync: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Calificación actualizada exitosamente'
    });
  } catch (error) {
    console.error('Error actualizando calificación:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
