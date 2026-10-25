from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field
from .product import ProductRead
from .location import AddressRead

class CartItemAdd(BaseModel):
    product_id: int
    quantity: int = Field(1, ge=1)

class CartItemUpdate(BaseModel):
    quantity: int = Field(..., ge=1)

class CartItemRead(BaseModel):
    id: int
    product_id: int
    quantity: int
    product: ProductRead

    class Config:
        from_attributes = True

class CartRead(BaseModel):
    id: int
    user_id: int
    items: List[CartItemRead] = []
    total_items: int = 0
    subtotal: float = 0.0

class CheckoutRequest(BaseModel):
    address_id: int

class OrderItemRead(BaseModel):
    id: int
    product_id: int
    quantity: int
    unit_price: float
    total_price: float
    product: ProductRead

    class Config:
        from_attributes = True

class OrderRead(BaseModel):
    id: int
    user_id: int
    address_id: int
    order_date: datetime
    status: str
    payment_status: str
    subtotal: float
    delivery_fee: float
    total_amount: float
    address: Optional[AddressRead] = None
    items: List[OrderItemRead] = []

    class Config:
        from_attributes = True
