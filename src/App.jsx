import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';

// Import pages
import Syllabus from './pages/Syllabus';
import Papers from './pages/Papers';
import Tracker from './pages/Tracker';
import Countdown from './pages/Countdown';
import Planner from './pages/Planner';
import GettingStarted from './pages/GettingStarted'; // This now includes registration
import Register from './pages/Register'; // Keeping for potential future dedicated register, but GettingStarted is primary
import Login from './pages/Login';
import Download from './pages/Download';


function App() {
  // State to manage dark mode.
  // Initializes to true if 'dark-mode' is found in localStorage, otherwise false.
  // Dark mode visual effects are currently removed from CSS, but the toggle logic remains.
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('dark-mode');
    return savedTheme === 'true' ? true : false;
  });

  // useEffect to update the 'dark' class on the document root and save preference to localStorage
  useEffect(() => {
    const root = document.documentElement;
    const appElement = document.querySelector('.app');

    if (darkMode) {
      root.classList.add('dark');
      document.body.classList.add('dark');
      if (appElement) appElement.classList.add('dark'); // Apply to .app container
    } else {
      root.classList.remove('dark');
      document.body.classList.remove('dark');
      if (appElement) appElement.classList.remove('dark');
    }

    localStorage.setItem('dark-mode', darkMode);
  }, [darkMode]); // Re-run effect whenever darkMode state changes

  // Function to toggle the dark mode state
  const toggleTheme = () => {
    setDarkMode(prevMode => !prevMode);
  };

  return (
    <Router>
      {/* The main application container. The 'dark' class will be applied here for theme switching. */}
      <div className={`app ${darkMode ? 'dark' : ''}`}>
        {/* Header / Navigation Bar - Renders on all pages */}
        <header className="header">
          <div className="nav-left">
            {/* Using Link for Ascendia logo to go to home */}
            <Link to="/" className="logo">Ascendia</Link>
            <div className="nav-links">
              {/* Using <a> for anchor links within the homepage */}
              <a href="#about">About</a>
              <a href="#features">Features</a>
              <a href="#contact">Contact</a>
            </div>
          </div>
          <div className="nav-right">
            <div className="nav-buttons">
              {/* Login button points directly to login page */}
              <Link to="/login" className="login-btn">Login</Link>
              {/* 'Get Started' button points to the Getting Started page (which now has registration) */}
              <Link to="/getting-started" className="start-btn">Get Started</Link>
            </div>
            {/* Dark Mode Toggle Button */}
            <button className="toggle" onClick={toggleTheme} aria-label="Toggle dark mode">
              <div className="circle"></div>
            </button>
          </div>
        </header>

        {/* This div wraps the main content that appears on various routes */}
        <div className="main-content-area"> {/* Renamed wrapper for clarity */}
          <Routes>
            {/* The root path "/" will render the homepage content */}
            <Route path="/" element={
              <>
                {/* Hero Section - Large Ascendia Name and Description */}
                <section className="hero">
                  <h1>Ascendia</h1> {/* Large Ascendia Name */}
                  <p>
                    Your Ultimate Cambridge Companion<br />
                    All-in-one toolkit for IGCSE & A-Level success
                  </p>
                  {/* 'Start Your Journey Now' button points to the Getting Started page (which now has registration) */}
                  <Link to="/getting-started" className="cta">Start Your Journey Now</Link>
                </section>

                {/* Features Section */}
                <section className="features" id="features"> {/* Added id for features anchor link */}
                  <h2>Key Features</h2>
                  <div className="feature-grid">
                    {/* Feature Card 1: Syllabus Checklist */}
                    <div className="feature-card">
                      <span className="feature-card-icon">📋</span> {/* Emoji Icon */}
                      <h4>Syllabus Checklist</h4>
                      <p>Stay organized and track every topic.</p>
                    </div>
                    {/* Feature Card 2: Past Paper Vault */}
                    <div className="feature-card">
                      <span className="feature-card-icon">📚</span> {/* Emoji Icon */}
                      <h4>Past Paper Vault</h4>
                      <p>Access categorized past papers in seconds.</p>
                    </div>
                    {/* Feature Card 3: Grade Tracker */}
                    <div className="feature-card">
                      <span className="feature-card-icon">📈</span> {/* Emoji Icon */}
                      <h4>Grade Tracker</h4>
                      <p>Visualize your grades and boost performance.</p>
                    </div>
                    {/* Feature Card 4: Exam Countdown */}
                    <div className="feature-card">
                      <span className="feature-card-icon">⏳</span> {/* Emoji Icon */}
                      <h4>Exam Countdown</h4>
                      <p>See your remaining days to prepare smartly.</p>
                    </div>
                    {/* New Feature Card: Study Planner */}
                    <div className="feature-card">
                      <span className="feature-card-icon">🗓️</span> {/* Emoji Icon */}
                      <h4>Study Planner</h4>
                      <p>Plan your weeks with flexible schedules.</p>
                    </div>
                    {/* NEW FEATURE CARD: Resource Hub */}
                    <div className="feature-card">
                      <span className="feature-card-icon">💡</span> {/* Emoji Icon */}
                      <h4>Resource Hub</h4>
                      <p>Learn and understand concepts from loads of quality resources.</p>
                    </div>
                  </div>
                </section>

                {/* Footer */}
                <footer className="footer" id="contact"> {/* Added id for contact anchor link */}
                  <p>&copy; 2025 Ascendia | Built by Ayesha</p>
                </footer>
              </>
            } />

            {/* Routes for other main sections/tools */}
            <Route path="/syllabus" element={<Syllabus />} />
            <Route path="/papers" element={<Papers />} />
            <Route path="/tracker" element={<Tracker />} />
            <Route path="/countdown" element={<Countdown />} />
            <Route path="/planner" element={<Planner />} />

            {/* ROUTES FOR GETTING STARTED FLOW */}
            <Route path="/getting-started" element={<GettingStarted />} />
            {/* Keeping /register route, but GettingStarted is now the primary place for it */}
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/download" element={<Download />} />

          </Routes>
        </div> {/* End main-content-area */}
      </div>
    </Router>
  );
}

export default App;
