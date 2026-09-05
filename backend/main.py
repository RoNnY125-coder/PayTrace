"""
backend/main.py
SettlementTrace FastAPI application.
Entry point: uvicorn backend.main:app --reload
"""

from __future__ import annotations

import pandas as pd
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from backend.loader import load_data, get_gateway
from backend.tracer import trace_transaction
from backend.reconciliation import reconcile_transaction
from backend.models import (
    InvestigationResult,
    ExplainRequest,
    ExplainResponse,
    DateSummary,
    ChatRequest,
    ChatResponse,
)
from backend.llm import explain_with_llm, chat_with_llm

# ── App setup ──────────────────────────────────────────────────────────────
app = FastAPI(
    title="SettlementTrace API",
    description="Deterministic fintech settlement investigation engine.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Tighten in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Startup ────────────────────────────────────────────────────────────────
@app.on_event("startup")
def startup_event():
    """Load CSVs once at startup — not per request."""
    load_data()
    print("[OK] SettlementTrace data loaded successfully.")


# ── Core investigate helper ────────────────────────────────────────────────
def investigate(transaction_id: str) -> InvestigationResult:
    """
    The central function of the system.
    Trace → Reconcile → Return verified evidence.
    """
    raw = trace_transaction(transaction_id)
    if not raw["gateway"] and raw["bank"] is None and raw["ledger"] is None:
        raise HTTPException(
            status_code=404,
            detail=f"Transaction '{transaction_id}' not found in any system.",
        )
    return reconcile_transaction(transaction_id, raw)


# ── Routes ─────────────────────────────────────────────────────────────────

@app.get("/", tags=["Health"])
def root():
    return {"status": "ok", "service": "SettlementTrace API"}


@app.get(
    "/api/transactions/{transaction_id}",
    response_model=InvestigationResult,
    tags=["Transactions"],
    summary="Investigate a single transaction",
)
def get_transaction(transaction_id: str) -> InvestigationResult:
    """
    Trace and reconcile a single transaction across all three systems.
    Returns full structured evidence — no LLM involved.
    """
    return investigate(transaction_id.upper())


@app.get(
    "/api/transactions",
    response_model=DateSummary,
    tags=["Transactions"],
    summary="Daily settlement dashboard",
)
def get_transactions_by_date(
    date: str = Query(..., description="Date in YYYY-MM-DD format, e.g. 2026-09-01"),
) -> DateSummary:
    """
    Aggregate all transactions from a given date and return summary counts.
    Filters by the gateway captured_at date.
    """
    try:
        target_date = pd.to_datetime(date).date()
    except Exception:
        raise HTTPException(status_code=400, detail=f"Invalid date format: '{date}'. Use YYYY-MM-DD.")

    gw_df = get_gateway()

    # Filter gateway records by date
    mask = gw_df["captured_at"].apply(
        lambda ts: ts.date() == target_date if pd.notna(ts) else False
    )
    # Also include rows where captured_at is NaT but created_at matches (e.g. DEMO006 failed)
    mask_created = gw_df["created_at"].apply(
        lambda ts: ts.date() == target_date if pd.notna(ts) else False
    )
    combined_mask = mask | mask_created

    day_gw = gw_df[combined_mask]

    if day_gw.empty:
        return DateSummary(
            date=date,
            total=0,
            settled=0,
            delayed=0,
            failed=0,
            rejected=0,
            exceptions=0,
            transactions=[],
        )

    # Unique transaction IDs for this date (deduplicated)
    txn_ids = day_gw["transaction_id"].unique().tolist()

    counts = {
        "settled": 0,
        "delayed": 0,
        "failed": 0,
        "rejected": 0,
        "exceptions": 0,
    }
    resolved_ids: list[str] = []

    for txn_id in txn_ids:
        try:
            result = investigate(txn_id)
            resolved_ids.append(txn_id)
            st = result.overall_status

            if st == "SETTLED":
                counts["settled"] += 1
            elif st in ("DELAYED", "LEDGER_DELAY"):
                counts["delayed"] += 1
            elif st == "FAILED":
                counts["failed"] += 1
            elif st == "REJECTED":
                counts["rejected"] += 1
            else:
                # CRITICAL_EXCEPTION, EXCEPTION, DATA_INCONSISTENCY, DUPLICATE_RECORD, UNKNOWN
                counts["exceptions"] += 1
        except HTTPException:
            counts["exceptions"] += 1

    return DateSummary(
        date=date,
        total=len(resolved_ids),
        settled=counts["settled"],
        delayed=counts["delayed"],
        failed=counts["failed"],
        rejected=counts["rejected"],
        exceptions=counts["exceptions"],
        transactions=resolved_ids,
    )


@app.post(
    "/api/explain",
    response_model=ExplainResponse,
    tags=["AI"],
    summary="Get an AI explanation for a transaction",
)
def explain_transaction(body: ExplainRequest) -> ExplainResponse:
    """
    Trace → Reconcile → Build verified evidence → Send to Gemini → Return explanation.
    The LLM NEVER decides the settlement status. It only explains what the engine found.
    """
    result = investigate(body.transaction_id.upper())
    explanation = explain_with_llm(result)

    return ExplainResponse(
        transaction_id=result.transaction_id,
        overall_status=result.overall_status,
        explanation=explanation,
    )


@app.post(
    "/api/chat",
    response_model=ChatResponse,
    tags=["AI"],
    summary="Chat with the AI Copilot about a transaction",
)
def chat_transaction(body: ChatRequest) -> ChatResponse:
    """
    Conversational follow-up assistant grounded strictly in verified transaction evidence.
    Supports chat history for back-and-forth investigation and inquiry.
    """
    result = investigate(body.transaction_id.upper())
    history_dicts = [h.model_dump() for h in body.history]
    reply = chat_with_llm(result, body.message, history_dicts)

    return ChatResponse(
        transaction_id=result.transaction_id,
        reply=reply,
    )

