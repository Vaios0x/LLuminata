/**
 * API para Mentores
 * Gestión de mentores y mentorías
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
    const { name, expertise, experience, availability } = body;

    const mentor = await socialServices.createMentor({
      name,
      expertise,
      experience,
      availability,
    }, session.user.id);

    return NextResponse.json({
      success: true,
      data: mentor
    });

  } catch (error) {
    console.error('Error creando mentor:', error);
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
    const expertise = searchParams.get('expertise')?.split(',');
    const experience = searchParams.get('experience');

    const filters: any = {};
    if (expertise) filters.expertise = expertise;
    if (experience) filters.experience = parseInt(experience);

    const mentors = await socialServices.getAvailableMentors(filters);

    return NextResponse.json({
      success: true,
      data: mentors
    });

  } catch (error) {
    console.error('Error obteniendo mentores:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    );
  }
}
