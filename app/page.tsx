'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";
import { ChatbotWidget } from "@/components/ui/chatbot-widget";



export default function Home() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');

  useEffect(() => {
    setIsVisible(true);
    
    const handleScroll = () => {
      const sections = ['hero', 'features', 'benefits', 'populations', 'technology', 'stats', 'testimonials', 'pricing', 'cta'];
      const scrollPosition = window.scrollY + 100;
      
      sections.forEach(section => {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
          }
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navbar />
      
      {/* Hero Section */}
      <section id="hero" className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-6 bg-blue-100 text-blue-800 hover:bg-blue-200">
                                   🚀 Revolucionando la Educación con Lluminata
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Educación Inclusiva
              </span>
              <br />
              <span className="text-gray-800">con IA Avanzada</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-12 leading-relaxed max-w-3xl mx-auto">
              Democratizando el aprendizaje para poblaciones vulnerables con inteligencia artificial 
              que se adapta a cada estudiante, funcionamiento offline y accesibilidad total.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-4">
                🎓 Comenzar Gratis
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 py-4">
                🎬 Ver Demo
              </Button>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">50K+</div>
                <div className="text-gray-600">Estudiantes Activos</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-purple-600 mb-2">15+</div>
                <div className="text-gray-600">Países</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-green-600 mb-2">95%</div>
                <div className="text-gray-600">Satisfacción</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-orange-600 mb-2">24/7</div>
                <div className="text-gray-600">Soporte IA</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-blue-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-purple-200 rounded-full opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-20 w-12 h-12 bg-green-200 rounded-full opacity-20 animate-pulse delay-2000"></div>
      </section>



      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-green-100 text-green-800">✨ Características Principales</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Tecnología que Transforma Vidas
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Nuestra plataforma combina IA avanzada con diseño inclusivo para crear 
              experiencias de aprendizaje personalizadas y accesibles.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <span className="text-2xl">🧠</span>
                </div>
                <CardTitle className="text-xl">IA Adaptativa</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Detecta automáticamente necesidades especiales y adapta el contenido 
                  según el estilo de aprendizaje individual con 98.5% de precisión.
                </p>
              </CardContent>
            </Card>
            
            <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <span className="text-2xl">🌍</span>
                </div>
                <CardTitle className="text-xl">Contenido Cultural</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Adaptación cultural para comunidades indígenas, afrodescendientes 
                  y poblaciones rurales con soporte multilingüe completo.
                </p>
              </CardContent>
            </Card>
            
            <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <span className="text-2xl">📱</span>
                </div>
                <CardTitle className="text-xl">Funcionamiento Offline</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Sincronización inteligente que permite aprender sin conexión 
                  y sincronizar automáticamente cuando hay internet.
                </p>
              </CardContent>
            </Card>
            
            <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <span className="text-2xl">♿</span>
                </div>
                <CardTitle className="text-xl">Accesibilidad Total</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Soporte para lectores de pantalla, navegación por teclado, 
                  subtítulos y descripciones de audio con diseño universal.
                </p>
              </CardContent>
            </Card>
            
            <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <span className="text-2xl">🎯</span>
                </div>
                <CardTitle className="text-xl">Aprendizaje Personalizado</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Rutas de aprendizaje adaptativas basadas en el progreso 
                  y preferencias del estudiante con tiempo de respuesta de 0.3s.
                </p>
              </CardContent>
            </Card>
            
            <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <span className="text-2xl">📊</span>
                </div>
                <CardTitle className="text-xl">Analytics Avanzados</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Seguimiento detallado del progreso con insights 
                  para mejorar el aprendizaje y reducir la carga administrativa.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-blue-100 text-blue-800">🎯 Beneficios</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Beneficios para Todos
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Nuestra plataforma beneficia a estudiantes, educadores y comunidades enteras.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-8">
              <h3 className="text-3xl font-bold text-blue-600 mb-8">Para Estudiantes</h3>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-green-600 text-lg">✓</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-2">Aprendizaje Personalizado</h4>
                    <p className="text-gray-600">Contenido adaptado a su ritmo y estilo de aprendizaje individual</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-green-600 text-lg">✓</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-2">Contenido Accesible</h4>
                    <p className="text-gray-600">Múltiples formatos y tecnologías asistivas integradas</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-green-600 text-lg">✓</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-2">Soporte 24/7</h4>
                    <p className="text-gray-600">Asistente de IA disponible en cualquier momento</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-green-600 text-lg">✓</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-2">Progreso Visible</h4>
                    <p className="text-gray-600">Motivación constante con seguimiento detallado</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-8">
              <h3 className="text-3xl font-bold text-purple-600 mb-8">Para Educadores</h3>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-purple-600 text-lg">✓</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-2">Evaluación Automática</h4>
                    <p className="text-gray-600">Herramientas inteligentes que reducen la carga administrativa</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-purple-600 text-lg">✓</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-2">Insights Detallados</h4>
                    <p className="text-gray-600">Análisis profundo del progreso estudiantil</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-purple-600 text-lg">✓</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-2">Contenido Adaptable</h4>
                    <p className="text-gray-600">Herramientas para crear contenido contextualizado</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-purple-600 text-lg">✓</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-2">Eficiencia Operativa</h4>
                    <p className="text-gray-600">Reducción significativa de tareas administrativas</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Populations Section */}
      <section id="populations" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-orange-100 text-orange-800">🎯 Poblaciones Objetivo</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Poblaciones Vulnerables
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Nos enfocamos en comunidades que tradicionalmente han sido excluidas 
              de oportunidades educativas de calidad.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center hover:shadow-xl transition-all duration-300 border-0 shadow-lg group">
              <CardHeader>
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <span className="text-3xl">🏘️</span>
                </div>
                <CardTitle className="text-xl">Comunidades Rurales</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Acceso educativo en áreas con conectividad limitada y contenido 
                  adaptado a contextos rurales.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center hover:shadow-xl transition-all duration-300 border-0 shadow-lg group">
              <CardHeader>
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <span className="text-3xl">👥</span>
                </div>
                <CardTitle className="text-xl">Pueblos Indígenas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Contenido culturalmente relevante con soporte para lenguas originarias 
                  y respeto por cosmovisiones tradicionales.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center hover:shadow-xl transition-all duration-300 border-0 shadow-lg group">
              <CardHeader>
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <span className="text-3xl">♿</span>
                </div>
                <CardTitle className="text-xl">Personas con Discapacidad</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Diseño universal y tecnologías asistivas con navegación accesible 
                  completa y adaptaciones específicas.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center hover:shadow-xl transition-all duration-300 border-0 shadow-lg group">
              <CardHeader>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <span className="text-3xl">🌱</span>
                </div>
                <CardTitle className="text-xl">Jóvenes en Riesgo</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Programas de desarrollo de habilidades, orientación vocacional 
                  y prevención de deserción escolar.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section id="technology" className="py-20 bg-gradient-to-r from-gray-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-indigo-100 text-indigo-800">⚡ Tecnología</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Tecnología de Vanguardia
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Utilizamos las últimas tecnologías de IA y machine learning 
              para crear experiencias educativas únicas.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold mb-8">Stack Tecnológico</h3>
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
                  <div>
                    <h4 className="font-semibold text-lg">Machine Learning Avanzado</h4>
                    <p className="text-gray-600">Múltiples modelos especializados para educación inclusiva</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-4 h-4 bg-purple-600 rounded-full"></div>
                  <div>
                    <h4 className="font-semibold text-lg">Procesamiento de Lenguaje Natural</h4>
                    <p className="text-gray-600">Interacciones naturales y contextuales</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-4 h-4 bg-green-600 rounded-full"></div>
                  <div>
                    <h4 className="font-semibold text-lg">Computer Vision</h4>
                    <p className="text-gray-600">Análisis de contenido visual y accesibilidad</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-4 h-4 bg-red-600 rounded-full"></div>
                  <div>
                    <h4 className="font-semibold text-lg">Análisis de Datos en Tiempo Real</h4>
                    <p className="text-gray-600">Personalización instantánea del aprendizaje</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-4 h-4 bg-yellow-600 rounded-full"></div>
                  <div>
                    <h4 className="font-semibold text-lg">Cloud Computing Distribuido</h4>
                    <p className="text-gray-600">Escalabilidad global y alta disponibilidad</p>
                  </div>
                </div>
              </div>
            </div>
            
            <Card className="p-8 border-0 shadow-xl">
              <h3 className="text-2xl font-bold mb-6">Estadísticas de Rendimiento</h3>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">Precisión de IA</span>
                    <span className="font-bold text-blue-600">98.5%</span>
                  </div>
                  <Progress value={98.5} className="h-3" />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">Tiempo de Respuesta</span>
                    <span className="font-bold text-green-600">0.3s</span>
                  </div>
                  <Progress value={95} className="h-3" />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">Disponibilidad</span>
                    <span className="font-bold text-purple-600">99.9%</span>
                  </div>
                  <Progress value={99.9} className="h-3" />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">Satisfacción</span>
                    <span className="font-bold text-orange-600">95%</span>
                  </div>
                  <Progress value={95} className="h-3" />
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Impacto Real
            </h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Nuestros números hablan por sí solos del impacto que estamos generando 
              en la educación de América Latina.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-yellow-300 mb-2">50K+</div>
              <div className="text-blue-100">Estudiantes Activos</div>
              <div className="text-sm text-blue-200 mt-2">En 15+ países</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-yellow-300 mb-2">2K+</div>
              <div className="text-blue-100">Educadores</div>
              <div className="text-sm text-blue-200 mt-2">Utilizando la plataforma</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-yellow-300 mb-2">95%</div>
              <div className="text-blue-100">Satisfacción</div>
              <div className="text-sm text-blue-200 mt-2">De usuarios</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-yellow-300 mb-2">99.9%</div>
              <div className="text-blue-100">Disponibilidad</div>
              <div className="text-sm text-blue-200 mt-2">Del sistema</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-green-100 text-green-800">💬 Testimonios</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Lo que Dicen Nuestros Usuarios
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Historias reales de transformación educativa en América Latina.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-blue-600 font-bold">M</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">María González</h4>
                    <p className="text-sm text-gray-500">Estudiante, Guatemala</p>
                  </div>
                </div>
                <p className="text-gray-600 italic">
                  "Gracias a Lluminata, puedo estudiar en mi idioma maya y 
                  el contenido se adapta perfectamente a mi ritmo de aprendizaje."
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-purple-600 font-bold">C</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">Carlos Rodríguez</h4>
                    <p className="text-sm text-gray-500">Educador, México</p>
                  </div>
                </div>
                <p className="text-gray-600 italic">
                  "La plataforma me ha ayudado a reducir mi carga administrativa 
                  y a entender mejor las necesidades de mis estudiantes."
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-green-600 font-bold">A</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">Ana Silva</h4>
                    <p className="text-sm text-gray-500">Estudiante con discapacidad, Brasil</p>
                  </div>
                </div>
                <p className="text-gray-600 italic">
                  "Por primera vez puedo estudiar de forma independiente. 
                  La accesibilidad es increíble y el contenido es excelente."
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-blue-100 text-blue-800">💰 Precios</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Acceso Gratuito para Todos
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Creemos que la educación de calidad debe ser accesible para todos, 
              especialmente para las poblaciones más vulnerables.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="border-2 border-blue-200 shadow-xl relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-blue-600 text-white px-4 py-2">Más Popular</Badge>
              </div>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Plan Gratuito</CardTitle>
                <div className="text-4xl font-bold text-blue-600">$0</div>
                <p className="text-gray-600">Para siempre</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center">
                    <span className="text-green-600 mr-2">✓</span>
                    Acceso completo a todas las características
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-600 mr-2">✓</span>
                    IA adaptativa personalizada
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-600 mr-2">✓</span>
                    Funcionamiento offline completo
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-600 mr-2">✓</span>
                    Soporte 24/7 con chatbot IA
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-600 mr-2">✓</span>
                    Contenido cultural adaptado
                  </li>
                </ul>
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  Comenzar Gratis
                </Button>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-purple-200 shadow-xl">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Plan Premium</CardTitle>
                <div className="text-4xl font-bold text-purple-600">$29</div>
                <p className="text-gray-600">Por mes</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center">
                    <span className="text-green-600 mr-2">✓</span>
                    Todo del plan gratuito
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-600 mr-2">✓</span>
                    Analytics avanzados
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-600 mr-2">✓</span>
                    Soporte prioritario
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-600 mr-2">✓</span>
                    Capacitación personalizada
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-600 mr-2">✓</span>
                    API y integraciones
                  </li>
                </ul>
                <Button variant="outline" className="w-full border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white">
                  Contactar Ventas
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="cta" className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            ¿Listo para Transformar la Educación?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Únete a miles de estudiantes y educadores que ya están revolucionando 
            el aprendizaje con IA inclusiva.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-4">
              🚀 Comenzar Ahora
            </Button>
            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-blue-600 text-lg px-8 py-4">
              📞 Contactar Equipo
            </Button>
          </div>
        </div>
      </section>

                   <Footer />
             <ChatbotWidget />
    </div>
  );
}
