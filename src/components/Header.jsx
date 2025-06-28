// src/components/Header.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { LogOut, Bell, User, Sun, Moon, LayoutDashboard, Settings, HelpCircle } from 'lucide-react';
import './Header.css'; // Create this CSS file next
// UserProfileWidget.css and NotificationsDropdown.css styles are integrated into Header.css
// The components themselves are imported in App.jsx but not directly used within Header's JSX
// as their toggling logic is handled in App.jsx and they render conditionally based on state.


const Header = ({
    displayedUsername,
    onToggleTheme,
    isDarkMode,
    onToggleNotifications,
    onToggleProfileMenu,
    notificationsRef,
    profileMenuRef,
    isNotificationsOpen, // Passed down from App.jsx, but not directly used in Header's rendering for dropdown *content*
    isProfileMenuOpen,   // Same as above
    logout
}) => {
    const navigate = useNavigate();

    // Function to handle logout and redirect
    const handleLogout = async () => {
        const { success } = await logout();
        if (success) {
            console.log("Logged out successfully from Header.");
            navigate('/login'); // Redirect to login page after successful logout
        } else {
            console.error("Logout failed.");
            // Optionally, show an error message to the user
        }
        // Ensure profile menu closes regardless of logout success/failure
        onToggleProfileMenu();
    };

    return (
        <header className="header">
            <div className="nav-left">
                <Link to="/" className="logo">Ascendia</Link>
                <nav className="nav-links">
                    <Link to="/dashboard">Dashboard</Link>
                    <Link to="/syllabus">Syllabus</Link>
                    <Link to="/papers">Papers</Link>
                    <Link to="/planner">Planner</Link>
                    <Link to="/tracker">Tracker</Link>
                    <Link to="/downloads">Downloads</Link>
                </nav>
            </div>
            <div className="nav-right">
                <div className="nav-buttons">
                    {displayedUsername ? (
                        <>
                            {/* Notifications Bell Icon */}
                            <div className="bell-icon-link" onClick={onToggleNotifications} aria-label="Notifications" role="button" tabIndex="0">
                                <Bell size={24} className="nav-bell-icon" />
                            </div>

                            {/* User Profile Widget (Trigger) */}
                            <div className="user-profile-widget" ref={profileMenuRef}>
                                <div className="user-info-trigger" onClick={onToggleProfileMenu}>
                                    <div className="avatar-circle">
                                        {displayedUsername ? displayedUsername.charAt(0).toUpperCase() : '?'}
                                    </div>
                                    <span className="welcome-message">Hello, {displayedUsername}!</span>
                                    <span className={`dropdown-arrow ${isProfileMenuOpen ? 'open' : ''}`}>▼</span>
                                </div>
                                {/* The actual dropdown menu (UserProfileWidget component) is rendered conditionally in App.jsx */}
                                {/* This div acts as the reference point for clicking outside the menu */}
                                {isProfileMenuOpen && (
                                     // This section is a visual representation of what the dropdown would contain.
                                     // The actual <UserProfileWidget> component rendering is in App.jsx.
                                     // This is here to make the dropdown visually appear when open,
                                     // but the full interactivity relies on the App.jsx's state and passed refs.
                                    <div className="dropdown-menu">
                                        <Link to="/dashboard" className="dropdown-item" onClick={onToggleProfileMenu}>
                                            <span className="icon"><LayoutDashboard size={20} /></span>Dashboard
                                        </Link>
                                        <Link to="/profile" className="dropdown-item" onClick={onToggleProfileMenu}>
                                            <span className="icon"><User size={20} /></span>Profile
                                        </Link>
                                        <Link to="/settings" className="dropdown-item" onClick={onToggleProfileMenu}>
                                            <span className="icon"><Settings size={20} /></span>Settings
                                        </Link>
                                        <Link to="/help" className="dropdown-item" onClick={onToggleProfileMenu}>
                                            <span className="icon"><HelpCircle size={20} /></span>Help
                                        </Link>
                                        <button onClick={handleLogout} className="dropdown-item logout-btn">
                                            <span className="icon"><LogOut size={20} /></span>Log Out
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="login-btn">Login</Link>
                            <Link to="/getting-started" className="start-btn primary-gradient">Get Started</Link>
                        </>
                    )}
                </div>
                {/* Theme Toggle Button */}
                <div className="theme-toggle" onClick={onToggleTheme} aria-label="Toggle dark mode">
                    {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
                </div>
            </div>
        </header>
    );
};

Header.propTypes = {
    displayedUsername: PropTypes.string.isRequired,
    onToggleTheme: PropTypes.func.isRequired,
    isDarkMode: PropTypes.bool.isRequired,
    onToggleNotifications: PropTypes.func.isRequired,
    onToggleProfileMenu: PropTypes.func.isRequired,
    notificationsRef: PropTypes.oneOfType([
        PropTypes.func,
        PropTypes.shape({ current: PropTypes.instanceOf(Element) })
    ]),
    profileMenuRef: PropTypes.oneOfType([
        PropTypes.func,
        PropTypes.shape({ current: PropTypes.instanceOf(Element) })
    ]),
    isNotificationsOpen: PropTypes.bool.isRequired,
    isProfileMenuOpen: PropTypes.bool.isRequired,
    logout: PropTypes.func.isRequired,
};

export default Header;
