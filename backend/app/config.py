import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    ENVIRONMENT: str = "development"
    PORT: int = 8000
    SECRET_KEY: str = "poornima_ai_ecommerce_secret_key_change_in_production_2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    DATABASE_URL: str = "sqlite:///./ecommerce.db"
    
    # Geocoding Nominatim
    NOMINATIM_USER_AGENT: str = "PoornimaAICommerceApp/1.0 (contact@poornima.edu.in)"
    NOMINATIM_RATE_LIMIT_DELAY: float = 1.0
    DEFAULT_SERVICEABLE_PINS: str = "302022,302029,302020,302017,302001,110001,400001,560001"
    ENABLE_LLM_REPHRASE: bool = False

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
