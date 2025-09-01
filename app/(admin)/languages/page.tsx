'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Languages, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Eye, 
  Trash2,
  Download,
  Upload,
  Share2,
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
  Globe,
  Palette,
  Accessibility,
  Sparkles,
  ArrowUp,
  ArrowDown,
  Minus,
  Activity,
  TrendingUp,
  Users2,
  BookOpen,
  Volume2,
  Mic,
  FileText
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useScreenReader } from '@/components/accessibility/screen-reader';
import { useHighContrast } from '@/components/accessibility/high-contrast';

interface Language {
  id: string;
  name: string;
  code: string;
  nativeName: string;
  type: 'primary' | 'secondary' | 'indigenous';
  status: 'active' | 'inactive' | 'beta';
  region: string;
  speakers: number;
  digitalPresence: number;
  content: {
    totalLessons: number;
    translatedLessons: number;
    audioContent: number;
    videoContent: number;
    documents: number;
  };
  users: {
    total: number;
    active: number;
    students: number;
    teachers: number;
  };
  performance: {
    translationQuality: number;
    culturalAccuracy: number;
    userSatisfaction: number;
    completionRate: number;
  };
  accessibility: {
    screenReader: boolean;
    voiceSynthesis: boolean;
    subtitles: boolean;
    signLanguage: boolean;
  };
  aiSupport: {
    translation: boolean;
    speechRecognition: boolean;
    textToSpeech: boolean;
    culturalAdaptation: boolean;
  };
  culturalContext: {
    writingSystem: string;
    readingDirection: 'ltr' | 'rtl';
    numberSystem: string;
    culturalReferences: string[];
  };
  lastUpdated: Date;
}

