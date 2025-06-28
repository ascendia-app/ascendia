// src/pages/Dashboard.jsx
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import '../PageStyles.css'; // For general page styling

function Dashboard() {
    const { currentUser, loading } = useAuth();

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
            <p className="page-description">Welcome back to your dashboard!</p>
            {/* You can add more dashboard content here later */}
            <div className="dashboard-card" style={{ padding: '20px', textAlign: 'center' }}>
                <h3>Hello, {currentUser.email.split('@')[0]}!</h3>
                <p>This is your new, clean dashboard. Start exploring the navigation links!</p>
                <Link to="/syllabus" className="cta" style={{marginTop: '20px', display: 'inline-block'}}>Go to Syllabus</Link>
            </div>
        </div>
    );
}

export default Dashboard;
