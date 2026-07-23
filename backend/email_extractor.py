"""
SentinelAI — Email Feature Extractor Engine
Parses email text/RFC822 messages and extracts deterministic security signals.
"""

import re
from email import policy
from email.parser import Parser
from urllib.parse import urlparse

URGENT_TERMS = {
    "urgent", "immediately", "24 hours", "suspended", "locked", "expires",
    "final notice", "act now", "action required", "terminate", "unauthorized",
    "security alert", "warning", "compromised", "restrict"
}

CREDENTIAL_TERMS = {
    "password", "ssn", "social security", "otp", "one-time", "credit card",
    "card number", "pin", "credentials", "log in", "verify account", "bank details"
}

FINANCIAL_TERMS = {
    "wire transfer", "gift card", "bitcoin", "crypto", "unauthorized transaction",
    "refund", "invoice", "payment", "bank transfer", "overdue", "receipt"
}

GENERIC_GREETINGS = {
    "dear customer", "dear user", "valued customer", "dear account holder",
    "dear member", "dear sir/madam", "attention customer"
}

KNOWN_BRAND_DOMAINS = {
    "paypal.com", "microsoft.com", "google.com", "apple.com", "amazon.com",
    "netflix.com", "github.com", "chase.com", "wellsfargo.com", "bankofamerica.com"
}


def extract_email_features(raw_text: str) -> dict:
    """Extract structured security features from email content."""
    raw_text = raw_text.strip()
    
    # Try parsing headers if present
    parsed_msg = Parser(policy=policy.default).parsestr(raw_text)
    
    from_header = str(parsed_msg.get("From", "")).strip()
    reply_to_header = str(parsed_msg.get("Reply-To", "")).strip()
    subject_header = str(parsed_msg.get("Subject", "")).strip()
    
    # Extract email addresses using regex
    email_regex = r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"
    from_addrs = re.findall(email_regex, from_header)
    reply_to_addrs = re.findall(email_regex, reply_to_header)
    
    from_email = from_addrs[0] if from_addrs else ""
    reply_to_email = reply_to_addrs[0] if reply_to_addrs else ""
    
    from_domain = from_email.split("@")[1].lower() if "@" in from_email else ""
    reply_to_domain = reply_to_email.split("@")[1].lower() if "@" in reply_to_email else ""
    
    # Check address mismatch
    domain_mismatch = False
    if from_domain and reply_to_domain and from_domain != reply_to_domain:
        domain_mismatch = True

    # Extract URLs from body
    url_regex = r"https?://[^\s<>\"']+"
    extracted_urls = re.findall(url_regex, raw_text)
    
    url_domains = []
    for u in extracted_urls:
        try:
            dom = urlparse(u).netloc.lower()
            if dom:
                url_domains.append(dom)
        except Exception:
            pass

    # Keyword analysis (case-insensitive)
    lowered_body = raw_text.lower()
    
    urgent_matches = [t for t in URGENT_TERMS if t in lowered_body]
    credential_matches = [t for t in CREDENTIAL_TERMS if t in lowered_body]
    financial_matches = [t for t in FINANCIAL_TERMS if t in lowered_body]
    greeting_matches = [g for g in GENERIC_GREETINGS if g in lowered_body]
    
    # Brand impersonation check
    impersonation_flags = []
    for brand_domain in KNOWN_BRAND_DOMAINS:
        brand_name = brand_domain.split(".")[0]
        if brand_name in lowered_body and from_domain and not from_domain.endswith(brand_domain):
            impersonation_flags.append(f"Pretending to be {brand_name.capitalize()} but sent from {from_domain}")

    # Heuristic scoring
    score = 0
    signals = []

    if domain_mismatch:
        score += 35
        signals.append(f"From domain ({from_domain}) mismatches Reply-To domain ({reply_to_domain})")

    if impersonation_flags:
        score += 40
        signals.extend(impersonation_flags)

    if credential_matches:
        score += min(30, len(credential_matches) * 10)
        signals.append(f"Credential harvesting language: {', '.join(credential_matches)}")

    if urgent_matches:
        score += min(25, len(urgent_matches) * 8)
        signals.append(f"High urgency pressure phrasing: {', '.join(urgent_matches)}")

    if financial_matches:
        score += min(20, len(financial_matches) * 7)
        signals.append(f"Financial transaction keywords: {', '.join(financial_matches)}")

    if greeting_matches:
        score += 15
        signals.append(f"Impersonal greeting used ({greeting_matches[0]})")

    if extracted_urls:
        mismatched_url_domains = [d for d in url_domains if from_domain and not d.endswith(from_domain)]
        if mismatched_url_domains:
            score += 25
            signals.append(f"Contains links to third-party domains: {', '.join(set(mismatched_url_domains))}")

    score = max(0, min(100, score))

    return {
        "from_address": from_email,
        "reply_to_address": reply_to_email,
        "from_domain": from_domain,
        "reply_to_domain": reply_to_domain,
        "domain_mismatch": domain_mismatch,
        "subject": subject_header,
        "extracted_urls": extracted_urls[:10],
        "extracted_url_domains": list(set(url_domains)),
        "urgent_keywords": urgent_matches,
        "credential_keywords": credential_matches,
        "financial_keywords": financial_matches,
        "generic_greeting_detected": bool(greeting_matches),
        "brand_impersonation_flags": impersonation_flags,
        "heuristic_threat_score": score,
        "heuristic_signals": signals,
        "text_length": len(raw_text),
    }
