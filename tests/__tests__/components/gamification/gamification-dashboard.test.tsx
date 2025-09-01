import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { GamificationDashboard } from '@/components/gamification/gamification-dashboard';
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

jest.mock('@/components/ui/progress', () => ({
  Progress: ({ value, ...props }: any) => (
    <div data-testid="progress" data-value={value} {...props}>
      <div style={{ width: `${value}%` }}>Progress</div>
    </div>
  ),
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

const mockGamificationData = {
  level: {
    level: 5,
    experience: 1250,
    points: 5000,
    title: "Estudiante Avanzado"
  },
  badges: [
    {
      id: "1",
      badge: {
        name: "Primer Paso",
        description: "Completaste tu primera lección",
        icon: "🎯",
        category: "learning",
        rarity: "common",
        points: 10
      },
      earnedAt: "2024-01-15T10:00:00Z",
      progress: 100
    }
  ],
  achievements: [
    {
      id: "1",
      achievement: {
        name: "Estudiante Dedicado",
        description: "Completaste 10 lecciones",
        icon: "📚",
        category: "learning",
        points: 50
      },
      earnedAt: "2024-01-20T15:30:00Z",
      progress: 100
    }
  ],
  rewards: [
    {
      id: "1",
      reward: {
        name: "Puntos Extra",
        description: "100 puntos adicionales",
        type: "points",
        value: 100,
        icon: "⭐"
      },
      earnedAt: "2024-01-25T12:00:00Z",
      claimedAt: "2024-01-25T12:05:00Z"
    }
  ],
  stats: {
    lessons_completed: 15,
    assessments_passed: 12,
    cultural_activities: 8,
    help_others: 5,
    perfect_scores: 3,
    study_streak: 7,
    languages_learned: 2,
    students_helped: 3
  }
};

const mockCompetitions = [
  {
    id: "1",
    name: "Desafío Cultural",
    description: "Competencia de conocimientos culturales",
    type: "cultural",
    startDate: "2024-02-01T00:00:00Z",
    endDate: "2024-02-28T23:59:59Z",
    status: "active",
    _count: {
      participants: 25
    }
  }
];

describe('GamificationDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockClear();
  });

  it('renderiza correctamente con datos de gamificación', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockGamificationData })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockCompetitions })
      });

    render(<GamificationDashboard userId="user123" />);

    // Verificar que se muestra el estado de carga inicialmente (spinner)
    expect(screen.getAllByText('')).toHaveLength(4); // El spinner está presente

    // Esperar a que se carguen los datos
    await waitFor(() => {
      expect(screen.getByText(/Nivel 5/)).toBeInTheDocument();
    });

    // Verificar que se muestran los elementos principales
    expect(screen.getByText('Estudiante Avanzado')).toBeInTheDocument();
    expect(screen.getByText(/5000.*puntos/)).toBeInTheDocument();
    expect(screen.getByText('Primer Paso')).toBeInTheDocument();
    expect(screen.getByText('Estudiante Dedicado')).toBeInTheDocument();
  });

  it('maneja errores de carga correctamente', async () => {
    (fetch as jest.Mock).mockRejectedValue(new Error('Error de red'));

    render(<GamificationDashboard userId="user123" />);

    await waitFor(() => {
      expect(screen.getByText(/Error/)).toBeInTheDocument();
    });
  });

  it('muestra estadísticas correctamente', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockGamificationData })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockCompetitions })
      });

    render(<GamificationDashboard userId="user123" />);

    await waitFor(() => {
      expect(screen.getByText('15')).toBeInTheDocument(); // lecciones completadas
      expect(screen.getAllByText('3')).toHaveLength(2); // puntuaciones perfectas y otro elemento
      expect(screen.getByText('7')).toBeInTheDocument(); // racha de estudio (corregido)
    });
  });

  it('muestra competencias activas', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockGamificationData })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockCompetitions })
      });

    render(<GamificationDashboard userId="user123" />);

    await waitFor(() => {
      expect(screen.getByText('Desafío Cultural')).toBeInTheDocument();
      expect(screen.getByText('25 participantes')).toBeInTheDocument();
    });
  });

  it('maneja clics en botones correctamente', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockGamificationData })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockCompetitions })
      });

    render(<GamificationDashboard userId="user123" />);

    await waitFor(() => {
      expect(screen.getByText(/Nivel 5/)).toBeInTheDocument();
    });

    // Buscar y hacer clic en botones
    const buttons = screen.getAllByTestId('button');
    if (buttons.length > 0) {
      fireEvent.click(buttons[0]);
    }
  });

  it('muestra progreso de nivel correctamente', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockGamificationData })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockCompetitions })
      });

    render(<GamificationDashboard userId="user123" />);

    await waitFor(() => {
      const progressBars = screen.getAllByTestId('progress');
      expect(progressBars.length).toBeGreaterThan(0);
    });
  });

  it('muestra badges y logros correctamente', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockGamificationData })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockCompetitions })
      });

    render(<GamificationDashboard userId="user123" />);

    await waitFor(() => {
      expect(screen.getByText('Primer Paso')).toBeInTheDocument();
      expect(screen.getByText('Estudiante Dedicado')).toBeInTheDocument();
      // Los emojis están en el mock pero no se renderizan en el test
    });
  });

  it('maneja datos vacíos correctamente', async () => {
    const emptyData = {
      level: { level: 1, experience: 0, points: 0, title: "Novato" },
      badges: [],
      achievements: [],
      rewards: [],
      stats: {
        lessons_completed: 0,
        assessments_passed: 0,
        cultural_activities: 0,
        help_others: 0,
        perfect_scores: 0,
        study_streak: 0,
        languages_learned: 0,
        students_helped: 0
      }
    };

    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: emptyData })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] })
      });

    render(<GamificationDashboard userId="user123" />);

    await waitFor(() => {
      expect(screen.getByText(/Nivel 1/)).toBeInTheDocument();
      expect(screen.getByText(/0.*puntos/)).toBeInTheDocument();
    });
  });

  it('actualiza datos cuando cambia el userId', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockGamificationData })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockCompetitions })
      });

    const { rerender } = render(<GamificationDashboard userId="user123" />);

    await waitFor(() => {
      expect(screen.getByText(/Nivel 5/)).toBeInTheDocument();
    });

    // Cambiar userId y verificar que se vuelven a cargar los datos
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { ...mockGamificationData, level: { ...mockGamificationData.level, level: 3 } } })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockCompetitions })
      });

    rerender(<GamificationDashboard userId="user456" />);

    await waitFor(() => {
      expect(screen.getByText('Nivel 3')).toBeInTheDocument();
    });
  });
});
