"""Test /api/chat for all 3 languages and validate structure."""

import json
import urllib.request

API = "http://127.0.0.1:8000/api/chat"
QUERY = "I have a mild fever since yesterday"
VALID_SEVERITIES = {"green", "yellow", "red"}


def test_language(lang: str) -> dict:
    payload = json.dumps({"message": QUERY, "language": lang}).encode("utf-8")
    req = urllib.request.Request(
        API, data=payload, headers={"Content-Type": "application/json"}
    )
    resp = urllib.request.urlopen(req)
    assert resp.status == 200, f"HTTP {resp.status}"
    data = json.loads(resp.read().decode("utf-8"))
    return data


results = {}
for lang in ["en", "hi", "gu"]:
    print(f"\n{'='*60}")
    print(f"Testing language: {lang}")
    print("=" * 60)
    data = test_language(lang)
    results[lang] = data

    # Validate structure
    assert "response" in data, "Missing 'response' key"
    assert "severity" in data, "Missing 'severity' key"
    assert "advice" in data, "Missing 'advice' key"
    assert data["severity"] in VALID_SEVERITIES, (
        f"Invalid severity: {data['severity']}"
    )

    print(f"  severity = {data['severity']}")
    print(f"  response length = {len(data['response'])} chars")
    print(f"  advice length   = {len(data['advice'])} chars")
    print(f"  [PASS] Valid JSON, severity in English")

# Save full results to file for inspection
out_path = "test_results.json"
with open(out_path, "w", encoding="utf-8") as f:
    json.dump(results, f, ensure_ascii=False, indent=2)

print(f"\n{'='*60}")
print(f"ALL 3 LANGUAGES PASSED. Full results saved to {out_path}")
print("=" * 60)
