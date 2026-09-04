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
    <div className="flex flex-col w-full px-6 sm:px-8 py-8 gap-10 max-w-7xl mx-auto pb-28">
      {/* ── HEADER & DATE SELECTOR (CONFIDENT WHITESPACE) ──────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full bg-[#9FE870]/10 text-[#2D5A0F] dark:text-[#9FE870] text-xs font-semibold uppercase tracking-wider border border-[#9FE870]/20">
              CSV Ledger Ingestion
            </span>
            <span className="text-xs text-[#6C6D77] dark:text-[#9B9CA6]">
              {allTransactions.length} Verified Records
            </span>
          </div>
          <h1 className="text-[#14151A] dark:text-[#EDEDF0] font-bold text-[30px] sm:text-[36px] tracking-tight">
            Settlement Overview &amp; Ledger Audit
          </h1>
          <p className="text-sm sm:text-base text-[#6C6D77] dark:text-[#9B9CA6] mt-1 max-w-2xl">
            Real-time reconciliation status across Gateway, Core Banking, and General Ledger data.
          </p>
        </div>

        {/* Live Date Switcher & Export CSV Pills */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <div className="flex items-center gap-2 bg-white dark:bg-[#1E1F26] px-4 py-2.5 rounded-full border border-[#E2E5E9] dark:border-[#2E2F38]">
            <span className="material-symbols-outlined text-[#6C6D77] dark:text-[#9B9CA6] text-[18px]">calendar_today</span>
            <select
              value={selectedDate}
              onChange={(e) => { setSelectedDate(e.target.value); setPage(1); }}
              className="bg-transparent text-xs font-medium text-[#14151A] dark:text-[#EDEDF0] focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="dark:bg-[#1E1F26]">All Batches ({allTransactions.length} txns)</option>
              {meta.dates.map(d => (
                <option key={d} value={d} className="dark:bg-[#1E1F26]">
                  Batch {d}
                </option>
              ))}
            </select>
          </div>

          <button 
            className="flex items-center gap-2 bg-[#14151A] text-[#9FE870] hover:bg-[#26272E] dark:bg-[#9FE870] dark:text-[#14151A] dark:hover:bg-[#B5F58D] px-5 py-2.5 rounded-full text-xs font-semibold transition-colors shrink-0" 
            onClick={handleExportCSV}
            title={`Export ${filtered.length} transactions as CSV`}
          >
            <span className="material-symbols-outlined text-[17px]">download</span>
            <span>Export CSV ({filtered.length})</span>
          </button>
        </div>
      </div>

      {/* ── 4 STAT CARDS (CLEAR SINGLE-FOCAL-POINT NUMBER & GENEROUS PADDING) ─ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Volume */}
        <div className="bg-white dark:bg-[#1E1F26] p-7 sm:p-8 rounded-3xl border border-[#E2E5E9] dark:border-[#2E2F38] flex flex-col justify-between min-h-[175px]">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-[#6C6D77] dark:text-[#9B9CA6] uppercase tracking-wider font-semibold">
                {selectedDate === 'ALL' ? 'Total Volume' : `Batch ${selectedDate}`}
              </span>
              <div className="w-9 h-9 rounded-full bg-[#F4F5F7] dark:bg-[#26272E] text-[#14151A] dark:text-[#EDEDF0] flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">payments</span>
              </div>
            </div>
            <div className="font-bold text-[#14151A] dark:text-[#EDEDF0] tracking-tight text-[30px] sm:text-[34px]">
              ₹{stats.vol.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#E8EAEF] dark:border-[#26272E] flex justify-between text-xs text-[#6C6D77] dark:text-[#9B9CA6]">
            <span>Total Cases</span>
            <span className="font-medium text-[#14151A] dark:text-[#EDEDF0]">{stats.total}</span>
          </div>
        </div>

        {/* Settled Clean */}
        <div className="bg-white dark:bg-[#1E1F26] p-7 sm:p-8 rounded-3xl border border-[#E2E5E9] dark:border-[#2E2F38] flex flex-col justify-between min-h-[175px]">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-[#6C6D77] dark:text-[#9B9CA6] uppercase tracking-wider font-semibold">
                Settled Clean
              </span>
              <div className="w-9 h-9 rounded-full bg-[#9FE870]/15 text-[#2D5A0F] dark:text-[#9FE870] flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
              </div>
            </div>
            <div className="font-bold text-[#14151A] dark:text-[#EDEDF0] tracking-tight text-[30px] sm:text-[34px]">
              {stats.settled}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#E8EAEF] dark:border-[#26272E] flex justify-between text-xs text-[#6C6D77] dark:text-[#9B9CA6]">
            <span>Resolution Rate</span>
            <span className="font-semibold text-[#2D5A0F] dark:text-[#9FE870]">
              {stats.total > 0 ? ((stats.settled / stats.total) * 100).toFixed(1) : 0}%
            </span>
          </div>
        </div>

        {/* Delayed In-Flight */}
        <div className="bg-white dark:bg-[#1E1F26] p-7 sm:p-8 rounded-3xl border border-[#E2E5E9] dark:border-[#2E2F38] flex flex-col justify-between min-h-[175px]">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-[#6C6D77] dark:text-[#9B9CA6] uppercase tracking-wider font-semibold">
                Delayed / Pending
              </span>
              <div className="w-9 h-9 rounded-full bg-[#F0B84B]/15 text-[#875800] dark:text-[#F0B84B] flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">schedule</span>
              </div>
            </div>
            <div className="font-bold text-[#F0B84B] tracking-tight text-[30px] sm:text-[34px]">
              {stats.delayed}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#E8EAEF] dark:border-[#26272E] flex justify-between text-xs text-[#6C6D77] dark:text-[#9B9CA6]">
            <span>Bank &amp; Ledger Holds</span>
            <span className="font-medium text-[#F0B84B]">In-Flight</span>
          </div>
        </div>

        {/* Exceptions & Variances */}
        <div className="bg-white dark:bg-[#1E1F26] p-7 sm:p-8 rounded-3xl border border-[#E2E5E9] dark:border-[#2E2F38] flex flex-col justify-between min-h-[175px]">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-[#6C6D77] dark:text-[#9B9CA6] uppercase tracking-wider font-semibold">
                Exceptions
              </span>
              <div className="w-9 h-9 rounded-full bg-[#F1483F]/15 text-[#F1483F] flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">warning</span>
              </div>
            </div>
            <div className="font-bold text-[#F1483F] tracking-tight text-[30px] sm:text-[34px]">
              {stats.exceptions + stats.failed}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#E8EAEF] dark:border-[#26272E] flex justify-between text-xs text-[#6C6D77] dark:text-[#9B9CA6]">
            <span>Discrepancies</span>
            <span className="font-medium text-[#F1483F]">Flagged</span>
          </div>
        </div>
      </div>

      {/* ── TRANSACTION LEDGER CARD (DESKTOP TABLE + MOBILE CARD LIST) ──────── */}
      <div className="bg-white dark:bg-[#1E1F26] rounded-3xl border border-[#E2E5E9] dark:border-[#2E2F38] p-7 sm:p-8 flex flex-col gap-6">
        {/* Table Filters Header with Wise Pill Tabs */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 pb-5 border-b border-[#E8EAEF] dark:border-[#26272E]">
          <div className="flex items-center gap-3">
            <h2 className="text-xl sm:text-2xl font-semibold text-[#14151A] dark:text-[#EDEDF0] tracking-tight">
              Settlement Ledger Stream
            </h2>
            <span className="px-3 py-1 rounded-full bg-[#F4F5F7] dark:bg-[#26272E] text-[#6C6D77] dark:text-[#9B9CA6] text-xs font-semibold border border-[#E2E5E9] dark:border-[#2E2F38]">
              {filtered.length} matches
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Pill */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none material-symbols-outlined text-[#6C6D77] dark:text-[#9B9CA6] text-[18px]">search</span>
              <input 
                className="bg-[#F4F5F7] dark:bg-[#14151A] text-[#14151A] dark:text-[#EDEDF0] placeholder:text-[#9B9CA6] dark:placeholder:text-[#6C6D77] text-xs pl-10 pr-4 py-2.5 rounded-full focus:outline-none focus:ring-1 focus:ring-[#9FE870] w-64 border border-[#DFE2E6] dark:border-[#2E2F38]" 
                placeholder="Filter ID, status, amount..." 
                type="text"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
              />
            </div>

            {/* Filter Tabs as Wise Segmented Control Pill */}
            <div className="flex items-center gap-1 bg-[#E8EAEF] dark:bg-[#14151A] p-1 rounded-full border border-[#DFE2E6] dark:border-[#2E2F38]">
              {(['All', 'Settled', 'Delayed', 'Exceptions', 'Failed'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => { setFilterTab(tab); setPage(1); }}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                    filterTab === tab
                      ? 'bg-[#14151A] text-[#9FE870] dark:bg-[#9FE870] dark:text-[#14151A]'
                      : 'text-[#6C6D77] dark:text-[#9B9CA6] hover:text-[#14151A] dark:hover:text-[#EDEDF0]'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Desktop Table View (Hidden on mobile) with Increased Row Padding */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[#6C6D77] dark:text-[#9B9CA6] text-xs uppercase tracking-wider font-semibold border-b border-[#E8EAEF] dark:border-[#26272E]">
                <th className="py-4 px-4">Transaction ID</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-4">Gateway</th>
                <th className="py-4 px-4">Bank</th>
                <th className="py-4 px-4">Ledger</th>
                <th className="py-4 px-4 text-right">Amount</th>
                <th className="py-4 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8EAEF] dark:divide-[#26272E] text-xs">
              {paginated.map((row) => {
                const isSettled = row.overall_status === 'SETTLED';
                const isDelayed = row.overall_status === 'DELAYED' || row.overall_status === 'LEDGER_DELAY';
                const isException = ['CRITICAL_EXCEPTION', 'EXCEPTION', 'DATA_INCONSISTENCY', 'DUPLICATE_RECORD'].includes(row.overall_status);

                return (
                  <tr 
                    key={row.transaction_id}
                    className="group cursor-pointer transition-colors hover:bg-[#F4F5F7] dark:hover:bg-[#26272E]"
                    onClick={() => handleRowClick(row.transaction_id)}
                  >
                    {/* ID */}
                    <td className="py-4 px-4 font-semibold text-[#14151A] dark:text-[#EDEDF0]">
                      <span className="tabular-nums font-mono">{row.transaction_id}</span>
                    </td>

                    {/* Overall Status in Wise Pill */}
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                        isSettled ? 'bg-[#9FE870]/12 text-[#2D5A0F] dark:text-[#9FE870] border border-[#9FE870]/20' :
                        isDelayed ? 'bg-[#F0B84B]/12 text-[#875800] dark:text-[#F0B84B] border border-[#F0B84B]/20' :
                        isException ? 'bg-[#F1483F]/12 text-[#9E1B1B] dark:text-[#F1483F] border border-[#F1483F]/20' :
                        'bg-[#E8EAEF] dark:bg-[#26272E] text-[#6C6D77] dark:text-[#9B9CA6] border border-[#DFE2E6] dark:border-[#2E2F38]'
                      }`}>
                        {isSettled ? 'Settled' : row.overall_status}
                      </span>
                    </td>

                    {/* Gateway */}
                    <td className="py-4 px-4 text-xs text-[#6C6D77] dark:text-[#9B9CA6]">
                      {row.gateway.found ? (
                        <div>
                          <span className="font-medium text-[#14151A] dark:text-[#EDEDF0]">{row.gateway.status}</span>
                          <div className="text-[11px] text-[#6C6D77] dark:text-[#9B9CA6]">{row.gateway.timestamp?.split(' ')[1] || 'Captured'}</div>
                        </div>
                      ) : (
                        <span className="text-[#E8615C] font-semibold">MISSING</span>
                      )}
                    </td>

                    {/* Bank */}
                    <td className="py-4 px-4 text-xs text-[#6C6D77] dark:text-[#9B9CA6]">
                      {row.bank.found ? (
                        <div>
                          <span className={`font-medium ${
                            row.bank.status === 'SETTLED' ? 'text-[#2D5A0F] dark:text-[#9FE870]' :
                            row.bank.status === 'PENDING' ? 'text-[#F0B84B]' : 'text-[#E8615C]'
                          }`}>
                            {row.bank.status}
                          </span>
                          <div className="text-[11px] text-[#6C6D77] dark:text-[#9B9CA6]">{row.bank.currency} {row.bank.amount}</div>
                        </div>
                      ) : (
                        <span className="text-[#F0B84B] font-medium">NOT RECEIVED</span>
                      )}
                    </td>

                    {/* Ledger */}
                    <td className="py-4 px-4 text-xs text-[#6C6D77] dark:text-[#9B9CA6]">
                      {row.ledger.found ? (
                        <div>
                          <span className={`font-medium ${
                            row.ledger.status === 'POSTED' ? 'text-[#2D5A0F] dark:text-[#9FE870]' :
                            row.ledger.status === 'PENDING' ? 'text-[#F0B84B]' : 'text-[#E8615C]'
                          }`}>
                            {row.ledger.status}
                          </span>
                          <div className="text-[11px] text-[#6C6D77] dark:text-[#9B9CA6]">{row.ledger.currency} {row.ledger.amount}</div>
                        </div>
                      ) : (
                        <span className="text-[#F0B84B] font-medium">PENDING</span>
                      )}
                    </td>

                    {/* Amount */}
                    <td className="py-4 px-4 text-right font-semibold text-[#14151A] dark:text-[#EDEDF0] text-sm tabular-nums">
                      {row.currency === 'USD' ? '$' : '₹'}{row.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>

                    {/* Action Button as Wise Pill */}
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleRowClick(row.transaction_id); }}
                        className="px-3.5 py-1.5 rounded-full bg-[#F4F5F7] dark:bg-[#26272E] hover:bg-[#E8EAEF] dark:hover:bg-[#2E2F38] text-[#14151A] dark:text-[#EDEDF0] font-semibold text-xs transition-colors border border-[#E2E5E9] dark:border-[#2E2F38]"
                      >
                        Inspect →
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Card-List View (Shown only on small screens) */}
        <div className="md:hidden flex flex-col gap-3">
          {paginated.map((row) => {
            const isSettled = row.overall_status === 'SETTLED';
            const isDelayed = row.overall_status === 'DELAYED' || row.overall_status === 'LEDGER_DELAY';
            const isException = ['CRITICAL_EXCEPTION', 'EXCEPTION', 'DATA_INCONSISTENCY', 'DUPLICATE_RECORD'].includes(row.overall_status);

            return (
              <div 
                key={row.transaction_id}
                onClick={() => handleRowClick(row.transaction_id)}
                className="p-4 rounded-2xl bg-[#F8F9FA] dark:bg-[#14151A] border border-[#E2E5E9] dark:border-[#2E2F38] flex flex-col gap-3 cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold font-mono text-[#14151A] dark:text-[#EDEDF0]">{row.transaction_id}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    isSettled ? 'bg-[#9FE870]/12 text-[#2D5A0F] dark:text-[#9FE870] border border-[#9FE870]/20' :
                    isDelayed ? 'bg-[#F0B84B]/12 text-[#875800] dark:text-[#F0B84B] border border-[#F0B84B]/20' :
                    isException ? 'bg-[#F1483F]/12 text-[#9E1B1B] dark:text-[#F1483F] border border-[#F1483F]/20' :
                    'bg-[#E8EAEF] dark:bg-[#26272E] text-[#6C6D77] dark:text-[#9B9CA6]'
                  }`}>
                    {isSettled ? 'Settled' : row.overall_status}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs text-[#6C6D77] dark:text-[#9B9CA6] pt-1">
                  <div>
                    <span className="block text-[10px] uppercase">Gateway</span>
                    <span className="font-medium text-[#14151A] dark:text-[#EDEDF0]">{row.gateway.status || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase">Bank</span>
                    <span className="font-medium text-[#14151A] dark:text-[#EDEDF0]">{row.bank.status || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase">Ledger</span>
                    <span className="font-medium text-[#14151A] dark:text-[#EDEDF0]">{row.ledger.status || 'N/A'}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-[#E8EAEF] dark:border-[#26272E]">
                  <span className="text-sm font-semibold text-[#14151A] dark:text-[#EDEDF0] tabular-nums">
                    {row.currency === 'USD' ? '$' : '₹'}{row.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-xs font-semibold text-[#2D5A0F] dark:text-[#9FE870]">Inspect Case →</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination Controls as Wise Pills */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-[#E8EAEF] dark:border-[#26272E] text-xs text-[#6C6D77] dark:text-[#9B9CA6] gap-4">
          <span>
            Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, filtered.length)} of {filtered.length} transactions
          </span>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-full bg-[#F4F5F7] dark:bg-[#26272E] text-[#14151A] dark:text-[#EDEDF0] hover:bg-[#E8EAEF] dark:hover:bg-[#2E2F38] transition-colors disabled:opacity-40 border border-[#E2E5E9] dark:border-[#2E2F38] font-medium"
            >
              Previous
            </button>
            <span className="px-3 py-1.5 rounded-full bg-[#F4F5F7] dark:bg-[#14151A] text-[#14151A] dark:text-[#EDEDF0] font-medium border border-[#E2E5E9] dark:border-[#2E2F38]">
              Page {page} of {totalPages}
            </span>
            <button 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 rounded-full bg-[#14151A] text-[#9FE870] dark:bg-[#9FE870] dark:text-[#14151A] hover:bg-[#26272E] dark:hover:bg-[#B5F58D] transition-colors disabled:opacity-40 font-semibold"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
