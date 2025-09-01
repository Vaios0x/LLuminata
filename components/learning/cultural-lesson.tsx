'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Eye, 
  EyeOff,
  ChevronLeft,
  ChevronRight,
  Settings,
  HelpCircle,
  CheckCircle,
  XCircle,
  Star,
  Clock,
  Target,
  Globe,
  Mic,
  BookOpen,
  Users,
  Heart,
  Zap,
  ArrowRight,
  ArrowLeft,
  Volume1,
  Volume3,
  Repeat,
  SkipForward,
  SkipBack,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useScreenReader } from '@/components/accessibility/screen-reader';
import { useHighContrast } from '@/components/accessibility/high-contrast';
import { culturalContentService, CulturalLesson, CulturalLessonSection } from '@/lib/cultural-content-service';

interface CulturalLessonProps {
  lessonId: string;
  studentId: string;
  onComplete: (score: number, timeSpent: number, culturalInsights: string[]) => void;
  onProgress: (sectionId: string, completed: boolean) => void;
  className?: string;
  autoPlay?: boolean;
  showCulturalNotes?: boolean;
  enableAudio?: boolean;
  enableVisualAids?: boolean;
}

interface LessonState {
  currentSection: number;
  isPlaying: boolean;
  timeSpent: number;
  completedSections: Set<string>;
  currentScore: number;
  culturalInsights: string[];
  showPronunciation: boolean;
  showCulturalContext: boolean;
  audioEnabled: boolean;
  visualAidsEnabled: boolean;
  currentAudioUrl?: string;
  isAudioPlaying: boolean;
  pronunciationAudioUrl?: string;
}

