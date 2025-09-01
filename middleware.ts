import { NextRequest, NextResponse } from 'next/server';

// Configuración de rate limiting
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minuto
const RATE_LIMIT_MAX_REQUESTS = 100; // 100 requests por minuto
const RATE_LIMIT_MAX_REQUESTS_AUTH = 20; // 20 requests por minuto para endpoints autenticados

// Store para rate limiting (en producción usar Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Headers de seguridad
const SECURITY_HEADERS = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://unpkg.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "media-src 'self' https: blob:",
    "connect-src 'self' https: wss:",
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests"
  ].join('; '),
};

// Patrones de validación
const VALIDATION_PATTERNS = {
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  alphanumeric: /^[a-zA-Z0-9]+$/,
  numeric: /^[0-9]+$/,
  url: /^https?:\/\/[^\s/$.?#].[^\s]*$/i,
};

// Función para obtener IP del cliente
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  if (realIP) {
    return realIP;
  }
  if (cfConnectingIP) {
    return cfConnectingIP;
  }
  
  return 'unknown';
}

// Función para rate limiting
function checkRateLimit(identifier: string, maxRequests: number = RATE_LIMIT_MAX_REQUESTS): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);
  
  if (!record || now > record.resetTime) {
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW
    });
    return true;
  }
  
  if (record.count >= maxRequests) {
    return false;
  }
  
  record.count++;
  return true;
}

// Función para sanitizar datos
function sanitizeInput(input: any): any {
  if (typeof input === 'string') {
    return input
      .replace(/[<>]/g, '') // Remover < y >
      .replace(/javascript:/gi, '') // Remover javascript:
      .replace(/on\w+=/gi, '') // Remover event handlers
      .trim();
  }
  
  if (typeof input === 'object' && input !== null) {
    const sanitized: any = Array.isArray(input) ? [] : {};
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeInput(value);
    }
    return sanitized;
  }
  
  return input;
}

// Función para validar datos de entrada
function validateInput(data: any, schema: Record<string, any>): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  for (const [field, rules] of Object.entries(schema)) {
    const value = data[field];
    
    // Verificar si es requerido
    if (rules.required && (value === undefined || value === null || value === '')) {
      errors.push(`${field} es requerido`);
      continue;
    }
    
    if (value !== undefined && value !== null) {
      // Verificar tipo
      if (rules.type && typeof value !== rules.type) {
        errors.push(`${field} debe ser de tipo ${rules.type}`);
      }
      
      // Verificar patrón
      if (rules.pattern && VALIDATION_PATTERNS[rules.pattern as keyof typeof VALIDATION_PATTERNS]) {
        const pattern = VALIDATION_PATTERNS[rules.pattern as keyof typeof VALIDATION_PATTERNS];
        if (!pattern.test(String(value))) {
          errors.push(`${field} no cumple con el formato requerido`);
        }
      }
      
      // Verificar longitud
      if (rules.minLength && String(value).length < rules.minLength) {
        errors.push(`${field} debe tener al menos ${rules.minLength} caracteres`);
      }
      
      if (rules.maxLength && String(value).length > rules.maxLength) {
        errors.push(`${field} debe tener máximo ${rules.maxLength} caracteres`);
      }
      
      // Verificar valores permitidos
      if (rules.enum && !rules.enum.includes(value)) {
        errors.push(`${field} debe ser uno de: ${rules.enum.join(', ')}`);
      }
    }
  }
  
  return { isValid: errors.length === 0, errors };
}

// Función para verificar HTTPS
function enforceHTTPS(request: NextRequest): boolean {
  const protocol = request.headers.get('x-forwarded-proto') || 'http';
  const host = request.headers.get('host') || '';
  
  // Permitir localhost en desarrollo
  if (process.env.NODE_ENV === 'development' && host.includes('localhost')) {
    return true;
  }
  
  return protocol === 'https';
}

// Función para verificar autenticación
function isAuthenticated(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const sessionToken = request.cookies.get('session-token')?.value;
  
  return !!(authHeader?.startsWith('Bearer ') || sessionToken);
}

