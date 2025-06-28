import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserCircle, Mail, User, Clock, CheckCircle } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore'; // For fetching additional user data

function Profile() {
    const { currentUser, loading, db, appId, userId, authError } = useAuth();
    const [userProfileData, setUserProfileData] = useState(null);
    const [profileLoading, setProfileLoading] = useState(true);
    const [profileError, setProfileError] = useState(null);

    useEffect(() => {
        const fetchUserProfile = async () => {
            if (!db || !appId || !userId || !currentUser) {
                setProfileLoading(false);
                return;
            }

            setProfileLoading(true);
            setProfileError(null);
            try {
                // Fetch user data from the 'profile/data' document
                const userDocRef = doc(db, `artifacts/${appId}/users/${userId}/profile/data`);
                const docSnap = await getDoc(userDocRef);

                if (docSnap.exists()) {
                    setUserProfileData(docSnap.data());
                    console.log("Profile.jsx: Fetched user profile data:", docSnap.data());
                } else {
                    setUserProfileData(null); // No custom profile data
                    console.warn("Profile.jsx: No custom profile data found for user:", userId);
                }
            } catch (error) {
                console.error("Profile.jsx: Error fetching user profile:", error);
                setProfileError("Failed to load profile data. Please try again.");
            } finally {
                setProfileLoading(false);
            }
        };

        if (!loading && currentUser) { // Only fetch if auth is done and user is logged in
            fetchUserProfile();
        } else if (!loading && !currentUser) {
            setProfileLoading(false); // If no user, stop loading
        }

    }, [currentUser, loading, db, appId, userId]);


    if (loading || profileLoading) {
        return (
            <div className="page-container" style={{ justifyContent: 'center', alignItems: 'center' }}>
                <p className="welcome-message loading-pulse">Loading profile...</p>
            </div>
        );
    }

    if (!currentUser) {
        return (
            <div className="page-container" style={{ justifyContent: 'center', alignItems: 'center' }}>
                <h2 className="page-title">Access Denied</h2>
                <p className="page-description">Please <Link to="/login" className="inline-link">log in</Link> or <Link to="/getting-started" className="inline-link">register</Link> to view your profile.</p>
            </div>
        );
    }

    return (
        <div className="page-container">
            <h2 className="page-title"><UserCircle size={40} className="widget-icon" /> My Profile</h2>
            <p className="page-description">Manage your personal information and account settings.</p>

            {authError && <p className="form-message error-message">{authError}</p>}
            {profileError && <p className="form-message error-message">{profileError}</p>}

            <div className="dashboard-card" style={{ maxWidth: '600px', width: '100%', padding: '2rem', textAlign: 'left' }}>
                <div className="profile-detail-item">
                    <User size={20} className="detail-icon" />
                    <strong>Username:</strong> {userProfileData?.username || currentUser.displayName || 'Not Set'}
                </div>
                <div className="profile-detail-item">
                    <Mail size={20} className="detail-icon" />
                    <strong>Email:</strong> {currentUser.email || 'N/A'}
                </div>
                <div className="profile-detail-item">
                    <Clock size={20} className="detail-icon" />
                    <strong>Member Since:</strong> {currentUser.metadata?.creationTime ? new Date(currentUser.metadata.creationTime).toLocaleDateString() : 'N/A'}
                </div>
                <div className="profile-detail-item">
                    <CheckCircle size={20} className="detail-icon" />
                    <strong>User ID:</strong> <span className="user-id-display">{userId || 'N/A'}</span> {/* Displaying userId */}
                </div>

                <hr style={{ margin: '1.5rem 0', borderColor: '#eee' }} />

                <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#333' }}>Account Actions</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    <button className="submit-button primary-gradient" style={{ width: 'auto', alignSelf: 'flex-start' }}>
                        Edit Profile Details (Coming Soon)
                    </button>
                    {/* Add more profile management actions here */}
                </div>
            </div>
            <Link to="/dashboard" className="back-to-home-button">Back to Dashboard</Link>
        </div>
    );
}

export default Profile;