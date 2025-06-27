import React from 'react';
import PropTypes from 'prop-types';
import { XCircle, Download } from 'lucide-react';
import '../ModalStyles.css';

// Helper function to format date as "Month Day, Year" (e.g., "July 15, 2025")
const formatDateForDisplay = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

// Helper function to format date as "YYYY-MM-DD" for CSV export
const formatDateForCSV = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // Gets YYYY-MM-DD
};

const ViewExamsModal = ({ isOpen, onClose, exams }) => {
    if (!isOpen) return null; // Don't render anything if the modal is not open

    // Sort exams by date for consistent display
    const sortedExams = [...exams].sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return dateA - dateB;
    });

    const handleDownloadCSV = () => {
        const headers = ["Subject", "Component", "Date", "Time", "Session"];
        const rows = sortedExams.map(exam => [
            exam.subject || '',
            exam.component || '',
            formatDateForCSV(exam.date), // Use CSV specific date format
            exam.time || '',
            exam.session || ''
        ]);

        let csvContent = headers.map(h => `"${h}"`).join(",") + "\n"; // Quote headers
        rows.forEach(row => {
            csvContent += row.map(e => `"${String(e).replace(/"/g, '""')}"`).join(",") + "\n"; // Quote and escape content
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        if (link.download !== undefined) { // Feature detection for download attribute
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", "ascendia_exams.csv");
            link.style.visibility = 'hidden'; // Hide the link
            document.body.appendChild(link); // Append to body to make it clickable
            link.click(); // Programmatically click the link
            document.body.removeChild(link); // Remove the link after download
            URL.revokeObjectURL(url); // Clean up the URL object
        } else {
            alert("Your browser does not support downloading files directly. Please copy the data manually.");
        }
    };

    return (
        <div className="modal-overlay active">
            <div className="modal-content large-modal"> {/* Added large-modal class */}
                <button className="modal-close-btn" onClick={onClose}>
                    <XCircle size={24} />
                </button>
                <h2 className="modal-title">All Scheduled Exams</h2>

                {sortedExams && sortedExams.length > 0 ? (
                    <>
                        <div className="modal-table-container">
                            <table className="exams-table">
                                <thead>
                                    <tr>
                                        <th>Subject</th>
                                        <th>Component</th>
                                        <th>Date</th>
                                        <th>Time</th>
                                        <th>Session</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedExams.map((exam) => (
                                        <tr key={exam.id || exam.tempId}>
                                            <td>{exam.subject || '-'}</td>
                                            <td>{exam.component || '-'}</td>
                                            <td>{formatDateForDisplay(exam.date)}</td>
                                            <td>{exam.time || '-'}</td>
                                            <td>{exam.session || '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <button onClick={handleDownloadCSV} className="modal-action-btn download-btn">
                            <Download size={18} /> Download CSV
                        </button>
                    </>
                ) : (
                    <p className="no-exams-message">No exams scheduled yet. Click "Edit Exams" to add some!</p>
                )}
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
