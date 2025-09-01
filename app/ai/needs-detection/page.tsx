'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  Eye, 
  Ear, 
  Heart, 
  BookOpen, 
  Users, 
  CheckCircle, 
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Lightbulb,
  Target,
  TrendingUp,
  Settings,
  Download,
  Share,
  RefreshCw,
  BarChart3,
  PieChart,
  LineChart,
  Calendar,
  Clock,
  Star,
  Award,
  Zap,
  Globe,
  Palette,
  Headphones,
  Monitor,
  Smartphone,
  Tablet,
  Wifi,
  WifiOff,
  Database,
  Server,
  Cpu,
  HardDrive,
  Shield,
  Lock,
  Unlock,
  Key,
  Bell,
  Mail,
  Phone,
  Video,
  Image,
  FileText,
  File,
  Folder,
  FolderOpen,
  Search,
  Filter,
  Plus,
  Minus,
  Edit,
  Trash2,
  Copy,
  ExternalLink,
  Link,
  Unlink,
  Save,
  Maximize2,
  Minimize2,
  RotateCcw,
  Eye as EyeIcon,
  MousePointer,
  Scroll,
  Move,
  Crown,
  Coins,
  Gift,
  Package,
  Tag,
  Percent,
  Equal,
  ArrowUp,
  ArrowDown,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  ArrowUpLeft,
  ArrowDownLeft,
  CornerUpLeft,
  CornerUpRight,
  CornerDownLeft,
  CornerDownRight,
  MoveUp,
  MoveDown,
  MoveLeft,
  MoveRight,
  RotateCw,
  Target as TargetIcon,
  Users2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { NeedsDetectionWizard } from '@/components/ai/NeedsDetectionWizard';

interface AssessmentResult {
  category: string;
  score: number;
  needs: string[];
  recommendations: string[];
  confidence: number;
}

interface UserNeeds {
  id: string;
  userId: string;
  assessmentDate: Date;
  results: AssessmentResult[];
  status: 'pending' | 'in_progress' | 'completed' | 'reviewed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  notes: string;
  nextReviewDate: Date;
}

