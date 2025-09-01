# Guía de Componentes de UI Especializados - InclusiveAI Coach

Esta guía documenta todos los componentes de UI especializados implementados para la plataforma InclusiveAI Coach, incluyendo componentes de visualización, interacción y accesibilidad avanzada.

## Índice

- [Componentes de Visualización](#componentes-de-visualización)
  - [HeatmapChart](#heatmapchart)
  - [PredictiveChart](#predictivechart)
  - [RealTimeChart](#realtimechart)
  - [BehavioralChart](#behavioralchart)
  - [CulturalChart](#culturalchart)
- [Componentes de Interacción](#componentes-de-interacción)
  - [VoiceRecorder](#voicerecorder)
- [Componentes de Accesibilidad Avanzada](#componentes-de-accesibilidad-avanzada)
  - [BrailleDisplay](#brailledisplay)

## Componentes de Visualización

### HeatmapChart

Gráfico de heatmap interactivo para visualizar datos de comportamiento y patrones de aprendizaje.

**Ubicación:** `components/ui/charts/HeatmapChart.tsx`

**Características:**
- Visualización de datos en formato de calor
- Interactividad con navegación por teclado
- Tooltips informativos
- Personalización de colores
- Estadísticas automáticas
- Accesibilidad completa

**Ejemplo de uso:**
```tsx
import { HeatmapChart } from '@/components/ui/charts';

const heatmapData = [
  { x: 1, y: 1, value: 85, label: 'Matemáticas', category: 'académico' },
  { x: 2, y: 1, value: 92, label: 'Lenguaje', category: 'académico' },
  { x: 1, y: 2, value: 78, label: 'Atención', category: 'comportamiento' },
  // ... más datos
];

<HeatmapChart
  data={heatmapData}
  title="Análisis de Rendimiento"
  xAxisLabel="Áreas"
  yAxisLabel="Métricas"
  size="lg"
  interactive={true}
  accessibility={{
    ariaLabel: "Gráfico de calor de rendimiento académico",
    enableKeyboardNavigation: true
  }}
  onPointClick={(point) => console.log('Punto seleccionado:', point)}
/>
```

**Props principales:**
- `data`: Array de puntos de datos
- `title`: Título del gráfico
- `size`: Tamaño ('sm', 'md', 'lg')
- `interactive`: Habilita interacciones
- `accessibility`: Configuración de accesibilidad

### PredictiveChart

Gráfico predictivo que muestra tendencias futuras basadas en datos históricos con IA.

**Ubicación:** `components/ui/charts/PredictiveChart.tsx`

**Características:**
- Predicciones automáticas usando algoritmos de IA
- Intervalos de confianza
- Detección de anomalías
- Múltiples tipos de visualización
- Exportación de predicciones

**Ejemplo de uso:**
```tsx
import { PredictiveChart } from '@/components/ui/charts';

const historicalData = [
  { date: '2024-01-01', actual: 75 },
  { date: '2024-01-02', actual: 82 },
  { date: '2024-01-03', actual: 78 },
  // ... más datos históricos
];

<PredictiveChart
  data={historicalData}
  title="Predicción de Rendimiento"
  predictionHorizon={30}
  confidenceLevel={0.95}
  showConfidenceInterval={true}
  showAnomalies={true}
  onPredictionUpdate={(predictions) => {
    console.log('Nuevas predicciones:', predictions);
  }}
/>
```

**Props principales:**
- `data`: Datos históricos
- `predictionHorizon`: Días hacia el futuro
- `confidenceLevel`: Nivel de confianza (0-1)
- `showConfidenceInterval`: Mostrar intervalo de confianza
- `showAnomalies`: Detectar anomalías

### RealTimeChart

Gráfico en tiempo real que actualiza datos dinámicamente usando WebSocket y muestra métricas en vivo.

**Ubicación:** `components/ui/charts/RealTimeChart.tsx`

**Características:**
- Actualización en tiempo real
- Soporte para WebSocket y polling
- Múltiples categorías de datos
- Estadísticas en vivo
- Indicadores de estado de conexión

**Ejemplo de uso:**
```tsx
import { RealTimeChart } from '@/components/ui/charts';

<RealTimeChart
  title="Métricas en Tiempo Real"
  dataStream="websocket"
  websocketUrl="ws://localhost:3000/api/realtime"
  categories={['atención', 'engagement', 'progreso']}
  maxDataPoints={100}
  updateInterval={1000}
  onDataUpdate={(data) => {
    console.log('Datos actualizados:', data);
  }}
  onError={(error) => {
    console.error('Error en tiempo real:', error);
  }}
/>
```

**Props principales:**
- `dataStream`: Tipo de stream ('websocket', 'polling', 'manual')
- `websocketUrl`: URL del WebSocket
- `categories`: Categorías de datos
- `maxDataPoints`: Máximo número de puntos
- `updateInterval`: Intervalo de actualización

### BehavioralChart

Gráfico de comportamiento que visualiza patrones de interacción del usuario y análisis de comportamiento.

**Ubicación:** `components/ui/charts/BehavioralChart.tsx`

**Características:**
- Análisis de patrones de comportamiento
- Detección automática de insights
- Múltiples tipos de gráficos (bar, pie, radar)
- Métricas de atención y engagement
- Recomendaciones personalizadas

**Ejemplo de uso:**
```tsx
import { BehavioralChart } from '@/components/ui/charts';

const behavioralData = [
  {
    timestamp: Date.now(),
    category: 'lectura',
    value: 85,
    duration: 1200,
    attention: 90,
    engagement: 88
  },
  // ... más datos de comportamiento
];

<BehavioralChart
  data={behavioralData}
  title="Análisis de Comportamiento"
  chartType="radar"
  showPatterns={true}
  showEmotions={true}
  showAttention={true}
  onPatternDetected={(pattern) => {
    console.log('Patrón detectado:', pattern);
  }}
  onCategoryClick={(category) => {
    console.log('Categoría seleccionada:', category);
  }}
/>
```

**Props principales:**
- `data`: Datos de comportamiento
- `chartType`: Tipo de gráfico ('bar', 'pie', 'radar')
- `showPatterns`: Detectar patrones automáticamente
- `showEmotions`: Mostrar análisis de emociones
- `showAttention`: Mostrar métricas de atención

### CulturalChart

Gráfico cultural que visualiza datos relacionados con adaptación cultural, idiomas y contextos culturales.

**Ubicación:** `components/ui/charts/CulturalChart.tsx`

**Características:**
- Análisis de adaptación cultural
- Soporte para múltiples idiomas indígenas
- Insights culturales automáticos
- Colores representativos por cultura
- Métricas de engagement cultural

**Ejemplo de uso:**
```tsx
import { CulturalChart } from '@/components/ui/charts';

const culturalData = [
  {
    culture: 'maya',
    language: 'maya',
    region: 'Yucatán',
    value: 85,
    adaptation: 90,
    engagement: 88,
    accessibility: 92
  },
  // ... más datos culturales
];

<CulturalChart
  data={culturalData}
  title="Análisis Cultural"
  chartType="treemap"
  focus="culture"
  showInsights={true}
  showAdaptation={true}
  onCultureClick={(culture) => {
    console.log('Cultura seleccionada:', culture);
  }}
  onInsightDetected={(insight) => {
    console.log('Insight cultural:', insight);
  }}
/>
```

**Props principales:**
- `data`: Datos culturales
- `chartType`: Tipo de gráfico ('bar', 'pie', 'treemap')
- `focus`: Enfoque del análisis ('culture', 'language', 'region')
- `showInsights`: Detectar insights automáticamente
- `showAdaptation`: Mostrar métricas de adaptación

## Componentes de Interacción

### VoiceRecorder

Grabador de voz interactivo con reconocimiento de voz y análisis de audio.

**Ubicación:** `components/ui/charts/VoiceRecorder.tsx`

**Características:**
- Grabación de audio en tiempo real
- Visualización de forma de onda
- Transcripción automática
- Detección de emociones
- Detección de idioma
- Retroalimentación háptica

**Ejemplo de uso:**
```tsx
import { VoiceRecorder } from '@/components/ui/interactive';

<VoiceRecorder
  title="Grabador de Voz Inteligente"
  maxDuration={120}
  showWaveform={true}
  showTranscription={true}
  showEmotion={true}
  showLanguage={true}
  onRecordingStart={() => console.log('Grabación iniciada')}
  onRecordingStop={(blob, duration) => {
    console.log('Grabación completada:', duration);
  }}
  onTranscription={(text, confidence) => {
    console.log('Transcripción:', text, confidence);
  }}
  onEmotionDetected={(emotion, confidence) => {
    console.log('Emoción detectada:', emotion, confidence);
  }}
  onLanguageDetected={(language, confidence) => {
    console.log('Idioma detectado:', language, confidence);
  }}
/>
```

**Props principales:**
- `maxDuration`: Duración máxima en segundos
- `showWaveform`: Mostrar forma de onda
- `showTranscription`: Habilitar transcripción
- `showEmotion`: Detectar emociones
- `showLanguage`: Detectar idioma

## Componentes de Accesibilidad Avanzada

### BrailleDisplay

Display en braille que convierte texto a braille y proporciona retroalimentación háptica.

**Ubicación:** `components/accessibility/BrailleDisplay.tsx`

**Características:**
- Conversión automática de texto a braille
- Soporte completo para español e idiomas indígenas
- Navegación por teclado
- Auto-scroll configurable
- Retroalimentación háptica
- Información detallada de caracteres

**Ejemplo de uso:**
```tsx
import { BrailleDisplay } from '@/components/accessibility';

<BrailleDisplay
  text="Hola, bienvenido a InclusiveAI Coach"
  title="Display Braille"
  size="lg"
  showText={true}
  showUnicode={false}
  enableHaptic={true}
  autoScroll={false}
  scrollSpeed={1000}
  onCharacterClick={(character, braille) => {
    console.log('Carácter seleccionado:', character, braille);
  }}
  onTextChange={(text) => {
    console.log('Texto actualizado:', text);
  }}
  accessibility={{
    ariaLabel: "Display braille interactivo",
    enableKeyboardNavigation: true
  }}
/>
```

**Props principales:**
- `text`: Texto a convertir
- `size`: Tamaño del display ('sm', 'md', 'lg')
- `showText`: Mostrar caracteres originales
- `showUnicode`: Mostrar códigos Unicode
- `enableHaptic`: Habilitar retroalimentación háptica
- `autoScroll`: Auto-scroll automático

## Uso General

### Importación

```tsx
// Componentes de visualización
import {
  HeatmapChart,
  PredictiveChart,
  RealTimeChart,
  BehavioralChart,
  CulturalChart
} from '@/components/ui/charts';

// Componentes de interacción
import { VoiceRecorder } from '@/components/ui/interactive';

// Componentes de accesibilidad
import { BrailleDisplay } from '@/components/accessibility';
```

### Ejemplo Completo

```tsx
import React, { useState } from 'react';
import {
  HeatmapChart,
  PredictiveChart,
  RealTimeChart,
  BehavioralChart,
  CulturalChart
} from '@/components/ui/charts';
import { VoiceRecorder } from '@/components/ui/interactive';
import { BrailleDisplay } from '@/components/accessibility';

const Dashboard = () => {
  const [selectedData, setSelectedData] = useState(null);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
      {/* Gráficos de visualización */}
      <HeatmapChart
        data={heatmapData}
        title="Análisis de Rendimiento"
        onPointClick={setSelectedData}
      />
      
      <PredictiveChart
        data={historicalData}
        title="Predicciones"
        onPredictionUpdate={console.log}
      />
      
      <RealTimeChart
        title="Métricas en Vivo"
        dataStream="manual"
        categories={['atención', 'progreso']}
      />
      
      <BehavioralChart
        data={behavioralData}
        title="Comportamiento"
        chartType="radar"
        onPatternDetected={console.log}
      />
      
      <CulturalChart
        data={culturalData}
        title="Análisis Cultural"
        focus="culture"
        onInsightDetected={console.log}
      />
      
      {/* Componentes de interacción */}
      <VoiceRecorder
        title="Grabador de Voz"
        onTranscription={console.log}
        onEmotionDetected={console.log}
      />
      
      {/* Componentes de accesibilidad */}
      <BrailleDisplay
        text="Texto de ejemplo para braille"
        title="Display Braille"
        onCharacterClick={console.log}
      />
    </div>
  );
};

export default Dashboard;
```

## Consideraciones de Accesibilidad

Todos los componentes incluyen:

1. **Navegación por teclado**: Soporte completo para navegación sin mouse
2. **ARIA labels**: Etiquetas descriptivas para lectores de pantalla
3. **Contraste**: Colores con suficiente contraste
4. **Retroalimentación**: Indicadores visuales y hápticos
5. **Responsive**: Adaptación a diferentes tamaños de pantalla

## Optimización de Rendimiento

1. **Memoización**: Uso de `useMemo` y `useCallback` para optimizar re-renders
2. **Lazy loading**: Carga diferida de componentes pesados
3. **Virtualización**: Para listas largas de datos
4. **Debouncing**: Para actualizaciones frecuentes
5. **Web Workers**: Para procesamiento intensivo

## Próximos Pasos

1. Implementar más componentes de interacción
2. Agregar soporte para más idiomas indígenas
3. Mejorar algoritmos de IA para predicciones
4. Agregar más tipos de visualización
5. Implementar componentes de seguimiento ocular
6. Agregar soporte para comandos de voz avanzados

## Contribución

Para contribuir al desarrollo de estos componentes:

1. Seguir las convenciones de TypeScript
2. Incluir tests unitarios
3. Documentar props y funcionalidades
4. Mantener accesibilidad como prioridad
5. Optimizar para rendimiento móvil
