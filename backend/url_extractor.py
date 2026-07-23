"""
SentinelAI — URL Feature Extractor Engine
Extracts deterministic heuristics from URLs for threat analysis.
"""

import math
import re
from ipaddress import ip_address
from urllib.parse import parse_qs, unquote, urlparse

SUSPICIOUS_TLDS = {
    "tk", "ml", "ga", "gq", "cf", "xyz", "top", "click", "work", "zip", "mov",
    "country", "cc", "buzz", "surf", "link", "cam", "icu", "rest", "fit", "monster"
}

URL_SHORTENERS = {
    "bit.ly", "tinyurl.com", "t.co", "goo.gl", "ow.ly", "is.gd",
    "buff.ly", "cutt.ly", "rebrand.ly", "shorturl.at", "v.gd"
}

TRUSTED_DOMAINS = {
    "google.com", "github.com", "openai.com", "microsoft.com", "apple.com",
    "amazon.com", "paypal.com", "youtube.com", "wikipedia.org", "linkedin.com",
    "twitter.com", "x.com", "facebook.com", "instagram.com", "netflix.com"
}

KNOWN_BRANDS = {
    "paypal", "google", "microsoft", "apple", "amazon", "github",
    "facebook", "instagram", "netflix", "chase", "bankofamerica", "wellsfargo"
}

SUSPICIOUS_KEYWORDS = {
    "login", "verify", "verification", "secure", "account", "update", "confirm",
    "password", "signin", "banking", "wallet", "suspended", "limited", "unlock",
    "urgent", "otp", "re-activate", "credential", "auth", "security"
}

TYPOSQUAT_PATTERNS = [
    (r"paypa[l1i]", "paypal"),
    (r"micros[o0]ft", "microsoft"),
    (r"g[o0]{2}gle", "google"),
    (r"am[a0]z[o0]n", "amazon"),
    (r"app[l1]e", "apple"),
    (r"netfl[i1]x", "netflix"),
]


def calculate_entropy(text: str) -> float:
    """Calculate Shannon entropy of a string to detect randomness."""
    if not text:
        return 0.0
    prob = [float(text.count(c)) / len(text) for c in set(text)]
    return round(-sum(p * math.log2(p) for p in prob), 2)


def is_ip(hostname: str) -> bool:
    """Check if hostname is a raw IP address."""
    try:
        ip_address(hostname.strip("[]"))
        return True
    except ValueError:
        return False


def extract_url_features(url: str) -> dict:
    """Extract full deterministic feature dictionary from a URL string."""
    url = url.strip()
    parsed = urlparse(url)
    scheme = parsed.scheme.lower()
    netloc = parsed.netloc.lower()
    path = parsed.path
    query = parsed.query
    
    # Strip port if present
    hostname = netloc.split(":")[0] if ":" in netloc else netloc

    # Extract domain, subdomain, tld
    parts = hostname.split(".")
    if is_ip(hostname):
        tld = ""
        domain = hostname
        subdomains = []
    elif len(parts) >= 2:
        tld = parts[-1]
        domain = ".".join(parts[-2:])
        subdomains = parts[:-2]
    else:
        tld = ""
        domain = hostname
        subdomains = []

    # Features check
    is_https = (scheme == "https")
    suspicious_tld = tld in SUSPICIOUS_TLDS
    is_short = hostname in URL_SHORTENERS
    is_trusted = domain in TRUSTED_DOMAINS
    is_ip_host = is_ip(hostname)

    # Keywords detection
    full_string = f"{hostname}{path}{query}".lower()
    keywords_found = [kw for kw in SUSPICIOUS_KEYWORDS if kw in full_string]

    # Brand impersonation check
    impersonated_brands = []
    for brand in KNOWN_BRANDS:
        if brand in full_string and not domain.endswith(f"{brand}.com") and not domain == f"{brand}.com":
            impersonated_brands.append(brand)

    # Typosquatting check
    typosquat_detected = []
    for pattern, brand in TYPOSQUAT_PATTERNS:
        if re.search(pattern, hostname) and brand not in domain:
            typosquat_detected.append(f"Lookalike for {brand}")

    # Special characters
    at_symbol_count = url.count("@")
    hyphen_count_in_domain = domain.count("-")
    double_slash_in_path = "//" in path
    entropy_score = calculate_entropy(domain)

    # Risk signals score heuristic (0 to 100 base)
    heuristic_score = 0
    signals = []

    if not is_https:
        heuristic_score += 15
        signals.append("Insecure protocol (HTTP)")

    if is_ip_host:
        heuristic_score += 40
        signals.append("Host is raw IP address")

    if suspicious_tld:
        heuristic_score += 35
        signals.append(f"Suspicious high-abuse TLD (.{tld})")

    if is_short:
        heuristic_score += 25
        signals.append("URL shortener used (destination masked)")

    if impersonated_brands:
        heuristic_score += 45
        signals.append(f"Brand impersonation target: {', '.join(impersonated_brands)}")

    if typosquat_detected:
        heuristic_score += 40
        signals.append(f"Typosquatting detected: {', '.join(typosquat_detected)}")

    if keywords_found:
        heuristic_score += min(30, len(keywords_found) * 10)
        signals.append(f"Phishing keywords found: {', '.join(keywords_found)}")

    if at_symbol_count > 0:
        heuristic_score += 30
        signals.append("Contains '@' symbol (user-info URL obfuscation)")

    if len(subdomains) >= 3:
        heuristic_score += 20
        signals.append(f"Excessive subdomains ({len(subdomains)})")

    if entropy_score > 4.2 and not is_trusted:
        heuristic_score += 15
        signals.append(f"High domain randomness (entropy: {entropy_score})")

    if is_trusted and not impersonated_brands and not typosquat_detected:
        heuristic_score = min(heuristic_score, 10)

    heuristic_score = max(0, min(100, heuristic_score))

    return {
        "url": url,
        "scheme": scheme,
        "is_https": is_https,
        "hostname": hostname,
        "domain": domain,
        "tld": tld,
        "subdomains": subdomains,
        "subdomain_count": len(subdomains),
        "is_ip_address": is_ip_host,
        "is_suspicious_tld": suspicious_tld,
        "is_url_shortener": is_short,
        "is_trusted_domain": is_trusted,
        "domain_entropy": entropy_score,
        "keywords_found": keywords_found,
        "impersonated_brands": impersonated_brands,
        "typosquatting_indicators": typosquat_detected,
        "at_symbol_present": at_symbol_count > 0,
        "url_length": len(url),
        "heuristic_threat_score": heuristic_score,
        "heuristic_signals": signals,
    }
