import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import './PageStyles.css'; // Assuming common styles for pages
import { Gauge, Book, ListChecks, Target, Bell, CalendarClock, GraduationCap, Trophy, Clock, Pencil, PlusCircle, Trash2, XCircle, Table, Download } from 'lucide-react'; // Import Lucide React icons

// Helper function to format date and time for Date object construction
const getDateTimeForExam = (exam) => {
  let dateString = exam.date;
  let timeString = exam.time;

  // If time is not provided, infer a default based on session
  if (!timeString) {
    switch (exam.session) {
      case 'AM': timeString = '09:00'; break;
      case 'PM': timeString = '14:00'; break;
      case 'EV': timeString = '19:00'; break;
      default: timeString = '00:00'; // Default to midnight if no session/time
    }
  }
  return new Date(`${dateString}T${timeString}`);
};

// Helper function to format date with ordinal suffix (e.g., "1st", "2nd", "3rd", "4th")
const formatDateWithOrdinal = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.toLocaleDateString('en-US', { month: 'long' });
  const year = date.getFullYear();

  let suffix = 'th';
  if (day === 1 || day === 21 || day === 31) {
    suffix = 'st';
  } else if (day === 2 || day === 22) {
    suffix = 'nd';
  } else if (day === 3 || day === 23) {
    suffix = 'rd';
  }
  return `${day}${suffix} ${month}, ${year}`;
};


