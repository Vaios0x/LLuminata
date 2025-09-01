# Documentación de Componentes de Seguridad

## Descripción General

El sistema de seguridad de InclusiveAI Coach proporciona protección integral contra amenazas cibernéticas, validación de datos, control de acceso, y cumplimiento de regulaciones de privacidad. Incluye componentes para autenticación, autorización, validación de entrada, y monitoreo de seguridad.

## Componentes Principales

### 1. SecurityProvider

**Archivo:** `components/security/SecurityProvider.tsx`

**Descripción:** Proveedor de contexto de seguridad que gestiona el estado de autenticación y autorización.

**Props:**
- `children: React.ReactNode` - Componentes hijos
- `config?: SecurityConfig` - Configuración de seguridad

**Características:**
- Gestión de sesiones
- Autenticación centralizada
- Control de acceso basado en roles
- Validación de tokens
- Logout automático

**Ejemplo de uso:**
```tsx
import { SecurityProvider } from '@/components/security/SecurityProvider';

<SecurityProvider config={{ sessionTimeout: 3600 }}>
  <App />
</SecurityProvider>
```

### 2. PrivacyControls

**Archivo:** `components/security/PrivacyControls.tsx`

**Descripción:** Panel de control de privacidad para gestionar preferencias de datos del usuario.

**Props:**
- `userId: string` - ID del usuario
- `onPrivacyUpdate: (settings: PrivacySettings) => void` - Callback de actualización

**Características:**
- Configuración de cookies
- Control de tracking
- Gestión de datos personales
- Cumplimiento GDPR
- Exportación de datos

### 3. CSRFProtection

**Archivo:** `components/security/CSRFProtection.tsx`

**Descripción:** Protección contra ataques CSRF (Cross-Site Request Forgery).

**Props:**
- `token: string` - Token CSRF
- `endpoint: string` - Endpoint a proteger
- `method: string` - Método HTTP

**Características:**
- Generación automática de tokens
- Validación de origen
- Protección de formularios
- Logging de intentos sospechosos
- Rate limiting

### 4. InputValidation

**Archivo:** `components/security/InputValidation.tsx`

**Descripción:** Componente para validación y sanitización de entrada de datos.

**Props:**
- `schema: ValidationSchema` - Esquema de validación
- `onValidation: (result: ValidationResult) => void` - Callback de validación
- `strict: boolean` - Modo estricto de validación

**Características:**
- Validación en tiempo real
- Sanitización automática
- Prevención de XSS
- Validación de tipos
- Mensajes de error personalizados

### 5. RateLimitMonitor

**Archivo:** `components/security/RateLimitMonitor.tsx`

**Descripción:** Monitor de límites de tasa para prevenir abuso de APIs.

**Props:**
- `limits: RateLimit[]` - Límites configurados
- `onLimitExceeded: (event: RateLimitEvent) => void` - Callback de límite excedido

**Características:**
- Monitoreo en tiempo real
- Límites por IP/usuario
- Ventanas de tiempo configurables
- Alertas automáticas
- Logging detallado

### 6. SecurityAuditPanel

**Archivo:** `components/security/SecurityAuditPanel.tsx`

**Descripción:** Panel de auditoría de seguridad para monitorear eventos y amenazas.

**Props:**
- `auditLevel: 'basic' | 'advanced' | 'expert'` - Nivel de auditoría
- `showSensitiveData: boolean` - Mostrar datos sensibles
- `timeRange: string` - Rango de tiempo

**Características:**
- Logs de seguridad
- Detección de anomalías
- Alertas en tiempo real
- Reportes de incidentes
- Análisis forense

## Interfaces de Datos

### SecurityConfig
```typescript
interface SecurityConfig {
  sessionTimeout: number; // segundos
  maxLoginAttempts: number;
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
  };
  csrfProtection: boolean;
  rateLimiting: {
    enabled: boolean;
    windowMs: number;
    maxRequests: number;
  };
  privacy: {
    gdprCompliance: boolean;
    dataRetentionDays: number;
    allowTracking: boolean;
  };
}
```

### PrivacySettings
```typescript
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
    account: number; // días
    activity: number;
    analytics: number;
  };
}
```

