/**
 * Página de Funcionalidades Avanzadas
 * Muestra el dashboard integrado de funcionalidades sociales y reportes avanzados
 */

import React from 'react';
import { Metadata } from 'next';
import { FeaturesDashboard } from '@/components/dashboard/features-dashboard';

export const metadata: Metadata = {
      title: 'Funcionalidades Avanzadas - LLuminata',
  description: 'Dashboard de funcionalidades sociales y reportes avanzados para el aprendizaje inclusivo',
  keywords: 'funcionalidades sociales, reportes avanzados, grupos de estudio, proyectos colaborativos, mentores, análisis de impacto',
};

export default function FeaturesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Funcionalidades Avanzadas
          </h1>
          <p className="text-gray-600">
            Gestiona funcionalidades sociales y reportes avanzados para optimizar el aprendizaje inclusivo
          </p>
        </div>
        
        <FeaturesDashboard />
      </div>
    </div>
  );
}
