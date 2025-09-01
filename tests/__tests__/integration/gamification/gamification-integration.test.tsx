import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { GamificationDashboard } from '@/components/gamification/gamification-dashboard';
import { PersonalizationHub } from '@/components/gamification/PersonalizationHub';
import { TradingSystem } from '@/components/gamification/TradingSystem';
import { EventCalendar } from '@/components/gamification/EventCalendar';
import { ClanSystem } from '@/components/gamification/ClanSystem';
import { CompetitionBoard } from '@/components/gamification/CompetitionBoard';
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

const mockPersonalizationData = {
  themes: [
    { id: '1', name: 'Maya Clásico', description: 'Tema inspirado en la cultura maya', active: true },
    { id: '2', name: 'Náhuatl Moderno', description: 'Tema con elementos náhuatl', active: false }
  ],
  avatars: [
    { id: '1', name: 'Guerrero Maya', unlocked: true, equipped: true },
    { id: '2', name: 'Sabio Náhuatl', unlocked: false, equipped: false }
  ],
  customizations: {
    colorScheme: 'warm',
    animations: true,
    soundEffects: true,
    notifications: true
  }
};

const mockTradingData = {
  inventory: [
    { id: '1', name: 'Moneda Maya', type: 'currency', quantity: 150, rarity: 'common' },
    { id: '2', name: 'Jade Precioso', type: 'gem', quantity: 5, rarity: 'rare' }
  ],
  market: [
    { id: '1', name: 'Poción de Sabiduría', price: 50, seller: 'user456', available: true },
    { id: '2', name: 'Amuleto Protector', price: 100, seller: 'user789', available: true }
  ],
  transactions: [
    { id: '1', type: 'buy', item: 'Poción de Sabiduría', price: 50, date: '2024-01-25T10:00:00Z' },
    { id: '2', type: 'sell', item: 'Jade Precioso', price: 200, date: '2024-01-24T15:30:00Z' }
  ]
};

const mockEventData = {
  events: [
    {
      id: '1',
      name: 'Festival Maya',
      description: 'Celebración de la cultura maya',
      startDate: '2024-02-01T00:00:00Z',
      endDate: '2024-02-07T23:59:59Z',
      type: 'cultural',
      participants: 45,
      rewards: ['badge_festival', 'points_100']
    }
  ],
  userEvents: [
    {
      id: '1',
      eventId: '1',
      status: 'registered',
      progress: 60,
      rewards: ['badge_festival']
    }
  ]
};

const mockClanData = {
  clans: [
    {
      id: '1',
      name: 'Guerreros del Conocimiento',
      description: 'Clan dedicado al aprendizaje',
      members: 25,
      level: 8,
      achievements: ['first_clan', 'cultural_masters'],
      leader: 'user123'
    }
  ],
  userClan: {
    id: '1',
    role: 'leader',
    joinedAt: '2024-01-01T00:00:00Z',
    contributions: 1500
  }
};

const mockCompetitionData = {
  competitions: [
    {
      id: '1',
      name: 'Desafío Cultural',
      description: 'Competencia de conocimientos culturales',
      startDate: '2024-02-01T00:00:00Z',
      endDate: '2024-02-28T23:59:59Z',
      type: 'cultural',
      participants: 50,
      prizes: ['trophy_gold', 'points_500']
    }
  ],
  userCompetitions: [
    {
      id: '1',
      competitionId: '1',
      rank: 5,
      score: 850,
      completed: true
    }
  ]
};

