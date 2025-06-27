// src/firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCustomToken, onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// IMPORTANT: Your ACTUAL Firebase project configuration.
// This will be used as a reliable fallback if Canvas-provided configs are empty.
const FALLBACK_FIREBASE_CONFIG = {
  apiKey: "AIzaSyC5xNK1gThitsLgSnzF7iujPKUEsnqA1jA",
  authDomain: "ascendia-app.firebaseapp.com",
  projectId: "ascendia-app",
  storageBucket: "ascendia-app.firebasestorage.app",
  messagingSenderId: "537890941125",
  appId: "1:537890941125:web:b3bdbd902b5ac7b5d6e8ac"
};

let resolvedFirebaseConfig = FALLBACK_FIREBASE_CONFIG;
let resolvedAppId = FALLBACK_FIREBASE_CONFIG.projectId; // Default to project ID as a fallback appId

// Attempt to use Canvas-provided config if it's available and valid
try {
  const canvasConfigRaw = typeof __firebase_config !== 'undefined' && __firebase_config !== null
    ? String(__firebase_config)
    : '{}';
  const parsedCanvasConfig = JSON.parse(canvasConfigRaw);

  // Check if parsedCanvasConfig is a non-empty object and contains an apiKey
  if (Object.keys(parsedCanvasConfig).length > 0 && parsedCanvasConfig.apiKey) {
    resolvedFirebaseConfig = parsedCanvasConfig;
    console.log("Firebase Init Debug: Using Canvas-provided config.");
    // Attempt to get appId from Canvas, or fallback to the one in the parsed config
    resolvedAppId = typeof __app_id !== 'undefined' && __app_id !== 'default-app-id'
      ? String(__app_id)
      : (resolvedFirebaseConfig.appId || resolvedFirebaseConfig.projectId); // Use resolvedFirebaseConfig's appId or projectId
  } else {
    console.warn("Firebase Init Debug: Canvas-provided config is empty or invalid. Falling back to hardcoded config.");
    // resolvedFirebaseConfig already defaults to FALLBACK_FIREBASE_CONFIG
    resolvedAppId = FALLBACK_FIREBASE_CONFIG.projectId; // Ensure appId matches fallback
  }
} catch (e) {
  console.error("Firebase Init Debug: Error parsing Canvas config. Falling back to hardcoded. Error:", e);
  // resolvedFirebaseConfig already defaults to FALLBACK_FIREBASE_CONFIG
  resolvedAppId = FALLBACK_FIREBASE_CONFIG.projectId; // Ensure appId matches fallback
}

const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// --- Debugging Logs (Check your browser console for these values) ---
console.log("Firebase Init Debug: Final Resolved App ID =", resolvedAppId);
console.log("Firebase Init Debug: Final Firebase Config =", resolvedFirebaseConfig);
console.log("Firebase Init Debug: Initial Auth Token provided =", !!initialAuthToken);
// --- End Debugging Logs ---

let app;
let auth;
let db;

// Initialize Firebase
try {
  app = initializeApp(resolvedFirebaseConfig);
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
        signInAnonymously(auth)
          .then(() => console.log("Signed in anonymously after custom token failure."))
          .catch(anonError => console.error("Anonymous sign-in error during fallback:", anonError));
      });
  } else {
    signInAnonymously(auth)
      .then(() => console.log("Signed in anonymously (no initial token provided)."))
      .catch(error => console.error("Anonymous sign-in error:", error));
  }

  onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log("Firebase Auth State Changed: User is signed in:", user.uid);
    } else {
      console.log("Firebase Auth State Changed: User is signed out.");
    }
  });

} catch (error) {
  console.error("Firebase initialization failed:", error);
}

// Export auth, db, and resolvedAppId for use in other components
export { auth, db, resolvedAppId as appId }; // Export as 'appId' for consistency with usage
