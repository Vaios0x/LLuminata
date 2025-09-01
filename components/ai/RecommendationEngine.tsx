'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  Lightbulb, 
  Target, 
  TrendingUp, 
  Star, 
  Heart, 
  Clock, 
  Users,
  BookOpen,
  Video,
  Music,
  Gamepad2,
  Palette,
  Globe,
  Zap,
  Filter,
  Search,
  Settings,
  RefreshCw,
  Download,
  Share,
  Bookmark,
  Play,
  Pause,
  Loader2,
  CheckCircle,
  AlertCircle,
  Eye,
  BarChart3,
  PieChart,
  LineChart,
  Calendar,
  Award,
  Flag,
  Timer,
  RotateCcw,
  Plus,
  Minus,
  Maximize,
  Minimize,
  ArrowRight,
  ArrowLeft,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Tipos para el motor de recomendaciones
interface Recommendation {
  id: string;
  title: string;
  description: string;
  type: 'lesson' | 'exercise' | 'video' | 'game' | 'resource' | 'activity';
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // minutos
  rating: number; // 1-5
  relevance: number; // 0-100
  confidence: number; // 0-100
  tags: string[];
  thumbnail?: string;
  url?: string;
  isCompleted?: boolean;
  isBookmarked?: boolean;
  estimatedImpact: 'low' | 'medium' | 'high';
  prerequisites?: string[];
  learningOutcomes: string[];
}

interface UserProfile {
  id: string;
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
  interests: string[];
  skillLevel: Record<string, number>; // skill -> level (0-100)
  completedItems: string[];
  preferences: {
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    duration: 'short' | 'medium' | 'long';
    format: 'video' | 'text' | 'interactive' | 'audio';
    language: string;
  };
  culturalContext: string;
  accessibility: {
    visual: boolean;
    auditory: boolean;
    motor: boolean;
    cognitive: boolean;
  };
}

interface RecommendationEngineProps {
  userId: string;
  onRecommendationSelected?: (recommendation: Recommendation) => void;
  onBookmark?: (recommendationId: string) => void;
  onComplete?: (recommendationId: string) => void;
  onExport?: (recommendations: Recommendation[]) => void;
  className?: string;
}

