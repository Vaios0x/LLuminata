// Service Worker para InclusiveAI Coach
// Maneja push notifications y eventos offline

const CACHE_NAME = 'inclusive-ai-coach-v1';
const STATIC_CACHE = 'inclusive-ai-static-v1';
const DYNAMIC_CACHE = 'inclusive-ai-dynamic-v1';

// Archivos estáticos para cache
const STATIC_FILES = [
  '/',
  '/manifest.json',
  '/icons/notification-icon.png',
  '/icons/badge-icon.png',
  '/icons/welcome-icon.png',
  '/sounds/notification-new.mp3',
  '/sounds/notification-read.mp3',
  '/sounds/notification-delete.mp3'
];

// Instalar service worker
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker instalando...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('📦 Cacheando archivos estáticos...');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('✅ Service Worker instalado correctamente');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('❌ Error instalando Service Worker:', error);
      })
  );
});

// Activar service worker
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker activando...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Eliminar caches antiguos
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('🗑️ Eliminando cache antiguo:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('✅ Service Worker activado correctamente');
        return self.clients.claim();
      })
      .catch((error) => {
        console.error('❌ Error activando Service Worker:', error);
      })
  );
});

// Interceptar fetch requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Estrategia de cache para diferentes tipos de recursos
  if (request.method === 'GET') {
    // Archivos estáticos
    if (STATIC_FILES.includes(url.pathname)) {
      event.respondWith(cacheFirst(request, STATIC_CACHE));
    }
    // APIs
    else if (url.pathname.startsWith('/api/')) {
      event.respondWith(networkFirst(request, DYNAMIC_CACHE));
    }
    // Otros recursos
    else {
      event.respondWith(networkFirst(request, DYNAMIC_CACHE));
    }
  }
});

// Estrategia: Cache First
async function cacheFirst(request, cacheName) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Error en cacheFirst:', error);
    return new Response('Error de red', { status: 503 });
  }
}

// Estrategia: Network First
async function networkFirst(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('Red no disponible, usando cache:', error);
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    return new Response('Contenido no disponible offline', { status: 503 });
  }
}

// Manejar push notifications
self.addEventListener('push', (event) => {
  console.log('📨 Push notification recibida:', event);
  
  if (event.data) {
    try {
      const data = event.data.json();
      const options = {
        body: data.message,
        icon: data.icon || '/icons/notification-icon.png',
        badge: data.badge || '/icons/badge-icon.png',
        data: data.data || {},
        actions: data.actions || [],
        tag: data.tag || 'default',
        requireInteraction: data.requireInteraction || false,
        silent: data.silent || false,
        vibrate: data.vibrate || [200, 100, 200],
        timestamp: Date.now(),
        // Opciones de accesibilidad
        actions: [
          {
            action: 'open',
            title: 'Abrir',
            icon: '/icons/open-icon.png'
          },
          {
            action: 'close',
            title: 'Cerrar',
            icon: '/icons/close-icon.png'
          }
        ]
      };

      // Mostrar notificación
      event.waitUntil(
        self.registration.showNotification(data.title, options)
      );

      // Reproducir sonido si no está silenciado
      if (!data.silent) {
        playNotificationSound();
      }

    } catch (error) {
      console.error('Error procesando push notification:', error);
      
      // Notificación de fallback
      const fallbackOptions = {
        body: 'Nueva notificación disponible',
        icon: '/icons/notification-icon.png',
        badge: '/icons/badge-icon.png',
        tag: 'fallback'
      };

      event.waitUntil(
        self.registration.showNotification('InclusiveAI Coach', fallbackOptions)
      );
    }
  }
});

// Manejar clics en notificaciones
self.addEventListener('notificationclick', (event) => {
  console.log('🖱️ Notificación clickeada:', event);
  
  event.notification.close();

  const data = event.notification.data;
  const action = event.action;

  if (action === 'close') {
    return;
  }

  // Abrir la aplicación
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Si ya hay una ventana abierta, enfocarla
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Si no hay ventana abierta, abrir una nueva
        if (clients.openWindow) {
          let url = '/';
          
          // Navegar a una página específica según el tipo de notificación
          if (data && data.type) {
            switch (data.type) {
              case 'lesson':
                url = '/lessons';
                break;
              case 'assessment':
                url = '/assessments';
                break;
              case 'achievement':
                url = '/dashboard';
                break;
              case 'support':
                url = '/support';
                break;
              default:
                url = '/dashboard';
            }
          }
          
          return clients.openWindow(url);
        }
      })
  );
});

// Manejar cierre de notificaciones
self.addEventListener('notificationclose', (event) => {
  console.log('❌ Notificación cerrada:', event);
  
  // Enviar analytics si es necesario
  if (event.notification.data && event.notification.data.analytics) {
    sendAnalytics('notification_closed', event.notification.data);
  }
});

// Reproducir sonido de notificación
function playNotificationSound() {
  try {
    // Crear un audio context para reproducir sonido
    const audioContext = new (self.AudioContext || self.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
    
  } catch (error) {
    console.warn('No se pudo reproducir sonido de notificación:', error);
  }
}

// Enviar analytics
function sendAnalytics(event, data) {
  try {
    fetch('/api/analytics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event,
        data,
        timestamp: Date.now(),
        source: 'service_worker'
      })
    }).catch(error => {
      console.warn('Error enviando analytics:', error);
    });
  } catch (error) {
    console.warn('Error enviando analytics:', error);
  }
}

// Sincronización en background
self.addEventListener('sync', (event) => {
  console.log('🔄 Sincronización en background:', event);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      syncData()
    );
  }
});

// Sincronizar datos
async function syncData() {
  try {
    // Sincronizar datos offline
    const offlineData = await getOfflineData();
    
    if (offlineData.length > 0) {
      for (const data of offlineData) {
        try {
          await fetch(data.url, {
            method: data.method,
            headers: data.headers,
            body: data.body
          });
          
          // Eliminar datos sincronizados
          await removeOfflineData(data.id);
        } catch (error) {
          console.error('Error sincronizando datos:', error);
        }
      }
    }
  } catch (error) {
    console.error('Error en sincronización:', error);
  }
}

// Obtener datos offline
async function getOfflineData() {
  try {
    const cache = await caches.open('offline-data');
    const keys = await cache.keys();
    const data = [];
    
    for (const key of keys) {
      const response = await cache.match(key);
      if (response) {
        const offlineData = await response.json();
        data.push(offlineData);
      }
    }
    
    return data;
  } catch (error) {
    console.error('Error obteniendo datos offline:', error);
    return [];
  }
}

// Eliminar datos offline
async function removeOfflineData(id) {
  try {
    const cache = await caches.open('offline-data');
    await cache.delete(`/offline-data/${id}`);
  } catch (error) {
    console.error('Error eliminando datos offline:', error);
  }
}

// Manejar errores del service worker
self.addEventListener('error', (event) => {
  console.error('❌ Error en Service Worker:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('❌ Promesa rechazada en Service Worker:', event.reason);
});

console.log('🔔 Service Worker cargado correctamente');
