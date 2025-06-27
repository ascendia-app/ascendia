import React, { useState, useEffect } from 'react';
import { getTimeRemaining } from '../utils/dateUtils'; // Corrected import name
import { Settings, Eye } from 'lucide-react'; // Using lucide-react for icons

// Countdown component displays a countdown to the nearest exam.
// It also provides buttons to manage exams.
const Countdown = ({ exams, onEditExams, onSeeAllExams }) => {
    const [nearestExam, setNearestExam] = useState(null);
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    });

    // Effect to find the nearest upcoming exam and set up the countdown
    useEffect(() => {
        if (!exams || exams.length === 0) {
            setNearestExam(null);
            return;
        }

        // Filter for upcoming exams and sort to find the nearest one
        const now = new Date();
        const upcoming = exams.filter(exam => new Date(exam.date) > now);
        upcoming.sort((a, b) => new Date(a.date) - new Date(b.date));

        if (upcoming.length > 0) {
            setNearestExam(upcoming[0]);
        } else {
            setNearestExam(null);
        }
    }, [exams]); // Re-run when exams data changes

    // Effect to update the countdown time every second
    useEffect(() => {
        if (!nearestExam) {
            return;
        }

        const timer = setInterval(() => {
            // Use the correctly imported getTimeRemaining function
            const newTimeLeft = getTimeRemaining(nearestExam.date);
            // If all time components are zero or negative, clear interval and set to zero
            if (Object.values(newTimeLeft).every(val => val <= 0)) {
                clearInterval(timer);
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
                setNearestExam(null); // Clear the nearest exam as it has passed
            } else {
                setTimeLeft(newTimeLeft);
            }
        }, 1000);

        // Cleanup function to clear the interval when component unmounts or exam changes
        return () => clearInterval(timer);
    }, [nearestExam]); // Re-run when the nearest exam changes

    return (
        <div className="dashboard-card countdown-widget grid-item">
            <h3 className="widget-title">Next Exam</h3>
            {nearestExam ? (
                <>
                    {/* This div is the flex container for horizontal arrangement */}
                    <div className="countdown-content">
                        {/* Each of these is a flex item that stacks its own content vertically */}
                        <div className="countdown-segment">
                            <span className="countdown-value">{timeLeft.days}</span>
                            <span className="countdown-label">Days</span>
                        </div>
                        <div className="countdown-segment">
                            <span className="countdown-value">{timeLeft.hours}</span>
                            <span className="countdown-label">Hours</span>
                        </div>
                        <div className="countdown-segment">
                            <span className="countdown-value">{timeLeft.minutes}</span>
                            <span className="countdown-label">Minutes</span>
                        </div>
                        <div className="countdown-segment">
                            <span className="countdown-value">{timeLeft.seconds}</span>
                            <span className="countdown-label">Seconds</span>
                        </div>
                    </div>
                    <p className="exam-details">
                        {nearestExam.name} on {new Date(nearestExam.date).toLocaleDateString()}
                    </p>
                </>
            ) : (
                <p className="no-upcoming-exams">No upcoming exams scheduled.</p>
            )}
            <div className="countdown-actions">
                <button onClick={onEditExams} className="dashboard-action-btn">
                    <Settings size={20} strokeWidth={2} /> {/* Settings icon */}
                    Edit Exams
                </button>
                <button onClick={onSeeAllExams} className="dashboard-action-btn">
                    <Eye size={20} strokeWidth={2} /> {/* Eye icon */}
                    See All
                </button>
            </div>
        </div>
    );
};

export default Countdown;
