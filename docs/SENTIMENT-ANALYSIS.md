# Sistema de Análisis de Sentimientos en Tiempo Real

## Descripción General

El Sistema de Análisis de Sentimientos en Tiempo Real es una funcionalidad avanzada de InclusiveAI Coach que detecta emociones del estudiante y adapta contenido según su estado emocional. Incluye alertas para maestros sobre estudiantes en riesgo y predicción de abandono escolar.

## Características Principales

### 🧠 Análisis de Sentimientos en Tiempo Real
- **Detección de emociones**: Identifica 14 tipos de emociones diferentes
- **Análisis multimodal**: Texto, audio y comportamiento
- **Métricas avanzadas**: Estrés, participación, frustración, intensidad
- **Confianza del modelo**: Indicador de precisión de cada análisis

### 🎯 Predicción de Abandono Escolar
- **Análisis de riesgo**: 4 niveles (LOW, MEDIUM, HIGH, CRITICAL)
- **Factores de riesgo**: Identificación automática de indicadores
- **Recomendaciones**: Estrategias de intervención personalizadas
- **Monitoreo continuo**: Seguimiento de tendencias a lo largo del tiempo

### ⚠️ Sistema de Alertas
- **Alertas automáticas**: Generación basada en umbrales configurables
- **Tipos de alerta**: Estrés alto, baja participación, frustración, angustia emocional
- **Severidad**: 4 niveles (LOW, MEDIUM, HIGH, CRITICAL)
- **Gestión de alertas**: Resolución y seguimiento por maestros

### 📊 Análisis de Tendencias
- **Tendencias temporales**: Análisis por hora y día
- **Emociones dominantes**: Identificación de patrones emocionales
- **Métricas agregadas**: Promedios y conteos de sentimientos
- **Visualización**: Gráficos y dashboards interactivos

## Arquitectura del Sistema

### Modelos de IA

#### 1. Modelo Principal de Sentimientos
```typescript
// Arquitectura de red neuronal
- Input: 50 características combinadas
- Hidden Layers: 128 → 64 → 32 unidades
- Output: 7 métricas (sentimiento, confianza, intensidad, estrés, participación, frustración, atención)
- Activación: ReLU + Tanh
- Dropout: 0.3, 0.2 para regularización
```

#### 2. Modelo de Análisis de Texto
```typescript
// Arquitectura LSTM
- Embedding: 10000 → 128 dimensiones
- LSTM Layers: 64 → 32 unidades
- Output: Sentimiento (-1.0 a 1.0)
- Optimizador: Adam (lr=0.001)
```

#### 3. Modelo de Análisis de Audio
```typescript
// Arquitectura CNN 1D
- Conv1D: 32 filtros → 64 filtros
- MaxPooling: Reducción de dimensionalidad
- Dense: 64 → 1 unidad
- Output: Sentimiento (-1.0 a 1.0)
```

#### 4. Modelo de Análisis de Comportamiento
```typescript
// Arquitectura Dense
- Input: 20 métricas de comportamiento
- Hidden Layers: 64 → 32 → 16 unidades
- Output: 3 métricas (engagement, stress, frustration)
- Activación: ReLU + Sigmoid
```

#### 5. Modelo de Predicción de Abandono
```typescript
// Arquitectura Dense
- Input: 30 características del estudiante
- Hidden Layers: 128 → 64 → 32 unidades
- Output: Probabilidad de abandono (0.0 a 1.0)
- Activación: ReLU + Sigmoid
- Dropout: 0.4, 0.3 para regularización
```

### Base de Datos

#### Tablas Principales

##### 1. SentimentAnalysis
```sql
- id: String (PK)
- studentId: String (FK)
- sessionId: String (FK, nullable)
- timestamp: DateTime
- sentimentScore: Float (-1.0 a 1.0)
- emotion: EmotionType (enum)
- confidence: Float (0.0 a 1.0)
- intensity: Float (0.0 a 1.0)
- activityType: String
- contentId: String (nullable)
- userInput: String (nullable)
- stressLevel: Float (0.0 a 1.0)
- engagementLevel: Float (0.0 a 1.0)
- frustrationLevel: Float (0.0 a 1.0)
- isAlert: Boolean
- alertType: AlertType (enum, nullable)
- alertMessage: String (nullable)
```

##### 2. EmotionTrend
```sql
- id: String (PK)
- studentId: String (FK)
- date: DateTime
- timeSlot: Int (0-23)
- avgSentiment: Float
- dominantEmotion: EmotionType
- stressTrend: Float
- engagementTrend: Float
- totalAnalyses: Int
- positiveCount: Int
- negativeCount: Int
- neutralCount: Int
```

##### 3. SentimentAlert
```sql
- id: String (PK)
- studentId: String (FK)
- teacherId: String (FK, nullable)
- alertType: AlertType
- severity: AlertSeverity
- message: String
- context: Json (nullable)
- isResolved: Boolean
- resolvedAt: DateTime (nullable)
- resolvedBy: String (nullable)
- resolutionNotes: String (nullable)
```

### APIs

