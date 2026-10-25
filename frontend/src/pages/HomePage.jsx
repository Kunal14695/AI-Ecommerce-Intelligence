import React, { useState, useEffect } from 'react';
import { api, getToken } from '../api/client';
import ProductCard from '../components/ProductCard';
import DecisionNotice from '../components/DecisionNotice';
import { Sparkles, Scale, MapPin, Zap, ArrowRight, ShieldCheck, Flame } from 'lucide-react';

export default function HomePage({ onNavigate, onSelectProduct }) {
  const [categories, setCategories] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [popularProducts, setPopularProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [cats, recs, prods] = await Promise.all([
          api.getCategories(),
          api.getRecommendations(getToken()),
          api.getProducts('?sort_by=popular')
        ]);
        setCategories(cats);
        setRecommendations(recs);
        setPopularProducts(prods.slice(0, 8));
      } catch (err) {
        console.error('Home load error', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="container" style={{ paddingTop: '2rem' }}>
      {/* Hero Section */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)',
          borderRadius: 'var(--radius-lg)',
          padding: '48px 36px',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-lg)',
          marginBottom: '2.5rem'
        }}
      >
        <div style={{ maxWidth: '680px', position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255, 255, 255, 0.15)', padding: '6px 14px', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 600, marginBottom: '16px' }}>
            <Sparkles size={14} color="#a5b4fc" />
            AI-Driven Customer Intelligence Platform
          </div>

          <h1 style={{ fontSize: '2.4rem', fontWeight: 800, lineHeight: 1.2, marginBottom: '16px', letterSpacing: '-0.5px' }}>
            Smarter Comparisons. <br />
            Location-Aware Checkout.
          </h1>

          <p style={{ fontSize: '1.05rem', color: '#c7d2fe', lineHeight: 1.6, marginBottom: '28px' }}>
            Make informed purchases using multi-criteria weighted AI product comparisons, personalized hybrid recommendations, and instant GPS delivery detection.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px' }}>
            <button
              onClick={() => onNavigate('compare')}
              className="btn btn-primary btn-lg"
              style={{ background: 'white', color: '#312e81' }}
            >
              <Scale size={18} /> Launch Comparison Engine
            </button>
            <button
              onClick={() => onNavigate('products')}
              className="btn btn-secondary btn-lg"
              style={{ background: 'rgba(255, 255, 255, 0.15)', color: 'white', borderColor: 'rgba(255, 255, 255, 0.25)' }}
            >
              Explore Catalog <ArrowRight size={18} />
            </button>
          </div>
        </div>

        {/* Feature Highlights on right */}
        <div
          style={{
            position: 'absolute',
            right: '-40px',
            bottom: '-40px',
            width: '320px',
            height: '320px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(129, 140, 248, 0.2) 0%, transparent 70%)',
            pointerEvents: 'none'
          }}
        />
      </div>

      {/* Feature Spotlight Banner */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px',
          marginBottom: '3rem'
        }}
      >
        <div className="card" style={{ padding: '24px', display: 'flex', gap: '16px' }}>
          <div style={{ background: '#eef2ff', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Scale size={24} color="#4f46e5" />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '6px' }}>
              Multi-Criteria AI Comparison
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
              Side-by-side transparent scoring with customizable weights for budget, hardware specs, customer reviews, and battery life.
            </p>
          </div>
        </div>

        <div className="card" style={{ padding: '24px', display: 'flex', gap: '16px' }}>
          <div style={{ background: '#ecfdf5', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <MapPin size={24} color="#10b981" />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '6px' }}>
              Location-Aware Ordering
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
              Two equal choices: Option A "Use Current Location" (auto-reverse geocoding) or Option B "Select Another Location" (family, hostel, gifts).
            </p>
          </div>
        </div>

        <div className="card" style={{ padding: '24px', display: 'flex', gap: '16px' }}>
          <div style={{ background: '#fdf4ff', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Sparkles size={24} color="#c026d3" />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '6px' }}>
              VADER Review Intelligence
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
              Real sentiment polarity mining and aspect extraction for battery, camera, display, and real-world durability.
            </p>
          </div>
        </div>
      </div>

      {/* Decision Support Legal / Ethical Notice */}
      <DecisionNotice />

      {/* Categories */}
      <div style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Browse by Category</h2>
            <p style={{ fontSize: '0.875rem', color: '#64748b' }}>Explore electronics, fashion, jewelry, furniture, automotive, and grooming</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => onNavigate('products', { category_id: cat.id })}
              className="card"
              style={{
                padding: '20px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                borderLeft: '4px solid var(--primary)',
                transition: 'all 0.2s'
              }}
            >
              <div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  {cat.name}
                </h4>
                <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
                  {cat.description || 'View all models'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Personalized AI Recommendations Section */}
      {recommendations.length > 0 && (
        <div style={{ marginBottom: '3.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ background: '#fdf4ff', padding: '6px', borderRadius: '8px' }}>
                <Sparkles size={20} color="#9333ea" />
              </div>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Recommended For You</h2>
                <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
                  Hybrid TF-IDF content similarity matched against your interest profile
                </p>
              </div>
            </div>
          </div>

          <div className="grid-products">
            {recommendations.map((rec, i) => (
              <div key={rec.product.id} style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderBottom: 'none', padding: '6px 12px', borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0', fontSize: '0.75rem', color: '#4338ca', fontWeight: 600 }}>
                  💡 {rec.reason}
                </div>
                <div style={{ flex: 1 }}>
                  <ProductCard product={rec.product} onSelect={onSelectProduct} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Popular Products */}
      <div style={{ marginBottom: '3.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ background: '#fff7ed', padding: '6px', borderRadius: '8px' }}>
              <Flame size={20} color="#ea580c" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Trending Products</h2>
              <p style={{ fontSize: '0.875rem', color: '#64748b' }}>Most reviewed and highest customer satisfaction</p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('products')}
            className="btn btn-secondary btn-sm"
          >
            View All <ArrowRight size={14} />
          </button>
        </div>

        <div className="grid-products">
          {popularProducts.map((p) => (
            <ProductCard key={p.id} product={p} onSelect={onSelectProduct} />
          ))}
        </div>
      </div>
    </div>
  );
}
