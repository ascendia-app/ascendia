import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './PageStyles.css'; // Import the consolidated styles

// Import Lucide icons for the buttons
import { PencilLine, Eye } from 'lucide-react'; 

function Countdown() {
  // Placeholder for an upcoming exam. In a real app, this would come from state/props
  // fetched from a database.
  // Format: { name: 'Exam Name', date: 'YYYY-MM-DDTHH:MM:SS' }
  // Example: '2025-07-28T10:00:00' (July 28, 2025, 10:00 AM)
  const [upcomingExam, setUpcomingExam] = useState({
    name: 'Mathematics A-Level Paper 1',
    date: '2025-10-27T09:30:00' // Example: October 27, 2025, 9:30 AM
  });

  const [timeLeft, setTimeLeft] = useState({});

  useEffect(() => {
    // Function to calculate the time left
    const calculateTimeLeft = () => {
      if (!upcomingExam || !upcomingExam.date) {
        return {}; // Return empty if no exam is set
      }

      const difference = +new Date(upcomingExam.date) - +new Date();
      let calculatedTimeLeft = {};

      if (difference > 0) {
        calculatedTimeLeft = {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        };
      } else {
        // If difference is 0 or negative, exam has passed or is ongoing
        calculatedTimeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0, passed: true };
      }
      return calculatedTimeLeft;
    };

    // Set initial time and then update every second
    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    // Cleanup interval on component unmount
    return () => clearInterval(timer);
  }, [upcomingExam]); // Recalculate if upcomingExam changes

  const countdownComponents = [];
  // Ensure that timeLeft object contains all expected properties before iterating
  const timeUnits = ['days', 'hours', 'minutes', 'seconds'];

  // Only render segments if timeLeft is valid and not marked as 'passed'
  if (Object.keys(timeLeft).length > 0 && !timeLeft.passed) {
    for (const unit of timeUnits) {
      countdownComponents.push(
        <div key={unit} className="countdown-segment">
          <span className="countdown-value">
            {timeLeft[unit] < 10 && timeLeft[unit] >= 0 ? `0${timeLeft[unit]}` : timeLeft[unit]}
          </span>
          <span className="countdown-label">{unit.toUpperCase()}</span>
        </div>
      );
    }
  }

  return (
    <div className="page-container countdown-page">
      <h2 className="page-title">Exam Countdown</h2>

      <div className="countdown-widget dashboard-card"> {/* Reusing dashboard-card for consistent styling */}
        <h3 className="widget-title">Upcoming Exam</h3>
        
        {upcomingExam && !timeLeft.passed && Object.keys(timeLeft).length > 0 ? (
          <>
            <p className="exam-details">
              {upcomingExam.name} on {new Date(upcomingExam.date).toLocaleDateString()} at {new Date(upcomingExam.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
            <div className="countdown-content">
              {countdownComponents}
            </div>
          </>
        ) : (
          <p className="no-upcoming-exams">
            {upcomingExam && timeLeft.passed ? `The exam "${upcomingExam.name}" has already passed.` : 'No upcoming exams scheduled.'}
          </p>
        )}
        
        {/* Action Buttons */}
        <div className="countdown-actions">
          <Link to="/edit-exams" className="dashboard-action-btn">
            <PencilLine size={16} /> {/* Lucide Icon for Edit */}
            Edit Exams
          </Link>
          <Link to="/all-exams" className="dashboard-action-btn">
            <Eye size={16} /> {/* Lucide Icon for See All */}
            See All Exams
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Countdown;