export const CulturalLesson: React.FC<CulturalLessonProps> = ({
  lessonId,
  studentId,
  onComplete,
  onProgress,
  className,
  autoPlay = false,
  showCulturalNotes = true,
  enableAudio = true,
  enableVisualAids = true
}) => {
  const [lesson, setLesson] = useState<CulturalLesson | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<LessonState>({
    currentSection: 0,
    isPlaying: autoPlay,
    timeSpent: 0,
    completedSections: new Set(),
    currentScore: 0,
    culturalInsights: [],
    showPronunciation: false,
    showCulturalContext: showCulturalNotes,
    audioEnabled: enableAudio,
    visualAidsEnabled: enableVisualAids,
    isAudioPlaying: false
  });

  const { speak, isEnabled: screenReaderEnabled } = useScreenReader();
  const { isEnabled: highContrastEnabled, getStyles } = useHighContrast();
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const pronunciationAudioRef = useRef<HTMLAudioElement | null>(null);

  // Cargar lección cultural
  useEffect(() => {
    const loadLesson = async () => {
      try {
        setIsLoading(true);
        const loadedLesson = culturalContentService.getLessonById(lessonId);
        
        if (!loadedLesson) {
          throw new Error(`Lección cultural no encontrada: ${lessonId}`);
        }

        setLesson(loadedLesson);
        
        // Anunciar inicio de lección para lectores de pantalla
        if (screenReaderEnabled) {
          speak(`Iniciando lección cultural: ${loadedLesson.title}. ${loadedLesson.description}`);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error cargando lección');
        console.error('Error cargando lección cultural:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadLesson();
  }, [lessonId, screenReaderEnabled, speak]);

  // Timer para seguimiento de tiempo
  useEffect(() => {
    if (state.isPlaying && lesson) {
      timerRef.current = setInterval(() => {
        setState(prev => ({ ...prev, timeSpent: prev.timeSpent + 1 }));
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [state.isPlaying, lesson]);

  // Limpiar audio al desmontar
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (pronunciationAudioRef.current) {
        pronunciationAudioRef.current.pause();
        pronunciationAudioRef.current = null;
      }
    };
  }, []);

  const handlePlayPause = () => {
    setState(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
    
    if (screenReaderEnabled) {
      speak(state.isPlaying ? 'Lección pausada' : 'Lección reanudada');
    }
  };

  const handleNextSection = () => {
    if (lesson && state.currentSection < lesson.sections.length - 1) {
      const nextSection = state.currentSection + 1;
      setState(prev => ({ 
        ...prev, 
        currentSection: nextSection,
        completedSections: new Set([...prev.completedSections, lesson.sections[prev.currentSection].id])
      }));
      
      onProgress(lesson.sections[state.currentSection].id, true);
      
      if (screenReaderEnabled) {
        speak(`Sección ${nextSection + 1} de ${lesson.sections.length}: ${lesson.sections[nextSection].title}`);
      }
    }
  };

  const handlePreviousSection = () => {
    if (state.currentSection > 0) {
      const prevSection = state.currentSection - 1;
      setState(prev => ({ ...prev, currentSection: prevSection }));
      
      if (screenReaderEnabled && lesson) {
        speak(`Sección ${prevSection + 1} de ${lesson.sections.length}: ${lesson.sections[prevSection].title}`);
      }
    }
  };

  const handleSectionComplete = (sectionId: string) => {
    setState(prev => ({
      ...prev,
      completedSections: new Set([...prev.completedSections, sectionId]),
      currentScore: prev.currentScore + 10
    }));
    
    onProgress(sectionId, true);
  };

  const handlePlayAudio = (audioUrl: string) => {
    if (!state.audioEnabled) return;

    if (audioRef.current) {
      audioRef.current.pause();
    }

    audioRef.current = new Audio(audioUrl);
    audioRef.current.play();
    
    setState(prev => ({ ...prev, isAudioPlaying: true }));
    
    audioRef.current.onended = () => {
      setState(prev => ({ ...prev, isAudioPlaying: false }));
    };
  };

  const handlePlayPronunciation = (audioUrl: string) => {
    if (!state.audioEnabled) return;

    if (pronunciationAudioRef.current) {
      pronunciationAudioRef.current.pause();
    }

    pronunciationAudioRef.current = new Audio(audioUrl);
    pronunciationAudioRef.current.play();
  };

  const handleCompleteLesson = () => {
    if (!lesson) return;

    const finalScore = Math.min(100, state.currentScore + (state.completedSections.size * 5));
    const culturalInsights = [...state.culturalInsights];
    
    // Agregar insights culturales de la lección
    lesson.sections.forEach(section => {
      section.culturalNotes.forEach(note => {
        if (!culturalInsights.includes(note)) {
          culturalInsights.push(note);
        }
      });
    });

    onComplete(finalScore, state.timeSpent, culturalInsights);
    
    if (screenReaderEnabled) {
      speak(`Lección completada. Puntuación: ${finalScore}%. Tiempo: ${Math.floor(state.timeSpent / 60)} minutos`);
    }
  };

  const renderSection = (section: CulturalLessonSection, index: number) => {
    const isActive = index === state.currentSection;
    const isCompleted = state.completedSections.has(section.id);

    return (
      <div
        key={section.id}
        className={cn(
          "transition-all duration-300",
          isActive ? "opacity-100 scale-100" : "opacity-50 scale-95"
        )}
      >
        <Card className={cn(
          "mb-6",
          isActive && "ring-2 ring-blue-500",
          isCompleted && "border-green-500"
        )}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                  isCompleted ? "bg-green-500 text-white" : "bg-blue-500 text-white"
                )}>
                  {isCompleted ? <CheckCircle className="w-4 h-4" /> : index + 1}
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold">
                    {section.title}
                  </CardTitle>
                  {section.titleIndigenous && (
                    <p className="text-sm text-gray-600 italic">
                      {section.titleIndigenous}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {section.audioUrl && state.audioEnabled && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePlayAudio(section.audioUrl!)}
                    aria-label="Reproducir audio de la sección"
                    tabIndex={0}
                  >
                    {state.isAudioPlaying && state.currentAudioUrl === section.audioUrl ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Volume2 className="w-4 h-4" />
                    )}
                  </Button>
                )}
                
                {isActive && !isCompleted && (
                  <Button
                    onClick={() => handleSectionComplete(section.id)}
                    size="sm"
                    aria-label="Marcar sección como completada"
                    tabIndex={0}
                  >
                    Completar
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Contenido principal */}
            <div className="space-y-4">
              <div className="prose max-w-none">
                <p className="text-base leading-relaxed">
                  {section.content}
                </p>
                {section.contentIndigenous && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg border-l-4 border-blue-500">
                    <p className="text-sm text-gray-700 italic">
                      <strong>En idioma indígena:</strong> {section.contentIndigenous}
                    </p>
                  </div>
                )}
              </div>

              {/* Imagen de la sección */}
              {section.imageUrl && state.visualAidsEnabled && (
                <div className="flex justify-center">
                  <img
                    src={section.imageUrl}
                    alt={`Ilustración para ${section.title}`}
                    className="max-w-full h-auto rounded-lg shadow-md"
                    style={highContrastEnabled ? getStyles() : {}}
                  />
                </div>
              )}

              {/* Guía de pronunciación */}
              {section.pronunciation.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-lg flex items-center">
                    <Mic className="w-5 h-5 mr-2" />
                    Guía de Pronunciación
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {section.pronunciation.map((pron, idx) => (
                      <div key={idx} className="p-3 border rounded-lg bg-blue-50">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{pron.word}</p>
                            <p className="text-sm text-gray-600">Se pronuncia: {pron.pronunciation}</p>
                            {pron.culturalNote && (
                              <p className="text-xs text-blue-600 mt-1">{pron.culturalNote}</p>
                            )}
                          </div>
                          {pron.audioUrl && state.audioEnabled && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handlePlayPronunciation(pron.audioUrl!)}
                              aria-label={`Escuchar pronunciación de ${pron.word}`}
                              tabIndex={0}
                            >
                              <Volume1 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Ejemplos culturales */}
              {section.examples.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-lg flex items-center">
                    <Globe className="w-5 h-5 mr-2" />
                    Ejemplos Culturales
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {section.examples.map((example, idx) => (
                      <div key={idx} className="p-4 border rounded-lg bg-green-50">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-green-800">{example.spanish}</p>
                            <Badge variant="secondary" className="text-xs">
                              {example.indigenous}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-700">{example.context}</p>
                          <p className="text-xs text-green-600 italic">
                            {example.culturalSignificance}
                          </p>
                          {example.imageUrl && state.visualAidsEnabled && (
                            <img
                              src={example.imageUrl}
                              alt={`Ejemplo: ${example.spanish}`}
                              className="w-full h-32 object-cover rounded mt-2"
                              style={highContrastEnabled ? getStyles() : {}}
                            />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notas culturales */}
              {section.culturalNotes.length > 0 && state.showCulturalContext && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-lg flex items-center">
                    <Heart className="w-5 h-5 mr-2" />
                    Notas Culturales
                  </h4>
                  <div className="space-y-2">
                    {section.culturalNotes.map((note, idx) => (
                      <div key={idx} className="p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                        <p className="text-sm text-yellow-800">{note}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Elementos interactivos */}
              {section.interactiveElements.length > 0 && (
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg flex items-center">
                    <Zap className="w-5 h-5 mr-2" />
                    Actividades Interactivas
                  </h4>
                  {section.interactiveElements.map((element, idx) => (
                    <div key={idx} className="p-4 border rounded-lg bg-purple-50">
                      <h5 className="font-medium mb-3">{element.type}</h5>
                      {/* Aquí se renderizarían los elementos interactivos específicos */}
                      <p className="text-sm text-gray-600">{element.feedback}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando lección cultural...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-2">Error cargando lección</p>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Lección no encontrada</p>
        </div>
      </div>
    );
  }

  const progress = (state.completedSections.size / lesson.sections.length) * 100;
  const currentSection = lesson.sections[state.currentSection];

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header de la lección */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold">
                  {lesson.title}
                </CardTitle>
                {lesson.titleIndigenous && (
                  <p className="text-lg text-gray-600 italic">
                    {lesson.titleIndigenous}
                  </p>
                )}
                <div className="flex items-center space-x-4 mt-2">
                  <Badge variant="outline">{lesson.culture}</Badge>
                  <Badge variant="outline">{lesson.language}</Badge>
                  <Badge variant="outline">{lesson.region}</Badge>
                  <Badge variant="outline">{lesson.difficulty}</Badge>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setState(prev => ({ ...prev, showCulturalContext: !prev.showCulturalContext }))}
                aria-label="Alternar notas culturales"
                tabIndex={0}
              >
                <Heart className="w-4 h-4" />
              </Button>
              
              {state.audioEnabled && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setState(prev => ({ ...prev, audioEnabled: !prev.audioEnabled }))}
                  aria-label="Alternar audio"
                  tabIndex={0}
                >
                  {state.audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </Button>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setState(prev => ({ ...prev, visualAidsEnabled: !prev.visualAidsEnabled }))}
                aria-label="Alternar ayudas visuales"
                tabIndex={0}
              >
                {state.visualAidsEnabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            <p className="text-gray-700 leading-relaxed">
              {lesson.description}
            </p>
            {lesson.descriptionIndigenous && (
              <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                <p className="text-blue-800 italic">
                  <strong>Descripción en idioma indígena:</strong> {lesson.descriptionIndigenous}
                </p>
              </div>
            )}

            {/* Objetivos de aprendizaje */}
            <div className="space-y-2">
              <h4 className="font-semibold text-lg flex items-center">
                <Target className="w-5 h-5 mr-2" />
                Objetivos de Aprendizaje
              </h4>
              <ul className="space-y-1">
                {lesson.learningObjectives.map((objective, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{objective}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contexto cultural */}
            <div className="p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
              <h4 className="font-semibold text-lg mb-2 flex items-center">
                <BookOpen className="w-5 h-5 mr-2" />
                Contexto Cultural
              </h4>
              <p className="text-sm text-yellow-800">{lesson.culturalContext}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Controles de reproducción */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Button
                onClick={handlePlayPause}
                size="lg"
                aria-label={state.isPlaying ? "Pausar lección" : "Reproducir lección"}
                tabIndex={0}
              >
                {state.isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </Button>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviousSection}
                  disabled={state.currentSection === 0}
                  aria-label="Sección anterior"
                  tabIndex={0}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                
                <span className="text-sm font-medium">
                  {state.currentSection + 1} de {lesson.sections.length}
                </span>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextSection}
                  disabled={state.currentSection === lesson.sections.length - 1}
                  aria-label="Siguiente sección"
                  tabIndex={0}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  {Math.floor(state.timeSpent / 60)}:{(state.timeSpent % 60).toString().padStart(2, '0')}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-medium">{state.currentScore}%</span>
              </div>
            </div>
          </div>
          
          <Progress value={progress} className="w-full" />
          <p className="text-sm text-gray-600 mt-2">
            Progreso: {state.completedSections.size} de {lesson.sections.length} secciones completadas
          </p>
        </CardContent>
      </Card>

      {/* Sección actual */}
      {currentSection && renderSection(currentSection, state.currentSection)}

      {/* Navegación de secciones */}
      <Card>
        <CardContent className="pt-6">
          <h4 className="font-semibold text-lg mb-4">Navegación de Secciones</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {lesson.sections.map((section, index) => (
              <Button
                key={section.id}
                variant={index === state.currentSection ? "default" : "outline"}
                size="sm"
                onClick={() => setState(prev => ({ ...prev, currentSection: index }))}
                className={cn(
                  "justify-start",
                  state.completedSections.has(section.id) && "border-green-500 text-green-700"
                )}
                aria-label={`Ir a sección ${index + 1}: ${section.title}`}
                tabIndex={0}
              >
                <div className="flex items-center space-x-2">
                  {state.completedSections.has(section.id) ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <span className="w-4 h-4 rounded-full bg-gray-300 text-xs flex items-center justify-center">
                      {index + 1}
                    </span>
                  )}
                  <span className="truncate">{section.title}</span>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Botón de completar lección */}
      {state.completedSections.size === lesson.sections.length && (
        <Card className="border-green-500 bg-green-50">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-green-800 mb-2">
                  ¡Lección Completada!
                </h3>
                <p className="text-green-700 mb-4">
                  Has completado todas las secciones de esta lección cultural.
                </p>
                <Button
                  onClick={handleCompleteLesson}
                  size="lg"
                  className="bg-green-600 hover:bg-green-700"
                  aria-label="Finalizar lección"
                  tabIndex={0}
                >
                  Finalizar Lección
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
