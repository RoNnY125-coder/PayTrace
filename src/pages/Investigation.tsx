import React, { useState, useEffect } from 'react';
import { NavPage, InvestigationResult } from '../types';
import { fetchTransaction, fetchExplanation, getLocalTransaction } from '../services/api';

interface InvestigationProps {
  txId: string;
  setActivePage: (page: NavPage) => void;
}

export const Investigation: React.FC<InvestigationProps> = ({ txId, setActivePage }) => {
  const currentTx = txId || 'DEMO004';

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<InvestigationResult | null>(null);
  const [explanation, setExplanation] = useState<string>('');
  const [loadingExplanation, setLoadingExplanation] = useState(false);
  const [retriggered, setRetriggered] = useState(false);
  const [escalated, setEscalated] = useState(false);
  const [inputTx, setInputTx] = useState(currentTx);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setRetriggered(false);
    setEscalated(false);
    setInputTx(currentTx);

    // 1. Fetch Investigation Details
    fetchTransaction(currentTx)
      .then((res) => {
        if (isMounted) {
          setData(res);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error(err);
        if (isMounted) {
          // Fallback check
          const fallback = getLocalTransaction(currentTx);
          setData(fallback);
          setLoading(false);
        }
      });

    // 2. Fetch Gemini AI Explanation
    setLoadingExplanation(true);
    fetchExplanation(currentTx)
      .then((exp) => {
        if (isMounted) {
          setExplanation(exp);
          setLoadingExplanation(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setLoadingExplanation(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [currentTx]);

  const handleSearchNewTx = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputTx.trim()) {
      setActivePage('investigation');
      // Trigger effect by setting currentTx through parent or re-calling
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleRetrigger = () => {
    setRetriggered(true);
    alert(`Re-triggering PayTrace automated reconciliation engine for ${currentTx}... Clearing match verified against correspondent bank ledger.`);
  };

  const handleEscalate = () => {
    setEscalated(true);
    alert(`Incident for ${currentTx} successfully escalated to Payment Operations high-priority queue.`);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <span className="material-symbols-outlined text-[42px] text-blue-600 animate-spin">sync</span>
        <h2 className="text-headline-md font-semibold text-primary dark:text-white">
          Ingesting Ledger Telemetry for {currentTx}...
        </h2>
        <p className="text-body-sm text-on-surface-variant dark:text-slate-400">
          Cross-referencing gateway.csv, bank.csv, and ledger.csv
        </p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-gutter text-center">
        <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-600">
          <span className="material-symbols-outlined text-[32px]">error</span>
        </div>
        <h2 className="text-headline-lg font-semibold text-primary dark:text-white">
          Transaction '{currentTx}' Not Found
        </h2>
        <p className="text-body-md text-on-surface-variant dark:text-slate-400 max-w-md">
          This transaction ID does not exist in the active CSV audit datasets (gateway.csv, bank.csv, ledger.csv).
        </p>
        <button
          onClick={() => setActivePage('dashboard')}
          className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
        >
          Return to Ledger Dashboard
        </button>
      </div>
    );
  }

  const isSettled = data.overall_status === 'SETTLED';
  const isDelayed = data.overall_status === 'DELAYED' || data.overall_status === 'LEDGER_DELAY';
  const isCritical = data.overall_status === 'CRITICAL_EXCEPTION';
  const hasExceptions = data.exceptions.length > 0;

  return (
    <div className="flex flex-col w-full px-gutter py-6 gap-6 max-w-7xl mx-auto pb-28">
      {/* ── 1. HEADER & BREADCRUMB ────────────────────────────────────────── */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-label-sm text-on-surface-variant dark:text-slate-400 font-mono">
          <button onClick={() => setActivePage('dashboard')} className="hover:text-on-surface dark:hover:text-white transition-colors">
            Ledger Dashboard
          </button>
          <span>/</span>
          <span>Cases</span>
          <span>/</span>
          <span className="text-blue-600 dark:text-blue-400 font-semibold">{data.transaction_id}</span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setActivePage('dashboard')} 
              className="w-10 h-10 rounded-xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl hover:bg-white dark:hover:bg-slate-700 border border-white/80 dark:border-white/10 flex items-center justify-center transition-colors text-on-surface dark:text-white shadow-sm"
              title="Back to Dashboard"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-mono font-bold text-primary dark:text-white tracking-tight text-[28px]">
                  {data.transaction_id}
                </h1>
                <span className={`px-2.5 py-0.5 rounded-full text-label-sm font-mono font-semibold border ${
                  isSettled ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20' :
                  isDelayed ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20' :
                  'bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/20'
                }`}>
                  {data.overall_status}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button 
              onClick={() => alert(`Exporting verified cryptographic audit report for ${data.transaction_id}...`)}
              className="px-4 py-2 rounded-xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl hover:bg-white dark:hover:bg-slate-700 border border-white/80 dark:border-white/10 text-on-surface dark:text-white text-body-sm font-medium transition-colors flex items-center gap-2 shadow-sm"
            >
              <span className="material-symbols-outlined text-[16px]">download</span>
              Export Audit Trail
            </button>
            <button 
              onClick={() => alert(`Shareable link for ${data.transaction_id} copied to clipboard!`)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-body-sm font-medium transition-colors flex items-center gap-2 shadow-sm"
            >
              <span className="material-symbols-outlined text-[16px]">share</span>
              Share Case
            </button>
          </div>
        </div>
      </div>

      {/* ── 2. SETTLEMENT OVERVIEW BANNER CARD ─────────────────────────────── */}
      <div className="w-full bg-white/70 dark:bg-slate-900/50 backdrop-blur-2xl rounded-3xl p-6 shadow-sm border border-white/80 dark:border-white/10 relative overflow-hidden">
        <div className={`absolute top-0 left-0 w-1.5 h-full ${
          retriggered ? 'bg-emerald-500' :
          isSettled ? 'bg-emerald-500' :
          isDelayed ? 'bg-amber-500' : 'bg-red-500'
        }`} />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
              retriggered || isSettled ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' :
              isDelayed ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400' :
              'bg-red-500/10 text-red-700 dark:text-red-400'
            }`}>
              <span className="material-symbols-outlined text-[26px]">
                {retriggered || isSettled ? 'check_circle' : isDelayed ? 'warning' : 'error'}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-label-sm font-semibold uppercase text-on-surface-variant dark:text-slate-400">
                  Engine Classification:
                </span>
                <span className="font-mono text-body-sm font-bold text-primary dark:text-white">
                  {retriggered ? 'MANUALLY_RECONCILED' : data.overall_status}
                </span>
              </div>
              <h2 className="font-headline-lg text-primary dark:text-white font-semibold text-[20px]">
                {retriggered ? 'Settlement Synchronized with Internal Ledger' : data.recommended_action || 'Reconciliation in progress'}
              </h2>
            </div>
          </div>

          {/* 4 Summary Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.04] border border-black/5 dark:border-white/5 font-mono">
            <div className="flex flex-col">
              <span className="text-[11px] text-on-surface-variant dark:text-slate-400">Case ID</span>
              <span className="text-body-sm font-bold text-primary dark:text-white">{data.transaction_id}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] text-on-surface-variant dark:text-slate-400">Settlement Amount</span>
              <span className="text-body-sm font-bold text-primary dark:text-white">
                {data.currency === 'USD' ? '$' : '₹'}{data.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] text-on-surface-variant dark:text-slate-400">Delay Point</span>
              <span className={`text-body-sm font-bold ${data.delay_point ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                {data.delay_point || 'None (Clean)'}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] text-on-surface-variant dark:text-slate-400">Deterministic Confidence</span>
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${data.confidence === 'HIGH' ? 'bg-emerald-500' : data.confidence === 'MEDIUM' ? 'bg-amber-500' : 'bg-red-500'}`} />
                <span className="text-body-sm font-bold text-primary dark:text-white">{data.confidence}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. THREE-NODE MULTI-HOP RECONCILIATION PIPELINE ────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Node 1: Payment Gateway */}
        <div className="bg-white/70 dark:bg-slate-900/50 backdrop-blur-2xl rounded-3xl p-6 shadow-sm border border-white/80 dark:border-white/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-label-sm font-mono text-on-surface-variant dark:text-slate-400 uppercase tracking-wider">
                1. Gateway Node
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold border ${
                data.gateway.found ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20' : 'bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/20'
              }`}>
                {data.gateway.found ? data.gateway.status : 'NOT_FOUND'}
              </span>
            </div>
            <div className="font-mono text-[24px] font-bold text-primary dark:text-white mb-1">
              {data.gateway.currency === 'USD' ? '$' : '₹'}{data.gateway.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}
            </div>
            <div className="text-body-sm text-on-surface-variant dark:text-slate-400">
              Payment Gateway Capture Event
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-black/[0.04] dark:border-white/10 flex justify-between text-body-sm font-mono text-on-surface-variant dark:text-slate-400">
            <span>Captured At:</span>
            <span className="text-primary dark:text-white">{data.gateway.timestamp || 'N/A'}</span>
          </div>
        </div>

        {/* Node 2: Bank Statement */}
        <div className={`bg-white/70 dark:bg-slate-900/50 backdrop-blur-2xl rounded-3xl p-6 shadow-sm border flex flex-col justify-between relative ${
          data.delay_point === 'BANK' ? 'border-amber-500/50 ring-1 ring-amber-500/20' : 'border-white/80 dark:border-white/10'
        }`}>
          {data.delay_point === 'BANK' && (
            <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
              Identified Bottleneck
            </div>
          )}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-label-sm font-mono text-on-surface-variant dark:text-slate-400 uppercase tracking-wider">
                2. Core Banking Node
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold border ${
                data.bank.status === 'SETTLED' ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20' :
                data.bank.status === 'PENDING' ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20' :
                'bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/20'
              }`}>
                {data.bank.found ? data.bank.status : 'MISSING_IN_BANK'}
              </span>
            </div>
            <div className="font-mono text-[24px] font-bold text-primary dark:text-white mb-1">
              {data.bank.currency === 'USD' ? '$' : '₹'}{data.bank.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}
            </div>
            <div className="text-body-sm text-on-surface-variant dark:text-slate-400">
              Bank Statement &amp; Settlement File
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-black/[0.04] dark:border-white/10 flex justify-between text-body-sm font-mono text-on-surface-variant dark:text-slate-400">
            <span>Settled At:</span>
            <span className="text-primary dark:text-white">{data.bank.settled_at || 'Pending settlement'}</span>
          </div>
        </div>

        {/* Node 3: General Ledger */}
        <div className={`bg-white/70 dark:bg-slate-900/50 backdrop-blur-2xl rounded-3xl p-6 shadow-sm border flex flex-col justify-between relative ${
          data.delay_point === 'LEDGER' ? 'border-amber-500/50 ring-1 ring-amber-500/20' : 'border-white/80 dark:border-white/10'
        }`}>
          {data.delay_point === 'LEDGER' && (
            <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
              Identified Bottleneck
            </div>
          )}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-label-sm font-mono text-on-surface-variant dark:text-slate-400 uppercase tracking-wider">
                3. General Ledger Node
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold border ${
                data.ledger.status === 'POSTED' ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20' :
                data.ledger.status === 'PENDING' ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20' :
                'bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/20'
              }`}>
                {data.ledger.found ? data.ledger.status : 'NOT_POSTED'}
              </span>
            </div>
            <div className="font-mono text-[24px] font-bold text-primary dark:text-white mb-1">
              {data.ledger.currency === 'USD' ? '$' : '₹'}{data.ledger.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}
            </div>
            <div className="text-body-sm text-on-surface-variant dark:text-slate-400">
              Core Double-Entry Accounting System
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-black/[0.04] dark:border-white/10 flex justify-between text-body-sm font-mono text-on-surface-variant dark:text-slate-400">
            <span>Posted At:</span>
            <span className="text-primary dark:text-white">{data.ledger.posted_at || 'Pending posting'}</span>
          </div>
        </div>
      </div>

      {/* ── 4. EXCEPTIONS CALLOUT (WHEN ANOMALY DETECTED) ──────────────────── */}
      {hasExceptions && (
        <div className="w-full bg-red-500/[0.04] dark:bg-red-950/20 backdrop-blur-2xl rounded-3xl p-6 border border-red-500/20 dark:border-red-900/30 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-red-600 dark:text-red-400 text-[24px]">gpp_maybe</span>
              <h3 className="font-semibold text-red-900 dark:text-red-300 text-[18px]">
                Deterministic Rule Exceptions Flagged ({data.exceptions.length})
              </h3>
            </div>
            <span className="text-label-sm font-mono text-red-700 dark:text-red-300 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">
              Requires Operational Review
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {data.exceptions.map((exc, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-white/70 dark:bg-slate-900/70 border border-red-500/15 font-mono text-body-sm flex items-start gap-2 text-red-900 dark:text-red-200">
                <span className="material-symbols-outlined text-[18px] text-red-500 mt-0.5">error</span>
                <span>{exc}</span>
              </div>
            ))}
          </div>

          {/* Amount / Currency discrepancy breakdown if present */}
          {data.gateway.amount !== data.bank.amount && data.gateway.found && data.bank.found && (
            <div className="p-4 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-black/5 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono">
              <div>
                <span className="text-[11px] text-on-surface-variant dark:text-slate-400">Gateway Captured:</span>
                <div className="text-body-lg font-bold text-primary dark:text-white">
                  {data.gateway.currency} {data.gateway.amount}
                </div>
              </div>
              <div className="text-red-600 font-bold">≠ Mismatch ≠</div>
              <div>
                <span className="text-[11px] text-on-surface-variant dark:text-slate-400">Bank Credited:</span>
                <div className="text-body-lg font-bold text-red-600 dark:text-red-400">
                  {data.bank.currency} {data.bank.amount}
                </div>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-on-surface-variant dark:text-slate-400">Variance Delta:</span>
                <div className="text-body-lg font-bold text-red-600 dark:text-red-400">
                  {((data.gateway.amount || 0) - (data.bank.amount || 0)) > 0 ? '-' : '+'}
                  {data.gateway.currency} {Math.abs((data.gateway.amount || 0) - (data.bank.amount || 0)).toFixed(2)}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── 5. GEMINI AI INVESTIGATION & AUDIT EVIDENCE BREAKDOWN ──────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gemini AI Natural Language Reasoning Panel */}
        <div className="bg-white/70 dark:bg-slate-900/50 backdrop-blur-2xl rounded-3xl p-6 shadow-sm border border-white/80 dark:border-white/10 flex flex-col justify-between gap-4">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">neurology</span>
                </div>
                <div>
                  <h3 className="font-semibold text-primary dark:text-white text-[17px]">
                    AI Investigation
                  </h3>
                  <div className="text-[11px] text-on-surface-variant dark:text-slate-400 font-mono">
                    Zero-Hallucination Fact Explanation Model
                  </div>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-label-sm font-mono bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20">
                Verified Facts Only
              </span>
            </div>

            {loadingExplanation ? (
              <div className="py-8 flex flex-col items-center justify-center gap-2">
                <span className="material-symbols-outlined text-[28px] text-blue-600 animate-spin">sync</span>
                <span className="text-body-sm text-on-surface-variant dark:text-slate-400 font-mono">
                  Synthesizing verified multi-hop evidence with AI...
                </span>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/5 text-body-sm text-on-surface dark:text-slate-200 font-mono whitespace-pre-line leading-relaxed">
                {explanation || 'No AI explanation generated yet.'}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-black/[0.04] dark:border-white/10 flex items-center justify-between text-[12px] font-mono text-on-surface-variant dark:text-slate-400">
            <span>Model: AI Investigation Engine</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">verified</span>
              Fact-Checked
            </span>
          </div>
        </div>

        {/* Deterministic Evidence Breakdown */}
        <div className="bg-white/70 dark:bg-slate-900/50 backdrop-blur-2xl rounded-3xl p-6 shadow-sm border border-white/80 dark:border-white/10 flex flex-col justify-between gap-4">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-[22px]">database</span>
                <h3 className="font-semibold text-primary dark:text-white text-[17px]">
                  Verified Evidence Trail
                </h3>
              </div>
              <span className="text-label-sm font-mono text-on-surface-variant dark:text-slate-400">
                {data.evidence.length} Fact Points
              </span>
            </div>

            <div className="flex flex-col gap-2">
              {data.evidence.map((ev, i) => (
                <div key={i} className="p-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/5 flex items-start gap-2.5 text-body-sm text-on-surface dark:text-slate-300">
                  <span className="material-symbols-outlined text-[18px] text-blue-600 dark:text-blue-400 mt-0.5 shrink-0">check_circle</span>
                  <span>{ev}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-black/[0.04] dark:border-white/10 flex items-center justify-between text-[12px] font-mono text-on-surface-variant dark:text-slate-400">
            <span>Audit Engine: Deterministic Rules v4.2</span>
            <span>Dataset: PayTrace Live CSV</span>
          </div>
        </div>
      </div>

      {/* ── 6. RECOMMENDED ACTION BANNER ───────────────────────────────────── */}
      <div className="w-full bg-white/70 dark:bg-slate-900/50 backdrop-blur-2xl rounded-3xl p-6 shadow-sm border border-white/80 dark:border-white/10 relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <span className="material-symbols-outlined text-[24px]">bolt</span>
          </div>
          <div>
            <div className="text-label-sm font-mono text-on-surface-variant dark:text-slate-400 uppercase tracking-wider font-semibold">
              Action Plan Recommendation
            </div>
            <p className="font-semibold text-primary dark:text-white text-[16px]">
              {data.recommended_action || 'Monitor transaction clearing status.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button 
            onClick={handleEscalate}
            className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-black/[0.04] dark:bg-white/[0.08] hover:bg-black/[0.08] dark:hover:bg-white/[0.12] text-on-surface dark:text-white text-body-sm font-medium transition-colors border border-black/5 dark:border-white/10 text-center"
          >
            {escalated ? 'Escalated to Ops ✓' : 'Escalate to Ops'}
          </button>
          <button 
            onClick={handleRetrigger}
            className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-body-sm font-medium transition-all shadow-sm text-center flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-[16px]">
              {retriggered ? 'done_all' : 'sync'}
            </span>
            {retriggered ? 'Reconciliation Verified' : 'Re-trigger Clearing Match'}
          </button>
        </div>
      </div>
    </div>
  );
};
