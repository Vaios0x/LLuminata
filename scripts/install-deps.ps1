# Script de instalación de dependencias para Windows PowerShell
Write-Host "🔧 Instalando dependencias con configuración optimizada..." -ForegroundColor Green

# Limpiar cache de npm
Write-Host "🧹 Limpiando cache de npm..." -ForegroundColor Yellow
npm cache clean --force

# Eliminar node_modules si existe
if (Test-Path "node_modules") {
    Write-Host "🗑️ Eliminando node_modules existente..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force "node_modules"
}

# Instalar dependencias con opciones de compatibilidad
Write-Host "📦 Instalando dependencias..." -ForegroundColor Yellow
npm install --legacy-peer-deps --no-audit

# Verificar instalación
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Dependencias instaladas exitosamente" -ForegroundColor Green
    
    # Verificar versiones de TensorFlow.js
    Write-Host "🔍 Verificando versiones de TensorFlow.js..." -ForegroundColor Yellow
    npm list @tensorflow/tfjs @tensorflow/tfjs-layers @tensorflow/tfjs-backend-cpu @tensorflow/tfjs-backend-webgl
    
    Write-Host "🚀 Instalación completada. Puedes ejecutar 'npm run build' ahora." -ForegroundColor Green
} else {
    Write-Host "❌ Error en la instalación. Revisa los logs arriba." -ForegroundColor Red
    exit 1
}
