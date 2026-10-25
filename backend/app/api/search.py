from typing import Optional, List
from pydantic import BaseModel
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from ..database import get_db
from ..models import Product, UserInteraction
from ..schemas.product import ProductRead
from .products import format_product_dict

router = APIRouter(prefix="/api", tags=["Search & Interactions"])

class InteractionEvent(BaseModel):
    product_id: int
    event_type: str # view, search, compare, wishlist, cart
    user_id: Optional[int] = None

@router.get("/search", response_model=List[ProductRead])
def search_products(
    q: Optional[str] = Query("", description="Keyword search query"),
    category_id: Optional[int] = None,
    brand: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    sort_by: Optional[str] = Query("relevance", enum=["relevance", "price_asc", "price_desc", "rating"]),
    db: Session = Depends(get_db)
):
    query = db.query(Product)
    if q and q.strip():
        term = f"%{q.strip()}%"
        query = query.filter(
            or_(
                Product.title.ilike(term),
                Product.brand.ilike(term),
                Product.model_name.ilike(term),
                Product.description.ilike(term)
            )
        )
    if category_id:
        query = query.filter(Product.category_id == category_id)
    if brand:
        query = query.filter(Product.brand.ilike(f"%{brand}%"))
    if min_price is not None:
        query = query.filter(Product.price >= min_price)
    if max_price is not None:
        query = query.filter(Product.price <= max_price)

    products = query.all()
    results = [format_product_dict(p) for p in products]

    if sort_by == "price_asc":
        results.sort(key=lambda x: x["price"])
    elif sort_by == "price_desc":
        results.sort(key=lambda x: x["price"], reverse=True)
    elif sort_by == "rating":
        results.sort(key=lambda x: (x["average_rating"], x["review_count"]), reverse=True)

    return results

@router.post("/interactions")
def log_interaction(event: InteractionEvent, db: Session = Depends(get_db)):
    interaction = UserInteraction(
        user_id=event.user_id,
        product_id=event.product_id,
        event_type=event.event_type
    )
    db.add(interaction)
    db.commit()
    return {"status": "logged", "event": event.event_type}
