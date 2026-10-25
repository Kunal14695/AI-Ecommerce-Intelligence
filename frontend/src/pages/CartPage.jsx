import React from 'react';
import { useCart } from '../context/CartContext';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';

export default function CartPage({ onNavigate }) {
  const { cart, updateQuantity, removeItem, clearCart } = useCart();

  if (cart.items.length === 0) {
    return (
      <div className="container" style={{ paddingTop: '5rem', textAlign: 'center' }}>
        <div style={{ background: '#eef2ff', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <ShoppingBag size={36} color="var(--primary)" />
        </div>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Your Cart is Empty</h2>
        <p style={{ color: '#64748b', marginTop: '8px', marginBottom: '24px' }}>
          Discover cutting-edge smartphones, laptops, and audio devices with AI decision support.
        </p>
        <button onClick={() => onNavigate('products')} className="btn btn-primary btn-lg">
          Explore Catalog <ArrowRight size={18} />
        </button>
      </div>
    );
  }

  const deliveryFee = cart.subtotal >= 500 ? 0 : 50;
  const grandTotal = cart.subtotal + deliveryFee;

  return (
    <div className="container" style={{ paddingTop: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Shopping Cart</h1>
          <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
            Review your items and proceed to location-aware checkout
          </p>
        </div>
        <button
          onClick={clearCart}
          className="btn btn-secondary btn-sm"
          style={{ color: '#ef4444' }}
        >
          Clear Cart
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 0.8fr', gap: '32px', alignItems: 'start' }}>
        {/* Cart Items List */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {cart.items.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '90px 1fr auto auto',
                  gap: '18px',
                  alignItems: 'center',
                  borderBottom: '1px solid var(--border)',
                  paddingBottom: '20px'
                }}
              >
                <img
                  src={item.product.image_url}
                  alt={item.product.title}
                  style={{ width: '90px', height: '90px', objectFit: 'contain', borderRadius: '8px', background: '#f8fafc' }}
                />

                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>
                    {item.product.brand}
                  </span>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '2px' }}>
                    {item.product.title}
                  </h4>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800, marginTop: '4px' }}>
                    ₹{Math.round(item.product.price).toLocaleString('en-IN')}
                  </div>
                </div>

                {/* Quantity Controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid var(--border)', borderRadius: '8px', padding: '4px 8px' }}>
                  <button
                    onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                    disabled={item.quantity <= 1}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                  >
                    <Minus size={14} />
                  </button>
                  <span style={{ fontFamily: 'JetBrains Mono', fontWeight: 600, minWidth: '20px', textAlign: 'center' }}>
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    disabled={item.quantity >= item.product.stock}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                  >
                    <Plus size={14} />
                  </button>
                </div>

                {/* Remove button */}
                <button
                  onClick={() => removeItem(item.id)}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '6px' }}
                  title="Remove from cart"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="card" style={{ padding: '24px', position: 'sticky', top: '92px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px' }}>
            Summary ({cart.total_items} items)
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem', marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
              <span>Items Subtotal</span>
              <span>₹{Math.round(cart.subtotal).toLocaleString('en-IN')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
              <span>Standard Delivery</span>
              <span>{deliveryFee === 0 ? <span style={{ color: '#10b981', fontWeight: 600 }}>FREE</span> : `₹${deliveryFee}`}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 800, borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
              <span>Total Amount</span>
              <span>₹{Math.round(grandTotal).toLocaleString('en-IN')}</span>
            </div>
          </div>

          <button
            onClick={() => onNavigate('checkout')}
            className="btn btn-primary btn-lg"
            style={{ width: '100%', borderRadius: 'var(--radius-md)' }}
          >
            Proceed to Location Checkout <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
