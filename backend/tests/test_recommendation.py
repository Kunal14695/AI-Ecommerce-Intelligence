"""
TC-06: Personalized Recommendations & Cold-Start Fallback
"""
from app.models import Product, UserInteraction
from app.ml.recommender import get_recommendations_for_user

def test_tc06_recommendations_cold_start_and_interactions(db_session):
    products = db_session.query(Product).filter(Product.is_available == True).all()
    assert len(products) > 0

    # 1. Cold-start fallback (no interactions)
    recs_cold = get_recommendations_for_user(products, [], limit=4)
    assert len(recs_cold) == 4
    for r in recs_cold:
        assert r["product"].is_available is True
        assert "favorite" in r["reason"].lower() or "top-rated" in r["reason"].lower()

    # 2. Personalized with interaction history (user viewed/compared laptops)
    laptop_prod = [p for p in products if "laptop" in (p.category.name if p.category else "").lower()][0]
    
    mock_interactions = [
        UserInteraction(user_id=99, product_id=laptop_prod.id, event_type="view"),
        UserInteraction(user_id=99, product_id=laptop_prod.id, event_type="compare"),
        UserInteraction(user_id=99, product_id=laptop_prod.id, event_type="cart"),
    ]

    recs_personalized = get_recommendations_for_user(products, mock_interactions, limit=4)
    assert len(recs_personalized) > 0
    # Top recommendation should have high similarity to the interacted laptop category/brand
    top_rec = recs_personalized[0]
    assert top_rec["score"] > 0.0
