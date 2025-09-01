import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Footer() {
  return (
    <footer className="bg-gradient-to-br from-gray-900 to-gray-800 text-white border-t border-gray-700">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">AI</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">
                  Lluminata
                </h3>
                <p className="text-sm text-gray-300">Educación Inclusiva con IA</p>
              </div>
            </div>
            <p className="text-gray-300 mb-6 max-w-md">
              Democratizando la educación con inteligencia artificial para 
              poblaciones vulnerables en América Latina. Contenido adaptativo, 
              funcionamiento offline y accesibilidad total.
            </p>
            <div className="flex space-x-4">
              <Button variant="outline" size="sm" className="rounded-full border-gray-600 text-gray-300 hover:bg-gray-700">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                </svg>
              </Button>
              <Button variant="outline" size="sm" className="rounded-full border-gray-600 text-gray-300 hover:bg-gray-700">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                </svg>
              </Button>
              <Button variant="outline" size="sm" className="rounded-full border-gray-600 text-gray-300 hover:bg-gray-700">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </Button>
            </div>
          </div>

          {/* Platform */}
          <div>
            <h4 className="font-semibold text-white mb-4">Plataforma</h4>
            <ul className="space-y-3">
              <li>
                <Link 
                  href="#features" 
                  className="text-gray-300 hover:text-blue-400 transition-colors duration-200"
                >
                  Características
                </Link>
              </li>
              <li>
                <Link 
                  href="#populations" 
                  className="text-gray-300 hover:text-blue-400 transition-colors duration-200"
                >
                  Poblaciones
                </Link>
              </li>
              <li>
                <Link 
                  href="#technology" 
                  className="text-gray-300 hover:text-blue-400 transition-colors duration-200"
                >
                  Tecnología
                </Link>
              </li>
              <li>
                <Link 
                  href="#pricing" 
                  className="text-gray-300 hover:text-blue-400 transition-colors duration-200"
                >
                  Precios
                </Link>
              </li>
              <li>
                <Link 
                  href="/dashboard" 
                  className="text-gray-300 hover:text-blue-400 transition-colors duration-200"
                >
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-white mb-4">Soporte</h4>
            <ul className="space-y-3">
              <li>
                <Link 
                  href="/help" 
                  className="text-gray-300 hover:text-blue-400 transition-colors duration-200"
                >
                  Centro de Ayuda
                </Link>
              </li>
              <li>
                <Link 
                  href="/contact" 
                  className="text-gray-300 hover:text-blue-400 transition-colors duration-200"
                >
                  Contacto
                </Link>
              </li>
              <li>
                <Link 
                  href="/community" 
                  className="text-gray-300 hover:text-blue-400 transition-colors duration-200"
                >
                  Comunidad
                </Link>
              </li>
              <li>
                <Link 
                  href="/status" 
                  className="text-gray-300 hover:text-blue-400 transition-colors duration-200"
                >
                  Estado del Servicio
                </Link>
              </li>
              <li>
                <Link 
                  href="/docs" 
                  className="text-gray-300 hover:text-blue-400 transition-colors duration-200"
                >
                  Documentación
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-white mb-4">Empresa</h4>
            <ul className="space-y-3">
              <li>
                <Link 
                  href="/about" 
                  className="text-gray-300 hover:text-blue-400 transition-colors duration-200"
                >
                  Acerca de Nosotros
                </Link>
              </li>
              <li>
                <Link 
                  href="/blog" 
                  className="text-gray-300 hover:text-blue-400 transition-colors duration-200"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link 
                  href="/careers" 
                  className="text-gray-300 hover:text-blue-400 transition-colors duration-200"
                >
                  Carreras
                </Link>
              </li>
              <li>
                <Link 
                  href="/press" 
                  className="text-gray-300 hover:text-blue-400 transition-colors duration-200"
                >
                  Prensa
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-3">
              <li>
                <Link 
                  href="/privacy" 
                  className="text-gray-300 hover:text-blue-400 transition-colors duration-200"
                >
                  Privacidad
                </Link>
              </li>
              <li>
                <Link 
                  href="/terms" 
                  className="text-gray-300 hover:text-blue-400 transition-colors duration-200"
                >
                  Términos de Servicio
                </Link>
              </li>
              <li>
                <Link 
                  href="/cookies" 
                  className="text-gray-300 hover:text-blue-400 transition-colors duration-200"
                >
                  Política de Cookies
                </Link>
              </li>
              <li>
                <Link 
                  href="/security" 
                  className="text-gray-300 hover:text-blue-400 transition-colors duration-200"
                >
                  Seguridad
                </Link>
              </li>
              <li>
                <Link 
                  href="/accessibility" 
                  className="text-gray-300 hover:text-blue-400 transition-colors duration-200"
                >
                  Accesibilidad
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-300 text-sm mb-4 md:mb-0">
                             © 2025 Lluminata. Todos los derechos reservados. 
              Desarrollado con ❤️ para América Latina.
              <br />
              <span className="text-gray-400">
                Made by{' '}
                <a 
                  href="https://t.me/Vai0sx" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 transition-colors duration-200"
                >
                  Vai0sx
                </a>
              </span>
            </div>
            <div className="flex items-center space-x-6 text-sm">
              <span className="text-gray-400">🌍 Disponible en 15+ países</span>
              <span className="text-gray-400">♿ 100% Accesible</span>
              <span className="text-gray-400">📱 PWA Optimizada</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
