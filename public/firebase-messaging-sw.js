// firebase-messaging-sw.js
// Self-cleanup service worker for development & cache-reset

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
      .then(() => self.registration.unregister())
      .then(() => self.clients.claim())
  );
});

// Do not intercept any fetch events so network requests pass directly to Vite
self.addEventListener('fetch', (event) => {
  return;
});
