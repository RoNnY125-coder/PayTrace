import React, { useState, useEffect } from 'react';
import Lenis from 'lenis';
import { NavPage } from './types';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { Dashboard } from './pages/Dashboard';
import { Investigation } from './pages/Investigation';
import { StatesDebug } from './pages/StatesDebug';
import { motion, AnimatePresence } from 'framer-motion';

export const App: React.FC = () => {
  const [activePage, setActivePage] = useState<NavPage>('home');
  const [selectedTxId, setSelectedTxId] = useState<string>('tx_984192841');

  // Initialize Lenis smooth scroll
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.0,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    const rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  // Scroll to top when activePage changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activePage]);

  // Page transition animation
  const pageVariants = {
    initial: {
      opacity: 0,
      y: 6,
    },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.22,
        ease: [0.22, 1, 0.36, 1],
      },
    },
    exit: {
      opacity: 0,
      y: -6,
      transition: {
        duration: 0.16,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  return (
    <div className="min-h-screen bg-[#F4F5F7] dark:bg-[#14151A] font-sans text-[#14151A] dark:text-[#EDEDF0] transition-colors duration-200 relative selection:bg-[#9FE870] selection:text-[#14151A]">
      {/* Floating Centered Wise Pill Navbar */}
      <Navbar activePage={activePage} setActivePage={setActivePage} />

      {/* Main Content Area with appropriate top padding for floating navbar */}
      <main className={`w-full ${activePage === 'home' ? 'pt-18 sm:pt-20' : 'pt-28'} min-h-[calc(100vh-6rem)]`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activePage}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full"
          >
            {activePage === 'home' && (
              <Home setActivePage={setActivePage} setSelectedTxId={setSelectedTxId} />
            )}
            {activePage === 'dashboard' && (
              <Dashboard setActivePage={setActivePage} setSelectedTxId={setSelectedTxId} />
            )}
            {activePage === 'investigation' && (
              <Investigation txId={selectedTxId} setActivePage={setActivePage} />
            )}
            {activePage === 'states-debug' && (
              <StatesDebug setActivePage={setActivePage} setSelectedTxId={setSelectedTxId} />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};
