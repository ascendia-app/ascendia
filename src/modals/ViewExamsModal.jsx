import React, { useEffect, useState } from 'react';
import { FaEdit, FaTrash, FaTimes } from 'react-icons/fa'; // Importing icons for edit, delete, and close

/**
 * ViewExamsModal Component
 *
 * This component displays a list of all exams in a sleek and modern modal window.
 * Users can view details of each exam and perform edit or delete actions.
 * It integrates with the shared modal and exam card CSS styles for a consistent look.
 *
 * Props:
 * - isOpen: Boolean, true if the modal should be visible.
 * - onClose: Function, callback to close the modal.
 * - exams: Array of exam objects, each with properties like id, subject, date, time, notes.
 * - onEditExam: Function, callback to trigger editing an exam. Receives exam ID.
 * - onDeleteExam: Function, callback to trigger deleting an exam. Receives exam ID.
 */
const ViewExamsModal = ({ isOpen, onClose, exams, onEditExam, onDeleteExam }) => {
    // State to control modal animation (active class for transitions)
    const [isActive, setIsActive] = useState(false);

    // useEffect hook to manage modal visibility and animations
    useEffect(() => {
        let timer;
        if (isOpen) {
            // When opening, set isActive to true to trigger fade-in and slide-up animation
            setIsActive(true);
            // Prevent scrolling on the background body when modal is open
            document.body.style.overflow = 'hidden';
        } else {
            // When closing, set isActive to false to trigger fade-out and slide-down animation
            setIsActive(false);
            // Set a timeout to actually remove the component from the DOM after the CSS transition completes
            timer = setTimeout(() => {
                // This callback will typically be used by the parent component to unmount the modal
                // For this example, we don't need a direct unmount mechanism here,
                // as 'isOpen' becoming false will stop rendering if !isActive.
                // However, in complex apps, you might have a state in parent that changes here.
            }, 300); // Matches the transition duration defined in PageStyles.css (.modal-content)
            // Restore scrolling on the background body when modal is closed
            document.body.style.overflow = '';
        }

        // Cleanup function for useEffect: clear the timeout if the component unmounts or isOpen changes again
        return () => {
            if (timer) {
                clearTimeout(timer);
            }
        };
    }, [isOpen]); // Re-run this effect whenever 'isOpen' prop changes

    // If the modal is not open and not in the process of animating out, don't render anything
    // This prevents rendering invisible modals and optimizes performance.
    if (!isOpen && !isActive) {
        return null;
    }

    /**
     * Handles the close action of the modal.
     * Sets isActive to false to trigger the closing animation, then calls the onClose prop
     * after the animation duration.
     */
    const handleClose = () => {
        setIsActive(false);
        setTimeout(onClose, 300); // Wait for the transition to complete before truly closing
    };

    return (
        // Modal Overlay: Covers the entire screen, provides background dimming.
        // Clicks on the overlay outside the modal content will close the modal.
        <div className={`modal-overlay ${isActive ? 'active' : ''}`} onClick={handleClose}>
            {/* Modal Content: The actual dialog box.
                stopPropagation prevents clicks inside the content from closing the modal. */}
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                {/* Modal Header: Contains the title and close button */}
                <div className="modal-header">
                    <h3>All Exams</h3>
                    {/* Close Button: Uses an imported FaTimes icon for a sleek look */}
                    <button className="modal-close-btn" onClick={handleClose}>
                        <FaTimes />
                    </button>
                </div>

                {/* Modal Body: Contains the main content of the modal (list of exams) */}
                <div className="modal-body">
                    {exams && exams.length > 0 ? (
                        // If there are exams, map through them to render individual exam cards
                        <div className="exam-list">
                            {exams.map((exam) => (
                                <div key={exam.id} className="exam-card">
                                    {/* Exam Details Text */}
                                    <div className="exam-details-text">
                                        <h4>{exam.subject}</h4>
                                        <p>Date: {new Date(exam.date).toLocaleDateString()}</p>
                                        <p>Time: {exam.time}</p>
                                        {/* Display notes if available */}
                                        {exam.notes && <p>Notes: {exam.notes}</p>}
                                    </div>
                                    {/* Exam Actions: Edit and Delete buttons */}
                                    <div className="exam-actions">
                                        {/* Edit Button */}
                                        <button
                                            className="exam-action-btn edit"
                                            onClick={() => onEditExam(exam)} // Pass the whole exam object for editing
                                            aria-label={`Edit ${exam.subject}`}
                                        >
                                            <FaEdit />
                                        </button>
                                        {/* Delete Button */}
                                        <button
                                            className="exam-action-btn delete"
                                            onClick={() => onDeleteExam(exam.id)}
                                            aria-label={`Delete ${exam.subject}`}
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        // If no exams are present, display a message
                        <p className="no-exams-message">No exams added yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ViewExamsModal;
