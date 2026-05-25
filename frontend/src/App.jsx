import { AdminLogin, AdminDashboard } from './Admin';
import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';

// ── Star Rating Component ──
const StarRating = ({ rating }) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (i <= Math.floor(rating)) {
      stars.push(<span key={i} className="text-[#FFB800]">★</span>);
    } else if (i - 0.5 <= rating) {
      stars.push(<span key={i} className="text-[#FFB800]">★</span>);
    } else {
      stars.push(<span key={i} className="text-gray-300">★</span>);
    }
  }
  return (
    <div className="flex items-center gap-1">
      <span className="text-xs leading-none">{stars}</span>
      <span className="text-[10px] text-gray-400 font-bold">{rating?.toFixed(1)}</span>
    </div>
  );
};

// ── Product Card Component ──
const ProductCard = ({ product, addToCart, onView }) => (
  <div className="group flex flex-col bg-white">
    <Link
      to={`/product/${product.id}`}
      className="flex-1 no-underline text-[#111]"
      onClick={() => onView && onView(product)}
    >
      <div className="bg-[#f5f5f5] h-44 flex items-center justify-center overflow-hidden relative">
        <img
          src={product.image_url}
          className="max-h-full object-contain group-hover:scale-105 transition-transform duration-300 p-2"
          onError={e => e.target.src = 'https://via.placeholder.com/150'}
        />
        {product.rating >= 4.5 && (
          <span className="absolute top-2 left-2 bg-[#111] text-white text-[9px] font-black px-2 py-1 uppercase tracking-wider">
            Top Rated
          </span>
        )}
      </div>
      <div className="p-3">
        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">{product.category}</p>
        <h3 className="text-xs font-bold text-[#111] line-clamp-2 h-8 leading-tight mb-1">{product.name}</h3>
        <StarRating rating={product.rating} />
        <p className="font-black text-sm mt-1">₹{product.price.toLocaleString()}</p>
      </div>
    </Link>
    <div className="px-3 pb-3">
      <button
        onClick={() => addToCart(product)}
        className="w-full bg-[#111] text-white py-2.5 text-[10px] font-black uppercase tracking-widest hover:bg-[#333] transition-colors"
      >
        Add to Cart
      </button>
    </div>
  </div>
);

