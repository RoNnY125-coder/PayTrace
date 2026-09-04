import React, { useState } from 'react';

export const StatesDebug: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'loading' | 'error-notfound' | 'error-backend' | 'partial'>('all');
  const [searchVal, setSearchVal] = useState('');

  return (
    <div className="flex flex-col w-full max-w-7xl mx-auto px-gutter py-6 pb-28">
      {/* Top Section / Header description */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-stack-md mb-stack-xl">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-300 text-label-sm uppercase tracking-wider font-semibold border border-blue-500/20">System Diagnostic</span>
            <span className="text-body-sm text-on-surface-variant dark:text-slate-400 font-tabular-nums">ID: TRACE-STATE-DEBUG-904</span>
          </div>
          <h1 className="text-headline-xl text-primary dark:text-white font-semibold text-[28px] tracking-tight">Operational States & Error Handling</h1>
          <p className="text-body-lg text-on-surface-variant dark:text-slate-300 mt-1 max-w-2xl">
            Comprehensive diagnostic suite showcasing graceful degradation, fallback telemetry, error recovery flows, and live asynchronous loading states within the PayTrace glassmorphism architecture.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 bg-black/[0.03] dark:bg-white/[0.06] p-1.5 rounded-2xl border border-black/5 dark:border-white/5">
          <button 
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-xl text-body-sm font-medium transition-all ${activeTab === 'all' ? 'bg-white dark:bg-white/15 text-primary dark:text-white shadow-sm' : 'text-on-surface-variant dark:text-slate-400 hover:text-on-surface dark:hover:text-white'}`}
          >
            Grid View
          </button>
          <button 
            onClick={() => setActiveTab('loading')}
            className={`px-3.5 py-1.5 rounded-xl text-body-sm font-medium transition-all ${activeTab === 'loading' ? 'bg-white dark:bg-white/15 text-primary dark:text-white shadow-sm' : 'text-on-surface-variant dark:text-slate-400 hover:text-on-surface dark:hover:text-white'}`}
          >
            1. Loading
          </button>
          <button 
            onClick={() => setActiveTab('error-notfound')}
            className={`px-3.5 py-1.5 rounded-xl text-body-sm font-medium transition-all ${activeTab === 'error-notfound' ? 'bg-white dark:bg-white/15 text-primary dark:text-white shadow-sm' : 'text-on-surface-variant dark:text-slate-400 hover:text-on-surface dark:hover:text-white'}`}
          >
            2. Not Found
          </button>
          <button 
            onClick={() => setActiveTab('error-backend')}
            className={`px-3.5 py-1.5 rounded-xl text-body-sm font-medium transition-all ${activeTab === 'error-backend' ? 'bg-white dark:bg-white/15 text-primary dark:text-white shadow-sm' : 'text-on-surface-variant dark:text-slate-400 hover:text-on-surface dark:hover:text-white'}`}
          >
            3. Backend Down
          </button>
          <button 
            onClick={() => setActiveTab('partial')}
            className={`px-3.5 py-1.5 rounded-xl text-body-sm font-medium transition-all ${activeTab === 'partial' ? 'bg-white dark:bg-white/15 text-primary dark:text-white shadow-sm' : 'text-on-surface-variant dark:text-slate-400 hover:text-on-surface dark:hover:text-white'}`}
          >
            4. Partial AI
          </button>
        </div>
      </div>

      {/* Main Container Grid */}
      <div className="grid grid-cols-1 gap-stack-xl">
        {/* STATE 1: LOADING STATE */}
        {(activeTab === 'all' || activeTab === 'loading') && (
          <div className="flex flex-col bg-white/60 dark:bg-slate-900/50 backdrop-blur-2xl p-6 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.4)] border border-white/80 dark:border-white/10 relative overflow-hidden">
            <div className="flex items-center justify-between pb-stack-md mb-stack-md border-b border-black/[0.05] dark:border-white/10">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping" />
                <h2 className="text-headline-md text-primary dark:text-white font-semibold">1. Loading State (Async Telemetry Ingestion)</h2>
              </div>
              <span className="px-3 py-0.5 rounded-full bg-blue-500/10 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 text-label-sm font-tabular-nums border border-blue-500/20">STATUS: FETCHING_STREAM</span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-stack-lg">
              <div className="lg:col-span-2 flex flex-col gap-stack-md">
                <div className="p-6 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/5 flex flex-col gap-stack-md animate-pulse">
                  <div className="flex justify-between items-center">
                    <div className="w-32 h-5 bg-black/[0.06] dark:bg-white/[0.08] rounded" />
                    <div className="w-20 h-6 bg-black/[0.06] dark:bg-white/[0.08] rounded-full" />
                  </div>
                  <div className="grid grid-cols-3 gap-4 my-2">
                    <div className="h-16 bg-black/[0.06] dark:bg-white/[0.08] rounded-xl" />
                    <div className="h-16 bg-black/[0.06] dark:bg-white/[0.08] rounded-xl" />
                    <div className="h-16 bg-black/[0.06] dark:bg-white/[0.08] rounded-xl" />
                  </div>
                  <div className="w-full h-20 bg-black/[0.06] dark:bg-white/[0.08] rounded-xl" />
                </div>
                <div className="p-6 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/5 flex flex-col gap-stack-md animate-pulse">
                  <div className="w-40 h-5 bg-black/[0.06] dark:bg-white/[0.08] rounded" />
                  <div className="flex items-center justify-between gap-4 py-3">
                    <div className="w-10 h-10 rounded-full bg-black/[0.06] dark:bg-white/[0.08]" />
                    <div className="flex-1 h-1 bg-black/[0.06] dark:bg-white/[0.08]" />
                    <div className="w-10 h-10 rounded-full bg-black/[0.06] dark:bg-white/[0.08]" />
                    <div className="flex-1 h-1 bg-black/[0.06] dark:bg-white/[0.08]" />
                    <div className="w-10 h-10 rounded-full bg-black/[0.06] dark:bg-white/[0.08]" />
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-stack-md">
                <div className="p-6 rounded-xl bg-blue-500/[0.04] dark:bg-blue-950/30 border border-blue-500/15 dark:border-blue-900/40 flex flex-col items-center justify-center text-center h-full min-h-[280px] relative overflow-hidden">
                  <span className="material-symbols-outlined text-[36px] text-blue-600 dark:text-blue-400 animate-spin mb-3">sync</span>
                  <p className="text-headline-md text-primary dark:text-white font-semibold">Analyzing verified evidence...</p>
                  <p className="text-body-sm text-on-surface-variant dark:text-slate-400 mt-1 max-w-[240px]">
                    Cross-referencing SWIFT messaging logs with real-time ledger settlement states.
                  </p>
                  <div className="w-36 h-1.5 bg-black/[0.06] dark:bg-white/[0.1] rounded-full mt-4 overflow-hidden">
                    <div className="bg-blue-600 dark:bg-blue-500 h-full w-2/3 rounded-full animate-[pulse_1.5s_infinite]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STATE 2: ERROR STATE — INVALID TRANSACTION */}
        {(activeTab === 'all' || activeTab === 'error-notfound') && (
          <div className="flex flex-col bg-white/60 dark:bg-slate-900/50 backdrop-blur-2xl p-6 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.4)] border border-white/80 dark:border-white/10 relative overflow-hidden">
            <div className="flex items-center justify-between pb-stack-md mb-stack-md border-b border-black/[0.05] dark:border-white/10">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <h2 className="text-headline-md text-primary dark:text-white font-semibold">2. Error State — Invalid Transaction (404 Not Found)</h2>
              </div>
              <span className="px-3 py-0.5 rounded-full bg-red-500/10 dark:bg-red-950/80 text-red-700 dark:text-red-300 text-label-sm font-tabular-nums border border-red-500/20">CODE: ERR_TX_NOT_FOUND</span>
            </div>
            <div className="py-10 px-6 flex flex-col items-center justify-center text-center max-w-lg mx-auto w-full">
              <div className="w-14 h-14 rounded-2xl bg-black/[0.03] dark:bg-white/[0.06] flex items-center justify-center text-outline dark:text-slate-300 mb-4 border border-black/5 dark:border-white/5">
                <span className="material-symbols-outlined text-[30px]">search_off</span>
              </div>
              <h3 className="text-headline-lg text-on-surface dark:text-white font-semibold mb-1 text-[20px]">Transaction not found</h3>
              <p className="text-body-md text-on-surface-variant dark:text-slate-400 mb-6">
                The requested settlement hash <code className="px-2 py-0.5 rounded-md bg-black/[0.04] dark:bg-white/[0.08] font-tabular-nums text-blue-600 dark:text-blue-400 text-body-sm border border-black/5 dark:border-white/5">0x8f9c...42a1</code> does not exist in the active ledger ring or has expired from cache.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 w-full max-w-md">
                <div className="flex-1 relative flex items-center">
                  <span className="absolute left-3 material-symbols-outlined text-outline dark:text-slate-400 text-[18px]">key</span>
                  <input 
                    className="w-full bg-black/[0.03] dark:bg-white/[0.05] text-on-surface dark:text-white text-body-sm pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/40 dark:focus:ring-blue-500 border border-black/5 dark:border-white/10" 
                    placeholder="Enter valid settlement hash..." 
                    type="text"
                    value={searchVal}
                    onChange={(e) => setSearchVal(e.target.value)}
                  />
                </div>
                <button 
                  onClick={() => alert('Searching alternate ledger ring...')}
                  className="px-5 py-2.5 rounded-xl bg-primary dark:bg-blue-600 text-on-primary text-body-sm font-medium hover:bg-primary/90 dark:hover:bg-blue-500 transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">refresh</span>
                  Search Again
                </button>
              </div>
              <div className="mt-6 flex items-center gap-3 text-body-sm text-on-surface-variant dark:text-slate-400">
                <a className="hover:text-primary dark:hover:text-white underline cursor-pointer" onClick={() => alert('Opening audit logs...')}>View recent audit logs</a>
                <span>•</span>
                <a className="hover:text-primary dark:hover:text-white underline cursor-pointer" onClick={() => alert('Connecting to clearing house...')}>Contact clearing house support</a>
              </div>
            </div>
          </div>
        )}

        {/* STATE 3: ERROR STATE — BACKEND UNAVAILABLE */}
        {(activeTab === 'all' || activeTab === 'error-backend') && (
          <div className="flex flex-col bg-white/60 dark:bg-slate-900/50 backdrop-blur-2xl p-6 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.4)] border border-white/80 dark:border-white/10 relative overflow-hidden">
            <div className="flex items-center justify-between pb-stack-md mb-stack-md border-b border-black/[0.05] dark:border-white/10">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <h2 className="text-headline-md text-primary dark:text-white font-semibold">3. Error State — Backend Unavailable (Calm & Reassuring Tone)</h2>
              </div>
              <span className="px-3 py-0.5 rounded-full bg-black/[0.04] dark:bg-white/[0.08] text-on-surface dark:text-slate-300 text-label-sm font-tabular-nums border border-black/5 dark:border-white/5">STATUS: OFFLINE_CACHED_MODE</span>
            </div>
            <div className="p-6 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/5 flex flex-col md:flex-row items-center gap-stack-lg">
              <div className="w-16 h-16 rounded-2xl bg-blue-500/10 dark:bg-blue-950/80 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                <span className="material-symbols-outlined text-[32px]">cloud_off</span>
              </div>
              <div className="flex-1 text-center md:text-left">
                <div className="inline-block px-2.5 py-0.5 rounded-full bg-blue-500/10 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-label-sm mb-1 font-semibold border border-blue-500/20">Scheduled Maintenance / Temporary Outage</div>
                <h3 className="text-headline-lg text-primary dark:text-white font-semibold text-[18px]">Primary ledger telemetry temporarily unreachable</h3>
                <p className="text-body-md text-on-surface-variant dark:text-slate-400 mt-1 leading-relaxed">
                  We are unable to reach the core settlement gateway at this moment. Don't worry—your local session cache is secure, and transactions processed prior to 14:00 UTC have been safely snapshotted. Automatic reconnection attempts are underway.
                </p>
              </div>
              <div className="flex flex-col gap-2 shrink-0 w-full md:w-auto">
                <button 
                  onClick={() => alert('Retrying connection to core gateway...')}
                  className="px-5 py-2.5 rounded-xl bg-primary dark:bg-blue-600 text-on-primary text-body-sm font-medium hover:bg-primary/90 dark:hover:bg-blue-500 transition-all flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">sync</span>
                  Retry Connection Now
                </button>
                <button 
                  onClick={() => alert('Local snapshot loaded (1,428 records).')}
                  className="px-5 py-2.5 rounded-xl bg-white/70 dark:bg-slate-800/70 hover:bg-white/90 dark:hover:bg-slate-700/90 text-on-surface dark:text-white text-body-sm font-medium transition-all flex items-center justify-center gap-1.5 border border-black/5 dark:border-white/10"
                >
                  <span className="material-symbols-outlined text-[18px]">history</span>
                  Load Local Snapshot
                </button>
              </div>
            </div>
            <div className="mt-stack-md grid grid-cols-1 md:grid-cols-3 gap-stack-md">
              <div className="p-4 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/5 flex items-center gap-3">
                <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-[22px]">database</span>
                <div>
                  <p className="text-body-sm text-on-surface-variant dark:text-slate-400">Local SQLite Cache</p>
                  <p className="text-body-md font-semibold text-primary dark:text-white">1,428 Records Available</p>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/5 flex items-center gap-3">
                <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-[22px]">lock_clock</span>
                <div>
                  <p className="text-body-sm text-on-surface-variant dark:text-slate-400">Last Successful Sync</p>
                  <p className="text-body-md font-semibold text-primary dark:text-white font-tabular-nums">Today, 13:58:12 UTC</p>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/5 flex items-center gap-3">
                <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 text-[22px]">signal_wifi_off</span>
                <div>
                  <p className="text-body-sm text-on-surface-variant dark:text-slate-400">Next Ping Attempt</p>
                  <p className="text-body-md font-semibold text-primary dark:text-white font-tabular-nums">In 14 seconds...</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STATE 4: PARTIAL FAILURE STATE — AI UNAVAILABLE, DATA AVAILABLE */}
        {(activeTab === 'all' || activeTab === 'partial') && (
          <div className="flex flex-col bg-white/60 dark:bg-slate-900/50 backdrop-blur-2xl p-6 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.4)] border border-white/80 dark:border-white/10 relative overflow-hidden">
            <div className="flex items-center justify-between pb-stack-md mb-stack-md border-b border-black/[0.05] dark:border-white/10">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <h2 className="text-headline-md text-primary dark:text-white font-semibold">4. Partial Failure State — AI Unavailable, Ledger Data Fully Functional</h2>
              </div>
              <span className="px-3 py-0.5 rounded-full bg-black/[0.04] dark:bg-white/[0.08] text-on-surface dark:text-slate-300 text-label-sm font-tabular-nums border border-black/5 dark:border-white/5">STATUS: AI_SERVICE_DEGRADED_DATA_OK</span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-stack-lg">
              <div className="lg:col-span-2 flex flex-col gap-stack-md">
                <div className="p-5 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-stack-md">
                  <div>
                    <div className="flex items-center gap-1.5 text-label-sm text-on-surface-variant dark:text-slate-400">
                      <span>SETTLEMENT HASH</span>
                      <span>•</span>
                      <span className="font-tabular-nums">TX-9082-ALPHA</span>
                    </div>
                    <h3 className="text-headline-lg text-primary dark:text-white font-semibold mt-0.5 text-[20px]">$1,450,000.00 USD Settled</h3>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-emerald-500/10 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-label-sm font-semibold flex items-center gap-1 border border-emerald-500/20">
                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                    Confirmed & Cleared
                  </div>
                </div>
                <div className="p-5 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/5 flex flex-col gap-3">
                  <h4 className="text-headline-md text-primary dark:text-white font-semibold text-[15px]">Transaction Hop Telemetry</h4>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-3 rounded-xl bg-white/60 dark:bg-slate-800/40 border border-black/5 dark:border-white/5">
                      <p className="text-body-sm text-on-surface-variant dark:text-slate-400">Origin Gateway</p>
                      <p className="text-body-md font-semibold text-primary dark:text-white mt-0.5">Stripe Connect EU</p>
                      <span className="text-label-sm text-emerald-600 dark:text-emerald-400 font-tabular-nums">200 OK</span>
                    </div>
                    <div className="p-3 rounded-xl bg-white/60 dark:bg-slate-800/40 border border-black/5 dark:border-white/5">
                      <p className="text-body-sm text-on-surface-variant dark:text-slate-400">Clearing House</p>
                      <p className="text-body-md font-semibold text-primary dark:text-white mt-0.5">SWIFT GPI Network</p>
                      <span className="text-label-sm text-emerald-600 dark:text-emerald-400 font-tabular-nums">VERIFIED</span>
                    </div>
                    <div className="p-3 rounded-xl bg-white/60 dark:bg-slate-800/40 border border-black/5 dark:border-white/5">
                      <p className="text-body-sm text-on-surface-variant dark:text-slate-400">Beneficiary Bank</p>
                      <p className="text-body-md font-semibold text-primary dark:text-white mt-0.5">JPMorgan Chase</p>
                      <span className="text-label-sm text-emerald-600 dark:text-emerald-400 font-tabular-nums">CREDITED</span>
                    </div>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/5 flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <h4 className="text-headline-md text-primary dark:text-white font-semibold text-[14px]">Verified Cryptographic Evidence</h4>
                    <span className="text-label-sm text-on-surface-variant dark:text-slate-400 font-tabular-nums">SHA-256 Validated</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white/60 dark:bg-slate-800/40 border border-black/5 dark:border-white/5 font-tabular-nums text-body-sm text-on-surface dark:text-white flex justify-between items-center">
                    <span>proof_merkle_root_091823.sig</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">VALID SIGNATURE</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col">
                <div className="p-6 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/5 flex flex-col items-center justify-center text-center h-full min-h-[300px]">
                  <div className="w-12 h-12 rounded-2xl bg-black/[0.04] dark:bg-white/[0.08] flex items-center justify-center text-outline dark:text-slate-300 mb-3 border border-black/5 dark:border-white/5">
                    <span className="material-symbols-outlined text-[24px]">smart_toy</span>
                  </div>
                  <h4 className="text-headline-md text-on-surface dark:text-white font-semibold mb-1 text-[16px]">AI Investigation Offline</h4>
                  <p className="text-body-sm text-on-surface-variant dark:text-slate-400 mb-4 max-w-xs leading-relaxed">
                    AI explanation unavailable — verified evidence is still available below.
                  </p>
                  <div className="p-3 rounded-xl bg-white/60 dark:bg-slate-800/40 text-body-sm text-on-surface-variant dark:text-slate-300 w-full text-left flex items-start gap-2 border border-black/5 dark:border-white/5">
                    <span className="material-symbols-outlined text-[16px] text-blue-600 dark:text-blue-400 mt-0.5">info</span>
                    <span>Manual inspection tools remain fully operational. LLM inference cluster is performing routine weight updates.</span>
                  </div>
                  <button 
                    onClick={() => alert('PayTrace AI Cluster Status: Routine maintenance completing in 4 minutes.')}
                    className="mt-4 px-4 py-2 rounded-xl bg-black/[0.04] dark:bg-white/[0.08] hover:bg-black/[0.08] dark:hover:bg-white/[0.12] text-on-surface dark:text-white text-body-sm font-medium transition-colors w-full border border-black/5 dark:border-white/5"
                  >
                    Check AI Cluster Status
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
