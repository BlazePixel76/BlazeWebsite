// startpage-sw.js | PWA Service Worker
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
        console.log('Caching files:', urlsToCache);
        return cache.addAll(urlsToCache);
      }).catch(error => {
        console.error('Cache addAll failed:', error);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      }).catch(() => {
        return caches.match('./startpage.html');
      })
  );
});
