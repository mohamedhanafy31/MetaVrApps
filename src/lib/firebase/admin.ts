import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { getAuth } from 'firebase-admin/auth';
import fs from 'fs';
import path from 'path';

// Get service account from environment variable or local file
let serviceAccount: Record<string, unknown>;

if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
  // Production: Use environment variable (Base64 encoded JSON)
  try {
    const decodedKey = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_KEY, 'base64').toString('utf-8');
    serviceAccount = JSON.parse(decodedKey);
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
  
  let found = false;
  for (const filePath of possiblePaths) {
    try {
      if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        serviceAccount = JSON.parse(fileContent);
        found = true;
        console.log(`✅ Loaded Firebase service account from: ${filePath}`);
        break;
      }
    } catch (error) {
      console.warn(`⚠️  Could not load from ${filePath}:`, error);
    }
  }
  
  if (!found) {
    console.error('Firebase service account not found. Please ensure:');
    console.error('1. FIREBASE_SERVICE_ACCOUNT_KEY environment variable is set, or');
    console.error('2. firebase-service-account.json exists in project root, or');
    console.error('3. Run npm run download-file to download credentials');
    throw new Error('Firebase service account configuration not found');
  }
}

// Initialize Firebase Admin SDK
const app = getApps().length === 0 
  ? initializeApp({
      credential: cert(serviceAccount),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'metavrapps.appspot.com',
    })
  : getApps()[0];

export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);

export default app;
