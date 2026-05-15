import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useParams } from 'react-router-dom';

export default function App() {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const addToCart = (product) => {
    setCart([...cart, product]);
    setIsCartOpen(true);
  };

  const removeFromCart = (index) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price, 0);

  return (
    <Router>
      <div className="min-h-screen bg-[#f1f3f6] font-sans text-[#212121]">
        
        {/* NAV BAR */}
        
        <nav className="bg-[#2874f0] p-3 sticky top-0 z-50 shadow-md">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Link to="/" className="text-white italic font-bold text-2xl">
              Smart<span className="text-[#ffe500]">Shop</span>
            </Link>
            
            {/* Removed the "AI-Powered" text here */}
            <div className="flex-1 text-center text-white text-sm font-medium hidden md:block">
              Smart Personal Shopping Assistant
            </div>

            <button 
              onClick={() => setIsCartOpen(true)}
              className="text-white font-bold flex items-center gap-2 hover:bg-[#2463cc] px-4 py-2 rounded-sm"
            >
              <span className="text-xl">🛒</span>
              <span className="hidden sm:inline text-sm">Cart ({cart.length})</span>
            </button>
          </div>
        </nav>

        {/* SIDEBAR CART */}
        {isCartOpen && (
          <div className="fixed inset-0 bg-black/60 z-[100] flex justify-end backdrop-blur-sm">
            <div className="bg-white w-full max-w-md h-full flex flex-col shadow-2xl">
              <div className="p-4 bg-[#2874f0] text-white flex justify-between items-center">
                <h2 className="font-bold uppercase">My Cart ({cart.length})</h2>
                <button onClick={() => setIsCartOpen(false)} className="text-2xl">✕</button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 bg-[#f1f3f6]">
                {cart.length === 0 ? <p className="text-center text-gray-500 mt-10">Empty Cart</p> : (
                  cart.map((item, index) => (
                    <div key={index} className="bg-white p-3 mb-2 flex gap-4 shadow-sm">
                      <img src={item.image_url} className="w-12 h-12 object-contain" />
                      <div className="flex-1">
                        <p className="text-xs font-bold line-clamp-1">{item.name}</p>
                        <p className="font-black">₹{item.price.toLocaleString()}</p>
                      </div>
                      <button onClick={() => removeFromCart(index)} className="text-red-500 text-[10px]">REMOVE</button>
                    </div>
                  ))
                )}
              </div>
              {cart.length > 0 && (
                <div className="p-4 bg-white border-t">
                  <div className="flex justify-between mb-4 font-bold">
                    <span>Total:</span>
                    <span>₹{cartTotal.toLocaleString()}</span>
                  </div>
                  <button className="w-full bg-[#fb641b] text-white py-3 font-bold uppercase">Checkout</button>
                </div>
              )}
            </div>
          </div>
        )}

        <Routes>
          <Route path="/" element={<Home addToCart={addToCart} />} />
          <Route path="/product/:id" element={<ProductDetail addToCart={addToCart} />} />
        </Routes>
      </div>
    </Router>
  );
}

