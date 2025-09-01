#!/bin/bash

# Script para configurar cron jobs de backup automático para LLuminata
# Uso: ./scripts/setup-cron.sh [--user username] [--backup-dir path]

set -e

# Configuración por defecto
CRON_USER=$(whoami)
BACKUP_DIR="$(pwd)/backups"
BACKUP_SCRIPT="$(pwd)/scripts/backup-postgresql.sh"
LOG_FILE="$(pwd)/backups/cron.log"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función de logging
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}" >&2
}

warn() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

info() {
    echo -e "${BLUE}[INFO] $1${NC}"
}

# Función de ayuda
show_help() {
    echo "Script para configurar cron jobs de backup automático"
    echo ""
    echo "Uso: $0 [opciones]"
    echo ""
    echo "Opciones:"
    echo "  --user USER       Usuario para el cron job (default: usuario actual)"
    echo "  --backup-dir DIR  Directorio de backup (default: ./backups)"
    echo "  --remove          Remover cron jobs existentes"
    echo "  --list            Listar cron jobs existentes"
    echo "  --help            Mostrar esta ayuda"
    echo ""
    echo "Ejemplos:"
    echo "  $0                    # Configurar con valores por defecto"
    echo "  $0 --user postgres    # Configurar para usuario postgres"
    echo "  $0 --remove           # Remover cron jobs"
    echo "  $0 --list             # Listar cron jobs existentes"
}

# Parsear argumentos
REMOVE_CRON=false
LIST_CRON=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --user)
            CRON_USER="$2"
            shift 2
            ;;
        --backup-dir)
            BACKUP_DIR="$2"
            shift 2
            ;;
        --remove)
            REMOVE_CRON=true
            shift
            ;;
        --list)
            LIST_CRON=true
            shift
            ;;
        --help)
            show_help
            exit 0
            ;;
        *)
            error "Opción desconocida: $1"
            show_help
            exit 1
            ;;
    esac
done

# Función para verificar permisos
check_permissions() {
    log "Verificando permisos..."
    
    if [[ ! -f "$BACKUP_SCRIPT" ]]; then
        error "Script de backup no encontrado: $BACKUP_SCRIPT"
        exit 1
    fi
    
    if [[ ! -x "$BACKUP_SCRIPT" ]]; then
        warn "Script de backup no es ejecutable, configurando permisos..."
        chmod +x "$BACKUP_SCRIPT"
    fi
    
    if [[ ! -d "$BACKUP_DIR" ]]; then
        warn "Directorio de backup no existe, creando..."
        mkdir -p "$BACKUP_DIR"
    fi
    
    # Verificar que el usuario puede escribir en el directorio de backup
    if [[ ! -w "$BACKUP_DIR" ]]; then
        error "No se puede escribir en el directorio de backup: $BACKUP_DIR"
        exit 1
    fi
}

# Función para listar cron jobs existentes
list_cron_jobs() {
    log "Cron jobs existentes para usuario $CRON_USER:"
    
    if command -v crontab &> /dev/null; then
        if [[ "$CRON_USER" == "$(whoami)" ]]; then
            crontab -l 2>/dev/null | grep -E "(backup|inclusive)" || echo "No se encontraron cron jobs relacionados con backup"
        else
            sudo -u "$CRON_USER" crontab -l 2>/dev/null | grep -E "(backup|inclusive)" || echo "No se encontraron cron jobs relacionados con backup"
        fi
    else
        error "crontab no está disponible en este sistema"
        exit 1
    fi
}

# Función para remover cron jobs existentes
remove_cron_jobs() {
    log "Removiendo cron jobs existentes..."
    
    if command -v crontab &> /dev/null; then
        if [[ "$CRON_USER" == "$(whoami)" ]]; then
            # Obtener cron jobs actuales y filtrar los de backup
            crontab -l 2>/dev/null | grep -v -E "(backup|inclusive)" | crontab - || true
        else
            # Para otros usuarios, usar sudo
            sudo -u "$CRON_USER" bash -c "crontab -l 2>/dev/null | grep -v -E '(backup|inclusive)' | crontab -" || true
        fi
        log "Cron jobs removidos exitosamente"
    else
        error "crontab no está disponible en este sistema"
        exit 1
    fi
}

