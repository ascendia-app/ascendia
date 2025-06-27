import React, { createContext, useContext, useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCustomToken, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Define global variables provided by the Canvas environment
const __app_id = typeof window !== 'undefined' && window.__app_id !== undefined ? window.__app_id : 'default-app-id';
const __firebase_config = typeof window !== 'undefined' && window.__firebase_config !== undefined ? window.__firebase_config : '{}';
const __initial_auth_token = typeof window !== 'undefined' && window.__initial_auth_token !== undefined ? window.__initial_auth_token : null;

// Initialize Firebase App
let app, authInstance, dbInstance;
let firebaseConfig = {};

try {
    firebaseConfig = JSON.parse(__firebase_config);
    // Add console log for debugging the incoming config
    console.log("Firebase Init Debug: Canvas-provided config:", firebaseConfig);

    // CRITICAL FALLBACK FOR INVALID/EMPTY CONFIG:
    // If the parsed config is empty or doesn't have an apiKey, it means Canvas didn't provide it correctly.
    // In this case, use your hardcoded Firebase config for development/debugging.
    // YOU WILL NEED TO SECURE THIS FOR PRODUCTION DEPLOYMENTS IF NOT USING CANVAS ENV VARIABLES.
    if (!firebaseConfig || Object.keys(firebaseConfig).length === 0 || !firebaseConfig.apiKey) {
        console.warn("Firebase Init Debug: Canvas-provided config is empty or invalid. Falling back to hardcoded config.");
        // !! YOUR ACTUAL FIREBASE PROJECT CONFIG IS INSERTED BELOW !!
        firebaseConfig = {
            apiKey: "AIzaSyC5xNK1gThitsLgSnzF7iujPKUEsnqA1jA",
            authDomain: "ascendia-app.firebaseapp.com",
            projectId: "ascendia-app",
            storageBucket: "ascendia-app.firebasestorage.app",
            messagingSenderId: "537890941125",
            appId: "1:537890941125:web:b3bdbd902b5ac7b5d6e8ac"
            // Note: measurementId was not in your provided config, so it's omitted here.
        };
    }
    console.log("Firebase Init Debug: Final Firebase Config = ", firebaseConfig);
    console.log("Firebase Init Debug: Final Resolved App ID = ", __app_id);
    console.log("Firebase Init Debug: Initial Auth Token provided = ", !!__initial_auth_token);


    app = initializeApp(firebaseConfig);
    authInstance = getAuth(app);
    dbInstance = getFirestore(app);
    console.log("Firebase app initialized successfully.");
} catch (e) {
    console.error("Firebase initialization failed:", e);
    // Handle error, e.g., set an error state or show a message
}

// Export db and appId for direct import where needed
export const db = dbInstance;
export const appId = __app_id; // This is the Canvas-provided app ID

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true); // Tracks if auth state is still loading

    useEffect(() => {
        // console.log("AuthContext: Setting up onAuthStateChanged listener.");
        const unsubscribe = onAuthStateChanged(authInstance, async (user) => {
            if (user) {
                // User is signed in.
                setCurrentUser(user);
                console.log("Firebase Auth State Changed: User is signed in:", user.uid);
            } else {
                // User is signed out.
                setCurrentUser(null);
                console.log("Firebase Auth State Changed: User is signed out. Attempting anonymous sign-in.");
                try {
                    // Fallback to anonymous sign-in if no user and no initial token or token expired
                    // Only try anonymous if authInstance is defined
                    if (authInstance) {
                        await signInAnonymously(authInstance);
                        console.log("AuthContext: Signed in anonymously.");
                    } else {
                        console.warn("AuthContext: authInstance not available for anonymous sign-in.");
                    }
                } catch (error) {
                    console.error("Anonymous sign-in error:", error);
                    // This is where 'auth/admin-restricted-operation' might appear
                }
            }
            setLoading(false); // Auth state has been determined
        });

        // Initial sign-in with custom token (from Canvas env) or anonymously
        const performInitialSignIn = async () => {
            if (authInstance) { // Ensure authInstance is defined
                if (__initial_auth_token) {
                    try {
                        await signInWithCustomToken(authInstance, __initial_auth_token);
                        console.log("AuthContext: Signed in with Canvas custom token.");
                    } catch (error) {
                        console.error("AuthContext: Error signing in with Canvas custom token:", error);
                        // If custom token fails, try anonymous as a fallback
                        try {
                            await signInAnonymously(authInstance);
                            console.log("AuthContext: Signed in anonymously after custom token failure.");
                        } catch (anonError) {
                            console.error("AuthContext: Anonymous sign-in fallback failed:", anonError);
                        }
                    }
                } else if (!authInstance.currentUser) {
                    try {
                        await signInAnonymously(authInstance);
                        console.log("AuthContext: Signed in anonymously as no custom token provided.");
                    } catch (error) {
                        console.error("AuthContext: Anonymous sign-in failed:", error);
                    }
                }
            } else {
                console.warn("AuthContext: authInstance not available for initial sign-in attempt.");
            }
        };

        // Only run initial sign-in if not already loading or authenticated
        // and if Firebase instances are ready.
        if (loading && authInstance) { // Check authInstance before calling performInitialSignIn
            performInitialSignIn();
        }

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, []); // Empty dependency array means this effect runs once on mount

    const value = {
        currentUser,
        loading,
        // You might add login/logout/signup functions here later if needed
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}
