import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import './App.css';
import { useAuth } from './contexts/AuthContext';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebaseConfig';

// Import pages
import Home from './pages/Home';
import Syllabus from './pages/Syllabus';
import Papers from './pages/Papers';
import Tracker from './pages/Tracker';
import Countdown from './pages/Countdown';
import Planner from './pages/Planner';
import GettingStarted from './pages/GettingStarted';
import Login from './pages/Login';
import UserSettings from './pages/UserSettings';


function App() {
  const { currentUser, loading } = useAuth(); // AuthContext's loading state (for initial Firebase Auth readiness)
  const [displayedUsername, setDisplayedUsername] = useState('');
  const [isUsernameLoading, setIsUsernameLoading] = useState(false); // NEW: State for username fetch loading
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('dark-mode');
    return savedTheme === 'true' ? true : false;
  });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const navigate = useNavigate();

  // DEBUG: Log current user and loading state (keep these, they are helpful!)
  useEffect(() => {
    console.log("AuthContext: currentUser =", currentUser);
    console.log("AuthContext: loading =", loading);
    console.log("App.jsx: displayedUsername =", displayedUsername);
  }, [currentUser, loading, displayedUsername]);


  useEffect(() => {
    const root = document.documentElement;
    const appElement = document.querySelector('.app');

    if (darkMode) {
      root.classList.add('dark');
      document.body.classList.add('dark');
      if (appElement) appElement.classList.add('dark');
    } else {
      root.classList.remove('dark');
      document.body.classList.remove('dark');
      if (appElement) appElement.classList.remove('dark');
    }

    localStorage.setItem('dark-mode', darkMode);
  }, [darkMode]);

  // Effect to fetch username when currentUser changes (i.e., login/logout)
  useEffect(() => {
    const fetchUsername = async () => {
      if (currentUser) {
        setIsUsernameLoading(true); // Start loading
        // Set a temporary display (email prefix) immediately while fetching
        setDisplayedUsername(currentUser.email ? currentUser.email.split('@')[0] : 'User');

        try {
          const userDocRef = doc(db, "users", currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists() && userDocSnap.data() && userDocSnap.data().username) {
            setDisplayedUsername(userDocSnap.data().username);
            console.log("Fetched username from Firestore:", userDocSnap.data().username);
          } else {
            console.warn("No 'username' field found in Firestore for UID:", currentUser.uid, ". Displaying email prefix.");
            // If doc doesn't exist or username field is missing, fallback already set.
          }
        } catch (error) {
          console.error("Error fetching username from Firestore:", error);
          // If there's an error during fetch, keep the email prefix fallback.
        } finally {
          setIsUsernameLoading(false); // End loading regardless of success/failure
        }
      } else {
        setDisplayedUsername(''); // Clear username if no user is logged in
        setIsUsernameLoading(false); // No user, so not loading username
      }
    };

    if (!loading) { // Only fetch username once overall auth state is determined
      console.log("Auth state determined, attempting to fetch username...");
      fetchUsername();
    }
  }, [currentUser, loading, db]); // Rerun when currentUser, loading, or db instance changes

  // Effect to handle clicks outside the dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  const toggleTheme = () => {
    setDarkMode(prevMode => !prevMode);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(prev => !prev);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
      setIsDropdownOpen(false);
      setDisplayedUsername('');
      console.log("User logged out successfully.");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <div className={`app ${darkMode ? 'dark' : ''}`}>
      <header className="header">
        <div className="nav-left">
          <Link to="/" className="logo">Ascendia</Link>
          <div className="nav-links">
            <a href="#about">About</a>
            <a href="#features">Features</a>
            <a href="#contact">Contact</a>
          </div>
        </div>
        <div className="nav-right">
          <div className="nav-buttons">
            {/* Conditional rendering based on authentication and username loading status */}
            {loading || isUsernameLoading ? (
              <span className="welcome-message loading-pulse">Loading...</span> // Show loading state for auth or username fetch
            ) : currentUser ? (
              <div className="user-profile-widget" ref={dropdownRef}>
                <div className="user-info-trigger" onClick={toggleDropdown}>
                  <div className="avatar-circle">
                    {displayedUsername ? displayedUsername.charAt(0).toUpperCase() : (currentUser.email ? currentUser.email.charAt(0).toUpperCase() : '?')}
                  </div>
                  <span className="welcome-message">Hello, {displayedUsername || (currentUser.email ? currentUser.email.split('@')[0] : 'User')}!</span>
                  <span className={`dropdown-arrow ${isDropdownOpen ? 'open' : ''}`}>&#9660;</span>
                </div>
                {isDropdownOpen && (
                  <div className="dropdown-menu">
                    <Link to="/user-settings" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                      <span className="icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-settings">
                          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.78 1.28a2 2 0 0 0 .73 2.73l.04.04a2 2 0 0 1 0 2.83l-.04.04a2 2 0 0 0-.73 2.73l.78 1.28a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l-.78-1.28a2 2 0 0 0-.73-2.73l-.04-.04a2 2 0 0 1 0-2.83l.04-.04a2 2 0 0 0 .73-2.73l-.78-1.28a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>
                        </svg>
                      </span>
                      User Settings
                    </Link>
                    <button onClick={handleLogout} className="dropdown-item">
                      <span className="icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-log-out">
                          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="17 16 22 12 17 8"/><line x1="22" x2="11" y1="12" y2="12"/>
                        </svg>
                      </span>
                      Log Out
                    </button>
                    <Link to="/dashboard" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                      <span className="icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-layout-dashboard">
                                <rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/>
                            </svg>
                        </span>
                        Dashboard
                      </Link>
                      <Link to="/help" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                        <span className="icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-help-circle">
                                <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>
                            </svg>
                        </span>
                        Help
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link to="/login" className="login-btn">Login</Link>
                  <Link to="/getting-started" className="start-btn">Get Started</Link>
                </>
              )}
            </div>
            <button className="toggle" onClick={toggleTheme} aria-label="Toggle dark mode">
              <div className="circle"></div>
            </button>
          </div>
        </header>

        {/* Main content area where different routes will render their components */}
        <div className="main-content-area">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/syllabus" element={<Syllabus />} />
            <Route path="/papers" element={<Papers />} />
            <Route path="/tracker" element={<Tracker />} />
            <Route path="/countdown" element={<Countdown />} />
            <Route path="/planner" element={<Planner />} />
            <Route path="/getting-started" element={<GettingStarted />} />
            <Route path="/login" element={<Login />} />
            <Route path="/user-settings" element={<UserSettings />} />
          </Routes>
        </div>
      </div>
  );
}

export default App;
