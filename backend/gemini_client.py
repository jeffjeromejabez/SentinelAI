"""
SentinelAI — Google Gemini API Client & Model Orchestrator
Handles text and multimodal vision requests via Google Gemini API with rate-limit retries and fallback support.
"""

import json
import logging
import os
import re
import time
import requests

log = logging.getLogger("sentinelai.gemini")

GEMINI_URL_TEMPLATE = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={key}"
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"


def get_gemini_key() -> str:
    return os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY") or ""


def get_groq_key() -> str:
    return os.getenv("GROQ_API_KEY") or ""


def get_gemini_model() -> str:
    return os.getenv("GEMINI_MODEL", "gemini-2.5-flash")


def get_groq_text_model() -> str:
    return os.getenv("TEXT_MODEL", "llama-3.3-70b-versatile")


def get_groq_vision_model() -> str:
    return os.getenv("VISION_MODEL", "qwen/qwen3.6-27b")


def _call_gemini(prompt: str, system_instruction: str = "", image_b64: str = None, mime_type: str = "image/png", temperature: float = 0.1) -> str:
    """Execute request against Google Gemini REST API."""
    key = get_gemini_key()
    if not key:
        raise ValueError("GEMINI_API_KEY is not configured")

    model = get_gemini_model()
    url = GEMINI_URL_TEMPLATE.format(model=model, key=key)
    
    parts = []
    if image_b64:
        parts.append({
            "inline_data": {
                "mime_type": mime_type,
                "data": image_b64
            }
        })
    parts.append({"text": prompt})

    payload = {
        "contents": [{"parts": parts}],
        "generationConfig": {
            "temperature": temperature,
            "responseMimeType": "application/json",
            "maxOutputTokens": 4096,
        }
    }

    if system_instruction:
        payload["systemInstruction"] = {
            "parts": [{"text": system_instruction}]
        }

    t0 = time.time()
    try:
        resp = requests.post(url, json=payload, timeout=25)
    except requests.exceptions.RequestException as err:
        log.error("Gemini connection error: %s", err)
        raise RuntimeError(f"Gemini API network/SSL failure: {err}") from err

    ms = round((time.time() - t0) * 1000)

    if resp.status_code != 200:
        log.error("Gemini API Error %s: %s", resp.status_code, resp.text[:400])
        raise RuntimeError(f"Gemini API returned HTTP {resp.status_code}: {resp.text[:200]}")

    data = resp.json()
    try:
        candidate = data["candidates"][0]
        text_out = candidate["content"]["parts"][0]["text"]
        log.info("Gemini OK | model=%s latency=%dms", model, ms)
        return text_out.strip()
    except (KeyError, IndexError) as err:
        log.error("Gemini unexpected response structure: %s", data)
        raise RuntimeError("Failed to parse response structure from Gemini API")


def _call_groq(prompt: str, system_instruction: str = "", image_b64: str = None, mime_type: str = "image/png", temperature: float = 0.1) -> str:
    """Fallback request against Groq API with 429 retry and network error handling."""
    groq_key = get_groq_key()
    if not groq_key:
        raise ValueError("Neither GEMINI_API_KEY nor GROQ_API_KEY is configured")

    # If image is attached, try vision model first
    if image_b64:
        data_uri = f"data:{mime_type};base64,{image_b64}"
        vision_messages = [
            {"role": "user", "content": [
                {"type": "image_url", "image_url": {"url": data_uri}},
                {"type": "text", "text": f"{system_instruction}\n\n{prompt}"}
            ]}
        ]
        
        vision_model = get_groq_vision_model()
        t0 = time.time()
        try:
            resp = requests.post(
                GROQ_URL,
                json={
                    "model": vision_model,
                    "messages": vision_messages,
                    "temperature": temperature,
                    "max_tokens": 2000
                },
                headers={"Authorization": f"Bearer {groq_key}"},
                timeout=25
            )
            if resp.status_code == 200:
                ms = round((time.time() - t0) * 1000)
                log.info("Groq Vision OK | model=%s latency=%dms", vision_model, ms)
                return resp.json()["choices"][0]["message"]["content"].strip()
            log.warning("Groq Vision returned HTTP %s. Falling back to text model...", resp.status_code)
        except requests.exceptions.RequestException as err:
            log.warning("Groq Vision network/SSL exception: %s. Falling back...", err)

    # Text model fallback path
    messages = []
    if system_instruction:
        messages.append({"role": "system", "content": system_instruction})
    messages.append({"role": "user", "content": prompt})

    for model in [get_groq_text_model(), "llama-3.1-8b-instant"]:
        for attempt in range(2):
            t0 = time.time()
            try:
                resp = requests.post(
                    GROQ_URL,
                    json={
                        "model": model,
                        "messages": messages,
                        "temperature": temperature,
                        "max_tokens": 2000
                    },
                    headers={"Authorization": f"Bearer {groq_key}"},
                    timeout=25
                )
            except requests.exceptions.RequestException as err:
                log.error("Groq connection exception for model %s (attempt %d): %s", model, attempt + 1, err)
                time.sleep(1)
                continue

            ms = round((time.time() - t0) * 1000)

            if resp.status_code == 200:
                content = resp.json()["choices"][0]["message"]["content"].strip()
                log.info("Groq OK | model=%s latency=%dms", model, ms)
                return content

            if resp.status_code == 429:
                log.warning("Groq 429 Rate Limit for model %s (attempt %d/2). Waiting 2 seconds...", model, attempt + 1)
                time.sleep(2)
                continue

            log.error("Groq API Error %s: %s", resp.status_code, resp.text[:400])
            break

    raise RuntimeError("AI service is currently unreachable or timed out. Falling back to rule-based engine.")


def generate_json_response(prompt: str, system_instruction: str = "", image_b64: str = None, mime_type: str = "image/png", temperature: float = 0.1) -> str:
    """Generate structured JSON output from Gemini (or Groq fallback), safely catching network errors."""
    gemini_key = get_gemini_key()
    groq_key = get_groq_key()

    if gemini_key:
        try:
            return _call_gemini(prompt, system_instruction, image_b64, mime_type, temperature)
        except Exception as exc:
            log.warning("Gemini API call failed (%s). Attempting Groq fallback if configured...", exc)

    if groq_key:
        try:
            return _call_groq(prompt, system_instruction, image_b64, mime_type, temperature)
        except Exception as exc:
            log.warning("Groq API call failed (%s). Returning empty response for heuristic fallback.", exc)

    log.warning("No operational LLM connection available. Triggering deterministic fallback response.")
    return ""

