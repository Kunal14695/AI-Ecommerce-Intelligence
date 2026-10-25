"""
AI Product Comparison Engine
Implements multi-criteria decision support analysis with:
1. Category-wide Min-Max normalization for benefit vs cost attributes
2. Bayesian rating adjustment: R' = (v/(v+m))*R + (m/(v+m))*C
3. Multi-criteria weighted scoring: S(P) = sum_j w_j * n(P, j)
4. Transparent score breakdown, pros/cons, template explanation, and decision-support disclaimer.
"""

from typing import Dict, List, Tuple, Any, Optional
from decimal import Decimal, ROUND_HALF_UP

def round_half_up(val: float, places: int = 4) -> float:
    fmt = "0." + "0" * places
    return float(Decimal(str(round(val, 6))).quantize(Decimal(fmt), rounding=ROUND_HALF_UP))


DISCLAIMER_TEXT = (
    "Decision Support Notice: This AI-generated comparison is a decision-support tool "
    "weighted according to your selected preferences. It does not constitute a claim "
    "that one product is universally superior. Please review specific specifications "
    "and features based on your personal use case."
)

PRESET_WEIGHTS = {
    "Budget-first": {
        "price": 0.40,
        "performance": 0.15,
        "features": 0.15,
        "ratings": 0.15,
        "brand_warranty": 0.10,
        "availability": 0.05,
    },
    "Performance-first": {
        "price": 0.15,
        "performance": 0.40,
        "features": 0.20,
        "ratings": 0.15,
        "brand_warranty": 0.05,
        "availability": 0.05,
    },
    "Reliability-first": {
        "price": 0.20,
        "performance": 0.20,
        "features": 0.15,
        "ratings": 0.25,
        "brand_warranty": 0.15,
        "availability": 0.05,
    },
}

def normalize_benefit(val: float, min_val: float, max_val: float) -> float:
    """Benefit attribute: higher is better. n = (x - min)/(max - min)"""
    if max_val == min_val:
        return 1.0
    val_clamped = max(min(val, max_val), min_val)
    return round_half_up((val_clamped - min_val) / (max_val - min_val), 4)

def normalize_cost(val: float, min_val: float, max_val: float) -> float:
    """Cost attribute (e.g. price, weight): lower is better. n = (max - x)/(max - min)"""
    if max_val == min_val:
        return 1.0
    val_clamped = max(min(val, max_val), min_val)
    return round_half_up((max_val - val_clamped) / (max_val - min_val), 4)

def bayesian_adjusted_rating(v: int, r: float, m: float = 5.0, c: float = 4.0) -> float:
    """
    Bayesian adjusted rating:
    R' = (v / (v + m)) * R + (m / (v + m)) * C
    v = rating count, m = prior count weight, C = category mean rating (default 4.0 out of 5)
    Returns adjusted rating normalized to [0, 1].
    """
    if v == 0:
        raw_adjusted = c
    else:
        raw_adjusted = (v / (v + m)) * r + (m / (v + m)) * c
    # Normalize 1-5 scale to 0-1
    return round_half_up(max(0.0, min(1.0, (raw_adjusted - 1.0) / 4.0)), 4)

def calculate_multi_criteria_scores(
    price_scores: Tuple[float, float],
    perf_scores: Tuple[float, float],
    feature_scores: Tuple[float, float],
    rating_scores: Tuple[float, float],
    brand_scores: Tuple[float, float],
    avail_scores: Tuple[float, float],
    weights: Dict[str, float]
) -> Tuple[float, float]:
    """
    Calculates weighted score S(P) = sum_j w_j * n(P, j)
    Guarantees weights sum to 1.
    """
    total_w = sum(weights.values())
    if total_w == 0:
        total_w = 1.0
    norm_w = {k: v / total_w for k, v in weights.items()}

    score_a = (
        norm_w["price"] * price_scores[0]
        + norm_w["performance"] * perf_scores[0]
        + norm_w["features"] * feature_scores[0]
        + norm_w["ratings"] * rating_scores[0]
        + norm_w["brand_warranty"] * brand_scores[0]
        + norm_w["availability"] * avail_scores[0]
    )

    score_b = (
        norm_w["price"] * price_scores[1]
        + norm_w["performance"] * perf_scores[1]
        + norm_w["features"] * feature_scores[1]
        + norm_w["ratings"] * rating_scores[1]
        + norm_w["brand_warranty"] * brand_scores[1]
        + norm_w["availability"] * avail_scores[1]
    )

    return round_half_up(score_a, 4), round_half_up(score_b, 4)


