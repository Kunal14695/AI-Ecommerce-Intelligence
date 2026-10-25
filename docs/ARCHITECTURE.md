# System Architecture

## Overview
The **AI Powered E-Commerce Customer Intelligence and Personalized Recommendation Platform** provides intelligent decision support for online shoppers. The platform is designed around two primary features:
1. **AI Product Comparison Engine**: Transparent, multi-criteria attribute analysis weighted by customer preferences with Bayesian rating adjustment, NLTK VADER sentiment analysis, and plain-language explanation generation.
2. **Location-Aware Checkout**: Equal choice between Option A ("Use Current Location" via browser Geolocation API and backend OpenStreetMap Nominatim proxy) and Option B ("Select Another Location" for family, office, hostel, or gifts) ending in an identical confirmed address workflow.

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

## Security & Compliance
- **Digital Personal Data Protection (DPDP) Act 2023**: Geolocation is accessed strictly upon user action (Option A click) with an explicit purpose prompt. Coordinates are never continuously tracked and are only persisted if the user explicitly saves the address.
- **OWASP Top 10 Protections**:
  - SQL Injection: Addressed through SQLAlchemy ORM parameterized queries.
  - XSS Protection: React automated HTML escaping and backend sanitization.
  - Password Security: Salted Bcrypt with high work factor.
  - Access Control: Role-based authorization (`customer` vs `admin`) on API routes.
