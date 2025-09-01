'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Globe, 
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
  MapPin,
  Languages,
  Palette,
  Accessibility,
  Sparkles,
  ArrowUp,
  ArrowDown,
  Minus,
  Activity,
  TrendingUp,
  Users2,
  BookOpen
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useScreenReader } from '@/components/accessibility/screen-reader';
import { useHighContrast } from '@/components/accessibility/high-contrast';

interface Region {
  id: string;
  name: string;
  code: string;
  country: string;
  population: number;
  status: 'active' | 'inactive' | 'pending';
  culturalBackgrounds: string[];
  languages: {
    primary: string;
    secondary: string[];
    indigenous: string[];
  };
  education: {
    literacyRate: number;
    schoolEnrollment: number;
    digitalAccess: number;
    specialNeeds: number;
  };
  content: {
    totalLessons: number;
    adaptedContent: number;
    localExamples: number;
    culturalReferences: number;
  };
  users: {
    total: number;
    active: number;
    students: number;
    teachers: number;
    admins: number;
  };
  performance: {
    averageScore: number;
    completionRate: number;
    engagementRate: number;
    satisfactionScore: number;
  };
  accessibility: {
    screenReaderUsers: number;
    highContrastUsers: number;
    keyboardUsers: number;
    audioUsers: number;
  };
  aiAnalysis: {
    culturalRelevance: number;
    contentAdaptation: number;
    userEngagement: number;
    recommendations: string[];
  };
  lastUpdated: Date;
}

