from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from ml.recommender import PRODUCTS, PRODUCTS_LIST, get_recommendations

app = FastAPI(title="SmartShop API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://smart-shop-platform-aaph.vercel.app"
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── PRE-BUILD a fast lookup dict (runs once at startup) ──
PRODUCTS_BY_ID = {p["id"]: p for p in PRODUCTS}


# ── 1. GET ALL PRODUCTS (with optional search & category filter) ──
@app.get("/api/products")
def get_products(
    search: str = Query(default="", description="Search by name"),
    category: str = Query(default="", description="Filter by category"),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=1000, ge=1, le=1000),  # ← Fixed: default 1000
):
    results = PRODUCTS

    if search:
        results = [p for p in results if search.lower() in p["name"].lower()]

    if category and category.lower() != "all":
        results = [p for p in results if p.get("category", "").lower() == category.lower()]

    return results[skip : skip + limit]


# ── 2. GET SINGLE PRODUCT BY ID (new!) ──
@app.get("/api/products/{product_id}")
def get_product(product_id: int):
    product = PRODUCTS_BY_ID.get(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


# ── 3. GET AI RECOMMENDATIONS (with error handling) ──
@app.get("/api/recommendations/{product_id}")
def get_rec(product_id: int):
    if product_id not in PRODUCTS_BY_ID:
        raise HTTPException(status_code=404, detail="Product not found")
    try:
        return get_recommendations(product_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Recommendation engine error: {str(e)}")


# ── 4. HEALTH CHECK (useful for debugging) ──
@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "total_products": len(PRODUCTS),
    }


#to start the server, run the following commands in terminal:
# PS C:\Users\nikhi\OneDrive\Desktop\smart recomendation system> cd backend
# PS C:\Users\nikhi\OneDrive\Desktop\smart recomendation system\backend> python -m venv venv
# PS C:\Users\nikhi\OneDrive\Desktop\smart recomendation system\backend> pip install fastapi uvicorn pandas scikit-learn
# Defaulting to user installation because normal site-packages is not writeable
# Collecting fastapi
#   Using cached fastapi-0.136.1-py3-none-any.whl.metadata (28 kB)
# Collecting uvicorn
#   Using cached uvicorn-0.47.0-py3-none-any.whl.metadata (6.7 kB)
# Collecting pandas
#   Using cached pandas-3.0.3-cp313-cp313-win_amd64.whl.metadata (19 kB)
# Collecting scikit-learn
#   Using cached scikit_learn-1.8.0-cp313-cp313-win_amd64.whl.metadata (11 kB)
# Collecting starlette>=0.46.0 (from fastapi)
#   Downloading starlette-1.0.1-py3-none-any.whl.metadata (6.3 kB)
# Collecting pydantic>=2.9.0 (from fastapi)
#   Using cached pydantic-2.13.4-py3-none-any.whl.metadata (109 kB)
# Collecting typing-extensions>=4.8.0 (from fastapi)
#   Using cached typing_extensions-4.15.0-py3-none-any.whl.metadata (3.3 kB)
# Collecting typing-inspection>=0.4.2 (from fastapi)
#   Using cached typing_inspection-0.4.2-py3-none-any.whl.metadata (2.6 kB)
# Collecting annotated-doc>=0.0.2 (from fastapi)
#   Using cached annotated_doc-0.0.4-py3-none-any.whl.metadata (6.6 kB)
# Collecting click>=7.0 (from uvicorn)
#   Downloading click-8.4.1-py3-none-any.whl.metadata (2.6 kB)
# Collecting h11>=0.8 (from uvicorn)
#   Using cached h11-0.16.0-py3-none-any.whl.metadata (8.3 kB)
# Collecting numpy>=1.26.0 (from pandas)
#   Downloading numpy-2.4.6-cp313-cp313-win_amd64.whl.metadata (6.6 kB)
# Collecting python-dateutil>=2.8.2 (from pandas)
#   Using cached python_dateutil-2.9.0.post0-py2.py3-none-any.whl.metadata (8.4 kB)
# Collecting tzdata (from pandas)
#   Using cached tzdata-2026.2-py2.py3-none-any.whl.metadata (1.4 kB)
# Collecting scipy>=1.10.0 (from scikit-learn)
#   Using cached scipy-1.17.1-cp313-cp313-win_amd64.whl.metadata (60 kB)
# Collecting joblib>=1.3.0 (from scikit-learn)
#   Using cached joblib-1.5.3-py3-none-any.whl.metadata (5.5 kB)
# Collecting threadpoolctl>=3.2.0 (from scikit-learn)
#   Using cached threadpoolctl-3.6.0-py3-none-any.whl.metadata (13 kB)
# Collecting colorama (from click>=7.0->uvicorn)
#   Using cached colorama-0.4.6-py2.py3-none-any.whl.metadata (17 kB)
# Collecting annotated-types>=0.6.0 (from pydantic>=2.9.0->fastapi)
#   Using cached annotated_types-0.7.0-py3-none-any.whl.metadata (15 kB)
# Collecting pydantic-core==2.46.4 (from pydantic>=2.9.0->fastapi)
#   Using cached pydantic_core-2.46.4-cp313-cp313-win_amd64.whl.metadata (6.7 kB)
# Collecting six>=1.5 (from python-dateutil>=2.8.2->pandas)
#   Using cached six-1.17.0-py2.py3-none-any.whl.metadata (1.7 kB)
# Collecting anyio<5,>=3.6.2 (from starlette>=0.46.0->fastapi)
#   Using cached anyio-4.13.0-py3-none-any.whl.metadata (4.5 kB)
# Collecting idna>=2.8 (from anyio<5,>=3.6.2->starlette>=0.46.0->fastapi)
#   Downloading idna-3.16-py3-none-any.whl.metadata (6.4 kB)
# Using cached fastapi-0.136.1-py3-none-any.whl (117 kB)
# Using cached uvicorn-0.47.0-py3-none-any.whl (71 kB)
# Using cached pandas-3.0.3-cp313-cp313-win_amd64.whl (9.8 MB)
# Using cached scikit_learn-1.8.0-cp313-cp313-win_amd64.whl (8.0 MB)
# Using cached annotated_doc-0.0.4-py3-none-any.whl (5.3 kB)
# Downloading click-8.4.1-py3-none-any.whl (116 kB)
# Using cached h11-0.16.0-py3-none-any.whl (37 kB)
# Using cached joblib-1.5.3-py3-none-any.whl (309 kB)
# Downloading numpy-2.4.6-cp313-cp313-win_amd64.whl (12.3 MB)
#    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 12.3/12.3 MB 4.2 MB/s eta 0:00:00
# Using cached pydantic-2.13.4-py3-none-any.whl (472 kB)
# Using cached pydantic_core-2.46.4-cp313-cp313-win_amd64.whl (2.1 MB)
# Using cached annotated_types-0.7.0-py3-none-any.whl (13 kB)
# Using cached python_dateutil-2.9.0.post0-py2.py3-none-any.whl (229 kB)
# Using cached scipy-1.17.1-cp313-cp313-win_amd64.whl (36.5 MB)
# Using cached six-1.17.0-py2.py3-none-any.whl (11 kB)
# Downloading starlette-1.0.1-py3-none-any.whl (72 kB)
# Using cached anyio-4.13.0-py3-none-any.whl (114 kB)
# Downloading idna-3.16-py3-none-any.whl (74 kB)
# Using cached threadpoolctl-3.6.0-py3-none-any.whl (18 kB)
# Using cached typing_extensions-4.15.0-py3-none-any.whl (44 kB)
# Using cached typing_inspection-0.4.2-py3-none-any.whl (14 kB)
# Using cached colorama-0.4.6-py2.py3-none-any.whl (25 kB)
# Using cached tzdata-2026.2-py2.py3-none-any.whl (349 kB)
# Installing collected packages: tzdata, typing-extensions, threadpoolctl, six, numpy, joblib, idna, h11, colorama, annotated-types, annotated-doc, typing-inspection, scipy, python-dateutil, pydantic-core, click, anyio, uvicorn, starlette, scikit-learn, pydantic, pandas, fastapi
#    ━━━━━━╸━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  4/23 [numpy]  WARNING: The scripts f2py.exe and numpy-config.exe are installed in 'C:\Users\nikhi\AppData\Roaming\Python\Python313\Scripts' which is not on PATH.
#   Consider adding this directory to PATH or, if you prefer to suppress this warning, use --no-warn-script-location.
#    ━━━━━━━━━━╺━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  6/23 [idna]  WARNING: The script idna.exe is installed in 'C:\Users\nikhi\AppData\Roaming\Python\Python313\Scripts' which is not on PATH.
#   Consider adding this directory to PATH or, if you prefer to suppress this warning, use --no-warn-script-location.
#    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╸━━━━━━━━━━ 17/23 [uvicorn]  WARNING: The script uvicorn.exe is installed in 'C:\Users\nikhi\AppData\Roaming\Python\Python313\Scripts' which is not on PATH.
#   Consider adding this directory to PATH or, if you prefer to suppress this warning, use --no-warn-script-location.
#    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╺━ 22/23 [fastapi]  WARNING: The script fastapi.exe is installed in 'C:\Users\nikhi\AppData\Roaming\Python\Python313\Scripts' which is not on PATH.
#   Consider adding this directory to PATH or, if you prefer to suppress this warning, use --no-warn-script-location.
# Successfully installed annotated-doc-0.0.4 annotated-types-0.7.0 anyio-4.13.0 click-8.4.1 colorama-0.4.6 fastapi-0.136.1 h11-0.16.0 idna-3.16 joblib-1.5.3 numpy-2.4.6 pandas-3.0.3 pydantic-2.13.4 pydantic-core-2.46.4 python-dateutil-2.9.0.post0 scikit-learn-1.8.0 scipy-1.17.1 six-1.17.0 starlette-1.0.1 threadpoolctl-3.6.0 typing-extensions-4.15.0 typing-inspection-0.4.2 tzdata-2026.2 uvicorn-0.47.0

# [notice] A new release of pip is available: 25.1.1 -> 26.1.1
# [notice] To update, run: python.exe -m pip install --upgrade pip
# PS C:\Users\nikhi\OneDrive\Desktop\smart recomendation system\backend> uvicorn main:app --reload
# uvicorn : The term 'uvicorn' is not recognized as the name of a cmdlet, function, script file, or operable program. Check the spelling 
# of the name, or if a path was included, verify that the path is correct and try again.
# At line:1 char:1
# + uvicorn main:app --reload
# + ~~~~~~~
#     + CategoryInfo          : ObjectNotFound: (uvicorn:String) [], CommandNotFoundException
#     + FullyQualifiedErrorId : CommandNotFoundException
 
# PS C:\Users\nikhi\OneDrive\Desktop\smart recomendation system\backend> .\venv\Scripts\activate
# (venv) PS C:\Users\nikhi\OneDrive\Desktop\smart recomendation system\backend> uvicorn main:app --reload
# INFO:     Will watch for changes in these directories: ['C:\\Users\\nikhi\\OneDrive\\Desktop\\smart recomendation system\\backend']
# INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
# INFO:     Started reloader process [33484] using StatReload
# INFO:     Started server process [21448]
# INFO:     Waiting for application startup.
# INFO:     Application startup complete.
# INFO:     127.0.0.1:54443 - "GET /api/products HTTP/1.1" 200 OK
# INFO:     127.0.0.1:54443 - "GET /api/products HTTP/1.1" 200 OK
# INFO:     127.0.0.1:60323 - "GET /api/products HTTP/1.1" 200 OK
# INFO:     127.0.0.1:60822 - "GET /api/products HTTP/1.1" 200 OK
# INFO:     127.0.0.1:54443 - "GET /api/recommendations/2 HTTP/1.1" 200 OK
# INFO:     127.0.0.1:60822 - "GET /api/recommendations/2 HTTP/1.1" 200 OK
# INFO:     127.0.0.1:60244 - "GET /api/products HTTP/1.1" 200 OK
# INFO:     127.0.0.1:60244 - "GET /api/products HTTP/1.1" 200 OK
