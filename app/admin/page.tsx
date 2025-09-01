'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, 
  Users, 
  Shield, 
  Database, 
  Activity, 
  BarChart3,
  Rocket,
  Eye,
  RefreshCw,
  Download,
  Upload,
  Play,
  Pause,
  RotateCcw,
  Info,
  HelpCircle,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Server,
  Globe,
  Zap,
  Target,
  TrendingUp,
  TrendingDown,
  Minus,
  GitBranch,
  GitCommit,
  Package,
  Terminal,
  Code,
  Shield as ShieldIcon,
  Lock,
  Key,
  Bell,
  MessageSquare,
  BookOpen,
  Palette,
  Cpu,
  HardDrive,
  Wifi,
  Database as DatabaseIcon,
  Globe as GlobeIcon,
  Activity as ActivityIcon,
  BarChart3 as BarChart3Icon,
  Rocket as RocketIcon,
  Settings as SettingsIcon,
  Users as UsersIcon,
  Shield as ShieldIcon2
} from 'lucide-react';
import { Navbar } from '@/components/ui/navbar';
import { Footer } from '@/components/ui/footer';
import PerformanceDashboard from '@/components/monitoring/performance-dashboard';
import AnalyticsDashboard from '@/components/analytics/analytics-dashboard';
import DeploymentManager from '@/components/admin/deployment-manager';
import { cn } from '@/lib/utils';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);

  // Datos de resumen para el header
  const summaryData = {
    system: {
      status: 'healthy',
      uptime: '99.7%',
      responseTime: '245ms',
      activeUsers: 892
    },
    security: {
      threats: 0,
      vulnerabilities: 2,
      sslStatus: 'active',
      firewallStatus: 'active'
    },
    deployments: {
      total: 15,
      successful: 13,
      failed: 1,
      running: 1
    },
    users: {
      total: 1247,
      active: 892,
      new: 45,
      premium: 234
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'critical':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navbar />
      
      <div className="pt-24 pb-8">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                  Panel de Administración
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                  Gestión completa del sistema, usuarios, seguridad y deployments
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setIsLoading(true)}
                  disabled={isLoading}
                  variant="outline"
                  size="sm"
                >
                  <RefreshCw className={cn("w-4 h-4 mr-2", isLoading && "animate-spin")} />
                  Actualizar
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Exportar
                </Button>
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Estado General del Sistema */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Estado del Sistema</CardTitle>
                {getStatusIcon(summaryData.system.status)}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold capitalize">{summaryData.system.status}</div>
                <p className="text-xs text-muted-foreground">
                  Uptime: {summaryData.system.uptime}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summaryData.users.active}</div>
                <p className="text-xs text-muted-foreground">
                  de {summaryData.users.total} totales
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Deployments</CardTitle>
                <Rocket className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summaryData.deployments.successful}</div>
                <p className="text-xs text-muted-foreground">
                  {summaryData.deployments.total} totales, {summaryData.deployments.failed} fallidos
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Seguridad</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summaryData.security.threats}</div>
                <p className="text-xs text-muted-foreground">
                  {summaryData.security.vulnerabilities} vulnerabilidades
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs de Navegación */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="overview" tabIndex={0}>
                <Eye className="w-4 h-4 mr-2" />
                Resumen
              </TabsTrigger>
              <TabsTrigger value="performance" tabIndex={0}>
                <Activity className="w-4 h-4 mr-2" />
                Performance
              </TabsTrigger>
              <TabsTrigger value="analytics" tabIndex={0}>
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="deployments" tabIndex={0}>
                <Rocket className="w-4 h-4 mr-2" />
                Deployments
              </TabsTrigger>
              <TabsTrigger value="users" tabIndex={0}>
                <Users className="w-4 h-4 mr-2" />
                Usuarios
              </TabsTrigger>
              <TabsTrigger value="security" tabIndex={0}>
                <Shield className="w-4 h-4 mr-2" />
                Seguridad
              </TabsTrigger>
              <TabsTrigger value="settings" tabIndex={0}>
                <Settings className="w-4 h-4 mr-2" />
                Configuración
              </TabsTrigger>
            </TabsList>

            {/* Tab de Resumen */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Estado de Servicios */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Server className="w-5 h-5 mr-2" />
                      Estado de Servicios
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <div>
                            <h4 className="font-semibold">API Principal</h4>
                            <p className="text-sm text-gray-600">Funcionando correctamente</p>
                          </div>
                        </div>
                        <Badge variant="default">Activo</Badge>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <div>
                            <h4 className="font-semibold">Base de Datos</h4>
                            <p className="text-sm text-gray-600">Conexión estable</p>
                          </div>
                        </div>
                        <Badge variant="default">Activo</Badge>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <div>
                            <h4 className="font-semibold">Cache Redis</h4>
                            <p className="text-sm text-gray-600">Funcionando</p>
                          </div>
                        </div>
                        <Badge variant="default">Activo</Badge>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <div>
                            <h4 className="font-semibold">Servicios de IA</h4>
                            <p className="text-sm text-gray-600">Todos operativos</p>
                          </div>
                        </div>
                        <Badge variant="default">Activo</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Estadísticas de Usuarios */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Users className="w-5 h-5 mr-2" />
                      Estadísticas de Usuarios
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h4 className="font-semibold">Usuarios Totales</h4>
                          <p className="text-sm text-gray-600">Registrados en el sistema</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold">{summaryData.users.total}</div>
                          <Badge variant="outline">+{summaryData.users.new} nuevos</Badge>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h4 className="font-semibold">Usuarios Activos</h4>
                          <p className="text-sm text-gray-600">En las últimas 24 horas</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold">{summaryData.users.active}</div>
                          <Badge variant="default">{Math.round((summaryData.users.active / summaryData.users.total) * 100)}%</Badge>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h4 className="font-semibold">Usuarios Premium</h4>
                          <p className="text-sm text-gray-600">Con suscripción activa</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold">{summaryData.users.premium}</div>
                          <Badge variant="secondary">{Math.round((summaryData.users.premium / summaryData.users.total) * 100)}%</Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Métricas de Seguridad */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="w-5 h-5 mr-2" />
                    Estado de Seguridad
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-3xl font-bold text-green-600">{summaryData.security.threats}</div>
                      <p className="text-sm text-gray-600">Amenazas</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-3xl font-bold text-yellow-600">{summaryData.security.vulnerabilities}</div>
                      <p className="text-sm text-gray-600">Vulnerabilidades</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-3xl font-bold text-green-600 capitalize">{summaryData.security.sslStatus}</div>
                      <p className="text-sm text-gray-600">SSL Status</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-3xl font-bold text-green-600 capitalize">{summaryData.security.firewallStatus}</div>
                      <p className="text-sm text-gray-600">Firewall</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab de Performance */}
            <TabsContent value="performance" className="space-y-6">
              <PerformanceDashboard 
                className="w-full"
                refreshInterval={30000}
              />
            </TabsContent>

            {/* Tab de Analytics */}
            <TabsContent value="analytics" className="space-y-6">
              <AnalyticsDashboard 
                className="w-full"
                refreshInterval={300000}
                showRegionalAnalysis={true}
                showEngagementMetrics={true}
              />
            </TabsContent>

            {/* Tab de Deployments */}
            <TabsContent value="deployments" className="space-y-6">
              <DeploymentManager 
                className="w-full"
                refreshInterval={30000}
              />
            </TabsContent>

            {/* Tab de Usuarios */}
            <TabsContent value="users" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    Gestión de Usuarios
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Usuarios del Sistema</h3>
                      <Button size="sm">
                        <Users className="w-4 h-4 mr-2" />
                        Ver Todos
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">Estudiantes</h4>
                          <Badge variant="outline">1,023</Badge>
                        </div>
                        <p className="text-sm text-gray-600">Usuarios activos aprendiendo</p>
                      </div>
                      
                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">Maestros</h4>
                          <Badge variant="outline">156</Badge>
                        </div>
                        <p className="text-sm text-gray-600">Educadores registrados</p>
                      </div>
                      
                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">Administradores</h4>
                          <Badge variant="outline">12</Badge>
                        </div>
                        <p className="text-sm text-gray-600">Acceso completo al sistema</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab de Seguridad */}
            <TabsContent value="security" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="w-5 h-5 mr-2" />
                    Panel de Seguridad
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-semibold mb-2">Autenticación</h4>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">2FA Habilitado</span>
                            <Badge variant="default">Sí</Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Sesiones Activas</span>
                            <Badge variant="outline">892</Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-semibold mb-2">Firewall</h4>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Estado</span>
                            <Badge variant="default">Activo</Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Reglas Activas</span>
                            <Badge variant="outline">45</Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab de Configuración */}
            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="w-5 h-5 mr-2" />
                    Configuración del Sistema
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-semibold mb-2">Configuración General</h4>
                        <div className="space-y-2">
                          <Button variant="outline" size="sm" className="w-full justify-start">
                            <Settings className="w-4 h-4 mr-2" />
                            Configuración General
                          </Button>
                          <Button variant="outline" size="sm" className="w-full justify-start">
                            <Database className="w-4 h-4 mr-2" />
                            Configuración de BD
                          </Button>
                          <Button variant="outline" size="sm" className="w-full justify-start">
                            <Globe className="w-4 h-4 mr-2" />
                            Configuración de Red
                          </Button>
                        </div>
                      </div>
                      
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-semibold mb-2">Mantenimiento</h4>
                        <div className="space-y-2">
                          <Button variant="outline" size="sm" className="w-full justify-start">
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Reiniciar Servicios
                          </Button>
                          <Button variant="outline" size="sm" className="w-full justify-start">
                            <Download className="w-4 h-4 mr-2" />
                            Backup Manual
                          </Button>
                          <Button variant="outline" size="sm" className="w-full justify-start">
                            <Upload className="w-4 h-4 mr-2" />
                            Restaurar Backup
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Footer />
    </div>
  );
}
