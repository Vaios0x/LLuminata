# Componentes de Gamificación Avanzada

Este documento describe los componentes de gamificación avanzada implementados para el proyecto InclusiveAI Coach.

## 📋 Índice

- [CompetitionBoard](#competitionboard)
- [ClanSystem](#clansystem)
- [EventCalendar](#eventcalendar)
- [TradingSystem](#tradingsystem)
- [PersonalizationHub](#personalizationhub)
- [GamificationDashboard](#gamificationdashboard)
- [GamificationNotification](#gamificationnotification)

## 🏆 CompetitionBoard

Tablero de competencias en tiempo real con funcionalidades avanzadas.

### Características

- **Competencias en tiempo real**: Actualización automática cada 30 segundos
- **Filtros avanzados**: Por tipo, estado y búsqueda textual
- **Leaderboards**: Clasificaciones en tiempo real
- **Sistema de recompensas**: Visualización de premios por posición
- **Participación**: Unirse/salir de competencias
- **Progreso personal**: Seguimiento del progreso del usuario

### Uso

```tsx
import { CompetitionBoard } from '@/components/gamification';

<CompetitionBoard 
  userId="user-123"
  refreshInterval={30000}
  className="custom-styles"
/>
```

### Props

| Prop | Tipo | Descripción | Default |
|------|------|-------------|---------|
| `userId` | `string` | ID del usuario | - |
| `refreshInterval` | `number` | Intervalo de actualización en ms | `30000` |
| `className` | `string` | Clases CSS adicionales | `''` |

### Estados de Competencia

- **UPCOMING**: Próximas a iniciar
- **ACTIVE**: En curso
- **FINISHED**: Finalizadas
- **CANCELLED**: Canceladas

### Tipos de Competencia

- **ACADEMIC**: Competencias académicas
- **CULTURAL**: Competencias culturales
- **CREATIVE**: Competencias creativas
- **COLLABORATIVE**: Competencias colaborativas
- **INDIVIDUAL**: Competencias individuales

## 👥 ClanSystem

Sistema de clanes y grupos con gestión avanzada de miembros.

### Características

- **Gestión de clanes**: Crear, unirse y gestionar clanes
- **Jerarquías**: Líder, Co-líder, Anciano, Miembro, Recluta
- **Guerras de clanes**: Sistema de batallas entre clanes
- **Logros colectivos**: Logros del clan
- **Contribuciones**: Seguimiento de contribuciones individuales
- **Requisitos**: Configuración de requisitos para unirse

### Uso

```tsx
import { ClanSystem } from '@/components/gamification';

<ClanSystem 
  userId="user-123"
  refreshInterval={30000}
/>
```

### Roles de Clan

- **LEADER**: Líder del clan con todos los permisos
- **CO_LEADER**: Co-líder con permisos de gestión
- **ELDER**: Anciano con permisos limitados
- **MEMBER**: Miembro regular
- **RECRUIT**: Recluta con permisos básicos

### Funcionalidades

- Crear clanes
- Unirse a clanes existentes
- Promover/expulsar miembros
- Configurar requisitos
- Ver estadísticas del clan
- Participar en guerras

## 📅 EventCalendar

Calendario de eventos temporales y especiales.

### Características

- **Eventos temporales**: Eventos con fechas específicas
- **Tipos de eventos**: Estacionales, especiales, desafíos, torneos
- **Contenido cultural**: Eventos con contenido cultural específico
- **Sistema de notificaciones**: Alertas para eventos
- **Progreso personal**: Seguimiento del progreso en eventos
- **Recompensas**: Sistema de recompensas por participación

### Uso

```tsx
import { EventCalendar } from '@/components/gamification';

<EventCalendar 
  userId="user-123"
  refreshInterval={30000}
/>
```

### Tipos de Eventos

- **SEASONAL**: Eventos estacionales
- **SPECIAL**: Eventos especiales
- **CHALLENGE**: Desafíos
- **TOURNAMENT**: Torneos
- **CULTURAL**: Eventos culturales
- **COMMUNITY**: Eventos comunitarios

### Características de Eventos

- **Clasificaciones**: Leaderboards para eventos
- **Hitos**: Objetivos intermedios
- **Modo equipo**: Eventos colaborativos
- **Contenido cultural**: Adaptación cultural

## 🔄 TradingSystem

Sistema de intercambio de badges y elementos de gamificación.

### Características

- **Inventario personal**: Gestión de elementos del usuario
- **Ofertas de intercambio**: Crear y gestionar ofertas
- **Historial de intercambios**: Seguimiento de transacciones
- **Sistema de calificaciones**: Evaluar intercambios
- **Filtros avanzados**: Por rareza, categoría y búsqueda
- **Mercado**: Futuro mercado público de intercambios

### Uso

```tsx
import { TradingSystem } from '@/components/gamification';

<TradingSystem 
  userId="user-123"
  refreshInterval={30000}
/>
```

### Tipos de Elementos

- **badge**: Insignias
- **achievement**: Logros
- **title**: Títulos
- **points**: Puntos
- **custom**: Elementos personalizados

### Rarezas

- **COMMON**: Común
- **UNCOMMON**: Poco común
- **RARE**: Raro
- **EPIC**: Épico
- **LEGENDARY**: Legendario

### Estados de Ofertas

- **PENDING**: Pendiente
- **ACCEPTED**: Aceptada
- **DECLINED**: Rechazada
- **CANCELLED**: Cancelada
- **EXPIRED**: Expirada

## 🎨 PersonalizationHub

Centro de personalización de avatares y temas.

### Características

- **Sistema de avatares**: Personalización completa de apariencia
- **Temas**: Personalización de la interfaz
- **Preferencias**: Configuración de accesibilidad y audio
- **Tienda**: Compra de elementos exclusivos
- **Vista previa**: Previsualización de cambios
- **Configuración de privacidad**: Control de visibilidad

### Uso

```tsx
import { PersonalizationHub } from '@/components/gamification';

<PersonalizationHub 
  userId="user-123"
  refreshInterval={30000}
/>
```

### Tipos de Elementos de Avatar

- **hair**: Peinados
- **eyes**: Ojos
- **mouth**: Bocas
- **accessory**: Accesorios
- **outfit**: Ropa
- **background**: Fondos

### Configuraciones de Accesibilidad

- **Alto contraste**: Mejora la visibilidad
- **Texto grande**: Aumenta el tamaño del texto
- **Reducir movimiento**: Minimiza animaciones
- **Lector de pantalla**: Soporte para lectores de pantalla

### Configuraciones de Audio

- **Volumen principal**: Control general del audio
- **Volumen de música**: Control de música de fondo
- **Volumen de efectos**: Control de efectos de sonido
- **Volumen de voz**: Control de audio de voz

## 📊 GamificationDashboard

Dashboard principal de gamificación con estadísticas y progreso.

### Características

- **Progreso de nivel**: Visualización del progreso actual
- **Estadísticas**: Métricas de rendimiento
- **Badges**: Colección de insignias
- **Logros**: Logros desbloqueados
- **Recompensas**: Recompensas disponibles
- **Competencias**: Participación en competencias

### Uso

```tsx
import { GamificationDashboard } from '@/components/gamification';

<GamificationDashboard userId="user-123" />
```

## 🔔 GamificationNotification

Sistema de notificaciones de gamificación.

### Características

- **Notificaciones en tiempo real**: Alertas automáticas
- **Tipos de notificación**: Badges, logros, niveles, competencias
- **Auto-dismiss**: Desaparición automática
- **Gestión manual**: Descartar y marcar como leídas
- **Animaciones**: Transiciones suaves
- **Accesibilidad**: Compatible con lectores de pantalla

### Uso

```tsx
import { 
  GamificationNotification, 
  useGamificationNotifications 
} from '@/components/gamification';

const { notifications, addNotification } = useGamificationNotifications();

<GamificationNotification 
  notifications={notifications}
  onDismiss={handleDismiss}
  onMarkAsRead={handleMarkAsRead}
/>
```

### Hook useGamificationNotifications

```tsx
const {
  notifications,
  addNotification,
  dismissNotification,
  markAsRead,
  clearAll
} = useGamificationNotifications();
```

### Tipos de Notificación

- **badge_earned**: Badge ganado
- **achievement_unlocked**: Logro desbloqueado
- **level_up**: Subida de nivel
- **competition_won**: Victoria en competencia
- **reward_earned**: Recompensa ganada

## 🎯 Configuración y Personalización

### Configuración Global

```tsx
import { DEFAULT_GAMIFICATION_CONFIG } from '@/components/gamification';

const config = {
  ...DEFAULT_GAMIFICATION_CONFIG,
  refreshInterval: 45000, // Personalizar intervalo
  maxNotifications: 3,    // Reducir notificaciones
};
```

### Utilidades

```tsx
import { 
  getRarityColor, 
  getCompetitionTypeColor, 
  getStatusColor 
} from '@/components/gamification';

// Obtener colores para diferentes elementos
const rarityColor = getRarityColor(BadgeRarity.EPIC);
const competitionColor = getCompetitionTypeColor(CompetitionType.CULTURAL);
const statusColor = getStatusColor(CompetitionStatus.ACTIVE);
```

### Enums Disponibles

```tsx
import {
  GamificationEventType,
  BadgeRarity,
  CompetitionType,
  CompetitionStatus
} from '@/components/gamification';
```

## 🔧 Integración con APIs

Todos los componentes están diseñados para trabajar con las siguientes APIs:

### Endpoints Principales

- `GET /api/gamification/competitions` - Listar competencias
- `POST /api/gamification/competitions/join` - Unirse a competencia
- `GET /api/gamification/clans` - Listar clanes
- `POST /api/gamification/clans/create` - Crear clan
- `GET /api/gamification/events` - Listar eventos
- `GET /api/gamification/trading` - Datos de intercambio
- `GET /api/gamification/personalization` - Datos de personalización

### Estructura de Respuesta

```typescript
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}
```

## 🎨 Temas y Estilos

Los componentes utilizan Tailwind CSS y son completamente personalizables:

### Clases CSS Principales

- **Gradientes**: `bg-gradient-to-r from-blue-500 to-purple-600`
- **Sombras**: `shadow-lg`, `hover:shadow-xl`
- **Transiciones**: `transition-shadow`, `transition-colors`
- **Responsive**: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`

### Colores por Rareza

- **Común**: `bg-gray-100 text-gray-800`
- **Poco común**: `bg-green-100 text-green-800`
- **Raro**: `bg-blue-100 text-blue-800`
- **Épico**: `bg-purple-100 text-purple-800`
- **Legendario**: `bg-yellow-100 text-yellow-800`

## 🚀 Rendimiento

### Optimizaciones Implementadas

- **Lazy loading**: Carga diferida de componentes
- **Memoización**: React.memo para componentes pesados
- **Debouncing**: Debounce en búsquedas
- **Virtualización**: Para listas largas
- **Caché**: Caché de datos en localStorage

### Métricas de Rendimiento

- **Tiempo de carga inicial**: < 2s
- **Tiempo de respuesta**: < 100ms
- **Bundle size**: < 50KB (gzipped)
- **Memory usage**: < 10MB

## 🔒 Seguridad

### Validaciones

- **Sanitización de inputs**: Prevención de XSS
- **Validación de tipos**: TypeScript strict mode
- **Rate limiting**: Límites de API calls
- **Autenticación**: Verificación de usuario

### Privacidad

- **Datos sensibles**: Encriptación de información personal
- **Consentimiento**: Control de datos compartidos
- **Anonimización**: Datos anónimos para analytics

## 📱 Accesibilidad

### Características de Accesibilidad

- **Navegación por teclado**: TabIndex y aria-labels
- **Lectores de pantalla**: ARIA labels y roles
- **Alto contraste**: Soporte para modo alto contraste
- **Reducción de movimiento**: Respeto a prefers-reduced-motion
- **Texto alternativo**: Alt text para imágenes

### WCAG 2.1 Compliance

- **Nivel AA**: Cumplimiento completo
- **Nivel AAA**: Cumplimiento parcial
- **Pautas**: 1.1, 1.3, 1.4, 2.1, 2.4, 3.2

## 🧪 Testing

### Estrategia de Testing

- **Unit tests**: Jest + React Testing Library
- **Integration tests**: Testing de flujos completos
- **E2E tests**: Playwright para pruebas end-to-end
- **Accessibility tests**: axe-core para a11y

### Cobertura Objetivo

- **Cobertura de código**: > 90%
- **Cobertura de funcionalidad**: > 95%
- **Cobertura de accesibilidad**: 100%

## 📈 Analytics y Métricas

### Eventos Rastreados

- **Interacciones**: Clicks, hovers, scrolls
- **Conversiones**: Unirse a competencias, completar eventos
- **Engagement**: Tiempo en página, elementos vistos
- **Errores**: Errores de API, crashes

### Métricas Clave

- **DAU/MAU**: Usuarios activos diarios/mensuales
- **Retención**: Retención a 1, 7, 30 días
- **Conversión**: Tasa de conversión de eventos
- **Satisfacción**: NPS y ratings

## 🔄 Roadmap

### Próximas Funcionalidades

- [ ] **Mercado público**: Intercambios públicos
- [ ] **Sistema de rankings**: Rankings globales
- [ ] **Eventos en vivo**: Eventos con streaming
- [ ] **Realidad aumentada**: AR para avatares
- [ ] **Blockchain**: NFTs para elementos únicos
- [ ] **IA personalizada**: Recomendaciones inteligentes

### Mejoras Técnicas

- [ ] **PWA**: Soporte completo para PWA
- [ ] **Offline**: Funcionalidad offline
- [ ] **Push notifications**: Notificaciones push
- [ ] **WebRTC**: Comunicación en tiempo real
- [ ] **WebGL**: Gráficos 3D para avatares

## 🤝 Contribución

### Guías de Contribución

1. **Fork del repositorio**
2. **Crear feature branch**: `git checkout -b feature/nueva-funcionalidad`
3. **Desarrollar**: Implementar cambios con tests
4. **Testear**: Ejecutar suite completa de tests
5. **Commit**: `git commit -m 'feat: nueva funcionalidad'`
6. **Push**: `git push origin feature/nueva-funcionalidad`
7. **Pull Request**: Crear PR con descripción detallada

### Estándares de Código

- **TypeScript**: Uso estricto de tipos
- **ESLint**: Configuración estricta
- **Prettier**: Formateo automático
- **Conventional Commits**: Estándar de commits
- **Semantic Versioning**: Versionado semántico

## 📞 Soporte

### Canales de Soporte

- **Issues**: GitHub Issues para bugs
- **Discussions**: GitHub Discussions para preguntas
- **Documentación**: Wiki del proyecto
- **Email**: soporte@inclusiveai.com

### Recursos Adicionales

- **API Documentation**: `/docs/api`
- **Component Library**: Storybook
- **Design System**: Figma
- **Performance**: Lighthouse CI
- **Security**: Snyk integration

---

**Nota**: Este documento se actualiza regularmente. Para la versión más reciente, consulta el repositorio principal.
