# APIs de Inteligencia Artificial - InclusiveAI Coach

## Descripción General

Este documento describe las APIs de inteligencia artificial implementadas en el proyecto InclusiveAI Coach, que proporcionan funcionalidades avanzadas de IA para la educación inclusiva y adaptativa.

## Estructura de APIs

```
app/api/ai/
├── voice-synthesis/           # Síntesis de voz avanzada
├── assessment/                # Evaluaciones adaptativas
├── accessibility-assessment/  # Evaluaciones de accesibilidad
├── needs-detection/          # Detección de necesidades especiales
├── speech-recognition/       # Reconocimiento de voz
├── tts/                      # Text-to-Speech básico
├── chatbot/                  # Chatbot inteligente
├── cultural-adaptation/      # Adaptación cultural
├── content-adaptation/       # Adaptación de contenido
├── speech-analysis/          # Análisis de voz
└── train-models/             # Entrenamiento de modelos
```

## API: Voice Synthesis (Síntesis de Voz Avanzada)

### Endpoint: `/api/ai/voice-synthesis`

#### POST - Crear síntesis de voz
**Descripción:** Genera audio sintetizado con características avanzadas de accesibilidad y adaptación cultural.

**Parámetros:**
```json
{
  "text": "Texto a sintetizar",
  "language": "es-MX",
  "voiceId": "opcional",
  "options": {
    "pitch": -5,
    "speed": 1.0,
    "volume": 1.0,
    "gender": "female",
    "age": 25,
    "emotion": "neutral",
    "culturalContext": {
      "culture": "maya",
      "region": "Yucatán",
      "formality": "formal",
      "accent": "yucateco"
    },
    "accessibility": {
      "highContrast": true,
      "slowSpeech": false,
      "clearPronunciation": true,
      "pauseBetweenSentences": true
    },
    "cache": true
  }
}
```

**Respuesta:**
```json
{
  "success": true,
  "audio": "base64_audio_data",
  "format": "mp3",
  "language": "es-MX",
  "voiceId": "voice_123",
  "text": {
    "original": "Texto original",
    "adapted": "Texto adaptado",
    "processed": "Texto procesado"
  },
  "metadata": {
    "duration": 15.5,
    "sampleRate": 22050,
    "channels": 1,
    "bitrate": 128,
    "size": 248000
  },
  "options": {...},
  "cacheStats": {...},
  "auditId": "audit_123"
}
```

#### GET - Obtener información de configuración
**Descripción:** Obtiene información sobre voces disponibles, características y límites.

**Parámetros de consulta:**
- `language`: Idioma específico
- `voiceId`: ID de voz específica

**Respuesta:**
```json
{
  "supportedLanguages": ["es-MX", "maya", "nahuatl", ...],
  "voiceConfig": {...},
  "allVoices": [...],
  "cacheStats": {...},
  "accessibilityFeatures": {...},
  "features": {...},
  "limits": {...}
}
```

#### PUT - Actualizar configuración
**Descripción:** Actualiza configuraciones de voz o genera vistas previas.

**Parámetros:**
```json
{
  "action": "updateVoiceSettings|previewVoice",
  "voiceId": "voice_123",
  "language": "es-MX",
  "settings": {...}
}
```

#### DELETE - Limpiar caché
**Descripción:** Limpia el caché de síntesis de voz.

**Parámetros de consulta:**
- `type`: "all" | "language" | "voice"
- `language`: Idioma (si type="language")
- `voiceId`: ID de voz (si type="voice")

## API: Assessment (Evaluaciones Adaptativas)

### Endpoint: `/api/ai/assessment`

#### POST - Crear evaluación adaptativa
**Descripción:** Genera una evaluación personalizada basada en el perfil del estudiante.

**Parámetros:**
```json
{
  "studentId": "uuid",
  "assessmentType": "reading|math|comprehension|adaptive|cultural|accessibility",
  "language": "es-MX",
  "grade": 5,
  "age": 10,
  "culturalBackground": "maya",
  "specialNeeds": ["dyslexia", "adhd"],
  "previousScores": [
    {
      "type": "reading",
      "score": 85,
      "date": "2024-01-15T10:00:00Z"
    }
  ],
  "adaptiveSettings": {
    "difficultyAdjustment": true,
    "culturalAdaptation": true,
    "accessibilityFeatures": true,
    "realTimeAnalysis": true,
    "personalizedFeedback": true
  }
}
```

