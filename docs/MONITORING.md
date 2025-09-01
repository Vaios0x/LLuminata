# 📊 Sistema de Monitoring - InclusiveAI Coach

Este documento describe el sistema completo de monitoring implementado en InclusiveAI Coach, incluyendo error tracking, performance monitoring, user analytics y health checks.

## 🎯 Resumen Ejecutivo

El sistema de monitoring proporciona visibilidad completa del estado y rendimiento de la aplicación, con las siguientes capacidades:

- **Error Tracking**: Captura y reporta errores usando Sentry
- **Performance Monitoring**: Métricas de Core Web Vitals y rendimiento personalizado
- **User Analytics**: Seguimiento de eventos y comportamiento de usuarios
- **Health Checks**: Verificación del estado de servicios y recursos
- **Dashboard Unificado**: Interfaz visual para monitorear todos los sistemas

## 🏗️ Arquitectura del Sistema

### Estructura de Archivos

```
lib/monitoring/
├── index.ts                 # Exportaciones principales
├── monitoring-config.ts     # Configuración centralizada
├── error-tracking.ts        # Sistema de error tracking con Sentry
├── performance-monitoring.ts # Monitoreo de rendimiento
├── user-analytics.ts        # Analytics de usuarios
└── health-checks.ts         # Health checks del sistema

components/ui/
└── monitoring-dashboard.tsx # Dashboard principal

app/api/health/
├── route.ts                 # Health check general
├── database/route.ts        # Health check de base de datos
├── external/route.ts        # Health check de servicios externos
└── memory/route.ts          # Health check de memoria

app/monitoring/
└── page.tsx                 # Página del dashboard
```

## 🔧 Configuración

### Variables de Entorno

```bash
# Error Tracking (Sentry)
NEXT_PUBLIC_SENTRY_DSN="your-sentry-dsn-here"

# User Analytics (Google Analytics)
NEXT_PUBLIC_GA_ID="your-google-analytics-id-here"

# Monitoring General
ENABLE_MONITORING="true"
LOG_LEVEL="info"

# Alerting
ALERT_EMAIL="alerts@yourdomain.com"
SLACK_WEBHOOK_URL="your-slack-webhook-url-here"
DISCORD_WEBHOOK_URL="your-discord-webhook-url-here"
```

### Configuración Centralizada

```typescript
// lib/monitoring/monitoring-config.ts
export const MONITORING_CONFIG = {
  enabled: process.env.NODE_ENV === 'production' || process.env.ENABLE_MONITORING === 'true',
  environment: process.env.NODE_ENV || 'development',
  appName: 'InclusiveAI Coach',
  version: process.env.npm_package_version || '1.0.0',
  
  // Configuración de Sentry
  sentry: {
    enabled: process.env.NEXT_PUBLIC_SENTRY_DSN !== undefined,
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  },
  
  // Configuración de Performance
  performance: {
    enabled: true,
    sampleRate: 0.1,
    metrics: {
      fcp: { threshold: 1800, weight: 0.25 },
      lcp: { threshold: 2500, weight: 0.25 },
      fid: { threshold: 100, weight: 0.25 },
      cls: { threshold: 0.1, weight: 0.15 },
      ttfb: { threshold: 800, weight: 0.1 },
    },
  },
  
  // Configuración de Health Checks
  healthChecks: {
    enabled: true,
    interval: 30000, // 30 segundos
    timeout: 5000,   // 5 segundos
    thresholds: {
      responseTime: 1000,
      memoryUsage: 0.8,
      cpuUsage: 0.9,
      diskUsage: 0.9,
    },
  },
};
```

## 🚨 Error Tracking (Sentry)

### Características

- **Captura automática de errores**: Errores de JavaScript, React, y APIs
- **Contexto enriquecido**: Información del usuario, sesión, y entorno
- **Breadcrumbs**: Trazabilidad de acciones antes del error
- **Filtrado de datos sensibles**: Eliminación automática de información sensible
- **Fallback para desarrollo**: Logging en consola cuando Sentry no está disponible

