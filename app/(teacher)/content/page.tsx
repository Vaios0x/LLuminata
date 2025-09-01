'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Eye, 
  Trash2,
  Download,
  Upload,
  Share2,
  Globe,
  Users,
  Target,
  Award,
  Brain,
  Heart,
  Zap,
  Settings,
  Calendar,
  Clock,
  Star,
  CheckCircle,
  AlertCircle,
  Play,
  Pause,
  Volume2,
  ImageIcon,
  VideoIcon,
  FileText,
  Languages,
  Palette,
  Accessibility,
  Sparkles,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useScreenReader } from '@/components/accessibility/screen-reader';
import { useHighContrast } from '@/components/accessibility/high-contrast';

interface ContentItem {
  id: string;
  title: string;
  description: string;
  type: 'lesson' | 'assessment' | 'activity' | 'resource';
  subject: string;
  grade: string;
  difficulty: number;
  duration: number; // en minutos
  status: 'draft' | 'published' | 'archived';
  createdAt: Date;
  updatedAt: Date;
  author: string;
  tags: string[];
  culturalAdaptations: {
    languages: string[];
    backgrounds: string[];
    examples: string[];
  };
  accessibility: {
    screenReader: boolean;
    highContrast: boolean;
    keyboardNavigation: boolean;
    audioDescription: boolean;
    subtitles: boolean;
  };
  media: {
    images: number;
    videos: number;
    audio: number;
    documents: number;
  };
  usage: {
    views: number;
    completions: number;
    averageScore: number;
    studentCount: number;
  };
  aiAnalysis: {
    complexity: number;
    culturalRelevance: number;
    accessibilityScore: number;
    engagementPrediction: number;
    recommendations: string[];
  };
}

