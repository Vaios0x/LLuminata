# 📦 Sistema de Contenido Offline - InclusiveAI Coach

## 🎯 Descripción General

El sistema de contenido offline de InclusiveAI Coach permite generar, distribuir y consumir contenido educativo adaptado culturalmente sin necesidad de conexión a internet. Está diseñado específicamente para poblaciones vulnerables en áreas rurales con conectividad limitada.

## 🏗️ Arquitectura del Sistema

### Componentes Principales

1. **Generador de Paquetes Offline** (`lib/offline-content-generator.ts`)
   - Genera paquetes personalizados por estudiante
   - Optimiza recursos multimedia
   - Adapta contenido culturalmente

2. **Gestor de Contenido Offline** (`components/offline/offline-content-manager.tsx`)
   - Interfaz para descargar e instalar paquetes
   - Gestión de almacenamiento local
   - Sincronización automática

3. **Visor de Contenido Cultural** (`components/offline/cultural-content-viewer.tsx`)
   - Reproduce contenido offline
   - Soporte para múltiples formatos
   - Accesibilidad completa

4. **API de Paquetes** (`app/api/offline/packages/route.ts`)
   - Endpoint para generar paquetes
   - Validación de estudiantes
   - Adaptación cultural

## 🚀 Características Principales

### ✅ Generación de Paquetes Offline
- **Personalización por estudiante**: Cada paquete se adapta al perfil del estudiante
- **Optimización automática**: Imágenes, audio y video optimizados para conexiones lentas
- **Adaptación cultural**: Contenido adaptado a culturas específicas (maya, nahuatl, afrodescendiente)
- **Metadatos completos**: Información detallada sobre tamaño, compatibilidad y requisitos

### ✅ Contenido Culturalmente Adaptado
- **Ejemplos locales**: Referencias a elementos culturales específicos
- **Idiomas indígenas**: Soporte para maya, k'iche', nahuatl
- **Valores comunitarios**: Integración de tradiciones y valores locales
- **Contexto relevante**: Contenido contextualizado para cada región

### ✅ Recursos Multimedia Optimizados
- **Imágenes**: Redimensionadas y comprimidas automáticamente
- **Audio**: Convertido a formatos eficientes (AAC, 64kbps)
- **Video**: Optimizado para dispositivos móviles (640x480, 500kbps)
- **Checksums**: Verificación de integridad de archivos

## 📋 Estructura de Paquetes

### Formato de Paquete
```json
{
  "id": "package-abc12345",
  "version": "1.0.0",
  "studentId": "student-123",
  "culture": "maya",
  "language": "es-GT",
  "lessons": [...],
  "resources": [...],
  "metadata": {
    "totalLessons": 5,
    "totalResources": 12,
    "totalSize": 52428800,
    "estimatedDownloadTime": 300,
    "compatibility": ["mobile", "tablet", "desktop"],
    "requirements": {
      "minStorage": 55000000,
      "minBandwidth": 100,
      "supportedDevices": ["Android 8+", "iOS 12+"]
    }
  },
  "size": 52428800,
  "checksum": "sha256-hash",
  "createdAt": "2025-01-15T10:00:00Z",
  "expiresAt": "2025-02-15T10:00:00Z"
}
```

### Estructura de Lecciones
```json
{
  "id": "lesson-456",
  "title": "Los Números en Maya",
  "description": "Aprende a contar del 1 al 10 en idioma maya",
  "content": {
    "text": "Hoy aprenderemos a contar en maya...",
    "audio": "/audio/lesson-456.mp3",
    "images": ["/images/numbers-maya.jpg"],
    "videos": ["/videos/counting-lesson.mp4"]
  },
  "culturalVariants": {
    "examples": ["maíz", "frijoles", "calabazas"],
    "context": "agricultura tradicional maya"
  },
  "accessibilityFeatures": {
    "hasAudio": true,
    "hasVisualAids": true,
    "hasTextAlternative": true,
    "supportsVoiceControl": true
  },
  "multimedia": [...],
  "size": 2048576,
  "checksum": "sha256-hash"
}
```

