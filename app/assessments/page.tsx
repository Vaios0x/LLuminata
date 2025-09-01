"use client"

import { useState, useEffect } from "react"
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
  AlertCircle,
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
  Download,
  Share2,
  Bookmark,
  Heart,
  Zap,
  TrendingUp,
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
  Volume2,
  VolumeX,
  Settings,
  Maximize2,
  Minimize2
} from "lucide-react"

interface Assessment {
  id: string
  title: string
  subject: string
  type: "quiz" | "exam" | "project" | "adaptive"
  difficulty: "beginner" | "intermediate" | "advanced"
  estimatedTime: number // en minutos
  totalQuestions: number
  questions: Question[]
  instructions: string
  dueDate?: string
  isAdaptive: boolean
  culturalContext?: string
  accessibilityFeatures: string[]
}

interface Question {
  id: string
  type: "multiple_choice" | "true_false" | "fill_blank" | "essay" | "matching"
  text: string
  options?: string[]
  correctAnswer: string | string[]
  explanation?: string
  difficulty: "easy" | "medium" | "hard"
  points: number
  culturalContext?: string
  accessibilityNote?: string
}

interface AssessmentProgress {
  currentQuestion: number
  totalQuestions: number
  timeSpent: number
  answers: Record<string, any>
  score: number
  isCompleted: boolean
}

