"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Navbar } from "@/components/ui/navbar"
import { Footer } from "@/components/ui/footer"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { useAuth } from "@/lib/hooks/useAuth"
import { 
  BookOpen, 
  Clock, 
  Target, 
  Award,
  CheckCircle,
  XCircle,
  Play,
  Pause,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  BarChart3,
  FileText,
  Brain,
  Lightbulb,
  Star,
  Timer,
  Eye,
  Volume2,
  VolumeX,
  Settings,
  Maximize2,
  Minimize2,
  Heart,
  Zap,
  Users,
  Calendar,
  Filter,
  Search,
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  ChevronRight,
  ChevronLeft,
  HelpCircle,
  Bookmark,
  Share2,
  Download,
  Upload,
  RefreshCw,
  Activity,
  TrendingUp,
  Award as AwardIcon,
  Target as TargetIcon,
  Clock as ClockIcon,
  BookOpen as BookOpenIcon,
  Brain as BrainIcon,
  Heart as HeartIcon,
  Zap as ZapIcon,
  Eye as EyeIcon,
  Volume2 as Volume2Icon,
  Settings as SettingsIcon
} from "lucide-react"

interface Lesson {
  id: string
  title: string
  description: string
  subject: string
  grade: string
  difficulty: "beginner" | "intermediate" | "advanced"
  estimatedTime: number
  sections: LessonSection[]
  culturalContext?: string
  accessibilityFeatures: string[]
  prerequisites: string[]
  learningObjectives: string[]
  tags: string[]
  rating: number
  studentsEnrolled: number
  isAdaptive: boolean
}

interface LessonSection {
  id: string
  title: string
  type: "video" | "text" | "interactive" | "quiz" | "exercise"
  content: any
  duration: number
  isCompleted: boolean
  isRequired: boolean
  culturalAdaptation?: string
  accessibilityNotes?: string
}

interface LessonProgress {
  lessonId: string
  currentSection: number
  totalSections: number
  timeSpent: number
  sectionsCompleted: number
  score: number
  isCompleted: boolean
  lastAccessed: Date
}

