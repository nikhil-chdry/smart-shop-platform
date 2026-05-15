from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from ml.recommender import PRODUCTS, PRODUCTS_LIST, get_recommendations

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allowing all for easier local dev
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/products")
def get_products(skip: int = 0, limit: int = 20):
    # Returns only a slice of the 1000 products
    return PRODUCTS[skip : skip + limit]

@app.get("/api/recommendations/{product_id}")
def get_rec(product_id: int):
    return get_recommendations(product_id)