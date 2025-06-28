// src/pages/GettingStarted.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../PageStyles.css'; // For general page styling

function GettingStarted() {
    const { currentUser } = useAuth();

    return (
        <div className="page-container hero-page">
            <section className="hero">
                <h1 className="page-title">Welcome to Ascendia</h1>
                <p className="page-description">Your Ultimate Cambridge Companion.<br/>All-in-one toolkit for IGCSE & A-Level success.</p>
                <div className="hero-actions">
                    {!currentUser ? (
                        <>
                            <Link to="/register" className="cta primary-gradient">Start Your Journey Now</Link>
                            <Link to="/login" className="cta secondary-btn">Already have an account?</Link>
                        </>
                    ) : (
                        <Link to="/dashboard" className="cta primary-gradient">Go to Dashboard</Link>
                    )}
                </div>
            </section>

            <section className="features-section">
                <h2 className="section-heading">Key Features</h2>
                <div className="feature-grid">
                    <div className="feature-card dashboard-card">
                        <span className="feature-card-icon">📋</span>
                        <h4>Syllabus Checklist</h4>
                        <p>Stay organized and track every topic.</p>
                    </div>
                    <div className="feature-card dashboard-card">
                        <span className="feature-card-icon">📚</span>
                        <h4>Past Paper Vault</h4>
                        <p>Access categorized past papers in seconds.</p>
                    </div>
                    <div className="feature-card dashboard-card">
                        <span className="feature-card-icon">📈</span>
                        <h4>Grade Tracker</h4>
                        <p>Visualize your grades and boost performance.</p>
                    </div>
                    <div className="feature-card dashboard-card">
                        <span className="feature-card-icon">⏳</span>
                        <h4>Exam Countdown</h4>
                        <p>See your remaining days to prepare smartly.</p>
                    </div>
                    <div className="feature-card dashboard-card">
                        <span className="feature-card-icon">🗓️</span>
                        <h4>Study Planner</h4>
                        <p>Plan your weeks with flexible schedules.</p>
                    </div>
                    <div className="feature-card dashboard-card">
                        <span className="feature-card-icon">💡</span>
                        <h4>Resource Hub</h4>
                        <p>Learn and understand concepts from loads of quality resources.</p>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default GettingStarted;
