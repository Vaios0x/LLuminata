# 🐘 Migración a PostgreSQL - InclusiveAI Coach

## 📋 Resumen

Este documento describe la migración completa del sistema de base de datos de SQLite a PostgreSQL para el proyecto InclusiveAI Coach, incluyendo configuración de pool de conexiones, backup automático y migraciones de producción.

## 🎯 Objetivos de la Migración

### ✅ Beneficios de PostgreSQL

1. **Escalabilidad**: Soporte para múltiples conexiones concurrentes
2. **Rendimiento**: Optimizaciones avanzadas y índices mejorados
3. **Confiabilidad**: ACID compliance y transacciones robustas
4. **Funcionalidades Avanzadas**: JSON, búsqueda full-text, particionamiento
5. **Monitoreo**: Herramientas integradas de monitoreo y auditoría
6. **Backup**: Estrategias de backup más robustas

### 🔧 Mejoras Implementadas

- **Pool de Conexiones**: Configuración optimizada para alta concurrencia
- **Backup Automático**: Sistema de backup con compresión y rotación
- **Migraciones de Producción**: Scripts seguros con rollback automático
- **Monitoreo**: Integración con Prometheus y Grafana
- **Auditoría**: Sistema de logs para cambios en la base de datos

## 🏗️ Arquitectura de la Migración

### Componentes Principales

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Application   │    │   PostgreSQL    │    │   Monitoring    │
│   (Next.js)     │◄──►│   Database      │◄──►│   (Prometheus)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Connection    │    │   Backup        │    │   Grafana       │
│   Pool          │    │   System        │    │   Dashboard     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Flujo de Datos

1. **Aplicación** → **Pool de Conexiones** → **PostgreSQL**
2. **PostgreSQL** → **Backup Automático** → **Almacenamiento**
3. **PostgreSQL** → **Monitoreo** → **Grafana Dashboard**

## 🚀 Proceso de Migración

### 1. Preparación

```bash
# Clonar el repositorio
git clone <repository-url>
cd inclusive-ai-coach

# Instalar dependencias
npm install

# Configurar variables de entorno
cp env.example .env
```

### 2. Configuración de Variables de Entorno

```bash
# PostgreSQL Configuration
DATABASE_URL="postgresql://inclusive:inclusive123@localhost:5432/inclusive_ai"
DIRECT_URL="postgresql://inclusive:inclusive123@localhost:5432/inclusive_ai"

# Pool Configuration
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10
DATABASE_POOL_TIMEOUT=30000

# Backup Configuration
BACKUP_ENABLED=true
BACKUP_RETENTION_DAYS=7
BACKUP_COMPRESS=true
```

### 3. Iniciar Servicios con Docker

```bash
# Desarrollo
docker-compose up -d

# Producción
docker-compose -f docker-compose.prod.yml up -d
```

### 4. Ejecutar Migración

```bash
# Migración inicial
npm run db:migrate-to-postgresql

# Verificar migración
npm run db:health-check

# Generar cliente Prisma
npm run db:generate
```

### 5. Configurar Backup Automático

```bash
# Configurar cron jobs
chmod +x ./scripts/setup-cron.sh
./scripts/setup-cron.sh

# Verificar configuración
./scripts/setup-cron.sh --list
```

## 📊 Configuración de Pool de Conexiones

### Configuración en `lib/database.ts`

```typescript
export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  // Configuración de pool de conexiones
  __internal: {
    engine: {
      connectionLimit: 20,
      pool: {
        min: 2,
        max: 10,
        acquireTimeoutMillis: 30000,
        createTimeoutMillis: 30000,
        destroyTimeoutMillis: 5000,
        idleTimeoutMillis: 30000,
        reapIntervalMillis: 1000,
        createRetryIntervalMillis: 200,
      },
    },
  },
})
```

### Parámetros de Pool

| Parámetro | Valor | Descripción |
|-----------|-------|-------------|
| `min` | 2 | Conexiones mínimas en el pool |
| `max` | 10 | Conexiones máximas en el pool |
| `acquireTimeoutMillis` | 30000 | Tiempo máximo para obtener conexión |
| `idleTimeoutMillis` | 30000 | Tiempo máximo de inactividad |
| `createRetryIntervalMillis` | 200 | Intervalo entre reintentos |

## 🔄 Sistema de Backup

### Script de Backup Automático

**Archivo**: `scripts/backup-postgresql.sh`

