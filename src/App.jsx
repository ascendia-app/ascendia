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

export default App;
