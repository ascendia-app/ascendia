    // src/pages/Login.jsx
    import React, { useState } from 'react';
    import { Link, useNavigate } from 'react-router-dom'; // Added useNavigate
    import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
    import { auth } from '../firebaseConfig'; // Import auth
    import '../PageStyles.css';

    function Login() {
      const [email, setEmail] = useState(''); // Changed to email for Firebase Auth
      const [password, setPassword] = useState('');
      const [message, setMessage] = useState('');
      const [forgotPasswordMessage, setForgotPasswordMessage] = useState('');
      const [isSubmitting, setIsSubmitting] = useState(false); // To prevent double submission

      const navigate = useNavigate(); // For programmatic navigation

      const handleLogin = async (e) => {
        e.preventDefault();
        setMessage('');
        setIsSubmitting(true);

        try {
          // Use signInWithEmailAndPassword for login
          await signInWithEmailAndPassword(auth, email, password);
          setMessage('Login successful!');
          // Clear form fields
          setEmail('');
          setPassword('');
          // Navigate to a dashboard or home page after successful login
          navigate('/'); // Or '/dashboard' etc.

        } catch (error) {
          console.error("Error during login:", error.code, error.message);
          let errorMessage = "Login failed. Invalid email or password.";
          if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
            errorMessage = 'Invalid email or password.';
          } else if (error.code === 'auth/invalid-email') {
            errorMessage = 'Invalid email address format.';
          }
          setMessage(errorMessage);
        } finally {
          setIsSubmitting(false);
        }
      };

      const handleForgotPassword = async () => {
        setForgotPasswordMessage('');
        if (!email) { // Use email for password reset
          setForgotPasswordMessage('Please enter your email to reset password.');
          return;
        }

        try {
          // Send password reset email
          await sendPasswordResetEmail(auth, email);
          setForgotPasswordMessage('If your email is registered, a password reset link has been sent to your inbox.');
        } catch (error) {
          console.error("Error sending password reset email:", error.code, error.message);
          let errorMessage = 'Failed to send reset link. Please try again.';
          if (error.code === 'auth/user-not-found') {
            // It's good practice not to reveal if an email is registered for security reasons
            errorMessage = 'If your email is registered, a password reset link has been sent to your inbox.';
          } else if (error.code === 'auth/invalid-email') {
            errorMessage = 'Please enter a valid email address.';
          }
          setForgotPasswordMessage(errorMessage);
        }
      };

      return (
        <div className="page-container login-page">
          <h2 className="page-title">Log In to Ascendia</h2>
          <p className="page-description">Welcome back! Please enter your credentials.</p>

          <form onSubmit={handleLogin} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email:</label> {/* Changed label to Email */}
              <input
                type="email" // Changed type to email
                id="email" // Changed id to email
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@example.com"
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
            <button type="submit" className="submit-button primary-gradient" disabled={isSubmitting}>
              {isSubmitting ? 'Logging In...' : 'Log In'}
            </button>
            {message && <p className="form-message">{message}</p>}
          </form>

          <div className="auth-footer-links">
            <p>Don't have an account? <Link to="/getting-started" className="inline-link">Register Here</Link></p>
            {/* Forgot password link */}
            <p><a href="#" onClick={handleForgotPassword} className="inline-link">Forgot Password?</a></p>
            {forgotPasswordMessage && <p className="form-message">{forgotPasswordMessage}</p>}
          </div>

          <Link to="/" className="back-to-home-button">← Back to Homepage</Link>
        </div>
      );
    }

    export default Login;
    