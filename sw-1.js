const CACHE = 'alghero2026-v10';
const STATIC = ['./manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', function(e) {
  e.waitUntil(caches.open(CACHE).then(function(cache) { return cache.addAll(STATIC); }));
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.filter(function(k){ return k !== CACHE; }).map(function(k){ return caches.delete(k); }));
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(e) {
  var isHTML = e.request.headers.get('Accept') && e.request.headers.get('Accept').includes('text/html');
  if (isHTML) {
    // HTML: altijd netwerk eerst → cache als fallback bij offline
    e.respondWith(
      fetch(e.request).then(function(response) {
        var clone = response.clone();
        caches.open(CACHE).then(function(cache) { cache.put(e.request, clone); });
        return response;
      }).catch(function() {
        return caches.match(e.request);
      })
    );
  } else {
    // Overige bestanden: cache eerst
    e.respondWith(
      caches.match(e.request).then(function(cached) {
        return cached || fetch(e.request);
      })
    );
  }
});
