import json
from typing import Optional, Dict, Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Product, Comparison, Review, Category
from ..schemas.comparison import ComparisonRequest, ComparisonResponse, CriterionScoreDetail
from ..ml.comparison_engine import (
    normalize_benefit, normalize_cost, bayesian_adjusted_rating,
    calculate_multi_criteria_scores, generate_plain_explanation,
    round_half_up, PRESET_WEIGHTS, DISCLAIMER_TEXT
)
from .products import format_product_dict

router = APIRouter(prefix="/api/compare", tags=["AI Comparison Engine"])

@router.post("", response_model=ComparisonResponse)
def compare_products(
    payload: ComparisonRequest,
    db: Session = Depends(get_db)
):
    prod_a = db.query(Product).filter(Product.id == payload.product_a_id).first()
    prod_b = db.query(Product).filter(Product.id == payload.product_b_id).first()

    if not prod_a or not prod_b:
        raise HTTPException(status_code=404, detail="One or both products not found for comparison")

    # 1. Category warning check
    category_warning = None
    if prod_a.category_id != prod_b.category_id:
        name_a = prod_a.category.name if prod_a.category else "Category A"
        name_b = prod_b.category.name if prod_b.category else "Category B"
        category_warning = (
            f"Notice: You are comparing products from two different categories ({name_a} vs {name_b}). "
            f"Cross-category score comparisons reflect relative category value rather than direct hardware equivalence."
        )

    # Gather category bounds for normalization
    # Query all products in the same category (or across both categories if cross-category)
    cat_ids = list({prod_a.category_id, prod_b.category_id})
    category_products = db.query(Product).filter(Product.category_id.in_(cat_ids)).all()

    # Price min/max
    prices = [p.price for p in category_products]
    min_price = min(prices) if prices else 1000.0
    max_price = max(prices) if prices else 200000.0

    # Warranty min/max
    warranties = [p.warranty_months for p in category_products]
    min_warranty = min(warranties) if warranties else 6
    max_warranty = max(warranties) if warranties else 24

    # 2. Extract and match specifications
    specs_a = {s.name.lower(): s for s in prod_a.specifications}
    specs_b = {s.name.lower(): s for s in prod_b.specifications}

    all_spec_names = set(specs_a.keys()).union(set(specs_b.keys()))
    common_specs = set(specs_a.keys()).intersection(set(specs_b.keys()))
    missing_specs = list(all_spec_names - common_specs)
    missing_warning = [f"Attribute '{m.title()}' is not specified for both models and was omitted from direct pair-scoring." for m in missing_specs] if missing_specs else None

    # Performance specs score (e.g. RAM, Processor benchmark, Screen size)
    perf_keys = {"ram", "processor benchmark", "driver size"}
    perf_a_scores = []
    perf_b_scores = []

    # Features specs score (e.g. Display Refresh Rate, Fast Charging, Storage, Battery Life, ANC Attenuation)
    feature_keys = {"display refresh rate", "storage", "battery", "battery life", "fast charging", "camera megapixels", "anc attenuation"}
    feat_a_scores = []
    feat_b_scores = []

    for key in common_specs:
        sa = specs_a[key]
        sb = specs_b[key]
        if sa.numeric_value is not None and sb.numeric_value is not None:
            # Gather category bounds for this spec
            all_spec_nums = [
                s.numeric_value
                for p in category_products
                for s in p.specifications
                if s.name.lower() == key and s.numeric_value is not None
            ]
            s_min = min(all_spec_nums) if all_spec_nums else min(sa.numeric_value, sb.numeric_value)
            s_max = max(all_spec_nums) if all_spec_nums else max(sa.numeric_value, sb.numeric_value)

            if sa.is_benefit:
                norm_a = normalize_benefit(sa.numeric_value, s_min, s_max)
                norm_b = normalize_benefit(sb.numeric_value, s_min, s_max)
            else:
                norm_a = normalize_cost(sa.numeric_value, s_min, s_max)
                norm_b = normalize_cost(sb.numeric_value, s_min, s_max)

            if any(pk in key for pk in perf_keys):
                perf_a_scores.append(norm_a)
                perf_b_scores.append(norm_b)
            else:
                feat_a_scores.append(norm_a)
                feat_b_scores.append(norm_b)

    # 3. Criterion 1: Price Score (Cost attribute: lower price = higher score)
    price_score_a = normalize_cost(prod_a.price, min_price, max_price)
    price_score_b = normalize_cost(prod_b.price, min_price, max_price)

    # Criterion 2: Performance Score
    score_perf_a = round_half_up(sum(perf_a_scores) / len(perf_a_scores), 4) if perf_a_scores else 0.70
    score_perf_b = round_half_up(sum(perf_b_scores) / len(perf_b_scores), 4) if perf_b_scores else 0.70

    # Criterion 3: Features Score
    score_feat_a = round_half_up(sum(feat_a_scores) / len(feat_a_scores), 4) if feat_a_scores else 0.70
    score_feat_b = round_half_up(sum(feat_b_scores) / len(feat_b_scores), 4) if feat_b_scores else 0.70

    # Criterion 4: Ratings & Reviews (Bayesian adjusted + VADER sentiment)
    cat_reviews = db.query(Review).join(Product).filter(Product.category_id.in_(cat_ids)).all()
    cat_mean_rating = (sum(r.rating for r in cat_reviews) / len(cat_reviews)) if cat_reviews else 4.0

    revs_a = prod_a.reviews
    revs_b = prod_b.reviews
    avg_r_a = (sum(r.rating for r in revs_a) / len(revs_a)) if revs_a else 4.0
    avg_r_b = (sum(r.rating for r in revs_b) / len(revs_b)) if revs_b else 4.0

    score_rating_a = bayesian_adjusted_rating(len(revs_a), avg_r_a, m=5.0, c=cat_mean_rating)
    score_rating_b = bayesian_adjusted_rating(len(revs_b), avg_r_b, m=5.0, c=cat_mean_rating)

    # Incorporate VADER sentiment compound if reviews exist
    if revs_a:
        avg_sent_a = sum(r.sentiment_score for r in revs_a) / len(revs_a)
        # Scale compound [-1, 1] to [0, 1]
        sent_norm_a = (avg_sent_a + 1.0) / 2.0
        score_rating_a = round_half_up(0.70 * score_rating_a + 0.30 * sent_norm_a, 4)

    if revs_b:
        avg_sent_b = sum(r.sentiment_score for r in revs_b) / len(revs_b)
        sent_norm_b = (avg_sent_b + 1.0) / 2.0
        score_rating_b = round_half_up(0.70 * score_rating_b + 0.30 * sent_norm_b, 4)

    # Criterion 5: Brand & Warranty Coverage
    score_brand_a = normalize_benefit(prod_a.warranty_months, min_warranty, max_warranty)
    score_brand_b = normalize_benefit(prod_b.warranty_months, min_warranty, max_warranty)

    # Criterion 6: Availability
    score_avail_a = 1.0 if (prod_a.is_available and prod_a.stock > 0) else 0.0
    score_avail_b = 1.0 if (prod_b.is_available and prod_b.stock > 0) else 0.0

    # 4. Resolve Weights
    preset_used = payload.preset or "Budget-first"
    if payload.weights:
        preset_used = "Custom"
        active_weights = {
            "price": payload.weights.price,
            "performance": payload.weights.performance,
            "features": payload.weights.features,
            "ratings": payload.weights.ratings,
            "brand_warranty": payload.weights.brand_warranty,
            "availability": payload.weights.availability,
        }
    else:
        active_weights = PRESET_WEIGHTS.get(preset_used, PRESET_WEIGHTS["Budget-first"]).copy()

    # Normalize weights so sum is exactly 1.0
    w_sum = sum(active_weights.values()) or 1.0
    normalized_weights = {k: v / w_sum for k, v in active_weights.items()}

    # 5. Compute Final Weighted Scores
    score_a, score_b = calculate_multi_criteria_scores(
        (price_score_a, price_score_b),
        (score_perf_a, score_perf_b),
        (score_feat_a, score_feat_b),
        (score_rating_a, score_rating_b),
        (score_brand_a, score_brand_b),
        (score_avail_a, score_avail_b),
        normalized_weights
    )

    # 6. Detailed Criteria Breakdown
    def advantage_label(sa, sb):
        diff = sa - sb
        if diff > 0.03:
            return "Product A"
        elif diff < -0.03:
            return "Product B"
        return "Tie"

    breakdown = [
        CriterionScoreDetail(
            criterion="price",
            label="Price & Value Economy",
            weight=round_half_up(normalized_weights["price"], 2),
            raw_a=f"Rs. {int(prod_a.price):,}",
            raw_b=f"Rs. {int(prod_b.price):,}",
            score_a=price_score_a,
            score_b=price_score_b,
            advantage=advantage_label(price_score_a, price_score_b),
            explanation=(
                f"{prod_a.brand} is priced at Rs. {int(prod_a.price):,} vs "
                f"{prod_b.brand} at Rs. {int(prod_b.price):,}."
            )
        ),
        CriterionScoreDetail(
            criterion="performance",
            label="Hardware & Processing Specs",
            weight=round_half_up(normalized_weights["performance"], 2),
            raw_a=f"{int(score_perf_a * 100)}/100",
            raw_b=f"{int(score_perf_b * 100)}/100",
            score_a=score_perf_a,
            score_b=score_perf_b,
            advantage=advantage_label(score_perf_a, score_perf_b),
            explanation="Benchmarked hardware capabilities, RAM, and chipset compute capacity."
        ),
        CriterionScoreDetail(
            criterion="features",
            label="Features, Display & Endurance",
            weight=round_half_up(normalized_weights["features"], 2),
            raw_a=f"{int(score_feat_a * 100)}/100",
            raw_b=f"{int(score_feat_b * 100)}/100",
            score_a=score_feat_a,
            score_b=score_feat_b,
            advantage=advantage_label(score_feat_a, score_feat_b),
            explanation="Display refresh rate, battery capacity, fast charging speed, and primary optics."
        ),
        CriterionScoreDetail(
            criterion="ratings",
            label="Customer Ratings & VADER Sentiment",
            weight=round_half_up(normalized_weights["ratings"], 2),
            raw_a=f"{avg_r_a:.1f} Stars ({len(revs_a)} rev)",
            raw_b=f"{avg_r_b:.1f} Stars ({len(revs_b)} rev)",
            score_a=score_rating_a,
            score_b=score_rating_b,
            advantage=advantage_label(score_rating_a, score_rating_b),
            explanation="Bayesian weighted rating adjusted for sample size plus NLP sentiment polarity."
        ),
        CriterionScoreDetail(
            criterion="brand_warranty",
            label="Warranty Coverage & Brand",
            weight=round_half_up(normalized_weights["brand_warranty"], 2),
            raw_a=f"{prod_a.warranty_months} Months",
            raw_b=f"{prod_b.warranty_months} Months",
            score_a=score_brand_a,
            score_b=score_brand_b,
            advantage=advantage_label(score_brand_a, score_brand_b),
            explanation=f"Manufacturer warranty coverage ({prod_a.warranty_months}m vs {prod_b.warranty_months}m)."
        ),
        CriterionScoreDetail(
            criterion="availability",
            label="In-Stock Availability",
            weight=round_half_up(normalized_weights["availability"], 2),
            raw_a="In Stock" if prod_a.is_available else "Out of Stock",
            raw_b="In Stock" if prod_b.is_available else "Out of Stock",
            score_a=score_avail_a,
            score_b=score_avail_b,
            advantage=advantage_label(score_avail_a, score_avail_b),
            explanation="Immediate delivery availability check."
        )
    ]

    criteria_diffs = {
        "price": price_score_a - price_score_b,
        "performance": score_perf_a - score_perf_b,
        "features": score_feat_a - score_feat_b,
        "ratings": score_rating_a - score_rating_b,
        "brand_warranty": score_brand_a - score_brand_b,
        "availability": score_avail_a - score_avail_b,
    }

    # 7. Generate Plain Language Explanation
    ai_summary, cond_rec, pros_a, cons_a, pros_b, cons_b = generate_plain_explanation(
        prod_a.title,
        prod_b.title,
        score_a,
        score_b,
        criteria_diffs,
        preset_used,
        normalized_weights
    )

    recommended_id = prod_a.id if score_a >= score_b else prod_b.id
    recommended_name = prod_a.title if score_a >= score_b else prod_b.title

    # 8. Persist comparison to DB
    comparison_record = Comparison(
        product_a_id=prod_a.id,
        product_b_id=prod_b.id,
        criteria_weights=json.dumps(normalized_weights),
        score_a=score_a,
        score_b=score_b,
        ai_summary=ai_summary,
    )
    db.add(comparison_record)
    db.commit()

    return ComparisonResponse(
        product_a=format_product_dict(prod_a),
        product_b=format_product_dict(prod_b),
        score_a=score_a,
        score_b=score_b,
        percentage_a=round_half_up(score_a * 100, 1),
        percentage_b=round_half_up(score_b * 100, 1),
        recommended_product_id=recommended_id,
        recommended_product_name=recommended_name,
        preset_used=preset_used,
        weights_used={k: round_half_up(v, 2) for k, v in normalized_weights.items()},
        criteria_breakdown=breakdown,
        pros_a=pros_a,
        cons_a=cons_a,
        pros_b=pros_b,
        cons_b=cons_b,
        ai_summary=ai_summary,
        conditional_recommendation=cond_rec,
        disclaimer=DISCLAIMER_TEXT,
        category_warning=category_warning,
        missing_specs_warning=missing_warning,
    )
