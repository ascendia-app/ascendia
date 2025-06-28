// src/pages/Profile.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore'; // Import necessary Firestore functions
import { Link } from 'react-router-dom';
import '../PageStyles.css';

function Profile() {
    const { currentUser, loading, db, appId, userId, isFirebaseInitialized } = useAuth();
    const [username, setUsername] = useState('');
    const [originalUsername, setOriginalUsername] = useState('');
    const [profileLoading, setProfileLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    useEffect(() => {
        const fetchUserProfile = async () => {
            if (!isFirebaseInitialized || !db || !appId || !userId || !currentUser) {
                console.log("Profile: Skipping profile fetch. Firebase not ready.");
                setProfileLoading(false);
                return;
            }

            setProfileLoading(true);
            setError(null);
            setSuccessMessage(null);

            try {
                const userProfileRef = doc(db, `artifacts/${appId}/users/${userId}/profile/data`);
                const docSnap = await getDoc(userProfileRef);

                if (docSnap.exists() && docSnap.data()) {
                    const data = docSnap.data();
                    setUsername(data.username || (currentUser.email ? currentUser.email.split('@')[0] : 'User'));
                    setOriginalUsername(data.username || (currentUser.email ? currentUser.email.split('@')[0] : 'User'));
                } else {
                    // If profile doesn't exist, create a basic one
                    const defaultUsername = currentUser.email ? currentUser.email.split('@')[0] : 'User';
                    await setDoc(userProfileRef, {
                        username: defaultUsername,
                        email: currentUser.email,
                        createdAt: new Date().toISOString()
                    });
                    setUsername(defaultUsername);
                    setOriginalUsername(defaultUsername);
                    console.log("Profile: Created new profile document for user.");
                }
            } catch (err) {
                console.error("Profile: Error fetching/creating user profile:", err);
                setError("Failed to load profile. Please try again.");
                setUsername(currentUser.email ? currentUser.email.split('@')[0] : 'User'); // Fallback
                setOriginalUsername(currentUser.email ? currentUser.email.split('@')[0] : 'User');
            } finally {
                setProfileLoading(false);
            }
        };

        if (currentUser && !loading) {
            fetchUserProfile();
        } else if (!currentUser && !loading) {
            setProfileLoading(false);
        }
    }, [currentUser, loading, db, appId, userId, isFirebaseInitialized]);

    const handleUpdateUsername = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);

        if (!username.trim()) {
            setError("Username cannot be empty.");
            return;
        }
        if (username === originalUsername) {
            setError("No changes detected.");
            return;
        }

        if (!db || !appId || !userId || !currentUser) {
            setError("Firebase not initialized or user not authenticated.");
            return;
        }

        setProfileLoading(true); // Indicate saving process
        try {
            const userProfileRef = doc(db, `artifacts/${appId}/users/${userId}/profile/data`);
            await updateDoc(userProfileRef, {
                username: username.trim(),
                updatedAt: new Date().toISOString()
            });
            setOriginalUsername(username.trim()); // Update original username
            setSuccessMessage("Username updated successfully!");
            console.log("Profile: Username updated to:", username.trim());
        } catch (err) {
            console.error("Profile: Error updating username:", err);
            setError("Failed to update username. Please try again.");
        } finally {
            setProfileLoading(false);
            // Clear success message after a few seconds
            setTimeout(() => setSuccessMessage(null), 3000);
        }
    };


    if (loading || profileLoading) {
        return (
            <div className="page-container profile-page" style={{ justifyContent: 'center', alignItems: 'center' }}>
                <p className="welcome-message loading-pulse" style={{ color: '#ff4d88' }}>Loading profile...</p>
            </div>
        );
    }

    if (!currentUser) {
        return (
            <div className="page-container profile-page" style={{ justifyContent: 'center', alignItems: 'center' }}>
                <h2 className="page-title">Access Denied</h2>
                <p className="page-description">Please log in or register to view your profile.</p>
            </div>
        );
    }

    return (
        <div className="page-container profile-page">
            <h1 className="page-title">User Profile</h1>
            <p className="page-description">Manage your personal information.</p>

            <div className="dashboard-card profile-card">
                <form onSubmit={handleUpdateUsername}>
                    <div className="form-group">
                        <label htmlFor="display-email">Email:</label>
                        <input
                            type="text"
                            id="display-email"
                            value={currentUser.email || 'N/A'}
                            disabled
                            className="disabled-input"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="username">Username:</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    {error && <p className="form-message error-message">{error}</p>}
                    {successMessage && <p className="form-message success-message">{successMessage}</p>}
                    <button type="submit" className="primary-gradient" disabled={profileLoading || username === originalUsername}>
                        {profileLoading ? 'Saving...' : 'Update Username'}
                    </button>
                </form>
            </div>
            {/* You can add more profile settings here */}
        </div>
    );
}

export default Profile;
