import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { SecurityService } from '../security';

interface PrivacySettings {
  dataCollection: {
    analytics: boolean;
    personalization: boolean;
    marketing: boolean;
    thirdParty: boolean;
  };
  dataSharing: {
    withTeachers: boolean;
    withResearchers: boolean;
    withPartners: boolean;
    anonymized: boolean;
  };
  dataRetention: {
    duration: number; // días
    autoDelete: boolean;
    deleteOnLogout: boolean;
  };
  consentHistory: {
    timestamp: Date;
    setting: string;
    value: boolean;
    ip: string;
    userAgent: string;
  }[];
}

interface PrivacyState {
  settings: PrivacySettings;
  consentStatus: {
    gdpr: boolean;
    ccpa: boolean;
    coppa: boolean;
    ferpa: boolean;
  };
  dataRequests: {
    id: string;
    type: 'access' | 'deletion' | 'portability' | 'correction';
    status: 'pending' | 'processing' | 'completed' | 'rejected';
    requestedAt: Date;
    completedAt?: Date;
    description: string;
  }[];
  privacyEvents: {
    id: string;
    type: 'consent_change' | 'data_access' | 'data_deletion' | 'policy_update';
    timestamp: Date;
    details: any;
  }[];
}

interface PrivacyControlsActions {
  updatePrivacySettings: (settings: Partial<PrivacySettings>) => Promise<void>;
  requestDataAccess: (description: string) => Promise<string>;
  requestDataDeletion: (description: string) => Promise<string>;
  requestDataPortability: (description: string) => Promise<string>;
  requestDataCorrection: (field: string, newValue: any, description: string) => Promise<string>;
  getDataRequestStatus: (requestId: string) => Promise<any>;
  exportPrivacyData: (format: 'json' | 'csv' | 'pdf') => Promise<string>;
  revokeConsent: (consentType: string) => Promise<void>;
  getPrivacyReport: () => Promise<any>;
  anonymizeData: (dataType: string) => Promise<void>;
}

