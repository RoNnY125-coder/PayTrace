"""
backend/exceptions.py
Deterministic exception detection — no LLM involvement.
All exceptions are generated from verified data only.
"""

from __future__ import annotations

import pandas as pd


# ── Exception code constants ───────────────────────────────────────────────
AMOUNT_MISMATCH = "AMOUNT_MISMATCH"
CURRENCY_MISMATCH = "CURRENCY_MISMATCH"
MISSING_GATEWAY_RECORD = "MISSING_GATEWAY_RECORD"
MISSING_BANK_RECORD = "MISSING_BANK_RECORD"
MISSING_LEDGER_RECORD = "MISSING_LEDGER_RECORD"
DUPLICATE_TRANSACTION = "DUPLICATE_TRANSACTION"
INVALID_TIMESTAMP_SEQUENCE = "INVALID_TIMESTAMP_SEQUENCE"
MISSING_SETTLEMENT_TIMESTAMP = "MISSING_SETTLEMENT_TIMESTAMP"
UNKNOWN_STATUS = "UNKNOWN_STATUS"
INCOMPLETE_EVIDENCE = "INCOMPLETE_EVIDENCE"


def detect_exceptions(
    gw: dict | None,
    bk: dict | None,
    lg: dict | None,
    is_duplicate: bool,
) -> list[str]:
    """
    Compare gateway, bank, and ledger records and return a list of
    exception codes. Fully deterministic.
    """
    exc: list[str] = []

    # ── Record presence ────────────────────────────────────────────────────
    if not gw:
        exc.append(MISSING_GATEWAY_RECORD)
        return exc  # nothing more to compare

    if is_duplicate:
        exc.append(DUPLICATE_TRANSACTION)
        return exc  # stop further analysis on duplicates

    if not bk:
        exc.append(MISSING_BANK_RECORD)

    if not lg:
        exc.append(MISSING_LEDGER_RECORD)

    # ── Amount validation ──────────────────────────────────────────────────
    amounts = {}
    if gw:
        amounts["gateway"] = gw.get("amount")
    if bk:
        amounts["bank"] = bk.get("amount")
    if lg:
        amounts["ledger"] = lg.get("amount")

    valid_amounts = [v for v in amounts.values() if v is not None]
    if len(valid_amounts) > 1 and len(set(valid_amounts)) > 1:
        exc.append(AMOUNT_MISMATCH)

    # ── Currency validation ────────────────────────────────────────────────
    currencies = {}
    if gw:
        currencies["gateway"] = gw.get("currency")
    if bk:
        currencies["bank"] = bk.get("currency")
    if lg:
        currencies["ledger"] = lg.get("currency")

    valid_currencies = [v for v in currencies.values() if v is not None]
    if len(valid_currencies) > 1 and len(set(valid_currencies)) > 1:
        exc.append(CURRENCY_MISMATCH)

    # ── Timestamp sequence validation ──────────────────────────────────────
    ts_exceptions = _check_timestamp_sequence(gw, bk, lg)
    exc.extend(ts_exceptions)

    # ── Missing settlement timestamps on "settled" records ─────────────────
    if bk and bk.get("status") == "SETTLED" and not bk.get("settled_at"):
        exc.append(MISSING_SETTLEMENT_TIMESTAMP)

    if lg and lg.get("status") == "POSTED" and not lg.get("posted_at"):
        exc.append(MISSING_SETTLEMENT_TIMESTAMP)

    # ── Unknown statuses ───────────────────────────────────────────────────
    known_statuses = {
        "CAPTURED", "FAILED", "SETTLED", "PENDING", "REJECTED",
        "NOT_RECEIVED", "NOT_CREATED", "POSTED",
    }
    for src, rec in [("gateway", gw), ("bank", bk), ("ledger", lg)]:
        if rec:
            st = rec.get("status")
            if st and st.upper() not in known_statuses:
                exc.append(UNKNOWN_STATUS)
                break

    # ── Incomplete evidence ────────────────────────────────────────────────
    if not bk or not lg:
        if not any(e in exc for e in [MISSING_BANK_RECORD, MISSING_LEDGER_RECORD]):
            exc.append(INCOMPLETE_EVIDENCE)

    return list(dict.fromkeys(exc))  # deduplicate while preserving order


def _parse_ts(val) -> pd.Timestamp | None:
    """Parse a timestamp string/None into pd.Timestamp or None."""
    if val is None:
        return None
    try:
        ts = pd.to_datetime(val)
        return None if pd.isna(ts) else ts
    except Exception:
        return None


def _check_timestamp_sequence(
    gw: dict | None,
    bk: dict | None,
    lg: dict | None,
) -> list[str]:
    """
    Verify the expected temporal ordering:
      created_at ≤ captured_at ≤ received_at ≤ settled_at ≤ posted_at
    Any inversion generates INVALID_TIMESTAMP_SEQUENCE.
    """
    exc: list[str] = []

    created_at = _parse_ts(gw.get("created_at") if gw else None)
    captured_at = _parse_ts(gw.get("captured_at") if gw else None)
    received_at = _parse_ts(bk.get("received_at") if bk else None)
    settled_at = _parse_ts(bk.get("settled_at") if bk else None)
    posted_at = _parse_ts(lg.get("posted_at") if lg else None)

    pairs = [
        (created_at, captured_at, "created_at → captured_at"),
        (captured_at, received_at, "captured_at → received_at"),
        (received_at, settled_at, "received_at → settled_at"),
        (settled_at, posted_at, "settled_at → posted_at"),
    ]

    for earlier, later, label in pairs:
        if earlier is not None and later is not None:
            if later < earlier:
                exc.append(INVALID_TIMESTAMP_SEQUENCE)
                break  # one flag is enough

    return exc
