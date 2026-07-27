"""
SentinelAI Backend — FastAPI + Google Gemini API Threat Analysis Engine
Dynamic, input-specific cybersecurity threat intelligence scanner.
"""

import base64
import hashlib
import json
import logging
import os
import re
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import List, Optional

from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, field_validator

# Load local .env before loading modules
def load_local_env() -> None:
    """Load KEY=value pairs from backend/.env file."""
    env_path = Path(__file__).with_name(".env")
    if not env_path.is_file():
        return
    for raw_line in env_path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        if key:
            os.environ.setdefault(key, value)

load_local_env()

from url_extractor import extract_url_features
from email_extractor import extract_email_features
from conversation_extractor import extract_conversation_features
from screenshot_extractor import extract_screenshot_features
from gemini_client import generate_json_response, get_gemini_key, get_groq_key

# ── Logging ────────────────────────────────────────────────────────────────────
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
log = logging.getLogger("sentinelai")

# ── App ────────────────────────────────────────────────────────────────────────
app = FastAPI(title="SentinelAI API", version="3.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://sentinel-djsmrw8tr-jeffjeromejabez2024cse-7104s-projects.vercel.app",
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

MAX_IMG_BYTES = 10 * 1024 * 1024
history_store: List[dict] = []


# ── Pydantic models ────────────────────────────────────────────────────────────

class ScreenshotPayload(BaseModel):
    image_name: str = Field(default="screenshot.png")
    image_data: Optional[str] = None
    mime_type:  Optional[str] = Field(default="image/png")

class URLPayload(BaseModel):
    url: str
    @field_validator("url")
    @classmethod
    def validate_url(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("URL cannot be empty")
        if not re.match(r"^https?://", v, re.IGNORECASE):
            v = "https://" + v
        if len(v) > 2048:
            raise ValueError("URL too long (max 2048 chars)")
        return v

class EmailPayload(BaseModel):
    email: str
    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Email content must not be empty")
        return v[:20000]

class ConversationPayload(BaseModel):
    text: str
    @field_validator("text")
    @classmethod
    def validate_text(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Conversation content must not be empty")
        return v[:30000]

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatPayload(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = []
    @field_validator("message")
    @classmethod
    def validate_message(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Message must not be empty")
        return v

class ScanResponse(BaseModel):
    id: str
    scanType: str
    threatScore: int
    riskLevel: str
    confidenceScore: int
    detectedThreats: List[str]
    explanation: str
    recommendations: List[str]
    threatMeter: int
    scanTimestamp: str
    summary: str
    details: dict


# ── System Prompts ──────────────────────────────────────────────────────────────

SCAN_SYSTEM_PROMPT = """You are SentinelAI, an elite cybersecurity threat analysis engine.

CRITICAL RULES FOR THREAT SCORING:
- Respond with ONLY a valid JSON object.
- Calculate 'threat_score' (0 to 100) dynamically based strictly on extracted security evidence:
  • 0 to 15 (Safe): Official, legitimate, trusted domains (e.g. google.com, github.com), clean newsletters, safe links.
  • 16 to 40 (Low): Minor non-critical warnings (e.g. HTTP protocol on informational site).
  • 41 to 65 (Medium): Obfuscated links, shortened URLs, unknown domain with moderate entropy, mild pressure phrasing.
  • 66 to 85 (High): High-abuse TLDs (.tk, .xyz), domain/reply-to mismatches, unverified payment links, credential requests.
  • 86 to 100 (Critical): Active brand impersonation (e.g. paypal-login.tk), fake login screens, credential harvesting, malware links.
- 'risk_level' MUST be one of: "Safe" (0-20), "Low" (21-40), "Medium" (41-60), "High" (61-80), "Critical" (81-100).
- 'confidence_score' MUST reflect the clarity of evidence found (e.g. 85-98% for clear features).
- 'detected_threats' MUST explicitly list the specific technical threats found in this input.
- 'explanation' MUST directly cite the specific domain, protocol, text phrases, headers, or visual elements analyzed.

JSON Output Schema:
{
  "threat_score": <integer 0-100>,
  "risk_level": "<Safe|Low|Medium|High|Critical>",
  "confidence_score": <integer 0-100>,
  "detected_threats": ["<threat 1>", "<threat 2>"],
  "explanation": "<detailed explanation quoting specific input evidence>",
  "recommendations": ["<action 1>", "<action 2>"],
  "summary": "<one sentence summary referencing the target input>"
}"""

VISION_SCAN_PROMPT = """You are SentinelAI, an expert cybersecurity vision analyst.

Analyze this screenshot / visual image for cybersecurity risks:
- Inspect all visible text, address bar URLs, domain names, SSL certificate lock icons, form inputs, password fields, brand logos, and alert banners.
- Determine if this image depicts a fake login page, credential harvesting attempt, brand impersonation spoof, malware lure, or legitimate website.
- Respond with ONLY valid JSON according to the SCAN_SYSTEM_PROMPT schema."""

CONVERSATION_SYSTEM_PROMPT = """You are SentinelAI, an elite cybersecurity scam & social engineering threat analysis engine.

Analyze this complete chat/messaging conversation log (copied from WhatsApp, Telegram, Instagram, SMS, Discord, Email, or Messenger) for scam, fraud, and phishing behavior.

EVALUATION CRITERIA:
- Social engineering tactics: fear, extreme urgency, artificial scarcity, emotional manipulation, trust building, secrecy demands.
- Impersonation: Police, Customs, Government officials, Bank managers, Tech Support, Customer Care, Delivery couriers.
- Fraud Schemes:
  • Prize/Lottery scams (KBC, lucky draw fees)
  • Bank & UPI scams (collect requests, fake payment screenshots, verification links)
  • Identity theft & Credential harvesting (OTP, PIN, Password, Aadhaar, PAN, CVV requests)
  • Investment & Crypto schemes (guaranteed 500% profit, Telegram trading task)
  • Job/Internship scams (data entry registration fee, task app deposit)
  • Romance scams (online partner requesting urgent financial assistance)
  • Tech Support & Refund scams (overpayment refund via AnyDesk/TeamViewer remote access)
  • Courier & Customs extortion (parcel stuck with contraband, instant penalty)
  • Loan & Marketplace scams (advance booking fee, loan processing fee)

CALIBRATED THREAT SCORING:
- 0 to 20 (Safe): Normal, friendly, or authentic business/personal conversation with zero fraud indicators.
- 21 to 40 (Low): Minor unverified claims or informal chat without sensitive requests.
- 41 to 60 (Medium): Unverified offers, suspicious links, unknown sender asking for non-sensitive info, mild pressure.
- 61 to 80 (High): Clear scam indicators (unverified payment requests, UPI IDs, fee demands, urgency, remote control app installation).
- 81 to 100 (Critical): Active credential theft (OTP/PIN/CVV/Password requests), law enforcement extortion, fake arrest threats, direct fraud.

Respond with ONLY valid JSON according to the SCAN_SYSTEM_PROMPT schema."""


# ── JSON Extractor Helper ──────────────────────────────────────────────────────

def extract_json(text: str) -> Optional[dict]:
    """Robustly extract JSON object from LLM response string."""
    text = re.sub(r"<think>.*?</think>", "", text, flags=re.DOTALL).strip()
    
    # 1. Direct parse
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    # 2. Code fences with greedy match
    m = re.search(r"```(?:json)?\s*(\{.*\})\s*```", text, re.DOTALL)
    if m:
        try:
            return json.loads(m.group(1))
        except json.JSONDecodeError:
            pass

    # 3. Outer brace extraction
    first_brace = text.find('{')
    last_brace = text.rfind('}')
    if first_brace != -1 and last_brace > first_brace:
        candidate = text[first_brace:last_brace + 1]
        try:
            return json.loads(candidate)
        except json.JSONDecodeError:
            cleaned = re.sub(r",\s*([\]}])", r"\1", candidate)
            try:
                return json.loads(cleaned)
            except json.JSONDecodeError:
                pass

    log.warning("JSON extraction failed. Raw text snippet: %s", text[:300])
    return None


def parse_scan(text: str, scan_type: str, fallback_score: int = 50, extracted_signals: Optional[List[str]] = None, target_name: str = "") -> dict:
    """Parse and validate LLM output into structured scan dict with fallback signal synthesis."""
    data = extract_json(text) if text else None
    if not data:
        log.warning("No JSON response parsed for %s. Using heuristic signal synthesis.", scan_type)
        data = {}

    threat_score = data.get("threat_score")
    if threat_score is None:
        threat_score = data.get("score") or data.get("threatScore") or fallback_score

    try:
        threat_score = int(threat_score)
    except (ValueError, TypeError):
        threat_score = fallback_score

    threat_score = max(0, min(100, threat_score))
    
    confidence = data.get("confidence_score") or data.get("confidence") or (90 if extracted_signals else 85)
    try:
        confidence = int(confidence)
    except (ValueError, TypeError):
        confidence = 85
    confidence = max(0, min(100, confidence))

    threats = data.get("detected_threats") or data.get("threats") or data.get("visual_evidence") or []
    if not threats and extracted_signals:
        threats = extracted_signals
    elif not threats:
        if threat_score <= 20:
            threats = ["No technical security anomalies or threat patterns detected."]
        else:
            threats = ["Elevated risk factors detected during security heuristic analysis."]

    explanation = str(data.get("explanation") or data.get("analysis_summary") or data.get("summary") or "").strip()
    if not explanation or explanation == "Security assessment completed.":
        if extracted_signals:
            explanation = f"Security analysis of target '{target_name or scan_type}' identified key signals: {'; '.join(extracted_signals)}."
        else:
            explanation = f"Threat assessment completed for target {scan_type} with a calculated threat score of {threat_score}/100."

    recommendations = data.get("recommendations") or []
    if not recommendations:
        if threat_score <= 20:
            recommendations = ["Destination appears safe.", "Maintain standard cybersecurity hygiene."]
        elif threat_score <= 60:
            recommendations = ["Exercise caution before entering credentials or executing downloads.", "Verify sender and domain authenticity."]
        else:
            recommendations = ["DO NOT visit or interact with this link/content.", "Report this incident to your security team or anti-phishing registry."]

    summary = str(data.get("summary") or "").strip()
    if not summary:
        summary = f"{scan_type.capitalize()} scan completed with threat score {threat_score}/100."

    if not isinstance(threats, list):
        threats = [str(threats)]
    if not isinstance(recommendations, list):
        recommendations = [str(recommendations)]

    if threat_score <= 20:
        risk_level = "Safe"
    elif threat_score <= 40:
        risk_level = "Low"
    elif threat_score <= 60:
        risk_level = "Medium"
    elif threat_score <= 80:
        risk_level = "High"
    else:
        risk_level = "Critical"

    return {
        "threat_score": threat_score,
        "risk_level": risk_level,
        "confidence": confidence,
        "detected_threats": [str(t) for t in threats if t],
        "explanation": explanation,
        "recommendations": [str(r) for r in recommendations if r],
        "summary": summary,
    }


def validate_image_payload(image_data: Optional[str], mime_type: Optional[str]) -> tuple[str, str]:
    if not image_data:
        raise HTTPException(422, "An image is required for this scan.")
    try:
        decoded_image = base64.b64decode(image_data, validate=True)
    except (ValueError, TypeError):
        raise HTTPException(422, "Image data must be valid base64.")
    if not decoded_image:
        raise HTTPException(422, "Image data is empty.")
    if len(decoded_image) > MAX_IMG_BYTES:
        raise HTTPException(413, "Image exceeds 10 MB limit.")

    mime = (mime_type or "image/png").lower()
    if mime not in {"image/png", "image/jpeg", "image/jpg", "image/webp"}:
        raise HTTPException(422, "Unsupported image type. Use PNG, JPEG, or WebP.")
    return image_data, mime


def build_result(scan_type: str, details: dict, threat_score: int, risk_level: str,
                 confidence: int, detected_threats: List[str], explanation: str,
                 recommendations: List[str], summary: str) -> ScanResponse:
    scan_id = hashlib.sha256(
        f"{scan_type}:{json.dumps(details, sort_keys=True)}:{datetime.now(timezone.utc).isoformat()}".encode()
    ).hexdigest()[:12]
    
    return ScanResponse(
        id=scan_id,
        scanType=scan_type,
        threatScore=threat_score,
        riskLevel=risk_level,
        confidenceScore=confidence,
        detectedThreats=detected_threats or ["No specific threats identified."],
        explanation=explanation,
        recommendations=recommendations or ["No immediate action required."],
        threatMeter=threat_score,
        scanTimestamp=datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC"),
        summary=summary,
        details=details,
    )


# ── Routes ─────────────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {
        "status": "ok",
        "gemini_configured": bool(get_gemini_key()),
        "groq_configured": bool(get_groq_key()),
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@app.post("/scan/url", response_model=ScanResponse)
def scan_url(payload: URLPayload):
    url = payload.url
    log.info("URL scan request: %s", url)

    # 1. Extract deterministic heuristics
    features = extract_url_features(url)

    # 2. Formulate evidence-based prompt
    prompt = f"""Perform cybersecurity threat analysis on this target URL:

URL: {url}

DETERMINISTIC EXTRACTED SECURITY SIGNALS:
- Protocol: {features['scheme'].upper()} (Is HTTPS: {features['is_https']})
- Hostname: {features['hostname']}
- Domain: {features['domain']} (TLD: .{features['tld']})
- Suspicious Abuse TLD: {features['is_suspicious_tld']}
- Host is Raw IP Address: {features['is_ip_address']}
- Is Known Shortener Service: {features['is_url_shortener']}
- Is Verified Trusted Domain: {features['is_trusted_domain']}
- Domain Entropy Score: {features['domain_entropy']} (Randomness measure)
- Phishing/Sensitive Keywords Found: {features['keywords_found']}
- Targeted Impersonated Brands: {features['impersonated_brands']}
- Typosquatting Indicators: {features['typosquatting_indicators']}
- Automated Heuristic Signals: {features['heuristic_signals']}
- Baseline Heuristic Threat Score: {features['heuristic_threat_score']} / 100

EVALUATION INSTRUCTIONS:
1. Synthesize the extracted technical signals with your domain security knowledge.
2. Ensure threat_score accurately reflects THIS specific URL:
   - If trusted domain (e.g. google.com, github.com) -> score 0-10.
   - If impersonated brand (e.g. paypal-security.tk) -> score 85-98.
3. Your explanation MUST explicitly mention the specific domain, TLD, protocol, or impersonation target found."""

    raw_response = generate_json_response(prompt=prompt, system_instruction=SCAN_SYSTEM_PROMPT)
    data = parse_scan(
        raw_response,
        "url",
        fallback_score=features['heuristic_threat_score'],
        extracted_signals=features['heuristic_signals'],
        target_name=features['domain'] or url
    )

    result = build_result(
        scan_type="url",
        details={"url": url, "extractedFeatures": features},
        **data
    )
    history_store.append(result.model_dump())
    return result


@app.post("/scan/email", response_model=ScanResponse)
def scan_email(payload: EmailPayload):
    content = payload.email
    log.info("Email scan request (%d chars)", len(content))

    # 1. Extract deterministic heuristics
    features = extract_email_features(content)

    # 2. Formulate evidence-based prompt
    prompt = f"""Perform cybersecurity threat analysis on this email message:

--- START EMAIL CONTENT ---
{content[:8000]}
--- END EMAIL CONTENT ---

DETERMINISTIC EXTRACTED SECURITY SIGNALS:
- From Sender Address: {features['from_address'] or 'Not specified'}
- Reply-To Address: {features['reply_to_address'] or 'Not specified'}
- Domain Mismatch (From vs Reply-To): {features['domain_mismatch']}
- Subject Header: {features['subject'] or 'None'}
- Embedded Links & Domains: {features['extracted_url_domains']}
- Impersonation Flags: {features['brand_impersonation_flags']}
- Credential Harvesting Keywords: {features['credential_keywords']}
- High-Urgency Pressure Terms: {features['urgent_keywords']}
- Financial Request Terms: {features['financial_keywords']}
- Generic Greeting Detected: {features['generic_greeting_detected']}
- Automated Heuristic Signals: {features['heuristic_signals']}
- Baseline Heuristic Threat Score: {features['heuristic_threat_score']} / 100

EVALUATION INSTRUCTIONS:
1. Assess the email content using the extracted signals.
2. Determine threat_score based on actual evidence:
   - Safe newsletter/communication -> score 5-15.
   - Phishing attempt with credential/urgent/impersonation triggers -> score 80-98.
3. Explanation MUST quote or reference specific sender addresses, domains, or urgency terms."""

    raw_response = generate_json_response(prompt=prompt, system_instruction=SCAN_SYSTEM_PROMPT)
    data = parse_scan(
        raw_response,
        "email",
        fallback_score=features['heuristic_threat_score'],
        extracted_signals=features['heuristic_signals'],
        target_name=features['from_address'] or "Email Message"
    )

    result = build_result(
        scan_type="email",
        details={
            "emailPreview": content[:200],
            "emailLength": len(content),
            "extractedFeatures": features
        },
        **data
    )
    history_store.append(result.model_dump())
    return result


@app.post("/scan/conversation", response_model=ScanResponse)
def scan_conversation(payload: ConversationPayload):
    text = payload.text
    log.info("Conversation scan request (%d chars)", len(text))

    # 1. Extract deterministic heuristics
    features = extract_conversation_features(text)

    # 2. Formulate evidence-based prompt
    prompt = f"""Perform cybersecurity scam & social engineering threat analysis on this conversation log:

--- START CONVERSATION LOG ---
{text[:12000]}
--- END CONVERSATION LOG ---

DETERMINISTIC EXTRACTED SECURITY SIGNALS:
- Messages Count: {features['messages']} | Length: {features['conversation_length']} chars
- Phone Numbers Found: {features['phone_list']}
- Email Addresses Found: {features['emails']}
- UPI Payment Identifiers: {features['upi_list']}
- Bank Account Mentions: {features['bank_account_mentions']}
- Sensitive Requests: OTP ({features['otp_mentions']}), PIN ({features['pin_mentions']}), Password ({features['password_mentions']})
- Personal Data Requests: ID Proof ({features['requests_id_proof']}), Aadhaar ({features['requests_aadhaar']}), PAN ({features['requests_pan']}), Card/CVV ({features['requests_cvv']})
- Remote Access Tools Requested: AnyDesk/TeamViewer ({features['requests_screen_sharing']})
- Impersonation Flags: Authority ({features['authority']}), Police ({features['police_impersonation']}), Bank ({features['bank_impersonation']}), Support ({features['support_impersonation']})
- Psychological Tactics: Urgency ({features['urgency']}), Fear ({features['fear']}), Threats ({features['threats']})
- Financial Scheme Indicators: Crypto ({features['crypto']}), Investment ({features['investment']}), Lottery ({features['lottery_words']}), Refund ({features['refund']})
- Links Found: Total ({features['links']}), Shortened ({features['shortened_urls']}), Suspicious Domains ({features['suspicious_domains']})
- Total Suspicious Indicators: {features['total_suspicious_indicators']}
- Heuristic Security Signals: {features['heuristic_signals']}
- Baseline Heuristic Threat Score: {features['heuristic_threat_score']} / 100

EVALUATION INSTRUCTIONS:
1. Synthesize the extracted signals with the conversation text to identify scam and fraud behavior.
2. Determine threat_score based on concrete evidence:
   - Safe, normal chat with zero fraud indicators -> score 0-15.
   - Active scam attempt (OTP theft, authority extortion, UPI fee trap, fake investment, remote access) -> score 75-100.
3. Explanation MUST quote or reference specific text lines, phone/UPI details, or pressure tactics found."""

    raw_response = generate_json_response(prompt=prompt, system_instruction=CONVERSATION_SYSTEM_PROMPT)
    data = parse_scan(raw_response, "conversation", fallback_score=features['heuristic_threat_score'])

    result = build_result(
        scan_type="conversation",
        details={
            "conversationPreview": text[:200],
            "conversationLength": len(text),
            "extractedFeatures": features
        },
        **data
    )
    history_store.append(result.model_dump())
    return result


@app.post("/scan/screenshot", response_model=ScanResponse)
def scan_screenshot(payload: ScreenshotPayload):
    image_name = payload.image_name
    log.info("Screenshot scan request: %s", image_name)
    image_data, mime = validate_image_payload(payload.image_data, payload.mime_type)

    # 1. Extract visual features
    visual_features = extract_screenshot_features(image_data, image_name)

    # 2. Multimodal vision call
    prompt = f"""Perform a comprehensive cybersecurity threat analysis on this screenshot named '{image_name}':

EXTRACTED SCREENSHOT SIGNALS:
- Baseline Heuristic Threat Score: {visual_features.get('heuristic_threat_score', 15)} / 100
- Security Signals: {visual_features.get('heuristic_signals', [])}

EVALUATION INSTRUCTIONS:
1. Read all visible text, address bar URLs, domain names, SSL certificate indicators, and form inputs in the screenshot.
2. Check for visual phishing cues: credential harvesting forms (username/password fields), brand logo impersonation (e.g. fake Microsoft/PayPal/Google pages), security warnings, or mismatched URLs.
3. Calculate threat_score dynamically based strictly on visual evidence in this specific screenshot:
   - If the screenshot shows a safe, official website or standard homepage -> Threat Score 0 to 15 (Safe).
   - If the screenshot shows a login form on an unverified site, security alert banner, or credential request -> Threat Score 75 to 98 (High/Critical)."""

    raw_response = generate_json_response(
        prompt=prompt,
        system_instruction=VISION_SCAN_PROMPT,
        image_b64=image_data,
        mime_type=mime
    )

    data = parse_scan(
        raw_response,
        "screenshot",
        fallback_score=visual_features.get("heuristic_threat_score", 15),
        extracted_signals=visual_features.get("heuristic_signals", []),
        target_name=image_name
    )

    result = build_result(
        scan_type="screenshot",
        details={
            "imageName": image_name,
            "mimeType": mime,
            "visualFeatures": visual_features,
            "extractedFeatures": visual_features
        },
        **data
    )
    history_store.append(result.model_dump())
    return result


@app.post("/chat")
def chat(payload: ChatPayload):
    log.info("Chat request: %s", payload.message[:80])

    prompt_lines = [f"User Question: {payload.message}\n"]
    if payload.history:
        prompt_lines.append("Previous Conversation History:")
        for msg in payload.history[-8:]:
            prompt_lines.append(f"{msg.role.capitalize()}: {msg.content}")

    full_prompt = "\n".join(prompt_lines)
    system_instruction = "You are SentinelAI, an expert cybersecurity assistant. Provide clear, accurate, markdown-formatted guidance on cybersecurity, phishing, and threat protection."

    raw = generate_json_response(full_prompt, system_instruction)
    reply = re.sub(r"</?think>", "", raw).strip() if raw else ""
    if not reply:
        reply = "SentinelAI Assistant is operating in direct response mode. For instant link, email, or chat analysis, submit your targets to our specialized threat scanners."

    return {
        "reply": reply,
        "suggestions": [
            "How do I identify a phishing email?",
            "What makes a URL suspicious?",
            "How does SentinelAI analyze threats?",
        ]
    }


@app.get("/history")
def get_history():
    return history_store


@app.delete("/history/{scan_id}")
def delete_history(scan_id: str):
    global history_store
    before = len(history_store)
    history_store = [e for e in history_store if e["id"] != scan_id]
    return {"deleted": before != len(history_store)}


@app.exception_handler(RequestValidationError)
async def validation_error_handler(request: Request, exc: RequestValidationError):
    errors = exc.errors()
    msg = errors[0].get("msg", "Invalid input") if errors else "Invalid input"
    msg = re.sub(r"^Value error,\s*", "", str(msg))
    return JSONResponse(status_code=422, content={"detail": msg})


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    log.error("Unhandled exception on %s %s: %s", request.method, request.url.path, exc, exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": f"Internal Server Error: {str(exc)}"},
        headers={"Access-Control-Allow-Origin": "*"}
    )
