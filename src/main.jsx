// src/main.jsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { AuthProvider } from './contexts/AuthContext.jsx'; // Make sure this path is correct

import './index.css'; // Your global base styles. This file will be created next.

// Get the root DOM element where your React app will be mounted
const rootElement = document.getElementById('root');

// Create a React root and render your application
ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    {/* AuthProvider must wrap your entire application to provide Firebase context */}
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
);
