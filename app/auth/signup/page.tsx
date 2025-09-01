"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/ui/navbar"
import { Footer } from "@/components/ui/footer"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/hooks/useAuth"

export default function SignUp() {
  const { register, loginWithProvider } = useAuth()
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    language: "",
    age: "",
    education: "",
    agreeToTerms: false
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined
    
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

    if (!formData.firstName.trim()) {
      newErrors.firstName = "El nombre es requerido"
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "El apellido es requerido"
    }

    if (!formData.email.trim()) {
      newErrors.email = "El email es requerido"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "El email no es válido"
    }

    if (!formData.password) {
      newErrors.password = "La contraseña es requerida"
    } else if (formData.password.length < 8) {
      newErrors.password = "La contraseña debe tener al menos 8 caracteres"
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Confirma tu contraseña"
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden"
    }

    if (!formData.language) {
      newErrors.language = "Selecciona tu idioma preferido"
    }

    if (!formData.age) {
      newErrors.age = "Selecciona tu rango de edad"
    }

    if (!formData.education) {
      newErrors.education = "Selecciona tu nivel educativo"
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = "Debes aceptar los términos y condiciones"
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
      const result = await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        language: formData.language,
        age: formData.age,
        education: formData.education,
      })
      
      if (!result.success) {
        setErrors({ general: result.error || "Error en el registro" })
      }
    } catch (error) {
      setErrors({ general: "Error inesperado" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSocialSignup = async (provider: "google" | "facebook") => {
    try {
      await loginWithProvider(provider)
    } catch (error) {
      setErrors({ general: `Error registrándose con ${provider}` })
    }
  }

  const languages = [
    { value: "es", label: "Español" },
    { value: "en", label: "English" },
    { value: "maya", label: "Maya" },
    { value: "nahuatl", label: "Náhuatl" },
    { value: "mixteco", label: "Mixteco" },
    { value: "zapoteco", label: "Zapoteco" }
  ]

  const ageRanges = [
    { value: "5-12", label: "5-12 años" },
    { value: "13-17", label: "13-17 años" },
    { value: "18-25", label: "18-25 años" },
    { value: "26-35", label: "26-35 años" },
    { value: "36-50", label: "36-50 años" },
    { value: "50+", label: "50+ años" }
  ]

  const educationLevels = [
    { value: "primaria", label: "Primaria" },
    { value: "secundaria", label: "Secundaria" },
    { value: "preparatoria", label: "Preparatoria" },
    { value: "universidad", label: "Universidad" },
    { value: "posgrado", label: "Posgrado" },
    { value: "otro", label: "Otro" }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navbar />
      
      <div className="pt-24 pb-8">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Únete a IA Inclusiva
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Comienza tu viaje de aprendizaje personalizado
              </p>
            </div>

            {/* Main Form Card */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Crear Cuenta</CardTitle>
                <CardDescription>
                  Completa el formulario para comenzar tu experiencia de aprendizaje
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

                  {/* Name Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Nombre *
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className={cn(
                          "w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                          errors.firstName ? "border-red-500" : "border-gray-300"
                        )}
                        placeholder="Tu nombre"
                      />
                      {errors.firstName && (
                        <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Apellido *
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className={cn(
                          "w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                          errors.lastName ? "border-red-500" : "border-gray-300"
                        )}
                        placeholder="Tu apellido"
                      />
                      {errors.lastName && (
                        <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
                      )}
                    </div>
                  </div>

                  {/* Email */}
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

                  {/* Password Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Contraseña *
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
                          placeholder="Mínimo 8 caracteres"
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
                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Confirmar Contraseña *
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          id="confirmPassword"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          className={cn(
                            "w-full px-4 py-3 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                            errors.confirmPassword ? "border-red-500" : "border-gray-300"
                          )}
                          placeholder="Repite tu contraseña"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showConfirmPassword ? "🙈" : "👁️"}
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
                      )}
                    </div>
                  </div>

                  {/* Preferences */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="language" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Idioma Preferido *
                      </label>
                      <select
                        id="language"
                        name="language"
                        value={formData.language}
                        onChange={handleInputChange}
                        className={cn(
                          "w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                          errors.language ? "border-red-500" : "border-gray-300"
                        )}
                      >
                        <option value="">Selecciona idioma</option>
                        {languages.map((lang) => (
                          <option key={lang.value} value={lang.value}>
                            {lang.label}
                          </option>
                        ))}
                      </select>
                      {errors.language && (
                        <p className="text-red-500 text-sm mt-1">{errors.language}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="age" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Edad *
                      </label>
                      <select
                        id="age"
                        name="age"
                        value={formData.age}
                        onChange={handleInputChange}
                        className={cn(
                          "w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                          errors.age ? "border-red-500" : "border-gray-300"
                        )}
                      >
                        <option value="">Rango de edad</option>
                        {ageRanges.map((age) => (
                          <option key={age.value} value={age.value}>
                            {age.label}
                          </option>
                        ))}
                      </select>
                      {errors.age && (
                        <p className="text-red-500 text-sm mt-1">{errors.age}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="education" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Educación *
                      </label>
                      <select
                        id="education"
                        name="education"
                        value={formData.education}
                        onChange={handleInputChange}
                        className={cn(
                          "w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                          errors.education ? "border-red-500" : "border-gray-300"
                        )}
                      >
                        <option value="">Nivel educativo</option>
                        {educationLevels.map((edu) => (
                          <option key={edu.value} value={edu.value}>
                            {edu.label}
                          </option>
                        ))}
                      </select>
                      {errors.education && (
                        <p className="text-red-500 text-sm mt-1">{errors.education}</p>
                      )}
                    </div>
                  </div>

                  {/* Terms and Conditions */}
                  <div>
                    <label className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        name="agreeToTerms"
                        checked={formData.agreeToTerms}
                        onChange={handleInputChange}
                        className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <div className="text-sm text-gray-700 dark:text-gray-300">
                        <span>Acepto los </span>
                        <Link href="/terms" className="text-blue-600 hover:underline">
                          Términos y Condiciones
                        </Link>
                        <span> y la </span>
                        <Link href="/privacy" className="text-blue-600 hover:underline">
                          Política de Privacidad
                        </Link>
                        <span> *</span>
                      </div>
                    </label>
                    {errors.agreeToTerms && (
                      <p className="text-red-500 text-sm mt-1">{errors.agreeToTerms}</p>
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
                        <span>Creando cuenta...</span>
                      </div>
                    ) : (
                      "Crear Cuenta"
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
                <div className="grid grid-cols-2 gap-4">
                  <Button 
                    variant="outline" 
                    className="flex items-center space-x-2"
                    onClick={() => handleSocialSignup("facebook")}
                    disabled={isSubmitting}
                  >
                    <span>📘</span>
                    <span>Facebook</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex items-center space-x-2"
                    onClick={() => handleSocialSignup("google")}
                    disabled={isSubmitting}
                  >
                    <span>📧</span>
                    <span>Google</span>
                  </Button>
                </div>

                {/* Login Link */}
                <div className="text-center mt-6">
                  <p className="text-gray-600 dark:text-gray-400">
                    ¿Ya tienes una cuenta?{" "}
                    <Link href="/auth/login" className="text-blue-600 hover:underline font-medium">
                      Inicia sesión
                    </Link>
                  </p>
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