**Características**:
- ✅ Backup comprimido con gzip
- ✅ Rotación automática de backups
- ✅ Verificación de integridad
- ✅ Upload opcional a S3
- ✅ Logging detallado
- ✅ Reportes de backup

### Uso del Script

```bash
# Backup básico
./scripts/backup-postgresql.sh

# Backup con compresión
./scripts/backup-postgresql.sh --compress

# Backup con upload a S3
./scripts/backup-postgresql.sh --compress --upload-s3

# Configurar retención personalizada
./scripts/backup-postgresql.sh --retention 14
```

### Cron Jobs Configurados

```bash
# Backup diario a las 2:00 AM
0 2 * * * /path/to/backup-postgresql.sh --compress

# Backup semanal con S3 los domingos a las 3:00 AM
0 3 * * 0 /path/to/backup-postgresql.sh --compress --upload-s3

# Limpieza de logs los domingos a las 4:00 AM
0 4 * * 0 find /path/to/logs -name '*.log' -mtime +30 -delete

# Verificación de salud cada 30 minutos
*/30 * * * * cd /path/to/app && npm run db:health-check
```

## 🏭 Migraciones de Producción

### Script de Migración de Producción

**Archivo**: `scripts/production-migration.ts`

**Características**:
- ✅ Backup automático antes de migración
- ✅ Validación de salud de la base de datos
- ✅ Reintentos automáticos en caso de fallo
- ✅ Rollback automático en caso de error
- ✅ Reportes detallados de migración
- ✅ Verificación post-migración

### Proceso de Migración de Producción

```bash
# 1. Verificar salud inicial
npm run db:health-check

# 2. Crear backup de producción
npm run db:backup

# 3. Ejecutar migración de producción
npm run db:production-migration

# 4. Verificar migración
npm run db:health-check
```

### Validaciones Implementadas

1. **Salud de Base de Datos**
   - Verificación de conexión
   - Conteo de registros en tablas críticas
   - Verificación de conexiones activas

2. **Integridad de Datos**
   - Verificación de todas las tablas
   - Validación de índices críticos
   - Comprobación de relaciones

3. **Rendimiento**
   - Análisis de consultas lentas
   - Estadísticas de rendimiento
   - Monitoreo de uso de recursos

## 📈 Monitoreo y Métricas

### Configuración de Prometheus

**Archivo**: `monitoring/prometheus.yml`

```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'postgresql'
    static_configs:
      - targets: ['postgres:5432']
    metrics_path: '/metrics'
    scrape_interval: 30s
```

### Métricas Monitoreadas

1. **Conexiones**
   - Conexiones activas
   - Conexiones inactivas
   - Conexiones totales

2. **Rendimiento**
   - Tiempo de respuesta de consultas
   - Consultas lentas
   - Uso de cache

3. **Recursos**
   - Uso de memoria
   - Uso de CPU
   - Espacio en disco

4. **Backup**
   - Estado de backups
   - Tamaño de backups
   - Tiempo de backup

### Dashboard de Grafana

**URL**: `http://localhost:3001`

**Paneles Incluidos**:
- Estado general de la base de datos
- Métricas de rendimiento
- Estadísticas de conexiones
- Estado de backups
- Alertas y notificaciones

## 🔧 Optimizaciones de PostgreSQL

### Configuración de Rendimiento

```sql
-- Configuración de memoria
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET work_mem = '4MB';

-- Configuración de WAL
ALTER SYSTEM SET wal_level = replica;
ALTER SYSTEM SET max_wal_senders = 3;
ALTER SYSTEM SET wal_keep_segments = 32;

-- Configuración de autovacuum
ALTER SYSTEM SET autovacuum = on;
ALTER SYSTEM SET autovacuum_max_workers = 3;
ALTER SYSTEM SET autovacuum_vacuum_threshold = 50;
```

### Índices de Rendimiento

```sql
-- Índices para consultas frecuentes
CREATE INDEX IF NOT EXISTS idx_student_location ON "Student"("location");
CREATE INDEX IF NOT EXISTS idx_student_language ON "Student"("language");
CREATE INDEX IF NOT EXISTS idx_completed_lesson_student ON "CompletedLesson"("studentId");
CREATE INDEX IF NOT EXISTS idx_assessment_student ON "Assessment"("studentId");
CREATE INDEX IF NOT EXISTS idx_user_email ON "User"("email");
```

### Extensiones Útiles

```sql
-- Extensiones para funcionalidades avanzadas
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";
```

