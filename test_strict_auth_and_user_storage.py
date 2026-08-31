import urllib.request
import urllib.parse
import json
import time

BASE_URL = "http://127.0.0.1:8000"

def post(path, data):
    req = urllib.request.Request(
        f"{BASE_URL}{path}",
        data=json.dumps(data).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            return resp.getcode(), json.loads(resp.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode('utf-8'))
    except Exception as e:
        return 500, {"error": str(e)}

def get(path):
    req = urllib.request.Request(f"{BASE_URL}{path}")
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            return resp.getcode(), json.loads(resp.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode('utf-8'))
    except Exception as e:
        return 500, {"error": str(e)}

def run_tests():
    print("==================================================")
    print("LOK SWAR AUTHENTICATION & UNIQUE USER STORAGE AUDIT")
    print("==================================================")
    
    # 1. Reject invalid citizen login
    code, res = post("/api/auth/citizen/login", {"identifier": "9999999999", "password": "randompassword"})
    print(f"[TEST 1] Non-existent user login: HTTP {code}, Result: {res}")
    assert code == 404, f"Expected 404, got {code}"
    
    # 2. Reject wrong password for existing user
    code, res = post("/api/auth/citizen/login", {"identifier": "9861234567", "password": "wrongpassword999"})
    print(f"[TEST 2] Wrong password for existing user: HTTP {code}, Result: {res}")
    assert code == 401, f"Expected 401, got {code}"

    # 3. Register a brand new unique user
    unique_mobile = f"987{int(time.time()) % 10000000:07d}"
    print(f"Registering unique citizen: +91-{unique_mobile}")
    code, res = post("/api/auth/citizen/register", {
        "name": "Arun Patel",
        "mobile": unique_mobile,
        "email": f"arun.{unique_mobile}@lokswar.gov.in",
        "password": "arunPassword#2026",
        "village": "Bargaon Gram Panchayat"
    })
    print(f"[TEST 3] Unique citizen registration: HTTP {code}, Success: {res.get('success')}")
    assert code == 201 and res.get("success") is True, f"Failed registration: {res}"

    # 4. Strict Login for newly registered unique user
    code, res = post("/api/auth/citizen/login", {"identifier": unique_mobile, "password": "wrong_password"})
    print(f"[TEST 4A] New user wrong password rejected: HTTP {code}")
    assert code == 401, f"Expected 401, got {code}"

    code, res = post("/api/auth/citizen/login", {"identifier": unique_mobile, "password": "arunPassword#2026"})
    print(f"[TEST 4B] New user correct password login: HTTP {code}, User: {res.get('citizen', {}).get('name')}")
    assert code == 200 and res.get("citizen", {}).get("name") == "Arun Patel", f"Failed login: {res}"

    # 5. Submit unique grievances for two different citizens
    code, res_g1 = post("/api/grievances/submit", {
        "text": "Bargaon village main drinking water pump broken for 3 days",
        "author": "Arun Patel",
        "citizenMobile": unique_mobile,
        "village": "Bargaon Gram Panchayat",
        "gps": "22.1500° N, 84.1000° E"
    })
    print(f"[TEST 5A] Arun Patel grievance submit: HTTP {code}, ID: {res_g1.get('grievance', {}).get('id')}")
    assert code == 201, f"Failed grievance submit: {res_g1}"

    code, res_g2 = post("/api/grievances/submit", {
        "text": "Kalyanpur electric wire collapsed near school",
        "author": "Rishav Yadav",
        "citizenMobile": "9861234567",
        "village": "Kalyanpur Gram Panchayat",
        "gps": "22.1245° N, 84.0321° E"
    })
    print(f"[TEST 5B] Rishav Yadav grievance submit: HTTP {code}, ID: {res_g2.get('grievance', {}).get('id')}")
    assert code == 201, f"Failed grievance submit: {res_g2}"

    # 6. Verify User Grievance Isolation (Filtering by unique userId/mobile)
    code, arun_list = get(f"/api/grievances/list?userId={unique_mobile}")
    print(f"[TEST 6A] Arun Patel grievances count: {arun_list.get('count')}")
    assert arun_list.get('count') >= 1, "Arun Patel should have his grievance"
    for item in arun_list.get('data', []):
        assert item.get('citizenMobile') == unique_mobile or item.get('userId') == unique_mobile, "Data leak from other users!"

    code, rishav_list = get(f"/api/grievances/list?userId=9861234567")
    print(f"[TEST 6B] Rishav Yadav grievances count: {rishav_list.get('count')}")
    for item in rishav_list.get('data', []):
        assert item.get('citizenMobile') == "9861234567" or item.get('userId') == "9861234567", "Data leak from other users!"

    # 7. Officer Authentication Tests
    code, res = post("/api/auth/admin/login", {"aadhaar": "999999999999", "password": "wrongpassword"})
    print(f"[TEST 7A] Invalid officer rejected: HTTP {code}")
    assert code == 401, f"Expected 401, got {code}"

    code, res = post("/api/auth/admin/login", {"aadhaar": "889911223344", "password": "admin123"})
    print(f"[TEST 7B] Valid District Magistrate login: HTTP {code}, Officer: {res.get('officer', {}).get('name')}")
    assert code == 200 and "Tripathy" in res.get("officer", {}).get("name"), f"Failed officer login: {res}"

    # 8. Profile Update for Unique User
    code, res = post("/api/auth/citizen/profile", {
        "mobile": unique_mobile,
        "name": "Arun Kumar Patel",
        "email": "arun.patel.official@odisha.gov.in",
        "village": "Bargaon High Street, Ward 4"
    })
    print(f"[TEST 8] Citizen profile update: HTTP {code}, Updated name: {res.get('citizen', {}).get('name')}")
    assert code == 200 and res.get('citizen', {}).get('name') == "Arun Kumar Patel", f"Failed profile update: {res}"

    print("==================================================")
    print("ALL TESTS PASSED! Strict Authentication & Unique User Data Isolation Verified!")
    print("==================================================")

if __name__ == "__main__":
    run_tests()
