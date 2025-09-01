import React from 'react';
import { GamificationDashboard } from '@/components/gamification/gamification-dashboard';
import { GamificationNotification } from '@/components/gamification/gamification-notification';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Trophy, 
  Star, 
  Award, 
  Target, 
  TrendingUp, 
  Users, 
  Calendar,
  Zap,
  Crown,
  Medal,
  Gift,
  Sparkles
} from 'lucide-react';

// Mock data para demostración (en producción vendría de la API)
const mockNotifications = [
  {
    id: '1',
    type: 'badge_earned' as const,
    title: '¡Nuevo Badge Ganado!',
    message: 'Has obtenido el badge "Primer Paso" por completar tu primera lección',
    points: 10,
    timestamp: new Date().toISOString(),
    read: false
  },
  {
    id: '2',
    type: 'level_up' as const,
    title: '¡Subiste de Nivel!',
    message: 'Felicidades, ahora eres un "Aprendiz"',
    points: 50,
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    read: false
  }
];

export default function GamificationPage() {
  // En producción, esto vendría de la sesión del usuario
  const userId = 'mock-user-id';

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Sistema de Gamificación</h1>
            <p className="text-gray-600">¡Completa actividades y gana recompensas!</p>
          </div>
        </div>
        
        {/* Información del sistema */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Trophy className="w-5 h-5 text-yellow-600" />
                <span className="text-sm font-medium">Competencias Activas</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2">3</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium">Badges Disponibles</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2">15</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium">Logros por Desbloquear</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2">8</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dashboard principal */}
      <GamificationDashboard userId={userId} />

      {/* Sección de información */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">¿Cómo funciona?</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-blue-600" />
                <span>Completa Lecciones</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Gana puntos por cada lección completada. Mejores puntuaciones = más puntos.
              </p>
              <div className="mt-3">
                <Badge className="bg-blue-100 text-blue-800">10-50 puntos</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-yellow-600" />
                <span>Participa en Actividades</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Explora actividades culturales y sociales para ganar badges especiales.
              </p>
              <div className="mt-3">
                <Badge className="bg-yellow-100 text-yellow-800">15-40 puntos</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-green-600" />
                <span>Ayuda a Otros</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Colabora con otros estudiantes y gana puntos por ser un buen compañero.
              </p>
              <div className="mt-3">
                <Badge className="bg-green-100 text-green-800">10-35 puntos</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Trophy className="w-5 h-5 text-purple-600" />
                <span>Compite</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Únete a competencias y demuestra tus habilidades para ganar grandes recompensas.
              </p>
              <div className="mt-3">
                <Badge className="bg-purple-100 text-purple-800">50-300 puntos</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Sección de niveles */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Sistema de Niveles</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { level: 1, title: 'Estudiante', exp: 0, color: 'bg-gray-100' },
            { level: 2, title: 'Aprendiz', exp: 100, color: 'bg-blue-100' },
            { level: 3, title: 'Estudiante Avanzado', exp: 250, color: 'bg-green-100' },
            { level: 4, title: 'Estudiante Dedicado', exp: 500, color: 'bg-yellow-100' },
            { level: 5, title: 'Estudiante Experto', exp: 1000, color: 'bg-purple-100' }
          ].map((levelInfo) => (
            <Card key={levelInfo.level} className="text-center">
              <CardContent className="p-4">
                <div className={`w-12 h-12 ${levelInfo.color} rounded-full flex items-center justify-center mx-auto mb-3`}>
                  <span className="text-lg font-bold text-gray-700">{levelInfo.level}</span>
                </div>
                <h3 className="font-semibold text-sm mb-1">{levelInfo.title}</h3>
                <p className="text-xs text-gray-500">{levelInfo.exp} exp</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Sección de recompensas */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Tipos de Recompensas</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-blue-600" />
                <span>Badges</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-3">
                Colecciona badges por completar diferentes tipos de actividades y logros.
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Común</span>
                  <Badge className="bg-gray-100 text-gray-800 text-xs">+10 pts</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Poco Común</span>
                  <Badge className="bg-green-100 text-green-800 text-xs">+25 pts</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Raro</span>
                  <Badge className="bg-blue-100 text-blue-800 text-xs">+50 pts</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Épico</span>
                  <Badge className="bg-purple-100 text-purple-800 text-xs">+100 pts</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Legendario</span>
                  <Badge className="bg-yellow-100 text-yellow-800 text-xs">+200 pts</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Crown className="w-5 h-5 text-yellow-600" />
                <span>Títulos</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-3">
                Desbloquea títulos especiales que se muestran en tu perfil y en las competencias.
              </p>
              <div className="space-y-2">
                <Badge className="bg-gray-100 text-gray-800">Estudiante</Badge>
                <Badge className="bg-blue-100 text-blue-800">Aprendiz</Badge>
                <Badge className="bg-green-100 text-green-800">Avanzado</Badge>
                <Badge className="bg-yellow-100 text-yellow-800">Dedicado</Badge>
                <Badge className="bg-purple-100 text-purple-800">Experto</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Gift className="w-5 h-5 text-pink-600" />
                <span>Recompensas Especiales</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-3">
                Desbloquea características especiales y contenido exclusivo.
              </p>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm">Modo Offline</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <span className="text-sm">Temas Personalizados</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Medal className="w-4 h-4 text-blue-600" />
                  <span className="text-sm">Contenido Premium</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Eventos Exclusivos</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Notificaciones */}
      <GamificationNotification 
        notifications={mockNotifications}
        onDismiss={(id) => console.log('Dismissed:', id)}
        onMarkAsRead={(id) => console.log('Marked as read:', id)}
      />
    </div>
  );
}