export default function App() {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  const addToCart = (product) => {
    setCart(prev => [...prev, product]);
    setIsCartOpen(true);
  };

  const removeFromCart = (index) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const addToRecentlyViewed = useCallback((product) => {
    setRecentlyViewed(prev => {
      const filtered = prev.filter(p => p.id !== product.id);
      return [product, ...filtered].slice(0, 8);
    });
  }, []);

  const cartTotal = cart.reduce((sum, item) => sum + item.price, 0);

  return (
    <Router>
      <div className="min-h-screen bg-white font-sans text-[#111111]">

        {/* ── ANNOUNCEMENT BAR ── */}
        <div className="bg-[#111111] text-white text-center py-2 text-[11px] tracking-[0.2em] uppercase font-medium">
          Free Shipping on Orders Over ₹1999 &nbsp;·&nbsp; 20% Off on Your First Order with Code: WELCOME20
        </div>

        {/* ── NAVBAR ── */}
        <NavBar cart={cart} setIsCartOpen={setIsCartOpen} />

        {/* ── CART SIDEBAR ── */}
        {isCartOpen && (
          <div className="fixed inset-0 bg-black/50 z-[100] flex justify-end">
            <div className="bg-white w-full max-w-sm h-full flex flex-col shadow-2xl">
              <div className="p-5 bg-[#111111] text-white flex justify-between items-center">
                <h2 className="font-black text-sm uppercase tracking-widest">Your Cart ({cart.length})</h2>
                <button onClick={() => setIsCartOpen(false)} className="text-xl font-light hover:opacity-70">✕</button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                {cart.length === 0 ? (
                  <div className="text-center mt-20">
                    <p className="text-gray-400 text-sm uppercase tracking-wider font-bold">Your cart is empty</p>
                    <button onClick={() => setIsCartOpen(false)} className="mt-6 text-[11px] font-black uppercase tracking-widest underline">
                      Continue Shopping
                    </button>
                  </div>
                ) : (
                  cart.map((item, index) => (
                    <div key={index} className="flex gap-4 py-4 border-b border-[#f0f0f0]">
                      <div className="w-16 h-16 bg-[#f5f5f5] flex items-center justify-center flex-shrink-0">
                        <img src={item.image_url} className="max-h-full object-contain p-1" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-bold line-clamp-2 leading-tight mb-1">{item.name}</p>
                        <StarRating rating={item.rating} />
                        <p className="font-black text-sm mt-1">₹{item.price.toLocaleString()}</p>
                      </div>
                      <button onClick={() => removeFromCart(index)} className="text-[10px] font-black uppercase text-gray-400 hover:text-[#e5181b] transition-colors self-start">
                        Remove
                      </button>
                    </div>
                  ))
                )}
              </div>
              {cart.length > 0 && (
                <div className="p-5 border-t border-[#e5e5e5]">
                  <div className="flex justify-between mb-5">
                    <span className="text-xs font-bold uppercase tracking-wider">Total</span>
                    <span className="font-black text-lg">₹{cartTotal.toLocaleString()}</span>
                  </div>
                  <button className="w-full bg-[#111111] text-white py-4 text-[11px] font-black uppercase tracking-widest hover:bg-[#333] transition-colors">
                    Checkout
                  </button>
                  <button onClick={() => setIsCartOpen(false)} className="w-full mt-2 py-3 text-[11px] font-black uppercase tracking-widest border border-[#111] hover:bg-[#f5f5f5] transition-colors">
                    Continue Shopping
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        <Routes>
          <Route path="/" element={<Home addToCart={addToCart} recentlyViewed={recentlyViewed} onView={addToRecentlyViewed} />} />
          <Route path="/category/:cat" element={<Home addToCart={addToCart} recentlyViewed={recentlyViewed} onView={addToRecentlyViewed} />} />
          <Route path="/product/:id" element={<ProductDetail addToCart={addToCart} onView={addToRecentlyViewed} />} />

          {/* Admin Routes */}
           <Route path="/admin/login"     element={<AdminLogin />} />
           <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Routes>
         
        {/* ── CHATBOT ── */}
        <ChatBot addToCart={addToCart} />

        {/* ── FOOTER ── */}
        <footer className="bg-[#111111] text-white mt-20">
          <div className="max-w-7xl mx-auto px-6 py-14">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
              {[
                { title: 'Products', links: ['New Arrivals', 'Best Sellers', 'Electronics', 'Fashion'] },
                { title: 'Help', links: ['Order Status', 'Shipping', 'Returns', 'Contact Us'] },
                { title: 'Company', links: ['About', 'Careers', 'Press', 'Sustainability'] },
                { title: 'Follow Us', links: ['Instagram', 'Twitter', 'Facebook', 'YouTube'] },
              ].map(col => (
                <div key={col.title}>
                  <h4 className="text-[10px] font-black uppercase tracking-widest mb-4">{col.title}</h4>
                  {col.links.map(link => (
                    <p key={link} className="text-gray-400 text-xs mb-2 hover:text-white cursor-pointer transition-colors">{link}</p>
                  ))}
                </div>
              ))}
            </div>
            <div className="border-t border-[#2a2a2a] pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
              <span className="font-black text-lg tracking-tighter">LIVE<span className="text-[#e5181b]">BAZAR</span></span>
              <p className="text-gray-500 text-[11px]">© 2025 LiveBazar. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

// ─────────────────────────────────────────
//  NAVBAR
// ─────────────────────────────────────────
const NavBar = ({ cart, setIsCartOpen }) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const isAdmin = !!localStorage.getItem('admin');

  const navLinks = [
    { label: 'New',         category: 'new' },
    { label: 'Men',         category: 'Fashion' },
    { label: 'Women',       category: 'Fashion' },
    { label: 'Electronics', category: 'Electronics' },
    { label: 'Sale',        category: 'sale', red: true },
  ];

  const handleNav = (category) => {
    navigate(`/category/${category}`);
    setMenuOpen(false);
  };

  const handleLogout = (e) => {
    e.stopPropagation();
    localStorage.removeItem('admin');
    navigate('/');
    window.location.reload();
  };

  return (
    <nav className="bg-white border-b border-[#e5e5e5] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="text-[#111111] font-black text-xl tracking-tighter no-underline">
          LIVE<span className="text-[#e5181b]">BAZAR</span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map(link => (
            <button key={link.label} onClick={() => handleNav(link.category)}
              className={`text-[12px] font-bold uppercase tracking-wider hover:text-[#e5181b] transition-colors bg-transparent border-none cursor-pointer ${link.red ? 'text-[#e5181b]' : 'text-[#111111]'}`}>
              {link.label}
            </button>
          ))}
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-2">

          {/* Admin - desktop only */}
          {isAdmin ? (
            <div className="hidden md:flex items-center gap-2">
              <button onClick={() => navigate('/admin/dashboard')}
                className="text-[11px] font-black uppercase tracking-widest border border-[#111] px-4 py-2 hover:bg-[#111] hover:text-white transition-colors">
                Dashboard
              </button>
              <button onClick={handleLogout}
                className="text-[11px] font-black uppercase tracking-widest text-gray-400 hover:text-[#e5181b] transition-colors px-2">
                Logout
              </button>
            </div>
          ) : (
            <button onClick={() => navigate('/admin/login')}
              className="hidden md:block text-[11px] font-black uppercase tracking-widest border border-[#e5e5e5] px-4 py-2 hover:border-[#111] transition-colors text-gray-400 hover:text-[#111]">
              Admin
            </button>
          )}

          {/* Cart */}
          <button onClick={() => setIsCartOpen(true)}
            className="flex items-center gap-2 bg-[#111111] text-white px-4 md:px-5 py-2 text-[11px] font-black uppercase tracking-widest hover:bg-[#333] transition-colors">
            <span>🛒</span>
            <span className="hidden sm:inline">Cart</span>
            {cart.length > 0 && (
              <span className="bg-[#e5181b] text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">
                {cart.length}
              </span>
            )}
          </button>

          {/* Hamburger - mobile only */}
          <button onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden flex flex-col gap-1.5 p-2">
            <span className={`block w-5 h-0.5 bg-[#111] transition-all ${menuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
            <span className={`block w-5 h-0.5 bg-[#111] transition-all ${menuOpen ? 'opacity-0' : ''}`}></span>
            <span className={`block w-5 h-0.5 bg-[#111] transition-all ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-[#e5e5e5] px-4 py-4 flex flex-col gap-1">
          {navLinks.map(link => (
            <button key={link.label} onClick={() => handleNav(link.category)}
              className={`text-left px-4 py-3 text-[12px] font-black uppercase tracking-widest border-b border-[#f5f5f5] hover:bg-[#f5f5f5] transition-colors ${link.red ? 'text-[#e5181b]' : 'text-[#111]'}`}>
              {link.label}
            </button>
          ))}
          <button onClick={() => { navigate(isAdmin ? '/admin/dashboard' : '/admin/login'); setMenuOpen(false); }}
            className="text-left px-4 py-3 text-[12px] font-black uppercase tracking-widest text-gray-400 hover:bg-[#f5f5f5]">
            {isAdmin ? '⚙️ Dashboard' : '🔐 Admin Login'}
          </button>
          {isAdmin && (
            <button onClick={handleLogout}
              className="text-left px-4 py-3 text-[12px] font-black uppercase tracking-widest text-[#e5181b] hover:bg-[#f5f5f5]">
              Logout
            </button>
          )}
        </div>
      )}
    </nav>
  );
};

// ─────────────────────────────────────────
//  HOME PAGE
// ─────────────────────────────────────────
const Home = ({ addToCart, recentlyViewed, onView }) => {
  const { cat } = useParams();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [sortBy, setSortBy] = useState('default');
  const [visible, setVisible] = useState(20);
  const [loading, setLoading] = useState(true);

  const categories = ['All', 'Electronics', 'Fashion', 'Home', 'Appliances'];

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/products`)
      .then(res => res.json())
      .then(data => { setProducts(data); setLoading(false); });
  }, []);

  // Sync category from URL param
  useEffect(() => {
    if (cat && categories.includes(cat)) {
      setSelectedCategory(cat);
    } else {
      setSelectedCategory('All');
    }
    setVisible(20);
  }, [cat]);

  // Trending = top rated products
const daySeed = new Date().getDate() + new Date().getMonth() * 31;

const trending = [...products]
  .sort((a, b) => b.rating - a.rating)   
  .slice(0, 40)                           
  .sort((a, b) => (a.id * daySeed % 17) - (b.id * daySeed % 17)) 
  .slice(0, 8);                           

  // Filter
  let filtered = products.filter(p => {
    const nameMatch = p.name?.toLowerCase().includes(search.toLowerCase());
    const catMatch = selectedCategory === 'All' || p.category === selectedCategory;
    const priceMatch = p.price >= priceRange[0] && p.price <= priceRange[1];
    return nameMatch && catMatch && priceMatch;
  });

  // Sort
  if (sortBy === 'price_asc')  filtered = [...filtered].sort((a, b) => a.price - b.price);
  if (sortBy === 'price_desc') filtered = [...filtered].sort((a, b) => b.price - a.price);
  if (sortBy === 'rating')     filtered = [...filtered].sort((a, b) => b.rating - a.rating);

  const itemsToShow = filtered.slice(0, visible);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-[#111] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-xs font-black uppercase tracking-widest">Loading Products</p>
      </div>
    </div>
  );

  return (
    <div>
      {/* ── HERO ── */}
      {/* {!cat && selectedCategory === 'All' && ( */}
        <div className="bg-[#111111] text-white px-6 py-24 md:py-32">
          <div className="max-w-7xl mx-auto">
            <p className="text-[11px] uppercase tracking-[0.4em] text-gray-500 mb-5">New Collection · 2025</p>
            <h1 className="text-5xl md:text-8xl font-black uppercase leading-none tracking-tighter mb-6">
              DISCOVER<br />WHAT'S<br />YOURS
            </h1>
            <p className="text-gray-400 max-w-sm text-sm leading-relaxed mb-10">
               Find your Desired product in seconds.
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => document.getElementById('catalog').scrollIntoView({ behavior: 'smooth' })}
                className="bg-white text-[#111] px-8 py-4 text-[11px] font-black uppercase tracking-widest hover:bg-gray-100 transition-colors"
              >
                Shop Now
              </button>
              <button
                onClick={() => document.getElementById('trending').scrollIntoView({ behavior: 'smooth' })}
                className="border border-white text-white px-8 py-4 text-[11px] font-black uppercase tracking-widest hover:bg-white hover:text-[#111] transition-colors"
              >
                View Trending
              </button>
            </div>
          </div>
        </div>
      {/* )} */}

      {/* ── TRENDING SECTION ── */}
      { trending.length > 0 && (
        <div id="trending" className="max-w-7xl mx-auto px-4 py-14">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-1">Most Popular</p>
              <h2 className="text-2xl font-black uppercase tracking-tight">🔥 Trending Now</h2>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
            {trending.map(product => (
              <div key={product.id} className="group flex flex-col bg-white border border-[#f0f0f0]">
                <Link to={`/product/${product.id}`} onClick={() => onView(product)} className="no-underline text-[#111]">
                  <div className="bg-[#f5f5f5] h-28 flex items-center justify-center overflow-hidden">
                    <img src={product.image_url} className="max-h-full object-contain group-hover:scale-105 transition-transform duration-300 p-1"
                      onError={e => e.target.src = 'https://via.placeholder.com/150'} />
                  </div>
                  <div className="p-2">
                    <p className="text-[9px] font-bold line-clamp-1 text-[#111]">{product.name}</p>
                    <StarRating rating={product.rating} />
                    <p className="font-black text-xs mt-1">₹{product.price.toLocaleString()}</p>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── RECENTLY VIEWED ── */}
      {recentlyViewed.length > 0 && (
        <div className="bg-[#f9f9f9] py-12">
          <div className="max-w-7xl mx-auto px-4">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-1">Your History</p>
            <h2 className="text-2xl font-black uppercase tracking-tight mb-8">🕐 Recently Viewed</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
              {recentlyViewed.map(product => (
                <div key={product.id} className="group flex flex-col bg-white border border-[#f0f0f0]">
                  <Link to={`/product/${product.id}`} onClick={() => onView(product)} className="no-underline text-[#111]">
                    <div className="bg-[#f5f5f5] h-28 flex items-center justify-center overflow-hidden">
                      <img src={product.image_url} className="max-h-full object-contain group-hover:scale-105 transition-transform duration-300 p-1"
                        onError={e => e.target.src = 'https://via.placeholder.com/150'} />
                    </div>
                    <div className="p-2">
                      <p className="text-[9px] font-bold line-clamp-1">{product.name}</p>
                      <StarRating rating={product.rating} />
                      <p className="font-black text-xs mt-1">₹{product.price.toLocaleString()}</p>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── CATALOG ── */}
      <div id="catalog" className="max-w-7xl mx-auto py-12 px-4">

        {/* Page Title for category pages */}
        {cat && (
          <h2 className="text-3xl font-black uppercase tracking-tight mb-8">
            {cat === 'new' ? '✨ New Arrivals' : cat === 'sale' ? '🏷️ Sale' : cat}
          </h2>
        )}

        {/* Search + Sort Row */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="flex flex-1 border-2 border-[#111]">
            <input
              type="text"
              placeholder="Search products..."
              className="flex-1 py-3 px-5 outline-none text-sm"
              value={search}
              onChange={e => { setSearch(e.target.value); setVisible(20); }}
            />
            <button className="bg-[#111] px-6 text-white text-xs font-black uppercase tracking-widest hover:bg-[#333] transition-colors">
              Search
            </button>
          </div>

          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="border-2 border-[#111] px-4 py-3 text-[11px] font-black uppercase tracking-wider bg-white cursor-pointer outline-none"
          >
            <option value="default">Sort: Default</option>
            <option value="price_asc">Price: Low → High</option>
            <option value="price_desc">Price: High → Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>

        {/* Price Range Filter */}
        <div className="bg-[#f5f5f5] p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <span className="text-[11px] font-black uppercase tracking-widest whitespace-nowrap">Price Range</span>
          <div className="flex items-center gap-3 flex-1">
            <span className="text-xs font-bold">₹{priceRange[0].toLocaleString()}</span>
            <input
              type="range" min="0" max="100000" step="500"
              value={priceRange[1]}
              onChange={e => { setPriceRange([priceRange[0], parseInt(e.target.value)]); setVisible(20); }}
              className="flex-1 accent-[#111]"
            />
            <span className="text-xs font-bold">₹{priceRange[1].toLocaleString()}</span>
          </div>
          <button
            onClick={() => setPriceRange([0, 100000])}
            className="text-[10px] font-black uppercase tracking-wider underline text-gray-500 hover:text-[#111]"
          >
            Reset
          </button>
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto mb-6 pb-1">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => { setSelectedCategory(cat); setVisible(20); }}
              className={`px-6 py-2 text-[11px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-[#111] text-white'
                  : 'bg-white text-[#111] border border-[#e5e5e5] hover:border-[#111]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results Count */}
        <p className="text-xs text-gray-400 mb-6 uppercase tracking-wider font-bold">
          {filtered.length} Products
        </p>

        {/* Product Grid */}
        {itemsToShow.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-2xl mb-2">🔍</p>
            <p className="font-black uppercase tracking-wider text-gray-400">No products found</p>
            <button onClick={() => { setSearch(''); setPriceRange([0, 100000]); setSelectedCategory('All'); }}
              className="mt-4 text-[11px] font-black uppercase tracking-widest underline">
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {itemsToShow.map(product => (
              <ProductCard key={product.id} product={product} addToCart={addToCart} onView={onView} />
            ))}
          </div>
        )}

        {/* Load More */}
        {visible < filtered.length ? (
          <div className="py-16 text-center">
            <p className="text-[11px] text-gray-400 mb-4 uppercase tracking-wider">
              Showing {itemsToShow.length} of {filtered.length} products
            </p>
            <button
              onClick={() => setVisible(prev => prev + 20)}
              className="border-2 border-[#111] px-16 py-3 text-[11px] font-black uppercase tracking-widest hover:bg-[#111] hover:text-white transition-colors"
            >
              Load More
            </button>
          </div>
        ) : (
          <p className="py-16 text-center text-[11px] text-gray-400 uppercase tracking-wider">
            All {filtered.length} products shown
          </p>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────
//  PRODUCT DETAIL PAGE
// ─────────────────────────────────────────
const ProductDetail = ({ addToCart, onView }) => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [recs, setRecs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    setLoading(true);
    setAdded(false);

    fetch(`${import.meta.env.VITE_API_URL}/api/products/${id}`)
      .then(res => res.json())
      .then(data => { setProduct(data); onView && onView(data); });

    fetch(`${import.meta.env.VITE_API_URL}/api/recommendations/${id}`)
      .then(res => res.json())
      .then(data => { setRecs(data); setLoading(false); });

    window.scrollTo(0, 0);
  }, [id]);

  const handleAddToCart = (p) => {
    addToCart(p);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading || !product) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-[#111] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-xs font-black uppercase tracking-widest">Loading</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-8 text-[11px] text-gray-400 uppercase tracking-wider font-bold">
        <Link to="/" className="hover:text-[#111] transition-colors no-underline text-gray-400">Home</Link>
        <span>/</span>
        <Link to={`/category/${product.category}`} className="hover:text-[#111] transition-colors no-underline text-gray-400">
          {product.category}
        </Link>
        <span>/</span>
        <span className="text-[#111] line-clamp-1">{product.name.slice(0, 30)}...</span>
      </div>

      <div className="flex flex-col md:flex-row gap-12">
        {/* Image */}
        <div className="w-full md:w-1/2">
          <div className="bg-[#f5f5f5] aspect-square flex items-center justify-center p-12">
            <img src={product.image_url} className="max-h-full object-contain" />
          </div>
        </div>

        {/* Info */}
        <div className="w-full md:w-1/2 flex flex-col justify-center">
          <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-3">{product.category}</p>
          <h1 className="text-2xl md:text-3xl font-black leading-tight mb-3">{product.name}</h1>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-6">
            <StarRating rating={product.rating} />
            <span className="text-xs text-gray-400 font-bold">({product.rating} / 5.0)</span>
          </div>

          <div className="text-4xl font-black mb-10">₹{product.price.toLocaleString()}</div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => handleAddToCart(product)}
              className={`py-4 text-[11px] font-black uppercase tracking-widest transition-all ${
                added ? 'bg-green-600 text-white' : 'bg-[#111111] text-white hover:bg-[#333]'
              }`}
            >
              {added ? '✓ Added to Cart' : 'Add to Cart'}
            </button>
            <button className="py-4 text-[11px] font-black uppercase tracking-widest border-2 border-[#111] hover:bg-[#111] hover:text-white transition-colors">
              Buy Now
            </button>
          </div>

          {/* ML Badge */}
          <div className="mt-8 p-4 bg-[#f5f5f5] border-l-4 border-[#111]">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Warning!</p>
            <p className="text-xs font-bold">Product may be look different from the image</p>
          </div>
        </div>
      </div>

      {/* AI Recommendations */}
      {recs.length > 0 && (
        <div className="mt-20 border-t border-[#e5e5e5] pt-12">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-2">Recommended for you</p>
          <h2 className="text-xl font-black uppercase tracking-tight mb-8">You Might Also Like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {recs.slice(0, 4).map(r => (
              <ProductCard key={r.id} product={r} addToCart={addToCart} onView={onView} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────
//  CHATBOT COMPONENT (Tap to Ask)
// ─────────────────────────────────────────
const ChatBot = ({ addToCart }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      from: 'bot',
      text: "Hi! 👋 Tap a question below to get started:",
      products: []
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [allProducts, setAllProducts] = useState([]);
  const [askedQuestions, setAskedQuestions] = useState([]);
  const messagesEndRef = React.useRef(null);
  const navigate = useNavigate();

  const QUESTIONS = [
    { id: 1, label: "🔥 What's trending?",         intent: 'trending' },
    { id: 2, label: "⭐ Top rated products",        intent: 'top_rated' },
    { id: 3, label: "💰 Budget picks under ₹1,000", intent: 'budget' },
    { id: 4, label: "📱 Best Electronics",          intent: 'electronics' },
    { id: 5, label: "👗 Fashion recommendations",   intent: 'fashion' },
    { id: 6, label: "🏠 Home & Furniture picks",    intent: 'home' },
    { id: 7, label: "🔌 Top Appliances",            intent: 'appliances' },
    { id: 8, label: "👑 Premium products",          intent: 'premium' },
  ];

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/products`)
      .then(res => res.json())
      .then(data => setAllProducts(data));
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getResponse = (intent) => {
    let filtered = [...allProducts];
    let text = '';

    switch (intent) {
      case 'trending':
        filtered = filtered.sort((a, b) => b.rating - a.rating);
        text = "Here are the most popular products right now 🔥";
        break;
      case 'top_rated':
        filtered = filtered.sort((a, b) => b.rating - a.rating);
        text = "Here are our highest rated products ⭐";
        break;
      case 'budget':
        filtered = filtered.filter(p => p.price <= 1000).sort((a, b) => a.price - b.price);
        text = filtered.length > 0
          ? "Great budget picks under ₹1,000 💰"
          : "No products found under ₹1,000. Try checking Electronics or Fashion!";
        break;
      case 'electronics':
        filtered = filtered.filter(p => p.category === 'Electronics').sort((a, b) => b.rating - a.rating);
        text = "Top Electronics picks for you 📱";
        break;
      case 'fashion':
        filtered = filtered.filter(p => p.category === 'Fashion').sort((a, b) => b.rating - a.rating);
        text = "Trending Fashion recommendations 👗";
        break;
      case 'home':
        filtered = filtered.filter(p => p.category === 'Home').sort((a, b) => b.rating - a.rating);
        text = "Best Home & Furniture picks 🏠";
        break;
      case 'appliances':
        filtered = filtered.filter(p => p.category === 'Appliances').sort((a, b) => b.rating - a.rating);
        text = "Top Appliances for your home 🔌";
        break;
      case 'premium':
        filtered = filtered.sort((a, b) => b.price - a.price);
        text = "Our premium collection 👑";
        break;
      default:
        text = "Here are some products for you!";
    }

    return { text, products: filtered.slice(0, 4) };
  };

  const handleQuestion = (question) => {
    // Add user bubble
    setMessages(prev => [...prev, { from: 'user', text: question.label, products: [] }]);
    setAskedQuestions(prev => [...prev, question.id]);
    setIsTyping(true);

    setTimeout(() => {
      const response = getResponse(question.intent);
      setMessages(prev => [...prev, { from: 'bot', ...response }]);
      setIsTyping(false);
    }, 800);
  };

  const remainingQuestions = QUESTIONS.filter(q => !askedQuestions.includes(q.id));

  return (
    <>
      {/* ── CHAT BUTTON ── */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-[200] w-14 h-14 bg-[#111] text-white rounded-full shadow-2xl flex items-center justify-center text-2xl hover:bg-[#333] transition-all hover:scale-110"
      >
        {isOpen ? '✕' : '💬'}
      </button>

      {/* ── CHAT WINDOW ── */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-6 z-[200] w-80 md:w-96 bg-white shadow-2xl flex flex-col border-2 border-[#111]"
          style={{ height: '560px' }}
        >
          {/* Header */}
          <div className="bg-[#111] text-white p-4 flex items-center gap-3 flex-shrink-0">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-[#111] font-black text-xs">L</div>
            <div>
              <p className="font-black text-sm uppercase tracking-widest">LiveBazar Assistant</p>
              <p className="text-[10px] text-gray-400">Tap a question to get started</p>
            </div>
            <div className="ml-auto w-2 h-2 bg-green-400 rounded-full"></div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#f9f9f9]">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 text-xs font-medium leading-relaxed ${
                  msg.from === 'user'
                    ? 'bg-[#111] text-white'
                    : 'bg-white border border-[#e5e5e5] text-[#111]'
                }`}>
                  <p className="whitespace-pre-line">{msg.text}</p>

                  {/* Product Cards inside chat */}
                  {msg.products && msg.products.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {msg.products.map(p => (
                        <div key={p.id} className="bg-[#f5f5f5] p-2 flex gap-2 items-center border border-[#e5e5e5]">
                          <img
                            src={p.image_url}
                            className="w-10 h-10 object-contain bg-white p-1 flex-shrink-0"
                            onError={e => e.target.src = 'https://via.placeholder.com/40'}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-bold line-clamp-1 text-[10px]">{p.name}</p>
                            <StarRating rating={p.rating} />
                            <p className="font-black text-[11px]">₹{p.price.toLocaleString()}</p>
                          </div>
                          <div className="flex flex-col gap-1">
                            <button
                              onClick={() => { navigate(`/product/${p.id}`); setIsOpen(false); }}
                              className="text-[9px] font-black uppercase bg-[#111] text-white px-2 py-1 hover:bg-[#333]"
                            >
                              View
                            </button>
                            <button
                              onClick={() => addToCart(p)}
                              className="text-[9px] font-black uppercase bg-white border border-[#111] px-2 py-1 hover:bg-[#f0f0f0]"
                            >
                              Cart
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-[#e5e5e5] p-3 flex gap-1 items-center">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* ── TAP QUESTIONS (remaining only) ── */}
          <div className="flex-shrink-0 border-t-2 border-[#111] bg-white p-3">
            {remainingQuestions.length > 0 ? (
              <>
                <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-2">
                  Tap to ask:
                </p>
                <div className="flex flex-col gap-1 max-h-36 overflow-y-auto">
                  {remainingQuestions.map(q => (
                    <button
                      key={q.id}
                      onClick={() => handleQuestion(q)}
                      className="text-left text-[11px] font-bold px-3 py-2 border border-[#e5e5e5] hover:bg-[#111] hover:text-white hover:border-[#111] transition-all"
                    >
                      {q.label}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-2">
                <p className="text-[11px] text-gray-400 font-bold mb-2">You've asked everything! 🎉</p>
                <button
                  onClick={() => { setAskedQuestions([]); setMessages([{ from: 'bot', text: "Hi again! 👋 Tap a question below:", products: [] }]); }}
                  className="text-[10px] font-black uppercase tracking-widest bg-[#111] text-white px-4 py-2 hover:bg-[#333]"
                >
                  Start Over
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};