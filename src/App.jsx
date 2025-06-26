import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
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
  const { currentUser, loading } = useAuth(); // Get currentUser and loading state from AuthContext
  const [displayedUsername, setDisplayedUsername] = useState(''); // State to store the fetched username
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('dark-mode');
    return savedTheme === 'true' ? true : false;
  });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // State for dropdown visibility
  const dropdownRef = useRef(null); // Ref for dropdown to detect outside clicks

  const navigate = useNavigate();

  // DEBUG: Log current user and loading state
  useEffect(() => {
    console.log("AuthContext: currentUser =", currentUser);
    console.log("AuthContext: loading =", loading);
    console.log("App.jsx: displayedUsername =", displayedUsername); // Also log username state
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
        // Fallback directly to email prefix initially to ensure something shows quickly
        setDisplayedUsername(currentUser.email ? currentUser.email.split('@')[0] : 'User');
        try {
          const userDocRef = doc(db, "users", currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            setDisplayedUsername(userDocSnap.data().username);
            console.log("Fetched username from Firestore:", userDocSnap.data().username); // DEBUG
          } else {
            console.warn("No user profile found in Firestore for UID:", currentUser.uid, ". Falling back to email prefix."); // DEBUG
            // If user doc doesn't exist, already set fallback to email prefix
          }
        } catch (error) {
          console.error("Error fetching username from Firestore:", error); // DEBUG
          setDisplayedUsername(currentUser.email ? currentUser.email.split('@')[0] : 'User'); // Fallback on error
        }
      } else {
        setDisplayedUsername(''); // Clear username if no user is logged in
      }
    };

    if (!loading) { // Only fetch username once auth state is determined
      console.log("Auth state determined, attempting to fetch username..."); // DEBUG
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
    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on cleanup
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
      navigate('/login'); // Redirect to login page after logout
      setIsDropdownOpen(false); // Close dropdown on logout
      setDisplayedUsername(''); // Clear displayed username immediately
      console.log("User logged out successfully."); // DEBUG
    } catch (error) {
      console.error("Error logging out:", error); // DEBUG
    }
  };

  return (
    <Router>
      <div className={`app ${darkMode ? 'dark' : ''}`}>
        {/* Header / Navigation Bar - Renders on all pages */}
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
              {/* Conditional rendering based on authentication status */}
              {loading ? (
                <span className="welcome-message">Loading...</span> // Show loading state
              ) : currentUser ? (
                <div className="user-profile-widget" ref={dropdownRef}>
                  <div className="user-info-trigger" onClick={toggleDropdown}>
                    <div className="avatar-circle">
                      {/* Display first letter of username, or '?' if unavailable */}
                      {displayedUsername ? displayedUsername.charAt(0).toUpperCase() : (currentUser.email ? currentUser.email.charAt(0).toUpperCase() : '?')}
                    </div>
                    {/* Ensure displayedUsername is not empty, otherwise fallback to email prefix */}
                    <span className="welcome-message">Hello, {displayedUsername || (currentUser.email ? currentUser.email.split('@')[0] : 'User')}!</span>
                    <span className={`dropdown-arrow ${isDropdownOpen ? 'open' : ''}`}>&#9660;</span> {/* Unicode arrow */}
                  </div>
                  {isDropdownOpen && (
                    <div className="dropdown-menu">
                      <Link to="/user-settings" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                        <span className="icon">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-settings">
                            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.78 1.28a2 2 0 0 0 .73 2.73l.04.04a2 2 0 0 1 0 2.83l-.04.04a2 2 0 0 0-.73 2.73l.78 1.28a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.78-1.28a2 2 0 0 0-.73-2.73l-.04-.04a2 2 0 0 1 0-2.83l.04-.04a2 2 0 0 0 .73-2.73l-.78-1.28a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>
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
                      {/* Suggested additional items */}
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
    </Router>
  );
}

export default App;
