// Configuración centralizada del sistema de monitoring

export const MONITORING_CONFIG = {
  // Configuración general
  enabled: process.env.NODE_ENV === 'production' || process.env.ENABLE_MONITORING === 'true',
  environment: process.env.NODE_ENV || 'development',
      appName: 'LLuminata',
  version: process.env.npm_package_version || '1.0.0',

  // Sentry (Error Tracking)
  sentry: {
    enabled: process.env.NEXT_PUBLIC_SENTRY_DSN !== undefined,
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    integrations: ['browser', 'node'],
  },

  // Performance Monitoring
  performance: {
    enabled: true,
    sampleRate: 0.1, // 10% de las sesiones
    metrics: {
      fcp: { threshold: 1800, weight: 0.25 }, // First Contentful Paint
      lcp: { threshold: 2500, weight: 0.25 }, // Largest Contentful Paint
      fid: { threshold: 100, weight: 0.25 },  // First Input Delay
      cls: { threshold: 0.1, weight: 0.15 },  // Cumulative Layout Shift
      ttfb: { threshold: 800, weight: 0.1 },  // Time to First Byte
    },
    customMetrics: {
      apiResponseTime: { threshold: 1000 },
      bundleSize: { threshold: 500 * 1024 }, // 500KB
      memoryUsage: { threshold: 100 * 1024 * 1024 }, // 100MB
    },
  },

  // User Analytics
  analytics: {
    enabled: process.env.NEXT_PUBLIC_GA_ID !== undefined,
    googleAnalytics: {
      id: process.env.NEXT_PUBLIC_GA_ID,
      debug: process.env.NODE_ENV === 'development',
    },
    customEvents: {
      pageView: true,
      userInteraction: true,
      error: true,
      performance: true,
      accessibility: true,
      offline: true,
    },
    privacy: {
      anonymizeIP: true,
      respectDoNotTrack: true,
      cookieConsent: true,
    },
  },

  // Health Checks
  healthChecks: {
    enabled: true,
    interval: 30000, // 30 segundos
    timeout: 5000,   // 5 segundos
    endpoints: {
      api: '/api/health',
      database: '/api/health/database',
      external: '/api/health/external',
      memory: '/api/health/memory',
    },
    thresholds: {
      responseTime: 1000,    // 1 segundo
      memoryUsage: 0.8,      // 80% de memoria
      cpuUsage: 0.9,         // 90% de CPU
      diskUsage: 0.9,        // 90% de disco
    },
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.NODE_ENV === 'production' ? 'json' : 'pretty',
    transports: ['console', 'file'],
    file: {
      enabled: process.env.NODE_ENV === 'production',
      path: './logs/app.log',
      maxSize: '10m',
      maxFiles: 5,
    },
  },

  // Alerting
  alerting: {
    enabled: process.env.NODE_ENV === 'production',
    channels: {
      email: process.env.ALERT_EMAIL,
      slack: process.env.SLACK_WEBHOOK_URL,
      discord: process.env.DISCORD_WEBHOOK_URL,
    },
    thresholds: {
      errorRate: 0.05,      // 5% de errores
      responseTime: 2000,   // 2 segundos
      availability: 0.99,   // 99% de disponibilidad
    },
  },
} as const;

// Tipos para TypeScript
export type MonitoringConfig = typeof MONITORING_CONFIG;
export type PerformanceMetrics = typeof MONITORING_CONFIG.performance.metrics;
export type CustomMetrics = typeof MONITORING_CONFIG.performance.customMetrics;
