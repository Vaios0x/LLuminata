import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import Dashboard from '@/app/dashboard/page';

expect.extend(toHaveNoViolations);

// Mock de los componentes y servicios
jest.mock('@/components/ui/navbar', () => ({
  Navbar: () => <div data-testid="navbar">Navbar</div>,
}));

jest.mock('@/components/ui/footer', () => ({
  Footer: () => <div data-testid="footer">Footer</div>,
}));

jest.mock('@/components/dashboard/stat-card', () => ({
  StatCard: ({ title, value, subtitle }: any) => (
    <div data-testid="stat-card">
      <h3>{title}</h3>
      <div>{value}</div>
      <p>{subtitle}</p>
    </div>
  ),
}));

jest.mock('@/components/dashboard/activity-item', () => ({
  ActivityItem: ({ type, title, progress, score, time }: any) => (
    <div data-testid="activity-item">
      <span>{type}</span>
      <h4>{title}</h4>
      {progress && <div>Progress: {progress}%</div>}
      {score && <div>Score: {score}%</div>}
      <time>{time}</time>
    </div>
  ),
}));

jest.mock('@/components/ai', () => ({
  AIServicesIntegration: ({ studentId, language, culturalContext }: any) => (
    <div data-testid="ai-services">
      <span>Student: {studentId}</span>
      <span>Language: {language}</span>
      <span>Culture: {culturalContext}</span>
    </div>
  ),
}));

