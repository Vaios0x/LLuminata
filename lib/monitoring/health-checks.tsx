// Health Checks - InclusiveAI Coach

import { MONITORING_CONFIG } from './monitoring-config';
import { captureException, addBreadcrumb } from './error-tracking';

// Tipos para health checks
export interface HealthCheckResult {
  name: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime: number;
  lastChecked: Date;
  details?: Record<string, any>;
  error?: string;
}

export interface SystemHealth {
  overall: 'healthy' | 'degraded' | 'unhealthy';
  checks: HealthCheckResult[];
  timestamp: Date;
  uptime: number;
  version: string;
  environment: string;
}

export interface HealthCheck {
  name: string;
  check: () => Promise<HealthCheckResult>;
  interval?: number;
  timeout?: number;
  critical?: boolean;
}

export interface HealthChecker {
  init(): void;
  addCheck(check: HealthCheck): void;
  removeCheck(name: string): void;
  runCheck(name: string): Promise<HealthCheckResult>;
  runAllChecks(): Promise<SystemHealth>;
  getHealth(): SystemHealth | null;
  startMonitoring(): void;
  stopMonitoring(): void;
}

// Implementación del health checker
class HealthCheckerImpl implements HealthChecker {
  private checks: Map<string, HealthCheck> = new Map();
  private results: Map<string, HealthCheckResult> = new Map();
  private monitoringInterval?: NodeJS.Timeout;
  private isMonitoring = false;
  private startTime = Date.now();

  init(): void {
    if (!MONITORING_CONFIG.healthChecks.enabled) {
      return;
    }

    // Agregar checks por defecto
    this.addDefaultChecks();
    console.log('✅ Health checks inicializados');
  }

  private addDefaultChecks(): void {
    // Check de API
    this.addCheck({
      name: 'api',
      check: this.checkApiHealth.bind(this),
      interval: MONITORING_CONFIG.healthChecks.interval,
      timeout: MONITORING_CONFIG.healthChecks.timeout,
      critical: true,
    });

    // Check de base de datos
    this.addCheck({
      name: 'database',
      check: this.checkDatabaseHealth.bind(this),
      interval: MONITORING_CONFIG.healthChecks.interval,
      timeout: MONITORING_CONFIG.healthChecks.timeout,
      critical: true,
    });

    // Check de memoria
    this.addCheck({
      name: 'memory',
      check: this.checkMemoryHealth.bind(this),
      interval: MONITORING_CONFIG.healthChecks.interval,
      timeout: MONITORING_CONFIG.healthChecks.timeout,
      critical: false,
    });

    // Check de servicios externos
    this.addCheck({
      name: 'external',
      check: this.checkExternalServices.bind(this),
      interval: MONITORING_CONFIG.healthChecks.interval,
      timeout: MONITORING_CONFIG.healthChecks.timeout,
      critical: false,
    });
  }

