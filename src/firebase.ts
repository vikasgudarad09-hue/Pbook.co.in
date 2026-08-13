import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;

// Only enable Firebase if explicitly enabled via VITE_ENABLE_FIRESTORE flag.
// Calling getFirestore on an unprovisioned Cloud project causes the Firestore SDK
// to log continuous "Database '(default)' not found" background reconnect warnings.
export const isFirebaseConfigured = import.meta.env.VITE_ENABLE_FIRESTORE === 'true';

const firebaseConfig = {
  apiKey: apiKey || "AIzaSyDummyKeyForAppletFallbackOnly",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "pbook-app.firebaseapp.com",
  projectId: projectId || "pbook-app",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET?.replace('gs://', '') || "pbook-app.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1234567890",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1234567890:web:1234567890",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = isFirebaseConfigured
  ? (getApps().length > 0 ? getApp() : initializeApp(firebaseConfig))
  : null;

export const db = app ? getFirestore(app) : null;
export const storage = app ? getStorage(app) : null;

