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

// Initialize Cloud Messaging and get a reference to the service
export const requestFirebaseNotificationPermission = async () => {
  try {
    if (typeof window === "undefined") return null;

    const messagingSupported = await isSupported();
    if (!messagingSupported) {
      console.warn("Firebase Messaging is not supported in this browser.");
      return null;
    }

    const messaging = getMessaging(app);

    // Request permission from the user
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.warn("Notification permission was denied.");
      return null;
    }

    const token = await getToken(messaging, {
      // It is highly recommended to generate a VAPID key in the Firebase Console 
      // (Project Settings -> Cloud Messaging -> Web configuration -> Generate Key Pair).
      // For now, it will attempt without it or fallback to defaults.
    });

    if (token) {
      return token;
    } else {
      console.warn("No registration token available. Request permission to generate one.");
      return null;
    }
  } catch (error) {
    console.error("An error occurred while retrieving token. ", error);
    return null;
  }
};
