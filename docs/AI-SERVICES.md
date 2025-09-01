# Servicios de Inteligencia Artificial

## Descripción General

Este documento describe la implementación completa de servicios de inteligencia artificial para la plataforma de aprendizaje inclusivo. Los servicios incluyen:

1. **Text-to-Speech (TTS) multilingüe**
2. **Reconocimiento de voz avanzado**
3. **Detección de necesidades especiales con ML**

## Arquitectura

### Estructura de Archivos

```
lib/ai-services/
├── tts-service.ts              # Servicio de síntesis de voz
├── speech-recognition-service.ts # Servicio de reconocimiento de voz
└── needs-detection-service.ts   # Servicio de detección de necesidades

app/api/ai/
├── tts/
│   └── route.ts                # API endpoints para TTS
├── speech-recognition/
│   └── route.ts                # API endpoints para reconocimiento
└── needs-detection/
    └── route.ts                # API endpoints para detección

components/ai/
├── ai-services-integration.tsx # Componente de integración
├── ai-test-panel.tsx          # Panel de pruebas
└── index.ts                   # Exportaciones

lib/hooks/
└── use-ai-services.ts         # Hook personalizado para servicios
```

## 1. Servicio de Text-to-Speech (TTS)

### Características

- **Multilingüe**: Soporte para español, maya, náhuatl, inglés
- **Adaptación cultural**: Voces y pronunciaciones específicas por contexto cultural
- **Múltiples proveedores**: OpenAI, Azure, Google Cloud, ElevenLabs
- **Caché inteligente**: Almacenamiento local de audio generado
- **Configuración flexible**: Velocidad, tono, voz personalizable

### Configuración de Voces

```typescript
const VOICE_CONFIGS: Record<string, VoiceConfig> = {
  'es-MX': { 
    voice: 'alloy', 
    pitch: 0, 
    speed: 1, 
    language: 'es-MX', 
    gender: 'neutral', 
    provider: 'openai' 
  },
  'maya': { 
    voice: 'nova', 
    pitch: -1, 
    speed: 0.85, 
    language: 'maya', 
    gender: 'female', 
    provider: 'openai', 
    culturalContext: 'maya' 
  },
  'nahuatl': { 
    voice: 'fable', 
    pitch: 1, 
    speed: 0.9, 
    language: 'nahuatl', 
    gender: 'neutral', 
    provider: 'openai', 
    culturalContext: 'nahuatl' 
  }
};
```

### Uso

```typescript
import { TTSService } from '@/lib/ai-services/tts-service';

const ttsService = new TTSService();

// Sintetizar texto
const audio = await ttsService.synthesize(
  'Hola, bienvenido a la plataforma de aprendizaje',
  'es-MX',
  { culturalContext: 'maya', cache: true }
);

// Reproducir audio
await ttsService.playAudio(audio);
```

### API Endpoints

#### POST /api/ai/tts
Sintetiza texto a voz.

**Body:**
```json
{
  "text": "Texto a sintetizar",
  "language": "es-MX",
  "options": {
    "culturalContext": "maya",
    "cache": true,
    "voice": "alloy",
    "speed": 1.0,
    "pitch": 0
  }
}
```

**Response:**
```json
{
  "success": true,
  "audio": "base64_encoded_audio",
  "duration": 2.5,
  "cached": true
}
```

#### GET /api/ai/tts
Obtiene información sobre idiomas soportados y configuración.

#### DELETE /api/ai/tts
Limpia el caché de audio.

## 2. Servicio de Reconocimiento de Voz

### Características

- **Comandos de voz estructurados**: Sistema de comandos con acciones, descripciones y aliases
- **Interpretación con IA**: Uso de Anthropic Claude para interpretar lenguaje natural
- **Coincidencia difusa**: Algoritmo de Levenshtein para comandos similares
- **Contexto cultural**: Adaptación a diferentes contextos culturales
- **Comandos por defecto**: Navegación, control de audio, análisis de necesidades

### Configuración de Comandos

```typescript
const defaultCommands: VoiceCommand[] = [
  {
    action: 'navigate',
    description: 'Navegar a una página',
    category: 'navigation',
    aliases: ['ir a', 'navegar', 'abrir'],
    examples: ['ir a dashboard', 'navegar a lecciones']
  },
  {
    action: 'analyze_needs',
    description: 'Analizar necesidades de aprendizaje',
    category: 'learning',
    aliases: ['analizar', 'evaluar', 'detectar'],
    examples: ['analizar mis necesidades', 'evaluar mi progreso']
  }
];
```

### Uso

```typescript
import { SpeechRecognitionService } from '@/lib/ai-services/speech-recognition-service';

const srService = new SpeechRecognitionService();

// Registrar comando personalizado
srService.registerCommand({
  action: 'custom_action',
  description: 'Acción personalizada',
  category: 'custom',
  aliases: ['comando'],
  examples: ['ejecutar comando']
});

// Iniciar reconocimiento
await srService.startRecognition({
  language: 'es-MX',
  culturalContext: 'maya',
  continuous: true
});

// Escuchar eventos
srService.onCommand((command) => {
  console.log('Comando detectado:', command);
});
```

