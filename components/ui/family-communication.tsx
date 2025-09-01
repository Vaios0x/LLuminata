'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { Badge } from './badge';
import { Input } from './input';
import { 
  MessageSquare, 
  Phone, 
  Mail, 
  Users, 
  Calendar, 
  Clock, 
  Send, 
  Paperclip, 
  Smile,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  Star,
  Heart,
  Target,
  BookOpen,
  Activity,
  ArrowRight,
  RefreshCw,
  Filter,
  Search,
  Bell,
  Settings,
  Download,
  Eye,
  Edit,
  Trash2,
  Plus,
  Video,
  Image,
  FileText,
  Award,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useScreenReader } from '@/components/accessibility/screen-reader';
import { useHighContrast } from '@/components/accessibility/high-contrast';

interface FamilyMember {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  email: string;
  preferredContact: 'phone' | 'email' | 'both';
  language: string;
  culturalContext: string;
  isPrimary: boolean;
}

interface Student {
  id: string;
  name: string;
  grade: string;
  avatar: string;
  culturalBackground: string;
  specialNeeds: string[];
  familyMembers: FamilyMember[];
}

interface CommunicationMessage {
  id: string;
  type: 'message' | 'report' | 'alert' | 'reminder';
  title: string;
  content: string;
  senderId: string;
  senderName: string;
  senderRole: 'teacher' | 'family' | 'admin';
  recipients: string[];
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'sent' | 'delivered' | 'read' | 'failed';
  createdAt: string;
  readAt?: string;
  attachments?: Array<{
    id: string;
    name: string;
    type: string;
    size: number;
    url: string;
  }>;
  metadata: Record<string, any>;
}

interface WeeklyReport {
  id: string;
  studentId: string;
  weekStart: string;
  weekEnd: string;
  lessonsCompleted: number;
  lessonsAssigned: number;
  totalTimeSpent: number;
  averageScore: number;
  achievements: Array<{
    id: string;
    name: string;
    description: string;
    earnedAt: string;
  }>;
  recommendations: string[];
  improvementAreas: string[];
  culturalInsights: string[];
  generatedAt: string;
  sentToFamily: boolean;
}

interface FamilyCommunicationProps {
  studentId: string;
  teacherId: string;
  className?: string;
  showMessages?: boolean;
  showReports?: boolean;
  showAlerts?: boolean;
  culturalContext?: string;
  language?: string;
}

interface MessageFilters {
  type: string;
  priority: string;
  status: string;
  search: string;
  dateRange: string;
}

