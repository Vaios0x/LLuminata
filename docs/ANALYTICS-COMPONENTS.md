# Componentes de Analytics Avanzados

Este documento describe los cinco componentes de analytics avanzados implementados en el sistema Inclusive AI Coach.

## Tabla de Contenidos

1. [HeatmapVisualizer](#heatmapvisualizer)
2. [PredictiveAnalytics](#predictiveanalytics)
3. [ABTestingDashboard](#abtestingdashboard)
4. [RealTimeMetrics](#realtimemetrics)
5. [ExportManager](#exportmanager)
6. [Uso General](#uso-general)
7. [Configuración](#configuración)
8. [API Endpoints](#api-endpoints)

## HeatmapVisualizer

Visualiza patrones de uso en tiempo y espacio con heatmaps interactivos.

### Características

- **Visualización de Heatmap**: Muestra la intensidad de actividad por día y hora
- **Filtros Avanzados**: Por rango de fechas, categorías, tipos de dispositivo
- **Auto-refresh**: Actualización automática de datos
- **Vistas Múltiples**: Heatmap, gráfico y tabla
- **Exportación**: Soporte para CSV, JSON, PDF
- **Accesibilidad**: Navegación por teclado y tooltips

### Props

```typescript
interface HeatmapVisualizerProps {
  userId: string;
  refreshInterval?: number;
  onDataUpdate?: (data: HeatmapData[]) => void;
  onExport?: (format: 'csv' | 'json' | 'pdf') => void;
  onFilterChange?: (filters: HeatmapFilters) => void;
}
```

### Ejemplo de Uso

```tsx
import { HeatmapVisualizer } from '@/components/analytics';

<HeatmapVisualizer 
  userId="user-123"
  refreshInterval={30000}
  onDataUpdate={(data) => console.log('Datos actualizados:', data)}
  onExport={(format) => console.log('Exportando:', format)}
/>
```

### API Endpoints

- `GET /api/analytics/heatmap` - Obtener datos del heatmap
- `POST /api/analytics/heatmap/export` - Exportar datos

## PredictiveAnalytics

Predicciones de comportamiento usando modelos de machine learning.

### Características

- **Predicciones en Tiempo Real**: Múltiples métricas con valores actuales y predichos
- **Niveles de Confianza**: Indicadores visuales de confianza del modelo
- **Factores de Influencia**: Análisis de variables que afectan las predicciones
- **Gestión de Modelos**: Lista de modelos activos y su rendimiento
- **Reentrenamiento**: Capacidad de reentrenar modelos
- **Métricas de Rendimiento**: Accuracy, precisión, recall, F1-score

### Props

```typescript
interface PredictiveAnalyticsProps {
  userId: string;
  refreshInterval?: number;
  onPredictionUpdate?: (predictions: PredictionData[]) => void;
  onModelRetrain?: (modelId: string) => void;
  onExport?: (format: 'csv' | 'json' | 'pdf') => void;
}
```

### Ejemplo de Uso

```tsx
import { PredictiveAnalytics } from '@/components/analytics';

<PredictiveAnalytics 
  userId="user-123"
  refreshInterval={60000}
  onPredictionUpdate={(predictions) => console.log('Predicciones:', predictions)}
  onModelRetrain={(modelId) => console.log('Reentrenando:', modelId)}
/>
```

### API Endpoints

- `GET /api/analytics/predictions` - Obtener predicciones
- `GET /api/analytics/models` - Obtener modelos activos
- `POST /api/analytics/models/retrain` - Reentrenar modelo

## ABTestingDashboard

Gestión y análisis de experimentos A/B con significancia estadística.

### Características

- **Gestión de Tests**: Crear, pausar, detener y completar experimentos
- **Análisis Estadístico**: Cálculo de significancia estadística y tamaño del efecto
- **Métricas Clave**: Tasas de conversión, tamaños de muestra, intervalos de confianza
- **Visualización de Resultados**: Comparación visual entre variantes
- **Determinación de Ganador**: Identificación automática del mejor resultado
- **Reportes Detallados**: Análisis completo de resultados

### Props

```typescript
interface ABTestingDashboardProps {
  userId: string;
  refreshInterval?: number;
  onTestUpdate?: (tests: ABTest[]) => void;
  onTestAction?: (testId: string, action: 'start' | 'pause' | 'stop' | 'complete') => void;
  onExport?: (format: 'csv' | 'json' | 'pdf') => void;
}
```

### Ejemplo de Uso

```tsx
import { ABTestingDashboard } from '@/components/analytics';

<ABTestingDashboard 
  userId="user-123"
  refreshInterval={30000}
  onTestUpdate={(tests) => console.log('Tests actualizados:', tests)}
  onTestAction={(testId, action) => console.log(`${action} test ${testId}`)}
/>
```

### API Endpoints

- `GET /api/analytics/ab-tests` - Obtener tests A/B
- `POST /api/analytics/ab-tests` - Crear nuevo test
- `PUT /api/analytics/ab-tests/:id/action` - Ejecutar acción en test
- `GET /api/analytics/ab-tests/:id/results` - Obtener resultados

## RealTimeMetrics

Métricas en tiempo real con WebSockets y monitoreo de eventos.

### Características

- **Conexión WebSocket**: Comunicación en tiempo real
- **Métricas Dinámicas**: Actualización automática de valores
- **Log de Eventos**: Registro de eventos con diferentes niveles de severidad
- **Estado de Conexión**: Indicadores de latencia y reconexión
- **Filtros por Categoría**: Filtrado de métricas por tipo
- **Alertas Críticas**: Destacado de eventos importantes

### Props

```typescript
interface RealTimeMetricsProps {
  userId: string;
  refreshInterval?: number;
  onMetricUpdate?: (metrics: RealTimeMetric[]) => void;
  onEventReceived?: (event: any) => void;
  onConnectionStatusChange?: (status: any) => void;
  onExport?: (format: 'csv' | 'json' | 'pdf') => void;
}
```

### Ejemplo de Uso

```tsx
import { RealTimeMetrics } from '@/components/analytics';

<RealTimeMetrics 
  userId="user-123"
  refreshInterval={5000}
  onMetricUpdate={(metrics) => console.log('Métricas:', metrics)}
  onEventReceived={(event) => console.log('Evento:', event)}
  onConnectionStatusChange={(status) => console.log('Estado:', status)}
/>
```

### API Endpoints

- `GET /api/analytics/realtime/metrics` - Obtener métricas actuales
- `GET /api/analytics/realtime/events` - Obtener eventos recientes
- WebSocket: `ws://localhost:3001` - Conexión en tiempo real

## ExportManager

Gestión de exportaciones con plantillas y múltiples formatos.

### Características

- **Múltiples Formatos**: CSV, JSON, PDF, Excel, XML, ZIP
- **Gestión de Trabajos**: Crear, monitorear y descargar exportaciones
- **Plantillas**: Guardar y reutilizar configuraciones de exportación
- **Progreso en Tiempo Real**: Seguimiento del estado de exportación
- **Filtros Avanzados**: Selección granular de datos a exportar
- **Métricas de Exportación**: Estadísticas de trabajos completados

### Props

```typescript
interface ExportManagerProps {
  userId: string;
  refreshInterval?: number;
  onExportComplete?: (job: ExportJob) => void;
  onExportError?: (job: ExportJob, error: string) => void;
  onTemplateSave?: (template: any) => void;
  onTemplateDelete?: (templateId: string) => void;
}
```

### Ejemplo de Uso

```tsx
import { ExportManager } from '@/components/analytics';

<ExportManager 
  userId="user-123"
  refreshInterval={30000}
  onExportComplete={(job) => console.log('Exportación completada:', job)}
  onExportError={(job, error) => console.error('Error:', error, job)}
  onTemplateSave={(template) => console.log('Plantilla guardada:', template)}
/>
```

### API Endpoints

- `GET /api/analytics/exports` - Obtener trabajos de exportación
- `POST /api/analytics/exports` - Crear nuevo trabajo
- `GET /api/analytics/exports/:id/download` - Descargar archivo
- `GET /api/analytics/exports/templates` - Obtener plantillas
- `POST /api/analytics/exports/templates` - Guardar plantilla

## Uso General

### Instalación de Dependencias

```bash
npm install recharts socket.io-client date-fns lodash --legacy-peer-deps
```

### Importación

```tsx
import {
  HeatmapVisualizer,
  PredictiveAnalytics,
  ABTestingDashboard,
  RealTimeMetrics,
  ExportManager,
  // Tipos
  type HeatmapData,
  type PredictionData,
  type ABTest,
  type RealTimeMetric,
  type ExportJob,
  // Enums
  AnalyticsCategory,
  ExportFormat,
  ExportStatus,
  MetricStatus,
  EventSeverity,
  // Utilidades
  formatFileSize,
  getStatusColor,
  getSeverityColor,
  DEFAULT_ANALYTICS_CONFIG
} from '@/components/analytics';
```

### Configuración Global

```tsx
// En tu archivo de configuración
export const ANALYTICS_CONFIG = {
  ...DEFAULT_ANALYTICS_CONFIG,
  refreshInterval: 30000,
  maxRetries: 3,
  timeout: 10000,
  websocketUrl: process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:3001'
};
```

## Configuración

### Variables de Entorno

```env
# WebSocket para métricas en tiempo real
NEXT_PUBLIC_WEBSOCKET_URL=ws://localhost:3001

# API Analytics
NEXT_PUBLIC_ANALYTICS_API_URL=http://localhost:3000/api/analytics

# Configuración de exportaciones
ANALYTICS_EXPORT_MAX_SIZE=100MB
ANALYTICS_EXPORT_TIMEOUT=300000

# Configuración de modelos predictivos
ANALYTICS_MODEL_UPDATE_INTERVAL=3600000
ANALYTICS_PREDICTION_CONFIDENCE_THRESHOLD=0.8
```

### Personalización de Estilos

```css
/* Personalización de colores del heatmap */
.heatmap-cell-high { background-color: #dc2626; }
.heatmap-cell-medium { background-color: #ea580c; }
.heatmap-cell-low { background-color: #fbbf24; }

/* Personalización de estados */
.metric-status-healthy { color: #059669; }
.metric-status-warning { color: #d97706; }
.metric-status-critical { color: #dc2626; }

/* Personalización de exportaciones */
.export-status-completed { background-color: #dcfce7; }
.export-status-processing { background-color: #fef3c7; }
.export-status-failed { background-color: #fee2e2; }
```

## API Endpoints

### Base URL
```
/api/analytics
```

### Endpoints Principales

#### Heatmap
- `GET /heatmap` - Obtener datos del heatmap
- `POST /heatmap/export` - Exportar datos del heatmap

#### Predicciones
- `GET /predictions` - Obtener predicciones
- `GET /models` - Obtener modelos activos
- `POST /models/retrain` - Reentrenar modelo

#### A/B Testing
- `GET /ab-tests` - Obtener tests A/B
- `POST /ab-tests` - Crear nuevo test
- `PUT /ab-tests/:id/action` - Ejecutar acción en test
- `GET /ab-tests/:id/results` - Obtener resultados

#### Tiempo Real
- `GET /realtime/metrics` - Obtener métricas actuales
- `GET /realtime/events` - Obtener eventos recientes

#### Exportaciones
- `GET /exports` - Obtener trabajos de exportación
- `POST /exports` - Crear nuevo trabajo
- `GET /exports/:id/download` - Descargar archivo
- `GET /exports/templates` - Obtener plantillas
- `POST /exports/templates` - Guardar plantilla

### Respuestas de Error

```json
{
  "error": "Error description",
  "code": "ERROR_CODE",
  "timestamp": "2024-01-01T00:00:00Z",
  "details": {
    "field": "additional error details"
  }
}
```

## Mejores Prácticas

### Rendimiento

1. **Intervalos de Actualización**: Usar intervalos apropiados para cada componente
2. **Lazy Loading**: Cargar componentes solo cuando sean necesarios
3. **Memoización**: Usar `useMemo` y `useCallback` para optimizar re-renders
4. **WebSocket Management**: Manejar correctamente la conexión y reconexión

### Accesibilidad

1. **Navegación por Teclado**: Todos los elementos interactivos deben ser navegables
2. **ARIA Labels**: Proporcionar etiquetas descriptivas
3. **Contraste de Colores**: Mantener ratios de contraste adecuados
4. **Tooltips**: Información adicional para elementos complejos

### Seguridad

1. **Validación de Datos**: Validar todas las entradas del usuario
2. **Sanitización**: Limpiar datos antes de mostrarlos
3. **Autenticación**: Verificar permisos antes de acceder a datos
4. **Rate Limiting**: Implementar límites de velocidad en APIs

### Testing

```tsx
// Ejemplo de test para HeatmapVisualizer
import { render, screen } from '@testing-library/react';
import { HeatmapVisualizer } from '@/components/analytics';

test('renders heatmap with data', () => {
  render(<HeatmapVisualizer userId="test-user" />);
  expect(screen.getByText('Visualizador de Heatmap')).toBeInTheDocument();
});
```

## Troubleshooting

### Problemas Comunes

1. **WebSocket no conecta**: Verificar URL y configuración de CORS
2. **Datos no se actualizan**: Revisar intervalos de refresh y permisos
3. **Exportaciones fallan**: Verificar límites de tamaño y permisos de archivo
4. **Predicciones incorrectas**: Verificar estado de modelos y datos de entrenamiento

### Logs de Debug

```typescript
// Habilitar logs de debug
const DEBUG_ANALYTICS = process.env.NODE_ENV === 'development';

if (DEBUG_ANALYTICS) {
  console.log('Analytics Debug:', {
    component: 'HeatmapVisualizer',
    action: 'data_update',
    data: heatmapData
  });
}
```

## Contribución

Para contribuir a los componentes de analytics:

1. Seguir las convenciones de código establecidas
2. Agregar tests para nuevas funcionalidades
3. Actualizar documentación
4. Verificar accesibilidad
5. Probar en diferentes navegadores

## Licencia

Este código es parte del proyecto Inclusive AI Coach y está sujeto a los términos de licencia del proyecto.
