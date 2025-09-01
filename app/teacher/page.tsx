"use client"

import { useState } from "react"
import { useAuth } from "@/lib/hooks/useAuth"
import { Navbar } from "@/components/ui/navbar"
import { Footer } from "@/components/ui/footer"
import { TeacherDashboard } from "@/components/teacher/teacher-dashboard"
import { ContentCreator } from "@/components/teacher/content-creator"
import { ReportsAnalytics } from "@/components/teacher/reports-analytics"
import { 
  Users, 
  BookOpen, 
  BarChart3, 
  Palette,
  Settings,
  Bell,
  Calendar,
  MessageSquare,
  HelpCircle,
  LogOut
} from 'lucide-react'

export default function TeacherPage() {
  const { user, isLoading } = useAuth()
  const [activeTab, setActiveTab] = useState("dashboard")

  if (isLoading) {
    return (
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
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navbar />
      
      <div className="pt-24 pb-8">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Header del maestro */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                  Panel de Maestro
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                  Bienvenido, {user?.name || "Maestro"}! Gestiona tus estudiantes, crea contenido y analiza el progreso
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                  <Bell className="w-5 h-5" />
                </button>
                <button className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                  <MessageSquare className="w-5 h-5" />
                </button>
                <button className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                  <Settings className="w-5 h-5" />
                </button>
                <button className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                  <HelpCircle className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Pestañas principales */}
          <div className="space-y-6">
            <div className="flex space-x-1 bg-muted p-1 rounded-lg">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'dashboard'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                tabIndex={0}
              >
                <Users className="w-4 h-4 mr-2" />
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('content')}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'content'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                tabIndex={0}
              >
                <Palette className="w-4 h-4 mr-2" />
                Crear Contenido
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'analytics'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                tabIndex={0}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
              </button>
              <button
                onClick={() => setActiveTab('resources')}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'resources'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                tabIndex={0}
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Recursos
              </button>
            </div>

            {/* Contenido del Dashboard */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <TeacherDashboard 
                  teacherId={user?.id || "demo-teacher-123"} 
                  className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-lg p-6"
                />
              </div>
            )}

            {/* Contenido del Creador */}
            {activeTab === 'content' && (
              <div className="space-y-6">
                <ContentCreator 
                  teacherId={user?.id || "demo-teacher-123"}
                  className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-lg p-6"
                />
              </div>
            )}

            {/* Contenido de Analytics */}
            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <ReportsAnalytics 
                  teacherId={user?.id || "demo-teacher-123"}
                  className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-lg p-6"
                />
              </div>
            )}

            {/* Contenido de Recursos */}
            {activeTab === 'resources' && (
              <div className="space-y-6">
                <div className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-lg p-6">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold flex items-center gap-3">
                      <BookOpen className="w-6 h-6 text-blue-600" />
                      Recursos para Maestros
                    </h2>
                    <p className="text-gray-600 mt-1">
                      Herramientas, guías y materiales para mejorar tu enseñanza
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Guías de enseñanza */}
                    <div className="p-6 border rounded-lg hover:shadow-lg transition-shadow">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <BookOpen className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold">Guías de Enseñanza</h3>
                          <p className="text-sm text-gray-600">Metodologías y estrategias</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">
                        Accede a guías detalladas sobre metodologías de enseñanza inclusiva, 
                        adaptación cultural y técnicas de accesibilidad.
                      </p>
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        Ver guías →
                      </button>
                    </div>

                    {/* Plantillas de contenido */}
                    <div className="p-6 border rounded-lg hover:shadow-lg transition-shadow">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <Palette className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold">Plantillas</h3>
                          <p className="text-sm text-gray-600">Contenido predefinido</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">
                        Descarga plantillas de lecciones, evaluaciones y actividades 
                        adaptadas a diferentes culturas y niveles.
                      </p>
                      <button className="text-green-600 hover:text-green-800 text-sm font-medium">
                        Descargar plantillas →
                      </button>
                    </div>

                    {/* Capacitación */}
                    <div className="p-6 border rounded-lg hover:shadow-lg transition-shadow">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <Users className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold">Capacitación</h3>
                          <p className="text-sm text-gray-600">Cursos y talleres</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">
                        Participa en cursos de capacitación sobre educación inclusiva, 
                        tecnología educativa y diversidad cultural.
                      </p>
                      <button className="text-purple-600 hover:text-purple-800 text-sm font-medium">
                        Ver cursos →
                      </button>
                    </div>

                    {/* Comunidad */}
                    <div className="p-6 border rounded-lg hover:shadow-lg transition-shadow">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-orange-100 rounded-lg">
                          <MessageSquare className="w-6 h-6 text-orange-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold">Comunidad</h3>
                          <p className="text-sm text-gray-600">Foros y grupos</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">
                        Conecta con otros maestros, comparte experiencias y 
                        colabora en proyectos educativos.
                      </p>
                      <button className="text-orange-600 hover:text-orange-800 text-sm font-medium">
                        Unirse a la comunidad →
                      </button>
                    </div>

                    {/* Investigación */}
                    <div className="p-6 border rounded-lg hover:shadow-lg transition-shadow">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-red-100 rounded-lg">
                          <BarChart3 className="w-6 h-6 text-red-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold">Investigación</h3>
                          <p className="text-sm text-gray-600">Estudios y papers</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">
                        Accede a investigaciones sobre educación inclusiva, 
                        tecnología educativa y diversidad cultural.
                      </p>
                      <button className="text-red-600 hover:text-red-800 text-sm font-medium">
                        Ver investigaciones →
                      </button>
                    </div>

                    {/* Soporte técnico */}
                    <div className="p-6 border rounded-lg hover:shadow-lg transition-shadow">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <HelpCircle className="w-6 h-6 text-gray-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold">Soporte</h3>
                          <p className="text-sm text-gray-600">Ayuda y asistencia</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">
                        Obtén ayuda técnica, respuestas a preguntas frecuentes 
                        y asistencia personalizada.
                      </p>
                      <button className="text-gray-600 hover:text-gray-800 text-sm font-medium">
                        Contactar soporte →
                      </button>
                    </div>
                  </div>

                  {/* Calendario de eventos */}
                  <div className="mt-8">
                    <h3 className="text-xl font-semibold flex items-center gap-2 mb-4">
                      <Calendar className="w-5 h-5" />
                      Próximos Eventos
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-sm font-medium">Capacitación</span>
                        </div>
                        <h4 className="font-medium">Taller de Educación Inclusiva</h4>
                        <p className="text-sm text-gray-600">15 de febrero, 2024</p>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm font-medium">Webinar</span>
                        </div>
                        <h4 className="font-medium">Tecnología Educativa</h4>
                        <p className="text-sm text-gray-600">20 de febrero, 2024</p>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          <span className="text-sm font-medium">Conferencia</span>
                        </div>
                        <h4 className="font-medium">Diversidad Cultural</h4>
                        <p className="text-sm text-gray-600">25 de febrero, 2024</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
