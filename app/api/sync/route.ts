import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const syncData = await request.json();
    
    // Procesar diferentes tipos de sincronización
    for (const item of syncData.items) {
      switch (item.type) {
        case 'lesson_completion':
          await prisma.completedLesson.create({
            data: {
              studentId: item.data.studentId,
              lessonId: item.data.lessonId,
              completedAt: new Date(item.data.completedAt),
              timeSpent: item.data.timeSpent,
              score: item.data.score
            }
          });
          break;
          
        case 'assessment':
          await prisma.assessment.create({
            data: {
              studentId: item.data.studentId,
              type: item.data.type,
              score: item.data.score,
              details: item.data.details
            }
          });
          break;
          
        case 'progress_update':
          await prisma.student.update({
            where: { id: item.data.studentId },
            data: {
              readingLevel: item.data.readingLevel,
              cognitiveLevel: item.data.cognitiveLevel
            }
          });
          break;
      }
    }
    
    // Registrar sincronización exitosa
    await prisma.syncLog.create({
      data: {
        studentId: syncData.studentId,
        syncType: 'upload',
        dataSize: JSON.stringify(syncData).length,
        success: true
      }
    });
    
    return NextResponse.json({ 
      success: true, 
      synced: syncData.items.length,
      message: 'Datos sincronizados exitosamente'
    });

  } catch (error) {
    console.error('Error en sincronización:', error);
    
    // Registrar error de sincronización
    try {
      await prisma.syncLog.create({
        data: {
          studentId: syncData?.studentId || 'unknown',
          syncType: 'upload',
          dataSize: JSON.stringify(syncData || {}).length,
          success: false,
          error: error instanceof Error ? error.message : 'Error desconocido'
        }
      });
    } catch (logError) {
      console.error('Error al registrar log de sincronización:', logError);
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al sincronizar datos',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');

    if (!studentId) {
      return NextResponse.json(
        { success: false, error: 'studentId es requerido' },
        { status: 400 }
      );
    }

    // Obtener datos para sincronización offline
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        specialNeeds: true,
        completedLessons: {
          include: { lesson: true },
          orderBy: { completedAt: 'desc' },
          take: 10
        },
        assessments: {
          orderBy: { conductedAt: 'desc' },
          take: 5
        },
        achievements: {
          orderBy: { earnedAt: 'desc' },
          take: 10
        }
      }
    });

    if (!student) {
      return NextResponse.json(
        { success: false, error: 'Estudiante no encontrado' },
        { status: 404 }
      );
    }

    // Obtener lecciones disponibles para offline
    const lessons = await prisma.lesson.findMany({
      where: {
        gradeLevel: student.readingLevel,
        difficulty: {
          gte: Math.max(1, student.cognitiveLevel - 1),
          lte: Math.min(5, student.cognitiveLevel + 1)
        }
      },
      take: 20
    });

    return NextResponse.json({
      success: true,
      student,
      lessons,
      lastSync: student.lastSync,
      syncTimestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error al obtener datos para sincronización:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al obtener datos para sincronización' 
      },
      { status: 500 }
    );
  }
}
