"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/ui/navbar"
import { Footer } from "@/components/ui/footer"
import { StatCard } from "@/components/dashboard/stat-card"
import { ActivityItem } from "@/components/dashboard/activity-item"
import { AIServicesIntegration } from "@/components/ai"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { useAuth } from "@/lib/hooks/useAuth"
import { Award } from "lucide-react"
import ReminderManager from '@/components/reminder-manager';
import { Bell } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("overview")
  const [isLoading, setIsLoading] = useState(false)

  // Datos simulados para el dashboard
  const stats = {
    totalLessons: 24,
    completedLessons: 18,
    currentStreak: 7,
    totalPoints: 2840,
    accuracy: 87,
    timeSpent: "12h 34m",
    level: 3,
    nextLevel: 4,
    experienceToNext: 160,
    totalExperience: 2840,
    weeklyGoal: 5,
    weeklyProgress: 3,
    specialNeeds: ["dislexia"],
    learningStyle: "visual",
    culturalBackground: "maya"
  }

  const recentActivity = [
    { id: 1, type: "lesson" as const, title: "Matemáticas Básicas", progress: 85, time: "2h ago", subject: "Matemáticas" },
    { id: 2, type: "quiz" as const, title: "Evaluación de Ciencias", score: 92, time: "4h ago", subject: "Ciencias" },
    { id: 3, type: "achievement" as const, title: "¡Completaste 5 lecciones!", time: "1d ago", subject: "General" },
    { id: 4, type: "lesson" as const, title: "Historia de México", progress: 60, time: "2d ago", subject: "Historia" }
  ]

  const recommendations = [
    { id: 1, title: "Álgebra Intermedia", difficulty: "Intermedio", estimatedTime: "45 min", match: 95, subject: "Matemáticas", culturalContext: "maya" },
    { id: 2, title: "Literatura Maya", difficulty: "Básico", estimatedTime: "30 min", match: 88, subject: "Literatura", culturalContext: "maya" },
    { id: 3, title: "Física Cuántica", difficulty: "Avanzado", estimatedTime: "60 min", match: 82, subject: "Ciencias", culturalContext: "general" }
  ]

  const achievements = [
    { id: 1, title: "Primera Lección", description: "Completaste tu primera lección", icon: "🎯", earnedAt: "2025-01-15", type: "milestone" },
    { id: 2, title: "Racha de 7 días", description: "Has estudiado 7 días seguidos", icon: "🔥", earnedAt: "2025-01-20", type: "streak" },
    { id: 3, title: "Matemático Maya", description: "Completaste 10 lecciones de matemáticas", icon: "🧮", earnedAt: "2025-01-18", type: "subject" }
  ]

  const weeklyProgress = [
    { day: "Lun", lessons: 2, time: 45 },
    { day: "Mar", lessons: 1, time: 30 },
    { day: "Mié", lessons: 3, time: 60 },
    { day: "Jue", lessons: 0, time: 0 },
    { day: "Vie", lessons: 2, time: 40 },
    { day: "Sáb", lessons: 1, time: 25 },
    { day: "Dom", lessons: 0, time: 0 }
  ]

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Navbar />
        
        <div className="pt-24 pb-8">
          <div className="container mx-auto px-4">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Bienvenido de vuelta, {user?.name || "Estudiante"}! ¡Sigamos aprendiendo juntos!
              </p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                title="Lecciones Completadas"
                value={stats.completedLessons}
                subtitle={`de ${stats.totalLessons} lecciones`}
                progress={{ current: stats.completedLessons, total: stats.totalLessons }}
                color="blue"
              />
              
              <StatCard
                title="Racha Actual"
                value={stats.currentStreak}
                subtitle="días consecutivos"
                streak={{ current: stats.currentStreak, max: 7 }}
                color="green"
              />
              
              <StatCard
                title="Puntos Totales"
                value={stats.totalPoints}
                subtitle="puntos acumulados"
                trend={{ value: "+240", isPositive: true, label: "esta semana" }}
                color="purple"
              />
              
              <StatCard
                title="Precisión"
                value={`${stats.accuracy}%`}
                subtitle="promedio general"
                trend={{ value: "+5%", isPositive: true, label: "vs semana pasada" }}
                color="orange"
              />
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Activity & Progress */}
              <div className="lg:col-span-2 space-y-8">
                {/* Recent Activity */}
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Actividad Reciente</span>
                      <Button variant="ghost" size="sm">
                        Ver Todo
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentActivity.map((activity) => (
                        <ActivityItem
                          key={activity.id}
                          type={activity.type}
                          title={activity.title}
                          progress={activity.progress}
                          score={activity.score}
                          time={activity.time}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Weekly Progress Chart */}
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                  <CardHeader>
                    <CardTitle>Progreso Semanal</CardTitle>
                    <CardDescription>
                      Tu actividad de esta semana
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-end justify-between space-x-2">
                      {weeklyProgress.map((day, index) => (
                        <div key={index} className="flex-1 flex flex-col items-center">
                          <div className="w-full bg-gray-200 rounded-t-lg relative">
                            <div 
                              className="bg-gradient-to-t from-green-500 to-blue-600 rounded-t-lg transition-all duration-1000"
                              style={{ height: `${(day.time / 60) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-500 mt-2">{day.day}</span>
                          <span className="text-xs text-gray-400">{day.lessons} lecciones</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Achievements */}
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Award className="mr-2 h-5 w-5" />
                      Logros Recientes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {achievements.map((achievement) => (
                        <div key={achievement.id} className="p-4 border border-gray-200 rounded-lg text-center">
                          <div className="text-3xl mb-2">{achievement.icon}</div>
                          <h4 className="font-medium text-sm mb-1">{achievement.title}</h4>
                          <p className="text-xs text-gray-500">{achievement.description}</p>
                          <p className="text-xs text-gray-400 mt-2">{achievement.earnedAt}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Recommendations & Quick Actions */}
              <div className="space-y-8">
                {/* AI Recommendations */}
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <span className="mr-2">🤖</span>
                      Recomendaciones IA
                    </CardTitle>
                    <CardDescription>
                      Basado en tu progreso y preferencias
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recommendations.map((rec) => (
                        <div key={rec.id} className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors duration-200">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              {rec.title}
                            </h4>
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                              {rec.match}% match
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                            <span>{rec.difficulty}</span>
                            <span>{rec.estimatedTime}</span>
                          </div>
                          <Button size="sm" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                            Comenzar
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                  <CardHeader>
                    <CardTitle>Acciones Rápidas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Button variant="outline" className="w-full justify-start">
                        <span className="mr-2">📚</span>
                        Continuar Lección
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <span className="mr-2">📝</span>
                        Tomar Evaluación
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <span className="mr-2">📊</span>
                        Ver Reportes
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <span className="mr-2">🎯</span>
                        Establecer Metas
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Study Timer */}
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                  <CardHeader>
                    <CardTitle>Timer de Estudio</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                        25:00
                      </div>
                      <div className="space-y-2">
                        <Button className="w-full bg-green-600 hover:bg-green-700">
                          Iniciar Sesión
                        </Button>
                        <Button variant="outline" className="w-full">
                          Pausar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Sistema de Notificaciones */}
            <div className="col-span-full">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Sistema de Notificaciones
                  </CardTitle>
                  <CardDescription>
                    Gestiona recordatorios automáticos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ReminderManager />
                </CardContent>
              </Card>
            </div>

            {/* AI Services Integration */}
            <div className="mt-8">
              <AIServicesIntegration 
                studentId={user?.id || "default-student"}
                language="es-MX"
                culturalContext="maya"
              />
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </ProtectedRoute>
  )
}
