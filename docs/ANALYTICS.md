# Sistema de Analytics - InclusiveAI Coach

## Descripción General

El sistema de analytics de InclusiveAI Coach proporciona un análisis completo del comportamiento de los usuarios, métricas de rendimiento y reportes detallados para optimizar la experiencia de aprendizaje inclusiva.

## Características Principales

### 🎯 Google Analytics 4
- Integración completa con GA4
- Tracking automático de eventos personalizados
- Métricas de Web Vitals (FCP, LCP, FID, CLS)
- Análisis de comportamiento de usuarios
- Reportes en tiempo real

### 📊 Reportes de Progreso
- Métricas personalizadas por usuario
- Análisis de tendencias de aprendizaje
- Recomendaciones inteligentes
- Comparación de períodos (diario, semanal, mensual)
- Objetivos y logros

### 📈 Métricas de Engagement
- Usuarios activos (DAU, WAU, MAU)
- Tiempo de sesión promedio
- Tasa de rebote y retención
- Análisis de contenido más popular
- Journey del usuario

### 🏢 Dashboards de Administración
- Vista general del sistema
- Métricas de rendimiento
- Crecimiento de usuarios
- Análisis de contenido
- Métricas de accesibilidad

## Arquitectura del Sistema

### Componentes Principales

```
lib/analytics/
├── analytics-service.ts      # Servicio principal de analytics
├── hooks/
│   └── use-analytics.ts      # Hooks de React para analytics
components/analytics/
├── admin-dashboard.tsx       # Dashboard de administración
└── progress-report.tsx       # Reportes de progreso
app/api/analytics/
└── route.ts                  # API de analytics
scripts/
└── generate-analytics-data.ts # Generador de datos de prueba
```

### Flujo de Datos

1. **Recolección**: Eventos capturados por hooks y componentes
2. **Procesamiento**: Servicio de analytics procesa y almacena datos
3. **Almacenamiento**: Base de datos PostgreSQL + Redis para caché
4. **Análisis**: Cálculo de métricas y reportes
5. **Visualización**: Dashboards y reportes en tiempo real

## Configuración

### Variables de Entorno

```bash
# Google Analytics 4
NEXT_PUBLIC_GA_ID="G-XXXXXXXXXX"

# Redis para caché
REDIS_HOST="localhost"
REDIS_PORT="6379"
REDIS_PASSWORD=""
REDIS_DB="0"

# Base de datos
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
```

### Instalación

```bash
# Instalar dependencias
npm install

# Configurar base de datos
npm run db:migrate

# Generar datos de prueba
npm run analytics:setup

# Verificar configuración
npm run analytics:check
```

## Uso del Sistema

### Tracking de Eventos

```typescript
import { useAnalytics } from '@/lib/hooks/use-analytics';

const MyComponent = () => {
  const { trackEvent, trackLearningEvent } = useAnalytics(userId);

  const handleLessonComplete = async () => {
    await trackLearningEvent('lesson_complete', {
      lessonId: 'lesson-123',
      score: 95,
      timeSpent: 1200, // segundos
      difficulty: 2
    });
  };

  const handleUserInteraction = async () => {
    await trackEvent(
      'button_click',
      'engagement',
      'click',
      'start_lesson_button',
      1,
      { lessonId: 'lesson-123' }
    );
  };

  return (
    <button onClick={handleLessonComplete}>
      Completar Lección
    </button>
  );
};
```

### Tracking Automático

```typescript
import { usePageTracking, useErrorTracking, usePerformanceTracking } from '@/lib/hooks/use-analytics';

const App = () => {
  // Tracking automático de páginas
  usePageTracking(userId);
  
  // Tracking automático de errores
  useErrorTracking(userId);
  
  // Tracking automático de performance
  usePerformanceTracking(userId);

  return <div>...</div>;
};
```

### Dashboard de Administración

```typescript
import { AdminDashboard } from '@/components/analytics/admin-dashboard';

const AdminPage = () => {
  return (
    <AdminDashboard 
      refreshInterval={300000} // 5 minutos
    />
  );
};
```

### Reportes de Progreso

```typescript
import { ProgressReport } from '@/components/analytics/progress-report';

const UserProgressPage = () => {
  return (
    <ProgressReport 
      userId="user-123"
      refreshInterval={600000} // 10 minutos
    />
  );
};
```

## API Endpoints

### POST /api/analytics

Trackear eventos de analytics.

```typescript
// Ejemplo de request
{
  "action": "track_event",
  "event": "lesson_start",
  "category": "learning",
  "action": "lesson_start",
  "label": "lesson-123",
  "value": 1,
  "parameters": {
    "lessonId": "lesson-123",
    "difficulty": 2
  },
  "userId": "user-123"
}
```

### GET /api/analytics

Obtener métricas y reportes.

```typescript
// Obtener métricas de usuario
GET /api/analytics?action=user_metrics&userId=user-123

// Obtener reporte de progreso
GET /api/analytics?action=progress_report&userId=user-123&period=weekly

// Obtener métricas de engagement
GET /api/analytics?action=engagement_metrics

// Obtener dashboard de administración
GET /api/analytics?action=admin_dashboard
```

## Métricas Disponibles

### Métricas de Usuario

- **Total de sesiones**: Número de sesiones del usuario
- **Vistas de página**: Total de páginas visitadas
- **Eventos totales**: Todos los eventos registrados
- **Duración promedio de sesión**: Tiempo promedio por sesión
- **Última actividad**: Fecha de última interacción
- **Primera vez**: Fecha de primer acceso

