import { NextRequest, NextResponse } from 'next/server';
import { MONITORING_CONFIG } from '@/lib/monitoring/monitoring-config';

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const externalChecks = [];

    // Verificar servicios de IA
    if (process.env.ANTHROPIC_API_KEY) {
      try {
        const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: 'claude-3-sonnet-20240229',
            max_tokens: 1,
            messages: [{ role: 'user', content: 'test' }],
          }),
          signal: AbortSignal.timeout(5000),
        });

        externalChecks.push({
          service: 'anthropic',
          status: anthropicResponse.ok ? 'healthy' : 'degraded',
          responseTime: Date.now() - startTime,
          details: {
            statusCode: anthropicResponse.status,
            configured: true,
          },
        });
      } catch (error) {
        externalChecks.push({
          service: 'anthropic',
          status: 'unhealthy',
          responseTime: Date.now() - startTime,
          error: error instanceof Error ? error.message : 'Anthropic check failed',
          details: { configured: true },
        });
      }
    } else {
      externalChecks.push({
        service: 'anthropic',
        status: 'not_configured',
        responseTime: 0,
        details: { configured: false },
      });
    }

    // Verificar OpenAI
    if (process.env.OPENAI_API_KEY) {
      try {
        const openaiResponse = await fetch('https://api.openai.com/v1/models', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          },
          signal: AbortSignal.timeout(5000),
        });

        externalChecks.push({
          service: 'openai',
          status: openaiResponse.ok ? 'healthy' : 'degraded',
          responseTime: Date.now() - startTime,
          details: {
            statusCode: openaiResponse.status,
            configured: true,
          },
        });
      } catch (error) {
        externalChecks.push({
          service: 'openai',
          status: 'unhealthy',
          responseTime: Date.now() - startTime,
          error: error instanceof Error ? error.message : 'OpenAI check failed',
          details: { configured: true },
        });
      }
    } else {
      externalChecks.push({
        service: 'openai',
        status: 'not_configured',
        responseTime: 0,
        details: { configured: false },
      });
    }

    // Verificar conectividad general
    try {
      const connectivityResponse = await fetch('https://httpbin.org/get', {
        method: 'GET',
        signal: AbortSignal.timeout(3000),
      });

      externalChecks.push({
        service: 'internet_connectivity',
        status: connectivityResponse.ok ? 'healthy' : 'degraded',
        responseTime: Date.now() - startTime,
        details: {
          statusCode: connectivityResponse.status,
        },
      });
    } catch (error) {
      externalChecks.push({
        service: 'internet_connectivity',
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Connectivity check failed',
      });
    }

    // Determinar estado general
    const hasUnhealthy = externalChecks.some(check => check.status === 'unhealthy');
    const hasDegraded = externalChecks.some(check => check.status === 'degraded');
    const hasConfigured = externalChecks.some(check => 
      check.details?.configured && check.status !== 'not_configured'
    );

    let overallStatus: 'healthy' | 'degraded' | 'unhealthy' | 'not_configured';
    if (!hasConfigured) {
      overallStatus = 'not_configured';
    } else if (hasUnhealthy) {
      overallStatus = 'unhealthy';
    } else if (hasDegraded) {
      overallStatus = 'degraded';
    } else {
      overallStatus = 'healthy';
    }

    const responseTime = Date.now() - startTime;

    const healthStatus = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      responseTime,
      details: {
        checks: externalChecks,
        environment: MONITORING_CONFIG.environment,
      },
    };

    return NextResponse.json(healthStatus, {
      status: overallStatus === 'healthy' ? 200 : 503,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Health-Check': 'external',
        'X-Response-Time': `${responseTime}ms`,
      },
    });

  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    const errorResponse = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      responseTime,
      error: error instanceof Error ? error.message : 'External services health check failed',
      details: {
        checks: [],
      },
    };

    return NextResponse.json(errorResponse, {
      status: 503,
      headers: {
        'Content-Type': 'application/json',
        'X-Health-Check': 'external',
        'X-Response-Time': `${responseTime}ms`,
      },
    });
  }
}
