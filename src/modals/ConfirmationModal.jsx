// src/modals/ConfirmationModal.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { XCircle } from 'lucide-react';
import '../ModalStyles.css'; // General modal styles

const ConfirmationModal = ({ isOpen, onClose, onConfirm, message, itemName }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay active">
            <div className="modal-content confirmation-modal-content">
                <div className="modal-header">
                    <h3>Confirm Action</h3>
                    <button onClick={onClose} className="modal-close-btn">
                        <XCircle size={24} />
                    </button>
                </div>
                <div className="modal-body">
                    <p>{message} <strong>{itemName}</strong>?</p>
                </div>
                <div className="modal-footer">
                    <button onClick={onClose} className="modal-cancel-btn secondary-btn">Cancel</button>
                    <button onClick={onConfirm} className="modal-action-btn modal-delete-btn primary-gradient">Yes, Confirm</button>
                </div>
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

export default ConfirmationModal;
