"""
SentinelAI — QR Code Decoder & Feature Extractor Engine
Uses OpenCV / PyZbar to deterministically decode QR code images and analyze their payloads.
"""

import base64
import io
import re
from typing import Optional
from PIL import Image, ImageEnhance, ImageOps

try:
    import cv2
    import numpy as np
    CV2_AVAILABLE = True
except ImportError:
    CV2_AVAILABLE = False

try:
    from pyzbar.pyzbar import decode as pyzbar_decode
    PYZBAR_AVAILABLE = True
except ImportError:
    PYZBAR_AVAILABLE = False

from url_extractor import extract_url_features


def _try_decode_image(pil_img: Image.Image) -> tuple[Optional[str], str]:
    """Attempt decoding a PIL image using PyZbar and OpenCV."""
    # Try PyZbar
    if PYZBAR_AVAILABLE:
        try:
            results = pyzbar_decode(pil_img)
            if results:
                for r in results:
                    text = r.data.decode("utf-8", errors="ignore").strip()
                    if text:
                        return text, "pyzbar"
        except Exception:
            pass

    # Try OpenCV
    if CV2_AVAILABLE:
        try:
            open_cv_image = np.array(pil_img.convert("RGB"))[:, :, ::-1]  # RGB to BGR
            detector = cv2.QRCodeDetector()
            text, bbox, _ = detector.detectAndDecode(open_cv_image)
            if text and text.strip():
                return text.strip(), "opencv"
        except Exception:
            pass

    return None, "none"


def _crop_qr_regions(pil_img: Image.Image) -> list[Image.Image]:
    """Find potential QR bounding boxes in full desktop screenshots and crop them."""
    crops = []
    if not CV2_AVAILABLE:
        return crops

    try:
        bgr = np.array(pil_img.convert("RGB"))[:, :, ::-1]
        gray = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)
        
        # OpenCV QRCodeDetector detect
        detector = cv2.QRCodeDetector()
        found, points = detector.detect(bgr)
        if found and points is not None:
            pts = points[0].astype(int)
            x_min = max(0, np.min(pts[:, 0]) - 20)
            y_min = max(0, np.min(pts[:, 1]) - 20)
            x_max = min(bgr.shape[1], np.max(pts[:, 0]) + 20)
            y_max = min(bgr.shape[0], np.max(pts[:, 1]) + 20)
            if x_max > x_min and y_max > y_min:
                crops.append(pil_img.crop((x_min, y_min, x_max, y_max)))
    except Exception:
        pass

    return crops


def decode_qr_image(image_b64: str) -> dict:
    """
    Decode QR code image data into text and analyze payload security.
    Applies multi-pass image enhancement and cropping if raw decode fails.
    """
    try:
        raw_bytes = base64.b64decode(image_b64)
        base_img = Image.open(io.BytesIO(raw_bytes)).convert("RGB")
    except Exception as exc:
        return {
            "success": False,
            "error": f"Failed to open image bytes: {str(exc)}",
            "decoded_text": None,
            "payload_type": "unknown",
            "heuristic_threat_score": 0,
            "heuristic_signals": ["Invalid image data"],
        }

    # Pass 1: Raw image
    decoded_text, decoder_used = _try_decode_image(base_img)

    # Pass 2: Detect & Crop QR sub-region (for desktop screenshots)
    if not decoded_text:
        cropped_imgs = _crop_qr_regions(base_img)
        for crop in cropped_imgs:
            decoded_text, decoder_used = _try_decode_image(crop)
            if decoded_text:
                decoder_used = f"{decoder_used}_cropped"
                break

    # Pass 3: Scaled 2x image (for small QR codes)
    if not decoded_text:
        scaled_img = base_img.resize((base_img.width * 2, base_img.height * 2), Image.NEAREST)
        decoded_text, decoder_used = _try_decode_image(scaled_img)

    # Pass 4: Grayscale + High Contrast
    if not decoded_text:
        gray_img = ImageOps.grayscale(base_img)
        enhancer = ImageEnhance.Contrast(gray_img)
        contrast_img = enhancer.enhance(2.0)
        decoded_text, decoder_used = _try_decode_image(contrast_img)

    if not decoded_text:
        return {
            "success": False,
            "decoder_used": decoder_used,
            "decoded_text": None,
            "payload_type": "undetected",
            "heuristic_threat_score": 0,
            "heuristic_signals": ["No barcode matrix pattern decoded by local engine"],
        }

    # Classify payload
    payload_type = "text"
    url_analysis = None
    heuristic_score = 0
    signals = [f"Successfully decoded QR code payload via {decoder_used}"]

    clean_text = decoded_text.strip()
    
    # Check URL pattern (http://, https://, www., or domain-like string with TLD)
    is_url = bool(re.match(r"^(https?://|www\.)", clean_text, re.IGNORECASE))
    if not is_url and re.search(r"^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(/.*)?$", clean_text):
        is_url = True

    if is_url:
        payload_type = "url"
        target_url = clean_text if re.match(r"^https?://", clean_text, re.IGNORECASE) else f"http://{clean_text}"
        url_analysis = extract_url_features(target_url)
        heuristic_score = url_analysis["heuristic_threat_score"]
        signals.extend(url_analysis["heuristic_signals"])
    elif clean_text.upper().startswith("WIFI:"):
        payload_type = "wifi_credentials"
        heuristic_score = 30
        signals.append("QR code configures Wi-Fi credentials")
    elif any(clean_text.lower().startswith(p) for p in ["upi://", "paypal.me/", "bitcoin:", "ethereum:"]):
        payload_type = "payment_request"
        heuristic_score = 45
        signals.append("QR code initiates direct financial/payment transaction")
    elif clean_text.lower().startswith("mailto:") or clean_text.lower().startswith("tel:"):
        payload_type = "contact_trigger"
        heuristic_score = 15
        signals.append("QR code triggers direct communication (call/email)")

    return {
        "success": True,
        "decoder_used": decoder_used,
        "decoded_text": clean_text,
        "payload_type": payload_type,
        "url_analysis": url_analysis,
        "heuristic_threat_score": heuristic_score,
        "heuristic_signals": signals,
    }
