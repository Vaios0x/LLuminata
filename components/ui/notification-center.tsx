'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { Badge } from './badge';
import { useNotifications } from '@/lib/notifications';
import { Bell, X, Check, Trash2, Settings, Volume2, VolumeX } from 'lucide-react';

interface NotificationCenterProps {
  userId: string;
  className?: string;
  maxNotifications?: number;
  autoClose?: boolean;
  autoCloseDelay?: number;
  showUnreadCount?: boolean;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  culturalContext?: string;
  language?: string;
}

interface NotificationItemProps {
  notification: any;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  culturalContext?: string;
  language?: string;
}

/**
 * Componente de centro de notificaciones accesible
 */
export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  userId,
  className = '',
  maxNotifications = 10,
  autoClose = true,
  autoCloseDelay = 5000,
  showUnreadCount = true,
  position = 'top-right',
  culturalContext = 'general',
  language = 'es-MX'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  
  const { getUserNotifications, markAsRead, deleteNotification, getStats } = useNotifications();
  const notificationRef = useRef<HTMLDivElement>(null);
  const autoCloseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cargar notificaciones
  const loadNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      const userNotifications = await getUserNotifications(userId, {
        limit: maxNotifications,
        offset: 0
      });
      
      setNotifications(userNotifications);
      
      // Contar no leídas
      const unread = userNotifications.filter(n => !n.readAt).length;
      setUnreadCount(unread);
      
    } catch (error) {
      console.error('Error cargando notificaciones:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId, maxNotifications, getUserNotifications]);

  // Cargar notificaciones al montar
  useEffect(() => {
    loadNotifications();
    
    // Recargar cada 30 segundos
    const interval = setInterval(loadNotifications, 30000);
    
    return () => clearInterval(interval);
  }, [loadNotifications]);

  // Auto-cerrar notificaciones
  useEffect(() => {
    if (autoClose && isOpen) {
      autoCloseTimeoutRef.current = setTimeout(() => {
        setIsOpen(false);
      }, autoCloseDelay);
    }
    
    return () => {
      if (autoCloseTimeoutRef.current) {
        clearTimeout(autoCloseTimeoutRef.current);
      }
    };
  }, [isOpen, autoClose, autoCloseDelay]);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Manejar teclas de accesibilidad
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'Escape':
        setIsOpen(false);
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        setIsOpen(!isOpen);
        break;
    }
  }, [isOpen]);

  // Marcar como leída
  const handleMarkAsRead = useCallback(async (notificationId: string) => {
    try {
      await markAsRead(notificationId, userId);
      
      // Actualizar estado local
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId 
            ? { ...n, readAt: new Date().toISOString() }
            : n
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      // Reproducir sonido si no está silenciado
      if (!isMuted) {
        playNotificationSound('read');
      }
      
    } catch (error) {
      console.error('Error marcando como leída:', error);
    }
  }, [markAsRead, userId, isMuted]);

  // Eliminar notificación
  const handleDelete = useCallback(async (notificationId: string) => {
    try {
      await deleteNotification(notificationId, userId);
      
      // Actualizar estado local
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      
      // Ajustar contador de no leídas
      const deletedNotification = notifications.find(n => n.id === notificationId);
      if (deletedNotification && !deletedNotification.readAt) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
    } catch (error) {
      console.error('Error eliminando notificación:', error);
    }
  }, [deleteNotification, userId, notifications]);

  // Reproducir sonido de notificación
  const playNotificationSound = (type: 'new' | 'read' | 'delete') => {
    try {
      const audio = new Audio();
      
      switch (type) {
        case 'new':
          audio.src = '/sounds/notification-new.mp3';
          break;
        case 'read':
          audio.src = '/sounds/notification-read.mp3';
          break;
        case 'delete':
          audio.src = '/sounds/notification-delete.mp3';
          break;
      }
      
      audio.volume = 0.5;
      audio.play().catch(() => {
        // Ignorar errores de audio
      });
    } catch (error) {
      // Ignorar errores de audio
    }
  };

  // Filtrar notificaciones
  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case 'unread':
        return !notification.readAt;
      case 'read':
        return notification.readAt;
      default:
        return true;
    }
  });

  // Obtener texto cultural
  const getCulturalText = (key: string) => {
    const texts: Record<string, Record<string, string>> = {
      'notifications': {
        'es-MX': 'Notificaciones',
        'maya': 'Notificaciones',
        'nahuatl': 'Notificaciones'
      },
      'no_notifications': {
        'es-MX': 'No hay notificaciones',
        'maya': 'Ma\' t\'aan notificaciones',
        'nahuatl': 'Amo notificaciones'
      },
      'mark_all_read': {
        'es-MX': 'Marcar todas como leídas',
        'maya': 'Tz\'aakal tuláakal',
        'nahuatl': 'Tlahtlaliztli'
      },
      'settings': {
        'es-MX': 'Configuración',
        'maya': 'Tz\'aakal',
        'nahuatl': 'Tlahtlaliztli'
      }
    };
    
    return texts[key]?.[language] || texts[key]?.['es-MX'] || key;
  };

  // Posición del centro de notificaciones
  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4';
      case 'top-right':
        return 'top-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      default:
        return 'top-4 right-4';
    }
  };

  return (
    <div className={`relative ${className}`} ref={notificationRef}>
      {/* Botón de notificaciones */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        className="relative"
        aria-label={`${getCulturalText('notifications')} (${unreadCount} no leídas)`}
        aria-expanded={isOpen}
        aria-haspopup="true"
        tabIndex={0}
      >
        <Bell className="h-5 w-5" />
        {showUnreadCount && unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs"
            aria-label={`${unreadCount} notificaciones no leídas`}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Centro de notificaciones */}
      {isOpen && (
        <div className={`absolute ${getPositionClasses()} z-50 w-80 max-h-96`}>
          <Card className="shadow-lg border-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">
                  {getCulturalText('notifications')}
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsMuted(!isMuted)}
                    aria-label={isMuted ? 'Activar sonidos' : 'Silenciar sonidos'}
                    className="h-8 w-8"
                  >
                    {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(false)}
                    aria-label="Cerrar notificaciones"
                    className="h-8 w-8"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {/* Filtros */}
              <div className="flex space-x-2">
                <Button
                  variant={filter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('all')}
                  className="text-xs"
                >
                  Todas
                </Button>
                <Button
                  variant={filter === 'unread' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('unread')}
                  className="text-xs"
                >
                  No leídas ({unreadCount})
                </Button>
                <Button
                  variant={filter === 'read' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('read')}
                  className="text-xs"
                >
                  Leídas
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-4 text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                  <p className="text-sm text-muted-foreground mt-2">Cargando...</p>
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="p-4 text-center">
                  <Bell className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {getCulturalText('no_notifications')}
                  </p>
                </div>
              ) : (
                <div className="max-h-64 overflow-y-auto">
                  {filteredNotifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onMarkAsRead={handleMarkAsRead}
                      onDelete={handleDelete}
                      culturalContext={culturalContext}
                      language={language}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

/**
 * Componente de item de notificación individual
 */
const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onDelete,
  culturalContext,
  language
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const isRead = !!notification.readAt;

  // Obtener icono según categoría
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'lesson':
        return '📚';
      case 'assessment':
        return '📝';
      case 'achievement':
        return '🏆';
      case 'reminder':
        return '⏰';
      case 'support':
        return '🆘';
      case 'system':
        return '⚙️';
      default:
        return '📢';
    }
  };

  // Obtener color según prioridad
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'border-red-500 bg-red-50';
      case 'high':
        return 'border-orange-500 bg-orange-50';
      case 'normal':
        return 'border-blue-500 bg-blue-50';
      case 'low':
        return 'border-gray-500 bg-gray-50';
      default:
        return 'border-gray-300 bg-white';
    }
  };

  // Formatear fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Ahora';
    if (diffInMinutes < 60) return `Hace ${diffInMinutes} min`;
    if (diffInMinutes < 1440) return `Hace ${Math.floor(diffInMinutes / 60)}h`;
    return date.toLocaleDateString(language || 'es-MX');
  };

  return (
    <div
      className={`p-3 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
        isRead ? 'opacity-75' : 'bg-blue-50'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="article"
      aria-label={`Notificación: ${notification.title}`}
    >
      <div className="flex items-start space-x-3">
        {/* Icono de categoría */}
        <div className="flex-shrink-0 text-lg">
          {getCategoryIcon(notification.category)}
        </div>

        {/* Contenido */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className={`text-sm font-medium ${isRead ? 'text-gray-600' : 'text-gray-900'}`}>
                {notification.title}
              </h4>
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                {notification.message}
              </p>
              <div className="flex items-center space-x-2 mt-2">
                <span className="text-xs text-gray-400">
                  {formatDate(notification.id.split('_')[1])}
                </span>
                {notification.priority !== 'normal' && (
                  <Badge 
                    variant={notification.priority === 'urgent' ? 'destructive' : 'secondary'}
                    className="text-xs"
                  >
                    {notification.priority}
                  </Badge>
                )}
              </div>
            </div>

            {/* Acciones */}
            <div className={`flex items-center space-x-1 transition-opacity ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}>
              {!isRead && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onMarkAsRead(notification.id)}
                  aria-label="Marcar como leída"
                  className="h-6 w-6"
                >
                  <Check className="h-3 w-3" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(notification.id)}
                aria-label="Eliminar notificación"
                className="h-6 w-6 text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Indicador de prioridad */}
      <div className={`mt-2 h-1 rounded-full ${getPriorityColor(notification.priority)}`} />
    </div>
  );
};

export default NotificationCenter;
