// src/pages/Login.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../PageStyles.css'; // For general page styling

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const { login, loading } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null); // Clear previous errors
        if (!email || !password) {
            setError("Please enter both email and password.");
            return;
        }

        const { success, error: authError } = await login(email, password);
        if (success) {
            navigate('/dashboard'); // Redirect to dashboard on successful login
        } else {
            setError(authError || "Failed to login. Please check your credentials.");
        }
    };

    return (
        <div className="page-container form-page">
            <h2 className="page-title">Login</h2>
            <p className="page-description">Access your Ascendia account.</p>
            <form onSubmit={handleSubmit} className="auth-form dashboard-card">
                <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                {error && <p className="form-message error-message">{error}</p>}
                <button type="submit" className="primary-gradient" disabled={loading}>
                    {loading ? 'Logging in...' : 'Login'}
                </button>
            </form>
            <p className="form-footer">
                Don't have an account? <Link to="/register" className="inline-link">Register here</Link>
            </p>
        </div>
    );
}

export default Login;
