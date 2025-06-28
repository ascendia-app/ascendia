import React from 'react';
import PropTypes from 'prop-types'; // Import PropTypes for type checking
import { XCircle } from 'lucide-react'; // Import the close icon

import '../ModalStyles.css'; // Ensure you have common modal styles in this file
// You might also need PageStyles.css if you use classes like 'submit-button', 'primary-gradient', etc.
// import '../PageStyles.css';

/**
 * ConfirmationModal Component
 * A reusable modal for confirming user actions, especially destructive ones like deletion.
 *
 * Props:
 * - isOpen (boolean): Controls the visibility of the modal.
 * - onClose (function): Callback function to close the modal.
 * - onConfirm (function): Callback function to execute when the user confirms the action.
 * - message (string): The main message displayed in the modal (e.g., "Are you sure you want to delete").
 * - itemName (string): The name of the item being acted upon, to be displayed in the message (e.g., "this topic").
 */
const ConfirmationModal = ({ isOpen, onClose, onConfirm, message, itemName }) => {
    // If the modal is not open, return null to render nothing
    if (!isOpen) {
        return null;
    }

    return (
        // The modal-overlay covers the whole screen with a semi-transparent background
        // The 'active' class (controlled by CSS) makes it visible
        <div className="modal-overlay active">
            {/* The modal-content holds the actual dialog box */}
            <div className="modal-content confirmation-modal-content">
                {/* Header section with title and close button */}
                <div className="modal-header">
                    {/* Title of the confirmation dialog */}
                    <h3>Confirm Deletion</h3>
                    {/* Close button with an X icon */}
                    <button onClick={onClose} className="modal-close-btn">
                        <XCircle size={24} />
                    </button>
                </div>
                {/* Body section containing the confirmation message */}
                <div className="modal-body">
                    {/* Displays the dynamic message and item name */}
                    <p>{message} <strong>{itemName}</strong>?</p>
                </div>
                {/* Footer section with action buttons */}
                <div className="modal-footer">
                    {/* Cancel button to close the modal without confirming */}
                    <button onClick={onClose} className="modal-cancel-btn secondary-btn">Cancel</button>
                    {/* Confirm button to trigger the onConfirm action */}
                    <button onClick={onConfirm} className="modal-action-btn modal-delete-btn primary-gradient">Yes, Delete</button>
                </div>
            </div>
        </div>
    );
};

// PropTypes for type checking to ensure correct prop usage
ConfirmationModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired,
    message: PropTypes.string.isRequired,
    itemName: PropTypes.string.isRequired,
};

export default ConfirmationModal;
