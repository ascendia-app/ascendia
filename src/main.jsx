import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx'; // Make sure this path is correct: './App.jsx'
import { AuthProvider } from './contexts/AuthContext.jsx'; // Correct path to your AuthProvider

import './index.css'; // Your global base styles. Ensure this file exists.

// Get the root DOM element where your React app will be mounted
const rootElement = document.getElementById('root');

// Create a React root and render your application
ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    {/* CRITICAL: AuthProvider must wrap your entire application.
        It initializes Firebase and makes 'db', 'auth', 'userId' available via useAuth hook. */}
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
);
