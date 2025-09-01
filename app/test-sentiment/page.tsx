/**
 * Página de Prueba - Análisis de Sentimientos en Tiempo Real
 * Demuestra todas las funcionalidades del sistema de análisis de sentimientos
 */

import { SentimentAnalysis } from '@/components/ai/SentimentAnalysis';

export default function TestSentimentPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Prueba: Análisis de Sentimientos en Tiempo Real
          </h1>
          <p className="text-gray-600">
            Sistema completo de análisis de emociones, predicción de abandono escolar y alertas para maestros
          </p>
        </div>

        <SentimentAnalysis />
      </div>
    </div>
  );
}