// Middleware principal
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const clientIP = getClientIP(request);
  const userAgent = request.headers.get('user-agent') || '';
  
  // Log de seguridad
  console.log(`[SECURITY] ${new Date().toISOString()} - ${request.method} ${pathname} - IP: ${clientIP} - UA: ${userAgent.substring(0, 100)}`);
  
  // 1. Enforce HTTPS
  if (!enforceHTTPS(request)) {
    const httpsUrl = new URL(request.url);
    httpsUrl.protocol = 'https:';
    return NextResponse.redirect(httpsUrl, 301);
  }
  
  // 2. Rate limiting
  const isAuth = isAuthenticated(request);
  const maxRequests = isAuth ? RATE_LIMIT_MAX_REQUESTS_AUTH : RATE_LIMIT_MAX_REQUESTS;
  
  if (!checkRateLimit(clientIP, maxRequests)) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Please try again later.' },
      { 
        status: 429,
        headers: {
          'Retry-After': '60',
          'X-RateLimit-Limit': maxRequests.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': (Date.now() + RATE_LIMIT_WINDOW).toString()
        }
      }
    );
  }
  
  // 3. Validación de entrada para APIs
  if (pathname.startsWith('/api/') && request.method === 'POST') {
    try {
      const body = await request.json();
      const sanitizedBody = sanitizeInput(body);
      
      // Validación específica por endpoint
      let validationSchema: Record<string, any> = {};
      
      if (pathname.startsWith('/api/ai/needs-detection')) {
        validationSchema = {
          studentId: { required: true, type: 'string', pattern: 'uuid' },
          interactionData: { required: true, type: 'object' }
        };
      } else if (pathname.startsWith('/api/auth/')) {
        validationSchema = {
          email: { required: true, type: 'string', pattern: 'email' },
          password: { required: true, type: 'string', minLength: 8 }
        };
      }
      
      if (Object.keys(validationSchema).length > 0) {
        const validation = validateInput(sanitizedBody, validationSchema);
        if (!validation.isValid) {
          return NextResponse.json(
            { error: 'Datos de entrada inválidos', details: validation.errors },
            { status: 400 }
          );
        }
      }
      
      // Crear nueva request con datos sanitizados
      const newRequest = NextResponse.next();
      newRequest.headers.set('x-sanitized-body', JSON.stringify(sanitizedBody));
      
    } catch (error) {
      return NextResponse.json(
        { error: 'Cuerpo de la petición inválido' },
        { status: 400 }
      );
    }
  }
  
  // 4. Headers de seguridad
  const response = NextResponse.next();
  
  // Aplicar headers de seguridad
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  // Headers específicos para APIs
  if (pathname.startsWith('/api/')) {
    response.headers.set('Cache-Control', 'no-store, max-age=0');
    response.headers.set('X-API-Version', '1.0');
  }
  
  // 5. Protección contra ataques comunes
  const suspiciousPatterns = [
    /\.\.\//, // Directory traversal
    /<script/i, // XSS básico
    /javascript:/i, // JavaScript injection
    /on\w+\s*=/i, // Event handlers
    /union\s+select/i, // SQL injection básico
    /exec\s*\(/i, // Command injection
  ];
  
  const url = request.url.toLowerCase();
  const hasSuspiciousPattern = suspiciousPatterns.some(pattern => pattern.test(url));
  
  if (hasSuspiciousPattern) {
    console.warn(`[SECURITY WARNING] Suspicious pattern detected in URL: ${url}`);
    return NextResponse.json(
      { error: 'Request blocked for security reasons' },
      { status: 403 }
    );
  }
  
  // 6. Validación de User-Agent
  if (!userAgent || userAgent.length < 10) {
    console.warn(`[SECURITY WARNING] Suspicious User-Agent: ${userAgent}`);
  }
  
  // 7. Log de respuesta
  response.headers.set('X-Request-ID', crypto.randomUUID());
  response.headers.set('X-Processed-By', 'security-middleware');
  
  return response;
}

// Configuración del middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