// Recomendaciones predefinidas
const RECOMMENDATIONS: Recommendation[] = [
  {
    id: 'rec_1',
    title: 'Introducción a la Cultura Maya',
    description: 'Aprende sobre la rica historia y tradiciones de la cultura maya a través de videos interactivos',
    type: 'lesson',
    category: 'cultura',
    difficulty: 'beginner',
    duration: 30,
    rating: 4.8,
    relevance: 95,
    confidence: 92,
    tags: ['maya', 'cultura', 'historia', 'tradiciones'],
    estimatedImpact: 'high',
    learningOutcomes: [
      'Comprender los fundamentos de la cultura maya',
      'Identificar elementos culturales importantes',
      'Apreciar la diversidad cultural'
    ]
  },
  {
    id: 'rec_2',
    title: 'Ejercicios de Matemáticas con Símbolos Mayas',
    description: 'Practica matemáticas usando el sistema numérico maya tradicional',
    type: 'exercise',
    category: 'matemáticas',
    difficulty: 'intermediate',
    duration: 45,
    rating: 4.6,
    relevance: 88,
    confidence: 85,
    tags: ['maya', 'matemáticas', 'números', 'ejercicios'],
    estimatedImpact: 'medium',
    learningOutcomes: [
      'Comprender el sistema numérico maya',
      'Realizar operaciones matemáticas básicas',
      'Conectar matemáticas con cultura'
    ]
  },
  {
    id: 'rec_3',
    title: 'Cuentos Tradicionales en Náhuatl',
    description: 'Escucha y aprende cuentos tradicionales narrados en náhuatl con subtítulos',
    type: 'video',
    category: 'lengua',
    difficulty: 'beginner',
    duration: 20,
    rating: 4.9,
    relevance: 90,
    confidence: 88,
    tags: ['náhuatl', 'cuentos', 'tradición', 'audio'],
    estimatedImpact: 'high',
    learningOutcomes: [
      'Familiarizarse con el náhuatl hablado',
      'Comprender narrativas tradicionales',
      'Desarrollar apreciación cultural'
    ]
  },
  {
    id: 'rec_4',
    title: 'Juego de Memoria: Símbolos Zapotecos',
    description: 'Juego interactivo para aprender y memorizar símbolos zapotecos',
    type: 'game',
    category: 'lengua',
    difficulty: 'beginner',
    duration: 15,
    rating: 4.7,
    relevance: 82,
    confidence: 79,
    tags: ['zapoteco', 'juego', 'memoria', 'símbolos'],
    estimatedImpact: 'medium',
    learningOutcomes: [
      'Reconocer símbolos zapotecos básicos',
      'Mejorar memoria visual',
      'Aprender de forma lúdica'
    ]
  },
  {
    id: 'rec_5',
    title: 'Arte Purépecha: Técnicas Tradicionales',
    description: 'Tutorial paso a paso para crear arte purépecha tradicional',
    type: 'activity',
    category: 'arte',
    difficulty: 'intermediate',
    duration: 60,
    rating: 4.5,
    relevance: 75,
    confidence: 72,
    tags: ['purépecha', 'arte', 'manualidades', 'tradición'],
    estimatedImpact: 'medium',
    learningOutcomes: [
      'Aprender técnicas artísticas tradicionales',
      'Crear obras inspiradas en la cultura purépecha',
      'Desarrollar habilidades manuales'
    ]
  },
  {
    id: 'rec_6',
    title: 'Gramática Mixteca Avanzada',
    description: 'Lección avanzada sobre la estructura gramatical del mixteco',
    type: 'lesson',
    category: 'lengua',
    difficulty: 'advanced',
    duration: 40,
    rating: 4.4,
    relevance: 68,
    confidence: 65,
    tags: ['mixteco', 'gramática', 'avanzado', 'lengua'],
    estimatedImpact: 'low',
    learningOutcomes: [
      'Comprender estructuras gramaticales complejas',
      'Analizar patrones lingüísticos',
      'Desarrollar competencia avanzada'
    ]
  },
  {
    id: 'rec_7',
    title: 'Música Tradicional: Instrumentos Indígenas',
    description: 'Explora los instrumentos musicales tradicionales de las culturas indígenas',
    type: 'video',
    category: 'música',
    difficulty: 'beginner',
    duration: 25,
    rating: 4.8,
    relevance: 85,
    confidence: 82,
    tags: ['música', 'instrumentos', 'tradición', 'cultura'],
    estimatedImpact: 'high',
    learningOutcomes: [
      'Identificar instrumentos tradicionales',
      'Comprender su importancia cultural',
      'Apreciar la diversidad musical'
    ]
  },
  {
    id: 'rec_8',
    title: 'Proyecto: Crear un Códice Digital',
    description: 'Proyecto creativo para crear un códice digital inspirado en los códices mixtecos',
    type: 'activity',
    category: 'proyecto',
    difficulty: 'intermediate',
    duration: 90,
    rating: 4.6,
    relevance: 78,
    confidence: 75,
    tags: ['proyecto', 'códice', 'digital', 'creatividad'],
    estimatedImpact: 'high',
    learningOutcomes: [
      'Aplicar conocimientos culturales de forma creativa',
      'Desarrollar habilidades digitales',
      'Crear contenido cultural significativo'
    ]
  }
];

// Perfil de usuario de ejemplo
const USER_PROFILE: UserProfile = {
  id: 'user_123',
  learningStyle: 'visual',
  interests: ['cultura', 'historia', 'lengua', 'arte'],
  skillLevel: {
    'maya': 65,
    'náhuatl': 45,
    'zapoteco': 30,
    'purépecha': 25,
    'mixteco': 20,
    'matemáticas': 80,
    'arte': 60,
    'música': 40
  },
  completedItems: ['rec_1', 'rec_3'],
  preferences: {
    difficulty: 'intermediate',
    duration: 'medium',
    format: 'video',
    language: 'es-MX'
  },
  culturalContext: 'maya',
  accessibility: {
    visual: true,
    auditory: true,
    motor: true,
    cognitive: true
  }
};

