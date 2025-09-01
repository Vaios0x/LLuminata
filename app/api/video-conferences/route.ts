import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

/**
 * GET /api/video-conferences
 * Obtiene videoconferencias programadas
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const platform = searchParams.get('platform');
    const hostId = searchParams.get('hostId');
    const isActive = searchParams.get('isActive');

    // Construir filtros
    const where: any = {};
    if (platform) where.platform = platform;
    if (hostId) where.hostId = hostId;
    if (isActive !== null) where.isActive = isActive === 'true';

    const conferences = await prisma.videoConference.findMany({
      where,
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        startTime: 'asc'
      }
    });

    return NextResponse.json({
      success: true,
      conferences,
      total: conferences.length
    });
  } catch (error) {
    console.error('Error obteniendo videoconferencias:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/video-conferences
 * Crea una nueva videoconferencia
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      platform, 
      meetingId, 
      title, 
      description, 
      startTime, 
      endTime, 
      participants 
    } = body;

    // Validar datos requeridos
    if (!platform || !meetingId || !title || !startTime) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos' },
        { status: 400 }
      );
    }

    // Crear videoconferencia
    const conference = await prisma.videoConference.create({
      data: {
        platform,
        meetingId,
        title,
        description,
        startTime: new Date(startTime),
        endTime: endTime ? new Date(endTime) : null,
        hostId: session.user.id,
        participants: participants || [],
        isActive: true
      }
    });

    // Agregar participantes si se especifican
    if (participants && participants.length > 0) {
      await prisma.videoConference.update({
        where: { id: conference.id },
        data: {
          users: {
            connect: participants.map((userId: string) => ({ id: userId }))
          }
        }
      });
    }

    return NextResponse.json({
      success: true,
      conference,
      message: 'Videoconferencia creada exitosamente'
    });
  } catch (error) {
    console.error('Error creando videoconferencia:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/video-conferences/[id]
 * Actualiza una videoconferencia
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
        { error: 'Se requiere ID de la videoconferencia' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { 
      title, 
      description, 
      startTime, 
      endTime, 
      participants, 
      recordingUrl, 
      isActive 
    } = body;

    const updatedConference = await prisma.videoConference.update({
      where: { id },
      data: {
        title,
        description,
        startTime: startTime ? new Date(startTime) : undefined,
        endTime: endTime ? new Date(endTime) : undefined,
        participants: participants || undefined,
        recordingUrl,
        isActive,
        updatedAt: new Date()
      }
    });

    // Actualizar participantes si se especifican
    if (participants) {
      await prisma.videoConference.update({
        where: { id },
        data: {
          users: {
            set: participants.map((userId: string) => ({ id: userId }))
          }
        }
      });
    }

    return NextResponse.json({
      success: true,
      conference: updatedConference,
      message: 'Videoconferencia actualizada exitosamente'
    });
  } catch (error) {
    console.error('Error actualizando videoconferencia:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/video-conferences/[id]
 * Elimina una videoconferencia
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
        { error: 'Se requiere ID de la videoconferencia' },
        { status: 400 }
      );
    }

    // Verificar que el usuario sea el host
    const conference = await prisma.videoConference.findUnique({
      where: { id }
    });

    if (!conference || conference.hostId !== session.user.id) {
      return NextResponse.json(
        { error: 'Solo el host puede eliminar la videoconferencia' },
        { status: 403 }
      );
    }

    await prisma.videoConference.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Videoconferencia eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error eliminando videoconferencia:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/video-conferences/[id]/join
 * Agrega un usuario a una videoconferencia
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const action = searchParams.get('action');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Se requiere ID de la videoconferencia' },
        { status: 400 }
      );
    }

    if (action === 'join') {
      // Agregar usuario a la videoconferencia
      await prisma.videoConference.update({
        where: { id },
        data: {
          users: {
            connect: { id: session.user.id }
          }
        }
      });

      return NextResponse.json({
        success: true,
        message: 'Usuario agregado a la videoconferencia'
      });
    } else if (action === 'leave') {
      // Remover usuario de la videoconferencia
      await prisma.videoConference.update({
        where: { id },
        data: {
          users: {
            disconnect: { id: session.user.id }
          }
        }
      });

      return NextResponse.json({
        success: true,
        message: 'Usuario removido de la videoconferencia'
      });
    }

    return NextResponse.json(
      { error: 'Acción no válida' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error gestionando participación en videoconferencia:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
