import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useCompare } from '../context/CompareContext';
import { ShoppingCart, Scale, Search, User, LogOut, Shield, Sparkles, MapPin } from 'lucide-react';

export default function Navbar({ onNavigate, activePage, onOpenAuth }) {
  const { user, logout, isAdmin } = useAuth();
  const { cart } = useCart();
  const { selectedProducts } = useCompare();
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      onNavigate('search', { q: searchTerm.trim() });
    }
  };

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        {/* Brand Logo */}
        <div
          onClick={() => onNavigate('home')}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
        >
          <div className="logo-badge">
            <Sparkles size={18} />
            SmartCommerce AI
          </div>
          <span style={{ fontSize: '0.75rem', background: '#e0e7ff', color: '#4338ca', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
            Poornima
          </span>
        </div>

        {/* Global Search Bar */}
        <form onSubmit={handleSearchSubmit} style={{ flex: '0 1 420px', position: 'relative' }}>
          <Search size={16} color="#94a3b8" style={{ position: 'absolute', top: '12px', left: '14px' }} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search smartphones, laptops, audio..."
            style={{
              width: '100%',
              padding: '10px 16px 10px 40px',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--border)',
              background: '#f8fafc',
              fontSize: '0.875rem',
              outline: 'none',
              transition: 'all 0.2s'
            }}
            onFocus={(e) => (e.target.style.borderColor = 'var(--primary)', e.target.style.background = '#ffffff')}
            onBlur={(e) => (e.target.style.borderColor = 'var(--border)', e.target.style.background = '#f8fafc')}
          />
        </form>

        {/* Nav Links & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={() => onNavigate('products')}
            style={{
              background: 'none',
              border: 'none',
              fontWeight: activePage === 'products' ? 700 : 500,
              color: activePage === 'products' ? 'var(--primary)' : 'var(--text-main)',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            Catalog
          </button>

          {/* Compare Button */}
          <button
            onClick={() => onNavigate('compare')}
            className="btn btn-secondary btn-sm"
            style={{
              position: 'relative',
              borderColor: activePage === 'compare' ? 'var(--primary)' : 'var(--border)',
              color: activePage === 'compare' ? 'var(--primary)' : 'var(--text-main)'
            }}
          >
            <Scale size={16} />
            <span>Compare</span>
            {selectedProducts.length > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-6px',
                  right: '-6px',
                  background: 'var(--primary)',
                  color: 'white',
                  borderRadius: '50%',
                  width: '18px',
                  height: '18px',
                  fontSize: '0.7rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700
                }}
              >
                {selectedProducts.length}
              </span>
            )}
          </button>

          {/* Cart Button */}
          <button
            onClick={() => onNavigate('cart')}
            className="btn btn-secondary btn-sm"
            style={{
              position: 'relative',
              borderColor: activePage === 'cart' ? 'var(--primary)' : 'var(--border)'
            }}
          >
            <ShoppingCart size={16} />
            <span>Cart</span>
            {cart.total_items > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-6px',
                  right: '-6px',
                  background: 'var(--success)',
                  color: 'white',
                  borderRadius: '50%',
                  width: '18px',
                  height: '18px',
                  fontSize: '0.7rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700
                }}
              >
                {cart.total_items}
              </span>
            )}
          </button>

          {/* User Account / Admin */}
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {isAdmin && (
                <button
                  onClick={() => onNavigate('admin')}
                  className="btn btn-sm btn-outline"
                  style={{ gap: '4px' }}
                >
                  <Shield size={14} /> Admin
                </button>
              )}
              <button
                onClick={() => onNavigate('orders')}
                className="btn btn-secondary btn-sm"
                title="View your orders"
              >
                Orders
              </button>
              <button
                onClick={logout}
                className="btn btn-secondary btn-sm"
                title="Logout"
                style={{ padding: '6px 8px' }}
              >
                <LogOut size={15} color="#ef4444" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="btn btn-primary btn-sm"
            >
              <User size={15} /> Sign In
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
