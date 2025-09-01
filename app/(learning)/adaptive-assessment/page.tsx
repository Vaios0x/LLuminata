'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  Target, 
  TrendingUp, 
  BookOpen, 
  Award,
  BarChart3,
  Lightbulb,
  Users,
  Clock,
  Star,
  ArrowRight
} from 'lucide-react';
import { EnhancedAdaptiveAssessment } from '@/components/learning/enhanced-adaptive-assessment';
import { PersonalizedRecommendations } from '@/components/learning/personalized-recommendations';
import { adaptiveAssessmentService, type AssessmentResults, type LearningRecommendation } from '@/lib/adaptive-assessment-service';

export default function AdaptiveAssessmentPage() {
  const [activeTab, setActiveTab] = useState('assessment');
  const [currentSubject, setCurrentSubject] = useState('mathematics');
  const [assessmentResults, setAssessmentResults] = useState<AssessmentResults | null>(null);
  const [learningInsights, setLearningInsights] = useState<any[]>([]);
  const [currentDifficulty, setCurrentDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [selectedRecommendation, setSelectedRecommendation] = useState<LearningRecommendation | null>(null);
  const [studentId] = useState('demo-student-123'); // En producción, esto vendría del contexto de autenticación

  const subjects = [
    { id: 'mathematics', name: 'Matemáticas', icon: '🔢' },
    { id: 'reading', name: 'Lectura', icon: '📚' },
    { id: 'science', name: 'Ciencias', icon: '🔬' },
    { id: 'history', name: 'Historia', icon: '📜' },
    { id: 'cultural', name: 'Cultura', icon: '🌍' }
  ];

  const handleAssessmentComplete = (results: AssessmentResults) => {
    setAssessmentResults(results);
    setActiveTab('results');
  };

  const handleProgress = (progress: number) => {
    console.log('Progreso de evaluación:', progress);
  };

  const handleDifficultyChange = (difficulty: 'easy' | 'medium' | 'hard') => {
    setCurrentDifficulty(difficulty);
    console.log('Dificultad cambiada a:', difficulty);
  };

  const handleLearningInsights = (insights: any) => {
    setLearningInsights(prev => [...prev, insights]);
    console.log('Nuevos insights de aprendizaje:', insights);
  };

  const handleRecommendationSelect = (recommendation: LearningRecommendation) => {
    setSelectedRecommendation(recommendation);
    setActiveTab('recommendations');
  };

  const getMasteryLevelColor = (level: string) => {
    switch (level) {
      case 'expert': return 'bg-purple-100 text-purple-800';
      case 'advanced': return 'bg-blue-100 text-blue-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'beginner': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3 mb-2">
          <Brain className="w-8 h-8 text-blue-600" />
          Sistema de Evaluación Adaptativa
        </h1>
        <p className="text-gray-600">
          Evaluaciones dinámicas que se adaptan a tu progreso y estilo de aprendizaje
        </p>
      </div>

      {/* Selector de materia */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Seleccionar Materia
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {subjects.map((subject) => (
              <Button
                key={subject.id}
                variant={currentSubject === subject.id ? 'default' : 'outline'}
                className="flex flex-col items-center gap-2 h-auto p-4"
                onClick={() => setCurrentSubject(subject.id)}
              >
                <span className="text-2xl">{subject.icon}</span>
                <span className="text-sm">{subject.name}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pestañas principales */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="assessment" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Evaluación
          </TabsTrigger>
          <TabsTrigger value="results" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Resultados
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4" />
            Recomendaciones
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            Insights
          </TabsTrigger>
        </TabsList>

        {/* Pestaña de Evaluación */}
        <TabsContent value="assessment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Evaluación Adaptativa - {subjects.find(s => s.id === currentSubject)?.name}
              </CardTitle>
              <div className="flex items-center gap-4">
                <Badge className={getDifficultyColor(currentDifficulty)}>
                  Dificultad: {currentDifficulty}
                </Badge>
                <span className="text-sm text-gray-600">
                  Esta evaluación se adaptará a tu nivel de conocimiento
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <EnhancedAdaptiveAssessment
                studentId={studentId}
                subject={currentSubject}
                onComplete={handleAssessmentComplete}
                onProgress={handleProgress}
                onDifficultyChange={handleDifficultyChange}
                onLearningInsights={handleLearningInsights}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pestaña de Resultados */}
        <TabsContent value="results" className="space-y-6">
          {assessmentResults ? (
            <div className="space-y-6">
              {/* Resumen de resultados */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Resumen de Resultados
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {assessmentResults.score}%
                      </div>
                      <div className="text-sm text-gray-600">Puntuación</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {assessmentResults.correctAnswers}/{assessmentResults.totalQuestions}
                      </div>
                      <div className="text-sm text-gray-600">Correctas</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {Math.floor(assessmentResults.timeSpent / 60)}:{(assessmentResults.timeSpent % 60).toString().padStart(2, '0')}
                      </div>
                      <div className="text-sm text-gray-600">Tiempo</div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <Badge className={getMasteryLevelColor(assessmentResults.masteryLevel)}>
                        {assessmentResults.masteryLevel}
                      </Badge>
                      <div className="text-sm text-gray-600 mt-1">Nivel</div>
                    </div>
                  </div>

                  {/* Fortalezas y debilidades */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-green-700 mb-3 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        Fortalezas
                      </h4>
                      <ul className="space-y-2">
                        {assessmentResults.strengths.map((strength, index) => (
                          <li key={index} className="flex items-center gap-2 text-sm">
                            <Star className="w-3 h-3 text-green-600" />
                            {strength}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-red-700 mb-3 flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        Áreas de Mejora
                      </h4>
                      <ul className="space-y-2">
                        {assessmentResults.weaknesses.map((weakness, index) => (
                          <li key={index} className="flex items-center gap-2 text-sm">
                            <Lightbulb className="w-3 h-3 text-red-600" />
                            {weakness}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recomendaciones */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5" />
                    Recomendaciones
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {assessmentResults.recommendations.map((recommendation, index) => (
                      <div key={index} className="p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <BookOpen className="w-4 h-4 text-blue-600" />
                          <span className="font-medium">Recomendación {index + 1}</span>
                        </div>
                        <p className="text-sm text-gray-700">{recommendation}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Próximos pasos */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ArrowRight className="w-5 h-5" />
                    Próximos Pasos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {assessmentResults.nextSteps.map((step, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <span className="text-sm">{step}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">No hay resultados disponibles</h3>
                <p className="text-gray-600 mb-4">
                  Completa una evaluación para ver tus resultados aquí.
                </p>
                <Button onClick={() => setActiveTab('assessment')}>
                  Ir a Evaluación
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Pestaña de Recomendaciones */}
        <TabsContent value="recommendations" className="space-y-6">
          <PersonalizedRecommendations
            studentId={studentId}
            subject={currentSubject}
            onRecommendationSelect={handleRecommendationSelect}
          />
        </TabsContent>

        {/* Pestaña de Insights */}
        <TabsContent value="insights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Insights de Aprendizaje
              </CardTitle>
              <p className="text-sm text-gray-600">
                Análisis detallado de tu patrón de aprendizaje y comportamiento
              </p>
            </CardHeader>
            <CardContent>
              {learningInsights.length > 0 ? (
                <div className="space-y-4">
                  {learningInsights.map((insight, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Lightbulb className="w-5 h-5 text-yellow-600" />
                        <span className="font-medium">Insight #{index + 1}</span>
                        <Badge className="bg-blue-100 text-blue-800">
                          Confianza: {Math.round(insight.confidence * 100)}%
                        </Badge>
                      </div>
                      <p className="text-gray-700 mb-2">{insight.pattern}</p>
                      {insight.insights && (
                        <div className="text-sm text-gray-600">
                          <strong>Observaciones:</strong>
                          <ul className="mt-1 space-y-1">
                            {insight.insights.map((observation: string, obsIndex: number) => (
                              <li key={obsIndex}>• {observation}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-700 mb-2">No hay insights disponibles</h3>
                  <p className="text-gray-600">
                    Los insights se generarán mientras completas evaluaciones.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
