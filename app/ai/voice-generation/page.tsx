'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Mic, 
  Volume2, 
  Play, 
  Pause, 
  Stop, 
  Download, 
  Upload, 
  Settings,
  Languages,
  User,
  Clock,
  Waveform,
  Sliders,
  Save,
  RefreshCw,
  Loader2,
  CheckCircle,
  AlertCircle,
  Headphones,
  Speaker,
  Music,
  Zap,
  Target,
  Star,
  Heart,
  BookOpen,
  Globe,
  Palette,
  TrendingUp,
  BarChart3,
  PieChart,
  LineChart,
  Calendar,
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
  XCircle,
  Share
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { VoiceGenerationStudio } from '@/components/ai/VoiceGenerationStudio';

interface VoiceProfile {
  id: string;
  name: string;
  language: string;
  gender: 'male' | 'female' | 'neutral';
  age: 'child' | 'young' | 'adult' | 'elder';
  accent: string;
  personality: string;
  sampleRate: number;
  quality: 'low' | 'medium' | 'high' | 'ultra';
}

interface AudioTrack {
  id: string;
  text: string;
  voiceProfile: VoiceProfile;
  duration: number;
  status: 'pending' | 'generating' | 'completed' | 'error';
  audioUrl?: string;
  waveform?: number[];
  createdAt: Date;
  fileSize?: number;
}

interface VoiceProject {
  id: string;
  name: string;
  description: string;
  tracks: AudioTrack[];
  totalDuration: number;
  status: 'draft' | 'in_progress' | 'completed' | 'archived';
  createdAt: Date;
  lastModified: Date;
  tags: string[];
}

