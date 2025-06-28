import React from 'react';
import { LogOut, UserCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext'; // Import useAuth to handle logout
import './UserProfileWidget.css'; // You will need to create this CSS file

function UserProfileWidget({ onClose }) {
    const { currentUser, logout } = useAuth();

    const handleLogout = async () => {
        try {
            await logout();
            onClose(); // Close the dropdown after logout
        } catch (error) {
            console.error("Failed to log out from UserProfileWidget:", error);
            // Optionally display an error message to the user
        }
    };

    return (
        <div className="user-profile-widget">
            <div className="profile-info">
                <UserCircle size={48} className="profile-avatar" />
                <p className="profile-username">{currentUser?.displayName || currentUser?.email.split('@')[0] || 'Guest'}</p>
                <p className="profile-email">{currentUser?.email || 'N/A'}</p>
            </div>
            <hr className="profile-divider" />
            <div className="profile-actions">
                {/* You might add more links here like "Edit Profile" if you have a dedicated page */}
                {/* <Link to="/profile" className="profile-action-item" onClick={onClose}>
                    <User size={20} /> Edit Profile
                </Link> */}
                <button onClick={handleLogout} className="profile-action-item logout-button">
                    <LogOut size={20} /> Logout
                </button>
            </div>
        </div>
    );
}

export default UserProfileWidget;