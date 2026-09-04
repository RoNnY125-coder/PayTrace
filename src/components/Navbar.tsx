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
    { id: 'states-debug', label: 'States/Debug' },
  ];

  return (
    <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-4xl">
      <div className="h-14 rounded-2xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.4)] border border-white/80 dark:border-white/10 px-5 flex items-center justify-between transition-colors">
        {/* Brand Mark */}
        <button 
          onClick={() => setActivePage('home')}
          className="flex items-center gap-2 text-[17px] font-semibold text-primary dark:text-white tracking-tight focus:outline-none hover:opacity-80 transition-opacity shrink-0"
        >
          <span className="w-7 h-7 rounded-lg bg-blue-600 dark:bg-blue-500 text-white flex items-center justify-center shadow-sm">
            <span className="material-symbols-outlined text-[18px]">verified</span>
          </span>
          <span>PayTrace</span>
        </button>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-1 bg-black/[0.04] dark:bg-white/[0.06] rounded-xl p-1 border border-black/5 dark:border-white/5">
          {navItems.map((item) => {
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={`text-[13px] px-3.5 py-1.5 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-white dark:bg-white/15 text-primary dark:text-white font-medium shadow-sm'
                    : 'text-on-surface-variant dark:text-slate-400 hover:text-on-surface dark:hover:text-white'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right Controls: Theme Toggle Only (Profile avatar removed) */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>

      {/* Mobile Navigation Drop */}
      <div className="md:hidden mt-2 rounded-xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/80 dark:border-white/10 shadow-sm flex items-center justify-around py-2 px-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActivePage(item.id)}
            className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all ${
              activePage === item.id
                ? 'bg-white dark:bg-white/15 text-primary dark:text-white shadow-sm font-semibold'
                : 'text-on-surface-variant dark:text-slate-400'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </header>
  );
};
