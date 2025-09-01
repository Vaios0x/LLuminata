/**
 * API para unirse a un grupo de estudio
 */

import { NextRequest, NextResponse } from 'next/server';
import { socialServices } from '@/lib/social-services';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { id: groupId } = params;

    const success = await socialServices.joinStudyGroup(groupId, session.user.id);

    return NextResponse.json({
      success: true,
      message: 'Te has unido exitosamente al grupo'
    });

  } catch (error) {
    console.error('Error uniéndose al grupo:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    );
  }
}
