# Guía de Configuración de Seguridad

## Descripción General

Esta guía proporciona instrucciones paso a paso para configurar el sistema de seguridad de InclusiveAI Coach, incluyendo autenticación, autorización, validación de entrada, protección CSRF, rate limiting, y cumplimiento de regulaciones de privacidad.

## Requisitos Previos

- Node.js 18+ instalado
- Base de datos PostgreSQL configurada
- Redis para rate limiting
- Variables de entorno configuradas
- Permisos de administrador

## Instalación

### 1. Instalar Dependencias

```bash
# Navegar al directorio del proyecto
cd inclusive-ai-coach

# Instalar dependencias
npm install

# Instalar dependencias específicas de seguridad
npm install bcryptjs jsonwebtoken helmet cors express-rate-limit
npm install @types/bcryptjs @types/jsonwebtoken
npm install express-validator joi
```

### 2. Configurar Variables de Entorno

Crear o actualizar el archivo `.env`:

```env
# Configuración de seguridad
SECURITY_ENABLED=true
SECURITY_SESSION_SECRET=your_session_secret_here
SECURITY_SESSION_TIMEOUT=3600

# Configuración de autenticación
AUTH_MAX_LOGIN_ATTEMPTS=5
AUTH_LOCKOUT_DURATION=900
AUTH_PASSWORD_MIN_LENGTH=8
AUTH_PASSWORD_REQUIRE_SPECIAL=true

# Configuración de CSRF
CSRF_ENABLED=true
CSRF_SECRET=your_csrf_secret_here
CSRF_TOKEN_EXPIRY=3600

# Configuración de rate limiting
RATE_LIMIT_ENABLED=true
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Configuración de privacidad
PRIVACY_GDPR_COMPLIANCE=true
PRIVACY_DATA_RETENTION_DAYS=730
PRIVACY_ALLOW_TRACKING=false

# Configuración de auditoría
AUDIT_ENABLED=true
AUDIT_LOG_LEVEL=info
AUDIT_RETENTION_DAYS=365
AUDIT_SENSITIVE_DATA_MASKING=true

# Configuración de JWT
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# Configuración de base de datos
DATABASE_URL="postgresql://username:password@localhost:5432/inclusive_ai"

# Configuración de Redis
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=your_redis_password
```

### 3. Configurar Base de Datos

Ejecutar las migraciones de Prisma:

```bash
# Generar cliente de Prisma
npx prisma generate

# Ejecutar migraciones
npx prisma migrate dev --name init-security

# Sembrar datos iniciales
npx prisma db seed
```

## Configuración de Componentes

### 1. Configurar SecurityProvider

```typescript
// app/providers.tsx
import { SecurityProvider } from '@/components/security/SecurityProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SecurityProvider 
      config={{
        sessionTimeout: 3600,
        maxLoginAttempts: 5,
        passwordPolicy: {
          minLength: 8,
          requireUppercase: true,
          requireLowercase: true,
          requireNumbers: true,
          requireSpecialChars: true
        },
        csrfProtection: true,
        rateLimiting: {
          enabled: true,
          windowMs: 900000,
          maxRequests: 100
        }
      }}
    >
      {children}
    </SecurityProvider>
  );
}
```

### 2. Configurar PrivacyControls

```typescript
// components/security/PrivacyControls.tsx
import { PrivacyControls } from '@/components/security/PrivacyControls';

export function PrivacySection() {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-semibold mb-4">Configuración de Privacidad</h2>
      <PrivacyControls 
        userId="current-user-id"
        onPrivacyUpdate={(settings) => {
          console.log('Privacy settings updated:', settings);
        }}
      />
    </div>
  );
}
```

### 3. Configurar InputValidation

```typescript
// components/security/InputValidation.tsx
import { InputValidation } from '@/components/security/InputValidation';

export function ValidationSection() {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-semibold mb-4">Validación de Entrada</h2>
      <InputValidation 
        schema={{
          fields: {
            email: {
              type: 'email',
              required: true,
              pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            },
            password: {
              type: 'string',
              required: true,
              minLength: 8,
              pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/
            }
          }
        }}
        onValidation={(result) => {
          console.log('Validation result:', result);
        }}
        strict={true}
      />
    </div>
  );
}
```

