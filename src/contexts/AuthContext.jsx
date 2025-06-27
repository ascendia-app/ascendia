// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth'; // Ensure this is imported correctly
import { auth } from '../firebaseConfig'; // Import your auth instance

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true); // Tracks if auth state is still loading

  useEffect(() => {
    console.log("AuthContext: Setting up onAuthStateChanged listener.");
    // This listener observes changes in the user's sign-in state
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("AuthContext: onAuthStateChanged callback - user:", user ? user.uid : "null");
      setCurrentUser(user);
      setLoading(false); // Auth state has been determined
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, []); // Empty dependency array means this runs once on component mount

  const value = {
    currentUser,
    loading,
    // You can add more auth functions here if needed, e.g., login, logout directly
    // However, it's often cleaner to handle them in components that use the forms.
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children} {/* Only render children when auth state is known */}
    </AuthContext.Provider>
  );
};