### API Endpoints

#### POST /api/ai/speech-recognition
Controla el reconocimiento de voz.

**Body:**
```json
{
  "action": "start",
  "data": {
    "language": "es-MX",
    "culturalContext": "maya",
    "continuous": true,
    "interimResults": false
  }
}
```

#### GET /api/ai/speech-recognition
Obtiene el estado del servicio y comandos registrados.

#### PUT /api/ai/speech-recognition
Actualiza todos los comandos registrados.

## 3. Servicio de Detección de Necesidades

### Características

- **Análisis multimodal**: Combina ML, IA y análisis basado en reglas
- **Datos históricos**: Integra evaluaciones previas del estudiante
- **Contexto cultural**: Adapta el análisis al contexto cultural
- **Perfil de aprendizaje**: Genera perfiles personalizados
- **Recomendaciones**: Sugiere adaptaciones y estrategias

### Estructura de Datos

```typescript
interface InteractionData {
  // Lectura
  readingSpeed: number;
  readingAccuracy: number;
  readingComprehension: number;
  readingErrors: {
    substitutions: number;
    omissions: number;
    insertions: number;
    reversals: number;
    transpositions: number;
  };
  
  // Matemáticas
  mathAccuracy: number;
  mathSpeed: number;
  mathErrors: {
    calculation: number;
    procedural: number;
    conceptual: number;
    visual: number;
  };
  
  // Atención y comportamiento
  attentionSpan: number;
  responseTime: {
    mean: number;
    variance: number;
    outliers: number;
  };
  taskCompletion: number;
  helpRequests: number;
  
  // Preferencias sensoriales
  audioPreference: number;
  visualPreference: number;
  kinestheticPreference: number;
  
  // Contexto
  language: string;
  culturalBackground: string;
  socioeconomicContext: string;
  previousEducation: number;
  timeOfDay: string;
  sessionDuration: number;
  breaksTaken: number;
  deviceType: 'desktop' | 'tablet' | 'mobile';
  internetSpeed: number;
  offlineUsage: number;
}
```

### Uso

```typescript
import { NeedsDetectionService } from '@/lib/ai-services/needs-detection-service';

const ndService = new NeedsDetectionService();

// Analizar necesidades
const analysis = await ndService.analyzeNeeds(studentId, interactionData);

// Obtener perfil de aprendizaje
const profile = await ndService.generateLearningProfile(analysis);

// Generar adaptaciones culturales
const adaptations = await ndService.generateCulturalAdaptations(analysis);
```

### API Endpoints

#### POST /api/ai/needs-detection
Analiza las necesidades de aprendizaje de un estudiante.

**Body:**
```json
{
  "studentId": "student-123",
  "interactionData": {
    "readingSpeed": 85,
    "readingAccuracy": 0.92,
    "readingComprehension": 0.88,
    // ... más datos
  }
}
```

**Response:**
```json
{
  "success": true,
  "analysis": {
    "specialNeeds": [
      {
        "type": "dyslexia",
        "severity": "mild",
        "confidence": 0.85,
        "indicators": ["reversals", "slow_reading"],
        "recommendations": ["use_audio", "larger_font"]
      }
    ],
    "learningProfile": {
      "learningStyle": "auditory",
      "pace": "moderate",
      "strengths": ["comprehension", "creativity"],
      "challenges": ["reading_speed", "spelling"]
    },
    "culturalAdaptations": {
      "languageSupport": ["maya_translations"],
      "culturalRelevance": ["local_examples"]
    }
  }
}
```

#### GET /api/ai/needs-detection
Obtiene análisis previos y perfil de aprendizaje.

## 4. Hook Personalizado

### useAIServices

Hook que centraliza el manejo de todos los servicios de IA.

```typescript
import { useAIServices } from '@/lib/hooks/use-ai-services';

const {
  // Estado
  serviceStatus,
  isListening,
  isSpeaking,
  transcript,
  currentLanguage,
  currentCulturalContext,
  
  // Métodos TTS
  synthesizeSpeech,
  
  // Métodos reconocimiento
  startSpeechRecognition,
  stopSpeechRecognition,
  
  // Métodos detección
  analyzeNeeds,
  getPreviousAnalysis,
  
  // Configuración
  changeLanguage,
  changeCulturalContext,
  reinitializeServices,
  
  // Utilidades
  isReady,
  hasErrors
} = useAIServices({
  studentId: 'student-123',
  defaultLanguage: 'es-MX',
  defaultCulturalContext: 'maya',
  autoInitialize: true
});
```

## 5. Componentes de UI

### AIServicesIntegration

Componente principal que integra todos los servicios de IA.

```typescript
import { AIServicesIntegration } from '@/components/ai';

<AIServicesIntegration 
  studentId="student-123"
  language="es-MX"
  culturalContext="maya"
/>
```

### AITestPanel

Panel de pruebas automatizadas para verificar el funcionamiento.

```typescript
import { AITestPanel } from '@/components/ai';

<AITestPanel 
  studentId="student-123"
/>
```

