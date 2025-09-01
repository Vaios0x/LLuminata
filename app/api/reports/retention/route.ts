/**
 * API para Métricas de Retención
 * Análisis de retención avanzado
 */

import { NextRequest, NextResponse } from 'next/server';
import { advancedReporting } from '@/lib/advanced-reporting';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

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
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'startDate y endDate son requeridos' },
        { status: 400 }
      );
    }

    const retentionMetrics = await advancedReporting.getRetentionMetrics(
      new Date(startDate),
      new Date(endDate)
    );

    return NextResponse.json({
      success: true,
      data: retentionMetrics
    });

  } catch (error) {
    console.error('Error obteniendo métricas de retención:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    );
  }
}
