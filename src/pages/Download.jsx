import React from 'react';
import { Link } from 'react-router-dom';
import './PageStyles.css'; // Assuming a generic stylesheet for pages

function Download() {
  return (
    <div className="page-container download-page">
      <h2 className="page-title">Ascendia Desktop App Downloads</h2>
      <p className="page-description">
        Get the full Ascendia experience on your desktop.
      </p>
      <p className="page-description-small">
        (Note: These are placeholder links. Replace with actual download URLs and instructions.)
      </p>
      <div className="download-links-detailed">
        <a href="https://example.com/download/windows" target="_blank" rel="noopener noreferrer" className="download-link-detailed">
          <span className="icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-windows">
              <path d="M22 10V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2Z"/>
              <path d="M22 18v-4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2Z"/>
            </svg>
          </span>
          Download for Windows (exe)
        </a>
        <a href="https://example.com/download/macos" target="_blank" rel="noopener noreferrer" className="download-link-detailed">
          <span className="icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-apple">
              <path d="M12 20.94c1.5 0 2.75 1.06 4 2.06 2.25-2 3-3.5 3.25-5.5C21 16 22 13.5 22 12c0-2.5-2-4.92-4.95-5.07c-.42-.01-.7-.02-1.05.02c-1.3.17-2.73 1.3-4.05 1.3c-1.3 0-2.73-1.3-4.05-1.3c-.35-.04-.63-.03-1.05-.02C4 7.08 2 9.5 2 12c0 1.5 1 4 1.75 5.5c.25 2 1 3.5 3.25 5.5c1.25-1 2.5-2.06 4-2.06Z"/>
              <path d="M10 2c-.67 0-1.28.25-2 .5A7 7 0 0 0 12 6.5C12 9 10 11 10 11z"/>
            </svg>
          </span>
          Download for macOS (dmg)
        </a>
      </div>
      <Link to="/getting-started" className="back-button">← Back to Get Started</Link>
    </div>
  );
}

export default Download;
