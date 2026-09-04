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
      {/* ── FULL-SCREEN HERO SECTION (CONFIDENT WHITESPACE & 2-LINE HEADLINE) ── */}
      <section className="relative min-h-[85vh] flex flex-col justify-center items-center px-4 sm:px-6 max-w-5xl mx-auto w-full text-center py-16 sm:py-24">
        {/* Brutalist 2-Line Headline Using Google Font */}
        <h1 className="font-hero tracking-tight text-[#14151A] dark:text-[#EDEDF0] font-bold text-[38px] xs:text-[46px] sm:text-[64px] md:text-[80px] lg:text-[92px] xl:text-[98px] leading-[0.96] mb-6 select-none">
          <span className="block whitespace-nowrap">Verify every payment.</span>
          <span className="block whitespace-nowrap text-[#6C6D77] dark:text-[#9FE870] mt-1 sm:mt-2">
            Across every rail.
          </span>
        </h1>

        {/* Minimalist Subtitle */}
        <p className="font-normal text-[#6C6D77] dark:text-[#9B9CA6] max-w-2xl mb-10 text-[15px] sm:text-[18px] leading-relaxed">
          Instant three-way reconciliation between your gateway, bank, and ledger. Deterministic truth, zero guesswork.
        </p>

        {/* Wise Large Pill Search Bar with Soft Internal Padding */}
        <div className="w-full max-w-2xl mb-8">
          <form 
            onSubmit={handleSearchSubmit}
            className="flex items-center p-2 sm:p-2.5 rounded-full bg-white dark:bg-[#1E1F26] border border-[#E2E5E9] dark:border-[#2E2F38] focus-within:border-[#9FE870] transition-colors"
          >
            <div className="w-11 h-11 rounded-full bg-[#F4F5F7] dark:bg-[#26272E] text-[#6C6D77] dark:text-[#9B9CA6] flex items-center justify-center shrink-0 ml-1">
              <span className="material-symbols-outlined text-[20px]">search</span>
            </div>
            <input 
              className="flex-1 px-4 py-2 bg-transparent text-[#14151A] dark:text-[#EDEDF0] placeholder:text-[#9B9CA6] dark:placeholder:text-[#6C6D77] text-sm sm:text-base font-normal focus:outline-none"
              placeholder="Enter transaction ID e.g. DEMO004" 
              type="text" 
              value={txInput}
              onChange={(e) => setTxInput(e.target.value)}
            />
            <button 
              type="submit"
              className="px-7 py-3 rounded-full bg-[#14151A] text-[#9FE870] hover:bg-[#26272E] dark:bg-[#9FE870] dark:text-[#14151A] dark:hover:bg-[#B5F58D] font-semibold text-xs sm:text-sm transition-colors flex items-center gap-1.5 shrink-0"
            >
              <span>Verify</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </form>
        </div>

        {/* Small Rounded Pill Demo Chips with Clear Spacing */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <span className="text-xs uppercase tracking-wider text-[#6C6D77] dark:text-[#9B9CA6] font-medium mr-1">
            TRY:
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
              className="px-3.5 py-1.5 rounded-full text-xs font-medium bg-[#E8EAEF] text-[#6C6D77] dark:bg-[#1E1F26] dark:text-[#9B9CA6] border border-[#DFE2E6] dark:border-[#2E2F38] hover:bg-[#9FE870]/15 hover:text-[#14151A] dark:hover:text-[#9FE870] hover:border-[#9FE870]/40 transition-colors"
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Centered Understated Scroll Indicator */}
        <div className="mt-14 sm:mt-16 flex flex-col items-center">
          <button 
            onClick={scrollToTelemetry}
            className="flex items-center gap-2 text-xs font-medium text-[#6C6D77] dark:text-[#9B9CA6] hover:text-[#14151A] dark:hover:text-[#EDEDF0] transition-colors cursor-pointer group"
          >
            <span>Live Settlement Telemetry</span>
            <span className="material-symbols-outlined text-[16px] transition-transform group-hover:translate-y-0.5">arrow_downward</span>
          </button>
        </div>
      </section>

      {/* ── REAL-TIME TELEMETRY SECTION (CONFIDENT CARD LAYOUT) ─────────────── */}
      <section id="telemetry-section" className="max-w-6xl mx-auto px-6 sm:px-8 w-full py-20 sm:py-24">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-[#9FE870]/10 text-[#2D5A0F] dark:text-[#9FE870] text-xs font-semibold uppercase tracking-wider border border-[#9FE870]/20">
                Real-Time Telemetry
              </span>
            </div>
            <h2 className="text-[30px] sm:text-[36px] font-bold text-[#14151A] dark:text-[#EDEDF0] tracking-tight">
              Live Settlement Overview
            </h2>
            <p className="text-sm sm:text-base text-[#6C6D77] dark:text-[#9B9CA6] mt-1 max-w-xl">
              Cross-rail status for 291 audited payments across gateway, bank, and ledger.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#9FE870]" />
            <span className="text-xs font-medium text-[#6C6D77] dark:text-[#9B9CA6]">LIVE FEED</span>
          </div>
        </div>

        {/* 3 Real Telemetry Metric Cards with 24-32px Padding & Big Numbers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Metric 1: Total Volume */}
          <div className="p-7 sm:p-8 rounded-3xl bg-white dark:bg-[#1E1F26] border border-[#E2E5E9] dark:border-[#2E2F38] flex flex-col justify-between">
            <div className="flex items-center justify-between mb-6">
              <span className="text-xs text-[#6C6D77] dark:text-[#9B9CA6] uppercase tracking-wider font-semibold">
                Total Volume
              </span>
              <div className="w-9 h-9 rounded-full bg-[#F4F5F7] dark:bg-[#26272E] text-[#14151A] dark:text-[#EDEDF0] flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">payments</span>
              </div>
            </div>
            <div>
              <div className="mb-2 font-bold text-[34px] sm:text-[40px] text-[#14151A] dark:text-[#EDEDF0] tracking-tight">
                ₹{meta.total_volume.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#9FE870]/10 text-xs text-[#2D5A0F] dark:text-[#9FE870] font-semibold border border-[#9FE870]/20">
                <span className="material-symbols-outlined text-[14px]">verified</span>
                <span>291 Audited Records</span>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-[#E8EAEF] dark:border-[#26272E] flex justify-between text-xs text-[#6C6D77] dark:text-[#9B9CA6]">
              <span>Date Batches</span>
              <span className="font-medium text-[#14151A] dark:text-[#EDEDF0]">Sep 01 - Sep 03, 2026</span>
            </div>
          </div>

          {/* Metric 2: Settlement Rate */}
          <div className="p-7 sm:p-8 rounded-3xl bg-white dark:bg-[#1E1F26] border border-[#E2E5E9] dark:border-[#2E2F38] flex flex-col justify-between">
            <div className="flex items-center justify-between mb-6">
              <span className="text-xs text-[#6C6D77] dark:text-[#9B9CA6] uppercase tracking-wider font-semibold">
                Settlement Rate
              </span>
              <div className="w-9 h-9 rounded-full bg-[#9FE870]/15 text-[#2D5A0F] dark:text-[#9FE870] flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
              </div>
            </div>
            <div>
              <div className="mb-2 font-bold text-[34px] sm:text-[40px] text-[#14151A] dark:text-[#EDEDF0] tracking-tight">
                {((meta.status_counts['SETTLED'] / meta.total_transactions) * 100).toFixed(1)}%
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#9FE870]/10 text-xs text-[#2D5A0F] dark:text-[#9FE870] font-semibold border border-[#9FE870]/20">
                <span className="material-symbols-outlined text-[14px]">done_all</span>
                <span>{meta.status_counts['SETTLED']} Settled Cleanly</span>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-[#E8EAEF] dark:border-[#26272E] flex justify-between text-xs text-[#6C6D77] dark:text-[#9B9CA6]">
              <span>In-Flight Delays</span>
              <span className="font-medium text-[#F0B84B]">{meta.status_counts['DELAYED'] + meta.status_counts['LEDGER_DELAY']} items</span>
            </div>
          </div>

          {/* Metric 3: Exceptions */}
          <div className="p-7 sm:p-8 rounded-3xl bg-white dark:bg-[#1E1F26] border border-[#E2E5E9] dark:border-[#2E2F38] flex flex-col justify-between">
            <div className="flex items-center justify-between mb-6">
              <span className="text-xs text-[#6C6D77] dark:text-[#9B9CA6] uppercase tracking-wider font-semibold">
                Exceptions
              </span>
              <div className="w-9 h-9 rounded-full bg-[#F1483F]/12 text-[#F1483F] flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">warning</span>
              </div>
            </div>
            <div>
              <div className="mb-2 font-bold text-[34px] sm:text-[40px] text-[#14151A] dark:text-[#EDEDF0] tracking-tight">
                {meta.status_counts['CRITICAL_EXCEPTION'] + meta.status_counts['EXCEPTION'] + meta.status_counts['DATA_INCONSISTENCY']}
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F1483F]/10 text-xs text-[#F1483F] font-semibold border border-[#F1483F]/20">
                <span className="material-symbols-outlined text-[14px]">warning</span>
                <span>Discrepancies Flagged</span>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-[#E8EAEF] dark:border-[#26272E] flex justify-between text-xs text-[#6C6D77] dark:text-[#9B9CA6]">
              <span>Failures &amp; Rejections</span>
              <span className="font-medium text-[#E8615C]">{meta.status_counts['FAILED'] + meta.status_counts['REJECTED']} cases</span>
            </div>
          </div>
        </div>

        {/* ── RECENT TRANSFERS STREAM CARD ────────────────────────────────────── */}
        <div className="p-7 sm:p-8 rounded-3xl bg-white dark:bg-[#1E1F26] border border-[#E2E5E9] dark:border-[#2E2F38]">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-7">
            <div>
              <h3 className="text-xl sm:text-2xl font-semibold text-[#14151A] dark:text-[#EDEDF0] tracking-tight">
                Recent Transfers
              </h3>
              <p className="text-xs sm:text-sm text-[#6C6D77] dark:text-[#9B9CA6] mt-0.5">
                Click any transfer to inspect verification breakdown
              </p>
            </div>
            <button
              onClick={() => setActivePage('dashboard')}
              className="px-5 py-2.5 rounded-full bg-[#F4F5F7] dark:bg-[#26272E] hover:bg-[#E8EAEF] dark:hover:bg-[#2E2F38] text-[#14151A] dark:text-[#EDEDF0] text-xs font-semibold transition-colors flex items-center gap-2 border border-[#E2E5E9] dark:border-[#2E2F38]"
            >
              <span>View All 291 Transfers</span>
              <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {recentFeeds.map((tx) => {
              if (!tx) return null;
              const isSettled = tx.overall_status === 'SETTLED';
              const isDelayed = tx.overall_status === 'DELAYED' || tx.overall_status === 'LEDGER_DELAY';
              const isException = tx.overall_status === 'CRITICAL_EXCEPTION' || tx.overall_status === 'EXCEPTION' || tx.overall_status === 'DATA_INCONSISTENCY';

              return (
                <div 
                  key={tx.transaction_id}
                  onClick={() => handleQuickSelect(tx.transaction_id)}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-5 rounded-2xl bg-[#F8F9FA] dark:bg-[#14151A] hover:bg-[#F0F2F5] dark:hover:bg-[#26272E] border border-transparent hover:border-[#E2E5E9] dark:hover:border-[#2E2F38] transition-colors cursor-pointer gap-4 group"
                >
                  <div className="flex items-center gap-3.5">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      isSettled ? 'bg-[#9FE870]/12 text-[#2D5A0F] dark:text-[#9FE870]' :
                      isDelayed ? 'bg-[#F0B84B]/12 text-[#875800] dark:text-[#F0B84B]' :
                      isException ? 'bg-[#F1483F]/12 text-[#9E1B1B] dark:text-[#F1483F]' :
                      'bg-[#E8EAEF] dark:bg-[#26272E] text-[#6C6D77] dark:text-[#9B9CA6]'
                    }`}>
                      <span className="material-symbols-outlined text-[18px]">
                        {isSettled ? 'done_all' : isDelayed ? 'schedule' : isException ? 'warning' : 'receipt_long'}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold text-[#14151A] dark:text-[#EDEDF0] text-sm sm:text-base flex items-center gap-2">
                        <span className="tabular-nums font-mono">{tx.transaction_id}</span>
                        {tx.delay_point && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F0B84B]/12 text-[#875800] dark:text-[#F0B84B] font-medium border border-[#F0B84B]/20">
                            Delay: {tx.delay_point}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-[#6C6D77] dark:text-[#9B9CA6] truncate max-w-lg mt-0.5">
                        {tx.evidence[0] || 'Reconciled multi-rail settlement stream'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-5 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="text-right">
                      <div className="font-semibold text-[#14151A] dark:text-[#EDEDF0] text-sm sm:text-base tabular-nums">
                        {tx.currency === 'USD' ? '$' : '₹'}{tx.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}
                      </div>
                      <div className="text-[11px] text-[#6C6D77] dark:text-[#9B9CA6]">
                        {tx.gateway.timestamp || '2026-09-01'}
                      </div>
                    </div>

                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      isSettled ? 'bg-[#9FE870]/12 text-[#2D5A0F] dark:text-[#9FE870] border border-[#9FE870]/20' :
                      isDelayed ? 'bg-[#F0B84B]/12 text-[#875800] dark:text-[#F0B84B] border border-[#F0B84B]/20' :
                      isException ? 'bg-[#F1483F]/12 text-[#9E1B1B] dark:text-[#F1483F] border border-[#F1483F]/20' :
                      'bg-[#E8EAEF] dark:bg-[#26272E] text-[#6C6D77] dark:text-[#9B9CA6] border border-[#DFE2E6] dark:border-[#2E2F38]'
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
