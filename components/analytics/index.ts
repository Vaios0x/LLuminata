// Componentes de Analytics Avanzados
export { default as HeatmapVisualizer } from './HeatmapVisualizer';
export { default as PredictiveAnalytics } from './PredictiveAnalytics';
export { default as ABTestingDashboard } from './ABTestingDashboard';
export { default as RealTimeMetrics } from './RealTimeMetrics';
export { default as ExportManager } from './ExportManager';

// Componentes existentes
export { default as AnalyticsDashboard } from './analytics-dashboard';
export { default as ProgressReport } from './progress-report';
export { default as RegionalAnalysis } from './regional-analysis';
export { default as EngagementMetrics } from './engagement-metrics';
export { default as AdminDashboard } from './admin-dashboard';

// Tipos comunes
export interface AnalyticsBaseProps {
  userId?: string;
  className?: string;
  refreshInterval?: number;
}

// Tipos para Heatmap
export interface HeatmapData {
  date: string;
  hour: number;
  value: number;
  category: string;
  userId?: string;
  sessionId?: string;
  deviceType?: string;
  location?: string;
  activity?: string;
}

export interface HeatmapFilters {
  dateRange: {
    start: Date;
    end: Date;
  };
  categories: string[];
  deviceTypes: string[];
  locations: string[];
  activities: string[];
  minValue: number;
  maxValue: number;
}

// Tipos para Predictive Analytics
export interface PredictionData {
  id: string;
  userId?: string;
  type: 'engagement' | 'performance' | 'dropout' | 'completion' | 'behavior';
  metric: string;
  currentValue: number;
  predictedValue: number;
  confidence: number;
  timeframe: '1d' | '7d' | '30d' | '90d';
  factors: PredictionFactor[];
  trend: 'up' | 'down' | 'stable';
  risk: 'low' | 'medium' | 'high';
  lastUpdated: string;
  model: string;
  accuracy: number;
}

export interface PredictionFactor {
  name: string;
  weight: number;
  impact: 'positive' | 'negative' | 'neutral';
  description: string;
}

export interface ModelPerformance {
  modelId: string;
  name: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  lastTrained: string;
  status: 'active' | 'training' | 'error' | 'deprecated';
  version: string;
}

// Tipos para A/B Testing
export interface ABTest {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'running' | 'paused' | 'completed' | 'stopped';
  startDate: string;
  endDate?: string;
  variants: ABVariant[];
  metrics: ABMetric[];
  trafficSplit: number;
  confidenceLevel: number;
  minimumSampleSize: number;
  currentSampleSize: number;
  winner?: string;
  significance: number;
  effectSize: number;
  createdAt: string;
  updatedAt: string;
}

export interface ABVariant {
  id: string;
  name: string;
  description: string;
  type: 'control' | 'treatment';
  sampleSize: number;
  conversions: number;
  conversionRate: number;
  revenue?: number;
  averageOrderValue?: number;
  bounceRate?: number;
  timeOnPage?: number;
  customMetrics: Record<string, number>;
}

export interface ABMetric {
  id: string;
  name: string;
  description: string;
  type: 'conversion' | 'revenue' | 'engagement' | 'custom';
  primary: boolean;
  unit?: string;
  target?: number;
}

// Tipos para Real-Time Metrics
export interface RealTimeMetric {
  id: string;
  name: string;
  value: number;
  previousValue: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  category: 'users' | 'engagement' | 'performance' | 'errors' | 'custom';
  unit: string;
  timestamp: string;
  status: 'normal' | 'warning' | 'critical';
  description?: string;
  metadata?: Record<string, any>;
}

export interface RealTimeEvent {
  id: string;
  type: 'user_action' | 'system_event' | 'error' | 'performance' | 'custom';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  userId?: string;
  sessionId?: string;
  metadata?: Record<string, any>;
}

export interface ConnectionStatus {
  connected: boolean;
  lastConnected?: string;
  lastDisconnected?: string;
  reconnectAttempts: number;
  latency: number;
}

