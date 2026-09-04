"""
backend/models.py
Pydantic models for the SettlementTrace API response contract.
"""

from __future__ import annotations

from typing import Optional
from pydantic import BaseModel


class GatewayRecord(BaseModel):
    found: bool
    status: Optional[str] = None
    amount: Optional[float] = None
    currency: Optional[str] = None
    timestamp: Optional[str] = None  # captured_at or created_at


class BankRecord(BaseModel):
    found: bool
    status: Optional[str] = None
    amount: Optional[float] = None
    currency: Optional[str] = None
    received_at: Optional[str] = None
    settled_at: Optional[str] = None


class LedgerRecord(BaseModel):
    found: bool
    status: Optional[str] = None
    amount: Optional[float] = None
    currency: Optional[str] = None
    posted_at: Optional[str] = None


class InvestigationResult(BaseModel):
    transaction_id: str
    overall_status: str
    amount: Optional[float] = None
    currency: Optional[str] = None
    confidence: str  # HIGH | MEDIUM | LOW

    gateway: GatewayRecord
    bank: BankRecord
    ledger: LedgerRecord

    delay_point: Optional[str] = None  # BANK | LEDGER | GATEWAY | None

    exceptions: list[str]
    evidence: list[str]
    recommended_action: Optional[str] = None


class ExplainRequest(BaseModel):
    transaction_id: str


class ExplainResponse(BaseModel):
    transaction_id: str
    overall_status: str
    explanation: str


class DateSummary(BaseModel):
    date: str
    total: int
    settled: int
    delayed: int
    failed: int
    rejected: int
    exceptions: int
    transactions: list[str]
