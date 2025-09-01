'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { Badge } from './badge';
import { Progress } from './progress';
import { 
  AlertTriangle, 
  Trophy, 
  TrendingDown, 
  TrendingUp, 
  Users, 
  Clock, 
  Eye, 
  Phone, 
  MessageSquare,
  CheckCircle,
  XCircle,
  Info,
  Star,
  Heart,
  Target,
  Calendar,
  BookOpen,
  Activity,
  ArrowRight,
  RefreshCw,
  Filter,
  Search,
  Bell,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useScreenReader } from '@/components/accessibility/screen-reader';
import { useHighContrast } from '@/components/accessibility/high-contrast';

interface StudentAlert {
  id: string;
  studentId: string;
  studentName: string;
  avatar: string;
  type: 'risk' | 'achievement' | 'improvement' | 'warning';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  subject: string;
  progress: number;
  previousProgress: number;
  lastActivity: string;
  culturalBackground: string;
  specialNeeds: string[];
  learningStyle: string;
  recommendations: string[];
  createdAt: string;
  isRead: boolean;
  metadata: Record<string, any>;
}

interface TeacherAlertsProps {
  teacherId: string;
  className?: string;
  maxAlerts?: number;
  showFilters?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
  culturalContext?: string;
  language?: string;
}

interface AlertFilters {
  type: string;
  severity: string;
  subject: string;
  status: 'all' | 'unread' | 'read';
  search: string;
}

