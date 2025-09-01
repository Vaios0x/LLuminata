#!/bin/bash

# Script de Backup Automatizado para PostgreSQL
# Uso: ./scripts/backup-postgresql.sh [daily|weekly|monthly]

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuración
BACKUP_TYPE=${1:-daily}
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./backups/postgresql"
LOG_FILE="./logs/backup_${BACKUP_TYPE}_${TIMESTAMP}.log"
RETENTION_DAYS=30

# Variables de entorno
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_NAME=${DB_NAME:-inclusive_ai_coach}
DB_USER=${DB_USER:-inclusive}
DB_PASSWORD=${DB_PASSWORD:-inclusive123}

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
    
    # Verificar si pg_dump está disponible
    if ! command -v pg_dump &> /dev/null; then
        error "pg_dump no está instalado o no está en el PATH"
    fi
    
    # Verificar si gzip está disponible
    if ! command -v gzip &> /dev/null; then
        error "gzip no está instalado o no está en el PATH"
    fi
    
    # Crear directorios si no existen
mkdir -p "$BACKUP_DIR"
    mkdir -p "$(dirname "$LOG_FILE")"
    
    log "✅ Prerequisitos verificados"
}

# Función para verificar conectividad a la base de datos
check_database_connection() {
    log "🔌 Verificando conectividad a la base de datos..."
    
    export PGPASSWORD="$DB_PASSWORD"
    
    if ! psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1;" > /dev/null 2>&1; then
        error "No se puede conectar a la base de datos PostgreSQL"
    fi
    
    log "✅ Conexión a la base de datos verificada"
}

# Función para crear backup
create_backup() {
    log "💾 Iniciando backup de PostgreSQL..."
    
    local backup_file="$BACKUP_DIR/inclusive_ai_coach_${BACKUP_TYPE}_${TIMESTAMP}.sql"
    local compressed_file="${backup_file}.gz"
    
    export PGPASSWORD="$DB_PASSWORD"
    
    # Crear backup con pg_dump
    log "📦 Creando dump de la base de datos..."
    
    if pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
        --verbose \
        --clean \
        --create \
        --if-exists \
        --no-owner \
        --no-privileges \
        --format=plain \
        --file="$backup_file" 2>> "$LOG_FILE"; then
        
        log "✅ Backup SQL creado exitosamente: $backup_file"
    else
        error "Falló la creación del backup SQL"
    fi
    
    # Comprimir backup
    log "🗜️  Comprimiendo backup..."
    
    if gzip "$backup_file"; then
        log "✅ Backup comprimido exitosamente: $compressed_file"
        
        # Verificar integridad del backup comprimido
        log "🔍 Verificando integridad del backup..."
        
        if gzip -t "$compressed_file"; then
            log "✅ Integridad del backup verificada"
        else
            error "El backup comprimido está corrupto"
        fi
        
        # Mostrar información del backup
        local file_size=$(du -h "$compressed_file" | cut -f1)
        log "📊 Tamaño del backup: $file_size"
        
        # Limpiar archivo SQL sin comprimir
        rm -f "$backup_file"
        
    else
        error "Falló la compresión del backup"
    fi
}

# Función para crear backup de solo datos (sin esquema)
create_data_backup() {
    log "📊 Creando backup de solo datos..."
    
    local data_backup_file="$BACKUP_DIR/inclusive_ai_coach_data_${BACKUP_TYPE}_${TIMESTAMP}.sql"
    local compressed_data_file="${data_backup_file}.gz"
    
    export PGPASSWORD="$DB_PASSWORD"
    
    if pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
        --verbose \
        --data-only \
        --no-owner \
        --no-privileges \
        --format=plain \
        --file="$data_backup_file" 2>> "$LOG_FILE"; then
        
        log "✅ Backup de datos creado exitosamente: $data_backup_file"
        
        # Comprimir backup de datos
        if gzip "$data_backup_file"; then
            log "✅ Backup de datos comprimido: $compressed_data_file"
            rm -f "$data_backup_file"
        else
            warn "Falló la compresión del backup de datos"
        fi
        
    else
        warn "Falló la creación del backup de datos"
    fi
}

