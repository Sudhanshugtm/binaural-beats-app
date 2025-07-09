const CACHE_NAME = 'beatful-v1.0.0';
const CACHE_VERSION = '1.0.0';
const AUDIO_CACHE_NAME = 'beatful-audio-v1.0.0';
const STATIC_CACHE_NAME = 'beatful-static-v1.0.0';

// Resources to cache immediately
const STATIC_RESOURCES = [
  '/',
  '/player',
  '/manifest.json',
  '/offline.html',
  '/placeholder.svg',
  '/icon-192.png',
  '/icon-512.png',
];

// Audio files to cache for offline use
const AUDIO_RESOURCES = [
  '/audio/binaural-40hz.mp3',
  '/audio/binaural-15hz.mp3',
  '/audio/binaural-8hz.mp3',
  '/audio/white-noise.mp3',
  '/audio/pink-noise.mp3',
];

// Network-first resources
const NETWORK_FIRST_ROUTES = [
  '/api/',
  '/auth/',
];

// Cache-first resources
const CACHE_FIRST_ROUTES = [
  '/static/',
  '/_next/static/',
  '/images/',
  '/audio/',
];

// Stale-while-revalidate resources
const STALE_WHILE_REVALIDATE_ROUTES = [
  '/dashboard',
  '/analytics',
  '/features',
];

class ServiceWorkerManager {
  constructor() {
    this.init();
  }

  init() {
    // Install event
    self.addEventListener('install', (event) => {
      console.log('Service Worker installing...');
      event.waitUntil(this.handleInstall());
    });

    // Activate event
    self.addEventListener('activate', (event) => {
      console.log('Service Worker activating...');
      event.waitUntil(this.handleActivate());
    });

    // Fetch event
    self.addEventListener('fetch', (event) => {
      event.respondWith(this.handleFetch(event));
    });

    // Background sync
    self.addEventListener('sync', (event) => {
      if (event.tag === 'background-sync') {
        event.waitUntil(this.handleBackgroundSync());
      }
    });

    // Push notifications
    self.addEventListener('push', (event) => {
      event.waitUntil(this.handlePush(event));
    });

    // Notification click
    self.addEventListener('notificationclick', (event) => {
      event.waitUntil(this.handleNotificationClick(event));
    });

    // Message handling
    self.addEventListener('message', (event) => {
      this.handleMessage(event);
    });
  }

  async handleInstall() {
    // Pre-cache static resources
    const staticCache = await caches.open(STATIC_CACHE_NAME);
    await staticCache.addAll(STATIC_RESOURCES);

    // Pre-cache audio resources
    const audioCache = await caches.open(AUDIO_CACHE_NAME);
    await this.cacheAudioResources(audioCache);

    // Skip waiting to immediately activate
    self.skipWaiting();
  }

  async handleActivate() {
    // Clean up old caches
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames.map(async (cacheName) => {
        if (
          cacheName !== CACHE_NAME &&
          cacheName !== STATIC_CACHE_NAME &&
          cacheName !== AUDIO_CACHE_NAME
        ) {
          console.log('Deleting old cache:', cacheName);
          return caches.delete(cacheName);
        }
      })
    );

