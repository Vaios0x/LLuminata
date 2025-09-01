import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { AccessibilityPanel } from '@/components/accessibility/accessibility-panel';
import '@testing-library/jest-dom';

// Mock de los componentes UI
jest.mock('@/components/ui/card', () => ({
  Card: ({ children, ...props }: any) => <div data-testid="card" {...props}>{children}</div>,
  CardContent: ({ children, ...props }: any) => <div data-testid="card-content" {...props}>{children}</div>,
  CardHeader: ({ children, ...props }: any) => <div data-testid="card-header" {...props}>{children}</div>,
  CardTitle: ({ children, ...props }: any) => <h3 data-testid="card-title" {...props}>{children}</h3>,
}));

jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children, ...props }: any) => <span data-testid="badge" {...props}>{children}</span>,
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button data-testid="button" onClick={onClick} {...props}>{children}</button>
  ),
}));

jest.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children, defaultValue, ...props }: any) => (
    <div data-testid="tabs" data-default-value={defaultValue} {...props}>{children}</div>
  ),
  TabsContent: ({ children, value, ...props }: any) => (
    <div data-testid="tabs-content" data-value={value} {...props}>{children}</div>
  ),
  TabsList: ({ children, ...props }: any) => (
    <div data-testid="tabs-list" {...props}>{children}</div>
  ),
  TabsTrigger: ({ children, value, ...props }: any) => (
    <button data-testid="tabs-trigger" data-value={value} {...props}>{children}</button>
  ),
}));

// Mock de fetch
global.fetch = jest.fn();

const mockAccessibilitySettings = {
  visual: {
    highContrast: false,
    fontSize: 'medium',
    fontFamily: 'default',
    colorBlindness: 'none',
    reduceMotion: false,
    cursorSize: 'normal',
    focusIndicator: 'default'
  },
  auditory: {
    screenReader: false,
    audioDescriptions: false,
    volume: 50,
    speechRate: 1.0,
    voiceType: 'default',
    soundNotifications: true
  },
  motor: {
    keyboardNavigation: true,
    mouseAssistance: false,
    clickAssistance: false,
    gestureControl: false,
    voiceControl: false,
    switchControl: false
  },
  cognitive: {
    simplifiedInterface: false,
    readingAssistance: false,
    distractionFree: false,
    stepByStep: false,
    visualAids: false,
    timeReminders: false
  }
};

const mockAccessibilityFeatures = [
  {
    id: '1',
    name: 'Alto Contraste',
    description: 'Mejora la visibilidad del texto y elementos',
    category: 'visual',
    enabled: false,
    shortcut: 'Ctrl+Shift+C'
  },
  {
    id: '2',
    name: 'Lector de Pantalla',
    description: 'Lee el contenido en voz alta',
    category: 'auditory',
    enabled: false,
    shortcut: 'Ctrl+Shift+S'
  },
  {
    id: '3',
    name: 'Navegación por Teclado',
    description: 'Permite navegar usando solo el teclado',
    category: 'motor',
    enabled: true,
    shortcut: 'Tab'
  }
];

const mockAccessibilityStats = {
  totalFeatures: 15,
  enabledFeatures: 8,
  usageCount: 1250,
  lastUsed: '2024-01-25T10:00:00Z',
  popularFeatures: [
    { name: 'Navegación por Teclado', usage: 450 },
    { name: 'Alto Contraste', usage: 320 },
    { name: 'Lector de Pantalla', usage: 280 }
  ]
};

