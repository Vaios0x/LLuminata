'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Globe, 
  BookOpen, 
  Users, 
  Clock, 
  Star,
  Heart,
  Mic,
  Eye,
  Volume2,
  Target,
  CheckCircle
} from 'lucide-react';
import { CulturalLessonCatalog, CulturalLesson } from '@/components/learning';
import { CulturalLesson as CulturalLessonType } from '@/lib/cultural-content-service';

export default function CulturalLessonsPage() {
  const [selectedLesson, setSelectedLesson] = useState<CulturalLessonType | null>(null);
  const [lessonCompleted, setLessonCompleted] = useState(false);
  const [lessonResults, setLessonResults] = useState<{
    score: number;
    timeSpent: number;
    culturalInsights: string[];
  } | null>(null);

  const handleLessonSelect = (lesson: CulturalLessonType) => {
    setSelectedLesson(lesson);
    setLessonCompleted(false);
    setLessonResults(null);
  };

  const handleLessonComplete = (score: number, timeSpent: number, culturalInsights: string[]) => {
    setLessonResults({ score, timeSpent, culturalInsights });
    setLessonCompleted(true);
  };

  const handleLessonProgress = (sectionId: string, completed: boolean) => {
    console.log(`Sección ${sectionId} ${completed ? 'completada' : 'en progreso'}`);
  };

  const handleBackToCatalog = () => {
    setSelectedLesson(null);
    setLessonCompleted(false);
    setLessonResults(null);
  };

  if (selectedLesson) {
    return (
      <div className="container mx-auto px-4 py-8">
        {/* Header con navegación */}
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={handleBackToCatalog}
            className="mb-4"
            aria-label="Volver al catálogo"
            tabIndex={0}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Catálogo
          </Button>

          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Lección Cultural</h1>
              <p className="text-gray-600">Aprendizaje en contexto cultural indígena</p>
            </div>
          </div>
        </div>

        {/* Resultados de la lección completada */}
        {lessonCompleted && lessonResults && (
          <Card className="mb-6 border-green-500 bg-green-50">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-green-800 mb-2">
                    ¡Lección Completada!
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{lessonResults.score}%</div>
                      <div className="text-sm text-green-700">Puntuación</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {Math.floor(lessonResults.timeSpent / 60)}:{(lessonResults.timeSpent % 60).toString().padStart(2, '0')}
                      </div>
                      <div className="text-sm text-green-700">Tiempo</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{lessonResults.culturalInsights.length}</div>
                      <div className="text-sm text-green-700">Insights Culturales</div>
                    </div>
                  </div>
                  
                  {lessonResults.culturalInsights.length > 0 && (
                    <div className="text-left">
                      <h4 className="font-semibold text-green-800 mb-2">Insights Culturales Obtenidos:</h4>
                      <ul className="space-y-1">
                        {lessonResults.culturalInsights.map((insight, index) => (
                          <li key={index} className="text-sm text-green-700 flex items-start space-x-2">
                            <Heart className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span>{insight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Componente de lección cultural */}
        <CulturalLesson
          lessonId={selectedLesson.id}
          studentId="demo-student"
          onComplete={handleLessonComplete}
          onProgress={handleLessonProgress}
          autoPlay={false}
          showCulturalNotes={true}
          enableAudio={true}
          enableVisualAids={true}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Globe className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-4xl font-bold mb-4">Lecciones Culturales</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Explora lecciones en idiomas indígenas con contenido culturalmente relevante. 
          Aprende matemáticas, idiomas, ciencias y más en el contexto de tu cultura.
        </p>
      </div>

      {/* Estadísticas destacadas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">25+</p>
                <p className="text-sm text-gray-600">Lecciones Culturales</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Globe className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">5</p>
                <p className="text-sm text-gray-600">Culturas Indígenas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">4</p>
                <p className="text-sm text-gray-600">Grupos de Edad</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <Target className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">6</p>
                <p className="text-sm text-gray-600">Materias Cubiertas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Características destacadas */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Características del Contenido Cultural
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <Mic className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold">Lecciones en Idiomas Indígenas</h3>
              <p className="text-sm text-gray-600">
                Contenido en maya, náhuatl, zapoteco, mixteco y otomí con pronunciación guiada
              </p>
            </div>

            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Heart className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold">Contenido Culturalmente Relevante</h3>
              <p className="text-sm text-gray-600">
                Ejemplos y contextos adaptados a cada cultura y región específica
              </p>
            </div>

            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                <Eye className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold">Sistema de Variantes Culturales</h3>
              <p className="text-sm text-gray-600">
                Adaptaciones regionales con dialectos y vocabulario específico
              </p>
            </div>

            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
                <Volume2 className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="font-semibold">Audio y Pronunciación</h3>
              <p className="text-sm text-gray-600">
                Grabaciones de audio para mejorar la pronunciación y comprensión
              </p>
            </div>

            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <Target className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="font-semibold">Objetivos de Aprendizaje Claros</h3>
              <p className="text-sm text-gray-600">
                Metas específicas para cada lección con seguimiento de progreso
              </p>
            </div>

            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="font-semibold">Accesibilidad Universal</h3>
              <p className="text-sm text-gray-600">
                Compatible con lectores de pantalla y navegación por teclado
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Catálogo de lecciones */}
      <CulturalLessonCatalog
        onLessonSelect={handleLessonSelect}
        showFilters={true}
        showSearch={true}
        maxLessons={12}
      />
    </div>
  );
}
