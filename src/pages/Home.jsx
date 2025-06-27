import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Assuming AuthContext is in ../contexts

function Home() {
  const { currentUser, loading } = useAuth();
  const navigate = useNavigate();

  // Effect to redirect if user is logged in and auth state is resolved
  useEffect(() => {
    if (!loading && currentUser) {
      console.log("User logged in, redirecting to Dashboard...");
      navigate('/dashboard'); // Redirect to dashboard
    }
  }, [currentUser, loading, navigate]); // Depend on currentUser and loading state

  // If still loading or user is logged in (and will be redirected soon),
  // you might render a small loading spinner or nothing at all for a moment.
  if (loading || currentUser) {
    return (
      <div className="page-container" style={{ minHeight: 'calc(100vh - 80px)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <p className="welcome-message loading-pulse" style={{ color: '#ff4d88' }}>Loading...</p>
      </div>
    );
  }

  // Otherwise, render the standard homepage content for logged-out users
  return (
    <>
      {/* Hero Section - Large Ascendia Name and Description */}
      <section className="hero">
        <h1>Ascendia</h1> {/* Large Ascendia Name */}
        <p>
          Your Ultimate Cambridge Companion<br />
          All-in-one toolkit for IGCSE & A-Level success
        </p>
        {/* 'Start Your Journey Now' button - only visible if not logged in */}
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
  );
}

export default Home;
