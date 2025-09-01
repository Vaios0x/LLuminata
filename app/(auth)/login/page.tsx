'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User, 
  AlertCircle,
  CheckCircle,
  Loader2,
  Globe,
  Users,
  Star
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useScreenReader } from '@/components/accessibility/screen-reader';
import { useHighContrast } from '@/components/accessibility/high-contrast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const router = useRouter();
  const { login } = useAuth();
  const { speak, isEnabled: screenReaderEnabled } = useScreenReader();
  const { getStyles } = useHighContrast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await login(email, password);
      
      if (result.success) {
        setSuccess('Inicio de sesión exitoso');
        if (screenReaderEnabled) {
          speak('Inicio de sesión exitoso, redirigiendo al dashboard');
        }
        
        setTimeout(() => {
          router.push('/dashboard');
        }, 1500);
      } else {
        setError(result.error || 'Error en el inicio de sesión');
        if (screenReaderEnabled) {
          speak(`Error: ${result.error}`);
        }
      }
    } catch (err) {
      setError('Error de conexión. Intenta nuevamente.');
      if (screenReaderEnabled) {
        speak('Error de conexión');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    return email.length > 0 && password.length >= 6;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4" style={getStyles()}>
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">AI</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Lluminata</h1>
              <p className="text-sm text-gray-600">Educación Inclusiva con IA</p>
            </div>
          </div>
          
          <Badge className="mb-4 bg-green-100 text-green-800">
            🌍 Disponible en 15+ países
          </Badge>
        </div>

        {/* Login Card */}
        <Card className="shadow-xl border-0">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Iniciar Sesión</CardTitle>
            <CardDescription>
              Accede a tu cuenta para continuar aprendiendo
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="tu@email.com"
                    required
                    aria-describedby="email-error"
                  />
                </div>
                {error && email && (
                  <p id="email-error" className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="••••••••"
                    required
                    minLength={6}
                    aria-describedby="password-error"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {error && password && (
                  <p id="password-error" className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                  </p>
                )}
              </div>

              {/* Success Message */}
              {success && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    {success}
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={!validateForm() || isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Iniciando sesión...
                  </>
                ) : (
                  'Iniciar Sesión'
                )}
              </Button>
            </form>

            {/* Links */}
            <div className="mt-6 space-y-3 text-center">
              <Link 
                href="/auth/forgot-password"
                className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </Link>
              
              <div className="text-sm text-gray-600">
                ¿No tienes cuenta?{' '}
                <Link 
                  href="/auth/register"
                  className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                >
                  Regístrate gratis
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="p-3 bg-white rounded-lg shadow-sm">
            <Globe className="h-6 w-6 text-blue-600 mx-auto mb-2" />
            <p className="text-xs text-gray-600">Multilingüe</p>
          </div>
          <div className="p-3 bg-white rounded-lg shadow-sm">
            <Users className="h-6 w-6 text-green-600 mx-auto mb-2" />
            <p className="text-xs text-gray-600">Inclusivo</p>
          </div>
          <div className="p-3 bg-white rounded-lg shadow-sm">
            <Star className="h-6 w-6 text-purple-600 mx-auto mb-2" />
            <p className="text-xs text-gray-600">Gratuito</p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Al iniciar sesión, aceptas nuestros</p>
          <div className="flex justify-center space-x-2 mt-1">
            <Link href="/terms" className="text-blue-600 hover:underline">
              Términos de Servicio
            </Link>
            <span>y</span>
            <Link href="/privacy" className="text-blue-600 hover:underline">
              Política de Privacidad
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
