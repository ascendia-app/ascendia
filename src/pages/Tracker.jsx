import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Import useAuth if this page needs authentication
import { Gauge } from 'lucide-react';

function Tracker() {
    const { currentUser, loading } = useAuth(); // Example: Check auth status

    if (loading) {
        return <div className="page-container" style={{ justifyContent: 'center', alignItems: 'center' }}><p className="welcome-message loading-pulse">Loading...</p></div>;
    }

    if (!currentUser) {
        return (
            <div className="page-container" style={{ justifyContent: 'center', alignItems: 'center' }}>
                <h2 className="page-title">Access Denied</h2>
                <p className="page-description">Please <Link to="/login" className="inline-link">log in</Link> or <Link to="/getting-started" className="inline-link">register</Link> to use the grade tracker.</p>
            </div>
        );
    }

    return (
        <div className="page-container">
            <h2 className="page-title"><Gauge size={40} className="widget-icon" /> Grade Tracker</h2>
            <p className="page-description">
                Keep track of your grades and academic performance.
            </p>
            <div className="dashboard-card" style={{ maxWidth: '600px', width: '100%', padding: '2rem' }}>
                <p>Input your scores for assignments, quizzes, and exams here.</p>
                <p>The tracker will calculate your overall grades and help you visualize your performance over time.</p>
                {/* Example of adding content later */}
                <div style={{ marginTop: '1.5rem', border: '1px dashed #ddd', padding: '1rem', borderRadius: '8px' }}>
                    <h3>Coming Soon:</h3>
                    <ul>
                        <li>Grade Calculation for Subjects</li>
                        <li>Performance Analytics & Charts</li>
                        <li>Goal Setting for Grades</li>
                    </ul>
                </div>
            </div>
            <Link to="/dashboard" className="back-to-home-button">Back to Dashboard</Link>
        </div>
    );
}

export default Tracker;