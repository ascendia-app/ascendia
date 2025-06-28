// src/pages/Register.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { setDoc, doc } from 'firebase/firestore'; // For creating user profile
import '../PageStyles.css'; // For general page styling

function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState(null);
    const { register, loading, db, appId } = useAuth(); // Get db and appId
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null); // Clear previous errors

        if (!email || !password || !confirmPassword) {
            setError("All fields are required.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        if (password.length < 6) {
            setError("Password should be at least 6 characters.");
            return;
        }

        const { success, error: authError, user } = await register(email, password);

        if (success && user && db && appId) {
            try {
                // Create a basic user profile document in Firestore upon successful registration
                // Path: artifacts/{appId}/users/{userId}/profile/data
                const userProfileRef = doc(db, `artifacts/${appId}/users/${user.uid}/profile/data`);
                await setDoc(userProfileRef, {
                    username: email.split('@')[0], // Default username from email prefix
                    email: email,
                    createdAt: new Date().toISOString(),
                    // Add any other default profile data here
                });
                console.log("User profile created in Firestore for new user:", user.uid);
                navigate('/dashboard'); // Redirect to dashboard
            } catch (firestoreError) {
                console.error("Failed to create user profile in Firestore:", firestoreError);
                setError("Registration successful, but failed to set up user profile. Please try logging in.");
                // Optionally, log the user out here if profile creation is critical
                // await logout();
            }
        } else {
            setError(authError || "Registration failed. Please try again.");
        }
    };

    return (
        <div className="page-container form-page">
            <h2 className="page-title">Register</h2>
            <p className="page-description">Create your Ascendia account.</p>
            <form onSubmit={handleSubmit} className="auth-form dashboard-card">
                <div className="form-group">
                    <label htmlFor="reg-email">Email</label>
                    <input
                        type="email"
                        id="reg-email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="reg-password">Password</label>
                    <input
                        type="password"
                        id="reg-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="confirm-password">Confirm Password</label>
                    <input
                        type="password"
                        id="confirm-password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                </div>
                {error && <p className="form-message error-message">{error}</p>}
                <button type="submit" className="primary-gradient" disabled={loading}>
                    {loading ? 'Registering...' : 'Register'}
                </button>
            </form>
            <p className="form-footer">
                Already have an account? <Link to="/login" className="inline-link">Login here</Link>
            </p>
        </div>
    );
}

export default Register;
