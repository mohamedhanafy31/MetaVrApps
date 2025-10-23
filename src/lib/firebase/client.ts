import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import * as fs from 'fs';
import * as path from 'path';

// Load Firebase configuration from downloaded service account file
function getFirebaseConfig() {
  const credentialPath = path.join(process.cwd(), 'downloads', 'firebase-service-account.json');
  
  if (!fs.existsSync(credentialPath)) {
    console.error('❌ Firebase service account file not found!');
    console.error(`Expected location: ${credentialPath}`);
    console.error('Please run: npm run download-file');
    throw new Error('Firebase service account file not found. Run npm run download-file first.');
  }
  
  try {
    // Use require() pattern as specified - disable ESLint for this line
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const serviceAccount = require(credentialPath);
    
    // Extract Firebase client configuration from service account
    return {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyDummyKey', // Fallback for API key
      authDomain: `${serviceAccount.project_id}.firebaseapp.com`,
      projectId: serviceAccount.project_id,
      storageBucket: `${serviceAccount.project_id}.appspot.com`,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '123456789', // Fallback
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:123456789:web:abcdef', // Fallback
    };
  } catch (error) {
    console.error('❌ Failed to load Firebase config:', error);
    throw new Error('Failed to load Firebase configuration');
  }
}

const firebaseConfig = getFirebaseConfig();

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
