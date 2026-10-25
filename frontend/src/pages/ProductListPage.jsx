import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../api/client';
import ProductCard from '../components/ProductCard';
import { Star, SlidersHorizontal, ChevronDown, CheckSquare, Square, Zap, ShieldCheck, Sparkles } from 'lucide-react';
import { useLocation } from '../context/LocationContext';

export default function ProductListPage({ initialCategory, searchQuery, onSelectProduct }) {
  const { location } = useLocation();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || null);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [maxPrice, setMaxPrice] = useState(200000);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState('popular');
  const [inStockOnly, setInStockOnly] = useState(true);
  const [deliveryTomorrowOnly, setDeliveryTomorrowOnly] = useState(false);
  const [freeDeliveryOnly, setFreeDeliveryOnly] = useState(false);
  const [payOnDeliveryOnly, setPayOnDeliveryOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getCategories().then(setCategories).catch(console.error);
  }, []);

  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory]);

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        let params = `?sort_by=${sortBy}&max_price=${maxPrice}`;
        if (selectedCategory) params += `&category_id=${selectedCategory}`;
        if (selectedBrand) params += `&brand=${encodeURIComponent(selectedBrand)}`;
        if (minRating > 0) params += `&min_rating=${minRating}`;

        let data;
        if (searchQuery) {
          data = await api.search(`?q=${encodeURIComponent(searchQuery)}&max_price=${maxPrice}`);
        } else {
          data = await api.getProducts(params);
        }

        let filtered = data || [];
        if (inStockOnly) {
          filtered = filtered.filter((p) => p.stock > 0);
        }
        if (minRating > 0) {
          filtered = filtered.filter((p) => (p.average_rating || 4.0) >= minRating);
        }
        if (selectedBrand) {
          filtered = filtered.filter((p) => p.brand.toLowerCase() === selectedBrand.toLowerCase());
        }

        setProducts(filtered);
      } catch (err) {
        console.error('Failed to load products', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [selectedCategory, selectedBrand, maxPrice, minRating, sortBy, searchQuery, inStockOnly]);

  const availableBrands = useMemo(() => {
    return Array.from(new Set(products.map((p) => p.brand).filter(Boolean)));
  }, [products]);

  const activeCategoryObj = categories.find((c) => String(c.id) === String(selectedCategory));

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: '48px' }}>
      {/* Category Horizontal Ribbon */}
      <div style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '10px 24px' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '12px', overflowX: 'auto', fontSize: '0.84rem' }}>
          <button
            onClick={() => setSelectedCategory(null)}
            style={{
              fontWeight: !selectedCategory ? 700 : 500,
              color: !selectedCategory ? '#4f46e5' : '#475569',
              background: !selectedCategory ? '#eef2ff' : 'transparent',
              border: !selectedCategory ? '1px solid #c7d2fe' : '1px solid transparent',
              borderRadius: '20px',
              padding: '5px 14px',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              style={{
                fontWeight: String(selectedCategory) === String(cat.id) ? 700 : 500,
                color: String(selectedCategory) === String(cat.id) ? '#4f46e5' : '#475569',
                background: String(selectedCategory) === String(cat.id) ? '#eef2ff' : 'transparent',
                border: String(selectedCategory) === String(cat.id) ? '1px solid #c7d2fe' : '1px solid transparent',
                borderRadius: '20px',
                padding: '5px 14px',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <div className="container" style={{ paddingTop: '20px' }}>
        {/* Results Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #e2e8f0',
            paddingBottom: '14px',
            marginBottom: '20px',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          <div>
            <span style={{ fontSize: '0.9rem', color: '#64748b' }}>
              Showing {products.length} results for{' '}
            </span>
            <span style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
              "{searchQuery || (activeCategoryObj ? activeCategoryObj.name : 'All Products')}"
            </span>
          </div>

          {/* Sort By Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 500 }}>Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '0.82rem',
                fontWeight: 600,
                color: '#1e293b',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              <option value="popular">Featured & Popularity</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="newest">Newest Arrivals</option>
            </select>
          </div>
        </div>

        {/* SmartCommerce Decision Engine Highlight Banner */}
        <div
          style={{
            background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
            color: 'white',
            borderRadius: '10px',
            padding: '18px 24px',
            marginBottom: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 4px 12px rgba(49, 46, 129, 0.15)',
            flexWrap: 'wrap',
            gap: '14px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                background: '#4f46e5',
                color: 'white',
                padding: '6px 12px',
                borderRadius: '6px',
                fontWeight: 800,
                fontSize: '0.85rem',
                letterSpacing: '0.5px',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <Sparkles size={14} /> AI DECISION SUPPORT
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1rem', color: '#ffffff' }}>
                Multi-Criteria Product Scoring & Aspect-Based Sentiment
              </div>
              <div style={{ fontSize: '0.82rem', color: '#c7d2fe', marginTop: '3px' }}>
                Compare two models side-by-side with Bayesian adjusted ratings and verified delivery in {location.city || 'Jaipur'} ({location.pincode}).
              </div>
            </div>
          </div>
        </div>

        {/* 2-Column Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '28px', alignItems: 'start' }}>
          {/* Left Filter Sidebar */}
          <aside
            style={{
              background: '#ffffff',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              padding: '20px',
              fontSize: '0.82rem',
              color: '#1e293b'
            }}
          >
            {/* Deals & Offers */}
            <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 800, marginBottom: '10px', color: '#0f172a' }}>
                Deals & Offers
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" defaultChecked />
                  <span>Special Clearance Deals</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" />
                  <span>All Discounts</span>
                </label>
              </div>
            </div>

            {/* Delivery Day */}
            <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 800, marginBottom: '10px', color: '#0f172a' }}>
                Delivery Speed
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={deliveryTomorrowOnly}
                    onChange={(e) => setDeliveryTomorrowOnly(e.target.checked)}
                  />
                  <span>Get It by Tomorrow</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" />
                  <span>Standard 2-Day Delivery</span>
                </label>
              </div>
            </div>

            {/* Customer Rating */}
            <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 800, marginBottom: '10px', color: '#0f172a' }}>
                Customer Rating
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  { stars: 4, label: '& Up' },
                  { stars: 3, label: '& Up' },
                  { stars: 2, label: '& Up' },
                  { stars: 0, label: 'All Ratings' }
                ].map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => setMinRating(item.stars)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      cursor: 'pointer',
                      color: minRating === item.stars ? '#4f46e5' : '#334155',
                      fontWeight: minRating === item.stars ? 700 : 400
                    }}
                  >
                    {item.stars > 0 ? (
                      <>
                        <div style={{ display: 'flex', color: '#f59e0b' }}>
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              size={14}
                              color="#f59e0b"
                              fill={s <= item.stars ? '#f59e0b' : 'transparent'}
                            />
                          ))}
                        </div>
                        <span style={{ fontSize: '0.78rem', marginLeft: '4px' }}>{item.label}</span>
                      </>
                    ) : (
                      <span style={{ fontSize: '0.78rem' }}>Clear Rating Filter</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 800, marginBottom: '10px', color: '#0f172a' }}>
                Price Range
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
                {[
                  { label: 'Under ₹10,000', max: 10000 },
                  { label: '₹10,000 - ₹25,000', max: 25000 },
                  { label: '₹25,000 - ₹50,000', max: 50000 },
                  { label: 'All Budgets', max: 200000 }
                ].map((tier, idx) => (
                  <span
                    key={idx}
                    onClick={() => setMaxPrice(tier.max)}
                    style={{
                      cursor: 'pointer',
                      color: maxPrice === tier.max ? '#4f46e5' : '#64748b',
                      fontWeight: maxPrice === tier.max ? 700 : 400
                    }}
                  >
                    {tier.label}
                  </span>
                ))}
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px', color: '#64748b' }}>
                  <span>Max: ₹{maxPrice.toLocaleString('en-IN')}</span>
                </div>
                <input
                  type="range"
                  min="5000"
                  max="200000"
                  step="5000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#4f46e5' }}
                />
              </div>
            </div>

            {/* Brands */}
            {availableBrands.length > 0 && (
              <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 800, marginBottom: '10px', color: '#0f172a' }}>
                  Brands
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="brand_radio"
                      checked={selectedBrand === ''}
                      onChange={() => setSelectedBrand('')}
                    />
                    <span>All Brands</span>
                  </label>
                  {availableBrands.map((brand) => (
                    <label key={brand} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="brand_radio"
                        checked={selectedBrand.toLowerCase() === brand.toLowerCase()}
                        onChange={() => setSelectedBrand(brand)}
                      />
                      <span>{brand}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* In Stock */}
            <div>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 800, marginBottom: '10px', color: '#0f172a' }}>
                Availability
              </h4>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                />
                <span>In Stock Only</span>
              </label>
            </div>
          </aside>

          {/* Product Grid */}
          <main>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
                <div style={{ fontSize: '1rem', fontWeight: 600 }}>Loading catalogue items...</div>
              </div>
            ) : products.length === 0 ? (
              <div
                style={{
                  padding: '48px 24px',
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}
              >
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>
                  No products matched your selected filters
                </h3>
                <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '8px' }}>
                  Try adjusting your price range, clearing brand selections, or searching for other items.
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory(null);
                    setSelectedBrand('');
                    setMaxPrice(200000);
                    setMinRating(0);
                  }}
                  className="btn"
                  style={{
                    background: '#4f46e5',
                    color: 'white',
                    fontWeight: 700,
                    padding: '8px 16px',
                    borderRadius: '6px',
                    marginTop: '16px',
                    cursor: 'pointer',
                    border: 'none'
                  }}
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                  gap: '20px'
                }}
              >
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onSelect={onSelectProduct}
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
