import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import ProductCard from '../components/ProductCard';
import { Filter, SlidersHorizontal, ArrowUpDown } from 'lucide-react';

export default function ProductListPage({ initialCategory, searchQuery, onSelectProduct }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || null);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [maxPrice, setMaxPrice] = useState(200000);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState('popular');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getCategories().then(setCategories).catch(console.error);
  }, []);

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
        setProducts(data);
      } catch (err) {
        console.error('Failed to load products', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [selectedCategory, selectedBrand, maxPrice, minRating, sortBy, searchQuery]);

  // Unique brands
  const brands = Array.from(new Set(products.map((p) => p.brand).filter(Boolean)));

  return (
    <div className="container" style={{ paddingTop: '2rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>
          {searchQuery ? `Search results for "${searchQuery}"` : 'All Products'}
        </h1>
        <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
          Showing {products.length} products with multi-criteria specifications
        </p>
      </div>

      {/* Category filter bar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '1.5rem' }}>
        <button
          onClick={() => setSelectedCategory(null)}
          className={`btn btn-sm ${!selectedCategory ? 'btn-primary' : 'btn-secondary'}`}
          style={{ borderRadius: '9999px' }}
        >
          All Categories
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`btn btn-sm ${selectedCategory === cat.id ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: '9999px' }}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Filter and Content Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '28px', alignItems: 'start' }}>
        {/* Filters Sidebar */}
        <div className="card" style={{ padding: '20px', position: 'sticky', top: '92px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', fontWeight: 700, fontSize: '0.95rem' }}>
            <SlidersHorizontal size={18} color="var(--primary)" />
            Filter Catalog
          </div>

          {/* Price Range Slider */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
              <span style={{ fontWeight: 600 }}>Max Budget</span>
              <span style={{ fontWeight: 700, color: 'var(--primary)' }}>₹{maxPrice.toLocaleString('en-IN')}</span>
            </div>
            <input
              type="range"
              min="2000"
              max="200000"
              step="2000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
            />
          </div>

          {/* Rating Filter */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
              Minimum Rating
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.85rem' }}>
              {[0, 4, 4.5].map((rate) => (
                <label key={rate} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="min_rating"
                    checked={minRating === rate}
                    onChange={() => setMinRating(rate)}
                  />
                  <span>{rate === 0 ? 'Any Rating' : `${rate} Stars & above`}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Sort Option */}
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.85rem',
                background: 'white'
              }}
            >
              <option value="popular">Popularity & Reviews</option>
              <option value="rating">Highest Rated</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="newest">Newest Arrivals</option>
            </select>
          </div>
        </div>

        {/* Product Grid */}
        <div>
          {loading ? (
            <div style={{ padding: '60px 0', textAlign: 'center', color: '#64748b' }}>
              Loading products...
            </div>
          ) : products.length === 0 ? (
            <div className="card" style={{ padding: '48px', textAlign: 'center', color: '#64748b' }}>
              <h3>No products matched your filters</h3>
              <p style={{ marginTop: '8px' }}>Try widening your price range or clearing category filters.</p>
            </div>
          ) : (
            <div className="grid-products">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} onSelect={onSelectProduct} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