export default function VoiceGenerationPage() {
  const [currentUser, setCurrentUser] = useState<string>('user_123');
  const [voiceProjects, setVoiceProjects] = useState<VoiceProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showStudio, setShowStudio] = useState(false);
  const [selectedProject, setSelectedProject] = useState<VoiceProject | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'profiles' | 'settings'>('overview');

  // Datos de ejemplo
  const mockVoiceProjects: VoiceProject[] = [
    {
      id: 'project_1',
      name: 'Lección Maya - Números',
      description: 'Audio educativo para enseñar números en lengua maya',
      tracks: [
        {
          id: 'track_1',
          text: 'Uno, dos, tres, cuatro, cinco en maya se dice: hun, ka\'a, óox, kan, ho\'',
          voiceProfile: {
            id: 'maya_elder_female',
            name: 'Abuela Maya',
            language: 'Maya',
            gender: 'female',
            age: 'elder',
            accent: 'Yucateco',
            personality: 'Sabia y cálida',
            sampleRate: 44100,
            quality: 'high'
          },
          duration: 8.5,
          status: 'completed',
          audioUrl: '/audio/maya_numbers.mp3',
          waveform: [0.2, 0.5, 0.8, 0.6, 0.3, 0.7, 0.9, 0.4],
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          fileSize: 2048000
        }
      ],
      totalDuration: 8.5,
      status: 'completed',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      lastModified: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      tags: ['maya', 'educativo', 'números']
    },
    {
      id: 'project_2',
      name: 'Cuento Náhuatl',
      description: 'Narración tradicional en náhuatl con música de fondo',
      tracks: [
        {
          id: 'track_2',
          text: 'En tiempos antiguos, cuando el mundo era joven...',
          voiceProfile: {
            id: 'nahuatl_teacher_male',
            name: 'Maestro Náhuatl',
            language: 'Náhuatl',
            gender: 'male',
            age: 'adult',
            accent: 'Central',
            personality: 'Autoritario y sabio',
            sampleRate: 48000,
            quality: 'ultra'
          },
          duration: 15.2,
          status: 'generating',
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
        }
      ],
      totalDuration: 15.2,
      status: 'in_progress',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      lastModified: new Date(),
      tags: ['náhuatl', 'cuento', 'tradicional']
    }
  ];

  useEffect(() => {
    loadVoiceProjects();
  }, []);

  const loadVoiceProjects = async () => {
    try {
      setIsLoading(true);
      // En producción, esto sería una llamada a la API
      // const response = await fetch(`/api/ai/voice-generation/${currentUser}`);
      // const data = await response.json();
      
      // Simulando carga
      await new Promise(resolve => setTimeout(resolve, 1000));
      setVoiceProjects(mockVoiceProjects);
    } catch (error) {
      console.error('Error loading voice projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate = (track: AudioTrack) => {
    console.log('Generated track:', track);
  };

  const handleSaveProject = (project: any) => {
    const newProject: VoiceProject = {
      id: `project_${Date.now()}`,
      name: project.name || 'Nuevo Proyecto',
      description: project.description || '',
      tracks: project.tracks || [],
      totalDuration: project.tracks?.reduce((acc: number, t: AudioTrack) => acc + t.duration, 0) || 0,
      status: 'draft',
      createdAt: new Date(),
      lastModified: new Date(),
      tags: project.tags || []
    };

    setVoiceProjects(prev => [newProject, ...prev]);
    setShowStudio(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'in_progress': return 'text-blue-600 bg-blue-100';
      case 'draft': return 'text-yellow-600 bg-yellow-100';
      case 'archived': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTrackStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'generating': return 'text-blue-600 bg-blue-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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

  if (showStudio) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button 
            onClick={() => setShowStudio(false)}
            variant="outline"
            className="flex items-center space-x-2"
            tabIndex={0}
            aria-label="Volver a la página principal"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver</span>
          </Button>
        </div>
        <VoiceGenerationStudio 
          userId={currentUser}
          onGenerate={handleGenerate}
          onSave={handleSaveProject}
          onExport={(audioData) => console.log('Export:', audioData)}
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
            <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
              <Mic className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Generación de Voz</h1>
              <p className="text-gray-600">Creación de audio con voces naturales y culturalmente adaptadas</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button 
              onClick={() => loadVoiceProjects()}
              variant="outline"
              className="flex items-center space-x-2"
              tabIndex={0}
              aria-label="Actualizar datos"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Actualizar</span>
            </Button>
            <Button 
              onClick={() => setShowStudio(true)}
              className="flex items-center space-x-2"
              tabIndex={0}
              aria-label="Nuevo proyecto"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Proyecto</span>
            </Button>
          </div>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Mic className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium">Proyectos Totales</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {voiceProjects.length}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium">Completados</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {voiceProjects.filter(p => p.status === 'completed').length}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-yellow-600" />
                <span className="text-sm font-medium">Duración Total</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {formatDuration(voiceProjects.reduce((acc, p) => acc + p.totalDuration, 0))}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Languages className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium">Idiomas</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {new Set(voiceProjects.flatMap(p => p.tracks.map(t => t.voiceProfile.language))).size}
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
              { id: 'projects', label: 'Proyectos', icon: Folder },
              { id: 'profiles', label: 'Perfiles', icon: User },
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
                      ? "border-blue-500 text-blue-600"
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
          {/* Proyecto más reciente */}
          {voiceProjects.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Music className="w-5 h-5 text-blue-600" />
                  <span>Proyecto Más Reciente</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const latestProject = voiceProjects[0];
                  return (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Music className="w-6 h-6 text-blue-600" />
                          <div>
                            <div className="font-medium">{latestProject.name}</div>
                            <div className="text-sm text-gray-600">
                              {latestProject.tracks.length} pistas • {formatDuration(latestProject.totalDuration)}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={cn("text-xs", getStatusColor(latestProject.status))}>
                            {latestProject.status === 'completed' ? 'Completado' :
                             latestProject.status === 'in_progress' ? 'En Progreso' :
                             latestProject.status === 'draft' ? 'Borrador' : 'Archivado'}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <span className="text-sm text-gray-600">Idiomas:</span>
                          <div className="font-medium">
                            {Array.from(new Set(latestProject.tracks.map(t => t.voiceProfile.language))).join(', ')}
                          </div>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Última modificación:</span>
                          <div className="font-medium">{formatDate(latestProject.lastModified)}</div>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Etiquetas:</span>
                          <div className="font-medium">{latestProject.tags.join(', ')}</div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          )}

          {/* Pistas recientes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Waveform className="w-5 h-5 text-green-600" />
                <span>Pistas Recientes</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {voiceProjects
                  .flatMap(p => p.tracks)
                  .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
                  .slice(0, 5)
                  .map((track) => (
                    <div key={track.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Volume2 className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium truncate max-w-xs">{track.text.substring(0, 50)}...</div>
                          <div className="text-sm text-gray-600">
                            {track.voiceProfile.name} • {formatDuration(track.duration)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={cn("text-xs", getTrackStatusColor(track.status))}>
                          {track.status === 'completed' ? 'Completado' :
                           track.status === 'generating' ? 'Generando' :
                           track.status === 'pending' ? 'Pendiente' : 'Error'}
                        </Badge>
                        {track.status === 'completed' && (
                          <Button size="sm" variant="outline">
                            <Play className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                }
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'projects' && (
        <div className="space-y-4">
          {voiceProjects.map((project) => (
            <Card key={project.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Music className="w-5 h-5 text-blue-600" />
                    <div>
                      <h3 className="font-semibold">{project.name}</h3>
                      <p className="text-sm text-gray-600">{project.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={cn("text-xs", getStatusColor(project.status))}>
                      {project.status === 'completed' ? 'Completado' :
                       project.status === 'in_progress' ? 'En Progreso' :
                       project.status === 'draft' ? 'Borrador' : 'Archivado'}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {formatDuration(project.totalDuration)}
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <span className="text-sm text-gray-600">Pistas:</span>
                    <div className="font-medium">{project.tracks.length}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Idiomas:</span>
                    <div className="font-medium">
                      {Array.from(new Set(project.tracks.map(t => t.voiceProfile.language))).join(', ')}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Creado:</span>
                    <div className="font-medium">{formatDate(project.createdAt)}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Modificado:</span>
                    <div className="font-medium">{formatDate(project.lastModified)}</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex flex-wrap gap-1">
                    {project.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setSelectedProject(project)}
                      tabIndex={0}
                      aria-label="Ver detalles del proyecto"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      Ver Detalles
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      tabIndex={0}
                      aria-label="Editar proyecto"
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

      {activeTab === 'profiles' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Perfiles de Voz Disponibles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  {
                    id: 'maya_elder_female',
                    name: 'Abuela Maya',
                    language: 'Maya',
                    gender: 'female',
                    age: 'elder',
                    accent: 'Yucateco',
                    personality: 'Sabia y cálida',
                    quality: 'high'
                  },
                  {
                    id: 'nahuatl_teacher_male',
                    name: 'Maestro Náhuatl',
                    language: 'Náhuatl',
                    gender: 'male',
                    age: 'adult',
                    accent: 'Central',
                    personality: 'Autoritario y sabio',
                    quality: 'ultra'
                  },
                  {
                    id: 'mixteco_young_female',
                    name: 'Joven Mixteca',
                    language: 'Mixteco',
                    gender: 'female',
                    age: 'young',
                    accent: 'Oaxaqueño',
                    personality: 'Energética y amigable',
                    quality: 'high'
                  }
                ].map((profile) => (
                  <div key={profile.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium">{profile.name}</div>
                        <div className="text-sm text-gray-600">{profile.language}</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div><strong>Edad:</strong> {profile.age}</div>
                      <div><strong>Acento:</strong> {profile.accent}</div>
                      <div><strong>Personalidad:</strong> {profile.personality}</div>
                      <div><strong>Calidad:</strong> {profile.quality}</div>
                    </div>
                    
                    <div className="mt-4 flex space-x-2">
                      <Button size="sm" className="flex-1">
                        <Play className="w-3 h-3 mr-1" />
                        Probar
                      </Button>
                      <Button size="sm" variant="outline">
                        <Settings className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Generación de Voz</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Calidad de Audio Predeterminada</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                    <option value="low">Baja (22kHz)</option>
                    <option value="medium">Media (44kHz)</option>
                    <option value="high" selected>Alta (44kHz)</option>
                    <option value="ultra">Ultra (48kHz)</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Formato de Salida</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                    <option value="mp3">MP3</option>
                    <option value="wav">WAV</option>
                    <option value="ogg">OGG</option>
                    <option value="m4a">M4A</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Preferencias</label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" defaultChecked />
                      <span>Generar automáticamente al completar texto</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      <span>Incluir música de fondo cultural</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" defaultChecked />
                      <span>Guardar proyectos automáticamente</span>
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
      {selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Detalles del Proyecto</h3>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedProject(null)}
                  tabIndex={0}
                  aria-label="Cerrar detalles"
                >
                  <XCircle className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  <Music className="w-6 h-6 text-blue-600" />
                  <div>
                    <h4 className="font-medium">{selectedProject.name}</h4>
                    <p className="text-sm text-gray-600">{selectedProject.description}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-medium mb-2">Información del Proyecto</h5>
                    <div className="space-y-1 text-sm">
                      <div><strong>Estado:</strong> {selectedProject.status}</div>
                      <div><strong>Duración Total:</strong> {formatDuration(selectedProject.totalDuration)}</div>
                      <div><strong>Pistas:</strong> {selectedProject.tracks.length}</div>
                      <div><strong>Creado:</strong> {formatDate(selectedProject.createdAt)}</div>
                    </div>
                  </div>
                  <div>
                    <h5 className="font-medium mb-2">Etiquetas</h5>
                    <div className="flex flex-wrap gap-1">
                      {selectedProject.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div>
                  <h5 className="font-medium mb-2">Pistas</h5>
                  <div className="space-y-2">
                    {selectedProject.tracks.map((track) => (
                      <div key={track.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                            <Volume2 className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium truncate max-w-xs">{track.text}</div>
                            <div className="text-sm text-gray-600">
                              {track.voiceProfile.name} • {formatDuration(track.duration)}
                              {track.fileSize && ` • ${formatFileSize(track.fileSize)}`}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={cn("text-xs", getTrackStatusColor(track.status))}>
                            {track.status === 'completed' ? 'Completado' :
                             track.status === 'generating' ? 'Generando' :
                             track.status === 'pending' ? 'Pendiente' : 'Error'}
                          </Badge>
                          {track.status === 'completed' && (
                            <Button size="sm" variant="outline">
                              <Play className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
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
