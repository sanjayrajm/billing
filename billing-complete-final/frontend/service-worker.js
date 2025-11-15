const CACHE_NAME = 'billing-app-cache-v1';
const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/service-worker.js',
  '/assets/icon-192.png',
  '/assets/icon-512.png',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
];

self.addEventListener('install', evt => {
  evt.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(FILES_TO_CACHE)));
  self.skipWaiting();
});

self.addEventListener('activate', evt => {
  evt.waitUntil(caches.keys().then(keys => Promise.all(keys.map(k => k !== CACHE_NAME ? caches.delete(k) : Promise.resolve()))));
  self.clients.claim();
});

self.addEventListener('fetch', evt => {
  const url = new URL(evt.request.url);
  if(url.pathname.startsWith('/api/')) {
    evt.respondWith(fetch(evt.request).catch(()=> caches.match('/')));
    return;
  }
  evt.respondWith(
    caches.match(evt.request).then(resp => {
      return resp || fetch(evt.request).then(fetchResp => {
        return caches.open(CACHE_NAME).then(cache => { cache.put(evt.request, fetchResp.clone()); return fetchResp; });
      }).catch(()=> caches.match('/'));
    })
  );
});
