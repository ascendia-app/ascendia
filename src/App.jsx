import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import './App.css';
import { useAuth } from './contexts/AuthContext';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { Bell, AlertCircle, Calendar, Award } from 'lucide-react'; // Import Bell icon and others for dummy notifications

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
import Dashboard from './pages/Dashboard';
import Notifications from './pages/Notifications';


function App() {
  const { currentUser, loading } = useAuth();
  const [displayedUsername, setDisplayedUsername] = useState('');
  const [isUsernameLoading, setIsUsernameLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('dark-mode');
    return savedTheme === 'true' ? true : false;
  });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // State for user profile dropdown
  const dropdownRef = useRef(null); // Ref for user profile dropdown

  const [isNotificationsDropdownOpen, setIsNotificationsDropdownOpen] = useState(false); // State for notifications dropdown
  const notificationsDropdownRef = useRef(null); // Ref for notifications dropdown

  const navigate = useNavigate();

  // DEBUG: Log current user and loading state
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

  // Effect to fetch username when currentUser changes
  useEffect(() => {
    const fetchUsername = async () => {
      if (currentUser) {
        setIsUsernameLoading(true);
        // Fallback to email prefix initially
        setDisplayedUsername(currentUser.email ? currentUser.email.split('@')[0] : 'User');

        try {
          const userDocRef = doc(db, "users", currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists() && userDocSnap.data() && userDocSnap.data().username) {
            setDisplayedUsername(userDocSnap.data().username);
            console.log("Fetched username from Firestore:", userDocSnap.data().username);
          } else {
            console.warn("No 'username' field found in Firestore for UID:", currentUser.uid, ". Displaying email prefix.");
          }
        } catch (error) {
          console.error("Error fetching username from Firestore:", error);
        } finally {
          setIsUsernameLoading(false);
        }
      } else {
        setDisplayedUsername('');
        setIsUsernameLoading(false);
      }
    };

    if (!loading) {
      console.log("Auth state determined, attempting to fetch username...");
      fetchUsername();
    }
  }, [currentUser, loading, db]);

  // Effect to handle clicks outside dropdowns
  useEffect(() => {
    function handleClickOutsideElements(event) {
        const isClickOnUserProfileWidget = dropdownRef.current && dropdownRef.current.contains(event.target);
        const isClickOnNotificationsDropdown = notificationsDropdownRef.current && notificationsDropdownRef.current.contains(event.target);
        const isClickOnBellIconTrigger = event.target.closest('.bell-icon-link');
        const isClickOnUserProfileTrigger = event.target.closest('.user-info-trigger');

        // Close user dropdown if click is outside it AND not on its trigger
        if (!isClickOnUserProfileWidget && !isClickOnUserProfileTrigger) {
            setIsDropdownOpen(false);
        }

        // Close notifications dropdown if click is outside it AND not on its trigger
        if (!isClickOnNotificationsDropdown && !isClickOnBellIconTrigger) {
            setIsNotificationsDropdownOpen(false);
        }
    }
    document.addEventListener("mousedown", handleClickOutsideElements);
    return () => {
        document.removeEventListener("mousedown", handleClickOutsideElements);
    };
}, [dropdownRef, notificationsDropdownRef]); // Depend on refs

  const toggleTheme = () => {
    setDarkMode(prevMode => !prevMode);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(prev => !prev);
    setIsNotificationsDropdownOpen(false); // Close notifications dropdown if opening user dropdown
  };

  const toggleNotificationsDropdown = () => {
    setIsNotificationsDropdownOpen(prev => !prev);
    setIsDropdownOpen(false); // Close user dropdown if opening notifications dropdown
  };


  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
      setIsDropdownOpen(false);
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
            {loading || isUsernameLoading ? (
              <span className="welcome-message loading-pulse">Loading...</span>
            ) : currentUser ? (
              // Explicit div wrapper for authenticated user elements
              <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}> {/* Added position: 'relative' for dropdown context */}
                <div className="user-profile-widget" ref={dropdownRef}>
                  <div className="user-info-trigger" onClick={toggleDropdown}>
                    <div className="avatar-circle">
                      {displayedUsername ? displayedUsername.charAt(0).toUpperCase() : (currentUser && currentUser.email ? currentUser.email.charAt(0).toUpperCase() : '?')}
                    </div>
                    <span className="welcome-message">Hello, {displayedUsername || (currentUser.email ? currentUser.email.split('@')[0] : 'User')}!</span>
                    <span className={`dropdown-arrow ${isDropdownOpen ? 'open' : ''}`}>&#9660;</span>
                  </div>
                  {isDropdownOpen && (
                    <div className="dropdown-menu">
                      <Link to="/dashboard" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                        <span className="icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-layout-dashboard">
                                <rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/>
                            </svg>
                        </span>
                        Dashboard
                      </Link>
                      <Link to="/user-settings" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                        <span className="icon">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-settings">
                            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.78 1.28a2 2 0 0 0 .73 2.73l.04.04a2 2 0 0 1 0 2.83l-.04.04a2 2 0 0 0-.73 2.73l.78 1.28a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.78-1.28a2 2 0 0 0-.73-2.73l-.04-.04a2 2 0 0 1 0-2.83l.04-.04a2 2 0 0 0 .73-2.73l-.78-1.28a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>
                        </svg>
                      </span>
                      User Settings
                    </Link>
                    <Link to="/help" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                      <span className="icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-help-circle">
                                <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>
                            </svg>
                        </span>
                        Help
                      </Link>
                    <button onClick={handleLogout} className="dropdown-item logout-btn">
                      <span className="icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-log-out">
                          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="17 16 22 12 17 8"/><line x1="22" x2="11" y1="12" y2="12"/>
                        </svg>
                      </span>
                      Log Out
                    </button>
                  </div>
                  )}</div>
                {/* NEW: Bell icon for notifications, visible when logged in */}
                <div className="bell-icon-link" onClick={toggleNotificationsDropdown} aria-label="Notifications" role="button" tabIndex="0">
                    <Bell size={24} className="nav-bell-icon" />
                </div>
                {isNotificationsDropdownOpen && (
                    <div className="notifications-dropdown-container" ref={notificationsDropdownRef}>
                        <h4>Notifications</h4>
                        {/* Dummy Notifications - Replace with real data later */}
                        <div className="notification-item">
                            <AlertCircle className="icon" />
                            <p className="message">Your **Syllabus for Calculus I** has been updated with new topics!</p>
                            <span className="timestamp">5 min ago</span>
                        </div>
                        <div className="notification-item">
                            <Calendar className="icon" />
                            <p className="message">Reminder: **Chemistry Midterm** is in 3 days.</p>
                            <span className="timestamp">1 hour ago</span>
                        </div>
                        <div className="notification-item">
                            <Award className="icon" />
                            <p className="message">You have **mastered 5 new topics** this week. Keep up the great work!</p>
                            <span className="timestamp">Yesterday</span>
                        </div>
                        {/* You can add a condition here to show "No new notifications" if there are none */}
                        {/* {notifications.length === 0 && (
                            <div className="no-notifications-message">No new notifications.</div>
                        )} */}
                        <Link to="/notifications" className="see-all-notifications-link" onClick={() => setIsNotificationsDropdownOpen(false)}>
                            See all notifications
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
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/syllabus" element={<Syllabus />} />
            <Route path="/papers" element={<Papers />} />
            <Route path="/tracker" element={<Tracker />} />
            <Route path="/countdown" element={<Countdown />} />
            <Route path="/planner" element={<Planner />} />
            <Route path="/getting-started" element={<GettingStarted />} />
            <Route path="/login" element={<Login />} />
            <Route path="/user-settings" element={<UserSettings />} />
            <Route path="/notifications" element={<Notifications />} />
          </Routes>
        </div>
      </div>
  );
}

export default App;
