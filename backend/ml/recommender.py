import json
import os
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

print("🤖 Loading recommendation engine...")

# ── Load products ──
_dir = os.path.dirname(__file__)
with open(os.path.join(_dir, "products.json"), "r", encoding="utf-8") as f:
    PRODUCTS = json.load(f)

PRODUCTS_LIST = PRODUCTS
_PRODUCTS_BY_ID = {p["id"]: p for p in PRODUCTS}

# ── Build TF-IDF matrix ──
# Combine name + category into one text string per product
# More weight on name by repeating it 3x
def build_product_text(p):
    name = p.get("name", "")
    category = p.get("category", "")
    return f"{name} {name} {name} {category}"

corpus = [build_product_text(p) for p in PRODUCTS]

vectorizer = TfidfVectorizer(
    stop_words="english",   # remove common words like "and", "the"
    ngram_range=(1, 2),     # use single words AND word pairs
    max_features=5000,      # top 5000 most important words
)

tfidf_matrix = vectorizer.fit_transform(corpus)
print(f"✅ TF-IDF matrix built: {tfidf_matrix.shape[0]} products × {tfidf_matrix.shape[1]} features")


# ── Main recommendation function ──
def get_recommendations(product_id: int, n: int = 8):
    target = _PRODUCTS_BY_ID.get(product_id)
    if not target:
        return []

    # Get index of this product in our list
    try:
        idx = next(i for i, p in enumerate(PRODUCTS) if p["id"] == product_id)
    except StopIteration:
        return []

    # ── Step 1: Cosine similarity on TF-IDF (name similarity) ──
    product_vector = tfidf_matrix[idx]
    similarity_scores = cosine_similarity(product_vector, tfidf_matrix).flatten()

    # ── Step 2: Price similarity score (closer price = higher score) ──
    target_price = target["price"]
    max_price = max(p["price"] for p in PRODUCTS)

    price_scores = np.array([
        1 - abs(p["price"] - target_price) / (max_price + 1)
        for p in PRODUCTS
    ])

    # ── Step 3: Category boost (same category gets +0.3 bonus) ──
    category_scores = np.array([
        0.3 if p["category"] == target["category"] else 0.0
        for p in PRODUCTS
    ])

    # ── Step 4: Combine all scores ──
    # 50% name similarity + 30% price + 20% category
    final_scores = (
        0.5 * similarity_scores +
        0.3 * price_scores +
        0.2 * category_scores
    )

    # ── Step 5: Sort and return top N (exclude self) ──
    ranked_indices = final_scores.argsort()[::-1]  # highest first

    recommendations = []
    for i in ranked_indices:
        if PRODUCTS[i]["id"] == product_id:
            continue  # skip the product itself
        recommendations.append(PRODUCTS[i])
        if len(recommendations) >= n:
            break

    return recommendations