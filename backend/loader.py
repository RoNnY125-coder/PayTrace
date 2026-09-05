"""
backend/loader.py
Loads CSV data once at startup and provides access functions.
Data is cached in module-level variables — no re-reading per request.
"""

import pandas as pd
from pathlib import Path

# ── resolve path relative to project root (settlement-trace/) ──────────────
_DATA_DIR = Path(__file__).resolve().parent.parent / "data"

_gateway_df: pd.DataFrame | None = None
_bank_df: pd.DataFrame | None = None
_ledger_df: pd.DataFrame | None = None


def _parse_dt(df: pd.DataFrame, cols: list[str]) -> pd.DataFrame:
    """Coerce timestamp columns to datetime (NaT on failure)."""
    for col in cols:
        if col in df.columns:
            df[col] = pd.to_datetime(df[col], errors="coerce")
    return df


def load_data() -> None:
    """Load all three CSVs into module-level DataFrames. Call once at startup."""
    global _gateway_df, _bank_df, _ledger_df

    gateway = pd.read_csv(_DATA_DIR / "gateway.csv")
    bank = pd.read_csv(_DATA_DIR / "bank.csv")
    ledger = pd.read_csv(_DATA_DIR / "ledger.csv")

    gateway = _parse_dt(gateway, ["created_at", "captured_at"])
    bank = _parse_dt(bank, ["received_at", "settled_at"])
    ledger = _parse_dt(ledger, ["created_at", "posted_at"])

    # Strip whitespace from string columns
    for df in (gateway, bank, ledger):
        for col in df.select_dtypes(include="object").columns:
            df[col] = df[col].str.strip()

    _gateway_df = gateway
    _bank_df = bank
    _ledger_df = ledger


def get_gateway() -> pd.DataFrame:
    global _gateway_df
    if _gateway_df is None:
        load_data()
    return _gateway_df


def get_bank() -> pd.DataFrame:
    global _bank_df
    if _bank_df is None:
        load_data()
    return _bank_df


def get_ledger() -> pd.DataFrame:
    global _ledger_df
    if _ledger_df is None:
        load_data()
    return _ledger_df
