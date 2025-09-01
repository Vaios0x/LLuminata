"use client"

import { useAuth } from "@/lib/hooks/useAuth"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { ReactNode } from "react"

interface ProtectedRouteProps {
  children: ReactNode
  requiredRole?: string
  redirectTo?: string
  fallback?: ReactNode
}

export function ProtectedRoute({ 
  children, 
  requiredRole, 
  redirectTo = "/auth/login",
  fallback 
}: ProtectedRouteProps) {
  const { user, status, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated" && !isLoading) {
      router.push(redirectTo)
    }
  }, [status, isLoading, router, redirectTo])

  useEffect(() => {
    if (requiredRole && user && user.role !== requiredRole && !isLoading) {
      router.push("/dashboard")
    }
  }, [user, requiredRole, isLoading, router])

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading || status === "loading") {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    )
  }

  // Si no está autenticado, no mostrar nada (se redirigirá)
  if (status === "unauthenticated") {
    return null
  }

  // Si requiere un rol específico y el usuario no lo tiene, no mostrar nada
  if (requiredRole && user?.role !== requiredRole) {
    return null
  }

  // Si está autenticado y tiene los permisos, mostrar el contenido
  return <>{children}</>
}
