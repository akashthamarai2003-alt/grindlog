import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';

// Initialize Firebase Admin if it hasn't been initialized already
if (getApps().length === 0) {
  try {
    let serviceAccount;
    
    if (process.env.FIREBASE_PROJECT_ID) {
      // For production (Vercel) since the JSON is gitignored
      serviceAccount = {
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      };
    } else {
      // For local development
      const fs = require('fs');
      const path = require('path');
      const configPath = path.join(process.cwd(), 'lib/firebase/admin-config.json');
      if (fs.existsSync(configPath)) {
        serviceAccount = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      } else {
        console.warn('Firebase Admin config not found at lib/firebase/admin-config.json');
      }
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
