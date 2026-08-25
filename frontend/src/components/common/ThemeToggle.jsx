import React from 'react';
import { useTheme } from '../../context/ThemeContext';

export const ThemeToggle = ({ className = '', style = {} }) => {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`clay-theme-toggle ${className}`}
      style={style}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'Light (Day Candy ☀️)' : 'Dark (Cyber Clay 🌙)'} Mode`}
    >
      <span className="clay-theme-track">
        <span className={`clay-theme-thumb ${isDark ? 'dark' : 'light'}`}>
          {isDark ? '🌙' : '☀️'}
        </span>
      </span>
      <span className="clay-theme-label">
        {isDark ? 'Cyber Clay' : 'Day Candy'}
      </span>
    </button>
  );
};
