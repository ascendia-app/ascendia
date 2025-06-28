// src/modals/EditExamsModal.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { XCircle } from 'lucide-react';
import '../ModalStyles.css'; // General modal styles

const EditExamsModal = ({ isOpen, onClose, onSave, initialExams }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay active">
            <div className="modal-content large-modal">
                <div className="modal-header">
                    <h3>Edit Exams</h3>
                    <button onClick={onClose} className="modal-close-btn">
                        <XCircle size={24} />
                    </button>
                </div>
                <div className="modal-body">
                    <p>This is the Edit Exams Modal.</p>
                    <p>Initial Exams passed: {initialExams ? initialExams.length : 0}</p>
                </div>
                <div className="modal-footer">
                    <button onClick={onClose} className="modal-cancel-btn secondary-btn">Cancel</button>
                    <button onClick={() => onSave([])} className="modal-action-btn primary-gradient">Save Exams (Dummy)</button>
                </div>
            </div>
        </div>
    );
};

EditExamsModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    initialExams: PropTypes.array.isRequired,
};

export default EditExamsModal;
