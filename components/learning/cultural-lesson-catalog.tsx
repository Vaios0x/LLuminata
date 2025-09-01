'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Filter, 
  Globe, 
  BookOpen, 
  Users, 
  Clock, 
  Star, 
  Play,
  Heart,
  Mic,
  Eye,
  Volume2,
  Target,
  MapPin,
  Languages,
  GraduationCap,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  X,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useScreenReader } from '@/components/accessibility/screen-reader';
import { useHighContrast } from '@/components/accessibility/high-contrast';
import { culturalContentService, CulturalLesson } from '@/lib/cultural-content-service';

interface CulturalLessonCatalogProps {
  onLessonSelect: (lesson: CulturalLesson) => void;
  className?: string;
  showFilters?: boolean;
  showSearch?: boolean;
  maxLessons?: number;
  selectedCulture?: string;
  selectedLanguage?: string;
  selectedRegion?: string;
  selectedSubject?: string;
  selectedDifficulty?: string;
  selectedAgeGroup?: string;
}

interface FilterState {
  search: string;
  culture: string;
  language: string;
  region: string;
  subject: string;
  difficulty: string;
  ageGroup: string;
  showCompleted: boolean;
  showAudio: boolean;
  showVisual: boolean;
}

interface SortOption {
  label: string;
  value: string;
  icon: React.ReactNode;
}

