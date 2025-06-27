import React from 'react';
import { Link } from 'react-router-dom';
import './PageStyles.css'; // Assuming common styles

function Dashboard() {
  return (
    <div className="page-container dashboard-page">
      <h2 className="page-title">Welcome to Your Dashboard!</h2>
      <p className="page-description">This is where you'll find all your personalized tools and information.</p>
      <div className="dashboard-options">
        {/* Example links to other tools */}
        <Link to="/syllabus" className="gs-button primary">Syllabus Checklist</Link>
        <Link to="/papers" className="gs-button secondary">Past Papers</Link>
        <Link to="/tracker" className="gs-button primary">Grade Tracker</Link>
        {/* Add more links to other tools here */}
      </div>
      <Link to="/" className="back-to-home-button">← Back to Homepage</Link>
    </div>
  );
}

export default Dashboard;
