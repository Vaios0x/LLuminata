/**
 * Ejemplo de uso de hooks de Gamificación y Analytics
 * Demuestra cómo usar todos los hooks implementados
 */

import React from 'react';
import {
  useCompetition,
  useClan,
  useEvents,
  useTrading,
  usePersonalization,
  useHeatmap,
  usePredictions,
  useABTesting,
  useRealTimeMetrics,
  useExportManager
} from '../lib/hooks';

const HooksExample: React.FC = () => {
  // Hooks de Gamificación
  const {
    competitions,
    userParticipations,
    leaderboards,
    loading: competitionLoading,
    error: competitionError,
    joinCompetition,
    leaveCompetition,
    updateScore,
    getLeaderboard
  } = useCompetition();

  const {
    userClan,
    availableClans,
    clanMembers,
    clanActivities,
    loading: clanLoading,
    error: clanError,
    createClan,
    joinClan,
    leaveClan,
    inviteMember
  } = useClan();

  const {
    events,
    notifications,
    rewards,
    loading: eventsLoading,
    error: eventsError,
    createEvent,
    markEventAsRead,
    claimReward
  } = useEvents();

  const {
    userInventory,
    availableOffers,
    userOffers,
    transactions,
    loading: tradingLoading,
    error: tradingError,
    createOffer,
    buyOffer,
    cancelTransaction
  } = useTrading();

  const {
    userPreferences,
    culturalAdaptation,
    availableThemes,
    loading: personalizationLoading,
    error: personalizationError,
    updatePreferences,
    setTheme,
    updateCulturalAdaptation
  } = usePersonalization();

  // Hooks de Analytics
  const {
    heatmapData,
    configurations,
    activeSessions,
    loading: heatmapLoading,
    error: heatmapError,
    createHeatmapConfig,
    startTracking,
    recordClick,
    exportHeatmapData
  } = useHeatmap();

  const {
    predictionModels,
    predictions,
    configurations: predictionConfigs,
    insights,
    loading: predictionsLoading,
    error: predictionsError,
    createModel,
    trainModel,
    makePrediction,
    generateInsights
  } = usePredictions();

  const {
    experiments,
    results,
    statistics,
    loading: abTestingLoading,
    error: abTestingError,
    createExperiment,
    startExperiment,
    addVariant,
    recordResult
  } = useABTesting();

  const {
    metrics,
    configurations: realTimeConfigs,
    alerts,
    dashboards,
    loading: realTimeLoading,
    error: realTimeError,
    subscribeToMetric,
    updateMetric,
    createConfig,
    acknowledgeAlert
  } = useRealTimeMetrics();

  const {
    jobs,
    templates,
    configs,
    stats,
    loading: exportLoading,
    error: exportError,
    createExportJob,
    downloadExport,
    createTemplate,
    useTemplate
  } = useExportManager();

  // Ejemplo de uso de competencias
  const handleJoinCompetition = async () => {
    if (competitions.length > 0) {
      try {
        await joinCompetition(competitions[0].id);
        console.log('Competencia unida exitosamente');
      } catch (error) {
        console.error('Error al unirse a la competencia:', error);
      }
    }
  };

  // Ejemplo de uso de clanes
  const handleCreateClan = async () => {
    try {
      await createClan({
        name: 'Mi Clan',
        description: 'Un clan para aprender juntos',
        tag: 'MC',
        maxMembers: 50
      });
      console.log('Clan creado exitosamente');
    } catch (error) {
      console.error('Error al crear clan:', error);
    }
  };

  // Ejemplo de uso de eventos
  const handleCreateEvent = async () => {
    try {
      await createEvent({
        name: 'Evento de Aprendizaje',
        description: 'Un evento especial para aprender',
        type: 'LEARNING',
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días
        rewards: {
          points: 100,
          experience: 50,
          badges: ['event_participant']
        }
      });
      console.log('Evento creado exitosamente');
    } catch (error) {
      console.error('Error al crear evento:', error);
    }
  };

  // Ejemplo de uso de trading
  const handleCreateOffer = async () => {
    try {
      await createOffer({
        itemId: 'item_1',
        quantity: 5,
        price: 100,
        type: 'SELL',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 horas
      });
      console.log('Oferta creada exitosamente');
    } catch (error) {
      console.error('Error al crear oferta:', error);
    }
  };

  // Ejemplo de uso de personalización
  const handleUpdatePreferences = async () => {
    try {
      await updatePreferences({
        learningStyle: 'VISUAL',
        difficultyLevel: 'INTERMEDIATE',
        accessibilityFeatures: {
          screenReader: true,
          highContrast: false,
          largeText: false,
          voiceNavigation: true
        }
      });
      console.log('Preferencias actualizadas exitosamente');
    } catch (error) {
      console.error('Error al actualizar preferencias:', error);
    }
  };

  // Ejemplo de uso de heatmap
  const handleStartTracking = async () => {
    try {
      await startTracking('homepage');
      console.log('Tracking de heatmap iniciado');
    } catch (error) {
      console.error('Error al iniciar tracking:', error);
    }
  };

  // Ejemplo de uso de predicciones
  const handleMakePrediction = async () => {
    try {
      const prediction = await makePrediction('user_engagement', {
        userId: 'user_123',
        learningHistory: ['lesson_1', 'lesson_2'],
        timeSpent: 120
      });
      console.log('Predicción realizada:', prediction);
    } catch (error) {
      console.error('Error al hacer predicción:', error);
    }
  };

  // Ejemplo de uso de A/B testing
  const handleCreateExperiment = async () => {
    try {
      await createExperiment({
        name: 'Test de Interfaz',
        description: 'Probando nueva interfaz de usuario',
        hypothesis: 'La nueva interfaz mejora la retención',
        variants: [
          { name: 'Control', description: 'Interfaz actual' },
          { name: 'Variante A', description: 'Nueva interfaz' }
        ],
        metrics: ['retention_rate', 'time_on_page'],
        targetAudience: 'all_users'
      });
      console.log('Experimento creado exitosamente');
    } catch (error) {
      console.error('Error al crear experimento:', error);
    }
  };

  // Ejemplo de uso de métricas en tiempo real
  const handleSubscribeToMetric = async () => {
    try {
      await subscribeToMetric('active_users');
      console.log('Suscripción a métrica activada');
    } catch (error) {
      console.error('Error al suscribirse a métrica:', error);
    }
  };

  // Ejemplo de uso de exportaciones
  const handleCreateExportJob = async () => {
    try {
      await createExportJob({
        name: 'Reporte de Usuarios',
        description: 'Exportación de datos de usuarios',
        type: 'USER_DATA',
        format: 'CSV',
        filters: {
          dateRange: {
            start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 días atrás
            end: new Date()
          },
          userSegments: ['active_users'],
          dataTypes: ['profile', 'activity'],
          customFilters: {}
        }
      });
      console.log('Trabajo de exportación creado exitosamente');
    } catch (error) {
      console.error('Error al crear trabajo de exportación:', error);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Ejemplo de Hooks de Gamificación y Analytics</h1>
      
      {/* Sección de Gamificación */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Gamificación</h2>
        
        {/* Competencias */}
        <div className="mb-6 p-4 border rounded-lg">
          <h3 className="text-xl font-medium mb-2">Competencias</h3>
          {competitionLoading ? (
            <p>Cargando competencias...</p>
          ) : competitionError ? (
            <p className="text-red-500">Error: {competitionError}</p>
          ) : (
            <div>
              <p>Competencias disponibles: {competitions.length}</p>
              <button
                onClick={handleJoinCompetition}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                disabled={competitions.length === 0}
              >
                Unirse a Competencia
              </button>
            </div>
          )}
        </div>

        {/* Clanes */}
        <div className="mb-6 p-4 border rounded-lg">
          <h3 className="text-xl font-medium mb-2">Clanes</h3>
          {clanLoading ? (
            <p>Cargando clanes...</p>
          ) : clanError ? (
            <p className="text-red-500">Error: {clanError}</p>
          ) : (
            <div>
              <p>Clanes disponibles: {availableClans.length}</p>
              <button
                onClick={handleCreateClan}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Crear Clan
              </button>
            </div>
          )}
        </div>

        {/* Eventos */}
        <div className="mb-6 p-4 border rounded-lg">
          <h3 className="text-xl font-medium mb-2">Eventos</h3>
          {eventsLoading ? (
            <p>Cargando eventos...</p>
          ) : eventsError ? (
            <p className="text-red-500">Error: {eventsError}</p>
          ) : (
            <div>
              <p>Eventos activos: {events.length}</p>
              <button
                onClick={handleCreateEvent}
                className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
              >
                Crear Evento
              </button>
            </div>
          )}
        </div>

        {/* Trading */}
        <div className="mb-6 p-4 border rounded-lg">
          <h3 className="text-xl font-medium mb-2">Trading</h3>
          {tradingLoading ? (
            <p>Cargando ofertas...</p>
          ) : tradingError ? (
            <p className="text-red-500">Error: {tradingError}</p>
          ) : (
            <div>
              <p>Ofertas disponibles: {availableOffers.length}</p>
              <button
                onClick={handleCreateOffer}
                className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
              >
                Crear Oferta
              </button>
            </div>
          )}
        </div>

        {/* Personalización */}
        <div className="mb-6 p-4 border rounded-lg">
          <h3 className="text-xl font-medium mb-2">Personalización</h3>
          {personalizationLoading ? (
            <p>Cargando preferencias...</p>
          ) : personalizationError ? (
            <p className="text-red-500">Error: {personalizationError}</p>
          ) : (
            <div>
              <p>Temas disponibles: {availableThemes.length}</p>
              <button
                onClick={handleUpdatePreferences}
                className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600"
              >
                Actualizar Preferencias
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Sección de Analytics */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Analytics</h2>
        
        {/* Heatmap */}
        <div className="mb-6 p-4 border rounded-lg">
          <h3 className="text-xl font-medium mb-2">Heatmap</h3>
          {heatmapLoading ? (
            <p>Cargando heatmap...</p>
          ) : heatmapError ? (
            <p className="text-red-500">Error: {heatmapError}</p>
          ) : (
            <div>
              <p>Sesiones activas: {activeSessions.length}</p>
              <button
                onClick={handleStartTracking}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Iniciar Tracking
              </button>
            </div>
          )}
        </div>

        {/* Predicciones */}
        <div className="mb-6 p-4 border rounded-lg">
          <h3 className="text-xl font-medium mb-2">Predicciones</h3>
          {predictionsLoading ? (
            <p>Cargando modelos...</p>
          ) : predictionsError ? (
            <p className="text-red-500">Error: {predictionsError}</p>
          ) : (
            <div>
              <p>Modelos disponibles: {predictionModels.length}</p>
              <button
                onClick={handleMakePrediction}
                className="bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-600"
              >
                Hacer Predicción
              </button>
            </div>
          )}
        </div>

        {/* A/B Testing */}
        <div className="mb-6 p-4 border rounded-lg">
          <h3 className="text-xl font-medium mb-2">A/B Testing</h3>
          {abTestingLoading ? (
            <p>Cargando experimentos...</p>
          ) : abTestingError ? (
            <p className="text-red-500">Error: {abTestingError}</p>
          ) : (
            <div>
              <p>Experimentos activos: {experiments.length}</p>
              <button
                onClick={handleCreateExperiment}
                className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
              >
                Crear Experimento
              </button>
            </div>
          )}
        </div>

        {/* Métricas en Tiempo Real */}
        <div className="mb-6 p-4 border rounded-lg">
          <h3 className="text-xl font-medium mb-2">Métricas en Tiempo Real</h3>
          {realTimeLoading ? (
            <p>Cargando métricas...</p>
          ) : realTimeError ? (
            <p className="text-red-500">Error: {realTimeError}</p>
          ) : (
            <div>
              <p>Métricas activas: {metrics.length}</p>
              <button
                onClick={handleSubscribeToMetric}
                className="bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600"
              >
                Suscribirse a Métrica
              </button>
            </div>
          )}
        </div>

        {/* Exportaciones */}
        <div className="mb-6 p-4 border rounded-lg">
          <h3 className="text-xl font-medium mb-2">Exportaciones</h3>
          {exportLoading ? (
            <p>Cargando trabajos...</p>
          ) : exportError ? (
            <p className="text-red-500">Error: {exportError}</p>
          ) : (
            <div>
              <p>Trabajos activos: {jobs.length}</p>
              <p>Plantillas disponibles: {templates.length}</p>
              <button
                onClick={handleCreateExportJob}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Crear Trabajo de Exportación
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Resumen de Estadísticas */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Resumen de Estadísticas</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-blue-100 rounded-lg">
            <h4 className="font-medium">Competencias</h4>
            <p className="text-2xl font-bold">{competitions.length}</p>
          </div>
          <div className="p-4 bg-green-100 rounded-lg">
            <h4 className="font-medium">Clanes</h4>
            <p className="text-2xl font-bold">{availableClans.length}</p>
          </div>
          <div className="p-4 bg-purple-100 rounded-lg">
            <h4 className="font-medium">Eventos</h4>
            <p className="text-2xl font-bold">{events.length}</p>
          </div>
          <div className="p-4 bg-yellow-100 rounded-lg">
            <h4 className="font-medium">Ofertas</h4>
            <p className="text-2xl font-bold">{availableOffers.length}</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HooksExample;