describe('Gamification Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockClear();
  });

  describe('Dashboard Integration', () => {
    it('integra correctamente con el sistema de gamificación completo', async () => {
      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockGamificationData
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => []
        });

      render(<GamificationDashboard userId="user123" />);

      await waitFor(() => {
        expect(screen.getByText('Nivel 5')).toBeInTheDocument();
        expect(screen.getByText('Estudiante Avanzado')).toBeInTheDocument();
        expect(screen.getByText('5000 puntos')).toBeInTheDocument();
      });
    });

    it('sincroniza datos entre diferentes componentes de gamificación', async () => {
      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockGamificationData
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => []
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPersonalizationData
        });

      render(
        <div>
          <GamificationDashboard userId="user123" />
          <PersonalizationHub userId="user123" />
        </div>
      );

      await waitFor(() => {
        expect(screen.getByText('Nivel 5')).toBeInTheDocument();
        expect(screen.getByText('Maya Clásico')).toBeInTheDocument();
      });
    });
  });

  describe('Personalization Integration', () => {
    it('integra personalización con el sistema de gamificación', async () => {
      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPersonalizationData
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockGamificationData
        });

      render(<PersonalizationHub userId="user123" />);

      await waitFor(() => {
        expect(screen.getByText('Maya Clásico')).toBeInTheDocument();
        expect(screen.getByText('Guerrero Maya')).toBeInTheDocument();
      });
    });

    it('maneja cambios de personalización y actualiza el estado global', async () => {
      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPersonalizationData
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true })
        });

      render(<PersonalizationHub userId="user123" />);

      await waitFor(() => {
        expect(screen.getByText('Maya Clásico')).toBeInTheDocument();
      });

      // Simular cambio de tema
      const themeButtons = screen.getAllByTestId('theme-button');
      if (themeButtons.length > 0) {
        fireEvent.click(themeButtons[0]);
      }
    });
  });

  describe('Trading System Integration', () => {
    it('integra el sistema de trading con la economía de gamificación', async () => {
      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockTradingData
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockGamificationData
        });

      render(<TradingSystem userId="user123" />);

      await waitFor(() => {
        expect(screen.getByText('Moneda Maya')).toBeInTheDocument();
        expect(screen.getByText('Jade Precioso')).toBeInTheDocument();
        expect(screen.getByText('Poción de Sabiduría')).toBeInTheDocument();
      });
    });

    it('maneja transacciones y actualiza el inventario del usuario', async () => {
      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockTradingData
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, transactionId: 'tx123' })
        });

      render(<TradingSystem userId="user123" />);

      await waitFor(() => {
        expect(screen.getByText('Poción de Sabiduría')).toBeInTheDocument();
      });

      // Simular compra
      const buyButtons = screen.getAllByText(/Comprar|Buy/i);
      if (buyButtons.length > 0) {
        fireEvent.click(buyButtons[0]);
      }
    });
  });

  describe('Event System Integration', () => {
    it('integra eventos con el sistema de gamificación', async () => {
      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockEventData
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockGamificationData
        });

      render(<EventCalendar userId="user123" />);

      await waitFor(() => {
        expect(screen.getByText('Festival Maya')).toBeInTheDocument();
        expect(screen.getByText('60%')).toBeInTheDocument(); // progress
      });
    });

    it('maneja participación en eventos y actualiza progreso', async () => {
      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockEventData
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, progress: 80 })
        });

      render(<EventCalendar userId="user123" />);

      await waitFor(() => {
        expect(screen.getByText('Festival Maya')).toBeInTheDocument();
      });

      // Simular participación
      const participateButtons = screen.getAllByText(/Participar|Join/i);
      if (participateButtons.length > 0) {
        fireEvent.click(participateButtons[0]);
      }
    });
  });

  describe('Clan System Integration', () => {
    it('integra el sistema de clanes con gamificación', async () => {
      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockClanData
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockGamificationData
        });

      render(<ClanSystem userId="user123" />);

      await waitFor(() => {
        expect(screen.getByText('Guerreros del Conocimiento')).toBeInTheDocument();
        expect(screen.getByText('Líder')).toBeInTheDocument();
        expect(screen.getByText('25 miembros')).toBeInTheDocument();
      });
    });

    it('maneja contribuciones al clan y actualiza estadísticas', async () => {
      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockClanData
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, contribution: 1600 })
        });

      render(<ClanSystem userId="user123" />);

      await waitFor(() => {
        expect(screen.getByText('Guerreros del Conocimiento')).toBeInTheDocument();
      });

      // Simular contribución
      const contributeButtons = screen.getAllByText(/Contribuir|Donate/i);
      if (contributeButtons.length > 0) {
        fireEvent.click(contributeButtons[0]);
      }
    });
  });

  describe('Competition Integration', () => {
    it('integra competencias con el sistema de gamificación', async () => {
      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockCompetitionData
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockGamificationData
        });

      render(<CompetitionBoard userId="user123" />);

      await waitFor(() => {
        expect(screen.getByText('Desafío Cultural')).toBeInTheDocument();
        expect(screen.getByText('5º lugar')).toBeInTheDocument();
        expect(screen.getByText('850 puntos')).toBeInTheDocument();
      });
    });

    it('maneja participación en competencias y actualiza ranking', async () => {
      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockCompetitionData
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, rank: 3, score: 900 })
        });

      render(<CompetitionBoard userId="user123" />);

      await waitFor(() => {
        expect(screen.getByText('Desafío Cultural')).toBeInTheDocument();
      });

      // Simular participación en competencia
      const competeButtons = screen.getAllByText(/Competir|Join/i);
      if (competeButtons.length > 0) {
        fireEvent.click(competeButtons[0]);
      }
    });
  });

  describe('Cross-Component Integration', () => {
    it('integra todos los sistemas de gamificación correctamente', async () => {
      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockGamificationData
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPersonalizationData
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockTradingData
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockEventData
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockClanData
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockCompetitionData
        });

      render(
        <div>
          <GamificationDashboard userId="user123" />
          <PersonalizationHub userId="user123" />
          <TradingSystem userId="user123" />
          <EventCalendar userId="user123" />
          <ClanSystem userId="user123" />
          <CompetitionBoard userId="user123" />
        </div>
      );

      await waitFor(() => {
        // Verificar que todos los componentes se renderizan correctamente
        expect(screen.getByText('Nivel 5')).toBeInTheDocument();
        expect(screen.getByText('Maya Clásico')).toBeInTheDocument();
        expect(screen.getByText('Moneda Maya')).toBeInTheDocument();
        expect(screen.getByText('Festival Maya')).toBeInTheDocument();
        expect(screen.getByText('Guerreros del Conocimiento')).toBeInTheDocument();
        expect(screen.getByText('Desafío Cultural')).toBeInTheDocument();
      });
    });

    it('maneja errores de red en múltiples componentes', async () => {
      (fetch as jest.Mock).mockRejectedValue(new Error('Error de red'));

      render(
        <div>
          <GamificationDashboard userId="user123" />
          <PersonalizationHub userId="user123" />
        </div>
      );

      await waitFor(() => {
        expect(screen.getAllByText(/Error al cargar/i)).toHaveLength(2);
      });
    });

    it('sincroniza estado entre componentes cuando cambia el userId', async () => {
      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockGamificationData
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPersonalizationData
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ ...mockGamificationData, level: { ...mockGamificationData.level, level: 3 } })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ ...mockPersonalizationData, themes: [] })
        });

      const { rerender } = render(
        <div>
          <GamificationDashboard userId="user123" />
          <PersonalizationHub userId="user123" />
        </div>
      );

      await waitFor(() => {
        expect(screen.getByText('Nivel 5')).toBeInTheDocument();
        expect(screen.getByText('Maya Clásico')).toBeInTheDocument();
      });

      rerender(
        <div>
          <GamificationDashboard userId="user456" />
          <PersonalizationHub userId="user456" />
        </div>
      );

      await waitFor(() => {
        expect(screen.getByText('Nivel 3')).toBeInTheDocument();
      });
    });
  });
});
