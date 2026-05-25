import requests
import json
import os
from collections import Counter

print("⏳ Fetching products from reliable APIs...")

products = []

# ── SOURCE 1: DummyJSON (194 products, always reliable images) ──
print("\n📦 Fetching from DummyJSON...")
try:
    res = requests.get("https://dummyjson.com/products?limit=194", timeout=10)
    data = res.json()

    category_map = {
        "smartphones":       "Electronics",
        "laptops":           "Electronics",
        "tablets":           "Electronics",
        "mobile-accessories":"Electronics",
        "computer-accessories": "Electronics",
        "womens-dresses":    "Fashion",
        "womens-shoes":      "Fashion",
        "mens-shirts":       "Fashion",
        "mens-shoes":        "Fashion",
        "mens-watches":      "Fashion",
        "womens-watches":    "Fashion",
        "womens-bags":       "Fashion",
        "womens-jewellery":  "Fashion",
        "sunglasses":        "Fashion",
        "tops":              "Fashion",
        "skincare":          "Fashion",
        "fragrances":        "Fashion",
        "furniture":         "Home",
        "home-decoration":   "Home",
        "lighting":          "Home",
        "kitchen-accessories": "Appliances",
        "groceries":         "Home",
        "automotive":        "Electronics",
        "motorcycle":        "Electronics",
        "sports-accessories": "Fashion",
        "vehicle":           "Electronics",
    }

    for item in data.get("products", []):
        cat_raw = item.get("category", "").lower()
        category = category_map.get(cat_raw, "General")
        if category == "General":
            continue

        # Convert USD to INR (approx ×83)
        price_usd = float(item.get("price", 10))
        price_inr = round(price_usd * 83, 2)

        image = item.get("thumbnail", "")
        if not image:
            images = item.get("images", [])
            image = images[0] if images else ""

        if not image:
            continue

        products.append({
            "id":        len(products) + 1,
            "name":      str(item.get("title", ""))[:120],
            "price":     price_inr,
            "category":  category,
            "image_url": image,
            "rating":    round(float(item.get("rating", 4.0)), 1),
            "brand":     str(item.get("brand", "")),
        })

    print(f"   ✅ Got {len(products)} products from DummyJSON")

except Exception as e:
    print(f"   ❌ DummyJSON failed: {e}")


# ── SOURCE 2: FakeStore API (20 more products) ──
print("\n📦 Fetching from FakeStore API...")
try:
    res = requests.get("https://fakestoreapi.com/products", timeout=10)
    data = res.json()

    cat_map = {
        "electronics":        "Electronics",
        "jewelery":           "Fashion",
        "men's clothing":     "Fashion",
        "women's clothing":   "Fashion",
    }

    for item in data:
        category = cat_map.get(item.get("category", "").lower(), "General")
        if category == "General":
            continue

        price_usd = float(item.get("price", 10))
        price_inr = round(price_usd * 83, 2)
        image = item.get("image", "")
        if not image:
            continue

        products.append({
            "id":        len(products) + 1,
            "name":      str(item.get("title", ""))[:120],
            "price":     price_inr,
            "category":  category,
            "image_url": image,
            "rating":    round(float(item.get("rating", {}).get("rate", 4.0)), 1),
            "brand":     "",
        })

    print(f"   ✅ FakeStore added. Total now: {len(products)}")

except Exception as e:
    print(f"   ❌ FakeStore failed: {e}")


# ── SOURCE 3: Platzi Fake Store (extra products) ──
print("\n📦 Fetching from Platzi Fake Store...")
try:
    res = requests.get("https://api.escuelajs.co/api/v1/products?offset=0&limit=100", timeout=10)
    data = res.json()

    for item in data:
        cat_name = item.get("category", {}).get("name", "").lower()
        if "electronic" in cat_name:
            category = "Electronics"
        elif "cloth" in cat_name or "fashion" in cat_name or "shoe" in cat_name:
            category = "Fashion"
        elif "home" in cat_name or "furniture" in cat_name:
            category = "Home"
        elif "appliance" in cat_name or "kitchen" in cat_name:
            category = "Appliances"
        else:
            continue

        price_usd = float(item.get("price", 10))
        price_inr = round(price_usd * 83, 2)

        images = item.get("images", [])
        image = images[0].strip('["').strip('"]') if images else ""
        if not image or "placeimg" in image:
            continue

        name = str(item.get("title", ""))[:120]
        if not name:
            continue

        products.append({
            "id":        len(products) + 1,
            "name":      name,
            "price":     price_inr,
            "category":  category,
            "image_url": image,
            "rating":    round(4.0 + (len(products) % 10) / 10, 1),
            "brand":     "",
        })

    print(f"   ✅ Platzi added. Total now: {len(products)}")

except Exception as e:
    print(f"   ❌ Platzi failed: {e}")


# ── Save ──
output_path = os.path.join(os.path.dirname(__file__), "products.json")
with open(output_path, "w", encoding="utf-8") as f:
    json.dump(products, f, indent=2, ensure_ascii=False)

print(f"\n✅ Saved {len(products)} products → ml/products.json")
print("\n📦 Category breakdown:")
for cat, count in Counter(p["category"] for p in products).most_common():
    print(f"   {cat}: {count}")