### ValidationSchema
```typescript
interface ValidationSchema {
  fields: Record<string, FieldValidation>;
  customValidators?: CustomValidator[];
  sanitizers?: Sanitizer[];
}

interface FieldValidation {
  type: 'string' | 'email' | 'number' | 'url' | 'date';
  required: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean;
}
```

### RateLimit
```typescript
interface RateLimit {
  endpoint: string;
  method: string;
  windowMs: number;
  maxRequests: number;
  keyGenerator: (req: any) => string;
  skipSuccessfulRequests: boolean;
  skipFailedRequests: boolean;
}
```

### SecurityEvent
```typescript
interface SecurityEvent {
  id: string;
  type: 'login' | 'logout' | 'failed_login' | 'suspicious_activity' | 'data_access';
  userId?: string;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  details: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
}
```

## Hooks Relacionados

### useSecurity
**Archivo:** `lib/hooks/useSecurity.ts`

**Funcionalidades:**
- Gestión de autenticación
- Validación de sesiones
- Control de acceso
- Logging de eventos

### usePrivacyControls
**Archivo:** `lib/hooks/usePrivacyControls.ts`

**Funcionalidades:**
- Gestión de preferencias de privacidad
- Cumplimiento GDPR
- Control de cookies
- Exportación de datos

### useInputValidation
**Archivo:** `lib/hooks/useInputValidation.ts`

**Funcionalidades:**
- Validación de formularios
- Sanitización de datos
- Prevención de XSS
- Mensajes de error

### useCSRFProtection
**Archivo:** `lib/hooks/useCSRFProtection.ts`

**Funcionalidades:**
- Generación de tokens CSRF
- Validación de tokens
- Protección de endpoints
- Logging de intentos

### useRateLimit
**Archivo:** `lib/hooks/useRateLimit.ts`

**Funcionalidades:**
- Monitoreo de límites
- Control de tasa
- Alertas automáticas
- Gestión de bloqueos

### useSecurityAudit
**Archivo:** `lib/hooks/useSecurityAudit.ts`

**Funcionalidades:**
- Logging de eventos
- Detección de anomalías
- Generación de reportes
- Análisis forense

## APIs Relacionadas

### /api/security/auth
- **POST:** Autenticación de usuario
- **DELETE:** Logout de usuario
- **GET:** Verificar sesión

### /api/security/validate
- **POST:** Validar entrada de datos
- **GET:** Obtener esquemas de validación

### /api/security/csrf
- **GET:** Obtener token CSRF
- **POST:** Validar token CSRF

### /api/security/privacy
- **GET:** Obtener configuración de privacidad
- **PUT:** Actualizar configuración de privacidad
- **POST:** Exportar datos del usuario

### /api/security/audit
- **GET:** Obtener logs de auditoría
- **POST:** Registrar evento de seguridad

### /api/security/rate-limit
- **GET:** Obtener estado de límites
- **POST:** Configurar límites

### /api/security/suspicious-activity
- **GET:** Obtener actividad sospechosa
- **POST:** Reportar actividad sospechosa

## Configuración

### Variables de Entorno
```env
# Configuración de seguridad
SECURITY_ENABLED=true
SECURITY_SESSION_SECRET=your_session_secret
SECURITY_SESSION_TIMEOUT=3600

# Configuración de autenticación
AUTH_MAX_LOGIN_ATTEMPTS=5
AUTH_LOCKOUT_DURATION=900
AUTH_PASSWORD_MIN_LENGTH=8
AUTH_PASSWORD_REQUIRE_SPECIAL=true

# Configuración de CSRF
CSRF_ENABLED=true
CSRF_SECRET=your_csrf_secret
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
```

