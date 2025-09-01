"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/ui/navbar"
import { Footer } from "@/components/ui/footer"
import Link from "next/link"
import { cn } from "@/lib/utils"

export default function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim()) {
      setError("Por favor ingresa tu email")
      return
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Por favor ingresa un email válido")
      return
    }

    setError("")
    setIsSubmitting(true)
    
    // Simular envío de email de recuperación
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setIsSubmitting(false)
    setIsSubmitted(true)
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Navbar />
        
        <div className="pt-24 pb-8">
          <div className="container mx-auto px-4">
            <div className="max-w-md mx-auto">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <CardContent className="p-8 text-center">
                  <div className="text-6xl mb-4">📧</div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    Email Enviado
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    Hemos enviado un enlace de recuperación a <strong>{email}</strong>. 
                    Revisa tu bandeja de entrada y sigue las instrucciones.
                  </p>
                  <div className="space-y-4">
                    <Button 
                      onClick={() => {
                        setIsSubmitted(false)
                        setEmail("")
                      }}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      Enviar Otro Email
                    </Button>
                    <Link href="/auth/login">
                      <Button variant="outline" className="w-full">
                        Volver al Login
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
        
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navbar />
      
      <div className="pt-24 pb-8">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Recuperar Contraseña
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Te ayudaremos a recuperar el acceso a tu cuenta
              </p>
            </div>

            {/* Main Form Card */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">¿Olvidaste tu contraseña?</CardTitle>
                <CardDescription>
                  Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value)
                        if (error) setError("")
                      }}
                      className={cn(
                        "w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                        error ? "border-red-500" : "border-gray-300"
                      )}
                      placeholder="tu@email.com"
                    />
                    {error && (
                      <p className="text-red-500 text-sm mt-1">{error}</p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Enviando email...</span>
                      </div>
                    ) : (
                      "Enviar Email de Recuperación"
                    )}
                  </Button>
                </form>

                {/* Back to Login */}
                <div className="text-center mt-6">
                  <Link href="/auth/login" className="text-blue-600 hover:underline">
                    ← Volver al inicio de sesión
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Help Section */}
            <div className="mt-8">
              <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    ¿Necesitas ayuda adicional?
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <span className="text-lg">📧</span>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          Contactar Soporte
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Nuestro equipo te ayudará personalmente
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <span className="text-lg">❓</span>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          Preguntas Frecuentes
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Encuentra respuestas rápidas
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <span className="text-lg">💬</span>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          Chat en Vivo
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Habla con un agente en tiempo real
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <Link 
                      href="/contact" 
                      className="text-blue-600 hover:underline text-sm font-medium"
                    >
                      Contactar Soporte →
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
