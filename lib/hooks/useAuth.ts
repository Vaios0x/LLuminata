import { useSession, signIn, signOut, getSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { getDemoUserByEmail, type DemoUser } from "@/lib/demo-users"

export interface AuthUser {
  id: string
  email: string
  name: string
  role: string
  image?: string
  profile?: {
    region?: string
    age?: number
    education?: string
    interests?: string[]
    accessibility?: string[]
  }
  preferences?: {
    language?: string
    theme?: string
    fontSize?: number
    audioEnabled?: boolean
    visualAids?: boolean
  }
}

export function useAuth() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isDemoUser, setIsDemoUser] = useState(false)

  useEffect(() => {
    if (status === "loading") {
      setIsLoading(true)
    } else {
      setIsLoading(false)
      if (session?.user) {
        setUser({
          id: session.user.id || "",
          email: session.user.email || "",
          name: session.user.name || "",
          role: session.user.role || "STUDENT",
          image: session.user.image || undefined,
        })
        setIsDemoUser(false)
      } else {
        // Verificar si hay un usuario demo en localStorage
        const demoUserStr = localStorage.getItem('demo-user')
        const isDemo = localStorage.getItem('is-demo-user')
        
        if (demoUserStr && isDemo === 'true') {
          try {
            const demoUser = JSON.parse(demoUserStr)
            setUser(demoUser)
            setIsDemoUser(true)
          } catch (error) {
            console.error('Error parsing demo user:', error)
            setUser(null)
            setIsDemoUser(false)
          }
        } else {
          setUser(null)
          setIsDemoUser(false)
        }
      }
    }
  }, [session, status])

  const login = async (email: string, password: string, rememberMe?: boolean) => {
    try {
      // Verificar si es un usuario de demo
      const demoUser = getDemoUserByEmail(email)
      if (demoUser && password === demoUser.password) {
        // Simular login exitoso para usuario demo
        const demoAuthUser: AuthUser = {
          id: demoUser.id,
          email: demoUser.email,
          name: demoUser.name,
          role: demoUser.role.toUpperCase(),
          image: demoUser.avatar,
          profile: {
            region: demoUser.culturalContext,
            accessibility: demoUser.preferences?.accessibility ? [
              demoUser.preferences.accessibility.contrast,
              demoUser.preferences.accessibility.voiceEnabled ? 'voice' : ''
            ].filter(Boolean) : []
          },
          preferences: {
            language: demoUser.language,
            fontSize: demoUser.preferences?.accessibility.fontSize,
            audioEnabled: demoUser.preferences?.accessibility.voiceEnabled
          }
        }
        
        setUser(demoAuthUser)
        setIsDemoUser(true)
        setIsLoading(false)
        
        // Guardar en localStorage para persistencia
        localStorage.setItem('demo-user', JSON.stringify(demoAuthUser))
        localStorage.setItem('is-demo-user', 'true')
        
        return { success: true }
      }

      // Login normal con NextAuth
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        throw new Error(result.error)
      }

      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Error de autenticación" 
      }
    }
  }

  const loginWithProvider = async (provider: "google" | "facebook") => {
    try {
      await signIn(provider, { callbackUrl: "/dashboard" })
    } catch (error) {
      console.error(`Error iniciando sesión con ${provider}:`, error)
    }
  }

  const register = async (userData: {
    firstName: string
    lastName: string
    email: string
    password: string
    language: string
    age: string
    education: string
  }) => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error en el registro")
      }

      // Iniciar sesión automáticamente después del registro
      const loginResult = await login(userData.email, userData.password)
      
      if (loginResult.success) {
        router.push("/dashboard")
      }

      return { success: true, data }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Error en el registro" 
      }
    }
  }

  const logout = async () => {
    try {
      if (isDemoUser) {
        // Limpiar datos de demo
        localStorage.removeItem('demo-user')
        localStorage.removeItem('is-demo-user')
        setUser(null)
        setIsDemoUser(false)
        router.push("/")
      } else {
        await signOut({ redirect: false })
        router.push("/")
      }
    } catch (error) {
      console.error("Error cerrando sesión:", error)
    }
  }

  const checkAuth = async () => {
    try {
      const session = await getSession()
      if (session) return true
      
      // Verificar si hay usuario demo
      const demoUserStr = localStorage.getItem('demo-user')
      const isDemo = localStorage.getItem('is-demo-user')
      return !!(demoUserStr && isDemo === 'true')
    } catch (error) {
      console.error("Error verificando autenticación:", error)
      return false
    }
  }

  const requireAuth = (redirectTo: string = "/auth/login") => {
    useEffect(() => {
      if (status === "unauthenticated") {
        router.push(redirectTo)
      }
    }, [status, router, redirectTo])
  }

  const requireRole = (requiredRole: string, redirectTo: string = "/dashboard") => {
    useEffect(() => {
      if (status === "authenticated" && user?.role !== requiredRole) {
        router.push(redirectTo)
      }
    }, [status, user, router, redirectTo, requiredRole])
  }

  return {
    user,
    session,
    status,
    isLoading,
    isDemoUser,
    login,
    loginWithProvider,
    register,
    logout,
    checkAuth,
    requireAuth,
    requireRole,
    update,
  }
}
