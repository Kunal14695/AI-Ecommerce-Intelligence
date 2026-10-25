from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..database import get_db
from ..models import Product, Category, Review, ProductSpecification
from ..schemas.product import ProductRead, CategoryRead

router = APIRouter(prefix="/api/products", tags=["Products"])

def format_product_dict(prod: Product) -> dict:
    ratings = [r.rating for r in prod.reviews] if prod.reviews else []
    avg_rating = round(sum(ratings) / len(ratings), 2) if ratings else 0.0
    return {
        "id": prod.id,
        "category_id": prod.category_id,
        "brand": prod.brand,
        "model_name": prod.model_name,
        "title": prod.title,
        "description": prod.description,
        "price": prod.price,
        "stock": prod.stock,
        "is_available": prod.is_available,
        "warranty_months": prod.warranty_months,
        "image_url": prod.image_url,
        "created_at": prod.created_at,
        "category": {
            "id": prod.category.id,
            "name": prod.category.name,
            "slug": prod.category.slug,
            "description": prod.category.description,
            "parent_category_id": prod.category.parent_category_id,
        } if prod.category else None,
        "specifications": [
            {
                "id": s.id,
                "product_id": s.product_id,
                "name": s.name,
                "raw_value": s.raw_value,
                "unit": s.unit,
                "numeric_value": s.numeric_value,
                "is_benefit": s.is_benefit,
            }
            for s in prod.specifications
        ],
        "average_rating": avg_rating,
        "review_count": len(ratings),
    }

@router.get("/categories", response_model=List[CategoryRead])
def get_categories(db: Session = Depends(get_db)):
    return db.query(Category).all()

@router.get("", response_model=List[ProductRead])
def get_products(
    category_id: Optional[int] = None,
    brand: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    min_rating: Optional[float] = None,
    sort_by: Optional[str] = Query("popular", description="popular, price_asc, price_desc, rating, newest"),
    db: Session = Depends(get_db)
):
    query = db.query(Product)
    if category_id:
        query = query.filter(Product.category_id == category_id)
    if brand:
        query = query.filter(Product.brand.ilike(f"%{brand}%"))
    if min_price is not None:
        query = query.filter(Product.price >= min_price)
    if max_price is not None:
        query = query.filter(Product.price <= max_price)

    if sort_by == "price_asc":
        query = query.order_by(Product.price.asc())
    elif sort_by == "price_desc":
        query = query.order_by(Product.price.desc())
    elif sort_by == "newest":
        query = query.order_by(Product.created_at.desc())

    products = query.all()
    results = [format_product_dict(p) for p in products]

    if min_rating:
        results = [p for p in results if p["average_rating"] >= min_rating]

    if sort_by == "rating":
        results.sort(key=lambda x: (x["average_rating"], x["review_count"]), reverse=True)
    elif sort_by == "popular":
        results.sort(key=lambda x: x["review_count"], reverse=True)

    return results

@router.get("/compare-selector")
def get_compare_selector(category_id: Optional[int] = None, db: Session = Depends(get_db)):
    """Returns compact list of products for dropdowns / selector trays."""
    query = db.query(Product).filter(Product.is_available == True)
    if category_id:
        query = query.filter(Product.category_id == category_id)
    products = query.order_by(Product.brand.asc(), Product.model_name.asc()).all()
    return [
        {
            "id": p.id,
            "title": p.title,
            "brand": p.brand,
            "model_name": p.model_name,
            "price": p.price,
            "category_id": p.category_id,
            "category_name": p.category.name if p.category else "",
            "image_url": p.image_url,
        }
        for p in products
    ]

@router.get("/{product_id}", response_model=ProductRead)
def get_product_detail(product_id: int, db: Session = Depends(get_db)):
    prod = db.query(Product).filter(Product.id == product_id).first()
    if not prod:
        raise HTTPException(status_code=404, detail="Product not found")
    return format_product_dict(prod)
