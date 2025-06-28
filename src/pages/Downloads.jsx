import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
// Changed 'Windows' to 'Monitor' and 'Apple' to 'Laptop' for broader compatibility
import { Download, Monitor, Laptop } from 'lucide-react';

function Downloads() {
    const { currentUser, loading } = useAuth(); // Example: Check auth status

    if (loading) {
        return <div className="page-container" style={{ justifyContent: 'center', alignItems: 'center' }}><p className="welcome-message loading-pulse">Loading...</p></div>;
    }

    if (!currentUser) {
        return (
            <div className="page-container" style={{ justifyContent: 'center', alignItems: 'center' }}>
                <h2 className="page-title">Access Denied</h2>
                <p className="page-description">Please <Link to="/login" className="inline-link">log in</Link> or <Link to="/getting-started" className="inline-link">register</Link> to view download options.</p>
            </div>
        );
    }

    return (
        <div className="page-container">
            <h2 className="page-title"><Download size={40} className="widget-icon" /> Downloads</h2>
            <p className="page-description">
                Download desktop applications, resources, or export your data.
            </p>
            <div className="dashboard-card download-section" style={{ maxWidth: '600px', width: '100%', padding: '2rem' }}>
                <h3 className="section-title">Desktop App Downloads:</h3>
                <div className="download-buttons">
                    <a href="#" className="gs-button download-windows">
                        <Monitor size={24} className="icon" /> Download for Windows
                    </a>
                    <a href="#" className="gs-button download-macos">
                        <Laptop size={24} className="icon" /> Download for macOS
                    </a>
                </div>

                <h3 className="section-title" style={{ marginTop: '2rem' }}>Data Export:</h3>
                <div className="download-links-detailed">
                    <a href="#" className="download-link-detailed">
                        <Download size={20} className="icon" /> Export Syllabus Progress (CSV)
                    </a>
                    <a href="#" className="download-link-detailed">
                        <Download size={20} className="icon" /> Export Exam Schedule (PDF)
                    </a>
                </div>
            </div>
            <Link to="/dashboard" className="back-to-home-button">Back to Dashboard</Link>
        </div>
    );
}

export default Downloads;
