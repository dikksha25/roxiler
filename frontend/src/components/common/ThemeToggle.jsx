import React from 'react';
import { useTheme } from '../../hooks/useTheme';

export const ThemeToggle = ({ className = '', style = {} }) => {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`clay-theme-toggle ${className}`}
      style={style}
      aria-label={`Switch to ${isDark ? 'Light Day Candy' : 'Dark Cyber Clay'} theme`}
      title={`Switch to ${isDark ? 'Light Day Candy ☀️' : 'Dark Cyber Clay 🌙'} mode`}
    >
      <div className="clay-theme-track">
        <div className={`clay-theme-thumb ${isDark ? 'thumb-dark' : 'thumb-light'}`}>
          {isDark ? (
            <span className="theme-icon moon-icon">🌙</span>
          ) : (
            <span className="theme-icon sun-icon">☀️</span>
          )}
        </div>
      </div>
      <span className="clay-theme-label">
        {isDark ? 'Cyber Clay' : 'Day Candy'}
      </span>
    </button>
  );
};

export default ThemeToggle;
