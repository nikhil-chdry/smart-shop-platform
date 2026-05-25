import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// ── Auth helpers ──
const login = (user) => localStorage.setItem('admin', JSON.stringify(user));
const logout = () => localStorage.removeItem('admin');
const getAdmin = () => JSON.parse(localStorage.getItem('admin') || 'null');

// ── Hardcoded credentials ──
const CREDENTIALS = { username: 'nikhillivebazar', password: '#sarpanch29#' };

// ─────────────────────────────────────────
//  LOGIN PAGE
// ─────────────────────────────────────────
export const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (getAdmin()) navigate('/admin/dashboard');
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    setTimeout(() => {
      if (username.trim() === CREDENTIALS.username && password.trim() === CREDENTIALS.password) {
        login({ username });
        navigate('/admin/dashboard');
      } else {
        setError('Invalid username or password');
      }
      setLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#111] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-10">
          <h1 className="text-white font-black text-2xl tracking-tighter">
            LIVE<span className="text-[#e5181b]">BAZAR</span>
          </h1>
          <p className="text-gray-500 text-[11px] uppercase tracking-widest mt-2">Admin Panel</p>
        </div>

        {/* Card */}
        <div className="bg-white p-8">
          <h2 className="font-black text-xl uppercase tracking-tight mb-1">Sign In</h2>
          <p className="text-gray-400 text-xs mb-8 uppercase tracking-wider">Enter your credentials</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1">Username</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="admin"
                className="w-full border-2 border-[#e5e5e5] focus:border-[#111] px-4 py-3 text-sm outline-none transition-colors"
                required
              />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full border-2 border-[#e5e5e5] focus:border-[#111] px-4 py-3 text-sm outline-none transition-colors"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 p-3">
                <p className="text-red-600 text-xs font-bold">⚠️ {error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#111] text-white py-4 text-[11px] font-black uppercase tracking-widest hover:bg-[#333] transition-colors disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>
          </form>

          {/* <div className="mt-6 p-3 bg-[#f5f5f5] border-l-4 border-[#111]">
            <p className="text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">Demo Credentials</p>
            <p className="text-xs font-bold">Username: <span className="text-[#111]">admin</span></p>
            <p className="text-xs font-bold">Password: <span className="text-[#111]">admin123</span></p>
          </div> */}
        </div>

        <p className="text-center text-gray-600 text-[11px] mt-6">
          <a href="/" className="hover:text-white transition-colors uppercase tracking-wider font-bold">
            ← Back to Store
          </a>
        </p>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────
//  DASHBOARD
// ─────────────────────────────────────────
export const AdminDashboard = () => {
  const [products, setProducts]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState('');
  const [filterCat, setFilterCat]       = useState('All');
  const [sortCol, setSortCol]           = useState('id');
  const [sortDir, setSortDir]           = useState('asc');
  const [currentPage, setCurrentPage]   = useState(1);
  const [activeTab, setActiveTab]       = useState('products');
  const ROWS_PER_PAGE = 15;
  const navigate = useNavigate();
  const admin = getAdmin();

  useEffect(() => {
    if (!admin) { navigate('/admin/login'); return; }
    fetch(`${import.meta.env.VITE_API_URL}/api/products`)
      .then(res => res.json())
      .then(data => { setProducts(data); setLoading(false); });
  }, []);

  const handleLogout = () => { logout(); navigate('/admin/login'); };

  const handleSort = (col) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('asc'); }
  };

  const categories = ['All', 'Electronics', 'Fashion', 'Home', 'Appliances'];

  // ── Stats ──
  const stats = {
    total:       products.length,
    electronics: products.filter(p => p.category === 'Electronics').length,
    fashion:     products.filter(p => p.category === 'Fashion').length,
    home:        products.filter(p => p.category === 'Home').length,
    appliances:  products.filter(p => p.category === 'Appliances').length,
    avgPrice:    products.length ? Math.round(products.reduce((s, p) => s + p.price, 0) / products.length) : 0,
    avgRating:   products.length ? (products.reduce((s, p) => s + p.rating, 0) / products.length).toFixed(1) : 0,
    topRated:    [...products].sort((a, b) => b.rating - a.rating).slice(0, 5),
    mostExp:     [...products].sort((a, b) => b.price - a.price).slice(0, 5),
  };

  // ── Filter + Sort ──
  let filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat    = filterCat === 'All' || p.category === filterCat;
    return matchSearch && matchCat;
  });

  filtered = [...filtered].sort((a, b) => {
    let valA = a[sortCol], valB = b[sortCol];
    if (typeof valA === 'string') valA = valA.toLowerCase();
    if (typeof valB === 'string') valB = valB.toLowerCase();
    if (valA < valB) return sortDir === 'asc' ? -1 : 1;
    if (valA > valB) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(filtered.length / ROWS_PER_PAGE);
  const paginated  = filtered.slice((currentPage - 1) * ROWS_PER_PAGE, currentPage * ROWS_PER_PAGE);

  const SortIcon = ({ col }) => (
    <span className="ml-1 text-[10px]">
      {sortCol === col ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
    </span>
  );

  if (loading) return (
    <div className="min-h-screen bg-[#111] flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-white text-xs font-black uppercase tracking-widest">Loading Dashboard</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex">

      {/* ── SIDEBAR ── */}
      <aside className="w-56 bg-[#111] flex flex-col flex-shrink-0 min-h-screen">
        {/* Logo */}
        <div className="p-6 border-b border-[#2a2a2a]">
          <h1 className="text-white font-black text-lg tracking-tighter">
            SHOP<span className="text-[#e5181b]">SMART</span>
          </h1>
          <p className="text-gray-500 text-[10px] uppercase tracking-widest mt-1">Admin Panel</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {[
            { id: 'overview',  label: '📊 Overview'  },
            { id: 'products',  label: '📦 Products'  },
            { id: 'analytics', label: '📈 Analytics' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full text-left px-4 py-3 text-[11px] font-black uppercase tracking-widest transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-[#111]'
                  : 'text-gray-400 hover:text-white hover:bg-[#222]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* User + Logout */}
        <div className="p-4 border-t border-[#2a2a2a]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-[#e5181b] rounded-full flex items-center justify-center text-white font-black text-xs">
              {admin?.username?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="text-white text-[11px] font-black uppercase">{admin?.username}</p>
              <p className="text-gray-500 text-[10px]">Administrator</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white border border-[#333] hover:border-white py-2 transition-colors"
          >
            Logout →
          </button>
          <a
            href="/"
            className="block text-center mt-2 text-[10px] font-black uppercase tracking-widest text-gray-600 hover:text-gray-400 transition-colors"
          >
            ← View Store
          </a>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 overflow-auto">

        {/* Top bar */}
        <div className="bg-white border-b border-[#e5e5e5] px-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h2 className="font-black text-lg uppercase tracking-tight">
              {activeTab === 'overview'  && 'Overview'}
              {activeTab === 'products'  && 'Products'}
              {activeTab === 'analytics' && 'Analytics'}
            </h2>
            <p className="text-[11px] text-gray-400 uppercase tracking-wider">
              {new Date().toDateString()}
            </p>
          </div>
          <div className="bg-green-100 text-green-700 px-3 py-1 text-[10px] font-black uppercase tracking-wider">
            ● System Online
          </div>
        </div>

        <div className="p-8">

          {/* ── OVERVIEW TAB ── */}
          {activeTab === 'overview' && (
            <div>
              {/* Stat Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                  { label: 'Total Products', value: stats.total,       color: '#111'     },
                  { label: 'Avg Price',       value: `₹${stats.avgPrice.toLocaleString()}`, color: '#2563eb' },
                  { label: 'Avg Rating',      value: `${stats.avgRating} ★`, color: '#d97706' },
                  { label: 'Categories',      value: 4,                color: '#16a34a'  },
                ].map(s => (
                  <div key={s.label} className="bg-white p-6 border-l-4" style={{ borderColor: s.color }}>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">{s.label}</p>
                    <p className="text-3xl font-black">{s.value}</p>
                  </div>
                ))}
              </div>

              {/* Category Breakdown */}
              <div className="bg-white p-6 mb-6">
                <h3 className="font-black uppercase tracking-tight text-sm mb-6">Category Breakdown</h3>
                <div className="space-y-4">
                  {[
                    { label: 'Fashion',     count: stats.fashion,     color: '#e5181b' },
                    { label: 'Electronics', count: stats.electronics, color: '#2563eb' },
                    { label: 'Home',        count: stats.home,        color: '#16a34a' },
                    { label: 'Appliances',  count: stats.appliances,  color: '#d97706' },
                  ].map(cat => (
                    <div key={cat.label}>
                      <div className="flex justify-between mb-1">
                        <span className="text-xs font-black uppercase tracking-wider">{cat.label}</span>
                        <span className="text-xs font-black">{cat.count} products</span>
                      </div>
                      <div className="h-2 bg-[#f5f5f5] w-full">
                        <div
                          className="h-2 transition-all duration-500"
                          style={{ width: `${(cat.count / stats.total) * 100}%`, backgroundColor: cat.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top 5 rated */}
              <div className="bg-white p-6">
                <h3 className="font-black uppercase tracking-tight text-sm mb-4">Top 5 Rated Products</h3>
                <div className="space-y-3">
                  {stats.topRated.map((p, i) => (
                    <div key={p.id} className="flex items-center gap-4 py-2 border-b border-[#f5f5f5]">
                      <span className="text-[11px] font-black text-gray-400 w-4">{i + 1}</span>
                      <img src={p.image_url} className="w-8 h-8 object-contain bg-[#f5f5f5] p-1"
                        onError={e => e.target.src = 'https://via.placeholder.com/32'} />
                      <p className="flex-1 text-xs font-bold line-clamp-1">{p.name}</p>
                      <span className="text-[11px] font-black text-[#d97706]">{p.rating} ★</span>
                      <span className="text-[11px] font-black">₹{p.price.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── PRODUCTS TAB ── */}
          {activeTab === 'products' && (
            <div>
              {/* Filters */}
              <div className="flex flex-col md:flex-row gap-3 mb-6">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={search}
                  onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
                  className="flex-1 border-2 border-[#e5e5e5] focus:border-[#111] px-4 py-3 text-sm outline-none"
                />
                <select
                  value={filterCat}
                  onChange={e => { setFilterCat(e.target.value); setCurrentPage(1); }}
                  className="border-2 border-[#e5e5e5] px-4 py-3 text-[11px] font-black uppercase outline-none bg-white"
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <div className="bg-[#f5f5f5] px-4 py-3 text-[11px] font-black uppercase tracking-wider text-gray-500">
                  {filtered.length} Results
                </div>
              </div>

              {/* Table */}
              <div className="bg-white overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-[#111]">
                      {[
                        { key: 'id',       label: 'ID'       },
                        { key: 'image',    label: 'Image'    },
                        { key: 'name',     label: 'Name'     },
                        { key: 'category', label: 'Category' },
                        { key: 'price',    label: 'Price'    },
                        { key: 'rating',   label: 'Rating'   },
                      ].map(col => (
                        <th
                          key={col.key}
                          onClick={() => col.key !== 'image' && handleSort(col.key)}
                          className={`text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest ${
                            col.key !== 'image' ? 'cursor-pointer hover:bg-[#f5f5f5]' : ''
                          }`}
                        >
                          {col.label}
                          {col.key !== 'image' && <SortIcon col={col.key} />}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((p, i) => (
                      <tr key={p.id} className={`border-b border-[#f5f5f5] hover:bg-[#f9f9f9] transition-colors ${i % 2 === 0 ? '' : 'bg-[#fafafa]'}`}>
                        <td className="px-4 py-3 text-[11px] font-black text-gray-400">{p.id}</td>
                        <td className="px-4 py-3">
                          <img src={p.image_url} className="w-10 h-10 object-contain bg-[#f5f5f5] p-1"
                            onError={e => e.target.src = 'https://via.placeholder.com/40'} />
                        </td>
                        <td className="px-4 py-3 text-xs font-bold max-w-xs">
                          <p className="line-clamp-2">{p.name}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 ${
                            p.category === 'Electronics' ? 'bg-blue-100 text-blue-700'   :
                            p.category === 'Fashion'     ? 'bg-red-100 text-red-700'     :
                            p.category === 'Home'        ? 'bg-green-100 text-green-700' :
                                                           'bg-yellow-100 text-yellow-700'
                          }`}>
                            {p.category}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs font-black">₹{p.price.toLocaleString()}</td>
                        <td className="px-4 py-3 text-xs font-black text-[#d97706]">{p.rating} ★</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">
                  Page {currentPage} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 text-[10px] font-black uppercase border border-[#e5e5e5] hover:border-[#111] disabled:opacity-40 transition-colors"
                  >
                    ← Prev
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = Math.max(1, Math.min(currentPage - 2, totalPages - 4)) + i;
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-9 h-9 text-[11px] font-black border transition-colors ${
                          currentPage === page ? 'bg-[#111] text-white border-[#111]' : 'border-[#e5e5e5] hover:border-[#111]'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 text-[10px] font-black uppercase border border-[#e5e5e5] hover:border-[#111] disabled:opacity-40 transition-colors"
                  >
                    Next →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── ANALYTICS TAB ── */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Price Distribution */}
                <div className="bg-white p-6">
                  <h3 className="font-black uppercase tracking-tight text-sm mb-6">Price Distribution</h3>
                  {[
                    { label: 'Under ₹1,000',          range: [0, 1000]         },
                    { label: '₹1,000 – ₹10,000',      range: [1000, 10000]     },
                    { label: '₹10,000 – ₹50,000',     range: [10000, 50000]    },
                    { label: 'Above ₹50,000',          range: [50000, Infinity] },
                  ].map(tier => {
                    const count = products.filter(p => p.price >= tier.range[0] && p.price < tier.range[1]).length;
                    const pct   = products.length ? Math.round((count / products.length) * 100) : 0;
                    return (
                      <div key={tier.label} className="mb-4">
                        <div className="flex justify-between mb-1">
                          <span className="text-xs font-bold">{tier.label}</span>
                          <span className="text-xs font-black">{count} ({pct}%)</span>
                        </div>
                        <div className="h-2 bg-[#f5f5f5]">
                          <div className="h-2 bg-[#111] transition-all duration-500" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Rating Distribution */}
                <div className="bg-white p-6">
                  <h3 className="font-black uppercase tracking-tight text-sm mb-6">Rating Distribution</h3>
                  {[5, 4, 3, 2, 1].map(star => {
                    const count = products.filter(p => Math.floor(p.rating) === star).length;
                    const pct   = products.length ? Math.round((count / products.length) * 100) : 0;
                    return (
                      <div key={star} className="mb-4">
                        <div className="flex justify-between mb-1">
                          <span className="text-xs font-bold text-[#d97706]">{'★'.repeat(star)}{'☆'.repeat(5 - star)}</span>
                          <span className="text-xs font-black">{count} ({pct}%)</span>
                        </div>
                        <div className="h-2 bg-[#f5f5f5]">
                          <div className="h-2 bg-[#d97706] transition-all duration-500" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Most Expensive */}
                <div className="bg-white p-6">
                  <h3 className="font-black uppercase tracking-tight text-sm mb-4">Top 5 Most Expensive</h3>
                  {stats.mostExp.map((p, i) => (
                    <div key={p.id} className="flex items-center gap-3 py-2 border-b border-[#f5f5f5]">
                      <span className="text-[11px] font-black text-gray-400 w-4">{i + 1}</span>
                      <img src={p.image_url} className="w-8 h-8 object-contain bg-[#f5f5f5] p-1"
                        onError={e => e.target.src = 'https://via.placeholder.com/32'} />
                      <p className="flex-1 text-xs font-bold line-clamp-1">{p.name}</p>
                      <span className="text-[11px] font-black text-[#2563eb]">₹{p.price.toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                {/* Category Stats */}
                <div className="bg-white p-6">
                  <h3 className="font-black uppercase tracking-tight text-sm mb-4">Category Avg Price</h3>
                  {['Electronics', 'Fashion', 'Home', 'Appliances'].map(cat => {
                    const catProducts = products.filter(p => p.category === cat);
                    const avg = catProducts.length
                      ? Math.round(catProducts.reduce((s, p) => s + p.price, 0) / catProducts.length)
                      : 0;
                    return (
                      <div key={cat} className="flex items-center justify-between py-3 border-b border-[#f5f5f5]">
                        <span className="text-xs font-black uppercase tracking-wider">{cat}</span>
                        <div className="text-right">
                          <p className="text-xs font-black">₹{avg.toLocaleString()}</p>
                          <p className="text-[10px] text-gray-400">{catProducts.length} products</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};