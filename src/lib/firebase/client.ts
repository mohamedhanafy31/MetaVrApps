import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import fs from 'fs';
import path from 'path';

// Load Firebase configuration from service account file
function getFirebaseConfig() {
  const possiblePaths = [
    path.join(process.cwd(), 'firebase-service-account.json'),
    path.join(process.cwd(), 'downloads', 'google-drive-file'),
    path.join(process.cwd(), 'downloads', 'firebase-service-account.json')
  ];
  
  for (const filePath of possiblePaths) {
    try {
      if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const serviceAccount = JSON.parse(fileContent);
        
        // Extract Firebase client configuration from service account
        return {
          apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyDummyKey', // Fallback for API key
          authDomain: `${serviceAccount.project_id}.firebaseapp.com`,
          projectId: serviceAccount.project_id,
          storageBucket: `${serviceAccount.project_id}.appspot.com`,
          messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '123456789', // Fallback
          appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:123456789:web:abcdef', // Fallback
        };
      }
    } catch (error) {
      console.warn(`Failed to load Firebase config from ${filePath}:`, error);
      continue;
    }
  }
  
  // Fallback to environment variables if no service account file found
  console.warn('No Firebase service account file found, using environment variables');
  return {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };
}

const firebaseConfig = getFirebaseConfig();

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