describe('AccessibilityPanel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockClear();
  });

  it('renderiza correctamente con configuraciones de accesibilidad', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockAccessibilitySettings
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockAccessibilityFeatures
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockAccessibilityStats
      });

    render(<AccessibilityPanel userId="user123" />);

    // Verificar que se muestra el estado de carga inicialmente
    expect(screen.getByText('Cargando configuraciones de accesibilidad...')).toBeInTheDocument();

    // Esperar a que se carguen los datos
    await waitFor(() => {
      expect(screen.getByText('Panel de Accesibilidad')).toBeInTheDocument();
    });

    // Verificar que se muestran las secciones principales
    expect(screen.getByText('Visual')).toBeInTheDocument();
    expect(screen.getByText('Auditiva')).toBeInTheDocument();
    expect(screen.getByText('Motora')).toBeInTheDocument();
    expect(screen.getByText('Cognitiva')).toBeInTheDocument();
  });

  it('maneja errores de carga correctamente', async () => {
    (fetch as jest.Mock).mockRejectedValue(new Error('Error de red'));

    render(<AccessibilityPanel userId="user123" />);

    await waitFor(() => {
      expect(screen.getByText('Error al cargar configuraciones de accesibilidad')).toBeInTheDocument();
    });
  });

  it('muestra configuraciones visuales correctamente', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockAccessibilitySettings
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockAccessibilityFeatures
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockAccessibilityStats
      });

    render(<AccessibilityPanel userId="user123" />);

    await waitFor(() => {
      expect(screen.getByText('Alto Contraste')).toBeInTheDocument();
      expect(screen.getByText('Tamaño de Fuente')).toBeInTheDocument();
      expect(screen.getByText('Tipo de Fuente')).toBeInTheDocument();
      expect(screen.getByText('Daltonismo')).toBeInTheDocument();
    });
  });

  it('maneja cambios en configuraciones de accesibilidad', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockAccessibilitySettings
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockAccessibilityFeatures
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockAccessibilityStats
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      });

    render(<AccessibilityPanel userId="user123" />);

    await waitFor(() => {
      expect(screen.getByText('Panel de Accesibilidad')).toBeInTheDocument();
    });

    // Buscar y hacer clic en toggles
    const toggles = screen.getAllByTestId('toggle');
    if (toggles.length > 0) {
      fireEvent.click(toggles[0]);
    }
  });

  it('muestra configuraciones auditivas correctamente', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockAccessibilitySettings
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockAccessibilityFeatures
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockAccessibilityStats
      });

    render(<AccessibilityPanel userId="user123" />);

    await waitFor(() => {
      expect(screen.getByText('Lector de Pantalla')).toBeInTheDocument();
      expect(screen.getByText('Descripciones de Audio')).toBeInTheDocument();
      expect(screen.getByText('Volumen')).toBeInTheDocument();
      expect(screen.getByText('Velocidad de Habla')).toBeInTheDocument();
    });
  });

  it('maneja configuraciones motoras correctamente', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockAccessibilitySettings
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockAccessibilityFeatures
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockAccessibilityStats
      });

    render(<AccessibilityPanel userId="user123" />);

    await waitFor(() => {
      expect(screen.getByText('Navegación por Teclado')).toBeInTheDocument();
      expect(screen.getByText('Asistencia de Ratón')).toBeInTheDocument();
      expect(screen.getByText('Asistencia de Clic')).toBeInTheDocument();
      expect(screen.getByText('Control por Voz')).toBeInTheDocument();
    });
  });

  it('muestra configuraciones cognitivas correctamente', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockAccessibilitySettings
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockAccessibilityFeatures
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockAccessibilityStats
      });

    render(<AccessibilityPanel userId="user123" />);

    await waitFor(() => {
      expect(screen.getByText('Interfaz Simplificada')).toBeInTheDocument();
      expect(screen.getByText('Asistencia de Lectura')).toBeInTheDocument();
      expect(screen.getByText('Sin Distracciones')).toBeInTheDocument();
      expect(screen.getByText('Paso a Paso')).toBeInTheDocument();
    });
  });

  it('muestra estadísticas de uso correctamente', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockAccessibilitySettings
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockAccessibilityFeatures
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockAccessibilityStats
      });

    render(<AccessibilityPanel userId="user123" />);

    await waitFor(() => {
      expect(screen.getByText('15 características disponibles')).toBeInTheDocument();
      expect(screen.getByText('8 características habilitadas')).toBeInTheDocument();
      expect(screen.getByText('1,250 usos totales')).toBeInTheDocument();
    });
  });

  it('maneja atajos de teclado correctamente', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockAccessibilitySettings
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockAccessibilityFeatures
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockAccessibilityStats
      });

    render(<AccessibilityPanel userId="user123" />);

    await waitFor(() => {
      expect(screen.getByText('Ctrl+Shift+C')).toBeInTheDocument();
      expect(screen.getByText('Ctrl+Shift+S')).toBeInTheDocument();
      expect(screen.getByText('Tab')).toBeInTheDocument();
    });
  });

  it('maneja características populares correctamente', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockAccessibilitySettings
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockAccessibilityFeatures
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockAccessibilityStats
      });

    render(<AccessibilityPanel userId="user123" />);

    await waitFor(() => {
      expect(screen.getByText('Navegación por Teclado')).toBeInTheDocument();
      expect(screen.getByText('Alto Contraste')).toBeInTheDocument();
      expect(screen.getByText('Lector de Pantalla')).toBeInTheDocument();
    });
  });

  it('maneja configuraciones de fuente correctamente', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockAccessibilitySettings
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockAccessibilityFeatures
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockAccessibilityStats
      });

    render(<AccessibilityPanel userId="user123" />);

    await waitFor(() => {
      expect(screen.getByText('Mediano')).toBeInTheDocument();
      expect(screen.getByText('Predeterminada')).toBeInTheDocument();
    });

    // Buscar selectores de tamaño de fuente
    const fontSizeSelects = screen.getAllByTestId('font-size-select');
    if (fontSizeSelects.length > 0) {
      fireEvent.change(fontSizeSelects[0], { target: { value: 'large' } });
    }
  });

  it('maneja configuraciones de color correctamente', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockAccessibilitySettings
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockAccessibilityFeatures
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockAccessibilityStats
      });

    render(<AccessibilityPanel userId="user123" />);

    await waitFor(() => {
      expect(screen.getByText('Ninguno')).toBeInTheDocument(); // color blindness
    });

    // Buscar selectores de daltonismo
    const colorBlindnessSelects = screen.getAllByTestId('color-blindness-select');
    if (colorBlindnessSelects.length > 0) {
      fireEvent.change(colorBlindnessSelects[0], { target: { value: 'protanopia' } });
    }
  });

  it('maneja configuraciones de movimiento correctamente', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockAccessibilitySettings
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockAccessibilityFeatures
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockAccessibilityStats
      });

    render(<AccessibilityPanel userId="user123" />);

    await waitFor(() => {
      expect(screen.getByText('Reducir Movimiento')).toBeInTheDocument();
    });

    // Buscar toggle de reducir movimiento
    const reduceMotionToggles = screen.getAllByTestId('reduce-motion-toggle');
    if (reduceMotionToggles.length > 0) {
      fireEvent.click(reduceMotionToggles[0]);
    }
  });

  it('maneja configuraciones de cursor correctamente', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockAccessibilitySettings
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockAccessibilityFeatures
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockAccessibilityStats
      });

    render(<AccessibilityPanel userId="user123" />);

    await waitFor(() => {
      expect(screen.getByText('Normal')).toBeInTheDocument(); // cursor size
    });

    // Buscar selectores de tamaño de cursor
    const cursorSizeSelects = screen.getAllByTestId('cursor-size-select');
    if (cursorSizeSelects.length > 0) {
      fireEvent.change(cursorSizeSelects[0], { target: { value: 'large' } });
    }
  });

  it('maneja configuraciones de notificaciones correctamente', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockAccessibilitySettings
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockAccessibilityFeatures
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockAccessibilityStats
      });

    render(<AccessibilityPanel userId="user123" />);

    await waitFor(() => {
      expect(screen.getByText('Notificaciones de Sonido')).toBeInTheDocument();
    });

    // Buscar toggle de notificaciones de sonido
    const soundNotificationToggles = screen.getAllByTestId('sound-notification-toggle');
    if (soundNotificationToggles.length > 0) {
      fireEvent.click(soundNotificationToggles[0]);
    }
  });

  it('maneja exportación de configuraciones de accesibilidad', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockAccessibilitySettings
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockAccessibilityFeatures
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockAccessibilityStats
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: 'exported_settings', format: 'json' })
      });

    render(<AccessibilityPanel userId="user123" />);

    await waitFor(() => {
      expect(screen.getByText('Panel de Accesibilidad')).toBeInTheDocument();
    });

    // Buscar botón de exportar
    const exportButtons = screen.getAllByText(/Exportar|Descargar/i);
    if (exportButtons.length > 0) {
      fireEvent.click(exportButtons[0]);
    }
  });
});
