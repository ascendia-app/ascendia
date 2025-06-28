// src/components/UserProfileWidget.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { LayoutDashboard, User, Settings, HelpCircle, LogOut } from 'lucide-react';
// import './UserProfileWidget.css'; // This CSS is already integrated into Header.css

// This component is now largely redundant as its logic and rendering are integrated into Header.jsx
// It's kept as a placeholder to satisfy the import in App.jsx and for clarity of structure.
// In a real application, you might abstract this into a true reusable component if it were used elsewhere.

const UserProfileWidget = ({ onClose }) => {
    // This component's direct usage is now minimal, as Header handles most of it.
    // It exists to satisfy the import in App.jsx and can be expanded if needed.
    return (
        <div className="dropdown-menu"> {/* Reusing dropdown-menu style from Header.css */}
            <Link to="/dashboard" className="dropdown-item" onClick={onClose}>
                <span className="icon"><LayoutDashboard size={20} /></span>Dashboard
            </Link>
            <Link to="/profile" className="dropdown-item" onClick={onClose}>
                <span className="icon"><User size={20} /></span>Profile
            </Link>
            <Link to="/settings" className="dropdown-item" onClick={onClose}>
                <span className="icon"><Settings size={20} /></span>Settings
            </Link>
            <Link to="/help" className="dropdown-item" onClick={onClose}>
                <span className="icon"><HelpCircle size={20} /></span>Help
            </Link>
            {/* The logout button here is a dummy; the actual logout is handled by the Header component */}
            <button /* onClick={logout} */ className="dropdown-item logout-btn">
                <span className="icon"><LogOut size={20} /></span>Log Out (Dummy)
            </button>
        </div>
    );
};

UserProfileWidget.propTypes = {
    onClose: PropTypes.func.isRequired,
};

export default UserProfileWidget;
