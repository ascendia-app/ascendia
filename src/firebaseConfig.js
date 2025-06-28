// src/firebaseConfig.js

// IMPORTANT: Replace these with your actual Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyC5xNK1gThitsLgSnzF7iujPKUEsnqA1jA",
  authDomain: "ascendia-app.firebaseapp.com",
  projectId: "ascendia-app",
  storageBucket: "ascendia-app.firebasestorage.app",
  messagingSenderId: "537890941125",
  appId: "1:537890941125:web:b3bdbd902b5ac7b5d6e8ac",
  // measurementId: "YOUR_MEASUREMENT_ID" // Uncomment if you enable analytics, and replace its value
};

// DO NOT MODIFY THE FOLLOWING GLOBAL VARIABLES.
// They are provided by the Canvas environment at runtime for seamless integration.
// If you are developing locally, they will be undefined and your app will use the values from firebaseConfig above.
const __app_id = typeof __app_id !== 'undefined' ? __app_id : firebaseConfig.appId;
const __firebase_config = typeof __firebase_config !== 'undefined' ? __firebase_config : JSON.stringify(firebaseConfig);
const __initial_auth_token = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : undefined;


export {
  __app_id as appId,
  __firebase_config as firebaseConfig,
  __initial_auth_token as initialAuthToken
};
