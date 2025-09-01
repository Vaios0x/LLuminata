# 🚀 Migración a PostgreSQL - Guía Rápida

## ⚡ Inicio Rápido

### 1. Configurar Variables de Entorno

```bash
# Copiar archivo de ejemplo
cp env.example .env

# Editar .env y configurar PostgreSQL
DATABASE_URL="postgresql://inclusive:inclusive123@localhost:5432/inclusive_ai"
DIRECT_URL="postgresql://inclusive:inclusive123@localhost:5432/inclusive_ai"
```

### 2. Iniciar Servicios

```bash
# Desarrollo
docker-compose up -d

# Producción
docker-compose -f docker-compose.prod.yml up -d
```

### 3. Ejecutar Migración

```bash
# Migración inicial
npm run db:migrate-to-postgresql

# Verificar migración
npm run db:health-check
```

### 4. Configurar Backup Automático

```bash
# Windows (PowerShell)
.\scripts\setup-permissions.ps1
bash ./scripts/setup-cron.sh

# Linux/macOS
chmod +x ./scripts/*.sh
./scripts/setup-cron.sh
```

## 📋 Comandos Principales

### Migración y Base de Datos

```bash
# Migración inicial
npm run db:migrate-to-postgresql

# Migración de producción
npm run db:production-migration

# Aplicar migraciones
npm run db:deploy

# Generar cliente Prisma
npm run db:generate

# Verificar salud
npm run db:health-check
```

### Backup

```bash
# Backup manual
npm run db:backup

# Backup con S3
npm run db:backup-s3

# Backup directo
bash ./scripts/backup-postgresql.sh --compress
```

### Monitoreo

```bash
# Ver logs de aplicación
docker-compose logs app

# Ver logs de PostgreSQL
docker-compose logs postgres

# Ver métricas de Prometheus
curl http://localhost:9090/metrics

# Acceder a Grafana
# http://localhost:3001 (admin/admin123)
```

## 🔧 Configuración Avanzada

### Pool de Conexiones

```typescript
// lib/database.ts
export const prisma = new PrismaClient({
  __internal: {
    engine: {
      connectionLimit: 20,
      pool: {
        min: 2,
        max: 10,
        acquireTimeoutMillis: 30000,
        idleTimeoutMillis: 30000,
      },
    },
  },
})
```

### Variables de Entorno Recomendadas

```bash
# PostgreSQL
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

# S3 (opcional)
S3_BUCKET="your-backup-bucket"
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
```

## 🐛 Troubleshooting

### Error de Conexión

```bash
# Verificar que PostgreSQL está ejecutándose
docker-compose ps

# Verificar variables de entorno
echo $DATABASE_URL

# Probar conexión
npm run db:health-check
```

### Error de Migración

```bash
# Verificar estado de migraciones
npx prisma migrate status

# Resetear migraciones (solo desarrollo)
npx prisma migrate reset

# Verificar logs
tail -f ./backups/cron.log
```

### Error de Backup

```bash
# Verificar permisos (Windows)
.\scripts\setup-permissions.ps1

# Verificar permisos (Linux/macOS)
chmod +x ./scripts/backup-postgresql.sh

# Ejecutar backup manual
bash ./scripts/backup-postgresql.sh --compress
```

## 📊 Monitoreo

### Métricas Disponibles

- **Conexiones**: Activas, inactivas, totales
- **Rendimiento**: Tiempo de respuesta, consultas lentas
- **Recursos**: Memoria, CPU, espacio en disco
- **Backup**: Estado, tamaño, tiempo de ejecución

### Dashboards

- **Grafana**: http://localhost:3001
- **Prometheus**: http://localhost:9090
- **pgAdmin**: http://localhost:5050 (si configurado)

## 🔄 Cron Jobs Configurados

```bash
# Backup diario a las 2:00 AM
0 2 * * * bash /path/to/backup-postgresql.sh --compress

# Backup semanal con S3 los domingos a las 3:00 AM
0 3 * * 0 bash /path/to/backup-postgresql.sh --compress --upload-s3

# Limpieza de logs los domingos a las 4:00 AM
0 4 * * 0 find /path/to/logs -name '*.log' -mtime +30 -delete

# Verificación de salud cada 30 minutos
*/30 * * * * cd /path/to/app && npm run db:health-check
```

## 📚 Documentación Completa

Para información detallada, consulta:
- [Documentación de Migración](docs/POSTGRESQL-MIGRATION.md)
- [Documentación de Autenticación](docs/AUTHENTICATION-INTEGRATION.md)
- [Documentación de Componentes](docs/COMPONENTS.md)

## 🆘 Soporte

Si encuentras problemas:

1. **Verificar logs**: `docker-compose logs`
2. **Verificar salud**: `npm run db:health-check`
3. **Revisar documentación**: `docs/POSTGRESQL-MIGRATION.md`
4. **Crear issue**: Incluir logs y configuración

## ✅ Checklist de Migración

- [ ] Variables de entorno configuradas
- [ ] Servicios Docker iniciados
- [ ] Migración ejecutada exitosamente
- [ ] Salud de base de datos verificada
- [ ] Backup automático configurado
- [ ] Monitoreo configurado
- [ ] Aplicación probada
- [ ] Documentación actualizada

---

**¡La migración a PostgreSQL está completa!** 🎉

El sistema ahora cuenta con:
- ✅ Alta disponibilidad con pool de conexiones
- ✅ Backup automático con rotación
- ✅ Monitoreo completo en tiempo real
- ✅ Migraciones seguras con rollback
- ✅ Auditoría detallada de cambios
