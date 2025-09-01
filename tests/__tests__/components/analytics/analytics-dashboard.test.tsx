import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { AnalyticsDashboard } from '@/components/analytics/analytics-dashboard';
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

describe('AnalyticsDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockClear();
  });

  it('renderiza correctamente con datos de analytics', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockAnalyticsData
    });

    render(<AnalyticsDashboard />);

    // Verificar que se muestra el estado de carga inicialmente
    expect(screen.getByText('Cargando...')).toBeInTheDocument();

    // Esperar a que se carguen los datos
    await waitFor(() => {
      expect(screen.getByText('1,250')).toBeInTheDocument(); // total users
    });

    // Verificar que se muestran las métricas principales
    expect(screen.getByText('890')).toBeInTheDocument(); // active users
    expect(screen.getByText('450')).toBeInTheDocument(); // total lessons
    expect(screen.getByText('320')).toBeInTheDocument(); // completed lessons
  });

  it('maneja errores de carga correctamente', async () => {
    (fetch as jest.Mock).mockRejectedValue(new Error('Error de red'));

    render(<AnalyticsDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Error al cargar datos de analytics')).toBeInTheDocument();
    });
  });

  it('muestra gráficos correctamente', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockAnalyticsData
    });

    render(<AnalyticsDashboard />);

    await waitFor(() => {
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
      expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
    });
  });

  it('muestra datos regionales correctamente', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockAnalyticsData
    });

    render(<AnalyticsDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Norte')).toBeInTheDocument();
      expect(screen.getByText('300')).toBeInTheDocument();
      expect(screen.getByText('82.5%')).toBeInTheDocument();
    });
  });

  it('muestra datos culturales correctamente', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockAnalyticsData
    });

    render(<AnalyticsDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Español')).toBeInTheDocument();
      expect(screen.getByText('Maya')).toBeInTheDocument();
      expect(screen.getByText('Náhuatl')).toBeInTheDocument();
    });
  });

  it('maneja filtros de fecha correctamente', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockAnalyticsData
    });

    render(<AnalyticsDashboard />);

    await waitFor(() => {
      expect(screen.getByText('1,250')).toBeInTheDocument();
    });

    // Simular cambio de filtro de fecha
    const dateInputs = screen.getAllByTestId('date-input');
    if (dateInputs.length > 0) {
      fireEvent.change(dateInputs[0], { target: { value: '2024-01-01' } });
    }
  });

  it('muestra tendencias correctamente', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockAnalyticsData
    });

    render(<AnalyticsDashboard />);

    await waitFor(() => {
      const lineChart = screen.getByTestId('line-chart');
      expect(lineChart).toBeInTheDocument();
      expect(lineChart.getAttribute('data-points')).toBe('3');
    });
  });

  it('maneja datos vacíos correctamente', async () => {
    const emptyData = {
      overview: {
        totalUsers: 0,
        activeUsers: 0,
        totalLessons: 0,
        completedLessons: 0,
        averageScore: 0,
        engagementRate: 0
      },
      trends: {
        userGrowth: [],
        lessonCompletion: []
      },
      regional: {
        regions: []
      },
      cultural: {
        languages: []
      }
    };

    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => emptyData
    });

    render(<AnalyticsDashboard />);

    await waitFor(() => {
      expect(screen.getByText('0')).toBeInTheDocument();
    });
  });

  it('actualiza datos cuando cambian los filtros', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockAnalyticsData
    });

    render(<AnalyticsDashboard />);

    await waitFor(() => {
      expect(screen.getByText('1,250')).toBeInTheDocument();
    });

    // Simular cambio de filtro
    const filterButtons = screen.getAllByTestId('filter-button');
    if (filterButtons.length > 0) {
      fireEvent.click(filterButtons[0]);
    }
  });

  it('muestra métricas de engagement correctamente', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockAnalyticsData
    });

    render(<AnalyticsDashboard />);

    await waitFor(() => {
      expect(screen.getByText('78.2%')).toBeInTheDocument(); // engagement rate
      expect(screen.getByText('85.5%')).toBeInTheDocument(); // average score
    });
  });

  it('maneja exportación de datos', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockAnalyticsData
    });

    render(<AnalyticsDashboard />);

    await waitFor(() => {
      expect(screen.getByText('1,250')).toBeInTheDocument();
    });

    // Buscar botón de exportar
    const exportButtons = screen.getAllByText(/exportar/i);
    if (exportButtons.length > 0) {
      fireEvent.click(exportButtons[0]);
    }
  });

  it('muestra comparativas correctamente', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockAnalyticsData
    });

    render(<AnalyticsDashboard />);

    await waitFor(() => {
      // Verificar que se muestran comparativas entre regiones
      expect(screen.getByText('Norte')).toBeInTheDocument();
      expect(screen.getByText('Sur')).toBeInTheDocument();
      expect(screen.getByText('Este')).toBeInTheDocument();
      expect(screen.getByText('Oeste')).toBeInTheDocument();
    });
  });

  it('maneja responsive design correctamente', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockAnalyticsData
    });

    render(<AnalyticsDashboard />);

    await waitFor(() => {
      const responsiveContainers = screen.getAllByTestId('responsive-container');
      expect(responsiveContainers.length).toBeGreaterThan(0);
    });
  });
});