## 🛡️ Seguridad y Auditoría

### Sistema de Auditoría

**Tabla**: `audit_log`

```sql
CREATE TABLE audit_log (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    table_name text NOT NULL,
    operation text NOT NULL,
    old_data jsonb,
    new_data jsonb,
    user_id text,
    timestamp timestamptz DEFAULT NOW()
);
```

### Triggers de Auditoría

```sql
-- Trigger para registrar cambios
CREATE OR REPLACE FUNCTION audit_trigger()
RETURNS trigger AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_log (table_name, operation, new_data, user_id)
        VALUES (TG_TABLE_NAME, 'INSERT', to_jsonb(NEW), current_setting('app.current_user_id', true));
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_log (table_name, operation, old_data, new_data, user_id)
        VALUES (TG_TABLE_NAME, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW), current_setting('app.current_user_id', true));
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit_log (table_name, operation, old_data, user_id)
        VALUES (TG_TABLE_NAME, 'DELETE', to_jsonb(OLD), current_setting('app.current_user_id', true));
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;
```

## 📋 Scripts Disponibles

### Comandos NPM

```bash
# Migración y gestión de base de datos
npm run db:migrate-to-postgresql    # Migración inicial
npm run db:production-migration     # Migración de producción
npm run db:deploy                   # Aplicar migraciones
npm run db:generate                 # Generar cliente Prisma
npm run db:health-check             # Verificar salud
npm run db:backup                   # Backup manual
npm run db:backup-s3                # Backup con S3

# Desarrollo
npm run dev                         # Servidor de desarrollo
npm run build                       # Build de producción
npm run start                       # Servidor de producción
```

### Scripts de Sistema

```bash
# Backup
./scripts/backup-postgresql.sh --compress

# Configuración de cron
./scripts/setup-cron.sh
./scripts/setup-cron.sh --list
./scripts/setup-cron.sh --remove

# Migración
tsx scripts/migrate-to-postgresql.ts
tsx scripts/production-migration.ts
```

## 🔍 Troubleshooting

### Problemas Comunes

1. **Error de Conexión**
   ```bash
   # Verificar que PostgreSQL está ejecutándose
   docker-compose ps
   
   # Verificar variables de entorno
   echo $DATABASE_URL
   
   # Probar conexión
   npm run db:health-check
   ```

2. **Error de Migración**
   ```bash
   # Verificar estado de migraciones
   npx prisma migrate status
   
   # Resetear migraciones (solo desarrollo)
   npx prisma migrate reset
   
   # Verificar logs
   tail -f ./backups/cron.log
   ```

3. **Error de Backup**
   ```bash
   # Verificar permisos
   ls -la ./scripts/backup-postgresql.sh
   
   # Ejecutar backup manual
   ./scripts/backup-postgresql.sh --compress
   
   # Verificar espacio en disco
   df -h
   ```

### Logs y Monitoreo

```bash
# Logs de aplicación
docker-compose logs app

# Logs de PostgreSQL
docker-compose logs postgres

# Logs de backup
tail -f ./backups/cron.log

# Métricas de Prometheus
curl http://localhost:9090/metrics
```

## 📚 Referencias

### Documentación Oficial

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)

### Herramientas Relacionadas

- [pgAdmin](https://www.pgadmin.org/) - Interfaz gráfica para PostgreSQL
- [pg_stat_statements](https://www.postgresql.org/docs/current/pgstatstatements.html) - Estadísticas de consultas
- [Prometheus](https://prometheus.io/) - Monitoreo y alertas
- [Grafana](https://grafana.com/) - Dashboards y visualización

## 🎉 Conclusión

La migración a PostgreSQL proporciona una base sólida para el crecimiento y escalabilidad del proyecto InclusiveAI Coach. Con las optimizaciones implementadas, el sistema ahora cuenta con:

- ✅ **Alta disponibilidad** con pool de conexiones optimizado
- ✅ **Backup automático** con rotación y compresión
- ✅ **Monitoreo completo** con métricas en tiempo real
- ✅ **Auditoría detallada** de todos los cambios
- ✅ **Migraciones seguras** con rollback automático
- ✅ **Documentación completa** para mantenimiento

El sistema está listo para manejar cargas de producción y proporcionar una experiencia confiable para los usuarios de InclusiveAI Coach.

---

**Nota**: Esta migración mantiene la compatibilidad con todas las funcionalidades existentes mientras proporciona una base más robusta para el futuro crecimiento del proyecto.
