// src/components/NotificationsDropdown.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { XCircle, Bell, MessageSquare, CheckSquare } from 'lucide-react'; // Example icons
import './NotificationsDropdown.css'; // Create this CSS file next

const NotificationsDropdown = ({ onClose }) => {
    // Dummy notifications for now
    const dummyNotifications = [
        { id: 'n1', icon: <Bell size={16} />, message: "Welcome to Ascendia! Start by adding your subjects.", timestamp: "Just now" },
        { id: 'n2', icon: <MessageSquare size={16} />, message: "Your weekly study report is ready.", timestamp: "2 hours ago" },
        { id: 'n3', icon: <CheckSquare size={16} />, message: "Topic 'Algebra' marked as mastered.", timestamp: "Yesterday" },
    ];

    return (
        <div className="notifications-dropdown-container">
            <div className="notifications-header">
                <h4>Notifications</h4>
                <button onClick={onClose} className="notifications-close-btn">
                    <XCircle size={20} />
                </button>
            </div>
            <div className="notifications-list">
                {dummyNotifications.length > 0 ? (
                    dummyNotifications.map(notification => (
                        <div key={notification.id} className="notification-item">
                            <span className="notification-icon">{notification.icon}</span>
                            <p className="notification-message">{notification.message}</p>
                            <span className="notification-timestamp">{notification.timestamp}</span>
                        </div>
                    ))
                ) : (
                    <p className="no-notifications-message">No new notifications.</p>
                )}
            </div>
            <Link to="/notifications" className="see-all-notifications-link" onClick={onClose}>
                See all notifications
            </Link>
        </div>
    );
};

NotificationsDropdown.propTypes = {
    onClose: PropTypes.func.isRequired,
};

export default NotificationsDropdown;
