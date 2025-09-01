/**
 * API de Análisis de Sentimientos en Tiempo Real
 * POST /api/ai/sentiment-analysis
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sentimentAnalysisService } from '@/lib/ai-services/sentiment-analysis-service';

/**
 * POST /api/ai/sentiment-analysis
 * Analiza sentimientos en tiempo real
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      studentId, 
      text, 
      audioFeatures, 
      behavioralMetrics, 
      context 
    } = body;

    // Validar datos requeridos
    if (!studentId) {
      return NextResponse.json(
        { error: 'Se requiere ID del estudiante' },
        { status: 400 }
      );
    }

    // Verificar que el usuario tenga acceso al estudiante
    if (session.user.role === 'TEACHER') {
      // Los maestros solo pueden analizar sus propios estudiantes
      // Esta validación se puede implementar según la lógica de negocio
    }

    let result;

    // Analizar según el tipo de datos proporcionados
    if (text) {
      result = await sentimentAnalysisService.analyzeTextSentiment(
        text, 
        studentId, 
        context
      );
    } else if (audioFeatures) {
      result = await sentimentAnalysisService.analyzeAudioSentiment(
        audioFeatures, 
        studentId, 
        context
      );
    } else if (behavioralMetrics) {
      result = await sentimentAnalysisService.analyzeBehavioralSentiment(
        behavioralMetrics, 
        studentId, 
        context
      );
    } else {
      return NextResponse.json(
        { error: 'Se requiere texto, audioFeatures o behavioralMetrics' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error en análisis de sentimientos:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/ai/sentiment-analysis
 * Obtiene análisis de sentimientos recientes
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!studentId) {
      return NextResponse.json(
        { error: 'Se requiere ID del estudiante' },
        { status: 400 }
      );
    }

    const analyses = await sentimentAnalysisService.getRecentSentimentAnalyses(
      studentId, 
      limit
    );

    return NextResponse.json({
      success: true,
      analyses,
      total: analyses.length
    });

  } catch (error) {
    console.error('Error obteniendo análisis de sentimientos:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