## Configuración de APIs

### 1. Configurar Rutas de API de Seguridad

```typescript
// app/api/security/auth/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { rateLimit } from '@/lib/security/rate-limiter';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await rateLimit(request);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429, headers: rateLimitResult.headers }
      );
    }

    const body = await request.json();
    const { email, password } = body;

    // Validar entrada
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password required' },
        { status: 400 }
      );
    }

    // Buscar usuario
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      // Registrar intento fallido
      await prisma.securityLoginAttempt.create({
        data: {
          userId: user.id,
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
          success: false,
          details: { reason: 'invalid_password' }
        }
      });

      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verificar si la cuenta está bloqueada
    const failedAttempts = await prisma.securityLoginAttempt.count({
      where: {
        userId: user.id,
        success: false,
        timestamp: {
          gte: new Date(Date.now() - parseInt(process.env.AUTH_LOCKOUT_DURATION!) * 1000)
        }
      }
    });

    if (failedAttempts >= parseInt(process.env.AUTH_MAX_LOGIN_ATTEMPTS!)) {
      return NextResponse.json(
        { error: 'Account temporarily locked' },
        { status: 423 }
      );
    }

    // Generar tokens
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    const refreshToken = jwt.sign(
      { userId: user.id, type: 'refresh' },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN }
    );

    // Registrar intento exitoso
    await prisma.securityLoginAttempt.create({
      data: {
        userId: user.id,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        success: true
      }
    });

    // Actualizar última sesión
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    // Crear sesión
    const session = await prisma.securitySession.create({
      data: {
        sessionId: crypto.randomUUID(),
        userId: user.id,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        expiresAt: new Date(Date.now() + parseInt(process.env.SECURITY_SESSION_TIMEOUT!) * 1000)
      }
    });

    return NextResponse.json({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### 2. Configurar Middleware de Seguridad

```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/security/jwt';
import { rateLimit } from '@/lib/security/rate-limiter';
import { validateCSRF } from '@/lib/security/csrf';

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Rate limiting
  const rateLimitResult = await rateLimit(request);
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: rateLimitResult.headers }
    );
  }

  // Headers de seguridad
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  // CORS
  const origin = request.headers.get('origin');
  if (origin && process.env.ALLOWED_ORIGINS?.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  }
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token');

  // Verificar autenticación para rutas protegidas
  if (request.nextUrl.pathname.startsWith('/api/protected')) {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    try {
      const decoded = await verifyToken(token);
      request.headers.set('x-user-id', decoded.userId);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }
  }

  // Verificar CSRF para rutas que lo requieren
  if (request.method === 'POST' && request.nextUrl.pathname.startsWith('/api/csrf-protected')) {
    const csrfToken = request.headers.get('x-csrf-token');
    const sessionToken = request.cookies.get('session-token')?.value;

    if (!csrfToken || !sessionToken) {
      return NextResponse.json(
        { error: 'CSRF token required' },
        { status: 403 }
      );
    }

    const isValidCSRF = await validateCSRF(csrfToken, sessionToken);
    if (!isValidCSRF) {
      return NextResponse.json(
        { error: 'Invalid CSRF token' },
        { status: 403 }
      );
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/api/:path*',
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
```

## Configuración de Base de Datos

### 1. Esquema de Base de Datos

```prisma
// prisma/schema.prisma

// Modelo de Sesiones de Seguridad
model SecuritySession {
  id        String   @id @default(cuid())
  sessionId String   @unique
  userId    String   NOT NULL
  ipAddress String?
  userAgent String?
  createdAt DateTime @default(now())
  expiresAt DateTime NOT NULL
  isActive  Boolean  @default(true)

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

// Modelo de Intentos de Login
model SecurityLoginAttempt {
  id        String   @id @default(cuid())
  userId    String?
  ipAddress String   NOT NULL
  userAgent String?
  success   Boolean  NOT NULL
  timestamp DateTime @default(now())
  details   Json?

  user User? @relation(fields: [userId], references: [id], onDelete: SetNull)
}

// Modelo de Eventos de Seguridad
model SecurityEvent {
  id        String   @id @default(cuid())
  eventType String   NOT NULL
  userId    String?
  ipAddress String?
  userAgent String?
  severity  String   @default("low")
  details   Json?
  timestamp DateTime @default(now())

  user User? @relation(fields: [userId], references: [id], onDelete: SetNull)
}

// Modelo de Configuración de Privacidad
model SecurityPrivacySettings {
  id              String   @id @default(cuid())
  userId          String   @unique
  allowCookies    Boolean  @default(true)
  allowTracking   Boolean  @default(false)
  allowAnalytics  Boolean  @default(true)
  allowMarketing  Boolean  @default(false)
  dataSharing     Json?
  dataRetention   Json?
  updatedAt       DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

// Modelo de Tokens CSRF
model SecurityCSRFToken {
  id        String    @id @default(cuid())
  token     String    @unique
  userId    String?
  createdAt DateTime  @default(now())
  expiresAt DateTime  NOT NULL
  usedAt    DateTime?
  isValid   Boolean   @default(true)

  user User? @relation(fields: [userId], references: [id], onDelete: SetNull)
}

// Extender modelo User existente
model User {
  // ... campos existentes ...

  // Relaciones de seguridad
  sessions           SecuritySession[]
  loginAttempts      SecurityLoginAttempt[]
  securityEvents     SecurityEvent[]
  privacySettings    SecurityPrivacySettings?
  csrfTokens         SecurityCSRFToken[]
}
```

### 2. Datos Iniciales

```typescript
// prisma/seed-security.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Crear usuario administrador
  const adminPassword = await bcrypt.hash('Admin123!', 12);
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@inclusiveai.com' },
    update: {},
    create: {
      email: 'admin@inclusiveai.com',
      name: 'Administrador',
      password: adminPassword,
      role: 'admin',
      isActive: true
    }
  });

  // Crear configuración de privacidad por defecto
  await prisma.securityPrivacySettings.upsert({
    where: { userId: adminUser.id },
    update: {},
    create: {
      userId: adminUser.id,
      allowCookies: true,
      allowTracking: false,
      allowAnalytics: true,
      allowMarketing: false,
      dataSharing: {
        thirdParty: false,
        research: false,
        improvement: true
      },
      dataRetention: {
        account: 730, // 2 años
        activity: 365, // 1 año
        analytics: 90 // 3 meses
      }
    }
  });

  console.log('Datos iniciales de seguridad creados');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

## Configuración de Hooks

### 1. Configurar useSecurity

```typescript
// lib/hooks/useSecurity.ts
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface SecurityState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any | null;
  permissions: string[];
}

export function useSecurity() {
  const [state, setState] = useState<SecurityState>({
    isAuthenticated: false,
    isLoading: true,
    user: null,
    permissions: []
  });
  const router = useRouter();

  const checkAuth = useCallback(async () => {
    try {
      const token = localStorage.getItem('access-token');
      
      if (!token) {
        setState(prev => ({ ...prev, isAuthenticated: false, isLoading: false }));
        return;
      }

      const response = await fetch('/api/security/auth/verify', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setState({
          isAuthenticated: true,
          isLoading: false,
          user: data.user,
          permissions: data.permissions
        });
      } else {
        // Token inválido, limpiar estado
        localStorage.removeItem('access-token');
        localStorage.removeItem('refresh-token');
        setState({
          isAuthenticated: false,
          isLoading: false,
          user: null,
          permissions: []
        });
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await fetch('/api/security/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('access-token', data.accessToken);
        localStorage.setItem('refresh-token', data.refreshToken);
        
        setState({
          isAuthenticated: true,
          isLoading: false,
          user: data.user,
          permissions: data.permissions || []
        });

        return { success: true };
      } else {
        const error = await response.json();
        return { success: false, error: error.error };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Network error' };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      // Llamar API de logout
      await fetch('/api/security/auth/logout', {
        method: 'POST'
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Limpiar estado local
      localStorage.removeItem('access-token');
      localStorage.removeItem('refresh-token');
      setState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        permissions: []
      });
      router.push('/login');
    }
  }, [router]);

  const refreshToken = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem('refresh-token');
      
      if (!refreshToken) {
        throw new Error('No refresh token');
      }

      const response = await fetch('/api/security/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refreshToken })
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('access-token', data.accessToken);
        return { success: true };
      } else {
        throw new Error('Token refresh failed');
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      await logout();
      return { success: false };
    }
  }, [logout]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return {
    ...state,
    login,
    logout,
    refreshToken,
    checkAuth
  };
}
```

### 2. Configurar usePrivacyControls

```typescript
// lib/hooks/usePrivacyControls.ts
import { useState, useEffect, useCallback } from 'react';

interface PrivacySettings {
  allowCookies: boolean;
  allowTracking: boolean;
  allowAnalytics: boolean;
  allowMarketing: boolean;
  dataSharing: {
    thirdParty: boolean;
    research: boolean;
    improvement: boolean;
  };
  dataRetention: {
    account: number;
    activity: number;
    analytics: number;
  };
}

export function usePrivacyControls(userId: string) {
  const [settings, setSettings] = useState<PrivacySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/security/privacy?userId=${userId}`);
      
      if (!response.ok) {
        throw new Error('Failed to load privacy settings');
      }

      const data = await response.json();
      setSettings(data.settings);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const updateSettings = useCallback(async (newSettings: Partial<PrivacySettings>) => {
    try {
      const response = await fetch('/api/security/privacy', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          settings: newSettings
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update privacy settings');
      }

      // Recargar configuración
      await loadSettings();
      return { success: true };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
      return { success: false, error: err instanceof Error ? err.message : 'Update failed' };
    }
  }, [userId, loadSettings]);

  const exportData = useCallback(async () => {
    try {
      const response = await fetch('/api/security/privacy/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId })
      });

      if (!response.ok) {
        throw new Error('Failed to export data');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `user-data-${userId}.json`;
      a.click();
      window.URL.revokeObjectURL(url);

      return { success: true };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
      return { success: false, error: err instanceof Error ? err.message : 'Export failed' };
    }
  }, [userId]);

  const deleteData = useCallback(async () => {
    try {
      const response = await fetch('/api/security/privacy/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId })
      });

      if (!response.ok) {
        throw new Error('Failed to delete data');
      }

      return { success: true };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
      return { success: false, error: err instanceof Error ? err.message : 'Delete failed' };
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      loadSettings();
    }
  }, [userId, loadSettings]);

  return {
    settings,
    loading,
    error,
    updateSettings,
    exportData,
    deleteData,
    refresh: loadSettings
  };
}
```

## Configuración de Servicios de Seguridad

### 1. Configurar Rate Limiter

```typescript
// lib/security/rate-limiter.ts
import { NextRequest } from 'next/server';
import { redis } from '@/lib/redis';

