# Seguridad Crítica - InclusiveAI Coach

## Resumen Ejecutivo

Este documento describe las medidas de seguridad crítica implementadas en el proyecto InclusiveAI Coach, incluyendo rate limiting, validación de entrada, sanitización de datos y HTTPS enforcement.

## 1. Rate Limiting en APIs

### Configuración
- **Ventana de tiempo**: 1 minuto
- **Límite general**: 100 requests por minuto por IP
- **Límite autenticado**: 20 requests por minuto por IP
- **Almacenamiento**: Map en memoria (en producción usar Redis)

### Implementación
```typescript
// middleware.ts
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minuto
const RATE_LIMIT_MAX_REQUESTS = 100; // 100 requests por minuto
const RATE_LIMIT_MAX_REQUESTS_AUTH = 20; // 20 requests por minuto para endpoints autenticados
```

### Headers de Respuesta
- `X-RateLimit-Limit`: Límite máximo de requests
- `X-RateLimit-Remaining`: Requests restantes
- `X-RateLimit-Reset`: Tiempo de reset
- `Retry-After`: Tiempo de espera recomendado

### Endpoints Protegidos
- `/api/ai/*` - Endpoints de IA
- `/api/auth/*` - Endpoints de autenticación
- `/api/student/*` - Endpoints de estudiantes
- `/api/teacher/*` - Endpoints de maestros

## 2. Validación de Entrada

### Esquemas de Validación (Zod)
```typescript
// lib/security.ts
export const validationSchemas = {
  auth: {
    login: z.object({
      email: z.string().email('Email inválido'),
      password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
    }),
    register: z.object({
      email: z.string().email('Email inválido'),
      password: z.string()
        .min(12, 'La contraseña debe tener al menos 12 caracteres')
        .regex(/[A-Z]/, 'La contraseña debe contener al menos una mayúscula')
        .regex(/[a-z]/, 'La contraseña debe contener al menos una minúscula')
        .regex(/[0-9]/, 'La contraseña debe contener al menos un número')
        .regex(/[^A-Za-z0-9]/, 'La contraseña debe contener al menos un carácter especial'),
    }),
  },
  student: {
    interactionData: z.object({
      readingSpeed: z.number().min(0).max(1000),
      readingAccuracy: z.number().min(0).max(100),
      // ... más campos
    }),
  },
};
```

### Validación de Contraseñas
- **Longitud mínima**: 12 caracteres
- **Complejidad requerida**:
  - Al menos una mayúscula
  - Al menos una minúscula
  - Al menos un número
  - Al menos un carácter especial
- **Detección de patrones comunes**: password, 123456, qwerty, etc.
- **Prevención de repetición**: No más de 2 caracteres consecutivos iguales

### Validación de Emails
```typescript
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
```

### Validación de UUIDs
```typescript
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
```

## 3. Sanitización de Datos

### Sanitización de Entrada de Usuario
```typescript
export function sanitizeUserInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remover < y >
    .replace(/javascript:/gi, '') // Remover javascript:
    .replace(/on\w+=/gi, '') // Remover event handlers
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}
```

### Sanitización de HTML
```typescript
export function sanitizeHTML(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/vbscript:/gi, '')
    .replace(/data:/gi, '');
}
```

### Prevención de Inyección
```typescript
export function validateAgainstInjection(input: string): boolean {
  const injectionPatterns = [
    /(\b(union|select|insert|update|delete|drop|create|alter)\b)/i,
    /(\b(exec|execute|sp_|xp_)\b)/i,
    /(\b(script|javascript|vbscript|expression)\b)/i,
    /(\b(onload|onerror|onclick|onmouseover)\b)/i,
    /(\b(alert|confirm|prompt)\b)/i,
    /(\b(document|window|location)\b)/i,
    /(\b(eval|setTimeout|setInterval)\b)/i,
  ];
  
  return !injectionPatterns.some(pattern => pattern.test(input));
}
```

## 4. HTTPS Enforcement

### Middleware de HTTPS
```typescript
function enforceHTTPS(request: NextRequest): boolean {
  const protocol = request.headers.get('x-forwarded-proto') || 'http';
  const host = request.headers.get('host') || '';
  
  // Permitir localhost en desarrollo
  if (process.env.NODE_ENV === 'development' && host.includes('localhost')) {
    return true;
  }
  
  return protocol === 'https';
}
```

### Headers de Seguridad
```typescript
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
  'Cross-Origin-Embedder-Policy': 'require-corp',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-origin',
};
```

## 5. Autenticación y Autorización

### Gestión de Sesiones
- **Timeout de sesión**: 24 horas
- **Timeout por inactividad**: 30 minutos
- **Verificación periódica**: Cada minuto
- **Almacenamiento seguro**: httpOnly cookies (en producción)