export default function AssessmentsPage() {
  const { user } = useAuth()
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [currentAssessment, setCurrentAssessment] = useState<Assessment | null>(null)
  const [progress, setProgress] = useState<AssessmentProgress | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("available")
  const [showInstructions, setShowInstructions] = useState(false)
  const [isAssessmentActive, setIsAssessmentActive] = useState(false)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<Record<string, any>>({})
  const [timeRemaining, setTimeRemaining] = useState<number>(0)
  const [isPaused, setIsPaused] = useState(false)
  const [accessibilityEnabled, setAccessibilityEnabled] = useState({
    screenReader: false,
    highContrast: false,
    largeText: false,
    voiceCommands: false
  })

  // Datos simulados
  useEffect(() => {
    const loadAssessments = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockAssessments: Assessment[] = [
        {
          id: "1",
          title: "Evaluación de Álgebra Básica",
          subject: "Matemáticas",
          type: "adaptive",
          difficulty: "intermediate",
          estimatedTime: 30,
          totalQuestions: 15,
          instructions: "Esta evaluación se adaptará a tu nivel de conocimiento. Responde cada pregunta con cuidado y no te preocupes si algunas son difíciles.",
          isAdaptive: true,
          culturalContext: "maya",
          accessibilityFeatures: ["screen_reader", "voice_commands", "high_contrast"],
          questions: [
            {
              id: "q1",
              type: "multiple_choice",
              text: "¿Cuál es el valor de x en la ecuación 2x + 5 = 13?",
              options: ["3", "4", "5", "6"],
              correctAnswer: "4",
              explanation: "Para resolver: 2x + 5 = 13, restamos 5 de ambos lados: 2x = 8, luego dividimos por 2: x = 4",
              difficulty: "easy",
              points: 5
            },
            {
              id: "q2",
              type: "true_false",
              text: "En la cultura maya, el número cero fue inventado independientemente del sistema indo-arábigo.",
              correctAnswer: "true",
              explanation: "Los mayas desarrollaron el concepto del cero de forma independiente, usando un sistema vigesimal (base 20).",
              difficulty: "medium",
              points: 3,
              culturalContext: "maya"
            },
            {
              id: "q3",
              type: "fill_blank",
              text: "Completa la secuencia: 2, 4, 8, 16, ___",
              correctAnswer: "32",
              explanation: "Cada número se multiplica por 2 para obtener el siguiente.",
              difficulty: "medium",
              points: 4
            }
          ]
        },
        {
          id: "2",
          title: "Historia de México Prehispánico",
          subject: "Historia",
          type: "quiz",
          difficulty: "beginner",
          estimatedTime: 20,
          totalQuestions: 10,
          instructions: "Evalúa tu conocimiento sobre las civilizaciones prehispánicas de México.",
          isAdaptive: false,
          accessibilityFeatures: ["screen_reader", "large_text"],
          questions: [
            {
              id: "q1",
              type: "multiple_choice",
              text: "¿Cuál fue la capital del Imperio Azteca?",
              options: ["Teotihuacán", "Tenochtitlán", "Chichén Itzá", "Palenque"],
              correctAnswer: "Tenochtitlán",
              explanation: "Tenochtitlán fue la capital del Imperio Azteca, fundada en 1325.",
              difficulty: "easy",
              points: 5
            }
          ]
        }
      ]
      
      setAssessments(mockAssessments)
      setIsLoading(false)
    }

    loadAssessments()
  }, [])

  const startAssessment = (assessment: Assessment) => {
    setCurrentAssessment(assessment)
    setProgress({
      currentQuestion: 0,
      totalQuestions: assessment.questions.length,
      timeSpent: 0,
      answers: {},
      score: 0,
      isCompleted: false
    })
    setTimeRemaining(assessment.estimatedTime * 60)
    setShowInstructions(true)
  }

  const beginAssessment = () => {
    setShowInstructions(false)
    setIsAssessmentActive(true)
    setCurrentQuestionIndex(0)
  }

  const handleAnswer = (questionId: string, answer: any) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }))
  }

  const nextQuestion = () => {
    if (currentQuestionIndex < (currentAssessment?.questions.length || 0) - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    }
  }

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
    }
  }

  const submitAssessment = () => {
    // Calcular puntuación
    let totalScore = 0
    let correctAnswers = 0
    
    currentAssessment?.questions.forEach(question => {
      const userAnswer = userAnswers[question.id]
      if (userAnswer === question.correctAnswer) {
        totalScore += question.points
        correctAnswers++
      }
    })

    const finalScore = Math.round((totalScore / (currentAssessment?.questions.reduce((sum, q) => sum + q.points, 0) || 1)) * 100)
    
    setProgress(prev => prev ? {
      ...prev,
      score: finalScore,
      isCompleted: true
    } : null)
    
    setIsAssessmentActive(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800"
      case "in_progress": return "bg-blue-100 text-blue-800"
      case "not_started": return "bg-gray-100 text-gray-800"
      default: return "bg-gray-100 text-gray-800"
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

  // Si hay una evaluación activa, mostrar la interfaz de evaluación
  if (isAssessmentActive && currentAssessment) {
    const currentQuestion = currentAssessment.questions[currentQuestionIndex]
    const progressPercentage = ((currentQuestionIndex + 1) / currentAssessment.questions.length) * 100

    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          <Navbar />
          
          <div className="pt-24 pb-8">
            <div className="container mx-auto px-4 max-w-4xl">
              {/* Header de la evaluación */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {currentAssessment.title}
                  </h1>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Timer className="h-5 w-5 text-red-500" />
                      <span className="font-mono text-lg">
                        {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsPaused(!isPaused)}
                    >
                      {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                
                {/* Barra de progreso */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">
                      Pregunta {currentQuestionIndex + 1} de {currentAssessment.questions.length}
                    </span>
                    <span className="text-sm text-gray-600">
                      {Math.round(progressPercentage)}% completado
                    </span>
                  </div>
                  <Progress value={progressPercentage} className="h-2" />
                </div>
              </div>

              {/* Pregunta actual */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl mb-6">
                <CardContent className="p-6">
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <Badge className={getDifficultyColor(currentQuestion.difficulty)}>
                        {currentQuestion.difficulty === "easy" ? "Fácil" : 
                         currentQuestion.difficulty === "medium" ? "Medio" : "Difícil"}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {currentQuestion.points} puntos
                      </span>
                    </div>
                    
                    <h2 className="text-xl font-semibold mb-4">
                      {currentQuestion.text}
                    </h2>

                    {currentQuestion.culturalContext && (
                      <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Heart className="h-4 w-4 text-yellow-600" />
                          <span className="text-sm text-yellow-800">
                            Contexto cultural: {currentQuestion.culturalContext}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Opciones según el tipo de pregunta */}
                    {currentQuestion.type === "multiple_choice" && currentQuestion.options && (
                      <div className="space-y-3">
                        {currentQuestion.options.map((option, index) => (
                          <label
                            key={index}
                            className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                          >
                            <input
                              type="radio"
                              name={`question-${currentQuestion.id}`}
                              value={option}
                              checked={userAnswers[currentQuestion.id] === option}
                              onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
                              className="h-4 w-4 text-blue-600"
                            />
                            <span className="flex-1">{option}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {currentQuestion.type === "true_false" && (
                      <div className="space-y-3">
                        {["true", "false"].map((option) => (
                          <label
                            key={option}
                            className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                          >
                            <input
                              type="radio"
                              name={`question-${currentQuestion.id}`}
                              value={option}
                              checked={userAnswers[currentQuestion.id] === option}
                              onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
                              className="h-4 w-4 text-blue-600"
                            />
                            <span className="flex-1">
                              {option === "true" ? "Verdadero" : "Falso"}
                            </span>
                          </label>
                        ))}
                      </div>
                    )}

                    {currentQuestion.type === "fill_blank" && (
                      <div className="space-y-3">
                        <input
                          type="text"
                          placeholder="Escribe tu respuesta aquí..."
                          value={userAnswers[currentQuestion.id] || ""}
                          onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    )}
                  </div>

                  {/* Navegación */}
                  <div className="flex items-center justify-between">
                    <Button
                      variant="outline"
                      onClick={previousQuestion}
                      disabled={currentQuestionIndex === 0}
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Anterior
                    </Button>

                    <div className="flex items-center space-x-2">
                      {currentQuestionIndex === currentAssessment.questions.length - 1 ? (
                        <Button onClick={submitAssessment} className="bg-green-600 hover:bg-green-700">
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Finalizar Evaluación
                        </Button>
                      ) : (
                        <Button onClick={nextQuestion}>
                          Siguiente
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Panel de accesibilidad */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-lg">Herramientas de Accesibilidad</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setAccessibilityEnabled(prev => ({ ...prev, screenReader: !prev.screenReader }))}
                      className={accessibilityEnabled.screenReader ? "bg-blue-100" : ""}
                    >
                      <Volume2 className="mr-2 h-4 w-4" />
                      Lector de Pantalla
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setAccessibilityEnabled(prev => ({ ...prev, highContrast: !prev.highContrast }))}
                      className={accessibilityEnabled.highContrast ? "bg-blue-100" : ""}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Alto Contraste
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setAccessibilityEnabled(prev => ({ ...prev, largeText: !prev.largeText }))}
                      className={accessibilityEnabled.largeText ? "bg-blue-100" : ""}
                    >
                      <Maximize2 className="mr-2 h-4 w-4" />
                      Texto Grande
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setAccessibilityEnabled(prev => ({ ...prev, voiceCommands: !prev.voiceCommands }))}
                      className={accessibilityEnabled.voiceCommands ? "bg-blue-100" : ""}
                    >
                      <Zap className="mr-2 h-4 w-4" />
                      Comandos de Voz
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  // Si se muestran las instrucciones
  if (showInstructions && currentAssessment) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          <Navbar />
          
          <div className="pt-24 pb-8">
            <div className="container mx-auto px-4 max-w-2xl">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-2xl">{currentAssessment.title}</CardTitle>
                  <CardDescription>
                    {currentAssessment.subject} • {currentAssessment.estimatedTime} minutos
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-2">Instrucciones:</h3>
                    <p className="text-gray-600">{currentAssessment.instructions}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <Clock className="h-5 w-5 text-blue-600" />
                        <span className="font-medium">Tiempo</span>
                      </div>
                      <p className="text-sm text-gray-600">{currentAssessment.estimatedTime} minutos</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <Target className="h-5 w-5 text-green-600" />
                        <span className="font-medium">Preguntas</span>
                      </div>
                      <p className="text-sm text-gray-600">{currentAssessment.totalQuestions} preguntas</p>
                    </div>
                  </div>

                  {currentAssessment.isAdaptive && (
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <Brain className="h-5 w-5 text-purple-600" />
                        <span className="font-medium">Evaluación Adaptativa</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Esta evaluación se adaptará a tu nivel de conocimiento en tiempo real.
                      </p>
                    </div>
                  )}

                  <div className="flex space-x-4">
                    <Button variant="outline" onClick={() => setShowInstructions(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={beginAssessment} className="flex-1">
                      <Play className="mr-2 h-4 w-4" />
                      Comenzar Evaluación
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  // Vista principal de evaluaciones
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Navbar />
        
        <div className="pt-24 pb-8">
          <div className="container mx-auto px-4">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                Evaluaciones
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Pon a prueba tus conocimientos con nuestras evaluaciones adaptativas
              </p>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-3 bg-white/80 backdrop-blur-sm">
                <TabsTrigger value="available">Disponibles</TabsTrigger>
                <TabsTrigger value="completed">Completadas</TabsTrigger>
                <TabsTrigger value="results">Resultados</TabsTrigger>
              </TabsList>

              <TabsContent value="available" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {assessments.map((assessment) => (
                    <Card key={assessment.id} className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{assessment.title}</CardTitle>
                            <CardDescription>{assessment.subject}</CardDescription>
                          </div>
                          <Badge className={getDifficultyColor(assessment.difficulty)}>
                            {assessment.difficulty === "beginner" ? "Principiante" :
                             assessment.difficulty === "intermediate" ? "Intermedio" : "Avanzado"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Tiempo estimado:</span>
                          <span className="font-medium">{assessment.estimatedTime} min</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Preguntas:</span>
                          <span className="font-medium">{assessment.totalQuestions}</span>
                        </div>
                        
                        {assessment.isAdaptive && (
                          <div className="flex items-center space-x-2 p-2 bg-purple-50 rounded-lg">
                            <Brain className="h-4 w-4 text-purple-600" />
                            <span className="text-sm text-purple-700">Adaptativa</span>
                          </div>
                        )}

                        {assessment.culturalContext && (
                          <div className="flex items-center space-x-2 p-2 bg-yellow-50 rounded-lg">
                            <Heart className="h-4 w-4 text-yellow-600" />
                            <span className="text-sm text-yellow-700">Contexto {assessment.culturalContext}</span>
                          </div>
                        )}

                        <Button 
                          onClick={() => startAssessment(assessment)}
                          className="w-full"
                        >
                          <Play className="mr-2 h-4 w-4" />
                          Comenzar
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="completed" className="space-y-6">
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                  <CardHeader>
                    <CardTitle>Evaluaciones Completadas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-gray-500">
                      <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No hay evaluaciones completadas aún.</p>
                      <p className="text-sm">Completa tu primera evaluación para ver tus resultados aquí.</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="results" className="space-y-6">
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                  <CardHeader>
                    <CardTitle>Análisis de Resultados</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-gray-500">
                      <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No hay resultados disponibles.</p>
                      <p className="text-sm">Completa evaluaciones para ver análisis detallados.</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <Footer />
      </div>
    </ProtectedRoute>
  )
}
