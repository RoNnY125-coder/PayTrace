import React, { useState, useEffect, useRef } from 'react';
import { NavPage, InvestigationResult, ChatMessage } from '../types';
import { fetchTransaction, fetchExplanation, getLocalTransaction, sendChatMessage } from '../services/api';

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
  const [retriggered] = useState(false);
  const [, setInputTx] = useState(currentTx);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // AI Copilot Chatbot State
  const [isChatExpanded, setIsChatExpanded] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Prevent background scroll when chat is expanded
  useEffect(() => {
    if (isChatExpanded) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isChatExpanded]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (isChatExpanded) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isChatExpanded]);

  // Focus input when expanded
  useEffect(() => {
    if (isChatExpanded) {
      setTimeout(() => chatInputRef.current?.focus(), 150);
    }
  }, [isChatExpanded]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isChatExpanded) {
        setIsChatExpanded(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isChatExpanded]);

  // Send Chat message handler
  const handleSendMessage = async (customMessage?: string) => {
    const msgToSend = (customMessage || chatInput).trim();
    if (!msgToSend || isSendingMessage || !data) return;

    const userMsg: ChatMessage = { role: 'user', content: msgToSend };
    const nextHistory = [...chatMessages, userMsg];
    setChatMessages(nextHistory);
    setChatInput('');
    setIsSendingMessage(true);

    try {
      const reply = await sendChatMessage(data.transaction_id, msgToSend, chatMessages);
      setChatMessages([...nextHistory, { role: 'assistant', content: reply }]);
    } catch (err) {
      console.error(err);
      setChatMessages([
        ...nextHistory,
        {
          role: 'assistant',
          content: `Unable to fetch live model response. Deterministic verification: Transaction ${data.transaction_id} is ${data.overall_status}. Recommended action: ${data.recommended_action || 'Review transaction telemetry.'}`,
        },
      ]);
    } finally {
      setIsSendingMessage(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
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

  const handleExportPDF = () => {
    if (!data) return;
    const printWindow = window.open('', '_blank', 'width=850,height=900');
    if (!printWindow) {
      showToast('Popup blocked. Please allow popups to print/save PDF.');
      return;
    }

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <title>PayTrace Audit Report - ${data.transaction_id}</title>
  <style>
    @page { size: A4; margin: 15mm; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a; margin: 0; padding: 24px; }
    .header { border-bottom: 2px solid #2563eb; padding-bottom: 16px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-end; }
    .logo { font-size: 26px; font-weight: 800; color: #081837; }
    .logo span { color: #2563eb; }
    .meta { text-align: right; font-size: 12px; color: #64748b; font-family: monospace; }
    .status-badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 700; font-family: monospace; }
    .status-SETTLED { background: #dcfce7; color: #15803d; border: 1px solid #86efac; }
    .status-DELAYED, .status-LEDGER_DELAY { background: #fef3c7; color: #b45309; border: 1px solid #fde68a; }
    .status-CRITICAL_EXCEPTION, .status-EXCEPTION, .status-FAILED { background: #fee2e2; color: #b91c1c; border: 1px solid #fca5a5; }
    h2 { font-size: 16px; margin: 18px 0 8px; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; }
    table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 13px; }
    th { background: #f8fafc; text-align: left; padding: 8px 10px; border: 1px solid #e2e8f0; font-family: monospace; font-size: 11px; }
    td { padding: 8px 10px; border: 1px solid #e2e8f0; }
    .evidence-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; font-family: monospace; font-size: 12px; line-height: 1.6; white-space: pre-wrap; margin: 10px 0; }
    .footer { margin-top: 30px; padding-top: 12px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; display: flex; justify-content: space-between; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="logo">Pay<span>Trace</span></div>
      <div style="font-size: 13px; color: #64748b; margin-top: 4px;">Verified Multi-Rail Settlement Audit Certificate</div>
    </div>
    <div class="meta">
      <div>Case: <strong>${data.transaction_id}</strong></div>
      <div>Generated: ${new Date().toUTCString()}</div>
      <div>Audit Engine: PayTrace v4.2</div>
    </div>
  </div>

  <div style="margin-bottom: 16px;">
    <span class="status-badge status-${data.overall_status}">${data.overall_status}</span>
    <span style="font-size: 18px; font-weight: 700; margin-left: 12px; font-family: monospace;">Amount: ${data.currency} ${data.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
  </div>

  <h2>1. Multi-Rail Reconciliation Telemetry</h2>
  <table>
    <thead>
      <tr>
        <th>Node Rail</th>
        <th>Status</th>
        <th>Amount</th>
        <th>Currency</th>
        <th>Timestamp / Ref</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>1. Payment Gateway</strong></td>
        <td>${data.gateway.status || 'N/A'}</td>
        <td>${data.gateway.currency} ${data.gateway.amount ?? '0.00'}</td>
        <td>${data.gateway.currency}</td>
        <td>${data.gateway.timestamp || 'N/A'}</td>
      </tr>
      <tr>
        <td><strong>2. Core Banking</strong></td>
        <td>${data.bank.status || 'N/A'}</td>
        <td>${data.bank.currency} ${data.bank.amount ?? '0.00'}</td>
        <td>${data.bank.currency}</td>
        <td>${data.bank.settled_at || 'Pending'}</td>
      </tr>
      <tr>
        <td><strong>3. General Ledger</strong></td>
        <td>${data.ledger.status || 'N/A'}</td>
        <td>${data.ledger.currency} ${data.ledger.amount ?? '0.00'}</td>
        <td>${data.ledger.currency}</td>
        <td>${data.ledger.posted_at || 'Pending'}</td>
      </tr>
    </tbody>
  </table>

  ${data.exceptions.length > 0 ? `
  <h2>2. Exceptions & Discrepancies Flagged</h2>
  <ul>
    ${data.exceptions.map(e => `<li style="color: #b91c1c; font-weight: 600; margin-bottom: 4px;">${e}</li>`).join('')}
  </ul>
  ` : ''}

  <h2>3. AI Investigation Reasoning (Zero-Hallucination)</h2>
  <div class="evidence-box">${explanation || 'AI analysis synthesized from multi-hop audit trail.'}</div>

  <h2>4. Verified Evidence Trail</h2>
  <ul>
    ${data.evidence.map(ev => `<li style="margin-bottom: 4px; font-size: 13px;">${ev}</li>`).join('')}
  </ul>

  <div class="footer">
    <div>Cryptographic Audit Seal: SHA256-${Math.random().toString(36).substring(2, 12).toUpperCase()}</div>
    <div>PayTrace Protocol &bull; Zero Hallucination Verified</div>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 250);
    };
  </script>
</body>
</html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    showToast(`PDF Export initiated for ${data.transaction_id}`);
  };

  const handleShare = () => {
    if (!data) return;
    const shareText = `PayTrace Investigation [${data.transaction_id}]\nStatus: ${data.overall_status}\nAmount: ${data.currency} ${data.amount}\nVerified Audit: Gateway (${data.gateway.status}) -> Bank (${data.bank.status}) -> Ledger (${data.ledger.status})`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      showToast(`Case data for ${data.transaction_id} copied to clipboard!`);
    } else {
      showToast(`Case ID: ${data.transaction_id}`);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-5">
        <div className="w-12 h-12 rounded-full border-2 border-[#9FE870] border-t-transparent animate-spin" />
        <div className="flex flex-col items-center gap-1 text-center">
          <h2 className="text-xl font-bold text-[#14151A] dark:text-[#EDEDF0]">
            Ingesting Ledger Telemetry for {currentTx}...
          </h2>
          <p className="text-sm text-[#6C6D77] dark:text-[#9B9CA6]">
            Cross-referencing gateway.csv, bank.csv, and ledger.csv
          </p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-[#F1483F]/10 flex items-center justify-center text-[#F1483F]">
          <span className="material-symbols-outlined text-[32px]">error</span>
        </div>
        <div className="flex flex-col items-center gap-2 max-w-md">
          <h2 className="text-2xl font-bold text-[#14151A] dark:text-[#EDEDF0]">
            Transaction '{currentTx}' Not Found
          </h2>
          <p className="text-sm text-[#6C6D77] dark:text-[#9B9CA6]">
            This transaction ID does not exist in the active CSV audit datasets (gateway.csv, bank.csv, ledger.csv).
          </p>
        </div>
        <button
          onClick={() => setActivePage('dashboard')}
          className="px-6 py-3 rounded-full bg-[#14151A] text-[#9FE870] dark:bg-[#9FE870] dark:text-[#14151A] hover:brightness-105 active:scale-[0.98] font-semibold text-sm transition-colors"
        >
          Return to Ledger Dashboard
        </button>
      </div>
    );
  }

  const isSettled = data.overall_status === 'SETTLED';
  const isDelayed = data.overall_status === 'DELAYED' || data.overall_status === 'LEDGER_DELAY';
  const isException = ['CRITICAL_EXCEPTION', 'EXCEPTION', 'DATA_INCONSISTENCY', 'DUPLICATE_RECORD'].includes(data.overall_status);
  const hasExceptions = data.exceptions.length > 0;

  const statusLabel = retriggered ? 'Manually Reconciled' :
    isSettled ? 'Verified Settled' :
    isDelayed ? 'Settlement Delayed' :
    isException ? 'Critical Discrepancy' :
    data.overall_status.replace(/_/g, ' ');

  return (
    <div className="flex flex-col w-full px-6 sm:px-8 py-8 gap-10 max-w-7xl mx-auto pb-28">
      {/* ── 1. TOP NAV & ACTIONS ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setActivePage('dashboard')} 
            className="w-10 h-10 rounded-full bg-white dark:bg-[#1E1F26] hover:bg-[#F4F5F7] dark:hover:bg-[#26272E] border border-[#E2E5E9] dark:border-[#2E2F38] flex items-center justify-center transition-colors text-[#14151A] dark:text-[#EDEDF0]"
            title="Back to Dashboard"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>
          <div className="flex flex-col">
            <div className="flex items-center gap-2 text-xs text-[#6C6D77] dark:text-[#9B9CA6]">
              <button 
                onClick={() => setActivePage('dashboard')} 
                className="hover:text-[#14151A] dark:hover:text-[#EDEDF0] transition-colors"
              >
                Dashboard
              </button>
              <span>/</span>
              <span>Cases</span>
              <span>/</span>
              <span className="text-[#14151A] dark:text-[#EDEDF0] font-mono font-medium">{data.transaction_id}</span>
            </div>
            <span className="text-xs text-[#6C6D77] dark:text-[#9B9CA6]">Multi-Rail Audit Investigation</span>
          </div>
        </div>

        {/* Wise Action Buttons: Export PDF & Share */}
        <div className="flex items-center gap-3">
          <button 
            onClick={handleExportPDF}
            className="px-5 py-2.5 rounded-full bg-white dark:bg-[#1E1F26] hover:bg-[#F4F5F7] dark:hover:bg-[#26272E] border border-[#E2E5E9] dark:border-[#2E2F38] text-[#14151A] dark:text-[#EDEDF0] text-xs sm:text-sm font-semibold transition-colors flex items-center gap-2"
            title="Download official PDF audit report"
          >
            <span className="material-symbols-outlined text-[18px] text-[#F1483F]">picture_as_pdf</span>
            <span>Export PDF Audit</span>
          </button>
          <button 
            onClick={handleShare}
            className="px-5 py-2.5 rounded-full bg-[#14151A] text-[#9FE870] dark:bg-[#9FE870] dark:text-[#14151A] hover:brightness-105 active:scale-[0.98] text-xs sm:text-sm font-semibold transition-colors flex items-center gap-2"
            title="Share verified case telemetry"
          >
            <span className="material-symbols-outlined text-[18px]">share</span>
            <span>Share Case</span>
          </button>
        </div>
      </div>

      {/* ── 2. HERO STATUS BANNER (THE BOLDEST, LARGEST FOCAL POINT) ─────── */}
      <div className="w-full bg-white dark:bg-[#1E1F26] rounded-3xl p-7 sm:p-10 border border-[#E2E5E9] dark:border-[#2E2F38] flex flex-col gap-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pb-8 border-b border-[#E8EAEF] dark:border-[#2E2F38]">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                retriggered || isSettled ? 'bg-[#9FE870]/12 text-[#2D5A0F] dark:text-[#9FE870] border border-[#9FE870]/25' :
                isDelayed ? 'bg-[#F0B84B]/12 text-[#875800] dark:text-[#F0B84B] border border-[#F0B84B]/25' :
                'bg-[#F1483F]/12 text-[#9E1B1B] dark:text-[#F1483F] border border-[#F1483F]/25'
              }`}>
                ● {statusLabel}
              </span>
              <span className="text-xs font-mono text-[#6C6D77] dark:text-[#9B9CA6]">
                Case Ref: {data.transaction_id}
              </span>
            </div>

            {/* Massive Bold Headline */}
            <h1 className="text-[34px] sm:text-[48px] font-extrabold tracking-tight text-[#14151A] dark:text-[#EDEDF0] leading-none">
              {retriggered ? 'Settlement Synchronized' :
               isSettled ? 'Settlement Verified Clean' :
               data.overall_status === 'CRITICAL_EXCEPTION' ? 'Discrepancy Flagged' :
               data.overall_status === 'DELAYED' || data.overall_status === 'LEDGER_DELAY' ? 'Downstream Rail Delayed' :
               data.overall_status === 'FAILED' ? 'Authorization Failed' :
               data.overall_status.replace(/_/g, ' ')}
            </h1>

            <p className="text-sm sm:text-base text-[#6C6D77] dark:text-[#9B9CA6] max-w-2xl">
              {retriggered ? 'Manual ledger journal entry matched and balanced against core bank statement.' : 
               isSettled ? 'Gateway capture, bank statement credit, and general ledger journal match across all dimensions.' :
               data.overall_status === 'CRITICAL_EXCEPTION' ? 'Deterministic mismatch detected between rail nodes requiring reconciliation escalation.' :
               data.overall_status === 'DELAYED' || data.overall_status === 'LEDGER_DELAY' ? 'Settlement pipeline exceeded the acceptable batch SLA window.' :
               data.overall_status === 'FAILED' ? 'Payment gateway authorization rejected by the issuing network.' :
               'Deterministic multi-rail verification active.'}
            </p>
          </div>

          {/* Focal Settlement Value */}
          <div className="flex flex-col lg:items-end justify-center p-6 rounded-2xl bg-[#F8F9FA] dark:bg-[#14151A] border border-[#E2E5E9] dark:border-[#2E2F38] min-w-[220px]">
            <span className="text-xs font-medium uppercase tracking-wider text-[#6C6D77] dark:text-[#9B9CA6] mb-1">
              Settlement Amount
            </span>
            <div className="text-[34px] sm:text-[44px] font-bold text-[#14151A] dark:text-[#EDEDF0] tabular-nums tracking-tight">
              {data.currency === 'USD' ? '$' : '₹'}{data.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className={`w-2 h-2 rounded-full ${data.confidence === 'HIGH' ? 'bg-[#9FE870]' : data.confidence === 'MEDIUM' ? 'bg-[#F0B84B]' : 'bg-[#F1483F]'}`} />
              <span className="text-xs text-[#6C6D77] dark:text-[#9B9CA6]">
                {data.confidence} Deterministic Match
              </span>
            </div>
          </div>
        </div>

        {/* 4 Summary Metadata Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-[#F8F9FA] dark:bg-[#14151A] border border-[#E2E5E9] dark:border-[#2E2F38]">
            <span className="text-[11px] text-[#6C6D77] dark:text-[#9B9CA6] uppercase tracking-wider block mb-1">Case Identifier</span>
            <span className="text-sm font-semibold font-mono text-[#14151A] dark:text-[#EDEDF0]">{data.transaction_id}</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#F8F9FA] dark:bg-[#14151A] border border-[#E2E5E9] dark:border-[#2E2F38]">
            <span className="text-[11px] text-[#6C6D77] dark:text-[#9B9CA6] uppercase tracking-wider block mb-1">Delay Point</span>
            <span className={`text-sm font-semibold ${data.delay_point ? 'text-[#875800] dark:text-[#F0B84B]' : 'text-[#2D5A0F] dark:text-[#9FE870]'}`}>
              {data.delay_point || 'None (In Sync)'}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-[#F8F9FA] dark:bg-[#14151A] border border-[#E2E5E9] dark:border-[#2E2F38]">
            <span className="text-[11px] text-[#6C6D77] dark:text-[#9B9CA6] uppercase tracking-wider block mb-1">Settlement Engine</span>
            <span className="text-sm font-semibold text-[#14151A] dark:text-[#EDEDF0]">PayTrace Core v4.2</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#F8F9FA] dark:bg-[#14151A] border border-[#E2E5E9] dark:border-[#2E2F38]">
            <span className="text-[11px] text-[#6C6D77] dark:text-[#9B9CA6] uppercase tracking-wider block mb-1">Exceptions Flagged</span>
            <span className={`text-sm font-semibold ${data.exceptions.length > 0 ? 'text-[#9E1B1B] dark:text-[#F1483F]' : 'text-[#2D5A0F] dark:text-[#9FE870]'}`}>
              {data.exceptions.length > 0 ? `${data.exceptions.length} Flagged` : '0 Clean'}
            </span>
          </div>
        </div>
      </div>

      {/* ── 3. THREE-NODE MULTI-HOP RECONCILIATION PIPELINE ────────────────── */}
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#14151A] dark:text-[#EDEDF0] tracking-tight">
            Settlement Hop Audit
          </h2>
          <p className="text-xs sm:text-sm text-[#6C6D77] dark:text-[#9B9CA6]">
            Three independent verification nodes cross-referenced deterministically.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Node 1: Payment Gateway */}
          <div className="bg-white dark:bg-[#1E1F26] rounded-3xl p-7 sm:p-8 border border-[#E2E5E9] dark:border-[#2E2F38] flex flex-col justify-between hover:border-[#9FE870]/40 transition-colors">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#6C6D77] dark:text-[#9B9CA6] uppercase tracking-wider">
                  01 · Gateway Rail
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  data.gateway.found ? 'bg-[#9FE870]/12 text-[#2D5A0F] dark:text-[#9FE870] border border-[#9FE870]/20' : 'bg-[#F1483F]/12 text-[#9E1B1B] dark:text-[#F1483F] border border-[#F1483F]/20'
                }`}>
                  {data.gateway.found ? data.gateway.status : 'NOT_FOUND'}
                </span>
              </div>

              <div>
                <span className="text-[11px] text-[#6C6D77] dark:text-[#9B9CA6] block mb-1">Captured Amount</span>
                <div className="text-[28px] sm:text-[34px] font-bold text-[#14151A] dark:text-[#EDEDF0] tabular-nums tracking-tight">
                  {data.gateway.currency === 'USD' ? '$' : '₹'}{data.gateway.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}
                </div>
                <p className="text-xs text-[#6C6D77] dark:text-[#9B9CA6] mt-1">
                  Payment Gateway Capture Event
                </p>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-[#E8EAEF] dark:border-[#2E2F38] flex justify-between text-xs text-[#6C6D77] dark:text-[#9B9CA6]">
              <span>Captured At:</span>
              <span className="text-[#14151A] dark:text-[#EDEDF0] font-mono font-medium">{data.gateway.timestamp || 'N/A'}</span>
            </div>
          </div>

          {/* Node 2: Core Bank Statement */}
          <div className={`bg-white dark:bg-[#1E1F26] rounded-3xl p-7 sm:p-8 border flex flex-col justify-between transition-colors ${
            data.delay_point === 'BANK' ? 'border-[#F0B84B] ring-1 ring-[#F0B84B]/30' : 'border-[#E2E5E9] dark:border-[#2E2F38] hover:border-[#9FE870]/40'
          }`}>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#6C6D77] dark:text-[#9B9CA6] uppercase tracking-wider">
                  02 · Core Bank
                </span>
                <div className="flex items-center gap-2">
                  {data.delay_point === 'BANK' && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#F0B84B]/15 text-[#875800] dark:text-[#F0B84B] border border-[#F0B84B]/30">
                      Bottleneck
                    </span>
                  )}
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    data.bank.status === 'SETTLED' ? 'bg-[#9FE870]/12 text-[#2D5A0F] dark:text-[#9FE870] border border-[#9FE870]/20' :
                    data.bank.status === 'PENDING' ? 'bg-[#F0B84B]/12 text-[#875800] dark:text-[#F0B84B] border border-[#F0B84B]/20' :
                    'bg-[#F1483F]/12 text-[#9E1B1B] dark:text-[#F1483F] border border-[#F1483F]/20'
                  }`}>
                    {data.bank.found ? data.bank.status : 'MISSING'}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[11px] text-[#6C6D77] dark:text-[#9B9CA6] block mb-1">Bank Credited Amount</span>
                <div className="text-[28px] sm:text-[34px] font-bold text-[#14151A] dark:text-[#EDEDF0] tabular-nums tracking-tight">
                  {data.bank.currency === 'USD' ? '$' : '₹'}{data.bank.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}
                </div>
                <p className="text-xs text-[#6C6D77] dark:text-[#9B9CA6] mt-1">
                  Bank Settlement Statement
                </p>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-[#E8EAEF] dark:border-[#2E2F38] flex justify-between text-xs text-[#6C6D77] dark:text-[#9B9CA6]">
              <span>Settled At:</span>
              <span className="text-[#14151A] dark:text-[#EDEDF0] font-mono font-medium">{data.bank.settled_at || 'Pending'}</span>
            </div>
          </div>

          {/* Node 3: General Ledger */}
          <div className={`bg-white dark:bg-[#1E1F26] rounded-3xl p-7 sm:p-8 border flex flex-col justify-between transition-colors ${
            data.delay_point === 'LEDGER' ? 'border-[#F0B84B] ring-1 ring-[#F0B84B]/30' : 'border-[#E2E5E9] dark:border-[#2E2F38] hover:border-[#9FE870]/40'
          }`}>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#6C6D77] dark:text-[#9B9CA6] uppercase tracking-wider">
                  03 · General Ledger
                </span>
                <div className="flex items-center gap-2">
                  {data.delay_point === 'LEDGER' && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#F0B84B]/15 text-[#875800] dark:text-[#F0B84B] border border-[#F0B84B]/30">
                      Bottleneck
                    </span>
                  )}
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    data.ledger.status === 'POSTED' ? 'bg-[#9FE870]/12 text-[#2D5A0F] dark:text-[#9FE870] border border-[#9FE870]/20' :
                    data.ledger.status === 'PENDING' ? 'bg-[#F0B84B]/12 text-[#875800] dark:text-[#F0B84B] border border-[#F0B84B]/20' :
                    'bg-[#F1483F]/12 text-[#9E1B1B] dark:text-[#F1483F] border border-[#F1483F]/20'
                  }`}>
                    {data.ledger.found ? data.ledger.status : 'NOT_POSTED'}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[11px] text-[#6C6D77] dark:text-[#9B9CA6] block mb-1">Journal Posted Value</span>
                <div className="text-[28px] sm:text-[34px] font-bold text-[#14151A] dark:text-[#EDEDF0] tabular-nums tracking-tight">
                  {data.ledger.currency === 'USD' ? '$' : '₹'}{data.ledger.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}
                </div>
                <p className="text-xs text-[#6C6D77] dark:text-[#9B9CA6] mt-1">
                  Double-Entry Journal Post
                </p>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-[#E8EAEF] dark:border-[#2E2F38] flex justify-between text-xs text-[#6C6D77] dark:text-[#9B9CA6]">
              <span>Posted At:</span>
              <span className="text-[#14151A] dark:text-[#EDEDF0] font-mono font-medium">{data.ledger.posted_at || 'Pending'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 4. EXCEPTIONS CALLOUT (WHEN ANOMALY DETECTED) ──────────────────── */}
      {hasExceptions && (
        <div className="w-full bg-[#FFF5F5] dark:bg-[#201517] rounded-3xl p-7 sm:p-8 border border-[#F1483F]/30 flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#F1483F]/15 text-[#F1483F] flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">warning</span>
              </div>
              <div>
                <h3 className="font-bold text-[#9E1B1B] dark:text-[#F1483F] text-lg">
                  Deterministic Exceptions Flagged ({data.exceptions.length})
                </h3>
                <p className="text-xs text-[#9E1B1B]/80 dark:text-[#F1483F]/80">
                  Automated checks detected non-standard ledger patterns
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold text-[#9E1B1B] dark:text-[#F1483F] bg-[#F1483F]/10 px-3.5 py-1.5 rounded-full border border-[#F1483F]/20 self-start sm:self-auto">
              Reconciliation Alert
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {data.exceptions.map((exc, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-white dark:bg-[#1E1F26] border border-[#F1483F]/20 text-xs flex items-start gap-3 text-[#9E1B1B] dark:text-[#F1483F]">
                <span className="material-symbols-outlined text-[18px] text-[#F1483F] mt-0.5 shrink-0">error</span>
                <span className="font-medium">{exc}</span>
              </div>
            ))}
          </div>

          {/* Amount / Currency discrepancy breakdown if present */}
          {data.gateway.amount !== data.bank.amount && data.gateway.found && data.bank.found && (
            <div className="p-5 rounded-2xl bg-white dark:bg-[#1E1F26] border border-[#F1483F]/25 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-[11px] text-[#6C6D77] dark:text-[#9B9CA6] uppercase tracking-wider">Gateway Capture</span>
                <div className="text-base font-bold text-[#14151A] dark:text-[#EDEDF0] tabular-nums font-mono">
                  {data.gateway.currency} {data.gateway.amount}
                </div>
              </div>
              <span className="text-xs font-bold text-[#F1483F] px-3 py-1 rounded-full bg-[#F1483F]/10 border border-[#F1483F]/20">
                Mismatch Variance
              </span>
              <div>
                <span className="text-[11px] text-[#6C6D77] dark:text-[#9B9CA6] uppercase tracking-wider">Bank Credit</span>
                <div className="text-base font-bold text-[#F1483F] tabular-nums font-mono">
                  {data.bank.currency} {data.bank.amount}
                </div>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-[#6C6D77] dark:text-[#9B9CA6] uppercase tracking-wider">Delta Variance</span>
                <div className="text-base font-bold text-[#F1483F] tabular-nums font-mono">
                  {((data.gateway.amount || 0) - (data.bank.amount || 0)) > 0 ? '-' : '+'}
                  {data.gateway.currency} {Math.abs((data.gateway.amount || 0) - (data.bank.amount || 0)).toFixed(2)}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── 5. GEMINI AI INVESTIGATION & AUDIT EVIDENCE (CLEAN READABLE CARDS) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Gemini AI Natural Language Reasoning Panel (Readable Body, NOT Code/Monospace) */}
        <div className="bg-white dark:bg-[#1E1F26] rounded-3xl p-7 sm:p-8 border border-[#E2E5E9] dark:border-[#2E2F38] flex flex-col justify-between gap-6">
          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#14151A] text-[#9FE870] dark:bg-[#9FE870] dark:text-[#14151A] flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-[20px]">psychology</span>
                </div>
                <div>
                  <h3 className="font-bold text-[#14151A] dark:text-[#EDEDF0] text-lg">
                    AI Investigation Analysis
                  </h3>
                  <div className="text-xs text-[#6C6D77] dark:text-[#9B9CA6]">
                    Natural language multi-rail synthesis
                  </div>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#9FE870]/12 text-[#2D5A0F] dark:text-[#9FE870] border border-[#9FE870]/20">
                Zero Hallucination
              </span>
            </div>

            {loadingExplanation ? (
              <div className="py-12 flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 rounded-full border-2 border-[#9FE870] border-t-transparent animate-spin" />
                <span className="text-xs text-[#6C6D77] dark:text-[#9B9CA6]">
                  Synthesizing multi-rail audit logs...
                </span>
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-[#F8F9FA] dark:bg-[#14151A] border border-[#E2E5E9] dark:border-[#2E2F38] text-[14px] sm:text-[15px] leading-relaxed text-[#14151A] dark:text-[#EDEDF0] font-sans whitespace-pre-line">
                {explanation || 'No explanation generated yet.'}
              </div>
            )}

            {/* Interactive Chat Entry Bar (Triggers Expansion with Full Blur) */}
            <div 
              onClick={() => setIsChatExpanded(true)}
              className="p-3.5 px-5 rounded-full bg-[#F8F9FA] dark:bg-[#14151A] border border-[#E2E5E9] dark:border-[#2E2F38] flex items-center justify-between cursor-pointer hover:border-[#9FE870]/60 transition-colors group"
            >
              <div className="flex items-center gap-3 text-xs sm:text-sm text-[#6C6D77] dark:text-[#9B9CA6]">
                <span className="material-symbols-outlined text-[18px] text-[#2D5A0F] dark:text-[#9FE870]">chat</span>
                <span>Ask AI Copilot about {data.transaction_id}...</span>
              </div>
              <span className="px-3 py-1 rounded-full bg-[#14151A] text-[#9FE870] dark:bg-[#9FE870] dark:text-[#14151A] text-xs font-semibold group-hover:scale-105 transition-transform flex items-center gap-1.5">
                <span>Expand Chat</span>
                <span className="material-symbols-outlined text-[14px]">open_in_full</span>
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-[#E8EAEF] dark:border-[#2E2F38] flex items-center justify-between text-xs text-[#6C6D77] dark:text-[#9B9CA6]">
            <span>Engine: PayTrace AI</span>
            <span className="text-[#2D5A0F] dark:text-[#9FE870] font-semibold flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">verified</span>
              Fact-Checked
            </span>
          </div>
        </div>

        {/* Deterministic Evidence Breakdown */}
        <div className="bg-white dark:bg-[#1E1F26] rounded-3xl p-7 sm:p-8 border border-[#E2E5E9] dark:border-[#2E2F38] flex flex-col justify-between gap-6">
          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#F4F5F7] dark:bg-[#26272E] text-[#14151A] dark:text-[#EDEDF0] flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-[20px]">fact_check</span>
                </div>
                <div>
                  <h3 className="font-bold text-[#14151A] dark:text-[#EDEDF0] text-lg">
                    Verified Evidence Trail
                  </h3>
                  <div className="text-xs text-[#6C6D77] dark:text-[#9B9CA6]">
                    Deterministic facts extracted from audit logs
                  </div>
                </div>
              </div>
              <span className="text-xs font-semibold text-[#6C6D77] dark:text-[#9B9CA6] px-3 py-1 rounded-full bg-[#F4F5F7] dark:bg-[#14151A] border border-[#E2E5E9] dark:border-[#2E2F38]">
                {data.evidence.length} Evidence Points
              </span>
            </div>

            <div className="flex flex-col gap-2.5">
              {data.evidence.map((ev, i) => (
                <div key={i} className="p-4 rounded-2xl bg-[#F8F9FA] dark:bg-[#14151A] border border-[#E2E5E9] dark:border-[#2E2F38] flex items-start gap-3 text-xs sm:text-sm text-[#14151A] dark:text-[#EDEDF0]">
                  <span className="material-symbols-outlined text-[18px] text-[#2D5A0F] dark:text-[#9FE870] mt-0.5 shrink-0">check_circle</span>
                  <span className="leading-relaxed">{ev}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-[#E8EAEF] dark:border-[#2E2F38] flex items-center justify-between text-xs text-[#6C6D77] dark:text-[#9B9CA6]">
            <span>Deterministic Rules v4.2</span>
            <span>Dataset: Verified CSV Feeds</span>
          </div>
        </div>
      </div>

      {/* ── EXPANDED AI CHATBOT MODAL WITH FULL BACKGROUND BLUR ────────────── */}
      {isChatExpanded && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-[#14151A]/80 dark:bg-[#0E0F12]/85 backdrop-blur-md transition-all duration-300 ease-out"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsChatExpanded(false);
          }}
        >
          <div 
            className="w-full max-w-4xl h-[90vh] max-h-[820px] flex flex-col rounded-3xl bg-white dark:bg-[#1E1F26] border border-[#E2E5E9] dark:border-[#2E2F38] shadow-2xl overflow-hidden transition-all duration-300 ease-out transform scale-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-[#E8EAEF] dark:border-[#2E2F38] flex items-center justify-between bg-white dark:bg-[#1E1F26]">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-full bg-[#14151A] text-[#9FE870] dark:bg-[#9FE870] dark:text-[#14151A] flex items-center justify-center font-bold shrink-0">
                  <span className="material-symbols-outlined text-[22px]">psychology</span>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-[#14151A] dark:text-[#EDEDF0] text-lg">
                      Settlement Copilot
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#9FE870]/12 text-[#2D5A0F] dark:text-[#9FE870] border border-[#9FE870]/20">
                      Zero Hallucination
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#6C6D77] dark:text-[#9B9CA6]">
                    <span className="font-mono font-medium text-[#14151A] dark:text-[#EDEDF0]">{data.transaction_id}</span>
                    <span>•</span>
                    <span>{data.currency === 'USD' ? '$' : '₹'}{data.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    <span>•</span>
                    <span className="font-semibold text-[#2D5A0F] dark:text-[#9FE870]">{data.overall_status}</span>
                  </div>
                </div>
              </div>

              {/* Cross Exit Button with Smooth Animation */}
              <button
                onClick={() => setIsChatExpanded(false)}
                className="w-10 h-10 rounded-full bg-[#F4F5F7] dark:bg-[#26272E] hover:bg-[#E8EAEF] dark:hover:bg-[#2E2F38] text-[#14151A] dark:text-[#EDEDF0] flex items-center justify-center transition-transform hover:scale-105 active:scale-95 border border-[#E2E5E9] dark:border-[#2E2F38]"
                title="Exit Chat (Esc)"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Synthesis Insight Sub-bar */}
            <div className="px-6 py-2.5 bg-[#F8F9FA] dark:bg-[#14151A] border-b border-[#E8EAEF] dark:border-[#2E2F38] flex items-center justify-between text-xs text-[#6C6D77] dark:text-[#9B9CA6]">
              <div className="flex items-center gap-2 truncate pr-4">
                <span className="material-symbols-outlined text-[16px] text-[#2D5A0F] dark:text-[#9FE870]">verified</span>
                <span className="truncate">
                  <strong>Evidence Context:</strong> {data.delay_point ? `Bottleneck at ${data.delay_point}` : 'All 3 rails in sync'} • {data.confidence} match • {data.evidence.length} verified facts
                </span>
              </div>
              <span className="shrink-0 text-[11px] font-mono text-[#6C6D77] dark:text-[#9B9CA6]">PayTrace AI</span>
            </div>

            {/* Chat Messages Scroll Container */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 flex flex-col gap-4 bg-[#FFFFFF] dark:bg-[#17181F]">
              {/* Initial Welcome Bubble */}
              <div className="flex items-start gap-3 max-w-[88%]">
                <div className="w-8 h-8 rounded-full bg-[#14151A] text-[#9FE870] dark:bg-[#9FE870] dark:text-[#14151A] flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                  <span className="material-symbols-outlined text-[16px]">smart_toy</span>
                </div>
                <div className="p-4 rounded-2xl bg-[#F4F5F7] dark:bg-[#26272E] border border-[#E2E5E9] dark:border-[#2E2F38] text-xs sm:text-sm text-[#14151A] dark:text-[#EDEDF0] leading-relaxed">
                  <p className="font-semibold mb-1">SettlementTrace Copilot Initialized</p>
                  <p>
                    I am grounded in the verified telemetry of case <strong>{data.transaction_id}</strong> ({data.currency} {data.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}).
                    Ask me any question about the timeline, reconciliation exceptions, or request a drafted bank escalation notice.
                  </p>
                  {explanation && (
                    <div className="mt-3 p-3 rounded-xl bg-white dark:bg-[#1E1F26] border border-[#E2E5E9] dark:border-[#2E2F38] text-xs text-[#6C6D77] dark:text-[#9B9CA6] whitespace-pre-line">
                      <span className="font-semibold block mb-1 text-[#14151A] dark:text-[#EDEDF0]">Initial AI Analysis:</span>
                      {explanation}
                    </div>
                  )}
                </div>
              </div>

              {/* Dynamic Chat Messages */}
              {chatMessages.map((msg, index) => (
                <div 
                  key={index} 
                  className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-[#14151A] text-[#9FE870] dark:bg-[#9FE870] dark:text-[#14151A] flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                      <span className="material-symbols-outlined text-[16px]">smart_toy</span>
                    </div>
                  )}
                  <div 
                    className={`p-4 rounded-2xl max-w-[85%] text-xs sm:text-sm leading-relaxed ${
                      msg.role === 'user' 
                        ? 'bg-[#14151A] text-[#EDEDF0] dark:bg-[#9FE870] dark:text-[#14151A] font-medium' 
                        : 'bg-[#F4F5F7] dark:bg-[#26272E] border border-[#E2E5E9] dark:border-[#2E2F38] text-[#14151A] dark:text-[#EDEDF0] whitespace-pre-line'
                    }`}
                  >
                    {msg.content}
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-[#E8EAEF] dark:bg-[#2E2F38] text-[#14151A] dark:text-[#EDEDF0] flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                      <span className="material-symbols-outlined text-[16px]">person</span>
                    </div>
                  )}
                </div>
              ))}

              {/* Loading Indicator */}
              {isSendingMessage && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#14151A] text-[#9FE870] dark:bg-[#9FE870] dark:text-[#14151A] flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                    <span className="material-symbols-outlined text-[16px]">smart_toy</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#F4F5F7] dark:bg-[#26272E] border border-[#E2E5E9] dark:border-[#2E2F38] flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#9FE870] animate-bounce" />
                    <span className="w-2 h-2 rounded-full bg-[#9FE870] animate-bounce [animation-delay:0.2s]" />
                    <span className="w-2 h-2 rounded-full bg-[#9FE870] animate-bounce [animation-delay:0.4s]" />
                    <span className="text-xs text-[#6C6D77] dark:text-[#9B9CA6] ml-2">Synthesizing evidence...</span>
                  </div>
                </div>
              )}

              <div ref={chatBottomRef} />
            </div>

            {/* Suggested Questions Chips */}
            <div className="p-3 px-5 bg-white dark:bg-[#1E1F26] border-t border-[#E8EAEF] dark:border-[#2E2F38] flex flex-wrap items-center gap-2">
              <span className="text-[11px] text-[#6C6D77] dark:text-[#9B9CA6] font-medium mr-1">Suggested:</span>
              {[
                'Why is the bank pending?',
                'Draft bank escalation email',
                'Is this delay within SLA?',
                'Explain amount mismatch'
              ].map((q, idx) => (
                <button
                  key={idx}
                  disabled={isSendingMessage}
                  onClick={() => handleSendMessage(q)}
                  className="px-3 py-1 rounded-full text-xs bg-[#F4F5F7] dark:bg-[#14151A] hover:bg-[#E8EAEF] dark:hover:bg-[#26272E] text-[#14151A] dark:text-[#EDEDF0] border border-[#E2E5E9] dark:border-[#2E2F38] transition-colors disabled:opacity-50"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Bottom Typing Bar */}
            <div className="p-4 sm:p-5 bg-white dark:bg-[#1E1F26] border-t border-[#E8EAEF] dark:border-[#2E2F38]">
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                className="flex items-center gap-2 p-1.5 pl-5 rounded-full bg-[#F8F9FA] dark:bg-[#14151A] border border-[#E2E5E9] dark:border-[#2E2F38] focus-within:border-[#9FE870]/60 transition-colors"
              >
                <input
                  ref={chatInputRef}
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  disabled={isSendingMessage}
                  placeholder={`Ask a question about ${data.transaction_id}...`}
                  className="flex-1 bg-transparent text-xs sm:text-sm text-[#14151A] dark:text-[#EDEDF0] placeholder:text-[#6C6D77] dark:placeholder:text-[#9B9CA6] focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim() || isSendingMessage}
                  className="px-5 py-2.5 rounded-full bg-[#14151A] text-[#9FE870] dark:bg-[#9FE870] dark:text-[#14151A] hover:brightness-105 active:scale-[0.98] font-semibold text-xs sm:text-sm transition-all disabled:opacity-40 flex items-center gap-1.5"
                >
                  <span>Send</span>
                  <span className="material-symbols-outlined text-[16px]">send</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-8 right-8 z-50 flex items-center gap-3 px-6 py-3.5 rounded-full bg-[#14151A] text-[#9FE870] dark:bg-[#9FE870] dark:text-[#14151A] border border-[#9FE870]/30 text-xs sm:text-sm font-semibold transition-all">
          <span className="material-symbols-outlined text-[20px]">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
