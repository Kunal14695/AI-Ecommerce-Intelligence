from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

class ReverseGeocodeRequest(BaseModel):
    latitude: float = Field(..., ge=-90.0, le=90.0)
    longitude: float = Field(..., ge=-180.0, le=180.0)

class ReverseGeocodeResponse(BaseModel):
    address_line: str
    city: str
    state: str
    pincode: str
    country: str = "India"
    display_name: str
    is_serviceable: bool
    estimated_delivery_days: Optional[int] = 3
    source: str = "gps"

class ServiceabilityCheckRequest(BaseModel):
    pincode: str = Field(..., min_length=6, max_length=6, pattern=r"^[1-9][0-9]{5}$")

class ServiceabilityCheckResponse(BaseModel):
    pincode: str
    is_serviceable: bool
    area_name: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    estimated_delivery_days: Optional[int] = None
    message: str

class AddressBase(BaseModel):
    label: str = Field("Home", description="Home, Parents, Office, Hostel, Gift")
    recipient_name: str = Field(..., min_length=2)
    phone: str = Field(..., min_length=10, max_length=15)
    address_line: str = Field(..., min_length=5)
    landmark: Optional[str] = None
    city: str = Field(..., min_length=2)
    state: str = Field(..., min_length=2)
    pincode: str = Field(..., min_length=6, max_length=6, pattern=r"^[1-9][0-9]{5}$")
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    source: str = Field("manual", description="'gps' or 'manual'")
    is_default: bool = False

class AddressCreate(AddressBase):
    pass

class AddressUpdate(BaseModel):
    label: Optional[str] = None
    recipient_name: Optional[str] = None
    phone: Optional[str] = None
    address_line: Optional[str] = None
    landmark: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = Field(None, min_length=6, max_length=6, pattern=r"^[1-9][0-9]{5}$")
    is_default: Optional[bool] = None

class AddressRead(AddressBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True
