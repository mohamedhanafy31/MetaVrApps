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
  
  // During build time, return actual credentials to allow build to complete
  if (process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE === 'phase-production-build') {
    console.log('⚠️ Build time: Using Firebase credentials for build');
    return {
      type: 'service_account',
      project_id: 'metavrapps',
      private_key_id: '9bbc5c2b0bc625144a1e3310d74fcda40a6be1d8',
      private_key: '-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCUz42V9aPGoXrT\n/hnzunGtWwllBD1chtWq8s3dzad3CPWI4xfn95d5NRBNV5r9+bF5NCxD2saQ778h\nvv3lrGKB7NwA164fQd6IG7uzgrRvb8iqZaHsZTMnQsE8Ik3PZHThnmfLK9YE3//n\n0RDZ71u9WZCwMwHkFlZxY7qUE+6zVknTGww6/L6XbZa7tycYkfT92F6Vax3IR9sf\nvG+IMVtHX3XKcj2zRkBiyOaRVxegGKFN3kDQLLgbLbT+DARcoL/5vaaFNtUbCy1D\nL0yOBInv3cbJVd9JuLfmgCGN35dtpFDj6Nd6OKRX0NkbXiZN62kCQMIeXpqQscDF\nyzomk6QrAgMBAAECggEAIbfDk4p0gQG+xIELXVPOBSMfBlIHG0t753+bkNnTy59u\njwUxugA6RJ724idq+YgVo+pj6z4LhvSjwKA3hE5ihaDnGpPEItX4d6udBKglfSh9\ndcqQfXFSvV8dTKRTMB5Jc4PCbeExXappoBuZb2AST92W8K2mDInZLVkVAg9gIyce\nFt/lx2e0/VrrGADHtodQ08ftPUekno7tEM3TybtYvdmsNmiwehvI3uHTQ/6JAUA0\nCrk3UqynJ1muDIqTL2JT3tf1tGMSJdwq/pOVZVNN64DHTxyQzjS/xA4nmDjidWIZ\nWBXVeK9O6dpjarjAvDkajHdKnod+LbGLYsS3zi17rQKBgQDJEgEH1CdvCOw2cIM+\nChKwN8vCivAvLKGOtDCOEWPT4m8wnbHbcfsMOa814gcSG5s2avng9cceNNpte2zw\nAAFnGYb9Oz82L8/xTZxJN0asXq0/VJ4nNCOu5qU0ThfFMZ3eN0XIBqAJ0C4V7jgY\nAE8gdvJUqSrJmMmvBu7DTAb19wKBgQC9dr0Z/TcAQNVyNQR9MQcTjYQfeyJ39hru\nX7jMCMBVGCD6z2r0aoswZAxEPfK6sUz+tXYQ2IJyMCphSc5YwsIqtrh7yZ0I1O9h\n36cZAriIwpPknLlxyPWsJDk7zb2e8SKdFKhpi6qb1laRMl6NCDt6ZmYoDduC4wi6\ne1K34ifmbQKBgAYLRoCnve+2gvM3+pn4z4sAgl18s6+XVdvmSrdaineqDNGXS+te\nx78cVMn322KN9eJy4MQEX1HnING9rg6g0Wn5+HbQOxwz37pPLO1+fd9ckTSgJIjl\nJlVxlXG3DzvcO/ScELrsiA8DdP8vw/vktnwxVyN4WlLpBtb+DFtOg78NAoGAC9sT\nSD4NJAnqkWP57O+VdsbDPskQxhrzYnlA8huWFX0WCzvRgIvuO8/26IpL1xzjKYkn\nYzR5LTYQYNgifnFpfwzCDJT4K6ZPeHtrVGhULdKnOIYKILGnlecKYdClDf4e4V96\njmg7+9Z0wk85lW+vcSBZQiZj1xPn5utyqKkRQB0CgYBQN5p17Ig+5tOBu9xihmRJ\ndGPykejSzF7vXsHPq51t23gU+k3rQnC52AK+7GoKYyIBWuX3ngGCoifynMh43qQQ\nnVWkaMllt1RDJdk4QhZS/tyn3qr4LTFM1u688DlJEkfR/KyUlOTBktlH071Z2DA6\ne0y5C8p7il5YPTmp9aV3qg==\n-----END PRIVATE KEY-----\n',
      client_email: 'firebase-adminsdk-fbsvc@metavrapps.iam.gserviceaccount.com',
      client_id: '106194870982142092610',
      auth_uri: 'https://accounts.google.com/o/oauth2/auth',
      token_uri: 'https://oauth2.googleapis.com/token',
      auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
      client_x509_cert_url: 'https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40metavrapps.iam.gserviceaccount.com',
      universe_domain: 'googleapis.com'
    };
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