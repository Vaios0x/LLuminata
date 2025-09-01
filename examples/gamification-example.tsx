'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CompetitionBoard,
  ClanSystem,
  EventCalendar,
  TradingSystem,
  PersonalizationHub,
  GamificationDashboard,
  GamificationNotification,
  useGamificationNotifications
} from '@/components/gamification';

export const GamificationExample: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [userId] = useState('user-123'); // En un caso real, esto vendría del contexto de autenticación
  
  const { notifications, addNotification } = useGamificationNotifications();

  const handleTestNotification = () => {
    addNotification({
      type: 'badge_earned',
      title: '¡Nuevo Badge Desbloqueado!',
      message: 'Has ganado el badge "Estudiante Consistente"',
      points: 50
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Sistema de Gamificación Avanzada
          </h1>
          <p className="text-lg text-gray-600">
            Ejemplo de implementación de todos los componentes de gamificación
          </p>
        </div>

        {/* Botón de prueba para notificaciones */}
        <div className="mb-6">
          <Button onClick={handleTestNotification} variant="outline">
            Probar Notificación
          </Button>
        </div>

        {/* Tabs principales */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="competitions">Competencias</TabsTrigger>
            <TabsTrigger value="clans">Clanes</TabsTrigger>
            <TabsTrigger value="events">Eventos</TabsTrigger>
            <TabsTrigger value="trading">Intercambios</TabsTrigger>
            <TabsTrigger value="personalization">Personalización</TabsTrigger>
            <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Dashboard de Gamificación</CardTitle>
              </CardHeader>
              <CardContent>
                <GamificationDashboard userId={userId} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="competitions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Tablero de Competencias</CardTitle>
              </CardHeader>
              <CardContent>
                <CompetitionBoard 
                  userId={userId}
                  refreshInterval={30000}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="clans" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Sistema de Clanes</CardTitle>
              </CardHeader>
              <CardContent>
                <ClanSystem 
                  userId={userId}
                  refreshInterval={30000}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Calendario de Eventos</CardTitle>
              </CardHeader>
              <CardContent>
                <EventCalendar 
                  userId={userId}
                  refreshInterval={30000}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trading" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Sistema de Intercambios</CardTitle>
              </CardHeader>
              <CardContent>
                <TradingSystem 
                  userId={userId}
                  refreshInterval={30000}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="personalization" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Centro de Personalización</CardTitle>
              </CardHeader>
              <CardContent>
                <PersonalizationHub 
                  userId={userId}
                  refreshInterval={30000}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Sistema de Notificaciones</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Notificaciones Activas</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Las notificaciones aparecerán en la esquina superior derecha
                    </p>
                    <div className="space-y-2">
                      <Button 
                        onClick={() => addNotification({
                          type: 'level_up',
                          title: '¡Subiste de Nivel!',
                          message: 'Has alcanzado el nivel 5',
                          points: 100
                        })}
                        variant="outline"
                        size="sm"
                      >
                        Notificación de Nivel
                      </Button>
                      <Button 
                        onClick={() => addNotification({
                          type: 'achievement_unlocked',
                          title: '¡Logro Desbloqueado!',
                          message: 'Has completado 10 lecciones consecutivas',
                          points: 75
                        })}
                        variant="outline"
                        size="sm"
                      >
                        Notificación de Logro
                      </Button>
                      <Button 
                        onClick={() => addNotification({
                          type: 'competition_won',
                          title: '¡Ganaste la Competencia!',
                          message: 'Primer lugar en el torneo de matemáticas',
                          points: 200
                        })}
                        variant="outline"
                        size="sm"
                      >
                        Notificación de Victoria
                      </Button>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <h3 className="text-lg font-semibold mb-2">Estado de Notificaciones</h3>
                    <div className="text-sm text-gray-600">
                      <p>Notificaciones en cola: {notifications.length}</p>
                      <p>Notificaciones no leídas: {notifications.filter(n => !n.read).length}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Notificaciones flotantes */}
        <GamificationNotification 
          notifications={notifications}
          onDismiss={(id) => {
            // Lógica para descartar notificación
            console.log('Notificación descartada:', id);
          }}
          onMarkAsRead={(id) => {
            // Lógica para marcar como leída
            console.log('Notificación marcada como leída:', id);
          }}
        />
      </div>
    </div>
  );
};

export default GamificationExample;
