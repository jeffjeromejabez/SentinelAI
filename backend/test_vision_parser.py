"""Regression test for an unfinished Qwen <think> block."""

import base64
from unittest.mock import patch

import main


def test_unfinished_vision_reasoning_is_still_analyzed():
    unfinished_reasoning = (
        "<think>Image contains a fake PayPal login form at "
        "paypal-login.example.tk asking for a password."
    )
    structured_assessment = (
        '{"threat_score":92,"risk_level":"Critical","confidence_score":91,'
        '"detected_threats":["brand impersonation"],"explanation":"Fake login form",'
        '"recommendations":["Do not enter credentials"],"summary":"Phishing page"}'
    )

    payload = main.ScreenshotPayload(
        image_name="paypal-login.png",
        image_data=base64.b64encode(b"test image bytes").decode(),
        mime_type="image/png",
    )
    with patch.object(main, "_groq_request", side_effect=[unfinished_reasoning, structured_assessment]):
        result = main.scan_screenshot(payload)

    assert result.threatScore == 92
    assert result.riskLevel == "Critical"
    assert result.details["analysisMethod"] == "vision+llm"
