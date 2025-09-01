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
  Star,
  Calendar,
  MapPin,
  School,
  Heart
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useScreenReader } from '@/components/accessibility/screen-reader';
import { useHighContrast } from '@/components/accessibility/high-contrast';

interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  age: string;
  region: string;
  educationLevel: string;
  interests: string[];
  accessibility: string[];
}

export default function RegisterPage() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    age: '',
    region: '',
    educationLevel: '',
    interests: [],
    accessibility: []
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  
  const router = useRouter();
  const { register } = useAuth();
  const { speak, isEnabled: screenReaderEnabled } = useScreenReader();
  const { getStyles } = useHighContrast();

  const interests = [
    'Matemáticas', 'Ciencias', 'Historia', 'Literatura', 
    'Arte', 'Música', 'Tecnología', 'Deportes', 'Cocina', 'Jardinería'
  ];

  const accessibility = [
    'Lector de pantalla', 'Navegación por teclado', 'Alto contraste', 
    'Subtítulos', 'Descripción de audio', 'Ninguna'
  ];

  const regions = [
    'México', 'Guatemala', 'El Salvador', 'Honduras', 'Nicaragua',
    'Costa Rica', 'Panamá', 'Colombia', 'Venezuela', 'Ecuador',
    'Perú', 'Bolivia', 'Chile', 'Argentina', 'Uruguay', 'Paraguay',
    'Brasil', 'Otro'
  ];

  const educationLevels = [
    'Primaria', 'Secundaria', 'Preparatoria', 'Universidad',
    'Posgrado', 'Educación especial', 'Otro'
  ];

  const handleInputChange = (field: keyof FormData, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleInterestToggle = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleAccessibilityToggle = (access: string) => {
    setFormData(prev => ({
      ...prev,
      accessibility: prev.accessibility.includes(access)
        ? prev.accessibility.filter(a => a !== access)
        : [...prev.accessibility, access]
    }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return formData.name.length > 0 && 
               formData.email.length > 0 && 
               formData.password.length >= 6 &&
               formData.password === formData.confirmPassword;
      case 2:
        return formData.age.length > 0 && 
               formData.region.length > 0 && 
               formData.educationLevel.length > 0;
      case 3:
        return formData.interests.length > 0;
      default:
        return true;
    }
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
      if (screenReaderEnabled) {
        speak(`Paso ${currentStep + 1} de 3`);
      }
    } else {
      setError('Por favor completa todos los campos requeridos');
    }
  };

  const handlePreviousStep = () => {
    setCurrentStep(prev => prev - 1);
    if (screenReaderEnabled) {
      speak(`Paso ${currentStep - 1} de 3`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // Separar nombre completo en nombre y apellido
      const nameParts = formData.name.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      const result = await register({
        firstName,
        lastName,
        email: formData.email,
        password: formData.password,
        language: 'es', // Por defecto español
        age: formData.age,
        education: formData.educationLevel
      });
      
      if (result.success) {
        setSuccess('Registro exitoso. Redirigiendo al onboarding...');
        if (screenReaderEnabled) {
          speak('Registro exitoso, redirigiendo al onboarding');
        }
        
        setTimeout(() => {
          router.push('/auth/onboarding');
        }, 2000);
      } else {
        setError(result.error || 'Error en el registro');
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

  const renderStep1 = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium text-gray-700">
          Nombre Completo *
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Tu nombre completo"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium text-gray-700">
          Correo Electrónico *
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="tu@email.com"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium text-gray-700">
          Contraseña *
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="••••••••"
            required
            minLength={6}
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
      </div>

      <div className="space-y-2">
        <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
          Confirmar Contraseña *
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            id="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
            className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="••••••••"
            required
            minLength={6}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {formData.password !== formData.confirmPassword && formData.confirmPassword && (
          <p className="text-sm text-red-600">Las contraseñas no coinciden</p>
        )}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="age" className="text-sm font-medium text-gray-700">
          Edad *
        </label>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            id="age"
            type="number"
            value={formData.age}
            onChange={(e) => handleInputChange('age', e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Tu edad"
            min="5"
            max="100"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="region" className="text-sm font-medium text-gray-700">
          Región/País *
        </label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <select
            id="region"
            value={formData.region}
            onChange={(e) => handleInputChange('region', e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">Selecciona tu región</option>
            {regions.map(region => (
              <option key={region} value={region}>{region}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="educationLevel" className="text-sm font-medium text-gray-700">
          Nivel Educativo *
        </label>
        <div className="relative">
          <School className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <select
            id="educationLevel"
            value={formData.educationLevel}
            onChange={(e) => handleInputChange('educationLevel', e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">Selecciona tu nivel educativo</option>
            {educationLevels.map(level => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-3">¿Qué te interesa aprender? *</h3>
        <div className="grid grid-cols-2 gap-2">
          {interests.map(interest => (
            <button
              key={interest}
              type="button"
              onClick={() => handleInterestToggle(interest)}
              className={`p-3 rounded-lg border text-left transition-colors ${
                formData.interests.includes(interest)
                  ? 'bg-blue-50 border-blue-500 text-blue-700'
                  : 'bg-white border-gray-300 hover:border-gray-400'
              }`}
            >
              {interest}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-3">Necesidades de Accesibilidad</h3>
        <div className="space-y-2">
          {accessibility.map(access => (
            <label key={access} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50">
              <input
                type="checkbox"
                checked={formData.accessibility.includes(access)}
                onChange={() => handleAccessibilityToggle(access)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm">{access}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4" style={getStyles()}>
      <div className="w-full max-w-2xl">
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
            🌍 Únete a 50K+ estudiantes
          </Badge>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Paso {currentStep} de 3</span>
            <span>{Math.round((currentStep / 3) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${(currentStep / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Register Card */}
        <Card className="shadow-xl border-0">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Crear Cuenta</CardTitle>
            <CardDescription>
              {currentStep === 1 && 'Información básica de tu cuenta'}
              {currentStep === 2 && 'Información personal y ubicación'}
              {currentStep === 3 && 'Intereses y accesibilidad'}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Step Content */}
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                  </p>
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    {success}
                  </p>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between">
                {currentStep > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePreviousStep}
                    className="flex items-center gap-2"
                  >
                    ← Anterior
                  </Button>
                )}
                
                {currentStep < 3 ? (
                  <Button
                    type="button"
                    onClick={handleNextStep}
                    disabled={!validateStep(currentStep)}
                    className="ml-auto bg-blue-600 hover:bg-blue-700"
                  >
                    Siguiente →
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={!validateStep(currentStep) || isLoading}
                    className="ml-auto bg-blue-600 hover:bg-blue-700"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creando cuenta...
                      </>
                    ) : (
                      <>
                        <Heart className="h-4 w-4 mr-2" />
                        Crear Cuenta
                      </>
                    )}
                  </Button>
                )}
              </div>
            </form>

            {/* Links */}
            <div className="mt-6 text-center">
              <div className="text-sm text-gray-600">
                ¿Ya tienes cuenta?{' '}
                <Link 
                  href="/auth/login"
                  className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                >
                  Inicia sesión
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
          <p>Al registrarte, aceptas nuestros</p>
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
