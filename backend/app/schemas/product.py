from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel

class SpecificationBase(BaseModel):
    name: str
    raw_value: str
    unit: Optional[str] = None
    numeric_value: Optional[float] = None
    is_benefit: bool = True

class SpecificationRead(SpecificationBase):
    id: int
    product_id: int

    class Config:
        from_attributes = True

class CategoryRead(BaseModel):
    id: int
    name: str
    slug: str
    description: Optional[str] = None
    parent_category_id: Optional[int] = None

    class Config:
        from_attributes = True

class ProductBase(BaseModel):
    category_id: int
    brand: str
    model_name: str
    title: str
    description: str
    price: float
    stock: int = 10
    is_available: bool = True
    warranty_months: int = 12
    image_url: Optional[str] = None

class ProductCreateUpdate(ProductBase):
    specifications: Optional[List[SpecificationBase]] = []

class ProductRead(ProductBase):
    id: int
    created_at: datetime
    category: Optional[CategoryRead] = None
    specifications: List[SpecificationRead] = []
    average_rating: Optional[float] = 0.0
    review_count: Optional[int] = 0

    class Config:
        from_attributes = True
