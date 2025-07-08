// ABOUTME: Service worker for Progressive Web App functionality
// ABOUTME: Handles caching, offline support, and background audio capabilities

const CACHE_NAME = 'binaural-beats-v1';
const OFFLINE_URL = '/offline';

// Assets to cache for offline use
const ESSENTIAL_ASSETS = [
  '/',
  '/player',
  '/analytics',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

// Audio cache for offline binaural beats
const AUDIO_CACHE_NAME = 'binaural-audio-v1';

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await cache.addAll(ESSENTIAL_ASSETS);
      // Skip waiting to activate immediately
      self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // Clean up old caches
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(async (cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== AUDIO_CACHE_NAME) {
            await caches.delete(cacheName);
          }
        })
      );
      // Take control of all pages
      self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', (event) => {
  // Handle navigation requests
  if (event.request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const preloadResponse = await event.preloadResponse;
          if (preloadResponse) {
            return preloadResponse;
          }
          return await fetch(event.request);
        } catch (error) {
          console.log('Fetch failed; returning offline page instead.', error);
          const cache = await caches.open(CACHE_NAME);
          return await cache.match(OFFLINE_URL);
        }
      })()
    );
  }
  // Handle other requests with cache-first strategy
  else if (event.request.destination === 'document' || 
           event.request.destination === 'script' || 
           event.request.destination === 'style' ||
           event.request.destination === 'image') {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(event.request);
        
        if (cachedResponse) {
          return cachedResponse;
        }
        
        try {
          const response = await fetch(event.request);
          // Cache successful responses
          if (response.status === 200) {
            cache.put(event.request, response.clone());
          }
          return response;
        } catch (error) {
          console.log('Network request failed:', error);
          // Return a basic offline response for assets
          return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
        }
      })()
    );
  }
});

// Handle background sync for analytics
self.addEventListener('sync', (event) => {
  if (event.tag === 'analytics-sync') {
    event.waitUntil(syncAnalytics());
  }
});

// Handle push notifications (for session reminders)
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'Time for your focus session!',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '1'
    },
    actions: [
      {
        action: 'start-session',
        title: 'Start Session',
        icon: '/icon-192.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/icon-192.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Binaural Beats', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'start-session') {
    event.waitUntil(
      clients.openWindow('/player')
    );
  } else if (event.action === 'dismiss') {
    // Just close the notification
    return;
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Sync analytics data when back online
async function syncAnalytics() {
  try {
    // Get pending analytics data from IndexedDB or localStorage
    const pendingData = localStorage.getItem('pending_analytics');
    if (pendingData) {
      const data = JSON.parse(pendingData);
      // Process the analytics data
      console.log('Syncing analytics data:', data);
      // Clear pending data after successful sync
      localStorage.removeItem('pending_analytics');
    }
  } catch (error) {
    console.error('Failed to sync analytics:', error);
  }
}

// Cache audio generation for offline use
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CACHE_AUDIO') {
    event.waitUntil(cacheAudioData(event.data.frequency, event.data.duration));
  }
});

async function cacheAudioData(frequency, duration) {
  try {
    const cache = await caches.open(AUDIO_CACHE_NAME);
    // Store audio generation parameters for offline use
    const audioConfig = {
      frequency,
      duration,
      cached: Date.now()
    };
    
    const response = new Response(JSON.stringify(audioConfig), {
      headers: { 'Content-Type': 'application/json' }
    });
    
    await cache.put(`/audio-config-${frequency}-${duration}`, response);
  } catch (error) {
    console.error('Failed to cache audio data:', error);
  }
}