export default function NeedsDetectionPage() {
  const [currentUser, setCurrentUser] = useState<string>('user_123');
  const [userNeeds, setUserNeeds] = useState<UserNeeds[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showWizard, setShowWizard] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState<UserNeeds | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'assessments' | 'reports' | 'settings'>('overview');

  // Datos de ejemplo
  const mockUserNeeds: UserNeeds[] = [
    {
      id: 'assessment_1',
      userId: 'user_123',
      assessmentDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      results: [
        {
          category: 'Visual',
          score: 75,
          needs: ['Ampliación de texto', 'Alto contraste'],
          recommendations: ['Usar modo oscuro', 'Aumentar tamaño de fuente'],
          confidence: 0.85
        },
        {
          category: 'Auditivo',
          score: 90,
          needs: ['Subtítulos opcionales'],
          recommendations: ['Activar subtítulos automáticos'],
          confidence: 0.92
        }
      ],
      status: 'completed',
      priority: 'medium',
      notes: 'Usuario muestra preferencia por contenido visual con alto contraste',
      nextReviewDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    },
    {
      id: 'assessment_2',
      userId: 'user_123',
      assessmentDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      results: [
        {
          category: 'Cognitivo',
          score: 60,
          needs: ['Instrucciones simplificadas', 'Tiempo adicional'],
          recommendations: ['Dividir tareas complejas', 'Proporcionar recordatorios'],
          confidence: 0.78
        }
      ],
      status: 'reviewed',
      priority: 'high',
      notes: 'Necesita apoyo adicional para tareas complejas',
      nextReviewDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
    }
  ];

  useEffect(() => {
    loadUserNeeds();
  }, []);

  const loadUserNeeds = async () => {
    try {
      setIsLoading(true);
      // En producción, esto sería una llamada a la API
      // const response = await fetch(`/api/ai/needs-detection/${currentUser}`);
      // const data = await response.json();
      
      // Simulando carga
      await new Promise(resolve => setTimeout(resolve, 1000));
      setUserNeeds(mockUserNeeds);
    } catch (error) {
      console.error('Error loading user needs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssessmentComplete = (results: AssessmentResult[]) => {
    const newAssessment: UserNeeds = {
      id: `assessment_${Date.now()}`,
      userId: currentUser,
      assessmentDate: new Date(),
      results,
      status: 'completed',
      priority: 'medium',
      notes: 'Nueva evaluación completada',
      nextReviewDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    };

    setUserNeeds(prev => [newAssessment, ...prev]);
    setShowWizard(false);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'in_progress': return 'text-blue-600 bg-blue-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'reviewed': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-MX');
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (showWizard) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button 
            onClick={() => setShowWizard(false)}
            variant="outline"
            className="flex items-center space-x-2"
            tabIndex={0}
            aria-label="Volver a la página principal"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver</span>
          </Button>
        </div>
        <NeedsDetectionWizard 
          userId={currentUser}
          onComplete={handleAssessmentComplete}
          onCancel={() => setShowWizard(false)}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Detección de Necesidades</h1>
              <p className="text-gray-600">Análisis inteligente de necesidades de accesibilidad y aprendizaje</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button 
              onClick={() => loadUserNeeds()}
              variant="outline"
              className="flex items-center space-x-2"
              tabIndex={0}
              aria-label="Actualizar datos"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Actualizar</span>
            </Button>
            <Button 
              onClick={() => setShowWizard(true)}
              className="flex items-center space-x-2"
              tabIndex={0}
              aria-label="Nueva evaluación"
            >
              <Plus className="w-4 h-4" />
              <span>Nueva Evaluación</span>
            </Button>
          </div>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Brain className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium">Evaluaciones Totales</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {userNeeds.length}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium">Completadas</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {userNeeds.filter(need => need.status === 'completed').length}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-orange-600" />
                <span className="text-sm font-medium">Alta Prioridad</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {userNeeds.filter(need => need.priority === 'high' || need.priority === 'critical').length}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium">Próximas Revisiones</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {userNeeds.filter(need => need.nextReviewDate <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)).length}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tabs de navegación */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Resumen', icon: BarChart3 },
              { id: 'assessments', label: 'Evaluaciones', icon: FileText },
              { id: 'reports', label: 'Reportes', icon: PieChart },
              { id: 'settings', label: 'Configuración', icon: Settings }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm",
                    activeTab === tab.id
                      ? "border-purple-500 text-purple-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  )}
                  tabIndex={0}
                  aria-label={`Ver ${tab.label}`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Contenido de tabs */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Última evaluación */}
          {userNeeds.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="w-5 h-5 text-purple-600" />
                  <span>Última Evaluación</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {userNeeds[0].results.map((result, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        {result.category === 'Visual' && <Eye className="w-5 h-5 text-blue-600" />}
                        {result.category === 'Auditivo' && <Ear className="w-5 h-5 text-green-600" />}
                        {result.category === 'Cognitivo' && <Brain className="w-5 h-5 text-purple-600" />}
                        {result.category === 'Motor' && <Target className="w-5 h-5 text-orange-600" />}
                        <div>
                          <div className="font-medium">{result.category}</div>
                          <div className="text-sm text-gray-600">
                            {result.needs.length} necesidades identificadas
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-purple-600">{result.score}%</div>
                        <div className="text-sm text-gray-600">Puntuación</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recomendaciones rápidas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lightbulb className="w-5 h-5 text-yellow-600" />
                <span>Recomendaciones Rápidas</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userNeeds.length > 0 && userNeeds[0].results.slice(0, 4).map((result, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg">
                    <h4 className="font-medium mb-2">{result.category}</h4>
                    <ul className="space-y-1">
                      {result.recommendations.slice(0, 2).map((rec, recIndex) => (
                        <li key={recIndex} className="text-sm text-gray-600 flex items-center space-x-2">
                          <CheckCircle className="w-3 h-3 text-green-600" />
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'assessments' && (
        <div className="space-y-4">
          {userNeeds.map((assessment) => (
            <Card key={assessment.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Brain className="w-5 h-5 text-purple-600" />
                    <div>
                      <h3 className="font-semibold">Evaluación #{assessment.id.split('_')[1]}</h3>
                      <p className="text-sm text-gray-600">
                        Realizada el {formatDate(assessment.assessmentDate)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={cn("text-xs", getStatusColor(assessment.status))}>
                      {assessment.status === 'completed' ? 'Completada' :
                       assessment.status === 'in_progress' ? 'En Progreso' :
                       assessment.status === 'pending' ? 'Pendiente' : 'Revisada'}
                    </Badge>
                    <Badge className={cn("text-xs", getPriorityColor(assessment.priority))}>
                      {assessment.priority === 'critical' ? 'Crítica' :
                       assessment.priority === 'high' ? 'Alta' :
                       assessment.priority === 'medium' ? 'Media' : 'Baja'}
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <span className="text-sm text-gray-600">Categorías evaluadas:</span>
                    <div className="font-medium">{assessment.results.length}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Próxima revisión:</span>
                    <div className="font-medium">{formatDate(assessment.nextReviewDate)}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Confianza promedio:</span>
                    <div className="font-medium">
                      {Math.round(assessment.results.reduce((acc, r) => acc + r.confidence, 0) / assessment.results.length * 100)}%
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="text-sm text-gray-600">
                    {assessment.notes}
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setSelectedAssessment(assessment)}
                      tabIndex={0}
                      aria-label="Ver detalles de la evaluación"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      Ver Detalles
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      tabIndex={0}
                      aria-label="Exportar evaluación"
                    >
                      <Download className="w-3 h-3 mr-1" />
                      Exportar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Reportes de Necesidades</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Generar Reporte</h4>
                  <div className="space-y-2">
                    <Button className="w-full justify-start" variant="outline">
                      <FileText className="w-4 h-4 mr-2" />
                      Reporte Resumido
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Reporte Detallado
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Reporte de Progreso
                    </Button>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-medium">Reportes Recientes</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">Reporte Mensual</div>
                        <div className="text-sm text-gray-600">Generado hace 2 días</div>
                      </div>
                      <Button size="sm" variant="outline">
                        <Download className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Evaluaciones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Frecuencia de Evaluaciones</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                    <option>Mensual</option>
                    <option>Trimestral</option>
                    <option>Semestral</option>
                    <option>Anual</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Recordatorios</label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      <span>Enviar recordatorios por email</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      <span>Notificaciones en la aplicación</span>
                    </label>
                  </div>
                </div>
                <Button className="w-full">
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Configuración
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal de detalles */}
      {selectedAssessment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Detalles de Evaluación</h3>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedAssessment(null)}
                  tabIndex={0}
                  aria-label="Cerrar detalles"
                >
                  <XCircle className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-4">
                {selectedAssessment.results.map((result, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">{result.category}</h4>
                      <div className="text-right">
                        <div className="text-lg font-bold text-purple-600">{result.score}%</div>
                        <div className="text-sm text-gray-600">Confianza: {Math.round(result.confidence * 100)}%</div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <h5 className="font-medium text-sm mb-2">Necesidades Identificadas:</h5>
                        <ul className="space-y-1">
                          {result.needs.map((need, needIndex) => (
                            <li key={needIndex} className="text-sm text-gray-600 flex items-center space-x-2">
                              <AlertCircle className="w-3 h-3 text-orange-600" />
                              <span>{need}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h5 className="font-medium text-sm mb-2">Recomendaciones:</h5>
                        <ul className="space-y-1">
                          {result.recommendations.map((rec, recIndex) => (
                            <li key={recIndex} className="text-sm text-gray-600 flex items-center space-x-2">
                              <CheckCircle className="w-3 h-3 text-green-600" />
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 pt-4 border-t">
                <div className="text-sm text-gray-600 mb-2">
                  <strong>Notas:</strong> {selectedAssessment.notes}
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline">
                    <Download className="w-3 h-3 mr-1" />
                    Exportar
                  </Button>
                  <Button size="sm" variant="outline">
                    <Share className="w-3 h-3 mr-1" />
                    Compartir
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
