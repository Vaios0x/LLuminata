"use client"

import * as React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { LanguageSelector } from "@/components/ui/language-selector"
import { InclusiveAvatar } from "@/components/ui/inclusive-avatar"
import { useLanguage } from "@/lib/contexts/LanguageContext"
// import { useAuth } from "@/lib/hooks/useAuth"

export function Navbar() {
  // const { user, logout, status } = useAuth()
  const status = "unauthenticated"
  const { t } = useLanguage()
  const [isScrolled, setIsScrolled] = React.useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = React.useState(false)

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isUserMenuOpen) {
        setIsUserMenuOpen(false)
      }
    }

    document.addEventListener("click", handleClickOutside)
    return () => document.removeEventListener("click", handleClickOutside)
  }, [isUserMenuOpen])

  const handleLogout = async () => {
    // await logout()
    setIsUserMenuOpen(false)
  }

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? "bg-white/95 backdrop-blur-xl border-b border-gray-200/50 shadow-lg"
          : "bg-transparent"
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center space-x-2 group"
            aria-label="Ir a la página principal"
          >
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                <span className="text-white font-bold text-lg">AI</span>
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {t('common.app.name')}
              </h1>
              <p className="text-xs text-gray-500">{t('common.app.tagline')}</p>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-8">
                         <Link 
               href="#features" 
               className="text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium"
               aria-label={t('common.navigation.features')}
             >
               {t('common.navigation.features')}
             </Link>
             <Link 
               href="#populations" 
               className="text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium"
               aria-label={t('common.navigation.populations')}
             >
               {t('common.navigation.populations')}
             </Link>
             <Link 
               href="#technology" 
               className="text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium"
               aria-label={t('common.navigation.technology')}
             >
               {t('common.navigation.technology')}
             </Link>
             <Link 
               href="#pricing" 
               className="text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium"
               aria-label={t('common.navigation.pricing')}
             >
               {t('common.navigation.pricing')}
             </Link>
            <Link 
              href="/about" 
              className="text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium"
              aria-label="Acerca de nosotros"
            >
              {t('common.navigation.about')}
            </Link>
            <Link 
              href="/contact" 
              className="text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium"
              aria-label="Contacto"
            >
              {t('common.navigation.contact')}
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="hidden lg:flex items-center space-x-4">
            <LanguageSelector variant="compact" />
            {status === "unauthenticated" ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  aria-label="Menú de usuario"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center overflow-hidden">
                    <InclusiveAvatar size={32} variant="colorful" />
                  </div>
                  <span className="text-gray-700 font-medium">Usuario</span>
                </button>
                
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <Link 
                      href="/dashboard" 
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      Dashboard
                    </Link>
                    <Link 
                      href="/profile" 
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      Perfil
                    </Link>
                    <Link 
                      href="/settings" 
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      Configuración
                    </Link>
                    <hr className="my-2" />
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                                 <Link href="/auth/login">
                   <Button variant="ghost" className="text-gray-700 hover:text-blue-600">
                     {t('common.auth.login')}
                   </Button>
                 </Link>
                 <Link href="/auth/register">
                   <Button className="bg-blue-600 hover:bg-blue-700">
                     {t('common.auth.register')}
                   </Button>
                 </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Menú móvil"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4">
              <div className="px-4 py-2">
                <LanguageSelector variant="default" />
              </div>
              <Link 
                href="#features" 
                className="text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium px-4 py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Características
              </Link>
              <Link 
                href="#populations" 
                className="text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium px-4 py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Poblaciones
              </Link>
              <Link 
                href="#technology" 
                className="text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium px-4 py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Tecnología
              </Link>
              <Link 
                href="#pricing" 
                className="text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium px-4 py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Precios
              </Link>
              <Link 
                href="/about" 
                className="text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium px-4 py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Nosotros
              </Link>
              <Link 
                href="/contact" 
                className="text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium px-4 py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Contacto
              </Link>
              
              {status === "unauthenticated" ? (
                <div className="pt-4 border-t border-gray-200">
                  <Link 
                    href="/dashboard" 
                    className="block text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium px-4 py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="block w-full text-left text-red-600 hover:text-red-700 transition-colors duration-200 font-medium px-4 py-2"
                  >
                    Cerrar Sesión
                  </button>
                </div>
              ) : (
                <div className="pt-4 border-t border-gray-200 space-y-2">
                  <Link href="/auth/login">
                    <Button variant="ghost" className="w-full justify-start text-gray-700 hover:text-blue-600">
                      Iniciar Sesión
                    </Button>
                  </Link>
                  <Link href="/auth/register">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      Registrarse
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
