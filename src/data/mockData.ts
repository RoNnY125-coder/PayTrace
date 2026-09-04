import { Transaction, InvestigationData } from '../types';

export const telemetryMetrics = {
  volume24h: "$42.8B",
  volumeChange: "+12.4% vs yesterday",
  totalTransactions: "1,492,804",
  autoReconciliationRate: "99.87%",
  anomalyFlagged: "0.01% anomaly flagged",
  manualReviewQueue: "14 items",
  activeAiAgents: "32 / 32",
  agentsStatus: "All tracing nodes operational",
  avgTraceLatency: "310ms",
  networkLatency: "42MS",
  lastSync: "Today, 13:58:12 UTC",
};

export const recentTracesList: Transaction[] = [
  {
    id: "tx_984192841",
    gateway: "Stripe",
    partner: "Fedwire",
    amount: 1250000.00,
    currency: "$",
    status: "Resolved" as any,
    timestamp: "14:28:10 UTC",
    description: "SWIFT MT103 → Fedwire clearing match confirmed",
    timeAgo: "2 mins ago"
  },
  {
    id: "tx_884102934",
    gateway: "Adyen",
    partner: "SEPA Instant",
    amount: 480200.50,
    currency: "€",
    status: "Reviewing",
    timestamp: "14:14:00 UTC",
    description: "SEPA Instant cross-border currency divergence check",
    timeAgo: "14 mins ago"
  },
  {
    id: "tx_772109843",
    gateway: "ACH Batch",
    partner: "JPMorgan",
    amount: 89450.00,
    currency: "$",
    status: "Resolved" as any,
    timestamp: "14:00:00 UTC",
    description: "ACH Batch settlement auto-reconciled with JPMorgan ledger",
    timeAgo: "28 mins ago"
  }
];

export const liveLedgerTransactions: Transaction[] = [
  {
    id: "TRX-9482-BF71",
    gateway: "Stripe",
    partner: "Chase Bank NA",
    amount: 142500.00,
    currency: "$",
    status: "Settled",
    timestamp: "14:28:10 UTC",
    description: "Multi-rail institutional card settlement"
  },
  {
    id: "TRX-9481-AK39",
    gateway: "Adyen",
    partner: "Wells Fargo",
    amount: 89200.50,
    currency: "$",
    status: "Exception",
    timestamp: "14:25:42 UTC",
    description: "Intermediary routing fee mismatch"
  },
  {
    id: "TRX-9480-LM22",
    gateway: "Checkout.com",
    partner: "Citi",
    amount: 1250000.00,
    currency: "$",
    status: "Delayed",
    timestamp: "14:21:05 UTC",
    description: "Cross-border clearing hold"
  },
  {
    id: "TRX-9479-ZX99",
    gateway: "PayPal",
    partner: "Bank of America",
    amount: 45100.00,
    currency: "$",
    status: "Settled",
    timestamp: "14:18:50 UTC",
    description: "Instant batch reconcile verified"
  },
  {
    id: "TRX-9478-QW12",
    gateway: "Stripe",
    partner: "Chase Bank NA",
    amount: 320000.00,
    currency: "$",
    status: "Settled",
    timestamp: "14:15:12 UTC",
    description: "Direct RTP clearing success"
  },
  {
    id: "tx_984192841",
    gateway: "Stripe Enterprise",
    partner: "J.P. Morgan Clearing",
    amount: 1250000.00,
    currency: "$",
    status: "Exception",
    timestamp: "14:22:01 UTC",
    description: "SWIFT MT103 intermediary deduction discrepancy"
  },
  {
    id: "TRX-9476-VN55",
    gateway: "FIS Worldpay",
    partner: "Barclays PLC",
    amount: 678400.00,
    currency: "£",
    status: "Settled",
    timestamp: "14:09:44 UTC",
    description: "CHAPS interbank clearing validated"
  },
  {
    id: "TRX-9475-PL18",
    gateway: "Klarna Merchant",
    partner: "Deutsche Bank",
    amount: 98120.00,
    currency: "€",
    status: "Delayed",
    timestamp: "14:02:18 UTC",
    description: "Awaiting TARGET2 confirmation"
  }
];

