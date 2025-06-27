import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import './PageStyles.css'; // Assuming common styles for pages
import { Gauge, Book, ListChecks, Target, Bell, CalendarClock, GraduationCap, Trophy, Clock, Pencil, PlusCircle, Trash2, XCircle } from 'lucide-react'; // Import Lucide React icons

// Exam Editor Modal Component
const ExamEditorModal = ({ isOpen, onClose, onSave, initialExams }) => {
  const [editedExams, setEditedExams] = useState(initialExams || []);

  useEffect(() => {
    setEditedExams(initialExams || []);
  }, [initialExams, isOpen]); // Reset editedExams when modal opens or initialExams change

  if (!isOpen) return null;

  const handleExamChange = (index, field, value) => {
    const updatedExams = [...editedExams];
    updatedExams[index] = { ...updatedExams[index], [field]: value };
    setEditedExams(updatedExams);
  };

  const handleAddExam = () => {
    setEditedExams([...editedExams, { subject: '', component: '', date: '', time: '' }]);
  };

  const handleRemoveExam = (index) => {
    const updatedExams = editedExams.filter((_, i) => i !== index);
    setEditedExams(updatedExams);
  };

  const handleSave = () => {
    // Filter out any completely empty exam entries before saving
    const cleanedExams = editedExams.filter(exam =>
      exam.subject || exam.component || exam.date || exam.time
    );
    onSave(cleanedExams);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Edit Exams</h3>
          <button onClick={onClose} className="modal-close-btn">
            <XCircle size={24} />
          </button>
        </div>
        <div className="modal-body">
          {editedExams.length === 0 && <p className="no-exams-message">No exams added yet. Click 'Add Exam' to get started!</p>}
          {editedExams.map((exam, index) => (
            <div key={index} className="exam-entry">
              <div className="form-group-inline">
                <input
                  type="text"
                  placeholder="Subject (e.g., Physics)"
                  value={exam.subject}
                  onChange={(e) => handleExamChange(index, 'subject', e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Component (e.g., Paper 2)"
                  value={exam.component}
                  onChange={(e) => handleExamChange(index, 'component', e.target.value)}
                />
              </div>
              <div className="form-group-inline">
                <input
                  type="date"
                  value={exam.date}
                  onChange={(e) => handleExamChange(index, 'date', e.target.value)}
                />
                <input
                  type="time"
                  value={exam.time}
                  onChange={(e) => handleExamChange(index, 'time', e.target.value)}
                />
              </div>
              <button onClick={() => handleRemoveExam(index)} className="remove-exam-btn">
                <Trash2 size={18} /> Remove
              </button>
            </div>
          ))}
          <button onClick={handleAddExam} className="add-exam-btn">
            <PlusCircle size={20} /> Add Exam
          </button>
        </div>
        <div className="modal-footer">
          <button onClick={onClose} className="modal-cancel-btn">Cancel</button>
          <button onClick={handleSave} className="modal-save-btn">Save Exams</button>
        </div>
      </div>
    </div>
  );
};


function Dashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [exams, setExams] = useState(() => {
    // Load exams from localStorage on initial render
    try {
      const savedExams = localStorage.getItem('userExams');
      return savedExams ? JSON.parse(savedExams) : [];
    } catch (error) {
      console.error("Failed to parse exams from localStorage:", error);
      return [];
    }
  });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState({});
  const [nextExam, setNextExam] = useState(null);

  // Effect for updating current time
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Effect to save exams to localStorage whenever the exams state changes
  useEffect(() => {
    localStorage.setItem('userExams', JSON.stringify(exams));
  }, [exams]);

  // Function to find the next upcoming exam
  const findNextExam = useCallback(() => {
    const now = new Date().getTime();
    let closestExam = null;
    let minDifference = Infinity;

    exams.forEach(exam => {
      if (exam.date && exam.time) {
        const examDateTime = new Date(`${exam.date}T${exam.time}`).getTime();
        const difference = examDateTime - now;

        if (difference > 0 && difference < minDifference) {
          minDifference = difference;
          closestExam = exam;
        }
      }
    });
    setNextExam(closestExam);
  }, [exams]);

  // Effect to calculate time remaining for the next exam
  useEffect(() => {
    findNextExam(); // Initial find

    const countdownTimer = setInterval(() => {
      if (nextExam && nextExam.date && nextExam.time) {
        const now = new Date();
        const examDateTime = new Date(`${nextExam.date}T${nextExam.time}`);
        const difference = examDateTime.getTime() - now.getTime();

        if (difference <= 0) {
          setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0 });
          setNextExam(null); // Mark as passed
          findNextExam(); // Try to find the *next* next exam
          return;
        }

        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeRemaining({ days, hours, minutes, seconds });
      } else {
        setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    }, 1000);

    return () => clearInterval(countdownTimer);
  }, [nextExam, findNextExam]); // Depend on nextExam and findNextExam for re-calculation

  const formatTime = (value) => String(value).padStart(2, '0');

  const handleSaveExams = (updatedExams) => {
    setExams(updatedExams);
    // After saving, immediately find the new next exam
    findNextExam();
  };

  // Mock data (keep these for other sections)
  const quickStats = [
    { id: 1, label: "Upcoming Exam", value: nextExam ? `${nextExam.subject} ${nextExam.component}` : "N/A", icon: <CalendarClock size={24} /> },
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

  return (
    <div className="page-container dashboard-page">
      <h2 className="page-title">Welcome to Your Dashboard!</h2>
      <p className="page-description">Your personalized hub for Cambridge exam success.</p>

      <div className="dashboard-grid-container">
        {/* Time Widget */}
        <div className="time-widget dashboard-card grid-item">
          <Clock size={32} className="widget-icon" />
          <div className="time-display">
            <p className="current-date">{currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p className="current-time">{currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}</p>
          </div>
        </div>

        {/* Exam Countdown Widget */}
        <div className="countdown-widget dashboard-card grid-item grid-span-2">
          <CalendarClock size={32} className="widget-icon" />
          <h3 className="widget-title">Next Exam In:</h3>
          {nextExam ? (
            <div className="countdown-content">
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
              <p className="exam-details">{nextExam.subject} {nextExam.component} on {new Date(`${nextExam.date}T${nextExam.time}`).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
            </div>
          ) : (
            <p className="no-upcoming-exams">No upcoming exams added. Click 'Edit Exams' to add one!</p>
          )}
          
          {/* Edit Exams Button */}
          <button onClick={() => setIsEditModalOpen(true)} className="edit-exams-btn">
            <Pencil size={16} /> Edit Exams
          </button>
        </div>

        {/* Quick Stats Section */}
        <section className="dashboard-section quick-stats-section grid-item grid-span-full">
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
        <section className="dashboard-section quick-links-section grid-item grid-span-full">
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
        <section className="dashboard-section recent-activity-section grid-item grid-span-full">
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

      {/* Exam Editor Modal */}
      <ExamEditorModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveExams}
        initialExams={exams}
      />
    </div>
  );
}

export default Dashboard;
