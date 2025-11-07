// Service Worker para Ventas Mary PWA
const CACHE_NAME = 'ventas-mary-v2.1.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/assets/css/styles.css',
  '/manifest.json',
  '/assets/js/config.js',
  '/assets/js/firebase.js',
  '/assets/js/ui.js',
  '/assets/js/productos.js',
  '/assets/js/clientas.js',
  '/assets/js/autocompletado.js',
  '/assets/js/modales.js',
  '/assets/js/pwa.js',
  '/assets/js/voz.js',
  '/assets/js/main.js'
];

// Instalar Service Worker
self.addEventListener('install', (event) => {
  console.log('🚀 Ventas Mary PWA: Service Worker instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 Cache abierto');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('✅ Todos los archivos cacheados');
        return self.skipWaiting();
      })
  );
});

// Activar Service Worker
self.addEventListener('activate', (event) => {
  console.log('🔄 Ventas Mary PWA: Service Worker activando...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Eliminando cache antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('✅ Service Worker activado');
      return self.clients.claim();
    })
  );
});

// Interceptar requests (estrategia Cache First para recursos estáticos)
self.addEventListener('fetch', (event) => {
  // Solo cachear requests GET
  if (event.request.method !== 'GET') {
    return;
  }

  // No cachear Firebase requests (siempre online)
  if (event.request.url.includes('firebase') || 
      event.request.url.includes('googleapis.com') ||
      event.request.url.includes('firebaseio.com')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Si está en cache, devolverlo
        if (response) {
          return response;
        }

        // Si no está en cache, hacer fetch
        return fetch(event.request).then((response) => {
          // Verificar si es una respuesta válida
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clonar la respuesta
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });

          return response;
        });
      })
  );
});

// Manejar mensajes del cliente
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Notificaciones push (para futuras funcionalidades)
self.addEventListener('push', (event) => {
  console.log('📬 Push recibido:', event);
  
  const options = {
    body: event.data ? event.data.text() : 'Nueva actualización disponible',
    icon: '/assets/icons/icon-192.png',
    badge: '/assets/icons/icon-72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Ver',
        icon: '/assets/icons/icon-192.png'
      },
      {
        action: 'close',
        title: 'Cerrar',
        icon: '/assets/icons/icon-192.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Ventas Mary', options)
  );
});

// Manejar clicks en notificaciones
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Notificación clickeada:', event);
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

console.log('🌟 Ventas Mary PWA Service Worker cargado correctamente');