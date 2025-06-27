import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './PageStyles.css'; // Assuming common styles for pages
import { Gauge, Book, ListChecks, Target, Bell, CalendarClock, GraduationCap, Trophy, Clock } from 'lucide-react'; // Import Lucide React icons

function Dashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Effect for updating current time
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000); // Update every second

    return () => clearInterval(timer); // Cleanup
  }, []);

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
    "Reviewed Chemistry topic 'Stoichiometry'.",
    "Updated 'Forces and Motion' notes.",
    "Set reminder for 'Maths Quiz' next week."
  ];

  // Exam Countdown Logic
  const examDate = new Date('2025-08-15T09:00:00'); // Example: August 15, 2025, 9:00 AM
  const [timeRemaining, setTimeRemaining] = useState({});

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date();
      const difference = examDate.getTime() - now.getTime();

      if (difference <= 0) {
        setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeRemaining({ days, hours, minutes, seconds });
    };

    calculateTimeRemaining(); // Initial calculation
    const countdownTimer = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(countdownTimer); // Cleanup
  }, [examDate]); // Re-run if examDate changes

  const formatTime = (value) => String(value).padStart(2, '0');


  return (
    <div className="page-container dashboard-page">
      <h2 className="page-title">Welcome to Your Dashboard!</h2>
      <p className="page-description">Your personalized hub for Cambridge exam success.</p>

      <div className="dashboard-grid-container">
        {/* Top Section - Welcome, Time & Countdown */}
        <div className="dashboard-welcome-time-countdown-section grid-span-full">
          {/* Current Time Widget */}
          <div className="time-widget dashboard-card">
            <Clock size={32} className="widget-icon" />
            <div className="time-display">
              <p className="current-date">{currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              <p className="current-time">{currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}</p>
            </div>
          </div>

          {/* Exam Countdown Widget */}
          <div className="countdown-widget dashboard-card grid-span-2">
            <CalendarClock size={32} className="widget-icon" />
            <h3 className="widget-title">Next Exam In:</h3>
            {timeRemaining.days === 0 && timeRemaining.hours === 0 && timeRemaining.minutes === 0 && timeRemaining.seconds === 0 ? (
              <p className="countdown-finished">Exam has passed or is today!</p>
            ) : (
              <div className="countdown-timer">
                <div className="countdown-segment">
                  <span className="countdown-value">{timeRemaining.days}</span>
                  <span className="countdown-label">Days</span>
                </div>
                <div className="countdown-segment">
                  <span className="countdown-value">{formatTime(timeRemaining.hours)}</span>
                  <span className="countdown-label">Hours</span>
                </div>
                <div className="countdown-segment">
                  <span className="countdown-value">{formatTime(timeRemaining.minutes)}</span>
                  <span className="countdown-label">Mins</span>
                </div>
                <div className="countdown-segment">
                  <span className="countdown-value">{formatTime(timeRemaining.seconds)}</span>
                  <span className="countdown-label">Secs</span>
                </div>
              </div>
            )}
            <p className="exam-details">Physics Paper 2 on {examDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>

        {/* Quick Stats Section */}
        <section className="dashboard-section quick-stats-section grid-span-full">
          <h3 className="section-heading">Your Progress At A Glance</h3>
          <div className="stats-grid">
            {quickStats.map(stat => (
              <div key={stat.id} className="stat-card dashboard-card">
                <div className="stat-icon">{stat.icon}</div>
                <p className="stat-label">{stat.label}</p>
                <p className="stat-value">{stat.value}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Quick Links Section */}
        <section className="dashboard-section quick-links-section grid-span-full">
          <h3 className="section-heading">Quick Actions</h3>
          <div className="links-grid">
            {quickLinks.map(link => (
              <Link key={link.id} to={link.to} className="dashboard-link-card dashboard-card">
                <div className="link-icon">{link.icon}</div>
                <span className="link-name">{link.name}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Recent Activity/Notifications Section */}
        <section className="dashboard-section recent-activity-section grid-span-full">
          <h3 className="section-heading">Recent Activity & Notifications</h3>
          <div className="activity-list dashboard-card"> {/* Applying dashboard-card style */}
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

      </div> {/* End dashboard-grid-container */}

      {/* Back to Homepage button, optional based on app navigation */}
      {/* <Link to="/" className="back-to-home-button">← Back to Homepage</Link> */}
    </div>
  );
}

export default Dashboard;
