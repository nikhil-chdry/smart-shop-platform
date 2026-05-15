import pandas as pd
import kagglehub
import os
import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

def load_and_analyze_data():
    path = kagglehub.dataset_download("lokeshparab/amazon-products-dataset")
    csv_file = os.path.join(path, "Amazon-Products.csv")
    
    # 1. Load a larger sample to ensure category variety (TVs, Shoes, etc.)
    df = pd.read_csv(csv_file, nrows=10000)
    
    # 2. Drop rows missing critical display data
    df = df.dropna(subset=['name', 'image', 'actual_price'])
    
    # 3. TRUE RANDOM SHUFFLE
    # Removing random_state makes the shuffle different on every restart
    df = df.sample(frac=1).reset_index(drop=True)
    
    # 4. Take the final 1000 for the app
    df = df.head(1000)
    
    def clean_price(p):
        val = re.sub(r'[^\d.]', '', str(p))
        return float(val) if val else 0.0

    final_df = pd.DataFrame({
        'id': range(1, len(df) + 1),
        'name': df['name'],
        'category': df['main_category'],
        'price': df['actual_price'].apply(clean_price),
        'image_url': df['image'],
        'combined_features': (df['name'] + " " + df['main_category']).str.lower()
    })
    return final_df

# --- INITIALIZATION ---
try:
    DF_MASTER = load_and_analyze_data()
    
    # Define BOTH names to satisfy main.py import and internal logic
    PRODUCTS = DF_MASTER.to_dict('records')
    PRODUCTS_LIST = PRODUCTS 
    
except Exception as e:
    print(f"❌ Failed to initialize: {e}")
    PRODUCTS = []
    PRODUCTS_LIST = []
    DF_MASTER = pd.DataFrame()

def get_recommendations(product_id):
    """
    Step 2: Advanced Vectorization (Integrated from Notebook)
    """
    if not PRODUCTS or DF_MASTER.empty: 
        return []

    vectorizer = TfidfVectorizer(
        stop_words='english',
        ngram_range=(1, 2), 
        max_features=5000
    )
    
    tfidf_matrix = vectorizer.fit_transform(DF_MASTER['combined_features'])
    cosine_sim = cosine_similarity(tfidf_matrix, tfidf_matrix)
    
    try:
        idx = DF_MASTER[DF_MASTER['id'] == product_id].index[0]
        sim_scores = list(enumerate(cosine_sim[idx]))
        sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)[1:5]
        
        return [PRODUCTS[i[0]] for i in sim_scores]
    except Exception as e:
        print(f"Recommendation Error: {e}")
        return []