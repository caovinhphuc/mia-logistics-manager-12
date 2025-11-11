// MIA Logistics Manager Service Worker v2.0
const CACHE_NAME = 'mia-logistics-v2.0.0';
const STATIC_CACHE_NAME = 'mia-logistics-static-v2.0.0';
const DYNAMIC_CACHE_NAME = 'mia-logistics-dynamic-v2.0.0';
const API_CACHE_NAME = 'mia-logistics-api-v2.0.0';

// Cache configuration
const CACHE_CONFIG = {
  maxEntries: 100,
  maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
  strategy: 'cacheFirst', // cacheFirst, networkFirst, staleWhileRevalidate
};

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/static/css/main.css',
  '/static/js/main.js',
  '/manifest.json',
  '/favicon.ico',
  '/assets/icons/icon-192x192.png',
  '/assets/icons/icon-512x512.png',
  '/assets/icons/icon-72x72.png',
  '/offline', // Offline page
  '/login', // Login page for offline mode
];

// API endpoints to cache
const API_ENDPOINTS = [
  '/api/settings/volume-rules',
  '/api/transport/requests',
  '/api/warehouse/inventory',
  '/api/staff/employees',
  '/api/partners/data',
];

// Routes that should always be served from cache
const CACHE_FIRST_ROUTES = [
  '/static/',
  '/assets/',
  '/favicon.ico',
  '/manifest.json',
];

// Routes that should use network first
const NETWORK_FIRST_ROUTES = [
  '/api/',
  '/login',
  '/dashboard',
];

// Offline fallback routes
const OFFLINE_FALLBACKS = {
  '/': '/',
  '/login': '/',
  '/dashboard': '/',
  '/api/': '/'
};

// Background sync tags
const SYNC_TAGS = {
  TRANSPORT_REQUEST: 'transport-request-sync',
  WAREHOUSE_UPDATE: 'warehouse-update-sync',
  STAFF_UPDATE: 'staff-update-sync',
  PARTNER_UPDATE: 'partner-update-sync',
  LOG_SYNC: 'log-sync',
};

// Performance monitoring
const performanceMetrics = {
  cacheHits: 0,
  cacheMisses: 0,
  networkRequests: 0,
  errors: 0,
  startTime: Date.now(),
};

// Utility functions
const isApiRequest = (url) => url.includes('/api/');
const isStaticAsset = (url) => STATIC_ASSETS.some(asset => url.includes(asset));
const isCacheFirstRoute = (url) => CACHE_FIRST_ROUTES.some(route => url.includes(route));
const isNetworkFirstRoute = (url) => NETWORK_FIRST_ROUTES.some(route => url.includes(route));

// Cache management
const cleanOldCaches = async () => {
  const cacheNames = await caches.keys();
  const validCaches = [CACHE_NAME, STATIC_CACHE_NAME, DYNAMIC_CACHE_NAME, API_CACHE_NAME];

  return Promise.all(
    cacheNames.map(async (cacheName) => {
      if (!validCaches.includes(cacheName)) {
        console.log('Service Worker: Deleting old cache:', cacheName);
        return caches.delete(cacheName);
      }
    })
  );
};

const limitCacheSize = async (cacheName, maxEntries) => {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();

  if (keys.length > maxEntries) {
    const keysToDelete = keys.slice(0, keys.length - maxEntries);
    return Promise.all(keysToDelete.map(key => cache.delete(key)));
  }
};

// Cache strategies
const cacheFirst = async (request, cacheName) => {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    performanceMetrics.cacheHits++;
    return cachedResponse;
  }

  performanceMetrics.cacheMisses++;
  performanceMetrics.networkRequests++;

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('Service Worker: Network request failed:', error);
    performanceMetrics.errors++;
    throw error;
  }
};

const networkFirst = async (request, cacheName) => {
  try {
    performanceMetrics.networkRequests++;
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('Service Worker: Network failed, trying cache');
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      performanceMetrics.cacheHits++;
      return cachedResponse;
    }
    performanceMetrics.cacheMisses++;
    performanceMetrics.errors++;
    throw error;
  }
};

