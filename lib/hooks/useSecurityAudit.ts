import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { SecurityService } from '../security';

interface SecurityVulnerability {
  id: string;
  type: 'XSS' | 'CSRF' | 'SQL_INJECTION' | 'AUTHENTICATION' | 'AUTHORIZATION' | 'DATA_EXPOSURE' | 'CONFIGURATION';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  title: string;
  description: string;
  location: string;
  impact: string;
  recommendation: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'FALSE_POSITIVE';
  discoveredAt: Date;
  resolvedAt?: Date;
  cveId?: string;
  cvssScore?: number;
}

interface SecurityAuditState {
  vulnerabilities: SecurityVulnerability[];
  securityScore: number;
  lastAudit: Date | null;
  auditHistory: {
    id: string;
    timestamp: Date;
    vulnerabilitiesFound: number;
    securityScore: number;
    duration: number;
    status: 'RUNNING' | 'COMPLETED' | 'FAILED';
  }[];
  complianceStatus: {
    gdpr: boolean;
    hipaa: boolean;
    ferpa: boolean;
    sox: boolean;
    pci: boolean;
  };
  securityMetrics: {
    totalVulnerabilities: number;
    criticalVulnerabilities: number;
    highVulnerabilities: number;
    mediumVulnerabilities: number;
    lowVulnerabilities: number;
    resolvedVulnerabilities: number;
    averageResolutionTime: number;
  };
}

interface SecurityAuditActions {
  runSecurityAudit: (scope?: 'full' | 'quick' | 'targeted') => Promise<SecurityVulnerability[]>;
  scanForVulnerabilities: (target: string) => Promise<SecurityVulnerability[]>;
  validateCompliance: (standard: 'gdpr' | 'hipaa' | 'ferpa' | 'sox' | 'pci') => Promise<boolean>;
  resolveVulnerability: (vulnerabilityId: string, resolution: string) => Promise<void>;
  exportAuditReport: (format: 'pdf' | 'json' | 'csv') => Promise<string>;
  scheduleAudit: (schedule: 'daily' | 'weekly' | 'monthly') => Promise<void>;
  getSecurityRecommendations: () => Promise<string[]>;
  monitorSecurityEvents: () => Promise<any[]>;
}

