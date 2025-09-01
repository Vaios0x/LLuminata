# Documentación de Componentes de Gamificación

## Descripción General

El sistema de gamificación de InclusiveAI Coach proporciona una experiencia de aprendizaje interactiva y motivadora a través de elementos de juego como niveles, badges, logros, competencias y sistemas de recompensas.

## Componentes Principales

### 1. GamificationDashboard

**Archivo:** `components/gamification/gamification-dashboard.tsx`

**Descripción:** Dashboard principal que muestra toda la información de gamificación del usuario.

**Props:**
- `userId: string` - ID del usuario

**Características:**
- Visualización de nivel actual y progreso
- Lista de badges y logros obtenidos
- Estadísticas de rendimiento
- Competencias activas
- Sistema de recompensas

**Ejemplo de uso:**
```tsx
import { GamificationDashboard } from '@/components/gamification/gamification-dashboard';

<GamificationDashboard userId="user123" />
```

### 2. CompetitionBoard

**Archivo:** `components/gamification/CompetitionBoard.tsx`

**Descripción:** Tablero de competencias que muestra desafíos activos y permite participación.

**Props:**
- `userId: string` - ID del usuario
- `competitions: Competition[]` - Lista de competencias

**Características:**
- Lista de competencias activas
- Información de participantes
- Fechas de inicio y fin
- Estados de participación

### 3. ClanSystem

**Archivo:** `components/gamification/ClanSystem.tsx`

**Descripción:** Sistema de clanes para fomentar colaboración entre estudiantes.

**Props:**
- `userId: string` - ID del usuario
- `clanId?: string` - ID del clan (opcional)

**Características:**
- Creación y gestión de clanes
- Jerarquía de miembros
- Actividades colaborativas
- Recompensas grupales

### 4. EventCalendar

**Archivo:** `components/gamification/EventCalendar.tsx`

**Descripción:** Calendario de eventos y actividades especiales.

**Props:**
- `userId: string` - ID del usuario
- `events: Event[]` - Lista de eventos

**Características:**
- Vista de calendario mensual
- Eventos especiales
- Recordatorios
- Participación en eventos

### 5. TradingSystem

**Archivo:** `components/gamification/TradingSystem.tsx`

**Descripción:** Sistema de intercambio de recompensas entre usuarios.

**Props:**
- `userId: string` - ID del usuario
- `tradingEnabled: boolean` - Estado del sistema de trading

**Características:**
- Intercambio de badges
- Mercado de recompensas
- Sistema de ofertas
- Historial de transacciones

### 6. PersonalizationHub

**Archivo:** `components/gamification/PersonalizationHub.tsx`

**Descripción:** Centro de personalización de la experiencia de gamificación.

**Props:**
- `userId: string` - ID del usuario

**Características:**
- Personalización de avatar
- Configuración de notificaciones
- Preferencias de gamificación
- Temas visuales

### 7. GamificationNotification

**Archivo:** `components/gamification/gamification-notification.tsx`

**Descripción:** Sistema de notificaciones para eventos de gamificación.

**Props:**
- `notification: Notification` - Objeto de notificación
- `onDismiss: () => void` - Función de cierre

**Características:**
- Notificaciones de logros
- Alertas de competencias
- Recordatorios de eventos
- Animaciones de celebración

## Interfaces de Datos

### GamificationData
```typescript
interface GamificationData {
  level: {
    level: number;
    experience: number;
    points: number;
    title: string;
  };
  badges: Array<{
    id: string;
    badge: {
      name: string;
      description: string;
      icon: string;
      category: string;
      rarity: string;
      points: number;
    };
    earnedAt: string;
    progress: number;
  }>;
  achievements: Array<{
    id: string;
    achievement: {
      name: string;
      description: string;
      icon: string;
      category: string;
      points: number;
    };
    earnedAt: string;
    progress: number;
  }>;
  rewards: Array<{
    id: string;
    reward: {
      name: string;
      description: string;
      type: string;
      value: number;
      icon?: string;
    };
    earnedAt: string;
    claimedAt?: string;
  }>;
  stats: {
    lessons_completed: number;
    assessments_passed: number;
    cultural_activities: number;
    help_others: number;
    perfect_scores: number;
    study_streak: number;
    languages_learned: number;
    students_helped: number;
  };
}
```

### Competition
```typescript
interface Competition {
  id: string;
  name: string;
  description: string;
  type: string;
  startDate: string;
  endDate: string;
  status: string;
  _count: {
    participants: number;
  };
}
```

## Hooks Relacionados

### useGamification
**Archivo:** `lib/hooks/useGamification.ts`

**Funcionalidades:**
- Carga de datos de gamificación
- Actualización de progreso
- Gestión de recompensas
- Sincronización con servidor

### useTrading
**Archivo:** `lib/hooks/useTrading.ts`

