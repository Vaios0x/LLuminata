'use client';

import React from 'react';
import { 
  InclusiveAvatar, 
  InclusiveAvatarWithBadge, 
  AnimatedInclusiveAvatar 
} from '@/components/ui/inclusive-avatar';

export function InclusiveAvatarExample() {
  return (
    <div className="p-8 bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Avatar Inclusivo - Ejemplos de Uso
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* Variantes básicas */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Variantes de Color</h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <InclusiveAvatar size={48} variant="default" />
                <span className="text-sm text-gray-600">Default</span>
              </div>
              <div className="flex items-center space-x-4">
                <InclusiveAvatar size={48} variant="colorful" />
                <span className="text-sm text-gray-600">Colorful</span>
              </div>
              <div className="flex items-center space-x-4">
                <InclusiveAvatar size={48} variant="minimal" />
                <span className="text-sm text-gray-600">Minimal</span>
              </div>
            </div>
          </div>

          {/* Tamaños diferentes */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Diferentes Tamaños</h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <InclusiveAvatar size={24} variant="colorful" />
                <span className="text-sm text-gray-600">Pequeño (24px)</span>
              </div>
              <div className="flex items-center space-x-4">
                <InclusiveAvatar size={48} variant="colorful" />
                <span className="text-sm text-gray-600">Mediano (48px)</span>
              </div>
              <div className="flex items-center space-x-4">
                <InclusiveAvatar size={80} variant="colorful" />
                <span className="text-sm text-gray-600">Grande (80px)</span>
              </div>
            </div>
          </div>

          {/* Con badges */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Con Badges</h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <InclusiveAvatarWithBadge size={48} badgeText="✓" badgeColor="#10B981" />
                <span className="text-sm text-gray-600">Verificado</span>
              </div>
              <div className="flex items-center space-x-4">
                <InclusiveAvatarWithBadge size={48} badgeText="★" badgeColor="#F59E0B" />
                <span className="text-sm text-gray-600">Premium</span>
              </div>
              <div className="flex items-center space-x-4">
                <InclusiveAvatarWithBadge size={48} badgeText="!" badgeColor="#EF4444" />
                <span className="text-sm text-gray-600">Nuevo</span>
              </div>
            </div>
          </div>

          {/* Animados */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Animados</h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <AnimatedInclusiveAvatar size={48} isAnimated={true} />
                <span className="text-sm text-gray-600">Con animación</span>
              </div>
              <div className="flex items-center space-x-4">
                <AnimatedInclusiveAvatar size={48} isAnimated={false} />
                <span className="text-sm text-gray-600">Sin animación</span>
              </div>
            </div>
          </div>

          {/* En contexto de usuario */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">En Perfil de Usuario</h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <InclusiveAvatar size={40} variant="colorful" />
                <div>
                  <p className="font-medium text-gray-800">María González</p>
                  <p className="text-sm text-gray-600">Estudiante</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <InclusiveAvatarWithBadge size={40} badgeText="✓" />
                <div>
                  <p className="font-medium text-gray-800">Carlos Ruiz</p>
                  <p className="text-sm text-gray-600">Profesor</p>
                </div>
              </div>
            </div>
          </div>

          {/* En lista de usuarios */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">En Lista de Usuarios</h2>
            <div className="space-y-2">
              {['Ana', 'Luis', 'Sofia', 'Miguel'].map((name, index) => (
                <div key={index} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                  <InclusiveAvatar size={32} variant={index % 2 === 0 ? 'colorful' : 'minimal'} />
                  <span className="text-sm text-gray-700">{name}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Información sobre inclusividad */}
        <div className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-4">¿Por qué un Avatar Inclusivo?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">🎨 Representación Diversa</h3>
              <p className="text-blue-100">
                El avatar representa a un niño con características que celebran la diversidad 
                y la inclusión, reflejando los valores de nuestra plataforma educativa.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">♿ Símbolos de Accesibilidad</h3>
              <p className="text-blue-100">
                Incluye elementos visuales que representan la accesibilidad y la inclusión, 
                como el símbolo de accesibilidad y el corazón que simboliza la empatía.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">🌈 Colores Inclusivos</h3>
              <p className="text-blue-100">
                Utiliza una paleta de colores que es accesible y representa la diversidad 
                cultural y étnica de nuestros usuarios.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">✨ Personalizable</h3>
              <p className="text-blue-100">
                Ofrece múltiples variantes y opciones de personalización para adaptarse 
                a diferentes contextos y preferencias de los usuarios.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