### Uso

```typescript
import { captureException, setUser, addBreadcrumb } from '@/lib/monitoring';

// Capturar error
try {
  // Código que puede fallar
} catch (error) {
  captureException(error, {
    context: 'user-action',
    userId: 'user-123',
  });
}

// Establecer usuario
setUser({
  id: 'user-123',
  email: 'user@example.com',
  role: 'student',
});

// Agregar breadcrumb
addBreadcrumb({
  message: 'Usuario inició sesión',
  category: 'auth',
  level: 'info',
});
```

### Error Boundaries

```typescript
import { withErrorBoundary } from '@/lib/monitoring';

const MyComponent = withErrorBoundary(Component, FallbackComponent);
```

## ⚡ Performance Monitoring

### Métricas Monitoreadas

- **FCP (First Contentful Paint)**: < 1.8s
- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1
- **TTFB (Time to First Byte)**: < 800ms

### Uso

```typescript
import { 
  usePerformanceMonitoring, 
  trackApiCall, 
  trackUserInteraction 
} from '@/lib/monitoring';

// Hook en componentes
function MyComponent() {
  const { metrics, score, trackCustomMetric } = usePerformanceMonitoring();
  
  // Trackear métricas personalizadas
  trackCustomMetric('custom-metric', 150);
  
  return (
    <div>
      Performance Score: {score?.score}/100
    </div>
  );
}

// Trackear llamadas a API
const response = await fetch('/api/data');
trackApiCall('/api/data', Date.now() - startTime, response.status);

// Trackear interacciones de usuario
trackUserInteraction('button-click', 50);
```

## 📈 User Analytics

### Eventos Trackeados

- **Page Views**: Navegación entre páginas
- **User Interactions**: Clicks, formularios, etc.
- **Errors**: Errores de la aplicación
- **Performance**: Métricas de rendimiento
- **Accessibility**: Problemas de accesibilidad
- **Offline Usage**: Uso sin conexión

### Uso

```typescript
import { 
  useAnalytics, 
  trackPageView, 
  trackEvent, 
  trackUser 
} from '@/lib/monitoring';

// Hook en componentes
function MyComponent() {
  const { trackPageView, trackEvent } = useAnalytics();
  
  useEffect(() => {
    trackPageView('/dashboard', 'Dashboard');
  }, []);
  
  const handleClick = () => {
    trackEvent({
      action: 'button_click',
      category: 'interaction',
      label: 'submit_form',
    });
  };
}

// Trackear usuario
trackUser({
  id: 'user-123',
  email: 'user@example.com',
  role: 'student',
});
```

## 🏥 Health Checks

### Endpoints Disponibles

- `/api/health` - Health check general
- `/api/health/database` - Estado de la base de datos
- `/api/health/external` - Servicios externos (IA, etc.)
- `/api/health/memory` - Uso de memoria

### Uso

```typescript
import { 
  useHealthChecks, 
  runHealthCheck, 
  addHealthCheck 
} from '@/lib/monitoring';

// Hook en componentes
function HealthWidget() {
  const { health, isLoading } = useHealthChecks();
  
  return (
    <div>
      Status: {health?.overall}
      {health?.checks.map(check => (
        <div key={check.name}>
          {check.name}: {check.status}
        </div>
      ))}
    </div>
  );
}

// Agregar health check personalizado
addHealthCheck({
  name: 'custom-service',
  check: async () => {
    const response = await fetch('/api/custom-service/health');
    return {
      name: 'custom-service',
      status: response.ok ? 'healthy' : 'unhealthy',
      responseTime: Date.now() - startTime,
      lastChecked: new Date(),
    };
  },
  critical: true,
});
```

## 📊 Dashboard de Monitoreo

### Características

- **Vista unificada**: Todos los sistemas en una sola interfaz
- **Tabs organizados**: Resumen, Performance, Health, Analytics, Errors
- **Actualización automática**: Refresco cada 30 segundos
- **Métricas en tiempo real**: Estado actual del sistema
- **Acciones rápidas**: Enlaces directos a endpoints

