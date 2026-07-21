import { initializeApp, getApps, getApp } from "firebase/app";
import { getMessaging, getToken, isSupported } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyAKYTBOg_hfX_J3-6zB5G-CzYCrbrKOEhs",
  authDomain: "grindlog-121c5.firebaseapp.com",
  projectId: "grindlog-121c5",
  storageBucket: "grindlog-121c5.firebasestorage.app",
  messagingSenderId: "657351609234",
  appId: "1:657351609234:web:054a3e0dde452a14cd4f4b",
  measurementId: "G-Q4VC6L4J4E"
};

// Initialize Firebase only once
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

const FIREBASE_MESSAGING_SW_SCOPE = "/firebase-cloud-messaging-push-scope";

async function getFirebaseServiceWorkerRegistration() {
  if (!("serviceWorker" in navigator)) {
    return null;
  }

  return navigator.serviceWorker.register("/firebase-messaging-sw.js", {
    scope: FIREBASE_MESSAGING_SW_SCOPE,
  });
}

// Initialize Cloud Messaging and get a reference to the service
export const requestFirebaseNotificationPermission = async () => {
  try {
    if (typeof window === "undefined") return null;

    const messagingSupported = await isSupported();
    if (!messagingSupported) {
      throw new Error("Firebase Messaging is not supported in this browser (requires HTTPS).");
    }

    if (!("Notification" in window) || !("serviceWorker" in navigator)) {
      throw new Error("Notifications or Service Workers are not supported in this browser.");
    }

    const messaging = getMessaging(app);

    // Request permission from the user
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.warn("Notification permission was denied.");
      return null;
    }

    const serviceWorkerRegistration = await getFirebaseServiceWorkerRegistration();
    if (!serviceWorkerRegistration) {
      throw new Error("Failed to register Service Worker.");
    }

    if (!process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY) {
      throw new Error("Missing NEXT_PUBLIC_FIREBASE_VAPID_KEY environment variable. Add it to Vercel.");
    }

    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      serviceWorkerRegistration,
    });

    if (token) {
      return token;
    } else {
      throw new Error("No registration token available. Ensure your VAPID key is correct.");
    }
  } catch (error) {
    console.error("An error occurred while retrieving token. ", error);
    throw error;
  }
};
