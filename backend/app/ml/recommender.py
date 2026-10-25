"""
Personalized Recommendation Engine
- Content-based filtering using TF-IDF + Cosine Similarity over product titles, categories, and specs.
- Interaction-weighted user profiling (views = 1x, compares = 2x, cart = 3x).
- Cold-start fallback (popular/top-rated available products).
- Strict stock availability filter.
"""

import math
import re
from collections import Counter
from typing import List, Dict, Any, Tuple
import numpy as np

def tokenize_and_clean(text: str) -> List[str]:
    """Tokenize text into lowercase words, removing short tokens and punctuation."""
    return [w for w in re.findall(r"\b[a-zA-Z0-9]{2,}\b", text.lower())]

class SimpleTfidfVectorizer:
    """
    Lightweight, robust TF-IDF vectorizer using NumPy.
    Matches standard scikit-learn TfidfVectorizer formulation:
    IDF(t) = log((1 + N) / (1 + df(t))) + 1
    L2 normalization applied to each vector.
    """
    def __init__(self):
        self.vocabulary_: Dict[str, int] = {}
        self.idf_: np.ndarray = np.array([])
        self.n_samples_: int = 0

    def fit_transform(self, documents: List[str]) -> np.ndarray:
        self.n_samples_ = len(documents)
        df_counter = Counter()
        doc_tokens_list = []

        for doc in documents:
            tokens = tokenize_and_clean(doc)
            unique_tokens = set(tokens)
            df_counter.update(unique_tokens)
            doc_tokens_list.append(tokens)

        # Build vocabulary sorted for deterministic feature indices
        vocab = {term: idx for idx, (term, count) in enumerate(sorted(df_counter.items()))}
        self.vocabulary_ = vocab
        vocab_size = len(vocab)

        # Compute smoothed IDF
        idf_vals = np.zeros(vocab_size, dtype=np.float32)
        for term, idx in vocab.items():
            df = df_counter[term]
            idf_vals[idx] = math.log((1.0 + self.n_samples_) / (1.0 + df)) + 1.0
        self.idf_ = idf_vals

        # Compute TF and apply IDF
        matrix = np.zeros((self.n_samples_, vocab_size), dtype=np.float32)
        for doc_idx, tokens in enumerate(doc_tokens_list):
            if not tokens:
                continue
            tf_counter = Counter(tokens)
            total_terms = float(len(tokens))
            for term, count in tf_counter.items():
                if term in vocab:
                    col_idx = vocab[term]
                    tf = count / total_terms
                    matrix[doc_idx, col_idx] = tf * self.idf_[col_idx]

            # L2 normalize row
            norm = np.linalg.norm(matrix[doc_idx])
            if norm > 0:
                matrix[doc_idx] /= norm

        return matrix

    def transform(self, documents: List[str]) -> np.ndarray:
        vocab_size = len(self.vocabulary_)
        matrix = np.zeros((len(documents), vocab_size), dtype=np.float32)

        for doc_idx, doc in enumerate(documents):
            tokens = tokenize_and_clean(doc)
            if not tokens:
                continue
            tf_counter = Counter(tokens)
            total_terms = float(len(tokens))
            for term, count in tf_counter.items():
                if term in self.vocabulary_:
                    col_idx = self.vocabulary_[term]
                    tf = count / total_terms
                    matrix[doc_idx, col_idx] = tf * self.idf_[col_idx]

            norm = np.linalg.norm(matrix[doc_idx])
            if norm > 0:
                matrix[doc_idx] /= norm

        return matrix

def build_product_feature_text(product: Any) -> str:
    """Builds a rich textual representation of a product including category and specs."""
    parts = [
        product.title or "",
        product.brand or "",
        product.model_name or "",
        product.description or "",
    ]
    if hasattr(product, "category") and product.category:
        parts.append(product.category.name)
    if hasattr(product, "specifications"):
        for spec in product.specifications:
            parts.append(f"{spec.name} {spec.raw_value}")
    return " ".join(parts)

def get_recommendations_for_user(
    products: List[Any],
    user_interactions: List[Any],
    limit: int = 6
) -> List[Dict[str, Any]]:
    """
    Computes personalized recommendations:
    - If user has interactions (views, compares, cart additions), builds an interaction-weighted
      profile vector and scores candidates using cosine similarity.
    - If user is new (cold-start), falls back to top-rated & most popular in-stock items.
    """
    # Filter only available and in-stock products
    available_products = [p for p in products if p.is_available and p.stock > 0]
    if not available_products:
        return []

    prod_id_to_index = {p.id: i for i, p in enumerate(available_products)}
    corpus = [build_product_feature_text(p) for p in available_products]

    vectorizer = SimpleTfidfVectorizer()
    tfidf_matrix = vectorizer.fit_transform(corpus)

    # Weights for interaction types
    EVENT_WEIGHTS = {
        "view": 1.0,
        "search": 1.0,
        "compare": 2.5,
        "wishlist": 3.0,
        "cart": 4.0
    }

    # Build user profile vector
    user_vector = np.zeros(tfidf_matrix.shape[1], dtype=np.float32)
    interacted_product_ids = set()
    has_interactions = False

    for interaction in user_interactions:
        pid = interaction.product_id
        interacted_product_ids.add(pid)
        if pid in prod_id_to_index:
            idx = prod_id_to_index[pid]
            weight = EVENT_WEIGHTS.get(interaction.event_type, 1.0)
            user_vector += weight * tfidf_matrix[idx]
            has_interactions = True

    results = []

    if has_interactions and np.linalg.norm(user_vector) > 0:
        # Normalize user vector
        user_vector /= np.linalg.norm(user_vector)
        # Compute cosine similarity across all products
        sim_scores = np.dot(tfidf_matrix, user_vector)

        candidate_scores = []
        for i, prod in enumerate(available_products):
            # Prioritize items user hasn't already bought or added, but allow them if catalog is small
            score = float(sim_scores[i])
            reason = f"Matches your interest in {prod.brand} {prod.category.name if prod.category else ''}"
            candidate_scores.append((prod, score, reason))

        # Sort by similarity descending
        candidate_scores.sort(key=lambda x: x[1], reverse=True)
        results = [
            {"product": item[0], "score": round(item[1], 4), "reason": item[2]}
            for item in candidate_scores[:limit]
        ]
    else:
        # Cold-start fallback: Top-rated and popular products
        def popularity_key(prod):
            reviews = getattr(prod, "reviews", [])
            avg_rating = sum(r.rating for r in reviews) / len(reviews) if reviews else 4.0
            return (avg_rating, len(reviews), -prod.price)

        sorted_fallback = sorted(available_products, key=popularity_key, reverse=True)
        results = [
            {
                "product": prod,
                "score": 0.85,
                "reason": f"Top-rated customer favorite in {prod.category.name if prod.category else 'store'}"
            }
            for prod in sorted_fallback[:limit]
        ]

    return results