const staleWhileRevalidate = async (request, cacheName) => {
  const cachedResponse = await caches.match(request);

  const networkPromise = fetch(request).then(networkResponse => {
    if (networkResponse.ok) {
      const cache = caches.open(cacheName);
      cache.then(c => c.put(request, networkResponse.clone()));
    }
    return networkResponse;
  }).catch(error => {
    console.error('Service Worker: Network request failed:', error);
    performanceMetrics.errors++;
    return null;
  });

  if (cachedResponse) {
    performanceMetrics.cacheHits++;
    // Return cached response immediately, but update cache in background
    networkPromise;
    return cachedResponse;
  }

  performanceMetrics.cacheMisses++;
  performanceMetrics.networkRequests++;
  return networkPromise;
};

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing v2.0...');

  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then(async (cache) => {
        console.log('Service Worker: Caching static assets');
        try {
          await cache.addAll(STATIC_ASSETS.map(url => new Request(url, { cache: 'reload' })));
          console.log('Service Worker: Static assets cached successfully');
        } catch (error) {
          console.error('Service Worker: Failed to cache some static assets:', error);
          // Continue with partial cache
        }
      })
      .catch((error) => {
        console.error('Service Worker: Failed to open cache:', error);
      })
  );

  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating v2.0...');

  event.waitUntil(
    Promise.all([
      cleanOldCaches(),
      self.clients.claim()
    ]).then(() => {
      console.log('Service Worker: Activated successfully');
      // Send performance metrics to clients
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({
            type: 'SW_ACTIVATED',
            performance: performanceMetrics
          });
        });
      });
    })
  );
});

// Fetch event - intelligent caching strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip external requests
  if (!url.origin.includes(self.location.origin)) {
    return;
  }

  // Skip Chrome extension requests
  if (url.protocol === 'chrome-extension:') {
    return;
  }

  event.respondWith(
    (async () => {
      try {
        // Determine caching strategy based on request type
        if (isCacheFirstRoute(request.url) || isStaticAsset(request.url)) {
          return await cacheFirst(request, STATIC_CACHE_NAME);
        } else if (isNetworkFirstRoute(request.url) || isApiRequest(request.url)) {
          return await networkFirst(request, API_CACHE_NAME);
        } else {
          return await staleWhileRevalidate(request, DYNAMIC_CACHE_NAME);
        }
      } catch (error) {
        console.error('Service Worker: Fetch failed:', error);
        performanceMetrics.errors++;

        // Return main page for document requests (not offline page)
        if (request.destination === 'document') {
          const mainPage = await caches.match('/');
          if (mainPage) {
            return mainPage;
          }
        }

        // Return a basic error response
        return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
      }
    })()
  );
});

// Background sync for offline functionality
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync triggered:', event.tag);

  switch (event.tag) {
    case SYNC_TAGS.TRANSPORT_REQUEST:
      event.waitUntil(syncTransportRequests());
      break;
    case SYNC_TAGS.WAREHOUSE_UPDATE:
      event.waitUntil(syncWarehouseUpdates());
      break;
    case SYNC_TAGS.STAFF_UPDATE:
      event.waitUntil(syncStaffUpdates());
      break;
    case SYNC_TAGS.PARTNER_UPDATE:
      event.waitUntil(syncPartnerUpdates());
      break;
    case SYNC_TAGS.LOG_SYNC:
      event.waitUntil(syncLogs());
      break;
    default:
      console.log('Service Worker: Unknown sync tag:', event.tag);
  }
});

// Background sync functions
const syncTransportRequests = async () => {
  try {
    console.log('Service Worker: Syncing transport requests');
    // Implement transport request sync logic
    const pendingRequests = await getPendingTransportRequests();

    for (const request of pendingRequests) {
      try {
        await fetch('/api/transport/requests', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(request.data)
        });
        await removePendingTransportRequest(request.id);
      } catch (error) {
        console.error('Service Worker: Failed to sync transport request:', error);
      }
    }
  } catch (error) {
    console.error('Service Worker: Transport request sync failed:', error);
  }
};

const syncWarehouseUpdates = async () => {
  try {
    console.log('Service Worker: Syncing warehouse updates');
    // Implement warehouse update sync logic
    const pendingUpdates = await getPendingWarehouseUpdates();

    for (const update of pendingUpdates) {
      try {
        await fetch('/api/warehouse/inventory', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(update.data)
        });
        await removePendingWarehouseUpdate(update.id);
      } catch (error) {
        console.error('Service Worker: Failed to sync warehouse update:', error);
      }
    }
  } catch (error) {
    console.error('Service Worker: Warehouse update sync failed:', error);
  }
};

const syncStaffUpdates = async () => {
  try {
    console.log('Service Worker: Syncing staff updates');
    // Implement staff update sync logic
  } catch (error) {
    console.error('Service Worker: Staff update sync failed:', error);
  }
};

