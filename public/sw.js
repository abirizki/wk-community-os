/**
 * Service Worker: Bumi Warga — Community OS
 * Progressive Web App & Robust Offline-First Support
 */

const CACHE_VERSION = 'bumi-warga-v2';
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `dynamic-${CACHE_VERSION}`;

// Pre-cached assets for offline shell
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/offline.html',
  '/icons/icon.svg',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/icon-maskable-512x512.png'
];

// Installation: Cache App Shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(PRECACHE_URLS).catch((err) => {
        console.warn('[SW] Some precache items could not be loaded:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activation: Clean up stale caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== STATIC_CACHE && key !== DYNAMIC_CACHE) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Interceptor
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only process http and https schemes (ignore chrome-extension://, moz-extension://, etc.)
  if (!request.url.startsWith('http://') && !request.url.startsWith('https://')) {
    return;
  }

  const url = new URL(request.url);

  // 1. Navigation requests (HTML documents like /dashboard, /posyandu, /)
  if (
    request.mode === 'navigate' ||
    request.destination === 'document' ||
    (request.method === 'GET' && request.headers.get('accept')?.includes('text/html'))
  ) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache latest successful navigation response
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put(request, copy)).catch(() => {});
          }
          return response;
        })
        .catch(async () => {
          // Fallback to cached route, then root /index.html, then /offline.html
          try {
            const cachedResponse = await caches.match(request);
            if (cachedResponse) return cachedResponse;

            const cachedRoot = (await caches.match('/index.html')) || (await caches.match('/'));
            if (cachedRoot) return cachedRoot;

            const offlinePage = await caches.match('/offline.html');
            if (offlinePage) return offlinePage;
          } catch (matchErr) {
            console.warn('[SW] Cache match failed during navigation:', matchErr);
          }

          return new Response(
            '<!DOCTYPE html><html lang="id"><head><meta charset="utf-8"/><title>Bumi Warga - Mode Offline</title><meta name="viewport" content="width=device-width, initial-scale=1.0"/></head><body style="font-family:system-ui,-apple-system,sans-serif;padding:2rem;text-align:center;"><h2>Anda Sedang Offline</h2><p>Koneksi internet terputus. Buka kembali halaman ini setelah tersambung ke jaringan.</p></body></html>',
            {
              headers: { 'Content-Type': 'text/html; charset=utf-8' },
              status: 200
            }
          );
        })
    );
    return;
  }

  // 2. Static Assets (/assets/*, fonts, icons, styles, scripts) -> Stale-While-Revalidate with Safe Fallback
  const isStaticAsset = (
    url.pathname.startsWith('/assets/') ||
    url.pathname.startsWith('/icons/') ||
    url.hostname === 'fonts.googleapis.com' ||
    url.hostname === 'fonts.gstatic.com' ||
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'image' ||
    request.destination === 'font'
  );

  if (isStaticAsset) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          // Return cache immediately, revalidate in background safely
          fetch(request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                const copy = networkResponse.clone();
                caches.open(STATIC_CACHE).then((cache) => cache.put(request, copy)).catch(() => {});
              }
            })
            .catch(() => {});
          return cachedResponse;
        }

        return fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const copy = networkResponse.clone();
              caches.open(STATIC_CACHE).then((cache) => cache.put(request, copy)).catch(() => {});
            }
            return networkResponse;
          })
          .catch(() => {
            return new Response('', { status: 404, statusText: 'Not Found Offline' });
          });
      })
    );
    return;
  }

  // 3. API Requests
  if (url.pathname.startsWith('/api/')) {
    if (request.method !== 'GET') {
      // Mutations (POST, PUT, DELETE, etc.) are never cached in CacheStorage
      event.respondWith(
        fetch(request).catch(() => {
          return new Response(
            JSON.stringify({ 
              success: false, 
              offline: true, 
              message: 'Tidak dapat terhubung ke server (Offline).' 
            }),
            {
              headers: { 'Content-Type': 'application/json' },
              status: 503,
              statusText: 'Service Unavailable (Offline)'
            }
          );
        })
      );
      return;
    }

    // API GET Requests -> Network First with Dynamic Cache Fallback
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(request, copy).catch(() => {});
            });
          }
          return response;
        })
        .catch(async () => {
          const cachedResponse = await caches.match(request);
          if (cachedResponse) {
            return cachedResponse;
          }
          return new Response(
            JSON.stringify({ 
              success: false, 
              offline: true, 
              data: null, 
              message: 'Tidak ada koneksi internet. Menggunakan mode offline.' 
            }),
            {
              headers: { 'Content-Type': 'application/json' },
              status: 503,
              statusText: 'Service Unavailable (Offline)'
            }
          );
        })
    );
    return;
  }

  // 4. Default: Network with Cache fallback and safe catch
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).catch(() => {
        return new Response('Offline', { 
          status: 503, 
          statusText: 'Service Unavailable (Offline)',
          headers: { 'Content-Type': 'text/plain' } 
        });
      });
    })
  );
});

// Background Sync for offline mutations
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-offline-queue') {
    event.waitUntil(
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({ type: 'TRIGGER_OFFLINE_SYNC' });
        });
      })
    );
  }
});