export function RecommendationEngine({
  userId,
  onRecommendationSelected,
  onBookmark,
  onComplete,
  onExport,
  className
}: RecommendationEngineProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>(RECOMMENDATIONS);
  const [filteredRecommendations, setFilteredRecommendations] = useState<Recommendation[]>(RECOMMENDATIONS);
  const [selectedFilters, setSelectedFilters] = useState({
    type: 'all',
    difficulty: 'all',
    duration: 'all',
    category: 'all'
  });
  const [sortBy, setSortBy] = useState<'relevance' | 'rating' | 'duration' | 'difficulty'>('relevance');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedRecommendation, setSelectedRecommendation] = useState<Recommendation | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Filtrar recomendaciones
  useEffect(() => {
    let filtered = recommendations;

    // Filtro por búsqueda
    if (searchQuery) {
      filtered = filtered.filter(rec => 
        rec.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rec.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rec.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Filtros por tipo
    if (selectedFilters.type !== 'all') {
      filtered = filtered.filter(rec => rec.type === selectedFilters.type);
    }

    // Filtros por dificultad
    if (selectedFilters.difficulty !== 'all') {
      filtered = filtered.filter(rec => rec.difficulty === selectedFilters.difficulty);
    }

    // Filtros por duración
    if (selectedFilters.duration !== 'all') {
      filtered = filtered.filter(rec => {
        const duration = rec.duration;
        switch (selectedFilters.duration) {
          case 'short': return duration <= 20;
          case 'medium': return duration > 20 && duration <= 45;
          case 'long': return duration > 45;
          default: return true;
        }
      });
    }

    // Filtros por categoría
    if (selectedFilters.category !== 'all') {
      filtered = filtered.filter(rec => rec.category === selectedFilters.category);
    }

    // Ordenar
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'relevance': return b.relevance - a.relevance;
        case 'rating': return b.rating - a.rating;
        case 'duration': return a.duration - b.duration;
        case 'difficulty': {
          const difficultyOrder = { beginner: 1, intermediate: 2, advanced: 3 };
          return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
        }
        default: return 0;
      }
    });

    setFilteredRecommendations(filtered);
  }, [recommendations, selectedFilters, sortBy, searchQuery]);

  // Generar nuevas recomendaciones
  const generateRecommendations = useCallback(async () => {
    setIsGenerating(true);
    
    try {
      // Simular generación de recomendaciones con IA
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // En un caso real, aquí se llamaría a la API de IA
      const newRecommendations = RECOMMENDATIONS.map(rec => ({
        ...rec,
        relevance: Math.min(100, rec.relevance + Math.random() * 10 - 5),
        confidence: Math.min(100, rec.confidence + Math.random() * 10 - 5)
      }));
      
      setRecommendations(newRecommendations);
    } catch (error) {
      console.error('Error generando recomendaciones:', error);
    } finally {
      setIsGenerating(false);
    }
  }, []);

  // Seleccionar recomendación
  const selectRecommendation = useCallback((recommendation: Recommendation) => {
    setSelectedRecommendation(recommendation);
    if (onRecommendationSelected) {
      onRecommendationSelected(recommendation);
    }
  }, [onRecommendationSelected]);

  // Marcar como favorito
  const toggleBookmark = useCallback((recommendationId: string) => {
    setRecommendations(prev => prev.map(rec => 
      rec.id === recommendationId 
        ? { ...rec, isBookmarked: !rec.isBookmarked }
        : rec
    ));
    
    if (onBookmark) {
      onBookmark(recommendationId);
    }
  }, [onBookmark]);

  // Marcar como completado
  const markAsCompleted = useCallback((recommendationId: string) => {
    setRecommendations(prev => prev.map(rec => 
      rec.id === recommendationId 
        ? { ...rec, isCompleted: true }
        : rec
    ));
    
    if (onComplete) {
      onComplete(recommendationId);
    }
  }, [onComplete]);

  // Exportar recomendaciones
  const exportRecommendations = useCallback(() => {
    if (onExport) {
      onExport(filteredRecommendations);
    }
  }, [filteredRecommendations, onExport]);

  // Obtener icono por tipo
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'lesson': return <BookOpen className="w-4 h-4" />;
      case 'video': return <Video className="w-4 h-4" />;
      case 'game': return <Gamepad2 className="w-4 h-4" />;
      case 'exercise': return <Target className="w-4 h-4" />;
      case 'activity': return <Palette className="w-4 h-4" />;
      case 'resource': return <Globe className="w-4 h-4" />;
      default: return <Lightbulb className="w-4 h-4" />;
    }
  };

  // Obtener color por dificultad
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-100';
      case 'intermediate': return 'text-yellow-600 bg-yellow-100';
      case 'advanced': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Obtener color por impacto
  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <Card className={cn("w-full max-w-7xl mx-auto", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-6 h-6 text-green-600" />
              Motor de Recomendaciones Inteligentes
            </CardTitle>
            <CardDescription>
              Descubre contenido personalizado basado en tu perfil y preferencias
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={generateRecommendations} disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generando...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Actualizar
                </>
              )}
            </Button>
            <Button variant="outline" size="sm" onClick={exportRecommendations}>
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Panel de Filtros */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtros
            </h3>
            
            <div className="space-y-4">
              {/* Búsqueda */}
              <div>
                <label className="text-sm font-medium mb-2 block">Buscar</label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar recomendaciones..."
                    className="w-full pl-8 pr-3 py-2 border rounded-md text-sm"
                    tabIndex={0}
                    aria-label="Buscar recomendaciones"
                  />
                </div>
              </div>

              {/* Tipo */}
              <div>
                <label className="text-sm font-medium mb-2 block">Tipo</label>
                <select
                  value={selectedFilters.type}
                  onChange={(e) => setSelectedFilters(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full p-2 border rounded-md text-sm"
                  tabIndex={0}
                  aria-label="Filtrar por tipo"
                >
                  <option value="all">Todos los tipos</option>
                  <option value="lesson">Lecciones</option>
                  <option value="video">Videos</option>
                  <option value="game">Juegos</option>
                  <option value="exercise">Ejercicios</option>
                  <option value="activity">Actividades</option>
                  <option value="resource">Recursos</option>
                </select>
              </div>

              {/* Dificultad */}
              <div>
                <label className="text-sm font-medium mb-2 block">Dificultad</label>
                <select
                  value={selectedFilters.difficulty}
                  onChange={(e) => setSelectedFilters(prev => ({ ...prev, difficulty: e.target.value }))}
                  className="w-full p-2 border rounded-md text-sm"
                  tabIndex={0}
                  aria-label="Filtrar por dificultad"
                >
                  <option value="all">Todas las dificultades</option>
                  <option value="beginner">Principiante</option>
                  <option value="intermediate">Intermedio</option>
                  <option value="advanced">Avanzado</option>
                </select>
              </div>

              {/* Duración */}
              <div>
                <label className="text-sm font-medium mb-2 block">Duración</label>
                <select
                  value={selectedFilters.duration}
                  onChange={(e) => setSelectedFilters(prev => ({ ...prev, duration: e.target.value }))}
                  className="w-full p-2 border rounded-md text-sm"
                  tabIndex={0}
                  aria-label="Filtrar por duración"
                >
                  <option value="all">Todas las duraciones</option>
                  <option value="short">Corta (≤20 min)</option>
                  <option value="medium">Media (21-45 min)</option>
                  <option value="long">Larga ({'>'}45 min)</option>
                </select>
              </div>

              {/* Categoría */}
              <div>
                <label className="text-sm font-medium mb-2 block">Categoría</label>
                <select
                  value={selectedFilters.category}
                  onChange={(e) => setSelectedFilters(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full p-2 border rounded-md text-sm"
                  tabIndex={0}
                  aria-label="Filtrar por categoría"
                >
                  <option value="all">Todas las categorías</option>
                  <option value="cultura">Cultura</option>
                  <option value="lengua">Lengua</option>
                  <option value="matemáticas">Matemáticas</option>
                  <option value="arte">Arte</option>
                  <option value="música">Música</option>
                  <option value="proyecto">Proyecto</option>
                </select>
              </div>

              {/* Ordenar por */}
              <div>
                <label className="text-sm font-medium mb-2 block">Ordenar por</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full p-2 border rounded-md text-sm"
                  tabIndex={0}
                  aria-label="Ordenar recomendaciones"
                >
                  <option value="relevance">Relevancia</option>
                  <option value="rating">Calificación</option>
                  <option value="duration">Duración</option>
                  <option value="difficulty">Dificultad</option>
                </select>
              </div>
            </div>
          </div>

          {/* Panel de Recomendaciones */}
          <div className="lg:col-span-3 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                Recomendaciones ({filteredRecommendations.length})
              </h3>
              <div className="text-sm text-muted-foreground">
                Basado en tu perfil y preferencias
              </div>
            </div>
            
            <div className="grid gap-4">
              {filteredRecommendations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Lightbulb className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No se encontraron recomendaciones</p>
                  <p className="text-sm">Intenta ajustar los filtros</p>
                </div>
              ) : (
                filteredRecommendations.map((recommendation) => (
                  <div
                    key={recommendation.id}
                    className={cn(
                      "p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md",
                      selectedRecommendation?.id === recommendation.id && "border-green-500 bg-green-50"
                    )}
                    onClick={() => selectRecommendation(recommendation)}
                    tabIndex={0}
                    role="button"
                    aria-label={`Seleccionar recomendación: ${recommendation.title}`}
                    onKeyDown={(e) => e.key === 'Enter' && selectRecommendation(recommendation)}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        {getTypeIcon(recommendation.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm line-clamp-1">{recommendation.title}</h4>
                            <p className="text-xs text-muted-foreground line-clamp-2">{recommendation.description}</p>
                          </div>
                          <div className="flex items-center gap-1 ml-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleBookmark(recommendation.id);
                              }}
                              className="h-6 w-6 p-0"
                              tabIndex={0}
                              aria-label={recommendation.isBookmarked ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                            >
                              <Bookmark className={cn("w-3 h-3", recommendation.isBookmarked && "fill-current")} />
                            </Button>
                            {recommendation.isCompleted && (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 mb-2">
                          <Badge 
                            variant="outline" 
                            className={cn("text-xs", getDifficultyColor(recommendation.difficulty))}
                          >
                            {recommendation.difficulty}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {recommendation.duration}min
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            ⭐ {recommendation.rating}
                          </Badge>
                          <Badge 
                            variant="outline" 
                            className={cn("text-xs", getImpactColor(recommendation.estimatedImpact))}
                          >
                            Impacto: {recommendation.estimatedImpact}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="text-xs text-muted-foreground">
                              Relevancia: {recommendation.relevance}%
                            </div>
                            <div className="w-16 h-1 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-green-500 transition-all duration-300"
                                style={{ width: `${recommendation.relevance}%` }}
                              />
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            {recommendation.tags.slice(0, 2).map((tag, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {recommendation.tags.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{recommendation.tags.length - 2}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Detalles de la Recomendación Seleccionada */}
        {selectedRecommendation && (
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  {getTypeIcon(selectedRecommendation.type)}
                  {selectedRecommendation.title}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">{selectedRecommendation.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => markAsCompleted(selectedRecommendation.id)}
                  disabled={selectedRecommendation.isCompleted}
                >
                  {selectedRecommendation.isCompleted ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Completado
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Comenzar
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleBookmark(selectedRecommendation.id)}
                >
                  <Bookmark className={cn("w-4 h-4 mr-2", selectedRecommendation.isBookmarked && "fill-current")} />
                  {selectedRecommendation.isBookmarked ? 'Quitar' : 'Guardar'}
                </Button>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">Resultados de Aprendizaje</h4>
                <ul className="space-y-1">
                  {selectedRecommendation.learningOutcomes.map((outcome, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <Target className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>{outcome}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Métricas</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Relevancia</span>
                    <span>{selectedRecommendation.relevance}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 transition-all duration-300"
                      style={{ width: `${selectedRecommendation.relevance}%` }}
                    />
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span>Confianza</span>
                    <span>{selectedRecommendation.confidence}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 transition-all duration-300"
                      style={{ width: `${selectedRecommendation.confidence}%` }}
                    />
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span>Calificación</span>
                    <span>⭐ {selectedRecommendation.rating}/5</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <div className="flex gap-2">
          <Button variant="outline" onClick={generateRecommendations} disabled={isGenerating}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Generar Nuevas
          </Button>
          <Button variant="outline" onClick={exportRecommendations}>
            <Download className="w-4 h-4 mr-2" />
            Exportar Lista
          </Button>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{filteredRecommendations.length} recomendaciones</span>
          <span>•</span>
          <span>{recommendations.filter(r => r.isBookmarked).length} guardadas</span>
          <span>•</span>
          <span>{recommendations.filter(r => r.isCompleted).length} completadas</span>
        </div>
      </CardFooter>
    </Card>
  );
}