export function usePrivacyControls() {
  const { user } = useAuth();
  const [securityService] = useState(() => new SecurityService());
  const [state, setState] = useState<PrivacyState>({
    settings: {
      dataCollection: {
        analytics: true,
        personalization: true,
        marketing: false,
        thirdParty: false,
      },
      dataSharing: {
        withTeachers: true,
        withResearchers: false,
        withPartners: false,
        anonymized: true,
      },
      dataRetention: {
        duration: 365, // 1 año por defecto
        autoDelete: true,
        deleteOnLogout: false,
      },
      consentHistory: [],
    },
    consentStatus: {
      gdpr: false,
      ccpa: false,
      coppa: false,
      ferpa: false,
    },
    dataRequests: [],
    privacyEvents: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Inicializar servicio de seguridad
  useEffect(() => {
    const initializeSecurityService = async () => {
      try {
        setLoading(true);
        await securityService.initialize();
        setError(null);
      } catch (err) {
        setError('Error inicializando servicio de seguridad');
        console.error('Error inicializando servicio de seguridad:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      initializeSecurityService();
    }
  }, [user, securityService]);

  // Cargar configuración de privacidad existente
  useEffect(() => {
    const loadPrivacySettings = async () => {
      if (!user || !securityService.isReady()) return;

      try {
        setLoading(true);
        
        // Cargar configuración de privacidad
        const privacySettings = await securityService.getPrivacySettings(user.id);
        
        // Cargar estado de consentimiento
        const consentStatus = await securityService.getConsentStatus(user.id);
        
        // Cargar solicitudes de datos
        const dataRequests = await securityService.getDataRequests(user.id);
        
        // Cargar eventos de privacidad
        const privacyEvents = await securityService.getPrivacyEvents(user.id);
        
        if (privacySettings) {
          setState(prev => ({
            ...prev,
            settings: privacySettings,
            consentStatus,
            dataRequests,
            privacyEvents,
          }));
        }
      } catch (err) {
        console.error('Error cargando configuración de privacidad:', err);
      } finally {
        setLoading(false);
      }
    };

    loadPrivacySettings();
  }, [user, securityService]);

  // Actualizar configuración de privacidad
  const updatePrivacySettings = useCallback(async (settings: Partial<PrivacySettings>): Promise<void> => {
    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    try {
      setLoading(true);
      setError(null);

      await securityService.updatePrivacySettings(user.id, settings);
      
      // Registrar evento de cambio de consentimiento
      const consentEvent = {
        id: `consent_${Date.now()}`,
        type: 'consent_change' as const,
        timestamp: new Date(),
        details: {
          previousSettings: state.settings,
          newSettings: { ...state.settings, ...settings },
          ip: 'client-ip', // Se obtendría del contexto
          userAgent: navigator.userAgent,
        },
      };

      setState(prev => ({
        ...prev,
        settings: { ...prev.settings, ...settings },
        privacyEvents: [consentEvent, ...prev.privacyEvents],
        consentHistory: [
          {
            timestamp: new Date(),
            setting: Object.keys(settings).join(', '),
            value: true,
            ip: 'client-ip',
            userAgent: navigator.userAgent,
          },
          ...prev.settings.consentHistory,
        ],
      }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error actualizando configuración de privacidad';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user, securityService, state.settings]);

  // Solicitar acceso a datos
  const requestDataAccess = useCallback(async (description: string): Promise<string> => {
    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    try {
      setLoading(true);
      setError(null);

      const requestId = await securityService.requestDataAccess(user.id, description);
      
      const dataRequest = {
        id: requestId,
        type: 'access' as const,
        status: 'pending' as const,
        requestedAt: new Date(),
        description,
      };

      setState(prev => ({
        ...prev,
        dataRequests: [dataRequest, ...prev.dataRequests],
      }));

      return requestId;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error solicitando acceso a datos';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user, securityService]);

  // Solicitar eliminación de datos
  const requestDataDeletion = useCallback(async (description: string): Promise<string> => {
    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    try {
      setLoading(true);
      setError(null);

      const requestId = await securityService.requestDataDeletion(user.id, description);
      
      const dataRequest = {
        id: requestId,
        type: 'deletion' as const,
        status: 'pending' as const,
        requestedAt: new Date(),
        description,
      };

      setState(prev => ({
        ...prev,
        dataRequests: [dataRequest, ...prev.dataRequests],
      }));

      return requestId;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error solicitando eliminación de datos';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user, securityService]);

  // Solicitar portabilidad de datos
  const requestDataPortability = useCallback(async (description: string): Promise<string> => {
    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    try {
      setLoading(true);
      setError(null);

      const requestId = await securityService.requestDataPortability(user.id, description);
      
      const dataRequest = {
        id: requestId,
        type: 'portability' as const,
        status: 'pending' as const,
        requestedAt: new Date(),
        description,
      };

      setState(prev => ({
        ...prev,
        dataRequests: [dataRequest, ...prev.dataRequests],
      }));

      return requestId;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error solicitando portabilidad de datos';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user, securityService]);

  // Solicitar corrección de datos
  const requestDataCorrection = useCallback(async (
    field: string, 
    newValue: any, 
    description: string
  ): Promise<string> => {
    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    try {
      setLoading(true);
      setError(null);

      const requestId = await securityService.requestDataCorrection(user.id, field, newValue, description);
      
      const dataRequest = {
        id: requestId,
        type: 'correction' as const,
        status: 'pending' as const,
        requestedAt: new Date(),
        description: `${description} - Campo: ${field}`,
      };

      setState(prev => ({
        ...prev,
        dataRequests: [dataRequest, ...prev.dataRequests],
      }));

      return requestId;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error solicitando corrección de datos';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user, securityService]);

  // Obtener estado de solicitud de datos
  const getDataRequestStatus = useCallback(async (requestId: string): Promise<any> => {
    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    try {
      setLoading(true);
      setError(null);

      const status = await securityService.getDataRequestStatus(user.id, requestId);
      
      // Actualizar estado local
      setState(prev => ({
        ...prev,
        dataRequests: prev.dataRequests.map(request => 
          request.id === requestId
            ? { ...request, status: status.status, completedAt: status.completedAt }
            : request
        ),
      }));

      return status;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error obteniendo estado de solicitud';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user, securityService]);

  // Exportar datos de privacidad
  const exportPrivacyData = useCallback(async (format: 'json' | 'csv' | 'pdf'): Promise<string> => {
    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    try {
      setLoading(true);
      setError(null);

      const exportData = {
        userId: user.id,
        settings: state.settings,
        consentStatus: state.consentStatus,
        dataRequests: state.dataRequests,
        privacyEvents: state.privacyEvents,
      };

      const result = await securityService.exportPrivacyData(exportData, format);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error exportando datos de privacidad';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user, securityService, state]);

  // Revocar consentimiento
  const revokeConsent = useCallback(async (consentType: string): Promise<void> => {
    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    try {
      setLoading(true);
      setError(null);

      await securityService.revokeConsent(user.id, consentType);
      
      // Registrar evento de revocación
      const privacyEvent = {
        id: `revoke_${Date.now()}`,
        type: 'consent_change' as const,
        timestamp: new Date(),
        details: {
          consentType,
          action: 'revoked',
          ip: 'client-ip',
          userAgent: navigator.userAgent,
        },
      };

      setState(prev => ({
        ...prev,
        privacyEvents: [privacyEvent, ...prev.privacyEvents],
        consentHistory: [
          {
            timestamp: new Date(),
            setting: consentType,
            value: false,
            ip: 'client-ip',
            userAgent: navigator.userAgent,
          },
          ...prev.settings.consentHistory,
        ],
      }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error revocando consentimiento';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user, securityService]);

  // Obtener reporte de privacidad
  const getPrivacyReport = useCallback(async (): Promise<any> => {
    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    try {
      setLoading(true);
      setError(null);

      const report = await securityService.getPrivacyReport(user.id);
      return report;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error obteniendo reporte de privacidad';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user, securityService]);

  // Anonimizar datos
  const anonymizeData = useCallback(async (dataType: string): Promise<void> => {
    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    try {
      setLoading(true);
      setError(null);

      await securityService.anonymizeData(user.id, dataType);
      
      // Registrar evento de anonimización
      const privacyEvent = {
        id: `anonymize_${Date.now()}`,
        type: 'data_deletion' as const,
        timestamp: new Date(),
        details: {
          dataType,
          action: 'anonymized',
          ip: 'client-ip',
          userAgent: navigator.userAgent,
        },
      };

      setState(prev => ({
        ...prev,
        privacyEvents: [privacyEvent, ...prev.privacyEvents],
      }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error anonimizando datos';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user, securityService]);

  // Función helper para obtener estadísticas de privacidad
  const getPrivacyStats = useCallback(() => {
    const now = new Date();
    const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const monthlyEvents = state.privacyEvents.filter(
      event => event.timestamp > lastMonth
    ).length;

    const pendingRequests = state.dataRequests.filter(
      request => request.status === 'pending'
    ).length;

    const completedRequests = state.dataRequests.filter(
      request => request.status === 'completed'
    ).length;

    const consentChanges = state.settings.consentHistory.filter(
      consent => consent.timestamp > lastMonth
    ).length;

    return {
      totalEvents: state.privacyEvents.length,
      monthlyEvents,
      pendingRequests,
      completedRequests,
      consentChanges,
      dataRetentionDays: state.settings.dataRetention.duration,
      autoDeleteEnabled: state.settings.dataRetention.autoDelete,
      gdprCompliant: state.consentStatus.gdpr,
      ccpaCompliant: state.consentStatus.ccpa,
    };
  }, [state.privacyEvents, state.dataRequests, state.settings, state.consentStatus]);

  return {
    // Estado
    ...state,
    loading,
    error,
    
    // Acciones
    updatePrivacySettings,
    requestDataAccess,
    requestDataDeletion,
    requestDataPortability,
    requestDataCorrection,
    getDataRequestStatus,
    exportPrivacyData,
    revokeConsent,
    getPrivacyReport,
    anonymizeData,
    
    // Helpers
    getPrivacyStats,
  };
}
