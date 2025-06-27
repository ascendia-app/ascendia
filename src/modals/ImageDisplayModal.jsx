import React from 'react';
import { XCircle, Download } from 'lucide-react'; // Lucide React icons for close and download

/**
 * ImageDisplayModal Component
 *
 * This modal displays an image, typically a generated schedule or chart,
 * and provides an option to download the image.
 *
 * Props:
 * - isOpen: Boolean, true if the modal should be visible.
 * - onClose: Function, callback to close the modal.
 * - imageUrl: String, the data URL or blob URL of the image to display.
 */
const ImageDisplayModal = ({ isOpen, onClose, imageUrl }) => {
  // If the modal is not open, do not render anything.
  if (!isOpen) return null;

  /**
   * Handles downloading the displayed image.
   * Creates a temporary anchor tag and triggers a click to download the image.
   */
  const handleDownloadImage = () => {
    if (!imageUrl) return; // Do nothing if no image URL
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = 'all_exams_schedule.jpg'; // Default filename
    document.body.appendChild(link); // Append to body to make it clickable across browsers
    link.click(); // Programmatically click the link to trigger download
    document.body.removeChild(link); // Clean up the temporary link
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content image-modal-content">
        <div className="modal-header">
          <h3>Your Exam Schedule</h3>
          <button onClick={onClose} className="modal-close-btn">
            <XCircle size={24} />
          </button>
        </div>
        <div className="modal-body image-modal-body">
          {imageUrl ? (
            // Display the image if imageUrl is provided
            <img src={imageUrl} alt="Exam Schedule" className="generated-image" />
          ) : (
            // Show a message if no image is available
            <p className="no-items-message">No image to display.</p>
          )}
        </div>
        <div className="modal-footer">
          <button onClick={handleDownloadImage} className="modal-download-btn" disabled={!imageUrl}>
            <Download size={20} /> Download Image
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageDisplayModal;
