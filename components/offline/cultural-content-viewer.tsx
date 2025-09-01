'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Eye, 
  EyeOff,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Settings,
  Globe,
  Users,
  Star,
  Clock,
  BookOpen,
  Image as ImageIcon,
  Video as VideoIcon,
  FileText,
  Download,
  WifiOff
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useScreenReader } from '@/components/accessibility/screen-reader';
import { useHighContrast } from '@/components/accessibility/high-contrast';

interface CulturalContent {
  id: string;
  title: string;
  description: string;
  culture: string;
  language: string;
  content: {
    text: string;
    audio?: string;
    images?: string[];
    videos?: string[];
    interactive?: any;
  };
  adaptations: {
    examples: string[];
    context: string;
    values: string[];
    traditions: string[];
  };
  accessibility: {
    hasAudio: boolean;
    hasVisualAids: boolean;
    hasTextAlternative: boolean;
    supportsVoiceControl: boolean;
  };
  metadata: {
    duration: number;
    difficulty: number;
    ageRange: string;
    culturalRelevance: number;
  };
}

interface CulturalContentViewerProps {
  contentId: string;
  culture: string;
  language: string;
  isOffline?: boolean;
  className?: string;
}

export const CulturalContentViewer: React.FC<CulturalContentViewerProps> = ({
  contentId,
  culture,
  language,
  isOffline = false,
  className
}) => {
  const [content, setContent] = useState<CulturalContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSection, setCurrentSection] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showAudio, setShowAudio] = useState(true);
  const [showVisualAids, setShowVisualAids] = useState(true);
  const [autoRead, setAutoRead] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const { speak, isEnabled: screenReaderEnabled } = useScreenReader();
  const { isEnabled: highContrastEnabled, getStyles } = useHighContrast();

  // Cargar contenido
  useEffect(() => {
    loadContent();
  }, [contentId, culture, language]);

  // Timer para tiempo de estudio
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setTimeSpent(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isPlaying]);

  // Anunciar cambios de sección
  useEffect(() => {
    if (content && screenReaderEnabled && autoRead) {
      speak(`Sección ${currentSection + 1}: ${content.title}`);
    }
  }, [currentSection, content, screenReaderEnabled, autoRead, speak]);

  const loadContent = async () => {
    setIsLoading(true);
    try {
      let contentData: CulturalContent;

      if (isOffline) {
        // Cargar desde almacenamiento local
        contentData = await loadContentFromStorage(contentId);
      } else {
        // Cargar desde API
        const response = await fetch(`/api/content/${contentId}?culture=${culture}&language=${language}`);
        if (!response.ok) throw new Error('Error cargando contenido');
        contentData = await response.json();
      }

      setContent(contentData);
      
      // Anunciar contenido cargado
      if (screenReaderEnabled) {
        speak(`Contenido cargado: ${contentData.title} en ${contentData.culture}`);
      }

    } catch (error) {
      console.error('Error cargando contenido:', error);
      if (screenReaderEnabled) {
        speak('Error cargando contenido');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loadContentFromStorage = async (id: string): Promise<CulturalContent> => {
    // En producción, esto vendría de IndexedDB
    const stored = localStorage.getItem(`cultural-content-${id}`);
    if (!stored) throw new Error('Contenido no encontrado en almacenamiento local');
    return JSON.parse(stored);
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
    
    if (content?.content.audio && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
    }
  };

  const resetContent = () => {
    setCurrentSection(0);
    setTimeSpent(0);
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
  };

  const nextSection = () => {
    if (content && currentSection < getTotalSections() - 1) {
      setCurrentSection(prev => prev + 1);
    }
  };

  const previousSection = () => {
    if (currentSection > 0) {
      setCurrentSection(prev => prev - 1);
    }
  };

  const getTotalSections = (): number => {
    if (!content) return 0;
    let sections = 1; // Texto principal
    
    if (content.content.images && content.content.images.length > 0) sections++;
    if (content.content.videos && content.content.videos.length > 0) sections++;
    if (content.content.interactive) sections++;
    
    return sections;
  };

  const getCurrentSectionContent = () => {
    if (!content) return null;

    switch (currentSection) {
      case 0:
        return {
          type: 'text',
          title: 'Contenido Principal',
          content: content.content.text
        };
      case 1:
        if (content.content.images && content.content.images.length > 0) {
          return {
            type: 'images',
            title: 'Imágenes Culturales',
            content: content.content.images
          };
        }
        break;
      case 2:
        if (content.content.videos && content.content.videos.length > 0) {
          return {
            type: 'videos',
            title: 'Videos Culturales',
            content: content.content.videos
          };
        }
        break;
      case 3:
        if (content.content.interactive) {
          return {
            type: 'interactive',
            title: 'Actividad Interactiva',
            content: content.content.interactive
          };
        }
        break;
    }
    return null;
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className={cn("flex items-center justify-center p-8", className)}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Cargando contenido cultural...</p>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className={cn("text-center p-8", className)}>
        <p>No se pudo cargar el contenido.</p>
      </div>
    );
  }

  const currentSectionContent = getCurrentSectionContent();
  const progressPercentage = ((currentSection + 1) / getTotalSections()) * 100;

  return (
    <div className={cn("space-y-6", className)} style={getStyles()}>
      {/* Header del contenido */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <CardTitle className="text-xl">{content.title}</CardTitle>
                {isOffline && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <WifiOff className="h-3 w-3" />
                    Offline
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground">{content.description}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline">{content.culture}</Badge>
                <Badge variant="outline">{content.language}</Badge>
                <Badge variant="secondary">Nivel {content.metadata.difficulty}</Badge>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
                aria-label="Configuración de contenido"
              >
                <Settings className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAutoRead(!autoRead)}
                className={cn(autoRead && "bg-primary text-primary-foreground")}
                aria-label={autoRead ? "Desactivar lectura automática" : "Activar lectura automática"}
              >
                {autoRead ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Barra de progreso */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progreso: {currentSection + 1} de {getTotalSections()}</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <Progress value={progressPercentage} />
          </div>

          {/* Controles de reproducción */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={togglePlay}
              aria-label={isPlaying ? "Pausar contenido" : "Reproducir contenido"}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={resetContent}
              aria-label="Reiniciar contenido"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-3 w-3" />
              {formatTime(timeSpent)}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Configuración */}
      {showSettings && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center justify-between">
                <span>Audio</span>
                <Button
                  variant={showAudio ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowAudio(!showAudio)}
                >
                  {showAudio ? <Volume2 className="h-3 w-3" /> : <VolumeX className="h-3 w-3" />}
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <span>Ayudas visuales</span>
                <Button
                  variant={showVisualAids ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowVisualAids(!showVisualAids)}
                >
                  {showVisualAids ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contenido actual */}
      {currentSectionContent && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {currentSectionContent.type === 'text' && <FileText className="h-5 w-5" />}
              {currentSectionContent.type === 'images' && <ImageIcon className="h-5 w-5" />}
              {currentSectionContent.type === 'videos' && <VideoIcon className="h-5 w-5" />}
              {currentSectionContent.type === 'interactive' && <BookOpen className="h-5 w-5" />}
              {currentSectionContent.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ContentRenderer 
              section={currentSectionContent}
              showAudio={showAudio}
              showVisualAids={showVisualAids}
              autoRead={autoRead}
            />
          </CardContent>
        </Card>
      )}

      {/* Adaptaciones culturales */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Adaptaciones Culturales
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Ejemplos Culturales</h4>
              <ul className="space-y-1 text-sm">
                {content.adaptations.examples.map((example, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Star className="h-3 w-3 text-yellow-500" />
                    {example}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Valores y Tradiciones</h4>
              <ul className="space-y-1 text-sm">
                {content.adaptations.values.map((value, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Users className="h-3 w-3 text-blue-500" />
                    {value}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <h4 className="font-medium mb-1">Contexto Cultural</h4>
            <p className="text-sm text-muted-foreground">{content.adaptations.context}</p>
          </div>
        </CardContent>
      </Card>

      {/* Navegación */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={previousSection}
          disabled={currentSection === 0}
          aria-label="Sección anterior"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Anterior
        </Button>

        <div className="text-sm text-muted-foreground">
          Sección {currentSection + 1} de {getTotalSections()}
        </div>

        <Button
          onClick={nextSection}
          disabled={currentSection >= getTotalSections() - 1}
          aria-label="Siguiente sección"
        >
          Siguiente
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>

      {/* Audio oculto para reproducción */}
      {content.content.audio && (
        <audio
          ref={audioRef}
          src={content.content.audio}
          onEnded={() => setIsPlaying(false)}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          style={{ display: 'none' }}
        />
      )}
    </div>
  );
};

// Componente para renderizar diferentes tipos de contenido
interface ContentRendererProps {
  section: {
    type: string;
    title: string;
    content: any;
  };
  showAudio: boolean;
  showVisualAids: boolean;
  autoRead: boolean;
}

const ContentRenderer: React.FC<ContentRendererProps> = ({
  section,
  showAudio,
  showVisualAids,
  autoRead
}) => {
  const { speak } = useScreenReader();

  useEffect(() => {
    if (autoRead && section.type === 'text') {
      speak(section.content);
    }
  }, [section, autoRead, speak]);

  switch (section.type) {
    case 'text':
      return (
        <div className="prose max-w-none">
          <p className="text-lg leading-relaxed">{section.content}</p>
        </div>
      );

    case 'images':
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {section.content.map((image: string, index: number) => (
            <div key={index} className="text-center">
              <img 
                src={image} 
                alt={`Imagen cultural ${index + 1}`}
                className="max-w-full h-auto rounded-lg shadow-md"
              />
            </div>
          ))}
        </div>
      );

    case 'videos':
      return (
        <div className="space-y-4">
          {section.content.map((video: string, index: number) => (
            <div key={index} className="text-center">
              <video 
                controls 
                className="max-w-full h-auto rounded-lg"
                aria-label={`Video cultural ${index + 1}`}
              >
                <source src={video} type="video/mp4" />
                Tu navegador no soporta el elemento de video.
              </video>
            </div>
          ))}
        </div>
      );

    case 'interactive':
      return (
        <div className="p-4 border rounded-lg bg-muted">
          <h4 className="font-medium mb-2">Actividad Interactiva</h4>
          <p className="text-sm text-muted-foreground">
            Contenido interactivo disponible: {section.content.type}
          </p>
          <Button className="mt-2">
            Iniciar actividad
          </Button>
        </div>
      );

    default:
      return <div>Tipo de contenido no soportado</div>;
  }
};
