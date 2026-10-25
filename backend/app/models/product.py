from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from ..database import Base

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False, index=True)
    brand = Column(String(100), nullable=False, index=True)
    model_name = Column(String(150), nullable=False)
    title = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=False)
    price = Column(Float, nullable=False, index=True)
    stock = Column(Integer, default=10, nullable=False)
    is_available = Column(Boolean, default=True, nullable=False, index=True)
    warranty_months = Column(Integer, default=12, nullable=False)
    image_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    category = relationship("Category", back_populates="products")
    specifications = relationship("ProductSpecification", back_populates="product", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="product", cascade="all, delete-orphan")
    cart_items = relationship("CartItem", back_populates="product")
    order_items = relationship("OrderItem", back_populates="product")

class ProductSpecification(Base):
    __tablename__ = "product_specifications"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False, index=True)
    name = Column(String(100), nullable=False, index=True)  # e.g., RAM, Battery, Processor, Display, Storage, Weight
    raw_value = Column(String(100), nullable=False)        # e.g., "16 GB", "5000 mAh", "180 g"
    unit = Column(String(30), nullable=True)               # e.g., "GB", "mAh", "g", "inches"
    numeric_value = Column(Float, nullable=True)           # e.g., 16.0, 5000.0, 180.0
    is_benefit = Column(Boolean, default=True)             # True = higher is better; False = lower is better (cost attribute)

    product = relationship("Product", back_populates="specifications")
