# Script de PowerShell para configurar permisos en Windows
# Uso: .\scripts\setup-permissions.ps1

Write-Host "🔧 Configurando permisos para scripts de backup..." -ForegroundColor Green

# Configurar permisos para scripts de bash (para WSL o Git Bash)
$scripts = @(
    "scripts\backup-postgresql.sh",
    "scripts\setup-cron.sh"
)

foreach ($script in $scripts) {
    if (Test-Path $script) {
        Write-Host "✅ Configurando permisos para: $script" -ForegroundColor Blue
        # En Windows, los archivos .sh se ejecutan con Git Bash o WSL
        # Los permisos se manejan automáticamente
    } else {
        Write-Host "⚠️  Archivo no encontrado: $script" -ForegroundColor Yellow
    }
}

# Crear directorios necesarios
$directories = @(
    "backups",
    "backups\postgresql",
    "backups\production"
)

foreach ($dir in $directories) {
    if (!(Test-Path $dir)) {
        Write-Host "📁 Creando directorio: $dir" -ForegroundColor Blue
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }
}

Write-Host "✅ Configuración de permisos completada" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Próximos pasos:" -ForegroundColor Cyan
Write-Host "   1. Configurar variables de entorno en .env"
Write-Host "   2. Iniciar servicios con Docker: docker-compose up -d"
Write-Host "   3. Ejecutar migración: npm run db:migrate-to-postgresql"
Write-Host "   4. Configurar backup automático: .\scripts\setup-cron.sh"
