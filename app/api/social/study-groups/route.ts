/**
 * API para Grupos de Estudio
 * Gestión de grupos de estudio, miembros y reuniones
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
    const { name, description, subject, gradeLevel, maxMembers, isPublic, meetingSchedule, studyGoals } = body;

    const group = await socialServices.createStudyGroup({
      name,
      description,
      subject,
      gradeLevel,
      maxMembers,
      isPublic,
      meetingSchedule,
      studyGoals,
    }, session.user.id);

    return NextResponse.json({
      success: true,
      data: group
    });

  } catch (error) {
    console.error('Error creando grupo de estudio:', error);
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

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'my' | 'public'
    const subject = searchParams.get('subject');
    const gradeLevel = searchParams.get('gradeLevel');
    const maxMembers = searchParams.get('maxMembers');

    let groups;

    if (type === 'public') {
      const filters: any = {};
      if (subject) filters.subject = subject;
      if (gradeLevel) filters.gradeLevel = parseInt(gradeLevel);
      if (maxMembers) filters.maxMembers = parseInt(maxMembers);

      groups = await socialServices.getPublicStudyGroups(filters);
    } else {
      groups = await socialServices.getStudentStudyGroups(session.user.id);
    }

    return NextResponse.json({
      success: true,
      data: groups
    });

  } catch (error) {
    console.error('Error obteniendo grupos de estudio:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    );
  }
}
