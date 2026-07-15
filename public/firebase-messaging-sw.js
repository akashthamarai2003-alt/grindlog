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

// Retrieve firebase messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);

  const notificationTitle = payload.notification?.title || 'GrindLog Reminder';
  const notificationOptions = {
    body: payload.notification?.body,
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
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
