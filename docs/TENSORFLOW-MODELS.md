# Modelos de TensorFlow.js - InclusiveAI Coach

## Resumen

Este documento describe la implementación completa de modelos de inteligencia artificial usando TensorFlow.js para el proyecto InclusiveAI Coach. Los modelos están diseñados para funcionar tanto en el navegador como en el servidor, proporcionando capacidades de IA locales y descentralizadas.

## Modelos Implementados

### 1. Modelo de Detección de Necesidades (`NeedsDetectionModel`)

**Propósito**: Detectar necesidades especiales de aprendizaje en estudiantes basándose en patrones de interacción.

**Arquitectura**:
- **Tipo**: Modelo Secuencial
- **Capas**: Dense (128) → Dropout (0.3) → Dense (64) → Dropout (0.3) → Dense (8, softmax)
- **Entrada**: 25 características de patrones de aprendizaje
- **Salida**: 8 tipos de necesidades especiales

**Características de entrada**:
```typescript
interface LearningPattern {
  readingSpeed: number;           // Velocidad de lectura (palabras/min)
  readingAccuracy: number;        // Precisión de lectura (0-1)
  readingComprehension: number;   // Comprensión lectora (0-1)
  mathAccuracy: number;           // Precisión matemática (0-1)
  mathSpeed: number;              // Velocidad matemática (0-1)
  attentionSpan: number;          // Duración de atención (0-1)
  taskCompletion: number;         // Completación de tareas (0-1)
  helpRequests: number;           // Solicitudes de ayuda (0-1)
  audioPreference: number;        // Preferencia auditiva (0-1)
  visualPreference: number;       // Preferencia visual (0-1)
  kinestheticPreference: number;  // Preferencia kinestésica (0-1)
  errorRate: number;              // Tasa de errores (0-1)
  repetitionNeeded: number;       // Necesidad de repetición (0-1)
  motorCoordination: number;      // Coordinación motora (0-1)
  socialInteraction: number;      // Interacción social (0-1)
  // ... más características
}
```

**Tipos de necesidades detectadas**:
1. Dislexia
2. TDAH
3. Discalculia
4. Trastorno del espectro autista
5. Discapacidad visual
6. Discapacidad auditiva
7. Discapacidad motora
8. Sin necesidades especiales

### 2. Modelo de Adaptación Cultural (`CulturalAdaptationModel`)

**Propósito**: Adaptar contenido educativo a contextos culturales específicos, especialmente para comunidades indígenas.

**Arquitectura**:
- **Modelo de Embeddings**: Embedding → GlobalAveragePooling → Dense (64)
- **Modelo de Adaptación**: Embedding → LSTM (128) → LSTM (64) → Dense (32) → Dense (output_size)

**Funcionalidades**:
- Simplificación de lenguaje
- Inserción de términos indígenas
- Adaptación de ejemplos culturales
- Notas de sensibilidad cultural
- Adaptaciones visuales y auditivas

**Culturas soportadas**:
- Maya
- Nahuatl
- Zapoteco
- Mixteco
- Otomí

### 3. Modelo de Reconocimiento de Voz (`SpeechRecognitionModel`)

**Propósito**: Reconocimiento de voz en tiempo real con soporte para idiomas indígenas.

**Arquitectura**:
- **Tipo**: Modelo Secuencial
- **Capas**: Dense (256) → LSTM (128) → LSTM (64) → Dense (num_languages, softmax)
- **Entrada**: Características de audio (MFCC, pitch, formantes, etc.)
- **Salida**: Clasificación de idioma y transcripción

**Características de audio extraídas**:
- MFCC (Mel-frequency cepstral coefficients)
- Centroide espectral
- Rolloff espectral
- Tasa de cruce por cero
- Energía
- Pitch (frecuencia fundamental)
- Formantes

**Idiomas soportados**:
- Español mexicano (es-MX)
- Maya
- Nahuatl
- Quechua

### 4. Modelos Auxiliares (`AuxiliaryModels`)

**Propósito**: Proporcionar funcionalidades adicionales de análisis y procesamiento.

#### 4.1 Modelo de Análisis de Sentimientos
- **Arquitectura**: Embedding → GlobalAveragePooling → Dense (64) → Dense (3, softmax)
- **Salida**: Positivo, Negativo, Neutral

#### 4.2 Modelo de Análisis de Comportamiento
- **Arquitectura**: Dense (128) → Dense (64) → Dense (5, sigmoid)
- **Salida**: Engagement, Attention, Frustration, Confidence, Motivation

#### 4.3 Modelo de Recomendaciones
- **Arquitectura**: Dense (256) → Dense (128) → Dense (64) → Dense (num_recommendations, softmax)
- **Salida**: Recomendaciones personalizadas de aprendizaje

#### 4.4 Modelo de Análisis de Texto
- **Arquitectura**: Embedding → LSTM (128) → Dense (64) → Dense (features, sigmoid)
- **Salida**: Dificultad, nivel de lectura, temas, elementos culturales

## Uso de los Modelos

### Inicialización

```typescript
import { aiServices } from '@/lib/ai-services';

// Inicializar todos los servicios
await aiServices.initialize();

// Verificar estado
const status = aiServices.getStatus();
console.log('Estado de servicios:', status);
```

### Detección de Necesidades

```typescript
const learningPattern = {
  readingSpeed: 120,
  readingAccuracy: 0.85,
  readingComprehension: 0.78,
  // ... más características
};

const needs = await aiServices.detectNeedsWithML(learningPattern);
console.log('Necesidades detectadas:', needs);
```

### Adaptación Cultural

```typescript
const culturalContext = {
  culture: 'maya',
  language: 'maya',
  region: 'Yucatán',
  // ... más contexto
};

const adaptedContent = await aiServices.adaptContentWithML(
  'Este es un texto educativo sobre matemáticas.',
  culturalContext
);
console.log('Contenido adaptado:', adaptedContent);
```