// --- HOME PAGE (LOGIC FIXED) ---
const Home = ({ addToCart }) => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [visible, setVisible] = useState(20); // 20 at a time
  const [loading, setLoading] = useState(true);

  const categories = ["All", "Electronics", "Fashion", "Home", "Appliances"];

  useEffect(() => {
    fetch('http://localhost:8000/api/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      });
  }, []);

  // 1. FILTER ENTIRE DATASET FIRST
  const allFilteredResults = products.filter(p => {
    const nameMatch = p.name?.toLowerCase().includes(search.toLowerCase());
    const catMatch = selectedCategory === "All" || p.category === selectedCategory;
    return nameMatch && catMatch;
  });

  // 2. SLICE FOR PAGINATION
  const itemsToShow = allFilteredResults.slice(0, visible);

  if (loading) return <div className="p-20 text-center font-bold text-[#2874f0]">Loading Products...</div>;

  return (
    <div className="max-w-7xl mx-auto py-6 px-2">
      {/* SEARCH BAR */}
      <div className="mb-6 max-w-2xl mx-auto flex bg-white shadow-sm rounded-sm">
        <input 
          type="text" 
          placeholder="Search within this category..." 
          className="w-full py-3 px-5 outline-none text-sm"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setVisible(20); // Reset count on search
          }}
        />
        <div className="bg-[#2874f0] p-3 text-white">🔍</div>
      </div>

      {/* CATEGORY TABS */}
      <div className="bg-white p-1 mb-6 shadow-sm flex gap-1 overflow-x-auto justify-center border-b">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => {
              setSelectedCategory(cat);
              setVisible(20); // Reset count on category change
            }}
            className={`px-8 py-3 text-xs font-bold uppercase border-b-4 transition-all ${
              selectedCategory === cat ? "border-[#2874f0] text-[#2874f0]" : "border-transparent text-gray-400"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* GRID VIEW */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2">
        {itemsToShow.map(product => (
          <div key={product.id} className="bg-white p-3 hover:shadow-xl transition-all border border-[#f0f0f0] flex flex-col group">
            <Link to={`/product/${product.id}`} className="flex-1">
              <div className="h-36 flex items-center justify-center mb-2">
                <img 
                  src={product.image_url} 
                  className="max-h-full object-contain group-hover:scale-105 transition-transform" 
                  onError={(e) => e.target.src="https://via.placeholder.com/150"} 
                />
              </div>
              <h3 className="text-[11px] font-medium text-[#212121] line-clamp-2 h-8 mb-2 leading-tight">
                {product.name}
              </h3>
              <p className="font-bold text-sm">₹{product.price.toLocaleString()}</p>
            </Link>
            <button 
              onClick={() => addToCart(product)}
              className="mt-3 w-full bg-[#ff9f00] text-white py-2 text-[10px] font-black rounded-sm hover:bg-[#fb641b] uppercase"
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>

      {/* LOAD MORE BUTTON */}
      {visible < allFilteredResults.length ? (
        <div className="py-10 text-center">
          <p className="text-xs text-gray-400 mb-4">Showing {itemsToShow.length} of {allFilteredResults.length} products</p>
          <button 
            onClick={() => setVisible(prev => prev + 20)} 
            className="bg-white border border-gray-300 px-12 py-2 text-sm font-bold shadow-sm hover:bg-gray-50 uppercase tracking-widest"
          >
            Load More Products
          </button>
        </div>
      ) : (
        <div className="py-10 text-center text-gray-400 text-xs">
          End of results for "{selectedCategory}"
        </div>
      )}
    </div>
  );
};

// --- PRODUCT DETAIL PAGE ---
const ProductDetail = ({ addToCart }) => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [recs, setRecs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // Fetch all then find specific ID
    fetch('http://localhost:8000/api/products')
      .then(res => res.json())
      .then(data => {
        const found = data.find(p => p.id === parseInt(id));
        setProduct(found);
      });

    // Fetch AI Recs
    fetch(`http://localhost:8000/api/recommendations/${id}`)
      .then(res => res.json())
      .then(data => {
        setRecs(data);
        setLoading(false);
      });
    window.scrollTo(0, 0);
  }, [id]);

  if (loading || !product) return <div className="p-20 text-center font-bold text-[#2874f0]">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto mt-4 p-4 md:p-8 bg-white shadow-sm flex flex-col md:flex-row gap-10">
      <div className="w-full md:w-1/3">
        <div className="border p-10 h-80 flex items-center justify-center rounded-sm">
          <img src={product.image_url} className="max-h-full object-contain" />
        </div>
        <div className="flex gap-2 mt-4">
          <button onClick={() => addToCart(product)} className="flex-1 bg-[#ff9f00] text-white py-4 font-bold uppercase shadow-sm">Add to Cart</button>
          <button className="flex-1 bg-[#fb641b] text-white py-4 font-bold uppercase shadow-sm">Buy Now</button>
        </div>
      </div>
      <div className="flex-1">
        <h1 className="text-xl font-medium mb-4">{product.name}</h1>
        <div className="text-3xl font-black mb-8">₹{product.price.toLocaleString()}</div>
        
        <div className="mt-10 border-t pt-8">
          <h2 className="text-xs font-bold uppercase mb-6 text-gray-400">Recommended for You</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {recs.map(r => (
              <Link to={`/product/${r.id}`} key={r.id} className="group border border-transparent hover:border-gray-100 p-2 block">
                <div className="h-24 flex items-center justify-center mb-2">
                  <img src={r.image_url} className="max-h-full object-contain group-hover:scale-110 transition-transform" />
                </div>
                <p className="text-[10px] font-medium line-clamp-1 h-4">{r.name}</p>
                <p className="font-bold text-xs mt-1">₹{r.price.toLocaleString()}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};