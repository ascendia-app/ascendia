import React from 'react';
import { Link } from 'react-router-dom';
import '../PageStyles.css'; // Reusing PageStyles for consistency

function UserSettings() {
  return (
    <div className="page-container user-settings-page">
      <h2 className="page-title">User Settings</h2>
      <p className="page-description">
        Manage your account information and preferences here.
      </p>
      {/* Add actual settings forms/content here */}
      <Link to="/" className="back-to-home-button">← Back to Homepage</Link>
    </div>
  );
}

export default UserSettings;
