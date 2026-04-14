// Install Event - Force activate immediately
self.addEventListener('install', event => {
    self.skipWaiting();
});

// Activate Event - Clean up old caches and take control
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(keys.map(key => caches.delete(key)));
        })
    );
    self.clients.claim();
});

// Fetch Event - Bypass cache to prevent Chromium ERR_FAILED block
self.addEventListener('fetch', event => {
    // Only intercept if we want to add caching later. For now, strictly use network to prevent the fatal crash.
    event.respondWith(fetch(event.request));
});

// Handle Push Notifications in Background
self.addEventListener('push', event => {
    const data = event.data ? event.data.json() : { title: "MedAlert", body: "Check your medicines!" };
    event.waitUntil(
        self.registration.showNotification(data.title, {
            body: data.body,
            icon: 'https://cdn-icons-png.flaticon.com/512/3004/3004458.png',
            vibrate: [200, 100, 200, 100, 200]
        })
    );
});

// Notification click event
self.addEventListener('notificationclick', event => {
    event.notification.close();
    event.waitUntil(
        clients.openWindow('./dashboard.html')
    );
});
