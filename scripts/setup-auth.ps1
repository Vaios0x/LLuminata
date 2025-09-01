# Script de configuración de autenticación para LLuminata (PowerShell)
# Este script ayuda a configurar las variables de entorno necesarias

Write-Host "🔐 Configurando sistema de autenticación para LLuminata" -ForegroundColor Green
Write-Host "================================================================" -ForegroundColor Green

# Verificar si existe .env
if (-not (Test-Path ".env")) {
    Write-Host "📝 Creando archivo .env desde .env.example..." -ForegroundColor Yellow
    Copy-Item "env.example" ".env"
    Write-Host "✅ Archivo .env creado" -ForegroundColor Green
} else {
    Write-Host "✅ Archivo .env ya existe" -ForegroundColor Green
}

# Función para generar secretos aleatorios
function New-RandomSecret {
    $bytes = New-Object Byte[] 32
    (New-Object Security.Cryptography.RNGCryptoServiceProvider).GetBytes($bytes)
    return [Convert]::ToBase64String($bytes)
}

# Generar NEXTAUTH_SECRET si no existe
$envContent = Get-Content ".env" -Raw
if ($envContent -match "NEXTAUTH_SECRET=.*your-nextauth-secret-here" -or $envContent -notmatch "NEXTAUTH_SECRET=") {
    Write-Host "🔑 Generando NEXTAUTH_SECRET..." -ForegroundColor Yellow
    $secret = New-RandomSecret
    $envContent = $envContent -replace "NEXTAUTH_SECRET=.*", "NEXTAUTH_SECRET=`"$secret`""
    Set-Content ".env" $envContent
    Write-Host "✅ NEXTAUTH_SECRET generado y configurado" -ForegroundColor Green
} else {
    Write-Host "✅ NEXTAUTH_SECRET ya está configurado" -ForegroundColor Green
}

# Generar JWT_SECRET si no existe
$envContent = Get-Content ".env" -Raw
if ($envContent -match "JWT_SECRET=.*your-jwt-secret-here" -or $envContent -notmatch "JWT_SECRET=") {
    Write-Host "🔑 Generando JWT_SECRET..." -ForegroundColor Yellow
    $jwtSecret = New-RandomSecret
    $envContent = $envContent -replace "JWT_SECRET=.*", "JWT_SECRET=`"$jwtSecret`""
    Set-Content ".env" $envContent
    Write-Host "✅ JWT_SECRET generado y configurado" -ForegroundColor Green
} else {
    Write-Host "✅ JWT_SECRET ya está configurado" -ForegroundColor Green
}

# Generar ENCRYPTION_KEY si no existe
$envContent = Get-Content ".env" -Raw
if ($envContent -match "ENCRYPTION_KEY=.*your-secure-encryption-key-here" -or $envContent -notmatch "ENCRYPTION_KEY=") {
    Write-Host "🔑 Generando ENCRYPTION_KEY..." -ForegroundColor Yellow
    $encryptionKey = New-RandomSecret
    $envContent = $envContent -replace "ENCRYPTION_KEY=.*", "ENCRYPTION_KEY=`"$encryptionKey`""
    Set-Content ".env" $envContent
    Write-Host "✅ ENCRYPTION_KEY generado y configurado" -ForegroundColor Green
} else {
    Write-Host "✅ ENCRYPTION_KEY ya está configurado" -ForegroundColor Green
}

Write-Host ""
Write-Host "📋 Configuración de proveedores sociales:" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "🔍 Para configurar Google OAuth:" -ForegroundColor Yellow
Write-Host "1. Ve a https://console.cloud.google.com/" -ForegroundColor White
Write-Host "2. Crea un nuevo proyecto o selecciona uno existente" -ForegroundColor White
Write-Host "3. Habilita la API de Google+" -ForegroundColor White
Write-Host "4. Crea credenciales OAuth 2.0" -ForegroundColor White
Write-Host "5. Agrega http://localhost:3000/api/auth/callback/google como URI de redirección" -ForegroundColor White
Write-Host "6. Copia el Client ID y Client Secret" -ForegroundColor White
Write-Host "7. Actualiza GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET en .env" -ForegroundColor White
Write-Host ""
Write-Host "🔍 Para configurar Facebook OAuth:" -ForegroundColor Yellow
Write-Host "1. Ve a https://developers.facebook.com/" -ForegroundColor White
Write-Host "2. Crea una nueva aplicación" -ForegroundColor White
Write-Host "3. Agrega el producto de Facebook Login" -ForegroundColor White
Write-Host "4. Configura las URLs de redirección" -ForegroundColor White
Write-Host "5. Copia el App ID y App Secret" -ForegroundColor White
Write-Host "6. Actualiza FACEBOOK_CLIENT_ID y FACEBOOK_CLIENT_SECRET en .env" -ForegroundColor White
Write-Host ""

# Verificar si las dependencias están instaladas
Write-Host "📦 Verificando dependencias..." -ForegroundColor Yellow
try {
    $null = npm list next-auth@beta 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ NextAuth.js está instalado" -ForegroundColor Green
    } else {
        throw "Not installed"
    }
} catch {
    Write-Host "⚠️  NextAuth.js no está instalado. Ejecutando instalación..." -ForegroundColor Yellow
    npm install next-auth@beta @auth/prisma-adapter bcryptjs @types/bcryptjs
}

# Generar cliente de Prisma
Write-Host "🗄️  Generando cliente de Prisma..." -ForegroundColor Yellow
npx prisma generate

# Verificar base de datos
Write-Host "🗄️  Verificando base de datos..." -ForegroundColor Yellow
npx prisma db push

Write-Host ""
Write-Host "🎉 ¡Configuración completada!" -ForegroundColor Green
Write-Host "==============================" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Próximos pasos:" -ForegroundColor Cyan
Write-Host "1. Configura los proveedores sociales (Google/Facebook)" -ForegroundColor White
Write-Host "2. Actualiza las variables de entorno en .env" -ForegroundColor White
Write-Host "3. Ejecuta 'npm run dev' para iniciar el servidor" -ForegroundColor White
Write-Host "4. Visita http://localhost:3000/auth/signup para probar el registro" -ForegroundColor White
Write-Host ""
Write-Host "📚 Documentación: docs/AUTHENTICATION.md" -ForegroundColor Cyan
Write-Host ""
