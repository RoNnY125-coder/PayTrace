import React, { useState, useMemo } from 'react';
import { NavPage, InvestigationResult } from '../types';
import { getAllLocalTransactions, getDatasetMeta } from '../services/api';

interface DashboardProps {
  setActivePage: (page: NavPage) => void;
  setSelectedTxId: (id: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ setActivePage, setSelectedTxId }) => {
  const meta = getDatasetMeta();
  const allTransactions = useMemo(() => getAllLocalTransactions(), []);

  const [selectedDate, setSelectedDate] = useState<string>('ALL');
  const [filterTab, setFilterTab] = useState<'All' | 'Settled' | 'Delayed' | 'Exceptions' | 'Failed'>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 15;

  // Filter by Date
  const dateFiltered = useMemo(() => {
    if (selectedDate === 'ALL') return allTransactions;
    return allTransactions.filter(t => (t.gateway.timestamp || '').startsWith(selectedDate));
  }, [allTransactions, selectedDate]);

  // Compute live stats for current date view
  const stats = useMemo(() => {
    let vol = 0;
    let settled = 0;
    let delayed = 0;
    let exceptions = 0;
    let failed = 0;

    dateFiltered.forEach(t => {
      if (t.amount) vol += t.amount;
      if (t.overall_status === 'SETTLED') settled++;
      else if (t.overall_status === 'DELAYED' || t.overall_status === 'LEDGER_DELAY') delayed++;
      else if (t.overall_status === 'FAILED') failed++;
      else exceptions++;
    });

    return { vol, settled, delayed, exceptions, failed, total: dateFiltered.length };
  }, [dateFiltered]);

  // Filter by Tab and Search
  const filtered = useMemo(() => {
    return dateFiltered.filter(t => {
      // Tab filter
      if (filterTab === 'Settled' && t.overall_status !== 'SETTLED') return false;
      if (filterTab === 'Delayed' && t.overall_status !== 'DELAYED' && t.overall_status !== 'LEDGER_DELAY') return false;
      if (filterTab === 'Exceptions' && !['CRITICAL_EXCEPTION', 'EXCEPTION', 'DATA_INCONSISTENCY', 'DUPLICATE_RECORD'].includes(t.overall_status)) return false;
      if (filterTab === 'Failed' && t.overall_status !== 'FAILED' && t.overall_status !== 'REJECTED') return false;

      // Search term
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const idMatch = t.transaction_id.toLowerCase().includes(q);
        const statusMatch = t.overall_status.toLowerCase().includes(q);
        const excMatch = t.exceptions.some(e => e.toLowerCase().includes(q));
        const amountMatch = (t.amount ? t.amount.toString() : '').includes(q);
        const gwStatusMatch = (t.gateway.status || '').toLowerCase().includes(q);
        const bnkStatusMatch = (t.bank.status || '').toLowerCase().includes(q);
        return idMatch || statusMatch || excMatch || amountMatch || gwStatusMatch || bnkStatusMatch;
      }
      return true;
    });
  }, [dateFiltered, filterTab, searchTerm]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  const handleRowClick = (txId: string) => {
    setSelectedTxId(txId);
    setActivePage('investigation');
  };

  const handleExportCSV = () => {
    const headers = [
      'Transaction ID',
      'Overall Status',
      'Amount',
      'Currency',
      'Gateway Status',
      'Bank Status',
      'Ledger Status',
      'Gateway Amount',
      'Bank Amount',
      'Ledger Amount',
      'Delay Point',
      'Exceptions',
      'Recommended Action'
    ];

    const rows = filtered.map(t => [
      `"${t.transaction_id}"`,
      `"${t.overall_status}"`,
      t.amount ?? '',
      `"${t.currency || 'INR'}"`,
      `"${t.gateway.status || ''}"`,
      `"${t.bank.status || ''}"`,
      `"${t.ledger.status || ''}"`,
      t.gateway.amount ?? '',
      t.bank.amount ?? '',
      t.ledger.amount ?? '',
      `"${t.delay_point || 'None'}"`,
      `"${t.exceptions.join('; ')}"`,
      `"${(t.recommended_action || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const dateTag = selectedDate === 'ALL' ? 'all_batches' : selectedDate;
    link.setAttribute('download', `paytrace_settlement_audit_${dateTag}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col w-full px-gutter py-6 gap-6 max-w-7xl mx-auto pb-24">
      {/* ── HEADER & DATE SELECTOR ─────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-300 text-label-sm font-mono uppercase tracking-wider font-semibold border border-blue-500/20">
              CSV Ledger Ingestion
            </span>
            <span className="text-body-sm text-on-surface-variant dark:text-slate-400 font-mono">
              {allTransactions.length} Total Verified Records
            </span>
          </div>
          <h1 className="text-primary dark:text-white font-bold text-[28px] tracking-tight">
            Settlement Overview &amp; Ledger Audit
          </h1>
          <p className="font-body-md text-on-surface-variant dark:text-slate-400">
            Real-time reconciliation status across Gateway, Core Banking, and General Ledger data
          </p>
        </div>

        {/* Live Date Switcher */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl px-3.5 py-2 rounded-2xl border border-white/80 dark:border-white/10 shadow-sm">
            <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-[18px]">calendar_today</span>
            <select
              value={selectedDate}
              onChange={(e) => { setSelectedDate(e.target.value); setPage(1); }}
              className="bg-transparent text-body-sm font-mono font-medium text-on-surface dark:text-white focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="dark:bg-slate-900">All CSV Batches ({allTransactions.length} txns)</option>
              {meta.dates.map(d => (
                <option key={d} value={d} className="dark:bg-slate-900">
                  Batch: {d}
                </option>
              ))}
            </select>
          </div>

          <button 
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-body-sm font-medium transition-all shadow-sm active:scale-[0.98]" 
            onClick={handleExportCSV}
            title={`Export ${filtered.length} transactions as CSV`}
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            <span>Export CSV ({filtered.length})</span>
          </button>
        </div>
      </div>

      {/* ── 4 STAT CARDS DERIVED DYNAMICALLY FROM CSV DATA ────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Volume */}
        <div className="bg-white/70 dark:bg-slate-900/50 backdrop-blur-2xl p-5 rounded-2xl border border-white/80 dark:border-white/10 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-label-sm text-on-surface-variant dark:text-slate-400 uppercase tracking-wider font-mono">
                {selectedDate === 'ALL' ? 'All Batches Volume' : `Batch ${selectedDate}`}
              </span>
              <span className="p-1.5 rounded-lg bg-blue-500/10 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400">
                <span className="material-symbols-outlined text-[18px]">payments</span>
              </span>
            </div>
            <div className="font-mono font-bold text-primary dark:text-white tracking-tight text-[24px]">
              ₹{stats.vol.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-black/[0.04] dark:border-white/10 flex justify-between text-body-sm text-on-surface-variant dark:text-slate-400">
            <span>Total Cases</span>
            <span className="font-mono font-semibold text-primary dark:text-white">{stats.total}</span>
          </div>
        </div>

        {/* Settled Successfully */}
        <div className="bg-white/70 dark:bg-slate-900/50 backdrop-blur-2xl p-5 rounded-2xl border border-white/80 dark:border-white/10 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-label-sm text-on-surface-variant dark:text-slate-400 uppercase tracking-wider font-mono">
                Settled Clean
              </span>
              <span className="p-1.5 rounded-lg bg-emerald-500/10 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400">
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
              </span>
            </div>
            <div className="font-mono font-bold text-primary dark:text-white tracking-tight text-[24px]">
              {stats.settled}
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-black/[0.04] dark:border-white/10 flex justify-between text-body-sm text-on-surface-variant dark:text-slate-400">
            <span>Resolution Ratio</span>
            <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
              {stats.total > 0 ? ((stats.settled / stats.total) * 100).toFixed(1) : 0}%
            </span>
          </div>
        </div>

        {/* Delayed / In-Flight */}
        <div className="bg-white/70 dark:bg-slate-900/50 backdrop-blur-2xl p-5 rounded-2xl border border-white/80 dark:border-white/10 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-label-sm text-on-surface-variant dark:text-slate-400 uppercase tracking-wider font-mono">
                Delayed / In-Flight
              </span>
              <span className="p-1.5 rounded-lg bg-amber-500/10 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400">
                <span className="material-symbols-outlined text-[18px]">schedule</span>
              </span>
            </div>
            <div className="font-mono font-bold text-amber-600 dark:text-amber-400 tracking-tight text-[24px]">
              {stats.delayed}
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-black/[0.04] dark:border-white/10 flex justify-between text-body-sm text-on-surface-variant dark:text-slate-400">
            <span>Bank &amp; Ledger Holds</span>
            <span className="font-mono font-semibold text-amber-600 dark:text-amber-400">Action: Monitor</span>
          </div>
        </div>

        {/* Exceptions / Failed */}
        <div className="bg-white/70 dark:bg-slate-900/50 backdrop-blur-2xl p-5 rounded-2xl border border-white/80 dark:border-white/10 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-label-sm text-on-surface-variant dark:text-slate-400 uppercase tracking-wider font-mono">
                Exceptions &amp; Discrepancies
              </span>
              <span className="p-1.5 rounded-lg bg-red-500/10 dark:bg-red-950/80 text-red-700 dark:text-red-400">
                <span className="material-symbols-outlined text-[18px]">error</span>
              </span>
            </div>
            <div className="font-mono font-bold text-red-600 dark:text-red-400 tracking-tight text-[24px]">
              {stats.exceptions + stats.failed}
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-black/[0.04] dark:border-white/10 flex justify-between text-body-sm text-on-surface-variant dark:text-slate-400">
            <span>Amount &amp; Currency Discrepancies</span>
            <span className="font-mono font-semibold text-red-600 dark:text-red-400">Action: Escalate</span>
          </div>
        </div>
      </div>

      {/* ── TRANSACTION LEDGER TABLE (REAL CSV DATA) ──────────────────────── */}
      <div className="bg-white/70 dark:bg-slate-900/50 backdrop-blur-2xl rounded-3xl shadow-sm border border-white/80 dark:border-white/10 p-6 flex flex-col gap-4">
        {/* Table Filters Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-black/[0.04] dark:border-white/10">
          <div className="flex items-center gap-3">
            <h2 className="font-headline-lg text-primary dark:text-white font-semibold text-[20px]">
              Settlement Ledger Stream
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-black/[0.04] dark:bg-white/[0.08] text-on-surface-variant dark:text-slate-300 text-label-sm font-mono border border-black/5 dark:border-white/5">
              Showing {filtered.length} matches
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Box */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none material-symbols-outlined text-outline dark:text-slate-400 text-[18px]">search</span>
              <input 
                className="bg-black/[0.03] dark:bg-white/[0.05] text-on-surface dark:text-white placeholder:text-outline dark:placeholder:text-slate-500 text-body-sm pl-9 pr-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/40 dark:focus:ring-blue-500 w-64 border border-black/5 dark:border-white/10 font-mono" 
                placeholder="Filter ID, status, exception..." 
                type="text"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-black/[0.03] dark:bg-white/[0.06] p-1 rounded-xl border border-black/5 dark:border-white/5">
              {(['All', 'Settled', 'Delayed', 'Exceptions', 'Failed'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => { setFilterTab(tab); setPage(1); }}
                  className={`px-3 py-1 rounded-lg text-body-sm font-medium transition-all ${
                    filterTab === tab
                      ? 'bg-white dark:bg-white/15 shadow-sm text-primary dark:text-white font-semibold'
                      : 'text-on-surface-variant dark:text-slate-400 hover:text-on-surface dark:hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Real Transactions Grid */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-on-surface-variant dark:text-slate-400 text-[12px] uppercase font-mono border-b border-black/[0.05] dark:border-white/10">
                <th className="py-3 px-3">Transaction ID</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Gateway Node</th>
                <th className="py-3 px-3">Bank Partner</th>
                <th className="py-3 px-3">General Ledger</th>
                <th className="py-3 px-3 text-right">Amount</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04] dark:divide-white/5 text-body-sm">
              {paginated.map((row) => {
                const isSettled = row.overall_status === 'SETTLED';
                const isDelayed = row.overall_status === 'DELAYED' || row.overall_status === 'LEDGER_DELAY';
                const isException = ['CRITICAL_EXCEPTION', 'EXCEPTION', 'DATA_INCONSISTENCY', 'DUPLICATE_RECORD'].includes(row.overall_status);

                return (
                  <tr 
                    key={row.transaction_id}
                    className="group cursor-pointer transition-all duration-150 hover:bg-black/[0.02] dark:hover:bg-white/[0.04]"
                    onClick={() => handleRowClick(row.transaction_id)}
                  >
                    {/* ID */}
                    <td className="py-3.5 px-3 font-mono font-semibold text-primary dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-outline dark:text-slate-400">receipt</span>
                      <span>{row.transaction_id}</span>
                    </td>

                    {/* Overall Status */}
                    <td className="py-3.5 px-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold border ${
                        isSettled ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20' :
                        isDelayed ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20' :
                        isException ? 'bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/20' :
                        'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20'
                      }`}>
                        {row.overall_status}
                      </span>
                    </td>

                    {/* Gateway */}
                    <td className="py-3.5 px-3 font-mono text-[12px] text-on-surface-variant dark:text-slate-300">
                      {row.gateway.found ? (
                        <div>
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400">{row.gateway.status}</span>
                          <div className="text-[11px] text-outline dark:text-slate-400">{row.gateway.timestamp?.split(' ')[1] || 'Captured'}</div>
                        </div>
                      ) : (
                        <span className="text-red-500 font-semibold">MISSING</span>
                      )}
                    </td>

                    {/* Bank */}
                    <td className="py-3.5 px-3 font-mono text-[12px] text-on-surface-variant dark:text-slate-300">
                      {row.bank.found ? (
                        <div>
                          <span className={`font-semibold ${
                            row.bank.status === 'SETTLED' ? 'text-emerald-600 dark:text-emerald-400' :
                            row.bank.status === 'PENDING' ? 'text-amber-600 dark:text-amber-400' : 'text-red-500'
                          }`}>
                            {row.bank.status}
                          </span>
                          <div className="text-[11px] text-outline dark:text-slate-400">{row.bank.currency} {row.bank.amount}</div>
                        </div>
                      ) : (
                        <span className="text-amber-600 dark:text-amber-400 font-semibold">NOT RECEIVED</span>
                      )}
                    </td>

                    {/* Ledger */}
                    <td className="py-3.5 px-3 font-mono text-[12px] text-on-surface-variant dark:text-slate-300">
                      {row.ledger.found ? (
                        <div>
                          <span className={`font-semibold ${
                            row.ledger.status === 'POSTED' ? 'text-emerald-600 dark:text-emerald-400' :
                            row.ledger.status === 'PENDING' ? 'text-amber-600 dark:text-amber-400' : 'text-red-500'
                          }`}>
                            {row.ledger.status}
                          </span>
                          <div className="text-[11px] text-outline dark:text-slate-400">{row.ledger.currency} {row.ledger.amount}</div>
                        </div>
                      ) : (
                        <span className="text-amber-600 dark:text-amber-400 font-semibold">PENDING</span>
                      )}
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-3 text-right font-mono font-semibold text-primary dark:text-white">
                      {row.currency === 'USD' ? '$' : '₹'}{row.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>

                    {/* Action Button */}
                    <td className="py-3.5 px-3 text-right">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleRowClick(row.transaction_id); }}
                        className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/70 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-300 font-medium text-[12px] transition-colors"
                      >
                        Investigate →
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between pt-3 border-t border-black/[0.04] dark:border-white/10 text-body-sm text-on-surface-variant dark:text-slate-400">
          <span>
            Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, filtered.length)} of {filtered.length} transactions
          </span>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.05] hover:bg-black/[0.06] text-on-surface dark:text-slate-300 font-medium transition-colors disabled:opacity-40"
            >
              Previous
            </button>
            <span className="font-mono text-[12px]">
              Page {page} of {totalPages}
            </span>
            <button 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
