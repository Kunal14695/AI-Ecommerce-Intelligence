# AI Powered E-Commerce Customer Intelligence and Personalized Recommendation Platform
> **B.Tech Minor Project — Poornima University, Jaipur**  
> Department of Computer Engineering

[![Python 3.10+](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110%2B-009688.svg)](https://fastapi.tiangolo.com/)
[![React 18](https://img.shields.io/badge/React-18-61dafb.svg)](https://react.dev/)
[![Tests](https://img.shields.io/badge/Tests-15%2F15%20Passed%20(100%25)-success.svg)](./docs/TEST_REPORT.md)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A complete, runnable full-stack prototype designed to provide intelligent, transparent decision support for online consumers.

---

## 🌟 Primary Features

### 1. AI-Assisted Multi-Criteria Product Comparison
- Compares any **TWO** products side-by-side.
- Normalizes numeric attributes to a $0 \to 1$ scale within their category:
  - **Benefit attributes** (higher is better: RAM, Battery, Storage, Refresh Rate): $n = \frac{x - \min}{\max - \min}$
  - **Cost attributes** (lower is better: Price, Weight): $n = \frac{\max - x}{\max - \min}$
- **Bayesian Rating Adjustment**:
  $$R' = \left(\frac{v}{v+m}\right) R + \left(\frac{m}{v+m}\right) C$$
  *(where $v$ is review count, $m=5$ is prior weight, and $C$ is category average rating)*.
- **NLP Sentiment Analysis**: VADER lexicon polarity score and aspect mining (battery, display, performance, camera).
- **Preference-Weighted Scoring**:
  $$S(P) = \sum_{j} w_j \cdot n(P, j) \quad \text{where } \sum w_j = 1.0$$
- Includes preset profiles (**Budget-first**, **Performance-first**, **Reliability-first**) and interactive sliders that auto-normalize.
- Generates transparent score bars, side-by-side breakdown table, pros/cons, template-generated plain language summary, and ethical **decision-support disclaimer**.

### 2. Location-Aware Delivery & Checkout
- **Option A: "Use Current Location"**:
  - Uses browser HTML5 Geolocation API with transparent consent notice.
  - Reverse-geocoded via backend OpenStreetMap Nominatim proxy (with rate-limiting and cache).
  - Checks detected PIN against active serviceable areas.
  - Renders an **editable** address form for customer confirmation.
  - Seamless fallback to Option B if permission is denied or GPS times out.
- **Option B: "Select Another Location"**:
  - Manual entry with strict 6-digit Indian PIN code validation.
  - Or select from saved addresses tagged as **Home**, **Parents**, **Office**, **Hostel**, or **Gift**.
- Both options merge into the exact same confirmed address and sandbox order confirmation screen.

---

## 🚀 Quick Start Guide

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm
- (Optional) Docker and Docker Compose

### 1. Direct Local Execution (Instant Zero-Dependency Setup)

#### Step 1: Start Backend (FastAPI)
```powershell
# In a terminal:
cd "d:\minor project\backend"

# Run backend using Python virtual environment
.\venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000
```
*The database automatically creates tables and seeds 32+ realistic products, detailed specifications, 36+ reviews, and serviceable PIN codes on initial startup!*
- Swagger / OpenAPI Docs: [http://localhost:8000/docs](http://localhost:8000/docs)
- Health check: [http://localhost:8000/health](http://localhost:8000/health)

#### Step 2: Start Frontend (React + Vite)
```powershell
# In a separate terminal:
cd "d:\minor project\frontend"

# Launch Vite dev server
npm run dev
```
- Open your browser at: **[http://localhost:3000](http://localhost:3000)**

---

### 2. Docker Execution

```bash
docker compose up --build
```
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`
- PostgreSQL Database: `localhost:5432`

---

## 🧪 Running Automated Tests

Run the full test suite (`TC-01` through `TC-16`):
```powershell
cd "d:\minor project\backend"
.\venv\Scripts\python.exe -m pytest -v tests
```
*Output: 15 passed in ~12 seconds.* Detailed evidence in [docs/TEST_REPORT.md](./docs/TEST_REPORT.md).

---

## 🔑 Default Credentials

| Role | Email | Password | Features |
| :--- | :--- | :--- | :--- |
| **Demo Customer** | `student@poornima.edu.in` | `Student@123` | Browsing, Comparison, GPS Checkout, Reviews |
| **Platform Admin** | `admin@poornima.edu.in` | `Admin@123` | Catalogue CRUD, PIN Management, Order Operations |

*(Quick-login buttons are also available directly inside the Sign In modal in the UI!)*

---

## 📦 Architecture & Documentation
- [System Architecture & Privacy Compliance](./docs/ARCHITECTURE.md)
- [Entity-Relationship Diagram (3NF)](./docs/ER_DIAGRAM.md)
- [Data Flow Diagrams (Level 0 and Level 1)](./docs/DFD_LEVEL_0_1.md)
- [Automated Test Report & Mathematical Proofs](./docs/TEST_REPORT.md)
