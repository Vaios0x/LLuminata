import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: string;
  language: string;
  culturalBackground?: string;
  accessibilityPreferences?: string[];
  specialNeeds?: string[];
}

export async function authenticateRequest(request: NextRequest): Promise<{
  user: AuthenticatedUser | null;
  isAuthenticated: boolean;
  error?: string;
}> {
  try {
    // Obtener token de autorización
    const authHeader = request.headers.get('authorization');
    const sessionToken = request.headers.get('x-session-token');
    
    if (!authHeader && !sessionToken) {
      return {
        user: null,
        isAuthenticated: false,
        error: 'No se proporcionó token de autenticación'
      };
    }

    // En un entorno real, aquí verificarías el token JWT o la sesión
    // Por ahora, usamos una implementación simplificada para desarrollo
    
    let userId: string | null = null;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      // Aquí verificarías el token JWT
      userId = 'user-id-from-token';
    } else if (sessionToken) {
      // Verificar sesión en la base de datos
      const session = await prisma.session.findUnique({
        where: { sessionToken },
        include: { user: true }
      });
      
      if (session && session.expires > new Date()) {
        userId = session.userId;
      }
    }

    if (!userId) {
      return {
        user: null,
        isAuthenticated: false,
        error: 'Token inválido o expirado'
      };
    }

    // Obtener información del usuario
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return {
        user: null,
        isAuthenticated: false,
        error: 'Usuario no encontrado'
      };
    }

    // Parsear necesidades especiales si existen
    let specialNeeds: string[] = [];
    if (user.specialNeeds) {
      try {
        const parsed = JSON.parse(user.specialNeeds);
        if (Array.isArray(parsed)) {
          specialNeeds = parsed;
        }
      } catch (error) {
        console.error('Error parsing special needs:', error);
      }
    }

    // Parsear preferencias de accesibilidad
    let accessibilityPreferences: string[] = [];
    if (user.accessibilityPreferences) {
      try {
        const parsed = user.accessibilityPreferences as any;
        if (Array.isArray(parsed)) {
          accessibilityPreferences = parsed;
        }
      } catch (error) {
        console.error('Error parsing accessibility preferences:', error);
      }
    }

    const authenticatedUser: AuthenticatedUser = {
      id: user.id,
      email: user.email || '',
      name: user.name || '',
      role: user.role,
      language: user.language,
      culturalBackground: user.culturalBackground || undefined,
      accessibilityPreferences,
      specialNeeds,
    };

    return {
      user: authenticatedUser,
      isAuthenticated: true
    };

  } catch (error) {
    console.error('Error en autenticación:', error);
    return {
      user: null,
      isAuthenticated: false,
      error: 'Error interno de autenticación'
    };
  }
}

export function requireAuth(handler: (request: NextRequest, user: AuthenticatedUser) => Promise<NextResponse>) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const auth = await authenticateRequest(request);
    
    if (!auth.isAuthenticated || !auth.user) {
      return NextResponse.json(
        { error: auth.error || 'Autenticación requerida' },
        { status: 401 }
      );
    }

    return handler(request, auth.user);
  };
}

export function optionalAuth(handler: (request: NextRequest, user: AuthenticatedUser | null) => Promise<NextResponse>) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const auth = await authenticateRequest(request);
    return handler(request, auth.user);
  };
}
