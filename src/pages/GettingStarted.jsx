import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './PageStyles.css'; // Assuming a generic stylesheet for pages

function GettingStarted() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleRegister = (e) => {
    e.preventDefault();
    setMessage('');
    if (password !== confirmPassword) {
      setMessage('Passwords do not match!');
      return;
    }
    // Here you would typically send data to a backend API for registration
    console.log('Registering with:', { email, username, password });
    setMessage('Registration successful! (This is a demo, no actual registration occurred)');
    // Clear form fields
    setEmail('');
    setUsername('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="page-container getting-started-page">
      <h2 className="page-title">Register for Ascendia</h2>
      <p className="page-description">Start your journey with us by creating an account.</p>

      <form onSubmit={handleRegister} className="auth-form">
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@example.com"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Choose a username"
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
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password:</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </div>
        <button type="submit" className="submit-button primary-gradient">Register</button>
        {message && <p className="form-message">{message}</p>}
      </form>

      <div className="auth-footer-links">
        <p>Already have an account? <Link to="/login" className="inline-link">Log In</Link></p>
      </div>

      <div className="download-section">
        <h3 className="section-title">Or Download Our Desktop App:</h3>
        <div className="download-buttons">
          <Link to="/download" className="gs-button download-windows">
            <span className="icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-windows">
                <path d="M22 10V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2Z"/>
                <path d="M22 18v-4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2Z"/>
              </svg>
            </span>
            Download for Windows
          </Link>
          <Link to="/download" className="gs-button download-macos">
            <span className="icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-apple">
                <path d="M12 20.94c1.5 0 2.75 1.06 4 2.06 2.25-2 3-3.5 3.25-5.5C21 16 22 13.5 22 12c0-2.5-2-4.92-4.95-5.07c-.42-.01-.7-.02-1.05.02c-1.3.17-2.73 1.3-4.05 1.3c-1.3 0-2.73-1.3-4.05-1.3c-.35-.04-.63-.03-1.05-.02C4 7.08 2 9.5 2 12c0 1.5 1 4 1.75 5.5c.25 2 1 3.5 3.25 5.5c1.25-1 2.5-2.06 4-2.06Z"/>
                <path d="M10 2c-.67 0-1.28.25-2 .5A7 7 0 0 0 12 6.5C12 9 10 11 10 11z"/>
              </svg>
            </span>
            Download for macOS
          </Link>
        </div>
      </div>

      <Link to="/" className="back-to-home-button">← Back to Homepage</Link>
    </div>
  );
}

export default GettingStarted;
