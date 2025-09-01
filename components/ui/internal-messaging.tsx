'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { Badge } from './badge';
import { Input } from './input';
import { 
  MessageSquare, 
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
  TrendingDown,
  Users,
  User,
  MoreHorizontal,
  Reply,
  Forward,
  Archive,
  Pin,
  Clock,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Hash,
  AtSign,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Minimize2,
  Maximize2,
  ChevronDown,
  ChevronUp,
  Circle,
  CheckCircle2,
  X,
  Zap,
  Shield,
  Lock,
  Unlock,
  Globe,
  Wifi,
  WifiOff
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useScreenReader } from '@/components/accessibility/screen-reader';
import { useHighContrast } from '@/components/accessibility/high-contrast';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'teacher' | 'admin' | 'coordinator' | 'support';
  avatar: string;
  status: 'online' | 'offline' | 'away' | 'busy';
  department: string;
  lastSeen: string;
  culturalContext: string;
  language: string;
}

interface Conversation {
  id: string;
  type: 'direct' | 'group' | 'channel';
  name: string;
  participants: string[];
  lastMessage?: {
    id: string;
    content: string;
    senderId: string;
    senderName: string;
    timestamp: string;
    type: 'text' | 'file' | 'image' | 'system';
  };
  unreadCount: number;
  isPinned: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  metadata: Record<string, any>;
}

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  type: 'text' | 'file' | 'image' | 'system' | 'reaction';
  timestamp: string;
  isEdited: boolean;
  isDeleted: boolean;
  reactions: Array<{
    emoji: string;
    users: string[];
  }>;
  replies: Message[];
  attachments?: Array<{
    id: string;
    name: string;
    type: string;
    size: number;
    url: string;
    thumbnail?: string;
  }>;
  metadata: Record<string, any>;
}

interface InternalMessagingProps {
  currentUserId: string;
  className?: string;
  showSidebar?: boolean;
  showHeader?: boolean;
  culturalContext?: string;
  language?: string;
}

interface MessageFilters {
  type: string;
  sender: string;
  dateRange: string;
  search: string;
  hasAttachments: boolean;
}

