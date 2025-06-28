// src/pages/Planner.jsx
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import '../PageStyles.css';

function Planner() {
    const { currentUser, loading } = useAuth();

    if (loading) {
        return (
            <div className="page-container planner-page" style={{ justifyContent: 'center', alignItems: 'center' }}>
                <p className="welcome-message loading-pulse" style={{ color: '#ff4d88' }}>Loading planner...</p>
            </div>
        );
    }

    if (!currentUser) {
        return (
            <div className="page-container planner-page" style={{ justifyContent: 'center', alignItems: 'center' }}>
                <h2 className="page-title">Access Denied</h2>
                <p className="page-description">Please log in or register to view your planner.</p>
            </div>
        );
    }

    return (
        <div className="page-container planner-page">
            <h1 className="page-title">Study Planner</h1>
            <p className="page-description">Organize your study schedule efficiently.</p>
            <div className="dashboard-card" style={{ padding: '20px', textAlign: 'center' }}>
                <h3>Coming Soon!</h3>
                <p>This section will help you plan your study weeks and manage tasks.</p>
            </div>
        </div>
    );
}

export default Planner;
