import React, { useState } from 'react';
import { Star, ShoppingCart, Scale, Check } from 'lucide-react';
import { useCompare } from '../context/CompareContext';
import { useCart } from '../context/CartContext';
import { api } from '../api/client';

export default function ProductCard({ product, onSelect }) {
  const { isSelected, toggleProduct } = useCompare();
  const { addToCart } = useCart();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const inCompare = isSelected(product.id);

  const handleCardClick = () => {
    // Log view interaction
    api.logInteraction({ product_id: product.id, event_type: 'view' }).catch(() => {});
    if (onSelect) onSelect(product.id);
  };

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    try {
      setAdding(true);
      await addToCart(product.id, 1);
      api.logInteraction({ product_id: product.id, event_type: 'cart' }).catch(() => {});
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (err) {
      alert(err.message);
    } finally {
      setAdding(false);
    }
  };

  const handleCompareToggle = (e) => {
    e.stopPropagation();
    toggleProduct(product);
    api.logInteraction({ product_id: product.id, event_type: 'compare' }).catch(() => {});
  };

  // Preview key specs
  const keySpecs = (product.specifications || []).slice(0, 3);

  return (
    <div
      className="card"
      onClick={handleCardClick}
      style={{
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        position: 'relative'
      }}
    >
      {/* Compare Badge / Button in corner */}
      <button
        onClick={handleCompareToggle}
        className={`badge ${inCompare ? 'badge-primary' : 'badge-neutral'}`}
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          zIndex: 10,
          border: inCompare ? '1px solid var(--primary)' : '1px solid var(--border)',
          background: inCompare ? 'var(--primary)' : 'rgba(255, 255, 255, 0.9)',
          color: inCompare ? 'white' : 'var(--text-main)',
          cursor: 'pointer',
          padding: '5px 9px',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <Scale size={13} />
        {inCompare ? 'Comparing' : 'Compare'}
      </button>

      {/* Product Image */}
      <div style={{ position: 'relative', height: '200px', background: '#f1f5f9', overflow: 'hidden' }}>
        <img
          src={product.image_url || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80'}
          alt={product.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }}
          onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
          onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        />
        {product.stock <= 5 && product.stock > 0 && (
          <span className="badge badge-warning" style={{ position: 'absolute', bottom: '8px', left: '8px' }}>
            Only {product.stock} left!
          </span>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1, gap: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>
            {product.brand}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 600 }}>
            <Star size={14} color="#f59e0b" fill="#f59e0b" />
            <span>{product.average_rating ? product.average_rating.toFixed(1) : '4.0'}</span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
              ({product.review_count || 0})
            </span>
          </div>
        </div>

        <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)', lineHeight: 1.35 }}>
          {product.title}
        </h3>

        {/* Specs highlights */}
        {keySpecs.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', margin: '4px 0' }}>
            {keySpecs.map((s, idx) => (
              <span
                key={idx}
                style={{
                  fontSize: '0.7rem',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  color: '#475569'
                }}
              >
                {s.name}: {s.raw_value}
              </span>
            ))}
          </div>
        )}

        {/* Pricing and Cart button */}
        <div style={{ marginTop: 'auto', paddingTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
              ₹{Math.round(product.price).toLocaleString('en-IN')}
            </span>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={adding || !product.is_available || product.stock === 0}
            className={`btn btn-sm ${added ? 'btn-success' : 'btn-primary'}`}
            style={{ borderRadius: 'var(--radius-sm)' }}
          >
            {added ? (
              <>
                <Check size={14} /> Added
              </>
            ) : (
              <>
                <ShoppingCart size={14} /> Add
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
