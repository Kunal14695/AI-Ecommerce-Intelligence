from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Order, OrderItem, Cart, CartItem, Product, Address, ServiceableArea, User
from ..schemas.order import CheckoutRequest, OrderRead
from ..services.auth_service import get_current_user
from .products import format_product_dict

router = APIRouter(prefix="/api/orders", tags=["Order Processing"])

def format_order_dict(order: Order) -> dict:
    return {
        "id": order.id,
        "user_id": order.user_id,
        "address_id": order.address_id,
        "order_date": order.order_date,
        "status": order.status,
        "payment_status": order.payment_status,
        "subtotal": order.subtotal,
        "delivery_fee": order.delivery_fee,
        "total_amount": order.total_amount,
        "address": {
            "id": order.address.id,
            "user_id": order.address.user_id,
            "label": order.address.label,
            "recipient_name": order.address.recipient_name,
            "phone": order.address.phone,
            "address_line": order.address.address_line,
            "landmark": order.address.landmark,
            "city": order.address.city,
            "state": order.address.state,
            "pincode": order.address.pincode,
            "latitude": order.address.latitude,
            "longitude": order.address.longitude,
            "source": order.address.source,
            "is_default": order.address.is_default,
            "created_at": order.address.created_at,
        } if order.address else None,
        "items": [
            {
                "id": it.id,
                "product_id": it.product_id,
                "quantity": it.quantity,
                "unit_price": it.unit_price,
                "total_price": it.total_price,
                "product": format_product_dict(it.product)
            }
            for it in order.items
        ]
    }

@router.post("/checkout", response_model=OrderRead)
def checkout_cart(
    req: CheckoutRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # 1. Verify address ownership
    address = db.query(Address).filter(
        Address.id == req.address_id,
        Address.user_id == current_user.id
    ).first()
    if not address:
        raise HTTPException(status_code=400, detail="Delivery address not found or not owned by user")

    # 2. Verify PIN serviceability
    area = db.query(ServiceableArea).filter(
        ServiceableArea.pincode == address.pincode,
        ServiceableArea.is_active == True
    ).first()
    allowed_fallback_pins = ["302022", "302029", "302020", "302017", "302001", "110001", "400001", "560001"]
    if not area and address.pincode not in allowed_fallback_pins:
        raise HTTPException(
            status_code=400,
            detail=f"PIN {address.pincode} is not currently serviceable for delivery. Please select another location."
        )

    # 3. Get cart items
    cart = db.query(Cart).filter(Cart.user_id == current_user.id).first()
    if not cart or not cart.items:
        raise HTTPException(status_code=400, detail="Cannot checkout an empty cart")

    # 4. Atomic transaction check for inventory stock
    subtotal = 0.0
    order_items_to_create = []

    for item in cart.items:
        prod = db.query(Product).filter(Product.id == item.product_id).with_for_update().first()
        if not prod or not prod.is_available:
            raise HTTPException(status_code=400, detail=f"Product {prod.title if prod else ''} is unavailable")
        if prod.stock < item.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient inventory for {prod.title}. Only {prod.stock} units remaining."
            )
        
        # Deduct stock
        prod.stock -= item.quantity
        if prod.stock == 0:
            prod.is_available = False

        line_total = item.quantity * prod.price
        subtotal += line_total
        order_items_to_create.append({
            "product_id": prod.id,
            "quantity": item.quantity,
            "unit_price": prod.price,
            "total_price": line_total
        })

    delivery_fee = 0.0 if subtotal >= 500 else 50.0
    total_amount = subtotal + delivery_fee

    # Create Order
    new_order = Order(
        user_id=current_user.id,
        address_id=address.id,
        status="CONFIRMED",
        payment_status="PAID_SANDBOX",
        subtotal=subtotal,
        delivery_fee=delivery_fee,
        total_amount=total_amount,
    )
    db.add(new_order)
    db.flush()

    for o_item in order_items_to_create:
        db.add(OrderItem(
            order_id=new_order.id,
            product_id=o_item["product_id"],
            quantity=o_item["quantity"],
            unit_price=o_item["unit_price"],
            total_price=o_item["total_price"]
        ))

    # Clear user cart items
    db.query(CartItem).filter(CartItem.cart_id == cart.id).delete()

    db.commit()
    db.refresh(new_order)
    return format_order_dict(new_order)

@router.get("", response_model=List[OrderRead])
def get_user_orders(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    orders = db.query(Order).filter(Order.user_id == current_user.id).order_by(Order.order_date.desc()).all()
    return [format_order_dict(o) for o in orders]

@router.get("/{order_id}", response_model=OrderRead)
def get_order_detail(
    order_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    order = db.query(Order).filter(
        Order.id == order_id,
        Order.user_id == current_user.id
    ).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return format_order_dict(order)
