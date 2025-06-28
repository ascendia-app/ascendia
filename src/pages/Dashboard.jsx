// src/pages/Dashboard.jsx
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import '../PageStyles.css'; // For general page styling, including .dashboard-card and .dashboard-grid-container

function Dashboard() {
    const { currentUser, loading } = useAuth();

    // Define the features for the dashboard cards
    const features = [
        { emoji: '⏳', name: 'Exam Countdown', description: 'Stay on track with upcoming exam dates.' },
        { emoji: '📋', name: 'Syllabus Checklist', description: 'Track your progress through every topic.' },
        { emoji: '📚', name: 'Past Paper Vault', description: 'Access categorized past papers and mark schemes.' },
        { emoji: '🗓️', name: 'Study Planner', description: 'Organize your study schedule efficiently.' },
        { emoji: '📈', name: 'Progress Tracker', description: 'Visualize your grades and academic growth.' },
        { emoji: '💡', name: 'Resource Hub', description: 'Discover curated resources for deeper learning.' },
    ];

    if (loading) {
        return (
            <div className="page-container dashboard-page" style={{ justifyContent: 'center', alignItems: 'center' }}>
                <p className="welcome-message loading-pulse" style={{ color: '#ff4d88' }}>Loading dashboard...</p>
            </div>
        );
    }

    if (!currentUser) {
        return (
            <div className="page-container dashboard-page" style={{ justifyContent: 'center', alignItems: 'center' }}>
                <h2 className="page-title">Access Denied</h2>
                <p className="page-description">Please <Link to="/login" className="inline-link">log in</Link> or <Link to="/getting-started" className="inline-link">register</Link> to view your dashboard.</p>
            </div>
        );
    }

    return (
        <div className="page-container dashboard-page">
            <h1 className="page-title">Dashboard</h1>
            <p className="page-description">Welcome back, {currentUser.email.split('@')[0]}! Here are your main tools:</p>

            <div className="dashboard-content-area"> {/* New container to center the grid */}
                <div className="dashboard-grid-container">
                    {features.map((feature, index) => (
                        <div key={index} className="dashboard-card feature-card"> {/* Reusing dashboard-card class */}
                            <span className="feature-card-emoji">{feature.emoji}</span>
                            <h3 className="feature-card-name">{feature.name}</h3>
                            <p className="feature-card-description">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