interface RateLimitResult {
  success: boolean;
  headers: Record<string, string>;
}

export async function rateLimit(request: NextRequest): Promise<RateLimitResult> {
  if (!process.env.RATE_LIMIT_ENABLED || process.env.RATE_LIMIT_ENABLED !== 'true') {
    return { success: true, headers: {} };
  }

  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             'unknown';
  
  const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000');
  const maxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100');
  
  const key = `rate_limit:${ip}`;
  const now = Date.now();
  const windowStart = now - windowMs;

  try {
    // Obtener requests en la ventana de tiempo
    const requests = await redis.zrangebyscore(key, windowStart, '+inf');
    
    if (requests.length >= maxRequests) {
      return {
        success: false,
        headers: {
          'X-RateLimit-Limit': maxRequests.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': new Date(now + windowMs).toISOString(),
          'Retry-After': Math.ceil(windowMs / 1000).toString()
        }
      };
    }

    // Agregar request actual
    await redis.zadd(key, now, now.toString());
    await redis.expire(key, Math.ceil(windowMs / 1000));

    const remaining = maxRequests - requests.length - 1;

    return {
      success: true,
      headers: {
        'X-RateLimit-Limit': maxRequests.toString(),
        'X-RateLimit-Remaining': remaining.toString(),
        'X-RateLimit-Reset': new Date(now + windowMs).toISOString()
      }
    };
  } catch (error) {
    console.error('Rate limiting error:', error);
    // En caso de error, permitir el request
    return { success: true, headers: {} };
  }
}
```

### 2. Configurar JWT Service

```typescript
// lib/security/jwt.ts
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

