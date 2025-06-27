// src/firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCustomToken, onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// IMPORTANT: Use these global variables provided by the Canvas environment.
// DO NOT hardcode your Firebase configuration here.
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// Robustly parse __firebase_config, ensuring it's always a valid JSON object
const firebaseConfigRaw = typeof __firebase_config !== 'undefined' && __firebase_config !== null
  ? String(__firebase_config) // Ensure it's a string, even if it's a non-string primitive
  : '{}'; // Default to an empty JSON string if undefined or null

let firebaseConfig = {};
try {
  firebaseConfig = JSON.parse(firebaseConfigRaw);
} catch (e) {
  console.error("Error parsing __firebase_config. Raw value:", firebaseConfigRaw, "Error:", e);
  // firebaseConfig remains {} if parsing fails, leading to potential Firebase initialization errors.
}

// --- Debugging Logs (Check your browser console for these values) ---
console.log("Firebase Init Debug: __app_id =", appId);
console.log("Firebase Init Debug: __firebase_config (raw string) =", firebaseConfigRaw);
console.log("Firebase Init Debug: firebaseConfig (parsed object) =", firebaseConfig);
// --- End Debugging Logs ---

let app;
let auth;
let db;

// Initialize Firebase
try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  console.log("Firebase app initialized successfully.");

  // Perform initial authentication. This is crucial for Firestore rules.
  if (initialAuthToken) {
    signInWithCustomToken(auth, initialAuthToken)
      .then(() => {
        console.log("Firebase signed in with custom token!");
      })
      .catch((error) => {
        console.error("Firebase custom token sign-in error:", error);
        // Fallback to anonymous sign-in if custom token fails
        signInAnonymously(auth)
          .then(() => console.log("Signed in anonymously after custom token failure."))
          .catch(anonError => console.error("Anonymous sign-in error during fallback:", anonError));
      });
  } else {
    // If no custom token is provided (e.g., in a non-Canvas or local dev without token)
    signInAnonymously(auth)
      .then(() => console.log("Signed in anonymously (no initial token provided)."))
      .catch(error => console.error("Anonymous sign-in error:", error));
  }

  // Optional: Listen for auth state changes (useful for debugging and understanding user status)
  onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log("Firebase Auth State Changed: User is signed in:", user.uid);
    } else {
      console.log("Firebase Auth State Changed: User is signed out.");
    }
  });

} catch (error) {
  console.error("Firebase initialization failed:", error);
  // Log the error but continue execution; 'auth' and 'db' will be undefined.
}

// Export auth, db, and appId for use in other components
export { auth, db, appId };
