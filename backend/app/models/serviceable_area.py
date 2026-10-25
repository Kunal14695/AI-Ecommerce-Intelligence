from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from ..database import Base

class ServiceableArea(Base):
    __tablename__ = "serviceable_areas"

    id = Column(Integer, primary_key=True, index=True)
    pincode = Column(String(10), unique=True, index=True, nullable=False)
    area_name = Column(String(150), nullable=True)
    city = Column(String(100), nullable=False)
    state = Column(String(100), nullable=False)
    estimated_delivery_days = Column(Integer, default=3, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