export default function LessonPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [progress, setProgress] = useState<LessonProgress | null>(null)
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const [timeSpent, setTimeSpent] = useState(0)
  const [showAccessibilityPanel, setShowAccessibilityPanel] = useState(false)
  const [accessibilitySettings, setAccessibilitySettings] = useState({
    screenReader: false,
    highContrast: false,
    largeText: false,
    voiceCommands: false,
    autoPlay: false,
    showSubtitles: true
  })

  // Datos simulados
  useEffect(() => {
    const loadLesson = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockLesson: Lesson = {
        id: params.id as string,
        title: "Fundamentos de Álgebra con Contexto Maya",
        description: "Aprende los conceptos básicos del álgebra explorando las matemáticas de la antigua civilización maya.",
        subject: "Matemáticas",
        grade: "3er Grado",
        difficulty: "intermediate",
        estimatedTime: 45,
        culturalContext: "maya",
        accessibilityFeatures: ["screen_reader", "voice_commands", "high_contrast", "large_text"],
        prerequisites: ["Operaciones básicas", "Números enteros"],
        learningObjectives: [
          "Resolver ecuaciones lineales simples",
          "Comprender el concepto de variables",
          "Aplicar álgebra en contextos culturales mayas"
        ],
        tags: ["Álgebra", "Ecuaciones", "Cultura Maya", "Matemáticas"],
        rating: 4.8,
        studentsEnrolled: 1240,
        isAdaptive: true,
        sections: [
          {
            id: "intro",
            title: "Introducción a las Matemáticas Mayas",
            type: "video",
            content: {
              videoUrl: "/videos/maya-math-intro.mp4",
              transcript: "Las matemáticas mayas fueron una de las más avanzadas del mundo antiguo...",
              duration: 300
            },
            duration: 5,
            isCompleted: false,
            isRequired: true,
            culturalAdaptation: "Contexto histórico maya",
            accessibilityNotes: "Incluye subtítulos y descripción de audio"
          },
          {
            id: "variables",
            title: "Concepto de Variables",
            type: "interactive",
            content: {
              interactiveType: "simulation",
              data: {
                scenarios: [
                  {
                    title: "Contando cacao",
                    description: "Si tienes x granos de cacao y agregas 5 más...",
                    question: "¿Cuántos granos tendrás en total?",
                    answer: "x + 5"
                  }
                ]
              }
            },
            duration: 10,
            isCompleted: false,
            isRequired: true,
            culturalAdaptation: "Usando cacao como ejemplo cultural"
          },
          {
            id: "equations",
            title: "Resolviendo Ecuaciones",
            type: "text",
            content: {
              text: "Una ecuación es como una balanza en equilibrio...",
              examples: [
                {
                  problem: "2x + 3 = 11",
                  solution: "x = 4",
                  explanation: "Restamos 3 de ambos lados, luego dividimos por 2"
                }
              ],
              culturalContext: "Los mayas usaban sistemas de pesos similares"
            },
            duration: 15,
            isCompleted: false,
            isRequired: true
          },
          {
            id: "practice",
            title: "Ejercicios Prácticos",
            type: "exercise",
            content: {
              exercises: [
                {
                  id: "ex1",
                  question: "Resuelve: 3x + 7 = 22",
                  options: ["x = 3", "x = 5", "x = 7", "x = 9"],
                  correctAnswer: "x = 5",
                  explanation: "Restamos 7 de ambos lados: 3x = 15, luego dividimos por 3: x = 5"
                }
              ]
            },
            duration: 10,
            isCompleted: false,
            isRequired: true
          },
          {
            id: "quiz",
            title: "Evaluación Final",
            type: "quiz",
            content: {
              questions: [
                {
                  id: "q1",
                  question: "¿Cuál es el valor de x en 4x - 8 = 12?",
                  options: ["x = 3", "x = 4", "x = 5", "x = 6"],
                  correctAnswer: "x = 5"
                }
              ]
            },
            duration: 5,
            isCompleted: false,
            isRequired: true
          }
        ]
      }
      
      setLesson(mockLesson)
      setProgress({
        lessonId: params.id as string,
        currentSection: 0,
        totalSections: mockLesson.sections.length,
        timeSpent: 0,
        sectionsCompleted: 0,
        score: 0,
        isCompleted: false,
        lastAccessed: new Date()
      })
      setIsLoading(false)
    }

    loadLesson()
  }, [params.id])

  const completeSection = (sectionId: string) => {
    if (!lesson || !progress) return

    const updatedSections = lesson.sections.map(section => 
      section.id === sectionId ? { ...section, isCompleted: true } : section
    )

    setLesson({ ...lesson, sections: updatedSections })
    
    const sectionsCompleted = updatedSections.filter(s => s.isCompleted).length
    setProgress({
      ...progress,
      sectionsCompleted,
      isCompleted: sectionsCompleted === lesson.sections.length
    })
  }

  const nextSection = () => {
    if (currentSectionIndex < (lesson?.sections.length || 0) - 1) {
      setCurrentSectionIndex(prev => prev + 1)
      setProgress(prev => prev ? { ...prev, currentSection: currentSectionIndex + 1 } : null)
    }
  }

  const previousSection = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(prev => prev - 1)
      setProgress(prev => prev ? { ...prev, currentSection: currentSectionIndex - 1 } : null)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return "bg-green-100 text-green-800"
      case "intermediate": return "bg-yellow-100 text-yellow-800"
      case "advanced": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getSectionTypeIcon = (type: string) => {
    switch (type) {
      case "video": return <Play className="h-4 w-4" />
      case "text": return <FileText className="h-4 w-4" />
      case "interactive": return <Brain className="h-4 w-4" />
      case "quiz": return <Target className="h-4 w-4" />
      case "exercise": return <Zap className="h-4 w-4" />
      default: return <BookOpen className="h-4 w-4" />
    }
  }

  const renderSectionContent = (section: LessonSection) => {
    switch (section.type) {
      case "video":
        return (
          <div className="space-y-4">
            <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Play className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <p className="text-gray-500">Video: {section.title}</p>
                <p className="text-sm text-gray-400">{section.duration} minutos</p>
              </div>
            </div>
            {section.content.transcript && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Transcripción:</h4>
                <p className="text-sm text-gray-600">{section.content.transcript}</p>
              </div>
            )}
          </div>
        )

      case "interactive":
        return (
          <div className="space-y-4">
            <div className="p-6 bg-blue-50 rounded-lg">
              <h4 className="font-medium mb-4">Simulación Interactiva</h4>
              {section.content.data.scenarios.map((scenario: any, index: number) => (
                <div key={index} className="mb-4 p-4 bg-white rounded-lg border">
                  <h5 className="font-medium mb-2">{scenario.title}</h5>
                  <p className="text-sm text-gray-600 mb-2">{scenario.description}</p>
                  <p className="font-medium">{scenario.question}</p>
                  <div className="mt-3">
                    <input
                      type="text"
                      placeholder="Tu respuesta..."
                      className="w-full p-2 border border-gray-300 rounded"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )

      case "text":
        return (
          <div className="space-y-4">
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed">{section.content.text}</p>
            </div>
            {section.content.examples && (
              <div className="space-y-3">
                <h4 className="font-medium">Ejemplos:</h4>
                {section.content.examples.map((example: any, index: number) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg">
                    <p className="font-medium">Problema: {example.problem}</p>
                    <p className="text-green-600">Solución: {example.solution}</p>
                    <p className="text-sm text-gray-600 mt-1">{example.explanation}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )

      case "exercise":
        return (
          <div className="space-y-4">
            {section.content.exercises.map((exercise: any, index: number) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg">
                <h4 className="font-medium mb-3">Ejercicio {index + 1}</h4>
                <p className="mb-3">{exercise.question}</p>
                <div className="space-y-2">
                  {exercise.options.map((option: string, optIndex: number) => (
                    <label key={optIndex} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                      <input
                        type="radio"
                        name={`exercise-${exercise.id}`}
                        value={option}
                        className="h-4 w-4 text-blue-600"
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )

      case "quiz":
        return (
          <div className="space-y-4">
            {section.content.questions.map((question: any, index: number) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg">
                <h4 className="font-medium mb-3">Pregunta {index + 1}</h4>
                <p className="mb-3">{question.question}</p>
                <div className="space-y-2">
                  {question.options.map((option: string, optIndex: number) => (
                    <label key={optIndex} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                      <input
                        type="radio"
                        name={`quiz-${question.id}`}
                        value={option}
                        className="h-4 w-4 text-blue-600"
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )

      default:
        return <div>Contenido no disponible</div>
    }
  }

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          <Navbar />
          <div className="pt-24 pb-8">
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (!lesson) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          <Navbar />
          <div className="pt-24 pb-8">
            <div className="container mx-auto px-4">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Lección no encontrada
                </h1>
                <Button onClick={() => router.push("/lessons")}>
                  Volver a Lecciones
                </Button>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  const currentSection = lesson.sections[currentSectionIndex]
  const progressPercentage = progress ? (progress.sectionsCompleted / progress.totalSections) * 100 : 0

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Navbar />
        
        <div className="pt-24 pb-8">
          <div className="container mx-auto px-4 max-w-6xl">
            {/* Header de la lección */}
            <div className="mb-8">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {lesson.title}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {lesson.description}
                  </p>
                  <div className="flex items-center space-x-4">
                    <Badge className={getDifficultyColor(lesson.difficulty)}>
                      {lesson.difficulty === "beginner" ? "Principiante" :
                       lesson.difficulty === "intermediate" ? "Intermedio" : "Avanzado"}
                    </Badge>
                    <Badge variant="outline">{lesson.subject}</Badge>
                    <Badge variant="outline">{lesson.grade}</Badge>
                    {lesson.culturalContext && (
                      <Badge variant="outline" className="text-yellow-700 border-yellow-200">
                        <Heart className="mr-1 h-3 w-3" />
                        {lesson.culturalContext}
                      </Badge>
                    )}
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowAccessibilityPanel(!showAccessibilityPanel)}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Accesibilidad
                </Button>
              </div>

              {/* Barra de progreso */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">
                    Progreso: {progress?.sectionsCompleted || 0} de {progress?.totalSections || 0} secciones
                  </span>
                  <span className="text-sm text-gray-600">
                    {Math.round(progressPercentage)}% completado
                  </span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Panel lateral */}
              <div className="lg:col-span-1">
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl sticky top-24">
                  <CardHeader>
                    <CardTitle className="text-lg">Contenido de la Lección</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {lesson.sections.map((section, index) => (
                        <button
                          key={section.id}
                          onClick={() => setCurrentSectionIndex(index)}
                          className={`w-full text-left p-3 rounded-lg transition-colors ${
                            index === currentSectionIndex
                              ? "bg-blue-100 text-blue-800 border border-blue-200"
                              : "hover:bg-gray-50"
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 text-xs">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">{section.title}</p>
                              <div className="flex items-center space-x-2 mt-1">
                                {getSectionTypeIcon(section.type)}
                                <span className="text-xs text-gray-500">{section.duration} min</span>
                                {section.isCompleted && (
                                  <CheckCircle className="h-3 w-3 text-green-600" />
                                )}
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Panel de accesibilidad */}
                {showAccessibilityPanel && (
                  <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl mt-4">
                    <CardHeader>
                      <CardTitle className="text-lg">Herramientas de Accesibilidad</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full justify-start"
                          onClick={() => setAccessibilitySettings(prev => ({ ...prev, screenReader: !prev.screenReader }))}
                        >
                          <Volume2 className="mr-2 h-4 w-4" />
                          Lector de Pantalla
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full justify-start"
                          onClick={() => setAccessibilitySettings(prev => ({ ...prev, highContrast: !prev.highContrast }))}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Alto Contraste
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full justify-start"
                          onClick={() => setAccessibilitySettings(prev => ({ ...prev, largeText: !prev.largeText }))}
                        >
                          <Maximize2 className="mr-2 h-4 w-4" />
                          Texto Grande
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full justify-start"
                          onClick={() => setAccessibilitySettings(prev => ({ ...prev, voiceCommands: !prev.voiceCommands }))}
                        >
                          <Zap className="mr-2 h-4 w-4" />
                          Comandos de Voz
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Contenido principal */}
              <div className="lg:col-span-3">
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl">
                          {currentSection.title}
                        </CardTitle>
                        <CardDescription>
                          Sección {currentSectionIndex + 1} de {lesson.sections.length}
                        </CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getSectionTypeIcon(currentSection.type)}
                        <span className="text-sm text-gray-500">{currentSection.duration} min</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Contenido de la sección */}
                    <div className="min-h-[400px]">
                      {renderSectionContent(currentSection)}
                    </div>

                    {/* Contexto cultural si aplica */}
                    {currentSection.culturalAdaptation && (
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <Heart className="h-4 w-4 text-yellow-600" />
                          <span className="font-medium">Contexto Cultural</span>
                        </div>
                        <p className="text-sm text-yellow-800">{currentSection.culturalAdaptation}</p>
                      </div>
                    )}

                    {/* Notas de accesibilidad si aplica */}
                    {currentSection.accessibilityNotes && (
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <Eye className="h-4 w-4 text-blue-600" />
                          <span className="font-medium">Accesibilidad</span>
                        </div>
                        <p className="text-sm text-blue-800">{currentSection.accessibilityNotes}</p>
                      </div>
                    )}

                    {/* Navegación */}
                    <div className="flex items-center justify-between pt-6 border-t">
                      <Button
                        variant="outline"
                        onClick={previousSection}
                        disabled={currentSectionIndex === 0}
                      >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Anterior
                      </Button>

                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          onClick={() => completeSection(currentSection.id)}
                          disabled={currentSection.isCompleted}
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          {currentSection.isCompleted ? "Completada" : "Marcar como Completada"}
                        </Button>

                        {currentSectionIndex < lesson.sections.length - 1 ? (
                          <Button onClick={nextSection}>
                            Siguiente
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        ) : (
                          <Button className="bg-green-600 hover:bg-green-700">
                            <Award className="mr-2 h-4 w-4" />
                            Completar Lección
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </ProtectedRoute>
  )
}
