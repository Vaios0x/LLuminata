import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

/**
 * GET /api/external-content
 * Obtiene contenido educativo externo
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const source = searchParams.get('source');
    const type = searchParams.get('type');
    const lessonId = searchParams.get('lessonId');
    const assessmentId = searchParams.get('assessmentId');

    // Construir filtros
    const where: any = { isActive: true };
    if (source) where.source = source;
    if (type) where.type = type;

    const content = await prisma.externalContent.findMany({
      where,
      include: {
        integrations: {
          include: {
            lesson: true,
            assessment: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Filtrar por lección o evaluación si se especifica
    let filteredContent = content;
    if (lessonId) {
      filteredContent = content.filter(item => 
        item.integrations.some(integration => integration.lessonId === lessonId)
      );
    }
    if (assessmentId) {
      filteredContent = content.filter(item => 
        item.integrations.some(integration => integration.assessmentId === assessmentId)
      );
    }

    return NextResponse.json({
      success: true,
      content: filteredContent,
      total: filteredContent.length
    });
  } catch (error) {
    console.error('Error obteniendo contenido externo:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/external-content
 * Crea nuevo contenido educativo externo
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { source, externalId, title, description, type, url, metadata, lessonId, assessmentId, integrationType } = body;

    // Validar datos requeridos
    if (!source || !externalId || !title || !type) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos' },
        { status: 400 }
      );
    }

    // Crear contenido externo
    const externalContent = await prisma.externalContent.create({
      data: {
        source,
        externalId,
        title,
        description,
        type,
        url,
        metadata: metadata || {},
        isActive: true
      }
    });

    // Crear integración si se especifica
    if (lessonId || assessmentId) {
      await prisma.externalContentIntegration.create({
        data: {
          externalContentId: externalContent.id,
          lessonId,
          assessmentId,
          integrationType: integrationType || 'link',
          config: {}
        }
      });
    }

    return NextResponse.json({
      success: true,
      content: externalContent,
      message: 'Contenido externo creado exitosamente'
    });
  } catch (error) {
    console.error('Error creando contenido externo:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/external-content/[id]
 * Actualiza contenido educativo externo
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Se requiere ID del contenido' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { title, description, url, metadata, isActive } = body;

    const updatedContent = await prisma.externalContent.update({
      where: { id },
      data: {
        title,
        description,
        url,
        metadata,
        isActive,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      content: updatedContent,
      message: 'Contenido externo actualizado exitosamente'
    });
  } catch (error) {
    console.error('Error actualizando contenido externo:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/external-content/[id]
 * Elimina contenido educativo externo
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Se requiere ID del contenido' },
        { status: 400 }
      );
    }

    // Eliminar integraciones primero
    await prisma.externalContentIntegration.deleteMany({
      where: { externalContentId: id }
    });

    // Eliminar contenido
    await prisma.externalContent.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Contenido externo eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error eliminando contenido externo:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
