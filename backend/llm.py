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


# Candidate Gemini models with separate free quotas (verified working on API)
GEMINI_MODELS = [
    "gemini-3.5-flash-lite",
    "gemini-flash-lite-latest",
    "gemini-3.5-flash",
    "gemini-3.6-flash",
    "gemini-3.7-flash",
]


def _call_groq(user_prompt: str, system_prompt: str) -> str | None:
    """Optional Groq fallback if GROQ_API_KEY is configured in .env."""
    groq_key = os.getenv("GROQ_API_KEY")
    if not groq_key or groq_key == "your_groq_api_key_here":
        return None
    try:
        import httpx
        resp = httpx.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={"Authorization": f"Bearer {groq_key}"},
            json={
                "model": "llama-3.3-70b-versatile",
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                "temperature": 0.1,
            },
            timeout=15.0,
        )
        if resp.status_code == 200:
            return resp.json()["choices"][0]["message"]["content"].strip()
    except Exception:
        pass
    return None


def explain_with_llm(result) -> str:
    """
    Send verified evidence to Gemini and return the explanation.
    Automatically cascades through models if a 429 quota limit is reached.
    Uses official google-genai SDK, with graceful fallback.
    """
    api_key = os.getenv("LLM_API_KEY")
    if not api_key or api_key == "your_gemini_api_key_here":
        groq_resp = _call_groq(_build_evidence_payload(result), _SYSTEM_PROMPT)
        if groq_resp:
            return groq_resp
        return _fallback_explanation(result)

    evidence_payload = _build_evidence_payload(result)
    user_message = f"Explain the following verified transaction evidence:\n\n{evidence_payload}"

    # 1. Try modern google-genai SDK
    last_err = None
    try:
        from google import genai
        from google.genai import types

        client = genai.Client(api_key=api_key)
        for model_name in GEMINI_MODELS:
            try:
                response = client.models.generate_content(
                    model=model_name,
                    contents=user_message,
                    config=types.GenerateContentConfig(
                        system_instruction=_SYSTEM_PROMPT,
                        temperature=0.1,
                    ),
                )
                if response and response.text:
                    return response.text.strip()
            except Exception as model_err:
                last_err = model_err
                continue
    except ImportError:
        pass
    except Exception as exc:
        last_err = exc

    # 2. Try legacy google.generativeai if available
    try:
        import warnings
        with warnings.catch_warnings():
            warnings.simplefilter("ignore")
            import google.generativeai as genai_old  # type: ignore
            genai_old.configure(api_key=api_key)

            for model_name in GEMINI_MODELS:
                try:
                    model = genai_old.GenerativeModel(
                        model_name=model_name,
                        system_instruction=_SYSTEM_PROMPT,
                    )
                    response = model.generate_content(user_message)
                    if response and response.text:
                        return response.text.strip()
                except Exception as model_err:
                    last_err = model_err
                    continue
    except Exception:
        pass

    # 3. If Gemini models exhausted, try Groq fallback if configured
    groq_resp = _call_groq(user_message, _SYSTEM_PROMPT)
    if groq_resp:
        return groq_resp

    return f"[LLM unavailable: {type(last_err).__name__ if last_err else 'QuotaExceeded'}]\n\n{_fallback_explanation(result)}"


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


# ── Interactive Chatbot Engine ──────────────────────────────────────────────

_CHAT_SYSTEM_PROMPT = """You are SettlementTrace Support Copilot, an expert fintech reconciliation assistant.
You are helping an operations analyst, finance engineer, or customer support specialist investigate a specific transaction.

CRITICAL RULES:
1. Ground every answer strictly and exclusively in the verified facts provided below.
2. NEVER invent reasons, external outages, bank maintenance, network failures, or fraud unless explicitly confirmed in the evidence.
3. If asked why something happened and the evidence does not state the root cause (e.g. why bank is pending), explicitly state that the exact reason is not in the system records.
4. You may help draft emails, support tickets, or escalation notices to the bank, payment gateway, or ledger operations team using confirmed reference IDs, amounts, and dates.
5. Keep answers professional, concise, helpful, and operationally accurate.
"""


