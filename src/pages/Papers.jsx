import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Import useAuth if this page needs authentication
import { Book } from 'lucide-react';

function Papers() {
    const { currentUser, loading } = useAuth(); // Example: Check auth status

    if (loading) {
        return <div className="page-container" style={{ justifyContent: 'center', alignItems: 'center' }}><p className="welcome-message loading-pulse">Loading...</p></div>;
    }

    if (!currentUser) {
        return (
            <div className="page-container" style={{ justifyContent: 'center', alignItems: 'center' }}>
                <h2 className="page-title">Access Denied</h2>
                <p className="page-description">Please <Link to="/login" className="inline-link">log in</Link> or <Link to="/getting-started" className="inline-link">register</Link> to view past papers.</p>
            </div>
        );
    }

    return (
        <div className="page-container">
            <h2 className="page-title"><Book size={40} className="widget-icon" /> Past Paper Vault</h2>
            <p className="page-description">
                Browse and download past papers to practice for your exams.
            </p>
            <div className="dashboard-card" style={{ maxWidth: '600px', width: '100%', padding: '2rem' }}>
                <p>This is where your past papers will be listed.</p>
                <p>You can categorize them by subject, year, and paper variant.</p>
                {/* Example of adding content later */}
                <div style={{ marginTop: '1.5rem', border: '1px dashed #ddd', padding: '1rem', borderRadius: '8px' }}>
                    <h3>Coming Soon:</h3>
                    <ul>
                        <li>Search and filter options</li>
                        <li>Downloadable PDF links</li>
                        <li>Solution guides</li>
                    </ul>
                </div>
            </div>
            <Link to="/dashboard" className="back-to-home-button">Back to Dashboard</Link>
        </div>
    );
}

export default Papers;