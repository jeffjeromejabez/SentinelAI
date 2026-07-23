import requests, base64, re, json
import main

API_KEY = main.GROQ_API_KEY
img = base64.b64encode(open('test_img.jpg','rb').read()).decode()

# Step 1: Qwen describes the image
r1 = requests.post('https://api.groq.com/openai/v1/chat/completions',
    json={'model':'qwen/qwen3.6-27b','messages':[{'role':'user','content':[
        {'type':'image_url','image_url':{'url':'data:image/jpeg;base64,'+img}},
        {'type':'text','text':'Describe this image in detail for a cybersecurity analyst. List ALL visible text, URLs, form fields, brand names, logos, browser UI elements, warning messages.'}
    ]}],'max_tokens':4000,'temperature':0.1},
    headers={'Authorization':'Bearer '+API_KEY},timeout=90)

raw = r1.json()['choices'][0]['message']['content']
# Strip think block - keep content even if unclosed
cleaned = re.sub(r'<think>.*?</think>', '', raw, flags=re.DOTALL).strip()
if not cleaned:
    cleaned = re.sub(r'</?think>', '', raw, flags=re.DOTALL).strip()
description = cleaned[:3000]
print("=== DESCRIPTION ===")
print(description[:500])

# Step 2: Llama converts to JSON
SCAN_SYSTEM = """You are SentinelAI. Respond with ONLY valid JSON. No prose. No markdown.
Required: {"threat_score":<0-100>,"risk_level":"<Safe|Low|Medium|High|Critical>","confidence_score":<0-100>,"detected_threats":["..."],"explanation":"...","recommendations":["..."],"summary":"..."}"""

r2 = requests.post('https://api.groq.com/openai/v1/chat/completions',
    json={'model':'llama-3.3-70b-versatile','messages':[
        {'role':'system','content':SCAN_SYSTEM},
        {'role':'user','content':f'Vision model described this image:\n\n{description}\n\nAssess phishing risk as JSON.'}
    ],'max_tokens':1000,'temperature':0.1},
    headers={'Authorization':'Bearer '+API_KEY},timeout=60)

result = r2.json()['choices'][0]['message']['content']
print("\n=== LLAMA JSON ===")
print(result[:600])

# Parse
m = re.search(r'\{.*\}', result, re.DOTALL)
if m:
    parsed = json.loads(m.group(0))
    print("\n=== PARSED ===")
    print(f"threat_score: {parsed.get('threat_score')}")
    print(f"risk_level: {parsed.get('risk_level')}")
    print(f"summary: {parsed.get('summary')}")
