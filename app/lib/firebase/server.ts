import { initializeApp, getApps, cert, getApp } from 'firebase-admin/app';
import { getMessaging, Messaging } from 'firebase-admin/messaging';

let initAttempted = false;

function getOrInitFirebaseAdmin() {
  if (getApps().length > 0) {
    return getApp();
  }

  if (initAttempted) {
    return null;
  }
  initAttempted = true;

  try {
    let serviceAccount: any = null;

    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
      // For production (Vercel)
      serviceAccount = {
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      };
    } else {
      // For local development
      try {
        const fs = require('fs');
        const path = require('path');
        const configPath = path.join(process.cwd(), 'lib/firebase/admin-config.json');
        if (fs.existsSync(configPath)) {
          serviceAccount = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        }
      } catch {
        // Ignore file read error in serverless environment
      }
    }

    if (serviceAccount && serviceAccount.projectId && serviceAccount.privateKey) {
      const app = initializeApp({
        credential: cert(serviceAccount),
      });
      console.log('Firebase Admin initialized successfully.');
      return app;
    } else {
      console.warn('Firebase Admin credentials not found. Push notifications will be safely simulated.');
      return null;
    }
  } catch (error) {
    console.warn('Firebase admin initialization notice:', error);
    return null;
  }
}

export function getAdminMessaging(): Messaging | null {
  try {
    const app = getOrInitFirebaseAdmin();
    if (app) {
      return getMessaging(app);
    }
  } catch (error) {
    console.warn('Firebase getMessaging notice:', error);
  }
  return null;
}

// Resilient wrapper that never throws on import or when credentials are not yet configured
export const adminMessaging = {
  sendEachForMulticast: async (message: any) => {
    const messaging = getAdminMessaging();
    if (!messaging) {
      console.log('[Firebase Admin] Simulated multicast push (Firebase credentials not configured):', message.data?.title);
      return {
        successCount: 0,
        failureCount: 0,
        responses: [],
      };
    }
    return messaging.sendEachForMulticast(message);
  },
};
