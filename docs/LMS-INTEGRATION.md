# Integración con LMS Externos - InclusiveAI Coach

## Descripción General

El sistema de integración con LMS (Learning Management System) externos permite conectar InclusiveAI Coach con plataformas educativas populares como Moodle, Canvas, Blackboard, Schoology y Google Classroom. Esta integración facilita la sincronización de datos, exportación de calificaciones y gestión de contenido educativo.

## Características Principales

### ✅ Funcionalidades Implementadas

- **Integración Multi-LMS**: Soporte para Moodle, Canvas, Blackboard, Schoology y Google Classroom
- **Sincronización Bidireccional**: Importación y exportación de datos entre sistemas
- **Gestión de Calificaciones**: Sincronización automática de calificaciones
- **Contenido Externo**: Integración con APIs de terceros para contenido educativo
- **Videoconferencias**: Gestión de sesiones con Zoom, Teams, Meet y Jitsi
- **Autenticación Segura**: OAuth2 y tokens de acceso para cada plataforma
- **Monitoreo en Tiempo Real**: Estado de conexiones y sincronización
- **Interfaz Administrativa**: Panel completo para gestión de integraciones

## Arquitectura del Sistema

### Componentes Principales

1. **LMSIntegrationManager** (`lib/lms-integration.ts`)
   - Gestor principal de todas las integraciones LMS
   - Manejo de conexiones y autenticación
   - Sincronización de datos

2. **Integraciones Específicas**
   - `MoodleIntegration`: Integración con Moodle
   - `CanvasIntegration`: Integración con Canvas
   - `BlackboardIntegration`: Integración con Blackboard

3. **APIs REST**
   - `/api/lms/connections`: Gestión de conexiones
   - `/api/lms/sync`: Sincronización de datos
   - `/api/lms/grades`: Exportación de calificaciones
   - `/api/external-content`: Contenido educativo externo
   - `/api/video-conferences`: Gestión de videoconferencias

4. **Componentes de UI**
   - `LMSIntegration`: Panel principal de administración
   - `useLMSIntegration`: Hook personalizado para gestión

## Configuración de LMS

### Moodle

```typescript
const moodleConfig = {
  type: 'moodle',
  baseUrl: 'https://tu-moodle.edu.mx',
  username: 'usuario_api',
  password: 'contraseña_api',
  timeout: 30000,
  retryAttempts: 3
};
```

**Requisitos:**
- Habilitar servicios web en Moodle
- Crear token de acceso
- Configurar permisos de API

### Canvas

```typescript
const canvasConfig = {
  type: 'canvas',
  baseUrl: 'https://tu-institucion.instructure.com',
  token: 'tu_token_de_acceso',
  timeout: 30000,
  retryAttempts: 3
};
```

**Requisitos:**
- Generar token de acceso en Canvas
- Configurar permisos de API
- Habilitar integraciones externas

### Blackboard

```typescript
const blackboardConfig = {
  type: 'blackboard',
  baseUrl: 'https://tu-blackboard.edu.mx',
  clientId: 'tu_client_id',
  clientSecret: 'tu_client_secret',
  timeout: 30000,
  retryAttempts: 3
};
```

**Requisitos:**
- Registrar aplicación en Blackboard
- Obtener credenciales OAuth2
- Configurar scopes de acceso

## Uso del Sistema

### 1. Configurar Conexión LMS

```typescript
import { lmsIntegrationManager } from '@/lib/lms-integration';

const connection = {
  id: 'lms_1234567890',
  institutionId: 'inst_001',
  config: moodleConfig,
  status: 'inactive',
  lastSync: new Date(),
  syncStatus: 'idle'
};

await lmsIntegrationManager.registerConnection(connection);
```

### 2. Sincronizar Datos

```typescript
// Sincronización completa
const result = await lmsIntegrationManager.syncWithLMS('lms_1234567890');

console.log(`Sincronizados: ${result.syncedUsers} usuarios, ${result.syncedCourses} cursos, ${result.syncedGrades} calificaciones`);
```

### 3. Exportar Calificaciones

```typescript
const grades = [
  {
    userId: 'user_001',
    moduleId: 'module_001',
    score: 85,
    maxScore: 100,
    percentage: 85,
    feedback: 'Excelente trabajo'
  }
];

await lmsIntegrationManager.exportGrades('lms_1234567890', grades);
```

### 4. Usar el Hook Personalizado

```typescript
import { useLMSIntegration } from '@/lib/hooks/useLMSIntegration';

const MyComponent = () => {
  const {
    connections,
    syncWithLMS,
    loadGrades,
    exportGrades,
    loading,
    error
  } = useLMSIntegration();

  const handleSync = async (connectionId: string) => {
    const result = await syncWithLMS(connectionId);
    if (result) {
      console.log('Sincronización exitosa');
    }
  };

  return (
    <div>
      {connections.map(connection => (
        <button key={connection.id} onClick={() => handleSync(connection.id)}>
          Sincronizar {connection.name}
        </button>
      ))}
    </div>
  );
};
```

