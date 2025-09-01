'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Rocket, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Clock,
  RefreshCw,
  Download,
  Upload,
  Play,
  Pause,
  RotateCcw,
  Settings,
  Info,
  HelpCircle,
  GitBranch,
  GitCommit,
  Server,
  Database,
  Globe,
  Shield,
  Activity,
  BarChart3,
  Eye,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Trash2,
  Edit,
  Copy,
  ExternalLink,
  Terminal,
  Code,
  Package,
  Zap,
  Target,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DeploymentInfo {
  id: string;
  environment: 'staging' | 'production';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'rolled_back';
  version: string;
  commitHash: string;
  branch: string;
  startedAt: string;
  completedAt?: string;
  duration?: number;
  progress: number;
  logs: string[];
  metrics: {
    buildTime: number;
    bundleSize: number;
    lighthouseScore: number;
    testResults: {
      passed: number;
      failed: number;
      total: number;
    };
  };
}

interface DeploymentManagerProps {
  className?: string;
  refreshInterval?: number;
}

export const DeploymentManager: React.FC<DeploymentManagerProps> = ({
  className = '',
  refreshInterval = 30000
}) => {
  const [deployments, setDeployments] = useState<DeploymentInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDeployment, setSelectedDeployment] = useState<DeploymentInfo | null>(null);
  const [isDeploying, setIsDeploying] = useState(false);

  const loadDeployments = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/deployments');
      if (response.ok) {
        const data = await response.json();
        setDeployments(data.deployments);
      }
    } catch (error) {
      console.error('Error loading deployments:', error);
      // Datos de prueba
      setDeployments([
        {
          id: 'deploy-001',
          environment: 'production',
          status: 'completed',
          version: 'v1.2.3',
          commitHash: 'abc123def',
          branch: 'main',
          startedAt: '2024-02-28T10:00:00Z',
          completedAt: '2024-02-28T10:05:30Z',
          duration: 330,
          progress: 100,
          logs: [
            '🚀 Iniciando deployment...',
            '📦 Construyendo aplicación...',
            '🧪 Ejecutando tests...',
            '✅ Tests pasaron (45/45)',
            '🌐 Desplegando a producción...',
            '✅ Deployment completado exitosamente'
          ],
          metrics: {
            buildTime: 180,
            bundleSize: 2.4,
            lighthouseScore: 92,
            testResults: {
              passed: 45,
              failed: 0,
              total: 45
            }
          }
        },
        {
          id: 'deploy-002',
          environment: 'staging',
          status: 'running',
          version: 'v1.2.4',
          commitHash: 'def456ghi',
          branch: 'develop',
          startedAt: '2024-02-28T11:30:00Z',
          progress: 65,
          logs: [
            '🚀 Iniciando deployment...',
            '📦 Construyendo aplicación...',
            '🧪 Ejecutando tests...',
            '⏳ Ejecutando tests de integración...'
          ],
          metrics: {
            buildTime: 0,
            bundleSize: 0,
            lighthouseScore: 0,
            testResults: {
              passed: 0,
              failed: 0,
              total: 0
            }
          }
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const triggerDeployment = async (environment: 'staging' | 'production') => {
    try {
      setIsDeploying(true);
      const response = await fetch('/api/admin/deployments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          environment,
          action: 'deploy'
        })
      });
      
      if (response.ok) {
        await loadDeployments();
      }
    } catch (error) {
      console.error('Error triggering deployment:', error);
    } finally {
      setIsDeploying(false);
    }
  };

  const rollbackDeployment = async (deploymentId: string) => {
    try {
      const response = await fetch(`/api/admin/deployments/${deploymentId}/rollback`, {
        method: 'POST'
      });
      
      if (response.ok) {
        await loadDeployments();
      }
    } catch (error) {
      console.error('Error rolling back deployment:', error);
    }
  };

  useEffect(() => {
    loadDeployments();
    const interval = setInterval(loadDeployments, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'running':
        return <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'rolled_back':
        return <RotateCcw className="w-5 h-5 text-orange-600" />;
      default:
        return <Info className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600';
      case 'failed':
        return 'text-red-600';
      case 'running':
        return 'text-blue-600';
      case 'pending':
        return 'text-yellow-600';
      case 'rolled_back':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  if (isLoading && deployments.length === 0) {
    return (
      <div className={cn("flex items-center justify-center p-8", className)}>
        <div className="flex items-center space-x-2">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Cargando deployments...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestor de Deployments</h1>
          <p className="text-gray-600 mt-1">
            Gestiona deployments a staging y producción
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button
            onClick={loadDeployments}
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={cn("w-4 h-4 mr-2", isLoading && "animate-spin")} />
            Actualizar
          </Button>
          
          <Button
            onClick={() => triggerDeployment('staging')}
            disabled={isDeploying}
            variant="outline"
            size="sm"
          >
            <Rocket className="w-4 h-4 mr-2" />
            Deploy Staging
          </Button>
          
          <Button
            onClick={() => triggerDeployment('production')}
            disabled={isDeploying}
            size="sm"
          >
            <Rocket className="w-4 h-4 mr-2" />
            Deploy Producción
          </Button>
        </div>
      </div>

      {/* Estadísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deployments Totales</CardTitle>
            <Rocket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{deployments.length}</div>
            <p className="text-xs text-muted-foreground">
              En los últimos 30 días
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Exitosos</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {deployments.filter(d => d.status === 'completed').length}
            </div>
            <p className="text-xs text-muted-foreground">
              {deployments.length > 0 ? 
                Math.round((deployments.filter(d => d.status === 'completed').length / deployments.length) * 100) : 0}% tasa de éxito
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Progreso</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {deployments.filter(d => d.status === 'running' || d.status === 'pending').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Actualmente ejecutándose
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fallidos</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {deployments.filter(d => d.status === 'failed').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Requieren atención
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Deployments */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Deployments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {deployments.map((deployment) => (
              <div key={deployment.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(deployment.status)}
                    <div>
                      <h3 className="font-semibold">
                        {deployment.environment === 'production' ? 'Producción' : 'Staging'} - {deployment.version}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {deployment.branch} • {deployment.commitHash.substring(0, 8)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge variant={deployment.environment === 'production' ? 'destructive' : 'secondary'}>
                      {deployment.environment}
                    </Badge>
                    <Badge variant="outline">
                      {deployment.status}
                    </Badge>
                    {deployment.status === 'running' && (
                      <Progress value={deployment.progress} className="w-20" />
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Iniciado:</span>
                    <p className="font-medium">
                      {new Date(deployment.startedAt).toLocaleString()}
                    </p>
                  </div>
                  
                  {deployment.completedAt && (
                    <div>
                      <span className="text-gray-600">Completado:</span>
                      <p className="font-medium">
                        {new Date(deployment.completedAt).toLocaleString()}
                      </p>
                    </div>
                  )}
                  
                  {deployment.duration && (
                    <div>
                      <span className="text-gray-600">Duración:</span>
                      <p className="font-medium">
                        {formatDuration(deployment.duration)}
                      </p>
                    </div>
                  )}
                </div>

                {/* Métricas del Deployment */}
                {deployment.status === 'completed' && deployment.metrics && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <h4 className="font-medium mb-2">Métricas del Deployment</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Tiempo de Build:</span>
                        <p className="font-medium">{deployment.metrics.buildTime}s</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Tamaño Bundle:</span>
                        <p className="font-medium">{deployment.metrics.bundleSize}MB</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Lighthouse Score:</span>
                        <p className="font-medium">{deployment.metrics.lighthouseScore}/100</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Tests:</span>
                        <p className="font-medium">
                          {deployment.metrics.testResults.passed}/{deployment.metrics.testResults.total}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Logs del Deployment */}
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Logs</h4>
                  <div className="bg-black text-green-400 p-3 rounded-lg font-mono text-sm max-h-32 overflow-y-auto">
                    {deployment.logs.map((log, index) => (
                      <div key={index} className="mb-1">
                        <span className="text-gray-500">[{index + 1}]</span> {log}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Acciones */}
                <div className="mt-4 flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedDeployment(deployment)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Ver Detalles
                  </Button>
                  
                  {deployment.status === 'failed' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => rollbackDeployment(deployment.id)}
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Rollback
                    </Button>
                  )}
                  
                  <Button
                    variant="outline"
                    size="sm"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Descargar Logs
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Modal de Detalles */}
      {selectedDeployment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Detalles del Deployment</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedDeployment(null)}
              >
                <XCircle className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-600">ID:</span>
                  <p className="font-medium">{selectedDeployment.id}</p>
                </div>
                <div>
                  <span className="text-gray-600">Versión:</span>
                  <p className="font-medium">{selectedDeployment.version}</p>
                </div>
                <div>
                  <span className="text-gray-600">Rama:</span>
                  <p className="font-medium">{selectedDeployment.branch}</p>
                </div>
                <div>
                  <span className="text-gray-600">Commit:</span>
                  <p className="font-medium">{selectedDeployment.commitHash}</p>
                </div>
              </div>
              
              {selectedDeployment.metrics && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold mb-2">Métricas Detalladas</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <span className="text-gray-600">Tiempo de Build:</span>
                      <p className="font-medium">{selectedDeployment.metrics.buildTime}s</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Tamaño Bundle:</span>
                      <p className="font-medium">{selectedDeployment.metrics.bundleSize}MB</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Lighthouse Score:</span>
                      <p className="font-medium">{selectedDeployment.metrics.lighthouseScore}/100</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Tests Pasados:</span>
                      <p className="font-medium">{selectedDeployment.metrics.testResults.passed}/{selectedDeployment.metrics.testResults.total}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <div>
                <h3 className="font-semibold mb-2">Logs Completos</h3>
                <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm max-h-64 overflow-y-auto">
                  {selectedDeployment.logs.map((log, index) => (
                    <div key={index} className="mb-1">
                      <span className="text-gray-500">[{index + 1}]</span> {log}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeploymentManager;