// Exam Editor Modal Component
const ExamEditorModal = ({ isOpen, onClose, onSave, initialExams }) => {
  const [editedExams, setEditedExams] = useState(initialExams || []);

  useEffect(() => {
    // Deep copy initialExams to prevent direct mutation of prop
    setEditedExams(JSON.parse(JSON.stringify(initialExams || [])));
  }, [initialExams, isOpen]); // Reset editedExams when modal opens or initialExams change

  if (!isOpen) return null;

  const handleExamChange = (index, field, value) => {
    const updatedExams = [...editedExams];
    updatedExams[index] = { ...updatedExams[index], [field]: value };
    setEditedExams(updatedExams);
  };

  const handleAddExam = () => {
    setEditedExams([...editedExams, { subject: '', component: '', date: '', time: '', session: 'AM' }]); // Default session to AM
  };

  const handleRemoveExam = (index) => {
    const updatedExams = editedExams.filter((_, i) => i !== index);
    setEditedExams(updatedExams);
  };

  const handleSave = () => {
    // Filter out any completely empty exam entries before saving
    const cleanedExams = editedExams.filter(exam =>
      exam.subject || exam.component || exam.date || exam.time || exam.session
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
                <label className="compulsory-field">Subject:</label>
                <input
                  type="text"
                  placeholder="e.g., Physics"
                  value={exam.subject}
                  onChange={(e) => handleExamChange(index, 'subject', e.target.value)}
                  required // Compulsory
                />
              </div>
              <div className="form-group-inline">
                <label className="compulsory-field">Component:</label>
                <input
                  type="text"
                  placeholder="e.g., Paper 2"
                  value={exam.component}
                  onChange={(e) => handleExamChange(index, 'component', e.target.value)}
                  required // Compulsory
                />
              </div>
              <div className="form-group-inline">
                <label className="compulsory-field">Date:</label>
                <input
                  type="date"
                  value={exam.date}
                  onChange={(e) => handleExamChange(index, 'date', e.target.value)}
                  required // Compulsory
                />
              </div>
              <div className="form-group-inline">
                <label>Time:</label>
                <input
                  type="time"
                  value={exam.time}
                  onChange={(e) => handleExamChange(index, 'time', e.target.value)}
                  // Not required
                />
              </div>
              <div className="form-group-inline">
                <label className="compulsory-field">Session:</label>
                <select
                  value={exam.session}
                  onChange={(e) => handleExamChange(index, 'session', e.target.value)}
                  required // Compulsory
                >
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                  <option value="EV">EV</option>
                </select>
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

// Image Display Modal Component
const ImageDisplayModal = ({ isOpen, onClose, imageUrl }) => {
  if (!isOpen) return null;

  const handleDownloadImage = () => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = 'all_exams_schedule.jpg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content image-modal-content">
        <div className="modal-header">
          <h3>Your Exam Schedule</h3>
          <button onClick={onClose} className="modal-close-btn">
            <XCircle size={24} />
          </button>
        </div>
        <div className="modal-body image-modal-body">
          {imageUrl ? (
            <img src={imageUrl} alt="Exam Schedule" className="generated-image" />
          ) : (
            <p>No image to display.</p>
          )}
        </div>
        <div className="modal-footer">
          <button onClick={handleDownloadImage} className="modal-download-btn">
            <Download size={20} /> Download Image
          </button>
        </div>
      </div>
    </div>
  );
};


function Dashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [exams, setExams] = useState(() => {
    try {
      const savedExams = localStorage.getItem('userExams');
      return savedExams ? JSON.parse(savedExams) : [];
    } catch (error) {
      console.error("Failed to parse exams from localStorage:", error);
      return [];
    }
  });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false); // New state for image modal
  const [imageDataUrl, setImageDataUrl] = useState(''); // New state for image data
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

    // Filter out exams that have already passed
    const upcomingExams = exams.filter(exam => {
      if (exam.date) {
        const examDateTime = getDateTimeForExam(exam).getTime();
        return examDateTime > now;
      }
      return false;
    });

    upcomingExams.sort((a, b) => getDateTimeForExam(a).getTime() - getDateTimeForExam(b).getTime());


    if (upcomingExams.length > 0) {
      closestExam = upcomingExams[0];
    }
    setNextExam(closestExam);
  }, [exams]);

  // Effect to calculate time remaining for the next exam
  useEffect(() => {
    findNextExam(); // Initial find

    const countdownTimer = setInterval(() => {
      if (nextExam && nextExam.date) { // Only calculate if there's a next exam and date is present
        const now = new Date();
        const examDateTime = getDateTimeForExam(nextExam);
        const difference = examDateTime.getTime() - now.getTime();

        if (difference <= 0) {
          setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0 });
          setNextExam(null); // Mark as passed
          findNextExam(); // Try to find the *next* next exam immediately
          return;
        }

        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeRemaining({ days, hours, minutes, seconds });
      } else {
        setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0 }); // Reset if no next exam
      }
    }, 1000);

    return () => clearInterval(countdownTimer);
  }, [nextExam, findNextExam]);

  const formatTime = (value) => String(value).padStart(2, '0');

  const handleSaveExams = (updatedExams) => {
    setExams(updatedExams);
    findNextExam(); // Re-evaluate next exam after saving
  };

  // Function to generate and download exams table as JPG
  const handleSeeAllExams = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const padding = 20;
    const rowHeight = 40;
    const headerHeight = 50;
    const fontSize = 16;
    const headerFontSize = 18;

    // Define headers for the table (excluding "Time", including "Session")
    const headers = ["Subject", "Component", "Date", "Session"];

    // Sort exams by date before rendering
    const sortedExams = [...exams].sort((a, b) => {
      const dateA = getDateTimeForExam(a).getTime();
      const dateB = getDateTimeForExam(b).getTime();
      return dateA - dateB;
    });

    // Prepare data for rendering
    const columnData = sortedExams.map(exam => ([
      exam.subject || '-',
      exam.component || '-',
      formatDateWithOrdinal(exam.date), // Use the new formatting function here
      exam.session || '-' // Include session here
    ]));

    // Temporarily set font for measurement
    ctx.font = `${headerFontSize}px 'Poppins', sans-serif`;
    let colWidths = headers.map(header => ctx.measureText(header).width + padding * 2); // Initial width from headers + padding

    ctx.font = `${fontSize}px 'Inter', sans-serif`;
    columnData.forEach(row => {
      row.forEach((cell, i) => {
        if (cell) { // Ensure cell is not null/undefined for measurement
          const textWidth = ctx.measureText(cell).width;
          // Update column width only if the cell content is wider than current width
          if (textWidth + padding * 2 > colWidths[i]) {
            colWidths[i] = textWidth + padding * 2;
          }
        }
      });
    });

    // Ensure 'Session' column is wide enough for "EV" if it wasn't already (due to minimal data)
    const sessionColumnIndex = headers.indexOf("Session");
    if (sessionColumnIndex !== -1) {
      const widestSessionText = Math.max(
        ctx.measureText("AM").width,
        ctx.measureText("PM").width,
        ctx.measureText("EV").width
      );
      if (widestSessionText + padding * 2 > colWidths[sessionColumnIndex]) {
        colWidths[sessionColumnIndex] = widestSessionText + padding * 2;
      }
    }


    // Calculate total width of columns
    let totalColWidth = colWidths.reduce((sum, w) => sum + w, 0);

    // Ensure table has a reasonable minimum width (e.g., 600px)
    const minTableWidth = 600;
    if (totalColWidth < minTableWidth) {
        // If the calculated total width is less than minTableWidth, expand columns proportionally
        const diff = minTableWidth - totalColWidth;
        const uniformAdd = diff / colWidths.length;
        colWidths = colWidths.map(w => w + uniformAdd);
        totalColWidth = minTableWidth; // Set total width to minTableWidth
    }


    const tableHeight = headerHeight + exams.length * rowHeight;
    canvas.width = totalColWidth;
    canvas.height = tableHeight + padding * 2; // Add some vertical padding

    ctx.fillStyle = '#f9f9f9'; // Background color for the image
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    let currentY = padding; // Start Y with padding

    // Draw Header
    ctx.fillStyle = '#ff4d88'; // Header background color (Pink)
    ctx.fillRect(0, currentY, canvas.width, headerHeight); // Use full canvas width for header background

    ctx.font = `${headerFontSize}px 'Poppins', sans-serif`;
    ctx.fillStyle = 'white'; // Header text color
    ctx.textAlign = 'left';
    let currentX = 0; // Start at 0 for drawing within the canvas's left edge
    headers.forEach((header, i) => {
        ctx.fillText(header, currentX + padding, currentY + headerHeight / 2 + headerFontSize / 3);
        currentX += colWidths[i];
    });
    currentY += headerHeight;

    // Draw Rows
    ctx.font = `${fontSize}px 'Inter', sans-serif`;
    columnData.forEach((row, rowIndex) => {
        ctx.fillStyle = rowIndex % 2 === 0 ? '#ffffff' : '#f0f0f0'; // Alternating row colors
        ctx.fillRect(0, currentY, canvas.width, rowHeight); // Use full canvas width for row background

        ctx.fillStyle = '#333'; // Row text color
        currentX = 0;
        row.forEach((cell, colIndex) => {
            ctx.fillText(cell, currentX + padding, currentY + rowHeight / 2 + fontSize / 3);
            currentX += colWidths[colIndex];
        });
        currentY += rowHeight;
    });

    // Convert to image and display in modal
    const image = canvas.toDataURL('image/jpeg', 0.9); // 0.9 quality
    setImageDataUrl(image);
    setIsImageModalOpen(true); // Open the modal
  };


  // Mock data (keep these for other sections)
  // Updated 'Upcoming Exam' value to reflect nextExam state
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
              <p className="exam-details">
                {nextExam.subject} {nextExam.component} on {new Date(`${nextExam.date}T${nextExam.time || '00:00'}`).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} ({nextExam.session})
                {nextExam.time && ` at ${new Date(`${nextExam.date}T${nextExam.time}`).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}`}
              </p>
            </div>
          ) : (
            <p className="no-upcoming-exams">No upcoming exams added. Click 'Edit Exams' to add one!</p>
          )}
        </div>

        {/* Action Buttons for Countdown - Now a separate grid item */}
        <div className="countdown-actions grid-item grid-column-2-3"> {/* New class for grid column */}
            <button onClick={handleSeeAllExams} className="see-all-exams-btn dashboard-action-btn">
              <Table size={16} /> See All Exams
            </button>
            <button onClick={() => setIsEditModalOpen(true)} className="edit-exams-btn dashboard-action-btn">
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

      {/* Image Display Modal */}
      <ImageDisplayModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        imageUrl={imageDataUrl}
      />
    </div>
  );
}

export default Dashboard;
