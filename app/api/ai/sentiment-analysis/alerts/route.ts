/**
 * API de Gestión de Alertas de Sentimientos
 * GET /api/ai/sentiment-analysis/alerts
 * PUT /api/ai/sentiment-analysis/alerts
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sentimentAnalysisService } from '@/lib/ai-services/sentiment-analysis-service';

/**
 * GET /api/ai/sentiment-analysis/alerts
 * Obtiene alertas de sentimientos no resueltas
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const teacherId = searchParams.get('teacherId');

    // Si es maestro, usar su ID
    if (session.user.role === 'TEACHER' && !teacherId) {
      teacherId = session.user.id;
    }

    const alerts = await sentimentAnalysisService.getUnresolvedAlerts(studentId, teacherId);

    return NextResponse.json({
      success: true,
      alerts,
      total: alerts.length
    });

  } catch (error) {
    console.error('Error obteniendo alertas:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/ai/sentiment-analysis/alerts
 * Resuelve una alerta de sentimientos
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { alertId, resolutionNotes } = body;

    if (!alertId) {
      return NextResponse.json(
        { error: 'Se requiere ID de la alerta' },
        { status: 400 }
      );
    }

    const success = await sentimentAnalysisService.resolveAlert(
      alertId,
      session.user.id,
      resolutionNotes
    );

    if (!success) {
      return NextResponse.json(
        { error: 'Error resolviendo alerta' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Alerta resuelta exitosamente'
    });

  } catch (error) {
    console.error('Error resolviendo alerta:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
