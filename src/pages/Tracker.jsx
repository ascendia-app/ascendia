// src/pages/Tracker.jsx
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import '../PageStyles.css';

function Tracker() {
    const { currentUser, loading } = useAuth();

    if (loading) {
        return (
            <div className="page-container tracker-page" style={{ justifyContent: 'center', alignItems: 'center' }}>
                <p className="welcome-message loading-pulse" style={{ color: '#ff4d88' }}>Loading grade tracker...</p>
            </div>
        );
    }

    if (!currentUser) {
        return (
            <div className="page-container tracker-page" style={{ justifyContent: 'center', alignItems: 'center' }}>
                <h2 className="page-title">Access Denied</h2>
                <p className="page-description">Please log in or register to view your grade tracker.</p>
            </div>
        );
    }

    return (
        <div className="page-container tracker-page">
            <h1 className="page-title">Grade Tracker</h1>
            <p className="page-description">Visualize your academic performance and progress.</p>
            <div className="dashboard-card" style={{ padding: '20px', textAlign: 'center' }}>
                <h3>Coming Soon!</h3>
                <p>Monitor your grades and identify areas for improvement.</p>
            </div>
        </div>
    );
}

export default Tracker;
