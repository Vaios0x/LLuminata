import { NextRequest, NextResponse } from 'next/server';
import { generateSecurityAudit } from '@/lib/security';

export async function GET(request: NextRequest) {
  try {
    // Obtener IP del cliente para auditoría
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown';
    
    // Generar auditoría de seguridad
    const audit = generateSecurityAudit('vapid_key_request', 'vapid_key_retrieved', {
      ipAddress: clientIP,
      userAgent: request.headers.get('user-agent'),
      timestamp: new Date().toISOString()
    });

    // Obtener VAPID public key desde variables de entorno
    const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
    
    if (!vapidPublicKey) {
      console.error('VAPID_PUBLIC_KEY no configurada');
      return NextResponse.json(
        { error: 'VAPID public key no configurada' },
        { status: 500 }
      );
    }

    // Log de auditoría
    console.log('[SECURITY AUDIT]', audit);

    return NextResponse.json({
      success: true,
      publicKey: vapidPublicKey,
      auditId: audit.id
    });

  } catch (error) {
    console.error('Error obteniendo VAPID key:', error);
    
    // Log de error de seguridad
    console.error('[SECURITY ERROR]', {
      error: error instanceof Error ? error.message : 'Error desconocido',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
      endpoint: '/api/notifications/push/vapid-key',
    });
    
    return NextResponse.json(
      { error: 'Error obteniendo VAPID key' },
      { status: 500 }
    );
  }
}