export const InternalMessaging: React.FC<InternalMessagingProps> = ({
  currentUserId,
  className = '',
  showSidebar = true,
  showHeader = true,
  culturalContext = 'general',
  language = 'es-MX'
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<MessageFilters>({
    type: '',
    sender: '',
    dateRange: '',
    search: '',
    hasAttachments: false
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showUserList, setShowUserList] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [forwardTo, setForwardTo] = useState<Conversation | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { speak, isEnabled: screenReaderEnabled } = useScreenReader();
  const { isEnabled: highContrastEnabled, getStyles } = useHighContrast();

  // Cargar datos
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Simular carga de datos
      const mockUsers: User[] = [
        {
          id: 'user-1',
          name: 'Prof. Ana López',
          email: 'ana.lopez@school.edu',
          role: 'teacher',
          avatar: '/avatars/ana.jpg',
          status: 'online',
          department: 'Matemáticas',
          lastSeen: new Date().toISOString(),
          culturalContext: 'maya',
          language: 'es-MX'
        },
        {
          id: 'user-2',
          name: 'Prof. Carlos Méndez',
          email: 'carlos.mendez@school.edu',
          role: 'teacher',
          avatar: '/avatars/carlos.jpg',
          status: 'away',
          department: 'Ciencias',
          lastSeen: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          culturalContext: 'náhuatl',
          language: 'es-MX'
        },
        {
          id: 'user-3',
          name: 'Lic. María González',
          email: 'maria.gonzalez@school.edu',
          role: 'admin',
          avatar: '/avatars/maria.jpg',
          status: 'online',
          department: 'Administración',
          lastSeen: new Date().toISOString(),
          culturalContext: 'zapoteco',
          language: 'es-MX'
        }
      ];

      const mockConversations: Conversation[] = [
        {
          id: 'conv-1',
          type: 'direct',
          name: 'Prof. Ana López',
          participants: [currentUserId, 'user-1'],
          lastMessage: {
            id: 'msg-1',
            content: '¿Has revisado los reportes de esta semana?',
            senderId: 'user-1',
            senderName: 'Prof. Ana López',
            timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
            type: 'text'
          },
          unreadCount: 2,
          isPinned: true,
          isArchived: false,
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          metadata: {}
        },
        {
          id: 'conv-2',
          type: 'group',
          name: 'Equipo de Maestros',
          participants: [currentUserId, 'user-1', 'user-2'],
          lastMessage: {
            id: 'msg-2',
            content: 'Reunión mañana a las 9:00 AM',
            senderId: 'user-2',
            senderName: 'Prof. Carlos Méndez',
            timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
            type: 'text'
          },
          unreadCount: 0,
          isPinned: false,
          isArchived: false,
          createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          metadata: {}
        }
      ];

      const mockMessages: Message[] = [
        {
          id: 'msg-1',
          conversationId: 'conv-1',
          senderId: 'user-1',
          senderName: 'Prof. Ana López',
          senderAvatar: '/avatars/ana.jpg',
          content: 'Hola, ¿cómo va todo?',
          type: 'text',
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          isEdited: false,
          isDeleted: false,
          reactions: [],
          replies: [],
          metadata: {}
        },
        {
          id: 'msg-2',
          conversationId: 'conv-1',
          senderId: currentUserId,
          senderName: 'Tú',
          senderAvatar: '/avatars/current-user.jpg',
          content: 'Todo bien, gracias. ¿Y tú?',
          type: 'text',
          timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
          isEdited: false,
          isDeleted: false,
          reactions: [
            { emoji: '👍', users: ['user-1'] }
          ],
          replies: [],
          metadata: {}
        },
        {
          id: 'msg-3',
          conversationId: 'conv-1',
          senderId: 'user-1',
          senderName: 'Prof. Ana López',
          senderAvatar: '/avatars/ana.jpg',
          content: '¿Has revisado los reportes de esta semana?',
          type: 'text',
          timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          isEdited: false,
          isDeleted: false,
          reactions: [],
          replies: [],
          metadata: {}
        }
      ];

      setUsers(mockUsers);
      setConversations(mockConversations);
      setMessages(mockMessages);
      setSelectedConversation(mockConversations[0]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando datos');
      console.error('Error cargando datos de mensajería interna:', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentUserId]);

  // Cargar datos al montar
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Auto-scroll al final de los mensajes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Enviar mensaje
  const sendMessage = useCallback(async () => {
    try {
      if (!newMessage.trim() || !selectedConversation) return;

      const message: Message = {
        id: `msg-${Date.now()}`,
        conversationId: selectedConversation.id,
        senderId: currentUserId,
        senderName: 'Tú',
        senderAvatar: '/avatars/current-user.jpg',
        content: newMessage,
        type: 'text',
        timestamp: new Date().toISOString(),
        isEdited: false,
        isDeleted: false,
        reactions: [],
        replies: replyTo ? [replyTo] : [],
        metadata: {}
      };

      setMessages(prev => [...prev, message]);
      setNewMessage('');
      setReplyTo(null);

      // Actualizar conversación
      setConversations(prev => 
        prev.map(conv => 
          conv.id === selectedConversation.id 
            ? {
                ...conv,
                lastMessage: {
                  id: message.id,
                  content: message.content,
                  senderId: message.senderId,
                  senderName: message.senderName,
                  timestamp: message.timestamp,
                  type: message.type
                },
                updatedAt: message.timestamp,
                unreadCount: 0
              }
            : conv
        )
      );

      if (screenReaderEnabled) {
        speak('Mensaje enviado');
      }
    } catch (error) {
      console.error('Error enviando mensaje:', error);
    }
  }, [newMessage, selectedConversation, currentUserId, replyTo, speak, screenReaderEnabled]);

  // Manejar archivo adjunto
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !selectedConversation) return;

    Array.from(files).forEach(file => {
      const message: Message = {
        id: `msg-${Date.now()}-${Math.random()}`,
        conversationId: selectedConversation.id,
        senderId: currentUserId,
        senderName: 'Tú',
        senderAvatar: '/avatars/current-user.jpg',
        content: `Archivo: ${file.name}`,
        type: 'file',
        timestamp: new Date().toISOString(),
        isEdited: false,
        isDeleted: false,
        reactions: [],
        replies: [],
        attachments: [{
          id: `att-${Date.now()}`,
          name: file.name,
          type: file.type,
          size: file.size,
          url: URL.createObjectURL(file)
        }],
        metadata: {}
      };

      setMessages(prev => [...prev, message]);
    });

    // Limpiar input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [selectedConversation, currentUserId]);

  // Filtrar mensajes
  const filteredMessages = messages.filter(message => {
    if (!selectedConversation) return false;
    if (message.conversationId !== selectedConversation.id) return false;
    if (filters.sender && message.senderId !== filters.sender) return false;
    if (filters.type && message.type !== filters.type) return false;
    if (filters.hasAttachments && (!message.attachments || message.attachments.length === 0)) return false;
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return message.content.toLowerCase().includes(searchLower);
    }
    return true;
  });

  // Obtener texto cultural
  const getCulturalText = (key: string) => {
    const texts: Record<string, Record<string, string>> = {
      'internal_messaging': {
        'es-MX': 'Mensajería Interna',
        'maya': 'Mensajería Interna',
        'nahuatl': 'Mensajería Interna'
      },
      'new_message': {
        'es-MX': 'Nuevo mensaje',
        'maya': 'Nuevo mensaje',
        'nahuatl': 'Nuevo mensaje'
      },
      'type_message': {
        'es-MX': 'Escribe un mensaje...',
        'maya': 'Escribe un mensaje...',
        'nahuatl': 'Escribe un mensaje...'
      },
      'send': {
        'es-MX': 'Enviar',
        'maya': 'Enviar',
        'nahuatl': 'Enviar'
      },
      'conversations': {
        'es-MX': 'Conversaciones',
        'maya': 'Conversaciones',
        'nahuatl': 'Conversaciones'
      },
      'users': {
        'es-MX': 'Usuarios',
        'maya': 'Usuarios',
        'nahuatl': 'Usuarios'
      }
    };
    
    return texts[key]?.[language] || texts[key]?.['es-MX'] || key;
  };

  // Obtener estado del usuario
  const getUserStatus = (status: string) => {
    switch (status) {
      case 'online':
        return <Circle className="w-3 h-3 text-green-500 fill-current" />;
      case 'away':
        return <Circle className="w-3 h-3 text-yellow-500 fill-current" />;
      case 'busy':
        return <Circle className="w-3 h-3 text-red-500 fill-current" />;
      default:
        return <Circle className="w-3 h-3 text-gray-400 fill-current" />;
    }
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span>Cargando mensajería interna...</span>
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

  return (
    <div className={cn("flex h-[600px] bg-white border rounded-lg overflow-hidden", className)}>
      {/* Sidebar */}
      {showSidebar && (
        <div className="w-80 border-r bg-gray-50 flex flex-col">
          {/* Header del sidebar */}
          <div className="p-4 border-b bg-white">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{getCulturalText('internal_messaging')}</h2>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowUserList(!showUserList)}
                  aria-label="Mostrar usuarios"
                  tabIndex={0}
                >
                  <Users className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
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
          </div>

          {/* Lista de conversaciones */}
          <div className="flex-1 overflow-y-auto">
            {conversations.map((conversation) => {
              const isSelected = selectedConversation?.id === conversation.id;
              const participant = users.find(u => u.id === conversation.participants.find(p => p !== currentUserId));
              
              return (
                <div
                  key={conversation.id}
                  className={cn(
                    "p-4 border-b cursor-pointer hover:bg-gray-100 transition-colors",
                    isSelected && "bg-blue-50 border-blue-200"
                  )}
                  onClick={() => setSelectedConversation(conversation)}
                  style={highContrastEnabled ? getStyles() : {}}
                  tabIndex={0}
                  role="button"
                  aria-label={`Conversación con ${conversation.name}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedConversation(conversation);
                    }
                  }}
                >
                  <div className="flex items-start space-x-3">
                    <div className="relative">
                      <img
                        src={participant?.avatar || '/avatars/default.jpg'}
                        alt={`Avatar de ${conversation.name}`}
                        className="w-10 h-10 rounded-full"
                      />
                      {participant && getUserStatus(participant.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium truncate">{conversation.name}</h3>
                        <div className="flex items-center space-x-1">
                          {conversation.isPinned && (
                            <Pin className="w-3 h-3 text-gray-400" />
                          )}
                          {conversation.unreadCount > 0 && (
                            <Badge variant="default" className="text-xs bg-red-500">
                              {conversation.unreadCount}
                            </Badge>
                          )}
                        </div>
                      </div>
                      {conversation.lastMessage && (
                        <div className="mt-1">
                          <p className="text-sm text-gray-600 truncate">
                            {conversation.lastMessage.senderName}: {conversation.lastMessage.content}
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(conversation.lastMessage.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Área principal */}
      <div className="flex-1 flex flex-col">
        {/* Header de la conversación */}
        {selectedConversation && (
          <div className="p-4 border-b bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  {selectedConversation.type === 'direct' ? (
                    <>
                      <img
                        src={users.find(u => u.id === selectedConversation.participants.find(p => p !== currentUserId))?.avatar || '/avatars/default.jpg'}
                        alt={`Avatar de ${selectedConversation.name}`}
                        className="w-10 h-10 rounded-full"
                      />
                      {getUserStatus(users.find(u => u.id === selectedConversation.participants.find(p => p !== currentUserId))?.status || 'offline')}
                    </>
                  ) : (
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold">{selectedConversation.name}</h3>
                  <p className="text-sm text-gray-600">
                    {selectedConversation.type === 'direct' 
                      ? users.find(u => u.id === selectedConversation.participants.find(p => p !== currentUserId))?.status || 'offline'
                      : `${selectedConversation.participants.length} participantes`
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMuted(!isMuted)}
                  aria-label={isMuted ? 'Activar sonidos' : 'Silenciar sonidos'}
                  tabIndex={0}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMinimized(!isMinimized)}
                  aria-label={isMinimized ? 'Maximizar' : 'Minimizar'}
                  tabIndex={0}
                >
                  {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  aria-label="Mostrar filtros"
                  tabIndex={0}
                >
                  <Filter className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Filtros */}
        {showFilters && selectedConversation && (
          <div className="p-4 border-b bg-gray-50">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                  <option value="text">Texto</option>
                  <option value="file">Archivo</option>
                  <option value="image">Imagen</option>
                  <option value="system">Sistema</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Remitente</label>
                <select
                  value={filters.sender}
                  onChange={(e) => setFilters(prev => ({ ...prev, sender: e.target.value }))}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  aria-label="Filtrar por remitente"
                  tabIndex={0}
                >
                  <option value="">Todos</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>{user.name}</option>
                  ))}
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

              <div className="flex items-center">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filters.hasAttachments}
                    onChange={(e) => setFilters(prev => ({ ...prev, hasAttachments: e.target.checked }))}
                    className="rounded"
                    aria-label="Solo mensajes con archivos"
                    tabIndex={0}
                  />
                  <span className="text-sm">Con archivos</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Mensajes */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {selectedConversation ? (
            <>
              {filteredMessages.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No hay mensajes</p>
                </div>
              ) : (
                filteredMessages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex space-x-3",
                      message.senderId === currentUserId ? "justify-end" : "justify-start"
                    )}
                  >
                    {message.senderId !== currentUserId && (
                      <img
                        src={message.senderAvatar}
                        alt={`Avatar de ${message.senderName}`}
                        className="w-8 h-8 rounded-full flex-shrink-0"
                      />
                    )}
                    <div className={cn(
                      "max-w-xs lg:max-w-md",
                      message.senderId === currentUserId ? "order-first" : "order-last"
                    )}>
                      <div className={cn(
                        "p-3 rounded-lg",
                        message.senderId === currentUserId
                          ? "bg-blue-500 text-white"
                          : "bg-gray-100 text-gray-900"
                      )}>
                        {replyTo && message.replies.includes(replyTo) && (
                          <div className="mb-2 p-2 bg-black bg-opacity-10 rounded text-sm">
                            <p className="font-medium">Respondiendo a:</p>
                            <p className="truncate">{replyTo.content}</p>
                          </div>
                        )}
                        <p className="whitespace-pre-wrap">{message.content}</p>
                        {message.attachments && message.attachments.length > 0 && (
                          <div className="mt-2 space-y-2">
                            {message.attachments.map((attachment) => (
                              <div key={attachment.id} className="flex items-center space-x-2 p-2 bg-black bg-opacity-10 rounded">
                                <Paperclip className="w-4 h-4" />
                                <span className="flex-1 text-sm truncate">{attachment.name}</span>
                                <Button variant="ghost" size="sm" className="text-xs">
                                  <Download className="w-3 h-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-1 text-xs text-gray-500">
                        <span>{message.senderName}</span>
                        <span>{new Date(message.timestamp).toLocaleTimeString()}</span>
                      </div>
                      {message.reactions.length > 0 && (
                        <div className="flex items-center space-x-1 mt-1">
                          {message.reactions.map((reaction, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {reaction.emoji} {reaction.users.length}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    {message.senderId === currentUserId && (
                      <img
                        src={message.senderAvatar}
                        alt={`Avatar de ${message.senderName}`}
                        className="w-8 h-8 rounded-full flex-shrink-0"
                      />
                    )}
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </>
          ) : (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Selecciona una conversación para comenzar</p>
            </div>
          )}
        </div>

        {/* Input de mensaje */}
        {selectedConversation && (
          <div className="p-4 border-t bg-white">
            {replyTo && (
              <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-800">Respondiendo a:</p>
                    <p className="text-sm text-blue-600 truncate">{replyTo.content}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setReplyTo(null)}
                    aria-label="Cancelar respuesta"
                    tabIndex={0}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
            <div className="flex items-end space-x-2">
              <div className="flex-1">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={getCulturalText('type_message')}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={1}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  aria-label="Escribir mensaje"
                  tabIndex={0}
                />
              </div>
              <div className="flex items-center space-x-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  aria-label="Adjuntar archivo"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  aria-label="Adjuntar archivo"
                  tabIndex={0}
                >
                  <Paperclip className="w-4 h-4" />
                </Button>
                <Button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  aria-label="Enviar mensaje"
                  tabIndex={0}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Panel de usuarios */}
      {showUserList && (
        <div className="w-64 border-l bg-gray-50">
          <div className="p-4 border-b bg-white">
            <h3 className="font-semibold">{getCulturalText('users')}</h3>
          </div>
          <div className="flex-1 overflow-y-auto">
            {users.map((user) => (
              <div
                key={user.id}
                className="p-3 border-b hover:bg-gray-100 cursor-pointer transition-colors"
                onClick={() => {
                  // Crear o abrir conversación directa
                  const existingConv = conversations.find(
                    conv => conv.type === 'direct' && conv.participants.includes(user.id)
                  );
                  if (existingConv) {
                    setSelectedConversation(existingConv);
                  } else {
                    // Crear nueva conversación
                    const newConv: Conversation = {
                      id: `conv-${Date.now()}`,
                      type: 'direct',
                      name: user.name,
                      participants: [currentUserId, user.id],
                      unreadCount: 0,
                      isPinned: false,
                      isArchived: false,
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString(),
                      metadata: {}
                    };
                    setConversations(prev => [newConv, ...prev]);
                    setSelectedConversation(newConv);
                  }
                  setShowUserList(false);
                }}
                style={highContrastEnabled ? getStyles() : {}}
                tabIndex={0}
                role="button"
                aria-label={`Iniciar conversación con ${user.name}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    // Lógica de clic
                  }
                }}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <img
                      src={user.avatar}
                      alt={`Avatar de ${user.name}`}
                      className="w-8 h-8 rounded-full"
                    />
                    {getUserStatus(user.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{user.name}</h4>
                    <p className="text-sm text-gray-600 truncate">{user.department}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default InternalMessaging;
