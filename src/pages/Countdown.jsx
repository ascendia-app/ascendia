import React, { useState, useEffect } from 'react';
import { getTimeRemaining } from '../utils/dateUtils';
import { Settings, Eye } from 'lucide-react';
import PropTypes from 'prop-types';

const Countdown = ({ exams, onEditExams, onSeeAllExams }) => {
    const [nearestExam, setNearestExam] = useState(null);
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
    });

    useEffect(() => {
        if (!exams || exams.length === 0) {
            setNearestExam(null);
            return;
        }

        const now = new Date();
        const upcoming = exams.filter(exam => {
            const examDate = new Date(exam.date);
            return !isNaN(examDate) && examDate > now;
        });
        upcoming.sort((a, b) => new Date(a.date) - new Date(b.date));

        if (upcoming.length > 0) {
            setNearestExam(upcoming[0]);
        } else {
            setNearestExam(null);
        }
    }, [exams]);

    useEffect(() => {
        if (!nearestExam) {
            return;
        }

        const updateTimer = () => {
            const newTimeLeft = getTimeRemaining(nearestExam.date);
            if (!newTimeLeft || Object.values(newTimeLeft).some(val => isNaN(val))) {
                console.error('Invalid time remaining data:', newTimeLeft);
                return;
            }
            if (Object.values(newTimeLeft).every(val => val <= 0)) {
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
                setNearestExam(null);
                return;
            }
            setTimeLeft(newTimeLeft);
        };

        updateTimer(); // Run immediately
        const timer = setInterval(updateTimer, 1000);

        return () => clearInterval(timer);
    }, [nearestExam]);

    return (
        <div className="dashboard-card countdown-widget grid-item">
            <h3 className="widget-title">Next Exam</h3>
            {nearestExam ? (
                <>
                    <div className="countdown-content">
                        <div className="countdown-segment">
                            <span className="countdown-value">{timeLeft.days.toString().padStart(2, '0')}</span>
                            <span className="countdown-label">Days</span>
                        </div>
                        <div className="countdown-segment">
                            <span className="countdown-value">{timeLeft.hours.toString().padStart(2, '0')}</span>
                            <span className="countdown-label">Hours</span>
                        </div>
                        <div className="countdown-segment">
                            <span className="countdown-value">{timeLeft.minutes.toString().padStart(2, '0')}</span>
                            <span className="countdown-label">Minutes</span>
                        </div>
                        <div className="countdown-segment">
                            <span className="countdown-value">{timeLeft.seconds.toString().padStart(2, '0')}</span>
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
                    <Settings size={20} strokeWidth={2} /> Edit Exams
                </button>
                <button onClick={onSeeAllExams} className="dashboard-action-btn">
                    <Eye size={20} strokeWidth={2} /> See All
                </button>
            </div>
        </div>
    );
};

Countdown.propTypes = {
    exams: PropTypes.arrayOf(PropTypes.shape({
        date: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
    })),
    onEditExams: PropTypes.func.isRequired,
    onSeeAllExams: PropTypes.func.isRequired,
};

export default Countdown;