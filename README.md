# PayTrace — Fintech Truth & Settlement Reconciliation Engine

PayTrace is a deterministic fintech settlement investigation platform and AI Copilot. It traces financial transactions across **Payment Gateway**, **Core Banking Rails**, and **General Ledger** records, evaluates them against strict reconciliation rules, identifies settlement bottlenecks and critical exceptions, and provides zero-hallucination AI explanations and conversational inquiries powered by Google Gemini.

---

## 🏛️ System Architecture

```text
  ┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────────┐
  │ Payment Gateway Data │  │ Bank Statement Logs  │  │ General Ledger Feeds │
  └──────────┬───────────┘  └──────────┬───────────┘  └──────────┬───────────┘
             │                         │                         │
             └─────────────────────────┼─────────────────────────┘
                                       ▼
                       Transaction Multi-Rail Tracer
                                       │
                                       ▼
                         Reconciliation Truth Engine
                           (Deterministic Logic)
                                       │
                                       ▼
                        Verified Evidence Payload (JSON)
                                       │
                    ┌──────────────────┴──────────────────┐
                    ▼                                     ▼
           Zero-Hallucination                    Settlement Copilot
            AI Synthesis (/explain)                Chat Engine (/chat)
         [Google GenAI / Gemini API]           [Multi-Turn Operational Q&A]
```

### 🛡️ Core Operating Principles
1. **Deterministic Truth**: Status, delays, and exceptions are calculated 100% deterministically by the reconciliation engine.
2. **Zero-Hallucination AI**: The LLM *explains* and *interprets* verified facts; it is strictly prohibited from inventing outages, maintenance windows, fraud claims, or changing settlement statuses.
3. **Multi-Rail Auditability**: Every discrepancy (amount mismatches, currency differences, timestamp anomalies, missing records) is surfaced with exact reference identifiers.

---

## ✨ Features & UI Design

- **Wise-Inspired Design Language**: Clean warm-dark theme (`#14151A`), crisp Wise lime accents (`#9FE870`), confident whitespace, pill geometry, and flat depth.
- **AI Copilot Chatbot**:
  - Full-screen expanding modal with background blur (`backdrop-blur-md`).
  - Native mouse wheel smooth scrolling isolated with event-propagation safeguards.
  - Multi-turn conversational memory grounded in specific transaction telemetry.
  - Quick-action suggested inquiry chips (e.g., *"Why is the bank pending?"*, *"Draft bank escalation email"*).
- **Multi-Node Transaction Pipeline**: Visual 3-node lifecycle tracker with live statuses and timestamp telemetry.
- **Operations Dashboard**: Date-filtered transaction summaries, volume metrics, status distributions, and CSV audit log exports.
- **Diagnostic Benchmark Matrix**: Test console with 290+ pre-seeded benchmark scenarios.

---

## 🛠️ Tech Stack

