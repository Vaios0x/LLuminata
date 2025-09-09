import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  Target, 
  Clock, 
  Star, 
  TrendingUp, 
  Lightbulb,
  Play,
  CheckCircle,
  AlertCircle,
  Brain,
  Heart,
  Zap,
  Users,
  Award,
  ArrowRight,
  Filter,
  Search
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { adaptiveAssessmentService, type LearningRecommendation } from '@/lib/adaptive-assessment-service';

interface PersonalizedRecommendationsProps {
  studentId: string;
  subject?: string;
  onRecommendationSelect: (recommendation: LearningRecommendation) => void;
  className?: string;
}

interface RecommendationFilters {
  type: string[];
  priority: string[];
  maxTime: number;
  minCulturalRelevance: number;
  minAccessibilityScore: number;
}

export const PersonalizedRecommendations: React.FC<PersonalizedRecommendationsProps> = ({
  studentId,
  subject = 'mathematics',
  onRecommendationSelect,
  className
}) => {
  const [recommendations, setRecommendations] = useState<LearningRecommendation[]>([]);
  const [filteredRecommendations, setFilteredRecommendations] = useState<LearningRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<RecommendationFilters>({
    type: [],
    priority: [],
    maxTime: 60,
    minCulturalRelevance: 0,
    minAccessibilityScore: 0
  });
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecommendation, setSelectedRecommendation] = useState<LearningRecommendation | null>(null);

  useEffect(() => {
    loadRecommendations();
  }, [studentId, subject]);

  useEffect(() => {
    applyFilters();
  }, [recommendations, filters, searchTerm]);

  const loadRecommendations = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/adaptive-assessment?studentId=${studentId}&type=recommendations&subject=${subject}`);
      
      if (!response.ok) {
        throw new Error('Error cargando recomendaciones');
      }

      const data = await response.json();
      setRecommendations(data.recommendations || []);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...recommendations];

    // Filtro por tipo
    if (filters.type.length > 0) {
      filtered = filtered.filter(rec => filters.type.includes(rec.type));
    }

    // Filtro por prioridad
    if (filters.priority.length > 0) {
      filtered = filtered.filter(rec => filters.priority.includes(rec.priority));
    }

    // Filtro por tiempo máximo
    filtered = filtered.filter(rec => rec.estimatedTime <= filters.maxTime);

    // Filtro por relevancia cultural mínima
    filtered = filtered.filter(rec => rec.culturalRelevance >= filters.minCulturalRelevance);

    // Filtro por puntuación de accesibilidad mínima
    filtered = filtered.filter(rec => rec.accessibilityScore >= filters.minAccessibilityScore);

    // Filtro por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(rec => 
        rec.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rec.type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Ordenar por prioridad y tiempo
    filtered.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority as keyof typeof priorityOrder] - priorityOrder[a.priority as keyof typeof priorityOrder];
      if (priorityDiff !== 0) return priorityDiff;
      return a.estimatedTime - b.estimatedTime;
    });

    setFilteredRecommendations(filtered);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'lesson': return <BookOpen className="w-5 h-5" />;
      case 'practice': return <Target className="w-5 h-5" />;
      case 'review': return <TrendingUp className="w-5 h-5" />;
      case 'enrichment': return <Star className="w-5 h-5" />;
      case 'remediation': return <AlertCircle className="w-5 h-5" />;
      default: return <Lightbulb className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'lesson': return 'bg-blue-100 text-blue-800';
      case 'practice': return 'bg-green-100 text-green-800';
      case 'review': return 'bg-purple-100 text-purple-800';
      case 'enrichment': return 'bg-yellow-100 text-yellow-800';
      case 'remediation': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCulturalRelevanceColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getAccessibilityScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleRecommendationClick = (recommendation: LearningRecommendation) => {
    setSelectedRecommendation(recommendation);
    onRecommendationSelect(recommendation);
  };

  if (isLoading) {
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-lg font-medium">Analizando tu progreso...</p>
            <p className="text-sm text-gray-600 mt-2">Generando recomendaciones personalizadas</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="p-6">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-700 mb-2">Error</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={loadRecommendations} className="flex items-center gap-2">
              <ArrowRight className="w-4 h-4" />
              Reintentar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="w-6 h-6 text-blue-600" />
            Recomendaciones Personalizadas
          </h2>
          <p className="text-gray-600 mt-1">
            Basadas en tu progreso y estilo de aprendizaje
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={loadRecommendations}
          >
            <ArrowRight className="w-4 h-4 mr-2" />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Filtros */}
      {showFilters && (
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Búsqueda */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium mb-2">Buscar</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar recomendaciones..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Tipo */}
              <div>
                <label className="block text-sm font-medium mb-2">Tipo</label>
                <select
                  multiple
                  value={filters.type}
                  onChange={(e) => {
                    const values = Array.from(e.target.selectedOptions, option => option.value);
                    setFilters(prev => ({ ...prev, type: values }));
                  }}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="lesson">Lección</option>
                  <option value="practice">Práctica</option>
                  <option value="review">Repaso</option>
                  <option value="enrichment">Enriquecimiento</option>
                  <option value="remediation">Remediación</option>
                </select>
              </div>

              {/* Prioridad */}
              <div>
                <label className="block text-sm font-medium mb-2">Prioridad</label>
                <select
                  multiple
                  value={filters.priority}
                  onChange={(e) => {
                    const values = Array.from(e.target.selectedOptions, option => option.value);
                    setFilters(prev => ({ ...prev, priority: values }));
                  }}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="high">Alta</option>
                  <option value="medium">Media</option>
                  <option value="low">Baja</option>
                </select>
              </div>

              {/* Tiempo máximo */}
              <div>
                <label className="block text-sm font-medium mb-2">Tiempo máximo (min)</label>
                <input
                  type="range"
                  min="5"
                  max="120"
                  step="5"
                  value={filters.maxTime}
                  onChange={(e) => setFilters(prev => ({ ...prev, maxTime: parseInt(e.target.value) }))}
                  className="w-full"
                />
                <span className="text-sm text-gray-600">{filters.maxTime} min</span>
              </div>

              {/* Relevancia cultural mínima */}
              <div>
                <label className="block text-sm font-medium mb-2">Relevancia cultural mínima</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={filters.minCulturalRelevance}
                  onChange={(e) => setFilters(prev => ({ ...prev, minCulturalRelevance: parseFloat(e.target.value) }))}
                  className="w-full"
                />
                <span className="text-sm text-gray-600">{Math.round(filters.minCulturalRelevance * 100)}%</span>
              </div>

              {/* Puntuación de accesibilidad mínima */}
              <div>
                <label className="block text-sm font-medium mb-2">Accesibilidad mínima</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={filters.minAccessibilityScore}
                  onChange={(e) => setFilters(prev => ({ ...prev, minAccessibilityScore: parseFloat(e.target.value) }))}
                  className="w-full"
                />
                <span className="text-sm text-gray-600">{Math.round(filters.minAccessibilityScore * 100)}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{recommendations.length}</div>
          <div className="text-sm text-gray-600">Total</div>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">
            {recommendations.filter(r => r.priority === 'high').length}
          </div>
          <div className="text-sm text-gray-600">Alta Prioridad</div>
        </div>
        <div className="text-center p-4 bg-purple-50 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">
            {Math.round(recommendations.reduce((acc, r) => acc + r.culturalRelevance, 0) / recommendations.length * 100)}%
          </div>
          <div className="text-sm text-gray-600">Relevancia Cultural</div>
        </div>
        <div className="text-center p-4 bg-orange-50 rounded-lg">
          <div className="text-2xl font-bold text-orange-600">
            {Math.round(recommendations.reduce((acc, r) => acc + r.accessibilityScore, 0) / recommendations.length * 100)}%
          </div>
          <div className="text-sm text-gray-600">Accesibilidad</div>
        </div>
      </div>

      {/* Lista de recomendaciones */}
      <div className="space-y-4">
        {filteredRecommendations.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Lightbulb className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">No hay recomendaciones</h3>
              <p className="text-gray-600">
                No se encontraron recomendaciones que coincidan con los filtros aplicados.
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredRecommendations.map((recommendation, index) => (
            <Card 
              key={index}
              className={cn(
                "cursor-pointer transition-all duration-200 hover:shadow-lg",
                selectedRecommendation === recommendation && "ring-2 ring-blue-500"
              )}
              onClick={() => handleRecommendationClick(recommendation)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(recommendation.type)}
                        <Badge className={getTypeColor(recommendation.type)}>
                          {recommendation.type}
                        </Badge>
                      </div>
                      <Badge className={getPriorityColor(recommendation.priority)}>
                        {recommendation.priority}
                      </Badge>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        {recommendation.estimatedTime} min
                      </div>
                    </div>

                    <h3 className="text-lg font-semibold mb-2">{recommendation.reason}</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <Heart className="w-4 h-4 text-red-500" />
                        <span className="text-sm text-gray-600">Relevancia Cultural:</span>
                        <span className={cn("text-sm font-medium", getCulturalRelevanceColor(recommendation.culturalRelevance))}>
                          {Math.round(recommendation.culturalRelevance * 100)}%
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm text-gray-600">Accesibilidad:</span>
                        <span className={cn("text-sm font-medium", getAccessibilityScoreColor(recommendation.accessibilityScore))}>
                          {Math.round(recommendation.accessibilityScore * 100)}%
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-blue-500" />
                        <span className="text-sm text-gray-600">Tiempo:</span>
                        <span className="text-sm font-medium">{recommendation.estimatedTime} min</span>
                      </div>
                    </div>

                    {recommendation.content && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-700">
                          {typeof recommendation.content === 'string' 
                            ? recommendation.content 
                            : recommendation.content.title || 'Contenido personalizado disponible'
                          }
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <Button
                      size="sm"
                      className="flex items-center gap-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRecommendationClick(recommendation);
                      }}
                    >
                      <Play className="w-4 h-4" />
                      Comenzar
                    </Button>
                    {recommendation.priority === 'high' && (
                      <Badge className="bg-red-100 text-red-800">
                        <Award className="w-3 h-3 mr-1" />
                        Recomendado
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Información adicional */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 mb-1">¿Cómo funcionan las recomendaciones?</h4>
              <p className="text-sm text-blue-800">
                Nuestro sistema analiza tu progreso, dificultades detectadas y estilo de aprendizaje 
                para generar recomendaciones personalizadas. Las recomendaciones de alta prioridad 
                abordan áreas que necesitan atención inmediata.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