interface JWTPayload {
  userId: string;
  email: string;
  type?: string;
}

export async function generateToken(payload: JWTPayload, type: 'access' | 'refresh' = 'access'): Promise<string> {
  const secret = process.env.JWT_SECRET!;
  const expiresIn = type === 'access' 
    ? process.env.JWT_EXPIRES_IN || '1h'
    : process.env.JWT_REFRESH_EXPIRES_IN || '7d';

  return jwt.sign(payload, secret, { expiresIn });
}

export async function verifyToken(token: string): Promise<JWTPayload> {
  const secret = process.env.JWT_SECRET!;
  
  try {
    const decoded = jwt.verify(token, secret) as JWTPayload;
    
    // Verificar que el usuario existe y está activo
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId, isActive: true }
    });

    if (!user) {
      throw new Error('User not found or inactive');
    }

    return decoded;
  } catch (error) {
    throw new Error('Invalid token');
  }
}

export async function refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
  try {
    const decoded = await verifyToken(refreshToken);
    
    if (decoded.type !== 'refresh') {
      throw new Error('Invalid token type');
    }

    // Generar nuevos tokens
    const newAccessToken = await generateToken({
      userId: decoded.userId,
      email: decoded.email
    }, 'access');

    const newRefreshToken = await generateToken({
      userId: decoded.userId,
      email: decoded.email,
      type: 'refresh'
    }, 'refresh');

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    };
  } catch (error) {
    throw new Error('Token refresh failed');
  }
}
```

### 3. Configurar CSRF Protection

```typescript
// lib/security/csrf.ts
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function generateCSRFToken(userId?: string): Promise<string> {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + parseInt(process.env.CSRF_TOKEN_EXPIRY || '3600') * 1000);

  await prisma.securityCSRFToken.create({
    data: {
      token,
      userId,
      expiresAt
    }
  });

  return token;
}