def generate_plain_explanation(
    prod_a_title: str,
    prod_b_title: str,
    score_a: float,
    score_b: float,
    criteria_diffs: Dict[str, float],
    preset_used: str,
    active_weights: Dict[str, float]
) -> Tuple[str, str, List[str], List[str], List[str], List[str]]:
    """
    Template-generated explanation based on criteria differentials.
    Produces ai_summary, conditional_recommendation, pros_a, cons_a, pros_b, cons_b.
    """
    pros_a = []
    cons_a = []
    pros_b = []
    cons_b = []

    criteria_names = {
        "price": "Price & Value",
        "performance": "Performance Specifications",
        "features": "Feature Set & Display",
        "ratings": "Customer Ratings & Reviews",
        "brand_warranty": "Brand & Warranty Coverage",
        "availability": "Stock Availability"
    }

    for crit, diff in criteria_diffs.items():
        name = criteria_names.get(crit, crit.replace("_", " ").title())
        if diff > 0.05:
            pros_a.append(f"Superior {name} (outperforms by {int(diff*100)}%)")
            cons_b.append(f"Lower {name} compared to competitor")
        elif diff < -0.05:
            pros_b.append(f"Superior {name} (outperforms by {int(abs(diff)*100)}%)")
            cons_a.append(f"Lower {name} compared to competitor")

    # Fallbacks if differences are minor
    if not pros_a:
        pros_a.append("Competitive balanced offering across all evaluated criteria")
    if not pros_b:
        pros_b.append("Competitive balanced offering across all evaluated criteria")

    # Conditional recommendation logic
    price_diff = criteria_diffs.get("price", 0.0)
    perf_diff = criteria_diffs.get("performance", 0.0)

    if price_diff > 0.10 and perf_diff < -0.10:
        cond_rec = (
            f"If low price and budget economy are your primary priorities, {prod_a_title} is the better fit. "
            f"However, if high-end processing performance and raw hardware power matter more, {prod_b_title} is preferable."
        )
    elif price_diff < -0.10 and perf_diff > 0.10:
        cond_rec = (
            f"If superior hardware performance is your primary priority, {prod_a_title} is the better fit. "
            f"However, if upfront savings and budget efficiency matter more, {prod_b_title} is preferable."
        )
    else:
        top_a = [k for k, v in criteria_diffs.items() if v > 0.05]
        top_b = [k for k, v in criteria_diffs.items() if v < -0.05]
        cond_rec = (
            f"Choose {prod_a_title} if you value {', '.join([criteria_names.get(x, x) for x in top_a]) or 'overall balance'}. "
            f"Choose {prod_b_title} if you prioritize {', '.join([criteria_names.get(x, x) for x in top_b]) or 'all-around utility'}."
        )

    score_pct_a = int(round(score_a * 100))
    score_pct_b = int(round(score_b * 100))

    if score_a > score_b:
        ai_summary = (
            f"Under the {preset_used} profile (weighted heavily toward key criteria), "
            f"{prod_a_title} scores {score_pct_a}/100, leading {prod_b_title} ({score_pct_b}/100) "
            f"by {score_pct_a - score_pct_b} points."
        )
    elif score_b > score_a:
        ai_summary = (
            f"Under the {preset_used} profile (weighted heavily toward key criteria), "
            f"{prod_b_title} scores {score_pct_b}/100, leading {prod_a_title} ({score_pct_a}/100) "
            f"by {score_pct_b - score_pct_a} points."
        )
    else:
        ai_summary = (
            f"Both products receive an identical aggregate score of {score_pct_a}/100 "
            f"under the {preset_used} preference weighting."
        )

    return ai_summary, cond_rec, pros_a, cons_a, pros_b, cons_b