### Protección contra Ataques de Fuerza Bruta
- **Máximo intentos fallidos**: 5
- **Duración de bloqueo**: 15 minutos
- **Detección de patrones**: IP, User-Agent, comportamiento

### Tokens de Seguridad
```typescript
export function generateSecureToken(length: number = 32): string {
  return randomBytes(length).toString('hex');
}

export function generateCSRFToken(): string {
  return randomBytes(32).toString('hex');
}
```

## 6. Auditoría y Monitoreo

### Logs de Seguridad
```typescript
console.log(`[SECURITY] ${new Date().toISOString()} - ${request.method} ${pathname} - IP: ${clientIP} - UA: ${userAgent.substring(0, 100)}`);
```

### Auditoría de Actividad
```typescript
export function generateSecurityAudit(userId: string, action: string, details: any): {
  id: string;
  userId: string;
  action: string;
  details: any;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
}
```

### Detección de Actividad Sospechosa
- Múltiples intentos de login fallidos
- Actividad en horarios inusuales
- Actividad desde múltiples ubicaciones
- Patrones de comportamiento anómalos

## 7. Validación de Archivos

### Tipos Permitidos
- `image/jpeg`, `image/png`, `image/gif`, `image/webp`
- `application/pdf`
- `text/plain`
- `application/msword`
- `application/vnd.openxmlformats-officedocument.wordprocessingml.document`

### Límites
- **Tamaño máximo**: 10MB
- **Validación de contenido**: Verificación de magic bytes
- **Escaneo antivirus**: Integración con servicios de escaneo

## 8. Configuración de Seguridad

### Variables de Entorno Requeridas
```bash
# .env.local
ENCRYPTION_KEY=your-secure-encryption-key-here
JWT_SECRET=your-jwt-secret-here
SESSION_SECRET=your-session-secret-here
DATABASE_URL=your-database-url-here
```

### Configuración de Producción
```typescript
const PRODUCTION_CONFIG = {
  HTTPS_ENFORCED: true,
  COOKIE_SECURE: true,
  COOKIE_HTTPONLY: true,
  COOKIE_SAMESITE: 'strict',
  RATE_LIMIT_ENABLED: true,
  LOGGING_ENABLED: true,
  AUDIT_ENABLED: true,
};
```

## 9. Testing de Seguridad

### Tests Unitarios
```bash
npm run test:security
```

### Tests de Penetración
- OWASP ZAP
- Burp Suite
- Manual testing

### Análisis de Dependencias
```bash
npm audit
snyk test
```

## 10. Respuesta a Incidentes

### Plan de Respuesta
1. **Detección**: Monitoreo automático y alertas
2. **Contención**: Bloqueo inmediato de IPs sospechosas
3. **Análisis**: Investigación del incidente
4. **Eradicación**: Eliminación de la amenaza
5. **Recuperación**: Restauración de servicios
6. **Lecciones aprendidas**: Documentación y mejora

### Contactos de Emergencia
- **Equipo de Seguridad**: security@inclusiveai.com
- **DevOps**: devops@inclusiveai.com
- **Soporte 24/7**: +1-800-SECURITY

## 11. Cumplimiento y Estándares

### Estándares Cumplidos
- **OWASP Top 10**: Protección contra vulnerabilidades comunes
- **GDPR**: Protección de datos personales
- **COPPA**: Protección de menores de 13 años
- **FERPA**: Protección de registros educativos

### Certificaciones
- **ISO 27001**: Gestión de seguridad de la información
- **SOC 2 Type II**: Controles de seguridad
- **PCI DSS**: Si se procesan pagos

## 12. Monitoreo Continuo

### Métricas de Seguridad
- Intentos de login fallidos
- Requests bloqueados por rate limiting
- Actividad sospechosa detectada
- Tiempo de respuesta de APIs
- Errores de validación

### Alertas Automáticas
- Múltiples intentos de login fallidos
- Actividad desde IPs sospechosas
- Patrones de ataque detectados
- Caída de servicios de seguridad

## 13. Mejoras Futuras

### Roadmap de Seguridad
- [ ] Implementación de autenticación multifactor (MFA)
- [ ] Integración con servicios de threat intelligence
- [ ] Implementación de WAF (Web Application Firewall)
- [ ] Análisis de comportamiento de usuarios (UEBA)
- [ ] Implementación de zero-trust architecture

### Actualizaciones Regulares
- Revisión mensual de logs de seguridad
- Actualización trimestral de dependencias
- Auditoría semestral de seguridad
- Revisión anual de políticas y procedimientos

---

**Nota**: Este documento debe ser actualizado regularmente para reflejar los cambios en las medidas de seguridad implementadas.
