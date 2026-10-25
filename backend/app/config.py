import os

try:
    from pydantic_settings import BaseSettings

    class Settings(BaseSettings):
        ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
        PORT: int = int(os.getenv("PORT", "8000"))
        SECRET_KEY: str = os.getenv("SECRET_KEY", "poornima_ai_ecommerce_secret_key_change_in_production_2026")
        ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
        ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))
        DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./ecommerce.db")
        
        NOMINATIM_USER_AGENT: str = os.getenv("NOMINATIM_USER_AGENT", "PoornimaAICommerceApp/1.0 (contact@poornima.edu.in)")
        NOMINATIM_RATE_LIMIT_DELAY: float = float(os.getenv("NOMINATIM_RATE_LIMIT_DELAY", "1.0"))
        DEFAULT_SERVICEABLE_PINS: str = os.getenv("DEFAULT_SERVICEABLE_PINS", "302022,302029,302020,302017,302001,110001,400001,560001")
        ENABLE_LLM_REPHRASE: bool = os.getenv("ENABLE_LLM_REPHRASE", "false").lower() in ("true", "1")

        class Config:
            env_file = ".env"
            extra = "ignore"

    settings = Settings()

except ImportError:
    class FallbackSettings:
        ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
        PORT: int = int(os.getenv("PORT", "8000"))
        SECRET_KEY: str = os.getenv("SECRET_KEY", "poornima_ai_ecommerce_secret_key_change_in_production_2026")
        ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
        ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))
        DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./ecommerce.db")
        
        NOMINATIM_USER_AGENT: str = os.getenv("NOMINATIM_USER_AGENT", "PoornimaAICommerceApp/1.0 (contact@poornima.edu.in)")
        NOMINATIM_RATE_LIMIT_DELAY: float = float(os.getenv("NOMINATIM_RATE_LIMIT_DELAY", "1.0"))
        DEFAULT_SERVICEABLE_PINS: str = os.getenv("DEFAULT_SERVICEABLE_PINS", "302022,302029,302020,302017,302001,110001,400001,560001")
        ENABLE_LLM_REPHRASE: bool = os.getenv("ENABLE_LLM_REPHRASE", "false").lower() in ("true", "1")

    settings = FallbackSettings()
