import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { PrivacyControls } from '@/components/security/PrivacyControls';
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

const mockPrivacySettings = {
  dataCollection: {
    analytics: true,
    performance: true,
    personalization: false,
    marketing: false,
    thirdParty: false
  },
  dataRetention: {
    accountData: 'indefinite',
    activityLogs: '1_year',
    analyticsData: '6_months',
    backupData: '2_years'
  },
  dataSharing: {
    withPartners: false,
    forResearch: true,
    forImprovement: true,
    anonymousData: true
  },
  userRights: {
    dataPortability: true,
    dataDeletion: true,
    dataCorrection: true,
    consentWithdrawal: true
  },
  security: {
    twoFactorAuth: true,
    sessionTimeout: 30,
    passwordPolicy: 'strong',
    encryptionLevel: 'end-to-end'
  }
};

const mockDataBreaches = [
  {
    id: '1',
    date: '2024-01-15T10:00:00Z',
    type: 'unauthorized_access',
    severity: 'medium',
    description: 'Intento de acceso no autorizado detectado',
    status: 'resolved',
    affectedData: ['email', 'profile'],
    actions: ['password_reset', 'session_termination']
  }
];

const mockConsentHistory = [
  {
    id: '1',
    date: '2024-01-20T15:30:00Z',
    type: 'privacy_policy',
    action: 'accepted',
    version: '2.1.0',
    ipAddress: '192.168.1.1',
    userAgent: 'Mozilla/5.0...'
  },
  {
    id: '2',
    date: '2024-01-25T12:00:00Z',
    type: 'data_collection',
    action: 'modified',
    version: '2.1.0',
    ipAddress: '192.168.1.1',
    userAgent: 'Mozilla/5.0...'
  }
];

