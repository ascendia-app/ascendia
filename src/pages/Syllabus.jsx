// src/pages/Syllabus.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import PropTypes from 'prop-types'; // Needed for NotesModal and ConfirmationModal
import '../PageStyles.css';

// Placeholder for NotesModal - will be replaced with full version later
const NotesModal = ({ isOpen, onClose, topicId, initialNotes, syllabusId }) => {
    if (!isOpen) return null;
    return (
        <div className="modal-overlay active">
            <div className="modal-content notes-modal-content">
                <h3>Notes for Topic: {topicId}</h3>
                <p>Notes content: {initialNotes}</p>
                <button onClick={onClose} className="secondary-btn">Close</button>
            </div>
        </div>
    );
};
NotesModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    topicId: PropTypes.string.isRequired,
    initialNotes: PropTypes.string,
    syllabusId: PropTypes.string.isRequired,
};

// Placeholder for ConfirmationModal - will be replaced with full version later
const ConfirmationModal = ({ isOpen, onClose, onConfirm, message, itemName }) => {
    if (!isOpen) return null;
    return (
        <div className="modal-overlay active">
            <div className="modal-content confirmation-modal-content">
                <h3>Confirm Action</h3>
                <p>{message} <strong>{itemName}</strong>?</p>
                <button onClick={onConfirm} className="primary-gradient">Confirm</button>
                <button onClick={onClose} className="secondary-btn">Cancel</button>
            </div>
        </div>
    );
};
ConfirmationModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired,
    message: PropTypes.string.isRequired,
    itemName: PropTypes.string.isRequired,
};


function Syllabus() {
    const { currentUser, loading } = useAuth();

    if (loading) {
        return (
            <div className="page-container syllabus-page" style={{ justifyContent: 'center', alignItems: 'center' }}>
                <p className="welcome-message loading-pulse" style={{ color: '#ff4d88' }}>Loading syllabus...</p>
            </div>
        );
    }

    if (!currentUser) {
        return (
            <div className="page-container syllabus-page" style={{ justifyContent: 'center', alignItems: 'center' }}>
                <h2 className="page-title">Access Denied</h2>
                <p className="page-description">Please log in or register to view your syllabus.</p>
            </div>
        );
    }

    return (
        <div className="page-container syllabus-page">
            <h1 className="page-title">Syllabus Checklist</h1>
            <p className="page-description">This is your Syllabus page. Full functionality coming soon!</p>
            <div className="dashboard-card" style={{ padding: '20px', textAlign: 'center' }}>
                <h3>Add subjects and topics to get started!</h3>
                <p>Track your progress here.</p>
                <NotesModal isOpen={false} onClose={() => {}} topicId="dummy" initialNotes="dummy" syllabusId="dummy" />
                <ConfirmationModal isOpen={false} onClose={() => {}} onConfirm={() => {}} message="Are you sure?" itemName="item" />
            </div>
        </div>
    );
}

export default Syllabus;