export default function LanguagesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { speak, isEnabled: screenReaderEnabled } = useScreenReader();
  const { getStyles } = useHighContrast();

  const [languages, setLanguages] = useState<Language[]>([]);
  const [filteredLanguages, setFilteredLanguages] = useState<Language[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({
    type: 'all',
    status: 'all',
    region: 'all'
  });
  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadLanguages();
  }, []);

  useEffect(() => {
    filterLanguages();
  }, [languages, searchTerm, selectedFilters]);

  const loadLanguages = async () => {
    setIsLoading(true);
    try {
      // En producción, esto vendría de la API
      const mockLanguages: Language[] = [
        {
          id: '1',
          name: 'Español',
          code: 'es',
          nativeName: 'Español',
          type: 'primary',
          status: 'active',
          region: 'América Latina',
          speakers: 500000000,
          digitalPresence: 95.2,
          content: {
            totalLessons: 450,
            translatedLessons: 450,
            audioContent: 380,
            videoContent: 320,
            documents: 280
          },
          users: {
            total: 45600,
            active: 34200,
            students: 38900,
            teachers: 6700
          },
          performance: {
            translationQuality: 9.8,
            culturalAccuracy: 9.5,
            userSatisfaction: 9.2,
            completionRate: 85.7
          },
          accessibility: {
            screenReader: true,
            voiceSynthesis: true,
            subtitles: true,
            signLanguage: false
          },
          aiSupport: {
            translation: true,
            speechRecognition: true,
            textToSpeech: true,
            culturalAdaptation: true
          },
          culturalContext: {
            writingSystem: 'Latin',
            readingDirection: 'ltr',
            numberSystem: 'Arabic',
            culturalReferences: ['Día de los Muertos', 'Carnaval', 'Fiesta de San Juan']
          },
          lastUpdated: new Date('2024-01-15')
        },
        {
          id: '2',
          name: 'K\'iche\'',
          code: 'quc',
          nativeName: 'K\'iche\'',
          type: 'indigenous',
          status: 'active',
          region: 'Guatemala',
          speakers: 1100000,
          digitalPresence: 45.8,
          content: {
            totalLessons: 89,
            translatedLessons: 67,
            audioContent: 45,
            videoContent: 23,
            documents: 34
          },
          users: {
            total: 2340,
            active: 1870,
            students: 2100,
            teachers: 240
          },
          performance: {
            translationQuality: 8.2,
            culturalAccuracy: 9.7,
            userSatisfaction: 9.1,
            completionRate: 78.3
          },
          accessibility: {
            screenReader: true,
            voiceSynthesis: true,
            subtitles: true,
            signLanguage: false
          },
          aiSupport: {
            translation: true,
            speechRecognition: true,
            textToSpeech: true,
            culturalAdaptation: true
          },
          culturalContext: {
            writingSystem: 'Latin',
            readingDirection: 'ltr',
            numberSystem: 'Maya',
            culturalReferences: ['Popol Vuh', 'Ceremonia del Fuego', 'Tz\'olkin']
          },
          lastUpdated: new Date('2024-01-12')
        },
        {
          id: '3',
          name: 'Portugués',
          code: 'pt',
          nativeName: 'Português',
          type: 'primary',
          status: 'active',
          region: 'Brasil',
          speakers: 260000000,
          digitalPresence: 92.7,
          content: {
            totalLessons: 320,
            translatedLessons: 298,
            audioContent: 245,
            videoContent: 198,
            documents: 167
          },
          users: {
            total: 28900,
            active: 22300,
            students: 24500,
            teachers: 4400
          },
          performance: {
            translationQuality: 9.6,
            culturalAccuracy: 9.3,
            userSatisfaction: 9.0,
            completionRate: 82.1
          },
          accessibility: {
            screenReader: true,
            voiceSynthesis: true,
            subtitles: true,
            signLanguage: false
          },
          aiSupport: {
            translation: true,
            speechRecognition: true,
            textToSpeech: true,
            culturalAdaptation: true
          },
          culturalContext: {
            writingSystem: 'Latin',
            readingDirection: 'ltr',
            numberSystem: 'Arabic',
            culturalReferences: ['Carnaval', 'Capoeira', 'Festa Junina']
          },
          lastUpdated: new Date('2024-01-14')
        },
        {
          id: '4',
          name: 'Tzotzil',
          code: 'tzo',
          nativeName: 'Bats\'i k\'op',
          type: 'indigenous',
          status: 'beta',
          region: 'México',
          speakers: 450000,
          digitalPresence: 32.1,
          content: {
            totalLessons: 45,
            translatedLessons: 23,
            audioContent: 18,
            videoContent: 12,
            documents: 15
          },
          users: {
            total: 890,
            active: 567,
            students: 780,
            teachers: 110
          },
          performance: {
            translationQuality: 7.8,
            culturalAccuracy: 9.4,
            userSatisfaction: 8.7,
            completionRate: 65.2
          },
          accessibility: {
            screenReader: true,
            voiceSynthesis: false,
            subtitles: true,
            signLanguage: false
          },
          aiSupport: {
            translation: true,
            speechRecognition: false,
            textToSpeech: false,
            culturalAdaptation: true
          },
          culturalContext: {
            writingSystem: 'Latin',
            readingDirection: 'ltr',
            numberSystem: 'Arabic',
            culturalReferences: ['Chamula', 'Zinacantán', 'Tradiciones mayas']
          },
          lastUpdated: new Date('2024-01-08')
        },
        {
          id: '5',
          name: 'Inglés',
          code: 'en',
          nativeName: 'English',
          type: 'secondary',
          status: 'active',
          region: 'Global',
          speakers: 1500000000,
          digitalPresence: 98.9,
          content: {
            totalLessons: 280,
            translatedLessons: 245,
            audioContent: 198,
            videoContent: 167,
            documents: 134
          },
          users: {
            total: 12300,
            active: 8900,
            students: 10200,
            teachers: 2100
          },
          performance: {
            translationQuality: 9.9,
            culturalAccuracy: 8.7,
            userSatisfaction: 8.9,
            completionRate: 79.4
          },
          accessibility: {
            screenReader: true,
            voiceSynthesis: true,
            subtitles: true,
            signLanguage: true
          },
          aiSupport: {
            translation: true,
            speechRecognition: true,
            textToSpeech: true,
            culturalAdaptation: true
          },
          culturalContext: {
            writingSystem: 'Latin',
            readingDirection: 'ltr',
            numberSystem: 'Arabic',
            culturalReferences: ['Thanksgiving', 'Halloween', 'Christmas']
          },
          lastUpdated: new Date('2024-01-13')
        }
      ];

      setLanguages(mockLanguages);
    } catch (error) {
      console.error('Error cargando idiomas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterLanguages = () => {
    let filtered = languages;

    // Filtro por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(language =>
        language.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        language.nativeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        language.code.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtros adicionales
    if (selectedFilters.type !== 'all') {
      filtered = filtered.filter(language => language.type === selectedFilters.type);
    }

    if (selectedFilters.status !== 'all') {
      filtered = filtered.filter(language => language.status === selectedFilters.status);
    }

    if (selectedFilters.region !== 'all') {
      filtered = filtered.filter(language => language.region === selectedFilters.region);
    }

    setFilteredLanguages(filtered);
  };

  const getStatusColor = (status: string): string => {
    const colors: { [key: string]: string } = {
      'active': 'green',
      'inactive': 'gray',
      'beta': 'yellow'
    };
    return colors[status] || 'gray';
  };

  const getTypeColor = (type: string): string => {
    const colors: { [key: string]: string } = {
      'primary': 'blue',
      'secondary': 'purple',
      'indigenous': 'orange'
    };
    return colors[type] || 'gray';
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000000) {
      return `${(num / 1000000000).toFixed(1)}B`;
    }
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
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
          <p className="text-lg text-gray-600">Cargando idiomas...</p>
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Administración de Idiomas</h1>
              <p className="text-gray-600">Gestiona el soporte multilingüe e idiomas indígenas</p>
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
                Agregar Idioma
              </Button>
            </div>
          </div>

          {/* Búsqueda y filtros */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Buscar idiomas..."
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
                    <select
                      value={selectedFilters.type}
                      onChange={(e) => setSelectedFilters(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">Todos los tipos</option>
                      <option value="primary">Primarios</option>
                      <option value="secondary">Secundarios</option>
                      <option value="indigenous">Indígenas</option>
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
                      <option value="active">Activos</option>
                      <option value="inactive">Inactivos</option>
                      <option value="beta">Beta</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Región</label>
                    <select
                      value={selectedFilters.region}
                      onChange={(e) => setSelectedFilters(prev => ({ ...prev, region: e.target.value }))}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">Todas las regiones</option>
                      <option value="América Latina">América Latina</option>
                      <option value="Guatemala">Guatemala</option>
                      <option value="México">México</option>
                      <option value="Brasil">Brasil</option>
                      <option value="Global">Global</option>
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
                    <p className="text-sm font-medium text-gray-600">Total Idiomas</p>
                    <p className="text-2xl font-bold text-blue-600">{languages.length}</p>
                  </div>
                  <Languages className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Activos</p>
                    <p className="text-2xl font-bold text-green-600">
                      {languages.filter(l => l.status === 'active').length}
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
                    <p className="text-sm font-medium text-gray-600">Indígenas</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {languages.filter(l => l.type === 'indigenous').length}
                    </p>
                  </div>
                  <Globe className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Usuarios</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {formatNumber(languages.reduce((acc, l) => acc + l.users.total, 0))}
                    </p>
                  </div>
                  <Users2 className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Lista de idiomas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredLanguages.map((language) => (
            <Card key={language.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                      <Languages className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{language.name}</h3>
                      <p className="text-sm text-gray-600">{language.nativeName} • {language.code}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline" 
                      className={`text-${getTypeColor(language.type)}-600 border-${getTypeColor(language.type)}-200`}
                    >
                      {language.type === 'primary' ? 'Primario' : language.type === 'secondary' ? 'Secundario' : 'Indígena'}
                    </Badge>
                    <Badge 
                      variant="outline" 
                      className={`text-${getStatusColor(language.status)}-600 border-${getStatusColor(language.status)}-200`}
                    >
                      {language.status === 'active' ? 'Activo' : language.status === 'inactive' ? 'Inactivo' : 'Beta'}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Información básica */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Hablantes:</span>
                    <span className="font-semibold ml-2">{formatNumber(language.speakers)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Presencia Digital:</span>
                    <span className="font-semibold ml-2">{language.digitalPresence}%</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Usuarios:</span>
                    <span className="font-semibold ml-2">{formatNumber(language.users.total)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Región:</span>
                    <span className="font-semibold ml-2">{language.region}</span>
                  </div>
                </div>

                {/* Contenido */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Contenido Disponible</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex justify-between">
                      <span>Lecciones:</span>
                      <span className="font-semibold">{language.content.translatedLessons}/{language.content.totalLessons}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Audio:</span>
                      <span className="font-semibold">{language.content.audioContent}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Video:</span>
                      <span className="font-semibold">{language.content.videoContent}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Documentos:</span>
                      <span className="font-semibold">{language.content.documents}</span>
                    </div>
                  </div>
                </div>

                {/* Rendimiento */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Rendimiento</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex justify-between">
                      <span>Calidad traducción:</span>
                      <span className="font-semibold">{language.performance.translationQuality}/10</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Precisión cultural:</span>
                      <span className="font-semibold">{language.performance.culturalAccuracy}/10</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Satisfacción:</span>
                      <span className="font-semibold">{language.performance.userSatisfaction}/10</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Completación:</span>
                      <span className="font-semibold">{language.performance.completionRate}%</span>
                    </div>
                  </div>
                </div>

                {/* Soporte de IA */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">Soporte de IA</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {language.aiSupport.translation && <Badge variant="outline" className="text-xs">Traducción</Badge>}
                    {language.aiSupport.speechRecognition && <Badge variant="outline" className="text-xs">Reconocimiento</Badge>}
                    {language.aiSupport.textToSpeech && <Badge variant="outline" className="text-xs">TTS</Badge>}
                    {language.aiSupport.culturalAdaptation && <Badge variant="outline" className="text-xs">Adaptación</Badge>}
                  </div>
                </div>

                {/* Accesibilidad */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Accesibilidad</h4>
                  <div className="flex flex-wrap gap-1">
                    {language.accessibility.screenReader && <Badge variant="outline" className="text-xs">Lector</Badge>}
                    {language.accessibility.voiceSynthesis && <Badge variant="outline" className="text-xs">Síntesis</Badge>}
                    {language.accessibility.subtitles && <Badge variant="outline" className="text-xs">Subtítulos</Badge>}
                    {language.accessibility.signLanguage && <Badge variant="outline" className="text-xs">Señas</Badge>}
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedLanguage(language)}
                    className="flex-1"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Ver Detalles
                  </Button>
                  <Button size="sm" variant="outline">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Mensaje si no hay idiomas */}
        {filteredLanguages.length === 0 && (
          <div className="text-center py-12">
            <Languages className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron idiomas</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || Object.values(selectedFilters).some(f => f !== 'all')
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'Aún no hay idiomas configurados'
              }
            </p>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Primer Idioma
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
