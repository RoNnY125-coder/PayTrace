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
      className={`relative inline-flex items-center justify-center w-9 h-9 rounded-full bg-[#E8EAEF] dark:bg-[#1A241A] hover:bg-[#9FE870] dark:hover:bg-[#9FE870] text-[#163300] dark:text-[#9FE870] hover:text-[#163300] dark:hover:text-[#163300] transition-all duration-200 border border-[#DFE2E6] dark:border-[#243324] shadow-sm active:scale-95 ${className}`}
    >
      <span className="material-symbols-outlined text-[18px]">
        {isDark ? 'light_mode' : 'dark_mode'}
      </span>
    </button>
  );
};
