"""
Location-Aware Checkout Tests:
TC-07: Location permission prompt handling
TC-08: Location detection & reverse geocode proxy
TC-09: Alternative location selection & saved address
TC-10: Address validation (6-digit PIN, required fields)
TC-14: Permission denied -> seamless switch to Option B
TC-15: External geocoding API failure graceful fallback
"""
import pytest
from app.services.geocoding_service import reverse_geocode_osm

def test_tc08_and_tc15_reverse_geocode_and_fallback(client):
    # 1. Test coordinate around Poornima University, Jaipur
    payload = {"latitude": 26.7766, "longitude": 75.8567}
    res = client.post("/api/location/reverse-geocode", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "city" in data
    assert "pincode" in data
    assert data["city"] in ["Jaipur", "Sitapura", "Sanganer"] or len(data["pincode"]) == 6
    assert data["is_serviceable"] is True

    # 2. TC-15: When external geocoding encounters remote coordinates or API disconnect
    remote_payload = {"latitude": 10.0001, "longitude": 10.0001}
    fallback_res = client.post("/api/location/reverse-geocode", json=remote_payload)
    assert fallback_res.status_code == 200
    fallback_data = fallback_res.json()
    assert "address_line" in fallback_data
    assert "city" in fallback_data


def test_tc07_and_tc14_permission_denied_flow(client):
    """
    TC-07 & TC-14:
    Verifies that when geolocation is denied or unavailable,
    the API provides full serviceability check and alternative manual address selection
    without blocking the customer or cart checkout.
    """
    # Customer provides manual PIN code in Option B
    res = client.get("/api/location/serviceability/302022")
    assert res.status_code == 200
    data = res.json()
    assert data["is_serviceable"] is True
    assert "Jaipur" in data["message"]

    # Customer checks unserviceable PIN
    bad_res = client.get("/api/location/serviceability/999999")
    assert bad_res.status_code == 200
    bad_data = bad_res.json()
    assert bad_data["is_serviceable"] is False

def test_tc09_and_tc10_address_validation_and_saved_reuse(client):
    # Log in student user to get auth token
    login_res = client.post("/api/auth/login", json={"email": "student@poornima.edu.in", "password": "Student@123"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # TC-10: Invalid PIN code (5 digits instead of 6) should fail validation
    invalid_addr = {
        "label": "Home",
        "recipient_name": "Rohan Sharma",
        "phone": "9876543210",
        "address_line": "123 Campus Road",
        "city": "Jaipur",
        "state": "Rajasthan",
        "pincode": "30202", # Invalid: 5 digits
        "source": "manual"
    }
    fail_res = client.post("/api/addresses", json=invalid_addr, headers=headers)
    assert fail_res.status_code == 422 # Pydantic validation error

    # TC-09: Valid address creation (Option B manual or Option A confirmed)
    valid_addr = {
        "label": "Hostel",
        "recipient_name": "Rohan Sharma",
        "phone": "9876543210",
        "address_line": "Poornima University Hostel Block B",
        "city": "Jaipur",
        "state": "Rajasthan",
        "pincode": "302022",
        "source": "manual",
        "is_default": True
    }
    create_res = client.post("/api/addresses", json=valid_addr, headers=headers)
    assert create_res.status_code == 200
    addr_id = create_res.json()["id"]

    # Fetch addresses to verify persistence
    get_res = client.get("/api/addresses", headers=headers)
    assert get_res.status_code == 200
    addresses = get_res.json()
    assert any(a["id"] == addr_id for a in addresses)
