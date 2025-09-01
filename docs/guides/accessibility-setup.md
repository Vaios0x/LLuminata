# Guía de Configuración de Accesibilidad

## Descripción General

Esta guía proporciona instrucciones paso a paso para configurar el sistema de accesibilidad de InclusiveAI Coach, incluyendo soporte para lectores de pantalla, control por voz, modo de alto contraste, soporte para pantallas Braille, navegación por teclado y adaptaciones cognitivas.

## Requisitos Previos

- Node.js 18+ instalado
- Base de datos PostgreSQL configurada
- Navegador con soporte para Web Speech API
- Permisos de micrófono para control por voz
- Permisos de administrador

## Instalación

### 1. Instalar Dependencias

```bash
# Navegar al directorio del proyecto
cd inclusive-ai-coach

# Instalar dependencias
npm install

# Instalar dependencias específicas de accesibilidad
npm install @types/web-speech-api
npm install focus-trap-react
npm install react-aria
npm install @react-aria/focus
npm install @react-aria/interactions
```

### 2. Configurar Variables de Entorno

Crear o actualizar el archivo `.env`:

```env
# Configuración de accesibilidad
ACCESSIBILITY_ENABLED=true
ACCESSIBILITY_SCREEN_READER=true
ACCESSIBILITY_VOICE_CONTROL=true
ACCESSIBILITY_HIGH_CONTRAST=true
ACCESSIBILITY_BRAILLE_SUPPORT=true
ACCESSIBILITY_KEYBOARD_NAVIGATION=true

# Configuración de síntesis de voz
SPEECH_SYNTHESIS_ENABLED=true
SPEECH_SYNTHESIS_RATE=1.0
SPEECH_SYNTHESIS_PITCH=1.0
SPEECH_SYNTHESIS_VOLUME=1.0

# Configuración de reconocimiento de voz
SPEECH_RECOGNITION_ENABLED=true
SPEECH_RECOGNITION_LANGUAGE=es-ES
SPEECH_RECOGNITION_CONTINUOUS=true

# Configuración de alto contraste
HIGH_CONTRAST_THEME=dark
HIGH_CONTRAST_COLORS=true
HIGH_CONTRAST_FONTS=true

# Configuración de navegación por teclado
KEYBOARD_NAVIGATION_ENABLED=true
KEYBOARD_SHORTCUTS_ENABLED=true
KEYBOARD_FOCUS_INDICATORS=true
```

### 3. Configurar Base de Datos

Ejecutar las migraciones de Prisma:

```bash
# Generar cliente de Prisma
npx prisma generate

# Ejecutar migraciones
npx prisma migrate dev --name init-accessibility

# Sembrar datos iniciales
npx prisma db seed
```

## Configuración de Componentes

### 1. Configurar AccessibilityPanel

```typescript
// app/providers.tsx
import { AccessibilityProvider } from '@/components/accessibility/AccessibilityProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AccessibilityProvider 
      config={{
        screenReader: true,
        voiceControl: true,
        highContrast: true,
        brailleSupport: true,
        keyboardNavigation: true,
        speechSynthesis: {
          enabled: true,
          rate: 1.0,
          pitch: 1.0,
          volume: 1.0
        },
        speechRecognition: {
          enabled: true,
          language: 'es-ES',
          continuous: true
        }
      }}
    >
      {children}
    </AccessibilityProvider>
  );
}
```

### 2. Configurar ScreenReader

```typescript
// components/accessibility/ScreenReader.tsx
import { ScreenReader } from '@/components/accessibility/ScreenReader';

export function ScreenReaderSection() {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-semibold mb-4">Lector de Pantalla</h2>
      <ScreenReader 
        enabled={true}
        onAnnouncement={(text) => {
          console.log('Screen reader announcement:', text);
        }}
        onFocusChange={(element) => {
          console.log('Focus changed to:', element);
        }}
      />
    </div>
  );
}
```

### 3. Configurar VoiceControl

