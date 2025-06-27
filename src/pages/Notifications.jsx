// src/pages/Notifications.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import '../PageStyles.css'; // Reusing PageStyles for consistency

function Notifications() {
  // Mock data for tasks/notifications
  const upcomingTasks = [
    { id: 1, text: "Complete Physics Chapter 3 questions", date: "2025-07-05" },
    { id: 2, text: "Review Chemistry 'Acids and Bases' notes", date: "2025-07-08" },
    { id: 3, text: "Attempt Math Past Paper May/June 2024", date: "2025-07-12" },
    { id: 4, text: "Read English Literature - Act II", date: "2025-07-15" },
    { id: 5, text: "Prepare for History presentation", date: "2025-07-20" },
    { id: 6, text: "Final revision for Biology quiz", date: "2025-07-25" },
  ];

  return (
    <div className="page-container notifications-page">
      <h2 className="page-title">Notifications & Tasks</h2>
      <p className="page-description">Here's an overview of your upcoming tasks and important notifications.</p>

      <section className="dashboard-section recent-activity-section grid-span-full">
        <h3 className="section-heading">Upcoming Tasks</h3>
        <div className="activity-list dashboard-card">
          {upcomingTasks.length > 0 ? (
            upcomingTasks.map(task => (
              <div key={task.id} className="activity-item">
                {/* Replaced Bell with CheckCircle for tasks, as Bell is for general notifications */}
                <span className="activity-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check-circle">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <path d="m9 11 3 3L22 4"/>
                  </svg>
                </span>
                <p>{task.text} (Due: {new Date(task.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })})</p>
              </div>
            ))
          ) : (
            <p className="no-activity">No upcoming tasks. Enjoy your free time!</p>
          )}
        </div>
      </section>

      {/* You can add another section for general notifications here if needed */}
      {/*
      <section className="dashboard-section">
        <h3 className="section-heading">General Notifications</h3>
        <div className="activity-list dashboard-card">
          <p className="no-activity">No general notifications at the moment.</p>
        </div>
      </section>
      */}

      <Link to="/" className="back-to-home-button">← Back to Homepage</Link>
    </div>
  );
}

export default Notifications;
