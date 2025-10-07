const CACHE_NAME = 'discovery-dial-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Background sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Sync offline data when connection is restored
  console.log('Background sync triggered');
  
  try {
    // Sync saved events
    const savedEvents = await getStoredEvents();
    if (savedEvents.length > 0) {
      await syncEventsToServer(savedEvents);
    }
    
    // Sync user preferences
    const preferences = await getStoredPreferences();
    if (preferences) {
      await syncPreferencesToServer(preferences);
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

async function getStoredEvents() {
  // Get events from IndexedDB or localStorage
  return new Promise((resolve) => {
    const events = localStorage.getItem('discovery-dial-events');
    resolve(events ? JSON.parse(events) : []);
  });
}

async function getStoredPreferences() {
  // Get user preferences from localStorage
  return new Promise((resolve) => {
    const user = JSON.parse(localStorage.getItem('current-user') || 'null');
    if (user) {
      const preferences = localStorage.getItem(`user-preferences-${user.id}`);
      resolve(preferences ? JSON.parse(preferences) : null);
    } else {
      resolve(null);
    }
  });
}

async function syncEventsToServer(events) {
  // Sync events to server
  try {
    const response = await fetch('/api/events/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(events)
    });
    
    if (response.ok) {
      console.log('Events synced successfully');
    }
  } catch (error) {
    console.error('Failed to sync events:', error);
  }
}

async function syncPreferencesToServer(preferences) {
  // Sync preferences to server
  try {
    const response = await fetch('/api/preferences/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(preferences)
    });
    
    if (response.ok) {
      console.log('Preferences synced successfully');
    }
  } catch (error) {
    console.error('Failed to sync preferences:', error);
  }
}

// Push notifications
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New event notification',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Explore',
        icon: '/icon-192.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icon-192.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Discovery Dial', options)
  );
});

// Notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});
