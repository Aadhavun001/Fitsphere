import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration, utilizing Vite environment variables
// Gracefully falls back to placeholder values so the app compiles and runs even if keys are not yet configured.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "placeholder-api-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "placeholder-auth-domain",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "fitsphere-db",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "placeholder-storage-bucket",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "placeholder-messaging-sender-id",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "placeholder-app-id"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

export default app;
