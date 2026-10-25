from datetime import datetime
from typing import Optional, List, Dict
from pydantic import BaseModel, Field

EMAIL_REGEX = r"^[\w\.\+-]+@[\w\.-]+\.\w+$"

class UserRegister(BaseModel):
    email: str = Field(..., pattern=EMAIL_REGEX)
    password: str = Field(..., min_length=6)
    full_name: str = Field(..., min_length=2)
    role: Optional[str] = "customer"

class UserLogin(BaseModel):
    email: str = Field(..., pattern=EMAIL_REGEX)
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict

class UserPreferenceItem(BaseModel):
    criterion: str
    weight_priority: int = 3

class UserPreferenceUpdate(BaseModel):
    preferences: List[UserPreferenceItem]

class UserProfile(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    created_at: datetime
    preferences: List[Dict] = []

    class Config:
        from_attributes = True