## 🔧 Configuración y Uso

### Instalación de Dependencias
```bash
# Instalar dependencias principales
npm install

# Instalar herramientas de optimización (opcional)
# FFmpeg para optimización de audio/video
# Sharp para optimización de imágenes
```

### Generación de Paquetes

#### Generación Individual
```bash
# Generar paquete para un estudiante específico
curl -X POST http://localhost:3000/api/offline/packages \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "student-123",
    "culture": "maya",
    "language": "es-GT"
  }'
```

#### Generación en Lote
```bash
# Generar paquetes para todos los estudiantes
npm run generate-offline

# Limpiar paquetes existentes
npm run offline:clean

# Generar y construir para producción
npm run offline:build
```

### Uso en la Aplicación

#### Gestor de Contenido Offline
```tsx
import { OfflineContentManager } from '@/components/offline/offline-content-manager';

export default function OfflinePage() {
  return (
    <OfflineContentManager
      studentId="student-123"
      culture="maya"
      language="es-GT"
    />
  );
}
```

#### Visor de Contenido Cultural
```tsx
import { CulturalContentViewer } from '@/components/offline/cultural-content-viewer';

export default function LessonPage() {
  return (
    <CulturalContentViewer
      contentId="lesson-456"
      culture="maya"
      language="es-GT"
      isOffline={true}
    />
  );
}
```

## 🌐 APIs Disponibles

### GET /api/offline/packages
Obtiene un paquete offline para un estudiante.

**Parámetros:**
- `studentId` (requerido): ID del estudiante
- `culture` (opcional): Cultura objetivo (default: maya)
- `language` (opcional): Idioma objetivo (default: es-GT)

**Respuesta:**
```json
{
  "id": "package-abc12345",
  "version": "1.0.0",
  "studentId": "student-123",
  "culture": "maya",
  "language": "es-GT",
  "lessons": [...],
  "resources": [...],
  "metadata": {...},
  "size": 52428800,
  "checksum": "sha256-hash",
  "createdAt": "2025-01-15T10:00:00Z",
  "expiresAt": "2025-02-15T10:00:00Z"
}
```

### POST /api/offline/packages
Genera un nuevo paquete offline.

**Body:**
```json
{
  "studentId": "student-123",
  "culture": "maya",
  "language": "es-GT",
  "forceRegenerate": false
}
```

**Respuesta:**
```json
{
  "success": true,
  "package": {...},
  "message": "Paquete offline generado exitosamente"
}
```

## 📊 Optimización de Recursos

### Imágenes
- **Formato**: JPEG progresivo
- **Calidad**: 80%
- **Tamaño máximo**: 800x600px
- **Compresión**: Automática con Sharp

### Audio
- **Formato**: AAC
- **Bitrate**: 64 kbps
- **Frecuencia**: 44.1 kHz
- **Canales**: Mono (para ahorrar espacio)

### Video
- **Formato**: MP4 (H.264)
- **Bitrate**: 500 kbps
- **Resolución**: 640x480
- **FPS**: 24
- **Audio**: AAC 64 kbps

### Documentos
- **Formato**: JSON optimizado
- **Compresión**: Gzip (cuando sea posible)
- **Metadatos**: Incluidos para búsqueda offline

## 🔄 Sincronización

### Cola de Sincronización
```typescript
interface SyncQueue {
  type: 'lesson_completion' | 'assessment_result' | 'progress_update';
  data: any;
  timestamp: number;
  synced: boolean;
}
```

### Proceso de Sincronización
1. **Detección de conexión**: Monitoreo automático del estado de red
2. **Cola de elementos**: Almacenamiento local de datos pendientes
3. **Sincronización automática**: Proceso automático cuando hay conexión
4. **Reintentos**: Manejo de errores con reintentos exponenciales
5. **Verificación**: Confirmación de sincronización exitosa

## ♿ Accesibilidad