export const CulturalLessonCatalog: React.FC<CulturalLessonCatalogProps> = ({
  onLessonSelect,
  className,
  showFilters = true,
  showSearch = true,
  maxLessons = 12,
  selectedCulture,
  selectedLanguage,
  selectedRegion,
  selectedSubject,
  selectedDifficulty,
  selectedAgeGroup
}) => {
  const [lessons, setLessons] = useState<CulturalLesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [sortBy, setSortBy] = useState('title');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    culture: selectedCulture || '',
    language: selectedLanguage || '',
    region: selectedRegion || '',
    subject: selectedSubject || '',
    difficulty: selectedDifficulty || '',
    ageGroup: selectedAgeGroup || '',
    showCompleted: false,
    showAudio: true,
    showVisual: true
  });

  const { speak, isEnabled: screenReaderEnabled } = useScreenReader();
  const { isEnabled: highContrastEnabled, getStyles } = useHighContrast();

  // Cargar lecciones culturales
  useEffect(() => {
    const loadLessons = async () => {
      try {
        setIsLoading(true);
        const allLessons = culturalContentService.getAllLessons();
        setLessons(allLessons);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error cargando lecciones');
        console.error('Error cargando lecciones culturales:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadLessons();
  }, []);

  // Opciones de ordenamiento
  const sortOptions: SortOption[] = [
    { label: 'Título', value: 'title', icon: <BookOpen className="w-4 h-4" /> },
    { label: 'Cultura', value: 'culture', icon: <Globe className="w-4 h-4" /> },
    { label: 'Dificultad', value: 'difficulty', icon: <Target className="w-4 h-4" /> },
    { label: 'Duración', value: 'duration', icon: <Clock className="w-4 h-4" /> },
    { label: 'Materia', value: 'subject', icon: <GraduationCap className="w-4 h-4" /> }
  ];

  // Obtener opciones únicas para filtros
  const filterOptions = useMemo(() => {
    const cultures = [...new Set(lessons.map(l => l.culture))];
    const languages = [...new Set(lessons.map(l => l.language))];
    const regions = [...new Set(lessons.map(l => l.region))];
    const subjects = [...new Set(lessons.map(l => l.subject))];
    const difficulties = [...new Set(lessons.map(l => l.difficulty))];
    const ageGroups = [...new Set(lessons.map(l => l.ageGroup))];

    return { cultures, languages, regions, subjects, difficulties, ageGroups };
  }, [lessons]);

  // Filtrar y ordenar lecciones
  const filteredAndSortedLessons = useMemo(() => {
    let filtered = lessons.filter(lesson => {
      // Filtro de búsqueda
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch = 
          lesson.title.toLowerCase().includes(searchLower) ||
          lesson.titleIndigenous.toLowerCase().includes(searchLower) ||
          lesson.description.toLowerCase().includes(searchLower) ||
          lesson.culture.toLowerCase().includes(searchLower) ||
          lesson.language.toLowerCase().includes(searchLower) ||
          lesson.subject.toLowerCase().includes(searchLower);
        
        if (!matchesSearch) return false;
      }

      // Filtros específicos
      if (filters.culture && lesson.culture !== filters.culture) return false;
      if (filters.language && lesson.language !== filters.language) return false;
      if (filters.region && lesson.region !== filters.region) return false;
      if (filters.subject && lesson.subject !== filters.subject) return false;
      if (filters.difficulty && lesson.difficulty !== filters.difficulty) return false;
      if (filters.ageGroup && lesson.ageGroup !== filters.ageGroup) return false;

      // Filtros de accesibilidad
      if (filters.showAudio && !lesson.accessibility.hasAudio) return false;
      if (filters.showVisual && !lesson.accessibility.hasVisualAids) return false;

      return true;
    });

    // Ordenar
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case 'title':
          aValue = a.title;
          bValue = b.title;
          break;
        case 'culture':
          aValue = a.culture;
          bValue = b.culture;
          break;
        case 'difficulty':
          const difficultyOrder = { 'beginner': 1, 'intermediate': 2, 'advanced': 3 };
          aValue = difficultyOrder[a.difficulty as keyof typeof difficultyOrder];
          bValue = difficultyOrder[b.difficulty as keyof typeof difficultyOrder];
          break;
        case 'duration':
          aValue = a.duration;
          bValue = b.duration;
          break;
        case 'subject':
          aValue = a.subject;
          bValue = b.subject;
          break;
        default:
          aValue = a.title;
          bValue = b.title;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered.slice(0, maxLessons);
  }, [lessons, filters, sortBy, sortOrder, maxLessons]);

  const handleFilterChange = (key: keyof FilterState, value: string | boolean) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSortChange = (newSortBy: string) => {
    if (sortBy === newSortBy) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('asc');
    }
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      culture: '',
      language: '',
      region: '',
      subject: '',
      difficulty: '',
      ageGroup: '',
      showCompleted: false,
      showAudio: true,
      showVisual: true
    });
  };

  const handleLessonSelect = (lesson: CulturalLesson) => {
    onLessonSelect(lesson);
    
    if (screenReaderEnabled) {
      speak(`Lección seleccionada: ${lesson.title}. ${lesson.description}`);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSubjectIcon = (subject: string) => {
    switch (subject) {
      case 'mathematics': return <Target className="w-4 h-4" />;
      case 'language': return <Languages className="w-4 h-4" />;
      case 'science': return <GraduationCap className="w-4 h-4" />;
      case 'history': return <BookOpen className="w-4 h-4" />;
      case 'culture': return <Heart className="w-4 h-4" />;
      case 'art': return <Eye className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando catálogo de lecciones culturales...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <X className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-2">Error cargando lecciones</p>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header del catálogo */}
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Globe className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Catálogo de Lecciones Culturales</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Explora lecciones en idiomas indígenas con contenido culturalmente relevante. 
          Aprende matemáticas, idiomas, ciencias y más en el contexto de tu cultura.
        </p>
      </div>

      {/* Filtros y búsqueda */}
      {showFilters && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold flex items-center">
                <Filter className="w-5 h-5 mr-2" />
                Filtros y Búsqueda
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                aria-label="Alternar filtros avanzados"
                tabIndex={0}
              >
                {showAdvancedFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                Filtros Avanzados
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Búsqueda */}
            {showSearch && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar lecciones por título, cultura, idioma..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-10"
                  aria-label="Buscar lecciones"
                  tabIndex={0}
                />
              </div>
            )}

            {/* Filtros básicos */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Cultura</label>
                <select
                  value={filters.culture}
                  onChange={(e) => handleFilterChange('culture', e.target.value)}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  aria-label="Filtrar por cultura"
                  tabIndex={0}
                >
                  <option value="">Todas las culturas</option>
                  {filterOptions.cultures.map(culture => (
                    <option key={culture} value={culture}>{culture}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Idioma</label>
                <select
                  value={filters.language}
                  onChange={(e) => handleFilterChange('language', e.target.value)}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  aria-label="Filtrar por idioma"
                  tabIndex={0}
                >
                  <option value="">Todos los idiomas</option>
                  {filterOptions.languages.map(language => (
                    <option key={language} value={language}>{language}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Materia</label>
                <select
                  value={filters.subject}
                  onChange={(e) => handleFilterChange('subject', e.target.value)}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  aria-label="Filtrar por materia"
                  tabIndex={0}
                >
                  <option value="">Todas las materias</option>
                  {filterOptions.subjects.map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Filtros avanzados */}
            {showAdvancedFilters && (
              <div className="space-y-4 pt-4 border-t">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Región</label>
                    <select
                      value={filters.region}
                      onChange={(e) => handleFilterChange('region', e.target.value)}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      aria-label="Filtrar por región"
                      tabIndex={0}
                    >
                      <option value="">Todas las regiones</option>
                      {filterOptions.regions.map(region => (
                        <option key={region} value={region}>{region}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Dificultad</label>
                    <select
                      value={filters.difficulty}
                      onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      aria-label="Filtrar por dificultad"
                      tabIndex={0}
                    >
                      <option value="">Todas las dificultades</option>
                      {filterOptions.difficulties.map(difficulty => (
                        <option key={difficulty} value={difficulty}>{difficulty}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Grupo de Edad</label>
                    <select
                      value={filters.ageGroup}
                      onChange={(e) => handleFilterChange('ageGroup', e.target.value)}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      aria-label="Filtrar por grupo de edad"
                      tabIndex={0}
                    >
                      <option value="">Todos los grupos</option>
                      {filterOptions.ageGroups.map(ageGroup => (
                        <option key={ageGroup} value={ageGroup}>{ageGroup}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Ordenar por</label>
                    <select
                      value={`${sortBy}-${sortOrder}`}
                      onChange={(e) => {
                        const [newSortBy, newSortOrder] = e.target.value.split('-');
                        setSortBy(newSortBy);
                        setSortOrder(newSortOrder as 'asc' | 'desc');
                      }}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      aria-label="Ordenar lecciones"
                      tabIndex={0}
                    >
                      {sortOptions.map(option => (
                        <option key={`${option.value}-asc`} value={`${option.value}-asc`}>
                          {option.label} (A-Z)
                        </option>
                      ))}
                      {sortOptions.map(option => (
                        <option key={`${option.value}-desc`} value={`${option.value}-desc`}>
                          {option.label} (Z-A)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Filtros de accesibilidad */}
                <div className="flex items-center space-x-6">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={filters.showAudio}
                      onChange={(e) => handleFilterChange('showAudio', e.target.checked)}
                      className="rounded"
                      aria-label="Mostrar solo lecciones con audio"
                      tabIndex={0}
                    />
                    <span className="text-sm flex items-center">
                      <Volume2 className="w-4 h-4 mr-1" />
                      Con audio
                    </span>
                  </label>

                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={filters.showVisual}
                      onChange={(e) => handleFilterChange('showVisual', e.target.checked)}
                      className="rounded"
                      aria-label="Mostrar solo lecciones con ayudas visuales"
                      tabIndex={0}
                    />
                    <span className="text-sm flex items-center">
                      <Eye className="w-4 h-4 mr-1" />
                      Con ayudas visuales
                    </span>
                  </label>
                </div>

                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="flex items-center"
                  aria-label="Limpiar todos los filtros"
                  tabIndex={0}
                >
                  <X className="w-4 h-4 mr-2" />
                  Limpiar Filtros
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{filteredAndSortedLessons.length}</p>
                <p className="text-sm text-gray-600">Lecciones encontradas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Globe className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{filterOptions.cultures.length}</p>
                <p className="text-sm text-gray-600">Culturas disponibles</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Languages className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{filterOptions.languages.length}</p>
                <p className="text-sm text-gray-600">Idiomas indígenas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <GraduationCap className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{filterOptions.subjects.length}</p>
                <p className="text-sm text-gray-600">Materias cubiertas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de lecciones */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            Lecciones Culturales ({filteredAndSortedLessons.length})
          </h2>
        </div>

        {filteredAndSortedLessons.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Globe className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">No se encontraron lecciones</p>
                <p className="text-sm text-gray-500">
                  Intenta ajustar los filtros de búsqueda
                </p>
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="mt-4"
                  aria-label="Limpiar filtros"
                  tabIndex={0}
                >
                  Limpiar Filtros
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedLessons.map((lesson) => (
              <Card
                key={lesson.id}
                className="hover:shadow-lg transition-shadow duration-200 cursor-pointer group"
                onClick={() => handleLessonSelect(lesson)}
                style={highContrastEnabled ? getStyles() : {}}
                tabIndex={0}
                role="button"
                aria-label={`Seleccionar lección: ${lesson.title}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleLessonSelect(lesson);
                  }
                }}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                        {getSubjectIcon(lesson.subject)}
                      </div>
                      <div>
                        <CardTitle className="text-lg font-semibold group-hover:text-blue-600 transition-colors">
                          {lesson.title}
                        </CardTitle>
                        {lesson.titleIndigenous && (
                          <p className="text-sm text-gray-600 italic">
                            {lesson.titleIndigenous}
                          </p>
                        )}
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {lesson.description}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-xs">
                      {lesson.culture}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {lesson.language}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {lesson.region}
                    </Badge>
                    <Badge className={cn("text-xs", getDifficultyColor(lesson.difficulty))}>
                      {lesson.difficulty}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{lesson.duration} min</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>{lesson.ageGroup}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {lesson.accessibility.hasAudio && (
                        <Volume2 className="w-4 h-4 text-green-500" title="Incluye audio" />
                      )}
                      {lesson.accessibility.hasVisualAids && (
                        <Eye className="w-4 h-4 text-blue-500" title="Incluye ayudas visuales" />
                      )}
                      {lesson.accessibility.hasSignLanguage && (
                        <Mic className="w-4 h-4 text-purple-500" title="Incluye lengua de señas" />
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <Target className="w-4 h-4 text-gray-400" />
                      <span className="text-xs text-gray-500">
                        {lesson.learningObjectives.length} objetivos
                      </span>
                    </div>
                    <Button
                      size="sm"
                      className="group-hover:bg-blue-600 transition-colors"
                      aria-label={`Comenzar lección: ${lesson.title}`}
                      tabIndex={0}
                    >
                      <Play className="w-4 h-4 mr-1" />
                      Comenzar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
