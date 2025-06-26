import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './PageStyles.css'; // Assuming a generic stylesheet for pages

function Login() {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    setMessage('');
    // Here you would typically send data to a backend API for login
    console.log('Logging in with:', { emailOrUsername, password });
    setMessage('Login attempted! (This is a demo, no actual login occurred)');
    // Clear form fields
    setEmailOrUsername('');
    setPassword('');
  };

  return (
    <div className="page-container login-page">
      <h2 className="page-title">Log In to Ascendia</h2>
      <p className="page-description">Welcome back! Please enter your credentials.</p>

      <form onSubmit={handleLogin} className="auth-form">
        <div className="form-group">
          <label htmlFor="emailOrUsername">Email or Username:</label>
          <input
            type="text"
            id="emailOrUsername"
            value={emailOrUsername}
            onChange={(e) => setEmailOrUsername(e.target.value)}
            placeholder="your@example.com or username"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </div>
        <button type="submit" className="submit-button primary-gradient">Log In</button>
        {message && <p className="form-message">{message}</p>}
      </form>

      <div className="auth-footer-links">
        <p>Don't have an account? <Link to="/getting-started" className="inline-link">Register Here</Link></p>
      </div>

      <Link to="/" className="back-to-home-button">← Back to Homepage</Link>
    </div>
  );
}

export default Login;
