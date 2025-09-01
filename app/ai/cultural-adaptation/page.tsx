'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Globe, 
  Languages, 
  Users, 
  Palette, 
  Settings, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Eye,
  Ear,
  Brain,
  Heart,
  BookOpen,
  Star,
  RefreshCw,
  Save,
  Download,
  Upload,
  Zap,
  Target,
  Lightbulb,
  TrendingUp,
  BarChart3,
  PieChart,
  LineChart,
  Calendar,
  Clock,
  Award,
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
  Users2,
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
  Lock,
  Unlock,
  Shield,
  Key,
  Bell,
  Mail,
  Phone,
  Video,
  Image,
  Monitor,
  Smartphone,
  Tablet,
  Wifi,
  WifiOff,
  Database,
  Server,
  Cpu,
  HardDrive,
  Maximize2,
  Minimize2,
  RotateCcw,
  Eye as EyeIcon,
  MousePointer,
  Scroll,
  Move,
  Play,
  Pause,
  Stop,
  Volume2,
  VolumeX,
  Headphones,
  Speaker,
  Music,
  Waveform,
  Sliders,
  XCircle,
  Share
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { CulturalAdaptationPanel } from '@/components/ai/CulturalAdaptationPanel';

interface CulturalContext {
  id: string;
  name: string;
  language: string;
  region: string;
  description: string;
  icon: string;
  color: string;
  adaptations: CulturalAdaptation[];
}

interface CulturalAdaptation {
  id: string;
  type: 'visual' | 'auditory' | 'cognitive' | 'emotional' | 'linguistic';
  name: string;
  description: string;
  enabled: boolean;
  priority: 'low' | 'medium' | 'high';
  impact: number;
}

interface AdaptationSettings {
  userId: string;
  culturalContext: string;
  adaptations: Record<string, boolean>;
  preferences: {
    language: string;
    visualStyle: 'traditional' | 'modern' | 'minimal';
    audioEnabled: boolean;
    textSize: 'small' | 'medium' | 'large';
    colorScheme: 'default' | 'high-contrast' | 'cultural';
    interactionStyle: 'direct' | 'respectful' | 'formal';
  };
  learningStyle: {
    visual: number;
    auditory: number;
    kinesthetic: number;
    reading: number;
  };
}

interface CulturalProfile {
  id: string;
  userId: string;
  context: string;
  settings: AdaptationSettings;
  lastUpdated: Date;
  effectiveness: number;
  usageStats: {
    totalSessions: number;
    averageSessionTime: number;
    satisfactionScore: number;
  };
}

