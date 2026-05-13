const CACHE_NAME = 'hebei-exam-v1';

const PRECACHE_URLS = [
  '/index.html',
  '/splash.html',
  '/simulate-prep.html',
  '/question-bank.html',
  '/question-detail.html',
  '/text-answer.html',
  '/voice-answer.html',
  '/record.html',
  '/statistics.html',
  '/profile.html',
  '/analysis.html',
  '/ai-answer.html',
  '/css/shared.css',
  '/js/config.js',
  '/js/supabase.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(PRECACHE_URLS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(names => {
      return Promise.all(
        names.filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin requests
  if (url.origin !== self.location.origin) return;

  // For API calls (Supabase), use network-first
  if (url.hostname === 'supabase.co' || url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request));
    return;
  }

  // For static assets, use cache-first
  event.respondWith(cacheFirst(request));
});

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch (e) {
    return new Response('离线模式 - 内容不可用', { status: 503 });
  }
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch (e) {
    const cached = await caches.match(request);
    if (cached) return cached;
    return new Response(JSON.stringify({ error: '离线模式' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