export const defaultInvestigation: InvestigationData = {
  txId: "tx_984192841",
  status: "Delayed Exception",
  errorCode: "ERR_SWIFT_MT103_MISMATCH",
  issueTitle: "Clearing Hold at Correspondent Bank",
  amount: 1250000.00,
  currency: "USD",
  delayPoint: "SWIFT MT103",
  confidence: "HIGH",
  confidencePercent: 98.4,
  gateway: {
    node: "Gateway Node",
    status: "Verified",
    amount: 1250000.00,
    currency: "USD",
    network: "Stripe Enterprise Gateway",
    timestamp: "2023-10-24 14:22:01 UTC",
    eventId: "evt_3M109284",
    authCode: "AUTH_891274",
    fee: 3625.00,
    hostIp: "54.241.12.90"
  },
  bank: {
    node: "Bank Partner",
    status: "Flagged",
    amount: 1249500.00,
    currency: "USD",
    network: "J.P. Morgan Clearing (MT103)",
    timestamp: "2023-10-24 14:25:40 UTC",
    mtRef: "MT103/2023",
    senderBic: "CHASUS33XXX",
    receiverBic: "BOFAUS3NXXX",
    intermediaryFee: 500.00,
    uetr: "f81d4fae-7dec-11d0-a765-00a0c91e6bf6"
  },
  ledger: {
    node: "Internal Ledger",
    status: "Pending Match",
    amount: 1250000.00,
    currency: "USD",
    network: "Core Accounting System",
    timestamp: "Awaiting SWIFT Release",
    journalId: "JNL_984129",
    account: "1020-USD-SET",
    entryType: "CREDIT",
    matchStatus: "HOLD_VARIANCE",
    checksum: "0x8f9c2a1"
  },
  timeline: [
    {
      time: "14:22:01 UTC",
      category: "Gateway",
      title: "Payment captured by gateway",
      description: "Authorization token generated via Stripe API v2023-10. Funds reserved successfully on client card issuer.",
      statusType: "success"
    },
    {
      time: "14:23:15 UTC",
      category: "Ledger",
      title: "Internal ledger entry created",
      description: "Double-entry record posted to accounts receivable. Balance awaiting wire reconciliation.",
      statusType: "info"
    },
    {
      time: "14:25:40 UTC",
      category: "Bank Partner",
      title: "SWIFT MT103 message dispatched with fee variance",
      description: "Correspondent bank flagged a $500 intermediary deduction discrepancy against expected net settlement.",
      statusType: "warning"
    },
    {
      time: "14:30:00 UTC",
      category: "System",
      title: "Automatic clearing match paused",
      description: "Transaction routed to manual operations queue due to currency divergence threshold breach.",
      statusType: "neutral"
    }
  ],
  aiExplanation: {
    paragraphs: [
      "The transaction encountered a soft hold at the correspondent banking layer due to an unexplained $500.00 intermediary deduction on the SWIFT MT103 transmission. While the initial gateway capture and internal ledger recorded the full $1,250,000.00, the incoming wire reflects $1,249,500.00.",
      "Historical pattern analysis indicates that this specific correspondent routing path frequently applies unexpected intermediary correspondent fees for high-value cross-border transfers originating from non-standard regional accounts.",
      "The automated reconciliation engine correctly suspended the clearing match to prevent ledger imbalance. Re-triggering the match requires either absorbing the fee variance into operational overhead or issuing a secondary adjustment code."
    ],
    model: "PayTrace-LLM v4.2",
    confidence: "High Confidence"
  },
  varianceAlert: {
    expected: 1250000.00,
    actual: 1249500.00,
    delta: -500.00,
    deltaPercent: 0.04,
    description: "The detected variance exceeds the automated tolerance threshold of $0.00 for institutional ledger matching. Manual operator intervention is strictly required to resolve the discrepancy before downstream settlement can finalize.",
    ruleId: "VAL_CURRENCY_MISMATCH_09"
  },
  recommendedAction: {
    title: "Escalate to payment operations or re-trigger clearing match.",
    description: "Recommended Action based on PayTrace AI anomaly engine.",
    actions: ["Escalate to Ops", "Re-trigger Clearing Match"]
  }
};
