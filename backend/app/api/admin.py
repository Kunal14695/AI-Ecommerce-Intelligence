from typing import List, Optional
from pydantic import BaseModel, Field
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..database import get_db
from ..models import (
    User, Product, ProductSpecification, Order, OrderItem,
    Comparison, Review, ServiceableArea
)
from ..schemas.product import ProductCreateUpdate, ProductRead
from ..services.auth_service import get_current_admin
from .products import format_product_dict

router = APIRouter(prefix="/api/admin", tags=["Admin Portal"])

class ServiceableAreaCreate(BaseModel):
    pincode: str = Field(..., min_length=6, max_length=6)
    area_name: str
    city: str
    state: str
    estimated_delivery_days: int = 3

class OrderStatusUpdate(BaseModel):
    status: str = Field(..., enum=["CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"])

@router.get("/dashboard")
def get_admin_dashboard(
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    total_users = db.query(User).count()
    total_products = db.query(Product).count()
    total_orders = db.query(Order).count()
    total_revenue = db.query(func.sum(Order.total_amount)).scalar() or 0.0
    total_comparisons = db.query(Comparison).count()
    total_reviews = db.query(Review).count()

    recent_orders = db.query(Order).order_by(Order.order_date.desc()).limit(5).all()
    recent_comparisons = db.query(Comparison).order_by(Comparison.created_at.desc()).limit(5).all()

    return {
        "metrics": {
            "total_users": total_users,
            "total_products": total_products,
            "total_orders": total_orders,
            "total_revenue": round(total_revenue, 2),
            "total_comparisons": total_comparisons,
            "total_reviews": total_reviews,
        },
        "recent_orders": [
            {
                "id": o.id,
                "user_name": o.user.full_name if o.user else "User",
                "total_amount": o.total_amount,
                "status": o.status,
                "order_date": o.order_date
            }
            for o in recent_orders
        ],
        "recent_comparisons": [
            {
                "id": c.id,
                "product_a": c.product_a.title if c.product_a else "A",
                "product_b": c.product_b.title if c.product_b else "B",
                "score_a": c.score_a,
                "score_b": c.score_b,
                "created_at": c.created_at
            }
            for c in recent_comparisons
        ]
    }

@router.post("/products", response_model=ProductRead)
def admin_create_product(
    prod_in: ProductCreateUpdate,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    new_prod = Product(
        category_id=prod_in.category_id,
        brand=prod_in.brand.strip(),
        model_name=prod_in.model_name.strip(),
        title=prod_in.title.strip(),
        description=prod_in.description.strip(),
        price=prod_in.price,
        stock=prod_in.stock,
        is_available=prod_in.is_available,
        warranty_months=prod_in.warranty_months,
        image_url=prod_in.image_url,
    )
    db.add(new_prod)
    db.flush()

    if prod_in.specifications:
        for s in prod_in.specifications:
            db.add(ProductSpecification(
                product_id=new_prod.id,
                name=s.name,
                raw_value=s.raw_value,
                unit=s.unit,
                numeric_value=s.numeric_value,
                is_benefit=s.is_benefit
            ))

    db.commit()
    db.refresh(new_prod)
    return format_product_dict(new_prod)

@router.put("/products/{product_id}", response_model=ProductRead)
def admin_update_product(
    product_id: int,
    prod_in: ProductCreateUpdate,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    prod = db.query(Product).filter(Product.id == product_id).first()
    if not prod:
        raise HTTPException(status_code=404, detail="Product not found")

    prod.category_id = prod_in.category_id
    prod.brand = prod_in.brand.strip()
    prod.model_name = prod_in.model_name.strip()
    prod.title = prod_in.title.strip()
    prod.description = prod_in.description.strip()
    prod.price = prod_in.price
    prod.stock = prod_in.stock
    prod.is_available = prod_in.is_available
    prod.warranty_months = prod_in.warranty_months
    prod.image_url = prod_in.image_url

    # Replace specifications if provided
    if prod_in.specifications:
        db.query(ProductSpecification).filter(ProductSpecification.product_id == prod.id).delete()
        for s in prod_in.specifications:
            db.add(ProductSpecification(
                product_id=prod.id,
                name=s.name,
                raw_value=s.raw_value,
                unit=s.unit,
                numeric_value=s.numeric_value,
                is_benefit=s.is_benefit
            ))

    db.commit()
    db.refresh(prod)
    return format_product_dict(prod)

@router.delete("/products/{product_id}")
def admin_delete_product(
    product_id: int,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    prod = db.query(Product).filter(Product.id == product_id).first()
    if not prod:
        raise HTTPException(status_code=404, detail="Product not found")

    db.delete(prod)
    db.commit()
    return {"message": "Product deleted successfully"}

@router.get("/serviceable-pins")
def get_serviceable_pins(
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    return db.query(ServiceableArea).order_by(ServiceableArea.pincode.asc()).all()

@router.post("/serviceable-pins")
def add_serviceable_pin(
    pin_in: ServiceableAreaCreate,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    existing = db.query(ServiceableArea).filter(ServiceableArea.pincode == pin_in.pincode).first()
    if existing:
        existing.is_active = True
        existing.area_name = pin_in.area_name
        existing.city = pin_in.city
        existing.state = pin_in.state
        existing.estimated_delivery_days = pin_in.estimated_delivery_days
        db.commit()
        return existing

    new_pin = ServiceableArea(
        pincode=pin_in.pincode,
        area_name=pin_in.area_name,
        city=pin_in.city,
        state=pin_in.state,
        estimated_delivery_days=pin_in.estimated_delivery_days,
        is_active=True
    )
    db.add(new_pin)
    db.commit()
    db.refresh(new_pin)
    return new_pin

@router.delete("/serviceable-pins/{pin_id}")
def delete_serviceable_pin(
    pin_id: int,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    area = db.query(ServiceableArea).filter(ServiceableArea.id == pin_id).first()
    if not area:
        raise HTTPException(status_code=404, detail="PIN record not found")
    db.delete(area)
    db.commit()
    return {"message": "PIN removed from delivery coverage"}

@router.get("/orders")
def get_all_orders_admin(
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    orders = db.query(Order).order_by(Order.order_date.desc()).all()
    return [
        {
            "id": o.id,
            "user_id": o.user_id,
            "user_name": o.user.full_name if o.user else "Customer",
            "user_email": o.user.email if o.user else "",
            "total_amount": o.total_amount,
            "status": o.status,
            "payment_status": o.payment_status,
            "order_date": o.order_date,
            "city": o.address.city if o.address else "Jaipur",
            "pincode": o.address.pincode if o.address else "",
            "item_count": sum(i.quantity for i in o.items)
        }
        for o in orders
    ]

@router.put("/orders/{order_id}/status")
def update_order_status(
    order_id: int,
    status_update: OrderStatusUpdate,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    order.status = status_update.status
    db.commit()
    return {"message": "Order status updated", "new_status": order.status}

@router.delete("/reviews/{review_id}")
def moderate_delete_review(
    review_id: int,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    rev = db.query(Review).filter(Review.id == review_id).first()
    if not rev:
        raise HTTPException(status_code=404, detail="Review not found")
    db.delete(rev)
    db.commit()
    return {"message": "Review removed by administrator"}
