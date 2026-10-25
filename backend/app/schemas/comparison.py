from typing import Optional, Dict, List, Any
from pydantic import BaseModel, Field
from .product import ProductRead

class ComparisonWeights(BaseModel):
    price: float = Field(0.40, ge=0.0, le=1.0)
    performance: float = Field(0.15, ge=0.0, le=1.0)
    features: float = Field(0.15, ge=0.0, le=1.0)
    ratings: float = Field(0.15, ge=0.0, le=1.0)
    brand_warranty: float = Field(0.10, ge=0.0, le=1.0)
    availability: float = Field(0.05, ge=0.0, le=1.0)

class ComparisonRequest(BaseModel):
    product_a_id: int
    product_b_id: int
    preset: Optional[str] = None # "Budget-first", "Performance-first", "Reliability-first", or custom
    weights: Optional[ComparisonWeights] = None

class CriterionScoreDetail(BaseModel):
    criterion: str
    label: str
    weight: float
    raw_a: Any
    raw_b: Any
    score_a: float
    score_b: float
    advantage: str # "Product A", "Product B", or "Tie"
    explanation: str

class ComparisonResponse(BaseModel):
    product_a: ProductRead
    product_b: ProductRead
    score_a: float
    score_b: float
    percentage_a: float
    percentage_b: float
    recommended_product_id: Optional[int]
    recommended_product_name: Optional[str]
    preset_used: str
    weights_used: Dict[str, float]
    criteria_breakdown: List[CriterionScoreDetail]
    pros_a: List[str]
    cons_a: List[str]
    pros_b: List[str]
    cons_b: List[str]
    ai_summary: str
    conditional_recommendation: str
    disclaimer: str
    category_warning: Optional[str] = None
    missing_specs_warning: Optional[List[str]] = None
