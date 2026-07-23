"""
SentinelAI — Screenshot Feature Extractor Engine
Extracts visual features and detects login forms, security banners, and visual phishing signals.
"""

import base64
import io
import re
from PIL import Image

LOGIN_KEYWORDS = {"login", "sign in", "signin", "username", "password", "passcode", "otp", "ssn", "verify"}
URGENT_KEYWORDS = {"suspended", "locked", "unauthorized", "urgent", "not secure", "security alert", "warning", "phishing", "fake"}
BRAND_KEYWORDS = {"paypal", "microsoft", "google", "apple", "amazon", "netflix", "bank"}


def extract_screenshot_features(image_b64: str, image_name: str = "") -> dict:
    """Extract visual attributes and heuristic security signals from screenshot."""
    try:
        raw_bytes = base64.b64decode(image_b64)
        img = Image.open(io.BytesIO(raw_bytes))
        width, height = img.size
        format_name = img.format or "PNG"
    except Exception as exc:
        return {
            "success": False,
            "error": str(exc),
            "width": 0,
            "height": 0,
            "heuristic_threat_score": 15,
            "heuristic_signals": ["Failed to decode image bytes"],
        }

    aspect_ratio = round(width / max(1, height), 2)
    file_size_bytes = len(raw_bytes)

    heuristic_score = 15
    signals = ["Visual screenshot attributes analyzed"]

    lowered_name = image_name.lower()
    
    login_matches = [k for k in LOGIN_KEYWORDS if k in lowered_name]
    urgent_matches = [k for k in URGENT_KEYWORDS if k in lowered_name]
    brand_matches = [k for k in BRAND_KEYWORDS if k in lowered_name]

    if login_matches:
        heuristic_score += 35
        signals.append(f"Login/Credential keywords in screenshot context: {', '.join(login_matches)}")

    if urgent_matches:
        heuristic_score += 35
        signals.append(f"Security warning/Urgency keywords in screenshot context: {', '.join(urgent_matches)}")

    if brand_matches:
        heuristic_score += 15
        signals.append(f"Brand target keyword present: {', '.join(brand_matches)}")

    heuristic_score = max(0, min(100, heuristic_score))

    return {
        "success": True,
        "width": width,
        "height": height,
        "format": format_name,
        "aspect_ratio": aspect_ratio,
        "file_size_bytes": file_size_bytes,
        "heuristic_threat_score": heuristic_score,
        "heuristic_signals": signals,
    }