```typescript
// components/accessibility/VoiceControl.tsx
import { VoiceControl } from '@/components/accessibility/VoiceControl';

export function VoiceControlSection() {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-semibold mb-4">Control por Voz</h2>
      <VoiceControl 
        enabled={true}
        language="es-ES"
        commands={[
          { phrase: "navegar a", action: "navigate" },
          { phrase: "abrir", action: "open" },
          { phrase: "cerrar", action: "close" },
          { phrase: "ayuda", action: "help" }
        ]}
        onCommand={(command) => {
          console.log('Voice command:', command);
        }}
      />
    </div>
  );
}
```

## Configuración de APIs

### 1. Configurar Rutas de API de Accesibilidad

```typescript
// app/api/accessibility/settings/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      );
    }

    const settings = await prisma.accessibilitySettings.findUnique({
      where: { userId }
    });

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Get accessibility settings error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, settings } = body;

    if (!userId || !settings) {
      return NextResponse.json(
        { error: 'User ID and settings required' },
        { status: 400 }
      );
    }

    const updatedSettings = await prisma.accessibilitySettings.upsert({
      where: { userId },
      update: settings,
      create: {
        userId,
        ...settings
      }
    });

    return NextResponse.json({ settings: updatedSettings });
  } catch (error) {
    console.error('Update accessibility settings error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### 2. Configurar API de Síntesis de Voz

```typescript
// app/api/accessibility/speech/synthesize/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, options = {} } = body;

    if (!text) {
      return NextResponse.json(
        { error: 'Text required' },
        { status: 400 }
      );
    }

    // Configuración por defecto
    const defaultOptions = {
      rate: 1.0,
      pitch: 1.0,
      volume: 1.0,
      voice: 'es-ES'
    };

    const speechOptions = { ...defaultOptions, ...options };

    // En un entorno real, aquí se integraría con un servicio de TTS
    // Por ahora, retornamos la configuración para el cliente
    return NextResponse.json({
      success: true,
      text,
      options: speechOptions,
      audioUrl: `/api/accessibility/speech/audio?text=${encodeURIComponent(text)}`
    });
  } catch (error) {
    console.error('Speech synthesis error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

## Configuración de Base de Datos

### 1. Esquema de Base de Datos

```prisma
// prisma/schema.prisma

// Modelo de Configuración de Accesibilidad
model AccessibilitySettings {
  id                    String   @id @default(cuid())
  userId                String   @unique
  screenReaderEnabled   Boolean  @default(true)
  voiceControlEnabled   Boolean  @default(true)
  highContrastEnabled   Boolean  @default(false)
  brailleSupportEnabled Boolean  @default(false)
  keyboardNavigationEnabled Boolean @default(true)
  
  // Configuración de síntesis de voz
  speechSynthesisRate   Float    @default(1.0)
  speechSynthesisPitch  Float    @default(1.0)
  speechSynthesisVolume Float    @default(1.0)
  speechSynthesisVoice  String   @default("es-ES")
  
  // Configuración de reconocimiento de voz
  speechRecognitionLanguage String @default("es-ES")
  speechRecognitionContinuous Boolean @default(true)
  
  // Configuración de alto contraste
  highContrastTheme     String   @default("dark")
  highContrastColors    Boolean  @default(true)
  highContrastFonts     Boolean  @default(true)
  
  // Configuración de navegación por teclado
  keyboardShortcutsEnabled Boolean @default(true)
  keyboardFocusIndicators Boolean @default(true)
  
  // Configuración de comandos personalizados
  customCommands        Json?
  
  updatedAt             DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

// Modelo de Comandos de Voz
model AccessibilityVoiceCommand {
  id        String   @id @default(cuid())
  userId    String?
  phrase    String   NOT NULL
  action    String   NOT NULL
  category  String   @default("general")
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())

  user User? @relation(fields: [userId], references: [id], onDelete: SetNull)
}

// Modelo de Atajos de Teclado
model AccessibilityKeyboardShortcut {
  id        String   @id @default(cuid())
  userId    String?
  key       String   NOT NULL
  ctrlKey   Boolean  @default(false)
  altKey    Boolean  @default(false)
  shiftKey  Boolean  @default(false)
  action    String   NOT NULL
  description String?
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())

  user User? @relation(fields: [userId], references: [id], onDelete: SetNull)
}

// Modelo de Preferencias de Accesibilidad
model AccessibilityPreference {
  id        String   @id @default(cuid())
  userId    String   @unique
  fontSize  String   @default("medium")
  fontFamily String  @default("system")
  lineSpacing Float  @default(1.5)
  colorScheme String @default("auto")
  motionReduced Boolean @default(false)
  focusVisible Boolean @default(true)
  skipLinks  Boolean  @default(true)
  updatedAt  DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

// Extender modelo User existente
model User {
  // ... campos existentes ...

  // Relaciones de accesibilidad
  accessibilitySettings    AccessibilitySettings?
  voiceCommands           AccessibilityVoiceCommand[]
  keyboardShortcuts       AccessibilityKeyboardShortcut[]
  accessibilityPreferences AccessibilityPreference?
}
```

### 2. Datos Iniciales

```typescript
// prisma/seed-accessibility.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Crear configuración de accesibilidad por defecto
  const defaultSettings = await prisma.accessibilitySettings.upsert({
    where: { userId: 'default-user' },
    update: {},
    create: {
      userId: 'default-user',
      screenReaderEnabled: true,
      voiceControlEnabled: true,
      highContrastEnabled: false,
      brailleSupportEnabled: false,
      keyboardNavigationEnabled: true,
      speechSynthesisRate: 1.0,
      speechSynthesisPitch: 1.0,
      speechSynthesisVolume: 1.0,
      speechSynthesisVoice: 'es-ES',
      speechRecognitionLanguage: 'es-ES',
      speechRecognitionContinuous: true,
      highContrastTheme: 'dark',
      highContrastColors: true,
      highContrastFonts: true,
      keyboardShortcutsEnabled: true,
      keyboardFocusIndicators: true,
      customCommands: {
        navigation: [
          { phrase: 'ir a inicio', action: 'navigate_home' },
          { phrase: 'ir a lecciones', action: 'navigate_lessons' },
          { phrase: 'ir a perfil', action: 'navigate_profile' }
        ],
        interaction: [
          { phrase: 'abrir menú', action: 'open_menu' },
          { phrase: 'cerrar menú', action: 'close_menu' },
          { phrase: 'ayuda', action: 'show_help' }
        ]
      }
    }
  });

  // Crear comandos de voz por defecto
  const defaultCommands = [
    { phrase: 'navegar a inicio', action: 'navigate_home', category: 'navigation' },
    { phrase: 'navegar a lecciones', action: 'navigate_lessons', category: 'navigation' },
    { phrase: 'abrir menú', action: 'open_menu', category: 'interaction' },
    { phrase: 'cerrar menú', action: 'close_menu', category: 'interaction' },
    { phrase: 'ayuda', action: 'show_help', category: 'help' },
    { phrase: 'repetir', action: 'repeat', category: 'general' },
    { phrase: 'más lento', action: 'slow_down', category: 'speech' },
    { phrase: 'más rápido', action: 'speed_up', category: 'speech' }
  ];

  for (const command of defaultCommands) {
    await prisma.accessibilityVoiceCommand.upsert({
      where: { 
        userId_phrase: { 
          userId: 'default-user', 
          phrase: command.phrase 
        } 
      },
      update: command,
      create: {
        userId: 'default-user',
        ...command
      }
    });
  }

  // Crear atajos de teclado por defecto
  const defaultShortcuts = [
    { key: 'h', ctrlKey: true, action: 'navigate_home', description: 'Ir a inicio' },
    { key: 'l', ctrlKey: true, action: 'navigate_lessons', description: 'Ir a lecciones' },
    { key: 'p', ctrlKey: true, action: 'navigate_profile', description: 'Ir a perfil' },
    { key: 'm', ctrlKey: true, action: 'toggle_menu', description: 'Alternar menú' },
    { key: 'F1', action: 'show_help', description: 'Mostrar ayuda' },
    { key: 'Tab', action: 'next_focus', description: 'Siguiente elemento' },
    { key: 'Tab', shiftKey: true, action: 'previous_focus', description: 'Elemento anterior' }
  ];

  for (const shortcut of defaultShortcuts) {
    await prisma.accessibilityKeyboardShortcut.upsert({
      where: { 
        userId_key_combination: { 
          userId: 'default-user', 
          key: shortcut.key,
          ctrlKey: shortcut.ctrlKey || false,
          altKey: shortcut.altKey || false,
          shiftKey: shortcut.shiftKey || false
        } 
      },
      update: shortcut,
      create: {
        userId: 'default-user',
        ...shortcut
      }
    });
  }

  // Crear preferencias de accesibilidad por defecto
  await prisma.accessibilityPreference.upsert({
    where: { userId: 'default-user' },
    update: {},
    create: {
      userId: 'default-user',
      fontSize: 'medium',
      fontFamily: 'system',
      lineSpacing: 1.5,
      colorScheme: 'auto',
      motionReduced: false,
      focusVisible: true,
      skipLinks: true
    }
  });

  console.log('Datos iniciales de accesibilidad creados');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

## Configuración de Hooks

### 1. Configurar useAccessibility

```typescript
// lib/hooks/useAccessibility.ts
import { useState, useEffect, useCallback } from 'react';

interface AccessibilityState {
  screenReader: boolean;
  voiceControl: boolean;
  highContrast: boolean;
  brailleSupport: boolean;
  keyboardNavigation: boolean;
  speechSynthesis: {
    rate: number;
    pitch: number;
    volume: number;
    voice: string;
  };
  speechRecognition: {
    language: string;
    continuous: boolean;
  };
}

export function useAccessibility(userId: string) {
  const [state, setState] = useState<AccessibilityState>({
    screenReader: true,
    voiceControl: true,
    highContrast: false,
    brailleSupport: false,
    keyboardNavigation: true,
    speechSynthesis: {
      rate: 1.0,
      pitch: 1.0,
      volume: 1.0,
      voice: 'es-ES'
    },
    speechRecognition: {
      language: 'es-ES',
      continuous: true
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/accessibility/settings?userId=${userId}`);
      
      if (!response.ok) {
        throw new Error('Failed to load accessibility settings');
      }

      const data = await response.json();
      setState(data.settings);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const updateSettings = useCallback(async (newSettings: Partial<AccessibilityState>) => {
    try {
      const response = await fetch('/api/accessibility/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          settings: newSettings
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update accessibility settings');
      }

      // Recargar configuración
      await loadSettings();
      return { success: true };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
      return { success: false, error: err instanceof Error ? err.message : 'Update failed' };
    }
  }, [userId, loadSettings]);

  const speak = useCallback(async (text: string, options?: any) => {
    try {
      const response = await fetch('/api/accessibility/speech/synthesize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text,
          options: { ...state.speechSynthesis, ...options }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to synthesize speech');
      }

      const data = await response.json();
      
      // Reproducir audio en el navegador
      if (data.audioUrl) {
        const audio = new Audio(data.audioUrl);
        await audio.play();
      }

      return { success: true };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Speech synthesis failed');
      return { success: false, error: err instanceof Error ? err.message : 'Speech synthesis failed' };
    }
  }, [state.speechSynthesis]);

  useEffect(() => {
    if (userId) {
      loadSettings();
    }
  }, [userId, loadSettings]);

  return {
    ...state,
    loading,
    error,
    updateSettings,
    speak,
    refresh: loadSettings
  };
}
```

### 2. Configurar useVoiceControl

```typescript
// lib/hooks/useVoiceControl.ts
import { useState, useEffect, useCallback, useRef } from 'react';

interface VoiceCommand {
  phrase: string;
  action: string;
  category: string;
}

export function useVoiceControl(enabled: boolean = true) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [commands, setCommands] = useState<VoiceCommand[]>([]);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  const loadCommands = useCallback(async () => {
    try {
      const response = await fetch('/api/accessibility/voice-commands');
      if (response.ok) {
        const data = await response.json();
        setCommands(data.commands);
      }
    } catch (err) {
      console.error('Failed to load voice commands:', err);
    }
  }, []);

  const startListening = useCallback(() => {
    if (!enabled || !('webkitSpeechRecognition' in window)) {
      setError('Speech recognition not supported');
      return;
    }

    try {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'es-ES';

      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
      };

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }

        if (finalTranscript) {
          setTranscript(finalTranscript);
          
          // Buscar comando coincidente
          const matchedCommand = commands.find(command =>
            finalTranscript.toLowerCase().includes(command.phrase.toLowerCase())
          );

          if (matchedCommand) {
            // Ejecutar comando
            console.log('Executing command:', matchedCommand);
            // Aquí se ejecutaría la acción correspondiente
          }
        }
      };

      recognition.onerror = (event: any) => {
        setError(`Speech recognition error: ${event.error}`);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      setError('Failed to start speech recognition');
    }
  }, [enabled, commands]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, []);

  const addCommand = useCallback(async (command: VoiceCommand) => {
    try {
      const response = await fetch('/api/accessibility/voice-commands', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(command)
      });

      if (response.ok) {
        await loadCommands();
        return { success: true };
      } else {
        throw new Error('Failed to add command');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Add command failed');
      return { success: false, error: err instanceof Error ? err.message : 'Add command failed' };
    }
  }, [loadCommands]);

  useEffect(() => {
    loadCommands();
  }, [loadCommands]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  return {
    isListening,
    transcript,
    commands,
    error,
    startListening,
    stopListening,
    addCommand
  };
}
```

## Configuración de Servicios de Accesibilidad

### 1. Configurar Speech Synthesis Service

```typescript
// lib/accessibility/speech-synthesis.ts
class SpeechSynthesisService {
  private synth: SpeechSynthesis;
  private voices: SpeechSynthesisVoice[] = [];
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  constructor() {
    this.synth = window.speechSynthesis;
    this.loadVoices();
  }

  private loadVoices() {
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = () => {
        this.voices = this.synth.getVoices();
      };
    }
  }

  speak(text: string, options: {
    rate?: number;
    pitch?: number;
    volume?: number;
    voice?: string;
  } = {}) {
    // Cancelar utterance anterior si existe
    if (this.currentUtterance) {
      this.synth.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Configurar opciones
    utterance.rate = options.rate || 1.0;
    utterance.pitch = options.pitch || 1.0;
    utterance.volume = options.volume || 1.0;
    
    // Configurar voz
    if (options.voice) {
      const voice = this.voices.find(v => v.lang.includes(options.voice!));
      if (voice) {
        utterance.voice = voice;
      }
    }

    // Eventos
    utterance.onstart = () => {
      console.log('Speech synthesis started');
    };

    utterance.onend = () => {
      console.log('Speech synthesis ended');
      this.currentUtterance = null;
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      this.currentUtterance = null;
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  stop() {
    if (this.currentUtterance) {
      this.synth.cancel();
      this.currentUtterance = null;
    }
  }

  pause() {
    this.synth.pause();
  }

  resume() {
    this.synth.resume();
  }

  getVoices(): SpeechSynthesisVoice[] {
    return this.voices;
  }

  isSupported(): boolean {
    return 'speechSynthesis' in window;
  }
}

export const speechSynthesisService = new SpeechSynthesisService();
```

### 2. Configurar Keyboard Navigation Service

```typescript
// lib/accessibility/keyboard-navigation.ts
interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  action: string;
  description: string;
}

class KeyboardNavigationService {
  private shortcuts: KeyboardShortcut[] = [];
  private listeners: Map<string, () => void> = new Map();

  constructor() {
    this.setupDefaultShortcuts();
    this.bindEvents();
  }

  private setupDefaultShortcuts() {
    this.shortcuts = [
      { key: 'h', ctrlKey: true, action: 'navigate_home', description: 'Ir a inicio' },
      { key: 'l', ctrlKey: true, action: 'navigate_lessons', description: 'Ir a lecciones' },
      { key: 'p', ctrlKey: true, action: 'navigate_profile', description: 'Ir a perfil' },
      { key: 'm', ctrlKey: true, action: 'toggle_menu', description: 'Alternar menú' },
      { key: 'F1', action: 'show_help', description: 'Mostrar ayuda' },
      { key: 'Tab', action: 'next_focus', description: 'Siguiente elemento' },
      { key: 'Tab', shiftKey: true, action: 'previous_focus', description: 'Elemento anterior' },
      { key: 'Escape', action: 'close_modal', description: 'Cerrar modal' }
    ];
  }

  private bindEvents() {
    document.addEventListener('keydown', (event) => {
      this.handleKeyDown(event);
    });
  }

  private handleKeyDown(event: KeyboardEvent) {
    const shortcut = this.findShortcut(event);
    
    if (shortcut) {
      event.preventDefault();
      this.executeAction(shortcut.action);
    }
  }

  private findShortcut(event: KeyboardEvent): KeyboardShortcut | undefined {
    return this.shortcuts.find(shortcut => 
      shortcut.key === event.key &&
      !!shortcut.ctrlKey === event.ctrlKey &&
      !!shortcut.altKey === event.altKey &&
      !!shortcut.shiftKey === event.shiftKey
    );
  }

  private executeAction(action: string) {
    const listener = this.listeners.get(action);
    if (listener) {
      listener();
    } else {
      console.log(`Action not implemented: ${action}`);
    }
  }

  addShortcut(shortcut: KeyboardShortcut) {
    this.shortcuts.push(shortcut);
  }

  removeShortcut(key: string, modifiers: { ctrlKey?: boolean; altKey?: boolean; shiftKey?: boolean } = {}) {
    this.shortcuts = this.shortcuts.filter(shortcut => 
      !(shortcut.key === key &&
        !!shortcut.ctrlKey === !!modifiers.ctrlKey &&
        !!shortcut.altKey === !!modifiers.altKey &&
        !!shortcut.shiftKey === !!modifiers.shiftKey)
    );
  }

  onAction(action: string, callback: () => void) {
    this.listeners.set(action, callback);
  }

  offAction(action: string) {
    this.listeners.delete(action);
  }

  getShortcuts(): KeyboardShortcut[] {
    return [...this.shortcuts];
  }

  focusNextElement() {
    const focusableElements = document.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const currentIndex = Array.from(focusableElements).findIndex(el => 
      el === document.activeElement
    );
    
    const nextIndex = (currentIndex + 1) % focusableElements.length;
    (focusableElements[nextIndex] as HTMLElement)?.focus();
  }

  focusPreviousElement() {
    const focusableElements = document.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const currentIndex = Array.from(focusableElements).findIndex(el => 
      el === document.activeElement
    );
    
    const previousIndex = currentIndex <= 0 
      ? focusableElements.length - 1 
      : currentIndex - 1;
    
    (focusableElements[previousIndex] as HTMLElement)?.focus();
  }
}

export const keyboardNavigationService = new KeyboardNavigationService();
```

## Testing

### 1. Tests de Configuración

```typescript
// tests/accessibility-setup.test.ts
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Accessibility Setup', () => {
  beforeAll(async () => {
    // Configurar base de datos de prueba
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should create accessibility tables', async () => {
    const settings = await prisma.accessibilitySettings.findMany();
    expect(settings).toBeDefined();
  });

  it('should support speech synthesis', () => {
    const isSupported = 'speechSynthesis' in window;
    expect(isSupported).toBe(true);
  });

  it('should support speech recognition', () => {
    const isSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
    expect(isSupported).toBe(true);
  });
});
```

## Troubleshooting

### Problemas Comunes

1. **Síntesis de voz no funciona**
   - Verificar permisos del navegador
   - Comprobar configuración de audio
   - Revisar soporte del navegador

2. **Reconocimiento de voz no responde**
   - Verificar permisos de micrófono
   - Comprobar configuración de idioma
   - Revisar conexión a internet

3. **Navegación por teclado no funciona**
   - Verificar configuración de focus
   - Comprobar tabIndex de elementos
   - Revisar event listeners

### Logs de Debug

```typescript
// Habilitar logs de debug
const DEBUG_ACCESSIBILITY = process.env.NODE_ENV === 'development';

if (DEBUG_ACCESSIBILITY) {
  console.log('Accessibility setup completed');
  console.log('Screen reader enabled:', process.env.ACCESSIBILITY_SCREEN_READER);
  console.log('Voice control enabled:', process.env.ACCESSIBILITY_VOICE_CONTROL);
}
```

## Recursos Adicionales

- [Documentación de Componentes de Accesibilidad](../components/accessibility.md)
- [API de Accesibilidad](../AI-APIS.md#accessibility)
- [Base de Datos](../DATABASE.md)
- [Testing](../TESTING.md)