// Tipos para Export Manager
export interface ExportJob {
  id: string;
  name: string;
  description: string;
  type: 'analytics' | 'reports' | 'data' | 'custom';
  format: 'csv' | 'json' | 'pdf' | 'excel' | 'xml' | 'zip';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  size?: number;
  url?: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  expiresAt?: string;
  filters: ExportFilters;
  metadata?: Record<string, any>;
}

export interface ExportFilters {
  dateRange: {
    start: Date;
    end: Date;
  };
  categories: string[];
  metrics: string[];
  users?: string[];
  includeCharts: boolean;
  includeRawData: boolean;
  compression: boolean;
  password?: string;
}

export interface ExportTemplate {
  id: string;
  name: string;
  description: string;
  type: string;
  format: string;
  filters: ExportFilters;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

// Enums y constantes
export enum AnalyticsCategory {
  USERS = 'users',
  ENGAGEMENT = 'engagement',
  PERFORMANCE = 'performance',
  ERRORS = 'errors',
  CUSTOM = 'custom'
}

export enum ExportFormat {
  CSV = 'csv',
  JSON = 'json',
  PDF = 'pdf',
  EXCEL = 'excel',
  XML = 'xml',
  ZIP = 'zip'
}

export enum ExportStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export enum MetricStatus {
  NORMAL = 'normal',
  WARNING = 'warning',
  CRITICAL = 'critical'
}

export enum EventSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Utilidades
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'normal':
    case 'completed':
    case 'active':
      return 'bg-green-100 text-green-800';
    case 'warning':
    case 'processing':
    case 'training':
      return 'bg-yellow-100 text-yellow-800';
    case 'critical':
    case 'failed':
    case 'error':
      return 'bg-red-100 text-red-800';
    case 'pending':
    case 'draft':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getSeverityColor = (severity: string): string => {
  switch (severity) {
    case 'low': return 'bg-blue-100 text-blue-800';
    case 'medium': return 'bg-yellow-100 text-yellow-800';
    case 'high': return 'bg-orange-100 text-orange-800';
    case 'critical': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

// Configuración por defecto
export const DEFAULT_ANALYTICS_CONFIG = {
  refreshInterval: 30000,
  maxDataPoints: 1000,
  autoRefresh: true,
  showCharts: true,
  showRawData: false,
  exportFormats: ['csv', 'json', 'pdf'],
  maxExportSize: 100 * 1024 * 1024, // 100MB
  retentionDays: 90,
  compressionEnabled: true,
  realTimeEnabled: true,
  websocketReconnectAttempts: 5,
  websocketReconnectDelay: 1000
};

// Hooks personalizados (para futuras implementaciones)
export const useAnalyticsRefresh = (callback: () => void, interval: number = 30000) => {
  React.useEffect(() => {
    const timer = setInterval(callback, interval);
    return () => clearInterval(timer);
  }, [callback, interval]);
};

export const useWebSocketConnection = (url: string, options?: any) => {
  // Implementación futura del hook de WebSocket
  return {
    connected: false,
    send: () => {},
    disconnect: () => {}
  };
};

// Funciones de utilidad para estadísticas
export const calculateStatisticalSignificance = (control: ABVariant, treatment: ABVariant): number => {
  const n1 = control.sampleSize;
  const n2 = treatment.sampleSize;
  const p1 = control.conversionRate;
  const p2 = treatment.conversionRate;
  
  if (n1 === 0 || n2 === 0) return 1;
  
  const pooledP = (control.conversions + treatment.conversions) / (n1 + n2);
  const standardError = Math.sqrt(pooledP * (1 - pooledP) * (1/n1 + 1/n2));
  const zScore = Math.abs(p2 - p1) / standardError;
  
  return Math.exp(-0.5 * zScore * zScore) / Math.sqrt(2 * Math.PI);
};

export const getEffectSize = (control: ABVariant, treatment: ABVariant): number => {
  if (control.conversionRate === 0) return 0;
  return (treatment.conversionRate - control.conversionRate) / control.conversionRate;
};

export const isStatisticallySignificant = (significance: number): boolean => {
  return significance < 0.05;
};