## APIs Disponibles

### Gestión de Conexiones

#### GET /api/lms/connections
Obtiene todas las conexiones LMS configuradas.

**Respuesta:**
```json
{
  "success": true,
  "connections": [
    {
      "id": "lms_1234567890",
      "institutionId": "inst_001",
      "name": "Moodle Principal",
      "type": "moodle",
      "status": "active",
      "lastSync": "2024-01-15T10:30:00Z",
      "syncStatus": "idle"
    }
  ],
  "total": 1
}
```

#### POST /api/lms/connections
Registra una nueva conexión LMS.

**Body:**
```json
{
  "institutionId": "inst_001",
  "name": "Moodle Principal",
  "type": "moodle",
  "config": {
    "baseUrl": "https://moodle.edu.mx",
    "username": "api_user",
    "password": "api_pass"
  }
}
```

### Sincronización

#### POST /api/lms/sync
Sincroniza datos con un LMS externo.

**Body:**
```json
{
  "connectionId": "lms_1234567890",
  "syncType": "full"
}
```

**Respuesta:**
```json
{
  "success": true,
  "result": {
    "success": true,
    "syncedUsers": 150,
    "syncedCourses": 25,
    "syncedGrades": 1200,
    "errors": [],
    "warnings": []
  }
}
```

### Calificaciones

#### GET /api/lms/grades
Obtiene calificaciones sincronizadas.

**Query Parameters:**
- `connectionId`: ID de la conexión LMS
- `userId`: ID del usuario
- `courseId`: ID del curso

#### POST /api/lms/grades
Exporta calificaciones a LMS externo.

**Body:**
```json
{
  "connectionId": "lms_1234567890",
  "grades": [
    {
      "userId": "user_001",
      "moduleId": "module_001",
      "score": 85,
      "maxScore": 100,
      "percentage": 85,
      "feedback": "Excelente trabajo"
    }
  ],
  "courseId": "course_001"
}
```

## Contenido Externo

### GET /api/external-content
Obtiene contenido educativo externo.

**Query Parameters:**
- `source`: Fuente del contenido (youtube, khan-academy, etc.)
- `type`: Tipo de contenido (video, document, quiz, assignment)
- `lessonId`: ID de la lección asociada
- `assessmentId`: ID de la evaluación asociada

### POST /api/external-content
Crea nuevo contenido educativo externo.

**Body:**
```json
{
  "source": "youtube",
  "externalId": "video_123",
  "title": "Matemáticas Básicas",
  "description": "Video explicativo de matemáticas",
  "type": "video",
  "url": "https://youtube.com/watch?v=123",
  "lessonId": "lesson_001",
  "integrationType": "embed"
}
```

## Videoconferencias

### GET /api/video-conferences
Obtiene videoconferencias programadas.

**Query Parameters:**
- `platform`: Plataforma (zoom, teams, meet, jitsi)
- `hostId`: ID del host
- `isActive`: Estado activo

### POST /api/video-conferences
Crea una nueva videoconferencia.

**Body:**
```json
{
  "platform": "zoom",
  "meetingId": "meeting_123",
  "title": "Clase de Matemáticas",
  "description": "Sesión de repaso",
  "startTime": "2024-01-15T14:00:00Z",
  "endTime": "2024-01-15T15:00:00Z",
  "participants": ["user_001", "user_002"]
}
```

## Base de Datos

### Modelos Principales

#### Institution
```sql
CREATE TABLE institutions (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100),
  country VARCHAR(100),
  region VARCHAR(100),
  website VARCHAR(255),
  contact_email VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### LMSConnection
```sql
CREATE TABLE lms_connections (
  id VARCHAR(255) PRIMARY KEY,
  institution_id VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL,
  config JSONB NOT NULL,
  status VARCHAR(50) DEFAULT 'inactive',
  last_sync TIMESTAMP,
  sync_status VARCHAR(50) DEFAULT 'idle',
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (institution_id) REFERENCES institutions(id)
);
```

#### LMSUser
```sql
CREATE TABLE lms_users (
  id VARCHAR(255) PRIMARY KEY,
  connection_id VARCHAR(255) NOT NULL,
  external_id VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,
  last_sync TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (connection_id) REFERENCES lms_connections(id),
  UNIQUE(external_id, connection_id)
);
```

#### LMSCourse
```sql
CREATE TABLE lms_courses (
  id VARCHAR(255) PRIMARY KEY,
  connection_id VARCHAR(255) NOT NULL,
  external_id VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  status VARCHAR(50) DEFAULT 'active',
  last_sync TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (connection_id) REFERENCES lms_connections(id),
  UNIQUE(external_id, connection_id)
);
```

#### LMSGrade
```sql
CREATE TABLE lms_grades (
  id VARCHAR(255) PRIMARY KEY,
  connection_id VARCHAR(255) NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  module_id VARCHAR(255) NOT NULL,
  score DECIMAL(5,2) NOT NULL,
  max_score DECIMAL(5,2) NOT NULL,
  percentage DECIMAL(5,2) NOT NULL,
  feedback TEXT,
  submitted_at TIMESTAMP NOT NULL,
  graded_at TIMESTAMP,
  last_sync TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (connection_id) REFERENCES lms_connections(id),
  UNIQUE(user_id, module_id, connection_id)
);
```

## Variables de Entorno

```env
# Configuración de LMS
LMS_ENABLED=true
LMS_SYNC_INTERVAL=3600
LMS_MAX_RETRIES=3
LMS_TIMEOUT=30000

