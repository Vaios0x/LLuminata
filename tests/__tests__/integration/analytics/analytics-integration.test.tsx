import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { AnalyticsDashboard } from '@/components/analytics/analytics-dashboard';
import { RealTimeMetrics } from '@/components/analytics/RealTimeMetrics';
import { ExportManager } from '@/components/analytics/ExportManager';
import { PredictiveAnalytics } from '@/components/analytics/PredictiveAnalytics';
import { HeatmapVisualizer } from '@/components/analytics/HeatmapVisualizer';
import { ABTestingDashboard } from '@/components/analytics/ABTestingDashboard';
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

// Mock de recharts
jest.mock('recharts', () => ({
  LineChart: ({ children, data, ...props }: any) => (
    <div data-testid="line-chart" data-points={data?.length} {...props}>{children}</div>
  ),
  Line: ({ dataKey, ...props }: any) => (
    <div data-testid="line" data-key={dataKey} {...props} />
  ),
  BarChart: ({ children, data, ...props }: any) => (
    <div data-testid="bar-chart" data-points={data?.length} {...props}>{children}</div>
  ),
  Bar: ({ dataKey, ...props }: any) => (
    <div data-testid="bar" data-key={dataKey} {...props} />
  ),
  PieChart: ({ children, data, ...props }: any) => (
    <div data-testid="pie-chart" data-points={data?.length} {...props}>{children}</div>
  ),
  Pie: ({ dataKey, ...props }: any) => (
    <div data-testid="pie" data-key={dataKey} {...props} />
  ),
  XAxis: ({ dataKey, ...props }: any) => (
    <div data-testid="x-axis" data-key={dataKey} {...props} />
  ),
  YAxis: ({ dataKey, ...props }: any) => (
    <div data-testid="y-axis" data-key={dataKey} {...props} />
  ),
  CartesianGrid: (props: any) => <div data-testid="cartesian-grid" {...props} />,
  Tooltip: (props: any) => <div data-testid="tooltip" {...props} />,
  Legend: (props: any) => <div data-testid="legend" {...props} />,
  ResponsiveContainer: ({ children, ...props }: any) => (
    <div data-testid="responsive-container" {...props}>{children}</div>
  ),
}));

// Mock de fetch
global.fetch = jest.fn();

const mockAnalyticsData = {
  overview: {
    totalUsers: 1250,
    activeUsers: 890,
    totalLessons: 450,
    completedLessons: 320,
    averageScore: 85.5,
    engagementRate: 78.2
  },
  trends: {
    userGrowth: [
      { date: '2024-01-01', users: 1000 },
      { date: '2024-01-02', users: 1050 },
      { date: '2024-01-03', users: 1100 }
    ],
    lessonCompletion: [
      { date: '2024-01-01', completed: 50 },
      { date: '2024-01-02', completed: 55 },
      { date: '2024-01-03', completed: 60 }
    ]
  },
  regional: {
    regions: [
      { name: 'Norte', users: 300, completionRate: 82.5 },
      { name: 'Sur', users: 250, completionRate: 78.3 },
      { name: 'Este', users: 200, completionRate: 85.1 },
      { name: 'Oeste', users: 180, completionRate: 79.8 }
    ]
  },
  cultural: {
    languages: [
      { language: 'Español', users: 800, engagement: 85.2 },
      { language: 'Maya', users: 200, engagement: 78.5 },
      { language: 'Náhuatl', users: 150, engagement: 82.1 },
      { language: 'Otros', users: 100, engagement: 75.3 }
    ]
  }
};

const mockRealTimeData = {
  currentUsers: 45,
  activeSessions: 23,
  currentLessons: 12,
  recentActivity: [
    { id: '1', user: 'user123', action: 'lesson_started', timestamp: '2024-01-25T10:00:00Z' },
    { id: '2', user: 'user456', action: 'quiz_completed', timestamp: '2024-01-25T09:55:00Z' },
    { id: '3', user: 'user789', action: 'badge_earned', timestamp: '2024-01-25T09:50:00Z' }
  ],
  performance: {
    responseTime: 120,
    errorRate: 0.5,
    uptime: 99.9
  }
};

