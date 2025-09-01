"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/ui/navbar"
import { Footer } from "@/components/ui/footer"
import { cn } from "@/lib/utils"

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simular envío del formulario
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setIsSubmitting(false)
    setIsSubmitted(true)
    
    // Resetear formulario después de 3 segundos
    setTimeout(() => {
      setIsSubmitted(false)
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: ""
      })
    }, 3000)
  }

  const contactInfo = [
    {
      icon: "📧",
      title: "Email",
      value: "hola@iainclusiva.com",
      description: "Responde en 24 horas"
    },
    {
      icon: "📱",
      title: "WhatsApp",
      value: "+52 55 1234 5678",
      description: "Atención inmediata"
    },
    {
      icon: "📍",
      title: "Oficina",
      value: "Ciudad de México",
      description: "Av. Insurgentes Sur 1234"
    },
    {
      icon: "⏰",
      title: "Horarios",
      value: "Lun - Vie: 9:00 - 18:00",
      description: "GMT-6 (México)"
    }
  ]

  const faqs = [
    {
      question: "¿Cómo funciona la IA adaptativa?",
      answer: "Nuestra IA analiza el progreso y estilo de aprendizaje de cada estudiante para personalizar el contenido y la dificultad de las lecciones."
    },
    {
      question: "¿Qué idiomas soportan?",
      answer: "Actualmente soportamos 15 idiomas, incluyendo español, inglés, maya, náhuatl y otros idiomas indígenas de México."
    },
    {
      question: "¿Es gratuito?",
      answer: "Ofrecemos contenido gratuito limitado y planes premium con acceso completo a todas las funcionalidades."
    },
    {
      question: "¿Cómo puedo reportar un problema técnico?",
      answer: "Puedes usar este formulario de contacto o escribir directamente a soporte@iainclusiva.com"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navbar />
      
      <div className="pt-24 pb-8">
        <div className="container mx-auto px-4">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Contáctanos
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              ¿Tienes preguntas, sugerencias o necesitas ayuda? Estamos aquí para ayudarte. 
              Nuestro equipo está listo para responder todas tus consultas.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-2xl">Envíanos un Mensaje</CardTitle>
                  <CardDescription>
                    Completa el formulario y nos pondremos en contacto contigo lo antes posible
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isSubmitted ? (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">✅</div>
                      <h3 className="text-2xl font-semibold text-green-600 mb-2">
                        ¡Mensaje Enviado!
                      </h3>
                      <p className="text-gray-600">
                        Gracias por contactarnos. Te responderemos en las próximas 24 horas.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Nombre Completo *
                          </label>
                          <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Tu nombre completo"
                          />
                        </div>
                        <div>
                          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Email *
                          </label>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="tu@email.com"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Asunto *
                        </label>
                        <select
                          id="subject"
                          name="subject"
                          value={formData.subject}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Selecciona un asunto</option>
                          <option value="general">Consulta General</option>
                          <option value="technical">Soporte Técnico</option>
                          <option value="partnership">Alianzas y Colaboraciones</option>
                          <option value="feedback">Sugerencias y Feedback</option>
                          <option value="billing">Facturación</option>
                          <option value="other">Otro</option>
                        </select>
                      </div>
                      
                      <div>
                        <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Mensaje *
                        </label>
                        <textarea
                          id="message"
                          name="message"
                          value={formData.message}
                          onChange={handleInputChange}
                          required
                          rows={6}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                          placeholder="Cuéntanos cómo podemos ayudarte..."
                        ></textarea>
                      </div>
                      
                      <Button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      >
                        {isSubmitting ? (
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Enviando...</span>
                          </div>
                        ) : (
                          "Enviar Mensaje"
                        )}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Contact Info */}
            <div className="space-y-6">
              {contactInfo.map((info, index) => (
                <Card key={index} className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="text-3xl">{info.icon}</div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                          {info.title}
                        </h3>
                        <p className="text-blue-600 font-medium mb-1">{info.value}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {info.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">
              Preguntas Frecuentes
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {faqs.map((faq, index) => (
                <Card key={index} className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                      {faq.question}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      {faq.answer}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Map Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">
              Nuestra Ubicación
            </h2>
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardContent className="p-0">
                <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🗺️</div>
                    <p className="text-gray-600">Mapa Interactivo</p>
                    <p className="text-sm text-gray-500">Av. Insurgentes Sur 1234, Ciudad de México</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Social Media */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Síguenos en Redes Sociales
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              Mantente actualizado con las últimas noticias y actualizaciones
            </p>
            <div className="flex justify-center space-x-6">
              <Button variant="outline" size="lg" className="flex items-center space-x-2">
                <span>📘</span>
                <span>Facebook</span>
              </Button>
              <Button variant="outline" size="lg" className="flex items-center space-x-2">
                <span>🐦</span>
                <span>Twitter</span>
              </Button>
              <Button variant="outline" size="lg" className="flex items-center space-x-2">
                <span>📸</span>
                <span>Instagram</span>
              </Button>
              <Button variant="outline" size="lg" className="flex items-center space-x-2">
                <span>💼</span>
                <span>LinkedIn</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
