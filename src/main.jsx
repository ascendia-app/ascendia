import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx'; // Make sure this path is correct based on your App.jsx location
import { AuthProvider } from './contexts/AuthContext.jsx'; // Correct path to your AuthProvider

import './index.css'; // Your global styles. Make sure this exists.
// Other global CSS files like PageStyles.css and ModalStyles.css should be imported
// within App.jsx or the specific components/pages that use them.

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