export const TeacherAlerts: React.FC<TeacherAlertsProps> = ({
  teacherId,
  className = '',
  maxAlerts = 10,
  showFilters = true,
  autoRefresh = true,
  refreshInterval = 300000, // 5 minutos
  culturalContext = 'general',
  language = 'es-MX'
}) => {
  const [alerts, setAlerts] = useState<StudentAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<AlertFilters>({
    type: '',
    severity: '',
    subject: '',
    status: 'all',
    search: ''
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<StudentAlert | null>(null);

  const { speak, isEnabled: screenReaderEnabled } = useScreenReader();
  const { isEnabled: highContrastEnabled, getStyles } = useHighContrast();

  // Cargar alertas
  const loadAlerts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Simular carga de alertas
      const mockAlerts: StudentAlert[] = [
        {
          id: '1',
          studentId: 'student-1',
          studentName: 'María González',
          avatar: '/avatars/maria.jpg',
          type: 'risk',
          title: 'Estudiante en riesgo académico',
          description: 'María ha mostrado una disminución significativa en su progreso de matemáticas',
          severity: 'high',
          subject: 'Matemáticas',
          progress: 45,
          previousProgress: 78,
          lastActivity: '3 días atrás',
          culturalBackground: 'maya',
          specialNeeds: ['dislexia'],
          learningStyle: 'visual',
          recommendations: [
            'Revisar contenido adaptativo asignado',
            'Contactar a la familia para apoyo',
            'Considerar sesión de tutoría individual',
            'Evaluar ajustes de accesibilidad'
          ],
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          isRead: false,
          metadata: {
            riskFactors: ['bajo_progreso', 'inactividad_prolongada'],
            interventionNeeded: true,
            familyContacted: false
          }
        },
        {
          id: '2',
          studentId: 'student-2',
          studentName: 'Carlos Méndez',
          avatar: '/avatars/carlos.jpg',
          type: 'achievement',
          title: 'Logro destacado alcanzado',
          description: 'Carlos completó exitosamente el módulo avanzado de ciencias',
          severity: 'low',
          subject: 'Ciencias',
          progress: 95,
          previousProgress: 82,
          lastActivity: '1 hora atrás',
          culturalBackground: 'náhuatl',
          specialNeeds: [],
          learningStyle: 'kinestésico',
          recommendations: [
            'Felicitar al estudiante',
            'Asignar contenido de enriquecimiento',
            'Compartir logro con la familia',
            'Considerar como mentor para otros estudiantes'
          ],
          createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          isRead: false,
          metadata: {
            achievementType: 'module_completion',
            difficultyLevel: 'advanced',
            timeSpent: 180
          }
        },
        {
          id: '3',
          studentId: 'student-3',
          studentName: 'Ana López',
          avatar: '/avatars/ana.jpg',
          type: 'improvement',
          title: 'Mejora significativa detectada',
          description: 'Ana ha mejorado notablemente en su comprensión lectora',
          severity: 'medium',
          subject: 'Lenguaje',
          progress: 88,
          previousProgress: 65,
          lastActivity: '2 horas atrás',
          culturalBackground: 'zapoteco',
          specialNeeds: ['tdah'],
          learningStyle: 'auditivo',
          recommendations: [
            'Reconocer el esfuerzo del estudiante',
            'Mantener estrategias que están funcionando',
            'Incrementar gradualmente la dificultad',
            'Compartir progreso con la familia'
          ],
          createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          isRead: true,
          metadata: {
            improvementAreas: ['comprension_lectora', 'vocabulario'],
            interventionSuccess: true,
            familyNotified: true
          }
        }
      ];

      setAlerts(mockAlerts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando alertas');
      console.error('Error cargando alertas:', err);
    } finally {
      setIsLoading(false);
    }
  }, [teacherId]);

  // Cargar alertas al montar
  useEffect(() => {
    loadAlerts();
  }, [loadAlerts]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(loadAlerts, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, loadAlerts]);

  // Filtrar alertas
  const filteredAlerts = alerts.filter(alert => {
    if (filters.type && alert.type !== filters.type) return false;
    if (filters.severity && alert.severity !== filters.severity) return false;
    if (filters.subject && alert.subject !== filters.subject) return false;
    if (filters.status === 'unread' && alert.isRead) return false;
    if (filters.status === 'read' && !alert.isRead) return false;
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        alert.studentName.toLowerCase().includes(searchLower) ||
        alert.title.toLowerCase().includes(searchLower) ||
        alert.description.toLowerCase().includes(searchLower) ||
        alert.subject.toLowerCase().includes(searchLower)
      );
    }
    return true;
  }).slice(0, maxAlerts);

  // Marcar como leída
  const markAsRead = useCallback(async (alertId: string) => {
    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setAlerts(prev => 
        prev.map(alert => 
          alert.id === alertId 
            ? { ...alert, isRead: true }
            : alert
        )
      );

      if (screenReaderEnabled) {
        const alert = alerts.find(a => a.id === alertId);
        speak(`Alerta marcada como leída: ${alert?.title}`);
      }
    } catch (error) {
      console.error('Error marcando alerta como leída:', error);
    }
  }, [alerts, speak, screenReaderEnabled]);

  // Obtener icono según tipo
  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'risk':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'achievement':
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 'improvement':
        return <TrendingUp className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <Info className="w-5 h-5 text-blue-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  // Obtener color según severidad
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'border-red-600 bg-red-50';
      case 'high':
        return 'border-orange-500 bg-orange-50';
      case 'medium':
        return 'border-yellow-500 bg-yellow-50';
      case 'low':
        return 'border-green-500 bg-green-50';
      default:
        return 'border-gray-300 bg-white';
    }
  };

  // Obtener texto cultural
  const getCulturalText = (key: string) => {
    const texts: Record<string, Record<string, string>> = {
      'teacher_alerts': {
        'es-MX': 'Alertas del Maestro',
        'maya': 'Alertas del Maestro',
        'nahuatl': 'Alertas del Maestro'
      },
      'no_alerts': {
        'es-MX': 'No hay alertas',
        'maya': 'Ma\' t\'aan alertas',
        'nahuatl': 'Amo alertas'
      },
      'loading': {
        'es-MX': 'Cargando alertas...',
        'maya': 'Cargando alertas...',
        'nahuatl': 'Cargando alertas...'
      }
    };
    
    return texts[key]?.[language] || texts[key]?.['es-MX'] || key;
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span>{getCulturalText('loading')}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 text-red-600">
            <XCircle className="w-5 h-5" />
            <span>Error: {error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
            <Bell className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold">{getCulturalText('teacher_alerts')}</h2>
            <p className="text-sm text-gray-600">
              {filteredAlerts.length} alertas • {filteredAlerts.filter(a => !a.isRead).length} no leídas
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadAlerts}
            disabled={isLoading}
            aria-label="Actualizar alertas"
            tabIndex={0}
          >
            <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
          </Button>
          {showFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              aria-label="Alternar filtros"
              tabIndex={0}
            >
              <Filter className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Filtros avanzados */}
      {showFilters && showAdvancedFilters && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Tipo</label>
                <select
                  value={filters.type}
                  onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  aria-label="Filtrar por tipo"
                  tabIndex={0}
                >
                  <option value="">Todos los tipos</option>
                  <option value="risk">Riesgo</option>
                  <option value="achievement">Logro</option>
                  <option value="improvement">Mejora</option>
                  <option value="warning">Advertencia</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Severidad</label>
                <select
                  value={filters.severity}
                  onChange={(e) => setFilters(prev => ({ ...prev, severity: e.target.value }))}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  aria-label="Filtrar por severidad"
                  tabIndex={0}
                >
                  <option value="">Todas las severidades</option>
                  <option value="critical">Crítica</option>
                  <option value="high">Alta</option>
                  <option value="medium">Media</option>
                  <option value="low">Baja</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Materia</label>
                <select
                  value={filters.subject}
                  onChange={(e) => setFilters(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  aria-label="Filtrar por materia"
                  tabIndex={0}
                >
                  <option value="">Todas las materias</option>
                  <option value="Matemáticas">Matemáticas</option>
                  <option value="Ciencias">Ciencias</option>
                  <option value="Lenguaje">Lenguaje</option>
                  <option value="Historia">Historia</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Estado</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as any }))}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  aria-label="Filtrar por estado"
                  tabIndex={0}
                >
                  <option value="all">Todas</option>
                  <option value="unread">No leídas</option>
                  <option value="read">Leídas</option>
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium mb-2">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar por estudiante, título, materia..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="w-full pl-10 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  aria-label="Buscar alertas"
                  tabIndex={0}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de alertas */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">{getCulturalText('no_alerts')}</p>
            </CardContent>
          </Card>
        ) : (
          filteredAlerts.map((alert) => (
            <Card
              key={alert.id}
              className={cn(
                "hover:shadow-md transition-all duration-200 cursor-pointer",
                !alert.isRead && "ring-2 ring-blue-500 bg-blue-50",
                getSeverityColor(alert.severity)
              )}
              onClick={() => setSelectedAlert(alert)}
              style={highContrastEnabled ? getStyles() : {}}
              tabIndex={0}
              role="button"
              aria-label={`Alerta: ${alert.title} - ${alert.studentName}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setSelectedAlert(alert);
                }
              }}
            >
              <CardContent className="p-4">
                <div className="flex items-start space-x-4">
                  {/* Avatar y icono */}
                  <div className="flex-shrink-0">
                    <div className="relative">
                      <img
                        src={alert.avatar}
                        alt={`Avatar de ${alert.studentName}`}
                        className="w-12 h-12 rounded-full"
                      />
                      <div className="absolute -top-1 -right-1">
                        {getAlertIcon(alert.type)}
                      </div>
                    </div>
                  </div>

                  {/* Contenido principal */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold text-lg">{alert.studentName}</h3>
                          <Badge 
                            variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}
                            className="text-xs"
                          >
                            {alert.severity}
                          </Badge>
                          {!alert.isRead && (
                            <Badge variant="default" className="text-xs bg-blue-500">
                              Nuevo
                            </Badge>
                          )}
                        </div>
                        
                        <h4 className="font-medium text-gray-900 mb-1">{alert.title}</h4>
                        <p className="text-sm text-gray-600 mb-3">{alert.description}</p>
                        
                        <div className="flex items-center space-x-4 text-xs text-gray-500 mb-3">
                          <div className="flex items-center space-x-1">
                            <BookOpen className="w-3 h-3" />
                            <span>{alert.subject}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{alert.lastActivity}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Activity className="w-3 h-3" />
                            <span>{alert.culturalBackground}</span>
                          </div>
                        </div>

                        {/* Progreso */}
                        <div className="mb-3">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span>Progreso actual: {alert.progress}%</span>
                            <span className={cn(
                              alert.progress > alert.previousProgress ? 'text-green-600' : 'text-red-600'
                            )}>
                              {alert.progress > alert.previousProgress ? '+' : ''}{alert.progress - alert.previousProgress}%
                            </span>
                          </div>
                          <Progress value={alert.progress} className="h-2" />
                        </div>
                      </div>

                      {/* Acciones */}
                      <div className="flex items-center space-x-2">
                        {!alert.isRead && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(alert.id);
                            }}
                            aria-label="Marcar como leída"
                            tabIndex={0}
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Acción para ver detalles
                          }}
                          aria-label="Ver detalles"
                          tabIndex={0}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Modal de detalles */}
      {selectedAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-3">
                  {getAlertIcon(selectedAlert.type)}
                  <span>Detalles de la Alerta</span>
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedAlert(null)}
                  aria-label="Cerrar detalles"
                  tabIndex={0}
                >
                  <XCircle className="w-5 h-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <img
                  src={selectedAlert.avatar}
                  alt={`Avatar de ${selectedAlert.studentName}`}
                  className="w-16 h-16 rounded-full"
                />
                <div>
                  <h3 className="text-xl font-bold">{selectedAlert.studentName}</h3>
                  <p className="text-gray-600">{selectedAlert.subject}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant="secondary">{selectedAlert.culturalBackground}</Badge>
                    <Badge variant="outline">{selectedAlert.learningStyle}</Badge>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Descripción</h4>
                <p className="text-gray-700">{selectedAlert.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Progreso</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Actual:</span>
                      <span className="font-semibold">{selectedAlert.progress}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Anterior:</span>
                      <span>{selectedAlert.previousProgress}%</span>
                    </div>
                    <Progress value={selectedAlert.progress} className="h-2" />
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Información</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Última actividad:</span>
                      <span>{selectedAlert.lastActivity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Necesidades especiales:</span>
                      <span>{selectedAlert.specialNeeds.join(', ') || 'Ninguna'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Recomendaciones</h4>
                <ul className="space-y-1">
                  {selectedAlert.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <Star className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Acción para contactar familia
                    }}
                    aria-label="Contactar familia"
                    tabIndex={0}
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Contactar Familia
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Acción para enviar mensaje
                    }}
                    aria-label="Enviar mensaje"
                    tabIndex={0}
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Enviar Mensaje
                  </Button>
                </div>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => {
                    // Acción para ver perfil completo
                  }}
                  aria-label="Ver perfil completo"
                  tabIndex={0}
                >
                  Ver Perfil Completo
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default TeacherAlerts;
