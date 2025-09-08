#!/bin/bash

echo "🔧 Instalando dependencias con configuración optimizada..."

# Limpiar cache de npm
npm cache clean --force

# Eliminar node_modules si existe
if [ -d "node_modules" ]; then
    echo "🗑️ Eliminando node_modules existente..."
    rm -rf node_modules
fi

# Instalar dependencias con opciones de compatibilidad
echo "📦 Instalando dependencias..."
npm install --legacy-peer-deps --no-audit

# Verificar instalación
if [ $? -eq 0 ]; then
    echo "✅ Dependencias instaladas exitosamente"
    
    # Verificar versiones de TensorFlow.js
    echo "🔍 Verificando versiones de TensorFlow.js..."
    npm list @tensorflow/tfjs @tensorflow/tfjs-layers @tensorflow/tfjs-backend-cpu @tensorflow/tfjs-backend-webgl
    
    echo "🚀 Instalación completada. Puedes ejecutar 'npm run build' ahora."
else
    echo "❌ Error en la instalación. Revisa los logs arriba."
    exit 1
fi