export function useSecurityAudit() {
  const { user } = useAuth();
  const [securityService] = useState(() => new SecurityService());
  const [state, setState] = useState<SecurityAuditState>({
    vulnerabilities: [],
    securityScore: 100,
    lastAudit: null,
    auditHistory: [],
    complianceStatus: {
      gdpr: false,
      hipaa: false,
      ferpa: false,
      sox: false,
      pci: false,
    },
    securityMetrics: {
      totalVulnerabilities: 0,
      criticalVulnerabilities: 0,
      highVulnerabilities: 0,
      mediumVulnerabilities: 0,
      lowVulnerabilities: 0,
      resolvedVulnerabilities: 0,
      averageResolutionTime: 0,
    },
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

  // Cargar datos de auditoría existentes
  useEffect(() => {
    const loadExistingAuditData = async () => {
      if (!user || !securityService.isReady()) return;

      try {
        setLoading(true);
        
        // Cargar vulnerabilidades existentes
        const vulnerabilities = await securityService.getVulnerabilities();
        
        // Cargar historial de auditorías
        const auditHistory = await securityService.getAuditHistory();
        
        // Cargar estado de cumplimiento
        const complianceStatus = await securityService.getComplianceStatus();
        
        // Calcular métricas
        const metrics = calculateSecurityMetrics(vulnerabilities);
        
        setState(prev => ({
          ...prev,
          vulnerabilities,
          auditHistory,
          complianceStatus,
          securityMetrics: metrics,
          securityScore: calculateSecurityScore(vulnerabilities),
          lastAudit: auditHistory.length > 0 ? auditHistory[0].timestamp : null,
        }));
      } catch (err) {
        console.error('Error cargando datos de auditoría:', err);
      } finally {
        setLoading(false);
      }
    };

    loadExistingAuditData();
  }, [user, securityService]);

  // Ejecutar auditoría de seguridad
  const runSecurityAudit = useCallback(async (
    scope: 'full' | 'quick' | 'targeted' = 'quick'
  ): Promise<SecurityVulnerability[]> => {
    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    try {
      setLoading(true);
      setError(null);

      const auditId = `audit_${Date.now()}`;
      const startTime = Date.now();

      // Agregar auditoría al historial
      setState(prev => ({
        ...prev,
        auditHistory: [
          {
            id: auditId,
            timestamp: new Date(),
            vulnerabilitiesFound: 0,
            securityScore: 100,
            duration: 0,
            status: 'RUNNING',
          },
          ...prev.auditHistory,
        ],
      }));

      const vulnerabilities = await securityService.runSecurityAudit(scope);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      const securityScore = calculateSecurityScore(vulnerabilities);

      // Actualizar estado
      setState(prev => ({
        ...prev,
        vulnerabilities,
        securityScore,
        lastAudit: new Date(),
        securityMetrics: calculateSecurityMetrics(vulnerabilities),
        auditHistory: prev.auditHistory.map(audit => 
          audit.id === auditId
            ? {
                ...audit,
                vulnerabilitiesFound: vulnerabilities.length,
                securityScore,
                duration,
                status: 'COMPLETED',
              }
            : audit
        ),
      }));

      return vulnerabilities;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error ejecutando auditoría de seguridad';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user, securityService]);

  // Escanear vulnerabilidades específicas
  const scanForVulnerabilities = useCallback(async (target: string): Promise<SecurityVulnerability[]> => {
    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    try {
      setLoading(true);
      setError(null);

      const vulnerabilities = await securityService.scanTarget(target);
      
      // Agregar nuevas vulnerabilidades al estado
      setState(prev => ({
        ...prev,
        vulnerabilities: [...prev.vulnerabilities, ...vulnerabilities],
        securityMetrics: calculateSecurityMetrics([...prev.vulnerabilities, ...vulnerabilities]),
      }));

      return vulnerabilities;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error escaneando vulnerabilidades';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user, securityService]);

  // Validar cumplimiento
  const validateCompliance = useCallback(async (
    standard: 'gdpr' | 'hipaa' | 'ferpa' | 'sox' | 'pci'
  ): Promise<boolean> => {
    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    try {
      setLoading(true);
      setError(null);

      const isCompliant = await securityService.validateCompliance(standard);
      
      setState(prev => ({
        ...prev,
        complianceStatus: {
          ...prev.complianceStatus,
          [standard]: isCompliant,
        },
      }));

      return isCompliant;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error validando cumplimiento';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user, securityService]);

  // Resolver vulnerabilidad
  const resolveVulnerability = useCallback(async (
    vulnerabilityId: string, 
    resolution: string
  ): Promise<void> => {
    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    try {
      setLoading(true);
      setError(null);

      await securityService.resolveVulnerability(vulnerabilityId, resolution);
      
      // Actualizar estado local
      setState(prev => ({
        ...prev,
        vulnerabilities: prev.vulnerabilities.map(vuln => 
          vuln.id === vulnerabilityId
            ? { ...vuln, status: 'RESOLVED', resolvedAt: new Date() }
            : vuln
        ),
        securityMetrics: calculateSecurityMetrics(
          prev.vulnerabilities.map(vuln => 
            vuln.id === vulnerabilityId
              ? { ...vuln, status: 'RESOLVED', resolvedAt: new Date() }
              : vuln
          )
        ),
      }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error resolviendo vulnerabilidad';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user, securityService]);

  // Exportar reporte de auditoría
  const exportAuditReport = useCallback(async (format: 'pdf' | 'json' | 'csv'): Promise<string> => {
    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    try {
      setLoading(true);
      setError(null);

      const reportData = {
        userId: user.id,
        vulnerabilities: state.vulnerabilities,
        securityScore: state.securityScore,
        auditHistory: state.auditHistory,
        complianceStatus: state.complianceStatus,
        securityMetrics: state.securityMetrics,
        lastAudit: state.lastAudit,
      };

      const result = await securityService.exportAuditReport(reportData, format);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error exportando reporte de auditoría';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user, securityService, state]);

  // Programar auditoría
  const scheduleAudit = useCallback(async (schedule: 'daily' | 'weekly' | 'monthly'): Promise<void> => {
    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    try {
      setLoading(true);
      setError(null);

      await securityService.scheduleAudit(schedule);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error programando auditoría';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user, securityService]);

  // Obtener recomendaciones de seguridad
  const getSecurityRecommendations = useCallback(async (): Promise<string[]> => {
    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    try {
      setLoading(true);
      setError(null);

      const recommendations = await securityService.getSecurityRecommendations(state.vulnerabilities);
      return recommendations;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error obteniendo recomendaciones';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user, securityService, state.vulnerabilities]);

  // Monitorear eventos de seguridad
  const monitorSecurityEvents = useCallback(async (): Promise<any[]> => {
    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    try {
      setLoading(true);
      setError(null);

      const events = await securityService.monitorSecurityEvents();
      return events;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error monitoreando eventos de seguridad';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user, securityService]);

  // Funciones helper para cálculos
  const calculateSecurityScore = useCallback((vulnerabilities: SecurityVulnerability[]): number => {
    if (vulnerabilities.length === 0) return 100;

    const weights = {
      CRITICAL: 10,
      HIGH: 7,
      MEDIUM: 4,
      LOW: 1,
    };

    const totalWeight = vulnerabilities.reduce((sum, vuln) => {
      return sum + weights[vuln.severity];
    }, 0);

    const maxPossibleWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
    const score = Math.max(0, 100 - (totalWeight / maxPossibleWeight) * 100);

    return Math.round(score);
  }, []);

  const calculateSecurityMetrics = useCallback((vulnerabilities: SecurityVulnerability[]): SecurityAuditState['securityMetrics'] => {
    const total = vulnerabilities.length;
    const critical = vulnerabilities.filter(v => v.severity === 'CRITICAL').length;
    const high = vulnerabilities.filter(v => v.severity === 'HIGH').length;
    const medium = vulnerabilities.filter(v => v.severity === 'MEDIUM').length;
    const low = vulnerabilities.filter(v => v.severity === 'LOW').length;
    const resolved = vulnerabilities.filter(v => v.status === 'RESOLVED').length;

    const resolvedVulns = vulnerabilities.filter(v => v.status === 'RESOLVED' && v.resolvedAt);
    const averageResolutionTime = resolvedVulns.length > 0
      ? resolvedVulns.reduce((sum, vuln) => {
          const resolutionTime = vuln.resolvedAt!.getTime() - vuln.discoveredAt.getTime();
          return sum + resolutionTime;
        }, 0) / resolvedVulns.length / (1000 * 60 * 60 * 24) // Convertir a días
      : 0;

    return {
      totalVulnerabilities: total,
      criticalVulnerabilities: critical,
      highVulnerabilities: high,
      mediumVulnerabilities: medium,
      lowVulnerabilities: low,
      resolvedVulnerabilities: resolved,
      averageResolutionTime: Math.round(averageResolutionTime * 100) / 100,
    };
  }, []);

  return {
    // Estado
    ...state,
    loading,
    error,
    
    // Acciones
    runSecurityAudit,
    scanForVulnerabilities,
    validateCompliance,
    resolveVulnerability,
    exportAuditReport,
    scheduleAudit,
    getSecurityRecommendations,
    monitorSecurityEvents,
  };
}