**Respuesta:**
```json
{
  "success": true,
  "assessment": {
    "sessionId": "session_123",
    "type": "reading",
    "language": "es-MX",
    "questions": [...],
    "totalQuestions": 10,
    "estimatedDuration": 20,
    "adaptiveSettings": {...},
    "culturalContext": {...},
    "accessibilityFeatures": {...}
  },
  "studentProfile": {...},
  "auditId": "audit_123"
}
```

#### PUT - Procesar respuesta
**Descripción:** Procesa una respuesta del estudiante y genera la siguiente pregunta adaptativa.

**Parámetros:**
```json
{
  "studentId": "uuid",
  "assessmentId": "uuid",
  "questionId": "uuid",
  "response": "respuesta_del_estudiante",
  "responseTime": 15.5,
  "confidence": 0.8,
  "hintsUsed": 1,
  "attempts": 2
}
```

**Respuesta:**
```json
{
  "success": true,
  "feedback": {
    "type": "positive",
    "message": "¡Excelente respuesta!",
    "score": 0.9,
    "suggestions": [...]
  },
  "difficultyAdjustment": {
    "direction": "increase",
    "reason": "high_performance"
  },
  "nextQuestion": {...},
  "progress": {...},
  "auditId": "audit_123"
}
```

#### GET - Obtener evaluaciones
**Descripción:** Obtiene historial de evaluaciones o resultados específicos.

**Parámetros de consulta:**
- `studentId`: UUID del estudiante (requerido)
- `assessmentId`: UUID de evaluación específica (opcional)
- `type`: Tipo de evaluación (opcional)

#### DELETE - Eliminar evaluación
**Descripción:** Elimina una evaluación y sus respuestas asociadas.

**Parámetros de consulta:**
- `assessmentId`: UUID de la evaluación

## API: Accessibility Assessment (Evaluaciones de Accesibilidad)

### Endpoint: `/api/ai/accessibility-assessment`

#### POST - Crear evaluación de accesibilidad
**Descripción:** Genera una evaluación específica para detectar necesidades de accesibilidad.

**Parámetros:**
```json
{
  "studentId": "uuid",
  "assessmentType": "visual|auditory|motor|cognitive|comprehensive",
  "language": "es-MX",
  "age": 10,
  "knownDisabilities": ["visual_impairment"],
  "deviceType": "desktop",
  "assistiveTechnology": ["screen_reader", "high_contrast"],
  "preferences": {
    "highContrast": true,
    "largeText": false,
    "screenReader": true,
    "keyboardOnly": false,
    "reducedMotion": true,
    "audioDescriptions": true,
    "captions": true
  }
}
```

**Respuesta:**
```json
{
  "success": true,
  "assessment": {
    "sessionId": "session_123",
    "type": "visual",
    "language": "es-MX",
    "questions": [...],
    "totalQuestions": 8,
    "estimatedDuration": 15,
    "accessibilityFeatures": {...},
    "assistiveTechnologySupport": {...},
    "complianceStandards": {...}
  },
  "studentProfile": {...},
  "recommendations": {
    "immediate": [...],
    "shortTerm": [...],
    "longTerm": [...]
  },
  "auditId": "audit_123"
}
```

#### PUT - Procesar respuesta de accesibilidad
**Descripción:** Procesa respuestas y analiza necesidades de accesibilidad.

**Parámetros:**
```json
{
  "studentId": "uuid",
  "assessmentId": "uuid",
  "questionId": "uuid",
  "response": "respuesta",
  "responseTime": 12.5,
  "difficulty": 3,
  "assistiveToolsUsed": ["screen_reader"],
  "accessibilityIssues": ["small_text", "low_contrast"]
}
```

#### GET - Obtener evaluaciones de accesibilidad
**Descripción:** Obtiene historial de evaluaciones de accesibilidad.

#### DELETE - Eliminar evaluación de accesibilidad
**Descripción:** Elimina una evaluación de accesibilidad.

## Características Comunes

### Seguridad
- **Validación de entrada:** Todas las APIs usan esquemas Zod para validación
- **Sanitización:** Datos de entrada son sanitizados automáticamente
- **Auditoría:** Todas las operaciones son auditadas con IDs únicos
- **Rate Limiting:** Límites de velocidad implementados
- **Autenticación:** Verificación de tokens JWT

### Accesibilidad
- **WCAG 2.1 AA:** Cumplimiento con estándares de accesibilidad
- **Multi-modal:** Soporte para múltiples modos de interacción
- **Tecnologías asistivas:** Compatibilidad con lectores de pantalla, etc.
- **Personalización:** Adaptación a preferencias individuales

