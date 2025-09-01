# Servicios de IA - InclusiveAI Coach

Esta carpeta contiene todos los servicios de IA especializados para la plataforma InclusiveAI Coach, diseñados para proporcionar funcionalidades avanzadas de machine learning, procesamiento de voz, detección de emociones, seguimiento de atención y adaptación cultural.

## 📁 Estructura de Servicios

```
lib/services/
├── index.ts                 # Índice principal y gestor unificado
├── tensorflow-service.ts    # Servicio de TensorFlow.js
├── voice-service.ts         # Servicio de voz avanzado
├── emotion-service.ts       # Servicio de detección de emociones
├── attention-service.ts     # Servicio de seguimiento de atención
├── cultural-service.ts      # Servicio de adaptación cultural
└── README.md               # Esta documentación
```

## 🚀 Servicios Implementados

### 1. TensorFlow Service (`tensorflow-service.ts`)

**Propósito:** Proporciona funcionalidades de machine learning usando TensorFlow.js para análisis educativo.

**Características principales:**
- Creación y gestión de modelos de ML
- Entrenamiento y evaluación de modelos
- Predicciones en tiempo real
- Preprocesamiento de datos (texto, audio, comportamiento)
- Gestión de memoria y optimización

**Funcionalidades clave:**
```typescript
// Crear modelo de clasificación
const model = await tensorFlowService.createClassificationModel([100], 7, 'emotion_classifier');

// Entrenar modelo
await tensorFlowService.trainModel('emotion_classifier', trainingData);

// Realizar predicciones
const prediction = await tensorFlowService.predict('emotion_classifier', inputTensor);

// Preprocesar datos
const textTensor = tensorFlowService.preprocessText("Hola mundo");
const audioTensor = tensorFlowService.preprocessAudio(audioBuffer);
const behaviorTensor = tensorFlowService.preprocessBehaviorData(behaviorData);
```

### 2. Voice Service (`voice-service.ts`)

**Propósito:** Proporciona funcionalidades avanzadas de reconocimiento de voz, síntesis y análisis de audio.

**Características principales:**
- Reconocimiento de voz en tiempo real
- Síntesis de voz (Text-to-Speech)
- Análisis de características de audio
- Detección de comandos de voz
- Soporte para múltiples idiomas indígenas

**Funcionalidades clave:**
```typescript
// Iniciar reconocimiento de voz
await voiceService.startListening({
  language: 'es-MX',
  onResult: (result) => console.log('Texto reconocido:', result.text)
});

// Sintetizar texto a voz
await voiceService.speak("Hola, bienvenido a InclusiveAI Coach", {
  voice: 'maya',
  rate: 1.0,
  pitch: 1.0
});

// Analizar audio
const analysis = await voiceService.analyzeAudio(audioBuffer);

// Detectar comandos de voz
const commands = await voiceService.detectVoiceCommands(audioBuffer);
```

### 3. Emotion Service (`emotion-service.ts`)

**Propósito:** Analiza texto, voz y comportamiento para identificar estados emocionales del usuario.

**Características principales:**
- Análisis de emociones en texto
- Detección de emociones en voz
- Análisis de comportamiento emocional
- Adaptación cultural de emociones
- Historial y tendencias emocionales

**Funcionalidades clave:**
```typescript
// Análisis de emociones en texto
const emotionResult = await emotionService.analyzeTextEmotions("Estoy muy feliz hoy");

// Análisis de emociones en voz
const voiceEmotion = await emotionService.analyzeVoiceEmotions(audioBuffer);

// Análisis combinado
const combinedEmotion = await emotionService.analyzeCombinedEmotions({
  text: "Hola",
  audioBuffer: audioData,
  behaviorData: behaviorInfo
});

// Generar insights culturales
const insights = await emotionService.generateCulturalInsights(userData, culturalContext);
```

### 4. Attention Service (`attention-service.ts`)

**Propósito:** Monitorea y analiza el nivel de atención del usuario durante las sesiones educativas.

