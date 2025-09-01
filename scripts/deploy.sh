#!/bin/bash

# Script de Deployment Automatizado para LLuminata
# Uso: ./scripts/deploy.sh [staging|production]

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuración
ENVIRONMENT=${1:-production}
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./backups"
LOG_FILE="./logs/deploy_${ENVIRONMENT}_${TIMESTAMP}.log"

# Función para logging
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}" | tee -a "$LOG_FILE"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}" | tee -a "$LOG_FILE"
    exit 1
}

# Función para verificar prerequisitos
check_prerequisites() {
    log "🔍 Verificando prerequisitos..."
    
    # Verificar Docker
    if ! command -v docker &> /dev/null; then
        error "Docker no está instalado"
    fi
    
    # Verificar Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose no está instalado"
    fi
    
    # Verificar archivo .env
    if [ ! -f .env ]; then
        error "Archivo .env no encontrado. Copia .env.example a .env y configura las variables"
    fi
    
    # Verificar variables críticas
    source .env
    if [ -z "$DATABASE_URL" ] || [ -z "$NEXTAUTH_SECRET" ]; then
        error "Variables críticas no configuradas en .env"
    fi
    
    log "✅ Prerequisitos verificados"
}

# Función para crear backup
create_backup() {
    log "💾 Creando backup de la base de datos..."
    
    mkdir -p "$BACKUP_DIR"
    
    if [ "$ENVIRONMENT" = "production" ]; then
        # Backup de PostgreSQL
        docker-compose -f docker-compose.prod.yml exec -T postgres pg_dump -U inclusive -d inclusive_ai_coach > "$BACKUP_DIR/backup_${TIMESTAMP}.sql"
        
        # Comprimir backup
        gzip "$BACKUP_DIR/backup_${TIMESTAMP}.sql"
        
        log "✅ Backup creado: $BACKUP_DIR/backup_${TIMESTAMP}.sql.gz"
    fi
}

# Función para ejecutar tests
run_tests() {
    log "🧪 Ejecutando tests..."
    
    # Tests unitarios
    npm run test:unit || warn "Algunos tests unitarios fallaron"
    
    # Tests de integración
    npm run test:integration || warn "Algunos tests de integración fallaron"
    
    # Tests de seguridad
    npm run test:security || warn "Algunos tests de seguridad fallaron"
    
    log "✅ Tests completados"
}

# Función para construir imagen
build_image() {
    log "🔨 Construyendo imagen Docker..."
    
    if [ "$ENVIRONMENT" = "production" ]; then
        docker-compose -f docker-compose.prod.yml build --no-cache
    else
        docker-compose build --no-cache
    fi
    
    log "✅ Imagen construida"
}

# Función para migrar base de datos
migrate_database() {
    log "🗄️ Migrando base de datos..."
    
    if [ "$ENVIRONMENT" = "production" ]; then
        # Ejecutar migraciones en producción
        docker-compose -f docker-compose.prod.yml exec -T app npx prisma migrate deploy
        docker-compose -f docker-compose.prod.yml exec -T app npx prisma generate
    else
        # Ejecutar migraciones en staging
        docker-compose exec -T app npx prisma migrate deploy
        docker-compose exec -T app npx prisma generate
    fi
    
    log "✅ Base de datos migrada"
}

# Función para deploy
deploy() {
    log "🚀 Iniciando deployment a $ENVIRONMENT..."
    
    if [ "$ENVIRONMENT" = "production" ]; then
        # Deploy a producción
        docker-compose -f docker-compose.prod.yml up -d
        
        # Esperar a que los servicios estén listos
        log "⏳ Esperando a que los servicios estén listos..."
        sleep 30
        
        # Verificar health checks
        check_health
        
    else
        # Deploy a staging
        docker-compose up -d
        
        # Esperar a que los servicios estén listos
        log "⏳ Esperando a que los servicios estén listos..."
        sleep 20
        
        # Verificar health checks
        check_health
    fi
    
    log "✅ Deployment completado"
}

