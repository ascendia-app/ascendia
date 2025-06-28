import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate for redirection
import { useAuth } from '../contexts/AuthContext'; // Import useAuth hook

import '../PageStyles.css'; // Ensure PageStyles.css is imported for general styling

function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState(''); // State for username
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [isRegistering, setIsRegistering] = useState(false); // For loading state
    const [usernameStatus, setUsernameStatus] = useState(''); // 'checking', 'available', 'taken', ''

    const { register, currentUser, loading } = useAuth(); // Destructure register function
    const navigate = useNavigate(); // Hook for navigation

    // Redirect if already logged in
    useEffect(() => {
        if (!loading && currentUser) {
            navigate('/dashboard', { replace: true });
        }
    }, [currentUser, loading, navigate]);

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters long.");
            return;
        }

        setIsRegistering(true); // Start loading

        try {
            // Call the register function from AuthContext
            await register(email, password, username);
            setSuccessMessage("Registration successful! You are now logged in.");
            console.log("Registration successful for:", email);

            // Redirect to dashboard after successful registration and login (AuthContext handles login after register)
            setTimeout(() => {
                navigate('/dashboard');
            }, 1500); // Give a little time for the success message to show
        } catch (err) {
            console.error("Registration failed:", err.message);
            // Firebase error messages are usually good for display
            if (err.code === 'auth/email-already-in-use') {
                setError('The email address is already in use by another account.');
            } else if (err.code === 'auth/weak-password') {
                setError('The password is too weak. Please choose a stronger one.');
            } else {
                setError(`Registration failed: ${err.message}`);
            }
        } finally {
            setIsRegistering(false); // End loading
        }
    };

    // Placeholder for username availability check (you would implement real logic here)
    const checkUsernameAvailability = useCallback(async (currentUsername) => {
        if (currentUsername.length < 3) {
            setUsernameStatus('');
            return;
        }
        setUsernameStatus('checking');
        // Simulate API call
        setTimeout(() => {
            const isTaken = ['admin', 'testuser', 'moderator'].includes(currentUsername.toLowerCase()); // Mock taken usernames
            if (isTaken) {
                setUsernameStatus('taken');
            } else {
                setUsernameStatus('available');
            }
        }, 500);
    }, []);

    useEffect(() => {
        const handler = setTimeout(() => {
            checkUsernameAvailability(username);
        }, 500); // Debounce username check

        return () => {
            clearTimeout(handler);
        };
    }, [username, checkUsernameAvailability]);


    // If auth context is still loading, show a loading message
    if (loading) {
        return (
            <div className="page-container" style={{ justifyContent: 'center', alignItems: 'center' }}>
                <p className="welcome-message loading-pulse" style={{ color: '#ff4d88' }}>Loading...</p>
            </div>
        );
    }

    return (
        <div className="page-container">
            <h2 className="page-title">Create Your Account</h2>
            <p className="page-description">Join Ascendia to unlock your full academic potential.</p>

            <form onSubmit={handleSubmit} className="auth-form">
                {error && <p className="form-message error">{error}</p>}
                {successMessage && <p className="form-message success">{successMessage}</p>}

                <div className="form-group">
                    <label htmlFor="register-email" className="compulsory-field">Email Address</label>
                    <input
                        type="email"
                        id="register-email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your.email@example.com"
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="register-username" className="compulsory-field">Username</label>
                    <input
                        type="text"
                        id="register-username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Choose a unique username"
                        required
                        minLength="3"
                    />
                    {username && (
                        <p className={`username-status ${usernameStatus}`}>
                            {usernameStatus === 'checking' && 'Checking availability...'}
                            {usernameStatus === 'available' && 'Username available!'}
                            {usernameStatus === 'taken' && 'Username is taken.'}
                        </p>
                    )}
                </div>

                <div className="form-group">
                    <label htmlFor="register-password" className="compulsory-field">Password</label>
                    <input
                        type="password"
                        id="register-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Minimum 6 characters"
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="register-confirm-password" className="compulsory-field">Confirm Password</label>
                    <input
                        type="password"
                        id="register-confirm-password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter your password"
                        required
                    />
                </div>

                <button type="submit" className="submit-button primary-gradient" disabled={isRegistering}>
                    {isRegistering ? 'Registering...' : 'Register'}
                </button>
            </form>

            <div className="auth-footer-links">
                <p>Already have an account? <Link to="/login" className="inline-link">Log In</Link></p>
                <p><Link to="/getting-started" className="inline-link">Back to Getting Started</Link></p>
            </div>
        </div>
    );
}

export default Register; // <--- THIS IS THE CRUCIAL LINE for the "default" export
