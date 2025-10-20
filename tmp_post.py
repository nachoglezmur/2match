import json
import requests

payload = {
    "full_name": "Test User",
    "email": "test@example.com",
    "phone": "123456789",
    "company": "ACME",
    "role": "Engineer",
    "bio": "Testing",
    "goals": "Networking",
    "share_phone": True,
    "interests": ["AI"],
    "offers": ["Help"],
    "needs": ["Ideas"],
    "event_id": "00000000-0000-0000-0000-000000000001",
}

resp = requests.post(
    "http://localhost:5000/api/participants",
    json=payload,
)

print(resp.status_code)
print(resp.text)
