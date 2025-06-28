import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx'; // Make sure this path is correct based on your App.jsx location
import { AuthProvider } from './contexts/AuthContext.jsx'; // Correct path to your AuthProvider

import './index.css'; // Your global styles
// Ensure PageStyles.css and ModalStyles.css are correctly imported within components/pages/modals
// and their relevant App.jsx or component files.

// Get the root DOM element where your React app will be mounted
const rootElement = document.getElementById('root');

// Create a React root and render your application
ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    {/* AuthProvider must wrap your entire application to provide Firebase instances (db, auth, etc.) */}
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
);
