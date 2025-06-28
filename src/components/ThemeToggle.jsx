import React from 'react';
import { Sun, Moon } from 'lucide-react';
import './ThemeToggle.css'; // You will need to create this CSS file

function ThemeToggle({ isDarkMode, onToggleTheme }) {
    return (
        <button onClick={onToggleTheme} className="theme-toggle-button">
            {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
        </button>
    );
}

export default ThemeToggle;