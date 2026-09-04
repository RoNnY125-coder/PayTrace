import React, { useState } from 'react';
import { NavPage } from '../types';

interface DashboardProps {
  setActivePage: (page: NavPage) => void;
  setSelectedTxId: (id: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ setActivePage, setSelectedTxId }) => {
  const [filterTab, setFilterTab] = useState<'All' | 'Exceptions'>('All');
  const [searchTerm, setSearchTerm] = useState('');

  const transactions = [
    { id: 'TRX-9482-BF71', status: 'Settled', gateway: 'Stripe / Chase Bank NA', amount: '$142,500.00', time: '14:28:10 UTC' },
    { id: 'TRX-9481-AK39', status: 'Exception', gateway: 'Adyen / Wells Fargo', amount: '$89,200.50', time: '14:25:42 UTC' },
    { id: 'TRX-9480-LM22', status: 'Delayed', gateway: 'Checkout.com / Citi', amount: '$1,250,000.00', time: '14:21:05 UTC' },
    { id: 'TRX-9479-ZX99', status: 'Settled', gateway: 'PayPal / Bank of America', amount: '$45,100.00', time: '14:18:50 UTC' },
    { id: 'TRX-9478-QW12', status: 'Settled', gateway: 'Stripe / Chase Bank NA', amount: '$320,000.00', time: '14:15:12 UTC' },
  ];

  const filteredTransactions = transactions.filter(t => {
    const match = t.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                  t.gateway.toLowerCase().includes(searchTerm.toLowerCase());
    if (!match) return false;
    if (filterTab === 'Exceptions') return t.status === 'Exception';
    return true;
  });

  const handleRowClick = (txId: string) => {
    setSelectedTxId(txId);
    setActivePage('investigation');
  };

  return (
    <div className="flex flex-col w-full px-gutter py-6 gap-stack-lg max-w-7xl mx-auto pb-24">
      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-stack-md">
        <div>
          <h1 className="font-headline-xl text-primary dark:text-white tracking-tight text-[28px] font-semibold">Settlement Overview</h1>
          <p className="font-body-md text-on-surface-variant dark:text-slate-400">Real-time ledger tracking and multi-hop settlement verification</p>
        </div>
        <div className="flex items-center gap-stack-md">
          {/* Date Indicator Mock */}
          <div className="flex items-center gap-2 bg-white/60 dark:bg-slate-900/50 backdrop-blur-xl px-3.5 py-1.5 rounded-xl border border-white/80 dark:border-white/10 shadow-sm">
            <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-[18px]">calendar_today</span>
            <span className="font-label-md text-on-surface dark:text-white">Today: Oct 24, 2023</span>
            <span className="material-symbols-outlined text-on-surface-variant dark:text-slate-400 text-[16px]">expand_more</span>
          </div>
          {/* Export Action */}
          <button 
            className="flex items-center gap-2 bg-primary dark:bg-blue-600 text-on-primary px-4 py-2 rounded-xl text-body-sm font-medium hover:bg-primary/90 dark:hover:bg-blue-500 transition-all shadow-sm active:scale-[0.98]" 
            onClick={() => alert('Exporting settlement telemetry...')}
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            <span>Export Ledger</span>
          </button>
        </div>
      </div>

      {/* Stat Row: Four glass stat cards side by side */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-stack-lg">
        {/* Total Card */}
        <div className="bg-white/60 dark:bg-slate-900/50 backdrop-blur-2xl p-6 rounded-2xl border border-white/80 dark:border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.4)] relative overflow-hidden flex flex-col justify-between transition-all duration-300 hover:shadow-lg">
          <div>
            <div className="flex items-center justify-between mb-stack-sm">
              <span className="text-label-sm text-on-surface-variant dark:text-slate-400 uppercase tracking-wider font-medium">Total Volume</span>
              <span className="p-1.5 rounded-lg bg-blue-500/10 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400">
                <span className="material-symbols-outlined text-[18px]">payments</span>
              </span>
            </div>
            <div className="font-headline-xl font-tabular-nums text-primary dark:text-white tracking-tight font-semibold">$42,850,920</div>
          </div>
          <div className="mt-stack-md flex items-center gap-1 text-body-sm text-on-surface-variant dark:text-slate-400">
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center">
              <span className="material-symbols-outlined text-[14px]">arrow_upward</span>+12.4%
            </span> vs yesterday
          </div>
        </div>

        {/* Settled Card */}
        <div className="bg-white/60 dark:bg-slate-900/50 backdrop-blur-2xl p-6 rounded-2xl border border-white/80 dark:border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.4)] relative overflow-hidden flex flex-col justify-between transition-all duration-300 hover:shadow-lg">
          <div>
            <div className="flex items-center justify-between mb-stack-sm">
              <span className="text-label-sm text-on-surface-variant dark:text-slate-400 uppercase tracking-wider font-medium">Settled Successfully</span>
              <span className="p-1.5 rounded-lg bg-emerald-500/10 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400">
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
              </span>
            </div>
            <div className="font-headline-xl font-tabular-nums text-primary dark:text-white tracking-tight font-semibold">$39,120,400</div>
          </div>
          <div className="mt-stack-md flex items-center gap-1 text-body-sm text-on-surface-variant dark:text-slate-400">
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">91.3%</span> clear rate
          </div>
        </div>

        {/* Delayed Card */}
        <div className="bg-white/60 dark:bg-slate-900/50 backdrop-blur-2xl p-6 rounded-2xl border border-white/80 dark:border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.4)] relative overflow-hidden flex flex-col justify-between transition-all duration-300 hover:shadow-lg">
          <div>
            <div className="flex items-center justify-between mb-stack-sm">
              <span className="text-label-sm text-on-surface-variant dark:text-slate-400 uppercase tracking-wider font-medium">Delayed / In-Flight</span>
              <span className="p-1.5 rounded-lg bg-amber-500/10 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400">
                <span className="material-symbols-outlined text-[18px]">schedule</span>
              </span>
            </div>
            <div className="font-headline-xl font-tabular-nums text-primary dark:text-white tracking-tight font-semibold">$2,940,100</div>
          </div>
          <div className="mt-stack-md flex items-center gap-1 text-body-sm text-on-surface-variant dark:text-slate-400">
            <span className="text-amber-600 dark:text-amber-400 font-semibold">18 hops</span> pending
          </div>
        </div>

        {/* Exceptions Card */}
        <div className="bg-white/60 dark:bg-slate-900/50 backdrop-blur-2xl p-6 rounded-2xl border border-white/80 dark:border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.4)] relative overflow-hidden flex flex-col justify-between transition-all duration-300 hover:shadow-lg">
          <div>
            <div className="flex items-center justify-between mb-stack-sm">
              <span className="text-label-sm text-on-surface-variant dark:text-slate-400 uppercase tracking-wider font-medium">Exceptions / Failed</span>
              <span className="p-1.5 rounded-lg bg-red-500/10 dark:bg-red-950/80 text-red-700 dark:text-red-400">
                <span className="material-symbols-outlined text-[18px]">error</span>
              </span>
            </div>
            <div className="font-headline-xl font-tabular-nums text-primary dark:text-white tracking-tight font-semibold">$790,420</div>
          </div>
          <div className="mt-stack-md flex items-center gap-1 text-body-sm text-on-surface-variant dark:text-slate-400">
            <span className="text-red-600 dark:text-red-400 font-semibold">12 items</span> require review
          </div>
        </div>
      </div>

      {/* Transaction Table Container */}
      <div className="bg-white/60 dark:bg-slate-900/50 backdrop-blur-2xl rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] border border-white/80 dark:border-white/10 p-6 flex flex-col gap-stack-md mt-2">
        {/* Table Header / Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-stack-md pb-stack-md">
          <div className="flex items-center gap-3">
            <h2 className="font-headline-lg text-primary dark:text-white font-semibold">Live Settlement Ledger</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-black/[0.04] dark:bg-white/[0.08] text-on-surface-variant dark:text-slate-300 text-label-sm font-tabular-nums border border-black/5 dark:border-white/5">
              Showing {filteredTransactions.length} of 1,429
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none material-symbols-outlined text-outline dark:text-slate-400 text-[18px]">search</span>
              <input 
                className="bg-black/[0.03] dark:bg-white/[0.05] text-on-surface dark:text-white placeholder:text-outline dark:placeholder:text-slate-500 text-body-sm pl-9 pr-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/40 dark:focus:ring-blue-500 w-64 border border-black/5 dark:border-white/10" 
                placeholder="Search transaction ID, partner..." 
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-1 bg-black/[0.03] dark:bg-white/[0.06] p-1 rounded-xl border border-black/5 dark:border-white/5">
              <button 
                onClick={() => setFilterTab('All')}
                className={`px-3 py-1 rounded-lg text-body-sm font-medium transition-all ${
                  filterTab === 'All' 
                    ? 'bg-white dark:bg-white/15 shadow-sm text-primary dark:text-white' 
                    : 'text-on-surface-variant dark:text-slate-400 hover:text-on-surface dark:hover:text-white'
                }`}
              >
                All
              </button>
              <button 
                onClick={() => setFilterTab('Exceptions')}
                className={`px-3 py-1 rounded-lg text-body-sm font-medium transition-all ${
                  filterTab === 'Exceptions' 
                    ? 'bg-white dark:bg-white/15 shadow-sm text-primary dark:text-white' 
                    : 'text-on-surface-variant dark:text-slate-400 hover:text-on-surface dark:hover:text-white'
                }`}
              >
                Exceptions
              </button>
            </div>
          </div>
        </div>

        {/* Table Data Grid */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-on-surface-variant dark:text-slate-400 text-label-sm uppercase border-b border-black/[0.05] dark:border-white/10">
                <th className="py-3 px-4 font-medium">Transaction ID</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-4 font-medium">Gateway / Partner</th>
                <th className="py-3 px-4 text-right font-medium">Amount</th>
                <th className="py-3 px-4 text-right font-medium">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04] dark:divide-white/5 font-body-md">
              {filteredTransactions.map((row) => (
                <tr 
                  key={row.id}
                  className="group cursor-pointer transition-all duration-200 hover:bg-black/[0.02] dark:hover:bg-white/[0.04]" 
                  onClick={() => handleRowClick(row.id)}
                >
                  <td className="py-4 px-4 font-tabular-nums font-semibold text-primary dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-outline dark:text-slate-400">swap_horiz</span>
                    {row.id}
                  </td>
                  <td className="py-4 px-4">
                    {row.status === 'Settled' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-label-sm bg-emerald-500/10 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-medium border border-emerald-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Settled
                      </span>
                    )}
                    {row.status === 'Exception' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-label-sm bg-red-500/10 dark:bg-red-950/80 text-red-700 dark:text-red-300 font-medium border border-red-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Exception
                      </span>
                    )}
                    {row.status === 'Delayed' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-label-sm bg-amber-500/10 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 font-medium border border-amber-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" /> Delayed
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4 text-on-surface-variant dark:text-slate-300">{row.gateway}</td>
                  <td className="py-4 px-4 text-right font-tabular-nums font-semibold text-primary dark:text-white">{row.amount}</td>
                  <td className="py-4 px-4 text-right font-tabular-nums text-on-surface-variant dark:text-slate-400">{row.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table Footer / Pagination */}
        <div className="flex items-center justify-between pt-3 border-t border-black/[0.04] dark:border-white/10 text-body-sm text-on-surface-variant dark:text-slate-400">
          <span>Page 1 of 286</span>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 rounded-lg bg-black/[0.03] dark:bg-white/[0.05] hover:bg-black/[0.06] text-on-surface dark:text-slate-400 text-body-sm font-medium transition-colors disabled:opacity-40" disabled>Previous</button>
            <button className="px-3 py-1.5 rounded-lg bg-primary dark:bg-blue-600 text-on-primary text-body-sm font-medium transition-colors">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};
