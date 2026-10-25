"""
TC-01: User Registration
TC-02: User Login & JWT Issuance
"""

def test_tc01_user_registration(client):
    payload = {
        "email": "newstudent@poornima.edu.in",
        "password": "Password@123",
        "full_name": "New Student",
        "role": "customer"
    }
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 200, f"Registration failed: {response.text}"
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == payload["email"]
    assert data["user"]["role"] == "customer"

    # Verify duplicate registration is rejected
    duplicate_res = client.post("/api/auth/register", json=payload)
    assert duplicate_res.status_code == 400
    assert "already exists" in duplicate_res.json()["detail"].lower()

def test_tc02_user_login(client):
    # Valid login using seeded student user
    payload = {
        "email": "student@poornima.edu.in",
        "password": "Student@123"
    }
    res = client.post("/api/auth/login", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["user"]["email"] == payload["email"]

    # Invalid password login rejected
    bad_payload = {
        "email": "student@poornima.edu.in",
        "password": "WrongPassword999"
    }
    bad_res = client.post("/api/auth/login", json=bad_payload)
    assert bad_res.status_code == 401