    // Claim all clients
    self.clients.claim();
  }

  async handleFetch(event) {
    const { request } = event;
    const url = new URL(request.url);

    // Handle different caching strategies based on route
    if (this.isNetworkFirst(url.pathname)) {
      return this.networkFirst(request);
    } else if (this.isCacheFirst(url.pathname)) {
      return this.cacheFirst(request);
    } else if (this.isStaleWhileRevalidate(url.pathname)) {
      return this.staleWhileRevalidate(request);
    } else if (this.isAudioRequest(url.pathname)) {
      return this.handleAudioRequest(request);
    } else {
      return this.defaultStrategy(request);
    }
  }

  async networkFirst(request) {
    try {
      const response = await fetch(request);
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
      return response;
    } catch (error) {
      const cachedResponse = await caches.match(request);
      if (cachedResponse) {
        return cachedResponse;
      }
      return this.getOfflinePage();
    }
  }

  async cacheFirst(request) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    try {
      const response = await fetch(request);
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
      return response;
    } catch (error) {
      return this.getOfflinePage();
    }
  }

  async staleWhileRevalidate(request) {
    const cachedResponse = await caches.match(request);
    
    const fetchPromise = fetch(request).then(async (response) => {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
      return response;
    });

    return cachedResponse || fetchPromise;
  }

  async handleAudioRequest(request) {
    const audioCache = await caches.open(AUDIO_CACHE_NAME);
    const cachedResponse = await audioCache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }

    try {
      const response = await fetch(request);
      
      // Only cache successful audio responses
      if (response.ok && response.headers.get('content-type')?.includes('audio')) {
        audioCache.put(request, response.clone());
      }
      
      return response;
    } catch (error) {
      // Return a silence audio file for offline use
      return this.getSilenceAudio();
    }
  }

  async defaultStrategy(request) {
    try {
      const response = await fetch(request);
      
      // Cache successful responses
      if (response.ok) {
        const cache = await caches.open(CACHE_NAME);
        cache.put(request, response.clone());
      }
      
      return response;
    } catch (error) {
      const cachedResponse = await caches.match(request);
      return cachedResponse || this.getOfflinePage();
    }
  }

  async cacheAudioResources(cache) {
    const promises = AUDIO_RESOURCES.map(async (url) => {
      try {
        const response = await fetch(url);
        if (response.ok) {
          return cache.put(url, response);
        }
      } catch (error) {
        console.log('Failed to cache audio resource:', url);
      }
    });

    await Promise.allSettled(promises);
  }

  async getOfflinePage() {
    const cache = await caches.open(STATIC_CACHE_NAME);
    return cache.match('/offline.html') || new Response('Offline', { status: 503 });
  }

  async getSilenceAudio() {
    // Return a short silence audio file
    const silenceBuffer = new ArrayBuffer(1024);
    return new Response(silenceBuffer, {
      headers: { 'Content-Type': 'audio/mpeg' },
    });
  }

  async handleBackgroundSync() {
    // Handle background sync for offline actions
    const db = await this.openDB();
    const tx = db.transaction('pending-actions', 'readonly');
    const store = tx.objectStore('pending-actions');
    const actions = await store.getAll();

    for (const action of actions) {
      try {
        await this.syncAction(action);
        // Remove from pending actions
        const deleteTx = db.transaction('pending-actions', 'readwrite');
        await deleteTx.objectStore('pending-actions').delete(action.id);
      } catch (error) {
        console.log('Failed to sync action:', action.id);
      }
    }
  }

  async handlePush(event) {
    if (!event.data) return;

    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: data.id,
      },
      actions: [
        {
          action: 'explore',
          title: 'Start Session',
          icon: '/icon-192.png',
        },
        {
          action: 'close',
          title: 'Dismiss',
          icon: '/icon-192.png',
        },
      ],
    };

    return self.registration.showNotification(data.title, options);
  }

  async handleNotificationClick(event) {
    event.notification.close();

    if (event.action === 'explore') {
      const urlToOpen = new URL('/player', self.location.origin).href;
      
      const promiseChain = self.clients.matchAll({
        type: 'window',
        includeUncontrolled: true,
      }).then((windowClients) => {
        let matchingClient = null;

        for (let i = 0; i < windowClients.length; i++) {
          const windowClient = windowClients[i];
          if (windowClient.url === urlToOpen) {
            matchingClient = windowClient;
            break;
          }
        }

        if (matchingClient) {
          return matchingClient.focus();
        } else {
          return self.clients.openWindow(urlToOpen);
        }
      });

      return promiseChain;
    }
  }

  handleMessage(event) {
    const { type, payload } = event.data;

    switch (type) {
      case 'SKIP_WAITING':
        self.skipWaiting();
        break;
      case 'CACHE_AUDIO':
        this.cacheAudioFile(payload.url);
        break;
      case 'CLEAR_CACHE':
        this.clearCache();
        break;
      case 'GET_CACHE_INFO':
        this.getCacheInfo().then((info) => {
          event.ports[0].postMessage(info);
        });
        break;
    }
  }

  async cacheAudioFile(url) {
    try {
      const audioCache = await caches.open(AUDIO_CACHE_NAME);
      const response = await fetch(url);
      if (response.ok) {
        await audioCache.put(url, response);
      }
    } catch (error) {
      console.log('Failed to cache audio file:', url);
    }
  }

  async clearCache() {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map(name => caches.delete(name)));
  }

  async getCacheInfo() {
    const cacheNames = await caches.keys();
    const info = {};

    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName);
      const keys = await cache.keys();
      info[cacheName] = keys.length;
    }

    return info;
  }

  async openDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('BeatfulDB', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('pending-actions')) {
          db.createObjectStore('pending-actions', { keyPath: 'id' });
        }
      };
    });
  }

  async syncAction(action) {
    // Implement sync logic based on action type
    switch (action.type) {
      case 'SAVE_SESSION':
        return this.syncSession(action.data);
      case 'UPDATE_SETTINGS':
        return this.syncSettings(action.data);
      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  }

  async syncSession(sessionData) {
    return fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sessionData),
    });
  }

  async syncSettings(settingsData) {
    return fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settingsData),
    });
  }

  isNetworkFirst(pathname) {
    return NETWORK_FIRST_ROUTES.some(route => pathname.startsWith(route));
  }

  isCacheFirst(pathname) {
    return CACHE_FIRST_ROUTES.some(route => pathname.startsWith(route));
  }

  isStaleWhileRevalidate(pathname) {
    return STALE_WHILE_REVALIDATE_ROUTES.some(route => pathname.startsWith(route));
  }

  isAudioRequest(pathname) {
    return pathname.includes('/audio/') || pathname.match(/\.(mp3|wav|ogg|m4a)$/i);
  }
}

// Initialize the service worker
new ServiceWorkerManager();