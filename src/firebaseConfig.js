// src/firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCustomToken, onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// IMPORTANT: Use these global variables provided by the Canvas environment.
// DO NOT hardcode your Firebase configuration here.
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

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
