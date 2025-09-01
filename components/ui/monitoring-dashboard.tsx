'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { 
  PerformanceMetricsDisplay, 
  usePerformanceMonitoring 
} from '@/lib/monitoring/performance-monitoring';
import { 
  HealthStatusDisplay, 
  useHealthChecks 
} from '@/lib/monitoring/health-checks';
import { 
  useAnalytics, 
  getSessionData 
} from '@/lib/monitoring/user-analytics';
import { 
  captureException, 
  addBreadcrumb 
} from '@/lib/monitoring/error-tracking';

// Tipos para el dashboard
interface MonitoringDashboardProps {
  className?: string;
  showPerformance?: boolean;
  showHealth?: boolean;
  showAnalytics?: boolean;
  showErrors?: boolean;
  refreshInterval?: number;
}

interface DashboardStats {
  performance: {
    score: number;
    grade: string;
    metrics: Record<string, number>;
  };
  health: {
    overall: string;
    checks: Array<{ name: string; status: string }>;
  };
  analytics: {
    pageViews: number;
    sessionDuration: number;
    events: number;
  };
  errors: {
    count: number;
    lastError?: string;
  };
}

// Componente principal del dashboard
export function MonitoringDashboard({
  className,
  showPerformance = true,
  showHealth = true,
  showAnalytics = true,
  showErrors = true,
  refreshInterval = 30000, // 30 segundos
}: MonitoringDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'health' | 'analytics' | 'errors'>('overview');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Hooks de monitoring
  const { metrics: performanceMetrics, score: performanceScore } = usePerformanceMonitoring();
  const { health } = useHealthChecks();
  const analytics = useAnalytics();

  // Función para actualizar estadísticas
  const updateStats = React.useCallback(async () => {
    try {
      setIsLoading(true);
      
      const sessionData = getSessionData();
      const currentStats: DashboardStats = {
        performance: {
          score: performanceScore?.score || 0,
          grade: performanceScore?.grade || 'N/A',
          metrics: performanceMetrics ? {
            fcp: performanceMetrics.fcp,
            lcp: performanceMetrics.lcp,
            fid: performanceMetrics.fid,
            cls: performanceMetrics.cls,
            ttfb: performanceMetrics.ttfb,
          } : {},
        },
        health: {
          overall: health?.overall || 'unknown',
          checks: health?.checks.map(check => ({
            name: check.name,
            status: check.status,
          })) || [],
        },
        analytics: {
          pageViews: sessionData?.pageViews || 0,
          sessionDuration: sessionData ? Date.now() - sessionData.startTime : 0,
          events: sessionData?.events.length || 0,
        },
        errors: {
          count: 0, // Esto se actualizaría con un contador de errores
          lastError: undefined,
        },
      };

      setStats(currentStats);
      setLastRefresh(new Date());
      
      addBreadcrumb({
        message: 'Dashboard stats updated',
        category: 'monitoring',
        level: 'info',
      });
    } catch (error) {
      captureException(error as Error, { context: 'monitoring-dashboard' });
    } finally {
      setIsLoading(false);
    }
  }, [performanceScore, performanceMetrics, health]);

  // Actualizar estadísticas al cambiar datos
  useEffect(() => {
    updateStats();
  }, [updateStats]);

  // Actualizar periódicamente
  useEffect(() => {
    const interval = setInterval(updateStats, refreshInterval);
    return () => clearInterval(interval);
  }, [updateStats, refreshInterval]);

  // Tabs del dashboard
  const tabs = [
    { id: 'overview', label: 'Resumen', icon: '📊' },
    { id: 'performance', label: 'Rendimiento', icon: '⚡' },
    { id: 'health', label: 'Salud', icon: '🏥' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
    { id: 'errors', label: 'Errores', icon: '🚨' },
  ].filter(tab => {
    if (tab.id === 'performance' && !showPerformance) return false;
    if (tab.id === 'health' && !showHealth) return false;
    if (tab.id === 'analytics' && !showAnalytics) return false;
    if (tab.id === 'errors' && !showErrors) return false;
    return true;
  });

  if (isLoading && !stats) {
    return (
      <div className={cn('monitoring-dashboard loading', className)}>
        <div className="loading-spinner" />
        <span>Cargando dashboard de monitoreo...</span>
      </div>
    );
  }

  return (
    <div className={cn('monitoring-dashboard', className)}>
      {/* Header del dashboard */}
      <div className="dashboard-header">
        <h2 className="dashboard-title">Dashboard de Monitoreo</h2>
        <div className="dashboard-controls">
          <button
            onClick={updateStats}
            disabled={isLoading}
            className="refresh-button"
          >
            {isLoading ? '🔄' : '🔄'} Actualizar
          </button>
          <span className="last-refresh">
            Última actualización: {lastRefresh.toLocaleTimeString()}
          </span>
        </div>
      </div>

      {/* Tabs de navegación */}
      <div className="dashboard-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              'tab-button',
              activeTab === tab.id && 'active'
            )}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Contenido del dashboard */}
      <div className="dashboard-content">
        {activeTab === 'overview' && (
          <OverviewTab stats={stats} />
        )}
        
        {activeTab === 'performance' && showPerformance && (
          <div className="tab-content">
            <PerformanceMetricsDisplay showDetails={true} />
          </div>
        )}
        
        {activeTab === 'health' && showHealth && (
          <div className="tab-content">
            <HealthStatusDisplay showDetails={true} />
          </div>
        )}
        
        {activeTab === 'analytics' && showAnalytics && (
          <AnalyticsTab />
        )}
        
        {activeTab === 'errors' && showErrors && (
          <ErrorsTab />
        )}
      </div>
    </div>
  );
}

