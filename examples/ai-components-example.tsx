'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  Eye, 
  Globe, 
  Mic, 
  TrendingUp, 
  Lightbulb,
  Users,
  Settings,
  Play,
  BookOpen,
  Video,
  Gamepad2,
  Palette,
  Target,
  Star,
  Heart,
  Clock,
  Zap,
  CheckCircle,
  AlertCircle,
  Download,
  Save,
  RefreshCw,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';

// Importar todos los componentes de IA
import {
  NeedsDetectionWizard,
  CulturalAdaptationPanel,
  VoiceGenerationStudio,
  BehavioralAnalysis,
  RecommendationEngine
} from '@/components/ai';

export default function AIComponentsExample() {
  const [activeTab, setActiveTab] = useState('needs-detection');
  const [userId] = useState('user-123');

  // Handlers para los componentes
  const handleNeedsComplete = (results: any[]) => {
    console.log('Necesidades detectadas:', results);
    alert(`Se detectaron ${results.length} categorías de necesidades`);
  };

  const handleAdaptationChange = (settings: any) => {
    console.log('Configuración de adaptación cultural:', settings);
  };

  const handleVoiceGenerate = (track: any) => {
    console.log('Audio generado:', track);
    alert(`Audio generado: ${track.voiceProfile.name}`);
  };

  const handlePatternDetected = (pattern: any) => {
    console.log('Patrón detectado:', pattern);
  };

  const handleRecommendationSelected = (recommendation: any) => {
    console.log('Recomendación seleccionada:', recommendation);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
            <Brain className="w-8 h-8 text-blue-600" />
            Componentes de IA y Machine Learning
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Demostración completa de los componentes de IA avanzados para la plataforma educativa inclusiva
          </p>
        </div>

        {/* Tabs de navegación */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="needs-detection" className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              <span className="hidden sm:inline">Detección de Necesidades</span>
            </TabsTrigger>
            <TabsTrigger value="cultural-adaptation" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              <span className="hidden sm:inline">Adaptación Cultural</span>
            </TabsTrigger>
            <TabsTrigger value="voice-generation" className="flex items-center gap-2">
              <Mic className="w-4 h-4" />
              <span className="hidden sm:inline">Generación de Voz</span>
            </TabsTrigger>
            <TabsTrigger value="behavioral-analysis" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Análisis de Comportamiento</span>
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              <span className="hidden sm:inline">Recomendaciones</span>
            </TabsTrigger>
          </TabsList>

          {/* Contenido de las tabs */}
          <TabsContent value="needs-detection" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-6 h-6 text-blue-600" />
                  Wizard de Detección de Necesidades Especiales
                </CardTitle>
                <CardDescription>
                  Evaluación integral de necesidades visuales, auditivas, cognitivas, emocionales y culturales
                </CardDescription>
              </CardHeader>
              <CardContent>
                <NeedsDetectionWizard
                  userId={userId}
                  onComplete={handleNeedsComplete}
                  onSave={(data) => console.log('Progreso guardado:', data)}
                  onCancel={() => console.log('Wizard cancelado')}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cultural-adaptation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-6 h-6 text-green-600" />
                  Panel de Adaptación Cultural
                </CardTitle>
                <CardDescription>
                  Personalización de la experiencia de aprendizaje según contextos culturales indígenas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CulturalAdaptationPanel
                  userId={userId}
                  onAdaptationChange={handleAdaptationChange}
                  onSave={(settings) => console.log('Configuración guardada:', settings)}
                  onReset={() => console.log('Configuración reseteada')}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="voice-generation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mic className="w-6 h-6 text-purple-600" />
                  Estudio de Generación de Voz Multilingüe
                </CardTitle>
                <CardDescription>
                  Creación de voces personalizadas en múltiples idiomas indígenas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <VoiceGenerationStudio
                  userId={userId}
                  onGenerate={handleVoiceGenerate}
                  onSave={(project) => console.log('Proyecto guardado:', project)}
                  onExport={(audioData) => console.log('Audio exportado:', audioData)}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="behavioral-analysis" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-indigo-600" />
                  Análisis de Comportamiento del Estudiante
                </CardTitle>
                <CardDescription>
                  Análisis profundo de patrones de aprendizaje y comportamiento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BehavioralAnalysis
                  userId={userId}
                  onPatternDetected={handlePatternDetected}
                  onRecommendationGenerated={(rec) => console.log('Recomendación generada:', rec)}
                  onExport={(data) => console.log('Datos exportados:', data)}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-6 h-6 text-yellow-600" />
                  Motor de Recomendaciones Inteligentes
                </CardTitle>
                <CardDescription>
                  Sistema de recomendaciones personalizadas basado en IA y machine learning
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RecommendationEngine
                  userId={userId}
                  onRecommendationSelected={handleRecommendationSelected}
                  onBookmark={(id) => console.log('Recomendación marcada:', id)}
                  onComplete={(id) => console.log('Recomendación completada:', id)}
                  onExport={(recommendations) => console.log('Recomendaciones exportadas:', recommendations)}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Información adicional */}
        <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Eye className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle className="text-lg">Detección Inteligente</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-muted-foreground">
                Evaluación automática de necesidades especiales con análisis de IA
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Globe className="w-6 h-6 text-green-600" />
              </div>
              <CardTitle className="text-lg">Adaptación Cultural</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-muted-foreground">
                Personalización según contextos culturales indígenas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Mic className="w-6 h-6 text-purple-600" />
              </div>
              <CardTitle className="text-lg">Voz Multilingüe</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-muted-foreground">
                Generación de voces en idiomas indígenas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Lightbulb className="w-6 h-6 text-yellow-600" />
              </div>
              <CardTitle className="text-lg">Recomendaciones IA</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-muted-foreground">
                Contenido personalizado con algoritmos de machine learning
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Características técnicas */}
        <div className="mt-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-6 h-6" />
                Características Técnicas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Tecnologías Utilizadas</h4>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      React 18 con TypeScript
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Tailwind CSS para estilos
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Lucide React para iconos
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Componentes UI reutilizables
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Hooks personalizados
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3">Funcionalidades de IA</h4>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-blue-600" />
                      Análisis de patrones de comportamiento
                    </li>
                    <li className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-blue-600" />
                      Detección automática de necesidades
                    </li>
                    <li className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-blue-600" />
                      Generación de recomendaciones inteligentes
                    </li>
                    <li className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-blue-600" />
                      Adaptación cultural automática
                    </li>
                    <li className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-blue-600" />
                      Síntesis de voz multilingüe
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            Plataforma Educativa Inclusiva con IA - Desarrollada para comunidades indígenas
          </p>
          <div className="flex items-center justify-center gap-4 mt-4">
            <Badge variant="outline">TypeScript</Badge>
            <Badge variant="outline">React</Badge>
            <Badge variant="outline">IA/ML</Badge>
            <Badge variant="outline">Accesibilidad</Badge>
            <Badge variant="outline">Inclusión</Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
