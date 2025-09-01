"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/ui/navbar"
import { Footer } from "@/components/ui/footer"
import { cn } from "@/lib/utils"

export default function Lessons() {
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedLevel, setSelectedLevel] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  // Datos simulados de lecciones
  const categories = [
    { id: "all", name: "Todas", icon: "📚", count: 24 },
    { id: "math", name: "Matemáticas", icon: "🔢", count: 8 },
    { id: "science", name: "Ciencias", icon: "🔬", count: 6 },
    { id: "history", name: "Historia", icon: "📜", count: 5 },
    { id: "language", name: "Idiomas", icon: "🌍", count: 5 }
  ]

  const levels = [
    { id: "all", name: "Todos los niveles", color: "bg-gray-500" },
    { id: "beginner", name: "Principiante", color: "bg-green-500" },
    { id: "intermediate", name: "Intermedio", color: "bg-blue-500" },
    { id: "advanced", name: "Avanzado", color: "bg-purple-500" }
  ]

  const lessons = [
    {
      id: 1,
      title: "Fundamentos de Álgebra",
      description: "Aprende los conceptos básicos del álgebra y las ecuaciones lineales",
      category: "math",
      level: "beginner",
      duration: "45 min",
      progress: 0,
      image: "🔢",
      tags: ["Ecuaciones", "Variables", "Básico"],
      rating: 4.8,
      students: 1240
    },
    {
      id: 2,
      title: "Historia de México Prehispánico",
      description: "Explora las civilizaciones antiguas que habitaron México",
      category: "history",
      level: "intermediate",
      duration: "60 min",
      progress: 75,
      image: "🏛️",
      tags: ["Cultura", "Civilizaciones", "México"],
      rating: 4.9,
      students: 890
    },
    {
      id: 3,
      title: "Física Cuántica Básica",
      description: "Introducción a los principios fundamentales de la física cuántica",
      category: "science",
      level: "advanced",
      duration: "90 min",
      progress: 0,
      image: "⚛️",
      tags: ["Física", "Cuántica", "Avanzado"],
      rating: 4.7,
      students: 567
    },
    {
      id: 4,
      title: "Literatura Maya",
      description: "Descubre la rica tradición literaria de la cultura maya",
      category: "language",
      level: "intermediate",
      duration: "50 min",
      progress: 100,
      image: "📖",
      tags: ["Literatura", "Maya", "Cultura"],
      rating: 4.6,
      students: 723
    },
    {
      id: 5,
      title: "Geometría Euclidiana",
      description: "Estudia las formas y figuras geométricas fundamentales",
      category: "math",
      level: "beginner",
      duration: "40 min",
      progress: 30,
      image: "📐",
      tags: ["Geometría", "Formas", "Básico"],
      rating: 4.5,
      students: 1567
    },
    {
      id: 6,
      title: "Biología Celular",
      description: "Explora el mundo microscópico de las células",
      category: "science",
      level: "intermediate",
      duration: "55 min",
      progress: 0,
      image: "🔬",
      tags: ["Biología", "Células", "Microscopio"],
      rating: 4.8,
      students: 945
    }
  ]

  // Filtrar lecciones
  const filteredLessons = lessons.filter(lesson => {
    const matchesCategory = selectedCategory === "all" || lesson.category === selectedCategory
    const matchesLevel = selectedLevel === "all" || lesson.level === selectedLevel
    const matchesSearch = lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         lesson.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesCategory && matchesLevel && matchesSearch
  })

  const getLevelColor = (level: string) => {
    switch (level) {
      case "beginner": return "bg-green-500"
      case "intermediate": return "bg-blue-500"
      case "advanced": return "bg-purple-500"
      default: return "bg-gray-500"
    }
  }

  const getLevelName = (level: string) => {
    switch (level) {
      case "beginner": return "Principiante"
      case "intermediate": return "Intermedio"
      case "advanced": return "Avanzado"
      default: return "Todos"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navbar />
      
      <div className="pt-24 pb-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Lecciones
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Explora nuestro catálogo completo de lecciones adaptativas
            </p>
          </div>

          {/* Search and Filters */}
          <div className="mb-8 space-y-6">
            {/* Search Bar */}
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar lecciones..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 pl-12 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                🔍
              </span>
            </div>

            {/* Categories */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Categorías
              </h3>
              <div className="flex flex-wrap gap-3">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={cn(
                      "flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-200",
                      selectedCategory === category.id
                        ? "bg-blue-600 text-white shadow-lg"
                        : "bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-blue-50 border border-gray-200"
                    )}
                  >
                    <span>{category.icon}</span>
                    <span className="font-medium">{category.name}</span>
                    <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                      {category.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Levels */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Nivel de Dificultad
              </h3>
              <div className="flex flex-wrap gap-3">
                {levels.map((level) => (
                  <button
                    key={level.id}
                    onClick={() => setSelectedLevel(level.id)}
                    className={cn(
                      "flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-200",
                      selectedLevel === level.id
                        ? "bg-blue-600 text-white shadow-lg"
                        : "bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-blue-50 border border-gray-200"
                    )}
                  >
                    <div className={cn("w-3 h-3 rounded-full", level.color)}></div>
                    <span className="font-medium">{level.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-6">
            <p className="text-gray-600 dark:text-gray-300">
              Mostrando {filteredLessons.length} de {lessons.length} lecciones
            </p>
          </div>

          {/* Lessons Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLessons.map((lesson) => (
              <Card 
                key={lesson.id} 
                className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="text-4xl">{lesson.image}</div>
                    <div className="flex items-center space-x-1">
                      <span className="text-yellow-500">⭐</span>
                      <span className="text-sm font-medium">{lesson.rating}</span>
                    </div>
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors duration-200">
                    {lesson.title}
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-300">
                    {lesson.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Progress Bar */}
                  {lesson.progress > 0 && (
                    <div>
                      <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                        <span>Progreso</span>
                        <span>{lesson.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${lesson.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    {lesson.tags.map((tag, index) => (
                      <span 
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Lesson Info */}
                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center space-x-1">
                        <span>⏱️</span>
                        <span>{lesson.duration}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <span>👥</span>
                        <span>{lesson.students}</span>
                      </span>
                    </div>
                    <div className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium text-white",
                      getLevelColor(lesson.level)
                    )}>
                      {getLevelName(lesson.level)}
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button 
                    className={cn(
                      "w-full transition-all duration-200",
                      lesson.progress === 100
                        ? "bg-green-600 hover:bg-green-700"
                        : lesson.progress > 0
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    )}
                  >
                    {lesson.progress === 100 ? "Repasar" : lesson.progress > 0 ? "Continuar" : "Comenzar"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Empty State */}
          {filteredLessons.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No se encontraron lecciones
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Intenta ajustar tus filtros o búsqueda
              </p>
              <Button 
                onClick={() => {
                  setSelectedCategory("all")
                  setSelectedLevel("all")
                  setSearchQuery("")
                }}
                variant="outline"
              >
                Limpiar Filtros
              </Button>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  )
}
