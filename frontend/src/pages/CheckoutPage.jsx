import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import DecisionNotice from '../components/DecisionNotice';
import {
  MapPin, Navigation, Home, Briefcase, Gift, Building2,
  CheckCircle, AlertCircle, Loader2, ArrowRight, ShieldCheck, Check
} from 'lucide-react';

export default function CheckoutPage({ onOrderPlaced, onNavigate }) {
  const { user } = useAuth();
  const { cart, clearCart } = useCart();

  // Mode: 'optionA' (Current GPS) vs 'optionB' (Manual / Saved Address)
  const [selectedOption, setSelectedOption] = useState('optionA');

  // Permission & Geolocation state
  const [gpsLoading, setGpsLoading] = useState(false);
  const [permissionState, setPermissionState] = useState('idle'); // idle, prompt, granted, denied, error
  const [gpsError, setGpsError] = useState('');
  const [serviceability, setServiceability] = useState(null);

  // Address form fields (editable for both Option A and B)
  const [addressLine, setAddressLine] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [recipientName, setRecipientName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState('9876543210');
  const [label, setLabel] = useState('Home');
  const [saveToBook, setSaveToBook] = useState(true);

  // Saved addresses list (for Option B)
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedSavedId, setSelectedSavedId] = useState(null);

  // Checkout process state
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [orderError, setOrderError] = useState('');

  // Load saved addresses
  useEffect(() => {
    if (user) {
      api.getAddresses().then((addrs) => {
        setSavedAddresses(addrs);
        if (addrs.length > 0) {
          const defaultAddr = addrs.find((a) => a.is_default) || addrs[0];
          setSelectedSavedId(defaultAddr.id);
        }
      }).catch(console.error);
    }
  }, [user]);

  // Option A: Trigger GPS Geolocation
  const handleUseCurrentLocation = () => {
    setPermissionState('prompt');
    setGpsError('');

    if (!navigator.geolocation) {
      setPermissionState('error');
      setGpsError('Geolocation is not supported by your browser. Please select Option B.');
      setSelectedOption('optionB');
      return;
    }

    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        setPermissionState('granted');
        try {
          const { latitude, longitude } = position.coords;
          // Proxy through backend
          const geoRes = await api.reverseGeocode({ latitude, longitude });

          setAddressLine(geoRes.address_line || 'Current Location Area');
          setCity(geoRes.city || 'Jaipur');
          setState(geoRes.state || 'Rajasthan');
          setPincode(geoRes.pincode || '302022');
          setLabel('Home');

          // Check serviceability
          const servRes = await api.checkServiceability(geoRes.pincode || '302022');
          setServiceability(servRes);
        } catch (err) {
          setGpsError('Could not resolve GPS address. You can complete the form manually.');
          // Jaipur fallback
          setAddressLine('ISI-2, Poornima Marg, RIICO Institutional Area, Sitapura');
          setCity('Jaipur');
          setState('Rajasthan');
          setPincode('302022');
          const servRes = await api.checkServiceability('302022');
          setServiceability(servRes);
        } finally {
          setGpsLoading(false);
        }
      },
      (error) => {
        setGpsLoading(false);
        if (error.code === error.PERMISSION_DENIED) {
          setPermissionState('denied');
          setGpsError('Location permission denied. Switched to Option B (Select Another Location). Your checkout is not blocked.');
          setSelectedOption('optionB');
        } else {
          setPermissionState('error');
          setGpsError('Location timed out or unavailable. Switched to Option B.');
          setSelectedOption('optionB');
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Option B: PIN change triggers live serviceability check
  const handlePincodeChange = async (newPin) => {
    setPincode(newPin);
    if (newPin.length === 6 && /^\d+$/.test(newPin)) {
      try {
        const servRes = await api.checkServiceability(newPin);
        setServiceability(servRes);
        if (servRes.city) setCity(servRes.city);
        if (servRes.state) setState(servRes.state);
      } catch (err) {
        setServiceability({ is_serviceable: false, message: 'Invalid postal area' });
      }
    } else {
      setServiceability(null);
    }
  };

  const handleSelectSavedAddress = (addr) => {
    setSelectedSavedId(addr.id);
    setAddressLine(addr.address_line);
    setLandmark(addr.landmark || '');
    setCity(addr.city);
    setState(addr.state);
    setPincode(addr.pincode);
    setRecipientName(addr.recipient_name);
    setPhone(addr.phone);
    setLabel(addr.label);
    handlePincodeChange(addr.pincode);
  };

  // Confirm order execution
  const handleConfirmOrder = async () => {
    setOrderError('');
    setOrderSubmitting(true);
    try {
      // 1. Create or resolve address ID
      let finalAddressId = selectedSavedId;

      if (!finalAddressId || selectedOption === 'optionA') {
        // Validate fields
        if (!addressLine || !city || !state || !pincode || !recipientName || !phone) {
          throw new Error('Please fill in all required address fields.');
        }
        if (pincode.length !== 6 || !/^\d+$/.test(pincode)) {
          throw new Error('Please enter a valid 6-digit Indian PIN code.');
        }

        const newAddr = await api.createAddress({
          label: label || 'Home',
          recipient_name: recipientName,
          phone: phone,
          address_line: addressLine,
          landmark: landmark || null,
          city: city,
          state: state,
          pincode: pincode,
          source: selectedOption === 'optionA' ? 'gps' : 'manual',
          is_default: saveToBook
        });
        finalAddressId = newAddr.id;
      }

      // 2. Checkout
      const orderRes = await api.checkout({ address_id: finalAddressId });
      clearCart();
      if (onOrderPlaced) onOrderPlaced(orderRes);
    } catch (err) {
      setOrderError(err.message || 'Failed to complete order');
    } finally {
      setOrderSubmitting(false);
    }
  };

  if (cart.items.length === 0) {
    return (
      <div className="container" style={{ paddingTop: '4rem', textAlign: 'center' }}>
        <h2>Your Cart is Empty</h2>
        <p style={{ color: '#64748b', marginTop: '8px', marginBottom: '20px' }}>
          Add products to your cart before proceeding to checkout.
        </p>
        <button onClick={() => onNavigate('products')} className="btn btn-primary">
          Browse Products
        </button>
      </div>
    );
  }

  const deliveryFee = cart.subtotal >= 500 ? 0 : 50;
  const finalTotal = cart.subtotal + deliveryFee;

  return (
    <div className="container" style={{ paddingTop: '2rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Delivery & Checkout</h1>
        <p style={{ fontSize: '0.9rem', color: '#64748b' }}>
          Select your delivery address preference. Both options lead to the same confirmed order screen.
        </p>
      </div>

      {gpsError && (
        <div style={{ background: '#fef2f2', borderLeft: '4px solid #ef4444', padding: '12px 16px', borderRadius: '0 8px 8px 0', display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '1.5rem', fontSize: '0.875rem', color: '#991b1b' }}>
          <AlertCircle size={18} flexShrink={0} />
          <span>{gpsError}</span>
        </div>
      )}

      {orderError && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '12px 16px', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
          {orderError}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 0.9fr', gap: '32px', alignItems: 'start' }}>
        {/* Left Column: Dual Options for Location */}
        <div>
          {/* Option A vs Option B Selection Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
            {/* Option A Card */}
            <div
              onClick={() => {
                setSelectedOption('optionA');
                handleUseCurrentLocation();
              }}
              className={`location-option-card ${selectedOption === 'optionA' ? 'selected' : ''}`}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <div style={{ background: '#e0e7ff', padding: '8px', borderRadius: '8px' }}>
                  <Navigation size={20} color="var(--primary)" />
                </div>
                <div>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>
                    Option A: Use Current Location
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    Instant GPS Detection
                  </span>
                </div>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#475569', lineHeight: 1.4 }}>
                Reverse-geocoded to an editable address via browser Geolocation API. Permission requested once.
              </p>
              {selectedOption === 'optionA' && (
                <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
                  <CheckCircle size={18} color="var(--primary)" />
                </div>
              )}
            </div>

            {/* Option B Card */}
            <div
              onClick={() => setSelectedOption('optionB')}
              className={`location-option-card ${selectedOption === 'optionB' ? 'selected' : ''}`}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <div style={{ background: '#f1f5f9', padding: '8px', borderRadius: '8px' }}>
                  <Building2 size={20} color="#475569" />
                </div>
                <div>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>
                    Option B: Select Another Location
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    Saved or Manual Entry
                  </span>
                </div>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#475569', lineHeight: 1.4 }}>
                Choose saved family, hostel, office, or gift address, or enter any 6-digit postal PIN code.
              </p>
              {selectedOption === 'optionB' && (
                <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
                  <CheckCircle size={18} color="var(--primary)" />
                </div>
              )}
            </div>
          </div>

          {/* Option B Saved Address Quick Selector */}
          {selectedOption === 'optionB' && savedAddresses.length > 0 && (
            <div className="card" style={{ padding: '20px', marginBottom: '20px' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '12px' }}>
                Select From Saved Addresses ({savedAddresses.length})
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                {savedAddresses.map((addr) => (
                  <div
                    key={addr.id}
                    onClick={() => handleSelectSavedAddress(addr)}
                    style={{
                      border: selectedSavedId === addr.id ? '2px solid var(--primary)' : '1px solid var(--border)',
                      padding: '12px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      background: selectedSavedId === addr.id ? 'var(--primary-light)' : 'white'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>
                        {addr.label}
                      </span>
                      {selectedSavedId === addr.id && <Check size={14} color="var(--primary)" />}
                    </div>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{addr.recipient_name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                      {addr.address_line}, {addr.city} - {addr.pincode}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Address Details Form (Editable for BOTH Option A and Option B) */}
          <div className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>
                {selectedOption === 'optionA' ? 'Confirm Detected Address' : 'Delivery Address Details'}
              </h3>
              {gpsLoading && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--primary)' }}>
                  <Loader2 size={16} className="spin" /> Detecting location...
                </div>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  Recipient Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  Mobile Phone Number *
                </label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                Street Address / Flat / Hostel Room *
              </label>
              <input
                type="text"
                required
                value={addressLine}
                onChange={(e) => setAddressLine(e.target.value)}
                placeholder="e.g. Room 204, Campus Hostel B"
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '14px', marginBottom: '14px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  PIN Code (6 digits) *
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => handlePincodeChange(e.target.value)}
                  placeholder="e.g. 302022"
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontFamily: 'JetBrains Mono' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  City *
                </label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  State *
                </label>
                <input
                  type="text"
                  required
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>
            </div>

            {/* Address Label Pills */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                Save As / Tag
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {['Home', 'Parents', 'Office', 'Hostel', 'Gift'].map((lbl) => (
                  <button
                    key={lbl}
                    type="button"
                    onClick={() => setLabel(lbl)}
                    className={`btn btn-sm ${label === lbl ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ fontSize: '0.8rem', padding: '4px 10px' }}
                  >
                    {lbl}
                  </button>
                ))}
              </div>
            </div>

            {/* Serviceability Badge Indicator */}
            {serviceability && (
              <div
                style={{
                  background: serviceability.is_serviceable ? '#ecfdf5' : '#fef2f2',
                  border: `1px solid ${serviceability.is_serviceable ? '#a7f3d0' : '#fecaca'}`,
                  padding: '10px 14px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '0.85rem',
                  color: serviceability.is_serviceable ? '#065f46' : '#991b1b'
                }}
              >
                {serviceability.is_serviceable ? (
                  <CheckCircle size={18} color="#10b981" />
                ) : (
                  <AlertCircle size={18} color="#ef4444" />
                )}
                <span>{serviceability.message}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Order Summary & Sandbox Payment */}
        <div className="card" style={{ padding: '24px', position: 'sticky', top: '92px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px' }}>
            Order Summary ({cart.total_items} items)
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '240px', overflowY: 'auto', marginBottom: '18px', paddingRight: '4px' }}>
            {cart.items.map((item) => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{item.product.title}</div>
                  <span style={{ color: '#64748b' }}>Qty: {item.quantity} × ₹{Math.round(item.product.price).toLocaleString('en-IN')}</span>
                </div>
                <div style={{ fontWeight: 700 }}>
                  ₹{Math.round(item.quantity * item.product.price).toLocaleString('en-IN')}
                </div>
              </div>
            ))}
          </div>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '14px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
              <span>Subtotal</span>
              <span>₹{Math.round(cart.subtotal).toLocaleString('en-IN')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
              <span>Delivery Fee</span>
              <span>{deliveryFee === 0 ? <span style={{ color: '#10b981', fontWeight: 600 }}>FREE</span> : `₹${deliveryFee}`}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', borderTop: '1px solid var(--border)', paddingTop: '10px' }}>
              <span>Total Payable</span>
              <span>₹{Math.round(finalTotal).toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Sandbox Payment Notice */}
          <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', margin: '18px 0', fontSize: '0.78rem', color: '#475569' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
              <ShieldCheck size={16} color="var(--primary)" /> Sandbox Simulation Mode
            </div>
            Payment will automatically be marked as <strong>PAID_SANDBOX</strong>. No real payment or external transaction gateway required.
          </div>

          <button
            onClick={handleConfirmOrder}
            disabled={orderSubmitting || (serviceability && !serviceability.is_serviceable)}
            className="btn btn-primary btn-lg"
            style={{ width: '100%', borderRadius: 'var(--radius-md)' }}
          >
            {orderSubmitting ? (
              <>
                <Loader2 size={18} className="spin" /> Processing Order...
              </>
            ) : (
              <>
                Confirm & Place Order <ArrowRight size={18} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
