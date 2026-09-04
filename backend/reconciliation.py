"""
backend/reconciliation.py
The reconciliation engine — the source of truth.
Determines settlement status and confidence from verified data only.
The LLM never touches this logic.
"""

from __future__ import annotations

from backend.exceptions import detect_exceptions, AMOUNT_MISMATCH, CURRENCY_MISMATCH
from backend.models import GatewayRecord, BankRecord, LedgerRecord, InvestigationResult


# ── Helpers ────────────────────────────────────────────────────────────────

def _safe_float(val) -> float | None:
    try:
        return float(val) if val is not None else None
    except (TypeError, ValueError):
        return None


def _safe_str(val) -> str | None:
    if val is None:
        return None
    s = str(val).strip()
    return s if s and s.lower() != "nan" else None


def _build_gateway_record(gw: dict | None) -> GatewayRecord:
    if not gw:
        return GatewayRecord(found=False)
    return GatewayRecord(
        found=True,
        status=_safe_str(gw.get("status")),
        amount=_safe_float(gw.get("amount")),
        currency=_safe_str(gw.get("currency")),
        timestamp=_safe_str(gw.get("captured_at") or gw.get("created_at")),
    )


def _build_bank_record(bk: dict | None) -> BankRecord:
    if not bk:
        return BankRecord(found=False)
    return BankRecord(
        found=True,
        status=_safe_str(bk.get("status")),
        amount=_safe_float(bk.get("amount")),
        currency=_safe_str(bk.get("currency")),
        received_at=_safe_str(bk.get("received_at")),
        settled_at=_safe_str(bk.get("settled_at")),
    )


def _build_ledger_record(lg: dict | None) -> LedgerRecord:
    if not lg:
        return LedgerRecord(found=False)
    return LedgerRecord(
        found=True,
        status=_safe_str(lg.get("status")),
        amount=_safe_float(lg.get("amount")),
        currency=_safe_str(lg.get("currency")),
        posted_at=_safe_str(lg.get("posted_at")),
    )


def _build_evidence(
    gw: dict | None,
    bk: dict | None,
    lg: dict | None,
    exceptions: list[str],
    overall_status: str,
) -> list[str]:
    """Build a list of human-readable factual evidence statements."""
    ev: list[str] = []

    # Gateway facts
    if not gw:
        ev.append("No gateway record found for this transaction.")
    else:
        gw_st = _safe_str(gw.get("status")) or "UNKNOWN"
        if gw_st == "CAPTURED":
            ev.append("Gateway successfully captured the transaction.")
        elif gw_st == "FAILED":
            ev.append("Gateway reported the transaction as FAILED.")
        else:
            ev.append(f"Gateway status is {gw_st}.")

    # Bank facts
    if not bk:
        ev.append("No bank record found for this transaction.")
    else:
        bk_st = _safe_str(bk.get("status")) or "UNKNOWN"
        if bk_st == "SETTLED":
            ev.append("Bank confirmed settlement of the transaction.")
        elif bk_st == "PENDING":
            ev.append("Bank received the transaction but has not confirmed settlement.")
        elif bk_st == "REJECTED":
            ev.append("Bank rejected the transaction.")
        else:
            ev.append(f"Bank status is {bk_st}.")

    # Ledger facts
    if not lg:
        ev.append("No ledger record found for this transaction.")
    else:
        lg_st = _safe_str(lg.get("status")) or "UNKNOWN"
        if lg_st == "POSTED":
            ev.append("Ledger entry has been posted.")
        elif lg_st == "PENDING":
            ev.append("Ledger entry remains pending.")
        elif lg_st == "REJECTED":
            ev.append("Ledger entry was rejected.")
        else:
            ev.append(f"Ledger status is {lg_st}.")

    # Exception evidence
    if "AMOUNT_MISMATCH" in exceptions:
        gw_amt = _safe_float(gw.get("amount") if gw else None)
        bk_amt = _safe_float(bk.get("amount") if bk else None)
        ev.append(
            f"Amount mismatch detected: gateway={gw_amt}, bank={bk_amt}."
        )

    if "CURRENCY_MISMATCH" in exceptions:
        gw_cur = _safe_str(gw.get("currency") if gw else None)
        bk_cur = _safe_str(bk.get("currency") if bk else None)
        ev.append(
            f"Currency mismatch detected: gateway={gw_cur}, bank={bk_cur}."
        )

    if "INVALID_TIMESTAMP_SEQUENCE" in exceptions:
        ev.append(
            "A timestamp sequence anomaly was detected: a later event "
            "has an earlier timestamp than its predecessor."
        )

    if "DUPLICATE_TRANSACTION" in exceptions:
        ev.append("Multiple gateway records found with the same transaction ID.")

    return ev


def _recommended_action(overall_status: str, exceptions: list[str]) -> str:
    mapping = {
        "SETTLED": "No action required. Transaction has fully settled.",
        "DELAYED": "Monitor the transaction. Wait for bank settlement confirmation.",
        "LEDGER_DELAY": "Ledger posting is pending. Contact the ledger team if delay persists.",
        "FAILED": "Transaction failed at the gateway. Initiate a retry or refund if applicable.",
        "REJECTED": "Transaction was rejected by the bank. Contact the bank with the bank reference.",
        "CRITICAL_EXCEPTION": "Critical data discrepancy found. Escalate to the reconciliation team immediately.",
        "EXCEPTION": "A record is missing. Investigate the missing system data.",
        "DATA_INCONSISTENCY": "Timestamp anomaly detected. Audit the system clocks and event logs.",
        "DUPLICATE_RECORD": "Duplicate gateway records detected. Investigate to prevent double settlement.",
        "UNKNOWN": "Status could not be determined. Manual investigation required.",
    }
    return mapping.get(overall_status, "Manual investigation required.")


