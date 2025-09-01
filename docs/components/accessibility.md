# Documentación de Componentes de Accesibilidad

## Descripción General

El sistema de accesibilidad de InclusiveAI Coach proporciona herramientas y componentes para hacer la aplicación completamente accesible para usuarios con diferentes capacidades. Incluye soporte para lectores de pantalla, control por voz, navegación por teclado, y adaptaciones visuales.

## Componentes Principales

### 1. AccessibilityPanel

**Archivo:** `components/accessibility/accessibility-panel.tsx`

**Descripción:** Panel principal de accesibilidad que centraliza todas las opciones de accesibilidad.

**Props:**
- `className?: string` - Clases CSS adicionales
- `defaultOpen?: boolean` - Estado inicial del panel
- `position?: 'top-right' | 'bottom-right' | 'bottom-left' | 'top-left'` - Posición del panel

**Características:**
- Configuración centralizada
- Interfaz intuitiva
- Navegación por teclado
- Persistencia de configuraciones
- Acceso rápido

**Ejemplo de uso:**
```tsx
import { AccessibilityPanel } from '@/components/accessibility/accessibility-panel';

<AccessibilityPanel 
  defaultOpen={false}
  position="bottom-right"
/>
```

### 2. ScreenReader

**Archivo:** `components/accessibility/screen-reader.tsx`

**Descripción:** Componente para integración con lectores de pantalla y navegación asistida.

**Props:**
- `enabled: boolean` - Habilitar funcionalidad
- `voice: string` - Voz seleccionada
- `speed: number` - Velocidad de lectura
- `volume: number` - Volumen de audio

**Características:**
- Soporte para lectores de pantalla
- Navegación por teclado
- Anuncios automáticos
- Control de velocidad
- Múltiples voces

### 3. VoiceControl

**Archivo:** `components/accessibility/voice-control.tsx`

**Descripción:** Sistema de control por voz para navegación y comandos.

**Props:**
- `enabled: boolean` - Habilitar control por voz
- `language: string` - Idioma de comandos
- `sensitivity: number` - Sensibilidad del micrófono
- `commands: VoiceCommand[]` - Comandos personalizados

**Características:**
- Reconocimiento de voz
- Comandos personalizables
- Navegación por voz
- Control de aplicaciones
- Feedback auditivo

### 4. HighContrast

**Archivo:** `components/accessibility/high-contrast.tsx`

**Descripción:** Componente para adaptaciones visuales y modo de alto contraste.

**Props:**
- `enabled: boolean` - Habilitar alto contraste
- `theme: 'light' | 'dark' | 'custom'` - Tema seleccionado
- `contrast: number` - Nivel de contraste
- `fontSize: number` - Tamaño de fuente

**Características:**
- Modo de alto contraste
- Temas personalizables
- Ajuste de tamaño de fuente
- Filtros de color
- Inversión de colores

### 5. BrailleDisplay

**Archivo:** `components/accessibility/BrailleDisplay.tsx`

**Descripción:** Soporte para pantallas braille y dispositivos táctiles.

**Props:**
- `enabled: boolean` - Habilitar soporte braille
- `device: string` - Dispositivo braille
- `refreshRate: number` - Tasa de actualización
- `cellCount: number` - Número de celdas

**Características:**
- Soporte para pantallas braille
- Traducción automática
- Configuración de dispositivos
- Feedback táctil
- Navegación táctil

## Interfaces de Datos

### AccessibilitySettings
```typescript
interface AccessibilitySettings {
  screenReader: {
    enabled: boolean;
    voice: string;
    speed: number; // 0.5 - 2.0
    volume: number; // 0 - 100
    announcements: boolean;
  };
  voiceControl: {
    enabled: boolean;
    language: string;
    sensitivity: number; // 0 - 100
    commands: VoiceCommand[];
    feedback: boolean;
  };
  visual: {
    highContrast: boolean;
    theme: 'light' | 'dark' | 'custom';
    contrast: number; // 1.0 - 4.5
    fontSize: number; // 12 - 24
    fontFamily: string;
    lineSpacing: number; // 1.0 - 2.0
    colorBlindness: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  };
  keyboard: {
    navigation: boolean;
    shortcuts: boolean;
    focusIndicator: boolean;
    tabOrder: 'logical' | 'visual';
  };
  audio: {
    captions: boolean;
    audioDescriptions: boolean;
    soundEffects: boolean;
    volume: number; // 0 - 100
  };
  cognitive: {
    simplifiedMode: boolean;
    readingLevel: 'basic' | 'intermediate' | 'advanced';
    distractions: boolean;
    stepByStep: boolean;
  };
}
```

