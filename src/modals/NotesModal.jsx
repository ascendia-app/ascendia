// src/modals/NotesModal.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { XCircle } from 'lucide-react';
import '../ModalStyles.css'; // General modal styles

const NotesModal = ({ isOpen, onClose, topicId, initialNotes, syllabusId }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay active">
            <div className="modal-content notes-modal-content">
                <div className="modal-header">
                    <h3>Notes for Topic: {topicId}</h3>
                    <button onClick={onClose} className="modal-close-btn">
                        <XCircle size={24} />
                    </button>
                </div>
                <div className="modal-body">
                    <textarea
                        className="notes-textarea"
                        value={initialNotes || ''}
                        readOnly // Make read-only for placeholder
                        placeholder="Type your notes here..."
                    />
                </div>
                <div className="modal-footer">
                    <button onClick={onClose} className="modal-cancel-btn secondary-btn">Close</button>
                    <button className="modal-action-btn primary-gradient" disabled>Save (Dummy)</button>
                </div>
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

export default NotesModal;