def _determine_confidence(
    gw: dict | None,
    bk: dict | None,
    lg: dict | None,
    exceptions: list[str],
) -> str:
    """
    HIGH   — all systems present and evidence is consistent.
    MEDIUM — some evidence is missing but available evidence is strongly indicative.
    LOW    — critical records missing or evidence contradicts itself.
    """
    critical_exceptions = {AMOUNT_MISMATCH, CURRENCY_MISMATCH, "INVALID_TIMESTAMP_SEQUENCE"}

    if any(e in exceptions for e in critical_exceptions):
        return "LOW"

    all_present = gw is not None and bk is not None and lg is not None

    if all_present and not exceptions:
        return "HIGH"

    if not bk and not lg:
        return "LOW"

    if not bk or not lg:
        return "MEDIUM"

    return "HIGH"


# ── Main reconciliation function ───────────────────────────────────────────

def reconcile_transaction(
    transaction_id: str,
    raw: dict,
) -> InvestigationResult:
    """
    Given raw trace output from tracer.trace_transaction(), apply all rules
    and return a fully resolved InvestigationResult.

    This function is the source of truth. The LLM never overrides these values.
    """
    gw_records: list[dict] = raw["gateway"]
    bk: dict | None = raw["bank"]
    lg: dict | None = raw["ledger"]
    is_duplicate: bool = raw["is_duplicate"]

    # Use the first gateway record for comparisons (if any)
    gw: dict | None = gw_records[0] if gw_records else None

    # ── Detect exceptions ──────────────────────────────────────────────────
    exceptions = detect_exceptions(gw, bk, lg, is_duplicate)

    # ── Extract status strings ─────────────────────────────────────────────
    gw_status = _safe_str(gw.get("status")) if gw else None
    bk_status = _safe_str(bk.get("status")) if bk else None
    lg_status = _safe_str(lg.get("status")) if lg else None

    # ── Settlement rule engine (priority order) ────────────────────────────
    overall_status: str
    delay_point: str | None = None

    gateway_failed = gw_status == "FAILED"
    gateway_captured = gw_status == "CAPTURED"
    bank_settled = bk_status == "SETTLED"
    bank_pending = bk_status == "PENDING"
    bank_rejected = bk_status == "REJECTED"
    ledger_posted = lg_status == "POSTED"
    ledger_pending = lg_status == "PENDING"

    amount_mismatch = AMOUNT_MISMATCH in exceptions
    currency_mismatch = CURRENCY_MISMATCH in exceptions
    timestamp_anomaly = "INVALID_TIMESTAMP_SEQUENCE" in exceptions

    if not gw:
        overall_status = "EXCEPTION"

    elif is_duplicate:
        overall_status = "DUPLICATE_RECORD"

    elif gateway_failed:
        overall_status = "FAILED"

    elif amount_mismatch or currency_mismatch:
        overall_status = "CRITICAL_EXCEPTION"

    elif "MISSING_BANK_RECORD" in exceptions:
        overall_status = "EXCEPTION"

    elif bank_rejected:
        overall_status = "REJECTED"

    elif timestamp_anomaly:
        overall_status = "DATA_INCONSISTENCY"

    elif bank_pending:
        overall_status = "DELAYED"
        delay_point = "BANK"

    elif bank_settled and ("MISSING_LEDGER_RECORD" in exceptions):
        overall_status = "EXCEPTION"

    elif bank_settled and ledger_pending:
        overall_status = "LEDGER_DELAY"
        delay_point = "LEDGER"

    elif gateway_captured and bank_settled and ledger_posted:
        overall_status = "SETTLED"

    else:
        overall_status = "UNKNOWN"

    # ── Build structured records ───────────────────────────────────────────
    gw_record = _build_gateway_record(gw)
    bk_record = _build_bank_record(bk)
    lg_record = _build_ledger_record(lg)

    # ── Build human-readable evidence ──────────────────────────────────────
    evidence = _build_evidence(gw, bk, lg, exceptions, overall_status)

    # ── Confidence ────────────────────────────────────────────────────────
    confidence = _determine_confidence(gw, bk, lg, exceptions)

    # ── Primary amount / currency (from gateway, fall back to bank) ────────
    primary_amount = _safe_float(gw.get("amount") if gw else None) or (
        _safe_float(bk.get("amount")) if bk else None
    )
    primary_currency = _safe_str(gw.get("currency") if gw else None) or (
        _safe_str(bk.get("currency")) if bk else None
    )

    return InvestigationResult(
        transaction_id=transaction_id,
        overall_status=overall_status,
        amount=primary_amount,
        currency=primary_currency,
        confidence=confidence,
        gateway=gw_record,
        bank=bk_record,
        ledger=lg_record,
        delay_point=delay_point,
        exceptions=exceptions,
        evidence=evidence,
        recommended_action=_recommended_action(overall_status, exceptions),
    )
