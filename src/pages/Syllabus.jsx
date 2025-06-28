import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { collection, query, onSnapshot, addDoc, doc, updateDoc, deleteDoc, setDoc, getDocs } from 'firebase/firestore';
// REMOVED: import { db, appId } from '../firebaseConfig'; // <-- No longer needed here
import { useAuth } from '../contexts/AuthContext'; // Keep this import!
import { PlusCircle, Trash2, XCircle, ChevronDown, CheckSquare, Square, NotepadText } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import '../PageStyles.css';
import '../ModalStyles.css'; // Ensure modal styles are imported for custom modals

// Predefined subject data by level
const PREDEFINED_SUBJECTS = {
    'O Level': [
        { code: '5054', name: 'Physics' },
        { code: '5070', name: 'Chemistry' },
        { code: '5090', name: 'Biology' },
        { code: '4024', name: 'Mathematics' },
        { code: '2058', name: 'Islamiyat' },
        { code: '2059', name: 'Pakistan Studies' },
        { code: '1123', name: 'English Language' },
        { code: '2281', name: 'Economics' },
        { code: '5014', name: 'Environmental Management' },
        { code: '7100', name: 'Commerce' },
        { code: '2251', name: 'Sociology' },
    ],
    'IGCSE': [
        // Add IGCSE subjects here when provided
        { code: '0610', name: 'Biology' },
        { code: '0620', name: 'Chemistry' },
        { code: '0455', name: 'Economics' },
        { code: '0500', name: 'First Language English' },
        { code: '0580', name: 'Mathematics' },
        { code: '0625', name: 'Physics' },
        { code: '0450', name: 'Business Studies' },
        { code: '0470', name: 'History' },
    ],
    'A Level': [
        // Add A Level subjects here when provided
        { code: '9709', name: 'Mathematics' },
        { code: '9702', name: 'Physics' },
        { code: '9701', name: 'Chemistry' },
        { code: '9700', name: 'Biology' },
        { code: '9618', name: 'Computer Science' },
        { code: '9093', name: 'English Language' },
        { code: '9708', name: 'Economics' },
        { code: '9706', name: 'Accounting' },
        { code: '9609', name: 'Business' },
        { code: '9084', name: 'Law' },
        { code: '9990', name: 'Psychology' },
    ],
};

// Helper for status colors
const STATUS_COLORS = {
    'Not Started': '#ff4d4d', // Red
    'In Progress': '#ffcc33', // Yellow
    'Mastered': '#4CAF50',    // Green
};

// Notes Modal Component (kept as is, but ensure its CSS is robust)
const NotesModal = ({ isOpen, onClose, initialNotes, onSaveNotes }) => {
    const [notes, setNotes] = useState(initialNotes || '');

    useEffect(() => {
        // Reset notes when modal opens with new initialNotes
        setNotes(initialNotes || '');
    }, [initialNotes, isOpen]); // Depend on isOpen too to ensure reset on open

    if (!isOpen) return null;

    const handleSave = () => {
        onSaveNotes(notes);
        onClose();
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content notes-modal-content">
                <div className="modal-header">
                    <h3>Topic Notes</h3>
                    <button onClick={onClose} className="modal-close-btn">
                        <XCircle size={24} />
                    </button>
                </div>
                <div className="modal-body">
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Add your notes here..."
                        rows="8"
                        className="notes-textarea"
                    />
                </div>
                <div className="modal-footer">
                    <button onClick={onClose} className="modal-cancel-btn">Cancel</button>
                    <button onClick={handleSave} className="modal-save-btn">Save Notes</button>
                </div>
            </div>
        </div>
    );
};

// Custom Confirmation Modal Component (kept as is)
const ConfirmationModal = ({ isOpen, onClose, onConfirm, message, itemName }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content confirmation-modal-content">
                <div className="modal-header">
                    <h3>Confirm Deletion</h3>
                    <button onClick={onClose} className="modal-close-btn">
                        <XCircle size={24} />
                    </button>
                </div>
                <div className="modal-body">
                    <p>{message} <strong>{itemName}</strong>?</p>
                </div>
                <div className="modal-footer">
                    <button onClick={onClose} className="modal-cancel-btn">Cancel</button>
                    <button onClick={onConfirm} className="modal-delete-btn">Yes, Delete</button>
                </div>
            </div>
        </div>
    );
};

