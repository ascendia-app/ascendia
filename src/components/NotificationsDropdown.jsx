import React from 'react';
import { Bell } from 'lucide-react';
import './NotificationsDropdown.css'; // You will need to create this CSS file

function NotificationsDropdown({ onClose, userId }) {
    // This is a placeholder. In a real app, you'd fetch notifications from Firestore
    const notifications = [
        { id: 1, text: "Your Physics exam is in 3 days!", time: "2 hours ago" },
        { id: 2, text: "New topic 'Thermodynamics' added to Chemistry.", time: "yesterday" },
        { id: 3, text: "Reminder: Review Biology Chapter 5.", time: "2 days ago" },
    ];

    return (
        <div className="notifications-dropdown">
            <div className="dropdown-header">
                <h3>Notifications</h3>
                <button onClick={onClose} className="close-notifications-btn">
                    <Bell size={20} />
                </button>
            </div>
            {notifications.length > 0 ? (
                <ul className="notification-list">
                    {notifications.map(notif => (
                        <li key={notif.id} className="notification-item">
                            <p className="notification-text">{notif.text}</p>
                            <span className="notification-time">{notif.time}</span>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="no-notifications">No new notifications.</p>
            )}
        </div>
    );
}

export default NotificationsDropdown;