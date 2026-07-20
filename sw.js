/* ============================================================================
   Service worker mínimo: cache-first de los assets estáticos para que la app
   funcione offline e instalada como PWA.

   ⚠️  IMPORTANTE: al publicar CUALQUIER cambio (HTML/CSS/JS), subí la versión
   de CACHE (cava-v1 → cava-v2, etc.). Sin ese bump, los clientes instalados
   siguen viendo la versión vieja para siempre.
   ============================================================================ */
const CACHE = 'cava-v40';

const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.webmanifest',
  './icons/icon.svg',
  './icons/icon-180.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  if (new URL(request.url).origin !== self.location.origin) return;

  event.respondWith(
    caches.match(request, { ignoreSearch: true }).then((cached) => {
      if (cached) return cached;
      return fetch(request).catch(() => {
        // Sin red y sin cache: para navegaciones, devolvé el shell de la app.
        if (request.mode === 'navigate') return caches.match('./index.html');
        return Response.error();
      });
    })
  );
});
