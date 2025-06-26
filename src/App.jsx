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
        <header className="header">
          <h1>Ascendia</h1>
          <nav className="nav">
            <Link to="/">Home</Link>
            <Link to="/syllabus">Syllabus</Link>
            <Link to="/papers">Past Papers</Link>
            <Link to="/tracker">Mark Tracker</Link>
            <Link to="/countdown">Countdown</Link>
            <Link to="/planner">Planner</Link>
          </nav>
          <button
            className="toggle"
            onClick={() => setDarkMode(!darkMode)}
            title="Toggle Dark Mode"
          >
            <div className="circle"></div>
          </button>
        </header>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/syllabus" element={<Syllabus />} />
          <Route path="/papers" element={<Papers />} />
          <Route path="/tracker" element={<Tracker />} />
          <Route path="/countdown" element={<Countdown />} />
          <Route path="/planner" element={<Planner />} />
        </Routes>

        <footer className="footer">
          © 2025 Ascendia
        </footer>
      </div>
    </Router>
  );
}

export default App;
