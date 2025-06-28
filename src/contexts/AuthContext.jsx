import React, { createContext, useContext, useState, useEffect } from 'react';
import { initializeApp, getApps, getApp } from 'firebase/app'; // getApps, getApp for checking if already initialized
import {
    getAuth,
    signInWithCustomToken,
    signInAnonymously,
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    updateProfile
} from 'firebase/auth';
import {
    getFirestore,
    doc,
    setDoc,
    getDoc
} from 'firebase/firestore';

// Import the raw config and global variables from firebaseConfig.js
import { firebaseConfig, canvasAppId, canvasAuthToken } from '../firebaseConfig';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true); // Initial loading for auth state
    const [authError, setAuthError] = useState(null);

    const [authInstance, setAuthInstance] = useState(null);
    const [dbInstance, setDbInstance] = useState(null);
    const [userId, setUserId] = useState(null); // The authenticated user's UID or anonymous ID
    const [isFirebaseInitialized, setIsFirebaseInitialized] = useState(false); // New state to track full Firebase initialization

    // --- EFFECT: Initialize Firebase and handle initial authentication ---
    useEffect(() => {
        console.log("AuthContext: Starting Firebase initialization useEffect.");
        let appInstance, auth, db;

        try {
            // Check if a Firebase app has already been initialized to avoid re-initialization warnings/errors
            if (!getApps().length) {
                appInstance = initializeApp(firebaseConfig);
                console.log("AuthContext: Firebase app initialized for the first time.");
            } else {
                appInstance = getApp(); // Get the already initialized app
                console.log("AuthContext: Firebase app already initialized, retrieving existing instance.");
            }

            auth = getAuth(appInstance);
            db = getFirestore(appInstance);

            setAuthInstance(auth);
            setDbInstance(db);
            setIsFirebaseInitialized(true); // Firebase instances are now available
            console.log("AuthContext: Auth and Firestore instances obtained and set. Firebase is now initialized.");

            // --- Set up Auth State Listener ---
            const unsubscribe = onAuthStateChanged(auth, async (user) => {
                setCurrentUser(user); // Set current user first
                if (user) {
                    setUserId(user.uid);
                    console.log("AuthContext: User authenticated (onAuthStateChanged):", user.uid);

                    // Fetch user profile data after authentication
                    const userDocRef = doc(db, `artifacts/${canvasAppId}/users/${user.uid}/profile/data`);
                    try {
                        const userDocSnap = await getDoc(userDocRef);
                        if (userDocSnap.exists()) {
                            console.log("AuthContext: User profile data fetched:", userDocSnap.data());
                            setCurrentUser(prev => ({ ...prev, ...userDocSnap.data() })); // Merge profile data
                        } else {
                            console.log("AuthContext: No profile data found for user:", user.uid);
                        }
                    } catch (profileError) {
                        console.error("AuthContext: Error fetching user profile:", profileError);
                        setAuthError("Failed to fetch user profile. Displaying basic info.");
                    }
                } else {
                    setUserId(null);
                    console.log("AuthContext: User is signed out or not authenticated (onAuthStateChanged).");
                }
                setLoading(false); // Auth state check is complete
                console.log("AuthContext: Auth state listener processed. Loading set to false.");
            });

            // --- Handle Initial Authentication Token (Canvas-provided) ---
            // Only attempt signIn if there's no current user and token is available
            if (canvasAuthToken && !auth.currentUser) {
                console.log("AuthContext: Attempting signInWithCustomToken with canvasAuthToken.");
                signInWithCustomToken(auth, canvasAuthToken)
                    .then(() => {
                        console.log("AuthContext: signInWithCustomToken successful.");
                        setAuthError(null);
                    })
                    .catch((error) => {
                        console.error("AuthContext: signInWithCustomToken failed:", error);
                        setAuthError("Authentication failed. Attempting anonymous sign-in.");
                        // Fallback to anonymous sign-in if custom token fails
                        signInAnonymously(auth)
                            .then(() => console.log("AuthContext: Signed in anonymously after custom token failure."))
                            .catch((anonError) => console.error("AuthContext: Anonymous sign-in also failed:", anonError));
                    });
            } else if (!auth.currentUser) {
                // If no custom token and no current user, sign in anonymously
                console.log("AuthContext: No custom token, attempting anonymous sign-in.");
                signInAnonymously(auth)
                    .then(() => console.log("AuthContext: Signed in anonymously successfully."))
                    .catch((error) => {
                        console.error("AuthContext: Anonymous sign-in failed:", error);
                        setAuthError("Failed to authenticate anonymously. Some features may be unavailable.");
                    });
            } else {
                console.log("AuthContext: User already authenticated or no initial token needed.");
                // If already authenticated, setLoading to false will happen via onAuthStateChanged callback
            }

            // Cleanup function for the auth state listener
            return () => {
                console.log("AuthContext: Cleaning up auth state listener.");
                unsubscribe();
            };

        } catch (error) {
            console.error("AuthContext: Critical Error during Firebase initialization or setup:", error);
            setAuthError("Failed to initialize authentication service. Please try again later.");
            setLoading(false); // Ensure loading state is false even on critical errors
            setIsFirebaseInitialized(false); // Mark as not initialized on error
        }
    }, [canvasAuthToken, canvasAppId]); // Dependencies: only re-run if these global-like values change

    // --- Authentication Actions (passed to consumers) ---
    const register = async (email, password, username) => {
        setAuthError(null);
        if (!authInstance || !dbInstance) {
            setAuthError("Authentication service not ready.");
            return;
        }
        try {
            const userCredential = await createUserWithEmailAndPassword(authInstance, email, password);
            await updateProfile(userCredential.user, { displayName: username });

            const userDocRef = doc(dbInstance, `artifacts/${canvasAppId}/users/${userCredential.user.uid}/profile/data`);
            await setDoc(userDocRef, {
                uid: userCredential.user.uid,
                email: userCredential.user.email,
                username: username,
                createdAt: new Date().toISOString()
            }, { merge: true });

            console.log("AuthContext: User registered and profile updated:", userCredential.user.uid);
            return userCredential.user;
        } catch (error) {
            console.error("AuthContext: Registration failed:", error);
            setAuthError(error.message);
            throw error;
        }
    };

    const login = async (email, password) => {
        setAuthError(null);
        if (!authInstance) {
            setAuthError("Authentication service not ready.");
            return;
        }
        try {
            const userCredential = await signInWithEmailAndPassword(authInstance, email, password);
            console.log("AuthContext: User logged in:", userCredential.user.uid);
            return userCredential.user;
        } catch (error) {
            console.error("AuthContext: Login failed:", error);
            setAuthError(error.message);
            throw error;
        }
    };

    const logout = async () => {
        setAuthError(null);
        if (!authInstance) {
            setAuthError("Authentication service not ready.");
            return;
        }
        try {
            await signOut(authInstance);
            console.log("AuthContext: User logged out.");
        } catch (error) {
            console.error("AuthContext: Logout failed:", error);
            setAuthError(error.message);
            throw error;
        }
    };

    const value = {
        currentUser,
        loading,
        authError,
        register,
        login,
        logout,
        db: dbInstance, // Provide db instance
        appId: canvasAppId, // Provide appId
        userId, // Provide userId
        isFirebaseInitialized // Provide initialization status
    };

    return (
        <AuthContext.Provider value={value}>
            {/* Only render children if Firebase is fully initialized AND auth state has been determined */}
            {isFirebaseInitialized && !loading ? children : <LoadingScreen />}
        </AuthContext.Provider>
    );
};

// Simple loading screen to show while Firebase initializes and auth state is determined
const LoadingScreen = () => (
    <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f9f9f9',
        color: '#ff4d88',
        fontSize: '1.5rem',
        fontFamily: 'Poppins, sans-serif'
    }}>
        <p className="loading-pulse">Initializing Ascendia...</p>
    </div>
);
