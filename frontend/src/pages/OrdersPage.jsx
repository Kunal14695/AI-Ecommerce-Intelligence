import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Package, Clock, MapPin, ArrowRight } from 'lucide-react';

export default function OrdersPage({ onNavigate }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getOrders()
      .then(setOrders)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container" style={{ paddingTop: '2rem', maxWidth: '840px' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>My Orders</h1>
        <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
          History of all confirmed sandbox orders and tracking status
        </p>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading orders...</div>
      ) : orders.length === 0 ? (
        <div className="card" style={{ padding: '48px', textAlign: 'center' }}>
          <Package size={48} color="#94a3b8" style={{ margin: '0 auto 16px' }} />
          <h3>No Orders Placed Yet</h3>
          <p style={{ color: '#64748b', marginTop: '6px', marginBottom: '20px' }}>
            Browse our catalog, compare products, and place your first location-aware order.
          </p>
          <button onClick={() => onNavigate('products')} className="btn btn-primary">
            Explore Products
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {orders.map((o) => (
            <div key={o.id} className="card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border)', paddingBottom: '14px', marginBottom: '14px' }}>
                <div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700 }}>
                    Order #{o.id}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
                    <Clock size={13} />
                    <span>{new Date(o.order_date).toLocaleDateString()} at {new Date(o.order_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span className={`badge ${o.status === 'DELIVERED' ? 'badge-success' : 'badge-primary'}`} style={{ marginBottom: '4px' }}>
                    {o.status}
                  </span>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>
                    ₹{Math.round(o.total_amount).toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              {/* Items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
                {o.items?.map((it) => (
                  <div key={it.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span>{it.quantity}x {it.product?.title || 'Product Item'}</span>
                    <span style={{ fontWeight: 600 }}>₹{Math.round(it.total_price).toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>

              {/* Delivery destination */}
              {o.address && (
                <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px', background: '#f8fafc', padding: '8px 12px', borderRadius: '6px' }}>
                  <MapPin size={14} color="var(--primary)" />
                  <span>Delivered to: {o.address.address_line}, {o.address.city} - {o.address.pincode} ({o.address.label})</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
