import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  setPersistence, // Import setPersistence
  browserLocalPersistence, // Import browserLocalPersistence
  browserSessionPersistence, // Also good to know about session persistence
  // You might have other auth methods imported here
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore'; // For saving user data
import { auth, db } from '../firebaseConfig'; // Your Firebase auth and db instances

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true); // Initial loading state for auth

  // Effect to set up Firebase auth state observer
  useEffect(() => {
    // Set persistence to LOCAL when the AuthProvider initializes
    // This will make Firebase remember the user even after the browser is closed
    setPersistence(auth, browserLocalPersistence)
      .then(() => {
        // After setting persistence, set up the auth state observer
        const unsubscribe = onAuthStateChanged(auth, user => {
          setCurrentUser(user);
          setLoading(false); // Auth state determined
          if (user) {
            console.log("User state changed: Logged in as", user.email, "UID:", user.uid);
          } else {
            console.log("User state changed: Logged out.");
          }
        });
        return unsubscribe; // Cleanup subscription on unmount
      })
      .catch(error => {
        console.error("Error setting Firebase persistence:", error);
        setLoading(false); // Still stop loading even if persistence fails
      });

  }, []); // Empty dependency array means this runs once on mount

  // Firebase Auth functions wrapped for context
  const signup = async (email, password, username) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Save additional user info to Firestore
    await setDoc(doc(db, "users", user.uid), {
      username: username,
      email: user.email,
      createdAt: new Date(),
      // Add other profile fields here as needed
    });
    return user;
  };

  const login = async (email, password) => {
    // Persistence is already set globally for the auth instance in the useEffect above.
    // So, no need to set it again specifically during login.
    return signInWithEmailAndPassword(auth, email, password);
  };

  const logout = () => {
    return signOut(auth);
  };

  const value = {
    currentUser,
    signup,
    login,
    logout,
    loading,
    // Add other methods if needed (e.g., resetPassword, updateEmail)
  };

  return (
    <AuthContext.Provider value={value}>
      {/* Render children only when authentication state is determined */}
      {!loading && children}
    </AuthContext.Provider>
  );
}
