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
      {/* ── HEADER & DATE SELECTOR (WISE STYLE) ────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-3 py-1 rounded-full bg-[#EBF8E3] dark:bg-[#1A2B1A] text-[#163300] dark:text-[#9FE870] text-xs font-mono font-bold uppercase tracking-wider">
              CSV Ledger Ingestion
            </span>
            <span className="text-xs text-[#596859] dark:text-[#9DA99D] font-mono">
              {allTransactions.length} Verified Records
            </span>
          </div>
          <h1 className="text-[#163300] dark:text-white font-extrabold text-[30px] sm:text-[36px] tracking-tight">
            Settlement Overview &amp; Ledger Audit
          </h1>
          <p className="text-sm text-[#596859] dark:text-[#9DA99D]">
            Real-time reconciliation status across Gateway, Core Banking, and General Ledger data.
          </p>
        </div>

        {/* Live Date Switcher & Export CSV Pills */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-white dark:bg-[#131A13] px-4 py-2 rounded-full border border-[#E2E5E9] dark:border-[#273827] shadow-sm">
            <span className="material-symbols-outlined text-[#2D5A0F] dark:text-[#9FE870] text-[18px]">calendar_today</span>
            <select
              value={selectedDate}
              onChange={(e) => { setSelectedDate(e.target.value); setPage(1); }}
              className="bg-transparent text-xs font-mono font-bold text-[#163300] dark:text-white focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="dark:bg-[#131A13]">All Batches ({allTransactions.length} txns)</option>
              {meta.dates.map(d => (
                <option key={d} value={d} className="dark:bg-[#131A13]">
                  Batch {d}
                </option>
              ))}
            </select>
          </div>

          <button 
            className="flex items-center gap-2 bg-[#163300] text-[#9FE870] hover:bg-[#244D00] dark:bg-[#9FE870] dark:text-[#163300] dark:hover:bg-[#B5F58D] px-5 py-2.5 rounded-full text-xs font-bold transition-all shadow-sm active:scale-95 shrink-0" 
            onClick={handleExportCSV}
            title={`Export ${filtered.length} transactions as CSV`}
          >
            <span className="material-symbols-outlined text-[17px]">download</span>
            <span>Export CSV ({filtered.length})</span>
          </button>
        </div>
      </div>

      {/* ── 4 STAT CARDS IN WISE ROUNDED-3XL CONTAINERS ─────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Volume */}
        <div className="bg-white dark:bg-[#131A13] p-6 rounded-3xl border border-[#E2E5E9] dark:border-[#273827] shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-[#596859] dark:text-[#9DA99D] uppercase tracking-wider font-mono font-bold">
                {selectedDate === 'ALL' ? 'All Batches Volume' : `Batch ${selectedDate}`}
              </span>
              <div className="w-8 h-8 rounded-full bg-[#EBF8E3] dark:bg-[#1A2B1A] text-[#163300] dark:text-[#9FE870] flex items-center justify-center">
                <span className="material-symbols-outlined text-[17px]">payments</span>
              </div>
            </div>
            <div className="font-mono font-extrabold text-[#163300] dark:text-white tracking-tight text-[26px]">
              ₹{stats.vol.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#F0F2F5] dark:border-[#243324] flex justify-between text-xs text-[#596859] dark:text-[#9DA99D]">
            <span>Total Cases</span>
            <span className="font-mono font-bold text-[#163300] dark:text-white">{stats.total}</span>
          </div>
        </div>

        {/* Settled Clean */}
        <div className="bg-white dark:bg-[#131A13] p-6 rounded-3xl border border-[#E2E5E9] dark:border-[#273827] shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-[#596859] dark:text-[#9DA99D] uppercase tracking-wider font-mono font-bold">
                Settled Clean
              </span>
              <div className="w-8 h-8 rounded-full bg-[#9FE870] text-[#163300] flex items-center justify-center">
                <span className="material-symbols-outlined text-[17px]">check_circle</span>
              </div>
            </div>
            <div className="font-mono font-extrabold text-[#163300] dark:text-white tracking-tight text-[26px]">
              {stats.settled}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#F0F2F5] dark:border-[#243324] flex justify-between text-xs text-[#596859] dark:text-[#9DA99D]">
            <span>Resolution Rate</span>
            <span className="font-mono font-bold text-[#163300] dark:text-[#9FE870]">
              {stats.total > 0 ? ((stats.settled / stats.total) * 100).toFixed(1) : 0}%
            </span>
          </div>
        </div>

        {/* Delayed In-Flight */}
        <div className="bg-white dark:bg-[#131A13] p-6 rounded-3xl border border-[#E2E5E9] dark:border-[#273827] shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-[#596859] dark:text-[#9DA99D] uppercase tracking-wider font-mono font-bold">
                Delayed / In-Flight
              </span>
              <div className="w-8 h-8 rounded-full bg-[#FEF3C7] text-[#B45309] flex items-center justify-center">
                <span className="material-symbols-outlined text-[17px]">schedule</span>
              </div>
            </div>
            <div className="font-mono font-extrabold text-[#B45309] dark:text-[#FBBF24] tracking-tight text-[26px]">
              {stats.delayed}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#F0F2F5] dark:border-[#243324] flex justify-between text-xs text-[#596859] dark:text-[#9DA99D]">
            <span>Bank &amp; Ledger Holds</span>
            <span className="font-mono font-bold text-[#B45309] dark:text-[#FBBF24]">Monitor Hold</span>
          </div>
        </div>

        {/* Exceptions & Discrepancies */}
        <div className="bg-white dark:bg-[#131A13] p-6 rounded-3xl border border-[#E2E5E9] dark:border-[#273827] shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-[#596859] dark:text-[#9DA99D] uppercase tracking-wider font-mono font-bold">
                Exceptions &amp; Variances
              </span>
              <div className="w-8 h-8 rounded-full bg-[#FEE2E2] text-[#B91C1C] flex items-center justify-center">
                <span className="material-symbols-outlined text-[17px]">warning</span>
              </div>
            </div>
            <div className="font-mono font-extrabold text-[#B91C1C] dark:text-[#F87171] tracking-tight text-[26px]">
              {stats.exceptions + stats.failed}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#F0F2F5] dark:border-[#243324] flex justify-between text-xs text-[#596859] dark:text-[#9DA99D]">
            <span>Amount &amp; Currency Discrepancies</span>
            <span className="font-mono font-bold text-[#B91C1C] dark:text-[#F87171]">Flagged</span>
          </div>
        </div>
      </div>

      {/* ── TRANSACTION LEDGER TABLE IN WISE CONTAINER ─────────────────────── */}
      <div className="bg-white dark:bg-[#131A13] rounded-3xl shadow-sm border border-[#E2E5E9] dark:border-[#273827] p-6 sm:p-7 flex flex-col gap-5">
        {/* Table Filters Header with Wise Pill Tabs */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-[#F0F2F5] dark:border-[#243324]">
          <div className="flex items-center gap-3">
            <h2 className="text-[20px] font-extrabold text-[#163300] dark:text-white tracking-tight">
              Settlement Ledger Stream
            </h2>
            <span className="px-3 py-1 rounded-full bg-[#EBF8E3] dark:bg-[#1A2B1A] text-[#163300] dark:text-[#9FE870] text-xs font-mono font-bold">
              {filtered.length} matches
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Pill */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none material-symbols-outlined text-[#596859] dark:text-[#9DA99D] text-[18px]">search</span>
              <input 
                className="bg-[#F4F5F7] dark:bg-[#182218] text-[#163300] dark:text-white placeholder:text-[#8D9B8D] dark:placeholder:text-[#647464] text-xs pl-10 pr-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-[#9FE870] w-64 border border-[#DFE2E6] dark:border-[#243324] font-mono" 
                placeholder="Filter ID, status, amount..." 
                type="text"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
              />
            </div>

            {/* Filter Tabs as Wise Segmented Control Pill */}
            <div className="flex items-center gap-1 bg-[#E8EAEF] dark:bg-[#1A241A] p-1 rounded-full border border-[#DFE2E6] dark:border-[#243324]">
              {(['All', 'Settled', 'Delayed', 'Exceptions', 'Failed'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => { setFilterTab(tab); setPage(1); }}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                    filterTab === tab
                      ? 'bg-[#163300] text-[#9FE870] dark:bg-[#9FE870] dark:text-[#163300] shadow-sm'
                      : 'text-[#596859] dark:text-[#9DA99D] hover:text-[#163300] dark:hover:text-white'
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
              <tr className="text-[#596859] dark:text-[#9DA99D] text-xs uppercase font-mono font-bold border-b border-[#F0F2F5] dark:border-[#243324]">
                <th className="py-3.5 px-3">Transaction ID</th>
                <th className="py-3.5 px-3">Status</th>
                <th className="py-3.5 px-3">Gateway Node</th>
                <th className="py-3.5 px-3">Bank Partner</th>
                <th className="py-3.5 px-3">General Ledger</th>
                <th className="py-3.5 px-3 text-right">Amount</th>
                <th className="py-3.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F2F5] dark:divide-[#1F2B1F] text-xs">
              {paginated.map((row) => {
                const isSettled = row.overall_status === 'SETTLED';
                const isDelayed = row.overall_status === 'DELAYED' || row.overall_status === 'LEDGER_DELAY';
                const isException = ['CRITICAL_EXCEPTION', 'EXCEPTION', 'DATA_INCONSISTENCY', 'DUPLICATE_RECORD'].includes(row.overall_status);

                return (
                  <tr 
                    key={row.transaction_id}
                    className="group cursor-pointer transition-all hover:bg-[#EBF8E3]/60 dark:hover:bg-[#1D291D]/60"
                    onClick={() => handleRowClick(row.transaction_id)}
                  >
                    {/* ID */}
                    <td className="py-3.5 px-3 font-mono font-bold text-[#163300] dark:text-white group-hover:text-[#2D5A0F] dark:group-hover:text-[#9FE870] flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] opacity-60">receipt</span>
                      <span>{row.transaction_id}</span>
                    </td>

                    {/* Overall Status in Wise Pill */}
                    <td className="py-3.5 px-3">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-mono font-bold ${
                        isSettled ? 'bg-[#9FE870] text-[#163300]' :
                        isDelayed ? 'bg-[#FEF3C7] text-[#B45309]' :
                        isException ? 'bg-[#FEE2E2] text-[#B91C1C]' :
                        'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                      }`}>
                        {isSettled ? 'Settled' : row.overall_status}
                      </span>
                    </td>

                    {/* Gateway */}
                    <td className="py-3.5 px-3 font-mono text-xs text-[#596859] dark:text-[#9DA99D]">
                      {row.gateway.found ? (
                        <div>
                          <span className="font-bold text-[#163300] dark:text-white">{row.gateway.status}</span>
                          <div className="text-[10px] opacity-70">{row.gateway.timestamp?.split(' ')[1] || 'Captured'}</div>
                        </div>
                      ) : (
                        <span className="text-red-500 font-bold">MISSING</span>
                      )}
                    </td>

                    {/* Bank */}
                    <td className="py-3.5 px-3 font-mono text-xs text-[#596859] dark:text-[#9DA99D]">
                      {row.bank.found ? (
                        <div>
                          <span className={`font-bold ${
                            row.bank.status === 'SETTLED' ? 'text-[#163300] dark:text-[#9FE870]' :
                            row.bank.status === 'PENDING' ? 'text-[#B45309] dark:text-[#FBBF24]' : 'text-red-500'
                          }`}>
                            {row.bank.status}
                          </span>
                          <div className="text-[10px] opacity-70">{row.bank.currency} {row.bank.amount}</div>
                        </div>
                      ) : (
                        <span className="text-[#B45309] font-bold">NOT RECEIVED</span>
                      )}
                    </td>

                    {/* Ledger */}
                    <td className="py-3.5 px-3 font-mono text-xs text-[#596859] dark:text-[#9DA99D]">
                      {row.ledger.found ? (
                        <div>
                          <span className={`font-bold ${
                            row.ledger.status === 'POSTED' ? 'text-[#163300] dark:text-[#9FE870]' :
                            row.ledger.status === 'PENDING' ? 'text-[#B45309] dark:text-[#FBBF24]' : 'text-red-500'
                          }`}>
                            {row.ledger.status}
                          </span>
                          <div className="text-[10px] opacity-70">{row.ledger.currency} {row.ledger.amount}</div>
                        </div>
                      ) : (
                        <span className="text-[#B45309] font-bold">PENDING</span>
                      )}
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-3 text-right font-mono font-bold text-[#163300] dark:text-white text-sm">
                      {row.currency === 'USD' ? '$' : '₹'}{row.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>

                    {/* Action Button as Wise Pill */}
                    <td className="py-3.5 px-3 text-right">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleRowClick(row.transaction_id); }}
                        className="px-3 py-1 rounded-full bg-[#EBF8E3] dark:bg-[#1A2B1A] hover:bg-[#9FE870] hover:text-[#163300] dark:hover:bg-[#9FE870] dark:hover:text-[#163300] text-[#163300] dark:text-[#9FE870] font-bold text-xs transition-all shadow-sm active:scale-95"
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

        {/* Pagination Controls as Wise Pills */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-[#F0F2F5] dark:border-[#243324] text-xs text-[#596859] dark:text-[#9DA99D] gap-3">
          <span>
            Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, filtered.length)} of {filtered.length} transactions
          </span>
          <div className="flex items-center gap-2 font-mono font-bold">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-1.5 rounded-full bg-[#E8EAEF] dark:bg-[#1A241A] text-[#163300] dark:text-white hover:bg-[#DFE2E6] dark:hover:bg-[#253325] transition-all disabled:opacity-40"
            >
              Previous
            </button>
            <span className="px-3 py-1 rounded-full bg-[#EBF8E3] dark:bg-[#1A2B1A] text-[#163300] dark:text-[#9FE870]">
              Page {page} of {totalPages}
            </span>
            <button 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-1.5 rounded-full bg-[#163300] text-[#9FE870] dark:bg-[#9FE870] dark:text-[#163300] hover:bg-[#244D00] dark:hover:bg-[#B5F58D] transition-all disabled:opacity-40 shadow-sm"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