  private async checkApiHealth(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    try {
      const response = await fetch(MONITORING_CONFIG.healthChecks.endpoints.api, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(MONITORING_CONFIG.healthChecks.timeout),
      });

      const responseTime = Date.now() - startTime;
      const isHealthy = response.ok && responseTime <= MONITORING_CONFIG.healthChecks.thresholds.responseTime;

      return {
        name: 'api',
        status: isHealthy ? 'healthy' : 'degraded',
        responseTime,
        lastChecked: new Date(),
        details: {
          statusCode: response.status,
          statusText: response.statusText,
        },
      };
    } catch (error) {
      return {
        name: 'api',
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        lastChecked: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private async checkDatabaseHealth(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    try {
      const response = await fetch(MONITORING_CONFIG.healthChecks.endpoints.database, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(MONITORING_CONFIG.healthChecks.timeout),
      });

      const responseTime = Date.now() - startTime;
      const data = await response.json();
      const isHealthy = response.ok && data.status === 'healthy';

      return {
        name: 'database',
        status: isHealthy ? 'healthy' : 'degraded',
        responseTime,
        lastChecked: new Date(),
        details: data,
      };
    } catch (error) {
      return {
        name: 'database',
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        lastChecked: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private async checkMemoryHealth(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    try {
      if (typeof process !== 'undefined') {
        const usage = process.memoryUsage();
        const memoryUsage = usage.heapUsed / usage.heapTotal;
        const isHealthy = memoryUsage <= MONITORING_CONFIG.healthChecks.thresholds.memoryUsage;

        return {
          name: 'memory',
          status: isHealthy ? 'healthy' : 'degraded',
          responseTime: Date.now() - startTime,
          lastChecked: new Date(),
          details: {
            heapUsed: Math.round(usage.heapUsed / 1024 / 1024),
            heapTotal: Math.round(usage.heapTotal / 1024 / 1024),
            memoryUsage: Math.round(memoryUsage * 100),
          },
        };
      }

      return {
        name: 'memory',
        status: 'healthy',
        responseTime: Date.now() - startTime,
        lastChecked: new Date(),
        details: { note: 'Memory check not available in browser' },
      };
    } catch (error) {
      return {
        name: 'memory',
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        lastChecked: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private async checkExternalServices(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    try {
      const response = await fetch(MONITORING_CONFIG.healthChecks.endpoints.external, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(MONITORING_CONFIG.healthChecks.timeout),
      });

      const responseTime = Date.now() - startTime;
      const data = await response.json();
      const isHealthy = response.ok && data.status === 'healthy';

      return {
        name: 'external',
        status: isHealthy ? 'healthy' : 'degraded',
        responseTime,
        lastChecked: new Date(),
        details: data,
      };
    } catch (error) {
      return {
        name: 'external',
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        lastChecked: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  addCheck(check: HealthCheck): void {
    this.checks.set(check.name, check);
  }

  removeCheck(name: string): void {
    this.checks.delete(name);
    this.results.delete(name);
  }

  async runCheck(name: string): Promise<HealthCheckResult> {
    const check = this.checks.get(name);
    if (!check) {
      throw new Error(`Health check '${name}' not found`);
    }

    try {
      const result = await check.check();
      this.results.set(name, result);
      
      // Log del resultado
      addBreadcrumb({
        message: `Health Check: ${name} - ${result.status}`,
        category: 'health-check',
        level: result.status === 'healthy' ? 'info' : 'warning',
      });

      return result;
    } catch (error) {
      const result: HealthCheckResult = {
        name,
        status: 'unhealthy',
        responseTime: 0,
        lastChecked: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error',
      };

      this.results.set(name, result);
      captureException(error as Error, { context: 'health-check', checkName: name });
      
      return result;
    }
  }

  async runAllChecks(): Promise<SystemHealth> {
    const checkPromises = Array.from(this.checks.keys()).map(name => this.runCheck(name));
    const results = await Promise.allSettled(checkPromises);
    
    const healthResults: HealthCheckResult[] = results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        const checkName = Array.from(this.checks.keys())[index];
        return {
          name: checkName,
          status: 'unhealthy',
          responseTime: 0,
          lastChecked: new Date(),
          error: result.reason?.message || 'Check failed',
        };
      }
    });

    // Determinar estado general
    const criticalChecks = healthResults.filter(result => {
      const check = this.checks.get(result.name);
      return check?.critical;
    });

    const hasUnhealthyCritical = criticalChecks.some(check => check.status === 'unhealthy');
    const hasDegradedChecks = healthResults.some(check => check.status === 'degraded');

    let overall: 'healthy' | 'degraded' | 'unhealthy';
    if (hasUnhealthyCritical) {
      overall = 'unhealthy';
    } else if (hasDegradedChecks) {
      overall = 'degraded';
    } else {
      overall = 'healthy';
    }

    const systemHealth: SystemHealth = {
      overall,
      checks: healthResults,
      timestamp: new Date(),
      uptime: Date.now() - this.startTime,
      version: MONITORING_CONFIG.version,
      environment: MONITORING_CONFIG.environment,
    };

    return systemHealth;
  }

  getHealth(): SystemHealth | null {
    if (this.results.size === 0) {
      return null;
    }

    const checks = Array.from(this.results.values());
    const criticalChecks = checks.filter(result => {
      const check = this.checks.get(result.name);
      return check?.critical;
    });

    const hasUnhealthyCritical = criticalChecks.some(check => check.status === 'unhealthy');
    const hasDegradedChecks = checks.some(check => check.status === 'degraded');

    let overall: 'healthy' | 'degraded' | 'unhealthy';
    if (hasUnhealthyCritical) {
      overall = 'unhealthy';
    } else if (hasDegradedChecks) {
      overall = 'degraded';
    } else {
      overall = 'healthy';
    }

    return {
      overall,
      checks,
      timestamp: new Date(),
      uptime: Date.now() - this.startTime,
      version: MONITORING_CONFIG.version,
      environment: MONITORING_CONFIG.environment,
    };
  }

  startMonitoring(): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.monitoringInterval = setInterval(async () => {
      try {
        await this.runAllChecks();
      } catch (error) {
        captureException(error as Error, { context: 'health-monitoring' });
      }
    }, MONITORING_CONFIG.healthChecks.interval);

    console.log('✅ Health monitoring iniciado');
  }

  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
    }
    this.isMonitoring = false;
    console.log('⏹️ Health monitoring detenido');
  }
}

// Instancia global
const healthChecker = new HealthCheckerImpl();

// Funciones de conveniencia
export function initHealthChecks(): void {
  healthChecker.init();
}

export function addHealthCheck(check: HealthCheck): void {
  healthChecker.addCheck(check);
}

export function removeHealthCheck(name: string): void {
  healthChecker.removeCheck(name);
}

export async function runHealthCheck(name: string): Promise<HealthCheckResult> {
  return await healthChecker.runCheck(name);
}

export async function runAllHealthChecks(): Promise<SystemHealth> {
  return await healthChecker.runAllChecks();
}

export function getSystemHealth(): SystemHealth | null {
  return healthChecker.getHealth();
}

export function startHealthMonitoring(): void {
  healthChecker.startMonitoring();
}

export function stopHealthMonitoring(): void {
  healthChecker.stopMonitoring();
}

// Hook para React
export function useHealthChecks() {
  const [health, setHealth] = React.useState<SystemHealth | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const runChecks = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const systemHealth = await runAllHealthChecks();
      setHealth(systemHealth);
    } catch (error) {
      captureException(error as Error, { context: 'health-checks-hook' });
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    initHealthChecks();
    runChecks();
    
    // Ejecutar checks periódicamente
    const interval = setInterval(runChecks, MONITORING_CONFIG.healthChecks.interval);
    
    return () => clearInterval(interval);
  }, [runChecks]);

  return {
    health,
    isLoading,
    runChecks,
    addHealthCheck,
    removeHealthCheck,
  };
}

// Componente de visualización de health status
export function HealthStatusDisplay({ 
  className,
  showDetails = false 
}: { 
  className?: string;
  showDetails?: boolean;
}) {
  const { health, isLoading } = useHealthChecks();

  if (isLoading) {
    return (
      <div className={`health-status-loading ${className}`}>
        <div className="loading-spinner" />
        <span>Verificando estado del sistema...</span>
      </div>
    );
  }

  if (!health) {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'degraded': return 'text-yellow-600';
      case 'unhealthy': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return '✅';
      case 'degraded': return '⚠️';
      case 'unhealthy': return '❌';
      default: return '❓';
    }
  };

