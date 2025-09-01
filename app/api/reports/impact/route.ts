/**
 * API para Análisis de Impacto
 * Generación de análisis de impacto educativo
 */

import { NextRequest, NextResponse } from 'next/server';
import { advancedReporting } from '@/lib/advanced-reporting';
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
    const { analysisType, period, startDate, endDate } = body;

    const analysis = await advancedReporting.generateImpactAnalysis({
      analysisType,
      period,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    });

    return NextResponse.json({
      success: true,
      data: analysis
    });

  } catch (error) {
    console.error('Error generando análisis de impacto:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    );
  }
}