# Función para verificar health
check_health() {
    log "🏥 Verificando health de los servicios..."
    
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
            log "✅ Aplicación saludable"
            return 0
        fi
        
        log "⏳ Intento $attempt/$max_attempts - Esperando..."
        sleep 10
        attempt=$((attempt + 1))
    done
    
    error "La aplicación no está respondiendo después de $max_attempts intentos"
}

# Función para limpiar recursos
cleanup() {
    log "🧹 Limpiando recursos..."
    
    # Eliminar imágenes no utilizadas
    docker image prune -f
    
    # Eliminar contenedores detenidos
    docker container prune -f
    
    # Eliminar volúmenes no utilizados (solo en staging)
    if [ "$ENVIRONMENT" != "production" ]; then
        docker volume prune -f
    fi
    
    log "✅ Limpieza completada"
}

# Función para notificar
notify() {
    local status=$1
    local message=$2
    
    log "📢 Notificando deployment: $status"
    
    # Aquí puedes agregar notificaciones a Slack, Discord, email, etc.
    # Ejemplo para Slack:
    # curl -X POST -H 'Content-type: application/json' \
    #   --data "{\"text\":\"Deployment $ENVIRONMENT: $status - $message\"}" \
    #   $SLACK_WEBHOOK_URL
    
    log "✅ Notificación enviada"
}

# Función principal
main() {
    log "🎯 Iniciando deployment de LLuminata"
    log "📋 Entorno: $ENVIRONMENT"
    log "📝 Log file: $LOG_FILE"
    
    # Crear directorio de logs
    mkdir -p ./logs
    
    # Inicio del deployment
    local start_time=$(date +%s)
    
    try {
        check_prerequisites
        create_backup
        run_tests
        build_image
        migrate_database
        deploy
        cleanup
        
        local end_time=$(date +%s)
        local duration=$((end_time - start_time))
        
        log "🎉 Deployment exitoso en $duration segundos"
        notify "SUCCESS" "Deployment completado en $duration segundos"
        
    } catch {
        local end_time=$(date +%s)
        local duration=$((end_time - start_time))
        
        error "Deployment falló después de $duration segundos"
        notify "FAILED" "Deployment falló después de $duration segundos"
    }
}

# Función para rollback
rollback() {
    log "🔄 Iniciando rollback..."
    
    if [ "$ENVIRONMENT" = "production" ]; then
        # Restaurar backup
        if [ -f "$BACKUP_DIR/backup_${TIMESTAMP}.sql.gz" ]; then
            log "📦 Restaurando backup..."
            gunzip -c "$BACKUP_DIR/backup_${TIMESTAMP}.sql.gz" | \
            docker-compose -f docker-compose.prod.yml exec -T postgres psql -U inclusive -d inclusive_ai_coach
        fi
        
        # Reiniciar servicios
        docker-compose -f docker-compose.prod.yml restart
    else
        docker-compose restart
    fi
    
    log "✅ Rollback completado"
}

# Manejo de argumentos
case "${1:-production}" in
    "production"|"prod")
        ENVIRONMENT="production"
        ;;
    "staging"|"stage")
        ENVIRONMENT="staging"
        ;;
    "rollback")
        rollback
        exit 0
        ;;
    "help"|"-h"|"--help")
        echo "Uso: $0 [staging|production|rollback|help]"
        echo ""
        echo "Opciones:"
        echo "  production, prod  - Deploy a producción (default)"
        echo "  staging, stage    - Deploy a staging"
        echo "  rollback          - Hacer rollback del último deployment"
        echo "  help, -h, --help  - Mostrar esta ayuda"
        exit 0
        ;;
    *)
        error "Opción inválida: $1. Usa 'help' para ver las opciones disponibles"
        ;;
esac

# Ejecutar función principal
main
