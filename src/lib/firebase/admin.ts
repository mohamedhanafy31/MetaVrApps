import { initializeApp, getApps, cert } from 'firebase-admin/app';
import type { App as FirebaseApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { getAuth } from 'firebase-admin/auth';
import * as fs from 'fs';
import * as path from 'path';

// Force download credentials if not present
function ensureCredentialsExist(): string {
  const credentialPath = path.join(process.cwd(), 'downloads', 'firebase-service-account.json');
  
  if (!fs.existsSync(credentialPath)) {
    console.error('❌ Firebase service account file not found!');
    console.error(`Expected location: ${credentialPath}`);
    console.error('Please run: npm run download-file');
    throw new Error('Firebase service account file not found. Run npm run download-file first.');
  }
  
  return credentialPath;
}

// Initialize Firebase Admin SDK using proper require() pattern
let app: FirebaseApp;

try {
  const credentialPath = ensureCredentialsExist();
  
  // Use require() pattern as specified - disable ESLint for this line
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const serviceAccount = require(credentialPath);
  
  app = getApps().length === 0 
    ? initializeApp({
        credential: cert(serviceAccount),
        storageBucket: `${serviceAccount.project_id}.appspot.com`,
      })
    : getApps()[0];
    
  console.log('✅ Firebase Admin SDK initialized successfully');
  console.log(`📁 Project ID: ${serviceAccount.project_id}`);
} catch (error) {
  console.error('❌ Failed to initialize Firebase Admin SDK:', error);
  throw new Error('Firebase Admin SDK initialization failed');
}

export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);

export default app;