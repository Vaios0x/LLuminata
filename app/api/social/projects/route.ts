/**
 * API para Proyectos Colaborativos
 * Gestión de proyectos colaborativos, participantes y tareas
 */

import { NextRequest, NextResponse } from 'next/server';
import { socialServices } from '@/lib/social-services';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, description, subject, difficulty, estimatedDuration, maxParticipants } = body;

    const project = await socialServices.createCollaborativeProject({
      title,
      description,
      subject,
      difficulty,
      estimatedDuration,
      maxParticipants,
    }, session.user.id);

    return NextResponse.json({
      success: true,
      data: project
    });

  } catch (error) {
    console.error('Error creando proyecto colaborativo:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const projects = await socialServices.getStudentProjects(session.user.id);

    return NextResponse.json({
      success: true,
      data: projects
    });

  } catch (error) {
    console.error('Error obteniendo proyectos:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    );
  }
}