const syncPartnerUpdates = async () => {
  try {
    console.log('Service Worker: Syncing partner updates');
    // Implement partner update sync logic
  } catch (error) {
    console.error('Service Worker: Partner update sync failed:', error);
  }
};

const syncLogs = async () => {
  try {
    console.log('Service Worker: Syncing logs');
    // Implement log sync logic
    const pendingLogs = await getPendingLogs();

    for (const log of pendingLogs) {
      try {
        await fetch('/api/logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(log.data)
        });
        await removePendingLog(log.id);
      } catch (error) {
        console.error('Service Worker: Failed to sync log:', error);
      }
    }
  } catch (error) {
    console.error('Service Worker: Log sync failed:', error);
  }
};

// Helper functions for pending data management
const getPendingTransportRequests = async () => {
  // Implement IndexedDB or localStorage access
  return [];
};

const removePendingTransportRequest = async (id) => {
  // Implement IndexedDB or localStorage removal
};

const getPendingWarehouseUpdates = async () => {
  // Implement IndexedDB or localStorage access
  return [];
};

const removePendingWarehouseUpdate = async (id) => {
  // Implement IndexedDB or localStorage removal
};

const getPendingLogs = async () => {
  // Implement IndexedDB or localStorage access
  return [];
};

const removePendingLog = async (id) => {
  // Implement IndexedDB or localStorage removal
};

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push notification received');

  let notificationData = {
    title: 'MIA Logistics Manager',
    body: 'Bạn có thông báo mới từ MIA Logistics',
    icon: '/assets/icons/icon-192x192.png',
    badge: '/assets/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };

  if (event.data) {
    try {
      const pushData = event.data.json();
      notificationData = { ...notificationData, ...pushData };
    } catch (error) {
      console.error('Service Worker: Failed to parse push data:', error);
      notificationData.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, notificationData)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked');

  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(clientList => {
      // Check if there's already a window/tab open
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }

      // Open a new window/tab
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});

// Message handling for communication with main thread
self.addEventListener('message', (event) => {
  const { type, data } = event.data;

  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
    case 'GET_CACHE_STATUS':
      event.ports[0].postMessage({
        cacheStatus: {
          static: STATIC_CACHE_NAME,
          dynamic: DYNAMIC_CACHE_NAME,
          api: API_CACHE_NAME
        },
        performance: performanceMetrics
      });
      break;
    case 'CLEAR_CACHE':
      clearCache(data.cacheName).then(() => {
        event.ports[0].postMessage({ success: true });
      });
      break;
    case 'UPDATE_CACHE':
      updateCache(data.url, data.cacheName).then(() => {
        event.ports[0].postMessage({ success: true });
      });
      break;
    default:
      console.log('Service Worker: Unknown message type:', type);
  }
});

// Cache management functions
const clearCache = async (cacheName) => {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  return Promise.all(keys.map(key => cache.delete(key)));
};

const updateCache = async (url, cacheName) => {
  try {
    const response = await fetch(url);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      await cache.put(url, response);
    }
  } catch (error) {
    console.error('Service Worker: Failed to update cache:', error);
  }
};

// Error handling
self.addEventListener('error', (event) => {
  console.error('Service Worker: Error occurred:', event.error);
  performanceMetrics.errors++;
});

// Unhandled rejection handling
self.addEventListener('unhandledrejection', (event) => {
  console.error('Service Worker: Unhandled promise rejection:', event.reason);
  performanceMetrics.errors++;
});

// Periodic cache cleanup
setInterval(async () => {
  try {
    await limitCacheSize(DYNAMIC_CACHE_NAME, CACHE_CONFIG.maxEntries);
    await limitCacheSize(API_CACHE_NAME, CACHE_CONFIG.maxEntries);
  } catch (error) {
    console.error('Service Worker: Cache cleanup failed:', error);
  }
}, 60 * 60 * 1000); // Every hour

// Performance monitoring
setInterval(() => {
  const uptime = Date.now() - performanceMetrics.startTime;
  console.log('Service Worker: Performance metrics:', {
    ...performanceMetrics,
    uptime,
    cacheHitRate: performanceMetrics.cacheHits / (performanceMetrics.cacheHits + performanceMetrics.cacheMisses) * 100
  });
}, 5 * 60 * 1000); // Every 5 minutes

console.log('Service Worker: MIA Logistics Manager v2.0 loaded successfully');
