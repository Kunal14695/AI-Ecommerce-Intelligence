# SmartCommerce AI — Customer Intelligence & Personalized Recommendation Platform
> **Enterprise-Grade Full-Stack AI E-Commerce Platform**  
> Dynamic Multi-Criteria Comparison Engine • Location-Aware Checkout • Hybrid Recommender System

[![Live Frontend](https://img.shields.io/badge/Vercel-Live%20App-000000?style=flat&logo=vercel&logoColor=white)](https://ai-ecommerce-intelligence.vercel.app/)
[![Live Backend](https://img.shields.io/badge/Render-Live%20API-46E3B7?style=flat&logo=render&logoColor=white)](https://ai-ecommerce-api-64m8.onrender.com)
[![API Docs](https://img.shields.io/badge/Swagger-OpenAPI%20Docs-85EA2D?style=flat&logo=swagger&logoColor=black)](https://ai-ecommerce-api-64m8.onrender.com/docs)
[![Python 3.10+](https://img.shields.io/badge/Python-3.10%2B-blue.svg?logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110%2B-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React 18](https://img.shields.io/badge/React-18-61dafb.svg?logo=react&logoColor=black)](https://react.dev/)
[![Tests](https://img.shields.io/badge/Tests-15%2F15%20Passed%20(100%25)-success.svg)](./docs/TEST_REPORT.md)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A complete, production-deployed full-stack e-commerce intelligence platform built to deliver transparent, preference-weighted AI product comparisons, privacy-first location-aware delivery, aspect-based NLP review analysis, and personalized hybrid recommendations across 9 major commercial departments.

---

## 🌐 Live Production Deployments

| Component | Platform | Live URL | Description |
| :--- | :--- | :--- | :--- |
| **Frontend Web App** | **Vercel** | [https://ai-ecommerce-intelligence.vercel.app/](https://ai-ecommerce-intelligence.vercel.app/) | Interactive React 18 client with modern slate-indigo design |
| **Backend REST API** | **Render** | [https://ai-ecommerce-api-64m8.onrender.com](https://ai-ecommerce-api-64m8.onrender.com) | FastAPI REST service, SQLite database & ML engines |
| **Interactive API Docs** | **Render** | [https://ai-ecommerce-api-64m8.onrender.com/docs](https://ai-ecommerce-api-64m8.onrender.com/docs) | Interactive Swagger/OpenAPI documentation console |
| **API Health Check** | **Render** | [https://ai-ecommerce-api-64m8.onrender.com/health](https://ai-ecommerce-api-64m8.onrender.com/health) | Live service uptime and health probe |
| **Source Code** | **GitHub** | [Kunal14695/AI-Ecommerce-Intelligence](https://github.com/Kunal14695/AI-Ecommerce-Intelligence) | Official repository |

---

## 🏬 Comprehensive 9-Department Catalogue

The platform features an expansive, realistic e-commerce catalogue across 9 commercial departments, each with structured technical specifications, benefit/cost normalization rules, and aspect-based customer reviews:

| # | Department | Categories & Products Featured | Key Technical / Material Specs |
| :- | :--- | :--- | :--- |
| **1** | **Smartphones** | Apple iPhone 15 Pro, Samsung Galaxy S24 Ultra, OnePlus 12, Xiaomi Redmi Note 13 Pro+, Realme 12 Pro+, POCO X6 Pro | RAM (GB), Storage (GB), Battery (mAh), Refresh Rate (Hz), Weight (g) |
| **2** | **Laptops** | Apple MacBook Air M3, Dell XPS 13 Plus, ASUS ROG Zephyrus G14, Lenovo IdeaPad Slim 5 OLED | RAM (GB), Storage (GB), Battery Life (hrs), Weight (kg), CPU/GPU |
| **3** | **Audio & Wearables** | Sony WH-1000XM5, Apple AirPods Pro (2nd Gen), boAt Airdopes 141 ANC | Battery Life (hrs), Active Noise Cancellation (%), Driver Size (mm) |
| **4** | **Fashion & Clothing** | Levi's 511 Slim Fit Stretch Denim, Raymond Pure Wool Tailored Blazer, Adidas Originals Hoodie, Zara Floral Chiffon Maxi Dress, Puma DryCELL Tracksuit | Material Composition (%), Fabric GSM, Fit Type, Stretchability, Care |
| **5** | **Fashion Accessories** | Ray-Ban Classic Aviator Polarized Sunglasses, Fossil Derrick RFID Leather Wallet, Samsonite Omni PC Carry-On Spinner, Michael Kors Saffiano Tote, Wildcraft 45L Rucksack | UV Protection (%), Shell Durability, RFID Shielding, Capacity (Liters) |
| **6** | **Jewelry & Luxury Watches** | Tanishq 22KT Yellow Gold Floral Drop Earrings, GIVA 925 Sterling Silver Heart Pendant, Seiko Presage Automatic Watch, Casio G-Shock Carbon Core, Mia by Tanishq 14KT Diamond Ring | Gold Purity (KT / BIS 916), Diamond Carats, Water Resistance (M), Power Reserve |
| **7** | **Furniture & Living** | Green Soul Monster Ultimate Ergonomic Chair, Wakefit Dual Comfort Queen Mattress, Urban Ladder Solid Sheesham Dining Table, Sleepyhead Bae Sofa, Philips Smart Wi-Fi LED Lamp | Weight Capacity (kg), Foam Density (D), Wood Type (Sheesham), Lumens (lm) |
| **8** | **Automotive Accessories** | 70mai A500S 2.7K Dual Dash Camera, Steelbird Terminator Full Face Helmet, Bosch EasyPump Cordless Air Inflator, Wavex Carnauba Wax Mirror Polish Kit, Qubo Car Air Purifier | Video Resolution (2.7K), Max Pressure (150 PSI), CADR (m³/h), ISI Certification |
| **9** | **Beauty & Grooming** | Philips Series 5000 Wet & Dry Beard Trimmer, Dyson Supersonic Intelligent Hair Dryer, Forest Essentials Soundarya 24K Gold Cream | Motor Speed (110k RPM), Precision Steps (0.2mm), Battery Runtime, SPF |

---

## 🌟 Core Machine Learning & Architectural Features

### 1. Multi-Criteria AI Product Comparison Engine
* **Side-by-Side Evaluation**: Compare any two models within or across categories with transparent mathematical scoring.
* **Min-Max Benefit vs. Cost Normalization**:
  * *Benefit Attributes* (Higher is better: RAM, Battery, Storage, Refresh Rate, Gold Purity, Pressure PSI):
    $$n = \frac{x - \min}{\max - \min}$$
  * *Cost Attributes* (Lower is better: Price, Weight, Power Consumption, Dimensions):
    $$n = \frac{\max - x}{\max - \min}$$
* **Bayesian Rating Adjustment**: Eliminates small-sample distortion by pulling low-volume ratings towards the category prior mean:
  $$R' = \left(\frac{v}{v+m}\right) R + \left(\frac{m}{v+m}\right) C$$
  *(where $v$ is review count, $m=5$ is prior weight, and $C$ is category mean rating)*.
* **NLP Sentiment Polarity & Aspect Mining**: Built-in VADER sentiment analyzer extracts compound sentiment and categorizes feedback by aspect (*battery, display, performance, camera, build, durability, comfort*).
* **Preference-Weighted Scoring**:
  $$S(P) = \sum_{j} w_j \cdot n(P, j) \quad \text{where } \sum w_j = 1.0$$
* **Preset Profiles**: One-click presets for **Budget-First**, **Performance-First**, and **Reliability-First**, plus interactive sliders with automatic dynamic normalization.
* **Plain-Language Explanations & Decision Support**: Explains the trade-offs in conversational English (*"If budget is your priority, Product A is the superior choice..."*) accompanied by a formal **Decision Support Notice**.

---

### 2. Location-Aware Delivery & Checkout
* **Option A: "Use Current Location (GPS)"**:
  * Transparent consent dialog explaining why location is required.
  * Browser HTML5 Geolocation API with rate-limited, cached backend proxy to OpenStreetMap Nominatim.
  * Resolves coordinate latitude/longitude into postal PIN code, city, and state.
  * Checks live serviceability against registered delivery fulfillment hubs.
  * Pre-populates an editable address form for customer verification.
  * Automatic graceful fallback to manual entry if GPS permission is denied or times out.
* **Option B: "Select Another Location"**:
  * Manual 6-digit postal PIN code verification with instant delivery ETA calculation.
  * Saved address book tagged by labels (*Home, Parents, Office, Hostel, Gift*).
* **Delivery Location Header Widget**:
  * Clickable *"Deliver to [City] [PIN] | Update location"* widget in the top navigation bar with 1-click location switching.

---

### 3. Personalized Hybrid Recommendation Engine
* **Content-Based Spec Vectorization**: Generates TF-IDF spec vectors from brands, categories, descriptions, and hardware specifications.
* **Cosine Similarity Matching**: Computes pairwise cosine similarity between products.
* **Interaction Weighting**: Tracks user actions (`view` = 1.0, `compare` = 2.0, `cart` = 3.0) to dynamically tune recommendations.
* **Cold-Start Fallback**: Recommends highest-rated Bayesian products for newly registered or guest users.

---

### 4. Professional Enterprise UI & Admin Portal
* **Modern Slate & Electric Indigo Theme**:
  * Clean, bespoke aesthetic (`#0f172a` deep slate, `#4f46e5` electric indigo, `#38bdf8` cyan highlights).
  * 3-part search bar with dynamic department dropdown, wide input, and one-click query.
  * Account & Lists menu with single-click demo logins and order tracking.
  * Floating compare tray with badge counter and direct comparison drawer.
* **Interactive Filter Sidebar**:
  * Filter by delivery speed (*Get it by Tomorrow, 2-Day Delivery*).
  * Filter by customer rating (*4★ & Up, 3★ & Up, 2★ & Up*).
  * Interactive price range slider with budget presets (*Under ₹10k, ₹10k–₹25k, ₹25k–₹50k*).
  * Dynamic brand checkboxes generated directly from active catalogue inventory.
* **Enterprise Seller Admin Portal**:
  * Real-time Gross Merchandise Value (GMV) revenue tracking and order count metrics.
  * Full Catalogue Inventory Management: add, edit, or delete product SKUs.
  * Postal PIN Logistics Hub Manager: add serviceable PINs and toggle 24-hr express delivery.
  * Order Fulfillment Operations: update order states (`PENDING` $\to$ `PROCESSING` $\to$ `SHIPPED` $\to$ `DELIVERED`).

---

## 🏗️ Architecture & Module Map (All 12 Modules Built)

```
                              [ REACT 18 CLIENT (Vite) ]
                             /             |            \
               Option A (GPS)      Option B (Manual)    Multi-Criteria Weights
                      |                    |                     |
        +-------------v--------------------v---------------------v---------------+
        |                            FASTAPI REST BACKEND                        |
        |                                                                        |
        |   [Auth Service]        [Geocoding Proxy]       [AI Comparison Engine] |
        |       Bcrypt Password       OSM Nominatim Proxy     Min-Max Normalizer |
        |       JWT Session Tokens    Rate-Limited & Cached   Bayesian Ratings   |
        |                                                     VADER Sentiment    |
        |                                                                        |
        |   [Recommendation Engine]                       [Cart & Order Hub]     |
        |       TF-IDF Vectorizer                             Inventory Locks    |
        |       Cosine Similarity Matrix                      Atomic Transactions|
        |       Cold-Start Fallback                           Sandbox Payments   |
        +------------------------------------------------------------------------+
                                   |                |
                          [ SQLAlchemy ORM ]   [ Local In-Memory Cache ]
                                   |
                          [ Database Layer ]
                    SQLite (Dev/Demo) / PostgreSQL (Prod)
```

1. **Module 7.1 — User Management & Authentication**: Salted bcrypt hashing, JWT access tokens, role-based security (`customer`/`admin`).
2. **Module 7.2 — Product Catalog Management**: Hierarchical categories, brands, specifications, stock tracking, and warranty.
3. **Module 7.3 — Search & Filtering**: Keyword search, dynamic category filtering, brand checkboxes, budget sliders, and interaction event logging (`view`, `compare`, `cart`).
4. **Module 7.4 — AI Comparison Engine**: Benefit/cost normalization, Bayesian adjusted ratings, VADER aspect sentiment, customizable weights, plain-language explanation, and decision support notice.
5. **Module 7.5 — Personalized Recommendations**: TF-IDF spec vectors, cosine similarity, user interest weighting, and cold-start fallback.
6. **Module 7.6 — Reviews & Sentiment Mining**: Single review per user per product, 1-5 star ratings, VADER sentiment polarity, and aspect tags.
7. **Module 7.7 — Current Location Detection**: HTML5 Geolocation, backend Nominatim proxy, rate limiting, serviceable PIN verification, and editable confirmation.
8. **Module 7.8 — Alternative Location Selection**: Manual PIN entry, saved address reuse, and express delivery validation.
9. **Module 7.9 — Address Book Management**: Multi-address book tagged by labels (*Home, Parents, Office, Hostel, Gift*), de-duplication, and default selection.
10. **Module 7.10 — Cart & Order Checkout**: Atomic cart updates, inventory reservation, order placement, and sandbox payment simulation (`PAID_SANDBOX`).
11. **Module 7.11 — Database Management**: 3NF normalized schema, foreign keys, indexes, and auto-seed service across 9 departments with 40+ products.
12. **Module 7.12 — Seller Admin Portal**: Business KPIs (revenue, orders, active SKUs), inventory CRUD, delivery hub management, and fulfillment status pipeline.

---

## 🔑 Demo Accounts (Single-Click Login in UI)

| Role | Email | Password | Access Capabilities |
| :--- | :--- | :--- | :--- |
| **Platform Admin** | `admin@poornima.edu.in` | `Admin@123` | Seller Portal, Inventory CRUD, Delivery Hub PINs, Order Fulfillment |
| **Customer User** | `student@poornima.edu.in` | `Student@123` | Catalogue Browsing, AI Comparison, Cart, GPS Checkout, Reviews |
| **Demo Customer** | `customer@poornima.edu.in` | `Customer@123` | Alternative Customer Profile with Pre-saved Addresses |

---

## 🧪 Automated Testing Verification

The automated test suite (`pytest`) verifies 15 end-to-end test cases covering the entire functional lifecycle:

```
tests/test_auth.py::test_tc01_user_registration PASSED                   [  6%]
tests/test_auth.py::test_tc02_user_login PASSED                          [ 13%]
tests/test_cart_order.py::test_tc11_cart_operations PASSED               [ 20%]
tests/test_cart_order.py::test_tc12_order_checkout_flow PASSED           [ 26%]
tests/test_cart_order.py::test_tc16_transaction_integrity_no_partial_orders PASSED [ 33%]
tests/test_comparison.py::test_tc04_comparison_pipeline_execution PASSED [ 40%]
tests/test_comparison.py::test_tc05_exact_mathematical_reference_case PASSED [ 46%]
tests/test_location.py::test_tc08_and_tc15_reverse_geocode_and_fallback PASSED [ 53%]
tests/test_location.py::test_tc07_and_tc14_permission_denied_flow PASSED [ 60%]
tests/test_location.py::test_tc09_and_tc10_address_validation_and_saved_reuse PASSED [ 66%]
tests/test_recommendation.py::test_tc06_recommendations_cold_start_and_interactions PASSED [ 73%]
tests/test_search.py::test_tc03_search_and_filter PASSED                 [ 80%]
tests/test_security.py::test_tc13_sql_injection_resilience PASSED        [ 86%]
tests/test_security.py::test_tc13_script_tag_safety_in_reviews PASSED    [ 93%]
tests/test_security.py::test_tc13_password_hashing_and_salting PASSED    [100%]
====================== 15 passed in ~12 seconds =======================
```

### Exact Mathematical Verification (TC-05 Proof)
Given the reference attribute score matrix:
- **Price**: A = 0.80, B = 0.50
- **Performance**: A = 0.55, B = 0.90
- **Features**: A = 0.60, B = 0.75
- **Ratings & Reviews**: A = 0.70, B = 0.65
- **Brand & Warranty**: A = 0.60, B = 0.70
- **Availability**: A = 1.00, B = 1.00

* **Budget-First Profile** (`0.40, 0.15, 0.15, 0.15, 0.10, 0.05`):
  $$S(A) = 0.40(0.80) + 0.15(0.55) + 0.15(0.60) + 0.15(0.70) + 0.10(0.60) + 0.05(1.00) = 0.7075 \to \mathbf{0.708}$$
  $$S(B) = 0.40(0.50) + 0.15(0.90) + 0.15(0.75) + 0.15(0.65) + 0.10(0.70) + 0.05(1.00) = \mathbf{0.665}$$
* **Performance-First Profile** (`0.15, 0.40, 0.20, 0.15, 0.05, 0.05`):
  $$S(A) = 0.15(0.80) + 0.40(0.55) + 0.20(0.60) + 0.15(0.70) + 0.05(0.60) + 0.05(1.00) = \mathbf{0.645}$$
  $$S(B) = 0.15(0.50) + 0.40(0.90) + 0.20(0.75) + 0.15(0.65) + 0.05(0.70) + 0.05(1.00) = 0.7675 \to \mathbf{0.768}$$
* **Symmetry**: Swapping A and B mirrors scores exactly.
* **Weight Directionality**: Moving weights adjusts ranking strictly in the mathematically expected direction.

---

## 💻 Local Development Setup

### 1. Run Backend (FastAPI)
```powershell
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
python start.py
```
*Backend runs on `http://127.0.0.1:8000` with auto-seeded SQLite database.*

### 2. Run Frontend (React Vite)
```powershell
cd frontend
npm install --legacy-peer-deps
npm run dev
```
*Frontend runs on `http://localhost:3000` with proxy configured to `http://127.0.0.1:8000`.*

### 3. Run Automated Tests
```powershell
cd backend
.\venv\Scripts\python.exe -m pytest -v tests
```

---

## 🐳 Docker Deployment
```bash
docker compose up --build
```
Spins up multi-container infrastructure:
- **Frontend**: Nginx React SPA on port `3000`
- **Backend**: FastAPI ASGI on port `8000`
- **Database**: PostgreSQL 16 on port `5432`

---

## 📚 Technical Documentation Artifacts
- **[System Architecture & Data Flows](./docs/ARCHITECTURE.md)**
- **[3NF Entity-Relationship (ER) Diagram](./docs/ER_DIAGRAM.md)**
- **[Data Flow Diagrams (Level-0 and Level-1)](./docs/DFD_LEVEL_0_1.md)**
- **[Automated Test Report & Mathematical Proofs](./docs/TEST_REPORT.md)**

---

## ⚖️ Legal & Privacy Compliance
Built in strict alignment with **India's Digital Personal Data Protection (DPDP) Act 2023**:
- **Explicit Consent**: Geolocation is accessed strictly after an explicit click on Option A with a clear purpose description.
- **Purpose Limitation**: Coordinates are used solely for reverse geocoding and delivery validation; no continuous tracking.
- **User Control & Deletion**: Raw coordinates are discarded unless the user explicitly saves the address. Users can view, edit, and delete any saved address.
- **Decision Support Notice**: AI comparison outputs transparently declare that they are personalized decision-support estimates rather than absolute claims of product superiority.
