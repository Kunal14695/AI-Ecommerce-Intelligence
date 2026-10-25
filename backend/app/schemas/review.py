from datetime import datetime
from typing import Optional, List, Dict
from pydantic import BaseModel, Field

class ReviewCreate(BaseModel):
    product_id: int
    rating: int = Field(..., ge=1, le=5)
    review_text: str = Field(..., min_length=5, max_length=1000)

class ReviewRead(BaseModel):
    id: int
    product_id: int
    user_id: int
    user_name: Optional[str] = None
    rating: int
    review_text: str
    sentiment_score: float
    sentiment_label: str
    aspect_tags: Optional[str] = ""
    created_at: datetime

    class Config:
        from_attributes = True

class AspectSummary(BaseModel):
    aspect: str
    count: int
    sentiment: str

class ProductReviewStats(BaseModel):
    average_rating: float
    total_reviews: int
    rating_distribution: Dict[int, int]
    average_sentiment: float
    sentiment_breakdown: Dict[str, int]
    aspect_counts: List[AspectSummary]
