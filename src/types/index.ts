export type NavPage = 'home' | 'dashboard' | 'investigation' | 'states-debug';

export type TransactionStatus = 'Settled' | 'Exception' | 'Delayed' | 'Reviewing';

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
