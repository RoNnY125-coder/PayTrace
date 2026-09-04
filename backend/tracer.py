"""
backend/tracer.py
Finds a transaction across Gateway, Bank, and Ledger DataFrames.
Returns raw records (as dicts) or None — never fabricates missing data.
"""

import pandas as pd
from backend.loader import get_gateway, get_bank, get_ledger


def _ts(val) -> str | None:
    """Convert a pandas Timestamp / NaT to ISO string or None."""
    if pd.isna(val):
        return None
    return str(val)


def _row_to_dict(row: pd.Series) -> dict:
    """Convert a DataFrame row to a plain dict with None for NaT/NaN."""
    result = {}
    for col, val in row.items():
        if pd.isna(val):
            result[col] = None
        elif isinstance(val, pd.Timestamp):
            result[col] = str(val)
        else:
            result[col] = val
    return result


def trace_transaction(transaction_id: str) -> dict:
    """
    Locate transaction_id in all three data sources.

    Returns:
        {
            "gateway": list[dict] | [],   # may have duplicates
            "bank":    dict | None,
            "ledger":  dict | None,
            "is_duplicate": bool
        }
    """
    gw_df = get_gateway()
    bk_df = get_bank()
    lg_df = get_ledger()

    # Gateway — may have duplicates intentionally (DEMO010)
    gw_rows = gw_df[gw_df["transaction_id"] == transaction_id]
    gw_records = [_row_to_dict(row) for _, row in gw_rows.iterrows()]

    # Bank — take first match
    bk_rows = bk_df[bk_df["transaction_id"] == transaction_id]
    bk_record = _row_to_dict(bk_rows.iloc[0]) if not bk_rows.empty else None

    # Ledger — take first match
    lg_rows = lg_df[lg_df["transaction_id"] == transaction_id]
    lg_record = _row_to_dict(lg_rows.iloc[0]) if not lg_rows.empty else None

    return {
        "gateway": gw_records,
        "bank": bk_record,
        "ledger": lg_record,
        "is_duplicate": len(gw_records) > 1,
    }