export async function validateCSRF(token: string, sessionToken?: string): Promise<boolean> {
  try {
    const csrfToken = await prisma.securityCSRFToken.findUnique({
      where: { token }
    });

    if (!csrfToken) {
      return false;
    }

    // Verificar expiración
    if (csrfToken.expiresAt < new Date()) {
      await prisma.securityCSRFToken.update({
        where: { id: csrfToken.id },
        data: { isValid: false }
      });
      return false;
    }

    // Verificar si ya fue usado
    if (csrfToken.usedAt) {
      return false;
    }

    // Marcar como usado
    await prisma.securityCSRFToken.update({
      where: { id: csrfToken.id },
      data: { usedAt: new Date() }
    });

    return true;
  } catch (error) {
    console.error('CSRF validation error:', error);
    return false;
  }
}

export async function cleanupExpiredCSRFTokens(): Promise<void> {
  try {
    await prisma.securityCSRFToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date()
        }
      }
    });
  } catch (error) {
    console.error('CSRF cleanup error:', error);
  }
}
```

## Configuración de Auditoría

### 1. Configurar Audit Logger

```typescript
// lib/security/audit.ts
import { prisma } from '@/lib/prisma';

interface AuditEvent {
  type: string;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  details?: any;
}

export class AuditLogger {
  static async log(event: AuditEvent): Promise<void> {
    try {
      await prisma.securityEvent.create({
        data: {
          eventType: event.type,
          userId: event.userId,
          ipAddress: event.ipAddress,
          userAgent: event.userAgent,
          severity: event.severity,
          details: event.details
        }
      });

      // Log adicional para eventos críticos
      if (event.severity === 'critical') {
        console.error('CRITICAL SECURITY EVENT:', event);
      }
    } catch (error) {
      console.error('Audit logging error:', error);
    }
  }

