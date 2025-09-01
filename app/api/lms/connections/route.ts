import { NextRequest, NextResponse } from 'next/server';
import { lmsIntegrationManager, type LMSConnection, type LMSConfig } from '@/lib/lms-integration';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * GET /api/lms/connections
 * Obtiene todas las conexiones LMS configuradas
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const connections = await lmsIntegrationManager.getConnections();
    
    return NextResponse.json({
      success: true,
      connections,
      total: connections.length
    });
  } catch (error) {
    console.error('Error obteniendo conexiones LMS:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/lms/connections
 * Registra una nueva conexión LMS
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { institutionId, name, type, config } = body;

    // Validar datos requeridos
    if (!institutionId || !name || !type || !config) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos' },
        { status: 400 }
      );
    }

    // Validar tipo de LMS soportado
    const supportedTypes = ['moodle', 'canvas', 'blackboard', 'schoology', 'google-classroom'];
    if (!supportedTypes.includes(type)) {
      return NextResponse.json(
        { error: `Tipo de LMS no soportado. Tipos válidos: ${supportedTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Validar configuración según el tipo
    const validationError = validateLMSConfig(type, config);
    if (validationError) {
      return NextResponse.json(
        { error: validationError },
        { status: 400 }
      );
    }

    const connection: LMSConnection = {
      id: `lms_${Date.now()}`,
      institutionId,
      config: {
        type,
        baseUrl: config.baseUrl,
        apiKey: config.apiKey,
        clientId: config.clientId,
        clientSecret: config.clientSecret,
        username: config.username,
        password: config.password,
        token: config.token,
        timeout: config.timeout || 30000,
        retryAttempts: config.retryAttempts || 3
      },
      status: 'inactive',
      lastSync: new Date(),
      syncStatus: 'idle'
    };

    const success = await lmsIntegrationManager.registerConnection(connection);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Error al registrar la conexión LMS' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      connection,
      message: 'Conexión LMS registrada exitosamente'
    });
  } catch (error) {
    console.error('Error registrando conexión LMS:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * Valida la configuración según el tipo de LMS
 */
function validateLMSConfig(type: string, config: any): string | null {
  switch (type) {
    case 'moodle':
      if (!config.baseUrl || !config.username || !config.password) {
        return 'Moodle requiere baseUrl, username y password';
      }
      break;
    
    case 'canvas':
      if (!config.baseUrl || !config.token) {
        return 'Canvas requiere baseUrl y token';
      }
      break;
    
    case 'blackboard':
      if (!config.baseUrl || !config.clientId || !config.clientSecret) {
        return 'Blackboard requiere baseUrl, clientId y clientSecret';
      }
      break;
    
    case 'schoology':
      if (!config.baseUrl || !config.apiKey || !config.apiSecret) {
        return 'Schoology requiere baseUrl, apiKey y apiSecret';
      }
      break;
    
    case 'google-classroom':
      if (!config.clientId || !config.clientSecret) {
        return 'Google Classroom requiere clientId y clientSecret';
      }
      break;
  }
  
  return null;
}
