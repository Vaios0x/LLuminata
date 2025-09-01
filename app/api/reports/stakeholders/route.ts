/**
 * API para Reportes de Stakeholders
 * Generación de reportes específicos para diferentes tipos de stakeholders
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
    const { 
      stakeholderType, 
      reportType, 
      period, 
      summary, 
      keyMetrics, 
      recommendations, 
      nextSteps 
    } = body;

    const report = await advancedReporting.generateStakeholderReport({
      stakeholderType,
      reportType,
      period,
      summary,
      keyMetrics,
      recommendations,
      nextSteps,
    });

    return NextResponse.json({
      success: true,
      data: report
    });

  } catch (error) {
    console.error('Error generando reporte de stakeholder:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    );
  }
}
