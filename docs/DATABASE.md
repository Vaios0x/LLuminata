# 📊 Base de Datos - InclusiveAI Coach

## 🏗️ Arquitectura

La aplicación utiliza **SQLite** para desarrollo local y **PostgreSQL** para producción, con Prisma como ORM.

### Estructura de Archivos
```
inclusive-ai-coach/
├── prisma/
│   ├── schema.prisma          # Esquema de la base de datos
│   ├── seed.ts               # Datos de prueba
│   ├── migrations/           # Migraciones de Prisma
│   └── dev.db               # Base de datos SQLite (desarrollo)
├── lib/
│   └── offline-db.ts         # Base de datos offline (IndexedDB)
└── app/api/                  # APIs que usan la base de datos
```

## 🚀 Configuración Inicial

### 1. Instalar Dependencias
```bash
npm install
```

### 2. Generar Cliente de Prisma
```bash
npm run db:generate
```

### 3. Crear Migraciones
```bash
npm run db:migrate
```

### 4. Poblar con Datos de Prueba
```bash
npm run db:seed
```

### 5. Abrir Prisma Studio
```bash
npm run db:studio
```

## 📋 Modelos de Datos

### Student (Estudiante)
- **Información básica**: nombre, edad, género, ubicación
- **Perfil de aprendizaje**: nivel cognitivo, nivel de lectura
- **Necesidades especiales**: detección automática por IA
- **Progreso**: lecciones completadas, evaluaciones, logros
- **Acceso**: tipo de dispositivo, conectividad

### Teacher (Maestro)
- **Información profesional**: escuela, región, idiomas
- **Relaciones**: estudiantes asignados, contenido creado

### Lesson (Lección)
- **Contenido adaptativo**: variantes culturales y lingüísticas
- **Accesibilidad**: características para diferentes necesidades
- **Recursos offline**: paquetes descargables
- **Métricas**: tiempo de completado, tasa de éxito

### Assessment (Evaluación)
- **Tipos**: inicial, progreso, diagnóstico, final
- **Análisis IA**: fortalezas, debilidades, recomendaciones

### SpecialNeed (Necesidad Especial)
- **Detección**: automática por IA o manual
- **Tipos**: dislexia, discalculia, TDAH, etc.
- **Recomendaciones**: adaptaciones específicas

## 🔄 Sincronización Offline

### Base de Datos Offline (IndexedDB)
- **Dexie.js**: ORM para IndexedDB
- **Almacenamiento**: lecciones, progreso, datos de usuario
- **Sincronización**: automática cuando hay conexión

### Cola de Sincronización
- **SyncQueue**: datos pendientes de sincronizar
- **Tipos**: completado de lecciones, evaluaciones, progreso
- **Manejo de errores**: reintentos automáticos

## 🌐 APIs de Base de Datos

### Detección de Necesidades
```typescript
POST /api/ai/needs-detection
{
  "studentId": "string",
  "interactionData": {
    "readingSpeed": number,
    "errorPatterns": string[],
    "responseTime": number
  }
}
```

### Adaptación Cultural
```typescript
POST /api/ai/content-adaptation
{
  "content": object,
  "targetCulture": "maya|nahuatl|afrodescendiente",
  "language": "es-GT|maya|k'iche'"
}
```

### Sincronización
```typescript
POST /api/sync
{
  "items": [
    {
      "type": "lesson_completion",
      "data": { ... }
    }
  ]
}
```

## 🛠️ Comandos Útiles

### Desarrollo
```bash
# Ver estado de la base de datos
npx prisma studio

# Resetear base de datos
npx prisma migrate reset

# Ver logs de Prisma
npx prisma migrate dev --create-only

# Generar tipos TypeScript
npx prisma generate
```

### Producción
```bash
# Aplicar migraciones en producción
npx prisma migrate deploy

# Backup de base de datos
npx prisma db pull

# Verificar estado
npx prisma db push --accept-data-loss
```

## 🔧 Variables de Entorno

### Desarrollo (.env.local)
```env
# SQLite (desarrollo)
DATABASE_URL="file:./dev.db"

# APIs de IA
OPENAI_API_KEY=your-openai-key
ANTHROPIC_API_KEY=your-anthropic-key
```

### Producción
```env
# PostgreSQL
DATABASE_URL="postgresql://user:password@host:5432/database"

# Redis (cache)
REDIS_URL="redis://localhost:6379"
```

## 📊 Datos de Prueba

El script `seed.ts` crea:

- **2 Maestros**: María González y Carlos Méndez
- **2 Estudiantes**: Juan López y María Santos
- **2 Lecciones**: "Los Números en Maya" y "Lectura Básica"
- **1 Familia**: Ana López
- **Evaluaciones**: iniciales y de progreso
- **Necesidades especiales**: dislexia detectada por IA
- **Logros y metas**: progreso del estudiante

## 🔍 Monitoreo y Analytics

### Métricas de Rendimiento
- Tiempo de completado de lecciones
- Tasa de éxito por estudiante
- Uso de características de accesibilidad
- Patrones de sincronización offline

### Logs de Sincronización
- Frecuencia de sincronización
- Tamaño de datos transferidos
- Errores de conexión
- Tiempo de respuesta

## 🚨 Troubleshooting

### Error: "Can't reach database server"
- Verificar que PostgreSQL esté ejecutándose
- Comprobar variables de entorno
- Usar SQLite para desarrollo: `provider = "sqlite"`

### Error: "Migration failed"
- Resetear base de datos: `npx prisma migrate reset`
- Verificar esquema: `npx prisma validate`
- Revisar conflictos de migración

### Error: "Prisma Client not generated"
- Ejecutar: `npx prisma generate`
- Verificar instalación: `npm install @prisma/client`
- Limpiar cache: `rm -rf node_modules/.prisma`

## 📚 Recursos Adicionales

- [Documentación de Prisma](https://www.prisma.io/docs)
- [Guía de SQLite](https://www.sqlite.org/docs.html)
- [Dexie.js para IndexedDB](https://dexie.org/)
- [PWA Offline Strategies](https://web.dev/offline-cookbook/)