### Uso

```typescript
import { MonitoringDashboard } from '@/components/ui/monitoring-dashboard';

function MonitoringPage() {
  return (
    <MonitoringDashboard 
      showPerformance={true}
      showHealth={true}
      showAnalytics={true}
      showErrors={true}
      refreshInterval={30000}
    />
  );
}
```

## 🚀 Inicialización

### En la Aplicación Principal

```typescript
// app/layout.tsx o _app.tsx
import { 
  initErrorTracking, 
  initPerformanceMonitoring, 
  initUserAnalytics, 
  initHealthChecks 
} from '@/lib/monitoring';

useEffect(() => {
  const initializeMonitoring = async () => {
    await initErrorTracking();
    initPerformanceMonitoring();
    await initUserAnalytics();
    initHealthChecks();
  };
  
  initializeMonitoring();
}, []);
```

### En Páginas Específicas

```typescript
// app/monitoring/page.tsx
import { MonitoringDashboard } from '@/components/ui/monitoring-dashboard';

export default function MonitoringPage() {
  return (
    <div>
      <h1>Dashboard de Monitoreo</h1>
      <MonitoringDashboard />
    </div>
  );
}
```

## 📋 Métricas y Alertas

### Umbrales de Alerta

```typescript
const ALERT_THRESHOLDS = {
  errorRate: 0.05,      // 5% de errores
  responseTime: 2000,   // 2 segundos
  availability: 0.99,   // 99% de disponibilidad
  memoryUsage: 0.8,     // 80% de memoria
};
```

### Canales de Alerta

- **Email**: Alertas por correo electrónico
- **Slack**: Notificaciones en Slack
- **Discord**: Notificaciones en Discord

## 🔒 Seguridad y Privacidad

### Protección de Datos

- **Anonimización de IP**: Configurado en Google Analytics
- **Filtrado de datos sensibles**: Eliminación automática en Sentry
- **Consentimiento de cookies**: Respeto por preferencias del usuario
- **Do Not Track**: Respeto por la señal DNT

### Configuración de Seguridad

```typescript
const SECURITY_CONFIG = {
  anonymizeIP: true,
  respectDoNotTrack: true,
  cookieConsent: true,
  filterSensitiveData: true,
};
```

## 🧪 Testing

### Tests Unitarios

```bash
# Tests de monitoring
npm run test:monitoring

# Tests de performance
npm run test:performance

# Tests de health checks
npm run test:health
```

### Tests de Integración

```bash
# Tests de endpoints de health
npm run test:health:endpoints

# Tests de Sentry
npm run test:sentry

# Tests de analytics
npm run test:analytics
```

## 📚 Recursos Adicionales

### Documentación

- [Sentry Documentation](https://docs.sentry.io/)
- [Google Analytics Documentation](https://developers.google.com/analytics)
- [Web Vitals](https://web.dev/vitals/)
- [Health Check Standards](https://tools.ietf.org/html/rfc7231#section-4.3.6)

### Herramientas

- [Sentry Dashboard](https://sentry.io/)
- [Google Analytics](https://analytics.google.com/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [WebPageTest](https://www.webpagetest.org/)

## 🤝 Contribución

Para contribuir al sistema de monitoring:

1. Sigue las convenciones de código establecidas
2. Agrega tests para nuevas funcionalidades
3. Actualiza la documentación
4. Verifica que no se rompan las métricas existentes
5. Considera el impacto en el rendimiento

## 📞 Soporte

Para soporte técnico o preguntas sobre el sistema de monitoring:

- **Email**: monitoring@inclusiveai.com
- **Slack**: #monitoring
- **Documentación**: docs/MONITORING.md
- **Issues**: GitHub Issues

---

**Nota**: Este documento se actualiza regularmente. Para sugerencias o mejoras, por favor crea un issue en el repositorio.
