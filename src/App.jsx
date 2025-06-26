import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useState } from 'react';
import './App.css';

// Import pages
import Home from './pages/Home';
import Syllabus from './pages/Syllabus';
import Papers from './pages/Papers';
import Tracker from './pages/Tracker';
import Countdown from './pages/Countdown';
import Planner from './pages/Planner';

function App() {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <Router>
      <div className={darkMode ? 'app dark' : 'app'}>
  <div className="main-content">
    <header className="header">
      <h1 className="logo">Ascendia</h1>

<nav className="nav">
  <a href="#about">About</a>
  <a href="#contact">Contact</a>
</nav>

<div className="nav-buttons">
  <button className="login-btn">Login</button>
  <button className="register-btn">Register</button>
  <button className="toggle" onClick={() => setDarkMode(!darkMode)}>
    <div className="circle"></div>
  </button>
</div>

    </header>

    {/* Other content like hero, features, footer goes here */}
  </div>
</div>


        <Routes>
          <Route path="/" element={
            <>
              <section className="hero">
                <h2>Your Ultimate Cambridge Companion</h2>
                <p>All-in-one toolkit for IGCSE & A-Level success — smart, simple, soft.</p>
              </section>

              <section className="features" id="about">
                <h3>What’s Inside</h3>
                <div className="feature-grid">
                  <div className="feature-card">
                    <h4>Syllabus Checklist</h4>
                    <p>Stay organized and track every topic.</p>
                  </div>
                  <div className="feature-card">
                    <h4>Past Paper Vault</h4>
                    <p>Access categorized past papers in seconds.</p>
                  </div>
                  <div className="feature-card">
                    <h4>Grade Tracker</h4>
                    <p>Visualize your grades and boost performance.</p>
                  </div>
                  <div className="feature-card">
                    <h4>Exam Countdown</h4>
                    <p>See your remaining days to prepare smartly.</p>
                  </div>
                  <div className="feature-card">
                    <h4>Study Planner</h4>
                    <p>Plan your weeks with flexible schedules.</p>
                  </div>
                </div>
              </section>
            </>
          } />
          <Route path="/syllabus" element={<Syllabus />} />
          <Route path="/papers" element={<Papers />} />
          <Route path="/tracker" element={<Tracker />} />
          <Route path="/countdown" element={<Countdown />} />
          <Route path="/planner" element={<Planner />} />
        </Routes>
<div> <footer className="footer" id="contact">
          <p>© 2025 Ascendia | Built by Ayesha</p>
        </footer>
         
         
         </div>
       </Router>
     
   
  );
}

export default App;
