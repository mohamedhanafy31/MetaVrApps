import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import * as fs from 'fs';
import * as path from 'path';

// Load Firebase configuration from environment variable or local file
function getFirebaseConfig() {
  let serviceAccount;
  
  // First try: JSON environment variable (production)
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    try {
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
      console.log('✅ Firebase client config loaded from FIREBASE_SERVICE_ACCOUNT_JSON');
    } catch (error) {
      console.error('❌ Error parsing FIREBASE_SERVICE_ACCOUNT_JSON:', error);
      throw new Error('Invalid FIREBASE_SERVICE_ACCOUNT_JSON format');
    }
  }
  // Second try: Base64 encoded JSON environment variable
  else if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    try {
      const decodedKey = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_KEY, 'base64').toString('utf-8');
      serviceAccount = JSON.parse(decodedKey);
      console.log('✅ Firebase client config loaded from FIREBASE_SERVICE_ACCOUNT_KEY (Base64)');
    } catch (error) {
      console.error('❌ Error parsing FIREBASE_SERVICE_ACCOUNT_KEY:', error);
      throw new Error('Invalid FIREBASE_SERVICE_ACCOUNT_KEY format');
    }
  }
  // Fallback: Try to load from local file (development)
  else {
    const credentialPath = path.join(process.cwd(), 'downloads', 'firebase-service-account.json');
    
    if (!fs.existsSync(credentialPath)) {
      console.error('❌ Firebase service account file not found!');
      console.error(`Expected location: ${credentialPath}`);
      console.error('Please run: npm run download-file');
      throw new Error('Firebase service account file not found. Run npm run download-file first.');
    }
    
    try {
      const serviceAccountContent = fs.readFileSync(credentialPath, 'utf8');
      serviceAccount = JSON.parse(serviceAccountContent);
      console.log('✅ Firebase client config loaded from local file');
    } catch (error) {
      console.error('❌ Failed to load Firebase config:', error);
      throw new Error('Failed to load Firebase configuration');
    }
  }
  
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

const firebaseConfig = getFirebaseConfig();

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
