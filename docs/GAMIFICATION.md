# Sistema de Gamificación - InclusiveAI Coach

## Resumen

El sistema de gamificación de InclusiveAI Coach está diseñado para motivar y recompensar a los estudiantes por su participación en actividades educativas, especialmente enfocado en el aprendizaje de culturas indígenas y la inclusión educativa.

## Características Principales

### 🏆 Badges y Logros
- **Badges**: Coleccionables por completar diferentes tipos de actividades
- **Logros**: Desbloqueables por alcanzar metas específicas
- **Rarezas**: Común, Poco Común, Raro, Épico, Legendario
- **Categorías**: Aprendizaje, Cultural, Social, Técnico, Hitos

### 📊 Puntos y Niveles
- **Sistema de Puntos**: Basado en la calidad y cantidad de actividades
- **Niveles**: 10 niveles con títulos progresivos
- **Experiencia**: Acumulable para subir de nivel
- **Títulos**: Estudiante → Aprendiz → Avanzado → Dedicado → Experto → Maestro → Gran Maestro → Leyenda → Inmortal

### 🏁 Competencias
- **Tipos**: Académicas, Culturales, Creativas, Colaborativas, Individuales
- **Leaderboards**: Rankings en tiempo real
- **Recompensas**: Puntos, badges, títulos, características especiales
- **Participación**: Límites configurables y criterios de elegibilidad

### 🎁 Recompensas
- **Puntos**: Moneda principal del sistema
- **Badges**: Coleccionables con diferentes rarezas
- **Títulos**: Mostrados en perfil y competencias
- **Características**: Desbloqueo de funcionalidades especiales
- **Contenido**: Acceso a material exclusivo

## Arquitectura del Sistema

### Base de Datos

```sql
-- Tablas principales
badges              -- Badges disponibles
user_badges         -- Badges ganados por usuarios
achievements        -- Logros disponibles
user_achievements   -- Logros desbloqueados por usuarios
user_levels         -- Niveles y experiencia de usuarios
competitions        -- Competencias activas
competition_participants -- Participantes en competencias
leaderboard_entries -- Rankings de competencias
rewards             -- Recompensas disponibles
user_rewards        -- Recompensas ganadas por usuarios
gamification_events -- Historial de eventos de gamificación
```

### Servicios

#### `GamificationService`
- Gestión centralizada de eventos
- Cálculo automático de puntos
- Verificación de criterios para badges/logros
- Gestión de niveles y experiencia
- Manejo de competencias y leaderboards

#### `useGamification` Hook
- Integración con actividades existentes
- Registro automático de eventos
- Cálculo de puntos por tipo de actividad
- Gestión de rachas y estadísticas

### APIs

#### `/api/gamification`
- `POST /api/gamification` - Registrar eventos, crear competencias
- `GET /api/gamification?action=user_data&userId=X` - Datos del usuario
- `GET /api/gamification?action=active_competitions` - Competencias activas
- `GET /api/gamification?action=leaderboard&competitionId=X` - Leaderboard

## Tipos de Eventos

### Eventos de Aprendizaje
- `LESSON_COMPLETED` - Finalización de lección
- `ASSESSMENT_PASSED` - Evaluación aprobada
- `PERFECT_SCORE` - Puntuación perfecta (100%)

### Eventos Culturales
- `CULTURAL_ACTIVITY` - Participación en actividades culturales
- `LANGUAGE_LEARNED` - Aprendizaje de nuevo idioma

### Eventos Sociales
- `HELP_OTHERS` - Ayuda a otros estudiantes
- `SOCIAL_INTERACTION` - Interacciones grupales
- `COLLABORATION` - Trabajo colaborativo

### Eventos de Progreso
- `FIRST_TIME_ACTIVITY` - Actividad realizada por primera vez
- `STREAK_MAINTAINED` - Mantenimiento de racha
- `LEVEL_UP` - Subida de nivel
- `COMPETITION_WON` - Victoria en competencia

## Sistema de Puntos

### Cálculo de Puntos por Actividad

#### Lecciones (10-50 puntos)
```typescript
function calculateLessonPoints(score: number, timeSpent: number): number {
  let points = Math.floor((score / 100) * 40) + 10;
  
  // Bonus por eficiencia (< 10 minutos)
  if (timeSpent < 600) points += 10;
  
  // Bonus por alta puntuación (≥ 90%)
  if (score >= 90) points += 20;
  
  return points;
}
```

#### Evaluaciones (20-100 puntos)
```typescript
function calculateAssessmentPoints(score: number, questionsAnswered: number, timeSpent: number): number {
  let points = Math.floor((score / 100) * 80) + 20;
  
  // Bonus por responder todas las preguntas
  if (questionsAnswered > 0) {
    points += Math.floor((questionsAnswered / 10) * 10);
  }
  
  // Bonus por eficiencia (< 15 minutos)
  if (timeSpent < 900) points += 15;
  
  return points;
}
```

