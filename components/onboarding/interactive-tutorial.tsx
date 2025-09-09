'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Eye,
  Ear,
  Hand,
  Brain,
  Heart,
  Zap,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Home,
  BookOpen,
  Target,
  Users,
  Settings,
  HelpCircle,
  Star,
  Award,
  Sparkles,
  Globe,
  Monitor,
  Smartphone,
  Tablet,
  MousePointer,
  Keyboard,
  Mic,
  RotateCcw,
  RotateCw,
  Maximize,
  Minimize,
  Sun,
  Moon,
  Contrast,
  Accessibility,
  Shield,
  Clock,
  Calendar,
  MessageSquare,
  Bell,
  Search,
  Filter,
  Download,
  Upload,
  Share2,
  Bookmark,
  Heart as HeartIcon,
  ThumbsUp,
  ThumbsDown,
  Flag,
  Info,
  ExternalLink,
  Lock,
  Unlock,
  EyeOff,
  Eye as EyeIcon,
  Volume1,
  Volume2 as Volume2Icon,
  VolumeX as VolumeXIcon,
  MicOff,
  Mic as MicIcon,
  Wifi,
  WifiOff,
  Battery,
  BatteryCharging,
  Signal,
  SignalHigh,
  SignalLow,
  SignalZero
} from 'lucide-react';
import { useScreenReader } from '@/components/accessibility/screen-reader';
import { useHighContrast } from '@/components/accessibility/high-contrast';
import { useVoiceControl } from '@/components/accessibility/voice-control';

interface InteractiveTutorialProps {
  onComplete: () => void;
  userConfig: any;
  detectedNeeds: any;
  className?: string;
}

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  category: 'navigation' | 'features' | 'accessibility' | 'cultural' | 'advanced';
  difficulty: 'basic' | 'intermediate' | 'advanced';
  duration: number;
  interactive: boolean;
  required: boolean;
  content: React.ReactNode;
  tips: string[];
  shortcuts: string[];
  accessibilityNotes: string[];
}

interface TutorialProgress {
  completedSteps: Set<string>;
  currentStep: string;
  timeSpent: number;
  interactions: number;
  errors: number;
  helpRequests: number;
}

