import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';

// Initialize Firebase Admin if it hasn't been initialized already
if (getApps().length === 0) {
  try {
    // We require the JSON directly, which is safe on the server environment
    // and since it's added to .gitignore, it won't be pushed to the repository.
    const serviceAccount = require('./admin-config.json');

    initializeApp({
      credential: cert(serviceAccount),
    });
    console.log('Firebase Admin initialized successfully.');
  } catch (error) {
    console.error('Firebase admin initialization error', error);
  }
}

export const adminMessaging = getMessaging();
