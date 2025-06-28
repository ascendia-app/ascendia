// src/firebaseConfig.js


const localFirebaseConfig = { // Renamed this variable to avoid any potential name conflicts
  apiKey: "AIzaSyC5xNK1gThitsLgSnzF7iujPKUEsnqA1jA",
  authDomain: "ascendia-app.firebaseapp.com",
  projectId: "ascendia-app",
  storageBucket: "ascendia-app.firebasestorage.app",
  messagingSenderId: "537890941125",
  appId: "1:537890941125:web:b3bdbd902b5ac7b5d6e8ac",
  // measurementId: "YOUR_MEASUREMENT_ID" // Uncomment if you enable analytics, and replace its value
};

// DO NOT MODIFY THE FOLLOWING.
// These variables are designed to pick up values provided by the Canvas environment at runtime.
// If running locally (outside Canvas), they will fall back to your localFirebaseConfig values.

// Access global variables via 'window' for robustness against Temporal Dead Zone (TDZ) issues.
const resolvedAppId = window.__app_id !== undefined ? window.__app_id : localFirebaseConfig.appId;
const resolvedFirebaseConfig = window.__firebase_config !== undefined ? window.__firebase_config : JSON.stringify(localFirebaseConfig);
const resolvedInitialAuthToken = window.__initial_auth_token !== undefined ? window.__initial_auth_token : undefined;


export {
  resolvedAppId as appId,
  resolvedFirebaseConfig as firebaseConfig,
  resolvedInitialAuthToken as initialAuthToken
};
