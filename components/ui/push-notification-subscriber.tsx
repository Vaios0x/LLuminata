'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from './button';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { Bell, BellOff, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface PushNotificationSubscriberProps {
  userId: string;
  culturalContext?: string;
  language?: string;
  onSubscriptionChange?: (subscribed: boolean) => void;
  className?: string;
}

interface SubscriptionStatus {
  supported: boolean;
  permission: NotificationPermission;
  subscribed: boolean;
  loading: boolean;
  error?: string;
}

/**
 * Componente para suscribirse a push notifications
 */
export const PushNotificationSubscriber: React.FC<PushNotificationSubscriberProps> = ({
  userId,
  culturalContext = 'general',
  language = 'es-MX',
  onSubscriptionChange,
  className = ''
}) => {
  const [status, setStatus] = useState<SubscriptionStatus>({
    supported: false,
    permission: 'default',
    subscribed: false,
    loading: true
  });

  // Verificar soporte y estado inicial
  useEffect(() => {
    checkNotificationSupport();
  }, []);

  // Verificar soporte de notificaciones
  const checkNotificationSupport = useCallback(async () => {
    try {
      setStatus(prev => ({ ...prev, loading: true }));

      // Verificar si el navegador soporta notificaciones
      if (!('Notification' in window)) {
        setStatus({
          supported: false,
          permission: 'denied',
          subscribed: false,
          loading: false,
          error: 'Tu navegador no soporta notificaciones push'
        });
        return;
      }

      // Verificar si el service worker está registrado
      if (!('serviceWorker' in navigator)) {
        setStatus({
          supported: false,
          permission: 'denied',
          subscribed: false,
          loading: false,
          error: 'Tu navegador no soporta service workers'
        });
        return;
      }

      // Verificar si PushManager está disponible
      if (!('PushManager' in window)) {
        setStatus({
          supported: false,
          permission: 'denied',
          subscribed: false,
          loading: false,
          error: 'Tu navegador no soporta push notifications'
        });
        return;
      }

      const permission = Notification.permission;
      
      // Verificar si ya está suscrito
      const isSubscribed = await checkExistingSubscription();

      setStatus({
        supported: true,
        permission,
        subscribed: isSubscribed,
        loading: false
      });

      onSubscriptionChange?.(isSubscribed);

    } catch (error) {
      console.error('Error verificando soporte de notificaciones:', error);
      setStatus({
        supported: false,
        permission: 'denied',
        subscribed: false,
        loading: false,
        error: 'Error verificando soporte de notificaciones'
      });
    }
  }, [onSubscriptionChange]);

  // Verificar suscripción existente
  const checkExistingSubscription = async (): Promise<boolean> => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      return !!subscription;
    } catch (error) {
      console.error('Error verificando suscripción existente:', error);
      return false;
    }
  };

  // Solicitar permisos
  const requestPermission = useCallback(async () => {
    try {
      setStatus(prev => ({ ...prev, loading: true, error: undefined }));

      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        // Intentar suscribir automáticamente después de obtener permisos
        await subscribeToPushNotifications();
      } else {
        setStatus(prev => ({
          ...prev,
          permission,
          loading: false,
          error: 'Permisos de notificación denegados'
        }));
      }
    } catch (error) {
      console.error('Error solicitando permisos:', error);
      setStatus(prev => ({
        ...prev,
        loading: false,
        error: 'Error solicitando permisos de notificación'
      }));
    }
  }, []);

  // Suscribirse a push notifications
  const subscribeToPushNotifications = useCallback(async () => {
    try {
      setStatus(prev => ({ ...prev, loading: true, error: undefined }));

      // Registrar service worker si no está registrado
      const registration = await navigator.serviceWorker.register('/service-worker.js');
      await navigator.serviceWorker.ready;

      // Obtener VAPID public key del servidor
      const vapidPublicKey = await getVapidPublicKey();
      
      if (!vapidPublicKey) {
        throw new Error('No se pudo obtener la clave pública VAPID');
      }

      // Convertir VAPID key a Uint8Array
      const vapidKeyArray = urlBase64ToUint8Array(vapidPublicKey);

      // Suscribirse
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidKeyArray
      });

      // Enviar suscripción al servidor
      await sendSubscriptionToServer(subscription);

      setStatus(prev => ({
        ...prev,
        subscribed: true,
        loading: false
      }));

      onSubscriptionChange?.(true);

      // Mostrar notificación de éxito
      showSuccessNotification();

    } catch (error) {
      console.error('Error suscribiéndose a push notifications:', error);
      setStatus(prev => ({
        ...prev,
        loading: false,
        error: 'Error suscribiéndose a notificaciones push'
      }));
    }
  }, [onSubscriptionChange]);

  // Cancelar suscripción
  const unsubscribeFromPushNotifications = useCallback(async () => {
    try {
      setStatus(prev => ({ ...prev, loading: true, error: undefined }));

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
      }

      // Notificar al servidor
      await sendUnsubscriptionToServer();

      setStatus(prev => ({
        ...prev,
        subscribed: false,
        loading: false
      }));

      onSubscriptionChange?.(false);

      // Mostrar notificación de cancelación
      showUnsubscribeNotification();

    } catch (error) {
      console.error('Error cancelando suscripción:', error);
      setStatus(prev => ({
        ...prev,
        loading: false,
        error: 'Error cancelando suscripción'
      }));
    }
  }, [onSubscriptionChange]);

  // Obtener VAPID public key del servidor
  const getVapidPublicKey = async (): Promise<string> => {
    try {
      const response = await fetch('/api/notifications/push/vapid-key');
      const data = await response.json();
      return data.publicKey;
    } catch (error) {
      console.error('Error obteniendo VAPID key:', error);
      throw error;
    }
  };

  // Enviar suscripción al servidor
  const sendSubscriptionToServer = async (subscription: PushSubscription) => {
    try {
      const response = await fetch('/api/notifications/push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'subscribe',
          userId,
          subscription: {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: arrayBufferToBase64(subscription.getKey('p256dh')!),
              auth: arrayBufferToBase64(subscription.getKey('auth')!)
            }
          },
          userAgent: navigator.userAgent,
          culturalContext,
          language
        })
      });

      if (!response.ok) {
        throw new Error('Error enviando suscripción al servidor');
      }
    } catch (error) {
      console.error('Error enviando suscripción:', error);
      throw error;
    }
  };

  // Enviar cancelación al servidor
  const sendUnsubscriptionToServer = async () => {
    try {
      const response = await fetch('/api/notifications/push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'unsubscribe',
          userId
        })
      });

      if (!response.ok) {
        throw new Error('Error enviando cancelación al servidor');
      }
    } catch (error) {
      console.error('Error enviando cancelación:', error);
      throw error;
    }
  };

  // Mostrar notificación de éxito
  const showSuccessNotification = () => {
    const title = culturalContext === 'maya' ? '¡Ma\'alob!' : 
                  culturalContext === 'nahuatl' ? '¡Niltze!' : 
                  '¡Éxito!';
    
    const message = culturalContext === 'maya' ? 'Ya puedes recibir notificaciones' :
                    culturalContext === 'nahuatl' ? 'Ya puedes recibir notificaciones' :
                    'Ya puedes recibir notificaciones de LLuminata';

    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body: message,
        icon: '/icons/notification-icon.png',
        badge: '/icons/badge-icon.png'
      });
    }
  };

  // Mostrar notificación de cancelación
  const showUnsubscribeNotification = () => {
    const title = culturalContext === 'maya' ? 'Cancelado' : 
                  culturalContext === 'nahuatl' ? 'Cancelado' : 
                  'Suscripción cancelada';
    
    const message = culturalContext === 'maya' ? 'Ya no recibirás notificaciones' :
                    culturalContext === 'nahuatl' ? 'Ya no recibirás notificaciones' :
                    'Ya no recibirás notificaciones push';

    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body: message,
        icon: '/icons/notification-icon.png',
        badge: '/icons/badge-icon.png'
      });
    }
  };

  // Obtener texto cultural
  const getCulturalText = (key: string) => {
    const texts: Record<string, Record<string, string>> = {
      'enable_notifications': {
        'es-MX': 'Habilitar notificaciones',
        'maya': 'Tz\'aakal notificaciones',
        'nahuatl': 'Tlahtlaliztli notificaciones'
      },
      'disable_notifications': {
        'es-MX': 'Deshabilitar notificaciones',
        'maya': 'Tz\'aakal notificaciones',
        'nahuatl': 'Tlahtlaliztli notificaciones'
      },
      'notifications_enabled': {
        'es-MX': 'Notificaciones habilitadas',
        'maya': 'Notificaciones tz\'aakal',
        'nahuatl': 'Notificaciones tlahtlaliztli'
      },
      'notifications_disabled': {
        'es-MX': 'Notificaciones deshabilitadas',
        'maya': 'Notificaciones tz\'aakal',
        'nahuatl': 'Notificaciones tlahtlaliztli'
      },
      'request_permission': {
        'es-MX': 'Solicitar permisos',
        'maya': 'Solicitar permisos',
        'nahuatl': 'Solicitar permisos'
      },
      'loading': {
        'es-MX': 'Cargando...',
        'maya': 'Cargando...',
        'nahuatl': 'Cargando...'
      }
    };
    
    return texts[key]?.[language] || texts[key]?.['es-MX'] || key;
  };

  // Renderizar según el estado
  if (status.loading) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">{getCulturalText('loading')}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!status.supported) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2 text-red-600">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{status.error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (status.permission === 'denied') {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-sm flex items-center space-x-2">
            <BellOff className="h-4 w-4 text-red-500" />
            <span>{getCulturalText('notifications_disabled')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-gray-600 mb-3">
            Los permisos de notificación fueron denegados. Para habilitar las notificaciones, 
            ve a la configuración de tu navegador y permite las notificaciones para este sitio.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open('chrome://settings/content/notifications', '_blank')}
            className="w-full"
          >
            Abrir configuración del navegador
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (status.subscribed) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-sm flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span>{getCulturalText('notifications_enabled')}</span>
            <Badge variant="secondary" className="text-xs">Activo</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-gray-600 mb-3">
            Recibirás notificaciones sobre nuevas lecciones, logros y recordatorios importantes.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={unsubscribeFromPushNotifications}
            disabled={status.loading}
            className="w-full"
          >
            {status.loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <BellOff className="h-4 w-4" />
            )}
            {getCulturalText('disable_notifications')}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-sm flex items-center space-x-2">
          <Bell className="h-4 w-4 text-blue-500" />
          <span>{getCulturalText('enable_notifications')}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-gray-600 mb-3">
          Recibe notificaciones sobre nuevas lecciones, logros y recordatorios importantes.
        </p>
        <Button
          variant="default"
          size="sm"
          onClick={status.permission === 'granted' ? subscribeToPushNotifications : requestPermission}
          disabled={status.loading}
          className="w-full"
        >
          {status.loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Bell className="h-4 w-4" />
          )}
          {status.permission === 'granted' 
            ? getCulturalText('enable_notifications')
            : getCulturalText('request_permission')
          }
        </Button>
      </CardContent>
    </Card>
  );
};

// ===== FUNCIONES AUXILIARES =====

// Convertir URL base64 a Uint8Array
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Convertir ArrayBuffer a base64
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

export default PushNotificationSubscriber;
