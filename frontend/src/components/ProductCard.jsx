import React, { useState } from 'react';
import { Star, ShoppingCart, Scale, Check, Zap } from 'lucide-react';
import { useCompare } from '../context/CompareContext';
import { useCart } from '../context/CartContext';
import { useLocation } from '../context/LocationContext';
import { api } from '../api/client';

export default function ProductCard({ product, onSelect }) {
  const { isSelected, toggleProduct } = useCompare();
  const { addToCart } = useCart();
  const { location } = useLocation();

  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const inCompare = isSelected(product.id);

  const handleCardClick = () => {
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

  const keySpecs = (product.specifications || []).slice(0, 3);
  const rating = product.average_rating || 4.2;
  const reviewCount = product.review_count || 128;

  const mrp = Math.round(product.price * 1.2);
  const discountPct = Math.round(((mrp - product.price) / mrp) * 100);

  const isTopRated = rating >= 4.5;
  const isAiChoice = !isTopRated && product.price < 40000;

  return (
    <div
      onClick={handleCardClick}
      style={{
        background: 'white',
        border: '1px solid #e2e8f0',
        borderRadius: '10px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        position: 'relative',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.08)';
        e.currentTarget.style.borderColor = '#c7d2fe';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)';
        e.currentTarget.style.borderColor = '#e2e8f0';
      }}
    >
      {/* Top Header: Badge + Compare Pill */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', minHeight: '22px' }}>
        {isTopRated ? (
          <span
            style={{
              background: '#4f46e5',
              color: 'white',
              fontSize: '0.68rem',
              fontWeight: 800,
              padding: '3px 8px',
              borderRadius: '4px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
          >
            ★ Top Rated
          </span>
        ) : isAiChoice ? (
          <span
            style={{
              background: '#0f172a',
              color: '#38bdf8',
              fontSize: '0.68rem',
              fontWeight: 800,
              padding: '3px 8px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Zap size={11} color="#38bdf8" /> AI Recommended
          </span>
        ) : (
          <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600 }}>Verified Spec</span>
        )}

        <button
          onClick={handleCompareToggle}
          style={{
            background: inCompare ? '#4f46e5' : '#f8fafc',
            color: inCompare ? 'white' : '#475569',
            border: inCompare ? '1px solid #4f46e5' : '1px solid #cbd5e1',
            borderRadius: '6px',
            padding: '3px 8px',
            fontSize: '0.72rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            transition: 'all 0.15s'
          }}
          title="Compare specs with another model"
        >
          <Scale size={12} />
          {inCompare ? 'Comparing' : 'Compare'}
        </button>
      </div>

      {/* Product Image */}
      <div
        style={{
          height: '200px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#ffffff',
          marginBottom: '12px',
          overflow: 'hidden'
        }}
      >
        <img
          src={product.image_url || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80'}
          alt={product.title}
          style={{
            maxHeight: '100%',
            maxWidth: '100%',
            objectFit: 'contain',
            transition: 'transform 0.25s ease'
          }}
          onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
          onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        />
      </div>

      {/* Brand & Title */}
      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#4f46e5', textTransform: 'uppercase', marginBottom: '2px' }}>
        {product.brand}
      </div>
      <h3
        style={{
          fontSize: '0.92rem',
          fontWeight: 700,
          color: '#0f172a',
          lineHeight: 1.35,
          marginBottom: '8px',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          minHeight: '2.5rem'
        }}
        title={product.title}
      >
        {product.title}
      </h3>

      {/* Hardware Spec Tags */}
      {keySpecs.length > 0 && (
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '10px' }}>
          {keySpecs.slice(0, 2).map((s, idx) => (
            <span
              key={idx}
              style={{
                fontSize: '0.7rem',
                color: '#475569',
                background: '#f1f5f9',
                padding: '2px 6px',
                borderRadius: '4px',
                fontWeight: 500
              }}
            >
              {s.name}: {s.raw_value}
            </span>
          ))}
        </div>
      )}

      {/* Star Ratings */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '10px' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>
          {rating.toFixed(1)}
        </span>
        <div style={{ display: 'flex', color: '#f59e0b' }}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              size={13}
              color="#f59e0b"
              fill={star <= Math.round(rating) ? '#f59e0b' : 'transparent'}
            />
          ))}
        </div>
        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
          ({reviewCount} reviews)
        </span>
      </div>

      {/* Price Section */}
      <div style={{ marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
          <span style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>
            ₹{Math.round(product.price).toLocaleString('en-IN')}
          </span>
          <span style={{ fontSize: '0.78rem', color: '#94a3b8', textDecoration: 'line-through' }}>
            ₹{mrp.toLocaleString('en-IN')}
          </span>
          <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 700 }}>
            {discountPct}% off
          </span>
        </div>
      </div>

      {/* Delivery ETA */}
      <div style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600, marginBottom: '14px' }}>
        ✓ Fast Delivery to {location.city || 'Jaipur'} ({location.pincode})
      </div>

      {/* Add to Cart Button */}
      <div style={{ marginTop: 'auto' }}>
        <button
          onClick={handleAddToCart}
          disabled={adding || !product.is_available || product.stock === 0}
          style={{
            width: '100%',
            background: added ? '#10b981' : '#0f172a',
            border: 'none',
            borderRadius: '6px',
            padding: '10px 14px',
            fontWeight: 700,
            fontSize: '0.85rem',
            color: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            transition: 'background 0.2s ease, transform 0.1s ease'
          }}
          onMouseOver={(e) => {
            if (!added) e.currentTarget.style.background = '#1e293b';
          }}
          onMouseOut={(e) => {
            if (!added) e.currentTarget.style.background = '#0f172a';
          }}
        >
          {added ? (
            <>
              <Check size={15} /> Added to Cart
            </>
          ) : (
            <>
              <ShoppingCart size={15} /> Add to Cart
            </>
          )}
        </button>
      </div>
    </div>
  );
}
