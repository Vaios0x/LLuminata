/**
 * API para Recursos Compartidos
 * Gestión de recursos compartidos entre estudiantes
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
    const { title, description, type, url, fileSize, tags, studyGroupId, projectId } = body;

    const resource = await socialServices.shareResource({
      title,
      description,
      type,
      url,
      fileSize,
      tags,
    }, session.user.id, {
      studyGroupId,
      projectId,
    });

    return NextResponse.json({
      success: true,
      data: resource
    });

  } catch (error) {
    console.error('Error compartiendo recurso:', error);
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
    const type = searchParams.get('type');
    const tags = searchParams.get('tags')?.split(',');
    const studyGroupId = searchParams.get('studyGroupId');
    const projectId = searchParams.get('projectId');

    const filters: any = {};
    if (type) filters.type = type;
    if (tags) filters.tags = tags;
    if (studyGroupId) filters.studyGroupId = studyGroupId;
    if (projectId) filters.projectId = projectId;

    const resources = await socialServices.getSharedResources(filters);

    return NextResponse.json({
      success: true,
      data: resources
    });

  } catch (error) {
    console.error('Error obteniendo recursos:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    );
  }
}