export default function ContentPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { speak, isEnabled: screenReaderEnabled } = useScreenReader();
  const { getStyles } = useHighContrast();

  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [filteredContent, setFilteredContent] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({
    type: 'all',
    subject: 'all',
    grade: 'all',
    status: 'all'
  });
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadContent();
  }, []);

  useEffect(() => {
    filterContent();
  }, [contentItems, searchTerm, selectedFilters]);

  const loadContent = async () => {
    setIsLoading(true);
    try {
      // En producción, esto vendría de la API
      const mockContent: ContentItem[] = [
        {
          id: '1',
          title: 'Introducción a las Matemáticas Mayas',
          description: 'Lección interactiva sobre el sistema numérico maya y su aplicación en la vida cotidiana',
          type: 'lesson',
          subject: 'Matemáticas',
          grade: '5to grado',
          difficulty: 2,
          duration: 45,
          status: 'published',
          createdAt: new Date('2024-01-10'),
          updatedAt: new Date('2024-01-15'),
          author: 'Prof. María González',
          tags: ['maya', 'números', 'historia', 'cultura'],
          culturalAdaptations: {
            languages: ['español', 'maya'],
            backgrounds: ['maya', 'mestizo'],
            examples: ['mercado local', 'agricultura tradicional']
          },
          accessibility: {
            screenReader: true,
            highContrast: true,
            keyboardNavigation: true,
            audioDescription: true,
            subtitles: true
          },
          media: {
            images: 8,
            videos: 2,
            audio: 1,
            documents: 3
          },
          usage: {
            views: 156,
            completions: 89,
            averageScore: 87.5,
            studentCount: 45
          },
          aiAnalysis: {
            complexity: 2.3,
            culturalRelevance: 9.2,
            accessibilityScore: 8.8,
            engagementPrediction: 85,
            recommendations: ['Agregar más ejemplos visuales', 'Incluir ejercicios prácticos']
          }
        },
        {
          id: '2',
          title: 'Evaluación de Ciencias: Ecosistemas Locales',
          description: 'Evaluación sobre los ecosistemas de la región y su importancia cultural',
          type: 'assessment',
          subject: 'Ciencias',
          grade: '6to grado',
          difficulty: 3,
          duration: 30,
          status: 'published',
          createdAt: new Date('2024-01-08'),
          updatedAt: new Date('2024-01-12'),
          author: 'Prof. Carlos Rodríguez',
          tags: ['ecosistemas', 'medio ambiente', 'local'],
          culturalAdaptations: {
            languages: ['español'],
            backgrounds: ['maya', 'mestizo', 'afrodescendiente'],
            examples: ['selva local', 'ríos regionales']
          },
          accessibility: {
            screenReader: true,
            highContrast: true,
            keyboardNavigation: true,
            audioDescription: false,
            subtitles: false
          },
          media: {
            images: 5,
            videos: 0,
            audio: 0,
            documents: 1
          },
          usage: {
            views: 98,
            completions: 67,
            averageScore: 78.3,
            studentCount: 42
          },
          aiAnalysis: {
            complexity: 3.1,
            culturalRelevance: 7.8,
            accessibilityScore: 7.5,
            engagementPrediction: 72,
            recommendations: ['Simplificar preguntas complejas', 'Agregar más contexto cultural']
          }
        },
        {
          id: '3',
          title: 'Actividad: Arte Indígena Contemporáneo',
          description: 'Actividad práctica para crear arte inspirado en técnicas indígenas tradicionales',
          type: 'activity',
          subject: 'Arte',
          grade: '7mo grado',
          difficulty: 2,
          duration: 60,
          status: 'draft',
          createdAt: new Date('2024-01-14'),
          updatedAt: new Date('2024-01-14'),
          author: 'Prof. Ana Silva',
          tags: ['arte', 'indígena', 'práctico', 'creatividad'],
          culturalAdaptations: {
            languages: ['español', 'portugués'],
            backgrounds: ['indígena', 'afrodescendiente'],
            examples: ['cerámica tradicional', 'tejidos artesanales']
          },
          accessibility: {
            screenReader: true,
            highContrast: true,
            keyboardNavigation: true,
            audioDescription: true,
            subtitles: true
          },
          media: {
            images: 12,
            videos: 3,
            audio: 2,
            documents: 2
          },
          usage: {
            views: 0,
            completions: 0,
            averageScore: 0,
            studentCount: 0
          },
          aiAnalysis: {
            complexity: 2.8,
            culturalRelevance: 9.5,
            accessibilityScore: 9.1,
            engagementPrediction: 88,
            recommendations: ['Listo para publicación', 'Considerar agregar más instrucciones paso a paso']
          }
        },
        {
          id: '4',
          title: 'Recurso: Biblioteca Digital Indígena',
          description: 'Colección de recursos digitales sobre historia y cultura indígena',
          type: 'resource',
          subject: 'Historia',
          grade: 'Todos',
          difficulty: 1,
          duration: 0,
          status: 'published',
          createdAt: new Date('2024-01-05'),
          updatedAt: new Date('2024-01-10'),
          author: 'Equipo Cultural',
          tags: ['biblioteca', 'indígena', 'historia', 'cultura'],
          culturalAdaptations: {
            languages: ['español', 'maya', 'nahuatl', 'portugués'],
            backgrounds: ['todos'],
            examples: ['textos históricos', 'documentales', 'entrevistas']
          },
          accessibility: {
            screenReader: true,
            highContrast: true,
            keyboardNavigation: true,
            audioDescription: true,
            subtitles: true
          },
          media: {
            images: 25,
            videos: 15,
            audio: 8,
            documents: 50
          },
          usage: {
            views: 234,
            completions: 0,
            averageScore: 0,
            studentCount: 67
          },
          aiAnalysis: {
            complexity: 1.5,
            culturalRelevance: 9.8,
            accessibilityScore: 9.3,
            engagementPrediction: 91,
            recommendations: ['Excelente recurso', 'Considerar agregar más contenido interactivo']
          }
        }
      ];

      setContentItems(mockContent);
    } catch (error) {
      console.error('Error cargando contenido:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterContent = () => {
    let filtered = contentItems;

    // Filtro por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filtros adicionales
    if (selectedFilters.type !== 'all') {
      filtered = filtered.filter(item => item.type === selectedFilters.type);
    }

    if (selectedFilters.subject !== 'all') {
      filtered = filtered.filter(item => item.subject === selectedFilters.subject);
    }

    if (selectedFilters.grade !== 'all') {
      filtered = filtered.filter(item => item.grade === selectedFilters.grade);
    }

    if (selectedFilters.status !== 'all') {
      filtered = filtered.filter(item => item.status === selectedFilters.status);
    }

    setFilteredContent(filtered);
  };

  const getStatusColor = (status: string): string => {
    const colors: { [key: string]: string } = {
      'published': 'green',
      'draft': 'yellow',
      'archived': 'gray'
    };
    return colors[status] || 'gray';
  };

  const getTypeIcon = (type: string) => {
    const icons: { [key: string]: any } = {
      'lesson': BookOpen,
      'assessment': Target,
      'activity': Award,
      'resource': FileText
    };
    return icons[type] || BookOpen;
  };

  const getTypeColor = (type: string): string => {
    const colors: { [key: string]: string } = {
      'lesson': 'blue',
      'assessment': 'purple',
      'activity': 'green',
      'resource': 'orange'
    };
    return colors[type] || 'gray';
  };

  const formatDuration = (minutes: number): string => {
    if (minutes === 0) return 'Sin límite';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'short',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4" style={getStyles()}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Cargando contenido...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4" style={getStyles()}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Contenido</h1>
              <p className="text-gray-600">Crea, edita y gestiona contenido educativo inclusivo</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Importar
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
              <Button size="sm" onClick={() => setShowCreateModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Crear Contenido
              </Button>
            </div>
          </div>

          {/* Búsqueda y filtros */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Buscar contenido..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filtros
            </Button>
          </div>

          {/* Filtros expandibles */}
          {showFilters && (
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
                    <select
                      value={selectedFilters.type}
                      onChange={(e) => setSelectedFilters(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">Todos los tipos</option>
                      <option value="lesson">Lecciones</option>
                      <option value="assessment">Evaluaciones</option>
                      <option value="activity">Actividades</option>
                      <option value="resource">Recursos</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Materia</label>
                    <select
                      value={selectedFilters.subject}
                      onChange={(e) => setSelectedFilters(prev => ({ ...prev, subject: e.target.value }))}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">Todas las materias</option>
                      <option value="Matemáticas">Matemáticas</option>
                      <option value="Ciencias">Ciencias</option>
                      <option value="Historia">Historia</option>
                      <option value="Arte">Arte</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Grado</label>
                    <select
                      value={selectedFilters.grade}
                      onChange={(e) => setSelectedFilters(prev => ({ ...prev, grade: e.target.value }))}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">Todos los grados</option>
                      <option value="5to grado">5to grado</option>
                      <option value="6to grado">6to grado</option>
                      <option value="7mo grado">7mo grado</option>
                      <option value="Todos">Todos</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                    <select
                      value={selectedFilters.status}
                      onChange={(e) => setSelectedFilters(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">Todos los estados</option>
                      <option value="published">Publicado</option>
                      <option value="draft">Borrador</option>
                      <option value="archived">Archivado</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Contenido</p>
                    <p className="text-2xl font-bold text-blue-600">{contentItems.length}</p>
                  </div>
                  <BookOpen className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Publicado</p>
                    <p className="text-2xl font-bold text-green-600">
                      {contentItems.filter(c => c.status === 'published').length}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Borradores</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {contentItems.filter(c => c.status === 'draft').length}
                    </p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Promedio IA</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {Math.round(contentItems.reduce((acc, c) => acc + c.aiAnalysis.engagementPrediction, 0) / contentItems.length)}%
                    </p>
                  </div>
                  <Brain className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Lista de contenido */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredContent.map((item) => {
            const TypeIcon = getTypeIcon(item.type);
            return (
              <Card key={item.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 bg-${getTypeColor(item.type)}-100 rounded-lg flex items-center justify-center`}>
                        <TypeIcon className={`h-6 w-6 text-${getTypeColor(item.type)}-600`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">{item.title}</h3>
                        <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant="outline" 
                        className={`text-${getStatusColor(item.status)}-600 border-${getStatusColor(item.status)}-200`}
                      >
                        {item.status === 'published' ? 'Publicado' : item.status === 'draft' ? 'Borrador' : 'Archivado'}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Metadatos */}
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>{item.subject}</span>
                    <span>•</span>
                    <span>{item.grade}</span>
                    <span>•</span>
                    <span>Dificultad: {item.difficulty}/5</span>
                    <span>•</span>
                    <span>{formatDuration(item.duration)}</span>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1">
                    {item.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {item.tags.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{item.tags.length - 3}
                      </Badge>
                    )}
                  </div>

                  {/* Estadísticas de uso */}
                  {item.status === 'published' && (
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="text-center">
                        <div className="font-semibold text-blue-600">{item.usage.views}</div>
                        <div className="text-gray-600">Vistas</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-green-600">{item.usage.completions}</div>
                        <div className="text-gray-600">Completados</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-purple-600">{item.usage.averageScore}%</div>
                        <div className="text-gray-600">Promedio</div>
                      </div>
                    </div>
                  )}

                  {/* Análisis de IA */}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Brain className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium">Análisis de IA</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex justify-between">
                        <span>Engagement:</span>
                        <span className="font-semibold">{item.aiAnalysis.engagementPrediction}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Cultural:</span>
                        <span className="font-semibold">{item.aiAnalysis.culturalRelevance}/10</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Accesibilidad:</span>
                        <span className="font-semibold">{item.aiAnalysis.accessibilityScore}/10</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Complejidad:</span>
                        <span className="font-semibold">{item.aiAnalysis.complexity}/5</span>
                      </div>
                    </div>
                  </div>

                  {/* Accesibilidad */}
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    {item.accessibility.screenReader && <Badge variant="outline" className="text-xs">SR</Badge>}
                    {item.accessibility.highContrast && <Badge variant="outline" className="text-xs">HC</Badge>}
                    {item.accessibility.keyboardNavigation && <Badge variant="outline" className="text-xs">KB</Badge>}
                    {item.accessibility.audioDescription && <Badge variant="outline" className="text-xs">AD</Badge>}
                    {item.accessibility.subtitles && <Badge variant="outline" className="text-xs">ST</Badge>}
                  </div>

                  {/* Acciones */}
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedContent(item)}
                      className="flex-1"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Detalles
                    </Button>
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Mensaje si no hay contenido */}
        {filteredContent.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontró contenido</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || Object.values(selectedFilters).some(f => f !== 'all')
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'Aún no has creado contenido'
              }
            </p>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Crear Primer Contenido
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