### VoiceCommand
```typescript
interface VoiceCommand {
  id: string;
  phrase: string;
  action: string;
  description: string;
  category: 'navigation' | 'content' | 'system' | 'custom';
  enabled: boolean;
  shortcuts?: string[];
}
```

### AccessibilityEvent
```typescript
interface AccessibilityEvent {
  type: 'focus' | 'announcement' | 'navigation' | 'error' | 'success';
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  timestamp: string;
  context?: Record<string, any>;
}
```

### BrailleDevice
```typescript
interface BrailleDevice {
  id: string;
  name: string;
  type: 'display' | 'keyboard' | 'combined';
  cellCount: number;
  refreshRate: number;
  supportedLanguages: string[];
  connection: 'usb' | 'bluetooth' | 'wifi';
}
```

## Hooks Relacionados

### useAccessibility
**Archivo:** `lib/hooks/useAccessibility.ts`

**Funcionalidades:**
- Gestión de configuraciones
- Persistencia de preferencias
- Detección de capacidades
- Adaptación automática

### useScreenReader
**Archivo:** `lib/hooks/useScreenReader.ts`

**Funcionalidades:**
- Control de lectores de pantalla
- Anuncios automáticos
- Navegación asistida
- Feedback auditivo

### useVoiceControl
**Archivo:** `lib/hooks/useVoiceControl.ts`

**Funcionalidades:**
- Reconocimiento de voz
- Gestión de comandos
- Control de aplicaciones
- Feedback de comandos

### useHighContrast
**Archivo:** `lib/hooks/useHighContrast.ts`

**Funcionalidades:**
- Gestión de temas
- Ajuste de contraste
- Adaptaciones visuales
- Persistencia de configuraciones

## APIs Relacionadas

### /api/accessibility/settings
- **GET:** Obtener configuración de accesibilidad
- **PUT:** Actualizar configuración de accesibilidad

### /api/accessibility/announce
- **POST:** Enviar anuncio al lector de pantalla

### /api/accessibility/voice-commands
- **GET:** Obtener comandos de voz disponibles
- **POST:** Crear comando personalizado
- **PUT:** Actualizar comando existente

### /api/accessibility/braille
- **GET:** Obtener dispositivos braille conectados
- **POST:** Enviar texto a dispositivo braille

### /api/accessibility/capabilities
- **GET:** Detectar capacidades del dispositivo
- **POST:** Reportar capacidades del usuario

### /api/accessibility/feedback
- **POST:** Enviar feedback de accesibilidad
- **GET:** Obtener reportes de accesibilidad

## Configuración

### Variables de Entorno
```env
# Configuración de accesibilidad
ACCESSIBILITY_ENABLED=true
ACCESSIBILITY_DEFAULT_THEME=light
ACCESSIBILITY_DEFAULT_FONT_SIZE=16

# Configuración de lectores de pantalla
SCREEN_READER_ENABLED=true
SCREEN_READER_DEFAULT_VOICE=en-US
SCREEN_READER_DEFAULT_SPEED=1.0

# Configuración de control por voz
VOICE_CONTROL_ENABLED=true
VOICE_CONTROL_LANGUAGE=es-MX
VOICE_CONTROL_SENSITIVITY=70

# Configuración de alto contraste
HIGH_CONTRAST_ENABLED=true
HIGH_CONTRAST_MIN_RATIO=4.5
HIGH_CONTRAST_DEFAULT_THEME=dark

# Configuración de braille
BRAILLE_DISPLAY_ENABLED=true
BRAILLE_DEFAULT_CELL_COUNT=40
BRAILLE_REFRESH_RATE=60

# Configuración de navegación por teclado
KEYBOARD_NAVIGATION_ENABLED=true
KEYBOARD_FOCUS_INDICATOR=true
KEYBOARD_SHORTCUTS_ENABLED=true
```

