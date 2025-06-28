// src/modals/ViewExamsModal.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { XCircle } from 'lucide-react';
import '../ModalStyles.css'; // General modal styles

const ViewExamsModal = ({ isOpen, onClose, exams }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay active">
            <div className="modal-content large-modal">
                <div className="modal-header">
                    <h3>View All Exams</h3>
                    <button onClick={onClose} className="modal-close-btn">
                        <XCircle size={24} />
                    </button>
                </div>
                <div className="modal-body">
                    <p>This is the View All Exams Modal.</p>
                    <p>Number of exams: {exams ? exams.length : 0}</p>
                    {exams && exams.length > 0 ? (
                        <ul>
                            {exams.map((exam, index) => (
                                <li key={exam.id || index}>{exam.subject} - {exam.component} ({exam.date})</li>
                            ))}
                        </ul>
                    ) : (
                        <p>No exams to display.</p>
                    )}
                </div>
                <div className="modal-footer">
                    <button onClick={onClose} className="modal-action-btn secondary-btn">Close</button>
                </div>
            </div>
        </div>
    );
};

ViewExamsModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    exams: PropTypes.array.isRequired,
};

export default ViewExamsModal;
