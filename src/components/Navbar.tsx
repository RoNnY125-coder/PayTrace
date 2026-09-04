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
    <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-5xl">
      <div className="h-14 rounded-2xl bg-white/60 dark:bg-slate-900/50 backdrop-blur-2xl shadow-[0_2px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_20px_rgba(0,0,0,0.4)] border border-white/70 dark:border-white/10 px-5 flex items-center justify-between transition-colors">
        {/* Logo */}
        <button 
          onClick={() => setActivePage('home')}
          className="text-[17px] font-semibold text-primary dark:text-white tracking-tight focus:outline-none hover:opacity-80 transition-opacity shrink-0"
        >
          PayTrace
        </button>

        {/* Center Nav */}
        <nav className="hidden md:flex items-center gap-1 bg-black/[0.03] dark:bg-white/[0.06] rounded-xl p-1">
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

        {/* Right: Theme Toggle + Avatar */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <div className="w-8 h-8 rounded-full bg-primary/10 dark:bg-white/10 flex items-center justify-center cursor-pointer hover:bg-primary/15 dark:hover:bg-white/15 transition-colors">
            <span className="material-symbols-outlined text-primary dark:text-white text-[18px]">person</span>
          </div>
        </div>
      </div>

      {/* Mobile Bar */}
      <div className="md:hidden mt-2 rounded-xl bg-white/60 dark:bg-slate-900/50 backdrop-blur-2xl border border-white/70 dark:border-white/10 shadow-sm flex items-center justify-around py-2 px-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActivePage(item.id)}
            className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all ${
              activePage === item.id
                ? 'bg-white dark:bg-white/15 text-primary dark:text-white shadow-sm'
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