### Configuración en Base de Datos
```sql
-- Tabla de sesiones
CREATE TABLE security_sessions (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(255) UNIQUE NOT NULL,
  user_id VARCHAR(100) NOT NULL,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  is_active BOOLEAN DEFAULT true
);

-- Tabla de intentos de login
CREATE TABLE security_login_attempts (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(100),
  ip_address INET NOT NULL,
  user_agent TEXT,
  success BOOLEAN NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  details JSONB
);

-- Tabla de eventos de seguridad
CREATE TABLE security_events (
  id SERIAL PRIMARY KEY,
  event_type VARCHAR(50) NOT NULL,
  user_id VARCHAR(100),
  ip_address INET,
  user_agent TEXT,
  severity VARCHAR(20) DEFAULT 'low',
  details JSONB,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de configuración de privacidad
CREATE TABLE security_privacy_settings (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(100) UNIQUE NOT NULL,
  allow_cookies BOOLEAN DEFAULT true,
  allow_tracking BOOLEAN DEFAULT false,
  allow_analytics BOOLEAN DEFAULT true,
  allow_marketing BOOLEAN DEFAULT false,
  data_sharing JSONB,
  data_retention JSONB,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de tokens CSRF
CREATE TABLE security_csrf_tokens (
  id SERIAL PRIMARY KEY,
  token VARCHAR(255) UNIQUE NOT NULL,
  user_id VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP,
  is_valid BOOLEAN DEFAULT true
);
```

## Mejores Prácticas

### 1. Autenticación
- Usar tokens JWT con expiración corta
- Implementar refresh tokens
- Validar tokens en cada request
- Logout automático por inactividad

### 2. Validación de Entrada
- Validar en frontend y backend
- Sanitizar todos los datos
- Usar esquemas de validación
- Prevenir inyección de código

### 3. Protección CSRF
- Generar tokens únicos por sesión
- Validar tokens en formularios
- Usar SameSite cookies
- Implementar double submit

### 4. Rate Limiting
- Configurar límites por endpoint
- Usar ventanas de tiempo apropiadas
- Implementar backoff exponencial
- Monitorear patrones de abuso

### 5. Privacidad
- Cumplir con GDPR
- Minimizar recolección de datos
- Proporcionar control al usuario
- Encriptar datos sensibles

### 6. Auditoría
- Logging de todos los eventos
- Detección de anomalías
- Alertas en tiempo real
- Retención de logs apropiada

## Testing

### Tests Unitarios
```typescript
// Ejemplo de test para SecurityProvider
describe('SecurityProvider', () => {
  it('maneja autenticación correctamente', async () => {
    // Test implementation
  });

  it('valida tokens correctamente', async () => {
    // Test implementation
  });

  it('maneja logout correctamente', async () => {
    // Test implementation
  });
});
```

### Tests de Integración
```typescript
// Ejemplo de test de integración
describe('Security Integration', () => {
  it('protege endpoints correctamente', async () => {
    // Test implementation
  });

  it('maneja rate limiting', async () => {
    // Test implementation
  });
});
```

### Tests de Seguridad
```typescript
// Ejemplo de test de seguridad
describe('Security Tests', () => {
  it('previene ataques XSS', async () => {
    // Test implementation
  });

  it('previene ataques CSRF', async () => {
    // Test implementation
  });

  it('valida entrada correctamente', async () => {
    // Test implementation
  });
});
```

## Troubleshooting

### Problemas Comunes

1. **Sesiones expiran prematuramente**
   - Verificar configuración de timeout
   - Comprobar sincronización de reloj
   - Revisar configuración de cookies
   - Verificar configuración de servidor

2. **Rate limiting muy restrictivo**
   - Ajustar límites por endpoint
   - Revisar configuración de ventanas
   - Verificar generación de claves
   - Comprobar configuración de Redis

3. **Tokens CSRF inválidos**
   - Verificar generación de tokens
   - Comprobar validación de tokens
   - Revisar configuración de secretos
   - Verificar expiración de tokens

### Logs de Debug
```typescript
// Habilitar logs de debug
const DEBUG_SECURITY = process.env.NODE_ENV === 'development';

if (DEBUG_SECURITY) {
  console.log('Security event:', securityEvent);
  console.log('CSRF token:', csrfToken);
  console.log('Rate limit status:', rateLimitStatus);
}
```

## Recursos Adicionales

- [Documentación de Seguridad General](../SECURITY.md)
- [Guía de Configuración de Seguridad](../guides/security-setup.md)
- [Hooks de Seguridad de IA](../AI-SECURITY-HOOKS.md)
- [Autenticación e Integración](../AUTHENTICATION-INTEGRATION.md)
- [Mejores Prácticas de Seguridad](../SECURITY.md#best-practices)
