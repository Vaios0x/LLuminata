import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { offlineContentGenerator } from '@/lib/offline-content-generator';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const culture = searchParams.get('culture') || 'maya';
    const language = searchParams.get('language') || 'es-GT';

    if (!studentId) {
      return NextResponse.json(
        { error: 'studentId es requerido' },
        { status: 400 }
      );
    }

    // Verificar que el estudiante existe
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        specialNeeds: true,
        teacher: true
      }
    });

    if (!student) {
      return NextResponse.json(
        { error: 'Estudiante no encontrado' },
        { status: 404 }
      );
    }

    // Generar paquete offline
    const offlinePackage = await offlineContentGenerator.generateStudentPackage(
      studentId,
      culture,
      language
    );

    return NextResponse.json(offlinePackage);

  } catch (error) {
    console.error('Error generando paquete offline:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { studentId, culture, language, forceRegenerate } = body;

    if (!studentId) {
      return NextResponse.json(
        { error: 'studentId es requerido' },
        { status: 400 }
      );
    }

    // Verificar que el estudiante existe
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        specialNeeds: true,
        teacher: true
      }
    });

    if (!student) {
      return NextResponse.json(
        { error: 'Estudiante no encontrado' },
        { status: 404 }
      );
    }

    // Generar paquete offline
    const offlinePackage = await offlineContentGenerator.generateStudentPackage(
      studentId,
      culture || 'maya',
      language || 'es-GT'
    );

    return NextResponse.json({
      success: true,
      package: offlinePackage,
      message: 'Paquete offline generado exitosamente'
    });

  } catch (error) {
    console.error('Error generando paquete offline:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
