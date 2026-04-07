// Service Worker para FinançaBR PWA
const CACHE_NAME = 'financabr-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/vite.svg',
];

// Instalação do Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Cacheando assets estáticos');
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[SW] Erro ao cachear alguns assets:', err);
        // Continuar mesmo se alguns assets falharem
        return Promise.resolve();
      });
    })
  );
  self.skipWaiting();
});

// Ativação do Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deletando cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Estratégia de fetch: Network First com fallback para Cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorar requisições para APIs externas (cotações)
  if (url.hostname !== self.location.hostname) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cachear respostas bem-sucedidas de APIs externas
          if (response.ok && request.method === 'GET') {
            const cache = caches.open(CACHE_NAME);
            cache.then((c) => c.put(request, response.clone()));
          }
          return response;
        })
        .catch(() => {
          // Se falhar, tentar cache
          return caches.match(request).then((cachedResponse) => {
            return cachedResponse || new Response('Offline - dados não disponíveis', {
              status: 503,
              statusText: 'Service Unavailable',
            });
          });
        })
    );
    return;
  }

  // Para assets locais: Network First
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok && request.method === 'GET') {
          const cache = caches.open(CACHE_NAME);
          cache.then((c) => c.put(request, response.clone()));
        }
        return response;
      })
      .catch(() => {
        // Fallback para cache
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // Se não houver cache, retornar página offline
          if (request.destination === 'document') {
            return caches.match('/index.html');
          }
          return new Response('Recurso não disponível offline', {
            status: 404,
            statusText: 'Not Found',
          });
        });
      })
  );
});

// Sincronização em background (opcional)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-cotacoes') {
    event.waitUntil(
      fetch('/api/cotacoes')
        .then((response) => response.json())
        .then((data) => {
          // Armazenar no cache para uso offline
          caches.open(CACHE_NAME).then((cache) => {
            cache.put('/api/cotacoes', new Response(JSON.stringify(data)));
          });
        })
        .catch((err) => console.error('[SW] Erro na sincronização:', err))
    );
  }
});
