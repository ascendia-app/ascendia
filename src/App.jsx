import React, { useState, useEffect, useRef, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import all necessary components and pages
import Header from './components/Header';
import UserProfileWidget from './components/UserProfileWidget';
import NotificationsDropdown from './components/NotificationsDropdown';
import ThemeToggle from './components/ThemeToggle'; // Although Header has theme toggle logic, keeping this import in case it's used elsewhere

// Icons from lucide-react
import { Bell } from 'lucide-react';

// Import all your defined pages
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import GettingStarted from './pages/GettingStarted';
import Syllabus from './pages/Syllabus';
import Papers from './pages/Papers';
import Planner from './pages/Planner';
import Tracker from './pages/Tracker';
import Downloads from './pages/Downloads';
import Profile from './pages/Profile';

// Import the AuthContext to get Firebase instances and user info
import { useAuth } from './contexts/AuthContext';

// Import specific Firestore functions needed directly in App.jsx
// (doc and getDoc are used for fetching user profile data)
import { doc, getDoc } from 'firebase/firestore';

// Import your global/app-level CSS files
import './App.css';
import './PageStyles.css'; // Contains general styling for pages and common elements

/**
 * Main App Component
 * Handles routing, global state (dark mode), user authentication status,
 * and fetching basic user profile data (like username) from Firestore.
 */
function App() {
    // Destructure necessary values from the AuthContext
    // This is where 'db' is made available for this component
    const { currentUser, loading, db, appId, userId, isFirebaseInitialized, logout } = useAuth();

    // State for managing dark mode
    const [isDarkMode, setIsDarkMode] = useState(() => {
        // Initialize dark mode preference from localStorage
        const savedMode = localStorage.getItem('dark-mode');
        return savedMode ? JSON.parse(savedMode) : false;
    });

    // State for the username displayed in the header
    const [displayedUsername, setDisplayedUsername] = useState('');

    // States for controlling the visibility of header dropdowns
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

    // Refs for detecting clicks outside dropdowns to close them
    const notificationsRef = useRef(null);
    const profileMenuRef = useRef(null);

    /**
     * useEffect hook for applying dark mode class to HTML and body elements.
     * Runs whenever `isDarkMode` state changes.
     */
    useEffect(() => {
        const rootHtmlElement = document.documentElement;
        const appContainer = document.querySelector(".app"); // Select the main app div

        if (isDarkMode) {
            rootHtmlElement.classList.add("dark");
            document.body.classList.add("dark");
            if (appContainer) appContainer.classList.add("dark");
        } else {
            rootHtmlElement.classList.remove("dark");
            document.body.classList.remove("dark");
            if (appContainer) appContainer.classList.remove("dark");
        }
        // Save the current dark mode preference to local storage
        localStorage.setItem("dark-mode", JSON.stringify(isDarkMode));
    }, [isDarkMode]);

    /**
     * useEffect hook for fetching the user's username from Firestore.
     * This runs when authentication status (`currentUser`, `loading`) or Firebase instances (`db`, `appId`, `userId`, `isFirebaseInitialized`) change.
     */
    useEffect(() => {
        const fetchUsername = async () => {
            // CRITICAL CHECK: Ensure all Firebase-related dependencies are ready before making a Firestore call.
            // If any of these are not yet available, skip the fetch to prevent 'db is not defined' or other errors.
            if (!isFirebaseInitialized || !db || !appId || !userId || !currentUser) {
                console.log("App.jsx: Skipping username fetch. Firebase not fully initialized, or DB/Auth details not ready.");
                setDisplayedUsername(''); // Clear username if prerequisites are not met (e.g., user logged out)
                return; // Exit early
            }

            console.log("App.jsx: Attempting to fetch username from Firestore...");
            // Set a default display name (e.g., email prefix) while fetching or if no custom username exists.
            setDisplayedUsername(currentUser.email ? currentUser.email.split("@")[0] : "User");

            try {
                // Construct the document reference to the user's profile data in Firestore
                const userDocRef = doc(db, `artifacts/${appId}/users/${userId}/profile/data`);
                // Fetch the document snapshot
                const docSnap = await getDoc(userDocRef);

                // Check if the document exists and contains a 'username' field
                if (docSnap.exists() && docSnap.data() && docSnap.data().username) {
                    setDisplayedUsername(docSnap.data().username);
                    console.log("App.jsx: Fetched username from Firestore:", docSnap.data().username);
                } else {
                    console.warn("App.jsx: No 'username' field found in Firestore profile for UID:", userId, ". Displaying email prefix as default.");
                }
            } catch (error) {
                // Log any errors during the Firestore fetch
                console.error("App.jsx: Error fetching username from Firestore:", error);
                // The displayedUsername will remain the email prefix or "User" in case of an error.
            }
        };

        // Trigger the fetchUsername function only when Firebase is initialized, not loading, and a user is present.
        if (isFirebaseInitialized && !loading && currentUser) {
            fetchUsername();
        } else if (isFirebaseInitialized && !loading && !currentUser) {
            // If Firebase is initialized, loading is false, but no user, clear the displayed username.
            setDisplayedUsername('');
        }
    }, [currentUser, loading, db, appId, userId, isFirebaseInitialized]); // Dependencies for this effect

    /**
     * useEffect hook for handling clicks outside the notifications and profile dropdowns
     * to automatically close them.
     */
    useEffect(() => {
        function handleClickOutside(event) {
            // Check if the click was inside the notifications dropdown or its trigger icon
            const isNotificationsClick = notificationsRef.current && notificationsRef.current.contains(event.target);
            const isBellIconClick = event.target.closest(".bell-icon-link");

            // Check if the click was inside the profile menu dropdown or its trigger
            const isProfileMenuClick = profileMenuRef.current && profileMenuRef.current.contains(event.target);
            const isUserInfoTriggerClick = event.target.closest(".user-info-trigger");

            // Close notification dropdown if clicked outside and not on its trigger
            if (!isNotificationsClick && !isBellIconClick) {
                setIsNotificationsOpen(false);
            }
            // Close profile menu if clicked outside and not on its trigger
            if (!isProfileMenuClick && !isUserInfoTriggerClick) {
                setIsProfileMenuOpen(false);
            }
        }

        // Add the mousedown event listener to the document
        document.addEventListener("mousedown", handleClickOutside);
        // Clean up the event listener when the component unmounts
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []); // Empty dependency array means this effect runs once on mount and cleans up on unmount

    // Conditional rendering for a loading screen if Firebase is still initializing or authenticating
    if (!isFirebaseInitialized || loading) {
        return (
            <div className="page-container" style={{ justifyContent: 'center', alignItems: 'center' }}>
                <p className="welcome-message loading-pulse" style={{ color: '#ff4d88' }}>Initializing application...</p>
            </div>
        );
    }

    // Main application structure
    return (
        <Router>
            <div className="app">
                {/* Header component, passed props for controlling theme and dropdowns */}
                <Header
                    displayedUsername={displayedUsername}
                    onToggleTheme={() => setIsDarkMode(prev => !prev)}
                    isDarkMode={isDarkMode}
                    onToggleNotifications={() => setIsNotificationsOpen(prev => !prev)}
                    onToggleProfileMenu={() => setIsProfileMenuOpen(prev => !prev)}
                    notificationsRef={notificationsRef} // Pass ref for outside click detection
                    profileMenuRef={profileMenuRef}     // Pass ref for outside click detection
                    isNotificationsOpen={isNotificationsOpen} // Pass state for Header to know dropdown status
                    isProfileMenuOpen={isProfileMenuOpen}     // Pass state for Header to know dropdown status
                    logout={logout} // Pass the logout function directly from useAuth
                />

                {/* Notifications dropdown, conditionally rendered */}
                {isNotificationsOpen && (
                    <NotificationsDropdown onClose={() => setIsNotificationsOpen(false)} userId={userId} />
                )}

                {/* User profile widget/dropdown, conditionally rendered */}
                {isProfileMenuOpen && (
                    <UserProfileWidget onClose={() => setIsProfileMenuOpen(false)} userId={userId} />
                )}

                {/* Define application routes */}
                <Routes>
                    {/* Root path: Redirects to dashboard if logged in, otherwise to getting started */}
                    <Route path="/" element={currentUser ? <Navigate to="/dashboard" replace /> : <GettingStarted />} />
                    <Route path="/getting-started" element={<GettingStarted />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    {/* Protected Routes: Only accessible if currentUser exists */}
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

                    {/* Catch-all route for any undefined paths, redirects to root */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
