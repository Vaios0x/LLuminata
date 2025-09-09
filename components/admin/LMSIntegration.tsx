'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Database, 
  RefreshCw, 
  Settings, 
  Users, 
  BookOpen, 
  Award,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  Clock,
  ExternalLink,
  Download,
  Upload,
  Globe,
  Shield,
  Activity,
  BarChart3,
  FileText,
  Video,
  MessageSquare,
  Calendar,
  MapPin,
  Building,
  Network,
  Zap,
  Target,
  TrendingUp,
  AlertTriangle,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useScreenReader } from '@/components/accessibility/screen-reader';
import { useHighContrastStyles } from '@/components/accessibility/high-contrast';

interface LMSConnection {
  id: string;
  institutionId: string;
  name: string;
  type: string;
  config: any;
  status: 'active' | 'inactive' | 'error';
  lastRefreshCw: Date;
  syncStatus: 'idle' | 'syncing' | 'error';
  errorMessage?: string;
}

interface LMSRefreshCwResult {
  success: boolean;
  syncedUsers: number;
  syncedCourses: number;
  syncedGrades: number;
  errors: string[];
  warnings: string[];
}

interface LMSGrade {
  id: string;
  connectionId: string;
  userId: string;
  moduleId: string;
  score: number;
  maxScore: number;
  percentage: number;
  feedback?: string;
  submittedAt: Date;
  gradedAt?: Date;
  lastRefreshCw: Date;
}

