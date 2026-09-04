# PayTrace — Fintech Truth & Reconciliation Engine
Origin Hackathon Submission

PayTrace is a deterministic settlement investigation platform for fintech transactions. It traces transactions across Payment Gateway, Core Banking, and General Ledger data, reconciles them through a deterministic rules engine, detects inconsistencies/exceptions, and leverages Google Gemini to explain verified facts without hallucination.

---

## 🏛️ Architecture & Principle

```text
       Payment Gateway CSV       Bank Statement CSV       General Ledger CSV
               │                          │                        │
               └──────────────────────────┼────────────────────────┘
                                          ▼
                                Transaction Tracer
                                          │
                                          ▼
                                Reconciliation Engine
                                 (Deterministic Truth)
                                          │
                                          ▼
                                Verified Evidence JSON
                                          │
                                          ▼
                                 Gemini 2.5 Flash
                                (Explain Facts Only)
```

> **Core Rule:** The reconciliation engine determines facts. The LLM explains facts. The LLM never decides whether a transaction settled or invents outage/fraud claims.

---

## 🚀 Quickstart

### 1. Backend Setup
```bash
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory:
```env
LLM_API_KEY=your_gemini_api_key_here
```

### 3. Run Backend Server
```bash
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```
Interactive API documentation available at: `http://localhost:8000/docs`

### 4. Run Frontend
```bash
npm install
npm run dev
```
Frontend interface available at: `http://localhost:5173`

---

## 📡 API Endpoints

### 1. Investigate Transaction
`GET /api/transactions/{transaction_id}`

Traces the transaction across Gateway, Bank, and Ledger, evaluates reconciliation rules, and returns full deterministic evidence.

### 2. Daily Summary / Dashboard
`GET /api/transactions?date=YYYY-MM-DD`

Aggregates all transactions for a given date.

### 3. AI Explanation
`POST /api/explain`

Sends verified evidence to Gemini 2.5 Flash for natural language reasoning.

---

## 🎯 Benchmark & Test Scenarios

### Fixed Demo IDs:
- `DEMO001`: **SETTLED** (Gateway CAPTURED, Bank SETTLED, Ledger POSTED)
- `DEMO002`: **DELAYED** (Bank PENDING, Ledger PENDING)
- `DEMO003`: **LEDGER_DELAY** (Bank SETTLED, Ledger PENDING)
- `DEMO004`: **CRITICAL_EXCEPTION** (Gateway ₹1500 vs Bank ₹1200 amount mismatch)
- `DEMO005`: **EXCEPTION** (Missing bank & ledger records)
- `DEMO006`: **FAILED** (Gateway FAILED, no downstream records)
- `DEMO007`: **REJECTED** (Bank REJECTED)
- `DEMO008`: **CRITICAL_EXCEPTION** (Currency mismatch: INR vs USD)
- `DEMO009`: **DATA_INCONSISTENCY** (Ledger posted BEFORE bank settled)
- `DEMO010`: **DUPLICATE_RECORD** (Duplicate gateway records)
- `DEMO011`: **DELAYED** (Unknown cause, prevents hallucination)

### High-Volume Synthetic Test Data (280+ IDs):
- `TXN001` - `TXN100`: **SETTLED** (100 txns)
- `TXN101` - `TXN130`: **DELAYED** (30 txns)
- `TXN131` - `TXN155`: **LEDGER_DELAY** (25 txns)
- `TXN156` - `TXN175`: **AMOUNT_MISMATCH** (20 txns)
- `TXN176` - `TXN195`: **MISSING_BANK** (20 txns)
- `TXN196` - `TXN215`: **GATEWAY_FAILED** (20 txns)
- `TXN216` - `TXN230`: **BANK_REJECTED** (15 txns)
- `TXN231` - `TXN245`: **CURRENCY_MISMATCH** (15 txns)
- `TXN246` - `TXN260`: **TIMESTAMP_ANOMALY** (15 txns)
- `TXN261` - `TXN270`: **DUPLICATE** (10 txns)
- `TXN271` - `TXN280`: **UNKNOWN_DELAYED** (10 txns)
