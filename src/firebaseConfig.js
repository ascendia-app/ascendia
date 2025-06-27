// src/firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCustomToken, onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// IMPORTANT: Your ACTUAL Firebase project configuration
// This will be used as a fallback if the Canvas environment doesn't provide __firebase_config correctly.
const FALLBACK_FIREBASE_CONFIG = {
apiKey: "AIzaSyC5xNK1gThitsLgSnzF7iujPKUEsnqA1jA",
authDomain: "ascendia-app.firebaseapp.com",
projectId: "ascendia-app",
storageBucket: "ascendia-app.firebasestorage.app",
messagingSenderId: "537890941125",
appId: "1:537890941125:web:b3bdbd902b5ac7b5d6e8ac"
};

// Prioritize Canvas-provided appId, fallback to default or your config's appId if needed
const appId = typeof __app_id !== 'undefined' && __app_id !== 'default-app-id'
  ? String(__app_id)
  : (FALLBACK_FIREBASE_CONFIG.appId.split(':')[0] === '1' ? FALLBACK_FIREBASE_CONFIG.appId.split(':')[2] : 'default-app-id'); // Extract only the client appId part if it's formatted like "1:senderId:web:appId" or use a safe default


const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

let firebaseConfig = {};
const firebaseConfigRawFromCanvas = typeof __firebase_config !== 'undefined' && __firebase_config !== null
  ? String(__firebase_config)
  : '{}';

try {
  const parsedCanvasConfig = JSON.parse(firebaseConfigRawFromCanvas);
  // Check if the parsed config from Canvas is not empty and has an apiKey
  if (Object.keys(parsedCanvasConfig).length > 0 && parsedCanvasConfig.apiKey) {
    firebaseConfig = parsedCanvasConfig;
    console.log("Firebase Init: Using Canvas-provided config.");
  } else {
    firebaseConfig = FALLBACK_FIREBASE_CONFIG;
    console.warn("Firebase Init: Canvas config is empty or invalid. Falling back to hardcoded config.");
  }
} catch (e) {
  console.error("Firebase Init Error: Failed to parse __firebase_config. Falling back to hardcoded. Error:", e);
  firebaseConfig = FALLBACK_FIREBASE_CONFIG;
}

// --- Debugging Logs (Check your browser console for these values) ---
console.log("Firebase Init Debug: Resolved App ID =", appId);
console.log("Firebase Init Debug: __firebase_config (raw string from Canvas) =", firebaseConfigRawFromCanvas);
console.log("Firebase Init Debug: Final firebaseConfig (parsed object) =", firebaseConfig);
console.log("Firebase Init Debug: Initial Auth Token provided =", !!initialAuthToken); // Check if token exists
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
