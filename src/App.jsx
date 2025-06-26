import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Link } from 'react-router-dom';

// Import your pages
import Home from './pages/Home';
import Syllabus from './pages/Syllabus';
import Papers from './pages/Papers';
import Tracker from './pages/Tracker';
import Countdown from './pages/Countdown';
import Planner from './pages/Planner';

function App() {
  return (
    <Router>

       <nav style={{ padding: '1rem', background: '#fef3f3' }}>
        <ul style={{ display: 'flex', gap: '1rem', listStyle: 'none' }}>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/syllabus">Syllabus</Link></li>
          <li><Link to="/papers">Past Papers</Link></li>
          <li><Link to="/tracker">Mark Tracker</Link></li>
          <li><Link to="/countdown">Countdown</Link></li>
          <li><Link to="/planner">Study Planner</Link></li>
        </ul>
      </nav>

      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/syllabus" element={<Syllabus />} />
        <Route path="/papers" element={<Papers />} />
        <Route path="/tracker" element={<Tracker />} />
        <Route path="/countdown" element={<Countdown />} />
        <Route path="/planner" element={<Planner />} />
      </Routes>
    </Router>
  );
}

import './App.css';
import { useState } from 'react';

function App() {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className={darkMode ? 'app dark' : 'app'}>
      <header className="header">
        <h1>Ascendia</h1>
        <nav className="nav">
          <a href="#">Home</a>
          <a href="#">Syllabus</a>
          <a href="#">Past Papers</a>
          <a href="#">Mark Tracker</a>
          <a href="#">Countdown</a>
          <a href="#">Planner</a>
        </nav>
        <button
          className="toggle"
          onClick={() => setDarkMode(!darkMode)}
          title="Toggle Dark Mode"
        >
          <div className="circle"></div>
        </button>
      </header>

      <section className="hero">
        <h2>Your Ultimate Cambridge Companion</h2>
        <p>All-in-one toolkit for IGCSE & A-Level success — smart, simple, soft.</p>
        <button className="cta">Get Started</button>
      </section>

      <section className="features">
        <h3>What’s Inside</h3>
        <div className="feature-grid">
          <div className="feature">✅ Syllabus Checklist</div>
          <div className="feature">📄 Past Paper Vault</div>
          <div className="feature">📊 Mark Tracker</div>
          <div className="feature">⏳ Exam Countdown</div>
          <div className="feature">🗓️ Study Planner</div>
        </div>
      </section>

      <footer className="footer">
        © 2025 Ascendia
      </footer>
    </div>
  );
}

export default App;
