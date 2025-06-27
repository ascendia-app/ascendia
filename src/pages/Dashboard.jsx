import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
    Gauge, Book, ListChecks, Target, Bell, CalendarClock, GraduationCap, Trophy, Clock, Pencil, PlusCircle, Trash2, XCircle, Table, Download
} from 'lucide-react';

// Import Firebase (auth, db, appId) and AuthContext
import { db, appId } from '../firebaseConfig'; // Ensure appId is imported here
import { useAuth } from '../contexts/AuthContext';
import { collection, doc, addDoc, updateDoc, deleteDoc, onSnapshot, getDocs } from 'firebase/firestore';

// Import your separated modal components
import EditExamsModal from '../modals/EditExamsModal';
import ImageDisplayModal from '../modals/ImageDisplayModal';

import './PageStyles.css'; // Common styles for pages

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

// Helper function to format date as "Month Day, Year" (e.g., "July 15, 2025")
const formatDateWithOrdinal = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.toLocaleDateString('en-US', { month: 'long' });
  const year = date.getFullYear();
  return `${month} ${day}, ${year}`;
};

function Dashboard() {
  const { currentUser, loading } = useAuth(); // Get current user and loading state from AuthContext
  const [userId, setUserId] = useState(null);

  const [currentTime, setCurrentTime] = useState(new Date());
  const [exams, setExams] = useState([]); // Exams fetched from Firestore
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [imageDataUrl, setImageDataUrl] = useState('');
  const [timeRemaining, setTimeRemaining] = useState({});
  const [nextExam, setNextExam] = useState(null);
  const [firebaseError, setFirebaseError] = useState(null); // State for Firebase errors

  // --- Effect to set userId once AuthContext loading is complete ---
  useEffect(() => {
    if (!loading) {
      if (currentUser) {
        setUserId(currentUser.uid);
        console.log("Dashboard: User authenticated, UID:", currentUser.uid);
      } else {
        setUserId(null);
        setExams([]); // Clear exams if user logs out
        setNextExam(null);
        console.log("Dashboard: User not authenticated.");
        // Optionally redirect to login or show a "please log in" message
      }
    }
  }, [currentUser, loading]);

  // --- Effect for real-time exams data from Firestore ---
  useEffect(() => {
    if (!userId || !db) {
      setExams([]); // Clear exams if no user or db not ready
      setFirebaseError(null);
      return;
    }

    setFirebaseError(null); // Clear previous errors
    const examsCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/exams`);
    console.log(`Dashboard: Subscribing to exams at path: artifacts/${appId}/users/${userId}/exams`);

    const unsubscribe = onSnapshot(examsCollectionRef, (snapshot) => {
      const fetchedExams = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setExams(fetchedExams);
      console.log("Dashboard: Fetched exams updated:", fetchedExams.length);
    }, (error) => {
      console.error("Dashboard: Error fetching exams from Firestore:", error);
      setFirebaseError("Failed to load exams. Please check your internet connection or try again later.");
    });

    // Cleanup function for the snapshot listener
    return () => {
      console.log("Dashboard: Unsubscribing from exams listener.");
      unsubscribe();
    };
  }, [userId, db, appId]); // Re-run when userId or db/appId changes

  // --- Function to find the next upcoming exam ---
  const findNextExam = useCallback((currentExams) => {
    const now = new Date().getTime();
    let closestExam = null;

    const upcomingExams = currentExams.filter(exam => {
      if (exam.date) {
        const examDateTime = getDateTimeForExam(exam).getTime();
        return examDateTime > now;
      }
      return false;
    }).sort((a, b) => getDateTimeForExam(a).getTime() - getDateTimeForExam(b).getTime());

    if (upcomingExams.length > 0) {
      closestExam = upcomingExams[0];
    }
    setNextExam(closestExam);
  }, []);

  // --- Effect to re-evaluate next exam when 'exams' state changes ---
  useEffect(() => {
    findNextExam(exams);
  }, [exams, findNextExam]);

  // --- Effect for updating current time ---
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // --- Effect to calculate time remaining for the next exam ---
  useEffect(() => {
    const countdownTimer = setInterval(() => {
      if (nextExam && nextExam.date) {
        const now = new Date();
        const examDateTime = getDateTimeForExam(nextExam);
        const difference = examDateTime.getTime() - now.getTime();

        if (difference <= 0) {
          setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0 });
          // If exam has passed, find the next one
          setNextExam(null); // Mark current nextExam as passed
          findNextExam(exams); // Re-find next exam from current exams list
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
  }, [nextExam, exams, findNextExam]);

  const formatTime = (value) => String(value).padStart(2, '0');

  // --- Handle Save Exams (Add/Update/Delete reconciliation with Firestore) ---
  const handleSaveExams = async (updatedExams) => {
    if (!userId || !db) {
      console.error("Cannot save exams: User not authenticated or Firestore not ready.");
      setFirebaseError("Authentication required to save exams.");
      return;
    }

    setFirebaseError(null); // Clear previous errors

    try {
      const currentExamsMap = new Map(exams.map(exam => [exam.id, exam])); // Map existing by Firestore ID
      const updatedExamsMap = new Map(updatedExams.map(exam => [exam.id || exam.tempId, exam])); // Map incoming by Firestore ID or tempId

      const batchPromises = []; // Collect all Firestore operations

      // 1. Add new exams or Update existing exams
      for (const updatedExam of updatedExams) {
        if (updatedExam.id && currentExamsMap.has(updatedExam.id)) {
          // Existing exam: check for changes and update
          const currentExam = currentExamsMap.get(updatedExam.id);
          const hasChanged = Object.keys(updatedExam).some(key =>
            key !== 'id' && key !== 'tempId' && updatedExam[key] !== currentExam[key]
          );

          if (hasChanged) {
            const examDocRef = doc(db, `artifacts/${appId}/users/${userId}/exams`, updatedExam.id);
            batchPromises.push(updateDoc(examDocRef, {
              subject: updatedExam.subject,
              component: updatedExam.component,
              date: updatedExam.date,
              time: updatedExam.time,
              session: updatedExam.session,
              updatedAt: new Date().toISOString()
            }));
            console.log("Dashboard: Updating exam:", updatedExam.id);
          }
        } else if (updatedExam.tempId && !updatedExam.id) {
          // New exam (has tempId but no Firestore ID)
          const examsCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/exams`);
          batchPromises.push(addDoc(examsCollectionRef, {
            subject: updatedExam.subject,
            component: updatedExam.component,
            date: updatedExam.date,
            time: updatedExam.time,
            session: updatedExam.session,
            createdAt: new Date().toISOString()
          }));
          console.log("Dashboard: Adding new exam with tempId:", updatedExam.tempId);
        }
      }

      // 2. Delete removed exams
      for (const currentExam of exams) {
        // Check if the current exam from Firestore is NOT in the updated list (by its Firestore ID)
        if (!updatedExamsMap.has(currentExam.id)) {
          const examDocRef = doc(db, `artifacts/${appId}/users/${userId}/exams`, currentExam.id);
          batchPromises.push(deleteDoc(examDocRef));
          console.log("Dashboard: Deleting exam:", currentExam.id);
        }
      }

      await Promise.all(batchPromises); // Execute all operations
      console.log("Dashboard: Exam changes synced to Firestore successfully.");

    } catch (error) {
      console.error("Dashboard: Error saving exams to Firestore:", error);
      setFirebaseError("Failed to save exams. Please try again.");
    } finally {
      setIsEditModalOpen(false); // Close modal regardless of success/failure
    }
  };

  // --- Function to generate and display exams table as JPG ---
  const handleSeeAllExams = () => {
    // Only generate if there are exams to display
    if (exams.length === 0) {
      setFirebaseError("No exams to display. Add some exams first!");
      return;
    }

    setFirebaseError(null); // Clear previous errors

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const padding = 20;
    const rowHeight = 40;
    const headerHeight = 50;
    const fontSize = 16;
    const headerFontSize = 18;

    const headers = ["Subject", "Component", "Date", "Session"];

    const sortedExams = [...exams].sort((a, b) => {
      const dateA = getDateTimeForExam(a).getTime();
      const dateB = getDateTimeForExam(b).getTime();
      return dateA - dateB;
    });

    const columnData = sortedExams.map(exam => ([
      exam.subject || '-',
      exam.component || '-',
      formatDateWithOrdinal(exam.date),
      exam.session || '-'
    ]));

    ctx.font = `${headerFontSize}px 'Poppins', sans-serif`;
    let colWidths = headers.map(header => ctx.measureText(header).width + padding * 2);

    ctx.font = `${fontSize}px 'Inter', sans-serif`;
    columnData.forEach(row => {
      row.forEach((cell, i) => {
        if (cell) {
          const textWidth = ctx.measureText(cell).width;
          if (textWidth + padding * 2 > colWidths[i]) {
            colWidths[i] = textWidth + padding * 2;
          }
        }
      });
    });

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

    let totalColWidth = colWidths.reduce((sum, w) => sum + w, 0);
    const minTableWidth = 600;
    if (totalColWidth < minTableWidth) {
        const diff = minTableWidth - totalColWidth;
        const uniformAdd = diff / colWidths.length;
        colWidths = colWidths.map(w => w + uniformAdd);
        totalColWidth = minTableWidth;
    }

    const tableHeight = headerHeight + exams.length * rowHeight;
    canvas.width = totalColWidth;
    canvas.height = tableHeight + padding;

    ctx.fillStyle = '#f9f9f9';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    let currentY = 0;

    ctx.fillStyle = '#ff4d88';
    ctx.fillRect(0, currentY, canvas.width, headerHeight);

    ctx.font = `${headerFontSize}px 'Poppins', sans-serif`;
    ctx.fillStyle = 'white';
    ctx.textAlign = 'left';
    let currentX = 0;
    headers.forEach((header, i) => {
        ctx.fillText(header, currentX + padding, currentY + headerHeight / 2 + headerFontSize / 3);
        currentX += colWidths[i];
    });
    currentY += headerHeight;

    ctx.font = `${fontSize}px 'Inter', sans-serif`;
    columnData.forEach((row, rowIndex) => {
        ctx.fillStyle = rowIndex % 2 === 0 ? '#ffffff' : '#f0f0f0';
        ctx.fillRect(0, currentY, canvas.width, rowHeight);

        ctx.fillStyle = '#333';
        currentX = 0;
        row.forEach((cell, colIndex) => {
            ctx.fillText(cell, currentX + padding, currentY + rowHeight / 2 + fontSize / 3);
            currentX += colWidths[colIndex];
        });
        currentY += rowHeight;
    });

    const image = canvas.toDataURL('image/jpeg', 0.9);
    setImageDataUrl(image);
    setIsImageModalOpen(true);
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

  // Conditional rendering based on authentication state
  if (loading) {
    return (
      <div className="page-container dashboard-page" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <p className="welcome-message loading-pulse" style={{ color: '#ff4d88' }}>Loading dashboard...</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="page-container dashboard-page" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <h2 className="page-title">Access Denied</h2>
        <p className="page-description">Please <Link to="/login" className="inline-link">log in</Link> or <Link to="/getting-started" className="inline-link">register</Link> to view your dashboard.</p>
      </div>
    );
  }

  return (
    <div className="page-container dashboard-page">
      <h2 className="page-title">Welcome to Your Dashboard!</h2>
      <p className="page-description">Your personalized hub for Cambridge exam success.</p>

      {firebaseError && (
        <p className="form-message">{firebaseError}</p>
      )}

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
        <div className="countdown-actions grid-item grid-column-2-3">
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
          <div className="activity-list dashboard-card">
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

      {/* Edit Exams Modal */}
      <EditExamsModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveExams}
        initialExams={exams} // Pass exams fetched from Firestore
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
