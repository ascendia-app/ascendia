// src/contexts/AuthContext.jsx

import React, { createContext, useContext, useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithCustomToken,
  signInAnonymously,
  onAuthStateChanged,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Import the Firebase configuration and app ID from your firebaseConfig.js
import { firebaseConfig as rawFirebaseConfig, appId as rawAppId, initialAuthToken } from '../firebaseConfig';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  // Parse firebaseConfig which comes as a JSON string from the environment or is a direct object locally
  const parsedFirebaseConfig = typeof rawFirebaseConfig === 'string'
    ? JSON.parse(rawFirebaseConfig)
    : rawFirebaseConfig;

  const resolvedAppId = rawAppId; // Use the resolved appId

  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);
  const [userId, setUserId] = useState(null); // User ID state
  const [isFirebaseInitialized, setIsFirebaseInitialized] = useState(false); // New state for initialization status

  useEffect(() => {
    console.log("AuthContext: Initializing Firebase...");
    try {
      const app = initializeApp(parsedFirebaseConfig);
      const firebaseAuth = getAuth(app);
      const firestoreDb = getFirestore(app);

      setAuth(firebaseAuth);
      setDb(firestoreDb);
      setIsFirebaseInitialized(true); // Mark Firebase as initialized

      console.log("AuthContext: Firebase App, Auth, and Firestore initialized.");

      // Attempt to sign in with custom token if available (for Canvas environment)
      const signIn = async () => {
        try {
          if (initialAuthToken) {
            console.log("AuthContext: Signing in with custom token...");
            await signInWithCustomToken(firebaseAuth, initialAuthToken);
          } else {
            console.log("AuthContext: No custom token, signing in anonymously...");
            await signInAnonymously(firebaseAuth);
          }
        } catch (error) {
          console.error("AuthContext: Initial authentication failed:", error);
          // If custom token fails, try anonymous as a fallback, or handle the error
          if (initialAuthToken && error.code !== 'auth/invalid-custom-token') {
            try {
              console.log("AuthContext: Custom token failed, attempting anonymous sign-in as fallback.");
              await signInAnonymously(firebaseAuth);
            } catch (anonError) {
              console.error("AuthContext: Anonymous sign-in failed:", anonError);
            }
          }
        }
        setLoading(false); // Initial loading is complete after auth attempt
      };

      signIn(); // Call the async sign-in function

      // Set up auth state listener
      const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
        setCurrentUser(user);
        if (user) {
          setUserId(user.uid);
          console.log("AuthContext: Auth state changed. User is logged in. UID:", user.uid);
        } else {
          setUserId(null);
          console.log("AuthContext: Auth state changed. No user logged in.");
        }
        // If loading was true, it means this is the initial auth state check.
        // It's important to set loading to false only after the initial check.
        if (loading) {
            setLoading(false);
        }
      });

      // Cleanup subscription on component unmount
      return () => {
        console.log("AuthContext: Cleaning up auth state listener.");
        unsubscribe();
      };

    } catch (error) {
      console.error("AuthContext: Failed to initialize Firebase:", error);
      setLoading(false);
      setIsFirebaseInitialized(false);
      setAuth(null);
      setDb(null);
      setUserId(null);
    }
  }, [loading, parsedFirebaseConfig, resolvedAppId, initialAuthToken]); // Only re-run if config or token changes

  // Auth functions
  const login = async (email, password) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log("AuthContext: User logged in via email/password.");
      return { success: true };
    } catch (error) {
      console.error("AuthContext: Login failed:", error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (email, password) => {
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      console.log("AuthContext: User registered via email/password.");
      return { success: true };
    } catch (error) {
      console.error("AuthContext: Registration failed:", error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      console.log("AuthContext: User logged out.");
      return { success: true };
    } catch (error) {
      console.error("AuthContext: Logout failed:", error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    currentUser,
    loading,
    db, // Firestore instance
    auth, // Auth instance
    appId: resolvedAppId, // Firebase app ID from config
    userId, // User UID
    isFirebaseInitialized, // Firebase initialization status
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
