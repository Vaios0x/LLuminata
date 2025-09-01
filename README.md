# 🎯 LLuminata

Plataforma de aprendizaje adaptativo con IA para poblaciones vulnerables en América Latina.

## 🚀 Configuración Rápida

### 1. Instalar Dependencias
```bash
npm install
```

### 2. Configurar Base de Datos
```bash
# Generar cliente de Prisma
npm run db:generate

# Crear migraciones
npm run db:migrate

# Poblar con datos de prueba
npm run db:seed
```

### 3. Iniciar Desarrollo
```bash
npm run dev
```

## 📊 Base de Datos

### Estado Actual
- ✅ **SQLite** configurado para desarrollo
- ✅ **Esquema completo** con todos los modelos
- ✅ **Datos de prueba** cargados (2 maestros, 2 estudiantes, 2 lecciones)
- ✅ **APIs de IA** configuradas
- ✅ **Sincronización offline** implementada

### Comandos de Base de Datos
```bash
npm run db:studio    # Abrir interfaz de base de datos
npm run db:seed      # Poblar con datos de prueba
npm run db:test      # Probar conexión
npm run db:generate  # Regenerar cliente de Prisma
npm run db:migrate   # Aplicar migraciones
```

### Datos de Prueba Incluidos
- **Maestros**: María González, Carlos Méndez
- **Estudiantes**: Juan López, María Santos
- **Lecciones**: "Los Números en Maya", "Lectura Básica"
- **Evaluaciones**: iniciales y de progreso
- **Necesidades especiales**: dislexia detectada por IA

## 🏗️ Arquitectura

### Stack Tecnológico
- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **Base de Datos**: SQLite (dev) / PostgreSQL (prod)
- **ORM**: Prisma
- **IA**: OpenAI + Anthropic
- **Offline**: Dexie.js (IndexedDB)
- **PWA**: Service Worker + Manifest

### Características Principales
- 🔍 **Detección automática** de necesidades especiales
- 🌍 **Adaptación cultural** (maya, nahuatl, afrodescendiente)
- 📱 **Funcionalidad offline** con sincronización inteligente
- 🗣️ **Soporte multiidioma** (15+ idiomas/dialectos)
- ♿ **Accesibilidad completa** para personas con discapacidades

## 📁 Estructura del Proyecto

```
inclusive-ai-coach/
├── app/                    # Next.js App Router
│   ├── api/               # APIs de backend
│   │   ├── ai/           # Servicios de IA
│   │   └── sync/         # Sincronización offline
│   ├── (learning)/       # Rutas de aprendizaje
│   ├── (teacher)/        # Panel de maestros
│   └── (admin)/          # Panel administrativo
├── components/            # Componentes React
│   ├── accessibility/    # Componentes de accesibilidad
│   ├── adaptive/         # Contenido adaptativo
│   ├── offline/          # Funcionalidad offline
│   └── ui/              # Componentes de UI
├── prisma/               # Base de datos
│   ├── schema.prisma     # Esquema de Prisma
│   ├── seed.ts          # Datos de prueba
│   └── migrations/      # Migraciones
├── lib/                  # Utilidades
│   ├── ai-services.ts   # Servicios de IA
│   ├── offline-db.ts    # Base de datos offline
│   └── hooks/           # Hooks personalizados
└── public/              # Archivos estáticos
    ├── manifest.json    # PWA manifest
    └── service-worker.js # Service worker
```

## 🌐 APIs Disponibles

### Detección de Necesidades
```typescript
POST /api/ai/needs-detection
{
  "studentId": "string",
  "interactionData": {
    "readingSpeed": number,
    "errorPatterns": string[],
    "responseTime": number
  }
}
```

### Adaptación Cultural
```typescript
POST /api/ai/content-adaptation
{
  "content": object,
  "targetCulture": "maya|nahuatl|afrodescendiente",
  "language": "es-GT|maya|k'iche'"
}
```

### Sincronización Offline
```typescript
POST /api/sync
{
  "items": [
    {
      "type": "lesson_completion",
      "data": { ... }
    }
  ]
}
```

## 🎯 Objetivos del Proyecto

### Metas
- **Target**: 100,000 estudiantes vulnerables en Guatemala, Nicaragua, México rural
- **Objetivo**: 60% mejora en alfabetización, 45% en finalización educación básica

### Poblaciones Objetivo
- **Indígenas**: Maya, Nahuatl, K'iche', Q'eqchi'
- **Afrodescendientes**: Costa Caribe, comunidades afro
- **Rurales**: Zonas con acceso limitado a internet
- **Personas con discapacidades**: Visual, auditiva, motora, cognitiva

## 🔧 Desarrollo

### Variables de Entorno
```env
# Base de datos (desarrollo)
DATABASE_URL="file:./dev.db"

# APIs de IA
OPENAI_API_KEY=your-openai-key
ANTHROPIC_API_KEY=your-anthropic-key
```

### Scripts Disponibles
```bash
npm run dev          # Desarrollo con Turbopack
npm run build        # Build de producción
npm run start        # Servidor de producción
npm run lint         # Linting
```

## 📚 Documentación

- [📊 Base de Datos](./docs/DATABASE.md) - Guía completa de la base de datos
- [🤖 Servicios de IA](./docs/AI-SERVICES.md) - Documentación de APIs de IA
- [📱 PWA y Offline](./docs/PWA.md) - Configuración PWA
- [♿ Accesibilidad](./docs/ACCESSIBILITY.md) - Guías de accesibilidad

## 🤝 Contribuir

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🆘 Soporte

Para soporte técnico o preguntas sobre el proyecto:
- 📧 Email: soporte@inclusiveai.org
- 💬 Discord: [InclusiveAI Community](https://discord.gg/inclusiveai)
- 📖 Documentación: [docs.inclusiveai.org](https://docs.inclusiveai.org)