  static async getEvents(filters?: {
    userId?: string;
    type?: string;
    severity?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<any[]> {
    const whereClause: any = {};

    if (filters?.userId) {
      whereClause.userId = filters.userId;
    }

    if (filters?.type) {
      whereClause.eventType = filters.type;
    }

    if (filters?.severity) {
      whereClause.severity = filters.severity;
    }

    if (filters?.startDate || filters?.endDate) {
      whereClause.timestamp = {};
      if (filters.startDate) {
        whereClause.timestamp.gte = filters.startDate;
      }
      if (filters.endDate) {
        whereClause.timestamp.lte = filters.endDate;
      }
    }

    return await prisma.securityEvent.findMany({
      where: whereClause,
      orderBy: { timestamp: 'desc' },
      include: { user: { select: { id: true, email: true, name: true } } }
    });
  }

  static async detectAnomalies(): Promise<any[]> {
    // Implementar detección de anomalías
    // Por ejemplo, múltiples intentos de login fallidos, actividad inusual, etc.
    
    const anomalies = [];

    // Detectar múltiples intentos de login fallidos
    const failedLogins = await prisma.securityLoginAttempt.groupBy({
      by: ['ipAddress'],
      where: {
        success: false,
        timestamp: {
          gte: new Date(Date.now() - 60 * 60 * 1000) // Última hora
        }
      },
      _count: {
        id: true
      },
      having: {
        id: {
          _count: {
            gt: 10 // Más de 10 intentos fallidos
          }
        }
      }
    });

    for (const login of failedLogins) {
      anomalies.push({
        type: 'multiple_failed_logins',
        ipAddress: login.ipAddress,
        count: login._count.id,
        severity: 'high'
      });
    }

    return anomalies;
  }
}
```

## Testing

### 1. Tests de Configuración

```typescript
// tests/security-setup.test.ts
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

describe('Security Setup', () => {
  beforeAll(async () => {
    // Configurar base de datos de prueba
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should create security tables', async () => {
    const sessions = await prisma.securitySession.findMany();
    expect(sessions).toBeDefined();
  });

  it('should hash passwords correctly', async () => {
    const password = 'TestPassword123!';
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const isValid = await bcrypt.compare(password, hashedPassword);
    expect(isValid).toBe(true);
  });

  it('should generate and verify JWT tokens', async () => {
    const payload = { userId: 'test-user', email: 'test@example.com' };
    const token = jwt.sign(payload, process.env.JWT_SECRET!);
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    expect(decoded.userId).toBe(payload.userId);
  });
});
```

## Troubleshooting

### Problemas Comunes

1. **Rate limiting muy restrictivo**
   - Ajustar configuración de límites
   - Verificar configuración de Redis
   - Revisar logs de rate limiting

2. **Tokens JWT expiran prematuramente**
   - Verificar configuración de expiración
   - Comprobar sincronización de reloj
   - Revisar configuración de refresh tokens

3. **CSRF tokens inválidos**
   - Verificar generación de tokens
   - Comprobar validación de tokens
   - Revisar configuración de secretos

### Logs de Debug

```typescript
// Habilitar logs de debug
const DEBUG_SECURITY = process.env.NODE_ENV === 'development';

if (DEBUG_SECURITY) {
  console.log('Security setup completed');
  console.log('Rate limiting enabled:', process.env.RATE_LIMIT_ENABLED);
  console.log('CSRF protection enabled:', process.env.CSRF_ENABLED);
}
```

## Recursos Adicionales

- [Documentación de Componentes de Seguridad](../components/security.md)
- [API de Seguridad](../AI-APIS.md#security)
- [Base de Datos](../DATABASE.md)
- [Testing](../TESTING.md)
