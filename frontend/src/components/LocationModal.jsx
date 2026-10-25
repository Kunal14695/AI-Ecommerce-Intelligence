import React, { useState } from 'react';
import { useLocation } from '../context/LocationContext';
import { MapPin, Navigation, X, CheckCircle, AlertCircle } from 'lucide-react';

export default function LocationModal() {
  const { location, isModalOpen, setIsModalOpen, detecting, updatePincode, detectGps } = useLocation();
  const [inputPin, setInputPin] = useState('');
  const [statusMsg, setStatusMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isModalOpen) return null;

  const handleApplyPin = async (e) => {
    e.preventDefault();
    if (!inputPin || inputPin.length !== 6) {
      setStatusMsg({ type: 'error', text: 'Please enter a valid 6-digit PIN code.' });
      return;
    }
    setLoading(true);
    setStatusMsg(null);
    const res = await updatePincode(inputPin);
    setLoading(false);
    if (res.success) {
      if (res.isServiceable) {
        setStatusMsg({ type: 'success', text: `Verified! Serviceable in ${res.area || res.city} (${res.deliveryDays} day delivery)` });
        setTimeout(() => setIsModalOpen(false), 1200);
      } else {
        setStatusMsg({ type: 'warning', text: `PIN ${inputPin} is currently outside our direct express delivery hubs.` });
      }
    } else {
      setStatusMsg({ type: 'error', text: res.message || 'Failed to verify PIN code.' });
    }
  };

  const handleDetectGps = async () => {
    setStatusMsg(null);
    try {
      await detectGps();
      setStatusMsg({ type: 'success', text: 'Location auto-detected successfully via GPS!' });
      setTimeout(() => setIsModalOpen(false), 1200);
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Could not access GPS. Please enter your PIN code manually below.' });
    }
  };

  return (
    <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '440px', padding: '24px', borderRadius: '12px' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MapPin size={20} color="#c45500" /> Choose your location
          </h3>
          <button
            onClick={() => setIsModalOpen(false)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
          >
            <X size={20} />
          </button>
        </div>

        <p style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '16px', lineHeight: 1.5 }}>
          Delivery options and delivery speeds may vary based on your location.
        </p>

        {/* Current active location */}
        <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '18px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Current Delivery Location:
          </span>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
            <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>
              {location.city || 'Jaipur'} — {location.pincode}
            </span>
            <span style={{ fontSize: '0.75rem', color: location.isServiceable ? '#16a34a' : '#dc2626', fontWeight: 700 }}>
              {location.isServiceable ? '● Serviceable' : '● Not Serviceable'}
            </span>
          </div>
        </div>

        {/* Option 1: Auto-detect GPS */}
        <button
          onClick={handleDetectGps}
          disabled={detecting}
          className="btn"
          style={{
            width: '100%',
            background: '#f1f5f9',
            color: '#0f172a',
            border: '1px solid #cbd5e1',
            padding: '12px',
            borderRadius: '8px',
            fontWeight: 700,
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            cursor: 'pointer',
            marginBottom: '16px'
          }}
        >
          <Navigation size={16} color="#0284c7" />
          {detecting ? 'Detecting GPS Coordinates...' : 'Use Current Location (GPS)'}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '14px 0', color: '#94a3b8', fontSize: '0.8rem' }}>
          <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
          <span>or enter a postal PIN code</span>
          <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
        </div>

        {/* Option 2: Enter PIN Code */}
        <form onSubmit={handleApplyPin} style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
          <input
            type="text"
            maxLength={6}
            value={inputPin}
            onChange={(e) => setInputPin(e.target.value.replace(/\D/g, ''))}
            placeholder="e.g. 302022"
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '0.95rem',
              fontWeight: 600,
              letterSpacing: '1px',
              outline: 'none'
            }}
          />
          <button
            type="submit"
            disabled={loading}
            className="btn"
            style={{
              background: '#ffd814',
              borderColor: '#fcd200',
              color: '#0f172a',
              fontWeight: 700,
              padding: '10px 18px',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            {loading ? 'Checking...' : 'Apply'}
          </button>
        </form>

        {statusMsg && (
          <div
            style={{
              padding: '10px 12px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 600,
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: statusMsg.type === 'success' ? '#f0fdf4' : (statusMsg.type === 'warning' ? '#fffbeb' : '#fef2f2'),
              color: statusMsg.type === 'success' ? '#15803d' : (statusMsg.type === 'warning' ? '#b45309' : '#b91c1c'),
              border: `1px solid ${statusMsg.type === 'success' ? '#bbf7d0' : (statusMsg.type === 'warning' ? '#fde68a' : '#fecaca')}`
            }}
          >
            {statusMsg.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            <span>{statusMsg.text}</span>
          </div>
        )}

        {/* Quick Serviceable Hubs */}
        <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
          <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', marginBottom: '6px', fontWeight: 600 }}>
            SAMPLE SERVICEABLE HUBS:
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {[
              { pin: '302022', label: 'Jaipur Sitapura' },
              { pin: '302018', label: 'Malviya Nagar' },
              { pin: '302001', label: 'Jaipur C.P.' },
              { pin: '110001', label: 'Delhi CP' },
              { pin: '400001', label: 'Mumbai GPO' }
            ].map((hub) => (
              <button
                key={hub.pin}
                type="button"
                onClick={() => {
                  setInputPin(hub.pin);
                  updatePincode(hub.pin);
                  setIsModalOpen(false);
                }}
                style={{
                  fontSize: '0.72rem',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  color: '#334155',
                  cursor: 'pointer'
                }}
              >
                {hub.label} ({hub.pin})
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
