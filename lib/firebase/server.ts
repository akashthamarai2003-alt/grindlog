import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';

// Initialize Firebase Admin if it hasn't been initialized already
if (getApps().length === 0) {
  try {
    let serviceAccount;
    
    try {
      // For local development
      serviceAccount = require('./admin-config.json');
    } catch (err) {
      // For production (Vercel) since the JSON is gitignored
      serviceAccount = {
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      };
    }

    initializeApp({
      credential: cert(serviceAccount),
    });
    console.log('Firebase Admin initialized successfully.');
  } catch (error) {
    console.error('Firebase admin initialization error', error);
  }
}

export const adminMessaging = getMessaging();
