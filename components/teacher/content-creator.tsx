'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, 
  Target, 
  Video, 
  Code, 
  Globe, 
  Palette,
  Plus,
  Save,
  Eye,
  Download,
  Upload,
  Image,
  Music,
  FileText,
  Settings,
  Lightbulb,
  Heart,
  Zap,
  Brain,
  Users,
  Star,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Clock,
  Calendar,
  Filter,
  Search,
  Edit,
  Trash2,
  Copy,
  Share,
  Lock,
  Unlock,
  EyeOff,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  RotateCw,
  Type,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link,
  Smile,
  Camera,
  Mic,
  Play,
  Pause,
  SkipBack,
  SkipForward
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ContentCreatorProps {
  teacherId: string;
  className?: string;
}

interface ContentTemplate {
  id: string;
  name: string;
  type: 'lesson' | 'quiz' | 'video' | 'interactive' | 'cultural';
  description: string;
  icon: React.ReactNode;
  culturalAdaptation: boolean;
  accessibilityFeatures: string[];
  estimatedTime: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

interface CulturalContext {
  id: string;
  name: string;
  language: string;
  region: string;
  traditions: string[];
  examples: string[];
  relevance: number;
}

interface AccessibilityFeature {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  enabled: boolean;
  required: boolean;
}

export const ContentCreator: React.FC<ContentCreatorProps> = ({
  teacherId,
  className
}) => {
  const [activeTab, setActiveTab] = useState('templates');
  const [selectedTemplate, setSelectedTemplate] = useState<ContentTemplate | null>(null);
  const [selectedCulturalContext, setSelectedCulturalContext] = useState<CulturalContext | null>(null);
  const [accessibilityFeatures, setAccessibilityFeatures] = useState<AccessibilityFeature[]>([]);
  const [contentData, setContentData] = useState({
    title: '',
    description: '',
    subject: '',
    grade: '',
    objectives: '',
    content: '',
    questions: [],
    media: [],
    culturalElements: [],
    accessibilitySettings: {}
  });
  const [isCreating, setIsCreating] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'draft' | 'published' | null>(null);

  useEffect(() => {
    loadTemplates();
    loadCulturalContexts();
    loadAccessibilityFeatures();
  }, []);

  const loadTemplates = () => {
    // Simular carga de plantillas
    const templates: ContentTemplate[] = [
      {
        id: '1',
        name: 'Lección Interactiva',
        type: 'lesson' as const,
        description: 'Lección con elementos interactivos y multimedia',
        icon: <BookOpen className="w-6 h-6" />,
        culturalAdaptation: true,
        accessibilityFeatures: ['screen-reader', 'high-contrast', 'keyboard-navigation'],
        estimatedTime: 45,
        difficulty: 'intermediate'
      },
      {
        id: '2',
        name: 'Evaluación Adaptativa',
        type: 'quiz' as const,
        description: 'Evaluación que se adapta al nivel del estudiante',
        icon: <Target className="w-6 h-6" />,
        culturalAdaptation: true,
        accessibilityFeatures: ['screen-reader', 'voice-control', 'large-text'],
        estimatedTime: 30,
        difficulty: 'beginner'
      },
      {
        id: '3',
        name: 'Video Cultural',
        type: 'video' as const,
        description: 'Video con contenido cultural relevante',
        icon: <Video className="w-6 h-6" />,
        culturalAdaptation: true,
        accessibilityFeatures: ['captions', 'audio-description', 'transcript'],
        estimatedTime: 20,
        difficulty: 'beginner'
      },
      {
        id: '4',
        name: 'Actividad Interactiva',
        type: 'interactive' as const,
        description: 'Actividad interactiva con elementos culturales',
        icon: <Code className="w-6 h-6" />,
        culturalAdaptation: true,
        accessibilityFeatures: ['keyboard-navigation', 'screen-reader', 'high-contrast'],
        estimatedTime: 60,
        difficulty: 'advanced'
      },
      {
        id: '5',
        name: 'Contenido Cultural',
        type: 'cultural' as const,
        description: 'Contenido específico de una cultura',
        icon: <Globe className="w-6 h-6" />,
        culturalAdaptation: true,
        accessibilityFeatures: ['multilingual', 'cultural-context', 'localization'],
        estimatedTime: 40,
        difficulty: 'intermediate'
      },
      {
        id: '6',
        name: 'Contenido Personalizado',
        type: 'lesson' as const,
        description: 'Contenido completamente personalizable',
        icon: <Palette className="w-6 h-6" />,
        culturalAdaptation: true,
        accessibilityFeatures: ['all'],
        estimatedTime: 90,
        difficulty: 'advanced'
      }
    ];

    // Simular selección de plantilla
    setSelectedTemplate(templates[0]);
  };

  const loadCulturalContexts = () => {
    const contexts: CulturalContext[] = [
      {
        id: '1',
        name: 'Maya',
        language: 'Maya Yucateco',
        region: 'Yucatán, Campeche, Quintana Roo',
        traditions: ['Matemáticas mayas', 'Calendario maya', 'Arquitectura'],
        examples: ['Sistema numérico vigesimal', 'Cálculos astronómicos', 'Pirámides'],
        relevance: 0.95
      },
      {
        id: '2',
        name: 'Náhuatl',
        language: 'Náhuatl',
        region: 'Centro de México',
        traditions: ['Poesía náhuatl', 'Medicina tradicional', 'Agricultura'],
        examples: ['Poemas de Nezahualcóyotl', 'Herbolaria', 'Milpa'],
        relevance: 0.92
      },
      {
        id: '3',
        name: 'Zapoteco',
        language: 'Zapoteco',
        region: 'Oaxaca',
        traditions: ['Tejido', 'Cerámica', 'Música'],
        examples: ['Tejidos de lana', 'Barro negro', 'Danza de la pluma'],
        relevance: 0.88
      }
    ];

    setSelectedCulturalContext(contexts[0]);
  };

  const loadAccessibilityFeatures = () => {
    const features: AccessibilityFeature[] = [
      {
        id: 'screen-reader',
        name: 'Lector de Pantalla',
        description: 'Compatibilidad con lectores de pantalla',
        icon: <Volume2 className="w-4 h-4" />,
        enabled: true,
        required: true
      },
      {
        id: 'high-contrast',
        name: 'Alto Contraste',
        description: 'Modo de alto contraste para mejor visibilidad',
        icon: <Eye className="w-4 h-4" />,
        enabled: true,
        required: false
      },
      {
        id: 'keyboard-navigation',
        name: 'Navegación por Teclado',
        description: 'Navegación completa con teclado',
        icon: <Type className="w-4 h-4" />,
        enabled: true,
        required: true
      },
      {
        id: 'voice-control',
        name: 'Control por Voz',
        description: 'Control de la aplicación mediante comandos de voz',
        icon: <Mic className="w-4 h-4" />,
        enabled: false,
        required: false
      },
      {
        id: 'large-text',
        name: 'Texto Grande',
        description: 'Opciones de texto ampliado',
        icon: <Type className="w-4 h-4" />,
        enabled: true,
        required: false
      },
      {
        id: 'captions',
        name: 'Subtítulos',
        description: 'Subtítulos para contenido de video',
        icon: <FileText className="w-4 h-4" />,
        enabled: true,
        required: false
      }
    ];

    setAccessibilityFeatures(features);
  };

  const handleTemplateSelect = (template: ContentTemplate) => {
    setSelectedTemplate(template);
    setActiveTab('editor');
  };

  const handleSave = async (status: 'draft' | 'published') => {
    setIsCreating(true);
    try {
      // Simular guardado
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSaveStatus(status);
      console.log('Contenido guardado:', { ...contentData, status });
    } catch (error) {
      console.error('Error guardando contenido:', error);
    } finally {
      setIsCreating(false);
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

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Palette className="w-8 h-8 text-blue-600" />
            Creador de Contenido
          </h1>
          <p className="text-gray-600 mt-1">
            Crea contenido educativo inclusivo y culturalmente relevante
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setPreviewMode(!previewMode)}>
            {previewMode ? <Edit className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
            {previewMode ? 'Editar' : 'Vista Previa'}
          </Button>
          <Button 
            onClick={() => handleSave('draft')}
            disabled={isCreating}
            variant="outline"
          >
            <Save className="w-4 h-4 mr-2" />
            Guardar Borrador
          </Button>
          <Button 
            onClick={() => handleSave('published')}
            disabled={isCreating}
          >
            <ArrowRight className="w-4 h-4 mr-2" />
            Publicar
          </Button>
        </div>
      </div>

      {/* Pestañas principales */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Plantillas
          </TabsTrigger>
          <TabsTrigger value="editor" className="flex items-center gap-2">
            <Edit className="w-4 h-4" />
            Editor
          </TabsTrigger>
          <TabsTrigger value="cultural" className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Cultural
          </TabsTrigger>
          <TabsTrigger value="accessibility" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Accesibilidad
          </TabsTrigger>
        </TabsList>

        {/* Pestaña de Plantillas */}
        <TabsContent value="templates" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                id: '1',
                name: 'Lección Interactiva',
                type: 'lesson' as const,
                description: 'Lección con elementos interactivos y multimedia',
                icon: <BookOpen className="w-6 h-6" />,
                culturalAdaptation: true,
                accessibilityFeatures: ['screen-reader', 'high-contrast', 'keyboard-navigation'],
                estimatedTime: 45,
                difficulty: 'intermediate' as const
              },
              {
                id: '2',
                name: 'Evaluación Adaptativa',
                type: 'quiz' as const,
                description: 'Evaluación que se adapta al nivel del estudiante',
                icon: <Target className="w-6 h-6" />,
                culturalAdaptation: true,
                accessibilityFeatures: ['screen-reader', 'voice-control', 'large-text'],
                estimatedTime: 30,
                difficulty: 'beginner' as const
              },
              {
                id: '3',
                name: 'Video Cultural',
                type: 'video' as const,
                description: 'Video con contenido cultural relevante',
                icon: <Video className="w-6 h-6" />,
                culturalAdaptation: true,
                accessibilityFeatures: ['captions', 'audio-description', 'transcript'],
                estimatedTime: 20,
                difficulty: 'beginner' as const
              },
              {
                id: '4',
                name: 'Actividad Interactiva',
                type: 'interactive' as const,
                description: 'Actividad interactiva con elementos culturales',
                icon: <Code className="w-6 h-6" />,
                culturalAdaptation: true,
                accessibilityFeatures: ['keyboard-navigation', 'screen-reader', 'high-contrast'],
                estimatedTime: 60,
                difficulty: 'advanced' as const
              },
              {
                id: '5',
                name: 'Contenido Cultural',
                type: 'cultural' as const,
                description: 'Contenido específico de una cultura',
                icon: <Globe className="w-6 h-6" />,
                culturalAdaptation: true,
                accessibilityFeatures: ['multilingual', 'cultural-context', 'localization'],
                estimatedTime: 40,
                difficulty: 'intermediate' as const
              },
              {
                id: '6',
                name: 'Contenido Personalizado',
                type: 'lesson' as const,
                description: 'Contenido completamente personalizable',
                icon: <Palette className="w-6 h-6" />,
                culturalAdaptation: true,
                accessibilityFeatures: ['all'],
                estimatedTime: 90,
                difficulty: 'advanced' as const
              }
            ].map((template) => (
              <Card 
                key={template.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleTemplateSelect(template)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      {template.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{template.name}</h3>
                      <Badge className={getDifficultyColor(template.difficulty)}>
                        {template.difficulty}
                      </Badge>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-4">{template.description}</p>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span>Tiempo estimado:</span>
                      <span className="font-medium">{template.estimatedTime} min</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-orange-500" />
                      <span className="text-sm">Adaptación cultural</span>
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    </div>

                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-blue-500" />
                      <span className="text-sm">Accesibilidad</span>
                      <Badge variant="outline" className="text-xs">
                        {template.accessibilityFeatures.length} características
                      </Badge>
                    </div>
                  </div>

                  <Button className="w-full mt-4">
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Usar Plantilla
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Pestaña del Editor */}
        <TabsContent value="editor" className="space-y-6">
          {selectedTemplate ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Editor principal */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {selectedTemplate.icon}
                      {selectedTemplate.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Título del Contenido</label>
                      <input
                        type="text"
                        value={contentData.title}
                        onChange={(e) => setContentData({...contentData, title: e.target.value})}
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Ingresa el título del contenido..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Descripción</label>
                      <textarea
                        value={contentData.description}
                        onChange={(e) => setContentData({...contentData, description: e.target.value})}
                        rows={3}
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Describe el contenido..."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Materia</label>
                        <select
                          value={contentData.subject}
                          onChange={(e) => setContentData({...contentData, subject: e.target.value})}
                          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Seleccionar materia</option>
                          <option value="mathematics">Matemáticas</option>
                          <option value="science">Ciencias</option>
                          <option value="history">Historia</option>
                          <option value="language">Lenguaje</option>
                          <option value="arts">Artes</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Grado</label>
                        <select
                          value={contentData.grade}
                          onChange={(e) => setContentData({...contentData, grade: e.target.value})}
                          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Seleccionar grado</option>
                          <option value="1st">1er grado</option>
                          <option value="2nd">2do grado</option>
                          <option value="3rd">3er grado</option>
                          <option value="4th">4to grado</option>
                          <option value="5th">5to grado</option>
                          <option value="6th">6to grado</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Objetivos de Aprendizaje</label>
                      <textarea
                        value={contentData.objectives}
                        onChange={(e) => setContentData({...contentData, objectives: e.target.value})}
                        rows={3}
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Define los objetivos de aprendizaje..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Contenido Principal</label>
                      <div className="border rounded-lg">
                        <div className="border-b p-2 flex items-center gap-2">
                          <Button size="sm" variant="outline">
                            <Bold className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Italic className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Underline className="w-4 h-4" />
                          </Button>
                          <div className="w-px h-6 bg-gray-300"></div>
                          <Button size="sm" variant="outline">
                            <List className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <ListOrdered className="w-4 h-4" />
                          </Button>
                          <div className="w-px h-6 bg-gray-300"></div>
                          <Button size="sm" variant="outline">
                            <Image className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Video className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Link className="w-4 h-4" />
                          </Button>
                        </div>
                        <textarea
                          value={contentData.content}
                          onChange={(e) => setContentData({...contentData, content: e.target.value})}
                          rows={10}
                          className="w-full p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                          placeholder="Escribe el contenido principal..."
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Panel lateral */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="w-5 h-5" />
                      Configuración
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Dificultad</label>
                      <Badge className={getDifficultyColor(selectedTemplate.difficulty)}>
                        {selectedTemplate.difficulty}
                      </Badge>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Tiempo Estimado</label>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span>{selectedTemplate.estimatedTime} minutos</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Características de Accesibilidad</label>
                      <div className="space-y-2">
                        {selectedTemplate.accessibilityFeatures.map((feature) => (
                          <div key={feature} className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-sm">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="w-5 h-5" />
                      Sugerencias
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-800">
                          Considera incluir ejemplos culturales relevantes para mejorar la conexión con los estudiantes.
                        </p>
                      </div>
                      <div className="p-3 bg-green-50 rounded-lg">
                        <p className="text-sm text-green-800">
                          Asegúrate de que el contenido sea accesible para estudiantes con diferentes necesidades.
                        </p>
                      </div>
                      <div className="p-3 bg-purple-50 rounded-lg">
                        <p className="text-sm text-purple-800">
                          Incluye elementos interactivos para mantener el engagement de los estudiantes.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">Selecciona una plantilla</h3>
                <p className="text-gray-600">
                  Ve a la pestaña "Plantillas" para comenzar a crear contenido.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Pestaña Cultural */}
        <TabsContent value="cultural" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Contextos culturales */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Contextos Culturales
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      id: '1',
                      name: 'Maya',
                      language: 'Maya Yucateco',
                      region: 'Yucatán, Campeche, Quintana Roo',
                      traditions: ['Matemáticas mayas', 'Calendario maya', 'Arquitectura'],
                      examples: ['Sistema numérico vigesimal', 'Cálculos astronómicos', 'Pirámides'],
                      relevance: 0.95
                    },
                    {
                      id: '2',
                      name: 'Náhuatl',
                      language: 'Náhuatl',
                      region: 'Centro de México',
                      traditions: ['Poesía náhuatl', 'Medicina tradicional', 'Agricultura'],
                      examples: ['Poemas de Nezahualcóyotl', 'Herbolaria', 'Milpa'],
                      relevance: 0.92
                    },
                    {
                      id: '3',
                      name: 'Zapoteco',
                      language: 'Zapoteco',
                      region: 'Oaxaca',
                      traditions: ['Tejido', 'Cerámica', 'Música'],
                      examples: ['Tejidos de lana', 'Barro negro', 'Danza de la pluma'],
                      relevance: 0.88
                    }
                  ].map((context) => (
                    <div 
                      key={context.id}
                      className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => setSelectedCulturalContext(context)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{context.name}</h3>
                        <Badge className="bg-orange-100 text-orange-800">
                          {Math.round(context.relevance * 100)}% relevante
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{context.language} - {context.region}</p>
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-gray-700">Tradiciones:</p>
                        <div className="flex flex-wrap gap-1">
                          {context.traditions.map((tradition, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tradition}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Elementos culturales seleccionados */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5" />
                  Elementos Culturales
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedCulturalContext ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-orange-50 rounded-lg">
                      <h4 className="font-medium text-orange-900 mb-2">
                        Contexto: {selectedCulturalContext.name}
                      </h4>
                      <p className="text-sm text-orange-800">
                        {selectedCulturalContext.language} - {selectedCulturalContext.region}
                      </p>
                    </div>

                    <div>
                      <h5 className="font-medium mb-2">Ejemplos Culturales</h5>
                      <div className="space-y-2">
                        {selectedCulturalContext.examples.map((example, index) => (
                          <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                            <Star className="w-4 h-4 text-yellow-500" />
                            <span className="text-sm">{example}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h5 className="font-medium mb-2">Tradiciones</h5>
                      <div className="space-y-2">
                        {selectedCulturalContext.traditions.map((tradition, index) => (
                          <div key={index} className="flex items-center gap-2 p-2 bg-blue-50 rounded">
                            <Globe className="w-4 h-4 text-blue-500" />
                            <span className="text-sm">{tradition}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Button className="w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      Agregar al Contenido
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Globe className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Selecciona un contexto cultural</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Pestaña de Accesibilidad */}
        <TabsContent value="accessibility" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Características de accesibilidad */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Características de Accesibilidad
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {accessibilityFeatures.map((feature) => (
                    <div key={feature.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          {feature.icon}
                        </div>
                        <div>
                          <h4 className="font-medium">{feature.name}</h4>
                          <p className="text-sm text-gray-600">{feature.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {feature.required && (
                          <Badge className="bg-red-100 text-red-800">Requerido</Badge>
                        )}
                        <Button
                          size="sm"
                          variant={feature.enabled ? "default" : "outline"}
                          onClick={() => {
                            setAccessibilityFeatures(prev => 
                              prev.map(f => 
                                f.id === feature.id 
                                  ? { ...f, enabled: !f.enabled }
                                  : f
                              )
                            );
                          }}
                        >
                          {feature.enabled ? 'Habilitado' : 'Deshabilitado'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Vista previa de accesibilidad */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Vista Previa de Accesibilidad
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium mb-2">Modo Alto Contraste</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4 mr-1" />
                          Activar
                        </Button>
                        <span className="text-sm text-gray-600">Mejora la visibilidad</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium mb-2">Lector de Pantalla</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">
                          <Volume2 className="w-4 h-4 mr-1" />
                          Activar
                        </Button>
                        <span className="text-sm text-gray-600">Narración de contenido</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium mb-2">Navegación por Teclado</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">
                          <Type className="w-4 h-4 mr-1" />
                          Activar
                        </Button>
                        <span className="text-sm text-gray-600">Navegación completa</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium mb-2">Control por Voz</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">
                          <Mic className="w-4 h-4 mr-1" />
                          Activar
                        </Button>
                        <span className="text-sm text-gray-600">Comandos de voz</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Estado de guardado */}
      {saveStatus && (
        <div className="fixed bottom-4 right-4 p-4 bg-green-100 border border-green-300 rounded-lg shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-green-800">
              Contenido {saveStatus === 'draft' ? 'guardado como borrador' : 'publicado'} exitosamente
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