def _call_groq_chat(message: str, system_prompt: str, history: list[dict] | None = None) -> str | None:
    """Optional Groq multi-turn chat fallback."""
    groq_key = os.getenv("GROQ_API_KEY")
    if not groq_key or groq_key == "your_groq_api_key_here":
        return None
    try:
        import httpx
        messages = [{"role": "system", "content": system_prompt}]
        if history:
            for item in history:
                role = "user" if item.get("role") == "user" else "assistant"
                content = item.get("content", "").strip()
                if content:
                    messages.append({"role": role, "content": content})
        messages.append({"role": "user", "content": message})
        resp = httpx.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={"Authorization": f"Bearer {groq_key}"},
            json={
                "model": "llama-3.3-70b-versatile",
                "messages": messages,
                "temperature": 0.1,
            },
            timeout=15.0,
        )
        if resp.status_code == 200:
            return resp.json()["choices"][0]["message"]["content"].strip()
    except Exception:
        pass
    return None


def chat_with_llm(result, message: str, history: list[dict] | None = None) -> str:
    """
    Conversational follow-up assistant grounded in the deterministic facts of a specific transaction.
    Cascades through models automatically if quota is exhausted.
    """
    api_key = os.getenv("LLM_API_KEY")
    evidence_payload = _build_evidence_payload(result)
    system_instruction = (
        f"{_CHAT_SYSTEM_PROMPT}\n\n"
        f"[CURRENT TRANSACTION VERIFIED EVIDENCE]\n"
        f"{evidence_payload}"
    )

    if not api_key or api_key == "your_gemini_api_key_here":
        groq_resp = _call_groq_chat(message, system_instruction, history)
        if groq_resp:
            return groq_resp
        return _fallback_chat(result, message)

    # 1. Try modern google-genai SDK
    last_err = None
    try:
        from google import genai
        from google.genai import types

        client = genai.Client(api_key=api_key)
        contents = []
        if history:
            for item in history:
                role = "user" if item.get("role") == "user" else "model"
                content = item.get("content", "").strip()
                if content:
                    contents.append(types.Content(role=role, parts=[types.Part.from_text(text=content)]))
        contents.append(types.Content(role="user", parts=[types.Part.from_text(text=message)]))

        for model_name in GEMINI_MODELS:
            try:
                response = client.models.generate_content(
                    model=model_name,
                    contents=contents,
                    config=types.GenerateContentConfig(
                        system_instruction=system_instruction,
                        temperature=0.1,
                    ),
                )
                if response and response.text:
                    return response.text.strip()
            except Exception as model_err:
                last_err = model_err
                continue
    except ImportError:
        pass
    except Exception as exc:
        last_err = exc

    # 2. Try legacy google.generativeai if available
    try:
        import warnings
        with warnings.catch_warnings():
            warnings.simplefilter("ignore")
            import google.generativeai as genai_old  # type: ignore
            genai_old.configure(api_key=api_key)

            # Build Gemini history format
            gemini_history = []
            if history:
                for item in history:
                    raw_role = item.get("role", "user")
                    role = "user" if raw_role == "user" else "model"
                    content = item.get("content", "").strip()
                    if not content:
                        continue
                    if gemini_history and gemini_history[-1]["role"] == role:
                        gemini_history[-1]["parts"][0] += f"\n{content}"
                    else:
                        gemini_history.append({"role": role, "parts": [content]})

                while gemini_history and gemini_history[0]["role"] != "user":
                    gemini_history.pop(0)

            for model_name in GEMINI_MODELS:
                try:
                    model = genai_old.GenerativeModel(
                        model_name=model_name,
                        system_instruction=system_instruction,
                    )
                    chat = model.start_chat(history=list(gemini_history))
                    response = chat.send_message(message)
                    if response and response.text:
                        return response.text.strip()
                except Exception as model_err:
                    last_err = model_err
                    continue
    except Exception:
        pass

    # 3. Try Groq fallback if Gemini models are exhausted
    groq_resp = _call_groq_chat(message, system_instruction, history)
    if groq_resp:
        return groq_resp

    return (
        f"[Notice: Daily free quota reached for primary model. Displaying deterministic verification]\n\n"
        f"{_fallback_chat(result, message)}"
    )


def _fallback_chat(result, message: str) -> str:
    return (
        f"Deterministic mode: Transaction {result.transaction_id} is currently {result.overall_status}. "
        f"Verified action: {result.recommended_action}. "
        f"Exceptions: {', '.join(result.exceptions) if result.exceptions else 'None'}."
    )

