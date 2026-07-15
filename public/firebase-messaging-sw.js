importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyAKYTBOg_hfX_J3-6zB5G-CzYCrbrKOEhs",
  authDomain: "grindlog-121c5.firebaseapp.com",
  projectId: "grindlog-121c5",
  storageBucket: "grindlog-121c5.firebasestorage.app",
  messagingSenderId: "657351609234",
  appId: "1:657351609234:web:054a3e0dde452a14cd4f4b",
  measurementId: "G-Q4VC6L4J4E"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const APP_ICON = 'https://grindlog-lake.vercel.app/icons/icon-192.png';
const NOTIFICATION_BADGE = 'https://grindlog-lake.vercel.app/icons/icon-192.png';
const DEFAULT_URL = '/dashboard';

// Force the service worker to update immediately
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Retrieve firebase messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);

  // Firebase auto-displays notification payloads. GrindLog sends data-only
  // messages so this worker owns the final Android banner shape.
  if (payload.notification) {
    return;
  }

  let data = payload.data || {};
  if (typeof data === 'string') {
    try { data = JSON.parse(data); } catch (e) {}
  }
  // Check if it was double-nested for some reason
  if (data.data && data.data.title) {
    data = data.data;
  }
  
  const notificationTitle = data.title || 'GrindLog Reminder';
  const notificationOptions = {
    body: data.body || '',
    icon: data.icon || APP_ICON,
    badge: data.badge || NOTIFICATION_BADGE,
    tag: data.tag || 'grindlog-reminder',
    renotify: false,
    vibrate: [200, 100, 200],
    timestamp: Date.now(),
    data: {
      ...data,
      url: data.url || DEFAULT_URL
    }
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();

  const targetUrl = new URL(event.notification.data?.url || DEFAULT_URL, self.location.origin).href;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url.startsWith(self.location.origin) && 'focus' in client) {
          if ('navigate' in client) {
            return client.navigate(targetUrl).then(navigatedClient => (navigatedClient || client).focus());
          }

          return client.focus();
        }
      }

      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
