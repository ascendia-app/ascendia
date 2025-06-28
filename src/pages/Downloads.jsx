// src/pages/Downloads.jsx
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import '../PageStyles.css';

function Downloads() {
    const { currentUser, loading } = useAuth();

    if (loading) {
        return (
            <div className="page-container downloads-page" style={{ justifyContent: 'center', alignItems: 'center' }}>
                <p className="welcome-message loading-pulse" style={{ color: '#ff4d88' }}>Loading downloads...</p>
            </div>
        );
    }

    if (!currentUser) {
        return (
            <div className="page-container downloads-page" style={{ justifyContent: 'center', alignItems: 'center' }}>
                <h2 className="page-title">Access Denied</h2>
                <p className="page-description">Please log in or register to view downloads.</p>
            </div>
        );
    }

    return (
        <div className="page-container downloads-page">
            <h1 className="page-title">Downloads</h1>
            <p className="page-description">Manage your downloaded resources here.</p>
            <div className="dashboard-card" style={{ padding: '20px', textAlign: 'center' }}>
                <h3>Coming Soon!</h3>
                <p>This section will list all downloadable content for your studies.</p>
            </div>
        </div>
    );
}

export default Downloads;
