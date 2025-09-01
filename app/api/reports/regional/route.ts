/**
 * API para Reportes Regionales
 * Generación de reportes de progreso por región
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
    const { region, period, startDate, endDate } = body;

    const report = await advancedReporting.generateRegionalReport({
      region,
      period,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    });

    return NextResponse.json({
      success: true,
      data: report
    });

  } catch (error) {
    console.error('Error generando reporte regional:', error);
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
    const period = searchParams.get('period') || 'monthly';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'startDate y endDate son requeridos' },
        { status: 400 }
      );
    }

    const comparison = await advancedReporting.getRegionalComparison(
      period,
      new Date(startDate),
      new Date(endDate)
    );

    return NextResponse.json({
      success: true,
      data: comparison
    });

  } catch (error) {
    console.error('Error obteniendo comparación regional:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    );
  }
}
