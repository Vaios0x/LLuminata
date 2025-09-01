'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { 
  Trophy, 
  Star, 
  Award, 
  Target, 
  TrendingUp, 
  Users, 
  Zap,
  Crown,
  Medal,
  X,
  CheckCircle,
  Gift
} from 'lucide-react';

interface GamificationNotification {
  id: string;
  type: 'badge_earned' | 'achievement_unlocked' | 'level_up' | 'competition_won' | 'reward_earned';
  title: string;
  message: string;
  icon?: string;
  points?: number;
  metadata?: any;
  timestamp: string;
  read: boolean;
}

interface GamificationNotificationProps {
  notifications: GamificationNotification[];
  onDismiss?: (id: string) => void;
  onMarkAsRead?: (id: string) => void;
  maxNotifications?: number;
}

export const GamificationNotification: React.FC<GamificationNotificationProps> = ({
  notifications,
  onDismiss,
  onMarkAsRead,
  maxNotifications = 5
}) => {
  const [visibleNotifications, setVisibleNotifications] = useState<GamificationNotification[]>([]);

  useEffect(() => {
    const unreadNotifications = notifications
      .filter(n => !n.read)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, maxNotifications);

    setVisibleNotifications(unreadNotifications);
  }, [notifications, maxNotifications]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'badge_earned':
        return <Award className="w-6 h-6 text-blue-600" />;
      case 'achievement_unlocked':
        return <Star className="w-6 h-6 text-yellow-600" />;
      case 'level_up':
        return <TrendingUp className="w-6 h-6 text-green-600" />;
      case 'competition_won':
        return <Trophy className="w-6 h-6 text-purple-600" />;
      case 'reward_earned':
        return <Gift className="w-6 h-6 text-pink-600" />;
      default:
        return <CheckCircle className="w-6 h-6 text-gray-600" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'badge_earned':
        return 'border-blue-200 bg-blue-50';
      case 'achievement_unlocked':
        return 'border-yellow-200 bg-yellow-50';
      case 'level_up':
        return 'border-green-200 bg-green-50';
      case 'competition_won':
        return 'border-purple-200 bg-purple-50';
      case 'reward_earned':
        return 'border-pink-200 bg-pink-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const handleDismiss = (id: string) => {
    setVisibleNotifications(prev => prev.filter(n => n.id !== id));
    onDismiss?.(id);
  };

  const handleMarkAsRead = (id: string) => {
    onMarkAsRead?.(id);
  };

  if (visibleNotifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {visibleNotifications.map((notification) => (
        <Card 
          key={notification.id} 
          className={`${getNotificationColor(notification.type)} shadow-lg border-l-4 border-l-current animate-in slide-in-from-right duration-300`}
        >
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                {getNotificationIcon(notification.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-gray-900">
                    {notification.title}
                  </h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDismiss(notification.id)}
                    className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                
                <p className="text-sm text-gray-600 mt-1">
                  {notification.message}
                </p>
                
                {notification.points && (
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge className="bg-green-100 text-green-800">
                      +{notification.points} puntos
                    </Badge>
                  </div>
                )}
                
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-gray-500">
                    {new Date(notification.timestamp).toLocaleTimeString()}
                  </span>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleMarkAsRead(notification.id)}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    Marcar como leído
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// Hook para manejar notificaciones de gamificación
export const useGamificationNotifications = () => {
  const [notifications, setNotifications] = useState<GamificationNotification[]>([]);

  const addNotification = (notification: Omit<GamificationNotification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: GamificationNotification = {
      ...notification,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      read: false
    };

    setNotifications(prev => [newNotification, ...prev]);

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      dismissNotification(newNotification.id);
    }, 5000);
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return {
    notifications,
    addNotification,
    dismissNotification,
    markAsRead,
    clearAll
  };
};

// Componente para mostrar un toast de gamificación
export const GamificationToast: React.FC<{
  type: string;
  title: string;
  message: string;
  points?: number;
  onClose: () => void;
}> = ({ type, title, message, points, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const getToastIcon = () => {
    switch (type) {
      case 'badge_earned':
        return <Award className="w-8 h-8 text-blue-600" />;
      case 'achievement_unlocked':
        return <Star className="w-8 h-8 text-yellow-600" />;
      case 'level_up':
        return <TrendingUp className="w-8 h-8 text-green-600" />;
      case 'competition_won':
        return <Trophy className="w-8 h-8 text-purple-600" />;
      case 'reward_earned':
        return <Gift className="w-8 h-8 text-pink-600" />;
      default:
        return <CheckCircle className="w-8 h-8 text-gray-600" />;
    }
  };

  const getToastColor = () => {
    switch (type) {
      case 'badge_earned':
        return 'bg-blue-500';
      case 'achievement_unlocked':
        return 'bg-yellow-500';
      case 'level_up':
        return 'bg-green-500';
      case 'competition_won':
        return 'bg-purple-500';
      case 'reward_earned':
        return 'bg-pink-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom duration-300">
      <Card className="w-80 shadow-xl border-0">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              {getToastIcon()}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-gray-900">
                  {title}
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <p className="text-sm text-gray-600 mt-1">
                {message}
              </p>
              
              {points && (
                <div className="flex items-center space-x-2 mt-2">
                  <Badge className="bg-green-100 text-green-800">
                    +{points} puntos
                  </Badge>
                </div>
              )}
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="mt-3">
            <div className={`h-1 ${getToastColor()} rounded-full animate-pulse`}></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