function Syllabus() {
    // Destructure db, appId, userId directly from useAuth
    const { currentUser, loading, db, appId, userId } = useAuth(); // <-- UPDATED: db, appId, userId now from useAuth

    // REMOVED: const [userId, setUserId] = useState(null); // <-- This state is no longer needed

    const [subjects, setSubjects] = useState([]); // Subjects added by the user (from Firestore)
    const [selectedSubjectId, setSelectedSubjectId] = useState(null);
    const [selectedSubjectName, setSelectedSubjectName] = useState('');
    const [syllabusItems, setSyllabusItems] = useState([]);
    const [firebaseError, setFirebaseError] = useState(null); // State for displaying Firebase errors

    // New states for level-based subject selection
    const [selectedLevel, setSelectedLevel] = useState('O Level'); // Default to O Level
    const [predefinedSubjectsForLevel, setPredefinedSubjectsForLevel] = useState([]);
    const [subjectsToAdd, setSubjectsToAdd] = useState([]); // List of subject codes to be added by user

    const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
    const [currentNotes, setCurrentNotes] = useState('');
    const [currentTopicIdForNotes, setCurrentTopicIdForNotes] = useState(null);

    const [newTopicText, setNewTopicText] = useState(''); // State for adding new topic

    // States for confirmation modal
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [confirmMessage, setConfirmMessage] = useState('');
    const [confirmItemName, setConfirmItemName] = useState('');
    const [confirmAction, setConfirmAction] = useState(null); // Function to call on confirm


    // Update predefined subjects when level changes
    useEffect(() => {
        setPredefinedSubjectsForLevel(PREDEFINED_SUBJECTS[selectedLevel] || []);
        setSubjectsToAdd([]); // Clear selected subjects to add when level changes
        console.log("Syllabus.jsx: Predefined subjects updated for level:", selectedLevel);
    }, [selectedLevel]);

    // Fetch Subjects for the User (from Firestore)
    useEffect(() => {
        // Ensure userId, db, and appId are available before attempting Firestore connection
        if (loading || !userId || !db || !appId) { // <-- Use userId, db, appId from useAuth
            console.log("Syllabus.jsx: Skipping subject fetch - loading:", loading, "userId:", userId, "db:", !!db, "appId:", !!appId);
            setSubjects([]);
            setSelectedSubjectId(null); // Clear selection if no user/db
            setSelectedSubjectName('');
            setSyllabusItems([]);
            return;
        }

        console.log(`Syllabus.jsx: Subscribing to user subjects at path: artifacts/${appId}/users/${userId}/subjects`);
        const subjectsCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/subjects`);
        const q = query(subjectsCollectionRef);

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedSubjects = snapshot.docs.map(doc => ({
                id: doc.id, // Firestore document ID (which is the subject code here)
                ...doc.data()
            }));
            setSubjects(fetchedSubjects);
            console.log("Syllabus.jsx: Fetched subjects:", fetchedSubjects.length);

            // Auto-select first subject if none selected or current selected subject was deleted
            if (!selectedSubjectId || !fetchedSubjects.some(s => s.id === selectedSubjectId)) {
                if (fetchedSubjects.length > 0) {
                    setSelectedSubjectId(fetchedSubjects[0].id);
                    setSelectedSubjectName(fetchedSubjects[0].name);
                    console.log("Syllabus.jsx: Auto-selected first subject:", fetchedSubjects[0].name);
                } else {
                    setSelectedSubjectId(null);
                    setSelectedSubjectName('');
                    setSyllabusItems([]);
                    console.log("Syllabus.jsx: No subjects available, clearing selection.");
                }
            } else {
                // If the selected subject still exists, ensure its name is up-to-date
                const currentSelection = fetchedSubjects.find(s => s.id === selectedSubjectId);
                if (currentSelection && currentSelection.name !== selectedSubjectName) {
                    setSelectedSubjectName(currentSelection.name);
                }
            }
        }, (error) => {
            console.error("Syllabus.jsx: Error fetching subjects:", error);
            setFirebaseError("Failed to load your subjects. Please try again."); // Set error state
        });

        return () => {
            console.log("Syllabus.jsx: Unsubscribing from subjects listener.");
            unsubscribe();
        }
    }, [userId, db, selectedSubjectId, appId, loading]); // <-- Dependencies now correctly reflect useAuth

    // Memoize displayedUserSubjects to avoid unnecessary re-renders
    const displayedUserSubjects = useMemo(() => subjects.sort((a, b) => a.name.localeCompare(b.name)), [subjects]);


    // Fetch Syllabus Items for the Selected Subject
    useEffect(() => {
        // Ensure userId, db, appId, and selectedSubjectId are available
        if (loading || !userId || !db || !appId || !selectedSubjectId) { // <-- Use userId, db, appId from useAuth
            console.log("Syllabus.jsx: Skipping syllabus item fetch - loading:", loading, "userId:", userId, "selectedSubjectId:", selectedSubjectId);
            setSyllabusItems([]);
            return;
        }

        console.log(`Syllabus.jsx: Subscribing to topics for ${selectedSubjectName} at path: artifacts/${appId}/users/${userId}/subjects/${selectedSubjectId}/syllabusItems`);
        const syllabusItemsCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/subjects/${selectedSubjectId}/syllabusItems`);
        const q = query(syllabusItemsCollectionRef);

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedItems = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })).sort((a, b) => a.text.localeCompare(b.text)); // Sort topics alphabetically
            setSyllabusItems(fetchedItems);
            console.log(`Syllabus.jsx: Fetched ${fetchedItems.length} syllabus items for ${selectedSubjectName}.`);
        }, (error) => {
            console.error(`Syllabus.jsx: Error fetching syllabus items for ${selectedSubjectName}:`, error);
            setFirebaseError("Failed to load topics for this subject. Please try again."); // Set error state
        });

        return () => {
            console.log(`Syllabus.jsx: Unsubscribing from topics listener for ${selectedSubjectName}.`);
            unsubscribe();
        }
    }, [userId, db, selectedSubjectId, selectedSubjectName, appId, loading]); // <-- Dependencies now correctly reflect useAuth

    // Data for the progress chart
    const getChartData = useCallback(() => {
        const statusCounts = syllabusItems.reduce((acc, item) => {
            acc[item.status] = (acc[item.status] || 0) + 1;
            return acc;
        }, { "Not Started": 0, "In Progress": 0, "Mastered": 0 });

        // Filter out statuses with 0 value for cleaner chart
        return Object.keys(statusCounts).map(status => ({
            name: status,
            value: statusCounts[status],
        })).filter(data => data.value > 0);
    }, [syllabusItems]);

    const totalTopics = syllabusItems.length;
    const masteredTopicsCount = syllabusItems.filter(item => item.status === 'Mastered').length;
    const masteredPercentage = totalTopics > 0 ? ((masteredTopicsCount / totalTopics) * 100).toFixed(0) : 0;

    // Handlers for Firestore operations

    const handleToggleSubjectToAdd = (subjectCode) => {
        setSubjectsToAdd(prev =>
            prev.includes(subjectCode)
                ? prev.filter(code => code !== subjectCode)
                : [...prev, subjectCode]
        );
    };

    const handleAddSelectedSubjects = async () => {
        if (!userId || !db || !appId || subjectsToAdd.length === 0) { // <-- Use db, appId from useAuth
            console.log("Syllabus.jsx: Cannot add subjects - missing userId, db, appId, or no subjects selected.");
            setFirebaseError("Authentication or database connection error, or no subjects selected.");
            return;
        }
        setFirebaseError(null); // Clear any previous errors

        try {
            const subjectsCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/subjects`);
            const addPromises = subjectsToAdd.map(async (subjectCode) => {
                const subjectData = PREDEFINED_SUBJECTS[selectedLevel].find(s => s.code === subjectCode); // Use selectedLevel
                if (subjectData) {
                    const existingSubject = subjects.find(s => s.id === subjectCode);
                    if (!existingSubject) {
                        console.log(`Syllabus.jsx: Adding predefined subject '${subjectData.name}' (${subjectData.code}) for user ${userId}.`);
                        await setDoc(doc(subjectsCollectionRef, subjectData.code), {
                            name: subjectData.name,
                            level: selectedLevel,
                            createdAt: new Date().toISOString(),
                        });
                    } else {
                        console.log(`Syllabus.jsx: Subject '${subjectData.name}' (${subjectData.code}) already exists, skipping.`);
                    }
                }
            });
            await Promise.all(addPromises);
            setSubjectsToAdd([]);
            // Optionally close the add subjects section/modal if you had one
            // setShowAddSubjectModal(false); // If you add a modal later
            console.log('Syllabus.jsx: Selected subjects added successfully!');
        } catch (e) {
            console.error("Syllabus.jsx: Error adding selected subjects: ", e);
            setFirebaseError('Error adding subjects. Please try again.');
        }
    };


    const handleAddTopic = async () => {
        if (!userId || !db || !appId || !selectedSubjectId || !newTopicText.trim()) { // <-- Use db, appId from useAuth
            setFirebaseError("Please select a subject and enter a topic name.");
            console.log("Syllabus.jsx: Cannot add topic - missing userId, db, appId, selectedSubjectId, or empty topic text.");
            return;
        }
        setFirebaseError(null); // Clear any previous errors

        try {
            console.log(`Syllabus.jsx: Adding topic '${newTopicText.trim()}' to subject ${selectedSubjectName}.`);
            const syllabusItemsCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/subjects/${selectedSubjectId}/syllabusItems`);
            await addDoc(syllabusItemsCollectionRef, {
                text: newTopicText.trim(),
                status: 'Not Started',
                notes: '',
                createdAt: new Date().toISOString(),
            });
            setNewTopicText('');
        } catch (e) {
            console.error("Syllabus.jsx: Error adding topic: ", e);
            setFirebaseError('Error adding topic. Please try again.');
        }
    };

    const handleUpdateTopicStatus = async (itemId, newStatus) => {
        if (!userId || !db || !appId || !selectedSubjectId || !itemId) { // <-- Use db, appId from useAuth
            console.log("Syllabus.jsx: Cannot update topic status - missing userId, db, appId, selectedSubjectId, or itemId.");
            setFirebaseError("Authentication or database error, or invalid topic.");
            return;
        }
        setFirebaseError(null); // Clear any previous errors

        try {
            console.log(`Syllabus.jsx: Updating status of topic ${itemId} to '${newStatus}'.`);
            const topicDocRef = doc(db, `artifacts/${appId}/users/${userId}/subjects/${selectedSubjectId}/syllabusItems`, itemId);
            await updateDoc(topicDocRef, { status: newStatus });
        } catch (e) {
            console.error("Syllabus.jsx: Error updating topic status: ", e);
            setFirebaseError('Error updating topic status. Please try again.');
        }
    };

    const handleOpenNotes = (itemId, notes) => {
        setCurrentTopicIdForNotes(itemId);
        setCurrentNotes(notes);
        setIsNotesModalOpen(true);
    };

    const handleSaveNotes = async (newNotes) => {
        if (!userId || !db || !appId || !selectedSubjectId || !currentTopicIdForNotes) { // <-- Use db, appId from useAuth
            console.log("Syllabus.jsx: Cannot save notes - missing userId, db, appId, selectedSubjectId, or currentTopicIdForNotes.");
            setFirebaseError("Authentication or database error, or invalid topic for notes.");
            return;
        }
        setFirebaseError(null); // Clear any previous errors

        try {
            console.log(`Syllabus.jsx: Saving notes for topic ${currentTopicIdForNotes}.`);
            const topicDocRef = doc(db, `artifacts/${appId}/users/${userId}/subjects/${selectedSubjectId}/syllabusItems`, currentTopicIdForNotes);
            await updateDoc(topicDocRef, { notes: newNotes });
        } catch (e) {
            console.error("Syllabus.jsx: Error saving notes: ", e);
            setFirebaseError('Error saving notes. Please try again.');
        }
    };

    const confirmDeleteTopic = (itemId, topicName) => {
        setConfirmMessage('Are you sure you want to delete this topic:');
        setConfirmItemName(topicName);
        setConfirmAction(() => async () => {
            if (!userId || !db || !appId || !selectedSubjectId || !itemId) { // <-- Use db, appId from useAuth
                console.log("Syllabus.jsx: Cannot delete topic - missing userId, db, appId, selectedSubjectId, or itemId.");
                setFirebaseError("Authentication or database error, or invalid topic for deletion.");
                setIsConfirmModalOpen(false);
                return;
            }
            setFirebaseError(null); // Clear any previous errors
            try {
                console.log(`Syllabus.jsx: Deleting topic ${itemId}.`);
                const topicDocRef = doc(db, `artifacts/${appId}/users/${userId}/subjects/${selectedSubjectId}/syllabusItems`, itemId);
                await deleteDoc(topicDocRef);
                console.log(`Syllabus.jsx: Topic ${itemId} deleted successfully.`);
            } catch (e) {
                console.error("Syllabus.jsx: Error deleting topic: ", e);
                setFirebaseError('Error deleting topic. Please try again.');
            } finally {
                setIsConfirmModalOpen(false); // Close modal after action
            }
        });
        setIsConfirmModalOpen(true);
    };

    const confirmDeleteSubject = (subjectIdToDelete, subjectName) => {
        setConfirmMessage('Are you sure you want to delete this subject (and all its topics):');
        setConfirmItemName(`${subjectName} (${subjectIdToDelete})`);
        setConfirmAction(() => async () => {
            if (!userId || !db || !appId || !subjectIdToDelete) { // <-- Use db, appId from useAuth
                console.log("Syllabus.jsx: Cannot delete subject - missing userId, db, appId, or subjectIdToDelete.");
                setFirebaseError("Authentication or database error, or invalid subject for deletion.");
                setIsConfirmModalOpen(false);
                return;
            }
            setFirebaseError(null); // Clear any previous errors
            try {
                console.log(`Syllabus.jsx: Deleting subject ${subjectIdToDelete} and its topics.`);
                // Delete all syllabus items (topics) within the subject's subcollection first
                const syllabusItemsCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/subjects/${subjectIdToDelete}/syllabusItems`);
                const q = query(syllabusItemsCollectionRef);
                const snapshot = await getDocs(q); // Get all topic documents
                const deletePromises = [];
                snapshot.docs.forEach((d) => {
                    deletePromises.push(deleteDoc(doc(db, `artifacts/${appId}/users/${userId}/subjects/${subjectIdToDelete}/syllabusItems`, d.id)));
                });
                await Promise.all(deletePromises); // Execute all topic deletions

                // Now delete the subject document itself
                const subjectDocRef = doc(db, `artifacts/${appId}/users/${userId}/subjects`, subjectIdToDelete);
                await deleteDoc(subjectDocRef);

                // If the deleted subject was the one currently selected, clear the selection
                if (selectedSubjectId === subjectIdToDelete) {
                    setSelectedSubjectId(null);
                    setSelectedSubjectName('');
                    setSyllabusItems([]);
                }
                console.log(`Syllabus.jsx: Subject ${subjectIdToDelete} and its topics deleted successfully.`);
            } catch (e) {
                console.error("Syllabus.jsx: Error deleting subject: ", e);
                setFirebaseError('Error deleting subject. Please try again.');
            } finally {
                setIsConfirmModalOpen(false); // Close modal after action
            }
        });
        setIsConfirmModalOpen(true);
    };


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
            <h2 className="page-title">Syllabus Checklist</h2>
            <p className="page-description">Track your progress for each subject and topic.</p>

            {firebaseError && (
                <p className="form-message error-message">{firebaseError}</p> // Added specific class for error messages
            )}

            <div className="syllabus-grid-container">
                {/* Left Column: Subject Management */}
                <div className="syllabus-subjects-panel dashboard-card">
                    <h3 className="panel-heading">Your Subjects</h3>
                    <div className="subject-list">
                        {displayedUserSubjects.length > 0 ? (
                            displayedUserSubjects.map(subject => (
                                <div
                                    key={subject.id}
                                    className={`subject-item ${selectedSubjectId === subject.id ? 'selected' : ''}`}
                                    onClick={() => {
                                        setSelectedSubjectId(subject.id);
                                        setSelectedSubjectName(subject.name);
                                    }}
                                >
                                    <span>{subject.name} ({subject.id})</span>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); confirmDeleteSubject(subject.id, subject.name); }}
                                        className="delete-subject-btn"
                                        title="Delete Subject and all its topics"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))
                        ) : (
                            <p className="no-items-message">No subjects added yet. Add some below!</p>
                        )}
                    </div>

                    <hr className="divider" /> {/* Divider between user's subjects and add section */}

                    <h3 className="panel-heading">Add Subjects</h3>
                    <div className="level-select-section">
                        <label htmlFor="select-level" className="select-level-label">Select Level:</label>
                        <div className="custom-select-wrapper">
                            <select
                                id="select-level"
                                value={selectedLevel}
                                onChange={(e) => setSelectedLevel(e.target.value)}
                                className="level-dropdown"
                            >
                                {Object.keys(PREDEFINED_SUBJECTS).map(level => (
                                    <option key={level} value={level}>{level}</option>
                                ))}
                            </select>
                            <ChevronDown size={16} className="dropdown-arrow-icon" />
                        </div>
                    </div>

                    <div className="predefined-subject-list">
                        <h4>{selectedLevel} Subjects:</h4>
                        {predefinedSubjectsForLevel.length > 0 ? (
                            predefinedSubjectsForLevel.map(subject => (
                                <div
                                    key={subject.code}
                                    className={`predefined-subject-item ${subjectsToAdd.includes(subject.code) ? 'selected' : ''}`}
                                    onClick={() => handleToggleSubjectToAdd(subject.code)}
                                >
                                    <span>{subject.name} ({subject.code})</span>
                                    {subjectsToAdd.includes(subject.code) ? (
                                        <CheckSquare size={20} color="#4CAF50" />
                                    ) : (
                                        <Square size={20} color="#999" />
                                    )}
                                </div>
                            ))
                        ) : (
                            <p className="no-items-message">No subjects defined for this level yet.</p>
                        )}
                    </div>
                    {/* Moved Add Selected Subjects Button outside predefined-subject-list */}
                    <button
                        onClick={handleAddSelectedSubjects}
                        className="add-selected-subjects-btn"
                        disabled={subjectsToAdd.length === 0}
                    >
                        <PlusCircle size={18} /> Add Selected Subjects ({subjectsToAdd.length})
                    </button>
                </div>

                {/* Right Column: Syllabus Topics & Progress */}
                <div className="syllabus-content-panel">
                    {selectedSubjectId ? (
                        <>
                            <div className="syllabus-header-with-chart">
                                <h3 className="panel-heading">{selectedSubjectName} Syllabus</h3>
                                {/* Progress Chart */}
                                <div className="progress-chart-container dashboard-card">
                                    <h4>Overall Progress</h4>
                                    {totalTopics > 0 ? (
                                        <ResponsiveContainer width="100%" height={200}>
                                            <PieChart>
                                                <Pie
                                                    data={getChartData()}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={60}
                                                    outerRadius={80}
                                                    fill="#8884d8"
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                    labelLine={false}
                                                >
                                                    {getChartData().map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                                <Legend />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <p className="no-progress-data">No topics added to calculate progress.</p>
                                    )}
                                    <p className="mastered-summary">{masteredPercentage}% Mastered ({masteredTopicsCount}/{totalTopics})</p>
                                </div>
                            </div>

                            <div className="add-topic-section">
                                <input
                                    type="text"
                                    placeholder="Add New Topic (e.g., Kinematics)"
                                    value={newTopicText}
                                    onChange={(e) => setNewTopicText(e.target.value)}
                                    onKeyPress={(e) => { if (e.key === 'Enter') handleAddTopic(); }}
                                    className="add-topic-input"
                                />
                                <button onClick={handleAddTopic} className="add-topic-btn">
                                    <PlusCircle size={18} /> Add Topic
                                </button>
                            </div>

                            <div className="syllabus-items-list">
                                {syllabusItems.length > 0 ? (
                                    syllabusItems.map(item => (
                                        <div key={item.id} className="syllabus-item-card dashboard-card">
                                            <div className="item-main-content">
                                                <span className="item-text">{item.text}</span>
                                                <div className="item-controls">
                                                    <select
                                                        value={item.status}
                                                        onChange={(e) => handleUpdateTopicStatus(item.id, e.target.value)}
                                                        className={`status-dropdown status-${item.status.toLowerCase().replace(' ', '-')}`}
                                                    >
                                                        <option value="Not Started">Not Started</option>
                                                        <option value="In Progress">In Progress</option>
                                                        <option value="Mastered">Mastered</option>
                                                    </select>
                                                    <button onClick={() => handleOpenNotes(item.id, item.notes)} className="notes-btn" title="Add/View Notes">
                                                        <NotepadText size={18} />
                                                    </button>
                                                    <button onClick={() => confirmDeleteTopic(item.id, item.text)} className="delete-topic-btn" title="Delete Topic">
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="no-items-message">No topics added for this subject. Add one above!</p>
                                )}
                            </div>
                        </>
                    ) : (
                        <p className="no-subject-selected-message dashboard-card">Select a subject from the left or add a new one to get started with your syllabus checklist!</p>
                    )}
                </div>
            </div>

            <NotesModal
                isOpen={isNotesModalOpen}
                onClose={() => setIsNotesModalOpen(false)}
                initialNotes={currentNotes}
                onSaveNotes={handleSaveNotes}
            />

            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={confirmAction}
                message={confirmMessage}
                itemName={confirmItemName}
            />
        </div>
    );
}

export default Syllabus;