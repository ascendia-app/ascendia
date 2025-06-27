import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { XCircle, PlusCircle, Trash2 } from 'lucide-react';
import '../ModalStyles.css'; 
/**
 * EditExamsModal Component
 *
 * This modal allows users to manage their list of exams. It supports adding new exams,
 * modifying existing exam details, and removing exams. Changes are managed internally
 * and then passed to the parent component for persistence (e.g., Firestore).
 *
 * Props:
 * - isOpen: Boolean, true if the modal should be visible.
 * - onClose: Function, callback to close the modal.
 * - onSave: Function, callback to save the updated list of exams. Receives the array of exams.
 * - initialExams: Array of exam objects, pre-fills the form for editing existing exams.
 * Each exam object should ideally have an 'id' (from Firestore)
 * or a 'tempId' (for newly created unsaved exams).
 */
const EditExamsModal = ({ isOpen, onClose, onSave, initialExams }) => {
  // State to hold the exams being edited within the modal.
  // Deep copy initialExams to prevent direct mutation of the prop.
  const [editedExams, setEditedExams] = useState(JSON.parse(JSON.stringify(initialExams || [])));
  const [error, setError] = useState(''); // State for validation errors within the modal

  // Effect to reset editedExams when the modal opens or initialExams change from parent.
  useEffect(() => {
    setEditedExams(JSON.parse(JSON.stringify(initialExams || [])));
    setError(''); // Clear errors on re-open
  }, [initialExams, isOpen]);

  // If the modal is not open, do not render anything.
  if (!isOpen) return null;

  /**
   * Handles changes to an individual exam field.
   * @param {number} index - The index of the exam in the editedExams array.
   * @param {string} field - The name of the field to update (e.g., 'subject', 'date').
   * @param {string} value - The new value for the field.
   */
  const handleExamChange = (index, field, value) => {
    const updatedExams = [...editedExams];
    updatedExams[index] = { ...updatedExams[index], [field]: value };
    setEditedExams(updatedExams);
  };

  /**
   * Adds a new, empty exam entry to the list.
   * Assigns a temporary ID (`tempId`) for client-side tracking before it gets a Firestore ID.
   */
  const handleAddExam = () => {
    setEditedExams([
      ...editedExams,
      {
        tempId: crypto.randomUUID(), // Unique temporary ID for new entries
        subject: '',
        component: '',
        date: '',
        time: '',
        session: 'AM' // Default session
      }
    ]);
  };

  /**
   * Removes an exam entry from the list based on its index.
   * @param {number} index - The index of the exam to remove.
   */
  const handleRemoveExam = (index) => {
    const updatedExams = editedExams.filter((_, i) => i !== index);
    setEditedExams(updatedExams);
  };

  /**
   * Handles saving the changes. Performs basic validation and then calls the onSave prop.
   */
  const handleSave = () => {
    setError(''); // Clear previous errors

    // Validate each exam entry
    const invalidExams = editedExams.filter(exam =>
      !exam.subject.trim() || !exam.component.trim() || !exam.date.trim()
    );

    if (invalidExams.length > 0) {
      setError('Subject, Component, and Date are compulsory for all exams.');
      return;
    }

    // Filter out any completely empty exam entries that might have been accidentally added
    const cleanedExams = editedExams.filter(exam =>
      exam.subject.trim() || exam.component.trim() || exam.date.trim() || exam.time.trim() || exam.session.trim()
    );
    onSave(cleanedExams); // Pass the cleaned array to the parent component
    onClose(); // Close the modal
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content edit-exams-modal">
        <div className="modal-header">
          <h3>Edit Exams</h3>
          <button onClick={onClose} className="modal-close-btn">
            <XCircle size={24} />
          </button>
        </div>
        <div className="modal-body">
          {error && <p className="form-message">{error}</p>}
          {editedExams.length === 0 && <p className="no-exams-message">No exams added yet. Click 'Add Exam' to get started!</p>}
          {editedExams.map((exam, index) => (
            // Use exam.id (if present) or exam.tempId for the key to ensure stability
            <div key={exam.id || exam.tempId || index} className="exam-entry">
              <div className="form-group-inline">
                <label htmlFor={`subject-${index}`} className="compulsory-field">Subject:</label>
                <input
                  type="text"
                  id={`subject-${index}`}
                  placeholder="e.g., Physics"
                  value={exam.subject}
                  onChange={(e) => handleExamChange(index, 'subject', e.target.value)}
                  required // Compulsory
                />
              </div>
              <div className="form-group-inline">
                <label htmlFor={`component-${index}`} className="compulsory-field">Component:</label>
                <input
                  type="text"
                  id={`component-${index}`}
                  placeholder="e.g., Paper 2"
                  value={exam.component}
                  onChange={(e) => handleExamChange(index, 'component', e.target.value)}
                  required // Compulsory
                />
              </div>
              <div className="form-group-inline">
                <label htmlFor={`date-${index}`} className="compulsory-field">Date:</label>
                <input
                  type="date"
                  id={`date-${index}`}
                  value={exam.date}
                  onChange={(e) => handleExamChange(index, 'date', e.target.value)}
                  required // Compulsory
                />
              </div>
              <div className="form-group-inline">
                <label htmlFor={`time-${index}`}>Time:</label>
                <input
                  type="time"
                  id={`time-${index}`}
                  value={exam.time}
                  onChange={(e) => handleExamChange(index, 'time', e.target.value)}
                  // Not required, but has a default based on session in helper
                />
              </div>
              <div className="form-group-inline">
                <label htmlFor={`session-${index}`} className="compulsory-field">Session:</label>
                <select
                  id={`session-${index}`}
                  value={exam.session}
                  onChange={(e) => handleExamChange(index, 'session', e.target.value)}
                  required // Compulsory
                >
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                  <option value="EV">EV</option>
                </select>
              </div>
              <button onClick={() => handleRemoveExam(index)} className="remove-exam-btn">
                <Trash2 size={18} /> Remove
              </button>
            </div>
          ))}
          <button onClick={handleAddExam} className="add-exam-btn">
            <PlusCircle size={20} /> Add Exam
          </button>
        </div>
        <div className="modal-footer">
          <button onClick={onClose} className="modal-cancel-btn">Cancel</button>
          <button onClick={handleSave} className="modal-save-btn">Save Exams</button>
        </div>
      </div>
    </div>
  );
};

export default EditExamsModal;
