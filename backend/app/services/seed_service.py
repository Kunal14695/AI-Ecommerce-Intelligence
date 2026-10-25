"""
Database Seed Service
Populates categories, products, detailed specifications, synthetic reviews,
default serviceable PIN codes, and initial admin/customer accounts.
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
    """Initializes tables and seeds initial data if database is empty."""
    Base.metadata.create_all(bind=engine)

    # Check if already seeded
    if db.query(Product).count() > 0:
        logger.info("Database already seeded.")
        return

    logger.info("Seeding database with categories, products, specs, reviews, and PIN codes...")

    # 1. Create Default Users
    admin_user = User(
        email="admin@poornima.edu.in",
        hashed_password=hash_password("Admin@123"),
        full_name="Admin User",
        role="admin"
    )
    student_user = User(
        email="student@poornima.edu.in",
        hashed_password=hash_password("Student@123"),
        full_name="Rohan Sharma",
        role="customer"
    )
    demo_user = User(
        email="customer@poornima.edu.in",
        hashed_password=hash_password("Customer@123"),
        full_name="Priya Patel",
        role="customer"
    )
    db.add_all([admin_user, student_user, demo_user])
    db.commit()
    db.refresh(admin_user)
    db.refresh(student_user)
    db.refresh(demo_user)

    # Initialize empty cart for demo user
    db.add(Cart(user_id=student_user.id))
    db.add(Cart(user_id=demo_user.id))
    db.commit()

    # 2. Serviceable PIN Codes (Jaipur / Delhi / Mumbai / Bangalore hubs)
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
        db.add(ServiceableArea(
            pincode=pin,
            area_name=area,
            city=city,
            state=state,
            estimated_delivery_days=days,
            is_active=True
        ))
    db.commit()

    # 3. Categories
    cat_smartphones = Category(name="Smartphones", slug="smartphones", description="Next-generation 5G mobile phones")
    cat_laptops = Category(name="Laptops", slug="laptops", description="Ultrabooks, gaming and productivity workstations")
    cat_audio = Category(name="Audio & Headphones", slug="audio-headphones", description="True wireless earbuds and ANC headphones")
    
    db.add_all([cat_smartphones, cat_laptops, cat_audio])
    db.commit()
    db.refresh(cat_smartphones)
    db.refresh(cat_laptops)
    db.refresh(cat_audio)

    # 4. Products and Specifications
    # Category 1: Smartphones (12 products)
    smartphones_data = [
        {
            "brand": "Apple",
            "model_name": "iPhone 15 Pro",
            "title": "Apple iPhone 15 Pro (128GB, Natural Titanium)",
            "description": "Forged in titanium with aerospace-grade strength, featuring the groundbreaking A17 Pro chip and versatile 48MP camera system.",
            "price": 129900.0,
            "stock": 15,
            "warranty_months": 12,
            "image_url": "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80",
            "specs": [
                ("RAM", "8 GB", "GB", 8.0, True),
                ("Storage", "128 GB", "GB", 128.0, True),
                ("Battery", "3274 mAh", "mAh", 3274.0, True),
                ("Display Refresh Rate", "120 Hz", "Hz", 120.0, True),
                ("Camera Megapixels", "48 MP", "MP", 48.0, True),
                ("Weight", "187 g", "g", 187.0, False),  # Cost
                ("Fast Charging", "25 W", "W", 25.0, True),
            ]
        },
        {
            "brand": "Samsung",
            "model_name": "Galaxy S24 Ultra",
            "title": "Samsung Galaxy S24 Ultra 5G (256GB, Titanium Gray)",
            "description": "Galaxy AI powerhouse with Snapdragon 8 Gen 3, quad telephoto camera, integrated S-Pen and ultra-bright dynamic AMOLED.",
            "price": 129999.0,
            "stock": 18,
            "warranty_months": 12,
            "image_url": "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&auto=format&fit=crop&q=80",
            "specs": [
                ("RAM", "12 GB", "GB", 12.0, True),
                ("Storage", "256 GB", "GB", 256.0, True),
                ("Battery", "5000 mAh", "mAh", 5000.0, True),
                ("Display Refresh Rate", "120 Hz", "Hz", 120.0, True),
                ("Camera Megapixels", "200 MP", "MP", 200.0, True),
                ("Weight", "232 g", "g", 232.0, False),  # Cost
                ("Fast Charging", "45 W", "W", 45.0, True),
            ]
        },
        {
            "brand": "OnePlus",
            "model_name": "OnePlus 12",
            "title": "OnePlus 12 5G (16GB RAM, 512GB, Silky Black)",
            "description": "High performance flagship featuring 4th Gen Hasselblad Camera, Snapdragon 8 Gen 3, and 100W SUPERVOOC charging.",
            "price": 69999.0,
            "stock": 25,
            "warranty_months": 12,
            "image_url": "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop&q=80",
            "specs": [
                ("RAM", "16 GB", "GB", 16.0, True),
                ("Storage", "512 GB", "GB", 512.0, True),
                ("Battery", "5400 mAh", "mAh", 5400.0, True),
                ("Display Refresh Rate", "120 Hz", "Hz", 120.0, True),
                ("Camera Megapixels", "50 MP", "MP", 50.0, True),
                ("Weight", "220 g", "g", 220.0, False),
                ("Fast Charging", "100 W", "W", 100.0, True),
            ]
        },
        {
            "brand": "Google",
            "model_name": "Pixel 8 Pro",
            "title": "Google Pixel 8 Pro (128GB, Bay Blue)",
            "description": "Engineered by Google with Google Tensor G3 chip, advanced AI computational photography, and Super Actua display.",
            "price": 99999.0,
            "stock": 12,
            "warranty_months": 12,
            "image_url": "https://images.unsplash.com/photo-1598327105854-c8674faddf79?w=600&auto=format&fit=crop&q=80",
            "specs": [
                ("RAM", "12 GB", "GB", 12.0, True),
                ("Storage", "128 GB", "GB", 128.0, True),
                ("Battery", "5050 mAh", "mAh", 5050.0, True),
                ("Display Refresh Rate", "120 Hz", "Hz", 120.0, True),
                ("Camera Megapixels", "50 MP", "MP", 50.0, True),
                ("Weight", "213 g", "g", 213.0, False),
                ("Fast Charging", "30 W", "W", 30.0, True),
            ]
        },
        {
            "brand": "Xiaomi",
            "model_name": "Redmi Note 13 Pro+",
            "title": "Xiaomi Redmi Note 13 Pro+ 5G (8GB, 256GB, Fusion Purple)",
            "description": "Curved 1.5K AMOLED display, 200MP camera with OIS, IP68 water resistance, and 120W HyperCharge at budget-friendly price.",
            "price": 31999.0,
            "stock": 30,
            "warranty_months": 12,
            "image_url": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80",
            "specs": [
                ("RAM", "8 GB", "GB", 8.0, True),
                ("Storage", "256 GB", "GB", 256.0, True),
                ("Battery", "5000 mAh", "mAh", 5000.0, True),
                ("Display Refresh Rate", "120 Hz", "Hz", 120.0, True),
                ("Camera Megapixels", "200 MP", "MP", 200.0, True),
                ("Weight", "204 g", "g", 204.0, False),
                ("Fast Charging", "120 W", "W", 120.0, True),
            ]
        },
        {
            "brand": "Nothing",
            "model_name": "Phone (2)",
            "title": "Nothing Phone (2) 5G (12GB, 256GB, Dark Grey)",
            "description": "Unique Glyph Interface, Snapdragon 8+ Gen 1, dual 50MP Sony sensors, and clean Nothing OS 2.5 experience.",
            "price": 39999.0,
            "stock": 20,
            "warranty_months": 12,
            "image_url": "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600&auto=format&fit=crop&q=80",
            "specs": [
                ("RAM", "12 GB", "GB", 12.0, True),
                ("Storage", "256 GB", "GB", 256.0, True),
                ("Battery", "4700 mAh", "mAh", 4700.0, True),
                ("Display Refresh Rate", "120 Hz", "Hz", 120.0, True),
                ("Camera Megapixels", "50 MP", "MP", 50.0, True),
                ("Weight", "201 g", "g", 201.0, False),
                ("Fast Charging", "45 W", "W", 45.0, True),
            ]
        },
        {
            "brand": "Realme",
            "model_name": "12 Pro+ 5G",
            "title": "Realme 12 Pro+ 5G (8GB, 128GB, Submarine Blue)",
            "description": "Periscope portrait camera luxury watch design with Snapdragon 7s Gen 2 and 120Hz curved vision display.",
            "price": 29999.0,
            "stock": 25,
            "warranty_months": 12,
            "image_url": "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=600&auto=format&fit=crop&q=80",
            "specs": [
                ("RAM", "8 GB", "GB", 8.0, True),
                ("Storage", "128 GB", "GB", 128.0, True),
                ("Battery", "5000 mAh", "mAh", 5000.0, True),
                ("Display Refresh Rate", "120 Hz", "Hz", 120.0, True),
                ("Camera Megapixels", "64 MP", "MP", 64.0, True),
                ("Weight", "196 g", "g", 196.0, False),
                ("Fast Charging", "67 W", "W", 67.0, True),
            ]
        },
        {
            "brand": "Vivo",
            "model_name": "X100 Pro",
            "title": "Vivo X100 Pro 5G (16GB, 512GB, Asteroid Black)",
            "description": "ZEISS APO Telephoto camera system, MediaTek Dimensity 9300 processor, and customized V3 imaging chip.",
            "price": 89999.0,
            "stock": 14,
            "warranty_months": 12,
            "image_url": "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&auto=format&fit=crop&q=80",
            "specs": [
                ("RAM", "16 GB", "GB", 16.0, True),
                ("Storage", "512 GB", "GB", 512.0, True),
                ("Battery", "5400 mAh", "mAh", 5400.0, True),
                ("Display Refresh Rate", "120 Hz", "Hz", 120.0, True),
                ("Camera Megapixels", "50 MP", "MP", 50.0, True),
                ("Weight", "225 g", "g", 225.0, False),
                ("Fast Charging", "100 W", "W", 100.0, True),
            ]
        },
        {
            "brand": "Motorola",
            "model_name": "Edge 50 Pro",
            "title": "Motorola Edge 50 Pro (12GB, 256GB, Black Beauty)",
            "description": "Pantone validated camera and display, vegan leather back, IP68 underwater protection, and 125W TurboPower.",
            "price": 35999.0,
            "stock": 22,
            "warranty_months": 12,
            "image_url": "https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=600&auto=format&fit=crop&q=80",
            "specs": [
                ("RAM", "12 GB", "GB", 12.0, True),
                ("Storage", "256 GB", "GB", 256.0, True),
                ("Battery", "4500 mAh", "mAh", 4500.0, True),
                ("Display Refresh Rate", "144 Hz", "Hz", 144.0, True),
                ("Camera Megapixels", "50 MP", "MP", 50.0, True),
                ("Weight", "186 g", "g", 186.0, False),
                ("Fast Charging", "125 W", "W", 125.0, True),
            ]
        },
        {
            "brand": "iQOO",
            "model_name": "12 5G",
            "title": "iQOO 12 5G (12GB, 256GB, Legend White)",
            "description": "Extreme gaming phone with Snapdragon 8 Gen 3, Supercomputing Chip Q1, 144Hz AMOLED, and 120W FlashCharge.",
            "price": 52999.0,
            "stock": 16,
            "warranty_months": 12,
            "image_url": "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&auto=format&fit=crop&q=80",
            "specs": [
                ("RAM", "12 GB", "GB", 12.0, True),
                ("Storage", "256 GB", "GB", 256.0, True),
                ("Battery", "5000 mAh", "mAh", 5000.0, True),
                ("Display Refresh Rate", "144 Hz", "Hz", 144.0, True),
                ("Camera Megapixels", "50 MP", "MP", 50.0, True),
                ("Weight", "203 g", "g", 203.0, False),
                ("Fast Charging", "120 W", "W", 120.0, True),
            ]
        },
        {
            "brand": "POCO",
            "model_name": "X6 Pro 5G",
            "title": "POCO X6 Pro 5G (8GB, 256GB, Racing Yellow)",
            "description": "Dimensity 8300-Ultra speed champion, 120Hz Flow AMOLED display, and 64MP triple camera with OIS.",
            "price": 24999.0,
            "stock": 35,
            "warranty_months": 12,
            "image_url": "https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=600&auto=format&fit=crop&q=80",
            "specs": [
                ("RAM", "8 GB", "GB", 8.0, True),
                ("Storage", "256 GB", "GB", 256.0, True),
                ("Battery", "5000 mAh", "mAh", 5000.0, True),
                ("Display Refresh Rate", "120 Hz", "Hz", 120.0, True),
                ("Camera Megapixels", "64 MP", "MP", 64.0, True),
                ("Weight", "186 g", "g", 186.0, False),
                ("Fast Charging", "67 W", "W", 67.0, True),
            ]
        },
        {
            "brand": "Samsung",
            "model_name": "Galaxy A55 5G",
            "title": "Samsung Galaxy A55 5G (8GB, 128GB, Awesome Navy)",
            "description": "Metal frame durability with Corning Gorilla Glass Victus+, 50MP camera, Knox Vault, and 4 OS upgrades.",
            "price": 39999.0,
            "stock": 19,
            "warranty_months": 12,
            "image_url": "https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=600&auto=format&fit=crop&q=80",
            "specs": [
                ("RAM", "8 GB", "GB", 8.0, True),
                ("Storage", "128 GB", "GB", 128.0, True),
                ("Battery", "5000 mAh", "mAh", 5000.0, True),
                ("Display Refresh Rate", "120 Hz", "Hz", 120.0, True),
                ("Camera Megapixels", "50 MP", "MP", 50.0, True),
                ("Weight", "213 g", "g", 213.0, False),
                ("Fast Charging", "25 W", "W", 25.0, True),
            ]
        }
    ]

    # Category 2: Laptops (10 products)
    laptops_data = [
        {
            "brand": "Apple",
            "model_name": "MacBook Air M3",
            "title": "Apple MacBook Air 13-inch (M3 chip, 16GB RAM, 512GB SSD, Space Gray)",
            "description": "Supercharged by M3, stunning Liquid Retina display, up to 18 hours of battery life, and silent fanless design.",
            "price": 134900.0,
            "stock": 12,
            "warranty_months": 12,
            "image_url": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80",
            "specs": [
                ("RAM", "16 GB", "GB", 16.0, True),
                ("Storage", "512 GB", "GB", 512.0, True),
                ("Battery Life", "18 Hours", "Hours", 18.0, True),
                ("Screen Size", "13.6 Inches", "Inches", 13.6, True),
                ("Weight", "1.24 kg", "kg", 1.24, False),
                ("Processor Benchmark", "3100 Score", "Score", 3100.0, True),
            ]
        },
        {
            "brand": "Dell",
            "model_name": "XPS 14 9440",
            "title": "Dell XPS 14 (Intel Core Ultra 7 155H, 32GB RAM, 1TB SSD, RTX 4050)",
            "description": "Crafted with CNC machined aluminum and Gorilla Glass 3, OLED touch display, and dedicated NVIDIA GeForce graphics.",
            "price": 184990.0,
            "stock": 8,
            "warranty_months": 24,
            "image_url": "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=600&auto=format&fit=crop&q=80",
            "specs": [
                ("RAM", "32 GB", "GB", 32.0, True),
                ("Storage", "1024 GB", "GB", 1024.0, True),
                ("Battery Life", "11 Hours", "Hours", 11.0, True),
                ("Screen Size", "14.5 Inches", "Inches", 14.5, True),
                ("Weight", "1.68 kg", "kg", 1.68, False),
                ("Processor Benchmark", "3600 Score", "Score", 3600.0, True),
            ]
        },
        {
            "brand": "Lenovo",
            "model_name": "Legion Pro 5i",
            "title": "Lenovo Legion Pro 5i Gaming (Intel i7-14700HX, 16GB, 1TB SSD, RTX 4070)",
            "description": "AI-tuned gaming laptop with Legion ColdFront 5.0 thermal technology, 16-inch WQXGA 240Hz PureSight display.",
            "price": 149990.0,
            "stock": 10,
            "warranty_months": 12,
            "image_url": "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&auto=format&fit=crop&q=80",
            "specs": [
                ("RAM", "16 GB", "GB", 16.0, True),
                ("Storage", "1024 GB", "GB", 1024.0, True),
                ("Battery Life", "6 Hours", "Hours", 6.0, True),
                ("Screen Size", "16.0 Inches", "Inches", 16.0, True),
                ("Weight", "2.55 kg", "kg", 2.55, False),
                ("Processor Benchmark", "4200 Score", "Score", 4200.0, True),
            ]
        },
        {
            "brand": "ASUS",
            "model_name": "Zenbook 14 OLED",
            "title": "ASUS Zenbook 14 OLED (Intel Core Ultra 5 125H, 16GB, 1TB SSD, Ponder Blue)",
            "description": "Ultraportable 1.2 kg laptop with 3K 120Hz ASUS Lumina OLED display, 75Wh battery, and military-grade durability.",
            "price": 99990.0,
            "stock": 14,
            "warranty_months": 12,
            "image_url": "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&auto=format&fit=crop&q=80",
            "specs": [
                ("RAM", "16 GB", "GB", 16.0, True),
                ("Storage", "1024 GB", "GB", 1024.0, True),
                ("Battery Life", "15 Hours", "Hours", 15.0, True),
                ("Screen Size", "14.0 Inches", "Inches", 14.0, True),
                ("Weight", "1.20 kg", "kg", 1.20, False),
                ("Processor Benchmark", "2900 Score", "Score", 2900.0, True),
            ]
        },
        {
            "brand": "HP",
            "model_name": "Pavilion Plus 14",
            "title": "HP Pavilion Plus 14 (AMD Ryzen 7 7840U, 16GB, 512GB SSD, Natural Silver)",
            "description": "OLED display with IMAX Enhanced certification, AMD Radeon 780M graphics, 5MP IR camera with privacy shutter.",
            "price": 76990.0,
            "stock": 18,
            "warranty_months": 12,
            "image_url": "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600&auto=format&fit=crop&q=80",
            "specs": [
                ("RAM", "16 GB", "GB", 16.0, True),
                ("Storage", "512 GB", "GB", 512.0, True),
                ("Battery Life", "12 Hours", "Hours", 12.0, True),
                ("Screen Size", "14.0 Inches", "Inches", 14.0, True),
                ("Weight", "1.38 kg", "kg", 1.38, False),
                ("Processor Benchmark", "2850 Score", "Score", 2850.0, True),
            ]
        },
        {
            "brand": "Acer",
            "model_name": "Nitro V 15",
            "title": "Acer Nitro V 15 Gaming (Intel i5-13420H, 16GB, 512GB SSD, RTX 4050)",
            "description": "Budget gaming powerhouse with 144Hz FHD IPS display, dual fans with dual intake exhaust, and NitroSense software.",
            "price": 69990.0,
            "stock": 20,
            "warranty_months": 12,
            "image_url": "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&auto=format&fit=crop&q=80",
            "specs": [
                ("RAM", "16 GB", "GB", 16.0, True),
                ("Storage", "512 GB", "GB", 512.0, True),
                ("Battery Life", "5 Hours", "Hours", 5.0, True),
                ("Screen Size", "15.6 Inches", "Inches", 15.6, True),
                ("Weight", "2.10 kg", "kg", 2.10, False),
                ("Processor Benchmark", "2400 Score", "Score", 2400.0, True),
            ]
        },
        {
            "brand": "Apple",
            "model_name": "MacBook Pro 14 M3 Pro",
            "title": "Apple MacBook Pro 14 (M3 Pro chip, 18GB Unified Memory, 512GB SSD, Space Black)",
            "description": "Liquid Retina XDR display with ProMotion 120Hz, HDMI port, SDXC card slot, MagSafe 3, and unmatched performance.",
            "price": 199900.0,
            "stock": 7,
            "warranty_months": 12,
            "image_url": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80",
            "specs": [
                ("RAM", "18 GB", "GB", 18.0, True),
                ("Storage", "512 GB", "GB", 512.0, True),
                ("Battery Life", "18 Hours", "Hours", 18.0, True),
                ("Screen Size", "14.2 Inches", "Inches", 14.2, True),
                ("Weight", "1.61 kg", "kg", 1.61, False),
                ("Processor Benchmark", "4100 Score", "Score", 4100.0, True),
            ]
        },
        {
            "brand": "Lenovo",
            "model_name": "IdeaPad Slim 3",
            "title": "Lenovo IdeaPad Slim 3 (Intel Core i3-1215U, 8GB RAM, 512GB SSD, Arctic Grey)",
            "description": "Affordable student laptop with 15.6-inch FHD anti-glare display, Dolby Audio, and rapid charge boost.",
            "price": 36990.0,
            "stock": 25,
            "warranty_months": 24,
            "image_url": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80",
            "specs": [
                ("RAM", "8 GB", "GB", 8.0, True),
                ("Storage", "512 GB", "GB", 512.0, True),
                ("Battery Life", "7 Hours", "Hours", 7.0, True),
                ("Screen Size", "15.6 Inches", "Inches", 15.6, True),
                ("Weight", "1.63 kg", "kg", 1.63, False),
                ("Processor Benchmark", "1500 Score", "Score", 1500.0, True),
            ]
        },
        {
            "brand": "ASUS",
            "model_name": "ROG Zephyrus G14",
            "title": "ASUS ROG Zephyrus G14 (AMD Ryzen 9 8945HS, 32GB, 1TB SSD, RTX 4070)",
            "description": "Ultra-sleek OLED gaming laptop with Slash Lighting, CNC unibody, and vapor chamber cooling.",
            "price": 189990.0,
            "stock": 6,
            "warranty_months": 12,
            "image_url": "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=600&auto=format&fit=crop&q=80",
            "specs": [
                ("RAM", "32 GB", "GB", 32.0, True),
                ("Storage", "1024 GB", "GB", 1024.0, True),
                ("Battery Life", "10 Hours", "Hours", 10.0, True),
                ("Screen Size", "14.0 Inches", "Inches", 14.0, True),
                ("Weight", "1.50 kg", "kg", 1.50, False),
                ("Processor Benchmark", "4400 Score", "Score", 4400.0, True),
            ]
        },
        {
            "brand": "Dell",
            "model_name": "Inspiron 15 3520",
            "title": "Dell Inspiron 15 3520 (Intel i5-1235U, 16GB RAM, 512GB SSD, Carbon Black)",
            "description": "Reliable everyday business machine with 120Hz display, lift hinge ergonomics, and ExpressCharge.",
            "price": 49990.0,
            "stock": 20,
            "warranty_months": 12,
            "image_url": "https://images.unsplash.com/photo-1588702547919-26089e690ecc?w=600&auto=format&fit=crop&q=80",
            "specs": [
                ("RAM", "16 GB", "GB", 16.0, True),
                ("Storage", "512 GB", "GB", 512.0, True),
                ("Battery Life", "8 Hours", "Hours", 8.0, True),
                ("Screen Size", "15.6 Inches", "Inches", 15.6, True),
                ("Weight", "1.65 kg", "kg", 1.65, False),
                ("Processor Benchmark", "1900 Score", "Score", 1900.0, True),
            ]
        }
    ]

    # Category 3: Audio & Headphones (10 products)
    audio_data = [
        {
            "brand": "Sony",
            "model_name": "WH-1000XM5",
            "title": "Sony WH-1000XM5 Wireless Active Noise Canceling Headphones (Silver)",
            "description": "Industry leading noise cancellation with two processors and 8 microphones, Auto NC Optimizer, and 30-hour battery life.",
            "price": 29990.0,
            "stock": 20,
            "warranty_months": 12,
            "image_url": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80",
            "specs": [
                ("Battery Life", "30 Hours", "Hours", 30.0, True),
                ("Driver Size", "30 mm", "mm", 30.0, True),
                ("Weight", "250 g", "g", 250.0, False),
                ("ANC Attenuation", "32 dB", "dB", 32.0, True),
                ("Bluetooth Version", "5.2", "Version", 5.2, True),
            ]
        },
        {
            "brand": "Bose",
            "model_name": "QuietComfort Ultra",
            "title": "Bose QuietComfort Ultra Headphones (Spatial Audio, Black)",
            "description": "World-class active noise cancellation, revolutionary Bose Immersive Audio, and CustomTune technology.",
            "price": 35900.0,
            "stock": 15,
            "warranty_months": 12,
            "image_url": "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&auto=format&fit=crop&q=80",
            "specs": [
                ("Battery Life", "24 Hours", "Hours", 24.0, True),
                ("Driver Size", "35 mm", "mm", 35.0, True),
                ("Weight", "253 g", "g", 253.0, False),
                ("ANC Attenuation", "35 dB", "dB", 35.0, True),
                ("Bluetooth Version", "5.3", "Version", 5.3, True),
            ]
        },
        {
            "brand": "Apple",
            "model_name": "AirPods Pro (2nd Gen)",
            "title": "Apple AirPods Pro (2nd Generation, MagSafe Case USB-C)",
            "description": "H2 chip delivers up to 2x more Active Noise Cancellation, Adaptive Audio, and Personalized Spatial Audio with dynamic head tracking.",
            "price": 24900.0,
            "stock": 22,
            "warranty_months": 12,
            "image_url": "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600&auto=format&fit=crop&q=80",
            "specs": [
                ("Battery Life", "30 Hours", "Hours", 30.0, True),
                ("Driver Size", "11 mm", "mm", 11.0, True),
                ("Weight", "51 g", "g", 51.0, False),
                ("ANC Attenuation", "30 dB", "dB", 30.0, True),
                ("Bluetooth Version", "5.3", "Version", 5.3, True),
            ]
        },
        {
            "brand": "Sennheiser",
            "model_name": "Momentum 4 Wireless",
            "title": "Sennheiser Momentum 4 Wireless Headphones (60-Hour Battery, White)",
            "description": "Audiophile-inspired 42mm transducer system, phenomenal 60-hour battery life, and Adaptive Noise Cancellation.",
            "price": 26990.0,
            "stock": 16,
            "warranty_months": 24,
            "image_url": "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&auto=format&fit=crop&q=80",
            "specs": [
                ("Battery Life", "60 Hours", "Hours", 60.0, True),
                ("Driver Size", "42 mm", "mm", 42.0, True),
                ("Weight", "293 g", "g", 293.0, False),
                ("ANC Attenuation", "28 dB", "dB", 28.0, True),
                ("Bluetooth Version", "5.2", "Version", 5.2, True),
            ]
        },
        {
            "brand": "Sony",
            "model_name": "WF-1000XM5",
            "title": "Sony WF-1000XM5 Truly Wireless Earbuds (Black)",
            "description": "Dual feedback microphones and integrated Processor V2 for high-resolution audio streaming with LDAC.",
            "price": 21990.0,
            "stock": 18,
            "warranty_months": 12,
            "image_url": "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80",
            "specs": [
                ("Battery Life", "24 Hours", "Hours", 24.0, True),
                ("Driver Size", "8.4 mm", "mm", 8.4, True),
                ("Weight", "40 g", "g", 40.0, False),
                ("ANC Attenuation", "28 dB", "dB", 28.0, True),
                ("Bluetooth Version", "5.3", "Version", 5.3, True),
            ]
        },
        {
            "brand": "OnePlus",
            "model_name": "Buds Pro 2",
            "title": "OnePlus Buds Pro 2 (Co-created with Dynaudio, Arbor Green)",
            "description": "Dual drivers MelodyBoost system, smart adaptive noise cancellation up to 48dB, and spatial audio with head tracking.",
            "price": 9999.0,
            "stock": 25,
            "warranty_months": 12,
            "image_url": "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=600&auto=format&fit=crop&q=80",
            "specs": [
                ("Battery Life", "39 Hours", "Hours", 39.0, True),
                ("Driver Size", "11 mm", "mm", 11.0, True),
                ("Weight", "47 g", "g", 47.0, False),
                ("ANC Attenuation", "48 dB", "dB", 48.0, True),
                ("Bluetooth Version", "5.3", "Version", 5.3, True),
            ]
        },
        {
            "brand": "JBL",
            "model_name": "Tune 770NC",
            "title": "JBL Tune 770NC Wireless Over-Ear ANC Headphones (Blue)",
            "description": "Adaptive Noise Cancelling with Smart Ambient, JBL Pure Bass Sound, and up to 70 hours of battery life with speed charge.",
            "price": 5999.0,
            "stock": 30,
            "warranty_months": 12,
            "image_url": "https://images.unsplash.com/photo-1545127398-14699f92334b?w=600&auto=format&fit=crop&q=80",
            "specs": [
                ("Battery Life", "70 Hours", "Hours", 70.0, True),
                ("Driver Size", "40 mm", "mm", 40.0, True),
                ("Weight", "232 g", "g", 232.0, False),
                ("ANC Attenuation", "22 dB", "dB", 22.0, True),
                ("Bluetooth Version", "5.3", "Version", 5.3, True),
            ]
        },
        {
            "brand": "boAt",
            "model_name": "Nirvana Ion",
            "title": "boAt Nirvana Ion True Wireless Earbuds (120H Playtime, Charcoal Black)",
            "description": "Massive 120 hours total playback, Crystal Bionic Sound with dual EQ modes, and quad mics ENx technology.",
            "price": 1999.0,
            "stock": 45,
            "warranty_months": 12,
            "image_url": "https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=600&auto=format&fit=crop&q=80",
            "specs": [
                ("Battery Life", "120 Hours", "Hours", 120.0, True),
                ("Driver Size", "10 mm", "mm", 10.0, True),
                ("Weight", "45 g", "g", 45.0, False),
                ("ANC Attenuation", "10 dB", "dB", 10.0, True),
                ("Bluetooth Version", "5.2", "Version", 5.2, True),
            ]
        },
        {
            "brand": "Marshall",
            "model_name": "Major IV",
            "title": "Marshall Major IV Wireless On-Ear Headphones (Black)",
            "description": "Iconic Marshall design with 80+ solid hours of wireless playtime, wireless charging, and ergonomic custom-tuned dynamic drivers.",
            "price": 12999.0,
            "stock": 14,
            "warranty_months": 12,
            "image_url": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80",
            "specs": [
                ("Battery Life", "80 Hours", "Hours", 80.0, True),
                ("Driver Size", "40 mm", "mm", 40.0, True),
                ("Weight", "165 g", "g", 165.0, False),
                ("ANC Attenuation", "15 dB", "dB", 15.0, True),
                ("Bluetooth Version", "5.0", "Version", 5.0, True),
            ]
        },
        {
            "brand": "Realme",
            "model_name": "Buds Air 5 Pro",
            "title": "Realme Buds Air 5 Pro (50dB ANC, Sunrise Beige)",
            "description": "50dB active noise cancellation, coaxial dual drivers, 40 hours battery life, and 360-degree spatial audio effect.",
            "price": 4999.0,
            "stock": 28,
            "warranty_months": 12,
            "image_url": "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80",
            "specs": [
                ("Battery Life", "40 Hours", "Hours", 40.0, True),
                ("Driver Size", "11 mm", "mm", 11.0, True),
                ("Weight", "46 g", "g", 46.0, False),
                ("ANC Attenuation", "50 dB", "dB", 50.0, True),
                ("Bluetooth Version", "5.3", "Version", 5.3, True),
            ]
        }
    ]

    all_categories_map = {
        cat_smartphones.id: smartphones_data,
        cat_laptops.id: laptops_data,
        cat_audio.id: audio_data,
    }

    all_created_products = []

    for cat_id, prod_list in all_categories_map.items():
        for pdata in prod_list:
            prod = Product(
                category_id=cat_id,
                brand=pdata["brand"],
                model_name=pdata["model_name"],
                title=pdata["title"],
                description=pdata["description"],
                price=pdata["price"],
                stock=pdata["stock"],
                is_available=True,
                warranty_months=pdata["warranty_months"],
                image_url=pdata["image_url"],
            )
            db.add(prod)
            db.flush()

            # Add specs
            for s_name, s_raw, s_unit, s_num, s_benefit in pdata["specs"]:
                spec = ProductSpecification(
                    product_id=prod.id,
                    name=s_name,
                    raw_value=s_raw,
                    unit=s_unit,
                    numeric_value=s_num,
                    is_benefit=s_benefit
                )
                db.add(spec)

            all_created_products.append(prod)

    db.commit()

    # 5. Synthetic Reviews with VADER sentiment & aspects (35+ reviews)
    sample_reviews = [
        # Positive
        (5, "Exceptional battery life! The phone easily lasts two full days of heavy gaming and multitasking. The display is ultra-crisp and bright."),
        (5, "Superb build quality and outstanding camera performance. Pictures in low light are crystal clear and vibrant. Worth every rupee!"),
        (4, "Great processor speed with zero lag during editing. Fast charging is very impressive, goes from 10% to 100% in 25 minutes."),
        (5, "Perfect laptop for college and coding. Keyboard feels premium, lightweight to carry, and the battery backup is flawless."),
        (4, "Solid audio performance with deep punchy bass. The active noise cancellation drowns out all hostel background noise comfortably."),
        (5, "Brilliant screen refresh rate and smooth scrolling. Highly recommend this over any competitor in this price range!"),
        (4, "Very satisfied with the purchase. Beautiful design, sound quality is clear and loud, excellent value for money."),
        # Neutral / Balanced
        (3, "Decent performance for everyday tasks. The battery is ok, but heats up slightly when playing heavy 3D games for over an hour."),
        (3, "Average camera quality in artificial indoor lighting. Build is solid and sound is fine, standard for this budget."),
        (4, "Good display and nice battery backup. However the weight is somewhat heavy in one hand."),
        # Negative
        (2, "Disappointed with battery drain. The device warms up quickly and the charging speed is rather slow compared to specs."),
        (1, "Worst speaker quality. Sounds muffled and tinny at high volume. The software has noticeable lag and bugs."),
        (2, "Build quality feels cheap plastic despite the high price. Customer service warranty process was slow and frustrating."),
    ]

    # Assign reviews across first 15 products
    users_pool = [admin_user, student_user, demo_user]
    rev_count = 0

    for i, prod in enumerate(all_created_products[:12]):
        # Add 2-3 reviews per product from different users
        for u_idx, u in enumerate(users_pool):
            rating_template = sample_reviews[(i + u_idx) % len(sample_reviews)]
            rating = rating_template[0]
            text = rating_template[1]

            sentiment_data = analyze_sentiment(text)
            aspects = extract_aspects(text, sentiment_data["compound"])

            rev = Review(
                product_id=prod.id,
                user_id=u.id,
                rating=rating,
                review_text=text,
                sentiment_score=sentiment_data["compound"],
                sentiment_label=sentiment_data["label"],
                aspect_tags=",".join(aspects)
            )
            db.add(rev)
            rev_count += 1

    db.commit()
    logger.info(f"Database seeded successfully with {len(all_created_products)} products and {rev_count} reviews.")