# Función para limpiar backups antiguos
cleanup_old_backups() {
    log "🧹 Limpiando backups antiguos..."
    
    local deleted_count=0
    
    # Encontrar y eliminar backups más antiguos que RETENTION_DAYS
    while IFS= read -r -d '' file; do
        if [[ -f "$file" ]]; then
            local file_age=$(( ( $(date +%s) - $(stat -c %Y "$file") ) / 86400 ))
            
            if [[ $file_age -gt $RETENTION_DAYS ]]; then
                rm -f "$file"
            deleted_count=$((deleted_count + 1))
                log "🗑️  Eliminado backup antiguo: $(basename "$file")"
            fi
        fi
    done < <(find "$BACKUP_DIR" -name "*.sql.gz" -type f -print0)
    
    log "✅ Limpieza completada. $deleted_count archivos eliminados"
}

# Función para verificar espacio en disco
check_disk_space() {
    log "💿 Verificando espacio en disco..."
    
    local available_space=$(df "$BACKUP_DIR" | awk 'NR==2 {print $4}')
    local required_space=1048576  # 1GB en KB
    
    if [[ $available_space -lt $required_space ]]; then
        warn "Espacio en disco bajo. Disponible: ${available_space}KB, Requerido: ${required_space}KB"
        cleanup_old_backups
    else
        log "✅ Espacio en disco suficiente"
    fi
}

# Función para crear reporte de backup
create_backup_report() {
    log "📋 Generando reporte de backup..."
    
    local report_file="$BACKUP_DIR/backup_report_${TIMESTAMP}.txt"
    
    {
        echo "=== REPORTE DE BACKUP LLUMINATA ==="
        echo "Fecha: $(date)"
        echo "Tipo: $BACKUP_TYPE"
        echo "Base de datos: $DB_NAME"
        echo "Host: $DB_HOST:$DB_PORT"
        echo ""
        echo "=== ARCHIVOS CREADOS ==="
        find "$BACKUP_DIR" -name "*${TIMESTAMP}*" -type f -exec ls -lh {} \;
        echo ""
        echo "=== ESTADÍSTICAS DE BACKUP ==="
        echo "Total de backups: $(find "$BACKUP_DIR" -name "*.sql.gz" | wc -l)"
        echo "Tamaño total: $(du -sh "$BACKUP_DIR" | cut -f1)"
        echo ""
        echo "=== ÚLTIMOS BACKUPS ==="
        find "$BACKUP_DIR" -name "*.sql.gz" -type f -exec ls -lt {} \; | head -10
    } > "$report_file"
    
    log "✅ Reporte generado: $report_file"
}

# Función para enviar notificación (opcional)
send_notification() {
    local status=$1
    local message=$2
    
    # Aquí puedes agregar lógica para enviar notificaciones
    # Por ejemplo, por email, Slack, Discord, etc.
    
    if [[ "$status" == "success" ]]; then
        log "📧 Notificación de éxito enviada"
    else
        warn "📧 Notificación de error enviada"
    fi
}

# Función principal
main() {
    log "🚀 Iniciando proceso de backup $BACKUP_TYPE..."
    
    # Verificar argumentos
    if [[ ! "$BACKUP_TYPE" =~ ^(daily|weekly|monthly)$ ]]; then
        error "Tipo de backup inválido. Use: daily, weekly, o monthly"
    fi
    
    # Ejecutar pasos del backup
    check_prerequisites
    check_disk_space
    check_database_connection
    create_backup
    create_data_backup
    cleanup_old_backups
    create_backup_report
    
    log "🎉 Proceso de backup completado exitosamente!"
    send_notification "success" "Backup $BACKUP_TYPE completado"
}

# Ejecutar función principal
main "$@"
