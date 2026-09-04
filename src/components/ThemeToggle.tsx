import React from 'react';
import { useTheme } from '../context/ThemeContext';

export const ThemeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle Dark / Light Mode"
      title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
      className={`relative inline-flex items-center justify-center w-9 h-9 rounded-full bg-[#E8EAEF] dark:bg-[#14151A] hover:bg-[#9FE870] dark:hover:bg-[#9FE870] text-[#14151A] dark:text-[#EDEDF0] hover:text-[#14151A] dark:hover:text-[#14151A] transition-colors duration-150 border border-[#DFE2E6] dark:border-[#2E2F38] active:scale-95 ${className}`}
    >
      <span className="material-symbols-outlined text-[18px]">
        {isDark ? 'light_mode' : 'dark_mode'}
      </span>
    </button>
  );
};