  return (
    <div className={`health-status ${className}`}>
      <div className="status-header">
        <h3>Estado del Sistema</h3>
        <div className={`overall-status ${getStatusColor(health.overall)}`}>
          <span className="status-icon">{getStatusIcon(health.overall)}</span>
          <span className="status-text">{health.overall.toUpperCase()}</span>
        </div>
      </div>

      <div className="checks-grid">
        {health.checks.map((check) => (
          <div key={check.name} className={`check-item ${getStatusColor(check.status)}`}>
            <div className="check-header">
              <span className="check-name">{check.name}</span>
              <span className="check-icon">{getStatusIcon(check.status)}</span>
            </div>
            <div className="check-details">
              <span className="response-time">{check.responseTime}ms</span>
              {check.error && (
                <span className="error-message">{check.error}</span>
              )}
            </div>
            {showDetails && check.details && (
              <div className="check-details-extra">
                <pre>{JSON.stringify(check.details, null, 2)}</pre>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="system-info">
        <div className="info-item">
          <span>Uptime:</span>
          <span>{Math.round(health.uptime / 1000 / 60)} minutos</span>
        </div>
        <div className="info-item">
          <span>Versión:</span>
          <span>{health.version}</span>
        </div>
        <div className="info-item">
          <span>Ambiente:</span>
          <span>{health.environment}</span>
        </div>
        <div className="info-item">
          <span>Última verificación:</span>
          <span>{health.timestamp.toLocaleTimeString()}</span>
        </div>
      </div>
    </div>
  );
}
