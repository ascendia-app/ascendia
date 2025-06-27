import React from 'react';
import { Link } from 'react-router-dom';
import './PageStyles.css'; // Assuming common styles for pages
import { Gauge, Book, ListChecks, Target, Bell, CalendarClock, GraduationCap, Trophy } from 'lucide-react'; // Import Lucide React icons

function Dashboard() {
  // Mock data for demonstration purposes. In a real app, this would come from Firestore/backend.
  const quickStats = [
    { id: 1, label: "Upcoming Exam", value: "Physics Paper 2", icon: <CalendarClock size={24} /> },
    { id: 2, label: "Topics Mastered", value: "75%", icon: <GraduationCap size={24} /> },
    { id: 3, label: "Current Grade", value: "A*", icon: <Trophy size={24} /> },
  ];

  const quickLinks = [
    { id: 1, name: "Syllabus Checklist", to: "/syllabus", icon: <ListChecks size={20} /> },
    { id: 2, name: "Past Paper Vault", to: "/papers", icon: <Book size={20} /> },
    { id: 3, name: "Grade Tracker", to: "/tracker", icon: <Gauge size={20} /> },
    { id: 4, name: "Study Planner", to: "/planner", icon: <Target size={20} /> },
  ];

  const recentActivity = [
    "Completed 'Kinematics' in Physics.",
    "Attempted May/June 2023 Paper 1.",
    "Reviewed Chemistry topic 'Stoichiometry'."
  ];

  return (
    <div className="page-container dashboard-page">
      <h2 className="page-title">Welcome to Your Dashboard!</h2>
      <p className="page-description">Your personalized hub for Cambridge exam success.</p>

      {/* Quick Stats Section */}
      <section className="dashboard-section quick-stats-section">
        <h3 className="section-heading">Your Progress At A Glance</h3>
        <div className="stats-grid">
          {quickStats.map(stat => (
            <div key={stat.id} className="stat-card">
              <div className="stat-icon">{stat.icon}</div>
              <p className="stat-label">{stat.label}</p>
              <p className="stat-value">{stat.value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Links Section */}
      <section className="dashboard-section quick-links-section">
        <h3 className="section-heading">Quick Actions</h3>
        <div className="links-grid">
          {quickLinks.map(link => (
            <Link key={link.id} to={link.to} className="dashboard-link-card">
              <div className="link-icon">{link.icon}</div>
              <span className="link-name">{link.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent Activity/Notifications Section */}
      <section className="dashboard-section recent-activity-section">
        <h3 className="section-heading">Recent Activity & Notifications</h3>
        <div className="activity-list">
          {recentActivity.length > 0 ? (
            recentActivity.map((activity, index) => (
              <div key={index} className="activity-item">
                <span className="activity-icon"><Bell size={16} /></span>
                <p>{activity}</p>
              </div>
            ))
          ) : (
            <p className="no-activity">No recent activity yet. Start planning your studies!</p>
          )}
        </div>
      </section>

      {/* Back to Homepage (if still needed, though primary navigation would be within dashboard) */}
      {/* Removed for dashboard-first experience, users should navigate directly from dashboard */}
      {/* <Link to="/" className="back-to-home-button">← Back to Homepage</Link> */}
    </div>
  );
}

export default Dashboard;
