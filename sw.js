/* ============================================================================
   Service worker mínimo: cache-first de los assets estáticos para que la app
   funcione offline e instalada como PWA.

   ⚠️  IMPORTANTE: al publicar CUALQUIER cambio (HTML/CSS/JS), subí la versión
   de CACHE (cava-v1 → cava-v2, etc.). Sin ese bump, los clientes instalados
   siguen viendo la versión vieja para siempre.
   ============================================================================ */
const CACHE = 'cava-v68';

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
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // El "shell" (navegaciones + HTML/CSS/JS) va NETWORK-FIRST: siempre la última
  // versión si hay red, y se refresca la cache. Sin red, cae a la cache. Así los
  // cambios se ven al recargar, sin depender de bumpear CACHE ni de cerrar la PWA.
  const isShell = request.mode === 'navigate' || /\.(html|css|js)$/.test(url.pathname);
  if (isShell) {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy));
          return res;
        })
        .catch(() => caches.match(request, { ignoreSearch: true })
          .then((cached) => cached || (request.mode === 'navigate' ? caches.match('./index.html') : Response.error())))
    );
    return;
  }

  // Resto (íconos, manifest): CACHE-FIRST (casi nunca cambian).
  event.respondWith(
    caches.match(request, { ignoreSearch: true }).then((cached) => cached || fetch(request))
  );
});
