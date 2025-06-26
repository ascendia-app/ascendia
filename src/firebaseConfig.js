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

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);

    export { auth, db }; // Export auth and db services for use in components
    