**Características principales:**
- Seguimiento de atención en tiempo real
- Detección de distracciones
- Análisis de engagement
- Alertas de atención baja
- Métricas de rendimiento cognitivo

**Funcionalidades clave:**
```typescript
// Iniciar seguimiento de atención
await attentionService.startTracking('session_123');

// Detener seguimiento y obtener resultados
const session = await attentionService.stopTracking();

// Obtener alertas de atención
const alerts = attentionService.getAlerts();

// Obtener estado del servicio
const status = attentionService.getStatus();
```

### 5. Cultural Service (`cultural-service.ts`)

**Propósito:** Adapta contenido y experiencias a diferentes contextos culturales e idiomas indígenas.

**Características principales:**
- Adaptación cultural de contenido
- Traducción a idiomas indígenas
- Contextualización cultural
- Generación de insights culturales
- Rutas de aprendizaje cultural

**Funcionalidades clave:**
```typescript
// Adaptar contenido culturalmente
const adaptation = await culturalService.adaptContent(
  "Hola, bienvenido a la lección",
  {
    culture: 'maya',
    language: 'maya',
    region: 'Yucatán',
    ageGroup: 'adolescente',
    educationLevel: 'secundaria'
  }
);

// Evaluar adaptación cultural
const assessment = await culturalService.assessCulturalFit(content, context);

// Crear ruta de aprendizaje cultural
const learningPath = await culturalService.createCulturalLearningPath(context);

// Generar insights culturales
const insights = await culturalService.generateCulturalInsights(userData, context);
```

## 🎯 Gestor Unificado (`index.ts`)

El `AIServicesManager` proporciona una interfaz centralizada para todos los servicios:

```typescript
import { aiServicesManager } from '@/lib/services';

// Inicializar todos los servicios
await aiServicesManager.initialize();

// Verificar estado
const status = aiServicesManager.getStatus();

// Obtener servicio específico
const voiceService = aiServicesManager.getService('voice');

// Análisis completo
const analysis = await aiServicesManager.performCompleteAnalysis({
  text: "Hola mundo",
  audioBuffer: audioData,
  behaviorData: behaviorInfo,
  culturalContext: culturalInfo
});

// Limpiar recursos
await aiServicesManager.cleanup();
```

## 🔧 Configuración

### Variables de Entorno Requeridas

```env
# TensorFlow.js
TENSORFLOW_BACKEND=webgl

# APIs de Voz (opcionales)
SPEECH_RECOGNITION_API_KEY=your_key
TTS_API_KEY=your_key

# Configuración Cultural
DEFAULT_CULTURE=mexican
CULTURAL_SENSITIVITY=high
```

### Configuración de Servicios

Cada servicio puede configurarse individualmente:

```typescript
// Configurar servicio de voz
voiceService.updateConfig({
  language: 'maya',
  sampleRate: 16000,
  enableNoiseReduction: true
});

// Configurar servicio de emociones
emotionService.updateConfig({
  confidenceThreshold: 0.8,
  culturalContext: 'maya',
  enableTextAnalysis: true
});

// Configurar servicio de atención
attentionService.updateConfig({
  sampleRate: 10,
  attentionThreshold: 0.7,
  distractionThreshold: 0.3
});

// Configurar servicio cultural
culturalService.updateConfig({
  defaultCulture: 'maya',
  culturalSensitivity: 'high',
  enableAutoAdaptation: true
});
```

## 📊 Uso en Componentes React

### Ejemplo de Integración

