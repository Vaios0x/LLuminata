# Documentación de Componentes de Analytics

## Descripción General

El sistema de analytics de InclusiveAI Coach proporciona análisis detallado del comportamiento del usuario, métricas de rendimiento, y insights para mejorar la experiencia de aprendizaje. Incluye dashboards en tiempo real, análisis predictivo, y herramientas de exportación.

## Componentes Principales

### 1. AnalyticsDashboard

**Archivo:** `components/analytics/analytics-dashboard.tsx`

**Descripción:** Dashboard principal que muestra métricas clave y análisis de datos.

**Props:**
- `userId?: string` - ID del usuario (opcional para admin)
- `timeRange: string` - Rango de tiempo para análisis
- `filters: AnalyticsFilters` - Filtros aplicados

**Características:**
- Métricas en tiempo real
- Gráficos interactivos
- Filtros avanzados
- Exportación de datos
- Comparativas temporales

**Ejemplo de uso:**
```tsx
import { AnalyticsDashboard } from '@/components/analytics/analytics-dashboard';

<AnalyticsDashboard 
  userId="user123" 
  timeRange="last_30_days"
  filters={{ category: 'learning', region: 'mexico' }}
/>
```

### 2. RealTimeMetrics

**Archivo:** `components/analytics/RealTimeMetrics.tsx`

**Descripción:** Componente para mostrar métricas en tiempo real con actualizaciones automáticas.

**Props:**
- `metrics: Metric[]` - Lista de métricas a mostrar
- `updateInterval: number` - Intervalo de actualización en ms
- `autoRefresh: boolean` - Habilitar actualización automática

**Características:**
- Actualización en tiempo real
- WebSocket para datos live
- Indicadores de estado
- Alertas automáticas

### 3. PredictiveAnalytics

**Archivo:** `components/analytics/PredictiveAnalytics.tsx`

**Descripción:** Análisis predictivo basado en machine learning para anticipar comportamientos.

**Props:**
- `userId: string` - ID del usuario
- `predictionType: 'engagement' | 'performance' | 'retention'` - Tipo de predicción
- `timeframe: number` - Período de predicción en días

**Características:**
- Modelos de ML integrados
- Predicciones de rendimiento
- Análisis de tendencias
- Recomendaciones automáticas

### 4. HeatmapVisualizer

**Archivo:** `components/analytics/HeatmapVisualizer.tsx`

**Descripción:** Visualización de mapas de calor para análisis de interacción.

**Props:**
- `data: HeatmapData[]` - Datos del mapa de calor
- `type: 'click' | 'scroll' | 'hover'` - Tipo de interacción
- `resolution: 'high' | 'medium' | 'low'` - Resolución del mapa

**Características:**
- Mapas de calor interactivos
- Diferentes tipos de interacción
- Filtros temporales
- Exportación de imágenes

### 5. ABTestingDashboard

**Archivo:** `components/analytics/ABTestingDashboard.tsx`

**Descripción:** Dashboard para gestión y análisis de pruebas A/B.

**Props:**
- `experiments: Experiment[]` - Lista de experimentos
- `showActiveOnly: boolean` - Mostrar solo experimentos activos

**Características:**
- Gestión de experimentos
- Análisis de resultados
- Significancia estadística
- Recomendaciones automáticas

### 6. ExportManager

**Archivo:** `components/analytics/ExportManager.tsx`

**Descripción:** Gestor de exportación de datos y reportes.

**Props:**
- `data: any` - Datos a exportar
- `formats: ExportFormat[]` - Formatos disponibles
- `filters: ExportFilters` - Filtros de exportación

**Características:**
- Múltiples formatos (CSV, JSON, PDF, Excel)
- Filtros personalizados
- Programación de exportaciones
- Compresión automática

### 7. ProgressReport

**Archivo:** `components/analytics/progress-report.tsx`

**Descripción:** Reportes detallados de progreso del estudiante.

**Props:**
- `userId: string` - ID del usuario
- `reportType: 'daily' | 'weekly' | 'monthly'` - Tipo de reporte
- `includePredictions: boolean` - Incluir predicciones

**Características:**
- Análisis de progreso
- Comparativas con benchmarks
- Predicciones de rendimiento
- Recomendaciones personalizadas

### 8. RegionalAnalysis

**Archivo:** `components/analytics/regional-analysis.tsx`

**Descripción:** Análisis regional y cultural de datos.

**Props:**
- `regions: string[]` - Regiones a analizar
- `metrics: string[]` - Métricas a comparar
- `culturalContext: boolean` - Incluir contexto cultural