#### 1. Análisis de Sentimientos
```typescript
POST /api/ai/sentiment-analysis
{
  "studentId": "string",
  "text": "string", // opcional
  "audioFeatures": [number], // opcional
  "behavioralMetrics": { // opcional
    "responseTime": number,
    "clickPattern": [number],
    "scrollBehavior": [number],
    "interactionFrequency": number
  },
  "context": {
    "activityType": "string",
    "contentId": "string", // opcional
    "sessionId": "string" // opcional
  }
}

Response:
{
  "success": boolean,
  "result": {
    "sentimentScore": number,
    "emotion": "string",
    "confidence": number,
    "intensity": number,
    "stressLevel": number,
    "engagementLevel": number,
    "frustrationLevel": number,
    "isAlert": boolean,
    "alertType": "string", // opcional
    "alertMessage": "string", // opcional
    "recommendations": [string]
  }
}
```

#### 2. Predicción de Abandono
```typescript
POST /api/ai/sentiment-analysis/dropout-prediction
{
  "studentId": "string"
}

Response:
{
  "success": boolean,
  "prediction": {
    "riskLevel": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
    "probability": number,
    "factors": [string],
    "recommendations": [string],
    "confidence": number
  }
}
```

#### 3. Gestión de Alertas
```typescript
GET /api/ai/sentiment-analysis/alerts?studentId=string&teacherId=string

PUT /api/ai/sentiment-analysis/alerts
{
  "alertId": "string",
  "resolutionNotes": "string" // opcional
}
```

#### 4. Reportes
```typescript
GET /api/ai/sentiment-analysis/reports?studentId=string&days=number

Response:
{
  "success": boolean,
  "report": {
    "studentId": "string",
    "period": "string",
    "generatedAt": "DateTime",
    "statistics": {
      "totalAnalyses": number,
      "avgSentiment": number,
      "dominantEmotion": "string",
      "alertCount": number,
      "engagementTrend": number,
      "stressTrend": number,
      "emotionDistribution": object
    },
    "trends": [EmotionTrend],
    "dropoutRisk": DropoutPrediction,
    "recentAlerts": [SentimentAlert],
    "recommendations": [string]
  }
}
```

## Componentes React

### 1. SentimentAnalysis Component
```typescript
import { SentimentAnalysis } from '@/components/ai/SentimentAnalysis';

// Uso básico
<SentimentAnalysis />
```

### 2. Hook Personalizado
```typescript
import { useSentimentAnalysis } from '@/lib/hooks/useSentimentAnalysis';

const {
  isAnalyzing,
  currentResult,
  trends,
  alerts,
  dropoutPrediction,
  analyzeTextSentiment,
  analyzeAudioSentiment,
  analyzeBehavioralSentiment,
  resolveAlert
} = useSentimentAnalysis({
  studentId: 'student-123',
  autoRefresh: true,
  refreshInterval: 30000,
  enableRealTime: true
});
```

## Tipos de Emociones

### Emociones Básicas
- **JOY**: Alegría, felicidad, satisfacción
- **SADNESS**: Tristeza, melancolía, desánimo
- **ANGER**: Ira, enojo, frustración
- **FEAR**: Miedo, ansiedad, preocupación
- **SURPRISE**: Sorpresa, asombro, incredulidad
- **DISGUST**: Disgusto, repulsión, aversión
- **NEUTRAL**: Neutralidad, equilibrio emocional

### Emociones Educativas
- **CONFUSION**: Confusión, incertidumbre, duda
- **FRUSTRATION**: Frustración, irritación, molestia
- **EXCITEMENT**: Emoción, entusiasmo, motivación
- **ANXIETY**: Ansiedad, nerviosismo, tensión
- **BOREDOM**: Aburrimiento, desinterés, apatía
- **CONFIDENCE**: Confianza, seguridad, autoestima
- **UNCERTAINTY**: Incertidumbre, indecisión, vacilación

## Tipos de Alertas

### Alertas de Estado Emocional
- **HIGH_STRESS**: Niveles altos de estrés detectados
- **LOW_ENGAGEMENT**: Baja participación en actividades
- **FRUSTRATION_SPIKE**: Picos de frustración identificados
- **EMOTIONAL_DISTRESS**: Angustia emocional significativa

### Alertas de Comportamiento
- **LEARNING_BLOCK**: Bloqueos en el aprendizaje
- **BEHAVIORAL_CHANGE**: Cambios significativos en comportamiento
- **ATTENTION_DECLINE**: Disminución en la atención
- **MOTIVATION_DROP**: Caída en la motivación

## Configuración

### Variables de Entorno
```env
# APIs de IA
ANTHROPIC_API_KEY=your_anthropic_key
OPENAI_API_KEY=your_openai_key

# Base de datos
DATABASE_URL=your_database_url
DIRECT_URL=your_direct_url

# Configuración del modelo
SENTIMENT_MODEL_PATH=./models/sentiment-analysis
SENTIMENT_CONFIDENCE_THRESHOLD=0.7
SENTIMENT_ALERT_THRESHOLDS={"stress": 0.8, "engagement": 0.2, "frustration": 0.7}
```

