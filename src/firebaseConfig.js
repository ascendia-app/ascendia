// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// IMPORTANT: Replace this with YOUR actual Firebase config from the Firebase Console
const firebaseConfig = {
apiKey: "AIzaSyC5xNK1gThitsLgSnzF7iujPKUEsnqA1jA",
authDomain: "ascendia-app.firebaseapp.com",
projectId: "ascendia-app",
storageBucket: "ascendia-app.firebasestorage.app",
messagingSenderId: "537890941125",
appId: "1:537890941125:web:b3bdbd902b5ac7b5d6e8ac"
};
console.log("Firebase config loaded:", firebaseConfig.projectId); // DEBUG: Check if config is read
console.log("Firebase API Key (partial for security):", firebaseConfig.apiKey ? firebaseConfig.apiKey.substring(0, 5) + '...' : 'N/A'); // DEBUG: Check API Key

let app;
let auth;
let db;

// Initialize Firebase
try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  console.log("Firebase app initialized successfully."); // DEBUG: Confirm initialization
} catch (error) {
  console.error("Firebase initialization failed:", error); // DEBUG: Catch any init errors
  // If initialization fails, 'auth' and 'db' will be undefined, and subsequent
  // attempts to use them will result in runtime errors. This is expected
  // as the app cannot function without Firebase.
}

// Export auth and db services for use in components
// This export statement MUST be at the top level of the module
export { auth, db };
