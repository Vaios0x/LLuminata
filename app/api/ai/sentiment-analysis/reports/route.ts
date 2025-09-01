/**
 * API de Reportes de Sentimientos
 * GET /api/ai/sentiment-analysis/reports
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sentimentAnalysisService } from '@/lib/ai-services/sentiment-analysis-service';

/**
 * GET /api/ai/sentiment-analysis/reports
 * Genera reporte de sentimientos para un estudiante
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const days = parseInt(searchParams.get('days') || '30');

    if (!studentId) {
      return NextResponse.json(
        { error: 'Se requiere ID del estudiante' },
        { status: 400 }
      );
    }

    const report = await sentimentAnalysisService.generateSentimentReport(studentId, days);

    return NextResponse.json({
      success: true,
      report
    });

  } catch (error) {
    console.error('Error generando reporte:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
