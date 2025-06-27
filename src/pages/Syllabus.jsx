import React, { useState, useEffect, useCallback } from 'react';
import { collection, query, onSnapshot, addDoc, doc, updateDoc, deleteDoc, setDoc, getDocs } from 'firebase/firestore'; // Added setDoc
import { db, appId } from '../firebaseConfig';
import { useAuth } from '../contexts/AuthContext';
import { PlusCircle, Search, Edit2, Trash2, CheckCircle, CircleDot, CircleDashed, NotepadText, XCircle, ChevronDown, CheckSquare, Square } from 'lucide-react'; // Added new icons
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import './PageStyles.css';

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
  ],
  'A Level': [
    // Add A Level subjects here when provided
  ],
};

// Helper for status colors
const STATUS_COLORS = {
  'Not Started': '#ff4d4d', // Red
  'In Progress': '#ffcc33', // Yellow
  'Mastered': '#4CAF50',    // Green
};

// Notes Modal Component
const NotesModal = ({ isOpen, onClose, initialNotes, onSaveNotes }) => {
  const [notes, setNotes] = useState(initialNotes || '');

  useEffect(() => {
    setNotes(initialNotes || '');
  }, [initialNotes, isOpen]);

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

// Custom Confirmation Modal Component
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
          <p>{message} {itemName}?</p> {/* Removed asterisks and quotes from itemName */}
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
  const { currentUser, loading } = useAuth();
  const [userId, setUserId] = useState(null);
  const [subjects, setSubjects] = useState([]); // Subjects added by the user (from Firestore)
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  const [selectedSubjectName, setSelectedSubjectName] = useState('');
  const [syllabusItems, setSyllabusItems] = useState([]);

  // New states for level-based subject selection
  const [selectedLevel, setSelectedLevel] = useState('O Level'); // Default to O Level
  const [predefinedSubjectsForLevel, setPredefinedSubjectsForLevel] = useState([]);
  const [subjectsToAdd, setSubjectsToAdd] = useState([]); // List of subject codes to be added by user
  // const [searchSubjectTerm, setSearchSubjectTerm] = useState(''); // Removed search term state

  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [currentNotes, setCurrentNotes] = useState('');
  const [currentTopicIdForNotes, setCurrentTopicIdForNotes] = useState(null);

  const [newTopicText, setNewTopicText] = useState(''); // State for adding new topic

  // States for confirmation modal
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmItemName, setConfirmItemName] = useState('');
  const [confirmAction, setConfirmAction] = useState(null); // Function to call on confirm


  // Set userId from AuthContext
  useEffect(() => {
    if (!loading) {
      if (currentUser) {
        setUserId(currentUser.uid);
        console.log("Syllabus.jsx: User ID set:", currentUser.uid);
      } else {
        setUserId(null);
        console.log("Syllabus.jsx: User not authenticated.");
        setSubjects([]);
        setSyllabusItems([]);
        setSelectedSubjectId(null);
        setSelectedSubjectName('');
      }
    }
  }, [currentUser, loading]);

  // Update predefined subjects when level changes
  useEffect(() => {
    setPredefinedSubjectsForLevel(PREDEFINED_SUBJECTS[selectedLevel] || []);
    setSubjectsToAdd([]); // Clear selected subjects to add when level changes
  }, [selectedLevel]);

  // Fetch Subjects for the User (from Firestore)
  useEffect(() => {
    if (loading || !userId || !db) {
      console.log("Syllabus.jsx: Skipping subject fetch - loading:", loading, "userId:", userId);
      setSubjects([]);
      return;
    }

    console.log(`Syllabus.jsx: Attempting to subscribe to subjects at path: artifacts/${appId}/users/${userId}/subjects`);
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
      }
    }, (error) => {
      console.error("Syllabus.jsx: Error fetching subjects:", error);
    });

    return () => {
      console.log("Syllabus.jsx: Unsubscribing from subjects listener.");
      unsubscribe();
    }
  }, [userId, db, selectedSubjectId, appId, loading]);

  // Filter Subjects based on search term (for user's added subjects) - No longer using search term directly
  // const filteredUserSubjects = subjects.filter(subject =>
  //   subject.name.toLowerCase().includes(searchSubjectTerm.toLowerCase()) ||
  //   subject.id.toLowerCase().includes(searchSubjectTerm.toLowerCase())
  // );
  // Now, `filteredUserSubjects` will simply be `subjects` as search is removed
  const displayedUserSubjects = subjects;


  // Fetch Syllabus Items for the Selected Subject
  useEffect(() => {
    if (loading || !userId || !db || !selectedSubjectId) {
      console.log("Syllabus.jsx: Skipping syllabus item fetch - loading:", loading, "userId:", userId, "selectedSubjectId:", selectedSubjectId);
      setSyllabusItems([]);
      return;
    }

    console.log(`Syllabus.jsx: Attempting to subscribe to topics for ${selectedSubjectName} at path: artifacts/${appId}/users/${userId}/subjects/${selectedSubjectId}/syllabusItems`);
    const syllabusItemsCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/subjects/${selectedSubjectId}/syllabusItems`);
    const q = query(syllabusItemsCollectionRef);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedItems = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSyllabusItems(fetchedItems);
      console.log(`Syllabus.jsx: Fetched ${fetchedItems.length} syllabus items for ${selectedSubjectName}.`);
    }, (error) => {
      console.error(`Syllabus.jsx: Error fetching syllabus items for ${selectedSubjectName}:`, error);
    });

    return () => {
      console.log(`Syllabus.jsx: Unsubscribing from topics listener for ${selectedSubjectName}.`);
      unsubscribe();
    }
  }, [userId, db, selectedSubjectId, selectedSubjectName, appId, loading]);

  // Data for the progress chart
  const getChartData = useCallback(() => {
    const statusCounts = syllabusItems.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, { "Not Started": 0, "In Progress": 0, "Mastered": 0 });

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
    if (!userId || subjectsToAdd.length === 0) return;
    try {
      const subjectsCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/subjects`);
      const addPromises = subjectsToAdd.map(async (subjectCode) => {
        // Find the full subject object from the predefined list
        const subjectData = predefinedSubjectsForLevel.find(s => s.code === subjectCode);
        if (subjectData) {
          // Check if subject already exists in user's Firestore list to prevent re-adding
          const existingSubject = subjects.find(s => s.id === subjectCode);
          if (!existingSubject) {
            console.log(`Syllabus.jsx: Adding predefined subject '${subjectData.name}' (${subjectData.code}) for user ${userId}.`);
            await setDoc(doc(subjectsCollectionRef, subjectData.code), { // Use setDoc with explicit ID
              name: subjectData.name,
              level: selectedLevel, // Store the level
              createdAt: new Date().toISOString(),
            });
          } else {
            console.log(`Syllabus.jsx: Subject '${subjectData.name}' (${subjectData.code}) already exists, skipping.`);
          }
        }
      });
      await Promise.all(addPromises);
      setSubjectsToAdd([]); // Clear selections after adding
      // Use a non-alert message for user feedback
      console.log('Selected subjects added successfully!');
    } catch (e) {
      console.error("Syllabus.jsx: Error adding selected subjects: ", e);
      console.error('Error adding subjects. Please try again.');
    }
  };


  const handleAddTopic = async () => {
    if (!userId || !selectedSubjectId || !newTopicText.trim()) return;
    try {
      console.log(`Syllabus.jsx: Adding topic '${newTopicText.trim()}' to subject ${selectedSubjectName}.`);
      const syllabusItemsCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/subjects/${selectedSubjectId}/syllabusItems`);
      await addDoc(syllabusItemsCollectionRef, {
        text: newTopicText.trim(),
        status: 'Not Started', // Default status
        notes: '',
        createdAt: new Date().toISOString(),
      });
      setNewTopicText('');
    } catch (e) {
      console.error("Syllabus.jsx: Error adding topic: ", e);
    }
  };

  const handleUpdateTopicStatus = async (itemId, newStatus) => {
    if (!userId || !selectedSubjectId || !itemId) return;
    try {
      console.log(`Syllabus.jsx: Updating status of topic ${itemId} to '${newStatus}'.`);
      const topicDocRef = doc(db, `artifacts/${appId}/users/${userId}/subjects/${selectedSubjectId}/syllabusItems`, itemId);
      await updateDoc(topicDocRef, { status: newStatus });
    } catch (e) {
      console.error("Syllabus.jsx: Error updating topic status: ", e);
    }
  };

  const handleOpenNotes = (itemId, notes) => {
    setCurrentTopicIdForNotes(itemId);
    setCurrentNotes(notes);
    setIsNotesModalOpen(true);
  };

  const handleSaveNotes = async (newNotes) => {
    if (!userId || !selectedSubjectId || !currentTopicIdForNotes) return;
    try {
      console.log(`Syllabus.jsx: Saving notes for topic ${currentTopicIdForNotes}.`);
      const topicDocRef = doc(db, `artifacts/${appId}/users/${userId}/subjects/${selectedSubjectId}/syllabusItems`, currentTopicIdForNotes);
      await updateDoc(topicDocRef, { notes: newNotes });
    } catch (e) {
      console.error("Syllabus.jsx: Error saving notes: ", e);
    }
  };

  // Function to open delete topic confirmation modal
  const confirmDeleteTopic = (itemId, topicName) => {
    setConfirmMessage('Are you sure you want to delete this topic:');
    setConfirmItemName(topicName); // Removed quotes and asterisks
    setConfirmAction(() => async () => {
      if (!userId || !selectedSubjectId || !itemId) return;
      try {
        console.log(`Syllabus.jsx: Deleting topic ${itemId}.`);
        const topicDocRef = doc(db, `artifacts/${appId}/users/${userId}/subjects/${selectedSubjectId}/syllabusItems`, itemId);
        await deleteDoc(topicDocRef);
        console.log(`Syllabus.jsx: Topic ${itemId} deleted successfully.`);
      } catch (e) {
        console.error("Syllabus.jsx: Error deleting topic: ", e);
      } finally {
        setIsConfirmModalOpen(false); // Close modal after action
      }
    });
    setIsConfirmModalOpen(true); // Open modal
  };

  // Function to open delete subject confirmation modal
  const confirmDeleteSubject = (subjectIdToDelete, subjectName) => {
    setConfirmMessage('Are you sure you want to delete this subject (and all its topics):');
    setConfirmItemName(`${subjectName} (${subjectIdToDelete})`); // Removed quotes and asterisks
    setConfirmAction(() => async () => {
      if (!userId || !subjectIdToDelete) return;
      try {
        console.log(`Syllabus.jsx: Deleting subject ${subjectIdToDelete} and its topics.`);
        const syllabusItemsCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/subjects/${subjectIdToDelete}/syllabusItems`);
        const q = query(syllabusItemsCollectionRef);
        const snapshot = await getDocs(q);
        const deletePromises = [];
        snapshot.docs.forEach((d) => {
          deletePromises.push(deleteDoc(doc(db, `artifacts/${appId}/users/${userId}/subjects/${subjectIdToDelete}/syllabusItems`, d.id)));
        });
        await Promise.all(deletePromises);

        const subjectDocRef = doc(db, `artifacts/${appId}/users/${userId}/subjects`, subjectIdToDelete);
        await deleteDoc(subjectDocRef);

        if (selectedSubjectId === subjectIdToDelete) {
          setSelectedSubjectId(null);
          setSelectedSubjectName('');
          setSyllabusItems([]);
        }
        console.log(`Syllabus.jsx: Subject ${subjectIdToDelete} deleted successfully.`);
      } catch (e) {
        console.error("Syllabus.jsx: Error deleting subject: ", e);
      } finally {
        setIsConfirmModalOpen(false); // Close modal after action
      }
    });
    setIsConfirmModalOpen(true); // Open modal
  };


  return (
    <div className="page-container syllabus-page">
      <h2 className="page-title">Syllabus Checklist</h2>
      <p className="page-description">Track your progress for each subject and topic.</p>

      <div className="syllabus-grid-container">
        {/* Left Column: Subject Management */}
        <div className="syllabus-subjects-panel dashboard-card">

          <h3 className="panel-heading">Your Subjects</h3>
          <div className="subject-list">
            {loading ? (
              <p className="loading-message">Loading your subjects...</p>
            ) : displayedUserSubjects.length > 0 ? (
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
            <div className="custom-select-wrapper"> {/* New wrapper for custom arrow styling */}
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
              <ChevronDown size={16} className="dropdown-arrow-icon" /> {/* Small arrow icon */}
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
          {loading ? (
            <p className="loading-message dashboard-card">Loading syllabus data...</p>
          ) : selectedSubjectId ? (
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
