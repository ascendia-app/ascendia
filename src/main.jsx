import React from 'react';
import ReactDOM from 'react-dom/client'; // Import ReactDOM client API
import App from './App.jsx'; // Import your main App component
import './index.css'; // You might have a global index.css or other base styles here

// Create a root and render your App component into the #root element in index.html
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