## 6. Configuración

### Variables de Entorno

```env
# OpenAI
OPENAI_API_KEY=your_openai_key

# Anthropic
ANTHROPIC_API_KEY=your_anthropic_key

# Azure Cognitive Services
AZURE_SPEECH_KEY=your_azure_key
AZURE_SPEECH_REGION=your_azure_region

# Google Cloud
GOOGLE_CLOUD_PROJECT_ID=your_project_id
GOOGLE_APPLICATION_CREDENTIALS=path_to_credentials.json

# ElevenLabs
ELEVENLABS_API_KEY=your_elevenlabs_key
```

### Configuración de Base de Datos

Asegúrate de que el esquema de Prisma incluya los modelos necesarios:

```prisma
model Student {
  id              String   @id @default(cuid())
  name            String
  email           String   @unique
  learningProfile Json?
  // ... otros campos
}

model SpecialNeed {
  id              String   @id @default(cuid())
  studentId       String
  type            String
  severity        Int
  detectedAt      DateTime @default(now())
  detectionMethod String
  recommendations Json
  // ... otros campos
}
```

## 7. Pruebas

### Página de Pruebas

Accede a `/test-ai` para probar todos los servicios:

- **Integración Completa**: Interfaz completa con todos los servicios
- **Panel de Pruebas**: Suite automatizada de pruebas
- **Estado del Sistema**: Monitoreo en tiempo real

### Pruebas Automatizadas

```typescript
// Probar TTS
await synthesizeSpeech('Texto de prueba');

// Probar reconocimiento
await startSpeechRecognition();
// Hablar...
await stopSpeechRecognition();

// Probar detección
const analysis = await analyzeNeeds(sampleInteractionData);
```

## 8. Consideraciones de Rendimiento

### Caché

- **TTS**: Audio generado se almacena en caché local
- **Análisis**: Resultados de análisis se almacenan en base de datos
- **Configuración**: Configuraciones de voz se almacenan en localStorage

### Optimizaciones

- **Lazy Loading**: Servicios se cargan solo cuando se necesitan
- **Web Workers**: Procesamiento pesado en background
- **Streaming**: Audio se reproduce mientras se descarga
- **Compresión**: Audio comprimido para reducir tamaño

## 9. Accesibilidad

### Características

- **Screen Reader**: Integración completa con lectores de pantalla
- **Navegación por teclado**: Todos los controles son navegables
- **Alto contraste**: Soporte para modo de alto contraste
- **Feedback auditivo**: Confirmaciones por voz
- **Etiquetas ARIA**: Etiquetas descriptivas para lectores de pantalla

### Implementación

```typescript
// Ejemplo de integración con screen reader
const { speak } = useScreenReader();

// Confirmar acción
speak('Audio generado exitosamente');

// Notificar error
speak('Error generando audio');
```

## 10. Seguridad

### Consideraciones

- **Validación de entrada**: Todos los datos se validan antes del procesamiento
- **Autenticación**: Verificación de permisos para acceder a servicios
- **Rate Limiting**: Límites de uso para prevenir abuso
- **Encriptación**: Datos sensibles encriptados en tránsito y reposo
- **Auditoría**: Logs de todas las operaciones para auditoría

### Implementación

```typescript
// Validación de entrada
const validateInteractionData = (data: any) => {
  if (!data.readingSpeed || data.readingSpeed < 0 || data.readingSpeed > 200) {
    throw new Error('Velocidad de lectura inválida');
  }
  // ... más validaciones
};
```

## 11. Monitoreo y Logs

### Métricas

- **Tiempo de respuesta**: Latencia de cada servicio
- **Tasa de éxito**: Porcentaje de operaciones exitosas
- **Uso de recursos**: CPU, memoria, red
- **Errores**: Tipos y frecuencia de errores

### Logs

```typescript
// Ejemplo de logging
logger.info('TTS request', {
  text: text.substring(0, 50) + '...',
  language,
  culturalContext,
  timestamp: new Date().toISOString()
});
```

## 12. Escalabilidad

### Arquitectura

- **Microservicios**: Cada servicio es independiente
- **Load Balancing**: Distribución de carga entre instancias
- **Caché distribuido**: Redis para caché compartido
- **Base de datos**: Escalado horizontal con réplicas

### Optimizaciones

- **CDN**: Distribución de contenido para audio
- **Compresión**: Reducción de tamaño de datos
- **Paginación**: Resultados paginados para grandes volúmenes
- **Indexación**: Índices optimizados en base de datos

## Conclusión

Esta implementación proporciona una base sólida y escalable para los servicios de IA en la plataforma de aprendizaje inclusivo. Los servicios están diseñados para ser:

- **Modulares**: Fácil de mantener y extender
- **Accesibles**: Cumplen con estándares de accesibilidad
- **Seguros**: Protegen la privacidad y seguridad de los usuarios
- **Escalables**: Pueden manejar grandes volúmenes de usuarios
- **Culturalmente sensibles**: Se adaptan a diferentes contextos culturales

Para más información sobre implementación específica, consulta los archivos de código fuente y la documentación de cada servicio.
