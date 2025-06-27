    // src/pages/GettingStarted.jsx
    import React, { useState, useEffect } from 'react'; // Added useEffect for debounce
    import { Link, useNavigate } from 'react-router-dom'; // Added useNavigate
    import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
    import { doc, getDoc, setDoc } from "firebase/firestore";
    import { auth, db } from '../firebaseConfig'; // Import auth and db
    import '../PageStyles.css';

    function GettingStarted() {
      const [email, setEmail] = useState('');
      const [username, setUsername] = useState('');
      const [password, setPassword] = useState('');
      const [confirmPassword, setConfirmPassword] = useState('');
      const [message, setMessage] = useState('');
      const [usernameAvailability, setUsernameAvailability] = useState(null); // null, 'checking', 'available', 'taken'
      const [isSubmitting, setIsSubmitting] = useState(false); // To prevent double submission
      const navigate = useNavigate(); // For programmatic navigation

      // Debounce effect for username availability check
      useEffect(() => {
        if (username.length < 3) {
          setUsernameAvailability(null);
          return;
        }

        const handler = setTimeout(async () => {
          setUsernameAvailability('checking');
          try {
            const usernameDocRef = doc(db, "usernames", username.toLowerCase()); // Use lowercase for consistency
            const docSnap = await getDoc(usernameDocRef);
            if (docSnap.exists()) {
              setUsernameAvailability('taken');
            } else {
              setUsernameAvailability('available');
            }
          } catch (error) {
            console.error("Error checking username:", error);
            setMessage("Error checking username. Please try again.");
            setUsernameAvailability(null);
          }
        }, 500); // Check 500ms after user stops typing

        return () => {
          clearTimeout(handler);
        };
      }, [username]); // Re-run effect when username changes

      const handleRegister = async (e) => {
        e.preventDefault();
        setMessage('');
        setIsSubmitting(true);

        if (password !== confirmPassword) {
          setMessage('Passwords do not match!');
          setIsSubmitting(false);
          return;
        }

        if (username.length < 3 || usernameAvailability !== 'available') {
            setMessage('Please choose a valid and available username.');
            setIsSubmitting(false);
            return;
        }

        try {
          // 1. Create user with email and password using Firebase Auth
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          const user = userCredential.user;

          // 2. Send email verification
          await sendEmailVerification(user);
          console.log("Email verification sent.");

          // 3. Store username in Firestore for uniqueness tracking (important for security rules in Step 6)
          await setDoc(doc(db, "usernames", username.toLowerCase()), {
            userId: user.uid,
            createdAt: new Date()
          });

          // 4. Store user profile details in a 'users' collection (optional, but good practice)
          await setDoc(doc(db, "users", user.uid), {
            email: user.email,
            username: username,
            emailVerified: user.emailVerified,
            createdAt: new Date()
          });

          setMessage('Registration successful! Please verify your email.');
          // Clear form fields
          setEmail('');
          setUsername('');
          setPassword('');
          setConfirmPassword('');
          setUsernameAvailability(null);

          // Optionally navigate to login or a "check your email" page after success
          // navigate('/login');

        } catch (error) {
          console.error("Error during registration:", error.code, error.message);
          let errorMessage = "Registration failed. Please try again.";
          if (error.code === 'auth/email-already-in-use') {
            errorMessage = 'Email address is already registered.';
          } else if (error.code === 'auth/invalid-email') {
            errorMessage = 'Invalid email address.';
          } else if (error.code === 'auth/weak-password') {
            errorMessage = 'Password should be at least 6 characters.';
          }
          setMessage(errorMessage);
        } finally {
          setIsSubmitting(false);
        }
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
                minLength="3"
              />
              {username.length > 2 && usernameAvailability === 'checking' && (
                <p className="username-status checking">Checking availability...</p>
              )}
              {username.length > 2 && usernameAvailability === 'available' && (
                <p className="username-status available">Username available!</p>
              )}
              {username.length > 2 && usernameAvailability === 'taken' && (
                <p className="username-status taken">Username already taken.</p>
              )}
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
            <button type="submit" className="submit-button primary-gradient" disabled={isSubmitting || usernameAvailability === 'taken' || usernameAvailability === 'checking'}>
              {isSubmitting ? 'Registering...' : 'Register'}
            </button>
            {message && <p className="form-message">{message}</p>}
          </form>

          <div className="auth-footer-links">
            <p>Already have an account? <Link to="/login" className="inline-link">Log In</Link></p>
          </div>

          <div className="download-section">
            <h3 className="section-title">Or Download Our Desktop App:</h3>
            <div className="download-buttons">
              <a href="/downloads/Ascendia_Windows_Setup.exe" download className="gs-button download-windows">
                <span className="icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-windows">
                    <path d="M22 10V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2Z"/>
                    <path d="M22 18v-4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2Z"/>
                  </svg>
                </span>
                Download for Windows
              </a>
              <a href="/downloads/Ascendia_macOS.dmg" download className="gs-button download-macos">
                <span className="icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-apple">
                    <path d="M12 20.94c1.5 0 2.75 1.06 4 2.06 2.25-2 3-3.5 3.25-5.5C21 16 22 13.5 22 12c0-2.5-2-4.92-4.95-5.07c-.42-.01-.7-.02-1.05.02c-1.3.17-2.73 1.3-4.05 1.3c-1.3 0-2.73-1.3-4.05-1.3c-.35-.04-.63-.03-1.05-.02C4 7.08 2 9.5 2 12c0 1.5 1 4 1.75 5.5c.25 2 1 3.5 3.25 5.5c1.25-1 2.5-2.06 4-2.06Z"/>
                    <path d="M10 2c-.67 0-1.28.25-2 .5A7 7 0 0 0 12 6.5C12 9 10 11 10 11z"/>
                  </svg>
                </span>
                Download for macOS
              </a>
            </div>
          </div>

          <Link to="/" className="back-to-home-button">← Back to Homepage</Link>
        </div>
      );
    }

    export default GettingStarted;
    