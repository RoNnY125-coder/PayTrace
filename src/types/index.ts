export type NavPage = 'home' | 'dashboard' | 'investigation' | 'states-debug';

export interface GatewayRecord {
  found: boolean;
  status: string | null;
  amount: number | null;
  currency: string | null;
  timestamp: string | null;
}

export interface BankRecord {
  found: boolean;
  status: string | null;
  amount: number | null;
  currency: string | null;
  received_at: string | null;
  settled_at: string | null;
}

export interface LedgerRecord {
  found: boolean;
  status: string | null;
  amount: number | null;
  currency: string | null;
  posted_at: string | null;
}

export interface InvestigationResult {
  transaction_id: string;
  overall_status: string;
  amount: number | null;
  currency: string | null;
  confidence: string; // HIGH | MEDIUM | LOW

  gateway: GatewayRecord;
  bank: BankRecord;
  ledger: LedgerRecord;

  delay_point: string | null; // BANK | LEDGER | GATEWAY | null
  exceptions: string[];
  evidence: string[];
  recommended_action: string | null;
  explanation?: string;
}

export interface DateSummary {
  date: string;
  total: number;
  settled: number;
  delayed: number;
  failed: number;
  rejected: number;
  exceptions: number;
  transactions: string[];
}

export interface ExplainResponse {
  transaction_id: string;
  overall_status: string;
  explanation: string;
}

export interface DatasetSummary {
  total_transactions: number;
  total_volume: number;
  status_counts: Record<string, number>;
  dates: string[];
}

export type TransactionStatus = 'Settled' | 'Exception' | 'Delayed' | 'Reviewing' | 'Resolved';

export interface Transaction {
  id: string;
  gateway: string;
  partner: string;
  amount: number;
  currency: string;
  status: TransactionStatus;
  timestamp: string;
  description?: string;
  timeAgo?: string;
}

export interface InvestigationData {
  txId: string;
  status: string;
  errorCode: string;
  issueTitle: string;
  amount: number;
  currency: string;
  delayPoint: string;
  confidence: string;
  confidencePercent: number;
  gateway: {
    node: string;
    status: string;
    amount: number;
    currency: string;
    network: string;
    timestamp: string;
    eventId: string;
    authCode: string;
    fee: number;
    hostIp: string;
  };
  bank: {
    node: string;
    status: string;
    amount: number;
    currency: string;
    network: string;
    timestamp: string;
    mtRef: string;
    senderBic: string;
    receiverBic: string;
    intermediaryFee: number;
    uetr: string;
  };
  ledger: {
    node: string;
    status: string;
    amount: number;
    currency: string;
    network: string;
    timestamp: string;
    journalId: string;
    account: string;
    entryType: string;
    matchStatus: string;
    checksum: string;
  };
  timeline: Array<{
    time: string;
    category: 'Gateway' | 'Ledger' | 'Bank Partner' | 'System';
    title: string;
    description: string;
    statusType: 'success' | 'warning' | 'info' | 'neutral';
  }>;
  aiExplanation: {
    paragraphs: string[];
    model: string;
    confidence: string;
  };
  varianceAlert: {
    expected: number;
    actual: number;
    delta: number;
    deltaPercent: number;
    description: string;
    ruleId: string;
  };
  recommendedAction: {
    title: string;
    description: string;
    actions: string[];
  };
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  transaction_id: string;
  message: string;
  history?: ChatMessage[];
}

export interface ChatResponse {
  transaction_id: string;
  reply: string;
}
