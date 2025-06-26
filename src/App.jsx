import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';

// Import pages
import Home from './pages/Home';
import Syllabus from './pages/Syllabus';
import Papers from './pages/Papers'; // Ensure Papers component is properly imported and defined
import Tracker from './pages/Tracker';
import Countdown from './pages/Countdown';
import Planner from './pages/Planner';
import GettingStarted from './pages/GettingStarted';
import Login from './pages/Login';
import Download from './pages/Download';


function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('dark-mode');
    return savedTheme === 'true' ? true : false;
  });

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

  const toggleTheme = () => {
    setDarkMode(prevMode => !prevMode);
  };

  return (
    <Router>
      <div className={`app ${darkMode ? 'dark' : ''}`}>
        {/* Header / Navigation Bar - Renders on all pages */}
        <header className="header">
          <div className="nav-left">
            <Link to="/" className="logo">Ascendia</Link>
            <div className="nav-links">
              <a href="#about">About</a> {/* These are anchor links, not router links */}
              <a href="#features">Features</a> {/* These are anchor links, not router links */}
              <a href="#contact">Contact</a> {/* These are anchor links, not router links */}
            </div>
          </div>
          <div className="nav-right">
            <div className="nav-buttons">
              {/* These are React Router Links for navigation */}
              <Link to="/login" className="login-btn">Login</Link>
              <Link to="/getting-started" className="start-btn">Get Started</Link>
            </div>
            <button className="toggle" onClick={toggleTheme} aria-label="Toggle dark mode">
              <div className="circle"></div>
            </button>
          </div>
        </header>

        {/* Main content area where different routes will render their components */}
        <div className="main-content-area">
          <Routes>
            {/* The root path "/" now renders the Home component */}
            <Route path="/" element={<Home />} />

            {/* Routes for other main sections/tools */}
            <Route path="/syllabus" element={<Syllabus />} />
            <Route path="/papers" element={<Papers />} /> {/* CORRECTED: Now renders Papers component */}
            <Route path="/tracker" element={<Tracker />} />
            <Route path="/countdown" element={<Countdown />} />
            <Route path="/planner" element={<Planner />} />

            {/* ROUTES FOR GETTING STARTED FLOW */}
            <Route path="/getting-started" element={<GettingStarted />} />
            <Route path="/login" element={<Login />} />
            <Route path="/download" element={<Download />} />

          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
