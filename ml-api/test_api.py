"""
CKD AI Risk Screener - Backend API Verification Tests
Runs against http://127.0.0.1:8001
"""
import sys, io, json, urllib.request, urllib.error

# Force UTF-8 stdout so print() never raises UnicodeEncodeError on Windows
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

BASE = "http://127.0.0.1:8001"
results = []

def req(method, path, body=None):
    url = BASE + path
    data = json.dumps(body).encode("utf-8") if body else None
    hdrs = {"Content-Type": "application/json"} if data else {}
    r = urllib.request.Request(url, data=data, headers=hdrs, method=method)
    try:
        with urllib.request.urlopen(r, timeout=10) as resp:
            return resp.status, json.loads(resp.read())
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read())

def check(name, status, body, expected_status, assertions):
    passed = (status == expected_status)
    details = []
    for desc, ok in assertions:
        details.append((desc, ok))
        if not ok:
            passed = False
    tag = "[PASS]" if passed else "[FAIL]"
    results.append(passed)
    print(f"\n  {tag} {name}")
    print(f"         Status: {status} (expected {expected_status})")
    for desc, ok in details:
        icon = "OK" if ok else "!!"
        print(f"         {icon}  {desc}")
    if not passed:
        print(f"         Body snippet: {json.dumps(body)[:300]}")

# ---- Payloads ----------------------------------------------------------------
HEALTHY = {
    "age": 35, "bp": 70, "sg": 1.020, "al": 0, "su": 0,
    "bgr": 90, "bu": 20, "sc": 0.8, "sod": 140, "pot": 4.0,
    "hemo": 14.5, "pcv": 44, "wc": 7000, "rc": 5.0,
    "htn": "no", "dm": "no", "cad": "no",
    "appet": "good", "pe": "no", "ane": "no",
}

HIGH_RISK = {
    "age": 65, "bp": 100, "sg": 1.010, "al": 4, "su": 3,
    "bgr": 200, "bu": 80, "sc": 3.5, "sod": 120, "pot": 6.5,
    "hemo": 8.0, "pcv": 22, "wc": 11000, "rc": 3.0,
    "htn": "yes", "dm": "yes", "cad": "yes",
    "appet": "poor", "pe": "yes", "ane": "yes",
}

MODERATE = {
    "age": 50, "bp": 80, "sg": 1.015, "al": 1, "su": 0,
    "bgr": 120, "bu": 45, "sc": 1.4, "sod": 135, "pot": 4.5,
    "hemo": 11.5, "pcv": 35, "wc": 8000, "rc": 4.5,
    "htn": "yes", "dm": "no", "cad": "no",
    "appet": "good", "pe": "no", "ane": "no",
}

print("=" * 62)
print("  CKD AI Risk Screener -- API Verification Suite")
print("=" * 62)

# --- 1. GET / -----------------------------------------------------------------
print("\n[ Root Endpoint ]")
s, b = req("GET", "/")
check("GET /  ->  returns app metadata", s, b, 200, [
    ("'app' key present",        "app" in b),
    ("'status' == 'online'",     b.get("status") == "online"),
    ("'version' present",        "version" in b),
])

# --- 2. GET /health -----------------------------------------------------------
print("\n[ Health Endpoint ]")
s, b = req("GET", "/health")
check("GET /health  ->  status ok", s, b, 200, [
    ("status == 'ok'", b.get("status") == "ok"),
])

# --- 3. POST /predict - healthy patient ---------------------------------------
print("\n[ Prediction Endpoint ]")
s, b = req("POST", "/predict", HEALTHY)
check("POST /predict - healthy patient", s, b, 200, [
    ("'prediction' field present",          "prediction" in b),
    ("prediction is 'ckd' or 'not_ckd'",   b.get("prediction") in ["ckd", "not_ckd"]),
    ("risk_level is Low",                   b.get("risk_level") == "Low"),
    ("risk_probability in [0, 1]",          0 <= b.get("risk_probability", -1) <= 1),
    ("'clinical_text' is non-empty",        bool(b.get("clinical_text", ""))),
    ("'disclaimer' present",                bool(b.get("disclaimer", ""))),
])

# --- 4. POST /predict - high-risk patient -------------------------------------
s, b = req("POST", "/predict", HIGH_RISK)
check("POST /predict - high-risk patient", s, b, 200, [
    ("prediction == 'ckd'",                 b.get("prediction") == "ckd"),
    ("risk_level is High or Moderate",      b.get("risk_level") in ["High", "Moderate"]),
    ("risk_probability >= 0.5",             b.get("risk_probability", 0) >= 0.5),
    ("clinical_text mentions creatinine",   "creatinine" in b.get("clinical_text", "").lower()),
])

# --- 5. POST /predict - moderate risk -----------------------------------------
s, b = req("POST", "/predict", MODERATE)
check("POST /predict - moderate risk patient", s, b, 200, [
    ("prediction field present",            "prediction" in b),
    ("risk_level in valid set",             b.get("risk_level") in ["Low", "Moderate", "High"]),
    ("risk_probability in [0, 1]",          0 <= b.get("risk_probability", -1) <= 1),
])

# --- 6. POST /predict - missing required field (422) --------------------------
bad_payload = dict(HEALTHY)
del bad_payload["sc"]
s, b = req("POST", "/predict", bad_payload)
check("POST /predict - missing 'sc' field -> 422", s, b, 422, [
    ("returns 422 Unprocessable Entity",    s == 422),
])

# --- 7. POST /predict - invalid enum value (422) ------------------------------
bad_enum = dict(HEALTHY)
bad_enum["htn"] = "maybe"
s, b = req("POST", "/predict", bad_enum)
check("POST /predict - invalid enum htn='maybe' -> 422", s, b, 422, [
    ("returns 422 Unprocessable Entity",    s == 422),
])

# --- 8. POST /predict - wrong type (422) --------------------------------------
bad_types = dict(HEALTHY)
bad_types["age"] = "old"
s, b = req("POST", "/predict", bad_types)
check("POST /predict - wrong type age='old' -> 422", s, b, 422, [
    ("returns 422 Unprocessable Entity",    s == 422),
])

# --- 9. GET /openapi.json -----------------------------------------------------
print("\n[ OpenAPI Schema ]")
s, b = req("GET", "/openapi.json")
check("GET /openapi.json  ->  schema reachable", s, b, 200, [
    ("'openapi' version key present",       "openapi" in b),
    ("'/predict' path listed",              "/predict" in b.get("paths", {})),
    ("'/health' path listed",               "/health" in b.get("paths", {})),
])

# --- Summary ------------------------------------------------------------------
total  = len(results)
passed = sum(results)
failed = total - passed

print("\n" + "=" * 62)
print(f"  Results: {passed}/{total} passed  |  {failed} failed")
print("=" * 62)

if failed:
    raise SystemExit(1)
