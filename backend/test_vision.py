import requests, base64, sys, re, json
import main

API_KEY = main.GROQ_API_KEY
img = base64.b64encode(open('test_img.jpg','rb').read()).decode()

prompt = (
    "Analyze this screenshot for phishing risk.\n\n"
    "Filename: securebank-login.png\n\n"
    "READ ALL TEXT visible. Analyze login forms, URLs, branding.\n\n"
    "Return ONLY this JSON structure, nothing else before or after:\n"
    '{"threat_score": <0-100>, "risk_level": "<Safe|Low|Medium|High|Critical>", '
    '"confidence_score": <0-100>, "detected_threats": ["..."], '
    '"explanation": "...", "recommendations": ["..."], "summary": "..."}'
)

r = requests.post(
    'https://api.groq.com/openai/v1/chat/completions',
    json={
        'model': 'qwen/qwen3.6-27b',
        'messages': [{'role': 'user', 'content': [
            {'type': 'image_url', 'image_url': {'url': 'data:image/jpeg;base64,' + img}},
            {'type': 'text', 'text': prompt}
        ]}],
        'max_tokens': 3000,
        'temperature': 0.1
    },
    headers={'Authorization': 'Bearer ' + API_KEY},
    timeout=90
)

raw = r.json()['choices'][0]['message']['content']
print("=== RAW LAST 800 ===")
print(raw[-800:])
print("=== AFTER STRIP ===")
stripped = re.sub(r'<think>.*?</think>', '', raw, flags=re.DOTALL).strip()
print(stripped[:600])
print("=== JSON EXTRACT ===")
m = re.search(r'\{.*\}', stripped, re.DOTALL)
if m:
    try:
        parsed = json.loads(m.group(0))
        print("SUCCESS:", json.dumps(parsed, indent=2)[:400])
    except Exception as e:
        print("PARSE ERROR:", e)
        print("RAW MATCH:", m.group(0)[:300])
else:
    print("NO JSON FOUND")
