import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { RecommendationEngine } from '@/components/ai/RecommendationEngine';
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

// Mock de TensorFlow.js
jest.mock('@tensorflow/tfjs', () => ({
  loadLayersModel: jest.fn(() => Promise.resolve({
    predict: jest.fn(() => Promise.resolve([[0.8, 0.2, 0.1]]))
  })),
  tensor: jest.fn(() => ({
    expandDims: jest.fn(() => ({
      arraySync: jest.fn(() => [[0.8, 0.2, 0.1]])
    }))
  })),
  ready: jest.fn(() => Promise.resolve()),
  tidy: jest.fn((fn) => fn()),
  dispose: jest.fn()
}));

// Mock de fetch
global.fetch = jest.fn();

const mockUserProfile = {
  id: 'user123',
  preferences: {
    learningStyle: 'visual',
    difficulty: 'intermediate',
    culturalBackground: 'maya',
    interests: ['mathematics', 'history', 'art'],
    accessibility: {
      visual: false,
      auditory: true,
      motor: false,
      cognitive: false
    }
  },
  progress: {
    completedLessons: 15,
    averageScore: 85.5,
    timeSpent: 1200,
    lastActivity: '2024-01-25T10:00:00Z'
  },
  behavior: {
    sessionDuration: 45,
    clickPatterns: ['lesson_start', 'quiz_answer', 'help_request'],
    engagementLevel: 'high',
    preferredTime: 'morning'
  }
};

const mockRecommendations = {
  lessons: [
    {
      id: 'lesson1',
      title: 'Matemáticas Mayas',
      description: 'Aprende el sistema numérico maya',
      difficulty: 'intermediate',
      estimatedTime: 30,
      culturalRelevance: 'high',
      confidence: 0.95,
      reason: 'Basado en tu interés en matemáticas y cultura maya'
    },
    {
      id: 'lesson2',
      title: 'Historia Prehispánica',
      description: 'Explora la historia de las civilizaciones prehispánicas',
      difficulty: 'intermediate',
      estimatedTime: 45,
      culturalRelevance: 'medium',
      confidence: 0.87,
      reason: 'Complementa tu conocimiento histórico'
    }
  ],
  activities: [
    {
      id: 'activity1',
      title: 'Taller de Arte Maya',
      type: 'hands-on',
      duration: 60,
      materials: ['papel', 'colores', 'plantillas'],
      culturalContext: 'high',
      confidence: 0.92
    }
  ],
  resources: [
    {
      id: 'resource1',
      title: 'Documental: Los Mayas',
      type: 'video',
      duration: 90,
      language: 'español',
      subtitles: true,
      confidence: 0.88
    }
  ]
};

const mockAIModel = {
  modelId: 'recommendation-v1',
  version: '2.1.0',
  accuracy: 0.89,
  lastUpdated: '2024-01-20T00:00:00Z',
  features: ['user_preferences', 'learning_progress', 'cultural_context', 'accessibility_needs']
};