export const InteractiveTutorial: React.FC<InteractiveTutorialProps> = ({
  onComplete,
  userConfig,
  detectedNeeds,
  className
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState<TutorialProgress>({
    completedSteps: new Set(),
    currentStep: '',
    timeSpent: 0,
    interactions: 0,
    errors: 0,
    helpRequests: 0
  });
  const [showHelp, setShowHelp] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [tutorialSpeed, setTutorialSpeed] = useState<'slow' | 'normal' | 'fast'>('normal');

  const { speak, isEnabled: screenReaderEnabled } = useScreenReader();
  const { getStyles } = useHighContrast();
  const { isSupported } = useVoiceControl();

  const tutorialSteps: TutorialStep[] = [
    {
      id: 'welcome',
      title: 'Bienvenida a LLuminata',
      description: 'Conoce la plataforma y sus características principales',
      category: 'navigation',
      difficulty: 'basic',
      duration: 120,
      interactive: false,
      required: true,
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-32 h-32 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Sparkles className="h-16 w-16 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-4">¡Bienvenido a tu experiencia personalizada!</h3>
            <p className="text-lg text-gray-600 mb-6">
              Hemos configurado la plataforma especialmente para ti, considerando tus necesidades 
              y preferencias de aprendizaje.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-blue-50 rounded-lg text-center">
              <Brain className="h-12 w-12 text-blue-600 mx-auto mb-3" />
              <h4 className="font-semibold text-blue-900 mb-2">IA Inteligente</h4>
              <p className="text-sm text-blue-700">
                Contenido adaptativo que se ajusta a tu ritmo de aprendizaje
              </p>
            </div>
            <div className="p-6 bg-green-50 rounded-lg text-center">
              <Accessibility className="h-12 w-12 text-green-600 mx-auto mb-3" />
              <h4 className="font-semibold text-green-900 mb-2">Accesibilidad Total</h4>
              <p className="text-sm text-green-700">
                Herramientas adaptadas a tus necesidades específicas
              </p>
            </div>
            <div className="p-6 bg-purple-50 rounded-lg text-center">
              <Globe className="h-12 w-12 text-purple-600 mx-auto mb-3" />
              <h4 className="font-semibold text-purple-900 mb-2">Cultura Inclusiva</h4>
              <p className="text-sm text-purple-700">
                Contenido relevante para tu contexto cultural
              </p>
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-900 mb-1">Tu Configuración Personalizada</h4>
                <ul className="text-sm text-yellow-800 space-y-1">
                  <li>• Estilo de aprendizaje: {detectedNeeds?.learningStyle || 'Mixto'}</li>
                  <li>• Nivel de accesibilidad: {detectedNeeds?.accessibilityLevel || 'Básico'}</li>
                  <li>• Adaptaciones culturales: {detectedNeeds?.culturalAdaptations?.length || 0} activas</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      ),
      tips: [
        'Puedes pausar el tutorial en cualquier momento',
        'Usa los atajos de teclado para navegar más rápido',
        'Solicita ayuda cuando la necesites'
      ],
      shortcuts: ['Espacio: Pausar/Reproducir', 'Flecha derecha: Siguiente', 'Flecha izquierda: Anterior'],
      accessibilityNotes: [
        'El tutorial es compatible con lectores de pantalla',
        'Puedes usar comandos de voz para navegar',
        'Los subtítulos están disponibles en todos los videos'
      ]
    },
    {
      id: 'navigation',
      title: 'Navegación Principal',
      description: 'Aprende a navegar por las secciones principales',
      category: 'navigation',
      difficulty: 'basic',
      duration: 180,
      interactive: true,
      required: true,
      content: (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold mb-2">Navegación por la Plataforma</h3>
            <p className="text-gray-600">
              Conoce las secciones principales y cómo acceder a ellas
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-2 border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-900">
                  <Home className="h-5 w-5" />
                  Dashboard Principal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-blue-800 mb-3">
                  Tu centro de control personal. Aquí verás tu progreso, lecciones recomendadas 
                  y métricas de aprendizaje.
                </p>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">Acceso rápido</Badge>
                  <Badge variant="outline" className="text-xs">Progreso visual</Badge>
                  <Badge variant="outline" className="text-xs">Recomendaciones</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-900">
                  <BookOpen className="h-5 w-5" />
                  Biblioteca de Contenido
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-green-800 mb-3">
                  Accede a lecciones, ejercicios y recursos educativos adaptados a tu nivel 
                  y contexto cultural.
                </p>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">Filtros inteligentes</Badge>
                  <Badge variant="outline" className="text-xs">Búsqueda avanzada</Badge>
                  <Badge variant="outline" className="text-xs">Favoritos</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-purple-200 bg-purple-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-900">
                  <Target className="h-5 w-5" />
                  Evaluaciones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-purple-800 mb-3">
                  Realiza evaluaciones adaptativas que se ajustan a tu progreso y 
                  detectan áreas de mejora.
                </p>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">Adaptativo</Badge>
                  <Badge variant="outline" className="text-xs">Retroalimentación</Badge>
                  <Badge variant="outline" className="text-xs">Progreso</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-900">
                  <Users className="h-5 w-5" />
                  Comunidad
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-orange-800 mb-3">
                  Conecta con otros estudiantes, comparte experiencias y participa 
                  en grupos de estudio.
                </p>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">Foros</Badge>
                  <Badge variant="outline" className="text-xs">Grupos</Badge>
                  <Badge variant="outline" className="text-xs">Mentores</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">💡 Consejo de Navegación</h4>
            <p className="text-sm text-blue-800">
              Usa la barra de navegación superior para acceder rápidamente a cualquier sección. 
              El menú se adapta según tus preferencias y necesidades.
            </p>
          </div>
        </div>
      ),
      tips: [
        'La navegación se adapta a tu dispositivo',
        'Puedes personalizar el orden de las secciones',
        'Usa la búsqueda para encontrar contenido específico'
      ],
      shortcuts: ['Ctrl + H: Ir al Dashboard', 'Ctrl + L: Biblioteca', 'Ctrl + E: Evaluaciones'],
      accessibilityNotes: [
        'Navegación completa por teclado disponible',
        'Indicadores de foco visibles',
        'Etiquetas ARIA para lectores de pantalla'
      ]
    },
    {
      id: 'accessibility-features',
      title: 'Características de Accesibilidad',
      description: 'Aprende a usar las herramientas de accesibilidad',
      category: 'accessibility',
      difficulty: 'intermediate',
      duration: 240,
      interactive: true,
      required: false,
      content: (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold mb-2">Herramientas de Accesibilidad</h3>
            <p className="text-gray-600">
              Descubre cómo usar las características adaptadas a tus necesidades
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Ajustes Visuales
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Tamaño de texto</span>
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline">A-</Button>
                      <Button size="sm" variant="outline">A</Button>
                      <Button size="sm" variant="outline">A+</Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Alto contraste</span>
                    <Button size="sm" variant="outline">
                      <Contrast className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Reducir movimiento</span>
                    <Button size="sm" variant="outline">
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ear className="h-5 w-5" />
                  Herramientas Auditivas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Lector de pantalla</span>
                    <Button size="sm" variant="outline">
                      <Volume2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Subtítulos</span>
                    <Button size="sm" variant="outline">
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Control por voz</span>
                    <Button size="sm" variant="outline">
                      <Mic className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Hand className="h-5 w-5" />
                  Navegación Alternativa
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Navegación por teclado</span>
                    <Badge variant="outline">Activada</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Objetivos táctiles</span>
                    <Badge variant="outline">Grandes</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Asistencia de clic</span>
                    <Button size="sm" variant="outline">
                      <MousePointer className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Ayuda Cognitiva
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Interfaz simplificada</span>
                    <Button size="sm" variant="outline">
                      <Minimize className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Recordatorios</span>
                    <Button size="sm" variant="outline">
                      <Bell className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Ayuda contextual</span>
                    <Button size="sm" variant="outline">
                      <HelpCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">🔧 Panel de Accesibilidad Rápida</h4>
            <p className="text-sm text-green-800">
              Accede al panel de accesibilidad desde cualquier página usando el botón 
              <Accessibility className="h-4 w-4 inline mx-1" /> en la esquina superior derecha.
            </p>
          </div>
        </div>
      ),
      tips: [
        'Las configuraciones se guardan automáticamente',
        'Puedes crear perfiles de accesibilidad para diferentes situaciones',
        'Las herramientas se adaptan según tu dispositivo'
      ],
      shortcuts: ['Alt + A: Panel de accesibilidad', 'Alt + V: Ajustes visuales', 'Alt + S: Lector de pantalla'],
      accessibilityNotes: [
        'Todas las herramientas son compatibles con lectores de pantalla',
        'Los controles tienen etiquetas descriptivas',
        'Se mantiene el foco visible en todo momento'
      ]
    },
    {
      id: 'cultural-content',
      title: 'Contenido Cultural',
      description: 'Explora el contenido adaptado a tu cultura',
      category: 'cultural',
      difficulty: 'basic',
      duration: 180,
      interactive: true,
      required: false,
      content: (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold mb-2">Contenido Cultural Relevante</h3>
            <p className="text-gray-600">
              Descubre cómo el contenido se adapta a tu contexto cultural
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-2 border-purple-200 bg-purple-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-900">
                  <Globe className="h-5 w-5" />
                  Adaptaciones Culturales
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Idioma principal</span>
                    <Badge variant="outline">{userConfig?.cultural?.language || 'Español'}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Contexto cultural</span>
                    <Badge variant="outline">{userConfig?.cultural?.culturalContext || 'Universal'}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Ejemplos locales</span>
                    <Badge variant="outline">Activados</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Ejemplos de Contenido
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-1">Matemáticas Mayas</h4>
                    <p className="text-sm text-blue-800">
                      Sistema numérico vigesimal con ejemplos de la vida cotidiana maya
                    </p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-900 mb-1">Historia Local</h4>
                    <p className="text-sm text-green-800">
                      Eventos históricos relevantes para tu región y cultura
                    </p>
                  </div>
                  <div className="p-3 bg-orange-50 rounded-lg">
                    <h4 className="font-medium text-orange-900 mb-1">Artes Tradicionales</h4>
                    <p className="text-sm text-orange-800">
                      Expresiones artísticas y culturales de tu comunidad
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="font-medium text-purple-900 mb-2">🌍 Contenido Personalizado</h4>
            <p className="text-sm text-purple-800">
              El contenido se adapta automáticamente según tu contexto cultural. 
              Puedes ajustar estas preferencias en cualquier momento desde tu perfil.
            </p>
          </div>
        </div>
      ),
      tips: [
        'El contenido se actualiza según tu ubicación',
        'Puedes sugerir nuevos ejemplos culturales',
        'Los maestros pueden crear contenido específico para tu comunidad'
      ],
      shortcuts: ['Ctrl + C: Configuración cultural', 'Ctrl + F: Filtros culturales'],
      accessibilityNotes: [
        'El contenido cultural incluye descripciones de audio',
        'Los ejemplos visuales tienen alternativas textuales',
        'Se respetan las tradiciones y tabúes culturales'
      ]
    },
    {
      id: 'advanced-features',
      title: 'Características Avanzadas',
      description: 'Descubre funcionalidades avanzadas de la plataforma',
      category: 'advanced',
      difficulty: 'advanced',
      duration: 300,
      interactive: true,
      required: false,
      content: (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold mb-2">Funcionalidades Avanzadas</h3>
            <p className="text-gray-600">
              Explora características que mejoran tu experiencia de aprendizaje
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Modo Offline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Estado</span>
                    <Badge variant="outline" className="bg-green-100 text-green-800">
                      <Wifi className="h-3 w-3 mr-1" />
                      Conectado
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Contenido descargado</span>
                    <Badge variant="outline">2.3 GB</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Sincronización</span>
                    <Button size="sm" variant="outline">
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  IA Personalizada
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Tutor virtual</span>
                    <Button size="sm" variant="outline">
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Recomendaciones</span>
                    <Badge variant="outline">Inteligentes</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Análisis de progreso</span>
                    <Button size="sm" variant="outline">
                      <Target className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Colaboración
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Grupos de estudio</span>
                    <Button size="sm" variant="outline">
                      <Users className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Compartir progreso</span>
                    <Button size="sm" variant="outline">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Mentores</span>
                    <Badge variant="outline">Disponibles</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Gamificación
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Puntos</span>
                    <Badge variant="outline">1,250 pts</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Logros</span>
                    <Badge variant="outline">15/50</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Nivel</span>
                    <Badge variant="outline">Nivel 8</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">🚀 Características Premium</h4>
            <p className="text-sm text-blue-800">
              Algunas características avanzadas pueden requerir una suscripción premium. 
              Consulta tu plan actual en la sección de configuración.
            </p>
          </div>
        </div>
      ),
      tips: [
        'Las características se desbloquean según tu progreso',
        'Puedes personalizar qué características usar',
        'Algunas funciones requieren permisos adicionales'
      ],
      shortcuts: ['Ctrl + O: Modo offline', 'Ctrl + I: Tutor IA', 'Ctrl + G: Gamificación'],
      accessibilityNotes: [
        'Todas las características avanzadas son accesibles',
        'Los controles tienen descripciones detalladas',
        'Se mantiene la compatibilidad con herramientas de asistencia'
      ]
    },
    {
      id: 'completion',
      title: '¡Tutorial Completado!',
      description: 'Has terminado el tutorial interactivo',
      category: 'navigation',
      difficulty: 'basic',
      duration: 60,
      interactive: false,
      required: true,
      content: (
        <div className="text-center space-y-6">
          <div className="w-32 h-32 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Award className="h-16 w-16 text-white" />
          </div>
          
          <h3 className="text-3xl font-bold text-gray-900">
            ¡Felicidades!
          </h3>
          
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Has completado el tutorial interactivo y estás listo para comenzar 
            tu experiencia de aprendizaje personalizada.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="p-4 bg-green-50 rounded-lg">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h4 className="font-semibold text-green-900">Tutorial Completado</h4>
              <p className="text-sm text-green-700">Has aprendido las funciones básicas</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <Star className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h4 className="font-semibold text-blue-900">Configuración Lista</h4>
              <p className="text-sm text-blue-700">Tu experiencia está personalizada</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <Sparkles className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <h4 className="font-semibold text-purple-900">¡Listo para Aprender!</h4>
              <p className="text-sm text-purple-700">Comienza tu viaje educativo</p>
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg max-w-2xl mx-auto">
            <h4 className="font-medium text-yellow-900 mb-2">📚 Próximos Pasos</h4>
            <ul className="text-sm text-yellow-800 space-y-1 text-left">
              <li>• Explora tu dashboard personalizado</li>
              <li>• Completa tu primera lección recomendada</li>
              <li>• Configura tus objetivos de aprendizaje</li>
              <li>• Únete a grupos de estudio si lo deseas</li>
            </ul>
          </div>
        </div>
      ),
      tips: [
        'Puedes volver al tutorial en cualquier momento',
        'Consulta la ayuda contextual cuando tengas dudas',
        'Únete a la comunidad para obtener apoyo'
      ],
      shortcuts: ['F1: Ayuda', 'Ctrl + H: Dashboard', 'Ctrl + L: Biblioteca'],
      accessibilityNotes: [
        'El tutorial está disponible en cualquier momento',
        'Puedes acceder a la ayuda desde cualquier página',
        'Los recursos de soporte son completamente accesibles'
      ]
    }
  ];

  const currentStep = tutorialSteps[currentStepIndex];

  useEffect(() => {
    if (currentStep) {
      setProgress(prev => ({
        ...prev,
        currentStep: currentStep.id
      }));

      if (screenReaderEnabled) {
        speak(`Tutorial: ${currentStep.title}. ${currentStep.description}`);
      }
    }
  }, [currentStep, screenReaderEnabled, speak]);

  const handleNextStep = () => {
    if (currentStepIndex < tutorialSteps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleCompleteStep = () => {
    setProgress(prev => ({
      ...prev,
      completedSteps: new Set([...prev.completedSteps, currentStep.id])
    }));
  };

  const handleComplete = () => {
    onComplete();
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const skipToStep = (index: number) => {
    setCurrentStepIndex(index);
  };

  const getProgressPercentage = () => {
    return (progress.completedSteps.size / tutorialSteps.length) * 100;
  };

  const getStepStatus = (step: TutorialStep) => {
    if (progress.completedSteps.has(step.id)) {
      return 'completed';
    }
    if (step.id === currentStep.id) {
      return 'current';
    }
    return 'pending';
  };

  return (
    <div className={`max-w-6xl mx-auto ${className}`}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Sparkles className="h-8 w-8 text-blue-600" />
              Tutorial Interactivo
            </h1>
            <p className="text-gray-600 mt-1">
              Aprende a usar la plataforma paso a paso
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowHelp(!showHelp)}
            >
              <HelpCircle className="h-4 w-4 mr-2" />
              Ayuda
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowHints(!showHints)}
            >
              <Info className="h-4 w-4 mr-2" />
              Consejos
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={togglePlayPause}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Paso {currentStepIndex + 1} de {tutorialSteps.length}</span>
            <span>{Math.round(getProgressPercentage())}% completado</span>
          </div>
          <Progress value={getProgressPercentage()} className="h-2" />
        </div>

        {/* Step Navigation */}
        <div className="flex justify-between mt-2">
          {tutorialSteps.map((step, index) => {
            const status = getStepStatus(step);
            return (
              <button
                key={step.id}
                onClick={() => skipToStep(index)}
                className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
                  status === 'completed' 
                    ? 'text-green-600 bg-green-50' 
                    : status === 'current'
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  status === 'completed' 
                    ? 'bg-green-100 text-green-600' 
                    : status === 'current'
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-gray-100 text-gray-400'
                }`}>
                  {status === 'completed' ? <CheckCircle className="h-4 w-4" /> : index + 1}
                </div>
                <span className="text-xs mt-1 hidden md:block">{step.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Tutorial Content */}
        <div className="lg:col-span-3">
          <Card className="shadow-xl border-0">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {currentStep.category === 'navigation' && <Home className="h-5 w-5" />}
                    {currentStep.category === 'features' && <Zap className="h-5 w-5" />}
                    {currentStep.category === 'accessibility' && <Accessibility className="h-5 w-5" />}
                    {currentStep.category === 'cultural' && <Globe className="h-5 w-5" />}
                    {currentStep.category === 'advanced' && <Star className="h-5 w-5" />}
                    {currentStep.title}
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">{currentStep.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{currentStep.difficulty}</Badge>
                  <Badge variant="outline">{currentStep.duration}s</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {currentStep.content}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between mt-6">
            <Button 
              variant="outline" 
              onClick={handlePreviousStep}
              disabled={currentStepIndex === 0}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Anterior
            </Button>
            
            <div className="flex items-center gap-2">
              {currentStep.interactive && (
                <Button 
                  variant="outline"
                  onClick={handleCompleteStep}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Completar Paso
                </Button>
              )}
              
              {currentStepIndex === tutorialSteps.length - 1 ? (
                <Button 
                  onClick={handleComplete}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Finalizar Tutorial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button 
                  onClick={handleNextStep}
                >
                  Siguiente
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          {/* Tips */}
          {showHints && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Info className="h-4 w-4" />
                  Consejos Útiles
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {currentStep.tips.map((tip, index) => (
                    <div key={index} className="text-sm text-gray-600">
                      • {tip}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Shortcuts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Keyboard className="h-4 w-4" />
                Atajos de Teclado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {currentStep.shortcuts.map((shortcut, index) => (
                  <div key={index} className="text-sm text-gray-600">
                    <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">{shortcut}</kbd>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Accessibility Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Accessibility className="h-4 w-4" />
                Notas de Accesibilidad
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {currentStep.accessibilityNotes.map((note, index) => (
                  <div key={index} className="text-sm text-gray-600">
                    • {note}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Progress Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Target className="h-4 w-4" />
                Progreso
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Pasos completados</span>
                  <span>{progress.completedSteps.size}/{tutorialSteps.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tiempo total</span>
                  <span>{Math.round(progress.timeSpent / 60)}m</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Interacciones</span>
                  <span>{progress.interactions}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
