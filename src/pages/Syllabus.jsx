import React, { useState, useEffect, useCallback } from 'react';
import { collection, query, onSnapshot, addDoc, doc, updateDoc, deleteDoc, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth'; // Import getAuth
import { db, appId } from '../firebaseConfig'; // <-- Corrected: Import appId from firebaseConfig
import { PlusCircle, Search, Edit2, Trash2, CheckCircle, CircleDot, CircleDashed, NotepadText, XCircle } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import './PageStyles.css'; // Your main CSS file

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


function Syllabus() {
  const [userId, setUserId] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  const [selectedSubjectName, setSelectedSubjectName] = useState('');
  const [syllabusItems, setSyllabusItems] = useState([]);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newTopicText, setNewTopicText] = useState('');
  const [searchSubjectTerm, setSearchSubjectTerm] = useState('');
  const [filteredSubjects, setFilteredSubjects] = useState([]);

  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [currentNotes, setCurrentNotes] = useState('');
  const [currentTopicIdForNotes, setCurrentTopicIdForNotes] = useState(null);


  // 1. Get User ID on Auth State Change
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
        setSubjects([]);
        setSyllabusItems([]);
        setSelectedSubjectId(null);
        setSelectedSubjectName('');
      }
    });
    return () => unsubscribe(); // Cleanup auth listener
  }, []);

  // 2. Fetch Subjects for the User
  useEffect(() => {
    if (!userId || !db) return;

    // Use appId in the Firestore path
    const subjectsCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/subjects`);
    const q = query(subjectsCollectionRef);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedSubjects = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSubjects(fetchedSubjects);
      // If a subject was selected and no longer exists, clear selection
      if (selectedSubjectId && !fetchedSubjects.some(s => s.id === selectedSubjectId)) {
        setSelectedSubjectId(null);
        setSelectedSubjectName('');
        setSyllabusItems([]);
      } else if (!selectedSubjectId && fetchedSubjects.length > 0) {
        // Automatically select the first subject if none is selected
        setSelectedSubjectId(fetchedSubjects[0].id);
        setSelectedSubjectName(fetchedSubjects[0].name);
      }
    }, (error) => {
      console.error("Error fetching subjects:", error);
    });

    return () => unsubscribe(); // Cleanup snapshot listener
  }, [userId, db, selectedSubjectId, appId]); // Re-run if userId, db or appId changes

  // 3. Filter Subjects based on search term
  useEffect(() => {
    const term = searchSubjectTerm.toLowerCase();
    setFilteredSubjects(
      subjects.filter(subject => subject.name.toLowerCase().includes(term))
    );
  }, [subjects, searchSubjectTerm]);


  // 4. Fetch Syllabus Items for the Selected Subject
  useEffect(() => {
    if (!userId || !db || !selectedSubjectId) {
      setSyllabusItems([]); // Clear items if no subject selected
      return;
    }

    // Use appId in the Firestore path
    const syllabusItemsCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/subjects/${selectedSubjectId}/syllabusItems`);
    const q = query(syllabusItemsCollectionRef);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedItems = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSyllabusItems(fetchedItems);
    }, (error) => {
      console.error(`Error fetching syllabus items for ${selectedSubjectName}:`, error);
    });

    return () => unsubscribe(); // Cleanup snapshot listener
  }, [userId, db, selectedSubjectId, selectedSubjectName, appId]); // Re-run if userId, db, selectedSubjectId or appId changes

  // Data for the progress chart
  const getChartData = useCallback(() => {
    const statusCounts = syllabusItems.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, { "Not Started": 0, "In Progress": 0, "Mastered": 0 }); // Ensure all statuses are present

    return Object.keys(statusCounts).map(status => ({
      name: status,
      value: statusCounts[status],
    })).filter(data => data.value > 0); // Only show statuses with values > 0
  }, [syllabusItems]);

  const totalTopics = syllabusItems.length;
  const masteredTopicsCount = syllabusItems.filter(item => item.status === 'Mastered').length;
  const masteredPercentage = totalTopics > 0 ? ((masteredTopicsCount / totalTopics) * 100).toFixed(0) : 0;

  // Handlers for Firestore operations

  const handleAddSubject = async () => {
    if (!userId || !newSubjectName.trim()) return;
    try {
      const subjectsCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/subjects`);
      await addDoc(subjectsCollectionRef, {
        name: newSubjectName.trim(),
        createdAt: new Date().toISOString(),
      });
      setNewSubjectName('');
    } catch (e) {
      console.error("Error adding subject: ", e);
    }
  };

  const handleAddTopic = async () => {
    if (!userId || !selectedSubjectId || !newTopicText.trim()) return;
    try {
      const syllabusItemsCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/subjects/${selectedSubjectId}/syllabusItems`);
      await addDoc(syllabusItemsCollectionRef, {
        text: newTopicText.trim(),
        status: 'Not Started', // Default status
        notes: '',
        createdAt: new Date().toISOString(),
      });
      setNewTopicText('');
    } catch (e) {
      console.error("Error adding topic: ", e);
    }
  };

  const handleUpdateTopicStatus = async (itemId, newStatus) => {
    if (!userId || !selectedSubjectId || !itemId) return;
    try {
      const topicDocRef = doc(db, `artifacts/${appId}/users/${userId}/subjects/${selectedSubjectId}/syllabusItems`, itemId);
      await updateDoc(topicDocRef, { status: newStatus });
    } catch (e) {
      console.error("Error updating topic status: ", e);
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
      const topicDocRef = doc(db, `artifacts/${appId}/users/${userId}/subjects/${selectedSubjectId}/syllabusItems`, currentTopicIdForNotes);
      await updateDoc(topicDocRef, { notes: newNotes });
    } catch (e) {
      console.error("Error saving notes: ", e);
    }
    // No need to close modal here, it will be closed by onSave in modal component
  };


  const handleDeleteTopic = async (itemId) => {
    if (window.confirm('Are you sure you want to delete this topic?')) {
      if (!userId || !selectedSubjectId || !itemId) return;
      try {
        const topicDocRef = doc(db, `artifacts/${appId}/users/${userId}/subjects/${selectedSubjectId}/syllabusItems`, itemId);
        await deleteDoc(topicDocRef);
      } catch (e) {
        console.error("Error deleting topic: ", e);
      }
    }
  };

  const handleDeleteSubject = async (subjectIdToDelete) => {
    if (window.confirm('Deleting a subject will also delete all its topics. Are you sure?')) {
      if (!userId || !subjectIdToDelete) return;
      try {
        // Delete all syllabus items within the subject's subcollection first
        const syllabusItemsCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/subjects/${subjectIdToDelete}/syllabusItems`);
        const q = query(syllabusItemsCollectionRef);
        const snapshot = await getDocs(q);
        const deletePromises = [];
        snapshot.docs.forEach((d) => {
          deletePromises.push(deleteDoc(doc(db, `artifacts/${appId}/users/${userId}/subjects/${subjectIdToDelete}/syllabusItems`, d.id)));
        });
        await Promise.all(deletePromises);

        // Then delete the subject document itself
        const subjectDocRef = doc(db, `artifacts/${appId}/users/${userId}/subjects`, subjectIdToDelete);
        await deleteDoc(subjectDocRef);

        // Clear selected subject if it was the one deleted
        if (selectedSubjectId === subjectIdToDelete) {
          setSelectedSubjectId(null);
          setSelectedSubjectName('');
          setSyllabusItems([]);
        }
      } catch (e) {
        console.error("Error deleting subject: ", e);
      }
    }
  };


  return (
    <div className="page-container syllabus-page">
      <h2 className="page-title">Syllabus Checklist</h2>
      <p className="page-description">Track your progress for each subject and topic.</p>

      <div className="syllabus-grid-container">
        {/* Left Column: Subject Management */}
        <div className="syllabus-subjects-panel dashboard-card">
          <h3 className="panel-heading">Your Subjects</h3>
          <div className="add-subject-section">
            <input
              type="text"
              placeholder="Add New Subject (e.g., Biology)"
              value={newSubjectName}
              onChange={(e) => setNewSubjectName(e.target.value)}
              onKeyPress={(e) => { if (e.key === 'Enter') handleAddSubject(); }}
              className="add-subject-input"
            />
            <button onClick={handleAddSubject} className="add-subject-btn">
              <PlusCircle size={18} /> Add
            </button>
          </div>

          <div className="search-subject-section">
            <input
              type="text"
              placeholder="Search Subjects..."
              value={searchSubjectTerm}
              onChange={(e) => setSearchSubjectTerm(e.target.value)}
              className="search-subject-input"
            />
            <Search size={18} className="search-icon" />
          </div>

          <div className="subject-list">
            {filteredSubjects.length > 0 ? (
              filteredSubjects.map(subject => (
                <div
                  key={subject.id}
                  className={`subject-item ${selectedSubjectId === subject.id ? 'selected' : ''}`}
                  onClick={() => {
                    setSelectedSubjectId(subject.id);
                    setSelectedSubjectName(subject.name);
                  }}
                >
                  <span>{subject.name}</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteSubject(subject.id); }}
                    className="delete-subject-btn"
                    title="Delete Subject and all its topics"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            ) : (
              <p className="no-items-message">No subjects found. Add one above!</p>
            )}
          </div>
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
                          <button onClick={() => handleDeleteTopic(item.id)} className="delete-topic-btn" title="Delete Topic">
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
        onClose={() => setIsNotesModal(false)} // Fix: Changed to setIsNotesModal
        initialNotes={currentNotes}
        onSaveNotes={handleSaveNotes}
      />
    </div>
  );
}

export default Syllabus;
