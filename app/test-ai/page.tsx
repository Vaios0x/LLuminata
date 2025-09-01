"use client"

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Navbar } from '@/components/ui/navbar';
import { Footer } from '@/components/ui/footer';
import { AIServicesIntegration, AITestPanel } from '@/components/ai';
import { 
  TestTube, 
  Zap, 
  Brain, 
  Volume2, 
  Mic, 
  Settings,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';

export default function TestAIPage() {
  const [activeTab, setActiveTab] = useState('integration');
  const [studentId] = useState('test-student-123');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navbar />
      
      <div className="pt-24 pb-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <TestTube className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                  Pruebas de Servicios de IA
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                  Verifica y prueba todos los servicios de inteligencia artificial
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="flex items-center gap-1">
                <Zap className="h-3 w-3" />
                Text-to-Speech
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Mic className="h-3 w-3" />
                Reconocimiento de Voz
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Brain className="h-3 w-3" />
                Detección de Necesidades
              </Badge>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="integration" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Integración Completa
              </TabsTrigger>
              <TabsTrigger value="testing" className="flex items-center gap-2">
                <TestTube className="h-4 w-4" />
                Panel de Pruebas
              </TabsTrigger>
            </TabsList>

            <TabsContent value="integration" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Integración de Servicios de IA
                  </CardTitle>
                  <p className="text-muted-foreground">
                    Interfaz completa para probar todos los servicios de IA integrados
                  </p>
                </CardHeader>
                <CardContent>
                  <AIServicesIntegration 
                    studentId={studentId}
                    language="es-MX"
                    culturalContext="maya"
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="testing" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TestTube className="h-5 w-5" />
                    Panel de Pruebas Automatizadas
                  </CardTitle>
                  <p className="text-muted-foreground">
                    Suite de pruebas automatizadas para verificar el funcionamiento de cada servicio
                  </p>
                </CardHeader>
                <CardContent>
                  <AITestPanel 
                    studentId={studentId}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Información adicional */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Volume2 className="h-5 w-5 text-blue-600" />
                  Text-to-Speech
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Síntesis multilingüe</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Adaptación cultural</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Caché inteligente</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Múltiples proveedores</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mic className="h-5 w-5 text-green-600" />
                  Reconocimiento de Voz
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Comandos de voz</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Interpretación con IA</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Coincidencia difusa</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Contexto cultural</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-600" />
                  Detección de Necesidades
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Análisis multimodal</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>ML + IA + Reglas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Perfil de aprendizaje</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Adaptación cultural</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Estado del sistema */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Estado del Sistema
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div>
                    <div className="font-medium">API TTS</div>
                    <div className="text-sm text-muted-foreground">Operativo</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div>
                    <div className="font-medium">API Reconocimiento</div>
                    <div className="text-sm text-muted-foreground">Operativo</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div>
                    <div className="font-medium">API Detección</div>
                    <div className="text-sm text-muted-foreground">Operativo</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div>
                    <div className="font-medium">Base de Datos</div>
                    <div className="text-sm text-muted-foreground">Conectado</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}
