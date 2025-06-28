import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Import useAuth if this page needs authentication
import { Target } from 'lucide-react';

function Planner() {
    const { currentUser, loading } = useAuth(); // Example: Check auth status

    if (loading) {
        return <div className="page-container" style={{ justifyContent: 'center', alignItems: 'center' }}><p className="welcome-message loading-pulse">Loading...</p></div>;
    }

    if (!currentUser) {
        return (
            <div className="page-container" style={{ justifyContent: 'center', alignItems: 'center' }}>
                <h2 className="page-title">Access Denied</h2>
                <p className="page-description">Please <Link to="/login" className="inline-link">log in</Link> or <Link to="/getting-started" className="inline-link">register</Link> to use the study planner.</p>
            </div>
        );
    }

    return (
        <div className="page-container">
            <h2 className="page-title"><Target size={40} className="widget-icon" /> Study Planner</h2>
            <p className="page-description">
                Plan your study sessions and track your academic goals.
            </p>
            <div className="dashboard-card" style={{ maxWidth: '600px', width: '100%', padding: '2rem' }}>
                <p>This section will help you schedule your study time effectively.</p>
                <p>Features might include a calendar, task lists, and progress tracking for your study plan.</p>
                {/* Example of adding content later */}
                <div style={{ marginTop: '1.5rem', border: '1px dashed #ddd', padding: '1rem', borderRadius: '8px' }}>
                    <h3>Coming Soon:</h3>
                    <ul>
                        <li>Interactive Calendar</li>
                        <li>Customizable Study Schedules</li>
                        <li>Goal Setting & Progress Monitoring</li>
                    </ul>
                </div>
            </div>
            <Link to="/dashboard" className="back-to-home-button">Back to Dashboard</Link>
        </div>
    );
}

export default Planner;