### Configuración en Base de Datos
```sql
-- Tabla de configuraciones de accesibilidad
CREATE TABLE accessibility_settings (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(100) UNIQUE NOT NULL,
  screen_reader JSONB,
  voice_control JSONB,
  visual_settings JSONB,
  keyboard_settings JSONB,
  audio_settings JSONB,
  cognitive_settings JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de comandos de voz
CREATE TABLE accessibility_voice_commands (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(100) NOT NULL,
  phrase VARCHAR(255) NOT NULL,
  action VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50) DEFAULT 'custom',
  enabled BOOLEAN DEFAULT true,
  shortcuts JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de dispositivos braille
CREATE TABLE accessibility_braille_devices (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(100) NOT NULL,
  device_id VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  cell_count INTEGER,
  refresh_rate INTEGER,
  supported_languages JSONB,
  connection_type VARCHAR(20),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de eventos de accesibilidad
CREATE TABLE accessibility_events (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(100),
  event_type VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  priority VARCHAR(20) DEFAULT 'medium',
  context JSONB,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Mejores Prácticas

### 1. Navegación por Teclado
- Asegurar navegación completa por teclado
- Implementar indicadores de foco visibles
- Mantener orden lógico de tabulación
- Proporcionar atajos de teclado

### 2. Lectores de Pantalla
- Usar ARIA labels apropiados
- Proporcionar textos alternativos
- Implementar anuncios automáticos
- Asegurar estructura semántica

### 3. Control por Voz
- Comandos claros y consistentes
- Feedback auditivo inmediato
- Configuración de sensibilidad
- Comandos personalizables

### 4. Adaptaciones Visuales
- Alto contraste configurable
- Tamaños de fuente ajustables
- Temas personalizables
- Filtros para daltonismo

### 5. Cognitivo
- Modo simplificado disponible
- Instrucciones paso a paso
- Reducción de distracciones
- Niveles de complejidad

### 6. Audio
- Subtítulos disponibles
- Descripciones de audio
- Efectos de sonido opcionales
- Control de volumen

## Testing

### Tests de Accesibilidad
```typescript
// Ejemplo de test para AccessibilityPanel
describe('AccessibilityPanel', () => {
  it('es navegable por teclado', async () => {
    // Test implementation
  });

  it('anuncia cambios correctamente', async () => {
    // Test implementation
  });

  it('mantiene configuración', async () => {
    // Test implementation
  });
});
```

### Tests de Integración
```typescript
// Ejemplo de test de integración
describe('Accessibility Integration', () => {
  it('integra con lectores de pantalla', async () => {
    // Test implementation
  });

  it('responde a comandos de voz', async () => {
    // Test implementation
  });
});
```

### Tests de Conformidad
```typescript
// Ejemplo de test de conformidad WCAG
describe('WCAG Compliance', () => {
  it('cumple con WCAG 2.1 AA', async () => {
    // Test implementation
  });

  it('tiene contraste adecuado', async () => {
    // Test implementation
  });
});
```

## Troubleshooting

### Problemas Comunes

1. **Lector de pantalla no anuncia cambios**
   - Verificar ARIA labels
   - Comprobar anuncios automáticos
   - Revisar estructura semántica
   - Verificar configuración de voz

2. **Control por voz no responde**
   - Verificar permisos de micrófono
   - Comprobar configuración de sensibilidad
   - Revisar comandos disponibles
   - Verificar idioma configurado

3. **Alto contraste no se aplica**
   - Verificar configuración de tema
   - Comprobar CSS de alto contraste
   - Revisar persistencia de configuraciones
   - Verificar compatibilidad del navegador

### Logs de Debug
```typescript
// Habilitar logs de debug
const DEBUG_ACCESSIBILITY = process.env.NODE_ENV === 'development';

if (DEBUG_ACCESSIBILITY) {
  console.log('Accessibility settings:', accessibilitySettings);
  console.log('Screen reader status:', screenReaderStatus);
  console.log('Voice control commands:', voiceCommands);
}
```

## Recursos Adicionales

- [Guía de Accesibilidad WCAG 2.1](https://www.w3.org/WAI/WCAG21/quickref/)
- [Documentación de ARIA](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA)
- [Mejores Prácticas de Accesibilidad](../PERFORMANCE.md#accessibility)
- [Configuración de Accesibilidad](../guides/accessibility-setup.md)
- [Testing de Accesibilidad](../TESTING.md#accessibility)