### Métricas de Aprendizaje

- **Lecciones completadas**: Total de lecciones terminadas
- **Evaluaciones aprobadas**: Evaluaciones con puntaje aprobatorio
- **Logros obtenidos**: Badges y logros desbloqueados
- **Puntos totales**: Puntos acumulados
- **Nivel actual**: Nivel de gamificación

### Métricas de Engagement

- **Usuarios activos**: DAU, WAU, MAU
- **Duración de sesión**: Tiempo promedio por sesión
- **Tasa de rebote**: Porcentaje de sesiones de una página
- **Tasa de retención**: Usuarios que regresan
- **Páginas por sesión**: Promedio de páginas visitadas

### Métricas de Accesibilidad

- **Uso de lector de pantalla**: Usuarios que utilizan screen reader
- **Alto contraste**: Usuarios con modo alto contraste
- **Texto grande**: Usuarios con texto ampliado
- **Navegación por voz**: Usuarios con navegación vocal
- **Problemas reportados**: Issues de accesibilidad

## Optimización y Rendimiento

### Caché

- **Redis**: Caché de métricas y reportes
- **TTL**: 15-60 minutos según tipo de dato
- **Invalidación**: Automática por tiempo o manual

### Compresión

- **Gzip**: Compresión de respuestas API
- **Brotli**: Compresión avanzada cuando está disponible
- **Threshold**: 1KB mínimo para comprimir

### Lazy Loading

- **Componentes**: Carga diferida de dashboards
- **Datos**: Carga progresiva de métricas
- **Imágenes**: Optimización automática

## Seguridad

### Validación de Datos

- **Zod**: Esquemas de validación
- **Sanitización**: Limpieza de datos de entrada
- **Auditoría**: Logs de seguridad

### Privacidad

- **Anonimización**: IPs anonimizadas en GA4
- **Consentimiento**: Respeto a preferencias de usuario
- **GDPR**: Cumplimiento con regulaciones

### Rate Limiting

- **API**: Límites por usuario/IP
- **Eventos**: Throttling de eventos
- **Caché**: Protección contra spam

## Monitoreo y Alertas

### Métricas de Sistema

- **Tiempo de respuesta**: Latencia de APIs
- **Tasa de errores**: Errores por minuto
- **Uptime**: Disponibilidad del sistema
- **Uso de recursos**: CPU, memoria, disco

### Alertas

- **Errores críticos**: Notificaciones inmediatas
- **Rendimiento**: Alertas de latencia alta
- **Disponibilidad**: Alertas de downtime
- **Seguridad**: Alertas de actividad sospechosa

## Scripts de Utilidad

### Generación de Datos

```bash
# Generar datos de prueba
npm run analytics:generate-data

# Limpiar datos de prueba
npm run analytics:cleanup

# Configuración completa
npm run analytics:setup
```

### Verificación

```bash
# Verificar configuración
npm run analytics:check

# Verificar performance
npm run monitor:performance

# Verificar salud del sistema
npm run monitor:health
```

## Troubleshooting

### Problemas Comunes

1. **GA4 no carga**
   - Verificar `NEXT_PUBLIC_GA_ID`
   - Revisar bloqueadores de anuncios
   - Verificar conexión a internet

2. **Datos no se actualizan**
   - Verificar conexión a Redis
   - Revisar TTL de caché
   - Verificar permisos de base de datos

3. **Performance lenta**
   - Optimizar consultas de base de datos
   - Aumentar TTL de caché
   - Revisar índices de base de datos

### Logs y Debugging

```bash
# Ver logs de analytics
tail -f logs/analytics.log

# Debug de eventos
DEBUG=analytics:* npm run dev

# Verificar métricas en tiempo real
curl http://localhost:3000/api/analytics?action=admin_dashboard
```

## Contribución

### Desarrollo

1. **Fork** el repositorio
2. **Crear** rama de feature
3. **Implementar** cambios
4. **Agregar** tests
5. **Documentar** cambios
6. **Pull Request**

### Testing

```bash
# Tests unitarios
npm test

# Tests de integración
npm run test:integration

# Tests de accesibilidad
npm run test:accessibility

# Tests E2E
npm run test:e2e
```

## Roadmap

### Próximas Características

- [ ] **Machine Learning**: Predicciones de comportamiento
- [ ] **A/B Testing**: Experimentos controlados
- [ ] **Heatmaps**: Análisis visual de interacciones
- [ ] **Funnels**: Análisis de conversión avanzado
- [ ] **Cohort Analysis**: Análisis de cohortes
- [ ] **Real-time Dashboards**: Métricas en tiempo real
- [ ] **Export/Import**: Funcionalidades de datos
- [ ] **API GraphQL**: API más flexible

### Mejoras Técnicas

- [ ] **Web Workers**: Procesamiento en background
- [ ] **Service Workers**: Caché offline
- [ ] **WebAssembly**: Cálculos más rápidos
- [ ] **Edge Computing**: Procesamiento distribuido
- [ ] **Microservices**: Arquitectura modular

## Licencia

MIT License - Ver [LICENSE](../LICENSE) para más detalles.

## Soporte

- **Documentación**: [docs/](../docs/)
- **Issues**: [GitHub Issues](https://github.com/inclusive-ai/coach/issues)
- **Discusiones**: [GitHub Discussions](https://github.com/inclusive-ai/coach/discussions)
- **Email**: support@inclusiveai.com
