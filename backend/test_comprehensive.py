"""
SentinelAI — Comprehensive Pipeline Test Suite
Validates dynamic threat scoring across 10 distinct test cases.
"""

import base64
import io
import json
import logging
import time
import cv2
import numpy as np
from PIL import Image, ImageDraw

from main import scan_url, scan_email, scan_qr, scan_screenshot, chat
from main import URLPayload, EmailPayload, QRPayload, ScreenshotPayload, ChatPayload

logging.basicConfig(level=logging.INFO)


def generate_qr_b64(payload_text: str) -> str:
    """Generate genuine QR code image using OpenCV encoder."""
    encoder = cv2.QRCodeEncoder.create()
    matrix = encoder.encode(payload_text)
    resized = cv2.resize(matrix, (300, 300), interpolation=cv2.INTER_NEAREST).astype(np.uint8)
    qr_img = cv2.threshold(resized, 127, 255, cv2.THRESH_BINARY)[1]
    pil_img = Image.fromarray(qr_img).convert("RGB")
    buf = io.BytesIO()
    pil_img.save(buf, format="PNG")
    return base64.b64encode(buf.getvalue()).decode()


def generate_test_image_b64(title: str, text: str) -> str:
    """Generate simple base64 image for screenshot testing."""
    img = Image.new("RGB", (600, 400), color=(240, 240, 245))
    draw = ImageDraw.Draw(img)
    draw.rectangle([20, 20, 580, 80], fill=(40, 60, 100))
    draw.text((30, 40), title, fill=(255, 255, 255))
    draw.text((30, 120), text, fill=(20, 20, 20))
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return base64.b64encode(buf.getvalue()).decode()


def run_tests():
    print("==================================================")
    print("RUNNING SENTINELAI COMPREHENSIVE PIPELINE AUDIT")
    print("==================================================\n")

    results = []

    # Test 1: Safe Google URL
    print("\nExecuting Test 1: Safe URL (https://www.google.com)...")
    res1 = scan_url(URLPayload(url="https://www.google.com"))
    results.append(("1. Safe URL (google.com)", res1.threatScore, res1.riskLevel, res1.explanation[:70] + "..."))
    time.sleep(2)

    # Test 2: Malicious PayPal Phishing URL
    print("Executing Test 2: Malicious URL (http://paypal-security-verify.login.tk/account)...")
    res2 = scan_url(URLPayload(url="http://paypal-security-verify.login.tk/account"))
    results.append(("2. Malicious URL (paypal-login.tk)", res2.threatScore, res2.riskLevel, res2.explanation[:70] + "..."))
    time.sleep(2)

    # Test 3: URL Shortener
    print("Executing Test 3: Shortened URL (https://bit.ly/3xYz99)...")
    res3 = scan_url(URLPayload(url="https://bit.ly/3xYz99"))
    results.append(("3. URL Shortener (bit.ly)", res3.threatScore, res3.riskLevel, res3.explanation[:70] + "..."))
    time.sleep(2)

    # Test 4: Safe Tech Email
    print("Executing Test 4: Safe Email Digest...")
    safe_email = """From: newsletter@techweekly.com
Subject: Weekly Tech Digest #142

Hello Developer,
Here are top stories from the open-source community this week. Check out the latest updates on Python 3.13 and React 19.
Best regards,
Tech Weekly Team"""
    res4 = scan_email(EmailPayload(email=safe_email))
    results.append(("4. Safe Email Newsletter", res4.threatScore, res4.riskLevel, res4.explanation[:70] + "..."))
    time.sleep(2)

    # Test 5: Urgent Bank Phishing Email
    print("Executing Test 5: Phishing Email...")
    phishing_email = """From: service@paypal-alerts-support.com
Reply-To: refund-dept@scam-server.ga
Subject: URGENT: Your PayPal Account Has Been Suspended!

Dear Customer,
We detected unauthorized attempts to access your account. Your account is LOCKED.
You must verify your password, SSN, and card details within 24 hours or your funds will be seized.
Click here to confirm: http://paypal-verify-credentials.tk/login"""
    res5 = scan_email(EmailPayload(email=phishing_email))
    results.append(("5. Urgent Phishing Email", res5.threatScore, res5.riskLevel, res5.explanation[:70] + "..."))
    time.sleep(2)

    # Test 6: Safe QR Scan Payload
    print("Executing Test 6: Safe QR Code (Google)...")
    safe_qr_b64 = generate_qr_b64("https://www.google.com")
    res6 = scan_qr(QRPayload(image_name="official_google_homepage_qr.png", image_data=safe_qr_b64, mime_type="image/png"))
    results.append(("6. Safe QR Code Image", res6.threatScore, res6.riskLevel, res6.explanation[:70] + "..."))
    time.sleep(2)

    # Test 7: Malicious QR Scan Payload
    print("Executing Test 7: Malicious QR Code (PayPal Phish)...")
    malicious_qr_b64 = generate_qr_b64("http://paypal-security-verify.login.tk/account")
    res7 = scan_qr(QRPayload(image_name="malicious_paypal_login_phishing_qr.png", image_data=malicious_qr_b64, mime_type="image/png"))
    results.append(("7. Malicious QR Code Image", res7.threatScore, res7.riskLevel, res7.explanation[:70] + "..."))
    time.sleep(2)

    # Test 8: Safe Screenshot
    print("Executing Test 8: Safe Screenshot...")
    safe_img_b64 = generate_test_image_b64("Google Search Official Homepage", "https://www.google.com - Search the web securely.")
    res8 = scan_screenshot(ScreenshotPayload(image_name="official_google_homepage.png", image_data=safe_img_b64, mime_type="image/png"))
    results.append(("8. Safe Screenshot", res8.threatScore, res8.riskLevel, res8.explanation[:70] + "..."))
    time.sleep(2)

    # Test 9: Phishing Screenshot
    print("Executing Test 9: Phishing Screenshot...")
    phish_img_b64 = generate_test_image_b64("CRITICAL WARNING: PayPal Account Suspended", "Enter your username, password, and SSN at http://paypal-login-verify.tk/login to restore access.")
    res9 = scan_screenshot(ScreenshotPayload(image_name="fake_paypal_login_phishing.png", image_data=phish_img_b64, mime_type="image/png"))
    results.append(("9. Phishing Screenshot", res9.threatScore, res9.riskLevel, res9.explanation[:70] + "..."))
    time.sleep(2)

    # Test 10: AI Assistant Chat
    print("Executing Test 10: AI Assistant Chat...")
    res10 = chat(ChatPayload(message="What is phishing and how do I prevent it?"))
    chat_ok = "phishing" in res10["reply"].lower() and len(res10["reply"]) > 50
    results.append(("10. AI Assistant Chat Response", "N/A", "OK" if chat_ok else "Fail", res10["reply"][:70] + "..."))

    print("\n==========================================================================================")
    print("SENTINELAI END-TO-END PIPELINE AUDIT MATRIX")
    print("==========================================================================================")
    print(f"{'#':<3} | {'Test Case Description':<32} | {'Score':<6} | {'Risk Level':<10} | {'Explanation Snippet'}")
    print("-" * 105)
    for idx, (name, score, risk, expl) in enumerate(results, 1):
        print(f"{idx:<3} | {name:<32} | {str(score):<6} | {risk:<10} | {expl}")
    print("==========================================================================================\n")


if __name__ == "__main__":
    run_tests()
