# Hooks de Gamificación y Analytics

Este documento describe todos los hooks personalizados implementados para el sistema de gamificación y analytics de InclusiveAI Coach.

## Índice

- [Hooks de Gamificación](#hooks-de-gamificación)
  - [useCompetition](#usecompetition)
  - [useClan](#useclan)
  - [useEvents](#useevents)
  - [useTrading](#usetrading)
  - [usePersonalization](#usepersonalization)
- [Hooks de Analytics](#hooks-de-analytics)
  - [useHeatmap](#useheatmap)
  - [usePredictions](#usepredictions)
  - [useABTesting](#useabtesting)
  - [useRealTimeMetrics](#userealtimemetrics)
  - [useExportManager](#useexportmanager)

## Hooks de Gamificación

### useCompetition

Hook para manejar competencias y leaderboards.

**Ubicación:** `lib/hooks/useCompetition.ts`

**Funcionalidades:**
- Gestionar competencias activas
- Unirse/salir de competencias
- Actualizar puntuaciones
- Obtener leaderboards
- Verificar estado de competencias

**Interfaces principales:**
```typescript
interface Competition {
  id: string;
  name: string;
  description: string;
  type: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'SPECIAL';
  startDate: Date;
  endDate: Date;
  status: 'UPCOMING' | 'ACTIVE' | 'FINISHED' | 'CANCELLED';
  rewards: CompetitionRewards;
  participants: CompetitionParticipant[];
  leaderboard: LeaderboardEntry[];
}
```

**Ejemplo de uso:**
```typescript
const {
  competitions,
  userParticipations,
  leaderboards,
  joinCompetition,
  updateScore,
  getLeaderboard
} = useCompetition();

// Unirse a una competencia
await joinCompetition('competition_id');

// Actualizar puntuación
await updateScore('competition_id', 150);
```

### useClan

Hook para manejar clanes y actividades grupales.

**Ubicación:** `lib/hooks/useClan.ts`

**Funcionalidades:**
- Crear y gestionar clanes
- Invitar miembros
- Declarar guerras entre clanes
- Gestionar actividades del clan
- Verificar roles y permisos

**Interfaces principales:**
```typescript
interface Clan {
  id: string;
  name: string;
  description: string;
  tag: string;
  level: number;
  experience: number;
  maxMembers: number;
  members: ClanMember[];
  activities: ClanActivity[];
  wars: ClanWar[];
}
```

**Ejemplo de uso:**
```typescript
const {
  userClan,
  availableClans,
  createClan,
  joinClan,
  inviteMember
} = useClan();

// Crear un clan
await createClan({
  name: 'Mi Clan',
  description: 'Un clan para aprender juntos',
  tag: 'MC',
  maxMembers: 50
});
```

### useEvents

Hook para manejar eventos gamificados.

**Ubicación:** `lib/hooks/useEvents.ts`

**Funcionalidades:**
- Crear y gestionar eventos
- Manejar notificaciones
- Reclamar recompensas
- Obtener estadísticas de eventos
- Filtrar eventos por tipo

**Interfaces principales:**
```typescript
interface GamificationEvent {
  id: string;
  name: string;
  description: string;
  type: 'LEARNING' | 'SOCIAL' | 'CHALLENGE' | 'SPECIAL';
  startDate: Date;
  endDate: Date;
  status: 'UPCOMING' | 'ACTIVE' | 'FINISHED';
  rewards: EventReward;
  participants: string[];
  notifications: EventNotification[];
}
```

**Ejemplo de uso:**
```typescript
const {
  events,
  notifications,
  rewards,
  createEvent,
  claimReward
} = useEvents();

// Crear un evento
await createEvent({
  name: 'Evento de Aprendizaje',
  description: 'Un evento especial para aprender',
  type: 'LEARNING',
  startDate: new Date(),
  endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  rewards: {
    points: 100,
    experience: 50,
    badges: ['event_participant']
  }
});
```

### useTrading

Hook para manejar el sistema de intercambio.

**Ubicación:** `lib/hooks/useTrading.ts`

**Funcionalidades:**
- Gestionar inventario del usuario
- Crear y comprar ofertas
- Manejar transacciones
- Calcular reputación
- Obtener estadísticas de trading

**Interfaces principales:**
```typescript
interface TradeOffer {
  id: string;
  itemId: string;
  quantity: number;
  price: number;
  type: 'BUY' | 'SELL';
  sellerId: string;
  buyerId?: string;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  expiresAt: Date;
  createdAt: Date;
}
```

**Ejemplo de uso:**
```typescript
const {
  userInventory,
  availableOffers,
  createOffer,
  buyOffer
} = useTrading();

// Crear una oferta de venta
await createOffer({
  itemId: 'item_1',
  quantity: 5,
  price: 100,
  type: 'SELL',
  expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
});
```

### usePersonalization

Hook para manejar personalización del usuario.

**Ubicación:** `lib/hooks/usePersonalization.ts`

**Funcionalidades:**
- Gestionar preferencias del usuario
- Adaptación cultural
- Temas y estilos
- Características de accesibilidad
- Estadísticas de personalización

**Interfaces principales:**
```typescript
interface UserPreferences {
  learningStyle: 'VISUAL' | 'AUDITORY' | 'KINESTHETIC' | 'READING';
  difficultyLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  accessibilityFeatures: {
    screenReader: boolean;
    highContrast: boolean;
    largeText: boolean;
    voiceNavigation: boolean;
  };
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
}
```

**Ejemplo de uso:**
```typescript
const {
  userPreferences,
  culturalAdaptation,
  updatePreferences,
  setTheme
} = usePersonalization();

// Actualizar preferencias
await updatePreferences({
  learningStyle: 'VISUAL',
  difficultyLevel: 'INTERMEDIATE',
  accessibilityFeatures: {
    screenReader: true,
    highContrast: false,
    largeText: false,
    voiceNavigation: true
  }
});
```

## Hooks de Analytics

### useHeatmap

Hook para manejar heatmaps y tracking de interacciones.

**Ubicación:** `lib/hooks/useHeatmap.ts`

**Funcionalidades:**
- Crear configuraciones de heatmap
- Iniciar y detener tracking
- Registrar clics y interacciones
- Exportar datos de heatmap
- Obtener hotspots y estadísticas

**Interfaces principales:**
```typescript
interface HeatmapData {
  id: string;
  page: string;
  sessionId: string;
  clicks: HeatmapClick[];
  scrolls: HeatmapScroll[];
  hovers: HeatmapHover[];
  timestamp: Date;
  metadata: {
    userAgent: string;
    screenResolution: string;
    viewport: string;
  };
}
```

**Ejemplo de uso:**
```typescript
const {
  heatmapData,
  configurations,
  startTracking,
  recordClick
} = useHeatmap();

// Iniciar tracking
await startTracking('homepage');

// Registrar un clic
await recordClick({
  x: 100,
  y: 200,
  element: 'button',
  page: 'homepage'
});
```

### usePredictions

Hook para manejar predicciones y análisis predictivo.

**Ubicación:** `lib/hooks/usePredictions.ts`

**Funcionalidades:**
- Crear y entrenar modelos de predicción
- Realizar predicciones
- Generar insights
- Gestionar configuraciones
- Obtener estadísticas de precisión

**Interfaces principales:**
```typescript
interface PredictionModel {
  id: string;
  name: string;
  description: string;
  type: 'CLASSIFICATION' | 'REGRESSION' | 'CLUSTERING';
  algorithm: string;
  accuracy: number;
  status: 'TRAINING' | 'ACTIVE' | 'INACTIVE';
  features: string[];
  hyperparameters: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}
```

**Ejemplo de uso:**
```typescript
const {
  predictionModels,
  predictions,
  createModel,
  makePrediction
} = usePredictions();

// Crear un modelo
await createModel({
  name: 'Modelo de Engagement',
  description: 'Predice el engagement del usuario',
  type: 'REGRESSION',
  algorithm: 'random_forest',
  features: ['time_spent', 'lessons_completed', 'assessments_passed']
});

// Hacer una predicción
const prediction = await makePrediction('user_engagement', {
  userId: 'user_123',
  learningHistory: ['lesson_1', 'lesson_2'],
  timeSpent: 120
});
```

### useABTesting

Hook para manejar pruebas A/B.

**Ubicación:** `lib/hooks/useABTesting.ts`

**Funcionalidades:**
- Crear y gestionar experimentos
- Asignar variantes a usuarios
- Registrar resultados
- Calcular estadísticas
- Determinar significancia estadística

**Interfaces principales:**
```typescript
interface ABExperiment {
  id: string;
  name: string;
  description: string;
  hypothesis: string;
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED';
  variants: ABVariant[];
  metrics: string[];
  targetAudience: string;
  trafficAllocation: number;
  startDate: Date;
  endDate?: Date;
}
```

**Ejemplo de uso:**
```typescript
const {
  experiments,
  results,
  createExperiment,
  recordResult
} = useABTesting();

// Crear un experimento
await createExperiment({
  name: 'Test de Interfaz',
  description: 'Probando nueva interfaz de usuario',
  hypothesis: 'La nueva interfaz mejora la retención',
  variants: [
    { name: 'Control', description: 'Interfaz actual' },
    { name: 'Variante A', description: 'Nueva interfaz' }
  ],
  metrics: ['retention_rate', 'time_on_page'],
  targetAudience: 'all_users'
});

// Registrar un resultado
await recordResult('experiment_id', 'variant_a', {
  metric: 'retention_rate',
  value: 0.75,
  userId: 'user_123'
});
```

### useRealTimeMetrics

Hook para manejar métricas en tiempo real.

**Ubicación:** `lib/hooks/useRealTimeMetrics.ts`

**Funcionalidades:**
- Suscribirse a métricas en tiempo real
- Actualizar métricas
- Gestionar alertas
- Crear dashboards
- Manejar conexiones WebSocket

**Interfaces principales:**
```typescript
interface RealTimeMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  category: 'USER' | 'SYSTEM' | 'BUSINESS' | 'CUSTOM';
  timestamp: Date;
  change: {
    value: number;
    percentage: number;
    direction: 'UP' | 'DOWN' | 'STABLE';
  };
  metadata: {
    source: string;
    confidence: number;
    lastUpdated: Date;
  };
}
```

**Ejemplo de uso:**
```typescript
const {
  metrics,
  alerts,
  dashboards,
  subscribeToMetric,
  updateMetric
} = useRealTimeMetrics();

// Suscribirse a una métrica
await subscribeToMetric('active_users');

// Actualizar una métrica
await updateMetric('active_users', 150);
```

### useExportManager

Hook para manejar exportaciones de datos.

**Ubicación:** `lib/hooks/useExportManager.ts`

**Funcionalidades:**
- Crear trabajos de exportación
- Gestionar plantillas
- Programar exportaciones
- Descargar archivos
- Validar datos exportados

**Interfaces principales:**
```typescript
interface ExportJob {
  id: string;
  name: string;
  description: string;
  type: 'ANALYTICS' | 'USER_DATA' | 'GAMIFICATION' | 'CUSTOM';
  format: 'CSV' | 'JSON' | 'EXCEL' | 'PDF' | 'XML';
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  progress: number;
  filters: {
    dateRange: { start: Date; end: Date };
    userSegments: string[];
    dataTypes: string[];
    customFilters: Record<string, any>;
  };
  output: {
    fileUrl?: string;
    fileSize?: number;
    recordCount?: number;
    expiresAt?: Date;
  };
}
```

**Ejemplo de uso:**
```typescript
const {
  jobs,
  templates,
  createExportJob,
  downloadExport
} = useExportManager();

// Crear un trabajo de exportación
await createExportJob({
  name: 'Reporte de Usuarios',
  description: 'Exportación de datos de usuarios',
  type: 'USER_DATA',
  format: 'CSV',
  filters: {
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      end: new Date()
    },
    userSegments: ['active_users'],
    dataTypes: ['profile', 'activity'],
    customFilters: {}
  }
});

// Descargar exportación
await downloadExport('job_id');
```

## Uso General

### Importación

```typescript
import {
  // Hooks de Gamificación
  useCompetition,
  useClan,
  useEvents,
  useTrading,
  usePersonalization,
  
  // Hooks de Analytics
  useHeatmap,
  usePredictions,
  useABTesting,
  useRealTimeMetrics,
  useExportManager
} from '../lib/hooks';
```

### Ejemplo Completo

```typescript
const MyComponent = () => {
  // Hooks de gamificación
  const { competitions, joinCompetition } = useCompetition();
  const { userClan, createClan } = useClan();
  const { events, createEvent } = useEvents();
  
  // Hooks de analytics
  const { startTracking, recordClick } = useHeatmap();
  const { makePrediction } = usePredictions();
  const { createExperiment } = useABTesting();
  
  const handleUserAction = async () => {
    // Unirse a una competencia
    await joinCompetition('competition_id');
    
    // Registrar interacción
    await recordClick({ x: 100, y: 200, element: 'button' });
    
    // Hacer predicción
    const prediction = await makePrediction('user_engagement', {
      userId: 'user_123',
      action: 'button_click'
    });
  };
  
  return (
    <div>
      {/* Componente UI */}
    </div>
  );
};
```

## Consideraciones de Rendimiento

1. **Memoización:** Todos los hooks utilizan `useCallback` para optimizar las funciones.
2. **Estado Local:** Se mantiene estado local para evitar re-renders innecesarios.
3. **Carga Lazy:** Los datos se cargan solo cuando son necesarios.
4. **WebSocket:** Para métricas en tiempo real se usa WebSocket para actualizaciones eficientes.

## Manejo de Errores

Todos los hooks incluyen:
- Estado de error (`error`)
- Estado de carga (`loading`)
- Manejo de excepciones con try-catch
- Mensajes de error descriptivos

## Dependencias

Los hooks dependen de:
- `useAuth` - Para autenticación de usuarios
- `GamificationService` - Para lógica de gamificación
- `AnalyticsService` - Para lógica de analytics
- `React` - Para hooks básicos (useState, useEffect, useCallback)

## Próximos Pasos

1. Implementar métodos faltantes en `AnalyticsService`
2. Agregar tests unitarios para cada hook
3. Optimizar rendimiento con React.memo
4. Agregar documentación de TypeScript
5. Implementar cache con React Query
