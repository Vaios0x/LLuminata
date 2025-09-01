import { NextRequest, NextResponse } from 'next/server';
import { lmsIntegrationManager } from '@/lib/lms-integration';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * POST /api/lms/sync
 * Sincroniza datos con un LMS externo específico
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { connectionId, syncType = 'full' } = body;

    if (!connectionId) {
      return NextResponse.json(
        { error: 'Se requiere connectionId' },
        { status: 400 }
      );
    }

    // Iniciar sincronización
    const result = await lmsIntegrationManager.syncWithLMS(connectionId);
    
    return NextResponse.json({
      success: result.success,
      result,
      message: result.success 
        ? 'Sincronización completada exitosamente' 
        : 'Error en la sincronización'
    });
  } catch (error) {
    console.error('Error en sincronización LMS:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/lms/sync/status
 * Obtiene el estado de sincronización de todas las conexiones
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const connectionId = searchParams.get('connectionId');

    if (connectionId) {
      // Obtener estado de una conexión específica
      const connections = await lmsIntegrationManager.getConnections();
      const connection = connections.find(conn => conn.id === connectionId);
      
      if (!connection) {
        return NextResponse.json(
          { error: 'Conexión no encontrada' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        connection
      });
    } else {
      // Obtener estado de todas las conexiones
      const connections = await lmsIntegrationManager.getConnections();
      
      return NextResponse.json({
        success: true,
        connections,
        summary: {
          total: connections.length,
          active: connections.filter(c => c.status === 'active').length,
          syncing: connections.filter(c => c.syncStatus === 'syncing').length,
          error: connections.filter(c => c.status === 'error').length
        }
      });
    }
  } catch (error) {
    console.error('Error obteniendo estado de sincronización:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