#### Actividades Culturales (15-40 puntos)
```typescript
function calculateCulturalActivityPoints(activityType: string, duration: number): number {
  const basePoints = {
    story: 20,
    music: 25,
    dance: 30,
    craft: 35,
    language: 40
  }[activityType] || 15;
  
  // Bonus por engagement prolongado (> 30 minutos)
  if (duration > 1800) return basePoints + 20;
  
  return basePoints;
}
```

#### Ayuda a Otros (10-35 puntos)
```typescript
function calculateHelpPoints(helpType: string, duration: number): number {
  const basePoints = {
    explanation: 15,
    tutoring: 25,
    mentoring: 35,
    collaboration: 20
  }[helpType] || 10;
  
  // Bonus por sesiones largas (> 15 minutos)
  if (duration > 900) return basePoints + 15;
  
  return basePoints;
}
```

## Sistema de Niveles

### Configuración de Niveles

```typescript
const levelConfigs = [
  { level: 1, experienceRequired: 0, title: "Estudiante", rewards: [] },
  { level: 2, experienceRequired: 100, title: "Aprendiz", rewards: ["badge_beginner"] },
  { level: 3, experienceRequired: 250, title: "Estudiante Avanzado", rewards: ["badge_consistent"] },
  { level: 4, experienceRequired: 500, title: "Estudiante Dedicado", rewards: ["badge_dedicated"] },
  { level: 5, experienceRequired: 1000, title: "Estudiante Experto", rewards: ["badge_expert"] },
  { level: 6, experienceRequired: 2000, title: "Maestro Aprendiz", rewards: ["badge_master"] },
  { level: 7, experienceRequired: 3500, title: "Maestro", rewards: ["badge_grandmaster"] },
  { level: 8, experienceRequired: 5000, title: "Gran Maestro", rewards: ["badge_legendary"] },
  { level: 9, experienceRequired: 7500, title: "Leyenda", rewards: ["badge_mythical"] },
  { level: 10, experienceRequired: 10000, title: "Inmortal", rewards: ["badge_immortal"] }
];
```

## Badges Disponibles

### Badges de Aprendizaje
- **Primer Paso** (Común) - Completar primera lección
- **Estudiante Consistente** (Poco Común) - Completar 10 lecciones
- **Perfeccionista** (Épico) - Obtener 100% en 5 evaluaciones

### Badges Culturales
- **Explorador Cultural** (Raro) - Participar en 5 actividades culturales
- **Políglota** (Épico) - Aprender en 3 idiomas diferentes

### Badges Sociales
- **Ayudante** (Poco Común) - Ayudar a otros 10 veces
- **Mentor** (Épico) - Ayudar a 20 estudiantes diferentes

### Badges de Persistencia
- **Racha de 7 días** (Raro) - Estudiar 7 días consecutivos

## Logros Disponibles

### Logros Académicos
- **Políglota** - Aprender en 3 idiomas diferentes
- **Perfeccionista** - Obtener 100% en múltiples evaluaciones

### Logros Sociales
- **Mentor** - Ayudar a 20 estudiantes diferentes
- **Colaborador** - Participar en 10 actividades grupales

### Logros de Persistencia
- **Racha de 7 días** - Estudiar 7 días consecutivos
- **Racha de 30 días** - Estudiar 30 días consecutivos

## Competencias

### Tipos de Competencias

#### Académicas
- Desafíos matemáticos
- Concursos de conocimiento
- Evaluaciones especiales

#### Culturales
- Festivales culturales
- Concursos de arte indígena
- Desafíos de idiomas

#### Creativas
- Creación de contenido
- Proyectos artísticos
- Innovación educativa

#### Colaborativas
- Trabajo en equipo
- Ayuda mutua
- Proyectos comunitarios

### Estructura de Recompensas

```typescript
interface CompetitionRewards {
  firstPlace: RewardConfig;    // 1er lugar
  secondPlace: RewardConfig;   // 2do lugar
  thirdPlace: RewardConfig;    // 3er lugar
  participation: RewardConfig; // Participación
}
```

## Integración con Actividades Existentes

### Hook `useGamification`

```typescript
const {
  recordLessonCompletion,
  recordAssessmentPass,
  recordCulturalActivity,
  recordHelpOthers,
  recordSocialInteraction,
  recordFirstTimeActivity,
  recordStreakMaintained,
  recordCompetitionWin,
  getUserGamificationData,
  joinCompetition,
  updateCompetitionScore
} = useGamification(userId);
```

### Ejemplo de Uso

```typescript
// Al completar una lección
const result = await recordLessonCompletion(
  lessonId,
  score,
  timeSpent,
  language
);

if (result.success) {
  console.log(`¡Ganaste ${result.points} puntos!`);
}

// Al aprobar una evaluación
const assessmentResult = await recordAssessmentPass(
  assessmentId,
  score,
  questionsAnswered,
  timeSpent
);

// Al participar en actividad cultural
const culturalResult = await recordCulturalActivity(
  activityId,
  activityType,
  culture,
  duration
);
```

## Componentes de UI