# Moodle
MOODLE_API_ENABLED=true
MOODLE_DEFAULT_TIMEOUT=30000

# Canvas
CANVAS_API_ENABLED=true
CANVAS_DEFAULT_TIMEOUT=30000

# Blackboard
BLACKBOARD_API_ENABLED=true
BLACKBOARD_DEFAULT_TIMEOUT=30000

# Contenido Externo
EXTERNAL_CONTENT_ENABLED=true
EXTERNAL_CONTENT_CACHE_TTL=3600

# Videoconferencias
VIDEO_CONFERENCES_ENABLED=true
ZOOM_API_KEY=your_zoom_api_key
ZOOM_API_SECRET=your_zoom_api_secret
TEAMS_CLIENT_ID=your_teams_client_id
TEAMS_CLIENT_SECRET=your_teams_client_secret
```

## Seguridad

### Autenticación y Autorización

- **Autenticación**: Basada en sesiones con NextAuth.js
- **Autorización**: Roles específicos (ADMIN, TEACHER, STUDENT)
- **Tokens**: Almacenamiento seguro de credenciales LMS
- **Encriptación**: Datos sensibles encriptados en base de datos

### Validación de Datos

- **Entrada**: Validación estricta de todos los parámetros
- **Salida**: Sanitización de datos antes de enviar a LMS externos
- **Rate Limiting**: Protección contra abuso de APIs
- **Logging**: Registro completo de todas las operaciones

## Monitoreo y Logs

### Métricas de Rendimiento

- Tiempo de respuesta de APIs LMS
- Tasa de éxito de sincronizaciones
- Número de errores por conexión
- Uso de recursos del sistema

### Logs de Auditoría

```typescript
// Ejemplo de log de sincronización
{
  timestamp: '2024-01-15T10:30:00Z',
  action: 'lms_sync',
  connectionId: 'lms_1234567890',
  userId: 'user_001',
  result: 'success',
  details: {
    syncedUsers: 150,
    syncedCourses: 25,
    syncedGrades: 1200,
    duration: 45000
  }
}
```

## Troubleshooting

### Problemas Comunes

1. **Error de Autenticación**
   - Verificar credenciales en configuración
   - Comprobar que el token no haya expirado
   - Revisar permisos de API en LMS externo

2. **Sincronización Fallida**
   - Verificar conectividad de red
   - Comprobar límites de API del LMS externo
   - Revisar logs de error para detalles específicos

3. **Datos Inconsistentes**
   - Verificar mapeo de campos entre sistemas
   - Comprobar formato de datos esperado
   - Revisar reglas de negocio específicas

### Comandos de Diagnóstico

```bash
# Verificar estado de conexiones
curl -X GET http://localhost:3000/api/lms/connections

# Probar sincronización
curl -X POST http://localhost:3000/api/lms/sync \
  -H "Content-Type: application/json" \
  -d '{"connectionId": "lms_1234567890"}'

# Verificar logs
tail -f logs/lms-integration.log
```

## Próximas Mejoras

### Funcionalidades Planificadas

- [ ] **Sincronización Automática**: Programación de sincronizaciones periódicas
- [ ] **Mapeo Avanzado**: Configuración flexible de mapeo de campos
- [ ] **Webhooks**: Notificaciones en tiempo real de cambios
- [ ] **Analytics**: Dashboard de métricas de integración
- [ ] **Backup**: Sistema de respaldo de datos sincronizados
- [ ] **Migración**: Herramientas para migración entre LMS

### Integraciones Adicionales

- [ ] **Schoology**: Integración completa
- [ ] **Google Classroom**: API completa
- [ ] **Microsoft Teams**: Integración educativa
- [ ] **Slack**: Notificaciones y comunicación
- [ ] **Discord**: Comunidades de aprendizaje

## Recursos Adicionales

- [Documentación de APIs de LMS](../AI-APIS.md)
- [Guía de Configuración](../guides/lms-setup.md)
- [Componentes de UI](../AI-COMPONENTS.md)
- [Hooks Personalizados](../HOOKS.md)
- [Base de Datos](../DATABASE.md)