- **Frontend**: Vite, React 18, TypeScript, Tailwind CSS, Lucide / Material Symbols, Lenis Smooth Scroll, Framer Motion.
- **Backend**: FastAPI, Uvicorn, Python 3.12, Pandas, Pydantic, Python-Dotenv.
- **AI Engine**: Google GenAI SDK (`google-genai`), multi-model fallback cascade (`gemini-3.5-flash-lite`, `gemini-flash-lite-latest`, `gemini-3.5-flash`, `gemini-3.6-flash`, `gemini-3.7-flash`).
- **Deployment**: Vercel Serverless Functions (`@vercel/python`) + Static Vite Build (`@vercel/static-build`).

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)
- Gemini API Key ([Google AI Studio](https://aistudio.google.com/))

### 1. Clone & Configure Environment
```bash
git clone https://github.com/RoNnY125-coder/PayTrace.git
cd PayTrace
```

Create a `.env` file in the project root:
```env
LLM_API_KEY=your_gemini_api_key_here
```

### 2. Backend Setup
```bash
# Create and activate virtual environment
python -m venv venv

# Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# Linux / macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start FastAPI server
python -m uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
```
API Documentation will be live at `http://127.0.0.1:8000/docs`.

### 3. Frontend Setup
```bash
# In a new terminal:
npm install
npm run dev
```
Frontend interface will be live at `http://localhost:5173`.

---

## 🌐 Deploying to Vercel

PayTrace is pre-configured for seamless unified deployment on **Vercel** with `vercel.json` routing both the static React frontend and Python FastAPI serverless endpoints (`api/index.py`).

1. Push your repository to GitHub.
2. Import the project in the [Vercel Dashboard](https://vercel.com/new).
3. In **Settings** $\rightarrow$ **Environment Variables**, add:
   - **Key**: `LLM_API_KEY`
   - **Value**: `your_gemini_api_key`
4. Click **Deploy**.

---

## 📡 API Reference

### 1. Investigate Transaction
`GET /api/transactions/{transaction_id}`
Traces transaction across Gateway, Bank, and Ledger, computes settlement status, and returns verified evidence points.

### 2. Daily Summary
`GET /api/transactions?date=YYYY-MM-DD`
Returns aggregated settlement telemetry, transaction volume, and status distributions.

### 3. Explain Verified Evidence
`POST /api/explain`
```json
{
  "transaction_id": "DEMO004"
}
```

### 4. AI Copilot Chat
`POST /api/chat`
```json
{
  "transaction_id": "DEMO004",
  "message": "Draft an escalation email to the bank for this discrepancy",
  "history": [
    {
      "role": "user",
      "content": "Why is the status CRITICAL_EXCEPTION?"
    },
    {
      "role": "assistant",
      "content": "There is an amount mismatch between Gateway (₹1,500) and Bank (₹1,200)."
    }
  ]
}
```

---

## 🎯 Benchmark & Test Scenarios

### Core Benchmark IDs
| Transaction ID | Status | Description |
| :--- | :--- | :--- |
| `DEMO001` | **SETTLED** | All 3 rails captured, settled, and posted in sync. |
| `DEMO002` | **DELAYED** | Gateway captured; Bank status is `PENDING`. |
| `DEMO003` | **LEDGER_DELAY** | Bank settled; Ledger posting is `PENDING`. |
| `DEMO004` | **CRITICAL_EXCEPTION** | Amount mismatch (Gateway ₹1,500 vs Bank ₹1,200). |
| `DEMO005` | **EXCEPTION** | Missing bank and ledger confirmation records. |
| `DEMO006` | **FAILED** | Gateway status `FAILED`; no downstream settlement. |
| `DEMO007` | **REJECTED** | Gateway captured; Bank returned `REJECTED`. |
| `DEMO008` | **CRITICAL_EXCEPTION** | Currency mismatch (e.g., INR vs USD). |
| `DEMO009` | **DATA_INCONSISTENCY** | Timestamp anomaly (Ledger posted before Bank settled). |
| `DEMO010` | **DUPLICATE_RECORD** | Multiple conflicting capture logs in gateway. |
| `DEMO011` | **DELAYED** | Unknown settlement delay (tests hallucination prevention). |

### Synthetic High-Volume Test Set (280+ IDs)
- `TXN001` – `TXN100`: **SETTLED** (100 Transactions)
- `TXN101` – `TXN130`: **DELAYED** (30 Transactions)
- `TXN131` – `TXN155`: **LEDGER_DELAY** (25 Transactions)
- `TXN156` – `TXN175`: **AMOUNT_MISMATCH** (20 Transactions)
- `TXN176` – `TXN195`: **MISSING_BANK** (20 Transactions)
- `TXN196` – `TXN215`: **GATEWAY_FAILED** (20 Transactions)
- `TXN216` – `TXN230`: **BANK_REJECTED** (15 Transactions)
- `TXN231` – `TXN245`: **CURRENCY_MISMATCH** (15 Transactions)
- `TXN246` – `TXN260`: **TIMESTAMP_ANOMALY** (15 Transactions)
- `TXN261` – `TXN270`: **DUPLICATE** (10 Transactions)
- `TXN271` – `TXN280`: **UNKNOWN_DELAYED** (10 Transactions)

---

## 📄 License
MIT License. Built for fintech settlement and truth reconciliation operations.
