from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Text, ForeignKey, DateTime, UniqueConstraint
from sqlalchemy.orm import relationship
from ..database import Base

class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    rating = Column(Integer, nullable=False)               # 1-5
    review_text = Column(Text, nullable=False)
    sentiment_score = Column(Float, default=0.0)           # -1.0 to 1.0 (VADER compound)
    sentiment_label = Column(String(20), default="Neutral")# Positive, Neutral, Negative
    aspect_tags = Column(String(255), default="")          # e.g., "battery,display,camera"
    created_at = Column(DateTime, default=datetime.utcnow)

    # Unique constraint: one review per user per product
    __table_args__ = (
        UniqueConstraint("user_id", "product_id", name="uq_user_product_review"),
    )

    # Relationships
    product = relationship("Product", back_populates="reviews")
    user = relationship("User", back_populates="reviews")