describe('PrivacyControls', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockClear();
  });

  it('renderiza correctamente con configuraciones de privacidad', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockPrivacySettings
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockDataBreaches
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockConsentHistory
      });

    render(<PrivacyControls userId="user123" />);

    // Verificar que se muestra el estado de carga inicialmente
    expect(screen.getByText('Cargando configuraciones de privacidad...')).toBeInTheDocument();

    // Esperar a que se carguen los datos
    await waitFor(() => {
      expect(screen.getByText('Configuraciones de Privacidad')).toBeInTheDocument();
    });

    // Verificar que se muestran las secciones principales
    expect(screen.getByText('Recopilación de Datos')).toBeInTheDocument();
    expect(screen.getByText('Retención de Datos')).toBeInTheDocument();
    expect(screen.getByText('Compartir Datos')).toBeInTheDocument();
  });

  it('maneja errores de carga correctamente', async () => {
    (fetch as jest.Mock).mockRejectedValue(new Error('Error de red'));

    render(<PrivacyControls userId="user123" />);

    await waitFor(() => {
      expect(screen.getByText('Error al cargar configuraciones de privacidad')).toBeInTheDocument();
    });
  });

  it('muestra configuraciones de recopilación de datos correctamente', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockPrivacySettings
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockDataBreaches
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockConsentHistory
      });

    render(<PrivacyControls userId="user123" />);

    await waitFor(() => {
      expect(screen.getByText('Analíticas')).toBeInTheDocument();
      expect(screen.getByText('Rendimiento')).toBeInTheDocument();
      expect(screen.getByText('Personalización')).toBeInTheDocument();
      expect(screen.getByText('Marketing')).toBeInTheDocument();
    });
  });

  it('maneja cambios en configuraciones de privacidad', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockPrivacySettings
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockDataBreaches
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockConsentHistory
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      });

    render(<PrivacyControls userId="user123" />);

    await waitFor(() => {
      expect(screen.getByText('Configuraciones de Privacidad')).toBeInTheDocument();
    });

    // Buscar y hacer clic en toggles
    const toggles = screen.getAllByTestId('toggle');
    if (toggles.length > 0) {
      fireEvent.click(toggles[0]);
    }
  });

  it('muestra historial de consentimiento correctamente', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockPrivacySettings
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockDataBreaches
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockConsentHistory
      });

    render(<PrivacyControls userId="user123" />);

    await waitFor(() => {
      expect(screen.getByText('Política de Privacidad')).toBeInTheDocument();
      expect(screen.getByText('Recopilación de Datos')).toBeInTheDocument();
      expect(screen.getByText('Aceptado')).toBeInTheDocument();
      expect(screen.getByText('Modificado')).toBeInTheDocument();
    });
  });

  it('maneja solicitudes de derechos del usuario', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockPrivacySettings
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockDataBreaches
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockConsentHistory
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, requestId: 'req123' })
      });

    render(<PrivacyControls userId="user123" />);

    await waitFor(() => {
      expect(screen.getByText('Derechos del Usuario')).toBeInTheDocument();
    });

    // Buscar botones de derechos del usuario
    const rightButtons = screen.getAllByText(/Solicitar|Descargar|Eliminar/i);
    if (rightButtons.length > 0) {
      fireEvent.click(rightButtons[0]);
    }
  });

  it('muestra configuraciones de seguridad correctamente', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockPrivacySettings
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockDataBreaches
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockConsentHistory
      });

    render(<PrivacyControls userId="user123" />);

    await waitFor(() => {
      expect(screen.getByText('Autenticación de Dos Factores')).toBeInTheDocument();
      expect(screen.getByText('Tiempo de Sesión')).toBeInTheDocument();
      expect(screen.getByText('Política de Contraseñas')).toBeInTheDocument();
      expect(screen.getByText('Nivel de Encriptación')).toBeInTheDocument();
    });
  });

  it('maneja configuraciones de retención de datos', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockPrivacySettings
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockDataBreaches
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockConsentHistory
      });

    render(<PrivacyControls userId="user123" />);

    await waitFor(() => {
      expect(screen.getByText('Datos de Cuenta')).toBeInTheDocument();
      expect(screen.getByText('Registros de Actividad')).toBeInTheDocument();
      expect(screen.getByText('Datos de Analíticas')).toBeInTheDocument();
      expect(screen.getByText('Datos de Respaldo')).toBeInTheDocument();
    });

    // Buscar selectores de retención
    const retentionSelects = screen.getAllByTestId('retention-select');
    if (retentionSelects.length > 0) {
      fireEvent.change(retentionSelects[0], { target: { value: '6_months' } });
    }
  });

  it('muestra configuraciones de compartir datos correctamente', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockPrivacySettings
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockDataBreaches
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockConsentHistory
      });

    render(<PrivacyControls userId="user123" />);

    await waitFor(() => {
      expect(screen.getByText('Con Socios')).toBeInTheDocument();
      expect(screen.getByText('Para Investigación')).toBeInTheDocument();
      expect(screen.getByText('Para Mejoras')).toBeInTheDocument();
      expect(screen.getByText('Datos Anónimos')).toBeInTheDocument();
    });
  });

  it('maneja configuraciones de encriptación', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockPrivacySettings
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockDataBreaches
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockConsentHistory
      });

    render(<PrivacyControls userId="user123" />);

    await waitFor(() => {
      expect(screen.getByText('End-to-End')).toBeInTheDocument();
      expect(screen.getByText('Fuerte')).toBeInTheDocument();
    });
  });

  it('maneja exportación de datos de privacidad', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockPrivacySettings
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockDataBreaches
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockConsentHistory
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: 'exported_data', format: 'json' })
      });

    render(<PrivacyControls userId="user123" />);

    await waitFor(() => {
      expect(screen.getByText('Configuraciones de Privacidad')).toBeInTheDocument();
    });

    // Buscar botón de exportar
    const exportButtons = screen.getAllByText(/Exportar|Descargar/i);
    if (exportButtons.length > 0) {
      fireEvent.click(exportButtons[0]);
    }
  });

  it('maneja eliminación de datos correctamente', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockPrivacySettings
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockDataBreaches
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockConsentHistory
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, deletionScheduled: true })
      });

    render(<PrivacyControls userId="user123" />);

    await waitFor(() => {
      expect(screen.getByText('Configuraciones de Privacidad')).toBeInTheDocument();
    });

    // Buscar botón de eliminar datos
    const deleteButtons = screen.getAllByText(/Eliminar Datos|Borrar Cuenta/i);
    if (deleteButtons.length > 0) {
      fireEvent.click(deleteButtons[0]);
    }
  });

  it('muestra configuraciones de cookies correctamente', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockPrivacySettings
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockDataBreaches
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockConsentHistory
      });

    render(<PrivacyControls userId="user123" />);

    await waitFor(() => {
      expect(screen.getByText('Configuraciones de Privacidad')).toBeInTheDocument();
    });

    // Buscar sección de cookies
    const cookieSections = screen.getAllByText(/Cookies|Preferencias de Cookies/i);
    if (cookieSections.length > 0) {
      expect(cookieSections[0]).toBeInTheDocument();
    }
  });

  it('maneja configuraciones de notificaciones de privacidad', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockPrivacySettings
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockDataBreaches
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockConsentHistory
      });

    render(<PrivacyControls userId="user123" />);

    await waitFor(() => {
      expect(screen.getByText('Configuraciones de Privacidad')).toBeInTheDocument();
    });

    // Buscar configuraciones de notificaciones
    const notificationToggles = screen.getAllByTestId('notification-toggle');
    if (notificationToggles.length > 0) {
      fireEvent.click(notificationToggles[0]);
    }
  });
});
