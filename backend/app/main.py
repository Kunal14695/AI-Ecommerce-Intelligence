import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from .config import settings
from .database import engine, Base, SessionLocal
from .services.seed_service import seed_database
from .api import (
    auth, products, search, compare, recommendations,
    reviews, location, addresses, cart, orders, admin
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("app.main")

# Initialize database schema
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI Powered E-Commerce Customer Intelligence & Personalized Recommendation Platform",
    description="AI Powered E-Commerce Customer Intelligence Platform with Multi-Criteria AI Comparison Engine, Location-Aware Checkout, and Personalized Recommendations.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows frontend dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup event to auto-seed database with products, categories, reviews, and pins
@app.on_event("startup")
def startup_event():
    db = SessionLocal()
    try:
        seed_database(db)
    except Exception as e:
        logger.error(f"Error seeding database: {e}")
    finally:
        db.close()

# Include all module routers
app.include_router(auth.router)
app.include_router(products.router)
app.include_router(search.router)
app.include_router(compare.router)
app.include_router(recommendations.router)
app.include_router(reviews.router)
app.include_router(location.router)
app.include_router(addresses.router)
app.include_router(cart.router)
app.include_router(orders.router)
app.include_router(admin.router)

@app.get("/")
def root():
    return {
        "status": "online",
        "system": "AI Powered E-Commerce Platform",
        "version": "1.0.0",
        "documentation": "/docs",
        "project": "AI Powered E-Commerce Customer Intelligence Platform"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "ecommerce-api"}
