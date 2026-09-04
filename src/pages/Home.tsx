import React, { useState } from 'react';
import { NavPage } from '../types';

interface HomeProps {
  setActivePage: (page: NavPage) => void;
  setSelectedTxId: (id: string) => void;
}

export const Home: React.FC<HomeProps> = ({ setActivePage, setSelectedTxId }) => {
  const [txInput, setTxInput] = useState('tx_984192841');
  const [dateInput, setDateInput] = useState('2023-10-24');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!txInput.trim()) return;
    setSelectedTxId(txInput.trim());
    setActivePage('investigation');
  };

  const handleRowClick = (id: string) => {
    setSelectedTxId(id);
    setActivePage('investigation');
  };

  return (
    <div className="flex flex-col w-full pb-20">
      {/* Hero Section with Apple-style Translucent Glass Aesthetics */}
      <section className="relative pt-8 pb-16 px-gutter max-w-7xl mx-auto w-full flex flex-col items-center text-center">
        {/* Subtle Ambient Refraction */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[550px] h-[250px] bg-gradient-to-tr from-blue-500/10 via-sky-400/10 to-transparent dark:from-blue-600/15 dark:via-indigo-500/10 dark:to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

        {/* Engine Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl text-on-surface-variant dark:text-slate-300 text-label-sm mb-stack-lg shadow-[0_1px_8px_rgba(0,0,0,0.03)] border border-white/80 dark:border-white/10">
          <span className="material-symbols-outlined text-[16px] text-blue-600 dark:text-blue-400">neurology</span>
          <span className="font-medium">Autonomous Ledger Resolution Engine v4.2</span>
        </div>

        {/* Headline */}
        <h1 className="font-headline-xl text-primary dark:text-white max-w-3xl mb-stack-md tracking-tight text-[32px] sm:text-[40px] font-semibold leading-tight">
          AI Settlement Investigation Agent
        </h1>

        {/* Process Flow */}
        <p className="font-body-lg text-on-surface-variant dark:text-slate-300 max-w-xl mb-stack-xl font-medium tracking-wide flex items-center justify-center gap-2">
          <span>Trace</span>
          <span className="text-blue-600 dark:text-blue-400 font-semibold">→</span>
          <span>Reconcile</span>
          <span className="text-blue-600 dark:text-blue-400 font-semibold">→</span>
          <span>Explain</span>
        </p>

        {/* Centered Glass Search Card */}
        <div className="w-full max-w-2xl p-6 sm:p-8 rounded-2xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl shadow-[0_8px_32px_rgba(8,24,55,0.06)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)] border border-white/80 dark:border-white/10 relative group mb-stack-xl transition-all">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/40 via-transparent to-blue-500/5 dark:from-white/5 dark:to-blue-500/5 pointer-events-none" />
          <form className="relative flex flex-col gap-stack-md" id="search-form" onSubmit={handleSearchSubmit}>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-4 text-outline dark:text-slate-400 text-[22px]">search</span>
              <input 
                className="w-full pl-12 pr-14 py-3.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/5 dark:border-white/10 text-on-surface dark:text-white placeholder:text-outline dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 dark:focus:ring-blue-500 font-tabular-nums text-body-lg transition-all" 
                id="tx-input" 
                placeholder="Enter transaction ID (e.g. tx_984192841)" 
                type="text" 
                value={txInput}
                onChange={(e) => setTxInput(e.target.value)}
              />
              <div className="absolute right-3 hidden sm:flex items-center gap-0.5 px-2 py-1 rounded-md bg-black/[0.04] dark:bg-white/[0.08] text-outline dark:text-slate-400 text-label-sm font-tabular-nums border border-black/5 dark:border-white/5">
                <span>⌘</span>K
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-stack-md pt-1">
              <div className="flex items-center gap-2 text-body-sm text-on-surface-variant dark:text-slate-300">
                <span className="material-symbols-outlined text-[16px] text-emerald-600 dark:text-emerald-400">verified_user</span>
                <span>Multi-rail verification active (SWIFT, ACH, SEPA, RTP)</span>
              </div>
              <button 
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-primary dark:bg-blue-600 text-on-primary font-medium text-body-md hover:bg-primary/90 dark:hover:bg-blue-500 transition-all shadow-sm flex items-center justify-center gap-2 active:scale-[0.98]" 
                type="submit"
              >
                <span>Investigate</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          </form>
        </div>

        {/* Secondary Option: Browse by Date */}
        <div className="w-full max-w-xl p-4 px-6 rounded-2xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border border-white/70 dark:border-white/10 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-stack-md">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 dark:bg-blue-950/70 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <span className="material-symbols-outlined text-[20px]">calendar_month</span>
            </div>
            <div className="text-left">
              <div className="text-body-md font-semibold text-primary dark:text-white">Browse by Date</div>
              <div className="text-body-sm text-on-surface-variant dark:text-slate-400">Access historical settlement batches & logs</div>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input 
              className="px-3 py-1.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/5 dark:border-white/10 text-on-surface dark:text-white text-body-sm font-tabular-nums focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:focus:ring-blue-500" 
              type="date" 
              value={dateInput}
              onChange={(e) => setDateInput(e.target.value)}
            />
            <button 
              className="px-3.5 py-1.5 rounded-xl bg-black/[0.04] dark:bg-white/[0.08] hover:bg-black/[0.08] dark:hover:bg-white/[0.12] text-on-surface dark:text-white text-body-sm font-medium transition-colors border border-black/5 dark:border-white/10 whitespace-nowrap" 
              onClick={() => setActivePage('dashboard')}
            >
              View Dashboard
            </button>
          </div>
        </div>
      </section>

      {/* Live Telemetry & System Overview Grid */}
      <section className="max-w-7xl mx-auto px-gutter w-full mt-stack-lg">
        <div className="flex items-center justify-between mb-stack-md">
          <div>
            <h2 className="font-headline-lg text-primary dark:text-white font-semibold">Real-Time Settlement Telemetry</h2>
            <p className="text-body-sm text-on-surface-variant dark:text-slate-400">Global ledger sync status across 14 correspondent banks</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border border-white/70 dark:border-white/10">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-label-sm font-tabular-nums text-on-surface-variant dark:text-slate-300">LATENCY: 42MS</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-stack-lg">
          {/* Metric Card 1 */}
          <div className="p-6 rounded-2xl bg-white/60 dark:bg-slate-900/50 backdrop-blur-2xl border border-white/80 dark:border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.4)] flex flex-col justify-between transition-all hover:shadow-lg">
            <div className="flex items-center justify-between mb-stack-md">
              <span className="text-label-md text-on-surface-variant dark:text-slate-400 uppercase tracking-wider font-medium">Processed Volume (24h)</span>
              <span className="p-2 rounded-xl bg-blue-500/10 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                <span className="material-symbols-outlined text-[20px]">payments</span>
              </span>
            </div>
            <div>
              <div className="font-headline-xl text-primary dark:text-white font-tabular-nums mb-1 font-semibold">$42.8B</div>
              <div className="flex items-center gap-1 text-body-sm text-emerald-600 dark:text-emerald-400 font-medium">
                <span className="material-symbols-outlined text-[16px]">trending_up</span>
                <span>+12.4% vs yesterday</span>
              </div>
            </div>
            <div className="mt-stack-md pt-4 border-t border-black/[0.04] dark:border-white/10 flex justify-between text-body-sm text-on-surface-variant dark:text-slate-400">
              <span>Total Transactions</span>
              <span className="font-tabular-nums font-semibold text-primary dark:text-white">1,492,804</span>
            </div>
          </div>

          {/* Metric Card 2 */}
          <div className="p-6 rounded-2xl bg-white/60 dark:bg-slate-900/50 backdrop-blur-2xl border border-white/80 dark:border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.4)] flex flex-col justify-between transition-all hover:shadow-lg">
            <div className="flex items-center justify-between mb-stack-md">
              <span className="text-label-md text-on-surface-variant dark:text-slate-400 uppercase tracking-wider font-medium">Auto-Reconciliation Rate</span>
              <span className="p-2 rounded-xl bg-sky-500/10 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400">
                <span className="material-symbols-outlined text-[20px]">verified</span>
              </span>
            </div>
            <div>
              <div className="font-headline-xl text-primary dark:text-white font-tabular-nums mb-1 font-semibold">99.87%</div>
              <div className="flex items-center gap-1 text-body-sm text-emerald-600 dark:text-emerald-400 font-medium">
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                <span>0.01% anomaly flagged</span>
              </div>
            </div>
            <div className="mt-stack-md pt-4 border-t border-black/[0.04] dark:border-white/10 flex justify-between text-body-sm text-on-surface-variant dark:text-slate-400">
              <span>Manual Review Queue</span>
              <span className="font-tabular-nums font-semibold text-primary dark:text-white">14 items</span>
            </div>
          </div>

          {/* Metric Card 3 */}
          <div className="p-6 rounded-2xl bg-white/60 dark:bg-slate-900/50 backdrop-blur-2xl border border-white/80 dark:border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.4)] flex flex-col justify-between transition-all hover:shadow-lg">
            <div className="flex items-center justify-between mb-stack-md">
              <span className="text-label-md text-on-surface-variant dark:text-slate-400 uppercase tracking-wider font-medium">Active AI Agents</span>
              <span className="p-2 rounded-xl bg-indigo-500/10 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                <span className="material-symbols-outlined text-[20px]">smart_toy</span>
              </span>
            </div>
            <div>
              <div className="font-headline-xl text-primary dark:text-white font-tabular-nums mb-1 font-semibold">32 / 32</div>
              <div className="flex items-center gap-1 text-body-sm text-on-surface-variant dark:text-slate-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>All tracing nodes operational</span>
              </div>
            </div>
            <div className="mt-stack-md pt-4 border-t border-black/[0.04] dark:border-white/10 flex justify-between text-body-sm text-on-surface-variant dark:text-slate-400">
              <span>Avg Trace Latency</span>
              <span className="font-tabular-nums font-semibold text-primary dark:text-white">310ms</span>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Investigation Feeds */}
      <section className="max-w-7xl mx-auto px-gutter w-full mt-stack-lg">
        <div className="p-6 sm:p-8 rounded-2xl bg-white/60 dark:bg-slate-900/50 backdrop-blur-2xl border border-white/80 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-stack-md mb-stack-lg">
            <div>
              <h3 className="font-headline-lg text-primary dark:text-white font-semibold">Recent Settlement Traces</h3>
              <p className="text-body-sm text-on-surface-variant dark:text-slate-400">Audited transaction investigations resolved by PayTrace AI</p>
            </div>
            <div className="flex items-center gap-stack-sm">
              <span className="px-3 py-1 rounded-full bg-black/[0.04] dark:bg-white/[0.08] text-on-surface-variant dark:text-slate-300 text-label-sm border border-black/5 dark:border-white/5">Live Stream</span>
            </div>
          </div>

          {/* Table / List Representation */}
          <div className="flex flex-col gap-2.5">
            {/* Row 1 */}
            <div 
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] hover:bg-black/[0.04] dark:hover:bg-white/[0.06] border border-black/5 dark:border-white/5 transition-all cursor-pointer gap-stack-md" 
              onClick={() => handleRowClick('tx_984192841')}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-semibold">
                  <span className="material-symbols-outlined text-[20px]">done_all</span>
                </div>
                <div>
                  <div className="font-tabular-nums font-semibold text-primary dark:text-white text-body-lg">tx_984192841</div>
                  <div className="text-body-sm text-on-surface-variant dark:text-slate-400">SWIFT MT103 → Fedwire clearing match confirmed</div>
                </div>
              </div>
              <div className="flex items-center gap-stack-lg w-full sm:w-auto justify-between sm:justify-end">
                <div className="text-right">
                  <div className="font-tabular-nums font-semibold text-primary dark:text-white">$1,250,000.00</div>
                  <div className="text-body-sm text-on-surface-variant dark:text-slate-400">2 mins ago</div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 text-label-sm font-semibold border border-emerald-500/20">Resolved</span>
              </div>
            </div>

            {/* Row 2 */}
            <div 
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] hover:bg-black/[0.04] dark:hover:bg-white/[0.06] border border-black/5 dark:border-white/5 transition-all cursor-pointer gap-stack-md" 
              onClick={() => handleRowClick('tx_884102934')}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 dark:bg-amber-950/70 text-amber-700 dark:text-amber-400 flex items-center justify-center font-semibold">
                  <span className="material-symbols-outlined text-[20px]">pending</span>
                </div>
                <div>
                  <div className="font-tabular-nums font-semibold text-primary dark:text-white text-body-lg">tx_884102934</div>
                  <div className="text-body-sm text-on-surface-variant dark:text-slate-400">SEPA Instant cross-border currency divergence check</div>
                </div>
              </div>
              <div className="flex items-center gap-stack-lg w-full sm:w-auto justify-between sm:justify-end">
                <div className="text-right">
                  <div className="font-tabular-nums font-semibold text-primary dark:text-white">€480,200.50</div>
                  <div className="text-body-sm text-on-surface-variant dark:text-slate-400">14 mins ago</div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300 text-label-sm font-semibold border border-amber-500/20">Reviewing</span>
              </div>
            </div>

            {/* Row 3 */}
            <div 
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] hover:bg-black/[0.04] dark:hover:bg-white/[0.06] border border-black/5 dark:border-white/5 transition-all cursor-pointer gap-stack-md" 
              onClick={() => handleRowClick('tx_772109843')}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-semibold">
                  <span className="material-symbols-outlined text-[20px]">done_all</span>
                </div>
                <div>
                  <div className="font-tabular-nums font-semibold text-primary dark:text-white text-body-lg">tx_772109843</div>
                  <div className="text-body-sm text-on-surface-variant dark:text-slate-400">ACH Batch settlement auto-reconciled with JPMorgan ledger</div>
                </div>
              </div>
              <div className="flex items-center gap-stack-lg w-full sm:w-auto justify-between sm:justify-end">
                <div className="text-right">
                  <div className="font-tabular-nums font-semibold text-primary dark:text-white">$89,450.00</div>
                  <div className="text-body-sm text-on-surface-variant dark:text-slate-400">28 mins ago</div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 text-label-sm font-semibold border border-emerald-500/20">Resolved</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
