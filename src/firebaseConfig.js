// This file defines and exports global Canvas variables and the Firebase config.
// Firebase initialization (initializeApp, getAuth, getFirestore) will now happen
// in AuthContext.jsx to ensure global variables are fully loaded.

// Global variables provided by the Canvas environment
const __app_id = typeof window !== 'undefined' && window.__app_id !== undefined ? window.__app_id : 'default-app-id';
const __firebase_config = typeof window !== 'undefined' && window.__firebase_config !== undefined ? window.__firebase_config : '{}';
const __initial_auth_token = typeof window !== 'undefined' && window.__initial_auth_token !== undefined ? window.__initial_auth_token : null;

// Firebase Config Resolution (Canvas provided or Hardcoded Fallback)
let firebaseConfig = {};

try {
    firebaseConfig = JSON.parse(__firebase_config);
    console.log("Firebase Init Debug (firebaseConfig.js): Canvas-provided config detected.");

    // CRITICAL FALLBACK FOR INVALID/EMPTY CONFIG:
    // If Canvas-provided config is empty or invalid, use the hardcoded values.
    // Ensure these match your actual Firebase project settings.
    if (!firebaseConfig || Object.keys(firebaseConfig).length === 0 || !firebaseConfig.apiKey) {
        console.warn("Firebase Init Debug (firebaseConfig.js): Canvas-provided config is empty or invalid. Falling back to hardcoded config.");
        // !! YOUR ACTUAL FIREBASE PROJECT CONFIG GOES HERE !!
        // !! REPLACE THESE PLACEHOLDERS WITH THE VALUES YOU GOT FROM FIREBASE CONSOLE !!
        firebaseConfig = {
            apiKey: "AIzaSyC5xNK1gThitsLgSnzF7iujPKUEsnqA1jA", // YOUR_ACTUAL_FIREBASE_API_KEY
            authDomain: "ascendia-app.firebaseapp.com", // YOUR_PROJECT_ID.firebaseapp.com
            projectId: "ascendia-app", // YOUR_PROJECT_ID
            storageBucket: "ascendia-app.firebasestorage.app", // YOUR_PROJECT_ID.appspot.com
            messagingSenderId: "537890941125", // YOUR_MESSAGING_SENDER_ID
            appId: "1:537890941125:web:b3bdbd902b5ac7b5d6e8ac" // YOUR_APP_ID_FROM_FIREBASE_CONSOLE
            // measurementId is omitted if not present in your actual config
        };
    }
} catch (e) {
    console.error("Firebase Init Debug (firebaseConfig.js): Error parsing __firebase_config:", e);
    // As a last resort, if parsing fails, ensure firebaseConfig has a valid structure.
    // This could be the same hardcoded config as above.
    firebaseConfig = {
        apiKey: "AIzaSyC5xNK1gThitsLgSnzF7iujPKUEsnqA1jA", // Fallback if parse fails
        authDomain: "ascendia-app.firebaseapp.com",
        projectId: "ascendia-app",
        storageBucket: "ascendia-app.firebasestorage.app",
        messagingSenderId: "537890941125",
        appId: "1:537890941125:web:b3bdbd902b5ac7b5d6e8ac"
    };
}

console.log("Firebase Init Debug (firebaseConfig.js): Resolved Firebase Config object for export = ", firebaseConfig);
console.log("Firebase Init Debug (firebaseConfig.js): Resolved Canvas App ID for export = ", __app_id);
console.log("Firebase Init Debug (firebaseConfig.js): Initial Auth Token status for export = ", !!__initial_auth_token);


// Export raw config and globals. Firebase app itself is NOT initialized here.
export {
    firebaseConfig,
    __app_id as canvasAppId, // Renamed to avoid confusion with Firebase config's appId
    __initial_auth_token as canvasAuthToken,
};