**Características:**
- Análisis por regiones
- Comparativas culturales
- Mapas interactivos
- Insights regionales

### 9. EngagementMetrics

**Archivo:** `components/analytics/engagement-metrics.tsx`

**Descripción:** Métricas específicas de engagement y participación.

**Props:**
- `timeRange: string` - Rango de tiempo
- `userSegment: string` - Segmento de usuarios
- `metrics: EngagementMetric[]` - Métricas específicas

**Características:**
- Métricas de engagement
- Análisis de retención
- Segmentación de usuarios
- Benchmarks automáticos

### 10. AdminDashboard

**Archivo:** `components/analytics/admin-dashboard.tsx`

**Descripción:** Dashboard administrativo con métricas globales.

**Props:**
- `adminLevel: 'basic' | 'advanced' | 'super'` - Nivel de administrador
- `showSensitiveData: boolean` - Mostrar datos sensibles

**Características:**
- Métricas globales
- Gestión de usuarios
- Configuración del sistema
- Alertas administrativas

## Interfaces de Datos

### AnalyticsFilters
```typescript
interface AnalyticsFilters {
  dateRange: {
    start: string;
    end: string;
  };
  categories: string[];
  regions: string[];
  userTypes: string[];
  customFilters: Record<string, any>;
}
```

### Metric
```typescript
interface Metric {
  id: string;
  name: string;
  value: number;
  unit: string;
  change: number;
  trend: 'up' | 'down' | 'stable';
  category: string;
  timestamp: string;
}
```

### HeatmapData
```typescript
interface HeatmapData {
  x: number;
  y: number;
  intensity: number;
  timestamp: string;
  userId: string;
  sessionId: string;
}
```

### Experiment
```typescript
interface Experiment {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  variants: ExperimentVariant[];
  metrics: string[];
  startDate: string;
  endDate?: string;
  results?: ExperimentResults;
}
```

### ExportFormat
```typescript
interface ExportFormat {
  name: string;
  extension: string;
  mimeType: string;
  supported: boolean;
}
```

## Hooks Relacionados

### useAnalytics
**Archivo:** `lib/hooks/use-analytics.ts`

**Funcionalidades:**
- Carga de datos de analytics
- Filtrado y procesamiento
- Cache de métricas
- Sincronización en tiempo real

### useRealTimeMetrics
**Archivo:** `lib/hooks/useRealTimeMetrics.ts`

**Funcionalidades:**
- Conexión WebSocket
- Actualización automática
- Gestión de conexión
- Manejo de errores

### useExportManager
**Archivo:** `lib/hooks/useExportManager.ts`

**Funcionalidades:**
- Generación de reportes
- Gestión de formatos
- Programación de exportaciones
- Compresión de archivos

### useABTesting
**Archivo:** `lib/hooks/useABTesting.ts`

**Funcionalidades:**
- Gestión de experimentos
- Asignación de variantes
- Tracking de resultados
- Análisis estadístico

### usePredictions
**Archivo:** `lib/hooks/usePredictions.ts`

**Funcionalidades:**
- Predicciones de ML
- Análisis de tendencias
- Recomendaciones
- Modelos personalizados

### useHeatmap
**Archivo:** `lib/hooks/useHeatmap.ts`

**Funcionalidades:**
- Recopilación de datos
- Procesamiento de interacciones
- Generación de mapas
- Análisis de patrones

### usePersonalization
**Archivo:** `lib/hooks/usePersonalization.ts`

**Funcionalidades:**
- Segmentación de usuarios
- Personalización de contenido
- A/B testing automático
- Optimización continua

## APIs Relacionadas

### /api/analytics/metrics
- **GET:** Obtener métricas básicas
- **POST:** Enviar métricas personalizadas

### /api/analytics/realtime
- **GET:** Obtener métricas en tiempo real
- **WebSocket:** Conexión para datos live

### /api/analytics/predictions
- **GET:** Obtener predicciones
- **POST:** Entrenar modelos personalizados

### /api/analytics/heatmap
- **GET:** Obtener datos de mapa de calor
- **POST:** Enviar datos de interacción

### /api/analytics/experiments
- **GET:** Listar experimentos
- **POST:** Crear nuevo experimento
- **PUT:** Actualizar experimento

### /api/analytics/export
- **POST:** Generar exportación
- **GET:** Descargar archivo exportado

### /api/analytics/reports
- **GET:** Obtener reportes
- **POST:** Generar reporte personalizado

