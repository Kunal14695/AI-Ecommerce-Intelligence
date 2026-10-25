"""
TC-11: Cart Operations & Stock Limits
TC-12: Order Checkout & Inventory Reduction
TC-16: Database Failure & Transaction Integrity (No Partial Orders)
"""
import pytest
from app.models import Product, Order, OrderItem, Address, Cart, CartItem

def test_tc11_cart_operations(client):
    login_res = client.post("/api/auth/login", json={"email": "student@poornima.edu.in", "password": "Student@123"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Add product 1 to cart
    add_res = client.post("/api/cart/items", json={"product_id": 1, "quantity": 1}, headers=headers)
    assert add_res.status_code == 200
    cart_data = add_res.json()
    assert cart_data["total_items"] >= 1

    # Requesting excessive quantity exceeding inventory stock
    excess_res = client.post("/api/cart/items", json={"product_id": 1, "quantity": 9999}, headers=headers)
    assert excess_res.status_code == 400
    assert "exceeds" in excess_res.json()["detail"].lower() or "more than" in excess_res.json()["detail"].lower()

def test_tc12_order_checkout_flow(client, db_session):
    login_res = client.post("/api/auth/login", json={"email": "student@poornima.edu.in", "password": "Student@123"})
    token = login_res.json()["access_token"]
    user_id = login_res.json()["user"]["id"]
    headers = {"Authorization": f"Bearer {token}"}

    # Clear previous cart items
    client.delete("/api/cart/clear", headers=headers)

    # 1. Create a serviceable address
    addr_res = client.post("/api/addresses", json={
        "label": "Hostel",
        "recipient_name": "Rohan Sharma",
        "phone": "9876543210",
        "address_line": "Campus Hostel Room 101",
        "city": "Jaipur",
        "state": "Rajasthan",
        "pincode": "302022",
        "source": "manual"
    }, headers=headers)
    address_id = addr_res.json()["id"]

    # 2. Add product to cart
    prod_before = db_session.query(Product).filter(Product.id == 3).first()
    initial_stock = prod_before.stock

    client.post("/api/cart/items", json={"product_id": 3, "quantity": 2}, headers=headers)

    # 3. Checkout
    checkout_res = client.post("/api/orders/checkout", json={"address_id": address_id}, headers=headers)
    assert checkout_res.status_code == 200
    order_data = checkout_res.json()
    assert order_data["status"] == "CONFIRMED"
    assert order_data["payment_status"] == "PAID_SANDBOX"
    assert len(order_data["items"]) == 1

    # 4. Verify inventory was decremented
    db_session.expire_all()
    prod_after = db_session.query(Product).filter(Product.id == 3).first()
    assert prod_after.stock == initial_stock - 2

    # 5. Verify cart is now empty
    cart_res = client.get("/api/cart", headers=headers)
    assert cart_res.json()["total_items"] == 0

def test_tc16_transaction_integrity_no_partial_orders(client, db_session):
    """
    TC-16: Simulates failure during checkout (e.g. attempting checkout with unserviceable PIN)
    and verifies that the transaction is rolled back and no partial orders are written.
    """
    login_res = client.post("/api/auth/login", json={"email": "student@poornima.edu.in", "password": "Student@123"})
    token = login_res.json()["access_token"]
    user_id = login_res.json()["user"]["id"]
    headers = {"Authorization": f"Bearer {token}"}

    # Add an unserviceable address
    unserv_addr_res = client.post("/api/addresses", json={
        "label": "Remote",
        "recipient_name": "Rohan Sharma",
        "phone": "9876543210",
        "address_line": "Remote Village",
        "city": "RemoteCity",
        "state": "RemoteState",
        "pincode": "999999", # Non-serviceable PIN
        "source": "manual"
    }, headers=headers)
    unserv_id = unserv_addr_res.json()["id"]

    orders_count_before = db_session.query(Order).count()

    # Attempt checkout to unserviceable address
    failed_checkout = client.post("/api/orders/checkout", json={"address_id": unserv_id}, headers=headers)
    assert failed_checkout.status_code == 400

    # Ensure transaction was not written and order count is unchanged
    orders_count_after = db_session.query(Order).count()
    assert orders_count_before == orders_count_after
