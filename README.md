# AI Powered E-Commerce Customer Intelligence and Personalized Recommendation Platform
> **B.Tech Minor Project — Poornima University, Jaipur**  
> Department of Computer Engineering

[![Live Backend](https://img.shields.io/badge/Render-Live%20API-46E3B7?style=flat&logo=render&logoColor=white)](https://ai-ecommerce-api-64m8.onrender.com)
[![API Docs](https://img.shields.io/badge/Swagger-OpenAPI%20Docs-85EA2D?style=flat&logo=swagger&logoColor=black)](https://ai-ecommerce-api-64m8.onrender.com/docs)
[![Python 3.10+](https://img.shields.io/badge/Python-3.10%2B-blue.svg?logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110%2B-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React 18](https://img.shields.io/badge/React-18-61dafb.svg?logo=react&logoColor=black)](https://react.dev/)
[![Tests](https://img.shields.io/badge/Tests-15%2F15%20Passed%20(100%25)-success.svg)](./docs/TEST_REPORT.md)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A complete, production-deployed full-stack e-commerce intelligence platform built to deliver transparent, preference-weighted AI product comparisons, privacy-first location-aware checkout, and personalized hybrid recommendations.

---

## 🌐 Live Production Deployments

| Component | Platform | Live URL | Description |
| :--- | :--- | :--- | :--- |
| **Backend API** | **Render** | [https://ai-ecommerce-api-64m8.onrender.com](https://ai-ecommerce-api-64m8.onrender.com) | FastAPI REST service, SQLite database & ML algorithms |
| **API Docs (Swagger)** | **Render** | [https://ai-ecommerce-api-64m8.onrender.com/docs](https://ai-ecommerce-api-64m8.onrender.com/docs) | Interactive OpenAPI interactive test console |
| **API Health Check** | **Render** | [https://ai-ecommerce-api-64m8.onrender.com/health](https://ai-ecommerce-api-64m8.onrender.com/health) | Live service status probe |
| **Frontend App** | **Vercel** | Deployed on Vercel | React 18 SPA with responsive styling |
| **Source Code** | **GitHub** | [Kunal14695/AI-Ecommerce-Intelligence](https://github.com/Kunal14695/AI-Ecommerce-Intelligence) | Official project repository |

---

## 🌟 Primary Features

### 1. AI-Assisted Multi-Criteria Product Comparison (Module 7.4)
- **Side-by-Side Evaluation**: Compare any two devices across smartphones, laptops, and audio gear.
- **Min-Max Category Normalization**:
  - *Benefit Attributes* (higher is better: RAM, Battery, Storage, Refresh Rate):
    $$n = \frac{x - \min}{\max - \min}$$
  - *Cost Attributes* (lower is better: Price, Weight):
    $$n = \frac{\max - x}{\max - \min}$$
- **Bayesian Rating Adjustment**: Prevents low-sample distortion using category priors:
  $$R' = \left(\frac{v}{v+m}\right) R + \left(\frac{m}{v+m}\right) C$$
  *(where $v$ is review count, $m=5$ is prior weight, and $C$ is category mean rating)*.
- **NLP Sentiment & Aspect Mining**: Incorporates NLTK VADER sentiment compound polarity and aspect counts (*battery, display, performance, camera, build*).
- **Preference-Weighted Scoring**:
  $$S(P) = \sum_{j} w_j \cdot n(P, j) \quad \text{where } \sum w_j = 1.0$$
- **Preset Profiles**: **Budget-first**, **Performance-first**, and **Reliability-first** presets, plus custom sliders that auto-normalize.
- **Explainability & Transparency**: Generates plain-language conditional recommendations (*"If low price is your priority, Product A is the better fit..."*), score bars, criteria breakdown table, pros/cons, and an explicit **Decision Support Notice**.

### 2. Location-Aware Delivery & Checkout (Modules 7.7 & 7.8)
- **Option A: "Use Current Location"**:
  - Transparent consent modal explaining why location is required.
  - Browser HTML5 Geolocation API with backend OpenStreetMap Nominatim proxy (rate-limited and cached).
  - Verifies detected postal PIN code against active delivery serviceable areas.
  - Pre-populates an **editable** address form for customer confirmation.
  - Graceful fallback: If permission is denied or GPS times out, transitions seamlessly to Option B without blocking checkout.
- **Option B: "Select Another Location"**:
  - Choose from saved addresses tagged as **Home**, **Parents**, **Office**, **Hostel**, or **Gift**.
  - Or enter any address with strict 6-digit Indian PIN code validation and instant serviceability check.
- Both options end in the identical confirmed address summary and sandbox order completion step!

---

## 🏗️ Architecture & Modules (All 12 Modules Built)

```
                                  [ REACT CLIENT (Vite) ]
                                 /          |            \
                   Option A (GPS)   Option B (Manual)   Multi-Criteria Weights
                          |                 |                      |
            +-------------v-----------------v----------------------v---------------+
            |                         FASTAPI BACKEND                              |
            |                                                                      |
            |   [Auth Service]   [Geocoding Proxy]   [AI Comparison Engine]       |
            |       Bcrypt             OSM Nominatim        Min-Max Benefit/Cost   |
            |       JWT                1 req/s + Cache      Bayesian Adjustment    |
            |                                               NLP VADER Sentiment    |
            |                                                                      |
            |   [Recommendation Engine]             [Order & Cart Controller]      |
            |       TF-IDF + Cosine Sim                 Stock Management           |
            |       Cold-Start Fallback                 Sandbox Payment Engine     |
            +----------------------------------------------------------------------+
                                       |              |
                           [ SQLAlchemy ORM ]   [ In-Memory Cache ]
                                       |
                              [ Database Layer ]
                         SQLite (Dev) / PostgreSQL (Prod)
```

1. **7.1 User Management**: Salted bcrypt password hashing, JWT sessions, role-based access (`customer`/`admin`), user preference profiles.
2. **7.2 Product Management**: Hierarchical categories, brands, specs (key/value/unit), stock availability, warranty months.
3. **7.3 Search & Filtering**: Keyword search, category chips, brand filter, price range slider, rating filters, interaction event logging (`view`, `compare`, `cart`).
4. **7.4 AI Comparison Engine**: Benefit/cost normalization, Bayesian ratings, VADER sentiment, weight presets/sliders, plain-language explanation, decision-support disclaimer.
5. **7.5 Personalized Recommendations**: Content-based TF-IDF vectorization with cosine similarity, interaction weighting, and cold-start top-rated fallback.
6. **7.6 Reviews & Rating**: 1 review per user per product, 1-5 stars + text, VADER sentiment polarity scores, aspect extraction badges.
7. **7.7 Current Location Detection**: Geolocation API, backend Nominatim proxy, rate limiting, serviceable PIN verification, editable confirmation.
8. **7.8 Alternative Location Selection**: Manual PIN input, saved address reuse, serviceability check.
9. **7.9 Address Management**: Address book tagged by labels (*Home, Parents, Office, Hostel, Gift*), de-duplication, default toggle.
10. **7.10 Cart & Orders**: Cart state, inventory reservation, atomic checkout, sandbox payment simulation (`PAID_SANDBOX`).
11. **7.11 Database Management**: 3NF schema, indexes, foreign keys, auto-seed service with 32+ products, detailed specs, 36+ reviews, and 8 delivery hubs.
12. **7.12 Admin Portal**: System KPIs (revenue, orders, comparisons), catalogue CRUD, delivery PIN management, order status operations (`CONFIRMED` $\to$ `SHIPPED` $\to$ `DELIVERED`).

---

## 🔑 Demo Accounts (Single-Click Login in UI)

| Role | Email | Password | Access / Capabilities |
| :--- | :--- | :--- | :--- |
| **Demo Customer** | `student@poornima.edu.in` | `Student@123` | Browsing, AI Comparison, Cart, GPS Checkout, Writing Reviews |
| **Platform Admin** | `admin@poornima.edu.in` | `Admin@123` | Catalogue CRUD, PIN Management, Order Operations, Analytics |

---

## 🧪 Automated Testing Verification

The automated test suite (`pytest`) verifies all 16 test cases specified in the project requirements:

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
* **Weight Directionality**: Moving weights adjusts ranking strictly in the expected direction.

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
*Frontend runs on `http://localhost:3000` with local proxy to `http://127.0.0.1:8000`.*

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
Runs multi-container architecture with Nginx frontend (`:3000`), FastAPI backend (`:8000`), and PostgreSQL 16 database (`:5432`).

---

## 📚 Project Documentation & Academic Artifacts
- **[System Architecture & Privacy Compliance](./docs/ARCHITECTURE.md)**
- **[3NF Entity-Relationship (ER) Diagram](./docs/ER_DIAGRAM.md)**
- **[Data Flow Diagrams (Level-0 and Level-1)](./docs/DFD_LEVEL_0_1.md)**
- **[Automated Test Report & Mathematical Proofs](./docs/TEST_REPORT.md)**

---

## ⚖️ Legal & Privacy Compliance
Designed in strict alignment with **India's Digital Personal Data Protection (DPDP) Act 2023**:
- **Explicit Consent**: Geolocation is accessed strictly after an explicit click on Option A with clear purpose explanation.
- **Purpose Limitation**: Coordinates are used solely for reverse geocoding and delivery validation; no continuous tracking.
- **User Control & Deletion**: Raw coordinates are discarded unless the user explicitly saves the address. Users can view, edit, and delete any saved address.
- **Decision Support Notice**: AI comparison outputs transparently declare that they are personalized decision-support estimates rather than absolute claims of product superiority.