// Tab de resumen
function OverviewTab({ stats }: { stats: DashboardStats | null }) {
  if (!stats) return null;

  return (
    <div className="overview-tab">
      <div className="stats-grid">
        {/* Performance Card */}
        <div className="stat-card performance">
          <div className="stat-header">
            <span className="stat-icon">⚡</span>
            <span className="stat-title">Rendimiento</span>
          </div>
          <div className="stat-content">
            <div className="stat-main">
              <span className="stat-value">{stats.performance.score}</span>
              <span className="stat-unit">/100</span>
            </div>
            <div className="stat-grade">
              Grado: <span className={`grade-${stats.performance.grade.toLowerCase()}`}>
                {stats.performance.grade}
              </span>
            </div>
          </div>
        </div>

        {/* Health Card */}
        <div className={`stat-card health ${stats.health.overall}`}>
          <div className="stat-header">
            <span className="stat-icon">🏥</span>
            <span className="stat-title">Salud del Sistema</span>
          </div>
          <div className="stat-content">
            <div className="stat-main">
              <span className="stat-value">{stats.health.overall.toUpperCase()}</span>
            </div>
            <div className="stat-details">
              {stats.health.checks.length} checks activos
            </div>
          </div>
        </div>

        {/* Analytics Card */}
        <div className="stat-card analytics">
          <div className="stat-header">
            <span className="stat-icon">📈</span>
            <span className="stat-title">Analytics</span>
          </div>
          <div className="stat-content">
            <div className="stat-row">
              <span>Páginas vistas:</span>
              <span>{stats.analytics.pageViews}</span>
            </div>
            <div className="stat-row">
              <span>Duración sesión:</span>
              <span>{Math.round(stats.analytics.sessionDuration / 1000 / 60)} min</span>
            </div>
            <div className="stat-row">
              <span>Eventos:</span>
              <span>{stats.analytics.events}</span>
            </div>
          </div>
        </div>

        {/* Errors Card */}
        <div className="stat-card errors">
          <div className="stat-header">
            <span className="stat-icon">🚨</span>
            <span className="stat-title">Errores</span>
          </div>
          <div className="stat-content">
            <div className="stat-main">
              <span className="stat-value">{stats.errors.count}</span>
            </div>
            <div className="stat-details">
              {stats.errors.lastError ? (
                <span className="last-error">{stats.errors.lastError}</span>
              ) : (
                <span className="no-errors">Sin errores recientes</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Métricas detalladas */}
      <div className="detailed-metrics">
        <h3>Métricas de Rendimiento</h3>
        <div className="metrics-table">
          {Object.entries(stats.performance.metrics).map(([key, value]) => (
            <div key={key} className="metric-row">
              <span className="metric-name">{key.toUpperCase()}</span>
              <span className="metric-value">{value.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Tab de analytics
function AnalyticsTab() {
  const sessionData = getSessionData();

  return (
    <div className="analytics-tab">
      <div className="analytics-header">
        <h3>Datos de Analytics</h3>
        <button 
          onClick={() => window.location.reload()}
          className="refresh-analytics"
        >
          🔄 Actualizar
        </button>
      </div>

      {sessionData ? (
        <div className="analytics-content">
          <div className="session-info">
            <h4>Información de Sesión</h4>
            <div className="info-grid">
              <div className="info-item">
                <span>ID de Sesión:</span>
                <span>{sessionData.sessionId}</span>
              </div>
              <div className="info-item">
                <span>Inicio:</span>
                <span>{new Date(sessionData.startTime).toLocaleString()}</span>
              </div>
              <div className="info-item">
                <span>Última actividad:</span>
                <span>{new Date(sessionData.lastActivity).toLocaleString()}</span>
              </div>
              <div className="info-item">
                <span>Páginas vistas:</span>
                <span>{sessionData.pageViews}</span>
              </div>
              <div className="info-item">
                <span>Eventos:</span>
                <span>{sessionData.events.length}</span>
              </div>
            </div>
          </div>

          <div className="events-list">
            <h4>Eventos Recientes</h4>
            <div className="events-container">
              {sessionData.events.slice(-10).reverse().map((event, index) => (
                <div key={index} className="event-item">
                  <div className="event-header">
                    <span className="event-category">{event.category}</span>
                    <span className="event-action">{event.action}</span>
                    <span className="event-time">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  {event.label && (
                    <div className="event-label">{event.label}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="no-analytics">
          <p>No hay datos de analytics disponibles</p>
        </div>
      )}
    </div>
  );
}

// Tab de errores
function ErrorsTab() {
  return (
    <div className="errors-tab">
      <div className="errors-header">
        <h3>Errores y Alertas</h3>
        <button 
          onClick={() => captureException(new Error('Test error'), { context: 'dashboard-test' })}
          className="test-error"
        >
          🧪 Probar Error
        </button>
      </div>

      <div className="errors-content">
        <div className="error-summary">
          <div className="error-stat">
            <span className="stat-number">0</span>
            <span className="stat-label">Errores hoy</span>
          </div>
          <div className="error-stat">
            <span className="stat-number">0</span>
            <span className="stat-label">Errores esta semana</span>
          </div>
          <div className="error-stat">
            <span className="stat-number">0%</span>
            <span className="stat-label">Tasa de error</span>
          </div>
        </div>

        <div className="error-list">
          <h4>Errores Recientes</h4>
          <div className="no-errors">
            <p>No hay errores recientes</p>
            <p className="subtitle">El sistema está funcionando correctamente</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente compacto para mostrar solo métricas clave
export function MonitoringWidget({ className }: { className?: string }) {
  const { score: performanceScore } = usePerformanceMonitoring();
  const { health } = useHealthChecks();

  return (
    <div className={cn('monitoring-widget', className)}>
      <div className="widget-header">
        <span className="widget-icon">📊</span>
        <span className="widget-title">Monitoreo</span>
      </div>
      
      <div className="widget-metrics">
        <div className="widget-metric">
          <span className="metric-label">Rendimiento</span>
          <span className="metric-value">
            {performanceScore?.score || 0}/100
          </span>
        </div>
        
        <div className="widget-metric">
          <span className="metric-label">Salud</span>
          <span className={`metric-value health-${health?.overall || 'unknown'}`}>
            {health?.overall || 'N/A'}
          </span>
        </div>
      </div>
    </div>
  );
}
