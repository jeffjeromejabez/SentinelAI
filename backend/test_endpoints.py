# -*- coding: utf-8 -*-
"""
SentinelAI - Full endpoint verification test
"""
import requests, base64, sys

BASE = "http://127.0.0.1:8000"

def check(label, r, score_min, score_max, expected_risk):
    try:
        d = r.json()
        score = d.get("threatScore", -1)
        risk  = d.get("riskLevel", "")
        ok = score_min <= score <= score_max and risk.lower() == expected_risk.lower()
        tag = "[PASS]" if ok else "[FAIL]"
        print(f"{tag} {label}")
        print(f"       score={score}  risk={risk}")
        print(f"       summary={d.get('summary','')[:100]}")
        if not (score_min <= score <= score_max):
            print(f"       WARN: expected score {score_min}-{score_max}, got {score}")
        if risk.lower() != expected_risk.lower():
            print(f"       WARN: expected risk '{expected_risk}', got '{risk}'")
    except Exception as e:
        print(f"[FAIL] {label} - exception: {e}")
        print(f"       raw: {r.text[:200]}")
    print()

print("=" * 60)
print("SentinelAI Endpoint Verification")
print("=" * 60)
print()

# 1. Safe URL
r = requests.post(f"{BASE}/scan/url", json={"url": "https://google.com"}, timeout=60)
check("URL - Safe (google.com)", r, 0, 20, "Safe")

# 2. Malicious URL
r = requests.post(f"{BASE}/scan/url", json={"url": "https://paypal-login-security.verify-account.tk/confirm"}, timeout=60)
check("URL - Critical (paypal phishing)", r, 75, 100, "Critical")

# 3. Safe email
r = requests.post(f"{BASE}/scan/email", json={"email": "Hi team, here is the weekly newsletter. Have a great weekend!"}, timeout=60)
check("Email - Safe (newsletter)", r, 0, 30, "Safe")

# 4. Phishing email
r = requests.post(f"{BASE}/scan/email", json={"email": "URGENT: Your bank account has been suspended! Verify NOW at http://secure-bank.tk/login or lose access in 24 hours. Enter your User ID, Password and SSN."}, timeout=60)
check("Email - Critical (phishing)", r, 75, 100, "Critical")

# 5. Screenshot with real image
img = base64.b64encode(open("test_img.jpg", "rb").read()).decode()
r = requests.post(f"{BASE}/scan/screenshot",
    json={"image_name": "nature_photo.jpg", "image_data": img, "mime_type": "image/jpeg"},
    timeout=120)
check("Screenshot - Safe (nature photo)", r, 0, 30, "Safe")

# 6. Screenshot without an uploaded image must be rejected.
r = requests.post(f"{BASE}/scan/screenshot",
    json={"image_name": "paypal-verify-account-login.png", "image_data": None, "mime_type": "image/png"},
    timeout=60)
tag = "[PASS]" if r.status_code == 422 else "[FAIL]"
print(f"{tag} Screenshot - Missing image rejected")
print(f"       status={r.status_code}  detail={r.json().get('detail')}")
print()

# 7. Chat - unique answers per question
r1 = requests.post(f"{BASE}/chat", json={"message": "What is phishing?", "history": []}, timeout=60)
r2 = requests.post(f"{BASE}/chat", json={"message": "How do I check if a URL is safe?", "history": []}, timeout=60)
reply1 = r1.json().get("reply", "")
reply2 = r2.json().get("reply", "")
different = reply1[:60] != reply2[:60]
tag = "[PASS]" if different else "[FAIL]"
print(f"{tag} Chat - Different answers for different questions")
print(f"       Q1: {reply1[:80]}")
print(f"       Q2: {reply2[:80]}")
print()

print("=" * 60)
print("Verification complete.")
print("=" * 60)