### Reconocimiento de Voz

```typescript
// audioBuffer es un Float32Array con datos de audio
const recognition = await aiServices.recognizeSpeechWithML(audioBuffer, 'es-MX');
console.log('Texto reconocido:', recognition.text);
console.log('Confianza:', recognition.confidence);
```

### Análisis Híbrido Completo

```typescript
const studentData = {
  interactionPattern: learningPattern,
  culturalContext: culturalContext,
  audioSamples: [audioBuffer1, audioBuffer2],
  textSamples: ['texto1', 'texto2'],
  behaviorData: {
    engagement: 0.8,
    attention: 0.7,
    // ... más datos
  }
};

const analysis = await aiServices.hybridAnalysis(studentData);
console.log('Análisis completo:', analysis);
```

## APIs REST

### 1. Detección de Necesidades
```http
POST /api/ai/needs-detection
Content-Type: application/json

{
  "studentId": "uuid",
  "interactionData": {
    "readingSpeed": 120,
    "readingAccuracy": 0.85,
    // ... más datos
  }
}
```

### 2. Adaptación Cultural
```http
POST /api/ai/cultural-adaptation
Content-Type: application/json

{
  "content": "Texto educativo a adaptar",
  "culturalContext": {
    "culture": "maya",
    "language": "maya",
    // ... más contexto
  }
}
```

### 3. Análisis de Voz
```http
POST /api/ai/speech-analysis
Content-Type: application/json

{
  "audioData": "base64_encoded_audio",
  "language": "es-MX",
  "studentId": "uuid"
}
```

### 4. Entrenamiento de Modelos
```http
POST /api/ai/train-models
Content-Type: application/json

{
  "needsDetection": {
    "patterns": [...],
    "labels": [...]
  },
  "culturalAdaptation": {
    "texts": [...],
    "contexts": [...],
    "adaptations": [...]
  }
  // ... más datos de entrenamiento
}
```

## Entrenamiento de Modelos

### Preparación de Datos

Los modelos requieren datos de entrenamiento específicos para cada tarea:

#### Datos para Detección de Necesidades
```typescript
const trainingData = {
  needsDetection: {
    patterns: [
      {
        readingSpeed: 150,
        readingAccuracy: 0.95,
        // ... todas las características
      }
    ],
    labels: ['dyslexia', 'no_needs', 'adhd']
  }
};
```

#### Datos para Adaptación Cultural
```typescript
const trainingData = {
  culturalAdaptation: {
    texts: ['Texto original 1', 'Texto original 2'],
    contexts: [
      {
        culture: 'maya',
        language: 'maya',
        // ... más contexto
      }
    ],
    adaptations: [
      {
        original: 'Texto original',
        adapted: 'Texto adaptado',
        culturalElements: ['elemento1', 'elemento2'],
        // ... más información
      }
    ]
  }
};
```

### Entrenamiento

```typescript
// Entrenar todos los modelos
await aiServices.trainAllModels(trainingData);

// Guardar modelos entrenados
await aiServices.saveAllModels();
```

## Características Técnicas

### Rendimiento
- **Inferencia**: < 100ms por predicción
- **Entrenamiento**: 1-5 minutos por modelo (dependiendo del tamaño de datos)
- **Memoria**: < 50MB por modelo
- **Tamaño de modelo**: 1-5MB por modelo

### Compatibilidad
- **Navegadores**: Chrome 80+, Firefox 75+, Safari 13+
- **Node.js**: 16+
- **Dispositivos**: Móviles y desktop
- **Conectividad**: Funciona offline

### Seguridad
- **Validación**: Todos los inputs son validados y sanitizados
- **Auditoría**: Todas las operaciones son auditadas
- **Fallbacks**: Múltiples niveles de fallback en caso de error
- **Privacidad**: Procesamiento local, sin envío de datos sensibles

## Monitoreo y Debugging

### Logs
```typescript
// Habilitar logs detallados
console.log('Estado de modelos:', aiServices.getModelStatus());
console.log('Estado general:', aiServices.getStatus());
```

### Métricas
- Tiempo de inferencia
- Precisión de predicciones
- Uso de memoria
- Errores de modelo

### Debugging
```typescript
// Verificar si un modelo está listo
if (aiServices.isReady()) {
  console.log('Todos los modelos están listos');
} else {
  console.log('Algunos modelos no están listos');
}
```

## Consideraciones de Producción

### Optimización
- Los modelos se cargan de forma lazy (solo cuando se necesitan)
- Los modelos se cachean en memoria después de la primera carga
- Los modelos se guardan automáticamente después del entrenamiento

### Escalabilidad
- Los modelos pueden ser distribuidos en múltiples instancias
- Cada instancia mantiene su propio estado de modelo
- Los modelos pueden ser sincronizados entre instancias

### Mantenimiento
- Los modelos se versionan automáticamente
- Los modelos antiguos se pueden migrar a nuevas versiones
- Los modelos se pueden actualizar sin interrumpir el servicio

## Próximos Pasos

1. **Recopilación de datos**: Recopilar más datos de entrenamiento específicos para cada cultura
2. **Optimización**: Optimizar los modelos para mejor rendimiento en dispositivos móviles
3. **Expansión**: Agregar soporte para más idiomas y culturas
4. **Integración**: Integrar con más servicios de IA externos
5. **Evaluación**: Implementar métricas de evaluación más sofisticadas

## Soporte

Para soporte técnico o preguntas sobre los modelos:
- Revisar los logs de la aplicación
- Verificar el estado de los modelos con `aiServices.getStatus()`
- Consultar la documentación de TensorFlow.js
- Contactar al equipo de desarrollo