const mockExportData = {
  exports: [
    {
      id: '1',
      name: 'Reporte Mensual',
      type: 'pdf',
      status: 'completed',
      createdAt: '2024-01-25T10:00:00Z',
      size: '2.5MB',
      downloadUrl: '/exports/report-2024-01.pdf'
    },
    {
      id: '2',
      name: 'Datos de Usuarios',
      type: 'csv',
      status: 'processing',
      createdAt: '2024-01-25T09:30:00Z',
      size: null,
      downloadUrl: null
    }
  ],
  templates: [
    { id: '1', name: 'Reporte Estándar', description: 'Reporte básico de métricas' },
    { id: '2', name: 'Análisis Cultural', description: 'Reporte enfocado en datos culturales' }
  ]
};

const mockPredictiveData = {
  predictions: [
    {
      id: '1',
      metric: 'user_growth',
      prediction: 1350,
      confidence: 0.85,
      timeframe: '30_days',
      factors: ['seasonal_trend', 'marketing_campaign', 'content_quality']
    },
    {
      id: '2',
      metric: 'completion_rate',
      prediction: 0.82,
      confidence: 0.78,
      timeframe: '7_days',
      factors: ['user_engagement', 'content_difficulty', 'support_quality']
    }
  ],
  models: [
    {
      id: '1',
      name: 'User Growth Model',
      accuracy: 0.89,
      lastUpdated: '2024-01-20T00:00:00Z',
      status: 'active'
    },
    {
      id: '2',
      name: 'Engagement Predictor',
      accuracy: 0.76,
      lastUpdated: '2024-01-18T00:00:00Z',
      status: 'training'
    }
  ]
};

const mockHeatmapData = {
  userBehavior: [
    { x: 0, y: 0, value: 150, action: 'click' },
    { x: 100, y: 50, value: 89, action: 'click' },
    { x: 200, y: 100, value: 234, action: 'hover' }
  ],
  pageSections: [
    { section: 'header', interactions: 450, engagement: 0.85 },
    { section: 'navigation', interactions: 320, engagement: 0.72 },
    { section: 'content', interactions: 890, engagement: 0.91 },
    { section: 'footer', interactions: 120, engagement: 0.45 }
  ],
  timeAnalysis: [
    { hour: 9, activity: 0.8 },
    { hour: 10, activity: 0.9 },
    { hour: 11, activity: 0.7 },
    { hour: 12, activity: 0.6 }
  ]
};

const mockABTestingData = {
  tests: [
    {
      id: '1',
      name: 'Nuevo Diseño de Botón CTA',
      status: 'running',
      participants: 1000,
      confidence: 0.95,
      winner: 'Variante A'
    },
    {
      id: '2',
      name: 'Algoritmo de Recomendaciones',
      status: 'completed',
      participants: 2000,
      confidence: 0.98,
      winner: 'Variante B'
    }
  ],
  results: [
    {
      testId: '1',
      variant: 'Control',
      conversionRate: 0.12,
      sampleSize: 500,
      isSignificant: false
    },
    {
      testId: '1',
      variant: 'Variante A',
      conversionRate: 0.16,
      sampleSize: 500,
      isSignificant: true
    }
  ]
};

