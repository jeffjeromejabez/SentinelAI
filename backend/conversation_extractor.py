"""
SentinelAI — Scam Conversation Feature Extractor Engine
Parses chat/messaging text logs and extracts deterministic security signals.
"""

import re
from urllib.parse import urlparse

# ── Feature Sets & Keyword Libraries ──────────────────────────────────────────

URGENCY_KEYWORDS = {
    "urgent", "urgently", "immediately", "right now", "within 10 minutes",
    "within 1 hour", "today itself", "quick", "hurry", "asap", "limited time",
    "expires soon", "last chance", "before midnight", "action required"
}

FEAR_KEYWORDS = {
    "suspended", "blocked", "terminated", "arrested", "warrant", "legal action",
    "court order", "police case", "frozen", "deactivated", "penalized", "fine",
    "penalty", "jail", "investigation", "seized", "customs hold"
}

THREAT_KEYWORDS = {
    "will block", "will arrest", "will inform police", "lawsuit", "complaint filed",
    "report to cbi", "cyber crime cell", "account closing", "cut off line"
}

GIFT_WORDS = {"gift", "free gift", "reward", "cashback", "bonus", "voucher", "claim"}
PRIZE_WORDS = {"prize", "winner", "won", "congratulations", "lucky draw", "jackpot"}
LOTTERY_WORDS = {"lottery", "kbc", "random selection", "lucky customer", "mega draw"}

CRYPTO_WORDS = {
    "crypto", "bitcoin", "btc", "usdt", "binance", "mining", "wallet",
    "doubling", "crypto trading", "forex", "daily return", "guaranteed profit"
}

INVESTMENT_WORDS = {
    "investment", "high returns", "200% return", "500% profit", "guaranteed income",
    "work from home", "part time job", "like youtube videos", "telegram task",
    "schema", "deposit now", "double your money"
}

REMOTE_ACCESS_WORDS = {
    "anydesk", "teamviewer", "quicksupport", "rustdesk", "screen share",
    "download app", "install apk", "remote access", "zoho assist"
}

REFUND_WORDS = {
    "refund", "overpayment", "wrong transfer", "cashback failed", "reimbursement",
    "return payment", "money pending"
}

GOVT_IMPERSONATION = {
    "income tax", "customs department", "cbi", "fbi", "police department",
    "ministry", "rbi", "reserve bank", "government officer", "cyber cell"
}

POLICE_IMPERSONATION = {
    "police", "inspector", "sub-inspector", "cyber police", "police officer",
    "head constable", "dgp", "crime branch"
}

BANK_IMPERSONATION = {
    "sbi", "hdfc", "icici", "axis bank", "citi bank", "bank manager",
    "bank officer", "head office", "yono", "credit card department"
}

SUPPORT_IMPERSONATION = {
    "whatsapp support", "telegram support", "customer care", "helpdesk",
    "technical support", "service agent", "support team"
}

AUTHORITY_IMPERSONATION = GOVT_IMPERSONATION | POLICE_IMPERSONATION | BANK_IMPERSONATION | SUPPORT_IMPERSONATION

PERSONAL_INFO_REQUESTS = {
    "send your name", "full name", "address", "dob", "date of birth",
    "mother name", "personal details", "verify identity"
}

ID_PROOF_REQUESTS = {"id proof", "identity document", "gov id", "photo id"}
AADHAAR_REQUESTS = {"aadhaar", "aadhar", "aadhaar card", "uidai", "12 digit number"}
PAN_REQUESTS = {"pan card", "pan number", "pancard"}

CARD_DETAILS_REQUESTS = {
    "card number", "debit card", "credit card", "expiry date", "atm card",
    "16 digit card"
}

CVV_REQUESTS = {"cvv", "cvv2", "security code", "back of card", "3 digit code"}
OTP_REQUESTS = {"otp", "one time password", "verification code", "share code", "enter otp"}
PIN_REQUESTS = {"pin", "atm pin", "upi pin", "secret pin", "passcode"}
PASSWORD_REQUESTS = {"password", "login password", "netbanking password", "pass phrase"}

PAYMENT_REQUESTS = {
    "send money", "pay fee", "processing fee", "registration fee", "tax fee",
    "transfer amount", "pay advance", "scan qr", "pay via upi", "deposit fee"
}

