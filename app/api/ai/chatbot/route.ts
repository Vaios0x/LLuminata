import { NextRequest, NextResponse } from 'next/server';
import { getChatbotService } from '@/lib/ai-services/chatbot-service';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { message, context } = await request.json();
    
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Mensaje requerido' },
        { status: 400 }
      );
    }

    const chatbotService = getChatbotService();
    
    // Obtener sesión del usuario autenticado usando headers
    const authHeader = request.headers.get('authorization');
    let session = null;
    
    if (authHeader) {
      try {
        // En un entorno real, aquí verificarías el token JWT
        // Por ahora, usamos una implementación simplificada
        session = { user: { id: 'user-id', name: 'Usuario', language: 'es-MX', culturalBackground: 'general' } };
      } catch (error) {
        console.error('Error verificando sesión:', error);
      }
    }
    
    if (session?.user?.id) {
      // Cargar contexto del usuario autenticado
      await chatbotService.loadUserContext(session.user.id);
      
      // Actualizar contexto con información del usuario
      const userContext = {
        currentPage: request.headers.get('referer') || '/',
        userPreferences: {
          language: session.user.language || 'es-MX',
          learningStyle: 'mixed',
          accessibility: [],
          culturalBackground: session.user.culturalBackground || 'general',
          name: session.user.name || 'Estudiante',
        }
      };
      
      await chatbotService.updateContext(userContext);
    }
    
    // Actualizar contexto adicional si se proporciona
    if (context) {
      await chatbotService.updateContext(context);
    }

    // Procesar mensaje
    const response = await chatbotService.processMessage(message);

    return NextResponse.json({
      success: true,
      data: response
    });

  } catch (error) {
    console.error('Error en chatbot API:', error);
    
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const chatbotService = getChatbotService();
    
    // Obtener sugerencias contextuales
    const suggestions = await chatbotService.getContextualSuggestions();
    
    // Obtener contexto actual
    const context = chatbotService.getContext();

    return NextResponse.json({
      success: true,
      data: {
        suggestions,
        context: {
          sessionId: context.sessionId,
          currentPage: context.currentPage,
          userPreferences: context.userPreferences
        }
      }
    });

  } catch (error) {
    console.error('Error obteniendo sugerencias:', error);
    
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { context } = await request.json();
    
    if (!context) {
      return NextResponse.json(
        { error: 'Contexto requerido' },
        { status: 400 }
      );
    }

    const chatbotService = getChatbotService();
    await chatbotService.updateContext(context);

    return NextResponse.json({
      success: true,
      message: 'Contexto actualizado correctamente'
    });

  } catch (error) {
    console.error('Error actualizando contexto:', error);
    
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const chatbotService = getChatbotService();
    chatbotService.clearHistory();

    return NextResponse.json({
      success: true,
      message: 'Historial limpiado correctamente'
    });

  } catch (error) {
    console.error('Error limpiando historial:', error);
    
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}
