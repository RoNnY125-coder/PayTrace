import React, { useState } from 'react';
import { NavPage } from '../types';
import { getDatasetMeta, getAllLocalTransactions } from '../services/api';

interface HomeProps {
  setActivePage: (page: NavPage) => void;
  setSelectedTxId: (id: string) => void;
}

export const Home: React.FC<HomeProps> = ({ setActivePage, setSelectedTxId }) => {
  const [txInput, setTxInput] = useState('DEMO004');
  const [selectedDate, setSelectedDate] = useState('2026-09-01');

  const meta = getDatasetMeta();
  const allTx = getAllLocalTransactions();

  // Pick notable benchmark scenarios from the CSV
  const benchmarkScenarios = [
    { id: 'DEMO001', label: 'DEMO001', desc: 'Settled Match', color: 'text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
    { id: 'DEMO002', label: 'DEMO002', desc: 'Bank Delay', color: 'text-amber-700 dark:text-amber-400 bg-amber-500/10 border-amber-500/20' },
    { id: 'DEMO003', label: 'DEMO003', desc: 'Ledger Delay', color: 'text-sky-700 dark:text-sky-400 bg-sky-500/10 border-sky-500/20' },
    { id: 'DEMO004', label: 'DEMO004', desc: 'Amount Mismatch (₹1500 vs ₹1200)', color: 'text-red-700 dark:text-red-400 bg-red-500/10 border-red-500/20' },
    { id: 'DEMO008', label: 'DEMO008', desc: 'Currency Mismatch (INR vs USD)', color: 'text-purple-700 dark:text-purple-400 bg-purple-500/10 border-purple-500/20' },
    { id: 'DEMO010', label: 'DEMO010', desc: 'Duplicate Gateway', color: 'text-rose-700 dark:text-rose-400 bg-rose-500/10 border-rose-500/20' },
  ];

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

  const handleBrowseByDate = () => {
    setActivePage('dashboard');
  };

  const scrollToTelemetry = () => {
    const el = document.getElementById('telemetry-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="flex flex-col w-full">
      {/* ── FULL-SCREEN HERO SECTION ────────────────────────────────────────── */}
      <section className="relative min-h-[calc(100vh-5rem)] flex flex-col justify-center items-center px-gutter max-w-7xl mx-auto w-full text-center py-12">
        {/* Diffused institutional ambient backlight */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-b from-blue-600/10 via-indigo-500/5 to-transparent dark:from-blue-600/15 dark:via-cyan-500/5 dark:to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

        {/* Engine Specification Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl text-on-surface-variant dark:text-slate-300 text-label-sm mb-6 shadow-sm border border-white/80 dark:border-white/10">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="font-medium tracking-wide">Deterministic Truth &amp; Reconciliation Engine v4.2</span>
          <span className="text-black/20 dark:text-white/20">|</span>
          <span className="text-blue-600 dark:text-blue-400 font-mono">291 CSV Audited Records</span>
        </div>

        {/* Product Title */}
        <h1 className="text-primary dark:text-white max-w-4xl mb-4 tracking-tight text-[36px] sm:text-[48px] md:text-[54px] font-bold leading-[1.1]">
          Autonomous Settlement Investigation Platform
        </h1>

        {/* Value Proposition */}
        <p className="font-body-lg text-on-surface-variant dark:text-slate-300 max-w-2xl mb-8 leading-relaxed text-[16px] sm:text-[18px]">
          Deterministic cross-rail verification between <strong className="text-primary dark:text-white font-semibold">Gateway</strong>, <strong className="text-primary dark:text-white font-semibold">Bank</strong>, and <strong className="text-primary dark:text-white font-semibold">General Ledger</strong>. AI explains verified facts with zero hallucination.
        </p>

        {/* Central Investigation Terminal Card */}
        <div className="w-full max-w-2xl p-6 sm:p-8 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl shadow-[0_8px_32px_rgba(8,24,55,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)] border border-white/80 dark:border-white/10 relative transition-all">
          <form className="flex flex-col gap-4" onSubmit={handleSearchSubmit}>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-4 text-outline dark:text-slate-400 text-[22px]">search</span>
              <input 
                className="w-full pl-12 pr-14 py-4 rounded-2xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/5 dark:border-white/10 text-on-surface dark:text-white placeholder:text-outline dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 dark:focus:ring-blue-500 font-mono text-body-lg font-medium transition-all" 
                id="tx-input" 
                placeholder="Enter Transaction ID (e.g. DEMO004, DEMO001, TXN001)" 
                type="text" 
                value={txInput}
                onChange={(e) => setTxInput(e.target.value)}
              />
              <div className="absolute right-3.5 hidden sm:flex items-center gap-1 px-2 py-1 rounded-md bg-black/[0.04] dark:bg-white/[0.08] text-outline dark:text-slate-400 text-label-sm font-mono border border-black/5 dark:border-white/5">
                <span>⌘</span>K
              </div>
            </div>

            {/* Quick Benchmark Test Chips */}
            <div className="flex flex-col items-start gap-2 pt-1 text-left">
              <span className="text-[11px] font-mono uppercase tracking-wider text-on-surface-variant dark:text-slate-400">
                Live Test Scenarios (from CSV):
              </span>
              <div className="flex flex-wrap gap-1.5 w-full">
                {benchmarkScenarios.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleQuickSelect(s.id)}
                    className={`text-[12px] px-2.5 py-1 rounded-lg border font-mono font-medium transition-all hover:scale-[1.02] active:scale-[0.98] ${s.color}`}
                  >
                    {s.label}: {s.desc}
                  </button>
                ))}
              </div>
            </div>

            {/* Terminal Actions Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-black/[0.04] dark:border-white/10">
              <div className="flex items-center gap-2 text-body-sm text-on-surface-variant dark:text-slate-300">
                <span className="material-symbols-outlined text-[16px] text-emerald-600 dark:text-emerald-400">verified_user</span>
                <span>Deterministic rules engine active • Multi-ledger verified</span>
              </div>
              <button 
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-body-md transition-all shadow-sm flex items-center justify-center gap-2 active:scale-[0.98]" 
                type="submit"
              >
                <span>Investigate Case</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          </form>
        </div>

        {/* Secondary Bar: Live Date Filter */}
        <div className="w-full max-w-xl mt-6 p-3 px-5 rounded-2xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border border-white/70 dark:border-white/10 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 dark:bg-blue-950/70 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <span className="material-symbols-outlined text-[18px]">calendar_month</span>
            </div>
            <div className="text-left">
              <div className="text-body-sm font-semibold text-primary dark:text-white">Audit Trail by Batch Date</div>
              <div className="text-[11px] text-on-surface-variant dark:text-slate-400">Dataset contains 291 ledger transactions</div>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/5 dark:border-white/10 text-on-surface dark:text-white text-body-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:focus:ring-blue-500 cursor-pointer"
            >
              {meta.dates.map(d => (
                <option key={d} value={d} className="dark:bg-slate-900 text-on-surface dark:text-white">
                  {d} (Batch)
                </option>
              ))}
            </select>
            <button 
              className="px-3.5 py-1.5 rounded-xl bg-black/[0.04] dark:bg-white/[0.08] hover:bg-black/[0.08] dark:hover:bg-white/[0.12] text-on-surface dark:text-white text-body-sm font-medium transition-colors border border-black/5 dark:border-white/10 whitespace-nowrap" 
              onClick={handleBrowseByDate}
            >
              View Dashboard
            </button>
          </div>
        </div>

        {/* Scroll Indicator to reveal Real-Time Telemetry */}
        <div className="mt-12 flex flex-col items-center">
          <button 
            onClick={scrollToTelemetry}
            className="flex items-center gap-1.5 text-label-sm font-mono text-on-surface-variant dark:text-slate-400 hover:text-primary dark:hover:text-white transition-colors cursor-pointer group"
          >
            <span>Scroll down for real-time telemetry</span>
            <span className="material-symbols-outlined text-[16px] transition-transform group-hover:translate-y-0.5">expand_more</span>
          </button>
        </div>
      </section>

      {/* ── REAL-TIME TELEMETRY SECTION (REVEALED AFTER SCROLLING) ───────────── */}
      <section id="telemetry-section" className="max-w-7xl mx-auto px-gutter w-full py-12 pt-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-300 text-label-sm font-mono uppercase tracking-wider font-semibold border border-blue-500/20">
                Telemetry Stream
              </span>
              <span className="text-body-sm text-on-surface-variant dark:text-slate-400 font-mono">
                Source: gateway.csv, bank.csv, ledger.csv
              </span>
            </div>
            <h2 className="font-headline-lg text-primary dark:text-white font-semibold text-[26px]">
              Real-Time Settlement Telemetry
            </h2>
            <p className="text-body-sm text-on-surface-variant dark:text-slate-400">
              Aggregated statistics across all 291 audited transactions in the dataset
            </p>
          </div>
        </div>

        {/* 3 Real Telemetry Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Metric 1: Total Volume */}
          <div className="p-6 rounded-2xl bg-white/70 dark:bg-slate-900/50 backdrop-blur-2xl border border-white/80 dark:border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.4)] flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-label-sm text-on-surface-variant dark:text-slate-400 uppercase tracking-wider font-mono">
                Total Ingested Volume
              </span>
              <span className="p-2 rounded-xl bg-blue-500/10 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                <span className="material-symbols-outlined text-[20px]">payments</span>
              </span>
            </div>
            <div>
              <div className="font-headline-xl text-primary dark:text-white font-mono mb-1 font-bold text-[32px]">
                ₹{meta.total_volume.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="flex items-center gap-1 text-body-sm text-emerald-600 dark:text-emerald-400 font-medium">
                <span className="material-symbols-outlined text-[16px]">verified</span>
                <span>291 Audited Transactions Verified</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-black/[0.04] dark:border-white/10 flex justify-between text-body-sm text-on-surface-variant dark:text-slate-400">
              <span>Date Batches</span>
              <span className="font-mono font-semibold text-primary dark:text-white">Sep 01 - Sep 03, 2026</span>
            </div>
          </div>

          {/* Metric 2: Reconciliation Rate */}
          <div className="p-6 rounded-2xl bg-white/70 dark:bg-slate-900/50 backdrop-blur-2xl border border-white/80 dark:border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.4)] flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-label-sm text-on-surface-variant dark:text-slate-400 uppercase tracking-wider font-mono">
                Settlement Resolution
              </span>
              <span className="p-2 rounded-xl bg-emerald-500/10 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                <span className="material-symbols-outlined text-[20px]">check_circle</span>
              </span>
            </div>
            <div>
              <div className="font-headline-xl text-primary dark:text-white font-mono mb-1 font-bold text-[32px]">
                {((meta.status_counts['SETTLED'] / meta.total_transactions) * 100).toFixed(1)}%
              </div>
              <div className="flex items-center gap-1 text-body-sm text-emerald-600 dark:text-emerald-400 font-medium">
                <span className="material-symbols-outlined text-[16px]">done_all</span>
                <span>{meta.status_counts['SETTLED']} Fully Settled Match</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-black/[0.04] dark:border-white/10 flex justify-between text-body-sm text-on-surface-variant dark:text-slate-400">
              <span>In-Flight Delays</span>
              <span className="font-mono font-semibold text-amber-600 dark:text-amber-400">{meta.status_counts['DELAYED'] + meta.status_counts['LEDGER_DELAY']} items</span>
            </div>
          </div>

          {/* Metric 3: Anomaly & Exception Flagging */}
          <div className="p-6 rounded-2xl bg-white/70 dark:bg-slate-900/50 backdrop-blur-2xl border border-white/80 dark:border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.4)] flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-label-sm text-on-surface-variant dark:text-slate-400 uppercase tracking-wider font-mono">
                Exception Detection
              </span>
              <span className="p-2 rounded-xl bg-red-500/10 dark:bg-red-950/60 text-red-600 dark:text-red-400">
                <span className="material-symbols-outlined text-[20px]">shield_alert</span>
              </span>
            </div>
            <div>
              <div className="font-headline-xl text-red-600 dark:text-red-400 font-mono mb-1 font-bold text-[32px]">
                {meta.status_counts['CRITICAL_EXCEPTION'] + meta.status_counts['EXCEPTION'] + meta.status_counts['DATA_INCONSISTENCY']}
              </div>
              <div className="flex items-center gap-1 text-body-sm text-red-600 dark:text-red-400 font-medium">
                <span className="material-symbols-outlined text-[16px]">warning</span>
                <span>Amount &amp; Currency Discrepancies Caught</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-black/[0.04] dark:border-white/10 flex justify-between text-body-sm text-on-surface-variant dark:text-slate-400">
              <span>Failed / Rejected Gateways</span>
              <span className="font-mono font-semibold text-primary dark:text-white">{meta.status_counts['FAILED'] + meta.status_counts['REJECTED']} cases</span>
            </div>
          </div>
        </div>

        {/* ── AUDIT TRAIL STREAM TABLE (REAL CSV DATA) ────────────────────────── */}
        <div className="mt-10 p-6 sm:p-8 rounded-3xl bg-white/70 dark:bg-slate-900/50 backdrop-blur-2xl border border-white/80 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="font-headline-lg text-primary dark:text-white font-semibold text-[20px]">
                Live Settlement Audit Stream
              </h3>
              <p className="text-body-sm text-on-surface-variant dark:text-slate-400">
                Click any case to view deterministic reconciliation hops and Gemini AI analysis
              </p>
            </div>
            <button
              onClick={() => setActivePage('dashboard')}
              className="px-4 py-2 rounded-xl bg-black/[0.04] dark:bg-white/[0.08] hover:bg-black/[0.08] dark:hover:bg-white/[0.12] text-body-sm font-medium transition-colors border border-black/5 dark:border-white/5"
            >
              View Full 291 Records →
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
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] hover:bg-black/[0.05] dark:hover:bg-white/[0.06] border border-black/5 dark:border-white/5 transition-all cursor-pointer gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-semibold shrink-0 ${
                      isSettled ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' :
                      isDelayed ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400' :
                      isException ? 'bg-red-500/10 text-red-700 dark:text-red-400' :
                      'bg-slate-500/10 text-slate-700 dark:text-slate-400'
                    }`}>
                      <span className="material-symbols-outlined text-[20px]">
                        {isSettled ? 'done_all' : isDelayed ? 'schedule' : isException ? 'error' : 'receipt_long'}
                      </span>
                    </div>
                    <div>
                      <div className="font-mono font-semibold text-primary dark:text-white text-body-lg flex items-center gap-2">
                        <span>{tx.transaction_id}</span>
                        {tx.delay_point && (
                          <span className="text-[11px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-300 font-mono">
                            Delay: {tx.delay_point}
                          </span>
                        )}
                      </div>
                      <div className="text-body-sm text-on-surface-variant dark:text-slate-400 truncate max-w-lg">
                        {tx.evidence[0] || 'Reconciled ledger telemetry stream'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="text-right">
                      <div className="font-mono font-semibold text-primary dark:text-white">
                        {tx.currency === 'USD' ? '$' : '₹'}{tx.amount?.toLocaleString() || '0.00'}
                      </div>
                      <div className="text-[12px] text-on-surface-variant dark:text-slate-400 font-mono">
                        {tx.gateway.timestamp || '2026-09-01'}
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-label-sm font-semibold border font-mono ${
                      isSettled ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20' :
                      isDelayed ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20' :
                      isException ? 'bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/20' :
                      'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20'
                    }`}>
                      {tx.overall_status}
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
