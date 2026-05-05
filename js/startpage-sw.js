// startpage-sw.js - PWA Service Worker
// Cache-first strategy for offline support

const CACHE_NAME = 'startpage-v2';
const urlsToCache = [
  './',
  './startpage.html',
  './json/manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('🟢 Caching files:', urlsToCache);
        return cache.addAll(urlsToCache);
      }).catch(error => {
        console.error('❌ Cache addAll failed:', error);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version or fetch fresh
        return response || fetch(event.request);
      }).catch(() => {
        // Offline fallback
        return caches.match('./startpage.html');
      })
  );
});
