import React, { useState, useEffect, useRef, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header'; // Assuming you have this component
import UserProfileWidget from './components/UserProfileWidget'; // Assuming you have this component
import NotificationsDropdown from './components/NotificationsDropdown'; // Assuming you have this component
import ThemeToggle from './components/ThemeToggle'; // Assuming you have this component

import { Bell } from 'lucide-react'; // For the notification bell icon

// Import your pages
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import GettingStarted from './pages/GettingStarted';
import Syllabus from './pages/Syllabus'; // Ensure Syllabus page is imported
import Papers from './pages/Papers'; // Assuming you have this page
import Planner from './pages/Planner'; // Assuming you have this page
import Tracker from './pages/Tracker'; // Assuming you have this page
import Downloads from './pages/Downloads'; // Assuming you have this page
import Profile from './pages/Profile'; // Assuming you have this page

// Import the AuthContext to get Firebase instances and user info
import { useAuth } from './contexts/AuthContext';

// Import Firestore functions needed here
import { doc, getDoc } from 'firebase/firestore'; // Import specific functions

import './App.css'; // Your main App-level CSS
import './PageStyles.css'; // General page styles (buttons, etc.)


function App() {
    // Get currentUser, loading, db, appId, and userId from AuthContext
    // 't' in minified code is 'currentUser', 'e' is 'loading'
    const { currentUser, loading, db, appId, userId, isFirebaseInitialized } = useAuth();

    const [isDarkMode, setIsDarkMode] = useState(() => {
        // Initialize dark mode from localStorage or default to false
        const savedMode = localStorage.getItem('dark-mode');
        return savedMode ? JSON.parse(savedMode) : false;
    });

    const [displayedUsername, setDisplayedUsername] = useState(''); // 'n' in minified code
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false); // 'v' in minified code
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false); // 'h' in minified code

    const notificationsRef = useRef(null); // 'm' in minified code
    const profileMenuRef = useRef(null); // 'b' in minified code


    // Effect to set dark mode class on document/body
    // This corresponds to the minified useEffect with 'l' (isDarkMode) as dependency
    useEffect(() => {
        const rootHtmlElement = document.documentElement;
        const appContainer = document.querySelector(".app");

        if (isDarkMode) {
            rootHtmlElement.classList.add("dark");
            document.body.classList.add("dark");
            if (appContainer) appContainer.classList.add("dark");
        } else {
            rootHtmlElement.classList.remove("dark");
            document.body.classList.remove("dark");
            if (appContainer) appContainer.classList.remove("dark");
        }
        localStorage.setItem("dark-mode", JSON.stringify(isDarkMode));
    }, [isDarkMode]); // 'l' in minified code

    // Effect to fetch username from Firestore
    // This corresponds to the minified useEffect that was causing the error
    useEffect(() => {
        const fetchUsername = async () => {
            // CRITICAL: Ensure Firebase db, appId, and userId are available before proceeding
            if (!db || !appId || !userId || !currentUser) {
                console.log("App.jsx: Skipping username fetch. DB, AppId, UserId, or CurrentUser not ready.");
                setDisplayedUsername(''); // Clear username if prerequisites are not met
                return;
            }

            console.log("App.jsx: Attempting to fetch username from Firestore...");
            setDisplayedUsername(currentUser.email ? currentUser.email.split("@")[0] : "User"); // Default to email prefix
            try {
                // Use the 'db' from useAuth here
                const userDocRef = doc(db, `artifacts/${appId}/users/${userId}/profile/data`);
                const docSnap = await getDoc(userDocRef);

                if (docSnap.exists() && docSnap.data() && docSnap.data().username) {
                    setDisplayedUsername(docSnap.data().username);
                    console.log("App.jsx: Fetched username from Firestore:", docSnap.data().username);
                } else {
                    console.warn("App.jsx: No 'username' field found in Firestore profile for UID:", userId, ". Displaying email prefix as default.");
                }
            } catch (error) {
                console.error("App.jsx: Error fetching username from Firestore:", error);
                // Fallback already handled by setting email prefix
            }
        };

        // Only attempt to fetch username if not loading and currentUser is available
        // This corresponds to `e || (console.log(...), D())` in minified code
        if (!loading && currentUser) {
            fetchUsername();
        } else if (!loading && !currentUser) {
            setDisplayedUsername(''); // Clear username if logged out
        }
    }, [currentUser, loading, db, appId, userId]); // Dependencies: t (currentUser), e (loading), db, appId, userId

    // Effect for handling click outside notifications/profile dropdowns
    // This corresponds to the minified useEffect with event listeners
    useEffect(() => {
        function handleClickOutside(event) {
            // 'm' is notificationsRef.current, 'b' is profileMenuRef.current
            const isNotificationsClick = notificationsRef.current && notificationsRef.current.contains(event.target);
            const isProfileMenuClick = profileMenuRef.current && profileMenuRef.current.contains(event.target);
            const isBellIconClick = event.target.closest(".bell-icon-link");
            const isUserInfoTriggerClick = event.target.closest(".user-info-trigger");

            // Close notification dropdown if clicked outside and not on bell icon
            if (!isNotificationsClick && !isBellIconClick) {
                setIsNotificationsOpen(false);
            }
            // Close profile menu if clicked outside and not on user info trigger
            if (!isProfileMenuClick && !isUserInfoTriggerClick) {
                setIsProfileMenuOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []); // No dependencies needed for this global event listener


    // Ensure the app waits until Firebase is fully initialized and auth state is determined
    if (!isFirebaseInitialized || loading) {
        return (
            <div className="page-container" style={{ justifyContent: 'center', alignItems: 'center' }}>
                <p className="welcome-message loading-pulse" style={{ color: '#ff4d88' }}>Initializing application...</p>
            </div>
        );
    }

    return (
        <Router>
            <div className="app">
                <Header
                    displayedUsername={displayedUsername}
                    onToggleTheme={() => setIsDarkMode(prev => !prev)}
                    isDarkMode={isDarkMode}
                    onToggleNotifications={() => setIsNotificationsOpen(prev => !prev)}
                    onToggleProfileMenu={() => setIsProfileMenuOpen(prev => !prev)}
                    notificationsRef={notificationsRef}
                    profileMenuRef={profileMenuRef}
                    isNotificationsOpen={isNotificationsOpen}
                    isProfileMenuOpen={isProfileMenuOpen}
                />
                {isNotificationsOpen && <NotificationsDropdown onClose={() => setIsNotificationsOpen(false)} userId={userId} />}
                {isProfileMenuOpen && (
                    <UserProfileWidget onClose={() => setIsProfileMenuOpen(false)} userId={userId} />
                )}

                <Routes>
                    <Route path="/" element={currentUser ? <Navigate to="/dashboard" replace /> : <GettingStarted />} />
                    <Route path="/getting-started" element={<GettingStarted />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    {/* Protected Routes - Render only if currentUser exists */}
                    <Route
                        path="/dashboard"
                        element={currentUser ? <Dashboard /> : <Navigate to="/login" replace />}
                    />
                    <Route
                        path="/syllabus"
                        element={currentUser ? <Syllabus /> : <Navigate to="/login" replace />}
                    />
                    <Route
                        path="/papers"
                        element={currentUser ? <Papers /> : <Navigate to="/login" replace />}
                    />
                    <Route
                        path="/planner"
                        element={currentUser ? <Planner /> : <Navigate to="/login" replace />}
                    />
                    <Route
                        path="/tracker"
                        element={currentUser ? <Tracker /> : <Navigate to="/login" replace />}
                    />
                     <Route
                        path="/downloads"
                        element={currentUser ? <Downloads /> : <Navigate to="/login" replace />}
                    />
                    <Route
                        path="/profile"
                        element={currentUser ? <Profile /> : <Navigate to="/login" replace />}
                    />

                    {/* Catch-all for undefined routes */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