### Configuración de Umbrales
```typescript
const ALERT_THRESHOLDS = {
  HIGH_STRESS: 0.8,
  LOW_ENGAGEMENT: 0.2,
  FRUSTRATION_SPIKE: 0.7,
  EMOTIONAL_DISTRESS: 0.8
};

const DROPOUT_RISK_THRESHOLDS = {
  LOW: 0.25,
  MEDIUM: 0.5,
  HIGH: 0.75,
  CRITICAL: 0.9
};
```

## Uso y Ejemplos

### 1. Análisis de Texto
```typescript
const result = await analyzeTextSentiment(
  "Me siento muy frustrado con esta lección, no la entiendo",
  {
    activityType: 'lesson_response',
    contentId: 'math-lesson-123'
  }
);

console.log(result.emotion); // "FRUSTRATION"
console.log(result.isAlert); // true
console.log(result.recommendations); // ["Sugerir pausa breve...", "Ofrecer ayuda adicional..."]
```

### 2. Análisis de Comportamiento
```typescript
const behavioralMetrics = {
  responseTime: 15000, // 15 segundos
  clickPattern: [1, 0, 1, 0, 0, 1, 0, 0, 0, 1],
  scrollBehavior: [10, 5, 15, 8, 12, 3, 7, 9, 6, 11],
  interactionFrequency: 45 // 45 interacciones por minuto
};

const result = await analyzeBehavioralSentiment(behavioralMetrics, {
  activityType: 'interactive_exercise'
});
```

### 3. Predicción de Abandono
```typescript
const prediction = await predictDropoutRisk('student-123');

if (prediction.riskLevel === 'CRITICAL') {
  // Implementar intervención inmediata
  console.log('Intervención crítica requerida');
  console.log('Factores:', prediction.factors);
  console.log('Recomendaciones:', prediction.recommendations);
}
```

### 4. Gestión de Alertas
```typescript
// Obtener alertas no resueltas
const alerts = await getUnresolvedAlerts('student-123');

// Resolver una alerta
const success = await resolveAlert('alert-456', 'Intervención aplicada: apoyo individualizado');
```

## Monitoreo y Mantenimiento

### Métricas de Rendimiento
- **Precisión del modelo**: >85% en detección de emociones
- **Latencia**: <500ms para análisis en tiempo real
- **Disponibilidad**: 99.9% uptime
- **Throughput**: 1000 análisis por minuto

### Logs y Monitoreo
```typescript
// Logs automáticos
console.log('📊 Análisis de sentimientos para estudiante', studentId, {
  emotion: result.emotion,
  sentimentScore: result.sentimentScore,
  isAlert: result.isAlert
});

console.log('🎯 Predicción de abandono para estudiante', studentId, {
  riskLevel: prediction.riskLevel,
  probability: prediction.probability
});
```

### Entrenamiento del Modelo
```typescript
// Entrenamiento con nuevos datos
await sentimentAnalysisModel.trainModel(trainingData);

// Guardado del modelo
await sentimentAnalysisModel.saveModel();
```

## Consideraciones de Privacidad y Seguridad

### Protección de Datos
- **Encriptación**: Todos los datos sensibles encriptados
- **Anonimización**: IDs de estudiantes encriptados
- **Retención**: Datos eliminados automáticamente después de 2 años
- **Consentimiento**: Requerido para análisis de sentimientos

### Acceso y Permisos
- **Maestros**: Solo pueden ver datos de sus estudiantes
- **Administradores**: Acceso completo para análisis agregados
- **Estudiantes**: Pueden optar por no participar
- **Auditoría**: Logs completos de acceso y uso

## Roadmap y Mejoras Futuras

### Próximas Funcionalidades
1. **Análisis facial**: Integración con webcam para detección de emociones
2. **Análisis de voz avanzado**: Tono, ritmo y patrones de habla
3. **Machine Learning continuo**: Aprendizaje adaptativo del modelo
4. **Integración con LMS**: Conexión directa con sistemas educativos
5. **Análisis de grupo**: Detección de dinámicas de clase

### Optimizaciones Técnicas
1. **Modelo más eficiente**: Reducción de latencia y uso de recursos
2. **Caché inteligente**: Almacenamiento en memoria para análisis frecuentes
3. **Escalabilidad**: Soporte para miles de estudiantes simultáneos
4. **Offline mode**: Análisis básico sin conexión a internet

## Soporte y Contacto

Para soporte técnico o preguntas sobre el sistema de análisis de sentimientos:

- **Documentación**: `/docs/SENTIMENT-ANALYSIS.md`
- **Ejemplos**: `/examples/sentiment-analysis-example.tsx`
- **Pruebas**: `/app/test-sentiment/page.tsx`
- **Issues**: GitHub Issues del proyecto

---

**Nota**: Este sistema está diseñado para ser una herramienta de apoyo educativo y no reemplaza la evaluación profesional de salud mental. Los maestros deben usar esta información como guía adicional para su juicio profesional.
