from collections import Counter
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Review, Product, User
from ..schemas.review import ReviewCreate, ReviewRead, ProductReviewStats, AspectSummary
from ..services.auth_service import get_current_user
from ..ml.sentiment_analyzer import analyze_sentiment, extract_aspects

router = APIRouter(prefix="/api/reviews", tags=["Reviews & Sentiment Analytics"])

@router.get("/product/{product_id}")
def get_product_reviews(product_id: int, db: Session = Depends(get_db)):
    reviews = db.query(Review).filter(Review.product_id == product_id).order_by(Review.created_at.desc()).all()
    
    total = len(reviews)
    if total == 0:
        return {
            "reviews": [],
            "stats": {
                "average_rating": 0.0,
                "total_reviews": 0,
                "rating_distribution": {1: 0, 2: 0, 3: 0, 4: 0, 5: 0},
                "average_sentiment": 0.0,
                "sentiment_breakdown": {"Positive": 0, "Neutral": 0, "Negative": 0},
                "aspect_counts": []
            }
        }

    dist = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
    sent_dist = {"Positive": 0, "Neutral": 0, "Negative": 0}
    aspect_counter = Counter()

    for r in reviews:
        dist[r.rating] = dist.get(r.rating, 0) + 1
        sent_dist[r.sentiment_label] = sent_dist.get(r.sentiment_label, 0) + 1
        if r.aspect_tags:
            for asp in r.aspect_tags.split(","):
                if asp.strip():
                    aspect_counter[asp.strip()] += 1

    avg_rating = round(sum(r.rating for r in reviews) / total, 2)
    avg_sentiment = round(sum(r.sentiment_score for r in reviews) / total, 2)

    formatted_reviews = [
        {
            "id": r.id,
            "product_id": r.product_id,
            "user_id": r.user_id,
            "user_name": r.user.full_name if r.user else "Verified Customer",
            "rating": r.rating,
            "review_text": r.review_text,
            "sentiment_score": r.sentiment_score,
            "sentiment_label": r.sentiment_label,
            "aspect_tags": r.aspect_tags,
            "created_at": r.created_at
        }
        for r in reviews
    ]

    aspect_summaries = [
        {"aspect": asp.title(), "count": cnt, "sentiment": "Mixed/Positive"}
        for asp, cnt in aspect_counter.most_common(5)
    ]

    return {
        "reviews": formatted_reviews,
        "stats": {
            "average_rating": avg_rating,
            "total_reviews": total,
            "rating_distribution": dist,
            "average_sentiment": avg_sentiment,
            "sentiment_breakdown": sent_dist,
            "aspect_counts": aspect_summaries
        }
    }

@router.post("", response_model=ReviewRead)
def create_review(
    review_in: ReviewCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    prod = db.query(Product).filter(Product.id == review_in.product_id).first()
    if not prod:
        raise HTTPException(status_code=404, detail="Product not found")

    # Enforce: one review per user per product
    existing = db.query(Review).filter(
        Review.user_id == current_user.id,
        Review.product_id == review_in.product_id
    ).first()
    if existing:
        raise HTTPException(
            status_code=400,
            detail="You have already submitted a review for this product."
        )

    # Perform VADER sentiment analysis & aspect mining
    sentiment_data = analyze_sentiment(review_in.review_text)
    aspects = extract_aspects(review_in.review_text, sentiment_data["compound"])

    new_review = Review(
        product_id=review_in.product_id,
        user_id=current_user.id,
        rating=review_in.rating,
        review_text=review_in.review_text.strip(),
        sentiment_score=sentiment_data["compound"],
        sentiment_label=sentiment_data["label"],
        aspect_tags=",".join(aspects)
    )
    db.add(new_review)
    db.commit()
    db.refresh(new_review)

    return {
        "id": new_review.id,
        "product_id": new_review.product_id,
        "user_id": new_review.user_id,
        "user_name": current_user.full_name,
        "rating": new_review.rating,
        "review_text": new_review.review_text,
        "sentiment_score": new_review.sentiment_score,
        "sentiment_label": new_review.sentiment_label,
        "aspect_tags": new_review.aspect_tags,
        "created_at": new_review.created_at
    }
