# Deployment y CI/CD - Inclusive AI Coach

## Índice

1. [Configuración de Docker](#configuración-de-docker)
2. [Pipeline de CI/CD](#pipeline-de-cicd)
3. [Monitoreo y Analytics](#monitoreo-y-analytics)
4. [Guía de Deployment](#guía-de-deployment)
5. [Troubleshooting](#troubleshooting)

## Configuración de Docker

### Estructura de Archivos

```
inclusive-ai-coach/
├── Dockerfile                 # Multi-stage build optimizado
├── .dockerignore             # Archivos excluidos del build
├── docker-compose.yml        # Desarrollo local
├── docker-compose.prod.yml   # Producción con monitoreo
└── nginx/
    └── nginx.conf           # Configuración de reverse proxy
```

### Dockerfile

El Dockerfile utiliza multi-stage build para optimizar el tamaño de la imagen:

```dockerfile
# Base stage
FROM node:18-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Dependencies stage
FROM base AS deps
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci --only=production

# Build stage
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# Production stage
FROM node:18-alpine AS runner
WORKDIR /app
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

RUN chown -R nextjs:nodejs /app
USER nextjs

EXPOSE 3000
ENV PORT 3000
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

CMD ["node", "server.js"]
```

### Docker Compose para Producción

```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: inclusive-ai-app
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://inclusive:inclusive123@postgres:5432/inclusive_ai
      - REDIS_URL=redis://redis:6379
    depends_on:
      postgres:
        condition: service_healthy
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: inclusive
      POSTGRES_PASSWORD: inclusive123
      POSTGRES_DB: inclusive_ai
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U inclusive"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD:-inclusive123}
    volumes:
      - redis_data:/data

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - app

  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_PASSWORD:-admin123}
    volumes:
      - grafana_data:/var/lib/grafana
      - ./monitoring/grafana:/etc/grafana/provisioning

  jaeger:
    image: jaegertracing/all-in-one:latest
    ports:
      - "16686:16686"
      - "14268:14268"

volumes:
  postgres_data:
  redis_data:
  prometheus_data:
  grafana_data:
```

## Pipeline de CI/CD

### GitHub Actions Workflow

El pipeline está configurado en `.github/workflows/ci-cd.yml` y incluye:

#### 1. Job de Testing
- **Servicios**: PostgreSQL y Redis para testing
- **Pasos**:
  - Setup de Node.js
  - Instalación de dependencias
  - Generación de Prisma client
  - Ejecución de migraciones
  - Linting y type checking
  - Unit tests con Jest
  - E2E tests con Playwright
  - Accessibility tests con pa11y
  - Security scan con Snyk

#### 2. Job de Build
- **Trigger**: Solo en push a main
- **Pasos**:
  - Setup de Docker Buildx
  - Login al Container Registry
  - Build y push de imagen multi-architectura
  - Cache optimization

#### 3. Job de Deployment
- **Trigger**: Solo en push a main
- **Pasos**:
  - SSH deployment al servidor
  - Health check post-deployment
  - Notificaciones de Slack

#### 4. Job de Monitoreo
- **Pasos**:
  - Performance tests con Lighthouse
  - Verificación de métricas
  - Notificaciones de resultados

### Variables de Entorno Requeridas

```bash
# GitHub Secrets
ANTHROPIC_API_KEY=your_anthropic_key
OPENAI_API_KEY=your_openai_key
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=https://your-domain.com
DATABASE_URL=postgresql://user:pass@host:port/db
REDIS_PASSWORD=your_redis_password
GRAFANA_PASSWORD=your_grafana_password

# Deployment
HOST=your-server-ip
USERNAME=your-ssh-user
SSH_KEY=your-ssh-private-key
SLACK_WEBHOOK_URL=your-slack-webhook
```

## Monitoreo y Analytics

### Stack de Monitoreo

1. **Prometheus**: Recolección de métricas
2. **Grafana**: Visualización y dashboards
3. **Jaeger**: Distributed tracing
4. **Nginx**: Reverse proxy con logging

### Endpoints de Monitoreo

#### Health Check
```bash
GET /api/health
```

Respuesta:
```json
{
  "status": "healthy",
          "timestamp": "2025-01-01T00:00:00.000Z",
  "uptime": 3600,
  "environment": "production",
  "checks": {
    "database": "ok",
    "redis": "connected",
    "anthropic": "configured",
    "openai": "configured",
    "nextauth": "configured"
  },
  "version": "1.0.0"
}
```

#### Métricas Prometheus
```bash
GET /api/metrics
```

Métricas disponibles:
- `inclusive_ai_requests_total`: Total de requests
- `inclusive_ai_errors_total`: Total de errores
- `inclusive_ai_active_users`: Usuarios activos
- `inclusive_ai_teachers_total`: Total de maestros
- `inclusive_ai_students_total`: Total de estudiantes
- `inclusive_ai_lessons_total`: Total de lecciones

### Dashboards de Grafana

#### Dashboard Principal
- **URL**: http://localhost:3001
- **Credenciales**: admin / admin123
- **Paneles**:
  - Response Time
  - Request Rate
  - Error Rate
  - Active Users
  - AI API Calls
  - Database Connections
  - Redis Memory Usage

### Configuración de Nginx

#### Características
- **Rate Limiting**: 10 req/s para API, 1 req/s para auth
- **Gzip Compression**: Optimización de transferencia
- **Security Headers**: Protección contra ataques comunes
- **Health Check**: Endpoint dedicado
- **Static Files**: Cache optimizado

#### Configuración de Rate Limiting
```nginx
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=login:10m rate=1r/s;

location /api/ {
    limit_req zone=api burst=20 nodelay;
    # ...
}

location /api/auth/ {
    limit_req zone=login burst=5 nodelay;
    # ...
}
```

## Guía de Deployment

### Deployment Manual

1. **Preparación del Servidor**
```bash
# Instalar Docker y Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

2. **Configuración de Variables de Entorno**
```bash
# Crear archivo .env
cp env.example .env
nano .env

# Configurar variables requeridas
ANTHROPIC_API_KEY=your_key
OPENAI_API_KEY=your_key
NEXTAUTH_SECRET=your_secret
NEXTAUTH_URL=https://your-domain.com
DATABASE_URL=postgresql://inclusive:inclusive123@postgres:5432/inclusive_ai
REDIS_PASSWORD=your_redis_password
GRAFANA_PASSWORD=your_grafana_password
```

3. **Deployment**
```bash
# Clonar repositorio
git clone https://github.com/your-org/inclusive-ai-coach.git
cd inclusive-ai-coach

# Ejecutar script de deployment
chmod +x scripts/deploy.sh
./scripts/deploy.sh production
```

### Deployment Automatizado

El deployment automatizado se ejecuta a través de GitHub Actions:

1. **Configurar Secrets en GitHub**
   - Ir a Settings > Secrets and variables > Actions
   - Agregar todas las variables requeridas

2. **Configurar Environment**
   - Crear environment "production"
   - Configurar protection rules si es necesario

3. **Trigger Deployment**
   - Hacer push a la rama main
   - El pipeline se ejecutará automáticamente

### Verificación Post-Deployment

```bash
# Verificar servicios
docker-compose -f docker-compose.prod.yml ps

# Verificar logs
docker-compose -f docker-compose.prod.yml logs app

# Verificar health check
curl http://localhost/api/health

# Verificar métricas
curl http://localhost/api/metrics

# Verificar Grafana
curl http://localhost:3001
```

## Troubleshooting

### Problemas Comunes

#### 1. Health Check Falla
```bash
# Verificar logs de la aplicación
docker-compose -f docker-compose.prod.yml logs app

# Verificar conectividad de base de datos
docker-compose -f docker-compose.prod.yml exec postgres pg_isready -U inclusive

# Verificar variables de entorno
docker-compose -f docker-compose.prod.yml exec app env | grep -E "(DATABASE|REDIS|ANTHROPIC|OPENAI)"
```

#### 2. Problemas de Memoria
```bash
# Verificar uso de memoria
docker stats

# Limpiar recursos no utilizados
docker system prune -f
docker volume prune -f
```

#### 3. Problemas de Red
```bash
# Verificar conectividad entre contenedores
docker-compose -f docker-compose.prod.yml exec app ping postgres
docker-compose -f docker-compose.prod.yml exec app ping redis

# Verificar puertos
netstat -tulpn | grep -E "(3000|5432|6379|80|443)"
```

#### 4. Problemas de Base de Datos
```bash
# Verificar estado de PostgreSQL
docker-compose -f docker-compose.prod.yml exec postgres pg_stat_activity

# Verificar logs de PostgreSQL
docker-compose -f docker-compose.prod.yml logs postgres

# Restaurar backup si es necesario
docker-compose -f docker-compose.prod.yml exec -T postgres psql -U inclusive -d inclusive_ai < backup.sql
```

### Logs y Debugging

#### Estructura de Logs
```
/var/log/nginx/access.log    # Logs de acceso de Nginx
/var/log/nginx/error.log     # Logs de error de Nginx
docker logs inclusive-ai-app # Logs de la aplicación
```

#### Comandos de Debugging
```bash
# Ver logs en tiempo real
docker-compose -f docker-compose.prod.yml logs -f app

# Entrar al contenedor
docker-compose -f docker-compose.prod.yml exec app sh

# Verificar procesos
docker-compose -f docker-compose.prod.yml exec app ps aux

# Verificar archivos
docker-compose -f docker-compose.prod.yml exec app ls -la
```

### Rollback

En caso de problemas, se puede hacer rollback:

```bash
# Detener servicios actuales
docker-compose -f docker-compose.prod.yml down

# Restaurar imagen anterior
docker tag inclusive-ai-coach:previous inclusive-ai-coach:latest

# Restaurar base de datos si es necesario
docker-compose -f docker-compose.prod.yml exec -T postgres psql -U inclusive -d inclusive_ai < backup.sql

# Reiniciar servicios
docker-compose -f docker-compose.prod.yml up -d
```

### Monitoreo Continuo

#### Alertas Recomendadas
- CPU > 80% por más de 5 minutos
- Memoria > 85% por más de 5 minutos
- Disk > 90%
- Error rate > 5%
- Response time > 2s
- Health check falla por más de 2 minutos

#### Métricas Clave
- **Uptime**: 99.9%
- **Response Time**: < 500ms (p95)
- **Error Rate**: < 1%
- **Throughput**: > 100 req/s
- **Active Users**: Monitoreo continuo

## Seguridad

### Mejores Prácticas Implementadas

1. **Contenedores no-root**: Usuario nextjs con UID 1001
2. **Rate Limiting**: Protección contra DDoS
3. **Security Headers**: Headers de seguridad en Nginx
4. **Variables de Entorno**: Secrets manejados correctamente
5. **Health Checks**: Monitoreo de salud de servicios
6. **Backup Automático**: Backup de base de datos antes de deployment

### Recomendaciones Adicionales

1. **SSL/TLS**: Configurar certificados SSL
2. **Firewall**: Configurar reglas de firewall
3. **VPN**: Acceso VPN para administración
4. **Audit Logs**: Logs de auditoría
5. **Regular Updates**: Actualizaciones regulares de dependencias

## Performance

### Optimizaciones Implementadas

1. **Multi-stage Docker Build**: Imagen optimizada
2. **Nginx Caching**: Cache de archivos estáticos
3. **Gzip Compression**: Compresión de respuestas
4. **Database Indexing**: Índices optimizados
5. **Redis Caching**: Cache de sesiones y datos
6. **CDN Ready**: Configuración para CDN

### Benchmarks Esperados

- **Cold Start**: < 30s
- **Warm Start**: < 5s
- **Memory Usage**: < 512MB por contenedor
- **Disk Usage**: < 2GB por contenedor
- **Network Latency**: < 100ms entre servicios
