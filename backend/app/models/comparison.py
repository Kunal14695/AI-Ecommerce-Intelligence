from datetime import datetime
from sqlalchemy import Column, Integer, Float, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from ..database import Base

class Comparison(Base):
    __tablename__ = "comparisons"

    id = Column(Integer, primary_key=True, index=True)
    product_a_id = Column(Integer, ForeignKey("products.id"), nullable=False, index=True)
    product_b_id = Column(Integer, ForeignKey("products.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    criteria_weights = Column(Text, nullable=False) # JSON encoded weights
    score_a = Column(Float, nullable=False)
    score_b = Column(Float, nullable=False)
    ai_summary = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    # Relationships
    product_a = relationship("Product", foreign_keys=[product_a_id])
    product_b = relationship("Product", foreign_keys=[product_b_id])

class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False, index=True)
    score = Column(Float, nullable=False)
    reason = Column(Text, nullable=False)
    generated_at = Column(DateTime, default=datetime.utcnow, index=True)

    product = relationship("Product")
