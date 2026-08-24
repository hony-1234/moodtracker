import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCeF5DcXx8MKxNAK9RWHKaP5dwiltROtYQ",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "schoolmoodsystem.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "schoolmoodsystem",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "schoolmoodsystem.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "508492659912",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:508492659912:web:480225fdce49c77dd239fd",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-EVHSJRQZZH"
};

// Initialize Firebase App singleton
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Cloud Firestore with offline persistence
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Firebase Analytics if supported in the current environment
export let analytics: any = null;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch(() => {});
}

// Configure Google Auth Provider for OAuth & Gmail integration
export const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/gmail.send');
provider.setCustomParameters({
  prompt: 'consent'
});
