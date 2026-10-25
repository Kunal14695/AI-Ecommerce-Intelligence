"""
TC-04: AI Product Comparison Execution
TC-05: AI Comparison Engine Mathematical Verification
"""
from app.ml.comparison_engine import (
    calculate_multi_criteria_scores, round_half_up,
    PRESET_WEIGHTS, DISCLAIMER_TEXT
)

def test_tc04_comparison_pipeline_execution(client):
    payload = {
        "product_a_id": 1,
        "product_b_id": 2,
        "preset": "Budget-first"
    }
    res = client.post("/api/compare", json=payload)
    assert res.status_code == 200
    data = res.json()

    assert "score_a" in data and "score_b" in data
    assert "criteria_breakdown" in data
    assert len(data["criteria_breakdown"]) == 6  # 6 criteria
    assert "pros_a" in data and "cons_a" in data
    assert "ai_summary" in data
    assert "conditional_recommendation" in data
    assert "disclaimer" in data
    assert DISCLAIMER_TEXT in data["disclaimer"]

def test_tc05_exact_mathematical_reference_case():
    """
    Verifies the exact illustrative test case specified in project requirements:
    Normalized attribute scores:
    Price: A=0.80, B=0.50
    Performance: A=0.55, B=0.90
    Features: A=0.60, B=0.75
    Ratings: A=0.70, B=0.65
    Brand: A=0.60, B=0.70
    Availability: A=1.00, B=1.00

    Budget-first weights (0.40/0.15/0.15/0.15/0.10/0.05):
    A = 0.708, B = 0.665

    Performance-first weights (0.15/0.40/0.20/0.15/0.05/0.05):
    A = 0.645, B = 0.768
    """
    price = (0.80, 0.50)
    perf = (0.55, 0.90)
    feat = (0.60, 0.75)
    rat = (0.70, 0.65)
    brand = (0.60, 0.70)
    avail = (1.0, 1.0)

    # 1. Budget-first profile check
    score_a_b, score_b_b = calculate_multi_criteria_scores(
        price, perf, feat, rat, brand, avail, PRESET_WEIGHTS["Budget-first"]
    )
    assert round_half_up(score_a_b, 3) == 0.708, f"Expected 0.708, got {round_half_up(score_a_b, 3)}"
    assert round_half_up(score_b_b, 3) == 0.665, f"Expected 0.665, got {round_half_up(score_b_b, 3)}"

    # 2. Performance-first profile check
    score_a_p, score_b_p = calculate_multi_criteria_scores(
        price, perf, feat, rat, brand, avail, PRESET_WEIGHTS["Performance-first"]
    )
    assert round_half_up(score_a_p, 3) == 0.645, f"Expected 0.645, got {round_half_up(score_a_p, 3)}"
    assert round_half_up(score_b_p, 3) == 0.768, f"Expected 0.768, got {round_half_up(score_b_p, 3)}"

    # 3. Symmetry test: swapping A and B mirrors scores
    price_swapped = (0.50, 0.80)
    perf_swapped = (0.90, 0.55)
    feat_swapped = (0.75, 0.60)
    rat_swapped = (0.65, 0.70)
    brand_swapped = (0.70, 0.60)
    avail_swapped = (1.0, 1.0)

    score_b_sym, score_a_sym = calculate_multi_criteria_scores(
        price_swapped, perf_swapped, feat_swapped, rat_swapped, brand_swapped, avail_swapped, PRESET_WEIGHTS["Budget-first"]
    )
    assert score_a_b == score_a_sym and score_b_b == score_b_sym

    # 4. Weight Directionality test: higher weight on price favors product with better price
    custom_price_heavy = {"price": 0.80, "performance": 0.05, "features": 0.05, "ratings": 0.05, "brand_warranty": 0.03, "availability": 0.02}
    s_a_ph, s_b_ph = calculate_multi_criteria_scores(price, perf, feat, rat, brand, avail, custom_price_heavy)
    assert s_a_ph > s_b_ph  # Product A has 0.80 vs 0.50 in price
