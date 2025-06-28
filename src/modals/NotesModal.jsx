import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FileText, XCircle, Save, Loader2 } from 'lucide-react'; // Added Save and Loader2 icons
import { doc, updateDoc } from 'firebase/firestore'; // Import Firestore functions

import { useAuth } from '../contexts/AuthContext'; // To get db instance
import '../ModalStyles.css'; // Common modal styles

/**
 * NotesModal Component
 * Allows users to view and edit notes for a specific syllabus topic.
 *
 * Props:
 * - isOpen (boolean): Controls the visibility of the modal.
 * - onClose (function): Callback function to close the modal.
 * - topicId (string): The ID of the syllabus topic to which these notes belong.
 * - initialNotes (string): The notes content to pre-fill the textarea with.
 * - syllabusId (string): The ID of the syllabus document (e.g., 'Physics-101').
 */
const NotesModal = ({ isOpen, onClose, topicId, initialNotes, syllabusId }) => {
    const { db, appId, userId, currentUser } = useAuth(); // Get db, appId, userId from useAuth
    const [notesContent, setNotesContent] = useState(initialNotes || '');
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState(null);
    const [saveSuccess, setSaveSuccess] = useState(false);

    // Update notes content when initialNotes prop changes (e.g., when opening for a new topic)
    useEffect(() => {
        setNotesContent(initialNotes || '');
        setSaveError(null);
        setSaveSuccess(false);
    }, [initialNotes, isOpen]); // Reset state when modal opens or initialNotes changes

    // If the modal is not open, return null to render nothing
    if (!isOpen) {
        return null;
    }

    const handleSaveNotes = async () => {
        if (!db || !appId || !userId || !currentUser) {
            setSaveError("Firebase not initialized or user not logged in.");
            return;
        }

        setIsSaving(true);
        setSaveError(null);
        setSaveSuccess(false);

        try {
            // Construct the Firestore document reference for the specific topic within the user's syllabus
            const topicDocRef = doc(db, `artifacts/${appId}/users/${userId}/syllabuses/${syllabusId}/topics`, topicId);

            // Update the 'notes' field for this topic
            await updateDoc(topicDocRef, {
                notes: notesContent,
            });

            setSaveSuccess(true);
            console.log(`Notes for topic ${topicId} saved successfully.`);
            // Optionally, you might want to call a prop function like onNotesSaved() here
            // if Syllabus.jsx needs to refetch or update state after save.
            setTimeout(() => { // Briefly show success, then close or reset
                setSaveSuccess(false);
                onClose(); // Close the modal after successful save
            }, 1000);
        } catch (error) {
            console.error("Error saving notes:", error);
            setSaveError("Failed to save notes. Please try again.");
            setSaveSuccess(false);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="modal-overlay active">
            <div className="modal-content notes-modal-content">
                <div className="modal-header">
                    <h3><FileText size={24} /> Notes for Topic {topicId}</h3>
                    <button onClick={onClose} className="modal-close-btn">
                        <XCircle size={24} />
                    </button>
                </div>
                <div className="modal-body">
                    <textarea
                        className="notes-textarea"
                        value={notesContent}
                        onChange={(e) => setNotesContent(e.target.value)}
                        placeholder="Type your notes here..."
                    />
                    {saveError && <p className="form-message error-message">{saveError}</p>}
                    {saveSuccess && <p className="form-message success-message">Notes saved successfully!</p>}
                </div>
                <div className="modal-footer">
                    <button onClick={onClose} className="modal-cancel-btn secondary-btn" disabled={isSaving}>
                        Cancel
                    </button>
                    <button
                        onClick={handleSaveNotes}
                        className="modal-action-btn primary-gradient"
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <>
                                <Loader2 size={20} className="loading-spinner" /> Saving...
                            </>
                        ) : (
                            <>
                                <Save size={20} /> Save Notes
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

NotesModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    topicId: PropTypes.string.isRequired,
    initialNotes: PropTypes.string, // Can be empty initially
    syllabusId: PropTypes.string.isRequired, // syllabusId is now required for the Firestore path
};

export default NotesModal;