# Función para crear cron jobs
create_cron_jobs() {
    log "Creando cron jobs de backup..."
    
    # Crear directorio de logs si no existe
    mkdir -p "$(dirname "$LOG_FILE")"
    
    # Definir cron jobs
    local daily_backup="0 2 * * * $BACKUP_SCRIPT --compress >> $LOG_FILE 2>&1"
    local weekly_backup="0 3 * * 0 $BACKUP_SCRIPT --compress --upload-s3 >> $LOG_FILE 2>&1"
    local cleanup_logs="0 4 * * 0 find $(dirname "$LOG_FILE") -name '*.log' -mtime +30 -delete >> $LOG_FILE 2>&1"
    local health_check="*/30 * * * * cd $(pwd) && npm run db:health-check >> $LOG_FILE 2>&1"
    
    # Crear archivo temporal con cron jobs
    local temp_cron=$(mktemp)
    
    # Agregar cron jobs existentes (excluyendo los de backup)
    if [[ "$CRON_USER" == "$(whoami)" ]]; then
        crontab -l 2>/dev/null | grep -v -E "(backup|inclusive)" > "$temp_cron" || true
    else
        sudo -u "$CRON_USER" crontab -l 2>/dev/null | grep -v -E "(backup|inclusive)" > "$temp_cron" || true
    fi
    
    # Agregar nuevos cron jobs
    cat >> "$temp_cron" << EOF

# =============================================================================
# LLUMINATA - CRON JOBS DE BACKUP Y MANTENIMIENTO
# =============================================================================
# Backup diario a las 2:00 AM
$daily_backup

# Backup semanal con upload a S3 los domingos a las 3:00 AM
$weekly_backup

# Limpieza de logs antiguos los domingos a las 4:00 AM
$cleanup_logs

# Verificación de salud de la base de datos cada 30 minutos
$health_check

EOF
    
    # Instalar cron jobs
    if [[ "$CRON_USER" == "$(whoami)" ]]; then
        crontab "$temp_cron"
    else
        sudo -u "$CRON_USER" crontab "$temp_cron"
    fi
    
    # Limpiar archivo temporal
    rm -f "$temp_cron"
    
    log "Cron jobs creados exitosamente"
}

# Función para verificar configuración
verify_cron_setup() {
    log "Verificando configuración de cron..."
    
    # Verificar que cron está ejecutándose
    if ! pgrep -x "cron" > /dev/null && ! pgrep -x "crond" > /dev/null; then
        warn "Servicio cron no está ejecutándose"
        echo "Para iniciar cron en diferentes sistemas:"
        echo "  Ubuntu/Debian: sudo systemctl start cron"
        echo "  CentOS/RHEL: sudo systemctl start crond"
        echo "  macOS: sudo launchctl load -w /System/Library/LaunchDaemons/com.vix.cron.plist"
    else
        log "Servicio cron está ejecutándose"
    fi
    
    # Verificar permisos del script
    if [[ -x "$BACKUP_SCRIPT" ]]; then
        log "Script de backup es ejecutable"
    else
        error "Script de backup no es ejecutable"
    fi
    
    # Verificar variables de entorno
    if [[ -n "$DATABASE_URL" ]]; then
        log "DATABASE_URL está configurada"
    else
        warn "DATABASE_URL no está configurada - configurar en .env"
    fi
}

# Función para mostrar información de configuración
show_configuration() {
    log "Configuración de cron jobs:"
    echo "  Usuario: $CRON_USER"
    echo "  Script de backup: $BACKUP_SCRIPT"
    echo "  Directorio de backup: $BACKUP_DIR"
    echo "  Archivo de log: $LOG_FILE"
    echo ""
    echo "Cron jobs configurados:"
    echo "  • Backup diario: 2:00 AM (comprimido)"
    echo "  • Backup semanal: Domingos 3:00 AM (con upload a S3)"
    echo "  • Limpieza de logs: Domingos 4:00 AM"
    echo "  • Verificación de salud: Cada 30 minutos"
    echo ""
    echo "Para ver logs: tail -f $LOG_FILE"
    echo "Para listar cron jobs: $0 --list"
    echo "Para remover cron jobs: $0 --remove"
}

# Función principal
main() {
    log "=== CONFIGURACIÓN DE CRON JOBS PARA LLUMINATA ==="
    
    # Verificar si solo queremos listar
    if [[ "$LIST_CRON" == "true" ]]; then
        list_cron_jobs
        exit 0
    fi
    
    # Verificar si solo queremos remover
    if [[ "$REMOVE_CRON" == "true" ]]; then
        remove_cron_jobs
        exit 0
    fi
    
    # Verificar permisos
    check_permissions
    
    # Remover cron jobs existentes si los hay
    remove_cron_jobs
    
    # Crear nuevos cron jobs
    create_cron_jobs
    
    # Verificar configuración
    verify_cron_setup
    
    # Mostrar información de configuración
    show_configuration
    
    log "=== CONFIGURACIÓN COMPLETADA ==="
    log "Los cron jobs se ejecutarán automáticamente según la programación configurada"
}

# Ejecutar función principal
main "$@"
