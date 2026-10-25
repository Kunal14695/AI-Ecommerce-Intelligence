"""
Database Seed Service
Populates categories, products, detailed specifications, synthetic reviews,
default serviceable PIN codes, and initial admin/customer accounts across all
e-commerce departments: Electronics, Fashion, Accessories, Jewelry, Furniture,
Automotive, and Personal Care.
"""

import logging
from sqlalchemy.orm import Session
from ..database import Base, engine
from ..models import (
    User, Category, Product, ProductSpecification,
    Review, ServiceableArea, Cart
)
from ..services.auth_service import hash_password
from ..ml.sentiment_analyzer import analyze_sentiment, extract_aspects

logger = logging.getLogger(__name__)

def seed_database(db: Session):
    """Initializes tables and seeds initial data if missing."""
    Base.metadata.create_all(bind=engine)

    logger.info("Verifying and seeding database catalog...")

    # 1. Create Default Users if not present
    admin_user = db.query(User).filter(User.email == "admin@poornima.edu.in").first()
    if not admin_user:
        admin_user = User(
            email="admin@poornima.edu.in",
            hashed_password=hash_password("Admin@123"),
            full_name="Admin User",
            role="admin"
        )
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)

    student_user = db.query(User).filter(User.email == "student@poornima.edu.in").first()
    if not student_user:
        student_user = User(
            email="student@poornima.edu.in",
            hashed_password=hash_password("Student@123"),
            full_name="Rohan Sharma",
            role="customer"
        )
        db.add(student_user)
        db.commit()
        db.refresh(student_user)

    demo_user = db.query(User).filter(User.email == "customer@poornima.edu.in").first()
    if not demo_user:
        demo_user = User(
            email="customer@poornima.edu.in",
            hashed_password=hash_password("Customer@123"),
            full_name="Priya Patel",
            role="customer"
        )
        db.add(demo_user)
        db.commit()
        db.refresh(demo_user)

    # Initialize carts if not existing
    for u in [student_user, demo_user]:
        if not db.query(Cart).filter(Cart.user_id == u.id).first():
            db.add(Cart(user_id=u.id))
    db.commit()

    # 2. Serviceable PIN Codes
    pin_data = [
        ("302022", "Sitapura Industrial Area", "Jaipur", "Rajasthan", 2),
        ("302029", "Sanganer", "Jaipur", "Rajasthan", 2),
        ("302020", "Mansarovar", "Jaipur", "Rajasthan", 2),
        ("302017", "Malviya Nagar", "Jaipur", "Rajasthan", 2),
        ("302001", "Jaipur GPO / C-Scheme", "Jaipur", "Rajasthan", 3),
        ("110001", "Connaught Place", "New Delhi", "Delhi", 3),
        ("400001", "Fort / Marine Lines", "Mumbai", "Maharashtra", 3),
        ("560001", "MG Road / Brigade", "Bengaluru", "Karnataka", 3),
    ]
    for pin, area, city, state, days in pin_data:
        if not db.query(ServiceableArea).filter(ServiceableArea.pincode == pin).first():
            db.add(ServiceableArea(
                pincode=pin,
                area_name=area,
                city=city,
                state=state,
                estimated_delivery_days=days,
                is_active=True
            ))
    db.commit()

    # 3. Categories Definition
    categories_def = [
        ("Smartphones", "smartphones", "Next-generation 5G mobile phones and flagships"),
        ("Laptops", "laptops", "Ultrabooks, gaming rigs, and high-performance workstations"),
        ("Audio & Headphones", "audio-headphones", "True wireless earbuds, studio monitors, and ANC headphones"),
        ("Fashion & Clothing", "fashion-clothing", "Men's & women's apparel, denim jeans, blazers, and activewear"),
        ("Fashion Accessories", "accessories", "Designer bags, genuine leather wallets, travel luggage, and sunglasses"),
        ("Jewelry & Watches", "jewelry-watches", "Hallmarked gold, sterling silver, diamond solitaires, and automatic timepieces"),
        ("Furniture & Living", "furniture-home", "Ergonomic work chairs, solid wood tables, comfort sofas, and smart lighting"),
        ("Automotive Accessories", "automotive", "2.7K car dashcams, certified helmets, digital inflators, and car care kits"),
        ("Beauty & Grooming", "beauty-grooming", "Precision electric trimmers, professional hair dryers, and luxury skincare")
    ]

    cat_map = {}
    for name, slug, desc in categories_def:
        cat = db.query(Category).filter(Category.slug == slug).first()
        if not cat:
            cat = Category(name=name, slug=slug, description=desc)
            db.add(cat)
            db.commit()
            db.refresh(cat)
        cat_map[slug] = cat

    # 4. Product Catalog Data Definition
    all_departments = [
        # --- Department 1: Smartphones ---
        ("smartphones", [
            {
                "brand": "Apple",
                "model_name": "iPhone 15 Pro",
                "title": "Apple iPhone 15 Pro (128GB, Natural Titanium)",
                "description": "Forged in titanium with aerospace-grade strength, featuring the groundbreaking A17 Pro chip and versatile 48MP camera system.",
                "price": 129900.0,
                "stock": 15,
                "warranty": 12,
                "image_url": "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80",
                "specs": [
                    {"name": "RAM", "raw_value": "8 GB", "numeric_value": 8.0, "unit": "GB", "is_benefit": True},
                    {"name": "Storage", "raw_value": "128 GB", "numeric_value": 128.0, "unit": "GB", "is_benefit": True},
                    {"name": "Battery", "raw_value": "3274 mAh", "numeric_value": 3274.0, "unit": "mAh", "is_benefit": True},
                    {"name": "Screen Refresh Rate", "raw_value": "120 Hz", "numeric_value": 120.0, "unit": "Hz", "is_benefit": True},
                    {"name": "Weight", "raw_value": "187 g", "numeric_value": 187.0, "unit": "g", "is_benefit": False},
                ]
            },
            {
                "brand": "Samsung",
                "model_name": "Galaxy S24 Ultra",
                "title": "Samsung Galaxy S24 Ultra 5G (12GB, 256GB, Titanium Gray)",
                "description": "Galaxy AI is here. Epic camera with 200MP sensor, integrated S Pen stylus, and durable titanium armor frame.",
                "price": 129999.0,
                "stock": 14,
                "warranty": 12,
                "image_url": "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&auto=format&fit=crop&q=80",
                "specs": [
                    {"name": "RAM", "raw_value": "12 GB", "numeric_value": 12.0, "unit": "GB", "is_benefit": True},
                    {"name": "Storage", "raw_value": "256 GB", "numeric_value": 256.0, "unit": "GB", "is_benefit": True},
                    {"name": "Battery", "raw_value": "5000 mAh", "numeric_value": 5000.0, "unit": "mAh", "is_benefit": True},
                    {"name": "Screen Refresh Rate", "raw_value": "120 Hz", "numeric_value": 120.0, "unit": "Hz", "is_benefit": True},
                    {"name": "Weight", "raw_value": "232 g", "numeric_value": 232.0, "unit": "g", "is_benefit": False},
                ]
            },
            {
                "brand": "OnePlus",
                "model_name": "12",
                "title": "OnePlus 12 5G (16GB, 512GB, Silky Black)",
                "description": "Snapdragon 8 Gen 3 flagship with 4th Gen Hasselblad Camera and ultra-fast 100W SUPERVOOC flash charge.",
                "price": 69999.0,
                "stock": 20,
                "warranty": 12,
                "image_url": "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop&q=80",
                "specs": [
                    {"name": "RAM", "raw_value": "16 GB", "numeric_value": 16.0, "unit": "GB", "is_benefit": True},
                    {"name": "Storage", "raw_value": "512 GB", "numeric_value": 512.0, "unit": "GB", "is_benefit": True},
                    {"name": "Battery", "raw_value": "5400 mAh", "numeric_value": 5400.0, "unit": "mAh", "is_benefit": True},
                    {"name": "Screen Refresh Rate", "raw_value": "120 Hz", "numeric_value": 120.0, "unit": "Hz", "is_benefit": True},
                    {"name": "Weight", "raw_value": "220 g", "numeric_value": 220.0, "unit": "g", "is_benefit": False},
                ]
            },
            {
                "brand": "Xiaomi",
                "model_name": "Redmi Note 13 Pro+",
                "title": "Xiaomi Redmi Note 13 Pro+ 5G (8GB, 256GB, Fusion Purple)",
                "description": "200MP OIS camera, 1.5K 120Hz curved AMOLED display, IP68 water resistance, and 120W HyperCharge.",
                "price": 31999.0,
                "stock": 25,
                "warranty": 12,
                "image_url": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80",
                "specs": [
                    {"name": "RAM", "raw_value": "8 GB", "numeric_value": 8.0, "unit": "GB", "is_benefit": True},
                    {"name": "Storage", "raw_value": "256 GB", "numeric_value": 256.0, "unit": "GB", "is_benefit": True},
                    {"name": "Battery", "raw_value": "5000 mAh", "numeric_value": 5000.0, "unit": "mAh", "is_benefit": True},
                    {"name": "Screen Refresh Rate", "raw_value": "120 Hz", "numeric_value": 120.0, "unit": "Hz", "is_benefit": True},
                    {"name": "Weight", "raw_value": "204 g", "numeric_value": 204.0, "unit": "g", "is_benefit": False},
                ]
            },
            {
                "brand": "Realme",
                "model_name": "12 Pro+",
                "title": "Realme 12 Pro+ 5G (8GB, 128GB, Submarine Blue)",
                "description": "Periscope portrait camera engineered with luxury watch design aesthetics and Sony IMX890 flagship sensor.",
                "price": 27999.0,
                "stock": 22,
                "warranty": 12,
                "image_url": "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600&auto=format&fit=crop&q=80",
                "specs": [
                    {"name": "RAM", "raw_value": "8 GB", "numeric_value": 8.0, "unit": "GB", "is_benefit": True},
                    {"name": "Storage", "raw_value": "128 GB", "numeric_value": 128.0, "unit": "GB", "is_benefit": True},
                    {"name": "Battery", "raw_value": "5000 mAh", "numeric_value": 5000.0, "unit": "mAh", "is_benefit": True},
                    {"name": "Screen Refresh Rate", "raw_value": "120 Hz", "numeric_value": 120.0, "unit": "Hz", "is_benefit": True},
                    {"name": "Weight", "raw_value": "196 g", "numeric_value": 196.0, "unit": "g", "is_benefit": False},
                ]
            },
            {
                "brand": "POCO",
                "model_name": "X6 Pro",
                "title": "POCO X6 Pro 5G (8GB, 256GB, Racing Yellow)",
                "description": "Dimensity 8300-Ultra speed monster with 1.5K Flow AMOLED display and WildBoost Gaming Optimization.",
                "price": 24999.0,
                "stock": 30,
                "warranty": 12,
                "image_url": "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&auto=format&fit=crop&q=80",
                "specs": [
                    {"name": "RAM", "raw_value": "8 GB", "numeric_value": 8.0, "unit": "GB", "is_benefit": True},
                    {"name": "Storage", "raw_value": "256 GB", "numeric_value": 256.0, "unit": "GB", "is_benefit": True},
                    {"name": "Battery", "raw_value": "5000 mAh", "numeric_value": 5000.0, "unit": "mAh", "is_benefit": True},
                    {"name": "Screen Refresh Rate", "raw_value": "120 Hz", "numeric_value": 120.0, "unit": "Hz", "is_benefit": True},
                    {"name": "Weight", "raw_value": "186 g", "numeric_value": 186.0, "unit": "g", "is_benefit": False},
                ]
            }
        ]),

        # --- Department 2: Laptops ---
        ("laptops", [
            {
                "brand": "Apple",
                "model_name": "MacBook Air M3",
                "title": "Apple MacBook Air 13-inch (M3 Chip, 16GB, 512GB SSD, Midnight)",
                "description": "Strikingly thin, blazing-fast M3 performance with up to 18 hours of battery life and Liquid Retina display.",
                "price": 134900.0,
                "stock": 10,
                "warranty": 12,
                "image_url": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80",
                "specs": [
                    {"name": "RAM", "raw_value": "16 GB", "numeric_value": 16.0, "unit": "GB", "is_benefit": True},
                    {"name": "Storage", "raw_value": "512 GB", "numeric_value": 512.0, "unit": "GB", "is_benefit": True},
                    {"name": "Battery", "raw_value": "18 hours", "numeric_value": 18.0, "unit": "hours", "is_benefit": True},
                    {"name": "Weight", "raw_value": "1.24 kg", "numeric_value": 1.24, "unit": "kg", "is_benefit": False},
                ]
            },
            {
                "brand": "Dell",
                "model_name": "XPS 13 Plus",
                "title": "Dell XPS 13 Plus 9320 (Intel Core i7-1360P, 16GB, 1TB SSD, 3.5K OLED)",
                "description": "Zero-lattice keyboard, invisible haptic glass touchpad, and breathtaking 3.5K OLED InfinityEdge touch display.",
                "price": 169990.0,
                "stock": 8,
                "warranty": 24,
                "image_url": "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=600&auto=format&fit=crop&q=80",
                "specs": [
                    {"name": "RAM", "raw_value": "16 GB", "numeric_value": 16.0, "unit": "GB", "is_benefit": True},
                    {"name": "Storage", "raw_value": "1000 GB", "numeric_value": 1000.0, "unit": "GB", "is_benefit": True},
                    {"name": "Battery", "raw_value": "12 hours", "numeric_value": 12.0, "unit": "hours", "is_benefit": True},
                    {"name": "Weight", "raw_value": "1.26 kg", "numeric_value": 1.26, "unit": "kg", "is_benefit": False},
                ]
            },
            {
                "brand": "ASUS",
                "model_name": "ROG Zephyrus G14",
                "title": "ASUS ROG Zephyrus G14 Gaming Laptop (Ryzen 9, RTX 4060, 16GB, 1TB, OLED 120Hz)",
                "description": "Ultraportable precision CNC aluminum gaming powerhouse with ROG Nebula 3K OLED 120Hz display.",
                "price": 149990.0,
                "stock": 12,
                "warranty": 12,
                "image_url": "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&auto=format&fit=crop&q=80",
                "specs": [
                    {"name": "RAM", "raw_value": "16 GB", "numeric_value": 16.0, "unit": "GB", "is_benefit": True},
                    {"name": "Storage", "raw_value": "1000 GB", "numeric_value": 1000.0, "unit": "GB", "is_benefit": True},
                    {"name": "Battery", "raw_value": "10 hours", "numeric_value": 10.0, "unit": "hours", "is_benefit": True},
                    {"name": "Weight", "raw_value": "1.5 kg", "numeric_value": 1.5, "unit": "kg", "is_benefit": False},
                ]
            },
            {
                "brand": "Lenovo",
                "model_name": "IdeaPad Slim 5",
                "title": "Lenovo IdeaPad Slim 5 14-inch (Core i5-13420H, 16GB, 512GB SSD, WUXGA OLED)",
                "description": "Military-grade durability, stunning WUXGA OLED vivid colors, and rapid fast charging for students.",
                "price": 64990.0,
                "stock": 25,
                "warranty": 24,
                "image_url": "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&auto=format&fit=crop&q=80",
                "specs": [
                    {"name": "RAM", "raw_value": "16 GB", "numeric_value": 16.0, "unit": "GB", "is_benefit": True},
                    {"name": "Storage", "raw_value": "512 GB", "numeric_value": 512.0, "unit": "GB", "is_benefit": True},
                    {"name": "Battery", "raw_value": "9 hours", "numeric_value": 9.0, "unit": "hours", "is_benefit": True},
                    {"name": "Weight", "raw_value": "1.46 kg", "numeric_value": 1.46, "unit": "kg", "is_benefit": False},
                ]
            }
        ]),

        # --- Department 3: Audio & Headphones ---
        ("audio-headphones", [
            {
                "brand": "Sony",
                "model_name": "WH-1000XM5",
                "title": "Sony WH-1000XM5 Wireless Noise Cancelling Headphones (Silver)",
                "description": "Industry-leading noise cancellation with 8 microphones, Auto NC Optimizer, and crystal-clear hands-free calling.",
                "price": 26990.0,
                "stock": 18,
                "warranty": 12,
                "image_url": "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&auto=format&fit=crop&q=80",
                "specs": [
                    {"name": "Battery Life", "raw_value": "30 hours", "numeric_value": 30.0, "unit": "hours", "is_benefit": True},
                    {"name": "Noise Cancellation", "raw_value": "Active Dual Chip", "numeric_value": 95.0, "unit": "%", "is_benefit": True},
                    {"name": "Weight", "raw_value": "250 g", "numeric_value": 250.0, "unit": "g", "is_benefit": False},
                ]
            },
            {
                "brand": "Apple",
                "model_name": "AirPods Pro (2nd Gen)",
                "title": "Apple AirPods Pro (2nd Generation, USB-C MagSafe Case)",
                "description": "Up to 2x more Active Noise Cancellation, Adaptive Audio, and Personalized Spatial Audio with dynamic head tracking.",
                "price": 23900.0,
                "stock": 25,
                "warranty": 12,
                "image_url": "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600&auto=format&fit=crop&q=80",
                "specs": [
                    {"name": "Battery Life", "raw_value": "30 hours with case", "numeric_value": 30.0, "unit": "hours", "is_benefit": True},
                    {"name": "Noise Cancellation", "raw_value": "Adaptive ANC", "numeric_value": 92.0, "unit": "%", "is_benefit": True},
                    {"name": "Weight", "raw_value": "56 g", "numeric_value": 56.0, "unit": "g", "is_benefit": False},
                ]
            },
            {
                "brand": "boAt",
                "model_name": "Airdopes 141",
                "title": "boAt Airdopes 141 Bluetooth True Wireless Earbuds (Bold Black)",
                "description": "42 hours playback, ENx environmental noise cancellation technology, and ASAP fast charge.",
                "price": 1299.0,
                "stock": 45,
                "warranty": 12,
                "image_url": "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80",
                "specs": [
                    {"name": "Battery Life", "raw_value": "42 hours", "numeric_value": 42.0, "unit": "hours", "is_benefit": True},
                    {"name": "Drivers", "raw_value": "8 mm Bass Drivers", "numeric_value": 8.0, "unit": "mm", "is_benefit": True},
                    {"name": "Weight", "raw_value": "60 g", "numeric_value": 60.0, "unit": "g", "is_benefit": False},
                ]
            }
        ]),

        # --- Department 4: Fashion & Clothing ---
        ("fashion-clothing", [
            {
                "brand": "Levi's",
                "model_name": "511 Slim Fit",
                "title": "Levi's Men's 511 Slim Fit Stretch Denim Jeans (Dark Indigo)",
                "description": "A modern slim fit with room to move. Crafted from premium stretch denim with authentic rivets and 5-pocket styling.",
                "price": 2799.0,
                "stock": 35,
                "warranty": 6,
                "image_url": "https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&auto=format&fit=crop&q=80",
                "specs": [
                    {"name": "Material", "raw_value": "98% Cotton, 2% Elastane", "numeric_value": 98.0, "unit": "% Cotton", "is_benefit": True},
                    {"name": "Fit Type", "raw_value": "Slim Fit", "numeric_value": 1.0, "unit": "type", "is_benefit": True},
                    {"name": "Stretchability", "raw_value": "Medium Flex", "numeric_value": 85.0, "unit": "%", "is_benefit": True},
                    {"name": "Fabric Weight", "raw_value": "520 g", "numeric_value": 520.0, "unit": "g", "is_benefit": False},
                ]
            },
            {
                "brand": "Raymond",
                "model_name": "Ceremonial Pure Wool Blazer",
                "title": "Raymond Pure Wool Charcoal Tailored Blazer for Men",
                "description": "Elegantly tailored from 100% fine Merino wool. Single-breasted two-button closure with luxurious silk-satin inner lining.",
                "price": 6999.0,
                "stock": 15,
                "warranty": 12,
                "image_url": "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&auto=format&fit=crop&q=80",
                "specs": [
                    {"name": "Material", "raw_value": "100% Merino Wool", "numeric_value": 100.0, "unit": "% Wool", "is_benefit": True},
                    {"name": "Fit", "raw_value": "Custom Tailored", "numeric_value": 1.0, "unit": "type", "is_benefit": True},
                    {"name": "Weight", "raw_value": "850 g", "numeric_value": 850.0, "unit": "g", "is_benefit": False},
                ]
            },
            {
                "brand": "Adidas",
                "model_name": "Originals Trefoil",
                "title": "Adidas Originals Trefoil French Terry Cotton Hoodie (Black)",
                "description": "Cozy everyday pullover hoodie in heavyweight French terry cotton with iconic Trefoil embroidered logo and kangaroo pocket.",
                "price": 3499.0,
                "stock": 28,
                "warranty": 6,
                "image_url": "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&auto=format&fit=crop&q=80",
                "specs": [
                    {"name": "Material", "raw_value": "100% French Terry Cotton", "numeric_value": 100.0, "unit": "% Cotton", "is_benefit": True},
                    {"name": "Fit", "raw_value": "Regular Comfort Fit", "numeric_value": 1.0, "unit": "type", "is_benefit": True},
                    {"name": "Fabric GSM", "raw_value": "360 GSM Heavyweight", "numeric_value": 360.0, "unit": "GSM", "is_benefit": True},
                    {"name": "Weight", "raw_value": "600 g", "numeric_value": 600.0, "unit": "g", "is_benefit": False},
                ]
            },
            {
                "brand": "Zara",
                "model_name": "Tiered Floral Chiffon",
                "title": "Zara Women's Floral Print Tiered Chiffon Maxi Dress",
                "description": "Airy tiered maxi dress in lightweight floral chiffon with ruffled neckline and detachable fabric tie belt.",
                "price": 3990.0,
                "stock": 20,
                "warranty": 6,
                "image_url": "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&auto=format&fit=crop&q=80",
                "specs": [
                    {"name": "Fabric", "raw_value": "100% Fine Chiffon with Lining", "numeric_value": 100.0, "unit": "%", "is_benefit": True},
                    {"name": "Length", "raw_value": "Maxi 54 inches", "numeric_value": 54.0, "unit": "inches", "is_benefit": True},
                    {"name": "Weight", "raw_value": "350 g", "numeric_value": 350.0, "unit": "g", "is_benefit": False},
                ]
            },
            {
                "brand": "Puma",
                "model_name": "DryCELL Active",
                "title": "Puma Men's DryFit High-Performance Athletic Tracksuit (Navy)",
                "description": "Engineered with DryCELL moisture-wicking technology to keep you dry and comfortable during training sessions.",
                "price": 2499.0,
                "stock": 30,
                "warranty": 6,
                "image_url": "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop&q=80",
                "specs": [
                    {"name": "Technology", "raw_value": "DryCELL Moisture Wicking", "numeric_value": 90.0, "unit": "% breathability", "is_benefit": True},
                    {"name": "Material", "raw_value": "Polyester Microfiber", "numeric_value": 100.0, "unit": "%", "is_benefit": True},
                    {"name": "Weight", "raw_value": "480 g", "numeric_value": 480.0, "unit": "g", "is_benefit": False},
                ]
            }
        ]),

        # --- Department 5: Fashion Accessories ---
        ("accessories", [
            {
                "brand": "Ray-Ban",
                "model_name": "Classic Aviator RB3025",
                "title": "Ray-Ban Classic Aviator Polarized Sunglasses (Gold Frame, G-15 Green)",
                "description": "Timeless icon originally designed for U.S. aviators in 1937. Crystal polarized lenses provide superior clarity and 100% UV400 shield.",
                "price": 7890.0,
                "stock": 16,
                "warranty": 24,
                "image_url": "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&auto=format&fit=crop&q=80",
                "specs": [
                    {"name": "UV Protection", "raw_value": "100% UV400 Protection", "numeric_value": 100.0, "unit": "%", "is_benefit": True},
                    {"name": "Lens Technology", "raw_value": "Polarized G-15 Crystal", "numeric_value": 99.0, "unit": "% glare cut", "is_benefit": True},
                    {"name": "Bridge Size", "raw_value": "14 mm", "numeric_value": 14.0, "unit": "mm", "is_benefit": True},
                    {"name": "Weight", "raw_value": "31 g", "numeric_value": 31.0, "unit": "g", "is_benefit": False},
                ]
            },
            {
                "brand": "Fossil",
                "model_name": "Derrick RFID Bifold",
                "title": "Fossil Derrick RFID Genuine Leather Bifold Wallet (Dark Brown)",
                "description": "Handcrafted from rich 100% genuine cowhide leather with a special RFID-blocking lining to guard against electronic theft.",
                "price": 2495.0,
                "stock": 40,
                "warranty": 12,
                "image_url": "https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&auto=format&fit=crop&q=80",
                "specs": [
                    {"name": "Material", "raw_value": "100% Genuine Full-Grain Leather", "numeric_value": 100.0, "unit": "%", "is_benefit": True},
                    {"name": "Card Capacity", "raw_value": "8 Card Slots + ID Window", "numeric_value": 8.0, "unit": "slots", "is_benefit": True},
                    {"name": "Security", "raw_value": "RFID Shielded", "numeric_value": 1.0, "unit": "spec", "is_benefit": True},
                    {"name": "Weight", "raw_value": "80 g", "numeric_value": 80.0, "unit": "g", "is_benefit": False},
                ]
            },
            {
                "brand": "Samsonite",
                "model_name": "Omni PC 20-inch",
                "title": "Samsonite Omni PC Hardside Carry-On Spinner Luggage (Caribbean Blue)",
                "description": "Micro-diamond textured 100% polycarbonate shell that is scratch resistant. Lightweight 360-degree dual spinner wheels and TSA lock.",
                "price": 8499.0,
                "stock": 14,
                "warranty": 36,
                "image_url": "https://images.unsplash.com/photo-1565026057447-bc90a3dceb87?w=600&auto=format&fit=crop&q=80",
                "specs": [
                    {"name": "Storage Capacity", "raw_value": "40 Liters", "numeric_value": 40.0, "unit": "Liters", "is_benefit": True},
                    {"name": "Shell Durability", "raw_value": "100% Polycarbonate", "numeric_value": 100.0, "unit": "%", "is_benefit": True},
                    {"name": "Weight", "raw_value": "3.1 kg", "numeric_value": 3.1, "unit": "kg", "is_benefit": False},
                ]
            },
            {
                "brand": "Michael Kors",
                "model_name": "Jet Set Travel",
                "title": "Michael Kors Saffiano Leather Shoulder Tote Bag (Luggage Brown)",
                "description": "Spacious tote crafted from water- and scratch-resistant Saffiano leather, complemented with polished gold-tone hardware and top zip closure.",
                "price": 14990.0,
                "stock": 12,
                "warranty": 12,
                "image_url": "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&auto=format&fit=crop&q=80",
                "specs": [
                    {"name": "Material", "raw_value": "Saffiano Genuine Leather", "numeric_value": 100.0, "unit": "%", "is_benefit": True},
                    {"name": "Drop Length", "raw_value": "9.5 inch Handle Drop", "numeric_value": 9.5, "unit": "inches", "is_benefit": True},
                    {"name": "Weight", "raw_value": "820 g", "numeric_value": 820.0, "unit": "g", "is_benefit": False},
                ]
            },
            {
                "brand": "Wildcraft",
                "model_name": "Rucksack 45L",
                "title": "Wildcraft 45L Tactical Adventure Travel Backpack (Army Green)",
                "description": "Ergonomic expedition backpack engineered with water-repellent nylon, air-mesh padded back support, and included rain cover.",
                "price": 2199.0,
                "stock": 35,
                "warranty": 60,
                "image_url": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80",
                "specs": [
                    {"name": "Capacity", "raw_value": "45 Liters", "numeric_value": 45.0, "unit": "Liters", "is_benefit": True},
                    {"name": "Fabric", "raw_value": "Ripstop High-Tenacity Nylon", "numeric_value": 420.0, "unit": "D", "is_benefit": True},
                    {"name": "Weight", "raw_value": "950 g", "numeric_value": 950.0, "unit": "g", "is_benefit": False},
                ]
            }
        ]),

        # --- Department 6: Jewelry & Watches ---
        ("jewelry-watches", [
            {
                "brand": "Tanishq",
                "model_name": "Floral Drop 22KT",
                "title": "Tanishq 22KT Yellow Gold Floral Drop Earrings (Hallmarked 916)",
                "description": "Intricate craftsmanship featuring traditional floral filigree drops in hallmarked 22 Karat pure gold with secure screw-back clasps.",
                "price": 38500.0,
                "stock": 8,
                "warranty": 24,
                "image_url": "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&auto=format&fit=crop&q=80",
                "specs": [
                    {"name": "Gold Purity", "raw_value": "22 Karat (916 BIS Hallmarked)", "numeric_value": 22.0, "unit": "KT", "is_benefit": True},
                    {"name": "Net Gold Weight", "raw_value": "4.85 g", "numeric_value": 4.85, "unit": "g", "is_benefit": True},
                    {"name": "Price per Gram", "raw_value": "₹7,938 / g", "numeric_value": 7938.0, "unit": "₹/g", "is_benefit": False},
                ]
            },
            {
                "brand": "GIVA",
                "model_name": "Heart of Romance",
                "title": "GIVA 925 Sterling Silver Zircon Heart Pendant Necklace",
                "description": "Sparkling AAA+ quality Swiss cubic zirconia set inside genuine 925 sterling silver with tarnish-resistant rhodium plating.",
                "price": 1899.0,
                "stock": 50,
                "warranty": 6,
                "image_url": "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&auto=format&fit=crop&q=80",
                "specs": [
                    {"name": "Silver Purity", "raw_value": "92.5% Pure Sterling Silver", "numeric_value": 92.5, "unit": "%", "is_benefit": True},
                    {"name": "Plating", "raw_value": "Anti-Tarnish Rhodium", "numeric_value": 1.0, "unit": "spec", "is_benefit": True},
                    {"name": "Weight", "raw_value": "3.5 g", "numeric_value": 3.5, "unit": "g", "is_benefit": False},
                ]
            },
            {
                "brand": "Seiko",
                "model_name": "Presage SRPB43",
                "title": "Seiko Presage Cocktail Time Automatic Watch (Sky Diving Dial)",
                "description": "Inspired by the classic cocktail lounge scene. Sunburst ice-blue textured dial, 4R35 automatic movement with 41-hour reserve, and box-shaped crystal.",
                "price": 39000.0,
                "stock": 10,
                "warranty": 36,
                "image_url": "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=600&auto=format&fit=crop&q=80",
                "specs": [
                    {"name": "Power Reserve", "raw_value": "41 Hours", "numeric_value": 41.0, "unit": "hours", "is_benefit": True},
                    {"name": "Jewels", "raw_value": "23 Jewels Automatic", "numeric_value": 23.0, "unit": "jewels", "is_benefit": True},
                    {"name": "Water Resistance", "raw_value": "50 Meters (5 Bar)", "numeric_value": 50.0, "unit": "m", "is_benefit": True},
                    {"name": "Case Diameter", "raw_value": "40.5 mm", "numeric_value": 40.5, "unit": "mm", "is_benefit": True},
                    {"name": "Weight", "raw_value": "70 g", "numeric_value": 70.0, "unit": "g", "is_benefit": False},
                ]
            },
            {
                "brand": "Casio",
                "model_name": "G-Shock GA-B2100",
                "title": "Casio G-Shock Carbon Core Guard All-Black Solar Watch",
                "description": "The Octagonal 'CasiOak' flagship. Carbon Core Guard shock-resistant structure, Tough Solar charging, and Bluetooth smartphone sync.",
                "price": 8495.0,
                "stock": 25,
                "warranty": 24,
                "image_url": "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&auto=format&fit=crop&q=80",
                "specs": [
                    {"name": "Water Resistance", "raw_value": "200 Meters (20 Bar)", "numeric_value": 200.0, "unit": "m", "is_benefit": True},
                    {"name": "Battery Life", "raw_value": "Tough Solar Unlimited", "numeric_value": 100.0, "unit": "% solar", "is_benefit": True},
                    {"name": "Weight", "raw_value": "52 g", "numeric_value": 52.0, "unit": "g", "is_benefit": False},
                ]
            },
            {
                "brand": "Tanishq",
                "model_name": "Mia 14KT Solitaire",
                "title": "Mia by Tanishq 14KT Rose Gold Diamond Solitaire Ring",
                "description": "Dainty rose gold ring set with a brilliant round natural diamond solitaire in 14KT hallmarked gold.",
                "price": 21999.0,
                "stock": 12,
                "warranty": 12,
                "image_url": "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&auto=format&fit=crop&q=80",
                "specs": [
                    {"name": "Gold Purity", "raw_value": "14 Karat Rose Gold", "numeric_value": 14.0, "unit": "KT", "is_benefit": True},
                    {"name": "Diamond Weight", "raw_value": "0.12 Carats (SI Clarity, I-J Color)", "numeric_value": 0.12, "unit": "ct", "is_benefit": True},
                    {"name": "Weight", "raw_value": "2.2 g", "numeric_value": 2.2, "unit": "g", "is_benefit": False},
                ]
            }
        ]),

        # --- Department 7: Furniture & Living ---
        ("furniture-home", [
            {
                "brand": "Green Soul",
                "model_name": "Monster Ultimate T",
                "title": "Green Soul Monster Ultimate Ergonomic Gaming & Work Chair",
                "description": "Engineered for 12+ hours sitting comfort. Breathable spandex fabric, 4D adjustable armrests, heavy frog tilt mechanism, and memory foam lumbar support.",
                "price": 16990.0,
                "stock": 15,
                "warranty": 36,
                "image_url": "https://images.unsplash.com/photo-1580481077195-c3a821a58875?w=600&auto=format&fit=crop&q=80",
                "specs": [
                    {"name": "Weight Capacity", "raw_value": "135 kg", "numeric_value": 135.0, "unit": "kg", "is_benefit": True},
                    {"name": "Recline Angle", "raw_value": "180 Degrees Tilt", "numeric_value": 180.0, "unit": "deg", "is_benefit": True},
                    {"name": "Gas Lift", "raw_value": "Class 4 Hydraulic", "numeric_value": 4.0, "unit": "class", "is_benefit": True},
                    {"name": "Chair Weight", "raw_value": "23 kg", "numeric_value": 23.0, "unit": "kg", "is_benefit": False},
                ]
            },
            {
                "brand": "Wakefit",
                "model_name": "Dual Comfort Queen",
                "title": "Wakefit Dual Comfort 8-Inch Memory Foam Queen Mattress (78x60 in)",
                "description": "Reversible design with one medium-soft side for contouring comfort and one firm side for orthopedic spine alignment.",
                "price": 11499.0,
                "stock": 20,
                "warranty": 84,
                "image_url": "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&auto=format&fit=crop&q=80",
                "specs": [
                    {"name": "Thickness", "raw_value": "8 Inches (20.3 cm)", "numeric_value": 8.0, "unit": "inches", "is_benefit": True},
                    {"name": "Density", "raw_value": "High Resilience Foam + CoolGel", "numeric_value": 50.0, "unit": "D", "is_benefit": True},
                    {"name": "Weight", "raw_value": "18 kg", "numeric_value": 18.0, "unit": "kg", "is_benefit": False},
                ]
            },
            {
                "brand": "Urban Ladder",
                "model_name": "Rhodes 6-Seater",
                "title": "Urban Ladder Solid Sheesham Wood 6-Seater Dining Table (Honey Finish)",
                "description": "Crafted from kiln-dried Grade-A solid Indian rosewood (Sheesham) with natural grains, treated against termites with warm lacquer polish.",
                "price": 24999.0,
                "stock": 8,
                "warranty": 12,
                "image_url": "https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?w=600&auto=format&fit=crop&q=80",
                "specs": [
                    {"name": "Wood Type", "raw_value": "100% Solid Sheesham Rosewood", "numeric_value": 100.0, "unit": "%", "is_benefit": True},
                    {"name": "Seating", "raw_value": "6 Persons", "numeric_value": 6.0, "unit": "seats", "is_benefit": True},
                    {"name": "Table Weight", "raw_value": "42 kg", "numeric_value": 42.0, "unit": "kg", "is_benefit": False},
                ]
            },
            {
                "brand": "Sleepyhead",
                "model_name": "Bae 3-Seater",
                "title": "Sleepyhead Bae 3-Seater High Density Foam Fabric Sofa (Charcoal)",
                "description": "Mid-century modern aesthetic with high-density foam cushions and solid Sal wood internal framing for resilient lounging.",
                "price": 18499.0,
                "stock": 10,
                "warranty": 36,
                "image_url": "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&auto=format&fit=crop&q=80",
                "specs": [
                    {"name": "Foam Density", "raw_value": "32 D High Resilience", "numeric_value": 32.0, "unit": "D", "is_benefit": True},
                    {"name": "Frame", "raw_value": "Solid Sal Hardwood", "numeric_value": 1.0, "unit": "spec", "is_benefit": True},
                    {"name": "Weight", "raw_value": "38 kg", "numeric_value": 38.0, "unit": "kg", "is_benefit": False},
                ]
            },
            {
                "brand": "Philips",
                "model_name": "Smart Wi-Fi LED Lamp",
                "title": "Philips Smart Wi-Fi Tunable White & Color LED Desk Lamp (9W)",
                "description": "16 million colors plus tunable white light (2200K - 6500K). Syncs with Alexa, Google Home, and Apple Siri for smart automation.",
                "price": 2999.0,
                "stock": 35,
                "warranty": 24,
                "image_url": "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&auto=format&fit=crop&q=80",
                "specs": [
                    {"name": "Brightness", "raw_value": "650 Lumens", "numeric_value": 650.0, "unit": "lm", "is_benefit": True},
                    {"name": "Color Range", "raw_value": "16 Million Colors RGB", "numeric_value": 16.0, "unit": "M colors", "is_benefit": True},
                    {"name": "Power Consumption", "raw_value": "9 Watts Energy Saver", "numeric_value": 9.0, "unit": "W", "is_benefit": False},
                    {"name": "Weight", "raw_value": "550 g", "numeric_value": 550.0, "unit": "g", "is_benefit": False},
                ]
            }
        ]),

        # --- Department 8: Automotive Accessories ---
        ("automotive", [
            {
                "brand": "70mai",
                "model_name": "A500S Pro Plus+",
                "title": "70mai A500S Dual Vision Pro Plus 2.7K Dash Camera with Rear Cam",
                "description": "Crystal-clear 1944P 2.7K recording powered by Sony IMX335 sensor, built-in GPS log, ADAS lane departure warning, and 24h parking surveillance.",
                "price": 9999.0,
                "stock": 20,
                "warranty": 12,
                "image_url": "https://images.unsplash.com/photo-1508974239320-0a029497e820?w=600&auto=format&fit=crop&q=80",
                "specs": [
                    {"name": "Resolution", "raw_value": "2.7K 1944P QHD", "numeric_value": 1944.0, "unit": "p", "is_benefit": True},
                    {"name": "Field of View", "raw_value": "140 Degrees Wide Angle", "numeric_value": 140.0, "unit": "deg", "is_benefit": True},
                    {"name": "Night Vision", "raw_value": "F1.8 Aperture with 3D DNR", "numeric_value": 1.8, "unit": "F-stop", "is_benefit": False},
                    {"name": "Weight", "raw_value": "180 g", "numeric_value": 180.0, "unit": "g", "is_benefit": False},
                ]
            },
            {
                "brand": "Steelbird",
                "model_name": "SBH-17 Terminator",
                "title": "Steelbird SBH-17 Terminator Full Face Helmet (ISI Certified)",
                "description": "High-impact ABS shell with dynamic air ventilation system, quick-release micrometric chin strap buckle, and anti-scratch optical polycarbonate visor.",
                "price": 2849.0,
                "stock": 30,
                "warranty": 12,
                "image_url": "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=600&auto=format&fit=crop&q=80",
                "specs": [
                    {"name": "Safety Certification", "raw_value": "ISI Certified (IS:4151)", "numeric_value": 1.0, "unit": "spec", "is_benefit": True},
                    {"name": "Shell Material", "raw_value": "High Impact Engineering ABS", "numeric_value": 100.0, "unit": "%", "is_benefit": True},
                    {"name": "Weight", "raw_value": "1350 g", "numeric_value": 1350.0, "unit": "g", "is_benefit": False},
                ]
            },
            {
                "brand": "Bosch",
                "model_name": "EasyPump Cordless",
                "title": "Bosch EasyPump Cordless Electric High-Pressure Tyre Inflator (150 PSI)",
                "description": "Compact rechargeable tyre pump for cars, motorcycles, and bicycles. Auto-stop at target pressure, USB-C fast charging, and backlit digital screen.",
                "price": 4890.0,
                "stock": 18,
                "warranty": 12,
                "image_url": "https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=600&auto=format&fit=crop&q=80",
                "specs": [
                    {"name": "Max Pressure", "raw_value": "150 PSI (10.3 Bar)", "numeric_value": 150.0, "unit": "PSI", "is_benefit": True},
                    {"name": "Air Flow Rate", "raw_value": "10 Liters/Minute", "numeric_value": 10.0, "unit": "L/min", "is_benefit": True},
                    {"name": "Battery", "raw_value": "3.6V 3.0Ah USB-C Rechargeable", "numeric_value": 3000.0, "unit": "mAh", "is_benefit": True},
                    {"name": "Weight", "raw_value": "430 g", "numeric_value": 430.0, "unit": "g", "is_benefit": False},
                ]
            },
            {
                "brand": "Wavex",
                "model_name": "Carnauba Gold Kit",
                "title": "Wavex Carnauba Wax Car Polish & Deep Mirror Gloss Kit",
                "description": "Formulated with pure Brazilian carnauba wax emulsion. Delivers hydrophobic water-beading coat that shields paint from UV rays and road grime.",
                "price": 1199.0,
                "stock": 40,
                "warranty": 24,
                "image_url": "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=600&auto=format&fit=crop&q=80",
                "specs": [
                    {"name": "Protection Duration", "raw_value": "6 Months Hydrophobic Shield", "numeric_value": 6.0, "unit": "months", "is_benefit": True},
                    {"name": "Wax Net Weight", "raw_value": "350 g Pure Carnauba Paste", "numeric_value": 350.0, "unit": "g", "is_benefit": True},
                    {"name": "Kit Contents", "raw_value": "Paste + 2 Microfiber Towels + Sponge", "numeric_value": 4.0, "unit": "items", "is_benefit": True},
                ]
            },
            {
                "brand": "Qubo",
                "model_name": "Smart Car Purifier",
                "title": "Qubo Smart Car Air Purifier with True HEPA Filter & Air Ionizer",
                "description": "Rapidly filters smoke, fine PM2.5 particles, and odor in vehicle cabins within 6 minutes. Real-time air quality LED indicator and ultra-silent operation.",
                "price": 2490.0,
                "stock": 25,
                "warranty": 12,
                "image_url": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80",
                "specs": [
                    {"name": "CADR", "raw_value": "25 m³/h Fast Air Delivery", "numeric_value": 25.0, "unit": "m³/h", "is_benefit": True},
                    {"name": "Filtration", "raw_value": "3-Stage True HEPA + Activated Carbon", "numeric_value": 99.97, "unit": "% PM2.5", "is_benefit": True},
                    {"name": "Noise Level", "raw_value": "Under 30 dB Whisper Quiet", "numeric_value": 30.0, "unit": "dB", "is_benefit": False},
                    {"name": "Weight", "raw_value": "340 g", "numeric_value": 340.0, "unit": "g", "is_benefit": False},
                ]
            }
        ]),

        # --- Department 9: Beauty & Grooming ---
        ("beauty-grooming", [
            {
                "brand": "Philips",
                "model_name": "Series 5000 Trimmer",
                "title": "Philips Series 5000 Wet & Dry Electric Beard Trimmer (BT5515)",
                "description": "Lift & Trim PRO system guides low-lying hairs to self-sharpening titanium blades. 40 length settings with 0.2mm precision and 90min cordless runtime.",
                "price": 2495.0,
                "stock": 35,
                "warranty": 24,
                "image_url": "https://images.unsplash.com/photo-1621607512214-68297480165e?w=600&auto=format&fit=crop&q=80",
                "specs": [
                    {"name": "Battery Runtime", "raw_value": "90 Minutes Cordless", "numeric_value": 90.0, "unit": "min", "is_benefit": True},
                    {"name": "Precision Steps", "raw_value": "40 Length Settings (0.2mm)", "numeric_value": 40.0, "unit": "settings", "is_benefit": True},
                    {"name": "Waterproofing", "raw_value": "100% Fully Washable IPX7", "numeric_value": 1.0, "unit": "spec", "is_benefit": True},
                    {"name": "Weight", "raw_value": "220 g", "numeric_value": 220.0, "unit": "g", "is_benefit": False},
                ]
            },
            {
                "brand": "Dyson",
                "model_name": "Supersonic HD07",
                "title": "Dyson Supersonic Intelligent Heat Control Hair Dryer (Iron/Fuchsia)",
                "description": "Fast drying with no extreme heat damage. V9 digital motor spins at 110,000 RPM, measuring air temperature 40 times a second to prevent hair burn.",
                "price": 32900.0,
                "stock": 10,
                "warranty": 24,
                "image_url": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop&q=80",
                "specs": [
                    {"name": "Motor Speed", "raw_value": "110,000 RPM Digital V9", "numeric_value": 110000.0, "unit": "RPM", "is_benefit": True},
                    {"name": "Heat Sensor", "raw_value": "Measures 40x per second", "numeric_value": 40.0, "unit": "Hz", "is_benefit": True},
                    {"name": "Power", "raw_value": "1600 Watts", "numeric_value": 1600.0, "unit": "W", "is_benefit": True},
                    {"name": "Weight", "raw_value": "650 g", "numeric_value": 650.0, "unit": "g", "is_benefit": False},
                ]
            },
            {
                "brand": "Forest Essentials",
                "model_name": "Soundarya 24K Gold",
                "title": "Forest Essentials Soundarya Radiance 24K Gold Face Cream (50g)",
                "description": "Ancient Ayurvedic formulation infused with pure 24 Karat gold bhasma, saffron, cow's ghee, and sweet almond oil to restore skin elasticity and radiance.",
                "price": 5800.0,
                "stock": 15,
                "warranty": 24,
                "image_url": "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop&q=80",
                "specs": [
                    {"name": "Gold Bhasma", "raw_value": "24 Karat Pure Colloidal Gold", "numeric_value": 24.0, "unit": "KT", "is_benefit": True},
                    {"name": "Sun Protection", "raw_value": "SPF 25 Natural Mineral Sunscreen", "numeric_value": 25.0, "unit": "SPF", "is_benefit": True},
                    {"name": "Volume", "raw_value": "50 g Net Weight", "numeric_value": 50.0, "unit": "g", "is_benefit": True},
                ]
            }
        ])
    ]

    # Sample reviews pool for natural sentiment extraction
    sample_reviews = [
        (5, "Exceptional quality and performance! The materials feel luxurious and durable. Worth every rupee!"),
        (5, "Outstanding build and flawless finishing. Exactly as described and works like a dream."),
        (4, "Very high quality for this price point. Arrived in 24 hours, packaging was superb and safe."),
        (5, "Brilliant purchase! Highly recommend this over any competitor in this price range."),
        (4, "Solid everyday performance and very comfortable to use. Looks stylish and premium."),
        (3, "Good product overall. Meets expectations, though delivery took 2 days instead of same day."),
        (4, "Very satisfied with the purchase. Beautiful design and excellent craftsmanship."),
        (3, "Standard quality for the budget. Does the job reliably, but not super luxury."),
        (2, "Decent design, but expected slightly better finish given the brand reputation."),
        (5, "Top notch! Five stars without hesitation. Exceeded my expectations.")
    ]

    users_pool = [admin_user, student_user, demo_user]
    total_added = 0

    for cat_slug, items in all_departments:
        category = cat_map.get(cat_slug)
        if not category:
            continue

        for i, item in enumerate(items):
            existing_prod = db.query(Product).filter(Product.title == item["title"]).first()
            if existing_prod:
                continue

            prod = Product(
                category_id=category.id,
                brand=item["brand"],
                model_name=item["model_name"],
                title=item["title"],
                description=item["description"],
                price=item["price"],
                stock=item.get("stock", 15),
                is_available=True,
                warranty_months=item.get("warranty", 12),
                image_url=item.get("image_url")
            )
            db.add(prod)
            db.commit()
            db.refresh(prod)

            # Add specs
            for spec in item.get("specs", []):
                db.add(ProductSpecification(
                    product_id=prod.id,
                    name=spec["name"],
                    raw_value=spec["raw_value"],
                    numeric_value=spec.get("numeric_value"),
                    unit=spec.get("unit"),
                    is_benefit=spec.get("is_benefit", True)
                ))

            # Add 2 synthetic reviews with NLP sentiment
            for u_idx, u in enumerate(users_pool[:2]):
                template = sample_reviews[(i + u_idx) % len(sample_reviews)]
                rating = template[0]
                text = template[1]
                sentiment_data = analyze_sentiment(text)
                aspects = extract_aspects(text, sentiment_data["compound"])

                db.add(Review(
                    product_id=prod.id,
                    user_id=u.id,
                    rating=rating,
                    review_text=text,
                    sentiment_score=sentiment_data["compound"],
                    sentiment_label=sentiment_data["label"],
                    aspect_tags=",".join(aspects)
                ))

            db.commit()
            total_added += 1

    total_prods = db.query(Product).count()
    total_cats = db.query(Category).count()
    logger.info(f"Database seed verified: {total_cats} categories, {total_prods} products ({total_added} newly added).")
