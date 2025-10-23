import { initializeApp, getApps, cert } from 'firebase-admin/app';
import type { App as FirebaseApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { getAuth } from 'firebase-admin/auth';
import * as fs from 'fs';
import * as path from 'path';

// Load Firebase credentials from environment variable (JSON format)
function getFirebaseCredentials() {
  // First try: JSON environment variable (production)
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    try {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
      console.log('✅ Firebase credentials loaded from FIREBASE_SERVICE_ACCOUNT_JSON');
      console.log(`📁 Project ID: ${serviceAccount.project_id}`);
      return serviceAccount;
    } catch (error) {
      console.error('❌ Error parsing FIREBASE_SERVICE_ACCOUNT_JSON:', error);
      throw new Error('Invalid FIREBASE_SERVICE_ACCOUNT_JSON format');
    }
  }
  
  // Second try: Base64 encoded JSON environment variable
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    try {
      const decodedKey = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_KEY, 'base64').toString('utf-8');
      const serviceAccount = JSON.parse(decodedKey);
      console.log('✅ Firebase credentials loaded from FIREBASE_SERVICE_ACCOUNT_KEY (Base64)');
      console.log(`📁 Project ID: ${serviceAccount.project_id}`);
      return serviceAccount;
    } catch (error) {
      console.error('❌ Error parsing FIREBASE_SERVICE_ACCOUNT_KEY:', error);
      throw new Error('Invalid FIREBASE_SERVICE_ACCOUNT_KEY format');
    }
  }
  
  // Fallback: Try to load from local file (development)
  const credentialPath = path.join(process.cwd(), 'downloads', 'firebase-service-account.json');
  
  if (fs.existsSync(credentialPath)) {
    try {
      const serviceAccountContent = fs.readFileSync(credentialPath, 'utf8');
      const serviceAccount = JSON.parse(serviceAccountContent);
      console.log('✅ Firebase credentials loaded from local file');
      console.log(`📁 Project ID: ${serviceAccount.project_id}`);
      return serviceAccount;
    } catch (error) {
      console.error('❌ Error loading local Firebase credentials:', error);
      throw new Error('Failed to load local Firebase credentials');
    }
  }
  
  // No credentials found
  console.error('❌ Firebase credentials not found!');
  console.error('Please set one of:');
  console.error('  - FIREBASE_SERVICE_ACCOUNT_JSON (JSON string)');
  console.error('  - FIREBASE_SERVICE_ACCOUNT_KEY (Base64 encoded JSON)');
  console.error('  - Or run: npm run download-file');
  throw new Error('Firebase credentials not found');
}

// Initialize Firebase Admin SDK using proper require() pattern
let app: FirebaseApp;

try {
  const serviceAccount = getFirebaseCredentials();
  
  app = getApps().length === 0 
    ? initializeApp({
        credential: cert(serviceAccount),
        storageBucket: `${serviceAccount.project_id}.appspot.com`,
      })
    : getApps()[0];
    
  console.log('✅ Firebase Admin SDK initialized successfully');
} catch (error) {
  console.error('❌ Failed to initialize Firebase Admin SDK:', error);
  throw new Error('Firebase Admin SDK initialization failed');
}

export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);

export default app;