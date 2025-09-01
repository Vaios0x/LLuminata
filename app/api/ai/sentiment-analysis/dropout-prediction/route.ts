/**
 * API de Predicción de Riesgo de Abandono Escolar
 * POST /api/ai/sentiment-analysis/dropout-prediction
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sentimentAnalysisService } from '@/lib/ai-services/sentiment-analysis-service';

/**
 * POST /api/ai/sentiment-analysis/dropout-prediction
 * Predice riesgo de abandono escolar
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { studentId } = body;

    if (!studentId) {
      return NextResponse.json(
        { error: 'Se requiere ID del estudiante' },
        { status: 400 }
      );
    }

    const prediction = await sentimentAnalysisService.predictDropoutRisk(studentId);

    return NextResponse.json({
      success: true,
      prediction,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error en predicción de abandono:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/ai/sentiment-analysis/dropout-prediction
 * Obtiene predicción de riesgo de abandono para múltiples estudiantes
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const studentIds = searchParams.get('studentIds')?.split(',') || [];

    if (studentIds.length === 0) {
      return NextResponse.json(
        { error: 'Se requiere al menos un ID de estudiante' },
        { status: 400 }
      );
    }

    const predictions = [];

    for (const studentId of studentIds) {
      try {
        const prediction = await sentimentAnalysisService.predictDropoutRisk(studentId);
        predictions.push({
          studentId,
          prediction
        });
      } catch (error) {
        console.error(`Error prediciendo para estudiante ${studentId}:`, error);
        predictions.push({
          studentId,
          error: 'Error en predicción'
        });
      }
    }

    return NextResponse.json({
      success: true,
      predictions,
      total: predictions.length
    });

  } catch (error) {
    console.error('Error obteniendo predicciones de abandono:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
