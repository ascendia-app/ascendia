// src/components/PageNotFound.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import '../PageStyles.css'; // For basic page container styling

const PageNotFound = () => {
    return (
        <div className="page-container" style={{ textAlign: 'center', padding: '50px' }}>
            <h1 className="page-title">404 - Page Not Found</h1>
            <p className="page-description">Oops! The page you're looking for doesn't exist.</p>
            <Link to="/" className="cta" style={{ marginTop: '20px', display: 'inline-block' }}>
                Go to Homepage
            </Link>
        </div>
    );
};

export default PageNotFound;