### `GamificationDashboard`
- Dashboard principal con estadísticas
- Visualización de nivel y progreso
- Lista de badges y logros
- Competencias activas
- Recompensas disponibles

### `GamificationNotification`
- Notificaciones en tiempo real
- Toasts para eventos importantes
- Sistema de notificaciones persistente

### `GamificationToast`
- Toasts temporales para eventos
- Animaciones y efectos visuales
- Auto-dismiss configurable

## Configuración y Personalización

### Variables de Entorno

```env
# Configuración de gamificación
GAMIFICATION_ENABLED=true
GAMIFICATION_POINTS_MULTIPLIER=1.0
GAMIFICATION_LEVEL_EXPONENT=1.5
GAMIFICATION_MAX_LEVEL=10
GAMIFICATION_COMPETITION_MAX_PARTICIPANTS=100
```

### Configuración de Badges

```typescript
interface BadgeConfig {
  name: string;
  description: string;
  icon: string;
  category: BadgeCategory;
  rarity: BadgeRarity;
  points: number;
  criteria: BadgeCriteria;
}
```

### Configuración de Competencias

```typescript
interface CompetitionConfig {
  name: string;
  description: string;
  type: CompetitionType;
  startDate: Date;
  endDate: Date;
  maxParticipants?: number;
  rewards: CompetitionRewards;
  criteria: CompetitionCriteria;
}
```

## Monitoreo y Analytics

### Métricas Clave
- **Engagement**: Tiempo promedio de sesión
- **Retención**: Usuarios que regresan
- **Progresión**: Tasa de subida de nivel
- **Participación**: Porcentaje en competencias
- **Satisfacción**: Badges y logros ganados

### Eventos Trackeados
- Completación de lecciones
- Aprobación de evaluaciones
- Participación en actividades culturales
- Ayuda a otros estudiantes
- Unión a competencias
- Ganancia de badges/logros

## Seguridad y Validación

### Validación de Eventos
- Verificación de autenticación
- Validación de datos de entrada
- Prevención de duplicados
- Rate limiting para eventos

### Auditoría
- Log de todos los eventos
- Tracking de cambios de puntos
- Historial de competencias
- Registro de recompensas

## Optimización y Rendimiento

### Caché
- Datos de usuario en Redis
- Estadísticas calculadas
- Leaderboards en tiempo real
- Badges y logros disponibles

### Lazy Loading
- Carga progresiva de datos
- Paginación de historial
- Optimización de imágenes
- Compresión de respuestas

## Próximas Características

### Funcionalidades Planificadas
- **Sistema de Clanes**: Grupos de estudiantes
- **Eventos Temporales**: Competencias especiales
- **Sistema de Trading**: Intercambio de badges
- **Personalización Avanzada**: Temas y avatares
- **Integración Social**: Compartir logros
- **Analytics Avanzados**: Insights detallados

### Mejoras Técnicas
- **WebSockets**: Actualizaciones en tiempo real
- **PWA**: Funcionalidad offline
- **Push Notifications**: Alertas personalizadas
- **Machine Learning**: Recomendaciones inteligentes

## Instalación y Configuración

### 1. Migración de Base de Datos

```bash
npm run db:migrate
```

### 2. Generación de Datos de Ejemplo

```bash
npm run gamification:generate-data
```

### 3. Configuración Completa

```bash
npm run gamification:setup
```

### 4. Verificación

```bash
# Verificar que las tablas se crearon correctamente
npm run db:test

# Verificar que los datos se generaron
curl http://localhost:3000/api/gamification?action=active_competitions
```

## Troubleshooting

### Problemas Comunes

#### Error: "Modelo no encontrado"
- Ejecutar `npm run db:generate` para regenerar el cliente Prisma
- Verificar que las migraciones se aplicaron correctamente

#### Error: "Servicio no inicializado"
- Verificar que Redis esté ejecutándose
- Comprobar las variables de entorno

#### Error: "Evento no registrado"
- Verificar la autenticación del usuario
- Comprobar la validación de datos de entrada

### Logs y Debugging

```typescript
// Habilitar logs detallados
console.log('Gamification Event:', event);
console.log('User Stats:', await getUserStats(userId));
console.log('Badge Check:', await checkBadges(userId));
```

## Contribución

### Guías de Desarrollo
1. Seguir las convenciones de TypeScript
2. Agregar tests para nuevas funcionalidades
3. Documentar cambios en la API
4. Actualizar la documentación

### Estructura de Archivos
```
lib/
├── gamification-service.ts    # Servicio principal
├── hooks/
│   └── useGamification.ts     # Hook de integración
components/
├── gamification/
│   ├── gamification-dashboard.tsx
│   └── gamification-notification.tsx
app/
├── api/
│   └── gamification/
│       └── route.ts           # API endpoints
└── gamification/
    └── page.tsx               # Página principal
scripts/
└── generate-gamification-data.ts
```

## Licencia

Este sistema de gamificación es parte de InclusiveAI Coach y está bajo la licencia MIT.