describe('Analytics Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockClear();
  });

  describe('Dashboard Integration', () => {
    it('integra correctamente con el sistema de analytics completo', async () => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockAnalyticsData
      });

      render(<AnalyticsDashboard />);

      await waitFor(() => {
        expect(screen.getByText('1,250')).toBeInTheDocument(); // total users
        expect(screen.getByText('890')).toBeInTheDocument(); // active users
        expect(screen.getByText('450')).toBeInTheDocument(); // total lessons
      });
    });

    it('sincroniza datos entre diferentes componentes de analytics', async () => {
      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockAnalyticsData
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockRealTimeData
        });

      render(
        <div>
          <AnalyticsDashboard />
          <RealTimeMetrics />
        </div>
      );

      await waitFor(() => {
        expect(screen.getByText('1,250')).toBeInTheDocument();
        expect(screen.getByText('45 usuarios activos')).toBeInTheDocument();
      });
    });
  });

  describe('Real-Time Metrics Integration', () => {
    it('integra métricas en tiempo real con el dashboard', async () => {
      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockRealTimeData
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockAnalyticsData
        });

      render(<RealTimeMetrics />);

      await waitFor(() => {
        expect(screen.getByText('45 usuarios activos')).toBeInTheDocument();
        expect(screen.getByText('23 sesiones activas')).toBeInTheDocument();
        expect(screen.getByText('12 lecciones en curso')).toBeInTheDocument();
      });
    });

    it('maneja actualizaciones en tiempo real correctamente', async () => {
      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockRealTimeData
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ ...mockRealTimeData, currentUsers: 50 })
        });

      render(<RealTimeMetrics />);

      await waitFor(() => {
        expect(screen.getByText('45 usuarios activos')).toBeInTheDocument();
      });

      // Simular actualización en tiempo real
      await waitFor(() => {
        expect(screen.getByText('50 usuarios activos')).toBeInTheDocument();
      });
    });
  });

  describe('Export Manager Integration', () => {
    it('integra exportación con el sistema de analytics', async () => {
      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockExportData
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockAnalyticsData
        });

      render(<ExportManager />);

      await waitFor(() => {
        expect(screen.getByText('Reporte Mensual')).toBeInTheDocument();
        expect(screen.getByText('Datos de Usuarios')).toBeInTheDocument();
        expect(screen.getByText('Completado')).toBeInTheDocument();
        expect(screen.getByText('Procesando')).toBeInTheDocument();
      });
    });

    it('maneja creación de nuevos reportes', async () => {
      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockExportData
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, exportId: '3' })
        });

      render(<ExportManager />);

      await waitFor(() => {
        expect(screen.getByText('Reporte Mensual')).toBeInTheDocument();
      });

      // Simular creación de reporte
      const createButtons = screen.getAllByText(/Crear|Nuevo/i);
      if (createButtons.length > 0) {
        fireEvent.click(createButtons[0]);
      }
    });
  });

  describe('Predictive Analytics Integration', () => {
    it('integra análisis predictivo con métricas existentes', async () => {
      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPredictiveData
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockAnalyticsData
        });

      render(<PredictiveAnalytics />);

      await waitFor(() => {
        expect(screen.getByText('1,350')).toBeInTheDocument(); // predicted user growth
        expect(screen.getByText('82%')).toBeInTheDocument(); // predicted completion rate
        expect(screen.getByText('85%')).toBeInTheDocument(); // confidence
      });
    });

    it('maneja entrenamiento de modelos predictivos', async () => {
      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPredictiveData
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, modelId: '3' })
        });

      render(<PredictiveAnalytics />);

      await waitFor(() => {
        expect(screen.getByText('User Growth Model')).toBeInTheDocument();
        expect(screen.getByText('Engagement Predictor')).toBeInTheDocument();
      });

      // Simular entrenamiento de modelo
      const trainButtons = screen.getAllByText(/Entrenar|Train/i);
      if (trainButtons.length > 0) {
        fireEvent.click(trainButtons[0]);
      }
    });
  });

  describe('Heatmap Integration', () => {
    it('integra visualización de heatmap con datos de comportamiento', async () => {
      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockHeatmapData
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockAnalyticsData
        });

      render(<HeatmapVisualizer />);

      await waitFor(() => {
        expect(screen.getByText('150')).toBeInTheDocument(); // click value
        expect(screen.getByText('234')).toBeInTheDocument(); // hover value
        expect(screen.getByText('Header')).toBeInTheDocument();
        expect(screen.getByText('Content')).toBeInTheDocument();
      });
    });

    it('maneja filtros de heatmap correctamente', async () => {
      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockHeatmapData
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ ...mockHeatmapData, userBehavior: [] })
        });

      render(<HeatmapVisualizer />);

      await waitFor(() => {
        expect(screen.getByText('150')).toBeInTheDocument();
      });

      // Simular filtro por tipo de interacción
      const filterButtons = screen.getAllByTestId('heatmap-filter');
      if (filterButtons.length > 0) {
        fireEvent.click(filterButtons[0]);
      }
    });
  });

  describe('A/B Testing Integration', () => {
    it('integra A/B testing con métricas de analytics', async () => {
      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockABTestingData
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockAnalyticsData
        });

      render(<ABTestingDashboard />);

      await waitFor(() => {
        expect(screen.getByText('Nuevo Diseño de Botón CTA')).toBeInTheDocument();
        expect(screen.getByText('Algoritmo de Recomendaciones')).toBeInTheDocument();
        expect(screen.getByText('Ejecutándose')).toBeInTheDocument();
        expect(screen.getByText('Completado')).toBeInTheDocument();
      });
    });

    it('maneja resultados de A/B testing y actualiza métricas', async () => {
      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockABTestingData
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, testId: '3' })
        });

      render(<ABTestingDashboard />);

      await waitFor(() => {
        expect(screen.getByText('Variante A')).toBeInTheDocument();
        expect(screen.getByText('16%')).toBeInTheDocument(); // conversion rate
      });

      // Simular creación de nuevo test
      const createTestButtons = screen.getAllByText(/Nuevo Test|Crear/i);
      if (createTestButtons.length > 0) {
        fireEvent.click(createTestButtons[0]);
      }
    });
  });

  describe('Cross-Component Analytics Integration', () => {
    it('integra todos los componentes de analytics correctamente', async () => {
      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockAnalyticsData
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockRealTimeData
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockExportData
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPredictiveData
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockHeatmapData
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockABTestingData
        });

      render(
        <div>
          <AnalyticsDashboard />
          <RealTimeMetrics />
          <ExportManager />
          <PredictiveAnalytics />
          <HeatmapVisualizer />
          <ABTestingDashboard />
        </div>
      );

      await waitFor(() => {
        // Verificar que todos los componentes se renderizan correctamente
        expect(screen.getByText('1,250')).toBeInTheDocument();
        expect(screen.getByText('45 usuarios activos')).toBeInTheDocument();
        expect(screen.getByText('Reporte Mensual')).toBeInTheDocument();
        expect(screen.getByText('1,350')).toBeInTheDocument();
        expect(screen.getByText('150')).toBeInTheDocument();
        expect(screen.getByText('Nuevo Diseño de Botón CTA')).toBeInTheDocument();
      });
    });

    it('maneja errores de red en múltiples componentes de analytics', async () => {
      (fetch as jest.Mock).mockRejectedValue(new Error('Error de red'));

      render(
        <div>
          <AnalyticsDashboard />
          <RealTimeMetrics />
        </div>
      );

      await waitFor(() => {
        expect(screen.getAllByText(/Error al cargar/i)).toHaveLength(2);
      });
    });

    it('sincroniza filtros entre componentes de analytics', async () => {
      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockAnalyticsData
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockRealTimeData
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ ...mockAnalyticsData, overview: { ...mockAnalyticsData.overview, totalUsers: 1300 } })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ ...mockRealTimeData, currentUsers: 50 })
        });

      render(
        <div>
          <AnalyticsDashboard />
          <RealTimeMetrics />
        </div>
      );

      await waitFor(() => {
        expect(screen.getByText('1,250')).toBeInTheDocument();
        expect(screen.getByText('45 usuarios activos')).toBeInTheDocument();
      });

      // Simular cambio de filtro de fecha
      const dateInputs = screen.getAllByTestId('date-filter');
      if (dateInputs.length > 0) {
        fireEvent.change(dateInputs[0], { target: { value: '2024-01-26' } });
      }

      await waitFor(() => {
        expect(screen.getByText('1,300')).toBeInTheDocument();
        expect(screen.getByText('50 usuarios activos')).toBeInTheDocument();
      });
    });

    it('maneja exportación de datos desde múltiples componentes', async () => {
      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockAnalyticsData
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockExportData
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, exportId: '4' })
        });

      render(
        <div>
          <AnalyticsDashboard />
          <ExportManager />
        </div>
      );

      await waitFor(() => {
        expect(screen.getByText('1,250')).toBeInTheDocument();
        expect(screen.getByText('Reporte Mensual')).toBeInTheDocument();
      });

      // Simular exportación desde dashboard
      const exportButtons = screen.getAllByText(/Exportar|Export/i);
      if (exportButtons.length > 0) {
        fireEvent.click(exportButtons[0]);
      }
    });
  });
});
