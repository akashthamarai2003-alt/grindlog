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

// Force the service worker to update immediately
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Retrieve firebase messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);

  // The old service worker looked for payload.notification. This robustly checks both so it never fails.
  const notificationTitle = payload.data?.title || payload.notification?.title || 'GrindLog Reminder';
  const notificationOptions = {
    body: payload.data?.body || payload.notification?.body || '',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png', // Note: Android may render full-color badges as a solid white square.
    data: payload.data || {}
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(windowClients => {
      // Check if there is already a window/tab open with the target URL
      for (let i = 0; i < windowClients.length; i++) {
        let client = windowClients[i];
        if (client.url.includes('/') && 'focus' in client) {
          return client.focus();
        }
      }
      // If not, open a new window
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});
