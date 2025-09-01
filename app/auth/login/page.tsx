"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/ui/navbar"
import { Footer } from "@/components/ui/footer"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/hooks/useAuth"
import { useRouter } from "next/navigation"
import { demoUsers, type DemoUser } from "@/lib/demo-users"

export default function Login() {
  const { login, loginWithProvider } = useAuth()
  const router = useRouter()
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [showDemoSelector, setShowDemoSelector] = useState(false)
  const [selectedRole, setSelectedRole] = useState<'student' | 'teacher' | 'admin' | 'parent'>('student')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }))
    }
  }

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    if (!formData.email.trim()) {
      newErrors.email = "El email es requerido"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "El email no es válido"
    }

    if (!formData.password) {
      newErrors.password = "La contraseña es requerida"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    
    try {
      const result = await login(formData.email, formData.password, formData.rememberMe)
      
      if (result.success) {
        router.push("/dashboard")
      } else {
        setErrors({ general: result.error || "Error de autenticación" })
      }
    } catch (error) {
      setErrors({ general: "Error inesperado" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSocialLogin = async (provider: "google" | "facebook") => {
    try {
      await loginWithProvider(provider)
    } catch (error) {
      setErrors({ general: `Error iniciando sesión con ${provider}` })
    }
  }

  const handleDemoLogin = (demoUser: DemoUser) => {
    setFormData({
      email: demoUser.email,
      password: demoUser.password,
      rememberMe: false
    })
    setShowDemoSelector(false)
  }

  const getDemoUsersByRole = (role: DemoUser['role']) => {
    return demoUsers.filter(user => user.role === role)
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
                Bienvenido de Vuelta
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Continúa tu viaje de aprendizaje personalizado
              </p>
            </div>

            {/* Main Form Card */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Iniciar Sesión</CardTitle>
                <CardDescription>
                  Ingresa tus credenciales para acceder a tu cuenta
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Error General */}
                  {errors.general && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                      {errors.general}
                    </div>
                  )}

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={cn(
                        "w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                        errors.email ? "border-red-500" : "border-gray-300"
                      )}
                      placeholder="tu@email.com"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                    )}
                  </div>

                  {/* Password */}
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Contraseña
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className={cn(
                          "w-full px-4 py-3 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                          errors.password ? "border-red-500" : "border-gray-300"
                        )}
                        placeholder="Tu contraseña"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? "🙈" : "👁️"}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                    )}
                  </div>

                  {/* Remember Me & Forgot Password */}
                  <div className="flex items-center justify-between">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        name="rememberMe"
                        checked={formData.rememberMe}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Recordarme
                      </span>
                    </label>
                    <Link 
                      href="/auth/forgot-password" 
                      className="text-sm text-blue-600 hover:underline"
                    >
                      ¿Olvidaste tu contraseña?
                    </Link>
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
                        <span>Iniciando sesión...</span>
                      </div>
                    ) : (
                      "Iniciar Sesión"
                    )}
                  </Button>
                </form>

                {/* Divider */}
                <div className="my-6 flex items-center">
                  <div className="flex-1 border-t border-gray-300"></div>
                  <span className="px-4 text-gray-500 text-sm">o continúa con</span>
                  <div className="flex-1 border-t border-gray-300"></div>
                </div>

                {/* Social Login */}
                <div className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full flex items-center justify-center space-x-2"
                    onClick={() => handleSocialLogin("facebook")}
                    disabled={isSubmitting}
                  >
                    <span>📘</span>
                    <span>Continuar con Facebook</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full flex items-center justify-center space-x-2"
                    onClick={() => handleSocialLogin("google")}
                    disabled={isSubmitting}
                  >
                    <span>📧</span>
                    <span>Continuar con Google</span>
                  </Button>
                </div>

                {/* Sign Up Link */}
                <div className="text-center mt-6">
                  <p className="text-gray-600 dark:text-gray-400">
                    ¿No tienes una cuenta?{" "}
                    <Link href="/auth/signup" className="text-blue-600 hover:underline font-medium">
                      Regístrate aquí
                    </Link>
                  </p>
                </div>

                {/* Demo Login Button */}
                <div className="text-center mt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowDemoSelector(!showDemoSelector)}
                    className="w-full text-green-600 border-green-300 hover:bg-green-50"
                  >
                    🚀 Probar Demo
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Demo User Selector */}
            {showDemoSelector && (
              <Card className="mt-6 bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader className="text-center">
                  <CardTitle className="text-xl text-green-700">👥 Usuarios de Demo</CardTitle>
                  <CardDescription>
                    Selecciona un perfil para probar la aplicación
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Role Selector */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Tipo de Usuario:
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {(['student', 'teacher', 'admin', 'parent'] as const).map((role) => (
                        <Button
                          key={role}
                          variant={selectedRole === role ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedRole(role)}
                          className="text-xs"
                        >
                          {role === 'student' && '👨‍🎓'}
                          {role === 'teacher' && '👩‍🏫'}
                          {role === 'admin' && '👨‍💼'}
                          {role === 'parent' && '👩'}
                          {' '}
                          {role === 'student' && 'Estudiante'}
                          {role === 'teacher' && 'Profesor'}
                          {role === 'admin' && 'Admin'}
                          {role === 'parent' && 'Padre'}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* User List */}
                  <div className="space-y-3">
                    {getDemoUsersByRole(selectedRole).map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => handleDemoLogin(user)}
                      >
                        <div className="text-2xl mr-3">{user.avatar}</div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{user.profile}</h4>
                          <p className="text-sm text-gray-600">{user.description}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {user.culturalContext && user.culturalContext !== 'general' && (
                              <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded mr-2">
                                {user.culturalContext}
                              </span>
                            )}
                            {user.email}
                          </p>
                        </div>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          Usar
                        </Button>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 text-center">
                    <p className="text-xs text-gray-500">
                      💡 Todos los usuarios de demo usan la contraseña: <strong>demo123</strong>
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Additional Info */}
            <div className="mt-8 text-center">
              <div className="bg-white/60 backdrop-blur-sm rounded-lg p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  ¿Necesitas ayuda?
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Nuestro equipo está aquí para ayudarte con cualquier problema
                </p>
                <div className="space-y-2">
                  <Link 
                    href="/contact" 
                    className="block text-blue-600 hover:underline text-sm"
                  >
                    📧 Contactar Soporte
                  </Link>
                  <Link 
                    href="/faq" 
                    className="block text-blue-600 hover:underline text-sm"
                  >
                    ❓ Preguntas Frecuentes
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
