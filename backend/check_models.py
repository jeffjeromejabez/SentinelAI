import os
import requests

API_KEY = os.getenv("GROQ_API_KEY", "")
if not API_KEY:
    print("GROQ_API_KEY not set in environment.")
else:
    r = requests.get(
        'https://api.groq.com/openai/v1/models',
        headers={'Authorization': f'Bearer {API_KEY}'},
        timeout=15
    )
    models = r.json().get('data', [])
    print('All available models:')
    for m in sorted(m['id'] for m in models):
        print(' ', m)
