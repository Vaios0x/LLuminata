# Servicios de Adaptación Cultural y Accesibilidad - InclusiveAI Coach

## Descripción General

Este directorio contiene los servicios principales de adaptación cultural y accesibilidad para InclusiveAI Coach, diseñados para proporcionar una experiencia educativa inclusiva y culturalmente relevante.

## Estructura de Servicios

```
lib/
├── cultural-adapter.ts          # Servicio de adaptación cultural
├── accessibility.ts             # Servicio de accesibilidad
├── cultural-integration.ts      # Servicio de integración cultural
├── ai-services.ts              # Servicios de IA unificados
└── README.md                   # Esta documentación
```

## Servicios Implementados

### 1. Cultural Adapter (`cultural-adapter.ts`)

**Propósito:** Maneja la adaptación de contenido educativo a diferentes contextos culturales indígenas.

**Características principales:**
- Soporte para 6 culturas indígenas (Maya, Náhuatl, Zapoteco, Mixteco, Otomí, Quechua)
- Adaptación de contenido por materia (matemáticas, ciencias, historia, lenguaje)
- Gestión de assets culturales (imágenes, audio, video, documentos)
- Traducciones y adaptaciones de lenguaje
- Análisis de sensibilidad cultural

**Culturas soportadas:**
- **Maya:** Yucatán, Quintana Roo, Campeche, Chiapas, Guatemala
- **Náhuatl:** México, Puebla, Morelos, Tlaxcala, Hidalgo
- **Zapoteco:** Oaxaca, Istmo, Sierra Norte, Valles Centrales
- **Mixteco:** Oaxaca, Puebla, Guerrero
- **Otomí:** Hidalgo, Querétaro, México, Tlaxcala
- **Quechua:** Perú, Bolivia, Ecuador, Argentina

**Ejemplo de uso:**
```typescript
import { culturalAdapter } from './cultural-adapter';

const adaptation = await culturalAdapter.adaptContent({
  content: "Resuelve: 5 + 3 = ?",
  culturalContext: {
    culture: "maya",
    language: "maya",
    region: "Yucatán"
  },
  subject: "mathematics",
  difficulty: "easy"
});
```

### 2. Accessibility Service (`accessibility.ts`)

**Propósito:** Maneja todas las funcionalidades de accesibilidad para usuarios con necesidades especiales.

**Características principales:**
- 15+ características de accesibilidad
- Perfiles de usuario personalizables
- Auditorías automáticas de accesibilidad
- Cumplimiento de estándares WCAG 2.1 AA
- Soporte para tecnologías asistivas

**Categorías de accesibilidad:**
- **Visual:** Alto contraste, texto grande, lector de pantalla, soporte para daltonismo
- **Auditiva:** Subtítulos, descripciones de audio, alertas visuales
- **Motora:** Navegación por teclado, control por voz, interruptores, seguimiento ocular
- **Cognitiva:** Interfaz simplificada, asistente de lectura, modo de enfoque, ayudas de memoria

**Ejemplo de uso:**
```typescript
import { accessibilityService } from './accessibility';

const profile = await accessibilityService.createProfile(userId, {
  visualAcuity: 'low',
  hearing: 'normal',
  motorCoordination: 'normal',
  cognitiveProcessing: 'normal',
  preferences: {
    highContrast: true,
    largeText: true,
    screenReader: false
  }
});

const audit = await accessibilityService.performAudit(userId, profile);
```

### 3. Cultural Integration Service (`cultural-integration.ts`)

**Propósito:** Coordina todos los servicios de adaptación cultural y accesibilidad.

**Características principales:**
- Integración automática de adaptaciones culturales y de accesibilidad
- Gestión de contenido offline
- Verificación de compatibilidad
- Generación de reportes combinados
- Recomendaciones personalizadas

**Funcionalidades:**
- Adaptación de contenido combinando contexto cultural y necesidades de accesibilidad
- Gestión de paquetes de contenido offline
- Verificación de compatibilidad entre características
- Generación de reportes de integración

**Ejemplo de uso:**
```typescript
import { culturalIntegrationService } from './cultural-integration';

const integration = await culturalIntegrationService.integrateCulturalContent({
  content: "Aprende a contar del 1 al 10",
  userId: "user123",
  culturalContext: {
    culture: "maya",
    language: "maya"
  },
  subject: "mathematics"
});
```

### 4. AI Services (`ai-services.ts`)

**Propósito:** Servicios unificados de inteligencia artificial que integran modelos locales y APIs externas.

**Características principales:**
- Modelos de TensorFlow.js para análisis local
- Integración con APIs externas (OpenAI, Anthropic)
- Análisis híbrido combinando modelos locales y externos
- Servicios de chatbot, reconocimiento de voz, TTS, detección de necesidades

## Assets Culturales

### Estructura de Directorios

