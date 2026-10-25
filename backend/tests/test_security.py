"""
TC-13: Security Hardening & Input Sanitization
- SQL Injection protection via ORM parameterized queries
- Cross-Site Scripting (XSS) input rejection / safety
- Salting of passwords
"""
from app.services.auth_service import hash_password, verify_password

def test_tc13_sql_injection_resilience(client):
    # Attempt SQL injection strings in search query
    sql_injection_payload = "' OR 1=1; DROP TABLE products; --"
    res = client.get(f"/api/search?q={sql_injection_payload}")
    assert res.status_code == 200
    # Response is a safe empty list or valid match, database remains intact
    assert isinstance(res.json(), list)

    # Check products table is completely intact
    cat_res = client.get("/api/products")
    assert cat_res.status_code == 200
    assert len(cat_res.json()) > 0

def test_tc13_script_tag_safety_in_reviews(client):
    login_res = client.post("/api/auth/login", json={"email": "student@poornima.edu.in", "password": "Student@123"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Attempt injecting script tags in review text
    xss_payload = "<script>alert('XSS_ATTACK')</script> Great performance and battery!"
    review_res = client.post("/api/reviews", json={
        "product_id": 9,
        "rating": 5,
        "review_text": xss_payload
    }, headers=headers)
    assert review_res.status_code in [200, 400]
    if review_res.status_code == 200:
        saved_text = review_res.json()["review_text"]
        # Script is stored as harmless literal string, never executed
        assert "<script>" in saved_text

def test_tc13_password_hashing_and_salting():
    pwd = "StudentSecurePassword@123"
    hash1 = hash_password(pwd)
    hash2 = hash_password(pwd)

    # Two hashes of the same password MUST differ due to random bcrypt salting
    assert hash1 != hash2
    assert verify_password(pwd, hash1) is True
    assert verify_password(pwd, hash2) is True
    assert verify_password("WrongPassword", hash1) is False
