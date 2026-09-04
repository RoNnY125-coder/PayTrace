import React, { useState } from 'react';
import { NavPage } from '../types';
import { getDatasetMeta, getAllLocalTransactions } from '../services/api';

interface HomeProps {
  setActivePage: (page: NavPage) => void;
  setSelectedTxId: (id: string) => void;
}

export const Home: React.FC<HomeProps> = ({ setActivePage, setSelectedTxId }) => {
  const [txInput, setTxInput] = useState('DEMO004');

  const meta = getDatasetMeta();
  const allTx = getAllLocalTransactions();

  // Recent 6 transactions from CSV dataset for the live feed
  const recentFeeds = [
    allTx.find(t => t.transaction_id === 'DEMO001'),
    allTx.find(t => t.transaction_id === 'DEMO004'),
    allTx.find(t => t.transaction_id === 'DEMO002'),
    allTx.find(t => t.transaction_id === 'DEMO008'),
    allTx.find(t => t.transaction_id === 'TXN001'),
    allTx.find(t => t.transaction_id === 'TXN002'),
  ].filter(Boolean);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!txInput.trim()) return;
    setSelectedTxId(txInput.trim().toUpperCase());
    setActivePage('investigation');
  };

  const handleQuickSelect = (id: string) => {
    setTxInput(id);
    setSelectedTxId(id);
    setActivePage('investigation');
  };

  const scrollToTelemetry = () => {
    const el = document.getElementById('telemetry-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="flex flex-col w-full">
      {/* ── FULL-SCREEN BRUTALIST HERO SECTION (PERFECTLY CENTERED, 2-LINES) ── */}
      <section className="relative min-h-[calc(100vh-7rem)] flex flex-col justify-center items-center px-4 sm:px-6 max-w-5xl mx-auto w-full text-center py-4 sm:py-6 -mt-3 sm:-mt-6">
        {/* Subtle Ambient Lime Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] sm:w-[800px] h-[360px] bg-gradient-to-b from-[#9FE870]/12 via-[#9FE870]/4 to-transparent dark:from-[#9FE870]/8 dark:via-[#163300]/20 dark:to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

        {/* Brutalist 2-Line Headline Using Requested Google Font */}
        <h1 className="font-hero tracking-tight text-[#163300] dark:text-white font-bold text-[36px] xs:text-[44px] sm:text-[62px] md:text-[78px] lg:text-[92px] xl:text-[98px] leading-[0.94] mb-4 sm:mb-5 select-none">
          <span className="block whitespace-nowrap">Verify every payment.</span>
          <span className="block whitespace-nowrap text-[#2D5A0F] dark:text-[#9FE870] mt-1 sm:mt-2">
            Across every rail.
          </span>
        </h1>

        {/* Minimalist Subtitle */}
        <p className="font-medium text-[#596859] dark:text-[#A4B3A4] max-w-2xl mb-7 sm:mb-8 text-[15px] sm:text-[18px] leading-relaxed">
          Instant three-way reconciliation between your gateway, bank, and ledger. Deterministic truth, zero guesswork.
        </p>

        {/* Wise Iconic Pill Search Bar */}
        <div className="w-full max-w-2xl mb-5 sm:mb-6">
          <form 
            onSubmit={handleSearchSubmit}
            className="flex items-center p-1.5 sm:p-2 rounded-full bg-white dark:bg-[#131A13] shadow-[0_16px_48px_rgba(22,51,0,0.08)] dark:shadow-[0_16px_48px_rgba(0,0,0,0.6)] border-2 border-[#E2E5E9] dark:border-[#273827] focus-within:border-[#9FE870] dark:focus-within:border-[#9FE870] transition-all"
          >
            <div className="w-11 h-11 rounded-full bg-[#EBF8E3] dark:bg-[#1A2B1A] text-[#163300] dark:text-[#9FE870] flex items-center justify-center shrink-0 ml-1">
              <span className="material-symbols-outlined text-[22px]">search</span>
            </div>
            <input 
              className="flex-1 px-4 py-2 bg-transparent text-[#163300] dark:text-white placeholder:text-[#8D9B8D] dark:placeholder:text-[#647464] font-mono text-sm sm:text-base font-medium focus:outline-none"
              placeholder="Enter transaction ID e.g. DEMO004" 
              type="text" 
              value={txInput}
              onChange={(e) => setTxInput(e.target.value)}
            />
            <button 
              type="submit"
              className="px-6 py-3 rounded-full bg-[#163300] text-[#9FE870] hover:bg-[#244D00] dark:bg-[#9FE870] dark:text-[#163300] dark:hover:bg-[#B5F58D] font-bold text-xs sm:text-sm transition-all duration-200 flex items-center gap-1.5 shrink-0 shadow-md hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Verify</span>
              <span className="material-symbols-outlined text-[17px]">arrow_forward</span>
            </button>
          </form>
        </div>

        {/* Minimal Quick Benchmarks */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-2">
          <span className="text-xs font-mono uppercase tracking-wider text-[#596859] dark:text-[#8A988A] mr-1">
            Try:
          </span>
          {[
            { id: 'DEMO001', label: 'DEMO001 (Settled)' },
            { id: 'DEMO002', label: 'DEMO002 (Bank Delay)' },
            { id: 'DEMO004', label: 'DEMO004 (Mismatch)' },
            { id: 'DEMO006', label: 'DEMO006 (Failed)' },
          ].map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => handleQuickSelect(s.id)}
              className="px-3.5 py-1.5 rounded-full text-xs font-mono font-bold bg-white dark:bg-[#131A13] text-[#163300] dark:text-[#F2F5F2] hover:bg-[#9FE870] hover:text-[#163300] dark:hover:bg-[#9FE870] dark:hover:text-[#163300] border border-[#E2E5E9] dark:border-[#273827] shadow-sm hover:scale-105 active:scale-95 transition-all"
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Centered Subtle Scroll Indicator */}
        <div className="mt-8 sm:mt-10 flex flex-col items-center">
          <button 
            onClick={scrollToTelemetry}
            className="flex items-center gap-2 text-xs font-mono font-semibold text-[#596859] dark:text-[#9DA99D] hover:text-[#163300] dark:hover:text-white transition-colors cursor-pointer group"
          >
            <span>Live Settlement Telemetry</span>
            <span className="material-symbols-outlined text-[18px] transition-transform group-hover:translate-y-1">arrow_downward</span>
          </button>
        </div>
      </section>

      {/* ── REAL-TIME TELEMETRY SECTION (WISE MINIMALIST CARDS) ─────────────── */}
      <section id="telemetry-section" className="max-w-6xl mx-auto px-4 sm:px-6 w-full py-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <span className="px-3.5 py-1 rounded-full bg-[#EBF8E3] dark:bg-[#1A2B1A] text-[#163300] dark:text-[#9FE870] text-xs font-mono font-bold uppercase tracking-wider">
                Real-Time Telemetry
              </span>
            </div>
            <h2 className="text-[32px] sm:text-[42px] font-black text-[#163300] dark:text-white tracking-tight">
              Live Settlement Overview
            </h2>
            <p className="text-base text-[#596859] dark:text-[#9DA99D] mt-1.5 max-w-xl">
              Cross-rail status for 291 audited payments across gateway, bank, and ledger.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#9FE870] animate-pulse" />
            <span className="text-xs font-mono font-bold text-[#163300] dark:text-[#9FE870]">LIVE FEED</span>
          </div>
        </div>

        {/* 3 Real Telemetry Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Metric 1: Total Volume */}
          <div className="p-8 rounded-3xl bg-white dark:bg-[#131A13] border border-[#E2E5E9] dark:border-[#273827] shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between mb-5">
              <span className="text-xs text-[#596859] dark:text-[#9DA99D] uppercase tracking-wider font-mono font-bold">
                Total Volume
              </span>
              <div className="w-10 h-10 rounded-full bg-[#EBF8E3] dark:bg-[#1A2B1A] text-[#163300] dark:text-[#9FE870] flex items-center justify-center">
                <span className="material-symbols-outlined text-[22px]">payments</span>
              </div>
            </div>
            <div>
              <div className="font-mono mb-2 font-black text-[34px] sm:text-[40px] text-[#163300] dark:text-white">
                ₹{meta.total_volume.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EBF8E3] dark:bg-[#1A2B1A] text-xs text-[#163300] dark:text-[#9FE870] font-bold">
                <span className="material-symbols-outlined text-[15px]">verified</span>
                <span>291 Audited Records</span>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-[#F0F2F5] dark:border-[#243324] flex justify-between text-xs text-[#596859] dark:text-[#9DA99D]">
              <span>Date Batches</span>
              <span className="font-mono font-bold text-[#163300] dark:text-white">Sep 01 - Sep 03, 2026</span>
            </div>
          </div>

          {/* Metric 2: Settlement Resolution */}
          <div className="p-8 rounded-3xl bg-white dark:bg-[#131A13] border border-[#E2E5E9] dark:border-[#273827] shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between mb-5">
              <span className="text-xs text-[#596859] dark:text-[#9DA99D] uppercase tracking-wider font-mono font-bold">
                Settlement Rate
              </span>
              <div className="w-10 h-10 rounded-full bg-[#9FE870] text-[#163300] flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-[22px]">check_circle</span>
              </div>
            </div>
            <div>
              <div className="font-mono mb-2 font-black text-[34px] sm:text-[40px] text-[#163300] dark:text-white">
                {((meta.status_counts['SETTLED'] / meta.total_transactions) * 100).toFixed(1)}%
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#9FE870]/20 text-xs text-[#163300] dark:text-[#9FE870] font-bold">
                <span className="material-symbols-outlined text-[15px]">done_all</span>
                <span>{meta.status_counts['SETTLED']} Settled Cleanly</span>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-[#F0F2F5] dark:border-[#243324] flex justify-between text-xs text-[#596859] dark:text-[#9DA99D]">
              <span>In-Flight Delays</span>
              <span className="font-mono font-bold text-[#B45309] dark:text-[#FBBF24]">{meta.status_counts['DELAYED'] + meta.status_counts['LEDGER_DELAY']} items</span>
            </div>
          </div>

          {/* Metric 3: Exception Detection */}
          <div className="p-8 rounded-3xl bg-white dark:bg-[#131A13] border border-[#E2E5E9] dark:border-[#273827] shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between mb-5">
              <span className="text-xs text-[#596859] dark:text-[#9DA99D] uppercase tracking-wider font-mono font-bold">
                Exceptions
              </span>
              <div className="w-10 h-10 rounded-full bg-[#FEF3C7] text-[#B45309] flex items-center justify-center">
                <span className="material-symbols-outlined text-[22px]">warning</span>
              </div>
            </div>
            <div>
              <div className="font-mono mb-2 font-black text-[34px] sm:text-[40px] text-[#163300] dark:text-white">
                {meta.status_counts['CRITICAL_EXCEPTION'] + meta.status_counts['EXCEPTION'] + meta.status_counts['DATA_INCONSISTENCY']}
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FEF3C7] text-xs text-[#B45309] font-bold">
                <span className="material-symbols-outlined text-[15px]">warning</span>
                <span>Discrepancies Flagged</span>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-[#F0F2F5] dark:border-[#243324] flex justify-between text-xs text-[#596859] dark:text-[#9DA99D]">
              <span>Failures &amp; Rejections</span>
              <span className="font-mono font-bold text-[#163300] dark:text-white">{meta.status_counts['FAILED'] + meta.status_counts['REJECTED']} cases</span>
            </div>
          </div>
        </div>

        {/* ── AUDIT TRAIL STREAM TABLE (WISE ROW LIST) ────────────────────────── */}
        <div className="p-8 sm:p-9 rounded-3xl bg-white dark:bg-[#131A13] border border-[#E2E5E9] dark:border-[#273827] shadow-sm">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-7">
            <div>
              <h3 className="text-[22px] font-extrabold text-[#163300] dark:text-white tracking-tight">
                Recent Transfers
              </h3>
              <p className="text-xs sm:text-sm text-[#596859] dark:text-[#9DA99D] mt-0.5">
                Click any transfer to inspect verification breakdown
              </p>
            </div>
            <button
              onClick={() => setActivePage('dashboard')}
              className="px-6 py-2.5 rounded-full bg-[#EBF8E3] dark:bg-[#1A2B1A] hover:bg-[#9FE870] hover:text-[#163300] dark:hover:bg-[#9FE870] dark:hover:text-[#163300] text-[#163300] dark:text-[#9FE870] text-xs sm:text-sm font-bold transition-all flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>View All 291 Transfers</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>

          <div className="flex flex-col gap-2.5">
            {recentFeeds.map((tx) => {
              if (!tx) return null;
              const isSettled = tx.overall_status === 'SETTLED';
              const isDelayed = tx.overall_status === 'DELAYED' || tx.overall_status === 'LEDGER_DELAY';
              const isException = tx.overall_status === 'CRITICAL_EXCEPTION' || tx.overall_status === 'EXCEPTION' || tx.overall_status === 'DATA_INCONSISTENCY';

              return (
                <div 
                  key={tx.transaction_id}
                  onClick={() => handleQuickSelect(tx.transaction_id)}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-2xl bg-[#F8F9FA] dark:bg-[#182218] hover:bg-[#EBF8E3] dark:hover:bg-[#1D291D] border border-transparent hover:border-[#9FE870]/50 transition-all cursor-pointer gap-4 group"
                >
                  <div className="flex items-center gap-3.5">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0 transition-transform group-hover:scale-105 ${
                      isSettled ? 'bg-[#9FE870] text-[#163300]' :
                      isDelayed ? 'bg-[#FEF3C7] text-[#B45309]' :
                      isException ? 'bg-[#FEE2E2] text-[#B91C1C]' :
                      'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                    }`}>
                      <span className="material-symbols-outlined text-[19px]">
                        {isSettled ? 'done_all' : isDelayed ? 'schedule' : isException ? 'error' : 'receipt_long'}
                      </span>
                    </div>
                    <div>
                      <div className="font-mono font-bold text-[#163300] dark:text-white text-base flex items-center gap-2">
                        <span>{tx.transaction_id}</span>
                        {tx.delay_point && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#B45309] font-mono font-bold">
                            Delay: {tx.delay_point}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-[#596859] dark:text-[#9DA99D] truncate max-w-lg mt-0.5">
                        {tx.evidence[0] || 'Reconciled multi-rail settlement stream'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-5 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="text-right font-mono">
                      <div className="font-bold text-[#163300] dark:text-white text-sm">
                        {tx.currency === 'USD' ? '$' : '₹'}{tx.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}
                      </div>
                      <div className="text-[11px] text-[#596859] dark:text-[#9DA99D]">
                        {tx.gateway.timestamp || '2026-09-01'}
                      </div>
                    </div>

                    <span className={`px-3 py-1 rounded-full text-xs font-bold font-mono ${
                      isSettled ? 'bg-[#9FE870] text-[#163300]' :
                      isDelayed ? 'bg-[#FEF3C7] text-[#B45309]' :
                      isException ? 'bg-[#FEE2E2] text-[#B91C1C]' :
                      'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                    }`}>
                      {isSettled ? 'Settled' : tx.overall_status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};