describe('RecommendationEngine', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockClear();
  });

  it('renderiza correctamente con datos de usuario', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockUserProfile
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockRecommendations
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockAIModel
      });

    render(<RecommendationEngine userId="user123" />);

    // Verificar que se muestra el estado de carga inicialmente
    expect(screen.getByText('Cargando recomendaciones...')).toBeInTheDocument();

    // Esperar a que se carguen los datos
    await waitFor(() => {
      expect(screen.getByText('Matemáticas Mayas')).toBeInTheDocument();
    });

    // Verificar que se muestran las recomendaciones principales
    expect(screen.getByText('Historia Prehispánica')).toBeInTheDocument();
    expect(screen.getByText('Taller de Arte Maya')).toBeInTheDocument();
  });

  it('maneja errores de carga correctamente', async () => {
    (fetch as jest.Mock).mockRejectedValue(new Error('Error de red'));

    render(<RecommendationEngine userId="user123" />);

    await waitFor(() => {
      expect(screen.getByText('Error al cargar recomendaciones')).toBeInTheDocument();
    });
  });

  it('muestra perfil de usuario correctamente', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockUserProfile
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockRecommendations
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockAIModel
      });

    render(<RecommendationEngine userId="user123" />);

    await waitFor(() => {
      expect(screen.getByText('Estilo de aprendizaje: Visual')).toBeInTheDocument();
      expect(screen.getByText('Dificultad: Intermedio')).toBeInTheDocument();
      expect(screen.getByText('Cultura: Maya')).toBeInTheDocument();
    });
  });

  it('muestra métricas de confianza correctamente', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockUserProfile
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockRecommendations
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockAIModel
      });

    render(<RecommendationEngine userId="user123" />);

    await waitFor(() => {
      expect(screen.getByText('95%')).toBeInTheDocument(); // confidence for lesson1
      expect(screen.getByText('87%')).toBeInTheDocument(); // confidence for lesson2
      expect(screen.getByText('92%')).toBeInTheDocument(); // confidence for activity1
    });
  });

  it('maneja filtros de recomendaciones correctamente', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockUserProfile
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockRecommendations
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockAIModel
      });

    render(<RecommendationEngine userId="user123" />);

    await waitFor(() => {
      expect(screen.getByText('Matemáticas Mayas')).toBeInTheDocument();
    });

    // Simular filtro por tipo
    const filterButtons = screen.getAllByTestId('filter-button');
    if (filterButtons.length > 0) {
      fireEvent.click(filterButtons[0]);
    }
  });

  it('muestra razones de recomendación correctamente', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockUserProfile
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockRecommendations
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockAIModel
      });

    render(<RecommendationEngine userId="user123" />);

    await waitFor(() => {
      expect(screen.getByText(/Basado en tu interés en matemáticas/)).toBeInTheDocument();
      expect(screen.getByText(/Complementa tu conocimiento histórico/)).toBeInTheDocument();
    });
  });

  it('maneja clics en recomendaciones correctamente', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockUserProfile
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockRecommendations
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockAIModel
      });

    render(<RecommendationEngine userId="user123" />);

    await waitFor(() => {
      expect(screen.getByText('Matemáticas Mayas')).toBeInTheDocument();
    });

    // Buscar y hacer clic en botones de acción
    const actionButtons = screen.getAllByText(/Comenzar|Ver más|Guardar/i);
    if (actionButtons.length > 0) {
      fireEvent.click(actionButtons[0]);
    }
  });

  it('muestra información del modelo AI correctamente', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockUserProfile
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockRecommendations
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockAIModel
      });

    render(<RecommendationEngine userId="user123" />);

    await waitFor(() => {
      expect(screen.getByText('Modelo: recommendation-v1')).toBeInTheDocument();
      expect(screen.getByText('Versión: 2.1.0')).toBeInTheDocument();
      expect(screen.getByText('Precisión: 89%')).toBeInTheDocument();
    });
  });

  it('maneja datos vacíos correctamente', async () => {
    const emptyRecommendations = {
      lessons: [],
      activities: [],
      resources: []
    };

    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockUserProfile
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => emptyRecommendations
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockAIModel
      });

    render(<RecommendationEngine userId="user123" />);

    await waitFor(() => {
      expect(screen.getByText(/No hay recomendaciones disponibles/)).toBeInTheDocument();
    });
  });

  it('actualiza recomendaciones cuando cambia el userId', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockUserProfile
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockRecommendations
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockAIModel
      });

    const { rerender } = render(<RecommendationEngine userId="user123" />);

    await waitFor(() => {
      expect(screen.getByText('Matemáticas Mayas')).toBeInTheDocument();
    });

    // Cambiar userId y verificar que se vuelven a cargar las recomendaciones
    const newRecommendations = {
      ...mockRecommendations,
      lessons: [
        {
          id: 'lesson3',
          title: 'Nuevo Contenido',
          description: 'Contenido personalizado para el nuevo usuario',
          difficulty: 'beginner',
          estimatedTime: 20,
          culturalRelevance: 'medium',
          confidence: 0.90,
          reason: 'Recomendación para nuevo usuario'
        }
      ]
    };

    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ...mockUserProfile, id: 'user456' })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => newRecommendations
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockAIModel
      });

    rerender(<RecommendationEngine userId="user456" />);

    await waitFor(() => {
      expect(screen.getByText('Nuevo Contenido')).toBeInTheDocument();
    });
  });

  it('maneja preferencias de accesibilidad correctamente', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockUserProfile
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockRecommendations
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockAIModel
      });

    render(<RecommendationEngine userId="user123" />);

    await waitFor(() => {
      expect(screen.getByText('Auditiva: Sí')).toBeInTheDocument();
      expect(screen.getByText('Visual: No')).toBeInTheDocument();
    });
  });

  it('muestra progreso del usuario correctamente', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockUserProfile
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockRecommendations
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockAIModel
      });

    render(<RecommendationEngine userId="user123" />);

    await waitFor(() => {
      expect(screen.getByText('15 lecciones completadas')).toBeInTheDocument();
      expect(screen.getByText('85.5% promedio')).toBeInTheDocument();
      expect(screen.getByText('20 horas de estudio')).toBeInTheDocument();
    });
  });

  it('maneja feedback de recomendaciones', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockUserProfile
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockRecommendations
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockAIModel
      });

    render(<RecommendationEngine userId="user123" />);

    await waitFor(() => {
      expect(screen.getByText('Matemáticas Mayas')).toBeInTheDocument();
    });

    // Buscar botones de feedback
    const feedbackButtons = screen.getAllByText(/👍|👎|Me gusta|No me gusta/i);
    if (feedbackButtons.length > 0) {
      fireEvent.click(feedbackButtons[0]);
    }
  });
});
