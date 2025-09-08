# Actualización de TensorFlow.js a v4

## Problema Resuelto

Se ha actualizado el proyecto de TensorFlow.js v3 a v4 para resolver conflictos de dependencias que impedían el build en Vercel.

## Cambios Realizados

### 1. Dependencias Actualizadas

- `@tensorflow/tfjs`: `^3.21.0` → `^4.22.0`
- `@tensorflow/tfjs-layers`: `^3.21.0` → `^4.22.0`
- `@tensorflow/tfjs-backend-cpu`: Agregado `^4.22.0`
- `@tensorflow/tfjs-backend-webgl`: Agregado `^4.22.0`
- `@tensorflow-models/speech-commands`: Eliminado (incompatible con TF.js v4)

### 2. Código Actualizado

- **Archivo**: `ml-models/speech-recognition-model.ts`
- **Cambio**: Reemplazada la implementación de `@tensorflow-models/speech-commands` con una implementación personalizada compatible con TF.js v4
- **Funcionalidad**: Mantiene toda la funcionalidad de reconocimiento de voz pero usa solo TensorFlow.js v4

### 3. Configuración de npm

- **Archivo**: `.npmrc`
- **Configuración**: Opciones para resolver conflictos de dependencias
  - `legacy-peer-deps=true`
  - `strict-peer-dependencies=false`
  - `auto-install-peers=true`

## Scripts de Instalación

### Para Linux/macOS:
```bash
npm run install:clean
npm run build:clean
```

### Para Windows:
```powershell
npm run install:clean:win
npm run build:clean:win
```

### Scripts de PowerShell:
```powershell
# Ejecutar script de instalación
.\scripts\install-deps.ps1
```

## Instalación Manual

Si prefieres instalar manualmente:

```bash
# Limpiar instalación anterior
npm cache clean --force
rm -rf node_modules package-lock.json

# Instalar con opciones de compatibilidad
npm install --legacy-peer-deps

# Verificar instalación
npm list @tensorflow/tfjs @tensorflow/tfjs-layers
```

## Verificación

Después de la instalación, verifica que las versiones sean correctas:

```bash
npm list @tensorflow/tfjs @tensorflow/tfjs-layers @tensorflow/tfjs-backend-cpu @tensorflow/tfjs-backend-webgl
```

Deberías ver versiones 4.22.x para todos los paquetes de TensorFlow.js.

## Funcionalidad Mantenida

- ✅ Reconocimiento de voz personalizado
- ✅ Soporte para múltiples idiomas (español, maya, náhuatl, quechua)
- ✅ Extracción de características de audio (MFCC, formantes, pitch)
- ✅ Modelo de machine learning personalizable
- ✅ Adaptación cultural para comunidades indígenas

## Notas Importantes

1. **Compatibilidad**: El código ahora es compatible con TensorFlow.js v4
2. **Performance**: TF.js v4 ofrece mejor rendimiento y compatibilidad con navegadores modernos
3. **Funcionalidad**: No se perdió ninguna funcionalidad del modelo de reconocimiento de voz
4. **Build**: El proyecto ahora debería compilar correctamente en Vercel

## Solución de Problemas

### Error de dependencias:
```bash
npm install --legacy-peer-deps
```

### Error de build:
```bash
npm run build:clean
```

### Verificar versiones:
```bash
npm list | grep tensorflow
```

## Próximos Pasos

1. Ejecutar `npm run install:clean` (o `npm run install:clean:win` en Windows)
2. Verificar que no hay errores de dependencias
3. Ejecutar `npm run build` para verificar que compila correctamente
4. Desplegar en Vercel

## Soporte

Si encuentras problemas después de la actualización:

1. Verifica que estés usando Node.js 18+ y npm 9+
2. Ejecuta `npm run install:clean` para reinstalación limpia
3. Revisa los logs de error para identificar problemas específicos
