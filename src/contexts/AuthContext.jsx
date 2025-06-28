import React, { createContext, useContext, useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import {
    getAuth,
    signInWithCustomToken,
    signInAnonymously,
    onAuthStateChanged, // To listen for auth state changes
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    updateProfile // New: For updating user profiles (e.g., username)
} from 'firebase/auth';
import {
    getFirestore,
    doc,
    setDoc,
    getDoc // To fetch user data if needed on auth state change
} from 'firebase/firestore';

// Import the raw config and global variables from firebaseConfig.js
import { firebaseConfig, canvasAppId, canvasAuthToken } from '../firebaseConfig';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [authError, setAuthError] = useState(null);

    // New states for Firebase instances and derived userId
    const [firebaseApp, setFirebaseApp] = useState(null);
    const [authInstance, setAuthInstance] = useState(null);
    const [dbInstance, setDbInstance] = useState(null);
    const [userId, setUserId] = useState(null); // The authenticated user's UID or anonymous ID

    // --- EFFECT: Initialize Firebase and handle initial authentication ---
    useEffect(() => {
        console.log("AuthContext: Starting Firebase initialization useEffect.");
        let app, auth, db;

        try {
            // Ensure Firebase app is initialized only once
            if (!firebaseApp) {
                app = initializeApp(firebaseConfig);
                setFirebaseApp(app);
                console.log("AuthContext: Firebase app initialized.");
            } else {
                app = firebaseApp; // Use existing instance
                console.log("AuthContext: Firebase app already initialized.");
            }

            // Get Auth and Firestore instances
            auth = getAuth(app);
            setAuthInstance(auth);
            db = getFirestore(app);
            setDbInstance(db);
            console.log("AuthContext: Auth and Firestore instances obtained.");

            // --- Set up Auth State Listener ---
            const unsubscribe = onAuthStateChanged(auth, async (user) => {
                if (user) {
                    setCurrentUser(user);
                    setUserId(user.uid); // Set userId from authenticated user's UID
                    console.log("AuthContext: User authenticated:", user.uid);

                    // Optionally fetch user data from Firestore on sign-in/auth state change
                    // This is good practice to ensure user profile is in sync
                    const userDocRef = doc(db, `artifacts/${canvasAppId}/users/${user.uid}/profile/data`);
                    const userDocSnap = await getDoc(userDocRef);
                    if (userDocSnap.exists()) {
                        console.log("AuthContext: User profile data fetched:", userDocSnap.data());
                        setCurrentUser(prev => ({ ...prev, ...userDocSnap.data() })); // Merge profile data
                    } else {
                        console.log("AuthContext: No profile data found for user:", user.uid);
                    }

                } else {
                    setCurrentUser(null);
                    setUserId(null); // No user, so no userId
                    console.log("AuthContext: User is signed out or not authenticated.");
                }
                setLoading(false); // Auth state check is complete
                console.log("AuthContext: Auth state listener processed.");
            });

            // --- Handle Initial Authentication Token (Canvas-provided) ---
            if (canvasAuthToken && !auth.currentUser) {
                console.log("AuthContext: Attempting signInWithCustomToken with canvasAuthToken.");
                signInWithCustomToken(auth, canvasAuthToken)
                    .then(() => {
                        console.log("AuthContext: signInWithCustomToken successful.");
                        setAuthError(null);
                    })
                    .catch((error) => {
                        console.error("AuthContext: signInWithCustomToken failed:", error);
                        setAuthError("Authentication failed. Please try again.");
                        // Fallback to anonymous sign-in if custom token fails (optional)
                        signInAnonymously(auth)
                            .then(() => console.log("AuthContext: Signed in anonymously after custom token failure."))
                            .catch((anonError) => console.error("AuthContext: Anonymous sign-in failed:", anonError));
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
                console.log("AuthContext: User already authenticated or token not provided.");
                setLoading(false); // If already authenticated, stop loading right away
            }

            // Cleanup function for the auth state listener
            return () => {
                console.log("AuthContext: Cleaning up auth state listener.");
                unsubscribe();
            };

        } catch (error) {
            console.error("AuthContext: Error during Firebase initialization or initial authentication:", error);
            setAuthError("Failed to initialize authentication service. Please try again later.");
            setLoading(false); // Stop loading even if there's an error
        }
    }, [firebaseApp, canvasAuthToken, canvasAppId]); // Depend on firebaseApp (to init once), and canvas tokens (if they change)

    // --- Authentication Actions (passed to consumers) ---
    const register = async (email, password, username) => {
        setAuthError(null);
        try {
            const userCredential = await createUserWithEmailAndPassword(authInstance, email, password);
            // After creating user, update their profile with the username
            await updateProfile(userCredential.user, { displayName: username });

            // Create a user document in Firestore to store their username/profile data
            const userDocRef = doc(dbInstance, `artifacts/${canvasAppId}/users/${userCredential.user.uid}/profile/data`);
            await setDoc(userDocRef, {
                uid: userCredential.user.uid,
                email: userCredential.user.email,
                username: username,
                createdAt: new Date().toISOString()
            }, { merge: true }); // Use merge to avoid overwriting existing fields if any

            console.log("AuthContext: User registered and profile updated:", userCredential.user.uid);
            return userCredential.user;
        } catch (error) {
            console.error("AuthContext: Registration failed:", error);
            setAuthError(error.message);
            throw error; // Re-throw to allow component to catch and display specific errors
        }
    };

    const login = async (email, password) => {
        setAuthError(null);
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
        db: dbInstance, // Export db instance directly from context
        appId: canvasAppId, // Export appId directly from context
        userId // Export the derived userId
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children} {/* Only render children once authentication state is determined */}
        </AuthContext.Provider>
    );
};
