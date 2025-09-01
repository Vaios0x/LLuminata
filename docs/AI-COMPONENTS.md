# Componentes de IA y Machine Learning

Este documento describe los cinco componentes de IA avanzados implementados en el sistema Inclusive AI Coach para proporcionar una experiencia educativa personalizada y adaptativa.

## Tabla de Contenidos

1. [NeedsDetectionWizard](#needsdetectionwizard)
2. [CulturalAdaptationPanel](#culturaladaptationpanel)
3. [VoiceGenerationStudio](#voicegenerationstudio)
4. [BehavioralAnalysis](#behavioralanalysis)
5. [RecommendationEngine](#recommendationengine)
6. [Instalación y Configuración](#instalación-y-configuración)
7. [Uso General](#uso-general)
8. [API y Integración](#api-y-integración)
9. [Personalización](#personalización)
10. [Mejores Prácticas](#mejores-prácticas)

## NeedsDetectionWizard

Wizard interactivo para la detección automática de necesidades especiales de aprendizaje.

### Características

- **Evaluación Integral**: Cubre necesidades visuales, auditivas, cognitivas, emocionales y culturales
- **Proceso Guiado**: Wizard paso a paso con validación en tiempo real
- **Análisis de IA**: Algoritmos inteligentes para interpretar respuestas
- **Resultados Detallados**: Puntuaciones, recomendaciones y adaptaciones sugeridas
- **Accesibilidad**: Navegación por teclado y soporte para lectores de pantalla

### Props

```typescript
interface NeedsDetectionWizardProps {
  userId: string;
  onComplete?: (results: AssessmentResult[]) => void;
  onSave?: (data: any) => void;
  onCancel?: () => void;
  className?: string;
}
```

### Ejemplo de Uso

```tsx
import { NeedsDetectionWizard } from '@/components/ai';

<NeedsDetectionWizard
  userId="user-123"
  onComplete={(results) => {
    console.log('Análisis completado:', results);
    // Aplicar adaptaciones basadas en resultados
  }}
  onSave={(data) => {
    // Guardar progreso en base de datos
  }}
  onCancel={() => {
    // Manejar cancelación
  }}
/>
```

### Categorías de Evaluación

1. **Necesidades Visuales**
   - Dificultad para leer texto pequeño
   - Sensibilidad a luces brillantes
   - Preferencia por alto contraste

2. **Necesidades Auditivas**
   - Dificultad en entornos ruidosos
   - Necesidad de repetición
   - Preferencia por subtítulos

3. **Necesidades Cognitivas**
   - Estilo de aprendizaje preferido
   - Tiempo de procesamiento
   - Capacidad de atención

4. **Necesidades Emocionales**
   - Comodidad en grupos
   - Adaptación a cambios
   - Preferencias de retroalimentación

5. **Necesidades Culturales**
   - Idioma preferido
   - Contexto cultural
   - Preferencias de presentación

## CulturalAdaptationPanel

Panel para adaptación cultural automática de la experiencia de aprendizaje.

### Características

- **Contextos Culturales**: Soporte para Maya, Náhuatl, Zapoteco, Mixteco, Purépecha
- **Adaptaciones Dinámicas**: Cambios en tiempo real según preferencias
- **Análisis de Impacto**: Evaluación de efectividad de adaptaciones
- **Personalización**: Ajustes de idioma, estilo visual y interacción
- **Perfiles de Aprendizaje**: Configuración de estilos de aprendizaje

### Props

```typescript
interface CulturalAdaptationPanelProps {
  userId: string;
  onAdaptationChange?: (settings: AdaptationSettings) => void;
  onSave?: (settings: AdaptationSettings) => void;
  onReset?: () => void;
  className?: string;
}
```

### Contextos Culturales Soportados

- **Maya**: Símbolos mayas, términos culturales, aprendizaje circular
- **Náhuatl**: Narrativa oral, conexión espiritual
- **Zapoteco**: Arte tradicional, pensamiento sistémico
- **Mixteco**: Códices, estructura narrativa
- **Purépecha**: Música tradicional, aprendizaje manual

### Ejemplo de Uso

```tsx
import { CulturalAdaptationPanel } from '@/components/ai';

<CulturalAdaptationPanel
  userId="user-123"
  onAdaptationChange={(settings) => {
    // Aplicar cambios en tiempo real
    applyCulturalAdaptations(settings);
  }}
  onSave={(settings) => {
    // Guardar configuración permanente
    saveUserPreferences(settings);
  }}
/>
```

## VoiceGenerationStudio

Estudio completo para generación de voz multilingüe con personalización avanzada.

### Características

- **Perfiles de Voz**: Voces específicas para cada cultura indígena
- **Controles Avanzados**: Velocidad, tono, volumen, claridad, emoción
- **Múltiples Idiomas**: Maya, Náhuatl, Zapoteco, Mixteco, Purépecha
- **Gestión de Proyectos**: Crear, guardar y exportar proyectos de voz
- **Reproducción en Tiempo Real**: Previsualización y controles de audio

### Props

```typescript
interface VoiceGenerationStudioProps {
  userId: string;
  onGenerate?: (track: AudioTrack) => void;
  onSave?: (project: any) => void;
  onExport?: (audioData: any) => void;
  className?: string;
}
```

### Perfiles de Voz Disponibles

- **Abuela Maya**: Sabia y cálida, voz elder femenina
- **Maestro Náhuatl**: Autoritativo y respetuoso, voz adulta masculina
- **Narradora Zapoteca**: Expresiva y narrativa, voz adulta femenina
- **Niño Mixteco**: Curioso y entusiasta, voz infantil masculina
- **Músico Purépecha**: Rítmico y musical, voz joven masculina
- **Maestra Española**: Clara y educativa, voz adulta femenina

### Ejemplo de Uso

```tsx
import { VoiceGenerationStudio } from '@/components/ai';

<VoiceGenerationStudio
  userId="user-123"
  onGenerate={(track) => {
    console.log('Audio generado:', track);
    // Reproducir o procesar audio
  }}
  onSave={(project) => {
    // Guardar proyecto en base de datos
  }}
  onExport={(audioData) => {
    // Exportar archivos de audio
  }}
/>
```

## BehavioralAnalysis

Análisis profundo de comportamiento y patrones de aprendizaje del estudiante.

### Características

- **Métricas en Tiempo Real**: Engagement, rendimiento, interacciones sociales
- **Detección de Patrones**: Identificación automática de tendencias
- **Análisis Predictivo**: Predicciones de comportamiento futuro
- **Recomendaciones Inteligentes**: Sugerencias basadas en IA
- **Visualizaciones Interactivas**: Gráficos y dashboards dinámicos

### Props

```typescript
interface BehavioralAnalysisProps {
  userId: string;
  timeRange?: 'day' | 'week' | 'month' | 'quarter';
  onPatternDetected?: (pattern: BehaviorPattern) => void;
  onRecommendationGenerated?: (recommendation: any) => void;
  onExport?: (data: any) => void;
  className?: string;
}
```

### Métricas Analizadas

- **Engagement**: Tasa de participación y tiempo activo
- **Rendimiento**: Precisión, velocidad, completación
- **Social**: Interacciones con otros estudiantes
- **Emocional**: Estado de ánimo y bienestar
- **Cognitivo**: Carga mental y capacidad de atención

### Patrones Detectados

- **Pico Matutino**: Mayor productividad en las mañanas
- **Aprendizaje Social**: Mejor rendimiento en grupos
- **Preferencia Visual**: Mejor retención con contenido visual
- **Umbral de Frustración**: Tendencia a abandonar tareas difíciles

### Ejemplo de Uso

```tsx
import { BehavioralAnalysis } from '@/components/ai';

<BehavioralAnalysis
  userId="user-123"
  timeRange="week"
  onPatternDetected={(pattern) => {
    console.log('Patrón detectado:', pattern);
    // Aplicar adaptaciones basadas en patrones
  }}
  onRecommendationGenerated={(rec) => {
    // Mostrar recomendaciones al usuario
  }}
  onExport={(data) => {
    // Exportar datos para análisis externo
  }}
/>
```

## RecommendationEngine

Motor de recomendaciones inteligentes basado en IA y machine learning.

### Características

- **Algoritmos de IA**: Recomendaciones personalizadas basadas en perfil
- **Filtros Avanzados**: Por tipo, dificultad, duración, categoría
- **Sistema de Calificación**: Puntuaciones de relevancia y confianza
- **Gestión de Estado**: Seguimiento de completados y favoritos
- **Exportación**: Listas de recomendaciones exportables

### Props

```typescript
interface RecommendationEngineProps {
  userId: string;
  onRecommendationSelected?: (recommendation: Recommendation) => void;
  onBookmark?: (recommendationId: string) => void;
  onComplete?: (recommendationId: string) => void;
  onExport?: (recommendations: Recommendation[]) => void;
  className?: string;
}
```

### Tipos de Contenido

- **Lecciones**: Contenido educativo estructurado
- **Videos**: Material audiovisual
- **Juegos**: Actividades lúdicas interactivas
- **Ejercicios**: Práctica y aplicación
- **Actividades**: Proyectos y tareas creativas
- **Recursos**: Material de referencia

### Categorías Disponibles

- **Cultura**: Historia y tradiciones indígenas
- **Lengua**: Aprendizaje de idiomas indígenas
- **Matemáticas**: Conceptos matemáticos culturales
- **Arte**: Expresiones artísticas tradicionales
- **Música**: Instrumentos y ritmos indígenas
- **Proyecto**: Actividades creativas integradas

### Ejemplo de Uso

```tsx
import { RecommendationEngine } from '@/components/ai';

<RecommendationEngine
  userId="user-123"
  onRecommendationSelected={(rec) => {
    console.log('Recomendación seleccionada:', rec);
    // Navegar al contenido recomendado
  }}
  onBookmark={(id) => {
    // Marcar como favorito
  }}
  onComplete={(id) => {
    // Marcar como completado
  }}
  onExport={(recommendations) => {
    // Exportar lista de recomendaciones
  }}
/>
```

## Instalación y Configuración

### Dependencias Requeridas

```bash
npm install lucide-react @radix-ui/react-tabs @radix-ui/react-progress
```

### Configuración de Tailwind CSS

Asegúrate de que tu `tailwind.config.js` incluya los componentes:

```javascript
module.exports = {
  content: [
    './components/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Colores personalizados para accesibilidad
      }
    }
  }
}
```

### Variables de Entorno

```env
# Configuración de IA
NEXT_PUBLIC_AI_API_URL=http://localhost:3000/api/ai
NEXT_PUBLIC_ANALYTICS_ENABLED=true

# Configuración de voz
NEXT_PUBLIC_TTS_ENABLED=true
NEXT_PUBLIC_VOICE_MODELS_PATH=/models/voice

# Configuración cultural
NEXT_PUBLIC_CULTURAL_CONTEXTS_ENABLED=true
NEXT_PUBLIC_LANGUAGES_SUPPORTED=maya,nahuatl,zapoteco,mixteco,purepecha
```

## Uso General

### Importación de Componentes

```tsx
import {
  NeedsDetectionWizard,
  CulturalAdaptationPanel,
  VoiceGenerationStudio,
  BehavioralAnalysis,
  RecommendationEngine
} from '@/components/ai';
```

### Configuración Global

```tsx
// En tu archivo de configuración
export const AI_CONFIG = {
  userId: 'user-123',
  culturalContext: 'maya',
  language: 'es-MX',
  accessibility: {
    visual: true,
    auditory: true,
    motor: true,
    cognitive: true
  }
};
```

### Integración con Estado Global

```tsx
// Con Zustand o similar
import { useAIStore } from '@/stores/ai';

const aiStore = useAIStore();

// En los componentes
<NeedsDetectionWizard
  userId={aiStore.userId}
  onComplete={(results) => aiStore.setNeeds(results)}
/>
```

## API y Integración

### Endpoints de IA

```typescript
// Detección de necesidades
POST /api/ai/needs-detection
{
  userId: string;
  answers: Record<string, any>;
}

// Análisis de comportamiento
GET /api/ai/behavioral-analysis/:userId
{
  timeRange: string;
  metrics: string[];
}

// Generación de voz
POST /api/ai/voice-generation
{
  text: string;
  voiceProfile: string;
  settings: VoiceSettings;
}

// Recomendaciones
GET /api/ai/recommendations/:userId
{
  filters: RecommendationFilters;
  limit: number;
}
```

### Webhooks

```typescript
// Webhook para análisis completado
POST /webhooks/analysis-complete
{
  userId: string;
  analysisType: string;
  results: any;
  timestamp: string;
}
```

## Personalización

### Temas y Estilos

```css
/* Personalización de colores */
.ai-component {
  --primary-color: #3b82f6;
  --secondary-color: #10b981;
  --accent-color: #8b5cf6;
  --warning-color: #f59e0b;
  --error-color: #ef4444;
}

/* Personalización de accesibilidad */
.ai-component[data-high-contrast="true"] {
  --text-color: #000000;
  --background-color: #ffffff;
  --border-color: #000000;
}
```

### Configuración de Componentes

```typescript
// Configuración personalizada
const customConfig = {
  needsDetection: {
    categories: ['visual', 'auditory', 'cognitive'],
    questions: customQuestions,
    analysisAlgorithm: 'advanced'
  },
  culturalAdaptation: {
    contexts: ['maya', 'nahuatl'],
    adaptations: customAdaptations
  },
  voiceGeneration: {
    profiles: customVoiceProfiles,
    quality: 'high'
  }
};
```

## Mejores Prácticas

### Accesibilidad

1. **Navegación por Teclado**: Todos los componentes son navegables con Tab
2. **ARIA Labels**: Etiquetas descriptivas para lectores de pantalla
3. **Contraste**: Ratios de contraste adecuados para texto
4. **Tamaños**: Elementos interactivos con tamaño mínimo de 44px
5. **Estados**: Indicadores claros de estados activos y deshabilitados

### Rendimiento

1. **Lazy Loading**: Cargar componentes solo cuando sean necesarios
2. **Memoización**: Usar `useMemo` y `useCallback` para optimizar re-renders
3. **Debouncing**: Aplicar debounce en búsquedas y filtros
4. **Caching**: Cachear resultados de análisis y recomendaciones
5. **Optimización**: Minimizar re-renders innecesarios

### Seguridad

1. **Validación**: Validar todas las entradas del usuario
2. **Sanitización**: Limpiar datos antes de mostrarlos
3. **Autenticación**: Verificar permisos antes de acceder a datos
4. **Rate Limiting**: Implementar límites en APIs de IA
5. **Encriptación**: Encriptar datos sensibles en tránsito

### Testing

```typescript
// Ejemplo de test para NeedsDetectionWizard
import { render, screen, fireEvent } from '@testing-library/react';
import { NeedsDetectionWizard } from '@/components/ai';

test('completes needs detection wizard', async () => {
  const onComplete = jest.fn();
  
  render(
    <NeedsDetectionWizard
      userId="test-user"
      onComplete={onComplete}
    />
  );
  
  // Navegar por el wizard
  fireEvent.click(screen.getByText('Siguiente'));
  
  // Verificar que se llama onComplete
  expect(onComplete).toHaveBeenCalled();
});
```

### Monitoreo

```typescript
// Logging de eventos importantes
const logAIEvent = (event: string, data: any) => {
  console.log(`AI Event: ${event}`, data);
  // Enviar a servicio de analytics
  analytics.track('ai_component_event', {
    event,
    userId: data.userId,
    timestamp: new Date().toISOString()
  });
};
```

## Troubleshooting

### Problemas Comunes

1. **Componentes no se renderizan**: Verificar importaciones y dependencias
2. **Errores de TypeScript**: Asegurar que los tipos estén correctamente definidos
3. **Problemas de accesibilidad**: Verificar ARIA labels y navegación por teclado
4. **Rendimiento lento**: Optimizar re-renders y implementar lazy loading
5. **Errores de API**: Verificar endpoints y manejo de errores

### Debug

```typescript
// Habilitar logs de debug
const DEBUG_AI = process.env.NODE_ENV === 'development';

if (DEBUG_AI) {
  console.log('AI Component Debug:', {
    component: 'NeedsDetectionWizard',
    props: { userId, onComplete },
    state: currentState
  });
}
```

## Contribución

Para contribuir a los componentes de IA:

1. Seguir las convenciones de código establecidas
2. Agregar tests para nuevas funcionalidades
3. Verificar accesibilidad con herramientas como axe-core
4. Documentar cambios en este archivo
5. Probar en diferentes navegadores y dispositivos

## Licencia

Este código es parte del proyecto Inclusive AI Coach y está sujeto a los términos de licencia del proyecto.