export default function CulturalAdaptationPage() {
  const [currentUser, setCurrentUser] = useState<string>('user_123');
  const [culturalProfiles, setCulturalProfiles] = useState<CulturalProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showPanel, setShowPanel] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<CulturalProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'profiles' | 'analytics' | 'settings'>('overview');

  // Datos de ejemplo
  const mockCulturalProfiles: CulturalProfile[] = [
    {
      id: 'profile_1',
      userId: 'user_123',
      context: 'maya',
      settings: {
        userId: 'user_123',
        culturalContext: 'maya',
        adaptations: {
          'maya_visual': true,
          'maya_linguistic': true,
          'maya_emotional': false
        },
        preferences: {
          language: 'Maya',
          visualStyle: 'traditional',
          audioEnabled: true,
          textSize: 'medium',
          colorScheme: 'cultural',
          interactionStyle: 'respectful'
        },
        learningStyle: {
          visual: 70,
          auditory: 60,
          kinesthetic: 40,
          reading: 50
        }
      },
      lastUpdated: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      effectiveness: 85,
      usageStats: {
        totalSessions: 45,
        averageSessionTime: 25,
        satisfactionScore: 4.2
      }
    },
    {
      id: 'profile_2',
      userId: 'user_123',
      context: 'nahuatl',
      settings: {
        userId: 'user_123',
        culturalContext: 'nahuatl',
        adaptations: {
          'nahuatl_visual': true,
          'nahuatl_linguistic': true,
          'nahuatl_cognitive': true
        },
        preferences: {
          language: 'Náhuatl',
          visualStyle: 'modern',
          audioEnabled: true,
          textSize: 'large',
          colorScheme: 'high-contrast',
          interactionStyle: 'direct'
        },
        learningStyle: {
          visual: 80,
          auditory: 75,
          kinesthetic: 60,
          reading: 65
        }
      },
      lastUpdated: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      effectiveness: 92,
      usageStats: {
        totalSessions: 32,
        averageSessionTime: 30,
        satisfactionScore: 4.5
      }
    }
  ];

  useEffect(() => {
    loadCulturalProfiles();
  }, []);

  const loadCulturalProfiles = async () => {
    try {
      setIsLoading(true);
      // En producción, esto sería una llamada a la API
      // const response = await fetch(`/api/ai/cultural-adaptation/${currentUser}`);
      // const data = await response.json();
      
      // Simulando carga
      await new Promise(resolve => setTimeout(resolve, 1000));
      setCulturalProfiles(mockCulturalProfiles);
    } catch (error) {
      console.error('Error loading cultural profiles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdaptationChange = (settings: AdaptationSettings) => {
    console.log('Adaptation settings changed:', settings);
  };

  const handleSaveSettings = (settings: AdaptationSettings) => {
    const updatedProfile: CulturalProfile = {
      id: `profile_${Date.now()}`,
      userId: currentUser,
      context: settings.culturalContext,
      settings,
      lastUpdated: new Date(),
      effectiveness: 85,
      usageStats: {
        totalSessions: 0,
        averageSessionTime: 0,
        satisfactionScore: 0
      }
    };

    setCulturalProfiles(prev => [updatedProfile, ...prev]);
    setShowPanel(false);
  };

  const getEffectivenessColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 80) return 'text-blue-600 bg-blue-100';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
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

  if (showPanel) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button 
            onClick={() => setShowPanel(false)}
            variant="outline"
            className="flex items-center space-x-2"
            tabIndex={0}
            aria-label="Volver a la página principal"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver</span>
          </Button>
        </div>
        <CulturalAdaptationPanel 
          userId={currentUser}
          onAdaptationChange={handleAdaptationChange}
          onSave={handleSaveSettings}
          onCancel={() => setShowPanel(false)}
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
            <div className="p-3 bg-gradient-to-r from-green-500 to-teal-600 rounded-lg">
              <Globe className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Adaptación Cultural</h1>
              <p className="text-gray-600">Personalización inteligente basada en contextos culturales</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button 
              onClick={() => loadCulturalProfiles()}
              variant="outline"
              className="flex items-center space-x-2"
              tabIndex={0}
              aria-label="Actualizar datos"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Actualizar</span>
            </Button>
            <Button 
              onClick={() => setShowPanel(true)}
              className="flex items-center space-x-2"
              tabIndex={0}
              aria-label="Nueva adaptación"
            >
              <Plus className="w-4 h-4" />
              <span>Nueva Adaptación</span>
            </Button>
          </div>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Globe className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium">Perfiles Culturales</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {culturalProfiles.length}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-yellow-600" />
                <span className="text-sm font-medium">Efectividad Promedio</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {culturalProfiles.length > 0 
                  ? Math.round(culturalProfiles.reduce((acc, p) => acc + p.effectiveness, 0) / culturalProfiles.length)
                  : 0}%
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium">Sesiones Totales</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {culturalProfiles.reduce((acc, p) => acc + p.usageStats.totalSessions, 0)}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Heart className="w-5 h-5 text-red-600" />
                <span className="text-sm font-medium">Satisfacción</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {culturalProfiles.length > 0 
                  ? (culturalProfiles.reduce((acc, p) => acc + p.usageStats.satisfactionScore, 0) / culturalProfiles.length).toFixed(1)
                  : '0.0'}/5.0
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
              { id: 'profiles', label: 'Perfiles', icon: Users },
              { id: 'analytics', label: 'Analytics', icon: PieChart },
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
                      ? "border-green-500 text-green-600"
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
          {/* Perfil más efectivo */}
          {culturalProfiles.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Star className="w-5 h-5 text-yellow-600" />
                  <span>Perfil Más Efectivo</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const bestProfile = culturalProfiles.reduce((best, current) => 
                    current.effectiveness > best.effectiveness ? current : best
                  );
                  return (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="text-2xl">{bestProfile.context === 'maya' ? '🌿' : '🌺'}</div>
                          <div>
                            <div className="font-medium capitalize">{bestProfile.context}</div>
                            <div className="text-sm text-gray-600">
                              {bestProfile.settings.preferences.language} • {bestProfile.usageStats.totalSessions} sesiones
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-600">{bestProfile.effectiveness}%</div>
                          <div className="text-sm text-gray-600">Efectividad</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <span className="text-sm text-gray-600">Estilo Visual:</span>
                          <div className="font-medium capitalize">{bestProfile.settings.preferences.visualStyle}</div>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Esquema de Color:</span>
                          <div className="font-medium capitalize">{bestProfile.settings.preferences.colorScheme}</div>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Satisfacción:</span>
                          <div className="font-medium">{bestProfile.usageStats.satisfactionScore}/5.0</div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          )}

          {/* Adaptaciones activas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-blue-600" />
                <span>Adaptaciones Activas</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {culturalProfiles.length > 0 && culturalProfiles[0].settings.adaptations && 
                  Object.entries(culturalProfiles[0].settings.adaptations)
                    .filter(([_, enabled]) => enabled)
                    .slice(0, 6)
                    .map(([adaptationId, enabled], index) => (
                      <div key={index} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="font-medium">{adaptationId.replace('_', ' ').toUpperCase()}</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          Adaptación {adaptationId.includes('visual') ? 'visual' : 
                                     adaptationId.includes('linguistic') ? 'lingüística' : 
                                     adaptationId.includes('cognitive') ? 'cognitiva' : 'cultural'} activa
                        </div>
                      </div>
                    ))
                }
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'profiles' && (
        <div className="space-y-4">
          {culturalProfiles.map((profile) => (
            <Card key={profile.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{profile.context === 'maya' ? '🌿' : '🌺'}</div>
                    <div>
                      <h3 className="font-semibold capitalize">{profile.context}</h3>
                      <p className="text-sm text-gray-600">
                        Actualizado el {formatDate(profile.lastUpdated)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={cn("text-xs", getEffectivenessColor(profile.effectiveness))}>
                      {profile.effectiveness}% Efectivo
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {profile.settings.preferences.language}
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <span className="text-sm text-gray-600">Sesiones:</span>
                    <div className="font-medium">{profile.usageStats.totalSessions}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Tiempo promedio:</span>
                    <div className="font-medium">{profile.usageStats.averageSessionTime} min</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Satisfacción:</span>
                    <div className="font-medium">{profile.usageStats.satisfactionScore}/5.0</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Adaptaciones:</span>
                    <div className="font-medium">
                      {Object.values(profile.settings.adaptations).filter(Boolean).length} activas
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="text-sm text-gray-600">
                    Estilo: {profile.settings.preferences.visualStyle} • 
                    Color: {profile.settings.preferences.colorScheme}
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setSelectedProfile(profile)}
                      tabIndex={0}
                      aria-label="Ver detalles del perfil"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      Ver Detalles
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      tabIndex={0}
                      aria-label="Editar perfil"
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Editar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Efectividad por Contexto</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {culturalProfiles.map((profile) => (
                    <div key={profile.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="text-lg">{profile.context === 'maya' ? '🌿' : '🌺'}</div>
                        <span className="font-medium capitalize">{profile.context}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Progress value={profile.effectiveness} className="w-20 h-2" />
                        <span className="text-sm font-medium">{profile.effectiveness}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Uso de Adaptaciones</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {culturalProfiles.length > 0 && 
                    Object.entries(culturalProfiles[0].settings.adaptations).map(([adaptationId, enabled]) => (
                      <div key={adaptationId} className="flex items-center justify-between">
                        <span className="text-sm capitalize">
                          {adaptationId.replace('_', ' ')}
                        </span>
                        <Badge className={enabled ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                          {enabled ? 'Activa' : 'Inactiva'}
                        </Badge>
                      </div>
                    ))
                  }
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Reportes de Adaptación Cultural</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Generar Reporte</h4>
                  <div className="space-y-2">
                    <Button className="w-full justify-start" variant="outline">
                      <FileText className="w-4 h-4 mr-2" />
                      Reporte de Efectividad
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Análisis de Uso
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Tendencias Culturales
                    </Button>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-medium">Exportar Datos</h4>
                  <div className="space-y-2">
                    <Button className="w-full justify-start" variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Exportar Perfiles
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Database className="w-4 h-4 mr-2" />
                      Datos de Analytics
                    </Button>
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
              <CardTitle>Configuración de Adaptación Cultural</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Contexto Cultural Predeterminado</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                    <option value="maya">Maya</option>
                    <option value="nahuatl">Náhuatl</option>
                    <option value="mixteco">Mixteco</option>
                    <option value="zapoteco">Zapoteco</option>
                    <option value="auto">Detección Automática</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Nivel de Adaptación</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                    <option value="minimal">Mínimo</option>
                    <option value="moderate">Moderado</option>
                    <option value="comprehensive">Completo</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Preferencias</label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" defaultChecked />
                      <span>Aplicar adaptaciones automáticamente</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      <span>Permitir personalización manual</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" defaultChecked />
                      <span>Recopilar datos de efectividad</span>
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
      {selectedProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Detalles del Perfil Cultural</h3>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedProfile(null)}
                  tabIndex={0}
                  aria-label="Cerrar detalles"
                >
                  <XCircle className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  <div className="text-3xl">{selectedProfile.context === 'maya' ? '🌿' : '🌺'}</div>
                  <div>
                    <h4 className="font-medium capitalize">{selectedProfile.context}</h4>
                    <p className="text-sm text-gray-600">{selectedProfile.settings.preferences.language}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-medium mb-2">Preferencias</h5>
                    <div className="space-y-1 text-sm">
                      <div><strong>Estilo Visual:</strong> {selectedProfile.settings.preferences.visualStyle}</div>
                      <div><strong>Esquema de Color:</strong> {selectedProfile.settings.preferences.colorScheme}</div>
                      <div><strong>Estilo de Interacción:</strong> {selectedProfile.settings.preferences.interactionStyle}</div>
                      <div><strong>Tamaño de Texto:</strong> {selectedProfile.settings.preferences.textSize}</div>
                    </div>
                  </div>
                  <div>
                    <h5 className="font-medium mb-2">Estadísticas</h5>
                    <div className="space-y-1 text-sm">
                      <div><strong>Efectividad:</strong> {selectedProfile.effectiveness}%</div>
                      <div><strong>Sesiones:</strong> {selectedProfile.usageStats.totalSessions}</div>
                      <div><strong>Tiempo Promedio:</strong> {selectedProfile.usageStats.averageSessionTime} min</div>
                      <div><strong>Satisfacción:</strong> {selectedProfile.usageStats.satisfactionScore}/5.0</div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h5 className="font-medium mb-2">Adaptaciones Activas</h5>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(selectedProfile.settings.adaptations)
                      .filter(([_, enabled]) => enabled)
                      .map(([adaptationId, enabled]) => (
                        <div key={adaptationId} className="flex items-center space-x-2 p-2 bg-green-50 rounded">
                          <CheckCircle className="w-3 h-3 text-green-600" />
                          <span className="text-sm capitalize">{adaptationId.replace('_', ' ')}</span>
                        </div>
                      ))
                    }
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t">
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline">
                    <Download className="w-3 h-3 mr-1" />
                    Exportar
                  </Button>
                  <Button size="sm" variant="outline">
                    <Edit className="w-3 h-3 mr-1" />
                    Editar
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