## Configuración

### Variables de Entorno
```env
# Configuración de analytics
ANALYTICS_ENABLED=true
ANALYTICS_API_URL=http://localhost:3000/api/analytics
ANALYTICS_WEBSOCKET_URL=ws://localhost:3000/ws/analytics

# Configuración de predicciones
ML_MODELS_ENABLED=true
PREDICTION_API_URL=http://localhost:3000/api/ml/predictions

# Configuración de exportación
EXPORT_ENABLED=true
EXPORT_STORAGE_PATH=/exports
EXPORT_MAX_SIZE=100MB

# Configuración de A/B testing
AB_TESTING_ENABLED=true
AB_TESTING_SAMPLE_SIZE=1000
AB_TESTING_CONFIDENCE_LEVEL=0.95

# Configuración de mapas de calor
HEATMAP_ENABLED=true
HEATMAP_RESOLUTION=high
HEATMAP_STORAGE_ENABLED=true
```

### Configuración en Base de Datos
```sql
-- Tabla de métricas
CREATE TABLE analytics_metrics (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  value DECIMAL(10,2) NOT NULL,
  category VARCHAR(50),
  user_id VARCHAR(100),
  session_id VARCHAR(100),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  metadata JSONB
);

-- Tabla de experimentos
CREATE TABLE analytics_experiments (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'draft',
  variants JSONB NOT NULL,
  metrics JSONB,
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  results JSONB
);

-- Tabla de mapas de calor
CREATE TABLE analytics_heatmaps (
  id SERIAL PRIMARY KEY,
  page_url VARCHAR(500) NOT NULL,
  x_coordinate INTEGER NOT NULL,
  y_coordinate INTEGER NOT NULL,
  intensity INTEGER NOT NULL,
  interaction_type VARCHAR(20),
  user_id VARCHAR(100),
  session_id VARCHAR(100),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Mejores Prácticas

### 1. Rendimiento
- Implementar lazy loading para gráficos pesados
- Usar virtualización para listas largas
- Cachear datos de analytics
- Optimizar consultas de base de datos

### 2. Privacidad
- Anonimizar datos sensibles
- Implementar consentimiento GDPR
- Limpiar datos antiguos automáticamente
- Encriptar datos en tránsito

### 3. UX/UI
- Mostrar estados de carga claros
- Implementar filtros intuitivos
- Proporcionar tooltips informativos
- Usar colores consistentes para métricas

### 4. Accesibilidad
- Proporcionar textos alternativos para gráficos
- Asegurar navegación por teclado
- Implementar modo de alto contraste
- Usar ARIA labels apropiados

## Testing

### Tests Unitarios
```typescript
// Ejemplo de test para AnalyticsDashboard
describe('AnalyticsDashboard', () => {
  it('renderiza correctamente con métricas', async () => {
    // Test implementation
  });

  it('aplica filtros correctamente', async () => {
    // Test implementation
  });

  it('maneja errores de carga', async () => {
    // Test implementation
  });
});
```

### Tests de Integración
```typescript
// Ejemplo de test de integración
describe('Analytics Integration', () => {
  it('sincroniza datos en tiempo real', async () => {
    // Test implementation
  });

  it('genera exportaciones correctamente', async () => {
    // Test implementation
  });
});
```

## Troubleshooting

### Problemas Comunes

1. **Datos no se actualizan en tiempo real**
   - Verificar conexión WebSocket
   - Comprobar configuración de CORS
   - Revisar logs de errores de red

2. **Exportaciones fallan**
   - Verificar permisos de escritura
   - Comprobar espacio en disco
   - Revisar formato de datos

3. **Predicciones no funcionan**
   - Verificar modelos de ML
   - Comprobar datos de entrenamiento
   - Revisar configuración de API

### Logs de Debug
```typescript
// Habilitar logs de debug
const DEBUG_ANALYTICS = process.env.NODE_ENV === 'development';

if (DEBUG_ANALYTICS) {
  console.log('Analytics data:', analyticsData);
  console.log('Real-time metrics:', realTimeMetrics);
  console.log('Export status:', exportStatus);
}
```

## Recursos Adicionales

- [Documentación de Analytics General](../ANALYTICS.md)
- [Guía de Configuración de Analytics](../guides/analytics-setup.md)
- [API de Analytics](../AI-APIS.md#analytics)
- [Componentes de Analytics](../ANALYTICS-COMPONENTS.md)
- [Optimizaciones de Rendimiento](../PERFORMANCE-OPTIMIZATIONS.md)
