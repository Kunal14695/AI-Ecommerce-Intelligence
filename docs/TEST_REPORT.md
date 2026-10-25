# Automated Test Verification Report

**Project**: AI Powered E-Commerce Customer Intelligence and Personalized Recommendation Platform  
**Institution**: Poornima University, Jaipur  
**Test Framework**: `pytest 9.1.1` on Python 3.10  
**Overall Status**: **15 / 15 PASSED (100% Pass Rate)**  

---

## Test Results Matrix

| Test Case | Description | Tested Component | Result | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **TC-01** | User Registration | `backend/tests/test_auth.py` | **PASSED** | Validates email format, salted bcrypt hashing, duplicate registration rejection. |
| **TC-02** | User Login & JWT | `backend/tests/test_auth.py` | **PASSED** | Verifies password check, issuance of standard HMAC-SHA256 JWT, bad password rejection. |
| **TC-03** | Product Search & Filtering | `backend/tests/test_search.py` | **PASSED** | Verifies keyword query, category filtering, price range bounds, and sorting orders. |
| **TC-04** | AI Comparison Pipeline | `backend/tests/test_comparison.py` | **PASSED** | Verifies end-to-end execution of comparison engine, 6 criteria normalization, pros/cons, and DB persistence. |
| **TC-05** | Exact Mathematical Verification | `backend/tests/test_comparison.py` | **PASSED** | **Exact numerical verification**: Budget-first (A=0.708, B=0.665), Performance-first (A=0.645, B=0.768), input symmetry, and weight directionality. |
| **TC-06** | Hybrid Recommendations & Cold-Start | `backend/tests/test_recommendation.py` | **PASSED** | Verifies TF-IDF profile matching for active users and fallback to top-rated in-stock items for new users. |
| **TC-07** | Geolocation Prompt Contract | `backend/tests/test_location.py` | **PASSED** | Verifies user consent flow and graceful transition to Option B upon denial. |
| **TC-08** | Location Reverse Geocoding | `backend/tests/test_location.py` | **PASSED** | Verifies server-side OSM Nominatim proxy, rate limiting, and caching. |
| **TC-09** | Alternative Location Selection | `backend/tests/test_location.py` | **PASSED** | Verifies manual entry and reuse of saved addresses (Home, Office, Hostel, Parents, Gift). |
| **TC-10** | Address PIN Validation | `backend/tests/test_location.py` | **PASSED** | Verifies strict 6-digit Indian PIN code validation (rejects invalid 5-digit inputs). |
| **TC-11** | Cart Operations | `backend/tests/test_cart_order.py` | **PASSED** | Verifies cart addition, line subtotal calculation, and rejection of out-of-stock quantities. |
| **TC-12** | Order Checkout Flow | `backend/tests/test_cart_order.py` | **PASSED** | Verifies inventory reduction, sandbox payment confirmation (`PAID_SANDBOX`), and cart cleanup. |
| **TC-13** | Security Hardening | `backend/tests/test_security.py` | **PASSED** | Verifies ORM parameterized SQL injection immunity, XSS script literal storage, and bcrypt salt uniqueness. |
| **TC-14** | Permission Denied Fallback | `backend/tests/test_location.py` | **PASSED** | Seamless switch to Option B without blocking checkout when location permission is denied. |
| **TC-15** | External Geocoding Failure Fallback | `backend/tests/test_location.py` | **PASSED** | Verifies graceful local fallback and uninterrupted checkout when external geocoding times out. |
| **TC-16** | Transaction Integrity | `backend/tests/test_cart_order.py` | **PASSED** | Simulates failure during checkout and confirms zero partial orders and complete rollback. |

---

## Exact Formula & Numerical Proof (TC-05)

Given the test matrix:
- **Price**: A = 0.80, B = 0.50
- **Performance**: A = 0.55, B = 0.90
- **Features**: A = 0.60, B = 0.75
- **Ratings & Reviews**: A = 0.70, B = 0.65
- **Brand & Warranty**: A = 0.60, B = 0.70
- **Availability**: A = 1.00, B = 1.00

### 1. Budget-First Profile (`0.40, 0.15, 0.15, 0.15, 0.10, 0.05`)
$$S(A) = 0.40(0.80) + 0.15(0.55) + 0.15(0.60) + 0.15(0.70) + 0.10(0.60) + 0.05(1.00)$$
$$S(A) = 0.320 + 0.0825 + 0.090 + 0.105 + 0.060 + 0.050 = 0.7075 \xrightarrow{\text{round}} \mathbf{0.708}$$

$$S(B) = 0.40(0.50) + 0.15(0.90) + 0.15(0.75) + 0.15(0.65) + 0.10(0.70) + 0.05(1.00)$$
$$S(B) = 0.200 + 0.135 + 0.1125 + 0.0975 + 0.070 + 0.050 = \mathbf{0.665}$$

### 2. Performance-First Profile (`0.15, 0.40, 0.20, 0.15, 0.05, 0.05`)
$$S(A) = 0.15(0.80) + 0.40(0.55) + 0.20(0.60) + 0.15(0.70) + 0.05(0.60) + 0.05(1.00)$$
$$S(A) = 0.120 + 0.220 + 0.120 + 0.105 + 0.030 + 0.050 = \mathbf{0.645}$$

$$S(B) = 0.15(0.50) + 0.40(0.90) + 0.20(0.75) + 0.15(0.65) + 0.05(0.70) + 0.05(1.00)$$
$$S(B) = 0.075 + 0.360 + 0.150 + 0.0975 + 0.035 + 0.050 = 0.7675 \xrightarrow{\text{round}} \mathbf{0.768}$$
