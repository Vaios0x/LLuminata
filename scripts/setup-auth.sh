#!/bin/bash

# Script de configuración de autenticación para LLuminata
# Este script ayuda a configurar las variables de entorno necesarias

echo "🔐 Configurando sistema de autenticación para LLuminata"
echo "================================================================"

# Verificar si existe .env
if [ ! -f .env ]; then
    echo "📝 Creando archivo .env desde .env.example..."
    cp env.example .env
    echo "✅ Archivo .env creado"
else
    echo "✅ Archivo .env ya existe"
fi

# Generar NEXTAUTH_SECRET si no existe
if ! grep -q "NEXTAUTH_SECRET=" .env || grep -q "your-nextauth-secret-here" .env; then
    echo "🔑 Generando NEXTAUTH_SECRET..."
    SECRET=$(openssl rand -base64 32)
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s/NEXTAUTH_SECRET=.*/NEXTAUTH_SECRET=\"$SECRET\"/" .env
    else
        # Linux
        sed -i "s/NEXTAUTH_SECRET=.*/NEXTAUTH_SECRET=\"$SECRET\"/" .env
    fi
    echo "✅ NEXTAUTH_SECRET generado y configurado"
else
    echo "✅ NEXTAUTH_SECRET ya está configurado"
fi

# Generar JWT_SECRET si no existe
if ! grep -q "JWT_SECRET=" .env || grep -q "your-jwt-secret-here" .env; then
    echo "🔑 Generando JWT_SECRET..."
    JWT_SECRET=$(openssl rand -base64 32)
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s/JWT_SECRET=.*/JWT_SECRET=\"$JWT_SECRET\"/" .env
    else
        # Linux
        sed -i "s/JWT_SECRET=.*/JWT_SECRET=\"$JWT_SECRET\"/" .env
    fi
    echo "✅ JWT_SECRET generado y configurado"
else
    echo "✅ JWT_SECRET ya está configurado"
fi

# Generar ENCRYPTION_KEY si no existe
if ! grep -q "ENCRYPTION_KEY=" .env || grep -q "your-secure-encryption-key-here" .env; then
    echo "🔑 Generando ENCRYPTION_KEY..."
    ENCRYPTION_KEY=$(openssl rand -base64 32)
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s/ENCRYPTION_KEY=.*/ENCRYPTION_KEY=\"$ENCRYPTION_KEY\"/" .env
    else
        # Linux
        sed -i "s/ENCRYPTION_KEY=.*/ENCRYPTION_KEY=\"$ENCRYPTION_KEY\"/" .env
    fi
    echo "✅ ENCRYPTION_KEY generado y configurado"
else
    echo "✅ ENCRYPTION_KEY ya está configurado"
fi

echo ""
echo "📋 Configuración de proveedores sociales:"
echo "=========================================="
echo ""
echo "🔍 Para configurar Google OAuth:"
echo "1. Ve a https://console.cloud.google.com/"
echo "2. Crea un nuevo proyecto o selecciona uno existente"
echo "3. Habilita la API de Google+"
echo "4. Crea credenciales OAuth 2.0"
echo "5. Agrega http://localhost:3000/api/auth/callback/google como URI de redirección"
echo "6. Copia el Client ID y Client Secret"
echo "7. Actualiza GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET en .env"
echo ""
echo "🔍 Para configurar Facebook OAuth:"
echo "1. Ve a https://developers.facebook.com/"
echo "2. Crea una nueva aplicación"
echo "3. Agrega el producto de Facebook Login"
echo "4. Configura las URLs de redirección"
echo "5. Copia el App ID y App Secret"
echo "6. Actualiza FACEBOOK_CLIENT_ID y FACEBOOK_CLIENT_SECRET en .env"
echo ""

# Verificar si las dependencias están instaladas
echo "📦 Verificando dependencias..."
if npm list next-auth@beta > /dev/null 2>&1; then
    echo "✅ NextAuth.js está instalado"
else
    echo "⚠️  NextAuth.js no está instalado. Ejecutando instalación..."
    npm install next-auth@beta @auth/prisma-adapter bcryptjs @types/bcryptjs
fi

# Generar cliente de Prisma
echo "🗄️  Generando cliente de Prisma..."
npx prisma generate

# Verificar base de datos
echo "🗄️  Verificando base de datos..."
npx prisma db push

echo ""
echo "🎉 ¡Configuración completada!"
echo "=============================="
echo ""
echo "📝 Próximos pasos:"
echo "1. Configura los proveedores sociales (Google/Facebook)"
echo "2. Actualiza las variables de entorno en .env"
echo "3. Ejecuta 'npm run dev' para iniciar el servidor"
echo "4. Visita http://localhost:3000/auth/signup para probar el registro"
echo ""
echo "📚 Documentación: docs/AUTHENTICATION.md"
echo ""
