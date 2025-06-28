import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ListChecks, Book, Target, Gauge, Download, UserCircle, LogOut, Sun, Moon } from 'lucide-react';
import './Header.css'; // You will need to create this CSS file too

// Header component props as defined in App.jsx
function Header({
    displayedUsername,
    onToggleTheme,
    isDarkMode,
    onToggleNotifications,
    onToggleProfileMenu,
    notificationsRef,
    profileMenuRef,
    isNotificationsOpen,
    isProfileMenuOpen
}) {
    // Basic logout placeholder for now, actual logout handled via AuthContext in App.jsx
    const handleLogout = () => {
        // This will be handled by the logout function from useAuth in App.jsx
        console.log("Logout button clicked in Header.");
    };

    return (
        <header className="main-header">
            <div className="header-left">
                <Link to="/dashboard" className="logo-link">
                    <img src="https://placehold.co/40x40/ff4d88/white?text=A" alt="Ascendia Logo" className="app-logo" />
                    <span className="app-name">Ascendia</span>
                </Link>
                <nav className="main-nav">
                    <Link to="/dashboard" className="nav-item">
                        <Home size={20} /> <span className="nav-text">Dashboard</span>
                    </Link>
                    <Link to="/syllabus" className="nav-item">
                        <ListChecks size={20} /> <span className="nav-text">Syllabus</span>
                    </Link>
                    <Link to="/papers" className="nav-item">
                        <Book size={20} /> <span className="nav-text">Papers</span>
                    </Link>
                    <Link to="/planner" className="nav-item">
                        <Target size={20} /> <span className="nav-text">Planner</span>
                    </Link>
                    <Link to="/tracker" className="nav-item">
                        <Gauge size={20} /> <span className="nav-text">Tracker</span>
                    </Link>
                </nav>
            </div>
            <div className="header-right">
                <button onClick={onToggleNotifications} className="icon-button bell-icon-link">
                    <Bell size={24} className="nav-bell-icon" />
                </button>
                <button onClick={onToggleTheme} className="icon-button theme-toggle-button">
                    {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
                </button>
                <div className="user-profile-area" ref={profileMenuRef}>
                    <button onClick={onToggleProfileMenu} className="user-info-trigger">
                        <UserCircle size={28} />
                        <span className="username-display">{displayedUsername || 'Guest'}</span>
                        <ChevronDown size={16} />
                    </button>
                    {isProfileMenuOpen && (
                        <div className="profile-dropdown">
                            <Link to="/profile" className="dropdown-item" onClick={onToggleProfileMenu}>
                                <UserCircle size={18} /> My Profile
                            </Link>
                            <Link to="/downloads" className="dropdown-item" onClick={onToggleProfileMenu}>
                                <Download size={18} /> Downloads
                            </Link>
                            <button onClick={handleLogout} className="dropdown-item logout-btn">
                                <LogOut size={18} /> Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}

export default Header;