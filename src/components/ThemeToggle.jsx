// src/components/ThemeToggle.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { Sun, Moon } from 'lucide-react';
// import './ThemeToggle.css'; // Styles are integrated into Header.css

// This component's direct usage is now minimal, as Header handles most of it.
// It exists to satisfy the import in App.jsx and for clarity of structure.
// In a real application, you might abstract this into a true reusable component if it were used elsewhere.

const ThemeToggle = ({ isDarkMode, onToggleTheme }) => {
    return (
        <div className="theme-toggle" onClick={onToggleTheme} aria-label="Toggle dark mode">
            {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
        </div>
    );
};

ThemeToggle.propTypes = {
    isDarkMode: PropTypes.bool.isRequired,
    onToggleTheme: PropTypes.func.isRequired,
};

export default ThemeToggle;
