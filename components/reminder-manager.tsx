'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, Bell, Plus, Edit, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import { useCulturalText } from '@/lib/hooks/use-cultural-text';
import { useAccessibility } from '@/lib/hooks/useAccessibility';

interface Reminder {
  id: string;
  userId: string;
  type: 'lesson' | 'assessment' | 'meeting' | 'deadline';
  title: string;
  description: string;
  scheduledFor: string;
  reminderTimes: number[]; // minutos antes
  channels: ('push' | 'email' | 'sms')[];
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  metadata?: Record<string, any>;
  culturalContext?: string;
  language?: string;
  createdAt: string;
  updatedAt: string;
}

interface ReminderFormData {
  type: 'lesson' | 'assessment' | 'meeting' | 'deadline';
  title: string;
  description: string;
  scheduledFor: string;
  reminderTimes: number[];
  channels: ('push' | 'email' | 'sms')[];
  priority: 'low' | 'normal' | 'high' | 'urgent';
  metadata?: Record<string, any>;
  culturalContext?: string;
  language?: string;
}

export default function ReminderManager() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [formData, setFormData] = useState<ReminderFormData>({
    type: 'lesson',
    title: '',
    description: '',
    scheduledFor: '',
    reminderTimes: [15, 30, 60],
    channels: ['push', 'email'],
    priority: 'normal',
    culturalContext: 'general',
    language: 'es-MX'
  });

  const { getText } = useCulturalText();
  const { isHighContrast, isLargeText } = useAccessibility();

  // Simular carga de recordatorios
  useEffect(() => {
    const loadReminders = async () => {
      try {
        // Simular llamada a API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockReminders: Reminder[] = [
          {
            id: 'reminder-1',
            userId: 'user-123',
            type: 'lesson',
            title: 'Lección de Matemáticas Maya',
            description: 'Tienes una lección pendiente sobre números mayas',
            scheduledFor: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
            reminderTimes: [15, 30, 60],
            channels: ['push', 'email'],
            priority: 'normal',
            status: 'active',
            metadata: {
              lessonId: 'lesson-maya-001',
              subject: 'mathematics',
              culturalContext: 'maya'
            },
            culturalContext: 'maya',
            language: 'es-MX',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 'reminder-2',
            userId: 'user-123',
            type: 'assessment',
            title: 'Evaluación de Comprensión Lectora',
            description: 'Evaluación sobre textos en náhuatl',
            scheduledFor: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
            reminderTimes: [30, 60, 120],
            channels: ['push', 'email', 'sms'],
            priority: 'high',
            status: 'active',
            metadata: {
              assessmentId: 'assessment-nahuatl-001',
              subject: 'language',
              culturalContext: 'náhuatl'
            },
            culturalContext: 'náhuatl',
            language: 'es-MX',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 'reminder-3',
            userId: 'user-123',
            type: 'meeting',
            title: 'Reunión con Familia',
            description: 'Reunión para discutir el progreso del estudiante',
            scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            reminderTimes: [60, 120, 1440], // 1 hora, 2 horas, 1 día
            channels: ['push', 'email'],
            priority: 'high',
            status: 'active',
            metadata: {
              meetingType: 'family_conference',
              participants: ['family', 'teacher', 'student']
            },
            culturalContext: 'general',
            language: 'es-MX',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ];

        setReminders(mockReminders);
      } catch (error) {
        console.error('Error cargando recordatorios:', error);
      } finally {
        setLoading(false);
      }
    };

    loadReminders();
  }, []);

  const handleCreateReminder = async () => {
    try {
      const response = await fetch('/api/notifications/reminders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create_reminder',
          ...formData,
          userId: 'user-123' // En un sistema real, esto vendría del contexto de autenticación
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setReminders(prev => [...prev, result.data.reminder]);
        setShowForm(false);
        resetForm();
      } else {
        console.error('Error creando recordatorio');
      }
    } catch (error) {
      console.error('Error creando recordatorio:', error);
    }
  };

  const handleUpdateReminder = async () => {
    if (!editingReminder) return;

    try {
      const response = await fetch('/api/notifications/reminders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update_reminder',
          reminderId: editingReminder.id,
          ...formData
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setReminders(prev => prev.map(r => 
          r.id === editingReminder.id ? result.data.reminder : r
        ));
        setEditingReminder(null);
        setShowForm(false);
        resetForm();
      } else {
        console.error('Error actualizando recordatorio');
      }
    } catch (error) {
      console.error('Error actualizando recordatorio:', error);
    }
  };

  const handleDeleteReminder = async (reminderId: string) => {
    try {
      const response = await fetch('/api/notifications/reminders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'delete_reminder',
          reminderId
        }),
      });

      if (response.ok) {
        setReminders(prev => prev.filter(r => r.id !== reminderId));
      } else {
        console.error('Error eliminando recordatorio');
      }
    } catch (error) {
      console.error('Error eliminando recordatorio:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      type: 'lesson',
      title: '',
      description: '',
      scheduledFor: '',
      reminderTimes: [15, 30, 60],
      channels: ['push', 'email'],
      priority: 'normal',
      culturalContext: 'general',
      language: 'es-MX'
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'normal': return 'bg-blue-500 text-white';
      case 'low': return 'bg-gray-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'lesson': return '📚';
      case 'assessment': return '📝';
      case 'meeting': return '🤝';
      case 'deadline': return '⏰';
      default: return '📋';
    }
  };

  const formatReminderTimes = (times: number[]) => {
    return times.map(time => {
      if (time < 60) return `${time} min`;
      if (time < 1440) return `${Math.floor(time / 60)}h`;
      return `${Math.floor(time / 1440)}d`;
    }).join(', ');
  };

  const formatChannels = (channels: string[]) => {
    return channels.map(channel => {
      switch (channel) {
        case 'push': return '📱';
        case 'email': return '📧';
        case 'sms': return '💬';
        default: return channel;
      }
    }).join(' ');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2">{getText('cargando_recordatorios', 'Cargando recordatorios...')}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${isLargeText ? 'text-3xl' : ''}`}>
            {getText('gestor_recordatorios', 'Gestor de Recordatorios')}
          </h1>
          <p className="text-gray-600 mt-1">
            {getText('descripcion_recordatorios', 'Gestiona recordatorios automáticos para lecciones, evaluaciones y reuniones')}
          </p>
        </div>
        <Button 
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2"
          tabIndex={0}
          aria-label={getText('crear_recordatorio', 'Crear nuevo recordatorio')}
        >
          <Plus className="h-4 w-4" />
          {getText('nuevo_recordatorio', 'Nuevo Recordatorio')}
        </Button>
      </div>

      {/* Formulario de Crear/Editar */}
      {showForm && (
        <Card className={`${isHighContrast ? 'border-2 border-blue-500' : ''}`}>
          <CardHeader>
            <CardTitle>
              {editingReminder 
                ? getText('editar_recordatorio', 'Editar Recordatorio')
                : getText('crear_recordatorio', 'Crear Recordatorio')
              }
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  {getText('tipo', 'Tipo')}
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                  className="w-full p-2 border rounded-md"
                  tabIndex={0}
                >
                  <option value="lesson">{getText('leccion', 'Lección')}</option>
                  <option value="assessment">{getText('evaluacion', 'Evaluación')}</option>
                  <option value="meeting">{getText('reunion', 'Reunión')}</option>
                  <option value="deadline">{getText('fecha_limite', 'Fecha Límite')}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  {getText('prioridad', 'Prioridad')}
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
                  className="w-full p-2 border rounded-md"
                  tabIndex={0}
                >
                  <option value="low">{getText('baja', 'Baja')}</option>
                  <option value="normal">{getText('normal', 'Normal')}</option>
                  <option value="high">{getText('alta', 'Alta')}</option>
                  <option value="urgent">{getText('urgente', 'Urgente')}</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">
                  {getText('titulo', 'Título')}
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full p-2 border rounded-md"
                  placeholder={getText('titulo_placeholder', 'Ej: Lección de Matemáticas Maya')}
                  tabIndex={0}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">
                  {getText('descripcion', 'Descripción')}
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full p-2 border rounded-md"
                  rows={3}
                  placeholder={getText('descripcion_placeholder', 'Descripción del recordatorio...')}
                  tabIndex={0}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  {getText('fecha_programada', 'Fecha Programada')}
                </label>
                <input
                  type="datetime-local"
                  value={formData.scheduledFor}
                  onChange={(e) => setFormData(prev => ({ ...prev, scheduledFor: e.target.value }))}
                  className="w-full p-2 border rounded-md"
                  tabIndex={0}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  {getText('contexto_cultural', 'Contexto Cultural')}
                </label>
                <select
                  value={formData.culturalContext}
                  onChange={(e) => setFormData(prev => ({ ...prev, culturalContext: e.target.value }))}
                  className="w-full p-2 border rounded-md"
                  tabIndex={0}
                >
                  <option value="general">{getText('general', 'General')}</option>
                  <option value="maya">{getText('maya', 'Maya')}</option>
                  <option value="náhuatl">{getText('nahuatl', 'Náhuatl')}</option>
                  <option value="zapoteco">{getText('zapoteco', 'Zapoteco')}</option>
                  <option value="mixteco">{getText('mixteco', 'Mixteco')}</option>
                </select>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button 
                onClick={editingReminder ? handleUpdateReminder : handleCreateReminder}
                className="flex-1"
                tabIndex={0}
              >
                {editingReminder 
                  ? getText('actualizar', 'Actualizar')
                  : getText('crear', 'Crear')
                }
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowForm(false);
                  setEditingReminder(null);
                  resetForm();
                }}
                tabIndex={0}
              >
                {getText('cancelar', 'Cancelar')}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Recordatorios */}
      <Tabs defaultValue="active" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active" tabIndex={0}>
            {getText('activos', 'Activos')} ({reminders.filter(r => r.status === 'active').length})
          </TabsTrigger>
          <TabsTrigger value="paused" tabIndex={0}>
            {getText('pausados', 'Pausados')} ({reminders.filter(r => r.status === 'paused').length})
          </TabsTrigger>
          <TabsTrigger value="completed" tabIndex={0}>
            {getText('completados', 'Completados')} ({reminders.filter(r => r.status === 'completed').length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {reminders.filter(r => r.status === 'active').map((reminder) => (
            <Card key={reminder.id} className={`${isHighContrast ? 'border-2 border-green-500' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{getTypeIcon(reminder.type)}</span>
                      <h3 className="font-semibold">{reminder.title}</h3>
                      <Badge className={getPriorityColor(reminder.priority)}>
                        {getText(reminder.priority, reminder.priority)}
                      </Badge>
                    </div>
                    
                    <p className="text-gray-600 mb-2">{reminder.description}</p>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(reminder.scheduledFor).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {new Date(reminder.scheduledFor).toLocaleTimeString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Bell className="h-4 w-4" />
                        {formatReminderTimes(reminder.reminderTimes)}
                      </div>
                      <div className="flex items-center gap-1">
                        {formatChannels(reminder.channels)}
                      </div>
                    </div>

                    {reminder.culturalContext && reminder.culturalContext !== 'general' && (
                      <div className="mt-2">
                        <Badge variant="outline">
                          {getText(reminder.culturalContext, reminder.culturalContext)}
                        </Badge>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingReminder(reminder);
                        setFormData({
                          type: reminder.type,
                          title: reminder.title,
                          description: reminder.description,
                          scheduledFor: reminder.scheduledFor.slice(0, 16), // Formato datetime-local
                          reminderTimes: reminder.reminderTimes,
                          channels: reminder.channels,
                          priority: reminder.priority,
                          metadata: reminder.metadata,
                          culturalContext: reminder.culturalContext,
                          language: reminder.language
                        });
                        setShowForm(true);
                      }}
                      tabIndex={0}
                      aria-label={getText('editar_recordatorio', 'Editar recordatorio')}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteReminder(reminder.id)}
                      tabIndex={0}
                      aria-label={getText('eliminar_recordatorio', 'Eliminar recordatorio')}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {reminders.filter(r => r.status === 'active').length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  {getText('no_recordatorios_activos', 'No hay recordatorios activos')}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="paused" className="space-y-4">
          {reminders.filter(r => r.status === 'paused').length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  {getText('no_recordatorios_pausados', 'No hay recordatorios pausados')}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {reminders.filter(r => r.status === 'completed').length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  {getText('no_recordatorios_completados', 'No hay recordatorios completados')}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
