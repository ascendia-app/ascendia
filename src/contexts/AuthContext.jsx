import React, { createContext, useContext, useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCustomToken, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Define global variables provided by the Canvas environment
const __app_id = typeof window !== 'undefined' && window.__app_id !== undefined ? window.__app_id : 'default-app-id';
const __firebase_config = typeof window !== 'undefined' && window.__firebase_config !== undefined ? window.__firebase_config : '{}';
const __initial_auth_token = typeof window !== 'undefined' && window.__initial_auth_token !== undefined ? window.__initial_auth_token : null;

// Initialize Firebase App
const firebaseConfig = JSON.parse(__firebase_config);
let app, authInstance, dbInstance;

try {
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
export const appId = __app_id;

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
                // console.log("Firebase Auth State Changed: User is signed in:", user.uid);
            } else {
                // User is signed out.
                setCurrentUser(null);
                // console.log("Firebase Auth State Changed: User is signed out. Attempting anonymous sign-in.");
                try {
                    // Fallback to anonymous sign-in if no user and no initial token or token expired
                    if (!__initial_auth_token) {
                        // console.log("Anonymous sign-in as no initial auth token provided.");
                        await signInAnonymously(authInstance);
                    } else {
                        // Attempt to sign in with the initial token again if needed,
                        // or rely on the initial sign-in logic if token just got processed
                        // For Canvas, it often provides a token for anonymous/guest sessions
                        // console.log("Initial auth token was provided, relying on its initial sign-in.");
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
            if (authInstance && typeof __initial_auth_token !== 'undefined' && __initial_auth_token !== null) {
                try {
                    await signInWithCustomToken(authInstance, __initial_auth_token);
                    // console.log("AuthContext: Signed in with Canvas custom token.");
                } catch (error) {
                    console.error("AuthContext: Error signing in with Canvas custom token:", error);
                    // If custom token fails, try anonymous as a fallback
                    try {
                        await signInAnonymously(authInstance);
                        // console.log("AuthContext: Signed in anonymously after custom token failure.");
                    } catch (anonError) {
                        console.error("AuthContext: Anonymous sign-in fallback failed:", anonError);
                    }
                }
            } else if (authInstance && !authInstance.currentUser) {
                try {
                    await signInAnonymously(authInstance);
                    // console.log("AuthContext: Signed in anonymously as no custom token provided.");
                } catch (error) {
                    console.error("AuthContext: Anonymous sign-in failed:", error);
                }
            }
        };

        // Only run initial sign-in if not already loading or authenticated
        if (loading && !authInstance.currentUser) {
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
