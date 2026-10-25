import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useCompare } from '../context/CompareContext';
import { useLocation } from '../context/LocationContext';
import { api } from '../api/client';
import { ShoppingCart, Scale, Search, User, LogOut, Shield, MapPin, Menu, ChevronDown, Sparkles } from 'lucide-react';

export default function Navbar({ onNavigate, activePage, onOpenAuth }) {
  const { user, logout, isAdmin } = useAuth();
  const { cart } = useCart();
  const { selectedProducts } = useCompare();
  const { location, setIsModalOpen } = useLocation();

  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSearchCat, setSelectedSearchCat] = useState('all');
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);

  useEffect(() => {
    api.getCategories().then(setCategories).catch(console.error);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      onNavigate('search', {
        q: searchTerm.trim(),
        category_id: selectedSearchCat !== 'all' ? selectedSearchCat : null
      });
    } else if (selectedSearchCat !== 'all') {
      onNavigate('products', { category_id: selectedSearchCat });
    }
  };

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
      {/* 1. Primary Top Navigation Bar (Deep Slate & Modern Indigo) */}
      <div
        style={{
          background: '#0f172a',
          color: 'white',
          padding: '0 20px',
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          borderBottom: '1px solid #1e293b'
        }}
      >
        {/* Brand Logo */}
        <div
          onClick={() => onNavigate('home')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            padding: '4px 6px',
            borderRadius: '6px'
          }}
        >
          <div
            style={{
              background: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(79, 70, 229, 0.4)'
            }}
          >
            <Sparkles size={17} color="white" />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '3px' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.5px', color: '#f8fafc' }}>
              SmartCommerce
            </span>
            <span
              style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                background: '#312e81',
                color: '#818cf8',
                padding: '2px 6px',
                borderRadius: '4px',
                letterSpacing: '0.5px'
              }}
            >
              AI
            </span>
          </div>
        </div>

        {/* Deliver-To Location Widget */}
        <div
          onClick={() => setIsModalOpen(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 10px',
            cursor: 'pointer',
            borderRadius: '6px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            minWidth: '160px',
            transition: 'background 0.15s, border-color 0.15s'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
            e.currentTarget.style.borderColor = '#4f46e5';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
          }}
          title="Click to change your delivery location"
        >
          <MapPin size={17} color="#38bdf8" />
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
            <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
              Deliver to {location.city || 'Jaipur'} {location.pincode}
            </span>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f8fafc' }}>
              Update location
            </span>
          </div>
        </div>

        {/* Modern Unified Search Bar with Dynamic Categories */}
        <form
          onSubmit={handleSearchSubmit}
          style={{
            flex: 1,
            display: 'flex',
            height: '42px',
            borderRadius: '8px',
            overflow: 'hidden',
            background: '#ffffff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            border: '1px solid #cbd5e1'
          }}
        >
          <select
            value={selectedSearchCat}
            onChange={(e) => setSelectedSearchCat(e.target.value)}
            style={{
              background: '#f8fafc',
              border: 'none',
              padding: '0 12px',
              fontSize: '0.82rem',
              color: '#334155',
              cursor: 'pointer',
              borderRight: '1px solid #e2e8f0',
              outline: 'none',
              fontWeight: 600,
              maxWidth: '170px'
            }}
          >
            <option value="all">All Departments</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search fashion, jewelry, electronics, furniture, automotive..."
            style={{
              flex: 1,
              padding: '0 14px',
              border: 'none',
              fontSize: '0.875rem',
              color: '#0f172a',
              outline: 'none'
            }}
          />

          <button
            type="submit"
            style={{
              background: '#4f46e5',
              border: 'none',
              padding: '0 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'background 0.2s',
              gap: '6px',
              color: 'white',
              fontWeight: 600,
              fontSize: '0.82rem'
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = '#4338ca')}
            onMouseOut={(e) => (e.currentTarget.style.background = '#4f46e5')}
            title="Search"
          >
            <Search size={16} />
          </button>
        </form>

        {/* AI Compare Button */}
        <div
          onClick={() => onNavigate('compare')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 12px',
            cursor: 'pointer',
            borderRadius: '6px',
            background: 'rgba(79, 70, 229, 0.15)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            position: 'relative',
            color: '#c7d2fe',
            fontWeight: 700,
            fontSize: '0.82rem',
            transition: 'background 0.15s'
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(79, 70, 229, 0.25)')}
          onMouseOut={(e) => (e.currentTarget.style.background = 'rgba(79, 70, 229, 0.15)')}
          title="Open AI Product Comparator"
        >
          <Scale size={16} color="#818cf8" />
          <span>Compare</span>
          {selectedProducts.length > 0 && (
            <span
              style={{
                background: '#4f46e5',
                color: 'white',
                borderRadius: '12px',
                padding: '1px 6px',
                fontSize: '0.7rem',
                fontWeight: 800
              }}
            >
              {selectedProducts.length}
            </span>
          )}
        </div>

        {/* Account & Orders */}
        <div
          style={{ position: 'relative' }}
          onMouseEnter={() => setShowAccountDropdown(true)}
          onMouseLeave={() => setShowAccountDropdown(false)}
        >
          <div
            onClick={user ? undefined : onOpenAuth}
            style={{
              display: 'flex',
              flexDirection: 'column',
              lineHeight: 1.2,
              padding: '6px 10px',
              cursor: 'pointer',
              borderRadius: '6px'
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
            onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
              Hello, {user ? user.full_name.split(' ')[0] : 'Sign In'}
            </span>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '3px' }}>
              Account <ChevronDown size={13} color="#94a3b8" />
            </span>
          </div>

          {showAccountDropdown && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                width: '240px',
                background: 'white',
                color: '#0f172a',
                boxShadow: '0 12px 30px rgba(0,0,0,0.18)',
                borderRadius: '8px',
                padding: '16px',
                zIndex: 150,
                border: '1px solid #e2e8f0',
                marginTop: '4px'
              }}
            >
              {!user ? (
                <div style={{ textAlign: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '14px', marginBottom: '12px' }}>
                  <button
                    onClick={onOpenAuth}
                    className="btn btn-sm"
                    style={{
                      background: '#4f46e5',
                      color: 'white',
                      fontWeight: 700,
                      width: '100%',
                      padding: '8px',
                      borderRadius: '6px',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    Sign in to Account
                  </button>
                  <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '8px' }}>
                    New here? <span onClick={onOpenAuth} style={{ color: '#4f46e5', cursor: 'pointer', fontWeight: 600 }}>Create an account</span>
                  </p>
                </div>
              ) : (
                <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '10px', marginBottom: '10px' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>{user.full_name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{user.email}</div>
                  <div style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 700, textTransform: 'uppercase', marginTop: '2px' }}>
                    Role: {user.role}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
                <div
                  onClick={() => { onNavigate('orders'); setShowAccountDropdown(false); }}
                  style={{ cursor: 'pointer', color: '#334155', padding: '4px 0', fontWeight: 500 }}
                  onMouseOver={(e) => (e.currentTarget.style.color = '#4f46e5')}
                  onMouseOut={(e) => (e.currentTarget.style.color = '#334155')}
                >
                  Your Orders & Invoices
                </div>
                {isAdmin && (
                  <div
                    onClick={() => { onNavigate('admin'); setShowAccountDropdown(false); }}
                    style={{ cursor: 'pointer', color: '#4f46e5', fontWeight: 700, padding: '4px 0', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Shield size={14} /> Admin Portal
                  </div>
                )}
                {user && (
                  <div
                    onClick={() => { logout(); setShowAccountDropdown(false); }}
                    style={{ cursor: 'pointer', color: '#dc2626', fontWeight: 600, padding: '6px 0 0 0', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <LogOut size={14} /> Sign Out
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Shopping Cart */}
        <div
          onClick={() => onNavigate('cart')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 12px',
            cursor: 'pointer',
            borderRadius: '6px',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)'
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
          onMouseOut={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
        >
          <div style={{ position: 'relative' }}>
            <ShoppingCart size={20} color="white" />
            {cart.total_items > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-8px',
                  right: '-10px',
                  background: '#6366f1',
                  color: 'white',
                  borderRadius: '10px',
                  padding: '1px 5px',
                  fontSize: '0.7rem',
                  fontWeight: 800
                }}
              >
                {cart.total_items}
              </span>
            )}
          </div>
          <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>
            Cart ({cart.total_items})
          </span>
        </div>
      </div>

      {/* 2. Secondary Clean Slate Sub-Bar with All Categories (#1e293b) */}
      <div
        style={{
          background: '#1e293b',
          color: '#cbd5e1',
          height: '42px',
          display: 'flex',
          alignItems: 'center',
          padding: '0 20px',
          gap: '12px',
          fontSize: '0.82rem',
          fontWeight: 600,
          borderBottom: '1px solid #334155',
          overflowX: 'auto'
        }}
      >
        <div
          onClick={() => onNavigate('products')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            color: 'white',
            fontWeight: 700,
            padding: '4px 8px',
            borderRadius: '4px',
            background: 'rgba(255,255,255,0.06)',
            whiteSpace: 'nowrap'
          }}
        >
          <Menu size={15} />
          <span>All Departments</span>
        </div>

        {/* Dynamic Category Nav Items */}
        {categories.map((cat) => (
          <span
            key={cat.id}
            onClick={() => onNavigate('products', { category_id: cat.id })}
            style={{
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              padding: '4px 8px',
              borderRadius: '4px',
              transition: 'color 0.15s, background 0.15s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.color = 'white';
              e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.color = '#cbd5e1';
              e.currentTarget.style.background = 'transparent';
            }}
          >
            {cat.name}
          </span>
        ))}

        {isAdmin && (
          <span
            onClick={() => onNavigate('admin')}
            style={{
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              padding: '3px 8px',
              borderRadius: '4px',
              background: '#4f46e5',
              color: 'white',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              marginLeft: 'auto'
            }}
          >
            <Shield size={13} /> Admin
          </span>
        )}
      </div>
    </header>
  );
}
