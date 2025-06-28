// src/components/Header.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { LogOut, Bell, User, Sun, Moon, LayoutDashboard, Settings, HelpCircle } from 'lucide-react';
import './Header.css';

const Header = ({
    displayedUsername,
    onToggleTheme,
    isDarkMode,
    onToggleNotifications,
    onToggleProfileMenu,
    notificationsRef,
    profileMenuRef,
    isNotificationsOpen,
    isProfileMenuOpen,
    logout
}) => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        const { success } = await logout();
        if (success) {
            console.log("Logged out successfully from Header.");
            navigate('/login');
        } else {
            console.error("Logout failed.");
        }
        onToggleProfileMenu();
    };

    return (
        <header className="header">
            <div className="nav-left">
                <Link to="/" className="logo">Ascendia</Link>
                <nav className="nav-links">
                    <Link to="/about">About</Link>
                    <Link to="/contact">Contact</Link>
                    <Link to="/downloads">Downloads</Link>
                </nav>
            </div>
            <div className="nav-right">
                <div className="nav-buttons">
                    {displayedUsername ? (
                        <>
                            {/* WHEN LOGGED IN: Show Bell and User Profile */}
                            <div className="bell-icon-link" onClick={onToggleNotifications} aria-label="Notifications" role="button" tabIndex="0">
                                <Bell size={24} className="nav-bell-icon" />
                            </div>

                            <div className="user-profile-widget" ref={profileMenuRef}>
                                <div className="user-info-trigger" onClick={onToggleProfileMenu}>
                                    <div className="avatar-circle">
                                        {displayedUsername ? displayedUsername.charAt(0).toUpperCase() : '?'}
                                    </div>
                                    <span className="welcome-message">Hello, {displayedUsername}!</span>
                                    <span className={`dropdown-arrow ${isProfileMenuOpen ? 'open' : ''}`}>▼</span>
                                </div>
                                {isProfileMenuOpen && (
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
                            {/* WHEN LOGGED OUT: Show Login and Register buttons */}
                            <Link to="/login" className="login-btn">Login</Link>
                            {/* Changed 'Get Started' to 'Register' */}
                            <Link to="/getting-started" className="start-btn primary-gradient">Register</Link>
                        </>
                    )}
                </div>
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
