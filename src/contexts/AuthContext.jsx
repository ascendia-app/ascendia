import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth'; // Only need onAuthStateChanged here
import { signInAnonymously, signInWithCustomToken } from 'firebase/auth'; // Import these specific auth methods

// Import the already initialized Firebase instances and variables
import { auth, db, appId, initialAuthToken, firebaseClientConfig } from '../firebaseConfig'; // Get the instances and configs from firebaseConfig.js

// Ensure auth and db are available before proceeding.
// This is a safety check for development environments where firebaseConfig.js might fail silently.
if (!auth || !db) {
    console.error("AuthContext: Firebase Auth or Firestore instances are undefined. Check firebaseConfig.js initialization.");
    // You might want to render an error page or a loading screen indefinitely if this happens
}


const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true); // Tracks if auth state is still loading

    useEffect(() => {
        // Guard against auth being undefined if Firebase failed to initialize
        if (!auth) {
            setLoading(false);
            console.error("AuthContext useEffect: Firebase Auth is not initialized.");
            return;
        }

        console.log("AuthContext: Setting up onAuthStateChanged listener.");
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
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
                    await signInAnonymously(auth);
                    console.log("AuthContext: Signed in anonymously.");
                } catch (error) {
                    console.error("Anonymous sign-in error:", error);
                    // This is where 'auth/admin-restricted-operation' might appear if anonymous auth is not enabled
                }
            }
            setLoading(false); // Auth state has been determined
        });

        // Initial sign-in with custom token (from Canvas env) or anonymously
        const performInitialSignIn = async () => {
            if (initialAuthToken) {
                try {
                    await signInWithCustomToken(auth, initialAuthToken);
                    console.log("AuthContext: Signed in with Canvas custom token.");
                } catch (error) {
                    console.error("AuthContext: Error signing in with Canvas custom token:", error);
                    // If custom token fails, try anonymous as a fallback
                    try {
                        await signInAnonymously(auth);
                        console.log("AuthContext: Signed in anonymously after custom token failure.");
                    } catch (anonError) {
                        console.error("AuthContext: Anonymous sign-in fallback failed:", anonError);
                    }
                }
            } else if (!auth.currentUser) {
                try {
                    await signInAnonymously(auth);
                    console.log("AuthContext: Signed in anonymously as no custom token provided.");
                } catch (error) {
                    console.error("AuthContext: Anonymous sign-in failed:", error);
                }
            }
        };

        // Only run initial sign-in if not already loading or authenticated
        if (loading) {
            performInitialSignIn();
        }

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, []); // Empty dependency array means this effect runs once on mount

    const value = {
        currentUser,
        loading,
        // You might add login/logout/signup functions here later if needed
        // Also provide db and appId directly if components need them via context
        db,
        appId
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}
