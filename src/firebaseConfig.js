import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCustomToken, signInAnonymously } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Global variables provided by the Canvas environment
// Use fallback values if not defined (e.g., for local development)
const __app_id = typeof window !== 'undefined' && window.__app_id !== undefined ? window.__app_id : 'default-app-id';
const __firebase_config = typeof window !== 'undefined' && window.__firebase_config !== undefined ? window.__firebase_config : '{}';
const __initial_auth_token = typeof window !== 'undefined' && window.__initial_auth_token !== undefined ? window.__initial_auth_token : null;

// Parse the Firebase config JSON
// Note: The actual Firebase config (apiKey etc.) is now primarily handled in AuthContext.jsx
// This file assumes __firebase_config will be a valid JSON string if provided by Canvas.
const firebaseConfig = JSON.parse(__firebase_config);

// Initialize Firebase app
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db, __app_id as appId, __initial_auth_token as initialAuthToken };