export default function RegionsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { speak, isEnabled: screenReaderEnabled } = useScreenReader();
  const { getStyles } = useHighContrast();

  const [regions, setRegions] = useState<Region[]>([]);
  const [filteredRegions, setFilteredRegions] = useState<Region[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({
    status: 'all',
    country: 'all'
  });
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadRegions();
  }, []);

  useEffect(() => {
    filterRegions();
  }, [regions, searchTerm, selectedFilters]);

  const loadRegions = async () => {
    setIsLoading(true);
    try {
      // En producción, esto vendría de la API
      const mockRegions: Region[] = [
        {
          id: '1',
          name: 'Guatemala Central',
          code: 'GT-CENTRAL',
          country: 'Guatemala',
          population: 2500000,
          status: 'active',
          culturalBackgrounds: ['maya', 'mestizo', 'ladino'],
          languages: {
            primary: 'español',
            secondary: ['inglés'],
            indigenous: ['k\'iche\'', 'kaqchikel', 'q\'eqchi\'']
          },
          education: {
            literacyRate: 78.5,
            schoolEnrollment: 85.2,
            digitalAccess: 65.8,
            specialNeeds: 12.3
          },
          content: {
            totalLessons: 156,
            adaptedContent: 142,
            localExamples: 89,
            culturalReferences: 67
          },
          users: {
            total: 12450,
            active: 8920,
            students: 10200,
            teachers: 1850,
            admins: 400
          },
          performance: {
            averageScore: 82.5,
            completionRate: 78.3,
            engagementRate: 84.7,
            satisfactionScore: 8.9
          },
          accessibility: {
            screenReaderUsers: 234,
            highContrastUsers: 456,
            keyboardUsers: 789,
            audioUsers: 123
          },
          aiAnalysis: {
            culturalRelevance: 9.2,
            contentAdaptation: 8.8,
            userEngagement: 8.5,
            recommendations: [
              'Aumentar contenido en idiomas indígenas',
              'Mejorar accesibilidad para usuarios con discapacidad visual',
              'Agregar más ejemplos locales de matemáticas mayas'
            ]
          },
          lastUpdated: new Date('2024-01-15')
        },
        {
          id: '2',
          name: 'Chiapas Sur',
          code: 'MX-CHIAPAS',
          country: 'México',
          population: 1800000,
          status: 'active',
          culturalBackgrounds: ['maya', 'mestizo', 'zapoteco'],
          languages: {
            primary: 'español',
            secondary: ['inglés'],
            indigenous: ['tzotzil', 'tzeltal', 'chol']
          },
          education: {
            literacyRate: 82.1,
            schoolEnrollment: 88.7,
            digitalAccess: 72.4,
            specialNeeds: 10.8
          },
          content: {
            totalLessons: 134,
            adaptedContent: 118,
            localExamples: 76,
            culturalReferences: 54
          },
          users: {
            total: 9870,
            active: 7230,
            students: 8120,
            teachers: 1450,
            admins: 300
          },
          performance: {
            averageScore: 85.3,
            completionRate: 81.2,
            engagementRate: 87.1,
            satisfactionScore: 9.1
          },
          accessibility: {
            screenReaderUsers: 189,
            highContrastUsers: 345,
            keyboardUsers: 567,
            audioUsers: 98
          },
          aiAnalysis: {
            culturalRelevance: 9.5,
            contentAdaptation: 9.1,
            userEngagement: 8.9,
            recommendations: [
              'Expandir contenido en idiomas zapotecos',
              'Incluir más ejemplos de agricultura tradicional',
              'Mejorar soporte para comunidades rurales'
            ]
          },
          lastUpdated: new Date('2024-01-12')
        },
        {
          id: '3',
          name: 'Bahía Nordeste',
          code: 'BR-BAHIA',
          country: 'Brasil',
          population: 3200000,
          status: 'active',
          culturalBackgrounds: ['afrodescendiente', 'mestizo', 'indígena'],
          languages: {
            primary: 'portugués',
            secondary: ['español'],
            indigenous: ['tupi', 'guarani']
          },
          education: {
            literacyRate: 85.7,
            schoolEnrollment: 91.3,
            digitalAccess: 78.9,
            specialNeeds: 8.5
          },
          content: {
            totalLessons: 178,
            adaptedContent: 165,
            localExamples: 98,
            culturalReferences: 72
          },
          users: {
            total: 15680,
            active: 11240,
            students: 12800,
            teachers: 2340,
            admins: 540
          },
          performance: {
            averageScore: 88.7,
            completionRate: 85.4,
            engagementRate: 90.2,
            satisfactionScore: 9.3
          },
          accessibility: {
            screenReaderUsers: 312,
            highContrastUsers: 567,
            keyboardUsers: 890,
            audioUsers: 145
          },
          aiAnalysis: {
            culturalRelevance: 9.8,
            contentAdaptation: 9.4,
            userEngagement: 9.2,
            recommendations: [
              'Excelente adaptación cultural',
              'Considerar agregar más contenido sobre historia afrobrasileña',
              'Expandir recursos en portugués'
            ]
          },
          lastUpdated: new Date('2024-01-14')
        },
        {
          id: '4',
          name: 'Puno Altiplano',
          code: 'PE-PUNO',
          country: 'Perú',
          population: 1200000,
          status: 'pending',
          culturalBackgrounds: ['aymara', 'quechua', 'mestizo'],
          languages: {
            primary: 'español',
            secondary: ['inglés'],
            indigenous: ['aymara', 'quechua']
          },
          education: {
            literacyRate: 75.2,
            schoolEnrollment: 82.1,
            digitalAccess: 58.7,
            specialNeeds: 15.4
          },
          content: {
            totalLessons: 89,
            adaptedContent: 67,
            localExamples: 34,
            culturalReferences: 23
          },
          users: {
            total: 4560,
            active: 2340,
            students: 3890,
            teachers: 520,
            admins: 150
          },
          performance: {
            averageScore: 76.8,
            completionRate: 68.9,
            engagementRate: 72.4,
            satisfactionScore: 7.8
          },
          accessibility: {
            screenReaderUsers: 89,
            highContrastUsers: 156,
            keyboardUsers: 234,
            audioUsers: 45
          },
          aiAnalysis: {
            culturalRelevance: 8.7,
            contentAdaptation: 7.2,
            userEngagement: 7.8,
            recommendations: [
              'Necesita más contenido adaptado culturalmente',
              'Mejorar accesibilidad para comunidades rurales',
              'Aumentar contenido en idiomas indígenas'
            ]
          },
          lastUpdated: new Date('2024-01-10')
        }
      ];

      setRegions(mockRegions);
    } catch (error) {
      console.error('Error cargando regiones:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterRegions = () => {
    let filtered = regions;

    // Filtro por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(region =>
        region.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        region.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
        region.code.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtros adicionales
    if (selectedFilters.status !== 'all') {
      filtered = filtered.filter(region => region.status === selectedFilters.status);
    }

    if (selectedFilters.country !== 'all') {
      filtered = filtered.filter(region => region.country === selectedFilters.country);
    }

    setFilteredRegions(filtered);
  };

  const getStatusColor = (status: string): string => {
    const colors: { [key: string]: string } = {
      'active': 'green',
      'inactive': 'gray',
      'pending': 'yellow'
    };
    return colors[status] || 'gray';
  };

  const formatNumber = (num: number): string => {
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
          <p className="text-lg text-gray-600">Cargando regiones...</p>
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Administración de Regiones</h1>
              <p className="text-gray-600">Gestiona el soporte geográfico y cultural de la plataforma</p>
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
                Agregar Región
              </Button>
            </div>
          </div>

          {/* Búsqueda y filtros */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Buscar regiones..."
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                    <select
                      value={selectedFilters.status}
                      onChange={(e) => setSelectedFilters(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">Todos los estados</option>
                      <option value="active">Activas</option>
                      <option value="inactive">Inactivas</option>
                      <option value="pending">Pendientes</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">País</label>
                    <select
                      value={selectedFilters.country}
                      onChange={(e) => setSelectedFilters(prev => ({ ...prev, country: e.target.value }))}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">Todos los países</option>
                      <option value="Guatemala">Guatemala</option>
                      <option value="México">México</option>
                      <option value="Brasil">Brasil</option>
                      <option value="Perú">Perú</option>
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
                    <p className="text-sm font-medium text-gray-600">Total Regiones</p>
                    <p className="text-2xl font-bold text-blue-600">{regions.length}</p>
                  </div>
                  <Globe className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Activas</p>
                    <p className="text-2xl font-bold text-green-600">
                      {regions.filter(r => r.status === 'active').length}
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
                    <p className="text-sm font-medium text-gray-600">Total Usuarios</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {formatNumber(regions.reduce((acc, r) => acc + r.users.total, 0))}
                    </p>
                  </div>
                  <Users2 className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Promedio IA</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {Math.round(regions.reduce((acc, r) => acc + r.aiAnalysis.culturalRelevance, 0) / regions.length * 10)}%
                    </p>
                  </div>
                  <Brain className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Lista de regiones */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredRegions.map((region) => (
            <Card key={region.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                      <Globe className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{region.name}</h3>
                      <p className="text-sm text-gray-600">{region.country} • {region.code}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline" 
                      className={`text-${getStatusColor(region.status)}-600 border-${getStatusColor(region.status)}-200`}
                    >
                      {region.status === 'active' ? 'Activa' : region.status === 'inactive' ? 'Inactiva' : 'Pendiente'}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Información básica */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Población:</span>
                    <span className="font-semibold ml-2">{formatNumber(region.population)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Usuarios:</span>
                    <span className="font-semibold ml-2">{formatNumber(region.users.total)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Alfabetización:</span>
                    <span className="font-semibold ml-2">{region.education.literacyRate}%</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Acceso Digital:</span>
                    <span className="font-semibold ml-2">{region.education.digitalAccess}%</span>
                  </div>
                </div>

                {/* Idiomas */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Idiomas Soportados</h4>
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="outline" className="text-xs bg-blue-50">
                      {region.languages.primary} (Principal)
                    </Badge>
                    {region.languages.secondary.map((lang) => (
                      <Badge key={lang} variant="outline" className="text-xs">
                        {lang}
                      </Badge>
                    ))}
                    {region.languages.indigenous.map((lang) => (
                      <Badge key={lang} variant="secondary" className="text-xs">
                        {lang}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Rendimiento */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Rendimiento</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex justify-between">
                      <span>Promedio:</span>
                      <span className="font-semibold">{region.performance.averageScore}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Completación:</span>
                      <span className="font-semibold">{region.performance.completionRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Engagement:</span>
                      <span className="font-semibold">{region.performance.engagementRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Satisfacción:</span>
                      <span className="font-semibold">{region.performance.satisfactionScore}/10</span>
                    </div>
                  </div>
                </div>

                {/* Análisis de IA */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">Análisis de IA</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="flex justify-between">
                      <span>Cultural:</span>
                      <span className="font-semibold">{region.aiAnalysis.culturalRelevance}/10</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Adaptación:</span>
                      <span className="font-semibold">{region.aiAnalysis.contentAdaptation}/10</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Engagement:</span>
                      <span className="font-semibold">{region.aiAnalysis.userEngagement}/10</span>
                    </div>
                  </div>
                </div>

                {/* Accesibilidad */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Usuarios de Accesibilidad</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex justify-between">
                      <span>Lector pantalla:</span>
                      <span className="font-semibold">{region.accessibility.screenReaderUsers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Alto contraste:</span>
                      <span className="font-semibold">{region.accessibility.highContrastUsers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Teclado:</span>
                      <span className="font-semibold">{region.accessibility.keyboardUsers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Audio:</span>
                      <span className="font-semibold">{region.accessibility.audioUsers}</span>
                    </div>
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedRegion(region)}
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

        {/* Mensaje si no hay regiones */}
        {filteredRegions.length === 0 && (
          <div className="text-center py-12">
            <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron regiones</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || Object.values(selectedFilters).some(f => f !== 'all')
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'Aún no hay regiones configuradas'
              }
            </p>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Primera Región
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
