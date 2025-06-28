import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
    Gauge, Book, ListChecks, Target, Bell, CalendarClock, GraduationCap, Trophy, Clock, Pencil, PlusCircle, Trash2, XCircle, Table, Download
} from 'lucide-react';

// Import necessary Firestore functions using the workaround for stubborn bundling issues
import * as firestore from 'firebase/firestore';
const { collection, onSnapshot, doc, addDoc, updateDoc, deleteDoc } = firestore;

// NEW: Import useAuth only (db, appId, userId come from useAuth now)
import { useAuth } from '../contexts/AuthContext';

// Import your separated modal components
import EditExamsModal from '../modals/EditExamsModal';
import ViewExamsModal from '../modals/ViewExamsModal';

import '../PageStyles.css';
import '../ModalStyles.css'; // Ensure the general modal styles are imported


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
  // Destructure db, appId, userId, and isFirebaseInitialized from useAuth
  const { currentUser, loading, db, appId, userId, isFirebaseInitialized } = useAuth(); // <-- UPDATED DESTRUCTURING

  const [currentTime, setCurrentTime] = useState(new Date());
  const [exams, setExams] = useState([]); // Exams fetched from Firestore
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false); // State for ViewExamsModal
  const [firebaseError, setFirebaseError] = useState(null); // State for Firebase errors
  const [timeRemaining, setTimeRemaining] = useState({}); // State to hold calculated time remaining
  const [nextExam, setNextExam] = useState(null);


  // --- Effect for real-time exams data from Firestore ---
  useEffect(() => {
    // Only subscribe if Firebase is fully initialized AND userId, db, and appId are available
    if (!isFirebaseInitialized || loading || !userId || !db || !appId) {
      setExams([]); // Clear exams if prerequisites are not met
      setFirebaseError(null); // Clear any old errors
      console.log("Dashboard: Firestore subscription skipped. Waiting for Firebase init, userId, db, appId from AuthContext."); // Debug log
      return;
    }

    setFirebaseError(null); // Clear previous errors before attempting new fetch
    // Construct the collection path using the provided appId and userId
    const examsCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/exams`);
    console.log(`Dashboard: Subscribing to exams at path: artifacts/${appId}/users/${userId}/exams`);

    // Set up the real-time listener
    const unsubscribe = onSnapshot(examsCollectionRef, (snapshot) => {
      const fetchedExams = snapshot.docs.map(doc => ({
        id: doc.id, // Firestore document ID
        ...doc.data() // Other exam data
      }));
      setExams(fetchedExams);
      console.log("Dashboard: Fetched exams updated:", fetchedExams.length, "exams.");
      // After fetching exams, re-find the next exam
      findNextExam(fetchedExams);
    }, (error) => {
      console.error("Dashboard: Error fetching exams from Firestore:", error);
      setFirebaseError("Failed to load exams. Please check your internet connection or try again later.");
    });

    // Cleanup function: unsubscribe from the listener when the component unmounts or dependencies change
    return () => {
      console.log("Dashboard: Unsubscribing from exams listener.");
      unsubscribe();
    };
    // Dependencies for this useEffect: re-run if any of these change
  }, [userId, db, appId, findNextExam, loading, isFirebaseInitialized]); // Added isFirebaseInitialized


  // --- Function to find the next upcoming exam from the fetched 'exams' list ---
  const findNextExam = useCallback((currentExams) => {
    const now = new Date().getTime();
    let closestExam = null;

    const upcomingExams = currentExams
      .filter(exam => {
        // Ensure exam.date exists before attempting to create a Date object
        if (exam.date) {
          const examDateTime = getDateTimeForExam(exam).getTime();
          return examDateTime > now; // Only consider exams in the future
        }
        return false;
      })
      .sort((a, b) => {
        // Sort by dateTime to find the soonest upcoming exam
        return getDateTimeForExam(a).getTime() - getDateTimeForExam(b).getTime();
      });

    // Set the closest exam if any upcoming exams exist
    if (upcomingExams.length > 0) {
      closestExam = upcomingExams[0];
      console.log("Dashboard: Next upcoming exam found:", closestExam.subject, closestExam.component); // Debug log
    } else {
      console.log("Dashboard: No upcoming exams found."); // Debug log
    }
    setNextExam(closestExam);
  }, []); // useCallback memoizes this function, only recreated if dependencies change (none here)


  // --- Effect for updating current time (for the clock widget) ---
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000); // Update every second
    return () => clearInterval(timer); // Cleanup on component unmount
  }, []);

  // --- Effect to calculate time remaining for the next exam (for countdown widget) ---
  useEffect(() => {
    const countdownTimer = setInterval(() => {
      if (nextExam && nextExam.date) {
        const now = new Date();
        const examDateTime = getDateTimeForExam(nextExam);
        const difference = examDateTime.getTime() - now.getTime();

        if (difference <= 0) {
          // If the exam has passed or is now, set time to zero and find the next one
          setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0 });
          setNextExam(null); // Mark current nextExam as passed
          findNextExam(exams); // Re-find the next exam from the updated list
          console.log("Dashboard: Next exam passed, re-calculating next exam."); // Debug log
          return;
        }

        // Calculate time units
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeRemaining({ days, hours, minutes, seconds });
      } else {
        // If there's no next exam, reset time remaining
        setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    }, 1000); // Update every second

    return () => clearInterval(countdownTimer); // Cleanup on component unmount or nextExam change
  }, [nextExam, exams, findNextExam]); // Re-run if nextExam, exams, or findNextExam changes

  // Helper to format single-digit numbers with leading zero
  const formatTimeValue = (value) => String(value).padStart(2, '0');

  // Define timerComponents using useMemo to optimize re-renders
  const timerComponents = useMemo(() => {
    const components = [];
    Object.keys(timeRemaining).forEach((interval) => {
      // Only render if value is greater than 0, or if it's seconds and there's any time left
      if (timeRemaining[interval] > 0 || (interval === 'seconds' && Object.values(timeRemaining).some(val => val > 0))) {
        components.push(
          <div key={interval} className="countdown-segment">
            <span className="countdown-value">{formatTimeValue(timeRemaining[interval])}</span>
            <span className="countdown-label">{interval}</span>
          </div>
        );
      }
    });
    return components;
  }, [timeRemaining]); // Re-calculate only when timeRemaining changes


  // --- Handlers for opening modals ---
  const handleEditExams = () => {
    setIsEditModalOpen(true);
    console.log("Edit Exams button clicked. isEditModalOpen set to TRUE. Current value:", isEditModalOpen); // Debug log
  };

  const handleSeeAllExams = () => {
    // Check if there are exams to view
    if (exams.length === 0) {
      setFirebaseError("No exams to display. Add some exams first!");
      console.log("See All Exams clicked, but no exams to display. Setting firebaseError."); // Debug log
      return;
    }
    setFirebaseError(null); // Clear previous errors
    setIsViewModalOpen(true); // Open the ViewExamsModal
    console.log("See All Exams button clicked. isViewModalOpen set to TRUE. Current value:", isViewModalOpen); // Debug log
  };

  // --- Handle Save Exams (Add/Update/Delete reconciliation with Firestore) ---
  // This function is passed to EditExamsModal and receives the updated list of exams
  const handleSaveExams = async (updatedExams) => {
    // db, appId, and userId are now from useAuth context. Ensure they are present.
    if (!userId || !db || !appId) {
      console.error("Cannot save exams: User not authenticated or Firestore not ready.");
      setFirebaseError("Authentication required to save exams.");
      return;
    }

    setFirebaseError(null); // Clear previous errors

    try {
      // Create maps for efficient lookup of current and updated exams
      const currentExamsMap = new Map(exams.map(exam => [exam.id, exam])); // Map existing by Firestore ID
      // Map incoming by Firestore ID (for existing) or tempId (for new)
      const updatedExamsMap = new Map(updatedExams.map(exam => [exam.id || exam.tempId, exam]));

      const batchPromises = []; // Array to collect all Firestore write operations

      // 1. Process updated/new exams from the modal
      for (const updatedExam of updatedExams) {
        if (updatedExam.id && currentExamsMap.has(updatedExam.id)) {
          // This exam exists in Firestore (has an 'id') and was in the original list
          // Check if any fields have actually changed before updating
          const currentExam = currentExamsMap.get(updatedExam.id);
          const hasChanged = Object.keys(updatedExam).some(key =>
            // Exclude 'id' and 'tempId' from change detection
            key !== 'id' && key !== 'tempId' && updatedExam[key] !== currentExam[key]
          );

          if (hasChanged) {
            const examDocRef = doc(db, `artifacts/${appId}/users/${userId}/exams`, updatedExam.id);
            // Push an update operation to the batch
            batchPromises.push(updateDoc(examDocRef, {
              subject: updatedExam.subject,
              component: updatedExam.component,
              date: updatedExam.date,
              time: updatedExam.time,
              session: updatedExam.session,
              updatedAt: new Date().toISOString() // Record update timestamp
            }));
            console.log("Dashboard: Queued update for exam ID:", updatedExam.id);
          }
        } else if (updatedExam.tempId && !updatedExam.id) {
          // This is a new exam (has 'tempId' but no Firestore 'id')
          const examsCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/exams`);
          // Push an add operation to the batch
          batchPromises.push(addDoc(examsCollectionRef, {
            subject: updatedExam.subject,
            component: updatedExam.component,
            date: updatedExam.date,
            time: updatedExam.time,
            session: updatedExam.session,
            createdAt: new Date().toISOString() // Record creation timestamp
          }));
          console.log("Dashboard: Queued add for new exam with tempId:", updatedExam.tempId);
        }
      }

      // 2. Process deletions: Find exams that were in the original list but are NOT in the updated list
      for (const currentExam of exams) {
        // Check if the Firestore ID of the current exam exists in the updatedExamsMap keys
        if (!updatedExamsMap.has(currentExam.id)) {
          const examDocRef = doc(db, `artifacts/${appId}/users/${userId}/exams`, currentExam.id);
          // Push a delete operation to the batch
          batchPromises.push(deleteDoc(examDocRef));
          console.log("Dashboard: Queued delete for exam ID:", currentExam.id);
        }
      }

      // Execute all batched Firestore operations simultaneously
      await Promise.all(batchPromises);
      console.log("Dashboard: All exam changes synced to Firestore successfully.");

    } catch (error) {
      console.error("Dashboard: Error saving exams to Firestore:", error);
      setFirebaseError("Failed to save exams. Please try again.");
    } finally {
      setIsEditModalOpen(false); // Always close the modal after attempting save
    }
  };


  // Mock data (keep these for other sections until actual data fetching is implemented)
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

  // Placeholder for recent activity until we have a real activity collection
  // For now, these are hardcoded for display purposes.
  const recentActivity = [
    { id: 'a1', description: "Completed 'Kinematics' in Physics.", timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString() },
    { id: 'a2', description: "Attempted May/June 2023 Paper 1.", timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString() },
    { id: 'a3', description: "Reviewed Chemistry topic 'Stoichiometry'.", timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
    { id: 'a4', description: "Updated 'Forces and Motion' notes.", timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
    { id: 'a5', description: "Set reminder for 'Maths Quiz' next week.", timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString() },
  ];

  console.log("Dashboard Render: currentUser:", !!currentUser, "loading:", loading, "isFirebaseInitialized:", isFirebaseInitialized, "nextExam:", !!nextExam, "exams.length:", exams.length, "userId:", userId); // Primary debug log on render

  // Conditional rendering based on Firebase initialization and authentication state
  if (!isFirebaseInitialized || loading) {
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
    <div className="app">
      <main className="page-container dashboard-page">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-description">Welcome back! Here's a quick overview of your academic journey.</p>

        {firebaseError && (
          <p className="form-message">{firebaseError}</p>
        )}

        <div className="dashboard-grid-container">
          {/* Current Time Widget */}
          <div className="grid-item dashboard-card time-widget">
            <Clock size={40} className="widget-icon" /> {/* Using lucide-react Clock icon */}
            <div className="time-display">
              <div className="current-date">{currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
              <div className="current-time">{currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}</div>
            </div>
          </div>

          {/* Countdown Widget */}
          <div className="grid-item dashboard-card countdown-widget grid-span-2">
            <CalendarClock size={40} className="widget-icon" /> {/* Using lucide-react CalendarClock icon */}
            <h2 className="widget-title">Next Exam Countdown</h2>
            {nextExam ? (
              <>
                <div className="countdown-content">
                  {/* timerComponents is now correctly defined via useMemo */}
                  {timerComponents.length > 0 ? timerComponents : (
                    <p className="no-upcoming-exams">
                        {timeRemaining.days === 0 && timeRemaining.hours === 0 && timeRemaining.minutes === 0 && timeRemaining.seconds === 0
                            ? "Time's up! Exam passed."
                            : "Calculating time..."}
                    </p>
                  )}
                </div>
                {/* Ensure exam details are always displayed if nextExam exists */}
                <div className="exam-details">
                    <h3>{nextExam.subject || 'N/A'} - {nextExam.component || 'N/A'}</h3>
                    <p>Date: {formatDateWithOrdinal(nextExam.date)}</p>
                    {nextExam.time && <p>Time: {nextExam.time} {nextExam.session}</p>}
                </div>
                {/* --- Action Buttons (Now inside countdown-widget, absolutely positioned) --- */}
                <div className="countdown-actions">
                    <button onClick={handleSeeAllExams} className="dashboard-action-btn">
                      <Table size={16} /> See All
                    </button>
                    <button onClick={handleEditExams} className="dashboard-action-btn">
                      <Pencil size={16} /> Edit
                    </button>
                </div>
                {console.log("Dashboard Render: Showing 'See All' and 'Edit' buttons.")} {/* Debug log */}
              </>
            ) : (
              <div className="no-upcoming-exams">
                <p>No upcoming exams scheduled.</p>
                {/* This button should also call handleEditExams to add new exams */}
                <button onClick={handleEditExams} className="dashboard-action-btn">
                  <PlusCircle size={16} /> Add Exams
                </button>
                {console.log("Dashboard Render: Showing 'Add Exams' button.")} {/* Debug log */}
              </div>
            )}
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
            <div className="activity-list dashboard-card">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity) => (
                  <div key={activity.id} className="activity-item">
                    <Bell size={16} className="activity-icon" /> {/* Using lucide-react Bell icon */}
                    <p>{activity.description}</p>
                    {/* Convert ISO string back to readable date for display */}
                    <span className="timestamp">{new Date(activity.timestamp).toLocaleString()}</span>
                  </div>
                ))
              ) : (
                <p className="no-activity">No recent activity yet. Start planning your studies!</p>
              )}
            </div>
          </section>

        </div> {/* End dashboard-grid-container */}

        {/* Modals rendered here, controlled by state */}
        <EditExamsModal
          isOpen={isEditModalOpen}
          onClose={() => { setIsEditModalOpen(false); console.log("Edit Exams modal closed. isEditModalOpen set to FALSE."); }} // Debug log
          onSave={handleSaveExams}
          initialExams={exams} // Pass current exams fetched from Firestore
        />

        <ViewExamsModal // NEW: Render ViewExamsModal
          isOpen={isViewModalOpen}
          onClose={() => { setIsViewModalOpen(false); console.log("View Exams modal closed. isViewModalOpen set to FALSE."); }} // Debug log
          exams={exams} // Pass all exams to the ViewExamsModal
        />
      </main>
      {/* Footer component should also be here */}
    </div>
  );
}

export default Dashboard;
