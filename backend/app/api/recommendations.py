from typing import List, Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Product, UserInteraction, User
from ..schemas.product import ProductRead
from ..ml.recommender import get_recommendations_for_user
from ..services.auth_service import decode_access_token
from .products import format_product_dict

router = APIRouter(prefix="/api/recommendations", tags=["Personalized Recommendations"])

@router.get("")
def get_recommendations(
    token: Optional[str] = None,
    limit: int = 6,
    db: Session = Depends(get_db)
):
    """
    Returns personalized recommendations:
    - If user is authenticated and has interaction logs, performs TF-IDF content-based
      profile matching with cosine similarity.
    - If new user or guest, falls back to cold-start top-rated and popular products.
    """
    user_id = None
    if token:
        payload = decode_access_token(token)
        if payload and "sub" in payload:
            user_id = int(payload["sub"])

    products = db.query(Product).filter(Product.is_available == True).all()
    user_interactions = []
    if user_id:
        user_interactions = db.query(UserInteraction).filter(UserInteraction.user_id == user_id).all()

    recs = get_recommendations_for_user(products, user_interactions, limit=limit)

    return [
        {
            "product": format_product_dict(r["product"]),
            "score": r["score"],
            "reason": r["reason"]
        }
        for r in recs
    ]
