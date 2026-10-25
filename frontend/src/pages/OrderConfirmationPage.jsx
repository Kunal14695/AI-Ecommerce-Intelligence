import React from 'react';
import { CheckCircle2, ArrowRight, Package, MapPin, ShieldCheck, Home } from 'lucide-react';

export default function OrderConfirmationPage({ order, onNavigate }) {
  if (!order) {
    return (
      <div className="container" style={{ paddingTop: '5rem', textAlign: 'center' }}>
        <h2>Order Processed</h2>
        <button onClick={() => onNavigate('home')} className="btn btn-primary" style={{ marginTop: '16px' }}>
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '3rem', maxWidth: '680px' }}>
      <div className="card" style={{ padding: '36px', textAlign: 'center', boxShadow: 'var(--shadow-lg)' }}>
        <div style={{ background: '#ecfdf5', width: '72px', height: '72px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
          <CheckCircle2 size={42} color="#10b981" />
        </div>

        <span className="badge badge-success" style={{ marginBottom: '12px', fontSize: '0.8rem' }}>
          Payment Status: {order.payment_status}
        </span>

        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px' }}>
          Order Confirmed!
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '24px' }}>
          Thank you for your order #{order.id}. A confirmation notice has been generated.
        </p>

        {/* Address Card */}
        {order.address && (
          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'left', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '0.9rem', marginBottom: '6px' }}>
              <MapPin size={16} color="var(--primary)" />
              Delivery Destination ({order.address.label || 'Home'})
            </div>
            <div style={{ fontSize: '0.85rem', color: '#334155', lineHeight: 1.5 }}>
              <strong>{order.address.recipient_name}</strong> ({order.address.phone})<br />
              {order.address.address_line}, {order.address.city}, {order.address.state} - <strong>{order.address.pincode}</strong>
            </div>
          </div>
        )}

        {/* Order Items Summary */}
        <div style={{ textAlign: 'left', marginBottom: '24px' }}>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '10px' }}>
            Ordered Items ({order.items?.length || 0})
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {order.items?.map((it) => (
              <div key={it.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                <span>{it.quantity}x {it.product?.title || 'Product'}</span>
                <span style={{ fontWeight: 700 }}>₹{Math.round(it.total_price).toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 800, marginTop: '12px', paddingTop: '8px', borderTop: '1px solid var(--border)' }}>
            <span>Total Paid (Sandbox)</span>
            <span>₹{Math.round(order.total_amount).toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button onClick={() => onNavigate('orders')} className="btn btn-secondary">
            <Package size={16} /> View All Orders
          </button>
          <button onClick={() => onNavigate('home')} className="btn btn-primary">
            <Home size={16} /> Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}