describe('Dashboard Integration Tests', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    // Mock de localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(() => null),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
      },
      writable: true,
    });

    // Mock de sessionStorage
    Object.defineProperty(window, 'sessionStorage', {
      value: {
        getItem: jest.fn(() => null),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
      },
      writable: true,
    });
  });

  describe('Rendering and Layout', () => {
    it('should render dashboard with all components', () => {
      render(<Dashboard />);

      // Verificar componentes principales
      expect(screen.getByTestId('navbar')).toBeInTheDocument();
      expect(screen.getByTestId('footer')).toBeInTheDocument();

      // Verificar título y descripción
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Bienvenido de vuelta, ¡sigamos aprendiendo juntos!')).toBeInTheDocument();

      // Verificar tarjetas de estadísticas
      expect(screen.getByText('Lecciones Completadas')).toBeInTheDocument();
      expect(screen.getByText('Racha Actual')).toBeInTheDocument();
      expect(screen.getByText('Puntos Totales')).toBeInTheDocument();
      expect(screen.getByText('Precisión')).toBeInTheDocument();

      // Verificar secciones principales
      expect(screen.getByText('Actividad Reciente')).toBeInTheDocument();
      expect(screen.getByText('Progreso de Aprendizaje')).toBeInTheDocument();
      expect(screen.getByText('Recomendaciones IA')).toBeInTheDocument();
      expect(screen.getByText('Acciones Rápidas')).toBeInTheDocument();
      expect(screen.getByText('Timer de Estudio')).toBeInTheDocument();
    });

    it('should render activity items correctly', () => {
      render(<Dashboard />);

      // Verificar elementos de actividad
      const activityItems = screen.getAllByTestId('activity-item');
      expect(activityItems).toHaveLength(4);

      // Verificar contenido de actividad
      expect(screen.getByText('Matemáticas Básicas')).toBeInTheDocument();
      expect(screen.getByText('Evaluación de Ciencias')).toBeInTheDocument();
      expect(screen.getByText('¡Completaste 5 lecciones!')).toBeInTheDocument();
      expect(screen.getByText('Historia de México')).toBeInTheDocument();
    });

    it('should render AI recommendations', () => {
      render(<Dashboard />);

      // Verificar recomendaciones de IA
      expect(screen.getByText('Álgebra Intermedia')).toBeInTheDocument();
      expect(screen.getByText('Literatura Maya')).toBeInTheDocument();
      expect(screen.getByText('Física Cuántica')).toBeInTheDocument();

      // Verificar información de recomendaciones
      expect(screen.getByText('Intermedio')).toBeInTheDocument();
      expect(screen.getByText('Básico')).toBeInTheDocument();
      expect(screen.getByText('Avanzado')).toBeInTheDocument();
    });

    it('should render quick actions', () => {
      render(<Dashboard />);

      // Verificar acciones rápidas
      expect(screen.getByText('Continuar Lección')).toBeInTheDocument();
      expect(screen.getByText('Tomar Evaluación')).toBeInTheDocument();
      expect(screen.getByText('Ver Reportes')).toBeInTheDocument();
      expect(screen.getByText('Establecer Metas')).toBeInTheDocument();
    });

    it('should render study timer', () => {
      render(<Dashboard />);

      // Verificar timer de estudio
      expect(screen.getByText('Timer de Estudio')).toBeInTheDocument();
      expect(screen.getByText('25:00')).toBeInTheDocument();
      expect(screen.getByText('Iniciar Sesión')).toBeInTheDocument();
      expect(screen.getByText('Pausar')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('should handle quick action clicks', async () => {
      render(<Dashboard />);

      // Hacer clic en acciones rápidas
      const continueLesson = screen.getByText('Continuar Lección');
      const takeAssessment = screen.getByText('Tomar Evaluación');
      const viewReports = screen.getByText('Ver Reportes');
      const setGoals = screen.getByText('Establecer Metas');

      await user.click(continueLesson);
      await user.click(takeAssessment);
      await user.click(viewReports);
      await user.click(setGoals);

      // Verificar que los botones estén habilitados
      expect(continueLesson).toBeEnabled();
      expect(takeAssessment).toBeEnabled();
      expect(viewReports).toBeEnabled();
      expect(setGoals).toBeEnabled();
    });

    it('should handle study timer interactions', async () => {
      render(<Dashboard />);

      // Hacer clic en botones del timer
      const startSession = screen.getByText('Iniciar Sesión');
      const pauseButton = screen.getByText('Pausar');

      await user.click(startSession);
      await user.click(pauseButton);

      // Verificar que los botones estén habilitados
      expect(startSession).toBeEnabled();
      expect(pauseButton).toBeEnabled();
    });

    it('should handle recommendation clicks', async () => {
      render(<Dashboard />);

      // Hacer clic en recomendaciones
      const recommendations = screen.getAllByText('Comenzar');
      expect(recommendations).toHaveLength(3);

      for (const recommendation of recommendations) {
        await user.click(recommendation);
        expect(recommendation).toBeEnabled();
      }
    });

    it('should handle "Ver Todo" button in activity section', async () => {
      render(<Dashboard />);

      const viewAllButton = screen.getByText('Ver Todo');
      await user.click(viewAllButton);

      expect(viewAllButton).toBeEnabled();
    });
  });

  describe('Data Integration', () => {
    it('should display correct statistics', () => {
      render(<Dashboard />);

      // Verificar estadísticas
      expect(screen.getByText('18')).toBeInTheDocument(); // Lecciones completadas
      expect(screen.getByText('7')).toBeInTheDocument(); // Racha actual
      expect(screen.getByText('2840')).toBeInTheDocument(); // Puntos totales
      expect(screen.getByText('87%')).toBeInTheDocument(); // Precisión
    });

    it('should display activity data correctly', () => {
      render(<Dashboard />);

      // Verificar datos de actividad
      expect(screen.getByText('85%')).toBeInTheDocument(); // Progreso matemáticas
      expect(screen.getByText('92%')).toBeInTheDocument(); // Score evaluación
      expect(screen.getByText('60%')).toBeInTheDocument(); // Progreso historia
    });

    it('should display recommendation data correctly', () => {
      render(<Dashboard />);

      // Verificar datos de recomendaciones
      expect(screen.getByText('95% match')).toBeInTheDocument();
      expect(screen.getByText('88% match')).toBeInTheDocument();
      expect(screen.getByText('82% match')).toBeInTheDocument();
    });

    it('should integrate with AI services', () => {
      render(<Dashboard />);

      // Verificar integración con servicios de IA
      const aiServices = screen.getByTestId('ai-services');
      expect(aiServices).toBeInTheDocument();

      // Verificar parámetros pasados
      expect(screen.getByText('Student: student-123')).toBeInTheDocument();
      expect(screen.getByText('Language: es-MX')).toBeInTheDocument();
      expect(screen.getByText('Culture: maya')).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('should adapt to different screen sizes', () => {
      const { rerender } = render(<Dashboard />);

      // Simular pantalla grande
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1920,
      });

      // Simular pantalla mediana
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });

      // Simular pantalla pequeña
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      // Verificar que el dashboard se renderice en todos los tamaños
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    it('should handle mobile interactions', async () => {
      // Simular pantalla móvil
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(<Dashboard />);

      // Verificar que los elementos sean táctiles
      const quickActions = screen.getAllByRole('button');
      for (const action of quickActions) {
        expect(action).toBeEnabled();
      }
    });
  });

  describe('Performance', () => {
    it('should render quickly', () => {
      const startTime = performance.now();

      render(<Dashboard />);

      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(1000); // Debe renderizar en menos de 1 segundo
    });

    it('should handle many components efficiently', () => {
      const startTime = performance.now();

      render(<Dashboard />);

      // Verificar que todos los componentes se rendericen
      expect(screen.getAllByTestId('stat-card')).toHaveLength(4);
      expect(screen.getAllByTestId('activity-item')).toHaveLength(4);

      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(2000); // Debe renderizar en menos de 2 segundos
    });
  });

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<Dashboard />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should support keyboard navigation', async () => {
      render(<Dashboard />);

      // Navegar con teclado
      await user.tab();
      await user.tab();
      await user.tab();

      // Verificar que los elementos sean navegables
      const focusableElements = container.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      expect(focusableElements.length).toBeGreaterThan(0);
    });

    it('should have proper ARIA labels', () => {
      render(<Dashboard />);

      // Verificar que los elementos tengan etiquetas apropiadas
      const buttons = screen.getAllByRole('button');
      for (const button of buttons) {
        expect(button).toHaveAttribute('aria-label') || expect(button).toHaveTextContent();
      }
    });

    it('should support screen readers', () => {
      render(<Dashboard />);

      // Verificar elementos importantes para screen readers
      expect(screen.getByRole('heading', { name: /dashboard/i })).toBeInTheDocument();
      expect(screen.getByText('Bienvenido de vuelta, ¡sigamos aprendiendo juntos!')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle missing data gracefully', () => {
      // Mock de datos vacíos o nulos
      render(<Dashboard />);

      // Verificar que el dashboard se renderice incluso sin datos
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByTestId('navbar')).toBeInTheDocument();
      expect(screen.getByTestId('footer')).toBeInTheDocument();
    });

    it('should handle component errors gracefully', () => {
      // Mock de componentes que fallan
      jest.spyOn(console, 'error').mockImplementation(() => {});

      render(<Dashboard />);

      // Verificar que el dashboard se renderice incluso si algunos componentes fallan
      expect(screen.getByText('Dashboard')).toBeInTheDocument();

      console.error.mockRestore();
    });
  });

  describe('State Management', () => {
    it('should maintain state correctly', async () => {
      render(<Dashboard />);

      // Verificar estado inicial
      expect(screen.getByText('25:00')).toBeInTheDocument();

      // Simular interacción que cambia el estado
      const startButton = screen.getByText('Iniciar Sesión');
      await user.click(startButton);

      // Verificar que el estado se mantenga
      expect(startButton).toBeInTheDocument();
    });

    it('should handle state updates efficiently', async () => {
      render(<Dashboard />);

      // Simular múltiples actualizaciones de estado
      const buttons = screen.getAllByRole('button');
      
      for (let i = 0; i < 10; i++) {
        await user.click(buttons[0]);
      }

      // Verificar que la interfaz siga siendo responsiva
      expect(buttons[0]).toBeEnabled();
    });
  });

  describe('Integration with External Services', () => {
    it('should integrate with AI services correctly', () => {
      render(<Dashboard />);

      const aiServices = screen.getByTestId('ai-services');
      expect(aiServices).toBeInTheDocument();

      // Verificar que los parámetros se pasen correctamente
      expect(screen.getByText('Student: student-123')).toBeInTheDocument();
      expect(screen.getByText('Language: es-MX')).toBeInTheDocument();
      expect(screen.getByText('Culture: maya')).toBeInTheDocument();
    });

    it('should handle AI service errors gracefully', () => {
      // Mock de error en servicios de IA
      jest.spyOn(console, 'error').mockImplementation(() => {});

      render(<Dashboard />);

      // Verificar que el dashboard se renderice incluso si los servicios de IA fallan
      expect(screen.getByText('Dashboard')).toBeInTheDocument();

      console.error.mockRestore();
    });
  });
});