### Características Implementadas
- **Lector de pantalla**: Soporte completo para síntesis de voz
- **Navegación por teclado**: Controles accesibles sin mouse
- **Alto contraste**: Modos de visualización adaptados
- **Tamaños de fuente**: Ajustables según necesidades
- **Audio descriptivo**: Narración de contenido visual
- **Subtítulos**: Para contenido de video

### Adaptaciones por Necesidades Especiales
- **Dislexia**: Fuentes grandes, espaciado aumentado, audio obligatorio
- **TDAH**: Pausas programadas, indicadores de progreso
- **Discapacidad visual**: Alto contraste, audio descriptivo
- **Discapacidad auditiva**: Subtítulos, texto alternativo

## 🛠️ Desarrollo y Testing

### Scripts de Desarrollo
```bash
# Generar paquetes de prueba
npm run generate-offline

# Limpiar contenido offline
npm run offline:clean

# Construir con contenido offline
npm run offline:build

# Probar sincronización
npm run test:sync
```

### Testing Offline
```bash
# Simular modo offline
# 1. Desconectar internet
# 2. Abrir DevTools > Network
# 3. Marcar "Offline"
# 4. Probar funcionalidad

# Verificar almacenamiento
# 1. DevTools > Application
# 2. IndexedDB > InclusiveAIOffline
# 3. Verificar paquetes instalados
```

## 📈 Métricas y Monitoreo

### Métricas de Rendimiento
- **Tiempo de generación**: Promedio por paquete
- **Tamaño de paquetes**: Distribución por cultura/idioma
- **Tasa de descarga**: Éxito vs fallos
- **Uso de almacenamiento**: Espacio utilizado por estudiante
- **Tiempo offline**: Duración de uso sin conexión

### Logs de Sistema
```typescript
interface OfflineLog {
  timestamp: Date;
  event: 'package_generated' | 'package_downloaded' | 'sync_completed';
  studentId: string;
  packageId?: string;
  size?: number;
  duration?: number;
  success: boolean;
  error?: string;
}
```

## 🔒 Seguridad

### Validación de Paquetes
- **Checksums SHA-256**: Verificación de integridad
- **Firmas digitales**: Autenticación de origen
- **Expiración**: Paquetes con fecha de caducidad
- **Validación de contenido**: Verificación de formato y estructura

### Privacidad
- **Datos locales**: Almacenamiento en dispositivo del usuario
- **Sin tracking**: No se envían datos de uso offline
- **Consentimiento**: Permisos explícitos para almacenamiento
- **Limpieza automática**: Eliminación de datos antiguos

## 🚨 Troubleshooting

### Problemas Comunes

#### Error: "Espacio insuficiente"
```bash
# Verificar espacio disponible
navigator.storage.estimate().then(estimate => {
  console.log('Espacio usado:', estimate.usage);
  console.log('Espacio disponible:', estimate.quota - estimate.usage);
});

# Limpiar paquetes antiguos
npm run offline:clean
```

#### Error: "Paquete corrupto"
```bash
# Verificar checksum
# Regenerar paquete
curl -X POST /api/offline/packages -d '{"studentId":"123","forceRegenerate":true}'
```

#### Error: "Sincronización fallida"
```bash
# Verificar conexión
# Revisar cola de sincronización
# Reintentar manualmente
```

### Logs de Debug
```bash
# Habilitar logs detallados
DEBUG=offline:* npm run dev

# Ver logs en tiempo real
tail -f logs/offline.log
```

## 📚 Recursos Adicionales

- [Documentación de PWA](https://web.dev/progressive-web-apps/)
- [Guía de IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [Optimización de Imágenes](https://web.dev/fast/#optimize-your-images)
- [Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Accesibilidad Web](https://www.w3.org/WAI/)

---

**Nota**: Este sistema está diseñado para funcionar en entornos con conectividad limitada y está optimizado para dispositivos móviles de gama baja. Todas las optimizaciones están pensadas para maximizar la accesibilidad y minimizar el uso de datos.