```
public/
├── offline-content/
│   ├── manifest.json              # Manifiesto principal de contenido offline
│   └── maya-mathematics.json      # Contenido matemático maya offline
└── cultural-assets/
    ├── maya/
    │   ├── manifest.json          # Manifiesto de assets mayas
    │   ├── images/                # Imágenes culturales mayas
    │   ├── audio/                 # Audio en idioma maya
    │   ├── video/                 # Videos culturales mayas
    │   └── documents/             # Documentos educativos mayas
    ├── nahuatl/
    │   ├── manifest.json          # Manifiesto de assets náhuatl
    │   └── [subdirectorios similares]
    └── [otras culturas...]
```

### Tipos de Assets

1. **Imágenes:** Fotografías, ilustraciones, símbolos culturales
2. **Audio:** Saludos, números, música tradicional, poesía
3. **Video:** Ceremonias, danzas, técnicas tradicionales
4. **Documentos:** Vocabularios, ejercicios, lecciones

### Metadatos de Accesibilidad

Cada asset incluye metadatos de accesibilidad:
- Texto alternativo para imágenes
- Transcripciones para audio
- Subtítulos para video
- Descripciones detalladas
- Compatibilidad con tecnologías asistivas

## Estándares de Cumplimiento

### Accesibilidad
- **WCAG 2.1 AA:** Cumplimiento completo
- **Section 508:** Compatibilidad con regulaciones estadounidenses
- **Regulaciones locales:** Adaptación a leyes locales de accesibilidad

### Cultural
- **Sensibilidad cultural:** Alto nivel de respeto y autenticidad
- **Colaboración comunitaria:** Contenido verificado por comunidades indígenas
- **Licencias:** Creative Commons para uso educativo

## Uso en la Aplicación

### Integración con APIs

Los servicios se integran con las APIs existentes:

```typescript
// API de evaluación adaptativa
POST /api/ai/assessment
{
  "studentId": "uuid",
  "assessmentType": "cultural",
  "culturalContext": {
    "culture": "maya",
    "language": "maya"
  }
}

// API de evaluación de accesibilidad
POST /api/ai/accessibility-assessment
{
  "studentId": "uuid",
  "assessmentType": "comprehensive",
  "preferences": {
    "highContrast": true,
    "largeText": true
  }
}
```

### Componentes de UI

Los servicios se integran con componentes React:

```typescript
// Componente de contexto cultural
<CulturalContext
  content={lessonContent}
  userBackground="maya"
  onAdaptationChange={handleAdaptation}
/>

// Componente de accesibilidad
<AccessibilityPanel
  profile={userProfile}
  onSettingsChange={handleSettingsChange}
/>
```

## Configuración y Personalización

### Variables de Entorno

```bash
# Configuración de APIs de IA
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key

# Configuración de accesibilidad
ACCESSIBILITY_AUDIT_ENABLED=true
WCAG_COMPLIANCE_LEVEL=AA

# Configuración cultural
CULTURAL_SENSITIVITY_LEVEL=high
OFFLINE_CONTENT_ENABLED=true
```

### Personalización de Culturas

Para agregar una nueva cultura:

1. Actualizar `cultural-adapter.ts` con la nueva cultura
2. Crear directorio en `public/cultural-assets/`
3. Agregar manifiesto y assets
4. Actualizar contenido offline

### Personalización de Accesibilidad

Para agregar nuevas características de accesibilidad:

1. Actualizar `accessibility.ts` con la nueva característica
2. Implementar lógica de adaptación
3. Actualizar auditorías
4. Agregar a la interfaz de usuario

## Monitoreo y Analytics

### Métricas Clave

- **Adaptación cultural:** Tasa de éxito, confianza, elementos culturales detectados
- **Accesibilidad:** Puntuación de cumplimiento, problemas detectados, recomendaciones aplicadas
- **Integración:** Compatibilidad, conflictos, tiempo de procesamiento

### Logs y Auditoría

Todos los servicios incluyen:
- Logs detallados de operaciones
- Auditoría de seguridad
- Métricas de rendimiento
- Reportes de cumplimiento

## Mantenimiento

### Actualizaciones Regulares

- **Contenido cultural:** Actualización trimestral
- **Estándares de accesibilidad:** Actualización semestral
- **Modelos de IA:** Actualización mensual
- **Assets:** Actualización según disponibilidad

### Backup y Recuperación

- Backup automático de configuraciones
- Versionado de contenido offline
- Recuperación de perfiles de usuario
- Sincronización de preferencias

## Soporte y Contacto

Para preguntas técnicas o reportes de problemas:
- **Email:** tech-support@inclusiveai.com
- **Documentación:** docs.inclusiveai.com
- **GitHub:** github.com/inclusiveai/issues

## Licencia

Este código está licenciado bajo Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License.

---

**Nota:** Esta implementación está diseñada para ser escalable, mantenible y respetuosa con las comunidades indígenas. Todos los contenidos culturales han sido desarrollados en colaboración con representantes de las comunidades correspondientes.