### Adaptación Cultural
- **Idiomas indígenas:** Soporte para 25+ idiomas indígenas
- **Contexto cultural:** Adaptación a tradiciones y valores locales
- **Ejemplos culturales:** Contenido relevante culturalmente
- **Formalidad:** Ajuste según el contexto social

### Rendimiento
- **Caché inteligente:** Almacenamiento en caché optimizado
- **Procesamiento asíncrono:** Operaciones no bloqueantes
- **Compresión:** Optimización de tamaño de datos
- **CDN:** Distribución de contenido global

## Códigos de Error

### Errores Comunes
- `400`: Datos de entrada inválidos
- `401`: No autorizado
- `403`: Acceso prohibido
- `404`: Recurso no encontrado
- `429`: Límite de velocidad excedido
- `500`: Error interno del servidor

### Errores Específicos
- `LANGUAGE_NOT_SUPPORTED`: Idioma no soportado
- `VOICE_NOT_FOUND`: Voz no encontrada
- `ASSESSMENT_NOT_FOUND`: Evaluación no encontrada
- `STUDENT_NOT_FOUND`: Estudiante no encontrado
- `INVALID_UUID`: UUID inválido

## Límites y Cuotas

### Síntesis de Voz
- **Texto máximo:** 5,000 caracteres por solicitud
- **Duración máxima:** 5 minutos de audio
- **Solicitudes concurrentes:** 10 por usuario
- **Formatos soportados:** MP3, WAV, OGG

### Evaluaciones
- **Preguntas por evaluación:** 50 máximo
- **Duración máxima:** 2 horas por sesión
- **Evaluaciones activas:** 3 por estudiante
- **Respuestas por minuto:** 10 máximo

### Accesibilidad
- **Tipos de evaluación:** 5 tipos disponibles
- **Herramientas asistivas:** 15+ tecnologías soportadas
- **Estándares de cumplimiento:** WCAG 2.1, Section 508

## Ejemplos de Uso

### Síntesis de Voz en Maya
```javascript
const response = await fetch('/api/ai/voice-synthesis', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    text: "K'aslemal chuqa' k'aslemal",
    language: "maya",
    options: {
      culturalContext: {
        culture: "maya",
        region: "Yucatán"
      },
      accessibility: {
        slowSpeech: true,
        clearPronunciation: true
      }
    }
  })
});
```

### Evaluación Adaptativa
```javascript
const assessment = await fetch('/api/ai/assessment', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    studentId: "uuid-del-estudiante",
    assessmentType: "reading",
    language: "es-MX",
    grade: 5,
    culturalBackground: "maya",
    adaptiveSettings: {
      difficultyAdjustment: true,
      culturalAdaptation: true
    }
  })
});
```

### Evaluación de Accesibilidad
```javascript
const accessibilityAssessment = await fetch('/api/ai/accessibility-assessment', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    studentId: "uuid-del-estudiante",
    assessmentType: "visual",
    language: "es-MX",
    preferences: {
      highContrast: true,
      largeText: true,
      screenReader: true
    }
  })
});
```

## Monitoreo y Analytics

### Métricas Clave
- **Tiempo de respuesta:** Promedio y percentiles
- **Tasa de éxito:** Porcentaje de solicitudes exitosas
- **Uso de caché:** Efectividad del almacenamiento en caché
- **Errores:** Distribución de tipos de error
- **Idiomas:** Uso por idioma y región

### Logs
- **Auditoría:** Todas las operaciones son registradas
- **Errores:** Logs detallados de errores
- **Performance:** Métricas de rendimiento
- **Seguridad:** Eventos de seguridad

## Mantenimiento

### Actualizaciones
- **Modelos de IA:** Actualización mensual de modelos
- **Voces:** Nuevas voces agregadas trimestralmente
- **Idiomas:** Soporte para nuevos idiomas según demanda
- **Estándares:** Actualización de estándares de accesibilidad

### Backup y Recuperación
- **Datos:** Backup diario de configuraciones
- **Caché:** Persistencia de caché crítico
- **Configuraciones:** Versionado de configuraciones
- **Desastres:** Plan de recuperación documentado

## Contacto y Soporte

Para preguntas técnicas o reportes de problemas:
- **Email:** tech-support@inclusiveai.com
- **Documentación:** docs.inclusiveai.com
- **GitHub:** github.com/inclusiveai/issues
- **Discord:** discord.gg/inclusiveai
