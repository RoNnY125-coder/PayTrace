import { InvestigationResult, DateSummary, ExplainResponse, ChatMessage, ChatResponse } from '../types';
import localDataset from '../data/transactionsData.json';

const API_BASE = '/api';

export interface DatasetMeta {
  total_transactions: number;
  total_volume: number;
  status_counts: Record<string, number>;
  dates: string[];
}

export const getDatasetMeta = (): DatasetMeta => {
  return localDataset.summary as DatasetMeta;
};

export const getAllLocalTransactions = (): InvestigationResult[] => {
  return Object.values(localDataset.transactions) as InvestigationResult[];
};

export const getLocalTransaction = (id: string): InvestigationResult | null => {
  const normId = id.trim().toUpperCase();
  const tx = (localDataset.transactions as Record<string, InvestigationResult>)[normId];
  return tx || null;
};

export const getLocalExplanation = (id: string): string | null => {
  const normId = id.trim().toUpperCase();
  const exp = (localDataset.explanations as Record<string, string>)[normId];
  return exp || null;
};

/**
 * Fetch transaction investigation details.
 * Tries the FastAPI backend first; falls back seamlessly to the CSV dataset.
 */
export async function fetchTransaction(id: string): Promise<InvestigationResult> {
  const normId = id.trim().toUpperCase();
  try {
    const res = await fetch(`${API_BASE}/transactions/${normId}`);
    if (res.ok) {
      const data: InvestigationResult = await res.json();
      return data;
    }
  } catch (err) {
    console.warn(`[PayTrace API] Backend fetch failed for ${normId}, using local CSV dataset fallback.`, err);
  }

  const localTx = getLocalTransaction(normId);
  if (localTx) {
    return localTx;
  }

  throw new Error(`Transaction '${normId}' not found in gateway, bank, or ledger datasets.`);
}

/**
 * Fetch AI explanation powered by Gemini 2.5 Flash.
 * Tries the FastAPI backend `/api/explain` first; falls back to precomputed or deterministic explanation.
 */
export async function fetchExplanation(id: string): Promise<string> {
  const normId = id.trim().toUpperCase();
  try {
    const res = await fetch(`${API_BASE}/explain`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transaction_id: normId }),
    });
    if (res.ok) {
      const data: ExplainResponse = await res.json();
      if (data.explanation) {
        return data.explanation;
      }
    }
  } catch (err) {
    console.warn(`[PayTrace API] Explain API call failed for ${normId}, using verified evidence explanation.`, err);
  }

  const localExp = getLocalExplanation(normId);
  if (localExp) {
    return localExp;
  }

  // Fallback generation based on deterministic evidence
  const tx = getLocalTransaction(normId);
  if (tx) {
    return `Settlement Status: ${tx.overall_status}\n` +
      `Explanation: ${tx.recommended_action || 'Transaction is under automated reconciliation.'}\n` +
      `Where the issue occurred: ${tx.delay_point || 'N/A - no delay'}\n` +
      `Confirmed Facts:\n${tx.evidence.map(e => `  - ${e}`).join('\n')}\n` +
      `Exceptions: ${tx.exceptions.length > 0 ? tx.exceptions.join(', ') : 'None'}\n` +
      `Recommended Action: ${tx.recommended_action || 'Review transaction telemetry.'}\n` +
      `Confidence: ${tx.confidence}`;
  }

  return 'No verified evidence available for this transaction hash.';
}

/**
 * Fetch daily summary for a date.
 */
export async function fetchDateSummary(date: string): Promise<DateSummary> {
  try {
    const res = await fetch(`${API_BASE}/transactions?date=${date}`);
    if (res.ok) {
      const data: DateSummary = await res.json();
      return data;
    }
  } catch (err) {
    console.warn(`[PayTrace API] Date summary fetch failed for ${date}, computing from local CSV dataset.`);
  }

  // Fallback compute from local dataset
  const allTx = getAllLocalTransactions();
  const dayTx = allTx.filter(tx => {
    const ts = tx.gateway.timestamp || '';
    return ts.startsWith(date);
  });

  const counts = {
    settled: 0,
    delayed: 0,
    failed: 0,
    rejected: 0,
    exceptions: 0,
  };

  dayTx.forEach(t => {
    if (t.overall_status === 'SETTLED') counts.settled++;
    else if (t.overall_status === 'DELAYED' || t.overall_status === 'LEDGER_DELAY') counts.delayed++;
    else if (t.overall_status === 'FAILED') counts.failed++;
    else if (t.overall_status === 'REJECTED') counts.rejected++;
    else counts.exceptions++;
  });

  return {
    date,
    total: dayTx.length,
    settled: counts.settled,
    delayed: counts.delayed,
    failed: counts.failed,
    rejected: counts.rejected,
    exceptions: counts.exceptions,
    transactions: dayTx.map(t => t.transaction_id),
  };
}

/**
 * Chat with AI Copilot grounded in verified transaction evidence.
 * Calls backend POST /api/chat with full conversational history support.
 */
export async function sendChatMessage(
  transactionId: string,
  message: string,
  history: ChatMessage[] = []
): Promise<string> {
  const normId = transactionId.trim().toUpperCase();
  try {
    const res = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        transaction_id: normId,
        message,
        history,
      }),
    });
    if (res.ok) {
      const data: ChatResponse = await res.json();
      if (data.reply) {
        return data.reply;
      }
    }
  } catch (err) {
    console.warn(`[PayTrace API] Chat API call failed for ${normId}, using deterministic fallback.`, err);
  }

  // Deterministic local fallback
  const tx = getLocalTransaction(normId);
  if (tx) {
    return `Deterministic mode: Transaction ${tx.transaction_id} is currently ${tx.overall_status}. ` +
      `Verified action: ${tx.recommended_action || 'Review multi-rail telemetry.'}. ` +
      `Exceptions: ${tx.exceptions.length > 0 ? tx.exceptions.join(', ') : 'None'}.`;
  }

  return `Deterministic mode: Case ${normId} record unavailable in active dataset.`;
}