VERIFICATION_REQUESTS = {
    "verify account", "verify now", "kyc update", "update kyc", "link aadhaar",
    "complete verification", "confirm details"
}

SUSPICIOUS_DOMAINS_TLDS = {".tk", ".xyz", ".top", ".club", ".work", ".click", ".link", ".info", ".site", ".online", ".live"}
SHORTENED_DOMAINS = {"bit.ly", "tinyurl.com", "t.co", "goo.gl", "is.gd", "buff.ly", "rb.gy", "cutt.ly", "shorturl.at"}


def extract_conversation_features(text: str) -> dict:
    """
    Analyzes raw conversation log text and extracts structured risk metrics and indicators.
    """
    raw_text = text.strip()
    lowered = raw_text.lower()
    lines = [l.strip() for l in raw_text.splitlines() if l.strip()]

    # 1. Basic structural metrics
    message_count = len(lines)
    conversation_length = len(raw_text)

    # 2. Extract URLs
    url_regex = r"https?://[^\s<>\"']+"
    urls = re.findall(url_regex, raw_text)
    url_count = len(urls)

    shortened_url_count = 0
    suspicious_domain_count = 0

    for u in urls:
        try:
            parsed = urlparse(u)
            domain = parsed.netloc.lower()
            if any(domain.endswith(short) or domain == short for short in SHORTENED_DOMAINS):
                shortened_url_count += 1
            if any(domain.endswith(tld) for tld in SUSPICIOUS_DOMAINS_TLDS):
                suspicious_domain_count += 1
        except Exception:
            pass

    # 3. Extract contact & payment identifiers
    phone_regex = r"(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\b\d{10}\b"
    phones = list(set(re.findall(phone_regex, raw_text)))

    email_regex = r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"
    emails = list(set(re.findall(email_regex, raw_text)))

    upi_regex = r"\b[a-zA-Z0-9._-]+@(ybl|oksbi|okaxis|icici|paytm|upi|apl|axl|sbi)\b"
    upi_matches = list(set([m.group(0) for m in re.finditer(upi_regex, lowered)]))

    # Bank account mentions
    bank_acc_regex = r"\b(?:account|acc|a/c)\s*(?:no|number)?[:.\s]*\d{9,18}\b"
    bank_acc_mentions = len(re.findall(bank_acc_regex, lowered))

    # 4. Keyword counts
    def count_matches(keywords_set: set) -> int:
        return sum(1 for kw in keywords_set if kw in lowered)

    def find_matched_terms(keywords_set: set) -> list:
        return [kw for kw in keywords_set if kw in lowered]

    urgency_matches = find_matched_terms(URGENCY_KEYWORDS)
    fear_matches = find_matched_terms(FEAR_KEYWORDS)
    threat_matches = find_matched_terms(THREAT_KEYWORDS)

    gift_matches = find_matched_terms(GIFT_WORDS)
    prize_matches = find_matched_terms(PRIZE_WORDS)
    lottery_matches = find_matched_terms(LOTTERY_WORDS)

    crypto_matches = find_matched_terms(CRYPTO_WORDS)
    investment_matches = find_matched_terms(INVESTMENT_WORDS)
    remote_matches = find_matched_terms(REMOTE_ACCESS_WORDS)
    refund_matches = find_matched_terms(REFUND_WORDS)

    govt_matches = find_matched_terms(GOVT_IMPERSONATION)
    police_matches = find_matched_terms(POLICE_IMPERSONATION)
    bank_matches = find_matched_terms(BANK_IMPERSONATION)
    support_matches = find_matched_terms(SUPPORT_IMPERSONATION)
    authority_matches = list(set(govt_matches + police_matches + bank_matches + support_matches))

    # Requests
    otp_matches = find_matched_terms(OTP_REQUESTS)
    pin_matches = find_matched_terms(PIN_REQUESTS)
    password_matches = find_matched_terms(PASSWORD_REQUESTS)

    personal_info_matches = find_matched_terms(PERSONAL_INFO_REQUESTS)
    id_proof_matches = find_matched_terms(ID_PROOF_REQUESTS)
    aadhaar_matches = find_matched_terms(AADHAAR_REQUESTS)
    pan_matches = find_matched_terms(PAN_REQUESTS)
    card_matches = find_matched_terms(CARD_DETAILS_REQUESTS)
    cvv_matches = find_matched_terms(CVV_REQUESTS)

    payment_req_matches = find_matched_terms(PAYMENT_REQUESTS)
    verification_req_matches = find_matched_terms(VERIFICATION_REQUESTS)

    # Behavioral indicators
    repeated_payment_reqs = len(payment_req_matches) > 1
    repeated_verification_reqs = len(verification_req_matches) > 1

    # 5. Heuristic threat score & signal calculation
    score = 0
    signals = []

    if otp_matches or pin_matches or password_matches or cvv_matches:
        score += 45
        matched_creds = list(set(otp_matches + pin_matches + password_matches + cvv_matches))
        signals.append(f"Direct request for sensitive credentials ({', '.join(matched_creds)})")

    if remote_matches:
        score += 40
        signals.append(f"Remote desktop software / screen sharing requested ({', '.join(remote_matches)})")

    if upi_matches:
        score += 25
        signals.append(f"UPI payment identifier found ({', '.join(upi_matches)})")

    if payment_req_matches:
        score += 30
        signals.append(f"Financial payment / fee request detected ({', '.join(payment_req_matches)})")

    if authority_matches:
        score += 30
        signals.append(f"Authority or organizational impersonation ({', '.join(authority_matches[:3])})")

    if urgency_matches:
        score += min(25, len(urgency_matches) * 8)
        signals.append(f"High urgency and pressure tactics ({', '.join(urgency_matches[:3])})")

    if fear_matches or threat_matches:
        score += min(30, (len(fear_matches) + len(threat_matches)) * 10)
        signals.append(f"Fear or coercive threat language ({', '.join((fear_matches + threat_matches)[:3])})")

    if prize_matches or lottery_matches or gift_matches:
        score += 30
        signals.append(f"Lottery or prize scam indicators ({', '.join((prize_matches + lottery_matches + gift_matches)[:3])})")

    if crypto_matches or investment_matches:
        score += 30
        signals.append(f"High-yield investment / crypto profit scheme ({', '.join((crypto_matches + investment_matches)[:3])})")

    if suspicious_domain_count > 0 or shortened_url_count > 0:
        score += 25
        signals.append(f"Contains suspicious or shortened URLs ({url_count} total link(s))")

    if aadhaar_matches or pan_matches or card_matches:
        score += 25
        signals.append("Requests for sensitive government ID / payment card details")

    score = max(0, min(100, score))

    total_indicators = len(signals)

    return {
        "messages": message_count,
        "conversation_length": conversation_length,
        "links": url_count,
        "shortened_urls": shortened_url_count,
        "suspicious_domains": suspicious_domain_count,
        "phones": len(phones),
        "phone_list": phones[:5],
        "emails": len(emails),
        "upi": len(upi_matches),
        "upi_list": upi_matches,
        "bank_account_mentions": bank_acc_mentions,
        "otp_mentions": len(otp_matches),
        "pin_mentions": len(pin_matches),
        "password_mentions": len(password_matches),
        "gift_words": len(gift_matches),
        "prize_words": len(prize_matches),
        "lottery_words": len(lottery_matches),
        "urgency": len(urgency_matches),
        "fear": len(fear_matches),
        "threats": len(threat_matches),
        "crypto": len(crypto_matches),
        "investment": len(investment_matches),
        "remote_access": len(remote_matches),
        "refund": len(refund_matches),
        "govt_impersonation": bool(govt_matches),
        "police_impersonation": bool(police_matches),
        "bank_impersonation": bool(bank_matches),
        "support_impersonation": bool(support_matches),
        "authority": len(authority_matches),
        "repeated_requests": repeated_payment_reqs or repeated_verification_reqs,
        "repeated_payment_requests": repeated_payment_reqs,
        "repeated_verification_requests": repeated_verification_reqs,
        "requests_personal_info": bool(personal_info_matches),
        "requests_id_proof": bool(id_proof_matches),
        "requests_aadhaar": bool(aadhaar_matches),
        "requests_pan": bool(pan_matches),
        "requests_card_details": bool(card_matches),
        "requests_cvv": bool(cvv_matches),
        "requests_screen_sharing": bool(remote_matches),
        "total_suspicious_indicators": total_indicators,
        "heuristic_threat_score": score,
        "heuristic_signals": signals,
    }