export const FamilyCommunication: React.FC<FamilyCommunicationProps> = ({
  studentId,
  teacherId,
  className = '',
  showMessages = true,
  showReports = true,
  showAlerts = true,
  culturalContext = 'general',
  language = 'es-MX'
}) => {
  const [student, setStudent] = useState<Student | null>(null);
  const [messages, setMessages] = useState<CommunicationMessage[]>([]);
  const [reports, setReports] = useState<WeeklyReport[]>([]);
  const [activeTab, setActiveTab] = useState<'messages' | 'reports' | 'alerts'>('messages');
  const [selectedMessage, setSelectedMessage] = useState<CommunicationMessage | null>(null);
  const [selectedReport, setSelectedReport] = useState<WeeklyReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<MessageFilters>({
    type: '',
    priority: '',
    status: '',
    search: '',
    dateRange: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [newMessage, setNewMessage] = useState({
    title: '',
    content: '',
    priority: 'normal' as const,
    recipients: [] as string[]
  });

  const { speak, isEnabled: screenReaderEnabled } = useScreenReader();
  const { isEnabled: highContrastEnabled, getStyles } = useHighContrast();

  // Cargar datos
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Simular carga de datos
      const mockStudent: Student = {
        id: studentId,
        name: 'María González',
        grade: '5to',
        avatar: '/avatars/maria.jpg',
        culturalBackground: 'maya',
        specialNeeds: ['dislexia'],
        familyMembers: [
          {
            id: 'family-1',
            name: 'Ana González',
            relationship: 'Madre',
            phone: '+52 999 123 4567',
            email: 'ana.gonzalez@email.com',
            preferredContact: 'both',
            language: 'es-MX',
            culturalContext: 'maya',
            isPrimary: true
          },
          {
            id: 'family-2',
            name: 'Carlos González',
            relationship: 'Padre',
            phone: '+52 999 123 4568',
            email: 'carlos.gonzalez@email.com',
            preferredContact: 'phone',
            language: 'es-MX',
            culturalContext: 'maya',
            isPrimary: false
          }
        ]
      };

      const mockMessages: CommunicationMessage[] = [
        {
          id: 'msg-1',
          type: 'message',
          title: 'Progreso de María en matemáticas',
          content: 'Hola Ana, quería compartir contigo el excelente progreso que María ha mostrado en matemáticas esta semana. Ha completado todas las lecciones asignadas y ha mejorado significativamente en su comprensión de fracciones.',
          senderId: teacherId,
          senderName: 'Prof. López',
          senderRole: 'teacher',
          recipients: ['family-1'],
          priority: 'normal',
          status: 'read',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          readAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          metadata: {
            subject: 'Matemáticas',
            progress: 85
          }
        },
        {
          id: 'msg-2',
          type: 'alert',
          title: 'María necesita apoyo adicional',
          content: 'Hemos notado que María está teniendo dificultades con la lectura. Te sugiero que programemos una reunión para discutir estrategias de apoyo.',
          senderId: teacherId,
          senderName: 'Prof. López',
          senderRole: 'teacher',
          recipients: ['family-1', 'family-2'],
          priority: 'high',
          status: 'delivered',
          createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          metadata: {
            alertType: 'academic_support',
            interventionNeeded: true
          }
        }
      ];

      const mockReports: WeeklyReport[] = [
        {
          id: 'report-1',
          studentId: studentId,
          weekStart: '2024-01-15',
          weekEnd: '2024-01-21',
          lessonsCompleted: 8,
          lessonsAssigned: 10,
          totalTimeSpent: 240,
          averageScore: 87,
          achievements: [
            {
              id: 'ach-1',
              name: 'Completó módulo de fracciones',
              description: 'María completó exitosamente el módulo de fracciones básicas',
              earnedAt: '2024-01-18T10:30:00Z'
            }
          ],
          recommendations: [
            'Continuar practicando fracciones en casa',
            'Leer 20 minutos diarios',
            'Participar en actividades de grupo'
          ],
          improvementAreas: [
            'Comprensión lectora',
            'Velocidad de lectura'
          ],
          culturalInsights: [
            'María muestra gran interés en las matemáticas mayas',
            'Responde bien a ejemplos culturales'
          ],
          generatedAt: new Date().toISOString(),
          sentToFamily: true
        }
      ];

      setStudent(mockStudent);
      setMessages(mockMessages);
      setReports(mockReports);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando datos');
      console.error('Error cargando datos de comunicación familiar:', err);
    } finally {
      setIsLoading(false);
    }
  }, [studentId, teacherId]);

  // Cargar datos al montar
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filtrar mensajes
  const filteredMessages = messages.filter(message => {
    if (filters.type && message.type !== filters.type) return false;
    if (filters.priority && message.priority !== filters.priority) return false;
    if (filters.status && message.status !== filters.status) return false;
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        message.title.toLowerCase().includes(searchLower) ||
        message.content.toLowerCase().includes(searchLower) ||
        message.senderName.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  // Enviar mensaje
  const sendMessage = useCallback(async () => {
    try {
      if (!newMessage.title || !newMessage.content) {
        throw new Error('Título y contenido son requeridos');
      }

      const message: CommunicationMessage = {
        id: `msg-${Date.now()}`,
        type: 'message',
        title: newMessage.title,
        content: newMessage.content,
        senderId: teacherId,
        senderName: 'Prof. López',
        senderRole: 'teacher',
        recipients: newMessage.recipients,
        priority: newMessage.priority,
        status: 'sent',
        createdAt: new Date().toISOString(),
        metadata: {}
      };

      setMessages(prev => [message, ...prev]);
      setNewMessage({ title: '', content: '', priority: 'normal', recipients: [] });

      if (screenReaderEnabled) {
        speak('Mensaje enviado exitosamente');
      }
    } catch (error) {
      console.error('Error enviando mensaje:', error);
    }
  }, [newMessage, teacherId, speak, screenReaderEnabled]);

  // Generar reporte semanal
  const generateWeeklyReport = useCallback(async () => {
    try {
      const report: WeeklyReport = {
        id: `report-${Date.now()}`,
        studentId: studentId,
        weekStart: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        weekEnd: new Date().toISOString().split('T')[0],
        lessonsCompleted: Math.floor(Math.random() * 10) + 5,
        lessonsAssigned: 10,
        totalTimeSpent: Math.floor(Math.random() * 300) + 120,
        averageScore: Math.floor(Math.random() * 30) + 70,
        achievements: [],
        recommendations: [
          'Continuar con el buen trabajo',
          'Practicar más en áreas de dificultad'
        ],
        improvementAreas: [],
        culturalInsights: [],
        generatedAt: new Date().toISOString(),
        sentToFamily: false
      };

      setReports(prev => [report, ...prev]);

      if (screenReaderEnabled) {
        speak('Reporte semanal generado exitosamente');
      }
    } catch (error) {
      console.error('Error generando reporte:', error);
    }
  }, [studentId, speak, screenReaderEnabled]);

  // Obtener texto cultural
  const getCulturalText = (key: string) => {
    const texts: Record<string, Record<string, string>> = {
      'family_communication': {
        'es-MX': 'Comunicación Familia-Escuela',
        'maya': 'Comunicación Familia-Escuela',
        'nahuatl': 'Comunicación Familia-Escuela'
      },
      'messages': {
        'es-MX': 'Mensajes',
        'maya': 'Mensajes',
        'nahuatl': 'Mensajes'
      },
      'reports': {
        'es-MX': 'Reportes',
        'maya': 'Reportes',
        'nahuatl': 'Reportes'
      },
      'alerts': {
        'es-MX': 'Alertas',
        'maya': 'Alertas',
        'nahuatl': 'Alertas'
      },
      'send_message': {
        'es-MX': 'Enviar Mensaje',
        'maya': 'Enviar Mensaje',
        'nahuatl': 'Enviar Mensaje'
      },
      'generate_report': {
        'es-MX': 'Generar Reporte',
        'maya': 'Generar Reporte',
        'nahuatl': 'Generar Reporte'
      }
    };
    
    return texts[key]?.[language] || texts[key]?.['es-MX'] || key;
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span>Cargando comunicación familiar...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 text-red-600">
            <XCircle className="w-5 h-5" />
            <span>Error: {error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!student) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No se encontró información del estudiante</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">{getCulturalText('family_communication')}</h2>
            <p className="text-gray-600">Estudiante: {student.name} - {student.grade}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            aria-label="Alternar filtros"
            tabIndex={0}
          >
            <Filter className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={isLoading}
            aria-label="Actualizar"
            tabIndex={0}
          >
            <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
          </Button>
        </div>
      </div>

      {/* Información de la familia */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>Miembros de la Familia</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {student.familyMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                style={highContrastEnabled ? getStyles() : {}}
              >
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold">{member.name}</h4>
                  <p className="text-sm text-gray-600">{member.relationship}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {member.preferredContact}
                    </Badge>
                    {member.isPrimary && (
                      <Badge variant="default" className="text-xs bg-blue-500">
                        Principal
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      // Acción para llamar
                    }}
                    aria-label={`Llamar a ${member.name}`}
                    tabIndex={0}
                  >
                    <Phone className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      // Acción para enviar email
                    }}
                    aria-label={`Enviar email a ${member.name}`}
                    tabIndex={0}
                  >
                    <Mail className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tabs de navegación */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {showMessages && (
          <button
            onClick={() => setActiveTab('messages')}
            className={cn(
              "flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors",
              activeTab === 'messages'
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            )}
            aria-label="Ver mensajes"
            tabIndex={0}
          >
            {getCulturalText('messages')}
          </button>
        )}
        {showReports && (
          <button
            onClick={() => setActiveTab('reports')}
            className={cn(
              "flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors",
              activeTab === 'reports'
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            )}
            aria-label="Ver reportes"
            tabIndex={0}
          >
            {getCulturalText('reports')}
          </button>
        )}
        {showAlerts && (
          <button
            onClick={() => setActiveTab('alerts')}
            className={cn(
              "flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors",
              activeTab === 'alerts'
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            )}
            aria-label="Ver alertas"
            tabIndex={0}
          >
            {getCulturalText('alerts')}
          </button>
        )}
      </div>

      {/* Filtros */}
      {showFilters && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Tipo</label>
                <select
                  value={filters.type}
                  onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  aria-label="Filtrar por tipo"
                  tabIndex={0}
                >
                  <option value="">Todos los tipos</option>
                  <option value="message">Mensaje</option>
                  <option value="report">Reporte</option>
                  <option value="alert">Alerta</option>
                  <option value="reminder">Recordatorio</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Prioridad</label>
                <select
                  value={filters.priority}
                  onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  aria-label="Filtrar por prioridad"
                  tabIndex={0}
                >
                  <option value="">Todas las prioridades</option>
                  <option value="low">Baja</option>
                  <option value="normal">Normal</option>
                  <option value="high">Alta</option>
                  <option value="urgent">Urgente</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Estado</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  aria-label="Filtrar por estado"
                  tabIndex={0}
                >
                  <option value="">Todos los estados</option>
                  <option value="sent">Enviado</option>
                  <option value="delivered">Entregado</option>
                  <option value="read">Leído</option>
                  <option value="failed">Fallido</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Buscar</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Buscar mensajes..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="w-full pl-10 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    aria-label="Buscar mensajes"
                    tabIndex={0}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contenido de tabs */}
      {activeTab === 'messages' && (
        <div className="space-y-4">
          {/* Nuevo mensaje */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="w-5 h-5" />
                <span>{getCulturalText('send_message')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Destinatarios</label>
                <div className="flex flex-wrap gap-2">
                  {student.familyMembers.map((member) => (
                    <button
                      key={member.id}
                      onClick={() => {
                        const isSelected = newMessage.recipients.includes(member.id);
                        setNewMessage(prev => ({
                          ...prev,
                          recipients: isSelected
                            ? prev.recipients.filter(id => id !== member.id)
                            : [...prev.recipients, member.id]
                        }));
                      }}
                      className={cn(
                        "px-3 py-1 rounded-full text-sm border transition-colors",
                        newMessage.recipients.includes(member.id)
                          ? "bg-blue-500 text-white border-blue-500"
                          : "bg-white text-gray-700 border-gray-300 hover:border-blue-500"
                      )}
                      aria-label={`Seleccionar ${member.name}`}
                      tabIndex={0}
                    >
                      {member.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Título</label>
                <Input
                  value={newMessage.title}
                  onChange={(e) => setNewMessage(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Asunto del mensaje"
                  aria-label="Título del mensaje"
                  tabIndex={0}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Mensaje</label>
                <textarea
                  value={newMessage.content}
                  onChange={(e) => setNewMessage(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Escribe tu mensaje aquí..."
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={4}
                  aria-label="Contenido del mensaje"
                  tabIndex={0}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Prioridad</label>
                    <select
                      value={newMessage.priority}
                      onChange={(e) => setNewMessage(prev => ({ ...prev, priority: e.target.value as any }))}
                      className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      aria-label="Seleccionar prioridad"
                      tabIndex={0}
                    >
                      <option value="low">Baja</option>
                      <option value="normal">Normal</option>
                      <option value="high">Alta</option>
                      <option value="urgent">Urgente</option>
                    </select>
                  </div>
                </div>

                <Button
                  onClick={sendMessage}
                  disabled={!newMessage.title || !newMessage.content || newMessage.recipients.length === 0}
                  aria-label="Enviar mensaje"
                  tabIndex={0}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Enviar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Lista de mensajes */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Mensajes Recientes</h3>
            {filteredMessages.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No hay mensajes</p>
                </CardContent>
              </Card>
            ) : (
              filteredMessages.map((message) => (
                <Card
                  key={message.id}
                  className="hover:shadow-md transition-all duration-200 cursor-pointer"
                  onClick={() => setSelectedMessage(message)}
                  style={highContrastEnabled ? getStyles() : {}}
                  tabIndex={0}
                  role="button"
                  aria-label={`Ver mensaje: ${message.title}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedMessage(message);
                    }
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-semibold">{message.title}</h4>
                          <Badge 
                            variant={message.priority === 'urgent' ? 'destructive' : 'secondary'}
                            className="text-xs"
                          >
                            {message.priority}
                          </Badge>
                          <Badge 
                            variant={message.status === 'read' ? 'default' : 'outline'}
                            className="text-xs"
                          >
                            {message.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{message.content}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>De: {message.senderName}</span>
                          <span>{new Date(message.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Reportes Semanales</h3>
            <Button
              onClick={generateWeeklyReport}
              aria-label="Generar reporte semanal"
              tabIndex={0}
            >
              <Plus className="w-4 h-4 mr-2" />
              {getCulturalText('generate_report')}
            </Button>
          </div>

          {reports.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No hay reportes generados</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {reports.map((report) => (
                <Card
                  key={report.id}
                  className="hover:shadow-md transition-all duration-200 cursor-pointer"
                  onClick={() => setSelectedReport(report)}
                  style={highContrastEnabled ? getStyles() : {}}
                  tabIndex={0}
                  role="button"
                  aria-label={`Ver reporte: ${report.weekStart} a ${report.weekEnd}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedReport(report);
                    }
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold mb-2">
                          Reporte Semanal: {report.weekStart} - {report.weekEnd}
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Lecciones:</span>
                            <p className="font-semibold">{report.lessonsCompleted}/{report.lessonsAssigned}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Tiempo:</span>
                            <p className="font-semibold">{report.totalTimeSpent} min</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Promedio:</span>
                            <p className="font-semibold">{report.averageScore}%</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Logros:</span>
                            <p className="font-semibold">{report.achievements.length}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {report.sentToFamily && (
                          <Badge variant="default" className="text-xs bg-green-500">
                            Enviado
                          </Badge>
                        )}
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'alerts' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Alertas y Notificaciones</h3>
          <Card>
            <CardContent className="p-6 text-center">
              <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
              <p className="text-gray-600">No hay alertas activas</p>
              <p className="text-sm text-gray-500 mt-2">
                Las alertas aparecerán aquí cuando sea necesario contactar a la familia
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal de detalles del mensaje */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Detalles del Mensaje</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedMessage(null)}
                  aria-label="Cerrar detalles"
                  tabIndex={0}
                >
                  <XCircle className="w-5 h-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">{selectedMessage.title}</h4>
                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                  <span>De: {selectedMessage.senderName}</span>
                  <span>Fecha: {new Date(selectedMessage.createdAt).toLocaleString()}</span>
                  <Badge variant="secondary">{selectedMessage.priority}</Badge>
                  <Badge variant="outline">{selectedMessage.status}</Badge>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="whitespace-pre-wrap">{selectedMessage.content}</p>
                </div>
              </div>

              {selectedMessage.attachments && selectedMessage.attachments.length > 0 && (
                <div>
                  <h5 className="font-semibold mb-2">Archivos adjuntos</h5>
                  <div className="space-y-2">
                    {selectedMessage.attachments.map((attachment) => (
                      <div key={attachment.id} className="flex items-center space-x-2 p-2 border rounded">
                        <Paperclip className="w-4 h-4" />
                        <span className="flex-1">{attachment.name}</span>
                        <Button variant="ghost" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    // Acción para responder
                  }}
                  aria-label="Responder mensaje"
                  tabIndex={0}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Responder
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    // Acción para reenviar
                  }}
                  aria-label="Reenviar mensaje"
                  tabIndex={0}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Reenviar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal de detalles del reporte */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Reporte Semanal Detallado</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedReport(null)}
                  aria-label="Cerrar detalles"
                  tabIndex={0}
                >
                  <XCircle className="w-5 h-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{selectedReport.lessonsCompleted}</div>
                  <div className="text-sm text-gray-600">Lecciones Completadas</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{selectedReport.totalTimeSpent}</div>
                  <div className="text-sm text-gray-600">Minutos de Estudio</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{selectedReport.averageScore}%</div>
                  <div className="text-sm text-gray-600">Promedio</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{selectedReport.achievements.length}</div>
                  <div className="text-sm text-gray-600">Logros</div>
                </div>
              </div>

              {selectedReport.achievements.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3 flex items-center">
                    <Award className="w-5 h-5 mr-2" />
                    Logros de la Semana
                  </h4>
                  <div className="space-y-2">
                    {selectedReport.achievements.map((achievement) => (
                      <div key={achievement.id} className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                        <Star className="w-5 h-5 text-yellow-500" />
                        <div>
                          <p className="font-medium">{achievement.name}</p>
                          <p className="text-sm text-gray-600">{achievement.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedReport.recommendations.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3 flex items-center">
                    <Target className="w-5 h-5 mr-2" />
                    Recomendaciones
                  </h4>
                  <ul className="space-y-2">
                    {selectedReport.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedReport.improvementAreas.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3 flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Áreas de Mejora
                  </h4>
                  <ul className="space-y-2">
                    {selectedReport.improvementAreas.map((area, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span>{area}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    // Acción para enviar a la familia
                  }}
                  disabled={selectedReport.sentToFamily}
                  aria-label="Enviar reporte a la familia"
                  tabIndex={0}
                >
                  <Send className="w-4 h-4 mr-2" />
                  {selectedReport.sentToFamily ? 'Ya enviado' : 'Enviar a la Familia'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    // Acción para descargar
                  }}
                  aria-label="Descargar reporte"
                  tabIndex={0}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Descargar PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default FamilyCommunication;
