const CACHE_NAME = 'thrust-parfums-v2';
const APP_SHELL = [
  './',
  './index.html',
  './painel.html',
  './manifest.json',
  './manifest-painel.json',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-512.png',
  './apple-touch-icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) =>
        Promise.allSettled(
          APP_SHELL.map((url) =>
            fetch(url, { cache: 'no-cache' })
              .then((res) => (res && res.ok ? cache.put(url, res) : null))
              .catch(() => null)
          )
        )
      )
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  let url;
  try {
    url = new URL(req.url);
  } catch (e) {
    return;
  }

  // Nunca intercepta chamadas ao Firebase, Google Auth, ImgBB ou origens externas dinâmicas
  if (
    url.origin !== self.location.origin ||
    url.hostname.includes('googleapis.com') ||
    url.hostname.includes('firebase') ||
    url.hostname.includes('imgbb.com')
  ) {
    return;
  }

  // Estratégia Network-First com fallback para cache offline (suporta vitrine e painel em repos separados)
  event.respondWith(
    fetch(req)
      .then((response) => {
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, clone)).catch(() => {});
        }
        return response;
      })
      .catch(() =>
        caches.match(req).then(
          (cached) =>
            cached ||
            caches.match('./') ||
            caches.match('./index.html') ||
            caches.match('./painel.html')
        )
      )
  );
});
