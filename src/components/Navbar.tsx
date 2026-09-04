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
      <div className="h-16 rounded-full bg-white/90 dark:bg-[#131A13]/90 backdrop-blur-2xl shadow-[0_8px_32px_rgba(22,51,0,0.06)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)] border border-[#E2E5E9] dark:border-[#273827] px-6 flex items-center justify-between transition-colors">
        {/* Wise-Style Bold Brand Mark */}
        <button 
          onClick={() => setActivePage('home')}
          className="flex items-center gap-2.5 text-[18px] font-extrabold text-[#163300] dark:text-white tracking-tight focus:outline-none hover:opacity-90 transition-opacity shrink-0 group"
        >
          <span className="w-8 h-8 rounded-full bg-[#9FE870] text-[#163300] flex items-center justify-center font-black text-sm shadow-sm group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-[19px] font-bold">bolt</span>
          </span>
          <span className="flex items-center">
            <span>Pay</span>
            <span className="text-[#2D5A0F] dark:text-[#9FE870]">Trace</span>
          </span>
        </button>

        {/* Center Nav Links as Wise Rounded Pills */}
        <nav className="hidden md:flex items-center gap-1 bg-[#E8EAEF] dark:bg-[#1A241A] rounded-full p-1 border border-[#DFE2E6] dark:border-[#243324]">
          {navItems.map((item) => {
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={`text-[13px] px-4 py-2 rounded-full font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-[#163300] text-[#9FE870] dark:bg-[#9FE870] dark:text-[#163300] shadow-sm scale-[1.02]'
                    : 'text-[#596859] dark:text-[#9DA99D] hover:text-[#163300] dark:hover:text-white hover:bg-black/[0.03] dark:hover:bg-white/[0.04]'
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
      <div className="md:hidden mt-2 rounded-full bg-white/95 dark:bg-[#131A13]/95 backdrop-blur-2xl border border-[#E2E5E9] dark:border-[#273827] shadow-md flex items-center justify-around py-1.5 px-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActivePage(item.id)}
            className={`px-3.5 py-1.5 text-xs rounded-full font-semibold transition-all ${
              activePage === item.id
                ? 'bg-[#163300] text-[#9FE870] dark:bg-[#9FE870] dark:text-[#163300] shadow-sm'
                : 'text-[#596859] dark:text-[#9DA99D]'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </header>
  );
};
