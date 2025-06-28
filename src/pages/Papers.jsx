// src/pages/Papers.jsx
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import '../PageStyles.css';

function Papers() {
    const { currentUser, loading } = useAuth();

    if (loading) {
        return (
            <div className="page-container papers-page" style={{ justifyContent: 'center', alignItems: 'center' }}>
                <p className="welcome-message loading-pulse" style={{ color: '#ff4d88' }}>Loading past papers...</p>
            </div>
        );
    }

    if (!currentUser) {
        return (
            <div className="page-container papers-page" style={{ justifyContent: 'center', alignItems: 'center' }}>
                <h2 className="page-title">Access Denied</h2>
                <p className="page-description">Please log in or register to view past papers.</p>
            </div>
        );
    }

    return (
        <div className="page-container papers-page">
            <h1 className="page-title">Past Paper Vault</h1>
            <p className="page-description">Access and organize your past papers here.</p>
            <div className="dashboard-card" style={{ padding: '20px', textAlign: 'center' }}>
                <h3>Coming Soon!</h3>
                <p>This section will allow you to browse and manage categorized past papers.</p>
            </div>
        </div>
    );
}

export default Papers;
