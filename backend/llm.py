"""
backend/llm.py
Gemini integration for explaining verified settlement evidence.
The LLM ONLY explains — it never decides settlement status.

Uses google-genai (new SDK). Falls back to google-generativeai if needed.
"""

from __future__ import annotations

import os
import json
import warnings
from pathlib import Path
from dotenv import load_dotenv

# Check both backend/.env and root .env
load_dotenv(dotenv_path=Path(__file__).parent / ".env")
load_dotenv()

# Suppress deprecation warnings from old google.generativeai if it gets imported transitively
warnings.filterwarnings("ignore", category=DeprecationWarning, module="google")

_SYSTEM_PROMPT = """You are a fintech settlement support assistant.

You are given VERIFIED transaction evidence produced by a deterministic reconciliation engine.

Your job is ONLY to explain the supplied evidence.

STRICT RULES — you MUST follow all of these:

1. Never invent transaction facts not present in the evidence.
2. Never invent a failure reason.
3. Never assume a bank outage, compliance issue, fraud, insufficient funds, network failure, or technical problem UNLESS that fact is explicitly present in the evidence.
4. Never contradict the deterministic settlement status.
5. Clearly distinguish confirmed facts from unknown information.
6. If evidence is incomplete, explicitly say so.
7. Highlight amount or currency mismatches when present in the exceptions list.
8. Pay attention to the exception list.
9. Recommend an action only when supported by evidence.
10. If the exact cause cannot be determined, say so clearly and do NOT speculate.

Return your response in EXACTLY this format (no extra text before or after):

Settlement Status: <status>
Explanation: <1-3 sentences explaining what the evidence shows>
Where the issue occurred: <system name or "N/A - no issue">
Confirmed Facts: <bullet list of confirmed facts from the evidence>
Uncertainty: <what is unknown or "None - all evidence is consistent">
Exceptions: <list exceptions or "None">
Recommended Action: <action based solely on evidence>
Confidence: <HIGH | MEDIUM | LOW>
"""


def _build_evidence_payload(result) -> str:
    """Build the JSON payload sent to the LLM from an InvestigationResult."""
    payload = {
        "transaction_id": result.transaction_id,
        "overall_status": result.overall_status,
        "delay_point": result.delay_point,
        "gateway_status": result.gateway.status,
        "bank_status": result.bank.status,
        "ledger_status": result.ledger.status,
        "gateway_amount": result.gateway.amount,
        "bank_amount": result.bank.amount,
        "ledger_amount": result.ledger.amount,
        "gateway_currency": result.gateway.currency,
        "bank_currency": result.bank.currency,
        "ledger_currency": result.ledger.currency,
        "amounts_match": (
            len({result.gateway.amount, result.bank.amount, result.ledger.amount} - {None}) <= 1
        ),
        "currencies_match": (
            len({result.gateway.currency, result.bank.currency, result.ledger.currency} - {None}) <= 1
        ),
        "exceptions": result.exceptions,
        "evidence": result.evidence,
        "confidence": result.confidence,
    }
    return json.dumps(payload, indent=2)


def explain_with_llm(result) -> str:
    """
    Send verified evidence to Gemini and return the explanation.
    Falls back gracefully if the API is unavailable or the key is invalid.
    """
    api_key = os.getenv("LLM_API_KEY")
    if not api_key or api_key == "your_gemini_api_key_here":
        return _fallback_explanation(result)

    try:
        # Try new google-genai SDK first
        from google import genai
        from google.genai import types

        client = genai.Client(api_key=api_key)
        evidence_payload = _build_evidence_payload(result)
        user_message = (
            f"Explain the following verified transaction evidence:\n\n{evidence_payload}"
        )

        for model_name in ["gemini-3.6-flash", "gemini-2.5-flash"]:
            try:
                response = client.models.generate_content(
                    model=model_name,
                    contents=user_message,
                    config=types.GenerateContentConfig(
                        system_instruction=_SYSTEM_PROMPT,
                        temperature=0.1,  # Low temperature for factual, consistent output
                    ),
                )
                if response.text and response.text.strip():
                    return response.text.strip()
            except Exception as model_err:
                # Log model error and seamlessly try next candidate
                warnings.warn(f"[Gemini API] {model_name} error: {model_err}")
                continue

        return _fallback_explanation(result)

    except ImportError:
        # Fall back to old SDK
        return _explain_with_old_sdk(result, api_key)

    except Exception:
        return _fallback_explanation(result)


def _explain_with_old_sdk(result, api_key: str) -> str:
    """Fallback to deprecated google-generativeai SDK."""
    try:
        import warnings
        with warnings.catch_warnings():
            warnings.simplefilter("ignore")
            import google.generativeai as genai_old  # type: ignore
            genai_old.configure(api_key=api_key)
            model = genai_old.GenerativeModel(
                model_name="gemini-2.5-flash",
                system_instruction=_SYSTEM_PROMPT,
            )
            evidence_payload = _build_evidence_payload(result)
            user_message = f"Explain the following verified transaction evidence:\n\n{evidence_payload}"
            response = model.generate_content(user_message)
            return response.text.strip()
    except Exception as exc:
        return f"[LLM unavailable: {type(exc).__name__}]\n\n{_fallback_explanation(result)}"


def _fallback_explanation(result) -> str:
    """
    Rule-based fallback explanation when LLM is unavailable.
    Always factually accurate and never speculative.
    """
    lines = [
        f"Settlement Status: {result.overall_status}",
        f"Explanation: {result.recommended_action}",
        f"Where the issue occurred: {result.delay_point or 'N/A - no issue'}",
        "Confirmed Facts:",
    ]
    for fact in result.evidence:
        lines.append(f"  - {fact}")

    if result.exceptions:
        lines.append(f"Exceptions: {', '.join(result.exceptions)}")
        lines.append("Uncertainty: See exceptions above.")
    else:
        lines.append("Exceptions: None")
        lines.append("Uncertainty: None - all evidence is consistent.")

    lines.append(f"Recommended Action: {result.recommended_action}")
    lines.append(f"Confidence: {result.confidence}")

    return "\n".join(lines)