```typescript
import React, { useEffect, useState } from 'react';
import { aiServicesManager } from '@/lib/services';

const AIIntegrationExample: React.FC = () => {
  const [isReady, setIsReady] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  useEffect(() => {
    const initializeServices = async () => {
      try {
        await aiServicesManager.initialize();
        setIsReady(true);
      } catch (error) {
        console.error('Error inicializando servicios:', error);
      }
    };

    initializeServices();
  }, []);

  const performAnalysis = async () => {
    if (!isReady) return;

    try {
      const results = await aiServicesManager.performCompleteAnalysis({
        text: "Estoy aprendiendo matemáticas",
        behaviorData: { attention: 0.8, engagement: 0.7 },
        culturalContext: { culture: 'maya', language: 'maya' }
      });

      setAnalysis(results);
    } catch (error) {
      console.error('Error en análisis:', error);
    }
  };

  return (
    <div>
      <h2>Integración de IA</h2>
      <p>Estado: {isReady ? 'Listo' : 'Inicializando...'}</p>
      <button onClick={performAnalysis} disabled={!isReady}>
        Realizar Análisis
      </button>
      {analysis && (
        <div>
          <h3>Resultados del Análisis</h3>
          <pre>{JSON.stringify(analysis, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};
```

## 🧪 Testing

### Tests Unitarios

```typescript
import { tensorFlowService, voiceService, emotionService } from '@/lib/services';

describe('AI Services', () => {
  test('TensorFlow Service should initialize correctly', async () => {
    expect(tensorFlowService.isReady()).toBe(true);
  });

  test('Voice Service should process audio', async () => {
    const audioBuffer = new Float32Array(16000);
    const analysis = await voiceService.analyzeAudio(audioBuffer);
    expect(analysis).toBeDefined();
  });

  test('Emotion Service should analyze text emotions', async () => {
    const result = await emotionService.analyzeTextEmotions("Estoy feliz");
    expect(result.primaryEmotion.name).toBe('alegría');
  });
});
```

## 🔒 Seguridad y Privacidad

### Consideraciones de Seguridad

1. **Procesamiento Local:** Los servicios de TensorFlow.js procesan datos localmente en el navegador
2. **Sin Almacenamiento:** Los datos de audio y comportamiento no se almacenan permanentemente
3. **Consentimiento:** Todos los servicios requieren consentimiento explícito del usuario
4. **Anonimización:** Los datos se anonimizan antes del análisis

### Configuración de Privacidad

```typescript
// Configurar nivel de privacidad
const privacyConfig = {
  enableLocalProcessing: true,
  disableDataCollection: false,
  anonymizeData: true,
  requireConsent: true
};
```

## 🚀 Optimización de Rendimiento

### Mejores Prácticas

1. **Inicialización Lazy:** Los servicios se inicializan solo cuando son necesarios
2. **Gestión de Memoria:** Limpieza automática de tensores y recursos
3. **Caché Inteligente:** Caché de modelos y resultados frecuentes
4. **Procesamiento Asíncrono:** Todas las operaciones son asíncronas

### Monitoreo de Rendimiento

```typescript
// Obtener métricas de rendimiento
const memoryInfo = tensorFlowService.getMemoryInfo();
const status = aiServicesManager.getStatus();

console.log('Memoria TensorFlow:', memoryInfo);
console.log('Estado servicios:', status);
```

## 🔄 Actualizaciones y Mantenimiento

### Actualización de Modelos

```typescript
// Actualizar modelo de emociones
await tensorFlowService.loadModel('/models/emotion_v2', 'emotion_classifier_v2');

// Reentrenar modelo con nuevos datos
await tensorFlowService.trainModel('emotion_classifier', newTrainingData);
```

### Limpieza de Recursos

```typescript
// Limpiar todos los servicios
await aiServicesManager.cleanup();

// Limpiar servicio específico
await tensorFlowService.cleanup();
```

## 📚 Recursos Adicionales

- [Documentación de TensorFlow.js](https://www.tensorflow.org/js)
- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
- [Guía de Accesibilidad](https://www.w3.org/WAI/)
- [Culturas Indígenas de México](https://www.gob.mx/cultura)

## 🤝 Contribución

Para contribuir al desarrollo de estos servicios:

1. Seguir las convenciones de TypeScript
2. Incluir tests unitarios para nuevas funcionalidades
3. Documentar cambios en la API
4. Mantener compatibilidad con versiones anteriores
5. Considerar impacto en rendimiento y accesibilidad

## 📄 Licencia

Este código es parte del proyecto InclusiveAI Coach y está sujeto a los términos de la licencia del proyecto.
