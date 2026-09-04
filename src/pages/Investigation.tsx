import React, { useState } from 'react';
import { NavPage } from '../types';

interface InvestigationProps {
  txId: string;
  setActivePage: (page: NavPage) => void;
}

export const Investigation: React.FC<InvestigationProps> = ({ txId, setActivePage }) => {
  const currentTx = txId || 'tx_984192841';
  const [retriggered, setRetriggered] = useState(false);
  const [escalated, setEscalated] = useState(false);

  const handleRetrigger = () => {
    setRetriggered(true);
    alert('Re-triggering PayTrace automated clearing match across SWIFT and JPMorgan ledger...');
  };

  const handleEscalate = () => {
    setEscalated(true);
    alert('Incident escalated to Payment Operations queue.');
  };

  return (
    <div className="flex flex-col w-full px-gutter py-6 gap-stack-lg max-w-7xl mx-auto pb-28">
      {/* 1. Page Header & Breadcrumbs */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-label-sm text-on-surface-variant dark:text-slate-400 font-tabular-nums">
          <button onClick={() => setActivePage('dashboard')} className="hover:text-on-surface dark:hover:text-white transition-colors">Investigation</button>
          <span>/</span>
          <button onClick={() => setActivePage('dashboard')} className="hover:text-on-surface dark:hover:text-white transition-colors">Settlements</button>
          <span>/</span>
          <span className="text-blue-600 dark:text-blue-400 font-semibold">{currentTx}</span>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-stack-md">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setActivePage('dashboard')} 
              className="w-10 h-10 rounded-xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl hover:bg-white/80 dark:hover:bg-slate-700/80 border border-white/80 dark:border-white/10 flex items-center justify-center transition-colors text-on-surface dark:text-white shadow-sm"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </button>
            <h1 className="font-headline-xl text-primary dark:text-white font-tabular-nums tracking-tight text-[28px] font-semibold">{currentTx}</h1>
          </div>
          <div className="flex items-center gap-2.5">
            <button 
              onClick={() => alert('Exporting audit log...')}
              className="px-4 py-2 rounded-xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl hover:bg-white/80 dark:hover:bg-slate-700/80 border border-white/80 dark:border-white/10 text-on-surface dark:text-white text-body-sm font-medium transition-colors flex items-center gap-2 shadow-sm"
            >
              <span className="material-symbols-outlined text-[16px]">download</span>
              Export Audit Log
            </button>
            <button 
              onClick={() => alert('Share link copied to clipboard!')}
              className="px-4 py-2 rounded-xl bg-primary dark:bg-blue-600 text-on-primary text-body-sm font-medium hover:bg-primary/90 dark:hover:bg-blue-500 transition-colors flex items-center gap-2 shadow-sm"
            >
              <span className="material-symbols-outlined text-[16px]">share</span>
              Share Case
            </button>
          </div>
        </div>
      </div>

      {/* 2. Settlement Status Banner Card */}
      <div className="w-full bg-white/60 dark:bg-slate-900/50 backdrop-blur-2xl rounded-2xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.4)] border border-white/80 dark:border-white/10 relative overflow-hidden">
        <div className={`absolute top-0 left-0 w-1.5 h-full ${retriggered ? 'bg-emerald-500' : 'bg-amber-500'}`} />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-stack-lg">
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${retriggered ? 'bg-emerald-500/10 dark:bg-emerald-950/80' : 'bg-amber-500/10 dark:bg-amber-950/80'}`}>
              <span className={`material-symbols-outlined text-[26px] ${retriggered ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                {retriggered ? 'check_circle' : 'warning'}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                <span className={`px-2.5 py-0.5 rounded-full text-label-sm uppercase tracking-wider font-semibold border ${retriggered ? 'bg-emerald-500/10 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-500/20' : 'bg-amber-500/10 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-amber-500/20'}`}>
                  {retriggered ? 'Reconciliation Complete' : 'Delayed Exception'}
                </span>
                <span className="text-label-sm text-on-surface-variant dark:text-slate-400 font-tabular-nums">Code: ERR_SWIFT_MT103_MISMATCH</span>
              </div>
              <h2 className="font-headline-lg text-primary dark:text-white font-semibold text-[20px]">
                {retriggered ? 'Settlement Synchronized with Correspondent Bank' : 'Clearing Hold at Correspondent Bank'}
              </h2>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-black/[0.02] dark:bg-white/[0.04] border border-black/5 dark:border-white/5">
            <div className="flex flex-col gap-0.5">
              <span className="text-label-sm text-on-surface-variant dark:text-slate-400">Transaction ID</span>
              <span className="font-tabular-nums text-body-md font-semibold text-primary dark:text-white">{currentTx}</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-label-sm text-on-surface-variant dark:text-slate-400">Amount</span>
              <span className="font-tabular-nums text-body-md font-semibold text-primary dark:text-white">$1,250,000.00</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-label-sm text-on-surface-variant dark:text-slate-400">Delay Point</span>
              <span className="font-tabular-nums text-body-md font-semibold text-primary dark:text-white">SWIFT MT103</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-label-sm text-on-surface-variant dark:text-slate-400">Confidence</span>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="font-tabular-nums text-body-md font-semibold text-primary dark:text-white">HIGH (98.4%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. System Multi-Hop Trace Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-stack-lg relative">
        {/* Gateway Card */}
        <div className="bg-white/60 dark:bg-slate-900/50 backdrop-blur-2xl rounded-2xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.4)] border border-white/80 dark:border-white/10 flex flex-col gap-stack-md relative">
          <div className="flex items-center justify-between">
            <span className="text-label-sm text-on-surface-variant dark:text-slate-400 uppercase tracking-wider font-medium">Gateway Node</span>
            <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-label-sm font-semibold border border-emerald-500/20">
              <span className="material-symbols-outlined text-[14px]">check</span>
              Verified
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <div className="font-tabular-nums font-semibold text-headline-xl text-primary dark:text-white">$1,250,000.00</div>
            <div className="text-body-sm text-on-surface-variant dark:text-slate-400">USD • Stripe Enterprise Gateway</div>
          </div>
          <div className="pt-3 border-t border-black/[0.04] dark:border-white/10 flex items-center justify-between text-label-sm text-on-surface-variant dark:text-slate-400">
            <span>Processed Timestamp</span>
            <span className="font-tabular-nums">2023-10-24 14:22:01 UTC</span>
          </div>
        </div>

        {/* Bank Partner Card */}
        <div className={`bg-white/60 dark:bg-slate-900/50 backdrop-blur-2xl rounded-2xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.4)] border flex flex-col gap-stack-md relative ${retriggered ? 'border-white/80 dark:border-white/10' : 'border-amber-500/40 ring-1 ring-amber-500/20'}`}>
          {!retriggered && (
            <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
              Bottleneck
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-label-sm text-on-surface-variant dark:text-slate-400 uppercase tracking-wider font-medium">Bank Partner</span>
            <div className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-label-sm font-semibold border ${retriggered ? 'bg-emerald-500/10 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-500/20' : 'bg-amber-500/10 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-amber-500/20'}`}>
              <span className="material-symbols-outlined text-[14px]">{retriggered ? 'check' : 'warning'}</span>
              {retriggered ? 'Cleared' : 'Flagged'}
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <div className="font-tabular-nums font-semibold text-headline-xl text-primary dark:text-white">$1,249,500.00</div>
            <div className="text-body-sm text-on-surface-variant dark:text-slate-400">USD • J.P. Morgan Clearing (MT103)</div>
          </div>
          <div className="pt-3 border-t border-black/[0.04] dark:border-white/10 flex items-center justify-between text-label-sm text-on-surface-variant dark:text-slate-400">
            <span>Hold Timestamp</span>
            <span className="font-tabular-nums">2023-10-24 14:25:40 UTC</span>
          </div>
        </div>

        {/* Internal Ledger Card */}
        <div className="bg-white/60 dark:bg-slate-900/50 backdrop-blur-2xl rounded-2xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.4)] border border-white/80 dark:border-white/10 flex flex-col gap-stack-md relative">
          <div className="flex items-center justify-between">
            <span className="text-label-sm text-on-surface-variant dark:text-slate-400 uppercase tracking-wider font-medium">Internal Ledger</span>
            <div className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-label-sm font-semibold border ${retriggered ? 'bg-emerald-500/10 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-500/20' : 'bg-black/[0.04] dark:bg-white/[0.08] text-on-surface-variant dark:text-slate-300 border-black/5 dark:border-white/5'}`}>
              <span className="material-symbols-outlined text-[14px]">{retriggered ? 'check' : 'pending'}</span>
              {retriggered ? 'Matched' : 'Pending Match'}
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <div className="font-tabular-nums font-semibold text-headline-xl text-primary dark:text-white">$1,250,000.00</div>
            <div className="text-body-sm text-on-surface-variant dark:text-slate-400">USD • Core Accounting System</div>
          </div>
          <div className="pt-3 border-t border-black/[0.04] dark:border-white/10 flex items-center justify-between text-label-sm text-on-surface-variant dark:text-slate-400">
            <span>Expected Match</span>
            <span className="font-tabular-nums">{retriggered ? 'Verified Synchronized' : 'Awaiting SWIFT Release'}</span>
          </div>
        </div>
      </div>

      {/* 4. Timeline */}
      <div className="bg-white/60 dark:bg-slate-900/50 backdrop-blur-2xl rounded-2xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.4)] border border-white/80 dark:border-white/10 flex flex-col gap-stack-lg">
        <div className="flex items-center justify-between">
          <h3 className="font-headline-md text-primary dark:text-white font-semibold">Transaction Lifecycle Timeline</h3>
          <span className="text-label-sm text-on-surface-variant dark:text-slate-400 font-tabular-nums">4 Events Recorded</span>
        </div>
        <div className="relative pl-6 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-black/[0.06] dark:before:bg-slate-700">
          <div className="relative flex items-start gap-stack-md">
            <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-blue-600 dark:bg-blue-500 ring-4 ring-white dark:ring-slate-900" />
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                <span className="font-tabular-nums text-label-sm text-on-surface-variant dark:text-slate-400">14:22:01 UTC</span>
                <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-300 text-label-sm font-semibold border border-blue-500/20">Gateway</span>
              </div>
              <p className="font-body-lg text-primary dark:text-white font-medium">Payment captured by gateway</p>
              <p className="text-body-sm text-on-surface-variant dark:text-slate-400">Authorization token generated via Stripe API v2023-10. Funds reserved successfully on client card issuer.</p>
            </div>
          </div>
          <div className="relative flex items-start gap-stack-md">
            <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-blue-600 dark:bg-blue-500 ring-4 ring-white dark:ring-slate-900" />
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                <span className="font-tabular-nums text-label-sm text-on-surface-variant dark:text-slate-400">14:23:15 UTC</span>
                <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-300 text-label-sm font-semibold border border-blue-500/20">Ledger</span>
              </div>
              <p className="font-body-lg text-primary dark:text-white font-medium">Internal ledger entry created</p>
              <p className="text-body-sm text-on-surface-variant dark:text-slate-400">Double-entry record posted to accounts receivable. Balance awaiting wire reconciliation.</p>
            </div>
          </div>
          <div className="relative flex items-start gap-stack-md">
            <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-amber-500 ring-4 ring-white dark:ring-slate-900" />
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                <span className="font-tabular-nums text-label-sm text-on-surface-variant dark:text-slate-400">14:25:40 UTC</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:bg-amber-950 dark:text-amber-300 text-label-sm font-semibold border border-amber-500/20">Bank Partner</span>
              </div>
              <p className="font-body-lg text-primary dark:text-white font-medium">SWIFT MT103 message dispatched with fee variance</p>
              <p className="text-body-sm text-on-surface-variant dark:text-slate-400">Correspondent bank flagged a $500 intermediary deduction discrepancy against expected net settlement.</p>
            </div>
          </div>
          <div className="relative flex items-start gap-stack-md">
            <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-black/20 dark:bg-slate-700 ring-4 ring-white dark:ring-slate-900" />
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                <span className="font-tabular-nums text-label-sm text-on-surface-variant dark:text-slate-400">14:30:00 UTC</span>
                <span className="px-2 py-0.5 rounded-full bg-black/[0.04] dark:bg-white/[0.08] text-on-surface-variant dark:text-slate-300 text-label-sm font-semibold border border-black/5 dark:border-white/5">System</span>
              </div>
              <p className="font-body-lg text-primary dark:text-white font-medium">Automatic clearing match paused</p>
              <p className="text-body-sm text-on-surface-variant dark:text-slate-400">Transaction routed to manual operations queue due to currency divergence threshold breach.</p>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Two-column row: AI Investigation & Exceptions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-stack-lg">
        {/* AI Investigation Panel */}
        <div className="bg-white/60 dark:bg-slate-900/50 backdrop-blur-2xl rounded-2xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.4)] border border-white/80 dark:border-white/10 flex flex-col gap-stack-md justify-between">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-[20px]">smart_toy</span>
                <h3 className="font-headline-md text-primary dark:text-white font-semibold">AI Investigation</h3>
              </div>
              <span className="text-label-sm text-on-surface-variant dark:text-slate-300 bg-black/[0.04] dark:bg-white/[0.08] px-2.5 py-0.5 rounded-full border border-black/5 dark:border-white/5">Verified Evidence</span>
            </div>
            <span className="text-label-sm text-on-surface-variant dark:text-slate-400 uppercase tracking-wider font-medium">AI-generated explanation — based on verified transaction evidence</span>
            <div className="flex flex-col gap-3 text-body-md text-on-surface dark:text-slate-300 leading-relaxed">
              <p>The transaction encountered a soft hold at the correspondent banking layer due to an unexplained $500.00 intermediary deduction on the SWIFT MT103 transmission. While the initial gateway capture and internal ledger recorded the full $1,250,000.00, the incoming wire reflects $1,249,500.00.</p>
              <p>Historical pattern analysis indicates that this specific correspondent routing path frequently applies unexpected intermediary correspondent fees for high-value cross-border transfers originating from non-standard regional accounts.</p>
              <p>The automated reconciliation engine correctly suspended the clearing match to prevent ledger imbalance. Re-triggering the match requires either absorbing the fee variance into operational overhead or issuing a secondary adjustment code.</p>
            </div>
          </div>
          <div className="pt-4 border-t border-black/[0.04] dark:border-white/10 flex items-center justify-between text-label-sm text-on-surface-variant dark:text-slate-400">
            <span>Model: PayTrace-LLM v4.2</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">check_circle</span>
              High Confidence
            </span>
          </div>
        </div>

        {/* Exceptions Panel */}
        <div className="bg-red-500/[0.04] dark:bg-red-950/20 backdrop-blur-2xl rounded-2xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.4)] flex flex-col gap-stack-md justify-between border border-red-500/20 dark:border-red-900/30">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-red-600 dark:text-red-400 text-[20px]">error</span>
                <h3 className="font-headline-md text-red-900 dark:text-red-300 font-semibold">Currency Divergence Check</h3>
              </div>
              <span className="text-label-sm text-red-700 dark:text-red-300 bg-red-500/10 dark:bg-red-950 px-2.5 py-0.5 rounded-full font-semibold border border-red-500/20">Critical Alert</span>
            </div>
            <div className="p-4 rounded-xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm flex flex-col gap-2.5 border border-black/5 dark:border-white/5">
              <div className="flex items-center justify-between text-body-sm">
                <span className="text-on-surface-variant dark:text-slate-400">Expected Ledger Total</span>
                <span className="font-tabular-nums font-semibold text-primary dark:text-white">$1,250,000.00 USD</span>
              </div>
              <div className="flex items-center justify-between text-body-sm">
                <span className="text-on-surface-variant dark:text-slate-400">Actual Received Wire</span>
                <span className="font-tabular-nums font-semibold text-red-600 dark:text-red-400">$1,249,500.00 USD</span>
              </div>
              <div className="w-full h-[1px] bg-black/[0.06] dark:bg-slate-700 my-1" />
              <div className="flex items-center justify-between text-body-sm">
                <span className="text-on-surface dark:text-slate-300 font-semibold">Variance Delta</span>
                <span className="font-tabular-nums font-semibold text-red-600 dark:text-red-400">-$500.00 USD (0.04%)</span>
              </div>
            </div>
            <p className="text-body-sm text-on-surface-variant dark:text-slate-300 leading-relaxed">
              The detected variance exceeds the automated tolerance threshold of $0.00 for institutional ledger matching. Manual operator intervention is strictly required to resolve the discrepancy before downstream settlement can finalize.
            </p>
          </div>
          <div className="pt-4 border-t border-red-500/15 flex items-center justify-between text-label-sm text-on-surface-variant dark:text-slate-400">
            <span>Rule ID: VAL_CURRENCY_MISMATCH_09</span>
            <span className="font-semibold underline cursor-pointer text-primary dark:text-white" onClick={() => alert('Viewing institutional compliance policy document...')}>View Compliance Policy</span>
          </div>
        </div>
      </div>

      {/* 6. Evidence Panel */}
      <div className="bg-white/60 dark:bg-slate-900/50 backdrop-blur-2xl rounded-2xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.4)] border border-white/80 dark:border-white/10 flex flex-col gap-stack-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-[20px]">database</span>
            <h3 className="font-headline-md text-primary dark:text-white font-semibold">Audit Trail Evidence Breakdown</h3>
          </div>
          <span className="text-label-sm text-on-surface-variant dark:text-slate-400 font-tabular-nums">Raw Telemetry Reference</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-stack-lg">
          {/* Gateway Evidence */}
          <div className="flex flex-col gap-3 p-4 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/5">
            <div className="flex items-center justify-between border-b border-black/[0.04] dark:border-white/10 pb-2">
              <span className="font-semibold text-primary dark:text-white text-[14px]">Gateway Evidence</span>
              <span className="text-label-sm font-tabular-nums text-on-surface-variant dark:text-slate-400">STRIPE_API</span>
            </div>
            <div className="flex flex-col gap-2 font-tabular-nums text-body-sm">
              <div className="flex justify-between"><span className="text-on-surface-variant dark:text-slate-400">Event ID:</span> <span className="text-primary dark:text-white">evt_3M109284</span></div>
              <div className="flex justify-between"><span className="text-on-surface-variant dark:text-slate-400">Auth Code:</span> <span className="text-primary dark:text-white">AUTH_891274</span></div>
              <div className="flex justify-between"><span className="text-on-surface-variant dark:text-slate-400">Status:</span> <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Succeeded</span></div>
              <div className="flex justify-between"><span className="text-on-surface-variant dark:text-slate-400">Fee Deducted:</span> <span className="text-primary dark:text-white">$3,625.00</span></div>
              <div className="flex justify-between"><span className="text-on-surface-variant dark:text-slate-400">Host IP:</span> <span className="text-primary dark:text-white">54.241.12.90</span></div>
            </div>
          </div>
          {/* Bank Evidence */}
          <div className="flex flex-col gap-3 p-4 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/5">
            <div className="flex items-center justify-between border-b border-black/[0.04] dark:border-white/10 pb-2">
              <span className="font-semibold text-primary dark:text-white text-[14px]">Bank Evidence</span>
              <span className="text-label-sm font-tabular-nums text-on-surface-variant dark:text-slate-400">SWIFT_NET</span>
            </div>
            <div className="flex flex-col gap-2 font-tabular-nums text-body-sm">
              <div className="flex justify-between"><span className="text-on-surface-variant dark:text-slate-400">MT Ref:</span> <span className="text-primary dark:text-white">MT103/2023</span></div>
              <div className="flex justify-between"><span className="text-on-surface-variant dark:text-slate-400">Sender BIC:</span> <span className="text-primary dark:text-white">CHASUS33XXX</span></div>
              <div className="flex justify-between"><span className="text-on-surface-variant dark:text-slate-400">Receiver BIC:</span> <span className="text-primary dark:text-white">BOFAUS3NXXX</span></div>
              <div className="flex justify-between"><span className="text-on-surface-variant dark:text-slate-400">Intermediary Fee:</span> <span className="text-amber-600 dark:text-amber-400 font-semibold">$500.00</span></div>
              <div className="flex justify-between"><span className="text-on-surface-variant dark:text-slate-400">UETR:</span> <span className="text-primary dark:text-white truncate max-w-[120px]">f81d4fae-...</span></div>
            </div>
          </div>
          {/* Ledger Evidence */}
          <div className="flex flex-col gap-3 p-4 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/5">
            <div className="flex items-center justify-between border-b border-black/[0.04] dark:border-white/10 pb-2">
              <span className="font-semibold text-primary dark:text-white text-[14px]">Ledger Evidence</span>
              <span className="text-label-sm font-tabular-nums text-on-surface-variant dark:text-slate-400">CORE_DB</span>
            </div>
            <div className="flex flex-col gap-2 font-tabular-nums text-body-sm">
              <div className="flex justify-between"><span className="text-on-surface-variant dark:text-slate-400">Journal ID:</span> <span className="text-primary dark:text-white">JNL_984129</span></div>
              <div className="flex justify-between"><span className="text-on-surface-variant dark:text-slate-400">Account:</span> <span className="text-primary dark:text-white">1020-USD-SET</span></div>
              <div className="flex justify-between"><span className="text-on-surface-variant dark:text-slate-400">Entry Type:</span> <span className="text-primary dark:text-white">CREDIT</span></div>
              <div className="flex justify-between"><span className="text-on-surface-variant dark:text-slate-400">Match Status:</span> <span className="text-amber-600 dark:text-amber-400 font-semibold">HOLD_VARIANCE</span></div>
              <div className="flex justify-between"><span className="text-on-surface-variant dark:text-slate-400">Checksum:</span> <span className="text-primary dark:text-white">0x8f9c2a1</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* 7. Recommended Action Banner */}
      <div className="w-full bg-white/60 dark:bg-slate-900/50 backdrop-blur-2xl rounded-2xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.4)] border border-white/80 dark:border-white/10 relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-stack-lg">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-600 dark:bg-blue-500" />
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 dark:bg-blue-950/80 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-[24px]">bolt</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-label-sm text-on-surface-variant dark:text-slate-400 uppercase tracking-wider font-semibold">Recommended Action</span>
            <p className="font-headline-md text-primary dark:text-white font-medium text-[16px]">Escalate to payment operations or re-trigger clearing match.</p>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button 
            onClick={handleEscalate}
            className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-white/70 dark:bg-slate-800/70 hover:bg-white/90 dark:hover:bg-slate-700/90 text-on-surface dark:text-white text-body-sm font-medium transition-colors border border-black/5 dark:border-white/10 text-center shadow-sm"
          >
            {escalated ? 'Escalated to Ops ✓' : 'Escalate to Ops'}
          </button>
          <button 
            onClick={handleRetrigger}
            className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-primary dark:bg-blue-600 text-on-primary text-body-sm font-medium hover:bg-primary/90 dark:hover:bg-blue-500 transition-all shadow-sm text-center flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            <span className={`material-symbols-outlined text-[16px] ${retriggered ? 'text-emerald-300' : ''}`}>
              {retriggered ? 'done' : 'refresh'}
            </span>
            {retriggered ? 'Clearing Match Synchronized' : 'Re-trigger Clearing Match'}
          </button>
        </div>
      </div>
    </div>
  );
};
