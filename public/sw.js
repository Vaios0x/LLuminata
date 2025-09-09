// Service Worker para Lluminata
const CACHE_NAME = 'lluminata-v1.0.0';
const STATIC_CACHE = 'lluminata-static-v1.0.0';
const DYNAMIC_CACHE = 'lluminata-dynamic-v1.0.0';

// Archivos estáticos para cachear
const STATIC_FILES = [
  '/',
  '/manifest.json',
  '/offline.html',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/apple-touch-icon.png'
];

// Rutas que deben funcionar offline
const OFFLINE_ROUTES = [
  '/',
  '/dashboard',
  '/lessons',
  '/assessments',
  '/profile',
  '/settings'
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker: Instalando...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Cacheando archivos estáticos');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('Service Worker: Instalación completada');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Error en instalación:', error);
      })
  );
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activando...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('Service Worker: Eliminando cache antiguo:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activación completada');
        return self.clients.claim();
      })
  );
});

// Interceptar requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Solo interceptar requests del mismo origen
  if (url.origin !== location.origin) {
    return;
  }
  
  // Estrategia para diferentes tipos de requests
  if (request.method === 'GET') {
    // Para archivos estáticos, usar cache-first
    if (STATIC_FILES.includes(url.pathname)) {
      event.respondWith(cacheFirst(request));
    }
    // Para APIs, usar network-first
    else if (url.pathname.startsWith('/api/')) {
      event.respondWith(networkFirst(request));
    }
    // Para páginas, usar network-first con fallback offline
    else if (OFFLINE_ROUTES.some(route => url.pathname.startsWith(route))) {
      event.respondWith(networkFirstWithOfflineFallback(request));
    }
    // Para otros recursos, usar stale-while-revalidate
    else {
      event.respondWith(staleWhileRevalidate(request));
    }
  }
});

// Estrategia Cache First
async function cacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('Cache First Error:', error);
    return new Response('Error de conexión', { status: 503 });
  }
}

// Estrategia Network First
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    return new Response('Error de conexión', { status: 503 });
  }
}

// Estrategia Network First con fallback offline
async function networkFirstWithOfflineFallback(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Fallback a página offline
    if (request.destination === 'document') {
      const offlineResponse = await caches.match('/offline.html');
      if (offlineResponse) {
        return offlineResponse;
      }
    }
    
    return new Response('Sin conexión', { 
      status: 503,
      headers: { 'Content-Type': 'text/html' }
    });
  }
}

// Estrategia Stale While Revalidate
async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cachedResponse = await cache.match(request);
  
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => {
    // Si falla la red, devolver cache si existe
    return cachedResponse || new Response('Sin conexión', { status: 503 });
  });
  
  return cachedResponse || fetchPromise;
}

// Manejar mensajes del cliente
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      }).then(() => {
        event.ports[0].postMessage({ success: true });
      })
    );
  }
});

// Sincronización en segundo plano
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  try {
    // Aquí se implementaría la lógica de sincronización
    console.log('Service Worker: Ejecutando sincronización en segundo plano');
  } catch (error) {
    console.error('Service Worker: Error en sincronización:', error);
  }
}

// Notificaciones push
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: data.primaryKey || 1
      },
      actions: [
        {
          action: 'explore',
          title: 'Ver detalles',
          icon: '/icon-192x192.png'
        },
        {
          action: 'close',
          title: 'Cerrar',
          icon: '/icon-192x192.png'
        }
      ]
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Manejar clics en notificaciones
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/dashboard')
    );
  } else if (event.action === 'close') {
    // Solo cerrar la notificación
  } else {
    // Clic en la notificación (no en una acción)
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

console.log('Service Worker: Cargado correctamente');