export const LMSIntegration = () => {
  const [connections, setConnections] = useState<LMSConnection[]>([]);
  const [selectedConnection, setSelectedConnection] = useState<string>('');
  const [syncStatus, setRefreshCwStatus] = useState<LMSRefreshCwResult | null>(null);
  const [grades, setGrades] = useState<LMSGrade[]>([]);
  const [loading, setLoading] = useState(false);
  const [showNewConnection, setShowNewConnection] = useState(false);
  const [newConnection, setNewConnection] = useState({
    institutionId: '',
    name: '',
    type: 'moodle',
    config: {
      baseUrl: '',
      username: '',
      password: '',
      apiKey: '',
      clientId: '',
      clientSecret: ''
    }
  });

  const { speak } = useScreenReader();
  const { getStyles } = useHighContrastStyles();

  // Cargar conexiones al montar el componente
  useEffect(() => {
    loadConnections();
  }, []);

  const loadConnections = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/lms/connections');
      const data = await response.json();
      
      if (data.success) {
        setConnections(data.connections);
        speak('Conexiones LMS cargadas');
      }
    } catch (error) {
      console.error('Error cargando conexiones:', error);
      speak('Error al cargar conexiones LMS');
    } finally {
      setLoading(false);
    }
  };

  const syncConnection = async (connectionId: string) => {
    try {
      setLoading(true);
      speak('Iniciando sincronización...');
      
      const response = await fetch('/api/lms/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connectionId })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setRefreshCwStatus(data.result);
        speak(`Sincronización completada: ${data.result.syncedUsers} usuarios, ${data.result.syncedCourses} cursos, ${data.result.syncedGrades} calificaciones`);
        loadConnections(); // Recargar estado
      } else {
        speak('Error en la sincronización');
      }
    } catch (error) {
      console.error('Error sincronizando:', error);
      speak('Error al sincronizar');
    } finally {
      setLoading(false);
    }
  };

  const loadGrades = async (connectionId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/lms/grades?connectionId=${connectionId}`);
      const data = await response.json();
      
      if (data.success) {
        setGrades(data.grades);
        speak(`${data.total} calificaciones cargadas`);
      }
    } catch (error) {
      console.error('Error cargando calificaciones:', error);
      speak('Error al cargar calificaciones');
    } finally {
      setLoading(false);
    }
  };

  const createConnection = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/lms/connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConnection)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setShowNewConnection(false);
        setNewConnection({
          institutionId: '',
          name: '',
          type: 'moodle',
          config: {
            baseUrl: '',
            username: '',
            password: '',
            apiKey: '',
            clientId: '',
            clientSecret: ''
          }
        });
        loadConnections();
        speak('Conexión LMS creada exitosamente');
      } else {
        speak(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error creando conexión:', error);
      speak('Error al crear conexión');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRefreshCwStatusColor = (status: string) => {
    switch (status) {
      case 'idle': return 'bg-blue-100 text-blue-800';
      case 'syncing': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLMSIcon = (type: string) => {
    switch (type) {
      case 'moodle': return <Globe className="h-5 w-5" />;
      case 'canvas': return <BookOpen className="h-5 w-5" />;
      case 'blackboard': return <Shield className="h-5 w-5" />;
      case 'schoology': return <Network className="h-5 w-5" />;
      case 'google-classroom': return <ExternalLink className="h-5 w-5" />;
      default: return <Database className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6" style={getStyles()}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Integración con LMS Externos
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Gestiona conexiones con Moodle, Canvas, Blackboard y otros sistemas LMS
          </p>
        </div>
        <Button
          onClick={() => setShowNewConnection(true)}
          className="bg-blue-600 hover:bg-blue-700"
          tabIndex={0}
          aria-label="Agregar nueva conexión LMS"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nueva Conexión
        </Button>
      </div>

      {/* Estadísticas Generales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Database className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Conexiones</p>
                <p className="text-2xl font-bold text-gray-900">{connections.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Activas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {connections.filter(c => c.status === 'active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <RefreshCw className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Sincronizando</p>
                <p className="text-2xl font-bold text-gray-900">
                  {connections.filter(c => c.syncStatus === 'syncing').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Con Errores</p>
                <p className="text-2xl font-bold text-gray-900">
                  {connections.filter(c => c.status === 'error').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs principales */}
      <Tabs defaultValue="connections" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="connections" tabIndex={0} aria-label="Ver conexiones LMS">
            <Database className="h-4 w-4 mr-2" />
            Conexiones
          </TabsTrigger>
          <TabsTrigger value="sync" tabIndex={0} aria-label="Ver sincronización">
            <RefreshCw className="h-4 w-4 mr-2" />
            Sincronización
          </TabsTrigger>
          <TabsTrigger value="grades" tabIndex={0} aria-label="Ver calificaciones">
            <Award className="h-4 w-4 mr-2" />
            Calificaciones
          </TabsTrigger>
        </TabsList>

        {/* Tab de Conexiones */}
        <TabsContent value="connections" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Conexiones LMS Configuradas</CardTitle>
              <CardDescription>
                Gestiona las conexiones con sistemas LMS externos
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Cargando conexiones...</span>
                </div>
              ) : connections.length === 0 ? (
                <div className="text-center py-8">
                  <Database className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">No hay conexiones LMS configuradas</p>
                  <Button
                    onClick={() => setShowNewConnection(true)}
                    className="mt-4"
                    tabIndex={0}
                    aria-label="Crear primera conexión LMS"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Primera Conexión
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {connections.map((connection) => (
                    <div
                      key={connection.id}
                      className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      tabIndex={0}
                      aria-label={`Conexión ${connection.name} - ${connection.type}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {getLMSIcon(connection.type)}
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {connection.name}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {connection.type.toUpperCase()}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(connection.status)}>
                            {connection.status}
                          </Badge>
                          <Badge className={getRefreshCwStatusColor(connection.syncStatus)}>
                            {connection.syncStatus}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="mt-3 flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                          Última sincronización: {connection.lastRefreshCw ? 
                            new Date(connection.lastRefreshCw).toLocaleString() : 'Nunca'
                          }
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => syncConnection(connection.id)}
                            disabled={loading}
                            tabIndex={0}
                            aria-label={`Sincronizar conexión ${connection.name}`}
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedConnection(connection.id)}
                            tabIndex={0}
                            aria-label={`Ver detalles de ${connection.name}`}
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {connection.errorMessage && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                          <AlertCircle className="h-4 w-4 inline mr-1" />
                          {connection.errorMessage}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab de Sincronización */}
        <TabsContent value="sync" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Estado de Sincronización</CardTitle>
              <CardDescription>
                Monitorea el estado de sincronización con LMS externos
              </CardDescription>
            </CardHeader>
            <CardContent>
              {syncStatus ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    {syncStatus.success ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-600" />
                    )}
                    <span className="font-semibold">
                      {syncStatus.success ? 'Sincronización Exitosa' : 'Error en Sincronización'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <Users className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                      <p className="text-2xl font-bold text-blue-900">{syncStatus.syncedUsers}</p>
                      <p className="text-sm text-blue-700">Usuarios</p>
                    </div>
                    
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <BookOpen className="h-8 w-8 mx-auto text-green-600 mb-2" />
                      <p className="text-2xl font-bold text-green-900">{syncStatus.syncedCourses}</p>
                      <p className="text-sm text-green-700">Cursos</p>
                    </div>
                    
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <Award className="h-8 w-8 mx-auto text-purple-600 mb-2" />
                      <p className="text-2xl font-bold text-purple-900">{syncStatus.syncedGrades}</p>
                      <p className="text-sm text-purple-700">Calificaciones</p>
                    </div>
                  </div>
                  
                  {syncStatus.errors.length > 0 && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <h4 className="font-semibold text-red-800 mb-2">Errores:</h4>
                      <ul className="text-sm text-red-700 space-y-1">
                        {syncStatus.errors.map((error, index) => (
                          <li key={index}>• {error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {syncStatus.warnings.length > 0 && (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <h4 className="font-semibold text-yellow-800 mb-2">Advertencias:</h4>
                      <ul className="text-sm text-yellow-700 space-y-1">
                        {syncStatus.warnings.map((warning, index) => (
                          <li key={index}>• {warning}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <RefreshCw className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">No hay sincronizaciones recientes</p>
                  <p className="text-sm text-gray-500">
                    Ejecuta una sincronización para ver el estado aquí
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab de Calificaciones */}
        <TabsContent value="grades" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Calificaciones Sincronizadas</CardTitle>
              <CardDescription>
                Visualiza y gestiona calificaciones de LMS externos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <select
                  value={selectedConnection}
                  onChange={(e) => {
                    setSelectedConnection(e.target.value);
                    if (e.target.value) {
                      loadGrades(e.target.value);
                    }
                  }}
                  className="w-full p-2 border rounded-lg"
                  tabIndex={0}
                  aria-label="Seleccionar conexión LMS para ver calificaciones"
                >
                  <option value="">Seleccionar conexión LMS</option>
                  {connections.map((connection) => (
                    <option key={connection.id} value={connection.id}>
                      {connection.name} ({connection.type})
                    </option>
                  ))}
                </select>
              </div>
              
              {selectedConnection && (
                <div className="space-y-4">
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <RefreshCw className="h-6 w-6 animate-spin" />
                      <span className="ml-2">Cargando calificaciones...</span>
                    </div>
                  ) : grades.length === 0 ? (
                    <div className="text-center py-8">
                      <Award className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-600">No hay calificaciones para esta conexión</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {grades.map((grade) => (
                        <div
                          key={grade.id}
                          className="border rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-800"
                          tabIndex={0}
                          aria-label={`Calificación: ${grade.score}/${grade.maxScore} - ${grade.percentage}%`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Usuario: {grade.userId}</p>
                              <p className="text-sm text-gray-600">Módulo: {grade.moduleId}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-lg">
                                {grade.score}/{grade.maxScore}
                              </p>
                              <p className="text-sm text-gray-600">
                                {grade.percentage.toFixed(1)}%
                              </p>
                            </div>
                          </div>
                          
                          {grade.feedback && (
                            <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                              <strong>Feedback:</strong> {grade.feedback}
                            </div>
                          )}
                          
                          <div className="mt-2 text-xs text-gray-500">
                            Sincronizado: {new Date(grade.lastRefreshCw).toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal para nueva conexión */}
      {showNewConnection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Nueva Conexión LMS</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Institución ID</label>
                <input
                  type="text"
                  value={newConnection.institutionId}
                  onChange={(e) => setNewConnection({
                    ...newConnection,
                    institutionId: e.target.value
                  })}
                  className="w-full p-2 border rounded"
                  tabIndex={0}
                  aria-label="ID de la institución"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Nombre</label>
                <input
                  type="text"
                  value={newConnection.name}
                  onChange={(e) => setNewConnection({
                    ...newConnection,
                    name: e.target.value
                  })}
                  className="w-full p-2 border rounded"
                  tabIndex={0}
                  aria-label="Nombre de la conexión"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Tipo de LMS</label>
                <select
                  value={newConnection.type}
                  onChange={(e) => setNewConnection({
                    ...newConnection,
                    type: e.target.value
                  })}
                  className="w-full p-2 border rounded"
                  tabIndex={0}
                  aria-label="Seleccionar tipo de LMS"
                >
                  <option value="moodle">Moodle</option>
                  <option value="canvas">Canvas</option>
                  <option value="blackboard">Blackboard</option>
                  <option value="schoology">Schoology</option>
                  <option value="google-classroom">Google Classroom</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">URL Base</label>
                <input
                  type="url"
                  value={newConnection.config.baseUrl}
                  onChange={(e) => setNewConnection({
                    ...newConnection,
                    config: { ...newConnection.config, baseUrl: e.target.value }
                  })}
                  className="w-full p-2 border rounded"
                  tabIndex={0}
                  aria-label="URL base del LMS"
                />
              </div>
              
              {newConnection.type === 'moodle' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">Usuario</label>
                    <input
                      type="text"
                      value={newConnection.config.username}
                      onChange={(e) => setNewConnection({
                        ...newConnection,
                        config: { ...newConnection.config, username: e.target.value }
                      })}
                      className="w-full p-2 border rounded"
                      tabIndex={0}
                      aria-label="Usuario de Moodle"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Contraseña</label>
                    <input
                      type="password"
                      value={newConnection.config.password}
                      onChange={(e) => setNewConnection({
                        ...newConnection,
                        config: { ...newConnection.config, password: e.target.value }
                      })}
                      className="w-full p-2 border rounded"
                      tabIndex={0}
                      aria-label="Contraseña de Moodle"
                    />
                  </div>
                </>
              )}
              
              {newConnection.type === 'canvas' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Token de Acceso</label>
                  <input
                    type="password"
                    value={newConnection.config.apiKey}
                    onChange={(e) => setNewConnection({
                      ...newConnection,
                      config: { ...newConnection.config, apiKey: e.target.value }
                    })}
                    className="w-full p-2 border rounded"
                    tabIndex={0}
                    aria-label="Token de acceso de Canvas"
                  />
                </div>
              )}
              
              {newConnection.type === 'blackboard' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">Client ID</label>
                    <input
                      type="text"
                      value={newConnection.config.clientId}
                      onChange={(e) => setNewConnection({
                        ...newConnection,
                        config: { ...newConnection.config, clientId: e.target.value }
                      })}
                      className="w-full p-2 border rounded"
                      tabIndex={0}
                      aria-label="Client ID de Blackboard"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Client Secret</label>
                    <input
                      type="password"
                      value={newConnection.config.clientSecret}
                      onChange={(e) => setNewConnection({
                        ...newConnection,
                        config: { ...newConnection.config, clientSecret: e.target.value }
                      })}
                      className="w-full p-2 border rounded"
                      tabIndex={0}
                      aria-label="Client Secret de Blackboard"
                    />
                  </div>
                </>
              )}
            </div>
            
            <div className="flex space-x-2 mt-6">
              <Button
                onClick={createConnection}
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                tabIndex={0}
                aria-label="Crear conexión LMS"
              >
                {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Crear'}
              </Button>
              <Button
                onClick={() => setShowNewConnection(false)}
                variant="outline"
                className="flex-1"
                tabIndex={0}
                aria-label="Cancelar creación de conexión"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
