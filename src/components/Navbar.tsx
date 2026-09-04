import React from 'react';
import { NavPage } from '../types';
import { ThemeToggle } from './ThemeToggle';

interface NavbarProps {
  activePage: NavPage;
  setActivePage: (page: NavPage) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activePage, setActivePage }) => {
  const navItems: { id: NavPage; label: string }[] = [
    { id: 'home', label: 'Home' },
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'investigation', label: 'Investigation' },
    { id: 'states-debug', label: 'States / Debug' },
  ];

  return (
    <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-5xl">
      <div className="h-16 rounded-full bg-white/95 dark:bg-[#1E1F26]/95 backdrop-blur-xl border border-[#E2E5E9] dark:border-[#2E2F38] px-6 flex items-center justify-between transition-colors">
        {/* Wise-Style Bold Brand Mark */}
        <button 
          onClick={() => setActivePage('home')}
          className="flex items-center gap-2.5 text-[18px] font-bold text-[#14151A] dark:text-[#EDEDF0] tracking-tight focus:outline-none hover:opacity-90 transition-opacity shrink-0 group"
        >
          <span className="w-8 h-8 rounded-full bg-[#9FE870] text-[#14151A] flex items-center justify-center font-black text-sm transition-transform">
            <span className="material-symbols-outlined text-[19px] font-bold">bolt</span>
          </span>
          <span className="flex items-center font-bold">
            <span>Pay</span>
            <span className="text-[#6C6D77] dark:text-[#9FE870]">Trace</span>
          </span>
        </button>

        {/* Center Nav Links as Wise Rounded Pills */}
        <nav className="hidden md:flex items-center gap-1 bg-[#E8EAEF] dark:bg-[#14151A] rounded-full p-1 border border-[#DFE2E6] dark:border-[#2E2F38]">
          {navItems.map((item) => {
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={`text-[13px] px-4 py-2 rounded-full font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-[#14151A] text-[#9FE870] dark:bg-[#9FE870] dark:text-[#14151A]'
                    : 'text-[#6C6D77] dark:text-[#9B9CA6] hover:text-[#14151A] dark:hover:text-[#EDEDF0]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right Controls: Theme Toggle */}
        <div className="flex items-center gap-2.5">
          <ThemeToggle />
        </div>
      </div>

      {/* Mobile Navigation Bar as Pill Row */}
      <div className="md:hidden mt-2 rounded-full bg-white dark:bg-[#1E1F26] border border-[#E2E5E9] dark:border-[#2E2F38] flex items-center justify-around py-1.5 px-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActivePage(item.id)}
            className={`px-3.5 py-1.5 text-xs rounded-full font-semibold transition-all ${
              activePage === item.id
                ? 'bg-[#14151A] text-[#9FE870] dark:bg-[#9FE870] dark:text-[#14151A]'
                : 'text-[#6C6D77] dark:text-[#9B9CA6]'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </header>
  );
};
