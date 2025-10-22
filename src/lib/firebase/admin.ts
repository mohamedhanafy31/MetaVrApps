import { initializeApp, getApps, cert } from 'firebase-admin/app';
import type { App as FirebaseApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { getAuth } from 'firebase-admin/auth';
import fs from 'fs';
import path from 'path';

// Get service account from environment variable or local file
function getServiceAccount(): Record<string, unknown> {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    // Production: Use environment variable (Base64 encoded JSON)
    try {
      const decodedKey = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_KEY, 'base64').toString('utf-8');
      return JSON.parse(decodedKey);
    } catch (error) {
      console.error('Error parsing Firebase service account from environment:', error);
      throw new Error('Invalid FIREBASE_SERVICE_ACCOUNT_KEY');
    }
  } else {
    // Development: Try to load from local files
    const possiblePaths = [
      path.join(process.cwd(), 'firebase-service-account.json'),
      path.join(process.cwd(), 'downloads', 'google-drive-file'),
      path.join(process.cwd(), 'downloads', 'firebase-service-account.json')
    ];
    
    for (const filePath of possiblePaths) {
      try {
        if (fs.existsSync(filePath)) {
          const fileContent = fs.readFileSync(filePath, 'utf8');
          return JSON.parse(fileContent);
        }
      } catch (error) {
        console.warn(`Failed to load service account from ${filePath}:`, error);
        continue;
      }
    }
    
    console.error('Firebase service account configuration not found in any of these locations:');
    possiblePaths.forEach(p => console.error(`  - ${p}`));
    console.error('Please either:');
    console.error('1. Set FIREBASE_SERVICE_ACCOUNT_KEY environment variable');
    console.error('2. Place firebase-service-account.json in project root');
    console.error('3. Run npm run download-file to download credentials');
    throw new Error('Firebase service account configuration not found');
  }
}

// Initialize Firebase Admin SDK
let app: FirebaseApp;

try {
  const serviceAccount = getServiceAccount();
  app = getApps().length === 0 
    ? initializeApp({
        credential: cert(serviceAccount),
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'metavrapps.appspot.com',
      })
    : getApps()[0];
} catch (error) {
  console.error('Failed to initialize Firebase Admin SDK:', error);
  throw new Error('Firebase Admin SDK initialization failed');
}

export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);

export default app;