**Funcionalidades:**
- Gestión de transacciones
- Creación de ofertas
- Aceptación de intercambios
- Historial de trading

### useEvents
**Archivo:** `lib/hooks/useEvents.ts`

**Funcionalidades:**
- Gestión de eventos
- Participación en actividades
- Recordatorios
- Calendario de eventos

### useClan
**Archivo:** `lib/hooks/useClan.ts`

**Funcionalidades:**
- Gestión de clanes
- Invitaciones
- Actividades grupales
- Jerarquía de miembros

### useCompetition
**Archivo:** `lib/hooks/useCompetition.ts`

**Funcionalidades:**
- Participación en competencias
- Seguimiento de rankings
- Premios y recompensas
- Estados de competencia

## APIs Relacionadas

### /api/gamification/user-data
- **GET:** Obtener datos de gamificación del usuario
- **POST:** Actualizar progreso del usuario

### /api/gamification/competitions
- **GET:** Listar competencias activas
- **POST:** Participar en competencia

### /api/gamification/clans
- **GET:** Obtener información de clanes
- **POST:** Crear o unirse a clan

### /api/gamification/trading
- **GET:** Obtener ofertas disponibles
- **POST:** Crear oferta de intercambio

### /api/gamification/events
- **GET:** Listar eventos próximos
- **POST:** Participar en evento

## Configuración

### Variables de Entorno
```env
# Configuración de gamificación
GAMIFICATION_ENABLED=true
GAMIFICATION_API_URL=http://localhost:3000/api/gamification
GAMIFICATION_WEBSOCKET_URL=ws://localhost:3000/ws/gamification

# Configuración de recompensas
REWARDS_ENABLED=true
TRADING_ENABLED=true
CLAN_SYSTEM_ENABLED=true

# Configuración de eventos
EVENTS_ENABLED=true
EVENTS_NOTIFICATION_ENABLED=true
```

### Configuración en Base de Datos
```sql
-- Tabla de niveles
CREATE TABLE gamification_levels (
  id SERIAL PRIMARY KEY,
  level INTEGER NOT NULL,
  experience_required INTEGER NOT NULL,
  title VARCHAR(100) NOT NULL,
  rewards JSONB
);

-- Tabla de badges
CREATE TABLE gamification_badges (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  category VARCHAR(50),
  rarity VARCHAR(20),
  points INTEGER DEFAULT 0
);

-- Tabla de logros
CREATE TABLE gamification_achievements (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  category VARCHAR(50),
  points INTEGER DEFAULT 0,
  requirements JSONB
);
```

## Mejores Prácticas

### 1. Rendimiento
- Implementar lazy loading para componentes pesados
- Usar React.memo para optimizar re-renders
- Implementar virtualización para listas largas
- Cachear datos de gamificación

### 2. Accesibilidad
- Proporcionar textos alternativos para iconos
- Usar ARIA labels para elementos interactivos
- Asegurar navegación por teclado
- Implementar modo de alto contraste

### 3. UX/UI
- Mostrar feedback inmediato para acciones
- Implementar animaciones suaves
- Usar colores consistentes con el tema
- Proporcionar tooltips informativos

### 4. Seguridad
- Validar todas las entradas del usuario
- Implementar rate limiting para APIs
- Sanitizar datos antes de mostrar
- Verificar permisos de usuario

## Testing

### Tests Unitarios
```typescript
// Ejemplo de test para GamificationDashboard
describe('GamificationDashboard', () => {
  it('renderiza correctamente con datos de gamificación', async () => {
    // Test implementation
  });

  it('maneja errores de carga correctamente', async () => {
    // Test implementation
  });
});
```

### Tests de Integración
```typescript
// Ejemplo de test de integración
describe('Gamification Integration', () => {
  it('sincroniza datos con el servidor', async () => {
    // Test implementation
  });
});
```

## Troubleshooting

### Problemas Comunes

1. **Datos no se cargan**
   - Verificar conexión a API
   - Revisar permisos de usuario
   - Comprobar formato de respuesta

2. **Notificaciones no aparecen**
   - Verificar configuración de notificaciones
   - Comprobar permisos del navegador
   - Revisar logs de errores

3. **Progreso no se actualiza**
   - Verificar sincronización con servidor
   - Comprobar estado de conexión
   - Revisar validaciones de datos

### Logs de Debug
```typescript
// Habilitar logs de debug
const DEBUG_GAMIFICATION = process.env.NODE_ENV === 'development';

if (DEBUG_GAMIFICATION) {
  console.log('Gamification data:', gamificationData);
  console.log('User progress:', userProgress);
}
```

## Recursos Adicionales

- [Documentación de Gamificación General](../GAMIFICATION.md)
- [Guía de Configuración de Gamificación](../guides/gamification-setup.md)
- [API de Gamificación](../AI-APIS.md#gamification)
- [Componentes UI](../UI-COMPONENTS-GUIDE.md)
